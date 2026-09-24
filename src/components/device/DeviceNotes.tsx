import Panel from "../ui/Panel";
import InfoNote from "../ui/InfoNote";
import { DevicePrediction, formatPower } from "../../utils/device";
import { AT_CLAIM, CORNER, SURVIVABLE_R_NM } from "./defaults";

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
          every sweep as an orange dashed line. At the current settings this
          model predicts roughly {p.P_output.toExponential(2)} W — a
          shortfall of {p.shortfall.toExponential(2)}× relative to the claim;
          at the defaults the (v/c)² factor alone costs ~10¹⁸.
        </InfoNote>
        <InfoNote variant="warning">
          Push every slider to its limit (d = 1 nm, fₘ = 10 MHz, r = 100 µm,
          β = 1, Q = 10⁶, A = 100 mm²) and this deliberately generous ceiling
          reads {formatPower(CORNER.P_output)} — past the claim. The formula
          does not stop it; materials do. That rotor's rim pulls{" "}
          {CORNER.rimAccelerationG.toExponential(0)} g, and no micro-rotor
          survives beyond ~10⁶ g (see the sanity checks). A 1 nm gap is also a
          few atoms wide, far below the ~100 nm where real metals stop acting
          as the ideal mirrors the d⁻⁴ law assumes. At the claim's own 50 nm
          and 500 kHz, the largest rotor that survives (r ≈{" "}
          {SURVIVABLE_R_NM} nm) leaves the ceiling{" "}
          {AT_CLAIM.shortfall.toExponential(1)}× short even with every other
          knob at its limit.
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
          one or two orders of magnitude. Even granting a geometric factor of
          10⁴, the best survivable setting at the claim's own 50 nm and
          500 kHz stays {(AT_CLAIM.shortfall / 1e4).toExponential(0)}× short.
          Within materials that survive, at the claim's stated gap and drive,
          the included physics does not reach it; the slider corners only
          get there on paper.
        </InfoNote>
      </div>
    </Panel>
  );
}
