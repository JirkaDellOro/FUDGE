#version 300 es
/**
* ...
* @authors Jonas Plotzky, HFU, 2023
*/
precision mediump float;
precision highp int;

uniform vec4 u_vctColor;

out vec4 vctFrag;

// uniform sampler2D u_texDepthStencil;
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

  // float depth = texelFetch(u_texDepthStencil, ivec2(gl_FragCoord.xy), 0).r;
  // if (gl_FragCoord.z > depth) 
  //   vctFrag.a *= 0.2;

  if (vctFrag.a < 0.01)
    discard;

  // premultiply alpha for blending
  vctFrag.rgb *= vctFrag.a;
}