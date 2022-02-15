#version 300 es
/**
* Universal Shader as base for many others. Controlled by compiler directives
* @authors 2021, Luis Keck, HFU, 2021 | Jirka Dell'Oro-Friedl, HFU, 2021
*/

  // MINIMAL (no define needed): buffers for vertex position and transformation
in vec3 a_position;
uniform mat4 u_projection;


// LIGHT: offer buffers for lighting vertices with different light types
  #if defined(LIGHT)
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
  #endif 

  // FLAT: offer buffers for face normals and their transformation
  #if defined(FLAT)
in vec3 a_normalFace;
uniform mat4 u_normal;
flat out vec4 v_color;
  #else
  // regular output if not FLAT
out vec4 v_color;
  #endif

  // TEXTURE: offer buffers for UVs and pivot matrix
  #if defined(TEXTURE)
in vec2 a_textureUVs;
uniform mat3 u_pivot;
out vec2 v_textureUVs;
  #endif

  // GOURAUD: offer buffers for vertex normals, their transformation and the shininess
  #if defined(GOURAUD)
in vec3 a_normalVertex;
uniform mat4 u_world;
uniform mat4 u_normal;
uniform float u_shininess;
  #endif

vec3 calculateReflection(vec3 light_dir, vec3 view_dir, vec3 normal, float shininess) {
  vec3 color = vec3(1);
  vec3 R = reflect(-light_dir, normal);
  float spec_dot = max(dot(R, view_dir), 0.0);
  color += pow(spec_dot, shininess);
  return color;
}

void main() {
    // MINIMAL
  gl_Position = u_projection * vec4(a_position, 1.0);

    // FLAT: calculate flat lighting
    #if defined(FLAT)
  vec3 normal = normalize(mat3(u_normal) * a_normalFace);
  v_color = u_ambient.color;
  for(uint i = 0u; i < u_nLightsDirectional; i++) {
    float illumination = -dot(normal, u_directional[i].direction);
    if(illumination > 0.0f)
      v_color += illumination * u_directional[i].color;
  }
    #endif

    // GOURAUD: calculate gouraud lighting on vertices
    #if defined(GOURAUD)
  vec4 v_position4 = u_world * vec4(a_normalVertex, 1);
  vec3 v_position = vec3(v_position4) / v_position4.w;
  vec3 N = normalize(vec3(u_normal * vec4(a_normalVertex, 0)));

  v_color = u_ambient.color;
  for(uint i = 0u; i < u_nLightsDirectional; i++) {
    vec3 light_dir = normalize(-u_directional[i].direction);
    vec3 view_dir = normalize(v_position);

    float illuminance = dot(light_dir, N);
    if(illuminance > 0.0) {
      vec3 reflection = calculateReflection(light_dir, view_dir, N, u_shininess);
      v_color += vec4(reflection, 1) * illuminance * u_directional[i].color;
    }
  }
    #endif

    // TEXTURE: transform UVs
    #if defined(TEXTURE)
  v_textureUVs = vec2(u_pivot * vec3(a_textureUVs, 1.0)).xy;
    #endif

    // always full opacity for now...
  v_color.a = 1.0;
}