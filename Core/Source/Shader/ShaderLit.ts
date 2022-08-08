namespace FudgeCore {
  export abstract class ShaderLit extends Shader {
    public static readonly iSubclass: number = Shader.registerSubclass(ShaderLit);
    public static define: string[] = [];
  }
}