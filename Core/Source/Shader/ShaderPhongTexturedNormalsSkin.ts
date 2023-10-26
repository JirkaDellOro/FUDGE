namespace FudgeCore {
  export abstract class ShaderPhongTexturedNormalsSkin extends Shader {
    public static readonly iSubclass: number = Shader.registerSubclass(ShaderPhongTexturedNormalsSkin);

    public static define: string[] = [
      "LIGHT",
      "CAMERA",
      "PHONG",
      "TEXTURE",
      "NORMALMAP",
      "SKIN"
    ];

    public static getCoat(): typeof Coat { return CoatRemissiveTexturedNormals; }

    public static getFragmentShaderSource(): string {
      return this.insertDefines(shaderSources["ShaderPhong.frag"], this.define);
    }
  }
}