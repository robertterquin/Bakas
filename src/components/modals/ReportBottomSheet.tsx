import React, { useState, useEffect, useCallback } from 'react';
import { X, AlertCircle, Droplets, ShieldAlert, Moon, Check, MapPin, AlertTriangle, ArrowRight } from 'lucide-react';
import { HazardCategory, HazardSeverity, HazardPayload, UserLocation, Hazard } from '../../types/hazard';
import { HAZARD_CATEGORIES, HAZARD_SEVERITIES } from '../../lib/domain-rules';

interface ReportBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: UserLocation;
  onSubmit: (payload: HazardPayload) => Promise<void>;
  checkNearbyDuplicate: (lat: number, lng: number, category: HazardCategory) => Hazard | null;
  onSelectExisting: (hazardId: string) => void;
}

export const ReportBottomSheet: React.FC<ReportBottomSheetProps> = ({
  isOpen,
  onClose,
  userLocation,
  onSubmit,
  checkNearbyDuplicate,
  onSelectExisting,
}) => {
  const [category, setCategory] = useState<HazardCategory>('pothole');
  const [severity, setSeverity] = useState<HazardSeverity>('high');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [duplicateWarning, setDuplicateWarning] = useState<Hazard | null>(null);

  // Check 15m anti-spam duplicate whenever category or location changes
  useEffect(() => {
    if (isOpen) {
      const dup = checkNearbyDuplicate(userLocation.lat, userLocation.lng, category);
      setDuplicateWarning(dup);
    }
  }, [isOpen, category, userLocation, checkNearbyDuplicate]);

  // Keyboard accessibility: Escape key listener
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        category,
        severity,
        lat: userLocation.lat,
        lng: userLocation.lng,
        description: description.trim() || undefined,
      });
      setDescription('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-hazard-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg max-h-[90vh] bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header Handle */}
        <div className="pt-3 pb-2 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
            <h2 id="report-hazard-title" className="text-lg font-bold tracking-tight">
              Report Road Hazard
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close report dialog"
            className="p-2 -mr-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-sky-400 min-w-[48px] min-h-[48px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5">
          {/* 15m Duplicate Warning */}
          {duplicateWarning && (
            <div className="p-3.5 rounded-2xl bg-amber-950/70 border border-amber-500/60 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-semibold text-amber-200">
                  Similar hazard already reported within 15 meters!
                </p>
                <p className="text-amber-300/80">
                  You can upvote the existing report to strengthen its visibility instead of creating a duplicate.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onSelectExisting(duplicateWarning.id);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 font-bold text-amber-300 hover:text-white underline pt-1 focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  <span>View existing hazard trace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* 1. Category 2x2 Grid */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
              1. Hazard Category
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {Object.values(HAZARD_CATEGORIES).map((cat) => {
                const isSelected = category === cat.id;
                let Icon = AlertCircle;
                if (cat.id === 'clogged_drainage') Icon = Droplets;
                if (cat.id === 'road_obstruction') Icon = ShieldAlert;
                if (cat.id === 'dark_street') Icon = Moon;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    aria-pressed={isSelected}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all duration-150 focus-visible:ring-2 focus-visible:ring-sky-400 min-h-[80px] ${
                      isSelected
                        ? 'bg-slate-800 border-white text-white shadow-[0_0_12px_rgba(255,255,255,0.2)]'
                        : 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-xl ${isSelected ? 'bg-white text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <div className="font-bold text-sm leading-snug">{cat.name}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{cat.tagalogName}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Severity Control */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
              2. Severity Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(HAZARD_SEVERITIES).map((sev) => {
                const isSelected = severity === sev.id;
                return (
                  <button
                    key={sev.id}
                    type="button"
                    onClick={() => setSeverity(sev.id)}
                    aria-pressed={isSelected}
                    className={`py-3 px-3 rounded-2xl border text-center transition-all focus-visible:ring-2 focus-visible:ring-sky-400 min-h-[52px] ${
                      isSelected
                        ? 'bg-white text-slate-950 border-white font-bold shadow-[0_0_12px_rgba(255,255,255,0.3)]'
                        : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="text-xs font-bold">{sev.label}</div>
                    <div className={`text-[10px] ${isSelected ? 'text-slate-700' : 'text-slate-400'}`}>
                      {sev.id === 'low' ? 'Caution' : sev.id === 'medium' ? 'Warning' : 'Danger'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location Pin Confirmation Preview */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
              <div>
                <span className="font-semibold text-slate-200">Current Device GPS</span>
                <div className="text-[11px] font-mono text-slate-400">
                  {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)} (±{Math.round(userLocation.accuracy)}m)
                </div>
              </div>
            </div>
            <span className="text-[10px] px-2 py-1 bg-slate-800 text-sky-300 rounded-lg border border-slate-700 font-mono">
              AUTO-PINNED
            </span>
          </div>

          {/* Optional Short Description */}
          <div>
            <label htmlFor="hazard-notes" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Optional Note (Keep it short)
            </label>
            <input
              id="hazard-notes"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Near pedestrian crossing, deep rim crater..."
              maxLength={120}
              className="w-full px-3.5 py-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-white transition-colors"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-base shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-sky-400 min-h-[56px]"
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
            <span>{isSubmitting ? 'Recording Trace...' : 'Drop Hazard Trace (< 5s)'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
