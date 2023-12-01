namespace FudgeCore {
  export abstract class ShaderGouraudTextured extends Shader {
    public static readonly iSubclass: number = Shader.registerSubclass(ShaderGouraudTextured);

    public static define: string[] = [
      "LIGHT",
      "TEXTURE"
    ];

    public static getCoat(): typeof Coat { return CoatRemissiveTextured; }
  }
}