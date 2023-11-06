namespace FudgeCore {
  export let shaderSources: {[source: string]: string} = {};
  shaderSources["ShaderAmbientOcclusion.frag"] = /*glsl*/ `#version 300 es
/**
*Calculates AO based on depthmap
*@authors Roland Heer, HFU, 2023 | Jirka Dell'Oro-Friedl, HFU, 2023
*/
precision mediump float;
precision highp int;

in vec2 v_vctTexture;
uniform sampler2D u_normalTexture;
uniform sampler2D u_depthTexture;
uniform sampler2D u_noiseTexture;

struct Sample {
    vec3 vct;
};

const uint MAX_SAMPLES = 128u;
uniform int u_nSamples;
uniform Sample u_samples[MAX_SAMPLES];

uniform float u_nearPlane;
uniform float u_farPlane;
uniform float u_radius;
uniform float u_shadowDistance;

uniform float u_width;
uniform float u_height;

out vec4 vctFrag;

vec3 getFragPos(vec2 _vct_xy, float _depth) {
    _vct_xy.x /= u_width;
    _vct_xy.y /= u_height;
    _vct_xy = (_vct_xy - 0.5f) * 2.0f; //set coordinates to clip space
    return vec3(_vct_xy, _depth);
}

float linearizeDepth(float _originalDepth) {
    return (pow(u_farPlane + 1.0f, _originalDepth) - 1.0f) + u_nearPlane;
    //return _originalDepth;
}

void main() {
    float depth = linearizeDepth(texture(u_depthTexture, v_vctTexture).r);
    vec3 vct_FragPos = getFragPos(gl_FragCoord.xy, depth);

    vec3 vct_Normal = texture(u_normalTexture, v_vctTexture).rgb;
    vct_Normal = 1.0f - (vct_Normal * 2.0f);    //set normals into -1 to 1 range
    vct_Normal = normalize(vct_Normal);

    vec2 noiseScale = vec2(u_width / 4.0f, u_height / 4.0f);

    vec3 vct_Random = normalize(texture(u_noiseTexture, v_vctTexture * noiseScale).rgb);

    vec3 vct_Tangent = normalize(vct_Random - vct_Normal * dot(vct_Random, vct_Normal));
    vec3 vct_Bitangent = cross(vct_Normal, vct_Tangent);
    mat3 mtxTBN = mat3(vct_Tangent, vct_Bitangent, vct_Normal);

    //calculation of the occlusion-factor   
    float occlusion = 0.0f;
    for(int i = 0; i < u_nSamples; i++) {
        //get sample position
        vec3 vct_Sample = mtxTBN * u_samples[i].vct;
        vct_Sample = vct_FragPos + (vct_Sample * u_radius);

        vec3 offset = vec3(vct_Sample);
        offset = offset * 0.5f + 0.5f;

        float occluderDepth = linearizeDepth(texture(u_depthTexture, offset.xy).r);

        float rangeCheck = (vct_Sample.z - occluderDepth > u_radius * u_shadowDistance * 10.0f ? 0.0f : 1.0f);  
        occlusion += (occluderDepth <= vct_Sample.z ? 1.0f : 0.0f) * rangeCheck;
    }

    float nSamples = float(u_nSamples);
    occlusion = min((1.0f - (occlusion / nSamples)) * 1.5f, 1.0f);
    occlusion *= occlusion;
    vctFrag = vec4(vec3(occlusion), 1.0f);
}
`;
  shaderSources["ShaderAmbientOcclusion.vert"] = /*glsl*/ `#version 300 es

/**
* AO vertexshader. Sets values for AO fragmentshader
* @authors 2023, Roland Heer, HFU, 2023 | Jirka Dell'Oro-Friedl, HFU, 2023 | Jonas Plotzky, HFU, 2023
*/
out vec2 v_vctTexture;

void main() {
  // fullscreen triangle, contains screen quad
  float x = float((gl_VertexID % 2) * 4); // 0, 4, 0
  float y = float((gl_VertexID / 2) * 4); // 0, 0, 4
  gl_Position = vec4(x - 1.0, y - 1.0, 0.0, 1.0); // (-1, -1), (3, -1), (-1, 3)
  v_vctTexture = vec2(x * 0.5, y * 0.5); // (0, 0), (2, 0), (0, 2)
}`;
  shaderSources["ShaderAONormal.frag"] = /*glsl*/ `#version 300 es
/**
*Renders normalinformation onto texture
*@authors Roland Heer, HFU, 2023
*/
precision mediump float;
precision highp int;

#if defined(FLAT)
flat in vec4 v_vctNormal;
#else
in vec4 v_vctNormal;
#endif

out vec4 vctFrag;

void main() {
    vctFrag = vec4(0.0f);

    #if defined(FLAT)
    vctFrag += v_vctNormal;
#else
    vctFrag += v_vctNormal;
#endif
}
`;
  shaderSources["ShaderAONormal.vert"] = /*glsl*/ `#version 300 es
/**
*Calculates the normal information relative to the Camera
*@authors Roland Heer, HFU, 2023
*/
uniform mat4 u_mtxMeshToView;
uniform mat4 u_mtxWorldToCamera;
uniform mat4 u_mtxNormalMeshToWorld;
in vec3 a_vctPosition;
in vec3 a_vctNormal;

#if defined(FLAT)
flat out vec4 v_vctNormal;
#else
out vec4 v_vctNormal;
#endif

void main() {
    gl_Position = u_mtxMeshToView * vec4(a_vctPosition, 1.0f);

    vec3 vctNormal = a_vctNormal;
    vctNormal = normalize(mat3(u_mtxWorldToCamera) * mat3(u_mtxNormalMeshToWorld) * vctNormal);
    vctNormal.g = vctNormal.g * -1.0f;
    vctNormal.b = vctNormal.b * -1.0f;
    v_vctNormal = vec4((vctNormal + 1.0f) / 2.0f, 1.0f);
}
`;
  shaderSources["ShaderDownsample.frag"] = /*glsl*/ `#version 300 es
/**
*Downsamples a given texture to the current FBOs texture
*@authors Roland Heer, HFU, 2023 | Jirka Dell'Oro-Friedl, HFU, 2023
*/
precision mediump float;
precision highp int;

in vec2 v_vctTexture;
in vec2[9] v_vctOffsets;

uniform sampler2D u_texture;
uniform float u_threshold;
uniform float u_lvl;

float gaussianKernel[9] = float[](0.045f, 0.122f, 0.045f, 0.122f, 0.332f, 0.122f, 0.045f, 0.122f, 0.045f);

out vec4 vctFrag;

void main() {
    vec4 tex1 = vec4(0.0f);
    for(int i = 0; i < 9; i++) {
        tex1 += vec4(texture(u_texture, v_vctTexture + v_vctOffsets[i]) * gaussianKernel[i]);
    }
    if(u_lvl < 1.0f) {
        float threshold = min(max(u_threshold, 0.0f), 0.999999999f);     //None of the rendered values can exeed 1.0 therefor the bloom effect won't work if the threshold is >= 1.0
        tex1 -= threshold;
        tex1 /= 1.0f - threshold;
        float averageBrightness = (((tex1.r + tex1.g + tex1.b) / 3.0f) * 0.2f) + 0.8f; //the effect is reduced by first setting it to a 0.0-0.2 range and then adding 0.8
        tex1 = tex1 * averageBrightness * 2.0f;
    }
    tex1 *= 1.3f;
    vctFrag = tex1;
}`;
  shaderSources["ShaderDownsample.vert"] = /*glsl*/ `#version 300 es
/**
* ShaderDownsample sets values for downsampling fragmentshader and applies a small gaussian blur
* @authors 2023, Roland Heer, HFU, 2023 | Jirka Dell'Oro-Friedl, HFU, 2023 | Jonas Plotzky, HFU, 2023
*/
uniform float u_width;
uniform float u_height;

out vec2 v_vctTexture;
out vec2[9] v_vctOffsets;

void main() {
  // fullscreen triangle, contains screen quad
  float x = float((gl_VertexID % 2) * 4); // 0, 4, 0
  float y = float((gl_VertexID / 2) * 4); // 0, 0, 4
  gl_Position = vec4(x - 1.0, y - 1.0, 0.0, 1.0); // (-1, -1), (3, -1), (-1, 3)
  v_vctTexture = vec2(x * 0.5, y * 0.5); // (0, 0), (2, 0), (0, 2)

  vec2 offset = vec2(1.0f / u_width, 1.0f / u_height);

  v_vctOffsets = vec2[](
    vec2(-offset.x, offset.y),  vec2(0.0, offset.y),  vec2(offset.x, offset.y),
    vec2(-offset.x, 0.0),       vec2(0.0, 0.0),       vec2(offset.x, 0.0),
    vec2(-offset.x, -offset.y), vec2(0.0, -offset.y),  vec2(offset.x, -offset.y)
  );
}`;
  shaderSources["ShaderMist.frag"] = /*glsl*/ `#version 300 es
/**
* Calculates depth from camera based on near- and farplane
* @authors Roland Heer, HFU, 2023 | Jirka Dell'Oro-Friedl, HFU, 2023 | Jonas Plotzky, HFU, 2023
*/
precision mediump float;
precision highp int;

uniform float u_nearPlane;
uniform float u_farPlane;
uniform vec3 u_vctCamera;

in vec3 v_vctPosition;
out vec4 vctFrag;

void main() {
  float distance = length(v_vctPosition - u_vctCamera);
  float fogAmount = min(max((distance - u_nearPlane) / (u_farPlane - u_nearPlane), 0.0), 1.0);
  vec3 vctfog = vec3(-pow(fogAmount, 2.0) + (2.0 * fogAmount)); //lets Fog appear quicker and fall off slower results in a more gradual falloff
  vctFrag = vec4(vctfog, 1.0);
}
`;
  shaderSources["ShaderMist.vert"] = /*glsl*/ `#version 300 es

/**
* Mist vertexshader. Sets values for mist fragmentshader
* @authors 2023, Roland Heer, HFU, 2023 | Jirka Dell'Oro-Friedl, HFU, 2023 | Jonas Plotzky, HFU, 2023
*/

uniform mat4 u_mtxMeshToView;
uniform mat4 u_mtxMeshToWorld;

in vec3 a_vctPosition;
out vec3 v_vctPosition;

void main() {
  vec4 vctPosition = vec4(a_vctPosition, 1.0);
  v_vctPosition = vec3(u_mtxMeshToWorld * vctPosition);
  gl_Position = u_mtxMeshToView * vctPosition;
}`;
  shaderSources["ShaderPhong.frag"] = /*glsl*/ `#version 300 es
/**
* Phong shading
* @authors Jirka Dell'Oro-Friedl, HFU, 2022 | Roland Heer, HFU, 2023 | Jonas Plotzky, HFU, 2023
*/

precision mediump float;
precision highp int;

uniform vec4 u_vctColor;
uniform float u_fDiffuse;
uniform float u_fSpecular;
uniform float u_fIntensity;
uniform float u_fMetallic;
uniform vec3 u_vctCamera;

in vec4 v_vctColor;
in vec3 v_vctPosition;

out vec4 vctFrag;

#ifdef PHONG

  in vec3 v_vctNormal;

#endif

#ifdef FLAT

  flat in vec3 v_vctPositionFlat;

#endif

struct Light {
  vec4 vctColor;
  mat4 mtxShape;
  mat4 mtxShapeInverse;
};

const uint MAX_LIGHTS_DIRECTIONAL = 15u;
const uint MAX_LIGHTS_POINT = 100u;
const uint MAX_LIGHTS_SPOT = 100u;

layout(std140) uniform Lights {
  uint u_nLightsDirectional;
  uint u_nLightsPoint;
  uint u_nLightsSpot;
  Light u_ambient;
  Light u_directional[MAX_LIGHTS_DIRECTIONAL];
  Light u_point[MAX_LIGHTS_POINT];
  Light u_spot[MAX_LIGHTS_SPOT];
};

// TEXTURE: input UVs and texture
#ifdef TEXTURE

  in vec2 v_vctTexture;
  uniform sampler2D u_texture;

#endif

// NORMALMAP: input UVs and texture
#ifdef NORMALMAP

  in vec3 v_vctTangent;
  in vec3 v_vctBitangent;
  uniform sampler2D u_normalMap;

#endif

// Returns a vector for visualizing on model. Great for debugging
vec4 showVectorAsColor(vec3 _vector, bool _clamp) {
  if(_clamp) {
    _vector *= 0.5;
    _vector += 0.5;
  }
  return vec4(_vector.x, _vector.y, _vector.z, 1);
}

void illuminateDirected(vec3 _vctDirection, vec3 _vctView, vec3 _vctNormal, vec3 _vctColor, out vec3 _vctDiffuse, out vec3 _vctSpecular) {
  vec3 vctDirection = normalize(_vctDirection);
  float fIllumination = -dot(_vctNormal, vctDirection);
  if(fIllumination > 0.0) {
    _vctDiffuse += u_fDiffuse * fIllumination * _vctColor;

    if(u_fSpecular <= 0.0)
      return;
      
    //BLINN-Phong Shading
    vec3 halfwayDir = normalize(-vctDirection - _vctView);
    float factor = max(dot(-vctDirection, _vctNormal), 0.0); //Factor for smoothing out transition from surface facing the lightsource to surface facing away from the lightsource
    factor = 1.0 - (pow(factor - 1.0, 8.0));                 //The factor is altered in order to clearly see the specular highlight even at steep angles, while still preventing artifacts

    _vctSpecular += pow(max(dot(_vctNormal, halfwayDir), 0.0), exp2(u_fSpecular * 5.0)) * u_fSpecular * u_fIntensity * factor * _vctColor;
  }
}

void main() {
  #if defined(PHONG) && !defined(FLAT)

    #ifdef NORMALMAP

      mat3 mtxTBN = mat3(normalize(v_vctTangent), normalize(v_vctBitangent), normalize(v_vctNormal));
      vec3 vctNormal = texture(u_normalMap, v_vctTexture).xyz * 2.0 - 1.0;
      vctNormal = normalize(mtxTBN * vctNormal);

    #else

      vec3 vctNormal = normalize(v_vctNormal);

    #endif

    vec3 vctView = normalize(v_vctPosition - u_vctCamera);
    vec3 vctPosition = v_vctPosition;

  #endif

  #ifdef FLAT

    vec3 vctFdx = dFdx(v_vctPosition);
    vec3 vctFdy = dFdy(v_vctPosition);
    vec3 vctNormal = normalize(cross(vctFdx, vctFdy));
    vec3 vctView = normalize(v_vctPositionFlat - u_vctCamera);
    vec3 vctPosition = v_vctPositionFlat;

  #endif

  vec3 vctDiffuse = u_fDiffuse * u_ambient.vctColor.rgb;
  vec3 vctSpecular = vec3(0, 0, 0);

  // calculate directional light effect
  for(uint i = 0u; i < u_nLightsDirectional; i++) {
    vec3 vctDirection = vec3(u_directional[i].mtxShape * vec4(0.0, 0.0, 1.0, 1.0));
    illuminateDirected(vctDirection, vctView, vctNormal, u_directional[i].vctColor.rgb, vctDiffuse, vctSpecular);
  }

  // calculate point light effect
  for(uint i = 0u; i < u_nLightsPoint; i++) {
    vec3 vctPositionLight = vec3(u_point[i].mtxShape * vec4(0.0, 0.0, 0.0, 1.0));
    vec3 vctDirection = vctPosition - vctPositionLight;
    float fIntensity = 1.0 - length(mat3(u_point[i].mtxShapeInverse) * vctDirection);
    if(fIntensity < 0.0)
      continue;

    illuminateDirected(vctDirection, vctView, vctNormal, u_point[i].vctColor.rgb * fIntensity, vctDiffuse, vctSpecular);
  }

  // calculate spot light effect
  for(uint i = 0u; i < u_nLightsSpot; i++) {
    vec3 vctPositionLight = vec3(u_spot[i].mtxShape * vec4(0.0, 0.0, 0.0, 1.0));
    vec3 vctDirection = vctPosition - vctPositionLight;
    vec3 vctDirectionInverted = mat3(u_spot[i].mtxShapeInverse) * vctDirection;
    if(vctDirectionInverted.z <= 0.0)
      continue;

    float fIntensity = 1.0 - min(1.0, 2.0 * length(vctDirectionInverted.xy) / vctDirectionInverted.z);    //Coneshape that is brightest in the center. Possible TODO: "Variable Spotlightsoftness"
    fIntensity *= 1.0 - pow(vctDirectionInverted.z, 2.0);                                                 //Prevents harsh lighting artifacts at boundary of the given spotlight
    if(fIntensity < 0.0)
      continue;

    illuminateDirected(vctDirection, vctView, vctNormal, u_spot[i].vctColor.rgb * fIntensity, vctDiffuse, vctSpecular);
  }

  vctFrag.rgb = vctDiffuse + vctSpecular * u_fMetallic;
  vctFrag.a = 1.0;

  #ifdef TEXTURE

    vec4 vctColorTexture = texture(u_texture, v_vctTexture);
    vctFrag *= vctColorTexture;

  #endif

  vctFrag *= u_vctColor * v_vctColor;
  vctFrag.rgb += vctSpecular * (1.0 - u_fMetallic);

  if(vctFrag.a < 0.01)
    discard;
}`;
  shaderSources["ShaderPick.frag"] = /*glsl*/ `#version 300 es
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
    int pixel = int(trunc(gl_FragCoord.x) + u_vctSize.x * trunc(gl_FragCoord.y));

    if (pixel != u_id)
      discard;

    uint icolor = uint(u_vctColor.r * 255.0) << 24 | uint(u_vctColor.g * 255.0) << 16 | uint(u_vctColor.b * 255.0) << 8 | uint(u_vctColor.a * 255.0);
                
    vctFrag = ivec4(floatBitsToInt(gl_FragCoord.z), icolor, 0, 0);
}`;
  shaderSources["ShaderPick.vert"] = /*glsl*/ `#version 300 es
/**
* Renders for Raycasting
* @authors Jirka Dell'Oro-Friedl, HFU, 2019
*/
in vec3 a_vctPosition;       
uniform mat4 u_mtxMeshToView;

void main() {   
    gl_Position = u_mtxMeshToView * vec4(a_vctPosition, 1.0);
}`;
  shaderSources["ShaderPickTextured.frag"] = /*glsl*/ `#version 300 es
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
    int pixel = int(trunc(gl_FragCoord.x) + u_vctSize.x * trunc(gl_FragCoord.y));

    if (pixel != u_id)
      discard;
    
    vec4 vctColor = u_vctColor * texture(u_texture, v_vctTexture);
    uint icolor = uint(vctColor.r * 255.0) << 24 | uint(vctColor.g * 255.0) << 16 | uint(vctColor.b * 255.0) << 8 | uint(vctColor.a * 255.0);
  
  vctFrag = ivec4(floatBitsToInt(gl_FragCoord.z), icolor, floatBitsToInt(v_vctTexture.x), floatBitsToInt(v_vctTexture.y));
}`;
  shaderSources["ShaderPickTextured.vert"] = /*glsl*/ `#version 300 es
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
  shaderSources["ShaderScreen.frag"] = /*glsl*/ `#version 300 es
/**
* Composites all Post-FX on to the main-render and renders it to the main Renderbuffer
* @authors Roland Heer, HFU, 2023
*/
precision mediump float;
precision highp int;

in vec2 v_vctTexture;
uniform sampler2D u_mainTexture;

uniform float u_mist;
uniform sampler2D u_mistTexture;
uniform vec4 u_vctMistColor;

uniform float u_ao;
uniform sampler2D u_aoTexture;
uniform vec4 u_vctAOColor;

uniform float u_bloom;
uniform sampler2D u_bloomTexture;
uniform float u_bloomIntensity;
uniform float u_highlightDesaturation;

in vec2[25] v_vctOffsets;
float gaussianKernel[25] = float[]( 0.00366, 0.01465, 0.02564, 0.01465, 0.00366,
                                    0.01465, 0.05860, 0.09523, 0.05860, 0.01465, 
                                    0.02564, 0.09523, 0.15018, 0.09523, 0.02564, 
                                    0.01465, 0.05860, 0.09523, 0.05860, 0.01465,
                                    0.00366, 0.01465, 0.02564, 0.01465, 0.00366);

out vec4 vctFrag;

void main() {
  vec4 mainTex = texture(u_mainTexture, v_vctTexture);
  vec4 vctTempFrag = mainTex;
  if(u_ao > 0.5f) {
    vec4 aoTex = vec4(0.0f);
    for(int i = 0; i < 25; i++) {
        aoTex += vec4(texture(u_aoTexture, v_vctTexture + v_vctOffsets[i]) * gaussianKernel[i]);
    }
    aoTex = mix(vec4(u_vctAOColor.rgb, 1.0f), vec4(1.0f), aoTex.r);
    vctTempFrag = mix(vctTempFrag, vctTempFrag * aoTex, u_vctAOColor.a);
  }
  if(u_mist > 0.5f) {
    vec4 mistTex = texture(u_mistTexture, v_vctTexture);
    vctTempFrag = mix(vctTempFrag, vec4(u_vctMistColor.rgb, 1.0f), mistTex.r * u_vctMistColor.a);
  }
  if(u_bloom > 0.5f) {
    float intensity = max(u_bloomIntensity, 0.0f);
    vec4 bloomTex = texture(u_bloomTexture, v_vctTexture);
    vctTempFrag += (bloomTex * intensity);

    float factor = min(max(u_highlightDesaturation, 0.0f), 1.0f);
    float r = max(vctTempFrag.r - 1.0f, 0.0f) * factor;
    float g = max(vctTempFrag.r - 1.0f, 0.0f) * factor;
    float b = max(vctTempFrag.r - 1.0f, 0.0f) * factor;

    vctTempFrag.r += g + b;
    vctTempFrag.g += r + b;
    vctTempFrag.b += r + g;
  }

  vctFrag = vctTempFrag;
}
`;
  shaderSources["ShaderScreen.vert"] = /*glsl*/ `#version 300 es
/**
* Sets up the data for the ShaderScreen fragmentshader
* @authors Roland Heer, HFU, 2023 | Jonas Plotzky, HFU, 2023
*/
uniform float u_width;
uniform float u_height;

out vec2 v_vctTexture;
out vec2 v_vctOffsets[25];

void main() {
  // fullscreen triangle, contains screen quad
  float x = float((gl_VertexID % 2) * 4); // 0, 4, 0
  float y = float((gl_VertexID / 2) * 4); // 0, 0, 4
  gl_Position = vec4(x - 1.0, y - 1.0, 0.0, 1.0); // (-1, -1), (3, -1), (-1, 3)
  v_vctTexture = vec2(x * 0.5, y * 0.5); // (0, 0), (2, 0), (0, 2)

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
`;
  shaderSources["ShaderUniversal.frag"] = /*glsl*/ `#version 300 es
/**
* Universal Shader as base for many others. Controlled by compiler directives
* @authors Jirka Dell'Oro-Friedl, HFU, 2021 | Jonas Plotzky, HFU, 2023
*/

precision mediump float;
precision highp int;

// MINIMAL (no define needed): include base color
uniform vec4 u_vctColor;
in vec4 v_vctColor;

// LIGHT: include light parameters
#ifdef LIGHT

  uniform float u_fMetallic;
  in vec3 v_vctDiffuse;
  in vec3 v_vctSpecular;

#endif

// TEXTURE: input UVs and texture
#if defined(TEXTURE) || defined(MATCAP)

  in vec2 v_vctTexture;
  uniform sampler2D u_texture;

#endif

out vec4 vctFrag;

void main() {
  
  #ifdef LIGHT

    vctFrag.rgb = v_vctDiffuse + v_vctSpecular * u_fMetallic;
    vctFrag.a = 1.0;

  #else

    // MINIMAL: set the base color
    vctFrag = u_vctColor * v_vctColor;

  #endif

  #if defined(TEXTURE) || defined(MATCAP)
    
    // TEXTURE: multiply with texel color
    vec4 vctColorTexture = texture(u_texture, v_vctTexture);
    vctFrag *= vctColorTexture;

  #endif

  #ifdef LIGHT

    vctFrag *= u_vctColor * v_vctColor;
    vctFrag.rgb += v_vctSpecular * (1.0 - u_fMetallic);
  
  #endif

    // discard pixel alltogether when transparent: don't show in Z-Buffer
  if(vctFrag.a < 0.01)
    discard;
}`;
  shaderSources["ShaderUniversal.vert"] = /*glsl*/ `#version 300 es
/**
* Universal Shader as base for many others. Controlled by compiler directives
* @authors 2021, Luis Keck, HFU, 2021 | Jirka Dell'Oro-Friedl, HFU, 2021 | Jonas Plotzky, HFU, 2023
*/

precision mediump float;
precision highp int;

  // MINIMAL (no define needed): buffers for transformation
uniform mat4 u_mtxMeshToView;
in vec3 a_vctPosition;
// TODO: think about making vertex color optional
in vec4 a_vctColor;
out vec4 v_vctColor;

  // PARTICLE: offer buffer and functionality for in shader position calculation
  // CAMERA: offer buffer and functionality for specular reflection depending on the camera-position
  #if defined(CAMERA) || defined(PARTICLE)
uniform mat4 u_mtxMeshToWorld;
uniform vec3 u_vctCamera;
  #endif

  // LIGHT: offer buffers for lighting vertices with different light types
  #if defined(LIGHT)
uniform mat4 u_mtxNormalMeshToWorld;
uniform float u_fDiffuse;
uniform float u_fSpecular;
uniform float u_fIntensity;
in vec3 a_vctNormal;

    #if !defined(PHONG) && !defined(FLAT) // gouraud
out vec3 v_vctDiffuse;
out vec3 v_vctSpecular;
    #endif

    #if defined(NORMALMAP)
in vec4 a_vctTangent;
out vec3 v_vctTangent;
out vec3 v_vctBitangent;
    #endif

struct Light {
  vec4 vctColor;
  mat4 mtxShape;
  mat4 mtxShapeInverse;
};

const uint MAX_LIGHTS_DIRECTIONAL = 15u;
const uint MAX_LIGHTS_POINT = 100u;
const uint MAX_LIGHTS_SPOT = 100u;

layout(std140) uniform Lights {
  uint u_nLightsDirectional;
  uint u_nLightsPoint;
  uint u_nLightsSpot;
  Light u_ambient;
  Light u_directional[MAX_LIGHTS_DIRECTIONAL];
  Light u_point[MAX_LIGHTS_POINT];
  Light u_spot[MAX_LIGHTS_SPOT];
};

void illuminateDirected(vec3 _vctDirection, vec3 _vctView, vec3 _vctNormal, vec3 _vctColor, out vec3 _vctDiffuse, out vec3 _vctSpecular) {
  vec3 vctDirection = normalize(_vctDirection);
  float fIllumination = -dot(_vctNormal, vctDirection);
  if(fIllumination > 0.0) {
    _vctDiffuse += u_fDiffuse * fIllumination * _vctColor;

    if(u_fSpecular <= 0.0)
      return;

    //BLINN
    vec3 halfwayDir = normalize(-vctDirection - _vctView);
    float factor = max(dot(-vctDirection, _vctNormal), 0.0); //Factor for smoothing out transition from surface facing the lightsource to surface facing away from the lightsource
    factor = 1.0 - (pow(factor - 1.0, 8.0));                 //The factor is altered in order to clearly see the specular highlight even at steep angles, while still preventing artifacts

    _vctSpecular += pow(max(dot(_vctNormal, halfwayDir), 0.0), exp2(u_fSpecular * 5.0)) * u_fSpecular * u_fIntensity * factor * _vctColor;

    //PHONG (old)
    // vec3 vctReflection = normalize(reflect(-vctDirection, _vctNormal));
    // float fHitCamera = dot(vctReflection, _vctView);
    // _vctSpecular += pow(max(fHitCamera, 0.0), u_fSpecular * 10.0) * u_fSpecular * _vctColor; // 10.0 = magic number, looks good... 
  }
}
  #endif 

  // TEXTURE and NORMALMAP: texture coordinates for texturemaps
  #if defined(TEXTURE) || defined(NORMALMAP)
uniform mat3 u_mtxPivot;
in vec2 a_vctTexture;
out vec2 v_vctTexture;
  #endif

  // MATCAP: offer buffers for UVs and pivot matrix
  #if defined(MATCAP) // MatCap-shader generates texture coordinates from surface normals
in vec3 a_vctNormal;
uniform mat4 u_mtxNormalMeshToWorld;
uniform mat4 u_mtxWorldToCamera;
out vec2 v_vctTexture;
  #endif

  #if defined(PHONG)
out vec3 v_vctNormal;
out vec3 v_vctPosition;
  #endif

  #if defined(FLAT)
out vec3 v_vctPosition;
flat out vec3 v_vctPositionFlat;
  #endif

  #if defined(SKIN)
uniform mat4 u_mtxWorldToView; // 
// Bones
// https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/skinning_pars_vertex.glsl.js
in uvec4 a_vctBones;
in vec4 a_vctWeights;
const uint MAX_BONES = 256u; // CAUTION: this number must be the same as in RenderInjectorSkeletonInstance where the corresponding buffers are created
layout(std140) uniform Skin {
mat4 u_mtxBones[MAX_BONES];
};
  #endif

  #if defined(PARTICLE)
uniform mat4 u_mtxWorldToView;
uniform float u_fParticleSystemDuration;
uniform float u_fParticleSystemSize;
uniform float u_fParticleSystemTime;
uniform sampler2D u_particleSystemRandomNumbers;
uniform bool u_bParticleSystemFaceCamera;
uniform bool u_bParticleSystemRestrict;

mat4 lookAt(vec3 _vctTranslation, vec3 _vctTarget) {
  vec3 vctUp = vec3(0.0, 1.0, 0.0);
  vec3 zAxis = normalize(_vctTarget - _vctTranslation);
  vec3 xAxis = normalize(cross(vctUp, zAxis));
  vec3 yAxis = u_bParticleSystemRestrict ? vctUp : normalize(cross(zAxis, xAxis));
  zAxis = u_bParticleSystemRestrict ? normalize(cross(xAxis, vctUp)) : zAxis;

  return mat4(xAxis.x, xAxis.y, xAxis.z, 0.0, yAxis.x, yAxis.y, yAxis.z, 0.0, zAxis.x, zAxis.y, zAxis.z, 0.0, _vctTranslation.x, _vctTranslation.y, _vctTranslation.z, 1.0);
}

float fetchRandomNumber(int _iIndex, int _iParticleSystemRandomNumbersSize, int _iParticleSystemRandomNumbersLength) {
  _iIndex = _iIndex % _iParticleSystemRandomNumbersLength;
  return texelFetch(u_particleSystemRandomNumbers, ivec2(_iIndex % _iParticleSystemRandomNumbersSize, _iIndex / _iParticleSystemRandomNumbersSize), 0).r;
}
  #endif // PARTICLE

void main() {
  vec4 vctPosition = vec4(a_vctPosition, 1.0);

    #if defined(CAMERA) || defined(PARTICLE) || defined(SKIN) || defined(MATCAP)
  mat4 mtxMeshToWorld = u_mtxMeshToWorld;
    #endif

    #if defined(PARTICLE)
  float fParticleId = float(gl_InstanceID);
  int iParticleSystemRandomNumbersSize = textureSize(u_particleSystemRandomNumbers, 0).x; // the dimension of the quadratic texture
  int iParticleSystemRandomNumbersLength = iParticleSystemRandomNumbersSize * iParticleSystemRandomNumbersSize; // the total number of texels in the texture
  /*$variables*/
  /*$mtxLocal*/
  /*$mtxWorld*/
  mtxMeshToWorld = /*$mtxWorld*/ mtxMeshToWorld /*$mtxLocal*/;
  if(u_bParticleSystemFaceCamera) mtxMeshToWorld = lookAt(vec3(mtxMeshToWorld[3][0], mtxMeshToWorld[3][1], mtxMeshToWorld[3][2]), u_vctCamera) *
    mat4(length(vec3(mtxMeshToWorld[0][0], mtxMeshToWorld[1][0], mtxMeshToWorld[2][0])), 0.0, 0.0, 0.0, 0.0, length(vec3(mtxMeshToWorld[0][1], mtxMeshToWorld[1][1], mtxMeshToWorld[2][1])), 0.0, 0.0, 0.0, 0.0, length(vec3(mtxMeshToWorld[0][2], mtxMeshToWorld[1][2], mtxMeshToWorld[2][2])), 0.0, 0.0, 0.0, 0.0, 1.0);
  mat4 mtxMeshToView = u_mtxWorldToView * mtxMeshToWorld;
    #else
  mat4 mtxMeshToView = u_mtxMeshToView;
    #endif

    #if defined(LIGHT) || defined(MATCAP)
  vec3 vctNormal = a_vctNormal;
      #if defined(PARTICLE)
  mat4 mtxNormalMeshToWorld = transpose(inverse(mtxMeshToWorld));
      #else
  mat4 mtxNormalMeshToWorld = u_mtxNormalMeshToWorld;
      #endif
    #endif

    #if defined(SKIN)
  mtxMeshToWorld = a_vctWeights.x * u_mtxBones[a_vctBones.x] +
    a_vctWeights.y * u_mtxBones[a_vctBones.y] +
    a_vctWeights.z * u_mtxBones[a_vctBones.z] +
    a_vctWeights.w * u_mtxBones[a_vctBones.w];

  mtxMeshToView = u_mtxWorldToView * mtxMeshToWorld;
  mtxNormalMeshToWorld = transpose(inverse(mtxMeshToWorld));
    #endif

  gl_Position = mtxMeshToView * vctPosition;

  v_vctColor = a_vctColor;

    #if defined(PARTICLE_COLOR)
  v_vctColor *= /*$color*/;
    #endif

    #if defined(CAMERA) || defined(MATCAP)
  vec3 vctView = normalize(vec3(mtxMeshToWorld * vctPosition) - u_vctCamera);
    #endif

    #if defined(LIGHT) // light
  vctNormal = mat3(mtxNormalMeshToWorld) * vctNormal;

      #if defined(PHONG)
  v_vctNormal = vctNormal; // pass normal to fragment shader
  v_vctPosition = vec3(mtxMeshToWorld * vctPosition);
      #endif

      #if defined(FLAT)
  v_vctPosition = vec3(mtxMeshToWorld * vctPosition);
  v_vctPositionFlat = v_vctPosition;
      #endif

      #if defined(NORMALMAP)
  v_vctTangent = mat3(mtxNormalMeshToWorld) * a_vctTangent.xyz;
  v_vctBitangent = cross(vctNormal, v_vctTangent) * a_vctTangent.w;
      #endif

      #if !defined(PHONG) && !defined(FLAT) // gouraud
  vctNormal = normalize(vctNormal);
  v_vctDiffuse = u_fDiffuse * u_ambient.vctColor.rgb;
  v_vctSpecular = vec3(0, 0, 0);

  // calculate directional light effect
for(uint i = 0u; i < u_nLightsDirectional; i ++) {
  vec3 vctDirection = vec3(u_directional[i].mtxShape * vec4(0.0, 0.0, 1.0, 1.0));
  illuminateDirected(vctDirection, vctView, vctNormal, u_directional[i].vctColor.rgb, v_vctDiffuse, v_vctSpecular);
}

  // calculate point light effect
for(uint i = 0u;i < u_nLightsPoint;i ++) {
  vec3 vctPositionLight = vec3(u_point[i].mtxShape * vec4(0.0, 0.0, 0.0, 1.0));
  vec3 vctDirection = vec3(mtxMeshToWorld * vctPosition) - vctPositionLight;
  float fIntensity = 1.0 - length(mat3(u_point[i].mtxShapeInverse) * vctDirection);
  if(fIntensity < 0.0) continue;

  illuminateDirected(vctDirection, vctView, vctNormal, u_point[i].vctColor.rgb * fIntensity, v_vctDiffuse, v_vctSpecular);
}

  // calculate spot light effect
for(uint i = 0u;i < u_nLightsSpot;i ++) {
  vec3 vctPositionLight = vec3(u_spot[i].mtxShape * vec4(0.0, 0.0, 0.0, 1.0));
  vec3 vctDirection = vec3(mtxMeshToWorld * vctPosition) - vctPositionLight;
  vec3 vctDirectionInverted = mat3(u_spot[i].mtxShapeInverse) * vctDirection;
  if(vctDirectionInverted.z <= 0.0) continue;

  float fIntensity = 1.0 - min(1.0, 2.0 * length(vctDirectionInverted.xy) / vctDirectionInverted.z);    //Coneshape that is brightest in the center. Possible TODO: "Variable Spotlightsoftness"
  fIntensity *= 1.0 - pow(vctDirectionInverted.z, 2.0);                                                 //Prevents harsh lighting artifacts at boundary of the given spotlight
  if(fIntensity < 0.0) continue;

  illuminateDirected(vctDirection, vctView, vctNormal, u_spot[i].vctColor.rgb * fIntensity, v_vctDiffuse, v_vctSpecular);
}
      #endif // gouraud
    #endif // light

    // TEXTURE: transform UVs
    #if defined(TEXTURE) || defined(NORMALMAP)
  v_vctTexture = vec2(u_mtxPivot * vec3(a_vctTexture, 1.0)).xy;
    #endif

    #if defined(MATCAP)
  vec4 vctVertexInCamera = normalize(u_mtxWorldToCamera * vctPosition);
  vctVertexInCamera.xy *= - 1.0;
  mat4 mtx_RotX = mat4(1, 0, 0, 0, 0, vctVertexInCamera.z, vctVertexInCamera.y, 0, 0, - vctVertexInCamera.y, vctVertexInCamera.z, 0, 0, 0, 0, 1);
  mat4 mtx_RotY = mat4(vctVertexInCamera.z, 0, - vctVertexInCamera.x, 0, 0, 1, 0, 0, vctVertexInCamera.x, 0, vctVertexInCamera.z, 0, 0, 0, 0, 1);

  vctNormal = mat3(u_mtxNormalMeshToWorld) * a_vctNormal;

    // adds correction for things being far and to the side, but distortion for things being close
  vctNormal = mat3(mtx_RotX * mtx_RotY) * vctNormal;

  vec3 vctReflection = normalize(mat3(u_mtxWorldToCamera) * normalize(vctNormal));
  vctReflection.y = - vctReflection.y;

  v_vctTexture = 0.5 * vctReflection.xy + 0.5;
    #endif
}`;
  shaderSources["ShaderUpsample.frag"] = /*glsl*/ `#version 300 es
/**
*upsamples a given texture onto the current FBOs texture and applies a small gaussian blur
*@authors Roland Heer, HFU, 2023 | Jirka Dell'Oro-Friedl, HFU, 2023
*/
precision mediump float;
precision highp int;

in vec2 v_vctTexture;
in vec2[9] v_vctOffsets;
uniform sampler2D u_texture;
uniform sampler2D u_texture2;

float gaussianKernel[9] = float[](0.045f, 0.122f, 0.045f, 0.122f, 0.332f, 0.122f, 0.045f, 0.122f, 0.045f);

out vec4 vctFrag;

void main() {
    vec4 tex1 = vec4(0.0f);
    for(int i = 0; i < 9; i++) {
        tex1 += vec4(texture(u_texture, v_vctTexture + v_vctOffsets[i]) * gaussianKernel[i]);
    }
    vec4 tex2 = texture(u_texture2, v_vctTexture);
    vctFrag = tex2 + tex1;
}`;
  shaderSources["ShaderUpsample.vert"] = /*glsl*/ `#version 300 es
/**
* ShaderUpsample sets values for upsampling fragmentshader
* @authors 2023, Roland Heer, HFU, 2023 | Jirka Dell'Oro-Friedl, HFU, 2023 | Jonas Plotzky, HFU, 2023
*/
uniform float u_width;
uniform float u_height;

out vec2 v_vctTexture;
out vec2[9] v_vctOffsets;

void main() {
  // fullscreen triangle, contains screen quad
  float x = float((gl_VertexID % 2) * 4); // 0, 4, 0
  float y = float((gl_VertexID / 2) * 4); // 0, 0, 4
  gl_Position = vec4(x - 1.0, y - 1.0, 0.0, 1.0); // (-1, -1), (3, -1), (-1, 3)
  v_vctTexture = vec2(x * 0.5, y * 0.5); // (0, 0), (2, 0), (0, 2)

  vec2 offset = vec2(1.0f / u_width, 1.0f / u_height);

  v_vctOffsets = vec2[](
    vec2(-offset.x, offset.y),  vec2(0.0, offset.y),  vec2(offset.x, offset.y),
    vec2(-offset.x, 0.0),       vec2(0.0, 0.0),       vec2(offset.x, 0.0),
    vec2(-offset.x, -offset.y), vec2(0.0, -offset.y),  vec2(offset.x, -offset.y)
  );
}`;

}