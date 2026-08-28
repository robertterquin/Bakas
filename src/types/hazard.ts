export type HazardCategory = 'pothole' | 'clogged_drainage' | 'road_obstruction' | 'dark_street';

export type HazardSeverity = 'low' | 'medium' | 'high';

export type SyncStatus = 'synced' | 'pending_sync' | 'failed';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface UserLocation extends Coordinates {
  accuracy: number;
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
}

export interface Hazard {
  id: string;
  category: HazardCategory;
  severity: HazardSeverity;
  lat: number;
  lng: number;
  address?: string;
  title?: string;
  description?: string;
  upvotes: number;
  resolvedCount: number;
  isResolved?: boolean;
  expiresAt: string; // ISO 8601 string
  createdAt: string; // ISO 8601 string
  updatedAt?: string; // ISO 8601 string
  syncStatus?: SyncStatus;
}

export interface HazardPayload {
  category: HazardCategory;
  severity: HazardSeverity;
  lat: number;
  lng: number;
  address?: string;
  description?: string;
}

export interface ValidationAction {
  id: string;
  hazardId: string;
  actionType: 'upvote' | 'resolve';
  deviceHash: string;
  createdAt: string;
}

export type CategoryFilter = 'all' | HazardCategory;
export type RadiusFilter = number; // in meters, 0 = Auto-Scope / Dynamic Zoom Scope, or 1000, 3000, 5000, 15000, 50000, etc.
