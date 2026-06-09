import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CloudLightning } from 'lucide-react';

import { RainfallAnomalyChart } from '@/components/charts/RainfallAnomalyChart';

gsap.registerPlugin(ScrollTrigger);

interface Act4Props {
  className?: string;
}

export default function Act4_AtmosphericFracture({ className }: Act4Props) {
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

      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 flex flex-col md:flex-row">
        
        {/* LEFT COLUMN: Narrative Text (40%) */}
        <div ref={leftColumnRef} className="w-full md:w-5/12 py-[30vh] flex flex-col gap-[70vh] z-10">
          
          {/* Step 0: Intro */}
          <div className="trigger-block-weather glass-card p-8 md:p-10 border-l-4 border-l-transparent transition-colors duration-500" style={{ borderColor: activeStep === 0 ? '#8899a6' : 'transparent' }}>
            <div className="flex items-center gap-3 mb-4">
              <CloudLightning className="w-5 h-5 text-[#8899a6]" />
              <span className="text-xs font-mono tracking-widest uppercase text-[#8899a6]">
                ACT IV — DATASET 03
              </span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-[#e6f1ff] mb-6 leading-tight">
              The Breaking
              <span className="block text-[#8899a6]">Storms</span>
            </h2>
            <p className="font-body text-base md:text-lg text-[#a8b2d1] leading-relaxed mb-6">
              The thermal engine of the ocean inevitably disrupts the sky above it. When you inject billions of joules of excess heat into the Pacific, you fundamentally alter the atmospheric circulation. The result is a total fracture of historic precipitation patterns.
            </p>
            <div className="flex items-center gap-2 text-[#5c6e8a] text-sm mt-8">
              <CloudLightning className="w-4 h-4" />
              <span>Data: PDH.Stat / Rainfall Anomalies</span>
            </div>
          </div>

          {/* Step 1: Storm Surge */}
          <div className="trigger-block-weather glass-card p-8 md:p-10 border-l-4 border-l-transparent transition-colors duration-500" style={{ borderColor: activeStep === 1 ? '#8899a6' : 'transparent' }}>
            <h3 className="font-display text-2xl text-[#e6f1ff] mb-4">
              Droughts & Deluges
            </h3>
            <p className="font-body text-base md:text-lg text-[#a8b2d1] leading-relaxed mb-4">
              Rainfall anomalies show severe, whiplash shifts between devastating droughts and pluvial flooding. Look at the chart: extreme precipitation anomalies perfectly correlate with the devastating landfalls of <strong>Category 5 Cyclones</strong> like Pam (2015), Winston (2016), and Harold (2020).
            </p>
            <p className="font-body text-base md:text-lg text-[#a8b2d1] leading-relaxed">
              These are no longer "once-in-a-generation" events. The supercharged atmosphere is dumping unprecedented volumes of water, tearing roofs off hospitals and obliterating agriculture.
            </p>
            <div className="my-4 p-5 bg-[#0a1526]/80 border border-white/5 border-l-4 border-l-[#ff5a5f] italic text-[#e6f1ff] font-body text-sm relative z-10 rounded-r-xl shadow-lg">
              "We huddled in the church as the roof tore away. The wind sounded like a jet engine. In Vanuatu, we rebuild our lives every few years now. The sky is no longer our friend." <br/>
              <span className="text-xs text-[#ff5a5f] mt-3 block font-mono uppercase tracking-widest">— Resident of Port Vila, Vanuatu, after Cyclone Pam</span>
            </div>
          </div>

          {/* Step 2: Cycles of Destruction */}
          <div className="trigger-block-weather glass-card p-8 md:p-10 border-l-4 border-l-transparent transition-colors duration-500" style={{ borderColor: activeStep === 2 ? '#8899a6' : 'transparent' }}>
            <h3 className="font-display text-2xl text-[#e6f1ff] mb-4">
              A Broken Sky
            </h3>
            <p className="font-body text-base md:text-lg text-[#a8b2d1] leading-relaxed mb-4">
              A warmer ocean changes the sky. We no longer have predictable seasons. Instead, we swing violently between months of parched, cracking earth and sudden, massive floods.
            </p>
            <p className="font-body text-base md:text-lg text-[#a8b2d1] leading-relaxed">
              These spikes on the chart aren't just rain—they are <strong className="text-[#e63946]">Category 5 Cyclones</strong> like Pam, Winston, and Harold. This is the terrifying reality of climate change: it tears the roofs off our schools and washes away our roads in a single night.
            </p>
          </div>

        </div>

        {/* RIGHT COLUMN: Pinned Chart (60%) */}
        <div className="w-full md:w-7/12 h-screen sticky top-0 flex flex-col justify-center items-center py-12 md:py-0 md:pl-12 z-0">
          <div ref={rightColumnRef} className="w-full max-w-3xl relative">
            <div className="glass-card p-6 md:p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xl md:text-2xl text-[#e6f1ff]">Precipitation Anomalies</h3>
                <span className="text-xs font-mono text-[#5c6e8a] uppercase tracking-wider">Drought & Deluge</span>
              </div>
              <RainfallAnomalyChart activeStep={activeStep} />
              <div className="mt-4 text-right">
                <a href="https://stats.pacificdata.org" target="_blank" rel="noreferrer" className="text-xs text-[#a0aec0] hover:text-[#64ffda] transition-colors border-b border-[#64ffda]/30 pb-0.5 font-mono">
                  Source: Pacific Data Hub (SPC:DF_CLIMATE_CHANGE), RAIN_ANOM
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
