import { Sun, Moon, Coffee } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const getButtonClass = (isActive: boolean) => {
    if (isActive) {
      return "bg-gradient-to-r dark-mode:from-cyan-600 dark-mode:to-blue-600 light-mode:from-blue-600 light-mode:to-cyan-600 coffee-mode:from-amber-700 coffee-mode:to-orange-700 text-white shadow-lg";
    }
    return `
      dark-mode:text-slate-500 dark-mode:hover:text-slate-300 dark-mode:hover:bg-slate-800/50
      light-mode:text-slate-600 light-mode:hover:text-slate-900 light-mode:hover:bg-blue-100/50
      coffee-mode:text-amber-300 coffee-mode:hover:text-amber-100 coffee-mode:hover:bg-amber-900/50
    `;
  };

  return (
    <div className="flex gap-1.5 dark-mode:bg-slate-900/40 light-mode:bg-blue-100/30 coffee-mode:bg-amber-900/30 dark-mode:border-slate-800/50 light-mode:border-blue-200/30 coffee-mode:border-amber-800/30 border rounded-lg p-1">
      <button
        onClick={() => setTheme("light")}
        className={`p-2 rounded-md transition-all ${getButtonClass(theme === "light")}`}
        title="Light mode"
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme("coffee")}
        className={`p-2 rounded-md transition-all ${getButtonClass(theme === "coffee")}`}
        title="Coffee mode"
      >
        <Coffee className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`p-2 rounded-md transition-all ${getButtonClass(theme === "dark")}`}
        title="Dark mode"
      >
        <Moon className="w-4 h-4" />
      </button>
    </div>
  );
}
