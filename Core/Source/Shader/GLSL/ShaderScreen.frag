#version 300 es
/**
* Composites all Post-FX on to the main-render and renders it to the main Renderbuffer
* @authors Roland Heer, HFU, 2023
*/
precision mediump float;
precision highp int;

in vec2 v_vctTexture;
uniform sampler2D u_colorTexture;

uniform float u_ao;
uniform sampler2D u_occlusionTexture;
uniform vec4 u_vctAOColor;

uniform float u_bloom;
uniform sampler2D u_bloomTexture;
uniform float u_bloomIntensity;
uniform float u_highlightDesaturation;

out vec4 vctFrag;

void main() {
  ivec2 vctFragCoord = ivec2(gl_FragCoord.xy);
  vctFrag = texelFetch(u_colorTexture, vctFragCoord, 0);

  if (u_ao > 0.5f) 
    vctFrag.rgb = clamp(vctFrag.rgb - texelFetch(u_occlusionTexture, vctFragCoord, 0).r, 0.0, 1.0);
  
  if (u_bloom > 0.5f) {
    float intensity = max(u_bloomIntensity, 0.0f);
    vctFrag += (texture(u_bloomTexture, v_vctTexture) * intensity);

    float factor = min(max(u_highlightDesaturation, 0.0f), 1.0f);
    float r = max(vctFrag.r - 1.0f, 0.0f) * factor;
    float g = max(vctFrag.r - 1.0f, 0.0f) * factor;
    float b = max(vctFrag.r - 1.0f, 0.0f) * factor;

    vctFrag.r += g + b;
    vctFrag.g += r + b;
    vctFrag.b += r + g;
  }
}
