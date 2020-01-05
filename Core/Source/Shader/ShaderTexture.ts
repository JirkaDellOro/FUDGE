namespace FudgeCore {
    /**
     * Textured shading
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export class ShaderTexture extends Shader {
        public static getCoat(): typeof Coat {
            return CoatTextured;
        }

        public static getVertexShaderSource(): string {
            return `#version 300 es

                in vec3 a_position;
                in vec2 a_textureUVs;
                uniform mat4 u_projection;
                uniform vec4 u_color;
                uniform mat3 u_pivot;
                out vec2 v_textureUVs;

                void main() {  
                    gl_Position = u_projection * vec4(a_position, 1.0);
                    // v_textureUVs = a_textureUVs;
                    v_textureUVs = vec2(u_pivot * vec3(a_textureUVs, 1.0)).xy;
                }`;
        }
        public static getFragmentShaderSource(): string {
            return `#version 300 es
                precision mediump float;
                
                in vec2 v_textureUVs;
                uniform sampler2D u_texture;
                out vec4 frag;
                
                void main() {
                    frag = texture(u_texture, v_textureUVs);
                    if (frag.a < 0.01)
                      discard;
            }`;
        }
    }
}