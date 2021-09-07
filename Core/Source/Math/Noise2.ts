/**
 * This is an adaption of https://www.npmjs.com/package/fast-simplex-noise
 * done by Jirka Dell'Oro-Friedl, HFU, 2021
 *
 * Based on example code by Stefan Gustavson (stegu@itn.liu.se).
 * Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
 * Better rank ordering method by Stefan Gustavson in 2012.
 *
 * This code was placed in the public domain by its original author,
 * Stefan Gustavson. You may use it as you see fit, but
 * attribution is appreciated.
 */

namespace FudgeCore {

  export class Noise2 {
    private static offset: number = (3.0 - Math.sqrt(3.0)) / 6.0;
    private static gradient: number[][] = [[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [-1, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [0, 1], [0, -1]];
    #sample: (x: number, y: number) => number = null;    //TODO: make private using #

    constructor(random: Function = Math.random) {
      const p: Uint8Array = new Uint8Array(256);
      for (let i: number = 0; i < 256; i++)
        p[i] = i;

      let n: number;
      let q: number;
      for (let i: number = 255; i > 0; i--) {
        n = Math.floor((i + 1) * random());
        q = p[i];
        p[i] = p[n];
        p[n] = q;
      }

      const perm: Uint8Array = new Uint8Array(512);
      const permMod12: Uint8Array = new Uint8Array(512);
      for (let i: number = 0; i < 512; i++) {
        perm[i] = p[i & 255];
        permMod12[i] = perm[i] % 12;
      }

      this.#sample = (x: number, y: number) => {
        // Skew the input space to determine which simplex cell we're in
        const s: number = (x + y) * 0.5 * (Math.sqrt(3.0) - 1.0); // Hairy factor for 2D
        const i: number = Math.floor(x + s);
        const j: number = Math.floor(y + s);
        const t: number = (i + j) * Noise2.offset;
        const X0: number = i - t; // Unskew the cell origin back to (x,y) space
        const Y0: number = j - t;
        const x0: number = x - X0; // The x,y distances from the cell origin
        const y0: number = y - Y0;

        // Determine which simplex we are in.
        const i1: number = x0 > y0 ? 1 : 0;
        const j1: number = x0 > y0 ? 0 : 1;

        // Offset:numbers for corners
        const x1: number = x0 - i1 + Noise2.offset;
        const y1: number = y0 - j1 + Noise2.offset;
        const x2: number = x0 - 1.0 + 2.0 * Noise2.offset;
        const y2: number = y0 - 1.0 + 2.0 * Noise2.offset;

        // Work out the hashed gradient indices of the three simplex corners
        const ii: number = i & 255;
        const jj: number = j & 255;
        const g0: number[] = Noise2.gradient[permMod12[ii + perm[jj]]];
        const g1: number[] = Noise2.gradient[permMod12[ii + i1 + perm[jj + j1]]];
        const g2: number[] = Noise2.gradient[permMod12[ii + 1 + perm[jj + 1]]];

        // Calculate the contribution from the three corners
        const t0: number = 0.5 - x0 * x0 - y0 * y0;
        const n0: number = t0 < 0 ? 0.0 : Math.pow(t0, 4) * (g0[0] * x0 + g0[1] * y0);

        const t1: number = 0.5 - x1 * x1 - y1 * y1;
        const n1: number = t1 < 0 ? 0.0 : Math.pow(t1, 4) * (g1[0] * x1 + g1[1] * y1);

        const t2: number = 0.5 - x2 * x2 - y2 * y2;
        const n2: number = t2 < 0 ? 0.0 : Math.pow(t2, 4) * (g2[0] * x2 + g2[1] * y2);

        // Add contributions from each corner to get the final noise value.
        // The result is scaled to return values in the interval [-1, 1]
        return 70.14805770653952 * (n0 + n1 + n2);
      };
    }

    public sample = (_x: number, _y: number): number => {
      return this.#sample(_x, _y);
    }
  }
}