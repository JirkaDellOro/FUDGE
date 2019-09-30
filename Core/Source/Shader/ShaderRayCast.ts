namespace FudgeCore {
    /**
     * Renders for Raycasting
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export class ShaderRayCast extends Shader {
        public static getVertexShaderSource(): string {
            return `#version 300 es

                    in vec3 a_position;
                    uniform mat4 u_projection;
                    
                    void main() {   
                        gl_Position = u_projection * vec4(a_position, 1.0);
                    }`;
        }
        public static getFragmentShaderSource(): string {
            return `#version 300 es
                    precision mediump float;
                    precision highp int;
                    
                    uniform int u_id;
                    out vec4 frag;
                    
                    void main() {
                       float id = float(u_id);// / 10.0;
                       frag = vec4(id,id,id,id);
                    }`;
        }
    }
}