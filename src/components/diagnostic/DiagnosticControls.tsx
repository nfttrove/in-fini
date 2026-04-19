import Panel from "../ui/Panel";
import Slider from "../ui/Slider";
import { LeakageParams } from "../../utils/leakage";
import { fmtPower, fmtFreq } from "../../utils/format";

interface Props {
  p: LeakageParams;
  onChange: <K extends keyof LeakageParams>(key: K, value: LeakageParams[K]) => void;
}

const RfSection = ({ p, onChange }: Props) => (
  <div className="pt-2 border-t dark-mode:border-slate-700/60 light-mode:border-slate-300/60 coffee-mode:border-slate-700/60 space-y-4">
    <h4 className="text-xs font-semibold dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400 uppercase tracking-wider">
      RF / Drive leakage
    </h4>
    <Slider
      label="Drive voltage V_drive"
      value={p.vDriveV}
      displayValue={`${p.vDriveV.toFixed(3)} V`}
      min={0}
      max={100}
      step={0.01}
      onChange={(v) => onChange("vDriveV", v)}
    />
    <Slider
      label="Drive impedance R_drive"
      value={p.rDriveOhm}
      displayValue={`${p.rDriveOhm.toFixed(1)} Ω`}
      min={1}
      max={1000}
      step={1}
      onChange={(v) => onChange("rDriveOhm", v)}
    />
    <Slider
      label="Shielding attenuation"
      value={p.shieldDb}
      displayValue={`${p.shieldDb.toFixed(0)} dB`}
      min={0}
      max={160}
      step={1}
      onChange={(v) => onChange("shieldDb", v)}
      minLabel="no shielding"
      maxLabel="cryo Faraday"
    />
  </div>
);

const OhmicSection = ({ p, onChange }: Props) => (
  <div className="pt-2 border-t dark-mode:border-slate-700/60 light-mode:border-slate-300/60 coffee-mode:border-slate-700/60 space-y-4">
    <h4 className="text-xs font-semibold dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400 uppercase tracking-wider">
      Ohmic / Joule
    </h4>
    <Slider
      label="Bias current I"
      value={p.iBiasA}
      displayValue={`${p.iBiasA.toFixed(4)} A`}
      min={0}
      max={5}
      step={0.0001}
      onChange={(v) => onChange("iBiasA", v)}
    />
    <Slider
      label="Parasitic resistance R"
      value={p.rResOhm}
      displayValue={`${p.rResOhm.toFixed(3)} Ω`}
      min={0}
      max={10}
      step={0.001}
      onChange={(v) => onChange("rResOhm", v)}
    />
  </div>
);

const ThermalSection = ({ p, onChange }: Props) => (
  <div className="pt-2 border-t dark-mode:border-slate-700/60 light-mode:border-slate-300/60 coffee-mode:border-slate-700/60 space-y-4">
    <h4 className="text-xs font-semibold dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400 uppercase tracking-wider">
      Thermal radiation
    </h4>
    <Slider
      label="Hot-side temperature T_h"
      value={p.tHotK}
      displayValue={`${p.tHotK.toFixed(2)} K`}
      min={0.01}
      max={600}
      step={0.01}
      onChange={(v) => onChange("tHotK", v)}
    />
    <Slider
      label="Cold-side temperature T_c"
      value={p.tColdK}
      displayValue={`${p.tColdK.toFixed(2)} K`}
      min={0.01}
      max={600}
      step={0.01}
      onChange={(v) => onChange("tColdK", v)}
    />
    <Slider
      label="Radiating area A"
      value={Math.log10(Math.max(p.aRadM2, 1e-10))}
      displayValue={`${p.aRadM2.toExponential(2)} m²`}
      min={-10}
      max={-1}
      step={0.05}
      onChange={(v) => onChange("aRadM2", Math.pow(10, v))}
    />
    <Slider
      label="Emissivity ε"
      value={p.emissivity}
      displayValue={p.emissivity.toFixed(3)}
      min={0}
      max={1}
      step={0.005}
      onChange={(v) => onChange("emissivity", v)}
    />
  </div>
);

const MechanicalSection = ({ p, onChange }: Props) => (
  <div className="pt-2 border-t dark-mode:border-slate-700/60 light-mode:border-slate-300/60 coffee-mode:border-slate-700/60 space-y-4">
    <h4 className="text-xs font-semibold dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400 uppercase tracking-wider">
      Mechanical bleed-through
    </h4>
    <Slider
      label="Rotor effective mass m"
      value={Math.log10(Math.max(p.rotorMassKg, 1e-15))}
      displayValue={`${p.rotorMassKg.toExponential(2)} kg`}
      min={-15}
      max={-3}
      step={0.1}
      onChange={(v) => onChange("rotorMassKg", Math.pow(10, v))}
    />
    <Slider
      label="Rotor amplitude x"
      value={p.rotorAmpNm}
      displayValue={`${p.rotorAmpNm.toFixed(2)} nm`}
      min={0}
      max={500}
      step={0.1}
      onChange={(v) => onChange("rotorAmpNm", v)}
    />
    <Slider
      label="Drive frequency f_m"
      value={Math.log10(Math.max(p.fmHz, 1))}
      displayValue={fmtFreq(p.fmHz)}
      min={0}
      max={11}
      step={0.05}
      onChange={(v) => onChange("fmHz", Math.pow(10, v))}
    />
    <Slider
      label="Mechanical Q"
      value={Math.log10(Math.max(p.mechQ, 1))}
      displayValue={p.mechQ.toExponential(2)}
      min={0}
      max={8}
      step={0.05}
      onChange={(v) => onChange("mechQ", Math.pow(10, v))}
    />
  </div>
);

const DiagnosticControls = ({ p, onChange }: Props) => (
  <Panel title="Experimental Inputs">
    <div className="space-y-5">
      <div>
        <label className="block text-sm dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400 mb-2">
          Claimed output power:{" "}
          <span className="text-cyan-400 font-mono">{fmtPower(p.pClaimW)}</span>
        </label>
        <input
          type="range"
          min={-20}
          max={3}
          step={0.05}
          value={Math.log10(Math.max(p.pClaimW, 1e-20))}
          onChange={(e) => onChange("pClaimW", Math.pow(10, Number(e.target.value)))}
          className="w-full accent-cyan-500"
        />
        <div className="flex justify-between text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-slate-500 font-mono">
          <span>10⁻²⁰ W</span>
          <span>1 kW</span>
        </div>
      </div>
      <RfSection p={p} onChange={onChange} />
      <OhmicSection p={p} onChange={onChange} />
      <ThermalSection p={p} onChange={onChange} />
      <MechanicalSection p={p} onChange={onChange} />
    </div>
  </Panel>
);

export default DiagnosticControls;