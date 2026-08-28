import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, ChevronDown, ChevronUp, CheckCircle2, Users } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export default function LivePollWidget({ poll, onVote }) {
  const { currentUser } = useSocket();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!poll) return null;

  const userVote = poll.votedUsers ? poll.votedUsers[currentUser.id] : null;
  const total = poll.totalVotes || 0;

  return (
    <div className="fixed bottom-6 right-6 z-30 w-80 glass-panel rounded-2xl shadow-2xl border border-white/10 overflow-hidden text-slate-100">
      {/* Poll Header */}
      <div
        className="px-4 py-3 bg-slate-800/80 border-b border-white/10 flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs text-white">Live Team Poll</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Synchronized Real-Time</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400">
          <span className="text-[11px] font-mono flex items-center gap-1">
            <Users className="w-3 h-3" />
            {total}
          </span>
          {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {/* Poll Body */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-4 flex flex-col gap-3"
          >
            <p className="text-xs font-semibold text-slate-200 leading-snug">
              {poll.question}
            </p>

            <div className="flex flex-col gap-2">
              {poll.options.map((opt) => {
                const isSelected = userVote === opt.id;
                const percentage = total > 0 ? Math.round((opt.votes / total) * 100) : 0;

                return (
                  <button
                    key={opt.id}
                    onClick={() => onVote(opt.id)}
                    className={`relative w-full text-left p-2.5 rounded-xl border transition-all overflow-hidden ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-white/5 hover:border-white/20 bg-slate-800/50'
                    }`}
                  >
                    {/* Animated Fill Bar */}
                    <div
                      className={`absolute top-0 bottom-0 left-0 transition-all duration-500 ease-out ${
                        isSelected ? 'bg-indigo-500/25' : 'bg-slate-700/40'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />

                    {/* Option Details */}
                    <div className="relative z-10 flex items-center justify-between text-xs">
                      <span className="font-medium flex items-center gap-1.5 text-slate-200">
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                        {opt.text}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-slate-300 ml-2">
                        {percentage}% ({opt.votes})
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="text-[10px] text-center text-slate-400 italic">
              {userVote ? 'Click your vote again to revoke' : 'Click an option to cast your vote'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
