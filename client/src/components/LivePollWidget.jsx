import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, ChevronDown, ChevronUp, CheckCircle2, Users, Plus } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export default function LivePollWidget({ poll, onVote, onOpenCreatePoll }) {
  const { currentUser } = useSocket();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!poll) return null;

  const userVote = poll.votedUsers ? poll.votedUsers[currentUser.id] : null;
  const total = poll.totalVotes || 0;

  return (
    <div className="fixed bottom-6 right-6 z-30 w-80 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 overflow-hidden select-none">
      {/* Poll Header */}
      <div
        className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-black dark:bg-white text-white dark:text-black">
            <BarChart3 className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs">Team Poll</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-zinc-400 text-xs">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenCreatePoll) onOpenCreatePoll();
            }}
            className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-[10px] flex items-center gap-0.5 transition-colors"
            title="Create a New Poll"
          >
            <Plus className="w-3 h-3 stroke-[2.5]" />
            <span>New</span>
          </button>

          <span className="text-[11px] font-mono flex items-center gap-0.5 text-zinc-500">
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
            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-snug">
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
                        ? 'border-black dark:border-white bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white font-medium'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {/* Percentage Fill Bar */}
                    <div
                      className={`absolute top-0 bottom-0 left-0 transition-all duration-300 ${
                        isSelected
                          ? 'bg-zinc-200/80 dark:bg-zinc-700/80'
                          : 'bg-zinc-100/70 dark:bg-zinc-800/70'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />

                    {/* Option Details */}
                    <div className="relative z-10 flex items-center justify-between text-xs">
                      <span className="font-medium flex items-center gap-1.5">
                        {isSelected && <CheckCircle2 className="w-3 h-3 text-black dark:text-white" />}
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
