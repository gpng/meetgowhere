import React, { FC } from 'react';
import { LayerProps, Source, Layer } from 'react-map-gl';

import { Feature, MultiPolygon, Polygon } from 'geojson';

const layerStyle = (): LayerProps => ({
  id: 'overlap-layer',
  type: 'fill',
  // Use "iso" as the data source for this layer
  source: 'iso',
  layout: {},
  paint: {
    // The fill color for the layer is set to a light purple
    'fill-color': '#00ff00',
    'fill-opacity': 0.5,
  },
});

interface Props {
  geojson: Feature<Polygon | MultiPolygon>;
}

const Overlap: FC<Props> = ({ geojson }) => {
  return (
    <Source id={`overlap-source`} type="geojson" data={geojson}>
      <Layer {...layerStyle()} />
    </Source>
  );
};

export default React.memo(Overlap);
