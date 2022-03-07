namespace FudgeCore {
  
  //gives WebGL Buffer the data from the {@link Coat}
  export class RenderInjectorCoat extends RenderInjector {
    public static decorate(_constructor: Function): void {
      RenderInjector.inject(_constructor, RenderInjectorCoat);
    }

    protected static injectCoatColored(this: Coat, _shader: typeof Shader, _cmpMaterial: ComponentMaterial): void {
      let colorUniformLocation: WebGLUniformLocation = _shader.uniforms["u_vctColor"];
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
  }
}