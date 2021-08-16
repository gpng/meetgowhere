export enum TravelType {
  Transit = 'PT',
  Drive = 'CAR',
}

export interface Postcode {
  code: string;
  lat: number;
  lon: number;
  type: TravelType;
}
