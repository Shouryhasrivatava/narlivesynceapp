import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { soundFx } from '../utils/audio';

export const SwingingSpidey = () => {
  const [isSwinging, setIsSwinging] = useState(true);
  const [showThwip, setShowThwip] = useState(false);

  const triggerSwing = () => {
    soundFx.playThwip();
    setShowThwip(true);
    setTimeout(() => setShowThwip(false), 1200);
  };

  return (
    <div className="relative w-full h-16 overflow-hidden pointer-events-none mb-2 hidden md:block">
      {/* Background skyline silhouette line */}
      <div className="absolute bottom-0 inset-x-0 h-[2px] bg-black/20" />

      {/* Swinging Spidey container */}
      <motion.div
        animate={{
          x: ['-10%', '110%'],
          y: [0, 25, 0, 25, 0]
        }}
        transition={{
          repeat: Infinity,
          duration: 12,
          ease: 'easeInOut'
        }}
        className="absolute top-0 pointer-events-auto cursor-pointer"
        onClick={triggerSwing}
        title="Click swinging Spidey to trigger THWIP!"
      >
        <div className="relative flex items-center gap-2">
          {/* Animated Web line angled upwards */}
          <svg className="w-24 h-16 overflow-visible" viewBox="0 0 100 60">
            <line x1="100" y1="0" x2="30" y2="45" stroke="#111" strokeWidth="2.5" />
            <line x1="100" y1="0" x2="30" y2="45" stroke="#FFF" strokeWidth="1.5" />
          </svg>

          {/* Spidey figure */}
          <div className="w-10 h-10 bg-spidey-red border-3 border-black rounded-full flex items-center justify-center shadow-comic-sm transform -rotate-12 hover:scale-125 transition-transform">
            <span className="text-xl">🕷️</span>
          </div>

          {/* Dynamic THWIP popup */}
          {showThwip && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="bg-spidey-yellow text-spidey-black font-headline text-xs px-2 py-0.5 border-2 border-black shadow-comic-sm transform -rotate-6"
            >
              THWIP!
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
