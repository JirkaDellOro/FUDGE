#define GLSLIFY 1
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