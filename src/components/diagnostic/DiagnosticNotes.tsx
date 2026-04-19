import Panel from "../ui/Panel";

export default function DiagnosticNotes() {
  return (
    <Panel title="How to use this diagnostic">
      <div className="text-sm dark-mode:text-slate-300 light-mode:text-slate-900 coffee-mode:text-slate-300 leading-relaxed space-y-3">
        <p>
          Every claim of anomalous vacuum-derived power must first survive a
          quantitative leakage budget. Enter the measured or specified values
          for your experiment on the left; the tool sums four mundane power
          channels and reports the <em>residual</em> — the portion of the
          claimed output that is <em>not</em> accounted for by known physics.
        </p>
        <ul className="list-disc list-inside space-y-1 dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400">
          <li>
            <span className="text-amber-300">Ohmic / Joule:</span> I²R in the
            drive loop, ground straps, and parasitic interconnects.
          </li>
          <li>
            <span className="text-cyan-300">RF pickup:</span> capacitive and
            inductive coupling of the drive signal past the shield, attenuated
            by <span className="font-mono">10^(−S/10)</span>.
          </li>
          <li>
            <span className="text-rose-300">Blackbody differential:</span>{" "}
            Stefan–Boltzmann radiation between the hot and cold surfaces.
          </li>
          <li>
            <span className="text-emerald-300">Mechanical bleed-through:</span>{" "}
            oscillating-rotor kinetic energy leaking into the detector via the
            mechanical <span className="font-mono">Q</span>.
          </li>
        </ul>
        <p className="text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-slate-500">
          A verdict of <strong>Unexplained excess</strong> means the claim
          cannot be closed with ordinary engineering artefacts — either the
          measurement is wrong, or something interesting is happening. A
          verdict of <strong>Fully explained</strong> means the claim is
          quantitatively reproduced by leakage; no new physics is required.
        </p>
      </div>
    </Panel>
  );
}
