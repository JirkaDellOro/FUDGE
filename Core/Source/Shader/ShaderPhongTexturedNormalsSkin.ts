namespace FudgeCore {
  export abstract class ShaderPhongTexturedNormalsSkin extends Shader {
    public static readonly iSubclass: number = Shader.registerSubclass(ShaderPhongTexturedNormalsSkin);

    public static define: string[] = [
      "PHONG",
      "TEXTURE",
      "NORMALMAP",
      "SKIN"
    ];

    public static getCoat(): typeof Coat { return CoatRemissiveTexturedNormals; }
  }
}