import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import gsap from 'gsap';
import { Play, RotateCcw } from 'lucide-react';
import { synthesisData } from '@/data/synthesisData';
import type { SynthesisData } from '@/data/synthesisData';

interface SynthesisExplorerProps {
  className?: string;
}

export const SynthesisExplorer: React.FC<SynthesisExplorerProps> = ({ className }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentYearIndex, setCurrentYearIndex] = useState(6); // Start at 2023 (index 6)
  
  // Animation state ref to clear timeouts
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!svgRef.current || !wrapperRef.current) return;

    const margin = { top: 40, right: 30, bottom: 60, left: 60 };
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

    // Scales
    const x = d3.scaleLinear().domain([0, 600]).range([0, width]); // Sea Level Rise (mm)
    const y = d3.scaleLinear().domain([0, 20]).range([height, 0]); // Tax Burden (%)
    const r = d3.scaleSqrt().domain([0, 100]).range([2, 30]); // Taro Yield (%)

    // Danger Zone Background
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'danger-gradient')
      .attr('x1', '0%').attr('y1', '100%')
      .attr('x2', '100%').attr('y2', '0%');
    
    gradient.append('stop').attr('offset', '0%').attr('stop-color', 'transparent');
    gradient.append('stop').attr('offset', '50%').attr('stop-color', 'rgba(230, 57, 70, 0.05)');
    gradient.append('stop').attr('offset', '100%').attr('stop-color', 'rgba(230, 57, 70, 0.3)');

    svg.append('rect')
      .attr('x', x(150)) // Starts getting dangerous after 150mm
      .attr('y', 0)
      .attr('width', width - x(150))
      .attr('height', height)
      .style('fill', 'url(#danger-gradient)')
      .style('opacity', 0.8);

    // Danger Zone Label
    svg.append('text')
      .attr('x', width - 10)
      .attr('y', 20)
      .attr('text-anchor', 'end')
      .style('fill', '#e63946')
      .style('font-family', 'Inter')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('opacity', 0.7)
      .text('CRITICAL DANGER ZONE');

    // Axes
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(6))
      .selectAll('text')
      .style('fill', '#a8b2d1')
      .style('font-family', 'Inter');

    svg.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat((d) => d + '%'))
      .selectAll('text')
      .style('fill', '#a8b2d1')
      .style('font-family', 'Inter');

    svg.selectAll('.domain').style('stroke', 'rgba(168, 178, 209, 0.2)');
    svg.selectAll('.tick line').style('stroke', 'rgba(168, 178, 209, 0.1)');

    // Axis Labels
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + 40)
      .attr('text-anchor', 'middle')
      .style('fill', '#a8b2d1')
      .style('font-family', 'Inter')
      .style('font-size', '12px')
      .text('Sea Level Rise (mm)');

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -45)
      .attr('x', -height / 2)
      .attr('text-anchor', 'middle')
      .style('fill', '#a8b2d1')
      .style('font-family', 'Inter')
      .style('font-size', '12px')
      .text('Environmental Tax (% of GDP)');

    // Path connecting points up to currentYearIndex
    const visibleData = synthesisData.slice(0, currentYearIndex + 1);
    
    const line = d3.line<SynthesisData>()
      .x((d) => x(d.seaLevelRise))
      .y((d) => y(d.taxBurden))
      .curve(d3.curveMonotoneX);

    // Draw historical line
    svg.append('path')
      .datum(visibleData.filter(d => !d.isProjection || d.year === 2023)) // Include 2023 to connect
      .attr('fill', 'none')
      .attr('stroke', '#64ffda')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .attr('opacity', 0.5)
      .attr('d', line);

    // Draw projected line (only visible if animating into projection)
    const projectedData = visibleData.filter(d => d.year >= 2023);
    if (projectedData.length > 1) {
      svg.append('path')
        .datum(projectedData)
        .attr('fill', 'none')
        .attr('stroke', '#e63946')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .attr('opacity', 0.8)
        .attr('d', line);
    }

    // Bubbles
    const bubbles = svg.selectAll('.bubble')
      .data(visibleData)
      .enter()
      .append('g')
      .attr('class', 'bubble')
      .attr('transform', d => `translate(${x(d.seaLevelRise)},${y(d.taxBurden)})`);

    bubbles.append('circle')
      .attr('r', d => r(d.taroYield))
      .style('fill', d => d.isProjection ? 'rgba(230, 57, 70, 0.6)' : 'rgba(100, 255, 218, 0.6)')
      .style('stroke', d => d.isProjection ? '#e63946' : '#64ffda')
      .style('stroke-width', 2);

    // Year Label on Bubbles
    bubbles.append('text')
      .attr('y', d => -r(d.taroYield) - 10)
      .attr('text-anchor', 'middle')
      .style('fill', '#e6f1ff')
      .style('font-family', 'Inter')
      .style('font-size', '10px')
      .style('font-weight', d => d.year === visibleData[visibleData.length-1].year ? 'bold' : 'normal')
      .text(d => d.year);

    // Pulse animation for the latest bubble
    const latestBubble = svg.selectAll('.bubble').filter((_d, i) => i === visibleData.length - 1).select('circle');
    if (isPlaying) {
      gsap.to(latestBubble.node(), {
        scale: 1.2,
        opacity: 0.8,
        yoyo: true,
        repeat: -1,
        duration: 0.5
      });
    }

  }, [currentYearIndex, isPlaying]);

  const handlePlay = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    
    // If at the end, reset to 2023
    if (currentYearIndex === synthesisData.length - 1) {
      setCurrentYearIndex(6); // 2023 index
    }

    const animateNext = (index: number) => {
      if (index < synthesisData.length - 1) {
        timeoutRef.current = setTimeout(() => {
          setCurrentYearIndex(index + 1);
          animateNext(index + 1);
        }, 1200); // 1.2s per frame
      } else {
        setIsPlaying(false);
      }
    };

    animateNext(currentYearIndex === synthesisData.length - 1 ? 6 : currentYearIndex);
  };

  const handleReset = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsPlaying(false);
    setCurrentYearIndex(6); // Reset to 2023
  };

  return (
    <div className={`w-full flex flex-col items-center ${className || ''}`}>
      <div ref={wrapperRef} className="w-full relative glass-card p-6 rounded-xl border border-[rgba(230,57,70,0.2)]">
        
        {/* Controls */}
        <div className="absolute top-6 left-6 z-10 flex items-center gap-4">
          <button 
            onClick={handlePlay}
            disabled={isPlaying}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-sm transition-all ${isPlaying ? 'bg-[#e63946]/20 text-[#e63946] cursor-not-allowed' : 'bg-[#64ffda]/10 text-[#64ffda] hover:bg-[#64ffda]/20'}`}
          >
            <Play className="w-4 h-4" />
            {isPlaying ? 'Predicting...' : 'Play Prediction (2023 - 2050)'}
          </button>
          <button 
            onClick={handleReset}
            className="p-2 rounded-full bg-[#112240] text-[#a8b2d1] hover:text-[#e6f1ff] transition-colors"
            title="Reset to 2023"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Legend Map */}
        <div className="absolute top-6 right-6 z-10 flex flex-col gap-2 bg-[#020c1b]/80 p-3 rounded-lg border border-[rgba(168,178,209,0.1)] backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs text-[#a8b2d1] font-mono">
            <span className="w-3 h-3 rounded-full bg-[rgba(100,255,218,0.6)] border border-[#64ffda]"></span>
            Historical (1993-2023)
          </div>
          <div className="flex items-center gap-2 text-xs text-[#a8b2d1] font-mono">
            <span className="w-3 h-3 rounded-full bg-[rgba(230,57,70,0.6)] border border-[#e63946]"></span>
            Projected (2030-2050)
          </div>
          <div className="flex items-center gap-2 text-xs text-[#a8b2d1] font-mono mt-1">
            <span className="w-3 h-3 rounded-full border border-[#a8b2d1]" style={{ width: '12px', height: '12px', display: 'inline-block' }}></span>
            Bubble Size = Taro Yield
          </div>
        </div>

        <svg ref={svgRef} className="w-full drop-shadow-xl" />
        
        {/* Story Overlay based on year */}
        {currentYearIndex >= 8 && (
          <div className="absolute bottom-16 right-16 max-w-sm glass-card border-[#e63946]/50 p-4 animate-fade-in">
            <h4 className="text-[#e63946] font-display font-bold text-lg mb-2">System Collapse</h4>
            <p className="text-sm text-[#ccd6f6]">As sea levels pass 300mm, taxes required for seawalls bankrupt the local economy, while crops fail entirely. This is not survival. This is forced relocation.</p>
          </div>
        )}
      </div>
    </div>
  );
};
