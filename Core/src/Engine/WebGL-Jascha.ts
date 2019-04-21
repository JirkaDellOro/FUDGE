namespace Fudge {
/*
    interface ShaderProgram {
        webGLProgram: WebGLProgram;
        attributes: { [name: string]: number };
        uniforms: { [name: string]: WebGLUniformLocation };
    }
    class WebGL_Jascha {
        crc3: WebGL2RenderingContext;

        private createProgram(_shader: Shader): ShaderProgram {
            let crc3: WebGL2RenderingContext = this.crc3;
            let shaderProgram: WebGLProgram = new WebGLProgram();
            crc3.attachShader(shaderProgram, GLUtil.assert<WebGLShader>(compileShader(_shader.loadVertexShaderSource(), crc3.VERTEX_SHADER)));
            crc3.attachShader(shaderProgram, GLUtil.assert<WebGLShader>(compileShader(_shader.loadFragmentShaderSource(), crc3.FRAGMENT_SHADER)));
            crc3.linkProgram(shaderProgram);
            let error: string = GLUtil.assert<string>(crc3.getProgramInfoLog(shaderProgram));
            if (error !== "") {
                throw new Error("Error linking Shader: " + error);
            }
            let program: ShaderProgram = {
                webGLProgram: shaderProgram,
                attributes: detectAttributes(),
                uniforms: detectUniforms()
            }
            return program;


            function compileShader(_shaderCode: string, _shaderType: GLenum): WebGLShader | null {
                let webGLShader: WebGLShader = crc3.createShader(_shaderType);
                crc3.shaderSource(webGLShader, _shaderCode);
                crc3.compileShader(webGLShader);
                let error: string = GLUtil.assert<string>(crc3.getShaderInfoLog(webGLShader));
                if (error !== "") {
                    throw new Error("Error compiling shader: " + error);
                }
                // Check for any compilation errors.
                if (!crc3.getShaderParameter(webGLShader, crc3.COMPILE_STATUS)) {
                    alert(crc3.getShaderInfoLog(webGLShader));
                    return null;
                }
                return webGLShader;
            }
            function detectAttributes(): { [name: string]: number } {
                let detectedAttributes: { [name: string]: number } = {};
                let attributeCount: number = crc3.getProgramParameter(shaderProgram, crc3.ACTIVE_ATTRIBUTES);
                for (let i: number = 0; i < attributeCount; i++) {
                    let attributeInfo: WebGLActiveInfo = GLUtil.assert<WebGLActiveInfo>(crc3.getActiveAttrib(shaderProgram, i));
                    if (!attributeInfo) {
                        break;
                    }
                    detectedAttributes[attributeInfo.name] = crc3.getAttribLocation(shaderProgram, attributeInfo.name);
                }
                return detectedAttributes;
            }
            function detectUniforms(): { [name: string]: WebGLUniformLocation } {
                let detectedUniforms: { [name: string]: WebGLUniformLocation } = {};
                let uniformCount: number = crc3.getProgramParameter(shaderProgram, crc3.ACTIVE_UNIFORMS);
                for (let i: number = 0; i < uniformCount; i++) {
                    let info: WebGLActiveInfo = GLUtil.assert<WebGLActiveInfo>(crc3.getActiveUniform(shaderProgram, i));
                    if (!info) {
                        break;
                    }
                    detectedUniforms[info.name] = GLUtil.assert<WebGLUniformLocation>(crc3.getUniformLocation(shaderProgram, info.name));
                }
                return detectedUniforms;
            }
        }

        private deleteProgram(_program: ShaderProgram): void {
            if (_program) {
                this.crc3.deleteProgram(_program.webGLProgram);
                delete _program.attributes;
                delete _program.uniforms;
            }

        }
        private createParameter(_material: Material): WebGLVertexArrayObject {
            return new WebGLVertexArrayObject();
        }

        private createBuffer(_mesh: Mesh): WebGLBuffer {
            let crc3: WebGL2RenderingContext = this.crc3;
            let bufferCreated: WebGLBuffer | null = crc3.createBuffer();
            if (bufferCreated === null)
                return null;
            let buffer: WebGLBuffer = bufferCreated;
            let vertexArrayObjectCreated: WebGLVertexArrayObject | null = crc3.createVertexArray();
            if (vertexArrayObjectCreated === null)
                return null;
            let vertexArrayObject: WebGLVertexArrayObject = vertexArrayObjectCreated;
            crc3.bindVertexArray(vertexArrayObject);
            crc3.bindBuffer(crc3.ARRAY_BUFFER, buffer);
            crc3.bufferData(crc3.ARRAY_BUFFER, _mesh.getVertices(), crc3.STATIC_DRAW);
            return buffer;
        }

        private deleteBuffer(_buffer: WebGLBuffer): void {
            if (_buffer)
                this.crc3.deleteBuffer(_buffer);
        }
    }
    */
}