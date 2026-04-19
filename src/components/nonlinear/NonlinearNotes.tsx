import Panel from "../ui/Panel";
import InfoNote from "../ui/InfoNote";

interface NonlinearNotesProps {
  f0THz: number;
  fmKHz: number;
  j1: number;
}

export default function NonlinearNotes({
  f0THz,
  fmKHz,
  j1,
}: NonlinearNotesProps) {
  return (
    <Panel title="Physics & Caveats">
      <div className="space-y-3">
        <InfoNote>
          A carrier at f₀ that is phase- (or amplitude-) modulated at fₘ with
          depth β produces a frequency comb with amplitudes Jₙ(β) at f₀ ± n·fₘ.
          This is the standard sideband expansion used in FM/PM radio,
          electro-optic modulators, cavity optomechanics, and Josephson
          parametric amplifiers.
        </InfoNote>
        <InfoNote>
          For small β, J₀(β) ≈ 1 − β²/4 and J₁(β) ≈ β/2, so the first-order
          sideband power scales as ≈ β²/2 of the drive. At the current
          β, |J₁| = {j1.toFixed(4)}, meaning roughly{" "}
          {(2 * j1 * j1 * 100).toFixed(2)} % of the drive power lives in the
          ±1 sidebands combined.
        </InfoNote>
        <InfoNote variant="warning">
          The key observation: the ±1 sidebands sit at f₀ ± fₘ. With fₘ ={" "}
          {fmKHz >= 1000 ? `${(fmKHz / 1000).toFixed(2)} MHz` : `${fmKHz.toFixed(1)} kHz`}{" "}
          and f₀ ≈ {f0THz >= 1000 ? `${(f0THz / 1000).toFixed(2)} PHz` : `${f0THz.toFixed(1)} THz`},
          the sidebands are spectrally inside the cavity linewidth only if
          fₘ ≲ γ = f₀/Q. A 500 kHz modulation on a 3 PHz cavity sits well
          within the linewidth whenever Q ≲ 6 × 10⁹ — true for any realistic
          plasmonic or Fabry-Pérot cavity.
        </InfoNote>
        <InfoNote variant="warning">
          This means sideband overlap is easy — but it also means you need an
          actual optical-band carrier near f₀ for up-conversion to occur. A
          pure 500 kHz drive with no optical carrier produces no sideband at
          3 PHz; modulation requires something to be modulated. Candidates:
          thermal / blackbody photons from the substrate, zero-point vacuum
          modes inside the cavity, or an explicit optical pump.
        </InfoNote>
        <InfoNote>
          Legitimate analogue systems that look like this:
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <span className="dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-slate-200">Electro-optic modulators</span>:
              RF drive imprints sidebands on an optical carrier; every photon
              out is accounted for by a photon in plus/minus ℏωₘ.
            </li>
            <li>
              <span className="dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-slate-200">Cavity optomechanics</span>:
              mechanical Ω modulates the cavity length; red/blue sidebands
              cool or amplify the oscillator at the expense of pump power.
            </li>
            <li>
              <span className="dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-slate-200">Dynamical Casimir</span>: a
              boundary modulated at Ω converts virtual pairs to real photons
              at ω₁ + ω₂ = Ω — but the conversion rate is set by ℏΩ, so a
              500 kHz drive yields microwave photons, not optical ones.
            </li>
          </ul>
        </InfoNote>
        <InfoNote variant="warning">
          This simulation models frequency conversion only. Energy conservation
          is assumed; nothing here is over-unity. If a real device shows
          optical-band emission under a 500 kHz drive alone, the correct first
          question is what carrier is actually being modulated — not whether
          energy is appearing from the vacuum.
        </InfoNote>
      </div>
    </Panel>
  );
}
