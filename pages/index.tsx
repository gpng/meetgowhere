import React, { FC, useEffect, useState } from 'react';
import ReactMapGl, {
  WebMercatorViewport,
  FlyToInterpolator,
  TransitionInterpolator,
  Marker,
} from 'react-map-gl';
import axios from 'axios';
import { intersect } from '@turf/turf';
import { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import Router from 'next/router';

import { Box, useBoolean } from '@chakra-ui/react';

import Overlap from 'components/Overlap';
import SearchPanel from 'components/SearchPanel';
import Isochrones from 'components/Isochrones';

import { Postcode } from 'models/postcode';
import { Isochrone } from 'models/isochrone';

import { to } from 'utils';

import { MAPBOX_TOKEN } from 'constants/index';

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
  const [isochrones, setIsochrones] = useState<Array<Isochrone>>([]);
  const [hoveredPostcode, setHoveredPostcode] = useState<string>();
  const [overlap, setOverlap] = useState<Feature<Polygon | MultiPolygon>>();
  const [isLoading, setIsLoading] = useBoolean();

  useEffect(() => {
    setViewport({
      ...intialViewport,
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  const fitMapToBounds = (bounds: [[number, number], [number, number]]): void => {
    const { longitude, latitude, zoom } = new WebMercatorViewport({
      ...viewport,
      width: window.innerWidth,
      height: window.innerHeight,
    }).fitBounds(bounds);
    setViewport({
      ...viewport,
      longitude,
      latitude,
      zoom,
      transitionDuration: 500,
      transitionInterpolator: new FlyToInterpolator(),
    });
  };

  const getIsochrone = async (postcode: Postcode, drivingTime: number): Promise<Isochrone> => {
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

  const calculate = async (drivingTime: number, postalCodes: Array<Postcode>): Promise<void> => {
    setIsLoading.on();
    const promises: Array<Promise<Isochrone>> = [];

    postalCodes.forEach((x) => {
      promises.push(getIsochrone(x, drivingTime));
    });

    const res = await Promise.all(promises);
    setIsochrones(res);

    Router.replace({
      pathname: '/',
      query: {
        drivingTime,
        postalCodes: postalCodes.map((postcode) => postcode.code).join(','),
      },
    });

    const validGeojsons = res.filter((x) => x.geojson).map((x) => x.geojson);
    let intersection = (validGeojsons as Array<FeatureCollection>)[0].features[0] as Feature<
      Polygon | MultiPolygon
    >;
    for (let i = 1; i < validGeojsons.length; i += 1) {
      const newIntersection = intersect(
        intersection,
        validGeojsons[i]?.features[0] as Feature<Polygon>,
      );
      if (!newIntersection) {
        console.log('no intersection');
        setOverlap(undefined);
        setIsLoading.off();
        return;
      }
      intersection = newIntersection;
    }
    setOverlap(intersection);
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
          fitMapToBounds(sgBbox);
        }}
        onClick={() => {
          if (hoveredPostcode) {
            setHoveredPostcode(undefined);
          }
        }}
      >
        <Isochrones isochrones={isochrones} hoveredPostcode={hoveredPostcode} />
        {overlap && <Overlap geojson={overlap} />}
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
        />
      </Box>
    </Box>
  );
};

export default Index;
