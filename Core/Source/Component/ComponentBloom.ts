namespace FudgeCore {
  /**
   * Attaches a {@link Material} to the node
   * @authors Jirka Dell'Oro-Friedl, HFU, 2019 - 2021
   */
  export class ComponentBloom extends Component {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentBloom);
    public threshold: number;
    public intensity: number;
    public desaturateHighlights: number;

    public constructor(_threshold: number = 0.9, _intensity: number = 1.0, _desaturateHighlights: number = 0.5) {
      super();
      this.threshold = _threshold;
      this.intensity = _intensity;
      this.desaturateHighlights = _desaturateHighlights;
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = {
        threshold: this.threshold,
        intensity: this.intensity,
        desaturateHighlights: this.desaturateHighlights,
      };
      serialization[super.constructor.name] = super.serialize();
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.threshold = _serialization.threshold;
      this.intensity = _serialization.intensity;
      this.desaturateHighlights = _serialization.desaturateHighlights;
      await super.deserialize(_serialization[super.constructor.name]);
      return this;
    }
  }
}