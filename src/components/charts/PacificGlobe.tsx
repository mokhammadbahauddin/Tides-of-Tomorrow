import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

export default function PacificGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number, y: number, name: string } | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    // Responsive Canvas Resizing
    let width = container.clientWidth;
    let height = container.clientHeight;
    
    // Pixel ratio for sharpness
    const dpr = window.devicePixelRatio || 1;

    const resizeCanvas = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.scale(dpr, dpr);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const projection = d3.geoOrthographic()
      .clipAngle(90)
      .precision(0.5);

    const path = d3.geoPath(projection, context);

    const pictNations = [
      { name: 'Tuvalu', coords: [-179, -9] },
      { name: 'Kiribati', coords: [173, 1] },
      { name: 'Fiji', coords: [178, -18] },
      { name: 'Samoa', coords: [-172, -13] },
      { name: 'Tonga', coords: [-175, -21] },
      { name: 'Solomon Islands', coords: [160, -9] },
      { name: 'Vanuatu', coords: [167, -15] },
      { name: 'Nauru', coords: [166, -0.5] },
      { name: 'Niue', coords: [-170, -19] },
      { name: 'Cook Islands', coords: [-159, -21] },
      { name: 'Guam', coords: [143, 13] },
      { name: 'Micronesia', coords: [158, 6] },
      { name: 'Marshall Islands', coords: [171, 7] },
      { name: 'Palau', coords: [134, 7] },
    ];

    let sphere = { type: 'Sphere' } as d3.GeoPermissibleObjects;
    let land: d3.GeoPermissibleObjects | null = null;
    let borders: d3.GeoPermissibleObjects | null = null;

    let rotationX = -160;
    const rotationY = -10;
    let animationId: number;
    let mousePos: [number, number] | null = null;

    // Tooltip interaction
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mousePos = [x, y];
    };
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', () => {
      mousePos = null;
      setTooltip(null);
    });

    d3.json('/data/world-110m.json').then((world: any) => {
      land = topojson.feature(world, world.objects.countries) as unknown as d3.GeoPermissibleObjects;
      borders = topojson.mesh(world, world.objects.countries, (a, b) => a !== b) as unknown as d3.GeoPermissibleObjects;
      render();
    });

    const render = () => {
      if (!context) return;
      
      rotationX += 0.05; // Spin

      // Update projection dynamically based on resized dimensions
      projection
        .scale(Math.min(width, height) / 2.2)
        .translate([width / 2, height / 2])
        .rotate([rotationX, rotationY, 0]);

      context.clearRect(0, 0, width, height);

      // Ocean / Sphere
      context.beginPath();
      path(sphere);
      context.fillStyle = 'rgba(6, 16, 24, 0.4)';
      context.fill();
      context.strokeStyle = 'rgba(100, 255, 218, 0.2)';
      context.lineWidth = 1;
      context.stroke();

      // Landmasses
      if (land) {
        context.beginPath();
        path(land);
        context.shadowBlur = 20;
        context.shadowColor = 'rgba(230, 57, 70, 0.8)';
        context.fillStyle = 'rgba(230, 57, 70, 0.7)';
        context.fill();
        context.shadowBlur = 0;
      }

      // Borders
      if (borders) {
        context.beginPath();
        path(borders);
        context.strokeStyle = 'rgba(168, 178, 209, 0.1)';
        context.lineWidth = 0.5;
        context.stroke();
      }

      let hoveredNation: any = null;

      // Draw Pacific Nations
      pictNations.forEach((nation) => {
        const p = projection(nation.coords as [number, number]);
        if (p) {
          const [x, y] = p;
          
          // Check collision
          if (mousePos) {
            const dist = Math.hypot(x - mousePos[0], y - mousePos[1]);
            if (dist < 8) {
              hoveredNation = nation;
            }
          }

          context.beginPath();
          context.arc(x, y, 4, 0, 2 * Math.PI);
          context.fillStyle = 'rgba(100, 255, 218, 0.3)';
          context.fill();

          context.beginPath();
          context.arc(x, y, 1.5, 0, 2 * Math.PI);
          context.fillStyle = '#64ffda';
          context.fill();
        }
      });

      if (hoveredNation && mousePos) {
        setTooltip({ x: mousePos[0], y: mousePos[1], name: hoveredNation.name });
      } else {
        setTooltip(null);
      }

      animationId = requestAnimationFrame(render);
    };

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 flex items-center justify-center opacity-90" style={{ mixBlendMode: 'screen' }}>
      <canvas 
        ref={canvasRef} 
        className="cursor-crosshair"
      />
      {tooltip && (
        <div 
          className="absolute pointer-events-none glass-card px-3 py-2 text-xs font-mono text-[#64ffda] border border-[#64ffda]/30 shadow-lg whitespace-nowrap"
          style={{ left: tooltip.x + 15, top: tooltip.y - 15 }}
        >
          {tooltip.name}
        </div>
      )}
    </div>
  );
}
