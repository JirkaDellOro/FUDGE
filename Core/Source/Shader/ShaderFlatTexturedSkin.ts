namespace FudgeCore {
  export abstract class ShaderFlatTexturedSkin extends Shader {
    public static readonly iSubclass: number = Shader.registerSubclass(ShaderFlatTexturedSkin);

    public static define: string[] = [
      "LIGHT",
      "CAMERA",
      "FLAT",
      "TEXTURE",
      "SKIN"
    ];

    public static getCoat(): typeof Coat { return CoatRemissiveTextured; }

    public static getFragmentShaderSource(): string {
      return this.insertDefines(shaderSources["ShaderPhong.frag"], this.define);
    }
  }
}