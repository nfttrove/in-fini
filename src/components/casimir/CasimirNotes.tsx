import Panel from "../ui/Panel";
import InfoNote from "../ui/InfoNote";

export default function CasimirNotes() {
  return (
    <Panel title="Physics Notes">
      <div className="space-y-2">
        <InfoNote>
          The Casimir effect arises from quantum vacuum fluctuations of the
          electromagnetic field. Between two parallel conducting plates, only
          modes with wavelengths that fit an integer number of half-wavelengths
          within the gap are permitted. Outside, all modes exist. This asymmetry
          produces a net inward radiation pressure.
        </InfoNote>
        <InfoNote>
          The force scales as <span className="dark-mode:text-cyan-400 light-mode:text-cyan-600 coffee-mode:text-cyan-400 font-mono">d⁻⁴</span>
          — extremely strong at nanometer separations, negligible above ~1 μm.
          First predicted by Hendrik Casimir in 1948; first precisely measured
          by Lamoreaux (1997) and Mohideen &amp; Roy (1998).
        </InfoNote>
        <InfoNote variant="warning">
          The Casimir effect is a conservative force. No net energy can be
          extracted from a static cavity — work done bringing the plates
          together must be returned to separate them. This simulation models
          only the well-established equilibrium force.
        </InfoNote>
      </div>
    </Panel>
  );
}
