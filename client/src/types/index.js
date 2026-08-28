// MSA SRM Inspired Clean Matte Color System
export const NOTE_COLORS = {
  azure: {
    name: 'MSA Azure',
    bg: 'bg-[#f0f6ff] border-[#bfdbfe] text-[#0f172a]',
    header: 'bg-[#e0efff] border-[#bfdbfe]',
    accent: '#1c2bff',
    tag: 'bg-[#dbeafe] text-[#1e40af]'
  },
  paper: {
    name: 'Doc White',
    bg: 'bg-[#ffffff] border-[#e2e8f0] text-[#0f172a]',
    header: 'bg-[#f8fafc] border-[#e2e8f0]',
    accent: '#18181b',
    tag: 'bg-[#f1f5f9] text-[#334155]'
  },
  sage: {
    name: 'Mint Sage',
    bg: 'bg-[#f0fdf4] border-[#bbf7d0] text-[#064e3b]',
    header: 'bg-[#dcfce7] border-[#bbf7d0]',
    accent: '#107c41',
    tag: 'bg-[#dcfce7] text-[#166534]'
  },
  honey: {
    name: 'Honey Amber',
    bg: 'bg-[#fffbeb] border-[#fde68a] text-[#78350f]',
    header: 'bg-[#fef3c7] border-[#fde68a]',
    accent: '#d97706',
    tag: 'bg-[#fef3c7] text-[#92400e]'
  },
  rose: {
    name: 'Coral Blush',
    bg: 'bg-[#fff1f2] border-[#fecdd3] text-[#881337]',
    header: 'bg-[#ffe4e6] border-[#fecdd3]',
    accent: '#e11d48',
    tag: 'bg-[#ffe4e6] text-[#9f1239]'
  },
  slate: {
    name: 'Cool Slate',
    bg: 'bg-[#f8fafc] border-[#cbd5e1] text-[#1e293b]',
    header: 'bg-[#f1f5f9] border-[#cbd5e1]',
    accent: '#475569',
    tag: 'bg-[#e2e8f0] text-[#334155]'
  }
};

export const PRIORITIES = [
  { id: 'high', label: 'P1 High', color: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
  { id: 'medium', label: 'P2 Medium', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  { id: 'low', label: 'P3 Low', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  { id: 'none', label: 'No Priority', color: 'bg-zinc-100 text-zinc-600 border-zinc-200', dot: 'bg-zinc-400' }
];

export const HIGHLIGHT_COLORS = [
  { id: 'yellow', name: 'Yellow', bg: 'bg-yellow-200/90 text-yellow-950', hex: '#fef08a' },
  { id: 'blue', name: 'Blue', bg: 'bg-sky-200/90 text-sky-950', hex: '#bae6fd' },
  { id: 'green', name: 'Green', bg: 'bg-emerald-200/90 text-emerald-950', hex: '#a7f3d0' },
  { id: 'pink', name: 'Pink', bg: 'bg-pink-200/90 text-pink-950', hex: '#fbcfe8' }
];

export const CATEGORIES = [
  { id: 'Docs', label: '📄 Docs', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'Feature', label: '✨ Feature', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { id: 'Task', label: '✅ Task', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'Idea', label: '💡 Idea', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'Bug', label: '🐛 Bug', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { id: 'Architecture', label: '🏛️ Architecture', color: 'bg-purple-50 text-purple-700 border-purple-200' }
];

export const USER_AVATARS = ['👤', '⚡', '💡', '🎯', '✨', '☕', '🚀', '🛠️', '📌', '🧭'];

export const USER_COLORS = [
  '#1c2bff', // MSA Electric Royal Blue
  '#107c41', // Microsoft Green
  '#d97706', // Amber Gold
  '#e11d48', // Coral
  '#7c3aed', // Purple
  '#0284c7', // Sky Blue
  '#18181b', // Obsidian Black
  '#475569'  // Slate
];
