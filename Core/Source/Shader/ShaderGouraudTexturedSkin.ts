namespace FudgeCore {
  export abstract class ShaderGouraudTexturedSkin extends Shader {
    public static readonly iSubclass: number = Shader.registerSubclass(ShaderGouraudTextured);

    public static define: string[] = [
      "LIGHT",
      "TEXTURE",
      "CAMERA",
      "SKIN"
    ];

    public static getCoat(): typeof Coat { return CoatRemissiveTextured; }
  }
}