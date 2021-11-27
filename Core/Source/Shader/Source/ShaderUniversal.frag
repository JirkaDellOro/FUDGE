#version 300 es
/**
* Universal Shader as base for many others. Controlled by compiler directives
* @authors Jirka Dell'Oro-Friedl, HFU, 2021
*/

// LIGHT_FRAGMENT: offer buffers for lighting fragments with different light types
#ifdef LIGHT_FRAGMENT
precision highp float;

struct LightAmbient {
  vec4 color;
};
struct LightDirectional {
  vec4 color;
  vec3 direction;
};
#else
// medium precision is otherwise sufficient
precision mediump float;
#endif

// LIGHT_VERTEX: input vertex colors from lighting
#ifdef LIGHT_VERTEX
flat in vec4 v_color;
#endif

// TEXTURE: input UVs and texture
#ifdef TEXTURE
in vec2 v_textureUVs;
uniform sampler2D u_texture;
#endif

// MINIMAL (no define needed): include base color
uniform vec4 u_color;

out vec4 frag;

void main() {
  // MINIMAL: set the base color
  frag = u_color;

  // LIGHT_FLAT: multiply with vertex color
  #ifdef LIGHT_FLAT
  frag *= v_color;
  #endif

  // TEXTURE: multiply with texel color
  #ifdef TEXTURE
  vec4 colorTexture = texture(u_texture, v_textureUVs);
  frag *= colorTexture;
  #endif

  // discard pixel alltogether when transparent: don't show in Z-Buffer
  if(frag.a < 0.01)
    discard;
}