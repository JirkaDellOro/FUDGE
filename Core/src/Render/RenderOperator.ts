namespace Fudge {
    export interface BufferSpecification {
        size: number;   // The size of the datasample.
        dataType: number; // The datatype of the sample (e.g. gl.FLOAT, gl.BYTE, etc.)
        normalize: boolean; // Flag to normalize the data.
        stride: number; // Number of indices that will be skipped each iteration.
        offset: number; // Index of the element to begin with.
    }
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
        color: Color;
    }

    /**
     * Base class for RenderManager, handling the connection to the rendering system, in this case WebGL.
     * Methods and attributes of this class should not be called directly, only through [[RenderManager]]
     */
    export class RenderOperator {
        protected static crc3: WebGL2RenderingContext;
        private static rectViewport: Rectangle;

        /**
        * Checks the first parameter and throws an exception with the WebGL-errorcode if the value is null
        * @param _value // value to check against null
        * @param _message // optional, additional message for the exception
        */
        public static assert<T>(_value: T | null, _message: string = ""): T {
            if (_value === null)
                throw new Error(`Assertion failed. ${_message}, WebGL-Error: ${RenderOperator.crc3 ? RenderOperator.crc3.getError() : ""}`);
            return _value;
        }
        /**
         * Initializes offscreen-canvas, renderingcontext and hardware viewport.
         */
        public static initialize(): void {
            let contextAttributes: WebGLContextAttributes = { alpha: false, antialias: false };
            let canvas: HTMLCanvasElement = document.createElement("canvas");
            RenderOperator.crc3 = RenderOperator.assert<WebGL2RenderingContext>(
                canvas.getContext("webgl2", contextAttributes),
                "WebGL-context couldn't be created"
            );
            // Enable backface- and zBuffer-culling.
            RenderOperator.crc3.enable(RenderOperator.crc3.CULL_FACE);
            RenderOperator.crc3.enable(RenderOperator.crc3.DEPTH_TEST);
            RenderOperator.rectViewport = RenderOperator.getCanvasRect();
        }

        /**
         * Return a reference to the offscreen-canvas
         */
        public static getCanvas(): HTMLCanvasElement {
            return RenderOperator.crc3.canvas;
        }
        /**
         * Return a rectangle describing the size of the offscreen-canvas. x,y are 0 at all times.
         */
        public static getCanvasRect(): Rectangle {
            let canvas: HTMLCanvasElement = RenderOperator.crc3.canvas;
            return { x: 0, y: 0, width: canvas.width, height: canvas.height };
        }
        /**
         * Set the size of the offscreen-canvas.
         */
        public static setCanvasSize(_width: number, _height: number): void {
            RenderOperator.crc3.canvas.width = _width;
            RenderOperator.crc3.canvas.height = _height;
        }
        /**
         * Set the area on the offscreen-canvas to render the camera image to.
         * @param _rect
         */
        public static setViewportRectangle(_rect: Rectangle): void {
            Object.assign(RenderOperator.rectViewport, _rect);
            RenderOperator.crc3.viewport(_rect.x, _rect.y, _rect.width, _rect.height);
        }
        /**
         * Retrieve the area on the offscreen-canvas the camera image gets rendered to.
         */
        public static getViewportRectangle(): Rectangle {
            return RenderOperator.rectViewport;
        }

        /**
         * Draw a mesh buffer using the given infos and the complete projection matrix
         * @param shaderInfo 
         * @param bufferInfo 
         * @param materialInfo 
         * @param _projection 
         */
        protected static draw(shaderInfo: ShaderInfo, bufferInfo: BufferInfo, materialInfo: MaterialInfo, _projection: Matrix4x4): void {
            RenderOperator.useBuffer(bufferInfo);
            RenderOperator.useParameter(materialInfo);
            RenderOperator.useProgram(shaderInfo);
            RenderOperator.attributePointer(shaderInfo.attributes["a_position"], bufferInfo.specification);

            // Supply matrixdata to shader. 
            let matrixLocation: WebGLUniformLocation = shaderInfo.uniforms["u_matrix"];
            RenderOperator.crc3.uniformMatrix4fv(matrixLocation, false, _projection.data);

            // Supply color
            let colorUniformLocation: WebGLUniformLocation = shaderInfo.uniforms["u_color"];
            let c: Color = materialInfo.color;
            let color: Float32Array = new Float32Array([c.r, c.g, c.b, 1.0]);
            RenderOperator.crc3.uniform4fv(colorUniformLocation, color);

            // Draw call
            RenderOperator.crc3.drawArrays(RenderOperator.crc3.TRIANGLES, bufferInfo.specification.offset, bufferInfo.vertexCount);
        }

        // #region Shaderprogram 
        protected static createProgram(_shaderClass: typeof Shader): ShaderInfo {
            let crc3: WebGL2RenderingContext = RenderOperator.crc3;
            let shaderProgram: WebGLProgram = crc3.createProgram();
            crc3.attachShader(shaderProgram, RenderOperator.assert<WebGLShader>(compileShader(_shaderClass.getVertexShaderSource(), crc3.VERTEX_SHADER)));
            crc3.attachShader(shaderProgram, RenderOperator.assert<WebGLShader>(compileShader(_shaderClass.getFragmentShaderSource(), crc3.FRAGMENT_SHADER)));
            crc3.linkProgram(shaderProgram);
            let error: string = RenderOperator.assert<string>(crc3.getProgramInfoLog(shaderProgram));
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
                let error: string = RenderOperator.assert<string>(crc3.getShaderInfoLog(webGLShader));
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
                    let attributeInfo: WebGLActiveInfo = RenderOperator.assert<WebGLActiveInfo>(crc3.getActiveAttrib(shaderProgram, i));
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
                    let info: WebGLActiveInfo = RenderOperator.assert<WebGLActiveInfo>(crc3.getActiveUniform(shaderProgram, i));
                    if (!info) {
                        break;
                    }
                    detectedUniforms[info.name] = RenderOperator.assert<WebGLUniformLocation>(crc3.getUniformLocation(shaderProgram, info.name));
                }
                return detectedUniforms;
            }
        }
        protected static useProgram(_shaderInfo: ShaderInfo): void {
            RenderOperator.crc3.useProgram(_shaderInfo.program);
            RenderOperator.crc3.enableVertexAttribArray(_shaderInfo.attributes["a_position"]);
        }
        protected static deleteProgram(_program: ShaderInfo): void {
            if (_program) {
                RenderOperator.crc3.deleteProgram(_program.program);
                delete _program.attributes;
                delete _program.uniforms;
            }
        }
        // #endregion

        // #region Meshbuffer
        protected static createBuffer(_mesh: Mesh): BufferInfo {
            let buffer: WebGLBuffer = RenderOperator.assert<WebGLBuffer>(RenderOperator.crc3.createBuffer());
            RenderOperator.crc3.bindBuffer(RenderOperator.crc3.ARRAY_BUFFER, buffer);
            RenderOperator.crc3.bufferData(RenderOperator.crc3.ARRAY_BUFFER, _mesh.getVertices(), RenderOperator.crc3.STATIC_DRAW);
            let bufferInfo: BufferInfo = {
                buffer: buffer,
                target: RenderOperator.crc3.ARRAY_BUFFER,
                specification: _mesh.getBufferSpecification(),
                vertexCount: _mesh.getVertexCount()
            };
            return bufferInfo;
        }
        protected static useBuffer(_bufferInfo: BufferInfo): void {
            RenderOperator.crc3.bindBuffer(_bufferInfo.target, _bufferInfo.buffer);
        }
        protected static deleteBuffer(_bufferInfo: BufferInfo): void {
            if (_bufferInfo) {
                RenderOperator.crc3.bindBuffer(_bufferInfo.target, null);
                RenderOperator.crc3.deleteBuffer(_bufferInfo.buffer);
            }
        }
        // #endregion

        // #region MaterialParameters
        protected static createParameter(_material: Material): MaterialInfo {
            let vao: WebGLVertexArrayObject = RenderOperator.assert<WebGLVertexArrayObject>(RenderOperator.crc3.createVertexArray());
            let materialInfo: MaterialInfo = {
                vao: vao,
                // TODO: use mutator to create materialInfo or rethink materialInfo... below is a bad hack!
                color: <Color>(<CoatColored>_material.getCoat()).params.color
            };
            return materialInfo;
        }
        protected static useParameter(_materialInfo: MaterialInfo): void {
            RenderOperator.crc3.bindVertexArray(_materialInfo.vao);
        }
        protected static deleteParameter(_materialInfo: MaterialInfo): void {
            if (_materialInfo) {
                RenderOperator.crc3.bindVertexArray(null);
                RenderOperator.crc3.deleteVertexArray(_materialInfo.vao);
            }
        }
        // #endregion

        // #region Utilities
        /**
         * Wrapper function to utilize the bufferSpecification interface when passing data to the shader via a buffer.
         * @param _attributeLocation // The location of the attribute on the shader, to which they data will be passed.
         * @param _bufferSpecification // Interface passing datapullspecifications to the buffer.
         */
        private static attributePointer(_attributeLocation: number, _bufferSpecification: BufferSpecification): void {
            RenderOperator.crc3.vertexAttribPointer(_attributeLocation, _bufferSpecification.size, _bufferSpecification.dataType, _bufferSpecification.normalize, _bufferSpecification.stride, _bufferSpecification.offset);
        }


        /*/*
         * Wrapperclass that binds and initializes a texture.
         * @param _textureSource A string containing the path to the texture.
         */
        // public static createTexture(_textureSource: string): void {
        //     let texture: WebGLTexture = GLUtil.assert<WebGLTexture>(gl2.createTexture());
        //     gl2.bindTexture(gl2.TEXTURE_2D, texture);
        //     // Fill the texture with a 1x1 blue pixel.
        //     gl2.texImage2D(gl2.TEXTURE_2D, 0, gl2.RGBA, 1, 1, 0, gl2.RGBA, gl2.UNSIGNED_BYTE, new Uint8Array([170, 170, 255, 255]));
        //     // Asynchronously load an image
        //     let image: HTMLImageElement = new Image();
        //     image.crossOrigin = "anonymous";
        //     image.src = _textureSource;
        //     image.onload = function (): void {
        //         gl2.bindTexture(gl2.TEXTURE_2D, texture);
        //         gl2.texImage2D(gl2.TEXTURE_2D, 0, gl2.RGBA, gl2.RGBA, gl2.UNSIGNED_BYTE, image);
        //         gl2.generateMipmap(gl2.TEXTURE_2D);
        //     };
        // }

        // #endregion
    }
}