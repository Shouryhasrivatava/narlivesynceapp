import React from 'react';
import { motion } from 'framer-motion';

export const ActionWordBadge = ({
  text = "THWIP!",
  color = "bg-spidey-yellow text-spidey-black",
  angle = -8
}) => {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -25 }}
      animate={{ scale: [0, 1.3, 1], rotate: angle }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.15, rotate: angle + 5 }}
      className={`inline-block font-headline tracking-widest text-lg md:text-xl px-3.5 py-0.5 border-3 border-spidey-black shadow-comic-sm transform uppercase select-none ${color}`}
    >
      {text}
    </motion.div>
  );
};

export const FloatingActionParticle = ({ x, y, text = "POW!", onComplete }) => {
  const badgeStyles = [
    { bg: 'bg-spidey-yellow', text: 'text-spidey-black', border: 'border-black' },
    { bg: 'bg-spidey-red', text: 'text-white', border: 'border-black' },
    { bg: 'bg-spidey-lightBlue', text: 'text-black', border: 'border-black' },
    { bg: 'bg-white', text: 'text-spidey-red', border: 'border-black' }
  ];
  const style = badgeStyles[Math.floor(Math.random() * badgeStyles.length)];
  const randomRotate = (Math.random() - 0.5) * 50;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.1, x: x - 40, y: y - 10, rotate: randomRotate }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0.3, 1.4, 1.1, 0.8],
        y: y - 90,
        rotate: randomRotate + (Math.random() > 0.5 ? 20 : -20)
      }}
      transition={{ duration: 0.85, ease: [0.175, 0.885, 0.32, 1.275] }}
      onAnimationComplete={onComplete}
      className="fixed z-50 pointer-events-none select-none"
    >
      {/* Comic Pop-Art Starburst Shape */}
      <div className={`relative px-4 py-1.5 font-headline text-2xl sm:text-3xl tracking-widest uppercase border-4 ${style.border} ${style.bg} ${style.text} shadow-comic-lg transform`}>
        {text}
        {/* Secondary pop sticker spike */}
        <span className="absolute -top-2 -right-2 text-xs font-black">⚡</span>
      </div>
    </motion.div>
  );
};
