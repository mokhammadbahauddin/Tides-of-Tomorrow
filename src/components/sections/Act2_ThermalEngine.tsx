import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flame, TrendingUp } from 'lucide-react';
import TemperatureChart from '@/components/charts/TemperatureChart';

gsap.registerPlugin(ScrollTrigger);

interface Act2Props {
  className?: string;
}

export default function Act2_ThermalEngine({ className }: Act2Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const leftColumnRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);
  
  // State to track which narrative block is currently active
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Create ScrollTriggers for each narrative block to update activeStep
      const steps = gsap.utils.toArray<HTMLElement>('.trigger-block');
      
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
        <div ref={leftColumnRef} className="w-full md:w-5/12 py-[30vh] flex flex-col gap-[70vh] z-10">
          
          {/* Step 0: Intro */}
          <div className="trigger-block glass-card p-8 md:p-10 border-l-4 border-l-transparent transition-colors duration-500" style={{ borderColor: activeStep === 0 ? '#f59e0b' : 'transparent' }}>
            <div className="flex items-center gap-3 mb-4">
              <Flame className="w-5 h-5 text-[#f59e0b]" />
              <span className="text-xs font-mono tracking-widest uppercase text-[#f59e0b]">
                ACT II — DATASET 01
              </span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-[#e6f1ff] mb-6 leading-tight">
              The Warming <span className="text-[#f59e0b]">Ocean</span>
            </h2>
            <p className="font-body text-base md:text-lg text-[#a8b2d1] leading-relaxed mb-6">
              The ocean is our planet's ultimate heat sink, absorbing an invisible <strong>93% of the excess heat trapped by human activity²</strong>. But the engine is overheating. The buffering capacity has fractured.
            </p>
            <div className="flex items-center gap-2 text-[#5c6e8a] text-sm mt-8">
              <TrendingUp className="w-4 h-4" />
              <span>Data: IPCC AR6 WG1 / Pacific Data Hub</span>
            </div>
          </div>

          {/* Step 1: Temperature Spikes */}
          <div className="trigger-block glass-card p-8 md:p-10 border-l-4 border-l-transparent transition-colors duration-500" style={{ borderColor: activeStep === 1 ? '#f59e0b' : 'transparent' }}>
            <h3 className="font-display text-2xl text-[#e6f1ff] mb-4">
              The Heat Beneath the Waves
            </h3>
            <p className="font-body text-base md:text-lg text-[#a8b2d1] leading-relaxed mb-4">
              Our ocean absorbs most of the world's extra heat. Here in the Pacific, we've watched our water temperatures climb steadily past the <strong className="text-[#e63946]">+1.2°C mark</strong>.
            </p>
            <p className="font-body text-base md:text-lg text-[#a8b2d1] leading-relaxed">
              That might sound like a small number, but underwater, it's a fever. When the chart spikes red during El Niño years, the heat literally cooks our coral reefs. The vibrant ecosystems that feed our families and protect our shores from big waves are turning bone-white and dying.
            </p>
          </div>

          {/* Step 2: Human Impact */}
          <div className="trigger-block glass-card p-8 md:p-10 border-l-4 border-l-transparent transition-colors duration-500" style={{ borderColor: activeStep === 2 ? '#f59e0b' : 'transparent' }}>
            <h3 className="font-display text-2xl text-[#e6f1ff] mb-4">
              The Graveyard of Reefs
            </h3>
            <p className="font-body text-base md:text-lg text-[#a8b2d1] leading-relaxed mb-4">
              When water stays anomalously warm, coral expels its symbiotic algae and starves. The extreme El Niño spikes of <strong>1997 and 2015</strong> triggered mass bleaching events, transforming thousands of years of biological architecture into bone-white graveyards in a matter of weeks.
            </p>
            <div className="my-4 p-5 bg-[#0a1526]/80 border border-white/5 border-l-4 border-l-[#f59e0b] italic text-[#e6f1ff] font-body text-sm relative z-10 rounded-r-xl shadow-lg">
              "We used to dive and see a forest of colors. Now, we dive and see a boneyard. The fish are gone, and with them, the income that sends our children to school." <br/>
              <span className="text-xs text-[#f59e0b] mt-3 block font-mono uppercase tracking-widest">— Local fisherman, Viti Levu, Fiji</span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Pinned Chart (60%) */}
        <div className="w-full md:w-7/12 h-screen sticky top-0 flex flex-col justify-center items-center py-12 md:py-0 md:pl-12 z-0">
          <div ref={rightColumnRef} className="w-full max-w-3xl relative">
            <div className="glass-card p-6 md:p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xl md:text-2xl text-[#e6f1ff]">
                  Sea Surface Temperature Anomalies
                </h3>
                <span className="text-xs font-mono text-[#5c6e8a] uppercase tracking-wider">
                  1982 — 2024
                </span>
              </div>
              <TemperatureChart activeStep={activeStep} />
              <div className="mt-4 text-right">
                <a href="https://stats.pacificdata.org" target="_blank" rel="noreferrer" className="text-xs text-[#a0aec0] hover:text-[#64ffda] transition-colors border-b border-[#64ffda]/30 pb-0.5 font-mono">
                  Source: Pacific Data Hub (SPC:DF_CLIMATE_CHANGE), SST_ANOM
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
