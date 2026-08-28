import React from 'react';
import { X } from 'lucide-react';

export default function CanvasConnectors({ connectors = [], notes = [], onDeleteConnector }) {
  const getNoteCenter = (noteId) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return null;
    const w = note.width || 320;
    const h = note.height || 230;
    return {
      x: note.x + w / 2,
      y: note.y + h / 2,
      left: note.x,
      right: note.x + w,
      top: note.y,
      bottom: note.y + h
    };
  };

  // Calculate clean connection points between two boxes
  const calculateConnection = (fromCenter, toCenter) => {
    if (!fromCenter || !toCenter) return null;

    const dx = toCenter.x - fromCenter.x;
    const dy = toCenter.y - fromCenter.y;

    let startX = fromCenter.x;
    let startY = fromCenter.y;
    let endX = toCenter.x;
    let endY = toCenter.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      startX = dx > 0 ? fromCenter.right : fromCenter.left;
      endX = dx > 0 ? toCenter.left : toCenter.right;
    } else {
      startY = dy > 0 ? fromCenter.bottom : fromCenter.top;
      endY = dy > 0 ? toCenter.top : toCenter.bottom;
    }

    // Bezier control point for a smooth organic StrawPage curve
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const curveOffset = Math.min(60, Math.hypot(dx, dy) * 0.15);
    const ctrlX = midX;
    const ctrlY = midY - curveOffset;

    return {
      startX,
      startY,
      endX,
      endY,
      midX,
      midY: ctrlY,
      path: `M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`
    };
  };

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
      <defs>
        <marker
          id="straw-arrowhead"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 10 5 L 0 9 z" fill="currentColor" />
        </marker>

        <marker
          id="straw-arrowhead-dark"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#ffffff" />
        </marker>
      </defs>

      {connectors.map((conn) => {
        const fromNote = getNoteCenter(conn.fromNoteId);
        const toNote = getNoteCenter(conn.toNoteId);
        const calc = calculateConnection(fromNote, toNote);
        if (!calc) return null;

        return (
          <g key={conn.id} className="group">
            {/* Background wider hit-area */}
            <path
              d={calc.path}
              fill="none"
              stroke="transparent"
              strokeWidth="20"
              className="pointer-events-auto cursor-pointer"
              onClick={() => onDeleteConnector(conn.id)}
            />

            {/* Main Arrow Line */}
            <path
              d={calc.path}
              fill="none"
              stroke={conn.color || '#18181b'}
              strokeWidth="2.5"
              strokeLinecap="round"
              markerEnd="url(#straw-arrowhead)"
              className="transition-all duration-75 text-zinc-900 dark:text-zinc-200"
            />

            {/* Subtle animated dashed connector style */}
            <path
              d={calc.path}
              fill="none"
              stroke={conn.color || '#18181b'}
              strokeWidth="1.5"
              className="connector-line opacity-40"
            />

            {/* Delete button on hover */}
            <g
              transform={`translate(${calc.midX - 10}, ${calc.midY - 10})`}
              className="opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity pointer-events-auto cursor-pointer"
              onClick={() => onDeleteConnector(conn.id)}
            >
              <circle cx="10" cy="10" r="10" fill="#000000" className="dark:fill-white" />
              <path
                d="M 6 6 L 14 14 M 14 6 L 6 14"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                className="dark:stroke-black"
              />
            </g>
          </g>
        );
      })}
    </svg>
  );
}
