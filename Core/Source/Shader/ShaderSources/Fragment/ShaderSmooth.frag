#version 300 es
/**
* Smooth color shading
* @authors Luis Keck, HFU, 2021
*/
precision mediump float;

uniform vec4 u_color;
in vec4 v_color;
out vec4 frag;

void main() {
    frag = u_color * v_color;
}