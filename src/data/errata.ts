import { formatForceG, ionWindForceG } from "../utils/thrustLeakage";
import { formatPower, predictDevice } from "../utils/device";
import { AT_CLAIM, CORNER, DEVICE_DEFAULTS } from "../components/device/defaults";
import { darkMatterFlux } from "../utils/darkCorners";

/**
 * What this site got wrong, and what changed. Old values are history and
 * stay as written; current values are computed by the same engines the
 * panels use, so the "now" column cannot drift.
 */
export interface Erratum {
  title: string;
  /** What the site said or did. */
  was: string;
  /** What it does now. */
  now: string;
  /** Where to see it. */
  tab: string;
}

export const ERRATA_DATE = "2026-09-24";

const ionNow = formatForceG(ionWindForceG(10_000, 101_325, 0.01));
const ionVacuum = formatForceG(ionWindForceG(10_000, 1e-6, 0.01));
const deviceNow = formatPower(predictDevice(DEVICE_DEFAULTS).P_output);
const cornerPower = formatPower(CORNER.P_output);
const cornerRimG = CORNER.rimAccelerationG.toExponential(0);
const atClaimShortfall = AT_CLAIM.shortfall.toExponential(0);
const darkNgPerDay = (darkMatterFlux().kgPerDayPerM2 * 1e12).toFixed(1);

export const ERRATA: Erratum[] = [
  {
    title: "Ion wind had vacuum backwards",
    was: "The ion-wind channel grew as the pressure fell: 1.8 µg at 1 atm, 183 mg at 1 Pa (10 kV across 1 cm). Its formula was dimensionally a current, not a force.",
    now: `Ions push air only by colliding with it. The channel is now the space-charge-limited collisional thrust scaled by the share of ions that collide: ${ionNow} at 1 atm, ${ionVacuum} at 10⁻⁶ Pa. The pressure slider reaches hard vacuum.`,
    tab: "Thrust & Weight Diagnostic",
  },
  {
    title: "Unit slips worth 10× to 1000×",
    was: "The DCE thrust ceiling was shown 1000× too small; Claim Registry thrust claims were printed as forces 1000× too large; Experiment Design's thermal floor was off by the test mass (10× at 100 g); Dark Corners printed \"0.0 ng\" of dark matter a day.",
    now: `Thrust quantities are typed as grams and forces as newtons: a bare number no longer passes where a unit is expected, grams never pass as newtons, and converting takes a named function. Dark Corners shows ${darkNgPerDay} ng a day through 1 m², as its own text always said.`,
    tab: "Thrust, Claim Registry, Experiment Design, Dark Corners",
  },
  {
    title: "Teaching text that disagreed with the model",
    was: "The Lab Worksheet expected ~5 µW from the Device Model; the Teacher's Guide promised ~100 µW and a 10,000× shortfall; the worksheet said Podkletnov reads \"Explained\"; its cavity exercise used controls the tab doesn't have.",
    now: `Quoted numbers are computed by the same engines (the Device Model default reads ${deviceNow}) and pinned by tests. The cavity exercise uses the tab's real sliders and the half-power width.`,
    tab: "Lab Worksheet, Teacher's Guide",
  },
  {
    title: "\"The gap cannot close\" — it can, on paper",
    was: "The Device Model said sweeping every knob could not bring the ceiling to the 1.3 W claim.",
    now: `At every slider's limit the formula gives ${cornerPower}. What rules it out is materials (that rotor's rim pulls ${cornerRimG} g) and a 1 nm gap far below where the d⁻⁴ law holds; at the claim's own 50 nm and 500 kHz, with a rotor that survives, it stays ${atClaimShortfall}× short.`,
    tab: "Device Model",
  },
  {
    title: "Budgets that overstated what they knew",
    was: "Thermal buoyancy ignored pressure; the vibration channel counted the peak shaking force as a steady weight change without saying so; power claims were never compared with the power put in.",
    now: "Buoyancy fades with air density. Vibration is labelled an upper bound, with a slider for how much of it a real balance would rectify. Power claims get an energy balance: output against the drive and bias power the rig already draws.",
    tab: "Thrust & Weight Diagnostic, Leakage & Artifact Diagnostic",
  },
  {
    title: "Hand-written verdicts drifted",
    was: "Preset cards showed stored verdict strings (Podkletnov \"Fully explained\" while the engine said \"Partially explained\"), and the boundary-sensitive badge never appeared on the live site.",
    now: "Cards show the engine's verdict, and the badge works for the cloud presets.",
    tab: "Thrust & Weight Diagnostic",
  },
  {
    title: "Citations",
    was: "A \"Manchester Sphere (2000)\" preset had no documented source; \"SUPERDRAG\" named a project that does not exist; the acoustic Casimir experiment was credited to \"Larson–Puttermann\"; the Podkletnov preset's 2% was labelled 1992.",
    now: "The sphere preset is labelled illustrative; the TU Dresden work is the SpaceDrive project; the acoustic experiment is Larraza & Denardo (1998); the Podkletnov preset is named for the 1997 claim its 2% comes from (the 1992 paper reported 0.05–0.3%). Every preset now shows its source.",
    tab: "Thrust & Weight Diagnostic, Acoustic Casimir",
  },
  {
    title: "The census overstated its reach",
    was: "The Replication Network called median/√N \"the honest detection limit of this fleet\".",
    now: "It is the best case for a coordinated round (every rig measuring the same effect at the same time); on its own a typical rig sees about the median.",
    tab: "Replication Network",
  },
];
