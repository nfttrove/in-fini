import { useMemo, useState } from "react";
import DiagnosticControls from "./diagnostic/DiagnosticControls";
import DiagnosticBudget from "./diagnostic/DiagnosticBudget";
import DiagnosticVerdict from "./diagnostic/DiagnosticVerdict";
import DiagnosticSweeps from "./diagnostic/DiagnosticSweeps";
import DiagnosticRunsLog from "./diagnostic/DiagnosticRunsLog";
import DiagnosticReport from "./diagnostic/DiagnosticReport";
import DiagnosticNotes from "./diagnostic/DiagnosticNotes";
import PresetBar from "./ui/PresetBar";
import PlainExplainer from "./ui/PlainExplainer";
import { LeakageParams, computeBudget } from "../utils/leakage";

const DEFAULT_PARAMS: LeakageParams = {
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

export default function DiagnosticPanel() {
  const [params, setParams] = useState<LeakageParams>(DEFAULT_PARAMS);
  const budget = useMemo(() => computeBudget(params), [params]);

  const explainerStatus =
    budget.verdict.key === "excess" || budget.verdict.key === "gross-excess"
      ? ("excess" as const)
      : budget.verdict.key === "explained" || budget.verdict.key === "consistent"
        ? ("explained" as const)
        : ("neutral" as const);

  const update = <K extends keyof LeakageParams>(
    key: K,
    value: LeakageParams[K]
  ) => setParams((prev) => ({ ...prev, [key]: value }));

  const paramsForSave = useMemo(
    () => ({ ...params }) as Record<string, number>,
    [params]
  );

  return (
    <div className="space-y-6">
      <PlainExplainer title="Is that extra power real, or just a leak?" status={explainerStatus}>
        <p>
          When someone claims their machine outputs mystery energy, a good
          scientist first checks for mundane leaks: heat, radio pickup,
          vibration, sneaky battery current. This tool adds up every
          plausible leak and compares the total to the claimed output. If
          the leaks alone can explain the reading, the &ldquo;free
          energy&rdquo; is probably an artifact.
        </p>
        <p className="dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400">
          <span className="font-semibold dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-slate-200">Try this:</span>{" "}
          Enter a claimed output wattage and the device&rsquo;s drive
          voltage. The verdict badge turns green only when the claim truly
          exceeds every leakage channel.
        </p>
      </PlainExplainer>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <DiagnosticControls p={params} onChange={update} />
        </div>
        <div className="lg:col-span-3 space-y-6">
          <DiagnosticVerdict budget={budget} />
          <DiagnosticBudget budget={budget} />
        </div>
      </div>

      <DiagnosticSweeps base={params} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <DiagnosticReport budget={budget} params={params} />
          <DiagnosticNotes />
          <DiagnosticRunsLog params={paramsForSave} budget={budget} />
        </div>
        <div className="lg:col-span-2">
          <PresetBar
            panel="diagnostic"
            currentParams={paramsForSave}
            onLoad={(p) => {
              const next: LeakageParams = { ...params };
              (Object.keys(DEFAULT_PARAMS) as (keyof LeakageParams)[]).forEach(
                (k) => {
                  if (typeof p[k] === "number") {
                    (next[k] as number) = p[k] as number;
                  }
                }
              );
              setParams(next);
            }}
          />
        </div>
      </div>
    </div>
  );
}