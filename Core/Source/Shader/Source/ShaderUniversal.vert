#version 300 es
#define LIGHT_VERTEX
#define LIGHT_FLAT
/**
* Universal Shader as base for many others. Controlled by compiler directives
* @authors Jirka Dell'Oro-Friedl, HFU, 2021
*/

// START: offer buffers for light types
#ifdef LIGHT_VERTEX
struct LightAmbient {
  vec4 color;
};
struct LightDirectional {
  vec4 color;
  vec3 direction;
};

const uint MAX_LIGHTS_DIRECTIONAL = 100u;

uniform LightAmbient u_ambient;
uniform uint u_nLightsDirectional;
uniform LightDirectional u_directional[MAX_LIGHTS_DIRECTIONAL];

flat out vec4 v_color;
#endif 
// END: offer buffers for light types

#ifdef LIGHT_FLAT
in vec3 a_normalFace;
uniform mat4 u_normal;
#endif


in vec3 a_position;
uniform mat4 u_projection;

void main() {
  gl_Position = u_projection * vec4(a_position, 1.0);

// START: calculate flat lighting
  #ifdef LIGHT_FLAT
  vec3 normal = normalize(mat3(u_normal) * a_normalFace);
  v_color = u_ambient.color;
  for(uint i = 0u; i < u_nLightsDirectional; i++) {
    float illumination = -dot(normal, u_directional[i].direction);
    if(illumination > 0.0f)
      v_color += illumination * u_directional[i].color;
  }
  v_color.a = 1.0;
  #endif
// END: calculate flat lighting
}