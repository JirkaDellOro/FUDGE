namespace FudgeCore {
  export abstract class ShaderFlatTexturedSkin extends Shader {
    public static readonly iSubclass: number = Shader.registerSubclass(ShaderFlatTexturedSkin);

    public static define: string[] = [
      "FLAT",
      "TEXTURE",
      "SKIN"
    ];

    public static getCoat(): typeof Coat { return CoatRemissiveTextured; }
  }
}