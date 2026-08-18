import { useMemo, useState } from "react";
import Panel from "./ui/Panel";
import PlainExplainer from "./ui/PlainExplainer";
import Slider from "./ui/Slider";
import MetricCard from "./ui/MetricCard";
import {
  predictCqed,
  CircuitQEDParams,
  CqedPrediction,
} from "../utils/circuitQED";
import { formatFreq } from "../utils/device";

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
    <div
      className={`rounded-xl border p-4 ${VERDICT_STYLES[pred.verdict.tone]}`}
    >
      <div className="font-semibold text-sm">{pred.verdict.label}</div>
      <p className="text-xs mt-1 leading-relaxed opacity-90">
        {pred.verdict.description}
      </p>
    </div>
  );
}

export default function CircuitQEDPanel() {
  const [f0GHz, setF0GHz] = useState(10);
  const [Qexp, setQexp] = useState(5); // slider is log10(Q)
  const [deltaXnm, setDeltaXnm] = useState(1);
  const [fmGHz, setFmGHz] = useState(20);
  const [tempmK, setTempmK] = useState(20);
  const [lengthMm, setLengthMm] = useState(10);
  const [integrationS, setIntegrationS] = useState(100);

  const params: CircuitQEDParams = useMemo(
    () => ({
      f0GHz,
      Q: Math.pow(10, Qexp),
      deltaXnm,
      fmGHz,
      tempmK,
      lengthMm,
      integrationS,
    }),
    [f0GHz, Qexp, deltaXnm, fmGHz, tempmK, lengthMm, integrationS]
  );

  const pred = useMemo(() => predictCqed(params), [params]);

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
              value={f0GHz}
              displayValue={`${f0GHz.toFixed(1)} GHz`}
              min={4}
              max={12}
              step={0.5}
              onChange={setF0GHz}
              minLabel="4 GHz"
              maxLabel="12 GHz"
            />
            <Slider
              label="Pump frequency fₘ (2·f₀ = resonance)"
              value={fmGHz}
              displayValue={`${fmGHz.toFixed(1)} GHz`}
              min={4}
              max={40}
              step={0.1}
              onChange={setFmGHz}
              minLabel="4 GHz"
              maxLabel="40 GHz"
            />
            <Slider
              label="Loaded quality factor Q"
              value={Qexp}
              displayValue={`10^${Qexp.toFixed(0)} = ${Math.pow(10, Qexp).toExponential(0)}`}
              min={4}
              max={6}
              step={0.25}
              onChange={setQexp}
              minLabel="10⁴"
              maxLabel="10⁶"
            />
            <Slider
              label="Boundary wiggle δx"
              value={deltaXnm}
              displayValue={`${deltaXnm.toFixed(1)} nm`}
              min={0.1}
              max={100}
              step={0.1}
              onChange={setDeltaXnm}
              minLabel="0.1 nm"
              maxLabel="100 nm"
            />
            <Slider
              label="Resonator electrical length L"
              value={lengthMm}
              displayValue={`${lengthMm.toFixed(1)} mm`}
              min={5}
              max={20}
              step={0.5}
              onChange={setLengthMm}
              minLabel="5 mm"
              maxLabel="20 mm"
            />
            <Slider
              label="Temperature"
              value={tempmK}
              displayValue={
                tempmK >= 1000
                  ? `${(tempmK / 1000).toFixed(0)} K`
                  : `${tempmK.toFixed(0)} mK`
              }
              min={10}
              max={300000}
              step={10}
              onChange={setTempmK}
              minLabel="10 mK"
              maxLabel="300 K"
            />
            <Slider
              label="Integration time"
              value={integrationS}
              displayValue={
                integrationS >= 3600
                  ? `${(integrationS / 3600).toFixed(1)} h`
                  : `${integrationS.toFixed(0)} s`
              }
              min={1}
              max={100000}
              step={1}
              onChange={setIntegrationS}
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
                sub={`over ${params.integrationS} s`}
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
                sub={`at ${params.tempmK >= 1000 ? (params.tempmK / 1000).toFixed(0) + " K" : params.tempmK.toFixed(0) + " mK"}`}
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
                sub={`Q = ${Math.pow(10, Qexp).toExponential(0)}`}
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
