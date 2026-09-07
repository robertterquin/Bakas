import React, { useState, useEffect, useCallback } from 'react';
import NumberFlow from '@number-flow/react';
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 text-zinc-100 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-black border border-zinc-800 text-white">
              <HazardIcon category={hazard.category} size={20} />
            </div>
            <div>
              <h2 id="hazard-detail-title" className="text-base font-bold text-white leading-tight">
                {categoryMeta.name}
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono mt-0.5">
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
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Civic Verification Badge with NumberFlow Vouch Counter */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800 text-xs">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-black border border-zinc-800 text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-zinc-200">
                Verified Civic Trace
              </div>
              <div className="text-[10px] text-zinc-500 font-mono">
                ID: {hazard.id.substring(0, 8)}... • Community Reported
              </div>
            </div>
          </div>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-black border border-zinc-800 text-zinc-300 font-mono font-semibold flex items-center gap-1">
            <NumberFlow value={hazard.upvotes} /> {hazard.upvotes === 1 ? 'vouch' : 'vouches'}
          </span>
        </div>

        {/* Resolved badge if marked */}
        {hazard.isResolved && (
          <div className="p-3 rounded-2xl bg-zinc-900/90 border border-white/20 text-xs text-white flex items-center justify-between shadow-[0_0_20px_rgba(255,255,255,0.06)]">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center shadow-sm shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-bold text-white block">Marked as Cleared</span>
                <span className="text-[10px] text-zinc-400">Confirmed by 3+ commuters • Auto-decaying in ~2h</span>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-black border border-zinc-700 text-zinc-300 font-mono font-bold">
              Resolved
            </span>
          </div>
        )}

        {/* Details Note */}
        {hazard.description && (
          <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
            {hazard.description}
          </p>
        )}

        {/* Address / Location Bar */}
        <div className="flex items-center justify-between text-xs text-zinc-400 font-mono bg-zinc-900/40 px-3 py-2 rounded-xl border border-zinc-800">
          <span className="truncate">{hazard.address || `${hazard.lat.toFixed(5)}, ${hazard.lng.toFixed(5)}`}</span>
          <button
            type="button"
            onClick={handleCopyCoords}
            className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 ml-2"
            title="Copy coordinates"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action Buttons with Dynamic NumberFlow Rolling Digits */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleUpvote}
            disabled={isUpvoting || hasUpvoted || hazard.isResolved}
            className={`h-11 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              hazard.isResolved || hasUpvoted
                ? 'bg-zinc-900 border-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-white hover:bg-zinc-200 text-black border-white shadow-md'
            }`}
          >
            {isUpvoting ? (
              <LoadingSpinner variant="ring" size={15} className="text-black" />
            ) : (
              <ThumbsUp className="w-3.5 h-3.5" />
            )}
            <span className="flex items-center gap-0.5">
              <span>{hasUpvoted ? 'Upvoted (' : 'Still Here (+'}<NumberFlow value={hazard.upvotes} />{')'}</span>
            </span>
          </button>

          <button
            type="button"
            onClick={handleResolve}
            disabled={isResolving || hasResolved || hazard.isResolved}
            className={`h-11 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              hazard.isResolved
                ? 'bg-zinc-950 border-zinc-800 text-zinc-500 cursor-not-allowed'
                : hasResolved
                ? 'bg-zinc-900 border-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-800 hover:border-zinc-600 hover:text-white'
            }`}
          >
            {isResolving ? (
              <LoadingSpinner variant="ring" size={15} className="text-white" />
            ) : (
              <CheckCircle2 className={`w-3.5 h-3.5 ${hazard.isResolved ? 'text-zinc-600' : 'text-zinc-400'}`} />
            )}
            <span>{hazard.isResolved ? 'Cleared ✓' : hasResolved ? 'Flagged Fixed' : 'Mark Cleared'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
