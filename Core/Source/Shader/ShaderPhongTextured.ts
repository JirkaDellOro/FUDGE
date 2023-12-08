namespace FudgeCore {
  export abstract class ShaderPhongTextured extends Shader {
    public static readonly iSubclass: number = Shader.registerSubclass(ShaderPhongTextured);

    public static define: string[] = [
      "PHONG",
      "TEXTURE"
    ];

    public static getCoat(): typeof Coat { return CoatRemissiveTextured; }
  }
}