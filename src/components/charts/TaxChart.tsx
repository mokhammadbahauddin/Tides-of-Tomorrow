import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import gsap from 'gsap';
import { taxData } from '@/data/taxData';
import type { TaxRecord } from '@/data/taxData';

interface TaxChartProps {
  activeStep: number;
}

export const TaxChart: React.FC<TaxChartProps> = ({ activeStep }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = 500;
    const margin = { top: 50, right: 60, bottom: 60, left: 60 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto');

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const xExtent = d3.extent(taxData, d => d.year) as [number, number];
    const maxYield = d3.max(taxData, d => d.yieldIndex) || 20;
    const maxTax = d3.max(taxData, d => d.taxPercent) || 7.0;

    const x = d3.scaleLinear().domain(xExtent).range([0, innerW]);
    const yLeft = d3.scaleLinear().domain([0, maxYield * 1.1]).range([innerH, 0]);
    const yRight = d3.scaleLinear().domain([0, maxTax * 1.1]).range([innerH, 0]);

    // Gridlines
    g.append('g')
      .selectAll('line')
      .data(yLeft.ticks(6))
      .enter()
      .append('line')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', d => yLeft(d)).attr('y2', d => yLeft(d))
      .attr('stroke', 'rgba(168, 178, 209, 0.1)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4');

    // Left axis (Yield - Green to represent crop)
    g.append('g')
      .call(d3.axisLeft(yLeft).ticks(6))
      .call(gAxis => gAxis.select('.domain').remove())
      .call(gAxis => gAxis.selectAll('.tick line').remove())
      .call(gAxis => gAxis.selectAll('.tick text')
        .attr('fill', '#10b981')
        .attr('font-family', 'Inter')
        .attr('font-size', '12px'));

    // Right axis (Tax - Red to represent burden)
    g.append('g')
      .attr('transform', `translate(${innerW},0)`)
      .call(d3.axisRight(yRight).ticks(5).tickFormat(d => d + '%'))
      .call(gAxis => gAxis.select('.domain').remove())
      .call(gAxis => gAxis.selectAll('.tick line').remove())
      .call(gAxis => gAxis.selectAll('.tick text')
        .attr('fill', '#ef4444')
        .attr('font-family', 'Inter')
        .attr('font-size', '12px'));

    // X axis (Years)
    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(x).tickFormat(d3.format('d')).ticks(6))
      .call(gAxis => gAxis.select('.domain').attr('stroke', 'rgba(168, 178, 209, 0.2)'))
      .call(gAxis => gAxis.selectAll('.tick text')
        .attr('fill', '#a8b2d1')
        .attr('font-family', 'Inter')
        .attr('font-size', '12px'));

    // Divergence fill area (The widening gap)
    const areaData = taxData.map(d => ({
      year: d.year,
      taxY: yRight(d.taxPercent),
      yieldY: yLeft(d.yieldIndex),
    }));

    const areaGen = d3.area<{ year: number; taxY: number; yieldY: number }>()
      .x(d => x(d.year))
      .y0(d => d.yieldY)
      .y1(d => d.taxY)
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(areaData)
      .attr('class', 'divergence-area')
      .attr('fill', 'rgba(239, 68, 68, 0.15)')
      .attr('d', areaGen)
      .attr('opacity', 0); // Hidden initially, revealed by GSAP

    // Yield line (Taro)
    const yieldLine = d3.line<TaxRecord>()
      .x(d => x(d.year))
      .y(d => yLeft(d.yieldIndex))
      .curve(d3.curveMonotoneX);

    const yieldPath = g.append('path')
      .datum(taxData)
      .attr('class', 'yield-line')
      .attr('fill', 'none')
      .attr('stroke', '#10b981') // Emerald green
      .attr('stroke-width', 3)
      .attr('stroke-dasharray', '6,4')
      .attr('d', yieldLine);

    // Initial Path Animation for Yield Line
    const yieldLen = (yieldPath.node() as SVGPathElement).getTotalLength();
    yieldPath
      .attr('stroke-dasharray', `${yieldLen} ${yieldLen}`)
      .attr('stroke-dashoffset', yieldLen);
      
    gsap.to(yieldPath.node(), {
      strokeDashoffset: 0,
      duration: 2,
      ease: 'power3.out',
      delay: 0.5
    });

    // Tax line
    const taxLine = d3.line<TaxRecord>()
      .x(d => x(d.year))
      .y(d => yRight(d.taxPercent))
      .curve(d3.curveMonotoneX);

    const taxPath = g.append('path')
      .datum(taxData)
      .attr('class', 'tax-line')
      .attr('fill', 'none')
      .attr('stroke', '#ef4444') // Red
      .attr('stroke-width', 3)
      .attr('d', taxLine);

    const taxLen = (taxPath.node() as SVGPathElement).getTotalLength();
    taxPath
      .attr('stroke-dasharray', `${taxLen} ${taxLen}`)
      .attr('stroke-dashoffset', taxLen);

    gsap.to(taxPath.node(), {
      strokeDashoffset: 0,
      duration: 2,
      ease: 'power3.out',
      delay: 0.5
    });

    // Annotations dynamically extracted from dataset
    const annotations = taxData
      .filter(d => d.event)
      .map(d => ({
        year: d.year,
        label: d.event!,
        color: '#ef4444',
        bold: true
      }));

    annotations.forEach((ann, i) => {
      const annG = g.append('g')
        .attr('class', 'annotation')
        .attr('opacity', 0);

      annG.append('line')
        .attr('x1', x(ann.year))
        .attr('x2', x(ann.year))
        .attr('y1', yRight(0))
        .attr('y2', yRight(0) - 20)
        .attr('stroke', ann.color)
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '2,2');

      annG.append('text')
        .attr('x', x(ann.year) + 5)
        .attr('y', yRight(0) - 25)
        .text(ann.label)
        .attr('fill', ann.color)
        .attr('font-family', 'Inter')
        .attr('font-size', '10px')
        .attr('font-weight', ann.bold ? '700' : '400')
        .attr('transform', `rotate(-15, ${x(ann.year) + 5}, ${yRight(0) - 25})`);
        
      gsap.to(annG.node(), {
        opacity: 1,
        duration: 0.5,
        delay: 2.5 + (i * 0.3)
      });
    });

    // Tooltip & Crosshair
    const crosshair = g.append('line')
      .attr('y1', 0).attr('y2', innerH)
      .attr('stroke', '#64ffda')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4')
      .attr('opacity', 0)
      .attr('pointer-events', 'none');

    // Tooltip Memory Leak Fix
    const tooltip = d3.select(container).selectAll('.glass-tooltip').data([0]).join('div')
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

    g.append('rect')
      .attr('width', innerW).attr('height', innerH).attr('fill', 'transparent')
      .on('mousemove', function (event) {
        const [mx] = d3.pointer(event);
        const year = Math.round(x.invert(mx));
        // Find closest data point
        const d = taxData.reduce((prev, curr) => 
          Math.abs(curr.year - year) < Math.abs(prev.year - year) ? curr : prev
        );
        
        if (d) {
          crosshair.attr('x1', x(d.year)).attr('x2', x(d.year)).attr('opacity', 0.5);
          tooltip
            .style('left', (event.pageX + 15) + 'px')
            .style('top', (event.pageY - 40) + 'px')
            .style('opacity', 1)
            .html(`
              <div class="font-bold text-sm mb-1">${d.year}</div>
              <div class="text-[#10b981]">Yield: ${d.yieldIndex} t/ha</div>
              <div class="text-[#ef4444]">Tax: ${d.taxPercent}% GDP</div>
            `);
        }
      })
      .on('mouseleave', () => {
        crosshair.attr('opacity', 0);
        tooltip.style('opacity', 0);
      });

  }, []);

  // Sync GSAP animations with activeStep
  useEffect(() => {
    if (!svgRef.current) return;

    if (activeStep === 1) {
      // Show the divergence area dramatically when talking about "The Climate Tax"
      gsap.to(svgRef.current.querySelector('.divergence-area'), {
        opacity: 1,
        duration: 1.5,
        ease: 'power2.out'
      });
    } else {
      gsap.to(svgRef.current.querySelector('.divergence-area'), {
        opacity: 0,
        duration: 0.8
      });
    }
  }, [activeStep]);

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col items-center relative">
      <div className="flex w-full justify-between items-center mb-6 px-4">
        <div>
          <h3 className="font-display text-xl text-[#e6f1ff]">The Diverging Crises</h3>
          <p className="text-sm text-[#a8b2d1] font-mono mt-1">
            <span className="text-[#10b981]">Taro Yield</span> vs <span className="text-[#ef4444]">Environmental Tax</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[#5c6e8a] uppercase tracking-wider font-mono">Database: PDH.Stat</p>
        </div>
      </div>
      <svg ref={svgRef} className="w-full drop-shadow-xl" />
    </div>
  );
};
