import { useMemo, useRef, useEffect } from "react";
import Panel from "./ui/Panel";
import PlainExplainer from "./ui/PlainExplainer";
import { AtlasMap, cellAt, allAtlases } from "../utils/boundaryAtlas";
import { useTheme } from "../contexts/theme-context";

function AtlasCanvas({ map }: { map: AtlasMap }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark" || theme === "coffee";

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const padL = 56;
    const padB = 30;
    const padT = 8;
    const padR = 8;
    const gw = W - padL - padR;
    const gh = H - padT - padB;

    ctx.fillStyle = isDark ? "#0f172a" : "#f8fafc";
    ctx.fillRect(0, 0, W, H);

    const cw = gw / map.width;
    const ch = gh / map.height;
    const colorOf = (code: number) =>
      map.legend.find((l) => l.code === code)?.color ?? "#334155";

    for (let j = 0; j < map.height; j++) {
      for (let i = 0; i < map.width; i++) {
        ctx.fillStyle = colorOf(cellAt(map, i, j));
        ctx.fillRect(padL + i * cw, padT + j * ch, cw + 0.5, ch + 0.5);
      }
    }

    // Boundary strokes: darken cells adjacent to a verdict change.
    ctx.fillStyle = isDark ? "rgba(2,6,23,0.55)" : "rgba(15,23,42,0.45)";
    for (let j = 0; j < map.height; j++) {
      for (let i = 0; i < map.width; i++) {
        const c = cellAt(map, i, j);
        const r = i + 1 < map.width ? cellAt(map, i + 1, j) : c;
        const d = j + 1 < map.height ? cellAt(map, i, j + 1) : c;
        if (r !== c) ctx.fillRect(padL + (i + 1) * cw - 1, padT + j * ch, 2, ch + 0.5);
        if (d !== c) ctx.fillRect(padL + i * cw, padT + (j + 1) * ch - 1, cw + 0.5, 2);
      }
    }

    // Axis labels: log ticks
    ctx.fillStyle = isDark ? "#64748b" : "#475569";
    ctx.font = "10px ui-monospace, monospace";
    const decadesX = Math.round(Math.log10(map.xMax / map.xMin));
    const showEveryX = Math.max(1, Math.ceil(decadesX / 5));
    for (let d = 0; d <= decadesX; d += showEveryX) {
      const v = map.xMin * Math.pow(10, d);
      const fx = Math.log(v / map.xMin) / Math.log(map.xMax / map.xMin);
      ctx.fillText(fmtTick(v), padL + fx * gw - 10, H - 10);
    }
    const decadesY = Math.round(Math.log10(map.yMax / map.yMin));
    const showEveryY = Math.max(1, Math.ceil(decadesY / 4));
    for (let d = 0; d <= decadesY; d += showEveryY) {
      const v = map.yMin * Math.pow(10, d);
      const fy = 1 - Math.log(v / map.yMin) / Math.log(map.yMax / map.yMin);
      ctx.fillText(fmtTick(v), 6, padT + fy * gh + 3);
    }
    ctx.fillStyle = isDark ? "#94a3b8" : "#334155";
    ctx.font = "10px sans-serif";
    ctx.fillText(map.xLabel, padL + gw - ctx.measureText(map.xLabel).width, H - 22);
    ctx.save();
    ctx.translate(14, padT + 30);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(map.yLabel, 0, 0);
    ctx.restore();
  }, [map, isDark]);

  return (
    <canvas
      ref={ref}
      width={560}
      height={320}
      className="w-full rounded-lg border dark-mode:border-slate-700 light-mode:border-slate-300 coffee-mode:border-slate-700"
    />
  );
}

function fmtTick(v: number): string {
  if (v >= 1e5 || v < 1e-2) return v.toExponential(0).replace("e+", "e");
  return v >= 100 ? v.toFixed(0) : v >= 1 ? v.toFixed(0) : v.toExponential(0);
}

export default function BoundaryAtlasPanel() {
  const atlases = useMemo(() => allAtlases(), []);

  return (
    <div className="space-y-6">
      <PlainExplainer title="The Boundary Atlas — where the verdicts flip">
        <p>
          The permutation sweeps found the surprises as points; these maps
          turn them into terrain. Each one is a two-dimensional slice
          through one engine, computed live from the same tested functions
          as every panel — the atlas cannot disagree with the app because
          it <em>is</em> the app. Dark lines are verdict boundaries: cross
          one and the conclusion you'd write down changes.
        </p>
        <p className="mt-2 dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400">
          <span className="font-semibold dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-slate-200">How to read them honestly:</span>{" "}
          the maps show where the <em>app's</em> classifications flip —
          sensitivity terrain, not truth claims. A claim sitting in "excess"
          territory means the budget can't explain it, never that it's real;
          a claim in the sub-thermal region means no instrument made of
          atoms at that temperature could arbitrate it at all.
        </p>
      </PlainExplainer>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {atlases.map((m) => (
          <Panel key={m.key} title={m.title}>
            <AtlasCanvas map={m} />
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
              {m.legend.map((l) => (
                <span
                  key={l.code}
                  className="text-[10px] dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-amber-700 flex items-center gap-1.5"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-sm inline-block"
                    style={{ backgroundColor: l.color }}
                  />
                  {l.label}
                </span>
              ))}
            </div>
            <p className="text-[10px] dark-mode:text-slate-500 light-mode:text-slate-500 coffee-mode:text-amber-700 mt-2 leading-relaxed italic">
              Both axes logarithmic. {m.fixed}
            </p>
          </Panel>
        ))}
      </div>

      <Panel title="Why this exists">
        <p className="text-xs leading-relaxed dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-amber-700">
          The sweeps that drew these maps are the same ones that found the
          double-counted thermal channel and the material-breaking
          plausibility corner — and they run again in CI on every push. The
          atlas is their permanent form: the app's honesty terrain, so that
          "the verdict flipped" stops being a surprise and becomes a line
          you can point at. Where the lines are dense, claims are fragile;
          where regions are wide, conclusions are robust. That is the whole
          difference between a number and a finding.
        </p>
      </Panel>
    </div>
  );
}
