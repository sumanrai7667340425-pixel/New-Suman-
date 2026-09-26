import React, { useEffect, useRef } from 'react';
import { GameStatus } from '../types';

interface AviatorCanvasProps {
  status: GameStatus;
  multiplier: number;
  finalMultiplier: number;
  countdown: number; // 0 to 5 seconds
}

export const AviatorCanvas: React.FC<AviatorCanvasProps> = ({
  status,
  multiplier,
  finalMultiplier,
  countdown,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const smokeParticlesRef = useRef<Array<{ x: number; y: number; alpha: number; size: number }>>([]);
  const propellerAngleRef = useRef<number>(0);
  const flightProgressRef = useRef<number>(0); // 0 to 1 for visual smoothing

  // Track flight progression smoothly
  useEffect(() => {
    if (status === 'WAITING') {
      flightProgressRef.current = 0;
      smokeParticlesRef.current = [];
    }
  }, [status]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      const width = canvas.width;
      const height = canvas.height;

      // Clear with deep sleek radar background
      ctx.fillStyle = '#0a0b0e';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;

      // Vertical grid lines
      const vCols = 6;
      for (let i = 1; i < vCols; i++) {
        const x = (width / vCols) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal grid lines
      const hRows = 5;
      for (let i = 1; i < hRows; i++) {
        const y = (height / hRows) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Origin point for the curve
      const originX = 40;
      const originY = height - 35;

      // Draw Axes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(originX, 15);
      ctx.lineTo(originX, originY);
      ctx.lineTo(width - 15, originY);
      ctx.stroke();

      // Axis labels (subtle)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText('0s', originX - 5, originY + 18);
      ctx.fillText('5s', originX + (width - originX) * 0.35, originY + 18);
      ctx.fillText('10s', originX + (width - originX) * 0.7, originY + 18);

      if (status === 'FLYING' || status === 'CRASHED') {
        // Calculate plane coordinate along smooth exponential trajectory
        // Max visual target at right-top
        const maxPlaneX = width - 70;
        const minPlaneY = 55;

        // Progress based on log of multiplier
        const currentMult = status === 'FLYING' ? multiplier : finalMultiplier;
        const progress = Math.min(1, Math.max(0.05, Math.log10(currentMult) / 1.5));
        flightProgressRef.current = progress;

        let planeX = originX + (maxPlaneX - originX) * Math.min(1, progress * 1.05);
        let planeY = originY - (originY - minPlaneY) * Math.pow(progress, 0.75);

        // If crashed, animate the plane flying off screen rapidly!
        if (status === 'CRASHED') {
          planeX += 120;
          planeY -= 80;
        }

        // Draw trajectory curve & red glow fill
        const cpX = originX + (planeX - originX) * 0.65;
        const cpY = originY;

        // Gradient filled curve beneath plane
        const grad = ctx.createLinearGradient(0, planeY, 0, originY);
        grad.addColorStop(0, 'rgba(225, 29, 72, 0.35)');
        grad.addColorStop(0.7, 'rgba(225, 29, 72, 0.1)');
        grad.addColorStop(1, 'rgba(225, 29, 72, 0.0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.quadraticCurveTo(cpX, cpY, Math.min(width, planeX), Math.min(height, planeY));
        ctx.lineTo(Math.min(width, planeX), originY);
        ctx.closePath();
        ctx.fill();

        // Trajectory line
        ctx.strokeStyle = '#e11d48';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#e11d48';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.quadraticCurveTo(cpX, cpY, planeX, planeY);
        ctx.stroke();
        ctx.shadowBlur = 0; // reset shadow

        // Emit smoke particles from tail
        if (status === 'FLYING' && Math.random() > 0.4) {
          smokeParticlesRef.current.push({
            x: planeX - 25 + (Math.random() - 0.5) * 6,
            y: planeY + 8 + (Math.random() - 0.5) * 6,
            alpha: 0.6,
            size: 3 + Math.random() * 4,
          });
        }

        // Render smoke particles
        for (let i = smokeParticlesRef.current.length - 1; i >= 0; i--) {
          const p = smokeParticlesRef.current[i];
          p.alpha -= 0.02;
          p.x -= 1.2;
          p.size += 0.15;

          if (p.alpha <= 0) {
            smokeParticlesRef.current.splice(i, 1);
          } else {
            ctx.fillStyle = `rgba(244, 63, 94, ${p.alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Draw the Red Aviator Airplane (Only if in bounds / during flight or just flew)
        if (status === 'FLYING' || (status === 'CRASHED' && planeX < width + 100)) {
          ctx.save();
          ctx.translate(planeX, planeY);

          // Flight angle calculation (tangent slope)
          const angle = Math.max(-0.45, -0.15 - progress * 0.25);
          ctx.rotate(angle);

          propellerAngleRef.current += 0.8;

          // Plane Body (Red aerodynamic Aviator prop)
          // Fuselage
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.ellipse(0, 0, 26, 8, 0, 0, Math.PI * 2);
          ctx.fill();

          // Cockpit canopy
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.ellipse(3, -4, 9, 4, -0.1, 0, Math.PI * 2);
          ctx.fill();

          // Wings (Main Wing)
          ctx.fillStyle = '#b91c1c';
          ctx.beginPath();
          ctx.moveTo(-4, -2);
          ctx.lineTo(-12, -22);
          ctx.lineTo(2, -22);
          ctx.lineTo(8, -2);
          ctx.closePath();
          ctx.fill();

          // Tail Wing & Fin
          ctx.fillStyle = '#991b1b';
          ctx.beginPath();
          ctx.moveTo(-20, 0);
          ctx.lineTo(-28, -14);
          ctx.lineTo(-24, -14);
          ctx.lineTo(-15, 0);
          ctx.closePath();
          ctx.fill();

          // Propeller Nose Cone
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(26, 0, 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Spinning Propeller
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          const propRadius = 14;
          const propSin = Math.sin(propellerAngleRef.current) * propRadius;
          const propCos = Math.cos(propellerAngleRef.current) * 3;
          ctx.moveTo(26 + propCos, -propSin);
          ctx.lineTo(26 - propCos, propSin);
          ctx.stroke();

          // Airplane glow
          ctx.shadowColor = '#f43f5e';
          ctx.shadowBlur = 8;
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(0, 0, 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [status, multiplier, finalMultiplier]);

  // Handle high-DPI canvas resizing
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative w-full h-[280px] sm:h-[340px] md:h-[380px] bg-[#0c0d12] rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl flex flex-col justify-between">
      {/* Top Banner (UFC Aviator & Spribe Partnership as shown in screenshot) */}
      <div className="absolute top-2.5 left-3 right-3 z-10 flex items-center justify-between pointer-events-none select-none">
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
          <span className="text-red-500 font-black italic tracking-wider text-xs">UFC</span>
          <span className="text-slate-500 text-xs">|</span>
          <span className="text-white font-bold text-xs flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-ping"></span>
            Aviator
          </span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold border-l border-white/10 pl-2">
            OFFICIAL
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Spribe official badge */}
          <div className="hidden sm:flex items-center gap-1.5 bg-[#14281f]/80 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-[11px] font-semibold text-emerald-400">SPRIBE Verified</span>
          </div>

          {/* Active players pill */}
          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
            <div className="flex -space-x-1.5 overflow-hidden">
              <span className="inline-block h-4 w-4 rounded-full ring-1 ring-black bg-blue-500 text-[8px] text-white flex items-center justify-center font-bold">✈</span>
              <span className="inline-block h-4 w-4 rounded-full ring-1 ring-black bg-emerald-500 text-[8px] text-white flex items-center justify-center font-bold">₹</span>
              <span className="inline-block h-4 w-4 rounded-full ring-1 ring-black bg-rose-500 text-[8px] text-white flex items-center justify-center font-bold">★</span>
            </div>
            <span className="text-xs font-bold text-slate-300">52</span>
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />

      {/* Center Dynamic Multiplier / Status Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10">
        {status === 'WAITING' && (
          <div className="text-center px-6 py-4 bg-black/60 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl max-w-xs w-full mx-4">
            <div className="flex items-center justify-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-widest mb-1.5">
              <span className="animate-spin text-base">⚙</span>
              <span>Next Flight In</span>
            </div>
            <div className="text-4xl font-extrabold text-white font-display tracking-wider mb-2.5">
              {countdown.toFixed(1)}s
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden p-0.5 border border-white/5">
              <div
                className="bg-gradient-to-r from-rose-500 to-red-600 h-full rounded-full transition-all duration-100 ease-linear shadow-sm"
                style={{ width: `${Math.max(0, Math.min(100, (countdown / 5) * 100))}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">Place your bets now!</p>
          </div>
        )}

        {status === 'FLYING' && (
          <div className="text-center flex flex-col items-center">
            <div className="text-5xl sm:text-6xl md:text-7xl font-black text-white font-display tracking-tight drop-shadow-[0_4px_16px_rgba(225,29,72,0.6)]">
              {multiplier.toFixed(2)}x
            </div>
            <div className="mt-1 px-3 py-0.5 bg-rose-600/30 border border-rose-500/40 rounded-full text-rose-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm animate-pulse">
              Plane Climbing
            </div>
          </div>
        )}

        {status === 'CRASHED' && (
          <div className="text-center flex flex-col items-center animate-bounce-short">
            <div className="text-2xl sm:text-3xl font-black text-red-500 uppercase tracking-widest font-display drop-shadow-[0_2px_12px_rgba(239,68,68,0.8)]">
              FLEW AWAY!
            </div>
            <div className="text-5xl sm:text-6xl font-black text-red-600 font-display tracking-tight mt-1">
              {finalMultiplier.toFixed(2)}x
            </div>
            <div className="text-xs text-slate-400 font-semibold mt-1 bg-red-950/40 px-3 py-1 rounded-full border border-red-800/30">
              Round Finished
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
