import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Props {
  videoSrc: string;
  quote: string;
  attribution: string;
}

export function VideoDivider({ videoSrc, quote, attribution }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const media = mediaRef.current;
    const textContent = textRef.current;

    if (!section || !media || !textContent) return;

    const ctx = gsap.context(() => {
      // 2. Smooth Fade In & Up for the Quote Text
      gsap.fromTo(textContent,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 60%', // Trigger when section is 60% into view
            end: 'center center',
            toggleActions: 'play reverse play reverse',
          }
        }
      );

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-[100vh] overflow-hidden z-20 bg-[#020c1b]"
    >
      {/* Media Container (Static to prevent lag) */}
      <div ref={mediaRef} className="absolute inset-0 w-full h-full">
        {videoSrc.endsWith('.png') || videoSrc.endsWith('.jpg') ? (
          <img
            src={videoSrc}
            alt={quote}
            className="w-full h-full object-cover origin-center"
            style={{ zIndex: 0 }}
          />
        ) : (
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
            style={{ zIndex: 0 }}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        )}
      </div>

      {/* Dark Overlay for Readability */}
      <div className="absolute inset-0 z-[1] bg-[#020c1b]/50" />

      {/* Top Gradient to blend with previous Act */}
      <div className="absolute top-0 left-0 right-0 h-40 z-[2] bg-gradient-to-b from-[#061018] to-transparent" />
      
      {/* Bottom Gradient to blend with next Act */}
      <div className="absolute bottom-0 left-0 right-0 h-40 z-[2] bg-gradient-to-t from-[#061018] to-transparent" />

      {/* Text Content */}
      <div
        className="relative z-[3] flex flex-col items-center justify-center h-full px-6 text-center max-w-4xl mx-auto"
      >
        <div ref={textRef}>
          <blockquote className="font-display text-3xl md:text-5xl font-bold text-[#e6f1ff] leading-tight mb-6" style={{ textShadow: '0 4px 30px rgba(0,0,0,0.8)' }}>
            &ldquo;{quote}&rdquo;
          </blockquote>

          <cite className="font-mono text-sm md:text-base text-[#64ffda] uppercase tracking-widest not-italic block">
            {attribution}
          </cite>
        </div>
      </div>
    </section>
  );
}
