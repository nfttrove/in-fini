import Panel from "../ui/Panel";
import InfoNote from "../ui/InfoNote";
import { DevicePrediction, formatPower } from "../../utils/device";

interface Props {
  p: DevicePrediction;
}

export default function DeviceNotes({ p }: Props) {
  return (
    <Panel title="Predictive Engineering Model — What it means">
      <div className="space-y-3">
        <InfoNote>
          This tab composes the three physical effects modelled in the other
          tabs into a single end-to-end prediction:
          <ol className="list-decimal pl-5 mt-2 space-y-1">
            <li>
              Gap d defines a Fabry-Pérot mode at f₀ = c/2d (the "virtual
              rotor" or vacuum carrier inside the cavity).
            </li>
            <li>
              A mechanical / electromagnetic drive at fₘ with rotor radius r
              gives boundary velocity v = 2π fₘ r, producing a dynamical
              Casimir (DCE) photon flux scaling as (v/c)².
            </li>
            <li>
              The same drive phase-modulates the cavity with depth β, so the
              DCE seed power is redistributed into sidebands of amplitude
              Jₙ(β). The n = ±1 sidebands carry a fraction 2J₁²(β) of the
              output, filtered by the cavity Lorentzian.
            </li>
          </ol>
        </InfoNote>
        <InfoNote>
          Final prediction at current settings:
          <span className="text-cyan-300 font-mono">
            {" "}
            P_out = (ħc²/d⁴) · (v/c)² · A · 2J₁²(β) · L(fₘ; γ) ={" "}
            {formatPower(p.P_output)}
          </span>
          .
        </InfoNote>
        <InfoNote variant="warning">
          The experimental claim "1.3 W at 50 nm, 500 kHz" is overlaid on
          every sweep as an orange dashed line. At the defaults this model
          predicts roughly {p.P_output.toExponential(2)} W — a shortfall of
          {" "}
          {p.shortfall.toExponential(2)}× relative to the claim. Sweeping
          every knob through its full physical range (d down to 1 nm, fₘ up
          to 10 MHz, β up to 1, Q up to 10⁶, A up to 100 mm²) does not close
          this gap; the (v/c)² factor alone costs ~10¹⁸.
        </InfoNote>
        <InfoNote variant="warning">
          The unavoidable conclusion of this predictive model: if a real
          device is measuring 1.3 W of output power, that energy is not
          coming from the vacuum via DCE at a 500 kHz drive. Candidate
          alternative sources that must be ruled out before any vacuum-energy
          claim:
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              Joule / conduction heating of the drive electronics dissipating
              into the measurement.
            </li>
            <li>
              RF pickup, capacitive / inductive coupling of the 500 kHz drive
              into the readout.
            </li>
            <li>
              Thermal blackbody re-radiation from the substrate acting as the
              "carrier" being modulated.
            </li>
            <li>
              Triboelectric or piezoelectric energy from the rotor's own
              mechanical input power.
            </li>
          </ul>
        </InfoNote>
        <InfoNote>
          This model is honest about its own limits. The ceiling
          P_DCE = (ħc²/d⁴)(v/c)²·A is a scaling, not a first-principles
          calculation; the exact prefactor for a given geometry may differ by
          one or two orders of magnitude. Even generously accounting for
          geometric factors of 10²-10⁴, the remaining shortfall relative to
          the claim is ≳ 10¹⁰. No tuning of the included physics brings the
          prediction within range.
        </InfoNote>
      </div>
    </Panel>
  );
}
