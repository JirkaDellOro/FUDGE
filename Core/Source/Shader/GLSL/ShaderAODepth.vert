#version 300 es
/**
*Calculates the depth Information relative to the Camera
*@authors Roland Heer, HFU, 2023
*/
uniform mat4 u_mtxMeshToView;
uniform mat4 u_mtxWorldToCamera;
uniform mat4 u_mtxNormalMeshToWorld;
uniform vec3 u_vctCamera;

in vec3 a_vctPosition;

out float v_depth;

void main() {
    vec4 vctPosition = (u_mtxMeshToView * vec4(a_vctPosition, 1.0f));
    gl_Position = vctPosition;
    float depth = vctPosition.b;
    v_depth = depth;
}
