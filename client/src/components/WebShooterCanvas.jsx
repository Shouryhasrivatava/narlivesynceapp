import React, { useEffect, useRef, useState } from 'react';
import { soundFx } from '../utils/audio';
import { Crosshair } from 'lucide-react';

export const WebShooterCanvas = ({ webShooterActive, onToggleWebShooter }) => {
  const canvasRef = useRef(null);
  const websRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation Loop for Drawing Webs
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const now = Date.now();
      websRef.current = websRef.current.filter((web) => now - web.createdAt < web.duration);

      websRef.current.forEach((web) => {
        const elapsed = now - web.createdAt;
        const progress = Math.min(elapsed / 100, 1); // Fast shoot progress
        const alpha = Math.max(1 - elapsed / web.duration, 0);

        const currentX = web.startX + (web.targetX - web.startX) * progress;
        const currentY = web.startY + (web.targetY - web.startY) * progress;

        // Draw main web strand
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = web.width;
        ctx.lineCap = 'round';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;

        ctx.beginPath();
        ctx.moveTo(web.startX, web.startY);

        // Add subtle wave curvature
        const midX = (web.startX + currentX) / 2 + Math.sin(elapsed * 0.05) * 8;
        const midY = (web.startY + currentY) / 2 + Math.cos(elapsed * 0.05) * 8;
        ctx.quadraticCurveTo(midX, midY, currentX, currentY);
        ctx.stroke();

        // Draw web splat at target when arrived
        if (progress >= 1) {
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          const splatRadius = 14;

          for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            const endX = web.targetX + Math.cos(angle) * splatRadius;
            const endY = web.targetY + Math.sin(angle) * splatRadius;
            ctx.beginPath();
            ctx.moveTo(web.targetX, web.targetY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
          }

          // Splat center core
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(web.targetX, web.targetY, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Global Click Handler for Web Shooting
    const handleShootWeb = (e) => {
      // Don't shoot if clicking interactive elements like buttons/inputs unless webShooter mode is active
      const targetTag = e.target.tagName.toLowerCase();
      if (!webShooterActive && (targetTag === 'button' || targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select' || targetTag === 'a')) {
        return;
      }

      soundFx.playThwip();

      const originX = window.innerWidth > 768 ? window.innerWidth * 0.1 : window.innerWidth / 2;
      const originY = window.innerHeight;

      websRef.current.push({
        startX: originX,
        startY: originY,
        targetX: e.clientX,
        targetY: e.clientY,
        createdAt: Date.now(),
        duration: 1800,
        width: 3.5
      });
    };

    window.addEventListener('click', handleShootWeb);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('click', handleShootWeb);
      cancelAnimationFrame(animationFrameId);
    };
  }, [webShooterActive]);

  return (
    <>
      {/* Canvas for web line physics */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-40 pointer-events-none"
      />

      {/* Floating Web-Shooter Toggle Button */}
      <button
        onClick={onToggleWebShooter}
        className={`fixed bottom-5 left-5 z-40 flex items-center gap-2 px-3.5 py-2 font-headline tracking-wider text-sm border-3 border-spidey-black shadow-comic transition-all ${
          webShooterActive
            ? 'bg-spidey-red text-white'
            : 'bg-white text-spidey-black hover:bg-yellow-100'
        } comic-button`}
        title="Toggle Click-to-Shoot Web Mode (Shoot webs anywhere!)"
      >
        <Crosshair className="w-5 h-5 text-current animate-spin-slow" />
        <span>{webShooterActive ? 'WEB SHOOTER: ARMED 🎯' : 'WEB SHOOTER: READY'}</span>
      </button>
    </>
  );
};
