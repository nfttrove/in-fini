import { ReactNode, useState } from "react";
import { Lightbulb, ChevronDown } from "lucide-react";

type Status = "neutral" | "excess" | "explained";

const STATUS_STYLES: Record<Status, { border: string; bg: string; hover: string; icon: string; title: string; text: string }> = {
  neutral: {
    border: "dark-mode:border-cyan-500/30 light-mode:border-blue-200/50 coffee-mode:border-amber-500/30",
    bg: "dark-mode:bg-cyan-500/5 light-mode:bg-blue-50/40 coffee-mode:bg-amber-500/5",
    hover: "dark-mode:hover:bg-cyan-500/10 light-mode:hover:bg-blue-100/40 coffee-mode:hover:bg-amber-500/10",
    icon: "dark-mode:text-cyan-300 light-mode:text-slate-700 coffee-mode:text-amber-400",
    title: "dark-mode:text-cyan-100 light-mode:text-slate-800 coffee-mode:text-amber-100",
    text: "dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-amber-100",
  },
  excess: {
    border: "dark-mode:border-amber-500/40 light-mode:border-amber-300/50 coffee-mode:border-orange-500/30",
    bg: "dark-mode:bg-amber-500/5 light-mode:bg-amber-50/50 coffee-mode:bg-orange-500/5",
    hover: "dark-mode:hover:bg-amber-500/10 light-mode:hover:bg-amber-100/50 coffee-mode:hover:bg-orange-500/10",
    icon: "dark-mode:text-amber-400 light-mode:text-amber-600 coffee-mode:text-orange-400",
    title: "dark-mode:text-amber-100 light-mode:text-amber-900 coffee-mode:text-orange-100",
    text: "dark-mode:text-amber-100 light-mode:text-amber-800 coffee-mode:text-orange-100",
  },
  explained: {
    border: "dark-mode:border-emerald-500/40 light-mode:border-green-300/40 coffee-mode:border-emerald-500/30",
    bg: "dark-mode:bg-emerald-500/5 light-mode:bg-green-50/40 coffee-mode:bg-emerald-500/5",
    hover: "dark-mode:hover:bg-emerald-500/10 light-mode:hover:bg-green-100/40 coffee-mode:hover:bg-emerald-500/10",
    icon: "dark-mode:text-emerald-400 light-mode:text-green-600 coffee-mode:text-emerald-400",
    title: "dark-mode:text-emerald-100 light-mode:text-green-900 coffee-mode:text-emerald-100",
    text: "dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-amber-100",
  },
};

interface PlainExplainerProps {
  title?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  status?: Status;
}

export default function PlainExplainer({
  title = "In plain English",
  children,
  defaultOpen = true,
  status = "neutral",
}: PlainExplainerProps) {
  const [open, setOpen] = useState(defaultOpen);
  const s = STATUS_STYLES[status];

  return (
    <div className={`rounded-xl border ${s.border} ${s.bg} overflow-hidden transition-colors duration-300`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between px-4 py-3 text-left ${s.hover} transition-colors`}
      >
        <div className="flex items-center gap-2">
          {status === "excess" && (
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          )}
          <Lightbulb className={`w-4 h-4 ${s.icon}`} />
          <span className={`text-sm font-semibold ${s.title}`}>{title}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 ${s.icon} transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className={`px-4 pb-4 pt-1 text-sm leading-relaxed space-y-2 ${s.text}`}>
          {children}
        </div>
      )}
    </div>
  );
}
