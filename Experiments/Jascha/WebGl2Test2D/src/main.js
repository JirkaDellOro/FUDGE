var WebGl2Test2D;
(function (WebGl2Test2D) {
    window.addEventListener("DOMContentLoaded", init);
    // Shader sourcestrings are located at script's bottom end.
    window.addEventListener("keydown", rotate);
    var shader; // Shaderdummy
    var vao;
    var positionAttributeLocation;
    var colorLocation;
    var matrixLocation;
    function init() {
        console.log("Starting init().");
        WebGl2Test2D.GLUtil.initialize();
        //var scene:Scene = new Scene("Scene1");
        // Fill shaderdummy with compiled shaderprogram
        shader = new WebGl2Test2D.Shader("shader1", vertexShaderSource, fragmentShaderSource);
        // Supply data to the shaderprogram.
        positionAttributeLocation = shader.getAttributeLocation("a_position");
        matrixLocation = shader.getUniformLocation("u_matrix");
        colorLocation = shader.getUniformLocation("u_color"); // Variable to supply color information to the shader.
        // Create buffer that feeds data to the attribute.
        var positionBuffer = WebGl2Test2D.gl2.createBuffer();
        // Create new Vertex Array Object.
        vao = WebGl2Test2D.gl2.createVertexArray();
        // Bind vao for further use with WebGl2 vertexArrayfunctions.
        WebGl2Test2D.gl2.bindVertexArray(vao);
        // Enable pulling of data out of the Buffer
        WebGl2Test2D.gl2.enableVertexAttribArray(positionAttributeLocation);
        // Bind the "positionbuffer" for further use of it with WebGl2 bufferfunctions.
        WebGl2Test2D.gl2.bindBuffer(WebGl2Test2D.gl2.ARRAY_BUFFER, positionBuffer);
        setRectangle(WebGl2Test2D.gl2, 100, 100);
        // Datapull specifications
        var size = 3; // 2 Components per Iteration (e.g. x and y coordinates of a vertex).
        var type = WebGl2Test2D.gl2.FLOAT; // Pulled data will be 32bit floats.
        var normalize = false; // Do not normalize pulled data.
        var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position.
        var offset = 0; // Count of attribute to start by.
        // Use specifications and bind attribute to positionBuffer
        WebGl2Test2D.gl2.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
        shader.use();
        // Supply colordata to the shaders u_color uniform.
        drawScene();
    }
    WebGl2Test2D.init = init;
    var translation = [100, 50];
    var color = [0, 1, 0, 1];
    var rotation = [0, 1];
    var rotationInDegrees = 0;
    var scale = [1, 1];
    function rotate() {
        rotationInDegrees += 10;
        drawScene();
    }
    function drawScene() {
        WebGl2Test2D.GLUtil.resizeCanvasToDisplaySize(WebGl2Test2D.gl2.canvas);
        // Set initial viewport and clear canvas.
        WebGl2Test2D.gl2.viewport(0, 0, WebGl2Test2D.gl2.canvas.width, WebGl2Test2D.gl2.canvas.height);
        WebGl2Test2D.gl2.clearColor(0, 0, 0, 0);
        WebGl2Test2D.gl2.clear(WebGl2Test2D.gl2.COLOR_BUFFER_BIT | WebGl2Test2D.gl2.DEPTH_BUFFER_BIT);
        // Use the program (pair of shaders) in renderingcontext.
        shader.use();
        WebGl2Test2D.gl2.bindVertexArray(vao);
        WebGl2Test2D.gl2.uniform4fv(colorLocation, color);
        // Compute the matrices
        var matrix = WebGl2Test2D.M3.projection(WebGl2Test2D.gl2.canvas.clientWidth, WebGl2Test2D.gl2.canvas.clientHeight);
        var moveOriginMatrix = WebGl2Test2D.M3.moveOriginMatrix(-25, -25);
        // Multiply the matrices.;
        for (var i = 0; i < 5; ++i) {
            matrix = WebGl2Test2D.M3.translate(matrix, translation[0], translation[1]);
            matrix = WebGl2Test2D.M3.rotate(matrix, rotationInDegrees);
            matrix = WebGl2Test2D.M3.scale(matrix, scale[0], scale[1]);
            // Supply matrix to shader. 
            WebGl2Test2D.gl2.uniformMatrix3fv(matrixLocation, false, matrix);
            // Draw call
            var primitiveType = WebGl2Test2D.gl2.TRIANGLES;
            var offset = 0;
            var count = 6; // How many pairs of positions will be iterated.
            WebGl2Test2D.gl2.drawArrays(primitiveType, offset, count);
        }
    }
    function setRectangle(_gl2, _width, _height) {
        _gl2.bufferData(_gl2.ARRAY_BUFFER, new Float32Array([
            0, 0, 0,
            _width, 0, 0,
            0, _height, 0,
            0, _height, 0,
            _width, _height, 0,
            _width, 0, 0
        ]), _gl2.STATIC_DRAW);
    }
    // Shadersourcestrings below
    var vertexShaderSource = "#version 300 es\n \n    // an attribute is an input (in) to a vertex shader.\n    // It will receive data from a buffer\n    in vec2 a_position;\n\n    // The Matrix to transform the positions by.\n    uniform mat3 u_matrix;\n\n    // all shaders have a main function\n    void main() {     \n        gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);\n    }\n    ";
    var fragmentShaderSource = "#version 300 es\n \n                            // fragment shaders don't have a default precision so we need\n                            // to pick one. mediump is a good default. It means \"medium precision\"\n                            precision mediump float;\n                            \n\n                            uniform vec4 u_color;\n\n                            // we need to declare an output for the fragment shader\n                            out vec4 outColor;\n                            \n                            void main() {\n                            outColor = u_color;\n                            }";
})(WebGl2Test2D || (WebGl2Test2D = {}));
//# sourceMappingURL=main.js.map