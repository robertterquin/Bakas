import React from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface PWAInstallBannerProps {
  isInstallable: boolean;
  onInstall: () => void;
  onDismiss: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  isInstallable,
  onInstall,
  onDismiss,
}) => {
  if (!isInstallable) return null;

  return (
    <aside
      aria-label="PWA install banner"
      className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md pointer-events-auto animate-slideUp"
    >
      <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/95 border border-sky-500/40 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-md flex items-center justify-between gap-3 text-slate-100">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-xs sm:text-sm text-slate-100 flex items-center gap-1.5">
              <span>Install Bakás Radar</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 font-mono">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">Fast offline access & handlebar mount mode</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onInstall}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Install</span>
          </button>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss install prompt"
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
