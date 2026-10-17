'use client';

import React, { useEffect, useRef } from 'react';

interface RippleDotBackgroundProps {
  className?: string;
  theme?: 'light' | 'dark';
}

interface Dot {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  color: string;
}

export const RippleDotBackground: React.FC<RippleDotBackgroundProps> = ({
  className = '',
  theme = 'light',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates with smooth interpolation
    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      isHovered: false,
      speed: 0,
      prevX: -1000,
      prevY: -1000,
    };

    const spacing = 34; // Subtle dot grid spacing
    let dots: Dot[] = [];

    const initDots = () => {
      dots = [];
      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const baseX = c * spacing;
          const baseY = r * spacing;

          // Dimmed, elegant dot opacity for understated editorial luxury
          const baseAlpha = theme === 'light' ? 0.055 : 0.04;
          dots.push({
            baseX,
            baseY,
            x: baseX,
            y: baseY,
            vx: 0,
            vy: 0,
            radius: 1.1,
            baseAlpha,
            alpha: baseAlpha,
            // Softer neutral slate-400 in light mode to avoid high contrast glare
            color: theme === 'light' ? '148, 163, 184' : '74, 222, 128',
          });
        }
      }
    };

    initDots();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initDots();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.isHovered = true;
    };

    const handleMouseLeave = () => {
      mouse.targetX = -1000;
      mouse.targetY = -1000;
      mouse.isHovered = false;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    let time = 0;

    const render = () => {
      time += 0.02;

      // Mouse smoothing (lerp)
      mouse.x += (mouse.targetX - mouse.x) * 0.18;
      mouse.y += (mouse.targetY - mouse.y) * 0.18;

      // Calculate cursor speed
      const dxMouse = mouse.x - mouse.prevX;
      const dyMouse = mouse.y - mouse.prevY;
      mouse.speed = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;

      ctx.clearRect(0, 0, width, height);

      const rippleRadius = 130; // Area of effect
      const pushStrength = 18; // Soft physical displacement
      const springK = 0.08; // Spring return force
      const friction = 0.82; // Physics dampening

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];

        // 1. Vector from mouse to dot
        const dx = d.x - mouse.x;
        const dy = d.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // 2. Interactive ripple wave calculation when mouse is nearby
        if (dist < rippleRadius && mouse.isHovered) {
          const factor = (1 - dist / rippleRadius);
          const angle = Math.atan2(dy, dx);

          // Displace outward with smooth wave oscillation
          const wave = Math.sin(dist * 0.12 - time * 6) * factor * 3.5;
          const force = (factor * pushStrength + wave);

          d.vx += Math.cos(angle) * force * 0.22;
          d.vy += Math.sin(angle) * force * 0.22;

          // Restrained highlight near cursor (capped at 0.24 to keep subtle)
          d.alpha = Math.min(0.24, d.baseAlpha + factor * 0.18);
          d.radius = 1.1 + factor * 1.1;
        } else {
          // Gentle ambient drift back to base
          d.alpha += (d.baseAlpha - d.alpha) * 0.08;
          d.radius += (1.1 - d.radius) * 0.08;
        }

        // 3. Spring physics: return to (baseX, baseY)
        const springX = (d.baseX - d.x) * springK;
        const springY = (d.baseY - d.y) * springK;

        d.vx = (d.vx + springX) * friction;
        d.vy = (d.vy + springY) * friction;

        d.x += d.vx;
        d.y += d.vy;

        // 4. Subtle ambient breathing oscillation
        const ambientWave = Math.sin(time + (d.baseX + d.baseY) * 0.005) * 0.3;
        const renderRadius = Math.max(0.6, d.radius + ambientWave * 0.15);

        // Draw dot
        ctx.beginPath();
        ctx.arc(d.x, d.y, renderRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${d.color}, ${Math.max(0.02, d.alpha)})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ opacity: 0.6 }}
    />
  );
};
