import { describe, it, expect } from "vitest";
import { grams, newtons, gramsToNewtons, newtonsToGrams } from "./units";
import { formatForceG, dceThrustLimitG } from "./thrustLeakage";
import { formatForce } from "./physics";

describe("units", () => {
  it("converts grams-equivalent weight to newtons and back", () => {
    expect(gramsToNewtons(grams(1000))).toBeCloseTo(9.80665, 12);
    expect(gramsToNewtons(grams(0.1))).toBeCloseTo(9.80665e-4, 15);
    expect(newtonsToGrams(gramsToNewtons(grams(0.1234)))).toBeCloseTo(0.1234, 15);
  });

  it("rejects unit mix-ups at compile time (enforced by `npm run typecheck`)", () => {
    // Each marked line must fail to typecheck. If one ever compiles, its
    // expect-error directive becomes the error and CI goes red.
    // @ts-expect-error a bare number is not grams: say which unit you mean
    formatForceG(0.1);
    // @ts-expect-error grams are not newtons: convert with gramsToNewtons
    formatForce(grams(0.1));
    // @ts-expect-error the old DCE bug: dividing grams by 1000 is not a unit
    formatForceG(dceThrustLimitG({} as never) / 1000);
    // The intended spellings compile:
    expect(formatForceG(grams(0.1))).toBe("100.000 mg");
    expect(formatForce(gramsToNewtons(grams(0.1)))).toBe("980.6650 μN");
    expect(formatForce(newtons(1))).toBe("1.0000 N");
  });
});
