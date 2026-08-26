import React, { useState, useEffect, useCallback } from 'react';
import { X, RefreshCw, CheckCircle, Wifi, WifiOff, Database } from 'lucide-react';
import { Hazard, ValidationAction } from '../../types/hazard';
import { getPendingReports, getPendingValidations, clearCachedHazards } from '../../lib/offline-storage';

interface SyncStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOnline: boolean;
  isSyncing: boolean;
  onTriggerSync: () => Promise<void>;
  onShowToast: (msg: string) => void;
}

export const SyncStatusModal: React.FC<SyncStatusModalProps> = ({
  isOpen,
  onClose,
  isOnline,
  isSyncing,
  onTriggerSync,
  onShowToast,
}) => {
  const [pendingReports, setPendingReports] = useState<Hazard[]>([]);
  const [pendingValidations, setPendingValidations] = useState<ValidationAction[]>([]);
  const [isLoadingQueue, setIsLoadingQueue] = useState<boolean>(true);

  // Escape key accessibility
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  const loadQueue = async () => {
    setIsLoadingQueue(true);
    try {
      const reports = await getPendingReports();
      const validations = await getPendingValidations();
      setPendingReports(reports);
      setPendingValidations(validations);
    } finally {
      setIsLoadingQueue(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadQueue();
    }
  }, [isOpen, isSyncing]);

  if (!isOpen) return null;

  const totalPending = pendingReports.length + pendingValidations.length;

  const handleManualSync = async () => {
    if (!isOnline) {
      onShowToast('Cannot sync while offline. Reconnect to cellular data.');
      return;
    }
    await onTriggerSync();
    await loadQueue();
    onShowToast('Sync complete!');
  };

  const handleClearCache = async () => {
    await clearCachedHazards();
    onShowToast('Local map cache cleared.');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sync-manager-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 text-slate-100 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-sky-400" />
            <h2 id="sync-manager-title" className="text-base font-bold tracking-tight">
              Offline Sync Manager
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sync manager"
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-sky-400 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Network Status Card */}
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between ${
            isOnline
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
              : 'bg-amber-950/40 border-amber-500/50 text-amber-300'
          }`}
        >
          <div className="flex items-center gap-3">
            {isOnline ? (
              <Wifi className="w-5 h-5 text-emerald-400" />
            ) : (
              <WifiOff className="w-5 h-5 text-amber-400 animate-pulse" />
            )}
            <div>
              <div className="font-bold text-sm">{isOnline ? 'Online & Connected' : 'Offline Mode Active'}</div>
              <div className="text-xs opacity-80">
                {isOnline
                  ? 'All traces stream directly to PostGIS.'
                  : 'Traces stored in IndexedDB; will auto-sync on signal restore.'}
              </div>
            </div>
          </div>
        </div>

        {/* Pending Queue List */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            <span>Pending Local Queue</span>
            <span className="font-mono text-slate-200">
              {totalPending} {totalPending === 1 ? 'item' : 'items'}
            </span>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2 rounded-2xl bg-slate-950/60 p-3 border border-slate-800">
            {isLoadingQueue ? (
              <div className="text-xs text-slate-500 text-center py-4">Checking IndexedDB queue...</div>
            ) : totalPending === 0 ? (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <CheckCircle className="w-6 h-6 text-emerald-400 mb-1" />
                <span className="text-xs font-medium text-slate-300">All local data synchronized</span>
                <span className="text-[10px] text-slate-500">No pending reports in dead-zone queue</span>
              </div>
            ) : (
              <>
                {pendingReports.map((r) => (
                  <div
                    key={r.id}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-200 capitalize">
                        {r.category.replace('_', ' ')} • {r.severity}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {r.lat.toFixed(4)}, {r.lng.toFixed(4)}
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700 font-mono">
                      Queued
                    </span>
                  </div>
                ))}
                {pendingValidations.map((v) => (
                  <div
                    key={v.id}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-200 capitalize">
                        Action: {v.actionType}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">ID: {v.hazardId.substring(0, 8)}...</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700 font-mono">
                      Vote Queued
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Sync CTA */}
        <div className="pt-2 space-y-2">
          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing || totalPending === 0 || !isOnline}
            className="w-full h-12 rounded-2xl bg-white hover:bg-slate-100 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md min-h-[48px] focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronizing...' : 'Force Sync Now'}</span>
          </button>

          <button
            type="button"
            onClick={handleClearCache}
            className="w-full py-3 rounded-xl text-slate-400 hover:text-slate-200 text-xs text-center transition-colors min-h-[40px] focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            Clear Cached Tile Data
          </button>
        </div>
      </div>
    </div>
  );
};
