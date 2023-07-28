#version 300 es
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
    if(u_bloom > 0.5f) {
        float intensity = max(u_bloomIntensity, 0.0f);
        vec4 bloomTex = texture(u_bloomTexture, v_vctTexture);
        //vctTempFrag += vec4(bloomTex.rgb * intensity, 1.0f);
        vctTempFrag += (bloomTex * intensity);
    }
    if(u_mist > 0.5f) {
        vec4 mistTex = texture(u_mistTexture, v_vctTexture);
        vctTempFrag = mix(vctTempFrag, vec4(u_vctMistColor.rgb, 1.0f), mistTex.r * u_vctMistColor.a);
    }
    vctFrag = vctTempFrag;
}
