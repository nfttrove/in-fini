import { describe, it, expect } from "vitest";
import { fmtPower, fmtFreq } from "./format";

describe("fmtPower", () => {
  it("returns '0 W' for zero", () => {
    expect(fmtPower(0)).toBe("0 W");
  });

  it("formats femtowatts", () => {
    expect(fmtPower(1e-14)).toBe("1.0e+1 fW");
  });

  it("formats picowatts", () => {
    expect(fmtPower(1e-11)).toBe("1.0e+1 pW");
  });

  it("formats nanowatts", () => {
    expect(fmtPower(1e-8)).toBe("1.0e+1 nW");
  });

  it("formats microwatts", () => {
    expect(fmtPower(1e-5)).toBe("1.0e+1 µW");
  });

  it("formats milliwatts", () => {
    expect(fmtPower(1e-2)).toBe("1.0e+1 mW");
  });

  it("formats watts with three decimals", () => {
    expect(fmtPower(2.5)).toBe("2.500 W");
  });

  it("handles negative values via absolute-value bucketing", () => {
    expect(fmtPower(-1e-2)).toBe("-1.0e+1 mW");
  });
});

describe("fmtFreq", () => {
  it("formats Hz below 1 kHz", () => {
    expect(fmtFreq(50)).toBe("50.0 Hz");
  });

  it("formats kHz", () => {
    expect(fmtFreq(2500)).toBe("2.500 kHz");
  });

  it("formats MHz", () => {
    expect(fmtFreq(2.5e6)).toBe("2.500 MHz");
  });

  it("formats GHz", () => {
    expect(fmtFreq(2.5e9)).toBe("2.500 GHz");
  });
});
