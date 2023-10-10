#version 300 es
/**
*Calculates the normal information relative to the Camera
*@authors Roland Heer, HFU, 2023
*/
uniform mat4 u_mtxMeshToView;
uniform mat4 u_mtxWorldToCamera;
uniform mat4 u_mtxNormalMeshToWorld;
in vec3 a_vctPosition;
in vec3 a_vctNormal;

#if defined(FLAT)
flat out vec4 v_vctNormal;
#else
out vec4 v_vctNormal;
#endif

void main() {
    gl_Position = u_mtxMeshToView * vec4(a_vctPosition, 1.0f);

    vec3 vctNormal = a_vctNormal;
    vctNormal = normalize(mat3(u_mtxWorldToCamera) * mat3(u_mtxNormalMeshToWorld) * vctNormal);
    vctNormal.g = vctNormal.g * -1.0f;
    vctNormal.b = vctNormal.b * -1.0f;
    v_vctNormal = vec4((vctNormal + 1.0f) / 2.0f, 1.0f);
}
