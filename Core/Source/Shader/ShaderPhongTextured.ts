namespace FudgeCore {
  export abstract class ShaderPhongTextured extends Shader {
    public static readonly iSubclass: number = Shader.registerSubclass(ShaderPhongTextured);

    public static define: string[] = [
      "LIGHT",
      "CAMERA",
      "PHONG",
      "TEXTURE",
      "NORMALMAP"
    ];

    public static getCoat(): typeof Coat { return CoatRemissiveTexturedNormals; }

    public static getFragmentShaderSource(): string {
      return this.insertDefines(shaderSources["ShaderPhong.frag"], this.define);
    }
  }
}