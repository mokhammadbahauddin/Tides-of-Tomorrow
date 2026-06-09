import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

interface SeaLevelRecord {
  year: number;
  level: number;
}

interface SeaLevelChartProps {
  activeStep?: number;
}

export default function SeaLevelChart({ activeStep = 0 }: SeaLevelChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: SeaLevelRecord | null }>({ x: 0, y: 0, data: null });
  const [data, setData] = useState<SeaLevelRecord[]>([]);
  
  const width = 800;
  const height = 400;

  useEffect(() => {
    d3.json<SeaLevelRecord[]>('/data/sealevel.json').then((res) => {
      if (res) setData(res);
    });
  }, []);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;
    const svg = d3.select(svgRef.current);
    if (svg.empty()) return;
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.attr('viewBox', `0 0 ${width} ${height}`)
       .attr('preserveAspectRatio', 'xMidYMid meet');

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.year) as [number, number])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([Math.min(0, d3.min(data, d => d.level) || 0) - 10, (d3.max(data, d => d.level) || 100) + 20])
      .range([innerHeight, 0]);

    // Gridlines
    const yGrid = d3.axisLeft(yScale)
      .tickSize(-innerWidth)
      .tickFormat('' as any)
      .ticks(6);
    g.append('g').attr('class', 'd3-grid').call(yGrid);

    // X axis
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.format('d') as any)
      .ticks(7);
    g.append('g')
      .attr('class', 'd3-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    // Y axis
    const yAxis = d3.axisLeft(yScale).ticks(6);
    g.append('g').attr('class', 'd3-axis').call(yAxis);

    // Zero line
    g.append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', yScale(0))
      .attr('y2', yScale(0))
      .attr('stroke', 'rgba(100, 255, 218, 0.3)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4');

    // Flooding Clip Path
    const clipId = 'flood-clip';
    const floodClip = svg.append('defs').append('clipPath').attr('id', clipId);
    
    floodClip.append('rect')
      .attr('x', 0)
      .attr('y', innerHeight)
      .attr('width', innerWidth)
      .attr('height', 0)
      .transition()
      .duration(2500) // Flood animation
      .ease(d3.easeCubicOut)
      .attr('y', -50) // Allow overflow for dots
      .attr('height', innerHeight + 50);

    const floodGroup = g.append('g').attr('clip-path', `url(#${clipId})`);

    // Area
    const areaGradient = svg.append('defs').append('linearGradient')
      .attr('id', 'sl-area-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    areaGradient.append('stop').attr('offset', '0%').attr('stop-color', '#3A7DFF').attr('stop-opacity', 0.6);
    areaGradient.append('stop').attr('offset', '100%').attr('stop-color', '#0a1622').attr('stop-opacity', 0.0);

    const area = d3.area<SeaLevelRecord>()
      .x(d => xScale(d.year))
      .y0(innerHeight)
      .y1(d => yScale(d.level))
      .curve(d3.curveMonotoneX);

    floodGroup.append('path')
      .datum(data)
      .attr('fill', 'url(#sl-area-gradient)')
      .attr('d', area);

    // Line
    const line = d3.line<SeaLevelRecord>()
      .x(d => xScale(d.year))
      .y(d => yScale(d.level))
      .curve(d3.curveMonotoneX);

    floodGroup.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#64ffda') // Highlight crest
      .attr('stroke-width', 2.5)
      .attr('d', line);

    // Dots
    g.selectAll('.sl-dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'sl-dot')
      .attr('cx', d => xScale(d.year))
      .attr('cy', d => yScale(d.level))
      .attr('r', 0)
      .attr('fill', '#3A7DFF')
      .attr('stroke', '#020c1b')
      .attr('stroke-width', 1.5)
      .transition()
      .delay((_, i) => i * 30)
      .duration(500)
      .attr('r', 3);

    // Danger Threshold Group (Hidden initially)
    const thresholdLevel = 80; // mm anomaly threshold for inundation
    (svg.node() as any).__threshold = thresholdLevel;

    const dangerGroup = g.append('g').attr('class', 'danger-group').attr('opacity', 0);
    
    // Danger Area definition
    const dangerArea = d3.area<SeaLevelRecord>()
      .x(d => xScale(d.year))
      .y0(yScale(thresholdLevel))
      .y1(d => yScale(Math.max(thresholdLevel, d.level)))
      .curve(d3.curveMonotoneX);

    dangerGroup.append('path')
      .datum(data)
      .attr('fill', 'url(#temp-pos-gradient)') // Or a solid toxic red if gradient is missing
      .style('fill', 'rgba(230, 57, 70, 0.4)')
      .attr('d', dangerArea);

    // Threshold Line
    dangerGroup.append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', yScale(thresholdLevel))
      .attr('y2', yScale(thresholdLevel))
      .attr('stroke', '#e63946')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '6,4');

    dangerGroup.append('text')
      .attr('x', 10)
      .attr('y', yScale(thresholdLevel) - 8)
      .attr('fill', '#e63946')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'JetBrains Mono, monospace')
      .text('CRITICAL TIDE INUNDATION THRESHOLD');

    // Hover interaction
    const hoverLine = g.append('line')
      .attr('stroke', 'rgba(100, 255, 218, 0.5)')
      .attr('stroke-width', 1)
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .style('opacity', 0);

    const overlay = g.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair');

    overlay
      .on('pointermove', function(event) {
        const [mx] = d3.pointer(event);
        const year = Math.round(xScale.invert(mx));
        const dataPoint = data.find(d => d.year === year);
        if (dataPoint) {
          const x = xScale(dataPoint.year);
          hoverLine.attr('x1', x).attr('x2', x).style('opacity', 1);
          const rect = svgRef.current!.getBoundingClientRect();
          setTooltip({
            x: event.clientX - rect.left + 15,
            y: event.clientY - rect.top - 40,
            data: dataPoint,
          });
        }
      })
      .on('pointerleave', () => {
        hoverLine.style('opacity', 0);
        setTooltip({ x: 0, y: 0, data: null });
      });

    // Y-axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -40)
      .attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', '#a8b2d1')
      .attr('font-size', '11px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .text('Anomaly (mm)');

    // Store scales for reactive updates
    (svg.node() as any).__scales = { xScale, yScale, xAxis };

  }, [data]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    if (svg.empty()) return;
    const dots = svg.selectAll('.sl-dot');
    
    // Clear previous annotations
    svg.selectAll('.acceleration-annotation').remove();

    if (activeStep === 1) {
      // Step 1: Normal display
      svg.select('.danger-group').transition().duration(500).attr('opacity', 0);
      dots.transition().duration(500)
        .attr('r', 3)
        .attr('fill', '#3A7DFF');
    } else if (activeStep >= 2) {
      // Step 2: Show Freshwater Contamination Threshold
      svg.select('.danger-group').transition().duration(800).attr('opacity', 1);
      
      const thresholdLevel = (svg.node() as any).__threshold || 80;

      dots.transition().duration(500)
        .attr('r', (d: any) => d.level >= thresholdLevel ? 6 : 3)
        .attr('fill', (d: any) => d.level >= thresholdLevel ? '#e63946' : '#3A7DFF');
    } else {
      svg.select('.danger-group').transition().duration(500).attr('opacity', 0);
      dots.transition().duration(500)
        .attr('r', 3)
        .attr('fill', '#3A7DFF');
    }

    // A11y Update
    let descText = "Area chart showing sea level anomalies.";
    if (activeStep === 1) descText = "Area chart showing sea level anomalies rising steadily to 4.5 millimeters per year in the tropical Pacific.";
    if (activeStep === 2) descText = "Area chart highlighting a rapid acceleration in sea level rise from 2010 onwards, driving saltwater intrusion.";
    
    if (svg.select('desc').empty()) {
      svg.append('desc').attr('id', 'sl-desc');
      svg.append('title').attr('id', 'sl-title').text('Sea Level Anomaly Chart');
      svg.attr('role', 'img').attr('aria-labelledby', 'sl-title sl-desc');
    }
    svg.select('desc').text(descText);

  }, [activeStep, data]);

  return (
    <div className="relative">
      <svg ref={svgRef} className="w-full" />
      {tooltip.data && (
        <div
          className="chart-tooltip"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="text-[#e6f1ff] font-bold">{tooltip.data.year}</div>
          <div className="text-[#3A7DFF]">{tooltip.data.level > 0 ? '+' : ''}{tooltip.data.level} mm</div>
        </div>
      )}
    </div>
  );
}
