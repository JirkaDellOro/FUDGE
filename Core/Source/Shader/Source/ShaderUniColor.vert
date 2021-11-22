#version 300 es
/**
* Single color shading
* @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
*/
in vec3 a_position;
uniform mat4 u_projection;

void main() {   
    gl_Position = u_projection * vec4(a_position, 1.0);
}