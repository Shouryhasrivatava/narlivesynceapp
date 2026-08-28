import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../context/SocketContext';

export function useLiveBoard() {
  const { socket, isConnected, currentUser } = useSocket();

  const [board, setBoard] = useState({ id: 'main-live-canvas', name: 'SyncSpace Team Canvas' });
  const [notes, setNotes] = useState([]);
  const [poll, setPoll] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activeLocks, setActiveLocks] = useState({});
  const [cursors, setCursors] = useState({});
  const [pings, setPings] = useState([]);
  const [conflictToasts, setConflictToasts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Highest z-index tracking for bringing notes to front
  const maxZIndexRef = useRef(20);

  // Throttle cursor broadcasting to ~30ms for optimal 60fps performance
  const lastCursorEmitRef = useRef(0);

  // Subscribe to all socket events
  useEffect(() => {
    if (!socket) return;

    // 1. Initial State Sync
    socket.on('board:init', (data) => {
      if (data.board) setBoard(data.board);
      if (Array.isArray(data.notes)) setNotes(data.notes);
      if (data.poll) setPoll(data.poll);
      if (Array.isArray(data.activities)) setActivities(data.activities);
      if (data.activeLocks) setActiveLocks(data.activeLocks);

      const maxZ = (data.notes || []).reduce((max, n) => Math.max(max, n.zIndex || 0), 20);
      maxZIndexRef.current = maxZ + 1;
      setIsLoading(false);
    });

    // 2. Note Real-Time Events
    socket.on('note:created', (newNote) => {
      setNotes((prev) => {
        if (prev.some((n) => n.id === newNote.id)) return prev;
        return [...prev, newNote];
      });
    });

    socket.on('note:updated', ({ note, conflictOccurred }) => {
      setNotes((prev) => prev.map((n) => (n.id === note.id ? note : n)));
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
    });

    socket.on('note:voted', ({ noteId, votes, votedUsers }) => {
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, votes, votedUsers } : n))
      );
    });

    socket.on('note:deleted', ({ id }) => {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      setActiveLocks((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    });

    // 3. Active Locks (Live Typing Indicators)
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
    });

    // 4. Live Collaborative Cursors
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

    // 5. Collaborative Radar Ping
    socket.on('canvas:ping_received', (pingData) => {
      const pingId = `ping-${Date.now()}-${Math.random()}`;
      setPings((prev) => [...prev, { ...pingData, id: pingId }]);

      setTimeout(() => {
        setPings((prev) => prev.filter((p) => p.id !== pingId));
      }, 2500);
    });

    // 6. Simultaneous Edit Conflict Alert
    socket.on('conflict:resolved', (conflictData) => {
      const toastId = `conflict-${Date.now()}`;
      setConflictToasts((prev) => [...prev, { ...conflictData, id: toastId }]);

      setTimeout(() => {
        setConflictToasts((prev) => prev.filter((t) => t.id !== toastId));
      }, 7000);
    });

    // 7. Poll & Board State
    socket.on('poll:updated', (updatedPoll) => {
      setPoll(updatedPoll);
    });

    socket.on('activity:new', (activity) => {
      setActivities((prev) => [...prev.slice(-59), activity]);
    });

    socket.on('board:reset', (resetData) => {
      if (resetData.board) setBoard(resetData.board);
      if (resetData.notes) setNotes(resetData.notes);
      if (resetData.poll) setPoll(resetData.poll);
      setActiveLocks({});
    });

    return () => {
      socket.off('board:init');
      socket.off('note:created');
      socket.off('note:updated');
      socket.off('note:moved');
      socket.off('note:voted');
      socket.off('note:deleted');
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

  // Broadcast mouse coordinates (throttled to ~30ms)
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
      const newNote = {
        id: tempId,
        title: initialData.title || 'New Idea',
        content: initialData.content || '',
        x: initialData.x ?? 150 + Math.random() * 200,
        y: initialData.y ?? 150 + Math.random() * 150,
        color: initialData.color || 'yellow',
        category: initialData.category || 'Idea',
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

      // Optimistically insert locally
      setNotes((prev) => [...prev, newNote]);

      // Emit to server
      if (socket && isConnected) {
        socket.emit('note:create', newNote, (res) => {
          if (res?.note && res.note.id !== tempId) {
            setNotes((prev) => prev.map((n) => (n.id === tempId ? res.note : n)));
          }
        });
      }

      return newNote;
    },
    [socket, isConnected, currentUser]
  );

  // Optimistic Note Update with Concurrency Metadata
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

      // Optimistic local update
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

      // Emit to server
      if (socket && isConnected) {
        socket.emit('note:update', payload);
      }
    },
    [socket, isConnected, notes, currentUser]
  );

  // Optimistic Move (Smooth 60fps drag)
  const moveNote = useCallback(
    (id, x, y, bringToFront = false) => {
      let zIndex;
      if (bringToFront) {
        maxZIndexRef.current += 1;
        zIndex = maxZIndexRef.current;
      }

      // Optimistically update position
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

      // Emit to server
      if (socket && isConnected) {
        socket.emit('note:move', { id, x, y, zIndex });
      }
    },
    [socket, isConnected]
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

      // Optimistic update
      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteId ? { ...n, votes: newVotes, votedUsers: newVotedUsers } : n
        )
      );

      // Emit to server
      if (socket && isConnected) {
        socket.emit('note:vote', { noteId, voteDelta, hasVoted: !hasVoted });
      }
    },
    [socket, isConnected, notes, currentUser]
  );

  // Optimistic Delete
  const deleteNote = useCallback(
    (id) => {
      // Optimistic removal
      setNotes((prev) => prev.filter((n) => n.id !== id));

      if (socket && isConnected) {
        socket.emit('note:delete', { id });
      }
    },
    [socket, isConnected]
  );

  // Typing Soft-Lock
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

  // Reset Canvas Template
  const resetBoard = useCallback(
    (template = 'brainstorm') => {
      if (socket && isConnected) {
        fetch('http://localhost:5000/api/board/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ template })
        }).catch((err) => console.error('Failed to reset board via REST:', err));
      }
    },
    [socket, isConnected]
  );

  const dismissConflictToast = useCallback((toastId) => {
    setConflictToasts((prev) => prev.filter((t) => t.id !== toastId));
  }, []);

  return {
    board,
    notes,
    poll,
    activities,
    activeLocks,
    cursors,
    pings,
    conflictToasts,
    isLoading,
    createNote,
    updateNote,
    moveNote,
    voteNote,
    deleteNote,
    startTyping,
    stopTyping,
    votePoll,
    pingCanvas,
    resetBoard,
    emitCursorMove,
    emitCursorLeave,
    dismissConflictToast
  };
}
