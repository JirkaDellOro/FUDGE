namespace Fudge {
    /**
     * Single color shading
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export class ShaderUniColor extends Shader {
        public static getCoat(): typeof Coat {
            return CoatColored;
        }

        public static getVertexShaderSource(): string {
            return `#version 300 es
                    in vec4 a_position;
                    
                    uniform mat4 u_matrix;
                    
                    void main() {   
                        vec4 position = u_matrix * a_position;
                        gl_Position = u_matrix * a_position;
                    }`;
        }
        public static getFragmentShaderSource(): string {
            return `#version 300 es
                    precision mediump float;
                    
                    uniform vec4 u_color;
                    
                    out vec4 outColor;
                    
                    void main() {
                       outColor = u_color;
                    }`;
        }
    }
}