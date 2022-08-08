namespace FudgeCore {
  export abstract class ShaderFlat extends Shader {
    public static readonly iSubclass: number = Shader.registerSubclass(ShaderFlat);

    public static define: string[] = [
      "LIGHT",
      "FLAT",
      "CAMERA"
    ];

    public static getCoat(): typeof Coat { return CoatRemissive; }
  }
}