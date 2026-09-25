import { formatForceG, ionWindForceG } from "../utils/thrustLeakage";
import { RIM_SPEED_LIMIT_M_S, formatPower, predictDevice } from "../utils/device";
import { AT_CLAIM, CLAIM_REACH_GAP_NM, CORNER, DEVICE_DEFAULTS, SURVIVABLE_R_NM } from "../components/device/defaults";
import { DM_PARTICLE_GEV, darkEnergyTide, darkMatterFlux, QUIETEST_RIG_ACCEL } from "../utils/darkCorners";
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
const cornerRim = CORNER.v.toFixed(0);
const rimLimit = RIM_SPEED_LIMIT_M_S.toFixed(0);
const reachGap = CLAIM_REACH_GAP_NM.toFixed(0);
const atClaimShortfall = AT_CLAIM.shortfall.toExponential(0);
const darkNgPerDay = (darkMatterFlux().kgPerDayPerM2 * 1e12).toFixed(1);
const phoneOverRead = (1000 / 9.80665).toFixed(0);
const dmPushRatio = (20e-6 / darkMatterFlux().hypotheticalPressurePa).toExponential(0);
const tideRatio = (QUIETEST_RIG_ACCEL / darkEnergyTide(1)).toExponential(0);
const casimir1um = Math.abs(casimirPressure(1e-6)).toExponential(1);
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
    now: `At every slider's limit the formula gives ${cornerPower}. What rules it out is the rotor (its rim would move at ${cornerRim} m/s; spinning rims burst near ${rimLimit} m/s) and a 1 nm gap far below where the d⁻⁴ law holds. With rotors that survive, the ceiling reaches the claim only below about ${reachGap} nm; at the claim's own 50 nm and 500 kHz it stays ${atClaimShortfall}× short.`,
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
    now: "Cards show the engine's verdict, and the boundary-sensitive badge appears.",
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
    now: `At 1 µm the Casimir pressure is ${casimir1um} Pa — small, and measured (Lamoreaux 1997, 0.6–6 µm); below ~100 nm the force is labelled an ideal-mirror bound. The Device Model quotes its shortfall with a rotor that survives. The suppression is the model's physics; a 50 nm gap resonates in the deep UV, past where gold reflects well. The microwave DCE's pump pays for every photon.`,
    tab: "Casimir Effect, Device Model, Teacher's Guide, nm-Cavity, Home",
  },
  {
    title: "The microwave DCE, told as one experiment",
    was: "The Circuit QED tab said \"the GHz trick is resonance and quiet, not speed\" and modelled \"that experiment\" (Wilson et al. 2011) — but Wilson's open line had no cavity and relied on its SQUID mirror moving at about 5% of c; the cavity-pumped version is Lähteenmäki et al. (2013). Home called this \"the only experiment that ever coaxed photon pairs out of empty space\" and \"the one way it was actually done\".",
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
    title: "The EmDrive preset's thermal drift was 50× below what TU Dresden measured",
    was: "The Artifact Budget Gate's Eagleworks preset set thermal drift at 20 nN/W and assumed a metre of unshielded cable (\"long unshielded DC run\", no source), so it read 98% magnetic.",
    now: `Thermal drift is set to ≈ 1 µN/W, the size TU Dresden measured from mechanical stress as their own EmDrive's cavity expanded thermally ("similar to … White et al."), with a few centimetres of cable, their best estimate for an earlier false positive. Thermal is now ${emdriveThermalShare}% of the budget and the claim sits ${emdrive.ratio.toFixed(1)}× above it: indistinguishable. The values are labelled illustrative.`,
    tab: "Thrust & Weight Diagnostic (Artifact Budget Gate)",
  },
  {
    title: "Smaller slips",
    was: `The Boundary Atlas labelled its rotor rim "458 m/s"; Rotating Field printed a 600 m wavelength as "599584.92 mm"; the leakage budget said it summed four channels (it sums five) and its excess verdict said "wrong by many orders of magnitude" for claims within 10⁶× of leakage; micrograms printed as "ug"; Dark Corners called the Casimir and cosmic vacuum energies "as far as we know, the same phenomenon".`,
    now: `The rim is computed (${atlasRim} m/s at ${ATLAS_DEVICE.fmHz / 1e6} MHz, ${ATLAS_DEVICE.rotorRadiusNm / 1000} µm); wavelengths print in m or km, with a note that the cavity never reaches resonance at these settings; the excess verdicts point to missing channels first; µg; and the Casimir force can be derived without vacuum energy (Jaffe 2005), so the lab does not settle it.`,
    tab: "Boundary Atlas, Rotating Field, Leakage Diagnostic, Dark Corners",
  },
  {
    title: "The rotor veto used the wrong failure mechanism",
    was: "The Device Model vetoed rotors whose rim acceleration passed 10⁶ g (\"it shatters\"), so it capped the claim-drive rotor near 1 µm; the Boundary Atlas marked its 71 µm, 1 MHz rotor as shattered. Spinning rims burst from hoop stress, ρv², which depends on rim speed, not size — small rotors survive far more than 10⁶ g.",
    now: `The veto is a rim speed: about ${rimLimit} m/s for generously strong silicon. At the claim's 500 kHz the slider's largest rotor (${SURVIVABLE_R_NM / 1000} µm, ${AT_CLAIM.v.toFixed(0)} m/s) survives and the ceiling is still ${atClaimShortfall}× short. With rotors that survive, the claim is reached only at gaps below about ${reachGap} nm, where real metals fall well short of the ideal-mirror law; the atlas now marks those cells for the gap.`,
    tab: "Device Model, Boundary Atlas, Teacher's Guide, Lab Worksheet",
  },
  {
    title: "A power verdict that contradicted its own numbers",
    was: "When modelled leakage exceeded the claim by more than 5%, the Leakage verdict fell through to a red \"Unexplained excess … by many orders of magnitude\" while its error-bar line said \"Within budget\"; the tab said the badge turns green \"only when the claim truly exceeds every leakage channel\". \"Explained\" verdicts said the claim was \"quantitatively reproduced\", and \"partial\" reports said the residual was within the uncertainty whatever the error bars said.",
    now: "Leakage at or above the claim reads \"Fully explained\". Explained verdicts say the modelled channels could produce the reading, not which one did; partial reports defer to the error-bar line; the sub-nanowatt verdict admits the budget has no DCE term.",
    tab: "Leakage & Artifact Diagnostic, Thrust & Weight Diagnostic",
  },
  {
    title: "Copy that outran its own model",
    was: "The Lifter preset said \"it's just pushing air\" while the budget credited its electrostatic allowance; Dark Corners said \"precisely none\" of the dark matter \"touches anything\", called the Casimir energy density \"measured physics\" and counted \"≈ 3 particles per litre\" without saying it assumed a particle mass; Circuit QED said \"there is nothing to detect\" below the thermal line and that a thermally masked g² trace was \"indistinguishable from noise heating\"; the nonlinear notes said \"the conversion rate is set by ℏΩ\" and a 500 kHz drive \"yields microwave photons\"; the Budget Gate claimed to compute \"every known artifact channel\"; the DCE card said \"Maximum possible\" and \"cannot explain the claim by orders of magnitude\" at any ratio.",
    now: `Each says only what its model computes: the Lifter tagline names the channel the budget actually credits; the particle count states its ${DM_PARTICLE_GEV} GeV assumption and the dark-matter push is compared like for like (${dmPushRatio}× below the faintest audible pressure swing); below the thermal line only integration and correlations can find pairs; ℏΩ fixes the photons' energies (radio frequency at 500 kHz); the gate sums six standard channels; the DCE card prints the claim ÷ ceiling ratio.`,
    tab: "Thrust & Weight Diagnostic, Dark Corners, Circuit QED, Non-linear Coupling",
  },
  {
    title: "Units and labels",
    was: "The Replication Network labelled acceleration in milli-g as \"mΔg\" (Δg is grams-equivalent weight everywhere else) and called every filed run an \"independent rig\"; the g² panel said \"λ²/κ gives nₚ\" and always described \"the 20 mK mode\"; Experiment Design printed \"impossible\" for a channel that is simply zero; the Device Model's sideband check compared the linewidth with a fixed 500 kHz whatever the drive, and labelled a model-vs-claim ratio \"Energy conservation\".",
    now: "Census values are labelled milli-g and N counts filed runs; nₚ = (λ/κ)² at the live temperature; a zero channel reads \"no limit\"; the sideband check uses the live drive frequency; the claim check is labelled as the shortfall it shows (1.3 W ÷ predicted).",
    tab: "Replication Network, Circuit QED, Experiment Design, Device Model",
  },
  {
    title: "Phone census runs were filed about 100× too high",
    was: `The Replication Network converted each phone sample from m/s² to milli-g, then converted the analysed noise and peak to milli-g again, so every phone run showed and filed ${phoneOverRead}× its real noise. Pasted CSV runs were converted once, so the fleet statistics mixed two scales.`,
    now: "Both paths take m/s² and convert once.",
    tab: "Replication Network",
  },
  {
    title: "An unsourced claim presented as experimental",
    was: "The Device Model called \"1.3 W at 50 nm, 500 kHz\" \"the experimental claim\", the Lab Worksheet said \"Real claims are often 1 W or higher\", and the Leakage preset was \"Claimed 1.3 W rotor device\". No published source for the figure has been found; it dates from the site's first build.",
    now: "It is labelled an illustrative claim with no published source, like the charged-sphere preset, and kept as the yardstick; a sourced claim can replace it.",
    tab: "Device Model, Lab Worksheet, Teacher's Guide, Boundary Atlas, Leakage & Artifact Diagnostic",
  },
];
