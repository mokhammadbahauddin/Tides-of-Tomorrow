import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flame } from 'lucide-react';
import TemperatureChart from '@/components/charts/TemperatureChart';

gsap.registerPlugin(ScrollTrigger);

interface Act2Props {
  className?: string;
  selectedCountry?: { id: string; name: string };
}

export default function Act2_ThermalEngine({ className, selectedCountry }: Act2Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const leftColumnRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);
  
  // State to track which narrative block is currently active
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Create ScrollTriggers for each narrative block to update activeStep
      const steps = gsap.utils.toArray<HTMLElement>('.trigger-block-warm');
      
      steps.forEach((step, index) => {
        ScrollTrigger.create({
          trigger: step,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => setActiveStep(index),
          onEnterBack: () => setActiveStep(index),
        });
      });

      // Simple fade in for the right column when the section enters
      gsap.fromTo(
        rightColumnRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="warming"
      ref={sectionRef}
      className={`relative bg-transparent ${className || ''}`}
    >
      {/* Background overlay for blending */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--ocean-abyss)] via-transparent to-transparent pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 flex flex-col-reverse md:flex-row">
        
        {/* LEFT COLUMN: Narrative Text (40%) */}
        <div ref={leftColumnRef} className="w-full md:w-5/12 py-[35vh] flex flex-col gap-[80vh] z-10">
          
          {/* Step 0: Intro */}
          <div 
            className="trigger-block-warm relative py-12 px-6 md:px-8 transition-all duration-500" 
            style={{ 
              opacity: activeStep === 0 ? 1 : 0.4,
              transform: activeStep === 0 ? 'scale(1)' : 'scale(0.98)'
            }}
          >
            <div className={`absolute inset-0 rounded-none transition-opacity duration-500 ${activeStep === 0 ? 'glass-card' : ''}`} />
            <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Flame className="w-5 h-5 text-warm-sand" />
              <span className="text-xs font-body tracking-widest uppercase text-warm-sand">
                Act II: The Thermal Engine
              </span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-shell-white mb-6 leading-tight">
              The Warming <span className="text-warm-sand">Ocean</span>
            </h2>
            <p className="font-body text-base md:text-lg text-shell-white/80 leading-relaxed">
              The ocean is our planet's ultimate heat sink, absorbing <strong>93% of the excess heat trapped by human activity</strong>. Look at the chart on the right: it plots over a century of sea surface temperature anomalies. What starts as a stable blue baseline in 1850 climbs steadily into a warning orange.
            </p>
            </div>
          </div>

          {/* Step 1: Temperature Spikes */}
          <div 
            className="trigger-block-warm relative py-12 px-6 md:px-8 transition-all duration-500" 
            style={{ 
              opacity: activeStep === 1 ? 1 : 0.4,
              transform: activeStep === 1 ? 'scale(1)' : 'scale(0.98)'
            }}
          >
            <div className={`absolute inset-0 rounded-none transition-opacity duration-500 ${activeStep === 1 ? 'glass-card' : ''}`} />
            <div className="relative z-10">
            <h3 className="font-display text-3xl md:text-4xl font-bold text-shell-white mb-4">
              The Heat Beneath the Waves
            </h3>
            <p className="font-body text-base md:text-lg text-shell-white/80 leading-relaxed mb-4">
              Watch the chart zoom in: we are focusing on the modern era from 1970 to 2024. Here in the Pacific, water temperatures have climbed past the <strong className="text-terracotta">+1.2°C threshold</strong> relative to the pre-industrial baseline.
            </p>
            <p className="font-body text-base md:text-lg text-shell-white/80 leading-relaxed">
              This isn't a warning about the future; it is a current fever. When the chart spikes, the heat cooks our coral reefs, destroying the vibrant ecosystems that feed our families and protect our shores from ocean waves.
            </p>
            </div>
          </div>

          {/* Step 2: Human Impact */}
          <div 
            className="trigger-block-warm relative py-12 px-6 md:px-8 transition-all duration-500" 
            style={{ 
              opacity: activeStep === 2 ? 1 : 0.4,
              transform: activeStep === 2 ? 'scale(1)' : 'scale(0.98)'
            }}
          >
            <div className={`absolute inset-0 rounded-none transition-opacity duration-500 ${activeStep === 2 ? 'glass-card' : ''}`} />
            <div className="relative z-10">
            <h3 className="font-display text-3xl md:text-4xl font-bold text-shell-white mb-4">
              The Graveyard of Reefs
            </h3>
            <p className="font-body text-base md:text-lg text-shell-white/80 leading-relaxed mb-4">
              When water stays warm, coral expels its symbiotic algae and starves. Look at the highlighted circles on the chart: they mark the extreme El Niño-driven peaks of <strong>1998 and 2016</strong>. The chart desaturates to bone-white, symbolizing the mass bleaching that turns reefs into silent graveyards.
            </p>
            <div className="my-4 p-5 glass-card italic text-shell-white/90 font-body text-sm">
              "We used to dive and see a forest of colors. Now, we dive and see a boneyard. The fish are gone, and with them, the income that sends our children to school." <br/>
              <span className="text-xs text-drift-wood mt-3 block font-body uppercase tracking-widest">Source: Local fisherman, Viti Levu, Fiji</span>
            </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Pinned Chart (60%) */}
        <div className="w-full md:w-7/12 h-screen sticky top-0 flex flex-col justify-center items-center py-12 md:py-0 md:pl-12 z-0">
          <div ref={rightColumnRef} className="w-full max-w-4xl relative h-[60vh] flex flex-col justify-center items-center">
            
            <TemperatureChart activeStep={activeStep} selectedCountry={selectedCountry} />

            <div className="absolute bottom-[-32px] left-0 right-0 text-center text-[9px] uppercase tracking-widest font-body text-drift-wood/75">
              Fiji Basin — NOAA OISST V2.1 Anomaly Profile
            </div>
            
          </div>
        </div>

      </div>
    </section>
  );
}
