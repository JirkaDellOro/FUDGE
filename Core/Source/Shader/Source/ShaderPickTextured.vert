#version 300 es
/**
* Renders for Raycasting
* @authors Jirka Dell'Oro-Friedl, HFU, 2019
*/
in vec3 a_position;       
in vec2 a_textureUVs;
uniform mat4 u_projection;
uniform mat3 u_pivot;

out vec2 v_textureUVs;

void main() {   
    gl_Position = u_projection * vec4(a_position, 1.0);
    v_textureUVs = vec2(u_pivot * vec3(a_textureUVs, 1.0)).xy;
}