namespace FudgeCore {
  export abstract class ShaderBloom extends Shader {
    public static define: string[] = [];

    public static getVertexShaderSource(): string {
      return this.insertDefines(shaderSources["ShaderScreen.vert"], this.define);
    }

    public static getFragmentShaderSource(): string {
      return this.insertDefines(shaderSources["ShaderBloom.frag"], this.define);
    }
  }
}