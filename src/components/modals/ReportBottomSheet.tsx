import React, { useState, useEffect, useCallback } from 'react';
import { X, AlertTriangle, MapPin } from 'lucide-react';
import { HazardCategory, HazardSeverity, HazardPayload, Hazard, Coordinates } from '../../types/hazard';
import { HazardIcon } from '../ui/HazardIcon';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface ReportBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  targetCoords: Coordinates;
  isCustomLocation?: boolean;
  onSubmit: (payload: HazardPayload) => Promise<void>;
  checkNearbyDuplicate: (lat: number, lng: number, category: HazardCategory) => Hazard | null;
  onSelectExisting: (hazardId: string) => void;
}

const CATEGORY_ITEMS: { id: HazardCategory; name: string; tagalog: string }[] = [
  { id: 'pothole', name: 'Pothole / Manhole', tagalog: 'Butas / Lubak' },
  { id: 'clogged_drainage', name: 'Flooding / Drainage', tagalog: 'Baha / Kanal' },
  { id: 'road_obstruction', name: 'Road Obstruction', tagalog: 'Harang sa Daan' },
  { id: 'dark_street', name: 'Dark Street', tagalog: 'Madilim' },
];

export const ReportBottomSheet: React.FC<ReportBottomSheetProps> = ({
  isOpen,
  onClose,
  targetCoords,
  isCustomLocation,
  onSubmit,
  checkNearbyDuplicate,
  onSelectExisting,
}) => {
  const [category, setCategory] = useState<HazardCategory>('pothole');
  const [severity, setSeverity] = useState<HazardSeverity>('high');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [duplicateWarning, setDuplicateWarning] = useState<Hazard | null>(null);

  useEffect(() => {
    if (isOpen) {
      const dup = checkNearbyDuplicate(targetCoords.lat, targetCoords.lng, category);
      setDuplicateWarning(dup);
    }
  }, [isOpen, category, targetCoords, checkNearbyDuplicate]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        category,
        severity,
        lat: targetCoords.lat,
        lng: targetCoords.lng,
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 text-zinc-100 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div>
            <h2 id="report-hazard-title" className="text-base font-bold text-white">
              Report Road Hazard
            </h2>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-zinc-300" />
              <span>{isCustomLocation ? 'Pinned Location' : 'GPS Location'}:</span>
              <span className="text-white">
                {targetCoords.lat.toFixed(5)}, {targetCoords.lng.toFixed(5)}
              </span>
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

        {/* 15m Duplicate Alert - Monochrome */}
        {duplicateWarning && (
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-white shrink-0" />
              <span>Similar hazard nearby within 15m</span>
            </div>
            <button
              type="button"
              onClick={() => {
                onSelectExisting(duplicateWarning.id);
                onClose();
              }}
              className="font-bold underline text-white hover:text-zinc-300 shrink-0"
            >
              View Pin
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pure Lucide Category Picker */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-2">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORY_ITEMS.map((item) => {
                const isSelected = category === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCategory(item.id)}
                    aria-pressed={isSelected}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-white text-black border-white font-bold shadow-md'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-600'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${isSelected ? 'bg-black text-white' : 'bg-black border border-zinc-800 text-zinc-400'}`}>
                      <HazardIcon category={item.id} size={16} className={isSelected ? 'text-white' : 'text-zinc-400'} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold leading-tight">{item.name}</div>
                      <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-zinc-700' : 'text-zinc-500'}`}>
                        {item.tagalog}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Severity Picker */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-2">Severity</label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as HazardSeverity[]).map((sev) => {
                const isSelected = severity === sev;
                const label = sev === 'low' ? 'Low' : sev === 'medium' ? 'Medium' : 'High';
                return (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSeverity(sev)}
                    aria-pressed={isSelected}
                    className={`py-2.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-white text-black border-white font-bold shadow-md'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Short Note */}
          <div>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional short note (e.g. inner lane)"
              maxLength={100}
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-sm shadow-xl transition-all active:scale-98 disabled:opacity-75 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner variant="ring" size={18} className="text-black" />
                <span>Broadcasting to Radar...</span>
              </>
            ) : (
              <span>Drop Hazard Trace</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
