//*/
namespace Fudge {

    export interface ShaderInfo {
        program: WebGLProgram;
        attributes: { [name: string]: number };
        uniforms: { [name: string]: WebGLUniformLocation };
    }

    export interface BufferInfo {
        buffer: WebGLBuffer;
        target: number;
    }

    export interface MaterialInfo {
        vao: WebGLVertexArrayObject;
        color: Vector3;
    }

    export class WebGLJascha {
        public static crc3: WebGL2RenderingContext;

        public static useProgram(_shaderInfo: ShaderInfo, _use: boolean): void {
            if (_use)
                WebGLJascha.crc3.useProgram(_shaderInfo.program);
            else {
                // WebGLJascha.crc3.bindVertexArray(_shaderInfo.   this.vertexArrayObjects[_node.name]);
                WebGLJascha.crc3.enableVertexAttribArray(_shaderInfo.attributes["a_position"]);
            }
        }
        public static useParameter(_materialInfo: MaterialInfo): void {
            WebGLJascha.crc3.bindVertexArray(_materialInfo.vao);
        }
        public static useBuffer(_bufferInfo: BufferInfo): void {
            WebGLJascha.crc3.bindBuffer(_bufferInfo.target, _bufferInfo.buffer);
        }

        public static createProgram(_shader: Shader): ShaderInfo {
            let crc3: WebGL2RenderingContext = WebGLJascha.crc3;
            let shaderProgram: WebGLProgram = crc3.createProgram();
            crc3.attachShader(shaderProgram, GLUtil.assert<WebGLShader>(compileShader(_shader.loadVertexShaderSource(), crc3.VERTEX_SHADER)));
            crc3.attachShader(shaderProgram, GLUtil.assert<WebGLShader>(compileShader(_shader.loadFragmentShaderSource(), crc3.FRAGMENT_SHADER)));
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

        public static deleteProgram(_program: ShaderInfo): void {
            if (_program) {
                WebGLJascha.crc3.deleteProgram(_program.program);
                delete _program.attributes;
                delete _program.uniforms;
            }

        }

        public static createBuffer(_mesh: Mesh): BufferInfo {
            let buffer: WebGLBuffer = GLUtil.assert<WebGLBuffer>(WebGLJascha.crc3.createBuffer());
            WebGLJascha.crc3.bindBuffer(WebGLJascha.crc3.ARRAY_BUFFER, buffer);
            WebGLJascha.crc3.bufferData(WebGLJascha.crc3.ARRAY_BUFFER, _mesh.getVertices(), WebGLJascha.crc3.STATIC_DRAW);
            let bufferInfo: BufferInfo = { buffer: buffer, target: WebGLJascha.crc3.ARRAY_BUFFER };
            return bufferInfo;
        }
        public static deleteBuffer(_bufferInfo: BufferInfo): void {
            if (_bufferInfo) {
                WebGLJascha.crc3.bindBuffer(_bufferInfo.target, null);
                WebGLJascha.crc3.deleteBuffer(_bufferInfo.buffer);
            }
        }

        public static deleteParameter(_materialInfo: MaterialInfo): void {
            if (_materialInfo) {
                //WebGLJascha.crc3.deleteVertexArray(_materialInfo);
            }
        }

        public static createParameter(_material: Material): MaterialInfo {
            let vao: WebGLVertexArrayObject = GLUtil.assert<WebGLVertexArrayObject>(gl2.createVertexArray());
            // let vertexArrayObjectCreated: WebGLVertexArrayObject | null = gl2.createVertexArray();
            // if (vertexArrayObjectCreated === null) return;
            // let vertexArrayObject: WebGLVertexArrayObject = vertexArrayObjectCreated;
            // this.vertexArrayObjects[_node.name] = vertexArrayObject;
            // bind attribute-array, subsequent calls will use it
            // gl2.bindVertexArray(vertexArrayObject);
            let materialInfo: MaterialInfo = {
                vao: vao,
                color: _material.Color
            };
            return materialInfo;

            // return WebGLJascha.crc3.createVertexArray();
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


            // this.positionAttributeLocation = GLUtil.assert<number>(this.shader.getAttributeLocation("a_position"));
            // this.colorAttributeLocation = GLUtil.assert<number>(this.shader.getAttributeLocation("a_color"));
            // this.matrixLocation = GLUtil.assert<WebGLUniformLocation>(this.shader.getUniformLocation("u_matrix"));

            // this.colorBufferSpecification = {
            //     size: 3,
            //     dataType: gl2.UNSIGNED_BYTE,
            //     normalize: true,
            //     stride: 0,
            //     offset: 0
            // };
            // this.textureBufferSpecification = {
            //     size: 2,
            //     dataType: gl2.FLOAT,
            //     normalize: true,
            //     stride: 0,
            //     offset: 0
            // };


            // this.textureCoordinateAtributeLocation = GLUtil.assert<number>(this.shader.getAttributeLocation("a_textureCoordinate"));
        }
    }
}
//*/