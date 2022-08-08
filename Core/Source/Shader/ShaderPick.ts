namespace FudgeCore {
  export abstract class ShaderPick extends Shader {
    public static define: string[] = [];
    
    public static getVertexShaderSource(): string {
      return this.insertDefines(shaderSources["ShaderPick.vert"], this.define);
    }

    public static getFragmentShaderSource(): string {
      return this.insertDefines(shaderSources["ShaderPick.frag"], this.define);
    }
  }
}