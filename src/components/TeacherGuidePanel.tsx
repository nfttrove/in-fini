import PlainExplainer from "./ui/PlainExplainer";

export default function TeacherGuidePanel() {
  return (
    <div className="space-y-6 max-w-3xl">
      <PlainExplainer title="Teacher's Guide – Demystifying Quantum Hype">
        <p>The quantum vacuum doesn't hand out free energy—but it's endlessly fascinating. Use this guide to teach students how to evaluate bold claims with real physics. Spoiler: most of them evaporate under scrutiny.</p>
      </PlainExplainer>

      <section className="space-y-2">
        <h3 className="text-lg font-semibold dark-mode:text-slate-100 light-mode:text-slate-900 coffee-mode:text-slate-100">1. The Vacuum Isn't Empty—It's Just Shy (30 min)</h3>
        <p className="text-sm dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400"><strong>Tab:</strong> Casimir Effect</p>
        <p className="text-sm dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300">
          <strong>Activity:</strong> Squeeze two plates together and watch the force explode. Vary separation from 1000 nm down to 1 nm. Does it obey F ∝ 1/d⁴? Plot it on a log-log graph—if it's a straight line, the universe is elegant.
        </p>
        <p className="text-sm dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300">
          <strong>Why this matters:</strong> The Casimir force is real, measurable, and weird. But it's also conservative—like a spring, not a battery. You can't extract net energy from it. So when someone says they built a Casimir motor, ask: "Which law of thermodynamics did you break?"
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-semibold dark-mode:text-slate-100 light-mode:text-slate-900 coffee-mode:text-slate-100">2. The "Virtual Rotor" Gambit (30 min)</h3>
        <p className="text-sm dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400"><strong>Tab:</strong> Rotating Field</p>
        <p className="text-sm dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300">
          <strong>Activity:</strong> Watch a circularly polarised wave spin like a propeller. Vary frequency. It looks dynamic, even alive—but it's just an electric field doing the hokey-pokey.
        </p>
        <p className="text-sm dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300">
          <strong>The trap:</strong> Some papers call this a "virtual rotor" and hint that rotating things extract energy. Nonsense. Rotation without moving parts is just a disguise for a travelling wave. The energy doesn't come from thin air—ask them where the Poynting vector goes.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-semibold dark-mode:text-slate-100 light-mode:text-slate-900 coffee-mode:text-slate-100">3. Resonance & Sidebands—No Free Lunch (40 min)</h3>
        <p className="text-sm dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400"><strong>Tabs:</strong> Cavity Coupling, Non-linear Coupling</p>
        <p className="text-sm dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300">
          <strong>Activity 1:</strong> Sweep drive frequency through resonance. Watch the peak spike. Measure FWHM and compute Q. Ask: why is this so sharp? (Answer: energy gets trapped and recycled before leaking out.)
        </p>
        <p className="text-sm dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300">
          <strong>Activity 2:</strong> Crank up modulation depth β. Sidebands pop out at f₀ ± f_m. Looks like free power, right? Wrong. Where does the sideband energy come from? (The main carrier. You're just stealing from Peter to pay Paul.)
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-semibold dark-mode:text-slate-100 light-mode:text-slate-900 coffee-mode:text-slate-100">4. The Myth-Busting Tab (45 min)</h3>
        <p className="text-sm dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400"><strong>Tab:</strong> Thrust & Weight Diagnostic</p>
        <p className="text-sm dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300">
          <strong>Activity:</strong> Load the presets and watch reality take over:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-sm dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300">
          <li><strong>Podkletnov (1992):</strong> Claims 0.053% weight loss. Vibration alone explains 1.9%. Verdict: your table is shaking harder than the signal is real.</li>
          <li><strong>Searl Effect:</strong> Claims 78% weight loss. Even with all artifacts maxed, you can't reach it. Physics: 1. Hype: 0.</li>
          <li><strong>Manchester Spheres:</strong> Micro-scale "levitation". Reduce pressure to hard vacuum. Does it still float? (Spoiler: no.)</li>
        </ul>
        <p className="text-sm dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300">
          <strong>Key insight:</strong> Vibration is the best liar in experimental physics. A shaky scale averages acceleration over time, faking a weight change. This is why serious experiments sit inside multi-layer vibration isolators that cost more than a car.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-semibold dark-mode:text-slate-100 light-mode:text-slate-900 coffee-mode:text-slate-100">5. Why Your 500 kHz Buzzer Won't Power a Lightbulb (30 min)</h3>
        <p className="text-sm dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400"><strong>Tab:</strong> Device Model — Power from Vacuum</p>
        <p className="text-sm dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300">
          <strong>Activity:</strong> Turn every knob to maximum. Tiny gap (10 nm). Insane Q (10⁶). Huge area (10 cm²). Run at 10 MHz:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-sm dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300">
          <li>Predicted power: ~100 µW (microWatts)</li>
          <li>Claimed power: 1.3 W (Watts)</li>
          <li>Shortfall: 10,000×. That's not an oopsie, it's a cosmological reality check.</li>
        </ul>
        <p className="text-sm dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300">
          <strong>Why?</strong> The (v/c)² term. Your rotor moves at 0.15 m/s. Light moves at 3×10⁸ m/s. The ratio squared is 2.7×10⁻¹⁹. You can't escape this. It's not a design flaw—it's thermodynamics.
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-semibold dark-mode:text-slate-100 light-mode:text-slate-900 coffee-mode:text-slate-100">6. Design a Million-Dollar Experiment (60 min)</h3>
        <p className="text-sm dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300">
          <strong>Team Challenge:</strong> Design an experiment to test for real anomalous thrust. Don't hold back—assume you have a budget. What do you need?
        </p>
        <ul className="list-disc pl-6 space-y-1 text-sm dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300">
          <li><strong>Vacuum:</strong> How low? (Hint: 10⁻⁶ Pa eliminates ion wind. Hard vacuum is expensive.)</li>
          <li><strong>Vibration isolation:</strong> Passive springs? Active damping? Seismic sensors? (Budget ≈ $500k.)</li>
          <li><strong>Force sensor:</strong> What sensitivity? How do you calibrate it? What's your noise floor?</li>
          <li><strong>Thermal control:</strong> How stable? Cryogenic? (This is why real labs look like spaceships.)</li>
          <li><strong>Null tests:</strong> Device on vs. off. Fake device (no electronics). Reversed polarity. What kills the signal?</li>
        </ul>
        <p className="text-sm dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300">
          <strong>Debrief:</strong> Compare designs. Estimate budgets. Ask: "Why haven't we seen this effect in published data?" Answer: designing the experiment is hard. Actually running it is harder. Finding a signal that survives all controls is hardest of all.
        </p>
      </section>

      <section className="dark-mode:bg-slate-800/40 light-mode:bg-blue-50/40 coffee-mode:bg-slate-800/40 dark-mode:border-slate-700/50 light-mode:border-blue-200/40 coffee-mode:border-slate-700/50 border p-4 rounded-lg space-y-2">
        <h3 className="text-base font-semibold dark-mode:text-slate-100 light-mode:text-slate-900 coffee-mode:text-slate-100">What Your Students Will Learn</h3>
        <ul className="list-disc pl-6 space-y-1 text-sm dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300">
          <li>The Casimir effect is real and measurable—and completely useless as a power source.</li>
          <li>Rotating polarizations aren't magic—they're waves. Waves move energy, not create it.</li>
          <li>Sidebands don't produce free power. They steal from the main signal. Conservation of energy: forever undefeated.</li>
          <li>Most "anomalous" effects are actually vibration, hot air, or bad measurement. The leakage budget is the hammer that breaks hype.</li>
          <li>Designing a real test is hard, expensive, and boring. That's why good science beats YouTube videos.</li>
          <li>They can evaluate any bold claim by asking three questions: (1) Where's the control? (2) Where's the leakage budget? (3) Why hasn't Nature's Nobel Prize committee called?</li>
        </ul>
      </section>
    </div>
  );
}
