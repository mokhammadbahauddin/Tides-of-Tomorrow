import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import gsap from 'gsap';

export default function CarbonLedgerChart({ isActive = true }: { isActive?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const data = [
    { label: 'Global Greenhouse Gas Emissions', value: 99.97, color: 'url(#terracotta-grad)' },
    { label: 'Pacific Nations', value: 0.03, color: '#2B7A78' } // Reef Teal
  ];

  useEffect(() => {
    if (!containerRef.current || !svgRef.current || !isActive) return;

    const width = containerRef.current.clientWidth;
    const height = 400; // Fixed aspect ratio

    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', '100%');

    svg.selectAll('*').remove();

    // Defs for gradients
    const defs = svg.append('defs');
    const grad = defs.append('linearGradient')
      .attr('id', 'terracotta-grad')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    grad.append('stop').attr('offset', '0%').attr('stop-color', '#B44D36'); // Terracotta
    grad.append('stop').attr('offset', '100%').attr('stop-color', '#4E1A10'); // Rich dark charcoal-red

    // D3 Scale
    const y = d3.scaleLinear()
      .domain([0, 100])
      .range([0, height]);

    // Draw bars stacked

    // Pacific line
    const pacificHeight = Math.max(y(data[1].value), 2); // Minimum 2px visibility
    const globalHeight = height - pacificHeight;

    const bars = svg.selectAll('rect')
      .data([
        { ...data[0], y: 0, h: globalHeight },
        { ...data[1], y: globalHeight, h: pacificHeight }
      ]);

    bars.enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', d => d.y)
      .attr('width', width)
      .attr('height', 0)
      .attr('fill', d => d.color)
      .attr('class', (_d, i) => i === 0 ? 'global-bar' : 'pacific-bar');

    // GSAP Animation
    gsap.to('.global-bar', { attr: { height: globalHeight }, duration: 1.5, ease: 'power4.out', delay: 0.2 });
    gsap.to('.pacific-bar', { attr: { height: pacificHeight }, duration: 1, ease: 'power2.out' });

    // Labels
    svg.append('text')
      .attr('class', 'global-pct')
      .attr('x', width / 2)
      .attr('y', height / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', 'rgba(232, 220, 200, 0.8)') // Shell White
      .style('font-family', "'Playfair Display', serif")
      .style('font-weight', 'bold')
      .style('font-size', '48px')
      .text('0%')
      .style('mix-blend-mode', 'overlay');

    svg.append('text')
      .attr('class', 'global-label')
      .attr('x', 20)
      .attr('y', 40)
      .attr('fill', 'rgba(232, 220, 200, 0.6)') // Shell White
      .style('font-family', 'Inter, sans-serif')
      .style('font-size', '11px')
      .style('letter-spacing', '0.5px')
      .text('GLOBAL GREENHOUSE GAS EMISSIONS');

    svg.append('text')
      .attr('class', 'pacific-label')
      .attr('x', 20)
      .attr('y', height - 20)
      .attr('fill', '#2B7A78') // Reef Teal
      .style('font-family', 'Inter, sans-serif')
      .style('font-size', '11px')
      .style('letter-spacing', '0.5px')
      .text('PACIFIC NATIONS: 0.03%')
      .style('opacity', 0);

    gsap.to('.global-pct', {
      innerHTML: 99.97,
      duration: 1.5,
      delay: 0.2,
      ease: 'power2.out',
      modifiers: {
        innerHTML: value => `${Number(value).toFixed(2)}%`
      }
    });

    gsap.to('.pacific-label', { opacity: 1, duration: 1, delay: 0.8 });

  }, [isActive]);

  return (
    <div ref={containerRef} className="w-full max-w-lg aspect-square relative flex flex-col items-center justify-center p-4">
      <div className="w-full h-full border border-[#D4A574]/12 rounded-lg relative overflow-hidden bg-[#0F2237]/75 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
        <svg ref={svgRef} className="w-full h-full" />
      </div>
      <div className="mt-6 text-center text-[#8B7355] font-body text-xs tracking-wide opacity-80">
        Data: SPREP / IPCC AR6
      </div>
    </div>
  );
}
