namespace Fudge {
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
                in vec4 a_position;
                in vec2 a_textureCoordinate;

                uniform mat4 u_matrix;
                uniform vec4 u_color;
                
                // out vec4 v_color;
                out vec2 v_textureCoordinate;

                void main() {  

                vec4 position = u_matrix * a_position;
                    
                    gl_Position = u_matrix * a_position;
                    // v_color = u_color;
                    v_textureCoordinate = a_textureCoordinate;
            }`;
        }
        public static getFragmentShaderSource(): string {
            return `#version 300 es
                precision mediump float;
                
                in vec2 v_textureCoordinate;
            
                uniform sampler2D u_texture;

                out vec4 outColor;
                
                void main() {
                    outColor = texture(u_texture, v_textureCoordinate);// * v_color;
            }`;
        }
    }
}