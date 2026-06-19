'use client';

import React, { useEffect, useRef } from 'react';

/* ── Types ── */
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

/* ── Constants ── */
const PARTICLE_COUNT = 50;
const CONNECTION_DIST = 140;
const MOUSE_RADIUS = 180;
const MOUSE_FORCE = 0.008;
const NEON_RGB = { r: 16, g: 185, b: 129 }; // #10b981

function initParticles(w: number, h: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: 1 + Math.random() * 1.5,
      opacity: 0.1 + Math.random() * 0.3,
    });
  }
  return particles;
}

export default function AnimatedGridBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const particles = initParticles(window.innerWidth, window.innerHeight);
    const mouse = { x: -9999, y: -9999, smoothX: -9999, smoothY: -9999 };
    const THROTTLE_MS = 1000 / 30;
    let lastTime = 0;
    let rafId = 0;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
    }

    function draw(timestamp: number) {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const delta = timestamp - lastTime;
      if (delta < THROTTLE_MS) {
        rafId = requestAnimationFrame(draw);
        return;
      }
      lastTime = timestamp;

      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const { r, g, b } = NEON_RGB;

      // Smooth mouse tracking (lag effect)
      mouse.smoothX += (mouse.x - mouse.smoothX) * 0.04;
      mouse.smoothY += (mouse.y - mouse.smoothY) * 0.04;

      // Clear canvas
      ctx.clearRect(0, 0, w, h);

      // Draw mouse-following radial glow
      if (mouse.smoothX > -5000) {
        const glow = ctx.createRadialGradient(mouse.smoothX, mouse.smoothY, 0, mouse.smoothX, mouse.smoothY, 300);
        glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.04)`);
        glow.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.015)`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);
      }

      // Update & draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Mouse attraction/repulsion
        const dx = mouse.smoothX - p.x;
        const dy = mouse.smoothY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * MOUSE_FORCE;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        // Damping
        p.vx *= 0.998;
        p.vy *= 0.998;

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        // Draw particle dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity})`;
        ctx.fill();
      }

      // Draw connection lines between nearby particles
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const bP = particles[j];
          const cdx = a.x - bP.x;
          const cdy = a.y - bP.y;
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
          if (cdist < CONNECTION_DIST) {
            const alpha = (1 - cdist / CONNECTION_DIST) * 0.15;
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(bP.x, bP.y);
            ctx.stroke();
          }
        }
      }

      rafId = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Canvas particle layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        aria-hidden="true"
      />

      {/* CSS grid overlay (base layer) */}
      <div className="absolute inset-0 xpayments-grid-bg" aria-hidden="true" />
    </div>
  );
}