import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import CircuitQEDPanel from "../components/CircuitQEDPanel";
import ClaimRegistryPanel from "../components/ClaimRegistryPanel";

/**
 * Render smoke tests: both panels compute their headline numbers during
 * render (the physics is in useMemo, not effects), so a server render with
 * default parameters exercises the full JSX path and the physics modules.
 */
describe("CircuitQEDPanel render", () => {
  it("renders with default Wilson-2011-style parameters and a verdict", () => {
    const html = renderToString(<CircuitQEDPanel />);
    expect(html).toContain("dynamical Casimir effect");
    // Default verdict in the cold, resonant regime:
    expect(html).toContain("Vacuum pairs measurable");
    expect(html).toContain("Pair production rate");
  });
});

describe("ClaimRegistryPanel render", () => {
  it("renders the power-claim form with a computed budget and verdict", () => {
    const html = renderToString(<ClaimRegistryPanel />);
    expect(html).toContain("File a claim. Get a budget");
    // Unconfigured backend (no env in tests): local budget still shows.
    expect(html).toContain("The budget&#x27;s verdict");
    expect(html).toContain("Claimed");
  });
});
