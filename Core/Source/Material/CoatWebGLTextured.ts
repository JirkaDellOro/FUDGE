namespace FudgeCore {
  /**
   * A {@link Coat} providing only a texture
   */
  @RenderInjectorCoat.decorate
  export class CoatWebGlTextured extends Coat {
    public texture: WebGLTexture = null;
    public constructor(_texture: WebGLTexture = TextureDefault.texture) {
      super();
      this.texture = _texture;
    }
  }
}