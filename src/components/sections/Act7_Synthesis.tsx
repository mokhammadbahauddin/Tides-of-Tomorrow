import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Scale } from 'lucide-react';
import { SynthesisExplorer } from '@/components/charts/SynthesisExplorer';

gsap.registerPlugin(ScrollTrigger);

interface Act7Props {
  className?: string;
  selectedCountry?: { id: string; name: string };
}

export default function Act7_Synthesis({ className, selectedCountry }: Act7Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="climate-debt"
      ref={sectionRef}
      aria-label="Act VII: Connecting the Crises Synthesis"
      className={`relative min-h-screen bg-deep-ocean py-20 md:py-32 flex items-center justify-center z-10 ${className || ''}`}
    >
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12">
        <div ref={contentRef} className="w-full flex flex-col gap-12">
          
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Scale className="w-5 h-5 text-golden-hour" />
              <span className="text-xs font-body tracking-widest uppercase text-golden-hour">
                Interactive Synthesis
              </span>
            </div>
            
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-shell-white mb-6 leading-tight">
              Connecting the <span className="text-reef-teal">Crises</span>
            </h2>
            
            <p className="font-body text-base md:text-lg text-shell-white/80 leading-relaxed mb-4">
              None of these events happen in isolation. The warming ocean, the rising tides, the failed crops, and the rising taxes—they are all connected. They are the dominoes falling in our backyards, pushed by emissions from continents away.
            </p>
            <p className="font-body text-base md:text-lg text-shell-white/70 leading-relaxed">
              We invite you to explore this interactive nexus to trace how these crises overlap. By examining these patterns, we can see clearly how rising temperatures suppress our harvests, or how encroaching tides escalate the economic cost of our survival. The data is unequivocal: everything is bound together.
            </p>
          </div>

          <div role="region" aria-label="Interactive Synthesis Explorer" className="w-full">
            <SynthesisExplorer selectedCountry={selectedCountry} />
          </div>

        </div>
      </div>
    </section>
  );
}
