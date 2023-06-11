#version 300 es
/**
*Renders Framebuffer on to Renderbuffer
*@authors Roland Heer, HFU, 2023
*/
precision mediump float;
precision highp int;

in vec2 v_vctTexture;
uniform sampler2D u_texture;
uniform vec4 u_vctColor;

out vec4 vctFrag;

void main() {
    vec4 mistTex = texture(u_texture, v_vctTexture);
    vctFrag = vec4(u_vctColor.rgb, mistTex.r * u_vctColor.a);
}
