#version 300 es
/**
* Universal Shader as base for many others. Controlled by compiler directives
* @authors Jirka Dell'Oro-Friedl, HFU, 2021
*/

precision mediump float;

  // FLAT: input vertex colors flat, so the third of a triangle determines the color
  #if defined(FLAT) 
flat in vec4 v_color;
  // LIGHT: input vertex colors for each vertex for interpolation over the face
  #elif defined(LIGHT)
in vec4 v_color;
  #endif

  // TEXTURE: input UVs and texture
  #if defined(TEXTURE)
in vec2 v_textureUVs;
uniform sampler2D u_texture;
  #endif

  // MINIMAL (no define needed): include base color
uniform vec4 u_color;

out vec4 frag;

void main() {
    // MINIMAL: set the base color
  frag = u_color;

    // LIGHT_VERTEX: multiply with vertex color
    #if defined(FLAT) || defined(LIGHT)
  frag *= v_color;
    #endif

    // TEXTURE: multiply with texel color
    #if defined(TEXTURE)
  vec4 colorTexture = texture(u_texture, v_textureUVs);
  frag *= colorTexture;
    #endif

    // discard pixel alltogether when transparent: don't show in Z-Buffer
  if(frag.a < 0.01)
    discard;
}