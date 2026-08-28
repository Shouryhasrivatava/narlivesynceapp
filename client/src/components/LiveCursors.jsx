import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../context/SocketContext';

export default function LiveCursors({ cursors }) {
  const { currentUser } = useSocket();

  const cursorList = Object.values(cursors).filter(
    (c) => c.userId !== currentUser.id && c.x !== undefined && c.y !== undefined
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
      <AnimatePresence>
        {cursorList.map((cursor) => {
          const color = cursor.color || '#3b82f6';
          return (
            <motion.div
              key={cursor.socketId || cursor.userId}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: 1,
                scale: 1,
                x: cursor.x,
                y: cursor.y
              }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{
                type: 'spring',
                damping: 30,
                stiffness: 400,
                mass: 0.2
              }}
              className="absolute top-0 left-0"
              style={{ willChange: 'transform' }}
            >
              {/* Custom SVG Pointer */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transform -rotate-12 drop-shadow-md"
              >
                <path
                  d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
                  fill={color}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              </svg>

              {/* Collaborator Badge */}
              <div
                className="absolute left-3 top-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-white shadow-lg whitespace-nowrap border border-white/30 backdrop-blur-md select-none"
                style={{ backgroundColor: color }}
              >
                <span className="text-xs">{cursor.avatar || '👤'}</span>
                <span>{cursor.name}</span>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
