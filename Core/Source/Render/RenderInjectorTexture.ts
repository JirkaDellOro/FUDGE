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

      if (this.textureDirty) {
        try {
          // Always premultiply alpha while loading textures
          crc3.pixelStorei(crc3.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
          crc3.texImage2D(
            WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE,
            this.texImageSource
          );
          crc3.pixelStorei(crc3.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);

          this.mipmapDirty = true;
          this.textureDirty = false;
        } catch (_error) {
          Debug.error(_error);
        }
      }

      if (this.mipmapDirty) {
        switch (this.mipmap) {
          case MIPMAP.CRISP:
            crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MAG_FILTER, WebGL2RenderingContext.NEAREST);
            crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.NEAREST);
            break;
          case MIPMAP.MEDIUM:
            crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MAG_FILTER, WebGL2RenderingContext.NEAREST);
            crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.NEAREST_MIPMAP_LINEAR);
            crc3.generateMipmap(WebGL2RenderingContext.TEXTURE_2D);
            break;
          case MIPMAP.BLURRY:
            crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MAG_FILTER, WebGL2RenderingContext.LINEAR);
            crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.LINEAR_MIPMAP_LINEAR);
            crc3.generateMipmap(WebGL2RenderingContext.TEXTURE_2D);
            break;
        }

        this.mipmapDirty = false;
      }

      if (this.wrapDirty) {
        switch (this.wrap) {
          case WRAP.REPEAT:
            crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_S, WebGL2RenderingContext.REPEAT);
            crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_T, WebGL2RenderingContext.REPEAT);
            break;
          case WRAP.CLAMP:
            crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_S, WebGL2RenderingContext.CLAMP_TO_EDGE);
            crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_T, WebGL2RenderingContext.CLAMP_TO_EDGE);
            break;
          case WRAP.MIRROR:
            crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_S, WebGL2RenderingContext.MIRRORED_REPEAT);
            crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_T, WebGL2RenderingContext.MIRRORED_REPEAT);
            break;
        }

        this.wrapDirty = false;
      }
    }

    protected static deleteRenderData(this: Texture): void {
      if (!this.renderData)
        return;

      let crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();
      crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, null);
      crc3.deleteTexture(this.renderData);
      this.renderData = null;
      this.textureDirty = true;
      this.mipmapDirty = true;
      this.wrapDirty = true;
    }
  }
}