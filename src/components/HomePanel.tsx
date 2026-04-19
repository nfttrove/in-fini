import PlainExplainer from "./ui/PlainExplainer";

export default function HomePanel() {
  return (
    <article className="space-y-8 max-w-3xl">
      <PlainExplainer title="Welcome to the Casimir & Cavity Field Simulator">
        <p>
          This interactive tool lets you explore quantum vacuum physics, the Casimir effect,
          rotating fields, cavity QED, and non-linear up-conversion. It also includes
          rigorous diagnostic tools to test claims of anomalous thrust or vacuum energy extraction.
        </p>
        <p className="mt-2">
          <strong>No over-unity hype.</strong> Just honest physics, open source, and educational.
        </p>
      </PlainExplainer>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold dark-mode:text-slate-100 light-mode:text-slate-900 coffee-mode:text-slate-100">What This Simulator Offers</h2>
        <ul className="list-disc pl-6 space-y-2 dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300">
          <li>Seven interactive tabs covering Casimir forces, rotating fields, cavity coupling, optical cavities, non-linear sideband generation, a predictive device model, and diagnostic tools.</li>
          <li>Real-time parameter sweeps with logarithmic axes, Lorentzian resonances, and Bessel sidebands – the same mathematics used in real quantum electrodynamics.</li>
          <li>Preset famous claims (Podkletnov, Searl, Biefeld-Brown, Manchester spheres) that the tool quantitatively explains using mundane artifacts.</li>
          <li>Plain-English explainers and colour-coded verdicts that teach experimental physics reasoning.</li>
          <li>Fully open source – no hidden agendas, just verifiable science.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold dark-mode:text-slate-100 light-mode:text-slate-900 coffee-mode:text-slate-100">What You Can Do in the Classroom</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-slate-200">1. Demonstrate Casimir force scaling F ∝ 1/d⁴ live</h3>
            <p className="text-sm dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400">Students slide plate separation and watch the force update instantly. They see that the vacuum is not "empty" – it has measurable physical effects.</p>
          </div>
          <div>
            <h3 className="font-semibold dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-slate-200">2. Show that a rotating polarization wave is not a magic rotor</h3>
            <p className="text-sm dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400">The rotating field tab animates a circularly polarised wave. Students learn that a "virtual rotor" is simply a rotating electric field – no moving parts, no violation of physics.</p>
          </div>
          <div>
            <h3 className="font-semibold dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-slate-200">3. Explain why the dynamical Casimir effect is negligible at low frequencies</h3>
            <p className="text-sm dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400">The device model includes the term (v/c)². With a 500 kHz drive and micrometre-scale rotor, (v/c)² ~ 10⁻¹⁹ → DCE power is astronomically small.</p>
          </div>
          <div>
            <h3 className="font-semibold dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-slate-200">4. Test historical claims with rigorous artifact budgets</h3>
            <p className="text-sm dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400">Load the "Podkletnov" or "Searl" preset. The tool attributes the claimed weight change to vibration, ion wind, or electrostatic forces. Students learn how experimental physics actually works.</p>
          </div>
          <div>
            <h3 className="font-semibold dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-slate-200">5. Challenge students to design an experiment that survives the leakage budget</h3>
            <p className="text-sm dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400">They adjust shielding, vacuum level, vibration isolation, and temperature control. Only when residual remains does the verdict become "Unexplained excess". This teaches the mindset of a real experimental physicist.</p>
          </div>
        </div>
      </section>

      <section className="dark-mode:bg-slate-800/40 light-mode:bg-blue-50/40 coffee-mode:bg-slate-800/40 dark-mode:border-slate-700/50 light-mode:border-blue-200/40 coffee-mode:border-slate-700/50 border p-5 rounded-lg space-y-3">
        <h2 className="text-lg font-semibold dark-mode:text-slate-100 light-mode:text-slate-900 coffee-mode:text-slate-100">Why This Matters</h2>
        <p className="dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300">
          A working free-energy device would be world-changing – but it would be a single data point. This simulator is a
          <strong className="dark-mode:text-slate-100 light-mode:text-slate-900 coffee-mode:text-slate-100"> platform for thinking</strong> – a tool that thousands of students and researchers can use
          to understand quantum vacuum physics, test their own ideas, and avoid the pitfalls that have trapped so many before.
        </p>
        <p className="dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300">
          <strong className="dark-mode:text-slate-100 light-mode:text-slate-900 coffee-mode:text-slate-100">This simulator doesn't hand you free energy – it hands you the truth about your experiment.</strong>
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold dark-mode:text-slate-100 light-mode:text-slate-900 coffee-mode:text-slate-100">Getting Started</h2>
        <p className="dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300">
          Browse the tabs above to explore different aspects of cavity physics. Start with the <strong>Casimir Effect</strong> tab
          to see basic vacuum forces, then move to the <strong>Device Model</strong> to see how to extract power (spoiler: you can't).
          Finally, try the <strong>Thrust & Weight Diagnostic</strong> to test real claims against mundane artifacts.
        </p>
        <p className="dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300">
          For structured lessons, see the <strong>Teacher's Guide</strong> and <strong>Lab Worksheet</strong> tabs.
        </p>
      </section>

      <section className="dark-mode:bg-gradient-to-br light-mode:bg-gradient-to-br coffee-mode:bg-gradient-to-br dark-mode:from-slate-700/40 dark-mode:to-slate-800/40 light-mode:from-emerald-50/50 light-mode:to-blue-50/50 coffee-mode:from-slate-700/40 coffee-mode:to-slate-800/40 dark-mode:border-slate-600/50 light-mode:border-emerald-200/30 coffee-mode:border-slate-600/50 border p-6 rounded-lg space-y-4">
        <h2 className="text-lg font-semibold dark-mode:text-slate-100 light-mode:text-slate-900 coffee-mode:text-slate-100">Go Build Something</h2>
        <p className="dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300">
          This simulator is a playground for ideas – but physics happens in the real world. The vacuum doesn't care about your sliders; it only responds to copper, glass, and voltage.
        </p>
        <div className="space-y-3 dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300 text-sm">
          <div>
            <p className="font-semibold dark-mode:text-slate-100 light-mode:text-slate-800 coffee-mode:text-slate-100">Build a Casimir demonstrator</p>
            <p>Two gold-coated plates, a piezoelectric actuator, and a sensitive scale. Measure the attraction. It's tiny – you'll need patience.</p>
          </div>
          <div>
            <p className="font-semibold dark-mode:text-slate-100 light-mode:text-slate-800 coffee-mode:text-slate-100">Construct an asymmetric capacitor (lifter)</p>
            <p>High voltage, thin wire, aluminium foil. Watch it buzz and lift. Now put it in a vacuum chamber. That's how you learn ion wind from antigravity.</p>
          </div>
          <div>
            <p className="font-semibold dark-mode:text-slate-100 light-mode:text-slate-800 coffee-mode:text-slate-100">Design a vibration-isolated thrust balance</p>
            <p>A torsion pendulum, laser pointer, and camera. One afternoon of shaky data teaches more than a hundred hours of perfect simulation.</p>
          </div>
        </div>
        <p className="dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300 text-sm">
          The simulator helps you design better experiments and interpret your data. But it will never replace the thrill of seeing a real needle move – or the humility of seeing it not move when you expected it to.
        </p>
        <p className="dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300 text-sm">
          <strong className="dark-mode:text-slate-100 light-mode:text-slate-800 coffee-mode:text-slate-100">When you do, come back to In Fini and plug your real numbers into the diagnostic tabs.</strong> Let the tool tell you: "Unexplained excess" – or "Fully explained by mundane artifacts." Either way, you'll know the truth.
        </p>
        <p className="dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-slate-200 italic font-medium">
          The vacuum is infinite. Your curiosity should be, too.
        </p>
      </section>
    </article>
  );
}
