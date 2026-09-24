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

/**
 * Guards for the corrections listed on the Errata tab that are words, not
 * numbers: each fails if the old text comes back. (Numerical fixes are
 * pinned by the engine and render tests next to the code they cover.)
 */
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
});
