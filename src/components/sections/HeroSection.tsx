import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Waves, Thermometer, AlertTriangle, ArrowDown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  className?: string;
}

export default function HeroSection({ className }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Use classes instead of children collection to avoid null targets
      const statCards = gsap.utils.toArray('.stat-card');

      // Initial state
      gsap.set([titleRef.current, subtitleRef.current], { opacity: 0, y: 30 });
      if (statCards.length > 0) {
        gsap.set(statCards, { opacity: 0, y: 20 });
      }

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.to(titleRef.current, { opacity: 1, y: 0, duration: 1.2, delay: 0.2 })
        .to(subtitleRef.current, { opacity: 1, y: 0, duration: 1.0 }, "-=0.8");

      if (statCards.length > 0) {
        tl.to(statCards, { opacity: 1, y: 0, duration: 0.8, stagger: 0.15 }, "-=0.6");
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const stats = [
    { icon: Waves, value: '+1.5°C', label: 'Warming since 1900', color: '#E85D4E' },
    { icon: Thermometer, value: '4.5 mm/yr', label: 'Regional Sea Level Rise', color: '#2DB5C7' },
    { icon: AlertTriangle, value: '22', label: 'Island nations at risk', color: '#F2D07A' },
  ];

  return (
    <section
      id="hero"
      ref={sectionRef}
      className={`relative min-h-screen flex items-center justify-center overflow-hidden ${className || ''}`}
    >
      {/* Animated wave effect overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[var(--ocean-abyss)] to-transparent" />
      </div>

      {/* Top Content: Title & Subtitle */}
      <div className="absolute top-[10vh] left-0 w-full z-10 px-6 md:px-12 flex flex-col items-center text-center pointer-events-none">
        <h1
          ref={titleRef}
          className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-[#F5F2EB] leading-[0.9] tracking-tight mb-6 drop-shadow-2xl"
        >
          <span className="block opacity-90">Tides of</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#2DB5C7] to-[#E85D4E]">Tomorrow</span>
        </h1>

        <p
          ref={subtitleRef}
          className="font-body text-base md:text-lg lg:text-xl text-[#F5F2EB]/90 max-w-2xl leading-relaxed drop-shadow-lg backdrop-blur-sm bg-black/20 p-4 rounded-xl border border-white/5"
        >
          The Pacific Islands are on the frontlines of climate change.
          <span className="text-[#2DB5C7] font-semibold"> Contributing less than 0.03% of global emissions, </span> 
          yet facing the brunt of a rising ocean.
        </p>
      </div>

      {/* Bottom Content: Minimalist Stats */}
      <div className="absolute bottom-[10vh] left-0 w-full z-10 px-6 md:px-12 pointer-events-none flex justify-center">
        <div ref={statsRef} className="flex flex-wrap justify-center gap-4 md:gap-8 max-w-5xl">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="stat-card glass-panel rounded-xl px-4 py-3 md:px-6 md:py-4 flex flex-col items-center backdrop-blur-md bg-[#0a1526]/50 border border-white/10"
            >
              <stat.icon
                className="w-5 h-5 mb-1"
                style={{ color: stat.color }}
              />
              <div
                className="font-display text-xl md:text-2xl font-bold"
                style={{ color: stat.color }}
              >
                {stat.value}
              </div>
              <div className="text-[10px] md:text-xs text-[#F5F2EB]/60 mt-1 uppercase tracking-wider font-mono">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <span className="text-[10px] font-mono tracking-widest uppercase text-[#F5F2EB]/40">
          Scroll to immerse
        </span>
        <ArrowDown className="w-4 h-4 text-[#F5F2EB]/40 animate-bounce" />
      </div>
    </section>
  );
}
