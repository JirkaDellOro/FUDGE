namespace FudgeCore {
  @RenderInjectorShader.decorate
  export abstract class ShaderUniColor extends Shader {
    public static readonly iSubclass: number = Shader.registerSubclass(ShaderUniColor);

    public static vertexShaderSource: string = 
    `#version 300 es
/**
* Single color shading
* @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
*/
in vec3 a_position;
uniform mat4 u_projection;

void main() {   
    gl_Position = u_projection * vec4(a_position, 1.0);
}`;
    
    public static fragmentShaderSource: string = 
    `#version 300 es
/**
* Single color shading
* @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
*/
precision mediump float;

uniform vec4 u_color;
out vec4 frag;

void main() {
  // if (gl_FragCoord.x < 200.0)
  frag = u_color;
  //    frag = vec4(1.0,1.0,1.0,1.0);
}`;
    
    public static getVertexShaderSource(): string { return this.vertexShaderSource; }
    public static getFragmentShaderSource(): string { return this.fragmentShaderSource; }

    public static getCoat(): typeof Coat { return CoatColored; }
  }
}