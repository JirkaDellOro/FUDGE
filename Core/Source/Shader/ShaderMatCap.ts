namespace FudgeCore {
  export abstract class ShaderMatCap extends Shader {
    public static readonly iSubclass: number = Shader.registerSubclass(ShaderMatCap);

    public static define: string[] = [
      "MATCAP"
    ];

    public static getCoat(): typeof Coat { return CoatTextured; }
  }
}