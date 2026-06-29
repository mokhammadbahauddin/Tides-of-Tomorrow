import { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import gsap from 'gsap';

interface TaxRecord {
  year: number;
  taxPercent: number;
  cumulative?: number;
}

interface PhysicsNode extends d3.SimulationNodeDatum {
  id: number;
  year: number;
  taxPercent: number;
  cumulative: number;
  radius: number;
  shapePoints: [number, number][];
}

interface TaxChartProps {
  activeStep: number;
  selectedCountry?: { id: string; name: string };
}

export default function TaxChart({ activeStep, selectedCountry }: TaxChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [rawData, setRawData] = useState<TaxRecord[]>([]);
  const [dimensions, setDimensions] = useState({ width: 600, height: 500 });
  const [hasError, setHasError] = useState(false);
  
  const simRef = useRef<d3.Simulation<PhysicsNode, undefined> | null>(null);
  const pivotRef = useRef({ xL: 165, leftPanY: 335 });

  // Set up ResizeObserver to measure actual width
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        if (width > 0) {
          setDimensions({ width, height: 520 });
        }
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Fetch Tax data
  useEffect(() => {
    d3.json<TaxRecord[]>('/data/taxes.json').then((res) => {
      if (res) {
        const cleanData = res
          .filter((d) => d && !isNaN(d.year))
          .sort((a, b) => a.year - b.year);
        setRawData(cleanData);
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
    let cumulativeSum = 0;
    return rawData.map(d => {
      const rawVal = (d as any)[countryKey] !== undefined
        ? Number((d as any)[countryKey])
        : ((d as any).regional !== undefined ? Number((d as any).regional) : Number((d as any).taxPercent));
      cumulativeSum += rawVal;
      return {
        ...d,
        taxPercent: parseFloat(rawVal.toFixed(2)),
        cumulative: parseFloat(cumulativeSum.toFixed(2))
      } as any;
    });
  }, [rawData, selectedCountry]);

  // Helper to generate volcanic rock jagged shapes
  const generateBasaltShape = (radius: number): [number, number][] => {
    const numPoints = 6 + Math.floor(Math.random() * 3); // 6-8 sides
    const points: [number, number][] = [];
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const r = radius * (0.8 + Math.random() * 0.35); // Jaggedness
      points.push([Math.cos(angle) * r, Math.sin(angle) * r]);
    }
    return points;
  };

  useEffect(() => {
    if (data.length === 0 || dimensions.width === 0 || !svgRef.current) return;

    const width = dimensions.width;
    const height = dimensions.height;
    
    // Clear previous SVG contents
    const svgEl = d3.select(svgRef.current);
    svgEl.selectAll('*').remove();

    svgEl
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto')
      .attr('role', 'img')
      .attr('aria-label', `Act VI: Physics-based balance scale simulation. Stacks volcanic rock boulders representing climate loss and damage on the left plate, tipping it downwards against local Pacific budgets on the right plate.`);

    svgEl.append('title').text('Climate Debt Balance Scale');
    svgEl.append('desc').text('An interactive balance scale physics simulation showing carbon debt boulders overloading local Pacific budgets.');

    // Create defs for gradients and filters
    const defs = svgEl.append('defs');

    // Glow filters
    const rockGlow = defs.append('filter')
      .attr('id', 'volcanic-glow')
      .attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    rockGlow.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'blur');
    const feMergeGlow = rockGlow.append('feMerge');
    feMergeGlow.append('feMergeNode').attr('in', 'blur');
    feMergeGlow.append('feMergeNode').attr('in', 'SourceGraphic');

    const scaleGlow = defs.append('filter')
      .attr('id', 'scale-glow')
      .attr('x', '-20%').attr('y', '-20%').attr('width', '140%').attr('height', '140%');
    scaleGlow.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'blur');
    const feMergeScale = scaleGlow.append('feMerge');
    feMergeScale.append('feMergeNode').attr('in', 'blur');
    feMergeScale.append('feMergeNode').attr('in', 'SourceGraphic');

    // Volcanic Rock texture gradients
    const basaltGrad = defs.append('linearGradient')
      .attr('id', 'basalt-core-gradient')
      .attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '100%');
    basaltGrad.append('stop').attr('offset', '0%').attr('stop-color', '#2a2e35');
    basaltGrad.append('stop').attr('offset', '50%').attr('stop-color', '#1c1e22');
    basaltGrad.append('stop').attr('offset', '100%').attr('stop-color', '#0e1012');

    // Scale components gradient
    const scaleGrad = defs.append('linearGradient')
      .attr('id', 'scale-gradient')
      .attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '100%');
    scaleGrad.append('stop').attr('offset', '0%').attr('stop-color', '#fbbf24');
    scaleGrad.append('stop').attr('offset', '50%').attr('stop-color', '#ffd700');
    scaleGrad.append('stop').attr('offset', '100%').attr('stop-color', '#f59e0b');

    const mainGroup = svgEl.append('g').attr('class', 'physics-world');

    // Grounded Scale configuration (Moved py higher and shortened strings for massive headroom)
    const px = width / 2;     // Pivot Center X
    const py = 195;           // Pivot Center Y (Higher pivot for top headroom)
    const halfLength = 145;   // Scale beam radius (Wider beam)
    const stringHeight = 95;  // Suspension height (Shorter strings)

    // Initial Scale positions (horizontal)
    const initAngle = 0;
    const initTheta = initAngle * Math.PI / 180;
    const initXL = px - halfLength * Math.cos(initTheta);
    const initYL = py + halfLength * Math.sin(initTheta);
    const initLeftPanY = initYL + stringHeight;

    const initXR = px + halfLength * Math.cos(initTheta);
    const initYR = py - halfLength * Math.sin(initTheta);
    const initRightPanY = initYR + stringHeight;

    pivotRef.current = { xL: initXL, leftPanY: initLeftPanY };

    // --- BACKGROUND STRUCTURAL AXIS (Center alignment helper) ---
    mainGroup.append('line')
      .attr('x1', px)
      .attr('y1', 30)
      .attr('x2', px)
      .attr('y2', height - 40)
      .attr('stroke', 'rgba(212, 165, 116, 0.04)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4');

    // --- RENDER DYNAMIC MOVING PARTS (BEAM & PANS) ---
    const movingGroup = mainGroup.append('g').attr('class', 'scale-moving-parts');

    // Beam Line
    const beam = movingGroup.append('line')
      .attr('class', 'scale-beam')
      .attr('x1', initXL)
      .attr('y1', initYL)
      .attr('x2', initXR)
      .attr('y2', initYR)
      .attr('stroke', '#fbbf24') // Bright yellow horizontal beam
      .attr('stroke-width', 4.5)
      .attr('stroke-linecap', 'round');

    // LEFT PAN GROUP
    const leftPanGroup = movingGroup.append('g').attr('class', 'left-pan-group');
    
    // Left Suspended Strings (Wider)
    const leftStrings = leftPanGroup.append('path')
      .attr('d', `M ${initXL} ${initYL} L ${initXL - 72} ${initLeftPanY} M ${initXL} ${initYL} L ${initXL + 72} ${initLeftPanY}`)
      .attr('stroke', 'rgba(212, 165, 116, 0.4)')
      .attr('stroke-width', 1.2)
      .attr('fill', 'none');

    // Left Plate (Wider)
    const leftPlate = leftPanGroup.append('rect')
      .attr('x', initXL - 80)
      .attr('y', initLeftPanY)
      .attr('width', 160)
      .attr('height', 8)
      .attr('rx', 2.5)
      .attr('fill', 'rgba(15, 34, 55, 0.85)')
      .attr('stroke', 'rgba(212, 165, 116, 0.35)')
      .attr('stroke-width', 1.5)
      .style('backdrop-filter', 'blur(4px)');

    // Left Label Text
    const leftLabel = leftPanGroup.append('text')
      .attr('x', initXL)
      .attr('y', initLeftPanY + 24)
      .attr('text-anchor', 'middle')
      .attr('fill', '#b44d36')
      .attr('font-size', '8px')
      .attr('font-family', 'Inter, sans-serif')
      .attr('font-weight', 'bold')
      .attr('letter-spacing', '0.5px')
      .text('CLIMATE LOSS & DAMAGE');

    // RIGHT PAN GROUP
    const rightPanGroup = movingGroup.append('g').attr('class', 'right-pan-group');

    // Right Suspended Strings (Wider)
    const rightStrings = rightPanGroup.append('path')
      .attr('d', `M ${initXR} ${initYR} L ${initXR - 72} ${initRightPanY} M ${initXR} ${initYR} L ${initXR + 72} ${initRightPanY}`)
      .attr('stroke', 'rgba(212, 165, 116, 0.4)')
      .attr('stroke-width', 1.2)
      .attr('fill', 'none');

    // Right Plate (Wider)
    const rightPlate = rightPanGroup.append('rect')
      .attr('x', initXR - 80)
      .attr('y', initRightPanY)
      .attr('width', 160)
      .attr('height', 8)
      .attr('rx', 2.5)
      .attr('fill', 'rgba(15, 34, 55, 0.85)')
      .attr('stroke', 'rgba(212, 165, 116, 0.35)')
      .attr('stroke-width', 1.5)
      .style('backdrop-filter', 'blur(4px)');

    // Right Label Text
    const rightLabel = rightPanGroup.append('text')
      .attr('x', initXR)
      .attr('y', initRightPanY + 24)
      .attr('text-anchor', 'middle')
      .attr('fill', '#2b7a78')
      .attr('font-size', '8px')
      .attr('font-family', 'Inter, sans-serif')
      .attr('font-weight', 'bold')
      .attr('letter-spacing', '0.5px')
      .text('LOCAL PACIFIC BUDGETS');

    // LOCAL ECONOMY ICONS (Sitting on the right plate)
    const rightAssets = rightPanGroup.append('g').attr('class', 'right-assets');

    // 1. Health Icon
    rightAssets.append('path')
      .attr('d', 'M -25 -10 C -28 -14 -33 -14 -33 -10 C -33 -6 -25 -1 -25 -1 C -25 -1 -17 -6 -17 -10 C -17 -14 -22 -14 -25 -10')
      .attr('fill', '#2b7a78')
      .attr('opacity', 0.8)
      .style('filter', 'url(#scale-glow)')
      .attr('transform', `translate(${initXR}, ${initRightPanY})`);

    // 2. Education Icon
    rightAssets.append('path')
      .attr('d', 'M -5 -9 L -1 -11 L -1 -4 L -5 -2 Z M 5 -9 L 1 -11 L 1 -4 L 5 -2 Z')
      .attr('fill', '#d4a574')
      .attr('opacity', 0.85)
      .style('filter', 'url(#scale-glow)')
      .attr('transform', `translate(${initXR}, ${initRightPanY})`);

    // 3. Development Icon
    rightAssets.append('path')
      .attr('d', 'M 17 -1 L 17 -8 L 22 -6 L 22 -11 L 27 -9 L 27 -2 Z')
      .attr('fill', '#2b7a78')
      .attr('opacity', 0.8)
      .style('filter', 'url(#scale-glow)')
      .attr('transform', `translate(${initXR}, ${initRightPanY})`);

    // Warnings overlays inside the right pan showing loss
    const warningLabel = rightPanGroup.append('text')
      .attr('x', initXR)
      .attr('y', initRightPanY - 24)
      .attr('text-anchor', 'middle')
      .attr('fill', '#b44d36')
      .attr('font-size', '8px')
      .attr('font-family', 'Inter, sans-serif')
      .attr('font-weight', 'bold')
      .attr('opacity', 0)
      .text('RESOURCE DISPLACEMENT');

    // --- RENDER GROUNDED STAND (FULCRUM COLUMN) ---
    // Rendered on top of moving beam so the pivot joint overlays cleanly
    const standGroup = mainGroup.append('g').attr('class', 'scale-stand');
    
    // Solid Horizontal Ground Anchor Line (so it doesn't float in empty space)
    standGroup.append('line')
      .attr('x1', 50)
      .attr('y1', height - 40)
      .attr('x2', width - 50)
      .attr('y2', height - 40)
      .attr('stroke', 'rgba(212, 165, 116, 0.15)')
      .attr('stroke-width', 1.5);

    // Triangular Pillar base block
    standGroup.append('polygon')
      .attr('points', `${px - 35},${height - 40} ${px + 35},${height - 40} ${px + 20},${height - 52} ${px - 20},${height - 52}`)
      .attr('fill', 'url(#scale-gradient)')
      .attr('opacity', 0.85);

    // Main central pillar column
    standGroup.append('line')
      .attr('x1', px)
      .attr('y1', py)
      .attr('x2', px)
      .attr('y2', height - 50)
      .attr('stroke', '#fbbf24') // Solid bright yellow scale body
      .attr('stroke-width', 6)
      .attr('stroke-linecap', 'round');

    // Center pivot bolt joint
    standGroup.append('circle')
      .attr('cx', px)
      .attr('cy', py)
      .attr('r', 5.5)
      .attr('fill', '#e8dcc8')
      .style('filter', 'url(#scale-glow)');

    // Initial Physics Nodes Setup
    // Adjusted initial Y offset to fall inside the top boundaries of the viewport (y=0 to y=50)
    // to prevent boulders from starting off-screen
    const physicsNodes: PhysicsNode[] = data.map((d, index) => {
      const radius = 10 + (d.taxPercent * 14); // radius range roughly 15px to 30px
      return {
        id: index,
        year: d.year,
        taxPercent: d.taxPercent,
        cumulative: d.cumulative || 0,
        radius: radius,
        shapePoints: generateBasaltShape(radius),
        x: initXL + (Math.random() - 0.5) * 80, // Wider initial spread
        y: py - 70 - index * 10, // Staggered drop closer to the plate (prevents getting stuck off-screen)
        vx: 0,
        vy: 0,
      };
    });

    // Create D3 Force Simulation centered on Left Pan (Lower strength allows natural pyramid stack)
    const sim = d3.forceSimulation<PhysicsNode>(physicsNodes)
      .alphaDecay(0.015) // Keep simulation running longer to allow all blocks to drop
      .force('gravity', d3.forceY<PhysicsNode>().y((d) => initLeftPanY - d.radius).strength(0.20))
      .force('centerX', d3.forceX<PhysicsNode>(initXL).strength(0.06)) // Reduced strength for wider spread
      .force('collide', d3.forceCollide<PhysicsNode>((d) => d.radius + 1.2).iterations(3));

    simRef.current = sim;

    // Render Boulders Group
    const bouldersGroup = mainGroup.append('g').attr('class', 'boulders');
    const boulders = bouldersGroup.selectAll('.boulder')
      .data(physicsNodes)
      .enter()
      .append('g')
      .attr('class', 'boulder')
      .style('cursor', 'pointer');

    // Volcanic Rock polygons
    boulders.append('polygon')
      .attr('points', (d) => d.shapePoints.map((p) => `${p[0]},${p[1]}`).join(' '))
      .attr('fill', 'url(#basalt-core-gradient)')
      .attr('stroke', '#b44d36')
      .attr('stroke-width', 2.0)
      .style('filter', 'url(#volcanic-glow)');

    // Glowing fissures
    boulders.append('path')
      .attr('d', (d) => {
        const p1 = d.shapePoints[0];
        const p2 = d.shapePoints[3];
        const p3 = d.shapePoints[1];
        const p4 = d.shapePoints[4];
        return `M ${p1[0]*0.55} ${p1[1]*0.55} L ${p2[0]*0.55} ${p2[1]*0.55} M ${p3[0]*0.5} ${p3[1]*0.5} L ${p4[0]*0.5} ${p4[1]*0.5}`;
      })
      .attr('stroke', '#ff6b6b')
      .attr('stroke-width', 1.0)
      .attr('opacity', 0.6)
      .attr('fill', 'none');

    // Year text
    boulders.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-2')
      .attr('fill', '#e8dcc8')
      .attr('font-size', '8px')
      .attr('font-family', "'Playfair Display', serif")
      .attr('font-weight', '700')
      .style('pointer-events', 'none')
      .text((d) => d.year);

    // Tax rate text
    boulders.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '7')
      .attr('fill', '#b44d36')
      .attr('font-size', '7px')
      .attr('font-family', 'Inter, sans-serif')
      .attr('font-weight', '700')
      .style('pointer-events', 'none')
      .text((d) => `${d.taxPercent}%`);

    // HUD Counter: Placed in the TOP-RIGHT corner to avoid overlaying with left pan boulders
    const hudGroup = svgEl.append('g')
      .attr('class', 'physics-hud')
      .attr('transform', `translate(${width - 250}, 45)`) // Moved to top-right
      .attr('opacity', activeStep === 1 ? 1 : 0);

    hudGroup.append('rect')
      .attr('width', 215)
      .attr('height', 50)
      .attr('fill', 'rgba(11, 26, 46, 0.85)')
      .attr('stroke', 'rgba(180, 77, 54, 0.35)')
      .attr('stroke-width', 1)
      .style('backdrop-filter', 'blur(4px)');

    hudGroup.append('text')
      .attr('x', 15)
      .attr('y', 20)
      .attr('fill', '#ff6b6b')
      .attr('font-family', 'Inter, sans-serif')
      .attr('font-size', '8px')
      .attr('letter-spacing', '1.2px')
      .text('ACCUMULATED LOSS & DAMAGE');

    const cumulativeText = hudGroup.append('text')
      .attr('x', 15)
      .attr('y', 40)
      .attr('fill', '#e8dcc8')
      .attr('font-family', "'Playfair Display', serif")
      .attr('font-size', '15px')
      .attr('font-weight', '700')
      .text('Total Debt: 0.00% of GDP');

    // Tooltip
    const tooltip = d3.select(containerRef.current).selectAll('.glass-tooltip').data([0]).join('div')
      .attr('class', 'glass-tooltip')
      .style('position', 'absolute')
      .style('opacity', 0)
      .style('pointer-events', 'none')
      .style('z-index', 10)
      .style('background', 'rgba(11, 26, 46, 0.95)')
      .style('border', '1px solid rgba(212, 165, 116, 0.3)')
      .style('backdrop-filter', 'blur(8px)')
      .style('padding', '12px')
      .style('border-radius', '0px')
      .style('color', '#E8DCC8')
      .style('font-family', 'Inter, sans-serif')
      .style('font-size', '12px')
      .style('box-shadow', 'none');

    boulders.on('mouseenter', function (event, d) {
      d3.select(this).select('polygon')
        .attr('stroke', '#ff6b6b')
        .attr('stroke-width', 3)
        .style('filter', 'none');

      tooltip.html(`
        <div style="font-weight:bold; color: #d4a574; font-family: 'Playfair Display', serif; font-size: 13px; margin-bottom: 5px;">YEAR ${d.year}</div>
        <div style="margin-bottom: 3px; color: rgba(232, 220, 200, 0.95);">Annual Climate Tax: <span style="font-weight:bold; color:#ff6b6b">${d.taxPercent.toFixed(2)}%</span> of GDP</div>
        <div style="color: #d4a574; font-size: 11px;">Compounded National Burden: <strong>${d.cumulative.toFixed(2)}%</strong> of GDP</div>
      `);

      tooltip
        .style('left', `${event.offsetX + 15}px`)
        .style('top', `${event.offsetY - 20}px`)
        .transition().duration(150).style('opacity', 1);
    })
    .on('mousemove', function (event) {
      tooltip
        .style('left', `${event.offsetX + 15}px`)
        .style('top', `${event.offsetY - 20}px`);
    })
    .on('mouseleave', function () {
      d3.select(this).select('polygon')
        .attr('stroke', '#b44d36')
        .attr('stroke-width', 2.0)
        .style('filter', 'url(#volcanic-glow)');

      tooltip.transition().duration(150).style('opacity', 0);
    });

    // Run-time physics tick
    sim.on('tick', () => {
      // Access dynamic values from pivotRef
      const { xL, leftPanY } = pivotRef.current;
      
      physicsNodes.forEach((node) => {
        // Flat floor boundary sitting on Left Plate
        const floorY = leftPanY - node.radius;
        if (node.y !== undefined && node.y > floorY) {
          node.y = floorY;
          node.vy = 0; // stop vertical velocity on pan contact
        }

        // Horizontal boundaries constraining nodes inside Left Plate width (160px wide)
        const limitLeft = xL - 74 + node.radius;
        const limitRight = xL + 74 - node.radius;
        if (node.x !== undefined) {
          if (node.x < limitLeft) {
            node.x = limitLeft;
            node.vx = 0;
          } else if (node.x > limitRight) {
            node.x = limitRight;
            node.vx = 0;
          }
        }
      });

      // Render positions
      boulders.attr('transform', (d) => `translate(${d.x}, ${d.y})`);
    });

    // Animate scale tipping based on activeStep
    const updatePhysicsLayout = (activeIdx: number) => {
      const targetAngle = activeIdx === 1 ? 16 : 0; // tilt 16 degrees
      const scaleState = { angle: activeIdx === 1 ? 0 : 16 };

      // Animate rotation angle via GSAP and direct DOM manipulation
      gsap.to(scaleState, {
        angle: targetAngle,
        duration: 1.5,
        ease: 'power3.out',
        onUpdate: () => {
          const theta = scaleState.angle * Math.PI / 180;
          
          // Re-calculate beam endpoints
          const curXL = px - halfLength * Math.cos(theta);
          const curYL = py + halfLength * Math.sin(theta);
          const curLeftPanY = curYL + stringHeight;

          const curXR = px + halfLength * Math.cos(theta);
          const curYR = py - halfLength * Math.sin(theta);
          const curRightPanY = curYR + stringHeight;

          // Push into pivotRef so simulation reads updated boundary parameters instantly
          pivotRef.current = { xL: curXL, leftPanY: curLeftPanY };

          // 1. Move beam endpoints
          beam.attr('x1', curXL).attr('y1', curYL).attr('x2', curXR).attr('y2', curYR);

          // 2. Translate Left Pan group (Wider)
          leftStrings.attr('d', `M ${curXL} ${curYL} L ${curXL - 72} ${curLeftPanY} M ${curXL} ${curYL} L ${curXL + 72} ${curLeftPanY}`);
          leftPlate.attr('x', curXL - 80).attr('y', curLeftPanY);
          leftLabel.attr('x', curXL).attr('y', curLeftPanY + 24);

          // 3. Translate Right Pan group (Wider)
          rightStrings.attr('d', `M ${curXR} ${curYR} L ${curXR - 72} ${curRightPanY} M ${curXR} ${curYR} L ${curXR + 72} ${curRightPanY}`);
          rightPlate.attr('x', curXR - 80).attr('y', curRightPanY);
          rightLabel.attr('x', curXR).attr('y', curRightPanY + 24);
          
          // Move local budget icons
          rightAssets.selectAll('path').attr('transform', `translate(${curXR}, ${curRightPanY})`);
          warningLabel.attr('x', curXR).attr('y', curRightPanY - 24);

          // Gently push D3 forces towards updated positions
          if (simRef.current) {
            simRef.current
              .force('centerX', d3.forceX<PhysicsNode>(curXL).strength(0.06))
              .force('gravity', d3.forceY<PhysicsNode>(curLeftPanY - 10).strength(0.20))
              .alpha(0.7)
              .restart();
          }
        }
      });

      // Animate readout overlays (HUD & Warnings)
      gsap.to(hudGroup.node(), {
        opacity: activeIdx === 1 ? 1 : 0,
        duration: 1.0,
      });

      gsap.to(warningLabel.node(), {
        opacity: activeIdx === 1 ? 0.95 : 0,
        duration: 1.0,
      });

      // Cumulative counter count-up
      if (activeIdx === 1) {
        const totalDebt = data[data.length - 1]?.cumulative || 0;
        let counter = { value: 0 };
        gsap.to(counter, {
          value: totalDebt,
          duration: 1.8,
          ease: 'power1.out',
          onUpdate: () => {
            cumulativeText.text(`Total Debt: ${counter.value.toFixed(2)}% of GDP`);
          },
        });
      }
    };

    // Watch step updates
    updatePhysicsLayout(activeStep);

    return () => {
      sim.stop();
      tooltip.remove();
    };
  }, [data, dimensions, activeStep]);

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
      <div className="w-full h-[520px] rounded-none bg-gradient-to-r from-[#0B1A2E] via-[#0F2237] to-[#0B1A2E] animate-pulse flex items-center justify-center">
        <p className="text-[#D4A574]/50 font-body tracking-widest text-xs uppercase">Loading Balance Scale...</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col items-center relative">
      {/* HUD Header: Placed nicely at top-left, adjusted padding */}
      <div className="absolute top-6 left-6 z-10 flex flex-col pointer-events-none">
        <span className="text-[8px] font-mono text-terracotta uppercase tracking-widest font-semibold">BALANCE SCALE SIMULATOR</span>
        <h4 className="text-xs font-display text-shell-white/70">{selectedCountry?.name || 'Regional'} Adaptation Cost vs Public Resource Balance</h4>
      </div>

      {isRegionalFallback && (
        <div className="absolute top-6 right-6 bg-[#0B1A2E]/80 border border-[#D4A574]/30 px-3 py-1.5 rounded-none backdrop-blur-sm z-10 flex items-center gap-2 mt-12 md:mt-0">
           <span className="w-2 h-2 rounded-full bg-[#D4A574] animate-pulse" />
           <span className="text-[10px] font-mono text-[#E8DCC8] uppercase tracking-wider">Showing Regional Average (Country Data Unavailable)</span>
        </div>
      )}

      <svg ref={svgRef} className="w-full" />
    </div>
  );
};
