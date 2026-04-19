import { useEffect, useRef } from "react";
import { rotatingFieldEx, rotatingFieldEy } from "../../utils/physics";
import {
  clearCanvas,
  drawGrid,
  drawPolyline,
  horizontalGradient,
  plotRect,
  label,
} from "../../utils/canvas";

interface RotatingCanvasProps {
  omega: number;
  k: number;
  amplitude: number;
  cavityLength: number;
  running: boolean;
  onTimeUpdate: (tUs: number) => void;
}

export default function RotatingCanvas({
  omega,
  k,
  amplitude,
  cavityLength,
  running,
  onTimeUpdate,
}: RotatingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pad = { l: 20, r: 20, t: 20, b: 20 };

    function render(t: number) {
      if (!ctx) return;
      const rect = plotRect(ctx, pad);
      const midY = rect.y + rect.h / 2;

      clearCanvas(ctx);
      drawGrid(ctx, rect, 4, 0);

      ctx.strokeStyle = "#1e3a5f44";
      ctx.beginPath();
      ctx.moveTo(rect.x, midY);
      ctx.lineTo(rect.x + rect.w, midY);
      ctx.stroke();

      const N = 400;
      const ex: { x: number; y: number }[] = [];
      const ey: { x: number; y: number }[] = [];
      for (let i = 0; i <= N; i++) {
        const frac = i / N;
        const xPos = frac * cavityLength;
        const Ex = rotatingFieldEx(xPos, t, omega, amplitude, k);
        const Ey = rotatingFieldEy(xPos, t, omega, amplitude, k);
        const px = rect.x + frac * rect.w;
        ex.push({ x: px, y: midY - (Ex / amplitude) * rect.h * 0.42 });
        ey.push({ x: px, y: midY - (Ey / amplitude) * rect.h * 0.42 });
      }

      drawPolyline(ctx, ex, horizontalGradient(ctx, rect, "#3b82f6", "#60a5fa"));
      drawPolyline(ctx, ey, horizontalGradient(ctx, rect, "#06b6d4", "#22d3ee"));

      label(ctx, "Ex (horizontal)", rect.x + 8, rect.y + 16, { color: "#3b82f6" });
      label(ctx, "Ey (vertical)", rect.x + 8, rect.y + 32, { color: "#06b6d4" });

      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(rect.x, rect.y);
      ctx.lineTo(rect.x, rect.y + rect.h);
      ctx.lineTo(rect.x + rect.w, rect.y + rect.h);
      ctx.stroke();
    }

    let last: number | null = null;
    let elapsed = timeRef.current;

    function tick(ts: number) {
      if (last === null) last = ts;
      const dt = (ts - last) / 1000;
      last = ts;
      if (running) elapsed += dt * 1e-6;
      timeRef.current = elapsed;
      render(elapsed);
      onTimeUpdate(parseFloat((elapsed * 1e6).toFixed(2)));
      animRef.current = requestAnimationFrame(tick);
    }

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [omega, k, amplitude, cavityLength, running, onTimeUpdate]);

  return (
    <div className="dark-mode:bg-slate-800 light-mode:bg-slate-50 coffee-mode:bg-slate-800 rounded-xl p-5">
      <h3 className="text-sm font-semibold dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300 uppercase tracking-wider mb-3">
        Rotating Polarization Wave — E_x and E_y along cavity
      </h3>
      <canvas
        ref={canvasRef}
        width={700}
        height={220}
        className="w-full rounded-lg"
        style={{ maxHeight: 220 }}
      />
      <div className="mt-2 text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-slate-500 font-mono text-center">
        E_x(x,t) = A cos(kx − ωt) &nbsp;·&nbsp; E_y(x,t) = A sin(kx − ωt)
      </div>
    </div>
  );
}
