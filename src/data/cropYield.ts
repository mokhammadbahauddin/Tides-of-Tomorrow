import * as d3 from 'd3';

export interface CropYieldData {
  year: number;
  taro: number;
  sweetPotato: number;
  banana: number;
  cocoa: number;
}

export const cropColors: Record<string, string> = {
  taro: d3.interpolateMagma(0.4),
  sweetPotato: d3.interpolateMagma(0.6),
  banana: d3.interpolateMagma(0.8),
  cocoa: d3.interpolateMagma(0.95),
};

export const cropLabels: Record<string, string> = {
  taro: "Taro",
  sweetPotato: "Sweet Potato",
  banana: "Banana",
  cocoa: "Cocoa Beans",
};

export interface TaxData {
  year: number;
  yieldIndex: number;
  taxPercent: number;
}

export const taxAnnotations = [
  { year: 2015, line: "yield", text: "Saltwater intrusion impacts coastal taro pits" },
  { year: 2020, line: "tax", text: "Adaptation costs exceed 5% of GDP for vulnerable SIDS" },
];
