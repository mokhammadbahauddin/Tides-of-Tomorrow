export interface StationInfo {
  stationName: string;
  dataSource: string;
  country: string;
}

export const COUNTRY_STATIONS: Record<string, {
  temperature: StationInfo;
  seaLevel: StationInfo;
  rainfall: StationInfo;
  cropYield: StationInfo;
  tax: StationInfo;
}> = {
  'regional-average': {
    temperature: { stationName: 'Fiji Basin', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / NOAA ERSST: Sea Surface Temperature', country: 'Regional Average' },
    seaLevel: { stationName: 'Funafuti Atoll', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / NASA PO.DAAC: Sea Level Anomalies', country: 'Regional Average' },
    rainfall: { stationName: 'Vila Harbour', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / NOAA PSL: GPCP Precipitation Anomalies', country: 'Regional Average' },
    cropYield: { stationName: 'Solomon Islands', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / FAOSTAT: Agricultural Production', country: 'Regional Average' },
    tax: { stationName: 'Suva Peninsula', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / OECD.stat: Environmental Tax Revenues', country: 'Regional Average' },
  },
  'FJI': {
    temperature: { stationName: 'Suva Ocean Station', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / NOAA ERSST: Sea Surface Temperature', country: 'Fiji' },
    seaLevel: { stationName: 'Lautoka Tide Gauge', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / NASA PO.DAAC: Sea Level Anomalies', country: 'Fiji' },
    rainfall: { stationName: 'Nadi Met Station', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / NOAA PSL: GPCP Precipitation Anomalies', country: 'Fiji' },
    cropYield: { stationName: 'Viti Levu Highlands', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / FAOSTAT: Agricultural Production', country: 'Fiji' },
    tax: { stationName: 'Suva', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / OECD.stat: Environmental Tax Revenues', country: 'Fiji' },
  },
  'TUV': {
    temperature: { stationName: 'Funafuti Ocean', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / NOAA ERSST: Sea Surface Temperature', country: 'Tuvalu' },
    seaLevel: { stationName: 'Funafuti Tide Gauge', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / NASA PO.DAAC: Sea Level Anomalies', country: 'Tuvalu' },
    rainfall: { stationName: 'Funafuti Station', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / NOAA PSL: GPCP Precipitation Anomalies', country: 'Tuvalu' },
    cropYield: { stationName: 'Funafuti Atoll', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / FAOSTAT: Agricultural Production', country: 'Tuvalu' },
    tax: { stationName: 'Funafuti', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / OECD.stat: Environmental Tax Revenues', country: 'Tuvalu' },
  },
  'VUT': {
    temperature: { stationName: 'Port Vila Ocean', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / NOAA ERSST: Sea Surface Temperature', country: 'Vanuatu' },
    seaLevel: { stationName: 'Port Vila Tide Gauge', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / NASA PO.DAAC: Sea Level Anomalies', country: 'Vanuatu' },
    rainfall: { stationName: 'Bauerfield Station', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / NOAA PSL: GPCP Precipitation Anomalies', country: 'Vanuatu' },
    cropYield: { stationName: 'Efate & Santo', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / FAOSTAT: Agricultural Production', country: 'Vanuatu' },
    tax: { stationName: 'Port Vila', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / OECD.stat: Environmental Tax Revenues', country: 'Vanuatu' },
  },
  'WSM': {
    temperature: { stationName: 'Apia Ocean Station', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / NOAA ERSST: Sea Surface Temperature', country: 'Samoa' },
    seaLevel: { stationName: 'Apia Tide Gauge', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / NASA PO.DAAC: Sea Level Anomalies', country: 'Samoa' },
    rainfall: { stationName: 'Fagalii Station', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / NOAA PSL: GPCP Precipitation Anomalies', country: 'Samoa' },
    cropYield: { stationName: 'Upolu & Savaii', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / FAOSTAT: Agricultural Production', country: 'Samoa' },
    tax: { stationName: 'Apia', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / OECD.stat: Environmental Tax Revenues', country: 'Samoa' },
  },
  'TON': {
    temperature: { stationName: 'Tongatapu Ocean', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / NOAA ERSST: Sea Surface Temperature', country: 'Tonga' },
    seaLevel: { stationName: 'Nukualofa Tide Gauge', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / NASA PO.DAAC: Sea Level Anomalies', country: 'Tonga' },
    rainfall: { stationName: "Fua'amotu Station", dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / NOAA PSL: GPCP Precipitation Anomalies', country: 'Tonga' },
    cropYield: { stationName: "Ha'apai Group", dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / FAOSTAT: Agricultural Production', country: 'Tonga' },
    tax: { stationName: "Nuku'alofa", dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / OECD.stat: Environmental Tax Revenues', country: 'Tonga' },
  },
  'KIR': {
    temperature: { stationName: 'Tarawa Ocean', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / NOAA ERSST: Sea Surface Temperature', country: 'Kiribati' },
    seaLevel: { stationName: 'Betio Tide Gauge', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / NASA PO.DAAC: Sea Level Anomalies', country: 'Kiribati' },
    rainfall: { stationName: 'Tarawa Station', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / NOAA PSL: GPCP Precipitation Anomalies', country: 'Kiribati' },
    cropYield: { stationName: 'South Tarawa', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / FAOSTAT: Agricultural Production', country: 'Kiribati' },
    tax: { stationName: 'South Tarawa', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / OECD.stat: Environmental Tax Revenues', country: 'Kiribati' },
  },
  'SLB': {
    temperature: { stationName: 'Honiara Ocean', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / NOAA ERSST: Sea Surface Temperature', country: 'Solomon Islands' },
    seaLevel: { stationName: 'Honiara Tide Gauge', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / NASA PO.DAAC: Sea Level Anomalies', country: 'Solomon Islands' },
    rainfall: { stationName: 'Henderson Station', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / NOAA PSL: GPCP Precipitation Anomalies', country: 'Solomon Islands' },
    cropYield: { stationName: 'Malaita Province', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / FAOSTAT: Agricultural Production', country: 'Solomon Islands' },
    tax: { stationName: 'Honiara', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / OECD.stat: Environmental Tax Revenues', country: 'Solomon Islands' },
  },
  'PNG': {
    temperature: { stationName: 'Port Moresby Ocean', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / NOAA ERSST: Sea Surface Temperature', country: 'Papua New Guinea' },
    seaLevel: { stationName: 'Manus Island Gauge', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / NASA PO.DAAC: Sea Level Anomalies', country: 'Papua New Guinea' },
    rainfall: { stationName: 'Jacksons Station', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / NOAA PSL: GPCP Precipitation Anomalies', country: 'Papua New Guinea' },
    cropYield: { stationName: 'Highlands Region', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / FAOSTAT: Agricultural Production', country: 'Papua New Guinea' },
    tax: { stationName: 'Port Moresby', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / OECD.stat: Environmental Tax Revenues', country: 'Papua New Guinea' },
  },
  'PLW': {
    temperature: { stationName: 'Koror Ocean', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / NOAA ERSST: Sea Surface Temperature', country: 'Palau' },
    seaLevel: { stationName: 'Malakal Tide Gauge', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / NASA PO.DAAC: Sea Level Anomalies', country: 'Palau' },
    rainfall: { stationName: 'Koror Station', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / NOAA PSL: GPCP Precipitation Anomalies', country: 'Palau' },
    cropYield: { stationName: 'Babeldaob Island', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / FAOSTAT: Agricultural Production', country: 'Palau' },
    tax: { stationName: 'Ngerulmud', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / OECD.stat: Environmental Tax Revenues', country: 'Palau' },
  },
  'MHL': {
    temperature: { stationName: 'Majuro Ocean', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / NOAA ERSST: Sea Surface Temperature', country: 'Marshall Islands' },
    seaLevel: { stationName: 'Majuro Tide Gauge', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / NASA PO.DAAC: Sea Level Anomalies', country: 'Marshall Islands' },
    rainfall: { stationName: 'Majuro Intl Station', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / NOAA PSL: GPCP Precipitation Anomalies', country: 'Marshall Islands' },
    cropYield: { stationName: 'Majuro Atoll', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / FAOSTAT: Agricultural Production', country: 'Marshall Islands' },
    tax: { stationName: 'Majuro', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / OECD.stat: Environmental Tax Revenues', country: 'Marshall Islands' },
  },
  'FSM': {
    temperature: { stationName: 'Pohnpei Ocean', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / NOAA ERSST: Sea Surface Temperature', country: 'Micronesia' },
    seaLevel: { stationName: 'Pohnpei Tide Gauge', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / NASA PO.DAAC: Sea Level Anomalies', country: 'Micronesia' },
    rainfall: { stationName: 'Pohnpei Station', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / NOAA PSL: GPCP Precipitation Anomalies', country: 'Micronesia' },
    cropYield: { stationName: 'Pohnpei & Chuuk', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / FAOSTAT: Agricultural Production', country: 'Micronesia' },
    tax: { stationName: 'Palikir', dataSource: 'Pacific Dataviz Challenge (Official Dataset) / Pacific Data Hub (PDH) / OECD.stat: Environmental Tax Revenues', country: 'Micronesia' },
  },
};

export function getStation(countryId: string | undefined, type: keyof typeof COUNTRY_STATIONS['regional-average']): StationInfo {
  const id = countryId || 'regional-average';
  const config = COUNTRY_STATIONS[id] || COUNTRY_STATIONS['regional-average'];
  return config[type];
}
