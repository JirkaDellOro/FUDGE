#version 300 es
/**
* Composites all Post-FX on to the main-render and renders it to the main Renderbuffer
* @authors Roland Heer, HFU, 2023 | Jonas Plotzky, HFU, 2023
*/
precision mediump float;
precision highp int;

in vec2 v_vctTexture;

uniform sampler2D u_texColor;
uniform sampler2D u_texTransparent;

uniform bool u_bOcclusion;
uniform sampler2D u_texOcclusion;

uniform bool u_bBloom;
uniform sampler2D u_texBloom;
uniform float u_fBloomIntensity;
uniform float u_fHighlightDesaturation;

out vec4 vctFrag;

void main() {
  ivec2 vctFragCoord = ivec2(gl_FragCoord.xy);
  vctFrag = texelFetch(u_texColor, vctFragCoord, 0);

  if (u_bOcclusion)
    vctFrag.rgb = clamp(vctFrag.rgb - texelFetch(u_texOcclusion, vctFragCoord, 0).r, 0.0, 1.0);

  if (u_bBloom) {
    vec3 vctBloom = clamp(texture(u_texBloom, v_vctTexture).rgb, 0.0, 1.0);
    if (vctBloom.r >= 1.0 || vctBloom.g >= 1.0 || vctBloom.b >= 1.0) // maybe use threshold instead of 1.0?
      vctBloom = mix(vctBloom, vec3(1.0), u_fHighlightDesaturation);
    vctFrag.rgb += clamp(vctBloom * u_fBloomIntensity, 0.0, 1.0);
    
    // old desaturation, was dependent on the background color...
    // vctFrag.rgb += clamp(texture(u_texBloom, v_vctTexture).rgb * u_fBloomIntensity, 0.0, 1.0);
    // float r = max(vctFrag.r - 1.0, 0.0) * u_fHighlightDesaturation;
    // float g = max(vctFrag.g - 1.0, 0.0) * u_fHighlightDesaturation;
    // float b = max(vctFrag.b - 1.0, 0.0) * u_fHighlightDesaturation;
    // vctFrag.r += g + b;
    // vctFrag.g += r + b;
    // vctFrag.b += r + g;
  }

  // blend by ONE, ONE_MINUS_SRC_ALPHA for premultiplied alpha from color shading
  vec4 vctTransparent = texelFetch(u_texTransparent, vctFragCoord, 0);
  vctFrag.rgb = vctTransparent.rgb + (vctFrag.rgb * (1.0 - vctTransparent.a));
}