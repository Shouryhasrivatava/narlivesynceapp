# 🚀 SyncSpace — Real-Time Collaborative Live-Sync Canvas

> **MLSA SRM Technical Recruitment Task 2026**  
> **Domain:** Technical — Web Development (Frontend & Full-Stack Sync)  
> **Tier:** 2nd-Year Candidate Submission (Includes Optimistic UI, Simultaneous Edit Resolution, & Persistent State)

---

## 📌 How Simultaneous Edits Were Resolved (One-Line Note)
> **Simultaneous edits are resolved using a hybrid strategy of live presence soft-locking, field-level version isolation, and an authoritative 3-way text merger that non-destructively blends concurrent edits without silent overwrites.**

---

## 🌟 Project Overview
**SyncSpace** is a high-performance, real-time collaborative idea canvas and sticky-note board designed for distributed teams. Multiple collaborators can brainstorm simultaneously across browser tabs and devices with sub-30ms event synchronization.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      SYNCSPACE MULTI-TAB ARCHITECTURE                   │
│                                                                         │
│   ┌───────────────────────────┐       ┌───────────────────────────┐     │
│   │   Browser Tab A (React)   │       │   Browser Tab B (React)   │     │
│   │  • Optimistic UI Reducer  │       │  • Optimistic UI Reducer  │     │
│   │  • Live Cursors & Pings   │       │  • Live Cursors & Pings   │     │
│   │  • Drag & Drop Sticky     │       │  • Drag & Drop Sticky     │     │
│   └─────────────┬─────────────┘       └─────────────┬─────────────┘     │
│                 │                                   │                   │
│                 │   WebSockets / Socket.IO Stream   │                   │
│                 └───────────────┬───────────────────┘                   │
│                                 │                                       │
│   ┌─────────────────────────────▼───────────────────────────────────┐   │
│   │                  EXPRESS + SOCKET.IO BACKEND                    │   │
│   │  • Broadcast Engine (Cursors, Pings, Presence, Polls)           │   │
│   │  • 3-Way Merge Conflict Resolver (conflictResolver.js)          │   │
│   │  • Atomic Persistent Disk Store (canvas-state.json)             │   │
│   └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features & 2nd-Year Technical Implementation

### 1. Multiplayer Live Cursors & Presence
- **Sub-30ms Throttled Streaming**: Mouse coordinates are tracked and broadcast at 60fps with spring-physics interpolation.
- **Collaborator Badges**: Custom avatars, vibrant user colors, and display names hover dynamically above cursor pointers.
- **Presence Bar**: Active collaborator avatar stack in the navigation header with live join/leave detection.
- **Collaborative Radar Ping**: `Shift + Click` (or the toolbar ping button) creates an expanding multi-ring ripple visible to all participants to highlight canvas regions.

### 2. Interactive Sticky-Note Board
- **Fluid Drag-and-Drop**: Freeform canvas positioning with optimistic coordinate updates and dynamic z-index management.
- **Color & Tag Customization**: 6 pastel color palettes (Sun Yellow, Electric Cyan, Bubblegum Pink, Neon Mint, Lavender Purple, Coral Peach) and 6 semantic categories (*Feature*, *Idea*, *Bug*, *Architecture*, *UX/UI*, *Persistence*).
- **Collaborative Upvoting**: Live upvote counters with celebratory particle bursts.
- **Note Actions**: Pinning/locking, duplicating notes, and deletion.

### 3. 2nd-Year Build-On: Optimistic UI Engine
- All client interactions (dragging cards, editing text, toggling colors, voting, and deleting) update the local React state **instantaneously** before awaiting server round-trips.
- Guarantees zero perceptual latency and a smooth 60fps experience even on variable network conditions.
- Reconciles gracefully if the server returns an updated or merged version.

### 4. 2nd-Year Build-On: Simultaneous Edit Conflict Resolution
When two collaborators edit the same sticky note at the exact same moment:
1. **Active Soft-Locking Presence**: As soon as User A focuses on a note, a live glowing banner (`"⚡ User A is editing..."`) is broadcast to other tabs to signal active focus.
2. **Field-Level Isolation**: Edits targeting different attributes (e.g. User A changes position/color while User B modifies text) never conflict and merge cleanly.
3. **3-Way Non-Destructive Text Merge**: If both users modify the text content simultaneously, the server's `conflictResolver.js` compares both changes against the common base version, detects the divergence, merges both contributions non-destructively, and broadcasts a **"Concurrent Edit Merged"** toast notification so no thoughts are silently lost.

### 5. 2nd-Year Build-On: State Refresh Survival
- The authoritative canvas state is saved to `server/data/canvas-state.json` on the backend using **debounced atomic file writes** (`temp-file write -> atomic rename`).
- Closing a tab, refreshing (`F5`), or restarting the browser completely restores all sticky notes, coordinates, colors, votes, and poll tallies.

### 6. Synchronized Live Team Poll Widget
- Docked/expandable real-time poll widget with animated percentage bars and live vote counters that sync immediately across all tabs.

### 7. Real-Time Activity Audit Stream
- Slide-out drawer tracking timestamped chronological actions (joins, notes created, edits made, conflicts resolved, votes cast).

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Lucide React, Canvas-Confetti, Socket.IO Client.
- **Backend**: Node.js (18+), Express.js, Socket.IO, Morgan, CORS.
- **Persistence**: Atomic JSON File Store (`server/data/canvas-state.json`).
- **Conflict Resolution**: Custom 3-Way Diff & Field-Level Merge Engine (`conflictResolver.js`).

---

## 🚀 How to Run Locally

### Prerequisites
- **Node.js** v18.0.0 or higher installed.
- **npm** v9.0.0 or higher.

### Quick Start (Run Frontend & Backend Together)

1. Clone or open the repository folder in your terminal:
   ```bash
   cd dbugs
   ```

2. Install all dependencies for root, backend, and frontend:
   ```bash
   npm run install:all
   ```

3. Start both the Express server (`:5000`) and the React client (`:5173`) concurrently:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

5. **Demo with Two Tabs**: Open a second browser tab side-by-side at `http://localhost:5173` (or an Incognito window) to watch live cursors, dragging, concurrent editing, and synchronized voting in real time!

---

## 🧪 Running Concurrency & Conflict Tests

We have included an automated test suite verifying field-level merge independence, concurrent text editing, and additive voting logic:

```bash
node server/test-conflict.js
```

---

## 💭 Reflections & Future Improvements (2–3 Honest Paragraphs)

Building the real-time synchronization layer with Socket.IO and optimistic updates was an insightful challenge in balancing client responsiveness with server-authoritative integrity. In the early design phase, a naive approach might have relied on simple Last-Write-Wins (LWW) for all edits; however, testing simultaneous edits revealed how easily subtle user inputs could get accidentally overwritten when two tabs submitted changes within milliseconds. Implementing field-level separation and a non-destructive 3-way merge algorithm ensured that positioning, tagging, and text updates could coexist gracefully without frustrating user loss.

With more time, the next architectural evolution would be integrating **Conflict-Free Replicated Data Types (CRDTs)** such as **Yjs** or **Automerge** combined with ProseMirror or TipTap. While our current 3-way merge works effectively at the paragraph and note level, CRDTs would enable sub-character collaborative rich-text typing with inline collaborator selection ranges directly within the sticky-note textarea (similar to Google Docs or Figma).

Additionally, scaling this to thousands of concurrent sticky notes across expansive team boards would benefit from **spatial indexing (QuadTrees or R-Trees)** on the canvas to cull out-of-viewport elements and WebRTC DataChannels for peer-to-peer cursor streams, offloading high-frequency mouse telemetry from the central WebSocket server.

---

## 📁 Repository Structure

```
dbugs/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ActivityDrawer.jsx    # Real-time event audit log drawer
│   │   │   ├── Canvas.jsx            # Pan/zoomable interactive grid canvas
│   │   │   ├── ConflictToast.jsx     # Non-destructive merge notification toast
│   │   │   ├── LiveCursors.jsx       # Real-time multiplayer cursor rendering
│   │   │   ├── LivePollWidget.jsx    # Synchronized team poll with animated bars
│   │   │   ├── Navbar.jsx            # Header with presence and controls
│   │   │   ├── RadarPing.jsx         # Ripple attention ping animation
│   │   │   ├── StickyNote.jsx        # Draggable card with locks & upvotes
│   │   │   └── UserProfileModal.jsx  # Avatar & username customizer
│   │   ├── context/
│   │   │   └── SocketContext.jsx     # Socket.IO connection & identity provider
│   │   ├── hooks/
│   │   │   └── useLiveBoard.js       # Optimistic state manager & socket listeners
│   │   ├── types/
│   │   │   └── index.js              # Color themes, categories, and presets
│   │   ├── App.jsx                   # Application root
│   │   ├── index.css                 # Custom canvas grids, glassmorphism & styles
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/
│   ├── data/
│   │   └── canvas-state.json         # Authoritative persistent state on disk
│   ├── conflictResolver.js           # 3-way merge & concurrency resolution engine
│   ├── server.js                     # Express + Socket.IO real-time server
│   ├── test-conflict.js              # Concurrency automated verification tests
│   └── package.json
├── package.json                      # Monorepo concurrently launcher
├── VIDEO_WALKTHROUGH_SCRIPT.md       # Step-by-step 2-3 min recording guide
└── README.md
```

---

*Made with ❤️ for MLSA SRM Technical Recruitment 2026.*
