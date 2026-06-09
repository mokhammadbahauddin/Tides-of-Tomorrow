import { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import type { TaxData } from '@/data/cropYield';
import { Tooltip } from '@/components/Tooltip';

interface TaxChartProps {
  activeStep?: number;
}

export default function TaxChart({ activeStep = 0 }: TaxChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, title: '', value: '', subtitle: '' });
  const [taxData, setTaxData] = useState<TaxData[]>([]);
  const width = 600;
  const height = 350;

  useEffect(() => {
    d3.json<TaxData[]>('/data/taxes.json').then((res) => {
      if (res) setTaxData(res);
    });
  }, []);

  const handleMouseMove = useCallback((event: MouseEvent, year: number, val: number) => {
    setTooltip({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      title: 'Fiji Environmental Tax',
      value: `${val.toFixed(2)}% of GDP`,
      subtitle: `Year ${year}`,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltip(prev => ({ ...prev, visible: false }));
  }, []);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    if (svg.empty() || taxData.length === 0) return;
    svg.selectAll('*').remove();

    svg.attr('viewBox', `0 0 ${width} ${height}`)
       .attr('preserveAspectRatio', 'xMidYMid meet');

    const margin = { top: 30, right: 30, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Process Data: Cumulative Sum
    let runningTotal = 0;
    const cumulativeData = taxData.map(d => {
      runningTotal += d.taxPercent;
      return { ...d, cumulativeTax: runningTotal };
    });

    const xScale = d3.scaleLinear()
      .domain(d3.extent(cumulativeData, d => d.year) as [number, number])
      .range([0, innerWidth]);

    const defaultMax = d3.max(cumulativeData, d => d.cumulativeTax) || 10;
    const yScale = d3.scaleLinear()
      .domain([0, defaultMax])
      .range([innerHeight, 0]);

    // Grid
    g.append('g')
      .attr('class', 'd3-grid')
      .call(d3.axisLeft(yScale).tickSize(-innerWidth).tickFormat('' as any).ticks(5));

    // Axes
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d') as any).ticks(5);
    g.append('g')
      .attr('class', 'd3-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    g.append('g')
      .attr('class', 'd3-axis-y')
      .call(d3.axisLeft(yScale).ticks(5));

    // Left-to-right Clip Path for Animation
    const clipId = 'tax-clip';
    const clipPath = svg.append('defs').append('clipPath').attr('id', clipId);
    clipPath.append('rect')
      .attr('class', 'tax-clip-rect')
      .attr('x', 0).attr('y', -1000) // Allow massive vertical overflow
      .attr('width', 0).attr('height', innerHeight + 1040);

    const chartGroup = g.append('g').attr('clip-path', `url(#${clipId})`);

    // The "Injustice" Comparison Background (Hidden in Step 0)
    const comparisonGroup = g.append('g').attr('class', 'injustice-group').attr('opacity', 0);
    
    // Global North Bar
    comparisonGroup.append('rect')
      .attr('x', 0)
      .attr('y', 20)
      .attr('width', innerWidth)
      .attr('height', 30)
      .attr('fill', '#112240')
      .attr('stroke', '#e63946')
      .attr('stroke-width', 1);

    comparisonGroup.append('text')
      .attr('x', 10)
      .attr('y', 40)
      .attr('fill', '#e63946')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'Inter')
      .text('GLOBAL NORTH HISTORICAL EMISSIONS (G20)');

    // Pacific Islands Bar (Microscopic)
    comparisonGroup.append('rect')
      .attr('x', 0)
      .attr('y', 60)
      .attr('width', 2) // Literally 2 pixels wide to emphasize insignificance
      .attr('height', 10)
      .attr('fill', '#64ffda');

    comparisonGroup.append('text')
      .attr('x', 10)
      .attr('y', 69)
      .attr('fill', '#64ffda')
      .attr('font-size', '10px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .text('Pacific Nations Historical Emissions (< 0.03%)');

    // Area Gradient
    const areaGradient = svg.append('defs').append('linearGradient')
      .attr('id', 'tax-area-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    areaGradient.append('stop').attr('offset', '0%').attr('stop-color', '#f8765c').attr('stop-opacity', 0.8);
    areaGradient.append('stop').attr('offset', '100%').attr('stop-color', '#f8765c').attr('stop-opacity', 0.1);

    const area = d3.area<any>()
      .x(d => xScale(d.year))
      .y0(innerHeight)
      .y1(d => yScale(d.cumulativeTax))
      .curve(d3.curveMonotoneX);

    chartGroup.append('path')
      .attr('class', 'tax-area')
      .datum(cumulativeData)
      .attr('fill', 'url(#tax-area-gradient)')
      .attr('d', area as any);

    const line = d3.line<any>()
      .x(d => xScale(d.year))
      .y(d => yScale(d.cumulativeTax))
      .curve(d3.curveMonotoneX);

    chartGroup.append('path')
      .attr('class', 'tax-line')
      .datum(cumulativeData)
      .attr('fill', 'none')
      .attr('stroke', '#ff9e87')
      .attr('stroke-width', 3)
      .attr('d', line as any);

    // Dots
    chartGroup.selectAll('.tax-dot')
      .data(cumulativeData)
      .enter()
      .append('circle')
      .attr('class', 'tax-dot')
      .attr('cx', d => xScale(d.year))
      .attr('cy', d => yScale(d.cumulativeTax))
      .attr('r', 4)
      .attr('fill', '#f8765c')
      .on('pointermove', function(event, d) {
        d3.select(this).attr('r', 6);
        handleMouseMove(event as unknown as MouseEvent, d.year, d.cumulativeTax);
      })
      .on('pointerleave', function() {
        d3.select(this).attr('r', 4);
        handleMouseLeave();
      });

    // Y label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -40)
      .attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', '#a8b2d1')
      .attr('font-size', '10px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .text('Cumulative Env. Tax (% of GDP)');

    (svg.node() as any).__scales = { xScale, yScale, xAxis, innerWidth, defaultMax, area, line, cumulativeData, innerHeight };
  }, [handleMouseMove, handleMouseLeave, taxData]);

  // Reactive Update Loop
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    if (svg.empty()) return;

    const scales = (svg.node() as any).__scales;
    if (!scales) return;

    if (activeStep >= 1) {
      svg.select('.tax-clip-rect')
        .transition()
        .delay(200)
        .duration(2500)
        .ease(d3.easeCubicOut)
        .attr('width', scales.innerWidth);
        
      // Show Injustice Comparison
      svg.select('.injustice-group').transition().duration(1500).attr('opacity', 1);

    } else {
      svg.select('.tax-clip-rect')
        .transition().duration(500)
        .attr('width', 0);
        
      svg.select('.injustice-group').transition().duration(500).attr('opacity', 0);
    }

    // A11y Update
    let descText = "Line chart showing Fiji environmental and climate adaptation tax revenues as a percentage of GDP.";
    if (activeStep >= 1) descText = "Line chart animating to show Fiji environmental tax revenues rising as a percentage of GDP over time due to climate adaptation costs.";
    
    if (svg.select('desc').empty()) {
      svg.append('desc').attr('id', 'tax-desc');
      svg.append('title').attr('id', 'tax-title').text('Environmental Tax Chart');
      svg.attr('role', 'img').attr('aria-labelledby', 'tax-title tax-desc');
    }
    svg.select('desc').text(descText);

  }, [activeStep, taxData]);

  return (
    <div ref={containerRef} className="relative w-full">
      <svg ref={svgRef} className="w-full" />
      <Tooltip {...tooltip} />
    </div>
  );
}
