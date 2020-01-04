//<reference path="../Coats/Coat.ts"/>
namespace FudgeCore {
  type CoatInjection = (this: Coat, _renderShader: RenderShader) => void;
  export class RenderInjector {
    private static coatInjections: { [className: string]: CoatInjection } = {
      "CoatColored": RenderInjector.injectRenderDataForCoatColored,
      "CoatTextured": RenderInjector.injectRenderDataForCoatTextured,
      "CoatMatCap": RenderInjector.injectRenderDataForCoatMatCap
    };

    public static decorateCoat(_constructor: Function): void {
      let coatInjection: CoatInjection = RenderInjector.coatInjections[_constructor.name];
      if (!coatInjection) {
        Debug.error("No injection decorator defined for " + _constructor.name);
      }
      Object.defineProperty(_constructor.prototype, "useRenderData", {
        value: coatInjection
      });
    }

    private static injectRenderDataForCoatColored(this: Coat, _renderShader: RenderShader): void {
      let colorUniformLocation: WebGLUniformLocation = _renderShader.uniforms["u_color"];
      // let { r, g, b, a } = (<CoatColored>this).color;
      // let color: Float32Array = new Float32Array([r, g, b, a]);
      let color: Float32Array = (<CoatColored>this).color.getArray();
      RenderOperator.getRenderingContext().uniform4fv(colorUniformLocation, color);
    }

    private static injectRenderDataForCoatTextured(this: Coat, _renderShader: RenderShader): void {
      let crc3: WebGL2RenderingContext = RenderOperator.getRenderingContext();
      if (this.renderData) {
        // buffers exist
        crc3.activeTexture(WebGL2RenderingContext.TEXTURE0);
        crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, this.renderData["texture0"]);
        crc3.uniform1i(_renderShader.uniforms["u_texture"], 0);
        crc3.uniformMatrix3fv(_renderShader.uniforms["u_pivot"], false, (<CoatTextured>this).pivot.get());
      }
      else {
        this.renderData = {};
        // TODO: check if all WebGL-Creations are asserted
        const texture: WebGLTexture = RenderManager.assert<WebGLTexture>(crc3.createTexture());
        crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, texture);

        try {
          crc3.texImage2D(crc3.TEXTURE_2D, 0, crc3.RGBA, crc3.RGBA, crc3.UNSIGNED_BYTE, (<CoatTextured>this).texture.image);
          crc3.texImage2D(
            WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE,
            (<CoatTextured>this).texture.image
          );
        } catch (_error) {
          Debug.error(_error);
        }
        crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MAG_FILTER, WebGL2RenderingContext.NEAREST);
        crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.NEAREST);
        crc3.generateMipmap(crc3.TEXTURE_2D);
        this.renderData["texture0"] = texture;

        crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, null);

        this.useRenderData(_renderShader);
      }
    }

    private static injectRenderDataForCoatMatCap(this: Coat, _renderShader: RenderShader): void {
      let crc3: WebGL2RenderingContext = RenderOperator.getRenderingContext();

      let colorUniformLocation: WebGLUniformLocation = _renderShader.uniforms["u_tint_color"];
      let { r, g, b, a } = (<CoatMatCap>this).tintColor;
      let tintColorArray: Float32Array = new Float32Array([r, g, b, a]);
      crc3.uniform4fv(colorUniformLocation, tintColorArray);

      let floatUniformLocation: WebGLUniformLocation = _renderShader.uniforms["u_flatmix"];
      let flatMix: number = (<CoatMatCap>this).flatMix;
      crc3.uniform1f(floatUniformLocation, flatMix);

      if (this.renderData) {
        // buffers exist
        crc3.activeTexture(WebGL2RenderingContext.TEXTURE0);
        crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, this.renderData["texture0"]);
        crc3.uniform1i(_renderShader.uniforms["u_texture"], 0);
      }
      else {
        this.renderData = {};
        // TODO: check if all WebGL-Creations are asserted
        const texture: WebGLTexture = RenderManager.assert<WebGLTexture>(crc3.createTexture());
        crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, texture);

        try {
          crc3.texImage2D(crc3.TEXTURE_2D, 0, crc3.RGBA, crc3.RGBA, crc3.UNSIGNED_BYTE, (<CoatMatCap>this).texture.image);
          crc3.texImage2D(
            WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE,
            (<CoatMatCap>this).texture.image
          );
        } catch (_error) {
          Debug.error(_error);
        }
        crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MAG_FILTER, WebGL2RenderingContext.NEAREST);
        crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.NEAREST);
        crc3.generateMipmap(crc3.TEXTURE_2D);
        this.renderData["texture0"] = texture;

        crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, null);
        this.useRenderData(_renderShader);
      }
    }
  }
}