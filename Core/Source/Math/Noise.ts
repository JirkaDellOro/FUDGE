namespace FudgeCore {

  /**
   * Baseclass for Noise2, Noise3 and Noise4
   * @authors Jirka Dell'Oro-Friedl, HFU, 2021
   * This is an adaption of https://www.npmjs.com/package/fast-simplex-noise
   */
  export abstract class Noise {
    protected perm: Uint8Array = new Uint8Array(512);
    protected permMod12: Uint8Array = new Uint8Array(512);
    
    /**
     * Returns a random value between -1 and 1 based on the given position
     */
    public abstract sample: (..._args: number[]) => number;

    public constructor(_random: Function = Math.random) {
      const p: Uint8Array = new Uint8Array(256);
      for (let i: number = 0; i < 256; i++)
        p[i] = i;

      let n: number;
      let q: number;
      for (let i: number = 255; i > 0; i--) {
        n = Math.floor((i + 1) * _random());
        q = p[i];
        p[i] = p[n];
        p[n] = q;
      }

      for (let i: number = 0; i < 512; i++) {
        this.perm[i] = p[i & 255];
        this.permMod12[i] = this.perm[i] % 12;
      }
    }


  }
}