namespace FudgeCore {

  /**
   * Gives WebGL Buffer the data from the {@link Coat}
   * @internal
   */
  export class RenderInjectorCoat extends RenderInjector {
    /**
     * Injects the functionality of this class into the constructor of the given {@link Coat}-subclass
     */
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
      this.texture.useRenderData(TEXTURE_LOCATION.COLOR.UNIT);
      crc3.uniform1i(_shader.uniforms[TEXTURE_LOCATION.COLOR.UNIFORM], TEXTURE_LOCATION.COLOR.INDEX);
      crc3.uniformMatrix3fv(_shader.uniforms["u_mtxPivot"], false, _cmpMaterial.mtxPivot.get());
    }
    protected static injectCoatRemissiveTextured(this: CoatRemissiveTextured, _shader: typeof Shader, _cmpMaterial: ComponentMaterial): void {
      RenderInjectorCoat.injectCoatRemissive.call(this, _shader, _cmpMaterial);

      let crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();
      this.texture.useRenderData(TEXTURE_LOCATION.COLOR.UNIT);
      crc3.uniform1i(_shader.uniforms[TEXTURE_LOCATION.COLOR.UNIFORM], TEXTURE_LOCATION.COLOR.INDEX);
      crc3.uniformMatrix3fv(_shader.uniforms["u_mtxPivot"], false, _cmpMaterial.mtxPivot.get());
    }
    protected static injectCoatRemissiveTexturedNormals(this: CoatRemissiveTexturedNormals, _shader: typeof Shader, _cmpMaterial: ComponentMaterial): void {
      RenderInjectorCoat.injectCoatRemissiveTextured.call(this, _shader, _cmpMaterial);

      let crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();
      this.normalMap.useRenderData(TEXTURE_LOCATION.NORMAL.UNIT);
      crc3.uniform1i(_shader.uniforms[TEXTURE_LOCATION.NORMAL.UNIFORM], TEXTURE_LOCATION.NORMAL.INDEX);
    }
  }
}