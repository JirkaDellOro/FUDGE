#version 300 es
precision mediump float;
precision highp int;
/**
 * Creates a fullscreen triangle which cotains the screen quad and sets the texture coordinates accordingly.
 * @authors Roland Heer, HFU, 2023 | Jonas Plotzky, HFU, 2023
 *
 *  2  3 .
 *       .  .
 *       .     .  
 *       .        .
 *  1  1 ..........  .
 *       . screen .     .
 *       .  quad  .        .
 *  0 -1 ..........  .  .  .  .
 *    p -1        1           3
 *  t    0        1           2
 *  
 *  p == postion
 *  t == texture coordinate
 */
out vec2 v_vctTexture;

void main() {
  float x = float((gl_VertexID % 2) * 4); // 0, 4, 0
  float y = float((gl_VertexID / 2) * 4); // 0, 0, 4
  gl_Position = vec4(x - 1.0, y - 1.0, 0.0, 1.0); // (-1, -1), (3, -1), (-1, 3)
  v_vctTexture = vec2(x / 2.0, y / 2.0);  // (0, 0), (2, 0), (0, 2) -> interpolation will yield (0, 0), (1, 0), (0, 1) as the positions are double the size of the screen
}