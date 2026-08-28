import React, { useState } from 'react';
import {
  Plus,
  History,
  LayoutGrid,
  Download,
  Filter,
  Grid,
  ChevronDown,
  Flag,
  Sun,
  Moon,
  FileText,
  Kanban,
  Layers,
  Square,
  CircleDot,
  AlignJustify
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { CATEGORIES, PRIORITIES, BACKGROUND_PATTERNS } from '../types';

export default function Navbar({
  notesCount,
  activityCount,
  fps,
  pingLatency,
  snapToGrid,
  onToggleSnap,
  backgroundPattern = 'plain',
  onSelectBackgroundPattern,
  filterCategory,
  onSelectCategory,
  filterPriority,
  onSelectPriority,
  isDarkMode,
  onToggleDarkMode,
  onCreateNote,
  onResetTemplate,
  onExportJSON,
  onOpenActivity,
  onOpenProfile
}) {
  const { isConnected, onlineUsers, currentUser } = useSocket();
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showBgMenu, setShowBgMenu] = useState(false);

  const getBgIcon = (id) => {
    switch (id) {
      case 'grid':
        return <Grid className="w-3.5 h-3.5" />;
      case 'dots':
        return <CircleDot className="w-3.5 h-3.5" />;
      case 'lined':
        return <AlignJustify className="w-3.5 h-3.5" />;
      default:
        return <Square className="w-3.5 h-3.5" />;
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 px-4 sm:px-6 flex items-center justify-between bg-white dark:bg-[#121214] border-b border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs transition-colors">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2.5">
          {/* NAR Solid Box Logo */}
          <div className="w-8 h-8 rounded bg-black dark:bg-white text-white dark:text-black font-black font-mono flex items-center justify-center text-xs tracking-wider shadow-xs select-none">
            NAR
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-black dark:text-white leading-none">
              Live Sync Mini App
            </h1>
          </div>
        </div>

        {/* Telemetry Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[11px] font-mono">
          <span className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-semibold">
            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
            {isConnected ? 'ONLINE' : 'OFFLINE'}
          </span>
          <span className="text-zinc-300 dark:text-zinc-600">|</span>
          <span className="text-zinc-600 dark:text-zinc-400 font-medium" title="Network Latency">
            {pingLatency}ms
          </span>
          <span className="text-zinc-300 dark:text-zinc-600">|</span>
          <span className="text-zinc-600 dark:text-zinc-400 font-medium" title="FPS">
            {fps} FPS
          </span>
        </div>
      </div>

      {/* Center Collaborators Presence */}
      <div className="hidden md:flex items-center gap-2">
        <div className="flex items-center -space-x-1.5 overflow-hidden py-1">
          {onlineUsers.slice(0, 5).map((user) => (
            <div
              key={user.id || user.socketId}
              className="w-7 h-7 rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center text-[10px] font-mono font-bold shadow-xs transition-transform hover:scale-110 cursor-pointer text-white"
              style={{ backgroundColor: user.color || '#000000' }}
              title={`${user.name} ${user.id === currentUser.id ? '(You)' : ''}`}
            >
              <span>{user.avatar || user.name?.charAt(0) || 'U'}</span>
            </div>
          ))}
          {onlineUsers.length > 5 && (
            <div className="w-7 h-7 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-700 dark:text-zinc-200">
              +{onlineUsers.length - 5}
            </div>
          )}
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
          {onlineUsers.length} online
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Background Style Selector */}
        <div className="relative">
          <button
            onClick={() => {
              setShowBgMenu(!showBgMenu);
              setShowPriorityMenu(false);
              setShowFilterMenu(false);
              setShowTemplateMenu(false);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-xs font-semibold transition-colors"
            title="Canvas Background Style (Blank, Grid, Dots, Lined)"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {BACKGROUND_PATTERNS.find((b) => b.id === backgroundPattern)?.label || 'Background'}
            </span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {showBgMenu && (
            <div
              className="absolute right-0 top-10 w-40 rounded-lg p-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl z-50 flex flex-col gap-0.5"
              onClick={() => setShowBgMenu(false)}
            >
              {BACKGROUND_PATTERNS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onSelectBackgroundPattern(p.id)}
                  className={`text-left text-xs px-2.5 py-1.5 rounded font-medium transition-colors flex items-center gap-2 ${
                    backgroundPattern === p.id
                      ? 'bg-black dark:bg-white text-white dark:text-black font-bold'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {getBgIcon(p.id)}
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Priority Filter */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => {
              setShowPriorityMenu(!showPriorityMenu);
              setShowFilterMenu(false);
              setShowTemplateMenu(false);
              setShowBgMenu(false);
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded border text-xs font-semibold transition-colors ${
              filterPriority !== 'All'
                ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700'
            }`}
            title="Filter by Priority"
          >
            <Flag className="w-3 h-3" />
            <span>{filterPriority === 'All' ? 'Priority' : filterPriority.toUpperCase()}</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {showPriorityMenu && (
            <div
              className="absolute right-0 top-10 w-36 rounded-lg p-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl z-50 flex flex-col gap-0.5"
              onClick={() => setShowPriorityMenu(false)}
            >
              <button
                onClick={() => onSelectPriority('All')}
                className={`text-left text-xs px-2 py-1.5 rounded font-medium transition-colors ${
                  filterPriority === 'All'
                    ? 'bg-black dark:bg-white text-white dark:text-black'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                All Priorities
              </button>
              {PRIORITIES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onSelectPriority(p.id)}
                  className={`text-left text-xs px-2 py-1.5 rounded font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 ${
                    filterPriority === p.id
                      ? 'bg-black dark:bg-white text-white dark:text-black'
                      : 'text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Category Filter */}
        <div className="relative">
          <button
            onClick={() => {
              setShowFilterMenu(!showFilterMenu);
              setShowPriorityMenu(false);
              setShowTemplateMenu(false);
              setShowBgMenu(false);
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded border text-xs font-semibold transition-colors ${
              filterCategory !== 'All'
                ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700'
            }`}
            title="Filter by Category"
          >
            <Filter className="w-3 h-3" />
            <span className="hidden sm:inline">{filterCategory}</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {showFilterMenu && (
            <div
              className="absolute right-0 top-10 w-44 rounded-lg p-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl z-50 flex flex-col gap-0.5"
              onClick={() => setShowFilterMenu(false)}
            >
              <button
                onClick={() => onSelectCategory('All')}
                className={`text-left text-xs px-2.5 py-1.5 rounded font-medium transition-colors ${
                  filterCategory === 'All'
                    ? 'bg-black dark:bg-white text-white dark:text-black'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                All Categories ({notesCount})
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`text-left text-xs px-2.5 py-1.5 rounded font-medium transition-colors ${
                    filterCategory === cat.id
                      ? 'bg-black dark:bg-white text-white dark:text-black'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
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
          className={`px-2.5 py-1.5 rounded border text-xs font-semibold transition-colors hidden sm:flex items-center gap-1 ${
            snapToGrid
              ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-xs'
              : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700'
          }`}
          title={snapToGrid ? 'Snap to Grid is Enabled (24px alignment)' : 'Enable Snap to Grid'}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Snap</span>
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded border bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* Create Note CTA */}
        <button
          onClick={() => onCreateNote()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-black dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-95 text-xs font-semibold text-white dark:text-black shadow-xs transition-all"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Note</span>
        </button>

        {/* Templates */}
        <div className="relative">
          <button
            onClick={() => {
              setShowTemplateMenu(!showTemplateMenu);
              setShowFilterMenu(false);
              setShowPriorityMenu(false);
              setShowBgMenu(false);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
            title="Templates"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            <span className="hidden sm:inline">Templates</span>
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </button>

          {showTemplateMenu && (
            <div
              className="absolute right-0 top-10 w-48 rounded-lg p-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl z-50 flex flex-col gap-0.5"
              onClick={() => setShowTemplateMenu(false)}
            >
              <button
                onClick={() => onResetTemplate('brainstorm')}
                className="w-full text-left px-2.5 py-2 rounded text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 transition-colors"
              >
                <FileText className="w-4 h-4 text-zinc-500" />
                <div>
                  <div>Classic Notes Setup</div>
                  <div className="text-[10px] text-zinc-500 font-normal">Default 5 notes layout</div>
                </div>
              </button>
              <button
                onClick={() => onResetTemplate('retrospective')}
                className="w-full text-left px-2.5 py-2 rounded text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 transition-colors"
              >
                <Kanban className="w-4 h-4 text-zinc-500" />
                <div>
                  <div>Sprint Tasks Board</div>
                  <div className="text-[10px] text-zinc-500 font-normal">Tasks & Action Items</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Export JSON */}
        <button
          onClick={onExportJSON}
          className="p-2 rounded bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors hidden sm:block"
          title="Export Notes as JSON"
        >
          <Download className="w-3.5 h-3.5" />
        </button>

        {/* Activity Drawer */}
        <button
          onClick={onOpenActivity}
          className="relative p-2 rounded bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"
          title="Activity Log"
        >
          <History className="w-3.5 h-3.5" />
          {activityCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-black dark:bg-white rounded-full text-[9px] font-bold flex items-center justify-center text-white dark:text-black shadow-xs">
              {activityCount > 9 ? '9+' : activityCount}
            </span>
          )}
        </button>

        {/* User Profile */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition-colors"
          title="Profile"
        >
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-mono font-bold text-white shadow-xs"
            style={{ backgroundColor: currentUser.color || '#000000' }}
          >
            <span>{currentUser.avatar || currentUser.name?.charAt(0) || 'U'}</span>
          </div>
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 hidden sm:inline max-w-[70px] truncate">
            {currentUser.name}
          </span>
        </button>
      </div>
    </header>
  );
}
