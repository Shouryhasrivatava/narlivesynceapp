import React from 'react';

// Helper to convert point array into a smooth SVG bezier curve
export function pointsToSvgPath(points) {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y} L ${points[0].x + 0.1} ${points[0].y + 0.1}`;

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length - 1; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2;
    const yc = (points[i].y + points[i + 1].y) / 2;
    d += ` Q ${points[i].x} ${points[i].y}, ${xc} ${yc}`;
  }

  const last = points[points.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}

export default function CanvasDrawings({ strokes = [], currentStroke = null }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-5 overflow-visible">
      {/* Existing Saved Freehand Strokes */}
      {strokes.map((stroke) => (
        <path
          key={stroke.id}
          d={pointsToSvgPath(stroke.points)}
          fill="none"
          stroke={stroke.color || '#18181b'}
          strokeWidth={stroke.width || 3}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-opacity duration-75"
        />
      ))}

      {/* In-Progress Live Stroke */}
      {currentStroke && currentStroke.points && currentStroke.points.length > 0 && (
        <path
          d={pointsToSvgPath(currentStroke.points)}
          fill="none"
          stroke={currentStroke.color || '#18181b'}
          strokeWidth={currentStroke.width || 3}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-90"
        />
      )}
    </svg>
  );
}
