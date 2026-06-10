import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ExternalLink, Database, AlertCircle, Globe, PenTool, TrendingDown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface CallToActionProps {
  className?: string;
}

export default function CallToAction({ className }: CallToActionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [pledge, setPledge] = useState(15); // 15% reduction pledge

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
            start: 'top 60%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      const cards = cardsRef.current?.querySelectorAll('.action-card');
      if (cards) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 40, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const datasets = [
    'Mean Sea Surface Temperature Anomalies (SST)',
    'Global & Regional Sea Level Anomalies',
    'Precipitation Anomalies (Droughts/Deluges)',
    'Agricultural Production (Crop Yields)',
    'Environmental Tax Revenues (% GDP)',
  ];

  return (
    <section
      id="action"
      ref={sectionRef}
      className={`relative min-h-screen bg-[#0B1D2C] py-20 md:py-32 ${className || ''}`}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B1D2C] via-[#0F2940] to-[#0B1D2C]" />

      <div className="relative z-10 section-padding max-w-6xl mx-auto">
        <div ref={contentRef} className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-[#e63946]" />
            <span className="text-xs font-mono tracking-widest uppercase text-[#e63946]">
              Final Directive
            </span>
          </div>

          <h2 className="font-display text-4xl md:text-6xl font-bold text-[#e6f1ff] mb-6">
            The <span className="text-[#00d4aa]">Will to Act</span>
          </h2>

          <p className="font-body text-base md:text-xl text-[#a8b2d1] mb-8 max-w-2xl mx-auto leading-relaxed">
            The data is clear. We are paying the price for a crisis we didn't create. But the future isn't set in stone. It depends entirely on global political willpower. Adjust the slider below to see what the future holds for our islands.
          </p>

          <div 
            className="max-w-xl mx-auto backdrop-blur-md border rounded-2xl p-6 md:p-8 mb-8 text-left transition-colors duration-500" 
            style={{ 
              backgroundColor: `rgba(10, 21, 38, 0.6)`,
              borderColor: `rgba(${230 - pledge*2}, ${57 + pledge*1.5}, ${70 + pledge}, 0.4)` 
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <TrendingDown 
                className="w-6 h-6 transition-colors duration-500" 
                style={{ color: `rgb(${230 - pledge*2}, ${57 + pledge*1.5}, ${70 + pledge})` }}
              /> 
              <h3 className="font-display text-2xl text-white">Global Political Willpower</h3>
            </div>
            <p className="text-white/70 text-sm mb-8 font-body">Slide to see how global action changes our future.</p>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm font-mono text-[#5c6e8a] mb-2">
                <span>0%</span>
                <span className="font-bold" style={{ color: `rgb(${230 - pledge*2}, ${57 + pledge*1.5}, ${70 + pledge})` }}>{pledge}% Commitment</span>
                <span>100% (Net Zero)</span>
              </div>
              <input 
                type="range" 
                min="0" max="100" 
                value={pledge}
                onChange={(e) => setPledge(parseInt(e.target.value))}
                className="w-full h-2 bg-[#112240] rounded-lg appearance-none cursor-pointer"
                style={{ accentColor: `rgb(${230 - pledge*2}, ${57 + pledge*1.5}, ${70 + pledge})` }}
              />
            </div>
            
            <div 
              className="mt-6 p-4 border-l-2 rounded-r-md transition-all duration-500" 
              style={{ 
                backgroundColor: `rgba(${230 - pledge*2}, ${57 + pledge*1.5}, ${70 + pledge}, 0.1)`, 
                borderColor: `rgb(${230 - pledge*2}, ${57 + pledge*1.5}, ${70 + pledge})` 
              }}
            >
              <div className="text-sm text-[#e6f1ff] font-body leading-relaxed">
                {pledge < 30 && "Business as usual. The trajectory remains catastrophic. At this level of inaction, Pacific adaptation costs will exceed total GDP, and mass forced migration is mathematically inevitable."}
                {pledge >= 30 && pledge < 75 && "Moderate transition. While this delays the most extreme impacts, it still locks the Pacific into billions in necessary seawall defenses and continuous agricultural failure. Survival remains precarious."}
                {pledge >= 75 && "Aggressive decarbonization. This is the only scenario where the data begins to stabilize. The warming slows, sea level anomalies plateau, and sovereign land is preserved."}
              </div>
            </div>
          </div>

          <a
            href="https://fossilfueltreaty.org/port-vila-call"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#e63946] rounded-xl text-white font-bold text-lg hover:bg-[#c1121f] transition-all duration-300 shadow-lg shadow-[#e63946]/20 font-display tracking-wide"
          >
            <PenTool className="w-5 h-5" />
            Sign the Port Vila Call for a Just Transition
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Cards */}
        <div ref={cardsRef} className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="action-card glass-panel rounded-2xl p-6 text-center border border-[#2DB5C7]/20 hover:border-[#2DB5C7]/50 transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-[#2DB5C7]/10 flex items-center justify-center mx-auto mb-4">
              <Database className="w-7 h-7 text-[#2DB5C7]" />
            </div>
            <h3 className="font-display text-lg font-semibold text-[#F5F2EB] mb-2">
              Official Datasets Used
            </h3>
            <ul className="text-sm text-[#F5F2EB]/60 space-y-1.5 text-left mt-4">
              {datasets.map((ds, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2DB5C7] mt-1.5 shrink-0" />
                  {ds}
                </li>
              ))}
            </ul>
          </div>

          <div className="action-card glass-panel rounded-2xl p-6 text-center border border-[#F2D07A]/20 hover:border-[#F2D07A]/50 transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-[#F2D07A]/10 flex items-center justify-center mx-auto mb-4">
              <Globe className="w-7 h-7 text-[#F2D07A]" />
            </div>
            <h3 className="font-display text-lg font-semibold text-[#F5F2EB] mb-2">
              Why This Matters
            </h3>
            <p className="text-sm text-[#F5F2EB]/60 leading-relaxed text-left mt-4">
              The Pacific Islands contribute less than 0.03% of global greenhouse gas emissions, yet
              face existential threats from climate change. Sea level rise, ocean warming, and
              intensifying tropical cyclones are not abstract future scenarios — they are the daily
              reality for 2.3 million Pacific Islanders.
            </p>
          </div>

          <div className="action-card glass-panel rounded-2xl p-6 text-center border border-[#e63946]/20 hover:border-[#e63946]/50 transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-[#e63946]/10 flex items-center justify-center mx-auto mb-4">
              <PenTool className="w-7 h-7 text-[#e63946]" />
            </div>
            <h3 className="font-display text-lg font-semibold text-[#F5F2EB] mb-2">
              Policy & Advocacy
            </h3>
            <p className="text-sm text-[#F5F2EB]/60 leading-relaxed text-left mt-4 mb-6">
              The time for "awareness" has passed. Support indigenous Pacific climate initiatives and amplify their demands for loss and damage compensation on the global stage.
            </p>
            <div className="flex flex-col gap-3">
              <a href="https://www.pican.org/" target="_blank" rel="noreferrer" className="w-full text-xs font-mono py-2 px-4 rounded border border-[#e63946]/40 text-[#F5F2EB] hover:bg-[#e63946]/20 transition-colors flex items-center justify-between">
                <span>Pacific Climate Action Network</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a href="https://fossilfueltreaty.org/" target="_blank" rel="noreferrer" className="w-full text-xs font-mono py-2 px-4 rounded border border-[#e63946]/40 text-[#F5F2EB] hover:bg-[#e63946]/20 transition-colors flex items-center justify-between">
                <span>Fossil Fuel Non-Proliferation Treaty</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
