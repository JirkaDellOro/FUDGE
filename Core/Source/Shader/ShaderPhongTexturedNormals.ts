namespace FudgeCore {
  export abstract class ShaderPhongTexturedNormals extends Shader {
    public static readonly iSubclass: number = Shader.registerSubclass(ShaderPhongTexturedNormals);

    public static define: string[] = [
      "PHONG",
      "TEXTURE",
      "NORMALMAP"
    ];

    public static getCoat(): typeof Coat { return CoatRemissiveTexturedNormals; }
  }
}