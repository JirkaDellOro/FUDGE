#version 300 es
/**
*Renders Framebuffer on to Renderbuffer
*@authors Roland Heer, HFU, 2023
*/
precision mediump float;
precision highp int;

in vec2 v_vctTexture;
uniform sampler2D u_texture;

out vec4 vctFrag;

void main() {
    vec4 mistTex = texture(u_texture, v_vctTexture);
    vec3 mistCol = vec3(1.0);
    vctFrag = vec4(mistCol,mistTex.r);
}
