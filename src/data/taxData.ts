export interface TaxRecord {
  year: number;
  yieldIndex: number; // Taro yield in t/ha
  taxPercent: number; // Total Environmental Tax % of GDP
}

export const taxData: TaxRecord[] = [
  { year: 1993, yieldIndex: 16, taxPercent: 0.8 },
  { year: 1998, yieldIndex: 15, taxPercent: 1.0 },
  { year: 2003, yieldIndex: 13, taxPercent: 1.2 },
  { year: 2008, yieldIndex: 10, taxPercent: 1.5 },
  { year: 2013, yieldIndex: 7, taxPercent: 2.1 },
  { year: 2018, yieldIndex: 4, taxPercent: 3.5 },
  { year: 2023, yieldIndex: 2, taxPercent: 6.5 },
];
