import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Scale } from 'lucide-react';
import TaxChart from '@/components/charts/TaxChart';

gsap.registerPlugin(ScrollTrigger);

interface Act6Props {
  className?: string;
}

export default function Act6_UnpaidDebt({ className }: Act6Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const leftColumnRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);

  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const steps = gsap.utils.toArray<HTMLElement>('.trigger-block-tax');
      
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
      id="unpaid-debt"
      ref={sectionRef}
      className={`relative bg-transparent ${className || ''}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--ocean-abyss)] via-[var(--ocean-abyss)]/80 to-transparent pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 flex flex-col md:flex-row">
        
        {/* LEFT COLUMN: Narrative Text (40%) */}
        <div ref={leftColumnRef} className="w-full md:w-5/12 py-[30vh] flex flex-col gap-[70vh] z-10">
          
          <div className="trigger-block-tax glass-card p-8 md:p-10 border-l-4 border-l-transparent transition-colors duration-500" style={{ borderColor: activeStep === 0 ? '#e6b89c' : 'transparent' }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-px bg-[#f59e0b]"></span>
              <span className="text-xs font-mono tracking-widest uppercase text-[#f59e0b]">
                ACT VI — DATASET 05
              </span>
            </div>
            <h3 className="font-display text-2xl text-[#e6f1ff] mb-4">
              The Cost of Survival
            </h3>
            <p className="font-body text-base md:text-lg text-[#a8b2d1] leading-relaxed mb-4">
              Climate change doesn't just destroy homes; it bankrupts communities. To survive, our governments have to build massive seawalls, move entire villages inland, and rebuild after every cyclone. Where does that money come from?
            </p>
            <p className="font-body text-base md:text-lg text-[#a8b2d1] leading-relaxed">
              It comes from us. Fiji had to introduce a climate adaptation tax on its own economy. We are taxing our own people just to afford the concrete needed to keep the ocean out. 
            </p>
          </div>

          <div className="trigger-block-tax glass-card p-8 md:p-10 border-l-4 border-l-transparent transition-colors duration-500" style={{ borderColor: activeStep === 1 ? '#f59e0b' : 'transparent' }}>
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-5 h-5 text-[#f59e0b]" />
              <h3 className="font-display text-2xl text-[#e6f1ff]">
                The Unpaid Debt
              </h3>
            </div>
            <p className="font-body text-base md:text-lg text-[#a8b2d1] leading-relaxed mb-4">
              Look at the background of the chart. That massive red block represents the historical emissions of the industrialized world. That tiny dot below it? That's the entire Pacific. 
            </p>
            <p className="font-body text-base md:text-lg text-[#a8b2d1] leading-relaxed">
              We didn't cause this crisis, but we are paying the bill. When you see our taxes rising just to survive, you realize this isn't just an environmental issue—it's a profound injustice. We are paying a tax on our own existence.
            </p>
          </div>

        </div>

        {/* RIGHT COLUMN: Pinned Chart (60%) */}
        <div className="w-full md:w-7/12 h-screen sticky top-0 flex flex-col justify-center items-center py-12 md:py-0 md:pl-12 z-0">
          <div ref={rightColumnRef} className="w-full max-w-3xl relative">
            <div className="glass-card p-6 md:p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display text-lg md:text-xl text-[#e6f1ff]">Fiji Climate Adaptation Levy</h3>
                <span className="text-xs font-mono text-[#5c6e8a] uppercase tracking-wider">Case Study</span>
              </div>
              <p className="text-xs text-[#a8b2d1] mb-4 leading-relaxed font-body">
                Fiji's environmental and climate adaptation tax revenues as a percent of GDP.
              </p>
              <TaxChart activeStep={activeStep} />
              <div className="mt-4 text-right">
                <a href="https://stats.pacificdata.org" target="_blank" rel="noreferrer" className="text-xs text-[#a0aec0] hover:text-[#64ffda] transition-colors border-b border-[#64ffda]/30 pb-0.5 font-mono">
                  Source: Pacific Data Hub (SPC:DF_CLIMATE_CHANGE), ENV_TAXES
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
