#version 300 es

in vec3 a_position;
in vec3 a_normal;

uniform mat4 u_world;
uniform mat4 u_projection;

flat out vec4 v_color;

// Bones
const uint MAX_BONES = 256u;

in vec4 a_iBone;
in vec4 a_weight;

uniform mat4 u_mtxBones[MAX_BONES];

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
  mat4 skinMatrix =
    a_weight.x * u_mtxBones[uint(a_iBone.x)] +
    a_weight.y * u_mtxBones[uint(a_iBone.y)] +
    a_weight.z * u_mtxBones[uint(a_iBone.z)] +
    a_weight.w * u_mtxBones[uint(a_iBone.w)];

  gl_Position = u_projection * skinMatrix * vec4(a_position, 1.0);
  vec3 normal = normalize(transpose(inverse(mat3(u_world * skinMatrix))) * a_normal);
  
  v_color = u_ambient.color;
  for (uint i = 0u; i < u_nLightsDirectional; i++) {
    float illumination = -dot(normal, u_directional[i].direction);
    if (illumination > 0.0f)
      v_color += illumination * u_directional[i].color;
  }
  v_color.a = 1.0;
}