#version 300 es
precision mediump float;

uniform vec4 u_color;
flat in vec4 v_color;
out vec4 frag;

void main() {
    frag = u_color * v_color;
}