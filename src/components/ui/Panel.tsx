import { ReactNode } from "react";

interface PanelProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export default function Panel({ title, children, className = "" }: PanelProps) {
  return (
    <div className={`card-bg rounded-xl p-6 ${className}`}>
      <h3 className="text-xs font-semibold dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-amber-200 uppercase tracking-wider mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}
