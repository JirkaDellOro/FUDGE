namespace FudgeCore {
  export abstract class ShaderFlat extends Shader {
    public static readonly iSubclass: number = Shader.registerSubclass(ShaderFlat);

    public static define: string[] = [
      "LIGHT",
      "CAMERA",
      "FLAT"
    ];

    public static getCoat(): typeof Coat { return CoatRemissive; }

    public static getFragmentShaderSource(): string {
      return this.insertDefines(shaderSources["ShaderPhong.frag"], this.define);
    }
  }
}