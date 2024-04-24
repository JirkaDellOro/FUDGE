namespace FudgeCore {
  export abstract class ShaderGizmo extends Shader {
    public static define: string[] = [];

    public static getVertexShaderSource(): string {
      return this.insertDefines(shaderSources["ShaderGizmo.vert"], this.define);
    }

    public static getFragmentShaderSource(): string {
      return this.insertDefines(shaderSources["ShaderGizmo.frag"], this.define);
    }
  }
}