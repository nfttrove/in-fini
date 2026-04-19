interface ToggleButtonProps {
  running: boolean;
  onToggle: () => void;
  runLabel?: string;
  pauseLabel?: string;
}

export default function ToggleButton({
  running,
  onToggle,
  runLabel = "Resume",
  pauseLabel = "Pause",
}: ToggleButtonProps) {
  return (
    <button
      onClick={onToggle}
      className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors ${
        running
          ? "bg-blue-600 hover:bg-blue-700 text-white"
          : "dark-mode:bg-slate-600 light-mode:bg-slate-200 coffee-mode:bg-slate-600 dark-mode:hover:bg-slate-500 light-mode:hover:bg-slate-300 coffee-mode:hover:bg-slate-500 dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-slate-200"
      }`}
    >
      {running ? pauseLabel : runLabel}
    </button>
  );
}
