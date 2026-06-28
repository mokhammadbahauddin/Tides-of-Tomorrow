import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navigation } from '@/components/Navigation';
import { VideoDivider } from '@/components/sections/VideoDivider';
import HeroSection from '@/components/sections/HeroSection';
import WebGLErrorBoundary from '@/components/scene/ErrorBoundary';
import { Footer } from '@/components/sections/Footer';
import AudioController from '@/components/scene/AudioController';
import NavigationMinimap from '@/components/NavigationMinimap';

// Lazy load heavy components to split bundles and improve loading speed in the Pacific
const IslandScene = lazy(() => import('@/components/scene/IslandScene'));
const Act1_Prologue = lazy(() => import('@/components/sections/Act1_Prologue'));
const Act2_ThermalEngine = lazy(() => import('@/components/sections/Act2_ThermalEngine'));
const Act3_EncroachingWaters = lazy(() => import('@/components/sections/Act3_EncroachingWaters'));
const Act4_AtmosphericFracture = lazy(() => import('@/components/sections/Act4_AtmosphericFracture'));
const Act5_FoodSecurity = lazy(() => import('@/components/sections/Act5_FoodSecurity'));
const Act6_UnpaidDebt = lazy(() => import('@/components/sections/Act6_UnpaidDebt'));
const Act7_Synthesis = lazy(() => import('@/components/sections/Act7_Synthesis'));
const CallToAction = lazy(() => import('@/components/sections/CallToAction'));

const SkeletonCard = () => (
  <div className="w-full min-h-[60vh] flex items-center justify-center bg-[#0B1A2E]/30 backdrop-blur-md border border-white/5 animate-pulse rounded-none my-12">
    <div className="text-center">
      <div className="w-10 h-10 rounded-full border-2 border-t-transparent border-[#2B7A78] animate-spin mb-4 mx-auto" />
      <p className="text-[10px] font-mono uppercase tracking-widest text-[#2B7A78]/70">Loading narrative data...</p>
    </div>
  </div>
);

gsap.registerPlugin(ScrollTrigger);

// Global GSAP Optimizations
ScrollTrigger.config({ 
  autoRefreshEvents: "visibilitychange,DOMContentLoaded,load" // Don't refresh on resize unless necessary
});

export default function Home() {
  const scrollProgress = useRef(0);
  const [selectedCountry, setSelectedCountry] = useState({ id: 'REGIONAL', name: 'Regional Average' });
  const [isMuted, setIsMuted] = useState(true);
  const [activeSection, setActiveSection] = useState('prologue');

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? window.scrollY / totalHeight : 0;
      scrollProgress.current = progress;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // IntersectionObserver to track the active visual act in the viewport
    const observers: IntersectionObserver[] = [];
    const targets = ['prologue', 'warming', 'sinking', 'extreme-weather', 'food-security', 'unpaid-debt', 'climate-debt'];
    
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

    // Robust ScrollTrigger refresh using ResizeObserver
    let resizeTimeout: ReturnType<typeof setTimeout> | undefined;
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        ScrollTrigger.refresh();
        handleScroll();
      }, 200);
    });

    // Observe the main body for any height changes
    resizeObserver.observe(document.body);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
      clearTimeout(resizeTimeout);
      observers.forEach(o => o.disconnect());
    };
  }, []);

  return (
    <div className="relative text-[#E8DCC8]">

      <Navigation 
        selectedCountry={selectedCountry} 
        onCountryChange={setSelectedCountry} 
        isMuted={isMuted} 
        onMuteToggle={() => setIsMuted(!isMuted)} 
      />

      <AudioController activeSection={activeSection} isMuted={isMuted} />
      <NavigationMinimap activeSection={activeSection} />

      <main>
        {/* Global Persistent Background */}
        <div className="fixed inset-0 w-full h-full pointer-events-none z-0 bg-[#0B1A2E]">
          <WebGLErrorBoundary>
            <Suspense fallback={null}>
              <IslandScene scrollProgress={scrollProgress} />
            </Suspense>
          </WebGLErrorBoundary>
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--deep-ocean)]/60 via-[var(--deep-ocean)]/50 to-[var(--deep-ocean)]/90" style={{ opacity: 0.6 }} />
        </div>

        {/* Content Layers */}
        <div className="relative z-10 w-full">
          <HeroSection />

          {/* Video Divider 1: Entering the Pacific */}
          <VideoDivider
            videoSrc="/videos/hero-pacific.mp4"
            posterSrc="/images/pacific_3d_island_fallback_1781110837476.png"
            quote="We are the ocean, and the ocean is us."
            attribution="— Epeli Hau'ofa"
          />
          
          <div className="relative bg-transparent">
            <Suspense fallback={<SkeletonCard />}>
              <Act1_Prologue />
            </Suspense>
          </div>

          {/* Video Divider 2: Coral Cathedral */}
          <VideoDivider
            videoSrc="/videos/coral-reef.mp4"
            posterSrc="/images/bleached_coral_reef_1780932576963.png"
            quote="The ocean is the heart of our world. But the heart is feverish."
            attribution="— Pacific Council of Elders"
          />

          <Suspense fallback={<SkeletonCard />}>
            <Act2_ThermalEngine selectedCountry={selectedCountry} />
          </Suspense>

          {/* Video Divider 3: The Tides */}
          <VideoDivider
            videoSrc="/videos/waves-shore.mp4"
            posterSrc="/images/flooded_pacific_village_1780932627405.png"
            quote="We are not drowning, we are fighting."
            attribution="— Pacific Climate Warriors"
          />

          <Suspense fallback={<SkeletonCard />}>
            <Act3_EncroachingWaters selectedCountry={selectedCountry} />
          </Suspense>

          {/* Video Divider 4: Storm's Approach */}
          <VideoDivider
            videoSrc="/videos/storm-clouds.mp4"
            posterSrc="/images/ominous_storm_clouds_1780932603177.png"
            quote="Climate change is the single greatest threat to the livelihoods, security and wellbeing of the peoples of the Pacific."
            attribution="— Boe Declaration on Regional Security"
          />

          <Suspense fallback={<SkeletonCard />}>
            <Act4_AtmosphericFracture selectedCountry={selectedCountry} />
          </Suspense>

          {/* Video Divider 5: Subsistence */}
          <VideoDivider
            videoSrc="/videos/tropical-garden.mp4"
            posterSrc="/images/pacific_3d_island_fallback_1781110837476.png"
            quote="We are fighting for our survival. We are fighting for our land, our culture, and our identity."
            attribution="— Brianna Fruean, Samoan Climate Activist"
          />

          <Suspense fallback={<SkeletonCard />}>
            <Act5_FoodSecurity selectedCountry={selectedCountry} />
          </Suspense>

          {/* Video Divider 6: The Unpaid Debt */}
          <VideoDivider
            videoSrc="/videos/abandoned-village.mp4"
            posterSrc="/images/flooded_pacific_village_1780932627405.png"
            quote="We are drowning in your exhaust, yet you hand us the invoice for our own survival."
            attribution="— The Climate Justice Declaration"
          />

          <Suspense fallback={<SkeletonCard />}>
            <Act6_UnpaidDebt selectedCountry={selectedCountry} />
          </Suspense>

          <Suspense fallback={<SkeletonCard />}>
            <Act7_Synthesis />
          </Suspense>

          {/* Call to Action */}
          <Suspense fallback={<SkeletonCard />}>
            <CallToAction />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
