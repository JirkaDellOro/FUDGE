"use strict";
var TestColor;
(function (TestColor) {
    // tslint:disable-next-line: typedef
    TestColor.shader = {
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
                }`
    };
})(TestColor || (TestColor = {}));
//# sourceMappingURL=Shaders.js.map