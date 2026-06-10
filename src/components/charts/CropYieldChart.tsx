import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import gsap from 'gsap';
import { cropData } from '@/data/cropData';
import type { CropData } from '@/data/cropData';

interface CropYieldChartProps {
  activeStep: number;
}

export const CropYieldChart: React.FC<CropYieldChartProps> = ({ activeStep }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !wrapperRef.current) return;

    const margin = { top: 40, right: 20, bottom: 50, left: 60 };
    const width = wrapperRef.current.clientWidth - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Clear previous
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const subgroups = ['taro', 'sweetPotato', 'cassava'];
    const groups = cropData.map((d) => d.year.toString());

    // X axis for years
    const x = d3
      .scaleBand()
      .domain(groups)
      .range([0, width])
      .padding(0.2);

    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSize(0).tickPadding(10))
      .selectAll('text')
      .style('fill', '#a8b2d1')
      .style('font-family', 'Inter')
      .style('font-size', '12px');

    svg.select('.domain').style('stroke', 'rgba(168, 178, 209, 0.2)');

    // Y axis for Yield
    const y = d3.scaleLinear().domain([0, 100]).range([height, 0]);

    svg
      .append('g')
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickFormat((d) => d + '%')
          .tickSize(-width)
      )
      .selectAll('text')
      .style('fill', '#a8b2d1')
      .style('font-family', 'Inter')
      .style('font-size', '12px');

    svg.selectAll('.tick line').style('stroke', 'rgba(168, 178, 209, 0.1)');
    svg.select('.domain').remove();

    // X axis for subgroups (the 3 bars per year)
    const xSubgroup = d3
      .scaleBand()
      .domain(subgroups)
      .range([0, x.bandwidth()])
      .padding(0.05);

    // Colors: Taro (Red/Orange due to failure), others neutral/greenish
    const color = d3
      .scaleOrdinal<string>()
      .domain(subgroups)
      .range(['#e63946', '#10b981', '#38bdf8']); // Taro: Red, Sweet Potato: Green, Cassava: Blue

    // Draw Bars
    const yearGroups = svg
      .selectAll('.year-group')
      .data(cropData)
      .enter()
      .append('g')
      .attr('class', 'year-group')
      .attr('transform', (d) => `translate(${x(d.year.toString())},0)`);

    yearGroups
      .selectAll('rect')
      .data((d) =>
        subgroups.map((key) => ({ key, value: d[key as keyof CropData] as number }))
      )
      .enter()
      .append('rect')
      .attr('class', 'crop-bar')
      .attr('x', (d) => xSubgroup(d.key)!)
      .attr('y', height) // Start from bottom for animation
      .attr('width', xSubgroup.bandwidth())
      .attr('height', 0) // Start with 0 height
      .attr('fill', (d) => color(d.key))
      .attr('rx', 2);

    // Initial animation with GSAP
    gsap.to(svgRef.current.querySelectorAll('.crop-bar'), {
      y: 0,
      height: (_i, el) => {
        const data = d3.select(el).datum() as { key: string; value: number };
        return height - y(data.value);
      },
      attr: {
        y: (_i, el) => {
          const data = d3.select(el).datum() as { key: string; value: number };
          return y(data.value);
        },
      },
      duration: 1.5,
      ease: 'power3.out',
      stagger: 0.02,
      delay: 0.5,
    });

    // Add legend
    const legend = svg
      .append('g')
      .attr('transform', `translate(0, -30)`);

    const legendItems = [
      { key: 'taro', label: 'Taro (Colocasia esculenta)' },
      { key: 'sweetPotato', label: 'Sweet Potato' },
      { key: 'cassava', label: 'Cassava' },
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
      .text('Yield Relative to 1990 Baseline (%)');
  }, []);

  // Update effect based on activeStep
  useEffect(() => {
    if (!svgRef.current) return;
    
    // When activeStep == 1, we highlight the collapse of Taro by dimming the others
    if (activeStep === 1) {
      gsap.to(svgRef.current.querySelectorAll('.crop-bar'), {
        opacity: (_i, el) => {
          const data = d3.select(el).datum() as { key: string; value: number };
          return data.key === 'taro' ? 1 : 0.2;
        },
        duration: 0.5,
      });
    } else {
      gsap.to(svgRef.current.querySelectorAll('.crop-bar'), {
        opacity: 0.9,
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
