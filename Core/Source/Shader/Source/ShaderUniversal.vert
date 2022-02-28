#version 300 es
/**
* Universal Shader as base for many others. Controlled by compiler directives
* @authors 2021, Luis Keck, HFU, 2021 | Jirka Dell'Oro-Friedl, HFU, 2021
*/

  // MINIMAL (no define needed): buffers for transformation
uniform mat4 u_projection;

  // FLAT: offer buffers for face normals and their transformation
  #if defined(FLAT)
in vec3 a_positionFlat;
in vec3 a_normalFace;
uniform mat4 u_normal;
flat out vec4 v_color;
  #else
  // regular if not FLAT
in vec3 a_position;
out vec4 v_color;
  #endif

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

  // TEXTURE: offer buffers for UVs and pivot matrix
  #if defined(TEXTURE)
in vec2 a_textureUVs;
uniform mat3 u_pivot;
out vec2 v_textureUVs;
  #endif

  // GOURAUD: offer buffers for vertex normals, their transformation and the shininess
  #if defined(GOURAUD)
in vec3 a_normalVertex;
uniform mat4 u_normal;
  #endif

  // CAMERA: offer buffer and functionality for specular reflection depending on the camera-position
  #if defined(CAMERA)
uniform float u_shininess;
uniform mat4 u_world;
uniform vec3 u_camera;

float calculateReflection(vec3 light_dir, vec3 view_dir, vec3 normal, float shininess) {
  vec3 reflection = max(reflect(-light_dir, normal), 0.0);
  float spec_dot = dot(reflection, view_dir);
  return pow(max(spec_dot, 0.0), shininess);
}
  #endif

void main() {
  vec4 posVertex;

    #if defined(FLAT)
    // FLAT: use the special vertex and normal buffers for flat shading
  posVertex = vec4(a_positionFlat, 1.0);
  vec3 normal = normalize(mat3(u_normal) * a_normalFace);
  v_color = u_ambient.color;
    #else 
  posVertex = vec4(a_position, 1.0);
    #endif

    // use the regular vertex buffer
  gl_Position = u_projection * posVertex;

    // GOURAUD: use the vertex normals
    #if defined(GOURAUD)
  v_color = u_ambient.color;
  vec3 normal = normalize(mat3(u_normal) * a_normalVertex);
    #endif

    #if defined(LIGHT)
  // calculate the directional lighting effect
  for(uint i = 0u; i < u_nLightsDirectional; i++) {
    float illumination = -dot(normal, u_directional[i].direction);
    if(illumination > 0.0f)
      v_color += illumination * u_directional[i].color;
  }
    #endif

    #if defined(CAMERA)
  vec3 view_dir = normalize(vec3(u_world * posVertex) - u_camera);
  for(uint i = 0u; i < u_nLightsDirectional; i++) {
    float reflection = calculateReflection(u_directional[i].direction, view_dir, normal, u_shininess);
    // v_color = /* (1.0 - reflection) * */ v_color + reflection * u_directional[i].color;
  }
    #endif

    // TEXTURE: transform UVs
    #if defined(TEXTURE)
  v_textureUVs = vec2(u_pivot * vec3(a_textureUVs, 1.0)).xy;
    #endif

    // always full opacity for now...
  v_color.a = 1.0;
}