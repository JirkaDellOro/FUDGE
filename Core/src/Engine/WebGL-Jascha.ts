/*/
namespace Fudge {

    interface ShaderProgram {
        program: WebGLProgram;
        attributes: { [name: string]: number };
        uniforms: { [name: string]: WebGLUniformLocation };
    }

    interface BufferInfo {
        buffer: WebGLBuffer;
        target: number;
    }

    export class WebGLJascha {
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

        private deleteProgram(_program: ShaderProgram): void {
            if (_program) {
                this.crc3.deleteProgram(_program.program);
                delete _program.attributes;
                delete _program.uniforms;
            }

        }

        private createBuffer(_mesh: Mesh): BufferInfo {
            let buffer: WebGLBuffer = GLUtil.assert<WebGLBuffer>(this.crc3.createBuffer());
            this.crc3.bindBuffer(this.crc3.ARRAY_BUFFER, buffer);
            this.crc3.bufferData(this.crc3.ARRAY_BUFFER, _mesh.getVertices(), this.crc3.STATIC_DRAW);
            let bufferInfo: BufferInfo = { buffer: buffer, target: this.crc3.ARRAY_BUFFER };
            return bufferInfo;
        }
        private deleteBuffer(_bufferInfo: BufferInfo): void {
            if (_bufferInfo) {
                this.crc3.bindBuffer(_bufferInfo.target, null);
                this.crc3.deleteBuffer(_bufferInfo);
            }
        }

        private createParameter(_material: Material): WebGLVertexArrayObject {
            // return new WebGLVertexArrayObject();
        //    let colorBuffer: WebGLBuffer = GLUtil.assert<WebGLBuffer>(gl2.createBuffer());
        //     gl2.bindBuffer(gl2.ARRAY_BUFFER, colorBuffer);

        //     _meshComponent.applyColor(_materialComponent);
        //     let colorPerPosition: number[] = [];
        //     for (let i: number = 0; i < this.vertexCount; i++) {
        //         colorPerPosition.push(_material.Color.x, _material.Color.y, _material.Color.z);
        //     }
        //     gl2.bufferData(gl2.ARRAY_BUFFER, new Uint8Array(colorPerPosition), gl2.STATIC_DRAW);

        //     let colorAttributeLocation: number = _materialComponent.Material.ColorAttributeLocation;
        //     gl2.enableVertexAttribArray(colorAttributeLocation);
        //     GLUtil.attributePointer(colorAttributeLocation, _materialComponent.Material.ColorBufferSpecification);
         

            this.positionAttributeLocation = GLUtil.assert<number>(this.shader.getAttributeLocation("a_position"));
            this.colorAttributeLocation = GLUtil.assert<number>(this.shader.getAttributeLocation("a_color"));
            this.matrixLocation = GLUtil.assert<WebGLUniformLocation>(this.shader.getUniformLocation("u_matrix"));

            this.colorBufferSpecification = {
                size: 3,
                dataType: gl2.UNSIGNED_BYTE,
                normalize: true,
                stride: 0,
                offset: 0
            };
            this.textureBufferSpecification = {
                size: 2,
                dataType: gl2.FLOAT,
                normalize: true,
                stride: 0,
                offset: 0
            };


            this.textureCoordinateAtributeLocation = GLUtil.assert<number>(this.shader.getAttributeLocation("a_textureCoordinate"));
        }

    }
}
/*/