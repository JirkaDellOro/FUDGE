namespace FudgeCore {
  
  export enum ANIMATION_INTERPOLATION {
    CONSTANT,
    LINEAR,
    CUBIC
  }
  // type AnimationInterpolation = "constant" | "linear" | "cubic";

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
    public functionIn: AnimationFunction;
    /**Don't modify this unless you know what you're doing.*/
    public functionOut: AnimationFunction;

    #time: number;
    #value: number;
    #interpolation: ANIMATION_INTERPOLATION;

    #slopeIn: number = 0;
    #slopeOut: number = 0;

    public constructor(_time: number = 0, _value: number = 0, _interpolation: ANIMATION_INTERPOLATION = ANIMATION_INTERPOLATION.CUBIC, _slopeIn: number = 0, _slopeOut: number = 0) {
      super();
      this.#time = _time;
      this.#value = _value;
      this.#interpolation = _interpolation;
      this.#slopeIn = _slopeIn;
      this.#slopeOut = _slopeOut;

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

    public get time(): number {
      return this.#time;
    }

    public set time(_time: number) {
      this.#time = _time;
      this.functionIn.calculate();
      this.functionOut.calculate();
    }

    public get value(): number {
      return this.#value;
    }

    public set value(_value: number) {
      this.#value = _value;
      this.functionIn.calculate();
      this.functionOut.calculate();
    }

    public get interpolation(): ANIMATION_INTERPOLATION {
      return this.#interpolation;
    }

    public set interpolation(_interpolation: ANIMATION_INTERPOLATION) {
      this.#interpolation = _interpolation;
      this.functionIn.calculate();
      this.functionOut.calculate();
    }

    public get slopeIn(): number {
      return this.#slopeIn;
    }

    public set slopeIn(_slope: number) {
      this.#slopeIn = _slope;
      this.functionIn.calculate();
    }

    public get slopeOut(): number {
      return this.#slopeOut;
    }

    public set slopeOut(_slope: number) {
      this.#slopeOut = _slope;
      this.functionOut.calculate();
    }

    //#region transfer
    public serialize(): Serialization {
      let serialization: Serialization = {};
      serialization.time = this.#time;
      serialization.value = this.#value;
      serialization.interpolation = this.#interpolation;
      serialization.slopeIn = this.#slopeIn;
      serialization.slopeOut = this.#slopeOut;
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.#time = _serialization.time;
      this.#value = _serialization.value;
      this.#interpolation = _serialization.interpolation;
      this.#slopeIn = _serialization.slopeIn;
      this.#slopeOut = _serialization.slopeOut;
      // if (_serialization.interpolation == undefined)
      //   if (_serialization.constant) // TODO: remove this when constant is removed
      //     this.#interpolation = "constant";
      //   else
      //     this.#interpolation = "cubic";

      return this;
    }

    public getMutator(): Mutator {
      return this.serialize();
    }

    protected reduceMutator(_mutator: Mutator): void {
      //
    }
    //#endregion
  }
}