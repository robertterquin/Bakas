import { useState, useEffect, useCallback, useMemo } from 'react';
import { Hazard, HazardCategory, HazardPayload, CategoryFilter, RadiusFilter, UserLocation, ValidationAction } from '../types/hazard';
import {
  getOrCreateDeviceFingerprint,
  hasDeviceVoted,
  recordDeviceVote,
  calculateExtendedExpiry,
} from '../utils/domain-rules';
import { calculateDistanceInMeters } from '../services/geo.service';
import {
  fetchHazardsInRadius,
  submitHazardToBackend,
  submitUpvoteToBackend,
  submitResolveToBackend,
  createNewHazardObject,
} from '../services/hazard.service';
import { savePendingReport, cacheHazards, savePendingValidation } from '../services/offline.service';

export function useHazardManager(userLocation: UserLocation, isOnline: boolean, onQueueChanged?: () => void) {
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('all');
  const [radiusFilter, setRadiusFilter] = useState<RadiusFilter>(5000);
  const [selectedHazardId, setSelectedHazardId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch hazards in radius
  const loadHazards = useCallback(async () => {
    setIsLoading(true);
    try {
      const items = await fetchHazardsInRadius(userLocation.lat, userLocation.lng, radiusFilter);
      setHazards(items);
      cacheHazards(items).catch(() => {});
    } catch (err) {
      console.error('Failed to load hazards:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userLocation.lat, userLocation.lng, radiusFilter]);

  // Initial and location-based load
  useEffect(() => {
    loadHazards();
  }, [loadHazards]);

  // Active filtered hazards based on category & radius
  const filteredHazards = useMemo(() => {
    return hazards.filter((h) => {
      // Category filter
      if (activeFilter !== 'all' && h.category !== activeFilter) {
        return false;
      }
      // Radius filter
      const dist = calculateDistanceInMeters(userLocation.lat, userLocation.lng, h.lat, h.lng);
      return dist <= radiusFilter;
    });
  }, [hazards, activeFilter, radiusFilter, userLocation.lat, userLocation.lng]);

  const selectedHazard = useMemo(() => {
    if (!selectedHazardId) return null;
    return hazards.find((h) => h.id === selectedHazardId) || null;
  }, [hazards, selectedHazardId]);

  /**
   * 15-meter anti-spam duplicate detection
   */
  const checkNearbyDuplicate = useCallback(
    (lat: number, lng: number, category: HazardCategory): Hazard | null => {
      return (
        hazards.find((h) => {
          if (h.category !== category) return false;
          const dist = calculateDistanceInMeters(lat, lng, h.lat, h.lng);
          return dist <= 15;
        }) || null
      );
    },
    [hazards]
  );

  /**
   * Report a new hazard (Optimistic UI + IndexedDB / Backend sync)
   */
  const reportHazard = useCallback(
    async (payload: HazardPayload): Promise<{ success: boolean; hazard: Hazard; isOffline: boolean }> => {
      const newHazard = createNewHazardObject(payload);

      // 1. Optimistically add to state
      setHazards((prev) => [newHazard, ...prev]);

      // 2. If offline, save in IndexedDB
      if (!isOnline) {
        await savePendingReport(newHazard);
        if (onQueueChanged) onQueueChanged();
        return { success: true, hazard: newHazard, isOffline: true };
      }

      // 3. If online, send to backend
      try {
        const synced = await submitHazardToBackend(newHazard);
        setHazards((prev) => prev.map((h) => (h.id === newHazard.id ? synced : h)));
        return { success: true, hazard: synced, isOffline: false };
      } catch (err) {
        console.warn('Backend sync failed, storing offline:', err);
        await savePendingReport(newHazard);
        if (onQueueChanged) onQueueChanged();
        return { success: true, hazard: newHazard, isOffline: true };
      }
    },
    [isOnline, onQueueChanged]
  );

  /**
   * Upvote a hazard with client fingerprinting
   */
  const upvoteHazard = useCallback(
    async (hazardId: string): Promise<{ success: boolean; message: string }> => {
      if (hasDeviceVoted(hazardId, 'upvote')) {
        return { success: false, message: 'You have already upvoted this hazard on this device.' };
      }

      const deviceHash = getOrCreateDeviceFingerprint();

      // Optimistic state update
      setHazards((prev) =>
        prev.map((h) => {
          if (h.id === hazardId) {
            return {
              ...h,
              upvotes: h.upvotes + 1,
              expiresAt: calculateExtendedExpiry(h.category, h.expiresAt, h.createdAt),
            };
          }
          return h;
        })
      );

      recordDeviceVote(hazardId, 'upvote');

      if (!isOnline) {
        const valAction: ValidationAction = {
          id: 'val_' + Math.random().toString(36).substring(2, 9),
          hazardId,
          actionType: 'upvote',
          deviceHash,
          createdAt: new Date().toISOString(),
        };
        await savePendingValidation(valAction);
        if (onQueueChanged) onQueueChanged();
        return { success: true, message: 'Upvote saved offline. It will sync when connected.' };
      }

      try {
        await submitUpvoteToBackend(hazardId, deviceHash);
        return { success: true, message: 'Report verified! Pin TTL extended.' };
      } catch {
        return { success: true, message: 'Upvote registered.' };
      }
    },
    [isOnline, onQueueChanged]
  );

  /**
   * Mark a hazard as resolved (3 votes = soft resolved)
   */
  const resolveHazard = useCallback(
    async (hazardId: string): Promise<{ success: boolean; message: string }> => {
      if (hasDeviceVoted(hazardId, 'resolve')) {
        return { success: false, message: 'You have already marked this hazard as resolved.' };
      }

      const deviceHash = getOrCreateDeviceFingerprint();

      // Optimistic state update
      setHazards((prev) =>
        prev.map((h) => {
          if (h.id === hazardId) {
            const nextCount = (h.resolvedCount || 0) + 1;
            const isResolved = nextCount >= 3;
            return {
              ...h,
              resolvedCount: nextCount,
              isResolved,
              expiresAt: isResolved ? new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() : h.expiresAt,
            };
          }
          return h;
        })
      );

      recordDeviceVote(hazardId, 'resolve');

      if (!isOnline) {
        const valAction: ValidationAction = {
          id: 'val_' + Math.random().toString(36).substring(2, 9),
          hazardId,
          actionType: 'resolve',
          deviceHash,
          createdAt: new Date().toISOString(),
        };
        await savePendingValidation(valAction);
        if (onQueueChanged) onQueueChanged();
        return { success: true, message: 'Resolution vote saved offline.' };
      }

      try {
        await submitResolveToBackend(hazardId, deviceHash);
        return { success: true, message: 'Resolution vote recorded.' };
      } catch {
        return { success: true, message: 'Resolution registered.' };
      }
    },
    [isOnline, onQueueChanged]
  );

  return {
    hazards,
    filteredHazards,
    activeFilter,
    setActiveFilter,
    radiusFilter,
    setRadiusFilter,
    selectedHazardId,
    setSelectedHazardId,
    selectedHazard,
    isLoading,
    refreshHazards: loadHazards,
    checkNearbyDuplicate,
    reportHazard,
    upvoteHazard,
    resolveHazard,
  };
}
