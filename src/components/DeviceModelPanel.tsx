import { useMemo, useState } from "react";
import DeviceControls from "./device/DeviceControls";
import DevicePowerSummary from "./device/DevicePowerSummary";
import DeviceSweepFm from "./device/DeviceSweepFm";
import DeviceSweepGap from "./device/DeviceSweepGap";
import DeviceSweepBeta from "./device/DeviceSweepBeta";
import DeviceSanity from "./device/DeviceSanity";
import DeviceNotes from "./device/DeviceNotes";
import PlainExplainer from "./ui/PlainExplainer";
import GoverningEquation from "./ui/GoverningEquation";
import { DEVICE_DEFAULTS } from "./device/defaults";
import { predictDevice } from "../utils/device";

export default function DeviceModelPanel() {
  const [dNm, setDNm] = useState(DEVICE_DEFAULTS.dNm);
  const [fmKHz, setFmKHz] = useState(DEVICE_DEFAULTS.fmHz / 1e3);
  const [beta, setBeta] = useState(DEVICE_DEFAULTS.beta);
  const [rotorRadiusNm, setRotorRadiusNm] = useState(DEVICE_DEFAULTS.rotorRadiusNm);
  const [Q, setQ] = useState(DEVICE_DEFAULTS.Q);
  const [areaMm2, setAreaMm2] = useState(DEVICE_DEFAULTS.areaMm2);

  const base = useMemo(
    () => ({
      dNm,
      fmHz: fmKHz * 1e3,
      beta,
      rotorRadiusNm,
      Q,
      areaMm2,
    }),
    [dNm, fmKHz, beta, rotorRadiusNm, Q, areaMm2]
  );

  const prediction = useMemo(() => predictDevice(base), [base]);

  return (
    <div className="space-y-6">
      <PlainExplainer title="Can you really pull power from empty space?">
        <p>
          Some inventors claim you can harvest energy from the quantum
          vacuum itself. This panel glues together honest textbook physics —
          the Casimir gap, a rotor drive, and the FM-style frequency comb —
          into a deliberately generous ceiling on the power such a device
          could produce. Spoiler: at rotor speeds that survive and gaps where
          the physics holds, it falls far short of what inventors claim; the
          slider corners pass the claim only with rotors that would burst and
          gaps a few atoms wide.
        </p>
        <p className="dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400">
          <span className="font-semibold dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-slate-200">Try this:</span>{" "}
          Wiggle every slider to maximize the predicted output. Compare it
          with the illustrative 1.3 W claim drawn on every chart.
        </p>
      </PlainExplainer>

      <GoverningEquation type="power" className="mb-4" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DeviceControls
          dNm={dNm}
          fmKHz={fmKHz}
          beta={beta}
          rotorRadiusNm={rotorRadiusNm}
          Q={Q}
          areaMm2={areaMm2}
          onD={setDNm}
          onFm={setFmKHz}
          onBeta={setBeta}
          onR={setRotorRadiusNm}
          onQ={setQ}
          onArea={setAreaMm2}
        />
        <DevicePowerSummary p={prediction} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DeviceSweepFm base={base} />
        <DeviceSweepGap base={base} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DeviceSweepBeta base={base} />
        <DeviceSanity p={prediction} Q={Q} beta={beta} fmHz={fmKHz * 1e3} />
      </div>

      <DeviceNotes p={prediction} />
    </div>
  );
}
