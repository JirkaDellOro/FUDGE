#version 300 es
/**
* Single color shading
* @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
*/
precision mediump float;

uniform vec4 u_color;
out vec4 frag;

void main() {
  // if (gl_FragCoord.x < 200.0)
  frag = u_color;
  //    frag = vec4(1.0,1.0,1.0,1.0);
}