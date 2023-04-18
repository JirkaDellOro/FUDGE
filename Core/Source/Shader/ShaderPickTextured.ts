namespace FudgeCore {
  export abstract class ShaderPickTextured extends Shader {
    public static define: string[] = [];

    public static getVertexShaderSource(): string {
      return this.insertDefines(shaderSources["ShaderPickTextured.vert"], this.define);
    }

    public static getFragmentShaderSource(): string {
      return this.insertDefines(shaderSources["ShaderPickTextured.frag"], this.define);
    }
  }
}