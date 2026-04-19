import { useState } from "react";
import CasimirControls from "./casimir/CasimirControls";
import CasimirMetrics from "./casimir/CasimirMetrics";
import CasimirChart from "./casimir/CasimirChart";
import CasimirNotes from "./casimir/CasimirNotes";
import PresetBar from "./ui/PresetBar";
import PlainExplainer from "./ui/PlainExplainer";

export default function CasimirPanel() {
  const [separation, setSeparation] = useState(100);
  const [areaMm2, setAreaMm2] = useState(1);

  const sepM = separation * 1e-9;
  const areaM2 = areaMm2 * 1e-6;

  return (
    <div className="space-y-6">
      <PlainExplainer title="What is the Casimir effect?">
        <p>
          Put two flat metal plates extremely close together (think: thousands
          of times thinner than a human hair). Empty space between them is
          not really empty — it&rsquo;s full of tiny &ldquo;quantum
          jitters.&rdquo; The plates block some of those jitters from the
          inside, so the outside pushes them together. That push is a real,
          measurable force called the Casimir force.
        </p>
        <p className="dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400">
          <span className="font-semibold dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-slate-200">Try this:</span>{" "}
          Slide the plate separation. Notice how the force explodes as the
          gap shrinks — it grows like 1 / (gap⁴).
        </p>
      </PlainExplainer>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CasimirControls
          separation={separation}
          areaMm2={areaMm2}
          onSeparationChange={setSeparation}
          onAreaChange={setAreaMm2}
        />
        <CasimirMetrics sepM={sepM} areaM2={areaM2} />
      </div>

      <CasimirChart sepNm={separation} areaM2={areaM2} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <CasimirNotes />
        </div>
        <PresetBar
          panel="casimir"
          currentParams={{ separation, areaMm2 }}
          onLoad={(p) => {
            if (typeof p.separation === "number") setSeparation(p.separation);
            if (typeof p.areaMm2 === "number") setAreaMm2(p.areaMm2);
          }}
        />
      </div>
    </div>
  );
}
