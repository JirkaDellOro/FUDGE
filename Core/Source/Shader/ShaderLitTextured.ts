namespace FudgeCore {
  export abstract class ShaderLitTextured extends Shader {
    public static readonly iSubclass: number = Shader.registerSubclass(ShaderLitTextured);

    public static define: string[] = [
      "TEXTURE"
    ];

    public static getCoat(): typeof Coat { return CoatTextured; }
  }
}