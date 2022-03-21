namespace FudgeCore {
  /**
   * The simplest {@link Coat} providing just a color
   */
  @RenderInjectorCoat.decorate
  export class CoatColored extends Coat {
    public color: Color;
    constructor(_color: Color = new Color()) {
      super();
      this.color = _color;
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      serialization.color = this.color.serialize();
      return serialization;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization);
      await this.color.deserialize(_serialization.color);
      return this;
    }
    //#endregion
  }
}