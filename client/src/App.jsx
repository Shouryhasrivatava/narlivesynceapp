import React, { useState } from 'react';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { useLiveBoard } from './hooks/useLiveBoard';
import Navbar from './components/Navbar';
import Canvas from './components/Canvas';
import LivePollWidget from './components/LivePollWidget';
import ActivityDrawer from './components/ActivityDrawer';
import UserProfileModal from './components/UserProfileModal';
import ConflictToast from './components/ConflictToast';
import { Loader2 } from 'lucide-react';

function LiveSyncBoardApp() {
  const { isDark } = useTheme();

  const {
    board,
    notes,
    rawNotesCount,
    poll,
    activities,
    activeLocks,
    cursors,
    pings,
    conflictToasts,
    isLoading,
    fps,
    pingLatency,
    snapToGrid,
    setSnapToGrid,
    filterCategory,
    setFilterCategory,
    createNote,
    updateNote,
    moveNote,
    voteNote,
    deleteNote,
    startTyping,
    stopTyping,
    votePoll,
    pingCanvas,
    resetBoard,
    exportBoardJSON,
    emitCursorMove,
    emitCursorLeave,
    dismissConflictToast
  } = useLiveBoard();

  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  if (isLoading) {
    return (
      <div className={`w-screen h-screen flex flex-col items-center justify-center gap-3 transition-colors ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}>
        <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-spin" />
        </div>
        <div className="text-center">
          <h2 className="text-sm font-bold">Connecting to SyncSpace...</h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">Restoring persistent canvas state</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-screen h-screen overflow-hidden transition-colors ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Navigation Header */}
      <Navbar
        notesCount={rawNotesCount}
        activityCount={activities.length}
        fps={fps}
        pingLatency={pingLatency}
        snapToGrid={snapToGrid}
        onToggleSnap={() => setSnapToGrid(!snapToGrid)}
        filterCategory={filterCategory}
        onSelectCategory={setFilterCategory}
        onCreateNote={createNote}
        onResetTemplate={resetBoard}
        onExportJSON={exportBoardJSON}
        onOpenActivity={() => setIsActivityOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Interactive Canvas */}
      <Canvas
        notes={notes}
        activeLocks={activeLocks}
        cursors={cursors}
        pings={pings}
        onUpdateNote={updateNote}
        onMoveNote={moveNote}
        onVoteNote={voteNote}
        onDeleteNote={deleteNote}
        onCreateNote={createNote}
        onStartTyping={startTyping}
        onStopTyping={stopTyping}
        onCursorMove={emitCursorMove}
        onCursorLeave={emitCursorLeave}
        onPingCanvas={pingCanvas}
      />

      {/* Live Poll Widget */}
      {poll && <LivePollWidget poll={poll} onVote={votePoll} />}

      {/* Activity Log Drawer */}
      <ActivityDrawer
        isOpen={isActivityOpen}
        onClose={() => setIsActivityOpen(false)}
        activities={activities}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      {/* Concurrent Conflict Toast */}
      <ConflictToast
        toasts={conflictToasts}
        onDismiss={dismissConflictToast}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SocketProvider>
        <LiveSyncBoardApp />
      </SocketProvider>
    </ThemeProvider>
  );
}
