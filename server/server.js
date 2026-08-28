const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const { resolveNoteUpdate } = require('./conflictResolver');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(morgan('dev'));

// Socket.IO configuration with robust CORS and ping timeouts
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingTimeout: 30000,
  pingInterval: 10000
});

// State Persistence Helpers
const DATA_DIR = path.join(__dirname, 'data');
const STATE_FILE = path.join(DATA_DIR, 'canvas-state.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-Memory Authoritative State
let canvasState = {
  board: {
    id: 'main-live-canvas',
    name: 'SyncSpace Team Canvas',
    createdAt: Date.now(),
    lastModified: Date.now()
  },
  notes: [],
  poll: {
    id: 'poll-1',
    question: "What's the best real-time transport mechanism?",
    options: [
      { id: 'opt-1', text: 'WebSockets (Socket.IO)', votes: 12 },
      { id: 'opt-2', text: 'Server-Sent Events (SSE)', votes: 4 },
      { id: 'opt-3', text: 'WebRTC DataChannels', votes: 3 }
    ],
    votedUsers: {},
    totalVotes: 19
  },
  activities: []
};

// Connected Users & Active Locks Tracking
const onlineUsers = new Map(); // socket.id -> User Profile
const activeLocks = new Map(); // noteId -> { socketId, userId, userName, userColor, timestamp }

// Load state from file on startup
function loadStateFromDisk() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const rawData = fs.readFileSync(STATE_FILE, 'utf-8');
      const parsed = JSON.parse(rawData);
      canvasState = {
        board: parsed.board || canvasState.board,
        notes: Array.isArray(parsed.notes) ? parsed.notes : [],
        poll: parsed.poll || canvasState.poll,
        activities: Array.isArray(parsed.activities) ? parsed.activities.slice(-50) : []
      };
      console.log(`[Storage] Loaded ${canvasState.notes.length} sticky notes from disk.`);
    } else {
      saveStateToDisk();
    }
  } catch (err) {
    console.error('[Storage Error] Failed to load state from disk:', err);
  }
}

// Debounced Atomic State Writer
let saveTimeout = null;
function saveStateToDisk() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      const tempFile = `${STATE_FILE}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(canvasState, null, 2), 'utf-8');
      fs.renameSync(tempFile, STATE_FILE);
      console.log(`[Storage] Authoritative board state persisted atomically (${canvasState.notes.length} notes).`);
    } catch (err) {
      console.error('[Storage Error] Failed to persist state:', err);
    }
  }, 150);
}

// Add an activity record and trim to last 60
function logActivity(type, text, user) {
  const activity = {
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type,
    text,
    timestamp: Date.now(),
    user: {
      id: user?.id,
      name: user?.name || 'Anonymous',
      color: user?.color || '#6366f1'
    }
  };
  canvasState.activities.push(activity);
  if (canvasState.activities.length > 60) {
    canvasState.activities = canvasState.activities.slice(-60);
  }
  io.emit('activity:new', activity);
  saveStateToDisk();
}

// Initialize state
loadStateFromDisk();

// Template Presets for Instant Reset / Demos
const TEMPLATES = {
  brainstorm: {
    name: 'Brainstorming Board',
    notes: [
      {
        id: 'note-1',
        title: '⚡ Live Sync & Presence',
        content: 'Multiple tabs communicate via WebSockets / Socket.IO with sub-30ms latency! Watch cursors glide across the canvas.',
        x: 80,
        y: 120,
        color: 'yellow',
        category: 'Feature',
        pinned: false,
        votes: 8,
        votedUsers: {},
        version: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastEditedBy: 'System',
        lastEditedByColor: '#f59e0b',
        zIndex: 10
      },
      {
        id: 'note-2',
        title: '🛡️ 2nd-Year Concurrency & Merge',
        content: 'Try editing this note simultaneously in 2 tabs! Notice the live lock badge and 3-way non-destructive merging engine in action.',
        x: 430,
        y: 120,
        color: 'cyan',
        category: 'Architecture',
        pinned: true,
        votes: 14,
        votedUsers: {},
        version: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastEditedBy: 'System',
        lastEditedByColor: '#06b6d4',
        zIndex: 11
      },
      {
        id: 'note-3',
        title: '🚀 Optimistic UI Updates',
        content: 'Dragging, voting, and color toggles update instantly on client state before server acknowledgement for zero-latency feel.',
        x: 780,
        y: 120,
        color: 'pink',
        category: 'UX/UI',
        pinned: false,
        votes: 11,
        votedUsers: {},
        version: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastEditedBy: 'System',
        lastEditedByColor: '#ec4899',
        zIndex: 12
      },
      {
        id: 'note-4',
        title: '💾 Refresh Survival Guarantee',
        content: 'All state changes are persistently written to server disk atomically. Close any tab or hit F5; your canvas state is safely restored.',
        x: 250,
        y: 400,
        color: 'emerald',
        category: 'Persistence',
        pinned: false,
        votes: 9,
        votedUsers: {},
        version: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastEditedBy: 'System',
        lastEditedByColor: '#10b981',
        zIndex: 13
      },
      {
        id: 'note-5',
        title: '🎯 Team Brainstorming Idea',
        content: 'Double-click anywhere to quickly create a note, or click the toolbar button. You can change colors and tag categories on the fly!',
        x: 600,
        y: 400,
        color: 'purple',
        category: 'Idea',
        pinned: false,
        votes: 5,
        votedUsers: {},
        version: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastEditedBy: 'System',
        lastEditedByColor: '#8b5cf6',
        zIndex: 14
      }
    ]
  },
  retrospective: {
    name: 'Sprint Retrospective',
    notes: [
      {
        id: 'retro-1',
        title: '🟢 What Went Well',
        content: 'Socket.IO integration was rock solid. Reconnections worked automatically without dropped packets.',
        x: 100,
        y: 120,
        color: 'emerald',
        category: 'Good',
        pinned: false,
        votes: 6,
        votedUsers: {},
        version: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastEditedBy: 'System',
        lastEditedByColor: '#10b981',
        zIndex: 10
      },
      {
        id: 'retro-2',
        title: '🔴 What Could Be Improved',
        content: 'Handling simultaneous typing conflicts without overwriting required a thoughtful 3-way text merge algorithm.',
        x: 450,
        y: 120,
        color: 'pink',
        category: 'Needs Work',
        pinned: false,
        votes: 12,
        votedUsers: {},
        version: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastEditedBy: 'System',
        lastEditedByColor: '#ec4899',
        zIndex: 11
      },
      {
        id: 'retro-3',
        title: '💡 Action Items',
        content: 'Ship optimistic UI for all drag interactions and persist canvas state to disk on every change.',
        x: 800,
        y: 120,
        color: 'yellow',
        category: 'Action Item',
        pinned: false,
        votes: 10,
        votedUsers: {},
        version: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastEditedBy: 'System',
        lastEditedByColor: '#f59e0b',
        zIndex: 12
      }
    ]
  }
};

// ==========================================
// REST API Routes
// ==========================================
app.get('/api/board', (req, res) => {
  res.json({
    board: canvasState.board,
    notes: canvasState.notes,
    poll: canvasState.poll,
    activities: canvasState.activities,
    onlineCount: onlineUsers.size
  });
});

app.post('/api/board/reset', (req, res) => {
  const templateKey = req.body.template || 'brainstorm';
  const template = TEMPLATES[templateKey] || TEMPLATES.brainstorm;

  canvasState.notes = JSON.parse(JSON.stringify(template.notes));
  canvasState.board.name = template.name;
  canvasState.board.lastModified = Date.now();
  activeLocks.clear();

  logActivity('system', `Canvas reset to "${template.name}" template.`, { name: 'Admin', color: '#ec4899' });

  io.emit('board:reset', {
    board: canvasState.board,
    notes: canvasState.notes,
    poll: canvasState.poll,
    activeLocks: {}
  });

  saveStateToDisk();
  res.json({ success: true, message: `Canvas reset to ${template.name}` });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', onlineClients: onlineUsers.size, uptime: process.uptime() });
});

// ==========================================
// Socket.IO Real-Time Engine
// ==========================================
io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // 1. Initial Handshake & Registration
  socket.on('user:join', (userData) => {
    const user = {
      id: userData?.id || socket.id,
      socketId: socket.id,
      name: userData?.name || `Collaborator ${socket.id.substring(0, 4)}`,
      avatar: userData?.avatar || '🦊',
      color: userData?.color || '#3b82f6',
      cursor: null,
      joinedAt: Date.now()
    };

    onlineUsers.set(socket.id, user);

    // Send complete authoritative snapshot to joining user
    const locksObj = Object.fromEntries(activeLocks);
    socket.emit('board:init', {
      board: canvasState.board,
      notes: canvasState.notes,
      poll: canvasState.poll,
      activities: canvasState.activities,
      onlineUsers: Array.from(onlineUsers.values()),
      activeLocks: locksObj,
      currentUser: user
    });

    // Notify other users of new collaborator
    socket.broadcast.emit('user:joined', user);
    io.emit('presence:update', Array.from(onlineUsers.values()));

    logActivity('join', `${user.name} joined the canvas.`, user);
  });

  // 2. Real-Time Live Cursor Movement (High performance 60fps streaming)
  socket.on('cursor:move', (coords) => {
    const user = onlineUsers.get(socket.id);
    if (!user) return;

    user.cursor = { x: coords.x, y: coords.y, updatedAt: Date.now() };

    socket.broadcast.emit('cursor:update', {
      socketId: socket.id,
      userId: user.id,
      name: user.name,
      avatar: user.avatar,
      color: user.color,
      x: coords.x,
      y: coords.y
    });
  });

  socket.on('cursor:leave', () => {
    const user = onlineUsers.get(socket.id);
    if (user) user.cursor = null;
    socket.broadcast.emit('cursor:remove', { socketId: socket.id });
  });

  // 3. Collaborative Radar Ping (Click on Canvas)
  socket.on('canvas:ping', (point) => {
    const user = onlineUsers.get(socket.id);
    io.emit('canvas:ping_received', {
      x: point.x,
      y: point.y,
      user: user || { name: 'Collaborator', color: '#6366f1' }
    });
  });

  // 4. Live Typing Lock / Presence (Soft-locking for conflict awareness)
  socket.on('note:typing_start', ({ noteId }) => {
    const user = onlineUsers.get(socket.id);
    if (!user || !noteId) return;

    const lockInfo = {
      socketId: socket.id,
      userId: user.id,
      userName: user.name,
      userColor: user.color,
      startedAt: Date.now()
    };

    activeLocks.set(noteId, lockInfo);
    socket.broadcast.emit('lock:update', { noteId, lockInfo });
  });

  socket.on('note:typing_stop', ({ noteId }) => {
    const currentLock = activeLocks.get(noteId);
    if (currentLock && currentLock.socketId === socket.id) {
      activeLocks.delete(noteId);
      socket.broadcast.emit('lock:update', { noteId, lockInfo: null });
    }
  });

  // 5. Note Creation
  socket.on('note:create', (newNoteData, callback) => {
    const user = onlineUsers.get(socket.id) || { name: 'Collaborator', color: '#3b82f6' };
    const noteId = newNoteData.id || `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const newNote = {
      id: noteId,
      title: newNoteData.title || 'New Note',
      content: newNoteData.content || '',
      x: typeof newNoteData.x === 'number' ? newNoteData.x : 100,
      y: typeof newNoteData.y === 'number' ? newNoteData.y : 150,
      color: newNoteData.color || 'yellow',
      category: newNoteData.category || 'Idea',
      pinned: !!newNoteData.pinned,
      votes: 0,
      votedUsers: {},
      version: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastEditedBy: user.name,
      lastEditedByColor: user.color,
      zIndex: canvasState.notes.length + 10
    };

    canvasState.notes.push(newNote);
    saveStateToDisk();

    // Broadcast creation to all other clients
    socket.broadcast.emit('note:created', newNote);

    // Acknowledge back to sender
    if (typeof callback === 'function') {
      callback({ success: true, note: newNote });
    }

    logActivity('create', `${user.name} created note "${newNote.title}".`, user);
  });

  // 6. Note Update with 2nd-Year Concurrency & 3-Way Merge Conflict Resolution
  socket.on('note:update', (patch, callback) => {
    const user = onlineUsers.get(socket.id) || { id: socket.id, name: 'Collaborator', color: '#3b82f6' };
    const noteIndex = canvasState.notes.findIndex(n => n.id === patch.id);

    if (noteIndex === -1) {
      if (typeof callback === 'function') callback({ error: 'Note not found' });
      return;
    }

    const existingNote = canvasState.notes[noteIndex];
    const { resolvedNote, conflictOccurred, resolutionSummary } = resolveNoteUpdate(existingNote, patch, user);

    canvasState.notes[noteIndex] = resolvedNote;
    saveStateToDisk();

    // Release any lock on this note held by this user
    const currentLock = activeLocks.get(patch.id);
    if (currentLock && currentLock.socketId === socket.id) {
      activeLocks.delete(patch.id);
      io.emit('lock:update', { noteId: patch.id, lockInfo: null });
    }

    // Broadcast updated note to all clients
    io.emit('note:updated', {
      note: resolvedNote,
      conflictOccurred,
      updatedBy: user.name
    });

    // If a concurrent edit conflict was resolved non-destructively, notify room
    if (conflictOccurred) {
      io.emit('conflict:resolved', {
        noteId: patch.id,
        summary: resolutionSummary,
        note: resolvedNote,
        authors: [user.name, existingNote.lastEditedBy]
      });
      logActivity('conflict', resolutionSummary, user);
    } else {
      logActivity('update', `${user.name} updated note "${resolvedNote.title}".`, user);
    }

    if (typeof callback === 'function') {
      callback({ success: true, note: resolvedNote, conflictOccurred });
    }
  });

  // 7. Fast Position Drag (Optimistic 60fps movement broadcast)
  socket.on('note:move', ({ id, x, y, zIndex }) => {
    const user = onlineUsers.get(socket.id);
    const note = canvasState.notes.find(n => n.id === id);
    if (!note) return;

    note.x = x;
    note.y = y;
    if (zIndex !== undefined) note.zIndex = zIndex;
    note.updatedAt = Date.now();

    // Broadcast position instantly to other tabs
    socket.broadcast.emit('note:moved', { id, x, y, zIndex: note.zIndex, movedBy: user?.name });
    saveStateToDisk();
  });

  // 8. Note Upvoting (Collaborative reaction counter)
  socket.on('note:vote', ({ noteId, voteDelta, hasVoted }) => {
    const user = onlineUsers.get(socket.id) || { id: socket.id, name: 'Collaborator', color: '#ec4899' };
    const note = canvasState.notes.find(n => n.id === noteId);
    if (!note) return;

    note.votes = Math.max(0, (note.votes || 0) + (voteDelta || 1));
    note.votedUsers = note.votedUsers || {};
    note.votedUsers[user.id] = hasVoted;
    note.updatedAt = Date.now();

    io.emit('note:voted', {
      noteId,
      votes: note.votes,
      votedUsers: note.votedUsers,
      userId: user.id
    });

    saveStateToDisk();
    logActivity('vote', `${user.name} voted on "${note.title}".`, user);
  });

  // 9. Note Deletion
  socket.on('note:delete', ({ id }, callback) => {
    const user = onlineUsers.get(socket.id) || { name: 'Collaborator', color: '#ef4444' };
    const noteIndex = canvasState.notes.findIndex(n => n.id === id);

    if (noteIndex === -1) {
      if (typeof callback === 'function') callback({ error: 'Note not found' });
      return;
    }

    const [deletedNote] = canvasState.notes.splice(noteIndex, 1);
    activeLocks.delete(id);

    saveStateToDisk();

    io.emit('note:deleted', { id, deletedBy: user.name });
    io.emit('lock:update', { noteId: id, lockInfo: null });

    if (typeof callback === 'function') callback({ success: true });

    logActivity('delete', `${user.name} deleted note "${deletedNote.title}".`, user);
  });

  // 10. Live Collaborative Poll Voting
  socket.on('poll:vote', ({ optionId }) => {
    const user = onlineUsers.get(socket.id) || { id: socket.id, name: 'Collaborator' };
    const poll = canvasState.poll;
    if (!poll) return;

    poll.votedUsers = poll.votedUsers || {};
    const previousVote = poll.votedUsers[user.id];

    if (previousVote === optionId) {
      // Toggle off vote
      delete poll.votedUsers[user.id];
      const opt = poll.options.find(o => o.id === optionId);
      if (opt) opt.votes = Math.max(0, opt.votes - 1);
      poll.totalVotes = Math.max(0, poll.totalVotes - 1);
    } else {
      // If switching from another option
      if (previousVote) {
        const prevOpt = poll.options.find(o => o.id === previousVote);
        if (prevOpt) prevOpt.votes = Math.max(0, prevOpt.votes - 1);
        poll.totalVotes = Math.max(0, poll.totalVotes - 1);
      }
      // Add new vote
      poll.votedUsers[user.id] = optionId;
      const newOpt = poll.options.find(o => o.id === optionId);
      if (newOpt) newOpt.votes = (newOpt.votes || 0) + 1;
      poll.totalVotes = (poll.totalVotes || 0) + 1;
    }

    saveStateToDisk();
    io.emit('poll:updated', poll);
    logActivity('poll', `${user.name} voted in the collaborative poll.`, user);
  });

  // 11. User Profile Update
  socket.on('user:profile_update', (newProfile) => {
    const user = onlineUsers.get(socket.id);
    if (!user) return;

    user.name = newProfile.name || user.name;
    user.avatar = newProfile.avatar || user.avatar;
    user.color = newProfile.color || user.color;

    io.emit('presence:update', Array.from(onlineUsers.values()));
  });

  // 12. Disconnect Clean Up
  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
    const user = onlineUsers.get(socket.id);

    // Clean up any active editing locks held by this user
    for (const [noteId, lock] of activeLocks.entries()) {
      if (lock.socketId === socket.id) {
        activeLocks.delete(noteId);
        io.emit('lock:update', { noteId, lockInfo: null });
      }
    }

    // Remove user and broadcast
    onlineUsers.delete(socket.id);
    socket.broadcast.emit('cursor:remove', { socketId: socket.id });
    io.emit('presence:update', Array.from(onlineUsers.values()));

    if (user) {
      socket.broadcast.emit('user:left', { id: user.id, name: user.name });
      logActivity('leave', `${user.name} disconnected.`, user);
    }
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`🚀 [SyncSpace Server] Live-Sync WebSocket Server running on http://localhost:${PORT}`);
});
