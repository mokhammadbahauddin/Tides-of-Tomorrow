import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMsg: string;
}

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
      // Fallback UI when WebGL crashes
      return (
        <div className="fixed inset-0 z-0 bg-[#020c1b] overflow-hidden">
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center opacity-80 mix-blend-screen animate-pulse-slow"
            style={{ 
              backgroundImage: 'url(/images/pacific_3d_island_fallback.png)',
              transform: 'scale(1.05)',
              transition: 'transform 20s ease-out'
            }}
          />
          {/* Subtle wave overlay to mimic water movement */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--ocean-abyss)] via-transparent to-transparent opacity-60" />
        </div>
      );
    }

    return this.props.children;
  }
}
