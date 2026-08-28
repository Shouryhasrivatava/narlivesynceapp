import React, { useRef, useState, useCallback } from 'react';
import StickyNote from './StickyNote';
import LiveCursors from './LiveCursors';
import RadarPing from './RadarPing';
import { ZoomIn, ZoomOut, Maximize2, Sparkles } from 'lucide-react';

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

  const handleMouseMove = useCallback(
    (e) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const canvasX = (e.clientX - rect.left - pan.x) / zoom;
      const canvasY = (e.clientY - rect.top - pan.y) / zoom;

      onCursorMove({ x: canvasX, y: canvasY });

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
      color: ['sand', 'stone', 'mist', 'clay', 'slate', 'cream'][Math.floor(Math.random() * 6)]
    });
  };

  const handleCanvasClick = (e) => {
    if (e.shiftKey || e.altKey) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = Math.round((e.clientX - rect.left - pan.x) / zoom);
      const y = Math.round((e.clientY - rect.top - pan.y) / zoom);
      onPingCanvas(x, y);
    }
  };

  const handleMouseDown = (e) => {
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

  const handleMouseUp = () => setIsPanning(false);

  const handleZoomIn = () => setZoom((z) => Math.min(1.8, Number((z + 0.1).toFixed(2))));
  const handleZoomOut = () => setZoom((z) => Math.max(0.6, Number((z - 0.1).toFixed(2))));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

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
      className={`relative w-screen h-screen pt-14 overflow-hidden cursor-crosshair canvas-matte-grid select-none ${
        isPanning ? 'cursor-grab active:cursor-grabbing' : ''
      }`}
    >
      {/* Visual Canvas Layer */}
      <div
        className="canvas-background absolute inset-0 origin-top-left transition-transform duration-75"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          width: '4000px',
          height: '4000px'
        }}
      >
        <RadarPing pings={pings} />

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

        <LiveCursors cursors={cursors} />
      </div>

      {/* Floating Canvas Controls */}
      <div className="fixed bottom-6 left-6 z-30 flex items-center gap-1 rounded matte-panel p-1 bg-white border border-zinc-200 text-zinc-800">
        <button
          onClick={handleZoomIn}
          className="p-1.5 rounded hover:bg-zinc-100 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <span className="text-[11px] font-mono font-semibold px-1.5 text-zinc-500">
          {Math.round(zoom * 100)}%
        </span>

        <button
          onClick={handleZoomOut}
          className="p-1.5 rounded hover:bg-zinc-100 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-3.5 bg-zinc-200 my-auto mx-0.5" />

        <button
          onClick={handleResetView}
          className="p-1.5 rounded hover:bg-zinc-100 transition-colors"
          title="Reset View (100%)"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onPingCanvas(window.innerWidth / 2 - pan.x, window.innerHeight / 2 - pan.y)}
          className="p-1.5 rounded text-zinc-700 hover:bg-zinc-100 transition-colors"
          title="Attention Ping (or Shift+Click canvas)"
        >
          <Sparkles className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tip Badge */}
      <div className="fixed top-18 left-6 z-20 hidden lg:flex items-center gap-2 px-2.5 py-1 rounded bg-white border border-zinc-200 text-[11px] text-zinc-500 shadow-xs pointer-events-none">
        <span><b>Double-click</b> canvas to create note • <b>Shift+Click</b> to ping collaborators</span>
      </div>
    </main>
  );
}
