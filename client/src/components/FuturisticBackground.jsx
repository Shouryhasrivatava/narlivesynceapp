import React from 'react';

export default function FuturisticBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* 1. Deep Space Futuristic Ambient Orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-[#1c2bff]/20 dark:bg-[#1c2bff]/25 blur-[140px] animate-pulse-glow" />
      <div className="absolute top-[30%] right-[-10%] w-[700px] h-[700px] rounded-full bg-[#6366f1]/15 dark:bg-[#7928ca]/20 blur-[160px] animate-float-slow" />
      <div className="absolute bottom-[-10%] left-[25%] w-[550px] h-[550px] rounded-full bg-[#00d2ff]/15 dark:bg-[#00d2ff]/20 blur-[130px] animate-pulse-glow" style={{ animationDelay: '2s' }} />

      {/* 2. Cybernetic Laser Beam Accents */}
      <div className="absolute top-14 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#1c2bff]/40 dark:via-[#1c2bff]/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00d2ff]/30 dark:via-[#00d2ff]/50 to-transparent" />

      {/* 3. Subtle Cyber Dust Particles */}
      <div className="cyber-particles absolute inset-0 opacity-40 dark:opacity-60" />
    </div>
  );
}
