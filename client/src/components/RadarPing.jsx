import React from 'react';

export default function RadarPing({ pings }) {
  if (!pings || pings.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {pings.map((ping) => {
        const color = ping.user?.color || '#6366f1';
        return (
          <div
            key={ping.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: ping.x, top: ping.y }}
          >
            {/* Outer expanding ripple ring */}
            <div
              className="radar-ping-ring w-28 h-28 border-2"
              style={{ borderColor: color, backgroundColor: `${color}15` }}
            />
            {/* Middle ripple ring */}
            <div
              className="radar-ping-ring w-16 h-16 border"
              style={{ borderColor: color, animationDelay: '0.2s' }}
            />
            {/* Center dot */}
            <div
              className="w-3.5 h-3.5 rounded-full shadow-lg border-2 border-white transform -translate-x-1/2 -translate-y-1/2 absolute top-0 left-0"
              style={{ backgroundColor: color }}
            />
            {/* User label */}
            <div
              className="absolute top-4 left-1/2 transform -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded text-[11px] font-bold text-white shadow-md border border-white/20 backdrop-blur-md"
              style={{ backgroundColor: color }}
            >
              📍 {ping.user?.name || 'Ping'}
            </div>
          </div>
        );
      })}
    </div>
  );
}
