import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Scale } from 'lucide-react';
import { TaxChart } from '@/components/charts/TaxChart';

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

      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-12 flex flex-col-reverse md:flex-row">
        
        {/* LEFT COLUMN: Narrative Text (40%) */}
        <div ref={leftColumnRef} className="w-full md:w-5/12 py-[35vh] flex flex-col gap-[80vh] z-10">
          
          {/* Step 0 */}
          <div 
            className="trigger-block-tax relative py-12 px-6 md:px-8 transition-all duration-500" 
            style={{ 
              opacity: activeStep === 0 ? 1 : 0.4,
              transform: activeStep === 0 ? 'scale(1)' : 'scale(0.98)'
            }}
          >
            <div className={`absolute inset-0 rounded-none transition-opacity duration-500 ${activeStep === 0 ? 'glass-card' : ''}`} />
            <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-px bg-golden-hour"></span>
              <span className="text-xs font-body tracking-widest uppercase text-golden-hour">
                ACT VI — THE UNPAID DEBT
              </span>
            </div>
            
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-shell-white mb-8 leading-tight">
              The Cost of <span className="text-golden-hour">Survival</span>
            </h2>
            <p className="font-body text-base md:text-lg text-shell-white/80 leading-relaxed mb-4">
              Climate change doesn't just destroy homes; it bankrupts communities. To survive, our governments have to build massive seawalls, move entire villages inland, rebuild after every cyclone, and bail out farmers whose staple crops have entirely failed from saltwater intrusion (Act V). Where does that money come from?
            </p>
            <p className="font-body text-base md:text-lg text-shell-white/80 leading-relaxed">
              It comes from us. Fiji had to introduce a climate adaptation tax on its own economy. We are taxing our own people just to afford the concrete needed to keep the ocean out. 
            </p>
            </div>
          </div>

          {/* Step 1 */}
          <div 
            className="trigger-block-tax relative py-12 px-6 md:px-8 transition-all duration-500" 
            style={{ 
              opacity: activeStep === 1 ? 1 : 0.4,
              transform: activeStep === 1 ? 'scale(1)' : 'scale(0.98)'
            }}
          >
            <div className={`absolute inset-0 rounded-none transition-opacity duration-500 ${activeStep === 1 ? 'glass-card' : ''}`} />
            <div className="relative z-10">
            <h3 className="font-display text-3xl md:text-4xl font-bold text-shell-white mb-6 flex items-center gap-4">
              <Scale className="w-8 h-8 text-golden-hour" />
              The Climate Tax
            </h3>
            <p className="font-body text-base md:text-lg text-shell-white/80 leading-relaxed mb-4">
              Even though Fiji's environmental tax rate appears small (ranging from 0.4% to 1.4% of GDP), it represents a significant economic burden for a developing island nation. These funds are diverted from health, education, and development just to build seawalls and relocate communities.
            </p>
            <p className="font-body text-base md:text-lg text-shell-white/80 leading-relaxed">
              We didn't cause this crisis, but we are paying the bill. When you see our public funds diverted to environmental taxes just to survive, you realize this isn't just an ecological issue—it's a profound injustice. We are paying the price for others' emissions.
            </p>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Chart (60%) */}
        <div className="w-full md:w-7/12 h-screen sticky top-0 flex flex-col justify-center items-center py-12 md:py-0 md:pl-12 z-0">
          <div ref={rightColumnRef} className="w-full max-w-4xl relative h-[60vh] flex flex-col justify-center items-center">
            
            <TaxChart activeStep={activeStep} />

            <div className="absolute bottom-[-32px] left-0 right-0 text-center text-[9px] uppercase tracking-widest font-body text-drift-wood/75">
              Suva Peninsula — OECD/UNEP Environmental Tax Revenue (% GDP)
            </div>
            
          </div>
        </div>

      </div>
    </section>
  );
}
