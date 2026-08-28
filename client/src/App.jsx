import React, { useState, useEffect } from 'react';
import { SocketProvider } from './context/SocketContext';
import useLiveBoard from './hooks/useLiveBoard';
import Navbar from './components/Navbar';
import Canvas from './components/Canvas';
import LivePollWidget from './components/LivePollWidget';
import CreatePollModal from './components/CreatePollModal';
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
    strokes,
    connectors,
    canvasMode,
    setCanvasMode,
    drawColor,
    setDrawColor,
    drawWidth,
    setDrawWidth,
    isLoading,
    fps,
    pingLatency,
    snapToGrid,
    setSnapToGrid,
    filterCategory,
    setFilterCategory,
    filterPriority,
    setFilterPriority,
    createNote,
    updateNote,
    moveNote,
    voteNote,
    deleteNote,
    addStroke,
    clearStrokes,
    addConnector,
    deleteConnector,
    startTyping,
    stopTyping,
    votePoll,
    createPoll,
    pingCanvas,
    resetBoard,
    exportBoardJSON,
    emitCursorMove,
    emitCursorLeave,
    dismissConflictToast
  } = useLiveBoard();

  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCreatePollOpen, setIsCreatePollOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('live_sync_dark_mode') === 'true';
  });
  const [backgroundPattern, setBackgroundPattern] = useState(() => {
    return localStorage.getItem('live_sync_bg_pattern') || 'plain';
  });

  // Apply dark mode class to root HTML & Body
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('live_sync_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('live_sync_dark_mode', 'false');
    }
  }, [isDarkMode]);

  // Persist background pattern
  useEffect(() => {
    localStorage.setItem('live_sync_bg_pattern', backgroundPattern);
  }, [backgroundPattern]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center gap-3 bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
        <div className="w-8 h-8 rounded bg-black dark:bg-white text-white dark:text-black font-mono font-bold flex items-center justify-center text-xs">
          NAR
        </div>
        <div className="text-center flex flex-col items-center">
          <Loader2 className="w-4 h-4 text-zinc-600 dark:text-zinc-400 animate-spin mb-1" />
          <h2 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Connecting to Live Sync Mini App...</h2>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">Restoring persistent state</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans transition-colors">
      {/* Top Header */}
      <Navbar
        notesCount={rawNotesCount}
        activityCount={activities.length}
        fps={fps}
        pingLatency={pingLatency}
        snapToGrid={snapToGrid}
        onToggleSnap={() => setSnapToGrid(!snapToGrid)}
        backgroundPattern={backgroundPattern}
        onSelectBackgroundPattern={setBackgroundPattern}
        filterCategory={filterCategory}
        onSelectCategory={setFilterCategory}
        filterPriority={filterPriority}
        onSelectPriority={setFilterPriority}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
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
        strokes={strokes}
        connectors={connectors}
        snapToGrid={snapToGrid}
        backgroundPattern={backgroundPattern}
        canvasMode={canvasMode}
        setCanvasMode={setCanvasMode}
        drawColor={drawColor}
        setDrawColor={setDrawColor}
        drawWidth={drawWidth}
        setDrawWidth={setDrawWidth}
        onAddStroke={addStroke}
        onClearStrokes={clearStrokes}
        onAddConnector={addConnector}
        onDeleteConnector={deleteConnector}
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
      {poll && (
        <LivePollWidget
          poll={poll}
          onVote={votePoll}
          onOpenCreatePoll={() => setIsCreatePollOpen(true)}
        />
      )}

      {/* Create New Poll Modal */}
      <CreatePollModal
        isOpen={isCreatePollOpen}
        onClose={() => setIsCreatePollOpen(false)}
        onCreatePoll={createPoll}
      />

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
