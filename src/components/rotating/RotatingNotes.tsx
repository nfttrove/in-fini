import Panel from "../ui/Panel";
import InfoNote from "../ui/InfoNote";

const C = 2.99792458e8;

interface RotatingNotesProps {
  /** Drive frequency, Hz. */
  frequencyHz: number;
  cavityLengthM: number;
}

export default function RotatingNotes({ frequencyHz, cavityLengthM }: RotatingNotesProps) {
  const lambdaM = C / frequencyHz;
  const f1Hz = C / (2 * cavityLengthM);
  return (
    <Panel title="Physics Notes">
      <div className="space-y-2">
        <InfoNote>
          A circularly polarized travelling wave has transverse E-field
          components 90° out of phase. The polarization vector rotates around
          the propagation axis at frequency ω — this is what "rotating
          polarization wave" means.
        </InfoNote>
        <InfoNote>
          Within a Fabry-Pérot style cavity this wave creates a standing
          pattern when the wavelength matches cavity resonance conditions
          (λ = 2L/n). Detuning from resonance reduces the internal field
          intensity.
        </InfoNote>
        <InfoNote variant="warning">
          At these settings it never matches: the wavelength is{" "}
          {lambdaM >= 1000 ? `${(lambdaM / 1000).toFixed(1)} km` : `${lambdaM.toFixed(0)} m`}, while
          a {cavityLengthM.toFixed(2)} m cavity's first resonance (λ = 2L) sits at{" "}
          {(f1Hz / 1e6).toFixed(0)} MHz — {(f1Hz / frequencyHz).toExponential(1)}× the
          drive. The picture shows the travelling wave's rotation, not a
          standing mode.
        </InfoNote>
      </div>
    </Panel>
  );
}
