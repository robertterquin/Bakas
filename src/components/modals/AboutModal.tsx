import React, { useEffect, useCallback } from 'react';
import { X, Shield, EyeOff, Zap, Lock, AlertTriangle } from 'lucide-react';
import { BakasLogo } from '../ui/BakasLogo';
import { getOrCreateDeviceFingerprint } from '../../utils/domain-rules';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const deviceHash = getOrCreateDeviceFingerprint();

  // Escape key accessibility
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-bakas-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md max-h-[85vh] bg-zinc-950 border border-zinc-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="p-4 px-6 flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <BakasLogo size={32} withGlow={true} className="shrink-0" />
            <div>
              <h2 id="about-bakas-title" className="text-base font-bold text-white">
                Bakas Radar
              </h2>
              <span className="text-xs text-zinc-400">Tagalog for "traces" or "tracks"</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close about dialog"
            className="p-2 -mr-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-900 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-zinc-300">
          {/* User Anonymous Civic Token Card */}
          <div className="p-3 rounded-2xl bg-black border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-white">Anonymous Civic ID</div>
                <div className="text-[10px] font-mono text-zinc-500">Token: {deviceHash.substring(0, 16)}...</div>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 text-white border border-zinc-700 font-mono font-semibold">
              Verified
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 leading-relaxed text-zinc-200">
            <p className="font-semibold text-white text-sm mb-1">
              Leaving digital traces to navigate urban road hazards.
            </p>
            <p className="text-xs text-zinc-400">
              Bakas is a lightweight, civic road safety radar engineered to protect commuters, motorcyclists, cyclists,
              and pedestrians from dangerous potholes, open manholes, flash floods, and unlit streets.
            </p>
          </div>

          {/* Key Tenets */}
          <div className="space-y-2.5">
            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800">
              <Zap className="w-4 h-4 text-white shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Zero-Login Barrier</span>
                <span className="text-zinc-400 text-[11px]">
                  Submit hazard traces in under 5 seconds with zero account creation or forms.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800">
              <Shield className="w-4 h-4 text-white shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Offline-First Resilience</span>
                <span className="text-zinc-400 text-[11px]">
                  Operates seamlessly in cellular dead zones (tunnels, underpasses) using IndexedDB.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800">
              <EyeOff className="w-4 h-4 text-white shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Zero Tracking / Absolute Privacy</span>
                <span className="text-zinc-400 text-[11px]">
                  No movement histories, cookies, or user PII are ever collected or stored.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800">
              <Lock className="w-4 h-4 text-white shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Automated Data Decay (TTL)</span>
                <span className="text-zinc-400 text-[11px]">
                  Pins automatically expire up to 90 days to prevent outdated ghost markers.
                </span>
              </div>
            </div>
          </div>

          {/* Passenger Safety Disclaimer */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-700 flex items-start gap-3 text-zinc-300">
            <AlertTriangle className="w-4 h-4 text-white shrink-0 mt-0.5" />
            <div className="text-[11px] leading-tight space-y-1">
              <span className="font-bold text-white block">Passenger & Stationary Safety Rule:</span>
              <p className="text-zinc-400">
                Never interact with Bakas while driving. Use handlebar mounts in glanceable radar mode or report while
                safely stopped or as a passenger.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-zinc-800 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-colors min-h-[48px]"
          >
            Back to Radar Canvas
          </button>
        </div>
      </div>
    </div>
  );
};
