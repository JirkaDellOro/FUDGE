#version 300 es
/**
* Matcap (Material Capture) shading. The texture provided by the coat is used as a matcap material. 
* Implementation based on https://www.clicktorelease.com/blog/creating-spherical-environment-mapping-shader/
* @authors Simon Storl-Schulke, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
*/
in vec3 a_vctPosition;
in vec3 a_vctNormalFace;

uniform mat4 u_mtxMeshToView;

out vec2 texcoords_smooth;
flat out vec2 texcoords_flat;

void main() {
    texcoords_smooth = normalize(mat3(u_mtxMeshToView) * a_vctNormalFace).xy * 0.5 - 0.5;
    texcoords_flat = texcoords_smooth;
    gl_Position = u_mtxMeshToView * vec4(a_vctPosition, 1.0);
}