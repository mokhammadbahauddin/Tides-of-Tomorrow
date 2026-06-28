import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

interface TooltipState {
  x: number;
  y: number;
  name: string;
  coords: string;
  severity: 'CRITICAL' | 'SEVERE' | 'HIGH';
  category: string;
  impact: string;
}

export default function PacificGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [hasError, setHasError] = useState(false);
  const isVisibleRef = useRef<boolean>(false);
  const lastTooltipRef = useRef<string>('');

  // Pause the animation loop when the globe is off-screen
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
    const graticule = d3.geoGraticule();

    // Precise, geographically accurate coordinates [longitude, latitude]
    const pictNations = [
      { name: 'Tuvalu', coords: [179.2, -8.5] as [number, number], severity: 'CRITICAL' as const, category: 'Sea Level Rise', impact: 'Rising ocean tides are flooding coastal areas and contaminating their fresh drinking water with salt.' },
      { name: 'Kiribati', coords: [173.0, 1.4] as [number, number], severity: 'CRITICAL' as const, category: 'Shoreline Erosion', impact: 'Severe coastal erosion is washing away homes and poisoning crop soils, forcing relocation plans.' },
      { name: 'Fiji', coords: [178.4, -17.7] as [number, number], severity: 'HIGH' as const, category: 'Adaptation Costs', impact: 'Villages are being forced to relocate inland, diverting vital public funds to build new seawalls.' },
      { name: 'Samoa', coords: [-172.2, -13.8] as [number, number], severity: 'SEVERE' as const, category: 'Storm Surges', impact: 'Violent storm surges are destroying key coastal roads and flooding low-lying family communities.' },
      { name: 'Tonga', coords: [-175.2, -21.1] as [number, number], severity: 'HIGH' as const, category: 'Acidification', impact: 'Acidic waters are killing protective coral reefs and depleting the fish populations they depend on.' },
      { name: 'Solomon Islands', coords: [160.1, -9.6] as [number, number], severity: 'SEVERE' as const, category: 'Crop Failure', impact: 'Rising seas are ruining agricultural soil, forcing families to rely on expensive imported food.' },
      { name: 'Vanuatu', coords: [168.3, -17.7] as [number, number], severity: 'CRITICAL' as const, category: 'Extreme Weather', impact: 'Experiencing catastrophic category-5 cyclones and unpredictable whiplash weather cycles.' },
      { name: 'Nauru', coords: [166.9, -0.5] as [number, number], severity: 'HIGH' as const, category: 'Coral Bleaching', impact: 'Spiking water temperatures are bleaching protective reefs, threatening local fish supplies.' },
      { name: 'Niue', coords: [-169.9, -19.0] as [number, number], severity: 'HIGH' as const, category: 'Water Security', impact: 'Their underground freshwater supply is highly vulnerable to sea level rise and storms.' },
      { name: 'Cook Islands', coords: [-159.8, -21.2] as [number, number], severity: 'SEVERE' as const, category: 'Reef Collapse', impact: 'Bleached coral reefs can no longer buffer the shores, leaving coastal homes exposed to ocean waves.' },
      { name: 'Guam', coords: [144.7, 13.4] as [number, number], severity: 'SEVERE' as const, category: 'Typhoons', impact: 'More frequent and intense typhoons are battering local infrastructure and bleaching coral reefs.' },
      { name: 'Micronesia', coords: [158.2, 6.9] as [number, number], severity: 'SEVERE' as const, category: 'Salt Intrusion', impact: 'Regular flooding during high spring tides is contaminating farm soils and crop gardens.' },
      { name: 'Marshall Islands', coords: [171.3, 7.1] as [number, number], severity: 'CRITICAL' as const, category: 'Tidal Flooding', impact: 'King tides now flood lagoon streets regularly, while heat stress is collapsing local coral reefs.' },
      { name: 'Palau', coords: [134.5, 7.4] as [number, number], severity: 'HIGH' as const, category: 'Marine Bleaching', impact: 'Spiking water temperatures threaten rare marine species in their world-famous marine lakes.' },
    ];

    let sphere = { type: 'Sphere' } as d3.GeoPermissibleObjects;
    let land: d3.GeoPermissibleObjects | null = null;
    let borders: d3.GeoPermissibleObjects | null = null;

    let rotationX = -160;
    let rotationY = -10;
    let animationId: number;
    let mousePos: [number, number] | null = null;

    // Drag-to-spin with inertia variables
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startRotX = 0;
    let startRotY = 0;
    let velocityX = 0;
    let velocityY = 0;
    let lastX = 0;
    let lastY = 0;
    let lastTime = 0;

    // Pointer event interaction (Unified Mouse + Touch)
    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      lastX = e.clientX;
      lastY = e.clientY;
      lastTime = performance.now();
      startRotX = rotationX;
      startRotY = rotationY;
      velocityX = 0;
      velocityY = 0;
      canvas.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      
      // Fix mouse mapping issue under CSS transform scale layouts
      const scaleX = rect.width / width;
      const scaleY = rect.height / height;
      
      const x = (e.clientX - rect.left) / (scaleX || 1);
      const y = (e.clientY - rect.top) / (scaleY || 1);
      mousePos = [x, y];

      if (isDragging) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const sensitivity = 0.25; // Drag sensitivity
        
        const now = performance.now();
        const dt = now - lastTime;
        if (dt > 0) {
          // Calculate instant velocity
          velocityX = (e.clientX - lastX) * sensitivity;
          velocityY = -(e.clientY - lastY) * sensitivity;
        }
        lastX = e.clientX;
        lastY = e.clientY;
        lastTime = now;

        rotationX = startRotX + dx * sensitivity;
        rotationY = Math.max(-60, Math.min(60, startRotY - dy * sensitivity)); // Clamp pitch rotation
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      isDragging = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointerleave', () => {
      if (!isDragging) {
        mousePos = null;
        setTooltip(null);
      }
    });

    d3.json('/data/world-110m.json').then((world: any) => {
      land = topojson.feature(world, world.objects.countries) as unknown as d3.GeoPermissibleObjects;
      borders = topojson.mesh(world, world.objects.countries, (a, b) => a !== b) as unknown as d3.GeoPermissibleObjects;
      render();
    }).catch((err) => { console.error('Failed to load chart data:', err); setHasError(true); });

    const render = () => {
      if (!context) return;

      // Skip drawing when globe is not visible, but keep the loop alive
      if (!isVisibleRef.current) {
        animationId = requestAnimationFrame(render);
        return;
      }

      // Auto spin and inertia logic
      if (!isDragging) {
        // Apply inertia (friction)
        rotationX += velocityX;
        rotationY += velocityY;
        
        velocityX *= 0.95;
        velocityY *= 0.95;
        
        rotationY = Math.max(-60, Math.min(60, rotationY));

        // When inertia stops, resume auto-spin
        if (Math.abs(velocityX) < 0.01 && Math.abs(velocityY) < 0.01) {
          velocityX = 0;
          velocityY = 0;
          rotationX += 0.05; // auto-spin speed
        }
      }

      // Update projection scale dynamically based on dimensions
      projection
        .scale(Math.min(width, height) / 2.2)
        .translate([width / 2, height / 2])
        .rotate([rotationX, rotationY, 0]);

      context.clearRect(0, 0, width, height);

      // Deep 3D Sphere Radial Gradient for Ocean
      const r = Math.min(width, height) / 2.2;
      const sphereGrad = context.createRadialGradient(
        width / 2 - r * 0.1, height / 2 - r * 0.1, r * 0.1,
        width / 2, height / 2, r
      );
      sphereGrad.addColorStop(0, 'rgba(15, 34, 55, 0.50)'); // Ocean Ink fade
      sphereGrad.addColorStop(0.7, 'rgba(11, 26, 46, 0.85)'); // Deep Ocean
      sphereGrad.addColorStop(1, 'rgba(10, 20, 32, 0.98)');

      context.beginPath();
      path(sphere);
      context.fillStyle = sphereGrad;
      context.fill();

      // Atmospheric outer glow edge stroke
      context.beginPath();
      path(sphere);
      context.strokeStyle = 'rgba(43, 122, 120, 0.30)'; // Reef Teal
      context.lineWidth = 1.5;
      context.stroke();

      // Draw Gridlines (Graticules)
      context.beginPath();
      path(graticule());
      context.strokeStyle = 'rgba(107, 143, 163, 0.08)'; // Storm Gray
      context.lineWidth = 0.5;
      context.stroke();

      // Landmasses representing Global Emissions (Red / Terracotta styling)
      if (land) {
        context.beginPath();
        path(land);
        context.shadowBlur = 10;
        context.shadowColor = 'rgba(180, 77, 54, 0.4)'; // Red/Terracotta shadow
        context.fillStyle = 'rgba(180, 77, 54, 0.6)'; // Red/Terracotta representing 99.97% global emissions
        context.fill();
        context.shadowBlur = 0; // Reset shadow for subsequent drawings
      }

      // Borders
      if (borders) {
        context.beginPath();
        path(borders);
        context.strokeStyle = 'rgba(168, 178, 209, 0.15)';
        context.lineWidth = 0.5;
        context.stroke();
      }

      let hoveredNation: any = null;

      // Pulse calculations
      const pulseTime = (Date.now() / 1000) % 2; // 2 second cycle

      // Draw Pacific Nations
      pictNations.forEach((nation) => {
        // Verify if the nation's point is visible on the front hemisphere
        const center: [number, number] = [-rotationX, -rotationY];
        const distFromCenter = d3.geoDistance(center, nation.coords);
        const isVisible = distFromCenter < Math.PI / 2;

        if (isVisible) {
          const p = projection(nation.coords);
          if (p) {
            const [x, y] = p;
            
            // Check collision with a larger 12px hover radius
            if (mousePos && !isDragging) {
              const dist = Math.hypot(x - mousePos[0], y - mousePos[1]);
              if (dist < 12) {
                hoveredNation = nation;
              }
            }

            // 1. Faint inner lagoon fill
            context.beginPath();
            context.arc(x, y, 8, 0, 2 * Math.PI);
            context.fillStyle = 'rgba(43, 122, 120, 0.1)'; // Reef Teal (Blue-Green)
            context.fill();

            // 2. Dashed outer reef ring
            context.beginPath();
            context.arc(x, y, 9, 0, 2 * Math.PI);
            context.strokeStyle = 'rgba(56, 189, 248, 0.5)'; // Ice Blue (Cyan)
            context.lineWidth = 0.75;
            context.setLineDash([2, 1.5]); // Dashed reef segments
            context.stroke();
            context.setLineDash([]); // Reset line dash for subsequent context drawings

            // 3. Tiny islets (motus) along the reef ring
            const isletCount = 3;
            for (let i = 0; i < isletCount; i++) {
              const angle = (i * (2 * Math.PI / isletCount)) + (nation.name.length * 0.4);
              const isletX = x + Math.cos(angle) * 9;
              const isletY = y + Math.sin(angle) * 9;
              context.beginPath();
              context.arc(isletX, isletY, 0.8, 0, 2 * Math.PI);
              context.fillStyle = '#2B7A78'; // Reef Teal (Blue)
              context.fill();
            }

            // 4. Center telemetry coordinate core dot
            context.beginPath();
            context.arc(x, y, 1.5, 0, 2 * Math.PI);
            context.fillStyle = '#38bdf8'; // Ice Blue (Bright Cyan)
            context.fill();

            // 5. Breathing pulse aura (expands outside the atoll)
            const pulseRadius = 9 + pulseTime * 12;
            const pulseOpacity = Math.max(0, 0.35 * (1 - pulseTime / 2));
            context.beginPath();
            context.arc(x, y, pulseRadius, 0, 2 * Math.PI);
            context.fillStyle = `rgba(56, 189, 248, ${pulseOpacity})`; // Ice Blue (Cyan)
            context.fill();
          }
        }
      });

      // Throttle tooltip updates: only call setTooltip when the hovered nation changes
      const newTooltipId = hoveredNation?.name || '';
      if (newTooltipId !== lastTooltipRef.current) {
        lastTooltipRef.current = newTooltipId;
        if (hoveredNation && mousePos) {
          // Format coordinates for display
          const lon = hoveredNation.coords[0];
          const lat = hoveredNation.coords[1];
          const coordString = `${Math.abs(lat).toFixed(1)}° ${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(1)}° ${lon >= 0 ? 'E' : 'W'}`;
          setTooltip({
            x: mousePos[0],
            y: mousePos[1],
            name: hoveredNation.name,
            coords: coordString,
            severity: hoveredNation.severity,
            category: hoveredNation.category,
            impact: hoveredNation.impact,
          });
        } else if (!isDragging) {
          setTooltip(null);
        }
      }

      animationId = requestAnimationFrame(render);
    };

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  // Determine severity style classes
  const getSeverityStyle = (severity?: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-[#B44D36]'; // Terracotta
      case 'SEVERE':
        return 'text-[#D4836A]'; // Coral Pink
      case 'HIGH':
        return 'text-[#C49A3C]'; // Golden Hour
      default:
        return 'text-[#2B7A78]'; // Reef Teal
    }
  };

  return (
    <div ref={containerRef} className="absolute inset-0 flex items-center justify-center opacity-90" style={{ mixBlendMode: 'screen' }}>
      {hasError ? (
        <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-8">
          <div className="text-4xl mb-4">⚠</div>
          <p className="text-[#E8DCC8] font-['Playfair_Display'] text-lg mb-2">Data Temporarily Unavailable</p>
          <p className="text-[#D4A574] text-sm opacity-70">Please refresh the page to try again.</p>
        </div>
      ) : (
        <canvas 
          ref={canvasRef} 
          className="cursor-grab active:cursor-grabbing pointer-events-auto"
        />
      )}
      {tooltip && (
        <div 
          className="absolute pointer-events-none glass-panel border border-[#D4A574]/15 p-4 z-50 text-left rounded-none max-w-xs"
          style={{ left: tooltip.x + 15, top: tooltip.y - 15 }}
        >
          {/* Heading */}
          <div className="mb-1 border-b border-[#D4A574]/15 pb-1.5">
            <h4 className="text-sm font-bold text-[#E8DCC8] tracking-wide font-display">
              {tooltip.name}
            </h4>
            <span className="text-[9px] text-[#8B7355] font-body mt-0.5 block">
              Coordinates: {tooltip.coords}
            </span>
          </div>

          {/* Impact Statement */}
          <div className="text-[11px] text-[#E8DCC8]/80 leading-relaxed my-2.5 font-sans">
            {tooltip.impact}
          </div>

          {/* Warning Level & Category */}
          <div className="mt-2 pt-2 border-t border-[#D4A574]/15 flex items-center justify-between text-[8px]">
            <span className="text-[#8B7355] font-body uppercase tracking-wider">Impact: {tooltip.category}</span>
            <span className={`font-bold uppercase tracking-widest ${getSeverityStyle(tooltip.severity)}`}>
              {tooltip.severity} RISK
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
