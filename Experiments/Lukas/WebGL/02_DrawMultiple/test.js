// import * as webgl2 from "webgl2";
// import * as webglutils from "webgl-utils.js";
window.addEventListener("load", init);
var canvas;
var vertexShaderSource = "#version 300 es\n     \n        // an attribute is an input (in) to a vertex shader.\n        // It will receive data from a buffer\n        in vec2 a_position;\n        \n        // Used to pass in the resolution of the canvas\n        uniform vec2 u_resolution;\n        \n        // all shaders have a main function\n        void main() {\n        \n            // convert the position from pixels to 0.0 to 1.0\n            vec2 zeroToOne = a_position / u_resolution;\n            \n            // convert from 0->1 to 0->2\n            vec2 zeroToTwo = zeroToOne * 2.0;\n            \n            // convert from 0->2 to -1->+1 (clipspace)\n            vec2 clipSpace = zeroToTwo - 1.0;\n            \n            gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);\n        }\n        ";
var fragmentShaderSource = "#version 300 es\n         \n        // fragment shaders don't have a default precision so we need\n        // to pick one. mediump is a good default. It means \"medium precision\"\n        precision mediump float;\n\n        //uniform vec4 u_color;\n         \n        // we need to declare an output for the fragment shader\n        out vec4 outColor;\n         \n        void main() {          \n          // Makes the color settable\n          outColor = vec4(1, 0, 0.5, 1);\n        }\n        ";
function init() {
    canvas = document.getElementById("c");
    var gl = canvas.getContext("webgl2");
    if (!gl) {
        console.log("NO WEBGL2 found!");
        return;
    }
    var program = createProgramFromSources(gl, [vertexShaderSource, fragmentShaderSource]);
}
function setRectangle(gl, x, y, width, height) {
    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;
    // NOTE: gl.bufferData(gl.ARRAY_BUFFER, ...) will affect
    // whatever buffer is bound to the `ARRAY_BUFFER` bind point
    // but so far we only have one buffer. If we had more than one
    // buffer we'd want to bind that buffer to `ARRAY_BUFFER` first.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x1, y1,
        x2, y1,
        x1, y2,
        x1, y2,
        x2, y1,
        x2, y2
    ]), gl.STATIC_DRAW);
}
//# sourceMappingURL=test.js.map