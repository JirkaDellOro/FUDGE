namespace FudgeCore {
  export abstract class ShaderPhongTexturedSkin extends Shader {
    public static readonly iSubclass: number = Shader.registerSubclass(ShaderPhongTexturedSkin);

    public static define: string[] = [
      "LIGHT",
      "CAMERA",
      "PHONG",
      "TEXTURE",
      "SKIN"
    ];

    public static getCoat(): typeof Coat { return CoatRemissiveTextured; }
  }
}