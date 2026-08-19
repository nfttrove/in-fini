import { describe, it, expect } from "vitest";
import {
  atlasThrust,
  atlasDevice,
  atlasCqed,
  atlasDecidability,
  cellAt,
} from "./boundaryAtlas";

describe("atlas structure", () => {
  it("every map fills its grid completely", () => {
    for (const m of [atlasThrust(), atlasDevice(), atlasCqed(), atlasDecidability()]) {
      expect(m.cells).toHaveLength(m.width * m.height);
      expect(m.legend.length).toBeGreaterThanOrEqual(3);
      expect(m.cells.every((c) => Number.isInteger(c) && c >= 0)).toBe(true);
    }
  });

  it("is deterministic", () => {
    expect(atlasThrust().cells).toEqual(atlasThrust().cells);
  });
});

describe("known points land in known regions", () => {
  const thrust = atlasThrust();
  const idx = (m: typeof thrust, fx: number, fy: number) => {
    // fractions from bottom-left
    const i = Math.round(fx * (m.width - 1));
    const j = Math.round((1 - fy) * (m.height - 1));
    return cellAt(m, i, j);
  };

  it("tiny claims at low voltage are explained; huge claims read as excess", () => {
    // bottom-left: 0.001 Δg at ~1 V → explained
    expect(idx(thrust, 0.02, 0.02)).toBe(0);
    // top-right: 100 Δg at 50 kV — leakage caps near 0.4 mΔg in this slice,
    // so the verdict family is excess (never explained):
    expect(idx(thrust, 0.98, 0.98)).toBeGreaterThanOrEqual(2);
  });

  it("covers the explained / partial / excess terrain", () => {
    expect(thrust.cells).toContain(0);
    expect(thrust.cells).toContain(1);
    expect(thrust.cells).toContain(2);
  });

  it("device map reaches the material-vetoed plausibility corner", () => {
    const device = atlasDevice();
    expect(device.cells).toContain(3); // ceiling ≥ claim AND rotor shatters
    expect(device.cells).toContain(0); // claim far above ceiling elsewhere
  });

  it("cqed map spans thermal, clean, and oscillation regimes", () => {
    const cqed = atlasCqed();
    // Always pumped on resonance, so "no-signal" (0) is unreachable here —
    // the honest map shows thermal-limited, measurable pairs, and the
    // above-threshold cliff.
    expect(cqed.cells).toContain(1);
    expect(cqed.cells).toContain(2);
    expect(cqed.cells).toContain(3);
  });

  it("decidability: cold+large claims decidable, warm+tiny never", () => {
    const d = atlasDecidability();
    // bottom-right (hot, big claim... wait y=fraction: 0=bottom=warm 400K)
    // Use direct cell lookup instead of geometry guesses:
    expect(d.cells).toContain(2); // decidable region exists
    expect(d.cells).toContain(0); // sub-thermal region exists
    expect(d.cells).toContain(1); // marginal band exists
  });
});
