namespace FudgeCore {
  export abstract class ShaderDownsample extends Shader {
    public static readonly iSubclass: number = Shader.registerSubclass(ShaderDownsample);

    public static define: string[] = ["SAMPLE"];

    public static getCoat(): typeof Coat { return CoatWebGlTextured; }

    public static getVertexShaderSource(): string {
      return this.insertDefines(shaderSources["ShaderScreen.vert"], this.define);
    }

    public static getFragmentShaderSource(): string {
      return this.insertDefines(shaderSources["ShaderDownsample.frag"], this.define);
    }
  }
}