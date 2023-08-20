#version 300 es
/**
*Renders the depth information onto texture
*@authors Roland Heer, HFU, 2023
*/
precision mediump float;
precision highp int;

uniform float u_clipStart;
uniform float u_clipEnd;
in float v_depth;

out vec4 vctFrag;

void main() {
    float depth = v_depth;
    depth = min(max((depth - u_clipStart) / (u_clipEnd / 2.0f - u_clipStart), 0.0f), 1.0f);
    depth = ((log(depth + 0.001f) / log(20.0f)) / 3.0f) + 1.0f;
    vctFrag = vec4(vec3(depth), 1.0f);
}
