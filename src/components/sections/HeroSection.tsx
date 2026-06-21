import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

interface HeroSectionProps {
  className?: string;
}

export default function HeroSection({ className }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);


  useEffect(() => {
    const ctx = gsap.context(() => {
      // Use classes instead of children collection to avoid null targets
      const statCards = gsap.utils.toArray('.stat-card');

      // Initial state
      gsap.set([titleRef.current, subtitleRef.current], { opacity: 0, y: 30 });
      if (statCards.length > 0) {
        gsap.set(statCards, { opacity: 0, y: 20 });
      }

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.to(titleRef.current, { opacity: 1, y: 0, duration: 1.2, delay: 0.2 })
        .to(subtitleRef.current, { opacity: 1, y: 0, duration: 1.0 }, "-=0.8");

      if (statCards.length > 0) {
        tl.to(statCards, { opacity: 1, y: 0, duration: 0.8, stagger: 0.15 }, "-=0.6");
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Removed stat cards array as per user request to clean up Hero section

  return (
    <section
      id="hero"
      ref={sectionRef}
      className={`relative min-h-screen flex items-center justify-center overflow-hidden ${className || ''}`}
    >
      {/* Subtle gradient overlay at bottom */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0B1A2E] to-transparent" />
      </div>

      {/* Top Content: Title & Subtitle */}
      <div className="absolute top-[10vh] left-0 w-full z-10 px-6 md:px-12 flex flex-col items-center text-center pointer-events-none">
        <h1
          ref={titleRef}
          className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold leading-[0.9] tracking-tight mb-6"
          style={{ textShadow: '0 4px 24px rgba(11, 26, 46, 0.6)' }}
        >
          <span className="block" style={{ color: '#E8DCC8', opacity: 0.92 }}>Tides of</span>
          <span
            className="block text-transparent bg-clip-text"
            style={{ backgroundImage: 'linear-gradient(135deg, #D4A574, #2B7A78)' }}
          >
            Tomorrow
          </span>
        </h1>

        <p
          ref={subtitleRef}
          className="font-body text-base md:text-lg lg:text-xl max-w-2xl leading-relaxed"
          style={{
            color: 'rgba(232, 220, 200, 0.85)',
            textShadow: '0 2px 12px rgba(11, 26, 46, 0.5)',
          }}
        >
          The Pacific Islands are on the frontlines of climate change.{' '}
          <span style={{ color: '#2B7A78', fontWeight: 600 }}>
            Contributing less than 0.03% of global emissions,
          </span>{' '}
          yet facing the brunt of a rising ocean.
        </p>
      </div>

      {/* Bottom Content: Removed Editorial Stat Cards for a cleaner look */}

      {/* Scroll indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <button
          onClick={() => {
            const docHeight = document.documentElement.scrollHeight;
            const winHeight = window.innerHeight;
            const remainingScroll = docHeight - winHeight - window.scrollY;
            
            if (remainingScroll <= 0) return;

            // Use a steady scrolling speed (160 px/sec) since it will pause at each section
            const speed = 160; 
            const duration = remainingScroll / speed;

            // Kill any existing scroll tween
            gsap.killTweensOf(window);

            // Locate cards in advance to access in cleanup
            const cardSelectors = [
              '.trigger-block-warm',
              '.trigger-block-sinking',
              '.trigger-block-weather',
              '.trigger-block-food',
              '.trigger-block-tax'
            ].join(', ');
            const narrativeCards = gsap.utils.toArray<HTMLElement>(cardSelectors);

            let active = true;
            let pauseTimeout: ReturnType<typeof setTimeout> | null = null;
            const pauseTriggers: any[] = [];
            
            const cleanup = () => {
              if (!active) return;
              active = false;
              
              if (pauseTimeout) {
                clearTimeout(pauseTimeout);
                pauseTimeout = null;
              }
              
              pauseTriggers.forEach((st) => st.kill());
              pauseTriggers.length = 0;

              // Ensure class is removed from all blocks on early exit
              narrativeCards.forEach((block) => {
                block.classList.remove('auto-scroll-reading');
              });

              window.removeEventListener('wheel', stopScroll);
              window.removeEventListener('touchstart', stopScroll);
              window.removeEventListener('mousedown', stopScroll);
              window.removeEventListener('keydown', stopScroll);
            };

            const stopScroll = () => {
              gsap.killTweensOf(window);
              cleanup();
            };

            window.addEventListener('wheel', stopScroll, { passive: true });
            window.addEventListener('touchstart', stopScroll, { passive: true });
            window.addEventListener('mousedown', stopScroll, { passive: true });
            window.addEventListener('keydown', stopScroll, { passive: true });

            const scrollTween = gsap.to(window, {
              scrollTo: { y: docHeight - winHeight, autoKill: true },
              duration: duration,
              ease: 'none', // linear speed for steady scrolling between stops
              onComplete: cleanup,
              onInterrupt: cleanup
            });

            // Create ScrollTriggers for all narrative blocks (pause at center)
            narrativeCards.forEach((block) => {
              const st = ScrollTrigger.create({
                trigger: block,
                start: 'top center',
                onEnter: () => {
                  if (scrollTween && scrollTween.isActive()) {
                    scrollTween.pause();
                    block.classList.add('auto-scroll-reading');
                    if (pauseTimeout) clearTimeout(pauseTimeout);
                    pauseTimeout = setTimeout(() => {
                      block.classList.remove('auto-scroll-reading');
                      if (active && scrollTween) scrollTween.resume();
                    }, 4500); // 4.5s pause to read
                  }
                }
              });
              pauseTriggers.push(st);
            });

            // Create ScrollTriggers for all full-screen video dividers (pause when centered)
            const videoDividers = gsap.utils.toArray<HTMLElement>('.video-divider-section');

            videoDividers.forEach((divider) => {
              const st = ScrollTrigger.create({
                trigger: divider,
                start: 'top top', // when full screen covers viewport
                onEnter: () => {
                  if (scrollTween && scrollTween.isActive()) {
                    scrollTween.pause();
                    if (pauseTimeout) clearTimeout(pauseTimeout);
                    pauseTimeout = setTimeout(() => {
                      if (active && scrollTween) scrollTween.resume();
                    }, 5000); // 5s pause to read the quote
                  }
                }
              });
              pauseTriggers.push(st);
            });
          }}
          className="text-base tracking-widest uppercase text-shell-white hover:text-reef-teal transition-all duration-500 cursor-pointer outline-none pb-2 flex flex-col items-center gap-3 group font-bold drop-shadow-[0_0_15px_rgba(43,122,120,0.8)] hover:drop-shadow-[0_0_35px_rgba(43,122,120,1)] pointer-events-auto animate-pulse-glow"
          style={{ fontFamily: 'var(--font-body, sans-serif)' }}
        >
          <span className="group-hover:-translate-y-1 transition-transform duration-300">Begin the journey</span>
          <div className="w-[3px] h-[24px] bg-gradient-to-b from-reef-teal to-transparent group-hover:h-[40px] group-hover:from-warm-sand transition-all duration-300 rounded-full" />
        </button>
      </div>
    </section>
  );
}
