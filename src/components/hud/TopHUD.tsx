import React from 'react';
import { WifiOff } from 'lucide-react';
import { RadiusFilter, CategoryFilter } from '../../types/hazard';
import { HazardIcon } from '../ui/HazardIcon';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface TopHUDProps {
  hazardCount: number;
  radiusFilter: RadiusFilter;
  activeFilter: CategoryFilter;
  onSelectFilter: (category: CategoryFilter) => void;
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  onOpenFilter: () => void;
  onOpenSync: () => void;
  onOpenAbout: () => void;
}

const CATEGORIES: { id: CategoryFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pothole', label: 'Pothole' },
  { id: 'clogged_drainage', label: 'Flood' },
  { id: 'road_obstruction', label: 'Obstacle' },
  { id: 'dark_street', label: 'Dark' },
];

export const TopHUD: React.FC<TopHUDProps> = ({
  hazardCount,
  radiusFilter,
  activeFilter,
  onSelectFilter,
  isOnline,
  pendingCount,
  isSyncing,
  onOpenFilter,
  onOpenSync,
  onOpenAbout,
}) => {
  return (
    <header className="absolute top-3 left-0 right-0 z-30 pointer-events-none px-3">
      <div className="max-w-xl mx-auto flex items-center justify-between gap-2 p-1.5 rounded-full bg-slate-950/80 border border-slate-800/80 shadow-2xl backdrop-blur-xl pointer-events-auto">
        {/* Brand & Count */}
        <button
          type="button"
          onClick={onOpenAbout}
          className="flex items-center gap-1.5 pl-2.5 pr-2 py-1 rounded-full hover:bg-slate-800/60 transition-colors"
          title="About Bakás"
        >
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse shadow-[0_0_8px_#38bdf8]" />
          <span className="font-bold text-xs tracking-tight text-white">Bakás</span>
          <span className="text-[11px] font-mono text-slate-400 pl-0.5">({hazardCount})</span>
        </button>

        {/* Minimal Category Filter Tabs with Modern Icons */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isSelected = activeFilter === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectFilter(cat.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                  isSelected
                    ? 'bg-white text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <HazardIcon category={cat.id} size={13} className={isSelected ? 'text-slate-950' : 'text-slate-400'} />
                <span className="hidden sm:inline">{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Radius & Status */}
        <div className="flex items-center gap-1 pr-1">
          <button
            type="button"
            onClick={onOpenFilter}
            className="px-2 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono text-sky-400 hover:border-slate-700"
            title="Change range"
          >
            {(radiusFilter / 1000).toFixed(0)}km
          </button>

          {(!isOnline || pendingCount > 0) && (
            <button
              type="button"
              onClick={onOpenSync}
              className="p-1 text-amber-400"
              title={!isOnline ? 'Offline' : `${pendingCount} pending reports`}
            >
              <WifiOff className="w-3.5 h-3.5" />
            </button>
          )}

          {isSyncing && (
            <LoadingSpinner variant="dual-arc" size={14} className="text-sky-400 ml-1" />
          )}
        </div>
      </div>
    </header>
  );
};
