#version 300 es
/**
* Calculates depth from camera based on near- and farplane
* @authors Roland Heer, HFU, 2023 | Jirka Dell'Oro-Friedl, HFU, 2023 | Jonas Plotzky, HFU, 2023
*/
precision mediump float;
precision highp int;

uniform float u_nearPlane;
uniform float u_farPlane;
uniform vec3 u_vctCamera;

in vec3 v_vctPosition;
out vec4 vctFrag;

void main() {
  float distance = length(v_vctPosition - u_vctCamera);
  float fogAmount = min(max((distance - u_nearPlane) / (u_farPlane - u_nearPlane), 0.0), 1.0);
  vec3 vctfog = vec3(-pow(fogAmount, 2.0) + (2.0 * fogAmount)); //lets Fog appear quicker and fall off slower results in a more gradual falloff
  vctFrag = vec4(vctfog, 1.0);
}
