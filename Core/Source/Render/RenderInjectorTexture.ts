namespace FudgeCore {

  /**
   * Gives WebGL Buffer the data from the {@link Texture}
   * @internal
   */
  export class RenderInjectorTexture extends RenderInjector {
    public static decorate(_constructor: Function): void {
      RenderInjector.inject(_constructor, RenderInjectorTexture);
      Object.defineProperty(_constructor.prototype, "deleteRenderData", {
        value: RenderInjectorTexture.deleteRenderData
      });
    }

    protected static injectTexture(this: Texture, _textureUnit: number = WebGL2RenderingContext.TEXTURE0): void {
      let crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();
      if (!this.renderData)
        this.renderData = RenderWebGL.assert<WebGLTexture>(crc3.createTexture()); // TODO: check if all WebGL-Creations are asserted

      crc3.activeTexture(_textureUnit);
      crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, this.renderData);

      if (!this.textureDirty && !this.mimapDirty)
        return;

      if (this.textureDirty) {
        try {
          crc3.texImage2D(
            WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE,
            this.texImageSource
          );
        } catch (_error) {
          Debug.error(_error);
        }
      }

      if (this.mimapDirty) {
        switch (this.mipmap) {
          case MIPMAP.CRISP:
            crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MAG_FILTER, WebGL2RenderingContext.NEAREST);
            crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.NEAREST);
            break;
          case MIPMAP.MEDIUM:
            crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MAG_FILTER, WebGL2RenderingContext.NEAREST);
            crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.NEAREST_MIPMAP_LINEAR);
            break;
          case MIPMAP.BLURRY:
            crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MAG_FILTER, WebGL2RenderingContext.LINEAR);
            crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.LINEAR_MIPMAP_LINEAR);
            break;
        }
      }

      if (this.mipmap !== MIPMAP.CRISP) 
        crc3.generateMipmap(WebGL2RenderingContext.TEXTURE_2D);

      this.textureDirty = false;
      this.mimapDirty = false;
    }

    protected static deleteRenderData(this: Texture): void {
      if (!this.renderData)
        return;

      let crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();
      crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, null);
      crc3.deleteTexture(this.renderData);
      this.renderData = null;
      this.textureDirty = true;
      this.mimapDirty = true;
    }
  }
}