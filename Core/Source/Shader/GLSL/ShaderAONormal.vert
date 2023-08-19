#version 300 es
/**
*Renders normalinformation onto texture
*@authors Roland Heer, HFU, 2023
*/
uniform vec3 u_vctCamera;
uniform mat4 u_mtxMeshToView;
uniform mat4 u_mtxWorldToView;
uniform mat4 u_mtxMeshToWorld;
in vec3 a_vctPosition;
in vec3 a_vctNormal;

out vec4 v_vctPosition;
out mat4 v_mtxMeshToWorld;
out vec3 v_vctCamera;
out vec4 v_vctNormal;

void main() {
    vec4 vctPosition = vec4(a_vctPosition, 1.0f);
    mat4 mtxMeshToView = u_mtxMeshToView;
    v_mtxMeshToWorld = u_mtxMeshToWorld;
    v_vctCamera = u_vctCamera;
    gl_Position = mtxMeshToView * vctPosition;
    v_vctPosition = vctPosition;
    vec4 vctNormal = vec4(a_vctNormal, 1.0f);
    v_vctNormal = u_mtxMeshToWorld * vctNormal;
    //v_vctNormal = u_mtxMeshToView * vctNormal;
}
