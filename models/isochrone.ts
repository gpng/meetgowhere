import { FeatureCollection } from 'geojson';
import { Postcode } from 'models/postcode';

export interface Isochrone {
  postcode: Postcode;
  geojson: FeatureCollection | null;
}
