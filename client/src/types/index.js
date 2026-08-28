// Matte Color Themes - Refined satin/paper aesthetic for both Light and Dark modes
export const NOTE_COLORS = {
  yellow: {
    name: 'Post-it Yellow',
    bgLight: 'bg-[#fffbeb] border-[#fde68a] text-amber-950',
    bgDark: 'bg-[#292218] border-[#785924] text-[#fef3c7]',
    headerLight: 'bg-[#fef3c7] border-[#fde68a]',
    headerDark: 'bg-[#3b2d18] border-[#785924]',
    accent: '#d97706',
    dot: 'bg-amber-500'
  },
  cyan: {
    name: 'Studio Cyan',
    bgLight: 'bg-[#ecfeff] border-[#a5f3fc] text-cyan-950',
    bgDark: 'bg-[#14262b] border-[#1e5866] text-[#cffafe]',
    headerLight: 'bg-[#cffafe] border-[#a5f3fc]',
    headerDark: 'bg-[#1b3d45] border-[#1e5866]',
    accent: '#0891b2',
    dot: 'bg-cyan-500'
  },
  pink: {
    name: 'Soft Rose',
    bgLight: 'bg-[#fff1f2] border-[#fecdd3] text-rose-950',
    bgDark: 'bg-[#2b171c] border-[#712838] text-[#ffe4e6]',
    headerLight: 'bg-[#ffe4e6] border-[#fecdd3]',
    headerDark: 'bg-[#3f1f28] border-[#712838]',
    accent: '#e11d48',
    dot: 'bg-rose-500'
  },
  emerald: {
    name: 'Mint Green',
    bgLight: 'bg-[#f0fdf4] border-[#bbf7d0] text-emerald-950',
    bgDark: 'bg-[#15291b] border-[#225732] text-[#dcfce7]',
    headerLight: 'bg-[#dcfce7] border-[#bbf7d0]',
    headerDark: 'bg-[#1d3d27] border-[#225732]',
    accent: '#059669',
    dot: 'bg-emerald-500'
  },
  purple: {
    name: 'Muted Violet',
    bgLight: 'bg-[#f5f3ff] border-[#ddd6fe] text-violet-950',
    bgDark: 'bg-[#221a30] border-[#553c7b] text-[#ede9fe]',
    headerLight: 'bg-[#ede9fe] border-[#ddd6fe]',
    headerDark: 'bg-[#302345] border-[#553c7b]',
    accent: '#7c3aed',
    dot: 'bg-violet-500'
  },
  coral: {
    name: 'Warm Coral',
    bgLight: 'bg-[#fff7ed] border-[#fed7aa] text-orange-950',
    bgDark: 'bg-[#2d1c16] border-[#753c29] text-[#ffedd5]',
    headerLight: 'bg-[#ffedd5] border-[#fed7aa]',
    headerDark: 'bg-[#40261c] border-[#753c29]',
    accent: '#ea580c',
    dot: 'bg-orange-500'
  }
};

export const CATEGORIES = [
  { id: 'Feature', label: 'Feature', color: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:text-blue-400' },
  { id: 'Idea', label: 'Idea', color: 'bg-amber-500/10 text-amber-600 border-amber-200 dark:text-amber-400' },
  { id: 'Bug', label: 'Bug', color: 'bg-rose-500/10 text-rose-600 border-rose-200 dark:text-rose-400' },
  { id: 'Architecture', label: 'Architecture', color: 'bg-purple-500/10 text-purple-600 border-purple-200 dark:text-purple-400' },
  { id: 'Task', label: 'Task', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:text-emerald-400' },
  { id: 'Note', label: 'Note', color: 'bg-zinc-500/10 text-zinc-600 border-zinc-200 dark:text-zinc-400' }
];

export const USER_AVATARS = ['🦊', '🐱', '🦄', '🐼', '🐯', '⚡', '🧙‍♂️', '🦁', '🦉', '🐙'];

export const USER_COLORS = [
  '#2563eb', // Blue
  '#db2777', // Pink
  '#059669', // Emerald
  '#7c3aed', // Purple
  '#d97706', // Amber
  '#0891b2', // Cyan
  '#e11d48', // Rose
  '#4f46e5'  // Indigo
];
