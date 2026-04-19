import Panel from "../ui/Panel";
import InfoNote from "../ui/InfoNote";

export default function RotatingNotes() {
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
      </div>
    </Panel>
  );
}
