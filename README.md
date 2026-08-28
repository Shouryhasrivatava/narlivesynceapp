# SyncSpace — Real-Time Collaborative Live-Sync Canvas

> **MLSA SRM Technical Domain Recruitment Task (2026)**  
> **Track:** Frontend Web Development & Concurrency Systems  
> **Candidate:** 2nd-Year Undergraduate Submission  

---

### One-Line Concurrency Note (Required Submission Field)
> **Simultaneous edits are resolved using a hybrid strategy of live presence soft-locking, field-level version isolation, and an authoritative 3-way text merger that non-destructively blends concurrent edits without silent overwrites.**

---

## 1. What I Built & Architecture

**SyncSpace** is an interactive, multi-user idea canvas and sticky-note workspace. When you open two or more browser tabs side-by-side, actions in one tab reflect across all others in real time with sub-30ms latency.

```
+-------------------------------------------------------------------------+
|                      SYNCSPACE MULTI-TAB ARCHITECTURE                   |
|                                                                         |
|   +---------------------------+       +---------------------------+     |
|   |   Browser Tab A (React)   |       |   Browser Tab B (React)   |     |
|   |  - Optimistic UI Reducer  |       |  - Optimistic UI Reducer  |     |
|   |  - Live Cursors & Pings   |       |  - Live Cursors & Pings   |     |
|   |  - Drag & Drop Sticky     |       |  - Drag & Drop Sticky     |     |
|   +-------------+-------------+       +-------------+-------------+     |
|                 |                                   |                   |
|                 |   WebSockets / Socket.IO Stream   |                   |
|                 +---------------+-------------------+                   |
|                                 |                                       |
|   +-----------------------------v-----------------------------------+   |
|   |                  EXPRESS + SOCKET.IO BACKEND                    |   |
|   |  - Broadcast Engine (Cursors, Pings, Presence, Polls)           |   |
|   |  - 3-Way Merge Conflict Resolver (conflictResolver.js)          |   |
|   |  - Atomic Persistent Disk Store (canvas-state.json)             |   |
|   +-----------------------------------------------------------------+   |
+-------------------------------------------------------------------------+
```

### Core Components:
1. **Multiplayer Live Cursors & Presence:** 
   - Tracks cursor movement on the canvas and broadcasts coordinates at 60fps (throttled to ~30ms to prevent network congestion).
   - Shows user avatars, names, and customized color pointers.
   - `Shift + Click` sends an expanding attention ripple radar across all open tabs.
2. **Interactive Sticky Notes:**
   - Drag-and-drop cards with pastel matte color themes (*Yellow, Cyan, Pink, Mint, Violet, Coral*).
   - Inline markdown-friendly text editor, category tags (*Feature, Idea, Bug, Architecture, Task, Note*), and live upvote counters with micro-confetti.
3. **Live Collaborative Team Poll:**
   - Shared poll widget with synchronized percentage bars and instant vote updates.
4. **Matte Studio UI (Bright & Dark Mode):**
   - Clean, tactile paper surfaces with an architectural dot-grid canvas.
   - 1-click theme switch between Bright Light Mode and Dark Matte Mode.
   - Real-time Performance HUD showing live FPS, ping roundtrip (ms), and snap-to-grid toggle.

---

## 2. Second-Year Build-Ons Explained

### A. Optimistic UI Updates
When a user drags a note, votes, changes color, or creates a new card:
- The React client state updates **immediately** on `mousedown`/`input` without waiting for the server to acknowledge.
- This keeps the UI feeling instant (60fps) regardless of network jitter.
- The action payload is dispatched asynchronously via Socket.IO. If the server detects a version mismatch or conflict, the client receives the authoritative state and updates cleanly.

### B. Simultaneous Edit Conflict Resolution
When two tabs edit the same note at the exact same moment:
1. **Soft-Locking Presence:** When Tab A focuses on a note, a live banner (`⚡ Tab A is editing...`) appears on Tab B.
2. **Field-Level Isolation:** Edits to distinct fields (e.g. Tab A moves coordinates while Tab B edits text) do not overwrite each other; both mutations apply independently.
3. **Non-Destructive 3-Way Merge:** If both tabs modify the text content concurrently, the backend compares both changes against the common base version in `server/conflictResolver.js`, blends both inputs without data loss, and displays a `"Concurrent Edit Merged"` toast notification on both clients.

### C. State Refresh Survival (Persistence)
- In standard memory-only sockets, hitting `F5` clears everything.
- In SyncSpace, every change is written to `server/data/canvas-state.json` via **debounced atomic file writes** (`temp write -> atomic rename`).
- Reloading any tab or reopening the browser immediately restores all sticky notes, positions, tags, votes, and poll responses.

---

## 3. How to Run Locally

### Prerequisites
- Node.js 18 or higher installed.

### Steps:
1. Clone or open the folder in terminal:
   ```bash
   cd dbugs
   ```
2. Install all dependencies:
   ```bash
   npm.cmd run install:all
   ```
3. Start both backend (:5000) and frontend (:5173) concurrently:
   ```bash
   npm.cmd run dev
   ```
   *(If on macOS/Linux, run `npm run dev`)*
4. Open **`http://localhost:5173`** in two browser tabs side-by-side to test live multi-tab collaboration.

---

## 4. Concurrency Verification Tests

Run the automated test suite verifying field isolation and 3-way text merging:
```bash
node server/test-conflict.js
```

Run the end-to-end multi-client socket integration test:
```bash
node server/test-e2e-socket.js
```

---

## 5. Honest Reflections & Future Scope (2–3 Paragraphs)

Implementing real-time state synchronization with optimistic UI was an engaging exercise in managing latency and race conditions. Early on, I considered a simple Last-Write-Wins (LWW) model, but during multi-tab testing, I noticed that rapid concurrent typing could easily wipe out another collaborator's text if network packets arrived slightly out of order. Designing the 3-way merge algorithm in `conflictResolver.js` solved this by isolating field mutations and non-destructively combining paragraph additions.

If I had more time to expand the project, I would integrate a full Conflict-Free Replicated Data Type (CRDT) library like **Yjs** or **Automerge** alongside ProseMirror. That would unlock character-level operational transformation, allowing multiple users to type inside the exact same text sentence simultaneously with inline colored selection cursors (similar to Figma or Google Docs).

Another improvement would be adding **spatial indexing with QuadTrees** for canvas rendering. On very large boards with hundreds of sticky notes, culling out-of-view DOM elements would keep performance pinned at 60fps regardless of canvas size. Overall, the current combination of Socket.IO, optimistic reducers, and atomic disk persistence creates a responsive, dependable collaborative experience.

---

## 📁 Project Structure

```
dbugs/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ActivityDrawer.jsx    # Live chronological event stream
│   │   │   ├── Canvas.jsx            # Matte dot-grid canvas with pan/zoom
│   │   │   ├── ConflictToast.jsx     # Non-destructive merge notification
│   │   │   ├── LiveCursors.jsx       # 60fps multiplayer cursor pointers
│   │   │   ├── LivePollWidget.jsx    # Real-time collaborative team poll
│   │   │   ├── Navbar.jsx            # Header with presence, telemetry & themes
│   │   │   ├── RadarPing.jsx         # Attention ripple animation
│   │   │   ├── StickyNote.jsx        # Draggable card with locks & upvotes
│   │   │   └── UserProfileModal.jsx  # Avatar & color customizer
│   │   ├── context/
│   │   │   ├── SocketContext.jsx     # Socket.IO connection & user session
│   │   │   └── ThemeContext.jsx      # Bright Light / Dark Matte theme provider
│   │   ├── hooks/
│   │   │   └── useLiveBoard.js       # Optimistic state manager & telemetry
│   │   ├── types/
│   │   │   └── index.js              # Matte color palettes & categories
│   │   ├── App.jsx                   # Application root
│   │   └── index.css                 # Matte styling & grid patterns
│   ├── index.html
│   └── package.json
├── server/
│   ├── data/
│   │   └── canvas-state.json         # Authoritative disk persistence
│   ├── conflictResolver.js           # 3-way merge conflict resolution
│   ├── server.js                     # Express + Socket.IO backend
│   ├── test-conflict.js              # Concurrency automated tests
│   ├── test-e2e-socket.js            # Multi-client socket verification
│   └── package.json
├── VIDEO_WALKTHROUGH_SCRIPT.md       # 2-3 min video recording guide
├── package.json
└── README.md
```
