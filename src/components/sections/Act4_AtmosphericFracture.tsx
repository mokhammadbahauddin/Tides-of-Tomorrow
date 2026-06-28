import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CloudLightning } from 'lucide-react';
import { RainfallAnomalyChart } from '@/components/charts/RainfallAnomalyChart';

gsap.registerPlugin(ScrollTrigger);

interface Act4Props {
  className?: string;
  selectedCountry?: { id: string; name: string };
}

export default function Act4_AtmosphericFracture({ className, selectedCountry }: Act4Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const leftColumnRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);

  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const steps = gsap.utils.toArray<HTMLElement>('.trigger-block-weather');
      
      steps.forEach((step, index) => {
        ScrollTrigger.create({
          trigger: step,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => setActiveStep(index),
          onEnterBack: () => setActiveStep(index),
        });
      });

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
      id="extreme-weather"
      ref={sectionRef}
      className={`relative bg-transparent ${className || ''}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--ocean-abyss)] via-[var(--ocean-abyss)]/80 to-transparent pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 flex flex-col-reverse md:flex-row">
        
        {/* LEFT COLUMN: Narrative Text (40%) */}
        <div ref={leftColumnRef} className="w-full md:w-5/12 py-[35vh] flex flex-col gap-[80vh] z-10">
          
          {/* Step 0: Intro */}
          <div 
            className="trigger-block-weather relative py-12 px-6 md:px-8 transition-all duration-500" 
            style={{ 
              opacity: activeStep === 0 ? 1 : 0.4,
              transform: activeStep === 0 ? 'scale(1)' : 'scale(0.98)'
            }}
          >
            <div className={`absolute inset-0 rounded-none transition-opacity duration-500 ${activeStep === 0 ? 'glass-card' : ''}`} />
            <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <CloudLightning className="w-5 h-5 text-storm-gray" />
              <span className="text-xs font-body tracking-widest uppercase text-storm-gray">
                ACT IV — ATMOSPHERIC FRACTURE
              </span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-shell-white mb-6 leading-tight">
              The Breaking <span className="text-storm-gray">Storms</span>
            </h2>
            <p className="font-body text-base md:text-lg text-shell-white/80 leading-relaxed">
              The encroaching seas from Act III are only half the battle. As rising tides push inland, the thermal engine of the ocean simultaneously supercharges the sky above. When billions of joules of excess heat evaporate into the atmosphere, the result is a total fracture of historic precipitation patterns.
            </p>
            </div>
          </div>

          {/* Step 1: Storm Surge */}
          <div 
            className="trigger-block-weather relative py-12 px-6 md:px-8 transition-all duration-500" 
            style={{ 
              opacity: activeStep === 1 ? 1 : 0.4,
              transform: activeStep === 1 ? 'scale(1)' : 'scale(0.98)'
            }}
          >
            <div className={`absolute inset-0 rounded-none transition-opacity duration-500 ${activeStep === 1 ? 'glass-card' : ''}`} />
            <div className="relative z-10">
            <h3 className="font-display text-3xl md:text-4xl font-bold text-shell-white mb-4">
              Droughts & Deluges
            </h3>
            <p className="font-body text-base md:text-lg text-shell-white/80 leading-relaxed mb-4">
              Rainfall anomalies show severe, whiplash shifts between devastating droughts and pluvial flooding. Look at the chart: extreme precipitation anomalies perfectly correlate with the devastating landfalls of <strong>Category 5 Cyclones</strong> like Pam (2015), Winston (2016), and Harold (2020).
            </p>
            <p className="font-body text-base md:text-lg text-shell-white/80 leading-relaxed">
              These are no longer "once-in-a-generation" events. The supercharged atmosphere is dumping unprecedented volumes of water, tearing roofs off hospitals and obliterating agriculture.
            </p>
            <div className="my-4 p-5 glass-card italic text-shell-white/90 font-body text-sm">
              "We huddled in the church as the roof tore away. The wind sounded like a jet engine. In Vanuatu, we rebuild our lives every few years now. The sky is no longer our friend." <br/>
              <span className="text-xs text-drift-wood mt-3 block font-body uppercase tracking-widest">— Resident of Port Vila, Vanuatu, after Cyclone Pam</span>
            </div>
            </div>
          </div>

          {/* Step 2: Cycles of Destruction */}
          <div 
            className="trigger-block-weather relative py-12 px-6 md:px-8 transition-all duration-500" 
            style={{ 
              opacity: activeStep === 2 ? 1 : 0.4,
              transform: activeStep === 2 ? 'scale(1)' : 'scale(0.98)'
            }}
          >
            <div className={`absolute inset-0 rounded-none transition-opacity duration-500 ${activeStep === 2 ? 'glass-card' : ''}`} />
            <div className="relative z-10">
            <h3 className="font-display text-3xl md:text-4xl font-bold text-shell-white mb-4">
              A Broken Sky
            </h3>
            <p className="font-body text-base md:text-lg text-shell-white/80 leading-relaxed mb-4">
              A warmer ocean changes the sky. We no longer have predictable seasons. Instead, we swing violently between months of parched, cracking earth and sudden, massive floods.
            </p>
            <p className="font-body text-base md:text-lg text-shell-white/80 leading-relaxed">
              These spikes on the chart aren't just rain—they are <strong className="text-terracotta">Category 5 Cyclones</strong> like Pam, Winston, and Harold. This is the terrifying reality of climate change: it tears the roofs off our schools and washes away our roads in a single night.
            </p>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Pinned Chart (60%) */}
        <div className="w-full md:w-7/12 h-screen sticky top-0 flex flex-col justify-center items-center py-12 md:py-0 md:pl-12 z-0">
          <div ref={rightColumnRef} className="w-full max-w-4xl relative h-[60vh] flex flex-col justify-center items-center">
            
            <RainfallAnomalyChart activeStep={activeStep} selectedCountry={selectedCountry} />

            <div className="absolute bottom-[-32px] left-0 right-0 text-center text-[9px] uppercase tracking-widest font-body text-drift-wood/75">
              Vila Harbour — GPCP Precipitation Anomalies Profile
            </div>
            
          </div>
        </div>

      </div>
    </section>
  );
}
