import { ChevronRight } from 'lucide-react';

const references = [
  { id: '1', text: 'Pacific Data Hub (PDH.Stat). (2023). Climate and Ocean Indicators (SST, Sea Level, Rainfall anomalies).', url: 'https://pacificdata.org/' },
  { id: '2', text: 'FAOSTAT. (2023). Food and Agriculture Organization (Staple Crop Production & Taro Yields).', url: 'https://www.fao.org/faostat/' },
  { id: '3', text: 'OECD.stat. (2023). Environmental Tax and Policy Database.', url: 'https://stats.oecd.org/' },
  { id: '4', text: 'Port Vila Call for a Just Transition to a Fossil Fuel Free Pacific. (2023).', url: 'https://fossilfueltreaty.org/port-vila-call' },
  { id: '5', text: 'Taryn Elliott. (2023). Footage of a Shore (Pexels #6051402) used in Act 6.', url: 'https://www.pexels.com/video/a-footage-of-a-shore-6051402/' },
];

const narrativeSteps = [
  { label: '01 / Prologue', target: 'prologue' },
  { label: '02 / Warming Ocean', target: 'warming' },
  { label: '03 / Sea Level Rise', target: 'sinking' },
  { label: '04 / Storms & Weather', target: 'extreme-weather' },
  { label: '05 / Crop Security', target: 'food-security' },
  { label: '06 / Climate Tax Debt', target: 'unpaid-debt' },
  { label: '07 / Synthesis Explorer', target: 'climate-debt' },
  { label: '08 / Take Action', target: 'action' },
];

export function Footer() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="w-full relative overflow-hidden bg-[#0a1420] pt-20 pb-10 border-t border-warm-sand/15">
      {/* Background Soft Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-reef-teal/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-terracotta/3 rounded-full blur-[120px] pointer-events-none translate-y-1/2" />

      <div className="px-6 md:px-12 max-w-7xl mx-auto relative z-10">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-16">
          
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-6 lg:col-span-4 flex flex-col items-start">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-shell-white tracking-wide mb-4">
              Tides of <span className="text-warm-sand">Tomorrow</span>
            </h2>
            <p className="font-body text-shell-white/70 text-sm leading-relaxed mb-6">
              A premium data journalism platform designed to convert complex ecological indicators of the Pacific region into visceral, scrollytelling narratives.
            </p>

            {/* Pacific Dataviz Challenge Official Branding */}
            <div className="mt-4 pt-4 border-t border-warm-sand/10 w-full flex items-center gap-4">
              <img 
                src="/images/logo-pdvc.png" 
                alt="Pacific Dataviz Challenge Logo" 
                className="h-10 opacity-70 hover:opacity-100 transition-opacity duration-300 object-contain"
              />
              <div className="font-body text-[9px] text-shell-white/50 tracking-wider uppercase leading-tight">
                Official Submission to the
                <br />
                Pacific Dataviz Challenge
              </div>
            </div>
          </div>

          {/* Narrative Map (Quick Links) */}
          <div className="col-span-1 md:col-span-3 lg:col-span-3">
            <h3 className="font-body text-xs tracking-widest text-reef-teal uppercase mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-reef-teal" />
              Narrative Map
            </h3>
            <ul className="flex flex-col gap-2.5">
              {narrativeSteps.map(step => (
                <li key={step.target}>
                  <button
                    onClick={() => scrollTo(step.target)}
                    className="group flex items-center gap-1.5 text-left font-body text-sm text-shell-white/70 hover:text-warm-sand transition-all duration-300"
                  >
                    <ChevronRight className="w-3 h-3 text-reef-teal/40 group-hover:text-warm-sand group-hover:translate-x-0.5 transition-all duration-200" />
                    <span>{step.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* References & Sources */}
          <div className="col-span-1 md:col-span-3 lg:col-span-5">
            <h3 className="font-body text-xs tracking-widest text-golden-hour uppercase mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-golden-hour" />
              Dataset References
            </h3>
            <ul className="flex flex-col gap-3">
              {references.map(ref => (
                <li key={ref.id} className="flex gap-2.5 items-start group">
                  <span className="font-body text-xs text-golden-hour/60 mt-0.5">[{ref.id}]</span>
                  <a href={ref.url} target="_blank" rel="noreferrer" className="font-body text-xs text-shell-white/70 leading-relaxed group-hover:text-shell-white transition-colors duration-300 underline decoration-shell-white/30 underline-offset-2">
                    {ref.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Methodology & Data Disclosures Panel */}
        <div className="w-full border border-[#D4A574]/15 bg-ocean-ink/40 p-6 md:p-8 mb-12 rounded-none text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#2B7A78]/5 to-transparent pointer-events-none" />
          <h3 className="font-display text-xs font-semibold text-shell-white mb-4 uppercase tracking-widest text-[#D4A574]">
            Methodology &amp; Data Disclosures
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[10px] text-shell-white/70 font-mono leading-relaxed">
            <div className="flex flex-col gap-4">
              <div>
                <strong className="text-shell-white block uppercase tracking-wider mb-1 text-[9px] text-[#2B7A78]">1. Temperature Proxies (Act II)</strong>
                SST anomalies utilize NOAA ERSST gridded data (1850–2025). Smaller territories lacking continuous localized meteorological stations (such as Pitcairn, Tokelau, and Wallis &amp; Futuna) are modeled using regional ocean grid averages as proxy indicators.
              </div>
              <div>
                <strong className="text-shell-white block uppercase tracking-wider mb-1 text-[9px] text-[#2B7A78]">2. Sea Level Quantization (Act III)</strong>
                To visualize disparate island groups consistently, sea level anomalies (NASA PO.DAAC) are mapped onto a standardized scale index (rounded to the nearest 100mm) representing net rises relative to the 1993 baseline.
              </div>
              <div>
                <strong className="text-shell-white block uppercase tracking-wider mb-1 text-[9px] text-[#2B7A78]">3. Rainfall &amp; Storm Correlations (Act IV)</strong>
                Rainfall anomalies are derived directly from GPCP gridded precipitation databases (1979–2025). Peak anomalies correspond with the landfall periods of notable Category 5 cyclones (Pam, Winston, Harold).
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <strong className="text-shell-white block uppercase tracking-wider mb-1 text-[9px] text-[#B44D36]">4. Agriculture &amp; Crop Padding (Act V)</strong>
                Crop yields combine direct FAOSTAT country profiles with regional averages as placeholders for territories without separate FAO reporting (e.g. Tokelau, Pitcairn). Cocoa indicators are illustrative crop-risk representations.
              </div>
              <div>
                <strong className="text-shell-white block uppercase tracking-wider mb-1 text-[9px] text-[#B44D36]">5. Tax &amp; Economic Models (Act VI)</strong>
                Environmental tax revenues represent public adaptation finances (such as Fiji ECAL). High-contrast scale weights utilize regional average proxies for nations not individually listed in the OECD environmental tax database.
              </div>
              <div>
                <strong className="text-shell-white block uppercase tracking-wider mb-1 text-[9px] text-[#D4A574]">6. Projections &amp; Composite Voices</strong>
                Projections are simplified policy sensitivity models calibrated against IPCC AR6 SSP1-1.9 and SSP5-8.5 tropical pathways. Qualitative quotes represent composite narrative testimonies from local regional reports.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-warm-sand/15">
          
          {/* Copyright */}
          <p className="font-body text-[10px] text-shell-white/40 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Pacific Dataviz Challenge. Open data framework.
          </p>

          <p className="font-body text-[10px] text-shell-white/30 mt-4 md:mt-0 uppercase tracking-widest">
            Visualizing Climate Impact
          </p>

        </div>
      </div>
    </footer>
  );
}
