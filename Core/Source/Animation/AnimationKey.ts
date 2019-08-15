/// <reference path="../Transfer/Serializer.ts"/>
/// <reference path="../Transfer/Mutable.ts"/>

namespace Fudge {
  /**
   * 
   * @author Lukas Scheuerle, HFU, 2019
   */
  export class AnimationKey extends Mutable implements Serializable {
    time: number;
    value: number;
    constant: boolean = false;
    functionIn: AnimationFunction;
    functionOut: AnimationFunction;

    broken: boolean;
    path2D: Path2D;

    private slopeIn: number = 0;
    private slopeOut: number = 0;

    constructor(_time: number = 0, _value: number = 0, _slopeIn: number = 0, _slopeOut: number = 0, _constant: boolean = false) {
      super();
      this.time = _time;
      this.value = _value;
      this.slopeIn = _slopeIn;
      this.slopeOut = _slopeOut;
      this.constant = _constant;

      this.broken = this.slopeIn != -this.slopeOut;
    }

    get getSlopeIn(): number {
      return this.slopeIn;
    }
    get getSlopeOut(): number {
      return this.slopeOut;
    }

    set setSlopeIn(_slope: number) {
      this.slopeIn = _slope;
      this.functionIn.calculate();
    }

    set setSlopeOut(_slope: number) {
      this.slopeOut = _slope;
      this.functionOut.calculate();
    }

    static sort(_a: AnimationKey, _b: AnimationKey): number {
      return _a.time - _b.time;
    }

    //#region transfer
    serialize(): Serialization {
      let s: Serialization = {};
      // s[this.constructor.name] = {
      //   time : this.time,
      //   value : this.value,
      //   slopeIn : this.slopeIn,
      //   slopeOut : this.slopeOut,
      //   constant : this.constant
      // };
      s.time = this.time;
      s.value = this.value;
      s.slopeIn = this.slopeIn;
      s.slopeOut = this.slopeOut;
      s.constant = this.constant;
      return s;
    }

    deserialize(_serialization: Serialization): Serializable {
      this.time = _serialization.time;
      this.value = _serialization.value;
      this.slopeIn = _serialization.slopeIn;
      this.slopeOut = _serialization.slopeOut;
      this.constant = _serialization.constant;

      this.broken = this.slopeIn != -this.slopeOut;

      return this;
    }

    getMutator(): Mutator {
      return this.serialize();
    }

    protected reduceMutator(_mutator: Mutator): void {
      //
    }
    //#endregion

  }

}