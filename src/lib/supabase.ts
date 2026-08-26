import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Hazard, HazardPayload } from '../types/hazard';
import { calculateDistanceInMeters, calculateInitialExpiry, calculateExtendedExpiry } from './domain-rules';
import { GOLDEN_HAZARDS } from '../data/golden-fixtures';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// In-memory runtime store for live session when backend is not configured or in offline demo mode
let liveLocalHazards: Hazard[] = [...GOLDEN_HAZARDS];

/**
 * Fetch active hazards within a specific radius using Supabase PostGIS RPC or local spatial query
 */
export async function fetchHazardsInRadius(
  lat: number,
  lng: number,
  radiusMeters: number = 5000
): Promise<Hazard[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.rpc('get_hazards_in_radius', {
        user_lat: lat,
        user_lng: lng,
        radius_meters: radiusMeters,
      });

      if (!error && Array.isArray(data)) {
        return data.map((item: Record<string, unknown>) => ({
          id: String(item.id),
          category: item.category as Hazard['category'],
          severity: item.severity as Hazard['severity'],
          lat: Number(item.lat),
          lng: Number(item.lng),
          title: item.title ? String(item.title) : undefined,
          description: item.description ? String(item.description) : undefined,
          address: item.address ? String(item.address) : undefined,
          upvotes: Number(item.upvotes || 0),
          resolvedCount: Number(item.resolved_count || 0),
          isResolved: Boolean(item.is_resolved),
          expiresAt: String(item.expires_at),
          createdAt: String(item.created_at),
          syncStatus: 'synced' as const,
        }));
      }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local storage', err);
    }
  }

  // Local spatial fallback
  const now = Date.now();
  return liveLocalHazards.filter((h) => {
    const isExpired = new Date(h.expiresAt).getTime() <= now;
    if (isExpired && !h.isResolved) return false;
    const distance = calculateDistanceInMeters(lat, lng, h.lat, h.lng);
    return distance <= radiusMeters;
  });
}

/**
 * Submit a new hazard report to Supabase or local memory
 */
export async function submitHazardToBackend(hazard: Hazard): Promise<Hazard> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('hazards')
        .insert({
          id: hazard.id,
          category: hazard.category,
          severity: hazard.severity,
          location: `SRID=4326;POINT(${hazard.lng} ${hazard.lat})`,
          lat: hazard.lat,
          lng: hazard.lng,
          title: hazard.title,
          description: hazard.description,
          address: hazard.address,
          upvotes: hazard.upvotes,
          expires_at: hazard.expiresAt,
          created_at: hazard.createdAt,
        })
        .select()
        .single();

      if (!error && data) {
        return {
          ...hazard,
          syncStatus: 'synced',
        };
      }
    } catch (err) {
      console.warn('Supabase insert failed:', err);
    }
  }

  // Update in-memory local state
  const existingIdx = liveLocalHazards.findIndex((h) => h.id === hazard.id);
  const syncedHazard: Hazard = { ...hazard, syncStatus: 'synced' };
  if (existingIdx >= 0) {
    liveLocalHazards[existingIdx] = syncedHazard;
  } else {
    liveLocalHazards.unshift(syncedHazard);
  }

  return syncedHazard;
}

/**
 * Submit upvote action
 */
export async function submitUpvoteToBackend(hazardId: string, deviceHash: string): Promise<Hazard | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.rpc('upvote_hazard', {
        target_hazard_id: hazardId,
        voter_device_hash: deviceHash,
      });

      if (!error && data) {
        return data as Hazard;
      }
    } catch (err) {
      console.warn('Supabase upvote RPC failed:', err);
    }
  }

  // In-memory fallback
  const item = liveLocalHazards.find((h) => h.id === hazardId);
  if (item) {
    item.upvotes += 1;
    item.expiresAt = calculateExtendedExpiry(item.category, item.expiresAt, item.createdAt);
    return { ...item };
  }
  return null;
}

/**
 * Submit resolve action
 */
export async function submitResolveToBackend(hazardId: string, _deviceHash: string): Promise<Hazard | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.rpc('resolve_hazard', {
        target_hazard_id: hazardId,
      });

      if (!error && data) {
        return data as Hazard;
      }
    } catch (err) {
      console.warn('Supabase resolve RPC failed:', err);
    }
  }

  // In-memory fallback
  const item = liveLocalHazards.find((h) => h.id === hazardId);
  if (item) {
    item.resolvedCount = (item.resolvedCount || 0) + 1;
    if (item.resolvedCount >= 3) {
      item.isResolved = true;
      // Fade out and expire in 2 hours
      item.expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    }
    return { ...item };
  }
  return null;
}

/**
 * Helper to construct a fresh Hazard object from user payload
 */
export function createNewHazardObject(payload: HazardPayload): Hazard {
  const now = new Date();
  const id = 'hzd_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
  return {
    id,
    category: payload.category,
    severity: payload.severity,
    lat: payload.lat,
    lng: payload.lng,
    title: payload.category === 'pothole' ? 'Reported Pothole / Defect'
      : payload.category === 'clogged_drainage' ? 'Reported Flooding / Drainage'
      : payload.category === 'road_obstruction' ? 'Reported Road Obstruction'
      : 'Reported Unlit Street',
    description: payload.description || 'Civic trace dropped by commuter.',
    address: payload.address || `${payload.lat.toFixed(5)}, ${payload.lng.toFixed(5)}`,
    upvotes: 1,
    resolvedCount: 0,
    isResolved: false,
    createdAt: now.toISOString(),
    expiresAt: calculateInitialExpiry(payload.category, now),
    syncStatus: 'synced',
  };
}
