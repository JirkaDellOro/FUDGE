///<reference path="CoatTextured.ts"/>

namespace FudgeCore {
  /**
   * A {@link Coat} providing a texture and additional data for texturing
   */
  @RenderInjectorCoat.decorate
  export class CoatRemissiveTextured extends CoatTextured {
    public diffuse: number;
    public metallic: number;
    public specular: number;
    public intensity: number;

    constructor(_color: Color = new Color(), _texture: Texture = TextureDefault.texture, _diffuse: number = 1, _specular: number = 0.5, _metallic: number = 0.0, _intensity: number = 0.7) {
      super(_color, _texture);
      this.diffuse = _diffuse;
      this.metallic = _metallic;
      this.specular = _specular;
      this.intensity = _intensity;
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      serialization.diffuse = this.diffuse;
      serialization.specular = this.specular;
      serialization.metallic = this.metallic;
      serialization.intensity = this.intensity;
      return serialization;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization);
      this.diffuse = _serialization.diffuse;
      this.specular = _serialization.specular;
      this.metallic = _serialization.metallic;
      this.intensity = _serialization.intensity;
      return this;
    }
    //#endregion
  }
}