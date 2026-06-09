import { useRef, useEffect, useState, lazy, Suspense } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Routes, Route } from 'react-router';
import Home from './pages/Home';

gsap.registerPlugin(ScrollTrigger);

const IslandScene = lazy(() => import('@/components/scene/IslandScene'));

export default function App() {
  const scrollProgressRef = useRef(0);
  const [headerProgress, setHeaderProgress] = useState(0);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
    };
  }, []);

  return (
    <div ref={mainRef} className="relative">
      {/* 3D Background Scene */}
      <Suspense fallback={<div className="fixed inset-0 z-0 bg-[var(--ocean-abyss)]" />}>
        <IslandScene scrollProgress={scrollProgressRef} />
      </Suspense>

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
