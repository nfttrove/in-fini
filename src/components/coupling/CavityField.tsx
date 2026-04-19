import { useEffect, useRef } from "react";
import { clearCanvas, plotRect, label } from "../../utils/canvas";

const C = 2.99792458e8;
const TWO_PI = 2 * Math.PI;

interface CavityFieldProps {
  cavityLength: number;
  modeNumber: number;
  drivingFreqHz: number;
  resonantFreqHz: number;
  coupling: number;
  running: boolean;
}

export default function CavityField({
  cavityLength,
  modeNumber,
  drivingFreqHz,
  resonantFreqHz,
  coupling,
  running,
}: CavityFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const omega = TWO_PI * drivingFreqHz;
    const k = omega / C;
    const resonantOmega = TWO_PI * resonantFreqHz;
    const resonantK = resonantOmega / C;

    const pad = { l: 40, r: 40, t: 20, b: 10 };
    let t = 0;

    function render(ts: number) {
      if (!ctx) return;
      if (running) t = ts * 0.001 * 1e-6;
      const rect = plotRect(ctx, pad);
      const midY = rect.y + rect.h / 2;

      clearCanvas(ctx);

      ctx.fillStyle = "#334155";
      ctx.fillRect(rect.x - 8, rect.y, 8, rect.h);
      ctx.fillRect(rect.x + rect.w, rect.y, 8, rect.h);

      ctx.strokeStyle = "#1e3a5f";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(rect.x, midY);
      ctx.lineTo(rect.x + rect.w, midY);
      ctx.stroke();

      const N = 300;
      const drawWave = (phase: number, color: string, width: number) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        for (let i = 0; i <= N; i++) {
          const frac = i / N;
          const xPos = frac * cavityLength;
          const standing =
            Math.sin(resonantK * xPos) *
            (phase === 0
              ? Math.cos(resonantOmega * t)
              : Math.sin(resonantOmega * t));
          const drive =
            0.3 *
            (phase === 0
              ? Math.cos(k * xPos - omega * t)
              : Math.sin(k * xPos - omega * t));
          const total = coupling * standing + (1 - coupling) * drive;
          const px = rect.x + frac * rect.w;
          const py = midY - total * rect.h * 0.42;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      };

      drawWave(0, `rgba(59, 130, 246, ${0.3 + 0.7 * coupling})`, 2);
      drawWave(1, `rgba(6, 182, 212, ${0.2 + 0.4 * coupling})`, 1.5);

      label(
        ctx,
        `Cavity (L = ${cavityLength.toFixed(2)} m, mode n = ${modeNumber})`,
        rect.x + rect.w / 2,
        ctx.canvas.height - 2,
        { color: "#64748b", align: "center" }
      );

      animRef.current = requestAnimationFrame(render);
    }

    animRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animRef.current);
  }, [cavityLength, modeNumber, drivingFreqHz, resonantFreqHz, coupling, running]);

  return (
    <div className="dark-mode:bg-slate-800 light-mode:bg-slate-50 coffee-mode:bg-slate-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300 uppercase tracking-wider mb-3">
        Cavity Field (live animation)
      </h3>
      <canvas
        ref={canvasRef}
        width={700}
        height={160}
        className="w-full rounded-lg"
        style={{ maxHeight: 160 }}
      />
    </div>
  );
}
