import Slider from "../ui/Slider";
import Panel from "../ui/Panel";

interface NonlinearControlsProps {
  f0THz: number;
  fmKHz: number;
  beta: number;
  maxOrder: number;
  Q: number;
  onF0: (v: number) => void;
  onFm: (v: number) => void;
  onBeta: (v: number) => void;
  onOrder: (v: number) => void;
  onQ: (v: number) => void;
}

export default function NonlinearControls({
  f0THz,
  fmKHz,
  beta,
  maxOrder,
  Q,
  onF0,
  onFm,
  onBeta,
  onOrder,
  onQ,
}: NonlinearControlsProps) {
  return (
    <Panel title="Modulation Parameters">
      <div className="space-y-5">
        <Slider
          label="Cavity resonance f₀"
          value={f0THz}
          displayValue={
            f0THz >= 1000
              ? `${(f0THz / 1000).toFixed(2)} PHz`
              : `${f0THz.toFixed(1)} THz`
          }
          min={1}
          max={5000}
          step={1}
          onChange={onF0}
          minLabel="1 THz"
          maxLabel="5 PHz"
        />
        <Slider
          label="Modulation frequency fₘ"
          value={fmKHz}
          displayValue={
            fmKHz >= 1000
              ? `${(fmKHz / 1000).toFixed(2)} MHz`
              : `${fmKHz.toFixed(1)} kHz`
          }
          min={1}
          max={10000}
          step={1}
          onChange={onFm}
          minLabel="1 kHz"
          maxLabel="10 MHz"
        />
        <Slider
          label="Modulation depth β"
          value={beta}
          displayValue={`${beta.toFixed(3)}`}
          min={0}
          max={1}
          step={0.001}
          onChange={onBeta}
          minLabel="0"
          maxLabel="1"
        />
        <Slider
          label="Max sideband order"
          value={maxOrder}
          displayValue={`±${maxOrder}`}
          min={1}
          max={10}
          step={1}
          onChange={onOrder}
          minLabel="±1"
          maxLabel="±10"
        />
        <Slider
          label="Cavity quality Q"
          value={Q}
          displayValue={Q.toLocaleString()}
          min={100}
          max={1000000}
          step={100}
          onChange={onQ}
          minLabel="100"
          maxLabel="1M"
        />
      </div>
    </Panel>
  );
}
