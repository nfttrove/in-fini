interface Props {
  type: "power" | "thrust";
  className?: string;
}

export default function GoverningEquation({ type, className = "" }: Props) {
  const isPower = type === "power";

  return (
    <div className={`dark-mode:bg-slate-800/50 light-mode:bg-blue-50/40 coffee-mode:bg-slate-800/50 p-3 rounded dark-mode:border-blue-500/30 light-mode:border-blue-200/50 coffee-mode:border-blue-500/30 border ${className}`}>
      <div className="text-xs dark-mode:text-blue-300 light-mode:text-slate-700 coffee-mode:text-blue-300 uppercase tracking-wider font-semibold">Governing equation</div>
      <div className="font-mono text-sm md:text-base overflow-x-auto mt-2 dark-mode:text-blue-100 light-mode:text-slate-800 coffee-mode:text-blue-100">
        {isPower ? (
          <>P<sub>out</sub> = (ħc³/d⁴) · (v/c)² · A · 2J₁²(β) · ℒ(f<sub>m</sub>; Q)</>
        ) : (
          <>F<sub>DCE</sub> = P<sub>out</sub> / c = (ħc⁴/d⁴) · (v/c)² · A · 2J₁²(β) · ℒ(f<sub>m</sub>; Q)</>
        )}
      </div>
      <div className="text-xs dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400 mt-2 leading-relaxed">
        <div className="grid grid-cols-2 gap-2 text-left">
          <div>ħ = reduced Planck constant</div>
          <div>c = speed of light</div>
          <div>d = cavity gap</div>
          <div>v = 2πf<sub>m</sub>r = tangential velocity</div>
          <div>A = area</div>
          <div>J₁(β) = first Bessel function</div>
          <div>β = modulation depth</div>
          <div>ℒ = Lorentzian cavity response</div>
        </div>
      </div>
    </div>
  );
}
