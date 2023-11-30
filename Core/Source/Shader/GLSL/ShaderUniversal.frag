#version 300 es
/**
* Universal Shader as base for many others. Controlled by compiler directives
* @authors Jirka Dell'Oro-Friedl, HFU, 2021 | Jonas Plotzky, HFU, 2023
*/

precision mediump float;
precision highp int;

// MINIMAL
uniform vec4 u_vctColor;
uniform vec3 u_vctCamera;

uniform bool u_bFog; // TODO: maybe make fog optional?
uniform vec4 u_vctFogColor;
uniform float u_fFogNear;
uniform float u_fFogFar;

in vec4 v_vctColor;
in vec3 v_vctPosition;

layout(location = 0) out vec4 vctFrag;
layout(location = 1) out vec4 vctFragPosition; // TODO: make these optional?
layout(location = 2) out vec4 vctFragNormal;

#ifdef LIGHT

  #if !defined(PHONG) && !defined(FLAT)

    uniform float u_fMetallic;
    in vec3 v_vctDiffuse;
    in vec3 v_vctSpecular;

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

#endif

#if defined(TEXTURE) || defined(MATCAP)

  uniform sampler2D u_texColor;
  in vec2 v_vctTexture;

#endif

#ifdef NORMALMAP

  uniform sampler2D u_texNormal;
  in vec3 v_vctTangent;
  in vec3 v_vctBitangent;

#endif

#if defined(PHONG) || defined(FLAT)

  uniform float u_fDiffuse;
  uniform float u_fSpecular;
  uniform float u_fIntensity;
  uniform float u_fMetallic;

  #ifdef PHONG

    in vec3 v_vctNormal;

  #endif

  #ifdef FLAT

    flat in vec3 v_vctPositionFlat;

  #endif

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

float getFog(vec3 _vctPosition) {
  float fDistance = length(_vctPosition - u_vctCamera); // maybe use z-depth instead of euclidean depth
  float fFog = clamp((fDistance - u_fFogNear) / (u_fFogFar - u_fFogNear), 0.0, 1.0);
  fFog = -pow(fFog, 2.0) + (2.0 * fFog); // lets fog appear quicker and fall off slower results in a more gradual falloff
  return fFog;
}

void main() {

  #if !defined(PHONG) && !defined(FLAT)

    vec3 vctNormal = normalize(cross(dFdx(v_vctPosition), dFdy(v_vctPosition))); // TODO: buffer this

  #endif

  #ifdef PHONG

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
  
  #ifdef LIGHT

    #if defined(PHONG) || defined(FLAT) // PHONG AND FLAT

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

    #else
      // GOURAUD
      vec3 vctDiffuse = v_vctDiffuse;
      vec3 vctSpecular = v_vctSpecular;

    #endif

    vctFrag.rgb = vctDiffuse + vctSpecular * u_fMetallic;
    vctFrag.a = 1.0;

  #endif

  #if !defined(LIGHT) && !defined(PHONG) && !defined(FLAT)

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
    vctFrag.rgb += vctSpecular * (1.0 - u_fMetallic);
  
  #endif

  vctFragPosition = vec4(v_vctPosition, 1.0);
  vctFragNormal = vec4(vctNormal, 1.0);

  if (u_bFog) 
    vctFrag.rgb = mix(vctFrag.rgb, u_vctFogColor.rgb, getFog(v_vctPosition) * u_vctFogColor.a);

  vctFrag.rgb *= vctFrag.a;

  // discard pixel alltogether when transparent: don't show in Z-Buffer
  if(vctFrag.a < 0.01)
    discard;
}