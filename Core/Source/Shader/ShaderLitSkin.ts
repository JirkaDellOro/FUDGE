namespace FudgeCore {
  export abstract class ShaderLitSkin extends Shader {
    public static readonly iSubclass: number = Shader.registerSubclass(ShaderLit);
    public static define: string[] = [
      "SKIN"
    ];
  }
}