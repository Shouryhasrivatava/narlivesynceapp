import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitMerge, X } from 'lucide-react';

export default function ConflictToast({ toasts, onDismiss }) {
  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 15, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            className="pointer-events-auto rounded-lg p-3 shadow-md border border-zinc-300 bg-white text-zinc-900 flex items-start gap-2.5"
          >
            <div className="p-1.5 bg-zinc-100 text-zinc-800 rounded flex-shrink-0 mt-0.5 border border-zinc-200">
              <GitMerge className="w-3.5 h-3.5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-zinc-900">
                  Concurrent Edit Merged
                </span>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                  3-Way Diff
                </span>
              </div>
              <p className="text-xs text-zinc-600 mt-0.5 leading-snug">
                {toast.summary || 'Simultaneous edit merged non-destructively without overwriting.'}
              </p>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-zinc-400 hover:text-zinc-900 p-1 rounded transition-colors"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
