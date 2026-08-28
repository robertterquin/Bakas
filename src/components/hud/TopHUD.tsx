import React from 'react';
import { motion } from 'motion/react';
import NumberFlow from '@number-flow/react';
import { WifiOff, Radio, Search } from 'lucide-react';
import { RadiusFilter, CategoryFilter } from '../../types/hazard';
import { formatScopeDistance } from '../../services/geo.service';
import { HazardIcon } from '../ui/HazardIcon';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { BakasLogo } from '../ui/BakasLogo';

interface TopHUDProps {
  hazardCount: number;
  radiusFilter: RadiusFilter;
  visibleScopeMeters?: number;
  activeFilter: CategoryFilter;
  onSelectFilter: (category: CategoryFilter) => void;
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  onOpenFilter: () => void;
  onOpenSync: () => void;
  onOpenAbout: () => void;
  onOpenSearch: () => void;
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
  visibleScopeMeters = 5000,
  activeFilter,
  onSelectFilter,
  isOnline,
  pendingCount,
  isSyncing,
  onOpenFilter,
  onOpenSync,
  onOpenAbout,
  onOpenSearch,
}) => {
  const scopeInfo = formatScopeDistance(radiusFilter > 0 ? radiusFilter : visibleScopeMeters);

  return (
    <header className="absolute top-3 left-0 right-0 z-30 pointer-events-none px-2.5 sm:px-4">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="max-w-2xl mx-auto h-11 px-1.5 sm:px-2 flex items-center justify-between gap-1.5 sm:gap-2 rounded-full bg-black/80 border border-white/12 shadow-[0_12px_36px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl pointer-events-auto transition-all"
      >
        {/* Brand Mark with Live Telemetry Radar Beacon */}
        <motion.button
          type="button"
          onClick={onOpenAbout}
          whileTap={{ scale: 0.95 }}
          className="h-8 flex items-center gap-1.5 pl-2 pr-2 rounded-full hover:bg-white/10 transition-colors group shrink-0"
          title="About Bakás Radar"
        >
          <BakasLogo size={20} withGlow={true} className="shrink-0 group-hover:scale-105 transition-transform" />
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-xs tracking-tight text-white font-sans">Bakás</span>
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/[0.08] border border-white/10">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
              </span>
              <span className="text-[10px] font-mono font-semibold text-zinc-300 leading-none">
                <NumberFlow value={hazardCount} />
              </span>
            </div>
          </div>
        </motion.button>

        {/* Dynamic Segmented Category Tabs with Motion Sliding Magnetic Pill */}
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0 relative">
          {CATEGORIES.map((cat) => {
            const isSelected = activeFilter === cat.id;
            return (
              <motion.button
                key={cat.id}
                type="button"
                onClick={() => onSelectFilter(cat.id)}
                whileTap={{ scale: 0.94 }}
                className={`relative h-7.5 px-2.5 sm:px-3 rounded-full text-[11px] font-medium flex items-center gap-1.5 transition-colors duration-150 shrink-0 ${
                  isSelected ? 'text-black font-bold' : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {/* Magnetic Sliding Background Pill */}
                {isSelected && (
                  <motion.div
                    layoutId="activeCategoryPill"
                    className="absolute inset-0 bg-white rounded-full shadow-[0_2px_12px_rgba(255,255,255,0.25)]"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}

                <span className="relative z-10 flex items-center gap-1.5">
                  <HazardIcon
                    category={cat.id}
                    size={13}
                    className={`transition-colors duration-150 ${isSelected ? 'text-black' : 'text-zinc-400'}`}
                  />
                  <span className="hidden sm:inline font-sans">{cat.label}</span>
                </span>
              </motion.button>
            );
          })}
        </nav>

        {/* Search & Precision Radar Range Controls */}
        <div className="flex items-center gap-1 shrink-0 pr-0.5">
          {/* Street & Landmark Search Trigger (Ctrl+K) */}
          <motion.button
            type="button"
            onClick={onOpenSearch}
            whileTap={{ scale: 0.92 }}
            className="h-7.5 px-2 rounded-full bg-white/[0.08] border border-white/10 hover:bg-white/[0.15] hover:border-white/25 text-zinc-300 hover:text-white flex items-center gap-1 transition-all shadow-sm"
            title="Search Philippine streets & landmarks (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[9px] font-mono text-zinc-400 pr-0.5">⌘K</span>
          </motion.button>

          {/* Dynamic Zoom-Adaptive Telemetry Radar Range Pill */}
          <motion.button
            type="button"
            onClick={onOpenFilter}
            whileTap={{ scale: 0.93 }}
            className="h-7.5 flex items-center gap-1 px-2.5 rounded-full bg-white/[0.08] border border-white/10 text-[10px] font-mono font-semibold text-zinc-200 hover:bg-white/[0.15] hover:border-white/25 transition-all shadow-sm"
            title={radiusFilter === 0 ? 'Dynamic Zoom Scope (Auto)' : `Fixed Scope (${scopeInfo.display})`}
          >
            <Radio className="w-3 h-3 text-zinc-400 shrink-0" />
            <span className="flex items-center">
              <NumberFlow value={scopeInfo.value} />
              <span>{scopeInfo.unit}</span>
            </span>
          </motion.button>

          {(!isOnline || pendingCount > 0) && (
            <motion.button
              type="button"
              onClick={onOpenSync}
              whileTap={{ scale: 0.9 }}
              className="w-7.5 h-7.5 flex items-center justify-center rounded-full bg-white/[0.08] hover:bg-white/20 border border-white/10 text-white transition-all"
              title={!isOnline ? 'Offline mode active' : `${pendingCount} pending traces`}
            >
              <WifiOff className="w-3.5 h-3.5" />
            </motion.button>
          )}

          {isSyncing && (
            <div className="px-1 flex items-center">
              <LoadingSpinner variant="dual-arc" size={14} className="text-white" />
            </div>
          )}
        </div>
      </motion.div>
    </header>
  );
};
