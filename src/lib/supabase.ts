import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(url, anon);

export interface SimulationPreset {
  id: string;
  panel:
    | "casimir"
    | "rotating"
    | "coupling"
    | "nm-cavity"
    | "nonlinear"
    | "device"
    | "diagnostic";
  name: string;
  params: Record<string, number | boolean | string>;
  created_at: string;
}

const PRESET_TOKEN_KEY = "simPresetOwnerTokens";

function readTokenMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(PRESET_TOKEN_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function writeTokenMap(map: Record<string, string>): void {
  try {
    localStorage.setItem(PRESET_TOKEN_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

function rememberOwnerToken(presetId: string, token: string): void {
  const map = readTokenMap();
  map[presetId] = token;
  writeTokenMap(map);
}

function forgetOwnerToken(presetId: string): void {
  const map = readTokenMap();
  delete map[presetId];
  writeTokenMap(map);
}

export function isPresetOwned(presetId: string): boolean {
  return Boolean(readTokenMap()[presetId]);
}

function makeOwnerToken(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function listPresets(panel: string): Promise<SimulationPreset[]> {
  const { data, error } = await supabase
    .from("simulation_presets")
    .select("id,panel,name,params,created_at")
    .eq("panel", panel)
    .order("created_at", { ascending: false })
    .limit(25);
  if (error) throw error;
  return (data ?? []) as SimulationPreset[];
}

export async function savePreset(
  panel: string,
  name: string,
  params: Record<string, number | boolean | string>
): Promise<SimulationPreset> {
  const ownerToken = makeOwnerToken();
  const { data, error } = await supabase
    .from("simulation_presets")
    .insert({ panel, name, params, owner_token: ownerToken })
    .select("id,panel,name,params,created_at")
    .maybeSingle();
  if (error) throw error;
  const preset = data as SimulationPreset;
  rememberOwnerToken(preset.id, ownerToken);
  return preset;
}

export async function deletePreset(id: string): Promise<void> {
  const token = readTokenMap()[id];
  if (!token) {
    throw new Error("You can only delete presets you created on this device.");
  }
  const { data, error } = await supabase.rpc("delete_preset", {
    p_id: id,
    p_token: token,
  });
  if (error) throw error;
  if (data !== true) {
    throw new Error("Preset could not be deleted (token mismatch).");
  }
  forgetOwnerToken(id);
}

export interface DiagnosticRun {
  id: string;
  label: string;
  params: Record<string, number>;
  results: {
    totalLeakageW: number;
    residualW: number;
    verdictKey: string;
    verdictLabel: string;
  };
  created_at: string;
}

export async function listDiagnosticRuns(): Promise<DiagnosticRun[]> {
  const { data, error } = await supabase
    .from("diagnostic_runs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(25);
  if (error) throw error;
  return (data ?? []) as DiagnosticRun[];
}

export async function saveDiagnosticRun(
  label: string,
  params: Record<string, number>,
  results: DiagnosticRun["results"]
): Promise<DiagnosticRun> {
  const { data, error } = await supabase
    .from("diagnostic_runs")
    .insert({ label, params, results })
    .select()
    .maybeSingle();
  if (error) throw error;
  return data as DiagnosticRun;
}
