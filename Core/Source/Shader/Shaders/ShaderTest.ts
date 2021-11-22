//Flat shader built from shader modules
namespace FudgeCore {

    @RenderInjectorShader.decorate
    export abstract class ShaderTest extends Shader {
      public static readonly iSubclass: number = Shader.registerSubclass(ShaderTest);
  
      public static vertexShaderSource: string = 
        SHADER_MODULE.HEAD_VERT +
        SHADER_MODULE.LIGHTS +
        SHADER_MODULE.NORMAL_FACE +
        SHADER_MODULE.MATRIX_WORLD + 
        SHADER_MODULE.MATRIX_PROJECTION +
        SHADER_MODULE.COLOR_OUT_FLAT +
        SHADER_MODULE.FLAT_MAIN_VERT;
      
      public static fragmentShaderSource: string = 
        SHADER_MODULE.HEAD_FRAG +
        SHADER_MODULE.COLOR_IN_FLAT +
        SHADER_MODULE.COLOR_U +
        SHADER_MODULE.FRAG_OUT +
        SHADER_MODULE.BASIC_MAIN_FRAG;
    }
}