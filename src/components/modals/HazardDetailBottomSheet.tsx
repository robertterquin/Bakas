import React, { useState, useEffect, useCallback } from 'react';
import { X, ThumbsUp, CheckCircle2, Copy, ShieldCheck } from 'lucide-react';
import { Hazard, UserLocation } from '../../types/hazard';
import {
  HAZARD_CATEGORIES,
  formatTtlRemaining,
  hasDeviceVoted,
} from '../../utils/domain-rules';
import { calculateDistanceInMeters, formatDistance } from '../../services/geo.service';
import { HazardIcon } from '../ui/HazardIcon';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface HazardDetailBottomSheetProps {
  hazard: Hazard | null;
  userLocation: UserLocation;
  onClose: () => void;
  onUpvote: (id: string) => Promise<{ success: boolean; message: string }>;
  onResolve: (id: string) => Promise<{ success: boolean; message: string }>;
  onShowToast: (message: string) => void;
}

export const HazardDetailBottomSheet: React.FC<HazardDetailBottomSheetProps> = ({
  hazard,
  userLocation,
  onClose,
  onUpvote,
  onResolve,
  onShowToast,
}) => {
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (hazard) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [hazard, handleKeyDown]);

  if (!hazard) return null;

  const categoryMeta = HAZARD_CATEGORIES[hazard.category];
  const distanceMeters = calculateDistanceInMeters(userLocation.lat, userLocation.lng, hazard.lat, hazard.lng);
  const ttl = formatTtlRemaining(hazard.expiresAt);
  const hasUpvoted = hasDeviceVoted(hazard.id, 'upvote');
  const hasResolved = hasDeviceVoted(hazard.id, 'resolve');

  const handleUpvote = async () => {
    setIsUpvoting(true);
    try {
      const res = await onUpvote(hazard.id);
      onShowToast(res.message);
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleResolve = async () => {
    setIsResolving(true);
    try {
      const res = await onResolve(hazard.id);
      onShowToast(res.message);
    } finally {
      setIsResolving(false);
    }
  };

  const handleCopyCoords = () => {
    const coordsStr = `${hazard.lat.toFixed(5)}, ${hazard.lng.toFixed(5)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(coordsStr);
      onShowToast(`Copied coordinates: ${coordsStr}`);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="hazard-detail-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 text-slate-100 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-white">
              <HazardIcon category={hazard.category} size={20} />
            </div>
            <div>
              <h2 id="hazard-detail-title" className="text-base font-bold text-white leading-tight">
                {categoryMeta.name}
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                <span className="text-white font-semibold">{formatDistance(distanceMeters)}</span>
                <span>•</span>
                <span className="capitalize">{hazard.severity} Severity</span>
                <span>•</span>
                <span>{ttl.label}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Civic Verification Badge with Lucide ShieldCheck */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-200">
                Verified Civic Trace
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                ID: {hazard.id.substring(0, 8)}... • Community Reported
              </div>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
            {hazard.upvotes} {hazard.upvotes === 1 ? 'vouch' : 'vouches'}
          </span>
        </div>

        {/* Resolved badge if marked */}
        {hazard.isResolved && (
          <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Marked as Cleared by community</span>
          </div>
        )}

        {/* Details Note */}
        {hazard.description && (
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            {hazard.description}
          </p>
        )}

        {/* Address / Location Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono bg-slate-950/40 px-3 py-2 rounded-xl border border-slate-800">
          <span className="truncate">{hazard.address || `${hazard.lat.toFixed(5)}, ${hazard.lng.toFixed(5)}`}</span>
          <button
            type="button"
            onClick={handleCopyCoords}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 ml-2"
            title="Copy coordinates"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action Buttons with Loading Spinners */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleUpvote}
            disabled={isUpvoting || hasUpvoted}
            className={`h-11 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              hasUpvoted
                ? 'bg-slate-800 border-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-white hover:bg-slate-100 text-slate-950 border-white shadow-md'
            }`}
          >
            {isUpvoting ? (
              <LoadingSpinner variant="ring" size={15} className="text-slate-950" />
            ) : (
              <ThumbsUp className="w-3.5 h-3.5" />
            )}
            <span>{hasUpvoted ? `Upvoted (${hazard.upvotes})` : `Still Here (+${hazard.upvotes})`}</span>
          </button>

          <button
            type="button"
            onClick={handleResolve}
            disabled={isResolving || hasResolved}
            className={`h-11 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              hasResolved
                ? 'bg-slate-800 border-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 hover:border-slate-500'
            }`}
          >
            {isResolving ? (
              <LoadingSpinner variant="ring" size={15} className="text-emerald-400" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>{hasResolved ? 'Flagged Fixed' : 'Mark Cleared'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
