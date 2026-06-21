import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Routes, Route } from 'react-router';
import Home from './pages/Home';

gsap.registerPlugin(ScrollTrigger);


export default function App() {
  const scrollProgressRef = useRef(0);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const masterTrigger = ScrollTrigger.create({
      trigger: mainRef.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        scrollProgressRef.current = self.progress;
        const progressBar = document.getElementById('global-progress-bar');
        if (progressBar) {
          progressBar.style.transform = `scaleX(${self.progress})`;
        }
      },
    });

    return () => {
      masterTrigger.kill();
    };
  }, []);

  return (
    <div ref={mainRef} className="relative">

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-[2px] bg-transparent pointer-events-none">
        <div
          id="global-progress-bar"
          className="h-full origin-left"
          style={{
            width: '100%',
            transform: 'scaleX(0)',
            background: 'linear-gradient(90deg, #2B7A78, #D4A574, #B44D36)',
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
