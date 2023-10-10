#version 300 es
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
