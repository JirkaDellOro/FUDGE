namespace FudgeCore {
  export let shaderSources: {[source: string]: string} = {};
  shaderSources["ShaderPhong.frag"] = `#version 300 es
/**
* Phong shading
* @authors Jirka Dell'Oro-Friedl, HFU, 2022
*/

precision highp float;

uniform vec4 u_vctColor;
uniform float u_fDiffuse;
uniform float u_fSpecular;
uniform mat4 u_mtxMeshToWorld;
uniform vec3 u_vctCamera;

in vec4 v_vctColor;
in vec4 v_vctPosition;
in vec3 v_vctNormal;
out vec4 vctFrag;

struct Light {
  vec4 vctColor;
  mat4 mtxShape;
  mat4 mtxShapeInverse;
};

const uint MAX_LIGHTS_DIRECTIONAL = 10u;
const uint MAX_LIGHTS_POINT = 50u;
const uint MAX_LIGHTS_SPOT = 50u;

uniform Light u_ambient;
uniform uint u_nLightsDirectional;
uniform Light u_directional[MAX_LIGHTS_DIRECTIONAL];
uniform uint u_nLightsPoint;
uniform Light u_point[MAX_LIGHTS_POINT];
uniform uint u_nLightsSpot;
uniform Light u_spot[MAX_LIGHTS_SPOT];

float calculateReflection(vec3 _vctLight, vec3 _vctView, vec3 _vctNormal, float _fSpecular) {
  if(_fSpecular <= 0.0)
    return 0.0;
  vec3 vctReflection = normalize(reflect(-_vctLight, _vctNormal));
  float fHitCamera = dot(vctReflection, _vctView);
  // attempted BLINN 
  // vec3 halfway = normalize(_vctView + _vctLight);
  // float fHitCamera = dot(-halfway, _vctNormal);
  return pow(max(fHitCamera, 0.0), _fSpecular * 10.0) * _fSpecular; // 10.0 = magic number, looks good... 
}

vec4 illuminateDirected(vec3 _vctDirection, vec3 _vctNormal, vec4 _vctColor, vec3 _vctView, float _fSpecular) {
  vec4 vctResult = vec4(0, 0, 0, 1);
  vec3 vctDirection = normalize(_vctDirection);
  float fIllumination = -dot(_vctNormal, vctDirection);
  if(fIllumination > 0.0f) {
    vctResult += u_fDiffuse * fIllumination * _vctColor;
    float fReflection = calculateReflection(vctDirection, _vctView, _vctNormal, _fSpecular);
    vctResult += fReflection * _vctColor;
  }
  return vctResult;
}

void main() {
  vctFrag = v_vctColor;
  vec3 vctView = normalize(vec3(u_mtxMeshToWorld * v_vctPosition) - u_vctCamera);

  for(uint i = 0u; i < u_nLightsDirectional; i++) {
    vec3 vctDirection = vec3(u_directional[i].mtxShape * vec4(0.0, 0.0, 1.0, 1.0));
    vctFrag += illuminateDirected(vctDirection, v_vctNormal, u_directional[i].vctColor, vctView, u_fSpecular);
  }
  // calculate point light effect
  for(uint i = 0u; i < u_nLightsPoint; i++) {
    vec3 vctPositionLight = vec3(u_point[i].mtxShape * vec4(0.0, 0.0, 0.0, 1.0));
    vec3 vctDirection = vec3(u_mtxMeshToWorld * v_vctPosition) - vctPositionLight;
    float fIntensity = 1.0 - length(mat3(u_point[i].mtxShapeInverse) * vctDirection);
    if(fIntensity < 0.0)
      continue;
    vctFrag += illuminateDirected(vctDirection, v_vctNormal, fIntensity * u_point[i].vctColor, vctView, u_fSpecular);
  }
  // calculate spot light effect
  for(uint i = 0u; i < u_nLightsSpot; i++) {
    vec3 vctPositionLight = vec3(u_spot[i].mtxShape * vec4(0.0, 0.0, 0.0, 1.0));
    vec3 vctDirection = vec3(u_mtxMeshToWorld * v_vctPosition) - vctPositionLight;
    vec3 vctDirectionInverted = mat3(u_spot[i].mtxShapeInverse) * vctDirection;
    if(vctDirectionInverted.z <= 0.0)
      continue;
    float fIntensity = 1.0 - min(1.0, 2.0 * length(vctDirectionInverted.xy) / vctDirectionInverted.z);
    fIntensity *= 1.0 - pow(vctDirectionInverted.z, 2.0);
    if(fIntensity < 0.0)
      continue;
    vctFrag += illuminateDirected(vctDirection, v_vctNormal, fIntensity * u_spot[i].vctColor, vctView, u_fSpecular);
  }
}`;
  shaderSources["ShaderPick.frag"] = `#version 300 es
/**
* Renders for Raycasting
* @authors Jirka Dell'Oro-Friedl, HFU, 2019
*/
precision mediump float;
precision highp int;

uniform int u_id;
uniform vec2 u_vctSize;
uniform vec4 u_vctColor;
out ivec4 vctFrag;

void main() {
    float id = float(u_id); 
    float pixel = trunc(gl_FragCoord.x) + u_vctSize.x * trunc(gl_FragCoord.y);

    if (pixel != id)
      discard;

    uint icolor = uint(u_vctColor.r * 255.0) << 24 | uint(u_vctColor.g * 255.0) << 16 | uint(u_vctColor.b * 255.0) << 8 | uint(u_vctColor.a * 255.0);
                
    vctFrag = ivec4(floatBitsToInt(gl_FragCoord.z), icolor, 0, 0);
}`;
  shaderSources["ShaderPick.vert"] = `#version 300 es
/**
* Renders for Raycasting
* @authors Jirka Dell'Oro-Friedl, HFU, 2019
*/
in vec3 a_vctPosition;       
uniform mat4 u_mtxMeshToView;

void main() {   
    gl_Position = u_mtxMeshToView * vec4(a_vctPosition, 1.0);
}`;
  shaderSources["ShaderPickTextured.frag"] = `#version 300 es
/**
* Renders for Raycasting
* @authors Jirka Dell'Oro-Friedl, HFU, 2019
*/
precision mediump float;
precision highp int;

uniform int u_id;
uniform vec2 u_vctSize;
in vec2 v_vctTexture;
uniform vec4 u_vctColor;
uniform sampler2D u_texture;

out ivec4 vctFrag;

void main() {
    float id = float(u_id); 
    float pixel = trunc(gl_FragCoord.x) + u_vctSize.x * trunc(gl_FragCoord.y);

    if (pixel != id)
      discard;
    
    vec4 vctColor = u_vctColor * texture(u_texture, v_vctTexture);
    uint icolor = uint(vctColor.r * 255.0) << 24 | uint(vctColor.g * 255.0) << 16 | uint(vctColor.b * 255.0) << 8 | uint(vctColor.a * 255.0);
  
  vctFrag = ivec4(floatBitsToInt(gl_FragCoord.z), icolor, floatBitsToInt(v_vctTexture.x), floatBitsToInt(v_vctTexture.y));
}`;
  shaderSources["ShaderPickTextured.vert"] = `#version 300 es
/**
* Renders for Raycasting
* @authors Jirka Dell'Oro-Friedl, HFU, 2019
*/
in vec3 a_vctPosition;       
in vec2 a_vctTexture;
uniform mat4 u_mtxMeshToView;
uniform mat3 u_mtxPivot;

out vec2 v_vctTexture;

void main() {   
    gl_Position = u_mtxMeshToView * vec4(a_vctPosition, 1.0);
    v_vctTexture = vec2(u_mtxPivot * vec3(a_vctTexture, 1.0)).xy;
}`;
  shaderSources["ShaderUniversal.frag"] = `#version 300 es
/**
* Universal Shader as base for many others. Controlled by compiler directives
* @authors Jirka Dell'Oro-Friedl, HFU, 2021
*/

precision mediump float;

  // MINIMAL (no define needed): include base color
uniform vec4 u_vctColor;

  // FLAT: input vertex colors flat, so the third of a triangle determines the color
  #if defined(FLAT) 
flat in vec4 v_vctColor;
  // LIGHT: input vertex colors for each vertex for interpolation over the face
  #elif defined(LIGHT)
in vec4 v_vctColor;
  #endif

  // TEXTURE: input UVs and texture
  #if defined(TEXTURE) || defined(MATCAP)
in vec2 v_vctTexture;
uniform sampler2D u_texture;
  #endif

out vec4 vctFrag;

void main() {
    // MINIMAL: set the base color
  vctFrag = u_vctColor;

    // VERTEX: multiply with vertex color
    #if defined(FLAT) || defined(LIGHT)
  vctFrag *= v_vctColor;
    #endif

    // TEXTURE: multiply with texel color
    #if defined(TEXTURE) || defined(MATCAP)
  vec4 vctColorTexture = texture(u_texture, v_vctTexture);
  vctFrag *= vctColorTexture;
    #endif

    // discard pixel alltogether when transparent: don't show in Z-Buffer
  if(vctFrag.a < 0.01)
    discard;
}`;
  shaderSources["ShaderUniversal.vert"] = `#version 300 es
/**
* Universal Shader as base for many others. Controlled by compiler directives
* @authors 2021, Luis Keck, HFU, 2021 | Jirka Dell'Oro-Friedl, HFU, 2021
*/

precision highp float;

  // MINIMAL (no define needed): buffers for transformation
uniform mat4 u_mtxMeshToView;
in vec3 a_vctPosition;

  // CAMERA: offer buffer and functionality for specular reflection depending on the camera-position
  #if defined(CAMERA)
uniform float u_fSpecular;
uniform mat4 u_mtxMeshToWorld;
// uniform mat4 u_mtxWorldToView;
uniform vec3 u_vctCamera;

float calculateReflection(vec3 _vctLight, vec3 _vctView, vec3 _vctNormal, float _fSpecular) {
  if(_fSpecular <= 0.0)
    return 0.0;
  vec3 vctReflection = normalize(reflect(-_vctLight, _vctNormal));
  float fHitCamera = dot(vctReflection, _vctView);
  return pow(max(fHitCamera, 0.0), _fSpecular * 10.0) * _fSpecular; // 10.0 = magic number, looks good... 
}
  #endif

  // LIGHT: offer buffers for lighting vertices with different light types
  #if defined(LIGHT)
uniform mat4 u_mtxNormalMeshToWorld;
in vec3 a_vctNormal;
uniform float u_fDiffuse;

struct Light {
  vec4 vctColor;
  mat4 mtxShape;
  mat4 mtxShapeInverse;
};

const uint MAX_LIGHTS_DIRECTIONAL = 10u;
const uint MAX_LIGHTS_POINT = 50u;
const uint MAX_LIGHTS_SPOT = 50u;

uniform Light u_ambient;
uniform uint u_nLightsDirectional;
uniform Light u_directional[MAX_LIGHTS_DIRECTIONAL];
uniform uint u_nLightsPoint;
uniform Light u_point[MAX_LIGHTS_POINT];
uniform uint u_nLightsSpot;
uniform Light u_spot[MAX_LIGHTS_SPOT];

vec4 illuminateDirected(vec3 _vctDirection, vec3 _vctNormal, vec4 _vctColor, vec3 _vctView, float _fSpecular) {
  vec4 vctResult = vec4(0, 0, 0, 1);
  vec3 vctDirection = normalize(_vctDirection);
  float fIllumination = -dot(_vctNormal, vctDirection);
  if(fIllumination > 0.0f) {
    vctResult += u_fDiffuse * fIllumination * _vctColor;
        #if defined(CAMERA)
    float fReflection = calculateReflection(vctDirection, _vctView, _vctNormal, _fSpecular);
    vctResult += fReflection * _vctColor;
        #endif
  }
  return vctResult;
}
  #endif 

  // TEXTURE: offer buffers for UVs and pivot matrix
  #if defined(TEXTURE)
uniform mat3 u_mtxPivot;
in vec2 a_vctTexture;
out vec2 v_vctTexture;
  #endif

  #if defined(MATCAP) // MatCap-shader generates texture coordinates from surface normals
in vec3 a_vctNormal;
uniform mat4 u_mtxNormalMeshToWorld;
uniform mat4 u_mtxWorldToCamera;
out vec2 v_vctTexture;
  #endif

  #if defined(PHONG)
out vec3 v_vctNormal;
out vec4 v_vctPosition;
  #endif

  #if defined(SKIN)
// uniform mat4 u_mtxMeshToWorld;
// Bones
struct Bone {
  mat4 matrix;
};

const uint MAX_BONES = 10u;

in uvec4 a_iBone;
in vec4 a_fWeight;

uniform Bone u_bones[MAX_BONES];
  #endif

  // FLAT: outbuffer is flat
  #if defined(FLAT)
flat out vec4 v_vctColor;
  #elif defined(LIGHT)
  // regular if not FLAT
out vec4 v_vctColor;
  #endif

void main() {
  vec4 vctPosition = vec4(a_vctPosition, 1.0);
  mat4 mtxMeshToView = u_mtxMeshToView;

    #if defined(LIGHT) || defined(MATCAP)
  vec3 vctNormal = a_vctNormal;
  mat4 mtxNormalMeshToWorld = u_mtxNormalMeshToWorld;
      #if defined(LIGHT)
  v_vctColor = u_fDiffuse * u_ambient.vctColor;
      #endif
    #endif

    #if defined(SKIN)
  mat4 mtxSkin = a_fWeight.x * u_bones[a_iBone.x].matrix +
    a_fWeight.y * u_bones[a_iBone.y].matrix +
    a_fWeight.z * u_bones[a_iBone.z].matrix +
    a_fWeight.w * u_bones[a_iBone.w].matrix;

  mtxMeshToView *= mtxSkin;
  mtxNormalMeshToWorld = transpose(inverse(u_mtxMeshToWorld * mtxSkin));
    #endif

    // calculate position and normal according to input and defines
  gl_Position = mtxMeshToView * vctPosition;

    #if defined(CAMERA) || defined(MATCAP)
  vec3 vctView = normalize(vec3(u_mtxMeshToWorld * vctPosition) - u_vctCamera);
    #endif

    #if defined(LIGHT)
  vctNormal = normalize(mat3(mtxNormalMeshToWorld) * vctNormal);
      #if defined(PHONG)
  v_vctNormal = vctNormal; // pass normal to fragment shader
  v_vctPosition = vctPosition;
      #endif  

    #if !defined(PHONG)
  // calculate directional light effect
  for(uint i = 0u; i < u_nLightsDirectional; i++) {
    vec3 vctDirection = vec3(u_directional[i].mtxShape * vec4(0.0, 0.0, 1.0, 1.0));
    v_vctColor += illuminateDirected(vctDirection, vctNormal, u_directional[i].vctColor, vctView, u_fSpecular);
  }
  // calculate point light effect
  for(uint i = 0u; i < u_nLightsPoint; i++) {
    vec3 vctPositionLight = vec3(u_point[i].mtxShape * vec4(0.0, 0.0, 0.0, 1.0));
    vec3 vctDirection = vec3(u_mtxMeshToWorld * vctPosition) - vctPositionLight;
    float fIntensity = 1.0 - length(mat3(u_point[i].mtxShapeInverse) * vctDirection);
    if(fIntensity < 0.0)
      continue;
    v_vctColor += illuminateDirected(vctDirection, vctNormal, fIntensity * u_point[i].vctColor, vctView, u_fSpecular);
  }
  // calculate spot light effect
  for(uint i = 0u; i < u_nLightsSpot; i++) {
    vec3 vctPositionLight = vec3(u_spot[i].mtxShape * vec4(0.0, 0.0, 0.0, 1.0));
    vec3 vctDirection = vec3(u_mtxMeshToWorld * vctPosition) - vctPositionLight;
    vec3 vctDirectionInverted = mat3(u_spot[i].mtxShapeInverse) * vctDirection;
    if(vctDirectionInverted.z <= 0.0)
      continue;
    float fIntensity = 1.0 - min(1.0, 2.0 * length(vctDirectionInverted.xy) / vctDirectionInverted.z);
    fIntensity *= 1.0 - pow(vctDirectionInverted.z, 2.0);
    if(fIntensity < 0.0)
      continue;
    v_vctColor += illuminateDirected(vctDirection, vctNormal, fIntensity * u_spot[i].vctColor, vctView, u_fSpecular);
  }
      #endif // PHONG
    #endif

    // TEXTURE: transform UVs
    #if defined(TEXTURE)
  v_vctTexture = vec2(u_mtxPivot * vec3(a_vctTexture, 1.0)).xy;
    #endif

    #if defined(MATCAP)
  vec4 vctVertexInCamera = normalize(u_mtxWorldToCamera * vctPosition);
  vctVertexInCamera.xy *= -1.0;
  mat4 mtx_RotX = mat4(1, 0, 0, 0, 0, vctVertexInCamera.z, vctVertexInCamera.y, 0, 0, -vctVertexInCamera.y, vctVertexInCamera.z, 0, 0, 0, 0, 1);
  mat4 mtx_RotY = mat4(vctVertexInCamera.z, 0, -vctVertexInCamera.x, 0, 0, 1, 0, 0, vctVertexInCamera.x, 0, vctVertexInCamera.z, 0, 0, 0, 0, 1);

  vctNormal = mat3(u_mtxNormalMeshToWorld) * a_vctNormal;

  // adds correction for things being far and to the side, but distortion for things being close
  vctNormal = mat3(mtx_RotX * mtx_RotY) * vctNormal;
  
  vec3 vctReflection = normalize(mat3(u_mtxWorldToCamera) * normalize(vctNormal));
  vctReflection.y = -vctReflection.y;

  v_vctTexture = 0.5 * vctReflection.xy + 0.5;
    #endif

    // always full opacity for now...
    #if defined(LIGHT)
  v_vctColor.a = 1.0;
    #endif
}`;

}