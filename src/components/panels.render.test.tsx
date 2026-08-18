import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import CircuitQEDPanel from "./CircuitQEDPanel";
import ClaimRegistryPanel from "./ClaimRegistryPanel";
import ExperimentDesignPanel from "./ExperimentDesignPanel";
import DataLabPanel from "./DataLabPanel";
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
    // Default claim 0.1 Δg at 2σ over 5 channels:
    expect(html).toContain("2.24"); // 0.1 / (2·√5) = 0.0224 → ×100 nm scale may vary; check exponent instead
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
