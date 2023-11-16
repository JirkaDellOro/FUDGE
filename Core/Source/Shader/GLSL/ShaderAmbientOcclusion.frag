#version 300 es
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
// uniform vec3 u_vctCameraForward;
// uniform mat4 u_mtxViewProjectionInverse;

uniform sampler2D u_positionTexture; // world space position
uniform sampler2D u_normalTexture; // world space normal
uniform sampler2D u_noiseTexture;
// uniform sampler2D u_depthTexture;

in vec2 v_vctTexture;
in vec3 v_vctViewDirection;

out vec4 vctFrag;

// Both of these functions could be used to calculate the position from the depth texture, but mobile devices seems to lack in precision to do this
// vec3 getPosition(vec2 _vctTexture) {
//   float fDepth = texture(u_depthTexture, _vctTexture).r;
//   vec4 clipSpacePosition = vec4(_vctTexture * 2.0 - 1.0, fDepth * 2.0 - 1.0, 1.0);
//   vec4 worldSpacePosition = u_mtxViewProjectionInverse * clipSpacePosition;
//   return worldSpacePosition.xyz / worldSpacePosition.w;
// }

float getOcclusion(vec3 _vctPosition, vec3 _vctNormal, vec2 _vctTexture) {
  vec3 vctOccluder = texture(u_positionTexture, _vctTexture).xyz;
  vec3 vctDistance = vctOccluder - _vctPosition;
  float fIntensity = max(dot(_vctNormal, normalize(vctDistance)) - u_fBias, 0.0);

  float fDistance = length(vctDistance);
  float fAttenuation = 1.0 / (u_fAttenuationConstant + u_fAttenuationLinear * fDistance + u_fAttenuationQuadratic * fDistance * fDistance);

  return fIntensity * fAttenuation;
}

void main() {
  vec3 vctPosition = texture(u_positionTexture, v_vctTexture).xyz;
  vec3 vctNormal = texture(u_normalTexture, v_vctTexture).xyz;
  vec2 vctRandom = normalize(texture(u_noiseTexture, v_vctTexture).xy * 2.0 - 1.0);
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
}