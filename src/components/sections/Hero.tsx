import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo(labelRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, 0.3)
      .fromTo(headlineRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, 0.5)
      .fromTo(subtitleRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, 0.7)
      .fromTo(ctaRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, 0.9)
      .fromTo(scrollIndicatorRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 1.2);

    return () => { tl.kill(); };
  }, []);

  const scrollToOcean = () => {
    const el = document.getElementById('act-ocean');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ height: '100vh' }}
    >
      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 0 }}
      >
        <source src="/videos/hero-pacific.mp4" type="video/mp4" />
      </video>

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 1,
          background: 'linear-gradient(180deg, rgba(12,18,34,0.3) 0%, rgba(12,18,34,0.7) 100%)',
        }}
      />

      {/* Content */}
      <div
        className="relative flex flex-col items-center justify-center h-full px-6 text-center"
        style={{ zIndex: 2, maxWidth: 'var(--container-narrow)', margin: '0 auto' }}
      >
        <span
          ref={labelRef}
          className="font-nav tracking-[0.1em] mb-4 opacity-0"
          style={{ color: 'var(--warm-amber)', fontSize: '0.75rem' }}
        >
          PACIFIC DATAVIZ CHALLENGE 2026
        </span>

        <h1
          ref={headlineRef}
          className="font-display opacity-0"
          style={{ color: 'var(--text-light)' }}
        >
          The Carbon <span style={{ color: 'var(--warm-amber)' }}>Debt</span>
        </h1>

        <p
          ref={subtitleRef}
          className="font-body opacity-0 mt-8"
          style={{
            color: 'var(--text-muted)',
            maxWidth: '600px',
          }}
        >
          Pacific Island nations contributed less than 0.03% of global emissions.
          They are paying the highest price.
        </p>

        <button
          ref={ctaRef}
          onClick={scrollToOcean}
          className="font-nav tracking-widest mt-10 px-8 py-3 rounded-sm opacity-0 transition-all duration-200 hover:-translate-y-0.5"
          style={{
            background: 'var(--azure-blue)',
            color: 'var(--text-light)',
            fontSize: '0.75rem',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#5B94FF';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(58,125,255,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--azure-blue)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Begin the Journey
        </button>
      </div>

      {/* Scroll indicator */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-0"
        style={{ zIndex: 2 }}
      >
        <div className="relative w-px h-10 bg-[rgba(245,240,235,0.2)]">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full scroll-indicator-dot"
            style={{ background: 'var(--text-muted)' }}
          />
        </div>
        <span className="font-caption mt-2" style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
          Scroll
        </span>
      </div>

      {/* Bottom gradient transition */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[200px]"
        style={{
          zIndex: 2,
          background: 'linear-gradient(180deg, transparent 0%, var(--deep-navy) 100%)',
        }}
      />
    </section>
  );
}
