#version 300 es
/**
 * Upsamples a given texture onto the current FBOs texture and applies a small gaussian blur
 * @authors Roland Heer, HFU, 2023 | Jirka Dell'Oro-Friedl, HFU, 2023
 */
precision mediump float;
precision highp int;

in vec2 v_vctTexture;
flat in vec2[9] v_vctOffsets;
uniform sampler2D u_tex0;
uniform sampler2D u_tex1;

float gaussianKernel[9] = float[](0.045, 0.122, 0.045, 0.122, 0.332, 0.122, 0.045, 0.122, 0.045);

out vec4 vctFrag;

void main() {
  vec4 tex1 = vec4(0.0);
  for(int i = 0; i < 9; i++) {
    tex1 += vec4(texture(u_tex0, v_vctTexture + v_vctOffsets[i]) * gaussianKernel[i]);
  }
  vec4 tex2 = texture(u_tex1, v_vctTexture);
  vctFrag = tex2 + tex1;
}