import { Hazard, HazardPayload } from '../types/hazard';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { calculateInitialExpiry, calculateExtendedExpiry } from '../utils/domain-rules';
import { calculateDistanceInMeters } from './geo.service';
import { GOLDEN_HAZARDS } from '../data/golden-fixtures';
import { getCachedHazards, getPendingReports, cacheHazards } from './offline.service';

// In-memory runtime store for live session fallback
let liveLocalHazards: Hazard[] = [...GOLDEN_HAZARDS];

/**
 * Generate a standard UUID v4 compatible with PostgreSQL UUID column
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback RFC4122 version 4 UUID generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

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
        if (data.length > 0) {
          const remoteHazards: Hazard[] = data.map((item: Record<string, unknown>) => ({
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

          // Merge any pending offline reports that have not synced yet
          try {
            const pending = await getPendingReports();
            const existingIds = new Set(remoteHazards.map((h) => h.id));
            for (const p of pending) {
              if (!existingIds.has(p.id)) {
                remoteHazards.unshift(p);
              }
            }
          } catch {
            // Ignore IndexedDB read error in memory mode
          }

          cacheHazards(remoteHazards).catch(() => {});
          return remoteHazards;
        }
      } else if (error) {
        console.warn('Supabase RPC get_hazards_in_radius notice:', error.message);
      }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local storage', err);
    }
  }

  // Local Persistent Fallback (IndexedDB + Golden Fixtures)
  const now = Date.now();
  let localItems = [...liveLocalHazards];

  try {
    const [cached, pending] = await Promise.all([getCachedHazards(), getPendingReports()]);
    const mergedMap = new Map<string, Hazard>();
    for (const h of localItems) mergedMap.set(h.id, h);
    for (const h of cached) mergedMap.set(h.id, h);
    for (const h of pending) mergedMap.set(h.id, h);
    localItems = Array.from(mergedMap.values());
  } catch {
    // Continue with in-memory items
  }

  return localItems.filter((h) => {
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
  // Always add to live local cache first for instant UI response
  liveLocalHazards.unshift(hazard);
  cacheHazards([hazard]).catch(() => {});

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
          id: String(data.id),
          syncStatus: 'synced',
        };
      } else if (error) {
        throw new Error(error.message);
      }
    } catch (err) {
      console.warn('Supabase insert failed, storing offline in IndexedDB:', err);
      throw err;
    }
  }

  return hazard;
}

/**
 * Upvote / Validate a Hazard in Supabase
 */
export async function submitUpvoteToBackend(
  hazardId: string,
  deviceHash: string
): Promise<{ success: boolean; upvotes: number; expires_at: string }> {
  // Update in local memory
  const localHazard = liveLocalHazards.find((h) => h.id === hazardId);
  if (localHazard) {
    localHazard.upvotes += 1;
    localHazard.expiresAt = calculateExtendedExpiry(
      localHazard.category,
      localHazard.createdAt,
      localHazard.expiresAt
    );
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.rpc('upvote_hazard', {
        target_hazard_id: hazardId,
        voter_device_hash: deviceHash,
      });

      if (!error && data) {
        return {
          success: true,
          upvotes: Number(data.upvotes || (localHazard?.upvotes ?? 1)),
          expires_at: String(data.expires_at || (localHazard?.expiresAt ?? '')),
        };
      } else if (error) {
        // If hazard does not exist in remote DB or already upvoted, handle cleanly
        if (error.message.includes('not found') || error.message.includes('already')) {
          console.info('Hazard upvote target resolved or already counted:', hazardId);
          return {
            success: true,
            upvotes: localHazard ? localHazard.upvotes : 1,
            expires_at: localHazard ? localHazard.expiresAt : new Date().toISOString(),
          };
        }
        throw new Error(error.message);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('not found') || msg.includes('already')) {
        return {
          success: true,
          upvotes: localHazard ? localHazard.upvotes : 1,
          expires_at: localHazard ? localHazard.expiresAt : new Date().toISOString(),
        };
      }
      console.warn('Supabase upvote RPC failed, queuing offline:', err);
      throw err;
    }
  }

  return {
    success: true,
    upvotes: localHazard ? localHazard.upvotes : 1,
    expires_at: localHazard ? localHazard.expiresAt : new Date().toISOString(),
  };
}

/**
 * Resolve / Clear a Hazard in Supabase
 */
export async function submitResolveToBackend(
  hazardId: string,
  deviceHash: string
): Promise<{ success: boolean; resolvedCount: number; isResolved: boolean }> {
  // Update in local memory
  const localHazard = liveLocalHazards.find((h) => h.id === hazardId);
  if (localHazard) {
    localHazard.resolvedCount += 1;
    if (localHazard.resolvedCount >= 3) {
      localHazard.isResolved = true;
    }
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.rpc('resolve_hazard', {
        target_hazard_id: hazardId,
        voter_device_hash: deviceHash,
      });

      if (!error && data) {
        return {
          success: true,
          resolvedCount: Number(data.resolved_count || 1),
          isResolved: Boolean(data.is_resolved),
        };
      } else if (error) {
        // If hazard does not exist in remote DB or already resolved, handle cleanly
        if (error.message.includes('not found') || error.message.includes('already')) {
          console.info('Hazard resolve target resolved or already counted:', hazardId);
          return {
            success: true,
            resolvedCount: localHazard ? localHazard.resolvedCount : 1,
            isResolved: localHazard ? Boolean(localHazard.isResolved) : false,
          };
        }
        throw new Error(error.message);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('not found') || msg.includes('already')) {
        return {
          success: true,
          resolvedCount: localHazard ? localHazard.resolvedCount : 1,
          isResolved: localHazard ? Boolean(localHazard.isResolved) : false,
        };
      }
      console.warn('Supabase resolve RPC failed, queuing offline:', err);
      throw err;
    }
  }

  return {
    success: true,
    resolvedCount: localHazard ? localHazard.resolvedCount : 1,
    isResolved: localHazard ? Boolean(localHazard.isResolved) : false,
  };
}

/**
 * Helper to construct a new Hazard object from UI payload
 */
export function createNewHazardObject(payload: HazardPayload): Hazard {
  const now = new Date();
  const expiresAt = calculateInitialExpiry(payload.category, now);

  return {
    id: generateUUID(),
    category: payload.category,
    severity: payload.severity,
    lat: payload.lat,
    lng: payload.lng,
    address: payload.address || `${payload.lat.toFixed(5)}, ${payload.lng.toFixed(5)}`,
    title: payload.category.replace('_', ' ').toUpperCase(),
    description: payload.description,
    upvotes: 1,
    resolvedCount: 0,
    isResolved: false,
    expiresAt,
    createdAt: now.toISOString(),
    syncStatus: 'synced',
  };
}
