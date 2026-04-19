import Panel from "../ui/Panel";
import InfoNote from "../ui/InfoNote";

export default function CavityNotes() {
  return (
    <Panel title="Physics Notes">
      <div className="space-y-2">
        <InfoNote>
          A resonant cavity supports standing-wave modes at frequencies
          f₀ = nc/(2L). When a driving field at f_drive is applied, the
          internal field buildup follows a Lorentzian lineshape — maximum at
          resonance, falling off as 1/√(1 + 4Q²δ²/ω₀²) where δ is the
          detuning.
        </InfoNote>
        <InfoNote>
          Higher Q means sharper resonance. At resonance, field energy density
          inside the cavity is Q times larger than outside. This enhancement is
          the physical basis for investigating modified vacuum fluctuation
          densities inside cavities — the subject of current research.
        </InfoNote>
        <InfoNote variant="warning">
          Enhanced field density inside a resonant cavity does not by itself
          imply extractable energy. The fluctuation spectrum is modified, but
          the system remains in thermal equilibrium with its environment at the
          same temperature.
        </InfoNote>
      </div>
    </Panel>
  );
}
