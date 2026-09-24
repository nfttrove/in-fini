/**
 * Branded units for the quantities this app has confused before.
 *
 * Every thrust channel, claim and ceiling is a grams-equivalent weight
 * change (F/g × 1000). Three bugs came from treating those grams as
 * milligrams or kilograms at a boundary: the DCE ceiling (1000× small), the
 * Claim Registry's force readout (1000× large) and the thermal floor (÷ mass
 * too, 10× off at 100 g). A Grams value can still do arithmetic, but a bare
 * number no longer passes where Grams is expected, and grams never pass as
 * newtons: crossing units takes a named conversion.
 */

declare const unit: unique symbol;

export type Grams = number & { readonly [unit]: "g" };
export type Newtons = number & { readonly [unit]: "N" };

const STANDARD_GRAVITY = 9.80665;

/** Assert that a number is a grams-equivalent weight change. */
export const grams = (x: number): Grams => x as Grams;

/** Assert that a number is a force in newtons. */
export const newtons = (x: number): Newtons => x as Newtons;

/** The force whose weight-equivalent is `g` grams. */
export const gramsToNewtons = (g: Grams): Newtons =>
  newtons((g / 1000) * STANDARD_GRAVITY);

/** The grams-equivalent weight change of a force. */
export const newtonsToGrams = (f: Newtons): Grams =>
  grams((f / STANDARD_GRAVITY) * 1000);
