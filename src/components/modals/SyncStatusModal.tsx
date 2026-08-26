import React, { useState, useEffect, useCallback } from 'react';
import { X, CheckCircle, Wifi, WifiOff, Database } from 'lucide-react';
import { Hazard, ValidationAction } from '../../types/hazard';
import { getPendingReports, getPendingValidations, clearCachedHazards } from '../../services/offline.service';
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

  if (!isOpen) return null;

  const totalPending = pendingReports.length + pendingValidations.length;

  const handleManualSync = async () => {
    if (!isOnline) {
      onShowToast('Cannot sync while offline. Connect to network first.');
      return;
    }
    await onTriggerSync();
    await loadQueue();
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md max-h-[85vh] bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isOnline ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' : 'bg-amber-950 text-amber-400 border border-amber-800/60'}`}>
              {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            </div>
            <div>
              <h2 id="sync-status-title" className="text-base font-bold text-slate-100">
                Offline & Sync Engine
              </h2>
              <span className="text-xs text-slate-400">
                {isOnline ? 'Connected to Cloud' : 'Offline Mode (IndexedDB Active)'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sync modal"
            className="p-2 -mr-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-sky-400 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Status summary */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-sky-400 shrink-0" />
              <div>
                <div className="font-bold text-slate-200 text-sm">
                  {totalPending === 0 ? 'All Traces Synchronized' : `${totalPending} Pending Offline Action${totalPending > 1 ? 's' : ''}`}
                </div>
                <div className="text-slate-400 text-[11px]">
                  {totalPending === 0
                    ? 'Your local IndexedDB is up to date.'
                    : 'Changes stored safely in local database.'}
                </div>
              </div>
            </div>

            {totalPending === 0 && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />}
          </div>

          {/* Queue items listing */}
          {isLoadingQueue ? (
            <div className="text-center py-6 text-slate-500">
              <LoadingSpinner variant="dots-ring" size={24} className="mx-auto mb-2 text-sky-400" />
              <span>Inspecting local storage queue...</span>
            </div>
          ) : totalPending > 0 ? (
            <div className="space-y-2">
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] block px-1">
                Pending Sync Queue
              </span>

              {/* Pending reports */}
              {pendingReports.map((report) => (
                <div
                  key={report.id}
                  className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-slate-200 capitalize">
                      {report.category.replace('_', ' ')} (New Pin)
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {report.lat.toFixed(4)}, {report.lng.toFixed(4)}
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/80 font-mono">
                    Queued
                  </span>
                </div>
              ))}

              {/* Pending validations */}
              {pendingValidations.map((val) => (
                <div
                  key={val.id}
                  className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-slate-200 capitalize">
                      {val.actionType === 'upvote' ? 'Upvote / Confirmation' : 'Resolve Vote'}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Target Pin: {val.hazardId.substring(0, 8)}...
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/80 font-mono">
                    Queued
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60 text-slate-400 text-center space-y-1">
              <p className="font-semibold text-slate-300">Ready for offline journeys.</p>
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
              className="w-full py-3.5 rounded-2xl bg-white text-slate-950 font-bold hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[48px] focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              {isSyncing ? (
                <>
                  <LoadingSpinner variant="dual-arc" size={16} className="text-slate-950" />
                  <span>Syncing to Supabase...</span>
                </>
              ) : (
                <span>{totalPending > 0 ? `Force Sync Queue (${totalPending})` : 'Force Sync Check'}</span>
              )}
            </button>

            <button
              type="button"
              onClick={handleClearCache}
              className="w-full py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors text-[11px]"
            >
              Clear Local Map Cache
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
