///<reference path="CoatTextured.ts"/>

namespace FudgeCore {
  /**
   * A {@link Coat} providing a texture and additional data for texturing
   */
  @RenderInjectorCoat.decorate
  export class CoatRemissiveTextured extends CoatTextured {
    public specular: number;
    public diffuse: number;

    constructor(_color: Color = new Color(), _texture: Texture = TextureDefault.texture, _diffuse: number = 1, _specular: number = 0) {
      super(_color, _texture);
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
      this.diffuse = _serialization.diffuse;
      this.specular = _serialization.specular;
      return this;
    }
    //#endregion
  }
}