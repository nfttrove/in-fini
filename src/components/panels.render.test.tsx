import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import CircuitQEDPanel from "./CircuitQEDPanel";
import ClaimRegistryPanel from "./ClaimRegistryPanel";
import ExperimentDesignPanel from "./ExperimentDesignPanel";
import DataLabPanel from "./DataLabPanel";
import DarkCornersPanel from "./DarkCornersPanel";
import LabWorksheetPanel from "./LabWorksheetPanel";
import TeacherGuidePanel from "./TeacherGuidePanel";
import { DEVICE_DEFAULTS, DEVICE_PUSHED } from "./device/defaults";
import { summarizePreset } from "../data/thrustPresets";
import { formatPower, predictDevice } from "../utils/device";
import ThrustDceLimit from "./thrust/ThrustDceLimit";
import ErrataPanel from "./ErrataPanel";
import { ERRATA } from "../data/errata";
import { CORNER } from "./device/defaults";
import { computeThrustBudget, formatForceG, ionWindForceG } from "../utils/thrustLeakage";
import { THRUST_PRESETS } from "../data/thrustPresets";
import { grams } from "../utils/units";
import { ThemeProvider } from "../contexts/ThemeContext";

/**
 * Render smoke tests: the panels compute their headline numbers during
 * render (physics in useMemo, not effects), so a server render with
 * default parameters exercises the full JSX path and the physics modules.
 * Theme-wrapped because chart canvases read the active theme.
 */
describe("CircuitQEDPanel render", () => {
  it("renders with default Wilson-2011-style parameters and a verdict", () => {
    const html = renderToString(
      <ThemeProvider>
        <CircuitQEDPanel />
      </ThemeProvider>
    );
    expect(html).toContain("dynamical Casimir effect");
    // Default verdict in the cold, resonant regime:
    expect(html).toContain("Vacuum pairs measurable");
    expect(html).toContain("Pair production rate");
    // New sections: pump scan + g² correlation.
    expect(html).toContain("2·f₀ resonance");
    expect(html).toContain("Cauchy");
  });
});

describe("ClaimRegistryPanel render", () => {
  it("renders the power-claim form with a computed budget and verdict", () => {
    const html = renderToString(
      <ThemeProvider>
        <ClaimRegistryPanel />
      </ThemeProvider>
    );
    expect(html).toContain("File a claim. Get a budget");
    // Power claims also get the energy balance: output vs known input.
    expect(html.replace(/<!-- -->/g, "")).toContain("Energy balance: Output exceeds the known input");
    // Unconfigured backend (no env in tests): local budget still shows.
    expect(html).toContain("The budget&#x27;s verdict");
    expect(html).toContain("Claimed");
  });
});

describe("ExperimentDesignPanel render", () => {
  it("inverts the thrust budget into rig requirements at 2σ", () => {
    const html = renderToString(
      <ThemeProvider>
        <ExperimentDesignPanel />
      </ThemeProvider>
    );
    expect(html).toContain("What your rig must achieve");
    expect(html).toContain("Vibration amplitude below");
    expect(html).toContain("Per-channel artifact allowance");
  });

  it("flips to power mode requirements via props-free default render", () => {
    const html = renderToString(
      <ThemeProvider>
        <ExperimentDesignPanel />
      </ThemeProvider>
    );
    expect(html).toContain("Per-channel artifact allowance");
    expect(html).toContain("necessary conditions");
  });
});

describe("DataLabPanel render", () => {
  it("shows the paste-area and challenge mode entry", () => {
    const html = renderToString(
      <ThemeProvider>
        <DataLabPanel />
      </ThemeProvider>
    );
    expect(html).toContain("Analyze my data");
    expect(html).toContain("Artifact or anomaly? (game)");
    expect(html).toContain("nothing is uploaded");
  });
});

describe("DarkCornersPanel render", () => {
  it("shows the daily dark-matter mass in nanograms, matching its own prose", () => {
    const html = renderToString(
      <ThemeProvider>
        <DarkCornersPanel />
      </ThemeProvider>
    );
    // ρ·v·86400 s ≈ 1.0e-11 kg = ~10 ng per m² per day. The tile once
    // multiplied kg by 1e9 (µg) and printed "0.0 ng" beside "about ten
    // nanograms" in the text.
    expect(html).toContain("About ten nanograms");
    const ng = Number(html.match(/([\d.]+) ng</)?.[1]);
    expect(ng).toBeGreaterThan(5);
    expect(ng).toBeLessThan(20);
  });
});

describe("Lab Worksheet and Teacher's Guide quote the engines", () => {
  // Server rendering puts <!-- --> between adjacent text nodes and escapes
  // quotes; undo both so the sentences read as the user sees them.
  const text = (el: JSX.Element) =>
    renderToString(<ThemeProvider>{el}</ThemeProvider>)
      .replace(/<!-- -->/g, "")
      .replace(/&quot;/g, '"');

  it("worksheet expects the Device Model's actual default reading", () => {
    const html = text(<LabWorksheetPanel />);
    expect(html).toContain(`Should be ~${formatPower(predictDevice(DEVICE_DEFAULTS).P_output)}.`);
    expect(html).not.toContain("5 µW");
    expect(html).toContain(`should show "${summarizePreset("Podkletnov Effect (1997 claim)").verdict}"`);
    // Part 3 uses controls the Cavity Coupling tab actually has.
    expect(html).not.toContain("cavity gap to 100 nm");
  });

  it("guide's pushed-knob numbers are the model's, not the old 100 µW / 10,000×", () => {
    const html = text(<TeacherGuidePanel />);
    const pushed = predictDevice(DEVICE_PUSHED);
    expect(html).toContain(`Predicted power: ${formatPower(pushed.P_output)}`);
    expect(html).toContain(`Shortfall: ${pushed.shortfall.toExponential(1)}×`);
    expect(html).not.toContain("100 µW");
    expect(html).not.toContain("10,000×");
    expect(html).toContain(summarizePreset("Searl Effect Generator (SEG)").verdict);
  });
});

describe("ExperimentDesignPanel requirement wording", () => {
  it("marks requirements the default rig already meets as met, not as needs", () => {
    const html = renderToString(
      <ThemeProvider>
        <ExperimentDesignPanel />
      </ThemeProvider>
    ).replace(/<!-- -->/g, "");
    // Default: 2 K/m is inside its allowance; vibration and 10 kV are not
    // (ion wind needs ~1.6 kV), and the stray field is an absolute limit.
    expect(html).toContain("already satisfies this");
    expect(html).toMatch(/need [\d.]+e-\d+× today&#x27;s value/);
    expect(html).not.toContain("of today&#x27;s value");
    expect(html).toContain("absolute requirement");
  });
});

describe("ThrustDceLimit units", () => {
  it("shows dceThrustLimitG as grams, and the claim ratio against grams", () => {
    // dceThrustLimitG returns grams like every channel; the card once
    // treated it as milligrams — ceiling 1000× too small, ratio 1000× too big.
    const budget = computeThrustBudget(THRUST_PRESETS["Podkletnov Effect (1997 claim)"].params);
    const html = renderToString(<ThrustDceLimit dceThrustLimitG={grams(1.5e-27)} budget={budget} />)
      .replace(/<!-- -->/g, "");
    expect(html).toContain(formatForceG(grams(1.5e-27)));
    expect(html).toContain(`${((budget.claimedG / 1.5e-27) * 100).toExponential(1)}%`);
  });
});

describe("ErrataPanel", () => {
  it("lists every erratum and quotes current values computed by the engines", () => {
    const html = renderToString(
      <ThemeProvider>
        <ErrataPanel />
      </ThemeProvider>
    ).replace(/<!-- -->/g, "");
    for (const e of ERRATA) {
      expect(html).toContain(e.title.replace(/"/g, "&quot;").replace(/'/g, "&#x27;"));
    }
    // "Now" figures come from the same functions the panels use.
    expect(html).toContain(formatForceG(ionWindForceG(10_000, 101_325, 0.01)));
    expect(html).toContain(formatPower(CORNER.P_output));
  });
});
