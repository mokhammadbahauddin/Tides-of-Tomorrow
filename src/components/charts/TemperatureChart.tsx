import { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import type { TemperatureRecord } from '@/data/temperatureData';
import { Tooltip } from '@/components/Tooltip';

interface TemperatureChartProps {
  activeStep?: number;
}

interface Milestone {
  year: number;
  label: string;
  align: 'start' | 'end';
}

const milestones: Milestone[] = [
  { year: 1990, label: '1990: IPCC First Report', align: 'end' },
  { year: 2015, label: '2015: Paris Agreement (+1.5°C Target)', align: 'start' },
  { year: 2023, label: '2023: Global Record Heat', align: 'end' }
];

export default function TemperatureChart({ activeStep = 0 }: TemperatureChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, title: '', value: '', subtitle: '', color: '' });
  const width = 600;
  const height = 350;
  
  const [data, setData] = useState<TemperatureRecord[]>([]);

  useEffect(() => {
    d3.json<TemperatureRecord[]>('/data/temperature.json').then((res) => {
      if (res) setData(res);
    });
  }, []);

  const handleMouseMove = useCallback((event: MouseEvent, d: TemperatureRecord) => {
    let elNinoText = 'Neutral/La Niña';
    let dotColor = '#a8b2d1';
    
    if (d.isElNino) {
      if (d.elNinoStrength === 'very-strong') {
        elNinoText = 'Extreme El Niño';
        dotColor = '#e63946';
      } else if (d.elNinoStrength === 'strong') {
        elNinoText = 'Strong El Niño';
        dotColor = '#ff5a5f';
      } else {
        elNinoText = 'Moderate El Niño';
        dotColor = '#f59e0b';
      }
    } else if (d.anomaly < 0) {
      dotColor = '#00d4aa';
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
    posGradient.append('stop').attr('offset', '0%').attr('stop-color', '#e63946').attr('stop-opacity', 0.4);
    posGradient.append('stop').attr('offset', '100%').attr('stop-color', '#f59e0b').attr('stop-opacity', 0.0);

    // Negative Area Gradient (Cold Colors)
    const negGradient = defs.append('linearGradient')
      .attr('id', 'temp-neg-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    negGradient.append('stop').attr('offset', '0%').attr('stop-color', '#00d4aa').attr('stop-opacity', 0.0);
    negGradient.append('stop').attr('offset', '100%').attr('stop-color', '#3A7DFF').attr('stop-opacity', 0.4);

    // Vertical line path gradient for Heat
    const lineGradient = defs.append('linearGradient')
      .attr('id', 'temp-line-gradient')
      .attr('x1', '0%').attr('y1', '100%')
      .attr('x2', '0%').attr('y2', '0%'); // Vertical scale (bottom to top)
    lineGradient.append('stop').attr('offset', '0%').attr('stop-color', '#3A7DFF');  // Dark cold blue
    lineGradient.append('stop').attr('offset', '35%').attr('stop-color', '#00d4aa'); // Safe teal
    lineGradient.append('stop').attr('offset', '60%').attr('stop-color', '#f59e0b'); // Warm warning yellow
    lineGradient.append('stop').attr('offset', '100%').attr('stop-color', '#e63946'); // Critical hot red

    defs.append('clipPath')
      .attr('id', 'temp-chart-clip')
      .append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('x', 0)
      .attr('y', 0);

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
      .attr('stroke', d => d === 0 ? 'rgba(100, 255, 218, 0.25)' : 'rgba(168, 178, 209, 0.08)')
      .attr('stroke-width', d => d === 0 ? 1.5 : 1)
      .attr('stroke-dasharray', d => d === 0 ? 'none' : '4,4');

    // Baseline label
    g.append('text')
      .attr('x', innerWidth - 5)
      .attr('y', yScale(0) - 6)
      .attr('text-anchor', 'end')
      .attr('fill', 'rgba(100, 255, 218, 0.4)')
      .attr('font-size', '10px')
      .attr('font-family', 'JetBrains Mono, monospace')
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
      .call(xAxis)
      .selectAll('text')
      .attr('fill', '#a8b2d1')
      .attr('font-size', '11px')
      .attr('font-family', 'Inter');

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .attr('fill', '#a8b2d1')
      .attr('font-size', '11px')
      .attr('font-family', 'Inter');

    const dataGroup = g.append('g')
      .attr('clip-path', 'url(#temp-chart-clip)');

    // Draw Warming Stripes (Background)
    const stripeWidth = innerWidth / data.length;
    dataGroup.append('g')
      .attr('class', 'stripes-group')
      .selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'stripe')
      .attr('x', d => xScale(d.year) - stripeWidth / 2)
      .attr('y', 0)
      .attr('width', stripeWidth + 1) // +1 to overlap slightly and prevent gaps
      .attr('height', innerHeight)
      .attr('fill', d => stripeColor(d.anomaly))
      .attr('opacity', 0.2); // Semi-transparent initially

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
      .attr('d', line as any);

    // Draw Milestones Group
    const milestoneGroup = g.append('g').attr('class', 'milestone-group');
    milestones.forEach((m) => {
      const xPos = xScale(m.year);
      const mG = milestoneGroup.append('g')
        .attr('class', `milestone-${m.year}`)
        .attr('opacity', 0); // hidden initially

      mG.append('line')
        .attr('x1', xPos)
        .attr('x2', xPos)
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', 'rgba(230, 57, 70, 0.4)')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '3,3');

      mG.append('text')
        .attr('x', xPos + (m.align === 'start' ? 8 : -8))
        .attr('y', 15)
        .attr('text-anchor', m.align)
        .attr('fill', '#ff5a5f')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .attr('font-family', 'JetBrains Mono, monospace')
        .text(m.label);
    });

    // Draw Dots
    dataGroup.selectAll('.temp-dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'temp-dot')
      .attr('cx', d => xScale(d.year))
      .attr('cy', d => yScale(d.anomaly))
      .attr('r', d => d.isElNino ? 4.5 : 2.5)
      .attr('fill', d => {
        if (d.isElNino) {
          return d.elNinoStrength === 'very-strong' ? '#e63946' : '#f59e0b';
        }
        return d.anomaly > 0 ? '#ff8c00' : '#3A7DFF';
      })
      .attr('stroke', '#020c1b')
      .attr('stroke-width', 1)
      .attr('opacity', 0.85)
      .style('cursor', 'pointer')
      .on('pointermove', function(event, d) {
        d3.select(this)
          .attr('r', 8)
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 2)
          .attr('opacity', 1);
        handleMouseMove(event as unknown as MouseEvent, d);
      })
      .on('pointerleave', function(_, d) {
        d3.select(this)
          .attr('r', d.isElNino ? 4.5 : 2.5)
          .attr('stroke', '#020c1b')
          .attr('stroke-width', 1)
          .attr('opacity', 0.85);
        handleMouseLeave();
      });

    // Save refs for activeStep changes
    (svg.node() as any).__scales = { xScale, yScale, innerWidth, innerHeight, xAxis, yAxis, stripeColor, stripeWidth };
  }, [handleMouseMove, handleMouseLeave, data]);

  // Handle Scroll-driven Active Step Changes (Zoom & Focus)
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    if (svg.empty()) return;

    const scales = (svg.node() as any).__scales;
    if (!scales) return;

    const { xScale, yScale, xAxis, stripeColor, stripeWidth } = scales;

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

    // Transition Area & Line Paths
    svg.select('.area-pos')
      .transition()
      .duration(transitionDuration)
      .ease(ease)
      .attr('d', posArea as any);

    svg.select('.area-neg')
      .transition()
      .duration(transitionDuration)
      .ease(ease)
      .attr('d', negArea as any);

    svg.select('.temp-line')
      .transition()
      .duration(transitionDuration)
      .ease(ease)
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

    // Transition Stripes and implement BLEACHING
    const isBleached = activeStep >= 2;
    
    svg.selectAll('.stripe')
      .transition()
      .duration(transitionDuration)
      .ease(ease)
      .attr('x', (d: any) => xScale(d.year) - stripeWidth / 2)
      .attr('width', stripeWidth + 1)
      .attr('fill', (d: any) => {
        if (isBleached) {
          // Coral Bleaching Metaphor: Drain color to bone white
          return 'rgba(240, 240, 245, 0.4)'; 
        }
        return stripeColor(d.anomaly);
      })
      .attr('opacity', isBleached ? 0.6 : (isZoomed ? 0.4 : 0.2));

    // Desaturate chart elements during bleaching
    svg.select('.area-pos')
      .transition()
      .duration(transitionDuration)
      .ease(ease)
      .style('filter', isBleached ? 'grayscale(100%) opacity(0.3)' : 'none')
      .attr('d', posArea as any);

    svg.select('.temp-line')
      .transition()
      .duration(transitionDuration)
      .ease(ease)
      .style('filter', isBleached ? 'grayscale(100%) opacity(0.5)' : 'none')
      .attr('d', line as any);

    // Transition Milestone Lines
    milestones.forEach((m) => {
      const xPos = xScale(m.year);
      const mG = svg.select(`.milestone-${m.year}`);

      mG.transition()
        .duration(transitionDuration)
        .ease(ease)
        .attr('opacity', isZoomed && m.year >= 1970 ? 1 : 0);

      mG.select('line')
        .transition()
        .duration(transitionDuration)
        .ease(ease)
        .attr('x1', xPos)
        .attr('x2', xPos);

      mG.select('text')
        .transition()
        .duration(transitionDuration)
        .ease(ease)
        .attr('x', xPos + (m.align === 'start' ? 8 : -8));
    });

    // Handle Step 2 Specific Highlights (Coral Bleaching / Extreme El Nino)
    svg.selectAll('.bleaching-annotation').remove();

    if (activeStep >= 2) {
      const extremeYears = [1997, 2015];
      
      extremeYears.forEach(year => {
        const xPos = xScale(year);
        const pt = (svg.datum() as any[])?.find?.((d: any) => d.year === year) || { anomaly: 1.0 }; // Fallback
        const yPos = yScale(pt.anomaly || 1.0);

        const group = svg.append('g')
          .attr('class', 'bleaching-annotation')
          .attr('opacity', 0);

        group.append('circle')
          .attr('cx', xPos)
          .attr('cy', yPos)
          .attr('r', 15)
          .attr('fill', 'none')
          .attr('stroke', '#f59e0b')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '2,2');

        group.append('text')
          .attr('x', xPos)
          .attr('y', yPos - 25)
          .attr('text-anchor', 'middle')
          .attr('fill', '#f59e0b')
          .attr('font-size', '10px')
          .attr('font-weight', 'bold')
          .attr('font-family', 'JetBrains Mono, monospace')
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

  return (
    <div ref={containerRef} className="relative w-full">
      <svg ref={svgRef} className="w-full overflow-visible" />
      <Tooltip {...tooltip} />
    </div>
  );
}
