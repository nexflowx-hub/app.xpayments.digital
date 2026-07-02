'use client';

import React from 'react';

// ============================================================
// XPAYMENTS — Dot-Matrix World Map (SVG)
//
// Style: Dot-matrix continents + cyan glowing city nodes +
//        animated arc connections (great-circle style)
//
// Matches reference: dark navy dots for land, cyan-blue (#22d3ee)
// glowing nodes, curved connection lines, pitch-black background.
// ============================================================

// ── Viewbox: 0 0 1000 500 (equirectangular-ish) ──

// ── Continent outlines (simplified paths) ──
// These are rough but recognizable polygon outlines for each continent.
// Coordinates: x 0-1000 ≈ -180° to +180° longitude
//               y 0-500 ≈ +90° to -90° latitude

const CONTINENT_PATHS = [
  // North America (including Central America & Caribbean)
  'M 115,62 L 135,55 158,48 180,42 200,38 218,35 235,38 248,42 258,48 268,55 278,62 288,70 295,78 300,88 305,98 308,108 310,118 308,128 305,138 300,148 292,158 282,168 272,178 262,188 250,195 238,200 228,208 218,215 208,222 195,228 182,232 170,235 158,238 148,235 140,230 132,225 125,218 120,210 115,200 112,190 108,180 105,170 102,160 100,148 98,138 96,128 95,118 96,108 98,98 102,88 108,78 Z',

  // Greenland
  'M 310,28 L 330,22 348,20 365,22 375,28 380,38 378,48 370,55 358,60 342,62 328,58 318,50 312,40 Z',

  // South America
  'M 218,252 L 230,248 242,245 255,242 268,242 278,245 288,250 298,258 305,268 310,280 312,292 312,305 310,318 305,330 298,342 290,352 282,362 275,372 268,382 262,392 258,402 255,412 252,420 248,428 242,432 235,428 228,420 222,410 218,398 215,385 212,372 210,358 208,345 208,332 210,318 212,305 215,292 218,278 220,265 Z',

  // Europe
  'M 455,52 L 468,48 480,45 492,42 505,40 518,42 528,45 538,48 548,52 555,58 560,65 562,72 560,80 555,88 548,95 540,102 532,108 525,115 518,120 510,125 502,130 495,135 488,140 480,145 472,148 465,150 458,148 452,142 448,135 445,128 442,120 440,112 440,105 442,98 445,90 448,82 450,75 452,68 455,62 Z',

  // British Isles
  'M 442,65 L 448,60 452,62 454,68 452,75 448,80 444,78 442,72 Z',

  // Scandinavia
  'M 490,30 L 498,25 508,22 518,24 525,30 528,38 525,48 520,55 512,60 505,62 498,58 492,50 490,42 Z',

  // Africa
  'M 460,162 L 475,158 490,155 505,152 520,152 535,155 548,160 558,168 565,178 570,190 572,202 572,215 570,228 568,242 565,255 560,268 555,280 548,292 540,302 532,310 522,318 512,325 502,330 492,332 482,330 472,325 462,318 455,308 448,298 442,285 438,272 435,258 432,245 430,232 430,218 432,205 435,192 440,180 448,170 Z',

  // Madagascar
  'M 575,310 L 580,305 585,308 588,318 586,328 582,335 578,332 575,322 Z',

  // Asia (mainland)
  'M 558,38 L 580,32 605,28 630,25 658,22 685,20 710,22 735,25 758,28 780,32 798,38 812,45 822,55 830,65 835,78 838,90 835,102 830,115 825,128 818,140 810,152 800,162 790,172 780,182 770,190 758,198 745,205 732,212 718,218 705,225 692,230 680,235 668,238 655,240 642,238 630,235 618,230 608,222 598,215 590,205 582,195 575,185 570,175 565,165 562,155 558,145 555,135 552,125 550,115 548,105 548,95 550,85 552,75 555,65 558,55 Z',

  // India
  'M 665,178 L 675,172 688,168 700,170 710,175 718,182 722,192 725,205 722,218 718,230 712,242 705,250 698,255 690,252 682,245 675,235 670,225 665,215 662,202 660,190 Z',

  // Southeast Asia / Indonesia
  'M 738,228 L 750,225 762,228 775,232 788,238 798,245 805,255 808,265 805,275 798,282 788,285 775,282 762,278 750,272 742,265 738,255 735,245 735,238 Z',

  // Japan
  'M 858,88 L 865,82 872,85 878,92 880,102 878,112 872,120 865,125 858,120 855,112 854,102 855,95 Z',

  // Australia
  'M 798,318 L 818,312 838,308 858,310 875,315 888,322 895,332 898,345 895,358 888,368 878,375 865,380 852,382 838,380 825,375 812,368 802,358 795,348 792,338 792,328 Z',

  // New Zealand
  'M 928,368 L 932,362 936,365 938,375 936,385 932,388 928,382 Z',
];

// ── City nodes (x, y, label, size multiplier) ──
const CITIES = [
  { x: 295, y: 125, label: 'New York', s: 1.2 },
  { x: 172, y: 150, label: 'Los Angeles', s: 1 },
  { x: 248, y: 185, label: 'São Paulo', s: 1 },
  { x: 500, y: 95, label: 'London', s: 1.2 },
  { x: 510, y: 112, label: 'Lisbon', s: 0.8 },
  { x: 518, y: 88, label: 'Amsterdam', s: 0.9 },
  { x: 535, y: 80, label: 'Berlin', s: 0.9 },
  { x: 515, y: 105, label: 'Paris', s: 1 },
  { x: 508, y: 228, label: 'Lagos', s: 1 },
  { x: 648, y: 178, label: 'Dubai', s: 1 },
  { x: 692, y: 198, label: 'Mumbai', s: 1.1 },
  { x: 758, y: 188, label: 'Bangkok', s: 0.9 },
  { x: 788, y: 245, label: 'Singapore', s: 1.1 },
  { x: 868, y: 130, label: 'Tokyo', s: 1.2 },
  { x: 855, y: 108, label: 'Seoul', s: 0.9 },
  { x: 812, y: 138, label: 'Hong Kong', s: 1 },
  { x: 720, y: 100, label: 'Moscow', s: 0.9 },
  { x: 652, y: 230, label: 'Nairobi', s: 0.8 },
  { x: 870, y: 345, label: 'Sydney', s: 1 },
  { x: 492, y: 115, label: 'Zürich', s: 0.8 },
  { x: 545, y: 70, label: 'Stockholm', s: 0.8 },
  { x: 210, y: 358, label: 'Buenos Aires', s: 0.8 },
  { x: 488, y: 40, label: 'Helsinki', s: 0.7 },
  { x: 555, y: 55, label: 'Warsaw', s: 0.7 },
  { x: 575, y: 60, label: 'Kyiv', s: 0.7 },
  { x: 620, y: 95, label: 'Tashkent', s: 0.6 },
  { x: 800, y: 70, label: 'Beijing', s: 1 },
  { x: 762, y: 105, label: 'Shanghai', s: 1 },
];

// ── Connection arcs (from → to indices) ──
const ARCS: [number, number][] = [
  [0, 3],   // New York → London
  [0, 2],   // New York → São Paulo
  [3, 9],   // London → Dubai
  [3, 13],  // London → Tokyo
  [9, 10],  // Dubai → Mumbai
  [9, 8],   // Dubai → Lagos
  [10, 12], // Mumbai → Singapore
  [12, 13], // Singapore → Tokyo
  [1, 13],  // Los Angeles → Tokyo
  [1, 12], // Los Angeles → Singapore
  [3, 7],   // London → Paris
  [7, 5],   // Paris → Amsterdam
  [5, 6],   // Amsterdam → Berlin
  [6, 16],  // Berlin → Moscow
  [10, 2],  // Mumbai → São Paulo
  [15, 12], // Hong Kong → Singapore
  [3, 19],  // London → Zürich
  [13, 18], // Tokyo → Sydney
  [17, 9],  // Nairobi → Dubai
  [22, 2],  // Buenos Aires → São Paulo
  [14, 13], // Seoul → Tokyo
  [27, 28], // Beijing → Shanghai
  [28, 13], // Shanghai → Tokyo
  [25, 16], // Kyiv → Moscow
  [15, 10], // Hong Kong → Mumbai
  [3, 0],   // London → New York (duplicate path OK for density)
];

// ── Generate quadratic bezier arc between two points ──
function arcPath(x1: number, y1: number, x2: number, y2: number): string {
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;
  // Lift the control point upward proportional to distance
  const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const lift = Math.min(dist * 0.25, 80);
  const dx = x2 - x1;
  const dy = y2 - y1;
  // Perpendicular direction (pointing "up" / northward)
  const nx = -dy;
  const ny = dx;
  const len = Math.sqrt(nx * nx + ny * ny) || 1;
  const qx = cx + (nx / len) * lift * (cy < 250 ? -1 : 1);
  const qy = cy + (ny / len) * lift * (cy < 250 ? -1 : 1);
  return `M ${x1},${y1} Q ${qx},${qy} ${x2},${y2}`;
}

// ============================================================
// Component
// ============================================================

export default function WorldMapSVG() {
  return (
    <svg
      viewBox="0 0 1000 500"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* ── Dot pattern for continents ── */}
        <pattern
          id="dot-pattern"
          x="0"
          y="0"
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="4" cy="4" r="1.2" fill="rgba(100,140,200,0.35)" />
        </pattern>

        {/* ── Glow filter for nodes ── */}
        <filter id="glow-cyan" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur1" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur2" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="blur3" />
          <feMerge>
            <feMergeNode in="blur3" />
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* ── Subtle glow for arcs ── */}
        <filter id="glow-line" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* ── Continent clip: combine all paths ── */}
        <clipPath id="continents-clip">
          {CONTINENT_PATHS.map((d, i) => (
            <path key={i} d={d} fill="black" />
          ))}
        </clipPath>

        {/* ── Animated dash for arcs ── */}
        <style>{`
          @keyframes pulse-node {
            0%, 100% { opacity: 0.7; r: attr(r); }
            50% { opacity: 1; }
          }
          @keyframes flow-dash {
            0% { stroke-dashoffset: 20; }
            100% { stroke-dashoffset: 0; }
          }
          .arc-line {
            stroke-dasharray: 6 14;
            animation: flow-dash 2.5s linear infinite;
          }
          .node-pulse {
            animation: pulse-node 3s ease-in-out infinite;
          }
          .node-pulse-delay {
            animation: pulse-node 3s ease-in-out 1.5s infinite;
          }
        `}</style>
      </defs>

      {/* ── Continent dot-matrix fill ── */}
      <g clipPath="url(#continents-clip)">
        <rect
          x="0"
          y="0"
          width="1000"
          height="500"
          fill="url(#dot-pattern)"
        />
        {/* Subtle continent edge glow */}
        {CONTINENT_PATHS.map((d, i) => (
          <path
            key={`edge-${i}`}
            d={d}
            fill="none"
            stroke="rgba(100,160,220,0.08)"
            strokeWidth="1.5"
          />
        ))}
      </g>

      {/* ── Connection arcs ── */}
      <g filter="url(#glow-line)" opacity="0.6">
        {ARCS.map(([fromIdx, toIdx], i) => {
          const from = CITIES[fromIdx];
          const to = CITIES[toIdx];
          if (!from || !to) return null;
          return (
            <path
              key={`arc-${i}`}
              d={arcPath(from.x, from.y, to.x, to.y)}
              fill="none"
              stroke="rgba(34,211,238,0.5)"
              strokeWidth="0.8"
              className="arc-line"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          );
        })}
      </g>

      {/* ── City nodes ── */}
      <g filter="url(#glow-cyan)">
        {CITIES.map((city, i) => (
          <g key={city.label}>
            {/* Outer glow halo */}
            <circle
              cx={city.x}
              cy={city.y}
              r={4 * city.s}
              fill="rgba(34,211,238,0.08)"
              className={i % 2 === 0 ? 'node-pulse' : 'node-pulse-delay'}
            />
            {/* Inner bright dot */}
            <circle
              cx={city.x}
              cy={city.y}
              r={1.8 * city.s}
              fill="#22d3ee"
              className={i % 2 === 0 ? 'node-pulse' : 'node-pulse-delay'}
            />
            {/* Core white point */}
            <circle
              cx={city.x}
              cy={city.y}
              r={0.8 * city.s}
              fill="white"
              opacity="0.9"
            />
          </g>
        ))}
      </g>
    </svg>
  );
}