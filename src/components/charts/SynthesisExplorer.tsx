import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';

/* ──────────────────────── Types ──────────────────────── */
interface SynthesisMergedRecord {
  year: number;
  temperature: number;
  sealevel: number;
  rainfall: number;
  taro: number;
  tax: number;
}



/* ──────────────────────── Preset Definitions ──────────────────────── */
interface Preset {
  id: string;
  title: string;
  subtitle: string;
  xKey: keyof SynthesisMergedRecord;
  yKey: keyof SynthesisMergedRecord;
  xLabel: string;
  yLabel: string;
  xUnit: string;
  yUnit: string;
  narrative: (r: number) => string;
}

const PRESETS: Preset[] = [
  {
    id: 'temp-taro',
    title: 'Hotter Ocean, Hungrier Islands',
    subtitle: 'Temperature vs Taro Yield',
    xKey: 'temperature',
    yKey: 'taro',
    xLabel: 'SST Anomaly',
    yLabel: 'Taro Yield',
    xUnit: '°C',
    yUnit: 't/ha',
    narrative: (r) =>
      r < -0.3
        ? 'As ocean temperatures climb, taro yields fall consistently — the staple food of the Pacific is vanishing with the heat.'
        : r > 0.3
          ? 'A positive link exists here — but deeper analysis reveals confounding factors at play.'
          : 'The relationship is weak in this window, but the long-term trajectory tells a grimmer story.',
  },
  {
    id: 'sea-tax',
    title: 'Rising Tides, Rising Costs',
    subtitle: 'Sea Level vs Climate Tax',
    xKey: 'sealevel',
    yKey: 'tax',
    xLabel: 'Sea Level',
    yLabel: 'Environmental Tax',
    xUnit: 'mm',
    yUnit: '% GDP',
    narrative: (r) =>
      r > 0.3
        ? 'Higher seas mean higher economic burden — Pacific nations are paying for a crisis they did not create.'
        : r < -0.3
          ? 'An inverse pattern — when seas recede briefly, tax burdens shift, but the long-term trend is devastating.'
          : 'The economic toll fluctuates, but every millimeter of rise chips away at national budgets.',
  },
  {
    id: 'rain-taro',
    title: 'Broken Rain, Broken Harvests',
    subtitle: 'Rainfall vs Taro Yield',
    xKey: 'rainfall',
    yKey: 'taro',
    xLabel: 'Rainfall Anomaly',
    yLabel: 'Taro Yield',
    xUnit: '%',
    yUnit: 't/ha',
    narrative: (r) =>
      r > 0.3
        ? 'When rains follow their ancient patterns, harvests thrive. But the rains are breaking — and so are the harvests.'
        : r < -0.3
          ? 'Paradoxically, more erratic rainfall has decimated yields — floods destroy as effectively as droughts.'
          : 'The fracturing rainfall pattern creates unpredictable swings in food production.',
  },
  {
    id: 'temp-sea',
    title: 'The Chain Reaction',
    subtitle: 'Temperature vs Sea Level',
    xKey: 'temperature',
    yKey: 'sealevel',
    xLabel: 'SST Anomaly',
    yLabel: 'Sea Level',
    xUnit: '°C',
    yUnit: 'mm',
    narrative: (r) =>
      r > 0.3
        ? 'The fundamental link: warmer oceans expand and melt ice, driving seas higher. This is the engine of the crisis.'
        : r < -0.3
          ? 'Short-term oscillations mask the truth — over decades, the correlation is undeniable.'
          : 'Year-to-year noise obscures the signal, but the physics is clear: heat drives the rise.',
  },
];

const MARGIN = { top: 25, right: 25, bottom: 45, left: 55 };

interface ClimateEvent {
  year: number;
  title: string;
  description: string;
  accentColor: string;
}

const CLIMATE_EVENTS: ClimateEvent[] = [
  {
    year: 2015,
    title: 'Cyclone Pam',
    description: 'Category 5 Cyclone Pam devastates Vanuatu in March 2015, causing damage equivalent to 64% of GDP and demonstrating the catastrophic potential of intensifying tropical storms in the warming Pacific.',
    accentColor: '#B44D36', // Terracotta
  },
  {
    year: 2016,
    title: 'El Niño Bleaching Peak',
    description: 'Severe thermal stress in 2016 triggers a devastating marine heatwave, causing unprecedented global coral bleaching that kills over 30% of the Great Barrier Reef and widespread Pacific coral ecosystems.',
    accentColor: '#D4A574', // Warm sand
  },
  {
    year: 2020,
    title: 'Cyclone Harold',
    description: 'Cyclone Harold, a Category 5 storm, strikes Vanuatu, Fiji, Tonga, and the Solomons in April 2020, compounding the socio-economic challenges of the COVID-19 pandemic and exposing multi-hazard vulnerabilities.',
    accentColor: '#B44D36', // Terracotta
  },
  {
    year: 2023,
    title: 'Record Sea Level Anomalies',
    description: 'Ocean thermal expansion and changing wind patterns drive sea level anomalies to record-breaking heights in 2023, causing severe high-tide flooding and saltwater intrusion in low-lying atolls.',
    accentColor: '#2B7A78', // Reef teal
  },
];

/* ──────────────────────── Helpers ──────────────────────── */
function linearRegression(pts: { x: number; y: number }[]) {
  const n = pts.length;
  if (n < 2) return { slope: 0, intercept: 0 };
  const mx = d3.mean(pts, d => d.x) ?? 0;
  const my = d3.mean(pts, d => d.y) ?? 0;
  let num = 0, den = 0;
  for (const p of pts) {
    num += (p.x - mx) * (p.y - my);
    den += (p.x - mx) * (p.x - mx);
  }
  const slope = den === 0 ? 0 : num / den;
  return { slope, intercept: my - slope * mx };
}

function pearsonR(x: number[], y: number[]): number {
  const n = x.length;
  if (n < 2) return 0;
  const mx = d3.mean(x) ?? 0;
  const my = d3.mean(y) ?? 0;
  let num = 0, dx2 = 0, dy2 = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx, dy = y[i] - my;
    num += dx * dy;
    dx2 += dx * dx;
    dy2 += dy * dy;
  }
  const den = Math.sqrt(dx2 * dy2);
  return den === 0 ? 0 : num / den;
}

interface SynthesisExplorerProps {
  selectedCountry?: { id: string; name: string };
}

/* ──────────────────────── Component ──────────────────────── */
export const SynthesisExplorer: React.FC<SynthesisExplorerProps> = ({ selectedCountry }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<SynthesisMergedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePreset, setActivePreset] = useState(0);
  const [selectedYear, setSelectedYear] = useState<number>(2015);
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const [isPlaying, setIsPlaying] = useState(false);

  const preset = PRESETS[activePreset];

  // Hover overrides the timeline focus
  const activeYear = hoveredYear !== null ? hoveredYear : selectedYear;

  /* ── Autoplay Timeline ── */
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setSelectedYear((prev) => {
          if (prev >= 2023) return 2010;
          return prev + 1;
        });
      }, 1500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  /* ── Resize ── */
  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      for (const e of entries) setContainerWidth(e.contentRect.width || 800);
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  /* ── Fetch & merge ── */
  useEffect(() => {
    Promise.all([
      d3.json<any[]>('/data/temperature.json'),
      d3.json<any[]>('/data/sealevel.json'),
      d3.json<any[]>('/data/rainfall.json'),
      d3.json<any[]>('/data/cropyield.json'),
      d3.json<any[]>('/data/taxes.json'),
    ]).then(([tempData, seaData, rainData, cropData, taxData]) => {
      if (!tempData || !seaData || !rainData || !cropData || !taxData) return;

      const countryKey = selectedCountry?.id || 'REGIONAL';

      // 1. Temperature Anomaly Map
      const tempMap = new Map(tempData.map(d => {
        const val = d[countryKey] !== undefined ? d[countryKey] : (d.regional !== undefined ? d.regional : d.anomaly);
        return [d.year, val !== undefined ? Number(val) : undefined];
      }));

      // 2. Sea Level Map
      const seaMap = new Map(seaData.map(d => {
        const val = d[countryKey] !== undefined ? d[countryKey] : (d.regional !== undefined ? d.regional : d.level);
        return [d.year, val !== undefined ? Number(val) : undefined];
      }));

      // 3. Rainfall Anomaly Map
      const rainMap = new Map(rainData.map(d => {
        const val = d[countryKey] !== undefined ? d[countryKey] : (d.regional !== undefined ? d.regional : d.anomaly);
        return [d.year, val !== undefined ? Number(val) : undefined];
      }));

      // 4. Crop Yield Map (Taro)
      const cropMap = new Map(cropData.map(d => {
        const countryObj = d[countryKey] || d['REGIONAL'] || d['regional'];
        const val = countryObj ? countryObj.taro : undefined;
        return [d.year, val !== undefined ? Number(val) : undefined];
      }));

      // 5. Tax Map
      const taxMap = new Map(taxData.map(d => {
        const val = d[countryKey] !== undefined ? d[countryKey] : (d.regional !== undefined ? d.regional : d.taxPercent);
        return [d.year, val !== undefined ? Number(val) : undefined];
      }));

      const merged: SynthesisMergedRecord[] = [];
      for (let y = 2010; y <= 2023; y++) {
        const temp = tempMap.get(y);
        const sea = seaMap.get(y);
        const rain = rainMap.get(y);
        const crop = cropMap.get(y);
        const tax = taxMap.get(y);

        if (temp !== undefined && sea !== undefined && rain !== undefined && crop !== undefined && tax !== undefined) {
          merged.push({
            year: y,
            temperature: temp,
            sealevel: sea,
            rainfall: rain,
            taro: crop,
            tax: tax,
          });
        }
      }
      merged.sort((a, b) => a.year - b.year);
      setData(merged);
      setLoading(false);
    }).catch(err => {
      console.error('Failed to load synthesis data:', err);
      setData([]);
      setLoading(false);
    });
  }, [selectedCountry]);

  /* ── Layout ── */
  const chartWidth = containerWidth >= 768 ? Math.max(320, containerWidth * 0.65) : containerWidth;
  const width = chartWidth;
  const height = containerWidth >= 768 ? 480 : 370;
  const innerW = width - MARGIN.left - MARGIN.right;
  const innerH = height - MARGIN.top - MARGIN.bottom;

  /* ── Scales ── */
  const xScale = useMemo(() => {
    if (data.length === 0) return d3.scaleLinear().range([0, innerW]);
    const vals = data.map(d => d[preset.xKey] as number);
    const [min, max] = d3.extent(vals) as [number, number];
    const pad = (max - min) * 0.15 || 1;
    return d3.scaleLinear().domain([min - pad, max + pad]).range([0, innerW]);
  }, [data, preset.xKey, innerW]);

  const yScale = useMemo(() => {
    if (data.length === 0) return d3.scaleLinear().range([innerH, 0]);
    const vals = data.map(d => d[preset.yKey] as number);
    const [min, max] = d3.extent(vals) as [number, number];
    const pad = (max - min) * 0.15 || 1;
    return d3.scaleLinear().domain([min - pad, max + pad]).range([innerH, 0]);
  }, [data, preset.yKey, innerH]);

  const yearColorScale = useMemo(() => {
    if (data.length === 0) return null;
    const years = data.map(d => d.year);
    const [minY, maxY] = d3.extent(years) as [number, number];
    return d3.scaleSequential()
      .domain([minY, maxY])
      .interpolator(d3.interpolateRgbBasis(['#E8DCC8', '#D4A574', '#B44D36']));
  }, [data]);

  const yearColor = useCallback((year: number) => {
    if (!yearColorScale) return '#D4A574';
    return yearColorScale(year);
  }, [yearColorScale]);

  /* ── Regression ── */
  const regression = useMemo(() => {
    if (data.length < 2) return null;
    const pts = data.map(d => ({ x: d[preset.xKey] as number, y: d[preset.yKey] as number }));
    return linearRegression(pts);
  }, [data, preset.xKey, preset.yKey]);

  /* ── Correlation ── */
  const rValue = useMemo(() => {
    if (data.length < 2) return 0;
    return pearsonR(
      data.map(d => d[preset.xKey] as number),
      data.map(d => d[preset.yKey] as number)
    );
  }, [data, preset.xKey, preset.yKey]);

  const activeRecord = useMemo(() => {
    return data.find(d => d.year === activeYear);
  }, [data, activeYear]);

  const activePx = useMemo(() => {
    if (!activeRecord) return 0;
    return xScale(activeRecord[preset.xKey] as number);
  }, [activeRecord, preset.xKey, xScale]);

  const activePy = useMemo(() => {
    if (!activeRecord) return 0;
    return yScale(activeRecord[preset.yKey] as number);
  }, [activeRecord, preset.yKey, yScale]);

  /* ── Narrative color ── */
  const narrativeColor = rValue < -0.3 ? 'var(--terracotta)' : rValue > 0.3 ? 'var(--reef-teal)' : 'var(--warm-sand)';

  /* ── Loading ── */
  if (loading || data.length === 0) {
    return (
      <div className="w-full h-[500px] rounded-none bg-[#0B1A2E]/80 animate-pulse flex items-center justify-center border border-[#D4A574]/20">
        <p className="text-[#D4A574] font-serif tracking-widest text-lg">Loading…</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full relative rounded-none overflow-hidden font-sans border flex flex-col md:flex-row"
      style={{
        background: 'linear-gradient(135deg, rgba(11, 26, 46, 0.95) 0%, rgba(15, 34, 55, 0.97) 50%, rgba(11, 26, 46, 0.95) 100%)',
        borderColor: 'rgba(212, 165, 116, 0.15)',
      }}
    >
      {/* ── LEFT COLUMN: SVG Chart Area (65% width) ── */}
      <div className="w-full md:w-[65%] flex flex-col justify-center items-center py-6 px-4 md:px-6 relative overflow-visible select-none">
        <svg 
          width={width} 
          height={height} 
          className="block overflow-visible max-w-full"
          role="img"
          aria-label={`Act VII: Interactive correlation scatter plot. Currently plotting ${preset.xLabel} on the X-axis against ${preset.yLabel} on the Y-axis for ${selectedCountry?.name || 'Regional Average'} (2010-2023).`}
        >
          <title>Synthesis Explorer Correlation Chart</title>
          <desc>An interactive scatter plot cross-referencing multi-variable climate indices and crop productivity deficits over a decade timeline.</desc>
          <defs>
            <filter id="dot-glow-synth">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="dot-glow-hover">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
            {/* Subtle grid */}
            {xScale.ticks(5).map((t, i) => (
              <line
                key={`xg-${i}`}
                x1={xScale(t)} x2={xScale(t)}
                y1={0} y2={innerH}
                stroke="var(--shell-white)" strokeWidth={0.5} opacity={0.06}
              />
            ))}
            {yScale.ticks(5).map((t, i) => (
              <line
                key={`yg-${i}`}
                x1={0} x2={innerW}
                y1={yScale(t)} y2={yScale(t)}
                stroke="var(--shell-white)" strokeWidth={0.5} opacity={0.06}
              />
            ))}

            {/* Event Reference Lines */}
            {CLIMATE_EVENTS.map(event => {
              const row = data.find(d => d.year === event.year);
              if (!row) return null;
              const px = xScale(row[preset.xKey] as number);
              const isEventActive = row.year === activeYear;
              return (
                <g key={`event-line-${event.year}`}>
                  {/* Subtle vertical dashed line */}
                  <line
                    x1={px}
                    y1={0}
                    x2={px}
                    y2={innerH}
                    stroke={isEventActive ? "var(--warm-sand)" : "rgba(212, 165, 116, 0.18)"}
                    strokeWidth={isEventActive ? 1.5 : 1}
                    strokeDasharray="4 4"
                    style={{
                      transition: 'stroke 0.3s ease, stroke-width 0.3s ease',
                      ...{
                        x1: `${px}px`,
                        x2: `${px}px`,
                      }
                    } as React.CSSProperties}
                  />

                  {/* Top event label */}
                  <text
                    x={px}
                    y={-8}
                    textAnchor="middle"
                    fill={isEventActive ? "var(--warm-sand)" : "rgba(212, 165, 116, 0.65)"}
                    fontSize={8}
                    fontWeight={isEventActive ? '700' : '500'}
                    fontFamily="'Inter', sans-serif"
                    style={{
                      transition: 'fill 0.3s ease, font-weight 0.3s ease',
                      cursor: 'pointer',
                      ...{
                        x: `${px}px`,
                      }
                    } as React.CSSProperties}
                    onMouseEnter={() => setHoveredYear(event.year)}
                    onMouseLeave={() => setHoveredYear(null)}
                    onClick={() => setSelectedYear(event.year)}
                  >
                    {event.year}
                  </text>

                  {/* Invisible wide hover line */}
                  <line
                    x1={px}
                    y1={0}
                    x2={px}
                    y2={innerH}
                    stroke="transparent"
                    strokeWidth={14}
                    style={{
                      cursor: 'pointer',
                      ...{
                        x1: `${px}px`,
                        x2: `${px}px`,
                      }
                    } as React.CSSProperties}
                    onMouseEnter={() => setHoveredYear(event.year)}
                    onMouseLeave={() => setHoveredYear(null)}
                    onClick={() => setSelectedYear(event.year)}
                  />
                </g>
              );
            })}

            {/* X axis ticks */}
            {xScale.ticks(5).map((t, i) => (
              <text
                key={`xt-${i}`}
                x={xScale(t)} y={innerH + 18}
                textAnchor="middle"
                fill="var(--shell-white)" opacity={0.4} fontSize={9} fontFamily="'Inter', sans-serif"
              >
                {typeof t === 'number' ? (Math.abs(t) >= 100 ? t.toFixed(0) : t.toFixed(1)) : t}
              </text>
            ))}
            {/* X axis label */}
            <text
              x={innerW / 2} y={innerH + 36}
              textAnchor="middle"
              fill="var(--warm-sand)" fontSize={11} fontFamily="'Playfair Display', serif" fontWeight="600" opacity={0.9}
            >
              {preset.xLabel} ({preset.xUnit})
            </text>

            {/* Y axis ticks */}
            {yScale.ticks(5).map((t, i) => (
              <text
                key={`yt-${i}`}
                x={-10} y={yScale(t)}
                textAnchor="end" alignmentBaseline="middle"
                fill="var(--shell-white)" opacity={0.4} fontSize={9} fontFamily="'Inter', sans-serif"
              >
                {typeof t === 'number' ? (Math.abs(t) >= 100 ? t.toFixed(0) : t.toFixed(1)) : t}
              </text>
            ))}
            {/* Y axis label */}
            <text
              transform={`translate(-42, ${innerH / 2}) rotate(-90)`}
              textAnchor="middle"
              fill="var(--warm-sand)" fontSize={11}
              fontFamily="'Playfair Display', serif" fontWeight="600" opacity={0.9}
            >
              {preset.yLabel} ({preset.yUnit})
            </text>

            {/* Regression line */}
            {regression && data.length >= 2 && (() => {
              const xVals = data.map(d => d[preset.xKey] as number);
              const x1 = Math.min(...xVals);
              const x2 = Math.max(...xVals);
              const y1 = regression.slope * x1 + regression.intercept;
              const y2 = regression.slope * x2 + regression.intercept;
              const strokeColor = rValue < -0.15 ? 'var(--terracotta)' : rValue > 0.15 ? 'var(--reef-teal)' : 'var(--warm-sand)';
              return (
                <line
                  stroke={strokeColor}
                  strokeWidth={1.5}
                  strokeDasharray="6 4"
                  opacity={0.35}
                  x1={xScale(x1)}
                  y1={yScale(y1)}
                  x2={xScale(x2)}
                  y2={yScale(y2)}
                  style={{
                    transition: 'stroke 0.3s ease, opacity 0.3s ease',
                    ...{
                      x1: `${xScale(x1)}px`,
                      y1: `${yScale(y1)}px`,
                      x2: `${xScale(x2)}px`,
                      y2: `${yScale(y2)}px`,
                    }
                  } as React.CSSProperties}
                />
              );
            })()}

            {/* Projection Lines */}
            {activeRecord && (
              <g pointerEvents="none">
                {/* Horizontal line to Y axis */}
                <line
                  x1={0}
                  y1={activePy}
                  x2={activePx}
                  y2={activePy}
                  stroke="rgba(253, 251, 247, 0.35)"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  style={{
                    transition: 'opacity 0.3s ease',
                    ...{
                      y1: `${activePy}px`,
                      y2: `${activePy}px`,
                      x2: `${activePx}px`,
                    }
                  } as React.CSSProperties}
                />
                {/* Vertical line to X axis */}
                <line
                  x1={activePx}
                  y1={activePy}
                  x2={activePx}
                  y2={innerH}
                  stroke="rgba(253, 251, 247, 0.35)"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  style={{
                    transition: 'opacity 0.3s ease',
                    ...{
                      x1: `${activePx}px`,
                      x2: `${activePx}px`,
                      y1: `${activePy}px`,
                    }
                  } as React.CSSProperties}
                />
              </g>
            )}

            {/* Data points */}
            {data.map(row => {
              const isActive = row.year === activeYear;
              const px = xScale(row[preset.xKey] as number);
              const py = yScale(row[preset.yKey] as number);
              const color = yearColor(row.year) as string;
              const dimmed = activeYear !== null && !isActive;

              return (
                <g key={row.year}>
                  {/* Glow ring */}
                  <circle
                    r={14}
                    fill="none"
                    stroke={color}
                    strokeWidth={1.5}
                    opacity={isActive ? 0.45 : 0}
                    cx={px}
                    cy={py}
                    style={{
                      filter: 'url(#dot-glow-hover)',
                      transition: 'opacity 0.3s ease',
                      ...{
                        cx: `${px}px`,
                        cy: `${py}px`,
                      }
                    } as React.CSSProperties}
                  />

                  {/* Diamond marker for event years */}
                  {CLIMATE_EVENTS.some(e => e.year === row.year) && (() => {
                    const event = CLIMATE_EVENTS.find(e => e.year === row.year)!;
                    const eventActive = row.year === activeYear;
                    return (
                      <rect
                        x={px - 8}
                        y={py - 8}
                        width={16}
                        height={16}
                        fill="none"
                        stroke={eventActive ? event.accentColor : "rgba(212, 165, 116, 0.45)"}
                        strokeWidth={eventActive ? 1.5 : 1}
                        strokeDasharray={eventActive ? "none" : "2 2"}
                        transform={`rotate(45, ${px}, ${py})`}
                        style={{
                          transition: 'stroke 0.3s ease, stroke-width 0.3s ease',
                          cursor: 'pointer',
                          ...{
                            x: `${px - 8}px`,
                            y: `${py - 8}px`,
                        }
                        } as React.CSSProperties}
                        onMouseEnter={() => setHoveredYear(row.year)}
                        onMouseLeave={() => setHoveredYear(null)}
                        onClick={() => setSelectedYear(row.year)}
                      />
                    );
                  })()}

                  {/* Main dot */}
                  <circle
                    cx={px}
                    cy={py}
                    r={isActive ? 9 : 5}
                    fill={color}
                    stroke={isActive ? '#FDFBF7' : 'rgba(253,251,247,0.25)'}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    opacity={dimmed ? 0.35 : 1}
                    filter="url(#dot-glow-synth)"
                    style={{
                      transition: 'opacity 0.3s ease, r 0.3s ease, stroke 0.3s ease, stroke-width 0.3s ease',
                      cursor: 'pointer',
                      ...{
                        cx: `${px}px`,
                        cy: `${py}px`,
                      }
                    } as React.CSSProperties}
                    onMouseEnter={() => setHoveredYear(row.year)}
                    onMouseLeave={() => setHoveredYear(null)}
                    onClick={() => setSelectedYear(row.year)}
                  />

                  {/* Year label */}
                  <text
                    x={px}
                    y={py - (isActive ? 15 : 10)}
                    textAnchor="middle"
                    fill={isActive ? '#FDFBF7' : '#E8DCC8'}
                    fontSize={isActive ? 11 : 8}
                    fontWeight={isActive ? '700' : '500'}
                    fontFamily="'Playfair Display', serif"
                    opacity={dimmed ? 0.3 : 0.8}
                    style={{
                      transition: 'opacity 0.3s ease, font-size 0.3s ease, fill 0.3s ease',
                      pointerEvents: 'none',
                      ...{
                        x: `${px}px`,
                        y: `${py - (isActive ? 15 : 10)}px`,
                      }
                    } as React.CSSProperties}
                  >
                    {row.year}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Tooltip on hover */}
        {hoveredYear !== null && (() => {
          const row = data.find(d => d.year === hoveredYear);
          if (!row) return null;
          return (
            <div
              className="absolute top-4 right-4 z-30 border rounded-none px-4 py-3 shadow-2xl max-w-[210px] backdrop-blur-md"
              style={{
                background: 'rgba(11, 26, 46, 0.96)',
                borderColor: 'rgba(212, 165, 116, 0.25)',
              }}
            >
              <div className="text-sm font-serif font-bold mb-1.5 flex items-center gap-2" style={{ color: '#E8DCC8' }}>
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ background: yearColor(row.year) as string, boxShadow: `0 0 6px ${yearColor(row.year)}` }}
                />
                {row.year}
              </div>
              <div className="space-y-1 text-[10px]">
                <div className="flex justify-between gap-4">
                  <span className="font-medium text-[#D4A574]">{preset.xLabel}</span>
                  <span className="font-mono text-[#E8DCC8]">
                    {(row[preset.xKey] as number).toFixed(preset.xKey === 'temperature' || preset.xKey === 'taro' ? 2 : 1)}
                    <span className="ml-0.5 opacity-40">{preset.xUnit}</span>
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="font-medium text-[#D4A574]">{preset.yLabel}</span>
                  <span className="font-mono text-[#E8DCC8]">
                    {(row[preset.yKey] as number).toFixed(preset.yKey === 'temperature' || preset.yKey === 'taro' ? 2 : 1)}
                    <span className="ml-0.5 opacity-40">{preset.yUnit}</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })()}

      </div>

      {/* ── RIGHT COLUMN: Control and Information Panel (35% width) ── */}
      <div className="w-full md:w-[35%] flex flex-col justify-between border-t md:border-t-0 md:border-l border-[#D4A574]/15 bg-ocean-ink/20 p-5 gap-5">
        
        {/* Presets Selector */}
        <div className="flex flex-col gap-2">
          <span className="text-[9px] font-mono text-[#8B7355] uppercase tracking-widest">Select Visual Hypothesis</span>
          <div className="flex flex-col gap-2">
            {PRESETS.map((p, i) => {
              const isActive = i === activePreset;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setActivePreset(i);
                    setHoveredYear(null);
                  }}
                  className="w-full text-left px-4 py-2.5 rounded-none transition-all duration-300 focus:outline-none flex flex-col gap-0.5"
                  style={{
                    background: isActive ? 'rgba(43, 122, 120, 0.15)' : 'rgba(255, 255, 255, 0.01)',
                    border: `1px solid ${isActive ? 'var(--reef-teal)' : 'rgba(212, 165, 116, 0.08)'}`,
                    boxShadow: isActive ? '0 0 10px rgba(43, 122, 120, 0.1)' : 'none',
                  }}
                >
                  <div
                    className="text-[10px] font-bold tracking-wider uppercase transition-colors duration-300"
                    style={{ color: isActive ? 'var(--shell-white)' : 'rgba(232, 220, 200, 0.5)' }}
                  >
                    {p.title}
                  </div>
                  <div
                    className="text-[9px] font-mono tracking-wide transition-colors duration-300"
                    style={{ color: isActive ? 'var(--warm-sand)' : 'rgba(212, 165, 116, 0.3)' }}
                  >
                    {p.subtitle}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Timeline Slider with Autoplay */}
        <div className="flex flex-col gap-3 p-4 bg-[#0B1A2E]/50 border border-[#D4A574]/10 rounded-none">
          <div className="flex justify-between items-center text-xs font-mono">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1 rounded-none bg-reef-teal/20 border border-reef-teal/30 hover:bg-reef-teal/35 text-reef-teal hover:text-white transition-all cursor-pointer outline-none focus:outline-none flex items-center justify-center"
                title={isPlaying ? 'Pause Autoplay' : 'Play Autoplay'}
              >
                {isPlaying ? (
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              <span className="text-[#8B7355] uppercase tracking-wider">Timeline Focus</span>
            </div>
            <span className="text-sm font-bold font-display text-white tracking-widest px-2 py-0.5 rounded-none bg-[#2B7A78]/25 border border-[#2B7A78]/30">
              {activeYear}
            </span>
          </div>

          <div className="relative mt-1">
            {/* Slider track background */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#0B1A2E] rounded-full transform -translate-y-1/2 border border-[#D4A574]/10 pointer-events-none" />

            {/* Active filled track */}
            <div
              className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-[#2B7A78] to-[#D4A574] rounded-full transform -translate-y-1/2 pointer-events-none transition-all duration-300"
              style={{
                width: `${((activeYear - 2010) / 13) * 100}%`
              }}
            />

            {/* Hidden Input range for scrubbing */}
            <input
              type="range"
              min="2010"
              max="2023"
              step="1"
              value={activeYear}
              onChange={(e) => {
                setSelectedYear(parseInt(e.target.value));
              }}
              className="w-full h-6 opacity-0 cursor-pointer relative z-10"
            />

            {/* Custom slider thumb */}
            <div
              className="absolute top-1/2 w-4 h-4 rounded-full bg-white border-2 border-[#D4A574] transform -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-all duration-300"
              style={{
                left: `${((activeYear - 2010) / 13) * 100}%`,
                boxShadow: `0 0 10px var(--warm-sand)`
              }}
            />
          </div>

          {/* Compact Year Ticks */}
          <div className="flex justify-between relative px-0.5">
            {Array.from({ length: 14 }, (_, idx) => {
              const yr = 2010 + idx;
              const isSelected = yr === activeYear;
              return (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(yr)}
                  className="flex flex-col items-center group focus:outline-none"
                  style={{
                    width: '18px',
                    marginLeft: idx === 0 ? '-9px' : '0',
                    marginRight: idx === 13 ? '-9px' : '0',
                  }}
                >
                  <div
                    className={`w-1 h-1 rounded-full mb-1 transition-all duration-300 ${
                      isSelected
                        ? 'bg-[#D4A574] scale-125'
                        : 'bg-[#8B7355]/40 group-hover:bg-[#8B7355]'
                    }`}
                  />
                  <span
                    className={`text-[8px] font-mono transition-all duration-300 ${
                      isSelected
                        ? 'text-[#D4A574] font-bold'
                        : 'text-[#8B7355]/50 group-hover:text-[#8B7355]'
                    }`}
                  >
                    {String(yr).slice(-2)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Narrative & Active Snapshot */}
        <div className="flex flex-col gap-4 border-t border-[#D4A574]/10 pt-4">
          <div>
            <h4 className="text-[9px] font-mono uppercase tracking-widest text-[#8B7355] mb-1">
              Correlation Analysis (r = {rValue.toFixed(2)})
            </h4>
            <p
              className="text-sm leading-relaxed font-display italic transition-all duration-500"
              style={{
                color: narrativeColor,
                textShadow: `0 0 15px ${narrativeColor}25`,
              }}
            >
              {preset.narrative(rValue)}
            </p>
          </div>

          {/* Active Snapshot display */}
          {(() => {
            const activeRow = data.find(d => d.year === activeYear);
            if (!activeRow) return null;
            const xVal = activeRow[preset.xKey] as number;
            const yVal = activeRow[preset.yKey] as number;
            return (
              <div
                className="flex flex-col gap-1.5 p-3 rounded-none border bg-ocean-ink/40 w-full"
                style={{
                  borderColor: 'rgba(212, 165, 116, 0.12)',
                }}
              >
                <div className="text-[9px] font-mono text-[#8B7355] uppercase tracking-wider mb-0.5">
                  Data Snapshot — Year {activeYear}
                </div>
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-[#E8DCC8]/70 text-[10px]">{preset.xLabel}:</span>
                  <span className="font-mono font-bold text-[#E8DCC8]">
                    {xVal.toFixed(preset.xKey === 'temperature' || preset.xKey === 'taro' ? 2 : 1)}
                    <span className="text-[8px] text-[#E8DCC8]/50 ml-0.5">{preset.xUnit}</span>
                  </span>
                </div>
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-[#E8DCC8]/70 text-[10px]">{preset.yLabel}:</span>
                  <span className="font-mono font-bold text-[#E8DCC8]">
                    {yVal.toFixed(preset.yKey === 'temperature' || preset.yKey === 'taro' ? 2 : 1)}
                    <span className="text-[8px] text-[#E8DCC8]/50 ml-0.5">{preset.yUnit}</span>
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Active Event Narrative Card */}
          {(() => {
            const event = CLIMATE_EVENTS.find(e => e.year === activeYear);
            if (!event) return null;
            return (
              <div
                className="flex flex-col gap-1.5 p-3 rounded-none border text-left mt-1"
                style={{
                  borderColor: 'rgba(212, 165, 116, 0.15)',
                  background: 'rgba(11, 26, 46, 0.4)',
                  borderLeft: `3.5px solid ${event.accentColor}`,
                }}
              >
                <div className="text-[9px] font-mono text-[#8C7A65] uppercase tracking-wider mb-0.5">
                  Historical Climate Event ({event.year})
                </div>
                <h5 className="text-[11px] font-serif font-bold text-[#E8DCC8] mb-0.5 leading-snug">
                  {event.title}
                </h5>
                <p className="text-[10px] leading-relaxed text-[#E8DCC8]/80 font-sans">
                  {event.description}
                </p>
              </div>
            );
          })()}
        </div>

      </div>
    </div>
  );
};
