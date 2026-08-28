import React, { useRef, useState, useCallback } from 'react';
import StickyNote from './StickyNote';
import LiveCursors from './LiveCursors';
import RadarPing from './RadarPing';
import CanvasConnectors from './CanvasConnectors';
import CanvasDrawings from './CanvasDrawings';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  MousePointer2,
  Pencil,
  GitBranchPlus,
  Trash2
} from 'lucide-react';

const DRAW_COLORS = ['#000000', '#2563eb', '#059669', '#e11d48', '#7c3aed', '#d97706'];

export default function Canvas({
  notes,
  activeLocks,
  cursors,
  pings,
  strokes = [],
  connectors = [],
  canvasMode = 'select',
  setCanvasMode,
  drawColor = '#000000',
  setDrawColor,
  drawWidth = 3,
  setDrawWidth,
  onAddStroke,
  onClearStrokes,
  onAddConnector,
  onDeleteConnector,
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
  const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 });

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState(null);

  // Connecting state
  const [connectSourceNoteId, setConnectSourceNoteId] = useState(null);

  // Convert screen coordinates to canvas space
  const getCanvasCoords = useCallback(
    (e) => {
      if (!canvasRef.current) return { x: 0, y: 0 };
      const rect = canvasRef.current.getBoundingClientRect();
      return {
        x: Math.round((e.clientX - rect.left - pan.x) / zoom),
        y: Math.round((e.clientY - rect.top - pan.y) / zoom)
      };
    },
    [pan, zoom]
  );

  const handleMouseMove = useCallback(
    (e) => {
      const coords = getCanvasCoords(e);
      setMouseCoords(coords);
      onCursorMove(coords);

      if (isPanning) {
        setPan({
          x: panStartRef.current.panX + (e.clientX - panStartRef.current.mouseX),
          y: panStartRef.current.panY + (e.clientY - panStartRef.current.mouseY)
        });
        return;
      }

      if (isDrawing && canvasMode === 'draw') {
        setCurrentStroke((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            points: [...prev.points, coords]
          };
        });
      }
    },
    [getCanvasCoords, onCursorMove, isPanning, isDrawing, canvasMode]
  );

  const handleMouseLeave = useCallback(() => {
    onCursorLeave();
    setIsPanning(false);
    if (isDrawing && currentStroke && currentStroke.points.length > 1) {
      onAddStroke(currentStroke);
    }
    setIsDrawing(false);
    setCurrentStroke(null);
  }, [onCursorLeave, isDrawing, currentStroke, onAddStroke]);

  const handleMouseDown = (e) => {
    // Middle click or Alt+click pans canvas
    if (e.button === 1 || (e.altKey && e.button === 0)) {
      e.preventDefault();
      setIsPanning(true);
      panStartRef.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        panX: pan.x,
        panY: pan.y
      };
      return;
    }

    // Freehand Drawing Mode
    if (canvasMode === 'draw' && e.button === 0) {
      if (e.target !== canvasRef.current && !e.target.classList.contains('canvas-background')) return;
      e.preventDefault();
      const coords = getCanvasCoords(e);
      setIsDrawing(true);
      setCurrentStroke({
        id: `stroke-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        points: [coords],
        color: drawColor,
        width: drawWidth
      });
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (isDrawing && currentStroke) {
      if (currentStroke.points.length > 1) {
        onAddStroke(currentStroke);
      }
      setIsDrawing(false);
      setCurrentStroke(null);
    }
  };

  const handleDoubleClick = (e) => {
    if (canvasMode !== 'select') return;
    if (e.target !== canvasRef.current && !e.target.classList.contains('canvas-background')) return;

    const coords = getCanvasCoords(e);

    onCreateNote({
      title: 'New Note',
      content: '',
      x: Math.max(20, coords.x - 160),
      y: Math.max(20, coords.y - 50),
      color: ['white', 'ivory', 'slate', 'zinc', 'amber'][Math.floor(Math.random() * 5)]
    });
  };

  const handleCanvasClick = (e) => {
    if (e.shiftKey) {
      const coords = getCanvasCoords(e);
      onPingCanvas(coords.x, coords.y);
    }
  };

  const handleNoteClickForConnect = (noteId) => {
    if (canvasMode === 'connect') {
      if (!connectSourceNoteId) {
        setConnectSourceNoteId(noteId);
      } else if (connectSourceNoteId !== noteId) {
        onAddConnector(connectSourceNoteId, noteId, drawColor);
        setConnectSourceNoteId(null);
      } else {
        setConnectSourceNoteId(null);
      }
    }
  };

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
      width: note.width,
      height: note.height,
      color: note.color,
      category: note.category,
      priority: note.priority,
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
      className={`relative w-screen h-screen pt-14 overflow-hidden select-none canvas-studio-bg ${
        canvasMode === 'draw'
          ? 'cursor-crosshair'
          : canvasMode === 'connect'
          ? 'cursor-pointer'
          : isPanning
          ? 'cursor-grab active:cursor-grabbing'
          : 'cursor-default'
      }`}
    >
      {/* Subtle Studio Ambient Lighting Overlay */}
      <div className="absolute inset-0 studio-ambient-light pointer-events-none z-0" />

      {/* Visual Canvas Layer */}
      <div
        className="canvas-background absolute inset-0 origin-top-left transition-transform duration-75"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          width: '4000px',
          height: '4000px'
        }}
      >
        {/* Collaborative Radar Ping */}
        <RadarPing pings={pings} />

        {/* StrawPage Freehand Drawings */}
        <CanvasDrawings strokes={strokes} currentStroke={currentStroke} />

        {/* Dynamic Arrows / Note Connectors */}
        <CanvasConnectors
          connectors={connectors}
          notes={notes}
          onDeleteConnector={onDeleteConnector}
        />

        {/* Interactive Sticky Notes */}
        {notes.map((note) => (
          <div
            key={note.id}
            onClick={() => handleNoteClickForConnect(note.id)}
            className={`transition-shadow ${
              connectSourceNoteId === note.id
                ? 'ring-4 ring-black dark:ring-white rounded-lg'
                : ''
            }`}
          >
            <StickyNote
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
          </div>
        ))}

        {/* Live Multiplayer Cursors */}
        <LiveCursors cursors={cursors} />
      </div>

      {/* Floating StrawPage Toolbar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 rounded-full matte-panel p-1.5 bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 shadow-xl backdrop-blur-md">
        {/* Select / Move */}
        <button
          onClick={() => {
            setCanvasMode('select');
            setConnectSourceNoteId(null);
          }}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            canvasMode === 'select'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
              : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
          }`}
          title="Select & Move Notes"
        >
          <MousePointer2 className="w-3.5 h-3.5" />
          <span>Select</span>
        </button>

        {/* Freehand Draw */}
        <button
          onClick={() => {
            setCanvasMode('draw');
            setConnectSourceNoteId(null);
          }}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            canvasMode === 'draw'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
              : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
          }`}
          title="Draw on canvas"
        >
          <Pencil className="w-3.5 h-3.5" />
          <span>Draw</span>
        </button>

        {/* Connect Notes (Arrows) */}
        <button
          onClick={() => setCanvasMode('connect')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            canvasMode === 'connect'
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
              : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
          }`}
          title="Connect notes with live arrows (Click Note A then Note B)"
        >
          <GitBranchPlus className="w-3.5 h-3.5" />
          <span>Connect</span>
        </button>

        {/* Color Palette */}
        {(canvasMode === 'draw' || canvasMode === 'connect') && (
          <div className="flex items-center gap-1 px-2 border-l border-zinc-200 dark:border-zinc-800">
            {DRAW_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setDrawColor(c)}
                className={`w-4 h-4 rounded-full border transition-transform hover:scale-125 ${
                  drawColor === c ? 'scale-125 ring-2 ring-black dark:ring-white border-transparent' : 'border-zinc-300 dark:border-zinc-700'
                }`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
            {strokes.length > 0 && canvasMode === 'draw' && (
              <button
                onClick={onClearStrokes}
                className="p-1 text-zinc-400 hover:text-rose-600 transition-colors ml-1"
                title="Clear drawings"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {canvasMode === 'connect' && (
          <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 px-2">
            {connectSourceNoteId ? '👉 Click target note' : '👉 Click 1st note'}
          </span>
        )}
      </div>

      {/* Floating Canvas Zoom Controls */}
      <div className="fixed bottom-6 left-6 z-30 flex items-center gap-1 rounded-full matte-panel p-1 bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 shadow-md backdrop-blur-md">
        <button
          onClick={handleZoomIn}
          className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <span className="text-[11px] font-mono font-semibold px-1 text-zinc-500 dark:text-zinc-400">
          {Math.round(zoom * 100)}%
        </span>

        <button
          onClick={handleZoomOut}
          className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-3.5 bg-zinc-200 dark:bg-zinc-700 my-auto mx-0.5" />

        <button
          onClick={handleResetView}
          className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Reset View (100%)"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onPingCanvas(window.innerWidth / 2 - pan.x, window.innerHeight / 2 - pan.y)}
          className="p-1.5 rounded-full text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Collaborative Radar Ping (or Shift+Click)"
        >
          <Sparkles className="w-3.5 h-3.5 text-black dark:text-white" />
        </button>
      </div>

      {/* Minimal Coordinates HUD */}
      <div className="fixed bottom-6 right-6 z-20 hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 text-[10px] font-mono text-zinc-400 dark:text-zinc-500 shadow-xs pointer-events-none">
        <span>X: {mouseCoords.x}</span>
        <span>|</span>
        <span>Y: {mouseCoords.y}</span>
      </div>

      {/* Tip Badge */}
      <div className="fixed top-18 left-6 z-20 hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400 shadow-xs pointer-events-none">
        <span><b>Studio Canvas</b> • Draw freely or click <b>Connect</b> to link notes</span>
      </div>
    </main>
  );
}
