namespace FudgeCore {
  @RenderInjectorShader.decorate
  export abstract class ShaderPhong extends Shader {
    public static readonly iSubclass: number = Shader.registerSubclass(ShaderPhong);

    public static vertexShaderSource: string = 
    `#version 300 es
/**
* Phong shading
* Implementation based on https://www.gsn-lib.org/docs/nodes/ShaderPluginNode.php
* @authors Luis Keck, HFU, 2021
*/
precision highp float;

in vec3 a_position;
in vec3 a_normalVertex;
uniform mat4 u_world;
uniform mat4 u_projection;
uniform mat4 u_normal;

out vec3 f_normal;
out vec3 v_position;

void main() {
  f_normal = vec3(u_normal * vec4(a_normalVertex, 0.0));
  vec4 v_position4 = u_world * vec4(a_position, 1.0);
  v_position = vec3(v_position4) / v_position4.w;
  gl_Position = u_projection * vec4(a_position, 1.0);
}
        `;
    
    public static fragmentShaderSource: string = 
    `#version 300 es
/**
* Phong shading
* Implementation based on https://www.gsn-lib.org/docs/nodes/ShaderPluginNode.php
* @authors Luis Keck, HFU, 2021
*/
precision highp float;

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

in vec3 f_normal;
in vec3 v_position;
uniform vec4 u_color;
uniform float u_shininess;
out vec4 frag;

vec3 calculateReflection(vec3 light_dir, vec3 view_dir, vec3 normal, float shininess) {
    vec3 color = vec3(1);
    vec3 R = reflect(-light_dir, normal);
    float spec_dot = max(dot(R, view_dir), 0.0);
    color += pow(spec_dot, shininess);
    return color;
}

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
}       `;
  }
}