namespace FudgeCore {
  export abstract class ShaderFlatSkin extends Shader {
    public static readonly iSubclass: number = Shader.registerSubclass(ShaderFlatSkin);

    public static define: string[] = [
      "FLAT",
      "SKIN"
    ];

    public static getCoat(): typeof Coat { return CoatRemissive; }
  }
}