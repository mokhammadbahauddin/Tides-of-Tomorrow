import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { Tooltip } from '@/components/Tooltip';

interface RainfallAnomalyRecord {
  year: number;
  anomaly: number;
  event?: string;
}

interface Props {
  activeStep?: number;
}

export function RainfallAnomalyChart({ activeStep = 0 }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, title: '', value: '', subtitle: '', color: '' });
  const [data, setData] = useState<RainfallAnomalyRecord[]>([]);
  const width = 800;
  const height = 400;

  // Animation ref for canvas
  const requestRef = useRef<number>(0);
  // Shared state for the particle system to read
  const particleStateRef = useRef({ intensity: 0, type: 'neutral' as 'rain' | 'drought' | 'neutral' });

  useEffect(() => {
    d3.json<RainfallAnomalyRecord[]>('/data/rainfall.json').then((res) => {
      if (res) setData(res);
    });
  }, []);

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
      color: isPluvial ? '#3A7DFF' : '#f59e0b'
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
       .attr('preserveAspectRatio', 'xMidYMid meet');

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
      .selectAll('text')
      .attr('fill', '#a8b2d1')
      .attr('font-size', '10px')
      .attr('font-family', 'Inter')
      .attr('dy', d => (d as number) % 2 === 0 ? 15 : 25); // Stagger labels so they don't overlap

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .attr('fill', '#a8b2d1')
      .attr('font-size', '10px');

    g.selectAll('.domain').attr('stroke', 'rgba(168, 178, 209, 0.2)');
    g.selectAll('.tick line').attr('stroke', 'rgba(168, 178, 209, 0.2)');

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
      .attr('fill', d => d.anomaly >= 0 ? '#3A7DFF' : '#f59e0b')
      .attr('opacity', 0.8)
      .style('cursor', 'crosshair')
      .style('filter', d => d.anomaly < -10 ? 'url(#drought-cracks)' : 'none')
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
        const xPos = xScale(yearStr)! + xScale.bandwidth() / 2;
        const dataPoint = data.find(d => d.year === c.year) || { anomaly: 10 };
        const yPos = yScale(dataPoint.anomaly >= 0 ? dataPoint.anomaly : 0) - 25;

        const group = annotationGroup.append('g')
          .attr('transform', `translate(${xPos}, ${yPos})`);
          
        group.append('circle')
          .attr('r', 12)
          .attr('fill', 'rgba(10, 21, 38, 0.8)')
          .attr('stroke', '#ff5a5f')
          .attr('stroke-width', 2);
          
        // Simplified Cyclone swirl path
        group.append('path')
          .attr('d', 'M -4,-2 C -2,-5 2,-5 4,-2 C 5,0 4,2 2,3 C 0,4 -2,3 -3,1')
          .attr('fill', 'none')
          .attr('stroke', '#ff5a5f')
          .attr('stroke-width', 1.5);
          
        group.append('text')
          .attr('y', -20)
          .attr('text-anchor', 'middle')
          .attr('fill', '#ff5a5f')
          .attr('font-size', '10px')
          .attr('font-weight', 'bold')
          .attr('font-family', 'JetBrains Mono, monospace')
          .text(c.event || '');
          
        group.append('line')
          .attr('x1', 0)
          .attr('y1', 12)
          .attr('x2', 0)
          .attr('y2', 25)
          .attr('stroke', '#ff5a5f')
          .attr('stroke-width', 1.5)
          .attr('stroke-dasharray', '2,2');
      }
    });

    // Save refs for activeStep changes
    (svg.node() as any).__scales = { xScale, yScale };
    (svg.node() as any).__annotationGroup = annotationGroup;
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
        if (activeStep >= 1 && [2015, 2016, 2020].includes(d.year)) return '#ff5a5f'; // Violent red for Cyclones
        return d.anomaly >= 0 ? '#3A7DFF' : '#f59e0b';
      });

    const annotationGroup = (svg.node() as any).__annotationGroup;
    if (annotationGroup) {
      annotationGroup.transition().duration(1000).attr('opacity', activeStep >= 1 ? 1 : 0);
    }

    // Auto-trigger particle system based on narrative step if not hovering
    if (activeStep === 1) {
      particleStateRef.current = { intensity: 1.5, type: 'rain' }; // Massive storm
    } else if (activeStep === 2) {
      // Toggle between drought and rain to simulate whiplash
      const interval = setInterval(() => {
        particleStateRef.current = { 
          intensity: 0.8, 
          type: Math.random() > 0.5 ? 'rain' : 'drought' 
        };
      }, 2000);
      return () => clearInterval(interval);
    } else {
      particleStateRef.current = { intensity: 0, type: 'neutral' };
    }
  }, [activeStep, data]);

  // Canvas Particle System Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: {x: number, y: number, length: number, speed: number, alpha: number}[] = [];
    const maxParticles = 500;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const state = particleStateRef.current;

      if (state.type !== 'neutral' && state.intensity > 0) {
        // Spawn particles
        const numToSpawn = Math.floor(state.intensity * (state.type === 'rain' ? 20 : 5));
        for (let i = 0; i < numToSpawn; i++) {
          if (particles.length < maxParticles) {
            particles.push({
              x: Math.random() * canvas.width,
              y: state.type === 'rain' ? -10 : canvas.height + 10,
              length: state.type === 'rain' ? Math.random() * 20 + 10 : Math.random() * 5 + 2,
              speed: state.type === 'rain' ? Math.random() * 15 + 15 : Math.random() * 2 + 1, // Rain falls fast, dust rises slowly
              alpha: Math.random() * 0.5 + 0.2
            });
          }
        }
      }

      // Update and Draw
      ctx.lineWidth = state.type === 'rain' ? 1.5 : 3;
      ctx.lineCap = 'round';

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        ctx.beginPath();
        if (state.type === 'rain') {
          ctx.strokeStyle = `rgba(100, 200, 255, ${p.alpha})`;
          ctx.moveTo(p.x, p.y);
          p.y += p.speed;
          // Rain falls diagonally due to wind
          p.x += p.speed * 0.2;
          ctx.lineTo(p.x, p.y + p.length);
        } else if (state.type === 'drought') {
          ctx.strokeStyle = `rgba(245, 158, 11, ${p.alpha})`;
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

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden rounded-lg">
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={400} 
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        style={{ mixBlendMode: 'screen', opacity: 0.8 }}
      />
      <svg ref={svgRef} className="w-full relative z-10" />
      <Tooltip {...tooltip} />
    </div>
  );
}
