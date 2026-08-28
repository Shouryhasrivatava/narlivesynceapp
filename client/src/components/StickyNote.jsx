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
  Eraser,
  Eye,
  Edit3
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
  const [title, setTitle] = useState(note.title || '');
  const [content, setContent] = useState(note.content || '');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  // Floating Selection Popover State
  const [floatingPopover, setFloatingPopover] = useState(null);

  const noteRef = useRef(null);
  const textareaRef = useRef(null);
  const dragStartPos = useRef({ mouseX: 0, mouseY: 0, noteX: 0, noteY: 0 });
  const resizeStartPos = useRef({ mouseX: 0, mouseY: 0, width: 320, height: 230 });
  const lastSelectionRef = useRef({ start: 0, end: 0, text: '' });

  useEffect(() => {
    setTitle(note.title || '');
  }, [note.title]);

  useEffect(() => {
    setContent(note.content || '');
  }, [note.content]);

  const colorConfig = NOTE_COLORS[note.color] || NOTE_COLORS.white;
  const currentPriority = PRIORITIES.find((p) => p.id === note.priority) || PRIORITIES[1];
  const isLockedByOther = activeLock && activeLock.userId !== currentUser.id;
  const hasVoted = !!(note.votedUsers && note.votedUsers[currentUser.id]);

  const noteWidth = note.width || 320;
  const noteHeight = note.height || 230;

  // Track text selection in textarea
  const handleTextareaSelect = (e) => {
    const start = e.target.selectionStart;
    const end = e.target.selectionEnd;
    const text = content.substring(start, end);
    lastSelectionRef.current = { start, end, text };
  };

  // Track text selection in rendered view to show floating highlight bubble
  const handleRenderedMouseUp = (e) => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) {
      setFloatingPopover(null);
      return;
    }

    const selectedText = sel.toString().trim();
    if (!selectedText) {
      setFloatingPopover(null);
      return;
    }

    const rect = sel.getRangeAt(0).getBoundingClientRect();
    const noteRect = noteRef.current?.getBoundingClientRect();

    if (noteRect) {
      setFloatingPopover({
        x: Math.max(10, rect.left - noteRect.left + rect.width / 2 - 80),
        y: Math.max(10, rect.top - noteRect.top - 42),
        text: selectedText
      });
    }
  };

  // Apply Highlight
  const applyHighlight = (colorKey, overrideText = null) => {
    const targetText = overrideText || lastSelectionRef.current.text || '';

    if (isEditing && textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = content.substring(start, end) || lastSelectionRef.current.text;

      let replacement = '';
      if (colorKey === 'clear') {
        replacement = selected.replace(/\[hl:[a-z]+\](.*?)\[\/hl\]/gs, '$1').replace(/==(.*?)==/gs, '$1');
      } else if (colorKey === 'yellow') {
        replacement = `==${selected || 'highlighted text'}==`;
      } else {
        replacement = `[hl:${colorKey}]${selected || 'highlighted text'}[/hl]`;
      }

      const newContent = content.substring(0, start) + replacement + content.substring(end);
      setContent(newContent);
      onUpdate({ id: note.id, content: newContent });
      setShowHighlightMenu(false);
      setFloatingPopover(null);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(start, start + replacement.length);
        }
      }, 50);
      return;
    }

    // View Mode Highlight Application
    if (targetText && content.includes(targetText)) {
      let replacement = '';
      if (colorKey === 'clear') {
        replacement = targetText.replace(/\[hl:[a-z]+\](.*?)\[\/hl\]/gs, '$1').replace(/==(.*?)==/gs, '$1');
      } else if (colorKey === 'yellow') {
        replacement = `==${targetText}==`;
      } else {
        replacement = `[hl:${colorKey}]${targetText}[/hl]`;
      }

      const newContent = content.replace(targetText, replacement);
      setContent(newContent);
      onUpdate({ id: note.id, content: newContent });
      setFloatingPopover(null);
      setShowHighlightMenu(false);
      return;
    }

    // Fallback: Enter edit mode and append highlight placeholder
    setIsEditing(true);
    const tag = colorKey === 'yellow' ? '==highlighted text==' : `[hl:${colorKey}]highlighted text[/hl]`;
    const newContent = content ? `${content}\n${tag}` : tag;
    setContent(newContent);
    onUpdate({ id: note.id, content: newContent });
    setShowHighlightMenu(false);
    setFloatingPopover(null);
  };

  const applyTextFormat = (prefix, suffix = prefix) => {
    if (!isEditing) setIsEditing(true);

    setTimeout(() => {
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

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + prefix.length, end + prefix.length);
      }, 50);
    }, 50);
  };

  const insertChecklistItem = () => {
    setIsEditing(true);
    const newContent = content ? `${content.trim()}\n- [ ] ` : '- [ ] ';
    setContent(newContent);
    onUpdate({ id: note.id, content: newContent });

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newContent.length, newContent.length);
      }
    }, 50);
  };

  // Toggle checklist checkbox
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

  // Render highlighted segments
  const renderInlineHighlights = (text) => {
    const parts = text.split(/(\[hl:[a-z]+\](?:(?!\[\/hl\]).)+\[\/hl\]|==(?:(?!==).)+==|\*\*(?:(?!\*\*).)+\*\*)/gs);

    return parts.map((part, i) => {
      // 1. Standard markdown highlight ==text==
      if (part.startsWith('==') && part.endsWith('==') && part.length > 4) {
        return (
          <mark
            key={i}
            className="bg-[#fef08a] text-[#422006] px-1 py-0.5 rounded-[3px] font-medium mx-0.5"
            style={{ WebkitBoxDecorationBreak: 'clone', boxDecorationBreak: 'clone' }}
          >
            {part.slice(2, -2)}
          </mark>
        );
      }

      // 2. Tagged color highlight [hl:color]text[/hl]
      if (part.startsWith('[hl:') && part.includes(']')) {
        const match = part.match(/^\[hl:([a-z]+)\](.*)\[\/hl\]$/s);
        if (match) {
          const colorKey = match[1];
          const textInside = match[2];
          const highlightObj = HIGHLIGHT_COLORS.find((h) => h.id === colorKey) || HIGHLIGHT_COLORS[0];
          return (
            <mark
              key={i}
              className={`${highlightObj.bg} px-1 py-0.5 rounded-[3px] font-medium mx-0.5`}
              style={{ WebkitBoxDecorationBreak: 'clone', boxDecorationBreak: 'clone' }}
            >
              {textInside}
            </mark>
          );
        }
      }

      // 3. Bold text **text**
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return (
          <strong key={i} className="font-bold text-black dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }

      return part;
    });
  };

  // Formatted View Body
  const renderFormattedContent = () => {
    if (!content.trim()) {
      return (
        <p className="text-xs text-zinc-400 italic py-2">
          Click here to write notes, highlight text, or add checklists...
        </p>
      );
    }

    const lines = content.split('\n');

    return (
      <div
        onMouseUp={handleRenderedMouseUp}
        className="flex flex-col gap-1 text-xs text-zinc-900 dark:text-zinc-100 leading-relaxed font-sans select-text py-1"
      >
        {lines.map((line, idx) => {
          if (line.startsWith('- [ ]') || line.startsWith('- [x]')) {
            const isChecked = line.startsWith('- [x]');
            const itemText = line.replace(/^-\s*\[[ x]\]\s*/, '');
            return (
              <div
                key={idx}
                className="flex items-start gap-1.5 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 rounded p-0.5 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleChecklist(idx);
                }}
              >
                <button type="button" className="mt-0.5 text-zinc-800 dark:text-zinc-200 flex-shrink-0">
                  {isChecked ? (
                    <CheckSquare className="w-3.5 h-3.5 text-black dark:text-white fill-zinc-200 dark:fill-zinc-800" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-zinc-400" />
                  )}
                </button>
                <span className={`${isChecked ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                  {renderInlineHighlights(itemText)}
                </span>
              </div>
            );
          }

          return (
            <p key={idx} className="min-h-[1.2em]">
              {renderInlineHighlights(line)}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div
      ref={noteRef}
      className={`absolute rounded-lg border transition-all select-text flex flex-col justify-between ${colorConfig.bg} dark:bg-zinc-900 dark:border-zinc-800 dark:text-white ${
        isDragging
          ? 'matte-note-dragging cursor-grabbing z-50'
          : 'matte-note-card cursor-default'
      } ${isLockedByOther ? 'ring-2 ring-black dark:ring-white' : ''}`}
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

      {/* Floating Selection Highlighter Popover */}
      {floatingPopover && (
        <div
          className="absolute z-50 p-1 rounded-lg bg-black text-white shadow-xl flex items-center gap-1"
          style={{ left: floatingPopover.x, top: floatingPopover.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-[10px] font-bold px-1 text-zinc-300">Highlight:</span>
          {HIGHLIGHT_COLORS.map((h) => (
            <button
              key={h.id}
              onClick={() => applyHighlight(h.id, floatingPopover.text)}
              className="w-5 h-5 rounded-full border border-white/30 hover:scale-125 transition-transform"
              style={{ backgroundColor: h.marker }}
              title={`Highlighter (${h.name})`}
            />
          ))}
          <button
            onClick={() => applyHighlight('clear', floatingPopover.text)}
            className="p-1 text-zinc-400 hover:text-white"
            title="Clear Highlight"
          >
            <Eraser className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Note Header / Top Bar */}
      <div
        onMouseDown={handleMouseDownHeader}
        className={`px-3 py-2 rounded-t-lg flex items-center justify-between gap-1.5 cursor-grab active:cursor-grabbing border-b ${colorConfig.header} dark:bg-zinc-900/90 dark:border-zinc-800`}
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
                className="absolute left-0 top-6 w-32 rounded-lg p-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl z-50 flex flex-col gap-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                {PRIORITIES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onUpdate({ id: note.id, priority: p.id });
                      setShowPriorityPicker(false);
                    }}
                    className={`text-left text-xs px-2 py-1 rounded font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 ${
                      note.priority === p.id ? 'font-bold bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white' : 'text-zinc-700 dark:text-zinc-300'
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
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors flex items-center gap-1 text-zinc-800 dark:text-zinc-200"
            >
              <Tag className="w-2.5 h-2.5" />
              <span>{note.category || 'Notes'}</span>
            </button>

            {showCategoryPicker && (
              <div
                className="absolute left-0 top-6 w-36 rounded-lg p-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl z-50 flex flex-col gap-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onUpdate({ id: note.id, category: cat.id });
                      setShowCategoryPicker(false);
                    }}
                    className={`text-left text-xs px-2 py-1 rounded font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                      note.category === cat.id ? 'font-bold text-black dark:text-white bg-zinc-100 dark:bg-zinc-800' : 'text-zinc-700 dark:text-zinc-300'
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
              className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 bg-black dark:bg-white text-white dark:text-black rounded"
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
              note.pinned ? 'bg-black dark:bg-white text-white dark:text-black' : 'text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
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
              className="p-1 text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors"
              title="Shade"
            >
              <Palette className="w-3 h-3" />
            </button>

            {showColorPicker && (
              <div
                className="absolute right-0 top-6 p-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl z-50 flex gap-1"
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
                      note.color === key ? 'border-black dark:border-white scale-110 ring-1 ring-black dark:ring-white' : 'border-zinc-300 dark:border-zinc-700'
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
            className="p-1 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded transition-colors"
            title="Delete Note"
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
          className="w-full font-bold text-xs bg-transparent border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-black dark:focus:border-white focus:outline-none transition-colors px-1 py-0.5 rounded text-black dark:text-white"
        />

        {/* Clean Monochrome Formatting Toolbar */}
        <div className="flex items-center gap-1 py-1 border-y border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 select-none">
          {/* Clean Highlighter Symbol Button (Requested: no yellow background, clean symbol with "Highlighter" tooltip) */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowHighlightMenu(!showHighlightMenu);
              }}
              className={`p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors flex items-center gap-0.5 ${
                showHighlightMenu ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white' : ''
              }`}
              title="Highlighter"
            >
              <Highlighter className="w-3.5 h-3.5" />
            </button>

            {showHighlightMenu && (
              <div
                className="absolute left-0 top-7 rounded-lg p-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 shadow-2xl z-50 flex items-center gap-1.5"
                onClick={(e) => e.stopPropagation()}
              >
                {HIGHLIGHT_COLORS.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => applyHighlight(h.id)}
                    className="w-6 h-6 rounded flex items-center justify-center font-bold text-[10px] border border-black/20 hover:scale-115 transition-transform shadow-xs"
                    style={{ backgroundColor: h.marker }}
                    title={`Highlighter (${h.name})`}
                  >
                    A
                  </button>
                ))}
                <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-700 mx-0.5" />
                <button
                  onClick={() => applyHighlight('clear')}
                  className="p-1 rounded text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1 text-[10px]"
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
            className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors"
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              applyTextFormat('*', '*');
            }}
            className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors"
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              insertChecklistItem();
            }}
            className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors"
            title="Checklist"
          >
            <ListTodo className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              applyTextFormat('`', '`');
            }}
            className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors"
            title="Code"
          >
            <Code className="w-3.5 h-3.5" />
          </button>

          {/* Mode Switcher Toggle: Edit vs Preview */}
          <div className="ml-auto flex items-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(!isEditing);
              }}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-[10px] font-semibold transition-colors"
              title={isEditing ? 'Toggle Formatted Preview' : 'Toggle Raw Text Editor'}
            >
              {isEditing ? (
                <>
                  <Eye className="w-2.5 h-2.5" />
                  <span>Preview</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-2.5 h-2.5" />
                  <span>Edit</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto min-h-0 pt-1">
          {isEditing ? (
            <textarea
              ref={textareaRef}
              rows={5}
              value={content}
              disabled={isLockedByOther}
              onSelect={handleTextareaSelect}
              onChange={(e) => {
                setContent(e.target.value);
                onStartTyping(note.id);
              }}
              onFocus={() => onStartTyping(note.id)}
              onBlur={handleContentBlur}
              placeholder="Type note, select text & click Highlighter, or add checklists (- [ ])..."
              className="w-full h-full text-xs font-normal bg-transparent border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-zinc-800 focus:outline-none transition-colors p-1 rounded resize-none leading-relaxed font-sans text-zinc-900 dark:text-white"
              autoFocus
            />
          ) : (
            <div
              className="w-full h-full min-h-[60px] cursor-text p-1"
              onDoubleClick={() => setIsEditing(true)}
            >
              {renderFormattedContent()}
            </div>
          )}
        </div>
      </div>

      {/* Note Footer */}
      <div className="px-3 py-1.5 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[10px] text-zinc-500 relative">
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
            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors text-zinc-500 hover:text-black dark:hover:text-white"
            title="Duplicate Note"
          >
            <Copy className="w-2.5 h-2.5" />
          </button>

          <button
            onClick={handleVote}
            className={`flex items-center gap-1 px-2 py-0.5 rounded font-semibold transition-all ${
              hasVoted
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300'
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
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-center justify-center text-zinc-400 hover:text-black dark:hover:text-white select-none"
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
