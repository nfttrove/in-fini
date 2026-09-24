import Panel from "../ui/Panel";

export default function ThrustNotes() {
  return (
    <Panel title="How to use this diagnostic">
      <div className="text-sm dark-mode:text-slate-300 light-mode:text-slate-900 coffee-mode:text-slate-300 leading-relaxed space-y-3">
        <p>
          Every claim of anomalous thrust or weight reduction must first survive
          a quantitative artifact budget. Enter the measured or specified values
          for your experiment on the left; the tool sums four mundane force
          channels and reports the <em>residual</em> -- the portion of the
          claimed weight change that is <em>not</em> accounted for by known
          physics. The vibration, electrostatic and thermal channels are generous
          allowances (upper bounds), so a claim inside them is one the artifacts{" "}
          <em>could</em> produce. The ion-wind channel is a heuristic scaled to a
          desktop corona rig's ~10 cm² discharge area; a large-electrode rig can
          push harder.
        </p>
        <ul className="list-disc list-inside space-y-1 dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400">
          <li>
            <span className="text-cyan-300">Ion wind / corona:</span> charged
            particles accelerated by high-voltage electrodes push air and create
            a net thrust indistinguishable from antigravity. It needs air: pump
            down until the ions' mean free path passes the electrode gap and
            it vanishes.
          </li>
          <li>
            <span className="text-amber-300">Vibration force:</span> a shaking
            device pushes on the scale with a peak force m ω² x. A linear
            balance averages that to zero; it reads as a steady weight change
            only through a nonlinearity (a bouncing contact, a saturating or
            filtering readout), so the peak is counted as an upper bound.
          </li>
          <li>
            <span className="text-rose-300">Electrostatic image:</span>{" "}
            capacitive attraction or repulsion between charged surfaces and
            nearby conductors (including the balance pan).
          </li>
          <li>
            <span className="text-emerald-300">Thermal buoyancy:</span>{" "}
            heated air around the device is lighter and rises, lifting it.
            One channel, counted once; it scales with air density, so it too
            fades in vacuum.
          </li>
        </ul>
        <p className="text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-slate-500">
          A verdict of <strong>Unexplained excess</strong> means the claim
          cannot be closed with ordinary artifact forces -- either the
          measurement is wrong, or something interesting is happening. A
          verdict of <strong>Fully explained</strong> means the claim is
          quantitatively reproduced by mundane forces; no anomalous thrust is
          required.
        </p>
      </div>
    </Panel>
  );
}
