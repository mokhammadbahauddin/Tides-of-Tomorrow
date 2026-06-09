import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Droplets, MapPin } from 'lucide-react';
import SeaLevelChart from '@/components/charts/SeaLevelChart';

gsap.registerPlugin(ScrollTrigger);

interface Act3Props {
  className?: string;
}

export default function Act3_EncroachingWaters({ className }: Act3Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const leftColumnRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);

  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const steps = gsap.utils.toArray<HTMLElement>('.trigger-block-sinking');
      
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
      id="sinking"
      ref={sectionRef}
      className={`relative bg-transparent ${className || ''}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--ocean-abyss)] via-[var(--ocean-abyss)]/80 to-transparent pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 flex flex-col md:flex-row-reverse">
        
        {/* TEXT COLUMN (Visually Right, 40%) */}
        <div ref={leftColumnRef} className="w-full md:w-5/12 py-[30vh] flex flex-col gap-[70vh] z-10">
          
          {/* Step 0: Intro */}
          <div className="trigger-block-sinking glass-card p-8 md:p-10 border-l-4 border-l-transparent transition-colors duration-500" style={{ borderColor: activeStep === 0 ? '#e63946' : 'transparent' }}>
            <div className="flex items-center gap-3 mb-4">
              <Droplets className="w-5 h-5 text-[#e63946]" />
              <span className="text-xs font-mono tracking-widest uppercase text-[#e63946]">
                ACT III — DATASET 02
              </span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-[#e6f1ff] mb-6 leading-tight">
              The Rising
              <span className="block text-[#e63946]">Tides</span>
            </h2>
            <p className="font-body text-base md:text-lg text-[#a8b2d1] leading-relaxed mb-6">
              Thermal expansion and glacial melt have broken the ancient boundaries of the tide.
            </p>
            <div className="flex items-center gap-2 text-[#5c6e8a] text-sm mt-8">
              <MapPin className="w-4 h-4" />
              <span>Data: PDH.Stat / Satellite Altimetry</span>
            </div>
          </div>

          {/* Step 1: Migration */}
          <div className="trigger-block-sinking glass-card p-8 md:p-10 border-l-4 border-l-transparent transition-colors duration-500" style={{ borderColor: activeStep === 1 ? '#e63946' : 'transparent' }}>
            <h3 className="font-display text-2xl text-[#e6f1ff] mb-4">
              Accelerated Sea Level Rise
            </h3>
            <p className="font-body text-base md:text-lg text-[#a8b2d1] leading-relaxed mb-4">
              Satellite altimetry data reveals sea level anomalies rising at nearly <span className="text-[#e63946] font-semibold">4.5 millimeters per year</span> in the tropical Pacific—significantly outpacing the global mean⁴. This isn't just an environmental hazard; it is a physical encroachment on sovereign land.
            </p>
            <p className="font-body text-base md:text-lg text-[#a8b2d1] leading-relaxed">
              When the sea level rises by even a few millimeters, King Tides penetrate hundreds of meters further inland, completely reshaping the geography of the islands.
            </p>
            <div className="mt-4 text-right">
              <a href="https://stats.pacificdata.org" target="_blank" rel="noreferrer" className="text-xs text-[#a0aec0] hover:text-[#64ffda] transition-colors border-b border-[#64ffda]/30 pb-0.5 font-mono">
                Source: Pacific Data Hub (SPC:DF_CLIMATE_CHANGE), SEA_LVL
              </a>
            </div>
          </div>

          {/* Step 2: Human Impact */}
          <div className="trigger-block-sinking glass-card p-8 md:p-10 border-l-4 border-l-transparent transition-colors duration-500" style={{ borderColor: activeStep === 2 ? '#e63946' : 'transparent' }}>
            <h3 className="font-display text-2xl text-[#e6f1ff] mb-4">
              When the Sea Comes Ashore
            </h3>
            <p className="font-body text-base md:text-lg text-[#a8b2d1] leading-relaxed mb-4">
              When people hear about sea-level rise, they picture waves crashing over seawalls. But the reality is often quieter, and more deadly. The saltwater seeps up from underneath the ground.
            </p>
            <p className="font-body text-base md:text-lg text-[#a8b2d1] leading-relaxed">
              Look at the <strong className="text-[#e63946]">red inundation zone</strong> on the chart. When the sea rises past that point, it gets into the wells our grandparents dug. You can't drink the water anymore. The salt kills the crops we've relied on for generations. Once the salt is in the soil, the land simply cannot sustain life.
            </p>
            <div className="my-4 p-5 bg-[#0a1526]/80 border border-white/5 border-l-4 border-l-[#e63946] italic text-[#e6f1ff] font-body text-sm relative z-10 rounded-r-xl shadow-lg">
              "We planted taro where our grandfathers planted taro, but the soil is poisoned with salt. We are literally watching the ocean swallow the land that holds our ancestors' bones." <br/>
              <span className="text-xs text-[#e63946] mt-3 block font-mono uppercase tracking-widest">— Community Leader, Funafuti, Tuvalu</span>
            </div>
          </div>

        </div>

        {/* CHART COLUMN (Visually Left, 60%) */}
        <div className="w-full md:w-7/12 h-screen sticky top-0 flex flex-col justify-center items-center py-12 md:py-0 md:pr-12 z-0">
          <div ref={rightColumnRef} className="w-full max-w-3xl relative">
            <div className="glass-card p-6 md:p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xl md:text-2xl text-[#e6f1ff]">
                  Mean Sea Level Anomalies
                </h3>
              </div>
              <SeaLevelChart activeStep={activeStep} />
              <div className="mt-4 text-right">
                <a href="https://stats.pacificdata.org" target="_blank" rel="noreferrer" className="text-xs text-[#a0aec0] hover:text-[#64ffda] transition-colors border-b border-[#64ffda]/30 pb-0.5 font-mono">
                  Source: Pacific Data Hub (PDH.Stat)
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
