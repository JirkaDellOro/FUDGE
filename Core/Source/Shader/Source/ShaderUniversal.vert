#version 300 es
/**
* Universal Shader as base for many others. Controlled by compiler directives
* @authors 2021, Luis Keck, HFU, 2021 | Jirka Dell'Oro-Friedl, HFU, 2021
*/

// LIGHT_VERTEX: offer buffers for lighting vertices with different light types
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

// LIGHT_FLAT: offer buffers for face normals and their transformation
#ifdef LIGHT_FLAT
in vec3 a_normalFace;
uniform mat4 u_normal;
#endif

// TEXTURE: offer buffers for UVs and pivot matrix
#ifdef TEXTURE
in vec2 a_textureUVs;
uniform mat3 u_pivot;
out vec2 v_textureUVs;
#endif

// MINIMAL (no define needed): buffers for vertex position and transformation
in vec3 a_position;
uniform mat4 u_projection;

void main() {
  // MINIMAL
  gl_Position = u_projection * vec4(a_position, 1.0);

  // LIGHT_FLAT: calculate flat lighting
  #ifdef LIGHT_FLAT
  vec3 normal = normalize(mat3(u_normal) * a_normalFace);
  v_color = u_ambient.color;
  for(uint i = 0u; i < u_nLightsDirectional; i++) {
    float illumination = -dot(normal, u_directional[i].direction);
    if(illumination > 0.0f)
      v_color += illumination * u_directional[i].color;
  }

  // TEXTURE: transform UVs
  v_textureUVs = vec2(u_pivot * vec3(a_textureUVs, 1.0)).xy;

  // always full opacity for now...
  v_color.a = 1.0;
  #endif
}