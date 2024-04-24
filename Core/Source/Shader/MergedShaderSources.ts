namespace FudgeCore {
  export let shaderSources: {[source: string]: string} = {};
  shaderSources["ShaderAmbientOcclusion.frag"] = /*glsl*/ `#version 300 es
/**
 * Calculates ambient occlusion for a given fragment
 * @authors Roland Heer, HFU, 2023 | Jonas Plotzky, HFU, 2023
 * adaption of https://github.com/tsherif/webgl2examples/blob/da1153a15ebc09bb13498e5f732ef2036507740c/ssao.html
 * see here for an in depth explanation: 
*/
precision mediump float;
precision highp int;

const float sin45 = 0.707107; // 45 degrees in radians
const vec2 kernel[4] = vec2[4](vec2(0.0, 1.0), vec2(1.0, 0.0), vec2(0.0, -1.0), vec2(-1.0, 0.0));

uniform float u_fNear;
uniform float u_fFar;
uniform float u_fSampleRadius;
uniform float u_fBias;
uniform float u_fAttenuationConstant;
uniform float u_fAttenuationLinear;
uniform float u_fAttenuationQuadratic;
uniform vec2 u_vctResolution;
uniform vec3 u_vctCamera;
// uniform mat4 u_mtxViewProjectionInverse;

uniform sampler2D u_texPosition;
uniform sampler2D u_texNormal;
uniform sampler2D u_texNoise;
// uniform sampler2D u_texDepth;

in vec2 v_vctTexture;
out vec4 vctFrag;

layout(std140) uniform Fog {
  bool u_bFogActive;
  float u_fFogNear;
  float u_fFogFar;
  float pading;
  vec4 u_vctFogColor;
};

// This function could be used to calculate the position from the depth texture, but mobile devices seems to lack in precision to do this
// vec3 getPosition(vec2 _vctTexture) {
//   float fDepth = texture(u_texDepth, _vctTexture).r;
//   vec4 clipSpacePosition = vec4(_vctTexture * 2.0 - 1.0, fDepth * 2.0 - 1.0, 1.0);
//   vec4 worldSpacePosition = u_mtxViewProjectionInverse * clipSpacePosition;
//   return worldSpacePosition.xyz / worldSpacePosition.w;
// }

float getOcclusion(vec3 _vctPosition, vec3 _vctNormal, vec2 _vctTexture) {
  vec3 vctOccluder = texture(u_texPosition, _vctTexture).xyz;

  if (vctOccluder.x == 0.0 && vctOccluder.y == 0.0 && vctOccluder.z == 0.0) // no occluder at this position
    return 0.0;

  vec3 vctDistance = vctOccluder - _vctPosition;
  float fIntensity = max(dot(_vctNormal, normalize(vctDistance)) - u_fBias, 0.0);

  float fDistance = length(vctDistance);
  float fAttenuation = 1.0 / (u_fAttenuationConstant + u_fAttenuationLinear * fDistance + u_fAttenuationQuadratic * fDistance * fDistance);

  return fIntensity * fAttenuation;
}

float getFog(vec3 _vctPosition) {
  float fDistance = length(_vctPosition - u_vctCamera); // maybe use z-depth instead of euclidean depth
  float fFog = clamp((fDistance - u_fFogNear) / (u_fFogFar - u_fFogNear), 0.0, 1.0);
  fFog = -pow(fFog, 2.0) + (2.0 * fFog); // lets fog appear quicker and fall off slower results in a more gradual falloff
  return fFog * u_vctFogColor.a;
}

void main() {
  vec3 vctPosition = texture(u_texPosition, v_vctTexture).xyz;
  vec3 vctNormal = texture(u_texNormal, v_vctTexture).xyz;
  vec2 vctRandom = normalize(texture(u_texNoise, v_vctTexture).xy * 2.0 - 1.0);
  float fDepth = (length(vctPosition - u_vctCamera) - u_fNear) / (u_fFar - u_fNear); // linear euclidean depth in range [0,1], when changing to view space, don't subtract camera position
  float fKernelRadius = u_fSampleRadius * (1.0 - fDepth);

  float fOcclusion = 0.0;
  for (int i = 0; i < 4; ++i) {
    vec2 vctK1 = reflect(kernel[i], vctRandom);
    vec2 vctK2 = vec2(vctK1.x * sin45 - vctK1.y * sin45, vctK1.x * sin45 + vctK1.y * sin45);

    vctK1 /= u_vctResolution;
    vctK2 /= u_vctResolution;

    vctK1 *= fKernelRadius;
    vctK2 *= fKernelRadius;

    fOcclusion += getOcclusion(vctPosition, vctNormal, v_vctTexture + vctK1);
    fOcclusion += getOcclusion(vctPosition, vctNormal, v_vctTexture + vctK2 * 0.75);
    fOcclusion += getOcclusion(vctPosition, vctNormal, v_vctTexture + vctK1 * 0.5);
    fOcclusion += getOcclusion(vctPosition, vctNormal, v_vctTexture + vctK2 * 0.25);
  }

  fOcclusion = clamp(fOcclusion / 16.0, 0.0, 1.0);

  if (u_bFogActive && fOcclusion > 0.0) // correct occlusion by fog factor
    fOcclusion = mix(fOcclusion, 0.0, getFog(vctPosition));
  
  vctFrag.rgb = vec3(fOcclusion);
  vctFrag.a = 1.0;
}`;
  shaderSources["ShaderBloom.frag"] = /*glsl*/ `#version 300 es
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
}`;
  shaderSources["ShaderGizmo.frag"] = /*glsl*/ `#version 300 es
/**
* ...
* @authors Jonas Plotzky, HFU, 2023
*/
precision mediump float;
precision highp int;

uniform vec4 u_vctColor;

out vec4 vctFrag;

// uniform sampler2D u_texDepthStencil;
#if defined(TEXTURE)
  uniform sampler2D u_texColor;
  in vec2 v_vctTexture;
#endif

// // 4x4 Bayer matrix for dithering
// const float mtxDither[16] = float[](
//   1.0 / 17.0,  9.0 / 17.0,  3.0 / 17.0, 11.0 / 17.0,
//   13.0 / 17.0,  5.0 / 17.0, 15.0 / 17.0,  7.0 / 17.0,
//   4.0 / 17.0, 12.0 / 17.0,  2.0 / 17.0, 10.0 / 17.0,
//   16.0 / 17.0,  8.0 / 17.0, 14.0 / 17.0,  6.0 / 17.0
// );

void main() {
  vctFrag = u_vctColor;

  #if defined(TEXTURE)

      vctFrag *= texture(u_texColor, v_vctTexture);

  #endif

  // int x = int(gl_FragCoord.x) % 4;
  // int y = int(gl_FragCoord.y) % 4;
  // int index = y * 4 + x;
  // // Discard the fragment if its alpha is less than the corresponding value in the dithering matrix
  // if (vctFrag.a < mtxDither[index]) 
  //   discard;

  // // Discard the fragment if its alpha is 0
  // if (vctFrag.a == 0.0)
  //   discard;

  // // Create a checkerboard pattern for alpha values less than 0.5
  // else if (vctFrag.a < 0.5 && ((x + y) % 2 == 0))
  //   discard;

  // vctFrag.a = 1.0;

  if (vctFrag.a < 0.01)
    discard;

  // premultiply alpha for blending
  vctFrag.rgb *= vctFrag.a;
}`;
  shaderSources["ShaderGizmo.vert"] = /*glsl*/ `#version 300 es
/**
* ...
* @authors Jonas Plotzky, HFU, 2023
*/
precision mediump float;
precision highp int;

// uniform mat4 u_mtxViewProjection;
// uniform mat4 u_mtxModel;
uniform mat4 u_mtxMeshToView; // model-view-projection matrix

in vec3 a_vctPosition;

#if defined(TEXTURE)

  in vec2 a_vctTexture;
  out vec2 v_vctTexture;

#endif

void main() {
  gl_Position = u_mtxMeshToView * vec4(a_vctPosition, 1.0);

  #if defined(TEXTURE)

    v_vctTexture = a_vctTexture;

  #endif
}`;
  shaderSources["ShaderPhong.frag"] = /*glsl*/ `#version 300 es
/**
* Phong shading
* @authors Jirka Dell'Oro-Friedl, HFU, 2022 | Roland Heer, HFU, 2023 | Jonas Plotzky, HFU, 2023
*/

precision mediump float;
precision highp int;

uniform vec4 u_vctColor;
uniform float u_fDiffuse;
uniform float u_fSpecular;
uniform float u_fIntensity;
uniform float u_fMetallic;
uniform vec3 u_vctCamera;

uniform bool u_bFog;
uniform vec4 u_vctFogColor;
uniform float u_fFogNear;
uniform float u_fFogFar;

in vec4 v_vctColor;
in vec3 v_vctPosition;

layout(location = 0) out vec4 vctFrag;
layout(location = 1) out vec4 vctFragPosition;
layout(location = 2) out vec4 vctFragNormal;

#ifdef PHONG

  in vec3 v_vctNormal;

#endif

#ifdef FLAT

  flat in vec3 v_vctPositionFlat;

#endif

struct Light {
  vec4 vctColor;
  mat4 mtxShape;
  mat4 mtxShapeInverse;
};

const uint MAX_LIGHTS_DIRECTIONAL = 15u;
const uint MAX_LIGHTS_POINT = 100u;
const uint MAX_LIGHTS_SPOT = 100u;

layout(std140) uniform Lights {
  uint u_nLightsDirectional;
  uint u_nLightsPoint;
  uint u_nLightsSpot;
  uint padding; // Add padding to align to 16 bytes
  Light u_ambient;
  Light u_directional[MAX_LIGHTS_DIRECTIONAL];
  Light u_point[MAX_LIGHTS_POINT];
  Light u_spot[MAX_LIGHTS_SPOT];
};

// TEXTURE: input UVs and texture
#ifdef TEXTURE

  in vec2 v_vctTexture;
  uniform sampler2D u_texColor;

#endif

// NORMALMAP: input UVs and texture
#ifdef NORMALMAP

  in vec3 v_vctTangent;
  in vec3 v_vctBitangent;
  uniform sampler2D u_texNormal;

#endif

// Returns a vector for visualizing on model. Great for debugging
vec4 showVectorAsColor(vec3 _vector, bool _clamp) {
  if(_clamp) {
    _vector *= 0.5;
    _vector += 0.5;
  }
  return vec4(_vector.x, _vector.y, _vector.z, 1);
}

void illuminateDirected(vec3 _vctDirection, vec3 _vctView, vec3 _vctNormal, vec3 _vctColor, inout vec3 _vctDiffuse, inout vec3 _vctSpecular) {
  vec3 vctDirection = normalize(_vctDirection);
  float fIllumination = -dot(_vctNormal, vctDirection);
  if(fIllumination > 0.0) {
    _vctDiffuse += u_fDiffuse * fIllumination * _vctColor;

    if(u_fSpecular <= 0.0)
      return;
      
    //BLINN-Phong Shading
    vec3 halfwayDir = normalize(-vctDirection - _vctView);
    float factor = max(dot(-vctDirection, _vctNormal), 0.0); //Factor for smoothing out transition from surface facing the lightsource to surface facing away from the lightsource
    factor = 1.0 - (pow(factor - 1.0, 8.0));                 //The factor is altered in order to clearly see the specular highlight even at steep angles, while still preventing artifacts

    _vctSpecular += pow(max(dot(_vctNormal, halfwayDir), 0.0), exp2(u_fSpecular * 5.0)) * u_fSpecular * u_fIntensity * factor * _vctColor;
  }
}

float getFog(vec3 _vctPosition) {
  float fDistance = length(_vctPosition - u_vctCamera); // maybe use z-depth instead of euclidean depth
  float fFog = clamp((fDistance - u_fFogNear) / (u_fFogFar - u_fFogNear), 0.0, 1.0);
  fFog = -pow(fFog, 2.0) + (2.0 * fFog); // lets fog appear quicker and fall off slower results in a more gradual falloff
  return fFog;
}

void main() {
  #if defined(PHONG) && !defined(FLAT)

    #ifdef NORMALMAP

      mat3 mtxTBN = mat3(normalize(v_vctTangent), normalize(v_vctBitangent), normalize(v_vctNormal));
      vec3 vctNormal = texture(u_texNormal, v_vctTexture).xyz * 2.0 - 1.0;
      vctNormal = normalize(mtxTBN * vctNormal);

    #else

      vec3 vctNormal = normalize(v_vctNormal);

    #endif

    vec3 vctView = normalize(v_vctPosition - u_vctCamera);
    vec3 vctPosition = v_vctPosition;

  #endif

  #ifdef FLAT

    vec3 vctFdx = dFdx(v_vctPosition);
    vec3 vctFdy = dFdy(v_vctPosition);
    vec3 vctNormal = normalize(cross(vctFdx, vctFdy));
    vec3 vctView = normalize(v_vctPositionFlat - u_vctCamera);
    vec3 vctPosition = v_vctPositionFlat;

  #endif

  vec3 vctDiffuse = u_fDiffuse * u_ambient.vctColor.rgb;
  vec3 vctSpecular = vec3(0, 0, 0);

  // calculate directional light effect
  for(uint i = 0u; i < u_nLightsDirectional; i++) {
    vec3 vctDirection = vec3(u_directional[i].mtxShape * vec4(0.0, 0.0, 1.0, 1.0));
    illuminateDirected(vctDirection, vctView, vctNormal, u_directional[i].vctColor.rgb, vctDiffuse, vctSpecular);
  }

  // calculate point light effect
  for(uint i = 0u; i < u_nLightsPoint; i++) {
    vec3 vctPositionLight = vec3(u_point[i].mtxShape * vec4(0.0, 0.0, 0.0, 1.0));
    vec3 vctDirection = vctPosition - vctPositionLight;
    float fIntensity = 1.0 - length(mat3(u_point[i].mtxShapeInverse) * vctDirection);
    if(fIntensity < 0.0)
      continue;

    illuminateDirected(vctDirection, vctView, vctNormal, u_point[i].vctColor.rgb * fIntensity, vctDiffuse, vctSpecular);
  }

  // calculate spot light effect
  for(uint i = 0u; i < u_nLightsSpot; i++) {
    vec3 vctPositionLight = vec3(u_spot[i].mtxShape * vec4(0.0, 0.0, 0.0, 1.0));
    vec3 vctDirection = vctPosition - vctPositionLight;
    vec3 vctDirectionInverted = mat3(u_spot[i].mtxShapeInverse) * vctDirection;
    if(vctDirectionInverted.z <= 0.0)
      continue;

    float fIntensity = 1.0 - min(1.0, 2.0 * length(vctDirectionInverted.xy) / vctDirectionInverted.z);    //Coneshape that is brightest in the center. Possible TODO: "Variable Spotlightsoftness"
    fIntensity *= 1.0 - pow(vctDirectionInverted.z, 2.0);                                                 //Prevents harsh lighting artifacts at boundary of the given spotlight
    if(fIntensity < 0.0)
      continue;

    illuminateDirected(vctDirection, vctView, vctNormal, u_spot[i].vctColor.rgb * fIntensity, vctDiffuse, vctSpecular);
  }

  vctFrag.rgb = vctDiffuse + vctSpecular * u_fMetallic;
  vctFrag.a = 1.0;

  #ifdef TEXTURE

    vec4 vctColorTexture = texture(u_texColor, v_vctTexture);
    vctFrag *= vctColorTexture;

  #endif

  vctFrag *= u_vctColor * v_vctColor;
  vctFrag.rgb += vctSpecular * (1.0 - u_fMetallic);

  vctFragPosition = vec4(v_vctPosition, 1.0); // don't use flat here, because we want to interpolate the position
  vctFragNormal = vec4(vctNormal, 1.0);

  if (u_bFog) 
    vctFrag.rgb = mix(vctFrag.rgb, u_vctFogColor.rgb, getFog(vctPosition) * u_vctFogColor.a);

  vctFrag.rgb *= vctFrag.a;

  if(vctFrag.a < 0.01)
    discard;
}`;
  shaderSources["ShaderPick.frag"] = /*glsl*/ `#version 300 es
/**
* Renders for Raycasting
* @authors Jirka Dell'Oro-Friedl, HFU, 2019
*/
precision mediump float;
precision highp int;

uniform int u_id;
uniform vec2 u_vctSize;
uniform vec4 u_vctColor;
out ivec4 vctFrag;

void main() {
    int pixel = int(trunc(gl_FragCoord.x) + u_vctSize.x * trunc(gl_FragCoord.y));

    if (pixel != u_id)
      discard;

    uint icolor = uint(u_vctColor.r * 255.0) << 24 | uint(u_vctColor.g * 255.0) << 16 | uint(u_vctColor.b * 255.0) << 8 | uint(u_vctColor.a * 255.0);
                
    vctFrag = ivec4(floatBitsToInt(gl_FragCoord.z), icolor, 0, 0);
}`;
  shaderSources["ShaderPick.vert"] = /*glsl*/ `#version 300 es
/**
* Renders for Raycasting
* @authors Jirka Dell'Oro-Friedl, HFU, 2019
*/
in vec3 a_vctPosition;       
uniform mat4 u_mtxMeshToView;

void main() {   
    gl_Position = u_mtxMeshToView * vec4(a_vctPosition, 1.0);
}`;
  shaderSources["ShaderPickTextured.frag"] = /*glsl*/ `#version 300 es
/**
* Renders for Raycasting
* @authors Jirka Dell'Oro-Friedl, HFU, 2019
*/
precision mediump float;
precision highp int;

uniform int u_id;
uniform vec2 u_vctSize;
in vec2 v_vctTexture;
uniform vec4 u_vctColor;
uniform sampler2D u_texColor;

out ivec4 vctFrag;

void main() {
  int pixel = int(trunc(gl_FragCoord.x) + u_vctSize.x * trunc(gl_FragCoord.y));

  if (pixel != u_id)
    discard;
  
  vec4 vctColor = u_vctColor * texture(u_texColor, v_vctTexture);
  uint icolor = uint(vctColor.r * 255.0) << 24 | uint(vctColor.g * 255.0) << 16 | uint(vctColor.b * 255.0) << 8 | uint(vctColor.a * 255.0);
  
  vctFrag = ivec4(floatBitsToInt(gl_FragCoord.z), icolor, floatBitsToInt(v_vctTexture.x), floatBitsToInt(v_vctTexture.y));
}`;
  shaderSources["ShaderPickTextured.vert"] = /*glsl*/ `#version 300 es
/**
* Renders for Raycasting
* @authors Jirka Dell'Oro-Friedl, HFU, 2019
*/
in vec3 a_vctPosition;       
in vec2 a_vctTexture;
uniform mat4 u_mtxMeshToView;
uniform mat3 u_mtxPivot;

out vec2 v_vctTexture;

void main() {   
  gl_Position = u_mtxMeshToView * vec4(a_vctPosition, 1.0);
  v_vctTexture = (u_mtxPivot * vec3(a_vctTexture, 1.0)).xy;
}`;
  shaderSources["ShaderScreen.vert"] = /*glsl*/ `#version 300 es
precision mediump float;
precision highp int;
/**
 * Creates a fullscreen triangle which cotains the screen quad and sets the texture coordinates accordingly.
 * @authors Roland Heer, HFU, 2023 | Jirka Dell'Oro-Friedl, HFU, 2023 | Jonas Plotzky, HFU, 2023
 *
 *  2  3 .
 *       .  .
 *       .     .  
 *       .        .
 *  1  1 ..........  .
 *       . screen .     .
 *       .  quad  .        .
 *  0 -1 ..........  .  .  .  .
 *    p -1        1           3
 *  t    0        1           2
 *  
 *  p == postion
 *  t == texture coordinate
 */

uniform float u_width;
uniform float u_height;
uniform vec2 u_vctResolution;

out vec2 v_vctTexture;

#ifdef SAMPLE

  flat out vec2[9] v_vctOffsets;

#endif

void main() {
  float x = float((gl_VertexID % 2) * 4); // 0, 4, 0
  float y = float((gl_VertexID / 2) * 4); // 0, 0, 4
  gl_Position = vec4(x - 1.0, y - 1.0, 0.0, 1.0); // (-1, -1), (3, -1), (-1, 3)
  v_vctTexture = vec2(x / 2.0, y / 2.0);  // (0, 0), (2, 0), (0, 2) -> interpolation will yield (0, 0), (1, 0), (0, 1) as the positions are double the size of the screen

  #ifdef SAMPLE

    vec2 offset = vec2(1.0 / u_vctResolution.x, 1.0 / u_vctResolution.y);
    v_vctOffsets = vec2[](
      vec2(-offset.x, offset.y),  vec2(0.0, offset.y),  vec2(offset.x, offset.y),
      vec2(-offset.x, 0.0),       vec2(0.0, 0.0),       vec2(offset.x, 0.0),
      vec2(-offset.x, -offset.y), vec2(0.0, -offset.y),  vec2(offset.x, -offset.y)
    );

  #endif
}`;
  shaderSources["ShaderUniversal.frag"] = /*glsl*/ `#version 300 es
/**
* Universal Shader as base for many others. Controlled by compiler directives
* @authors Jirka Dell'Oro-Friedl, HFU, 2021 | Jonas Plotzky, HFU, 2023
*/
precision mediump float;
precision highp int;

// MINIMAL
uniform vec4 u_vctColor;
uniform vec3 u_vctCamera; // needed for fog

layout(std140) uniform Fog {
  bool u_bFogActive;
  float u_fFogNear;
  float u_fFogFar;
  float fogPadding; // add padding to align to 16 bytes
  vec4 u_vctFogColor;
};

in vec3 v_vctPosition;
in vec4 v_vctColor;

layout(location = 0) out vec4 vctFrag;
layout(location = 1) out vec4 vctFragPosition; // TODO: make these optional?
layout(location = 2) out vec4 vctFragNormal;

#if defined(FLAT) || defined(GOURAUD) || defined(PHONG)

  in vec3 v_vctNormal;

#endif

#if defined(FLAT)

  flat in vec3 v_vctPositionFlat;

#endif

#if defined(GOURAUD)

    uniform float u_fMetallic;
    in vec3 v_vctDiffuse;
    in vec3 v_vctSpecular;

#endif

#if defined(PHONG) || defined(FLAT)

  uniform float u_fDiffuse;
  uniform float u_fSpecular;
  uniform float u_fIntensity;
  uniform float u_fMetallic;

  struct Light {
    vec4 vctColor;
    mat4 mtxShape;
    mat4 mtxShapeInverse;
  };

  const uint MAX_LIGHTS_DIRECTIONAL = 15u;
  const uint MAX_LIGHTS_POINT = 100u;
  const uint MAX_LIGHTS_SPOT = 100u;

  layout(std140) uniform Lights {
    uint u_nLightsDirectional;
    uint u_nLightsPoint;
    uint u_nLightsSpot;
    uint ligthsPadding; // Add padding to align to 16 bytes
    Light u_ambient;
    Light u_directional[MAX_LIGHTS_DIRECTIONAL];
    Light u_point[MAX_LIGHTS_POINT];
    Light u_spot[MAX_LIGHTS_SPOT];
  };

  void illuminateDirected(vec3 _vctDirection, vec3 _vctView, vec3 _vctNormal, vec3 _vctColor, inout vec3 _vctDiffuse, inout vec3 _vctSpecular) {
    vec3 vctDirection = normalize(_vctDirection);
    float fIllumination = -dot(_vctNormal, vctDirection);
    if(fIllumination > 0.0) {
      _vctDiffuse += u_fDiffuse * fIllumination * _vctColor;

      if(u_fSpecular <= 0.0)
        return;
        
      //BLINN-Phong Shading
      vec3 halfwayDir = normalize(-vctDirection - _vctView);
      float factor = max(dot(-vctDirection, _vctNormal), 0.0); //Factor for smoothing out transition from surface facing the lightsource to surface facing away from the lightsource
      factor = 1.0 - (pow(factor - 1.0, 8.0));                 //The factor is altered in order to clearly see the specular highlight even at steep angles, while still preventing artifacts

      _vctSpecular += pow(max(dot(_vctNormal, halfwayDir), 0.0), exp2(u_fSpecular * 5.0)) * u_fSpecular * u_fIntensity * factor * _vctColor;
    }
  }

#endif

#if defined(TEXTURE) || defined(MATCAP)

  uniform sampler2D u_texColor;
  in vec2 v_vctTexture;

#endif

#if defined(NORMALMAP)

  uniform sampler2D u_texNormal;
  in vec3 v_vctTangent;
  in vec3 v_vctBitangent;

#endif

#if defined(PARTICLE)

  uniform int u_iBlendMode;

#endif

float getFog(vec3 _vctPosition) {
  float fDistance = length(_vctPosition - u_vctCamera); // maybe use z-depth instead of euclidean depth
  float fFog = clamp((fDistance - u_fFogNear) / (u_fFogFar - u_fFogNear), 0.0, 1.0);
  fFog = -pow(fFog, 2.0) + (2.0 * fFog); // lets fog appear quicker and fall off slower results in a more gradual falloff
  return fFog * u_vctFogColor.a;
}

void main() {

  #if defined(FLAT)

    vec3 vctFdx = dFdx(v_vctPosition);
    vec3 vctFdy = dFdy(v_vctPosition);
    vec3 vctNormal = normalize(cross(vctFdx, vctFdy));
    vec3 vctView = normalize(v_vctPositionFlat - u_vctCamera);
    vec3 vctPosition = v_vctPositionFlat;

  #endif

  #if (defined(PHONG) || defined(GOURAUD)) && !defined(NORMALMAP)

    vec3 vctNormal = normalize(v_vctNormal);

  #endif

  #if defined(PHONG)

    vec3 vctView = normalize(v_vctPosition - u_vctCamera);
    vec3 vctPosition = v_vctPosition;

  #endif

  #if defined(NORMALMAP)

    mat3 mtxTBN = mat3(normalize(v_vctTangent), normalize(v_vctBitangent), normalize(v_vctNormal));
    vec3 vctNormal = texture(u_texNormal, v_vctTexture).xyz * 2.0 - 1.0;
    vctNormal = normalize(mtxTBN * vctNormal);

  #endif
  
  #if defined(FLAT) || defined(PHONG)

    vec3 vctDiffuse = u_fDiffuse * u_ambient.vctColor.rgb;
    vec3 vctSpecular = vec3(0, 0, 0);

    // directional lights
    for(uint i = 0u; i < u_nLightsDirectional; i++) {
      vec3 vctDirection = vec3(u_directional[i].mtxShape * vec4(0.0, 0.0, 1.0, 1.0));
      illuminateDirected(vctDirection, vctView, vctNormal, u_directional[i].vctColor.rgb, vctDiffuse, vctSpecular);
    }

    // point lights
    for(uint i = 0u; i < u_nLightsPoint; i++) {
      vec3 vctPositionLight = vec3(u_point[i].mtxShape * vec4(0.0, 0.0, 0.0, 1.0));
      vec3 vctDirection = vctPosition - vctPositionLight;
      float fIntensity = 1.0 - length(mat3(u_point[i].mtxShapeInverse) * vctDirection);
      if(fIntensity < 0.0)
        continue;

      illuminateDirected(vctDirection, vctView, vctNormal, u_point[i].vctColor.rgb * fIntensity, vctDiffuse, vctSpecular);
    }

    // spot lights
    for(uint i = 0u; i < u_nLightsSpot; i++) {
      vec3 vctPositionLight = vec3(u_spot[i].mtxShape * vec4(0.0, 0.0, 0.0, 1.0));
      vec3 vctDirection = vctPosition - vctPositionLight;
      vec3 vctDirectionInverted = mat3(u_spot[i].mtxShapeInverse) * vctDirection;
      if(vctDirectionInverted.z <= 0.0)
        continue;

      float fIntensity = 1.0 - min(1.0, 2.0 * length(vctDirectionInverted.xy) / vctDirectionInverted.z);    //Coneshape that is brightest in the center. Possible TODO: "Variable Spotlightsoftness"
      fIntensity *= 1.0 - pow(vctDirectionInverted.z, 2.0);                                                 //Prevents harsh lighting artifacts at boundary of the given spotlight
      if(fIntensity < 0.0)
        continue;

      illuminateDirected(vctDirection, vctView, vctNormal, u_spot[i].vctColor.rgb * fIntensity, vctDiffuse, vctSpecular);
    }

  #endif

  vec4 vctColor = u_vctColor * v_vctColor;
  vctColor.rgb *= vctColor.a; // premultiply alpha

  #if defined(GOURAUD)

    vec3 vctDiffuse = v_vctDiffuse;
    vec3 vctSpecular = v_vctSpecular;

  #endif

  #if defined(FLAT) || defined(GOURAUD) || defined(PHONG)

    vctFrag.rgb = vctDiffuse + vctSpecular * u_fMetallic;
    vctFrag.a = 1.0;

  #else

    // MINIMAL: set the base color
    vctFrag = vctColor;

  #endif

  #if defined(TEXTURE) || defined(MATCAP)
    
    // TEXTURE: multiply with texel color
    vec4 vctColorTexture = texture(u_texColor, v_vctTexture); // has premultiplied alpha by webgl
    vctFrag *= vctColorTexture;

  #endif

  #if defined(FLAT) || defined(GOURAUD) || defined(PHONG)

    vctFrag *= vctColor;
    vctFrag.rgb += vctSpecular * (1.0 - u_fMetallic);

    vctFragPosition = vec4(v_vctPosition, 1.0);
    vctFragNormal = vec4(vctNormal, 1.0);
  
  #endif

  #if !defined(PHONG) && !defined(FLAT) && !defined(GOURAUD) // MINIMAL

    vctFragPosition = vec4(0.0, 0.0, 0.0, 1.0); // (0, 0, 0) will treat occluders as non existing in ssao
    vctFragNormal = vec4(0.0, 0.0, 0.0, 1.0); // (0, 0, 0) normal will yield not occlusion in ssao
  
  #endif

  // discard pixel alltogether when transparent: don't show in Z-Buffer
  if(vctFrag.a < 0.01)
    discard;

  if (u_bFogActive) {
    float fFog = getFog(v_vctPosition);
    vctFrag.rgb /= vctFrag.a; // unpremultiply alpha
    vctFrag.rgb = mix(vctFrag.rgb, u_vctFogColor.rgb, fFog);

    #if defined(PARTICLE)

      if (u_iBlendMode == 2 || u_iBlendMode == 3 || u_iBlendMode == 4)  // for blend additive, subtractive, modulate
        vctFrag.a = mix(vctFrag.a, 0.0, fFog);                          // fade out particle when in fog to make it disappear completely

    #endif

    vctFrag.rgb *= vctFrag.a; // premultiply alpha
  }
}`;
  shaderSources["ShaderUniversal.vert"] = /*glsl*/ `#version 300 es
/**
* Universal Shader as base for many others. Controlled by compiler directives
* @authors 2021, Luis Keck, HFU, 2021 | Jirka Dell'Oro-Friedl, HFU, 2021 | Jonas Plotzky, HFU, 2023
*/
precision mediump float;
precision highp int;

uniform mat4 u_mtxMeshToWorld; // needed for FOG
uniform mat4 u_mtxMeshToView;

in vec3 a_vctPosition;
in vec4 a_vctColor; // TODO: think about making vertex color optional

out vec3 v_vctPosition;
out vec4 v_vctColor;

#if defined(FLAT) || defined(GOURAUD) || defined(PHONG) || defined(PARTICLE) || defined(MATCAP)

  uniform vec3 u_vctCamera;

#endif

#if defined(FLAT) || defined(GOURAUD) || defined(PHONG)

  uniform mat4 u_mtxNormalMeshToWorld;

  in vec3 a_vctNormal;
  out vec3 v_vctNormal;

#endif

#if defined(FLAT)

  flat out vec3 v_vctPositionFlat;

#endif

#if defined(GOURAUD)

  uniform float u_fDiffuse;
  uniform float u_fSpecular;
  uniform float u_fIntensity;

  out vec3 v_vctDiffuse;
  out vec3 v_vctSpecular;

  struct Light {
    vec4 vctColor;
    mat4 mtxShape;
    mat4 mtxShapeInverse;
  };

  const uint MAX_LIGHTS_DIRECTIONAL = 15u;
  const uint MAX_LIGHTS_POINT = 100u;
  const uint MAX_LIGHTS_SPOT = 100u;

  layout(std140) uniform Lights {
    uint u_nLightsDirectional;
    uint u_nLightsPoint;
    uint u_nLightsSpot;
    uint padding; // Add padding to align to 16 bytes
    Light u_ambient;
    Light u_directional[MAX_LIGHTS_DIRECTIONAL];
    Light u_point[MAX_LIGHTS_POINT];
    Light u_spot[MAX_LIGHTS_SPOT];
  };

  void illuminateDirected(vec3 _vctDirection, vec3 _vctView, vec3 _vctNormal, vec3 _vctColor, inout vec3 _vctDiffuse, inout vec3 _vctSpecular) {
    vec3 vctDirection = normalize(_vctDirection);
    float fIllumination = -dot(_vctNormal, vctDirection);
    if(fIllumination > 0.0) {
      _vctDiffuse += u_fDiffuse * fIllumination * _vctColor;

      if(u_fSpecular <= 0.0)
        return;

      //BLINN
      vec3 halfwayDir = normalize(-vctDirection - _vctView);
      float factor = max(dot(-vctDirection, _vctNormal), 0.0); //Factor for smoothing out transition from surface facing the lightsource to surface facing away from the lightsource
      factor = 1.0 - (pow(factor - 1.0, 8.0));                 //The factor is altered in order to clearly see the specular highlight even at steep angles, while still preventing artifacts

      _vctSpecular += pow(max(dot(_vctNormal, halfwayDir), 0.0), exp2(u_fSpecular * 5.0)) * u_fSpecular * u_fIntensity * factor * _vctColor;

      //PHONG (old)
      // vec3 vctReflection = normalize(reflect(-vctDirection, _vctNormal));
      // float fHitCamera = dot(vctReflection, _vctView);
      // _vctSpecular += pow(max(fHitCamera, 0.0), u_fSpecular * 10.0) * u_fSpecular * _vctColor; // 10.0 = magic number, looks good... 
    }
  }

#endif

#if defined(TEXTURE) || defined(NORMALMAP)

  uniform mat3 u_mtxPivot;

  in vec2 a_vctTexture;
  out vec2 v_vctTexture;

#endif

#if defined(NORMALMAP)

  in vec4 a_vctTangent;
  out vec3 v_vctTangent;
  out vec3 v_vctBitangent;

#endif

// MATCAP: offer buffers for UVs and pivot matrix
#if defined(MATCAP) // MatCap-shader generates texture coordinates from surface normals
  
  uniform mat4 u_mtxWorldToCamera;
  uniform mat4 u_mtxNormalMeshToWorld;

  in vec3 a_vctNormal;
  out vec2 v_vctTexture;

#endif

#if defined(SKIN)

  // Bones https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/skinning_pars_vertex.glsl.js
  uniform mat4 u_mtxWorldToView;
  in uvec4 a_vctBones;
  in vec4 a_vctWeights;

  const uint MAX_BONES = 256u; // CAUTION: this number must be the same as in RenderInjectorSkeletonInstance where the corresponding buffers are created
  layout(std140) uniform Skin {
    mat4 u_mtxBones[MAX_BONES];
  };

#endif

#if defined(PARTICLE)

  uniform mat4 u_mtxWorldToView;
  uniform float u_fParticleSystemDuration;
  uniform float u_fParticleSystemSize;
  uniform float u_fParticleSystemTime;
  uniform sampler2D u_particleSystemRandomNumbers;
  uniform bool u_bParticleSystemFaceCamera;
  uniform bool u_bParticleSystemRestrict;

  mat4 lookAt(vec3 _vctTranslation, vec3 _vctTarget) {
    vec3 vctUp = vec3(0.0, 1.0, 0.0);
    vec3 zAxis = normalize(_vctTarget - _vctTranslation);
    vec3 xAxis = normalize(cross(vctUp, zAxis));
    vec3 yAxis = u_bParticleSystemRestrict ? vctUp : normalize(cross(zAxis, xAxis));
    zAxis = u_bParticleSystemRestrict ? normalize(cross(xAxis, vctUp)) : zAxis;

    return mat4(xAxis.x, xAxis.y, xAxis.z, 0.0, yAxis.x, yAxis.y, yAxis.z, 0.0, zAxis.x, zAxis.y, zAxis.z, 0.0, _vctTranslation.x, _vctTranslation.y, _vctTranslation.z, 1.0);
  }

  float fetchRandomNumber(int _iIndex, int _iParticleSystemRandomNumbersSize, int _iParticleSystemRandomNumbersLength) {
    _iIndex = _iIndex % _iParticleSystemRandomNumbersLength;
    return texelFetch(u_particleSystemRandomNumbers, ivec2(_iIndex % _iParticleSystemRandomNumbersSize, _iIndex / _iParticleSystemRandomNumbersSize), 0).r;
  }

#endif

void main() {

  vec4 vctPosition = vec4(a_vctPosition, 1.0);
  mat4 mtxMeshToWorld = u_mtxMeshToWorld;
  mat4 mtxMeshToView = u_mtxMeshToView;

  #if defined(FLAT) || defined(GOURAUD) || defined(PHONG) // only these work with particle and skinning

    mat4 mtxNormalMeshToWorld = u_mtxNormalMeshToWorld;

  #endif

  #if defined(PARTICLE)
  
    float fParticleId = float(gl_InstanceID);
    int iParticleSystemRandomNumbersSize = textureSize(u_particleSystemRandomNumbers, 0).x; // the dimension of the quadratic texture
    int iParticleSystemRandomNumbersLength = iParticleSystemRandomNumbersSize * iParticleSystemRandomNumbersSize; // the total number of texels in the texture
    /*$variables*/
    /*$mtxLocal*/
    /*$mtxWorld*/
    mtxMeshToWorld = /*$mtxWorld*/ mtxMeshToWorld /*$mtxLocal*/;
    if(u_bParticleSystemFaceCamera) mtxMeshToWorld = lookAt(vec3(mtxMeshToWorld[3][0], mtxMeshToWorld[3][1], mtxMeshToWorld[3][2]), u_vctCamera) *
      mat4(length(vec3(mtxMeshToWorld[0][0], mtxMeshToWorld[1][0], mtxMeshToWorld[2][0])), 0.0, 0.0, 0.0, 0.0, length(vec3(mtxMeshToWorld[0][1], mtxMeshToWorld[1][1], mtxMeshToWorld[2][1])), 0.0, 0.0, 0.0, 0.0, length(vec3(mtxMeshToWorld[0][2], mtxMeshToWorld[1][2], mtxMeshToWorld[2][2])), 0.0, 0.0, 0.0, 0.0, 1.0);
    mtxMeshToView = u_mtxWorldToView * mtxMeshToWorld;

    #if defined(FLAT) || defined(GOURAUD) || defined(PHONG)

      mtxNormalMeshToWorld = transpose(inverse(mtxMeshToWorld));

    #endif

  #endif

  #if defined(SKIN)

    mtxMeshToWorld = a_vctWeights.x * u_mtxBones[a_vctBones.x] +
      a_vctWeights.y * u_mtxBones[a_vctBones.y] +
      a_vctWeights.z * u_mtxBones[a_vctBones.z] +
      a_vctWeights.w * u_mtxBones[a_vctBones.w];

    mtxMeshToView = u_mtxWorldToView * mtxMeshToWorld;
    mtxNormalMeshToWorld = transpose(inverse(mtxMeshToWorld));

  #endif

  gl_Position = mtxMeshToView * vctPosition; 
  vctPosition = mtxMeshToWorld * vctPosition;

  v_vctColor = a_vctColor;
  v_vctPosition = vctPosition.xyz;

  #if defined(PARTICLE_COLOR)

    v_vctColor *= /*$color*/;

  #endif

  #if defined(FLAT)

    v_vctPositionFlat = v_vctPosition;
    
  #endif

  #if defined(FLAT) || defined(GOURAUD) || defined(PHONG)

    v_vctNormal = mat3(mtxNormalMeshToWorld) * a_vctNormal; // unnormalized as it must be normalized in the fragment shader anyway

  #endif 

  #if defined(NORMALMAP)

    v_vctTangent = mat3(mtxNormalMeshToWorld) * a_vctTangent.xyz;
    v_vctBitangent = cross(v_vctNormal, v_vctTangent) * a_vctTangent.w;

  #endif

  #if defined(GOURAUD)
  
    vec3 vctView = normalize(vctPosition.xyz - u_vctCamera);
    vec3 vctNormal = normalize(v_vctNormal);
    v_vctDiffuse = u_fDiffuse * u_ambient.vctColor.rgb;
    v_vctSpecular = vec3(0, 0, 0);

    // calculate directional light effect
    for(uint i = 0u; i < u_nLightsDirectional; i ++) {
      vec3 vctDirection = vec3(u_directional[i].mtxShape * vec4(0.0, 0.0, 1.0, 1.0));
      illuminateDirected(vctDirection, vctView, vctNormal, u_directional[i].vctColor.rgb, v_vctDiffuse, v_vctSpecular);
    }

    // calculate point light effect
    for(uint i = 0u;i < u_nLightsPoint;i ++) {
      vec3 vctPositionLight = vec3(u_point[i].mtxShape * vec4(0.0, 0.0, 0.0, 1.0));
      vec3 vctDirection = vctPosition.xyz - vctPositionLight;
      float fIntensity = 1.0 - length(mat3(u_point[i].mtxShapeInverse) * vctDirection);
      if(fIntensity < 0.0) continue;

      illuminateDirected(vctDirection, vctView, vctNormal, u_point[i].vctColor.rgb * fIntensity, v_vctDiffuse, v_vctSpecular);
    }

    // calculate spot light effect
    for(uint i = 0u;i < u_nLightsSpot;i ++) {
      vec3 vctPositionLight = vec3(u_spot[i].mtxShape * vec4(0.0, 0.0, 0.0, 1.0));
      vec3 vctDirection = vctPosition.xyz - vctPositionLight;
      vec3 vctDirectionInverted = mat3(u_spot[i].mtxShapeInverse) * vctDirection;
      if(vctDirectionInverted.z <= 0.0) continue;

      float fIntensity = 1.0 - min(1.0, 2.0 * length(vctDirectionInverted.xy) / vctDirectionInverted.z);    //Coneshape that is brightest in the center. Possible TODO: "Variable Spotlightsoftness"
      fIntensity *= 1.0 - pow(vctDirectionInverted.z, 2.0);                                                 //Prevents harsh lighting artifacts at boundary of the given spotlight
      if(fIntensity < 0.0) continue;

      illuminateDirected(vctDirection, vctView, vctNormal, u_spot[i].vctColor.rgb * fIntensity, v_vctDiffuse, v_vctSpecular);
    }

  #endif

    // TEXTURE: transform UVs
  #if defined(TEXTURE) || defined(NORMALMAP)

    v_vctTexture = vec2(u_mtxPivot * vec3(a_vctTexture, 1.0)).xy;

  #endif

  #if defined(MATCAP)

    vec4 vctVertexInCamera = normalize(u_mtxWorldToCamera * vctPosition);
    vctVertexInCamera.xy *= - 1.0;
    mat4 mtx_RotX = mat4(1, 0, 0, 0, 0, vctVertexInCamera.z, vctVertexInCamera.y, 0, 0, - vctVertexInCamera.y, vctVertexInCamera.z, 0, 0, 0, 0, 1);
    mat4 mtx_RotY = mat4(vctVertexInCamera.z, 0, - vctVertexInCamera.x, 0, 0, 1, 0, 0, vctVertexInCamera.x, 0, vctVertexInCamera.z, 0, 0, 0, 0, 1);

    vec3 vctNormal = mat3(u_mtxNormalMeshToWorld) * a_vctNormal;

    // adds correction for things being far and to the side, but distortion for things being close
    vctNormal = mat3(mtx_RotX * mtx_RotY) * vctNormal;

    vec3 vctReflection = normalize(mat3(u_mtxWorldToCamera) * normalize(vctNormal));
    vctReflection.y = - vctReflection.y;

    v_vctTexture = 0.5 * vctReflection.xy + 0.5;

  #endif
}`;

}