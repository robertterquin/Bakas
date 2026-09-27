import { HazardCategory, HazardSeverity, FloodPassability } from '../types/hazard';

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
 * Calibrated for Philippine Urban Road Reality (MMDA / DPWH / LGU response benchmarks)
 * - Road Obstruction: Fast-clearing transient obstacles (stalls/branches cleared in 1-8h).
 * - Clogged Drainage / Flood: Volatile flash-flood & monsoon water recedes in 2-8h.
 * - Dark Street: Streetlight bulb/ballast dispatch by Meralco/LGU in 2-5 days.
 * - Pothole: Asphalt patching teams dispatched by DPWH/City Engineering in 3-7 days.
 */
export const HAZARD_CATEGORIES: Record<HazardCategory, CategoryMeta> = {
  pothole: {
    id: 'pothole',
    name: 'Pothole & Manhole',
    tagalogName: 'Butas / Lubak / Bukas na Manhole',
    description: 'Damaged asphalt, deep road craters, or missing sewer covers.',
    initialTtlHours: 72, // 3 days base
    upvoteBonusHours: 24, // +1 day (+24h) per community upvote
    maxTtlHours: 168, // 7 days (1 week max consensus cap)
    iconName: 'AlertCircle',
  },
  dark_street: {
    id: 'dark_street',
    name: 'Unlit / Dark Street',
    tagalogName: 'Madilim na Kalsada',
    description: 'Broken lamppost, zero visibility road sector, or blackout zone.',
    initialTtlHours: 48, // 2 days base
    upvoteBonusHours: 12, // +12 hours per upvote
    maxTtlHours: 120, // 5 days max consensus cap
    iconName: 'Moon',
  },
  clogged_drainage: {
    id: 'clogged_drainage',
    name: 'Clogged Drainage / Flood',
    tagalogName: 'Baradong Kanal / Baha',
    description: 'Waterlogged road section, flash flood risk, or overflowing culvert.',
    initialTtlHours: 12, // 12 hours base (waters usually recede within half a day)
    upvoteBonusHours: 6, // +6 hours per upvote
    maxTtlHours: 36, // 1.5 days max consensus cap
    iconName: 'Droplets',
  },
  road_obstruction: {
    id: 'road_obstruction',
    name: 'Road Obstruction',
    tagalogName: 'Harang sa Daan / Debris',
    description: 'Construction debris, stalled vehicle, fallen branches, or road works.',
    initialTtlHours: 8, // 8 hours base (towed or cleared within a work shift)
    upvoteBonusHours: 4, // +4 hours per upvote
    maxTtlHours: 24, // 1 day max consensus cap
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

export interface PassabilityMeta {
  id: FloodPassability;
  label: string;
  depthLabel: string;
  tagalog: string;
  colorClass: string;
  badgeBg: string;
  dotColor: string;
  description: string;
}

export const PASSABILITY_CONFIG: Record<FloodPassability, PassabilityMeta> = {
  passable_all: {
    id: 'passable_all',
    label: 'Passable to All Vehicles',
    depthLabel: 'Ankle Deep (< 20cm)',
    tagalog: 'Abot-bukong / Daang-daan',
    colorClass: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40',
    badgeBg: 'bg-emerald-500',
    dotColor: '#10b981',
    description: 'Safe for sedans, motorcycles, and all public transit.',
  },
  passable_high_clearance: {
    id: 'passable_high_clearance',
    label: 'High-Clearance & 4x4 Only',
    depthLabel: 'Knee Deep (20-45cm)',
    tagalog: 'Abot-tuhod / Mataas na Sasakyan Lang',
    colorClass: 'text-amber-400 border-amber-500/30 bg-amber-950/40',
    badgeBg: 'bg-amber-500',
    dotColor: '#f59e0b',
    description: 'Risk of engine stall for sedans and low-clearance scooters.',
  },
  impassable: {
    id: 'impassable',
    label: 'Impassable / Submerged',
    depthLabel: 'Waist Deep+ (> 45cm)',
    tagalog: 'Abot-baywang / Lubog / Hindi Madadaanan',
    colorClass: 'text-rose-400 border-rose-500/30 bg-rose-950/40',
    badgeBg: 'bg-rose-500',
    dotColor: '#f43f5e',
    description: 'Road impassable to all civilian vehicles. Extreme hydro lock danger.',
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
 * Formats upvote bonus for UI badges (e.g., "+1d", "+12h", "+6h", "+4h")
 */
export function formatUpvoteBonus(hours: number): string {
  if (hours >= 24 && hours % 24 === 0) {
    const days = hours / 24;
    return `+${days}d`;
  }
  return `+${hours}h`;
}

/**
 * Formats upvote bonus for human-readable sentences (e.g., "+1 day", "+12 hours", "+6 hours", "+4 hours")
 */
export function formatUpvoteBonusLabel(hours: number): string {
  if (hours >= 24 && hours % 24 === 0) {
    const days = hours / 24;
    return `+${days} ${days === 1 ? 'day' : 'days'}`;
  }
  return `+${hours} hours`;
}

/**
 * Formats remaining TTL countdown (e.g., "Expires in 4h" or "Expires in 3d")
 */
export function formatTtlRemaining(
  expiresAtIso: string,
  category?: HazardCategory
): { label: string; isExpiringSoon: boolean; isExpired: boolean } {
  const diffMs = new Date(expiresAtIso).getTime() - Date.now();
  if (diffMs <= 0) {
    return { label: 'Expired', isExpiringSoon: true, isExpired: true };
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const categoryMeta = category ? HAZARD_CATEGORIES[category] : undefined;
  const cautionThresholdHours = categoryMeta
    ? Math.max(2, Math.floor(categoryMeta.initialTtlHours * 0.25))
    : 6;

  const isExpiringSoon = hours <= cautionThresholdHours;

  if (hours < 1) {
    const mins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    return { label: `Expires in ${mins}m`, isExpiringSoon: true, isExpired: false };
  }
  if (hours < 24) {
    return { label: `Expires in ${hours}h`, isExpiringSoon, isExpired: false };
  }
  const days = Math.floor(hours / 24);
  return { label: `Expires in ${days}d`, isExpiringSoon, isExpired: false };
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

/**
 * Retrieves the passability vote cast by this device on a flood hazard
 */
export function getDevicePassabilityVote(hazardId: string): FloodPassability | null {
  return localStorage.getItem(`bakas_vote_passability_${hazardId}`) as FloodPassability | null;
}

/**
 * Records a passability vote for this device
 */
export function recordDevicePassabilityVote(hazardId: string, status: FloodPassability): void {
  localStorage.setItem(`bakas_vote_passability_${hazardId}`, status);
}

/**
 * Calculates dynamic consensus passability based on community votes
 */
export function calculatePassabilityConsensus(
  votes?: Record<FloodPassability, number>,
  fallback: FloodPassability = 'passable_high_clearance'
): FloodPassability {
  if (!votes) return fallback;
  const entries: [FloodPassability, number][] = [
    ['passable_all', votes.passable_all || 0],
    ['passable_high_clearance', votes.passable_high_clearance || 0],
    ['impassable', votes.impassable || 0],
  ];
  entries.sort((a, b) => b[1] - a[1]);
  if (entries[0][1] > 0) {
    return entries[0][0];
  }
  return fallback;
}
