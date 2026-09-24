import Panel from "../ui/Panel";
import InfoNote from "../ui/InfoNote";
import {
  DevicePrediction,
  IDEAL_MIRROR_MIN_NM,
  RIM_SPEED_LIMIT_M_S,
  formatPower,
  predictDevice,
} from "../../utils/device";
import {
  AT_CLAIM,
  CLAIM_FM_HZ,
  CLAIM_GAP_NM,
  CLAIM_REACH_GAP_NM,
  CORNER,
  DEVICE_DEFAULTS,
  SURVIVABLE_R_NM,
} from "./defaults";

const DEFAULT_VC2 = predictDevice(DEVICE_DEFAULTS).vOverC ** 2;

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
          at the defaults the (v/c)² factor alone costs{" "}
          {(1 / DEFAULT_VC2).toExponential(0)}×.
        </InfoNote>
        <InfoNote variant="warning">
          Push every slider to its limit (d = 1 nm, fₘ = 10 MHz, r = 100 µm,
          β = 1, Q = 10⁶, A = 100 mm²) and this deliberately generous ceiling
          reads {formatPower(CORNER.P_output)} — past the claim. The formula
          does not stop it; two other things do. That rotor's rim would move
          at {CORNER.v.toFixed(0)} m/s, and a spinning rim bursts once its hoop
          stress ρv² passes the material's strength: about{" "}
          {RIM_SPEED_LIMIT_M_S.toFixed(0)} m/s even for generously strong
          silicon, whatever the rotor's size (see the sanity checks). And a
          1 nm gap is a few atoms wide, far below the ~{IDEAL_MIRROR_MIN_NM} nm
          where real metals stop acting as the ideal mirrors the d⁻⁴ law
          assumes. With rotors that survive, the ceiling reaches the claim
          only at gaps below about {CLAIM_REACH_GAP_NM.toFixed(0)} nm — deep in
          that regime. At the claim's own {CLAIM_GAP_NM} nm and{" "}
          {CLAIM_FM_HZ / 1e3} kHz, the largest
          rotor the slider allows ({SURVIVABLE_R_NM / 1000} µm, rim{" "}
          {AT_CLAIM.v.toFixed(0)} m/s, which survives) leaves the ceiling{" "}
          {AT_CLAIM.shortfall.toExponential(1)}× short even with every other
          knob at its limit.
        </InfoNote>
        <InfoNote variant="warning">
          The conclusion this model supports: if a real
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
          one or two orders of magnitude — not enough to close a{" "}
          {AT_CLAIM.shortfall.toExponential(0)}× gap at the claim's stated gap
          and drive, and the ceiling already drops the π²/720 ≈ 1/73
          prefactor to stay generous. With rotors that survive and gaps where
          the formula holds, the included physics does not reach the claim;
          the slider corners get there only on paper.
        </InfoNote>
      </div>
    </Panel>
  );
}
