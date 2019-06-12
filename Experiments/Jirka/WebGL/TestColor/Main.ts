namespace TestColor {
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
        addProgram(tl.shader.vertexColor, tl.shader.fragmentColor);
        createRenderInfo(tl.square, shaderInfos[0], null); //, new tl.MaterialColor(1, 1, 0, 1));
        createRenderInfo(tl.triangle, shaderInfos[1], null); // new tl.MaterialColor(1, 0, 0, 1));
        createRenderInfo(tl.penta, shaderInfos[2], new tl.MaterialColor(1, 0, 1, 1));
        createRenderInfo(tl.hexa, shaderInfos[2], new tl.MaterialColor(0, 0, 1, 1));
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
            attributes: detectAttributes(program),
            uniforms: detectUniforms(program)
        };
        shaderInfos.push(shaderInfo);
    }

    function detectAttributes(_program: WebGLProgram): { [name: string]: number } {
        let detectedAttributes: { [name: string]: number } = {};
        let attributeCount: number = gl.getProgramParameter(_program, WebGL2RenderingContext.ACTIVE_ATTRIBUTES);
        for (let i: number = 0; i < attributeCount; i++) {
            let attributeInfo: WebGLActiveInfo = gl.getActiveAttrib(_program, i);
            if (!attributeInfo) {
                break;
            }
            detectedAttributes[attributeInfo.name] = gl.getAttribLocation(_program, attributeInfo.name);
        }
        return detectedAttributes;
    }

    function detectUniforms(_program: WebGLProgram): { [name: string]: WebGLUniformLocation } {
        let detectedUniforms: { [name: string]: WebGLUniformLocation } = {};
        let uniformCount: number = gl.getProgramParameter(_program, WebGL2RenderingContext.ACTIVE_UNIFORMS);
        for (let i: number = 0; i < uniformCount; i++) {
            let info: WebGLActiveInfo = gl.getActiveUniform(_program, i);
            if (!info) {
                break;
            }
            detectedUniforms[info.name] = gl.getUniformLocation(_program, info.name);
        }
        return detectedUniforms;
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


    function createRenderInfo(_mesh: tl.Mesh, _shaderInfo: tl.ShaderInfo, _material: tl.Material): void {
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

        let renderInfo: tl.RenderInfo = { shaderInfo: _shaderInfo, vao: vao, material: _material };
        renderInfos.push(renderInfo);
        
        let renderMesh: tl.RenderMesh = { vertices: vertexBuffer, indices: indexBuffer, textureUVs: null, nIndices: _mesh.indices.length};
        renderInfo.renderMesh = renderMesh;
    }

    // We call draw to render to our canvas
    function draw(): void {
        // Clear the scene
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        for (let renderInfo of renderInfos) {
            gl.useProgram(renderInfo.shaderInfo.program);

            if (renderInfo.material)
                renderInfo.material.useRenderData(gl, renderInfo.shaderInfo);

            gl.bindVertexArray(renderInfo.vao);
            gl.drawElements(gl.TRIANGLES, renderInfo.renderMesh.nIndices, gl.UNSIGNED_SHORT, 0);
        }
        // Clean
        gl.bindVertexArray(null);
    }
}