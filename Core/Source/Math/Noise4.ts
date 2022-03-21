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
  export class Noise4 extends Noise {
    private static offset: number = (5.0 - Math.sqrt(5.0)) / 20.0;
    private static gradient: number[][] = [[0, 1, 1, 1], [0, 1, 1, -1], [0, 1, -1, 1], [0, 1, -1, -1], [0, -1, 1, 1], [0, -1, 1, -1], [0, -1, -1, 1], [0, -1, -1, -1], [1, 0, 1, 1], [1, 0, 1, -1], [1, 0, -1, 1], [1, 0, -1, -1], [-1, 0, 1, 1], [-1, 0, 1, -1], [-1, 0, -1, 1], [-1, 0, -1, -1], [1, 1, 0, 1], [1, 1, 0, -1], [1, -1, 0, 1], [1, -1, 0, -1], [-1, 1, 0, 1], [-1, 1, 0, -1], [-1, -1, 0, 1], [-1, -1, 0, -1], [1, 1, 1, 0], [1, 1, -1, 0], [1, -1, 1, 0], [1, -1, -1, 0], [-1, 1, 1, 0], [-1, 1, -1, 0], [-1, -1, 1, 0], [-1, -1, -1, 0]];
    #sample: (_x: number, _y: number, _z: number, _w: number) => number = null;

    constructor(_random: Function = Math.random) {
      super(_random)

      this.#sample = (x: number, y: number, z: number, w: number): number => {
        // Skew the (x,y,z,w) space to determine which cell of 24 simplices we're in
        const s: number = (x + y + z + w) * (Math.sqrt(5.0) - 1.0) / 4.0; // Factor for 4D skewing
        const i: number = Math.floor(x + s);
        const j: number = Math.floor(y + s);
        const k: number = Math.floor(z + s);
        const l: number = Math.floor(w + s);
        const t: number = (i + j + k + l) * Noise4.offset; // Factor for 4D unskewing
        const X0: number = i - t; // Unskew the cell origin back to (x,y,z,w) space
        const Y0: number = j - t;
        const Z0: number = k - t;
        const W0: number = l - t;
        const x0: number = x - X0; // The x,y,z,w distances from the cell origin
        const y0: number = y - Y0;
        const z0: number = z - Z0;
        const w0: number = w - W0;

        // To find out which of the 24 possible simplices we're in, we need to determine the
        // magnitude ordering of x0, y0, z0 and w0. Six pair-wise comparisons are performed between
        // each possible pair of the four coordinates, and the results are used to rank the numbers.
        let rankx: number = 0;
        let ranky: number = 0;
        let rankz: number = 0;
        let rankw: number = 0;
        if (x0 > y0) rankx++;
        else ranky++;
        if (x0 > z0) rankx++;
        else rankz++;
        if (x0 > w0) rankx++;
        else rankw++;
        if (y0 > z0) ranky++;
        else rankz++;
        if (y0 > w0) ranky++;
        else rankw++;
        if (z0 > w0) rankz++;
        else rankw++;

        // simplex[c] is a 4-vector with the numbers 0, 1, 2 and 3 in some order.
        // Many values of c will never occur, since e.g. x>y>z>w makes x<z, y<w and x<w
        // impossible. Only the 24 indices which have non-zero entries make any sense.
        // We use a thresholding to set the coordinates in turn from the largest magnitude.
        // Rank 3 denotes the largest coordinate.
        const i1: number = rankx >= 3 ? 1 : 0;
        const j1: number = ranky >= 3 ? 1 : 0;
        const k1: number = rankz >= 3 ? 1 : 0;
        const l1: number = rankw >= 3 ? 1 : 0;
        // Rank : 2 denotes the second largest coordinate.
        const i2: number = rankx >= 2 ? 1 : 0;
        const j2: number = ranky >= 2 ? 1 : 0;
        const k2: number = rankz >= 2 ? 1 : 0;
        const l2: number = rankw >= 2 ? 1 : 0;
        // Rank : 1 denotes the second smallest coordinate.
        const i3: number = rankx >= 1 ? 1 : 0;
        const j3: number = ranky >= 1 ? 1 : 0;
        const k3: number = rankz >= 1 ? 1 : 0;
        const l3: number = rankw >= 1 ? 1 : 0;

        // The fifth corner has all coordinate offsets = 1, so no need to compute that.
        const x1: number = x0 - i1 + Noise4.offset; // Offsets for second corner in (x,y,z,w) coords
        const y1: number = y0 - j1 + Noise4.offset;
        const z1: number = z0 - k1 + Noise4.offset;
        const w1: number = w0 - l1 + Noise4.offset;
        const x2: number = x0 - i2 + 2.0 * Noise4.offset; // Offsets for third corner in (x,y,z,w) coords
        const y2: number = y0 - j2 + 2.0 * Noise4.offset;
        const z2: number = z0 - k2 + 2.0 * Noise4.offset;
        const w2: number = w0 - l2 + 2.0 * Noise4.offset;
        const x3: number = x0 - i3 + 3.0 * Noise4.offset; // Offsets for fourth corner in (x,y,z,w) coords
        const y3: number = y0 - j3 + 3.0 * Noise4.offset;
        const z3: number = z0 - k3 + 3.0 * Noise4.offset;
        const w3: number = w0 - l3 + 3.0 * Noise4.offset;
        const x4: number = x0 - 1.0 + 4.0 * Noise4.offset; // Offsets for last corner in (x,y,z,w) coords
        const y4: number = y0 - 1.0 + 4.0 * Noise4.offset;
        const z4: number = z0 - 1.0 + 4.0 * Noise4.offset;
        const w4: number = w0 - 1.0 + 4.0 * Noise4.offset;

        // Work out the hashed gradient indices of the five simplex corners
        const ii: number = i & 255;
        const jj: number = j & 255;
        const kk: number = k & 255;
        const ll: number = l & 255;
        const g0: number[] = Noise4.gradient[
          this.perm[ii + this.perm[jj + this.perm[kk + this.perm[ll]]]] %
          32
        ];
        const g1: number[] = Noise4.gradient[
          this.perm[
          ii + i1 + this.perm[jj + j1 + this.perm[kk + k1 + this.perm[ll + l1]]]
          ] % 32
        ];
        const g2: number[] = Noise4.gradient[
          this.perm[
          ii + i2 + this.perm[jj + j2 + this.perm[kk + k2 + this.perm[ll + l2]]]
          ] % 32
        ];
        const g3: number[] = Noise4.gradient[
          this.perm[
          ii + i3 + this.perm[jj + j3 + this.perm[kk + k3 + this.perm[ll + l3]]]
          ] % 32
        ];
        const g4: number[] = Noise4.gradient[
          this.perm[
          ii + 1 + this.perm[jj + 1 + this.perm[kk + 1 + this.perm[ll + 1]]]
          ] % 32
        ];

        // Calculate the contribution from the five corners
        const t0: number = 0.5 - x0 * x0 - y0 * y0 - z0 * z0 - w0 * w0;
        const n0: number = t0 < 0
          ? 0.0
          : Math.pow(t0, 4) * (g0[0] * x0 + g0[1] * y0 + g0[2] * z0 + g0[3] * w0);
        const t1: number = 0.5 - x1 * x1 - y1 * y1 - z1 * z1 - w1 * w1;
        const n1: number = t1 < 0
          ? 0.0
          : Math.pow(t1, 4) * (g1[0] * x1 + g1[1] * y1 + g1[2] * z1 + g1[3] * w1);
        const t2: number = 0.5 - x2 * x2 - y2 * y2 - z2 * z2 - w2 * w2;
        const n2: number = t2 < 0
          ? 0.0
          : Math.pow(t2, 4) * (g2[0] * x2 + g2[1] * y2 + g2[2] * z2 + g2[3] * w2);
        const t3: number = 0.5 - x3 * x3 - y3 * y3 - z3 * z3 - w3 * w3;
        const n3: number = t3 < 0
          ? 0.0
          : Math.pow(t3, 4) * (g3[0] * x3 + g3[1] * y3 + g3[2] * z3 + g3[3] * w3);
        const t4: number = 0.5 - x4 * x4 - y4 * y4 - z4 * z4 - w4 * w4;
        const n4: number = t4 < 0
          ? 0.0
          : Math.pow(t4, 4) * (g4[0] * x4 + g4[1] * y4 + g4[2] * z4 + g4[3] * w4);

        // Sum up and scale the result to cover the range [-1,1]
        return 72.37855765153665 * (n0 + n1 + n2 + n3 + n4);
      };
    }

    public sample = (_x: number, _y: number, _z: number, _w: number): number => {
      return this.#sample(_x, _y, _z, _w);
    }
  }
}