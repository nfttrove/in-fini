import { EnergyBalance, formatPower } from "../../utils/leakage";

/** Output vs the power the rig is known to draw — shown beside the leakage verdict. */
export default function EnergyBalanceCard({ balance }: { balance: EnergyBalance }) {
  const within = balance.key === "within-input";
  return (
    <div
      className={`rounded-lg border px-3.5 py-3 ${
        within ? "border-emerald-500/40 bg-emerald-500/5" : "border-amber-500/40 bg-amber-500/5"
      }`}
    >
      <div className="text-xs font-semibold uppercase tracking-wider dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-amber-100">
        Energy balance: {balance.label}
      </div>
      <div className="grid grid-cols-3 gap-2 mt-2 font-mono text-sm">
        <div>
          <div className="text-[10px] dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-amber-700 font-sans">Known input</div>
          {formatPower(balance.inputW)}
        </div>
        <div>
          <div className="text-[10px] dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-amber-700 font-sans">Output ÷ input</div>
          {isFinite(balance.ratio) ? `${balance.ratio.toPrecision(3)}×` : "∞"}
        </div>
        <div>
          <div className="text-[10px] dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-amber-700 font-sans">Net excess</div>
          {within ? "none" : formatPower(balance.netExcessW)}
        </div>
      </div>
      <p className="text-xs dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-amber-700 mt-2 leading-relaxed">
        {balance.description} Known input = drive ½V²/R + bias I²R.
      </p>
    </div>
  );
}
