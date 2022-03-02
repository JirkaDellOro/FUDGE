#version 300 es
/**
* Phong shading
* Implementation based on https://www.gsn-lib.org/docs/nodes/ShaderPluginNode.php
* @authors Luis Keck, HFU, 2021
*/
precision highp float;

in vec3 a_vctPosition;
in vec3 a_vctNormalVertex;
uniform mat4 u_mtxWorld;
uniform mat4 u_mtxProjection;
uniform mat4 u_mtxNormal;

out vec3 f_normal;
out vec3 v_position;

void main() {
  f_normal = vec3(u_mtxNormal * vec4(a_vctNormalVertex, 0.0));
  vec4 v_position4 = u_mtxWorld * vec4(a_vctPosition, 1.0);
  v_position = vec3(v_position4) / v_position4.w;
  gl_Position = u_mtxProjection * vec4(a_vctPosition, 1.0);
}
        