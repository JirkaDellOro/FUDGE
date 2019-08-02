/// <reference path="../Transfer/Serializer.ts"/>
/// <reference path="../Transfer/Mutable.ts"/>

namespace Fudge {
  /**
   * Calculates the values between [[AnimationKeys]]
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

    evaluate(_time: number): number {
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

    calculate(): void {
      if (!this.keyIn) {
        this.d = this.c = this.b = this.a = 0;
        return;
      }
      if (!this.keyOut || this.keyIn.constant) {
        this.d = this.keyIn.value;
        this.c = this.b = this.a = 0;
        return;
      }

      this.d = this.keyIn.value;
      this.c = this.keyIn.getSlopeOut;

      this.a = (-this.keyOut.time * (this.keyIn.getSlopeOut + this.keyOut.getSlopeIn) - 2 * this.keyIn.value + 2 * this.keyOut.value) / -Math.pow(this.keyOut.time, 3);
      this.b = (this.keyOut.getSlopeIn - this.keyIn.getSlopeOut - 3 * this.a * Math.pow(this.keyOut.time, 2)) / (2 * this.keyOut.time);
    }
  }

}