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
  in vec2 v_vctTexture;
#endif

// // 4x4 Bayer matrix for dithering
// const float mtxDither[16] = float[](
//   1.0 / 17.0,  9.0 / 17.0,  3.0 / 17.0, 11.0 / 17.0,
//   13.0 / 17.0,  5.0 / 17.0, 15.0 / 17.0,  7.0 / 17.0,
//   4.0 / 17.0, 12.0 / 17.0,  2.0 / 17.0, 10.0 / 17.0,
//   16.0 / 17.0,  8.0 / 17.0, 14.0 / 17.0,  6.0 / 17.0
// );

void main() {
  vctFrag = u_vctColor;

  #if defined(TEXTURE)

      vctFrag *= texture(u_texColor, v_vctTexture);

  #endif

  // int x = int(gl_FragCoord.x) % 4;
  // int y = int(gl_FragCoord.y) % 4;
  // int index = y * 4 + x;
  // // Discard the fragment if its alpha is less than the corresponding value in the dithering matrix
  // if (vctFrag.a < mtxDither[index]) 
  //   discard;

  // // Discard the fragment if its alpha is 0
  // if (vctFrag.a == 0.0)
  //   discard;

  // // Create a checkerboard pattern for alpha values less than 0.5
  // else if (vctFrag.a < 0.5 && ((x + y) % 2 == 0))
  //   discard;

  // vctFrag.a = 1.0;

  if (vctFrag.a < 0.01)
    discard;

  // premultiply alpha for blending
  vctFrag.rgb *= vctFrag.a;
}