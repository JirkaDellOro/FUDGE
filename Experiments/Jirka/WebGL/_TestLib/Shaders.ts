namespace TestLib {
    // tslint:disable-next-line: typedef
    export let shader = {
        vertexSimple: `#version 300 es
            precision mediump float;
            in vec3 aVertexPosition;
            void main(void) {
                gl_Position = vec4(aVertexPosition, 1.0);
            }`,
        vertexColor: `#version 300 es
            precision mediump float;
            in vec3 aVertexPosition;
            uniform vec4 uColor;
            out vec4 vColor;
            void main(void) {
                gl_Position = vec4(aVertexPosition, 1.0);
                vColor = uColor;
            }`,
        vertexTexture: `#version 300 es
            precision mediump float;
            in vec3 aVertexPosition;
            in vec2 aVertexTextureUVs;
            out vec2 vVertexTextureUVs;
            void main(void) {
                gl_Position = vec4(aVertexPosition, 1.0);
                vVertexTextureUVs = aVertexTextureUVs;
            }`,
        fragmentYellow: `#version 300 es
            precision mediump float;
            out vec4 fragColor;
            void main(void) {
                fragColor = vec4(1.0, 1.0, 0.0, 1.0);
            }`,
        fragmentRed: `#version 300 es
            precision mediump float;
            out vec4 fragColor;
            void main(void) {
                fragColor = vec4(1.0, 0.0, 0.0, 1.0);
            }`,
        fragmentColor: `#version 300 es
            precision mediump float;
            in vec4 vColor;
            out vec4 fragColor;
            void main(void) {
                fragColor = vColor;
            }`,
        fragmentTexure: `#version 300 es
            precision mediump float;
            in vec2 vVertexTextureUVs;
            uniform sampler2D uSampler;
            out vec4 fragColor;
            void main(void) {
                fragColor = texture(uSampler, vVertexTextureUVs);;
            }`
    };
}