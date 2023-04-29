namespace FudgeCore {

  //gives WebGL Buffer the data from the {@link Coat}
  export class RenderInjectorCoat extends RenderInjector {
    public static decorate(_constructor: Function): void {
      RenderInjector.inject(_constructor, RenderInjectorCoat);
    }

    protected static injectCoatColored(this: CoatColored, _shader: typeof Shader, _cmpMaterial: ComponentMaterial): void {
      let uniform: WebGLUniformLocation = _shader.uniforms["u_vctColor"];
      let color: Color = Color.MULTIPLY(this.color, _cmpMaterial.clrPrimary);
      RenderWebGL.getRenderingContext().uniform4fv(uniform, color.getArray());
    }

    protected static injectCoatRemissive(this: CoatRemissive, _shader: typeof Shader, _cmpMaterial: ComponentMaterial): void {
      RenderInjectorCoat.injectCoatColored.call(this, _shader, _cmpMaterial);
      let uniform: WebGLUniformLocation;
      uniform = _shader.uniforms["u_fDiffuse"];
      RenderWebGL.getRenderingContext().uniform1f(uniform, this.diffuse);
      uniform = _shader.uniforms["u_fMetallic"];
      RenderWebGL.getRenderingContext().uniform1f(uniform, this.metallic);
      uniform = _shader.uniforms["u_fSpecular"];
      RenderWebGL.getRenderingContext().uniform1f(uniform, this.specular);
      uniform = _shader.uniforms["u_fIntensity"];
      RenderWebGL.getRenderingContext().uniform1f(uniform, this.intensity);
    }

    protected static injectCoatTextured(this: CoatTextured, _shader: typeof Shader, _cmpMaterial: ComponentMaterial): void {
      RenderInjectorCoat.injectCoatColored.call(this, _shader, _cmpMaterial);

      let crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();
      this.texture.useRenderData();
      crc3.uniform1i(_shader.uniforms["u_texture"], 0);
      crc3.uniformMatrix3fv(_shader.uniforms["u_mtxPivot"], false, _cmpMaterial.mtxPivot.get());
    }
    protected static injectCoatRemissiveTextured(this: CoatRemissiveTextured, _shader: typeof Shader, _cmpMaterial: ComponentMaterial): void {
      RenderInjectorCoat.injectCoatRemissive.call(this, _shader, _cmpMaterial);

      let crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();
      this.texture.useRenderData(0);
      crc3.uniform1i(_shader.uniforms["u_texture"], 0);
      crc3.uniformMatrix3fv(_shader.uniforms["u_mtxPivot"], false, _cmpMaterial.mtxPivot.get());
      
      //Since the texture slot 0 is reserved for albedo textures, and the texture slot 1 is already utilized by the particle System, the texture slot 2 is used for normal maps
      this.normalMap.useRenderData(2);
      crc3.uniform1i(_shader.uniforms["u_normalMap"], 2);
      crc3.uniformMatrix3fv(_shader.uniforms["u_mtxPivotN"], false, _cmpMaterial.mtxPivot.get());
    }
  }
}