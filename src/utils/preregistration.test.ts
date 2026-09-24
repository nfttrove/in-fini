import { describe, it, expect } from "vitest";
import { preregisteredClaimIds } from "./preregistration";

describe("preregisteredClaimIds", () => {
  const claim = { id: "c1", created_at: "2026-09-10T12:00:00Z", hash: "h" };

  it("counts a prediction filed before the claim", () => {
    expect(preregisteredClaimIds([claim], [{ param_hash: "h", created_at: "2026-09-01T00:00:00Z" }])).toEqual(new Set(["c1"]));
  });

  it("does not count one filed after the claim (review: the badge ignored timestamps)", () => {
    expect(preregisteredClaimIds([claim], [{ param_hash: "h", created_at: "2026-09-11T00:00:00Z" }]).size).toBe(0);
  });

  it("uses the earliest matching prediction, and ignores other hashes and bad dates", () => {
    const preregs = [
      { param_hash: "h", created_at: "2026-09-20T00:00:00Z" },
      { param_hash: "h", created_at: "2026-09-02T00:00:00Z" },
      { param_hash: "other", created_at: "2026-01-01T00:00:00Z" },
      { param_hash: "h", created_at: "not a date" },
    ];
    expect(preregisteredClaimIds([claim], preregs)).toEqual(new Set(["c1"]));
    expect(preregisteredClaimIds([{ ...claim, hash: "none" }], preregs).size).toBe(0);
  });
});
