import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import gsap from 'gsap';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface CropRecord {
  year: number;
  taro: number;
  sweetPotato: number;
  banana: number;
  cocoa: number;
}

interface CropYieldChartProps {
  activeStep: number;
  selectedCountry?: { id: string; name: string };
}

export const CropYieldChart: React.FC<CropYieldChartProps> = ({ activeStep, selectedCountry }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [rawData, setRawData] = useState<CropRecord[]>([]);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    d3.json<CropRecord[]>('/data/cropyield.json').then((res) => {
      if (res) setRawData(res);
    }).catch((err) => { console.error('Failed to load chart data:', err); setHasError(true); });
  }, []);

  const data = useMemo(() => {
    const countryKey = selectedCountry?.id || 'REGIONAL';
    return rawData.map(d => {
      // Each rawData node contains countryKey mapping to taro, sweetPotato, banana, cocoa
      const cData = (d as any)[countryKey] || (d as any).REGIONAL || { taro: 10, sweetPotato: 10, banana: 10, cocoa: 5 };
      return {
        year: d.year,
        taro: Number(cData.taro !== undefined ? cData.taro : d.taro),
        sweetPotato: Number(cData.sweetPotato !== undefined ? cData.sweetPotato : d.sweetPotato),
        banana: Number(cData.banana !== undefined ? cData.banana : d.banana),
        cocoa: Number(cData.cocoa !== undefined ? cData.cocoa : d.cocoa)
      };
    });
  }, [rawData, selectedCountry]);

  useEffect(() => {
    if (data.length === 0 || !containerRef.current || !svgRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth * 0.58; // Adjust to fit the split view
    const height = 420;
    const margin = { top: 40, right: 20, bottom: 50, left: 50 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const chartData = data.filter(d => d.year >= 1990);

    // Clear previous
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto')
      .attr('role', 'img')
      .attr('aria-label', `Act V: Grouped bar chart comparing taro and sweet potato yields in tonnes per hectare for ${selectedCountry?.name || 'Regional Average'} (1990-2024). Includes expected yield target and deficit projections.`);

    svg.append('title').text('Crop Yield Comparison Chart');
    svg.append('desc').text('Grouped bar chart showing taro and sweet potato crop yields over time, with taro represented by terracotta bars and sweet potato represented by warm sand bars.');

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const defs = svg.append('defs');

    // Taro gradient (Terracotta)
    const taroGrad = defs.append('linearGradient')
      .attr('id', 'taro-grad')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    taroGrad.append('stop').attr('offset', '0%').attr('stop-color', '#B44D36');
    taroGrad.append('stop').attr('offset', '100%').attr('stop-color', '#7A2B1C');

    // Sweet Potato gradient (Coral Pink)
    const spGrad = defs.append('linearGradient')
      .attr('id', 'sweetpotato-grad')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    spGrad.append('stop').attr('offset', '0%').attr('stop-color', '#D4836A');
    spGrad.append('stop').attr('offset', '100%').attr('stop-color', '#9E5442');

    // Banana gradient (Reef Teal)
    const bananaGrad = defs.append('linearGradient')
      .attr('id', 'banana-grad')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    bananaGrad.append('stop').attr('offset', '0%').attr('stop-color', '#2B7A78');
    bananaGrad.append('stop').attr('offset', '100%').attr('stop-color', '#164E4D');

    // Cocoa gradient (Golden Hour)
    const cocoaGrad = defs.append('linearGradient')
      .attr('id', 'cocoa-grad')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    cocoaGrad.append('stop').attr('offset', '0%').attr('stop-color', '#C49A3C');
    cocoaGrad.append('stop').attr('offset', '100%').attr('stop-color', '#8A671F');

    // Food Deficit Area Gradient (Terracotta fade)
    const deficitGrad = defs.append('linearGradient')
      .attr('id', 'food-deficit-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    deficitGrad.append('stop').attr('offset', '0%').attr('stop-color', '#B44D36').attr('stop-opacity', 0.40);
    deficitGrad.append('stop').attr('offset', '100%').attr('stop-color', '#B44D36').attr('stop-opacity', 0.02);

    // Bioluminescent Glow Filter
    const glowFilter = defs.append('filter')
      .attr('id', 'crop-bioluminescent-glow')
      .attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    glowFilter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'blur');
    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'blur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Colorblind-accessible patterns for crops
    // 1. Taro: diagonal stripes
    const taroPattern = defs.append('pattern')
      .attr('id', 'taro-pattern')
      .attr('width', 6)
      .attr('height', 6)
      .attr('patternUnits', 'userSpaceOnUse')
      .attr('patternTransform', 'rotate(45)');
    taroPattern.append('rect').attr('width', 6).attr('height', 6).attr('fill', '#7A2B1C');
    taroPattern.append('line').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', 6).attr('stroke', '#B44D36').attr('stroke-width', 2);

    // 2. Sweet Potato: dots pattern
    const spPattern = defs.append('pattern')
      .attr('id', 'sweetpotato-pattern')
      .attr('width', 8)
      .attr('height', 8)
      .attr('patternUnits', 'userSpaceOnUse');
    spPattern.append('rect').attr('width', 8).attr('height', 8).attr('fill', '#9E5442');
    spPattern.append('circle').attr('cx', 4).attr('cy', 4).attr('r', 2).attr('fill', '#D4836A');

    // 3. Banana: horizontal stripes
    const bananaPattern = defs.append('pattern')
      .attr('id', 'banana-pattern')
      .attr('width', 6)
      .attr('height', 6)
      .attr('patternUnits', 'userSpaceOnUse');
    bananaPattern.append('rect').attr('width', 6).attr('height', 6).attr('fill', '#164E4D');
    bananaPattern.append('line').attr('x1', 0).attr('y1', 3).attr('x2', 6).attr('y2', 3).attr('stroke', '#2B7A78').attr('stroke-width', 1.5);

    // 4. Cocoa: crosshatch
    const cocoaPattern = defs.append('pattern')
      .attr('id', 'cocoa-pattern')
      .attr('width', 8)
      .attr('height', 8)
      .attr('patternUnits', 'userSpaceOnUse');
    cocoaPattern.append('rect').attr('width', 8).attr('height', 8).attr('fill', '#8A671F');
    cocoaPattern.append('line').attr('x1', 0).attr('y1', 0).attr('x2', 8).attr('y2', 8).attr('stroke', '#C49A3C').attr('stroke-width', 1.2);
    cocoaPattern.append('line').attr('x1', 8).attr('y1', 0).attr('x2', 0).attr('y2', 8).attr('stroke', '#C49A3C').attr('stroke-width', 1.2);

    const crops = ['taro', 'sweetPotato'] as const;
    const colors: Record<string, string> = {
      taro: 'url(#taro-pattern)',
      sweetPotato: 'url(#sweetpotato-pattern)',
    };

    const x0 = d3.scaleBand()
      .domain(chartData.map(d => String(d.year)))
      .range([0, innerW])
      .padding(0.25);

    const x1 = d3.scaleBand()
      .domain(crops as unknown as string[])
      .range([0, x0.bandwidth()])
      .padding(0.08);

    const maxY = d3.max(chartData, d => Math.max(d.taro, d.sweetPotato)) || 15;

    const y = d3.scaleLinear()
      .domain([0, maxY * 1.1])
      .range([innerH, 0]);

    // Gridlines
    g.append('g')
      .selectAll('line')
      .data(y.ticks(5))
      .enter()
      .append('line')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', d => y(d)).attr('y2', d => y(d))
      .attr('stroke', 'rgba(212, 165, 116, 0.06)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4');

    // X Axis
    const xTicks = x0.domain().filter(year => parseInt(year) % 5 === 0 || year === '2024');
    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(x0).tickValues(xTicks).tickSize(0).tickPadding(10))
      .call(gAxis => gAxis.select('.domain').remove())
      .call(gAxis => gAxis.selectAll('.tick text')
        .attr('fill', 'rgba(232, 220, 200, 0.4)')
        .attr('font-family', 'Inter, sans-serif')
        .attr('font-size', '9px'));

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d} t/h`).tickSize(0).tickPadding(10))
      .call(gAxis => gAxis.select('.domain').remove())
      .call(gAxis => gAxis.selectAll('.tick text')
        .attr('fill', 'rgba(232, 220, 200, 0.4)')
        .attr('font-family', 'Inter, sans-serif')
        .attr('font-size', '9px'));

    // Bars
    const yearGroups = g.selectAll('.year-group')
      .data(chartData)
      .enter()
      .append('g')
      .attr('class', 'year-group')
      .attr('transform', d => `translate(${x0(String(d.year))},0)`);

    yearGroups.selectAll('rect')
      .data(d => crops.map(key => ({ key, value: d[key] as number, year: d.year })))
      .enter()
      .append('rect')
      .attr('class', d => `crop-bar crop-bar-${d.key}`)
      .attr('x', d => x1(d.key)!)
      .attr('y', innerH)
      .attr('width', x1.bandwidth())
      .attr('height', 0)
      .attr('fill', d => colors[d.key])
      .attr('rx', 1.5)
      .style('filter', 'url(#crop-bioluminescent-glow)')
      .on('mouseenter', function(event, d) {
        d3.select(this).attr('opacity', 0.85);
        const tooltip = d3.select(container).selectAll('.glass-tooltip').data([0]).join('div')
          .attr('class', 'glass-tooltip')
          .style('position', 'absolute')
          .style('pointer-events', 'none')
          .style('opacity', 0)
          .style('background', 'rgba(11, 26, 46, 0.95)')
          .style('padding', '10px')
          .style('border-radius', '0px')
          .style('border', '1px solid rgba(212, 165, 116, 0.2)')
          .style('color', '#E8DCC8')
          .style('font-family', 'Inter, sans-serif')
          .style('font-size', '11px')
          .style('box-shadow', 'none');
        
        tooltip.html(`
          <div style="font-weight:bold; color: #D4A574; font-family: 'Playfair Display', serif; font-size: 12px; margin-bottom: 4px;">${d.key === 'sweetPotato' ? 'SWEET POTATO' : d.key.toUpperCase()} (${d.year})</div>
          <div style="color: rgba(232, 220, 200, 0.85)">Yield: <strong>${d.value.toFixed(2)} t/ha</strong></div>
        `)
        .style('left', `${event.offsetX + 15}px`)
        .style('top', `${event.offsetY - 30}px`)
        .transition().duration(150).style('opacity', 1);
      })
      .on('mousemove', function(event) {
        d3.select(container).select('.glass-tooltip')
          .style('left', `${event.offsetX + 15}px`)
          .style('top', `${event.offsetY - 30}px`);
      })
      .on('mouseleave', function() {
        d3.select(this).attr('opacity', 1);
        d3.select(container).select('.glass-tooltip').remove();
      });

    // Initial GSAP bars reveal
    gsap.to(svg.selectAll('.crop-bar').nodes(), {
      y: 0,
      height: (_i, el) => {
        const d = d3.select(el).datum() as { value: number };
        return innerH - y(d.value);
      },
      attr: {
        y: (_i, el) => {
          const d = d3.select(el).datum() as { value: number };
          return y(d.value);
        }
      },
      duration: 1.2,
      ease: 'power3.out',
      stagger: 0.03,
      delay: 0.1
    });

    // Taro actual trend line
    const taroLine = d3.line<CropRecord>()
      .x(d => x0(String(d.year))! + x0.bandwidth() / 2)
      .y(d => y(d.taro))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(chartData)
      .attr('class', 'taro-trendline')
      .attr('fill', 'none')
      .attr('stroke', '#B44D36')
      .attr('stroke-width', 2.5)
      .style('filter', 'url(#crop-bioluminescent-glow)')
      .attr('d', taroLine)
      .attr('opacity', 0);

    // Expected Taro target yield line
    const targetLine = d3.line<CropRecord>()
      .x(d => x0(String(d.year))! + x0.bandwidth() / 2)
      .y(d => y(7.14 + (d.year - 1990) * 0.11))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(chartData)
      .attr('class', 'taro-target-line')
      .attr('fill', 'none')
      .attr('stroke', '#2B7A78')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,4')
      .attr('d', targetLine)
      .attr('opacity', 0);

    // Food Security Deficit Area
    const deficitArea = d3.area<CropRecord>()
      .x(d => x0(String(d.year))! + x0.bandwidth() / 2)
      .y0(d => y(d.taro))
      .y1(d => y(7.14 + (d.year - 1990) * 0.11))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(chartData)
      .attr('class', 'taro-deficit-area')
      .attr('fill', 'url(#food-deficit-gradient)')
      .attr('d', deficitArea)
      .attr('opacity', 0);

    // Deficit annotation group
    const annotationGroup = g.append('g')
      .attr('class', 'deficit-annotations')
      .attr('opacity', 0);

    const xEnd = x0('2024')! + x0.bandwidth() / 2;

    annotationGroup.append('text')
      .attr('x', xEnd - 10)
      .attr('y', y(10.88) - 10)
      .attr('text-anchor', 'end')
      .attr('fill', '#2B7A78')
      .attr('font-size', '9px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'Inter, sans-serif')
      .attr('paint-order', 'stroke')
      .attr('stroke', '#0F2237')
      .attr('stroke-width', '2px')
      .text('Expected Target (10.9 t/ha)');

    annotationGroup.append('text')
      .attr('x', xEnd - 10)
      .attr('y', y(8.6) + 18)
      .attr('text-anchor', 'end')
      .attr('fill', '#B44D36')
      .attr('font-size', '9px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'Inter, sans-serif')
      .attr('paint-order', 'stroke')
      .attr('stroke', '#0F2237')
      .attr('stroke-width', '2px')
      .text('Actual Yield (8.6 t/ha)');

    // Legend
    const legend = g.append('g').attr('transform', `translate(0, -25)`);
    crops.forEach((crop, i) => {
      const xPos = i * 110;
      const lg = legend.append('g').attr('transform', `translate(${xPos}, 0)`);
      lg.append('rect').attr('width', 10).attr('height', 10).attr('rx', 1.5).attr('fill', colors[crop]);
      lg.append('text')
        .attr('x', 16).attr('y', 9)
        .text(crop === 'sweetPotato' ? 'Sweet Potato' : crop.charAt(0).toUpperCase() + crop.slice(1))
        .attr('fill', 'rgba(232, 220, 200, 0.7)')
        .attr('font-family', 'Inter, sans-serif')
        .attr('font-size', '10px');
    });

  }, [data]);

  // Sync GSAP animations with activeStep
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    if (activeStep === 1) {
      gsap.to(svgRef.current.querySelectorAll('.crop-bar'), {
        opacity: (_i, el) => {
          const isTaro = el.classList.contains('crop-bar-taro');
          return isTaro ? 1 : 0.12;
        },
        duration: 0.6,
        ease: 'power2.out'
      });

      const trendline = svgRef.current.querySelector('.taro-trendline') as SVGPathElement;
      if (trendline) {
        const length = trendline.getTotalLength();
        gsap.fromTo(trendline, 
          { strokeDashoffset: length, opacity: 1, strokeDasharray: length },
          { strokeDashoffset: 0, duration: 1.2, ease: 'power2.out' }
        );
      }

      const targetline = svgRef.current.querySelector('.taro-target-line') as SVGPathElement;
      if (targetline) {
        const length = targetline.getTotalLength();
        gsap.fromTo(targetline, 
          { strokeDashoffset: length, opacity: 1, strokeDasharray: length },
          { strokeDashoffset: 0, duration: 1.2, ease: 'power2.out', delay: 0.2 }
        );
      }

      gsap.to(svgRef.current.querySelectorAll('.taro-deficit-area, .deficit-annotations'), {
        opacity: 1,
        duration: 0.8,
        delay: 0.6
      });
    } else {
      gsap.to(svgRef.current.querySelectorAll('.crop-bar'), {
        opacity: 0.85,
        duration: 0.6,
        ease: 'power2.out'
      });

      gsap.to(svgRef.current.querySelectorAll('.taro-trendline, .taro-target-line, .taro-deficit-area, .deficit-annotations'), {
        opacity: 0,
        duration: 0.4
      });
    }
  }, [activeStep, data]);

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-8">
        <div className="text-4xl mb-4">⚠</div>
        <p className="text-[#E8DCC8] font-['Playfair_Display'] text-lg mb-2">Data Temporarily Unavailable</p>
        <p className="text-[#D4A574] text-sm opacity-70">Please refresh the page to try again.</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full h-[420px] rounded-none bg-gradient-to-r from-[#0B1A2E] via-[#0F2237] to-[#0B1A2E] animate-pulse flex items-center justify-center">
        <p className="text-[#D4A574]/50 font-body tracking-widest text-xs uppercase">Loading Crop Yields...</p>
      </div>
    );
  }

  // State-driven variables for the Soil Salinity Cross-Section SVG
  const isSalty = activeStep === 1;
  const salinityReading = isSalty ? '4.85 dS/m' : '0.15 dS/m';
  const salinityStatus = isSalty ? 'CRITICAL INTRUSION' : 'OPTIMAL SOIL';
  const waterTableY = isSalty ? 170 : 270;
  const waterTableHeight = isSalty ? 130 : 30;
  const soilColor = isSalty ? '#5a544c' : '#3d2314';
  const leafColor = isSalty ? '#a29135' : '#4a7c2a';
  const rootColor = isSalty ? '#7c7267' : '#e8dcc8';

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col lg:flex-row gap-8 items-center justify-between relative">
      
      {/* Left Column: Crop Chart */}
      <div className="w-full lg:w-7/12 flex items-center justify-center">
        <svg ref={svgRef} className="w-full" />
      </div>

      {/* Right Column: Salinity & Root Cross Section (No background card, blends cleanly) */}
      <div className="w-full lg:w-5/12 max-w-sm flex flex-col justify-between h-[360px] relative overflow-visible">
        {/* Subtle glowing mesh behind */}
        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-b from-[#b44d36]/5 to-transparent transition-opacity duration-1000 ${isSalty ? 'opacity-100' : 'opacity-0'}`} />

        {/* Readout Header */}
        <div className="flex flex-col gap-1 z-10 px-2">
          <span className="text-[8px] font-mono text-drift-wood uppercase tracking-widest font-semibold">SOIL METRIC SYSTEM</span>
          <div className="flex justify-between items-baseline mt-1">
            <span className="text-sm font-display text-shell-white font-bold">Salinity Reading (EC)</span>
            <span 
              className="text-sm font-mono font-bold transition-colors duration-1000"
              style={{ color: isSalty ? '#B44D36' : '#2B7A78' }}
            >
              {salinityReading}
            </span>
          </div>
          <div 
            className="text-[9px] font-mono font-bold tracking-widest transition-colors duration-1000"
            style={{ color: isSalty ? '#B44D36' : '#2B7A78' }}
          >
            {salinityStatus}
          </div>
        </div>

        {/* Cross-section SVG drawing */}
        <div className="w-full h-[160px] flex items-center justify-center my-1 relative">
          <svg 
            viewBox="0 0 200 200" 
            className="w-full h-full"
            role="img"
            aria-label="Soil salinity cross-section illustration. Shows taro plant root zone in relation to freshwater tables and saltwater intrusion."
          >
            <title>Soil Roots Salinity Cross Section</title>
            <desc>Visual cross-section showing root zone, freshwater table, and the salt water table rising under intrusion.</desc>
            <defs>
              <linearGradient id="healthy-water" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="salt-intrusion" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#b44d36" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#7a2b1c" stopOpacity="0.1" />
              </linearGradient>
              <pattern id="salty-grain" width="10" height="10" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="0.8" fill="#e8dcc8" opacity={isSalty ? 0.35 : 0.0} />
                <circle cx="7" cy="6" r="0.8" fill="#e8dcc8" opacity={isSalty ? 0.25 : 0.0} />
              </pattern>
            </defs>

            {/* Earth soil rect */}
            <rect 
              x="20" 
              y="100" 
              width="160" 
              height="100" 
              fill={soilColor} 
              rx="4"
              className="transition-colors duration-1000 ease-out" 
            />
            {/* Salt grain overlay on soil */}
            <rect 
              x="20" 
              y="100" 
              width="160" 
              height="100" 
              fill="url(#salty-grain)" 
              rx="4"
              style={{ pointerEvents: 'none' }}
            />

            {/* Saltwater table rises from bottom */}
            <rect
              x="20"
              y={waterTableY}
              width="160"
              height={waterTableHeight}
              fill={isSalty ? 'url(#salt-intrusion)' : 'url(#healthy-water)'}
              rx="2"
              className="transition-all duration-1000 ease-out"
            />
            
            {/* Water table boundary line */}
            <line
              x1="20"
              y1={waterTableY}
              x2="180"
              y2={waterTableY}
              stroke={isSalty ? '#b44d36' : '#2563eb'}
              strokeWidth="1.5"
              strokeDasharray={isSalty ? '3,3' : 'none'}
              className="transition-all duration-1000 ease-out"
            />
            
            <text
              x="100"
              y={waterTableY - 6}
              textAnchor="middle"
              fill={isSalty ? '#ff6b6b' : '#3b82f6'}
              fontSize="7px"
              fontWeight="bold"
              fontFamily="Inter, sans-serif"
              letterSpacing="0.5px"
              className="transition-all duration-1000 ease-out"
              opacity={isSalty ? 0.95 : 0.35}
            >
              {isSalty ? 'SALTWATER WATER TABLE INTRUSION' : 'SAFE FRESHWATER WATER TABLE'}
            </text>

            {/* Taro Plant Vector above ground (y=100 is ground) */}
            <g transform="translate(100, 100)">
              {/* Taro Leaf 1 (Left) */}
              <path 
                d="M 0,-5 C -20,-10 -35,-5 -30,12 C -28,25 -10,18 0,-5" 
                fill={leafColor} 
                opacity="0.85"
                transform="rotate(-25)"
                className="transition-colors duration-1000 ease-out"
              />
              {/* Taro Leaf 2 (Right) */}
              <path 
                d="M 0,-5 C 20,-12 35,-8 32,10 C 30,22 12,16 0,-5" 
                fill={leafColor} 
                opacity="0.85"
                transform="rotate(20)"
                className="transition-colors duration-1000 ease-out"
              />
              {/* Taro Center Shoot */}
              <path 
                d="M -3,-5 C -5,-25 5,-32 8,-35 C 10,-32 12,-20 3,-5" 
                fill={leafColor} 
                className="transition-colors duration-1000 ease-out"
              />

              {/* Taro Root Corm (Tuber) inside soil */}
              <path 
                d="M -12,0 C -12,25 0,38 0,38 C 0,38 12,25 12,0 Z" 
                fill="#8f8073" 
                stroke={rootColor}
                strokeWidth="1.5"
                className="transition-colors duration-1000 ease-out"
              />

              {/* Root fibers branching into water table zone */}
              <g stroke={rootColor} strokeWidth="1" fill="none" className="transition-colors duration-1000 ease-out">
                {/* Center root */}
                <path d="M 0,38 Q -5,60 2,80 Q 5,100 -2,110" opacity={isSalty ? 0.4 : 0.8} />
                {/* Left roots */}
                <path d="M -8,25 Q -25,45 -18,65 Q -10,85 -15,95" opacity={isSalty ? 0.3 : 0.7} />
                {/* Right roots */}
                <path d="M 8,25 Q 22,48 15,70 Q 10,85 18,102" opacity={isSalty ? 0.3 : 0.7} />
                {/* Fine root hairs (fade out completely when salinized) */}
                <path d="M -3,50 L -12,55 M 3,55 L 12,60 M -6,70 L -15,75 M 5,72 L 14,76" opacity={isSalty ? 0.05 : 0.5} />
              </g>
            </g>
          </svg>
        </div>

        {/* High-Contrast glowing amber-red glassmorphic alert banner */}
        <div className="z-10 mt-2 transition-all duration-500">
          {isSalty ? (
            <div className="p-4 bg-[#B44D36]/20 border border-[#B44D36]/40 rounded-none flex gap-3 items-start backdrop-blur-md">
              <AlertTriangle className="w-5 h-5 text-[#ff6b6b] shrink-0 mt-0.5 animate-pulse" />
              <div className="text-xs text-shell-white leading-relaxed">
                <strong className="text-[#ff6b6b] block mb-0.5 tracking-wide uppercase font-display font-bold text-[10px]">SALTWATER INTRUSION CRITICAL</strong>
                Sea water pushes inland, raising the saline water table into the root zone. Taro roots rot completely, collapsing food security.
              </div>
            </div>
          ) : (
            <div className="p-4 bg-[#2B7A78]/15 border border-[#2B7A78]/35 rounded-none flex gap-3 items-start backdrop-blur-md">
              <ShieldCheck className="w-5 h-5 text-[#2B7A78] shrink-0 mt-0.5" />
              <div className="text-xs text-[#E8DCC8]/90 leading-relaxed">
                <strong className="text-[#2B7A78] block mb-0.5 tracking-wide uppercase font-display font-bold text-[10px]">OPTIMAL SOIL HEALTH</strong>
                Freshwater table sits deep. Taro roots absorb nutrients cleanly, preserving agricultural yields and local food sovereignty.
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
