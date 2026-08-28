const assert = require('assert');
const { mergeTextContent, resolveNoteUpdate } = require('./conflictResolver');

console.log('🧪 Starting Conflict Resolver & Concurrency Verification Test...\n');

// Test 1: Field-level independence (Position vs Content)
{
  const existing = {
    id: 'note-1',
    title: 'Initial Title',
    content: 'Initial Content',
    x: 100,
    y: 100,
    color: 'yellow',
    votes: 2,
    version: 2
  };

  const userA = { id: 'u1', name: 'Alice', color: '#3b82f6' };
  const userB = { id: 'u2', name: 'Bob', color: '#ec4899' };

  // Alice moves note
  const patchAlice = { id: 'note-1', x: 250, y: 300, baseVersion: 2 };
  const resAlice = resolveNoteUpdate(existing, patchAlice, userA);
  assert.strictEqual(resAlice.resolvedNote.x, 250);
  assert.strictEqual(resAlice.resolvedNote.content, 'Initial Content');
  assert.strictEqual(resAlice.conflictOccurred, false);
  console.log('✅ Test 1 Passed: Alice moved note without conflict.');

  // Bob edits content concurrently (based on baseVersion 2)
  const patchBob = { id: 'note-1', content: 'Updated Content by Bob', baseVersion: 2, baseContent: 'Initial Content' };
  const resBob = resolveNoteUpdate(resAlice.resolvedNote, patchBob, userB);
  assert.strictEqual(resBob.resolvedNote.x, 250, 'Position from Alice preserved');
  assert.strictEqual(resBob.resolvedNote.content, 'Updated Content by Bob', 'Content from Bob applied');
  assert.strictEqual(resBob.conflictOccurred, false);
  console.log('✅ Test 2 Passed: Field-level merge preserved both position and text.');
}

// Test 2: Simultaneous text edits to the same note
{
  const base = {
    id: 'note-2',
    title: 'Architecture Ideas',
    content: '1. Use WebSockets',
    version: 3
  };

  const userAlice = { id: 'u1', name: 'Alice', color: '#3b82f6' };
  const userCharlie = { id: 'u3', name: 'Charlie', color: '#10b981' };

  // Server receives Alice edit first:
  const patchAlice = {
    id: 'note-2',
    content: '1. Use WebSockets\n2. Add Socket.IO fallback',
    baseVersion: 3,
    baseContent: '1. Use WebSockets'
  };
  const resAlice = resolveNoteUpdate(base, patchAlice, userAlice);
  assert.strictEqual(resAlice.resolvedNote.version, 4);

  // Server receives Charlie edit that was typed at the exact same moment (baseVersion 3)
  const patchCharlie = {
    id: 'note-2',
    content: '1. Use WebSockets\n2. Add Redis Pub/Sub',
    baseVersion: 3,
    baseContent: '1. Use WebSockets'
  };
  const resCharlie = resolveNoteUpdate(resAlice.resolvedNote, patchCharlie, userCharlie);

  assert.strictEqual(resCharlie.conflictOccurred, true, 'Conflict should be flagged');
  assert(resCharlie.resolvedNote.content.includes('Socket.IO fallback'), 'Alice edit must be in merged output');
  assert(resCharlie.resolvedNote.content.includes('Redis Pub/Sub'), 'Charlie edit must be in merged output');
  console.log('✅ Test 3 Passed: 3-way text merge blended simultaneous edits non-destructively!');
}

// Test 3: Additive voting concurrency
{
  const note = { id: 'note-3', votes: 5, votedUsers: {}, version: 1 };
  const user1 = { id: 'u1', name: 'User 1' };
  const user2 = { id: 'u2', name: 'User 2' };

  const r1 = resolveNoteUpdate(note, { id: 'note-3', voteDelta: 1, hasVoted: true }, user1);
  const r2 = resolveNoteUpdate(r1.resolvedNote, { id: 'note-3', voteDelta: 1, hasVoted: true }, user2);

  assert.strictEqual(r2.resolvedNote.votes, 7);
  assert.strictEqual(r2.resolvedNote.votedUsers['u1'], true);
  assert.strictEqual(r2.resolvedNote.votedUsers['u2'], true);
  console.log('✅ Test 4 Passed: Concurrent upvotes resolved additively without overwriting.');
}

console.log('\n🎉 ALL CONCURRENCY & CONFLICT TESTS PASSED PERFECTLY!\n');
