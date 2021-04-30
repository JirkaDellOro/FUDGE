#version 300 es
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
        