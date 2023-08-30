namespace FudgeCore {
  /**
   * Attaches a {@link Material} to the node
   * @authors Jirka Dell'Oro-Friedl, HFU, 2019 - 2021
   */
  export class ComponentMist extends Component {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentMist);
    public clrMist: Color = new Color(1, 1, 1, 1); // Mist color
    public nearPlane: number;
    public farPlane: number;

    public constructor(_mist: boolean = false, _clrMist: Color = new Color(1), _nearPlane: number = 1, _farPlane: number = 50) {
      super();
      this.clrMist = _clrMist;
      this.nearPlane = _nearPlane;
      this.farPlane = _farPlane;
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = {
        clrMist: this.clrMist.serialize(),
        nearPlane: this.nearPlane,
        farPlane: this.farPlane
      };
serialization[super.constructor.name] = super.serialize();
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await this.clrMist.deserialize(_serialization.clrMist);
      this.nearPlane = _serialization.nearPlane;
      this.farPlane = _serialization.farPlane;
      await super.deserialize(_serialization[super.constructor.name]);
      return this;
    }
  }
}