namespace FudgeCore {
  /**
   * Attaches a {@link Material} to the node
   * @authors Jirka Dell'Oro-Friedl, HFU, 2019 - 2021
   */
  export class ComponentAmbientOcclusion extends Component {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentAmbientOcclusion);
    public clrAO: Color = new Color(0, 0, 0, 1); // Ambient occlusion color

    public constructor(_mist: boolean = false, _clrMist: Color = new Color(1, 1, 1, 1), _nearPlane: number = 1, _farPlane: number = 50, _ao: boolean = false, _clrAO: Color = new Color(0, 0, 0, 1), _bloom: boolean = false) {
      super();
      this.clrAO = _clrAO;
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = {
        clrAO: this.clrAO.serialize(),
      };
      serialization[super.constructor.name] = super.serialize();
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await this.clrAO.deserialize(_serialization.clrAO);
      await super.deserialize(_serialization[super.constructor.name]);
      return this;
    }
  }
}