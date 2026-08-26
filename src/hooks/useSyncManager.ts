import { useState, useEffect, useCallback, useRef } from 'react';
import { getPendingReports, removePendingReport, getPendingValidations, removePendingValidation } from '../services/offline.service';
import { submitHazardToBackend, submitUpvoteToBackend, submitResolveToBackend } from '../services/hazard.service';

export interface SyncState {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncSuccessMessage: string | null;
}

export function useSyncManager(onSyncCompleted?: (count: number) => void) {
  const [state, setState] = useState<SyncState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    pendingCount: 0,
    isSyncing: false,
    lastSyncTime: null,
    syncSuccessMessage: null,
  });

  const onSyncCompletedRef = useRef(onSyncCompleted);
  onSyncCompletedRef.current = onSyncCompleted;

  const refreshPendingCount = useCallback(async () => {
    try {
      const reports = await getPendingReports();
      const validations = await getPendingValidations();
      setState((prev) => ({
        ...prev,
        pendingCount: reports.length + validations.length,
      }));
      return reports.length + validations.length;
    } catch {
      return 0;
    }
  }, []);

  const syncPendingItems = useCallback(async () => {
    if (!navigator.onLine) return;

    setState((prev) => ({ ...prev, isSyncing: true }));
    let syncedCount = 0;

    try {
      // 1. Sync pending reports
      const pendingReports = await getPendingReports();
      for (const report of pendingReports) {
        try {
          await submitHazardToBackend(report);
          await removePendingReport(report.id);
          syncedCount++;
        } catch (err) {
          console.warn('Failed to sync hazard item:', report.id, err);
        }
      }

      // 2. Sync pending validations
      const pendingValidations = await getPendingValidations();
      for (const val of pendingValidations) {
        try {
          if (val.actionType === 'upvote') {
            await submitUpvoteToBackend(val.hazardId, val.deviceHash);
          } else {
            await submitResolveToBackend(val.hazardId, val.deviceHash);
          }
          await removePendingValidation(val.id);
          syncedCount++;
        } catch (err) {
          console.warn('Failed to sync validation item:', val.id, err);
        }
      }

      await refreshPendingCount();

      setState((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: new Date(),
        syncSuccessMessage: syncedCount > 0 ? `Synced ${syncedCount} offline ${syncedCount === 1 ? 'trace' : 'traces'}` : null,
      }));

      if (syncedCount > 0 && onSyncCompletedRef.current) {
        onSyncCompletedRef.current(syncedCount);
      }
    } catch (error) {
      console.error('Offline sync error:', error);
      setState((prev) => ({ ...prev, isSyncing: false }));
    }
  }, [refreshPendingCount]);

  useEffect(() => {
    refreshPendingCount();

    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOnline: true }));
      syncPendingItems();
    };

    const handleOffline = () => {
      setState((prev) => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshPendingCount, syncPendingItems]);

  const clearSuccessMessage = useCallback(() => {
    setState((prev) => ({ ...prev, syncSuccessMessage: null }));
  }, []);

  return {
    ...state,
    refreshPendingCount,
    syncPendingItems,
    clearSuccessMessage,
  };
}
