import { useCallback, useState } from "react";
import RotatingControls from "./rotating/RotatingControls";
import RotatingMetrics from "./rotating/RotatingMetrics";
import RotatingCanvas from "./rotating/RotatingCanvas";
import RotatingNotes from "./rotating/RotatingNotes";
import PresetBar from "./ui/PresetBar";
import PlainExplainer from "./ui/PlainExplainer";

const TWO_PI = 2 * Math.PI;
const C = 2.99792458e8;

export default function RotatingFieldPanel() {
  const [frequency, setFrequency] = useState(500);
  const [amplitude, setAmplitude] = useState(1.0);
  const [cavityLength, setCavityLength] = useState(0.3);
  const [running, setRunning] = useState(true);
  const [simTimeUs, setSimTimeUs] = useState(0);

  const omega = TWO_PI * frequency * 1e3;
  const k = omega / C;

  const handleTime = useCallback((t: number) => setSimTimeUs(t), []);

  return (
    <div className="space-y-6">
      <PlainExplainer title="What am I looking at?">
        <p>
          A radio wave or light wave is really two wiggling fields
          (electric and magnetic) dancing together. In a
          &ldquo;circularly polarized&rdquo; wave, those fields rotate like
          the hands of a clock as the wave travels.
        </p>
        <p className="dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400">
          <span className="font-semibold dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-slate-200">Try this:</span>{" "}
          Change the frequency slider to make it spin faster or slower.
          Press pause to freeze the animation and study one snapshot.
        </p>
      </PlainExplainer>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RotatingControls
          frequency={frequency}
          amplitude={amplitude}
          cavityLength={cavityLength}
          running={running}
          onFrequency={setFrequency}
          onAmplitude={setAmplitude}
          onCavityLength={setCavityLength}
          onToggleRun={() => setRunning((r) => !r)}
        />
        <RotatingMetrics omega={omega} k={k} simTimeUs={simTimeUs} />
      </div>

      <RotatingCanvas
        omega={omega}
        k={k}
        amplitude={amplitude}
        cavityLength={cavityLength}
        running={running}
        onTimeUpdate={handleTime}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <RotatingNotes />
        </div>
        <PresetBar
          panel="rotating"
          currentParams={{ frequency, amplitude, cavityLength }}
          onLoad={(p) => {
            if (typeof p.frequency === "number") setFrequency(p.frequency);
            if (typeof p.amplitude === "number") setAmplitude(p.amplitude);
            if (typeof p.cavityLength === "number") setCavityLength(p.cavityLength);
          }}
        />
      </div>
    </div>
  );
}
