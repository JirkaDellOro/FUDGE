namespace FudgeCore {
  export class RenderInjectorTexture extends RenderInjector {
    public static decorate(_constructor: Function): void {
      RenderInjector.inject(_constructor, RenderInjectorTexture);
    }

    protected static injectTextureImage(this: Texture): void {
      let crc3: WebGL2RenderingContext = RenderOperator.getRenderingContext();
      if (this.renderData) {
        // buffers exist
        crc3.activeTexture(WebGL2RenderingContext.TEXTURE0);
        crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, this.renderData["texture0"]);
      }
      else {
        this.renderData = {};
        // TODO: check if all WebGL-Creations are asserted
        const texture: WebGLTexture = RenderManager.assert<WebGLTexture>(crc3.createTexture());
        crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, texture);

        try {
          crc3.texImage2D(crc3.TEXTURE_2D, 0, crc3.RGBA, crc3.RGBA, crc3.UNSIGNED_BYTE, (<TextureImage>this).image);
          crc3.texImage2D(
            WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE,
            (<TextureImage>this).image
          );
        } catch (_error) {
          Debug.error(_error);
        }
        crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MAG_FILTER, WebGL2RenderingContext.NEAREST);
        crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.NEAREST);
        // crc3.generateMipmap(crc3.TEXTURE_2D);
        this.renderData["texture0"] = texture;

        crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, null);

        this.useRenderData();
      }
    }
  }
}