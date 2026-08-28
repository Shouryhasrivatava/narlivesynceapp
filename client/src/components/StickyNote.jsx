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
import confetti from 'canvas-confetti';
import { NOTE_COLORS, CATEGORIES } from '../types';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';

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
  const { isDark } = useTheme();
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

  const colorConfig = NOTE_COLORS[note.color] || NOTE_COLORS.yellow;
  const isLockedByOther = activeLock && activeLock.userId !== currentUser.id;
  const hasVoted = !!(note.votedUsers && note.votedUsers[currentUser.id]);

  // Dragging logic
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

    onMove(note.id, note.x, note.y, true); // Bring to front

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

    if (!hasVoted) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 18,
        spread: 40,
        startVelocity: 20,
        origin: { x, y },
        colors: ['#4f46e5', '#db2777', '#d97706', '#059669'],
        disableForReducedMotion: true
      });
    }
  };

  const bgStyle = isDark ? colorConfig.bgDark : colorConfig.bgLight;
  const headerStyle = isDark ? colorConfig.headerDark : colorConfig.headerLight;

  return (
    <div
      ref={noteRef}
      className={`absolute w-72 rounded-xl transition-all duration-100 border select-text ${bgStyle} ${
        isDragging
          ? isDark
            ? 'matte-card-shadow-dark-drag cursor-grabbing'
            : 'matte-card-shadow-light-drag cursor-grabbing'
          : isDark
          ? 'matte-card-shadow-dark cursor-default'
          : 'matte-card-shadow-light cursor-default'
      } ${isLockedByOther ? 'ring-2 ring-indigo-500' : ''}`}
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
          className="absolute -top-7 left-0 right-0 mx-auto w-max px-2.5 py-0.5 rounded-full text-xs font-semibold text-white shadow-md flex items-center gap-1.5 animate-pulse border border-white/20"
          style={{ backgroundColor: activeLock.userColor || '#4f46e5' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          <span>⚡ {activeLock.userName} is typing...</span>
        </div>
      )}

      {/* Note Header */}
      <div
        onMouseDown={handleMouseDownHeader}
        className={`px-3 py-2 rounded-t-xl flex items-center justify-between gap-1.5 cursor-grab active:cursor-grabbing border-b ${headerStyle}`}
      >
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <GripHorizontal className="w-3.5 h-3.5 opacity-40 flex-shrink-0" />
          {/* Category Tag */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowCategoryPicker(!showCategoryPicker);
                setShowColorPicker(false);
              }}
              className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors flex items-center gap-1"
            >
              <Tag className="w-2.5 h-2.5" />
              <span>{note.category || 'Idea'}</span>
            </button>

            {showCategoryPicker && (
              <div
                className={`absolute left-0 top-6 w-36 rounded-xl p-1 shadow-xl z-50 flex flex-col gap-0.5 border ${
                  isDark ? 'matte-dropdown-dark' : 'matte-dropdown-light'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onUpdate({ id: note.id, category: cat.id });
                      setShowCategoryPicker(false);
                    }}
                    className={`text-left text-xs px-2 py-1 rounded font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/10 ${
                      note.category === cat.id ? 'font-bold text-indigo-600 dark:text-indigo-400' : ''
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
              className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 bg-indigo-600 text-white rounded shadow-sm"
            >
              <GitMerge className="w-2.5 h-2.5" />
              <span>Merged</span>
            </span>
          )}
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-0.5">
          {/* Pin */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdate({ id: note.id, pinned: !note.pinned });
            }}
            className={`p-1 rounded transition-colors ${
              note.pinned ? 'bg-indigo-600 text-white' : 'opacity-40 hover:opacity-90 hover:bg-black/5 dark:hover:bg-white/10'
            }`}
            title={note.pinned ? 'Unpin' : 'Pin'}
          >
            {note.pinned ? <Pin className="w-3 h-3" /> : <PinOff className="w-3 h-3" />}
          </button>

          {/* Palette */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowColorPicker(!showColorPicker);
                setShowCategoryPicker(false);
              }}
              className="p-1 opacity-40 hover:opacity-90 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors"
              title="Change Color"
            >
              <Palette className="w-3 h-3" />
            </button>

            {showColorPicker && (
              <div
                className={`absolute right-0 top-6 p-1.5 rounded-xl shadow-xl z-50 flex gap-1 border ${
                  isDark ? 'matte-dropdown-dark' : 'matte-dropdown-light'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {Object.entries(NOTE_COLORS).map(([key, conf]) => (
                  <button
                    key={key}
                    onClick={() => {
                      onUpdate({ id: note.id, color: key });
                      setShowColorPicker(false);
                    }}
                    className={`w-5 h-5 rounded-full border transition-transform hover:scale-110 ${
                      note.color === key ? 'border-indigo-600 scale-110 ring-2 ring-indigo-400' : 'border-black/10'
                    }`}
                    style={{ backgroundColor: conf.accent }}
                    title={conf.name}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Delete */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note.id);
            }}
            className="p-1 opacity-40 hover:opacity-100 hover:text-rose-600 hover:bg-rose-500/10 rounded transition-colors"
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
          className="w-full font-bold text-xs bg-transparent border-b border-transparent hover:border-black/10 dark:hover:border-white/10 focus:border-indigo-500 focus:outline-none transition-colors px-1 py-0.5 rounded"
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
          placeholder="Write note or idea..."
          className="w-full text-xs font-normal bg-transparent border border-transparent hover:border-black/5 dark:hover:border-white/5 focus:border-indigo-500 focus:bg-white/40 dark:focus:bg-black/30 focus:outline-none transition-colors p-1.5 rounded-lg resize-none leading-relaxed"
        />

        {/* Footer */}
        <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[10px] opacity-70">
          <div className="flex items-center gap-1">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: note.lastEditedByColor || '#4f46e5' }}
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
              className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors"
              title="Duplicate Note"
            >
              <Copy className="w-2.5 h-2.5" />
            </button>

            <button
              onClick={handleVote}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-bold transition-all ${
                hasVoted
                  ? 'bg-indigo-600 text-white shadow-sm scale-105'
                  : 'bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20'
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
