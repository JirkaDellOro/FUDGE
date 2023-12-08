namespace FudgeCore {
  export abstract class ShaderGouraudTexturedSkin extends Shader {
    public static readonly iSubclass: number = Shader.registerSubclass(ShaderGouraudTexturedSkin);

    public static define: string[] = [
      "GOURAUD",
      "TEXTURE",
      "SKIN"
    ];

    public static getCoat(): typeof Coat { return CoatRemissiveTextured; }
  }
}