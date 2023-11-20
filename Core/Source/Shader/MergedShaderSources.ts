namespace FudgeCore {
  export let shaderSources: {[source: string]: string} = {};
  shaderSources["ShaderAmbientOcclusion.frag"] = /*glsl*/ `#version 300 es
/**
 * Calculates ambient occlusion for a given fragment
 * @authors Jonas Plotzky, HFU, 2023
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

uniform sampler2D u_texPosition; // world space position
uniform sampler2D u_texNormal; // world space normal
uniform sampler2D u_texNoise;
// uniform sampler2D u_texDepth;

in vec2 v_vctTexture;

out vec4 vctFrag;

// Both of these functions could be used to calculate the position from the depth texture, but mobile devices seems to lack in precision to do this
// vec3 getPosition(vec2 _vctTexture) {
//   float fDepth = texture(u_texDepth, _vctTexture).r;
//   vec4 clipSpacePosition = vec4(_vctTexture * 2.0 - 1.0, fDepth * 2.0 - 1.0, 1.0);
//   vec4 worldSpacePosition = u_mtxViewProjectionInverse * clipSpacePosition;
//   return worldSpacePosition.xyz / worldSpacePosition.w;
// }

float getOcclusion(vec3 _vctPosition, vec3 _vctNormal, vec2 _vctTexture) {
  vec3 vctOccluder = texture(u_texPosition, _vctTexture).xyz;
  vec3 vctDistance = vctOccluder - _vctPosition;
  float fIntensity = max(dot(_vctNormal, normalize(vctDistance)) - u_fBias, 0.0);

  float fDistance = length(vctDistance);
  float fAttenuation = 1.0 / (u_fAttenuationConstant + u_fAttenuationLinear * fDistance + u_fAttenuationQuadratic * fDistance * fDistance);

  return fIntensity * fAttenuation;
}

void main() {
  vec3 vctPosition = texture(u_texPosition, v_vctTexture).xyz;
  vec3 vctNormal = texture(u_texNormal, v_vctTexture).xyz;
  vec2 vctRandom = normalize(texture(u_texNoise, v_vctTexture).xy * 2.0 - 1.0);
  float fDepth = (length(vctPosition - u_vctCamera) - u_fNear) / (u_fFar - u_fNear); // linear euclidean depth in range [0,1] TODO: when changing to view space, don't subtract camera position
  float fKernelRadius = u_fSampleRadius * (1.0 - fDepth);

  float fOcclusion = 0.0;
  for(int i = 0; i < 4; ++i) {
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

  // vctFrag.rgb = vctNormal;
  vctFrag.r = clamp(fOcclusion / 16.0, 0.0, 1.0);
  vctFrag.a = 1.0;
}`;
  shaderSources["ShaderDownsample.frag"] = /*glsl*/ `#version 300 es
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
uniform mat4 u_mtxWorldToCamera;

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

void illuminateDirected(vec3 _vctDirection, vec3 _vctView, vec3 _vctNormal, vec3 _vctColor, out vec3 _vctDiffuse, out vec3 _vctSpecular) {
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

  // write into fragment buffers TODO: do this in vertex shader
  // vctFragNormal = vec4(normalize(mat3(u_mtxWorldToCamera) * vctNormal), 1.0); // maybe do all shading in view space so we can move this to the vertex shader
  // vctFragPosition = u_mtxWorldToCamera * vec4(vctPosition, 1.0);

  vctFragPosition = vec4(v_vctPosition, 1.0); // don't use flat here, because we want to interpolate the position
  vctFragNormal = vec4(vctNormal, 1.0);

  if (u_bFog) {
    float distance = length(vctPosition - u_vctCamera); // maybe use z-depth instead of euclidean depth
    float fogAmount = min(max((distance - u_fFogNear) / (u_fFogFar - u_fFogNear), 0.0), 1.0);
    fogAmount = -pow(fogAmount, 2.0) + (2.0 * fogAmount); //lets Fog appear quicker and fall off slower results in a more gradual falloff
    vctFrag = mix(vctFrag, vec4(u_vctFogColor.rgb, 1.0f), fogAmount * u_vctFogColor.a);
  }

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
    v_vctTexture = vec2(u_mtxPivot * vec3(a_vctTexture, 1.0)).xy;
}`;
  shaderSources["ShaderScreen.frag"] = /*glsl*/ `#version 300 es
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
    vctFrag += (texture(u_texBloom, v_vctTexture) * u_fBloomIntensity);

    float r = max(vctFrag.r - 1.0, 0.0) * u_fHighlightDesaturation;
    float g = max(vctFrag.g - 1.0, 0.0) * u_fHighlightDesaturation;
    float b = max(vctFrag.b - 1.0, 0.0) * u_fHighlightDesaturation;

    vctFrag.r += g + b;
    vctFrag.g += r + b;
    vctFrag.b += r + g;
  }

  // blend by ONE, ONE_MINUS_SRC_ALPHA for premultiplied alpha from color shading
  vec4 vctTransparent = texelFetch(u_texTransparent, vctFragCoord, 0);
  vctFrag.rgb = vctTransparent.rgb + (vctFrag.rgb * (1.0 - vctTransparent.a));
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

// MINIMAL (no define needed): include base color
uniform vec4 u_vctColor;

in vec4 v_vctColor;

layout(location = 0) out vec4 vctFrag;
layout(location = 1) out vec4 vctFragPosition;
layout(location = 2) out vec4 vctFragNormal;

// LIGHT: include light parameters
#ifdef LIGHT

  uniform float u_fMetallic;
  in vec3 v_vctDiffuse;
  in vec3 v_vctSpecular;

#endif

// TEXTURE: input UVs and texture
#if defined(TEXTURE) || defined(MATCAP)

  in vec2 v_vctTexture;
  uniform sampler2D u_texColor;

#endif

void main() {
  
  #ifdef LIGHT

    vctFrag.rgb = v_vctDiffuse + v_vctSpecular * u_fMetallic;
    vctFrag.a = 1.0;

  #else

    // MINIMAL: set the base color
    vctFrag = u_vctColor * v_vctColor;

  #endif

  #if defined(TEXTURE) || defined(MATCAP)
    
    // TEXTURE: multiply with texel color
    vec4 vctColorTexture = texture(u_texColor, v_vctTexture);
    vctFrag *= vctColorTexture;

  #endif

  #ifdef LIGHT

    vctFrag *= u_vctColor * v_vctColor;
    vctFrag.rgb += v_vctSpecular * (1.0 - u_fMetallic);
  
  #endif

  vctFrag.rgb *= vctFrag.a;

  // for now just pass nothing as normal
  vctFragPosition = vec4(0.0);
  vctFragNormal = vec4(0.0); 

  // discard pixel alltogether when transparent: don't show in Z-Buffer
  if(vctFrag.a < 0.01)
    discard;
}`;
  shaderSources["ShaderUniversal.vert"] = /*glsl*/ `#version 300 es
/**
* Universal Shader as base for many others. Controlled by compiler directives
* @authors 2021, Luis Keck, HFU, 2021 | Jirka Dell'Oro-Friedl, HFU, 2021 | Jonas Plotzky, HFU, 2023
*/

precision mediump float;
precision highp int;

  // MINIMAL (no define needed): buffers for transformation
uniform mat4 u_mtxMeshToView;
in vec3 a_vctPosition;
// TODO: think about making vertex color optional
in vec4 a_vctColor;
out vec4 v_vctColor;

  // PARTICLE: offer buffer and functionality for in shader position calculation
  // CAMERA: offer buffer and functionality for specular reflection depending on the camera-position
  #if defined(CAMERA) || defined(PARTICLE)
uniform mat4 u_mtxMeshToWorld;
uniform vec3 u_vctCamera;
  #endif

  // LIGHT: offer buffers for lighting vertices with different light types
  #if defined(LIGHT)
uniform mat4 u_mtxNormalMeshToWorld;
uniform float u_fDiffuse;
uniform float u_fSpecular;
uniform float u_fIntensity;
in vec3 a_vctNormal;

    #if !defined(PHONG) && !defined(FLAT) // gouraud
out vec3 v_vctDiffuse;
out vec3 v_vctSpecular;
    #endif

    #if defined(NORMALMAP)
in vec4 a_vctTangent;
out vec3 v_vctTangent;
out vec3 v_vctBitangent;
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
  Light u_ambient;
  Light u_directional[MAX_LIGHTS_DIRECTIONAL];
  Light u_point[MAX_LIGHTS_POINT];
  Light u_spot[MAX_LIGHTS_SPOT];
};

void illuminateDirected(vec3 _vctDirection, vec3 _vctView, vec3 _vctNormal, vec3 _vctColor, out vec3 _vctDiffuse, out vec3 _vctSpecular) {
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

  // TEXTURE and NORMALMAP: texture coordinates for texturemaps
  #if defined(TEXTURE) || defined(NORMALMAP)
uniform mat3 u_mtxPivot;
in vec2 a_vctTexture;
out vec2 v_vctTexture;
  #endif

  // MATCAP: offer buffers for UVs and pivot matrix
  #if defined(MATCAP) // MatCap-shader generates texture coordinates from surface normals
in vec3 a_vctNormal;
uniform mat4 u_mtxNormalMeshToWorld;
uniform mat4 u_mtxWorldToCamera; // view matrix
out vec2 v_vctTexture;
  #endif

  #if defined(PHONG)
out vec3 v_vctNormal;
out vec3 v_vctPosition;
  #endif

  #if defined(FLAT)
out vec3 v_vctPosition;
flat out vec3 v_vctPositionFlat;
  #endif

  #if defined(SKIN)
uniform mat4 u_mtxWorldToView; // view projection matrix?
// Bones
// https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/skinning_pars_vertex.glsl.js
in uvec4 a_vctBones;
in vec4 a_vctWeights;
const uint MAX_BONES = 256u; // CAUTION: this number must be the same as in RenderInjectorSkeletonInstance where the corresponding buffers are created
layout(std140) uniform Skin {
mat4 u_mtxBones[MAX_BONES];
};
  #endif

  #if defined(PARTICLE)
uniform mat4 u_mtxWorldToView; // view projection matrix?
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
  #endif // PARTICLE

void main() {
  vec4 vctPosition = vec4(a_vctPosition, 1.0);

    #if defined(CAMERA) || defined(PARTICLE) || defined(SKIN) || defined(MATCAP)
  mat4 mtxMeshToWorld = u_mtxMeshToWorld;
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
  mat4 mtxMeshToView = u_mtxWorldToView * mtxMeshToWorld;
    #else
  mat4 mtxMeshToView = u_mtxMeshToView;
    #endif

    #if defined(LIGHT) || defined(MATCAP)
      vec3 vctNormal = a_vctNormal;
      #if defined(PARTICLE)
  mat4 mtxNormalMeshToWorld = transpose(inverse(mtxMeshToWorld));
      #else
  mat4 mtxNormalMeshToWorld = u_mtxNormalMeshToWorld;
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

  v_vctColor = a_vctColor;

    #if defined(PARTICLE_COLOR)
  v_vctColor *= /*$color*/;
    #endif

    #if defined(CAMERA) || defined(MATCAP)
  vec3 vctView = normalize(vec3(mtxMeshToWorld * vctPosition) - u_vctCamera);
    #endif

    #if defined(LIGHT) // light
      vctNormal = mat3(mtxNormalMeshToWorld) * vctNormal;

      #if defined(PHONG)
  v_vctNormal = vctNormal; // pass normal to fragment shader
  v_vctPosition = vec3(mtxMeshToWorld * vctPosition);
      #endif

      #if defined(FLAT)
  v_vctPosition = vec3(mtxMeshToWorld * vctPosition);
  v_vctPositionFlat = v_vctPosition;
      #endif

      #if defined(NORMALMAP)
  v_vctTangent = mat3(mtxNormalMeshToWorld) * a_vctTangent.xyz;
  v_vctBitangent = cross(vctNormal, v_vctTangent) * a_vctTangent.w;
      #endif

      #if !defined(PHONG) && !defined(FLAT) // gouraud
  vctNormal = normalize(vctNormal);
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
  vec3 vctDirection = vec3(mtxMeshToWorld * vctPosition) - vctPositionLight;
  float fIntensity = 1.0 - length(mat3(u_point[i].mtxShapeInverse) * vctDirection);
  if(fIntensity < 0.0) continue;

  illuminateDirected(vctDirection, vctView, vctNormal, u_point[i].vctColor.rgb * fIntensity, v_vctDiffuse, v_vctSpecular);
}

  // calculate spot light effect
for(uint i = 0u;i < u_nLightsSpot;i ++) {
  vec3 vctPositionLight = vec3(u_spot[i].mtxShape * vec4(0.0, 0.0, 0.0, 1.0));
  vec3 vctDirection = vec3(mtxMeshToWorld * vctPosition) - vctPositionLight;
  vec3 vctDirectionInverted = mat3(u_spot[i].mtxShapeInverse) * vctDirection;
  if(vctDirectionInverted.z <= 0.0) continue;

  float fIntensity = 1.0 - min(1.0, 2.0 * length(vctDirectionInverted.xy) / vctDirectionInverted.z);    //Coneshape that is brightest in the center. Possible TODO: "Variable Spotlightsoftness"
  fIntensity *= 1.0 - pow(vctDirectionInverted.z, 2.0);                                                 //Prevents harsh lighting artifacts at boundary of the given spotlight
  if(fIntensity < 0.0) continue;

  illuminateDirected(vctDirection, vctView, vctNormal, u_spot[i].vctColor.rgb * fIntensity, v_vctDiffuse, v_vctSpecular);
}
      #endif // gouraud
    #endif // light

    // TEXTURE: transform UVs
    #if defined(TEXTURE) || defined(NORMALMAP)
  v_vctTexture = vec2(u_mtxPivot * vec3(a_vctTexture, 1.0)).xy;
    #endif

    #if defined(MATCAP)
  vec4 vctVertexInCamera = normalize(u_mtxWorldToCamera * vctPosition);
  vctVertexInCamera.xy *= - 1.0;
  mat4 mtx_RotX = mat4(1, 0, 0, 0, 0, vctVertexInCamera.z, vctVertexInCamera.y, 0, 0, - vctVertexInCamera.y, vctVertexInCamera.z, 0, 0, 0, 0, 1);
  mat4 mtx_RotY = mat4(vctVertexInCamera.z, 0, - vctVertexInCamera.x, 0, 0, 1, 0, 0, vctVertexInCamera.x, 0, vctVertexInCamera.z, 0, 0, 0, 0, 1);

  vctNormal = mat3(u_mtxNormalMeshToWorld) * a_vctNormal;

    // adds correction for things being far and to the side, but distortion for things being close
  vctNormal = mat3(mtx_RotX * mtx_RotY) * vctNormal;

  vec3 vctReflection = normalize(mat3(u_mtxWorldToCamera) * normalize(vctNormal));
  vctReflection.y = - vctReflection.y;

  v_vctTexture = 0.5 * vctReflection.xy + 0.5;
    #endif
}`;
  shaderSources["ShaderUpsample.frag"] = /*glsl*/ `#version 300 es
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
}`;

}