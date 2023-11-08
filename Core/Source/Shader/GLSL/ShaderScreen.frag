#version 300 es
/**
* Composites all Post-FX on to the main-render and renders it to the main Renderbuffer
* @authors Roland Heer, HFU, 2023
*/
precision mediump float;
precision highp int;

in vec2 v_vctTexture;
uniform sampler2D u_mainTexture;

uniform float u_ao;
uniform sampler2D u_aoTexture;
uniform vec4 u_vctAOColor;

uniform float u_bloom;
uniform sampler2D u_bloomTexture;
uniform float u_bloomIntensity;
uniform float u_highlightDesaturation;

flat in vec2[25] v_vctOffsets;
float gaussianKernel[25] = float[]( 0.00366, 0.01465, 0.02564, 0.01465, 0.00366,
                                    0.01465, 0.05860, 0.09523, 0.05860, 0.01465, 
                                    0.02564, 0.09523, 0.15018, 0.09523, 0.02564, 
                                    0.01465, 0.05860, 0.09523, 0.05860, 0.01465,
                                    0.00366, 0.01465, 0.02564, 0.01465, 0.00366);

out vec4 vctFrag;

void main() {
  vec4 mainTex = texture(u_mainTexture, v_vctTexture);
  vec4 vctTempFrag = mainTex;
  if(u_ao > 0.5f) {
    vec4 aoTex = vec4(0.0f);
    for(int i = 0; i < 25; i++) {
        aoTex += vec4(texture(u_aoTexture, v_vctTexture + v_vctOffsets[i]) * gaussianKernel[i]);
    }
    aoTex = mix(vec4(u_vctAOColor.rgb, 1.0f), vec4(1.0f), aoTex.r);
    vctTempFrag = mix(vctTempFrag, vctTempFrag * aoTex, u_vctAOColor.a);
  }
  if(u_bloom > 0.5f) {
    float intensity = max(u_bloomIntensity, 0.0f);
    vec4 bloomTex = texture(u_bloomTexture, v_vctTexture);
    vctTempFrag += (bloomTex * intensity);

    float factor = min(max(u_highlightDesaturation, 0.0f), 1.0f);
    float r = max(vctTempFrag.r - 1.0f, 0.0f) * factor;
    float g = max(vctTempFrag.r - 1.0f, 0.0f) * factor;
    float b = max(vctTempFrag.r - 1.0f, 0.0f) * factor;

    vctTempFrag.r += g + b;
    vctTempFrag.g += r + b;
    vctTempFrag.b += r + g;
  }

  vctFrag = vctTempFrag;
}
