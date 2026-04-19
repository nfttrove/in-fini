import Panel from "../ui/Panel";

export default function ThrustNotes() {
  return (
    <Panel title="How to use this diagnostic">
      <div className="text-sm dark-mode:text-slate-300 light-mode:text-slate-900 coffee-mode:text-slate-300 leading-relaxed space-y-3">
        <p>
          Every claim of anomalous thrust or weight reduction must first survive
          a quantitative artifact budget. Enter the measured or specified values
          for your experiment on the left; the tool sums five mundane force
          channels and reports the <em>residual</em> -- the portion of the
          claimed weight change that is <em>not</em> accounted for by known
          physics.
        </p>
        <ul className="list-disc list-inside space-y-1 dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400">
          <li>
            <span className="text-cyan-300">Ion wind / corona:</span> charged
            particles accelerated by high-voltage electrodes push air and create
            a net thrust indistinguishable from antigravity.
          </li>
          <li>
            <span className="text-amber-300">Vibration force:</span> mechanical
            oscillations of the device create a time-averaged apparent weight
            change on the scale.
          </li>
          <li>
            <span className="text-rose-300">Electrostatic image:</span>{" "}
            capacitive attraction or repulsion between charged surfaces and
            nearby conductors (including the balance pan).
          </li>
          <li>
            <span className="text-emerald-300">Thermal convection:</span>{" "}
            heated air around the device rises and creates a buoyant lift force.
          </li>
          <li>
            <span className="text-sky-300">Buoyancy shift:</span> local heating
            reduces air density, decreasing the effective weight of displaced
            air.
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
