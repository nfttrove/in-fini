import { useMemo, useState } from "react";
import DeviceControls from "./device/DeviceControls";
import DevicePowerSummary from "./device/DevicePowerSummary";
import DeviceSweepFm from "./device/DeviceSweepFm";
import DeviceSweepGap from "./device/DeviceSweepGap";
import DeviceSweepBeta from "./device/DeviceSweepBeta";
import DeviceSanity from "./device/DeviceSanity";
import DeviceNotes from "./device/DeviceNotes";
import PresetBar from "./ui/PresetBar";
import PlainExplainer from "./ui/PlainExplainer";
import GoverningEquation from "./ui/GoverningEquation";
import { predictDevice } from "../utils/device";

export default function DeviceModelPanel() {
  const [dNm, setDNm] = useState(50);
  const [fmKHz, setFmKHz] = useState(500);
  const [beta, setBeta] = useState(0.3);
  const [rotorRadiusNm, setRotorRadiusNm] = useState(50);
  const [Q, setQ] = useState(10000);
  const [areaMm2, setAreaMm2] = useState(1);

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
          to estimate the absolute best-case power such a device could
          produce. Spoiler: the predicted numbers are astronomically small.
        </p>
        <p className="dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400">
          <span className="font-semibold dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-slate-200">Try this:</span>{" "}
          Wiggle every slider to maximize the predicted output. Compare it
          to what real-world claims advertise.
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
        <DeviceSanity p={prediction} Q={Q} beta={beta} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <DeviceNotes p={prediction} />
        </div>
        <PresetBar
          panel="device"
          currentParams={{ dNm, fmKHz, beta, rotorRadiusNm, Q, areaMm2 }}
          onLoad={(p) => {
            if (typeof p.dNm === "number") setDNm(p.dNm);
            if (typeof p.fmKHz === "number") setFmKHz(p.fmKHz);
            if (typeof p.beta === "number") setBeta(p.beta);
            if (typeof p.rotorRadiusNm === "number")
              setRotorRadiusNm(p.rotorRadiusNm);
            if (typeof p.Q === "number") setQ(p.Q);
            if (typeof p.areaMm2 === "number") setAreaMm2(p.areaMm2);
          }}
        />
      </div>
    </div>
  );
}
