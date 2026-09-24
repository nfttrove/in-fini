import { formatForceG, ionWindForceG } from "../utils/thrustLeakage";
import { formatPower, predictDevice } from "../utils/device";
import { AT_CLAIM, CORNER, DEVICE_DEFAULTS } from "../components/device/defaults";
import { darkEnergyTide, darkMatterFlux, QUIETEST_RIG_ACCEL } from "../utils/darkCorners";
import { casimirPressure } from "../utils/physics";
import { ED_QUALITY_FACTOR } from "../utils/thermalFloor";
import { ATLAS_DEVICE } from "../utils/boundaryAtlas";
import { PRESETS, computeGate } from "../components/diagnostic/artifactGate";

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
const tideRatio = (QUIETEST_RIG_ACCEL / darkEnergyTide(1)).toExponential(0);
const casimir1um = Math.abs(casimirPressure(1e-6)).toExponential(1);
const deviceGeometric = (AT_CLAIM.shortfall / 1e4).toExponential(0);
const atlasRim = ((2 * Math.PI * ATLAS_DEVICE.fmHz * ATLAS_DEVICE.rotorRadiusNm * 1e-9)).toFixed(0);
const emdrive = computeGate(PRESETS.eagleworks.values);
const emdriveThermalShare = Math.round(
  (100 * emdrive.channels.find((c) => c.key === "thermal")!.value) / emdrive.sum
);

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
  {
    title: "Floors stated as if they bound every instrument",
    was: "The thermal floor was \"the smallest force any matter-based instrument can resolve\"; a claim below it was \"unwitnessable by matter\", and \"no instrument made of atoms\" could arbitrate it. Dark Corners put dark energy's desk tide \"3e+26×\" below the quietest rig, from a hand-typed 1e-9 that compared m/s² with a milligram threshold.",
    now: `It is the Brownian floor of the modelled test mass (Q fixed at ${ED_QUALITY_FACTOR}); a lighter, higher-Q or longer-running rig, or a quantum-limited readout, goes lower. The Dark Corners ratio is computed from the Experiment Design tab's quietest settings: ${tideRatio}× at 1 m.`,
    tab: "Experiment Design, Boundary Atlas, Dark Corners",
  },
  {
    title: "Prose more certain than the model",
    was: "The Casimir force was \"negligible above ~1 μm\"; the Device Model's notes still said \"no tuning of the included physics\" reaches the claim (the slider corners do, on paper); the Teacher's Guide called the (v/c)² suppression \"thermodynamics\"; the nm-cavity tab put a 50 nm gap in the \"UV / soft-X-ray\" regime; Home promised \"the truth about your experiment\" and showed \"where vacuum energy extraction actually works\".",
    now: `At 1 µm the Casimir pressure is ${casimir1um} Pa — small, and measured (Lamoreaux 1997, 0.6–6 µm); below ~100 nm the force is labelled an ideal-mirror bound. Within materials that survive, at the claim's own gap and drive, the Device Model stays ${deviceGeometric}× short even with a 10⁴ geometric allowance. The suppression is the model's physics; a 50 nm gap resonates in the deep UV, past where gold reflects well. The microwave DCE's pump pays for every photon.`,
    tab: "Casimir Effect, Device Model, Teacher's Guide, nm-Cavity, Home",
  },
  {
    title: "The microwave DCE, told as one experiment",
    was: "The Circuit QED tab said \"the GHz trick is resonance and quiet, not speed\" and modelled \"that experiment\" (Wilson et al. 2011) — but Wilson's open line had no cavity and relied on its SQUID mirror moving at about 5% of c; the cavity-pumped version is Lähteenmäki et al. (2013). Home called these \"the only experiments\" to make photon pairs from vacuum.",
    now: "Both routes are described: raw effective-mirror speed (2011) and cavity resonance (2013, the regime the panel models). They are the first moving-mirror observations, not the only vacuum-pair experiments.",
    tab: "Circuit QED, Home",
  },
  {
    title: "A speaker is not a fluctuation force",
    was: "The acoustic tab offered \"the one fluctuation force you can measure tonight\", called a jewelry-scale reading \"a genuine kitchen-table field-fluctuation measurement\", took tone ON vs OFF as the null test and called the plane-wave numbers \"the floor\".",
    now: "A single tone on one plate is ordinary radiation pressure; the true acoustic Casimir effect (Larraza & Denardo) needs broadband noise between two plates. The build now separates radiation pressure from vibration, airflow and the speaker's magnet: reflector against absorber (the push should halve), a blocked sound path and a 3 dB step. The plane-wave figure is an estimate either way.",
    tab: "Acoustic Casimir, Home",
  },
  {
    title: "The EmDrive preset's thermal drift was 50× low",
    was: "The Artifact Budget Gate's Eagleworks preset set thermal drift at 20 nN/W and assumed a metre of unshielded cable (\"long unshielded DC run\", no source), so it read 98% magnetic.",
    now: `Thermal drift is set to ≈ 1 µN/W, the size TU Dresden measured from their own EmDrive's thermal expansion ("similar to … White et al."), with a few centimetres of cable, their best estimate for an earlier false positive. Thermal is now ${emdriveThermalShare}% of the budget and the claim sits ${emdrive.ratio.toFixed(1)}× above it: indistinguishable. The values are labelled illustrative.`,
    tab: "Thrust & Weight Diagnostic (Artifact Budget Gate)",
  },
  {
    title: "Smaller slips",
    was: `The Boundary Atlas labelled its rotor rim "458 m/s"; Rotating Field printed a 600 m wavelength as "599584.92 mm"; the leakage budget said it summed four channels (it sums five) and its excess verdict said "wrong by many orders of magnitude" for claims within 10⁶× of leakage; micrograms printed as "ug"; Dark Corners called the Casimir and cosmic vacuum energies "as far as we know, the same phenomenon".`,
    now: `The rim is computed (${atlasRim} m/s at ${ATLAS_DEVICE.fmHz / 1e6} MHz, ${ATLAS_DEVICE.rotorRadiusNm / 1000} µm); wavelengths print in m or km, with a note that the cavity never reaches resonance at these settings; the excess verdicts point to missing channels first; µg; and the Casimir force can be derived without vacuum energy (Jaffe 2005), so the lab does not settle it.`,
    tab: "Boundary Atlas, Rotating Field, Leakage Diagnostic, Dark Corners",
  },
  {
    title: "Pre-registrations could be backdated",
    was: "A client filing a claim, pre-registration or census run could set the row's own timestamp and id, so a pre-registration could be dated before the data it predicts; nothing limited how fast rows could be filed.",
    now: "The database stamps every new row's time and id itself, whatever the client sends, and caps filings per rolling hour (30 claims, 30 pre-registrations, 60 census runs).",
    tab: "Claim Registry, Replication Network",
  },
];
