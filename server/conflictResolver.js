/**
 * Conflict Resolution Engine (2nd-Year Concurrency & Real-Time Sync)
 * 
 * Handles:
 * 1. Field-level merging (Position, Dimensions, Priority, Color, Tags, Votes vs Text Content)
 * 2. 3-Way non-destructive text merging for simultaneous edits to the same note
 * 3. Version tracking (Lamport timestamps / integer versions)
 */

/**
 * Perform a 3-way merge on text content when two users edit concurrently
 * @param {string} baseText - The text before divergence
 * @param {string} serverText - The current text on the server
 * @param {string} clientText - The incoming text from the client
 * @param {string} clientAuthor - The name of the client making the edit
 * @returns {{ mergedText: string, hasConflict: boolean }}
 */
function mergeTextContent(baseText = '', serverText = '', clientText = '', clientAuthor = 'Collaborator') {
  if (serverText === clientText) {
    return { mergedText: serverText, hasConflict: false };
  }

  if (serverText === baseText) {
    return { mergedText: clientText, hasConflict: false };
  }

  if (clientText === baseText) {
    return { mergedText: serverText, hasConflict: false };
  }

  if (!serverText && clientText) return { mergedText: clientText, hasConflict: true };
  if (!clientText && serverText) return { mergedText: serverText, hasConflict: true };

  const baseLines = baseText.split('\n');
  const serverLines = serverText.split('\n');
  const clientLines = clientText.split('\n');

  const serverAdded = serverLines.slice(baseLines.length);
  const clientAdded = clientLines.slice(baseLines.length);

  if (serverLines.slice(0, baseLines.length).join('\n') === baseText &&
      clientLines.slice(0, baseLines.length).join('\n') === baseText) {
    const merged = [...baseLines, ...serverAdded, ...clientAdded].filter(Boolean).join('\n');
    return { mergedText: merged, hasConflict: true };
  }

  const mergedText = `${serverText.trim()}\n\n---\n📝 [Merged update from ${clientAuthor}]:\n${clientText.trim()}`;
  return { mergedText, hasConflict: true };
}

/**
 * Resolves concurrent note edits
 * @param {object} existingNote - Current note in server memory
 * @param {object} incomingPatch - Partial or full update from client
 * @param {object} user - User metadata (id, name, color)
 * @returns {{ resolvedNote: object, conflictOccurred: boolean, resolutionSummary: string }}
 */
function resolveNoteUpdate(existingNote, incomingPatch, user) {
  if (!existingNote) {
    return {
      resolvedNote: {
        ...incomingPatch,
        width: incomingPatch.width || 300,
        height: incomingPatch.height || 220,
        priority: incomingPatch.priority || 'medium',
        version: 1,
        updatedAt: Date.now(),
        lastEditedBy: user?.name || 'Anonymous'
      },
      conflictOccurred: false,
      resolutionSummary: 'Note created.'
    };
  }

  const clientBaseVersion = incomingPatch.baseVersion;
  const isVersionStale = clientBaseVersion !== undefined && clientBaseVersion < existingNote.version;
  let conflictOccurred = false;
  let resolutionSummary = '';

  const resolved = { ...existingNote };

  // 1. Independent fields (Field-level isolation)
  if (incomingPatch.x !== undefined && incomingPatch.y !== undefined) {
    resolved.x = incomingPatch.x;
    resolved.y = incomingPatch.y;
    resolved.zIndex = incomingPatch.zIndex !== undefined ? incomingPatch.zIndex : (resolved.zIndex || 1);
  }

  // Resizable dimensions
  if (incomingPatch.width !== undefined) {
    resolved.width = Math.max(240, Math.min(800, incomingPatch.width));
  }
  if (incomingPatch.height !== undefined) {
    resolved.height = Math.max(180, Math.min(1000, incomingPatch.height));
  }

  // Priority marking
  if (incomingPatch.priority !== undefined) {
    resolved.priority = incomingPatch.priority;
  }

  if (incomingPatch.color !== undefined) {
    resolved.color = incomingPatch.color;
  }

  if (incomingPatch.category !== undefined) {
    resolved.category = incomingPatch.category;
  }

  if (incomingPatch.pinned !== undefined) {
    resolved.pinned = incomingPatch.pinned;
  }

  if (incomingPatch.votes !== undefined || incomingPatch.voteDelta !== undefined) {
    if (incomingPatch.voteDelta !== undefined) {
      resolved.votes = Math.max(0, (resolved.votes || 0) + incomingPatch.voteDelta);
      if (user?.id) {
        resolved.votedUsers = { ...(resolved.votedUsers || {}), [user.id]: incomingPatch.hasVoted };
      }
    } else {
      resolved.votes = incomingPatch.votes;
    }
  }

  // 2. Text content and title reconciliation
  if (incomingPatch.content !== undefined || incomingPatch.title !== undefined) {
    if (isVersionStale) {
      if (incomingPatch.content !== undefined && incomingPatch.content !== existingNote.content) {
        const { mergedText, hasConflict } = mergeTextContent(
          incomingPatch.baseContent || '',
          existingNote.content || '',
          incomingPatch.content || '',
          user?.name || 'Collaborator'
        );

        resolved.content = mergedText;
        if (hasConflict) {
          conflictOccurred = true;
          resolutionSummary = `Simultaneous edit detected on "${existingNote.title || 'Untitled Note'}". Merged changes from ${user?.name || 'Collaborator'} and ${existingNote.lastEditedBy || 'another user'} non-destructively.`;
        }
      }

      if (incomingPatch.title !== undefined && incomingPatch.title !== existingNote.title) {
        if (!existingNote.title) {
          resolved.title = incomingPatch.title;
        } else if (incomingPatch.title.trim() && incomingPatch.title !== existingNote.title) {
          resolved.title = incomingPatch.title;
        }
      }
    } else {
      if (incomingPatch.content !== undefined) resolved.content = incomingPatch.content;
      if (incomingPatch.title !== undefined) resolved.title = incomingPatch.title;
    }
  }

  resolved.version = (existingNote.version || 1) + 1;
  resolved.updatedAt = Date.now();
  resolved.lastEditedBy = user?.name || 'Anonymous';
  resolved.lastEditedByColor = user?.color || '#1c2bff';

  if (conflictOccurred) {
    resolved.lastConflict = {
      resolvedAt: Date.now(),
      summary: resolutionSummary
    };
  }

  return {
    resolvedNote: resolved,
    conflictOccurred,
    resolutionSummary
  };
}

module.exports = {
  mergeTextContent,
  resolveNoteUpdate
};
