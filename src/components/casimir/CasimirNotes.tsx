import Panel from "../ui/Panel";
import InfoNote from "../ui/InfoNote";
import { casimirPressure } from "../../utils/physics";

// Pressure at 1 µm, quoted in the notes: small, but measured.
const P_1UM = Math.abs(casimirPressure(1e-6));

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
          — enormous at nanometre separations and small but measurable at
          microns: at 1 µm the pressure is about {P_1UM.toExponential(1)} Pa.
          Lamoreaux's 1997 torsion pendulum measured it across 0.6–6 µm, and
          Mohideen &amp; Roy (1998) across 0.1–0.9 µm with an atomic-force
          microscope. First predicted by Hendrik Casimir in 1948.
        </InfoNote>
        <InfoNote variant="warning">
          Below roughly 100 nm this ideal-mirror formula overstates the force:
          real metals stop reflecting like perfect mirrors near their plasma
          wavelength (≈ 140 nm for gold), and at a few nanometres the
          attraction crosses over to the weaker van der Waals regime. Readings
          at the small end of the slider are the ideal-mirror bound, not a
          prediction for real plates.
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
