#version 300 es
/**
*Sets up the data for the ShaderScreen fragmentshader
*@authors Roland Heer, HFU, 2023
*/
in vec2 a_vctPosition;
in vec2 a_vctTexture;

uniform float u_width;
uniform float u_height;

out vec2 v_vctTexture;
out vec2 v_vctOffsets[25];

void main() {
    gl_Position = vec4(a_vctPosition, 0.0, 1.0);
    v_vctTexture = a_vctTexture;

    vec2 offset = vec2(1.0f / u_width, 1.0f / u_height);

    //TODO: Maybe try Downsampling instead of this giant gaussian kernel
    v_vctOffsets = vec2[]
    (
        vec2(-2.0*offset.x, 2.0*offset.y),  vec2(-offset.x, 2.0*offset.y),  vec2(0.0, 2.0*offset.y),    vec2(offset.x,2.0* offset.y),   vec2(2.0*offset.x,2.0* offset.y), 
        vec2(-2.0*offset.x, offset.y),      vec2(-offset.x, offset.y),      vec2(0.0, offset.y),        vec2(offset.x, offset.y),       vec2(2.0*offset.x, offset.y),
        vec2(-2.0*offset.x, 0.0),           vec2(-offset.x, 0.0),           vec2(0.0, 0.0),             vec2(offset.x, 0.0),            vec2(2.0*offset.x, 0.0),
        vec2(-2.0*offset.x, -offset.y),     vec2(-offset.x, -offset.y),     vec2(0.0, -offset.y),       vec2(offset.x, -offset.y),      vec2(2.0*offset.x, -offset.y),
        vec2(-2.0*offset.x, -2.0*offset.y), vec2(-offset.x, -2.0*offset.y), vec2(0.0, -2.0*offset.y),   vec2(offset.x,-2.0* offset.y), vec2(2.0*offset.x,-2.0* offset.y)
    );
}
