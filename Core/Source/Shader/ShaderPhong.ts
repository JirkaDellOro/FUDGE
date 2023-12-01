namespace FudgeCore {
  export abstract class ShaderPhong extends Shader {
    public static readonly iSubclass: number = Shader.registerSubclass(ShaderPhong);

    public static define: string[] = [
      "LIGHT",
      "PHONG"
    ];

    public static getCoat(): typeof Coat { return CoatRemissive; }
  }
}