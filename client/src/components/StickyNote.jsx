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
  GripHorizontal,
  Highlighter,
  Bold,
  Italic,
  Code,
  ListTodo,
  CheckSquare,
  Square,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import { NOTE_COLORS, CATEGORIES, PRIORITIES, HIGHLIGHT_COLORS } from '../types';
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
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const noteRef = useRef(null);
  const textareaRef = useRef(null);
  const dragStartPos = useRef({ mouseX: 0, mouseY: 0, noteX: 0, noteY: 0 });
  const resizeStartPos = useRef({ mouseX: 0, mouseY: 0, width: 320, height: 230 });

  useEffect(() => {
    setTitle(note.title);
  }, [note.title]);

  useEffect(() => {
    setContent(note.content);
  }, [note.content]);

  const colorConfig = NOTE_COLORS[note.color] || NOTE_COLORS.azure;
  const currentPriority = PRIORITIES.find((p) => p.id === note.priority) || PRIORITIES[1];
  const isLockedByOther = activeLock && activeLock.userId !== currentUser.id;
  const hasVoted = !!(note.votedUsers && note.votedUsers[currentUser.id]);

  const noteWidth = note.width || 320;
  const noteHeight = note.height || 230;

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

  // Resizing logic (Bottom-Right corner handle)
  const handleMouseDownResize = (e) => {
    if (note.pinned || isLockedByOther) return;
    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);
    resizeStartPos.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      width: noteWidth,
      height: noteHeight
    };

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - resizeStartPos.current.mouseX;
      const deltaY = moveEvent.clientY - resizeStartPos.current.mouseY;
      const newWidth = Math.max(260, Math.min(650, resizeStartPos.current.width + deltaX));
      const newHeight = Math.max(190, Math.min(650, resizeStartPos.current.height + deltaY));

      onUpdate({ id: note.id, width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Content formatting helpers (Google Docs Vibe)
  const applyTextFormat = (prefix, suffix = prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = selected
      ? `${prefix}${selected}${suffix}`
      : `${prefix}highlighted text${suffix}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    onUpdate({ id: note.id, content: newContent });
    setShowHighlightMenu(false);
  };

  const insertChecklistItem = () => {
    const newContent = content ? `${content.trim()}\n- [ ] New item` : '- [ ] New item';
    setContent(newContent);
    onUpdate({ id: note.id, content: newContent });
  };

  // Toggle checklist checkbox directly inside rendered content
  const handleToggleChecklist = (lineIndex) => {
    const lines = content.split('\n');
    const line = lines[lineIndex];
    if (!line) return;

    if (line.includes('- [ ]')) {
      lines[lineIndex] = line.replace('- [ ]', '- [x]');
    } else if (line.includes('- [x]')) {
      lines[lineIndex] = line.replace('- [x]', '- [ ]');
    }

    const updated = lines.join('\n');
    setContent(updated);
    onUpdate({ id: note.id, content: updated });
  };

  const handleContentBlur = () => {
    setIsEditing(false);
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

  // Custom Rich Content Renderer (Markdown + Highlights + Checklists)
  const renderFormattedContent = () => {
    if (!content.trim()) {
      return <p className="text-xs text-zinc-400 italic">Click to write notes, add tasks, or highlight key points...</p>;
    }

    const lines = content.split('\n');

    return (
      <div className="flex flex-col gap-1 text-xs text-zinc-800 leading-relaxed font-sans select-text">
        {lines.map((line, idx) => {
          // 1. Checklist item
          if (line.startsWith('- [ ]') || line.startsWith('- [x]')) {
            const isChecked = line.startsWith('- [x]');
            const itemText = line.replace(/^-\s*\[[ x]\]\s*/, '');
            return (
              <div
                key={idx}
                className="flex items-start gap-1.5 cursor-pointer hover:bg-black/5 rounded p-0.5"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleChecklist(idx);
                }}
              >
                <button type="button" className="mt-0.5 text-zinc-700">
                  {isChecked ? (
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-zinc-400" />
                  )}
                </button>
                <span className={`${isChecked ? 'line-through text-zinc-400' : 'text-zinc-800'}`}>
                  {renderInlineHighlights(itemText)}
                </span>
              </div>
            );
          }

          // 2. Normal paragraph with inline highlights and bold
          return (
            <p key={idx} className="min-h-[1.2em]">
              {renderInlineHighlights(line)}
            </p>
          );
        })}
      </div>
    );
  };

  // Helper for inline `==yellow==` or `[hl:color]...[/hl]` or `**bold**`
  const renderInlineHighlights = (text) => {
    // Replace ==text== with yellow highlight
    const parts = text.split(/(==[^=]+==|\[hl:[^\]]+\][^[]+\[\/hl\]|\*\*[^*]+\*\*)/g);

    return parts.map((part, i) => {
      if (part.startsWith('==') && part.endsWith('==')) {
        return (
          <mark key={i} className="bg-yellow-200/90 text-yellow-950 px-1 py-0.2 rounded font-medium">
            {part.slice(2, -2)}
          </mark>
        );
      }
      if (part.startsWith('[hl:') && part.includes(']')) {
        const colorMatch = part.match(/\[hl:([a-z]+)\](.*?)\[\/hl\]/);
        if (colorMatch) {
          const colorKey = colorMatch[1];
          const textInside = colorMatch[2];
          const highlightObj = HIGHLIGHT_COLORS.find((h) => h.id === colorKey) || HIGHLIGHT_COLORS[0];
          return (
            <mark key={i} className={`${highlightObj.bg} px-1 py-0.2 rounded font-medium`}>
              {textInside}
            </mark>
          );
        }
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-zinc-950">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div
      ref={noteRef}
      className={`absolute rounded-lg border transition-all select-text flex flex-col justify-between ${colorConfig.bg} ${
        isDragging
          ? 'matte-note-dragging cursor-grabbing z-50'
          : 'matte-note-card cursor-default'
      } ${isLockedByOther ? 'ring-2 ring-indigo-600' : ''}`}
      style={{
        left: note.x,
        top: note.y,
        width: `${noteWidth}px`,
        height: `${noteHeight}px`,
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

      {/* Note Header / Document Toolbar */}
      <div
        onMouseDown={handleMouseDownHeader}
        className={`px-3 py-2 rounded-t-lg flex items-center justify-between gap-1.5 cursor-grab active:cursor-grabbing border-b ${colorConfig.header}`}
      >
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <GripHorizontal className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />

          {/* Priority Marker Badge */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPriorityPicker(!showPriorityPicker);
                setShowCategoryPicker(false);
                setShowColorPicker(false);
                setShowHighlightMenu(false);
              }}
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded border transition-colors flex items-center gap-1 ${currentPriority.color}`}
              title="Set Priority Level"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${currentPriority.dot}`} />
              <span>{currentPriority.label}</span>
              <ChevronDown className="w-2.5 h-2.5 opacity-60" />
            </button>

            {showPriorityPicker && (
              <div
                className="absolute left-0 top-6 w-32 rounded-lg p-1 matte-dropdown z-50 flex flex-col gap-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                {PRIORITIES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onUpdate({ id: note.id, priority: p.id });
                      setShowPriorityPicker(false);
                    }}
                    className={`text-left text-xs px-2 py-1 rounded font-medium transition-colors hover:bg-zinc-100 flex items-center gap-1.5 ${
                      note.priority === p.id ? 'font-bold bg-zinc-100' : 'text-zinc-700'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${p.dot}`} />
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category Tag */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowCategoryPicker(!showCategoryPicker);
                setShowPriorityPicker(false);
                setShowColorPicker(false);
                setShowHighlightMenu(false);
              }}
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-black/5 hover:bg-black/10 transition-colors flex items-center gap-1 text-zinc-800"
            >
              <Tag className="w-2.5 h-2.5" />
              <span>{note.category || 'Docs'}</span>
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

          {/* Conflict Merged Indicator */}
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

        {/* Top Right Controls */}
        <div className="flex items-center gap-0.5">
          {/* Pin */}
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

          {/* Palette */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowColorPicker(!showColorPicker);
                setShowCategoryPicker(false);
                setShowPriorityPicker(false);
                setShowHighlightMenu(false);
              }}
              className="p-1 text-zinc-400 hover:text-zinc-800 hover:bg-black/5 rounded transition-colors"
              title="Theme Color"
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

          {/* Delete */}
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

      {/* Note Body (Title + Text Editor / Rich Viewer) */}
      <div className="p-3 flex-1 flex flex-col gap-1.5 overflow-hidden">
        {/* Title */}
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
          placeholder="Untitled Document..."
          className="w-full font-bold text-xs bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-zinc-900 focus:outline-none transition-colors px-1 py-0.5 rounded text-zinc-900"
        />

        {/* Google Docs Text Formatting Bar */}
        <div className="flex items-center gap-1 py-1 border-y border-black/5 text-zinc-600">
          {/* Highlight Picker Button */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowHighlightMenu(!showHighlightMenu);
                setIsEditing(true);
              }}
              className="p-1 rounded hover:bg-black/5 text-zinc-600 hover:text-zinc-900 transition-colors flex items-center gap-0.5"
              title="Highlight Text"
            >
              <Highlighter className="w-3 h-3 text-amber-600" />
            </button>

            {showHighlightMenu && (
              <div
                className="absolute left-0 top-6 rounded-lg p-1 matte-dropdown z-50 flex gap-1 shadow-md"
                onClick={(e) => e.stopPropagation()}
              >
                {HIGHLIGHT_COLORS.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => applyTextFormat(`[hl:${h.id}]`, `[/hl]`)}
                    className={`w-5 h-5 rounded text-[10px] font-bold border border-black/10 flex items-center justify-center hover:scale-110 transition-transform ${h.bg}`}
                    title={`Highlight ${h.name}`}
                  >
                    A
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              applyTextFormat('**', '**');
            }}
            className="p-1 rounded hover:bg-black/5 text-zinc-600 hover:text-zinc-900 transition-colors"
            title="Bold (**text**)"
          >
            <Bold className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              applyTextFormat('*', '*');
            }}
            className="p-1 rounded hover:bg-black/5 text-zinc-600 hover:text-zinc-900 transition-colors"
            title="Italic (*text*)"
          >
            <Italic className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              insertChecklistItem();
            }}
            className="p-1 rounded hover:bg-black/5 text-zinc-600 hover:text-zinc-900 transition-colors"
            title="Add Task Checklist (- [ ] item)"
          >
            <ListTodo className="w-3 h-3 text-indigo-600" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              applyTextFormat('`', '`');
            }}
            className="p-1 rounded hover:bg-black/5 text-zinc-600 hover:text-zinc-900 transition-colors"
            title="Code (`code`)"
          >
            <Code className="w-3 h-3" />
          </button>

          <div className="ml-auto text-[10px] text-zinc-400 font-mono">
            {isEditing ? (
              <span className="text-indigo-600 font-semibold">Editing</span>
            ) : (
              <span className="hover:text-zinc-700 cursor-pointer" onClick={() => setIsEditing(true)}>Edit</span>
            )}
          </div>
        </div>

        {/* Content Area: View or Edit Mode */}
        <div className="flex-1 overflow-y-auto min-h-0 pt-1">
          {isEditing ? (
            <textarea
              ref={textareaRef}
              rows={5}
              value={content}
              disabled={isLockedByOther}
              onChange={(e) => {
                setContent(e.target.value);
                onStartTyping(note.id);
              }}
              onFocus={() => onStartTyping(note.id)}
              onBlur={handleContentBlur}
              placeholder="Type note or checklist (- [ ] task, ==highlight==, **bold**)..."
              className="w-full h-full text-xs font-normal bg-transparent border border-transparent hover:border-zinc-200 focus:border-zinc-900 focus:bg-white focus:outline-none transition-colors p-1 rounded resize-none leading-relaxed font-sans"
              autoFocus
            />
          ) : (
            <div
              className="w-full h-full min-h-[60px] cursor-text p-1"
              onClick={() => setIsEditing(true)}
            >
              {renderFormattedContent()}
            </div>
          )}
        </div>
      </div>

      {/* Note Footer */}
      <div className="px-3 py-1.5 border-t border-black/5 flex items-center justify-between text-[10px] text-zinc-500 relative">
        <div className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: note.lastEditedByColor || '#1c2bff' }}
          />
          <span className="truncate max-w-[80px] font-medium">
            {note.lastEditedBy || 'Anonymous'}
          </span>
        </div>

        <div className="flex items-center gap-1 pr-3">
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

        {/* Resizable Corner Handle */}
        <div
          onMouseDown={handleMouseDownResize}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-center justify-center text-zinc-400 hover:text-black select-none"
          title="Drag to resize note dimensions"
        >
          <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor">
            <circle cx="5" cy="5" r="0.8" />
            <circle cx="5" cy="2" r="0.8" />
            <circle cx="2" cy="5" r="0.8" />
          </svg>
        </div>
      </div>
    </div>
  );
}
