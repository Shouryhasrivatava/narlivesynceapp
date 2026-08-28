import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitMerge, X, Sparkles } from 'lucide-react';

export default function ConflictToast({ toasts, onDismiss }) {
  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="pointer-events-auto bg-slate-900/95 border-2 border-indigo-500/80 backdrop-blur-xl text-white rounded-xl p-4 shadow-2xl flex items-start gap-3.5"
          >
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg flex-shrink-0 border border-indigo-500/30 mt-0.5">
              <GitMerge className="w-5 h-5 animate-pulse" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-indigo-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Concurrent Edit Merged
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-400/30">
                  Non-Destructive 3-Way
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {toast.summary || 'Two collaborators edited this note at the same moment. Both sets of edits have been preserved without overwriting.'}
              </p>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors flex-shrink-0"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
