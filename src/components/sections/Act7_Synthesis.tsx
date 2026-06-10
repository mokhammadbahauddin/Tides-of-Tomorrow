import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Scale } from 'lucide-react';
import { SynthesisExplorer } from '@/components/charts/SynthesisExplorer';

gsap.registerPlugin(ScrollTrigger);

interface Act7Props {
  className?: string;
}

export default function Act7_Synthesis({ className }: Act7Props) {
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
      className={`relative min-h-screen bg-[#061018] py-20 md:py-32 flex items-center justify-center z-10 ${className || ''}`}
    >
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-12">
        <div ref={contentRef} className="w-full flex flex-col gap-12">
          
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Scale className="w-6 h-6 text-[#f59e0b]" />
              <span className="text-sm font-mono tracking-widest uppercase text-[#f59e0b]">
                Interactive Tool
              </span>
            </div>
            
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-[#e6f1ff] mb-6 leading-tight">
              Connecting the <span className="text-[#64ffda]">Crises</span>
            </h2>
            
            <p className="font-body text-base md:text-lg text-[#a8b2d1] leading-relaxed mb-4">
              None of these events happen in isolation. The warming ocean, the rising tides, the failed crops, and the rising taxes—they are all connected. They are the dominoes falling in our backyards, pushed by emissions from continents away.
            </p>
            <p className="font-body text-base md:text-lg text-[#a8b2d1] leading-relaxed">
              Use the tool below to explore how these crises overlap. You can see for yourself how the rising temperature directly impacts our ability to grow food, or how the rising sea drives up the cost of survival. The data tells a clear story: everything is connected.
            </p>
          </div>

          <div className="w-full">
            <SynthesisExplorer />
          </div>

        </div>
      </div>
    </section>
  );
}
