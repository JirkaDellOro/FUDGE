#version 300 es

/**
* Mist Vertex - Shader. Sets Values for Mist Fragment - Shader
* @authors 2023, Roland Heer, HFU, 2023 | Jirka Dell'Oro-Friedl, HFU, 2023
*/

uniform vec3 u_vctCamera;
uniform mat4 u_mtxMeshToView;

in vec3 a_vctPosition;

out vec4 v_vctPosition;

void main() {
    vec4 vctPosition = vec4(a_vctPosition, 1.0);
    mat4 mtxMeshToView = u_mtxMeshToView;
    gl_Position = mtxMeshToView * vctPosition;
    v_vctPosition = vctPosition;
}