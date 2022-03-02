#version 300 es
/**
* Renders for Raycasting
* @authors Jirka Dell'Oro-Friedl, HFU, 2019
*/
in vec3 a_position;       
uniform mat4 u_mtxProjection;

void main() {   
    gl_Position = u_mtxProjection * vec4(a_position, 1.0);
}