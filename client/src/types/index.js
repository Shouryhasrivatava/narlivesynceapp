// Classic Black & White Notes App Color System
export const NOTE_COLORS = {
  white: {
    name: 'Classic White',
    bg: 'bg-[#ffffff] border-[#e4e4e7] text-[#09090b]',
    header: 'bg-[#fafafa] border-[#e4e4e7]',
    accent: '#18181b',
    tag: 'bg-[#f4f4f5] text-[#27272a]'
  },
  ivory: {
    name: 'Warm Ivory',
    bg: 'bg-[#fafaf9] border-[#e7e5e4] text-[#1c1917]',
    header: 'bg-[#f5f5f4] border-[#e7e5e4]',
    accent: '#292524',
    tag: 'bg-[#e7e5e4] text-[#44403c]'
  },
  slate: {
    name: 'Soft Slate',
    bg: 'bg-[#f8fafc] border-[#cbd5e1] text-[#0f172a]',
    header: 'bg-[#f1f5f9] border-[#cbd5e1]',
    accent: '#334155',
    tag: 'bg-[#e2e8f0] text-[#334155]'
  },
  zinc: {
    name: 'Pale Zinc',
    bg: 'bg-[#f4f4f5] border-[#d4d4d8] text-[#18181b]',
    header: 'bg-[#e4e4e7] border-[#d4d4d8]',
    accent: '#27272a',
    tag: 'bg-[#d4d4d8] text-[#18181b]'
  },
  amber: {
    name: 'Muted Kraft',
    bg: 'bg-[#fefce8] border-[#fef08a] text-[#422006]',
    header: 'bg-[#fef9c3] border-[#fef08a]',
    accent: '#854d0e',
    tag: 'bg-[#fef08a] text-[#713f12]'
  }
};

export const PRIORITIES = [
  { id: 'high', label: 'P1 High', color: 'bg-black text-white border-black', dot: 'bg-rose-500' },
  { id: 'medium', label: 'P2 Medium', color: 'bg-zinc-100 text-zinc-800 border-zinc-300', dot: 'bg-amber-500' },
  { id: 'low', label: 'P3 Low', color: 'bg-zinc-50 text-zinc-600 border-zinc-200', dot: 'bg-blue-500' },
  { id: 'none', label: 'No Priority', color: 'bg-white text-zinc-500 border-zinc-200', dot: 'bg-zinc-300' }
];

export const HIGHLIGHT_COLORS = [
  { id: 'yellow', name: 'Yellow', bg: 'bg-[#fef08a] text-[#422006]', marker: '#fde047' },
  { id: 'green', name: 'Green', bg: 'bg-[#bbf7d0] text-[#064e3b]', marker: '#86efac' },
  { id: 'cyan', name: 'Cyan', bg: 'bg-[#bae6fd] text-[#0c4a6e]', marker: '#7dd3fc' },
  { id: 'pink', name: 'Pink', bg: 'bg-[#fbcfe8] text-[#831843]', marker: '#f472b6' },
  { id: 'purple', name: 'Purple', bg: 'bg-[#e9d5ff] text-[#581c87]', marker: '#c084fc' }
];

export const CATEGORIES = [
  { id: 'Notes', label: '📝 Notes', color: 'bg-zinc-100 text-zinc-800 border-zinc-300' },
  { id: 'Tasks', label: '✅ Tasks', color: 'bg-zinc-100 text-zinc-800 border-zinc-300' },
  { id: 'Ideas', label: '💡 Ideas', color: 'bg-zinc-100 text-zinc-800 border-zinc-300' },
  { id: 'Projects', label: '📁 Projects', color: 'bg-zinc-100 text-zinc-800 border-zinc-300' },
  { id: 'Important', label: '⭐ Important', color: 'bg-zinc-100 text-zinc-800 border-zinc-300' }
];

export const USER_AVATARS = ['👤', '⚡', '💡', '🎯', '✨', '☕', '🚀', '🛠️', '📌', '🧭'];

export const USER_COLORS = [
  '#000000', // Solid Black
  '#3f3f46', // Zinc Gray
  '#2563eb', // Blue
  '#059669', // Emerald
  '#d97706', // Amber
  '#7c3aed', // Purple
  '#e11d48', // Crimson
  '#475569'  // Slate
];
