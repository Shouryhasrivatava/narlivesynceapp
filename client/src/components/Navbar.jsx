import React, { useState } from 'react';
import {
  Plus,
  Radio,
  History,
  RotateCcw,
  Sparkles,
  LayoutGrid,
  Wifi,
  WifiOff,
  ChevronDown
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export default function Navbar({
  onCreateNote,
  onResetTemplate,
  onOpenActivity,
  onOpenProfile,
  activityCount,
  notesCount
}) {
  const { isConnected, onlineUsers, currentUser } = useSocket();
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 glass-panel border-b border-white/10 px-4 sm:px-6 flex items-center justify-between text-white">
      {/* Brand & Connection Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Radio className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                SyncSpace
              </h1>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                2nd-Yr Live
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
              Collaborative Sticky-Note Canvas
            </p>
          </div>
        </div>

        {/* Live Status Pill */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-md transition-colors ${
            isConnected
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
          }`}
          title={isConnected ? 'Connected to WebSocket server' : 'Attempting reconnection...'}
        >
          {isConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[11px] font-mono">Live ({notesCount} notes)</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3" />
              <span className="text-[11px] font-mono">Reconnecting</span>
            </>
          )}
        </div>
      </div>

      {/* Center Collaborators Presence Stack */}
      <div className="hidden md:flex items-center gap-2">
        <div className="flex items-center -space-x-2 overflow-hidden py-1">
          {onlineUsers.slice(0, 5).map((user) => (
            <div
              key={user.id || user.socketId}
              className="w-8 h-8 rounded-full border-2 border-slate-900 flex items-center justify-center text-sm shadow-md transition-transform hover:scale-110 hover:z-10 cursor-pointer"
              style={{ backgroundColor: user.color || '#3b82f6' }}
              title={`${user.name} ${user.id === currentUser.id ? '(You)' : ''}`}
            >
              {user.avatar || '👤'}
            </div>
          ))}
          {onlineUsers.length > 5 && (
            <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
              +{onlineUsers.length - 5}
            </div>
          )}
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {onlineUsers.length} {onlineUsers.length === 1 ? 'collaborator' : 'collaborators'}
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Create Note CTA */}
        <button
          onClick={() => onCreateNote()}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Note</span>
        </button>

        {/* Template Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowTemplateMenu(!showTemplateMenu)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-xs font-semibold text-slate-200 transition-colors"
            title="Load Preset Template / Reset Canvas"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Templates</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showTemplateMenu && (
            <div
              className="absolute right-0 top-10 w-48 glass-dropdown rounded-xl p-1.5 shadow-2xl z-50 flex flex-col gap-1 border border-white/15"
              onClick={() => setShowTemplateMenu(false)}
            >
              <button
                onClick={() => onResetTemplate('brainstorm')}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold hover:bg-white/10 text-slate-200 flex items-center gap-2 transition-colors"
              >
                <span>⚡</span>
                <div>
                  <div>Brainstorming Board</div>
                  <div className="text-[10px] text-slate-400 font-normal">Default 5-note setup</div>
                </div>
              </button>
              <button
                onClick={() => onResetTemplate('retrospective')}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold hover:bg-white/10 text-slate-200 flex items-center gap-2 transition-colors"
              >
                <span>🔄</span>
                <div>
                  <div>Sprint Retrospective</div>
                  <div className="text-[10px] text-slate-400 font-normal">Good / Needs Work / Actions</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Activity Stream Drawer Button */}
        <button
          onClick={onOpenActivity}
          className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-slate-300 hover:text-white transition-colors"
          title="Live Activity Stream"
        >
          <History className="w-4 h-4" />
          {activityCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full text-[9px] font-bold flex items-center justify-center text-white shadow-md">
              {activityCount > 9 ? '9+' : activityCount}
            </span>
          )}
        </button>

        {/* User Profile Button */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 transition-colors"
          title="Customize Your Name & Avatar"
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
            style={{ backgroundColor: currentUser.color || '#3b82f6' }}
          >
            {currentUser.avatar || '👤'}
          </div>
          <span className="text-xs font-semibold text-slate-200 hidden sm:inline max-w-[80px] truncate">
            {currentUser.name}
          </span>
        </button>
      </div>
    </header>
  );
}
