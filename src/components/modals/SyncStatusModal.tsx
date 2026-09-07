import React, { useState, useEffect, useCallback } from 'react';
import { X, CheckCircle, Wifi, WifiOff, Database, Trash2 } from 'lucide-react';
import { Hazard, ValidationAction } from '../../types/hazard';
import {
  getPendingReports,
  getPendingValidations,
  removePendingReport,
  removePendingValidation,
  clearCachedHazards,
  clearPendingQueue,
} from '../../services/offline.service';
import { LoadingSpinner } from '../ui/LoadingSpinner';

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
  const [isLoadingQueue, setIsLoadingQueue] = useState<boolean>(false);

  const loadQueue = useCallback(async () => {
    setIsLoadingQueue(true);
    try {
      const [reports, vals] = await Promise.all([getPendingReports(), getPendingValidations()]);
      setPendingReports(reports);
      setPendingValidations(vals);
    } catch (err) {
      console.warn('Failed to load pending queue:', err);
    } finally {
      setIsLoadingQueue(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadQueue();
    }
  }, [isOpen, loadQueue]);

  // Accessibility: Handle escape key to close dialog
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const totalPending = pendingReports.length + pendingValidations.length;

  const handleManualSync = async () => {
    if (!isOnline) {
      onShowToast('Cannot sync while offline. Connect to network first.');
      return;
    }
    await onTriggerSync();
    await loadQueue();
    onShowToast('Sync complete! All pushed items removed from queue.');
  };

  const handleRemoveReport = async (id: string) => {
    await removePendingReport(id);
    setPendingReports((prev) => prev.filter((r) => r.id !== id));
    onShowToast('Report removed from offline queue.');
  };

  const handleRemoveValidation = async (id: string) => {
    await removePendingValidation(id);
    setPendingValidations((prev) => prev.filter((v) => v.id !== id));
    onShowToast('Action removed from offline queue.');
  };

  const handleFlushQueue = async () => {
    await clearPendingQueue();
    setPendingReports([]);
    setPendingValidations([]);
    onShowToast('Offline queue flushed cleanly.');
  };

  const handleClearCache = async () => {
    await clearCachedHazards();
    onShowToast('Local map cache cleared.');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sync-status-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md max-h-[85vh] bg-zinc-950 border border-zinc-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="p-4 px-6 flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl ${
                isOnline
                  ? 'bg-black text-white border border-zinc-800'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
              }`}
            >
              {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            </div>
            <div>
              <h2 id="sync-status-title" className="text-base font-bold text-white">
                Offline & Sync Engine
              </h2>
              <span className="text-xs text-zinc-400">
                {isOnline ? 'Connected to Cloud' : 'Offline Mode (IndexedDB Active)'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sync engine status"
            className="p-2 -mr-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-900 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Status banner */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between transition-colors ${
              totalPending === 0
                ? 'bg-black border-zinc-800 text-white'
                : 'bg-black border-zinc-700 text-zinc-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-white shrink-0" />
              <div>
                <div className="font-bold text-white text-sm">
                  {totalPending === 0
                    ? 'All Traces Synchronized'
                    : `${totalPending} Pending Offline Action${totalPending > 1 ? 's' : ''}`}
                </div>
                <div className="text-zinc-400 text-[11px]">
                  {totalPending === 0
                    ? 'Your local IndexedDB is completely up to date.'
                    : 'Changes stored safely in local database.'}
                </div>
              </div>
            </div>

            {totalPending === 0 && <CheckCircle className="w-5 h-5 text-white shrink-0" />}
          </div>

          {/* Queue items listing */}
          {isLoadingQueue ? (
            <div className="text-center py-6 text-zinc-500">
              <LoadingSpinner variant="dots-ring" size={24} className="mx-auto mb-2 text-white" />
              <span>Inspecting local storage queue...</span>
            </div>
          ) : totalPending > 0 ? (
            <div className="space-y-2">
              <span className="font-semibold text-zinc-400 uppercase tracking-wider text-[10px] block px-1">
                Pending Sync Queue
              </span>

              {/* Pending reports */}
              {pendingReports.map((report) => (
                <div
                  key={report.id}
                  className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-white capitalize truncate">
                      {report.category.replace('_', ' ')} (New Pin)
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono truncate">
                      {report.lat.toFixed(4)}, {report.lng.toFixed(4)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-black text-white border border-zinc-700 font-mono font-semibold">
                      Queued
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveReport(report.id)}
                      title="Remove from queue"
                      className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Pending validations */}
              {pendingValidations.map((val) => (
                <div
                  key={val.id}
                  className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-white capitalize truncate">
                      {val.actionType === 'upvote' ? 'Upvote / Confirmation' : 'Resolve Vote'}
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono truncate">
                      Target Pin: {val.hazardId.substring(0, 8)}...
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-black text-white border border-zinc-700 font-mono font-semibold">
                      Queued
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveValidation(val.id)}
                      title="Remove from queue"
                      className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 text-zinc-400 text-center space-y-1">
              <p className="font-semibold text-zinc-200">Ready for offline journeys.</p>
              <p className="text-[11px]">
                Any reports you drop in cellular dead zones (tunnels, underpasses) will automatically queue here and sync
                as soon as you regain signal.
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing || !isOnline || totalPending === 0}
              className="w-full py-3.5 rounded-2xl bg-white text-black font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[48px]"
            >
              {isSyncing ? (
                <>
                  <LoadingSpinner variant="dual-arc" size={16} className="text-black" />
                  <span>Syncing to Supabase...</span>
                </>
              ) : (
                <span>{totalPending > 0 ? `Force Sync Queue (${totalPending})` : 'Force Sync Check'}</span>
              )}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleFlushQueue}
                disabled={totalPending === 0}
                className="py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors text-[11px] disabled:opacity-40"
              >
                Flush Queue
              </button>
              <button
                type="button"
                onClick={handleClearCache}
                className="py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors text-[11px]"
              >
                Clear Map Cache
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
