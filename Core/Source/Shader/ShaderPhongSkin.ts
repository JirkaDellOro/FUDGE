namespace FudgeCore {
  export abstract class ShaderPhongSkin extends Shader {
    public static readonly iSubclass: number = Shader.registerSubclass(ShaderPhongSkin);

    public static define: string[] = [
      "LIGHT",
      "PHONG",
      "SKIN"
    ];

    public static getCoat(): typeof Coat { return CoatRemissive; }
  }
}