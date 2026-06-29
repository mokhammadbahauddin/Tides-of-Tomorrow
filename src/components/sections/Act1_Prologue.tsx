import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Leaf } from 'lucide-react';
import PacificGlobe from '@/components/charts/PacificGlobe';
import CarbonLedgerChart from '@/components/charts/CarbonLedgerChart';

gsap.registerPlugin(ScrollTrigger);

export default function Act1_Prologue() {
  const sectionRef = useRef<HTMLElement>(null);
  const leftColumnRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);

  // State to track which narrative block is currently active
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Create ScrollTriggers for each trigger block in the prologue
      const steps = gsap.utils.toArray<HTMLElement>('.trigger-block-prologue');
      
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
      id="prologue"
      ref={sectionRef}
      className="relative min-h-screen bg-transparent flex items-center justify-center py-24 z-10"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--ocean-abyss)]/50 to-[var(--ocean-abyss)] pointer-events-none z-0" />
      
      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 flex flex-col-reverse md:flex-row">
        
        {/* LEFT COLUMN: Narrative (40%) */}
        <div ref={leftColumnRef} className="w-full md:w-5/12 py-[30vh] flex flex-col gap-[75vh] z-10">
          
          {/* Step 0: Ancestry & Navigation */}
          <div 
            className="trigger-block-prologue relative py-12 px-6 md:px-8 transition-all duration-500" 
            style={{ 
              opacity: activeStep === 0 ? 1 : 0.4,
              transform: activeStep === 0 ? 'scale(1)' : 'scale(0.98)'
            }}
          >
            <div className={`absolute inset-0 rounded-none transition-opacity duration-500 ${activeStep === 0 ? 'glass-card' : ''}`} />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <Leaf className="w-5 h-5 text-warm-sand" />
                <span className="text-xs font-body tracking-widest uppercase text-warm-sand">
                  Act I: Prologue
                </span>
              </div>
              
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-shell-white mb-8 leading-tight">
                Our Homes, Our <span className="text-reef-teal">History</span>
              </h2>
              
              <p className="font-body text-base md:text-lg text-shell-white/80 leading-relaxed">
                For thousands of years, our ancestors lived in balance with the ocean. Polynesian navigators didn't use satellites; they read the stars, the currents, and the flights of birds. The Pacific was never an empty space between continents; it was a highway connecting our cultures and our families.
              </p>
            </div>
          </div>

          {/* Step 1: The Carbon Ledger */}
          <div 
            className="trigger-block-prologue relative py-12 px-6 md:px-8 transition-all duration-500" 
            style={{ 
              opacity: activeStep === 1 ? 1 : 0.4,
              transform: activeStep === 1 ? 'scale(1)' : 'scale(0.98)'
            }}
          >
            <div className={`absolute inset-0 rounded-none transition-opacity duration-500 ${activeStep === 1 ? 'glass-card' : ''}`} />
            <div className="relative z-10">
              <h3 className="text-warm-sand font-display text-2xl font-bold mb-6 tracking-wide">The Frontline of a Changing Climate</h3>
              <ul className="space-y-4 font-body text-base md:text-lg text-shell-white/70 mb-6">
                <li className="flex items-start gap-3">
                  <span className="text-terracotta mt-1.5 text-xs">●</span>
                  <span>The Pacific Ocean covers <strong className="text-shell-white">one-third of our planet's surface</strong>.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-terracotta mt-1.5 text-xs">●</span>
                  <span>Yet, our island nations contribute only <strong className="text-reef-teal">0.03% of global greenhouse gas emissions</strong>.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-terracotta mt-1.5 text-xs">●</span>
                  <span>We didn't build the factories or burn the coal that caused this crisis, but we are the first to lose our homes to it.</span>
                </li>
              </ul>
              
              <p className="font-body text-base md:text-lg text-shell-white/80 leading-relaxed">
                This isn't a warning about the distant future. It's a record of what we are living through right now. The data you are about to explore isn't just a collection of numbers; it is the story of our homes, our livelihoods, and our survival. <strong className="text-shell-white">This is what climate change looks like on the ground.</strong>
              </p>
            </div>
          </div>
          
        </div>

        {/* RIGHT COLUMN: Sticky Pinned Visual Layer (60%) */}
        <div className="w-full md:w-7/12 h-screen sticky top-0 flex flex-col justify-center items-center py-12 md:py-0 md:pl-12 z-0">
          <div ref={rightColumnRef} className="w-full max-w-4xl relative h-[65vh] flex flex-col justify-center items-center">
            
            {/* Step 0: The Pacific Globe (Active Navigation Map) */}
            <div 
              className="absolute inset-0 pointer-events-auto flex items-center justify-center transition-all duration-700"
              style={{ 
                opacity: activeStep === 0 ? 0.9 : 0,
                pointerEvents: activeStep === 0 ? 'auto' : 'none',
                transform: activeStep === 0 ? 'scale(1.1) translate(0px, 0px)' : 'scale(0.9) translate(0px, -20px)',
              }}
            >
              <PacificGlobe />
            </div>

            {/* Step 1: Carbon Ledger Chart (Emissions Balance Sheet) */}
            <div 
              className="absolute inset-0 pointer-events-auto flex items-center justify-center transition-all duration-700"
              style={{ 
                opacity: activeStep === 1 ? 1 : 0,
                pointerEvents: activeStep === 1 ? 'auto' : 'none',
                transform: activeStep === 1 ? 'scale(1) translate(0px, 0px)' : 'scale(1.1) translate(0px, 20px)',
              }}
            >
              <CarbonLedgerChart isActive={activeStep === 1} />
            </div>

            <div className="absolute bottom-[-45px] left-0 right-0 text-center pointer-events-none z-20">
              <p className="text-[9px] text-drift-wood/75 uppercase tracking-widest font-body inline-block bg-deep-ocean/90 px-3 py-1.5 border border-warm-sand/15 backdrop-blur-sm rounded-none">
                {activeStep === 0 
                  ? "Source: Natural Earth World Atlas (Geographical TopoJSON)" 
                  : "Source: Global Carbon Project (GCP) & WRI Climate Watch"
                }
              </p>
            </div>

          </div>
        </div>
        
      </div>
    </section>
  );
}
