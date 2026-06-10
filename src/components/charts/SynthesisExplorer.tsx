import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { synthesisMergedData } from '@/data/synthesisMergedData';
import type { SynthesisMergedRecord } from '@/data/synthesisMergedData';

export const SynthesisExplorer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [xMetric, setXMetric] = useState<'temperature' | 'sealevel' | 'rainfall'>('temperature');
  const [yMetric, setYMetric] = useState<'taro' | 'tax'>('taro');
  const [year, setYear] = useState(1993);
  const [isPlaying, setIsPlaying] = useState(false);

  const mergedData = synthesisMergedData;

  // Calculate Correlation
  const correlation = useMemo(() => {
    const xs = mergedData.map(d => d[xMetric]);
    const ys = mergedData.map(d => d[yMetric]);
    const n = xs.length;
    const sumX = d3.sum(xs);
    const sumY = d3.sum(ys);
    const sumXY = d3.sum(xs.map((x, i) => x * ys[i]));
    const sumX2 = d3.sum(xs.map(x => x * x));
    const sumY2 = d3.sum(ys.map(y => y * y));
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    return denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;
  }, [mergedData, xMetric, yMetric]);

  // Play animation effect
  useEffect(() => {
    if (!isPlaying) return;
    
    // Check if we reached the end
    if (year >= 2050) {
      setIsPlaying(false);
      return;
    }

    const interval = setInterval(() => {
      setYear(prev => {
        // Find the next available year in the dataset
        const nextData = mergedData.find(d => d.year > prev);
        if (!nextData || nextData.year >= 2050) {
          setIsPlaying(false);
          return 2050;
        }
        return nextData.year;
      });
    }, 1000); // 1 second per step
    
    return () => clearInterval(interval);
  }, [isPlaying, year, mergedData]);

  // D3 Chart rendering
  useEffect(() => {
    if (!containerRef.current || mergedData.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 500;
    const margin = { top: 30, right: 40, bottom: 50, left: 60 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    d3.select(container).select('svg').remove(); // Clear previous

    const svg = d3.select(container).append('svg')
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const xDomain = d3.extent(mergedData, d => d[xMetric]) as [number, number];
    const yDomain = d3.extent(mergedData, d => d[yMetric]) as [number, number];

    const xPad = (xDomain[1] - xDomain[0]) * 0.05;
    const yPad = (yDomain[1] - yDomain[0]) * 0.05;

    const x = d3.scaleLinear().domain([xDomain[0] - xPad, xDomain[1] + xPad]).range([0, innerW]);
    const y = d3.scaleLinear().domain([yDomain[0] - yPad, yDomain[1] + yPad]).range([innerH, 0]);
    
    // Danger Zone Definition (Visualizing the 2030+ projection area)
    const dangerZoneThresholdX = mergedData.find(d => d.year === 2030)![xMetric];
    
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'danger-gradient-explore')
      .attr('x1', '0%').attr('y1', '100%')
      .attr('x2', '100%').attr('y2', '0%');
    
    gradient.append('stop').attr('offset', '0%').attr('stop-color', 'rgba(230, 57, 70, 0.05)');
    gradient.append('stop').attr('offset', '100%').attr('stop-color', 'rgba(230, 57, 70, 0.3)');

    // Only draw danger zone if threshold is within domain
    if (x(dangerZoneThresholdX) < innerW) {
       // Note: Depending on correlation (positive vs negative), the danger zone might be on left or right.
       // E.g. rainfall drops (negative correlation), danger is on the left.
       const isNegativeX = xDomain[1] < 0; 
       const startX = isNegativeX ? 0 : x(dangerZoneThresholdX);
       const dangerWidth = isNegativeX ? x(dangerZoneThresholdX) : innerW - x(dangerZoneThresholdX);

       g.append('rect')
         .attr('x', startX)
         .attr('y', 0)
         .attr('width', dangerWidth)
         .attr('height', innerH)
         .style('fill', 'url(#danger-gradient-explore)')
         .style('opacity', 0.8);
         
       g.append('text')
         .attr('x', isNegativeX ? startX + 10 : innerW - 10)
         .attr('y', 20)
         .attr('text-anchor', isNegativeX ? 'start' : 'end')
         .style('fill', '#e63946')
         .style('font-family', 'Inter')
         .style('font-size', '14px')
         .style('font-weight', 'bold')
         .style('opacity', 0.7)
         .text('CRITICAL DANGER ZONE');
    }

    // Gridlines
    g.append('g')
      .selectAll('line')
      .data(x.ticks(8))
      .enter()
      .append('line')
      .attr('x1', d => x(d)).attr('x2', d => x(d))
      .attr('y1', 0).attr('y2', innerH)
      .attr('stroke', 'rgba(168, 178, 209, 0.1)')
      .attr('stroke-width', 0.5)
      .attr('stroke-dasharray', '2,3');

    g.append('g')
      .selectAll('line')
      .data(y.ticks(6))
      .enter()
      .append('line')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', d => y(d)).attr('y2', d => y(d))
      .attr('stroke', 'rgba(168, 178, 209, 0.1)')
      .attr('stroke-width', 0.5)
      .attr('stroke-dasharray', '2,3');

    // Axes
    const xLabel = xMetric === 'temperature' ? 'Temperature Anomaly (°C)' :
      xMetric === 'sealevel' ? 'Sea Level Rise (mm)' : 'Rainfall Anomaly (%)';
    const yLabel = yMetric === 'taro' ? 'Taro Yield (t/ha)' : 'Environmental Tax (% GDP)';

    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(x).ticks(6))
      .call(gAxis => gAxis.select('.domain').attr('stroke', 'rgba(168, 178, 209, 0.2)'))
      .call(gAxis => gAxis.selectAll('.tick text').attr('fill', '#a8b2d1').attr('font-family', 'Inter').attr('font-size', '10px'));

    g.append('text')
      .attr('x', innerW / 2).attr('y', innerH + 35)
      .attr('text-anchor', 'middle')
      .text(xLabel)
      .attr('fill', '#a8b2d1')
      .attr('font-family', 'Inter')
      .attr('font-size', '12px');

    g.append('g')
      .call(d3.axisLeft(y).ticks(6))
      .call(gAxis => gAxis.select('.domain').remove())
      .call(gAxis => gAxis.selectAll('.tick line').remove())
      .call(gAxis => gAxis.selectAll('.tick text').attr('fill', '#a8b2d1').attr('font-family', 'Inter').attr('font-size', '10px'));

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerH / 2).attr('y', -45)
      .attr('text-anchor', 'middle')
      .text(yLabel)
      .attr('fill', '#a8b2d1')
      .attr('font-family', 'Inter')
      .attr('font-size', '12px');

    // Trend line calculation
    const xMean = d3.mean(mergedData, d => d[xMetric])!;
    const yMean = d3.mean(mergedData, d => d[yMetric])!;
    const slope = d3.sum(mergedData.map(d => (d[xMetric] - xMean) * (d[yMetric] - yMean))) /
      d3.sum(mergedData.map(d => (d[xMetric] - xMean) ** 2));
    const intercept = yMean - slope * xMean;

    const trendX = [xDomain[0] - xPad, xDomain[1] + xPad];
    const trendY = trendX.map(xv => slope * xv + intercept);

    g.append('line')
      .attr('x1', x(trendX[0])).attr('x2', x(trendX[1]))
      .attr('y1', y(trendY[0])).attr('y2', y(trendY[1]))
      .attr('stroke', '#f59e0b')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '6,3')
      .attr('opacity', 0.5);

    // Filter points up to current year
    const visibleData = mergedData.filter(d => d.year <= year);

    // Draw connecting path up to current year
    const lineGen = d3.line<SynthesisMergedRecord>()
      .x(d => x(d[xMetric]))
      .y(d => y(d[yMetric]))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(visibleData)
      .attr('fill', 'none')
      .attr('stroke', '#64ffda')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,4')
      .attr('opacity', 0.5)
      .attr('d', lineGen);

    // Dots
    const dots = g.selectAll('.dot')
      .data(visibleData, (d: any) => d.year);

    dots.enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(d[xMetric]))
      .attr('cy', d => y(d[yMetric]))
      .attr('r', 0)
      .attr('fill', d => d.isProjection ? 'rgba(230, 57, 70, 0.8)' : 'rgba(100, 255, 218, 0.8)')
      .attr('stroke', d => d.isProjection ? '#e63946' : '#64ffda')
      .attr('stroke-width', 1.5)
      .merge(dots as any)
      .transition()
      .duration(400)
      .ease(d3.easeBackOut.overshoot(1.7))
      .attr('r', 6);

    dots.exit().remove();

    // Highlight current year with a pulsing halo
    const currentData = visibleData.filter(d => d.year === year);
    
    g.selectAll('.current-dot-halo').remove();
    g.selectAll('.current-dot-label').remove();

    g.selectAll('.current-dot-halo')
      .data(currentData)
      .enter()
      .append('circle')
      .attr('class', 'current-dot-halo animate-d3-halo')
      .attr('cx', d => x(d[xMetric]))
      .attr('cy', d => y(d[yMetric]))
      .attr('fill', 'none')
      .attr('stroke', '#f59e0b');
      
    // Text label for current year
    g.selectAll('.current-dot-label')
      .data(currentData)
      .enter()
      .append('text')
      .attr('class', 'current-dot-label')
      .attr('x', d => x(d[xMetric]))
      .attr('y', d => y(d[yMetric]) - 15)
      .attr('text-anchor', 'middle')
      .attr('fill', '#e6f1ff')
      .attr('font-family', 'Inter')
      .attr('font-weight', 'bold')
      .attr('font-size', '12px')
      .text(d => d.year);

    // Tooltip
    const tooltip = d3.select(container).select('.glass-tooltip').node() 
      ? d3.select(container).select('.glass-tooltip')
      : d3.select(container).append('div')
        .attr('class', 'glass-tooltip')
        .style('position', 'absolute')
        .style('opacity', 0)
        .style('pointer-events', 'none')
        .style('z-index', 10)
        .style('background', 'rgba(2, 12, 27, 0.85)')
        .style('border', '1px solid rgba(100, 255, 218, 0.2)')
        .style('backdrop-filter', 'blur(8px)')
        .style('padding', '12px')
        .style('border-radius', '8px')
        .style('color', '#e6f1ff')
        .style('font-family', 'Inter')
        .style('font-size', '12px');

    g.selectAll('.dot')
      .on('mousemove', function (event: any, d: any) {
        tooltip
          .style('left', (event.pageX + 15) + 'px')
          .style('top', (event.pageY - 40) + 'px')
          .style('opacity', 1)
          .html(`
            <div class="font-bold text-sm mb-1">${d.year} ${d.isProjection ? '(Projected)' : ''}</div>
            <div class="text-[#64ffda]">${xLabel}: ${d[xMetric].toFixed(1)}</div>
            <div class="text-[#f59e0b]">${yLabel}: ${d[yMetric].toFixed(1)}</div>
          `);
      })
      .on('mouseleave', () => tooltip.style('opacity', 0));

  }, [mergedData, xMetric, yMetric, year, correlation]);

  const xOptions = [
    { value: 'temperature' as const, label: 'Sea Surface Temp (°C)' },
    { value: 'sealevel' as const, label: 'Sea Level Rise (mm)' },
    { value: 'rainfall' as const, label: 'Rainfall Anomaly (%)' },
  ];

  const yOptions = [
    { value: 'taro' as const, label: 'Taro Yield (t/ha)' },
    { value: 'tax' as const, label: 'Environmental Tax (% GDP)' },
  ];

  return (
    <div className="w-full relative glass-card p-6 rounded-xl border border-[rgba(230,57,70,0.2)]">
      
      {/* Control Panel */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 z-10 relative">
        <div className="flex flex-wrap items-center gap-6">
          
          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs tracking-wider text-[#64ffda]">
              ECOLOGICAL METRIC &rarr;
            </label>
            <select 
              value={xMetric} 
              onChange={e => setXMetric(e.target.value as any)}
              className="bg-[#112240] text-[#e6f1ff] border border-[#233554] rounded px-3 py-1.5 text-sm outline-none focus:border-[#64ffda] transition-colors"
            >
              {xOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs tracking-wider text-[#f59e0b]">
              HUMAN IMPACT &uarr;
            </label>
            <select 
              value={yMetric} 
              onChange={e => setYMetric(e.target.value as any)}
              className="bg-[#112240] text-[#e6f1ff] border border-[#233554] rounded px-3 py-1.5 text-sm outline-none focus:border-[#f59e0b] transition-colors"
            >
              {yOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          
        </div>

        <div className="flex items-center gap-4 bg-[#0a192f] px-4 py-2 rounded-lg border border-[rgba(100,255,218,0.1)]">
          <button
            onClick={() => {
              if (year >= 2050) setYear(1993);
              setIsPlaying(!isPlaying);
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 ${isPlaying ? 'bg-[#e63946]/20 text-[#e63946] border border-[#e63946]' : 'bg-[#64ffda]/10 text-[#64ffda] border border-[#64ffda]'}`}
          >
            {isPlaying ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <rect x="2" y="1" width="4" height="12" />
                <rect x="8" y="1" width="4" height="12" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" style={{ marginLeft: '2px' }}>
                <polygon points="3,1 13,7 3,13" />
              </svg>
            )}
          </button>

          <div className="flex flex-col">
            <span className="text-xs text-[#a8b2d1] font-mono">Timeline</span>
            <div className="font-display text-2xl font-bold text-[#e6f1ff] leading-none">
              {year}
            </div>
          </div>
          
          <div
            className="font-mono text-xs font-bold px-3 py-1.5 rounded ml-4 border border-[#f59e0b]/30"
            style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' }}
            title="Pearson Correlation Coefficient"
          >
            r = {correlation.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div ref={containerRef} className="w-full relative" />

      {/* Legend Map */}
      <div className="absolute top-24 right-10 z-10 flex flex-col gap-2 bg-[#020c1b]/80 p-4 rounded-lg border border-[rgba(168,178,209,0.1)] backdrop-blur-sm">
        <div className="flex items-center gap-2 text-xs text-[#a8b2d1] font-mono">
          <span className="w-3 h-3 rounded-full bg-[rgba(100,255,218,0.8)] border border-[#64ffda]"></span>
          Historical (1993-2023)
        </div>
        <div className="flex items-center gap-2 text-xs text-[#a8b2d1] font-mono">
          <span className="w-3 h-3 rounded-full bg-[rgba(230,57,70,0.8)] border border-[#e63946]"></span>
          Projected (2030-2050)
        </div>
        <div className="flex items-center gap-2 text-xs text-[#a8b2d1] font-mono mt-1">
          <div style={{ width: 16, height: 0, borderTop: '2px dashed #f59e0b' }} />
          Trend Line
        </div>
      </div>

      {/* Story Overlay based on year */}
      {year >= 2030 && (
        <div className="absolute bottom-16 right-16 max-w-xs glass-card border-[#e63946]/50 p-4 animate-fade-in z-20">
          <h4 className="text-[#e63946] font-display font-bold text-lg mb-2">The Breaking Point</h4>
          <p className="text-sm text-[#ccd6f6]">As the trend enters the projection phase, the correlation between ecological damage and human survival cost becomes irreversible.</p>
        </div>
      )}

    </div>
  );
};
