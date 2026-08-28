# 🎥 Video Walkthrough Script (2–3 Minutes)
## NAR Live Canvas — Real-Time Collaborative Workspace (2nd Year Submission)

This script is structured to help you record a crisp, confident, and complete 2 to 3 minute demo showcasing all base and 2nd-year build-on requirements.

---

### 🕒 Video Breakdown Summary
| Timestamp | Segment | Visual Action on Screen | Key Talking Points |
| :--- | :--- | :--- | :--- |
| **0:00 – 0:30** | Introduction & Live Cursors | Open 2 browser tabs side-by-side (Tab A left, Tab B right) | Introduce yourself, the project name (**NAR Live Canvas**), and show real-time live cursor movement with names and custom avatars gliding across the canvas. |
| **0:30 – 1:00** | Interactive Sticky Notes & Optimistic UI | Create a new note on Tab A, drag it smoothly, and vote | Explain optimistic UI updates: interactions render immediately on the client at 60fps while broadcasting to the backend without lag. |
| **1:00 – 1:45** | Simultaneous Edit & Conflict Resolution | Type concurrently in both Tab A & Tab B on the same note | Show the live typing indicator (`User is editing...`), explain the field-level versioning, and demonstrate the non-destructive 3-way text merge toast notification. |
| **1:45 – 2:15** | State Persistence & Refresh Survival | Edit a note, reload Tab A (F5), or close & reopen | Demonstrate that all sticky notes, positions, votes, and poll data survive page refreshes through atomic backend persistence. |
| **2:15 – 2:45** | Code Architecture & Wrap-Up | Switch to VS Code editor (`server.js`, `conflictResolver.js`, `useLiveBoard.js`) | Walk through the Socket.IO event architecture, 3-way merge algorithm, and wrap up. |

---

### 🎙️ Step-by-Step Spoken Script

#### **[0:00 – 0:30] Scene 1: Introduction & Live Presence**
> **Setup:** Split your monitor into two browser windows side by side at `http://localhost:5173`.
> 
> **You say:**  
> *"Hi everyone! My name is [Your Name], and this is my submission for the MLSA SRM Technical Recruitment Task: the Live-Sync Mini App with the 2nd-year concurrency extensions.  
> 
> I built **NAR Live Canvas**, a real-time collaborative idea workspace where multiple users can brainstorm together.  
> 
> Right now, I have two separate browser tabs open side by side. As I move my cursor in Tab A on the left, you can immediately see the live cursor on the right in Tab B with sub-30 millisecond latency via WebSockets and Socket.IO. We also have collaborative radar pings when I Shift-click anywhere on the canvas!"*

---

#### **[0:30 – 1:00] Scene 2: Sticky Notes & Optimistic UI**
> **Setup:** Double-click on the canvas or click "New Note" in Tab A. Drag the note around smoothly. Upvote the note in Tab B.
> 
> **You say:**  
> *"Next, let’s look at sticky notes and optimistic UI updates.  
> When I double-click to add a note or drag it across the board, the client updates the UI optimistically with zero delay, giving users a smooth 60fps feel. At the same time, position coordinates and category tags stream seamlessly to every other connected tab.  
> 
> When Tab B clicks the upvote button, the vote counter increments in real time across all open tabs."*

---

#### **[1:00 – 1:45] Scene 3: Simultaneous Edits & Concurrency Resolution (2nd-Year Core)**
> **Setup:** In Tab A, start editing the content of a sticky note. Show the live lock badge on Tab B. Then type different text into both tabs simultaneously and blur.
> 
> **You say:**  
> *"Now let's examine the 2nd-year requirement: **handling simultaneous edits without silent overwrites**.  
> 
> First, we have **active presence soft-locking**: as soon as I focus on a note in Tab A, Tab B displays a live visual banner showing that I am actively editing.  
> 
> Second, we implemented **field-level isolation and a 3-way text merge algorithm**. If User A edits the position or color while User B edits the text, both apply without interference.  
> If two users edit the note content at the exact same moment, the server compares the base version against both inputs, performs a non-destructive 3-way merge, and displays a resolution badge so neither person's data is lost!"*

---

#### **[1:45 – 2:15] Scene 4: Refresh Survival & Live Poll**
> **Setup:** Make a quick change or vote in the live poll widget, then press `F5` / Refresh on Tab A. Reopen and show that all data remains intact.
> 
> **You say:**  
> *"Another critical 2nd-year requirement is **State Refresh Survival**.  
> In standard WebSocket demos, reloading resets everything to empty. In NAR Live Canvas, the Express backend persists the entire canvas state atomically to disk on every change.  
> 
> When I refresh Tab A, it reconnects, fetches the authoritative state, and restores every note, tag, vote, and poll result right where we left off."*

---

#### **[2:15 – 2:45] Scene 5: Code Walkthrough & Conclusion**
> **Setup:** Switch screen to VS Code and show `server/conflictResolver.js` and `client/src/hooks/useLiveBoard.js`.
> 
> **You say:**  
> *"Under the hood:  
> - The backend uses **Node.js, Express, and Socket.IO** with debounced atomic file persistence and the custom `conflictResolver.js` module.  
> - The frontend is built with **React 18, Vite, Tailwind CSS, and Framer Motion**, organized with a custom `useLiveBoard` hook that manages optimistic mutations and socket event subscriptions.  
> 
> Thank you for reviewing my submission!"*
