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
      .style('height', '100%')
      .attr('role', 'img')
      .attr('aria-label', "Act I: Split bar chart comparing the historical greenhouse gas emissions of global industrialized nations (99.97%) vs the 22 Pacific Island nations (0.03%).");

    svg.append('title').text('Global vs Pacific Carbon Emissions share');
    svg.append('desc').text('A stacked bar splitting global emissions (99.97%, large red area) and Pacific shares (0.03%, paper-thin teal line).');

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

    // Pacific line
    const pacificHeight = Math.max(y(data[1].value), 2.5); // Minimum 2.5px visibility
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

    // Tooltip
    const tooltip = d3.select(containerRef.current).selectAll('.glass-tooltip').data([0]).join('div')
      .attr('class', 'glass-tooltip')
      .style('position', 'absolute')
      .style('opacity', 0)
      .style('pointer-events', 'none')
      .style('z-index', 10)
      .style('background', 'rgba(11, 26, 46, 0.96)')
      .style('border', '1px solid rgba(212, 165, 116, 0.25)')
      .style('backdrop-filter', 'blur(8px)')
      .style('padding', '12px')
      .style('border-radius', '0') // Sharp corners matching Synthesis style
      .style('color', '#E8DCC8')
      .style('font-family', 'Inter, sans-serif')
      .style('font-size', '12px')
      .style('width', '230px');

    // Interactive mouse listeners
    svg.selectAll('rect')
      .style('cursor', 'crosshair')
      .on('pointermove', function (event, d: any) {
        if (d.label === 'Global Greenhouse Gas Emissions') {
          d3.select(this).attr('opacity', 0.9);
          tooltip.html(`
            <div style="font-family: 'Playfair Display', serif; font-weight: bold; color: #B44D36; font-size: 12px; border-bottom: 1px solid rgba(212,165,116,0.15); padding-bottom: 6px; margin-bottom: 8px; uppercase tracking-wide">Historical Global Emissions</div>
            <div style="font-size: 10px; font-family: Inter, sans-serif; line-height: 1.6; color: #E8DCC8;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 2px;"><span>🇺🇸 United States:</span><strong>24.5%</strong></div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 2px;"><span>🇪🇺 European Union:</span><strong>17.5%</strong></div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 2px;"><span>🇨🇳 China:</span><strong>14.3%</strong></div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 2px;"><span>🇷🇺 Russia:</span><strong>6.8%</strong></div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 2px;"><span>🇬🇧 United Kingdom:</span><strong>4.6%</strong></div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 2px;"><span>🇯🇵 Japan:</span><strong>4.0%</strong></div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 2px;"><span>🇮🇳 India:</span><strong>3.2%</strong></div>
              <div style="display: flex; justify-content: space-between; border-top: 1px solid rgba(212,165,116,0.1); margin-top: 6px; padding-top: 4px; color: rgba(232, 220, 200, 0.65);">
                <span>Other Industrialized:</span><strong>25.1%</strong>
              </div>
            </div>
          `);
        } else {
          d3.select(this).attr('opacity', 0.95);
          tooltip.html(`
            <div style="font-family: 'Playfair Display', serif; font-weight: bold; color: #2B7A78; font-size: 12px; border-bottom: 1px solid rgba(212,165,116,0.15); padding-bottom: 6px; margin-bottom: 8px; uppercase tracking-wide">Pacific Islands Footprint</div>
            <div style="font-size: 10px; font-family: Inter, sans-serif; line-height: 1.5; color: #E8DCC8;">
              <div style="display: flex; justify-content: space-between; font-weight: bold; color: #2B7A78;">
                <span>🌴 22 Pacific Nations:</span><strong>0.03%</strong>
              </div>
              <div style="margin-top: 8px; font-style: italic; color: rgba(232,220,200,0.5); line-height: 1.4;">
                Negligible contribution to global greenhouse gas output, yet standing on the direct frontline of rising seas and failed crops.
              </div>
            </div>
          `);
        }

        tooltip
          .style('left', `${event.offsetX + 15}px`)
          .style('top', `${event.offsetY - 60}px`)
          .transition().duration(150).style('opacity', 1);
      })
      .on('pointerleave', function () {
        d3.select(this).attr('opacity', 1);
        tooltip.transition().duration(150).style('opacity', 0);
      });

    // GSAP Animation
    gsap.to('.global-bar', { attr: { height: globalHeight }, duration: 1.5, ease: 'power4.out', delay: 0.2 });
    gsap.to('.pacific-bar', { attr: { height: pacificHeight }, duration: 1.2, ease: 'power2.out', delay: 0.4 });

    // Center Large Text overlay
    svg.append('text')
      .attr('class', 'global-pct')
      .attr('x', width / 2)
      .attr('y', height / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', 'rgba(232, 220, 200, 0.75)') // Shell White
      .style('font-family', "'Playfair Display', serif")
      .style('font-weight', 'bold')
      .style('font-size', '44px')
      .text('0%')
      .style('mix-blend-mode', 'overlay')
      .style('pointer-events', 'none');

    svg.append('text')
      .attr('class', 'global-label')
      .attr('x', 20)
      .attr('y', 40)
      .attr('fill', 'rgba(232, 220, 200, 0.65)')
      .style('font-family', 'Inter, sans-serif')
      .style('font-size', '10px')
      .style('font-weight', 'bold')
      .style('letter-spacing', '1.2px')
      .text('GLOBAL GREENHOUSE GAS EMISSIONS')
      .style('pointer-events', 'none');

    svg.append('text')
      .attr('class', 'pacific-label')
      .attr('x', 20)
      .attr('y', height - 20)
      .attr('fill', '#2B7A78') // Reef Teal
      .style('font-family', 'Inter, sans-serif')
      .style('font-size', '10px')
      .style('font-weight', 'bold')
      .style('letter-spacing', '1.2px')
      .text('PACIFIC EMISSIONS SHARE: 0.03%')
      .style('opacity', 0)
      .style('pointer-events', 'none');

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

    return () => {
      tooltip.remove();
    };
  }, [isActive]);

  return (
    <div ref={containerRef} className="w-full max-w-lg aspect-square relative flex flex-col items-center justify-center p-4">
      <div className="w-full h-full glass-panel border border-[#D4A574]/15 rounded-none relative overflow-hidden">
        <svg ref={svgRef} className="w-full h-full" />
      </div>
      <div className="mt-4 text-center text-[#8B7355] font-body text-xs tracking-wide opacity-80 uppercase tracking-widest font-semibold text-[9px]">
        Source: Global Carbon Project (GCP) / WRI Climate Watch
      </div>
    </div>
  );
}
