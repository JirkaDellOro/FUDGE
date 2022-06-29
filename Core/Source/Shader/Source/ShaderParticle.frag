#version 300 es
/**
* TODO: write this
* @authors Jirka Dell'Oro-Friedl, HFU, 2021 | Jonas Plotzky, HFU, 2022
*/

precision mediump float;

uniform vec4 u_vctColor;
in vec4 v_vctColor;

in vec2 v_vctTexture;
uniform sampler2D u_texture;

out vec4 vctFrag;

void main() {
  // TEXTURE: multiply with texel color
  vec4 vctColorTexture = texture(u_texture, v_vctTexture);
  vctFrag = u_vctColor * v_vctColor * vctColorTexture;

  // discard pixel alltogether when transparent: don't show in Z-Buffer
  if(vctFrag.a < 0.01)
    discard;
}