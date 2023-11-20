#version 300 es
/**
 * Downsamples a given texture
 * @authors Roland Heer, HFU, 2023 | Jirka Dell'Oro-Friedl, HFU, 2023
 */
precision mediump float;
precision highp int;

in vec2 v_vctTexture;
flat in vec2[9] v_vctOffsets;

uniform sampler2D u_tex0;
uniform float u_fThreshold;
uniform float u_flvl;

float gaussianKernel[9] = float[](0.045, 0.122, 0.045, 0.122, 0.332, 0.122, 0.045, 0.122, 0.045);

out vec4 vctFrag;

void main() {
  vctFrag = vec4(0.0);
  for (int i = 0; i < 9; i++) 
    vctFrag += vec4(texture(u_tex0, v_vctTexture + v_vctOffsets[i]) * gaussianKernel[i]);
  
  if (u_flvl < 1.0) {
    //None of the rendered values can exeed 1.0 therefor the bloom effect won't work if the threshold is >= 1.0
    if (u_fThreshold >= 1.0) 
      discard;

    vctFrag -= u_fThreshold;
    vctFrag /= 1.0 - u_fThreshold;
    float averageBrightness = (((vctFrag.r + vctFrag.g + vctFrag.b) / 3.0) * 0.2) + 0.8; //the effect is reduced by first setting it to a 0.0-0.2 range and then adding 0.8
    vctFrag *= averageBrightness * 2.0;
  }
  vctFrag *= 1.3;
}