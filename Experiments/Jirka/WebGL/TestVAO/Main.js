"use strict";
var TestVAO;
(function (TestVAO) {
    let gl;
    let renderInfos = [];
    let shaderInfo = { program: null, attributes: {}, uniforms: {} };
    window.addEventListener("load", init);
    function init(_event) {
        const canvas = utils.getCanvas("webgl-canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl = utils.getGLContext(canvas);
        gl.clearColor(0, 0, 0, 1);
        initProgram();
        initVAO(TestLib.square);
        initVAO(TestLib.triangle);
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
    function initVAO(_mesh) {
        let vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        // Setting up the VBO
        let vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(_mesh.vertices), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(shaderInfo.attributes["aVertexPosition"]);
        gl.vertexAttribPointer(shaderInfo.attributes["aVertexPosition"], 3, gl.FLOAT, false, 0, 0);
        // Setting up the IBO
        let indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(_mesh.indices), gl.STATIC_DRAW);
        // Clean
        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        let renderInfo = { vao: vao, nIndices: _mesh.indices.length };
        renderInfos.push(renderInfo);
    }
    // We call draw to render to our canvas
    function draw() {
        // Clear the scene
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        for (let renderInfo of renderInfos) {
            gl.bindVertexArray(renderInfo.vao);
            gl.drawElements(gl.TRIANGLES, renderInfo.nIndices, gl.UNSIGNED_SHORT, 0);
        }
        // Clean
        gl.bindVertexArray(null);
    }
})(TestVAO || (TestVAO = {}));
//# sourceMappingURL=Main.js.map