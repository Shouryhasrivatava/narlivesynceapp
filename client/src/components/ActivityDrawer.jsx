import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History, Sparkles, PlusCircle, Edit3, ThumbsUp, GitMerge, RefreshCw, LogIn, Trash2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ActivityDrawer({ isOpen, onClose, activities }) {
  const { isDark } = useTheme();

  const getActivityIcon = (type) => {
    switch (type) {
      case 'create':
        return <PlusCircle className="w-3.5 h-3.5 text-emerald-500" />;
      case 'update':
        return <Edit3 className="w-3.5 h-3.5 text-blue-500" />;
      case 'conflict':
        return <GitMerge className="w-3.5 h-3.5 text-amber-500" />;
      case 'vote':
        return <ThumbsUp className="w-3.5 h-3.5 text-pink-500" />;
      case 'delete':
        return <Trash2 className="w-3.5 h-3.5 text-rose-500" />;
      case 'join':
        return <LogIn className="w-3.5 h-3.5 text-teal-500" />;
      case 'system':
        return <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />;
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-xs z-50"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className={`fixed top-0 right-0 bottom-0 w-80 sm:w-96 border-l z-50 flex flex-col shadow-2xl transition-colors ${
              isDark ? 'matte-bar-dark text-slate-100' : 'matte-bar-light text-slate-900'
            }`}
          >
            {/* Header */}
            <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-500" />
                <h3 className="font-bold text-sm">Live Activity Log</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-2 select-text">
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
                      className="p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5 text-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                    >
                      <div className="p-1 rounded bg-black/5 dark:bg-white/10 mt-0.5 flex-shrink-0">
                        {getActivityIcon(act.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs leading-snug break-words">
                          {act.text}
                        </p>
                        <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 font-mono">
                          <span
                            className="font-semibold"
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
