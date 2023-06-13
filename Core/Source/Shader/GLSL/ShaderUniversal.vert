#version 300 es
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
  if(_fSpecular <= 0.0)
    return 0.0;
  vec3 vctReflection = normalize(reflect(-_vctLight, _vctNormal));
  float fHitCamera = dot(vctReflection, _vctView);
  return pow(max(fHitCamera, 0.0), _fSpecular * 10.0) * _fSpecular; // 10.0 = magic number, looks good... 
}
  #endif

  // LIGHT: offer buffers for lighting vertices with different light types
  #if defined(LIGHT)
uniform mat4 u_mtxNormalMeshToWorld;
in vec3 a_vctNormal;
uniform float u_fDiffuse;

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

  // TEXTURE: offer buffers for UVs and pivot matrix
  #if defined(TEXTURE)
uniform mat3 u_mtxPivot;
in vec2 a_vctTexture;
out vec2 v_vctTexture;
  #endif

  #if defined(MATCAP) // MatCap-shader generates texture coordinates from surface normals
in vec3 a_vctNormal;
uniform mat4 u_mtxNormalMeshToWorld;
uniform mat4 u_mtxWorldToCamera;
out vec2 v_vctTexture;
  #endif

  #if defined(PHONG)
out vec3 v_vctNormal;
out vec4 v_vctPosition;
  #endif

  #if defined(SKIN)
// uniform mat4 u_mtxMeshToWorld;
// Bones
// https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/skinning_pars_vertex.glsl.js
in uvec4 a_iBone;
in vec4 a_fWeight;
const uint MAX_BONES = 256u;
layout (std140) uniform Skin {
  mat4 u_bones[MAX_BONES];
};
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
uniform float u_fParticleSystemDuration;
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

float fetchRandomNumber(int _iIndex, int _iParticleSystemRandomNumbersSize, int _iParticleSystemRandomNumbersLength) {
  _iIndex = _iIndex % _iParticleSystemRandomNumbersLength;
  return texelFetch(u_fParticleSystemRandomNumbers, ivec2(_iIndex % _iParticleSystemRandomNumbersSize, _iIndex / _iParticleSystemRandomNumbersSize), 0).r;
}
  #endif

void main() {
  vec4 vctPosition = vec4(a_vctPosition, 1.0);

    #if defined(CAMERA) || defined(PARTICLE)
  mat4 mtxMeshToWorld = u_mtxMeshToWorld;
    #endif

    #if defined(PARTICLE)
  float fParticleId = float(gl_InstanceID);
  int iParticleSystemRandomNumbersSize = textureSize(u_fParticleSystemRandomNumbers, 0).x; // the dimension of the quadratic texture
  int iParticleSystemRandomNumbersLength = iParticleSystemRandomNumbersSize * iParticleSystemRandomNumbersSize; // the total number of texels in the texture
  /*$variables*/
  /*$mtxLocal*/
  /*$mtxWorld*/
  mtxMeshToWorld = /*$mtxWorld*/ mtxMeshToWorld /*$mtxLocal*/;
  if (u_bParticleSystemFaceCamera) 
    mtxMeshToWorld = 
      lookAt(vec3(mtxMeshToWorld[3][0], mtxMeshToWorld[3][1], mtxMeshToWorld[3][2]), u_vctCamera) * 
      mat4(
        length(vec3(mtxMeshToWorld[0][0], mtxMeshToWorld[1][0], mtxMeshToWorld[2][0])), 0.0, 0.0, 0.0,
        0.0, length(vec3(mtxMeshToWorld[0][1], mtxMeshToWorld[1][1], mtxMeshToWorld[2][1])), 0.0, 0.0,
        0.0, 0.0, length(vec3(mtxMeshToWorld[0][2], mtxMeshToWorld[1][2], mtxMeshToWorld[2][2])), 0.0,
        0.0, 0.0, 0.0, 1.0
      );
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
  mat4 mtxSkin = a_fWeight.x * u_bones[a_iBone.x] +
    a_fWeight.y * u_bones[a_iBone.y] +
    a_fWeight.z * u_bones[a_iBone.z] +
    a_fWeight.w * u_bones[a_iBone.w];

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

    #if !defined(PHONG)
  // calculate directional light effect
  for(uint i = 0u; i < u_nLightsDirectional; i++) {
    vec3 vctDirection = vec3(u_directional[i].mtxShape * vec4(0.0, 0.0, 1.0, 1.0));
    v_vctColor += illuminateDirected(vctDirection, vctNormal, u_directional[i].vctColor, vctView, u_fSpecular);
  }
  // calculate point light effect
  for(uint i = 0u; i < u_nLightsPoint; i++) {
    vec3 vctPositionLight = vec3(u_point[i].mtxShape * vec4(0.0, 0.0, 0.0, 1.0));
    vec3 vctDirection = vec3(mtxMeshToWorld * vctPosition) - vctPositionLight;
    float fIntensity = 1.0 - length(mat3(u_point[i].mtxShapeInverse) * vctDirection);
    if(fIntensity < 0.0)
      continue;
    v_vctColor += illuminateDirected(vctDirection, vctNormal, fIntensity * u_point[i].vctColor, vctView, u_fSpecular);
  }

  // calculate spot light effect
  for(uint i = 0u; i < u_nLightsSpot; i++) {
    vec3 vctPositionLight = vec3(u_spot[i].mtxShape * vec4(0.0, 0.0, 0.0, 1.0));
    vec3 vctDirection = vec3(mtxMeshToWorld * vctPosition) - vctPositionLight;
    vec3 vctDirectionInverted = mat3(u_spot[i].mtxShapeInverse) * vctDirection;
    if(vctDirectionInverted.z <= 0.0)
      continue;
    float fIntensity = 1.0 - min(1.0, 2.0 * length(vctDirectionInverted.xy) / vctDirectionInverted.z);
    fIntensity *= 1.0 - pow(vctDirectionInverted.z, 2.0);
    if(fIntensity < 0.0)
      continue;
    v_vctColor += illuminateDirected(vctDirection, vctNormal, fIntensity * u_spot[i].vctColor, vctView, u_fSpecular);
  }
      #endif // PHONG
    #endif

    // TEXTURE: transform UVs
    #if defined(TEXTURE)
  v_vctTexture = vec2(u_mtxPivot * vec3(a_vctTexture, 1.0)).xy;
    #endif

    #if defined(MATCAP)
  vec4 vctVertexInCamera = normalize(u_mtxWorldToCamera * vctPosition);
  vctVertexInCamera.xy *= -1.0;
  mat4 mtx_RotX = mat4(1, 0, 0, 0, 0, vctVertexInCamera.z, vctVertexInCamera.y, 0, 0, -vctVertexInCamera.y, vctVertexInCamera.z, 0, 0, 0, 0, 1);
  mat4 mtx_RotY = mat4(vctVertexInCamera.z, 0, -vctVertexInCamera.x, 0, 0, 1, 0, 0, vctVertexInCamera.x, 0, vctVertexInCamera.z, 0, 0, 0, 0, 1);

  vctNormal = mat3(u_mtxNormalMeshToWorld) * a_vctNormal;

  // adds correction for things being far and to the side, but distortion for things being close
  vctNormal = mat3(mtx_RotX * mtx_RotY) * vctNormal;
  
  vec3 vctReflection = normalize(mat3(u_mtxWorldToCamera) * normalize(vctNormal));
  vctReflection.y = -vctReflection.y;

  v_vctTexture = 0.5 * vctReflection.xy + 0.5;
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
    v_vctColor.a = 1.0;
      #endif
    #endif
}