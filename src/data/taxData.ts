export interface TaxData {
  year: number;
  energy: number;
  transport: number;
  pollution: number;
}

export const taxData: TaxData[] = [
  { year: 1993, energy: 0.8, transport: 0.3, pollution: 0.1 },
  { year: 1998, energy: 1.0, transport: 0.4, pollution: 0.1 },
  { year: 2003, energy: 1.2, transport: 0.4, pollution: 0.2 },
  { year: 2008, energy: 1.5, transport: 0.6, pollution: 0.3 },
  { year: 2013, energy: 2.1, transport: 0.8, pollution: 0.6 },
  { year: 2018, energy: 2.8, transport: 1.1, pollution: 0.9 },
  { year: 2023, energy: 3.5, transport: 1.5, pollution: 1.5 }, // Totaling 6.5% of GDP
];
