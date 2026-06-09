import { useEffect, useState, useRef } from 'react';
import { Menu, X } from 'lucide-react';

const navItems = [
  { label: 'Warming', target: 'warming' },
  { label: 'Sinking', target: 'sinking' },
  { label: 'Weather', target: 'extreme-weather' },
  { label: 'Food', target: 'food-security' },
  { label: 'Debt', target: 'unpaid-debt' },
  { label: 'Synthesis', target: 'climate-debt' },
];

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
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
        // Use rootMargin to trigger when element is in the middle of the screen
        // This solves the bug for very tall elements where threshold > 0 fails.
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
          background: scrolled ? 'rgba(12, 18, 34, 0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(58, 125, 255, 0.2)' : '1px solid transparent',
        }}
      >
        <div className="flex items-center justify-between h-full px-6 max-w-[var(--container-max)] mx-auto">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="font-nav text-[var(--text-light)] hover:text-[var(--azure-blue)] transition-colors duration-200 tracking-widest"
          >
            Tides of Tomorrow
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map(item => (
              <button
                key={item.target}
                onClick={() => scrollTo(item.target)}
                className="relative font-nav text-[0.7rem] tracking-widest transition-colors duration-200 group"
                style={{ color: activeSection === item.target ? 'var(--text-light)' : 'var(--text-muted)' }}
              >
                {item.label}
                <span
                  className="absolute -bottom-1 left-0 h-px bg-[var(--azure-blue)] transition-transform duration-200 origin-left"
                  style={{
                    width: '100%',
                    transform: activeSection === item.target ? 'scaleX(1)' : 'scaleX(0)',
                  }}
                />
              </button>
            ))}
            <button
              onClick={() => scrollTo('action')}
              className="font-nav text-[0.7rem] tracking-widest px-4 py-2 rounded-sm border transition-all duration-200 hover:bg-[var(--azure-blue)] hover:border-[var(--azure-blue)]"
              style={{
                borderColor: activeSection === 'action' ? 'var(--azure-blue)' : 'rgba(58, 125, 255, 0.2)',
                background: activeSection === 'action' ? 'var(--azure-blue)' : 'transparent',
                color: activeSection === 'action' ? '#0B1D2C' : 'var(--text-light)',
              }}
            >
              Explore Data
            </button>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-[var(--text-light)]"
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
          style={{ background: 'var(--deep-navy)' }}
        >
          {navItems.map(item => (
            <button
              key={item.target}
              onClick={() => scrollTo(item.target)}
              className="font-heading text-2xl text-[var(--text-light)] hover:text-[var(--azure-blue)] transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
