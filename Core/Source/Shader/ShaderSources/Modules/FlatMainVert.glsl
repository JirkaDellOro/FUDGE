#define GLSLIFY 1
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
}