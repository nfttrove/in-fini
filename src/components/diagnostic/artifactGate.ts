/**
 * The Artifact Budget Gate's channels and presets, kept out of the
 * component so tests can check the numbers the gate prints.
 */

const C_LIGHT = 2.998e8;
const EPS0 = 8.854e-12;

export interface GateValues {
  claim: number;
  P: number;
  leak: number;
  I: number;
  Leff: number;
  B: number;
  pressure: number;
  area: number;
  epsGas: number;
  cth: number;
  V: number;
  Aes: number;
  gap: number;
  noise: number;
}

export interface PresetConfig {
  label: string;
  note: string;
  values: GateValues;
}

export const PRESETS: Record<string, PresetConfig> = {
  eagleworks: {
    label: "Eagleworks 2016 (EmDrive)",
    note: "80 W RF, ~100 µN claimed (1.2 ± 0.1 mN/kW; White et al., J. Propul. Power 33, 830, 2017). The artifact values are illustrative, not measured on that rig: thermal drift ≈ 1 µN/W, the size TU Dresden measured when their own EmDrive's thermal expansion stressed the balance pivots (\"similar to … White et al.\"), and a few centimetres of unshielded cable in Earth's field, their best estimate for an earlier false positive (Tajmar, Neunzig & Weikert, CEAS Space J. 14, 31, 2022).",
    values: {
      claim: 100, P: 80, leak: 0.5, I: 2.2, Leff: 0.05, B: 50,
      pressure: 1e-5, area: 100, epsGas: 0.005, cth: 1000,
      V: 40, Aes: 1, gap: 2, noise: 100,
    },
  },
  shielded: {
    label: "Clean lab (SpaceDrive-style)",
    note: "Mu-metal shielding, twisted pairs, liquid-metal contacts: what a claim must beat. TU Dresden's SpaceDrive balance found no EmDrive thrust; earlier signals were thermal and cable artefacts (Tajmar, Neunzig & Weikert, CEAS Space J. 14, 31, 2022).",
    values: {
      claim: 100, P: 80, leak: 0.1, I: 2.2, Leff: 0.02, B: 1,
      pressure: 1e-7, area: 100, epsGas: 0.001, cth: 2,
      V: 5, Aes: 1, gap: 5, noise: 20,
    },
  },
};

export interface ChannelDef {
  key: string;
  name: string;
  formula: string;
  compute: (v: GateValues) => number;
}

export const CHANNEL_DEFS: ChannelDef[] = [
  {
    key: "photon",
    name: "Photon pressure",
    formula: "η · P / c",
    compute: (v) => (v.leak * v.P) / C_LIGHT,
  },
  {
    key: "magnetic",
    name: "Magnetic cable coupling",
    formula: "I · L_eff · B",
    compute: (v) => v.I * v.Leff * v.B * 1e-6,
  },
  {
    key: "thermal",
    name: "Thermal balance drift",
    formula: "c_th · P",
    compute: (v) => v.cth * 1e-9 * v.P,
  },
  {
    key: "gas",
    name: "Gas-dynamic / outgassing",
    formula: "ε · p · A",
    compute: (v) => v.epsGas * (v.pressure * 100) * (v.area * 1e-4),
  },
  {
    key: "electro",
    name: "Electrostatic",
    formula: "ε₀ A V² / 2d²",
    compute: (v) =>
      (EPS0 * (v.Aes * 1e-4) * v.V * v.V) / (2 * Math.pow(v.gap * 1e-3, 2)),
  },
  {
    key: "noise",
    name: "Balance noise floor",
    formula: "instrument spec",
    compute: (v) => v.noise * 1e-9,
  },
];

export type GateVerdict = "inside" | "marginal" | "candidate";

/** The gate's arithmetic: every channel, their sum, and the claim ÷ sum verdict. */
export function computeGate(v: GateValues) {
  const channels = CHANNEL_DEFS.map((c) => ({ ...c, value: c.compute(v) }));
  const sum = channels.reduce((a, c) => a + c.value, 0);
  const rss = Math.sqrt(channels.reduce((a, c) => a + c.value * c.value, 0));
  const claimN = v.claim * 1e-6;
  const ratio = sum > 0 ? claimN / sum : Infinity;
  const verdict: GateVerdict = ratio <= 1 ? "inside" : ratio <= 5 ? "marginal" : "candidate";
  const dominant = channels.reduce((a, c) => (c.value > a.value ? c : a), channels[0]);
  return { channels, sum, rss, claimN, ratio, verdict, dominant };
}
