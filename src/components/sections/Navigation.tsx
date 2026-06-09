import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Navigation() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > window.innerHeight * 0.5);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const sections = ['hero', 'warming', 'sinking', 'carbon', 'renewable', 'action'];
    
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      
      ScrollTrigger.create({
        trigger: el,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => setActiveSection(id),
        onEnterBack: () => setActiveSection(id),
      });
    });
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems = [
    { id: 'hero', label: 'Home' },
    { id: 'warming', label: 'Warming' },
    { id: 'sinking', label: 'Rising Seas' },
    { id: 'carbon', label: 'Carbon' },
    { id: 'renewable', label: 'Hope' },
    { id: 'action', label: 'Act' },
  ];

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
      }`}
    >
      <div className="glass-panel border-b border-[#2DB5C7]/20">
        <div className="section-padding py-3 flex items-center justify-between">
          <button
            onClick={() => scrollTo('hero')}
            className="font-display text-sm md:text-base text-[#F5F2EB] hover:text-[#2DB5C7] transition-colors"
          >
            Rising Tides
          </button>
          
          <div className="hidden md:flex items-center gap-6">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`text-xs font-body tracking-wider uppercase transition-all duration-300 ${
                  activeSection === item.id
                    ? 'text-[#2DB5C7] font-semibold'
                    : 'text-[#F5F2EB]/60 hover:text-[#F5F2EB]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
