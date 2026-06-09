import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CarbonLedgerChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const redBoxRef = useRef<HTMLDivElement>(null);
  const blueLineRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial state
      gsap.set(redBoxRef.current, { scaleY: 0, transformOrigin: 'bottom' });
      gsap.set(blueLineRef.current, { scaleX: 0, opacity: 0, transformOrigin: 'left' });
      gsap.set(labelRef.current, { opacity: 0, y: 20 });

      // Animation timeline
      const tl = gsap.timeline({ delay: 0.2 });
      
      tl.to(blueLineRef.current, { scaleX: 1, opacity: 1, duration: 1, ease: 'power2.out' })
        .to(labelRef.current, { opacity: 1, y: 0, duration: 0.8 }, "-=0.5")
        .to(redBoxRef.current, { scaleY: 1, duration: 1.5, ease: 'power4.out' }, "+=0.5");
        
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full max-w-lg aspect-square relative flex flex-col items-center justify-center p-4">
      {/* Background Frame */}
      <div className="w-full h-full border border-[var(--teal)]/20 rounded-lg relative overflow-hidden bg-[#0a192f]/50 backdrop-blur-md shadow-[0_0_50px_rgba(230,57,70,0.1)]">
        
        {/* Global Emissions (99.97%) - Massive Red Block */}
        <div 
          ref={redBoxRef}
          className="absolute inset-0 bg-gradient-to-b from-[#e63946] to-[#780000] opacity-80"
          style={{ bottom: '2px' }} // Leave 2px for the pacific line
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white/80 font-display text-4xl md:text-6xl font-bold tracking-widest mix-blend-overlay">
              99.97%
            </span>
          </div>
          <div className="absolute top-4 left-4 text-white/60 font-mono text-sm tracking-wider">
            GLOBAL GREENHOUSE GAS EMISSIONS
          </div>
        </div>

        {/* Pacific Emissions (0.03%) - Tiny glowing line at the bottom */}
        <div 
          ref={blueLineRef}
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--teal)] shadow-[0_0_15px_var(--teal)]"
        />
        
        {/* Pacific Label */}
        <div 
          ref={labelRef}
          className="absolute bottom-6 left-4 text-[var(--teal)] font-mono text-xs md:text-sm tracking-wider"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[var(--teal)] rounded-full animate-pulse shadow-[0_0_10px_var(--teal)]"></span>
            PACIFIC NATIONS: 0.03%
          </div>
        </div>

      </div>

      <div className="mt-6 text-center text-[var(--text-muted)] font-mono text-xs uppercase tracking-widest opacity-60">
        Data: SPREP / IPCC AR6
      </div>
    </div>
  );
}
