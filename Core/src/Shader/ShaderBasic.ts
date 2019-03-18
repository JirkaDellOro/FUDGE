/// <reference path="Shader.ts"/>
namespace Fudge {
    /**
     * Represents a WebGL shaderprogram
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export class ShaderBasic extends Shader {

        public constructor() {
            super();
            this.load(this.loadVertexShaderSource(), this.loadFragmentShaderSource());
        }

        private loadVertexShaderSource(): string {
            return `#version 300 es
                    // an attribute is an input (in) to a vertex shader.
                    // It will receive data from a buffer
                    in vec4 a_position;
                    in vec4 a_color;
                
                    // The Matrix to transform the positions by.
                    uniform mat4 u_matrix;
                
                    // Varying color in the fragmentshader.
                    out vec4 v_color;
                
                    // all shaders have a main function.
                    void main() {  
                        // Multiply all positions by the matrix.   
                        vec4 position = u_matrix * a_position;
                        
                        gl_Position = u_matrix * a_position;
                
                        // Pass color to fragmentshader.
                        v_color = a_color;
                    }`;
        }
        private loadFragmentShaderSource(): string {
            return `#version 300 es
                    // fragment shaders don't have a default precision so we need to pick one. mediump is a good default. It means "medium precision"
                    precision mediump float;
                    
                    // Color passed from vertexshader.
                    in vec4 v_color;
                
                    // we need to declare an output for the fragment shader
                    out vec4 outColor;
                    
                    void main() {
                       outColor = v_color;
                    }`;
        }
    }
}