import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { Tooltip } from '@/components/Tooltip';

interface RainfallAnomalyRecord {
  year: number;
  anomaly: number;
  event?: string;
}

interface Props {
  activeStep?: number;
  selectedCountry?: { id: string; name: string };
}

export function RainfallAnomalyChart({ activeStep = 0, selectedCountry }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, title: '', value: '', subtitle: '', color: '' });
  const [rawData, setRawData] = useState<RainfallAnomalyRecord[]>([]);
  const width = 800;
  const height = 400;

  const chartStateRef = useRef<{ xScale: any, yScale: any, annotationGroup: any }>({ xScale: null, yScale: null, annotationGroup: null });
  const isVisibleRef = useRef<boolean>(false);
  const requestRef = useRef<number>(0);
  // Shared state for the particle system to read
  const particleStateRef = useRef({ intensity: 0, type: 'neutral' as 'rain' | 'drought' | 'neutral' });
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    d3.json<RainfallAnomalyRecord[]>('/data/rainfall.json').then((res) => {
      if (res) {
        setRawData(res);
      }
    }).catch((err) => { console.error('Failed to load chart data:', err); setHasError(true); });
  }, []);

  const isRegionalFallback = useMemo(() => {
    if (!selectedCountry || selectedCountry.id === 'REGIONAL') return false;
    if (rawData.length > 0) {
      return (rawData[0] as any)[selectedCountry.id] === undefined;
    }
    return false;
  }, [rawData, selectedCountry]);

  const data = useMemo(() => {
    const countryKey = selectedCountry?.id || 'REGIONAL';
    return rawData.map(d => {
      const rawVal = (d as any)[countryKey] !== undefined
        ? Number((d as any)[countryKey])
        : ((d as any).regional !== undefined ? Number((d as any).regional) : Number((d as any).anomaly));
      return {
        ...d,
        anomaly: rawVal
      } as any;
    });
  }, [rawData, selectedCountry]);

  const handleMouseMove = useCallback((event: MouseEvent, d: RainfallAnomalyRecord) => {
    const isPluvial = d.anomaly >= 0;
    const anomalyText = `${isPluvial ? '+' : ''}${d.anomaly.toFixed(1)}% Anomaly`;
    const anomalyType = isPluvial ? 'Pluvial Flooding / Deluge' : 'Severe Drought';

    // Update particle state on hover
    particleStateRef.current = {
      intensity: Math.abs(d.anomaly) / 20, // Normalize relative to max anomaly ~20%
      type: isPluvial ? 'rain' : 'drought'
    };

    setTooltip({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      title: `Year ${d.year}`,
      value: anomalyText,
      subtitle: anomalyType,
      color: isPluvial ? '#2B7A78' : '#C49A3C' // reef-teal / golden-hour
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    particleStateRef.current = { intensity: 0, type: 'neutral' };
    setTooltip(prev => ({ ...prev, visible: false }));
  }, []);

  // SVG Chart Setup
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${width} ${height}`)
       .attr('preserveAspectRatio', 'xMidYMid meet')
       .attr('role', 'img')
       .attr('aria-label', `Act IV: Diverging bar chart showing annual precipitation anomalies for ${selectedCountry?.name || 'Regional Average'} (1979-2025). Peak upward bars represent wet anomalies and downward bars represent droughts.`);

    svg.append('title').text('Rainfall Anomaly History');
    svg.append('desc').text('Diverging bar chart showing annual precipitation anomalies, with positive values in teal for rain and negative values in brown for drought.');

    const margin = { top: 30, right: 30, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('class', 'chart-group')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Drought Filter Definitions
    const defs = svg.append('defs');
    const filter = defs.append('filter').attr('id', 'drought-cracks');
    filter.append('feTurbulence')
      .attr('type', 'fractalNoise')
      .attr('baseFrequency', '0.04')
      .attr('numOctaves', '3')
      .attr('result', 'noise');
    filter.append('feColorMatrix')
      .attr('type', 'matrix')
      .attr('values', '1 0 0 0 0  0 0.8 0 0 0  0 0.2 0 0 0  0 0 0 3 -1') // Boost contrast of noise
      .attr('in', 'noise')
      .attr('result', 'coloredNoise');
    filter.append('feComposite')
      .attr('operator', 'in')
      .attr('in', 'coloredNoise')
      .attr('in2', 'SourceGraphic')
      .attr('result', 'composite');
    filter.append('feBlend')
      .attr('mode', 'multiply')
      .attr('in', 'composite')
      .attr('in2', 'SourceGraphic');

    // Bioluminescent Glow Filter
    const glowFilter = defs.append('filter')
      .attr('id', 'rain-bioluminescent-glow')
      .attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    glowFilter.append('feGaussianBlur').attr('stdDeviation', '6').attr('result', 'blur');
    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'blur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Define Premium Bar Gradients
    const rainGrad = defs.append('linearGradient')
      .attr('id', 'rain-bar-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    rainGrad.append('stop').attr('offset', '0%').attr('stop-color', '#2B7A78'); // reef-teal at tip
    rainGrad.append('stop').attr('offset', '100%').attr('stop-color', '#1E4D5C'); // tide-pool at baseline

    const droughtGrad = defs.append('linearGradient')
      .attr('id', 'drought-bar-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    droughtGrad.append('stop').attr('offset', '0%').attr('stop-color', '#8B7355'); // drift-wood at baseline
    droughtGrad.append('stop').attr('offset', '100%').attr('stop-color', '#C49A3C'); // golden-hour at tip

    // Colorblind-accessible patterns
    const rainPattern = defs.append('pattern')
      .attr('id', 'rain-stripe-pattern')
      .attr('width', 8)
      .attr('height', 8)
      .attr('patternUnits', 'userSpaceOnUse')
      .attr('patternTransform', 'rotate(45)');
    rainPattern.append('rect')
      .attr('width', 8)
      .attr('height', 8)
      .attr('fill', '#1E4D5C');
    rainPattern.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', 8)
      .attr('stroke', '#2B7A78')
      .attr('stroke-width', 2);

    const droughtPattern = defs.append('pattern')
      .attr('id', 'drought-hatch-pattern')
      .attr('width', 8)
      .attr('height', 8)
      .attr('patternUnits', 'userSpaceOnUse');
    droughtPattern.append('rect')
      .attr('width', 8)
      .attr('height', 8)
      .attr('fill', '#8B7355');
    droughtPattern.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 8)
      .attr('y2', 8)
      .attr('stroke', '#C49A3C')
      .attr('stroke-width', 1.2);
    droughtPattern.append('line')
      .attr('x1', 8)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', 8)
      .attr('stroke', '#C49A3C')
      .attr('stroke-width', 1.2);

    // Scales
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.year.toString()))
      .range([0, innerWidth])
      .padding(0.2);

    const maxAbs = d3.max(data, d => Math.abs(d.anomaly)) || 20;
    const yScale = d3.scaleLinear()
      .domain([-maxAbs, maxAbs])
      .range([innerHeight, 0]);

    // Axes
    const xAxis = d3.axisBottom(xScale)
      .tickValues(xScale.domain().filter(d => parseInt(d) % 5 === 0));

    const yAxis = d3.axisLeft(yScale)
      .ticks(6)
      .tickFormat(d => `${(d as number) > 0 ? '+' : ''}${d}%`);

    // Add Axes
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${yScale(0)})`) // Place at 0 baseline
      .call(xAxis)
      .call(g => g.select(".domain").remove()) // Hide axis line
      .selectAll('text')
      .attr('fill', 'rgba(232, 220, 200, 0.4)')
      .attr('font-size', '10px')
      .attr('font-family', 'Inter')
      .attr('dy', d => (d as number) % 2 === 0 ? 15 : 25); // Stagger labels so they don't overlap

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .call(g => g.select(".domain").remove()) // Hide axis line
      .selectAll('text')
      .attr('fill', 'rgba(232, 220, 200, 0.4)')
      .attr('font-size', '10px');

    // Remove the manual domain stroke to keep it clean
    // g.selectAll('.domain').attr('stroke', 'rgba(212, 165, 116, 0.15)');
    g.selectAll('.tick line').attr('stroke', 'rgba(212, 165, 116, 0.05)');

    // Draw Bars
    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.year.toString())!)
      .attr('width', xScale.bandwidth())
      .attr('y', d => d.anomaly >= 0 ? yScale(d.anomaly) : yScale(0))
      .attr('height', d => Math.abs(yScale(d.anomaly) - yScale(0)))
      .attr('fill', d => d.anomaly >= 0 ? 'url(#rain-stripe-pattern)' : 'url(#drought-hatch-pattern)')
      .attr('opacity', 0.85)
      .style('cursor', 'crosshair')
      .style('filter', d => d.anomaly < -10 ? 'url(#drought-cracks) url(#rain-bioluminescent-glow)' : 'url(#rain-bioluminescent-glow)')
      .on('pointermove', function(event, d) {
        d3.select(this).attr('opacity', 1).attr('stroke', '#ffffff').attr('stroke-width', 1);
        handleMouseMove(event as unknown as MouseEvent, d);
      })
      .on('pointerleave', function() {
        d3.select(this).attr('opacity', 0.8).attr('stroke', 'none');
        handleMouseLeave();
      });

    // Cyclone Annotations dynamically fetched from data
    const cyclones = data.filter(d => d.event);

    const annotationGroup = g.append('g').attr('class', 'cyclone-annotations').attr('opacity', 0);
    
    cyclones.forEach(c => {
      const yearStr = c.year.toString();
      // Need to make sure the year exists in the scale domain
      if (xScale.domain().includes(yearStr)) {
        // Stagger adjacent cyclone labels vertically to prevent overlap
        let offset = 25;
        if (c.year === 2015) offset = 40; // Push Pam higher
        if (c.year === 2016) offset = 20; // Keep Winston lower

        const xPos = xScale(yearStr)! + xScale.bandwidth() / 2;
        const dataPoint = data.find(d => d.year === c.year) || { anomaly: 10 };
        const yPos = yScale(dataPoint.anomaly >= 0 ? dataPoint.anomaly : 0) - offset;

        const group = annotationGroup.append('g')
          .attr('transform', `translate(${xPos}, ${yPos})`);
          
        group.append('circle')
          .attr('r', 12)
          .attr('fill', 'rgba(15, 34, 55, 0.85)')
          .attr('stroke', '#B44D36')
          .attr('stroke-width', 2);
          
        // Simplified Cyclone swirl path
        group.append('path')
          .attr('d', 'M -4,-2 C -2,-5 2,-5 4,-2 C 5,0 4,2 2,3 C 0,4 -2,3 -3,1')
          .attr('fill', 'none')
          .attr('stroke', '#B44D36')
          .attr('stroke-width', 1.5);
          
        group.append('text')
          .attr('y', -18)
          .attr('text-anchor', 'middle')
          .attr('fill', '#B44D36')
          .attr('font-size', '10px')
          .attr('font-weight', 'bold')
          .attr('font-family', 'JetBrains Mono, monospace')
          .attr('paint-order', 'stroke')
          .attr('stroke', '#0B1A2E')
          .attr('stroke-width', '3px')
          .attr('stroke-linejoin', 'round')
          .text(c.event || '');
          
        group.append('line')
          .attr('x1', 0)
          .attr('y1', 12)
          .attr('x2', 0)
          .attr('y2', offset)
          .attr('stroke', '#B44D36')
          .attr('stroke-width', 1.5)
          .attr('stroke-dasharray', '2,2');
      }
    });

    // Save refs for activeStep changes
    chartStateRef.current = { xScale, yScale, annotationGroup };
  }, [handleMouseMove, handleMouseLeave, data]);

  // Handle activeStep transitions for the chart highlights
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    if (svg.empty()) return;

    svg.selectAll('.bar')
      .transition()
      .duration(1000)
      .attr('opacity', (d: any) => {
        if (activeStep === 1) {
          // Highlight 2015 Cyclone Pam
          return d.year === 2015 ? 1 : 0.2;
        } else if (activeStep >= 2) {
          // Highlight Era of Constant Recovery (post 1990)
          return d.year >= 1990 ? 0.9 : 0.2;
        }
        return 0.8;
      })
      .attr('fill', (d: any) => {
        if (activeStep >= 1 && [2015, 2016, 2020].includes(d.year)) return '#B44D36'; // Violent terracotta for Cyclones
        return d.anomaly >= 0 ? 'url(#rain-stripe-pattern)' : 'url(#drought-hatch-pattern)';
      });

    const annotationGroup = chartStateRef.current.annotationGroup;
    if (annotationGroup) {
      annotationGroup.transition().duration(1000).attr('opacity', activeStep >= 1 ? 1 : 0);
    }

    // Auto-trigger particle system based on narrative step if not hovering
    if (activeStep === 0) {
      particleStateRef.current = { intensity: 0.6, type: 'rain' }; // Ambient rain at start
    } else if (activeStep === 1) {
      particleStateRef.current = { intensity: 1.8, type: 'rain' }; // Heavy storm rain
    } else if (activeStep === 2) {
      // Toggle between drought and rain to simulate whiplash
      const interval = setInterval(() => {
        particleStateRef.current = { 
          intensity: 1.2, 
          type: Math.random() > 0.5 ? 'rain' : 'drought' 
        };
      }, 2000);
      return () => clearInterval(interval);
    } else {
      particleStateRef.current = { intensity: 0.6, type: 'rain' };
    }
  }, [activeStep, data]);

  // Canvas Particle System Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: {x: number, y: number, length: number, speed: number, alpha: number}[] = [];
    const maxParticles = 600;

    const render = () => {
      if (!isVisibleRef.current) {
        requestRef.current = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const state = particleStateRef.current;

      if (state.type !== 'neutral' && state.intensity > 0) {
        // Spawn particles
        const numToSpawn = Math.floor(state.intensity * (state.type === 'rain' ? 15 : 5));
        for (let i = 0; i < numToSpawn; i++) {
          if (particles.length < maxParticles) {
            particles.push({
              x: Math.random() * canvas.width,
              y: state.type === 'rain' ? -15 : canvas.height + 15,
              length: state.type === 'rain' ? Math.random() * 25 + 12 : Math.random() * 6 + 2,
              speed: state.type === 'rain' ? Math.random() * 12 + 12 : Math.random() * 2 + 1, // Rain falls fast, dust rises slowly
              alpha: Math.random() * 0.6 + 0.3
            });
          }
        }
      }

      // Update and Draw
      ctx.lineCap = 'round';

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        ctx.beginPath();
        if (state.type === 'rain') {
          ctx.lineWidth = 1.8;
          ctx.strokeStyle = `rgba(224, 242, 254, ${p.alpha})`; // Bright glowing ice-blue (#e0f2fe)
          ctx.moveTo(p.x, p.y);
          p.y += p.speed;
          // Rain falls diagonally due to wind
          p.x += p.speed * 0.25;
          ctx.lineTo(p.x, p.y + p.length);
        } else if (state.type === 'drought') {
          ctx.lineWidth = 3;
          ctx.strokeStyle = `rgba(245, 158, 11, ${p.alpha})`; // Bright amber (#f59e0b)
          ctx.moveTo(p.x, p.y);
          p.y -= p.speed; // Dust rises
          p.x += Math.sin(p.y * 0.05) * 2; // Drift
          ctx.arc(p.x, p.y, p.length/2, 0, Math.PI * 2);
          ctx.fillStyle = ctx.strokeStyle;
          ctx.fill();
        }
        ctx.stroke();

        // Remove dead particles
        if ((state.type === 'rain' && p.y > canvas.height) || (state.type === 'drought' && p.y < 0) || state.type === 'neutral') {
          particles.splice(i, 1);
        }
      }

      requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  // Intersection Observer for Canvas loop pause
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      ([entry]) => { isVisibleRef.current = entry.isIntersecting; },
      { threshold: 0.1 }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

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
      <div className="w-full h-[400px] rounded-none bg-gradient-to-r from-deep-ocean via-ocean-ink to-deep-ocean animate-pulse flex items-center justify-center">
        <p className="text-shell-white/50 font-body tracking-widest text-xs">LOADING RAINFALL DATA...</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden rounded-none">
      {isRegionalFallback && (
        <div className="absolute top-4 right-6 bg-[#0B1A2E]/80 border border-[#D4A574]/30 px-3 py-1.5 rounded-none backdrop-blur-sm z-10 flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-[#D4A574] animate-pulse" />
           <span className="text-[10px] font-mono text-[#E8DCC8] uppercase tracking-wider">Showing Regional Average (Country Data Unavailable)</span>
        </div>
      )}
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={400} 
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        style={{ mixBlendMode: 'screen', opacity: 0.8 }}
        aria-hidden="true"
      />
      <svg ref={svgRef} className="w-full relative z-10" />
      <Tooltip {...tooltip} />
    </div>
  );
}
