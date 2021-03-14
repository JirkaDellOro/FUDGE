namespace FudgeCore {
  /**
   * Textured shading
   * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
   */
  export abstract class ShaderTexture extends Shader {
    public static readonly iSubclass: number = Shader.registerSubclass(ShaderTexture);

    public static getCoat(): typeof Coat {
      return CoatTextured;
    }

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
        
        in vec2 v_textureUVs;
        uniform vec4 u_color;
        uniform sampler2D u_texture;
        // uniform vec4 u_colorBackground; // maybe a material background color can shine through... but where and with which intensity?
        out vec4 frag;
        
        void main() {
            vec4 colorTexture = texture(u_texture, v_textureUVs);
            frag = u_color * colorTexture;
            //frag = vec4(colorTexture.r * 1.0, colorTexture.g * 0.4, colorTexture.b * 0.1, colorTexture.a * 1.5);//u_color;
            //frag = colorTexture;
            if (frag.a < 0.01)
              discard;
        }`;
    }
  }
}