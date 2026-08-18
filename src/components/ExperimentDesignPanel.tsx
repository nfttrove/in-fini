import { useMemo, useState } from "react";
import Panel from "./ui/Panel";
import PlainExplainer from "./ui/PlainExplainer";
import Slider from "./ui/Slider";
import MetricCard from "./ui/MetricCard";
import {
  thrustRequirements,
  powerRequirements,
  ThrustDesignContext,
  PowerDesignContext,
} from "../utils/experimentDesign";
import { assessDecidability, thermalPowerFloorW } from "../utils/thermalFloor";

type Mode = "thrust" | "power";

function fmtVal(v: number, unit: string): string {
  if (!isFinite(v)) return "impossible";
  if (unit === "dB" || unit === "K") return `${v.toFixed(1)} ${unit}`;
  if (Math.abs(v) >= 1000) return `${v.toExponential(2)} ${unit}`;
  if (Math.abs(v) >= 1) return `${v.toFixed(2)} ${unit}`;
  return `${v.toExponential(2)} ${unit}`;
}

export default function ExperimentDesignPanel() {
  const [mode, setMode] = useState<Mode>("thrust");
  const [k, setK] = useState(2);

  // Thrust context
  const [claimedDeltaGLog, setClaimedDeltaGLog] = useState(-1); // log10(Δg)
  const [driveVoltageV, setDriveVoltageV] = useState(10000);
  const [deviceMassKg, setDeviceMassKg] = useState(0.1);
  const [deviceHeightM, setDeviceHeightM] = useState(0.1);
  const [vibrationFreqHz, setVibrationFreqHz] = useState(100);
  const [vibrationAmpNm, setVibrationAmpNm] = useState(100);
  const [plateAreaM2, setPlateAreaM2] = useState(0.01);
  const [tempGradKPerM, setTempGradKPerM] = useState(2);
  const [rigTempK, setRigTempK] = useState(300);
  const [rigIntegrationS, setRigIntegrationS] = useState(100);

  // Power context
  const [claimedWLog, setClaimedWLog] = useState(-1); // log10(W)
  const [vDriveV, setVDriveV] = useState(10);
  const [rDriveOhm, setRDriveOhm] = useState(50);
  const [shieldDb, setShieldDb] = useState(40);
  const [iBiasA, setIBiasA] = useState(0.1);
  const [rResOhm, setRResOhm] = useState(0.1);
  const [tColdK, setTColdK] = useState(300);
  const [aRadM2, setARadM2] = useState(1e-4);
  const [emissivity, setEmissivity] = useState(0.9);

  const thrustCtx: ThrustDesignContext = useMemo(
    () => ({
      claimedDeltaG: Math.pow(10, claimedDeltaGLog),
      k,
      driveVoltageV,
      electrodeGapM: 0.01,
      deviceMassKg,
      deviceHeightM,
      vibrationFreqHz,
      vibrationAmpNm,
      plateAreaM2,
      ambientPressurePa: 101325,
      tempGradKPerM,
    }),
    [claimedDeltaGLog, k, driveVoltageV, deviceMassKg, deviceHeightM, vibrationFreqHz, vibrationAmpNm, plateAreaM2, tempGradKPerM]
  );

  const powerCtx: PowerDesignContext = useMemo(
    () => ({
      claimedW: Math.pow(10, claimedWLog),
      k,
      vDriveV,
      rDriveOhm,
      shieldDb,
      iBiasA,
      rResOhm,
      tColdK,
      aRadM2,
      emissivity,
      tHotK: tColdK + 50,
    }),
    [claimedWLog, k, vDriveV, rDriveOhm, shieldDb, iBiasA, rResOhm, tColdK, aRadM2, emissivity]
  );

  const result = mode === "thrust" ? thrustRequirements(thrustCtx) : powerRequirements(powerCtx);

  const decidability = assessDecidability(Math.pow(10, claimedDeltaGLog), {
    massKg: deviceMassKg,
    freqHz: vibrationFreqHz,
    qualityFactor: 100,
    tempK: rigTempK,
    integrationS: rigIntegrationS,
  });
  const powerFloor = thermalPowerFloorW(rigTempK, rigIntegrationS);

  return (
    <div className="space-y-6">
      <PlainExplainer title="Design the experiment that could actually detect something">
        <p>
          The diagnostic tabs judge claims after the fact. This one runs the
          other way: tell it the effect size you hope to detect and how many
          sigma you insist on, and it inverts the same physics to tell you
          what your rig must achieve — vibration floor, pressure, stray
          fields, shielding, temperature stability. Each requirement is
          derived analytically from the budget engines, and the round-trip
          (plug the limit back in, get exactly the per-channel allowance) is
          unit-tested.
        </p>
        <p className="mt-2 dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400">
          <span className="font-semibold dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-slate-200">Read it honestly:</span>{" "}
          a requirement your rig cannot meet does not mean the effect is
          real — it means your experiment cannot see it either way. These are
          necessary conditions, not a detection guarantee.
        </p>
      </PlainExplainer>

      <div className="flex flex-wrap gap-2 items-center">
        {(["thrust", "power"] as Mode[]).map((m) => (
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
            {m === "thrust" ? "Weight-change experiment (Δg)" : "Power-output experiment (W)"}
          </button>
        ))}
        <span className="text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-amber-600 ml-2">
          detection threshold:
        </span>
        {[1, 2, 3].map((kk) => (
          <button
            key={kk}
            onClick={() => setK(kk)}
            aria-pressed={k === kk}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              k === kk
                ? "bg-amber-600 text-white"
                : "dark-mode:bg-slate-700 light-mode:bg-slate-200 coffee-mode:bg-slate-700 dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-amber-100"
            }`}
          >
            {kk}σ
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Panel title="Your hypothesis and rig">
          <div className="space-y-5">
            {mode === "thrust" ? (
              <>
                <Slider
                  label="Effect you hope to detect"
                  value={claimedDeltaGLog}
                  displayValue={`${Math.pow(10, claimedDeltaGLog).toExponential(2)} Δg`}
                  min={-13}
                  max={1}
                  step={0.05}
                  onChange={setClaimedDeltaGLog}
                  minLabel="10⁻¹³"
                  maxLabel="10 Δg"
                />
                <Slider
                  label="Drive voltage"
                  value={driveVoltageV}
                  displayValue={`${(driveVoltageV / 1000).toFixed(1)} kV`}
                  min={0}
                  max={50000}
                  step={100}
                  onChange={setDriveVoltageV}
                  minLabel="0"
                  maxLabel="50 kV"
                />
                <Slider
                  label="Device mass"
                  value={deviceMassKg}
                  displayValue={`${(deviceMassKg * 1000).toFixed(0)} g`}
                  min={0.01}
                  max={5}
                  step={0.01}
                  onChange={setDeviceMassKg}
                  minLabel="10 g"
                  maxLabel="5 kg"
                />
                <Slider
                  label="Vibration frequency"
                  value={vibrationFreqHz}
                  displayValue={`${vibrationFreqHz.toFixed(0)} Hz`}
                  min={10}
                  max={500}
                  step={5}
                  onChange={setVibrationFreqHz}
                  minLabel="10 Hz"
                  maxLabel="500 Hz"
                />
                <Slider
                  label="Current vibration amplitude"
                  value={vibrationAmpNm}
                  displayValue={`${vibrationAmpNm.toFixed(0)} nm`}
                  min={1}
                  max={5000}
                  step={1}
                  onChange={setVibrationAmpNm}
                  minLabel="1 nm"
                  maxLabel="5 µm"
                />
                <Slider
                  label="Plate area"
                  value={plateAreaM2}
                  displayValue={`${(plateAreaM2 * 1e4).toFixed(0)} cm²`}
                  min={0.001}
                  max={0.1}
                  step={0.001}
                  onChange={setPlateAreaM2}
                  minLabel="1 cm²"
                  maxLabel="1000 cm²"
                />
                <Slider
                  label="Vertical thermal gradient"
                  value={tempGradKPerM}
                  displayValue={`${tempGradKPerM.toFixed(1)} K/m`}
                  min={0.01}
                  max={10}
                  step={0.01}
                  onChange={setTempGradKPerM}
                  minLabel="0.01"
                  maxLabel="10"
                />
                <Slider
                  label="Device height (thermal channel)"
                  value={deviceHeightM}
                  displayValue={`${(deviceHeightM * 100).toFixed(0)} cm`}
                  min={0.01}
                  max={1}
                  step={0.01}
                  onChange={setDeviceHeightM}
                  minLabel="1 cm"
                  maxLabel="1 m"
                />
              </>
            ) : (
              <>
                <Slider
                  label="Effect you hope to detect"
                  value={claimedWLog}
                  displayValue={`${Math.pow(10, claimedWLog).toExponential(2)} W`}
                  min={-22}
                  max={2}
                  step={0.05}
                  onChange={setClaimedWLog}
                  minLabel="10⁻²² W"
                  maxLabel="100 W"
                />
                <Slider
                  label="Drive pickup voltage"
                  value={vDriveV}
                  displayValue={`${vDriveV.toFixed(1)} V`}
                  min={0}
                  max={100}
                  step={0.5}
                  onChange={setVDriveV}
                  minLabel="0"
                  maxLabel="100 V"
                />
                <Slider
                  label="Current shielding"
                  value={shieldDb}
                  displayValue={`${shieldDb.toFixed(0)} dB`}
                  min={0}
                  max={120}
                  step={1}
                  onChange={setShieldDb}
                  minLabel="0 dB"
                  maxLabel="120 dB"
                />
                <Slider
                  label="Drive source resistance"
                  value={rDriveOhm}
                  displayValue={`${rDriveOhm.toFixed(0)} Ω`}
                  min={1}
                  max={1000}
                  step={1}
                  onChange={setRDriveOhm}
                  minLabel="1 Ω"
                  maxLabel="1 kΩ"
                />
                <Slider
                  label="Bias current"
                  value={iBiasA}
                  displayValue={`${iBiasA.toFixed(2)} A`}
                  min={0.001}
                  max={5}
                  step={0.001}
                  onChange={setIBiasA}
                  minLabel="1 mA"
                  maxLabel="5 A"
                />
                <Slider
                  label="Measurement resistance"
                  value={rResOhm}
                  displayValue={`${rResOhm.toFixed(2)} Ω`}
                  min={0.01}
                  max={100}
                  step={0.01}
                  onChange={setRResOhm}
                  minLabel="10 mΩ"
                  maxLabel="100 Ω"
                />
                <Slider
                  label="Cold-side temperature"
                  value={tColdK}
                  displayValue={`${tColdK.toFixed(0)} K`}
                  min={77}
                  max={300}
                  step={1}
                  onChange={setTColdK}
                  minLabel="77 K"
                  maxLabel="300 K"
                />
                <Slider
                  label="Radiating area"
                  value={aRadM2}
                  displayValue={`${(aRadM2 * 1e4).toFixed(1)} cm²`}
                  min={1e-5}
                  max={0.01}
                  step={1e-5}
                  onChange={setARadM2}
                  minLabel="0.1 cm²"
                  maxLabel="100 cm²"
                />
                <Slider
                  label="Emissivity"
                  value={emissivity}
                  displayValue={emissivity.toFixed(2)}
                  min={0.02}
                  max={1}
                  step={0.01}
                  onChange={setEmissivity}
                  minLabel="polished"
                  maxLabel="black"
                />
              </>
            )}
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title={`What your rig must achieve (claim = ${result.claim.toExponential(2)} ${result.unit})`}>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <MetricCard
                label="Per-channel artifact allowance"
                value={result.sigmaPerChannel.toExponential(2)}
                sub={`claim / (${k}·√${result.channels})`}
              />
              <MetricCard
                label="Channels budgeted"
                value={String(result.channels)}
                sub="independent, quadrature-split"
              />
            </div>
            <ul className="space-y-2.5">
              {result.requirements.map((r) => {
                const ratioMatch = r.asFractionOfReference.match(/^([\d.]+)× current$/);
                const ratio = ratioMatch ? parseFloat(ratioMatch[1]) : null;
                const alreadyOk = ratio !== null && ratio >= 1;
                return (
                  <li
                    key={r.key}
                    className={`rounded-lg px-3.5 py-3 border ${
                      alreadyOk
                        ? "border-emerald-500/40 bg-emerald-500/5"
                        : "border-amber-500/40 bg-amber-500/5"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-xs dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-amber-100 leading-relaxed">
                        {r.label}
                      </span>
                      <span
                        className={`font-mono text-sm flex-shrink-0 ${
                          alreadyOk
                            ? "text-emerald-400"
                            : "text-amber-400"
                        }`}
                      >
                        {fmtVal(r.value, r.unit)}
                      </span>
                    </div>
                    <div className="text-[10px] dark-mode:text-slate-500 light-mode:text-slate-500 coffee-mode:text-amber-700 mt-1">
                      {alreadyOk
                        ? "your current setup already satisfies this"
                        : r.asFractionOfReference === "—"
                          ? "absolute requirement"
                          : `need ${r.asFractionOfReference} of today's value`}
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>

          <Panel title="The thermal floor — can matter itself arbitrate this?">
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <Slider
                  label="Rig temperature"
                  value={rigTempK}
                  displayValue={`${rigTempK.toFixed(0)} K`}
                  min={0.01}
                  max={400}
                  step={0.01}
                  onChange={setRigTempK}
                  minLabel="10 mK"
                  maxLabel="400 K"
                />
                <Slider
                  label="Integration time"
                  value={rigIntegrationS}
                  displayValue={rigIntegrationS >= 3600 ? `${(rigIntegrationS / 3600).toFixed(1)} h` : `${rigIntegrationS.toFixed(0)} s`}
                  min={1}
                  max={1e6}
                  step={1}
                  onChange={setRigIntegrationS}
                  minLabel="1 s"
                  maxLabel="12 days"
                />
              </div>
              {mode === "thrust" ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <MetricCard
                      label="Thermal force floor of the test mass"
                      value={`${decidability.floorG.toExponential(2)} Δg`}
                      sub="√(4k_B·T·m·ω/Qτ) — Brownian limit"
                    />
                    <MetricCard
                      label="Claim ÷ floor"
                      value={decidability.ratio.toExponential(2) + "×"}
                      sub="how much matter can arbitrate"
                      color={
                        decidability.verdict.tone === "emerald"
                          ? "dark-mode:text-emerald-400 light-mode:text-emerald-600 coffee-mode:text-emerald-400"
                          : decidability.verdict.tone === "red"
                            ? "dark-mode:text-red-400 light-mode:text-red-600 coffee-mode:text-red-400"
                            : undefined
                      }
                    />
                  </div>
                  <div className={`rounded-xl border p-4 ${
                    decidability.verdict.tone === "emerald"
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                      : decidability.verdict.tone === "amber"
                        ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                        : "border-red-500/40 bg-red-500/10 text-red-300"
                  }`}>
                    <div className="font-semibold text-sm">{decidability.verdict.label}</div>
                    <p className="text-xs mt-1 leading-relaxed opacity-90">
                      {decidability.verdict.description}
                    </p>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <MetricCard
                    label="Energy floor (one kT per measurement)"
                    value={`${powerFloor.toExponential(2)} W`}
                    sub="k_B·T/τ — matched-filter bound"
                  />
                  <MetricCard
                    label="Claim ÷ floor"
                    value={(Math.pow(10, claimedWLog) / powerFloor).toExponential(2) + "×"}
                    sub="claim vs smallest meaningfully measurable power"
                  />
                </div>
              )}
              <p className="text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-amber-600 leading-relaxed">
                Beyond artifacts and error bars there is a third wall: the test
                mass is made of atoms, and atoms at temperature T jitter. A
                claim below that jitter is not false — it is unwitnessable by
                any matter-based instrument at that temperature. Cooling helps
                only as √T.
              </p>
            </div>
          </Panel>

          <Panel title="What this does NOT guarantee">
            <p className="text-xs leading-relaxed dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-amber-700">
              Meeting every requirement above makes your artifacts small
              enough to see past — it does not make your sensor calibrated,
              your analysis blind, or your statistics honest. Real
              detections additionally want: sensor calibration traceable to
              a standard, a pre-registered analysis plan (see the Claim
              Registry), A/B null tests with the effect source off, and
              someone trying their hardest to prove you wrong. The universe
              does not give points for effort.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
