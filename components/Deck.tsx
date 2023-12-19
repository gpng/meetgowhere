import { IconLayer } from '@deck.gl/layers/typed';
import { MapboxOverlay, MapboxOverlayProps } from '@deck.gl/mapbox/typed';
import { Feature, Point } from '@turf/turf';
import { MRT_DATA, STATION_SPRITES_MAPPING } from 'constants/data';
import { useControl } from 'react-map-gl';

const DeckMapboxOverlay = (props: MapboxOverlayProps) => {
  const overlay = useControl(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
};

interface Props {
  zoom: number;
}

const Deck = ({ zoom }: Props) => (
  <DeckMapboxOverlay
    layers={[
      new IconLayer({
        id: 'station-layer',
        data: MRT_DATA.features,
        iconAtlas: '/stations.png',
        iconMapping: STATION_SPRITES_MAPPING,
        getIcon: (d: Feature) => d?.properties?.station_codes,
        getPosition: (d: Feature) => (d?.geometry as Point).coordinates as [number, number],
        sizeScale: zoom < 11 ? 0 : zoom,
        getSize: 1,
        getPixelOffset: [0, -10],
      }),
    ]}
  />
);

export default Deck;
