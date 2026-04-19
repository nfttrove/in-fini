import { ReactNode } from "react";

interface InfoNoteProps {
  children: ReactNode;
  variant?: "default" | "warning";
}

export default function InfoNote({ children, variant = "default" }: InfoNoteProps) {
  if (variant === "warning") {
    return (
      <p className="text-amber-400/80 text-xs bg-amber-900/20 rounded px-3 py-2 leading-relaxed">
        {children}
      </p>
    );
  }
  return (
    <p className="text-sm dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400 leading-relaxed">{children}</p>
  );
}
