import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { type CropYieldData } from '@/data/cropYield';

interface Props {
  progress?: number;
}

export function CropYieldChart({ progress = 1 }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [cropYieldData, setCropYieldData] = useState<CropYieldData[]>([]);

  useEffect(() => {
    d3.json<CropYieldData[]>('/data/cropyield.json').then((res) => {
      if (res) setCropYieldData(res);
    });
  }, []);

  useEffect(() => {
    if (!svgRef.current || cropYieldData.length === 0) return;

    const width = 900;
    const height = 420;

    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Interrupt previous transitions
    svg.selectAll('*').interrupt();
    svg.selectAll('*').remove();

    const margin = { top: 30, right: 40, bottom: 80, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Data Processing: Average yield across all staples
    const processedData = cropYieldData.map(d => ({
      year: d.year,
      actualYield: (d.taro + d.sweetPotato + d.banana + d.cocoa) / 4
    }));

    // Calculate Expected Baseline (Linear regression of first 20 years, or just flat target)
    // For simplicity and impact, let's say the baseline was the peak historical average (~15 t/ha)
    const peakYield = d3.max(processedData, d => d.actualYield) || 15;
    const expectedData = processedData.map(d => ({
      year: d.year,
      expectedYield: peakYield,
      actualYield: d.actualYield,
      deficit: Math.max(0, peakYield - d.actualYield)
    }));

    // Scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(expectedData, d => d.year) as [number, number])
      .range([0, chartWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, peakYield + 2])
      .range([chartHeight, 0]);

    // Deficit Pattern/Gradient
    const defs = svg.append('defs');
    
    const deficitGradient = defs.append('linearGradient')
      .attr('id', 'deficit-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    deficitGradient.append('stop').attr('offset', '0%').attr('stop-color', '#e63946').attr('stop-opacity', 0.8);
    deficitGradient.append('stop').attr('offset', '100%').attr('stop-color', '#e63946').attr('stop-opacity', 0.2);

    const actualGradient = defs.append('linearGradient')
      .attr('id', 'actual-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    actualGradient.append('stop').attr('offset', '0%').attr('stop-color', '#f59e0b').attr('stop-opacity', 0.4);
    actualGradient.append('stop').attr('offset', '100%').attr('stop-color', '#f59e0b').attr('stop-opacity', 0.05);

    // Axes
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d') as any).ticks(10);
    const yAxis = d3.axisLeft(yScale).ticks(5);

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxis)
      .selectAll('text').attr('fill', '#a8b2d1');

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text').attr('fill', '#a8b2d1');

    g.selectAll('.domain, .tick line').attr('stroke', 'rgba(168, 178, 209, 0.2)');

    // Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -chartHeight / 2)
      .attr('y', -45)
      .attr('text-anchor', 'middle')
      .attr('fill', '#a8b2d1')
      .attr('font-size', '12px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .text('Average Yield (t/ha)');

    // Areas
    const actualArea = d3.area<any>()
      .x(d => xScale(d.year))
      .y0(chartHeight)
      .y1(d => yScale(d.actualYield))
      .curve(d3.curveMonotoneX);

    const deficitArea = d3.area<any>()
      .x(d => xScale(d.year))
      .y0(d => yScale(d.actualYield)) // Bottom is actual
      .y1(d => yScale(d.expectedYield)) // Top is expected
      .curve(d3.curveMonotoneX);

    // Draw Actual Yield Area
    g.append('path')
      .datum(expectedData)
      .attr('fill', 'url(#actual-gradient)')
      .attr('d', actualArea);

    // Draw Deficit Area (The scary part)
    const deficitPath = g.append('path')
      .datum(expectedData)
      .attr('fill', 'url(#deficit-gradient)')
      .attr('d', deficitArea)
      .attr('opacity', 0); // Hide initially

    // Draw Expected Yield Baseline
    g.append('line')
      .attr('x1', 0)
      .attr('x2', chartWidth)
      .attr('y1', yScale(peakYield))
      .attr('y2', yScale(peakYield))
      .attr('stroke', '#a8b2d1')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5');

    g.append('text')
      .attr('x', chartWidth - 10)
      .attr('y', yScale(peakYield) - 10)
      .attr('text-anchor', 'end')
      .attr('fill', '#a8b2d1')
      .attr('font-size', '12px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .text('Historical Baseline / Expected Target');

    // Draw Actual Yield Line
    const actualLine = d3.line<any>()
      .x(d => xScale(d.year))
      .y(d => yScale(d.actualYield))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(expectedData)
      .attr('fill', 'none')
      .attr('stroke', '#f59e0b')
      .attr('stroke-width', 3)
      .attr('d', actualLine);

    // Animation & Narrative States based on progress/activeStep
    // If progress > 0.5 (Step 2), we reveal the deficit area
    if (progress > 0.5) {
      deficitPath.transition()
        .duration(1500)
        .ease(d3.easeCubicOut)
        .attr('opacity', 1);

      // Add pulsing animation to deficit area
      const pulse = () => {
        deficitPath.transition()
          .duration(2000)
          .attr('opacity', 0.6)
          .transition()
          .duration(2000)
          .attr('opacity', 1)
          .on('end', pulse);
      };
      pulse();

      // Add Annotation for Missing Food
      const midX = xScale(2010);
      const midY = yScale(peakYield - (peakYield - expectedData.find(d => d.year === 2010)!.actualYield) / 2);
      
      const annotation = g.append('g')
        .attr('opacity', 0);
        
      annotation.append('text')
        .attr('x', midX)
        .attr('y', midY)
        .attr('text-anchor', 'middle')
        .attr('fill', '#ffffff')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('font-family', 'JetBrains Mono, monospace')
        .text('MISSING YIELD / DEFICIT');
        
      annotation.transition()
        .delay(1000)
        .duration(1000)
        .attr('opacity', 1);
    }

    // A11y Update
    let descText = "Area chart showing Pacific staple crop yields over time.";
    if (progress > 0.5) descText = "Divergence area chart highlighting a massive, pulsing red deficit between expected historical yields and actual failing crop yields.";
    
    if (svg.select('desc').empty()) {
      svg.append('desc').attr('id', 'crop-desc');
      svg.append('title').attr('id', 'crop-title').text('Crop Yield Deficit Chart');
      svg.attr('role', 'img').attr('aria-labelledby', 'crop-title crop-desc');
    }
    svg.select('desc').text(descText);

  }, [progress, cropYieldData]);

  return (
    <div ref={containerRef} className="w-full" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <svg ref={svgRef} className="w-full" />
    </div>
  );
}
