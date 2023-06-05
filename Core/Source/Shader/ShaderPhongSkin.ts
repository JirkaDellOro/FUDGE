namespace FudgeCore {
  export abstract class ShaderPhongSkin extends Shader {
    public static readonly iSubclass: number = Shader.registerSubclass(ShaderPhongSkin);

    public static define: string[] = [
      "LIGHT",
      "CAMERA",
      "PHONG",
      "SKIN"
    ];

    public static getCoat(): typeof Coat { return CoatRemissive; }

    public static getFragmentShaderSource(): string {
      return this.insertDefines(shaderSources["ShaderPhong.frag"], this.define);
    }
  }
}