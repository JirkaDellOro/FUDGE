#version 300 es

/**
* Mist vertexshader. Sets values for mist fragmentshader
* @authors 2023, Roland Heer, HFU, 2023 | Jirka Dell'Oro-Friedl, HFU, 2023 | Jonas Plotzky, HFU, 2023
*/

uniform mat4 u_mtxMeshToView;
uniform mat4 u_mtxMeshToWorld;

in vec3 a_vctPosition;
out vec3 v_vctPosition;

void main() {
  vec4 vctPosition = vec4(a_vctPosition, 1.0);
  v_vctPosition = vec3(u_mtxMeshToWorld * vctPosition);
  gl_Position = u_mtxMeshToView * vctPosition;
}