import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Check } from 'lucide-react';
import { USER_AVATARS, USER_COLORS } from '../types';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';

export default function UserProfileModal({ isOpen, onClose }) {
  const { currentUser, updateProfile } = useSocket();
  const { isDark } = useTheme();
  const [name, setName] = useState(currentUser.name);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [color, setColor] = useState(currentUser.color);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    updateProfile({ name: name.trim(), avatar, color });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className={`rounded-2xl max-w-sm w-full p-5 shadow-2xl border flex flex-col gap-4 transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
                <User className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm">Collaborator Profile</h3>
            </div>
            <button
              onClick={onClose}
              className="opacity-50 hover:opacity-100 p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name..."
                required
                maxLength={24}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Avatar Emoji
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {USER_AVATARS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatar(emoji)}
                    className={`h-9 rounded-lg text-base flex items-center justify-center transition-all ${
                      avatar === emoji
                        ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Cursor & Badge Color
              </label>
              <div className="grid grid-cols-8 gap-1.5">
                {USER_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-7 rounded-full transition-transform hover:scale-110 flex items-center justify-center ${
                      color === c ? 'scale-110 ring-2 ring-indigo-500 shadow-md' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  >
                    {color === c && <Check className="w-3 h-3 text-white stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-xs font-medium opacity-70 hover:opacity-100 transition-opacity"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all"
              >
                Save
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
