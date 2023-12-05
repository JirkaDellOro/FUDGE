#version 300 es
/**
 * Extracts colors, downsamples and upsamples a texture
 * Adaption of the "dual filtering kawase" method described in SIGGRAPH 2015 by Marius Bjørge
 * https://community.arm.com/cfs-file/__key/communityserver-blogs-components-weblogfiles/00-00-00-20-66/siggraph2015_2D00_mmg_2D00_marius_2D00_notes.pdf
 * @authors Roland Heer, HFU, 2023 | Jirka Dell'Oro-Friedl, HFU, 2023 | Jonas Plotzky, HFU, 2023
 */
precision mediump float;
precision highp int;

uniform int u_iMode; // 0: extract, 1: downsample, 2: upsample, 3: apply
uniform float u_fThreshold;
uniform float u_fIntensity;
uniform float u_fHighlightDesaturation;
uniform vec2 u_vctTexel;

uniform sampler2D u_texSource;

in vec2 v_vctTexture;
out vec4 vctFrag;

// old gaussian blur
// flat in vec2[9] v_vctOffsets;
// const float gaussianKernel[9] = float[](0.045, 0.122, 0.045, 0.122, 0.332, 0.122, 0.045, 0.122, 0.045);
// vec4 downsample(vec2 _vctTexture) {
//   vec4 vctColor = vec4(0.0);
//   for (int i = 0; i < 9; i++) 
//     vctColor += texture(u_texSource, v_vctTexture + v_vctOffsets[i]) * gaussianKernel[i];
//   return vctColor;
// }
// vec4 upsample(vec2 _vctTexture) {
//   vec4 vctColor = vec4(0.0);
//   for (int i = 0; i < 9; i++) 
//     vctColor += texture(u_texSource, _vctTexture + v_vctOffsets[i]) * gaussianKernel[i];
//   return vctColor;
// }

// vec3 extract(vec2 _vctTexture) {
//   vec3 vctColor = texture(u_texSource, _vctTexture).rgb;
//   if(any(greaterThan(vctColor, vec3(u_fThreshold))))
//     return vctColor;
//   discard;
// }

// vec3 extract(vec2 _vctTexture) {
//   vec3 vctColor = texture(u_texSource, _vctTexture).rgb;
//   float luminance = dot(vctColor, vec3(0.299, 0.587, 0.114));
//   if(luminance > u_fThreshold)
//     return vctColor;
//   discard;
// }

// old extraction with average brightness
vec3 extract(vec2 _vctTexture) {
  vec3 vctColor = texture(u_texSource, _vctTexture).rgb;
  float fThreshold = u_fThreshold;
  if(fThreshold >= 1.0)
    fThreshold = 0.999999;

  vctColor = vctColor - fThreshold;
  vctColor = vctColor / (1.0 - fThreshold); // negative values might receive values above 1.0...
  
  float averageBrightness = (((vctColor.r + vctColor.g + vctColor.b) / 3.0) * 0.2) + 0.8; //the effect is reduced by first setting it to a 0.0-0.2 range and then adding 0.8
  vctColor = clamp(vctColor, 0.0, 1.0) * clamp(averageBrightness, 0.0, 1.0);
  return vctColor;
}

vec4 downsample(vec2 _vctTexture) {
  vec4 sum = texture(u_texSource, _vctTexture) * 4.0;
  sum += texture(u_texSource, _vctTexture - u_vctTexel.xy);
  sum += texture(u_texSource, _vctTexture + u_vctTexel.xy);
  sum += texture(u_texSource, _vctTexture + vec2(u_vctTexel.x, -u_vctTexel.y));
  sum += texture(u_texSource, _vctTexture - vec2(u_vctTexel.x, -u_vctTexel.y));

  return sum / 8.0;
}

vec4 upsample(vec2 _vctTexture) {
  vec4 sum = texture(u_texSource, _vctTexture + vec2(-u_vctTexel.x * 2.0, 0.0));
  sum += texture(u_texSource, _vctTexture + vec2(-u_vctTexel.x, u_vctTexel.y)) * 2.0;
  sum += texture(u_texSource, _vctTexture + vec2(0.0, u_vctTexel.y * 2.0));
  sum += texture(u_texSource, _vctTexture + vec2(u_vctTexel.x, u_vctTexel.y)) * 2.0;
  sum += texture(u_texSource, _vctTexture + vec2(u_vctTexel.x * 2.0, 0.0));
  sum += texture(u_texSource, _vctTexture + vec2(u_vctTexel.x, -u_vctTexel.y)) * 2.0;
  sum += texture(u_texSource, _vctTexture + vec2(0.0, -u_vctTexel.y * 2.0));
  sum += texture(u_texSource, _vctTexture + vec2(-u_vctTexel.x, -u_vctTexel.y)) * 2.0;
  return sum / 12.0;
}

vec3 apply(vec2 _vctTexture) {
  vec3 vctBloom = texture(u_texSource, _vctTexture).rgb;
  if (vctBloom.r >= 1.0 || vctBloom.g >= 1.0 || vctBloom.b >= 1.0) // maybe use threshold instead of 1.0?
    vctBloom = mix(vctBloom, vec3(1.0), u_fHighlightDesaturation);
  vctBloom = clamp(vctBloom * u_fIntensity, 0.0, 1.0);
  return vctBloom;
}

void main() {
  switch(u_iMode) {
    case 0:
      vctFrag.rgb = extract(v_vctTexture);
      vctFrag.a = 1.0;
      return;
    case 1:
      vctFrag = downsample(v_vctTexture);
      return;
    case 2:
      vctFrag = upsample(v_vctTexture);
      return;
    case 3:
      vctFrag.rgb = apply(v_vctTexture);
      vctFrag.a = 1.0;
      return;
    default:
      vctFrag = texture(u_texSource, v_vctTexture);
      return;
  }
}