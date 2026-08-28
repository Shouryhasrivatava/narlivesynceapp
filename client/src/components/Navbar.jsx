import React, { useState } from 'react';
import {
  Plus,
  Radio,
  History,
  LayoutGrid,
  Sun,
  Moon,
  Download,
  Activity,
  ChevronDown,
  Filter,
  Grid,
  WifiOff
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import { CATEGORIES } from '../types';

export default function Navbar({
  notesCount,
  activityCount,
  fps,
  pingLatency,
  snapToGrid,
  onToggleSnap,
  filterCategory,
  onSelectCategory,
  onCreateNote,
  onResetTemplate,
  onExportJSON,
  onOpenActivity,
  onOpenProfile
}) {
  const { isConnected, onlineUsers, currentUser } = useSocket();
  const { isDark, toggleTheme } = useTheme();
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 h-16 px-4 sm:px-6 flex items-center justify-between transition-colors duration-200 ${
      isDark ? 'matte-bar-dark text-slate-100' : 'matte-bar-light text-slate-900'
    }`}>
      {/* Brand & Connection Status */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm">
            <Radio className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-sm tracking-tight">SyncSpace</h1>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                2nd-Yr Live
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden md:block">
              Collaborative Real-Time Canvas
            </p>
          </div>
        </div>

        {/* Live Telemetry HUD */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-[11px] font-mono">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            {isConnected ? 'ONLINE' : 'DISCONNECTED'}
          </span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span className="text-slate-600 dark:text-slate-300 font-medium" title="Network Latency Round-Trip">
            {pingLatency}ms
          </span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span className="text-slate-600 dark:text-slate-300 font-medium" title="Client Rendering Frame Rate">
            {fps} FPS
          </span>
        </div>
      </div>

      {/* Center Collaborators Presence */}
      <div className="hidden md:flex items-center gap-2">
        <div className="flex items-center -space-x-2 overflow-hidden py-1">
          {onlineUsers.slice(0, 5).map((user) => (
            <div
              key={user.id || user.socketId}
              className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-xs shadow-sm transition-transform hover:scale-110 cursor-pointer"
              style={{ backgroundColor: user.color || '#3b82f6' }}
              title={`${user.name} ${user.id === currentUser.id ? '(You)' : ''}`}
            >
              {user.avatar || '👤'}
            </div>
          ))}
          {onlineUsers.length > 5 && (
            <div className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-300">
              +{onlineUsers.length - 5}
            </div>
          )}
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {onlineUsers.length} active
        </span>
      </div>

      {/* Right Controls Suite */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Category Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowFilterMenu(!showFilterMenu);
              setShowTemplateMenu(false);
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
              filterCategory !== 'All'
                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title="Filter Notes by Category"
          >
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{filterCategory}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showFilterMenu && (
            <div
              className={`absolute right-0 top-10 w-44 rounded-xl p-1.5 shadow-xl z-50 flex flex-col gap-0.5 border ${
                isDark ? 'matte-dropdown-dark' : 'matte-dropdown-light'
              }`}
              onClick={() => setShowFilterMenu(false)}
            >
              <button
                onClick={() => onSelectCategory('All')}
                className={`text-left text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                  filterCategory === 'All'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                All Categories ({notesCount})
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`text-left text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                    filterCategory === cat.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Snap to Grid Toggle */}
        <button
          onClick={onToggleSnap}
          className={`p-2 rounded-lg border text-xs transition-colors hidden sm:flex items-center ${
            snapToGrid
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
          title={snapToGrid ? 'Snap to Grid: Enabled (24px)' : 'Snap to Grid: Disabled'}
        >
          <Grid className="w-3.5 h-3.5" />
        </button>

        {/* Create Note Action */}
        <button
          onClick={() => onCreateNote()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-xs font-bold text-white shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>New Note</span>
        </button>

        {/* Template Selector */}
        <div className="relative">
          <button
            onClick={() => {
              setShowTemplateMenu(!showTemplateMenu);
              setShowFilterMenu(false);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
            title="Load Template / Reset Canvas"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Templates</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showTemplateMenu && (
            <div
              className={`absolute right-0 top-10 w-48 rounded-xl p-1.5 shadow-xl z-50 flex flex-col gap-0.5 border ${
                isDark ? 'matte-dropdown-dark' : 'matte-dropdown-light'
              }`}
              onClick={() => setShowTemplateMenu(false)}
            >
              <button
                onClick={() => onResetTemplate('brainstorm')}
                className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
              >
                <span>⚡</span>
                <div>
                  <div>Brainstorm Board</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Default 5-note setup</div>
                </div>
              </button>
              <button
                onClick={() => onResetTemplate('retrospective')}
                className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
              >
                <span>🔄</span>
                <div>
                  <div>Sprint Retrospective</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Good / Needs Work / Actions</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Export JSON Button */}
        <button
          onClick={onExportJSON}
          className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 transition-colors hidden sm:block"
          title="Export Canvas State as JSON"
        >
          <Download className="w-3.5 h-3.5" />
        </button>

        {/* Bright Mode / Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 transition-colors"
          title={isDark ? 'Switch to Bright Light Mode' : 'Switch to Dark Matte Mode'}
        >
          {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
        </button>

        {/* Activity Drawer Toggle */}
        <button
          onClick={onOpenActivity}
          className="relative p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 transition-colors"
          title="Live Activity Log"
        >
          <History className="w-3.5 h-3.5" />
          {activityCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 rounded-full text-[9px] font-bold flex items-center justify-center text-white shadow-sm">
              {activityCount > 9 ? '9+' : activityCount}
            </span>
          )}
        </button>

        {/* User Profile Button */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/60 transition-colors"
          title="Edit Your Profile"
        >
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
            style={{ backgroundColor: currentUser.color || '#3b82f6' }}
          >
            {currentUser.avatar || '👤'}
          </div>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 hidden sm:inline max-w-[70px] truncate">
            {currentUser.name}
          </span>
        </button>
      </div>
    </header>
  );
}
