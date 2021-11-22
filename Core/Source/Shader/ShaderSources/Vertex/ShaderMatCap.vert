#version 300 es
/**
* Matcap (Material Capture) shading. The texture provided by the coat is used as a matcap material. 
* Implementation based on https://www.clicktorelease.com/blog/creating-spherical-environment-mapping-shader/
* @authors Simon Storl-Schulke, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
*/
in vec3 a_position;
in vec3 a_normalFace;

uniform mat4 u_projection;

out vec2 texcoords_smooth;
flat out vec2 texcoords_flat;

void main() {
    texcoords_smooth = normalize(mat3(u_projection) * a_normalFace).xy * 0.5 - 0.5;
    texcoords_flat = texcoords_smooth;
    gl_Position = u_projection * vec4(a_position, 1.0);
}