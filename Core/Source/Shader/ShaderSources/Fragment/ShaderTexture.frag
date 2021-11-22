#version 300 es
/**
* Textured shading
* @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
*/
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
}