import React, { useState } from 'react';
import { SocketProvider } from './context/SocketContext';
import { useLiveBoard } from './hooks/useLiveBoard';
import Navbar from './components/Navbar';
import Canvas from './components/Canvas';
import LivePollWidget from './components/LivePollWidget';
import ActivityDrawer from './components/ActivityDrawer';
import UserProfileModal from './components/UserProfileModal';
import ConflictToast from './components/ConflictToast';
import { Loader2 } from 'lucide-react';

function LiveSyncBoardApp() {
  const {
    board,
    notes,
    poll,
    activities,
    activeLocks,
    cursors,
    pings,
    conflictToasts,
    isLoading,
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
    emitCursorMove,
    emitCursorLeave,
    dismissConflictToast
  } = useLiveBoard();

  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-slate-950 text-white gap-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center animate-pulse">
          <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
        </div>
        <div className="text-center">
          <h2 className="text-base font-bold text-slate-100">Connecting to SyncSpace Live Server...</h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">Restoring board state and initializing WebSocket stream</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Top Navbar */}
      <Navbar
        notesCount={notes.length}
        activityCount={activities.length}
        onCreateNote={createNote}
        onResetTemplate={resetBoard}
        onOpenActivity={() => setIsActivityOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Interactive Canvas */}
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

      {/* Synchronized Collaborative Poll Widget */}
      {poll && <LivePollWidget poll={poll} onVote={votePoll} />}

      {/* Live Activity Audit Log Drawer */}
      <ActivityDrawer
        isOpen={isActivityOpen}
        onClose={() => setIsActivityOpen(false)}
        activities={activities}
      />

      {/* User Avatar & Name Profile Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      {/* Concurrent Edit Conflict Resolution Toast */}
      <ConflictToast
        toasts={conflictToasts}
        onDismiss={dismissConflictToast}
      />
    </div>
  );
}

export default function App() {
  return (
    <SocketProvider>
      <LiveSyncBoardApp />
    </SocketProvider>
  );
}
