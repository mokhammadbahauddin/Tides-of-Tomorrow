import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CropYieldChart } from '@/components/charts/CropYieldChart';

gsap.registerPlugin(ScrollTrigger);

interface Act5Props {
  className?: string;
}

export default function Act5_FoodSecurity({ className }: Act5Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const leftColumnRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);

  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const steps = gsap.utils.toArray<HTMLElement>('.trigger-block-food');
      
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
      id="food-security"
      ref={sectionRef}
      className={`relative bg-transparent ${className || ''}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--ocean-abyss)] via-[var(--ocean-abyss)]/80 to-transparent pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 flex flex-col md:flex-row-reverse">
        
        {/* TEXT COLUMN (Visually Right, 40%) */}
        <div ref={leftColumnRef} className="w-full md:w-5/12 py-[30vh] flex flex-col gap-[70vh] z-10">
          
          <div className="trigger-block-food glass-card p-8 md:p-10 border-l-4 border-l-transparent transition-colors duration-500" style={{ borderColor: activeStep === 0 ? '#e6b89c' : 'transparent' }}>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-px bg-[#e63946]"></span>
              <span className="text-sm font-mono tracking-widest uppercase text-[#e6b89c]">
                ACT V — FOOD SECURITY
              </span>
            </div>
            
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-[#e6f1ff] mb-8 leading-tight">
              The Dying <span className="text-[#e6b89c]">Soil</span>
            </h2>
            <p className="font-body text-base md:text-lg text-[#a8b2d1] leading-relaxed mb-6">
              When extreme weather and saltwater intrusion combine, they strike directly at the foundation of subsistence agriculture. In the Pacific, staple crops like taro, sweet potatoes, and bananas are not just calories on a spreadsheet—they are cultural cornerstones, the bedrock of community resilience, and a profound connection to ancestral lands.
            </p>
            <div className="p-4 bg-[#112240] border-l-4 border-[#e63946] italic text-[#ccd6f6] font-body text-sm rounded-r-md">
              "We plant the taro, but the salt in the soil from the king tides means it rots before we can harvest. Our children are eating imported rice instead of what our ancestors grew. We are losing our food sovereignty." <br/>
              <span className="text-xs text-[#8892b0] mt-2 block">— Farmer, Malaita Province, Solomon Islands</span>
            </div>
          </div>

          <div className="trigger-block-food glass-card p-8 md:p-10 border-l-4 border-l-transparent transition-colors duration-500" style={{ borderColor: activeStep === 1 ? '#e6b89c' : 'transparent' }}>
            <h3 className="font-display text-3xl md:text-4xl font-bold text-[#e6f1ff] mb-6">
              The Empty Harvest
            </h3>
            <p className="font-body text-base md:text-lg text-[#a8b2d1] leading-relaxed mb-4">
              When the soil turns salty and the rains fail, the crops stop growing. For generations, staples like taro and sweet potato were the backbone of our communities. Now, families watch their harvests shrink year after year.
            </p>
            <p className="font-body text-base md:text-lg text-[#a8b2d1] leading-relaxed">
              That <strong className="text-[#e63946]">red gap</strong> on the chart isn't just a statistical deficit. It represents empty plates. It represents the food we used to grow ourselves. To survive, we are forced to buy expensive, processed, imported food in plastic packaging. We aren't just losing our crops; we are losing our food sovereignty.
            </p>
          </div>

        </div>

        {/* CHART COLUMN (Visually Left, 60%) */}
        <div className="w-full md:w-7/12 h-screen sticky top-0 flex flex-col justify-center items-center py-12 md:py-0 md:pr-12 z-0">
          <div ref={rightColumnRef} className="w-full max-w-3xl relative">
            <div className="glass-card p-6 md:p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display text-lg md:text-xl text-[#e6f1ff]">Pacific Staple Crop Yields</h3>
                <span className="text-xs font-mono text-[#5c6e8a] uppercase tracking-wider">FAO Index</span>
              </div>
              <p className="text-xs text-[#a8b2d1] mb-4 leading-relaxed font-body">
                Average yield (tonnes per hectare) showing stagnation and decline since 1961.
              </p>
              <CropYieldChart progress={activeStep} />
              <div className="mt-4 text-right">
                <a href="https://stats.pacificdata.org" target="_blank" rel="noreferrer" className="text-xs text-[#a0aec0] hover:text-[#64ffda] transition-colors border-b border-[#64ffda]/30 pb-0.5 font-mono">
                  Source: Pacific Data Hub (SPC:DF_AGRICULTURAL_PRODUCTION)
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
