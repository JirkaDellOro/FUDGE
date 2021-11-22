#version 300 es
/**
* Matcap (Material Capture) shading. The texture provided by the coat is used as a matcap material. 
* Implementation based on https://www.clicktorelease.com/blog/creating-spherical-environment-mapping-shader/
* @authors Simon Storl-Schulke, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
*/
precision mediump float;

uniform vec4 u_tint_color;
uniform int shade_smooth;
uniform sampler2D u_texture;

in vec2 texcoords_smooth;
flat in vec2 texcoords_flat;

out vec4 frag;

void main() {

    if (shade_smooth > 0) {
      frag = u_tint_color * texture(u_texture, texcoords_smooth) * 2.0;
    } else {
      frag = u_tint_color * texture(u_texture, texcoords_flat) * 2.0;
    }
}