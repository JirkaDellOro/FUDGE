namespace FudgeCore {
  /**
   * The simplest {@link Coat} providing just a color
   */
  @RenderInjectorCoat.decorate
  export class CoatRemissive extends CoatColored {
    public diffuse: number;
    public metallic: number;
    public specular: number;
    public intensity: number;

    constructor(_color: Color = new Color(), _diffuse: number = 1, _specular: number = 0.5, _metallic: number = 0.0, _intensity: number = 0.7) {
      super(_color);
      this.diffuse = _diffuse;
      this.metallic = _metallic;
      this.specular = _specular;
      this.intensity = _intensity;
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      serialization.diffuse = this.diffuse;
      serialization.metallic = this.metallic;
      serialization.specular = this.specular;
      serialization.intensity = this.intensity;
      return serialization;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization);
      await this.color.deserialize(_serialization.color);
      this.diffuse = _serialization.diffuse;
      this.metallic = _serialization.metallic;
      this.specular = _serialization.specular;
      this.intensity = _serialization.intensity;
      return this;
    }
    //#endregion
  }
}