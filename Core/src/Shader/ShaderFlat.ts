namespace Fudge {
    /**
     * Single color shading
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export class ShaderFlat extends Shader {
        public static getCoat(): typeof Coat {
            return CoatColored;
        }

        public static getVertexShaderSource(): string {
            return `#version 300 es

                    in vec3 a_position;
                    in vec3 a_normal;
                    uniform mat4 u_world;
                    uniform mat4 u_projection;
                    flat out vec4 v_color;
                    
                    void main() {   
                        gl_Position = u_projection * vec4(a_position, 1.0);
                        vec3 normal = mat3(u_world) * a_normal;

                        vec3 light = vec3(0,1,0);
                        float illumination = dot(normal, light);
                        v_color = illumination * vec4(1,1,1,1);
                    }`;
        }
        public static getFragmentShaderSource(): string {
            return `#version 300 es
                    precision mediump float;

                    flat in vec4 v_color;
                    out vec4 frag;
                    
                    void main() {
                        frag = v_color;
                    }`;
        }
    }
}