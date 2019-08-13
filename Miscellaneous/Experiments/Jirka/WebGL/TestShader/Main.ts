namespace TestShader {
    // tslint:disable-next-line: no-any
    declare const utils: any;
    import tl = TestLib;

    let gl: WebGL2RenderingContext;
    let renderInfos: tl.RenderInfo[] = [];
    let shaderInfos: tl.ShaderInfo[] = [];

    window.addEventListener("load", init);

    function init(_event: Event): void {
        const canvas: HTMLCanvasElement = utils.getCanvas("webgl-canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        gl = utils.getGLContext(canvas);
        gl.clearColor(0, 0, 0, 1);

        addProgram(tl.shader.vertexSimple, tl.shader.fragmentYellow);
        addProgram(tl.shader.vertexSimple, tl.shader.fragmentRed);
        initVAO(tl.square, shaderInfos[0]);
        initVAO(tl.triangle, shaderInfos[1]);
        draw();
    }

    function addProgram(_vertex: string, _fragment: string): void {
        const vertexShader: WebGLShader = getShader(_vertex, gl.VERTEX_SHADER);
        const fragmentShader: WebGLShader = getShader(_fragment, gl.FRAGMENT_SHADER);

        let program: WebGLProgram = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error("Could not initialize shaders");
        }

        let shaderInfo: tl.ShaderInfo = {
            program: program,
            attributes: {
                "aVertexPosition": gl.getAttribLocation(program, "aVertexPosition")
            },
            uniforms: {}
        };
        shaderInfos.push(shaderInfo);
    }

    function getShader(_source: string, type: number): WebGLShader {
        let shader: WebGLShader;
        shader = gl.createShader(type);

        gl.shaderSource(shader, _source);
        gl.compileShader(shader);

        // TODO: inculde validation in FUDGE
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }


    function initVAO(_mesh: tl.Mesh, _shaderInfo: tl.ShaderInfo): void {
        let vao: WebGLVertexArrayObject = gl.createVertexArray();
        gl.bindVertexArray(vao);

        // Setting up the VBO
        let vertexBuffer: WebGLBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(_mesh.vertices), gl.STATIC_DRAW);

        gl.enableVertexAttribArray(_shaderInfo.attributes["aVertexPosition"]);
        gl.vertexAttribPointer(_shaderInfo.attributes["aVertexPosition"], 3, gl.FLOAT, false, 0, 0);

        // Setting up the IBO
        let indexBuffer: WebGLBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(_mesh.indices), gl.STATIC_DRAW);

        // Clean
        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        let renderInfo: tl.RenderInfo = { shaderInfo: _shaderInfo, vao: vao, material: null };
        renderInfos.push(renderInfo);

        let renderMesh: tl.RenderMesh = { vertices: vertexBuffer, indices: indexBuffer, textureUVs: null, nIndices: _mesh.indices.length };
        renderInfo.renderMesh = renderMesh;
    }

    // We call draw to render to our canvas
    function draw(): void {
        // Clear the scene
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        for (let renderInfo of renderInfos) {
            gl.useProgram(renderInfo.shaderInfo.program);
            gl.bindVertexArray(renderInfo.vao);
            gl.drawElements(gl.TRIANGLES, renderInfo.renderMesh.nIndices, gl.UNSIGNED_SHORT, 0);
        }
        // Clean
        gl.bindVertexArray(null);
    }
}