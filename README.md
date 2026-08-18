# In Fini — Quantum Vacuum & Cavity Physics Simulator

An interactive, open-source teaching tool for quantum vacuum physics — and for how to
stress-test extraordinary claims with ordinary physics. It simulates the Casimir effect,
rotating polarization fields, resonant cavities and non-linear up-conversion, then puts
famous "anomalous thrust / energy from the vacuum" claims (Podkletnov, Searl,
Biefeld–Brown, the Manchester spheres…) through quantitative artifact budgets to show
how much of each claim ion wind, vibration, electrostatics, ohmic heating and blackbody
radiation can account for.

**No over-unity hype.** Every panel states its assumptions, every formula is visible in
the source, and the "Conscience Meter" reminds you of the definitive numerical-artifact
test: if a discovery disappears when you halve the timestep, it was never real.

## What's inside

The app is organised as sixteen tabs, each a self-contained mini-experiment:

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
| **Claim Registry** | File an anomalous power/thrust claim together with its computed artifact budget and uncertainty into a public, reproducible record; pre-register predictions before running the experiment |
| **Experiment Design** | The budget engines inverted: state the effect you want to detect and at how many σ, get the rig requirements (vibration floor, pressure, shielding, temperature stability) — round-trip tested against the forward engines |
| **Data Lab & Challenge** | Paste your own measurement series: drift removal, mains-comb identification, FFT spectrum and residual statistics — plus a blind "artifact or anomaly?" training game |
| **Replication Network** | Calibration Census 001: record 60 s of your rig's noise floor (phone accelerometer in-browser, or paste CSV) and file it; the fleet's collective floor is median/√N — the honest detection limit of the crowd before any replication round |

Diagnostic panels end in a colour-coded verdict — *explained / partial / excess /
gross-excess* — based on how much of the claim the mundane channels account for.

### The physics modules

All numerical models live in `src/utils/` and are unit-tested (125 tests, Vitest):

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
- `networkCensus.ts` — fleet statistics for the replication network:
  median/percentile rig noise, mains split, and the collective floor
  (median/√N) with its citable bound statement.
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
- [Supabase](https://supabase.com) for shared presets and diagnostic-run history
- [Vitest](https://vitest.dev) for unit tests

Originally scaffolded with [Bolt.new](https://bolt.new).

## Getting started

Requires Node.js (LTS) and npm.

```bash
git clone https://github.com/nfttrove/in-fini.git
cd in-fini
npm install
```

### Environment variables (optional)

Without `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` the app still runs:
every panel computes, and the Thrust panel serves its famous-claims presets
from the built-in copy in `src/data/thrustPresets.ts`. Only cloud-backed
features are unavailable — preset save/load and diagnostic-run history show a
"Supabase is not configured" notice instead. To enable them, create:

```bash
# .env.local
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

Both values come from your Supabase dashboard (Project Settings → API). The anon key is
public by design; access control is enforced by row-level security (see below).

The unit tests never touch the network and need no environment at all.

### Commands

```bash
npm run dev        # start the dev server
npm run build      # production build to dist/
npm run preview    # serve the production build
npm test           # run the Vitest suite (125 tests)
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
```

## Supabase backend

SQL migrations are in `supabase/migrations/` (apply them with the Supabase CLI or by
pasting them into the SQL editor in creation order). Six tables:

- **`simulation_presets`** — user-saved parameter sets per panel. Anonymous by design:
  inserts are open, but deletion is authorised by a per-preset `owner_token` generated
  client-side and kept in the browser's `localStorage`; the `delete_preset` RPC is
  `SECURITY DEFINER` and checks the token. The token column is excluded from the
  anon-role `SELECT` grant (column-level grant) so it cannot be harvested through the
  REST API.
- **`diagnostic_runs`** — saved leakage-diagnostic results (params + verdict).
- **`thrust_presets`** — the built-in historical-claim presets.
- **`claim_registry`** — public claim filings (claim + parameters + computed
  verdict + uncertainty). Public read, bounded anonymous insert, intentionally
  no delete in v1: it is a record, not a scratchpad. Seeded with the famous
  historical cases, their verdicts computed by these same engines.
- **`network_runs`** — census filings for the Replication Network (noise
  floor, top vibration line, mains frequency; no geolocation). Public read,
  bounded anonymous insert, no delete.
- **`preregistrations`** — timestamped predictions committed before an
  experiment (client-side SHA-256 over a canonical title/type/magnitude
  string). Filed claims matching a prior pre-registration are flagged
  "pre-registered" in the registry list.

Two later migrations are security fixes worth knowing about before forking the schema:
`20260710002212` hides `owner_token` from the API (it was previously readable by
anyone), and `20260710003928` bounds the size of anon-writable JSONB payloads.

## Project structure

```
src/
  App.tsx                 # tab shell
  components/             # one panel per topic (Controls/Metrics/Notes/Sweeps subfiles)
    ui/                   # shared primitives: Slider, MetricCard, GoverningEquation,
                          # PlainExplainer, ConscienceMeter, PresetBar, …
  contexts/               # theme provider (dark / light / coffee) + theme context
  data/                   # built-in thrust-claim presets (offline fallback, unit-tested)
  lib/supabase.ts         # Supabase client + preset/run persistence (null-safe when
                          # env vars are absent)
  utils/                  # the physics and formatting modules (unit-tested)
supabase/migrations/      # database schema and policies
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

## Deployment

The live site (in-fini.com) is published through the Bolt.new pipeline — this repo
has **no CI/CD**: pushing to GitHub does not redeploy it. After merging changes
here, redeploy from the Bolt workspace (or wire up Netlify/Vercel against the
repo and `npm run build` to change that).

## Status and known caveats

- Tests (49), typecheck, lint and build all pass as of this writing.
- Dependencies are current within their declared semver ranges. Deliberately
  *not* upgraded: React 19, Vite 6+, TypeScript 7, Tailwind 4, ESLint 10 are
  available as majors; the two remaining `npm audit` findings live in the dev
  toolchain (esbuild via Vite 5) and are fixed by the Vite upgrade.
- The DCE power and thrust ceilings are generous order-of-magnitude bounds, not
  first-principles results — by design, so the computed shortfall against a
  claim is conservative.
- Licensed under the [MIT License](LICENSE).
