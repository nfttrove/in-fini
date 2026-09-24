import { useState, useEffect, useMemo } from "react";
import { AlertCircle } from "lucide-react";
import PresetCard from "./PresetCard";
import Panel from "../ui/Panel";
import { ThrustParams } from "../../utils/thrustLeakage";
import { supabase, supabaseConfigured } from "../../lib/supabase";
import {
  PresetItem,
  builtInPresets,
  presetStabilities,
  rowToItem,
} from "../../data/presetItems";

interface Props {
  onLoad: (params: ThrustParams) => void;
}


export default function ThrustPresetPicker({ onLoad }: Props) {
  // Always start with the built-ins so SSR and the first client frame show
  // real cards and badges. The effect below replaces them with cloud data
  // when Supabase is available; until then there is no empty frame.
  const [presets, setPresets] = useState<PresetItem[]>(builtInPresets);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Robustness of each listed preset's verdict under ±20% jitter.
  const stabilityByName = useMemo(() => presetStabilities(presets), [presets]);

  useEffect(() => {
    const fetchPresets = async () => {
      if (!supabaseConfigured) {
        setPresets(builtInPresets());
        setLoading(false);
        return;
      }
      try {
        setError(null);
        const { data, error: err } = await supabase!
          .from("thrust_presets")
          .select("*")
          .order("name");

        if (err) {
          throw err;
        }

        setPresets((data || []).map(rowToItem));
      } catch (e) {
        // Cloud list failed (outage, bad env): the show goes on with the
        // built-in copy of the presets instead of an empty panel.
        setPresets(builtInPresets());
        setError(
          `Cloud presets unavailable (${
            e instanceof Error ? e.message : "unknown error"
          }) — showing built-in presets.`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPresets();
  }, []);

  return (
    <Panel title="Famous Claims & Artifacts">
      <p className="text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-slate-500 mb-4 leading-relaxed">
        Click any preset to load its parameters. Each one recreates a famous
        claim or highlights a specific artifact channel.
      </p>

      {loading && (
        <div className="text-center py-6">
          <p className="text-xs dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400">Loading presets...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-700/50 rounded p-3 mb-4 flex gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-200">{error}</p>
        </div>
      )}

      {!loading && presets.length > 0 && (
        <div className="space-y-2 max-h-[28rem] overflow-y-auto pr-1">
          {presets.map((preset) => (
            <PresetCard
              key={preset.name}
              item={preset}
              onLoad={() => onLoad(preset.params)}
              stability={stabilityByName.get(preset.name)}
            />
          ))}
        </div>
      )}

      {!loading && presets.length === 0 && !error && (
        <p className="text-xs dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400 text-center py-6">
          No presets available. Check your database connection.
        </p>
      )}
    </Panel>
  );
}
