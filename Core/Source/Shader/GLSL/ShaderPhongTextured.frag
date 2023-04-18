#version 300 es
/**
* Phong shading
* @authors Jirka Dell'Oro-Friedl, HFU, 2022 || Roland Heer, HFU, 2023
*/

precision mediump float;
precision highp int;

uniform vec4 u_vctColor;
uniform float u_fDiffuse;
uniform float u_fSpecular;
uniform mat4 u_mtxMeshToWorld;
uniform vec3 u_vctCamera;

in vec4 v_vctColor;
in vec4 v_vctPosition;
in vec3 v_vctNormal;
out vec4 vctFrag;

struct Light {
  vec4 vctColor;
  mat4 mtxShape;
  mat4 mtxShapeInverse;
};

const uint MAX_LIGHTS_DIRECTIONAL = 10u;
const uint MAX_LIGHTS_POINT = 50u;
const uint MAX_LIGHTS_SPOT = 50u;
const bool metallic = false;

uniform Light u_ambient;
uniform uint u_nLightsDirectional;
uniform Light u_directional[MAX_LIGHTS_DIRECTIONAL];
uniform uint u_nLightsPoint;
uniform Light u_point[MAX_LIGHTS_POINT];
uniform uint u_nLightsSpot;
uniform Light u_spot[MAX_LIGHTS_SPOT];

// TEXTURE: input UVs and texture
#if defined(TEXTURE) || defined(MATCAP)
  in vec2 v_vctTexture;
  uniform sampler2D u_texture;
#endif

float calculateReflection(vec3 _vctLight, vec3 _vctView, vec3 _vctNormal, float _fSpecular) {
  if(_fSpecular <= 0.0)
    return 0.0;
  vec3 vctReflection = normalize(reflect(-_vctLight, _vctNormal));
  float fHitCamera = dot(vctReflection, _vctView);
  return pow(max(fHitCamera, 0.0), _fSpecular * 10.0) * _fSpecular; // 10.0 = magic number, looks good... 
  
  // attempted BLINN 
  //vec3 halfwayDir = normalize(_vctLight + _vctView);
  //float fHitCamera = dot(_vctNormal, halfwayDir);
  //return pow(max(fHitCamera, 0.0), 16.0);
}

vec4 illuminateDirected(vec3 _vctDirection, vec3 _vctNormal, vec4 _vctColor, vec3 _vctView, float _fSpecular, bool _metallic) {
  vec4 vctResult = vec4(0, 0, 0, 1);
  vec3 vctDirection = normalize(_vctDirection);
  float fIllumination = -dot(_vctNormal, vctDirection);
  
  if(fIllumination > 0.0f) {
    vctResult += u_fDiffuse * fIllumination * _vctColor;
    float fReflection = 0.0;
    if(_metallic){
      fReflection = calculateReflection(vctDirection, _vctView, _vctNormal, _fSpecular);;
    }
    vctResult += fReflection * _vctColor;
  }
  return vctResult;
}

vec4 calculateSpecularOnly(vec3 _vctDirection, vec3 _vctNormal, vec3 _vctView, float _fSpecular){
  vec4 vctResult = vec4(0, 0, 0, 1);
  vec3 vctDirection = normalize(_vctDirection);
  float fIllumination = -dot(_vctNormal, vctDirection);
  
  if(fIllumination > 0.0f) {
    float fReflection = calculateReflection(vctDirection, _vctView, _vctNormal, _fSpecular);
    vctResult += fReflection;
  }
  return vctResult;
}

void main() {
  vctFrag = v_vctColor;

  vec3 vctView = normalize(vec3(u_mtxMeshToWorld * v_vctPosition) - u_vctCamera);

  // calculate directional light effect
  for(uint i = 0u; i < u_nLightsDirectional; i++) {
    vec3 vctDirection = vec3(u_directional[i].mtxShape * vec4(0.0, 0.0, 1.0, 1.0));
    vctFrag += illuminateDirected(vctDirection, v_vctNormal, u_directional[i].vctColor, vctView, u_fSpecular, metallic);
  }
  
  // calculate point light effect
  for(uint i = 0u; i < u_nLightsPoint; i++) {
    vec3 vctPositionLight = vec3(u_point[i].mtxShape * vec4(0.0, 0.0, 0.0, 1.0));
    vec3 vctDirection = vec3(u_mtxMeshToWorld * v_vctPosition) - vctPositionLight;
    float fIntensity = 1.0 - length(mat3(u_point[i].mtxShapeInverse) * vctDirection);
    if(fIntensity < 0.0)
      continue;
    vctFrag += illuminateDirected(vctDirection, v_vctNormal, fIntensity * u_point[i].vctColor, vctView, u_fSpecular, metallic);
  }
  // calculate spot light effect
  for(uint i = 0u; i < u_nLightsSpot; i++) {
    vec3 vctPositionLight = vec3(u_spot[i].mtxShape * vec4(0.0, 0.0, 0.0, 1.0));
    vec3 vctDirection = vec3(u_mtxMeshToWorld * v_vctPosition) - vctPositionLight;
    vec3 vctDirectionInverted = mat3(u_spot[i].mtxShapeInverse) * vctDirection;
    if(vctDirectionInverted.z <= 0.0)
      continue;
    float fIntensity = 1.0 - min(1.0, 2.0 * length(vctDirectionInverted.xy) / vctDirectionInverted.z);
    fIntensity *= 1.0 - pow(vctDirectionInverted.z, 2.0);
    if(fIntensity < 0.0)
      continue;
    vctFrag += illuminateDirected(vctDirection, v_vctNormal, fIntensity * u_spot[i].vctColor, vctView, u_fSpecular, metallic);
  }
  // TEXTURE: multiply with texel color
  #if defined(TEXTURE) || defined(MATCAP)
  vec4 vctColorTexture = texture(u_texture, v_vctTexture);
  vctFrag *= vctColorTexture;
  #endif

  if(!metallic){
    // calculate directional light effect
    for(uint i = 0u; i < u_nLightsDirectional; i++) {
      vec3 vctDirection = vec3(u_directional[i].mtxShape * vec4(0.0, 0.0, 1.0, 1.0));
      vctFrag += calculateSpecularOnly(vctDirection, v_vctNormal, vctView, u_fSpecular);
    }
  
    // calculate point light effect
    for(uint i = 0u; i < u_nLightsPoint; i++) {
      vec3 vctPositionLight = vec3(u_point[i].mtxShape * vec4(0.0, 0.0, 0.0, 1.0));
      vec3 vctDirection = vec3(u_mtxMeshToWorld * v_vctPosition) - vctPositionLight;
      vctFrag += calculateSpecularOnly(vctDirection, v_vctNormal, vctView, u_fSpecular);
    }
    //calculate spot light specular highlight
    for(uint i = 0u; i < u_nLightsSpot; i++) {
      vec3 vctPositionLight = vec3(u_spot[i].mtxShape * vec4(0.0, 0.0, 0.0, 1.0));
      vec3 vctDirection = vec3(u_mtxMeshToWorld * v_vctPosition) - vctPositionLight;
      vec3 vctDirectionInverted = mat3(u_spot[i].mtxShapeInverse) * vctDirection;
      if(vctDirectionInverted.z <= 0.0)
        continue;
      vctFrag += calculateSpecularOnly(vctDirection, v_vctNormal, vctView, u_fSpecular);
    }
  }
}