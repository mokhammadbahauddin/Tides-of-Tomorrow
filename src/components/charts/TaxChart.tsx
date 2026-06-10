import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import gsap from 'gsap';
import { taxData } from '@/data/taxData';
import type { TaxData } from '@/data/taxData';

interface TaxChartProps {
  activeStep: number;
}

export const TaxChart: React.FC<TaxChartProps> = ({ activeStep }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !wrapperRef.current) return;

    const margin = { top: 40, right: 20, bottom: 50, left: 60 };
    const width = wrapperRef.current.clientWidth - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const keys = ['energy', 'transport', 'pollution'];
    
    // Stack the data
    const stackedData = d3.stack<TaxData>().keys(keys)(taxData);

    const x = d3
      .scaleLinear()
      .domain(d3.extent(taxData, (d) => d.year) as [number, number])
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([0, 7]) // Max total is around 6.5
      .range([height, 0]);

    // Colors
    const color = d3
      .scaleOrdinal<string>()
      .domain(keys)
      .range(['#ef4444', '#f59e0b', '#38bdf8']); // Red, Orange, Blue

    // Area generator
    const area = d3
      .area<d3.SeriesPoint<TaxData>>()
      .x((d) => x(d.data.year))
      .y0((d) => y(d[0]))
      .y1((d) => y(d[1]))
      .curve(d3.curveMonotoneX);

    // Draw Areas
    const paths = svg
      .selectAll('.tax-area')
      .data(stackedData)
      .enter()
      .append('path')
      .attr('class', 'tax-area')
      .style('fill', (d) => color(d.key))
      .style('opacity', 0) // Hide initially for animation
      .attr('d', area);

    // X Axis
    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(7).tickFormat(d3.format('d')))
      .selectAll('text')
      .style('fill', '#a8b2d1')
      .style('font-family', 'Inter')
      .style('font-size', '12px');

    // Y Axis
    svg
      .append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat((d) => d + '%'))
      .selectAll('text')
      .style('fill', '#a8b2d1')
      .style('font-family', 'Inter')
      .style('font-size', '12px');

    svg.selectAll('.domain').style('stroke', 'rgba(168, 178, 209, 0.2)');
    svg.selectAll('.tick line').style('stroke', 'rgba(168, 178, 209, 0.1)');

    // Legend
    const legend = svg.append('g').attr('transform', `translate(0, -30)`);
    const legendItems = [
      { key: 'energy', label: 'Energy Taxes' },
      { key: 'transport', label: 'Transport Taxes' },
      { key: 'pollution', label: 'Pollution/Adaptation' },
    ];

    legendItems.forEach((item, i) => {
      const g = legend.append('g').attr('transform', `translate(${i * 150}, 0)`);
      g.append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', color(item.key))
        .attr('rx', 2);
      g.append('text')
        .attr('x', 20)
        .attr('y', 10)
        .text(item.label)
        .style('fill', '#a8b2d1')
        .style('font-size', '12px')
        .style('font-family', 'Inter');
    });

    // Y Axis Label
    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -45)
      .attr('x', -height / 2)
      .attr('text-anchor', 'middle')
      .style('fill', '#a8b2d1')
      .style('font-size', '12px')
      .style('font-family', 'Inter')
      .text('Tax Revenue (% of GDP)');

    // GSAP Animation
    gsap.to(paths.nodes(), {
      opacity: 0.85,
      duration: 1.5,
      stagger: 0.2,
      ease: 'power2.out',
      delay: 0.5,
    });

  }, []);

  // Highlight specific areas based on scroll step
  useEffect(() => {
    if (!svgRef.current) return;
    
    if (activeStep === 1) {
      // Highlight the massive surge in total
      gsap.to(svgRef.current.querySelectorAll('.tax-area'), {
        opacity: 0.9,
        duration: 0.5,
      });
    } else {
      gsap.to(svgRef.current.querySelectorAll('.tax-area'), {
        opacity: 0.7,
        duration: 0.5,
      });
    }
  }, [activeStep]);

  return (
    <div ref={wrapperRef} className="w-full h-full min-h-[500px] flex items-center justify-center">
      <svg ref={svgRef} className="w-full h-full drop-shadow-lg" />
    </div>
  );
};
