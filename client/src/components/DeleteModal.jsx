import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertOctagon, X } from 'lucide-react';
import { soundFx } from '../utils/audio';

export const DeleteModal = ({ isOpen, post, onClose, onConfirm, isDeleting }) => {
  if (!isOpen || !post) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotate: -3 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.8, opacity: 0, rotate: 3 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="relative w-full max-w-md bg-white border-5 border-spidey-black shadow-comic-xl overflow-hidden p-6 text-center"
        >
          {/* Action Badge */}
          <div className="inline-block bg-spidey-red text-white font-headline text-2xl px-4 py-1 border-3 border-black transform -rotate-6 shadow-comic-sm mb-4">
            KRASH! DELETE ISSUE?
          </div>

          <div className="w-16 h-16 bg-red-100 text-spidey-red border-3 border-black mx-auto flex items-center justify-center mb-3 shadow-comic-sm">
            <Trash2 className="w-8 h-8 stroke-[2.5]" />
          </div>

          <h3 className="font-headline text-2xl text-spidey-black uppercase leading-snug mb-2">
            Vaporize this Chronicle?
          </h3>

          <div className="p-3 bg-spidey-paper border-2 border-black mb-4 text-left">
            <p className="font-headline text-base text-spidey-red uppercase truncate">
              {post.title}
            </p>
            <p className="font-sans text-xs text-gray-600 font-bold">
              By {post.author} • {post.category}
            </p>
          </div>

          <p className="font-comic text-sm text-gray-700 mb-6">
            "Once shredded by the Daily Bugle printing press, this story cannot be retrieved across the multiverse!"
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                onClose();
              }}
              disabled={isDeleting}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 font-headline text-sm border-2 border-black"
            >
              KEEP STORY
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playKrash();
                onConfirm(post.id);
              }}
              disabled={isDeleting}
              className="flex items-center gap-1.5 px-5 py-2 bg-spidey-red hover:bg-spidey-darkRed text-white font-headline text-base border-3 border-black shadow-comic-sm comic-button disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isDeleting ? 'SHREDDING...' : 'CONFIRM DELETE!'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
