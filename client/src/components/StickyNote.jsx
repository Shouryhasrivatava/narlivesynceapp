import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Pin,
  PinOff,
  Trash2,
  ThumbsUp,
  Copy,
  Sparkles,
  Palette,
  Tag,
  Clock,
  GitMerge,
  GripHorizontal
} from 'lucide-react';
import confetti from 'canvas-confetti';
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
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const noteRef = useRef(null);
  const dragStartPos = useRef({ mouseX: 0, mouseY: 0, noteX: 0, noteY: 0 });

  // Sync local title & content when remote note updates (if not currently focused)
  useEffect(() => {
    setTitle(note.title);
  }, [note.title]);

  useEffect(() => {
    setContent(note.content);
  }, [note.content]);

  const colorConfig = NOTE_COLORS[note.color] || NOTE_COLORS.yellow;
  const isLockedByOther = activeLock && activeLock.userId !== currentUser.id;
  const hasVoted = !!(note.votedUsers && note.votedUsers[currentUser.id]);

  // Handle Dragging
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

  // Handle Content Change & Save
  const handleContentBlur = () => {
    onStopTyping(note.id);
    if (content !== note.content) {
      onUpdate({ id: note.id, content });
    }
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    onStopTyping(note.id);
    if (title !== note.title) {
      onUpdate({ id: note.id, title });
    }
  };

  // Upvote with micro-confetti burst
  const handleVote = (e) => {
    e.stopPropagation();
    onVote(note.id);

    if (!hasVoted) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 22,
        spread: 45,
        startVelocity: 25,
        origin: { x, y },
        colors: ['#6366f1', '#ec4899', '#f59e0b', '#10b981'],
        disableForReducedMotion: true
      });
    }
  };

  return (
    <div
      ref={noteRef}
      className={`absolute w-72 rounded-2xl transition-all duration-150 border-2 select-text ${
        colorConfig.bg
      } ${colorConfig.border} ${
        isDragging ? 'sticky-shadow-dragging cursor-grabbing' : 'sticky-shadow cursor-default'
      } ${
        isLockedByOther ? 'ring-2 ring-offset-2 ring-offset-slate-900' : ''
      }`}
      style={{
        left: note.x,
        top: note.y,
        zIndex: note.zIndex || 10,
        ringColor: activeLock?.userColor || '#6366f1'
      }}
      onClick={() => onMove(note.id, note.x, note.y, true)}
    >
      {/* Remote Editing Lock Banner */}
      {isLockedByOther && (
        <div
          className="absolute -top-7 left-0 right-0 mx-auto w-max px-2.5 py-0.5 rounded-full text-xs font-semibold text-white shadow-md flex items-center gap-1.5 animate-pulse border border-white/30"
          style={{ backgroundColor: activeLock.userColor || '#6366f1' }}
        >
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>⚡ {activeLock.userName} is editing...</span>
        </div>
      )}

      {/* Note Header / Drag Handle */}
      <div
        onMouseDown={handleMouseDownHeader}
        className={`px-3.5 py-2.5 rounded-t-2xl flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing border-b ${colorConfig.headerBg} border-black/5`}
      >
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <GripHorizontal className="w-4 h-4 text-black/30 flex-shrink-0" />
          {/* Category Tag */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowCategoryPicker(!showCategoryPicker);
                setShowColorPicker(false);
              }}
              className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-black/10 hover:bg-black/20 text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-1"
            >
              <Tag className="w-3 h-3" />
              <span>{note.category || 'Idea'}</span>
            </button>

            {/* Category Dropdown */}
            {showCategoryPicker && (
              <div
                className="absolute left-0 top-7 w-36 glass-dropdown rounded-xl p-1.5 shadow-2xl z-50 flex flex-col gap-1 border border-white/20"
                onClick={(e) => e.stopPropagation()}
              >
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onUpdate({ id: note.id, category: cat.id });
                      setShowCategoryPicker(false);
                    }}
                    className={`text-left text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors hover:bg-white/10 ${
                      note.category === cat.id ? 'bg-indigo-500/20 text-indigo-300 font-bold' : 'text-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Conflict Merged Badge */}
          {note.lastConflict && (
            <span
              title={note.lastConflict.summary}
              className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 bg-indigo-500 text-white rounded-md shadow-sm"
            >
              <GitMerge className="w-3 h-3" />
              <span>Merged</span>
            </span>
          )}
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1">
          {/* Pin Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdate({ id: note.id, pinned: !note.pinned });
            }}
            className={`p-1 rounded-lg transition-colors ${
              note.pinned ? 'bg-indigo-500 text-white' : 'text-black/40 hover:text-black/80 hover:bg-black/10'
            }`}
            title={note.pinned ? 'Unpin Note' : 'Pin Note in Place'}
          >
            {note.pinned ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />}
          </button>

          {/* Color Picker Toggle */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowColorPicker(!showColorPicker);
                setShowCategoryPicker(false);
              }}
              className="p-1 text-black/40 hover:text-black/80 hover:bg-black/10 rounded-lg transition-colors"
              title="Change Color"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>

            {/* Color Palette Dropdown */}
            {showColorPicker && (
              <div
                className="absolute right-0 top-7 glass-dropdown p-2 rounded-xl shadow-2xl z-50 flex gap-1.5 border border-white/20"
                onClick={(e) => e.stopPropagation()}
              >
                {Object.entries(NOTE_COLORS).map(([key, conf]) => (
                  <button
                    key={key}
                    onClick={() => {
                      onUpdate({ id: note.id, color: key });
                      setShowColorPicker(false);
                    }}
                    className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                      note.color === key ? 'border-white scale-110 ring-2 ring-indigo-500' : 'border-black/20'
                    }`}
                    style={{ backgroundColor: conf.accent }}
                    title={conf.name}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Delete Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note.id);
            }}
            className="p-1 text-black/40 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors"
            title="Delete Note"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Note Body */}
      <div className="p-3.5 flex flex-col gap-2">
        {/* Title Input */}
        <input
          type="text"
          value={title}
          disabled={isLockedByOther}
          onChange={(e) => {
            setTitle(e.target.value);
            onStartTyping(note.id);
          }}
          onFocus={() => {
            setIsEditingTitle(true);
            onStartTyping(note.id);
          }}
          onBlur={handleTitleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.target.blur();
            }
          }}
          placeholder="Note title..."
          className={`w-full font-bold text-sm bg-transparent border-b border-transparent hover:border-black/20 focus:border-indigo-500 focus:outline-none transition-colors px-1 py-0.5 rounded ${colorConfig.textColor}`}
        />

        {/* Content Textarea */}
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
          placeholder="Type thoughts or markdown..."
          className={`w-full text-xs font-medium bg-transparent border border-transparent hover:border-black/10 focus:border-indigo-500 focus:bg-white/40 dark:focus:bg-black/20 focus:outline-none transition-colors p-1.5 rounded-lg resize-none leading-relaxed font-sans ${colorConfig.textColor}`}
        />

        {/* Footer info & Upvotes */}
        <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: note.lastEditedByColor || '#6366f1' }}
            />
            <span className="truncate max-w-[100px] font-medium text-[10px]">
              {note.lastEditedBy || 'Anonymous'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Duplicate Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(note);
              }}
              className="p-1 hover:bg-black/10 rounded-md transition-colors text-black/50 hover:text-black/90"
              title="Duplicate Note"
            >
              <Copy className="w-3 h-3" />
            </button>

            {/* Upvote Button */}
            <button
              onClick={handleVote}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-bold transition-all ${
                hasVoted
                  ? 'bg-indigo-600 text-white shadow-sm scale-105'
                  : 'bg-black/10 hover:bg-black/20 text-slate-800 dark:text-slate-200'
              }`}
              title="Vote for this note"
            >
              <ThumbsUp className={`w-3 h-3 ${hasVoted ? 'fill-current' : ''}`} />
              <span>{note.votes || 0}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
