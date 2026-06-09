import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

type MetricType = 'temperature' | 'sealevel' | 'rainfall' | 'cropyield' | 'taxes';

interface MetricDef {
  id: MetricType;
  label: string;
  color: string;
  unit: string;
  extractData: (rawData: any) => { year: number; value: number }[];
}

const metrics: Record<MetricType, MetricDef> = {
  temperature: {
    id: 'temperature',
    label: 'Temperature Anomaly',
    color: '#e63946',
    unit: '°C',
    extractData: (rawData: any) => rawData.temperature.map((d: any) => ({ year: d.year, value: d.anomaly }))
  },
  sealevel: {
    id: 'sealevel',
    label: 'Sea Level Rise',
    color: '#3A7DFF',
    unit: 'mm',
    extractData: (rawData: any) => rawData.sealevel.map((d: any) => ({ year: d.year, value: d.level }))
  },
  rainfall: {
    id: 'rainfall',
    label: 'Rainfall Anomaly',
    color: '#8899a6',
    unit: '%',
    extractData: (rawData: any) => rawData.rainfall.map((d: any) => ({ year: d.year, value: d.anomaly }))
  },
  cropyield: {
    id: 'cropyield',
    label: 'Taro Yield',
    color: '#FF9F43',
    unit: 't/ha',
    extractData: (rawData: any) => rawData.cropyield.map((d: any) => ({ year: d.year, value: d.taro }))
  },
  taxes: {
    id: 'taxes',
    label: 'Env. Tax',
    color: '#00d4aa',
    unit: '% GDP',
    extractData: (rawData: any) => rawData.taxes.map((d: any) => ({ year: d.year, value: d.taxPercent }))
  }
};

export default function SynthesisExplorer() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [metricA, setMetricA] = useState<MetricType>('temperature');
  const [metricB, setMetricB] = useState<MetricType>('cropyield');
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, title: '', value: '', subtitle: '', color: '' });
  const width = 800;
  const height = 420;

  const [allData, setAllData] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      d3.json('/data/temperature.json'),
      d3.json('/data/sealevel.json'),
      d3.json('/data/rainfall.json'),
      d3.json('/data/cropyield.json'),
      d3.json('/data/taxes.json')
    ]).then(([temperature, sealevel, rainfall, cropyield, taxes]) => {
      setAllData({ temperature, sealevel, rainfall, cropyield, taxes });
    });
  }, []);

  useEffect(() => {
    if (!svgRef.current || !allData) return;
    
    const svg = d3.select(svgRef.current);

    const margin = { top: 20, right: 60, bottom: 90, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    
    const innerHeightFocus = height - margin.top - margin.bottom - 40;
    const innerHeightContext = 25;
    const contextY = innerHeightFocus + 45;

    svg.attr('viewBox', `0 0 ${width} ${height}`)
       .attr('preserveAspectRatio', 'xMidYMid meet');

    // STRUCTURE SETUP (Only runs if empty)
    let g = svg.select<SVGGElement>('g.main-container');
    if (g.empty()) {
      g = svg.append('g').attr('class', 'main-container').attr('transform', `translate(${margin.left},${margin.top})`);
      
      const gFocus = g.append('g').attr('class', 'focus');
      const gContext = g.append('g').attr('class', 'context').attr('transform', `translate(0, ${contextY})`);
      
      const gridG = gFocus.append('g').attr('class', 'd3-grid').attr('opacity', 0.08);
      gridG.append('g').attr('class', 'grid-x').attr('transform', `translate(0,${innerHeightFocus})`);
      gridG.append('g').attr('class', 'grid-y');

      gFocus.append('g').attr('class', 'x-axis').attr('transform', `translate(0,${innerHeightFocus})`);
      gFocus.append('text').attr('class', 'x-axis-label').attr('x', innerWidth / 2).attr('y', innerHeightFocus + 35).attr('text-anchor', 'middle');

      gFocus.append('g').attr('class', 'y-axis');
      gFocus.append('text').attr('class', 'y-axis-label').attr('transform', 'rotate(-90)').attr('y', -45).attr('x', -innerHeightFocus / 2).attr('text-anchor', 'middle');

      gContext.append('path').attr('class', 'context-line').attr('fill', 'none').attr('stroke-width', 1.5).attr('opacity', 0.4);
      gContext.append('g').attr('class', 'x-axis-context').attr('transform', `translate(0,${innerHeightContext})`);
      gContext.append('g').attr('class', 'brush');

      gFocus.append('line').attr('class', 'regression-line').attr('stroke', '#64ffda').attr('stroke-width', 2).attr('stroke-dasharray', '4,4').attr('opacity', 0);
      gFocus.append('g').attr('class', 'scatter-dots');
    }

    const gFocus = g.select<SVGGElement>('.focus');
    const gContext = g.select<SVGGElement>('.context');

    // Extract Data
    const dataA = metrics[metricA].extractData(allData);
    const dataB = metrics[metricB].extractData(allData);

    const allYears = Array.from(new Set([...dataA.map(d => d.year), ...dataB.map(d => d.year)])).sort();
    if (allYears.length === 0) return;

    const minYear = allYears[0];
    const maxYear = allYears[allYears.length - 1];

    // Scales
    const x_extent = d3.extent(dataA, d => d.value) as [number, number];
    const x_padding = (x_extent[1] - x_extent[0]) * 0.1 || 0.1;
    const xScale = d3.scaleLinear().domain([x_extent[0] - x_padding, x_extent[1] + x_padding]).range([0, innerWidth]);

    const y_extent = d3.extent(dataB, d => d.value) as [number, number];
    const y_padding = (y_extent[1] - y_extent[0]) * 0.1 || 0.1;
    const yScale = d3.scaleLinear().domain([y_extent[0] - y_padding, y_extent[1] + y_padding]).range([innerHeightFocus, 0]);

    const xScaleContext = d3.scaleLinear().domain([minYear, maxYear]).range([0, innerWidth]);
    const yScaleContext = d3.scaleLinear().domain(x_extent).range([innerHeightContext, 0]);

    const t = d3.transition().duration(800).ease(d3.easeCubicInOut);

    // Update Gridlines
    gFocus.select<SVGGElement>('.grid-x').transition(t as any).call(d3.axisBottom(xScale).tickSize(-innerHeightFocus).tickFormat('' as any).ticks(8) as any);
    gFocus.select<SVGGElement>('.grid-y').transition(t as any).call(d3.axisLeft(yScale).tickSize(-innerWidth).tickFormat('' as any).ticks(5) as any);

    // Update Axes
    const xAxis = d3.axisBottom(xScale).ticks(8);
    const yAxis = d3.axisLeft(yScale).ticks(5);

    gFocus.select<SVGGElement>('.x-axis').transition(t as any).call(xAxis as any)
      .selectAll('text').attr('fill', metrics[metricA].color).attr('font-size', '10px').attr('font-family', 'Inter');
    gFocus.select<SVGGElement>('.y-axis').transition(t as any).call(yAxis as any)
      .selectAll('text').attr('fill', metrics[metricB].color).attr('font-size', '10px');

    gFocus.select('.x-axis-label')
      .attr('fill', metrics[metricA].color).attr('font-size', '11px').attr('font-weight', 'bold').attr('font-family', 'JetBrains Mono, monospace')
      .text(`${metrics[metricA].label} (${metrics[metricA].unit})`);

    gFocus.select('.y-axis-label')
      .attr('fill', metrics[metricB].color).attr('font-size', '11px').attr('font-weight', 'bold').attr('font-family', 'JetBrains Mono, monospace')
      .text(`${metrics[metricB].label} (${metrics[metricB].unit})`);

    // Context Line
    const lineContext = d3.line<{ year: number; value: number }>()
      .defined(d => !isNaN(d.value))
      .x(d => xScaleContext(d.year))
      .y(d => yScaleContext(d.value))
      .curve(d3.curveBasis);

    gContext.select('.context-line')
      .datum(dataA)
      .transition(t as any)
      .attr('stroke', metrics[metricA].color)
      .attr('d', lineContext as any);

    gContext.select<SVGGElement>('.x-axis-context')
      .call(d3.axisBottom(xScaleContext).tickFormat(d3.format('d') as any).ticks(5) as any)
      .selectAll('text').attr('fill', 'rgba(168, 178, 209, 0.4)').attr('font-size', '9px');

    // Scatter Data
    const scatterData = allYears.map(year => {
      const a = dataA.find(d => d.year === year)?.value;
      const b = dataB.find(d => d.year === year)?.value;
      return { year, a, b, _inBrush: true };
    }).filter(d => d.a !== undefined && d.b !== undefined && !isNaN(d.a) && !isNaN(d.b)) as {year: number, a: number, b: number, _inBrush: boolean}[];

    // Flying Dots (General Update Pattern)
    const dotsG = gFocus.select<SVGGElement>('.scatter-dots');
    const dots = dotsG.selectAll<SVGCircleElement, any>('.dot').data(scatterData, (d: any) => d.year);

    dots.enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.a))
      .attr('cy', d => yScale(d.b))
      .attr('r', 0) // animate in
      .attr('fill', metrics[metricB].color)
      .attr('stroke', '#020c1b')
      .attr('stroke-width', 1)
      .merge(dots as any)
      .on('pointermove', function(event, d) {
        d3.select(this).attr('fill', '#e6f1ff').attr('r', 8).attr('stroke', '#64ffda');
        setTooltip({
          visible: true,
          x: event.clientX,
          y: event.clientY,
          title: `Year ${d.year}`,
          subtitle: 'Correlation Data',
          value: `${metrics[metricA].label}: ${d.a.toFixed(2)}${metrics[metricA].unit}\n${metrics[metricB].label}: ${d.b.toFixed(2)}${metrics[metricB].unit}`,
          color: '#e6f1ff'
        });
      })
      .on('pointerleave', function() {
        d3.select(this)
          .attr('fill', (d: any) => d._inBrush ? metrics[metricB].color : 'rgba(168, 178, 209, 0.2)')
          .attr('r', (d: any) => d._inBrush ? 5 : 3)
          .attr('stroke', '#020c1b');
        setTooltip(prev => ({ ...prev, visible: false }));
      })
      .transition(t as any) // Flying animation
      .attr('cx', d => xScale(d.a))
      .attr('cy', d => yScale(d.b))
      .attr('r', (d: any) => d._inBrush ? 5 : 3)
      .attr('fill', (d: any) => d._inBrush ? metrics[metricB].color : 'rgba(168, 178, 209, 0.2)');

    dots.exit()
      .transition(t as any)
      .attr('r', 0)
      .remove();

    const regressionLine = gFocus.select('.regression-line');

    const calculateRegression = (data: {a: number, b: number}[]) => {
      const n = data.length;
      if (n < 2) return null;
      let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
      data.forEach(d => {
        sumX += d.a; sumY += d.b; sumXY += d.a * d.b; sumXX += d.a * d.a;
      });
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      return { slope, intercept };
    };

    // Brush Selection
    const brushed = (event: any) => {
      const selection = event.selection;
      let domain: [number, number];
      
      if (!selection) {
        domain = [minYear, maxYear];
      } else {
        domain = [xScaleContext.invert(selection[0]), xScaleContext.invert(selection[1])];
      }
      
      const [minY, maxY] = domain;
      const visibleData = scatterData.filter(d => d.year >= minY && d.year <= maxY);
      
      // Update dots immediately during brush
      dotsG.selectAll<SVGCircleElement, any>('.dot').each(function(d: any) {
        d._inBrush = d.year >= minY && d.year <= maxY;
        d3.select(this)
          .attr('fill', d._inBrush ? metrics[metricB].color : 'rgba(168, 178, 209, 0.1)')
          .attr('opacity', d._inBrush ? 0.9 : 0.3)
          .attr('r', d._inBrush ? 5 : 3);
      });

      // Update Regression Line
      const reg = calculateRegression(visibleData);
      if (reg) {
        const vX = visibleData.map(d => d.a);
        if (vX.length > 1) {
          const minVX = d3.min(vX)!;
          const maxVX = d3.max(vX)!;
          regressionLine
            .attr('x1', xScale(minVX))
            .attr('y1', yScale(reg.slope * minVX + reg.intercept))
            .attr('x2', xScale(maxVX))
            .attr('y2', yScale(reg.slope * maxVX + reg.intercept))
            .attr('opacity', 0.8);
        } else {
          regressionLine.attr('opacity', 0);
        }
      } else {
        regressionLine.attr('opacity', 0);
      }
    };

    // Initialize Brush
    const brush = d3.brushX()
      .extent([[0, 0], [innerWidth, innerHeightContext]])
      .on('brush', brushed)
      .on('end', brushed);

    let brushG = gContext.select<SVGGElement>('.brush');
    brushG.call(brush as any);

    // Set initial brush position (this triggers `brushed`)
    if (!(svg.node() as any).__brushInit) {
      brushG.call(brush.move as any, [xScaleContext(minYear), xScaleContext(maxYear)]);
      (svg.node() as any).__brushInit = true;
    } else {
      // Re-trigger brush to update colors/regression line without moving it
      const selection = d3.brushSelection(brushG.node() as SVGGElement);
      if (selection) brushed({ selection });
    }

    // A11y Update
    if (svg.select('desc').empty()) {
      svg.append('desc').attr('id', 'synth-desc');
      svg.append('title').attr('id', 'synth-title').text('Synthesis Explorer Chart');
      svg.attr('role', 'img').attr('aria-labelledby', 'synth-title synth-desc');
    }
    svg.select('desc').text(`Scatterplot showing correlation between ${metrics[metricA].label} and ${metrics[metricB].label}. Points represent individual years, with a regression line showing the trend over the brushed time period.`);

  }, [metricA, metricB, allData]);

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Metric Selectors Header */}
      <div className="w-full flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-[#0a192f] p-4 rounded-lg border border-[#233554]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-[#a8b2d1]">METRIC A:</span>
          <select 
            className="bg-[#112240] text-[#e6f1ff] border border-[#233554] rounded p-2 text-sm outline-none focus:border-[#64ffda]"
            value={metricA}
            onChange={(e) => setMetricA(e.target.value as MetricType)}
          >
            {Object.values(metrics).map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </div>
        
        <div className="text-[#64ffda] font-bold text-lg font-mono tracking-widest">VS</div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-[#a8b2d1]">METRIC B:</span>
          <select 
            className="bg-[#112240] text-[#e6f1ff] border border-[#233554] rounded p-2 text-sm outline-none focus:border-[#64ffda]"
            value={metricB}
            onChange={(e) => setMetricB(e.target.value as MetricType)}
          >
            {Object.values(metrics).map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div ref={containerRef} className="w-full relative bg-[#020c1b]/50 rounded-xl border border-[#233554] p-4 overflow-visible">
        <svg ref={svgRef} className="w-full overflow-visible" />
        
        {/* Interactive Brush Help Label */}
        <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none">
          <span className="text-[10px] font-mono text-[#5c6e8a] uppercase tracking-wider">
            ↔ Drag or resize the slider above to shift the timeline brush ↔
          </span>
        </div>

        {/* Tooltip Overlay */}
        {tooltip.visible && (
          <div className="chart-tooltip whitespace-pre-line" style={{ left: tooltip.x + 15, top: tooltip.y - 40 }}>
            <div className="text-[#e6f1ff] font-bold">{tooltip.title}</div>
            <div className="text-[#a8b2d1] text-xs">{tooltip.subtitle}</div>
            <div className="mt-1 font-mono text-xs text-[#64ffda]">{tooltip.value}</div>
          </div>
        )}
      </div>
    </div>
  );
}
