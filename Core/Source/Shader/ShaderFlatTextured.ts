namespace FudgeCore {
  export abstract class ShaderFlatTextured extends Shader {
    public static readonly iSubclass: number = Shader.registerSubclass(ShaderFlatTextured);

    public static define: string[] = [
      "LIGHT",
      "FLAT",
      "TEXTURE",
      "CAMERA"
    ];

    public static getCoat(): typeof Coat { return CoatRemissiveTextured; }
  }
}