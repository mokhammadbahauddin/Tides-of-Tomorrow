export interface CropData {
  year: number;
  taro: number;
  sweetPotato: number;
  cassava: number;
}

export const cropData: CropData[] = [
  { year: 1993, taro: 95, sweetPotato: 90, cassava: 88 },
  { year: 1998, taro: 92, sweetPotato: 89, cassava: 85 },
  { year: 2003, taro: 89, sweetPotato: 88, cassava: 84 },
  { year: 2008, taro: 85, sweetPotato: 86, cassava: 81 },
  { year: 2013, taro: 80, sweetPotato: 84, cassava: 78 },
  { year: 2018, taro: 75, sweetPotato: 81, cassava: 76 },
  { year: 2023, taro: 65, sweetPotato: 75, cassava: 74 }, // Taro collapses the most due to salinity
];
