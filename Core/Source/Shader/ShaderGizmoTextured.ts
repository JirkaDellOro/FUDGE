namespace FudgeCore {
  export abstract class ShaderGizmoTextured extends Shader {
    public static define: string[] = ["TEXTURE"];

    public static getVertexShaderSource(): string {
      return this.insertDefines(shaderSources["ShaderGizmo.vert"], this.define);
    }

    public static getFragmentShaderSource(): string {
      return this.insertDefines(shaderSources["ShaderGizmo.frag"], this.define);
    }
  }
}