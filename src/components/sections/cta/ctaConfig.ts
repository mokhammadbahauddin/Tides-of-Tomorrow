// CTA configuration: country data, datasets, and projection formulas

export const CTA_COUNTRY_DATA = [
  { id: 'USA', name: 'United States', share: 24.5, debt: 2500 },
  { id: 'CHN', name: 'China', share: 14.3, debt: 1400 },
  { id: 'EU', name: 'European Union', share: 17.5, debt: 1700 },
  { id: 'RUS', name: 'Russia', share: 6.8, debt: 680 },
  { id: 'JPN', name: 'Japan', share: 4.0, debt: 400 },
  { id: 'UK', name: 'United Kingdom', share: 4.6, debt: 460 },
  { id: 'IND', name: 'India', share: 3.2, debt: 320 },
  { id: 'AUS', name: 'Australia', share: 1.2, debt: 120 },
  { id: 'CAN', name: 'Canada', share: 2.0, debt: 200 },
  { id: 'IDN', name: 'Indonesia', share: 0.5, debt: 50 },
  { id: 'OTHER', name: 'Other / Global Average', share: 1.0, debt: 100 },
];

export const CTA_DATASETS = [
  { label: 'NOAA ERSST: Sea Surface Temperature', url: 'https://climatedataguide.ucar.edu/climate-data/global-surface-temperature-data-sets-overview' },
  { label: 'NASA PO.DAAC: Sea Level Anomalies', url: 'https://sealevel.nasa.gov/data/dataset/?id=SLR_anom_OSTM' },
  { label: 'NOAA PSL: GPCP Precipitation Anomalies', url: 'https://psl.noaa.gov/data/gridded/data.gpcp.html' },
  { label: 'FAOSTAT: Agricultural Production', url: 'https://www.fao.org/faostat/en/#data/QCL' },
  { label: 'OECD.stat: Environmental Tax Revenues', url: 'https://stats.oecd.org/Index.aspx?DataSetCode=ENV_TAX' },
];

export function calcTemp2050(pledge: number): number {
  return 2.6 - 1.55 * (pledge / 100);
}

export function calcSea2050(pledge: number): number {
  return 290 - 150 * (pledge / 100);
}

export function calcMiniChartCurve(pledge: number, t: number): number {
  const p = pledge / 100;
  return 0.95 + (1.65 - 1.3 * p) * t - (0.25 * p) * t * t;
}
