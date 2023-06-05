namespace FudgeCore {
  /**
   * Attaches a {@link Material} to the node
   * @authors Jirka Dell'Oro-Friedl, HFU, 2019 - 2021
   */
  export class ComponentPostFX extends Component {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentPostFX);
    public mist: boolean;
    public ao: boolean;
    public bloom: boolean;

    public constructor(_mist: boolean = false, _ao: boolean = false, _bloom: boolean = false) {
      super();
      this.mist = _mist;
      this.ao = _ao;
      this.bloom = _bloom;
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = {
        mist: this.mist,
        ao: this.ao,
        bloom: this.bloom
      };

      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.mist = _serialization.mist;
      this.ao = _serialization.ao;
      this.bloom = _serialization.bloom;
      return this;
    }
  }
}