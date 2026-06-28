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
      .call(xAxis)
      .call(g => g.select(".domain").remove()) // Hide axis line
      .selectAll('text')
      .attr('fill', 'rgba(232, 220, 200, 0.4)')
      .attr('font-size', '10px');

    // Y axis
    const yAxis = d3.axisLeft(yScale).ticks(6);
    g.append('g')
      .attr('class', 'd3-axis')
      .call(yAxis)
      .call(g => g.select(".domain").remove()) // Hide axis line
      .selectAll('text')
      .attr('fill', 'rgba(232, 220, 200, 0.4)')
      .attr('font-size', '10px');

    // Zero line
    g.append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', yScale(0))
      .attr('y2', yScale(0))
      .attr('stroke', 'rgba(43, 122, 120, 0.3)') // reef-teal
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4');

    // Flooding Clip Path
    const clipId = 'flood-clip';
    const floodClip = svg.append('defs').append('clipPath').attr('id', clipId);
    
    floodClip.append('rect')
      .attr('class', 'flood-clip-rect')
      .attr('x', 0)
      .attr('y', innerHeight)
      .attr('width', innerWidth)
      .attr('height', 0);

    const floodGroup = g.append('g').attr('clip-path', `url(#${clipId})`);

    // Bioluminescent Glow Filter
    const glowFilter = svg.append('defs').append('filter')
      .attr('id', 'sl-bioluminescent-glow')
      .attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    glowFilter.append('feGaussianBlur').attr('stdDeviation', '5').attr('result', 'blur');
    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'blur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Area
    const areaGradient = svg.append('defs').append('linearGradient')
      .attr('id', 'sl-area-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    areaGradient.append('stop').attr('offset', '0%').attr('stop-color', '#2B7A78').attr('stop-opacity', 0.6); // reef-teal
    areaGradient.append('stop').attr('offset', '100%').attr('stop-color', '#0B1A2E').attr('stop-opacity', 0.0); // deep-ocean

    // Danger Area Gradient (Red/Orange)
    const dangerGradient = svg.append('defs').append('linearGradient')
      .attr('id', 'sl-danger-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    dangerGradient.append('stop').attr('offset', '0%').attr('stop-color', '#B44D36').attr('stop-opacity', 0.5); // terracotta
    dangerGradient.append('stop').attr('offset', '100%').attr('stop-color', '#B44D36').attr('stop-opacity', 0.15);

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
      .attr('stroke', '#2B7A78') // Highlight crest (reef-teal)
      .attr('stroke-width', 2.5)
      .style('filter', 'url(#sl-bioluminescent-glow)')
      .attr('d', line);

    // Dots as flares
    g.selectAll('.sl-dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'sl-dot')
      .attr('cx', d => xScale(d.year))
      .attr('cy', d => yScale(d.level))
      .attr('r', 0)
      .attr('fill', '#1E4D5C') // tide-pool
      .attr('stroke', 'none') 
      .style('filter', 'url(#sl-bioluminescent-glow)')
      .transition()
      .delay((_, i) => i * 30)
      .duration(500)
      .attr('r', 4);

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
      .attr('fill', 'url(#sl-danger-gradient)')
      .attr('d', dangerArea);

    // Threshold Line
    dangerGroup.append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', yScale(thresholdLevel))
      .attr('y2', yScale(thresholdLevel))
      .attr('stroke', '#B44D36') // terracotta
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '6,4');

    dangerGroup.append('text')
      .attr('x', 10)
      .attr('y', yScale(thresholdLevel) - 8)
      .attr('fill', '#B44D36')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('paint-order', 'stroke')
      .attr('stroke', '#0B1A2E')
      .attr('stroke-width', '3px')
      .attr('stroke-linejoin', 'round')
      .text('CRITICAL TIDE INUNDATION THRESHOLD');

    // Comparison Group for 1993 vs 2023 Net Rise
    const compGroup = g.append('g').attr('class', 'comparison-group').attr('opacity', 0);
    
    const y1993 = yScale(-19.05);
    const y2023 = yScale(104.76);
    const xMid = xScale(2006); // Middle area of the chart for the bracket

    // 1993 guide line
    compGroup.append('line')
      .attr('x1', xScale(1993))
      .attr('x2', xScale(2023))
      .attr('y1', y1993)
      .attr('y2', y1993)
      .attr('stroke', 'rgba(232, 220, 200, 0.35)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3');

    compGroup.append('text')
      .attr('x', xScale(1993) + 10)
      .attr('y', y1993 + 14)
      .attr('fill', '#8B7355') // drift-wood
      .attr('font-size', '9px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('paint-order', 'stroke')
      .attr('stroke', '#0B1A2E')
      .attr('stroke-width', '2.5px')
      .attr('stroke-linejoin', 'round')
      .text('1993 Level: -19.0 mm');

    // 2023 guide line
    compGroup.append('line')
      .attr('x1', xScale(1993))
      .attr('x2', xScale(2023))
      .attr('y1', y2023)
      .attr('y2', y2023)
      .attr('stroke', 'rgba(43, 122, 120, 0.35)') // reef-teal
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3');

    compGroup.append('text')
      .attr('x', xScale(1993) + 10)
      .attr('y', y2023 - 6)
      .attr('fill', '#2B7A78') // reef-teal
      .attr('font-size', '9px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('paint-order', 'stroke')
      .attr('stroke', '#0B1A2E')
      .attr('stroke-width', '2.5px')
      .attr('stroke-linejoin', 'round')
      .text('2023 Level: +104.8 mm');

    // Vertical height comparison bracket
    compGroup.append('line')
      .attr('x1', xMid)
      .attr('x2', xMid)
      .attr('y1', y1993)
      .attr('y2', y2023)
      .attr('stroke', '#2B7A78')
      .attr('stroke-width', 1.5);

    // Bracket top tick
    compGroup.append('line')
      .attr('x1', xMid - 5)
      .attr('x2', xMid + 5)
      .attr('y1', y2023)
      .attr('y2', y2023)
      .attr('stroke', '#2B7A78')
      .attr('stroke-width', 1.5);

    // Bracket bottom tick
    compGroup.append('line')
      .attr('x1', xMid - 5)
      .attr('x2', xMid + 5)
      .attr('y1', y1993)
      .attr('y2', y1993)
      .attr('stroke', '#2B7A78')
      .attr('stroke-width', 1.5);

    // Comparison label text
    const textBlock = compGroup.append('g')
      .attr('transform', `translate(${xMid + 12}, ${(y1993 + y2023) / 2})`);

    textBlock.append('text')
      .attr('x', 0)
      .attr('y', -6)
      .attr('fill', '#2B7A78')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('paint-order', 'stroke')
      .attr('stroke', '#0B1A2E')
      .attr('stroke-width', '3px')
      .attr('stroke-linejoin', 'round')
      .text('+123.8 mm Net Rise');

    textBlock.append('text')
      .attr('x', 0)
      .attr('y', 7)
      .attr('fill', '#8B7355')
      .attr('font-size', '9.5px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('paint-order', 'stroke')
      .attr('stroke', '#0B1A2E')
      .attr('stroke-width', '3px')
      .attr('stroke-linejoin', 'round')
      .text('(+12.4 cm in 30 years)');

    // Hover interaction
    const hoverLine = g.append('line')
      .attr('stroke', 'rgba(43, 122, 120, 0.5)')
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
      .attr('fill', '#8B7355')
      .attr('font-size', '11px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .text('Anomaly (mm)');

    // Store scales for reactive updates
    (svg.node() as any).__scales = { xScale, yScale, xAxis, innerWidth, innerHeight };

  }, [data]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    if (svg.empty()) return;

    const scales = (svg.node() as any).__scales;
    if (!scales) return;

    const { innerHeight } = scales;
    const dots = svg.selectAll('.sl-dot');
    
    // Clear previous annotations
    svg.selectAll('.acceleration-annotation').remove();

    // Select the flood clip rect
    const clipRect = svg.select('.flood-clip-rect');

      if (activeStep === 0) {
      // Step 0: Baseline rising flood clip (only show bottom 30%)
      clipRect.transition()
        .duration(1500)
        .ease(d3.easeCubicOut)
        .attr('y', innerHeight * 0.7)
        .attr('height', innerHeight * 0.3 + 50);

      svg.select('.danger-group').transition().duration(500).attr('opacity', 0);
      svg.select('.comparison-group').transition().duration(500).attr('opacity', 0);
      
      dots.transition().duration(500)
        .attr('r', 3)
        .attr('fill', '#1E4D5C');
    } else if (activeStep === 1) {
      // Step 1: Accelerated trend (Full flood + Comparison lines)
      clipRect.transition()
        .duration(2000)
        .ease(d3.easeCubicOut)
        .attr('y', -50)
        .attr('height', innerHeight + 50);

      svg.select('.danger-group').transition().duration(500).attr('opacity', 0);
      svg.select('.comparison-group').transition().duration(800).attr('opacity', 1);

      dots.transition().duration(500)
        .attr('r', 3)
        .attr('fill', '#1E4D5C');
    } else if (activeStep >= 2) {
      // Step 2: Saltwater intrusion (Danger Zone + Threshold line)
      clipRect.transition()
        .duration(1000)
        .ease(d3.easeCubicOut)
        .attr('y', -50)
        .attr('height', innerHeight + 50);

      svg.select('.danger-group').transition().duration(800).attr('opacity', 1);
      svg.select('.comparison-group').transition().duration(500).attr('opacity', 0.15); // dim it

      const thresholdLevel = (svg.node() as any).__threshold || 80;

      dots.transition().duration(500)
        .attr('r', (d: any) => d.level >= thresholdLevel ? 8 : 4)
        .attr('fill', (d: any) => d.level >= thresholdLevel ? '#B44D36' : '#1E4D5C');
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

  if (data.length === 0) {
    return (
      <div className="w-full h-[400px] rounded-none bg-gradient-to-r from-deep-ocean via-ocean-ink to-deep-ocean animate-pulse flex items-center justify-center">
        <p className="text-shell-white/50 font-body tracking-widest text-xs">LOADING SEA LEVEL DATA...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <svg ref={svgRef} className="w-full" />
      {tooltip.data && (
        <div
          className="chart-tooltip animate-fade-in-up"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="text-shell-white font-bold font-body">{tooltip.data.year}</div>
          <div className="text-reef-teal font-body">{tooltip.data.level > 0 ? '+' : ''}{tooltip.data.level} mm</div>
        </div>
      )}
    </div>
  );
}
