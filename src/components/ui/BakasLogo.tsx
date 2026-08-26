import React from 'react';

interface BakasLogoProps {
  size?: number;
  className?: string;
  withGlow?: boolean;
}

/**
 * Official Bakás Minimalist Brand Mark
 * Combines an urban road trace (track) sweeping into a central civic radar beacon.
 */
export const BakasLogo: React.FC<BakasLogoProps> = ({
  size = 24,
  className = '',
  withGlow = false,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
    >
      <defs>
        {withGlow && (
          <filter id="bakas-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        )}
        <linearGradient id="trace-gradient" x1="15" y1="85" x2="50" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#64748b" stopOpacity="0.4" />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>
      </defs>

      {/* Outer Radar Disc */}
      <circle cx="50" cy="50" r="46" stroke="#334155" strokeWidth="2" strokeDasharray="3 5" opacity="0.6" />

      {/* Middle Concentric Ring */}
      <circle cx="50" cy="50" r="32" stroke="#475569" strokeWidth="2.5" opacity="0.8" />

      {/* Inner Active Pulse Orbit */}
      <circle cx="50" cy="50" r="18" stroke="#94a3b8" strokeWidth="2" />

      {/* Dynamic Road Trace Curve (Sweeping from bottom-left to central beacon) */}
      <path
        d="M 18 86 C 24 68, 36 56, 50 50"
        stroke="url(#trace-gradient)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M 32 88 C 36 74, 42 62, 50 50"
        stroke="#cbd5e1"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="2 4"
        opacity="0.8"
      />

      {/* Center Radar Epicenter Beacon */}
      <circle
        cx="50"
        cy="50"
        r="5.5"
        fill="#ffffff"
        filter={withGlow ? 'url(#bakas-glow)' : undefined}
      />
    </svg>
  );
};
