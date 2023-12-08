namespace FudgeCore {
  /**
   * Attached to a {@link Node} with an attached {@link ComponentCamera} this causes the rendered image to receive a bloom-effect.
   * @authors Roland Heer, HFU, 2023
   */
  export class ComponentBloom extends Component {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentBloom);
    
    #threshold: number;
    #intensity: number;
    #highlightDesaturation: number;

    public constructor(_threshold: number = 0.95, _intensity: number = 1.0, _desaturateHighlights: number = 0.5) {
      super();
      this.#threshold = _threshold;
      this.#intensity = _intensity;
      this.#highlightDesaturation = _desaturateHighlights;
    }

    public get threshold(): number {
      return this.#threshold;
    }
    public set threshold(_value: number) {
      this.#threshold = Calc.clamp(_value, 0, 1);
    }

    public get intensity(): number {
      return this.#intensity;
    }
    public set intensity(_value: number) {
      this.#intensity = Math.max(0, _value);
    }

    public get highlightDesaturation(): number {
      return this.#highlightDesaturation;
    }
    public set highlightDesaturation(_value: number) {
      this.#highlightDesaturation = Calc.clamp(_value, 0, 1);
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = {
        threshold: this.#threshold,
        intensity: this.#intensity,
        desaturateHighlights: this.#highlightDesaturation,
      };
      serialization[super.constructor.name] = super.serialize();
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.#threshold = _serialization.threshold;
      this.#intensity = _serialization.intensity;
      this.#highlightDesaturation = _serialization.desaturateHighlights;
      await super.deserialize(_serialization[super.constructor.name]);
      return this;
    }

    public getMutator(): Mutator {
      let mutator: Mutator = super.getMutator(true);
      mutator.threshold = this.threshold;
      mutator.intensity = this.intensity;
      mutator.highlightDesaturation = this.highlightDesaturation;
      return mutator;
    }
  }
}