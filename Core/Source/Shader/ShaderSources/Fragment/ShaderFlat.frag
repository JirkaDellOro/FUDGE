#version 300 es
/**
* Flat color shading
* @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
*/
precision mediump float;
#define GLSLIFY 1
uniform vec4 u_color;

flat in vec4 v_color;
out vec4 frag;

void main() {
    frag = u_color * v_color;
}