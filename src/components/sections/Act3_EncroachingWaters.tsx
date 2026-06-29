import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Droplets } from 'lucide-react';
import SeaLevelChart from '@/components/charts/SeaLevelChart';
import { getStation } from '@/data/countryStations';

gsap.registerPlugin(ScrollTrigger);

interface Act3Props {
  className?: string;
  selectedCountry?: { id: string; name: string };
}

export default function Act3_EncroachingWaters({ className, selectedCountry }: Act3Props) {
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
      aria-label="Act III: Encroaching Waters narrative"
      className={`relative bg-transparent ${className || ''}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--ocean-abyss)] via-[var(--ocean-abyss)]/80 to-transparent pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 flex flex-col-reverse md:flex-row-reverse">
        
        {/* TEXT COLUMN (Visually Right, 40%) */}
        <div ref={leftColumnRef} className="w-full md:w-5/12 py-[35vh] flex flex-col gap-[80vh] z-10">
          
          {/* Step 0: Intro */}
          <div 
            className="trigger-block-sinking relative py-12 px-6 md:px-8 transition-all duration-500" 
            style={{ 
              opacity: activeStep === 0 ? 1 : 0.4,
              transform: activeStep === 0 ? 'scale(1)' : 'scale(0.98)'
            }}
          >
            <div className={`absolute inset-0 rounded-none transition-opacity duration-500 ${activeStep === 0 ? 'glass-card' : ''}`} />
            <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Droplets className="w-5 h-5 text-terracotta" />
              <span className="text-xs font-body tracking-widest uppercase text-terracotta">
                ACT III — ENCROACHING WATERS
              </span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-shell-white mb-6 leading-tight">
              The Rising <span className="text-terracotta">Tides</span>
            </h2>
            <p className="font-body text-base md:text-lg text-shell-white/80 leading-relaxed">
              Thermal expansion and glacial melt have broken the ancient boundaries of the tide.
            </p>
            </div>
          </div>

          {/* Step 1: Migration */}
          <div 
            className="trigger-block-sinking relative py-12 px-6 md:px-8 transition-all duration-500" 
            style={{ 
              opacity: activeStep === 1 ? 1 : 0.4,
              transform: activeStep === 1 ? 'scale(1)' : 'scale(0.98)'
            }}
          >
            <div className={`absolute inset-0 rounded-none transition-opacity duration-500 ${activeStep === 1 ? 'glass-card' : ''}`} />
            <div className="relative z-10">
            <h3 className="font-display text-3xl md:text-4xl font-bold text-shell-white mb-4">
              Accelerated Sea Level Rise
            </h3>
            <p className="font-body text-base md:text-lg text-shell-white/80 leading-relaxed mb-4">
              Satellite altimetry data reveals sea level anomalies rising at nearly <span className="text-terracotta font-semibold">4.5 millimeters per year</span> in the tropical Pacific—significantly outpacing the global mean. This isn't just an environmental hazard; it is a physical encroachment on sovereign land.
            </p>
            <p className="font-body text-base md:text-lg text-shell-white/80 leading-relaxed">
              When the sea level rises by even a few millimeters, King Tides penetrate hundreds of meters further inland, completely reshaping the geography of the islands.
            </p>
            </div>
          </div>

          {/* Step 2: Human Impact */}
          <div 
            className="trigger-block-sinking relative py-12 px-6 md:px-8 transition-all duration-500" 
            style={{ 
              opacity: activeStep === 2 ? 1 : 0.4,
              transform: activeStep === 2 ? 'scale(1)' : 'scale(0.98)'
            }}
          >
            <div className={`absolute inset-0 rounded-none transition-opacity duration-500 ${activeStep === 2 ? 'glass-card' : ''}`} />
            <div className="relative z-10">
            <h3 className="font-display text-3xl md:text-4xl font-bold text-shell-white mb-4">
              When the Sea Comes Ashore
            </h3>
            <p className="font-body text-base md:text-lg text-shell-white/80 leading-relaxed mb-4">
              When people hear about sea-level rise, they picture waves crashing over seawalls. But the reality is often quieter, and more deadly. The saltwater seeps up from underneath the ground.
            </p>
            <p className="font-body text-base md:text-lg text-shell-white/80 leading-relaxed">
              Look at the <strong className="text-terracotta">red inundation zone</strong> on the chart. When the sea rises past that point, it gets into the wells our grandparents dug. You can't drink the water anymore. Once the salt is in the soil, the land simply cannot sustain life.
            </p>
            <div className="my-4 p-5 glass-card italic text-shell-white/90 font-body text-sm">
              "We planted taro where our grandfathers planted taro, but the soil is poisoned with salt. We are literally watching the ocean swallow the land that holds our ancestors' bones." <br/>
              <span className="text-xs text-drift-wood mt-3 block font-body uppercase tracking-widest">— Community Leader, Funafuti, Tuvalu</span>
            </div>
            </div>
          </div>

        </div>

        {/* CHART COLUMN (Visually Left, 60%) */}
        <div role="region" aria-label="Sea level anomalies chart" className="w-full md:w-7/12 h-screen sticky top-0 flex flex-col justify-center items-center py-12 md:py-0 md:pr-12 z-0">
          <div ref={rightColumnRef} className="w-full max-w-4xl relative h-[60vh] flex flex-col justify-center items-center">
            
            <SeaLevelChart activeStep={activeStep} selectedCountry={selectedCountry} />

            <div className="absolute bottom-[-52px] left-0 right-0 text-center text-[9px] uppercase tracking-widest font-body text-drift-wood/75">
              {getStation(selectedCountry?.id, 'seaLevel').stationName} — {getStation(selectedCountry?.id, 'seaLevel').dataSource} Sea Level Profile
            </div>
            
          </div>
        </div>

      </div>
    </section>
  );
}
