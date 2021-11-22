#define GLSLIFY 1
vec3 calculateReflection(vec3 light_dir, vec3 view_dir, vec3 normal, float shininess) {
    vec3 color = vec3(1);
    vec3 R = reflect(-light_dir, normal);
    float spec_dot = max(dot(R, view_dir), 0.0);
    color += pow(spec_dot, shininess);
    return color;
} 