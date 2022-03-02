namespace FudgeCore {
  
  //gives WebGL Buffer the data from the {@link Coat}
  export class RenderInjectorCoat extends RenderInjector {
    public static decorate(_constructor: Function): void {
      RenderInjector.inject(_constructor, RenderInjectorCoat);
    }

    protected static injectCoatColored(this: Coat, _shader: typeof Shader, _cmpMaterial: ComponentMaterial): void {
      let colorUniformLocation: WebGLUniformLocation = _shader.uniforms["u_vecColor"];
      let color: Color = Color.MULTIPLY((<CoatColored>this).color, _cmpMaterial.clrPrimary);
      RenderWebGL.getRenderingContext().uniform4fv(colorUniformLocation, color.getArray());

      let shininessUniformLocation: WebGLUniformLocation = _shader.uniforms["u_fShininess"];
      let shininess: number = (<CoatColored>this).shininess;
      RenderWebGL.getRenderingContext().uniform1f(shininessUniformLocation, shininess);
    }

    protected static injectCoatTextured(this: Coat, _shader: typeof Shader, _cmpMaterial: ComponentMaterial): void {
      let crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();
      Reflect.apply(RenderInjectorCoat.injectCoatColored, this, [_shader, _cmpMaterial]);

      (<CoatTextured>this).texture.useRenderData();
      crc3.uniform1i(_shader.uniforms["u_texture"], 0);
      crc3.uniformMatrix3fv(_shader.uniforms["u_mtxPivot"], false, _cmpMaterial.mtxPivot.get());
    }

    protected static injectCoatMatCap(this: Coat, _shader: typeof Shader, _cmpMaterial: ComponentMaterial): void {
      let crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();

      let colorUniformLocation: WebGLUniformLocation = _shader.uniforms["u_tint_color"];
      let { r, g, b, a } = (<CoatMatCap>this).color;
      let tintColorArray: Float32Array = new Float32Array([r, g, b, a]);
      crc3.uniform4fv(colorUniformLocation, tintColorArray);

      let floatUniformLocation: WebGLUniformLocation = _shader.uniforms["shade_smooth"];
      let shadeSmooth: number = (<CoatMatCap>this).shadeSmooth;
      crc3.uniform1i(floatUniformLocation, shadeSmooth);

      if (this.renderData) {
        // buffers exist
        crc3.activeTexture(WebGL2RenderingContext.TEXTURE0);
        crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, this.renderData["texture0"]);
        crc3.uniform1i(_shader.uniforms["u_texture"], 0);
      }
      else {
        this.renderData = {};
        // TODO: check if all WebGL-Creations are asserted
        const texture: WebGLTexture = Render.assert<WebGLTexture>(crc3.createTexture());
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
        this.useRenderData(_shader, _cmpMaterial);
      }
    }
  }
}