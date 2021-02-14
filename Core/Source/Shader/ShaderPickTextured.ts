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
           float upperbyte = trunc(gl_FragCoord.z * 256.0) / 256.0;
           float lowerbyte = fract(gl_FragCoord.z * 256.0);
           
           vec4 color = u_color * texture(u_texture, v_textureUVs);
           float luminance = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
           int icolor = int(color.r * 255.0) << 24 + int(color.g * 255.0) << 16 + int(color.b * 255.0) << 8 + int(color.a * 255.0);

           float floatToInt = 0.5 * 4294967296.0;
          //  gl_FragCoord.z
          //  
          //  frag = vec4(upperbyte, lowerbyte, luminance, color.a);
          //  frag = ivec4(trunc(floatToInt * gl_FragCoord.z), icolor, trunc(floatToInt * u_texture.x), trunc(floatToInt * u_texture.y));
          //  frag = ivec4(trunc(floatToInt * gl_FragCoord.z), 0, 0, 0);
           frag = ivec4(floatToInt * gl_FragCoord.z, icolor, floatToInt * v_textureUVs.x, floatToInt * v_textureUVs.y);
        }`;
    }
  }
}