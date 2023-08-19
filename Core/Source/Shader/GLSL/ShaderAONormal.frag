#version 300 es
/**
*Renders normalinformation onto texture
*@authors Roland Heer, HFU, 2023
*/
precision mediump float;
precision highp int;

in vec3 v_vctCamera;
in mat4 v_mtxMeshToWorld;
in vec4 v_vctPosition;
in vec4 v_vctNormal;

out vec4 vctFrag;

void main() {
    /*
    float dist = length((v_mtxMeshToWorld * v_vctPosition).xyz - v_vctCamera);
    float fogAmount = min(max((dist - u_nearPlane) / (u_farPlane - u_nearPlane), 0.0),1.0);
    vec3 fog = vec3(-pow(fogAmount, 2.0) + (2.0 * fogAmount)); //lets Fog appear quicker and fall off slower results in a more gradual falloff
    vctFrag = vec4(fog, 1.0);
    */
    vctFrag = v_vctNormal;
}
