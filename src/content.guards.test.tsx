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
import { formatPower, predictDevice } from "./utils/device";
import { formatDeltaG } from "./utils/format";
import ThrustPresetPicker from "./components/thrust/ThrustPresetPicker";
import PresetCard from "./components/thrust/PresetCard";
import TeacherGuidePanel from "./components/TeacherGuidePanel";
import LabWorksheetPanel from "./components/LabWorksheetPanel";
import NetworkPanel from "./components/NetworkPanel";
import ThrustDiagnosticPanel from "./components/ThrustDiagnosticPanel";
import DiagnosticPanel from "./components/DiagnosticPanel";
import { builtInPresets } from "./data/presetItems";
import appSrc from "./App.tsx?raw";
import gateModuleSrc from "./components/diagnostic/artifactGate.ts?raw";
import leakageSrc from "./utils/leakage.ts?raw";
import thrustLeakageSrc from "./utils/thrustLeakage.ts?raw";
import uncertaintySrc from "./utils/uncertainty.ts?raw";
import diagReportSrc from "./components/diagnostic/DiagnosticReport.tsx?raw";
import thrustReportSrc from "./components/thrust/ThrustReport.tsx?raw";
import dceLimitSrc from "./components/thrust/ThrustDceLimit.tsx?raw";
import edSrc from "./components/ExperimentDesignPanel.tsx?raw";
import networkPanelSrc from "./components/NetworkPanel.tsx?raw";
import networkCensusSrc from "./utils/networkCensus.ts?raw";
import DeviceSanity from "./components/device/DeviceSanity";
import { DEVICE_DEFAULTS } from "./components/device/defaults";
import NonlinearCouplingPanel from "./components/NonlinearCouplingPanel";
import { g2Correlations } from "./utils/correlation";
import { THRUST_PRESETS } from "./data/thrustPresets";
import { computeThrustBudget } from "./utils/thrustLeakage";
import { DM_PARTICLE_GEV, darkMatterFlux } from "./utils/darkCorners";
import ExperimentDesignPanel from "./components/ExperimentDesignPanel";
import BoundaryAtlasPanel from "./components/BoundaryAtlasPanel";
import DarkCornersPanel from "./components/DarkCornersPanel";
import CasimirPanel from "./components/CasimirPanel";
import CircuitQEDPanel from "./components/CircuitQEDPanel";
import HomePanel from "./components/HomePanel";
import NmCavityPanel from "./components/NmCavityPanel";
import AcousticCasimirPanel from "./components/AcousticCasimirPanel";
import RotatingFieldPanel from "./components/RotatingFieldPanel";
import { AT_CLAIM, CLAIM_REACH_GAP_NM } from "./components/device/defaults";
import { RIM_SPEED_LIMIT_M_S } from "./utils/device";
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
    expect(out).not.toMatch(/No tuning of the included physics|granting a geometric factor/);
    expect(out).toContain(`${AT_CLAIM.shortfall.toExponential(1)}× short even with every other`);
    expect(out).toContain(`gaps below about ${CLAIM_REACH_GAP_NM.toFixed(0)} nm`);
  });

  it("rotors burst by rim speed (hoop stress), not by a 10⁶ g acceleration", () => {
    const out = html(<DeviceModelPanel />);
    expect(out).not.toMatch(/10⁶ g|shatters/);
    expect(out).toContain(`bursts near ${RIM_SPEED_LIMIT_M_S.toFixed(0)} m/s`);
    expect(AT_CLAIM.v).toBeLessThan(RIM_SPEED_LIMIT_M_S); // the claim-drive rotor survives
    expect(CORNER.v).toBeGreaterThan(RIM_SPEED_LIMIT_M_S); // the corner rotor does not
    const atlas = html(<BoundaryAtlasPanel />);
    expect(atlas).not.toMatch(/rotor shatters|10⁶ g material veto/);
    expect(html(<TeacherGuidePanel />)).toContain("Then the fifth knob:");
  });

  it("Circuit QED tells both microwave routes: 2011 speed, 2013 cavity", () => {
    const out = html(<CircuitQEDPanel />);
    expect(out).not.toMatch(/not speed|The one place/);
    expect(out).toContain("Lähteenmäki");
    expect(out).toContain("5% of c");
    const home = html(<HomePanel />);
    expect(home).not.toMatch(/the only experiment\b|one way it was actually done|vacuum energy extraction actually works|the truth about your experiment/);
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

describe("errata guards: verdicts and copy say only what the model computes", () => {
  it("explained / partial / excess verdicts claim no more than their branch", () => {
    for (const src of [leakageSrc, thrustLeakageSrc, uncertaintySrc, diagReportSrc, thrustReportSrc]) {
      expect(src).not.toMatch(/exceeds every plausible|account for the entire claimed|uncertainties included|residual is within the uncertainty of the/);
    }
    const diag = html(<DiagnosticPanel />);
    expect(diag).not.toMatch(/truly exceeds every leakage channel|quantitatively reproduced|drops to\s+zero as T_h/);
    expect(html(<ThrustDiagnosticPanel />)).not.toMatch(/quantitatively reproduced|comprehensive referee|all known artifact channels|computes every known/);
    expect(gateSrc).not.toMatch(/fully reproducible by known artifacts/);
    expect(dceLimitSrc).not.toMatch(/Maximum possible|cannot explain the claim by orders of magnitude/);
  });

  it("Dark Corners states its assumptions and compares like with like", () => {
    const out = html(<DarkCornersPanel />);
    expect(out).not.toMatch(/precisely none|measured physics|million times fainter than the quietest/);
    expect(out).toContain(`an assumed ${DM_PARTICLE_GEV} GeV particle`);
    expect(out).toContain(`${(20e-6 / darkMatterFlux().hypotheticalPressurePa).toExponential(0)}× smaller than the pressure swing`);
  });

  it("Circuit QED's thermal line, g² text and speed comparison follow the live model", () => {
    const out = html(<CircuitQEDPanel />);
    expect(out).not.toMatch(/nothing to detect|slower than a jet turbine|λ²\/κ gives|mechanics cannot offer/);
    expect(out).toContain("(λ/κ)² gives nₚ");
    const masked = g2Correlations(0.1, 0.5);
    expect(masked.description).not.toMatch(/indistinguishable from noise heating/);
    expect(html(<NonlinearCouplingPanel />)).not.toMatch(/conversion rate is set by|yields microwave photons/);
  });

  it("the Lifter tagline names the channel the budget credits", () => {
    expect(THRUST_PRESETS["Lifter (Ionocraft) Classic"].tagline).not.toMatch(/just pushing air/);
    const b = computeThrustBudget(THRUST_PRESETS["Lifter (Ionocraft) Classic"].params);
    const top = b.channels.reduce((a, c) => (c.valueG > a.valueG ? c : a));
    expect(top.key).toBe("electrostatic");
    expect(THRUST_PRESETS["Lifter (Ionocraft) Classic"].tagline).toMatch(/electrostatic allowance/);
    expect(homeSrc).not.toMatch(/attribute the weight change to vibration and corona|account for it, with uncertainties/);
  });

  it("units and labels: milli-g, runs not rigs, no 'impossible', live sideband check", () => {
    // The fleet cards only render with live data, so check the sources too.
    expect(html(<NetworkPanel />)).not.toMatch(/mΔg|independent census runs/);
    for (const src of [networkPanelSrc, networkCensusSrc]) {
      expect(src).not.toMatch(/mΔg|Rigs filed|independent census runs|needs ≥ 5 rigs|Quietest rig|Median rig/);
    }
    // The phone path files raw m/s²; the profile converts to milli-g once.
    expect(networkPanelSrc).not.toMatch(/aY \* M_S2_TO_MILLIG/);
    expect(edSrc).not.toContain('"impossible"');
    const dev = html(<DeviceModelPanel />);
    expect(dev).not.toContain("Energy conservation  (no over-unity)");
    expect(dev).toContain("Model vs claim  (shortfall = 1.3 W ÷ predicted)");
    expect(dev).toMatch(/fₘ = 500\.00 kHz vs γ\/2/);
    // Out of slider range, but the check must follow fₘ, not a fixed 500 kHz.
    const narrow = { ...predictDevice(DEVICE_DEFAULTS), gammaHz: 2e6 };
    expect(html(<DeviceSanity p={narrow} Q={1e4} beta={0.3} fmHz={5e6} />)).toContain("outside the linewidth");
  });
});

describe("errata guards: the 1.3 W claim is labelled illustrative", () => {
  it("no page presents the unsourced figure as an experimental or typical real claim", () => {
    const dev = html(<DeviceModelPanel />);
    expect(dev).not.toMatch(/experimental claim|real-world claims advertise/i);
    expect(dev).toContain("Illustrative claim (no published source)");
    expect(html(<LabWorksheetPanel />)).not.toMatch(/Real claims are often|to real claims/);
    expect(html(<TeacherGuidePanel />)).not.toContain("Claimed power: 1.3 W");
    expect(appSrc).not.toMatch(/experimental claim/i);
    expect(html(<BoundaryAtlasPanel />)).toContain("illustrative 1.3 W claim");
  });
});
