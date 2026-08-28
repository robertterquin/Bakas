import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-auto max-w-sm w-[90%] sm:w-auto"
        >
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-black/85 border border-white/15 text-white shadow-[0_16px_36px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-2xl">
            <CheckCircle className="w-4 h-4 text-white shrink-0" />
            <span className="text-xs font-medium leading-snug flex-1 font-sans">{message}</span>
            <button
              type="button"
              onClick={onDismiss}
              className="p-1 -mr-1 text-zinc-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
