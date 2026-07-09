import { useState, useMemo } from "react";

/*
  IN FINI — MODULE: ARTIFACT BUDGET GATE
  --------------------------------------
  The referee for anomalous thrust claims.

  Every channel below is standard, published metrology physics:

    1. Photon pressure        F = η · P / c
    2. Magnetic cable force   F = I · L_eff · B          (uncompensated current × ambient field)
    3. Thermal balance drift  F = c_th · P               (empirical drift coefficient, nN/W)
    4. Gas-dynamic / outgas   F = ε · p · A              (accommodation asymmetry on device area)
    5. Electrostatic          F = ε₀ · A_es · V² / 2d²
    6. Balance noise floor    F = direct instrument spec

  A claimed thrust that sits inside the summed budget is not a discovery.
  A claim needs to clear the budget by ~5× before it earns the word "anomaly".
  This is the gate the EmDrive failed (Tajmar et al., SUPERDRAG, TU Dresden).
*/

const C_LIGHT = 2.998e8;
const EPS0 = 8.854e-12;

const PALETTE = {
  bg: "#101418",
  panel: "#171d24",
  panelEdge: "#232c36",
  ink: "#e8edf2",
  dim: "#8a97a5",
  faint: "#5a6672",
  claim: "#ffb454", // phosphor amber — the needle
  channel: "#6fd3e0", // instrument cyan — the budget
  pass: "#6fe0a8",
  fail: "#ff5d5d",
  warn: "#ffd66f",
};

interface GateValues {
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

interface PresetConfig {
  label: string;
  note: string;
  values: GateValues;
}

const PRESETS: Record<string, PresetConfig> = {
  eagleworks: {
    label: "Eagleworks 2016 (EmDrive)",
    note: "80 W RF, ~100 µN claimed. Long unshielded DC run in Earth's field.",
    values: {
      claim: 100, P: 80, leak: 0.5, I: 2.2, Leff: 1.0, B: 50,
      pressure: 1e-5, area: 100, epsGas: 0.005, cth: 20,
      V: 40, Aes: 1, gap: 2, noise: 100,
    },
  },
  shielded: {
    label: "Clean lab (SUPERDRAG-style)",
    note: "Mu-metal shielding, twisted pairs, liquid-metal contacts. What a claim must beat.",
    values: {
      claim: 100, P: 80, leak: 0.1, I: 2.2, Leff: 0.02, B: 1,
      pressure: 1e-7, area: 100, epsGas: 0.001, cth: 2,
      V: 5, Aes: 1, gap: 5, noise: 20,
    },
  },
};

interface ChannelDef {
  key: string;
  name: string;
  formula: string;
  compute: (v: GateValues) => number;
}

const CHANNEL_DEFS: ChannelDef[] = [
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

function fmtForce(N: number): string {
  if (!isFinite(N)) return "—";
  const a = Math.abs(N);
  if (a >= 1e-3) return (N * 1e3).toPrecision(3) + " mN";
  if (a >= 1e-6) return (N * 1e6).toPrecision(3) + " µN";
  return (N * 1e9).toPrecision(3) + " nN";
}

// ---------- log-scale force ruler (the signature element) ----------

interface ForceRulerProps {
  channels: (ChannelDef & { value: number })[];
  sum: number;
  claim: number;
}

function ForceRuler({ channels, sum, claim }: ForceRulerProps) {
  const W = 720, H = 168, X0 = 24, X1 = 700;
  const LOG_MIN = 0; // 1 nN
  const LOG_MAX = 7; // 10 mN
  const x = (N: number) => {
    const nN = Math.max(N / 1e-9, 1e-4);
    const t = (Math.log10(nN) - LOG_MIN) / (LOG_MAX - LOG_MIN);
    return X0 + Math.min(Math.max(t, 0), 1) * (X1 - X0);
  };
  const ticks: [number, string][] = [
    [1e-9, "1 nN"], [1e-8, "10"], [1e-7, "100"], [1e-6, "1 µN"],
    [1e-5, "10"], [1e-4, "100"], [1e-3, "1 mN"], [1e-2, "10"],
  ];
  const axisY = 118;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: "100%", height: "auto", display: "block" }}
      role="img"
      aria-label="Log-scale force ruler comparing claimed thrust to artifact budget"
    >
      {/* axis */}
      <line x1={X0} y1={axisY} x2={X1} y2={axisY} stroke={PALETTE.panelEdge} strokeWidth="2" />
      {ticks.map(([N, label]) => (
        <g key={label + N}>
          <line x1={x(N)} y1={axisY - 5} x2={x(N)} y2={axisY + 5} stroke={PALETTE.faint} />
          <text x={x(N)} y={axisY + 22} fill={PALETTE.dim} fontSize="11"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" textAnchor="middle">
            {label}
          </text>
        </g>
      ))}
      {/* budget region shading: everything at or below the summed budget is dead ground */}
      <rect x={X0} y={axisY - 46} width={Math.max(x(sum) - X0, 0)} height={46}
        fill={PALETTE.channel} opacity="0.07" />
      {/* channel lollipops */}
      {channels.map((c, i) => (
        <g key={c.key}>
          <line x1={x(c.value)} y1={axisY} x2={x(c.value)} y2={axisY - 24 - (i % 3) * 10}
            stroke={PALETTE.channel} strokeWidth="1.5" opacity="0.75" />
          <circle cx={x(c.value)} cy={axisY - 24 - (i % 3) * 10} r="3.5"
            fill={PALETTE.channel} opacity="0.9" />
        </g>
      ))}
      {/* summed budget marker */}
      <g>
        <line x1={x(sum)} y1={axisY - 52} x2={x(sum)} y2={axisY} stroke={PALETTE.ink} strokeWidth="2" />
        <rect x={x(sum) - 4.5} y={axisY - 61} width="9" height="9"
          transform={`rotate(45 ${x(sum)} ${axisY - 56.5})`} fill={PALETTE.ink} />
        <text x={x(sum)} y={axisY - 68} fill={PALETTE.ink} fontSize="11" textAnchor="middle"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">
          Σ budget
        </text>
      </g>
      {/* claim needle */}
      <g>
        <line x1={x(claim)} y1={axisY - 86} x2={x(claim)} y2={axisY + 6}
          stroke={PALETTE.claim} strokeWidth="2.5" />
        <text x={x(claim)} y={axisY - 94} fill={PALETTE.claim} fontSize="12" textAnchor="middle"
          fontWeight="700" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">
          claim
        </text>
      </g>
    </svg>
  );
}

// ---------- small labelled numeric input ----------

interface FieldProps {
  label: string;
  unit?: string;
  value: number;
  onChange: (val: number) => void;
  step?: string;
}

function Field({ label, unit, value, onChange, step }: FieldProps) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
      <span style={{
        fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase",
        color: PALETTE.dim, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>
        {label}{unit ? <span style={{ color: PALETTE.faint }}> · {unit}</span> : null}
      </span>
      <input
        type="number"
        value={value}
        step={step || "any"}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        style={{
          background: PALETTE.bg, color: PALETTE.ink,
          border: `1px solid ${PALETTE.panelEdge}`, borderRadius: 6,
          padding: "6px 8px", fontSize: 13, width: "100%", boxSizing: "border-box",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        }}
      />
    </label>
  );
}

interface ChannelGroupProps {
  title: string;
  contribution: string;
  children: React.ReactNode;
}

function ChannelGroup({ title, contribution, children }: ChannelGroupProps) {
  return (
    <fieldset style={{
      border: `1px solid ${PALETTE.panelEdge}`, borderRadius: 10,
      padding: "10px 12px 12px", margin: 0, background: PALETTE.panel,
    }}>
      <legend style={{
        padding: "0 6px", fontSize: 11, letterSpacing: "0.1em",
        textTransform: "uppercase", color: PALETTE.dim,
      }}>
        {title}
        <span style={{
          color: PALETTE.channel, marginLeft: 8,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          textTransform: "none", letterSpacing: 0,
        }}>
          {contribution}
        </span>
      </legend>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 10 }}>
        {children}
      </div>
    </fieldset>
  );
}

// ---------- main ----------

export default function ArtifactBudgetGate() {
  const [v, setV] = useState<GateValues>(PRESETS.eagleworks.values);
  const [activePreset, setActivePreset] = useState<string | null>("eagleworks");

  const set = (key: keyof GateValues) => (val: number) => {
    setV((prev) => ({ ...prev, [key]: val }));
    setActivePreset(null);
  };

  const channels = useMemo(
    () => CHANNEL_DEFS.map((c) => ({ ...c, value: c.compute(v) })),
    [v]
  );
  const sum = channels.reduce((a, c) => a + c.value, 0);
  const rss = Math.sqrt(channels.reduce((a, c) => a + c.value * c.value, 0));
  const claimN = v.claim * 1e-6;
  const ratio = sum > 0 ? claimN / sum : Infinity;

  let verdict: string, verdictColor: string, verdictDetail: string;
  if (ratio <= 1) {
    verdict = "INSIDE BUDGET — NO ANOMALY";
    verdictColor = PALETTE.fail;
    verdictDetail =
      "The claimed thrust is fully reproducible by known artifacts. This is a null result, and null results are findings: publish the budget, not the claim.";
  } else if (ratio <= 5) {
    verdict = "MARGINAL — INDISTINGUISHABLE";
    verdictColor = PALETTE.warn;
    verdictDetail =
      "The claim exceeds the budget but not by enough to survive systematic error in the budget itself. Tighten the dominant channel before saying anything in public.";
  } else {
    verdict = "CANDIDATE ANOMALY — ESCALATE";
    verdictColor = PALETTE.pass;
    verdictDetail =
      "The claim clears the summed budget by more than 5×. Now the real work starts: independent replication on a second balance, blinded analysis, pre-registered protocol.";
  }

  const dominant = channels.reduce((a, c) => (c.value > a.value ? c : a), channels[0]);

  const applyPreset = (key: string) => {
    setV(PRESETS[key].values);
    setActivePreset(key);
  };

  return (
    <div style={{
      background: PALETTE.bg, color: PALETTE.ink, minHeight: "100vh",
      fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      padding: "clamp(14px, 3vw, 32px)",
    }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>

        {/* header */}
        <header style={{ marginBottom: 20 }}>
          <div style={{
            fontSize: 11, letterSpacing: "0.22em", color: PALETTE.dim,
            textTransform: "uppercase", marginBottom: 6,
          }}>
            In Fini · Diagnostic Module
          </div>
          <h1 style={{ margin: 0, fontSize: "clamp(22px, 3.4vw, 32px)", fontWeight: 750, letterSpacing: "-0.01em" }}>
            Artifact Budget Gate
          </h1>
          <p style={{ color: PALETTE.dim, maxWidth: 640, fontSize: 14, lineHeight: 1.55, marginTop: 8 }}>
            Enter an anomalous-thrust experiment. The gate computes every known
            artifact channel and tells you whether the claimed signal survives.
            A claim that lives inside the budget is not a discovery — the budget is.
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            {Object.entries(PRESETS).map(([key, p]) => (
              <button key={key} onClick={() => applyPreset(key)} title={p.note}
                style={{
                  background: activePreset === key ? PALETTE.panelEdge : PALETTE.panel,
                  color: PALETTE.ink, border: `1px solid ${PALETTE.panelEdge}`,
                  borderRadius: 8, padding: "7px 12px", fontSize: 12.5, cursor: "pointer",
                }}>
                Load: {p.label}
              </button>
            ))}
          </div>
        </header>

        {/* verdict + ruler */}
        <section style={{
          background: PALETTE.panel, border: `1px solid ${PALETTE.panelEdge}`,
          borderRadius: 14, padding: "18px 18px 8px", marginBottom: 18,
        }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "baseline", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: PALETTE.dim }}>
                Verdict
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: verdictColor, letterSpacing: "0.02em" }}>
                {verdict}
              </div>
            </div>
            <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 13, color: PALETTE.dim, textAlign: "right" }}>
              claim {fmtForce(claimN)} · Σ budget {fmtForce(sum)} · RSS {fmtForce(rss)}<br />
              claim / budget = <span style={{ color: verdictColor, fontWeight: 700 }}>{isFinite(ratio) ? ratio.toFixed(2) + "×" : "∞"}</span>
              {" · "}dominant: {dominant.name.toLowerCase()}
            </div>
          </div>
          <ForceRuler channels={channels} sum={sum} claim={claimN} />
          <p style={{ color: PALETTE.dim, fontSize: 13, lineHeight: 1.5, margin: "0 0 12px", maxWidth: 760 }}>
            {verdictDetail}
          </p>
        </section>

        {/* inputs */}
        <section style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
          <ChannelGroup title="The claim" contribution={fmtForce(claimN)}>
            <Field label="Claimed thrust" unit="µN" value={v.claim} onChange={set("claim")} />
            <Field label="Input power P" unit="W" value={v.P} onChange={set("P")} />
          </ChannelGroup>

          <ChannelGroup title="Photon pressure" contribution={fmtForce(channels[0].value)}>
            <Field label="EM leakage fraction η" unit="0–1" value={v.leak} onChange={set("leak")} step="0.05" />
          </ChannelGroup>

          <ChannelGroup title="Magnetic coupling" contribution={fmtForce(channels[1].value)}>
            <Field label="Supply current I" unit="A" value={v.I} onChange={set("I")} />
            <Field label="Uncompensated length" unit="m" value={v.Leff} onChange={set("Leff")} />
            <Field label="Ambient field B" unit="µT" value={v.B} onChange={set("B")} />
          </ChannelGroup>

          <ChannelGroup title="Thermal drift" contribution={fmtForce(channels[2].value)}>
            <Field label="Drift coefficient c_th" unit="nN/W" value={v.cth} onChange={set("cth")} />
          </ChannelGroup>

          <ChannelGroup title="Gas-dynamic" contribution={fmtForce(channels[3].value)}>
            <Field label="Chamber pressure" unit="mbar" value={v.pressure} onChange={set("pressure")} />
            <Field label="Device area" unit="cm²" value={v.area} onChange={set("area")} />
            <Field label="Asymmetry ε" unit="0–1" value={v.epsGas} onChange={set("epsGas")} step="0.001" />
          </ChannelGroup>

          <ChannelGroup title="Electrostatic" contribution={fmtForce(channels[4].value)}>
            <Field label="Potential V" unit="V" value={v.V} onChange={set("V")} />
            <Field label="Facing area" unit="cm²" value={v.Aes} onChange={set("Aes")} />
            <Field label="Gap d" unit="mm" value={v.gap} onChange={set("gap")} />
          </ChannelGroup>

          <ChannelGroup title="Instrument floor" contribution={fmtForce(channels[5].value)}>
            <Field label="Balance noise floor" unit="nN" value={v.noise} onChange={set("noise")} />
          </ChannelGroup>
        </section>

        {/* channel table */}
        <section style={{
          background: PALETTE.panel, border: `1px solid ${PALETTE.panelEdge}`,
          borderRadius: 14, padding: 16, marginTop: 18,
        }}>
          <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: PALETTE.dim, marginBottom: 10 }}>
            Budget ledger
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ color: PALETTE.dim, textAlign: "left" }}>
                  <th style={{ padding: "6px 8px", fontWeight: 600 }}>Channel</th>
                  <th style={{ padding: "6px 8px", fontWeight: 600 }}>Model</th>
                  <th style={{ padding: "6px 8px", fontWeight: 600, textAlign: "right" }}>Force</th>
                  <th style={{ padding: "6px 8px", fontWeight: 600, textAlign: "right" }}>% of Σ</th>
                </tr>
              </thead>
              <tbody style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                {channels.map((c) => (
                  <tr key={c.key} style={{ borderTop: `1px solid ${PALETTE.panelEdge}` }}>
                    <td style={{ padding: "7px 8px", fontFamily: "system-ui, sans-serif" }}>{c.name}</td>
                    <td style={{ padding: "7px 8px", color: PALETTE.dim }}>{c.formula}</td>
                    <td style={{ padding: "7px 8px", textAlign: "right", color: PALETTE.channel }}>{fmtForce(c.value)}</td>
                    <td style={{ padding: "7px 8px", textAlign: "right", color: PALETTE.dim }}>
                      {sum > 0 ? ((c.value / sum) * 100).toFixed(1) + "%" : "—"}
                    </td>
                  </tr>
                ))}
                <tr style={{ borderTop: `2px solid ${PALETTE.panelEdge}`, fontWeight: 700 }}>
                  <td style={{ padding: "7px 8px", fontFamily: "system-ui, sans-serif" }}>Σ artifact budget</td>
                  <td style={{ padding: "7px 8px", color: PALETTE.dim }}>linear sum (conservative)</td>
                  <td style={{ padding: "7px 8px", textAlign: "right" }}>{fmtForce(sum)}</td>
                  <td style={{ padding: "7px 8px", textAlign: "right" }}>100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* protocol footer */}
        <footer style={{ color: PALETTE.faint, fontSize: 12.5, lineHeight: 1.6, margin: "18px 4px 8px", maxWidth: 780 }}>
          Gate protocol: pre-register the setup and budget <em>before</em> powering on ·
          run the null configuration (device rotated 90°, dummy load) at full power ·
          a signal must clear Σ budget by ≥5× and survive replication on a second balance.
          Surviving the budget is necessary, not sufficient.
        </footer>
      </div>
    </div>
  );
}
