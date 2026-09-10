import { useState, useEffect, useCallback, useMemo } from 'react';
import { Hazard, HazardCategory, HazardPayload, CategoryFilter, RadiusFilter, UserLocation, ValidationAction, FloodPassability } from '../types/hazard';
import {
  getOrCreateDeviceFingerprint,
  hasDeviceVoted,
  recordDeviceVote,
  recordDevicePassabilityVote,
  calculatePassabilityConsensus,
  calculateExtendedExpiry,
} from '../utils/domain-rules';
import { calculateDistanceInMeters } from '../services/geo.service';
import {
  fetchHazardsInRadius,
  submitHazardToBackend,
  submitUpvoteToBackend,
  submitResolveToBackend,
  submitPassabilityVote,
  createNewHazardObject,
} from '../services/hazard.service';
import { savePendingReport, cacheHazards, savePendingValidation } from '../services/offline.service';

export function useHazardManager(userLocation: UserLocation, isOnline: boolean, onQueueChanged?: () => void) {
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('all');
  const [radiusFilter, setRadiusFilter] = useState<RadiusFilter>(0); // 0 = Auto-Scope / Dynamic Viewport Scope
  const [selectedHazardId, setSelectedHazardId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch hazards in radius (or large region when in auto-scope mode)
  const loadHazards = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryRadius = radiusFilter === 0 ? 50000 : radiusFilter;
      const items = await fetchHazardsInRadius(userLocation.lat, userLocation.lng, queryRadius);
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
      // If radiusFilter is 0 (Auto-Scope / Dynamic), display all loaded hazards
      if (radiusFilter === 0) {
        return true;
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

  // Duplicate Check within 15 meters
  const checkNearbyDuplicate = useCallback((lat: number, lng: number, category: HazardCategory): Hazard | null => {
    for (const h of hazards) {
      if (h.category === category) {
        const dist = calculateDistanceInMeters(lat, lng, h.lat, h.lng);
        if (dist <= 15) {
          return h;
        }
      }
    }
    return null;
  }, [hazards]);

  // 1. Report Hazard
  const reportHazard = async (payload: HazardPayload): Promise<{ isOffline: boolean; hazard: Hazard }> => {
    const newHazard = createNewHazardObject(payload);

    if (!isOnline) {
      newHazard.syncStatus = 'pending_sync';
      await savePendingReport(newHazard);
      setHazards((prev) => [newHazard, ...prev]);
      if (onQueueChanged) onQueueChanged();
      return { isOffline: true, hazard: newHazard };
    }

    try {
      const saved = await submitHazardToBackend(newHazard);
      setHazards((prev) => [saved, ...prev]);
      return { isOffline: false, hazard: saved };
    } catch (err) {
      console.warn('Network submit failed, queuing offline:', err);
      newHazard.syncStatus = 'pending_sync';
      await savePendingReport(newHazard);
      setHazards((prev) => [newHazard, ...prev]);
      if (onQueueChanged) onQueueChanged();
      return { isOffline: true, hazard: newHazard };
    }
  };

  // 2. Upvote Hazard
  const upvoteHazard = async (hazardId: string): Promise<{ success: boolean; message: string }> => {
    if (hasDeviceVoted(hazardId, 'upvote')) {
      return { success: false, message: 'You already vouched for this hazard.' };
    }

    const deviceHash = getOrCreateDeviceFingerprint();

    // Optimistic Update
    setHazards((prev) =>
      prev.map((h) => {
        if (h.id === hazardId) {
          return {
            ...h,
            upvotes: h.upvotes + 1,
            expiresAt: calculateExtendedExpiry(h.category, h.createdAt, h.expiresAt),
          };
        }
        return h;
      })
    );
    recordDeviceVote(hazardId, 'upvote');

    if (!isOnline) {
      const valAction: ValidationAction = {
        id: crypto.randomUUID(),
        hazardId,
        actionType: 'upvote',
        deviceHash,
        createdAt: new Date().toISOString(),
      };
      await savePendingValidation(valAction);
      if (onQueueChanged) onQueueChanged();
      return { success: true, message: 'Upvote stored offline in IndexedDB.' };
    }

    try {
      await submitUpvoteToBackend(hazardId, deviceHash);
      return { success: true, message: 'Vouch confirmed on radar!' };
    } catch (err) {
      console.warn('Backend upvote failed, queuing offline:', err);
      const valAction: ValidationAction = {
        id: crypto.randomUUID(),
        hazardId,
        actionType: 'upvote',
        deviceHash,
        createdAt: new Date().toISOString(),
      };
      await savePendingValidation(valAction);
      if (onQueueChanged) onQueueChanged();
      return { success: true, message: 'Upvote queued offline.' };
    }
  };

  // 3. Resolve Hazard with optional proof photo
  const resolveHazard = async (
    hazardId: string,
    proofImageUrl?: string
  ): Promise<{ success: boolean; message: string }> => {
    if (hasDeviceVoted(hazardId, 'resolve')) {
      return { success: false, message: 'You already voted to resolve this hazard.' };
    }

    const deviceHash = getOrCreateDeviceFingerprint();

    // Optimistic Update
    setHazards((prev) =>
      prev.map((h) => {
        if (h.id === hazardId) {
          const newCount = h.resolvedCount + 1;
          return {
            ...h,
            resolvedCount: newCount,
            isResolved: true,
            resolvedImageUrl: proofImageUrl || h.resolvedImageUrl,
          };
        }
        return h;
      })
    );
    recordDeviceVote(hazardId, 'resolve');

    if (!isOnline) {
      const valAction: ValidationAction = {
        id: crypto.randomUUID(),
        hazardId,
        actionType: 'resolve',
        deviceHash,
        createdAt: new Date().toISOString(),
      };
      await savePendingValidation(valAction);
      if (onQueueChanged) onQueueChanged();
      return { success: true, message: 'Resolve vote stored offline in IndexedDB.' };
    }

    try {
      const result = await submitResolveToBackend(hazardId, deviceHash, proofImageUrl);
      if (result?.isResolved) {
        return { success: true, message: 'Community consensus reached! Hazard marked as cleared.' };
      }
      return { success: true, message: 'Resolve vote recorded (+1).' };
    } catch (err) {
      console.warn('Backend resolve failed, queuing offline:', err);
      const valAction: ValidationAction = {
        id: crypto.randomUUID(),
        hazardId,
        actionType: 'resolve',
        deviceHash,
        createdAt: new Date().toISOString(),
      };
      await savePendingValidation(valAction);
      if (onQueueChanged) onQueueChanged();
      return { success: true, message: 'Resolve vote queued offline.' };
    }
  };

  // 4. Vote on Flood Passability
  const votePassability = async (
    hazardId: string,
    status: FloodPassability
  ): Promise<{ success: boolean; message: string }> => {
    const deviceHash = getOrCreateDeviceFingerprint();
    recordDevicePassabilityVote(hazardId, status);

    // Optimistic Update
    setHazards((prev) =>
      prev.map((h) => {
        if (h.id === hazardId) {
          const currentVotes = h.passabilityVotes || {
            passable_all: 0,
            passable_high_clearance: 0,
            impassable: 0,
          };
          const updatedVotes = {
            ...currentVotes,
            [status]: (currentVotes[status] || 0) + 1,
          };
          const consensus = calculatePassabilityConsensus(updatedVotes, status);
          return {
            ...h,
            passability: consensus,
            passabilityVotes: updatedVotes,
          };
        }
        return h;
      })
    );

    await submitPassabilityVote(hazardId, status, deviceHash);
    if (onQueueChanged) onQueueChanged();
    return { success: true, message: 'Passability observation recorded.' };
  };

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
    checkNearbyDuplicate,
    reportHazard,
    upvoteHazard,
    resolveHazard,
    votePassability,
    refreshHazards: loadHazards,
  };
}
