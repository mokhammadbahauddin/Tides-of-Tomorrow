// Circular HUD Gauge sub-component for CallToAction

interface GaugeProps {
  value: number;
  max: number;
  label: string;
  unit: string;
  color: string;
}

export default function Gauge({ value, max, label, unit, color }: GaugeProps) {
  const radius = 33;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(1, Math.max(0, value / max));
  const strokeDashoffset = circumference - pct * circumference;

  return (
    <div className="flex flex-col items-center justify-center text-center" role="img" aria-label={`${label}: ${value.toFixed(1)} ${unit}`}>
      <div className="relative w-20 h-20 flex items-center justify-center">
        {/* Background Track */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="transparent"
            stroke="rgba(232, 220, 200, 0.08)"
            strokeWidth="4"
          />
          {/* Filled Value */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth="4.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
            style={{ filter: `drop-shadow(0 0 3px ${color}80)` }}
          />
        </svg>
        {/* Center Text */}
        <div className="absolute flex flex-col items-center">
          <span className="text-sm font-bold text-shell-white leading-none font-body">
            {value.toFixed(1)}
          </span>
          <span className="text-[8px] text-shell-white/60 mt-0.5 uppercase font-body">{unit}</span>
        </div>
      </div>
      <span className="text-[9px] text-shell-white/70 font-body mt-2 tracking-wide uppercase">{label}</span>
    </div>
  );
}
