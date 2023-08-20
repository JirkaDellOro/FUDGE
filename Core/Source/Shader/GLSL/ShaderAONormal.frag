#version 300 es
/**
*Renders normalinformation onto texture
*@authors Roland Heer, HFU, 2023
*/
precision mediump float;
precision highp int;

in vec4 v_vctNormal;

out vec4 vctFrag;

void main() {
    vctFrag = v_vctNormal;
}
