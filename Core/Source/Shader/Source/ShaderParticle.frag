#version 300 es
/**
* Particle shader similar to lit textured shader
* @authors Jonas Plotzky, HFU, 2022
*/

precision mediump float;

uniform vec4 u_vctColor;
  
  #if defined(PARTICLE_COLOR)
in vec4 v_vctColor;
  #endif

in vec2 v_vctTexture;
uniform sampler2D u_texture;

out vec4 vctFrag;

void main() {
  // TEXTURE: multiply with texel color
  vec4 vctColorTexture = texture(u_texture, v_vctTexture);
  vctFrag = u_vctColor * vctColorTexture;
    #if defined(PARTICLE_COLOR)
  vctFrag *= v_vctColor;
    #endif


  // discard pixel alltogether when transparent: don't show in Z-Buffer
  if(vctFrag.a < 0.01)
    discard;
}