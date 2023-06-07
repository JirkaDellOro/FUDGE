namespace FudgeCore {
  export abstract class ShaderPhongTextured extends Shader {
    public static readonly iSubclass: number = Shader.registerSubclass(ShaderPhongTextured);

    public static define: string[] = [
      "LIGHT",
      "CAMERA",
      "PHONG",
      "TEXTURE"
    ];

    public static getCoat(): typeof Coat { return CoatRemissiveTextured; }

    public static getFragmentShaderSource(): string {
      return this.insertDefines(shaderSources["ShaderPhong.frag"], this.define);
    }
  }
}