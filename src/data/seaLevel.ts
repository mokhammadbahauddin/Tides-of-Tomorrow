import * as d3 from 'd3';

export interface SeaLevelData {
  country: string;
  code: string;
  rate: number;
  lat: number;
  lon: number;
  detail: string;
}

export const seaLevelData: SeaLevelData[] = [
  { country: "Samoa", code: "WSM", rate: 10.3, lat: -13.759, lon: -172.104, detail: "Highest rate in the Pacific region" },
  { country: "Marshall Islands", code: "MHL", rate: 5.2, lat: 7.131, lon: 171.184, detail: "Majuro atoll losing 0.5% of land annually" },
  { country: "Kiribati", code: "KIR", rate: 3.9, lat: 1.836, lon: -157.377, detail: "33 atolls, average elevation 2 meters" },
  { country: "Tuvalu", code: "TUV", rate: 4.1, lat: -7.109, lon: 177.649, detail: "Highest point: 4.6 meters above sea level" },
  { country: "Fiji", code: "FJI", rate: 4.6, lat: -17.713, lon: 178.065, detail: "Viti Levu coastal erosion accelerating" },
  { country: "Solomon Islands", code: "SLB", rate: 7.3, lat: -9.645, lon: 160.156, detail: "Five islands already submerged" },
  { country: "Vanuatu", code: "VUT", rate: 4.8, lat: -15.377, lon: 166.959, detail: "Port Vila experiencing frequent flooding" },
  { country: "Tonga", code: "TON", rate: 5.5, lat: -21.179, lon: -175.198, detail: "Coral reef degradation reducing protection" },
  { country: "Palau", code: "PLW", rate: 3.2, lat: 7.515, lon: 134.582, detail: "Rock Islands vulnerable to inundation" },
  { country: "Micronesia", code: "FSM", rate: 2.8, lat: 6.887, lon: 158.215, detail: "Low-lying atolls at critical risk" },
  { country: "Nauru", code: "NRU", rate: 3.5, lat: -0.522, lon: 166.931, detail: "Single island nation with nowhere to retreat" },
  { country: "Cook Islands", code: "COK", rate: 3.8, lat: -21.237, lon: -159.778, detail: "Aitutaki lagoon ecosystem stressed" },
  { country: "Papua New Guinea", code: "PNG", rate: 4.3, lat: -6.315, lon: 143.956, detail: "Coastal communities relocating inland" },
];

export const seaLevelColorScale = [
  { max: 3, color: d3.interpolateViridis(0.2), label: "0-3 mm/year" },
  { max: 5, color: d3.interpolateViridis(0.5), label: "3-5 mm/year" },
  { max: 8, color: d3.interpolateViridis(0.75), label: "5-8 mm/year" },
  { max: 100, color: d3.interpolateViridis(1.0), label: "8+ mm/year" },
];

export function getSeaLevelColor(rate: number): string {
  // Map rate (approx 0 to 12 mm/yr) to 0-1 for the scale
  const normalized = Math.min(1, Math.max(0, rate / 12));
  return d3.interpolateViridis(normalized);
}
