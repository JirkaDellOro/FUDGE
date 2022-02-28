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

  // TODO: Test
  export class Noise3 extends Noise {
    private static offset: number = 1.0 / 6.0;
    private static gradient: number[][] = [[1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0], [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1], [0, 1, 1], [0, -1, -1], [0, 1, -1], [0, -1, -1]
    ];
    #sample: (_x: number, _y: number, _z: number) => number = null;

    constructor(_random: Function = Math.random) {
      super(_random);

      this.#sample = (_x: number, _y: number, _z: number) => {
        // Skew the input space to determine which simplex cell we're in
        const s: number = (_x + _y + _z) / 3.0; // Very nice and simple skew factor for 3D
        const i: number = Math.floor(_x + s);
        const j: number = Math.floor(_y + s);
        const k: number = Math.floor(_z + s);
        const t: number = (i + j + k) * Noise3.offset;
        const X0: number = i - t; // Unskew the cell origin back to (x,y,z) space
        const Y0: number = j - t;
        const Z0: number = k - t;
        const x0: number = _x - X0; // The x,y,z distances from the cell origin
        const y0: number = _y - Y0;
        const z0: number = _z - Z0;

        // Deterine which simplex we are in
        let i1: number, j1: number, k1: number // Offsets for second corner of simplex in (i,j,k) coords
          ;
        let i2: number, j2: number, k2: number // Offsets for third corner of simplex in (i,j,k) coords
          ;
        if (x0 >= y0) {
          if (y0 >= z0) {
            i1 = i2 = j2 = 1;
            j1 = k1 = k2 = 0;
          } else if (x0 >= z0) {
            i1 = i2 = k2 = 1;
            j1 = k1 = j2 = 0;
          } else {
            k1 = i2 = k2 = 1;
            i1 = j1 = j2 = 0;
          }
        } else {
          if (y0 < z0) {
            k1 = j2 = k2 = 1;
            i1 = j1 = i2 = 0;
          } else if (x0 < z0) {
            j1 = j2 = k2 = 1;
            i1 = k1 = i2 = 0;
          } else {
            j1 = i2 = j2 = 1;
            i1 = k1 = k2 = 0;
          }
        }

        const x1: number = x0 - i1 + Noise3.offset; // Offsets for second corner in (x,y,z) coords
        const y1: number = y0 - j1 + Noise3.offset;
        const z1: number = z0 - k1 + Noise3.offset;
        const x2: number = x0 - i2 + 2.0 * Noise3.offset; // Offsets for third corner in (x,y,z) coords
        const y2: number = y0 - j2 + 2.0 * Noise3.offset;
        const z2: number = z0 - k2 + 2.0 * Noise3.offset;
        const x3: number = x0 - 1.0 + 3.0 * Noise3.offset; // Offsets for last corner in (x,y,z) coords
        const y3: number = y0 - 1.0 + 3.0 * Noise3.offset;
        const z3: number = z0 - 1.0 + 3.0 * Noise3.offset;

        // Work :numberut the hashed gradient indices of the four simplex corners
        const ii: number = i & 255;
        const jj: number = j & 255;
        const kk: number = k & 255;
        const g0: number[] = Noise3.gradient[this.permMod12[ii + this.perm[jj + this.perm[kk]]]];
        const g1: number[] = Noise3.gradient[this.permMod12[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1]]]];
        const g2: number[] = Noise3.gradient[this.permMod12[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2]]]];
        const g3: number[] = Noise3.gradient[this.permMod12[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1]]]];

        // Calcu:numberate the contribution from the four corners
        const t0: number = 0.5 - x0 * x0 - y0 * y0 - z0 * z0;
        const n0: number = t0 < 0
          ? 0.0
          : Math.pow(t0, 4) * (g0[0] * x0 + g0[1] * y0 + g0[2] * z0);
        const t1: number = 0.5 - x1 * x1 - y1 * y1 - z1 * z1;
        const n1: number = t1 < 0
          ? 0.0
          : Math.pow(t1, 4) * (g1[0] * x1 + g1[1] * y1 + g1[2] * z1);
        const t2: number = 0.5 - x2 * x2 - y2 * y2 - z2 * z2;
        const n2: number = t2 < 0
          ? 0.0
          : Math.pow(t2, 4) * (g2[0] * x2 + g2[1] * y2 + g2[2] * z2);
        const t3: number = 0.5 - x3 * x3 - y3 * y3 - z3 * z3;
        const n3: number = t3 < 0
          ? 0.0
          : Math.pow(t3, 4) * (g3[0] * x3 + g3[1] * y3 + g3[2] * z3);

        // Add contributions from each corner to get the final noise value.
        // The result is scaled to stay just inside [-1,1]
        return 94.68493150681972 * (n0 + n1 + n2 + n3);
      };
    }

    public sample = (_x: number, _y: number, _z: number): number => {
      return this.#sample(_x, _y, _z);
    }
  }
}