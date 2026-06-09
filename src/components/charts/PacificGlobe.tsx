import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

export default function PacificGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    const width = canvas.width;
    const height = canvas.height;

    // Projection centered on the Pacific
    const projection = d3.geoOrthographic()
      .scale(width / 2.2)
      .translate([width / 2, height / 2])
      .clipAngle(90)
      .precision(0.5);

    const path = d3.geoPath(projection, context);

    // Some approximate PICT coordinates [longitude, latitude]
    const pictNations = [
      [-179, -9], // Tuvalu (approx)
      [173, 1],   // Kiribati
      [178, -18], // Fiji
      [-172, -13], // Samoa
      [-175, -21], // Tonga
      [160, -9],  // Solomon Islands
      [167, -15], // Vanuatu
      [166, -0.5], // Nauru
      [-170, -19], // Niue
      [-159, -21], // Cook Islands
      [143, 13],   // Guam
      [158, 6],    // Micronesia
      [171, 7],    // Marshall Islands
      [134, 7],    // Palau
    ];

    let sphere = { type: 'Sphere' } as d3.GeoPermissibleObjects;
    let land: d3.GeoPermissibleObjects | null = null;
    let borders: d3.GeoPermissibleObjects | null = null;

    let rotationX = -160; // Start centered on Pacific
    let rotationY = -10;
    
    // Animation frame request ID
    let animationId: number;

    d3.json('/data/world-110m.json').then((world: any) => {
      land = topojson.feature(world, world.objects.countries) as unknown as d3.GeoPermissibleObjects;
      borders = topojson.mesh(world, world.objects.countries, (a, b) => a !== b) as unknown as d3.GeoPermissibleObjects;
      render();
    });

    const render = () => {
      if (!context) return;
      
      // Update projection rotation
      rotationX += 0.05; // Slow spin
      projection.rotate([rotationX, rotationY, 0]);

      // Clear canvas
      context.clearRect(0, 0, width, height);

      // Ocean / Sphere
      context.beginPath();
      path(sphere);
      context.fillStyle = 'rgba(6, 16, 24, 0.4)'; // match ocean-abyss
      context.fill();
      context.strokeStyle = 'rgba(100, 255, 218, 0.2)'; // faint glow outline
      context.lineWidth = 1;
      context.stroke();

      // Landmasses (Global Emissions - Lava Red)
      if (land) {
        context.beginPath();
        path(land);
        context.shadowBlur = 20;
        context.shadowColor = 'rgba(230, 57, 70, 0.8)';
        context.fillStyle = 'rgba(230, 57, 70, 0.7)'; // Ominous Lava Red
        context.fill();
        context.shadowBlur = 0; // reset for next shapes
      }

      // Borders
      if (borders) {
        context.beginPath();
        path(borders);
        context.strokeStyle = 'rgba(168, 178, 209, 0.1)';
        context.lineWidth = 0.5;
        context.stroke();
      }

      // Draw Pacific Nations (Glowing Dots)
      pictNations.forEach((coords) => {
        const p = projection(coords as [number, number]);
        if (p) { // If visible on this side of the globe
          const [x, y] = p;
          
          // Draw outer glow
          context.beginPath();
          context.arc(x, y, 4, 0, 2 * Math.PI);
          context.fillStyle = 'rgba(100, 255, 218, 0.3)';
          context.fill();

          // Draw core
          context.beginPath();
          context.arc(x, y, 1.5, 0, 2 * Math.PI);
          context.fillStyle = '#64ffda';
          context.fill();
        }
      });

      animationId = requestAnimationFrame(render);
    };

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-80" style={{ mixBlendMode: 'screen' }}>
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={800} 
        className="w-[800px] h-[800px] max-w-[120vw] max-h-[120vw]"
      />
    </div>
  );
}
