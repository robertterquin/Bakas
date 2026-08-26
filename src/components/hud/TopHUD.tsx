import React from 'react';
import { WifiOff, Radio } from 'lucide-react';
import { RadiusFilter, CategoryFilter } from '../../types/hazard';
import { HazardIcon } from '../ui/HazardIcon';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { BakasLogo } from '../ui/BakasLogo';

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
    <header className="absolute top-3.5 left-0 right-0 z-30 pointer-events-none px-3 sm:px-4">
      <div className="max-w-xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2 p-1.5 rounded-full bg-black/75 border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-2xl pointer-events-auto transition-all">
        {/* Brand Mark with Live Telemetry Radar Beacon */}
        <button
          type="button"
          onClick={onOpenAbout}
          className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-full hover:bg-white/10 active:scale-95 transition-all group"
          title="About Bakás Radar"
        >
          <BakasLogo size={22} withGlow={true} className="shrink-0 group-hover:scale-105 transition-transform" />
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-xs tracking-tight text-white font-sans">Bakás</span>
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/[0.08] border border-white/10">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
              </span>
              <span className="text-[10px] font-mono font-semibold text-zinc-300 leading-none">
                {hazardCount}
              </span>
            </div>
          </div>
        </button>

        {/* Dynamic Segmented Category Tabs with Liquid Glass Sheen */}
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {CATEGORIES.map((cat) => {
            const isSelected = activeFilter === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectFilter(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-200 active:scale-95 ${
                  isSelected
                    ? 'bg-white text-black font-bold shadow-[0_2px_14px_rgba(255,255,255,0.3),inset_0_1px_0_rgba(255,255,255,0.8)] scale-[1.02]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <HazardIcon
                  category={cat.id}
                  size={13}
                  className={`transition-colors ${isSelected ? 'text-black' : 'text-zinc-400'}`}
                />
                <span className="hidden sm:inline font-sans">{cat.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Precision Radar Range & Connectivity Telemetry */}
        <div className="flex items-center gap-1.5 pr-1">
          <button
            type="button"
            onClick={onOpenFilter}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[10px] font-mono font-semibold text-zinc-200 hover:bg-white/[0.12] hover:border-white/25 active:scale-95 transition-all shadow-sm"
            title="Adjust spatial radar radius"
          >
            <Radio className="w-3 h-3 text-zinc-400" />
            <span>{(radiusFilter / 1000).toFixed(0)}km</span>
          </button>

          {(!isOnline || pendingCount > 0) && (
            <button
              type="button"
              onClick={onOpenSync}
              className="p-1.5 rounded-full bg-white/[0.08] hover:bg-white/20 border border-white/10 text-white active:scale-95 transition-all"
              title={!isOnline ? 'Offline mode active' : `${pendingCount} pending traces`}
            >
              <WifiOff className="w-3.5 h-3.5" />
            </button>
          )}

          {isSyncing && (
            <div className="p-1">
              <LoadingSpinner variant="dual-arc" size={14} className="text-white" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
