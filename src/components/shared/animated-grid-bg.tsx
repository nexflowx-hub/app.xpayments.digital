'use client';

import React from 'react';

interface Beam {
  id: number;
  direction: 'horizontal' | 'vertical';
  top?: string;
  left?: string;
  width?: string;
  height?: string;
  duration: number;
  delay: number;
}

const horizontalBeams: Beam[] = [
  { id: 1, direction: 'horizontal', top: '15%', width: '40%', height: '1px', duration: 12, delay: 0 },
  { id: 2, direction: 'horizontal', top: '38%', width: '35%', height: '2px', duration: 16, delay: 4 },
  { id: 3, direction: 'horizontal', top: '62%', width: '45%', height: '1px', duration: 10, delay: 7 },
  { id: 4, direction: 'horizontal', top: '85%', width: '30%', height: '1px', duration: 20, delay: 2 },
];

const verticalBeams: Beam[] = [
  { id: 5, direction: 'vertical', left: '20%', width: '1px', height: '40%', duration: 14, delay: 1 },
  { id: 6, direction: 'vertical', left: '45%', width: '2px', height: '35%', duration: 18, delay: 5 },
  { id: 7, direction: 'vertical', left: '70%', width: '1px', height: '45%', duration: 11, delay: 3 },
  { id: 8, direction: 'vertical', left: '90%', width: '1px', height: '30%', duration: 15, delay: 8 },
];

export default function AnimatedGridBg() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Base grid pattern */}
      <div
        className="absolute inset-0 animate-grid-glow"
        style={{
          backgroundImage: `
            linear-gradient(rgba(16,185,129,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16,185,129,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Horizontal light beams */}
      {horizontalBeams.map((beam) => (
        <div
          key={beam.id}
          className="absolute"
          style={{
            top: beam.top,
            left: '-30%',
            width: beam.width,
            height: beam.height,
            background:
              'linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.3) 30%, rgba(16,185,129,0.5) 50%, rgba(16,185,129,0.3) 70%, transparent 100%)',
            filter: 'blur(1px)',
            animation: `grid-pulse-h ${beam.duration}s linear infinite`,
            animationDelay: `${beam.delay}s`,
          }}
        />
      ))}

      {/* Vertical light beams */}
      {verticalBeams.map((beam) => (
        <div
          key={beam.id}
          className="absolute"
          style={{
            top: '-30%',
            left: beam.left,
            width: beam.width,
            height: beam.height,
            background:
              'linear-gradient(180deg, transparent 0%, rgba(16,185,129,0.3) 30%, rgba(16,185,129,0.5) 50%, rgba(16,185,129,0.3) 70%, transparent 100%)',
            filter: 'blur(1px)',
            animation: `grid-pulse-v ${beam.duration}s linear infinite`,
            animationDelay: `${beam.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
