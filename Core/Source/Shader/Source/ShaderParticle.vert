#version 300 es
/**
* TODO: write this
* @authors Jirka Dell'Oro-Friedl, HFU, 2021 | Jonas Plotzky, HFU, 2022
*/

uniform mat4 u_mtxMeshToWorld;
uniform mat4 u_mtxWorldToView;
uniform vec3 u_vctCamera;
in vec3 a_vctPosition;

uniform mat3 u_mtxPivot;
in vec2 a_vctTexture;
out vec2 v_vctTexture;

out vec4 v_vctColor;

uniform float u_fNumberOfParticles;
uniform float u_fTime;
uniform sampler2D u_fRandomNumbers;

uniform bool u_bFaceCamera;
uniform bool u_bRestrict;

mat4 lookAt(vec3 _vctTranslation, vec3 _vctTarget) {
  vec3 vctUp = vec3(0.0, 1.0, 0.0);
  vec3 zAxis = normalize(_vctTarget - _vctTranslation);
  vec3 xAxis = normalize(cross(vctUp, zAxis));
  vec3 yAxis = u_bRestrict ? vctUp : normalize(cross(zAxis, xAxis));
  zAxis = u_bRestrict ? normalize(cross(xAxis, vctUp)) : zAxis;

  return mat4(
    xAxis.x, xAxis.y, xAxis.z, 0.0,
    yAxis.x, yAxis.y, yAxis.z, 0.0,
    zAxis.x, zAxis.y, zAxis.z, 0.0,
    _vctTranslation.x,  _vctTranslation.y,  _vctTranslation.z, 1.0
  );
}

void main() {
  vec4 vctPosition = vec4(a_vctPosition, 1.0);
  // mat4 mtxMeshToView = u_mtxMeshToView;
  float fParticleIndex = float(gl_InstanceID);

  /*$variables*/
  /*$mtxLocal*/
  /*$mtxWorld*/

  mat4 mtxMeshToWorld = /*$mtxWorld*/ u_mtxMeshToWorld /*$mtxLocal*/;
  if (u_bFaceCamera) mtxMeshToWorld = 
    lookAt(vec3(mtxMeshToWorld[3][0], mtxMeshToWorld[3][1], mtxMeshToWorld[3][2]), u_vctCamera) * 
    mat4(
      length(vec3(mtxMeshToWorld[0][0], mtxMeshToWorld[1][0], mtxMeshToWorld[2][0])), 0.0, 0.0, 0.0,
      0.0, length(vec3(mtxMeshToWorld[0][1], mtxMeshToWorld[1][1], mtxMeshToWorld[2][1])), 0.0, 0.0,
      0.0, 0.0, length(vec3(mtxMeshToWorld[0][2], mtxMeshToWorld[1][2], mtxMeshToWorld[2][2])), 0.0,
      0.0, 0.0, 0.0, 1.0
    );

  // calculate position
  gl_Position = u_mtxWorldToView * mtxMeshToWorld * vctPosition;
  v_vctTexture = vec2(u_mtxPivot * vec3(a_vctTexture, 1.0)).xy;
  /*$color*/
}