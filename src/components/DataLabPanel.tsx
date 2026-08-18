import { useEffect, useMemo, useRef, useState } from "react";
import { FlaskConical, Play, Shuffle } from "lucide-react";
import Panel from "./ui/Panel";
import PlainExplainer from "./ui/PlainExplainer";
import MetricCard from "./ui/MetricCard";
import Slider from "./ui/Slider";
import { useTheme } from "../contexts/theme-context";
import {
  parseSeries,
  analyzeSeries,
  makeChallenge,
  seededRandom,
  SeriesAnalysis,
} from "../utils/residuals";

// ---------------------------------------------------------------------------
// Spectrum canvas (linear axis, mains family marked)
// ---------------------------------------------------------------------------

function SpectrumCanvas({
  analysis,
  viewHz,
}: {
  analysis: SeriesAnalysis;
  viewHz: number;
}) {
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
    const bg = isDark ? "#0f172a" : "#f8fafc";
    const fg = isDark ? "#e2e8f0" : "#1e293b";
    const grid = isDark ? "#1e3a5f" : "#dbe3ee";
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const pad = { l: 44, r: 12, t: 14, b: 26 };
    const rect = { x: pad.l, y: pad.t, w: W - pad.l - pad.r, h: H - pad.t - pad.b };

    // grid
    ctx.strokeStyle = grid;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = rect.y + (rect.h * i) / 4;
      ctx.beginPath();
      ctx.moveTo(rect.x, y);
      ctx.lineTo(rect.x + rect.w, y);
      ctx.stroke();
    }
    for (let i = 0; i <= 5; i++) {
      const x = rect.x + (rect.w * i) / 5;
      ctx.beginPath();
      ctx.moveTo(x, rect.y);
      ctx.lineTo(x, rect.y + rect.h);
      ctx.stroke();
    }

    const { spectrumFreqHz: f, spectrumMag: m } = analysis;
    const maxIdx = Math.min(
      m.length - 1,
      Math.max(1, Math.floor((viewHz / (f[f.length - 1] || 1)) * (m.length - 1)))
    );
    let peak = 1e-12;
    for (let k = 1; k <= maxIdx; k++) peak = Math.max(peak, m[k]);

    // mains family bands (red)
    ctx.fillStyle = "rgba(239, 68, 68, 0.14)";
    for (let h = 1; analysis.mainsHz * h <= viewHz; h++) {
      const fm = analysis.mainsHz * h;
      const x1 = rect.x + (fm / viewHz) * rect.w - 2;
      ctx.fillRect(Math.max(rect.x, x1 - 6), rect.y, 14, rect.h);
    }

    // spectrum polyline
    ctx.strokeStyle = isDark ? "#22d3ee" : "#0891b2";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let k = 1; k <= maxIdx; k++) {
      const x = rect.x + (f[k] / viewHz) * rect.w;
      const y = rect.y + rect.h - (m[k] / peak) * rect.h;
      if (k === 1) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // axis labels
    ctx.fillStyle = isDark ? "#64748b" : "#64748b";
    ctx.font = "10px ui-monospace, monospace";
    for (let i = 0; i <= 5; i++) {
      const fq = (viewHz * i) / 5;
      const x = rect.x + (rect.w * i) / 5;
      ctx.fillText(fq >= 1000 ? `${fq / 1000}k` : `${fq}`, x - 8, H - 8);
    }
    ctx.fillText("Hz", rect.x + rect.w - 12, H - 8);
    ctx.save();
    ctx.translate(12, rect.y + rect.h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = fg;
    ctx.fillText("|amplitude|", -34, 0);
    ctx.restore();
  }, [analysis, viewHz, isDark]);

  return (
    <canvas
      ref={ref}
      width={640}
      height={240}
      className="w-full rounded-lg border dark-mode:border-slate-700 light-mode:border-slate-300 coffee-mode:border-slate-700"
    />
  );
}

// ---------------------------------------------------------------------------
// The panel
// ---------------------------------------------------------------------------

type LabMode = "analyze" | "challenge";

function sampleTrace(): string {
  const rnd = seededRandom(2026);
  const lines: string[] = ["time_s,balance_g"];
  for (let i = 0; i < 20000; i++) {
    const time = i / 1000;
    let v = 10 + 0.002 * time + 0.35 * Math.sin(2 * Math.PI * 50 * time);
    v += 0.15 * Math.sin(2 * Math.PI * 23 * time) + (rnd() - 0.5) * 0.04;
    lines.push(`${time.toFixed(4)},${v.toFixed(5)}`);
  }
  return lines.join("\n");
}

export default function DataLabPanel() {
  const [mode, setMode] = useState<LabMode>("analyze");
  const [text, setText] = useState("");
  const [mainsHz, setMainsHz] = useState<50 | 60>(50);
  const [viewHz, setViewHz] = useState(100);
  const [analysis, setAnalysis] = useState<SeriesAnalysis | null>(null);
  const [parseNote, setParseNote] = useState<string | null>(null);

  function run() {
    const parsed = parseSeries(text);
    if (parsed.t.length < 16) {
      setParseNote(
        `Only ${parsed.t.length} usable rows found (need ≥ 16). Paste two columns: time, value.`
      );
      setAnalysis(null);
      return;
    }
    setParseNote(
      `Parsed ${parsed.t.length} rows` +
        (parsed.skipped > 0 ? `, skipped ${parsed.skipped} junk/header rows.` : ".")
    );
    setAnalysis(analyzeSeries(parsed.t, parsed.y, { mainsHz }));
  }

  // ---- challenge state ----
  const [challenge, setChallenge] = useState(() => makeChallenge(1));
  const [guess, setGuess] = useState<null | boolean>(null);
  const [score, setScore] = useState({ rounds: 0, correct: 0 });

  const challengeAnalysis = useMemo(
    () =>
      analyzeSeries(challenge.t, challenge.y, { mainsHz: 50, topPeaks: 3 }),
    [challenge]
  );

  function newRound() {
    setChallenge(makeChallenge(Math.floor(Math.random() * 100000) + 1));
    setGuess(null);
  }

  function answer(saysAnomaly: boolean) {
    if (guess !== null) return;
    setGuess(saysAnomaly);
    setScore((s) => ({
      rounds: s.rounds + 1,
      correct: s.correct + (saysAnomaly === challenge.hasAnomaly ? 1 : 0),
    }));
  }

  return (
    <div className="space-y-6">
      <PlainExplainer title="Bring your own data — the honest anomaly hunt">
        <p>
          Every extraordinary claim starts life as a wiggly line: a balance
          reading, a power trace. This lab runs the pipeline a real analyst
          would: strip the linear drift (thermal settling), pull out mains
          pickup at 50/60 Hz and its harmonics, find the strongest remaining
          peaks, and report what the residual actually is. The spectrum is
          drawn for <em>you</em> to judge — the tool labels, you conclude.
        </p>
        <p className="mt-2 dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400">
          <span className="font-semibold dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-slate-200">Then test yourself:</span>{" "}
          the Challenge mode feeds you synthetic traces — some carrying a
          hidden anomaly, some pure artifact soup — and scores your blind
          calls. That skill, not any slider, is where discoveries come from.
        </p>
      </PlainExplainer>

      <div className="flex flex-wrap gap-2">
        {(["analyze", "challenge"] as LabMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            aria-pressed={mode === m}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === m
                ? "bg-cyan-600 text-white"
                : "dark-mode:bg-slate-700 light-mode:bg-slate-200 coffee-mode:bg-slate-700 dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-amber-100"
            }`}
          >
            {m === "analyze" ? "Analyze my data" : "Artifact or anomaly? (game)"}
          </button>
        ))}
      </div>

      {mode === "analyze" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Panel title="1 · Paste your time series">
            <p className="text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-amber-600 mb-3 leading-relaxed">
              Two columns — time, value — in CSV, TSV, spaces or semicolons.
              Header lines and junk rows are skipped and counted. Everything
              stays in your browser; nothing is uploaded.
            </p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={"0.0000,10.02341\n0.0010,10.02398\n..."}
              rows={10}
              className="w-full dark-mode:bg-slate-900 light-mode:bg-slate-100 coffee-mode:bg-slate-900 dark-mode:text-slate-100 light-mode:text-slate-900 coffee-mode:text-amber-100 font-mono text-xs rounded-lg px-3 py-2 border dark-mode:border-slate-700 light-mode:border-slate-300 coffee-mode:border-slate-700 focus:border-cyan-500 focus:outline-none"
            />
            <div className="flex flex-wrap gap-2 items-center mt-3">
              <button
                onClick={run}
                disabled={text.trim().length === 0}
                className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-40 text-white rounded-lg px-3 py-2 text-sm font-medium flex items-center gap-1.5 transition-colors"
              >
                <Play className="w-4 h-4" />
                Analyze
              </button>
              <button
                onClick={() => {
                  setText(sampleTrace());
                }}
                className="dark-mode:bg-slate-700 light-mode:bg-slate-200 coffee-mode:bg-slate-700 dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-amber-100 rounded-lg px-3 py-2 text-sm flex items-center gap-1.5 transition-colors"
              >
                <FlaskConical className="w-4 h-4" />
                Load example trace
              </button>
              <span className="text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-amber-600">
                mains:
              </span>
              {([50, 60] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setMainsHz(f)}
                  aria-pressed={mainsHz === f}
                  className={`px-2.5 py-1 rounded text-xs font-mono ${
                    mainsHz === f
                      ? "bg-amber-600 text-white"
                      : "dark-mode:bg-slate-700 light-mode:bg-slate-200 coffee-mode:bg-slate-700"
                  }`}
                >
                  {f} Hz
                </button>
              ))}
            </div>
            {parseNote && (
              <p className="text-xs dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-amber-700 mt-3">
                {parseNote}
              </p>
            )}
          </Panel>

          <div className="space-y-6">
            {analysis ? (
              <>
                <Panel title="2 · What your trace is made of">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <MetricCard
                      label="Sampling"
                      value={`${analysis.sampleRateHz.toFixed(1)} Hz`}
                      sub={`${analysis.n} rows, ${analysis.durationS.toFixed(1)} s`}
                    />
                    <MetricCard
                      label="Linear drift"
                      value={`${analysis.driftSlopePerMin.toFixed(3)}/min`}
                      sub={`${(analysis.driftFraction * 100).toFixed(0)}% of raw spread`}
                    />
                    <MetricCard
                      label={`Mains family (${analysis.mainsHz} Hz)`}
                      value={`${(analysis.mainsFraction * 100).toFixed(1)}%`}
                      sub={
                        analysis.harmonicsFound.length
                          ? `harmonics: ${analysis.harmonicsFound.join(", ")}`
                          : "fundamental only"
                      }
                      color={
                        analysis.mainsFraction > 0.3
                          ? "dark-mode:text-red-400 light-mode:text-red-600 coffee-mode:text-red-400"
                          : undefined
                      }
                    />
                    <MetricCard
                      label="Residual RMS (after drift + mains)"
                      value={analysis.residualRms.toExponential(2)}
                      sub={`raw spread was ${analysis.rawRms.toExponential(2)}`}
                      color="dark-mode:text-amber-400 light-mode:text-amber-600 coffee-mode:text-amber-400"
                    />
                  </div>
                  <div className="text-xs dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-amber-700 leading-relaxed">
                    {analysis.topPeaks.length > 0 ? (
                      <>
                        Strongest non-mains peaks:{" "}
                        {analysis.topPeaks
                          .map((p) => `${p.freqHz.toFixed(2)} Hz`)
                          .join(", ")}
                        . Identify them physically (pump vibration? a fan?
                        your signal?) before calling anything anomalous.
                      </>
                    ) : (
                      "No significant non-mains structure — a quiet trace."
                    )}
                  </div>
                </Panel>

                <Panel title="3 · Amplitude spectrum (your call, not the tool's)">
                  <SpectrumCanvas analysis={analysis} viewHz={viewHz} />
                  <div className="mt-3">
                    <Slider
                      label="View range"
                      value={viewHz}
                      displayValue={`0 – ${viewHz} Hz`}
                      min={20}
                      max={Math.max(100, Math.min(1000, analysis.sampleRateHz / 2))}
                      step={10}
                      onChange={setViewHz}
                      minLabel="zoom"
                      maxLabel="wide"
                    />
                  </div>
                  <p className="text-[10px] dark-mode:text-slate-500 light-mode:text-slate-500 coffee-mode:text-amber-700 mt-2">
                    Red bands mark the mains family (fundamental + harmonics
                    up to 5th). Everything else is yours to explain.
                  </p>
                </Panel>
              </>
            ) : (
              <Panel title="2 · Results appear here">
                <p className="text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-slate-500 italic">
                  Paste data (or load the example) and press Analyze.
                </p>
              </Panel>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Panel title="This round's trace">
            <p className="text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-amber-600 mb-3 leading-relaxed">
              A synthetic 60-second balance trace: drift, mains, vibration,
              noise — and possibly a hidden anomalous step at the midpoint.
              Read the spectrum, then call it.
            </p>
            <SpectrumCanvas analysis={challengeAnalysis} viewHz={100} />
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => answer(false)}
                disabled={guess !== null}
                className="bg-slate-600 hover:bg-slate-700 disabled:opacity-40 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              >
                Artifacts only
              </button>
              <button
                onClick={() => answer(true)}
                disabled={guess !== null}
                className="bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              >
                Anomaly present
              </button>
              <button
                onClick={newRound}
                className="dark-mode:bg-slate-700 light-mode:bg-slate-200 coffee-mode:bg-slate-700 dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-amber-100 rounded-lg px-4 py-2 text-sm flex items-center gap-1.5 transition-colors"
              >
                <Shuffle className="w-4 h-4" />
                Next round
              </button>
              <span className="ml-auto text-xs font-mono dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-amber-700 self-center">
                score {score.correct}/{score.rounds}
              </span>
            </div>
          </Panel>

          <Panel title={guess === null ? "The truth (hidden until you call it)" : guess === challenge.hasAnomaly ? "Correct" : "Not this time"}>
            {guess === null ? (
              <p className="text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-slate-500 italic">
                No peeking. Look for: a step at the midpoint (compare the
                halves' means in the drift metric), a steady offset that
                drift cannot explain, or nothing but smooth artifact soup.
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-sm dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-amber-100">
                  {challenge.hasAnomaly
                    ? "There WAS an anomaly: a step at the 30-second mark."
                    : "Pure artifact soup: drift + mains + vibration + noise. No anomaly."}
                </p>
                <p className="text-xs dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-amber-700">
                  True composition: {challenge.composition.join(" · ")}
                </p>
                <p className="text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-amber-700 italic">
                  This is the skill the whole app exists to train: an
                  anomaly is what survives the budget — not what excites you
                  at first glance.
                </p>
              </div>
            )}
          </Panel>
        </div>
      )}
    </div>
  );
}
