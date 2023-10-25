#version 300 es
/**
* Universal Shader as base for many others. Controlled by compiler directives
* @authors Jirka Dell'Oro-Friedl, HFU, 2021 | Jonas Plotzky, HFU, 2023
*/

precision mediump float;
precision highp int;

// MINIMAL (no define needed): include base color
uniform vec4 u_vctColor;
in vec4 v_vctColor;

// LIGHT: include light parameters
#ifdef LIGHT

  uniform float u_fMetallic;
  in vec4 v_vctDiffuse;
  in vec4 v_vctSpecular;

#endif

// TEXTURE: input UVs and texture
#if defined(TEXTURE) || defined(MATCAP)

  in vec2 v_vctTexture;
  uniform sampler2D u_texture;

#endif

out vec4 vctFrag;

void main() {

  #ifdef LIGHT

    vctFrag = v_vctDiffuse + v_vctSpecular * u_fMetallic;

  #else

    // MINIMAL: set the base color
    vctFrag = u_vctColor * v_vctColor;

  #endif

  #if defined(TEXTURE) || defined(MATCAP)
    
    // TEXTURE: multiply with texel color
    vec4 vctColorTexture = texture(u_texture, v_vctTexture);
    vctFrag *= vctColorTexture;

  #endif

  #ifdef LIGHT

    vctFrag *= u_vctColor * v_vctColor;
    vctFrag += v_vctSpecular * (1.0 - u_fMetallic);
    vctFrag.a = 1.0 * u_vctColor.a * v_vctColor.a; // restore alpha value
  
  #endif

    // discard pixel alltogether when transparent: don't show in Z-Buffer
  if(vctFrag.a < 0.01)
    discard;
}