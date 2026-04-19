import Panel from "../ui/Panel";
import Slider from "../ui/Slider";
import { ThrustParams } from "../../utils/thrustLeakage";

interface Props {
  p: ThrustParams;
  onChange: <K extends keyof ThrustParams>(key: K, value: ThrustParams[K]) => void;
}

const ClaimSection = ({ p, onChange }: Props) => (
  <div className="space-y-4">
    <h4 className="text-xs font-semibold dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400 uppercase tracking-wider">
      Claim
    </h4>
    <Slider
      label="Claimed weight change"
      value={Math.log10(Math.max(p.claimedDeltaG, 1e-12))}
      displayValue={`${p.claimedDeltaG.toExponential(2)} g`}
      min={-12}
      max={2}
      step={0.05}
      onChange={(v) => onChange("claimedDeltaG", Math.pow(10, v))}
      minLabel="1 pg"
      maxLabel="100 g"
    />
  </div>
);

const DriveSection = ({ p, onChange }: Props) => (
  <div className="pt-2 border-t dark-mode:border-slate-700/60 light-mode:border-slate-300/60 coffee-mode:border-slate-700/60 space-y-4">
    <h4 className="text-xs font-semibold dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400 uppercase tracking-wider">
      Drive / Electrodes
    </h4>
    <Slider
      label="Drive voltage"
      value={p.driveVoltageV}
      displayValue={`${p.driveVoltageV.toFixed(0)} V`}
      min={0}
      max={50000}
      step={10}
      onChange={(v) => onChange("driveVoltageV", v)}
    />
    <Slider
      label="Electrode gap"
      value={p.electrodeGapM * 1000}
      displayValue={`${(p.electrodeGapM * 1000).toFixed(1)} mm`}
      min={0.1}
      max={100}
      step={0.1}
      onChange={(v) => onChange("electrodeGapM", v / 1000)}
    />
    <Slider
      label="Ambient pressure"
      value={Math.log10(Math.max(p.ambientPressurePa, 1))}
      displayValue={`${p.ambientPressurePa.toExponential(2)} Pa`}
      min={0}
      max={5.1}
      step={0.05}
      onChange={(v) => onChange("ambientPressurePa", Math.pow(10, v))}
      minLabel="1 Pa (vacuum)"
      maxLabel="1 atm"
    />
  </div>
);

const VibrationSection = ({ p, onChange }: Props) => (
  <div className="pt-2 border-t dark-mode:border-slate-700/60 light-mode:border-slate-300/60 coffee-mode:border-slate-700/60 space-y-4">
    <h4 className="text-xs font-semibold dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400 uppercase tracking-wider">
      Vibration
    </h4>
    <Slider
      label="Device mass"
      value={Math.log10(Math.max(p.deviceMassKg, 1e-6))}
      displayValue={`${(p.deviceMassKg * 1000).toFixed(1)} g`}
      min={-6}
      max={1}
      step={0.05}
      onChange={(v) => onChange("deviceMassKg", Math.pow(10, v))}
      minLabel="1 mg"
      maxLabel="10 kg"
    />
    <Slider
      label="Vibration amplitude"
      value={p.vibrationAmpNm}
      displayValue={`${p.vibrationAmpNm.toFixed(1)} nm`}
      min={0}
      max={1000}
      step={1}
      onChange={(v) => onChange("vibrationAmpNm", v)}
    />
    <Slider
      label="Vibration frequency"
      value={Math.log10(Math.max(p.vibrationFreqHz, 1))}
      displayValue={`${p.vibrationFreqHz.toFixed(0)} Hz`}
      min={0}
      max={5}
      step={0.05}
      onChange={(v) => onChange("vibrationFreqHz", Math.pow(10, v))}
      minLabel="1 Hz"
      maxLabel="100 kHz"
    />
  </div>
);

const ElectrostaticSection = ({ p, onChange }: Props) => (
  <div className="pt-2 border-t dark-mode:border-slate-700/60 light-mode:border-slate-300/60 coffee-mode:border-slate-700/60 space-y-4">
    <h4 className="text-xs font-semibold dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400 uppercase tracking-wider">
      Electrostatic / Geometry
    </h4>
    <Slider
      label="Electrostatic field"
      value={Math.log10(Math.max(p.electrostaticFieldVPerM, 1))}
      displayValue={`${p.electrostaticFieldVPerM.toExponential(2)} V/m`}
      min={0}
      max={7}
      step={0.05}
      onChange={(v) => onChange("electrostaticFieldVPerM", Math.pow(10, v))}
      minLabel="1 V/m"
      maxLabel="10 MV/m"
    />
    <Slider
      label="Plate area"
      value={Math.log10(Math.max(p.plateAreaM2, 1e-6))}
      displayValue={`${(p.plateAreaM2 * 1e4).toFixed(2)} cm2`}
      min={-6}
      max={0}
      step={0.05}
      onChange={(v) => onChange("plateAreaM2", Math.pow(10, v))}
    />
  </div>
);

const ThermalSection = ({ p, onChange }: Props) => (
  <div className="pt-2 border-t dark-mode:border-slate-700/60 light-mode:border-slate-300/60 coffee-mode:border-slate-700/60 space-y-4">
    <h4 className="text-xs font-semibold dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400 uppercase tracking-wider">
      Thermal / Buoyancy
    </h4>
    <Slider
      label="Temp gradient"
      value={p.tempGradientKPerM}
      displayValue={`${p.tempGradientKPerM.toFixed(2)} K/m`}
      min={0}
      max={50}
      step={0.1}
      onChange={(v) => onChange("tempGradientKPerM", v)}
    />
    <Slider
      label="Device height"
      value={p.deviceHeightM * 100}
      displayValue={`${(p.deviceHeightM * 100).toFixed(1)} cm`}
      min={0.1}
      max={50}
      step={0.1}
      onChange={(v) => onChange("deviceHeightM", v / 100)}
    />
  </div>
);

const CavitySection = ({ p, onChange }: Props) => (
  <div className="pt-2 border-t dark-mode:border-slate-700/60 light-mode:border-slate-300/60 coffee-mode:border-slate-700/60 space-y-4">
    <h4 className="text-xs font-semibold dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400 uppercase tracking-wider">
      Cavity / DCE (Theoretical Limit)
    </h4>
    <Slider
      label="Cavity gap"
      value={p.cavityGap_nm}
      displayValue={`${p.cavityGap_nm.toFixed(1)} nm`}
      min={1}
      max={1000}
      step={1}
      onChange={(v) => onChange("cavityGap_nm", v)}
    />
    <Slider
      label="Rotor radius"
      value={p.rotorRadius_um}
      displayValue={`${p.rotorRadius_um.toFixed(3)} µm`}
      min={0.01}
      max={100}
      step={0.01}
      onChange={(v) => onChange("rotorRadius_um", v)}
    />
    <Slider
      label="Modulation depth β"
      value={p.modulationDepth_beta}
      displayValue={p.modulationDepth_beta.toFixed(2)}
      min={0}
      max={2}
      step={0.01}
      onChange={(v) => onChange("modulationDepth_beta", v)}
    />
    <Slider
      label="Cavity Q"
      value={Math.log10(p.cavityQ)}
      displayValue={p.cavityQ.toExponential(2)}
      min={2}
      max={6}
      step={0.1}
      onChange={(v) => onChange("cavityQ", Math.pow(10, v))}
      minLabel="100"
      maxLabel="1e6"
    />
    <Slider
      label="Active area"
      value={Math.log10(p.activeArea_cm2)}
      displayValue={`${p.activeArea_cm2.toFixed(2)} cm²`}
      min={-2}
      max={2}
      step={0.1}
      onChange={(v) => onChange("activeArea_cm2", Math.pow(10, v))}
      minLabel="0.01 cm²"
      maxLabel="100 cm²"
    />
    <Slider
      label="Drive frequency"
      value={Math.log10(Math.max(p.driveFrequency_Hz, 1))}
      displayValue={`${(p.driveFrequency_Hz / 1e3).toFixed(0)} kHz`}
      min={2}
      max={8}
      step={0.1}
      onChange={(v) => onChange("driveFrequency_Hz", Math.pow(10, v))}
      minLabel="100 Hz"
      maxLabel="100 MHz"
    />
  </div>
);

const ThrustControls = ({ p, onChange }: Props) => (
  <Panel title="Experimental Inputs">
    <div className="space-y-5">
      <ClaimSection p={p} onChange={onChange} />
      <DriveSection p={p} onChange={onChange} />
      <VibrationSection p={p} onChange={onChange} />
      <ElectrostaticSection p={p} onChange={onChange} />
      <ThermalSection p={p} onChange={onChange} />
      <CavitySection p={p} onChange={onChange} />
    </div>
  </Panel>
);

export default ThrustControls;