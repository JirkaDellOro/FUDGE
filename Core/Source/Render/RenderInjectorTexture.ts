namespace FudgeCore {
   //gives WebGL Buffer the data from the {@link Texture]]
  export class RenderInjectorTexture extends RenderInjector {
    public static decorate(_constructor: Function): void {
      RenderInjector.inject(_constructor, RenderInjectorTexture);
    }

    protected static injectTexture(this: Texture): void {
      let crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();
      if (this.renderData) {
        // buffers exist
        crc3.activeTexture(WebGL2RenderingContext.TEXTURE0);
        crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, this.renderData["texture0"]);
      }
      else {
        this.renderData = {};
        // TODO: check if all WebGL-Creations are asserted
        const texture: WebGLTexture = Render.assert<WebGLTexture>(crc3.createTexture());
        crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, texture);

        try {
          crc3.texImage2D(crc3.TEXTURE_2D, 0, crc3.RGBA, crc3.RGBA, crc3.UNSIGNED_BYTE, this.texImageSource);
          crc3.texImage2D(
            WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE,
            this.texImageSource
          );
        } catch (_error) {
          Debug.error(_error);
        }
        switch (this.mipmap) {
          case MIPMAP.CRISP:
            crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MAG_FILTER, WebGL2RenderingContext.NEAREST);
            crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.NEAREST);
            break;
          case MIPMAP.MEDIUM:
            crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MAG_FILTER, WebGL2RenderingContext.NEAREST);
            crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.NEAREST_MIPMAP_LINEAR);
            crc3.generateMipmap(crc3.TEXTURE_2D);
            break;
          case MIPMAP.BLURRY:
            crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MAG_FILTER, WebGL2RenderingContext.LINEAR);
            crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.LINEAR_MIPMAP_LINEAR);
            crc3.generateMipmap(crc3.TEXTURE_2D);
            break;
        }
        this.renderData["texture0"] = texture;

        crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, null);

        this.useRenderData();
      }
    }
  }
}