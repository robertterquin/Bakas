import React from 'react';
import {
  Compass,
  AlertCircle,
  Waves,
  Cone,
  LightbulbOff,
  LucideProps,
} from 'lucide-react';
import { HazardCategory, CategoryFilter } from '../../types/hazard';

interface HazardIconProps extends Omit<LucideProps, 'ref'> {
  category: CategoryFilter;
  size?: number;
  className?: string;
}

/**
 * Accurate hazard category icons using Lucide (hand-picked to match each category).
 *
 * DiceBear Icons style generates RANDOM Bootstrap Icons from a seed hash —
 * you cannot select a specific icon. So we use Lucide for category icons
 * (where accuracy matters) and reserve DiceBear for avatars/identicons
 * (where uniqueness from randomness is the point).
 */
export const HazardIcon: React.FC<HazardIconProps> = ({
  category,
  size = 18,
  className = '',
  ...props
}) => {
  switch (category) {
    case 'pothole':
      return <AlertCircle size={size} className={className} strokeWidth={2.2} {...props} />;
    case 'clogged_drainage':
      return <Waves size={size} className={className} strokeWidth={2.2} {...props} />;
    case 'road_obstruction':
      return <Cone size={size} className={className} strokeWidth={2.2} {...props} />;
    case 'dark_street':
      return <LightbulbOff size={size} className={className} strokeWidth={2.2} {...props} />;
    case 'all':
    default:
      return <Compass size={size} className={className} strokeWidth={2.2} {...props} />;
  }
};

/**
 * Raw SVG markup for Leaflet map markers (monochrome)
 */
export function getCategorySvgMarkup(category: HazardCategory, color: string = '#f8fafc'): string {
  switch (category) {
    case 'pothole':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      `;
    case 'clogged_drainage':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path>
          <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path>
          <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path>
        </svg>
      `;
    case 'road_obstruction':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
          <path d="m14 2 6.5 16.5a1 1 0 0 1-.9 1.5H4.4a1 1 0 0 1-.9-1.5L10 2a2 2 0 0 1 4 0Z"></path>
          <path d="M7.5 13h9"></path>
          <path d="M5.5 18h13"></path>
        </svg>
      `;
    case 'dark_street':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 18h6"></path>
          <path d="M10 22h4"></path>
          <path d="M2 2l20 20"></path>
          <path d="M8.9 3.5A7 7 0 0 1 19 9.5a6.9 6.9 0 0 1-1.3 4"></path>
          <path d="M6.3 6.3a7 7 0 0 0-.3 3.2c0 2.2 1 4.1 2.6 5.4l.4 3.1h4"></path>
        </svg>
      `;
  }
}
