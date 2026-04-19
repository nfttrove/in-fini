import { useEffect, useState } from "react";
import { Save, Trash2, Download, RefreshCw } from "lucide-react";
import {
  SimulationPreset,
  listPresets,
  savePreset,
  deletePreset,
  isPresetOwned,
} from "../../lib/supabase";

interface PresetBarProps {
  panel:
    | "casimir"
    | "rotating"
    | "coupling"
    | "nm-cavity"
    | "nonlinear"
    | "device"
    | "diagnostic"
    | "thrust";
  currentParams: Record<string, number | boolean | string>;
  onLoad: (params: Record<string, number | boolean | string>) => void;
}

export default function PresetBar({ panel, currentParams, onLoad }: PresetBarProps) {
  const [presets, setPresets] = useState<SimulationPreset[]>([]);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      setBusy(true);
      setError(null);
      const list = await listPresets(panel);
      setPresets(list);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [panel]);

  async function handleSave() {
    if (!name.trim()) return;
    try {
      setBusy(true);
      setError(null);
      await savePreset(panel, name.trim(), currentParams);
      setName("");
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      setBusy(true);
      setError(null);
      await deletePreset(id);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="dark-mode:bg-slate-800 light-mode:bg-slate-50 coffee-mode:bg-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300 uppercase tracking-wider">
          Saved Presets
        </h3>
        <button
          onClick={refresh}
          disabled={busy}
          className="dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-slate-500 dark-mode:hover:text-slate-300 light-mode:hover:text-slate-700 coffee-mode:hover:text-slate-300 transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${busy ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Preset name..."
          maxLength={80}
          className="flex-1 dark-mode:bg-slate-900 light-mode:bg-slate-100 coffee-mode:bg-slate-900 dark-mode:text-slate-100 light-mode:text-slate-900 coffee-mode:text-slate-100 dark-mode:placeholder-slate-600 light-mode:placeholder-slate-400 coffee-mode:placeholder-slate-600 rounded-lg px-3 py-2 text-sm border dark-mode:border-slate-700 light-mode:border-slate-300 coffee-mode:border-slate-700 focus:border-cyan-500 focus:outline-none"
        />
        <button
          onClick={handleSave}
          disabled={!name.trim() || busy}
          className="bg-cyan-600 hover:bg-cyan-700 dark-mode:disabled:bg-slate-700 light-mode:disabled:bg-slate-300 coffee-mode:disabled:bg-slate-700 dark-mode:disabled:text-slate-500 light-mode:disabled:text-slate-600 coffee-mode:disabled:text-slate-500 text-white rounded-lg px-3 py-2 text-sm font-medium flex items-center gap-1.5 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
      </div>

      {error && (
        <div className="text-xs text-red-400 bg-red-900/20 rounded px-3 py-2">
          {error}
        </div>
      )}

      {presets.length === 0 ? (
        <p className="text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-slate-500 italic">
          No presets yet. Save current parameters above.
        </p>
      ) : (
        <ul className="space-y-1.5 max-h-52 overflow-y-auto">
          {presets.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-2 dark-mode:bg-slate-900 light-mode:bg-slate-100 coffee-mode:bg-slate-900 rounded-lg px-3 py-2"
            >
              <span className="flex-1 text-sm dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-slate-200 truncate">
                {p.name}
              </span>
              <span className="text-xs dark-mode:text-slate-600 light-mode:text-slate-500 coffee-mode:text-slate-600 font-mono">
                {new Date(p.created_at).toLocaleDateString()}
              </span>
              <button
                onClick={() => onLoad(p.params)}
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
                title="Load"
              >
                <Download className="w-4 h-4" />
              </button>
              {isPresetOwned(p.id) ? (
                <button
                  onClick={() => handleDelete(p.id)}
                  className="dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-slate-500 hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              ) : (
                <span
                  className="dark-mode:text-slate-700 light-mode:text-slate-500 coffee-mode:text-slate-700 cursor-not-allowed"
                  title="You can only delete presets saved on this device"
                >
                  <Trash2 className="w-4 h-4" />
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
