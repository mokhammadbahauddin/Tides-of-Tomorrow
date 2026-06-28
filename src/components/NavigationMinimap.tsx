import { useEffect, useState, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

// Safe registration of ScrollToPlugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollToPlugin);
}

interface NavigationMinimapProps {
  scrollProgress?: number;
  activeSection?: string;
}

interface MinimapItem {
  act: string;
  label: string;
  target: string;
}

const minimapItems: MinimapItem[] = [
  { act: 'Act 1', label: 'Prologue', target: 'prologue' },
  { act: 'Act 2', label: 'Warming', target: 'warming' },
  { act: 'Act 3', label: 'Sinking', target: 'sinking' },
  { act: 'Act 4', label: 'Weather', target: 'extreme-weather' },
  { act: 'Act 5', label: 'Food', target: 'food-security' },
  { act: 'Act 6', label: 'Debt', target: 'unpaid-debt' },
  { act: 'Act 7', label: 'Synthesis', target: 'climate-debt' },
  { act: 'CTA', label: 'Explore', target: 'action' }
];

export const NavigationMinimap = ({
  scrollProgress,
  activeSection
}: NavigationMinimapProps) => {
  const [progress, setProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState('hero');
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Sync scroll progress (either from props or scroll listener)
  useEffect(() => {
    if (scrollProgress !== undefined) {
      setProgress(scrollProgress);
      return;
    }

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress = totalHeight > 0 ? window.scrollY / totalHeight : 0;
      setProgress(currentProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollProgress]);

  // Sync active section (either from props or intersection observer)
  useEffect(() => {
    if (activeSection !== undefined) {
      setCurrentSection(activeSection);
      return;
    }

    const observers: IntersectionObserver[] = [];
    const targets = ['hero', ...minimapItems.map(item => item.target)];

    targets.forEach(target => {
      const el = document.getElementById(target);
      if (!el) return;
      
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setCurrentSection(target);
          }
        },
        { rootMargin: '-40% 0px -40% 0px', threshold: 0 }
      );
      
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach(o => o.disconnect());
  }, [activeSection]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    // Get header height for offset (same as standard navigation scroll padding)
    const header = document.querySelector('header');
    const headerHeight = header ? header.offsetHeight : 0;
    const elementPosition = el.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = elementPosition - headerHeight;

    try {
      gsap.to(window, {
        scrollTo: {
          y: offsetPosition,
          autoKill: true
        },
        duration: 1.2,
        ease: 'power3.inOut'
      });
    } catch (e) {
      // Fallback to native smooth scrolling
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // SVG Island outline paths
  const islandPaths = {
    reef: "M 60 12 C 85 12, 108 28, 108 58 C 108 80, 88 100, 68 108 C 48 116, 28 104, 16 84 C 4 64, 12 38, 32 24 C 44 14, 52 12, 60 12 Z",
    shoreline: "M 60 22 C 80 22, 96 34, 96 58 C 96 74, 82 90, 66 96 C 50 102, 34 92, 24 76 C 14 60, 20 40, 36 28 C 46 20, 52 22, 60 22 Z",
    lowland: "M 60 34 C 74 34, 86 42, 86 58 C 86 68, 76 80, 64 84 C 52 88, 40 80, 32 68 C 24 56, 30 42, 42 36 C 48 32, 54 34, 60 34 Z",
    highland: "M 56 44 C 64 44, 72 48, 72 56 C 72 62, 66 70, 58 72 C 50 74, 44 68, 38 60 C 32 52, 36 46, 44 44 C 48 42, 52 44, 56 44 Z",
    peak: "M 54 52 C 58 52, 62 54, 62 58 C 62 61, 58 64, 54 64 C 50 64, 46 61, 46 58 C 46 54, 50 52, 54 52 Z"
  };

  const waterY = useMemo(() => {
    return 120 - (progress * 120);
  }, [progress]);

  // Wave surface line path
  const wavePath = useMemo(() => {
    const y = waterY;
    return `M 10,${y} Q 35,${y - 2} 60,${y} T 110,${y}`;
  }, [waterY]);

  // Dynamic threat readout styles
  const threatInfo = useMemo(() => {
    const percentage = Math.round(progress * 100);
    let color = '#2B7A78'; // Teal: Safe/low
    let level = 'LOW';
    
    if (percentage >= 70) {
      color = '#B44D36'; // Terracotta: Severe
      level = 'CRITICAL';
    } else if (percentage >= 30) {
      color = '#D4A574'; // Sand Gold: Moderate
      level = 'WARNING';
    }
    
    return { percentage, color, level };
  }, [progress]);

  return (
    <div 
      className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-6 p-4 rounded-none border border-[#D4A574]/15 bg-[#0B1A2E]/40 backdrop-blur-md w-36 select-none shadow-[inset_0_0_20px_rgba(43,122,120,0.05)]"
      style={{
        boxShadow: 'inset 0 0 20px rgba(43,122,120,0.05)',
      }}
    >
      {/* Sinking Island SVG */}
      <div className="relative w-full flex flex-col items-center gap-2">
        <span className="text-[8px] font-mono text-[#8B7355] tracking-widest uppercase">ELEVATION MODEL</span>
        
        <svg 
          viewBox="0 0 120 120" 
          className="w-24 h-24 transition-all duration-300"
        >
          <defs>
            {/* Water gradient */}
            <linearGradient id="island-water-grad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#2B7A78" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#1E4D5C" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#0B1A2E" stopOpacity="0.1" />
            </linearGradient>

            {/* Glowing edge for the water level */}
            <filter id="water-level-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Clipping path based on water height */}
            <clipPath id="water-submersion-clip">
              <rect x="0" y={waterY} width="120" height="120" />
            </clipPath>
          </defs>

          {/* Dry Island Contours (Sandy/Gold outline, no fill) */}
          <g opacity="0.4" stroke="#D4A574" strokeWidth="0.75" fill="none">
            <path d={islandPaths.reef} />
            <path d={islandPaths.shoreline} />
            <path d={islandPaths.lowland} />
            <path d={islandPaths.highland} />
            <path d={islandPaths.peak} />
          </g>

          {/* Submerged Island (Teal/Blue fill, clipped) */}
          <g clipPath="url(#water-submersion-clip)">
            {/* Solid water overlay */}
            <path d={islandPaths.reef} fill="url(#island-water-grad)" />
            
            {/* Submerged contour lines (highlighted teal) */}
            <g stroke="#2B7A78" strokeWidth="1" fill="none" opacity="0.9">
              <path d={islandPaths.reef} />
              <path d={islandPaths.shoreline} strokeWidth="1.2" />
              <path d={islandPaths.lowland} />
              <path d={islandPaths.highland} />
              <path d={islandPaths.peak} />
            </g>
          </g>

          {/* Glowing boundary water line */}
          {progress > 0.01 && progress < 0.99 && (
            <path
              d={wavePath}
              stroke="#2B7A78"
              strokeWidth="1.2"
              fill="none"
              filter="url(#water-level-glow)"
              className="animate-pulse"
              style={{
                stroke: threatInfo.percentage > 70 ? '#B44D36' : '#2B7A78'
              }}
            />
          )}
        </svg>

        {/* Dynamic Readout */}
        <div className="flex flex-col items-center text-center font-mono">
          <span 
            className="text-[10px] font-bold tracking-wider transition-colors duration-300"
            style={{ color: threatInfo.color }}
          >
            {threatInfo.percentage}% SUBMERGED
          </span>
          <span className="text-[7px] text-[#8B7355] tracking-widest mt-0.5">
            STATUS: {threatInfo.level}
          </span>
        </div>
      </div>

      {/* Decorative Separator */}
      <div className="w-8 h-px bg-[#D4A574]/15" />

      {/* Interactive Navigation Click Targets */}
      <nav className="w-full flex flex-col gap-3 font-mono text-[9px] relative">
        {/* Vertical line connector */}
        <div className="absolute left-[7px] top-1.5 bottom-1.5 w-px bg-[#D4A574]/10 pointer-events-none" />

        {minimapItems.map((item) => {
          const isActive = currentSection === item.target;
          const isHovered = hoveredItem === item.target;
          
          return (
            <div
              key={item.target}
              className="flex items-center gap-3.5 group cursor-pointer relative"
              onClick={() => scrollToSection(item.target)}
              onMouseEnter={() => setHoveredItem(item.target)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {/* Timeline dot */}
              <div 
                className="w-4 h-4 flex items-center justify-center z-10 shrink-0"
              >
                <div 
                  className={`w-1.5 h-1.5 transition-all duration-300 ${
                    isActive 
                      ? 'bg-[#D4A574] rotate-45 scale-125' 
                      : 'bg-[#D4A574]/20 border border-[#D4A574]/30'
                  }`}
                  style={{
                    backgroundColor: isActive 
                      ? '#D4A574' 
                      : isHovered 
                        ? '#2B7A78' 
                        : 'transparent',
                    borderColor: isActive 
                      ? '#D4A574' 
                      : isHovered 
                        ? '#2B7A78' 
                        : 'rgba(212, 165, 116, 0.3)'
                  }}
                />
              </div>

              {/* Step label / Title */}
              <div className="flex flex-col text-left transition-colors duration-200">
                <span 
                  className={`font-semibold tracking-widest text-[8px] transition-colors duration-200 ${
                    isActive ? 'text-[#E8DCC8]' : 'text-[#8B7355] group-hover:text-[#D4A574]/80'
                  }`}
                >
                  {item.act.toUpperCase()}
                </span>
                
                {/* Expand sub-label on hover or when active */}
                <span 
                  className={`text-[8px] tracking-wide transition-all duration-300 overflow-hidden text-ellipsis whitespace-nowrap max-w-[84px] ${
                    isActive 
                      ? 'text-[#2B7A78] opacity-100' 
                      : isHovered 
                        ? 'text-[#E8DCC8]/90 opacity-80' 
                        : 'text-[#E8DCC8]/30 opacity-40'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </div>
          );
        })}
      </nav>
    </div>
  );
};

export default NavigationMinimap;
