# Live Sync Mini App

A real-time collaborative workspace where multiple people can brainstorm on sticky notes, sketch on a freehand canvas, and link ideas with live connector arrows across open browser tabs.

Built for the **MLSA SRM Technical Recruitment Task (Frontend Track)**.

---

### One-Line Note on Simultaneous Edits (Submission Field)
> **Simultaneous edits are resolved using field-level version isolation paired with a server-side 3-way merge algorithm, ensuring concurrent changes to notes are safely blended without silent overwrites.**

---

## 🛠️ Tech Stack & Decisions

- **Frontend:** React (Vite), Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend:** Node.js (v18+), Express, Socket.IO.
- **Protocol:** WebSockets with Socket.IO fallbacks for low-latency bidirectional events.
- **Storage:** Atomic JSON disk persistence (`temp write -> atomic rename`) so data survives browser refreshes.

### Why Socket.IO over raw WebSockets or SSE?
1. **Automatic Reconnection:** If a student's Wi-Fi drops or a laptop sleeps, Socket.IO recovers the connection and pulls the authoritative state without throwing uncaught errors.
2. **Event Namespacing:** Clean event handlers (`note:create`, `note:update`, `stroke:create`, `connector:create`) make multi-tab synchronization readable and easy to debug.
3. **Bidirectional vs SSE:** While Server-Sent Events are great for one-way feeds, a collaborative board needs constant client-to-server coordinate streaming (60fps cursor movements and drag events). Sockets avoid the HTTP POST overhead for every mouse move.

---

## 🚀 Key Features

1. **Multiplayer Live Cursors & Presence:**
   - Smooth 60fps cursor tracking with collaborator role tags and custom color pointers.
   - `Shift + Click` sends an animated radar ping across all open screens to grab teammate attention.
2. **Collaborative Sticky Notes:**
   - Draggable cards with priority marking (P1 High, P2 Medium, P3 Low).
   - Corner drag handle (`///`) for fluid resizing, plus 1-click dimension presets (Compact, Standard, Wide, Large).
   - Text highlighter with multiple marker colors, markdown formatting (`**bold**`, `*italic*`, `` `code` ``), and interactive live checklists (`- [ ]`).
3. **StrawPage-Inspired Freehand Drawing:**
   - Switch to **Draw** mode on the bottom toolbar to sketch, write, or annotate directly on the background canvas in 6 ink colors.
   - Automatically converts hand-drawn points into smooth SVG bezier paths.
4. **Dynamic Note Connectors & Live Arrows:**
   - Switch to **Connect** mode, click Note A and Note B to create an arrow link.
   - When either note is moved or resized, the connecting arrow dynamically stretches and recalculates its curve anchors in real time.
5. **Live Team Poll with Custom Creation:**
   - Synchronized voting widget with live animated percentage bars.
   - `+ New` button opens a modal to create and launch custom questions with up to 6 options.
6. **Workspace Customization & Dark Mode:**
   - **4 Selectable Background Styles:** Solid Blank (no dots, pure flat color), Architectural Fine Grid, Dot Matrix, and Ruled Notebook Lined paper.
   - **Snap to Grid:** Toggling Snap actively locks note dragging and resizing to 32px grid coordinates.
   - **Flat Solid Dark Mode:** High-contrast dark theme without distracting background gradients.

---

## 🧠 Concurrency & Conflict Resolution Strategy

When multiple people edit notes at the same time:

1. **Active Typing Soft-Locks:** When Tab 1 starts typing in a note, a live badge appears on Tab 2 (`User is editing...`), giving visual cues before conflicts happen.
2. **Field-Level Isolation:** If Tab 1 moves a note while Tab 2 updates its title or color, both mutations apply independently because coordinate updates and text updates are isolated in the resolver.
3. **Non-Destructive 3-Way Merge:** If both tabs change the note's body text simultaneously:
   - The server compares Tab 1's patch and Tab 2's patch against the common base version in `server/conflictResolver.js`.
   - It performs a 3-way line-based diff merge, combining additions from both users.
   - The merged note is broadcast to all clients with a `"Concurrent Edit Merged"` toast notification.
4. **Additive Poll Voting:** Concurrent upvotes and poll submissions increment atomically on the server rather than overwriting total counts.

---

## 💻 How to Run Locally

### Prerequisites
- Node.js 18 or newer installed (`node -v`).

### Setup & Run
1. Open the project directory:
   ```bash
   cd dbugs
   ```
2. Install dependencies:
   ```bash
   npm.cmd run install:all
   ```
   *(or `npm run install:all` on macOS/Linux)*
3. Start both backend (port 5000) and frontend (port 5173) in one command:
   ```bash
   npm.cmd run dev
   ```
4. Open **`http://localhost:5173`** in **two side-by-side browser tabs** to demo multi-user synchronization.

---

## 🧪 Automated Concurrency Unit Tests

Run the test suite verifying 3-way text merging, field isolation, and additive voting:
```bash
node server/test-conflict.js
```

Expected output:
```
✅ Test 1 Passed: Alice moved note without conflict.
✅ Test 2 Passed: Field-level merge preserved both position and text.
✅ Test 3 Passed: 3-way text merge blended simultaneous edits non-destructively!
✅ Test 4 Passed: Concurrent upvotes resolved additively without overwriting.
🎉 ALL CONCURRENCY & CONFLICT TESTS PASSED PERFECTLY!
```

---

## 📝 Personal Reflections & Engineering Tradeoffs

Building this project helped me understand the real challenges behind collaborative tools like Miro and Google Docs. At first, I considered using a basic Last-Write-Wins (LWW) model with timestamps. However, during early multi-tab testing, I noticed that network jitter meant typing in one tab would randomly erase whole paragraphs typed in another. Writing the 3-way text merger in `server/conflictResolver.js` solved this by respecting base versions and merging new lines without silent data loss.

If I had more time to expand this project further:
- I would integrate a CRDT library like **Yjs** or **Automerge** to support character-level operational transformation, allowing two users to type inside the exact same sentence with colored inline cursors.
- I would implement a **QuadTree spatial index** on the canvas to cull off-screen DOM nodes when boards grow to hundreds of notes.

Overall, the current setup of Socket.IO event broadcasting, optimistic client updates, and atomic disk writes provides a fast, resilient collaborative experience.

---

## 📂 Project Structure

```
dbugs/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ActivityDrawer.jsx      # Chronological audit stream
│   │   │   ├── Canvas.jsx              # Main board layer & toolbar controls
│   │   │   ├── CanvasConnectors.jsx    # Dynamic SVG note-to-note arrows
│   │   │   ├── CanvasDrawings.jsx      # StrawPage freehand SVG drawing layer
│   │   │   ├── ConflictToast.jsx       # 3-way merge notification toast
│   │   │   ├── CreatePollModal.jsx     # Custom poll creation popup
│   │   │   ├── LiveCursors.jsx         # 60fps multiplayer cursor pointers
│   │   │   ├── LivePollWidget.jsx      # Synchronized team voting widget
│   │   │   ├── Navbar.jsx              # Header with logo, background switcher & telemetry
│   │   │   ├── RadarPing.jsx           # Shift+Click attention ripple
│   │   │   ├── StickyNote.jsx          # Resizable note with highlighter & checklists
│   │   │   └── UserProfileModal.jsx    # Collaborator profile & color tag picker
│   │   ├── context/
│   │   │   └── SocketContext.jsx       # Socket.IO connection & user state
│   │   ├── hooks/
│   │   │   └── useLiveBoard.js         # Optimistic actions & event listeners
│   │   ├── types/
│   │   │   └── index.js                # Palettes, priorities & background styles
│   │   ├── App.jsx                     # Root application component
│   │   └── index.css                   # Solid themes, grids & ruled paper lines
│   ├── index.html
│   └── package.json
├── server/
│   ├── data/
│   │   └── canvas-state.json           # Atomic disk storage
│   ├── conflictResolver.js             # 3-way merge & field isolation engine
│   ├── server.js                       # Express & Socket.IO server
│   ├── test-conflict.js                # Automated concurrency tests
│   └── package.json
├── package.json
└── README.md
```
