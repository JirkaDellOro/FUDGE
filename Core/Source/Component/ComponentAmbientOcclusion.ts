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
    public shadowDistance: number;

    public constructor(_clrAO: Color = new Color(0, 0, 0, 1), _radius: number = 1.5, _samples: number = 64, _distance: number = 85.0) {
      super();
      this.clrAO = _clrAO;
      this.radius = _radius;
      this.samples = _samples;
      this.shadowDistance = _distance;
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = {
        clrAO: this.clrAO.serialize(),
        samples: this.samples,
        radius: this.radius,
        distance: this.shadowDistance,
      };
      serialization[super.constructor.name] = super.serialize();
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await this.clrAO.deserialize(_serialization.clrAO);
      this.samples = _serialization.samples;
      this.radius = _serialization.radius;
      this.shadowDistance = _serialization.distance;
      await super.deserialize(_serialization[super.constructor.name]);
      return this;
    }
  }
}