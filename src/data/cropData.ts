export interface CropData {
  year: number;
  taro: number;
  sweetPotato: number;
  banana: number;
  cocoa: number;
}

export const cropData: CropData[] = [
  { year: 1993, taro: 16, sweetPotato: 14, banana: 12, cocoa: 8 },
  { year: 1998, taro: 15, sweetPotato: 14, banana: 12, cocoa: 8 },
  { year: 2003, taro: 13, sweetPotato: 13, banana: 11, cocoa: 7 },
  { year: 2008, taro: 10, sweetPotato: 12, banana: 11, cocoa: 7 },
  { year: 2013, taro: 7, sweetPotato: 11, banana: 10, cocoa: 6 },
  { year: 2018, taro: 4, sweetPotato: 10, banana: 10, cocoa: 6 },
  { year: 2023, taro: 2, sweetPotato: 9, banana: 9, cocoa: 5 }, // Taro collapses the most due to salinity
];
