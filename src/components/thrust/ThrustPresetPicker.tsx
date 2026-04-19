import { useState, useEffect } from "react";
import { Beaker, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import Panel from "../ui/Panel";
import { ThrustParams } from "../../utils/thrustLeakage";
import { supabase } from "../../lib/supabase";

interface ThrustPresetRow {
  name: string;
  tagline: string;
  verdict: string;
  claimed_delta_g: number;
  drive_voltage_v: number;
  ambient_pressure_pa: number;
  electrode_gap_m: number;
  device_mass_kg: number;
  vibration_amp_nm: number;
  vibration_freq_hz: number;
  temp_gradient_k_per_m: number;
  device_height_m: number;
  plate_area_m2: number;
  electrostatic_field_v_per_m: number;
  cavity_gap_nm: number;
  rotor_radius_um: number;
  modulation_depth_beta: number;
  cavity_q: number;
  active_area_cm2: number;
  drive_frequency_hz: number;
}

interface Props {
  onLoad: (params: ThrustParams) => void;
}

function rowToParams(row: ThrustPresetRow): ThrustParams {
  return {
    claimedDeltaG: row.claimed_delta_g,
    driveVoltageV: row.drive_voltage_v,
    ambientPressurePa: row.ambient_pressure_pa,
    electrodeGapM: row.electrode_gap_m,
    deviceMassKg: row.device_mass_kg,
    vibrationAmpNm: row.vibration_amp_nm,
    vibrationFreqHz: row.vibration_freq_hz,
    tempGradientKPerM: row.temp_gradient_k_per_m,
    deviceHeightM: row.device_height_m,
    plateAreaM2: row.plate_area_m2,
    electrostaticFieldVPerM: row.electrostatic_field_v_per_m,
    cavityGap_nm: row.cavity_gap_nm,
    rotorRadius_um: row.rotor_radius_um,
    modulationDepth_beta: row.modulation_depth_beta,
    cavityQ: row.cavity_q,
    activeArea_cm2: row.active_area_cm2,
    driveFrequency_Hz: row.drive_frequency_hz,
  };
}

function PresetCard({
  name,
  row,
  onLoad,
}: {
  name: string;
  row: ThrustPresetRow;
  onLoad: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="dark-mode:bg-slate-900 light-mode:bg-slate-100 coffee-mode:bg-slate-900 rounded-lg overflow-hidden border dark-mode:border-slate-700/50 light-mode:border-slate-300/50 coffee-mode:border-slate-700/50 dark-mode:hover:border-slate-600/70 light-mode:hover:border-slate-400/70 coffee-mode:hover:border-slate-600/70 transition-colors">
      <button
        onClick={onLoad}
        className="w-full text-left px-3.5 py-3 group"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-sm font-medium dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
              {name}
            </div>
            <div className="text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-slate-500 mt-0.5">{row.verdict}</div>
          </div>
          <Beaker className="w-4 h-4 dark-mode:text-slate-600 light-mode:text-slate-400 coffee-mode:text-slate-600 group-hover:text-cyan-400 transition-colors flex-shrink-0 mt-0.5" />
        </div>
      </button>

      <div className="px-3.5 pb-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-slate-500 dark-mode:hover:text-slate-300 light-mode:hover:text-slate-700 coffee-mode:hover:text-slate-300 transition-colors"
        >
          {expanded ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
          {expanded ? "Hide" : "Details"}
        </button>

        {expanded && (
          <p className="text-xs dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400 italic mt-2 leading-relaxed pb-1">
            "{row.tagline}"
          </p>
        )}
      </div>
    </div>
  );
}

export default function ThrustPresetPicker({ onLoad }: Props) {
  const [presets, setPresets] = useState<ThrustPresetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPresets = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error: err } = await supabase
          .from("thrust_presets")
          .select("*")
          .order("name");

        if (err) {
          setError(err.message);
          return;
        }

        setPresets(data || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
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
              name={preset.name}
              row={preset}
              onLoad={() => onLoad(rowToParams(preset))}
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
