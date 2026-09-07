import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getPendingReports,
  removePendingReport,
  getPendingValidations,
  removePendingValidation,
} from '../services/offline.service';
import {
  submitHazardToBackend,
  submitUpvoteToBackend,
  submitResolveToBackend,
} from '../services/hazard.service';

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
  const isSyncingRef = useRef(false);

  const refreshPendingCount = useCallback(async () => {
    try {
      const reports = await getPendingReports();
      const validations = await getPendingValidations();
      const count = reports.length + validations.length;
      setState((prev) => ({
        ...prev,
        pendingCount: count,
      }));
      return count;
    } catch {
      return 0;
    }
  }, []);

  const syncPendingItems = useCallback(async () => {
    if (!navigator.onLine || isSyncingRef.current) return;

    isSyncingRef.current = true;
    setState((prev) => ({ ...prev, isSyncing: true }));
    let syncedCount = 0;

    try {
      // 1. Sync pending reports and remove pushed items immediately
      const pendingReports = await getPendingReports();
      for (const report of pendingReports) {
        try {
          await submitHazardToBackend(report);
          await removePendingReport(report.id);
          syncedCount++;
        } catch (err) {
          console.warn('Failed to sync hazard item:', report.id, err);
          const msg = err instanceof Error ? err.message : String(err);
          // If already inserted or duplicate key error, remove so queue does not stick
          if (msg.includes('duplicate') || msg.includes('already exists')) {
            await removePendingReport(report.id);
            syncedCount++;
          }
        }
      }

      // 2. Sync pending validations and remove pushed items immediately
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
        } catch (err: unknown) {
          console.warn('Failed to sync validation item:', val.id, err);
          // If already processed or invalid pin, remove from queue immediately
          await removePendingValidation(val.id);
          syncedCount++;
        }
      }

      await refreshPendingCount();

      setState((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: new Date(),
        syncSuccessMessage:
          syncedCount > 0
            ? `Uploaded ${syncedCount} offline ${syncedCount === 1 ? 'trace' : 'traces'} to cloud`
            : null,
      }));

      if (syncedCount > 0 && onSyncCompletedRef.current) {
        onSyncCompletedRef.current(syncedCount);
      }
    } catch (error) {
      console.error('Offline sync error:', error);
      setState((prev) => ({ ...prev, isSyncing: false }));
    } finally {
      isSyncingRef.current = false;
    }
  }, [refreshPendingCount]);

  useEffect(() => {
    refreshPendingCount();

    // 1. Auto-upload when internet / mobile data is restored
    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOnline: true }));
      syncPendingItems();
    };

    const handleOffline = () => {
      setState((prev) => ({ ...prev, isOnline: false }));
    };

    // 2. Auto-upload when user unlocks screen or switches back to tab with internet
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        syncPendingItems();
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 3. Periodic 15s heartbeat to auto-upload queued items whenever online
    const interval = setInterval(() => {
      if (navigator.onLine && !isSyncingRef.current) {
        getPendingReports().then((r) => {
          getPendingValidations().then((v) => {
            if (r.length + v.length > 0) {
              syncPendingItems();
            }
          });
        });
      }
    }, 15000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [refreshPendingCount, syncPendingItems]);

  return {
    ...state,
    refreshPendingCount,
    syncPendingItems,
  };
}
