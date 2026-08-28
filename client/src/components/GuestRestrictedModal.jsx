import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X, LogIn, ArrowRight, UserCheck } from 'lucide-react';
import { soundFx } from '../utils/audio';

export const GuestRestrictedModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="relative w-full max-w-md bg-spidey-paper border-5 border-spidey-black shadow-comic-xl overflow-hidden p-6 text-center"
        >
          {/* Action Badge */}
          <div className="inline-block bg-spidey-red text-white font-headline text-xl px-3 py-1 border-3 border-black transform -rotate-3 shadow-comic-sm mb-3">
            🛑 GUEST RESTRICTION ALERT!
          </div>

          <div className="w-16 h-16 bg-yellow-100 text-spidey-red border-3 border-black mx-auto flex items-center justify-center mb-3 shadow-comic-sm">
            <ShieldAlert className="w-8 h-8 stroke-[2.5]" />
          </div>

          <h3 className="font-headline text-2xl sm:text-3xl text-spidey-black uppercase leading-tight mb-2">
            PRESS CREDENTIALS REQUIRED!
          </h3>

          <div className="p-3 bg-white border-2 border-black mb-4 text-left shadow-comic-sm">
            <p className="font-comic font-bold text-sm text-gray-900 leading-relaxed">
              "Hey Web-Slinger! You are currently browsing as an <strong>Anonymous Guest</strong>. Guests have full permissions to <strong>read articles</strong>, <strong>give hero claps</strong>, and <strong>drop speech bubble comments</strong>, but Daily Bugle policy requires <strong>verified staff credentials</strong> to publish front-page articles!"
            </p>
          </div>

          <p className="font-sans text-xs text-gray-600 font-bold mb-5">
            Log in as Peter Parker, J. Jonah Jameson, Gwen Stacy, Miles Morales, or create your custom ID to publish!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                onClose();
              }}
              className="w-full sm:w-auto px-4 py-2 bg-gray-200 hover:bg-gray-300 font-headline text-sm border-2 border-black"
            >
              KEEP BROWSING AS GUEST
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playFreezeFrame();
                onClose();
                onSwitchToLogin();
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2 bg-spidey-red hover:bg-spidey-darkRed text-white font-headline text-base border-3 border-black shadow-comic-sm comic-button"
            >
              <LogIn className="w-4 h-4" />
              <span>LOG IN TO PUBLISH</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
