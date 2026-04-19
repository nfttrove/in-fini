interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}

export default function MetricCard({
  label,
  value,
  sub,
  color = "dark-mode:text-cyan-400 light-mode:text-slate-800 coffee-mode:text-amber-400",
}: MetricCardProps) {
  return (
    <div className="card-bg rounded-lg p-4">
      <div className="text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-amber-600 mb-2">{label}</div>
      <div className={`font-mono text-lg font-semibold ${color}`}>{value}</div>
      {sub && <div className="text-xs dark-mode:text-slate-600 light-mode:text-slate-700 coffee-mode:text-amber-700 mt-1">{sub}</div>}
    </div>
  );
}
