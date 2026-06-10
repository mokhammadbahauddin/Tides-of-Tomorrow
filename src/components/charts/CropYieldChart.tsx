import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import gsap from 'gsap';
import { cropData } from '@/data/cropData';
import type { CropData } from '@/data/cropData';

interface CropYieldChartProps {
  activeStep: number;
}

export const CropYieldChart: React.FC<CropYieldChartProps> = ({ activeStep }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 500;
    const margin = { top: 50, right: 40, bottom: 60, left: 60 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    // Clear previous
    d3.select(svgRef.current).selectAll('*').remove();

    // Use viewBox for perfect responsiveness without resize listeners
    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto');

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const crops = ['taro', 'sweetPotato', 'banana', 'cocoa'] as const;
    const colors: Record<string, string> = {
      taro: '#e63946', // Changed to red to highlight the crisis
      sweetPotato: '#f59e0b',
      banana: '#10b981',
      cocoa: '#8b5cf6',
    };

    const x0 = d3.scaleBand()
      .domain(cropData.map(d => String(d.year)))
      .range([0, innerW])
      .padding(0.2);

    const x1 = d3.scaleBand()
      .domain(crops as unknown as string[])
      .range([0, x0.bandwidth()])
      .padding(0.05);

    // Dynamically calculate max value from all crops
    const maxY = d3.max(cropData, d => Math.max(d.taro, d.sweetPotato, d.banana, d.cocoa)) || 20;

    const y = d3.scaleLinear()
      .domain([0, maxY * 1.1]) // Add 10% headroom
      .range([innerH, 0]);

    // Gridlines
    g.append('g')
      .selectAll('line')
      .data(y.ticks(6))
      .enter()
      .append('line')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', d => y(d)).attr('y2', d => y(d))
      .attr('stroke', 'rgba(168, 178, 209, 0.1)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4');

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(x0).tickFormat(d => d).tickSize(0).tickPadding(10))
      .call(gAxis => gAxis.select('.domain').attr('stroke', 'rgba(168, 178, 209, 0.2)'))
      .call(gAxis => gAxis.selectAll('.tick text')
        .attr('fill', '#a8b2d1')
        .attr('font-family', 'Inter')
        .attr('font-size', '12px'));

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d} t/ha`).tickSize(0).tickPadding(10))
      .call(gAxis => gAxis.select('.domain').remove())
      .call(gAxis => gAxis.selectAll('.tick text')
        .attr('fill', '#a8b2d1')
        .attr('font-family', 'Inter')
        .attr('font-size', '12px'));

    // Bars Group
    const yearGroups = g.selectAll('.year-group')
      .data(cropData)
      .enter()
      .append('g')
      .attr('class', 'year-group')
      .attr('transform', d => `translate(${x0(String(d.year))},0)`);

    yearGroups.selectAll('rect')
      .data(d => crops.map(key => ({ key, value: d[key as keyof CropData] as number, year: d.year })))
      .enter()
      .append('rect')
      .attr('class', d => `crop-bar crop-bar-${d.key}`)
      .attr('x', d => x1(d.key)!)
      .attr('y', innerH)
      .attr('width', x1.bandwidth())
      .attr('height', 0)
      .attr('fill', d => colors[d.key])
      .attr('rx', 2)
      // Add Tooltip interaction
      .on('mouseenter', function(event, d) {
        d3.select(this).attr('opacity', 0.8);
        const tooltip = d3.select(container).selectAll('.glass-tooltip').data([0]).join('div')
          .attr('class', 'glass-tooltip')
          .style('position', 'absolute')
          .style('pointer-events', 'none')
          .style('opacity', 0)
          .style('background', 'rgba(17, 24, 39, 0.9)')
          .style('padding', '8px')
          .style('border-radius', '4px')
          .style('border', '1px solid rgba(255,255,255,0.1)');
        
        tooltip.html(`
          <div style="font-weight:bold; color: #64ffda">${d.key.toUpperCase()} (${d.year})</div>
          <div>Yield: ${d.value.toFixed(1)} t/ha</div>
        `)
        .style('left', `${event.offsetX + 10}px`)
        .style('top', `${event.offsetY - 30}px`)
        .transition().duration(200).style('opacity', 1);
      })
      .on('mousemove', function(event) {
        d3.select(container).select('.glass-tooltip')
          .style('left', `${event.offsetX + 10}px`)
          .style('top', `${event.offsetY - 30}px`);
      })
      .on('mouseleave', function() {
        d3.select(this).attr('opacity', 1);
        d3.select(container).select('.glass-tooltip').transition().duration(200).style('opacity', 0).remove();
      });

    // Initial GSAP setup
    gsap.to(svg.selectAll('.crop-bar').nodes(), {
      y: 0,
      height: (_i, el) => {
        const data = d3.select(el).datum() as { value: number };
        return innerH - y(data.value);
      },
      attr: {
        y: (_i, el) => {
          const data = d3.select(el).datum() as { value: number };
          return y(data.value);
        }
      },
      duration: 1.5,
      ease: 'power3.out',
      stagger: 0.05,
      delay: 0.2
    });

    // Taro trend line
    const taroLine = d3.line<{ year: number; taro: number }>()
      .x(d => x0(String(d.year))! + x0.bandwidth() / 2)
      .y(d => y(d.taro))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(cropData)
      .attr('class', 'taro-trendline')
      .attr('fill', 'none')
      .attr('stroke', colors.taro)
      .attr('stroke-width', 3)
      .attr('stroke-dasharray', '6,4')
      .attr('d', taroLine)
      .attr('opacity', 0); // Hidden initially

    // Legend
    const legend = g.append('g').attr('transform', `translate(0, -30)`);
    crops.forEach((crop, i) => {
      const lg = legend.append('g').attr('transform', `translate(${i * 120}, 0)`);
      lg.append('rect').attr('width', 12).attr('height', 12).attr('rx', 2).attr('fill', colors[crop]);
      lg.append('text')
        .attr('x', 20).attr('y', 10)
        .text(crop === 'sweetPotato' ? 'Sweet Potato' : crop.charAt(0).toUpperCase() + crop.slice(1))
        .attr('fill', '#a8b2d1')
        .attr('font-family', 'Inter')
        .attr('font-size', '12px');
    });

  }, []);

  // Sync GSAP animations with activeStep
  useEffect(() => {
    if (!svgRef.current) return;

    if (activeStep === 1) {
      // Step 1: "The Empty Harvest" -> Dim everything except Taro, show Taro trendline
      gsap.to(svgRef.current.querySelectorAll('.crop-bar'), {
        opacity: (_i, el) => {
          const isTaro = el.classList.contains('crop-bar-taro');
          return isTaro ? 1 : 0.15;
        },
        duration: 0.8,
        ease: 'power2.out'
      });

      // Animate the dashed line drawing in
      const trendline = svgRef.current.querySelector('.taro-trendline') as SVGPathElement;
      if (trendline) {
        const length = trendline.getTotalLength();
        gsap.fromTo(trendline, 
          { strokeDashoffset: length, opacity: 1, strokeDasharray: length },
          { strokeDashoffset: 0, duration: 1.5, ease: 'power2.out' }
        );
      }
    } else {
      // Step 0: Restore normal view
      gsap.to(svgRef.current.querySelectorAll('.crop-bar'), {
        opacity: 0.85,
        duration: 0.8,
        ease: 'power2.out'
      });

      gsap.to(svgRef.current.querySelectorAll('.taro-trendline'), {
        opacity: 0,
        duration: 0.5
      });
    }
  }, [activeStep]);

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col items-center">
      <div className="flex w-full justify-between items-center mb-6 px-4">
        <div>
          <h3 className="font-display text-xl text-[#e6f1ff]">Crop Yield - Disaggregated</h3>
          <p className="text-sm text-[#a8b2d1] font-mono mt-1">Focus Metric: Taro Yield (t/ha)</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[#5c6e8a] uppercase tracking-wider font-mono">Database: FAOSTAT</p>
        </div>
      </div>
      <svg ref={svgRef} className="w-full drop-shadow-xl" />
    </div>
  );
};
