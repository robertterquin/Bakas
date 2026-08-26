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
    <div className="absolute bottom-6 right-5 z-30 pointer-events-none">
      {/* Precision Telemetry GPS Recenter Button */}
      <button
        type="button"
        onClick={onRecenter}
        aria-label="Recenter radar on live GPS coordinates"
        title="Recenter location"
        className={`pointer-events-auto w-12 h-12 rounded-full flex items-center justify-center border shadow-[0_12px_32px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-2xl transition-all duration-200 active:scale-90 group ${
          isTracking
            ? 'bg-black/80 border-white/40 text-white hover:border-white hover:bg-black/90'
            : 'bg-black/75 border-white/10 text-zinc-400 hover:text-white hover:border-white/30'
        }`}
      >
        <Crosshair className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
      </button>
    </div>
  );
};
