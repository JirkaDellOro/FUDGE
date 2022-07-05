#version 300 es
/**
* TODO: write this
* @authors Jirka Dell'Oro-Friedl, HFU, 2021 | Jonas Plotzky, HFU, 2022
*/

uniform mat4 u_mtxMeshToWorld;
// uniform mat4 u_mtxMeshToView;
uniform mat4 u_mtxWorldToView;
uniform vec3 u_vctCamera;
// in vec3 a_vctPosition;

uniform mat3 u_mtxPivot;
in vec2 a_vctTexture;
out vec2 v_vctTexture;

out vec4 v_vctColor;

uniform float u_fNumberOfParticles;
uniform float u_fTime;
uniform sampler2D u_fRandomNumbers;
// uniform mat4 u_mtxLookAt;

void main() {
  vec4 vctPosition = vec4(a_vctPosition, 1.0);
  // mat4 mtxMeshToView = u_mtxMeshToView;
  float fParticleIndex = float(gl_InstanceID);

  /*$variables*/
  /*$mtxLocal*/
  /*$mtxWorld*/

  // calculate position
  gl_Position = u_mtxWorldToView * /*$mtxWorld*/ u_mtxMeshToWorld * /*$mtxLocal*/ vctPosition;
  v_vctTexture = vec2(u_mtxPivot * vec3(a_vctTexture, 1.0)).xy;
  /*$color*/
}