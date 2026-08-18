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

The app is organised as eleven tabs, each a self-contained mini-experiment:

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

Diagnostic panels end in a colour-coded verdict — *explained / partial / excess /
gross-excess* — based on how much of the claim the mundane channels account for.

### The physics modules

All numerical models live in `src/utils/` and are unit-tested (46 tests, Vitest):

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

### Environment variables (required)

The app initialises the Supabase client at import time and **will not start without
these** — `createClient` throws `supabaseUrl is required` and the page white-screens:

```bash
# .env.local
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

Both values come from your Supabase dashboard (Project Settings → API). The anon key is
public by design; access control is enforced by row-level security (see below).

If you only want to run the unit tests, no environment is needed — the test suite
exercises the pure calculation modules in `src/utils/` and never touches the network.

### Commands

```bash
npm run dev        # start the dev server
npm run build      # production build to dist/
npm run preview    # serve the production build
npm test           # run the Vitest suite (46 tests)
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
```

## Supabase backend

SQL migrations are in `supabase/migrations/` (apply them with the Supabase CLI or by
pasting them into the SQL editor in creation order). Three tables:

- **`simulation_presets`** — user-saved parameter sets per panel. Anonymous by design:
  inserts are open, but deletion is authorised by a per-preset `owner_token` generated
  client-side and kept in the browser's `localStorage`; the `delete_preset` RPC is
  `SECURITY DEFINER` and checks the token. The token column is excluded from the
  anon-role `SELECT` grant (column-level grant) so it cannot be harvested through the
  REST API.
- **`diagnostic_runs`** — saved leakage-diagnostic results (params + verdict).
- **`thrust_presets`** — the built-in historical-claim presets.

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
  contexts/               # theme context (dark / light / coffee)
  data/                   # built-in thrust-claim presets
  lib/supabase.ts         # Supabase client + preset/run persistence
  utils/                  # the physics and formatting modules (unit-tested)
supabase/migrations/      # database schema and policies
```

## Status and known caveats

- Tests, typecheck and build all pass as of this writing. `npm run lint` has one
  pre-existing error (an unused variable in `src/components/rotating/RotatingCanvas.tsx`)
  and three warnings.
- The DCE power and thrust ceilings are generous order-of-magnitude bounds, not
  first-principles results — by design, so the computed shortfall against a claim is
  conservative.
- No license file has been declared yet, despite the "fully open source" copy in the
  app. If you intend others to reuse it, add one.
