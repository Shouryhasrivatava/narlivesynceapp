import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../context/SocketContext';

export default function useLiveBoard() {
  const { socket, isConnected, currentUser } = useSocket();

  const [board, setBoard] = useState({ id: 'main-live-canvas', name: 'Live Sync Mini App' });
  const [notes, setNotes] = useState([]);
  const [poll, setPoll] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activeLocks, setActiveLocks] = useState({});
  const [cursors, setCursors] = useState({});
  const [pings, setPings] = useState([]);
  const [conflictToasts, setConflictToasts] = useState([]);
  const [strokes, setStrokes] = useState([]);
  const [connectors, setConnectors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Canvas interaction mode: 'select' | 'draw' | 'connect'
  const [canvasMode, setCanvasMode] = useState('select');
  const [drawColor, setDrawColor] = useState('#000000');
  const [drawWidth, setDrawWidth] = useState(3);

  // Performance & Network Telemetry
  const [fps, setFps] = useState(60);
  const [pingLatency, setPingLatency] = useState(12);
  const [eventCount, setEventCount] = useState(0);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');

  // Highest z-index tracking
  const maxZIndexRef = useRef(20);
  const lastCursorEmitRef = useRef(0);

  // Measure FPS live
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animId;

    const calculateFps = (now) => {
      frameCount++;
      if (now - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(calculateFps);
    };

    animId = requestAnimationFrame(calculateFps);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Measure Socket Round-Trip Latency (Heartbeat)
  useEffect(() => {
    if (!socket || !isConnected) return;

    const interval = setInterval(() => {
      const start = Date.now();
      socket.emit('ping:check', () => {
        setPingLatency(Date.now() - start);
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [socket, isConnected]);

  // Subscribe to all socket events
  useEffect(() => {
    if (!socket) return;

    const incrementEvent = () => setEventCount((c) => c + 1);

    // 1. Initial State Sync
    socket.on('board:init', (data) => {
      if (data.board) setBoard(data.board);
      if (Array.isArray(data.notes)) setNotes(data.notes);
      if (data.poll) setPoll(data.poll);
      if (Array.isArray(data.activities)) setActivities(data.activities);
      if (Array.isArray(data.strokes)) setStrokes(data.strokes);
      if (Array.isArray(data.connectors)) setConnectors(data.connectors);
      if (data.activeLocks) setActiveLocks(data.activeLocks);

      const maxZ = (data.notes || []).reduce((max, n) => Math.max(max, n.zIndex || 0), 20);
      maxZIndexRef.current = maxZ + 1;
      setIsLoading(false);
      incrementEvent();
    });

    // 2. Note Events
    socket.on('note:created', (newNote) => {
      setNotes((prev) => {
        if (prev.some((n) => n.id === newNote.id)) return prev;
        return [...prev, newNote];
      });
      incrementEvent();
    });

    socket.on('note:updated', ({ note, conflictOccurred }) => {
      setNotes((prev) => prev.map((n) => (n.id === note.id ? note : n)));
      incrementEvent();
    });

    socket.on('note:moved', ({ id, x, y, zIndex }) => {
      setNotes((prev) =>
        prev.map((n) => {
          if (n.id === id) {
            return {
              ...n,
              x,
              y,
              zIndex: zIndex !== undefined ? zIndex : n.zIndex
            };
          }
          return n;
        })
      );
      incrementEvent();
    });

    socket.on('note:voted', ({ noteId, votes, votedUsers }) => {
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, votes, votedUsers } : n))
      );
      incrementEvent();
    });

    socket.on('note:deleted', ({ id }) => {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      setConnectors((prev) => prev.filter((c) => c.fromNoteId !== id && c.toNoteId !== id));
      setActiveLocks((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      incrementEvent();
    });

    // 3. StrawPage Freehand Drawings
    socket.on('stroke:created', (stroke) => {
      setStrokes((prev) => [...prev, stroke]);
      incrementEvent();
    });

    socket.on('stroke:cleared', () => {
      setStrokes([]);
      incrementEvent();
    });

    // 4. Note Connectors / Dynamic Arrows
    socket.on('connector:created', (connector) => {
      setConnectors((prev) => [...prev, connector]);
      incrementEvent();
    });

    socket.on('connector:deleted', ({ id }) => {
      setConnectors((prev) => prev.filter((c) => c.id !== id));
      incrementEvent();
    });

    // 5. Active Locks
    socket.on('lock:update', ({ noteId, lockInfo }) => {
      setActiveLocks((prev) => {
        const copy = { ...prev };
        if (lockInfo) {
          copy[noteId] = lockInfo;
        } else {
          delete copy[noteId];
        }
        return copy;
      });
      incrementEvent();
    });

    // 6. Live Cursors
    socket.on('cursor:update', (data) => {
      setCursors((prev) => ({
        ...prev,
        [data.socketId]: data
      }));
    });

    socket.on('cursor:remove', ({ socketId }) => {
      setCursors((prev) => {
        const copy = { ...prev };
        delete copy[socketId];
        return copy;
      });
    });

    // 7. Collaborative Radar Ping
    socket.on('canvas:ping_received', (pingData) => {
      const pingId = `ping-${Date.now()}-${Math.random()}`;
      setPings((prev) => [...prev, { ...pingData, id: pingId }]);
      incrementEvent();

      setTimeout(() => {
        setPings((prev) => prev.filter((p) => p.id !== pingId));
      }, 2500);
    });

    // 8. Conflict Resolution Notification
    socket.on('conflict:resolved', (conflictData) => {
      const toastId = `conflict-${Date.now()}`;
      setConflictToasts((prev) => [...prev, { ...conflictData, id: toastId }]);
      incrementEvent();

      setTimeout(() => {
        setConflictToasts((prev) => prev.filter((t) => t.id !== toastId));
      }, 7000);
    });

    // 9. Poll & Activities
    socket.on('poll:updated', (updatedPoll) => {
      setPoll(updatedPoll);
      incrementEvent();
    });

    socket.on('activity:new', (activity) => {
      setActivities((prev) => [...prev.slice(-59), activity]);
      incrementEvent();
    });

    socket.on('board:reset', (resetData) => {
      if (resetData.board) setBoard(resetData.board);
      if (resetData.notes) setNotes(resetData.notes);
      if (resetData.poll) setPoll(resetData.poll);
      setStrokes([]);
      setConnectors([]);
      setActiveLocks({});
      incrementEvent();
    });

    return () => {
      socket.off('board:init');
      socket.off('note:created');
      socket.off('note:updated');
      socket.off('note:moved');
      socket.off('note:voted');
      socket.off('note:deleted');
      socket.off('stroke:created');
      socket.off('stroke:cleared');
      socket.off('connector:created');
      socket.off('connector:deleted');
      socket.off('lock:update');
      socket.off('cursor:update');
      socket.off('cursor:remove');
      socket.off('canvas:ping_received');
      socket.off('conflict:resolved');
      socket.off('poll:updated');
      socket.off('activity:new');
      socket.off('board:reset');
    };
  }, [socket]);

  // Cursor broadcasting throttled to ~30ms
  const emitCursorMove = useCallback(
    (coords) => {
      if (!socket || !isConnected) return;
      const now = Date.now();
      if (now - lastCursorEmitRef.current > 30) {
        socket.emit('cursor:move', coords);
        lastCursorEmitRef.current = now;
      }
    },
    [socket, isConnected]
  );

  const emitCursorLeave = useCallback(() => {
    if (!socket || !isConnected) return;
    socket.emit('cursor:leave');
  }, [socket, isConnected]);

  // Ping canvas
  const pingCanvas = useCallback(
    (x, y) => {
      if (!socket || !isConnected) return;
      socket.emit('canvas:ping', { x, y });
    },
    [socket, isConnected]
  );

  // Optimistic Note Creation
  const createNote = useCallback(
    (initialData = {}) => {
      maxZIndexRef.current += 1;
      const tempId = `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

      let rawX = initialData.x ?? 150 + Math.random() * 200;
      let rawY = initialData.y ?? 150 + Math.random() * 150;

      if (snapToGrid) {
        rawX = Math.round(rawX / 24) * 24;
        rawY = Math.round(rawY / 24) * 24;
      }

      const newNote = {
        id: tempId,
        title: initialData.title || 'New Note',
        content: initialData.content || '',
        x: rawX,
        y: rawY,
        width: initialData.width || 320,
        height: initialData.height || 230,
        color: initialData.color || 'white',
        category: initialData.category || 'Notes',
        priority: initialData.priority || 'medium',
        pinned: !!initialData.pinned,
        votes: 0,
        votedUsers: {},
        version: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastEditedBy: currentUser.name,
        lastEditedByColor: currentUser.color,
        zIndex: maxZIndexRef.current
      };

      setNotes((prev) => [...prev, newNote]);

      if (socket && isConnected) {
        socket.emit('note:create', newNote, (res) => {
          if (res?.note && res.note.id !== tempId) {
            setNotes((prev) => prev.map((n) => (n.id === tempId ? res.note : n)));
          }
        });
      }

      return newNote;
    },
    [socket, isConnected, currentUser, snapToGrid]
  );

  // Optimistic Note Update
  const updateNote = useCallback(
    (patch) => {
      const existingNote = notes.find((n) => n.id === patch.id);
      if (!existingNote) return;

      const payload = {
        ...patch,
        baseVersion: existingNote.version || 1,
        baseContent: existingNote.content || '',
        baseTitle: existingNote.title || ''
      };

      setNotes((prev) =>
        prev.map((n) =>
          n.id === patch.id
            ? {
                ...n,
                ...patch,
                updatedAt: Date.now(),
                lastEditedBy: currentUser.name,
                lastEditedByColor: currentUser.color
              }
            : n
        )
      );

      if (socket && isConnected) {
        socket.emit('note:update', payload);
      }
    },
    [socket, isConnected, notes, currentUser]
  );

  // Optimistic Move
  const moveNote = useCallback(
    (id, x, y, bringToFront = false) => {
      let finalX = x;
      let finalY = y;

      if (snapToGrid) {
        finalX = Math.round(x / 24) * 24;
        finalY = Math.round(y / 24) * 24;
      }

      let zIndex;
      if (bringToFront) {
        maxZIndexRef.current += 1;
        zIndex = maxZIndexRef.current;
      }

      setNotes((prev) =>
        prev.map((n) => {
          if (n.id === id) {
            return {
              ...n,
              x: finalX,
              y: finalY,
              zIndex: zIndex !== undefined ? zIndex : n.zIndex
            };
          }
          return n;
        })
      );

      if (socket && isConnected) {
        socket.emit('note:move', { id, x: finalX, y: finalY, zIndex });
      }
    },
    [socket, isConnected, snapToGrid]
  );

  // Optimistic Upvote
  const voteNote = useCallback(
    (noteId) => {
      const note = notes.find((n) => n.id === noteId);
      if (!note) return;

      const hasVoted = !!(note.votedUsers && note.votedUsers[currentUser.id]);
      const voteDelta = hasVoted ? -1 : 1;
      const newVotes = Math.max(0, (note.votes || 0) + voteDelta);
      const newVotedUsers = { ...(note.votedUsers || {}), [currentUser.id]: !hasVoted };

      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteId ? { ...n, votes: newVotes, votedUsers: newVotedUsers } : n
        )
      );

      if (socket && isConnected) {
        socket.emit('note:vote', { noteId, voteDelta, hasVoted: !hasVoted });
      }
    },
    [socket, isConnected, notes, currentUser]
  );

  // Optimistic Delete
  const deleteNote = useCallback(
    (id) => {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (socket && isConnected) {
        socket.emit('note:delete', { id });
      }
    },
    [socket, isConnected]
  );

  // Freehand Drawing Actions
  const addStroke = useCallback(
    (stroke) => {
      setStrokes((prev) => [...prev, stroke]);
      if (socket && isConnected) {
        socket.emit('stroke:create', { stroke });
      }
    },
    [socket, isConnected]
  );

  const clearStrokes = useCallback(() => {
    setStrokes([]);
    if (socket && isConnected) {
      socket.emit('stroke:clear');
    }
  }, [socket, isConnected]);

  // Connector Actions (Dynamic Arrows between notes)
  const addConnector = useCallback(
    (fromNoteId, toNoteId, color = '#18181b') => {
      if (fromNoteId === toNoteId) return;
      const newConnector = {
        id: `conn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        fromNoteId,
        toNoteId,
        color
      };

      setConnectors((prev) => [...prev, newConnector]);
      if (socket && isConnected) {
        socket.emit('connector:create', { connector: newConnector });
      }
    },
    [socket, isConnected]
  );

  const deleteConnector = useCallback(
    (id) => {
      setConnectors((prev) => prev.filter((c) => c.id !== id));
      if (socket && isConnected) {
        socket.emit('connector:delete', { id });
      }
    },
    [socket, isConnected]
  );

  // Typing locks
  const startTyping = useCallback(
    (noteId) => {
      if (socket && isConnected) {
        socket.emit('note:typing_start', { noteId });
      }
    },
    [socket, isConnected]
  );

  const stopTyping = useCallback(
    (noteId) => {
      if (socket && isConnected) {
        socket.emit('note:typing_stop', { noteId });
      }
    },
    [socket, isConnected]
  );

  // Poll Vote
  const votePoll = useCallback(
    (optionId) => {
      if (socket && isConnected) {
        socket.emit('poll:vote', { optionId });
      }
    },
    [socket, isConnected]
  );

  // Create New Poll
  const createPoll = useCallback(
    (question, options) => {
      if (socket && isConnected) {
        socket.emit('poll:create', { question, options });
      }
    },
    [socket, isConnected]
  );

  // Reset Template
  const resetBoard = useCallback(
    (template = 'brainstorm') => {
      if (socket && isConnected) {
        fetch('http://localhost:5000/api/board/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ template })
        }).catch((err) => console.error('Failed to reset board:', err));
      }
    },
    [socket, isConnected]
  );

  // Export board as JSON
  const exportBoardJSON = useCallback(() => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ board, notes, poll, strokes, connectors }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `live-sync-canvas-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [board, notes, poll, strokes, connectors]);

  const dismissConflictToast = useCallback((toastId) => {
    setConflictToasts((prev) => prev.filter((t) => t.id !== toastId));
  }, []);

  const filteredNotes = notes.filter((n) => {
    const matchesCat = filterCategory === 'All' || n.category === filterCategory;
    const matchesPriority = filterPriority === 'All' || n.priority === filterPriority;
    return matchesCat && matchesPriority;
  });

  return {
    board,
    notes: filteredNotes,
    rawNotesCount: notes.length,
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
    eventCount,
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
  };
}
export { useLiveBoard };
