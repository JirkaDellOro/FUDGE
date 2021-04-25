#version 300 es
/**
* Gouraud shading
* Implementation based on https://www.gsn-lib.org/docs/nodes/ShaderPluginNode.php
* @authors Luis Keck, HFU, 2021
*/
precision highp float;

uniform vec4 u_color;
in vec4 v_color;
out vec4 frag;

void main()
{
	frag = u_color * v_color;
}