import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitMerge, X, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ConflictToast({ toasts, onDismiss }) {
  const { isDark } = useTheme();

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.96 }}
            className={`pointer-events-auto rounded-xl p-3.5 shadow-xl border flex items-start gap-3 transition-colors ${
              isDark ? 'bg-slate-900 border-indigo-500/50 text-slate-100' : 'bg-white border-indigo-300 text-slate-900'
            }`}
          >
            <div className="p-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg flex-shrink-0 mt-0.5">
              <GitMerge className="w-4 h-4 animate-pulse" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Concurrent Edit Merged
                </span>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
                  3-Way Diff
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-snug">
                {toast.summary || 'Simultaneous edit merged non-destructively without overwriting.'}
              </p>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="opacity-40 hover:opacity-100 p-1 rounded transition-opacity"
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
