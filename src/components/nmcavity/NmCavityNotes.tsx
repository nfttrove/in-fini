import Panel from "../ui/Panel";
import InfoNote from "../ui/InfoNote";

const C = 299_792_458;
// Gold's plasma wavelength (ħω_p ≈ 9 eV): above this frequency metal
// mirrors stop reflecting well, so an "ideal cavity" there is on paper only.
const GOLD_PLASMA_NM = 140;
const GOLD_PLASMA_THZ = C / (GOLD_PLASMA_NM * 1e-9) / 1e12;
const GAP_50_NM = 50;
const F50_HZ = C / (2 * GAP_50_NM * 1e-9);

interface NmCavityNotesProps {
  f0THz: number;
  ratio500kHz: number;
}

export default function NmCavityNotes({ f0THz, ratio500kHz }: NmCavityNotesProps) {
  return (
    <Panel title="Interpretation">
      <div className="space-y-3">
        <InfoNote>
          A plane-parallel EM cavity of gap <em>d</em> supports standing modes
          at f<sub>n</sub> = n·c / (2d). A {GAP_50_NM} nm gap therefore resonates near{" "}
          {(F50_HZ / 1e15).toFixed(0)} × 10<sup>15</sup> Hz (≈ {(F50_HZ / 1e15).toFixed(0)} PHz,
          λ = 2d ≈ {2 * GAP_50_NM} nm), in the deep (vacuum) ultraviolet; soft X-rays begin
          near 10 nm. The current cavity shows f₀ ≈ {f0THz >= 1000 ? `${(f0THz / 1000).toFixed(2)} PHz` : `${f0THz.toFixed(1)} THz`}.
        </InfoNote>
        {f0THz > GOLD_PLASMA_THZ && (
          <InfoNote variant="warning">
            That is above gold's plasma frequency (λ<sub>p</sub> ≈ {GOLD_PLASMA_NM} nm),
            where real metal mirrors stop reflecting well. At this gap the
            ideal-mirror cavity — and every resonance built on it — is an
            idealisation, and a generous one.
          </InfoNote>
        )}
        <InfoNote variant="warning">
          The device's 500 kHz drive is ≈ {ratio500kHz.toExponential(1)} times
          the natural cavity frequency — roughly {Math.round(Math.log10(1 / Math.max(ratio500kHz, 1e-30)))} orders of
          magnitude below resonance. Direct linear (dipole) coupling is
          vanishingly small.
        </InfoNote>
        <InfoNote>
          If power transfer is observed anyway, the mechanism cannot be
          first-order resonant drive. Candidate mechanisms consistent with
          standard QED include:
        </InfoNote>
        <ul className="text-sm dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400 space-y-1.5 pl-5 list-disc leading-relaxed">
          <li>
            <span className="dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-slate-200">A modulated optical pump</span>:
            a pump near f₀, modulated at the RF rate, carries sidebands at
            f₀ ± 500 kHz; only the modulation envelope is at 500 kHz.
          </li>
          <li>
            <span className="dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-slate-200">Dynamical Casimir effect</span>:
            mechanically or electrically modulating the boundary at Ω produces
            photon pairs at ω₁ + ω₂ = Ω off the vacuum; still energy-conserving.
          </li>
          <li>
            <span className="dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-slate-200">Virtual-rotor sideband coupling</span>:
            a circularly-polarized drive creates sidebands f₀ ± Ω; if Ω is
            500 kHz and f₀ is optical, the sidebands are still optical — the
            RF envelope itself is not radiated but rides on the optical carrier.
          </li>
          <li>
            <span className="dark-mode:text-slate-200 light-mode:text-slate-800 coffee-mode:text-slate-200">Thermal / near-field heating</span>:
            most prosaic candidate; easy to mistake for coherent extraction.
            Rule out with calorimetry before claiming anything else.
          </li>
        </ul>
        <InfoNote variant="warning">
          None of these are over-unity. Each obeys ℏω energy accounting and
          passes fluctuation-dissipation constraints. This panel shows the
          Lorentzian for the linear channel only — a valid null hypothesis
          against which any anomalous signal must be compared.
        </InfoNote>
      </div>
    </Panel>
  );
}
