// / <reference path="../Transfer/Serializer.ts"/>
// / <reference path="../Transfer/Mutable.ts"/>

namespace FudgeCore {
  /**
   * Holds information about continous points in time their accompanying values as well as their slopes. 
   * Also holds a reference to the {@link AnimationFunction}s that come in and out of the sides. 
   * The {@link AnimationFunction}s are handled by the {@link AnimationSequence}s.
   * If the property constant is true, the value does not change and wil not be interpolated between this and the next key in a sequence
   * @author Lukas Scheuerle, HFU, 2019
   */
  export class AnimationKey extends Mutable implements Serializable {
    // TODO: check if functionIn can be removed
    /**Don't modify this unless you know what you're doing.*/
    functionIn: AnimationFunction;
    /**Don't modify this unless you know what you're doing.*/
    functionOut: AnimationFunction;
    
    broken: boolean;

    #time: number;
    #value: number;
    #constant: boolean = false;

    #slopeIn: number = 0;
    #slopeOut: number = 0;

    constructor(_time: number = 0, _value: number = 0, _slopeIn: number = 0, _slopeOut: number = 0, _constant: boolean = false) {
      super();
      this.#time = _time;
      this.#value = _value;
      this.#slopeIn = _slopeIn;
      this.#slopeOut = _slopeOut;
      this.#constant = _constant;

      this.broken = this.slopeIn != -this.slopeOut;
      this.functionOut = new AnimationFunction(this, null);
    }

    /**
     * Static comparation function to use in an array sort function to sort the keys by their time.
     * @param _a the animation key to check
     * @param _b the animation key to check against
     * @returns >0 if a>b, 0 if a=b, <0 if a<b
     */
    public static compare(_a: AnimationKey, _b: AnimationKey): number {
      return _a.time - _b.time;
    }

    get time(): number {
      return this.#time; 
    }

    set time(_time: number) {
      this.#time = _time;
      this.functionIn.calculate();
      this.functionOut.calculate();
    }

    get value(): number {
      return this.#value;
    }

    set value(_value: number) {
      this.#value = _value;
      this.functionIn.calculate();
      this.functionOut.calculate();
    }
    
    get constant(): boolean {
      return this.#constant;
    }

    set constant(_constant: boolean) {
      this.#constant = _constant;
      this.functionIn.calculate();
      this.functionOut.calculate();
    }

    get slopeIn(): number {
      return this.#slopeIn;
    }
    
    set slopeIn(_slope: number) {
      this.#slopeIn = _slope;
      this.functionIn.calculate();
    }

    get slopeOut(): number {
      return this.#slopeOut;
    }

    set slopeOut(_slope: number) {
      this.#slopeOut = _slope;
      this.functionOut.calculate();
    }


    //#region transfer
    serialize(): Serialization {
      let serialization: Serialization = {};
      serialization.time = this.#time;
      serialization.value = this.#value;
      serialization.slopeIn = this.#slopeIn;
      serialization.slopeOut = this.#slopeOut;
      serialization.constant = this.#constant;
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.#time = _serialization.time;
      this.#value = _serialization.value;
      this.#slopeIn = _serialization.slopeIn;
      this.#slopeOut = _serialization.slopeOut;
      this.#constant = _serialization.constant;

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