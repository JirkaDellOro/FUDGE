namespace FudgeCore {
  export let shaderSources: {[source: string]: string} = {};
  shaderSources["ShaderAmbientOcclusion..frag"] = `#version 300 es
/**
*Calculates AO based on depthmap
*@authors Roland Heer, HFU, 2023 | Jirka Dell'Oro-Friedl, HFU, 2023
*/
precision mediump float;
precision highp int;

uniform float u_nearPlane;
uniform float u_farPlane;

in vec3 v_vctCamera;
in mat4 v_mtxMeshToWorld;
in vec4 v_vctPosition;

out vec4 vctFrag;

void main() {
    float dist = length((v_mtxMeshToWorld * v_vctPosition).xyz - v_vctCamera);
    float fogAmount = min(max((dist - u_nearPlane) / (u_farPlane - u_nearPlane), 0.0),1.0);
    vec3 fog = vec3(-pow(fogAmount, 2.0) + (2.0 * fogAmount)); //lets Fog appear quicker and fall off slower results in a more gradual falloff
    vctFrag = vec4(fog, 1.0);
}
`;
  shaderSources["ShaderAmbientOcclusion.vert"] = `#version 300 es

/**
* AO Vertex - Shader. Sets Values for AO Fragment - Shader
* @authors 2023, Roland Heer, HFU, 2023 | Jirka Dell'Oro-Friedl, HFU, 2023
*/

uniform vec3 u_vctCamera;
uniform mat4 u_mtxMeshToView;
uniform mat4 u_mtxMeshToWorld;
in vec3 a_vctPosition;

out vec4 v_vctPosition;
out mat4 v_mtxMeshToWorld;
out vec3 v_vctCamera;

void main() {
    vec4 vctPosition = vec4(a_vctPosition, 1.0);
    mat4 mtxMeshToView = u_mtxMeshToView;
    v_mtxMeshToWorld = u_mtxMeshToWorld;
    v_vctCamera = u_vctCamera;
    gl_Position = mtxMeshToView * vctPosition;
    v_vctPosition = vctPosition;
}`;
  shaderSources["ShaderBloom.frag"] = `#version 300 es
/**
*Calculates bloom based on shaded render 
*@authors Roland Heer, HFU, 2023 | Jirka Dell'Oro-Friedl, HFU, 2023
*/
precision mediump float;
precision highp int;

out vec4 vctFrag;

void main() {
    
}
`;
  shaderSources["ShaderBloom.vert"] = `#version 300 es

/**
* Bloom Vertex - Shader. Sets Values for Bloom Fragment - Shader
* @authors 2023, Roland Heer, HFU, 2023 | Jirka Dell'Oro-Friedl, HFU, 2023
*/

uniform vec3 u_vctCamera;
uniform mat4 u_mtxMeshToView;
uniform mat4 u_mtxMeshToWorld;
in vec3 a_vctPosition;

out vec4 v_vctPosition;
out mat4 v_mtxMeshToWorld;
out vec3 v_vctCamera;

void main() {
    vec4 vctPosition = vec4(a_vctPosition, 1.0);
    mat4 mtxMeshToView = u_mtxMeshToView;
    v_mtxMeshToWorld = u_mtxMeshToWorld;
    v_vctCamera = u_vctCamera;
    gl_Position = mtxMeshToView * vctPosition;
    v_vctPosition = vctPosition;
}`;
  shaderSources["ShaderDownsample.frag"] = `#version 300 es
/**
*Downsamples a given Texture to the current FBOs Texture
*@authors Roland Heer, HFU, 2023 | Jirka Dell'Oro-Friedl, HFU, 2023
*/
precision mediump float;
precision highp int;

in vec2 v_vctTexture;
in vec2[9] v_vctOffsets;
uniform sampler2D u_texture;
uniform float u_threshold;
uniform float u_lvl;

float altGaussianKernel[9] = float[](0.04f, 0.044f, 0.04f, 0.122f, 0.332f, 0.122f, 0.05f, 0.2f, 0.05f);

out vec4 vctFrag;

void main() {
    vec4 tex1 = vec4(0.0f);
    for(int i = 0; i < 9; i++) {
        tex1 += vec4(texture(u_texture, v_vctTexture + v_vctOffsets[i]) * altGaussianKernel[i]);
    }
    if(u_lvl < 1.0f) {
        tex1 -= u_threshold;
        tex1 /= 1.0f - u_threshold;
        float averageBrightness = (tex1.r + tex1.g + tex1.b) / 3.0f;
        tex1 = tex1 * averageBrightness * 2.0f;
    }
    tex1 *= 1.0f + (u_lvl * 0.4f);
    vctFrag = tex1;
}`;
  shaderSources["ShaderDownsample.vert"] = `#version 300 es
/**
* ShaderDownsample sets Values for Downsampling Fragmentshader
* @authors 2023, Roland Heer, HFU, 2023 | Jirka Dell'Oro-Friedl, HFU, 2023
*/
in vec2 a_vctPosition;
in vec2 a_vctTexture;

uniform float u_width;
uniform float u_height;

out vec2 v_vctTexture;
out vec2[9] v_vctOffsets;

void main() {
    gl_Position = vec4(a_vctPosition, 0.0f, 1.0f);
    v_vctTexture = a_vctTexture;

    vec2 offset = vec2(1.0f / u_width, 1.0f / u_height);

    v_vctOffsets = vec2[]
    (
        vec2(-offset.x, offset.y),  vec2(0.0, offset.y),  vec2(offset.x, offset.y),
        vec2(-offset.x, 0.0),       vec2(0.0, 0.0),       vec2(offset.x, 0.0),
        vec2(-offset.x, -offset.y), vec2(0.0, offset.y),  vec2(-offset.x, -offset.y)
    );
}`;
  shaderSources["ShaderMist.frag"] = `#version 300 es
/**
*Calculates depth from camera based on near- and farplane
*@authors Roland Heer, HFU, 2023 | Jirka Dell'Oro-Friedl, HFU, 2023
*/
precision mediump float;
precision highp int;

uniform float u_nearPlane;
uniform float u_farPlane;

in vec3 v_vctCamera;
in mat4 v_mtxMeshToWorld;
in vec4 v_vctPosition;

out vec4 vctFrag;

void main() {
    float dist = length((v_mtxMeshToWorld * v_vctPosition).xyz - v_vctCamera);
    float fogAmount = min(max((dist - u_nearPlane) / (u_farPlane - u_nearPlane), 0.0),1.0);
    vec3 fog = vec3(-pow(fogAmount, 2.0) + (2.0 * fogAmount)); //lets Fog appear quicker and fall off slower results in a more gradual falloff
    vctFrag = vec4(fog, 1.0);
}
`;
  shaderSources["ShaderMist.vert"] = `#version 300 es

/**
* Mist Vertex - Shader. Sets Values for Mist Fragment - Shader
* @authors 2023, Roland Heer, HFU, 2023 | Jirka Dell'Oro-Friedl, HFU, 2023
*/

uniform vec3 u_vctCamera;
uniform mat4 u_mtxMeshToView;
uniform mat4 u_mtxMeshToWorld;
in vec3 a_vctPosition;

out vec4 v_vctPosition;
out mat4 v_mtxMeshToWorld;
out vec3 v_vctCamera;

void main() {
    vec4 vctPosition = vec4(a_vctPosition, 1.0);
    mat4 mtxMeshToView = u_mtxMeshToView;
    v_mtxMeshToWorld = u_mtxMeshToWorld;
    v_vctCamera = u_vctCamera;
    gl_Position = mtxMeshToView * vctPosition;
    v_vctPosition = vctPosition;
}`;
  shaderSources["ShaderParticle.frag"] = `#version 300 es
/**
* Particle shader similar to lit textured shader
* @authors Jonas Plotzky, HFU, 2022
*/

precision mediump float;

uniform vec4 u_vctColor;
  
  #if defined(PARTICLE_COLOR)
in vec4 v_vctColor;
  #endif

in vec2 v_vctTexture;
uniform sampler2D u_texture;

out vec4 vctFrag;

void main() {
  // TEXTURE: multiply with texel color
  vec4 vctColorTexture = texture(u_texture, v_vctTexture);
  vctFrag = u_vctColor * vctColorTexture;
    #if defined(PARTICLE_COLOR)
  vctFrag *= v_vctColor;
    #endif


  // discard pixel alltogether when transparent: don't show in Z-Buffer
  if(vctFrag.a < 0.01)
    discard;
}`;
  shaderSources["ShaderParticle.vert"] = `#version 300 es
/**
* Particle shader similar to lit textured shader
* @authors Jonas Plotzky, HFU, 2022
*/

uniform mat4 u_mtxMeshToWorld;
uniform mat4 u_mtxWorldToView;
uniform vec3 u_vctCamera;
in vec3 a_vctPosition;

uniform mat3 u_mtxPivot;
in vec2 a_vctTexture;
out vec2 v_vctTexture;

  #if defined(PARTICLE_COLOR)
out vec4 v_vctColor;
  #endif

uniform float u_fParticleSystemSize;
uniform float u_fParticleSystemTime;
uniform sampler2D u_fParticleSystemRandomNumbers;

uniform bool u_bParticleSystemFaceCamera;
uniform bool u_bParticleSystemRestrict;

mat4 lookAt(vec3 _vctTranslation, vec3 _vctTarget) {
  vec3 vctUp = vec3(0.0, 1.0, 0.0);
  vec3 zAxis = normalize(_vctTarget - _vctTranslation);
  vec3 xAxis = normalize(cross(vctUp, zAxis));
  vec3 yAxis = u_bParticleSystemRestrict ? vctUp : normalize(cross(zAxis, xAxis));
  zAxis = u_bParticleSystemRestrict ? normalize(cross(xAxis, vctUp)) : zAxis;

  return mat4(
    xAxis.x, xAxis.y, xAxis.z, 0.0,
    yAxis.x, yAxis.y, yAxis.z, 0.0,
    zAxis.x, zAxis.y, zAxis.z, 0.0,
    _vctTranslation.x,  _vctTranslation.y,  _vctTranslation.z, 1.0
  );
}

void main() {
  vec4 vctPosition = vec4(a_vctPosition, 1.0);
  float fParticleId = float(gl_InstanceID);

  /*$variables*/
  /*$mtxLocal*/
  /*$mtxWorld*/

  mat4 mtxMeshToWorld = /*$mtxWorld*/ u_mtxMeshToWorld /*$mtxLocal*/;
  if (u_bParticleSystemFaceCamera) mtxMeshToWorld = 
    lookAt(vec3(mtxMeshToWorld[3][0], mtxMeshToWorld[3][1], mtxMeshToWorld[3][2]), u_vctCamera) * 
    mat4(
      length(vec3(mtxMeshToWorld[0][0], mtxMeshToWorld[1][0], mtxMeshToWorld[2][0])), 0.0, 0.0, 0.0,
      0.0, length(vec3(mtxMeshToWorld[0][1], mtxMeshToWorld[1][1], mtxMeshToWorld[2][1])), 0.0, 0.0,
      0.0, 0.0, length(vec3(mtxMeshToWorld[0][2], mtxMeshToWorld[1][2], mtxMeshToWorld[2][2])), 0.0,
      0.0, 0.0, 0.0, 1.0
    );

  // calculate position
  gl_Position = u_mtxWorldToView * mtxMeshToWorld * vctPosition;
  v_vctTexture = vec2(u_mtxPivot * vec3(a_vctTexture, 1.0)).xy;
    #if defined(PARTICLE_COLOR)
  v_vctColor = /*$color*/;
    #endif
}`;
  shaderSources["ShaderPhong.frag"] = `#version 300 es
/**
* Phong shading
* @authors Jirka Dell'Oro-Friedl, HFU, 2022 || Roland Heer, HFU, 2023
*/

precision mediump float;
precision highp int;

uniform vec4 u_vctColor;
uniform float u_fDiffuse;
uniform float u_fMetallic;
uniform float u_fSpecular;
uniform float u_fIntensity;
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

uniform uint u_nLightsDirectional;
uniform Light u_directional[MAX_LIGHTS_DIRECTIONAL];
uniform uint u_nLightsPoint;
uniform Light u_point[MAX_LIGHTS_POINT];
uniform uint u_nLightsSpot;
uniform Light u_spot[MAX_LIGHTS_SPOT];

// Returns a vector for visualizing on model. Great for debugging
vec4 showVectorAsColor(vec3 _vector, bool _clamp) {
  if(_clamp) {
    _vector *= 0.5;
    _vector += 0.5;
  }
  return vec4(_vector.x, _vector.y, _vector.z, 1);
}

vec4 calculateReflection(vec3 _vctLight, vec3 _vctView, vec3 _vctNormal, float _fSpecular, vec4 _vctColor) {
  vec4 vctResult = vec4(0, 0, 0, 1);
  if(_fSpecular <= 0.0)
    return vctResult;


  //BLINN-Phong Shading
  vec3 halfwayDir = normalize(-_vctLight - _vctView);
  float factor = max(dot(-_vctLight, _vctNormal), 0.0);       //Factor for smoothing out transition from surface facing the lightsource to surface facing away from the lightsource
  factor = 1.0 - (pow(factor - 1.0, 8.0));                            //The factor is altered In Order to clearly see the specular Highlight even at steep angles, while still preventing artifacts

  vctResult += pow(max(dot(_vctNormal, halfwayDir), 0.0), exp2(_fSpecular * 5.0)) * _fSpecular * u_fIntensity * factor;
  return vctResult * _vctColor;

  /*
  //normal phong specular - old Shading
  vec3 vctReflection = normalize(reflect(-_vctLight, _vctNormal));
  float fHitCamera = dot(vctReflection, _vctView);
  return vec4(vec3(pow(max(fHitCamera, 0.0), _fSpecular * 10.0) * _fSpecular*0.2), 1);
  */
}

vec4 illuminateDiffuse(vec3 _vctDirection, vec3 _vctNormal, vec4 _vctColor) {
  vec4 vctResult = vec4(0, 0, 0, 1);
  float fIllumination = -dot(_vctNormal, _vctDirection);
  if(fIllumination > 0.0f) {
    vctResult += u_fDiffuse * fIllumination * _vctColor;
  }
  return vctResult;
}

void main() {
  float fMetallic = max(min(u_fMetallic, 1.0), 0.0);
  vec4 vctSpec = vec4(0, 0, 0, 1);
  vec3 vctView = normalize(vec3(u_mtxMeshToWorld * v_vctPosition) - u_vctCamera);
  vctFrag += v_vctColor;
  vec3 vctNormal = normalize(v_vctNormal);

  // calculate directional light effect
  for(uint i = 0u; i < u_nLightsDirectional; i++) {
    vec3 vctDirection = normalize(vec3(u_directional[i].mtxShape * vec4(0.0, 0.0, 1.0, 1.0)));
    vctFrag += illuminateDiffuse(vctDirection, vctNormal, u_directional[i].vctColor);
    vctSpec += calculateReflection(vctDirection, vctView, vctNormal, u_fSpecular, u_directional[i].vctColor);
  }

  // calculate point light effect
  for(uint i = 0u; i < u_nLightsPoint; i++) {
    vec3 vctPositionLight = vec3(u_point[i].mtxShape * vec4(0.0, 0.0, 0.0, 1.0));
    vec3 vctDirection = vec3(u_mtxMeshToWorld * v_vctPosition) - vctPositionLight;
    float fIntensity = 1.0 - length(mat3(u_point[i].mtxShapeInverse) * vctDirection);
    vctDirection = normalize(vctDirection);
    vctSpec += calculateReflection(vctDirection, vctView, vctNormal, u_fSpecular, u_point[i].vctColor);

    if(fIntensity < 0.0)
      continue;
    vctFrag += illuminateDiffuse(vctDirection, vctNormal, fIntensity * u_point[i].vctColor);
  }

  // calculate spot light effect
  for(uint i = 0u; i < u_nLightsSpot; i++) {
    vec3 vctPositionLight = vec3(u_spot[i].mtxShape * vec4(0.0, 0.0, 0.0, 1.0));
    vec3 vctDirection = vec3(u_mtxMeshToWorld * v_vctPosition) - vctPositionLight;
    vec3 vctDirectionInverted = mat3(u_spot[i].mtxShapeInverse) * vctDirection;
    if(vctDirectionInverted.z <= 0.0)
      continue;

    float fSpotIntensity = min(1.0, vctDirectionInverted.z * 5.0);                                        //Due to the specular highlight simulating the direct reflection of a given Light, it makes sense to calculate the specular highlight only infront of a spotlight however not dependend on the coneshape.
    vctDirection = normalize(vctDirection);
    vctSpec += calculateReflection(vctDirection, vctView, vctNormal, u_fSpecular, fSpotIntensity * u_spot[i].vctColor);

    float fIntensity = 1.0 - min(1.0, 2.0 * length(vctDirectionInverted.xy) / vctDirectionInverted.z);    //Coneshape that is brightest in the center. Possible Todo: "Variable Spotlightsoftness"
    fIntensity *= 1.0 - pow(vctDirectionInverted.z, 2.0);                                                 //Prevents harsh lighting artifacts at boundary of the given spotlight
    if(fIntensity < 0.0)
      continue;
    vctFrag += illuminateDiffuse(vctDirection, vctNormal, fIntensity * u_spot[i].vctColor);
  }

  vctFrag += vctSpec * fMetallic;
  vctFrag *= u_vctColor;
  vctFrag += vctSpec * (1.0 - fMetallic);
}`;
  shaderSources["ShaderPhongTextured.frag"] = `#version 300 es
/**
* Phong shading
* @authors Jirka Dell'Oro-Friedl, HFU, 2022 || Roland Heer, HFU, 2023
*/

precision mediump float;
precision highp int;

uniform vec4 u_vctColor;
uniform float u_fDiffuse;
uniform float u_fMetallic;
uniform float u_fSpecular;
uniform float u_fIntensity;
uniform mat4 u_mtxMeshToWorld;
uniform vec3 u_vctCamera;

in vec4 v_vctColor;
in vec4 v_vctPosition;
in vec3 v_vctNormal;
in mat3 v_mtxTBN;
out vec4 vctFrag;

struct Light {
  vec4 vctColor;
  mat4 mtxShape;
  mat4 mtxShapeInverse;
};

const uint MAX_LIGHTS_DIRECTIONAL = 10u;
const uint MAX_LIGHTS_POINT = 50u;
const uint MAX_LIGHTS_SPOT = 50u;

uniform uint u_nLightsDirectional;
uniform Light u_directional[MAX_LIGHTS_DIRECTIONAL];
uniform uint u_nLightsPoint;
uniform Light u_point[MAX_LIGHTS_POINT];
uniform uint u_nLightsSpot;
uniform Light u_spot[MAX_LIGHTS_SPOT];

// TEXTURE: input UVs and texture
#if defined(TEXTURE)
in vec2 v_vctTexture;
uniform sampler2D u_texture;
#endif

// NORMALMAP: input UVs and texture
#if defined(NORMALMAP)
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

vec4 calculateReflection(vec3 _vctLight, vec3 _vctView, vec3 _vctNormal, float _fSpecular, vec4 _vctColor) {
  vec4 vctResult = vec4(0, 0, 0, 1);
  if(_fSpecular <= 0.0)
    return vctResult;

  //BLINN-Phong Shading
  vec3 halfwayDir = normalize(-_vctLight - _vctView);
  float factor = max(dot(-_vctLight, _vctNormal), 0.0);       //Factor for smoothing out transition from surface facing the lightsource to surface facing away from the lightsource
  factor = 1.0 - (pow(factor - 1.0, 8.0));                            //The factor is altered In Order to clearly see the specular Highlight even at steep angles, while still preventing artifacts

  vctResult += pow(max(dot(_vctNormal, halfwayDir), 0.0), exp2(_fSpecular * 5.0)) * _fSpecular * u_fIntensity * factor;
  return vctResult * _vctColor;
}

vec4 illuminateDiffuse(vec3 _vctDirection, vec3 _vctNormal, vec4 _vctColor) {
  vec4 vctResult = vec4(0, 0, 0, 1);
  float fIllumination = -dot(_vctNormal, _vctDirection);
  if(fIllumination > 0.0f) {
    vctResult += u_fDiffuse * fIllumination * _vctColor;
  }
  return vctResult;
}

void main() {
  float fMetallic = max(min(u_fMetallic, 1.0), 0.0);
  vec4 vctSpec = vec4(0, 0, 0, 1);
  vec3 vctView = normalize(vec3(u_mtxMeshToWorld * v_vctPosition) - u_vctCamera);
  vctFrag += v_vctColor;

  // calculate NewNormal based on NormalMap
  vec3 vctNormal = normalize(v_vctNormal);
  #if defined(NORMALMAP)
  vctNormal = v_mtxTBN * (2.0 * texture(u_normalMap, v_vctNormalMap).xyz - 1.0);
  #endif

  // calculate directional light effect
  for(uint i = 0u; i < u_nLightsDirectional; i++) {
    vec3 vctDirection = normalize(vec3(u_directional[i].mtxShape * vec4(0.0, 0.0, 1.0, 1.0)));
    vctFrag += illuminateDiffuse(vctDirection, vctNormal, u_directional[i].vctColor);
    vctSpec += calculateReflection(vctDirection, vctView, vctNormal, u_fSpecular, u_directional[i].vctColor);
  }

  // calculate point light effect
  for(uint i = 0u; i < u_nLightsPoint; i++) {
    vec3 vctPositionLight = vec3(u_point[i].mtxShape * vec4(0.0, 0.0, 0.0, 1.0));
    vec3 vctDirection = vec3(u_mtxMeshToWorld * v_vctPosition) - vctPositionLight;
    float fIntensity = 1.0 - length(mat3(u_point[i].mtxShapeInverse) * vctDirection);
    vctDirection = normalize(vctDirection);
    vctSpec += calculateReflection(vctDirection, vctView, vctNormal, u_fSpecular, u_point[i].vctColor);

    if(fIntensity < 0.0)
      continue;
    vctFrag += illuminateDiffuse(vctDirection, vctNormal, fIntensity * u_point[i].vctColor);
  }

  // calculate spot light effect
  for(uint i = 0u; i < u_nLightsSpot; i++) {
    vec3 vctPositionLight = vec3(u_spot[i].mtxShape * vec4(0.0, 0.0, 0.0, 1.0));
    vec3 vctDirection = vec3(u_mtxMeshToWorld * v_vctPosition) - vctPositionLight;
    vec3 vctDirectionInverted = mat3(u_spot[i].mtxShapeInverse) * vctDirection;
    if(vctDirectionInverted.z <= 0.0)
      continue;

    float fSpotIntensity = min(1.0, vctDirectionInverted.z * 5.0);                                        //Due to the specular highlight simulating the direct reflection of a given Light, it makes sense to calculate the specular highlight only infront of a spotlight however not dependend on the coneshape.
    vctDirection = normalize(vctDirection);
    vctSpec += calculateReflection(vctDirection, vctView, vctNormal, u_fSpecular, fSpotIntensity * u_spot[i].vctColor);

    float fIntensity = 1.0 - min(1.0, 2.0 * length(vctDirectionInverted.xy) / vctDirectionInverted.z);    //Coneshape that is brightest in the center. Possible Todo: "Variable Spotlightsoftness"
    fIntensity *= 1.0 - pow(vctDirectionInverted.z, 2.0);                                                 //Prevents harsh lighting artifacts at boundary of the given spotlight
    if(fIntensity < 0.0)
      continue;
    vctFrag += illuminateDiffuse(vctDirection, vctNormal, fIntensity * u_spot[i].vctColor);
  }

  vctFrag += vctSpec * fMetallic;
  // TEXTURE: multiply with texel color
  #if defined(TEXTURE)
  vec4 vctColorTexture = texture(u_texture, v_vctTexture);
  vctFrag *= vctColorTexture;
  #endif  
  vctFrag *= u_vctColor;
  vctFrag += vctSpec * (1.0 - fMetallic);
}`;
  shaderSources["ShaderPick.frag"] = `#version 300 es
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
    float id = float(u_id); 
    float pixel = trunc(gl_FragCoord.x) + u_vctSize.x * trunc(gl_FragCoord.y);

    if (pixel != id)
      discard;

    uint icolor = uint(u_vctColor.r * 255.0) << 24 | uint(u_vctColor.g * 255.0) << 16 | uint(u_vctColor.b * 255.0) << 8 | uint(u_vctColor.a * 255.0);
                
    vctFrag = ivec4(floatBitsToInt(gl_FragCoord.z), icolor, 0, 0);
}`;
  shaderSources["ShaderPick.vert"] = `#version 300 es
/**
* Renders for Raycasting
* @authors Jirka Dell'Oro-Friedl, HFU, 2019
*/
in vec3 a_vctPosition;       
uniform mat4 u_mtxMeshToView;

void main() {   
    gl_Position = u_mtxMeshToView * vec4(a_vctPosition, 1.0);
}`;
  shaderSources["ShaderPickTextured.frag"] = `#version 300 es
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
uniform sampler2D u_texture;

out ivec4 vctFrag;

void main() {
    float id = float(u_id); 
    float pixel = trunc(gl_FragCoord.x) + u_vctSize.x * trunc(gl_FragCoord.y);

    if (pixel != id)
      discard;
    
    vec4 vctColor = u_vctColor * texture(u_texture, v_vctTexture);
    uint icolor = uint(vctColor.r * 255.0) << 24 | uint(vctColor.g * 255.0) << 16 | uint(vctColor.b * 255.0) << 8 | uint(vctColor.a * 255.0);
  
  vctFrag = ivec4(floatBitsToInt(gl_FragCoord.z), icolor, floatBitsToInt(v_vctTexture.x), floatBitsToInt(v_vctTexture.y));
}`;
  shaderSources["ShaderPickTextured.vert"] = `#version 300 es
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
  shaderSources["ShaderScreen.frag"] = `#version 300 es
/**
*Renders Framebuffer on to Renderbuffer
*@authors Roland Heer, HFU, 2023
*/
precision mediump float;
precision highp int;

in vec2 v_vctTexture;
uniform sampler2D u_mainTexture;

uniform float u_mist;
uniform sampler2D u_mistTexture;
uniform vec4 u_vctMistColor;

uniform float u_ao;
uniform sampler2D u_aoTexture;
uniform vec4 u_vctAOColor;

uniform float u_bloom;
uniform sampler2D u_bloomTexture;
uniform float u_bloomIntensity;

out vec4 vctFrag;

void main() {
    vec4 mainTex = texture(u_mainTexture, v_vctTexture);
    vec4 vctTempFrag = mainTex;
    if(u_ao > 0.5f) {
        vec4 aoTex = texture(u_aoTexture, v_vctTexture);
        aoTex *= vec4(u_vctAOColor.rgb, 1.0f);
        vctTempFrag = mix(vctTempFrag, vctTempFrag * vec4(aoTex.rgb, 1.0f), u_vctAOColor.a);
    }
    if(u_mist > 0.5f) {
        vec4 mistTex = texture(u_mistTexture, v_vctTexture);
        vctTempFrag = mix(vctTempFrag, vec4(u_vctMistColor.rgb, 1.0f), mistTex.r * u_vctMistColor.a);
    }
    if(u_bloom > 0.5f) {
        float intensity = max(u_bloomIntensity, 0.0f);
        vec4 bloomTex = texture(u_bloomTexture, v_vctTexture);
        vctTempFrag += (bloomTex * intensity);

        float factor = 0.5f;
        float r = max(vctTempFrag.r - 1.0f, 0.0f) * factor;
        float g = max(vctTempFrag.r - 1.0f, 0.0f) * factor;
        float b = max(vctTempFrag.r - 1.0f, 0.0f) * factor;

        vctTempFrag.r += g + b;
        vctTempFrag.g += r + b;
        vctTempFrag.b += r + g;
    }

    vctFrag = vctTempFrag;
}
`;
  shaderSources["ShaderScreen.vert"] = `#version 300 es
/**
*Renders Framebuffer on to Renderbuffer
*@authors Roland Heer, HFU, 2023
*/
in vec2 a_vctPosition;
in vec2 a_vctTexture;

out vec2 v_vctTexture;

void main() {
    gl_Position = vec4(a_vctPosition, 0.0, 1.0);
    v_vctTexture = a_vctTexture;
}
`;
  shaderSources["ShaderUniversal.frag"] = `#version 300 es
/**
* Universal Shader as base for many others. Controlled by compiler directives
* @authors Jirka Dell'Oro-Friedl, HFU, 2021
*/

precision mediump float;
precision highp int;

  // MINIMAL (no define needed): include base color
uniform vec4 u_vctColor;

  // FLAT: input vertex colors flat, so the third of a triangle determines the color
  #if defined(FLAT) 
flat in vec4 v_vctColor;
  // LIGHT: input vertex colors for each vertex for interpolation over the face
  #elif defined(LIGHT) || defined(PARTICLE_COLOR)
in vec4 v_vctColor;
  #endif

  // TEXTURE: input UVs and texture
  #if defined(TEXTURE) || defined(MATCAP)
in vec2 v_vctTexture;
uniform sampler2D u_texture;
  #endif

out vec4 vctFrag;

void main() {
    // MINIMAL: set the base color
  vctFrag = u_vctColor;

    // VERTEX: multiply with vertex color
    #if defined(FLAT) || defined(LIGHT) || defined(PARTICLE_COLOR)
  vctFrag *= v_vctColor;
    #endif

    // TEXTURE: multiply with texel color
    #if defined(TEXTURE) || defined(MATCAP)
  vec4 vctColorTexture = texture(u_texture, v_vctTexture);
  vctFrag *= vctColorTexture;
    #endif

    // discard pixel alltogether when transparent: don't show in Z-Buffer
  if(vctFrag.a < 0.01)
    discard;
}`;
  shaderSources["ShaderUniversal.vert"] = `#version 300 es
/**
* Universal Shader as base for many others. Controlled by compiler directives
* @authors 2021, Luis Keck, HFU, 2021 | Jirka Dell'Oro-Friedl, HFU, 2021
*/

precision mediump float;
precision highp int;

  // MINIMAL (no define needed): buffers for transformation
uniform mat4 u_mtxMeshToView;
in vec3 a_vctPosition;

  // PARTICLE: offer buffer and functionality for in shader position calculation
  // CAMERA: offer buffer and functionality for specular reflection depending on the camera-position
  #if defined(CAMERA) || defined(PARTICLE)
uniform mat4 u_mtxMeshToWorld;
uniform vec3 u_vctCamera;
  #endif

  #if defined(CAMERA)
uniform float u_fSpecular;

float calculateReflection(vec3 _vctLight, vec3 _vctView, vec3 _vctNormal, float _fSpecular) {
  if(_fSpecular <= 0.0f)
    return 0.0f;
  vec3 vctReflection = normalize(reflect(-_vctLight, _vctNormal));
  float fHitCamera = dot(vctReflection, _vctView);
  return pow(max(fHitCamera, 0.0f), _fSpecular * 10.0f) * _fSpecular; // 10.0 = magic number, looks good... 
}
  #endif

  // LIGHT: offer buffers for lighting vertices with different light types
  #if defined(LIGHT)
uniform mat4 u_mtxNormalMeshToWorld;
in vec3 a_vctNormal;
in vec3 a_vctTangent;
uniform float u_fDiffuse;

struct Light {
  vec4 vctColor;
  mat4 mtxShape;
  mat4 mtxShapeInverse;
};

const uint MAX_LIGHTS_DIRECTIONAL = 10u;
const uint MAX_LIGHTS_POINT = 50u;
const uint MAX_LIGHTS_SPOT = 50u;

uniform Light u_ambient;
uniform uint u_nLightsDirectional;
uniform Light u_directional[MAX_LIGHTS_DIRECTIONAL];
uniform uint u_nLightsPoint;
uniform Light u_point[MAX_LIGHTS_POINT];
uniform uint u_nLightsSpot;
uniform Light u_spot[MAX_LIGHTS_SPOT];

vec4 illuminateDirected(vec3 _vctDirection, vec3 _vctNormal, vec4 _vctColor, vec3 _vctView, float _fSpecular) {
  vec4 vctResult = vec4(0, 0, 0, 1);
  vec3 vctDirection = normalize(_vctDirection);
  float fIllumination = -dot(_vctNormal, vctDirection);
  if(fIllumination > 0.0f) {
    vctResult += u_fDiffuse * fIllumination * _vctColor;
        #if defined(CAMERA)
    float fReflection = calculateReflection(vctDirection, _vctView, _vctNormal, _fSpecular);
    vctResult += fReflection * _vctColor;
        #endif
  }
  return vctResult;
}
  #endif 

// TEXTURE || NORMALMAP: texture coordinates for texturemaps
#if defined(TEXTURE) || defined(NORMALMAP)
in vec2 a_vctTexture;
#endif

  // TEXTURE: offer buffers for UVs and pivot matrix
  #if defined(TEXTURE)
uniform mat3 u_mtxPivot;
out vec2 v_vctTexture;
  #endif

  // NORMALMAP: offer buffers for UVs and pivot matrix
  #if defined(NORMALMAP)
uniform mat3 u_mtxPivotN;
out vec2 v_vctNormalMap;
  #endif

  #if defined(MATCAP) // MatCap-shader generates texture coordinates from surface normals
in vec3 a_vctNormal;
uniform mat4 u_mtxNormalMeshToWorld;
uniform mat4 u_mtxWorldToCamera;
out vec2 v_vctTexture;
  #endif

  #if defined(PHONG)
out vec3 v_vctNormal;
out mat3 v_mtxTBN;
out vec4 v_vctPosition;
  #endif

  #if defined(SKIN)
// uniform mat4 u_mtxMeshToWorld;
// Bones
struct Bone {
  mat4 matrix;
};

const uint MAX_BONES = 10u;

in uvec4 a_iBone;
in vec4 a_fWeight;

uniform Bone u_bones[MAX_BONES];
  #endif

  // FLAT: outbuffer is flat
  #if defined(FLAT)
flat out vec4 v_vctColor;
  #elif defined(LIGHT) || defined(PARTICLE)
  // regular if not FLAT
out vec4 v_vctColor;
  #endif

  #if defined(PARTICLE)
uniform mat4 u_mtxWorldToView;
uniform float u_fParticleSystemSize;
uniform float u_fParticleSystemTime;
uniform sampler2D u_fParticleSystemRandomNumbers;
uniform bool u_bParticleSystemFaceCamera;
uniform bool u_bParticleSystemRestrict;

mat4 lookAt(vec3 _vctTranslation, vec3 _vctTarget) {
  vec3 vctUp = vec3(0.0f, 1.0f, 0.0f);
  vec3 zAxis = normalize(_vctTarget - _vctTranslation);
  vec3 xAxis = normalize(cross(vctUp, zAxis));
  vec3 yAxis = u_bParticleSystemRestrict ? vctUp : normalize(cross(zAxis, xAxis));
  zAxis = u_bParticleSystemRestrict ? normalize(cross(xAxis, vctUp)) : zAxis;

  return mat4(xAxis.x, xAxis.y, xAxis.z, 0.0f, yAxis.x, yAxis.y, yAxis.z, 0.0f, zAxis.x, zAxis.y, zAxis.z, 0.0f, _vctTranslation.x, _vctTranslation.y, _vctTranslation.z, 1.0f);
}
  #endif

void main() {
  vec4 vctPosition = vec4(a_vctPosition, 1.0f);

    #if defined(CAMERA) || defined(PARTICLE)
  mat4 mtxMeshToWorld = u_mtxMeshToWorld;
    #endif

    #if defined(PARTICLE)
  float fParticleId = float(gl_InstanceID);
  /*$variables*/
  /*$mtxLocal*/
  /*$mtxWorld*/
  mtxMeshToWorld = /*$mtxWorld*/ mtxMeshToWorld /*$mtxLocal*/;
  if(u_bParticleSystemFaceCamera)
    mtxMeshToWorld = lookAt(vec3(mtxMeshToWorld[3][0], mtxMeshToWorld[3][1], mtxMeshToWorld[3][2]), u_vctCamera) *
      mat4(length(vec3(mtxMeshToWorld[0][0], mtxMeshToWorld[1][0], mtxMeshToWorld[2][0])), 0.0f, 0.0f, 0.0f, 0.0f, length(vec3(mtxMeshToWorld[0][1], mtxMeshToWorld[1][1], mtxMeshToWorld[2][1])), 0.0f, 0.0f, 0.0f, 0.0f, length(vec3(mtxMeshToWorld[0][2], mtxMeshToWorld[1][2], mtxMeshToWorld[2][2])), 0.0f, 0.0f, 0.0f, 0.0f, 1.0f);
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
      #if defined(LIGHT)
  v_vctColor = u_fDiffuse * u_ambient.vctColor;
      #endif
    #endif

    #if defined(SKIN)
  mat4 mtxSkin = a_fWeight.x * u_bones[a_iBone.x].matrix +
    a_fWeight.y * u_bones[a_iBone.y].matrix +
    a_fWeight.z * u_bones[a_iBone.z].matrix +
    a_fWeight.w * u_bones[a_iBone.w].matrix;

  mtxMeshToView *= mtxSkin;
  mtxNormalMeshToWorld = transpose(inverse(mtxMeshToWorld * mtxSkin));
    #endif

    // calculate position and normal according to input and defines
  gl_Position = mtxMeshToView * vctPosition;

    #if defined(CAMERA) || defined(MATCAP)
  vec3 vctView = normalize(vec3(u_mtxMeshToWorld * vctPosition) - u_vctCamera);
    #endif

    #if defined(LIGHT)
  vctNormal = normalize(mat3(mtxNormalMeshToWorld) * vctNormal);
      #if defined(PHONG)
  v_vctNormal = vctNormal; // pass normal to fragment shader
  v_vctPosition = vctPosition;
    #endif  
    #if defined(NORMALMAP)
    v_mtxTBN = mat3(normalize(mat3(mtxNormalMeshToWorld) * a_vctTangent), normalize(mat3(mtxNormalMeshToWorld) * cross(a_vctNormal, a_vctTangent)), vctNormal);
    #endif

    #if !defined(PHONG)
  // calculate directional light effect
  for(uint i = 0u; i < u_nLightsDirectional; i++) {
    vec3 vctDirection = vec3(u_directional[i].mtxShape * vec4(0.0f, 0.0f, 1.0f, 1.0f));
    v_vctColor += illuminateDirected(vctDirection, vctNormal, u_directional[i].vctColor, vctView, u_fSpecular);
  }
  // calculate point light effect
  for(uint i = 0u; i < u_nLightsPoint; i++) {
    vec3 vctPositionLight = vec3(u_point[i].mtxShape * vec4(0.0f, 0.0f, 0.0f, 1.0f));
    vec3 vctDirection = vec3(mtxMeshToWorld * vctPosition) - vctPositionLight;
    float fIntensity = 1.0f - length(mat3(u_point[i].mtxShapeInverse) * vctDirection);
    if(fIntensity < 0.0f)
      continue;
    v_vctColor += illuminateDirected(vctDirection, vctNormal, fIntensity * u_point[i].vctColor, vctView, u_fSpecular);
  }
  // calculate spot light effect
  for(uint i = 0u; i < u_nLightsSpot; i++) {
    vec3 vctPositionLight = vec3(u_spot[i].mtxShape * vec4(0.0f, 0.0f, 0.0f, 1.0f));
    vec3 vctDirection = vec3(mtxMeshToWorld * vctPosition) - vctPositionLight;
    vec3 vctDirectionInverted = mat3(u_spot[i].mtxShapeInverse) * vctDirection;
    if(vctDirectionInverted.z <= 0.0f)
      continue;
    float fIntensity = 1.0f - min(1.0f, 2.0f * length(vctDirectionInverted.xy) / vctDirectionInverted.z);
    fIntensity *= 1.0f - pow(vctDirectionInverted.z, 2.0f);
    if(fIntensity < 0.0f)
      continue;
    v_vctColor += illuminateDirected(vctDirection, vctNormal, fIntensity * u_spot[i].vctColor, vctView, u_fSpecular);
  }
      #endif // PHONG
    #endif

    // TEXTURE: transform UVs
    #if defined(TEXTURE)
  v_vctTexture = vec2(u_mtxPivot * vec3(a_vctTexture, 1.0f)).xy;
    #endif

    // NORMALMAP: transform UVs
    #if defined(NORMALMAP)
  v_vctNormalMap = vec2(u_mtxPivotN * vec3(a_vctTexture, 1.0f)).xy;
    #endif

    #if defined(MATCAP)
  vec4 vctVertexInCamera = normalize(u_mtxWorldToCamera * vctPosition);
  vctVertexInCamera.xy *= -1.0f;
  mat4 mtx_RotX = mat4(1, 0, 0, 0, 0, vctVertexInCamera.z, vctVertexInCamera.y, 0, 0, -vctVertexInCamera.y, vctVertexInCamera.z, 0, 0, 0, 0, 1);
  mat4 mtx_RotY = mat4(vctVertexInCamera.z, 0, -vctVertexInCamera.x, 0, 0, 1, 0, 0, vctVertexInCamera.x, 0, vctVertexInCamera.z, 0, 0, 0, 0, 1);

  vctNormal = mat3(u_mtxNormalMeshToWorld) * a_vctNormal;

  // adds correction for things being far and to the side, but distortion for things being close
  vctNormal = mat3(mtx_RotX * mtx_RotY) * vctNormal;

  vec3 vctReflection = normalize(mat3(u_mtxWorldToCamera) * normalize(vctNormal));
  vctReflection.y = -vctReflection.y;

  v_vctTexture = 0.5f * vctReflection.xy + 0.5f;
    #endif

    #if defined(PARTICLE_COLOR)
  vec4 vctParticleColor = /*$color*/;
      #if defined(LIGHT)
  v_vctColor *= vctParticleColor;
  v_vctColor.a = vctParticleColor.a;
      #else
  v_vctColor = vctParticleColor;
      #endif
    #else
    // always full opacity for now...
      #if defined(LIGHT)
  v_vctColor.a = 1.0f;
      #endif
    #endif
}`;
  shaderSources["ShaderUpsample.frag"] = `#version 300 es
/**
*Downsamples a given Texture to the current FBOs Texture
*@authors Roland Heer, HFU, 2023 | Jirka Dell'Oro-Friedl, HFU, 2023
*/
precision mediump float;
precision highp int;

in vec2 v_vctTexture;
in vec2[9] v_vctOffsets;
uniform sampler2D u_texture;
uniform sampler2D u_texture2;

float altGaussianKernel[9] = float[](0.04f, 0.044f, 0.04f, 0.122f, 0.332f, 0.122f, 0.05f, 0.2f, 0.05f);

out vec4 vctFrag;

void main() {
    vec4 tex1 = vec4(0.0f);
    for(int i = 0; i < 9; i++) {
        tex1 += vec4(texture(u_texture, v_vctTexture + v_vctOffsets[i]) * altGaussianKernel[i]);
    }
    vec4 tex2 = texture(u_texture2, v_vctTexture);
    vctFrag = tex2 + tex1; 
}`;
  shaderSources["ShaderUpsample.vert"] = `#version 300 es
/**
* ShaderDownsample sets Values for Downsampling Fragmentshader
* @authors 2023, Roland Heer, HFU, 2023 | Jirka Dell'Oro-Friedl, HFU, 2023
*/
in vec2 a_vctPosition;
in vec2 a_vctTexture;

uniform float u_width;
uniform float u_height;

out vec2 v_vctTexture;
out vec2[9] v_vctOffsets;

void main() {
    gl_Position = vec4(a_vctPosition, 0.0, 1.0);
    v_vctTexture = a_vctTexture;

    vec2 offset = vec2(1.0f / u_width, 1.0f / u_height);

    v_vctOffsets = vec2[]
    (
        vec2(-offset.x, offset.y),  vec2(0.0, offset.y),  vec2(offset.x, offset.y),
        vec2(-offset.x, 0.0),       vec2(0.0, 0.0),       vec2(offset.x, 0.0),
        vec2(-offset.x, -offset.y), vec2(0.0, offset.y),  vec2(-offset.x, -offset.y)
    );
}`;

}