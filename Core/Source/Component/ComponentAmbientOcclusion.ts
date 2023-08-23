namespace FudgeCore {
  /**
   * Attaches a {@link Material} to the node
   * @authors Jirka Dell'Oro-Friedl, HFU, 2019 - 2021
   */
  export class ComponentAmbientOcclusion extends Component {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentAmbientOcclusion);
    public clrAO: Color = new Color(0, 0, 0, 1); // Ambient occlusion color
    public radius: number;
    public samples: number;

    public constructor(_clrAO: Color = new Color(0, 0, 0, 1), _radius: number = 0.1, _samples: number = 64) {
      super();
      this.clrAO = _clrAO;
      this.radius = _radius;
      this.samples = _samples;
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = {
        clrAO: this.clrAO.serialize(),
        samples: this.samples,
        radius: this.radius,
      };
      serialization[super.constructor.name] = super.serialize();
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await this.clrAO.deserialize(_serialization.clrAO);
      this.samples = _serialization.samples;
      this.radius = _serialization.radius;
      await super.deserialize(_serialization[super.constructor.name]);
      return this;
    }
  }
}