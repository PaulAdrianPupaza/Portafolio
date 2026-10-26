// Seeded randomness only: the engine never calls Math.random, so any frame
// can be re-rendered bit-for-bit from (t, ambient).

export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stateless hash of an integer to [0, 1). */
export function hash1(n: number) {
  let x = Math.imul((n | 0) ^ 0x9e3779b9, 0x85ebca6b);
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2b2ae35);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}

export const range = (rng: Rng, lo: number, hi: number) => lo + (hi - lo) * rng();

/** Approximately normal sample (Irwin–Hall with 3 terms), mean 0, sd ≈ 1. */
export const gauss = (rng: Rng) => (rng() + rng() + rng() - 1.5) * 2;
