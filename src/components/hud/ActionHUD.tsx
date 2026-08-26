import React from 'react';
import { Crosshair } from 'lucide-react';

interface ActionHUDProps {
  onRecenter: () => void;
  isTracking: boolean;
}

export const ActionHUD: React.FC<ActionHUDProps> = ({
  onRecenter,
  isTracking,
}) => {
  return (
    <div className="absolute bottom-5 right-4 z-30 pointer-events-none">
      {/* Minimal Unobtrusive Recenter Button */}
      <button
        type="button"
        onClick={onRecenter}
        aria-label="Recenter camera on current GPS location"
        title="Recenter location"
        className={`pointer-events-auto w-11 h-11 rounded-full flex items-center justify-center border shadow-xl backdrop-blur-xl transition-all duration-150 active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-400 ${
          isTracking
            ? 'bg-slate-950/80 border-slate-800 text-sky-400 hover:border-slate-600 hover:text-white'
            : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
        }`}
      >
        <Crosshair className="w-4 h-4" />
      </button>
    </div>
  );
};
