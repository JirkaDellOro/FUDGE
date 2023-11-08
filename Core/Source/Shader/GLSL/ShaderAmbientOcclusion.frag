#version 300 es
/**
*Calculates AO based on depthmap
*@authors Roland Heer, HFU, 2023 | Jirka Dell'Oro-Friedl, HFU, 2023
*/
precision mediump float;
precision highp int;

in vec2 v_vctTexture;
uniform sampler2D u_normalTexture;
uniform sampler2D u_depthTexture;
uniform sampler2D u_noiseTexture;

struct Sample {
  vec3 vct;
};

const uint MAX_SAMPLES = 128u;
uniform int u_nSamples;
uniform Sample u_samples[MAX_SAMPLES];

uniform float u_nearPlane;
uniform float u_farPlane;
uniform float u_radius;
uniform float u_shadowDistance;

uniform float u_width;
uniform float u_height;

out vec4 vctFrag;

vec3 getFragPos(vec2 _vct_xy, float _depth) {
    _vct_xy.x /= u_width;
    _vct_xy.y /= u_height;
    _vct_xy = (_vct_xy - 0.5f) * 2.0f; //set coordinates to clip space
    return vec3(_vct_xy, _depth);
}

float linearizeDepth(float _originalDepth) {
    return (pow(u_farPlane + 1.0f, _originalDepth) - 1.0f) + u_nearPlane;
    //return _originalDepth;
}

void main() {
  float depth = linearizeDepth(texture(u_depthTexture, v_vctTexture).r);
  vec3 vctFragPos = getFragPos(gl_FragCoord.xy, depth);

  vec3 vctNormal = texture(u_normalTexture, v_vctTexture).rgb;
  vctNormal = 1.0f - (vctNormal * 2.0f);    //set normals into -1 to 1 range
  vctNormal = normalize(vctNormal);

  vec2 noiseScale = vec2(u_width / 4.0f, u_height / 4.0f);

  vec3 vctRandom = normalize(texture(u_noiseTexture, v_vctTexture * noiseScale).rgb);
  vec3 vctTangent = normalize(vctRandom - vctNormal * dot(vctRandom, vctNormal));
  vec3 vctBitangent = cross(vctNormal, vctTangent);
  mat3 mtxTBN = mat3(vctTangent, vctBitangent, vctNormal);

  //calculation of the occlusion-factor   
  float occlusion = 0.0f;
  for(int i = 0; i < u_nSamples; i++) {
    //get sample position
    vec3 vctSample = mtxTBN * u_samples[i].vct;
    vctSample = vctFragPos + (vctSample * u_radius);

    vec3 offset = vec3(vctSample);
    offset = offset * 0.5f + 0.5f;

    float occluderDepth = linearizeDepth(texture(u_depthTexture, offset.xy).r);

    float rangeCheck = (vctSample.z - occluderDepth > u_radius * u_shadowDistance * 10.0f ? 0.0f : 1.0f);  
    occlusion += (occluderDepth <= vctSample.z ? 1.0f : 0.0f) * rangeCheck;
  }

  float nSamples = float(u_nSamples);
  occlusion = min((1.0f - (occlusion / nSamples)) * 1.5f, 1.0f);
  occlusion *= occlusion;
  vctFrag = vec4(vec3(occlusion), 1.0f);
}
