import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Leaf } from 'lucide-react';
import PacificGlobe from '@/components/charts/PacificGlobe';
import CarbonLedgerChart from '@/components/charts/CarbonLedgerChart';

gsap.registerPlugin(ScrollTrigger);

export default function Act1_Prologue() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Main section fade in
      gsap.fromTo(
        '.prologue-header',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1.5,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Scroll trigger blocks for step tracking
      const blocks = gsap.utils.toArray('.act1-step');
      blocks.forEach((block: any, i) => {
        ScrollTrigger.create({
          trigger: block,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => setActiveStep(i),
          onEnterBack: () => setActiveStep(i),
        });
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="prologue"
      ref={sectionRef}
      className="relative min-h-[200vh] bg-transparent z-10"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--ocean-abyss)]/50 to-[var(--ocean-abyss)] pointer-events-none z-0" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row">
        
        {/* LEFT COLUMN: Narrative (Scrolling Blocks) */}
        <div className="w-full md:w-5/12 py-[30vh] flex flex-col z-10 gap-[70vh]">
          
          {/* Step 0: The Ocean Guardians */}
          <div className="act1-step">
            <div className="prologue-header flex items-center gap-3 mb-6">
              <Leaf className="w-6 h-6 text-[#00d4aa]" />
              <span className="text-sm font-mono tracking-widest uppercase text-[#00d4aa]">
                ACT I — PROLOGUE
              </span>
            </div>
            
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-[#e6f1ff] mb-8 leading-tight">
              Our Homes, Our <span className="text-[#00d4aa]">History</span>
            </h2>
            
            <div className="bg-[#0a1526]/80 border border-[#00d4aa]/20 rounded-xl p-6 shadow-xl backdrop-blur-md">
              <h3 className="text-[#00d4aa] font-display text-2xl font-semibold mb-4 tracking-wide">The Ocean Guardians</h3>
              <p className="font-body text-lg text-[#a8b2d1] leading-relaxed mb-4">
                For thousands of years, our ancestors lived in balance with the ocean. The Pacific wasn't an empty space between continents—it was a highway connecting our cultures.
              </p>
              <p className="font-body text-lg text-[#e6f1ff] font-medium">
                Today, the Pacific Ocean covers one-third of our planet's surface. We are the guardians of the world's largest ecosystem.
              </p>
            </div>
          </div>

          {/* Step 1: The Carbon Ledger */}
          <div className="act1-step">
            <div className="bg-[#1a0b12]/80 border border-[#e63946]/30 rounded-xl p-6 shadow-[0_0_30px_rgba(230,57,70,0.1)] backdrop-blur-md">
              <h3 className="text-[#e63946] font-display text-2xl font-semibold mb-4 tracking-wide">The Carbon Ledger</h3>
              <p className="font-body text-lg text-[#a8b2d1] leading-relaxed mb-4">
                Yet, despite protecting 15% of the Earth's surface, all 22 Pacific Island nations collectively contribute <strong className="text-[#e63946]">less than 0.03% of global greenhouse gas emissions¹</strong>.
              </p>
              <p className="font-body text-lg text-[#a8b2d1] leading-relaxed">
                We didn't build the factories or burn the coal that caused this crisis, but we are placed on the frontline of its destruction. This isn't just a natural disaster; it's a global carbon debt paid with our homelands.
              </p>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Sticky Visuals */}
        <div className="w-full md:w-7/12 h-screen sticky top-0 flex flex-col justify-center items-center py-12 md:py-0 md:pl-12 z-0">
          
          {/* Visual Container: Fade between Globe and Ledger based on activeStep */}
          <div className="w-full h-[60vh] relative flex items-center justify-center transition-all duration-700">
            
            {/* Step 0 Visual: The Globe */}
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${activeStep === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
              <div className="relative w-[150%] h-[150%] pointer-events-auto flex items-center justify-center">
                <PacificGlobe />
              </div>
            </div>

            {/* Step 1 Visual: The Carbon Ledger */}
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${activeStep === 1 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
              <CarbonLedgerChart />
            </div>

          </div>

        </div>
        
      </div>
    </section>
  );
}
