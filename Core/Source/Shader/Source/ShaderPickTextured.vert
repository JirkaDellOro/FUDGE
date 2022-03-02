#version 300 es
/**
* Renders for Raycasting
* @authors Jirka Dell'Oro-Friedl, HFU, 2019
*/
in vec3 a_vctPosition;       
in vec2 a_vctTexture;
uniform mat4 u_mtxProjection;
uniform mat3 u_mtxPivot;

out vec2 v_textureUVs;

void main() {   
    gl_Position = u_mtxProjection * vec4(a_vctPosition, 1.0);
    v_textureUVs = vec2(u_mtxPivot * vec3(a_vctTexture, 1.0)).xy;
}