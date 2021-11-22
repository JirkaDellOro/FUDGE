#version 300 es
precision mediump float;

uniform vec4 u_color;
flat in vec4 v_color;
in vec2 v_textureUVs;
uniform sampler2D u_texture;
out vec4 frag;

void main() {
  vec4 colorTexture = texture(u_texture, v_textureUVs);
  frag = u_color * v_color * colorTexture;
  if(frag.a < 0.01)
    discard;
}