import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History, PlusCircle, Edit3, ThumbsUp, GitMerge, RefreshCw, LogIn, Trash2 } from 'lucide-react';

export default function ActivityDrawer({ isOpen, onClose, activities }) {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'create':
        return <PlusCircle className="w-3.5 h-3.5 text-zinc-700" />;
      case 'update':
        return <Edit3 className="w-3.5 h-3.5 text-zinc-700" />;
      case 'conflict':
        return <GitMerge className="w-3.5 h-3.5 text-amber-600" />;
      case 'vote':
        return <ThumbsUp className="w-3.5 h-3.5 text-zinc-700" />;
      case 'delete':
        return <Trash2 className="w-3.5 h-3.5 text-rose-600" />;
      case 'join':
        return <LogIn className="w-3.5 h-3.5 text-zinc-700" />;
      case 'system':
        return <RefreshCw className="w-3.5 h-3.5 text-zinc-700" />;
      default:
        return <History className="w-3.5 h-3.5 text-zinc-500" />;
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
            className="fixed inset-0 bg-black/20 z-50"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 bottom-0 w-80 sm:w-96 border-l border-zinc-200 bg-white text-zinc-900 z-50 flex flex-col shadow-lg"
          >
            {/* Header */}
            <div className="p-3 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-zinc-700" />
                <h3 className="font-bold text-xs tracking-wide uppercase text-zinc-700">Activity Stream</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded hover:bg-zinc-200 transition-colors text-zinc-500 hover:text-zinc-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5 select-text">
              {activities.length === 0 ? (
                <div className="text-center py-12 text-zinc-400 text-xs">
                  No activity recorded yet.
                </div>
              ) : (
                activities
                  .slice()
                  .reverse()
                  .map((act) => (
                    <div
                      key={act.id}
                      className="p-2 rounded bg-zinc-50 border border-zinc-200 flex items-start gap-2 text-xs"
                    >
                      <div className="p-1 rounded bg-white border border-zinc-200 mt-0.5 flex-shrink-0">
                        {getActivityIcon(act.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-zinc-800 leading-snug break-words">
                          {act.text}
                        </p>
                        <div className="flex items-center justify-between mt-1 text-[10px] text-zinc-400 font-mono">
                          <span
                            className="font-semibold"
                            style={{ color: act.user?.color || '#52525b' }}
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
