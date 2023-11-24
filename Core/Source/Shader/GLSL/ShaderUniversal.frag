#version 300 es
/**
* Universal Shader as base for many others. Controlled by compiler directives
* @authors Jirka Dell'Oro-Friedl, HFU, 2021 | Jonas Plotzky, HFU, 2023
*/

precision mediump float;
precision highp int;

// MINIMAL (no define needed): include base color
uniform vec4 u_vctColor;
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

float getFog(vec3 _vctPosition) {
  float fDistance = length(_vctPosition - u_vctCamera); // maybe use z-depth instead of euclidean depth
  float fFog = clamp((fDistance - u_fFogNear) / (u_fFogFar - u_fFogNear), 0.0, 1.0);
  fFog = -pow(fFog, 2.0) + (2.0 * fFog); // lets fog appear quicker and fall off slower results in a more gradual falloff
  return fFog;
}

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

  vctFragPosition = vec4(v_vctPosition, 1.0);
  vctFragNormal = vec4(normalize(cross(dFdx(v_vctPosition), dFdy(v_vctPosition))), 1.0);

  if (u_bFog) 
    vctFrag.rgb = mix(vctFrag.rgb, u_vctFogColor.rgb, getFog(v_vctPosition) * u_vctFogColor.a);

  vctFrag.rgb *= vctFrag.a;

  // discard pixel alltogether when transparent: don't show in Z-Buffer
  if(vctFrag.a < 0.01)
    discard;
}