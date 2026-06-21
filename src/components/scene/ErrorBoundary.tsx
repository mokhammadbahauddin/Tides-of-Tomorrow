import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMsg: string;
}

/* ── CSS-only animated night ocean fallback when WebGL is unavailable ── */
const fallbackStyles = `
  @keyframes wave-drift {
    0%   { transform: translateX(0)   scaleY(1); }
    50%  { transform: translateX(-25%) scaleY(1.08); }
    100% { transform: translateX(-50%) scaleY(1); }
  }
  @keyframes wave-drift-reverse {
    0%   { transform: translateX(-50%) scaleY(1); }
    50%  { transform: translateX(-25%) scaleY(0.92); }
    100% { transform: translateX(0)   scaleY(1); }
  }
  @keyframes shimmer {
    0%, 100% { opacity: 0.15; }
    50%      { opacity: 0.35; }
  }
  @keyframes star-twinkle {
    0%, 100% { opacity: 0.3; }
    50%      { opacity: 0.8; }
  }
  .ocean-fallback {
    position: fixed;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    background: linear-gradient(180deg, #020c1b 0%, #0a1622 45%, #112240 100%);
  }
  .ocean-fallback__wave {
    position: absolute;
    left: 0;
    width: 200%;
    height: 180px;
    border-radius: 45% 48% 42% 47%;
  }
  .ocean-fallback__wave--1 {
    bottom: 0;
    background: rgba(10, 30, 60, 0.7);
    animation: wave-drift 12s ease-in-out infinite;
  }
  .ocean-fallback__wave--2 {
    bottom: -30px;
    background: rgba(5, 20, 50, 0.5);
    animation: wave-drift-reverse 14s ease-in-out infinite;
  }
  .ocean-fallback__wave--3 {
    bottom: -60px;
    background: rgba(2, 12, 27, 0.9);
    animation: wave-drift 18s ease-in-out infinite;
  }
  .ocean-fallback__shimmer {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 120% 60% at 50% 80%, rgba(100,255,218,0.08) 0%, transparent 70%);
    animation: shimmer 6s ease-in-out infinite;
    pointer-events: none;
  }
  .ocean-fallback__stars {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .ocean-fallback__star {
    position: absolute;
    width: 2px;
    height: 2px;
    border-radius: 50%;
    background: #e6f1ff;
    animation: star-twinkle 3s ease-in-out infinite;
  }
`;

export class WebGLErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMsg: ''
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMsg: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // CSS-only animated night ocean fallback
      return (
        <>
          <style>{fallbackStyles}</style>
          <div className="ocean-fallback">
            {/* Starfield */}
            <div className="ocean-fallback__stars">
              {Array.from({ length: 40 }).map((_, i) => (
                <span
                  key={i}
                  className="ocean-fallback__star"
                  style={{
                    top: `${Math.random() * 50}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 4}s`,
                    animationDuration: `${2 + Math.random() * 3}s`,
                  }}
                />
              ))}
            </div>

            {/* Moon-like shimmer on the water */}
            <div className="ocean-fallback__shimmer" />

            {/* Layered animated wave shapes */}
            <div className="ocean-fallback__wave ocean-fallback__wave--1" />
            <div className="ocean-fallback__wave ocean-fallback__wave--2" />
            <div className="ocean-fallback__wave ocean-fallback__wave--3" />
          </div>
        </>
      );
    }

    return this.props.children;
  }
}

export default WebGLErrorBoundary;
