interface SliderProps {
  label: string;
  value: number;
  displayValue: string;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  minLabel?: string;
  maxLabel?: string;
}

export default function Slider({
  label,
  value,
  displayValue,
  min,
  max,
  step,
  onChange,
  minLabel,
  maxLabel,
}: SliderProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm dark-mode:text-slate-400 light-mode:text-slate-700 coffee-mode:text-amber-700">
        {label}: <span className="dark-mode:text-cyan-400 light-mode:text-slate-800 coffee-mode:text-amber-400 font-mono">{displayValue}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full dark-mode:accent-cyan-500 light-mode:accent-blue-500 coffee-mode:accent-amber-500"
      />
      {(minLabel || maxLabel) && (
        <div className="flex justify-between text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-amber-700 font-mono">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
}
