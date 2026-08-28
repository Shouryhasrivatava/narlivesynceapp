import React, { useRef, useState, useCallback } from 'react';
import StickyNote from './StickyNote';
import LiveCursors from './LiveCursors';
import RadarPing from './RadarPing';
import { ZoomIn, ZoomOut, Maximize2, Sparkles, Plus, Navigation } from 'lucide-react';

export default function Canvas({
  notes,
  activeLocks,
  cursors,
  pings,
  onUpdateNote,
  onMoveNote,
  onVoteNote,
  onDeleteNote,
  onCreateNote,
  onStartTyping,
  onStopTyping,
  onCursorMove,
  onCursorLeave,
  onPingCanvas
}) {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ mouseX: 0, mouseY: 0, panX: 0, panY: 0 });

  // Handle Mouse Movement for Real-Time Cursor Tracking
  const handleMouseMove = useCallback(
    (e) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const canvasX = (e.clientX - rect.left - pan.x) / zoom;
      const canvasY = (e.clientY - rect.top - pan.y) / zoom;

      onCursorMove({ x: canvasX, y: canvasY });

      // Pan Canvas if middle click or spacebar drag
      if (isPanning) {
        setPan({
          x: panStartRef.current.panX + (e.clientX - panStartRef.current.mouseX),
          y: panStartRef.current.panY + (e.clientY - panStartRef.current.mouseY)
        });
      }
    },
    [onCursorMove, pan, zoom, isPanning]
  );

  const handleMouseLeave = useCallback(() => {
    onCursorLeave();
    setIsPanning(false);
  }, [onCursorLeave]);

  // Handle Double Click to Add Note at exact position
  const handleDoubleClick = (e) => {
    if (e.target !== canvasRef.current && !e.target.classList.contains('canvas-background')) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left - pan.x) / zoom);
    const y = Math.round((e.clientY - rect.top - pan.y) / zoom);

    onCreateNote({
      title: 'New Idea',
      content: '',
      x: Math.max(20, x - 140),
      y: Math.max(20, y - 50),
      color: ['yellow', 'cyan', 'pink', 'emerald', 'purple', 'coral'][Math.floor(Math.random() * 6)]
    });
  };

  // Canvas Click: Shift-Click or Alt-Click to trigger collaborative radar ping
  const handleCanvasClick = (e) => {
    if (e.shiftKey || e.altKey) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = Math.round((e.clientX - rect.left - pan.x) / zoom);
      const y = Math.round((e.clientY - rect.top - pan.y) / zoom);
      onPingCanvas(x, y);
    }
  };

  const handleMouseDown = (e) => {
    // Middle click or Alt+Drag to pan canvas
    if (e.button === 1 || (e.altKey && e.button === 0)) {
      e.preventDefault();
      setIsPanning(true);
      panStartRef.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        panX: pan.x,
        panY: pan.y
      };
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Zoom Controls
  const handleZoomIn = () => setZoom((z) => Math.min(1.8, Number((z + 0.1).toFixed(2))));
  const handleZoomOut = () => setZoom((z) => Math.max(0.6, Number((z - 0.1).toFixed(2))));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Duplicate a note
  const handleDuplicateNote = (note) => {
    onCreateNote({
      title: `${note.title} (Copy)`,
      content: note.content,
      x: note.x + 30,
      y: note.y + 30,
      color: note.color,
      category: note.category,
      pinned: false
    });
  };

  return (
    <main
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      onClick={handleCanvasClick}
      className={`relative w-screen h-screen pt-16 overflow-hidden canvas-grid-dark cursor-crosshair ${
        isPanning ? 'cursor-grab active:cursor-grabbing' : ''
      }`}
    >
      {/* Visual Canvas Transform Layer */}
      <div
        className="canvas-background absolute inset-0 origin-top-left transition-transform duration-75"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          width: '4000px',
          height: '4000px'
        }}
      >
        {/* Radar Ping Ripple Effects */}
        <RadarPing pings={pings} />

        {/* Sticky Notes */}
        {notes.map((note) => (
          <StickyNote
            key={note.id}
            note={note}
            activeLock={activeLocks[note.id]}
            onUpdate={onUpdateNote}
            onMove={onMoveNote}
            onVote={onVoteNote}
            onDelete={onDeleteNote}
            onDuplicate={handleDuplicateNote}
            onStartTyping={onStartTyping}
            onStopTyping={onStopTyping}
          />
        ))}

        {/* Live Collaborator Cursors */}
        <LiveCursors cursors={cursors} />
      </div>

      {/* Floating Canvas Controls (Bottom Left) */}
      <div className="fixed bottom-6 left-6 z-30 flex items-center gap-1.5 glass-panel rounded-2xl p-1.5 shadow-2xl border border-white/10 text-white">
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <span className="text-[11px] font-mono font-bold px-2 text-slate-300">
          {Math.round(zoom * 100)}%
        </span>

        <button
          onClick={handleZoomOut}
          className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-white/15 my-auto mx-0.5" />

        <button
          onClick={handleResetView}
          className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          title="Reset Canvas View (100%)"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <button
          onClick={() => onPingCanvas(window.innerWidth / 2 - pan.x, window.innerHeight / 2 - pan.y)}
          className="p-2 rounded-xl hover:bg-indigo-600/30 text-indigo-400 hover:text-indigo-200 transition-colors"
          title="Radar Ping Canvas (or Shift+Click anywhere)"
        >
          <Sparkles className="w-4 h-4 animate-spin" />
        </button>
      </div>

      {/* Helper Tip Badge */}
      <div className="fixed top-20 left-6 z-20 hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/10 backdrop-blur-md text-[11px] text-slate-400 pointer-events-none">
        <span>💡 <b>Double-click</b> canvas to create note • <b>Shift+Click</b> to ping collaborators</span>
      </div>
    </main>
  );
}
