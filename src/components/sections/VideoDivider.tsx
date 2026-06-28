import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Props {
  videoSrc: string;
  quote: string;
  attribution: string;
  posterSrc?: string;
}

export function VideoDivider({ videoSrc, quote, attribution, posterSrc }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [isVisible, setIsVisible] = useState(false);

  const isImage = videoSrc.endsWith('.png') || videoSrc.endsWith('.jpg');

  // IntersectionObserver to dynamically play/pause video based on viewport presence
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || isImage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin: '200px' }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [isImage]);

  // Toggle video playback state
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isImage) return;

    if (isVisible) {
      video.play().catch(() => {
        // Autoplay blocked, fail silently
      });
    } else {
      video.pause();
    }
  }, [isVisible, isImage]);

  // GSAP Cinematic Quote Transition (Blur & Scale scrub)
  useEffect(() => {
    const section = sectionRef.current;
    const textContent = textRef.current;

    if (!section || !textContent) return;

    const ctx = gsap.context(() => {
      // Create a single timeline for the quote fade-in, focus, and fade-out
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top bottom', // Start timeline when section top hits screen bottom
          end: 'bottom top',   // End timeline when section bottom leaves screen top
          scrub: 1.0,          // Direct scroll binding
        }
      });

      tl.fromTo(textContent,
        { 
          opacity: 0, 
          scale: 0.90,
          filter: 'blur(15px)',
        },
        {
          opacity: 1,
          scale: 1.0,
          filter: 'blur(0px)',
          duration: 0.4, // Relative duration within timeline
          ease: 'power1.out'
        }
      )
      // Hold active state while centered
      .to(textContent, {
        opacity: 1,
        scale: 1.0,
        filter: 'blur(0px)',
        duration: 0.2
      })
      // Fade and blur out as it exits the screen
      .to(textContent, {
        opacity: 0,
        scale: 1.08,
        filter: 'blur(15px)',
        duration: 0.4,
        ease: 'power1.in'
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-[100vh] overflow-hidden z-20 bg-deep-ocean video-divider-section"
    >
      {/* Media Container - Completely static/anchored for 100% scroll stability */}
      <div ref={mediaRef} className="absolute inset-0 w-full h-full">
        {isImage ? (
          <img
            src={videoSrc}
            alt={quote}
            className="w-full h-full object-cover origin-center filter brightness-[0.8] contrast-[1.05] saturate-[0.95]"
            style={{
              zIndex: 0,
              opacity: isVisible ? 1 : 0.3,
              transition: 'opacity 0.8s ease-in-out',
            }}
          />
        ) : (
          <video
            ref={videoRef}
            src={videoSrc}
            loop
            muted
            playsInline
            preload="none"
            poster={posterSrc}
            className="w-full h-full object-cover filter brightness-[0.8] contrast-[1.05] saturate-[0.95]"
            style={{ 
              zIndex: 0, 
              opacity: isVisible ? 1 : 0.4, // Keep visible at low opacity when scrolled out of view
              transition: 'opacity 1.0s ease-in-out',
            }}
          />
        )}
      </div>

      {/* Soft gradient transitions to blend into acts above/below */}
      <div className="absolute top-0 left-0 w-full h-[15vh] bg-gradient-to-b from-deep-ocean to-transparent pointer-events-none z-[2]" />
      <div className="absolute bottom-0 left-0 w-full h-[15vh] bg-gradient-to-t from-deep-ocean to-transparent pointer-events-none z-[2]" />

      {/* Subtle dark vignette overlay for legibility */}
      <div className="absolute inset-0 z-[1] bg-black/30 pointer-events-none" />

      {/* Text Content Container */}
      <div
        className="relative z-[3] flex flex-col items-center justify-center h-full px-6 text-center max-w-4xl mx-auto pointer-events-none"
      >
        <div 
          ref={textRef}
          style={{ willChange: 'filter, transform, opacity' }}
        >
          <blockquote 
            className="font-display text-3xl md:text-5xl font-bold text-shell-white leading-tight mb-6" 
            style={{ 
              textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 4px 20px rgba(0,0,0,0.7), 0 8px 40px rgba(0,0,0,0.5)' 
            }}
          >
            &ldquo;{quote}&rdquo;
          </blockquote>

          <cite className="font-body text-sm md:text-base text-warm-sand uppercase tracking-widest not-italic block animate-pulse-glow" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
            {attribution}
          </cite>
        </div>
      </div>
    </section>
  );
}
