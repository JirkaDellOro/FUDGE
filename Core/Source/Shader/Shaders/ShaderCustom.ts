namespace FudgeCore {
    @RenderInjectorShader.decorate
    export abstract class ShaderCustom extends Shader {
      public static readonly iSubclass: number = Shader.registerSubclass(ShaderCustom);
  
      public static vertexShaderSource: string = 
        SHADER_MODULE.HEAD_VERT +
        SHADER_MODULE.LIGHTS +
        SHADER_MODULE.NORMAL_FACE +
        `uniform mat4 u_world;` + 
        SHADER_MODULE.MATRIX_PROJECTION +
        SHADER_MODULE.COLOR_OUT_FLAT +
        `void main() {
            gl_Position = u_projection * vec4(a_position, 1.0);
            vec3 normal = normalize(mat3(u_world) * a_normalFace);
            v_color = u_ambient.color;
            for(uint i = 0u; i < u_nLightsDirectional; i++) {
                float illumination = -dot(normal, u_directional[i].direction);
                if(illumination > 0.0f)
                    v_color += illumination * u_directional[i].color;
            }
            v_color.a = 1.0;
        }`;
      
      public static fragmentShaderSource: string = 
        SHADER_MODULE.HEAD_FRAG +
        SHADER_MODULE.COLOR_IN_FLAT +
        SHADER_MODULE.COLOR_U +
        SHADER_MODULE.FRAG_OUT +
        `void main() {
          frag = u_color * v_color;
        }`;
    }
  }