import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History, Sparkles, PlusCircle, Edit3, ThumbsUp, GitMerge, RefreshCw, LogIn, Trash2 } from 'lucide-react';

export default function ActivityDrawer({ isOpen, onClose, activities }) {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'create':
        return <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />;
      case 'update':
        return <Edit3 className="w-3.5 h-3.5 text-blue-400" />;
      case 'conflict':
        return <GitMerge className="w-3.5 h-3.5 text-amber-400" />;
      case 'vote':
        return <ThumbsUp className="w-3.5 h-3.5 text-pink-400" />;
      case 'delete':
        return <Trash2 className="w-3.5 h-3.5 text-rose-400" />;
      case 'join':
        return <LogIn className="w-3.5 h-3.5 text-teal-400" />;
      case 'system':
        return <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-80 sm:w-96 glass-panel border-l border-white/10 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-sm text-white">Live Activity Stream</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5 select-text">
              {activities.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No activity recorded yet.
                </div>
              ) : (
                activities
                  .slice()
                  .reverse()
                  .map((act) => (
                    <div
                      key={act.id}
                      className="p-2.5 rounded-xl bg-slate-800/60 border border-white/5 flex items-start gap-2.5 text-xs text-slate-200 hover:border-white/10 transition-colors"
                    >
                      <div className="p-1.5 rounded-lg bg-slate-900/80 mt-0.5 flex-shrink-0">
                        {getActivityIcon(act.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-200 leading-snug break-words">
                          {act.text}
                        </p>
                        <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 font-mono">
                          <span
                            className="font-medium"
                            style={{ color: act.user?.color || '#94a3b8' }}
                          >
                            {act.user?.name || 'Anonymous'}
                          </span>
                          <span>{formatTime(act.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
