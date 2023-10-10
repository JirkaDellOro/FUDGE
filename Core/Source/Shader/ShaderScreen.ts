namespace FudgeCore {
  export abstract class ShaderScreen extends Shader {
    public static readonly iSubclass: number = Shader.registerSubclass(ShaderScreen);

    public static define: string[] = [];

    public static getCoat(): typeof Coat { return CoatWebGlTextured; }

    public static getVertexShaderSource(): string {
      return this.insertDefines(shaderSources["ShaderScreen.vert"], this.define);
    }

    public static getFragmentShaderSource(): string {
      return this.insertDefines(shaderSources["ShaderScreen.frag"], this.define);
    }
  }
}