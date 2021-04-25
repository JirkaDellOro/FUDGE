#version 300 es
/**
* Smooth color shading
* @authors Luis Keck, HFU, 2021
*/
struct LightAmbient {
    vec4 color;
};
struct LightDirectional {
    vec4 color;
    vec3 direction;
};

const uint MAX_LIGHTS_DIRECTIONAL = 10u;

in vec3 a_position;
in vec3 a_normal;
uniform mat4 u_world;
uniform mat4 u_projection;

uniform LightAmbient u_ambient;
uniform uint u_nLightsDirectional;
uniform LightDirectional u_directional[MAX_LIGHTS_DIRECTIONAL];
out vec4 v_color;

void main() {
    gl_Position = u_projection * vec4(a_position, 1.0);
    vec3 normal = normalize(mat3(u_world) * a_normal);

    v_color = u_ambient.color;
    for(uint i = 0u; i < u_nLightsDirectional; i++) {
        float illumination = -dot(normal, u_directional[i].direction);
        if(illumination > 0.0f)
            v_color += illumination * u_directional[i].color; 
    }

    v_color.a = 1.0;
}