import { useMemo, useState } from "react";
import Panel from "./ui/Panel";
import PlainExplainer from "./ui/PlainExplainer";
import Slider from "./ui/Slider";
import MetricCard from "./ui/MetricCard";
import {
  splToPressurePa,
  intensityWPerM2,
  soundForceN,
  vacuumForceN,
  equivalentVacuumGapNm,
  scaleVerdict,
} from "../utils/acousticCasimir";

// The panel's defaults, and the headline numbers the prose quotes from them.
const DEFAULT_SPL_DB = 120;
const DEFAULT_AREA_CM2 = 100;
const DEFAULT_GAP_NM = 100;
const HEADLINE_F = soundForceN(DEFAULT_SPL_DB, DEFAULT_AREA_CM2 * 1e-4, true);
const HEADLINE_MG = (HEADLINE_F / 9.80665) * 1e6;
const HEADLINE_GAP_NM = equivalentVacuumGapNm(HEADLINE_F, DEFAULT_AREA_CM2 * 1e-4);
const VACUUM_OVER_SOUND =
  vacuumForceN(DEFAULT_GAP_NM, DEFAULT_AREA_CM2 * 1e-4) / HEADLINE_F;

const VERDICT_STYLES: Record<string, string> = {
  emerald: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  amber: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  cyan: "border-cyan-500/40 bg-cyan-500/10 text-cyan-200",
};

export default function AcousticCasimirPanel() {
  const [splDb, setSplDb] = useState(DEFAULT_SPL_DB);
  const [areaCm2, setAreaCm2] = useState(DEFAULT_AREA_CM2);
  const [reflecting, setReflecting] = useState(true);
  const [gapNm, setGapNm] = useState(DEFAULT_GAP_NM);

  const areaM2 = useMemo(() => areaCm2 * 1e-4, [areaCm2]);
  const p = useMemo(() => splToPressurePa(splDb), [splDb]);
  const intensity = useMemo(() => intensityWPerM2(p), [p]);
  const force = useMemo(
    () => soundForceN(splDb, areaM2, reflecting),
    [splDb, areaM2, reflecting]
  );
  const mg = (force / 9.80665) * 1e6;
  const verdict = useMemo(() => scaleVerdict(force), [force]);
  const eqGapNm = useMemo(
    () => equivalentVacuumGapNm(force, areaM2),
    [force, areaM2]
  );
  const vacuumF = useMemo(() => vacuumForceN(gapNm, areaM2), [gapNm, areaM2]);

  return (
    <div className="space-y-6">
      <PlainExplainer title="Sound pushes like empty space — measure it at home">
        <p>
          A sound wave carries momentum, and momentum flux is pressure. The
          radiation pressure of a wave on a plate is its energy density,
          p²/ρc² — the structural analogue of the electromagnetic energy
          density whose imbalance between two plates is the vacuum Casimir
          effect. This build measures the simpler thing: the push of a
          single loud tone on one plate, for about €25. That is ordinary
          radiation pressure, not a fluctuation force; the true acoustic
          Casimir effect (Larraza &amp; Denardo, 1998) comes from broadband
          noise excluded between two plates, and needs a proper lab.
        </p>
        <p className="mt-2 dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400">
          <span className="font-semibold dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-slate-200">Try this:</span>{" "}
          leave the sliders at the defaults: a speaker at the threshold of
          pain ({DEFAULT_SPL_DB} dB) pushing on a {DEFAULT_AREA_CM2} cm²
          reflecting plate with about {HEADLINE_MG.toFixed(0)} milligrams of
          force — the same force the vacuum Casimir effect exerts across a
          ~{(Math.round(HEADLINE_GAP_NM / 10) * 10).toFixed(0)}-nanometre gap
          on the same area. A jewelry scale can register one tonight, if it
          survives the null tests below; the other needs a nanotech lab.
        </p>
      </PlainExplainer>

      <div className={`rounded-xl border p-4 ${VERDICT_STYLES[verdict.tone]}`}>
        <div className="font-semibold text-sm">{verdict.label}</div>
        <p className="text-xs mt-1 leading-relaxed opacity-90">
          {verdict.description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Panel title="The rig (and the speaker)">
          <div className="space-y-5">
            <Slider
              label="Sound pressure level"
              value={splDb}
              displayValue={`${splDb.toFixed(0)} dB SPL`}
              min={60}
              max={160}
              step={1}
              onChange={setSplDb}
              minLabel="60 dB — conversation"
              maxLabel="160 dB — hearing gone"
            />
            <Slider
              label="Plate area"
              value={areaCm2}
              displayValue={`${areaCm2.toFixed(0)} cm²`}
              min={1}
              max={1000}
              step={1}
              onChange={setAreaCm2}
              minLabel="1 cm²"
              maxLabel="1000 cm²"
            />
            <Slider
              label="Comparison gap (vacuum Casimir)"
              value={gapNm}
              displayValue={`${gapNm.toFixed(0)} nm`}
              min={10}
              max={1000}
              step={10}
              onChange={setGapNm}
              minLabel="10 nm"
              maxLabel="1 µm"
            />
            <div className="flex gap-2">
              {[
                { v: true, label: "Rigid reflector (2u)" },
                { v: false, label: "Absorber (u)" },
              ].map((o) => (
                <button
                  key={o.label}
                  onClick={() => setReflecting(o.v)}
                  aria-pressed={reflecting === o.v}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    reflecting === o.v
                      ? "bg-cyan-600 text-white"
                      : "dark-mode:bg-slate-700 light-mode:bg-slate-200 coffee-mode:bg-slate-700 dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-amber-100"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title="What the sound does">
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                label="Acoustic pressure (RMS)"
                value={
                  p >= 0.01 ? `${p.toFixed(1)} Pa` : `${p.toExponential(1)} Pa`
                }
                sub={`${splDb.toFixed(0)} dB SPL`}
              />
              <MetricCard
                label="Intensity"
                value={
                  intensity >= 0.001
                    ? `${intensity.toFixed(2)} W/m²`
                    : `${intensity.toExponential(1)} W/m²`
                }
                sub="p²/ρc"
              />
              <MetricCard
                label="Force on the plate"
                value={`${mg >= 0.01 ? mg.toFixed(2) : mg.toExponential(1)} mg-equivalent`}
                sub={`${(reflecting ? 2 : 1) === 2 ? "2p²" : "p²"}/ρc² · A`}
                color="dark-mode:text-cyan-400 light-mode:text-cyan-700 coffee-mode:text-cyan-400"
              />
              <MetricCard
                label="Equals vacuum Casimir at"
                value={isFinite(eqGapNm) ? `${eqGapNm.toFixed(0)} nm` : "—"}
                sub="same force, same area, empty space"
              />
            </div>
          </Panel>

          <Panel title="The other side of the comparison">
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                label={`Vacuum force at ${gapNm.toFixed(0)} nm`}
                value={`${((vacuumF / 9.80665) * 1e6).toExponential(2)} mg-eq`}
                sub="on the same plate area"
              />
              <MetricCard
                label="Sound ÷ vacuum at this gap"
                value={(force / (vacuumF || Infinity)).toExponential(2) + "×"}
                sub={
                  force > vacuumF
                    ? "the speaker wins at this gap"
                    : "the vacuum wins at this gap"
                }
              />
            </div>
            <p className="text-xs dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-amber-700 mt-4 leading-relaxed">
              Note the direction of the surprise: at {DEFAULT_GAP_NM} nm the
              vacuum is about {VACUUM_OVER_SOUND.toExponential(0)}× stronger
              than a painful speaker (at the defaults). The
              Casimir effect is not feeble — it is confined to absurdly
              small gaps. Sound is how you get the same force at human
              scales, which is why it makes the perfect classroom analogue.
            </p>
          </Panel>

          <Panel title="Build it tonight (the honest version)">
            <ul className="text-xs dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-amber-700 space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>Ear protection first: 120 dB is the threshold of pain and can damage hearing within seconds. Earmuffs on, short tone bursts.</li>
              <li>Any speaker; a tone-generator app set to a few hundred Hz.</li>
              <li>A 0.001 g jewelry scale (≈ €15). Put the plate ON the scale, speaker facing down above it on its own stand — not touching the table the scale sits on.</li>
              <li>Tone ON vs OFF gives a difference, not yet radiation pressure: table vibration, acoustic streaming (the steady airflow loud sound drives), the speaker's magnet and its heating all switch on with the tone.</li>
              <li>Null tests that pull them apart: (1) swap the reflecting plate for an absorbing one of the same mass and area (foam-faced) — radiation pressure should roughly halve (2u → u) while vibration and magnetic pull stay the same; (2) put a solid barrier in the sound path with the tone on — whatever the scale still reads is not sound; (3) raise the level by 3 dB — radiation pressure doubles (∝ p²), but so does streaming, which is why (1) matters.</li>
              <li>Expect factors of a few either way from near-field and standing-wave effects: the plane-wave numbers are an estimate, not a floor. The Larraza–Denardo two-plate geometry (Phys. Lett. A 248, 151, 1998) — the real "acoustic Casimir" — needs more care still.</li>
              <li>File your measured force in the Claim Registry with "sound" as the artifact — same rules as everything else.</li>
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
