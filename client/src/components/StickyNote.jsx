import React, { useState, useEffect, useRef } from 'react';
import {
  Pin,
  PinOff,
  Trash2,
  ThumbsUp,
  Copy,
  Palette,
  Tag,
  GitMerge,
  GripHorizontal
} from 'lucide-react';
import { NOTE_COLORS, CATEGORIES } from '../types';
import { useSocket } from '../context/SocketContext';

export default function StickyNote({
  note,
  activeLock,
  onUpdate,
  onMove,
  onVote,
  onDelete,
  onDuplicate,
  onStartTyping,
  onStopTyping
}) {
  const { currentUser } = useSocket();
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const noteRef = useRef(null);
  const dragStartPos = useRef({ mouseX: 0, mouseY: 0, noteX: 0, noteY: 0 });

  useEffect(() => {
    setTitle(note.title);
  }, [note.title]);

  useEffect(() => {
    setContent(note.content);
  }, [note.content]);

  const colorConfig = NOTE_COLORS[note.color] || NOTE_COLORS.sand;
  const isLockedByOther = activeLock && activeLock.userId !== currentUser.id;
  const hasVoted = !!(note.votedUsers && note.votedUsers[currentUser.id]);

  const handleMouseDownHeader = (e) => {
    if (note.pinned || isLockedByOther) return;
    if (e.target.closest('button') || e.target.closest('input')) return;

    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
    dragStartPos.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      noteX: note.x,
      noteY: note.y
    };

    onMove(note.id, note.x, note.y, true);

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - dragStartPos.current.mouseX;
      const deltaY = moveEvent.clientY - dragStartPos.current.mouseY;
      const newX = Math.max(10, dragStartPos.current.noteX + deltaX);
      const newY = Math.max(10, dragStartPos.current.noteY + deltaY);

      onMove(note.id, newX, newY, false);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleContentBlur = () => {
    onStopTyping(note.id);
    if (content !== note.content) {
      onUpdate({ id: note.id, content });
    }
  };

  const handleTitleBlur = () => {
    onStopTyping(note.id);
    if (title !== note.title) {
      onUpdate({ id: note.id, title });
    }
  };

  const handleVote = (e) => {
    e.stopPropagation();
    onVote(note.id);
  };

  return (
    <div
      ref={noteRef}
      className={`absolute w-72 rounded-lg border transition-all duration-75 select-text ${colorConfig.bg} ${
        isDragging
          ? 'matte-note-dragging cursor-grabbing z-50'
          : 'matte-note-card cursor-default'
      } ${isLockedByOther ? 'ring-2 ring-zinc-800' : ''}`}
      style={{
        left: note.x,
        top: note.y,
        zIndex: note.zIndex || 10
      }}
      onClick={() => onMove(note.id, note.x, note.y, true)}
    >
      {/* Remote Editing Lock Banner */}
      {isLockedByOther && (
        <div
          className="absolute -top-7 left-0 right-0 mx-auto w-max px-2.5 py-0.5 rounded text-xs font-semibold text-white shadow-xs flex items-center gap-1.5 bg-black"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          <span>{activeLock.userName} is editing...</span>
        </div>
      )}

      {/* Note Header */}
      <div
        onMouseDown={handleMouseDownHeader}
        className={`px-3 py-2 rounded-t-lg flex items-center justify-between gap-1.5 cursor-grab active:cursor-grabbing border-b ${colorConfig.header}`}
      >
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <GripHorizontal className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
          {/* Category Tag */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowCategoryPicker(!showCategoryPicker);
                setShowColorPicker(false);
              }}
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-black/5 hover:bg-black/10 transition-colors flex items-center gap-1 text-zinc-800"
            >
              <Tag className="w-2.5 h-2.5" />
              <span>{note.category || 'Idea'}</span>
            </button>

            {showCategoryPicker && (
              <div
                className="absolute left-0 top-6 w-36 rounded-lg p-1 matte-dropdown z-50 flex flex-col gap-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onUpdate({ id: note.id, category: cat.id });
                      setShowCategoryPicker(false);
                    }}
                    className={`text-left text-xs px-2 py-1 rounded font-medium transition-colors hover:bg-zinc-100 ${
                      note.category === cat.id ? 'font-bold text-zinc-900 bg-zinc-100' : 'text-zinc-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Merged Conflict Indicator */}
          {note.lastConflict && (
            <span
              title={note.lastConflict.summary}
              className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 bg-black text-white rounded"
            >
              <GitMerge className="w-2.5 h-2.5" />
              <span>Merged</span>
            </span>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdate({ id: note.id, pinned: !note.pinned });
            }}
            className={`p-1 rounded transition-colors ${
              note.pinned ? 'bg-black text-white' : 'text-zinc-400 hover:text-zinc-800 hover:bg-black/5'
            }`}
            title={note.pinned ? 'Unpin' : 'Pin in place'}
          >
            {note.pinned ? <Pin className="w-3 h-3" /> : <PinOff className="w-3 h-3" />}
          </button>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowColorPicker(!showColorPicker);
                setShowCategoryPicker(false);
              }}
              className="p-1 text-zinc-400 hover:text-zinc-800 hover:bg-black/5 rounded transition-colors"
              title="Color"
            >
              <Palette className="w-3 h-3" />
            </button>

            {showColorPicker && (
              <div
                className="absolute right-0 top-6 p-1.5 rounded-lg matte-dropdown z-50 flex gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                {Object.entries(NOTE_COLORS).map(([key, conf]) => (
                  <button
                    key={key}
                    onClick={() => {
                      onUpdate({ id: note.id, color: key });
                      setShowColorPicker(false);
                    }}
                    className={`w-5 h-5 rounded border transition-transform hover:scale-110 ${
                      note.color === key ? 'border-black scale-110 ring-1 ring-black' : 'border-zinc-300'
                    }`}
                    style={{ backgroundColor: conf.accent }}
                    title={conf.name}
                  />
                ))}
              </div>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note.id);
            }}
            className="p-1 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Note Body */}
      <div className="p-3 flex flex-col gap-2">
        <input
          type="text"
          value={title}
          disabled={isLockedByOther}
          onChange={(e) => {
            setTitle(e.target.value);
            onStartTyping(note.id);
          }}
          onFocus={() => onStartTyping(note.id)}
          onBlur={handleTitleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.target.blur();
          }}
          placeholder="Note title..."
          className="w-full font-bold text-xs bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-zinc-900 focus:outline-none transition-colors px-1 py-0.5 rounded"
        />

        <textarea
          rows={3}
          value={content}
          disabled={isLockedByOther}
          onChange={(e) => {
            setContent(e.target.value);
            onStartTyping(note.id);
          }}
          onFocus={() => onStartTyping(note.id)}
          onBlur={handleContentBlur}
          placeholder="Write idea or note..."
          className="w-full text-xs font-normal bg-transparent border border-transparent hover:border-zinc-200 focus:border-zinc-900 focus:bg-white focus:outline-none transition-colors p-1.5 rounded resize-none leading-relaxed"
        />

        {/* Footer */}
        <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[10px] text-zinc-500">
          <div className="flex items-center gap-1">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: note.lastEditedByColor || '#18181b' }}
            />
            <span className="truncate max-w-[90px] font-medium">
              {note.lastEditedBy || 'Anonymous'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(note);
              }}
              className="p-1 hover:bg-black/5 rounded transition-colors text-zinc-500 hover:text-zinc-800"
              title="Duplicate"
            >
              <Copy className="w-2.5 h-2.5" />
            </button>

            <button
              onClick={handleVote}
              className={`flex items-center gap-1 px-2 py-0.5 rounded font-semibold transition-all ${
                hasVoted
                  ? 'bg-black text-white'
                  : 'bg-black/5 hover:bg-black/10 text-zinc-700'
              }`}
              title="Vote"
            >
              <ThumbsUp className={`w-2.5 h-2.5 ${hasVoted ? 'fill-current' : ''}`} />
              <span>{note.votes || 0}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
