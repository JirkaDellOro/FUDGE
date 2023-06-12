#version 300 es
/**
*Renders Framebuffer on to Renderbuffer
*@authors Roland Heer, HFU, 2023 | Jirka Dell'Oro-Friedl, HFU, 2023
*/
precision mediump float;
precision highp int;

uniform float u_nearPlane;
uniform float u_farPlane;

in vec3 v_vctCamera;
in mat4 v_mtxMeshToWorld;
in vec4 v_vctPosition;

out vec4 vctFrag;

void main() {
    //vec3 vec = vec3(max(length((v_mtxMeshToWorld * v_vctPosition).xyz - v_vctCamera) * 0.2, 0.0));
    float dist = length((v_mtxMeshToWorld * v_vctPosition).xyz - v_vctCamera);
    float fogAmount = min(max((dist - u_nearPlane) / (u_farPlane - u_nearPlane), 0.0),1.0);
    vec3 vec = vec3(-pow(fogAmount, 2.0) + (2.0 * fogAmount)); //lets Fog appear quicker and fall off slower results in a more gradual falloff
    //vec3 vec = vec3(fogAmount);
    vctFrag = vec4(vec, 1.0);
}
