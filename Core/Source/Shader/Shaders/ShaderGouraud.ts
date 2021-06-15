namespace FudgeCore {
  @RenderInjectorShader.decorate
  export abstract class ShaderGouraud extends Shader {
    public static readonly iSubclass: number = Shader.registerSubclass(ShaderGouraud);

    public static vertexShaderSource: string = 
    `#version 300 es
/**
* Gouraud shading
* Implementation based on https://www.gsn-lib.org/docs/nodes/ShaderPluginNode.php
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
uniform LightAmbient u_ambient;
uniform uint u_nLightsDirectional;
uniform LightDirectional u_directional[MAX_LIGHTS_DIRECTIONAL];

vec3 calculateReflection(vec3 light_dir, vec3 view_dir, vec3 normal, float shininess) {
    vec3 color = vec3(1);
    vec3 R = reflect(-light_dir, normal);
    float spec_dot = max(dot(R, view_dir), 0.0);
    color += pow(spec_dot, shininess);
    return color;
}

in vec3 a_position;
in vec3 a_normalVertex;
uniform mat4 u_world;
uniform mat4 u_projection;
uniform mat4 u_normal;
uniform float u_shininess;
out vec4 v_color;

void main() {
    gl_Position = u_projection * vec4(a_position, 1);
    vec4 v_position4 = u_world * vec4(a_normalVertex, 1);
    vec3 v_position = vec3(v_position4) / v_position4.w;
    vec3 N = normalize(vec3(u_normal * vec4(a_normalVertex, 0)));

    v_color = u_ambient.color;
    for(uint i = 0u; i < u_nLightsDirectional; i++) {
        vec3 light_dir = normalize(-u_directional[i].direction);
        vec3 view_dir = normalize(v_position);

        float illuminance = dot(light_dir, N);
        if(illuminance > 0.0) {
            vec3 reflection = calculateReflection(light_dir, view_dir, N, u_shininess);
            v_color += vec4(reflection, 1) * illuminance * u_directional[i].color;
        }
    }
    v_color.a = 1.0;
}`;
    
    public static fragmentShaderSource: string = 
    `#version 300 es
/**
* Gouraud shading
* Implementation based on https://www.gsn-lib.org/docs/nodes/ShaderPluginNode.php
* @authors Luis Keck, HFU, 2021
*/
precision highp float;

uniform vec4 u_color;

in vec4 v_color;
out vec4 frag;

void main()
{
	frag = u_color * v_color;
}`;
  }
}