import ThemeSwitcher from "./ThemeSwitcher";
import { useTheme } from "../contexts/ThemeContext";

const LogoImage = ({ isDark }: { isDark: boolean }) => (
  <img
    src={isDark ? "/in_fini_dark.png" : "/in_fini_white.png"}
    alt="In Fini Logo"
    className="h-8 w-auto"
  />
);

export default function Header() {
  const { theme } = useTheme();
  const isDark = theme === "dark" || theme === "coffee";

  return (
    <header className="dark-mode:border-slate-800/40 dark-mode:bg-slate-950/60 light-mode:border-blue-200/30 light-mode:bg-white/70 coffee-mode:border-amber-800/40 coffee-mode:bg-amber-950/60 border-b backdrop-blur-md sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-6">
        <div className="flex-shrink-0">
          <LogoImage isDark={isDark} />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold bg-gradient-to-r dark-mode:from-cyan-400 dark-mode:to-blue-400 light-mode:from-blue-600 light-mode:to-cyan-600 coffee-mode:from-amber-500 coffee-mode:to-orange-600 bg-clip-text text-transparent">
            In Fini
          </h1>
          <p className="text-xs dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-amber-600">
            Quantum physics &mdash; honest diagnostics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs font-medium dark-mode:text-slate-400 dark-mode:bg-slate-900/50 dark-mode:border-slate-800/50 light-mode:text-slate-700 light-mode:bg-blue-50/60 light-mode:border-blue-200/40 coffee-mode:text-amber-600 coffee-mode:bg-amber-950/50 coffee-mode:border-amber-800/50 border rounded-full px-3 py-1.5">
            Verifiable
          </div>
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
