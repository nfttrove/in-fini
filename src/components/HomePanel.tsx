import PlainExplainer from "./ui/PlainExplainer";

export default function HomePanel() {
  return (
    <article className="space-y-8 max-w-3xl">
      <PlainExplainer title="Welcome to In Fini — the honest physics desk">
        <p>
          This is a workbench for quantum vacuum physics and for the claims
          people make about it. Simulate the Casimir effect, cavity
          resonances, and the experiment that actually made photons out of
          vacuum. Then turn the same mathematics on extraordinary claims —
          over-unity generators, antigravity disks — and watch artifact
          budgets do the arguing.
        </p>
        <p className="mt-2">
          <strong>No over-unity hype.</strong> Honest numbers, stated
          assumptions, error bars, and open source all the way down.
        </p>
      </PlainExplainer>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold dark-mode:text-slate-100 light-mode:text-slate-900 coffee-mode:text-slate-100">What's on the desk</h2>
        <ul className="list-disc pl-6 space-y-2 dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300">
          <li><strong>Eighteen interactive tabs</strong>: from Casimir forces to the only experiment that ever coaxed photon pairs out of empty space (microwave circuit QED), to the 95% of the universe your instruments can't reach.</li>
          <li><strong>Real mathematics, not vignettes</strong>: logarithmic sweeps, Lorentzian resonances, Bessel sidebands, g² correlation spectroscopy, FFT residual hunting — the same machinery used in real quantum electrodynamics.</li>
          <li><strong>Artifact budgets with error bars</strong>: load a famous claim (Podkletnov, Searl, Biefeld–Brown, the Manchester spheres) and watch the mundane channels — vibration, ion wind, electrostatics, thermal buoyancy — account for it, with uncertainties.</li>
          <li><strong>The experiment-design inverter</strong>: don't just judge claims — state the effect you want to detect and learn what your rig must achieve, down to the thermal noise floor of matter itself.</li>
          <li><strong>A public record</strong>: file claims with their budgets, pre-register predictions before you measure, and join the Replication Network's calibration census with the phone in your pocket.</li>
          <li><strong>Things you can build tonight</strong>: an acoustic Casimir — the vacuum Casimir effect's big, cheap cousin — with a speaker and a jewelry scale.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold dark-mode:text-slate-100 light-mode:text-slate-900 coffee-mode:text-slate-100">Five classroom moves</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-slate-200">1. Demonstrate Casimir force scaling F ∝ 1/d⁴, live</h3>
            <p className="text-sm dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400">Students drag the plate separation and watch the force update instantly. The vacuum isn't "empty" — it pushes, measurably.</p>
          </div>
          <div>
            <h3 className="font-semibold dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-slate-200">2. Show why a rotating polarization wave isn't a magic rotor</h3>
            <p className="text-sm dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400">A "virtual rotor" is just a rotating electric field. No moving parts, no physics violated, no matter how good the patent drawing looks.</p>
          </div>
          <div>
            <h3 className="font-semibold dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-slate-200">3. Show where vacuum energy extraction actually works</h3>
            <p className="text-sm dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400">The Device Model shows why spinning rotors drown in the (v/c)² wall; the Circuit QED tab shows the one 2011 experiment that beat it — with a cryogenic GHz pump and a stiff invoice. Compare the two side by side.</p>
          </div>
          <div>
            <h3 className="font-semibold dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-slate-200">4. Put a famous claim on trial — with error bars</h3>
            <p className="text-sm dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400">Load "Podkletnov" and let the budget attribute the weight change to vibration and corona. Then jitter the parameters ±20% and ask the class which verdicts survive. That's experimental physics as she is practiced.</p>
          </div>
          <div>
            <h3 className="font-semibold dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-slate-200">5. Design an experiment that survives its own budget</h3>
            <p className="text-sm dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400">The Experiment Design tab inverts the physics: pick an effect size and a σ threshold, get the rig requirements. Push the claim small enough and hit the thermal floor — where matter itself can no longer arbitrate.</p>
          </div>
        </div>
      </section>

      <section className="dark-mode:bg-slate-800/40 light-mode:bg-blue-50/40 coffee-mode:bg-slate-800/40 dark-mode:border-slate-700/50 light-mode:border-blue-200/40 coffee-mode:border-slate-700/50 border p-5 rounded-lg space-y-3">
        <h2 className="text-lg font-semibold dark-mode:text-slate-100 light-mode:text-slate-900 coffee-mode:text-slate-100">Why this matters</h2>
        <p className="dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300">
          A working free-energy device would be world-changing — but it would be a single data point. This is a
          <strong className="dark-mode:text-slate-100 light-mode:text-slate-900 coffee-mode:text-slate-100"> platform for thinking</strong>: a tool thousands of students and researchers can use to understand vacuum physics, stress-test their own ideas, and avoid the pitfalls that have trapped so many before.
        </p>
        <p className="dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300">
          <strong className="dark-mode:text-slate-100 light-mode:text-slate-900 coffee-mode:text-slate-100">This simulator doesn't hand you free energy — it hands you the truth about your experiment.</strong>
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold dark-mode:text-slate-100 light-mode:text-slate-900 coffee-mode:text-slate-100">Getting started</h2>
        <p className="dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300">
          One honest path through the desk: start at <strong>Casimir Effect</strong> to feel the vacuum push. Move to <strong>Device Model</strong> to learn why extracting its energy is brutally hard (spoiler: you can't, at any price matter allows). Open <strong>Circuit QED</strong> to see the one way it was actually done. Then graduate to the grown-up tabs: put a claim on trial in <strong>Claim Registry</strong>, design your own rig in <strong>Experiment Design</strong>, and analyze real data in the <strong>Data Lab</strong>.
        </p>
        <p className="dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300">
          For structured lessons, the <strong>Teacher's Guide</strong> and <strong>Lab Worksheet</strong> tabs have you covered.
        </p>
      </section>

      <section className="dark-mode:bg-gradient-to-br light-mode:bg-gradient-to-br coffee-mode:bg-gradient-to-br dark-mode:from-slate-700/40 dark-mode:to-slate-800/40 light-mode:from-emerald-50/50 light-mode:to-blue-50/50 coffee-mode:from-slate-700/40 coffee-mode:to-slate-800/40 dark-mode:border-slate-600/50 light-mode:border-emerald-200/30 coffee-mode:border-slate-600/50 border p-6 rounded-lg space-y-4">
        <h2 className="text-lg font-semibold dark-mode:text-slate-100 light-mode:text-slate-900 coffee-mode:text-slate-100">Go build something</h2>
        <p className="dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300">
          This simulator is a playground for ideas — but physics happens in the real world. The vacuum doesn't care about your sliders; it only responds to copper, glass, and voltage.
        </p>
        <div className="space-y-3 dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300 text-sm">
          <div>
            <p className="font-semibold dark-mode:text-slate-100 light-mode:text-slate-800 coffee-mode:text-slate-100">Tonight: an acoustic Casimir (≈ €25)</p>
            <p>A speaker, a tone-generator app, and a 0.001 g jewelry scale. Sound's radiation pressure pushes a plate with the same force the vacuum Casimir exerts across a ~700 nm gap — and your scale will watch it happen. The <strong>Acoustic Casimir</strong> tab has the parts list.</p>
          </div>
          <div>
            <p className="font-semibold dark-mode:text-slate-100 light-mode:text-slate-800 coffee-mode:text-slate-100">Sixty seconds: join the fleet</p>
            <p>Lay your phone on the table and record a census run in the <strong>Replication Network</strong> tab. Your noise floor joins the fleet's collective bound — the crowd-sourced detection limit before anyone replicates anything.</p>
          </div>
          <div>
            <p className="font-semibold dark-mode:text-slate-100 light-mode:text-slate-800 coffee-mode:text-slate-100">A weekend: a thrust balance</p>
            <p>A torsion pendulum, a laser pointer, and a camera. One afternoon of shaky data teaches more than a hundred hours of perfect simulation — bring the CSV to the <strong>Data Lab</strong> afterward.</p>
          </div>
        </div>
        <p className="dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300 text-sm">
          When you've built something, come back and file it in the <strong>Claim Registry</strong> — pre-registered if you're serious. Let the tool say "Unexplained excess" or "Fully explained by mundane artifacts." Either way, you'll know the truth, and so will everyone else.
        </p>
        <p className="dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-slate-200 italic font-medium">
          The vacuum is infinite. Your curiosity should be, too.
        </p>
      </section>
    </article>
  );
}
