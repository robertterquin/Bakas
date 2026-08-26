import React from 'react';
import { Crosshair, Plus } from 'lucide-react';

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
  return (
    <footer className="absolute bottom-4 left-0 right-0 z-30 pointer-events-none px-4 pb-2">
      <div className="max-w-xs mx-auto flex items-center justify-center gap-2 pointer-events-auto">
        {/* Recenter Button */}
        <button
          type="button"
          onClick={onRecenter}
          aria-label="Recenter on current location"
          title="Recenter"
          className={`w-11 h-11 rounded-full flex items-center justify-center border shadow-xl backdrop-blur-xl transition-all ${
            isTracking
              ? 'bg-slate-950/80 border-slate-800 text-sky-400 hover:border-slate-700'
              : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Crosshair className="w-4 h-4" />
        </button>

        {/* Primary Report Button */}
        <button
          type="button"
          onClick={onOpenReport}
          aria-label="Report hazard"
          className="flex-1 h-11 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs shadow-[0_4px_20px_rgba(0,0,0,0.6)] flex items-center justify-center gap-1.5 transition-transform active:scale-95 px-4"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Report Hazard</span>
        </button>
      </div>
    </footer>
  );
};
