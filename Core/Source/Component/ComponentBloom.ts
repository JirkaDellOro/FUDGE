namespace FudgeCore {
  /**
   * Attaches a {@link Material} to the node
   * @authors Jirka Dell'Oro-Friedl, HFU, 2019 - 2021
   */
  export class ComponentBloom extends Component {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentBloom);
    public threshold: number;
    public intensity: number;
    public lvl: number;

    public constructor(_threshold: number = 0.6, _intensity: number = 1.0, _lvl: number = 0.0) {
      super();
      this.threshold = _threshold;
      this.intensity = _intensity;
      this.lvl = _lvl;
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = {
        threshold: this.threshold,
        intensity: this.intensity,
        lvl: this.lvl,
      };
      serialization[super.constructor.name] = super.serialize();
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.threshold = _serialization.threshold;
      this.intensity = _serialization.intensity;
      this.lvl = _serialization.lvl;
      await super.deserialize(_serialization[super.constructor.name]);
      return this;
    }
  }
}