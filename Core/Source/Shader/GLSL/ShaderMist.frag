#version 300 es
/**
*Renders Framebuffer on to Renderbuffer
*@authors Roland Heer, HFU, 2023
*/
precision mediump float;
precision highp int;

uniform vec3 u_vctCamera;
in vec3 v_vctPositionView;

out vec4 vctFrag;

void main() {
    vctFrag = vec4(u_vctCamera, 1.0);
    //vctFrag = vec4(1.0);
}
