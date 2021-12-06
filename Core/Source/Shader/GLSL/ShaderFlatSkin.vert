#version 300 es

in vec3 a_position;
in vec3 a_normal;

flat out vec4 v_color;

uniform mat4 u_world;
uniform mat4 u_projection;

// Bones
struct Bone {
  mat4 matrix;
};

const uint MAX_BONES = 10u;

in uvec4 a_iBone;
in vec4 a_weight;

uniform Bone u_bones[MAX_BONES];
uniform mat4 mtxTest;

// Lights
struct LightAmbient {
  vec4 color;
};

struct LightDirectional {
  vec4 color;
  vec3 direction;
};

const uint MAX_LIGHTS_DIRECTIONAL = 10u;

uniform LightAmbient u_ambient;
uniform uint u_nLightsDirectional;
uniform LightDirectional u_directional[MAX_LIGHTS_DIRECTIONAL];

void main() {
  mat4 mtxSkin =
    a_weight.x * u_bones[a_iBone.x].matrix +
    a_weight.y * u_bones[a_iBone.y].matrix +
    a_weight.z * u_bones[a_iBone.z].matrix +
    a_weight.w * u_bones[a_iBone.w].matrix;

  gl_Position = u_projection * mtxSkin * vec4(a_position, 1.0);
  vec3 normal = normalize(transpose(inverse(mat3(u_world * mtxSkin))) * a_normal);
  
  v_color = u_ambient.color;
  for (uint i = 0u; i < u_nLightsDirectional; i++) {
    float illumination = -dot(normal, u_directional[i].direction);
    if (illumination > 0.0f)
      v_color += illumination * u_directional[i].color;
  }
  v_color.a = 1.0;
}