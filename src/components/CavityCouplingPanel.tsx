import { useState } from "react";
import CavityControls from "./coupling/CavityControls";
import CavityMetrics from "./coupling/CavityMetrics";
import CavitySpectrum from "./coupling/CavitySpectrum";
import CavityField from "./coupling/CavityField";
import CavityNotes from "./coupling/CavityNotes";
import PresetBar from "./ui/PresetBar";
import PlainExplainer from "./ui/PlainExplainer";
import { cavityResonantFrequency, couplingStrength } from "../utils/physics";

export default function CavityCouplingPanel() {
  const [cavityLength, setCavityLength] = useState(0.3);
  const [modeNumber, setModeNumber] = useState(1);
  const [drivingFreqKHz, setDrivingFreqKHz] = useState(500);
  const [Q, setQ] = useState(1000);
  const [running, setRunning] = useState(true);

  const resonantFreqHz = cavityResonantFrequency(cavityLength, modeNumber);
  const resonantFreqKHz = resonantFreqHz / 1e3;
  const drivingFreqHz = drivingFreqKHz * 1e3;
  const coupling = couplingStrength(drivingFreqHz, resonantFreqHz, Q);
  const detuning = ((drivingFreqKHz - resonantFreqKHz) / resonantFreqKHz) * 100;

  return (
    <div className="space-y-6">
      <PlainExplainer title="Think of a wine glass">
        <p>
          Tap a wine glass and it rings at one special note. Sing that same
          note back at it and the glass vibrates strongly — sometimes
          enough to shatter it. A cavity is the same idea, but with
          electromagnetic waves instead of sound. It has a
          &ldquo;favourite&rdquo; frequency, and driving it near that
          frequency produces a huge response.
        </p>
        <p className="dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400">
          <span className="font-semibold dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-slate-200">Try this:</span>{" "}
          Move the driving frequency slider until it matches the cavity&rsquo;s
          resonant frequency. Watch the coupling strength spike.
        </p>
      </PlainExplainer>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CavityControls
          cavityLength={cavityLength}
          modeNumber={modeNumber}
          drivingFreqKHz={drivingFreqKHz}
          Q={Q}
          running={running}
          onCavityLength={setCavityLength}
          onModeNumber={setModeNumber}
          onDrivingFreqKHz={setDrivingFreqKHz}
          onQ={setQ}
          onToggleRun={() => setRunning((r) => !r)}
        />
        <CavityMetrics
          resonantFreqKHz={resonantFreqKHz}
          drivingFreqKHz={drivingFreqKHz}
          detuning={detuning}
          coupling={coupling}
          modeNumber={modeNumber}
        />
      </div>

      <CavityField
        cavityLength={cavityLength}
        modeNumber={modeNumber}
        drivingFreqHz={drivingFreqHz}
        resonantFreqHz={resonantFreqHz}
        coupling={coupling}
        running={running}
      />

      <CavitySpectrum
        resonantFreqHz={resonantFreqHz}
        drivingFreqKHz={drivingFreqKHz}
        Q={Q}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <CavityNotes />
        </div>
        <PresetBar
          panel="coupling"
          currentParams={{ cavityLength, modeNumber, drivingFreqKHz, Q }}
          onLoad={(p) => {
            if (typeof p.cavityLength === "number") setCavityLength(p.cavityLength);
            if (typeof p.modeNumber === "number") setModeNumber(p.modeNumber);
            if (typeof p.drivingFreqKHz === "number") setDrivingFreqKHz(p.drivingFreqKHz);
            if (typeof p.Q === "number") setQ(p.Q);
          }}
        />
      </div>
    </div>
  );
}
