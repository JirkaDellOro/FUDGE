#version 300 es
/**
*Renders depthinformation onto texture
*@authors Roland Heer, HFU, 2023
*/
in vec2 a_vctPosition;
in vec2 a_vctTexture;

out vec2 v_vctTexture;

void main() {
    gl_Position = vec4(a_vctPosition, 0.0, 1.0);
    v_vctTexture = a_vctTexture;
}
