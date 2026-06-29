// CTA configuration: country data, datasets, and projection formulas

export const CTA_COUNTRY_DATA = [
  { id: 'USA', name: 'United States', share: 24.5, debt: 2500 }, // debt is kept for legacy property but we'll use 'share' in UI
  { id: 'CHN', name: 'China', share: 14.3, debt: 1400 },
  { id: 'EU', name: 'European Union', share: 17.5, debt: 1700 },
  { id: 'RUS', name: 'Russia', share: 6.8, debt: 680 },
  { id: 'JPN', name: 'Japan', share: 4.0, debt: 400 },
  { id: 'UK', name: 'United Kingdom', share: 4.6, debt: 460 },
  { id: 'IND', name: 'India', share: 3.2, debt: 320 },
  { id: 'AUS', name: 'Australia', share: 1.2, debt: 120 },
  { id: 'CAN', name: 'Canada', share: 2.0, debt: 200 },
  { id: 'IDN', name: 'Indonesia', share: 0.5, debt: 50 },
  { id: 'OTHER', name: 'Other / Global Average', share: 21.4, debt: 100 },
];

export const CTA_DATASETS = [
  { label: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub / NOAA ERSST: Sea Surface Temperature', url: 'https://climatedataguide.ucar.edu/climate-data/global-surface-temperature-data-sets-overview' },
  { label: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub / NASA PO.DAAC: Sea Level Anomalies', url: 'https://sealevel.nasa.gov/data/dataset/?id=SLR_anom_OSTM' },
  { label: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub / NOAA PSL: GPCP Precipitation Anomalies', url: 'https://psl.noaa.gov/data/gridded/data.gpcp.html' },
  { label: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub / FAOSTAT: Agricultural Production', url: 'https://www.fao.org/faostat/en/#data/QCL' },
  { label: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub / OECD.stat: Environmental Tax Revenues', url: 'https://stats.oecd.org/Index.aspx?DataSetCode=ENV_TAX' },
  { label: 'Unofficial Dataset / Global Carbon Project (GCP): Cumulative Historical Emissions', url: 'https://www.globalcarbonproject.org/carbonbudget/' },
  { label: 'Unofficial Dataset / WRI Climate Watch: GHG Emissions Dataset', url: 'https://www.climatewatchdata.org/ghg-emissions' },
];

export function calcTemp2050(targetTemp: number): number {
  return targetTemp;
}

export function calcSea2050(targetTemp: number): number {
  // Rough interpolation based on IPCC AR6 target temperatures vs 2050 sea level rise
  // 1.5C -> ~200mm, 2.7C -> ~260mm, 4.0C -> ~320mm
  const baseTemp = 1.5;
  const baseSea = 200;
  const slope = (320 - 200) / (4.0 - 1.5);
  return baseSea + (targetTemp - baseTemp) * slope;
}

export function calcMiniChartCurve(targetTemp: number, t: number): number {
  // Normalize targetTemp (1.5 to 4.0) to a 0-1 scale to mimic the old pledge behavior (1.5 is best, 4.0 is worst)
  const p = 1.0 - ((targetTemp - 1.5) / 2.5); // 1.5 -> p=1.0 (good), 4.0 -> p=0.0 (bad)
  return 0.95 + (1.65 - 1.3 * p) * t - (0.25 * p) * t * t;
}
