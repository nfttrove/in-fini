/**
 * Loading placeholder for async list/card content — the polite alternative
 * to a blank panel that pops. Purely presentational.
 */
export default function Skeleton({
  rows = 3,
  className = "",
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-9 rounded-lg dark-mode:bg-slate-800 light-mode:bg-slate-200 coffee-mode:bg-slate-800 animate-pulse"
          style={{ opacity: 1 - i * 0.15 }}
        />
      ))}
    </div>
  );
}
