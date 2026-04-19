import Panel from "../ui/Panel";
import Slider from "../ui/Slider";
import ToggleButton from "../ui/ToggleButton";

interface CavityControlsProps {
  cavityLength: number;
  modeNumber: number;
  drivingFreqKHz: number;
  Q: number;
  running: boolean;
  onCavityLength: (v: number) => void;
  onModeNumber: (v: number) => void;
  onDrivingFreqKHz: (v: number) => void;
  onQ: (v: number) => void;
  onToggleRun: () => void;
}

export default function CavityControls(props: CavityControlsProps) {
  return (
    <Panel title="Parameters">
      <div className="space-y-5">
        <Slider
          label="Cavity Length"
          value={props.cavityLength}
          displayValue={`${props.cavityLength.toFixed(2)} m`}
          min={0.01}
          max={1.0}
          step={0.01}
          onChange={props.onCavityLength}
        />
        <Slider
          label="Mode Number (n)"
          value={props.modeNumber}
          displayValue={`n = ${props.modeNumber}`}
          min={1}
          max={10}
          step={1}
          onChange={props.onModeNumber}
        />
        <Slider
          label="Driving Frequency"
          value={props.drivingFreqKHz}
          displayValue={`${props.drivingFreqKHz} kHz`}
          min={1}
          max={2000}
          onChange={props.onDrivingFreqKHz}
        />
        <Slider
          label="Quality Factor (Q)"
          value={props.Q}
          displayValue={`${props.Q}`}
          min={10}
          max={10000}
          step={10}
          onChange={props.onQ}
        />
        <ToggleButton running={props.running} onToggle={props.onToggleRun} />
      </div>
    </Panel>
  );
}
