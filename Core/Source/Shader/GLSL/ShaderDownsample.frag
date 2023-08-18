#version 300 es
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
    tex1 *= 1.0f + (u_lvl * 0.3f);
    vctFrag = tex1;
}