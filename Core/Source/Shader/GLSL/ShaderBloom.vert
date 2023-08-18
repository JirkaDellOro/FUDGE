#version 300 es

/**
* Bloom Vertex - Shader. Sets Values for Bloom Fragment - Shader
* @authors 2023, Roland Heer, HFU, 2023 | Jirka Dell'Oro-Friedl, HFU, 2023
*/

uniform vec3 u_vctCamera;
uniform mat4 u_mtxMeshToView;
uniform mat4 u_mtxMeshToWorld;
in vec3 a_vctPosition;

out vec4 v_vctPosition;
out mat4 v_mtxMeshToWorld;
out vec3 v_vctCamera;

void main() {
    vec4 vctPosition = vec4(a_vctPosition, 1.0);
    mat4 mtxMeshToView = u_mtxMeshToView;
    v_mtxMeshToWorld = u_mtxMeshToWorld;
    v_vctCamera = u_vctCamera;
    gl_Position = mtxMeshToView * vctPosition;
    v_vctPosition = vctPosition;
}