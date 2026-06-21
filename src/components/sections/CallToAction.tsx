import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ExternalLink, Database, AlertCircle, Globe, PenTool, TrendingDown, ChevronDown } from 'lucide-react';
import * as d3 from 'd3';

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

const countryData = [
  { id: 'USA', name: 'United States', share: 24.5, debt: 2500 },
  { id: 'CHN', name: 'China', share: 14.3, debt: 1400 },
  { id: 'EU', name: 'European Union', share: 17.5, debt: 1700 },
  { id: 'RUS', name: 'Russia', share: 6.8, debt: 680 },
  { id: 'JPN', name: 'Japan', share: 4.0, debt: 400 },
  { id: 'UK', name: 'United Kingdom', share: 4.6, debt: 460 },
  { id: 'IND', name: 'India', share: 3.2, debt: 320 },
  { id: 'AUS', name: 'Australia', share: 1.2, debt: 120 },
  { id: 'CAN', name: 'Canada', share: 2.0, debt: 200 },
  { id: 'IDN', name: 'Indonesia', share: 0.5, debt: 50 },
  { id: 'OTHER', name: 'Other / Global Average', share: 1.0, debt: 100 }
];

// Circular HUD Gauge Component
const Gauge = ({ value, max, label, unit, color }: { value: number, max: number, label: string, unit: string, color: string }) => {
  const radius = 33;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(1, Math.max(0, value / max));
  const strokeDashoffset = circumference - (pct * circumference);
  
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative w-20 h-20 flex items-center justify-center">
        {/* Background Track */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="transparent"
            stroke="rgba(232, 220, 200, 0.08)"
            strokeWidth="4"
          />
          {/* Filled Value */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth="4.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
            style={{ filter: `drop-shadow(0 0 3px ${color}80)` }}
          />
        </svg>
        {/* Center Text */}
        <div className="absolute flex flex-col items-center">
          <span className="text-sm font-bold text-shell-white leading-none font-body">
            {value.toFixed(1)}
          </span>
          <span className="text-[8px] text-shell-white/60 mt-0.5 uppercase font-body">{unit}</span>
        </div>
      </div>
      <span className="text-[9px] text-shell-white/70 font-body mt-2 tracking-wide uppercase">{label}</span>
    </div>
  );
};

interface ProjectionPoint {
  x: number;
  y: number;
  temp: number;
  year: number;
}

// Fully Responsive Mini D3 Projection Line Chart Component
const MiniChart = ({ pledge }: { pledge: number }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 340, height: 110 });

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        if (width > 0) {
          setDimensions({ width, height: 115 });
        }
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const width = dimensions.width;
  const height = dimensions.height;
  const padding = { top: 12, right: 15, bottom: 20, left: 32 };
  const graphW = width - padding.left - padding.right;
  const graphH = height - padding.top - padding.bottom;
  
  // Calculate points from 2020 to 2050
  const points: ProjectionPoint[] = [2020, 2025, 2030, 2035, 2040, 2045, 2050].map(yVal => {
    const t = (yVal - 2020) / 30;
    const p = pledge / 100;
    const tempVal = 0.95 + (1.65 - 1.3 * p) * t - (0.25 * p) * t * t;
    const px = padding.left + t * graphW;
    const py = padding.top + (1 - (tempVal - 0.5) / 2.3) * graphH;
    return { x: px, y: py, temp: tempVal, year: yVal };
  });

  const lineGen = d3.line<ProjectionPoint>()
    .x(d => d.x)
    .y(d => d.y)
    .curve(d3.curveMonotoneX);

  const pathD = lineGen(points) || "";

  // Helper arrays for gridlines & labels
  const tempTicks = [1.0, 1.5, 2.0, 2.5];
  const yearTicks = [2020, 2030, 2040, 2050];
  
  return (
    <div ref={containerRef} className="flex flex-col w-full bg-[#0B1A2E]/50 border border-[#D4A574]/15 rounded-xl p-4 transition-all duration-500">
      <span className="text-[8px] text-[#8B7355] font-mono mb-2 uppercase tracking-wide font-semibold">
        Temperature Trajectory (2020–2050)
      </span>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
          <filter id="mini-chart-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Horizontal Grid lines */}
        {tempTicks.map(t => {
          const py = padding.top + (1 - (t - 0.5) / 2.3) * graphH;
          return (
            <line
              key={t}
              x1={padding.left}
              x2={width - padding.right}
              y1={py}
              y2={py}
              stroke="rgba(232, 220, 200, 0.08)"
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
          );
        })}
        {/* Vertical Grid lines */}
        {yearTicks.map(yr => {
          const px = padding.left + ((yr - 2020) / 30) * graphW;
          return (
            <line
              key={yr}
              x1={px}
              x2={px}
              y1={padding.top}
              y2={height - padding.bottom}
              stroke="rgba(232, 220, 200, 0.08)"
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
          );
        })}

        {/* Y Axis Labels */}
        {tempTicks.map(t => {
          const py = padding.top + (1 - (t - 0.5) / 2.3) * graphH;
          return (
            <text
              key={t}
              x={padding.left - 6}
              y={py + 3}
              fill="rgba(232, 220, 200, 0.5)"
              fontSize="7px"
              fontFamily="Inter, sans-serif"
              textAnchor="end"
            >
              {t.toFixed(1)}°
            </text>
          );
        })}
        {/* X Axis Labels */}
        {yearTicks.map(yr => {
          const px = padding.left + ((yr - 2020) / 30) * graphW;
          return (
            <text
              key={yr}
              x={px}
              y={height - 4}
              fill="rgba(232, 220, 200, 0.5)"
              fontSize="7px"
              fontFamily="Inter, sans-serif"
              textAnchor="middle"
            >
              {yr}
            </text>
          );
        })}

        {/* Curve Path */}
        <path
          d={pathD}
          fill="none"
          stroke={getPledgeColor(pledge)}
          strokeWidth="2.0"
          filter="url(#mini-chart-glow)"
          className="transition-all duration-500 ease-out"
        />

        {/* Circle Markers */}
        {points.map(pt => (
          <circle
            key={pt.year}
            cx={pt.x}
            cy={pt.y}
            r="2.5"
            fill="#0B1A2E"
            stroke={getPledgeColor(pledge)}
            strokeWidth="1.2"
            className="transition-all duration-500 ease-out"
          />
        ))}
      </svg>
    </div>
  );
};

export default function CallToAction({ className }: CallToActionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [pledge, setPledge] = useState(15); // Default 15% reduction pledge
  const [country, setCountry] = useState(countryData[0]);
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

  const datasets = [
    { label: 'NOAA ERSST: Sea Surface Temperature', url: 'https://climatedataguide.ucar.edu/climate-data/global-surface-temperature-data-sets-overview' },
    { label: 'NASA PO.DAAC: Sea Level Anomalies', url: 'https://sealevel.nasa.gov/data/dataset/?id=SLR_anom_OSTM' },
    { label: 'NOAA PSL: GPCP Precipitation Anomalies', url: 'https://psl.noaa.gov/data/gridded/data.gpcp.html' },
    { label: 'FAOSTAT: Agricultural Production', url: 'https://www.fao.org/faostat/en/#data/QCL' },
    { label: 'OECD.stat: Environmental Tax Revenues', url: 'https://stats.oecd.org/Index.aspx?DataSetCode=ENV_TAX' },
  ];

  // Dynamic projection calculations for gauges
  const temp2050 = 2.6 - 1.55 * (pledge / 100);
  const sea2050 = 290 - 150 * (pledge / 100);

  return (
    <section
      id="action"
      ref={sectionRef}
      className={`relative min-h-screen bg-deep-ocean py-24 md:py-36 ${className || ''}`}
    >
      <style>{`
        @keyframes pulsate-glow {
          0% {
            box-shadow: 0 0 15px rgba(180, 77, 54, 0.4), 0 0 30px rgba(180, 77, 54, 0.2);
          }
          100% {
            box-shadow: 0 0 35px rgba(180, 77, 54, 0.85), 0 0 70px rgba(180, 77, 54, 0.45);
          }
        }
      `}</style>

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
            className="max-w-6xl mx-auto border p-8 md:p-12 mb-16 text-left transition-all duration-500 grid grid-cols-1 lg:grid-cols-12 gap-10 relative overflow-hidden rounded-xl bg-[#0B1A2E]/40 backdrop-blur-xl" 
            style={{ 
              borderColor: `${getPledgeColor(pledge)}25`,
              boxShadow: `0 25px 60px rgba(0,0,0,0.5), 0 0 50px ${getPledgeColor(pledge)}15`,
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
                  <label className="text-[9px] font-mono text-warm-sand uppercase tracking-widest font-semibold">Select Your Nation</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full text-left bg-[#0F2237]/65 border border-[#D4A574]/25 text-white font-body p-4 outline-none hover:border-reef-teal transition-all flex items-center justify-between shadow-[0_0_15px_rgba(43,122,120,0.03)] hover:shadow-[0_0_20px_rgba(43,122,120,0.15)] rounded-lg backdrop-blur-md relative overflow-hidden group focus:outline-none"
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
                        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-[#0B1A2E]/95 backdrop-blur-md border border-[#D4A574]/30 max-h-72 overflow-y-auto rounded-lg shadow-[0_15px_45px_rgba(0,0,0,0.9)] py-2" style={{ scrollbarWidth: 'thin' }}>
                           {countryData.map((c: typeof countryData[number]) => (
                            <button
                              key={c.id}
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
                  className="bg-[#0B1A2E]/60 border p-6 rounded-lg mb-8 shadow-[0_0_20px_rgba(180,77,54,0.08)] relative overflow-hidden transition-all duration-500"
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
                </div>
                
                {/* Willpower Commitment Custom Slider */}
                <div className="mb-4">
                  <div className="flex justify-between items-baseline mb-3">
                    <span className="text-[9px] font-mono text-[#8B7355] uppercase tracking-wider font-semibold">Commitment Willpower</span>
                    <span 
                      className="text-base font-bold font-display tracking-widest px-3 py-1 rounded-md transition-all duration-300"
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
              className="lg:col-span-6 flex flex-col justify-between gap-8 border p-6 md:p-8 rounded-lg relative overflow-hidden transition-all duration-500 bg-[#0B1A2E]/25 backdrop-blur-md"
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
              </div>

              {/* Narrative outcome block */}
              <div 
                className="p-4.5 border rounded-lg transition-all duration-500 bg-[#0B1A2E]/55" 
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
            rel="noopener noreferrer"
            className="inline-flex items-center gap-4 px-10 py-5 bg-[#B44D36] text-white font-bold text-lg hover:bg-[#B44D36]/90 transition-all duration-300 font-display tracking-widest uppercase hover:scale-[1.03] active:scale-[0.98] rounded-lg border border-white/10"
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
          <div className="action-card glass-panel rounded-lg p-6 text-center border border-reef-teal/20 hover:border-reef-teal/50 transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-reef-teal/10 flex items-center justify-center mx-auto mb-4">
              <Database className="w-7 h-7 text-reef-teal" />
            </div>
            <h3 className="font-display text-lg font-semibold text-shell-white mb-2">
              Official Datasets Used
            </h3>
            <ul className="text-xs text-shell-white/70 space-y-2 text-left mt-4">
              {datasets.map((ds, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-reef-teal mt-1.5 shrink-0" />
                  <a href={ds.url} target="_blank" rel="noreferrer" className="hover:text-reef-teal transition-colors underline decoration-reef-teal/30 underline-offset-2">
                    {ds.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="action-card glass-panel rounded-lg p-6 text-center border border-golden-hour/20 hover:border-golden-hour/50 transition-all duration-300">
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

          <div className="action-card glass-panel rounded-lg p-6 text-center border border-terracotta/20 hover:border-terracotta/50 transition-all duration-300">
            <div className="w-14 h-14 rounded-full bg-terracotta/10 flex items-center justify-center mx-auto mb-4">
              <PenTool className="w-7 h-7 text-terracotta" />
            </div>
            <h3 className="font-display text-lg font-semibold text-shell-white mb-2">
              Policy & Advocacy
            </h3>
            <p className="text-xs text-shell-white/70 leading-relaxed text-left mt-4 mb-6">
              The time for "awareness" has passed. Support indigenous Pacific climate initiatives and amplify their demands for loss and damage compensation on the global stage.
            </p>
            <div className="flex flex-col gap-3">
              <a href="https://www.pican.org/" target="_blank" rel="noreferrer" className="w-full text-xs font-body py-2.5 px-4 rounded-md border border-terracotta/40 text-shell-white hover:bg-terracotta/10 transition-colors flex items-center justify-between">
                <span>Pacific Climate Action Network</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a href="https://fossilfueltreaty.org/" target="_blank" rel="noreferrer" className="w-full text-xs font-body py-2.5 px-4 rounded-md border border-terracotta/40 text-shell-white hover:bg-terracotta/10 transition-colors flex items-center justify-between">
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
