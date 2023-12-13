namespace FudgeCore {
  export abstract class ShaderAmbientOcclusion extends Shader {
    public static readonly iSubclass: number = Shader.registerSubclass(ShaderAmbientOcclusion);

    public static define: string[] = [];

    public static getVertexShaderSource(): string {
      return this.insertDefines(shaderSources["ShaderScreen.vert"], this.define);
    }

    public static getFragmentShaderSource(): string {
      return this.insertDefines(shaderSources["ShaderAmbientOcclusion.frag"], this.define);
    }
  }
}