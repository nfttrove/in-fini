import { useMemo, useState } from "react";
import NonlinearControls from "./nonlinear/NonlinearControls";
import NonlinearMetrics from "./nonlinear/NonlinearMetrics";
import NonlinearComb from "./nonlinear/NonlinearComb";
import NonlinearEfficiency from "./nonlinear/NonlinearEfficiency";
import NonlinearSweep from "./nonlinear/NonlinearSweep";
import NonlinearNotes from "./nonlinear/NonlinearNotes";
import PresetBar from "./ui/PresetBar";
import PlainExplainer from "./ui/PlainExplainer";
import { besselJ } from "../utils/bessel";

export default function NonlinearCouplingPanel() {
  const [f0THz, setF0THz] = useState(3000);
  const [fmKHz, setFmKHz] = useState(500);
  const [beta, setBeta] = useState(0.3);
  const [maxOrder, setMaxOrder] = useState(6);
  const [Q, setQ] = useState(10000);

  const f0Hz = f0THz * 1e12;
  const fmHz = fmKHz * 1e3;

  const sidebands = useMemo(() => {
    const arr: { n: number; freq: number; amp: number }[] = [];
    for (let n = -maxOrder; n <= maxOrder; n++) {
      arr.push({
        n,
        freq: f0Hz + n * fmHz,
        amp: besselJ(n, beta),
      });
    }
    return arr;
  }, [f0Hz, fmHz, beta, maxOrder]);

  const j0 = besselJ(0, beta);
  const j1 = besselJ(1, beta);
  const carrierPower = j0 * j0;
  const n1Power = 2 * j1 * j1;
  const gamma = f0Hz / Q;
  const lorN1 = 1 / (1 + Math.pow((2 * fmHz) / gamma, 2));
  const overlapN1 = j1 * j1 * lorN1;
  const totalComb = sidebands.reduce((s, sb) => s + sb.amp * sb.amp, 0);
  const ordersWithinLinewidth = sidebands.filter(
    (s) => Math.abs(s.freq - f0Hz) < gamma / 2
  ).length;

  return (
    <div className="space-y-6">
      <PlainExplainer title="Why are there so many spikes?">
        <p>
          Take a pure tone (the &ldquo;carrier&rdquo;) and wobble it up and
          down at a slower rhythm. The wobble splits the original tone into
          a neat ladder of new tones evenly spaced above and below — a
          &ldquo;frequency comb.&rdquo; Radio stations use this trick every
          day; it&rsquo;s just FM.
        </p>
        <p className="dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400">
          <span className="font-semibold dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-slate-200">Try this:</span>{" "}
          Raise the modulation depth (β) to push energy away from the
          carrier and into the sidebands.
        </p>
      </PlainExplainer>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NonlinearControls
          f0THz={f0THz}
          fmKHz={fmKHz}
          beta={beta}
          maxOrder={maxOrder}
          Q={Q}
          onF0={setF0THz}
          onFm={setFmKHz}
          onBeta={setBeta}
          onOrder={setMaxOrder}
          onQ={setQ}
        />
        <NonlinearMetrics
          j0={j0}
          j1={j1}
          carrierPower={carrierPower}
          n1Power={n1Power}
          overlapN1={overlapN1}
          totalComb={totalComb}
          ordersWithinLinewidth={ordersWithinLinewidth}
        />
      </div>

      <NonlinearComb
        f0Hz={f0Hz}
        fmHz={fmHz}
        maxOrder={maxOrder}
        Q={Q}
        sidebands={sidebands}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NonlinearEfficiency beta={beta} maxBeta={1} />
        <NonlinearSweep f0Hz={f0Hz} fmHz={fmHz} beta={beta} Q={Q} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <NonlinearNotes f0THz={f0THz} fmKHz={fmKHz} j1={j1} />
        </div>
        <PresetBar
          panel="nonlinear"
          currentParams={{ f0THz, fmKHz, beta, maxOrder, Q }}
          onLoad={(p) => {
            if (typeof p.f0THz === "number") setF0THz(p.f0THz);
            if (typeof p.fmKHz === "number") setFmKHz(p.fmKHz);
            if (typeof p.beta === "number") setBeta(p.beta);
            if (typeof p.maxOrder === "number") setMaxOrder(p.maxOrder);
            if (typeof p.Q === "number") setQ(p.Q);
          }}
        />
      </div>
    </div>
  );
}
