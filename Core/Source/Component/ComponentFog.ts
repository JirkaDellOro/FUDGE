namespace FudgeCore {
  /**
   * Attaches a {@link Material} to the node
   * @authors Jirka Dell'Oro-Friedl, HFU, 2019 - 2021
   */
  export class ComponentFog extends Component {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentFog);
    public color: Color = new Color(1, 1, 1, 1);
    public near: number = 1;
    public far: number = 50;

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = {
        color: this.color.serialize(),
        near: this.near,
        far: this.far
      };
      serialization[super.constructor.name] = super.serialize();
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await this.color.deserialize(_serialization.color);
      this.near = _serialization.near ?? this.near;
      this.far = _serialization.far ?? this.far;
      await super.deserialize(_serialization[super.constructor.name]);
      return this;
    }
  }
}