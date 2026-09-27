import React from 'react';
import { motion } from 'motion/react';
import { MapTelemetry } from '../../types/telemetry';
import { formatCoordinates, getCardinalDirection } from '../../utils/telemetry';

interface SonarCompassReticleProps {
  telemetry: MapTelemetry;
  onResetNorth?: () => void;
  onShowToast?: (msg: string) => void;
}

export const SonarCompassReticle: React.FC<SonarCompassReticleProps> = ({
  telemetry,
  onResetNorth,
  onShowToast,
}) => {
  const coords = formatCoordinates(telemetry.lat, telemetry.lng);
  const cardinal = getCardinalDirection(telemetry.bearing);
  const degreeStr = `${String(Math.round(telemetry.bearing)).padStart(3, '0')}°`;

  const handleClick = () => {
    if (onResetNorth) {
      onResetNorth();
    }
    if (onShowToast) {
      onShowToast('Sonar compass aligned to True North (000° N)');
    }
  };

  return (
    <div className="absolute bottom-6 left-4 sm:left-5 z-30 pointer-events-none select-none">
      <motion.button
        type="button"
        onClick={handleClick}
        whileTap={{ scale: 0.95 }}
        title="Active Sonar Compass // Tap to align True North (000° N)"
        className="liquid-glass specular-sheen pointer-events-auto h-12 px-3 py-1.5 rounded-2xl flex items-center gap-2.5 transition-all duration-200 group text-left cursor-pointer"
      >
        {/* 1. Active Rotating Sonar Compass Ring */}
        <div className="relative w-8 h-8 rounded-full border border-white/20 bg-black/60 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(255,255,255,0.1),inset_0_1px_0_rgba(255,255,255,0.25)]">
          {/* Faint Active Sonar Radar Sweep in background */}
          <div className="absolute inset-0 rounded-full overflow-hidden opacity-30 pointer-events-none">
            <div className="w-full h-full animate-radar-sweep bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,255,255,0.25)_30deg,transparent_60deg)]" />
          </div>

          {/* Cardinal Ticks on Static Outer Ring */}
          <span className="absolute top-0.5 text-[6px] font-mono font-bold text-white leading-none">N</span>
          <span className="absolute right-0.5 text-[5px] font-mono text-zinc-500 leading-none">E</span>
          <span className="absolute bottom-0.5 text-[5px] font-mono text-zinc-500 leading-none">S</span>
          <span className="absolute left-0.5 text-[5px] font-mono text-zinc-500 leading-none">W</span>

          {/* Precision Center Reticle Hairline Ring */}
          <div className="absolute w-4 h-4 rounded-full border border-white/15" />

          {/* Dynamically Rotating Azimuth Needle (points toward exploration vector) */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-300 ease-out"
            style={{ transform: `rotate(${telemetry.bearing}deg)` }}
          >
            {/* North Pointing Stark White Arrowhead */}
            <div className="relative w-full h-full flex flex-col items-center justify-between py-1">
              <svg
                width="7"
                height="8"
                viewBox="0 0 7 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-[0_0_4px_#ffffff]"
              >
                <polygon points="3.5,0 7,8 3.5,6 0,8" fill="#ffffff" />
              </svg>

              {/* South Tail Marker */}
              <div className="w-1 h-1 rounded-full bg-zinc-600" />
            </div>
          </div>

          {/* Center Micro-Pivot Dot */}
          <div className="relative w-1.5 h-1.5 rounded-full bg-white border border-black shadow-[0_0_6px_#ffffff] z-10" />
        </div>

        {/* 2. Azimuth Degree Readout & High-Precision GPS Coordinates */}
        <div className="flex flex-col justify-center min-w-0 pr-0.5">
          {/* Coordinate Readout e.g. 14.5995° N, 120.9842° E */}
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[11px] font-bold tracking-tight text-white leading-none">
              {coords.fullStr}
            </span>
          </div>

          {/* Azimuth Heading Readout e.g. 042° AZ // NNE */}
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
            </span>
            <span className="font-mono text-[9px] font-semibold text-zinc-300 tracking-wider uppercase leading-none">
              {degreeStr} AZ <span className="text-zinc-500 font-normal">//</span> {cardinal}
            </span>
            {telemetry.isPanning && (
              <span className="text-[8px] font-mono text-zinc-400 bg-white/10 px-1 py-0.2 rounded tracking-widest leading-none">
                SCAN
              </span>
            )}
          </div>
        </div>
      </motion.button>
    </div>
  );
};
