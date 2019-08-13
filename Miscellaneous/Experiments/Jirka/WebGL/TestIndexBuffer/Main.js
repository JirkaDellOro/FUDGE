"use strict";
var TestIndexBuffer;
(function (TestIndexBuffer) {
    // Call init once the webpage has loaded
    let gl;
    let squareVertexBuffer;
    let squareIndexBuffer;
    let indices;
    let shaderInfo = { program: null, attributes: {}, uniforms: {} };
    window.addEventListener("load", init);
    function init(_event) {
        const canvas = utils.getCanvas("webgl-canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl = utils.getGLContext(canvas);
        gl.clearColor(0, 0, 0, 1);
        initProgram();
        initBuffers();
        draw();
    }
    function initProgram() {
        const vertexShader = getShader("vertex-shader");
        const fragmentShader = getShader("fragment-shader");
        let program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error("Could not initialize shaders");
        }
        gl.useProgram(program);
        shaderInfo.program = program;
        shaderInfo.attributes["aVertexPosition"] = gl.getAttribLocation(program, "aVertexPosition");
    }
    function getShader(id) {
        const script = document.getElementById(id);
        const shaderString = script.text.trim();
        // Assign shader depending on the type of shader
        let shader;
        if (script.type === "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        }
        else if (script.type === "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        }
        else {
            return null;
        }
        gl.shaderSource(shader, shaderString);
        gl.compileShader(shader);
        // TODO: inculde validation in FUDGE
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    }
    // Set up the buffers for the square
    function initBuffers() {
        const vertices = [
            -0.5, 0.5, 0,
            -0.5, -0.5, 0,
            0.5, -0.2, 0,
            0.5, 0.5, 0
        ];
        // Indices defined in counter-clockwise order
        indices = [0, 1, 2, 0, 2, 3];
        // Setting up the VBO
        squareVertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        // Setting up the IBO
        squareIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, squareIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
        // Clean
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }
    // We call draw to render to our canvas
    function draw() {
        // Clear the scene
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        // Use the buffers we've constructed
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexBuffer);
        gl.vertexAttribPointer(shaderInfo.attributes["aVertexPosition"], 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shaderInfo.attributes["aVertexPosition"]);
        // Bind IBO
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, squareIndexBuffer);
        // Draw to the scene using triangle primitives
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
        // Clean
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }
})(TestIndexBuffer || (TestIndexBuffer = {}));
//# sourceMappingURL=Main.js.map