namespace FudgeCore {
    export interface BufferSpecification {
        size: number;   // The size of the datasample.
        dataType: number; // The datatype of the sample (e.g. gl.FLOAT, gl.BYTE, etc.)
        normalize: boolean; // Flag to normalize the data.
        stride: number; // Number of indices that will be skipped each iteration.
        offset: number; // Index of the element to begin with.
    }
    export interface RenderShader {
        // TODO: examine, if this should be injected in shader class via RenderInjector, as done with Coat
        program: WebGLProgram;
        attributes: { [name: string]: number };
        uniforms: { [name: string]: WebGLUniformLocation };
    }

    export interface RenderBuffers {
        // TODO: examine, if this should be injected in mesh class via RenderInjector, as done with Coat
        vertices: WebGLBuffer;
        indices: WebGLBuffer;
        nIndices: number;
        textureUVs: WebGLBuffer;
        normalsFace: WebGLBuffer;
    }

    export interface RenderCoat {
        //TODO: examine, if it makes sense to store a vao for each Coat, even though e.g. color won't be stored anyway...
        //vao: WebGLVertexArrayObject;
        coat: Coat;
    }

    export interface RenderLights {
        [type: string]: Float32Array;
    }

    /**
     * Base class for RenderManager, handling the connection to the rendering system, in this case WebGL.
     * Methods and attributes of this class should not be called directly, only through [[RenderManager]]
     */
    export abstract class RenderOperator {
        protected static crc3: WebGL2RenderingContext;
        private static rectViewport: Rectangle;
        private static renderShaderRayCast: RenderShader;

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
            RenderOperator.crc3.enable(WebGL2RenderingContext.CULL_FACE);
            RenderOperator.crc3.enable(WebGL2RenderingContext.DEPTH_TEST);
            // RenderOperator.crc3.pixelStorei(WebGL2RenderingContext.UNPACK_FLIP_Y_WEBGL, true);
            RenderOperator.rectViewport = RenderOperator.getCanvasRect();

            RenderOperator.renderShaderRayCast = RenderOperator.createProgram(ShaderRayCast);
        }

        /**
         * Return a reference to the offscreen-canvas
         */
        public static getCanvas(): HTMLCanvasElement {
            return <HTMLCanvasElement>RenderOperator.crc3.canvas; // TODO: enable OffscreenCanvas
        }
        /**
         * Return a reference to the rendering context
         */
        public static getRenderingContext(): WebGL2RenderingContext {
            return RenderOperator.crc3;
        }
        /**
         * Return a rectangle describing the size of the offscreen-canvas. x,y are 0 at all times.
         */
        public static getCanvasRect(): Rectangle {
            let canvas: HTMLCanvasElement = <HTMLCanvasElement>RenderOperator.crc3.canvas;
            return Rectangle.get(0, 0, canvas.width, canvas.height);
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
         * Convert light data to flat arrays
         */
        protected static createRenderLights(_lights: MapLightTypeToLightList): RenderLights {
            let renderLights: RenderLights = {};
            for (let entry of _lights) {
                switch (entry[0]) {
                    case LightAmbient.name:
                        let ambient: number[] = [];
                        for (let light of entry[1]) {
                            let c: Color = light.getLight().color;
                            ambient.push(c.r, c.g, c.b, c.a);
                        }
                        renderLights["u_ambient"] = new Float32Array(ambient);
                        break;
                    case LightDirectional.name:
                        let directional: number[] = [];
                        for (let light of entry[1]) {
                            let c: Color = light.getLight().color;
                            let d: Vector3 = (<LightDirectional>light.getLight()).direction;
                            directional.push(c.r, c.g, c.b, c.a, d.x, d.y, d.z);
                        }
                        renderLights["u_directional"] = new Float32Array(directional);
                        break;
                    default:
                        Debug.warn("Shaderstructure undefined for", entry[0]);
                }
            }
            return renderLights;
        }

        /**
         * Set light data in shaders
         */
        protected static setLightsInShader(_renderShader: RenderShader, _lights: MapLightTypeToLightList): void {
            RenderOperator.useProgram(_renderShader);
            let uni: { [name: string]: WebGLUniformLocation } = _renderShader.uniforms;

            let ambient: WebGLUniformLocation = uni["u_ambient.color"];
            if (ambient) {
                let cmpLights: ComponentLight[] = _lights.get("LightAmbient");
                if (cmpLights) {
                    // TODO: add up ambient lights to a single color
                    // let result: Color = new Color(0, 0, 0, 1);
                    for (let cmpLight of cmpLights)
                        // for now, only the last is relevant
                        RenderOperator.crc3.uniform4fv(ambient, cmpLight.getLight().color.getArray());
                }
            }

            let nDirectional: WebGLUniformLocation = uni["u_nLightsDirectional"];
            if (nDirectional) {
                let cmpLights: ComponentLight[] = _lights.get("LightDirectional");
                if (cmpLights) {
                    let n: number = cmpLights.length;
                    RenderOperator.crc3.uniform1ui(nDirectional, n);
                    for (let i: number = 0; i < n; i++) {
                        let light: LightDirectional = <LightDirectional>cmpLights[i].getLight();
                        RenderOperator.crc3.uniform4fv(uni[`u_directional[${i}].color`], light.color.getArray());
                        let direction: Vector3 = light.direction.copy;
                        direction.transform(cmpLights[i].getContainer().mtxWorld);
                        RenderOperator.crc3.uniform3fv(uni[`u_directional[${i}].direction`], direction.get());
                    }
                }
            }
            // debugger;
        }

        /**
         * Draw a mesh buffer using the given infos and the complete projection matrix
         * @param _renderShader 
         * @param _renderBuffers 
         * @param _renderCoat 
         * @param _world 
         * @param _projection 
         */
        protected static draw(_renderShader: RenderShader, _renderBuffers: RenderBuffers, _renderCoat: RenderCoat, _world: Matrix4x4, _projection: Matrix4x4): void {
            RenderOperator.useProgram(_renderShader);
            // RenderOperator.useBuffers(_renderBuffers);
            // RenderOperator.useParameter(_renderCoat);

            RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, _renderBuffers.vertices);
            RenderOperator.crc3.enableVertexAttribArray(_renderShader.attributes["a_position"]);
            RenderOperator.setAttributeStructure(_renderShader.attributes["a_position"], Mesh.getBufferSpecification());

            RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, _renderBuffers.indices);

            if (_renderShader.attributes["a_textureUVs"]) {
                RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, _renderBuffers.textureUVs);
                RenderOperator.crc3.enableVertexAttribArray(_renderShader.attributes["a_textureUVs"]); // enable the buffer
                RenderOperator.crc3.vertexAttribPointer(_renderShader.attributes["a_textureUVs"], 2, WebGL2RenderingContext.FLOAT, false, 0, 0);
            }
            // Supply matrixdata to shader. 
            let uProjection: WebGLUniformLocation = _renderShader.uniforms["u_projection"];
            RenderOperator.crc3.uniformMatrix4fv(uProjection, false, _projection.get());

            if (_renderShader.uniforms["u_world"]) {
                let uWorld: WebGLUniformLocation = _renderShader.uniforms["u_world"];
                RenderOperator.crc3.uniformMatrix4fv(uWorld, false, _world.get());

                RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, _renderBuffers.normalsFace);
                RenderOperator.crc3.enableVertexAttribArray(_renderShader.attributes["a_normal"]);
                RenderOperator.setAttributeStructure(_renderShader.attributes["a_normal"], Mesh.getBufferSpecification());
            }
            // TODO: this is all that's left of coat handling in RenderOperator, due to injection. So extra reference from node to coat is unnecessary
            _renderCoat.coat.useRenderData(_renderShader);

            // Draw call
            // RenderOperator.crc3.drawElements(WebGL2RenderingContext.TRIANGLES, Mesh.getBufferSpecification().offset, _renderBuffers.nIndices);
            RenderOperator.crc3.drawElements(WebGL2RenderingContext.TRIANGLES, _renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0);
        }

        /**
         * Draw a buffer with a special shader that uses an id instead of a color
         * @param _renderShader
         * @param _renderBuffers 
         * @param _world 
         * @param _projection 
         */
        protected static drawForRayCast(_id: number, _renderBuffers: RenderBuffers, _world: Matrix4x4, _projection: Matrix4x4): void {
            let renderShader: RenderShader = RenderOperator.renderShaderRayCast; 
            RenderOperator.useProgram(renderShader);

            RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, _renderBuffers.vertices);
            RenderOperator.crc3.enableVertexAttribArray(renderShader.attributes["a_position"]);
            RenderOperator.setAttributeStructure(renderShader.attributes["a_position"], Mesh.getBufferSpecification());

            RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, _renderBuffers.indices);

            // Supply matrixdata to shader. 
            let uProjection: WebGLUniformLocation = renderShader.uniforms["u_projection"];
            RenderOperator.crc3.uniformMatrix4fv(uProjection, false, _projection.get());

            if (renderShader.uniforms["u_world"]) {
                let uWorld: WebGLUniformLocation = renderShader.uniforms["u_world"];
                RenderOperator.crc3.uniformMatrix4fv(uWorld, false, _world.get());
            }

            let idUniformLocation: WebGLUniformLocation = renderShader.uniforms["u_id"];
            RenderOperator.getRenderingContext().uniform1i(idUniformLocation, _id);

            RenderOperator.crc3.drawElements(WebGL2RenderingContext.TRIANGLES, _renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0);
        }

        // #region Shaderprogram 
        protected static createProgram(_shaderClass: typeof Shader): RenderShader {
            let crc3: WebGL2RenderingContext = RenderOperator.crc3;
            let program: WebGLProgram = crc3.createProgram();
            let renderShader: RenderShader;
            try {
                crc3.attachShader(program, RenderOperator.assert<WebGLShader>(compileShader(_shaderClass.getVertexShaderSource(), WebGL2RenderingContext.VERTEX_SHADER)));
                crc3.attachShader(program, RenderOperator.assert<WebGLShader>(compileShader(_shaderClass.getFragmentShaderSource(), WebGL2RenderingContext.FRAGMENT_SHADER)));
                crc3.linkProgram(program);
                let error: string = RenderOperator.assert<string>(crc3.getProgramInfoLog(program));
                if (error !== "") {
                    throw new Error("Error linking Shader: " + error);
                }
                renderShader = {
                    program: program,
                    attributes: detectAttributes(),
                    uniforms: detectUniforms()
                };
            } catch (_error) {
                Debug.error(_error);
                debugger;
            }
            return renderShader;


            function compileShader(_shaderCode: string, _shaderType: GLenum): WebGLShader | null {
                let webGLShader: WebGLShader = crc3.createShader(_shaderType);
                crc3.shaderSource(webGLShader, _shaderCode);
                crc3.compileShader(webGLShader);
                let error: string = RenderOperator.assert<string>(crc3.getShaderInfoLog(webGLShader));
                if (error !== "") {
                    throw new Error("Error compiling shader: " + error);
                }
                // Check for any compilation errors.
                if (!crc3.getShaderParameter(webGLShader, WebGL2RenderingContext.COMPILE_STATUS)) {
                    alert(crc3.getShaderInfoLog(webGLShader));
                    return null;
                }
                return webGLShader;
            }
            function detectAttributes(): { [name: string]: number } {
                let detectedAttributes: { [name: string]: number } = {};
                let attributeCount: number = crc3.getProgramParameter(program, WebGL2RenderingContext.ACTIVE_ATTRIBUTES);
                for (let i: number = 0; i < attributeCount; i++) {
                    let attributeInfo: WebGLActiveInfo = RenderOperator.assert<WebGLActiveInfo>(crc3.getActiveAttrib(program, i));
                    if (!attributeInfo) {
                        break;
                    }
                    detectedAttributes[attributeInfo.name] = crc3.getAttribLocation(program, attributeInfo.name);
                }
                return detectedAttributes;
            }
            function detectUniforms(): { [name: string]: WebGLUniformLocation } {
                let detectedUniforms: { [name: string]: WebGLUniformLocation } = {};
                let uniformCount: number = crc3.getProgramParameter(program, WebGL2RenderingContext.ACTIVE_UNIFORMS);
                for (let i: number = 0; i < uniformCount; i++) {
                    let info: WebGLActiveInfo = RenderOperator.assert<WebGLActiveInfo>(crc3.getActiveUniform(program, i));
                    if (!info) {
                        break;
                    }
                    detectedUniforms[info.name] = RenderOperator.assert<WebGLUniformLocation>(crc3.getUniformLocation(program, info.name));
                }
                return detectedUniforms;
            }
        }
        protected static useProgram(_shaderInfo: RenderShader): void {
            RenderOperator.crc3.useProgram(_shaderInfo.program);
            RenderOperator.crc3.enableVertexAttribArray(_shaderInfo.attributes["a_position"]);
        }
        protected static deleteProgram(_program: RenderShader): void {
            if (_program) {
                RenderOperator.crc3.deleteProgram(_program.program);
                delete _program.attributes;
                delete _program.uniforms;
            }
        }
        // #endregion

        // #region Meshbuffer
        protected static createBuffers(_mesh: Mesh): RenderBuffers {
            let vertices: WebGLBuffer = RenderOperator.assert<WebGLBuffer>(RenderOperator.crc3.createBuffer());
            RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, vertices);
            RenderOperator.crc3.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, _mesh.vertices, WebGL2RenderingContext.STATIC_DRAW);

            let indices: WebGLBuffer = RenderOperator.assert<WebGLBuffer>(RenderOperator.crc3.createBuffer());
            RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, indices);
            RenderOperator.crc3.bufferData(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, _mesh.indices, WebGL2RenderingContext.STATIC_DRAW);

            let textureUVs: WebGLBuffer = RenderOperator.crc3.createBuffer();
            RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, textureUVs);
            RenderOperator.crc3.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, _mesh.textureUVs, WebGL2RenderingContext.STATIC_DRAW);

            let normalsFace: WebGLBuffer = RenderOperator.assert<WebGLBuffer>(RenderOperator.crc3.createBuffer());
            RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, normalsFace);
            RenderOperator.crc3.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, _mesh.normalsFace, WebGL2RenderingContext.STATIC_DRAW);

            let bufferInfo: RenderBuffers = {
                vertices: vertices,
                indices: indices,
                nIndices: _mesh.getIndexCount(),
                textureUVs: textureUVs,
                normalsFace: normalsFace
            };
            return bufferInfo;
        }
        protected static useBuffers(_renderBuffers: RenderBuffers): void {
            // TODO: currently unused, done specifically in draw. Could be saved in VAO within RenderBuffers
            // RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, _renderBuffers.vertices);
            // RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, _renderBuffers.indices);
            // RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, _renderBuffers.textureUVs);

        }
        protected static deleteBuffers(_renderBuffers: RenderBuffers): void {
            if (_renderBuffers) {
                RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, null);
                RenderOperator.crc3.deleteBuffer(_renderBuffers.vertices);
                RenderOperator.crc3.deleteBuffer(_renderBuffers.textureUVs);
                RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, null);
                RenderOperator.crc3.deleteBuffer(_renderBuffers.indices);
            }
        }
        // #endregion

        // #region MaterialParameters
        protected static createParameter(_coat: Coat): RenderCoat {
            // let vao: WebGLVertexArrayObject = RenderOperator.assert<WebGLVertexArrayObject>(RenderOperator.crc3.createVertexArray());
            let coatInfo: RenderCoat = {
                //vao: null,
                coat: _coat
            };
            return coatInfo;
        }
        protected static useParameter(_coatInfo: RenderCoat): void {
            // RenderOperator.crc3.bindVertexArray(_coatInfo.vao);
        }
        protected static deleteParameter(_coatInfo: RenderCoat): void {
            if (_coatInfo) {
                RenderOperator.crc3.bindVertexArray(null);
                // RenderOperator.crc3.deleteVertexArray(_coatInfo.vao);
            }
        }
        // #endregion

        /** 
         * Wrapper function to utilize the bufferSpecification interface when passing data to the shader via a buffer.
         * @param _attributeLocation // The location of the attribute on the shader, to which they data will be passed.
         * @param _bufferSpecification // Interface passing datapullspecifications to the buffer.
         */
        private static setAttributeStructure(_attributeLocation: number, _bufferSpecification: BufferSpecification): void {
            RenderOperator.crc3.vertexAttribPointer(_attributeLocation, _bufferSpecification.size, _bufferSpecification.dataType, _bufferSpecification.normalize, _bufferSpecification.stride, _bufferSpecification.offset);
        }
    }
}