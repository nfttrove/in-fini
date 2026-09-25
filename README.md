# In Fini — Quantum Vacuum & Cavity Physics Simulator

An interactive, open-source teaching tool for quantum vacuum physics — and for how to
stress-test extraordinary claims with ordinary physics. It simulates the Casimir effect,
rotating polarization fields, resonant cavities and non-linear up-conversion, then puts
famous "anomalous thrust / energy from the vacuum" claims (Podkletnov, Searl,
Biefeld–Brown, the ionocraft lifter…) through quantitative artifact budgets to show
how much of each claim ion wind, vibration, electrostatics, ohmic heating and blackbody
radiation can account for.

**No over-unity hype.** Every panel states its assumptions, every formula is visible in
the source, and the "Conscience Meter" reminds you of the definitive numerical-artifact
test: if a discovery disappears when you halve the timestep, it was never real.

## What's inside

The app is organised as tabs, each a self-contained mini-experiment:

| Tab | What it shows |
| --- | --- |
| **Home** | Orientation and suggested classroom entry points |
| **Teacher's Guide** | Structured lesson plans for classroom use |
| **Lab Worksheet** | Interactive experiments and challenges |
| **Casimir Effect** | Vacuum pressure/force/energy between conducting plates, F ∝ 1/d⁴ |
| **Rotating Field** | Animated circularly polarised wave — why a "virtual rotor" is just a rotating E field |
| **Cavity Coupling** | Lorentzian resonant response at RF/acoustic scale |
| **nm-Cavity (Optical)** | Nanometre-gap cavity with resonance in the optical/UV band |
| **Non-linear Coupling** | Bessel-sideband frequency comb from modulating an optical carrier at fₘ |
| **Device Model — Power from Vacuum** | End-to-end prediction combining Casimir gap, rotor drive and Bessel up-conversion, compared against a claimed 1.3 W output |
| **Leakage & Artifact Diagnostic** | A claimed power output vs. joule, RF, blackbody, mechanical and triboelectric leakage channels |
| **Thrust & Weight Diagnostic** | A claimed weight change vs. ion wind, vibration, electrostatic and thermal-convection channels, with historical-claim presets |
| **Circuit QED (microwave DCE)** | The regime where the dynamical Casimir effect was actually measured (Wilson et al., Nature 2011): parametric pumping at 2·f₀, thermal noise floor, parametric-oscillation threshold, pump-frequency scan, and g² correlation spectroscopy with the Cauchy–Schwarz test |
| **Claim Registry** | Put an anomalous power/thrust claim through its computed artifact budget and uncertainty, reproducible from the parameters (the public filing record is offline) |
| **Experiment Design** | The budget engines inverted: state the effect you want to detect and at how many σ, get the rig requirements (vibration floor, pressure, shielding, temperature stability) — round-trip tested against the forward engines |
| **Data Lab & Challenge** | Paste your own measurement series: drift removal, mains-comb identification, FFT spectrum and residual statistics — plus a blind "artifact or anomaly?" training game |
| **Boundary Atlas** | Verdict-flip terrain for four engines — thrust budgets, the device model's plausibility frontier (with the material veto), circuit-QED regimes, and the decidability wall — computed live from the same tested functions |
| **Dark Corners** | The 95%: the 10^120 vacuum-overshoot problem with a cutoff slider, local Casimir vacuum density vs the cosmological one, dark-matter flux through your desk, and dark energy's unwitnessable tide — each honest number paired with "here endeth the desk" |
| **Acoustic Casimir** | Sound's radiation pressure (p²/ρc²) side by side with the vacuum Casimir force it mirrors — with the gap at which empty space matches your speaker, and a build-it-tonight parts list |
| **Replication Network** | Calibration Census 001: record 60 s of your rig's noise floor (phone accelerometer in-browser, or paste CSV) and see its profile; filing into the shared census is offline |
| **Errata** | Every mistake the site has shipped and corrected, old value beside new; the corrected figures are computed live by the engines |

Diagnostic panels end in a colour-coded verdict — *explained / partial / excess /
gross-excess* — based on how much of the claim the mundane channels account for.

### The physics modules

All numerical models live in `src/utils/` and are unit-tested (Vitest):

- `physics.ts` — Casimir pressure `−π²ħc/240d⁴`, force and energy; cavity mode
  frequencies `fₙ = n·c/2L`; Lorentzian cavity response.
- `bessel.ts` — Bessel function `J₁(x)` for phase-modulation sideband weights.
- `device.ts` — the device model. Its dynamic-Casimir ceiling
  `P = (ħc²/d⁴)·(v/c)²·A` is deliberately a *generous* order-of-magnitude upper bound
  (the π²/720 prefactor is dropped), so the shortfall against any real claim is a
  lower bound.
- `leakage.ts` — five-channel power leakage budget.
- `thrustLeakage.ts` — force-artifact budget in units of Δg, including the DCE thrust
  limit with the `2·J₁(β)²` sideband weight.
- `circuitQED.ts` — the microwave DCE panel's model: Bose–Einstein thermal
  occupation, parametric coupling λ = (δx/L)·f₀·ℒ(fₘ − 2f₀), below-threshold
  pair rate λ²/κ, oscillation threshold 2λ ≥ κ, and counting SNR. Order-of-
  magnitude forms with O(1) prefactors dropped, same convention as the device
  model.
- `uncertainty.ts` — per-channel uncertainty propagation (RSS) and
  σ-aware residual classification; both budget engines now report
  `sigmaW`/`sigmaG` and a `sigmaAssessment` alongside the verdict.
- `experimentDesign.ts` — the inverter: solves each artifact channel's
  formula for the physical parameter that keeps it under a per-channel
  allowance S/(k·√N). Round-trip tests plug the limits back into the
  forward engines.
- `residuals.ts` — robust series parsing, least-squares detrending, an
  in-place radix-2 FFT, mains-family identification, residual statistics,
  and a seeded synthetic-trace generator for the blind challenge.
- `correlation.ts` — Gaussian-moment g² correlations for thermal + pair
  states and the Cauchy–Schwarz violation criterion.
- `darkCorners.ts` — the unnamed 95% in honest numbers: QFT vacuum
  density vs observed dark energy (the 10^120 problem), Casimir-mode
  exclusion density, standard-halo dark-matter flux, and the Λc²r/3 tide.
- `acousticCasimir.ts` — SPL→pressure→intensity→radiation-pressure chain,
  force on a plate, household-scale verdicts, and the inverse-Casimir gap
  at which the vacuum matches the sound force.
- `networkCensus.ts` — fleet statistics for the replication network:
  median/percentile rig noise, mains split, and the collective floor
  (median/√N) with its citable bound statement.
- `boundaryAtlas.ts` — 2-D verdict slices through the engines for the
  Boundary Atlas panel; same tested functions, grid form.
- `thermalFloor.ts` — the measurability limit of matter itself: Brownian
  force noise √(4k_B·T·m·ω/Qτ), equipartition jitter, the kT power bound,
  and a three-way decidability verdict (decidable / marginal / sub-thermal —
  the last meaning no instrument made of atoms at that temperature could
  ever witness the claim).
- `format.ts` — SI-prefixed formatting helpers.

A note on intellectual honesty, since it's the point of the project: analytic panels are
marked as invariant-by-construction in the Conscience Meter rather than pretending to
"pass" a timestep test they cannot fail.

## Tech stack

- [Vite](https://vitejs.dev) + [React 18](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS 3](https://tailwindcss.com) with three themes (dark / light / coffee)
- [lucide-react](https://lucide.dev) icons
- [Vitest](https://vitest.dev) for unit tests

Originally scaffolded with [Bolt.new](https://bolt.new).

## Getting started

Requires Node.js (LTS) and npm.

```bash
git clone https://github.com/nfttrove/in-fini.git
cd in-fini
npm install
```

### No database

The site's Supabase project was shut down in September 2026. The client in
`src/lib/supabase.ts` is always null, whatever `VITE_SUPABASE_*` the host sets:
every panel computes in the browser, the Thrust panel serves its presets from
`src/data/thrustPresets.ts`, and the database features (claim filing and
pre-registration, the shared census, saved presets, the runs log) are off or
say they are offline.

The unit tests never touch the network and need no environment at all.

### Commands

```bash
npm run dev        # start the dev server
npm run build      # production build to dist/
npm run preview    # serve the production build
npm test           # run the Vitest suite
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
```

## Former database

`supabase/migrations/` keeps the schema the database features used, for
anyone rebuilding them. The 2026-09-24 migrations (`20260924120000` to
`20260924160000`, including server-set timestamps, filing caps and the census
units rescale) were probably never applied: the project was shut down then.

## Project structure

```
src/
  App.tsx                 # tab shell
  components/             # one panel per topic (Controls/Metrics/Notes/Sweeps subfiles)
    ui/                   # shared primitives: Slider, MetricCard, GoverningEquation,
                          # PlainExplainer, ConscienceMeter, …
  contexts/               # theme provider (dark / light / coffee) + theme context
  data/                   # built-in thrust-claim presets (offline fallback, unit-tested)
  lib/supabase.ts         # former database client, now always off
                          # (persistence code kept for a future backend)
  utils/                  # the physics and formatting modules (unit-tested)
supabase/migrations/      # the former database's schema and policies
```

## CI

GitHub Actions runs typecheck, lint, the full test suite (including the
deterministic engine fuzz — the descendant of the permutation sweep that
found the double-counted thermal channel) and a production build whose
bundle is grepped for the shipped UI, on every push to `main`.

## Sharing and permalinks

Every tab lives in the URL (`?tab=cqed`), and the parameter-backed panels
(Circuit QED, both diagnostics) encode their full slider state in the query
string — copy the address bar to share an exact, reproducible configuration.

## Using the physics modules

All pure calculation modules are re-exported, namespaced, from
`src/physics.ts` — no React, no DOM, no network:

```ts
import { casimir, thrust, cqed, residuals } from "./physics";
casimir.casimirForce(100e-9, 1e-4);
residuals.analyzeSeries(t, y, { mainsHz: 50 });
```

Publishing this as an npm package is one command away (`physics.ts` is the
entry point); it needs the repo owner's npm login, so it has deliberately
not been published from here.

## Conventions

Rules that exist because breaking them has already shipped bugs here:

- **Every thrust quantity is a grams-equivalent weight change** (F/g × 1000),
  typed `Grams` (`src/utils/units.ts`). Forces are `Newtons`. Crossing units
  takes a named conversion (`gramsToNewtons`, `newtonsToGrams`); a bare number
  or the wrong brand does not type-check at a formatter. The `grams()` /
  `newtons()` wrappers are assertions: they accept any number, so wrap only
  values you know are in that unit. Three 10–1000× display bugs came from
  skipping this.
- **Numbers in prose are computed, not typed.** Worksheet answers, guide
  examples, preset verdicts and panel comparisons are derived from the same
  engines the panels use (`DEVICE_DEFAULTS`, `summarizePreset`, …) and pinned
  by render tests. Hand-typed values drifted: "~5 µW" where the model gives
  18 fW, "Fully explained" where the budget said "Partially explained".
- **Assumptions are knobs, not constants.** Where a channel depends on a
  modelling choice (ion-wind discharge area, the rectified share of
  vibration), it is a slider with a stated default, not a hidden number.
- **A channel labelled an upper bound must be one** — say "heuristic" when it
  isn't.

## Deployment

The live site (in-fini.com) is published through the Bolt.new pipeline — this repo
has CI but **no continuous deployment**: pushing to GitHub does not redeploy it. After merging changes
here, redeploy from the Bolt workspace (or wire up Netlify/Vercel against the
repo and `npm run build` to change that).

To catch a live site that has fallen behind, every build stamps
`<meta name="in-fini-build" content="…">` with a hash of the shipped source
(`scripts/build-id.mjs`: paths and contents of `src/`, `public/` and the build
config; tests and dotfiles excluded, line endings normalised, dependency
versions deliberately not included). The scheduled `live-drift` workflow compares
in-fini.com's stamp with `main` daily and fails, which emails the repo owner,
when they differ. Run it on demand from the Actions tab after publishing.

## Status and known caveats

- CI (typecheck, lint, tests, build) is the source of truth for whether they pass; this file deliberately quotes no counts.
- Dependencies are current within their declared semver ranges. Deliberately
  *not* upgraded: React 19, Vite 6+, TypeScript 7, Tailwind 4, ESLint 10 are
  available as majors; the two remaining `npm audit` findings live in the dev
  toolchain (esbuild via Vite 5) and are fixed by the Vite upgrade.
- The DCE power and thrust ceilings are generous order-of-magnitude bounds, not
  first-principles results — by design, so the computed shortfall against a
  claim is conservative.
- Licensed under the [MIT License](LICENSE).
