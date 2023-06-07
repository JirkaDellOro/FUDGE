namespace FudgeCore {
  export abstract class ShaderLitTexturedSkin extends Shader {
    public static readonly iSubclass: number = Shader.registerSubclass(ShaderLitTexturedSkin);

    public static define: string[] = [
      "TEXTURE",
      "SKIN"
    ];

    public static getCoat(): typeof Coat { return CoatTextured; }
  }
}