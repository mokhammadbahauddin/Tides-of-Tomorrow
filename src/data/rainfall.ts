export interface RainfallData {
  year: number;
  drought: number;
  normal: number;
  extreme: number;
}

export const rainfallAnnotations = [
  { year: 2016, title: "El Niño Drought", description: "Severe water shortages hit Pacific nations" },
  { year: 2020, title: "Tropical Cyclone Harold", description: "Extreme rainfall destroys infrastructure" }
];
