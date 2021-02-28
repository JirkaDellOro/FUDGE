namespace FudgeCore {
  /**
   * Renders for Raycasting
   * @authors Jirka Dell'Oro-Friedl, HFU, 2019
   */
  export abstract class ShaderPickTextured extends Shader {

    public static getVertexShaderSource(): string {
      return `#version 300 es
         in vec3 a_position;       
         in vec2 a_textureUVs;
         uniform mat4 u_projection;
         uniform mat3 u_pivot;
        
         out vec2 v_textureUVs;
         
         void main() {   
             gl_Position = u_projection * vec4(a_position, 1.0);
             v_textureUVs = vec2(u_pivot * vec3(a_textureUVs, 1.0)).xy;
         }`;
    }
    public static getFragmentShaderSource(): string {
      return `#version 300 es
        precision mediump float;
        precision highp int;
        
        uniform int u_id;
        uniform vec2 u_size;
        in vec2 v_textureUVs;
        uniform vec4 u_color;
        uniform sampler2D u_texture;
        
        out ivec4 frag;
        
        void main() {
           float id = float(u_id); 
           float pixel = trunc(gl_FragCoord.x) + u_size.x * trunc(gl_FragCoord.y);

           if (pixel != id)
             discard;
           
           vec4 color = u_color * texture(u_texture, v_textureUVs);
           uint icolor = uint(color.r * 255.0) << 24 | uint(color.g * 255.0) << 16 | uint(color.b * 255.0) << 8 | uint(color.a * 255.0);
          
          frag = ivec4(floatBitsToInt(gl_FragCoord.z), icolor, floatBitsToInt(v_textureUVs.x), floatBitsToInt(v_textureUVs.y));
        }`;
    }
  }
}