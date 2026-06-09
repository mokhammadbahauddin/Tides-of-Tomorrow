import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Leaf } from 'lucide-react';
import PacificGlobe from '@/components/charts/PacificGlobe';

gsap.registerPlugin(ScrollTrigger);

export default function Act1_Prologue() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.prologue-text',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1.5,
          stagger: 0.3,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
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
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row">
        
        {/* LEFT COLUMN: Narrative */}
        <div className="w-full md:w-1/2 py-24 flex flex-col justify-center z-10">
          <div className="prologue-text flex items-center gap-3 mb-6">
            <Leaf className="w-6 h-6 text-[#00d4aa]" />
            <span className="text-sm font-mono tracking-widest uppercase text-[#00d4aa]">
              ACT I — PROLOGUE
            </span>
          </div>
          
          <h2 className="prologue-text font-display text-4xl md:text-5xl lg:text-6xl font-bold text-[#e6f1ff] mb-8 leading-tight">
            Our Homes, Our <span className="text-[#00d4aa]">History</span>
          </h2>
          
          <p className="prologue-text font-body text-base md:text-lg text-[#a8b2d1] leading-relaxed mb-6">
            For thousands of years, our ancestors lived in balance with the ocean. Polynesian navigators didn't use satellites; they read the stars, the currents, and the flights of birds. The Pacific wasn't an empty space between continents—it was a highway connecting our cultures and our families.
          </p>

          <div className="prologue-text bg-[#0a1526]/50 border border-[#00d4aa]/20 rounded-xl p-6 mb-6 shadow-xl backdrop-blur-sm">
            <h3 className="text-[#00d4aa] font-display text-xl font-semibold mb-4 tracking-wide">The Frontline of a Changing Climate</h3>
            <ul className="space-y-4 font-body text-base md:text-lg text-[#a8b2d1]">
              <li className="flex items-start gap-3">
                <span className="text-[#e63946] mt-1.5 text-xs">●</span>
                <span>The Pacific Ocean covers <strong>one-third of our planet's surface</strong>.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#e63946] mt-1.5 text-xs">●</span>
                <span>Yet, our island nations contribute only <strong className="text-[#00d4aa]">0.03% of global greenhouse gas emissions¹</strong>.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#e63946] mt-1.5 text-xs">●</span>
                <span>We didn't build the factories or burn the coal that caused this crisis, but we are the first to lose our homes to it.</span>
              </li>
            </ul>
          </div>
          
          <p className="prologue-text font-body text-base md:text-lg text-[#a8b2d1] leading-relaxed mb-12">
            This isn't a warning about the distant future. It's a record of what we are living through right now. The data you are about to explore isn't just a collection of numbers—it's the story of our homes, our livelihoods, and our survival. <strong>This is what climate change looks like on the ground.</strong>
          </p>
        </div>

        {/* RIGHT COLUMN: PacificGlobe */}
        <div className="w-full md:w-1/2 md:h-screen md:sticky top-0 flex flex-col justify-center items-center py-12 md:py-0 md:pl-12 z-0 md:translate-x-12 lg:translate-x-24">
          <div className="w-full max-w-lg relative min-h-[500px] flex items-center justify-center">
            {/* Wrapper for the Globe to contain it visually */}
            <div className="relative w-[150%] h-[150%] pointer-events-auto">
              <PacificGlobe />
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
}
