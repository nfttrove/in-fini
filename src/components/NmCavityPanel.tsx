import { useState } from "react";
import NmCavityControls from "./nmcavity/NmCavityControls";
import NmCavityMetrics from "./nmcavity/NmCavityMetrics";
import NmCavitySweep from "./nmcavity/NmCavitySweep";
import NmCavityLogAxis from "./nmcavity/NmCavityLogAxis";
import NmCavityNotes from "./nmcavity/NmCavityNotes";
import PresetBar from "./ui/PresetBar";
import PlainExplainer from "./ui/PlainExplainer";
import { C } from "../utils/physics";

const RF_DRIVE_HZ = 500e3;

function bandFromFreqHz(f: number): string {
  if (f < 3e8) return "RF / microwave";
  if (f < 3e11) return "mm / sub-mm";
  if (f < 4e14) return "infrared";
  if (f < 7.5e14) return "visible light";
  if (f < 3e16) return "ultraviolet";
  if (f < 3e19) return "X-ray";
  return "gamma";
}

function lorentz(f: number, f0: number, Q: number) {
  const gamma = f0 / Q;
  const delta = f - f0;
  return 1 / Math.sqrt(1 + Math.pow((2 * delta) / gamma, 2));
}

export default function NmCavityPanel() {
  const [gapNm, setGapNm] = useState(50);
  const [modeN, setModeN] = useState(1);
  const [driveTHz, setDriveTHz] = useState(3000);
  const [Q, setQ] = useState(1000);

  const gapM = gapNm * 1e-9;
  const f0Hz = (modeN * C) / (2 * gapM);
  const f0THz = f0Hz / 1e12;
  const lambda0Nm = (C / f0Hz) * 1e9;
  const driveHz = driveTHz * 1e12;
  const detuningPct = ((driveHz - f0Hz) / f0Hz) * 100;
  const coupling = lorentz(driveHz, f0Hz, Q);
  const ratio500kHz = RF_DRIVE_HZ / f0Hz;
  const bandLabel = bandFromFreqHz(f0Hz);

  return (
    <div className="space-y-6">
      <PlainExplainer title="Tiny mirrors, huge frequencies">
        <p>
          Imagine two mirrors almost touching — separated by only a few
          nanometres (millionths of a millimetre). Light bouncing between
          them resonates at incredibly high frequencies, landing in the
          visible, ultraviolet, or even X-ray range depending on the gap.
        </p>
        <p className="dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400">
          <span className="font-semibold dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-slate-200">Try this:</span>{" "}
          Shrink the gap with the slider. Watch the resonant frequency
          climb through infrared, visible light, and beyond.
        </p>
      </PlainExplainer>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NmCavityControls
          gapNm={gapNm}
          modeN={modeN}
          driveTHz={driveTHz}
          Q={Q}
          onGap={setGapNm}
          onMode={setModeN}
          onDrive={setDriveTHz}
          onQ={setQ}
        />
        <NmCavityMetrics
          f0THz={f0THz}
          lambda0Nm={lambda0Nm}
          driveTHz={driveTHz}
          detuningPct={detuningPct}
          coupling={coupling}
          ratio500kHz={ratio500kHz}
          bandLabel={bandLabel}
        />
      </div>

      <NmCavitySweep f0Hz={f0Hz} driveHz={driveHz} Q={Q} />

      <NmCavityLogAxis f0Hz={f0Hz} driveHz={driveHz} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <NmCavityNotes f0THz={f0THz} ratio500kHz={ratio500kHz} />
        </div>
        <PresetBar
          panel="nm-cavity"
          currentParams={{ gapNm, modeN, driveTHz, Q }}
          onLoad={(p) => {
            if (typeof p.gapNm === "number") setGapNm(p.gapNm);
            if (typeof p.modeN === "number") setModeN(p.modeN);
            if (typeof p.driveTHz === "number") setDriveTHz(p.driveTHz);
            if (typeof p.Q === "number") setQ(p.Q);
          }}
        />
      </div>
    </div>
  );
}
