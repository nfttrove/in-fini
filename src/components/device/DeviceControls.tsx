import Panel from "../ui/Panel";
import Slider from "../ui/Slider";

interface DeviceControlsProps {
  dNm: number;
  fmKHz: number;
  beta: number;
  rotorRadiusNm: number;
  Q: number;
  areaMm2: number;
  onD: (v: number) => void;
  onFm: (v: number) => void;
  onBeta: (v: number) => void;
  onR: (v: number) => void;
  onQ: (v: number) => void;
  onArea: (v: number) => void;
}

export default function DeviceControls(props: DeviceControlsProps) {
  return (
    <Panel title="Device Parameters (combined model)">
      <div className="space-y-5">
        <Slider
          label="Cavity gap d (Casimir)"
          value={props.dNm}
          displayValue={`${props.dNm.toFixed(1)} nm`}
          min={1}
          max={500}
          step={0.5}
          onChange={props.onD}
          minLabel="1 nm"
          maxLabel="500 nm"
        />
        <Slider
          label="Rotor / drive freq fₘ"
          value={props.fmKHz}
          displayValue={
            props.fmKHz >= 1000
              ? `${(props.fmKHz / 1000).toFixed(2)} MHz`
              : `${props.fmKHz.toFixed(1)} kHz`
          }
          min={1}
          max={10000}
          step={1}
          onChange={props.onFm}
          minLabel="1 kHz"
          maxLabel="10 MHz"
        />
        <Slider
          label="Rotor radius r"
          value={props.rotorRadiusNm}
          displayValue={
            props.rotorRadiusNm >= 1000
              ? `${(props.rotorRadiusNm / 1000).toFixed(2)} µm`
              : `${props.rotorRadiusNm.toFixed(1)} nm`
          }
          min={1}
          max={100000}
          step={1}
          onChange={props.onR}
          minLabel="1 nm"
          maxLabel="100 µm"
        />
        <Slider
          label="Modulation depth β"
          value={props.beta}
          displayValue={props.beta.toFixed(3)}
          min={0}
          max={1}
          step={0.001}
          onChange={props.onBeta}
          minLabel="0"
          maxLabel="1"
        />
        <Slider
          label="Cavity quality Q"
          value={props.Q}
          displayValue={props.Q.toLocaleString()}
          min={100}
          max={1000000}
          step={100}
          onChange={props.onQ}
          minLabel="100"
          maxLabel="1M"
        />
        <Slider
          label="Active area A"
          value={props.areaMm2}
          displayValue={`${props.areaMm2.toFixed(3)} mm²`}
          min={0.001}
          max={100}
          step={0.001}
          onChange={props.onArea}
          minLabel="0.001 mm²"
          maxLabel="100 mm²"
        />
      </div>
    </Panel>
  );
}
