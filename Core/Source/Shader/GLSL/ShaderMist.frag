#version 300 es
/**
*Renders Framebuffer on to Renderbuffer
*@authors Roland Heer, HFU, 2023 | Jirka Dell'Oro-Friedl, HFU, 2023
*/
precision mediump float;
precision highp int;

uniform mat4 u_mtxMeshToWorld;
uniform vec3 u_vctCamera;

in vec4 v_vctPosition;

out vec4 vctFrag;

void main() {
    float vctDistCamera = length((u_mtxMeshToWorld * v_vctPosition).xyz - u_vctCamera) * 0.2;
    vec3 col = vec3(0.0,0.0,0.0);
    vctFrag = vec4(col, vctDistCamera);
}
