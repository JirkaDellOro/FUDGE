#version 300 es
/**
*Renders Framebuffer on to Renderbuffer
*@authors Roland Heer, HFU, 2023
*/
in vec3 a_vctPosition;
in vec2 a_vctTexture;
uniform mat3 u_mtxPivot;

out vec2 v_vctTexture;

void main() {
    gl_Position = vec4(a_vctPosition * 2.0, 1.0);   //The quad is scaled by 2 because a default meshQuad has vertices from -0.5 to .5 to cover the whole screen however, a range from -1 to 1 is needed
    v_vctTexture = vec2(u_mtxPivot * vec3(a_vctTexture, 1.0)).xy;
}
