import { useMemo, useState } from "react";
import { Telescope } from "lucide-react";
import Panel from "./ui/Panel";
import PlainExplainer from "./ui/PlainExplainer";
import Slider from "./ui/Slider";
import MetricCard from "./ui/MetricCard";
import {
  CUTOFFS,
  qftVacuumDensityJ,
  vacuumOvershoot,
  casimirDensityJ,
  darkMatterFlux,
  darkEnergyTide,
  accelerationVerdict,
  RHO_DARK_ENERGY_J,
} from "../utils/darkCorners";

function exp(v: number, unit: string): string {
  return `${v.toExponential(2)} ${unit}`;
}

export default function DarkCornersPanel() {
  const [cutoffIdx, setCutoffIdx] = useState(3); // QCD — most conservative
  const [gapNm, setGapNm] = useState(100);
  const [deskWidthM, setDeskWidthM] = useState(1);

  const cutoff = CUTOFFS[cutoffIdx];
  const qft = useMemo(() => qftVacuumDensityJ(cutoff.energyGeV), [cutoff]);
  const overshoot = useMemo(() => vacuumOvershoot(cutoff.energyGeV), [cutoff]);
  const casimir = useMemo(() => casimirDensityJ(gapNm), [gapNm]);
  const casimirVsCosmos = casimir / RHO_DARK_ENERGY_J;

  const dm = useMemo(() => darkMatterFlux(), []);
  const tide = useMemo(() => darkEnergyTide(deskWidthM), [deskWidthM]);
  const tideVerdict = useMemo(() => accelerationVerdict(tide), [tide]);

  return (
    <div className="space-y-6">
      <PlainExplainer title="The 95% of the universe your desk cannot see — computed anyway">
        <p>
          Everything else in this app lives in the 5% of the universe that is
          named: baryons, light, the vacuum you can squeeze between two
          plates. This panel computes the other 95% — dark energy and dark
          matter — right next to the numbers your instruments can actually
          reach, so you can see exactly where the desk's jurisdiction ends
          and the telescopes' begins.
        </p>
        <p className="mt-2 dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400">
          <span className="font-semibold dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-slate-200">The honest punchline:</span>{" "}
          the vacuum energy your Casimir panels measure and the vacuum
          energy filling the cosmos are, as far as we know, the same
          phenomenon — and quantum theory gets their relative sizes wrong by
          40 to 120 orders of magnitude. That is the biggest open crack in
          the wall, and nobody, human or alien, has explained it.
        </p>
      </PlainExplainer>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Panel title="The 10¹²⁰ problem: two vacuums that refuse to match">
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                {CUTOFFS.map((c, i) => (
                  <button
                    key={c.key}
                    onClick={() => setCutoffIdx(i)}
                    aria-pressed={cutoffIdx === i}
                    title={c.note}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      cutoffIdx === i
                        ? "bg-cyan-600 text-white"
                        : "dark-mode:bg-slate-700 light-mode:bg-slate-200 coffee-mode:bg-slate-700 dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-amber-100"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] dark-mode:text-slate-500 light-mode:text-slate-500 coffee-mode:text-amber-700 italic">
                Cutoff: {cutoff.note}. Wherever you stop believing quantum
                field theory, the overshoot below survives.
              </p>
              <div className="grid grid-cols-1 gap-3">
                <MetricCard
                  label="Quantum-theory vacuum density"
                  value={exp(qft, "J/m³")}
                  sub="Σ ½ħω below the cutoff"
                  color="dark-mode:text-red-400 light-mode:text-red-600 coffee-mode:text-red-400"
                />
                <MetricCard
                  label="Observed cosmic vacuum density"
                  value={exp(RHO_DARK_ENERGY_J, "J/m³")}
                  sub="dark energy (Planck 2018)"
                  color="dark-mode:text-emerald-400 light-mode:text-emerald-600 coffee-mode:text-emerald-400"
                />
                <MetricCard
                  label="Overshoot"
                  value={`10^${Math.log10(overshoot).toFixed(0)}`}
                  sub="the worst prediction in physics"
                  color="dark-mode:text-amber-400 light-mode:text-amber-600 coffee-mode:text-amber-400"
                />
              </div>
              <p className="text-xs dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-amber-700 leading-relaxed">
                Some unknown cancellation erases between 40 and 120 orders
                of magnitude and leaves the remainder. Every "zero-point
                energy device" claim silently assumes this problem is
                solved. It is not — not by us, and not in any physics any
                alien could plausibly be using either, because their
                particle colliders would face the same sum.
              </p>
            </div>
          </Panel>

          <Panel title="Meanwhile, at your Casimir gap">
            <div className="space-y-5">
              <Slider
                label="Plate separation"
                value={gapNm}
                displayValue={`${gapNm.toFixed(0)} nm`}
                min={10}
                max={1000}
                step={10}
                onChange={setGapNm}
                minLabel="10 nm"
                maxLabel="1 µm"
              />
              <div className="grid grid-cols-2 gap-3">
                <MetricCard
                  label="Local vacuum energy density"
                  value={exp(casimir, "J/m³")}
                  sub="π²ħc/720d⁴ — measured physics"
                />
                <MetricCard
                  label="vs the cosmos's vacuum"
                  value={`${casimirVsCosmos.toExponential(1)}×`}
                  sub={
                    casimirVsCosmos > 1
                      ? "your gap edits the vacuum harder than the universe does"
                      : "the universe edits harder than your gap"
                  }
                  color="dark-mode:text-cyan-400 light-mode:text-cyan-700 coffee-mode:text-cyan-400"
                />
              </div>
              <p className="text-xs dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-amber-700 leading-relaxed">
                At 100 nm the exclusion of modes between your plates changes
                the local vacuum energy density by ~10⁹ times the
                cosmological value. The touchable vacuum is wildly stronger
                than the dark one — it is just billed in femtojoules over
                nanometres, which is why the Device Model panel stays honest
                about extractable power.
              </p>
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Dark matter through your desk, right now">
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                label="Local density"
                value="≈ 3 particles per litre"
                sub="0.3 GeV/cm³, standard halo"
              />
              <MetricCard
                label="Drift speed"
                value="≈ 220 km/s"
                sub="the galaxy's traffic speed"
              />
              <MetricCard
                label="Through 1 m² per day"
                value={`${(dm.kgPerDayPerM2 * 1e9).toFixed(1)} ng`}
                sub={`≈ ${dm.particlesPerSecondPerM2.toExponential(1)} particles/s`}
              />
              <MetricCard
                label="If it interacted like air"
                value={exp(dm.hypotheticalPressurePa, "Pa")}
                sub="ρ·v² if fully absorbed — still unfelt"
              />
            </div>
            <p className="text-xs dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-amber-700 mt-4 leading-relaxed">
              About ten nanograms of dark matter drifts through your desk
              every day, a few hundred million particles per second, and
              precisely none of it touches anything — even under the
              absurd assumption of perfect absorption its push would be a
              million times fainter than the quietest sound you can hear.
              Detectors like XENONnT are this app's Claim Registry at
              billion-euro scale: budget every known channel, then hunt the
              residual. The residual is still winning.
            </p>
          </Panel>

          <Panel title="Dark energy's pull across your desk">
            <div className="space-y-5">
              <Slider
                label="Separation"
                value={deskWidthM}
                displayValue={`${deskWidthM.toFixed(1)} m`}
                min={0.1}
                max={3}
                step={0.1}
                onChange={setDeskWidthM}
                minLabel="10 cm"
                maxLabel="3 m"
              />
              <div className="grid grid-cols-2 gap-3">
                <MetricCard
                  label="Tidal acceleration"
                  value={exp(tide, "m/s²")}
                  sub="Λc²r/3 — Λ from Planck 2018"
                />
                <MetricCard
                  label="…in mg-equivalent"
                  value={`${((tide / 9.80665) * 1e6).toExponential(1)} mg`}
                  sub="per kg of desk"
                />
              </div>
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 text-red-300 p-4">
                <div className="font-semibold text-sm flex items-center gap-2">
                  <Telescope className="w-4 h-4" />
                  {tideVerdict.label}
                </div>
                <p className="text-xs mt-1 leading-relaxed opacity-90">
                  {tideVerdict.description}
                </p>
              </div>
              <p className="text-xs dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-amber-700 leading-relaxed">
                This is the one place the vacuum's invoice genuinely blurs:
                as space expands, more of this energy exists, not less. The
                universe runs the experiment across billions of light-years
                because no arrangement of atoms can arbitrate it at 10⁻³⁶
                m/s². Here endeth the desk.
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
