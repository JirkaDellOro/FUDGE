namespace WebGl2Test3D {
    window.addEventListener("DOMContentLoaded", init);
    // Shader sourcestrings are located at script's bottom end.

    window.addEventListener("keydown", rotate);

    var shader: Shader; // Shaderdummy
    var vao;
    var positionAttributeLocation;
    var colorAttributeLocation;
    var matrixLocation;
    var zFactorLocation;


    export function init() {
        console.log("Starting init().")
        GLUtil.initialize();
        //var scene:Scene = new Scene("Scene1");

        // Fill shaderdummy with compiled shaderprogram. (TODO: should not be here.
        // Shader should be a component or part of a component class material.)
        shader = new Shader(vertexShaderSource, fragmentShaderSource);

        // Get Locations for the shaders attributes and uniforms.
        positionAttributeLocation = shader.getAttributeLocation("a_position");
        colorAttributeLocation = shader.getAttributeLocation("a_color");
        matrixLocation = shader.getUniformLocation("u_matrix");

        // Create buffer that feeds data to the attributes.
        // (TODO: Buffer functionality should (probably) be located in a static class
        // and be called upon by the scene when calling drawScene.
        let positionBuffer = gl2.createBuffer();
        // Create new Vertex Array Object.
        vao = gl2.createVertexArray();
        // Bind vao for further use with WebGl2 vertexarray functions.
        gl2.bindVertexArray(vao);

        // Enable pulling of data out of the Buffer
        gl2.enableVertexAttribArray(positionAttributeLocation);

        // Bind the "positionbuffer" for further use of it with WebGl2 bufferfunctions.
        gl2.bindBuffer(gl2.ARRAY_BUFFER, positionBuffer);

        // Setting up a cube (TODO: Outsource to another class.
        // A fudgeNodes meshcomponent should only hold vertexposition data. 
        // That data is to be processed by a buffer, when the scene is drawn.)
        setGeometry(gl2, 50, 50, 50);

        // Datapull specifications
        let size: number = 3;   // 3 Components per Iteration (i.e. x, y and z coordinates of a vertex. Needs to be 2 vor 2D meshes (sprites)).
        let type: number = gl2.FLOAT; // Pulled data will be 32bit floats, as WebGL2 stores vertexdata as such.
        let normalize: boolean = false; // Do not normalize pulled data.
        let stride: number = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position.
        let offset: number = 0; // Count of attribute to start by.

        // Use specifications and bind attribute to positionBuffer.
        gl2.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

        // Create new colorbuffer to feed data to vertexshader.
        let colorBuffer = gl2.createBuffer();
        gl2.bindBuffer(gl2.ARRAY_BUFFER, colorBuffer);
        setColors(gl2);
        // Enable pulling of data out of the buffer.
        gl2.enableVertexAttribArray(colorAttributeLocation);

        // Tell the attribute how to get data out of colorBuffer (ARRAY_BUFFER)
        var colorSize = 3;          // 3 components per iteration
        var colorType = gl2.UNSIGNED_BYTE;   // the data is 8bit unsigned bytes
        var colorNormalize = true;  // convert from 0-255 to 0.0-1.0
        var colorStride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next color
        var colorOffset = 0;        // start at the beginning of the buffer
        gl2.vertexAttribPointer(
            colorAttributeLocation, colorSize, colorType, colorNormalize, colorStride, colorOffset);

        drawScene();


    }
    // Set transformdata for the object to be drawn (TODO: Outsource to Transformclass).
    var translation = [0, 0, -150];
    var rotationInDegrees: number[] = [30, 0, 0];
    var scale: number[] = [1, 1, 1];

    // Trial function (Will be erased after testing).
    function rotate(): void {
        rotationInDegrees[1] += 10;
        drawScene();
    }

    // Sets data for the frame to be rendered. (TODO: Outsource to sceneclass).
    function drawScene(): void {
        GLUtil.resizeCanvasToDisplaySize(gl2.canvas);
        // Set initial viewport and clear canvas.
        gl2.viewport(0, 0, gl2.canvas.width, gl2.canvas.height);
        gl2.clearColor(0, 0, 0, 0);
        gl2.clear(gl2.COLOR_BUFFER_BIT | gl2.DEPTH_BUFFER_BIT);

        // Use the program (pair of shaders) in renderingcontext.
        shader.use();
        gl2.bindVertexArray(vao);
        // Enable backface- and zBuffer-culling.
        gl2.enable(gl2.CULL_FACE);
        gl2.enable(gl2.DEPTH_TEST);

        // Compute the matrices

        // Setting perspective (TODO: Outsource to cameraclass).
        var fieldOfViewInDegrees = 130;
        var aspect = gl2.canvas.clientWidth / gl2.canvas.clientHeight;
        var zNear = 1;
        var zFar = 2000;
        // Applying perspective, changing Worldspace to Cameraspace.
        var matrix = M4.perspective(fieldOfViewInDegrees, aspect, zNear, zFar);
        // Orienting object in Cameraspace (TODO: Transformdata should be called from object-to-be-drawn's transform Component)
        for (var i = 0; i < 5; ++i) {
            matrix = M4.translate(matrix, translation[0], translation[1], translation[2]);
            matrix = M4.rotateX(matrix, rotationInDegrees[0]);
            matrix = M4.rotateY(matrix, rotationInDegrees[1]);
            matrix = M4.rotateZ(matrix, rotationInDegrees[2]);
            matrix = M4.scale(matrix, scale[0], scale[1], scale[2]);
            // Setting object-to-be-drawn's pivotpoint.
            matrix = M4.multiply(matrix, M4.moveOriginMatrix(-25, -25, 0));
            matrix = M4.multiply(matrix, M4.rotateOriginMatrix(0, 0, 90));

            // Supply matrixdata to shader. 
            gl2.uniformMatrix4fv(matrixLocation, false, matrix);

            // Draw call
            var primitiveType: any = gl2.TRIANGLES;
            var offset = 0;
            var count: number = 6 * 6;  // How many sets of positions will be iterated.
            gl2.drawArrays(primitiveType, offset, count);
        }
    }

    // Trial function to setup a cube geometry (TODO: Outsource to geometryclass).
    function setGeometry(_gl2: WebGL2RenderingContext, _width: number, _height: number, _depth: number) {

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
    function setColors(_gl2: WebGLRenderingContext): void {
        gl2.bufferData(gl2.ARRAY_BUFFER, new Uint8Array([
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
            160, 160, 220,])

            , gl2.STATIC_DRAW)
    }

    // Shadersourcestrings below.


    var vertexShaderSource = `#version 300 es
 
    // an attribute is an input (in) to a vertex shader.
    // It will receive data from a buffer
    in vec4 a_position;
    in vec4 a_color;

    // The Matrix to transform the positions by.
    uniform mat4 u_matrix;

    // Varying color in the fragmentshader.
    out vec4 v_color;

    // all shaders have a main function.
    void main() {  
        // Multiply all positions by the matrix.   
        vec4 position = u_matrix * a_position;


        gl_Position = u_matrix * a_position;

        // Pass color to fragmentshader.
        v_color = a_color;
    }
    `;

    var fragmentShaderSource = `#version 300 es
 
                            // fragment shaders don't have a default precision so we need
                            // to pick one. mediump is a good default. It means "medium precision"
                            precision mediump float;
                            
                            // Color passed from vertexshader.
                            in vec4 v_color;

                            uniform vec4 u_color;

                            // we need to declare an output for the fragment shader
                            out vec4 outColor;
                            
                            void main() {
                            outColor = v_color;
                            }`;

}