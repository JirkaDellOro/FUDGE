HEAD_VERT//
#version 300 es
precision highp float;
in vec3 a_position;//

HEAD_FRAG//
#version 300 es
precision highp float;//

NORMAL_FACE//
in vec3 a_normalFace;//

NORMAL_VERTEX//
in vec3 a_normalVertex;//

MATRIX_WORLD//
uniform mat4 u_world;//

MATRIX_PROJECTION//
uniform mat4 u_projection;//

MATRIX_NORMAL//
uniform mat4 u_normal;//

COLOR_OUT//
out vec4 v_color;//

COLOR_OUT_FLAT//
flat out vec4 v_color;//

COLOR_IN//
in vec4 v_color;//

COLOR_IN_FLAT//
flat in vec4 v_color;//

COLOR_U//
uniform vec4 u_color;//

SHININESS//
uniform float u_shininess;//

FRAG_OUT//
out vec4 frag;//

LIGHTS//
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
uniform LightDirectional u_directional[MAX_LIGHTS_DIRECTIONAL];//

REFLECTION//
vec3 calculateReflection(vec3 light_dir, vec3 view_dir, vec3 normal, float shininess) {
    vec3 color = vec3(1);
    vec3 R = reflect(-light_dir, normal);
    float spec_dot = max(dot(R, view_dir), 0.0);
    color += pow(spec_dot, shininess);
    return color;
}//

FLAT_MAIN_VERT//
void main() {
    gl_Position = u_projection * vec4(a_position, 1.0);
    vec3 normal = normalize(mat3(u_world) * a_normalFace);
    v_color = u_ambient.color;
    for(uint i = 0u; i < u_nLightsDirectional; i++) {
        float illumination = -dot(normal, u_directional[i].direction);
        if(illumination > 0.0f)
            v_color += illumination * u_directional[i].color;
    }
    v_color.a = 1.0;
}//

BASIC_MAIN_FRAG//
void main() {
    frag = u_color * v_color;
}//

GOURAUD_MAIN_VERT//
void main() {
    gl_Position = u_projection * vec4(a_position, 1.0);
    vec4 v_position4 = u_world * vec4(a_normalVertex, 1.0);
    vec3 v_position = vec3(v_position4) / v_position4.w;
    vec3 N = normalize(vec3(u_normal * vec4(a_normalVertex, 0.0)));
    v_color = u_ambient.color;
    for(uint i = 0u; i < u_nLightsDirectional; i++) {
        vec3 light_dir = normalize(-u_directional[i].direction);
        vec3 view_dir = normalize(v_position);
        float illuminance = dot(light_dir, N);
        if(illuminance > 0.0) {
            vec3 reflection = calculateReflection(light_dir, view_dir, N, u_shininess);
            v_color += vec4(reflection, 1.0) * illuminance * u_directional[i].color;
        }
    }
    v_color.a = 1.0;
}//

PHONG_MAIN_VERT//
out vec3 f_normal;
out vec3 v_position;
void main() {
    f_normal = vec3(u_normal * vec4(a_normalVertex, 0.0));
    vec4 v_position4 = u_world * vec4(a_position, 1.0);
    v_position = vec3(v_position4) / v_position4.w;
    gl_Position = u_projection * vec4(a_position, 1.0);
}//

PHONG_MAIN_FRAG//
void main() {
    frag = u_ambient.color;
    for(uint i = 0u; i < u_nLightsDirectional; i++) {
        vec3 light_dir = normalize(-u_directional[i].direction);
        vec3 view_dir = normalize(v_position);
        vec3 N = normalize(f_normal);
        float illuminance = dot(light_dir, N);
        if(illuminance > 0.0) {
            vec3 reflection = calculateReflection(light_dir, view_dir, N, u_shininess);
            frag += vec4(reflection, 1.0) * illuminance * u_directional[i].color;
        }
    }
    frag *= u_color;
    frag.a = 1.0;
}