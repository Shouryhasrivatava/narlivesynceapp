import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, ChevronDown, ChevronUp, CheckCircle2, Users } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';

export default function LivePollWidget({ poll, onVote }) {
  const { currentUser } = useSocket();
  const { isDark } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!poll) return null;

  const userVote = poll.votedUsers ? poll.votedUsers[currentUser.id] : null;
  const total = poll.totalVotes || 0;

  return (
    <div className={`fixed bottom-6 right-6 z-30 w-80 rounded-xl shadow-xl border overflow-hidden transition-colors ${
      isDark ? 'matte-bar-dark text-slate-100' : 'matte-bar-light text-slate-900'
    }`}>
      {/* Poll Header */}
      <div
        className="px-3.5 py-2.5 bg-black/5 dark:bg-white/5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <BarChart3 className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs">Live Team Poll</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
          <span className="text-[11px] font-mono flex items-center gap-0.5">
            <Users className="w-3 h-3" />
            {total}
          </span>
          {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </div>

      {/* Poll Body */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-3.5 flex flex-col gap-2.5"
          >
            <p className="text-xs font-semibold leading-snug">
              {poll.question}
            </p>

            <div className="flex flex-col gap-1.5">
              {poll.options.map((opt) => {
                const isSelected = userVote === opt.id;
                const percentage = total > 0 ? Math.round((opt.votes / total) * 100) : 0;

                return (
                  <button
                    key={opt.id}
                    onClick={() => onVote(opt.id)}
                    className={`relative w-full text-left p-2 rounded-lg border transition-all overflow-hidden ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-100'
                        : 'border-slate-200 dark:border-slate-800 bg-black/5 dark:bg-white/5 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {/* Fill Bar */}
                    <div
                      className={`absolute top-0 bottom-0 left-0 transition-all duration-300 ${
                        isSelected
                          ? 'bg-indigo-500/20 dark:bg-indigo-500/30'
                          : 'bg-black/5 dark:bg-white/5'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />

                    {/* Option Details */}
                    <div className="relative z-10 flex items-center justify-between text-xs">
                      <span className="font-medium flex items-center gap-1.5">
                        {isSelected && <CheckCircle2 className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />}
                        {opt.text}
                      </span>
                      <span className="font-mono text-[10px] font-bold opacity-70 ml-2">
                        {percentage}% ({opt.votes})
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
