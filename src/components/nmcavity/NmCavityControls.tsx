import Slider from "../ui/Slider";
import Panel from "../ui/Panel";

interface NmCavityControlsProps {
  gapNm: number;
  modeN: number;
  driveTHz: number;
  Q: number;
  onGap: (v: number) => void;
  onMode: (v: number) => void;
  onDrive: (v: number) => void;
  onQ: (v: number) => void;
}

export default function NmCavityControls({
  gapNm,
  modeN,
  driveTHz,
  Q,
  onGap,
  onMode,
  onDrive,
  onQ,
}: NmCavityControlsProps) {
  return (
    <Panel title="Cavity Parameters">
      <div className="space-y-5">
        <Slider
          label="Gap separation"
          value={gapNm}
          displayValue={`${gapNm.toFixed(0)} nm`}
          min={5}
          max={500}
          step={1}
          onChange={onGap}
          minLabel="5 nm"
          maxLabel="500 nm"
        />
        <Slider
          label="Mode number (n)"
          value={modeN}
          displayValue={`${modeN}`}
          min={1}
          max={8}
          step={1}
          onChange={onMode}
          minLabel="1"
          maxLabel="8"
        />
        <Slider
          label="Driving frequency"
          value={driveTHz}
          displayValue={`${driveTHz.toFixed(1)} THz`}
          min={50}
          max={5000}
          step={1}
          onChange={onDrive}
          minLabel="50 THz"
          maxLabel="5000 THz"
        />
        <Slider
          label="Quality factor Q"
          value={Q}
          displayValue={`${Q.toLocaleString()}`}
          min={100}
          max={100000}
          step={100}
          onChange={onQ}
          minLabel="100"
          maxLabel="100k"
        />
      </div>
    </Panel>
  );
}
