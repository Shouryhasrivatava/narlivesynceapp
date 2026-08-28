const { io } = require('../client/node_modules/socket.io-client');
const assert = require('assert');

console.log('🚀 Running Multi-Client End-to-End Socket.IO Test...\n');

const client1 = io('http://localhost:5000', { transports: ['websocket'] });
const client2 = io('http://localhost:5000', { transports: ['websocket'] });

let c1Init = false;
let c2Init = false;

client1.on('connect', () => {
  console.log('Client 1 connected:', client1.id);
  client1.emit('user:join', { name: 'Alice (Tab 1)', color: '#3b82f6', avatar: '🦊' });
});

client2.on('connect', () => {
  console.log('Client 2 connected:', client2.id);
  client2.emit('user:join', { name: 'Bob (Tab 2)', color: '#ec4899', avatar: '🐱' });
});

client1.on('board:init', (data) => {
  c1Init = true;
  console.log('✅ Client 1 received board:init with', data.notes.length, 'notes.');
  
  // Test cursor movement broadcast
  client1.emit('cursor:move', { x: 350, y: 220 });

  // Test note creation
  client1.emit('note:create', {
    title: 'E2E Test Note',
    content: 'Testing real-time live sync',
    x: 200,
    y: 200,
    color: 'emerald'
  });
});

client2.on('cursor:update', (cursorData) => {
  console.log('✅ Client 2 received live cursor from Client 1 at x:', cursorData.x, 'y:', cursorData.y);
});

client2.on('note:created', (newNote) => {
  console.log('✅ Client 2 received note:created event for note:', newNote.title);

  // Client 2 upvotes this note
  client2.emit('note:vote', { noteId: newNote.id, voteDelta: 1, hasVoted: true });
});

client1.on('note:voted', ({ noteId, votes }) => {
  console.log('✅ Client 1 received note:voted event. New votes:', votes);

  // Clean up and finish
  console.log('\n🎉 Multi-Client Real-Time E2E Socket Integration Succeeded 100%!\n');
  client1.disconnect();
  client2.disconnect();
  process.exit(0);
});

setTimeout(() => {
  console.error('❌ Timeout waiting for events');
  process.exit(1);
}, 6000);
