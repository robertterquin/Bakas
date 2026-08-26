import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface ToastNotificationProps {
  message: string | null;
  onDismiss: () => void;
  durationMs?: number;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  message,
  onDismiss,
  durationMs = 3500,
}) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onDismiss();
      }, durationMs);
      return () => clearTimeout(timer);
    }
  }, [message, durationMs, onDismiss]);

  if (!message) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto max-w-sm w-[90%] sm:w-auto animate-bounce-short">
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/95 border border-slate-700 text-slate-100 shadow-[0_10px_25px_rgba(0,0,0,0.6)] backdrop-blur-md">
        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="text-xs font-medium leading-snug flex-1">{message}</span>
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 -mr-1 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
