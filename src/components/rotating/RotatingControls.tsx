import Panel from "../ui/Panel";
import Slider from "../ui/Slider";
import ToggleButton from "../ui/ToggleButton";

interface RotatingControlsProps {
  frequency: number;
  amplitude: number;
  cavityLength: number;
  running: boolean;
  onFrequency: (v: number) => void;
  onAmplitude: (v: number) => void;
  onCavityLength: (v: number) => void;
  onToggleRun: () => void;
}

export default function RotatingControls({
  frequency,
  amplitude,
  cavityLength,
  running,
  onFrequency,
  onAmplitude,
  onCavityLength,
  onToggleRun,
}: RotatingControlsProps) {
  return (
    <Panel title="Parameters">
      <div className="space-y-5">
        <Slider
          label="Driving Frequency"
          value={frequency}
          displayValue={`${frequency} kHz`}
          min={10}
          max={2000}
          onChange={onFrequency}
        />
        <Slider
          label="Field Amplitude"
          value={amplitude}
          displayValue={`${amplitude.toFixed(2)} (normalized)`}
          min={0.1}
          max={2}
          step={0.05}
          onChange={onAmplitude}
        />
        <Slider
          label="Cavity Length"
          value={cavityLength}
          displayValue={`${cavityLength.toFixed(2)} m`}
          min={0.05}
          max={1}
          step={0.01}
          onChange={onCavityLength}
        />
        <ToggleButton running={running} onToggle={onToggleRun} />
      </div>
    </Panel>
  );
}
