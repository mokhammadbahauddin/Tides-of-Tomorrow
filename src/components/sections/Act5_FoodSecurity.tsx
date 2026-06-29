import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CropYieldChart } from '@/components/charts/CropYieldChart';
import { getStation } from '@/data/countryStations';

gsap.registerPlugin(ScrollTrigger);

interface Act5Props {
  className?: string;
  selectedCountry?: { id: string; name: string };
}

export default function Act5_FoodSecurity({ className, selectedCountry }: Act5Props) {
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
      aria-label="Act V: Food Security narrative"
      className={`relative bg-transparent ${className || ''}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--ocean-abyss)] via-[var(--ocean-abyss)]/80 to-transparent pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 flex flex-col-reverse md:flex-row-reverse">
        
        {/* TEXT COLUMN (Visually Right, 40%) */}
        <div ref={leftColumnRef} className="w-full md:w-5/12 py-[35vh] flex flex-col gap-[80vh] z-10">
          
          <div 
            className="trigger-block-food relative py-12 px-6 md:px-8 transition-all duration-500" 
            style={{ 
              opacity: activeStep === 0 ? 1 : 0.4,
              transform: activeStep === 0 ? 'scale(1)' : 'scale(0.98)'
            }}
          >
            <div className={`absolute inset-0 rounded-none transition-opacity duration-500 ${activeStep === 0 ? 'glass-card' : ''}`} />
            <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-px bg-terracotta"></span>
              <span className="text-xs font-body tracking-widest uppercase text-coral-pink">
                ACT V — FOOD SECURITY
              </span>
            </div>
            
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-shell-white mb-8 leading-tight">
              The Dying <span className="text-coral-pink">Soil</span>
            </h2>
            <p className="font-body text-base md:text-lg text-shell-white/80 leading-relaxed mb-6">
              When extreme weather and saltwater intrusion combine, they strike directly at the foundation of subsistence agriculture. In the Pacific, staple crops like taro, sweet potatoes, and bananas are not just calories on a spreadsheet—they are cultural cornerstones, the bedrock of community resilience, and a profound connection to ancestral lands.
            </p>
            <div className="p-4 glass-card italic text-shell-white/90 font-body text-sm">
              "We plant the taro, but the salt in the soil from the king tides means it rots before we can harvest. Our children are eating imported rice instead of what our ancestors grew. We are losing our food sovereignty." <br/>
              <span className="text-xs text-drift-wood mt-2 block font-body">— Farmer, Malaita Province, Solomon Islands</span>
            </div>
            </div>
          </div>

          <div 
            className="trigger-block-food relative py-12 px-6 md:px-8 transition-all duration-500" 
            style={{ 
              opacity: activeStep === 1 ? 1 : 0.4,
              transform: activeStep === 1 ? 'scale(1)' : 'scale(0.98)'
            }}
          >
            <div className={`absolute inset-0 rounded-none transition-opacity duration-500 ${activeStep === 1 ? 'glass-card' : ''}`} />
            <div className="relative z-10">
            <h3 className="font-display text-3xl md:text-4xl font-bold text-shell-white mb-6">
              The Empty Harvest
            </h3>
            <p className="font-body text-base md:text-lg text-shell-white/80 leading-relaxed mb-4">
              While agricultural yields are not completely collapsing across the region, they are stagnating while the population expands. In disaster years, sudden crop drops compound the food security pressure.
            </p>
            <p className="font-body text-base md:text-lg text-shell-white/80 leading-relaxed">
              That <strong className="text-terracotta">red bar</strong> on the chart represents Taro—our cultural staple. As temperature anomalies rise and cyclones strike, yields stagnate and experience sudden shocks. This isn't just a statistical flatline; it represents crop failures, empty plates, and the loss of what our ancestors grew. To survive, we are forced to buy expensive, processed, imported food. We aren't just losing our crops; we are losing our food sovereignty.
            </p>
            </div>
          </div>

        </div>

        {/* CHART COLUMN (Visually Left, 60%) */}
        <div role="region" aria-label="Crop yield anomalies chart" className="w-full md:w-7/12 h-screen sticky top-0 flex flex-col justify-center items-center py-12 md:py-0 md:pr-12 z-0">
          <div ref={rightColumnRef} className="w-full max-w-4xl relative h-[60vh] flex flex-col justify-center items-center">
            
            <CropYieldChart activeStep={activeStep} selectedCountry={selectedCountry} />

            <div className="absolute bottom-[-52px] left-0 right-0 text-center text-[9px] uppercase tracking-widest font-body text-drift-wood/75">
              {getStation(selectedCountry?.id, 'cropYield').stationName} — {getStation(selectedCountry?.id, 'cropYield').dataSource}
            </div>
            
          </div>
        </div>

      </div>
    </section>
  );
}
