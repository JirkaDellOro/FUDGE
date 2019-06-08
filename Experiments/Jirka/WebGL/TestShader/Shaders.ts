namespace TestShader {
    // tslint:disable-next-line: typedef
    export let shader = {
        vertexSimple: `#version 300 es
            precision mediump float;
            in vec3 aVertexPosition;
            void main(void) {
                gl_Position = vec4(aVertexPosition, 1.0);
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
            }`
    };
}