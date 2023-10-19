namespace FudgeCore {
  export abstract class ShaderFlatSkin extends Shader {
    public static readonly iSubclass: number = Shader.registerSubclass(ShaderFlatSkin);

    public static define: string[] = [
      "LIGHT",
      "CAMERA",
      "FLAT",
      "SKIN"
    ];

    public static getCoat(): typeof Coat { return CoatRemissive; }

    public static getFragmentShaderSource(): string {
      return this.insertDefines(shaderSources["ShaderPhong.frag"], this.define);
    }
  }
}