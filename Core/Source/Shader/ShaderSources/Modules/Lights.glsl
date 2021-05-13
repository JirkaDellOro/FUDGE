#define GLSLIFY 1
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