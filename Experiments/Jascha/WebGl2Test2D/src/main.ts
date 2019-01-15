namespace WebGl2Test2D {
    window.addEventListener("DOMContentLoaded", init);
    // Shader sourcestrings are located at script's bottom end.

    window.addEventListener("keydown", rotate);

    var shader: Shader; // Shaderdummy
    var vao;
    var positionAttributeLocation;
    var colorLocation;
    var matrixLocation;


    export function init() {
        console.log("Starting init().")
        GLUtil.initialize();
        //var scene:Scene = new Scene("Scene1");

        // Fill shaderdummy with compiled shaderprogram
        shader = new Shader("shader1", vertexShaderSource, fragmentShaderSource);

        // Supply data to the shaderprogram.
        positionAttributeLocation = shader.getAttributeLocation("a_position");
        matrixLocation = shader.getUniformLocation("u_matrix");
        colorLocation = shader.getUniformLocation("u_color"); // Variable to supply color information to the shader.

        // Create buffer that feeds data to the attribute.
        let positionBuffer = gl2.createBuffer();

        // Create new Vertex Array Object.
        vao = gl2.createVertexArray();
        // Bind vao for further use with WebGl2 vertexArrayfunctions.
        gl2.bindVertexArray(vao);

        // Enable pulling of data out of the Buffer
        gl2.enableVertexAttribArray(positionAttributeLocation);

        // Bind the "positionbuffer" for further use of it with WebGl2 bufferfunctions.
        gl2.bindBuffer(gl2.ARRAY_BUFFER, positionBuffer);

        setRectangle(gl2, 100, 100);

        // Datapull specifications
        let size: number = 3;   // 2 Components per Iteration (e.g. x and y coordinates of a vertex).
        let type: number = gl2.FLOAT; // Pulled data will be 32bit floats.
        let normalize: boolean = false; // Do not normalize pulled data.
        let stride: number = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position.
        let offset: number = 0; // Count of attribute to start by.

        // Use specifications and bind attribute to positionBuffer
        gl2.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);



        shader.use();



        // Supply colordata to the shaders u_color uniform.
        drawScene();



    }
    var translation = [100, 50];
    var color = [0, 1, 0, 1];
    var rotation = [0, 1];
    var rotationInDegrees: number = 0;


    var scale = [1, 1];

    function rotate(): void {
        rotationInDegrees += 10;
        drawScene();
    }

    function drawScene(): void {
        GLUtil.resizeCanvasToDisplaySize(gl2.canvas);
        // Set initial viewport and clear canvas.
        gl2.viewport(0, 0, gl2.canvas.width, gl2.canvas.height);
        gl2.clearColor(0, 0, 0, 0);
        gl2.clear(gl2.COLOR_BUFFER_BIT | gl2.DEPTH_BUFFER_BIT);

        // Use the program (pair of shaders) in renderingcontext.
        shader.use();
        gl2.bindVertexArray(vao);
        gl2.uniform4fv(colorLocation, color);

        // Compute the matrices
        var matrix: number[] = M3.projection(gl2.canvas.clientWidth, gl2.canvas.clientHeight);
        var moveOriginMatrix = M3.moveOriginMatrix(-25, -25);
        // Multiply the matrices.;
        for (var i = 0; i<5; ++i){
        matrix = M3.translate(matrix, translation[0], translation[1]);
        matrix = M3.rotate(matrix, rotationInDegrees);
        matrix = M3.scale(matrix, scale[0], scale[1]);


        // Supply matrix to shader. 
        gl2.uniformMatrix3fv(matrixLocation, false, matrix);

        // Draw call
        var primitiveType: any = gl2.TRIANGLES;
        var offset = 0;
        var count: number = 6;  // How many pairs of positions will be iterated.
        gl2.drawArrays(primitiveType, offset, count);}

    }

    function setRectangle(_gl2: WebGL2RenderingContext, _width: number, _height: number) {

        _gl2.bufferData(_gl2.ARRAY_BUFFER, new Float32Array([
            0, 0, 0,
            _width, 0, 0,
            0, _height,0,
            0, _height,0,
            _width, _height,0,
            _width, 0,0]), _gl2.STATIC_DRAW);
    }



    // Shadersourcestrings below
    var vertexShaderSource = `#version 300 es
 
    // an attribute is an input (in) to a vertex shader.
    // It will receive data from a buffer
    in vec2 a_position;

    // The Matrix to transform the positions by.
    uniform mat3 u_matrix;

    // all shaders have a main function
    void main() {     
        gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
    }
    `;

    var fragmentShaderSource = `#version 300 es
 
                            // fragment shaders don't have a default precision so we need
                            // to pick one. mediump is a good default. It means "medium precision"
                            precision mediump float;
                            

                            uniform vec4 u_color;

                            // we need to declare an output for the fragment shader
                            out vec4 outColor;
                            
                            void main() {
                            outColor = u_color;
                            }`;

}