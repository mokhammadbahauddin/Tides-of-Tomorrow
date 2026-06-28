// Fully Responsive Mini D3 Projection Line Chart sub-component for CallToAction
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface ProjectionPoint {
  x: number;
  y: number;
  temp: number;
  year: number;
}

// Color utility matching CallToAction's pledge colour scheme
const getPledgeColor = (p: number) => {
  if (p >= 75) return '#2B7A78'; // Safe reef teal
  if (p >= 30) return '#D4A574'; // Warning warm sand
  return '#B44D36'; // Critical terracotta
};

interface MiniChartProps {
  pledge: number;
}

export default function MiniChart({ pledge }: MiniChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 340, height: 110 });

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        if (width > 0) {
          setDimensions({ width, height: 115 });
        }
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const width = dimensions.width;
  const height = dimensions.height;
  const padding = { top: 12, right: 15, bottom: 20, left: 32 };
  const graphW = width - padding.left - padding.right;
  const graphH = height - padding.top - padding.bottom;

  // Calculate points from 2020 to 2050
  const points: ProjectionPoint[] = [2020, 2025, 2030, 2035, 2040, 2045, 2050].map((yVal) => {
    const t = (yVal - 2020) / 30;
    const p = pledge / 100;
    const tempVal = 0.95 + (1.65 - 1.3 * p) * t - (0.25 * p) * t * t;
    const px = padding.left + t * graphW;
    const py = padding.top + (1 - (tempVal - 0.5) / 2.3) * graphH;
    return { x: px, y: py, temp: tempVal, year: yVal };
  });

  const lineGen = d3
    .line<ProjectionPoint>()
    .x((d) => d.x)
    .y((d) => d.y)
    .curve(d3.curveMonotoneX);

  const pathD = lineGen(points) || '';

  // Helper arrays for gridlines & labels
  const tempTicks = [1.0, 1.5, 2.0, 2.5];
  const yearTicks = [2020, 2030, 2040, 2050];

  return (
    <div ref={containerRef} className="flex flex-col w-full glass-panel border border-[#D4A574]/15 rounded-none p-4 transition-all duration-500">
      <span className="text-[8px] text-[#8B7355] font-mono mb-2 uppercase tracking-wide font-semibold">
        Temperature Trajectory (2020–2050)
      </span>
      <svg role="img" aria-label={`Temperature projection line chart showing projected temperature anomaly of ${points[points.length - 1].temp.toFixed(2)}°C by 2050 based on a ${pledge}% emission reduction`} viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <title>Temperature Projection Chart</title>
        <desc>{`A line chart starting at 0.95°C anomaly in 2020 and changing to a projected ${points[points.length - 1].temp.toFixed(2)}°C anomaly by 2050 under a selected ${pledge}% emissions reduction pledge.`}</desc>
        <defs>
          <filter id="mini-chart-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Horizontal Grid lines */}
        {tempTicks.map((t) => {
          const py = padding.top + (1 - (t - 0.5) / 2.3) * graphH;
          return (
            <line
              key={t}
              x1={padding.left}
              x2={width - padding.right}
              y1={py}
              y2={py}
              stroke="rgba(232, 220, 200, 0.08)"
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
          );
        })}
        {/* Vertical Grid lines */}
        {yearTicks.map((yr) => {
          const px = padding.left + ((yr - 2020) / 30) * graphW;
          return (
            <line
              key={yr}
              x1={px}
              x2={px}
              y1={padding.top}
              y2={height - padding.bottom}
              stroke="rgba(232, 220, 200, 0.08)"
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
          );
        })}

        {/* Y Axis Labels */}
        {tempTicks.map((t) => {
          const py = padding.top + (1 - (t - 0.5) / 2.3) * graphH;
          return (
            <text
              key={t}
              x={padding.left - 6}
              y={py + 3}
              fill="rgba(232, 220, 200, 0.5)"
              fontSize="7px"
              fontFamily="Inter, sans-serif"
              textAnchor="end"
            >
              {t.toFixed(1)}°
            </text>
          );
        })}
        {/* X Axis Labels */}
        {yearTicks.map((yr) => {
          const px = padding.left + ((yr - 2020) / 30) * graphW;
          return (
            <text
              key={yr}
              x={px}
              y={height - 4}
              fill="rgba(232, 220, 200, 0.5)"
              fontSize="7px"
              fontFamily="Inter, sans-serif"
              textAnchor="middle"
            >
              {yr}
            </text>
          );
        })}

        {/* Curve Path */}
        <path
          d={pathD}
          fill="none"
          stroke={getPledgeColor(pledge)}
          strokeWidth="2.0"
          filter="url(#mini-chart-glow)"
          className="transition-all duration-500 ease-out"
        />

        {/* Circle Markers */}
        {points.map((pt) => (
          <circle
            key={pt.year}
            cx={pt.x}
            cy={pt.y}
            r="2.5"
            fill="#0B1A2E"
            stroke={getPledgeColor(pledge)}
            strokeWidth="1.2"
            className="transition-all duration-500 ease-out"
          />
        ))}
      </svg>
    </div>
  );
}
