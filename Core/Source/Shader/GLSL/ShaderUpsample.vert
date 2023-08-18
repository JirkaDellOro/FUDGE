#version 300 es
/**
* ShaderDownsample sets Values for Downsampling Fragmentshader
* @authors 2023, Roland Heer, HFU, 2023 | Jirka Dell'Oro-Friedl, HFU, 2023
*/
in vec2 a_vctPosition;
in vec2 a_vctTexture;

out vec2 v_vctTexture;

void main() {
    gl_Position = vec4(a_vctPosition, 0.0, 1.0);
    v_vctTexture = a_vctTexture;
}