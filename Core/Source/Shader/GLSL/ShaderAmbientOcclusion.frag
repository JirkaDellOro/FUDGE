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

struct Sample {
    vec3 vct;
};

const uint MAX_SAMPLES = 64u;
uniform uint u_nSamples;
uniform Sample u_samples[MAX_SAMPLES];

uniform float u_nearPlane;
uniform float u_farPlane;
uniform float u_radius;

uniform float u_width;
uniform float u_height;

out vec4 vctFrag;

float linearizeDepth(float original_depth) {
    return (2.0f * u_nearPlane) / (u_farPlane + u_nearPlane - original_depth * (u_farPlane - u_nearPlane));
}

vec2 calculateOffset(vec3 vct_vector) {
    vec2 tempOffset = vec2(vct_vector.x, vct_vector.y);
    return tempOffset * u_radius;
}

void main() {
    float depth = linearizeDepth(texture(u_depthTexture, v_vctTexture).r);
    vec3 vct_Normal = texture(u_normalTexture, v_vctTexture).rgb;
    vct_Normal = 1.0f - (vct_Normal * 2.0f);

    vec2 pixel = vec2(1.0f / u_width, 1.0f / u_height);
    /*
    vec3 vctTangent = normalize(vec3(1.0f) - vctNormal * dot(vec3(1.0f), vctNormal));
    vec3 vctBitangent = cross(vctNormal, vctTangent);
    mat3 TBN = mat3(vctTangent, vctBitangent, vctNormal);
    */
    float occlusion = 1.0f;
    vec2 offset = calculateOffset(vct_Normal);
    offset = offset * pixel;
    float sampleDepth = linearizeDepth(texture(u_depthTexture, v_vctTexture + offset).r);
    if(depth < sampleDepth) {
        occlusion = 0.0f;
    }
    vctFrag = vec4(vec3(occlusion), 1.0f);
}
