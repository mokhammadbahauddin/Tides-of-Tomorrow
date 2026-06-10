export interface SynthesisData {
  year: number;
  seaLevelRise: number; // in mm
  taxBurden: number; // % of GDP
  taroYield: number; // relative to 1990 (%)
  isProjection: boolean;
}

export const synthesisData: SynthesisData[] = [
  // Historical
  { year: 1993, seaLevelRise: 10, taxBurden: 0.8, taroYield: 95, isProjection: false },
  { year: 1998, seaLevelRise: 25, taxBurden: 1.0, taroYield: 92, isProjection: false },
  { year: 2003, seaLevelRise: 45, taxBurden: 1.2, taroYield: 89, isProjection: false },
  { year: 2008, seaLevelRise: 60, taxBurden: 1.5, taroYield: 85, isProjection: false },
  { year: 2013, seaLevelRise: 90, taxBurden: 2.1, taroYield: 80, isProjection: false },
  { year: 2018, seaLevelRise: 115, taxBurden: 2.8, taroYield: 75, isProjection: false },
  { year: 2023, seaLevelRise: 150, taxBurden: 3.5, taroYield: 65, isProjection: false },
  
  // Projected
  { year: 2030, seaLevelRise: 210, taxBurden: 5.2, taroYield: 50, isProjection: true },
  { year: 2035, seaLevelRise: 280, taxBurden: 7.0, taroYield: 38, isProjection: true },
  { year: 2040, seaLevelRise: 360, taxBurden: 9.5, taroYield: 25, isProjection: true },
  { year: 2045, seaLevelRise: 450, taxBurden: 12.8, taroYield: 15, isProjection: true },
  { year: 2050, seaLevelRise: 560, taxBurden: 18.0, taroYield: 5, isProjection: true }, // The breaking point
];
