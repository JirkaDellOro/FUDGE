namespace FudgeCore {
  /**
   * Single color shading
   * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
   */
  // @RenderInjectorShader.decorate
  export abstract class ShaderFlat extends Shader {
    public static readonly iSubclass: number = Shader.registerSubclass(ShaderFlat);

    public static getCoat(): typeof Coat {
      return CoatColored;
    }

    public static getVertexShaderSource(): string {
      return `#version 300 es
        struct LightAmbient {
            vec4 color;
        };
        struct LightDirectional {
            vec4 color;
            vec3 direction;
        };

        const uint MAX_LIGHTS_DIRECTIONAL = 10u;

        in vec3 a_position;
        in vec3 a_normal;
        uniform mat4 u_world;
        uniform mat4 u_projection;

        uniform LightAmbient u_ambient;
        uniform uint u_nLightsDirectional;
        uniform LightDirectional u_directional[MAX_LIGHTS_DIRECTIONAL];
        flat out vec4 v_color;
        
        void main() {   
            gl_Position = u_projection * vec4(a_position, 1.0);
            vec3 normal = normalize(transpose(inverse(mat3(u_world))) * a_normal);
            // vec3 normal = normalize(vec3(u_world * vec4(a_normal, 1.0)));

            v_color = u_ambient.color;
            for (uint i = 0u; i < u_nLightsDirectional; i++) {
                float illumination = -dot(normal, u_directional[i].direction);
                if (illumination > 0.0f)
                    v_color += illumination * u_directional[i].color; // vec4(1,1,1,1); // 
            }
            v_color.a = 1.0;
        }`;
    }
    public static getFragmentShaderSource(): string {
      return `#version 300 es
        precision mediump float;

        uniform vec4 u_color;
        flat in vec4 v_color;
        out vec4 frag;
        
        void main() {
            frag = u_color * v_color;
        }`;
    }
  }
}