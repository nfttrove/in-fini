import { useMemo } from "react";
import { usePanelUrlState } from "../hooks/usePanelUrlState";
import Panel from "./ui/Panel";
import PlainExplainer from "./ui/PlainExplainer";
import Slider from "./ui/Slider";
import MetricCard from "./ui/MetricCard";
import CqedSweep from "./cqed/CqedSweep";
import G2Correlation from "./cqed/G2Correlation";
import {
  predictCqed,
  CircuitQEDParams,
  CqedPrediction,
} from "../utils/circuitQED";
import { formatFreq } from "../utils/device";
import { CQED_DEFAULTS } from "./cqed/defaults";

export interface CqedState {
  f0GHz: number;
  Qexp: number;
  deltaXnm: number;
  fmGHz: number;
  tempmK: number;
  lengthMm: number;
  integrationS: number;
}

function fmtHz(hz: number): string {
  if (hz === 0) return "0 /s";
  if (hz >= 1) return `${hz.toFixed(2)} /s`;
  return `${hz.toExponential(2)} /s`;
}

const VERDICT_STYLES: Record<string, string> = {
  emerald: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  amber: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  orange: "border-orange-500/40 bg-orange-500/10 text-orange-300",
  red: "border-red-500/40 bg-red-500/10 text-red-300",
};

function VerdictBanner({ pred }: { pred: CqedPrediction }) {
  return (
    <div className={`rounded-xl border p-4 ${VERDICT_STYLES[pred.verdict.tone]}`}>
      <div className="font-semibold text-sm">{pred.verdict.label}</div>
      <p className="text-xs mt-1 leading-relaxed opacity-90">
        {pred.verdict.description}
      </p>
    </div>
  );
}

export default function CircuitQEDPanel({
  initialState,
}: {
  initialState?: Partial<CqedState>;
}) {
  const [s, setS] = usePanelUrlState<CqedState>("cqed", {
    ...CQED_DEFAULTS,
    ...initialState,
  });
  const set = (patch: Partial<CqedState>) =>
    setS((prev) => ({ ...prev, ...patch }));

  const params: CircuitQEDParams = useMemo(
    () => ({
      f0GHz: s.f0GHz,
      Q: Math.pow(10, s.Qexp),
      deltaXnm: s.deltaXnm,
      fmGHz: s.fmGHz,
      tempmK: s.tempmK,
      lengthMm: s.lengthMm,
      integrationS: s.integrationS,
    }),
    [s]
  );

  const pred = useMemo(() => predictCqed(params), [params]);

  // Per-mode pair number on resonance: n_p = (λ/κ)².
  const defaultPairNumber = Math.pow(pred.lambdaHz / pred.kappaHz, 2);

  return (
    <div className="space-y-6">
      <PlainExplainer title="The one place the dynamical Casimir effect actually worked">
        <p>
          Every mechanical rotor in the Device Model panel is buried under the
          (v/c)² wall. In 2011 a Swedish team got around it by not moving
          matter at all: they wobbled the <em>electrical</em> position of a
          superconducting boundary in a microwave resonator, pumping at twice
          the resonator's frequency. Vacuum flickered into photon pairs at a
          measurable rate. This panel models that experiment.
        </p>
        <p className="mt-2 dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400">
          <span className="font-semibold dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-slate-200">Try this:</span>{" "}
          Heat the resonator to room temperature (300 000 mK) and watch thermal
          photons drown the signal — that is why the real experiment runs in a
          dilution refrigerator. Then push δx past ~50 nm and watch the verdict
          flip to "above parametric threshold": an amplifier, not vacuum
          physics.
        </p>
      </PlainExplainer>

      <div className="dark-mode:bg-slate-800/50 light-mode:bg-blue-50/40 coffee-mode:bg-slate-800/50 p-3 rounded border dark-mode:border-blue-500/30 light-mode:border-blue-200/50 coffee-mode:border-blue-500/30">
        <div className="text-xs dark-mode:text-blue-300 light-mode:text-slate-700 coffee-mode:text-blue-300 uppercase tracking-wider font-semibold">
          Governing equations
        </div>
        <div className="font-mono text-sm mt-2 dark-mode:text-blue-100 light-mode:text-slate-800 coffee-mode:text-blue-100">
          n̄ = 1/(e<sup>hf/kT</sup> − 1) &nbsp;&nbsp; λ = (δx/L)·f₀·ℒ(f<sub>m</sub>
          − 2f₀) &nbsp;&nbsp; R<sub>pairs</sub> ≈ λ²/κ &nbsp;&nbsp; κ = f₀/Q
        </div>
        <div className="text-xs dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400 mt-2 leading-relaxed">
          Order-of-magnitude forms (O(1) prefactors dropped, same convention as
          the Device Model) — sufficient to see which regime you are in, which
          is the whole game here.
        </div>
      </div>

      <VerdictBanner pred={pred} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Panel title="Experiment Controls">
          <div className="space-y-5">
            <Slider
              label="Resonator frequency f₀"
              value={s.f0GHz}
              displayValue={`${s.f0GHz.toFixed(1)} GHz`}
              min={4}
              max={12}
              step={0.5}
              onChange={(v) => set({ f0GHz: v })}
              minLabel="4 GHz"
              maxLabel="12 GHz"
            />
            <Slider
              label="Pump frequency fₘ (2·f₀ = resonance)"
              value={s.fmGHz}
              displayValue={`${s.fmGHz.toFixed(1)} GHz`}
              min={4}
              max={40}
              step={0.1}
              onChange={(v) => set({ fmGHz: v })}
              minLabel="4 GHz"
              maxLabel="40 GHz"
            />
            <Slider
              label="Loaded quality factor Q"
              value={s.Qexp}
              displayValue={`10^${s.Qexp.toFixed(0)} = ${Math.pow(10, s.Qexp).toExponential(0)}`}
              min={4}
              max={6}
              step={0.25}
              onChange={(v) => set({ Qexp: v })}
              minLabel="10⁴"
              maxLabel="10⁶"
            />
            <Slider
              label="Boundary wiggle δx"
              value={s.deltaXnm}
              displayValue={`${s.deltaXnm.toFixed(1)} nm`}
              min={0.1}
              max={100}
              step={0.1}
              onChange={(v) => set({ deltaXnm: v })}
              minLabel="0.1 nm"
              maxLabel="100 nm"
            />
            <Slider
              label="Resonator electrical length L"
              value={s.lengthMm}
              displayValue={`${s.lengthMm.toFixed(1)} mm`}
              min={5}
              max={20}
              step={0.5}
              onChange={(v) => set({ lengthMm: v })}
              minLabel="5 mm"
              maxLabel="20 mm"
            />
            <Slider
              label="Temperature"
              value={s.tempmK}
              displayValue={
                s.tempmK >= 1000
                  ? `${(s.tempmK / 1000).toFixed(0)} K`
                  : `${s.tempmK.toFixed(0)} mK`
              }
              min={10}
              max={300000}
              step={10}
              onChange={(v) => set({ tempmK: v })}
              minLabel="10 mK"
              maxLabel="300 K"
            />
            <Slider
              label="Integration time"
              value={s.integrationS}
              displayValue={
                s.integrationS >= 3600
                  ? `${(s.integrationS / 3600).toFixed(1)} h`
                  : `${s.integrationS.toFixed(0)} s`
              }
              min={1}
              max={100000}
              step={1}
              onChange={(v) => set({ integrationS: v })}
              minLabel="1 s"
              maxLabel="28 h"
            />
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title="Vacuum Pair Production">
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                label="Pair production rate"
                value={fmtHz(pred.pairRateHz)}
                sub="R ≈ λ²/κ below threshold"
              />
              <MetricCard
                label="Expected pairs in τ"
                value={
                  pred.expectedPairs >= 1
                    ? pred.expectedPairs.toFixed(0)
                    : pred.expectedPairs.toExponential(1)
                }
                sub={`over ${s.integrationS} s`}
              />
              <MetricCard
                label="Counting SNR"
                value={pred.snr.toFixed(1) + " σ"}
                sub="grows as √τ"
                color={
                  pred.snr >= 3
                    ? "dark-mode:text-emerald-400 light-mode:text-emerald-600 coffee-mode:text-emerald-400"
                    : undefined
                }
              />
              <MetricCard
                label="Threshold ratio 2λ/κ"
                value={pred.thresholdRatio.toFixed(3)}
                sub={pred.aboveThreshold ? "above — oscillation!" : "below"}
                color={
                  pred.aboveThreshold
                    ? "dark-mode:text-orange-400 light-mode:text-orange-600 coffee-mode:text-orange-400"
                    : undefined
                }
              />
            </div>
          </Panel>

          <Panel title="The Noise Floor (why cryogenics)">
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                label="Thermal occupation n̄"
                value={
                  pred.thermalOccupation === 0
                    ? "0"
                    : pred.thermalOccupation.toExponential(2)
                }
                sub={`at ${s.tempmK >= 1000 ? (s.tempmK / 1000).toFixed(0) + " K" : s.tempmK.toFixed(0) + " mK"}`}
              />
              <MetricCard
                label="Thermal photon flux"
                value={fmtHz(pred.thermalFluxHz)}
                sub="n̄·κ leaving the cavity"
                color={
                  pred.thermalFluxHz > pred.pairRateHz
                    ? "dark-mode:text-red-400 light-mode:text-red-600 coffee-mode:text-red-400"
                    : undefined
                }
              />
              <MetricCard
                label="Cavity linewidth κ"
                value={formatFreq(pred.kappaHz)}
                sub={`Q = ${Math.pow(10, s.Qexp).toExponential(0)}`}
              />
              <MetricCard
                label="Parametric coupling λ"
                value={pred.lambdaHz.toFixed(1) + " Hz"}
                sub={`ℒ = ${pred.resonanceFactor.toFixed(3)} at ${(pred.detuningHz / 1e9).toFixed(2)} GHz detuning`}
              />
            </div>
          </Panel>

          <Panel title="Reality Check: the GHz Trick">
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                label="Effective mirror speed"
                value={pred.vEff.toFixed(1) + " m/s"}
                sub="2π·fₘ·δx — slower than a jet turbine!"
              />
              <MetricCard
                label="…as a fraction of c"
                value={pred.vEffOverC.toExponential(2)}
                sub="(v/c)² — the wall that kills rotors"
              />
            </div>
            <p className="text-xs dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-amber-700 mt-4 leading-relaxed">
              The boundary here moves at ~10² m/s — comparable to the spinning
              rotor in the Device Model. The pairs/s rate is nonetheless
              measurable because of the two things mechanics cannot offer:
              pumping <em>exactly at 2·f₀</em> (parametric resonance — needs
              f₀ in microwaves, not optics) and a cryogenic mode with n̄ ≈ 0.
              The GHz trick is resonance and quiet, not speed.
            </p>
          </Panel>
        </div>
      </div>

      <Panel title="Pump scan across the 2·f₀ resonance">
        <p className="text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-amber-600 mb-3 leading-relaxed">
          What you would sweep in the lab: pair rate (cyan) vs pump frequency,
          log scale, against the thermal floor (red). Off resonance the rate
          collapses; the resonance width is κ/2. If the cyan line does not
          clear the red one, there is nothing to detect.
        </p>
        <CqedSweep base={params} />
      </Panel>

      <Panel title="Proving the pairs: correlation spectroscopy (g²)">
        <p className="text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-amber-600 mb-4 leading-relaxed">
          A count rate alone never proves vacuum origin — a warm resistor
          emits photons too. The pair signature is correlation: vacuum pairs
          exit in twos, one into each output mode, so coincidences violate
          the classical Cauchy–Schwarz bound. This is the measurement that
          sealed the 2011 result.
        </p>
        <G2Correlation
          defaultPairNumber={defaultPairNumber}
          defaultThermal={pred.thermalOccupation}
        />
      </Panel>

      <Panel title="Scope and honesty">
        <p className="text-xs leading-relaxed dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-amber-700">
          This is a teaching model of the microwave DCE (Wilson et al., Nature
          479, 376 (2011)), not a design tool: O(1) prefactors are dropped,
          the SQUID is treated as an ideal effective boundary, and detection
          inefficiency is ignored — so measured rates in a real lab come out
          lower. A real claim of vacuum photons also needs pair-correlation
          (g²) spectroscopy, not just a count rate: that is what
          distinguishes DCE pairs from a mundane hot resistor. A count
          without coincidences is not a discovery.
        </p>
      </Panel>
    </div>
  );
}
