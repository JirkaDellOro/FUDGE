namespace FudgeCore {
  export abstract class ShaderPhong extends Shader {
    public static readonly iSubclass: number = Shader.registerSubclass(ShaderPhong);

    public static define: string[] = [
      "LIGHT",
      "CAMERA",
      "PHONG"
    ];

    public static getCoat(): typeof Coat { return CoatRemissive; }

    public static getFragmentShaderSource(): string {
      return this.insertDefines(shaderSources["ShaderPhong.frag"], this.define);
    }
  }
}