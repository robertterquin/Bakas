import React, { useState } from 'react';
import {
  X,
  ThumbsUp,
  CheckCircle2,
  Share2,
  Navigation,
  Copy,
  AlertCircle,
  Droplets,
  ShieldAlert,
  Moon,
} from 'lucide-react';
import { Hazard, UserLocation } from '../../types/hazard';
import {
  HAZARD_CATEGORIES,
  HAZARD_SEVERITIES,
  calculateDistanceInMeters,
  formatDistance,
  formatTtlRemaining,
  hasDeviceVoted,
} from '../../lib/domain-rules';

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

  if (!hazard) return null;

  const categoryMeta = HAZARD_CATEGORIES[hazard.category];
  const severityMeta = HAZARD_SEVERITIES[hazard.severity];
  const distanceMeters = calculateDistanceInMeters(userLocation.lat, userLocation.lng, hazard.lat, hazard.lng);
  const ttl = formatTtlRemaining(hazard.expiresAt);

  const hasUpvoted = hasDeviceVoted(hazard.id, 'upvote');
  const hasResolved = hasDeviceVoted(hazard.id, 'resolve');

  let CategoryIcon = AlertCircle;
  if (hazard.category === 'clogged_drainage') CategoryIcon = Droplets;
  if (hazard.category === 'road_obstruction') CategoryIcon = ShieldAlert;
  if (hazard.category === 'dark_street') CategoryIcon = Moon;

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

  const handleShare = () => {
    const url = `${window.location.origin}/#hazard-${hazard.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      onShowToast('Hazard link copied to clipboard!');
    }
  };

  const handleCopyCoords = () => {
    const coordsStr = `${hazard.lat.toFixed(6)}, ${hazard.lng.toFixed(6)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(coordsStr);
      onShowToast(`Coordinates copied: ${coordsStr}`);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="hazard-detail-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
    >
      <div className="w-full max-w-md max-h-[85vh] bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-sky-400">
              <CategoryIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 id="hazard-detail-title" className="text-base font-bold text-slate-100 leading-tight">
                {categoryMeta.name}
              </h2>
              <span className="text-xs text-slate-400">{categoryMeta.tagalogName}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="p-2 -mr-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Resolved Warning if soft-resolved */}
          {hazard.isResolved && (
            <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Marked as Resolved by community. Will decay shortly.</span>
            </div>
          )}

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700/70 text-center">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Severity</div>
              <div className="text-xs font-bold mt-0.5 text-slate-100">{severityMeta.label}</div>
            </div>

            <div className="p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700/70 text-center">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Distance</div>
              <div className="text-xs font-bold mt-0.5 text-sky-400 font-mono">
                {formatDistance(distanceMeters)}
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700/70 text-center">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Decay TTL</div>
              <div className="text-xs font-bold mt-0.5 text-amber-300 font-mono">
                {ttl.label}
              </div>
            </div>
          </div>

          {/* Title & Description */}
          {hazard.title && (
            <div>
              <h3 className="text-sm font-semibold text-slate-100">{hazard.title}</h3>
              {hazard.description && (
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{hazard.description}</p>
              )}
            </div>
          )}

          {/* Address / Location Bar */}
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <Navigation className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate text-slate-300 font-mono text-[11px]">
                {hazard.address || `${hazard.lat.toFixed(5)}, ${hazard.lng.toFixed(5)}`}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyCoords}
              aria-label="Copy coordinates"
              title="Copy Coordinates"
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Community Validation Actions */}
          <div className="pt-2 space-y-2.5">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Community Verification
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Upvote Button */}
              <button
                type="button"
                onClick={handleUpvote}
                disabled={isUpvoting || hasUpvoted}
                className={`h-12 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all focus-visible:ring-2 focus-visible:ring-sky-400 ${
                  hasUpvoted
                    ? 'bg-slate-800 border-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-white hover:bg-slate-100 text-slate-950 border-white shadow-[0_0_12px_rgba(255,255,255,0.2)]'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{hasUpvoted ? `Upvoted (${hazard.upvotes})` : `Still Here (+${hazard.upvotes})`}</span>
              </button>

              {/* Resolved Button */}
              <button
                type="button"
                onClick={handleResolve}
                disabled={isResolving || hasResolved}
                className={`h-12 rounded-2xl border font-semibold text-xs flex items-center justify-center gap-2 transition-all focus-visible:ring-2 focus-visible:ring-sky-400 ${
                  hasResolved
                    ? 'bg-slate-800 border-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700 hover:border-slate-500'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{hasResolved ? 'Flagged Fixed' : 'Mark Cleared'}</span>
              </button>
            </div>

            {/* Share / Copy link button */}
            <button
              type="button"
              onClick={handleShare}
              className="w-full py-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Trace Link</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
