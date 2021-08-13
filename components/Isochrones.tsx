import React, { FC } from 'react';
import { LayerProps, Source, Layer } from 'react-map-gl';

import { Isochrone } from 'models/isochrone';

const layerStyle = (id: string, hovered: boolean): LayerProps => ({
  id,
  type: 'fill',
  // Use "iso" as the data source for this layer
  source: 'iso',
  layout: {},
  paint: {
    // The fill color for the layer is set to a light purple
    'fill-color': '#5a3fc0',
    'fill-opacity': hovered ? 0.5 : 0.1,
  },
});

interface Props {
  isochrones: Array<Isochrone>;
  hoveredPostcode?: string;
}

const Isochrones: FC<Props> = ({ isochrones, hoveredPostcode = null }) => {
  return (
    <>
      {isochrones.map((isochrone, i) =>
        isochrone.geojson ? (
          <Source key={i} id={`isochrone-source-${i}`} type="geojson" data={isochrone.geojson}>
            <Layer
              {...layerStyle(`isochrone-layer-${i}`, hoveredPostcode === isochrone.postcode.code)}
            />
          </Source>
        ) : null,
      )}
    </>
  );
};

export default React.memo(Isochrones);
