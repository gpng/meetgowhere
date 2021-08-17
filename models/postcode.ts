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

export const TRAVEL_TIMES = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90];

export const DEFAULT_TRAVEL_TIME = 30;
