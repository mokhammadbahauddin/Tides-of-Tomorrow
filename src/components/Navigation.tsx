import { useEffect, useState, useRef } from 'react';
import { Menu, X, ChevronDown, Volume2, VolumeX } from 'lucide-react';

interface Country {
  id: string;
  name: string;
}

const navItems = [
  { label: 'Prologue', target: 'prologue' },
  { label: 'Warming', target: 'warming' },
  { label: 'Sinking', target: 'sinking' },
  { label: 'Weather', target: 'extreme-weather' },
  { label: 'Food', target: 'food-security' },
  { label: 'Debt', target: 'unpaid-debt' },
  { label: 'Synthesis', target: 'climate-debt' },
];

export const countries: Country[] = [
  { id: 'REGIONAL', name: 'Regional Average' },
  { id: 'FJI', name: 'Fiji' },
  { id: 'TUV', name: 'Tuvalu' },
  { id: 'KIR', name: 'Kiribati' },
  { id: 'WSM', name: 'Samoa' },
  { id: 'TON', name: 'Tonga' },
  { id: 'SLB', name: 'Solomon Islands' },
  { id: 'VUT', name: 'Vanuatu' },
  { id: 'MHL', name: 'Marshall Islands' },
  { id: 'PLW', name: 'Palau' },
  { id: 'FSM', name: 'Micronesia' }
];

interface NavigationProps {
  selectedCountry: Country;
  onCountryChange: (country: Country) => void;
  isMuted: boolean;
  onMuteToggle: () => void;
}

export function Navigation({ selectedCountry, onCountryChange, isMuted, onMuteToggle }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.8);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const targets = [...navItems.map(item => item.target), 'action'];
    
    targets.forEach(target => {
      const el = document.getElementById(target);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(target);
          }
        },
        { rootMargin: '-30% 0px -30% 0px', threshold: 0 }
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          height: 'var(--header-height)',
          background: scrolled ? 'rgba(11, 26, 46, 0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(212, 165, 116, 0.12)' : '1px solid transparent',
        }}
      >
        <div className="flex items-center justify-between h-full px-6 max-w-[var(--container-max)] mx-auto">
          {/* Logo Title & Global Dropdown */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="transition-colors duration-200 tracking-widest hidden sm:inline-block"
              style={{
                color: '#E8DCC8',
                fontFamily: "'Playfair Display', serif",
                fontSize: '0.85rem',
                letterSpacing: '0.15em',
              }}
            >
              Tides of Tomorrow
            </button>

            {/* Global Country/Vulnerability Selector */}
            <div className="relative z-50" onKeyDown={(e) => { if (e.key === 'Escape') setIsDropdownOpen(false); }}>
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
                aria-label="Select vulnerability data for country"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="bg-[#0B1A2E]/80 border border-[#D4A574]/20 text-[#E8DCC8] hover:border-reef-teal transition-all flex items-center gap-2 px-3 py-1.5 rounded-none text-xs font-body backdrop-blur-md relative overflow-hidden group focus:outline-none shadow-[inset_0_0_10px_rgba(43,122,120,0.05)]"
              >
                <span className="text-[9px] text-[#8B7355] font-mono uppercase tracking-wider">Vulnerability:</span>
                <span className="font-semibold text-white text-[11px]">{selectedCountry.name}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#D4A574] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div 
                    role="listbox"
                    aria-label="Pacific countries selector"
                    className="absolute z-50 top-full left-0 mt-1 bg-[#0B1A2E]/95 backdrop-blur-md border border-[#D4A574]/15 max-h-72 overflow-y-auto rounded-none py-1.5 w-48 text-left shadow-[0_15px_45px_rgba(0,0,0,0.9)]" 
                    style={{ scrollbarWidth: 'thin' }}
                  >
                    {countries.map((c) => (
                      <button
                        key={c.id}
                        role="option"
                        aria-selected={selectedCountry.id === c.id}
                        onClick={() => {
                          onCountryChange(c);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-body hover:bg-[#1E4D5C] hover:text-white transition-colors duration-200 relative overflow-hidden focus:outline-none"
                        style={{
                          color: selectedCountry.id === c.id ? '#FFFFFF' : '#E8DCC8',
                          background: selectedCountry.id === c.id ? 'rgba(43, 122, 120, 0.35)' : 'transparent',
                          borderLeft: selectedCountry.id === c.id ? '2px solid #2B7A78' : '2px solid transparent',
                        }}
                      >
                        <span className="relative z-10 font-bold">{c.name}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Audio controller toggle button */}
            <button
              onClick={onMuteToggle}
              className="bg-transparent border-none text-[#E8DCC8]/60 hover:text-white hover:scale-105 transition-all p-1.5 focus:outline-none ml-1 flex items-center justify-center"
              title={isMuted ? "Unmute soundscape" : "Mute soundscape"}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-terracotta" />
              ) : (
                <Volume2 className="w-4 h-4 text-reef-teal animate-pulse" />
              )}
            </button>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map(item => (
              <button
                key={item.target}
                onClick={() => scrollTo(item.target)}
                className="relative font-nav text-[0.7rem] tracking-widest transition-colors duration-200 group"
                style={{
                  color: activeSection === item.target
                    ? '#E8DCC8'
                    : 'rgba(232, 220, 200, 0.5)',
                }}
              >
                {item.label}
                <span
                  className="absolute -bottom-1 left-0 h-px transition-transform duration-200 origin-left"
                  style={{
                    width: '100%',
                    background: '#D4A574',
                    transform: activeSection === item.target ? 'scaleX(1)' : 'scaleX(0)',
                  }}
                />
              </button>
            ))}
            <button
              onClick={() => scrollTo('action')}
              className="font-nav text-[0.7rem] tracking-widest px-4 py-2 rounded-none transition-all duration-200 border border-[#B44D36]/40 hover:bg-[#B44D36]/10 text-[#E8DCC8]"
              style={{
                background: activeSection === 'action' ? 'rgba(180, 77, 54, 0.2)' : 'transparent',
              }}
            >
              Explore Data
            </button>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden"
            style={{ color: '#E8DCC8' }}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close main navigation menu" : "Open main navigation menu"}
            aria-haspopup="true"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 md:hidden"
          style={{ background: '#0B1A2E' }}
        >
          {navItems.map(item => (
            <button
              key={item.target}
              onClick={() => scrollTo(item.target)}
              className="font-heading text-2xl transition-colors duration-200"
              style={{
                color: activeSection === item.target
                  ? '#E8DCC8'
                  : 'rgba(232, 220, 200, 0.5)',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
