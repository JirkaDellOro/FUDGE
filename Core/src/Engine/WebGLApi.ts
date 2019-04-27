namespace Fudge {
    export interface ShaderInfo {
        program: WebGLProgram;
        attributes: { [name: string]: number };
        uniforms: { [name: string]: WebGLUniformLocation };
    }

    export interface BufferInfo {
        buffer: WebGLBuffer;
        target: number;
        specification: BufferSpecification;
        vertexCount: number;
    }

    export interface MaterialInfo {
        vao: WebGLVertexArrayObject;
        color: Vector3;
    }

    export class WebGLApi {
        public static crc3: WebGL2RenderingContext;

        /**
         * Draw a mesh buffer using the given infos and the complete projection matrix
         * @param shaderInfo 
         * @param bufferInfo 
         * @param materialInfo 
         * @param _projection 
         */
        protected static draw(shaderInfo: ShaderInfo, bufferInfo: BufferInfo, materialInfo: MaterialInfo, _projection: Matrix4x4): void {
            WebGLApi.useBuffer(bufferInfo);
            WebGLApi.useParameter(materialInfo);
            WebGLApi.useProgram(shaderInfo);
            GLUtil.attributePointer(shaderInfo.attributes["a_position"], bufferInfo.specification);

            let matrixLocation: WebGLUniformLocation = shaderInfo.uniforms["u_matrix"];
            // Supply matrixdata to shader. 
            WebGLApi.crc3.uniformMatrix4fv(matrixLocation, false, _projection.data);
            // Draw call
            // Supply color
            let colorUniformLocation: WebGLUniformLocation = shaderInfo.uniforms["u_color"];
            let vec: Vector3 = materialInfo.color;
            let color: Float32Array = new Float32Array([vec.x, vec.y, vec.z, 1.0]);
            WebGLApi.crc3.uniform4fv(colorUniformLocation, color);

            // Draw call
            WebGLApi.crc3.drawArrays(WebGLApi.crc3.TRIANGLES, bufferInfo.specification.offset, bufferInfo.vertexCount);
        }

        // #region Shaderprogram 
        protected static createProgram(_shaderClass: typeof Shader): ShaderInfo {
            let crc3: WebGL2RenderingContext = WebGLApi.crc3;
            let shaderProgram: WebGLProgram = crc3.createProgram();
            crc3.attachShader(shaderProgram, GLUtil.assert<WebGLShader>(compileShader(_shaderClass.loadVertexShaderSource(), crc3.VERTEX_SHADER)));
            crc3.attachShader(shaderProgram, GLUtil.assert<WebGLShader>(compileShader(_shaderClass.loadFragmentShaderSource(), crc3.FRAGMENT_SHADER)));
            crc3.linkProgram(shaderProgram);
            let error: string = GLUtil.assert<string>(crc3.getProgramInfoLog(shaderProgram));
            if (error !== "") {
                throw new Error("Error linking Shader: " + error);
            }
            let program: ShaderInfo = {
                program: shaderProgram,
                attributes: detectAttributes(),
                uniforms: detectUniforms()
            };
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
        protected static useProgram(_shaderInfo: ShaderInfo): void {
            WebGLApi.crc3.useProgram(_shaderInfo.program);
            WebGLApi.crc3.enableVertexAttribArray(_shaderInfo.attributes["a_position"]);
        }
        protected static deleteProgram(_program: ShaderInfo): void {
            if (_program) {
                WebGLApi.crc3.deleteProgram(_program.program);
                delete _program.attributes;
                delete _program.uniforms;
            }
        }
        // #endregion

        // #region Meshbuffer
        protected static createBuffer(_mesh: Mesh): BufferInfo {
            let buffer: WebGLBuffer = GLUtil.assert<WebGLBuffer>(WebGLApi.crc3.createBuffer());
            WebGLApi.crc3.bindBuffer(WebGLApi.crc3.ARRAY_BUFFER, buffer);
            WebGLApi.crc3.bufferData(WebGLApi.crc3.ARRAY_BUFFER, _mesh.getVertices(), WebGLApi.crc3.STATIC_DRAW);
            let bufferInfo: BufferInfo = {
                buffer: buffer,
                target: WebGLApi.crc3.ARRAY_BUFFER,
                specification: _mesh.getBufferSpecification(),
                vertexCount: _mesh.getVertexCount()
            };
            return bufferInfo;
        }
        protected static useBuffer(_bufferInfo: BufferInfo): void {
            WebGLApi.crc3.bindBuffer(_bufferInfo.target, _bufferInfo.buffer);
        }
        protected static deleteBuffer(_bufferInfo: BufferInfo): void {
            if (_bufferInfo) {
                WebGLApi.crc3.bindBuffer(_bufferInfo.target, null);
                WebGLApi.crc3.deleteBuffer(_bufferInfo.buffer);
            }
        }
        // #endregion

        // #region MaterialParameters
        protected static createParameter(_material: Material): MaterialInfo {
            let vao: WebGLVertexArrayObject = GLUtil.assert<WebGLVertexArrayObject>(gl2.createVertexArray());
            let materialInfo: MaterialInfo = {
                vao: vao,
                color: _material.Color
            };
            return materialInfo;
        }
        protected static useParameter(_materialInfo: MaterialInfo): void {
            WebGLApi.crc3.bindVertexArray(_materialInfo.vao);
        }
        protected static deleteParameter(_materialInfo: MaterialInfo): void {
            if (_materialInfo) {
                WebGLApi.crc3.bindVertexArray(null);
                WebGLApi.crc3.deleteVertexArray(_materialInfo.vao);
            }
        }
        // #endregion
    }
}