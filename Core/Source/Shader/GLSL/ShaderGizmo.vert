#version 300 es
/**
* ...
* @authors Jonas Plotzky, HFU, 2023
*/
precision mediump float;
precision highp int;

uniform mat4 u_mtxViewProjection;
uniform mat4 u_mtxModel;

in vec3 a_vctPosition;


#if defined(TEXTURE)

  in vec2 a_vctTexture;
  out vec2 v_vctTexture;

#endif

void main() {
  gl_Position = u_mtxViewProjection * u_mtxModel * vec4(a_vctPosition, 1.0);

  #if defined(TEXTURE)

    v_vctTexture = a_vctTexture;

  #endif
}