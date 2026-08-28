# 🎙️ Video Walkthrough Script (2–3 Minutes)

> **Submission Note (One-Liner):**  
> *"To prevent data loss during simultaneous edits, NAR Live Sync Mini App runs a server-side 3-way merge algorithm that automatically combines edits from multiple users working on the same note at once."*

---

## 🎬 Walkthrough Script (Read Aloud While Recording)

**(Have two browser windows open side-by-side on `http://localhost:5173`)**

---

"Hello everyone! Welcome to **NAR Live Sync Mini App**, a collaborative digital workspace that I designed and built for real-time teamwork, brainstorming, and note organization.

Under the hood, I built the interface with **React** and powered the real-time collaboration using a **Node.js and Express** backend with **Socket.IO**, giving us smooth, bidirectional synchronization with virtually zero latency.

---

*[Action: Move your mouse around in the left window. Show the named cursor gliding in the right window. Shift+Click on the canvas in the left tab to trigger a radar ping shockwave.]*

As you can see, I have two separate browser tabs open side by side to demonstrate multi-user collaboration. When I move my mouse in the left window, you can see my cursor and collaborator tag gliding smoothly in the right window in real time. 

If I want to quickly grab my team’s attention to a specific part of the board, I can **Shift-Click** anywhere on the canvas to broadcast a live radar ping. 

---

*[Action: Focus on Note #2 in Tab 1 (show the "editing..." lock badge on Tab 2). Type a sentence in Tab 1 and a different sentence in Tab 2 at the same time, blur both, and show the merged result + the toast notification.]*

One of the most important features in this app is how it handles **simultaneous edits**. 

When a user starts typing, a soft-lock indicator instantly appears to let other teammates know that someone is currently editing. But if two people still happen to type into the exact same note at the same moment, the app doesn't overwrite anyone's work. Our server runs a **3-way merge algorithm** that intelligently blends both edits together non-destructively, saves the merged text, and displays a quick notification confirming that no data was lost.

---

*[Action: Click "Draw" on the bottom toolbar, sketch a doodle on the canvas in blue. Click "Connect", click Note 1 then Note 2 to create an arrow. Drag Note 1 and show the arrow following it. Drag the corner resize grip (///) on a note to resize it.]*

I also integrated a freehand **Draw Mode** where you can sketch diagrams and write notes directly on the background canvas using smooth vector strokes in different ink colors.

Right next to it is the **Connect Mode**, which allows you to attach notes together with dynamic live arrows. When you drag or reposition either note, the arrow automatically recalculates its curve and stretches along with it. Notes are also completely resizable—you can drag the corner grip or choose from quick preset sizes in the note header.

---

*[Action: Click an option in the bottom-right Team Poll in Tab 1, watch the vote bar animate in Tab 2. Click "+ New" in the poll widget, type a quick question, and launch it. Then click the Background dropdown in the navbar and switch between styles, and toggle Dark Mode.]*

In the bottom right, we have a **Live Team Poll**. As teammates cast their votes, the progress bars and percentages update live on every open screen. You can also click **+ New** to create and launch custom team polls on the fly.

Up in the navbar, users can customize their view with four different background styles—Solid Blank, Fine Grid, Dot Matrix, or Notebook Lined paper—along with a snap-to-grid toggle and a clean, solid-color Dark Mode.

---

*[Action: Refresh (F5) both browser tabs. Show that all notes, positions, drawings, arrows, and votes are fully restored.]*

Finally, the entire board state is saved to the server on every action. If you refresh the page or close your browser, all your notes, drawings, arrows, and poll data are safely restored.

That is **NAR Live Sync Mini App**. Thank you for watching!"
