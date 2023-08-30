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
    vec3 vct_FragPos = getFragPos(gl_FragCoord.xy, depth);

    vec3 vct_Normal = texture(u_normalTexture, v_vctTexture).rgb;
    vct_Normal = 1.0f - (vct_Normal * 2.0f);    //set normals into -1 to 1 range
    vct_Normal = normalize(vct_Normal);

    vec2 noiseScale = vec2(u_width / 4.0f, u_height / 4.0f);

    vec3 vct_Random = normalize(texture(u_noiseTexture, v_vctTexture * noiseScale).rgb);

    vec3 vct_Tangent = normalize(vct_Random - vct_Normal * dot(vct_Random, vct_Normal));
    vec3 vct_Bitangent = cross(vct_Normal, vct_Tangent);
    mat3 mtxTBN = mat3(vct_Tangent, vct_Bitangent, vct_Normal);

    float occlusion = 0.0f;
    for(int i = 0; i < u_nSamples; i++) {
        //get sample position
        vec3 vct_Sample = mtxTBN * u_samples[i].vct;
        vct_Sample = vct_FragPos + (vct_Sample * u_radius);

        vec3 offset = vec3(vct_Sample);
        offset = offset * 0.5f + 0.5f;

        float occluderDepth = linearizeDepth(texture(u_depthTexture, offset.xy).r);

        float rangeCheck = (vct_Sample.z - occluderDepth > u_radius * u_shadowDistance * 10.0f ? 0.0f : 1.0f);
        //rangeCheck = 1.0f;
        occlusion += (occluderDepth <= vct_Sample.z ? 1.0f : 0.0f) * rangeCheck;
    }
    float nSamples = float(u_nSamples);
    occlusion = min((1.0f - (occlusion / nSamples)) * 1.5f, 1.0f);
    occlusion *= occlusion;
    vctFrag = vec4(vec3(occlusion), 1.0f);
    //vctFrag = vec4(texture(u_depthTexture, (vct_FragPos + ((mtxTBN * u_samples[127].vct) * u_radius)).xy * 0.5f + 0.5f).rgb, 1.0f);
}
