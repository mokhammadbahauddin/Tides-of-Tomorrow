import { Mail } from 'lucide-react';

const GithubIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.24c3-.34 6-1.53 6-6.76a5.2 5.2 0 0 0-1.5-3.78 4.8 4.8 0 0 0-.15-3.8s-1.2-.38-3.9 1.45a13.5 13.5 0 0 0-7 0c-2.7-1.83-3.9-1.45-3.9-1.45a4.8 4.8 0 0 0-.15 3.8A5.2 5.2 0 0 0 3 12.02c0 5.22 3 6.42 6 6.76-.7.62-1 1.5-1 3.24v4"></path>
    <path d="M9 18c-4.5 1.5-5-2.5-7-3"></path>
  </svg>
);

const TwitterIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

const dataSources = [
  { label: 'Pacific Data Hub', href: 'https://pacificdata.org' },
  { label: 'NOAA', href: 'https://www.noaa.gov' },
  { label: 'SPREP', href: 'https://www.sprep.org' },
  { label: 'IPCC AR6', href: 'https://www.ipcc.ch/report/ar6/wg2/' },
];

const references = [
  { id: '1', text: 'World Bank Group. (2021). Pacific Island Countries: Climate Change and Disaster Risk. Regional Report.' },
  { id: '2', text: 'IPCC, 2022: Climate Change 2022: Impacts, Adaptation, and Vulnerability. Contribution of Working Group II to the Sixth Assessment Report.' },
  { id: '3', text: 'Pacific Data Hub (PDH.Stat). (2023). Mean Sea Surface Temperature Anomalies (Dataset 1).' },
  { id: '4', text: 'Pacific Data Hub (PDH.Stat). (2023). Sea Level Anomalies via Satellite Altimetry (Dataset 2).' },
  { id: '5', text: 'Pacific Data Hub (PDH.Stat). (2023). Rainfall Anomalies (Dataset 3).' },
  { id: '6', text: 'Pacific Data Hub (PDH.Stat). (2023). Crop Yield - disaggregated (Dataset 4).' },
  { id: '7', text: 'Pacific Data Hub (PDH.Stat). (2023). Environmental Taxes and Carbon Accounting (Dataset 5).' },
];

export function Footer() {
  return (
    <footer className="w-full relative overflow-hidden bg-[#0A1622] pt-24 pb-8 border-t border-[#2DB5C7]/10">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#2DB5C7]/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#1A8A9C]/5 rounded-full blur-[100px] pointer-events-none translate-y-1/2" />

      {/* Glowing top border accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-[1px] bg-gradient-to-r from-transparent via-[#2DB5C7] to-transparent shadow-[0_0_15px_rgba(45,181,199,0.8)]" />

      <div className="px-6 md:px-12 max-w-7xl mx-auto relative z-10">
        
        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
          
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-4 flex flex-col items-start">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-[#F5F2EB] tracking-wide mb-3">
              Tides of Tomorrow
            </h2>
            <p className="font-body text-[#F5F2EB]/60 max-w-md leading-relaxed">
              A data storytelling blueprint created for the Pacific Dataviz Challenge 2026. Designed to transform complex climate data into visceral, interactive narratives.
            </p>
          </div>

          {/* Data Sources Column */}
          <div className="col-span-1 md:col-span-3">
            <h3 className="font-mono text-xs tracking-widest text-[#2DB5C7] uppercase mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2DB5C7]" />
              Data Sources
            </h3>
            <ul className="flex flex-col gap-4">
              {dataSources.map(link => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group font-body text-sm text-[#F5F2EB]/60 hover:text-[#2DB5C7] transition-all duration-300 flex items-center gap-2"
                  >
                    {link.label}
                    <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-[10px]">
                      &#8594;
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* References / Daftar Pustaka Column */}
          <div className="col-span-1 md:col-span-5">
            <h3 className="font-mono text-xs tracking-widest text-[#F2D07A] uppercase mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F2D07A]" />
              Daftar Pustaka / References
            </h3>
            <ul className="flex flex-col gap-3">
              {references.map(ref => (
                <li key={ref.id} className="flex gap-3 items-start group">
                  <span className="font-mono text-xs text-[#F2D07A]/60 mt-0.5">[{ref.id}]</span>
                  <span className="font-body text-xs text-[#F5F2EB]/50 leading-relaxed group-hover:text-[#F5F2EB]/80 transition-colors duration-300">
                    {ref.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom row */}
        <div className="flex flex-col-reverse md:flex-row items-center justify-between pt-8 border-t border-[#F5F2EB]/10">
          
          <p className="font-body text-xs text-[#F5F2EB]/40 mt-6 md:mt-0">
            &copy; {new Date().getFullYear()} Pacific Dataviz Challenge. Open data, open source.
          </p>

          <div className="flex items-center gap-4">
            <a
              href="#"
              className="w-10 h-10 rounded-full border border-[#F5F2EB]/20 flex items-center justify-center text-[#F5F2EB]/60 hover:text-[#2DB5C7] hover:border-[#2DB5C7] hover:bg-[#2DB5C7]/10 hover:shadow-[0_0_15px_rgba(45,181,199,0.3)] transition-all duration-300 group"
            >
              <GithubIcon size={18} />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full border border-[#F5F2EB]/20 flex items-center justify-center text-[#F5F2EB]/60 hover:text-[#1DA1F2] hover:border-[#1DA1F2] hover:bg-[#1DA1F2]/10 hover:shadow-[0_0_15px_rgba(29,161,242,0.3)] transition-all duration-300 group"
            >
              <TwitterIcon size={18} />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full border border-[#F5F2EB]/20 flex items-center justify-center text-[#F5F2EB]/60 hover:text-[#E85D4E] hover:border-[#E85D4E] hover:bg-[#E85D4E]/10 hover:shadow-[0_0_15px_rgba(232,93,78,0.3)] transition-all duration-300 group"
            >
              <Mail size={18} />
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}
