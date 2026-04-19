import Panel from "../ui/Panel";
import Slider from "../ui/Slider";

interface CasimirControlsProps {
  separation: number;
  areaMm2: number;
  onSeparationChange: (v: number) => void;
  onAreaChange: (v: number) => void;
}

export default function CasimirControls({
  separation,
  areaMm2,
  onSeparationChange,
  onAreaChange,
}: CasimirControlsProps) {
  return (
    <Panel title="Parameters">
      <div className="space-y-5">
        <Slider
          label="Plate Separation"
          value={separation}
          displayValue={`${separation} nm`}
          min={1}
          max={1000}
          onChange={onSeparationChange}
          minLabel="1 nm"
          maxLabel="1000 nm"
        />
        <Slider
          label="Plate Area"
          value={areaMm2}
          displayValue={`${areaMm2} mm²`}
          min={0.1}
          max={100}
          step={0.1}
          onChange={onAreaChange}
          minLabel="0.1 mm²"
          maxLabel="100 mm²"
        />
      </div>
    </Panel>
  );
}
