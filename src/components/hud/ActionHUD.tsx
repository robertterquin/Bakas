import React, { useState, useEffect } from 'react';
import { Crosshair, Plus, Sun, SunMedium } from 'lucide-react';
import { requestScreenWakeLock, releaseScreenWakeLock, isWakeLockActive } from '../../lib/wake-lock';

interface ActionHUDProps {
  onOpenReport: () => void;
  onRecenter: () => void;
  isTracking: boolean;
}

export const ActionHUD: React.FC<ActionHUDProps> = ({
  onOpenReport,
  onRecenter,
  isTracking,
}) => {
  const [wakeLockActive, setWakeLockActive] = useState<boolean>(false);

  useEffect(() => {
    setWakeLockActive(isWakeLockActive());
  }, []);

  const toggleWakeLock = async () => {
    if (wakeLockActive) {
      releaseScreenWakeLock();
      setWakeLockActive(false);
    } else {
      const ok = await requestScreenWakeLock();
      setWakeLockActive(ok);
    }
  };

  return (
    <footer className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none p-4 pb-6 sm:pb-8">
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        {/* Wake Lock Button (for handlebar mounts) */}
        <button
          type="button"
          onClick={toggleWakeLock}
          aria-label={wakeLockActive ? 'Disable Keep Screen On' : 'Enable Keep Screen On (Mount Mode)'}
          title={wakeLockActive ? 'Screen will stay on (Mount Mode)' : 'Keep screen awake while riding'}
          className={`pointer-events-auto w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xl backdrop-blur-md transition-all duration-200 focus-visible:ring-2 focus-visible:ring-sky-400 ${
            wakeLockActive
              ? 'bg-sky-500/20 border-sky-400 text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.4)]'
              : 'bg-slate-900/90 border-slate-700/80 text-slate-400 hover:text-slate-200 hover:border-slate-500'
          }`}
        >
          {wakeLockActive ? <Sun className="w-5 h-5 animate-pulse text-sky-400" /> : <SunMedium className="w-5 h-5" />}
        </button>

        {/* Primary Action FAB: Report Hazard */}
        <button
          type="button"
          onClick={onOpenReport}
          aria-label="Report a new road hazard"
          className="pointer-events-auto flex-1 h-14 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-white/80 hover:border-white text-white font-bold text-base shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:shadow-[0_0_24px_rgba(255,255,255,0.4)] flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-95 group focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          <div className="w-7 h-7 rounded-full bg-white text-slate-950 flex items-center justify-center font-black group-hover:rotate-90 transition-transform duration-300">
            <Plus className="w-4 h-4 stroke-[3]" />
          </div>
          <span className="tracking-wide">Report Hazard</span>
        </button>

        {/* Recenter GPS Button */}
        <button
          type="button"
          onClick={onRecenter}
          aria-label="Recenter camera on current GPS location"
          title="Recenter GPS location"
          className={`pointer-events-auto w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xl backdrop-blur-md transition-all duration-200 focus-visible:ring-2 focus-visible:ring-sky-400 ${
            isTracking
              ? 'bg-slate-900/90 border-slate-700/80 text-sky-400 hover:border-slate-500'
              : 'bg-slate-900/90 border-slate-700/80 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Crosshair className="w-5 h-5 hover:rotate-45 transition-transform" />
        </button>
      </div>
    </footer>
  );
};
