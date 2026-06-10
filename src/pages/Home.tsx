import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navigation } from '@/components/Navigation';
import { VideoDivider } from '@/components/sections/VideoDivider';
import HeroSection from '@/components/sections/HeroSection';
import IslandScene from '@/components/scene/IslandScene';
import Act1_Prologue from '@/components/sections/Act1_Prologue';
import Act2_ThermalEngine from '@/components/sections/Act2_ThermalEngine';
import Act3_EncroachingWaters from '@/components/sections/Act3_EncroachingWaters';
import Act4_AtmosphericFracture from '@/components/sections/Act4_AtmosphericFracture';
import Act5_FoodSecurity from '@/components/sections/Act5_FoodSecurity';
import Act6_UnpaidDebt from '@/components/sections/Act6_UnpaidDebt';
import Act7_Synthesis from '@/components/sections/Act7_Synthesis';
import CallToAction from '@/components/sections/CallToAction';
import { Footer } from '@/components/sections/Footer';

gsap.registerPlugin(ScrollTrigger);

// Global GSAP Optimizations
ScrollTrigger.config({ 
  autoRefreshEvents: "visibilitychange,DOMContentLoaded,load" // Don't refresh on resize unless necessary
});

export default function Home() {
  const scrollProgress = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? window.scrollY / totalHeight : 0;
      scrollProgress.current = progress;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Robust ScrollTrigger refresh using ResizeObserver
    // This fixes the blank space / overshoot below the footer caused by asynchronous video/image loading
    const resizeObserver = new ResizeObserver(() => {
      ScrollTrigger.refresh();
      handleScroll();
    });

    // Observe the main body for any height changes
    resizeObserver.observe(document.body);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="relative text-[#e6f1ff]">
      <Navigation />

      <main>
        {/* Global Persistent Background */}
        <div className="fixed inset-0 w-full h-full pointer-events-none z-0 bg-[#020c1b]">
          <IslandScene scrollProgress={scrollProgress} />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--ocean-abyss)]/60 via-[var(--ocean-abyss)]/50 to-[var(--ocean-abyss)]/90" style={{ opacity: 0.6 }} />
        </div>

        {/* Content Layers */}
        <div className="relative z-10 w-full">
          <HeroSection />

          {/* Video Divider 1: Entering the Pacific */}
          <VideoDivider
            videoSrc="/videos/hero-pacific.mp4"
            quote="We are the ocean, and the ocean is us."
            attribution="— Epeli Hau'ofa"
          />
          
          <div className="relative bg-transparent">
            <Act1_Prologue />
          </div>

          {/* Video Divider 2: Coral Cathedral */}
          <VideoDivider
            videoSrc="/videos/coral-reef.mp4"
            quote="We are not drowning, we are fighting."
            attribution="— Pacific Climate Warriors"
          />

          <Act2_ThermalEngine />

          {/* Video Divider 3: The Tides */}
          <VideoDivider
            videoSrc="/videos/waves-shore.mp4"
            quote="We are sinking, but so is everyone else."
            attribution="— Simon Kofe, Tuvalu Minister of Justice"
          />

          <Act3_EncroachingWaters />

          {/* Video Divider 4: Storm's Approach */}
          <VideoDivider
            videoSrc="/videos/storm-clouds.mp4"
            quote="Climate change is the single greatest threat to the livelihoods, security and wellbeing of the peoples of the Pacific."
            attribution="— Boe Declaration on Regional Security"
          />

          <Act4_AtmosphericFracture />

          {/* Video Divider 5: Subsistence */}
          <VideoDivider
            videoSrc="/videos/tropical-garden.mp4"
            quote="We are fighting for our survival. We are fighting for our land, our culture, and our identity."
            attribution="— Brianna Fruean, Samoan Climate Activist"
          />

          <Act5_FoodSecurity />

          {/* Video Divider 6: The Unpaid Debt */}
          <VideoDivider
            videoSrc="/videos/abandoned-village.mp4"
            quote="We are drowning in your exhaust, yet you hand us the invoice for our own survival."
            attribution="— The Climate Justice Declaration"
          />

          <Act6_UnpaidDebt />

          <Act7_Synthesis />

          {/* Call to Action */}
          <CallToAction />
        </div>
      </main>

      <Footer />
    </div>
  );
}
