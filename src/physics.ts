/**
 * Barrel export of every pure physics/analysis module in the app.
 *
 * These modules have no React, no DOM and no network dependencies — they
 * are plain, unit-tested functions over numbers. The app imports them
 * directly; this barrel exposes them as namespaced groups for external
 * consumers (a future npm package, verification bots, notebooks):
 *
 *   import { casimir, thrust, cqed } from "in-fini/physics";
 *   casimir.casimirForce(100e-9, 1e-4);
 *   thrust.computeThrustBudget(params);
 *
 * Physical constants that several modules re-declare (ħ, c, k_B) live in
 * each namespace as exported there — e.g. casimir.C, cqed.C.
 *
 * Publishing to npm is one command from the repo root once an owner with
 * npm credentials runs it (see README → "Using the physics modules").
 */
export * as casimir from "./utils/physics";
export * as bessel from "./utils/bessel";
export * as device from "./utils/device";
export * as powerBudget from "./utils/leakage";
export * as thrust from "./utils/thrustLeakage";
export * as cqed from "./utils/circuitQED";
export * as correlations from "./utils/correlation";
export * as uncertainty from "./utils/uncertainty";
export * as experimentDesign from "./utils/experimentDesign";
export * as residuals from "./utils/residuals";
export * as format from "./utils/format";
