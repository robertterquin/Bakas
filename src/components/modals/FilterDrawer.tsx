import React, { useEffect, useCallback } from 'react';
import { X, Check } from 'lucide-react';
import { RadiusFilter, CategoryFilter } from '../../types/hazard';
import { HAZARD_CATEGORIES } from '../../lib/domain-rules';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  radiusFilter: RadiusFilter;
  onChangeRadius: (radius: RadiusFilter) => void;
  activeFilter: CategoryFilter;
  onChangeCategory: (category: CategoryFilter) => void;
}

const RADIUS_OPTIONS: { value: RadiusFilter; label: string; sub: string }[] = [
  { value: 1000, label: '1.0 km', sub: 'Walking / Hyperlocal' },
  { value: 3000, label: '3.0 km', sub: 'Bicycle / Micro-mobility' },
  { value: 5000, label: '5.0 km', sub: 'Motorcycle & Vehicle' },
];

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  radiusFilter,
  onChangeRadius,
  activeFilter,
  onChangeCategory,
}) => {
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="radar-filters-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 text-slate-100 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 id="radar-filters-title" className="text-base font-bold tracking-tight">
            Radar Range & Filter
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filter options"
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-sky-400 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Radius presets */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
            Spatial Radar Radius
          </label>
          <div className="space-y-2">
            {RADIUS_OPTIONS.map((opt) => {
              const isSelected = radiusFilter === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChangeRadius(opt.value)}
                  aria-pressed={isSelected}
                  className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition-all focus-visible:ring-2 focus-visible:ring-sky-400 min-h-[52px] ${
                    isSelected
                      ? 'bg-slate-800 border-white text-white shadow-[0_0_12px_rgba(255,255,255,0.15)]'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-bold text-sm font-mono">{opt.label}</div>
                    <div className="text-xs text-slate-400">{opt.sub}</div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category presets */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
            Category Focus
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onChangeCategory('all')}
              aria-pressed={activeFilter === 'all'}
              className={`p-3 rounded-xl border text-xs font-medium text-left transition-all min-h-[48px] focus-visible:ring-2 focus-visible:ring-sky-400 ${
                activeFilter === 'all'
                  ? 'bg-white text-slate-950 border-white font-bold'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-500'
              }`}
            >
              🧭 All Categories
            </button>
            {Object.values(HAZARD_CATEGORIES).map((cat) => {
              const isSelected = activeFilter === cat.id;
              let emoji = '⚠️';
              if (cat.id === 'clogged_drainage') emoji = '💧';
              if (cat.id === 'road_obstruction') emoji = '🚧';
              if (cat.id === 'dark_street') emoji = '🌑';
              if (cat.id === 'pothole') emoji = '🕳️';

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onChangeCategory(cat.id)}
                  aria-pressed={isSelected}
                  className={`p-3 rounded-xl border text-xs font-medium text-left transition-all min-h-[48px] focus-visible:ring-2 focus-visible:ring-sky-400 ${
                    isSelected
                      ? 'bg-white text-slate-950 border-white font-bold'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {emoji} {cat.name.split('/')[0]}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-white text-slate-950 font-bold text-sm hover:bg-slate-100 transition-colors min-h-[48px]"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};
