import React from 'react';
import { Radio, Wifi, WifiOff, Info, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { RadiusFilter } from '../../types/hazard';

interface TopHUDProps {
  hazardCount: number;
  radiusFilter: RadiusFilter;
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  onOpenAbout: () => void;
  onOpenFilter: () => void;
  onOpenSync: () => void;
  onManualSync: () => void;
}

export const TopHUD: React.FC<TopHUDProps> = ({
  hazardCount,
  radiusFilter,
  isOnline,
  pendingCount,
  isSyncing,
  onOpenAbout,
  onOpenFilter,
  onOpenSync,
  onManualSync,
}) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 pointer-events-none p-3 sm:p-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Brand Badge */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenAbout}
            aria-label="About Bakás Road Radar"
            className="pointer-events-auto group flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-lg backdrop-blur-md hover:border-slate-500 transition-all text-left focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            <div className="relative flex items-center justify-center w-7 h-7 rounded-xl bg-slate-800 border border-slate-700">
              <Radio className="w-4 h-4 text-sky-400 animate-pulse" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-bold tracking-tight text-slate-100 text-sm">Bakás</span>
                <span className="text-[10px] px-1 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                  RADAR
                </span>
              </div>
              <span className="text-[10px] text-slate-400 leading-none">Civic Road Radar</span>
            </div>
            <Info className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 ml-1" />
          </button>
        </div>

        {/* Proximity Counter & Radius Pill */}
        <div className="pointer-events-auto flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 rounded-2xl px-3 py-1.5 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono font-bold text-slate-100">{hazardCount}</span>
            <span className="text-slate-400 hidden xs:inline">in</span>
            <span className="text-slate-300 font-mono text-[11px] bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
              {(radiusFilter / 1000).toFixed(0)}km
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenFilter}
            aria-label="Filter radius and categories"
            className="p-1 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors ml-1 focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sync & Connectivity Pill */}
        <div className="pointer-events-auto flex items-center gap-1">
          {isOnline ? (
            <button
              type="button"
              onClick={pendingCount > 0 ? onOpenSync : onManualSync}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl border shadow-lg backdrop-blur-md text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-sky-400 ${
                pendingCount > 0
                  ? 'bg-amber-950/80 border-amber-600/80 text-amber-300 hover:bg-amber-900/80'
                  : 'bg-slate-900/90 border-slate-700/80 text-slate-300 hover:border-slate-500'
              }`}
            >
              {isSyncing ? (
                <RefreshCw className="w-3.5 h-3.5 text-sky-400 animate-spin" />
              ) : (
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span className="hidden sm:inline">
                {isSyncing ? 'Syncing...' : pendingCount > 0 ? `${pendingCount} Pending` : 'Online'}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenSync}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-amber-950/90 border border-amber-600/90 text-amber-300 shadow-lg backdrop-blur-md text-xs font-medium hover:bg-amber-900 transition-all focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Offline {pendingCount > 0 ? `(${pendingCount})` : ''}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
