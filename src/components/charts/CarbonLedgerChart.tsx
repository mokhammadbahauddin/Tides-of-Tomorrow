import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import gsap from 'gsap';

export default function CarbonLedgerChart({ isActive = true }: { isActive?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const data = [
    { label: 'Global Greenhouse Gas Emissions', value: 99.97, color: 'url(#red-grad)' },
    { label: 'Pacific Nations', value: 0.03, color: '#64ffda' }
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
      .attr('id', 'red-grad')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    grad.append('stop').attr('offset', '0%').attr('stop-color', '#e63946');
    grad.append('stop').attr('offset', '100%').attr('stop-color', '#780000');

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
      .attr('fill', 'rgba(255,255,255,0.8)')
      .style('font-family', 'Inter')
      .style('font-weight', 'bold')
      .style('font-size', '48px')
      .text('0%')
      .style('mix-blend-mode', 'overlay');

    svg.append('text')
      .attr('class', 'global-label')
      .attr('x', 20)
      .attr('y', 40)
      .attr('fill', 'rgba(255,255,255,0.6)')
      .style('font-family', 'monospace')
      .style('font-size', '12px')
      .text('GLOBAL GREENHOUSE GAS EMISSIONS');

    svg.append('text')
      .attr('class', 'pacific-label')
      .attr('x', 20)
      .attr('y', height - 20)
      .attr('fill', '#64ffda')
      .style('font-family', 'monospace')
      .style('font-size', '12px')
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
      <div className="w-full h-full border border-[#64ffda]/20 rounded-lg relative overflow-hidden bg-[#0a192f]/50 backdrop-blur-md shadow-[0_0_50px_rgba(230,57,70,0.1)]">
        <svg ref={svgRef} className="w-full h-full" />
      </div>
      <div className="mt-6 text-center text-[#a8b2d1] font-mono text-xs uppercase tracking-widest opacity-60">
        Data: SPREP / IPCC AR6
      </div>
    </div>
  );
}
