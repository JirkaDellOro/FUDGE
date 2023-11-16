#version 300 es
/**
 * Downsamples a given texture to the current FBOs texture
 * @authors Roland Heer, HFU, 2023 | Jirka Dell'Oro-Friedl, HFU, 2023
 */
precision mediump float;
precision highp int;

in vec2 v_vctTexture;
flat in vec2[9] v_vctOffsets;

uniform sampler2D u_tex0;
uniform float u_threshold;
uniform float u_lvl;

float gaussianKernel[9] = float[](0.045, 0.122, 0.045, 0.122, 0.332, 0.122, 0.045, 0.122, 0.045);

out vec4 vctFrag;

void main() {
  vec4 tex1 = vec4(0.0);
  for(int i = 0; i < 9; i++) {
    tex1 += vec4(texture(u_tex0, v_vctTexture + v_vctOffsets[i]) * gaussianKernel[i]);
  }
  if(u_lvl < 1.0) {
    float threshold = min(max(u_threshold, 0.0), 0.999999999);     //None of the rendered values can exeed 1.0 therefor the bloom effect won't work if the threshold is >= 1.0
    tex1 -= threshold;
    tex1 /= 1.0 - threshold;
    float averageBrightness = (((tex1.r + tex1.g + tex1.b) / 3.0) * 0.2) + 0.8; //the effect is reduced by first setting it to a 0.0-0.2 range and then adding 0.8
    tex1 = tex1 * averageBrightness * 2.0;
  }
  tex1 *= 1.3;
  vctFrag = tex1;
}