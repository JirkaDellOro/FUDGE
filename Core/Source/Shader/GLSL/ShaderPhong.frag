#version 300 es
/**
* Phong shading
* @authors Jirka Dell'Oro-Friedl, HFU, 2022 | Roland Heer, HFU, 2023 | Jonas Plotzky, HFU, 2023
*/

precision mediump float;
precision highp int;

uniform vec4 u_vctColor;
uniform float u_fDiffuse;
uniform float u_fMetallic;
uniform float u_fSpecular;
uniform float u_fIntensity;
uniform vec3 u_vctCamera;

in vec4 v_vctColor;
in vec3 v_vctPosition;

out vec4 vctFrag;

  #if defined(PHONG)
in vec3 v_vctNormal;
  #endif

  #if defined(FLAT)
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
  #if defined(TEXTURE)
in vec2 v_vctTexture;
uniform sampler2D u_texture;
  #endif

  // NORMALMAP: input UVs and texture
  #if defined(NORMALMAP)
in mat3 v_mtxTBN;
in vec2 v_vctNormalMap;
uniform sampler2D u_normalMap;
  #endif

// Returns a vector for visualizing on model. Great for debugging
vec4 showVectorAsColor(vec3 _vector, bool _clamp) {
  if(_clamp) {
    _vector *= 0.5;
    _vector += 0.5;
  }
  return vec4(_vector.x, _vector.y, _vector.z, 1);
}

vec4 calculateReflection(vec3 _vctLight, vec3 _vctView, vec3 _vctNormal, vec4 _vctColor) {
  vec4 vctResult = vec4(0, 0, 0, 1);
  if(u_fSpecular <= 0.0)
    return vctResult;


  //BLINN-Phong Shading
  vec3 halfwayDir = normalize(-_vctLight - _vctView);
  float factor = max(dot(-_vctLight, _vctNormal), 0.0);       //Factor for smoothing out transition from surface facing the lightsource to surface facing away from the lightsource
  factor = 1.0 - (pow(factor - 1.0, 8.0));                            //The factor is altered In Order to clearly see the specular Highlight even at steep angles, while still preventing artifacts

  vctResult += pow(max(dot(_vctNormal, halfwayDir), 0.0), exp2(u_fSpecular * 5.0)) * u_fSpecular * u_fIntensity * factor;
  return vctResult * _vctColor;

  /*
  //normal phong specular - old Shading
  vec3 vctReflection = normalize(reflect(-_vctLight, _vctNormal));
  float fHitCamera = dot(vctReflection, _vctView);
  return vec4(vec3(pow(max(fHitCamera, 0.0), u_fSpecular * 10.0) * u_fSpecular*0.2), 1);
  */
}

vec2 illuminateDirected(vec3 _vctLight, vec3 _vctView, vec3 _vctNormal) {
  vec2 vctResult = vec2(0, 0); // diffuse and specular factor
  vec3 vctLight = normalize(_vctLight);
  float fIllumination = -dot(_vctNormal, vctLight);
  if(fIllumination > 0.0) {
    vctResult.x += u_fDiffuse * fIllumination;

    if(u_fSpecular <= 0.0)
      return vctResult;

    vec3 halfwayDir = normalize(-vctLight - _vctView);
    float factor = max(dot(-vctLight, _vctNormal), 0.0);       //Factor for smoothing out transition from surface facing the lightsource to surface facing away from the lightsource
    factor = 1.0 - (pow(factor - 1.0, 8.0));                    //The factor is altered In Order to clearly see the specular Highlight even at steep angles, while still preventing artifacts

    vctResult.y += pow(max(dot(_vctNormal, halfwayDir), 0.0), exp2(u_fSpecular * 5.0)) * u_fSpecular * u_fIntensity * factor;
  }

  return vctResult;
}

vec4 illuminateDiffuse(vec3 _vctDirection, vec3 _vctNormal, vec4 _vctColor) {
  vec4 vctResult = vec4(0, 0, 0, 1);
  float fIllumination = -dot(_vctNormal, _vctDirection);
  if(fIllumination > 0.0) {
    vctResult += u_fDiffuse * fIllumination * _vctColor;
  }
  
  return vctResult;
}

void main() {
  vec3 vctPosition = v_vctPosition;
  float fMetallic = max(min(u_fMetallic, 1.0), 0.0);
  vec4 vctSpec = vec4(0, 0, 0, 1);

    #if defined(PHONG)
      #if defined(NORMALMAP)
  vec3 vctNormal = v_mtxTBN * (2.0 * texture(u_normalMap, v_vctNormalMap).xyz - 1.0);
      #else
  vec3 vctNormal = normalize(v_vctNormal);
      #endif
  vec3 vctView = normalize(v_vctPosition - u_vctCamera);
    #endif

    #if defined(FLAT)
  vec3 vctXTangent = dFdx(vctPosition);
  vec3 vctYTangent = dFdy(vctPosition);
  vec3 vctNormal = normalize(cross(vctXTangent, vctYTangent));
  vec3 vctView = normalize(v_vctPositionFlat - u_vctCamera);
    #endif

  vctFrag = u_fDiffuse * u_ambient.vctColor;

  // calculate directional light effect
  for(uint i = 0u; i < u_nLightsDirectional; i++) {
    vec3 vctDirection = vec3(u_directional[i].mtxShape * vec4(0.0, 0.0, 1.0, 1.0));
    vec2 vctIllumination = illuminateDirected(vctDirection, vctView, vctNormal);
    vctFrag += vctIllumination.x * u_directional[i].vctColor;
    vctSpec += vctIllumination.y * u_directional[i].vctColor;
    
    // vctDirection = normalize(vctDirection);
    // vctFrag += illuminateDiffuse(vctDirection, vctNormal, u_directional[i].vctColor);
    // vctSpec += calculateReflection(vctDirection, vctView, vctNormal, u_directional[i].vctColor);
  }

  // calculate point light effect
  for(uint i = 0u; i < u_nLightsPoint; i++) {
    vec3 vctPositionLight = vec3(u_point[i].mtxShape * vec4(0.0, 0.0, 0.0, 1.0));
    vec3 vctDirection = vctPosition - vctPositionLight;
    float fIntensity = 1.0 - length(mat3(u_point[i].mtxShapeInverse) * vctDirection);

    if(fIntensity < 0.0)
      continue;

    vec2 vctIllumination = illuminateDirected(vctDirection, vctView, vctNormal);
    vec4 vctColor = u_point[i].vctColor * fIntensity;
    vctFrag += vctIllumination.x * vctColor;
    vctSpec += vctIllumination.y * vctColor;

    // vctDirection = normalize(vctDirection);
    // vctSpec += calculateReflection(vctDirection, vctView, vctNormal, vctColor);
    // vctFrag += illuminateDiffuse(vctDirection, vctNormal, vctColor);
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



    vec2 vctIllumination = illuminateDirected(vctDirection, vctView, vctNormal);
    vec4 vctColor = u_spot[i].vctColor * fIntensity;
    vctFrag += vctIllumination.x * vctColor;
    vctSpec += vctIllumination.y * vctColor;

    // float fSpotIntensity = min(1.0, vctDirectionInverted.z * 5.0);                                        //Due to the specular highlight simulating the direct reflection of a given light, it makes sense to calculate the specular highlight only infront of a spotlight however not dependend on the coneshape.
    // vctDirection = normalize(vctDirection);

    // vctSpec += calculateReflection(vctDirection, vctView, vctNormal, fIntensity * u_spot[i].vctColor);
    // vctFrag += illuminateDiffuse(vctDirection, vctNormal, fIntensity * u_spot[i].vctColor);
  }

  vctFrag += vctSpec * fMetallic;
    #if defined(TEXTURE)
  vec4 vctColorTexture = texture(u_texture, v_vctTexture);
  vctFrag *= vctColorTexture;
    #endif  
  vctFrag *= u_vctColor * v_vctColor;
  vctFrag += vctSpec * (1.0 - fMetallic);

}