import React from 'react';
import { motion } from 'motion/react';
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
      {/* Precision Telemetry GPS Recenter Button with Liquid Glass Depth & Specular Sheen */}
      <motion.button
        type="button"
        onClick={onRecenter}
        whileTap={{ scale: 0.92 }}
        aria-label="Recenter radar on live GPS coordinates"
        title="Recenter radar on live GPS"
        className={`liquid-glass specular-sheen pointer-events-auto w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 group cursor-pointer ${
          isTracking
            ? 'text-white border-white/30 hover:border-white/50'
            : 'text-zinc-400 hover:text-white border-white/10'
        }`}
      >
        <Crosshair className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
      </motion.button>
    </div>
  );
};
