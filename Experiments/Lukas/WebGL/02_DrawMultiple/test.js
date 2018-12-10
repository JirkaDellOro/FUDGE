var WebGL2Test1;
(function (WebGL2Test1) {
    window.addEventListener("load", init);
    var canvas;
    var vertexShaderSource = "#version 300 es\n     \n        // an attribute is an input (in) to a vertex shader.\n        // It will receive data from a buffer\n        in vec2 a_position;\n \n        uniform vec2 u_resolution;\n       \n        void main() {\n          // convert the position from pixels to 0.0 to 1.0\n          vec2 zeroToOne = a_position / u_resolution;\n       \n          // convert from 0->1 to 0->2\n          vec2 zeroToTwo = zeroToOne * 2.0;\n       \n          // convert from 0->2 to -1->+1 (clipspace)\n          vec2 clipSpace = zeroToTwo - 1.0;\n       \n          gl_Position = vec4(clipSpace, 0, 1);\n        }\n        ";
    var fragmentShaderSource = "#version 300 es\n         \n        // fragment shaders don't have a default precision so we need\n        // to pick one. mediump is a good default. It means \"medium precision\"\n        precision mediump float;\n\n        uniform vec4 u_color;\n         \n        // we need to declare an output for the fragment shader\n        out vec4 outColor;\n         \n        void main() {\n          // Just set the output to a constant redish-purple\n          outColor = u_color;\n        }\n        ";
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
        var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
        var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
        var positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
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
        var colorLocation = gl.getUniformLocation(program, "u_color");
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        for (var i = 0; i < 50; i++) {
            setRectangle(gl, Math.random() * 400, Math.random() * 400, Math.random() * 400, Math.random() * 400);
            gl.uniform4f(colorLocation, Math.random(), Math.random(), Math.random(), Math.random());
            var primitiveType = gl.TRIANGLES;
            offset = 0;
            var count = 6;
            gl.drawArrays(primitiveType, offset, count);
        }
        gl.bindVertexArray(vao);
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