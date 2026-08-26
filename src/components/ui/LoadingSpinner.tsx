import React from 'react';

export type SpinnerVariant =
  | 'ring'
  | 'spokes'
  | 'classic'
  | 'dots-ring'
  | 'spiral'
  | 'swirling'
  | 'arc'
  | 'dual-arc'
  | 'radar';

interface LoadingSpinnerProps {
  variant?: SpinnerVariant;
  size?: number;
  className?: string;
  color?: string;
}

/**
 * Modern SVG Loading Spinners from Loading UI (https://loading-ui.com)
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  variant = 'ring',
  size = 20,
  className = '',
  color = 'currentColor',
}) => {
  switch (variant) {
    // 1. Apple-style Spokes Spinner
    case 'spokes':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
          className={`animate-spin ${className}`}
        >
          <line x1="12" y1="2" x2="12" y2="6" opacity="1" />
          <line x1="19.07" y1="4.93" x2="16.24" y2="7.76" opacity="0.875" />
          <line x1="22" y1="12" x2="18" y2="12" opacity="0.75" />
          <line x1="19.07" y1="19.07" x2="16.24" y2="16.24" opacity="0.625" />
          <line x1="12" y1="22" x2="12" y2="18" opacity="0.5" />
          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" opacity="0.375" />
          <line x1="2" y1="12" x2="6" y2="12" opacity="0.25" />
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" opacity="0.125" />
        </svg>
      );

    // 2. Dual-Arc Opposing Spinner
    case 'dual-arc':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          className={`animate-spin ${className}`}
        >
          <path d="M12 2a10 10 0 0 1 10 10" opacity="0.9" />
          <path d="M12 22a10 10 0 0 1-10-10" opacity="0.9" />
        </svg>
      );

    // 3. Single Minimal Arc Spinner
    case 'arc':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          className={`animate-spin ${className}`}
        >
          <path d="M12 2a10 10 0 0 1 10 10" />
        </svg>
      );

    // 4. Swirling Opposing Curves
    case 'swirling':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          className={`animate-spin ${className}`}
        >
          <path d="M19 12a7 7 0 0 1-7 7" />
          <path d="M5 12a7 7 0 0 1 7-7" />
        </svg>
      );

    // 5. Stepped Dots Ring
    case 'dots-ring':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={color}
          className={`animate-spin ${className}`}
        >
          <circle cx="12" cy="2.5" r="1.5" opacity="1" />
          <circle cx="16.75" cy="4.46" r="1.5" opacity="0.875" />
          <circle cx="20.04" cy="8.25" r="1.5" opacity="0.75" />
          <circle cx="21.5" cy="12" r="1.5" opacity="0.625" />
          <circle cx="20.04" cy="15.75" r="1.5" opacity="0.5" />
          <circle cx="16.75" cy="19.54" r="1.5" opacity="0.375" />
          <circle cx="12" cy="21.5" r="1.5" opacity="0.25" />
          <circle cx="7.25" cy="19.54" r="1.5" opacity="0.125" />
        </svg>
      );

    // 6. Tactical Radar Concentric Pulse
    case 'radar':
      return (
        <div
          className={`relative flex items-center justify-center ${className}`}
          style={{ width: size, height: size }}
        >
          <div className="absolute inset-0 rounded-full border border-sky-400 animate-ping opacity-75" />
          <div className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
        </div>
      );

    // 7. Clean Continuous Ring (Default)
    case 'ring':
    default:
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          className={`animate-spin ${className}`}
        >
          <circle
            cx="12"
            cy="12"
            r="9.5"
            strokeOpacity="0.15"
            stroke="currentColor"
          />
          <path
            d="M12 2.5a9.5 9.5 0 0 1 9.5 9.5"
            strokeLinecap="round"
            stroke="currentColor"
          />
        </svg>
      );
  }
};
