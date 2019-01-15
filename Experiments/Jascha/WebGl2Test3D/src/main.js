var WebGl2Test3D;
(function (WebGl2Test3D) {
    window.addEventListener("DOMContentLoaded", init);
    // Shader sourcestrings are located at script's bottom end.
    window.addEventListener("keydown", rotate);
    var shader; // Shaderdummy
    var vao;
    var positionAttributeLocation;
    var colorAttributeLocation;
    var matrixLocation;
    var zFactorLocation;
    function init() {
        console.log("Starting init().");
        WebGl2Test3D.GLUtil.initialize();
        //var scene:Scene = new Scene("Scene1");
        // Fill shaderdummy with compiled shaderprogram
        shader = new WebGl2Test3D.Shader(vertexShaderSource, fragmentShaderSource);
        // Get Locations for the shaders attributes and uniforms.
        positionAttributeLocation = shader.getAttributeLocation("a_position");
        colorAttributeLocation = shader.getAttributeLocation("a_color");
        matrixLocation = shader.getUniformLocation("u_matrix");
        // Create buffer that feeds data to the attributes.
        var positionBuffer = WebGl2Test3D.gl2.createBuffer();
        // Create new Vertex Array Object.
        vao = WebGl2Test3D.gl2.createVertexArray();
        // Bind vao for further use with WebGl2 vertexarray functions.
        WebGl2Test3D.gl2.bindVertexArray(vao);
        // Enable pulling of data out of the Buffer
        WebGl2Test3D.gl2.enableVertexAttribArray(positionAttributeLocation);
        // Bind the "positionbuffer" for further use of it with WebGl2 bufferfunctions.
        WebGl2Test3D.gl2.bindBuffer(WebGl2Test3D.gl2.ARRAY_BUFFER, positionBuffer);
        // Setting up a cube (TODO: Outsource to Meshclass
        setGeometry(WebGl2Test3D.gl2, 50, 50, 50);
        // Datapull specifications
        var size = 3; // 3 Components per Iteration (e.g. x, y and z coordinates of a vertex. Needs to be 2 vor 2D meshes (sprites)).
        var type = WebGl2Test3D.gl2.FLOAT; // Pulled data will be 32bit floats, as WebGL2 stores vertexdata as such.
        var normalize = false; // Do not normalize pulled data.
        var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position.
        var offset = 0; // Count of attribute to start by.
        // Use specifications and bind attribute to positionBuffer.
        WebGl2Test3D.gl2.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
        // Create new colorbuffer to feed data to vertexshader.
        var colorBuffer = WebGl2Test3D.gl2.createBuffer();
        WebGl2Test3D.gl2.bindBuffer(WebGl2Test3D.gl2.ARRAY_BUFFER, colorBuffer);
        setColors(WebGl2Test3D.gl2);
        // Enable pulling of data out of the buffer.
        WebGl2Test3D.gl2.enableVertexAttribArray(colorAttributeLocation);
        // Tell the attribute how to get data out of colorBuffer (ARRAY_BUFFER)
        var colorSize = 3; // 3 components per iteration
        var colorType = WebGl2Test3D.gl2.UNSIGNED_BYTE; // the data is 8bit unsigned bytes
        var colorNormalize = true; // convert from 0-255 to 0.0-1.0
        var colorStride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next color
        var colorOffset = 0; // start at the beginning of the buffer
        WebGl2Test3D.gl2.vertexAttribPointer(colorAttributeLocation, colorSize, colorType, colorNormalize, colorStride, colorOffset);
        // Supply colordata to the shaders u_color uniform.
        drawScene();
    }
    WebGl2Test3D.init = init;
    // Set transformdata for the object to be drawn (TODO: Outsource to Transformclass).
    var translation = [0, 0, -150];
    var rotationInDegrees = [30, 0, 0];
    var scale = [1, 1, 1];
    // Trial function (Will be erased after testing).
    function rotate() {
        rotationInDegrees[1] += 10;
        drawScene();
    }
    // Sets data for the frame to be rendered. (TODO: Outsource to sceneclass).
    function drawScene() {
        WebGl2Test3D.GLUtil.resizeCanvasToDisplaySize(WebGl2Test3D.gl2.canvas);
        // Set initial viewport and clear canvas.
        WebGl2Test3D.gl2.viewport(0, 0, WebGl2Test3D.gl2.canvas.width, WebGl2Test3D.gl2.canvas.height);
        WebGl2Test3D.gl2.clearColor(0, 0, 0, 0);
        WebGl2Test3D.gl2.clear(WebGl2Test3D.gl2.COLOR_BUFFER_BIT | WebGl2Test3D.gl2.DEPTH_BUFFER_BIT);
        // Use the program (pair of shaders) in renderingcontext.
        shader.use();
        WebGl2Test3D.gl2.bindVertexArray(vao);
        // Enable backface- and zBuffer-culling.
        WebGl2Test3D.gl2.enable(WebGl2Test3D.gl2.CULL_FACE);
        WebGl2Test3D.gl2.enable(WebGl2Test3D.gl2.DEPTH_TEST);
        // Compute the matrices
        // Setting perspective (TODO: Outsource to cameraclass).
        var fieldOfViewInDegrees = 130;
        var aspect = WebGl2Test3D.gl2.canvas.clientWidth / WebGl2Test3D.gl2.canvas.clientHeight;
        var zNear = 1;
        var zFar = 2000;
        // Applying perspective, changing Worldspace to Cameraspace.
        var matrix = WebGl2Test3D.M4.perspective(fieldOfViewInDegrees, aspect, zNear, zFar);
        // Orienting object in Cameraspace (TODO: Transformdata should be called from object-to-be-drawn's transform Component)
        for (var i = 0; i < 5; ++i) {
            matrix = WebGl2Test3D.M4.translate(matrix, translation[0], translation[1], translation[2]);
            matrix = WebGl2Test3D.M4.rotateX(matrix, rotationInDegrees[0]);
            matrix = WebGl2Test3D.M4.rotateY(matrix, rotationInDegrees[1]);
            matrix = WebGl2Test3D.M4.rotateZ(matrix, rotationInDegrees[2]);
            matrix = WebGl2Test3D.M4.scale(matrix, scale[0], scale[1], scale[2]);
            // Setting object-to-be-drawn's pivotpoint.
            matrix = WebGl2Test3D.M4.multiply(matrix, WebGl2Test3D.M4.moveOriginMatrix(-25, -25, 0));
            matrix = WebGl2Test3D.M4.multiply(matrix, WebGl2Test3D.M4.rotateOriginMatrix(0, 0, 90));
            // Supply matrixdata to shader. 
            WebGl2Test3D.gl2.uniformMatrix4fv(matrixLocation, false, matrix);
            // Draw call
            var primitiveType = WebGl2Test3D.gl2.TRIANGLES;
            var offset = 0;
            var count = 6 * 6; // How many sets of positions will be iterated.
            WebGl2Test3D.gl2.drawArrays(primitiveType, offset, count);
        }
    }
    // Trial function to setup a cube geometry (TODO: Outsource to geometryclass).
    function setGeometry(_gl2, _width, _height, _depth) {
        // Supply position data for each face of the cube to the buffer.
        _gl2.bufferData(_gl2.ARRAY_BUFFER, new Float32Array([
            //front
            0, 0, _depth / 2,
            _width, 0, _depth / 2,
            0, _height, _depth / 2,
            0, _height, _depth / 2,
            _width, 0, _depth / 2,
            _width, _height, _depth / 2,
            //back
            0, 0, -_depth / 2,
            0, _height, -_depth / 2,
            _width, 0, -_depth / 2,
            0, _height, -_depth / 2,
            _width, _height, -_depth / 2,
            _width, 0, -_depth / 2,
            //left
            0, 0, _depth / 2,
            0, _height, _depth / 2,
            0, _height, -_depth / 2,
            0, _height, -_depth / 2,
            0, 0, -_depth / 2,
            0, 0, _depth / 2,
            //right
            _width, 0, _depth / 2,
            _width, _height, -_depth / 2,
            _width, _height, _depth / 2,
            _width, _height, -_depth / 2,
            _width, 0, _depth / 2,
            _width, 0, -_depth / 2,
            //top
            0, _height, _depth / 2,
            _width, _height, _depth / 2,
            _width, _height, -_depth / 2,
            _width, _height, -_depth / 2,
            0, _height, -_depth / 2,
            0, _height, _depth / 2,
            //bottom
            0, 0, _depth / 2,
            _width, 0, -_depth / 2,
            _width, 0, _depth / 2,
            _width, 0, -_depth / 2,
            0, 0, _depth / 2,
            0, 0, -_depth / 2,
        ]), _gl2.STATIC_DRAW);
    }
    // Trial function to setup the cube's face's colors (TODO: Outsource to Material?).
    function setColors(_gl2) {
        WebGl2Test3D.gl2.bufferData(WebGl2Test3D.gl2.ARRAY_BUFFER, new Uint8Array([
            // front
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            // back
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            // left
            0, 70, 120,
            0, 70, 120,
            0, 70, 120,
            0, 70, 120,
            0, 70, 120,
            0, 70, 120,
            //right
            0, 70, 120,
            0, 70, 120,
            0, 70, 120,
            0, 70, 120,
            0, 70, 120,
            0, 70, 120,
            // top
            160, 160, 220,
            160, 160, 220,
            160, 160, 220,
            160, 160, 220,
            160, 160, 220,
            160, 160, 220,
            //bottom
            160, 160, 220,
            160, 160, 220,
            160, 160, 220,
            160, 160, 220,
            160, 160, 220,
            160, 160, 220,
        ]), WebGl2Test3D.gl2.STATIC_DRAW);
    }
    // Shadersourcestrings below
    // 2D Shaders for trial
    var vertexShaderSource = "#version 300 es\n \n    // an attribute is an input (in) to a vertex shader.\n    // It will receive data from a buffer\n    in vec4 a_position;\n    in vec4 a_color;\n\n    // The Matrix to transform the positions by.\n    uniform mat4 u_matrix;\n\n    // Varying color in the fragmentshader.\n    out vec4 v_color;\n\n    // all shaders have a main function.\n    void main() {  \n        // Multiply all positions by the matrix.   \n        vec4 position = u_matrix * a_position;\n\n\n        gl_Position = u_matrix * a_position;\n\n        // Pass color to fragmentshader.\n        v_color = a_color;\n    }\n    ";
    var fragmentShaderSource = "#version 300 es\n \n                            // fragment shaders don't have a default precision so we need\n                            // to pick one. mediump is a good default. It means \"medium precision\"\n                            precision mediump float;\n                            \n                            // Color passed from vertexshader.\n                            in vec4 v_color;\n\n                            uniform vec4 u_color;\n\n                            // we need to declare an output for the fragment shader\n                            out vec4 outColor;\n                            \n                            void main() {\n                            outColor = v_color;\n                            }";
})(WebGl2Test3D || (WebGl2Test3D = {}));
//# sourceMappingURL=main.js.map