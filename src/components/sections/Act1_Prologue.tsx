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
      // Main section fade in
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
            <Leaf className="w-5 h-5 text-warm-sand" />
            <span className="text-xs font-body tracking-widest uppercase text-warm-sand">
              Act I: Prologue
            </span>
          </div>
          
          <h2 className="prologue-text font-display text-4xl md:text-5xl lg:text-6xl font-bold text-shell-white mb-8 leading-tight">
            Our Homes, Our <span className="text-reef-teal">History</span>
          </h2>
          
          <p className="prologue-text font-body text-base md:text-lg text-shell-white/80 leading-relaxed mb-6">
            For thousands of years, our ancestors lived in balance with the ocean. Polynesian navigators didn't use satellites; they read the stars, the currents, and the flights of birds. The Pacific was never an empty space between continents; it was a highway connecting our cultures and our families.
          </p>

          <div className="prologue-text glass-card mb-6">
            <h3 className="text-warm-sand font-display text-xl font-semibold mb-4 tracking-wide">The Frontline of a Changing Climate</h3>
            <ul className="space-y-4 font-body text-base md:text-lg text-shell-white/70">
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
          </div>
          
          <p className="prologue-text font-body text-base md:text-lg text-shell-white/80 leading-relaxed mb-12">
            This isn't a warning about the distant future. It's a record of what we are living through right now. The data you are about to explore isn't just a collection of numbers; it is the story of our homes, our livelihoods, and our survival. <strong className="text-shell-white">This is what climate change looks like on the ground.</strong>
          </p>
        </div>

        {/* RIGHT COLUMN: The Crimson Globe */}
        <div className="w-full md:w-1/2 md:h-screen md:sticky top-0 flex flex-col justify-center items-center py-12 md:py-0 md:pl-12 z-0 md:translate-x-32 lg:translate-x-48 xl:translate-x-64">
          <div className="w-full relative h-[80vh] flex flex-col items-center justify-center">
            
            {/* The Pacific Globe (Now acting as the Carbon Ledger) */}
            <div className="absolute inset-0 pointer-events-auto flex items-center justify-center scale-125 opacity-90 drop-shadow-[0_0_50px_rgba(180,77,54,0.15)]">
              <PacificGlobe />
            </div>

            {/* Data Citation Overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center pointer-events-none z-20 w-[85%] max-w-sm">
              <p className="text-[9px] text-drift-wood/75 uppercase tracking-widest font-body bg-deep-ocean/90 px-3 py-1.5 border border-warm-sand/15 backdrop-blur-sm rounded-sm">
                Source: <a href="https://pacificdata.org/data/dataset/climate-vulnerability-profiles" target="_blank" rel="noreferrer" className="underline decoration-warm-sand/30 hover:decoration-warm-sand hover:text-warm-sand transition-colors underline-offset-2">Pacific Data Hub (PDH.Stat) — Climate Vulnerability Profiles</a>
              </p>
            </div>

          </div>
        </div>
        
      </div>
    </section>
  );
}
