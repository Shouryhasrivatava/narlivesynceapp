import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Check } from 'lucide-react';
import { USER_AVATARS, USER_COLORS } from '../types';
import { useSocket } from '../context/SocketContext';

export default function UserProfileModal({ isOpen, onClose }) {
  const { currentUser, updateProfile } = useSocket();
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
      <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="rounded-lg max-w-sm w-full p-5 shadow-lg border border-zinc-200 bg-white text-zinc-900 flex flex-col gap-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-zinc-100 text-zinc-800 rounded">
                <User className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm">Collaborator Profile</h3>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-800 p-1 rounded hover:bg-zinc-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name..."
                required
                maxLength={24}
                className="w-full bg-zinc-50 border border-zinc-200 rounded px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1">
                Avatar Emoji
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {USER_AVATARS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatar(emoji)}
                    className={`h-9 rounded text-base flex items-center justify-center transition-all ${
                      avatar === emoji
                        ? 'bg-black text-white shadow-xs'
                        : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 mb-1">
                Cursor & Badge Color
              </label>
              <div className="grid grid-cols-8 gap-1.5">
                {USER_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-7 rounded transition-transform hover:scale-105 flex items-center justify-center ${
                      color === c ? 'scale-105 ring-2 ring-black shadow-xs' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  >
                    {color === c && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded text-xs font-medium text-zinc-600 hover:text-zinc-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded text-xs font-bold bg-black text-white hover:bg-zinc-800 transition-colors shadow-xs"
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
