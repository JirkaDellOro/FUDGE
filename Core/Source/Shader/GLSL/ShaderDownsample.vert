#version 300 es
/**
* ShaderDownsample sets Values for Downsampling Fragmentshader
* @authors 2023, Roland Heer, HFU, 2023 | Jirka Dell'Oro-Friedl, HFU, 2023
*/
in vec2 a_vctPosition;
in vec2 a_vctTexture;

uniform float u_width;
uniform float u_height;

out vec2 v_vctTexture;
out vec2[9] v_vctOffsets;

void main() {
    gl_Position = vec4(a_vctPosition, 0.0f, 1.0f);
    v_vctTexture = a_vctTexture;

    vec2 offset = vec2(1.0f / u_width, 1.0f / u_height);

v_vctOffsets = vec2[]
    (
        vec2(-offset.x, offset.y),  vec2(0.0, offset.y),  vec2(offset.x, offset.y),
        vec2(-offset.x, 0.0),       vec2(0.0, 0.0),       vec2(offset.x, 0.0),
        vec2(-offset.x, -offset.y), vec2(0.0, offset.y),  vec2(-offset.x, -offset.y)
    );
}