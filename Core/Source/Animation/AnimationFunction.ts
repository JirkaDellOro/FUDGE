// / <reference path="../Transfer/Serializer.ts"/>
// / <reference path="../Transfer/Mutable.ts"/>

namespace FudgeCore {
  /**
   * Calculates the values between {@link AnimationKey}s.
   * Represented internally by a cubic function (`f(x) = ax³ + bx² + cx + d`). 
   * Only needs to be recalculated when the keys change, so at runtime it should only be calculated once.
   * @author Lukas Scheuerle, HFU, 2019
   */
  export class AnimationFunction {
    private a: number = 0;
    private b: number = 0;
    private c: number = 0;
    private d: number = 0;
    private keyIn: AnimationKey;
    private keyOut: AnimationKey;


    constructor(_keyIn: AnimationKey, _keyOut: AnimationKey = null) {
      this.keyIn = _keyIn;
      this.keyOut = _keyOut;
      this.calculate();
    }

    /**
     * Calculates the value of the function at the given time.
     * @param _time the point in time at which to evaluate the function in milliseconds. Will be corrected for offset internally.
     * @returns the value at the given time
     */
    evaluate(_time: number): number {
      _time -= this.keyIn.Time;
      let time2: number = _time * _time;
      let time3: number = time2 * _time;
      return this.a * time3 + this.b * time2 + this.c * _time + this.d;
    }

    set setKeyIn(_keyIn: AnimationKey) {
      this.keyIn = _keyIn;
      this.calculate();
    }

    set setKeyOut(_keyOut: AnimationKey) {
      this.keyOut = _keyOut;
      this.calculate();
    }

    /**
     * (Re-)Calculates the parameters of the cubic function.
     * See https://math.stackexchange.com/questions/3173469/calculate-cubic-equation-from-two-points-and-two-slopes-variably
     * and https://jirkadelloro.github.io/FUDGE/Documentation/Logs/190410_Notizen_LS
     */
    calculate(): void {
      if (!this.keyIn) {
        this.d = this.c = this.b = this.a = 0;
        return;
      }
      if (!this.keyOut || this.keyIn.Constant) {
        this.d = this.keyIn.Value;
        this.c = this.b = this.a = 0;
        return;
      }

      let x1: number = this.keyOut.Time - this.keyIn.Time;

      this.d = this.keyIn.Value;
      this.c = this.keyIn.SlopeOut;

      this.a = (-x1 * (this.keyIn.SlopeOut + this.keyOut.SlopeIn) - 2 * this.keyIn.Value + 2 * this.keyOut.Value) / -Math.pow(x1, 3);
      this.b = (this.keyOut.SlopeIn - this.keyIn.SlopeOut - 3 * this.a * Math.pow(x1, 2)) / (2 * x1);
    }
  }

}