import React, { useState, useEffect, useCallback, useRef } from 'react';
import NumberFlow from '@number-flow/react';
import { X, ThumbsUp, CheckCircle2, Copy, ShieldCheck, Camera, Waves, Image as ImageIcon } from 'lucide-react';
import { Hazard, UserLocation, FloodPassability } from '../../types/hazard';
import {
  HAZARD_CATEGORIES,
  PASSABILITY_CONFIG,
  formatTtlRemaining,
  hasDeviceVoted,
  getDevicePassabilityVote,
} from '../../utils/domain-rules';
import { calculateDistanceInMeters, formatDistance } from '../../services/geo.service';
import { compressImageFile } from '../../utils/image.utils';
import { HazardIcon } from '../ui/HazardIcon';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { BeforeAfterSlider } from '../ui/BeforeAfterSlider';

interface HazardDetailBottomSheetProps {
  hazard: Hazard | null;
  userLocation: UserLocation;
  onClose: () => void;
  onUpvote: (id: string) => Promise<{ success: boolean; message: string }>;
  onResolve: (id: string, proofImageUrl?: string) => Promise<{ success: boolean; message: string }>;
  onVotePassability?: (id: string, status: FloodPassability) => Promise<{ success: boolean; message: string }>;
  onShowToast: (message: string) => void;
}

export const HazardDetailBottomSheet: React.FC<HazardDetailBottomSheetProps> = ({
  hazard,
  userLocation,
  onClose,
  onUpvote,
  onResolve,
  onVotePassability,
  onShowToast,
}) => {
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [isVotingPassability, setIsVotingPassability] = useState(false);
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [isCompressingProof, setIsCompressingProof] = useState(false);
  const proofInputRef = useRef<HTMLInputElement | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (hazard) {
      setProofImage(null);
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
  const currentDevicePassability = getDevicePassabilityVote(hazard.id);

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
      const res = await onResolve(hazard.id, proofImage || undefined);
      onShowToast(res.message);
    } finally {
      setIsResolving(false);
    }
  };

  const handlePassabilityVote = async (status: FloodPassability) => {
    if (!onVotePassability || isVotingPassability) return;
    setIsVotingPassability(true);
    try {
      const res = await onVotePassability(hazard.id, status);
      onShowToast(res.message);
    } finally {
      setIsVotingPassability(false);
    }
  };

  const handleProofFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressingProof(true);
    try {
      const compressed = await compressImageFile(file, 1024, 0.75);
      setProofImage(compressed);
      onShowToast('Cleared proof photo attached.');
    } catch {
      onShowToast('Failed to process image. Please try again.');
    } finally {
      setIsCompressingProof(false);
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

        {/* Interactive Photo Comparison or Evidence Card */}
        {hazard.imageUrl && hazard.resolvedImageUrl ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1 text-[11px] font-mono text-zinc-400">
              <span className="flex items-center gap-1.5 text-zinc-300 font-semibold">
                <ImageIcon className="w-3.5 h-3.5" /> Resolution Verification Slider
              </span>
              <span>Split View</span>
            </div>
            <BeforeAfterSlider
              beforeImage={hazard.imageUrl}
              afterImage={hazard.resolvedImageUrl}
              beforeLabel="REPORTED"
              afterLabel="RESOLVED"
            />
          </div>
        ) : hazard.imageUrl ? (
          <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950">
            <img src={hazard.imageUrl} alt="Hazard site photo" className="w-full h-full object-cover" />
            <div className="absolute top-2.5 left-2.5">
              <span className="px-2 py-0.5 rounded-full bg-black/80 border border-zinc-700 text-[10px] font-mono font-bold tracking-wider text-zinc-300 uppercase backdrop-blur-md">
                REPORTED CONDITION
              </span>
            </div>
          </div>
        ) : hazard.resolvedImageUrl ? (
          <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950">
            <img src={hazard.resolvedImageUrl} alt="Cleared proof photo" className="w-full h-full object-cover" />
            <div className="absolute top-2.5 right-2.5">
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-mono font-bold tracking-wider text-emerald-400 uppercase backdrop-blur-md">
                ✓ CLEARED PROOF
              </span>
            </div>
          </div>
        ) : null}

        {/* Live Crowdsourced Flood Passability Assessment */}
        {hazard.category === 'clogged_drainage' && (
          <div className="p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Waves className="w-4 h-4 text-cyan-400" />
                <span>Live Passability Consensus</span>
              </div>
              {hazard.passability && (
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${PASSABILITY_CONFIG[hazard.passability].colorClass}`}>
                  {PASSABILITY_CONFIG[hazard.passability].label}
                </span>
              )}
            </div>

            {/* Depth & Vehicle Advice */}
            <div className="text-[11px] text-zinc-300 bg-black/50 p-2.5 rounded-xl border border-zinc-800/80 flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">
                  {hazard.passability ? PASSABILITY_CONFIG[hazard.passability].depthLabel : 'Observation Needed'}
                </span>
                <span className="text-[10px] text-zinc-400">
                  {hazard.passability ? PASSABILITY_CONFIG[hazard.passability].description : 'Tap your observation below to update community telemetry.'}
                </span>
              </div>
            </div>

            {/* 1-Click Commuter Observation Buttons */}
            <div className="space-y-1">
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider px-0.5">
                Log your vehicle observation:
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {(['passable_all', 'passable_high_clearance', 'impassable'] as FloodPassability[]).map((status) => {
                  const config = PASSABILITY_CONFIG[status];
                  const isVoted = currentDevicePassability === status;
                  const voteCount = hazard.passabilityVotes?.[status] || 0;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => handlePassabilityVote(status)}
                      disabled={isVotingPassability}
                      className={`p-2 rounded-xl border text-left transition-all flex flex-col justify-between min-h-[58px] ${
                        isVoted
                          ? 'bg-zinc-800 border-white text-white shadow-sm'
                          : 'bg-black/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.dotColor }} />
                        <span className="text-[10px] font-mono text-zinc-500 font-semibold">
                          <NumberFlow value={voteCount} />
                        </span>
                      </div>
                      <div className="text-[10px] font-bold leading-tight mt-1 truncate">
                        {status === 'passable_all' ? 'All Vehicles' : status === 'passable_high_clearance' ? '4x4 / SUVs' : 'Impassable'}
                      </div>
                      <div className="text-[9px] text-zinc-500 truncate">
                        {status === 'passable_all' ? 'Ankle deep' : status === 'passable_high_clearance' ? 'Knee deep' : 'Submerged'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
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

        {/* Optional Proof Photo for Resolution */}
        {!hazard.isResolved && !hasResolved && (
          <div className="flex items-center justify-between px-1 text-xs">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={proofInputRef}
              onChange={handleProofFileChange}
              className="hidden"
            />
            {proofImage ? (
              <div className="flex items-center justify-between w-full p-2 rounded-xl bg-zinc-900 border border-emerald-500/40 text-emerald-400 text-xs">
                <span className="flex items-center gap-1.5 font-mono text-[11px]">
                  ✓ Proof photo ready to submit
                </span>
                <button
                  type="button"
                  onClick={() => setProofImage(null)}
                  className="text-zinc-400 hover:text-white p-1"
                  title="Remove photo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => proofInputRef.current?.click()}
                disabled={isCompressingProof}
                className="w-full py-2 px-3 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white text-xs flex items-center justify-center gap-2 transition-colors font-sans"
              >
                {isCompressingProof ? (
                  <LoadingSpinner variant="ring" size={14} className="text-white" />
                ) : (
                  <Camera className="w-3.5 h-3.5" />
                )}
                <span>Attach Cleared Road Photo Proof (Optional)</span>
              </button>
            )}
          </div>
        )}

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
