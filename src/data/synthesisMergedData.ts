export interface SynthesisMergedRecord {
  year: number;
  temperature: number; // Anomaly °C
  sealevel: number; // mm
  rainfall: number; // Anomaly %
  taro: number; // Yield t/ha (or index)
  tax: number; // % GDP
  isProjection: boolean;
}

export const synthesisMergedData: SynthesisMergedRecord[] = [
  // Historical
  { year: 1993, temperature: 0.2, sealevel: 10, rainfall: -2, taro: 16, tax: 0.8, isProjection: false },
  { year: 1998, temperature: 0.4, sealevel: 25, rainfall: -5, taro: 15, tax: 1.0, isProjection: false },
  { year: 2003, temperature: 0.6, sealevel: 45, rainfall: -8, taro: 13, tax: 1.2, isProjection: false },
  { year: 2008, temperature: 0.7, sealevel: 60, rainfall: -12, taro: 10, tax: 1.5, isProjection: false },
  { year: 2013, temperature: 0.9, sealevel: 90, rainfall: -15, taro: 7, tax: 2.1, isProjection: false },
  { year: 2018, temperature: 1.1, sealevel: 115, rainfall: -18, taro: 4, tax: 3.5, isProjection: false },
  { year: 2023, temperature: 1.3, sealevel: 150, rainfall: -22, taro: 2, tax: 6.5, isProjection: false },
  
  // Projected
  { year: 2030, temperature: 1.6, sealevel: 210, rainfall: -30, taro: 1.2, tax: 8.5, isProjection: true },
  { year: 2035, temperature: 1.9, sealevel: 280, rainfall: -40, taro: 0.8, tax: 11.0, isProjection: true },
  { year: 2040, temperature: 2.2, sealevel: 360, rainfall: -50, taro: 0.4, tax: 14.5, isProjection: true },
  { year: 2045, temperature: 2.6, sealevel: 450, rainfall: -60, taro: 0.1, tax: 18.0, isProjection: true },
  { year: 2050, temperature: 3.0, sealevel: 560, rainfall: -75, taro: 0.0, tax: 22.0, isProjection: true },
];
