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
    temperature: { stationName: 'Fiji Basin', dataSource: 'Pacific Data Hub (PDH) / NOAA OISST V2.1', country: 'Regional Average' },
    seaLevel: { stationName: 'Funafuti Atoll', dataSource: 'Pacific Data Hub (PDH) / NOAA Satellite Altimetry', country: 'Regional Average' },
    rainfall: { stationName: 'Vila Harbour', dataSource: 'Pacific Data Hub (PDH) / GPCP Precipitation', country: 'Regional Average' },
    cropYield: { stationName: 'Solomon Islands', dataSource: 'Pacific Data Hub (PDH) / FAO Crop Production', country: 'Regional Average' },
    tax: { stationName: 'Suva Peninsula', dataSource: 'Pacific Data Hub (PDH) / OECD/UNEP Tax Revenue', country: 'Regional Average' },
  },
  'FJI': {
    temperature: { stationName: 'Suva Ocean Station', dataSource: 'Pacific Data Hub (PDH) / NOAA OISST V2.1', country: 'Fiji' },
    seaLevel: { stationName: 'Lautoka Tide Gauge', dataSource: 'Pacific Data Hub (PDH) / PSMSL/IOC Sea Level', country: 'Fiji' },
    rainfall: { stationName: 'Nadi Met Station', dataSource: 'Pacific Data Hub (PDH) / FMS/GPCP Precipitation', country: 'Fiji' },
    cropYield: { stationName: 'Viti Levu Highlands', dataSource: 'Pacific Data Hub (PDH) / FAO Fiji Crop Data', country: 'Fiji' },
    tax: { stationName: 'Suva', dataSource: 'Pacific Data Hub (PDH) / OECD Revenue Statistics', country: 'Fiji' },
  },
  'TUV': {
    temperature: { stationName: 'Funafuti Ocean', dataSource: 'Pacific Data Hub (PDH) / NOAA OISST V2.1', country: 'Tuvalu' },
    seaLevel: { stationName: 'Funafuti Tide Gauge', dataSource: 'Pacific Data Hub (PDH) / PSMSL/IOC Sea Level', country: 'Tuvalu' },
    rainfall: { stationName: 'Funafuti Station', dataSource: 'Pacific Data Hub (PDH) / GPCP Precipitation', country: 'Tuvalu' },
    cropYield: { stationName: 'Funafuti Atoll', dataSource: 'Pacific Data Hub (PDH) / SPC/FAO Tuvalu Crop Data', country: 'Tuvalu' },
    tax: { stationName: 'Funafuti', dataSource: 'Pacific Data Hub (PDH) / PFTAC Revenue Stats', country: 'Tuvalu' },
  },
  'VUT': {
    temperature: { stationName: 'Port Vila Ocean', dataSource: 'Pacific Data Hub (PDH) / NOAA OISST V2.1', country: 'Vanuatu' },
    seaLevel: { stationName: 'Port Vila Tide Gauge', dataSource: 'Pacific Data Hub (PDH) / PSMSL/IOC Sea Level', country: 'Vanuatu' },
    rainfall: { stationName: 'Bauerfield Station', dataSource: 'Pacific Data Hub (PDH) / VNMS/GPCP Precipitation', country: 'Vanuatu' },
    cropYield: { stationName: 'Efate & Santo', dataSource: 'Pacific Data Hub (PDH) / FAO Vanuatu Crop Data', country: 'Vanuatu' },
    tax: { stationName: 'Port Vila', dataSource: 'Pacific Data Hub (PDH) / OECD Revenue Statistics', country: 'Vanuatu' },
  },
  'WSM': {
    temperature: { stationName: 'Apia Ocean Station', dataSource: 'Pacific Data Hub (PDH) / NOAA OISST V2.1', country: 'Samoa' },
    seaLevel: { stationName: 'Apia Tide Gauge', dataSource: 'Pacific Data Hub (PDH) / PSMSL/IOC Sea Level', country: 'Samoa' },
    rainfall: { stationName: 'Fagalii Station', dataSource: 'Pacific Data Hub (PDH) / SMS/GPCP Precipitation', country: 'Samoa' },
    cropYield: { stationName: 'Upolu & Savaii', dataSource: 'Pacific Data Hub (PDH) / FAO Samoa Crop Data', country: 'Samoa' },
    tax: { stationName: 'Apia', dataSource: 'Pacific Data Hub (PDH) / PFTAC Revenue Stats', country: 'Samoa' },
  },
  'TON': {
    temperature: { stationName: 'Tongatapu Ocean', dataSource: 'Pacific Data Hub (PDH) / NOAA OISST V2.1', country: 'Tonga' },
    seaLevel: { stationName: 'Nukualofa Tide Gauge', dataSource: 'Pacific Data Hub (PDH) / PSMSL/IOC Sea Level', country: 'Tonga' },
    rainfall: { stationName: "Fua'amotu Station", dataSource: 'Pacific Data Hub (PDH) / TMS/GPCP Precipitation', country: 'Tonga' },
    cropYield: { stationName: "Ha'apai Group", dataSource: 'Pacific Data Hub (PDH) / FAO Tonga Crop Data', country: 'Tonga' },
    tax: { stationName: "Nuku'alofa", dataSource: 'Pacific Data Hub (PDH) / PFTAC Revenue Stats', country: 'Tonga' },
  },
  'KIR': {
    temperature: { stationName: 'Tarawa Ocean', dataSource: 'Pacific Data Hub (PDH) / NOAA OISST V2.1', country: 'Kiribati' },
    seaLevel: { stationName: 'Betio Tide Gauge', dataSource: 'Pacific Data Hub (PDH) / PSMSL/IOC Sea Level', country: 'Kiribati' },
    rainfall: { stationName: 'Tarawa Station', dataSource: 'Pacific Data Hub (PDH) / KMS/GPCP Precipitation', country: 'Kiribati' },
    cropYield: { stationName: 'South Tarawa', dataSource: 'Pacific Data Hub (PDH) / FAO Kiribati Crop Data', country: 'Kiribati' },
    tax: { stationName: 'South Tarawa', dataSource: 'Pacific Data Hub (PDH) / PFTAC Revenue Stats', country: 'Kiribati' },
  },
  'SLB': {
    temperature: { stationName: 'Honiara Ocean', dataSource: 'Pacific Data Hub (PDH) / NOAA OISST V2.1', country: 'Solomon Islands' },
    seaLevel: { stationName: 'Honiara Tide Gauge', dataSource: 'Pacific Data Hub (PDH) / PSMSL/IOC Sea Level', country: 'Solomon Islands' },
    rainfall: { stationName: 'Henderson Station', dataSource: 'Pacific Data Hub (PDH) / SIMS/GPCP Precipitation', country: 'Solomon Islands' },
    cropYield: { stationName: 'Malaita Province', dataSource: 'Pacific Data Hub (PDH) / FAO Solomon Is. Crop Data', country: 'Solomon Islands' },
    tax: { stationName: 'Honiara', dataSource: 'Pacific Data Hub (PDH) / PFTAC Revenue Stats', country: 'Solomon Islands' },
  },
  'PNG': {
    temperature: { stationName: 'Port Moresby Ocean', dataSource: 'Pacific Data Hub (PDH) / NOAA OISST V2.1', country: 'Papua New Guinea' },
    seaLevel: { stationName: 'Manus Island Gauge', dataSource: 'Pacific Data Hub (PDH) / PSMSL/IOC Sea Level', country: 'Papua New Guinea' },
    rainfall: { stationName: 'Jacksons Station', dataSource: 'Pacific Data Hub (PDH) / PNG-NWS/GPCP Precipitation', country: 'Papua New Guinea' },
    cropYield: { stationName: 'Highlands Region', dataSource: 'Pacific Data Hub (PDH) / FAO PNG Crop Data', country: 'Papua New Guinea' },
    tax: { stationName: 'Port Moresby', dataSource: 'Pacific Data Hub (PDH) / PFTAC Revenue Stats', country: 'Papua New Guinea' },
  },
  'PLW': {
    temperature: { stationName: 'Koror Ocean', dataSource: 'Pacific Data Hub (PDH) / NOAA OISST V2.1', country: 'Palau' },
    seaLevel: { stationName: 'Malakal Tide Gauge', dataSource: 'Pacific Data Hub (PDH) / PSMSL/IOC Sea Level', country: 'Palau' },
    rainfall: { stationName: 'Koror Station', dataSource: 'Pacific Data Hub (PDH) / GPCP Precipitation', country: 'Palau' },
    cropYield: { stationName: 'Babeldaob Island', dataSource: 'Pacific Data Hub (PDH) / FAO Palau Crop Data', country: 'Palau' },
    tax: { stationName: 'Ngerulmud', dataSource: 'Pacific Data Hub (PDH) / PFTAC Revenue Stats', country: 'Palau' },
  },
  'MHL': {
    temperature: { stationName: 'Majuro Ocean', dataSource: 'Pacific Data Hub (PDH) / NOAA OISST V2.1', country: 'Marshall Islands' },
    seaLevel: { stationName: 'Majuro Tide Gauge', dataSource: 'Pacific Data Hub (PDH) / PSMSL/IOC Sea Level', country: 'Marshall Islands' },
    rainfall: { stationName: 'Majuro Intl Station', dataSource: 'Pacific Data Hub (PDH) / GPCP Precipitation', country: 'Marshall Islands' },
    cropYield: { stationName: 'Majuro Atoll', dataSource: 'Pacific Data Hub (PDH) / FAO Marshall Is. Crop Data', country: 'Marshall Islands' },
    tax: { stationName: 'Majuro', dataSource: 'Pacific Data Hub (PDH) / PFTAC Revenue Stats', country: 'Marshall Islands' },
  },
  'FSM': {
    temperature: { stationName: 'Pohnpei Ocean', dataSource: 'Pacific Data Hub (PDH) / NOAA OISST V2.1', country: 'Micronesia' },
    seaLevel: { stationName: 'Pohnpei Tide Gauge', dataSource: 'Pacific Data Hub (PDH) / PSMSL/IOC Sea Level', country: 'Micronesia' },
    rainfall: { stationName: 'Pohnpei Station', dataSource: 'Pacific Data Hub (PDH) / GPCP Precipitation', country: 'Micronesia' },
    cropYield: { stationName: 'Pohnpei & Chuuk', dataSource: 'Pacific Data Hub (PDH) / FAO Micronesia Crop Data', country: 'Micronesia' },
    tax: { stationName: 'Palikir', dataSource: 'Pacific Data Hub (PDH) / PFTAC Revenue Stats', country: 'Micronesia' },
  },
};

export function getStation(countryId: string | undefined, type: keyof typeof COUNTRY_STATIONS['regional-average']): StationInfo {
  const id = countryId || 'regional-average';
  const config = COUNTRY_STATIONS[id] || COUNTRY_STATIONS['regional-average'];
  return config[type];
}
