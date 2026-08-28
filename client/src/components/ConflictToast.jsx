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
            className="pointer-events-auto rounded-lg p-3 shadow-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 flex items-start gap-2.5"
          >
            <div className="p-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded flex-shrink-0 mt-0.5 border border-zinc-200 dark:border-zinc-700">
              <GitMerge className="w-3.5 h-3.5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                  Concurrent Edit Merged
                </span>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                  3-Way Diff
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 leading-snug">
                {toast.summary || 'Simultaneous edit merged non-destructively without overwriting.'}
              </p>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-1 rounded transition-colors"
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
