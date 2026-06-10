import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Routes, Route } from 'react-router';
import Lenis from 'lenis';
import Home from './pages/Home';

gsap.registerPlugin(ScrollTrigger);


export default function App() {
  const scrollProgressRef = useRef(0);
  const [headerProgress, setHeaderProgress] = useState(0);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Lenis for butter-smooth native-feeling scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // standard ease-out
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    
    gsap.ticker.lagSmoothing(0);

    const masterTrigger = ScrollTrigger.create({
      trigger: mainRef.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        scrollProgressRef.current = self.progress;
        setHeaderProgress(self.progress);
      },
    });

    return () => {
      masterTrigger.kill();
      gsap.ticker.remove(lenis.raf);
      lenis.destroy();
    };
  }, []);

  return (
    <div ref={mainRef} className="relative">

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-[2px] bg-transparent pointer-events-none">
        <div
          className="h-full transition-all duration-100"
          style={{
            width: `${headerProgress * 100}%`,
            background: 'linear-gradient(90deg, var(--teal), #00d4aa)',
          }}
        />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </div>
  );
}
