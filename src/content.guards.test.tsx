import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import gateSrc from "./components/diagnostic/ArtifactBudgetGate.tsx?raw";
import acousticPanelSrc from "./components/AcousticCasimirPanel.tsx?raw";
import acousticModuleSrc from "./utils/acousticCasimir.ts?raw";
import homeSrc from "./components/HomePanel.tsx?raw";
import guideSrc from "./components/TeacherGuidePanel.tsx?raw";
import deviceNotesSrc from "./components/device/DeviceNotes.tsx?raw";
import DeviceModelPanel from "./components/DeviceModelPanel";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CORNER } from "./components/device/defaults";
import { formatPower } from "./utils/device";
import { formatDeltaG } from "./utils/format";
import ThrustPresetPicker from "./components/thrust/ThrustPresetPicker";
import PresetCard from "./components/thrust/PresetCard";
import TeacherGuidePanel from "./components/TeacherGuidePanel";
import NetworkPanel from "./components/NetworkPanel";
import ThrustDiagnosticPanel from "./components/ThrustDiagnosticPanel";
import DiagnosticPanel from "./components/DiagnosticPanel";
import { builtInPresets } from "./data/presetItems";
import appSrc from "./App.tsx?raw";
import gateModuleSrc from "./components/diagnostic/artifactGate.ts?raw";
import leakageSrc from "./utils/leakage.ts?raw";
import ExperimentDesignPanel from "./components/ExperimentDesignPanel";
import BoundaryAtlasPanel from "./components/BoundaryAtlasPanel";
import DarkCornersPanel from "./components/DarkCornersPanel";
import CasimirPanel from "./components/CasimirPanel";
import CircuitQEDPanel from "./components/CircuitQEDPanel";
import HomePanel from "./components/HomePanel";
import NmCavityPanel from "./components/NmCavityPanel";
import AcousticCasimirPanel from "./components/AcousticCasimirPanel";
import RotatingFieldPanel from "./components/RotatingFieldPanel";
import { AT_CLAIM } from "./components/device/defaults";
import { ED_QUALITY_FACTOR, assessDecidability } from "./utils/thermalFloor";
import { QUIETEST_RIG_ACCEL, darkEnergyTide } from "./utils/darkCorners";
import { casimirPressure } from "./utils/physics";
import { scaleVerdict, soundForceN } from "./utils/acousticCasimir";
import { PRESETS, computeGate } from "./components/diagnostic/artifactGate";
import { formatForceG } from "./utils/thrustLeakage";
import { grams } from "./utils/units";

/**
 * Guards for the corrections listed on the Errata tab, checked through the
 * rendered components where possible: each fails if the old behaviour or
 * text comes back. (Numerical fixes are also pinned by the engine tests
 * next to the code they cover.)
 */
const html = (el: JSX.Element) =>
  renderToString(<ThemeProvider>{el}</ThemeProvider>)
    .replace(/<!-- -->/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&");
describe("errata guards: citations and copy", () => {
  it("the EmDrive work is TU Dresden's SpaceDrive project, not \"SUPERDRAG\"", () => {
    expect(gateSrc).not.toMatch(/SUPERDRAG/i);
    expect(gateSrc).toContain("SpaceDrive");
  });

  it("the acoustic Casimir experiment is Larraza & Denardo", () => {
    for (const src of [acousticPanelSrc, acousticModuleSrc]) {
      expect(src).not.toMatch(/Puttermann|Larson/);
      expect(src).toContain("Larraza");
      expect(src).toContain("Denardo");
    }
  });

  it("no unsourced \"Manchester\" claim in the famous-claims copy", () => {
    expect(homeSrc).not.toContain("Manchester");
    expect(guideSrc).not.toContain("Manchester");
  });

  it("the Device Model no longer says the gap cannot close, and shows the corner ceiling", () => {
    expect(deviceNotesSrc).not.toContain("does not close");
    const html = renderToString(
      <ThemeProvider>
        <DeviceModelPanel />
      </ThemeProvider>
    ).replace(/<!-- -->/g, "");
    expect(html).toContain(formatPower(CORNER.P_output));
  });

  it("the Claim Registry weighs thrust claims in grams (0.1 g is 980.7 µN, not mN)", () => {
    expect(formatDeltaG(0.1)).toBe("1.00e-1 Δg (980.6650 μN)");
  });

  it("preset cards show the boundary badge through the real picker", () => {
    // The live bug: the picker looked stability up by object identity, so
    // cloud cards never showed the badge. Podkletnov is boundary-sensitive.
    expect(html(<ThrustPresetPicker onLoad={() => {}} />)).toContain("boundary-sensitive");
  });

  it("every preset card shows its source when expanded", () => {
    for (const item of builtInPresets()) {
      const out = html(<PresetCard item={item} onLoad={() => {}} initiallyExpanded />);
      expect(out).toContain("Source:");
      expect(out).toContain(item.source!.slice(0, 30));
    }
  });

  it("the Teacher's Guide labels Podkletnov's 2% as the 1997 claim", () => {
    const out = html(<TeacherGuidePanel />);
    expect(out).toContain("Podkletnov (1997 claim):");
    expect(out).not.toContain("Podkletnov (1992)");
  });

  it("the Replication Network calls median/√N a best case, not a detection limit", () => {
    const out = html(<NetworkPanel />);
    expect(out).toContain("best case");
    expect(out).not.toMatch(/honest detection limit/i);
  });

  it("the thrust pressure slider reaches hard vacuum", () => {
    expect(html(<ThrustDiagnosticPanel />)).toMatch(/aria-label="Ambient pressure[^"]*" min="-6"/);
  });

  it("the Leakage diagnostic shows the energy balance", () => {
    expect(html(<DiagnosticPanel />)).toMatch(/Energy balance: Output exceeds the known input/);
  });
});

describe("errata guards: claims no stronger than the model", () => {
  it("the thermal floor belongs to the modelled test mass, not to every instrument", () => {
    const ed = html(<ExperimentDesignPanel />);
    expect(ed).not.toMatch(/matter itself|made of atoms|unwitnessable|matter-based/i);
    expect(ed).toContain(`Q fixed at ${ED_QUALITY_FACTOR}`);
    const sub = assessDecidability(1e-12, { massKg: 0.1, freqHz: 100, qualityFactor: 100, tempK: 300, integrationS: 100 });
    expect(sub.verdict.key).toBe("sub-thermal");
    expect(`${sub.verdict.label} ${sub.verdict.description}`).not.toMatch(/by matter|made of atoms|unwitnessable/i);
    const atlas = html(<BoundaryAtlasPanel />);
    expect(atlas).not.toMatch(/made of\s+atoms|unwitnessable by matter|matter itself/i);
    expect(atlas).toContain("below this rig's thermal floor");
  });

  it("Dark Corners computes the tide's distance below the quietest rig", () => {
    const out = html(<DarkCornersPanel />);
    expect(out).toContain(`${(QUIETEST_RIG_ACCEL / darkEnergyTide(1)).toExponential(0)}× below the Brownian floor`);
    expect(out).not.toContain("3e+26");
    expect(out).not.toMatch(/arrangement of atoms|human or alien|as far as we know, the same/);
    expect(out).toContain("Jaffe");
  });

  it("the Casimir notes call micron-scale forces measured, not negligible", () => {
    const out = html(<CasimirPanel />);
    expect(out).not.toMatch(/negligible above/i);
    expect(out).toContain(`${Math.abs(casimirPressure(1e-6)).toExponential(1)} Pa`);
    expect(out).toContain("0.6–6 µm");
  });

  it("the Device Model's notes quote the survivable shortfall, not 'no tuning'", () => {
    const out = html(<DeviceModelPanel />);
    expect(out).not.toMatch(/No tuning of the included physics/);
    expect(out).toContain(`stays ${(AT_CLAIM.shortfall / 1e4).toExponential(0)}× short`);
  });

  it("Circuit QED tells both microwave routes: 2011 speed, 2013 cavity", () => {
    const out = html(<CircuitQEDPanel />);
    expect(out).not.toMatch(/not speed|The one place/);
    expect(out).toContain("Lähteenmäki");
    expect(out).toContain("5% of c");
    const home = html(<HomePanel />);
    expect(home).not.toMatch(/the only experiments|vacuum energy extraction actually works|the truth about your experiment/);
  });

  it("the Teacher's Guide does not call the (v/c)² model 'thermodynamics'", () => {
    const out = html(<TeacherGuidePanel />);
    expect(out).not.toMatch(/it's thermodynamics|cosmological reality/);
    expect(out).toContain("model's physics");
  });

  it("the nm-cavity puts a 50 nm gap in the deep UV and flags the metal's plasma edge", () => {
    const out = html(<NmCavityPanel />);
    expect(out).not.toMatch(/soft-X-ray regime/);
    expect(out).toContain("deep (vacuum) ultraviolet");
    expect(out).toContain("gold's plasma frequency");
  });

  it("the acoustic build is radiation pressure with real null tests", () => {
    const out = html(<AcousticCasimirPanel />);
    expect(out).not.toMatch(/fluctuation measurement|the difference is the radiation pressure|numbers are the floor/);
    expect(out).toContain("absorbing one of the same mass");
    expect(out).toContain("not a fluctuation force");
    expect(appSrc).not.toContain("the one fluctuation force");
    expect(scaleVerdict(soundForceN(120, 0.01, true)).description).not.toMatch(/fluctuation/);
  });

  it("the EmDrive preset carries the thermal drift TU Dresden measured", () => {
    const g = computeGate(PRESETS.eagleworks.values);
    expect(PRESETS.eagleworks.values.cth).toBeGreaterThanOrEqual(500); // nN/W; measured ≈ 1 µN/W
    expect(g.dominant.key).toBe("thermal");
    expect(g.verdict).not.toBe("candidate");
    expect(PRESETS.eagleworks.note).toMatch(/illustrative/);
    expect(PRESETS.eagleworks.note).not.toMatch(/Long unshielded DC run/);
    expect(gateModuleSrc).not.toMatch(/SUPERDRAG/i);
  });

  it("budgets count their own channels and blame missing ones before physics", () => {
    const out = html(<DiagnosticPanel />);
    expect(out).toContain("sums five mundane power");
    expect(out).not.toContain("wrong by many orders of magnitude");
    expect(leakageSrc).not.toContain("wrong by many orders of magnitude");
  });

  it("small units: atlas rim computed, wavelengths in m/km, µg not ug", () => {
    const atlas = html(<BoundaryAtlasPanel />);
    expect(atlas).not.toContain("458 m/s");
    expect(atlas).toContain("446 m/s rim");
    const rot = html(<RotatingFieldPanel />);
    expect(rot).not.toMatch(/\d{5,}\.\d\d mm/);
    expect(rot).toContain("599.6 m");
    expect(rot).toContain("never matches");
    expect(formatForceG(grams(5e-4))).toBe("500.00 µg");
    expect(appSrc).not.toContain("collective detection floor");
  });
});
