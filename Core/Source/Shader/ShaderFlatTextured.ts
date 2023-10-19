namespace FudgeCore {
  export abstract class ShaderFlatTextured extends Shader {
    public static readonly iSubclass: number = Shader.registerSubclass(ShaderFlatTextured);

    public static define: string[] = [
      "LIGHT",
      "CAMERA",
      "FLAT",
      "TEXTURE"
    ];

    public static getCoat(): typeof Coat { return CoatRemissiveTextured; }

    public static getFragmentShaderSource(): string {
      return this.insertDefines(shaderSources["ShaderPhong.frag"], this.define);
    }
  }
}