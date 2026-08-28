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
    <div className="fixed bottom-6 right-6 z-30 w-80 rounded-lg shadow-sm border border-zinc-200 bg-white text-zinc-900 overflow-hidden select-none">
      {/* Poll Header */}
      <div
        className="px-3 py-2 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-black text-white">
            <BarChart3 className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs">Team Poll</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
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
            className="p-3 flex flex-col gap-2"
          >
            <p className="text-xs font-semibold text-zinc-800 leading-snug">
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
                    className={`relative w-full text-left p-2 rounded border transition-all overflow-hidden ${
                      isSelected
                        ? 'border-black bg-zinc-100 text-zinc-950 font-medium'
                        : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-700'
                    }`}
                  >
                    {/* Fill Bar */}
                    <div
                      className={`absolute top-0 bottom-0 left-0 transition-all duration-300 ${
                        isSelected ? 'bg-zinc-200/80' : 'bg-zinc-100/60'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />

                    {/* Option Details */}
                    <div className="relative z-10 flex items-center justify-between text-xs">
                      <span className="font-medium flex items-center gap-1.5">
                        {isSelected && <CheckCircle2 className="w-3 h-3 text-black" />}
                        {opt.text}
                      </span>
                      <span className="font-mono text-[10px] font-semibold text-zinc-500 ml-2">
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
