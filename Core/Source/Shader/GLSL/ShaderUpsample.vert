#version 300 es
/**
* ShaderUpsample sets values for upsampling fragmentshader
* @authors 2023, Roland Heer, HFU, 2023 | Jirka Dell'Oro-Friedl, HFU, 2023 | Jonas Plotzky, HFU, 2023
*/
uniform float u_width;
uniform float u_height;

out vec2 v_vctTexture;
flat out vec2[9] v_vctOffsets;

void main() {
  // fullscreen triangle, contains screen quad
  float x = float((gl_VertexID % 2) * 4); // 0, 4, 0
  float y = float((gl_VertexID / 2) * 4); // 0, 0, 4
  gl_Position = vec4(x - 1.0, y - 1.0, 0.0, 1.0); // (-1, -1), (3, -1), (-1, 3)
  v_vctTexture = vec2(x / 2.0, y / 2.0); // (0, 0), (2, 0), (0, 2)

  vec2 offset = vec2(1.0f / u_width, 1.0f / u_height);

  v_vctOffsets = vec2[](
    vec2(-offset.x, offset.y),  vec2(0.0, offset.y),  vec2(offset.x, offset.y),
    vec2(-offset.x, 0.0),       vec2(0.0, 0.0),       vec2(offset.x, 0.0),
    vec2(-offset.x, -offset.y), vec2(0.0, -offset.y),  vec2(offset.x, -offset.y)
  );
}