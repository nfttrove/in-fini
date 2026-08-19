import { useCallback, useEffect, useMemo, useState } from "react";
import { BookmarkCheck, FileText, Gavel, RefreshCw, Send } from "lucide-react";
import Panel from "./ui/Panel";
import Skeleton from "./ui/Skeleton";
import PlainExplainer from "./ui/PlainExplainer";
import Slider from "./ui/Slider";
import MetricCard from "./ui/MetricCard";
import { LeakageParams, computeBudget } from "../utils/leakage";
import { ThrustParams, computeThrustBudget } from "../utils/thrustLeakage";
import { formatPower } from "../utils/device";
import { formatForce } from "../utils/physics";
import {
  ClaimEntry,
  Preregistration,
  claimHash,
  fileClaim,
  listClaims,
  listPreregistrations,
  savePreregistration,
  supabaseConfigured,
} from "../lib/supabase";

type ClaimType = "power" | "thrust";

const POWER_DEFAULTS: LeakageParams = {
  pClaimW: 1.3,
  vDriveV: 10,
  rDriveOhm: 50,
  shieldDb: 40,
  iBiasA: 0.1,
  rResOhm: 0.1,
  tHotK: 350,
  tColdK: 300,
  aRadM2: 1e-4,
  emissivity: 0.9,
  rotorMassKg: 1e-9,
  rotorAmpNm: 1,
  fmHz: 5e5,
  mechQ: 1e4,
};

const THRUST_DEFAULTS: ThrustParams = {
  claimedDeltaG: 0.1,
  driveVoltageV: 10000,
  ambientPressurePa: 101325,
  electrodeGapM: 0.01,
  deviceMassKg: 0.1,
  vibrationAmpNm: 100,
  vibrationFreqHz: 100,
  tempGradientKPerM: 2,
  deviceHeightM: 0.1,
  plateAreaM2: 0.01,
  electrostaticFieldVPerM: 10000,
  cavityGap_nm: 50,
  rotorRadius_um: 0.05,
  modulationDepth_beta: 0.3,
  cavityQ: 10000,
  activeArea_cm2: 1,
  driveFrequency_Hz: 500000,
};

const VERDICT_TONE: Record<string, string> = {
  emerald: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  amber: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  orange: "border-orange-500/40 bg-orange-500/10 text-orange-300",
  red: "border-red-500/40 bg-red-500/10 text-red-300",
  sky: "border-sky-500/40 bg-sky-500/10 text-sky-300",
};

export default function ClaimRegistryPanel() {
  const [claimType, setClaimType] = useState<ClaimType>("power");
  const [title, setTitle] = useState("");
  const [power, setPower] = useState(POWER_DEFAULTS);
  const [thrust, setThrust] = useState(THRUST_DEFAULTS);
  const [claims, setClaims] = useState<ClaimEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filed, setFiled] = useState<string | null>(null);

  const powerBudget = useMemo(() => computeBudget(power), [power]);
  const thrustBudget = useMemo(() => computeThrustBudget(thrust), [thrust]);

  const budget =
    claimType === "power"
      ? {
          claimed: power.pClaimW,
          unit: "W",
          format: (w: number) => formatPower(w),
          leakage: powerBudget.totalLeakageW,
          residual: powerBudget.residualW,
          residualFrac: powerBudget.residualFrac,
          sigma: powerBudget.sigmaW,
          sigmaAssessment: powerBudget.sigmaAssessment,
          verdictKey: powerBudget.verdict.key,
          verdictLabel: powerBudget.verdict.label,
          verdictDescription: powerBudget.verdict.description,
          verdictTone: powerBudget.verdict.tone,
          params: power as unknown as Record<string, number>,
        }
      : {
          claimed: thrust.claimedDeltaG,
          unit: "Δg",
          format: (g: number) => `${g.toExponential(2)} Δg (${formatForce(g * 9.80665)})`,
          leakage: thrustBudget.totalLeakageG,
          residual: thrustBudget.residualG,
          residualFrac: thrustBudget.residualFrac,
          sigma: thrustBudget.sigmaG,
          sigmaAssessment: thrustBudget.sigmaAssessment,
          verdictKey: thrustBudget.verdict.key,
          verdictLabel: thrustBudget.verdict.label,
          verdictDescription: thrustBudget.verdict.description,
          verdictTone: thrustBudget.verdict.tone,
          params: thrust as unknown as Record<string, number>,
        };

  const [preregs, setPreregs] = useState<Preregistration[]>([]);
  const [preregNote, setPreregNote] = useState<string | null>(null);
  const [matchedClaimIds, setMatchedClaimIds] = useState<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    if (!supabaseConfigured) return;
    try {
      setBusy(true);
      setError(null);
      const [claimList, preregList] = await Promise.all([
        listClaims(),
        listPreregistrations(),
      ]);
      setClaims(claimList);
      setPreregs(preregList);
      // Match filed claims to pre-registrations by canonical hash.
      const hashes = new Set(preregList.map((p) => p.param_hash));
      const matched = new Set<string>();
      for (const c of claimList) {
        const h = await claimHash(c.title, c.claim_type, c.claimed_value);
        if (hashes.has(h)) matched.add(c.id);
      }
      setMatchedClaimIds(matched);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleFile() {
    const trimmed = title.trim();
    if (trimmed.length < 3) {
      setError("Give the claim a title (at least 3 characters).");
      return;
    }
    try {
      setBusy(true);
      setError(null);
      const entry = await fileClaim({
        claim_type: claimType,
        title: trimmed.slice(0, 80),
        claimed_value: budget.claimed,
        claimed_unit: budget.unit,
        verdict_key: budget.verdictKey,
        verdict_label: budget.verdictLabel,
        residual_fraction: Number.isFinite(budget.residualFrac)
          ? budget.residualFrac
          : 1e9,
        params: budget.params,
      });
      // Does this filing match a prior pre-registration?
      const h = await claimHash(entry.title, entry.claim_type, entry.claimed_value);
      const wasPreregistered = preregs.some((p) => p.param_hash === h);
      setFiled(
        wasPreregistered
          ? `Filed "${entry.title}" — verdict: ${entry.verdict_label}. Matches a prior pre-registration ✓`
          : `Filed "${entry.title}" — verdict: ${entry.verdict_label}. (No matching pre-registration: nobody predicted this in advance.)`
      );
      setTitle("");
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handlePreregister() {
    const trimmed = title.trim();
    if (trimmed.length < 3) {
      setError("Give the claim a title first (at least 3 characters).");
      return;
    }
    try {
      setBusy(true);
      setError(null);
      setPreregNote(null);
      const h = await claimHash(trimmed.slice(0, 80), claimType, budget.claimed);
      await savePreregistration({
        claim_type: claimType,
        title: trimmed.slice(0, 80),
        claimed_value: budget.claimed,
        claimed_unit: budget.unit,
        param_hash: h,
        params: budget.params,
      });
      setPreregNote(
        `Pre-registered "${trimmed.slice(0, 80)}" (${budget.claimed.toPrecision(6)} ${budget.unit}). This prediction is now timestamped and public — file the real result after the experiment, and the registry will mark the match.`
      );
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <PlainExplainer title="File a claim. Get a budget. Join the record.">
        <p>
          The internet is full of extraordinary claims — over-unity generators,
          weight-loss thrusters — that never survive contact with a leakage
          budget. This registry makes that contact permanent: state the claim,
          state the setup, and the app files both together with the artifact
          budget it computes. Anyone can reproduce the verdict from the
          parameters. No budget, no mystery.
        </p>
        <p className="mt-2 dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400">
          The sliders below expose the channels that usually decide the
          verdict; the full 14/17-knob versions live in the two diagnostic
          tabs. Claims are public and cannot be deleted — file honestly.
        </p>
      </PlainExplainer>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Panel title="1 · State the claim">
          <div className="space-y-5">
            <div className="flex gap-2">
              {(["power", "thrust"] as ClaimType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setClaimType(t)}
                  aria-pressed={claimType === t}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    claimType === t
                      ? "bg-cyan-600 text-white"
                      : "dark-mode:bg-slate-700 light-mode:bg-slate-200 coffee-mode:bg-slate-700 dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-amber-100"
                  }`}
                >
                  {t === "power" ? "Power output (W)" : "Weight change (Δg)"}
                </button>
              ))}
            </div>

            {claimType === "power" ? (
              <>
                <Slider
                  label="Claimed output power"
                  value={power.pClaimW}
                  displayValue={formatPower(power.pClaimW)}
                  min={0.001}
                  max={10000}
                  step={0.001}
                  onChange={(v) => setPower({ ...power, pClaimW: v })}
                  minLabel="1 mW"
                  maxLabel="10 kW"
                />
                <Slider
                  label="Drive voltage (RF pickup)"
                  value={power.vDriveV}
                  displayValue={`${power.vDriveV.toFixed(1)} V`}
                  min={0}
                  max={1000}
                  step={1}
                  onChange={(v) => setPower({ ...power, vDriveV: v })}
                  minLabel="0 V"
                  maxLabel="1 kV"
                />
                <Slider
                  label="Bias current"
                  value={power.iBiasA}
                  displayValue={`${power.iBiasA.toFixed(2)} A`}
                  min={0}
                  max={5}
                  step={0.01}
                  onChange={(v) => setPower({ ...power, iBiasA: v })}
                  minLabel="0 A"
                  maxLabel="5 A"
                />
                <Slider
                  label="Hot-side temperature"
                  value={power.tHotK}
                  displayValue={`${power.tHotK.toFixed(0)} K`}
                  min={300}
                  max={1000}
                  step={1}
                  onChange={(v) => setPower({ ...power, tHotK: v })}
                  minLabel="300 K"
                  maxLabel="1000 K"
                />
              </>
            ) : (
              <>
                <Slider
                  label="Claimed weight change"
                  value={thrust.claimedDeltaG}
                  displayValue={`${thrust.claimedDeltaG.toExponential(2)} Δg`}
                  min={0.001}
                  max={100}
                  step={0.001}
                  onChange={(v) => setThrust({ ...thrust, claimedDeltaG: v })}
                  minLabel="0.001 Δg"
                  maxLabel="100 Δg"
                />
                <Slider
                  label="Drive voltage (ion wind)"
                  value={thrust.driveVoltageV}
                  displayValue={`${thrust.driveVoltageV.toFixed(0)} V`}
                  min={0}
                  max={50000}
                  step={100}
                  onChange={(v) => setThrust({ ...thrust, driveVoltageV: v })}
                  minLabel="0 V"
                  maxLabel="50 kV"
                />
                <Slider
                  label="Ambient pressure"
                  value={thrust.ambientPressurePa}
                  displayValue={`${(thrust.ambientPressurePa / 1000).toFixed(1)} kPa`}
                  min={0}
                  max={101325}
                  step={100}
                  onChange={(v) =>
                    setThrust({ ...thrust, ambientPressurePa: v })
                  }
                  minLabel="vacuum"
                  maxLabel="1 atm"
                />
                <Slider
                  label="Vibration amplitude"
                  value={thrust.vibrationAmpNm}
                  displayValue={`${thrust.vibrationAmpNm.toFixed(0)} nm`}
                  min={0}
                  max={5000}
                  step={10}
                  onChange={(v) => setThrust({ ...thrust, vibrationAmpNm: v })}
                  minLabel="0 nm"
                  maxLabel="5 µm"
                />
              </>
            )}

            <div>
              <label className="block text-sm dark-mode:text-slate-400 light-mode:text-slate-700 coffee-mode:text-amber-700 mb-2">
                Claim title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='e.g. "Desktop Casimir generator, 1.3 W"'
                maxLength={80}
                className="w-full dark-mode:bg-slate-900 light-mode:bg-slate-100 coffee-mode:bg-slate-900 dark-mode:text-slate-100 light-mode:text-slate-900 coffee-mode:text-amber-100 rounded-lg px-3 py-2 text-sm border dark-mode:border-slate-700 light-mode:border-slate-300 coffee-mode:border-slate-700 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <button
              onClick={handleFile}
              disabled={busy || !supabaseConfigured}
              className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:dark-mode:bg-slate-700 disabled:light-mode:bg-slate-300 disabled:coffee-mode:bg-slate-700 disabled:dark-mode:text-slate-500 text-white disabled:light-mode:text-slate-600 rounded-lg px-3 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" />
              File this claim in the public registry
            </button>

            <button
              onClick={handlePreregister}
              disabled={busy || !supabaseConfigured}
              className="w-full dark-mode:bg-slate-700 hover:dark-mode:bg-slate-600 light-mode:bg-slate-200 hover:light-mode:bg-slate-300 coffee-mode:bg-slate-700 hover:coffee-mode:bg-slate-600 disabled:opacity-40 dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-amber-100 rounded-lg px-3 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <BookmarkCheck className="w-4 h-4" />
              Pre-register this prediction (before you run the experiment)
            </button>

            {preregNote && (
              <p className="text-xs text-sky-300 bg-sky-900/20 rounded px-3 py-2 leading-relaxed">
                {preregNote}
              </p>
            )}

            {!supabaseConfigured && (
              <p className="text-xs text-red-400 bg-red-900/20 rounded px-3 py-2">
                Cloud registry is unavailable: Supabase is not configured. The
                budget below still computes locally.
              </p>
            )}
            {filed && (
              <p className="text-xs text-emerald-300 bg-emerald-900/20 rounded px-3 py-2">
                {filed}
              </p>
            )}
            {error && (
              <p className="text-xs text-red-400 bg-red-900/20 rounded px-3 py-2">
                {error}
              </p>
            )}
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title="2 · The budget's verdict">
            <div
              className={`rounded-xl border p-4 mb-4 ${VERDICT_TONE[budget.verdictTone] ?? VERDICT_TONE.amber}`}
            >
              <div className="font-semibold text-sm flex items-center gap-2">
                <Gavel className="w-4 h-4" />
                {budget.verdictLabel}
              </div>
              <p className="text-xs mt-1 leading-relaxed opacity-90">
                {budget.verdictDescription}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                label="Claimed"
                value={budget.format(budget.claimed)}
              />
              <MetricCard
                label="Explained by artifacts"
                value={budget.format(Math.max(budget.leakage, 0))}
                sub="summed mundane channels"
              />
              <MetricCard
                label="Unexplained residual ± σ"
                value={`${budget.format(Math.max(budget.residual, 0))} ± ${budget.format(budget.sigma)}`}
                sub="25% channel uncertainty, RSS"
                color="dark-mode:text-amber-400 light-mode:text-amber-600 coffee-mode:text-amber-400"
              />
              <MetricCard
                label="Reproducibility"
                value={`${Object.keys(budget.params).length} params`}
                sub="all filed with the claim"
              />
            </div>
            <div className="mt-4 rounded-lg border dark-mode:border-slate-700 light-mode:border-slate-300 coffee-mode:border-slate-700 px-3.5 py-3">
              <div className="text-xs font-semibold dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-amber-100">
                With error bars: {budget.sigmaAssessment.label}
              </div>
              <p className="text-xs dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-amber-700 mt-1 leading-relaxed">
                {budget.sigmaAssessment.description}
              </p>
            </div>
          </Panel>

          <Panel title="3 · The public record">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-amber-600">
                Latest filings (newest first)
              </span>
              {supabaseConfigured && (
                <button
                  onClick={refresh}
                  disabled={busy}
                  className="dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-slate-500 hover:text-cyan-400 transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className={`w-4 h-4 ${busy ? "animate-spin" : ""}`} />
                </button>
              )}
            </div>
            {!supabaseConfigured ? (
              <p className="text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-slate-500 italic">
                Registry list needs the configured backend; the budget above is
                fully local.
              </p>
            ) : busy && claims.length === 0 && !error ? (
              <Skeleton rows={4} />
            ) : claims.length === 0 ? (
              <p className="text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-slate-500 italic">
                Nothing filed yet. The first claim is yours.
              </p>
            ) : (
              <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {claims.map((c) => (
                  <li
                    key={c.id}
                    className="dark-mode:bg-slate-900 light-mode:bg-slate-100 coffee-mode:bg-slate-900 rounded-lg px-3 py-2.5 border dark-mode:border-slate-700/50 light-mode:border-slate-300/50 coffee-mode:border-slate-700/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-amber-100 font-medium truncate flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 flex-shrink-0 dark-mode:text-slate-600 light-mode:text-slate-400 coffee-mode:text-slate-600" />
                        {c.title}
                      </span>
                      <span className="text-[10px] dark-mode:text-slate-600 light-mode:text-slate-500 coffee-mode:text-slate-600 font-mono flex-shrink-0">
                        {new Date(c.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-xs dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-amber-700/80 mt-1">
                      claims {c.claimed_value.toExponential(2)} {c.claimed_unit} ·{" "}
                      {matchedClaimIds.has(c.id) && (
                        <span className="text-sky-400 mr-1" title="Matches a prior pre-registration">
                          pre-registered ✓
                        </span>
                      )}
                      <span
                        className={
                          c.verdict_key === "explained" ||
                          c.verdict_key === "consistent"
                            ? "text-emerald-400"
                            : c.verdict_key === "gross-excess"
                              ? "text-red-400"
                              : "text-amber-400"
                        }
                      >
                        {c.verdict_label}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
