import { HazardCategory, HazardSeverity } from '../types/hazard';

export interface CategoryMeta {
  id: HazardCategory;
  name: string;
  tagalogName: string;
  description: string;
  initialTtlHours: number;
  upvoteBonusHours: number;
  maxTtlHours: number;
  iconName: string;
}

/**
 * Tuned for Philippine Urban Road Reality (DPWH / LGU road repair timelines)
 */
export const HAZARD_CATEGORIES: Record<HazardCategory, CategoryMeta> = {
  pothole: {
    id: 'pothole',
    name: 'Pothole & Manhole',
    tagalogName: 'Butas / Lubak / Bukas na Manhole',
    description: 'Damaged asphalt, deep road craters, or missing sewer covers.',
    initialTtlHours: 30 * 24, // 30 days (1 Month base)
    upvoteBonusHours: 14 * 24, // +14 days per community upvote
    maxTtlHours: 90 * 24, // Up to 90 days (3 Months max cap)
    iconName: 'AlertCircle',
  },
  dark_street: {
    id: 'dark_street',
    name: 'Unlit / Dark Street',
    tagalogName: 'Madilim na Kalsada',
    description: 'Broken lamppost, zero visibility road sector, or blackout zone.',
    initialTtlHours: 14 * 24, // 14 days (2 Weeks base)
    upvoteBonusHours: 7 * 24, // +7 days per upvote
    maxTtlHours: 60 * 24, // Up to 60 days (2 Months max cap)
    iconName: 'Moon',
  },
  clogged_drainage: {
    id: 'clogged_drainage',
    name: 'Clogged Drainage / Flood',
    tagalogName: 'Baradong Kanal / Baha',
    description: 'Waterlogged road section, flash flood risk, or overflowing culvert.',
    initialTtlHours: 7 * 24, // 7 days (1 Week base)
    upvoteBonusHours: 7 * 24, // +7 days per upvote
    maxTtlHours: 30 * 24, // Up to 30 days (1 Month max cap)
    iconName: 'Droplets',
  },
  road_obstruction: {
    id: 'road_obstruction',
    name: 'Road Obstruction',
    tagalogName: 'Harang sa Daan / Debris',
    description: 'Construction debris, stalled vehicle, fallen branches, or road works.',
    initialTtlHours: 3 * 24, // 3 days (72 hours base)
    upvoteBonusHours: 2 * 24, // +48 hours per upvote
    maxTtlHours: 14 * 24, // Up to 14 days (2 Weeks max cap)
    iconName: 'ShieldAlert',
  },
};

export interface SeverityMeta {
  id: HazardSeverity;
  label: string;
  sublabel: string;
  badgeClass: string;
  pinClass: string;
}

export const HAZARD_SEVERITIES: Record<HazardSeverity, SeverityMeta> = {
  low: {
    id: 'low',
    label: 'Low',
    sublabel: 'Caution / Minor slow down',
    badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
    pinClass: 'hazard-pin-low',
  },
  medium: {
    id: 'medium',
    label: 'Medium',
    sublabel: 'Warning / Significant trap',
    badgeClass: 'bg-slate-700 text-slate-100 border-slate-600',
    pinClass: 'hazard-pin-medium',
  },
  high: {
    id: 'high',
    label: 'High Danger',
    sublabel: 'Critical / High crash risk',
    badgeClass: 'bg-slate-900 text-white border-white/60 ring-1 ring-white/30',
    pinClass: 'hazard-pin-high',
  },
};

/**
 * Calculates initial expires_at timestamp based on category
 */
export function calculateInitialExpiry(category: HazardCategory, fromDate: Date = new Date()): string {
  const meta = HAZARD_CATEGORIES[category];
  const expiry = new Date(fromDate.getTime() + meta.initialTtlHours * 60 * 60 * 1000);
  return expiry.toISOString();
}

/**
 * Calculates extended expires_at timestamp upon upvoting, bounded by category max cap
 */
export function calculateExtendedExpiry(
  category: HazardCategory,
  currentExpiresAt: string,
  createdAt: string
): string {
  const meta = HAZARD_CATEGORIES[category];
  const currentExpiryTime = new Date(currentExpiresAt).getTime();
  const createdTime = new Date(createdAt).getTime();
  const maxExpiryTime = createdTime + meta.maxTtlHours * 60 * 60 * 1000;

  const bonusMs = meta.upvoteBonusHours * 60 * 60 * 1000;
  // Extend from either current expiry or from now, whichever is further
  const baseTime = Math.max(currentExpiryTime, Date.now());
  const newExpiryTime = Math.min(baseTime + bonusMs, maxExpiryTime);

  return new Date(newExpiryTime).toISOString();
}

/**
 * Calculates distance in meters between two lat/lng points using Haversine formula
 */
export function calculateDistanceInMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Formats distance into human-friendly string (e.g. "120m away" or "2.4 km away")
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters}m away`;
  }
  return `${(meters / 1000).toFixed(1)} km away`;
}

/**
 * Formats remaining TTL countdown (e.g., "Expires in 18 hrs" or "Expires in 45 days")
 */
export function formatTtlRemaining(expiresAtIso: string): { label: string; isExpiringSoon: boolean; isExpired: boolean } {
  const diffMs = new Date(expiresAtIso).getTime() - Date.now();
  if (diffMs <= 0) {
    return { label: 'Expired', isExpiringSoon: true, isExpired: true };
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) {
    const mins = Math.floor(diffMs / (1000 * 60));
    return { label: `Expires in ${mins}m`, isExpiringSoon: true, isExpired: false };
  }
  if (hours < 24) {
    return { label: `Expires in ${hours}h`, isExpiringSoon: hours <= 6, isExpired: false };
  }
  const days = Math.floor(hours / 24);
  return { label: `Expires in ${days}d`, isExpiringSoon: days <= 2, isExpired: false };
}

/**
 * Generates or retrieves an anonymous client device fingerprint for anti-spam voting
 */
export function getOrCreateDeviceFingerprint(): string {
  const KEY = 'bakas_device_fingerprint';
  let fingerprint = localStorage.getItem(KEY);
  if (!fingerprint) {
    fingerprint = 'dev_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem(KEY, fingerprint);
  }
  return fingerprint;
}

/**
 * Checks if current device has already voted on this hazard
 */
export function hasDeviceVoted(hazardId: string, action: 'upvote' | 'resolve'): boolean {
  const voted = localStorage.getItem(`bakas_vote_${action}_${hazardId}`);
  return !!voted;
}

/**
 * Records that current device has voted on this hazard
 */
export function recordDeviceVote(hazardId: string, action: 'upvote' | 'resolve'): void {
  localStorage.setItem(`bakas_vote_${action}_${hazardId}`, new Date().toISOString());
}
