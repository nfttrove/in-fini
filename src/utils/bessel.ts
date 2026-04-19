export function besselJ(n: number, x: number): number {
  if (n < 0) {
    const sign = n % 2 === 0 ? 1 : -1;
    return sign * besselJ(-n, x);
  }
  if (x === 0) return n === 0 ? 1 : 0;

  const halfX = x / 2;
  let term = Math.pow(halfX, n);
  for (let k = 1; k <= n; k++) term /= k;

  let sum = term;
  for (let k = 1; k < 120; k++) {
    term *= -(halfX * halfX) / (k * (n + k));
    sum += term;
    if (Math.abs(term) < 1e-16 * Math.abs(sum)) break;
  }
  return sum;
}
