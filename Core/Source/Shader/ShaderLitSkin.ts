namespace FudgeCore {
  export abstract class ShaderLitSkin extends Shader {
    public static readonly iSubclass: number = Shader.registerSubclass(ShaderLitSkin);
    public static define: string[] = [
      "SKIN"
    ];
  }
}