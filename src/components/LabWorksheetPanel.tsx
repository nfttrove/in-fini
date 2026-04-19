import PlainExplainer from "./ui/PlainExplainer";

export default function LabWorksheetPanel() {
  return (
    <div className="space-y-6 max-w-3xl">
      <PlainExplainer title="Lab Worksheet – Interactive Experiments">
        <p>Use this worksheet to guide hands-on exploration of the simulator. Answer the questions as you vary parameters.</p>
      </PlainExplainer>

      <section className="dark-mode:bg-slate-800/30 light-mode:bg-blue-50/30 coffee-mode:bg-slate-800/30 dark-mode:border-slate-700/40 light-mode:border-blue-200/40 coffee-mode:border-slate-700/40 border p-4 rounded space-y-3">
        <h3 className="text-lg font-semibold dark-mode:text-slate-100 light-mode:text-slate-900 coffee-mode:text-slate-100">Part 1 – Casimir Force Scaling (Simulation)</h3>
        <p className="text-sm dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300"><strong>Objective:</strong> Verify the F ∝ 1/d⁴ scaling law.</p>
        <div className="space-y-2 text-sm dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-slate-300">
          <p><strong>Step 1:</strong> Open the Casimir Effect tab. Set plate separation to d = 1000 nm. Record the force and energy.</p>
          <p><strong>Step 2:</strong> Halve the separation to d = 500 nm. How does force change? (Should increase by 2⁴ = 16×.)</p>
          <p><strong>Step 3:</strong> Continue halving: 250 nm, 125 nm, 62.5 nm, 31.25 nm, 10 nm.</p>
          <p><strong>Step 4:</strong> Plot force vs. gap on a log-log graph. Is the slope close to -4?</p>
          <p><strong>Analysis:</strong> At what separation does the force become negligible? Could you practically measure it?</p>
        </div>
      </section>

      <section className="bg-slate-800/30 border border-slate-700/40 p-4 rounded space-y-3">
        <h3 className="text-lg font-semibold text-slate-100">Part 2 – Rotating Fields (Simulation)</h3>
        <p className="text-sm text-slate-300"><strong>Objective:</strong> Understand circular polarization and why it cannot extract energy.</p>
        <div className="space-y-2 text-sm text-slate-300">
          <p><strong>Step 1:</strong> Open the Rotating Field tab. Observe the E-field vector rotating.</p>
          <p><strong>Step 2:</strong> Vary the frequency and observe the rotation rate. Does it match your expectation?</p>
          <p><strong>Step 3:</strong> Vary the amplitude. Does changing amplitude change the rotation rate?</p>
          <p><strong>Question:</strong> A static circular polarization (zero frequency) does not rotate. Why can't we extract energy from it?</p>
        </div>
      </section>

      <section className="bg-slate-800/30 border border-slate-700/40 p-4 rounded space-y-3">
        <h3 className="text-lg font-semibold text-slate-100">Part 3 – Cavity Resonance (Simulation)</h3>
        <p className="text-sm text-slate-300"><strong>Objective:</strong> Measure cavity Q-factor and understand Lorentzian response.</p>
        <div className="space-y-2 text-sm text-slate-300">
          <p><strong>Step 1:</strong> Open the Cavity Coupling tab. Set cavity gap to 100 nm and Q = 1000.</p>
          <p><strong>Step 2:</strong> Sweep drive frequency from 0.1 MHz to 10 MHz. Note the peak power and frequency.</p>
          <p><strong>Step 3:</strong> Measure the full width at half maximum (FWHM) of the resonance peak.</p>
          <p><strong>Step 4:</strong> Compute Q from: Q = f₀ / FWHM. Does it match your input?</p>
          <p><strong>Step 5:</strong> Increase Q to 10,000 and repeat. How does the resonance change?</p>
        </div>
      </section>

      <section className="bg-slate-800/30 border border-slate-700/40 p-4 rounded space-y-3">
        <h3 className="text-lg font-semibold text-slate-100">Part 4 – Podkletnov Thrust Diagnostic (Simulation)</h3>
        <p className="text-sm text-slate-300"><strong>Objective:</strong> Understand how vibration and ion wind fake weight reduction.</p>
        <div className="space-y-2 text-sm text-slate-300">
          <p><strong>Step 1:</strong> Open the Thrust & Weight Diagnostic tab. Load the "Podkletnov (1992)" preset.</p>
          <p><strong>Step 2:</strong> Identify the dominant artifact channel. Which contributes more: vibration or ion wind?</p>
          <p><strong>Step 3:</strong> The verdict should show "Explained". What does this mean?</p>
          <p><strong>Step 4:</strong> Now reduce the ambient pressure to 1 Pa (hard vacuum). Does the verdict change?</p>
          <p><strong>Step 5:</strong> Reduce vibration amplitude to 1 nm. Does it change?</p>
          <p><strong>Challenge:</strong> What combination of parameters makes the residual "Unexplained"?</p>
        </div>
      </section>

      <section className="bg-slate-800/30 border border-slate-700/40 p-4 rounded space-y-3">
        <h3 className="text-lg font-semibold text-slate-100">Part 5 – DCE Theoretical Limit (Simulation)</h3>
        <p className="text-sm text-slate-300"><strong>Objective:</strong> Compare DCE prediction to real claims and understand orders of magnitude.</p>
        <div className="space-y-2 text-sm text-slate-300">
          <p><strong>Step 1:</strong> Open the Device Model tab. Leave parameters at defaults (50 nm, 500 kHz).</p>
          <p><strong>Step 2:</strong> What is the predicted power? (Should be ~5 µW.)</p>
          <p><strong>Step 3:</strong> Now try to maximise power:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Reduce cavity gap to 10 nm</li>
            <li>Increase frequency to 10 MHz</li>
            <li>Increase area to 100 cm²</li>
            <li>Set Q = 10⁶</li>
          </ul>
          <p><strong>Step 4:</strong> What is the new maximum power?</p>
          <p><strong>Analysis:</strong> Real claims are often 1 W or higher. How many orders of magnitude short are we?</p>
        </div>
      </section>

      <section className="bg-slate-800/30 border border-slate-700/40 p-4 rounded space-y-3">
        <h3 className="text-lg font-semibold text-slate-100">Part 6 – Design Challenge</h3>
        <p className="text-sm text-slate-300"><strong>Objective:</strong> Design an experiment that could genuinely test for anomalous thrust.</p>
        <div className="space-y-2 text-sm text-slate-300">
          <p><strong>Write a 1-paragraph proposal that includes:</strong></p>
          <ul className="list-disc pl-4 space-y-1">
            <li><strong>Artifact elimination:</strong> How will you suppress ion wind, vibration, electrostatic forces, and thermal effects?</li>
            <li><strong>Force measurement:</strong> What sensor will you use? How will you calibrate it?</li>
            <li><strong>Success threshold:</strong> What residual force would convince you there's a real effect?</li>
            <li><strong>Control experiments:</strong> What null tests would you run to rule out systematic errors?</li>
          </ul>
          <p><strong>Challenge questions:</strong></p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Why is hard vacuum important?</li>
            <li>Why must you test with the device OFF as well as ON?</li>
            <li>How does vibration isolation work?</li>
            <li>What is a Faraday cage and why does it matter?</li>
          </ul>
        </div>
      </section>

      <section className="dark-mode:bg-blue-900/20 light-mode:bg-blue-50 coffee-mode:bg-blue-900/20 dark-mode:border-blue-700/30 light-mode:border-blue-200 coffee-mode:border-blue-700/30 border p-4 rounded">
        <h3 className="text-base font-semibold dark-mode:text-blue-200 light-mode:text-blue-900 coffee-mode:text-blue-200">Key Physics Concepts</h3>
        <ul className="list-disc pl-6 space-y-1 text-sm dark-mode:text-blue-200/90 light-mode:text-blue-800 coffee-mode:text-blue-200/90">
          <li><strong>Casimir Effect:</strong> Attraction between conducting plates due to quantum vacuum fluctuations. Force ∝ 1/d⁴.</li>
          <li><strong>Dynamical Casimir Effect:</strong> Time-varying cavity can emit photons from vacuum. Predicted power ∝ (v/c)².</li>
          <li><strong>Lorentzian Resonance:</strong> Cavity response peaks near resonance frequency f₀, with width determined by Q-factor.</li>
          <li><strong>Bessel Sidebands:</strong> Frequency modulation creates sidebands at f₀ ± nf_m. Efficiency depends on modulation depth β.</li>
          <li><strong>Artifact Budget:</strong> Sum of all mundane forces (vibration, ion wind, electrostatic, thermal). If it exceeds claim, no anomaly is needed.</li>
        </ul>
      </section>
    </div>
  );
}
