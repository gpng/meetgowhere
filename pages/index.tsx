import React, { FC, useEffect, useRef, useState } from 'react';
import ReactMapGl, {
  WebMercatorViewport,
  FlyToInterpolator,
  TransitionInterpolator,
  Marker,
  Source,
  Layer,
  LayerProps,
} from 'react-map-gl';
import axios from 'axios';
import { intersect, bbox } from '@turf/turf';
import { Feature, FeatureCollection, MultiPolygon, Point, Polygon } from 'geojson';
import Router from 'next/router';
import DeckGl from '@deck.gl/react';
import { ViewStateProps } from '@deck.gl/core/lib/deck';
import { IconLayer } from '@deck.gl/layers';

import { Box, useBoolean } from '@chakra-ui/react';

import Overlap from 'components/Overlap';
import SearchPanel from 'components/SearchPanel';
import Isochrones from 'components/Isochrones';

import { Postcode, TravelType, TRAVEL_TIMES, DEFAULT_TRAVEL_TIME } from 'models/postcode';
import { Isochrone } from 'models/isochrone';

import { to } from 'utils/index';

import { MAPBOX_TOKEN, OTP_HOST } from 'constants/index';
import { MRT_DATA, STATION_SPRITES_MAPPING } from 'constants/data';

const textLayerStyle: LayerProps = {
  type: 'symbol',
  minzoom: 12,
  layout: {
    'text-field': ['get', 'name'],
    'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
    'text-justify': 'auto',
    'text-size': ['interpolate', ['linear'], ['zoom'], 12, 10, 14, 12],
    'text-ignore-placement': true,
    'text-allow-overlap': true,
  },
  paint: {},
};

interface Viewport {
  width: number;
  height: number;
  latitude: number;
  longitude: number;
  zoom: number;
  transitionDuration?: number;
  transitionInterpolator?: TransitionInterpolator;
}

const sgBbox: [[number, number], [number, number]] = [
  [103.56544388367797, 1.197961725210657],
  [104.10960309887196, 1.4957485068241767],
];

const intialViewport: Viewport = {
  width: 0,
  height: 0,
  latitude: 1.3528246962995887,
  longitude: 103.80871128739545,
  zoom: 9,
};

const Index: FC = () => {
  const [viewport, setViewport] = useState(intialViewport);
  const [postcodes, setPostcodes] = useState<Array<Postcode>>([]);
  const [travelTime, setTravelTime] = useState(DEFAULT_TRAVEL_TIME);
  const [isochrones, setIsochrones] = useState<Array<Isochrone>>([]);
  const [hoveredPostcode, setHoveredPostcode] = useState<string>();
  const [overlap, setOverlap] = useState<Feature<Polygon | MultiPolygon>>();
  const [isLoading, setIsLoading] = useBoolean();

  const cancelInitialPan = useRef(false);

  useEffect(() => {
    setViewport({
      ...intialViewport,
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  const fitMapToBounds = (bounds: [[number, number], [number, number]], padding = 0): void => {
    const { longitude, latitude, zoom } = new WebMercatorViewport({
      ...viewport,
      width: window.innerWidth,
      height: window.innerHeight,
    }).fitBounds(bounds, {
      padding,
    });
    setViewport({
      ...viewport,
      longitude,
      latitude,
      zoom,
      transitionDuration: 200,
      transitionInterpolator: new FlyToInterpolator(),
    });
  };

  const fitMapToPostcodes = (postalCodes: Array<Postcode>): void => {
    const lats = postalCodes.map((postcode) => postcode.lat);
    const lons = postalCodes.map((postcode) => postcode.lon);
    fitMapToBounds(
      [
        [Math.max(...lons), Math.max(...lats)],
        [Math.min(...lons), Math.min(...lats)],
      ],
      window.innerWidth < 600 ? 50 : 200,
    );
  };

  const getDrivingIsochrone = async (
    postcode: Postcode,
    drivingTime: number,
  ): Promise<Isochrone> => {
    const isochrone: Isochrone = {
      postcode,
      geojson: null,
    };
    const [err, res] = await to(
      axios.get(
        `https://api.mapbox.com/isochrone/v1/mapbox/driving/${postcode.lon},${postcode.lat}?`,
        {
          params: {
            contours_minutes: drivingTime,
            polygons: true,
            access_token: MAPBOX_TOKEN,
          },
        },
      ),
    );
    if (err || !res?.data) {
      console.error(err);
      return isochrone;
    }
    isochrone.geojson = res.data as FeatureCollection;
    return isochrone;
  };

  const getTransitIsochrone = async (postcode: Postcode, time: number): Promise<Isochrone> => {
    const isochrone: Isochrone = {
      postcode,
      geojson: null,
    };
    const [err, res] = await to(
      axios.get(`${OTP_HOST}/otp/routers/default/isochrone`, {
        params: {
          mode: 'TRANSIT,WALK',
          time: '10:00am',
          date: '08-16-2021',
          cutoffSec: time * 60,
          fromPlace: `${postcode.lat},${postcode.lon}`,
        },
      }),
    );
    if (err || !res?.data) {
      console.error(err);
      return isochrone;
    }
    isochrone.geojson = res.data as FeatureCollection;
    return isochrone;
  };

  const findIntersections = async (
    time: number,
    postalCodes: Array<Postcode>,
  ): Promise<[number, Array<Isochrone>, Feature<Polygon | MultiPolygon> | null]> => {
    const promises: Array<Promise<Isochrone>> = [];
    let newIsochrones: Array<Isochrone> = [];

    postalCodes.forEach((postcode) => {
      promises.push(
        postcode.type === TravelType.Drive
          ? getDrivingIsochrone(postcode, time)
          : getTransitIsochrone(postcode, time),
      );
    });

    newIsochrones = await Promise.all(promises);

    if (newIsochrones.length > 1) {
      const validGeojsons = newIsochrones.map((x) => x.geojson);
      let intersection = (validGeojsons as Array<FeatureCollection>)[0].features[0] as Feature<
        Polygon | MultiPolygon
      >;
      if (!intersection.geometry) {
        return [time, newIsochrones, null];
      }
      for (let i = 1; i < validGeojsons.length; i += 1) {
        if (!(validGeojsons[i]?.features[0] as Feature<Polygon>)?.geometry) {
          return [time, newIsochrones, null];
        }
        const newIntersection = intersect(
          intersection,
          validGeojsons[i]?.features[0] as Feature<Polygon>,
        );
        if (!newIntersection) {
          return [time, newIsochrones, null];
        }
        intersection = newIntersection;
      }
      return [time, newIsochrones, intersection];
    } else {
      return [time, newIsochrones, null];
    }
  };

  const searchIntersections = async (
    postalCodes: Array<Postcode>,
  ): Promise<[number, Array<Isochrone>, Feature<Polygon | MultiPolygon> | null]> => {
    let smallestIsochrones: Array<Isochrone> = [];
    let smallestIntersection: Feature<Polygon | MultiPolygon> | null = null;
    let maxIndex = TRAVEL_TIMES.length;
    let minIndex = -1;
    while (maxIndex - minIndex > 1) {
      const index = Math.floor(minIndex + (maxIndex - minIndex) / 2);
      const [, newIsochrones, intersection] = await findIntersections(
        TRAVEL_TIMES[index],
        postalCodes,
      );
      if (intersection) {
        smallestIntersection = intersection;
        smallestIsochrones = newIsochrones;
        maxIndex = index;
      } else {
        minIndex = index;
      }
    }

    return [TRAVEL_TIMES[maxIndex], smallestIsochrones, smallestIntersection];
  };

  const calculate = async (time: number, postalCodes: Array<Postcode>): Promise<void> => {
    setIsLoading.on();

    const fn = time <= 0 ? searchIntersections(postalCodes) : findIntersections(time, postalCodes);
    const [intersectionTime, newIsochrones, intersection] = await fn;
    const validIsochrones = newIsochrones.filter(
      (iso) => !iso.geojson?.features.some((feat) => !feat.geometry),
    );
    setIsochrones(validIsochrones);
    if (postalCodes.length > 1) {
      if (intersection) {
        setOverlap(intersection);
        setHoveredPostcode(undefined);
        const bounds = bbox(intersection);
        fitMapToBounds([
          [bounds[0], bounds[1]],
          [bounds[2], bounds[3]],
        ]);
      } else {
        setOverlap(undefined);
        fitMapToPostcodes(postalCodes);
      }
    }
    if (postalCodes.length === 1) {
      setHoveredPostcode(postalCodes[0].code);
      if (validIsochrones?.[0]?.geojson) {
        const bounds = bbox(validIsochrones[0].geojson);
        fitMapToBounds([
          [bounds[0], bounds[1]],
          [bounds[2], bounds[3]],
        ]);
      }
    }
    if (time <= 0) {
      setTravelTime(intersectionTime);
    }
    cancelInitialPan.current = true;
    Router.replace({
      pathname: '/',
      query: {
        travelTime: intersectionTime,
        postalCodes: postalCodes.map((postcode) => `${postcode.code}:${postcode.type}`).join(','),
      },
    });
    setIsLoading.off();
  };

  return (
    <Box w="100vw" h="100vh" overflow="hidden" pos="relative">
      <ReactMapGl
        {...viewport}
        onViewportChange={(nextViewport: Viewport) => setViewport(nextViewport)}
        mapboxApiAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/light-v10"
        onLoad={() => {
          if (!cancelInitialPan.current) {
            fitMapToBounds(sgBbox);
          }
        }}
        onClick={() => {
          if (hoveredPostcode) {
            setHoveredPostcode(undefined);
          }
        }}
      >
        <Isochrones isochrones={isochrones} hoveredPostcode={hoveredPostcode} />
        {overlap && <Overlap geojson={overlap} />}
        <Source type="geojson" data={MRT_DATA}>
          <Layer {...textLayerStyle} />
        </Source>
        <DeckGl
          viewState={viewport as ViewStateProps}
          layers={[
            new IconLayer({
              id: 'station-layer',
              data: MRT_DATA.features,
              iconAtlas: '/stations.png',
              iconMapping: STATION_SPRITES_MAPPING,
              getIcon: (d: Feature) => d?.properties?.station_codes,
              getPosition: (d: Feature) => (d?.geometry as Point).coordinates as [number, number],
              sizeScale: viewport.zoom < 11 ? 0 : viewport.zoom,
              getSize: 1,
              getPixelOffset: [0, -10],
            }),
          ]}
        />
        {postcodes.map((postcode) => (
          <Marker key={postcode.code} longitude={postcode.lon} latitude={postcode.lat}>
            <Box
              bg="#5a3fc0"
              h={4}
              w={4}
              borderRadius="50%"
              transform="translate(-50%, -50%)"
              onClick={() => {
                if (hoveredPostcode === postcode.code) {
                  setHoveredPostcode(undefined);
                  return;
                }
                setHoveredPostcode(postcode.code);
              }}
              cursor="pointer"
            />
          </Marker>
        ))}
      </ReactMapGl>
      <Box zIndex={1} pos="absolute" top={0} left={0} h="full" w="full" pointerEvents="none" p={4}>
        <SearchPanel
          postcodes={postcodes}
          setPostcodes={setPostcodes}
          calculate={calculate}
          isCalculating={isLoading}
          travelTime={travelTime}
          setTravelTime={setTravelTime}
        />
      </Box>
    </Box>
  );
};

export default Index;
