import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import type { TemperatureRecord } from '@/data/temperatureData';
import { Tooltip } from '@/components/Tooltip';

interface TemperatureChartProps {
  activeStep?: number;
  selectedCountry?: { id: string; name: string };
}

interface Milestone {
  year: number;
  label: string;
  align: 'start' | 'end';
  y: number; // Staggered y-position to prevent vertical overlap
}

const milestones: Milestone[] = [
  { year: 1990, label: '1990: IPCC First Report', align: 'end', y: 15 },
  { year: 2015, label: '2015: Paris Agreement (+1.5°C Target)', align: 'start', y: 15 },
  { year: 2023, label: '2023: Global Record Heat', align: 'end', y: 32 }
];

export default function TemperatureChart({ activeStep = 0, selectedCountry }: TemperatureChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, title: '', value: '', subtitle: '', color: '' });
  const width = 600;
  const height = 350;
  
  const [rawData, setRawData] = useState<TemperatureRecord[]>([]);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    d3.json<TemperatureRecord[]>('/data/temperature.json').then((res) => {
      if (res) setRawData(res);
    }).catch((err) => { console.error('Failed to load chart data:', err); setHasError(true); });
  }, []);

  const data = useMemo(() => {
    const countryKey = selectedCountry?.id || 'REGIONAL';
    return rawData.map((d) => {
      // Look up country value or fallback to regional average
      const rawVal = (d as any)[countryKey] !== undefined
        ? Number((d as any)[countryKey])
        : ((d as any).regional !== undefined ? Number((d as any).regional) : Number((d as any).anomaly));

      const newVal = Math.max(-0.79, Math.min(1.49, rawVal));
      return {
        ...d,
        anomaly: newVal,
        isElNino: newVal > 0.5,
        elNinoStrength: (newVal > 1.0 ? "very-strong" : (newVal > 0.5 ? "strong" : "none"))
      } as any;
    });
  }, [rawData, selectedCountry]);

  const handleMouseMove = useCallback((event: MouseEvent, d: TemperatureRecord) => {
    let elNinoText = 'Neutral/La Niña';
    let dotColor = '#8B7355'; // drift-wood
    
    if (d.isElNino) {
      if (d.elNinoStrength === 'very-strong') {
        elNinoText = 'Extreme El Niño';
        dotColor = '#B44D36'; // terracotta
      } else if (d.elNinoStrength === 'strong') {
        elNinoText = 'Strong El Niño';
        dotColor = '#D4836A'; // coral-pink
      } else {
        elNinoText = 'Moderate El Niño';
        dotColor = '#C49A3C'; // golden-hour
      }
    } else if (d.anomaly < 0) {
      dotColor = '#2B7A78'; // reef-teal
    }

    setTooltip({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      title: `Year ${d.year}`,
      value: `${d.anomaly > 0 ? '+' : ''}${d.anomaly.toFixed(2)}°C`,
      subtitle: elNinoText,
      color: dotColor
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltip(prev => ({ ...prev, visible: false }));
  }, []);

  // Set up chart skeleton on first render or size change
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 30, right: 30, bottom: 40, left: 45 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.attr('viewBox', `0 0 ${width} ${height}`)
       .attr('preserveAspectRatio', 'xMidYMid meet');

    const g = svg.append('g')
      .attr('class', 'chart-group')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Definitions for Gradients
    const defs = svg.append('defs');

    // Positive Area Gradient (Warm Colors)
    const posGradient = defs.append('linearGradient')
      .attr('id', 'temp-pos-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    posGradient.append('stop').attr('offset', '0%').attr('stop-color', '#B44D36').attr('stop-opacity', 0.4);
    posGradient.append('stop').attr('offset', '100%').attr('stop-color', '#C49A3C').attr('stop-opacity', 0.0);

    // Negative Area Gradient (Cold Colors)
    const negGradient = defs.append('linearGradient')
      .attr('id', 'temp-neg-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    negGradient.append('stop').attr('offset', '0%').attr('stop-color', '#2B7A78').attr('stop-opacity', 0.0);
    negGradient.append('stop').attr('offset', '100%').attr('stop-color', '#1E4D5C').attr('stop-opacity', 0.4);

    // Positive Area Gray Gradient (For desaturated bleaching state)
    const posGrayGradient = defs.append('linearGradient')
      .attr('id', 'temp-pos-gray-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    posGrayGradient.append('stop').attr('offset', '0%').attr('stop-color', '#8B7355').attr('stop-opacity', 0.25);
    posGrayGradient.append('stop').attr('offset', '100%').attr('stop-color', '#8B7355').attr('stop-opacity', 0.0);

    // Negative Area Gray Gradient (For desaturated bleaching state)
    const negGrayGradient = defs.append('linearGradient')
      .attr('id', 'temp-neg-gray-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    negGrayGradient.append('stop').attr('offset', '0%').attr('stop-color', '#8B7355').attr('stop-opacity', 0.0);
    negGrayGradient.append('stop').attr('offset', '100%').attr('stop-color', '#8B7355').attr('stop-opacity', 0.25);

    // Vertical line path gradient for Heat
    const lineGradient = defs.append('linearGradient')
      .attr('id', 'temp-line-gradient')
      .attr('x1', '0%').attr('y1', '100%')
      .attr('x2', '0%').attr('y2', '0%'); // Vertical scale (bottom to top)
    lineGradient.append('stop').attr('offset', '0%').attr('stop-color', '#1E4D5C');  // Tide pool
    lineGradient.append('stop').attr('offset', '35%').attr('stop-color', '#2B7A78'); // Reef teal
    lineGradient.append('stop').attr('offset', '60%').attr('stop-color', '#C49A3C'); // Golden hour
    lineGradient.append('stop').attr('offset', '100%').attr('stop-color', '#B44D36'); // Terracotta

    defs.append('clipPath')
      .attr('id', 'temp-chart-clip')
      .append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('x', 0)
      .attr('y', 0);
      
    // Bioluminescent Glow Filter
    const glowFilter = defs.append('filter')
      .attr('id', 'bioluminescent-glow')
      .attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    glowFilter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'blur');
    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'blur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Clip path for x-axis to prevent ticks/numbers from sliding outside horizontal boundaries during zoom
    defs.append('clipPath')
      .attr('id', 'temp-x-axis-clip')
      .append('rect')
      .attr('x', 0)
      .attr('y', -5)
      .attr('width', innerWidth)
      .attr('height', margin.bottom + 10);

    // Clip path for milestones to prevent lines and text from sliding outside horizontal boundaries during zoom
    defs.append('clipPath')
      .attr('id', 'temp-milestone-clip')
      .append('rect')
      .attr('x', 0)
      .attr('y', -margin.top)
      .attr('width', innerWidth)
      .attr('height', innerHeight + margin.top);

    const stripeColor = (val: number) => d3.interpolateRdYlBu(1 - (val + 0.5) / 1.7); // Approximate mapping: cold=blue, hot=red

    // Initial Scales
    const xScale = d3.scaleLinear()
      .domain([1850, 2024])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([-0.8, 1.5]) // Cover temperature anomaly range
      .range([innerHeight, 0]);

    // Grid lines (Horizontal)
    const gridTicks = [-0.5, 0, 0.5, 1.0, 1.5];
    g.append('g')
      .attr('class', 'y-grid')
      .selectAll('line')
      .data(gridTicks)
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', d => d === 0 ? 'rgba(43, 122, 120, 0.25)' : 'rgba(232, 220, 200, 0.08)')
      .attr('stroke-width', d => d === 0 ? 1.5 : 1)
      .attr('stroke-dasharray', d => d === 0 ? 'none' : '4,4');

    // Baseline label
    g.append('text')
      .attr('x', innerWidth - 5)
      .attr('y', yScale(0) - 6)
      .attr('text-anchor', 'end')
      .attr('fill', 'rgba(43, 122, 120, 0.4)')
      .attr('font-size', '9.5px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('paint-order', 'stroke')
      .attr('stroke', '#0B1A2E')
      .attr('stroke-width', '3px')
      .attr('stroke-linejoin', 'round')
      .text('Pre-Industrial Baseline');

    // Axes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.format('d') as any)
      .ticks(width > 500 ? 10 : 5);

    const yAxis = d3.axisLeft(yScale)
      .tickValues(gridTicks)
      .tickFormat(d => `${(d as number) > 0 ? '+' : ''}${d}°C`);

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .attr('clip-path', 'url(#temp-x-axis-clip)')
      .call(xAxis)
      .call(g => g.select(".domain").remove()) // Hide axis line
      .selectAll('text')
      .attr('fill', 'rgba(232, 220, 200, 0.4)') // Dimmer text
      .attr('font-size', '10px')
      .attr('font-family', 'Inter');

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .call(g => g.select(".domain").remove()) // Hide axis line
      .selectAll('text')
      .attr('fill', 'rgba(232, 220, 200, 0.4)') // Dimmer text
      .attr('font-size', '10px')
      .attr('font-family', 'Inter');

    const dataGroup = g.append('g')
      .attr('clip-path', 'url(#temp-chart-clip)');

    // Warming Stripes (Background vertical bars) removed to avoid crowding

    // Generators
    const posArea = d3.area<TemperatureRecord>()
      .x(d => xScale(d.year))
      .y0(yScale(0))
      .y1(d => yScale(Math.max(0, d.anomaly)))
      .curve(d3.curveMonotoneX);

    const negArea = d3.area<TemperatureRecord>()
      .x(d => xScale(d.year))
      .y0(yScale(0))
      .y1(d => yScale(Math.min(0, d.anomaly)))
      .curve(d3.curveMonotoneX);

    const line = d3.line<TemperatureRecord>()
      .x(d => xScale(d.year))
      .y(d => yScale(d.anomaly))
      .curve(d3.curveMonotoneX);

    // Draw Areas
    dataGroup.append('path')
      .datum(data)
      .attr('class', 'area-pos')
      .attr('fill', 'url(#temp-pos-gradient)')
      .attr('d', posArea as any);

    dataGroup.append('path')
      .datum(data)
      .attr('class', 'area-neg')
      .attr('fill', 'url(#temp-neg-gradient)')
      .attr('d', negArea as any);

    // Draw Line
    dataGroup.append('path')
      .datum(data)
      .attr('class', 'temp-line')
      .attr('fill', 'none')
      .attr('stroke', 'url(#temp-line-gradient)')
      .attr('stroke-width', 2.5)
      .style('filter', 'url(#bioluminescent-glow)') // Add glow
      .attr('d', line as any);

    // Draw Milestones Group with Staggered Heights and Outlines, clipped horizontally
    const milestoneGroup = g.append('g')
      .attr('class', 'milestone-group')
      .attr('clip-path', 'url(#temp-milestone-clip)');

    milestones.forEach((m) => {
      const xPos = xScale(m.year);
      const mG = milestoneGroup.append('g')
        .attr('class', `milestone-${m.year}`)
        .attr('opacity', 0); // hidden initially

      // Milestone vertical lines removed to avoid crowding

      // Add a distinct intersection dot on the temperature line for each milestone
      const pt = data.find(d => d.year === m.year);
      if (pt) {
        const yVal = yScale(pt.anomaly);
        mG.append('circle')
          .attr('class', 'milestone-point')
          .attr('cx', xPos)
          .attr('cy', yVal)
          .attr('r', 5)
          .attr('fill', '#D4836A')
          .attr('stroke', '#0B1A2E')
          .attr('stroke-width', 1.5);
      }

      mG.append('text')
        .attr('class', 'hidden md:block')
        .attr('x', xPos + (m.align === 'start' ? 8 : -8))
        .attr('y', m.y) // Use staggered y to prevent overlapping text
        .attr('text-anchor', m.align)
        .attr('fill', '#D4836A')
        .attr('font-size', '9.5px')
        .attr('font-weight', 'bold')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('paint-order', 'stroke')
        .attr('stroke', '#0B1A2E')
        .attr('stroke-width', '3px')
        .attr('stroke-linejoin', 'round')
        .text(m.label);
    });

    // Draw Dots as flares
    dataGroup.selectAll('.temp-dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'temp-dot')
      .attr('cx', d => xScale(d.year))
      .attr('cy', d => yScale(d.anomaly))
      .attr('r', d => d.isElNino ? 6 : 3)
      .attr('fill', d => {
        if (d.isElNino) {
          return d.elNinoStrength === 'very-strong' ? '#B44D36' : '#C49A3C';
        }
        return d.anomaly > 0 ? '#D4A574' : '#1E4D5C';
      })
      .attr('stroke', 'none')
      .style('filter', 'url(#bioluminescent-glow)')
      .attr('opacity', 0.9)
      .style('cursor', 'pointer')
      .on('pointermove', function(event, d) {
        d3.select(this)
          .attr('r', 10)
          .attr('opacity', 1);
        handleMouseMove(event as unknown as MouseEvent, d);
      })
      .on('pointerleave', function(_, d) {
        d3.select(this)
          .attr('r', d.isElNino ? 6 : 3)
          .attr('opacity', 0.9);
        handleMouseLeave();
      });

    // Diamond markers for negative anomaly years (colorblind-safe shape differentiator)
    dataGroup.selectAll('.temp-dot-neg')
      .data(data.filter(d => d.anomaly < 0))
      .enter()
      .append('path')
      .attr('class', 'temp-dot-neg')
      .attr('d', d => {
        const cx = xScale(d.year);
        const cy = yScale(d.anomaly);
        const s = 4;
        return `M ${cx},${cy - s} L ${cx + s},${cy} L ${cx},${cy + s} L ${cx - s},${cy} Z`;
      })
      .attr('fill', '#1E4D5C')
      .attr('stroke', 'none')
      .attr('opacity', 0.7)
      .style('pointer-events', 'none');

    // Save refs for activeStep changes
    (svg.node() as any).__scales = { xScale, yScale, innerWidth, innerHeight, xAxis, yAxis, stripeColor };
  }, [handleMouseMove, handleMouseLeave, data]);

  // Handle Scroll-driven Active Step Changes (Zoom & Focus)
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    if (svg.empty()) return;

    const scales = (svg.node() as any).__scales;
    if (!scales) return;

    const { xScale, yScale, xAxis } = scales;
    const g = svg.select('.chart-group');

    // Interrupt all active transitions to prevent overlap during fast scrolling
    svg.selectAll('*').interrupt();

    // Transition settings based on activeStep
    const isZoomed = activeStep >= 1;
    const yearRange: [number, number] = isZoomed ? [1970, 2024] : [1850, 2024];

    xScale.domain(yearRange);

    const transitionDuration = 1500;
    const ease = d3.easeCubicOut;

    // Animate X Axis
    svg.select('.x-axis')
      .transition()
      .duration(transitionDuration)
      .ease(ease)
      .call(xAxis as any);

    // Redefine Generators
    const posArea = d3.area<TemperatureRecord>()
      .x(d => xScale(d.year))
      .y0(yScale(0))
      .y1(d => yScale(Math.max(0, d.anomaly)))
      .curve(d3.curveMonotoneX);

    const negArea = d3.area<TemperatureRecord>()
      .x(d => xScale(d.year))
      .y0(yScale(0))
      .y1(d => yScale(Math.min(0, d.anomaly)))
      .curve(d3.curveMonotoneX);

    const line = d3.line<TemperatureRecord>()
      .x(d => xScale(d.year))
      .y(d => yScale(d.anomaly))
      .curve(d3.curveMonotoneX);

    // Transition Area & Line Paths (Transition color/opacity directly, NO CSS filters to avoid trail glitches)
    const isBleached = activeStep >= 2;

    svg.select('.area-pos')
      .transition()
      .duration(transitionDuration)
      .ease(ease)
      .attr('fill', isBleached ? 'url(#temp-pos-gray-gradient)' : 'url(#temp-pos-gradient)')
      .attr('opacity', isBleached ? 0.35 : 1)
      .attr('d', posArea as any);

    svg.select('.area-neg')
      .transition()
      .duration(transitionDuration)
      .ease(ease)
      .attr('fill', isBleached ? 'url(#temp-neg-gray-gradient)' : 'url(#temp-neg-gradient)')
      .attr('opacity', isBleached ? 0.35 : 1)
      .attr('d', negArea as any);

    svg.select('.temp-line')
      .transition()
      .duration(transitionDuration)
      .ease(ease)
      .attr('stroke', isBleached ? '#5a6275' : 'url(#temp-line-gradient)')
      .attr('opacity', isBleached ? 0.45 : 1)
      .attr('d', line as any);

    // Transition Dots
    svg.selectAll('.temp-dot')
      .transition()
      .duration(transitionDuration)
      .ease(ease)
      .attr('cx', (d: any) => xScale(d.year))
      .attr('cy', (d: any) => yScale(d.anomaly))
      .attr('r', (d: any) => {
        if (isZoomed) {
          // Make dots larger and highly visible in the focused era
          return d.isElNino ? 6 : 4;
        }
        return d.isElNino ? 4.5 : 2.5;
      })
      .style('opacity', (d: any) => {
        if (isZoomed) {
          // Fade out historical pre-1970 data points so user focus is 100% on the modern era
          return d.year >= 1970 ? 1 : 0.05;
        }
        return 0.85;
      });

    // Transition Stripes and BLEACHING removed

    // Transition Milestone Lines
    milestones.forEach((m) => {
      const xPos = xScale(m.year);
      const mG = svg.select(`.milestone-${m.year}`);

      mG.transition()
        .duration(transitionDuration)
        .ease(ease)
        .attr('opacity', isZoomed && m.year >= 1970 ? 1 : 0);

      // Transition for vertical lines removed

      mG.select('.milestone-point')
        .transition()
        .duration(transitionDuration)
        .ease(ease)
        .attr('cx', xPos);

      mG.select('text')
        .transition()
        .duration(transitionDuration)
        .ease(ease)
        .attr('x', xPos + (m.align === 'start' ? 8 : -8));
    });

    // Handle Step 2 Specific Highlights (Coral Bleaching / Extreme El Nino) with text outlines
    g.selectAll('.bleaching-annotation').remove();

    if (activeStep >= 2) {
      // Use 1998 and 2016 which are the actual peak warming years in the Pacific dataset
      const extremeYears = [1998, 2016];
      
      extremeYears.forEach(year => {
        const xPos = xScale(year);
        const pt = data.find(d => d.year === year) || { anomaly: 0.5 };
        const yPos = yScale(pt.anomaly);

        const group = g.append('g')
          .attr('class', 'bleaching-annotation')
          .attr('clip-path', 'url(#temp-milestone-clip)')
          .attr('opacity', 0);

        // Pulsing ring
        group.append('circle')
          .attr('cx', xPos)
          .attr('cy', yPos)
          .attr('r', 15)
          .attr('fill', 'none')
          .attr('stroke', '#C49A3C')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '8,4');

        // Solid inner point to anchor exactly on the line
        group.append('circle')
          .attr('cx', xPos)
          .attr('cy', yPos)
          .attr('r', 5)
          .attr('fill', '#C49A3C')
          .attr('stroke', '#0B1A2E')
          .attr('stroke-width', 1.5);

        group.append('text')
          .attr('x', xPos)
          .attr('y', yPos - 25)
          .attr('text-anchor', 'middle')
          .attr('fill', '#C49A3C')
          .attr('font-size', '9.5px')
          .attr('font-weight', 'bold')
          .attr('font-family', 'JetBrains Mono, monospace')
          .attr('paint-order', 'stroke')
          .attr('stroke', '#0B1A2E')
          .attr('stroke-width', '3px')
          .attr('stroke-linejoin', 'round')
          .text(`Bleaching Event (${year})`);

        group.transition()
          .delay(transitionDuration)
          .duration(500)
          .attr('opacity', 1);
      });
    }

    // A11y Update
    let descText = "Line chart showing historic sea surface temperature anomalies.";
    if (activeStep === 1) descText = "Zoomed line chart showing rapidly rising sea surface temperature anomalies from 1970 to 2024, pushing past +1.2C.";
    if (activeStep === 2) descText = "Line chart highlighting extreme El Nino bleaching events in 1997 and 2015 amidst rising baseline temperatures.";
    
    if (svg.select('desc').empty()) {
      svg.append('desc').attr('id', 'temp-desc');
      svg.append('title').attr('id', 'temp-title').text('Temperature Anomaly Chart');
      svg.attr('role', 'img').attr('aria-labelledby', 'temp-title temp-desc');
    }
    svg.select('desc').text(descText);

  }, [activeStep, data]);

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-8">
        <div className="text-4xl mb-4">⚠</div>
        <p className="text-[#E8DCC8] font-['Playfair_Display'] text-lg mb-2">Data Temporarily Unavailable</p>
        <p className="text-[#D4A574] text-sm opacity-70">Please refresh the page to try again.</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full h-[350px] rounded-none bg-gradient-to-r from-[#0a1526] via-[#112240] to-[#0a1526] animate-pulse flex items-center justify-center">
        <p className="text-blue-200/50 font-body tracking-widest text-xs">LOADING TEMPERATURE DATA...</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <svg ref={svgRef} className="w-full overflow-visible" />
      <Tooltip {...tooltip} />
    </div>
  );
}
