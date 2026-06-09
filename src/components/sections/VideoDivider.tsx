import { useEffect, useRef, useState } from 'react';

interface Props {
  videoSrc: string;
  quote: string;
  attribution: string;
}

export function VideoDivider({ videoSrc, quote, attribution }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
        } else {
          setVisible(false);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden z-20"
      style={{ height: '100vh' }}
    >
      {videoSrc.endsWith('.png') || videoSrc.endsWith('.jpg') ? (
        <img
          src={videoSrc}
          alt={quote}
          className="absolute inset-0 w-full h-full object-cover origin-center transition-transform duration-[20s] ease-out"
          style={{ 
            zIndex: 0,
            transform: visible ? 'scale(1.15)' : 'scale(1)'
          }}
        />
      ) : (
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 0 }}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      <div
        className="absolute inset-0"
        style={{
          zIndex: 1,
          background: 'linear-gradient(180deg, rgba(12,18,34,0.5) 0%, rgba(12,18,34,0.6) 100%)',
        }}
      />

      <div
        className="relative flex flex-col items-center justify-center h-full px-6 text-center"
        style={{ zIndex: 2 }}
      >
        <blockquote
          className="font-heading max-w-[600px] transition-all duration-700"
          style={{
            color: 'var(--text-light)',
            textShadow: '0 2px 20px rgba(0,0,0,0.5)',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          &ldquo;{quote}&rdquo;
        </blockquote>

        <cite
          className="font-caption mt-4 not-italic block transition-all duration-700 delay-200"
          style={{
            color: 'var(--text-muted)',
            opacity: visible ? 0.8 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(10px)',
          }}
        >
          {attribution}
        </cite>
      </div>

      {/* Bottom gradient */}
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
