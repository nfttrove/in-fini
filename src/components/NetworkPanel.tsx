import { useCallback, useEffect, useRef, useState } from "react";
import { Globe2, Play, Upload } from "lucide-react";
import Panel from "./ui/Panel";
import Skeleton from "./ui/Skeleton";
import PlainExplainer from "./ui/PlainExplainer";
import MetricCard from "./ui/MetricCard";
import {
  parseSeries,
  analyzeSeries,
  SeriesAnalysis,
} from "../utils/residuals";
import {
  fleetStats,
  collectiveBoundStatement,
  FleetStats,
} from "../utils/networkCensus";
import {
  NetworkRun,
  fileNetworkRun,
  listNetworkRuns,
  supabaseConfigured,
} from "../lib/supabase";

const M_S2_TO_MILLIG = 1000 / 9.80665;
const RECORD_SECONDS = 60;

type Capture = { t: number[]; y: number[] };

interface Profile {
  sampleRateHz: number;
  durationS: number;
  noiseRms: number; // milli-g
  topPeakHz: number;
  topPeakG: number;
  mainsHz: 0 | 50 | 60;
  label: string;
}

function analysisToProfile(a: SeriesAnalysis, label: string): Profile {
  const peak = a.topPeaks[0];
  return {
    sampleRateHz: a.sampleRateHz,
    durationS: a.durationS,
    noiseRms: a.residualRms * M_S2_TO_MILLIG,
    topPeakHz: peak ? peak.freqHz : 0,
    topPeakG: peak ? peak.magnitude * M_S2_TO_MILLIG : 0,
    mainsHz: a.mainsFraction > 0.15 ? (a.mainsHz as 50 | 60) : 0,
    label,
  };
}

export default function NetworkPanel() {
  const [recording, setRecording] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RECORD_SECONDS);
  const [capture, setCapture] = useState<Capture | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [csvText, setCsvText] = useState("");
  const [deviceLabel, setDeviceLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filed, setFiled] = useState<string | null>(null);
  const [fleet, setFleet] = useState<NetworkRun[]>([]);
  const [fleetLoading, setFleetLoading] = useState(true);

  const samplesRef = useRef<Capture>({ t: [], y: [] });
  const stopRef = useRef<(() => void) | null>(null);

  const refresh = useCallback(async () => {
    if (!supabaseConfigured) {
      setFleetLoading(false);
      return;
    }
    try {
      setFleet(await listNetworkRuns());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setFleetLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function startRecording() {
    setError(null);
    setProfile(null);
    setFiled(null);
    setCapture(null);

    const dm = typeof window !== "undefined" ? (window as unknown as { DeviceMotionEvent?: { requestPermission?: () => Promise<string> } }).DeviceMotionEvent : undefined;
    if (!dm) {
      setError("This device/browser exposes no motion sensors. Use the CSV fallback below (any accelerometer app, or a load-cell rig).");
      return;
    }
    if (typeof dm.requestPermission === "function") {
      try {
        const verdict = await dm.requestPermission();
        if (verdict !== "granted") {
          setError("Motion permission denied. Allow motion access or use the CSV fallback.");
          return;
        }
      } catch {
        setError("Motion permission could not be requested. Use the CSV fallback.");
        return;
      }
    }

    samplesRef.current = { t: [], y: [] };
    const t0 = performance.now();

    const handler = (ev: DeviceMotionEvent) => {
      // Vertical axis; prefer gravity-free acceleration when provided.
      let aY = ev.acceleration?.y ?? null;
      if (aY === null || !isFinite(aY)) {
        const inc = ev.accelerationIncludingGravity?.y;
        aY = typeof inc === "number" && isFinite(inc) ? inc - 9.81 : null;
      }
      if (aY !== null) {
        samplesRef.current.t.push((performance.now() - t0) / 1000);
        samplesRef.current.y.push(aY * M_S2_TO_MILLIG);
      }
    };
    window.addEventListener("devicemotion", handler);

    setRecording(true);
    setSecondsLeft(RECORD_SECONDS);
    const tick = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    const finish = setTimeout(() => {
      window.removeEventListener("devicemotion", handler);
      clearInterval(tick);
      setRecording(false);
      const cap = samplesRef.current;
      setCapture({ t: [...cap.t], y: [...cap.y] });
    }, RECORD_SECONDS * 1000);
    stopRef.current = () => {
      clearTimeout(finish);
      clearInterval(tick);
      window.removeEventListener("devicemotion", handler);
      setRecording(false);
    };
  }

  useEffect(() => {
    if (capture && capture.t.length >= 32) {
      const a = analyzeSeries(capture.t, capture.y, { mainsHz: 50, topPeaks: 3 });
      setProfile(analysisToProfile(a, deviceLabel || "phone"));
    } else if (capture) {
      setError(`Only ${capture.t.length} samples captured — sensors look inactive. Try the CSV fallback.`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capture]);

  function analyzeCsv() {
    setError(null);
    const parsed = parseSeries(csvText);
    if (parsed.t.length < 32) {
      setError(`Only ${parsed.t.length} usable rows — need at least 32.`);
      return;
    }
    const a = analyzeSeries(parsed.t, parsed.y, { mainsHz: 50, topPeaks: 3 });
    setProfile(analysisToProfile(a, deviceLabel || "csv rig"));
  }

  async function file() {
    if (!profile) return;
    try {
      setBusy(true);
      setError(null);
      const run = await fileNetworkRun({
        device_label: (deviceLabel || profile.label).slice(0, 40),
        source: capture ? "phone-accelerometer" : "csv-paste",
        sample_rate_hz: profile.sampleRateHz,
        duration_s: profile.durationS,
        noise_rms: profile.noiseRms,
        top_peak_hz: profile.topPeakHz,
        top_peak_g: profile.topPeakG,
        mains_hz: profile.mainsHz,
      });
      setFiled(`Filed run ${run.id.slice(0, 8)}… into the census. You are now part of the floor.`);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const stats: FleetStats | null = fleet ? fleetStats(fleet.map((r) => ({ noise_rms: r.noise_rms, mains_hz: r.mains_hz }))) : null;
  const percentile = stats && profile && stats.n > 0 ? stats.percentileOf(profile.noiseRms) : null;

  return (
    <div className="space-y-6">
      <PlainExplainer title="The Replication Network — Calibration Census 001">
        <p>
          Before a crowd can test an extraordinary claim, it has to know its
          own eyes. This campaign is pure calibration: put your phone flat on
          the table you'd use for an experiment, record 60 seconds of its
          accelerometer, and file what your corner of the physical world
          sounds like — noise floor, mains hum, the loudest vibration line.
        </p>
        <p className="mt-2 dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400">
          <span className="font-semibold dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-slate-200">Why it matters:</span>{" "}
          N independent rigs pooled together can in principle reach a noise
          floor of median/√N. Once the census is populated, that number is
          the honest detection limit of this fleet — the floor under every
          future replication round. No location is collected, ever.
        </p>
      </PlainExplainer>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Panel title="1 · Record your environment">
          <ol className="text-xs dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-amber-700 space-y-1.5 mb-4 list-decimal pl-4">
            <li>Place the phone flat on the experiment table. Don't touch it.</li>
            <li>Press Record and let it run the full 60 seconds.</li>
            <li>Check the profile it extracts, give your rig a label, file it.</li>
          </ol>
          <button
            onClick={startRecording}
            disabled={recording}
            className={`w-full rounded-lg px-3 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
              recording
                ? "bg-red-600 text-white"
                : "bg-cyan-600 hover:bg-cyan-700 text-white"
            }`}
          >
            <Play className="w-4 h-4" />
            {recording ? `Recording… ${Math.max(secondsLeft, 0)}s — hands off` : "Record 60 seconds"}
          </button>

          <div className="mt-4">
            <label className="block text-sm dark-mode:text-slate-400 light-mode:text-slate-700 coffee-mode:text-amber-700 mb-1.5">
              Rig label (optional, ≤ 40 chars)
            </label>
            <input
              type="text"
              value={deviceLabel}
              onChange={(e) => setDeviceLabel(e.target.value)}
              placeholder='e.g. "school lab, 2nd floor"'
              maxLength={40}
              className="w-full dark-mode:bg-slate-900 light-mode:bg-slate-100 coffee-mode:bg-slate-900 dark-mode:text-slate-100 light-mode:text-slate-900 coffee-mode:text-amber-100 rounded-lg px-3 py-2 text-sm border dark-mode:border-slate-700 light-mode:border-slate-300 coffee-mode:border-slate-700 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="mt-4 pt-4 border-t dark-mode:border-slate-700 light-mode:border-slate-300 coffee-mode:border-slate-700">
            <p className="text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-amber-600 mb-2 leading-relaxed">
              No motion sensors (desktop, or permission denied)? Paste any
              accelerometer/log CSV — time,value — from any app or a
              load-cell rig. Same analysis, same fleet.
            </p>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder={"0.000,0.031\n0.017,0.028\n..."}
              rows={3}
              className="w-full dark-mode:bg-slate-900 light-mode:bg-slate-100 coffee-mode:bg-slate-900 dark-mode:text-slate-100 light-mode:text-slate-900 coffee-mode:text-amber-100 font-mono text-xs rounded-lg px-3 py-2 border dark-mode:border-slate-700 light-mode:border-slate-300 coffee-mode:border-slate-700 focus:border-cyan-500 focus:outline-none"
            />
            <button
              onClick={analyzeCsv}
              disabled={csvText.trim().length === 0}
              className="mt-2 dark-mode:bg-slate-700 light-mode:bg-slate-200 coffee-mode:bg-slate-700 dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-amber-100 rounded-lg px-3 py-2 text-sm flex items-center gap-1.5 disabled:opacity-40 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Analyze pasted data
            </button>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-900/20 rounded px-3 py-2 mt-3">{error}</p>
          )}
          {filed && (
            <p className="text-xs text-emerald-300 bg-emerald-900/20 rounded px-3 py-2 mt-3">{filed}</p>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel title="2 · Your rig's profile">
            {profile ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <MetricCard
                    label="Noise floor (residual RMS)"
                    value={`${profile.noiseRms.toExponential(2)} mΔg`}
                    sub="after drift + mains removal"
                  />
                  <MetricCard
                    label="Loudest line"
                    value={profile.topPeakHz > 0 ? `${profile.topPeakHz.toFixed(1)} Hz` : "none"}
                    sub={profile.topPeakHz > 0 ? `${profile.topPeakG.toExponential(1)} mΔg amplitude` : "quiet trace"}
                  />
                  <MetricCard
                    label="Sampling"
                    value={`${profile.sampleRateHz.toFixed(0)} Hz`}
                    sub={`${profile.durationS.toFixed(0)} s captured`}
                  />
                  <MetricCard
                    label="Mains family"
                    value={profile.mainsHz > 0 ? `${profile.mainsHz} Hz` : "not detected"}
                    sub={profile.mainsHz > 0 ? "pickup confirmed" : "no significant mains"}
                  />
                </div>
                {percentile !== null && stats && stats.n > 0 && (
                  <p className="text-xs dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-amber-700 mt-3">
                    Quieter than {(percentile * 100).toFixed(0)}% of the fleet
                    {percentile > 0.5 ? " — your table is one of the calm ones; the fleet wants your floor." : " — a noisy corner; every rig counts anyway (√N does not care)."}
                  </p>
                )}
                <button
                  onClick={file}
                  disabled={busy || !supabaseConfigured}
                  className="mt-4 w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-40 text-white rounded-lg px-3 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Globe2 className="w-4 h-4" />
                  File into the census
                </button>
                {!supabaseConfigured && (
                  <p className="text-xs text-red-400 bg-red-900/20 rounded px-3 py-2 mt-2">
                    Cloud census unavailable (Supabase not configured) — your
                    profile still computes locally.
                  </p>
                )}
              </>
            ) : (
              <p className="text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-slate-500 italic">
                Record (or paste) data to see your profile.
              </p>
            )}
          </Panel>

          <Panel title="3 · The fleet">
            {fleetLoading && fleet.length === 0 && supabaseConfigured ? (
              <Skeleton rows={4} />
            ) : stats && stats.n > 0 ? (
              <>
                <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4 mb-4">
                  <div className="text-xs dark-mode:text-cyan-200 light-mode:text-cyan-900 coffee-mode:text-cyan-200 leading-relaxed">
                    {collectiveBoundStatement(stats)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <MetricCard label="Rigs filed" value={String(stats.n)} sub="independent census runs" />
                  <MetricCard
                    label="Collective floor"
                    value={stats.n >= 5 ? `${stats.collectiveFloor.toExponential(1)} mΔg` : "—"}
                    sub={stats.n >= 5 ? "median / √N" : "needs ≥ 5 rigs"}
                  />
                  <MetricCard label="Quietest rig" value={`${stats.quietestNoise.toExponential(1)} mΔg`} />
                  <MetricCard label="Median rig" value={`${stats.medianNoise.toExponential(1)} mΔg`} />
                </div>
                <div className="text-xs dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-amber-700">
                  Mains split: {stats.mains50} × 50 Hz · {stats.mains60} × 60 Hz
                  {stats.mainsNone > 0 ? ` · ${stats.mainsNone} clean` : ""}
                </div>
              </>
            ) : (
              <p className="text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-slate-500 italic">
                {supabaseConfigured
                  ? "No census runs filed yet. The first 60 seconds are yours."
                  : "Fleet view needs the configured backend."}
              </p>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
