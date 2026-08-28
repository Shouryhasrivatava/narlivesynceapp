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
      <div className="w-screen h-screen flex flex-col items-center justify-center gap-3 bg-[#fafafa] text-zinc-900">
        <div className="w-8 h-8 rounded bg-black text-white font-mono font-bold flex items-center justify-center text-xs">
          NAR
        </div>
        <div className="text-center flex flex-col items-center">
          <Loader2 className="w-4 h-4 text-zinc-600 animate-spin mb-1" />
          <h2 className="text-xs font-semibold text-zinc-700">Connecting to NAR Live Canvas...</h2>
          <p className="text-[11px] text-zinc-400 font-mono mt-0.5">Restoring persistent state</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#fafafa] text-zinc-900 font-sans">
      {/* Top Header with NAR Logo */}
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

      {/* Concurrent Conflict Resolution Toast */}
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
