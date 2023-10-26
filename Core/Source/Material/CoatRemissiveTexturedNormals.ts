///<reference path="CoatTextured.ts"/>

namespace FudgeCore {
  /**
   * A {@link Coat} providing a texture and additional data for texturing
   */
  @RenderInjectorCoat.decorate
  export class CoatRemissiveTexturedNormals extends CoatRemissiveTextured {
    public normalMap: Texture = null;

    public constructor(_color: Color = new Color(), _texture: Texture = TextureDefault.texture, _normalMap: Texture = TextureNormalDefault.texture, _diffuse: number = 1, _specular: number = 0, _metallic: number = 0.5, _intensity: number = 0.5) {
      super(_color, _texture, _diffuse, _specular, _metallic, _intensity);
      this.normalMap = _normalMap;
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      serialization.idNormalMap = this.normalMap.idResource;
      return serialization;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization);
      if (_serialization.idNormalMap)
        this.normalMap = <Texture>await Project.getResource(_serialization.idNormalMap);
      return this;
    }
    //#endregion
  }
}