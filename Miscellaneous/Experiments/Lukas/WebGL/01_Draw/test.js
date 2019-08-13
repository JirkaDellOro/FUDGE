var WebGL2Test1;
(function (WebGL2Test1) {
    window.addEventListener("load", init);
    var canvas;
    var vertexShaderSource = "#version 300 es\n     \n        // an attribute is an input (in) to a vertex shader.\n        // It will receive data from a buffer\n        in vec4 a_position;\n         \n        // all shaders have a main function\n        void main() {\n         \n          // gl_Position is a special variable a vertex shader\n          // is responsible for setting\n          gl_Position = a_position;\n        }\n        ";
    var fragmentShaderSource = "#version 300 es\n         \n        // fragment shaders don't have a default precision so we need\n        // to pick one. mediump is a good default. It means \"medium precision\"\n        precision mediump float;\n\n        uniform vec4 u_color;\n         \n        // we need to declare an output for the fragment shader\n        out vec4 outColor;\n         \n        void main() {\n          // Just set the output to a constant redish-purple\n          outColor = vec4(1, 0, 0.5, 1);\n        }\n        ";
    function init() {
        canvas = document.getElementById("c");
        var gl = canvas.getContext("webgl2");
        if (!gl) {
            console.log("NO WEBGL2 found!");
            return;
        }
        var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        var program = createProgram(gl, vertexShader, fragmentShader);
        var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
        var positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        var positions = [
            -1, -1,
            0, 0.5,
            0.7, 0,
            1, 1,
            0.9, 1,
            1, 0.9
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        var vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        gl.enableVertexAttribArray(positionAttributeLocation);
        var size = 2; // 2 components per iteration
        var type = gl.FLOAT; // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0; // start at the beginning of the buffer
        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
        // webglUtils.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);
        gl.bindVertexArray(vao);
        var primitiveType = gl.TRIANGLES;
        offset = 0;
        var count = 6;
        gl.drawArrays(primitiveType, offset, count);
    }
    function createShader(gl, type, source) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
            return shader;
        }
        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
    }
    function createProgram(gl, vertexShader, fragmentShader) {
        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        var success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) {
            return program;
        }
        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
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
})(WebGL2Test1 || (WebGL2Test1 = {}));
//# sourceMappingURL=test.js.map