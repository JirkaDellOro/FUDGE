namespace FudgeCore {
  export abstract class ShaderGouraud extends Shader {
    public static readonly iSubclass: number = Shader.registerSubclass(ShaderGouraud);

    public static define: string[] = [
      "LIGHT"
    ];

    public static getCoat(): typeof Coat { return CoatRemissive; }
  }
}