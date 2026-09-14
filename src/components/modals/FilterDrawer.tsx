import React, { useEffect, useCallback } from 'react';
import { X, Check } from 'lucide-react';
import { RadiusFilter, CategoryFilter } from '../../types/hazard';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  radiusFilter: RadiusFilter;
  onChangeRadius: (radius: RadiusFilter) => void;
  activeFilter?: CategoryFilter;
  onChangeCategory?: (category: CategoryFilter) => void;
}

const RADIUS_OPTIONS: { value: RadiusFilter; label: string; sub: string }[] = [
  { value: 0, label: 'Auto Scope', sub: 'Adapts in real-time as you zoom or pan' },
  { value: 1000, label: '1.0 km', sub: 'Walking / Hyperlocal' },
  { value: 5000, label: '5.0 km', sub: 'City Commute (Motorcycle & Car)' },
  { value: 15000, label: '15.0 km', sub: 'Metro Corridor (EDSA, C5, SLEX)' },
  { value: 50000, label: '50.0 km', sub: 'Regional Highway & Province' },
];

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  radiusFilter,
  onChangeRadius,
}) => {
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="radar-filters-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 text-zinc-100 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div>
            <h2 id="radar-filters-title" className="text-base font-bold tracking-tight text-white font-sans">
              Radar Telemetry Scope
            </h2>
            <p className="text-[11px] text-zinc-400">Select detection radius or keep auto-zoom tracking</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close radar scope options"
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Radius presets */}
        <div>
          <div className="grid grid-cols-1 gap-2">
            {RADIUS_OPTIONS.map((opt) => {
              const isSelected = radiusFilter === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChangeRadius(opt.value);
                    onClose();
                  }}
                  className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-white text-black border-white shadow-md'
                      : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold font-mono">{opt.label}</div>
                    <div
                      className={`text-[11px] ${
                        isSelected ? 'text-zinc-700' : 'text-zinc-400'
                      }`}
                    >
                      {opt.sub}
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-black shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
