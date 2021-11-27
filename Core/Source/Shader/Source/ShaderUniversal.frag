#version 300 es
// #define LIGHT_VERTEX
// #define LIGHT_FLAT
/**
* Universal Shader as base for many others. Controlled by compiler directives
* @authors Jirka Dell'Oro-Friedl, HFU, 2021
*/

// START: calculate light per fragment
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
// END: calculate light per fragment
precision mediump float;
#endif

// accept light on vertices
    #ifdef LIGHT_VERTEX
flat in vec4 v_color;
    #endif

// a base-color to include
uniform vec4 u_color;
out vec4 frag;

void main() {
  
  #ifdef LIGHT_FLAT // flat shading
  frag = u_color * v_color;
  #else
  frag = u_color;
  #endif
}