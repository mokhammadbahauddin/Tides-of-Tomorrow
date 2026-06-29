import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ExternalLink, Database, AlertCircle, Globe, PenTool, TrendingDown, ChevronDown } from 'lucide-react';
import { CTA_COUNTRY_DATA, CTA_DATASETS, calcTemp2050, calcSea2050 } from './cta/ctaConfig';
import Gauge from './cta/Gauge';
import MiniChart from './cta/MiniChart';

gsap.registerPlugin(ScrollTrigger);

interface CallToActionProps {
  className?: string;
}

// Color utility for gauges & curves based on willpower pledge level
const getPledgeColor = (p: number) => {
  if (p >= 75) return '#2B7A78'; // Safe reef teal
  if (p >= 30) return '#D4A574'; // Warning warm sand
  return '#B44D36'; // Critical terracotta
};

export default function CallToAction({ className }: CallToActionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [pledge, setPledge] = useState(15); // Default 15% reduction pledge
  const [country, setCountry] = useState(CTA_COUNTRY_DATA[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 40 },
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

      const cards = cardsRef.current?.querySelectorAll('.action-card');
      if (cards) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 30, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Dynamic projection calculations for gauges
  const temp2050 = calcTemp2050(pledge);
  const sea2050 = calcSea2050(pledge);

  return (
    <section
      id="action"
      ref={sectionRef}
      className={`relative min-h-screen bg-deep-ocean py-24 md:py-36 ${className || ''}`}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-deep-ocean via-ocean-ink to-deep-ocean" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12">
        <div ref={contentRef} className="text-center mb-20">
          <div className="flex items-center justify-center gap-3 mb-4">
            <AlertCircle className="w-4 h-4 text-terracotta" />
            <span className="text-[10px] font-mono tracking-widest uppercase text-terracotta font-semibold">
              Final Directive
            </span>
          </div>

          <h2 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold text-shell-white mb-6">
            The <span className="text-reef-teal">Will to Act</span>
          </h2>

          <p className="font-body text-base md:text-xl text-shell-white/80 mb-16 max-w-3xl mx-auto leading-relaxed">
            The data is clear. We are paying the price for a crisis we didn't create. But the future isn't set in stone. It depends entirely on global political willpower. Adjust the slider below to witness how global commitments directly rescue or submerge our sovereign land.
          </p>

          {/* Main Simulation Panel Container (Overhauled Dashboard Grid) */}
          <div 
            className="max-w-6xl mx-auto glass-panel border p-8 md:p-12 mb-16 text-left transition-all duration-500 grid grid-cols-1 lg:grid-cols-12 gap-10 relative overflow-hidden rounded-none" 
            style={{ 
              borderColor: `${getPledgeColor(pledge)}25`,
              boxShadow: 'inset 0 0 40px rgba(11, 26, 46, 0.5)',
            }}
          >
            {/* Left Panel: Sliders & Actions (6/12 cols) */}
            <div className="lg:col-span-6 flex flex-col justify-between gap-8">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <TrendingDown 
                    className="w-5 h-5 transition-colors duration-500" 
                    style={{ color: getPledgeColor(pledge) }}
                  /> 
                  <h3 className="font-display text-xl font-bold text-white tracking-wide">
                    Acknowledge Your Debt
                  </h3>
                </div>
                
                {/* Select Nation custom dropdown with elevated glassmorphism */}
                <div className="flex flex-col gap-2.5 mb-6 relative">
                  <label id="cta-nation-label" className="text-[9px] font-mono text-warm-sand uppercase tracking-widest font-semibold">Select Your Nation</label>
                  <div className="relative" onKeyDown={(e) => { if (e.key === 'Escape') setIsDropdownOpen(false); }}>
                    <button
                      type="button"
                      aria-haspopup="listbox"
                      aria-expanded={isDropdownOpen}
                      aria-labelledby="cta-nation-label"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full text-left bg-[#0F2237]/65 border border-[#D4A574]/25 text-white font-body p-4 outline-none hover:border-reef-teal transition-all flex items-center justify-between rounded-none backdrop-blur-md relative overflow-hidden group focus:outline-none"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-reef-teal/5 to-transparent pointer-events-none" />
                      <span className="relative z-10 text-sm font-semibold text-white">{country.name}</span>
                      <ChevronDown className={`w-4 h-4 text-reef-teal transition-transform duration-300 relative z-10 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isDropdownOpen && (
                      <>
                        <div 
                           className="fixed inset-0 z-40"
                          onClick={() => setIsDropdownOpen(false)}
                        />
                        <div 
                          role="listbox"
                          aria-labelledby="cta-nation-label"
                          className="absolute z-50 top-full left-0 right-0 mt-2 bg-[#0B1A2E]/95 backdrop-blur-md border border-[#D4A574]/15 max-h-72 overflow-y-auto rounded-none py-2" 
                          style={{ scrollbarWidth: 'thin' }}
                        >
                           {CTA_COUNTRY_DATA.map((c) => (
                            <button
                              key={c.id}
                              role="option"
                              aria-selected={country.id === c.id}
                              onClick={() => {
                                setCountry(c);
                                setIsDropdownOpen(false);
                              }}
                              className="w-full text-left px-5 py-3.5 text-sm font-body hover:bg-[#1E4D5C] hover:text-white transition-colors duration-200 group/item relative overflow-hidden focus:outline-none"
                              style={{
                                color: country.id === c.id ? '#FFFFFF' : '#E8DCC8',
                                background: country.id === c.id ? 'rgba(43, 122, 120, 0.35)' : 'transparent',
                                borderLeft: country.id === c.id ? '3px solid #2B7A78' : '3px solid transparent',
                              }}
                            >
                              <div className="absolute inset-0 bg-reef-teal/10 translate-x-[-100%] group-hover/item:translate-x-0 transition-transform duration-300 pointer-events-none" />
                              <span className="relative z-10 font-bold">{c.name}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Country Debt Invoice slip - Premium Slip Card */}
                <div 
                  className="glass-panel border p-6 rounded-none mb-8 relative overflow-hidden transition-all duration-500"
                  style={{
                    borderColor: `${getPledgeColor(pledge)}25`,
                    boxShadow: `0 15px 35px rgba(0,0,0,0.3), 0 0 25px ${getPledgeColor(pledge)}05`,
                  }}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                  <h4 className="text-terracotta font-mono text-[9px] uppercase tracking-widest font-semibold mb-2"
                    style={{ color: getPledgeColor(pledge) }}
                  >
                    Climate Debt Invoice
                  </h4>
                  <div className="font-display text-4xl sm:text-5xl font-bold text-shell-white mb-2 tracking-wide">
                    ${country.debt} <span className="text-base font-sans font-medium text-shell-white/50">Billion</span>
                  </div>
                  <p className="text-xs text-[#E8DCC8]/75 font-body leading-relaxed border-t border-[#D4A574]/10 pt-4 mt-3">
                    Estimated loss &amp; damage compensation owed to the 22 Pacific Island Nations based on <strong>{country.name}'s {country.share}%</strong> share of historical global emissions. 
                  </p>
                  <p className="text-[9px] text-[#E8DCC8]/50 font-mono mt-3 leading-relaxed">
                    *Methodology Note: Debt is an illustrative allocation of a modeled $10 Trillion global climate loss-and-damage burden, distributed proportionally by each nation's cumulative CO₂ emissions (1850–2022) sourced from CAIT/WRI.
                  </p>
                </div>
                
                {/* Willpower Commitment Custom Slider */}
                <div className="mb-4">
                  <div className="flex justify-between items-baseline mb-3">
                    <span className="text-[9px] font-mono text-[#8B7355] uppercase tracking-wider font-semibold">Commitment Willpower</span>
                    <span 
                      className="text-base font-bold font-display tracking-widest px-3 py-1 rounded-none transition-all duration-300"
                      style={{ 
                        color: getPledgeColor(pledge),
                        backgroundColor: `${getPledgeColor(pledge)}12`,
                        border: `1px solid ${getPledgeColor(pledge)}25`
                      }}
                    >
                      {pledge}%
                    </span>
                  </div>

                  <div className="relative mt-2">
                    {/* Track Background */}
                    <div className="absolute top-1/2 left-0 right-0 h-2 bg-[#0B1A2E] rounded-full transform -translate-y-1/2 border border-[#D4A574]/10 pointer-events-none" />
                    
                    {/* Active Track Fill */}
                    <div 
                      className="absolute top-1/2 left-0 h-2 rounded-full transform -translate-y-1/2 pointer-events-none transition-all duration-300"
                      style={{
                        width: `${pledge}%`,
                        background: `linear-gradient(90deg, #B44D36, #D4A574 50%, #2B7A78 100%)`
                      }}
                    />

                    {/* Hidden Range Input for scrubbing */}
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={pledge}
                      onChange={(e) => setPledge(parseInt(e.target.value))}
                      aria-label="Climate pledge percentage reduction"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={pledge}
                      aria-valuetext={`${pledge} percent reduction`}
                      className="w-full h-8 opacity-0 cursor-pointer relative z-10"
                    />

                    {/* Custom slider thumb */}
                    <div 
                      className="absolute top-1/2 w-6 h-6 rounded-full bg-white transform -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-all duration-300"
                      style={{
                        left: `${pledge}%`,
                        border: `2px solid ${getPledgeColor(pledge)}`,
                        boxShadow: `0 0 15px ${getPledgeColor(pledge)}`
                      }}
                    />
                  </div>

                  {/* Milestones buttons and labels */}
                  <div className="flex justify-between px-1 mt-3">
                    {[
                      { val: 0, label: 'Inaction' },
                      { val: 30, label: 'Transition' },
                      { val: 75, label: 'Ambitious' },
                      { val: 100, label: 'Net Zero' }
                    ].map((ms, idx) => {
                      const isNear = Math.abs(pledge - ms.val) <= 15;
                      return (
                        <button
                          key={ms.val}
                          onClick={() => setPledge(ms.val)}
                          aria-pressed={pledge === ms.val}
                          aria-label={`Set reduction commitment to ${ms.label} (${ms.val} percent)`}
                          className="flex flex-col items-center group focus:outline-none"
                          style={{
                            width: '50px',
                            marginLeft: idx === 0 ? '-12px' : '0',
                            marginRight: idx === 3 ? '-12px' : '0',
                          }}
                        >
                          <div 
                            className={`w-2 h-2 rounded-full mb-1.5 transition-all duration-300 ${
                              isNear 
                                ? 'scale-125 font-bold' 
                                : 'bg-[#8B7355]/40 group-hover:bg-[#8B7355]'
                            }`}
                            style={{
                              backgroundColor: isNear ? getPledgeColor(pledge) : undefined
                            }}
                          />
                          <span 
                            className={`text-[9px] font-mono whitespace-nowrap transition-all duration-300 ${
                              isNear 
                                ? 'scale-105 font-semibold' 
                                : 'text-[#8B7355]/50 group-hover:text-[#8B7355]'
                            }`}
                            style={{
                              color: isNear ? getPledgeColor(pledge) : undefined
                            }}
                          >
                            {ms.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel: HUD Simulator Gauges and Curves (6/12 cols) */}
            <div 
              className="lg:col-span-6 flex flex-col justify-between gap-8 border p-6 md:p-8 rounded-none relative overflow-hidden transition-all duration-500 glass-panel"
              style={{
                borderColor: 'rgba(212, 165, 116, 0.15)',
              }}
            >
              {/* Corner Ambient Light */}
              <div 
                className="absolute -top-12 -right-12 w-28 h-28 blur-3xl pointer-events-none opacity-20 transition-all duration-500"
                style={{ backgroundColor: getPledgeColor(pledge) }}
              />

              <div className="flex flex-col gap-6 w-full">
                {/* Gauges row */}
                <div className="grid grid-cols-2 gap-6 py-1">
                  <Gauge 
                    value={temp2050} 
                    max={3.0} 
                    label="SST Anomaly (2050)" 
                    unit="°C Anom" 
                    color={getPledgeColor(pledge)} 
                  />
                  <Gauge 
                    value={sea2050} 
                    max={300} 
                    label="Sea Level Rise (2050)" 
                    unit="mm Rise" 
                    color={getPledgeColor(pledge)} 
                  />
                </div>

                {/* Responsive Curve chart */}
                <MiniChart pledge={pledge} />
                <p className="text-[9px] text-[#E8DCC8]/40 font-mono mt-1 leading-relaxed text-center">
                  *Projections are simplified illustrative models calibrated to match the broad SSP1-1.9 (Net Zero) through SSP5-8.5 (Inaction) trajectories from IPCC AR6.
                </p>
              </div>

              {/* Narrative outcome block */}
              <div 
                className="p-4.5 border rounded-none transition-all duration-500 glass-panel" 
                style={{ 
                  backgroundColor: `${getPledgeColor(pledge)}04`, 
                  borderColor: `${getPledgeColor(pledge)}20`
                }}
              >
                <div className="text-xs text-shell-white/85 font-body leading-relaxed transition-all duration-500">
                  {pledge < 30 && "Business as usual. The trajectory remains catastrophic. At this level of inaction, Pacific adaptation costs will exceed total GDP, and mass forced migration is mathematically inevitable."}
                  {pledge >= 30 && pledge < 75 && "Moderate transition. While this delays the most extreme impacts, it still locks the Pacific into billions in necessary seawall defenses and continuous agricultural failure."}
                  {pledge >= 75 && "Aggressive decarbonization. This is the only scenario where the data begins to stabilize. The warming slows, sea level anomalies plateau, and sovereign land is preserved."}
                </div>
              </div>
            </div>
          </div>

          {/* Massive pulsing Port Vila Action Button */}
          <a
            href="https://fossilfueltreaty.org/port-vila-call"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-4 px-10 py-5 bg-[#B44D36] text-white font-bold text-lg hover:bg-[#B44D36]/90 transition-all duration-300 font-display tracking-widest uppercase hover:scale-[1.03] active:scale-[0.98] rounded-none border border-white/10"
            style={{
              animation: 'pulsate-glow 2.5s infinite alternate'
            }}
          >
            <PenTool className="w-5 h-5 animate-pulse" />
            Sign the Port Vila Call for a Just Transition
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Cards section with elevated layout */}
        <div ref={cardsRef} className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="action-card glass-panel rounded-none p-6 text-center border border-reef-teal/20 hover:border-reef-teal/50 transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-reef-teal/10 flex items-center justify-center mx-auto mb-4">
              <Database className="w-7 h-7 text-reef-teal" />
            </div>
            <h3 className="font-display text-lg font-semibold text-shell-white mb-2">
              Official Datasets Used
            </h3>
            <ul className="text-xs text-shell-white/70 space-y-2 text-left mt-4">
              {CTA_DATASETS.map((ds, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-reef-teal mt-1.5 shrink-0" />
                  <a href={ds.url} target="_blank" rel="noreferrer" className="hover:text-reef-teal transition-colors underline decoration-reef-teal/30 underline-offset-2">
                    {ds.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="action-card glass-panel rounded-none p-6 text-center border border-golden-hour/20 hover:border-golden-hour/50 transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-golden-hour/10 flex items-center justify-center mx-auto mb-4">
              <Globe className="w-7 h-7 text-golden-hour" />
            </div>
            <h3 className="font-display text-lg font-semibold text-shell-white mb-2">
              Why This Matters
            </h3>
            <p className="text-xs text-shell-white/70 leading-relaxed text-left mt-4">
              The Pacific Islands contribute less than 0.03% of global greenhouse gas emissions, yet
              face existential threats from climate change. Sea level rise, ocean warming, and
              intensifying tropical cyclones are not abstract future scenarios — they are the daily
              reality for 2.3 million Pacific Islanders.
            </p>
          </div>

          <div className="action-card glass-panel rounded-none p-6 text-center border border-terracotta/20 hover:border-terracotta/50 transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-terracotta/10 flex items-center justify-center mx-auto mb-4">
              <PenTool className="w-7 h-7 text-terracotta" />
            </div>
            <h3 className="font-display text-lg font-semibold text-shell-white mb-2">
              Policy &amp; Advocacy
            </h3>
            <p className="text-xs text-shell-white/70 leading-relaxed text-left mt-4 mb-6">
              The time for "awareness" has passed. Support indigenous Pacific climate initiatives and amplify their demands for loss and damage compensation on the global stage.
            </p>
            <div className="flex flex-col gap-3">
              <a href="https://www.pican.org/" target="_blank" rel="noreferrer" className="w-full text-xs font-body py-2.5 px-4 rounded-none border border-terracotta/40 text-shell-white hover:bg-terracotta/10 transition-colors flex items-center justify-between">
                <span>Pacific Climate Action Network</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a href="https://fossilfueltreaty.org/" target="_blank" rel="noreferrer" className="w-full text-xs font-body py-2.5 px-4 rounded-none border border-terracotta/40 text-shell-white hover:bg-terracotta/10 transition-colors flex items-center justify-between">
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
