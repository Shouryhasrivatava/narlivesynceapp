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
  ChevronDown,
  Eraser
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

  const colorConfig = NOTE_COLORS[note.color] || NOTE_COLORS.white;
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
      const newWidth = Math.max(260, Math.min(700, resizeStartPos.current.width + deltaX));
      const newHeight = Math.max(180, Math.min(700, resizeStartPos.current.height + deltaY));

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

  // Improved Highlighting & Text Formatting
  const applyHighlight = (colorKey) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);

    let replacement = '';
    if (colorKey === 'clear') {
      // Strip highlight tags from selection
      replacement = selected.replace(/\[hl:[a-z]+\](.*?)\[\/hl\]/g, '$1').replace(/==(.*?)==/g, '$1');
    } else {
      const textToWrap = selected || 'highlighted text';
      replacement = `[hl:${colorKey}]${textToWrap}[/hl]`;
    }

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    onUpdate({ id: note.id, content: newContent });
    setShowHighlightMenu(false);

    // Re-focus and set selection
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start, start + replacement.length);
      }
    }, 50);
  };

  const applyTextFormat = (prefix, suffix = prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = selected
      ? `${prefix}${selected}${suffix}`
      : `${prefix}text${suffix}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    onUpdate({ id: note.id, content: newContent });
  };

  const insertChecklistItem = () => {
    const newContent = content ? `${content.trim()}\n- [ ] ` : '- [ ] ';
    setContent(newContent);
    onUpdate({ id: note.id, content: newContent });
    setIsEditing(true);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newContent.length, newContent.length);
      }
    }, 50);
  };

  // Toggle checklist checkbox in formatted view
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

  // Rich formatted content rendering with realistic fluorescent highlighters
  const renderFormattedContent = () => {
    if (!content.trim()) {
      return (
        <p className="text-xs text-zinc-400 italic">
          Click to type note, highlight text, or create checklists (- [ ])...
        </p>
      );
    }

    const lines = content.split('\n');

    return (
      <div className="flex flex-col gap-1 text-xs text-zinc-900 leading-relaxed font-sans select-text">
        {lines.map((line, idx) => {
          // Checklist item
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
                <button type="button" className="mt-0.5 text-zinc-800">
                  {isChecked ? (
                    <CheckSquare className="w-3.5 h-3.5 text-black" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-zinc-400" />
                  )}
                </button>
                <span className={`${isChecked ? 'line-through text-zinc-400' : 'text-zinc-900'}`}>
                  {renderInlineHighlights(itemText)}
                </span>
              </div>
            );
          }

          // Regular paragraph
          return (
            <p key={idx} className="min-h-[1.2em]">
              {renderInlineHighlights(line)}
            </p>
          );
        })}
      </div>
    );
  };

  // Parse inline `==text==` and `[hl:color]text[/hl]` with vibrant fluorescent styling
  const renderInlineHighlights = (text) => {
    const parts = text.split(/(\[hl:[a-z]+\](?:(?!\[\/hl\]).)+\[\/hl\]|==(?:(?!==).)+==|\*\*(?:(?!\*\*).)+\*\*)/g);

    return parts.map((part, i) => {
      // Standard markdown highlight ==text==
      if (part.startsWith('==') && part.endsWith('==')) {
        return (
          <mark
            key={i}
            className="bg-[#fef08a] text-[#422006] px-1 py-0.5 rounded-[3px] font-medium shadow-xs"
          >
            {part.slice(2, -2)}
          </mark>
        );
      }

      // Tagged color highlight [hl:color]text[/hl]
      if (part.startsWith('[hl:') && part.includes(']')) {
        const match = part.match(/^\[hl:([a-z]+)\](.*)\[\/hl\]$/s);
        if (match) {
          const colorKey = match[1];
          const textInside = match[2];
          const highlightObj = HIGHLIGHT_COLORS.find((h) => h.id === colorKey) || HIGHLIGHT_COLORS[0];
          return (
            <mark
              key={i}
              className={`${highlightObj.bg} px-1 py-0.5 rounded-[3px] font-medium shadow-xs`}
            >
              {textInside}
            </mark>
          );
        }
      }

      // Bold text **text**
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-black">
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
      } ${isLockedByOther ? 'ring-2 ring-black' : ''}`}
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
          className="absolute -top-7 left-0 right-0 mx-auto w-max px-2 py-0.5 rounded text-xs font-semibold text-white shadow-xs flex items-center gap-1.5 bg-black"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          <span>{activeLock.userName} is editing...</span>
        </div>
      )}

      {/* Note Header / Top Bar */}
      <div
        onMouseDown={handleMouseDownHeader}
        className={`px-3 py-2 rounded-t-lg flex items-center justify-between gap-1.5 cursor-grab active:cursor-grabbing border-b ${colorConfig.header}`}
      >
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <GripHorizontal className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />

          {/* Priority Marker */}
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
              title="Priority"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${currentPriority.dot}`} />
              <span>{currentPriority.label}</span>
              <ChevronDown className="w-2.5 h-2.5 opacity-60" />
            </button>

            {showPriorityPicker && (
              <div
                className="absolute left-0 top-6 w-32 rounded-lg p-1 bg-white border border-zinc-200 shadow-lg z-50 flex flex-col gap-0.5"
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
                      note.priority === p.id ? 'font-bold bg-zinc-100 text-black' : 'text-zinc-700'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
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
              <span>{note.category || 'Notes'}</span>
            </button>

            {showCategoryPicker && (
              <div
                className="absolute left-0 top-6 w-36 rounded-lg p-1 bg-white border border-zinc-200 shadow-lg z-50 flex flex-col gap-0.5"
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
                      note.category === cat.id ? 'font-bold text-black bg-zinc-100' : 'text-zinc-700'
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

        {/* Top Controls */}
        <div className="flex items-center gap-0.5">
          {/* Pin */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdate({ id: note.id, pinned: !note.pinned });
            }}
            className={`p-1 rounded transition-colors ${
              note.pinned ? 'bg-black text-white' : 'text-zinc-400 hover:text-black hover:bg-black/5'
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
              className="p-1 text-zinc-400 hover:text-black hover:bg-black/5 rounded transition-colors"
              title="Shade"
            >
              <Palette className="w-3 h-3" />
            </button>

            {showColorPicker && (
              <div
                className="absolute right-0 top-6 p-1.5 rounded-lg bg-white border border-zinc-200 shadow-lg z-50 flex gap-1"
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

      {/* Note Body */}
      <div className="p-3 flex-1 flex flex-col gap-1.5 overflow-hidden">
        {/* Note Title */}
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
          className="w-full font-bold text-xs bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-black focus:outline-none transition-colors px-1 py-0.5 rounded text-black"
        />

        {/* Formatting & Highlighting Toolbar */}
        <div className="flex items-center gap-1 py-1 border-y border-zinc-200 text-zinc-700 select-none">
          {/* Highlighter Tool Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowHighlightMenu(!showHighlightMenu);
                setIsEditing(true);
              }}
              className="px-1.5 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors flex items-center gap-1 text-[11px] font-semibold border border-zinc-300"
              title="Highlight Tool"
            >
              <Highlighter className="w-3 h-3 text-amber-600" />
              <span>Highlight</span>
              <ChevronDown className="w-2.5 h-2.5 opacity-60" />
            </button>

            {showHighlightMenu && (
              <div
                className="absolute left-0 top-6 rounded-lg p-1.5 bg-white border border-zinc-200 shadow-xl z-50 flex items-center gap-1.5"
                onClick={(e) => e.stopPropagation()}
              >
                {HIGHLIGHT_COLORS.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => applyHighlight(h.id)}
                    className="w-6 h-6 rounded flex items-center justify-center font-bold text-[10px] border border-black/20 hover:scale-110 transition-transform shadow-xs"
                    style={{ backgroundColor: h.marker }}
                    title={`Highlight ${h.name}`}
                  >
                    A
                  </button>
                ))}
                <div className="w-[1px] h-4 bg-zinc-200 mx-0.5" />
                <button
                  onClick={() => applyHighlight('clear')}
                  className="p-1 rounded text-zinc-600 hover:text-black hover:bg-zinc-100 transition-colors flex items-center gap-1 text-[10px]"
                  title="Clear Highlight"
                >
                  <Eraser className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              applyTextFormat('**', '**');
            }}
            className="p-1 rounded hover:bg-black/5 text-zinc-700 hover:text-black transition-colors"
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
            className="p-1 rounded hover:bg-black/5 text-zinc-700 hover:text-black transition-colors"
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
            className="p-1 rounded hover:bg-black/5 text-zinc-700 hover:text-black transition-colors"
            title="Add Checklist (- [ ] item)"
          >
            <ListTodo className="w-3 h-3 text-black" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              applyTextFormat('`', '`');
            }}
            className="p-1 rounded hover:bg-black/5 text-zinc-700 hover:text-black transition-colors"
            title="Code (`code`)"
          >
            <Code className="w-3 h-3" />
          </button>

          <div className="ml-auto text-[10px] text-zinc-400 font-mono">
            {isEditing ? (
              <span className="text-black font-bold">Editing</span>
            ) : (
              <span className="hover:text-black cursor-pointer font-medium" onClick={() => setIsEditing(true)}>Edit</span>
            )}
          </div>
        </div>

        {/* Content Body: Editable vs Rendered Mode */}
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
              placeholder="Type note, highlight text (==yellow== or [hl:green]text[/hl]), or add tasks (- [ ])..."
              className="w-full h-full text-xs font-normal bg-transparent border border-transparent hover:border-zinc-200 focus:border-black focus:bg-white focus:outline-none transition-colors p-1 rounded resize-none leading-relaxed font-sans text-zinc-900"
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
            style={{ backgroundColor: note.lastEditedByColor || '#000000' }}
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
            className="p-1 hover:bg-black/5 rounded transition-colors text-zinc-500 hover:text-black"
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
          title="Drag to resize dimensions"
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
