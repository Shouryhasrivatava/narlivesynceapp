import React, { useState } from 'react';
import {
  Plus,
  History,
  LayoutGrid,
  Download,
  Filter,
  Grid,
  ChevronDown
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';
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
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 px-4 sm:px-6 flex items-center justify-between matte-panel border-b border-zinc-200 bg-white text-zinc-900">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2.5">
          {/* Requested NAR Logo with solid black background */}
          <div className="w-8 h-8 rounded bg-black text-white font-black font-mono flex items-center justify-center text-xs tracking-wider shadow-sm select-none">
            NAR
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-zinc-900 leading-none">
              NAR Live Canvas
            </h1>
            <p className="text-[10px] text-zinc-500 font-medium hidden md:block mt-0.5">
              Real-Time Collaborative Workspace
            </p>
          </div>
        </div>

        {/* Telemetry Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded bg-zinc-50 border border-zinc-200 text-[11px] font-mono">
          <span className="flex items-center gap-1.5 text-zinc-700 font-semibold">
            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            {isConnected ? 'LIVE' : 'OFFLINE'}
          </span>
          <span className="text-zinc-300">|</span>
          <span className="text-zinc-600 font-medium" title="Network round-trip latency">
            {pingLatency}ms
          </span>
          <span className="text-zinc-300">|</span>
          <span className="text-zinc-600 font-medium" title="Client frame rate">
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
              className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-xs shadow-sm transition-transform hover:scale-110 cursor-pointer"
              style={{ backgroundColor: user.color || '#18181b' }}
              title={`${user.name} ${user.id === currentUser.id ? '(You)' : ''}`}
            >
              <span className="text-white text-[11px]">{user.avatar || '👤'}</span>
            </div>
          ))}
          {onlineUsers.length > 5 && (
            <div className="w-7 h-7 rounded-full border-2 border-white bg-zinc-200 flex items-center justify-center text-[10px] font-bold text-zinc-700">
              +{onlineUsers.length - 5}
            </div>
          )}
        </div>
        <span className="text-xs text-zinc-500 font-medium">
          {onlineUsers.length} online
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Category Filter */}
        <div className="relative">
          <button
            onClick={() => {
              setShowFilterMenu(!showFilterMenu);
              setShowTemplateMenu(false);
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded border text-xs font-semibold transition-colors ${
              filterCategory !== 'All'
                ? 'bg-zinc-100 text-zinc-900 border-zinc-400'
                : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
            }`}
            title="Filter by Category"
          >
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            <span className="hidden sm:inline">{filterCategory}</span>
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </button>

          {showFilterMenu && (
            <div
              className="absolute right-0 top-10 w-44 rounded-lg p-1 matte-dropdown z-50 flex flex-col gap-0.5"
              onClick={() => setShowFilterMenu(false)}
            >
              <button
                onClick={() => onSelectCategory('All')}
                className={`text-left text-xs px-2.5 py-1.5 rounded font-medium transition-colors ${
                  filterCategory === 'All'
                    ? 'bg-black text-white'
                    : 'text-zinc-700 hover:bg-zinc-100'
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
                      ? 'bg-black text-white'
                      : 'text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Snap to Grid */}
        <button
          onClick={onToggleSnap}
          className={`p-2 rounded border text-xs transition-colors hidden sm:flex items-center ${
            snapToGrid
              ? 'bg-black text-white border-black'
              : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
          }`}
          title={snapToGrid ? 'Snap to Grid: Active (24px)' : 'Snap to Grid: Off'}
        >
          <Grid className="w-3.5 h-3.5" />
        </button>

        {/* Create Note CTA */}
        <button
          onClick={() => onCreateNote()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-black hover:bg-zinc-800 active:scale-95 text-xs font-semibold text-white shadow-xs transition-all"
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
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-white hover:bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-700 transition-colors"
            title="Load Template / Reset Canvas"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-zinc-500" />
            <span className="hidden sm:inline">Templates</span>
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </button>

          {showTemplateMenu && (
            <div
              className="absolute right-0 top-10 w-48 rounded-lg p-1 matte-dropdown z-50 flex flex-col gap-0.5"
              onClick={() => setShowTemplateMenu(false)}
            >
              <button
                onClick={() => onResetTemplate('brainstorm')}
                className="w-full text-left px-2.5 py-2 rounded text-xs font-semibold text-zinc-800 hover:bg-zinc-100 flex items-center gap-2 transition-colors"
              >
                <span>📋</span>
                <div>
                  <div>Brainstorm Board</div>
                  <div className="text-[10px] text-zinc-500 font-normal">Standard 5-note layout</div>
                </div>
              </button>
              <button
                onClick={() => onResetTemplate('retrospective')}
                className="w-full text-left px-2.5 py-2 rounded text-xs font-semibold text-zinc-800 hover:bg-zinc-100 flex items-center gap-2 transition-colors"
              >
                <span>🔄</span>
                <div>
                  <div>Sprint Retrospective</div>
                  <div className="text-[10px] text-zinc-500 font-normal">What Went Well / Action Items</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Export JSON */}
        <button
          onClick={onExportJSON}
          className="p-2 rounded bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-600 transition-colors hidden sm:block"
          title="Export Canvas State"
        >
          <Download className="w-3.5 h-3.5" />
        </button>

        {/* Activity Drawer */}
        <button
          onClick={onOpenActivity}
          className="relative p-2 rounded bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-600 transition-colors"
          title="Activity Log"
        >
          <History className="w-3.5 h-3.5" />
          {activityCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-black rounded-full text-[9px] font-bold flex items-center justify-center text-white shadow-xs">
              {activityCount > 9 ? '9+' : activityCount}
            </span>
          )}
        </button>

        {/* User Profile */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded bg-white hover:bg-zinc-50 border border-zinc-200 transition-colors"
          title="Profile"
        >
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
            style={{ backgroundColor: currentUser.color || '#18181b' }}
          >
            <span className="text-white text-[10px]">{currentUser.avatar || '👤'}</span>
          </div>
          <span className="text-xs font-medium text-zinc-700 hidden sm:inline max-w-[70px] truncate">
            {currentUser.name}
          </span>
        </button>
      </div>
    </header>
  );
}
