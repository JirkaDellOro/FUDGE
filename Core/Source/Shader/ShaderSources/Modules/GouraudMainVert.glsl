#define GLSLIFY 1
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
}