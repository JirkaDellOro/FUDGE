namespace FudgeCore {
  @RenderInjectorShader.decorate
  export abstract class ShaderPick extends Shader {
    public static readonly iSubclass: number = Shader.registerSubclass(ShaderPick);

    public static vertexShaderSource: string = 
    `#version 300 es
/**
* Renders for Raycasting
* @authors Jirka Dell'Oro-Friedl, HFU, 2019
*/
in vec3 a_position;       
uniform mat4 u_projection;

void main() {   
    gl_Position = u_projection * vec4(a_position, 1.0);
}`;
    
    public static fragmentShaderSource: string = 
    `#version 300 es
/**
* Renders for Raycasting
* @authors Jirka Dell'Oro-Friedl, HFU, 2019
*/
precision mediump float;
precision highp int;

uniform int u_id;
uniform vec2 u_size;
uniform vec4 u_color;
out ivec4 frag;

void main() {
    float id = float(u_id); 
    float pixel = trunc(gl_FragCoord.x) + u_size.x * trunc(gl_FragCoord.y);

    if (pixel != id)
      discard;

    uint icolor = uint(u_color.r * 255.0) << 24 | uint(u_color.g * 255.0) << 16 | uint(u_color.b * 255.0) << 8 | uint(u_color.a * 255.0);
                
    frag = ivec4(floatBitsToInt(gl_FragCoord.z), icolor, 0, 0);
}`;
    
    public static getVertexShaderSource(): string { return this.vertexShaderSource; }
    public static getFragmentShaderSource(): string { return this.fragmentShaderSource; }

    public static getCoat(): typeof Coat { return CoatColored; }
  }
}