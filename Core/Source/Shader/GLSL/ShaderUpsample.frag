#version 300 es
/**
*Downsamples a given Texture to the current FBOs Texture
*@authors Roland Heer, HFU, 2023 | Jirka Dell'Oro-Friedl, HFU, 2023
*/
precision mediump float;
precision highp int;

in vec2 v_vctTexture;
uniform sampler2D u_texture;
uniform sampler2D u_texture2;


out vec4 vctFrag;

void main() {
    vctFrag = texture(u_texture, v_vctTexture) + texture(u_texture2, v_vctTexture); 
}