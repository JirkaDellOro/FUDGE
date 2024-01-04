#version 300 es
/**
* ...
* @authors Jonas Plotzky, HFU, 2023
*/
precision mediump float;
precision highp int;

uniform vec4 u_vctColor;

out vec4 vctFrag;

#if defined(TEXTURE)
  uniform sampler2D u_texColor;
  uniform bool u_bMask;
  in vec2 v_vctTexture;
#endif

void main() {
  vctFrag = u_vctColor;

  #if defined(TEXTURE)

    if (u_bMask)
      vctFrag.a *= texture(u_texColor, v_vctTexture).a;
    else
      vctFrag *= texture(u_texColor, v_vctTexture);
      
  #endif

  if (vctFrag.a < 0.01)
    discard;

  // premultiply alpha for blending
  vctFrag.rgb *= vctFrag.a;
}