import { useMemo, useState } from "react";
import ThrustControls from "./thrust/ThrustControls";
import ThrustBudgetPanel from "./thrust/ThrustBudget";
import ThrustVerdict from "./thrust/ThrustVerdict";
import ThrustSweeps from "./thrust/ThrustSweeps";
import ThrustReport from "./thrust/ThrustReport";
import ThrustNotes from "./thrust/ThrustNotes";
import ThrustPresetPicker from "./thrust/ThrustPresetPicker";
import ThrustDceLimit from "./thrust/ThrustDceLimit";
import PresetBar from "./ui/PresetBar";
import PlainExplainer from "./ui/PlainExplainer";
import GoverningEquation from "./ui/GoverningEquation";
import ArtifactBudgetGate from "./diagnostic/ArtifactBudgetGate";
import { ThrustParams, computeThrustBudget, dceThrustLimitG } from "../utils/thrustLeakage";

const DEFAULT_PARAMS: ThrustParams = {
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

export default function ThrustDiagnosticPanel() {
  const [params, setParams] = useState<ThrustParams>(DEFAULT_PARAMS);
  const budget = useMemo(() => computeThrustBudget(params), [params]);
  const dceThrustLimit = useMemo(() => dceThrustLimitG(params), [params]);

  const explainerStatus =
    budget.verdict.key === "excess" || budget.verdict.key === "gross-excess"
      ? ("excess" as const)
      : budget.verdict.key === "explained"
        ? ("explained" as const)
        : ("neutral" as const);

  const update = <K extends keyof ThrustParams>(
    key: K,
    value: ThrustParams[K]
  ) => setParams((prev) => ({ ...prev, [key]: value }));

  const paramsForSave = useMemo(
    () => ({ ...params }) as Record<string, number>,
    [params]
  );

  return (
    <div className="space-y-6">
      <PlainExplainer
        title="Is that weight change real, or just a force artifact?"
        status={explainerStatus}
      >
        <p>
          When a device claims to produce thrust or reduce its weight, a good
          scientist first checks for mundane forces: ion wind from corona
          discharge, vibration rattling the scale, electrostatic attraction to
          nearby surfaces, and thermal convection from heated air. This tool
          adds up every plausible artifact and compares the total to the claim.
        </p>
        <p className="dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400">
          <span className="font-semibold dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-slate-200">Try this:</span>{" "}
          Enter a claimed weight reduction and crank up the drive voltage.
          Watch the ion wind channel grow until it swallows the claim.
        </p>
      </PlainExplainer>

      <GoverningEquation type="thrust" className="mb-2" />

      <ThrustPresetPicker onLoad={setParams} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <ThrustControls p={params} onChange={update} />
        </div>
        <div className="lg:col-span-3 space-y-6">
          <ThrustVerdict budget={budget} />
          <ThrustBudgetPanel budget={budget} />
          <ThrustDceLimit dceThrustLimit_mg={dceThrustLimit} budget={budget} />
        </div>
      </div>

      <ThrustSweeps base={params} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <ThrustReport budget={budget} params={params} />
          <ThrustNotes />
        </div>
        <div className="lg:col-span-2">
          <PresetBar
            panel="thrust"
            currentParams={paramsForSave}
            onLoad={(p) => {
              const next: ThrustParams = { ...params };
              (Object.keys(DEFAULT_PARAMS) as (keyof ThrustParams)[]).forEach(
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

      <div className="mt-8 pt-8 border-t dark-mode:border-slate-700 light-mode:border-slate-300 coffee-mode:border-amber-700">
        <h3 className="text-lg font-semibold dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-amber-200 mb-4">
          Force Artifact Budget Gate
        </h3>
        <p className="text-sm dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-amber-400 mb-4">
          The comprehensive referee for anomalous thrust claims. Compute all known artifact channels
          and see if the signal survives. This is the gate the EmDrive failed.
        </p>
        <ArtifactBudgetGate />
      </div>
    </div>
  );
}