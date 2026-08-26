import React, { useEffect, useCallback } from 'react';
import { X, Check } from 'lucide-react';
import { RadiusFilter, CategoryFilter } from '../../types/hazard';
import { HAZARD_CATEGORIES } from '../../utils/domain-rules';
import { HazardIcon } from '../ui/HazardIcon';

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
          <h2 id="radar-filters-title" className="text-base font-bold tracking-tight text-white">
            Radar Range & Filter
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filter options"
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Radius presets */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-2">
            Spatial Radar Radius
          </label>
          <div className="space-y-1.5">
            {RADIUS_OPTIONS.map((opt) => {
              const isSelected = radiusFilter === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChangeRadius(opt.value)}
                  aria-pressed={isSelected}
                  className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-zinc-900 border-white text-white shadow-sm'
                      : 'bg-black/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-bold text-sm font-mono">{opt.label}</div>
                    <div className="text-xs text-zinc-500">{opt.sub}</div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category presets */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-2">
            Category Focus
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onChangeCategory('all')}
              aria-pressed={activeFilter === 'all'}
              className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                activeFilter === 'all'
                  ? 'bg-white text-black border-white font-bold'
                  : 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:border-zinc-600'
              }`}
            >
              <HazardIcon category="all" size={14} className={activeFilter === 'all' ? 'text-black' : 'text-zinc-400'} />
              <span>All Categories</span>
            </button>
            {Object.values(HAZARD_CATEGORIES).map((cat) => {
              const isSelected = activeFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onChangeCategory(cat.id)}
                  aria-pressed={isSelected}
                  className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                    isSelected
                      ? 'bg-white text-black border-white font-bold'
                      : 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <HazardIcon category={cat.id} size={14} className={isSelected ? 'text-black' : 'text-zinc-400'} />
                  <span>{cat.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full h-11 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-colors mt-2"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};
