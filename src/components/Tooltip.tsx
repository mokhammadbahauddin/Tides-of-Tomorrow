import { useEffect, useRef } from 'react';

interface TooltipProps {
  visible: boolean;
  x: number;
  y: number;
  title?: string;
  value?: string;
  subtitle?: string;
  color?: string;
}

export function Tooltip({ visible, x, y, title, value, subtitle, color }: TooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tooltipRef.current || !visible) return;
    const rect = tooltipRef.current.getBoundingClientRect();
    // On mobile, the finger obscures the target. We want the tooltip to float ABOVE the finger/cursor.
    let left = x - (rect.width / 2); // Center horizontally above cursor
    let top = y - rect.height - 24; // Push it significantly up

    // Boundary checks
    if (left < 10) left = 10;
    if (left + rect.width > window.innerWidth - 10) left = window.innerWidth - rect.width - 10;
    if (top < 10) top = y + 32; // If it hits top of screen, push it below the finger

    tooltipRef.current.style.left = `${left}px`;
    tooltipRef.current.style.top = `${top}px`;
  }, [visible, x, y]);

  if (!visible) return null;

  return (
    <div
      ref={tooltipRef}
      className="fixed z-50 pointer-events-none transition-opacity duration-200"
      style={{
        background: 'rgba(12, 18, 34, 0.92)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(58, 125, 255, 0.2)',
        borderRadius: '4px',
        padding: '8px 12px',
        maxWidth: '220px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(4px)',
        borderLeft: color ? `2px solid ${color}` : undefined,
      }}
    >
      {title && (
        <div style={{ fontFamily: 'var(--font-data)', fontSize: '0.875rem', color: 'var(--text-light)', fontWeight: 500 }}>
          {title}
        </div>
      )}
      {value && (
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: color || 'var(--azure-blue)', marginTop: '2px' }}>
          {value}
        </div>
      )}
      {subtitle && (
        <div style={{ fontFamily: 'var(--font-caption)', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}
