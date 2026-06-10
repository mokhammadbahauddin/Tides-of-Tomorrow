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
        <div ref={leftColumnRef} className="w-full md:w-5/12 py-[30vh] flex flex-col gap-[70vh] z-10">
          
          <div className="trigger-block-tax glass-card p-8 md:p-10 border-l-4 border-l-transparent transition-colors duration-500" style={{ borderColor: activeStep === 0 ? '#e6b89c' : 'transparent' }}>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-px bg-[#f59e0b]"></span>
              <span className="text-sm font-mono tracking-widest uppercase text-[#f59e0b]">
                ACT VI — THE UNPAID DEBT
              </span>
            </div>
            
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-[#e6f1ff] mb-8 leading-tight">
              The Cost of <span className="text-[#f59e0b]">Survival</span>
            </h2>
            <p className="font-body text-base md:text-lg text-[#a8b2d1] leading-relaxed mb-4">
              Climate change doesn't just destroy homes; it bankrupts communities. To survive, our governments have to build massive seawalls, move entire villages inland, and rebuild after every cyclone. Where does that money come from?
            </p>
            <p className="font-body text-base md:text-lg text-[#a8b2d1] leading-relaxed">
              It comes from us. Fiji had to introduce a climate adaptation tax on its own economy. We are taxing our own people just to afford the concrete needed to keep the ocean out. 
            </p>
          </div>

          <div className="trigger-block-tax glass-card p-8 md:p-10 border-l-4 border-l-transparent transition-colors duration-500" style={{ borderColor: activeStep === 1 ? '#f59e0b' : 'transparent' }}>
            <h3 className="font-display text-3xl md:text-4xl font-bold text-[#e6f1ff] mb-6 flex items-center gap-4">
              <Scale className="w-8 h-8 text-[#f59e0b]" />
              The Climate Tax
            </h3>
            <p className="font-body text-base md:text-lg text-[#a8b2d1] leading-relaxed mb-4">
              Look at the background of the chart. That massive red block represents the historical emissions of the industrialized world. That tiny dot below it? That's the entire Pacific. 
            </p>
            <p className="font-body text-base md:text-lg text-[#a8b2d1] leading-relaxed">
              We didn't cause this crisis, but we are paying the bill. When you see our taxes rising just to survive, you realize this isn't just an environmental issue—it's a profound injustice. We are paying a tax on our own existence.
            </p>
          </div>

        </div>

        {/* RIGHT COLUMN: Chart (60%) */}
        <div className="w-full md:w-7/12 h-screen sticky top-0 flex flex-col justify-center items-center py-12 md:py-0 md:pl-12 z-0">
          <div ref={rightColumnRef} className="w-full max-w-4xl relative h-[60vh] glass-card p-6 rounded-xl flex items-center justify-center">
            
            <TaxChart activeStep={activeStep} />
            
          </div>
        </div>

      </div>
    </section>
  );
}
