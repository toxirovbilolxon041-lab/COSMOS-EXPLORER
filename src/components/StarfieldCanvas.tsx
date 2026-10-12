import React, { useEffect, useRef } from 'react';
import { Theme } from '../types';

interface StarfieldCanvasProps {
  theme: Theme;
}

export const StarfieldCanvas: React.FC<StarfieldCanvasProps> = ({ theme }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Generate stars
    const starCount = width < 768 ? 120 : 250;
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.8 + 0.4,
      alpha: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.05 + 0.01,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinklePhase: Math.random() * Math.PI * 2,
      color:
        Math.random() > 0.8
          ? '#93c5fd'
          : Math.random() > 0.6
          ? '#fde68a'
          : Math.random() > 0.4
          ? '#f472b6'
          : '#ffffff',
    }));

    // Shooting stars
    interface ShootingStar {
      x: number;
      y: number;
      length: number;
      speed: number;
      angle: number;
      alpha: number;
      active: boolean;
    }
    const shootingStars: ShootingStar[] = [];

    const spawnShootingStar = () => {
      if (shootingStars.length < 2 && Math.random() < 0.015) {
        shootingStars.push({
          x: Math.random() * width,
          y: Math.random() * (height * 0.4),
          length: Math.random() * 80 + 40,
          speed: Math.random() * 7 + 4,
          angle: (Math.PI / 4) + (Math.random() * 0.3 - 0.15),
          alpha: 1,
          active: true,
        });
      }
    };

    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      // Starfield rendering
      const isDark = theme === 'dark';
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.y -= star.speed;
        if (star.y < 0) {
          star.y = height;
          star.x = Math.random() * width;
        }

        const twinkle = Math.sin(tick * star.twinkleSpeed + star.twinklePhase);
        const dynamicAlpha = Math.max(0.1, star.alpha + twinkle * 0.3);

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? star.color
          : '#64748b';
        ctx.globalAlpha = isDark ? dynamicAlpha : dynamicAlpha * 0.35;
        ctx.fill();
      }

      // Shooting stars only in dark mode or night feel
      if (isDark) {
        spawnShootingStar();
        for (let i = shootingStars.length - 1; i >= 0; i--) {
          const s = shootingStars[i];
          if (!s.active) continue;

          s.x += Math.cos(s.angle) * s.speed;
          s.y += Math.sin(s.angle) * s.speed;
          s.alpha -= 0.012;

          if (s.alpha <= 0 || s.x > width || s.y > height) {
            shootingStars.splice(i, 1);
            continue;
          }

          const tailX = s.x - Math.cos(s.angle) * s.length;
          const tailY = s.y - Math.sin(s.angle) * s.length;

          const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
          grad.addColorStop(0, 'rgba(56, 189, 248, 0)');
          grad.addColorStop(1, `rgba(255, 255, 255, ${s.alpha})`);

          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(s.x, s.y);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.8;
          ctx.globalAlpha = s.alpha;
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
      aria-hidden="true"
    />
  );
};
