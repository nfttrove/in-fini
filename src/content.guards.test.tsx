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
