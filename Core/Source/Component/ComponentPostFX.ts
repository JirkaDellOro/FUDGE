namespace FudgeCore {
  /**
   * Attaches a {@link Material} to the node
   * @authors Jirka Dell'Oro-Friedl, HFU, 2019 - 2021
   */
  export class ComponentPostFX extends Component {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentPostFX);
    public mist: boolean;
    public clrMist: Color = new Color(1, 1, 1, 1); // Mist color
    public nearPlane: number;
    public farPlane: number;
    public ao: boolean;
    public clrAO: Color = new Color(0, 0, 0, 1); // Ambient occlusion color
    public bloom: boolean;

    public constructor(_mist: boolean = false, _clrMist: Color = new Color(1, 1, 1, 1), _nearPlane: number = 1, _farPlane: number = 50, _ao: boolean = false, _clrAO: Color = new Color(0, 0, 0, 1), _bloom: boolean = false) {
      super();
      this.mist = _mist;
      this.clrMist = _clrMist;
      this.nearPlane = _nearPlane;
      this.farPlane = _farPlane;
      this.ao = _ao;
      this.clrAO = _clrAO;
      this.bloom = _bloom;
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = {
        mist: this.mist,
        clrMist: this.clrMist.serialize(),
        nearPlane: this.nearPlane,
        farPlane: this.farPlane,
        ao: this.ao,
        clrAO: this.clrAO.serialize(),
        bloom: this.bloom
      };

      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.mist = _serialization.mist;
      await this.clrMist.deserialize(_serialization.clrMist);
      this.nearPlane = _serialization.nearPlane;
      this.farPlane = _serialization.farPlane;
      this.ao = _serialization.ao;
      await this.clrAO.deserialize(_serialization.clrAO);
      this.bloom = _serialization.bloom;
      return this;
    }
  }
}