namespace FudgeCore {
  /**
   * The simplest {@link Coat} providing just a color
   */
  @RenderInjectorCoat.decorate
  export class CoatRemissive extends CoatColored {
    public specular: number;
    public diffuse: number;

    constructor(_color: Color = new Color(), _diffuse: number = 1, _specular: number = 0) {
      super(_color);
      this.diffuse = _diffuse;
      this.specular = _specular;
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      serialization.diffuse = this.diffuse;
      serialization.specular = this.specular;
      return serialization;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization);
      await this.color.deserialize(_serialization.color);
      this.diffuse = _serialization.diffuse;
      this.specular = _serialization.specular;
      return this;
    }
    //#endregion
  }
}