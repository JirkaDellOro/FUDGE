"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Fudge;
(function (Fudge) {
    /**
     * Base class implementing mutability of instances of subclasses using [[Mutator]]-objects
     * thus providing and using interfaces created at runtime
     */
    class Mutable extends EventTarget {
        /**
         * Retrieves the type of this mutable subclass as the name of the runtime class
         * @returns The type of the mutable
         */
        get type() {
            return this.constructor.name;
        }
        /**
         * Collect applicable attributes of the instance and copies of their values in a Mutator-object
         */
        getMutator() {
            let mutator = {};
            // collect primitive and mutable attributes
            for (let attribute in this) {
                let value = this[attribute];
                if (value instanceof Function)
                    continue;
                if (value instanceof Object && !(value instanceof Mutable))
                    continue;
                mutator[attribute] = this[attribute];
            }
            // mutator can be reduced but not extended!
            Object.preventExtensions(mutator);
            // delete unwanted attributes
            this.reduceMutator(mutator);
            // replace references to mutable objects with references to copies
            for (let attribute in mutator) {
                let value = mutator[attribute];
                if (value instanceof Mutable)
                    mutator[attribute] = value.getMutator();
            }
            return mutator;
        }
        /**
         * Collect the attributes of the instance and their values applicable for animation.
         * Basic functionality is identical to [[getMutator]], returned mutator should then be reduced by the subclassed instance
         */
        getMutatorForAnimation() {
            return this.getMutator();
        }
        /**
         * Collect the attributes of the instance and their values applicable for the user interface.
         * Basic functionality is identical to [[getMutator]], returned mutator should then be reduced by the subclassed instance
         */
        getMutatorForUserInterface() {
            return this.getMutator();
        }
        /**
         * Returns an associative array with the same attributes as the given mutator, but with the corresponding types as string-values
         * @param _mutator
         */
        getMutatorAttributeTypes(_mutator) {
            let types = {};
            for (let attribute in _mutator) {
                types[attribute] = _mutator[attribute].constructor.name;
            }
            return types;
        }
        /**
         * Updates the values of the given mutator according to the current state of the instance
         * @param _mutator
         */
        updateMutator(_mutator) {
            for (let attribute in _mutator) {
                let value = _mutator[attribute];
                if (value instanceof Mutable)
                    value = value.getMutator();
                else
                    _mutator[attribute] = this[attribute];
            }
        }
        /**
         * Updates the attribute values of the instance according to the state of the mutator. Must be protected...!
         * @param _mutator
         */
        mutate(_mutator) {
            // for (let attribute in _mutator)
            //     (<General>this)[attribute] = _mutator[attribute];
            // TODO: don't assign unknown properties
            Object.assign(this, _mutator);
            this.dispatchEvent(new Event("mutate" /* MUTATE */));
        }
    }
    Fudge.Mutable = Mutable;
})(Fudge || (Fudge = {}));
//<reference path="../Coats/Coat.ts"/>
var Fudge;
//<reference path="../Coats/Coat.ts"/>
(function (Fudge) {
    class RenderInjector {
        static decorateCoat(_constructor) {
            let coatInjection = RenderInjector.coatInjections[_constructor.name];
            if (!coatInjection) {
                Fudge.Debug.error("No injection decorator defined for " + _constructor.name);
            }
            Object.defineProperty(_constructor.prototype, "useRenderData", {
                value: coatInjection
            });
        }
        static injectRenderDataForCoatColored(_renderShader) {
            let colorUniformLocation = _renderShader.uniforms["u_color"];
            let { r, g, b, a } = this.color;
            let color = new Float32Array([r, g, b, a]);
            Fudge.RenderOperator.getRenderingContext().uniform4fv(colorUniformLocation, color);
        }
        static injectRenderDataForCoatTextured(_renderShader) {
            let crc3 = Fudge.RenderOperator.getRenderingContext();
            if (this.renderData) {
                // buffers exist
                crc3.activeTexture(WebGL2RenderingContext.TEXTURE0);
                crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, this.renderData["texture0"]);
                crc3.uniform1i(_renderShader.uniforms["u_texture"], 0);
            }
            else {
                this.renderData = {};
                // TODO: check if all WebGL-Creations are asserted
                const texture = Fudge.RenderManager.assert(crc3.createTexture());
                crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, texture);
                try {
                    crc3.texImage2D(crc3.TEXTURE_2D, 0, crc3.RGBA, crc3.RGBA, crc3.UNSIGNED_BYTE, this.texture.image);
                    crc3.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, this.texture.image);
                }
                catch (_e) {
                    Fudge.Debug.error(_e);
                }
                crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MAG_FILTER, WebGL2RenderingContext.NEAREST);
                crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.NEAREST);
                crc3.generateMipmap(crc3.TEXTURE_2D);
                this.renderData["texture0"] = texture;
                crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, null);
                this.useRenderData(_renderShader);
            }
        }
    }
    RenderInjector.coatInjections = {
        "CoatColored": RenderInjector.injectRenderDataForCoatColored,
        "CoatTextured": RenderInjector.injectRenderDataForCoatTextured
    };
    Fudge.RenderInjector = RenderInjector;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Base class for RenderManager, handling the connection to the rendering system, in this case WebGL.
     * Methods and attributes of this class should not be called directly, only through [[RenderManager]]
     */
    class RenderOperator {
        /**
        * Checks the first parameter and throws an exception with the WebGL-errorcode if the value is null
        * @param _value // value to check against null
        * @param _message // optional, additional message for the exception
        */
        static assert(_value, _message = "") {
            if (_value === null)
                throw new Error(`Assertion failed. ${_message}, WebGL-Error: ${RenderOperator.crc3 ? RenderOperator.crc3.getError() : ""}`);
            return _value;
        }
        /**
         * Initializes offscreen-canvas, renderingcontext and hardware viewport.
         */
        static initialize() {
            let contextAttributes = { alpha: false, antialias: false };
            let canvas = document.createElement("canvas");
            RenderOperator.crc3 = RenderOperator.assert(canvas.getContext("webgl2", contextAttributes), "WebGL-context couldn't be created");
            // Enable backface- and zBuffer-culling.
            RenderOperator.crc3.enable(WebGL2RenderingContext.CULL_FACE);
            RenderOperator.crc3.enable(WebGL2RenderingContext.DEPTH_TEST);
            // RenderOperator.crc3.pixelStorei(WebGL2RenderingContext.UNPACK_FLIP_Y_WEBGL, true);
            RenderOperator.rectViewport = RenderOperator.getCanvasRect();
        }
        /**
         * Return a reference to the offscreen-canvas
         */
        static getCanvas() {
            return RenderOperator.crc3.canvas;
        }
        /**
         * Return a reference to the rendering context
         */
        static getRenderingContext() {
            return RenderOperator.crc3;
        }
        /**
         * Return a rectangle describing the size of the offscreen-canvas. x,y are 0 at all times.
         */
        static getCanvasRect() {
            let canvas = RenderOperator.crc3.canvas;
            return { x: 0, y: 0, width: canvas.width, height: canvas.height };
        }
        /**
         * Set the size of the offscreen-canvas.
         */
        static setCanvasSize(_width, _height) {
            RenderOperator.crc3.canvas.width = _width;
            RenderOperator.crc3.canvas.height = _height;
        }
        /**
         * Set the area on the offscreen-canvas to render the camera image to.
         * @param _rect
         */
        static setViewportRectangle(_rect) {
            Object.assign(RenderOperator.rectViewport, _rect);
            RenderOperator.crc3.viewport(_rect.x, _rect.y, _rect.width, _rect.height);
        }
        /**
         * Retrieve the area on the offscreen-canvas the camera image gets rendered to.
         */
        static getViewportRectangle() {
            return RenderOperator.rectViewport;
        }
        /**
         * Convert light data to flat arrays
         */
        static createRenderLights(_lights) {
            let renderLights = {};
            for (let entry of _lights) {
                switch (entry[0]) {
                    case Fudge.LightAmbient.name:
                        let ambient = [];
                        for (let light of entry[1]) {
                            let c = light.getLight().color;
                            ambient.push(c.r, c.g, c.b, c.a);
                        }
                        renderLights["u_ambient"] = new Float32Array(ambient);
                        break;
                    case Fudge.LightDirectional.name:
                        let directional = [];
                        for (let light of entry[1]) {
                            let c = light.getLight().color;
                            let d = light.getLight().direction;
                            directional.push(c.r, c.g, c.b, c.a, d.x, d.y, d.z);
                        }
                        renderLights["u_directional"] = new Float32Array(directional);
                        break;
                    default:
                        Fudge.Debug.warn("Shaderstructure undefined for", entry[0]);
                }
            }
            return renderLights;
        }
        /**
         * Set light data in shaders
         */
        static setLightsInShader(_renderShader, _lights) {
            RenderOperator.useProgram(_renderShader);
            let uni = _renderShader.uniforms;
            let ambient = uni["u_ambient.color"];
            if (ambient) {
                let cmpLights = _lights.get("LightAmbient");
                if (cmpLights) {
                    // TODO: add up ambient lights to a single color
                    // let result: Color = new Color(0, 0, 0, 1);
                    for (let cmpLight of cmpLights)
                        // for now, only the last is relevant
                        RenderOperator.crc3.uniform4fv(ambient, cmpLight.getLight().color.getArray());
                }
            }
            let nDirectional = uni["u_nLightsDirectional"];
            if (nDirectional) {
                let cmpLights = _lights.get("LightDirectional");
                if (cmpLights) {
                    let n = cmpLights.length;
                    RenderOperator.crc3.uniform1ui(nDirectional, n);
                    for (let i = 0; i < n; i++) {
                        let light = cmpLights[i].getLight();
                        RenderOperator.crc3.uniform4fv(uni[`u_directional[${i}].color`], light.color.getArray());
                        RenderOperator.crc3.uniform3fv(uni[`u_directional[${i}].direction`], light.direction.getArray());
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
         * @param _projection
         */
        static draw(_renderShader, _renderBuffers, _renderCoat, _world, _projection) {
            RenderOperator.useProgram(_renderShader);
            // RenderOperator.useBuffers(_renderBuffers);
            // RenderOperator.useParameter(_renderCoat);
            RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, _renderBuffers.vertices);
            RenderOperator.crc3.enableVertexAttribArray(_renderShader.attributes["a_position"]);
            RenderOperator.setAttributeStructure(_renderShader.attributes["a_position"], Fudge.Mesh.getBufferSpecification());
            RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, _renderBuffers.indices);
            if (_renderShader.attributes["a_textureUVs"]) {
                RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, _renderBuffers.textureUVs);
                RenderOperator.crc3.enableVertexAttribArray(_renderShader.attributes["a_textureUVs"]); // enable the buffer
                RenderOperator.crc3.vertexAttribPointer(_renderShader.attributes["a_textureUVs"], 2, WebGL2RenderingContext.FLOAT, false, 0, 0);
            }
            // Supply matrixdata to shader. 
            let uProjection = _renderShader.uniforms["u_projection"];
            RenderOperator.crc3.uniformMatrix4fv(uProjection, false, _projection.data);
            if (_renderShader.uniforms["u_world"]) {
                let uWorld = _renderShader.uniforms["u_world"];
                RenderOperator.crc3.uniformMatrix4fv(uWorld, false, _world.data);
                RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, _renderBuffers.normalsFace);
                RenderOperator.crc3.enableVertexAttribArray(_renderShader.attributes["a_normal"]);
                RenderOperator.setAttributeStructure(_renderShader.attributes["a_normal"], Fudge.Mesh.getBufferSpecification());
            }
            // TODO: this is all that's left of coat handling in RenderOperator, due to injection. So extra reference from node to coat is unnecessary
            _renderCoat.coat.useRenderData(_renderShader);
            // Draw call
            // RenderOperator.crc3.drawElements(WebGL2RenderingContext.TRIANGLES, Mesh.getBufferSpecification().offset, _renderBuffers.nIndices);
            RenderOperator.crc3.drawElements(WebGL2RenderingContext.TRIANGLES, _renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0);
        }
        // #region Shaderprogram 
        static createProgram(_shaderClass) {
            let crc3 = RenderOperator.crc3;
            let program = crc3.createProgram();
            let renderShader;
            try {
                crc3.attachShader(program, RenderOperator.assert(compileShader(_shaderClass.getVertexShaderSource(), WebGL2RenderingContext.VERTEX_SHADER)));
                crc3.attachShader(program, RenderOperator.assert(compileShader(_shaderClass.getFragmentShaderSource(), WebGL2RenderingContext.FRAGMENT_SHADER)));
                crc3.linkProgram(program);
                let error = RenderOperator.assert(crc3.getProgramInfoLog(program));
                if (error !== "") {
                    throw new Error("Error linking Shader: " + error);
                }
                renderShader = {
                    program: program,
                    attributes: detectAttributes(),
                    uniforms: detectUniforms()
                };
            }
            catch (_error) {
                Fudge.Debug.error(_error);
                debugger;
            }
            return renderShader;
            function compileShader(_shaderCode, _shaderType) {
                let webGLShader = crc3.createShader(_shaderType);
                crc3.shaderSource(webGLShader, _shaderCode);
                crc3.compileShader(webGLShader);
                let error = RenderOperator.assert(crc3.getShaderInfoLog(webGLShader));
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
            function detectAttributes() {
                let detectedAttributes = {};
                let attributeCount = crc3.getProgramParameter(program, WebGL2RenderingContext.ACTIVE_ATTRIBUTES);
                for (let i = 0; i < attributeCount; i++) {
                    let attributeInfo = RenderOperator.assert(crc3.getActiveAttrib(program, i));
                    if (!attributeInfo) {
                        break;
                    }
                    detectedAttributes[attributeInfo.name] = crc3.getAttribLocation(program, attributeInfo.name);
                }
                return detectedAttributes;
            }
            function detectUniforms() {
                let detectedUniforms = {};
                let uniformCount = crc3.getProgramParameter(program, WebGL2RenderingContext.ACTIVE_UNIFORMS);
                for (let i = 0; i < uniformCount; i++) {
                    let info = RenderOperator.assert(crc3.getActiveUniform(program, i));
                    if (!info) {
                        break;
                    }
                    detectedUniforms[info.name] = RenderOperator.assert(crc3.getUniformLocation(program, info.name));
                }
                return detectedUniforms;
            }
        }
        static useProgram(_shaderInfo) {
            RenderOperator.crc3.useProgram(_shaderInfo.program);
            RenderOperator.crc3.enableVertexAttribArray(_shaderInfo.attributes["a_position"]);
        }
        static deleteProgram(_program) {
            if (_program) {
                RenderOperator.crc3.deleteProgram(_program.program);
                delete _program.attributes;
                delete _program.uniforms;
            }
        }
        // #endregion
        // #region Meshbuffer
        static createBuffers(_mesh) {
            let vertices = RenderOperator.assert(RenderOperator.crc3.createBuffer());
            RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, vertices);
            RenderOperator.crc3.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, _mesh.vertices, WebGL2RenderingContext.STATIC_DRAW);
            let indices = RenderOperator.assert(RenderOperator.crc3.createBuffer());
            RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, indices);
            RenderOperator.crc3.bufferData(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, _mesh.indices, WebGL2RenderingContext.STATIC_DRAW);
            let textureUVs = RenderOperator.crc3.createBuffer();
            RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, textureUVs);
            RenderOperator.crc3.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, _mesh.textureUVs, WebGL2RenderingContext.STATIC_DRAW);
            let normalsFace = RenderOperator.assert(RenderOperator.crc3.createBuffer());
            RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, normalsFace);
            RenderOperator.crc3.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, _mesh.normalsFace, WebGL2RenderingContext.STATIC_DRAW);
            let bufferInfo = {
                vertices: vertices,
                indices: indices,
                nIndices: _mesh.getIndexCount(),
                textureUVs: textureUVs,
                normalsFace: normalsFace
            };
            return bufferInfo;
        }
        static useBuffers(_renderBuffers) {
            // TODO: currently unused, done specifically in draw. Could be saved in VAO within RenderBuffers
            // RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, _renderBuffers.vertices);
            // RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, _renderBuffers.indices);
            // RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, _renderBuffers.textureUVs);
        }
        static deleteBuffers(_renderBuffers) {
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
        static createParameter(_coat) {
            // let vao: WebGLVertexArrayObject = RenderOperator.assert<WebGLVertexArrayObject>(RenderOperator.crc3.createVertexArray());
            let coatInfo = {
                //vao: null,
                coat: _coat
            };
            return coatInfo;
        }
        static useParameter(_coatInfo) {
            // RenderOperator.crc3.bindVertexArray(_coatInfo.vao);
        }
        static deleteParameter(_coatInfo) {
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
        static setAttributeStructure(_attributeLocation, _bufferSpecification) {
            RenderOperator.crc3.vertexAttribPointer(_attributeLocation, _bufferSpecification.size, _bufferSpecification.dataType, _bufferSpecification.normalize, _bufferSpecification.stride, _bufferSpecification.offset);
        }
    }
    Fudge.RenderOperator = RenderOperator;
})(Fudge || (Fudge = {}));
/// <reference path="../Transfer/Mutable.ts"/>
/// <reference path="../Render/RenderInjector.ts"/>
/// <reference path="../Render/RenderOperator.ts"/>
var Fudge;
/// <reference path="../Transfer/Mutable.ts"/>
/// <reference path="../Render/RenderInjector.ts"/>
/// <reference path="../Render/RenderOperator.ts"/>
(function (Fudge) {
    // interface ShaderParameters {
    //     [key: string]: number | Color;
    // }
    class Coat extends Fudge.Mutable {
        constructor() {
            super(...arguments);
            this.name = "Coat";
        }
        mutate(_mutator) {
            super.mutate(_mutator);
        }
        useRenderData(_renderShader) { }
        reduceMutator() { }
    }
    Fudge.Coat = Coat;
    let CoatColored = class CoatColored extends Coat {
        constructor(_color) {
            super();
            this.color = _color || new Fudge.Color(0.5, 0.5, 0.5, 1);
        }
    };
    CoatColored = __decorate([
        Fudge.RenderInjector.decorateCoat
    ], CoatColored);
    Fudge.CoatColored = CoatColored;
    let CoatTextured = class CoatTextured extends Coat {
        constructor() {
            super(...arguments);
            this.texture = null;
        }
    };
    CoatTextured = __decorate([
        Fudge.RenderInjector.decorateCoat
    ], CoatTextured);
    Fudge.CoatTextured = CoatTextured;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    class Serializer {
        // TODO: examine, if this class should be placed in another namespace, since calling Fudge[...] there doesn't require the use of 'any'
        // TODO: examine, if the deserialize-Methods of Serializables should be static, returning a new object of the class
        /**
         * Returns a javascript object representing the serializable FUDGE-object given,
         * including attached components, children, superclass-objects all information needed for reconstruction
         * @param _object An object to serialize, implementing the Serializable interface
         */
        static serialize(_object) {
            let serialization = {};
            serialization[_object.constructor.name] = _object.serialize();
            return serialization;
        }
        /**
         * Returns a FUDGE-object reconstructed from the information in the serialization-object given,
         * including attached components, children, superclass-objects
         * @param _serialization
         */
        static deserialize(_serialization) {
            let reconstruct;
            try {
                // loop constructed solely to access type-property. Only one expected!
                for (let typeName in _serialization) {
                    reconstruct = new Fudge[typeName];
                    reconstruct.deserialize(_serialization[typeName]);
                    return reconstruct;
                }
            }
            catch (message) {
                throw new Error("Deserialization failed: " + message);
            }
            return null;
        }
    }
    Fudge.Serializer = Serializer;
})(Fudge || (Fudge = {}));
/// <reference path="../Transfer/Serializer.ts"/>
/// <reference path="../Transfer/Mutable.ts"/>
var Fudge;
/// <reference path="../Transfer/Serializer.ts"/>
/// <reference path="../Transfer/Mutable.ts"/>
(function (Fudge) {
    /**
     * Superclass for all [[Component]]s that can be attached to [[Node]]s.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Component extends Fudge.Mutable {
        constructor() {
            super(...arguments);
            this.singleton = true;
            this.container = null;
            this.active = true;
        }
        activate(_on) {
            this.active = _on;
        }
        get isActive() {
            return this.active;
        }
        /**
         * Is true, when only one instance of the component class can be attached to a node
         */
        get isSingleton() {
            return this.singleton;
        }
        /**
         * Retrieves the node, this component is currently attached to
         * @returns The container node or null, if the component is not attached to
         */
        getContainer() {
            return this.container;
        }
        /**
         * Tries to add the component to the given node, removing it from the previous container if applicable
         * @param _container The node to attach this component to
         * TODO: write tests to prove consistency and correct exception handling
         */
        setContainer(_container) {
            if (this.container == _container)
                return;
            let previousContainer = this.container;
            try {
                if (previousContainer)
                    previousContainer.removeComponent(this);
                this.container = _container;
                this.container.addComponent(this);
            }
            catch {
                this.container = previousContainer;
            }
        }
        serialize() {
            let serialization = {
                active: this.active
            };
            return serialization;
        }
        deserialize(_serialization) {
            this.active = _serialization.active;
            return this;
        }
        reduceMutator(_mutator) {
            delete _mutator.singleton;
        }
    }
    Fudge.Component = Component;
})(Fudge || (Fudge = {}));
/// <reference path="Component.ts"/>
var Fudge;
/// <reference path="Component.ts"/>
(function (Fudge) {
    let FIELD_OF_VIEW;
    (function (FIELD_OF_VIEW) {
        FIELD_OF_VIEW[FIELD_OF_VIEW["HORIZONTAL"] = 0] = "HORIZONTAL";
        FIELD_OF_VIEW[FIELD_OF_VIEW["VERTICAL"] = 1] = "VERTICAL";
        FIELD_OF_VIEW[FIELD_OF_VIEW["DIAGONAL"] = 2] = "DIAGONAL";
    })(FIELD_OF_VIEW = Fudge.FIELD_OF_VIEW || (Fudge.FIELD_OF_VIEW = {}));
    // string-enum for testing ui-features. TODO: change back to number enum if strings not needed
    let PROJECTION;
    (function (PROJECTION) {
        PROJECTION["CENTRAL"] = "central";
        PROJECTION["ORTHOGRAPHIC"] = "orthographic";
        PROJECTION["DIMETRIC"] = "dimetric";
        PROJECTION["STEREO"] = "stereo";
    })(PROJECTION = Fudge.PROJECTION || (Fudge.PROJECTION = {}));
    /**
     * The camera component holds the projection-matrix and other data needed to render a scene from the perspective of the node it is attached to.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentCamera extends Fudge.Component {
        constructor() {
            super(...arguments);
            // TODO: a ComponentPivot might be interesting to ease behaviour scripting
            //private orthographic: boolean = false; // Determines whether the image will be rendered with perspective or orthographic projection.
            this.projection = PROJECTION.CENTRAL;
            this.transform = new Fudge.Matrix4x4; // The matrix to multiply each scene objects transformation by, to determine where it will be drawn.
            this.fieldOfView = 45; // The camera's sensorangle.
            this.aspectRatio = 1.0;
            this.direction = FIELD_OF_VIEW.DIAGONAL;
            this.backgroundColor = new Fudge.Color(0, 0, 0, 1); // The color of the background the camera will render.
            this.backgroundEnabled = true; // Determines whether or not the background of this camera will be rendered.
        }
        // TODO: examine, if background should be an attribute of Camera or Viewport
        getProjection() {
            return this.projection;
        }
        getBackgoundColor() {
            return this.backgroundColor;
        }
        getBackgroundEnabled() {
            return this.backgroundEnabled;
        }
        getAspect() {
            return this.aspectRatio;
        }
        getFieldOfView() {
            return this.fieldOfView;
        }
        /**
         * Returns the multiplikation of the worldtransformation of the camera container with the projection matrix
         * @returns the world-projection-matrix
         */
        get ViewProjectionMatrix() {
            try {
                let cmpTransform = this.getContainer().cmpTransform;
                let viewMatrix = Fudge.Matrix4x4.inverse(cmpTransform.local); // TODO: WorldMatrix-> Camera must be calculated
                return Fudge.Matrix4x4.multiply(this.transform, viewMatrix);
            }
            catch {
                return this.transform;
            }
        }
        /**
         * Set the camera to perspective projection. The world origin is in the center of the canvaselement.
         * @param _aspect The aspect ratio between width and height of projectionspace.(Default = canvas.clientWidth / canvas.ClientHeight)
         * @param _fieldOfView The field of view in Degrees. (Default = 45)
         */
        projectCentral(_aspect = this.aspectRatio, _fieldOfView = this.fieldOfView, _direction = this.direction) {
            this.aspectRatio = _aspect;
            this.fieldOfView = _fieldOfView;
            this.direction = _direction;
            this.projection = PROJECTION.CENTRAL;
            this.transform = Fudge.Matrix4x4.centralProjection(_aspect, this.fieldOfView, 1, 2000, this.direction); // TODO: remove magic numbers
        }
        /**
         * Set the camera to orthographic projection. The origin is in the top left corner of the canvaselement.
         * @param _left The positionvalue of the projectionspace's left border. (Default = 0)
         * @param _right The positionvalue of the projectionspace's right border. (Default = canvas.clientWidth)
         * @param _bottom The positionvalue of the projectionspace's bottom border.(Default = canvas.clientHeight)
         * @param _top The positionvalue of the projectionspace's top border.(Default = 0)
         */
        projectOrthographic(_left = 0, _right = Fudge.RenderManager.getCanvas().clientWidth, _bottom = Fudge.RenderManager.getCanvas().clientHeight, _top = 0) {
            this.projection = PROJECTION.ORTHOGRAPHIC;
            this.transform = Fudge.Matrix4x4.orthographicProjection(_left, _right, _bottom, _top, 400, -400); // TODO: examine magic numbers!
        }
        serialize() {
            let serialization = {
                backgroundColor: this.backgroundColor,
                backgroundEnabled: this.backgroundEnabled,
                projection: this.projection,
                fieldOfView: this.fieldOfView,
                direction: this.direction,
                aspect: this.aspectRatio,
                [super.type]: super.serialize()
            };
            return serialization;
        }
        deserialize(_serialization) {
            this.backgroundColor = _serialization.backgroundColor;
            this.backgroundEnabled = _serialization.backgroundEnabled;
            this.projection = _serialization.projection;
            this.fieldOfView = _serialization.fieldOfView;
            this.aspectRatio = _serialization.aspect;
            this.direction = _serialization.direction;
            super.deserialize(_serialization[super.type]);
            switch (this.projection) {
                case PROJECTION.ORTHOGRAPHIC:
                    this.projectOrthographic(); // TODO: serialize and deserialize parameters
                    break;
                case PROJECTION.CENTRAL:
                    this.projectCentral();
                    break;
            }
            return this;
        }
        getMutatorAttributeTypes(_mutator) {
            let types = super.getMutatorAttributeTypes(_mutator);
            if (types.direction)
                types.direction = FIELD_OF_VIEW;
            if (types.projection)
                types.projection = PROJECTION;
            return types;
        }
        mutate(_mutator) {
            super.mutate(_mutator);
        }
        reduceMutator(_mutator) {
            delete _mutator.transform;
            super.reduceMutator(_mutator);
        }
    }
    Fudge.ComponentCamera = ComponentCamera;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Attaches a light to the node
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentLight extends Fudge.Component {
        constructor(_light = null) {
            super();
            this.singleton = false;
            this.light = _light;
        }
        getLight() {
            return this.light;
        }
    }
    Fudge.ComponentLight = ComponentLight;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Class that holds all data concerning color and texture, to pass and apply to the node it is attached to.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentMaterial extends Fudge.Component {
        // TODO: Shader defines material-parameter. Can then the material be independent of the shader? Different structure needed
        initialize(_material) {
            this.material = _material;
        }
        getMaterial() {
            return this.material;
        }
    }
    Fudge.ComponentMaterial = ComponentMaterial;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Class to hold all data needed by the WebGL vertexbuffer to draw the shape of an object.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentMesh extends Fudge.Component {
        constructor() {
            super(...arguments);
            this.mesh = null;
        }
        setMesh(_mesh) {
            this.mesh = _mesh;
        }
        getMesh() {
            return this.mesh;
        }
        serialize() {
            let serialization = {
                mesh: this.mesh.serialize(),
                [super.type]: super.serialize()
            };
            return serialization;
        }
        deserialize(_serialization) {
            let mesh = Fudge.Serializer.deserialize(_serialization.mesh);
            this.setMesh(mesh);
            super.deserialize(_serialization[super.type]);
            return this;
        }
    }
    Fudge.ComponentMesh = ComponentMesh;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Class to hold the transformation-data of the mesh that is attached to the same node.
     * The pivot-transformation does not affect the transformation of the node itself or its children.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentPivot extends Fudge.Component {
        constructor() {
            super(...arguments);
            this.local = Fudge.Matrix4x4.identity; // The matrix to transform the mesh by.
            // #endregion
        }
        get position() {
            return new Fudge.Vector3(this.local.data[12], this.local.data[13], this.local.data[14]);
        }
        // #region Transformation
        /**
         * Resets this.matrix to idenity Matrix.
         */
        reset() {
            this.local = Fudge.Matrix4x4.identity;
        }
        // #endregion
        // #region Translation
        /**
         * Translate the transformation along the x-, y- and z-axis.
         * @param _x The x-value of the translation.
         * @param _y The y-value of the translation.
         * @param _z The z-value of the translation.
         */
        translate(_x, _y, _z) {
            this.local = Fudge.Matrix4x4.translate(this.local, _x, _y, _z);
        }
        /**
         * Translate the transformation along the x-axis.
         * @param _x The value of the translation.
         */
        translateX(_x) {
            this.local = Fudge.Matrix4x4.translate(this.local, _x, 0, 0);
        }
        /**
         * Translate the transformation along the y-axis.
         * @param _y The value of the translation.
         */
        translateY(_y) {
            this.local = Fudge.Matrix4x4.translate(this.local, 0, _y, 0);
        }
        /**
         * Translate the transformation along the z-axis.
         * @param _z The value of the translation.
         */
        translateZ(_z) {
            this.local = Fudge.Matrix4x4.translate(this.local, 0, 0, _z);
        }
        // #endregion
        // #region Rotation
        /**
         * Rotate the transformation along the around its x-Axis.
         * @param _angle The angle to rotate by.
         */
        rotateX(_angle) {
            this.local = Fudge.Matrix4x4.rotateX(this.local, _angle);
        }
        /**
         * Rotate the transformation along the around its y-Axis.
         * @param _angle The angle to rotate by.
         */
        rotateY(_angle) {
            this.local = Fudge.Matrix4x4.rotateY(this.local, _angle);
        }
        /**
         * Rotate the transformation along the around its z-Axis.
         * @param _angle The angle to rotate by.
         */
        rotateZ(_zAngle) {
            this.local = Fudge.Matrix4x4.rotateZ(this.local, _zAngle);
        }
        /**
         * Wrapper function to rotate the transform so that its z-Axis is facing in the direction of the targets position.
         * TODO: Use world transformations! Does it make sense in Pivot?
         * @param _target The target to look at.
         */
        lookAt(_target) {
            this.local = Fudge.Matrix4x4.lookAt(this.position, _target); // TODO: Handle rotation around z-axis
        }
        // #endregion
        // #region Scaling
        /**
         * Scale the transformation along the x-, y- and z-axis.
         * @param _xScale The value to scale x by.
         * @param _yScale The value to scale y by.
         * @param _zScale The value to scale z by.
         */
        scale(_xScale, _yScale, _zScale) {
            this.local = Fudge.Matrix4x4.scale(this.local, _xScale, _yScale, _zScale);
        }
        /**
         * Scale the transformation along the x-axis.
         * @param _scale The value to scale by.
         */
        scaleX(_scale) {
            this.local = Fudge.Matrix4x4.scale(this.local, _scale, 1, 1);
        }
        /**
         * Scale the transformation along the y-axis.
         * @param _scale The value to scale by.
         */
        scaleY(_scale) {
            this.local = Fudge.Matrix4x4.scale(this.local, 1, _scale, 1);
        }
        /**
         * Scale the transformation along the z-axis.
         * @param _scale The value to scale by.
         */
        scaleZ(_scale) {
            this.local = Fudge.Matrix4x4.scale(this.local, 1, 1, _scale);
        }
        // #endregion
        // #region Serialization
        serialize() {
            // TODO: save translation, rotation and scale as vectors for readability and manipulation
            let serialization = {
                local: this.local.serialize(),
                [super.type]: super.serialize()
            };
            return serialization;
        }
        deserialize(_serialization) {
            this.local.deserialize(_serialization.local);
            super.deserialize(_serialization[super.type]);
            return this;
        }
    }
    Fudge.ComponentPivot = ComponentPivot;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Base class for scripts the user writes
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentScript extends Fudge.Component {
        constructor() {
            super();
            this.singleton = false;
        }
    }
    Fudge.ComponentScript = ComponentScript;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * The transformation-data of the node, extends ComponentPivot for fewer redundancies.
     * Affects the origin of a node and its descendants. Use [[ComponentPivot]] to transform only the mesh attached
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentTransform extends Fudge.ComponentPivot {
        constructor() {
            super();
            this.world = Fudge.Matrix4x4.identity;
        }
        get WorldPosition() {
            return new Fudge.Vector3(this.world.data[12], this.world.data[13], this.world.data[14]);
        }
        serialize() {
            let serialization = {
                // worldMatrix: this.worldMatrix.serialize(),  // is transient, doesn't need to be serialized...     
                [super.type]: super.serialize()
            };
            return serialization;
        }
        deserialize(_serialization) {
            // this.worldMatrix.deserialize(_serialization.worldMatrix);
            super.deserialize(_serialization[super.type]);
            return this;
        }
        mutate(_mutator) {
            super.mutate(_mutator);
        }
        reduceMutator(_mutator) {
            delete _mutator.world;
            super.reduceMutator(_mutator);
        }
    }
    Fudge.ComponentTransform = ComponentTransform;
})(Fudge || (Fudge = {}));
// <reference path="DebugAlert.ts"/>
var Fudge;
// <reference path="DebugAlert.ts"/>
(function (Fudge) {
    /**
     * The filters corresponding to debug activities, more to come
     */
    let DEBUG_FILTER;
    (function (DEBUG_FILTER) {
        DEBUG_FILTER[DEBUG_FILTER["NONE"] = 0] = "NONE";
        DEBUG_FILTER[DEBUG_FILTER["INFO"] = 1] = "INFO";
        DEBUG_FILTER[DEBUG_FILTER["LOG"] = 2] = "LOG";
        DEBUG_FILTER[DEBUG_FILTER["WARN"] = 4] = "WARN";
        DEBUG_FILTER[DEBUG_FILTER["ERROR"] = 8] = "ERROR";
        DEBUG_FILTER[DEBUG_FILTER["ALL"] = 15] = "ALL";
    })(DEBUG_FILTER = Fudge.DEBUG_FILTER || (Fudge.DEBUG_FILTER = {}));
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Base class for the different DebugTargets, mainly for technical purpose of inheritance
     */
    class DebugTarget {
        static mergeArguments(_message, ..._args) {
            let out = JSON.stringify(_message);
            for (let arg of _args)
                out += "\n" + JSON.stringify(arg, null, 2);
            return out;
        }
    }
    Fudge.DebugTarget = DebugTarget;
})(Fudge || (Fudge = {}));
/// <reference path="DebugTarget.ts"/>
var Fudge;
/// <reference path="DebugTarget.ts"/>
(function (Fudge) {
    /**
     * Routing to the alert box
     */
    class DebugAlert extends Fudge.DebugTarget {
        static createDelegate(_headline) {
            let delegate = function (_message, ..._args) {
                let out = _headline + "\n\n" + Fudge.DebugTarget.mergeArguments(_message, ..._args);
                alert(out);
            };
            return delegate;
        }
    }
    DebugAlert.delegates = {
        [Fudge.DEBUG_FILTER.INFO]: DebugAlert.createDelegate("Info"),
        [Fudge.DEBUG_FILTER.LOG]: DebugAlert.createDelegate("Log"),
        [Fudge.DEBUG_FILTER.WARN]: DebugAlert.createDelegate("Warn"),
        [Fudge.DEBUG_FILTER.ERROR]: DebugAlert.createDelegate("Error")
    };
    Fudge.DebugAlert = DebugAlert;
})(Fudge || (Fudge = {}));
/// <reference path="DebugTarget.ts"/>
var Fudge;
/// <reference path="DebugTarget.ts"/>
(function (Fudge) {
    /**
     * Routing to the standard-console
     */
    class DebugConsole extends Fudge.DebugTarget {
    }
    DebugConsole.delegates = {
        [Fudge.DEBUG_FILTER.INFO]: console.info,
        [Fudge.DEBUG_FILTER.LOG]: console.log,
        [Fudge.DEBUG_FILTER.WARN]: console.warn,
        [Fudge.DEBUG_FILTER.ERROR]: console.error
    };
    Fudge.DebugConsole = DebugConsole;
})(Fudge || (Fudge = {}));
/// <reference path="DebugInterfaces.ts"/>
/// <reference path="DebugAlert.ts"/>
/// <reference path="DebugConsole.ts"/>
var Fudge;
/// <reference path="DebugInterfaces.ts"/>
/// <reference path="DebugAlert.ts"/>
/// <reference path="DebugConsole.ts"/>
(function (Fudge) {
    /**
     * The Debug-Class offers functions known from the console-object and additions,
     * routing the information to various [[DebugTargets]] that can be easily defined by the developers and registerd by users
     */
    class Debug {
        /**
         * De- / Activate a filter for the given DebugTarget.
         * @param _target
         * @param _filter
         */
        static setFilter(_target, _filter) {
            for (let filter in Debug.delegates)
                Debug.delegates[filter].delete(_target);
            for (let filter in Fudge.DEBUG_FILTER) {
                let parsed = parseInt(filter);
                if (parsed == Fudge.DEBUG_FILTER.ALL)
                    break;
                if (_filter & parsed)
                    Debug.delegates[parsed].set(_target, _target.delegates[parsed]);
            }
        }
        /**
         * Debug function to be implemented by the DebugTarget.
         * info(...) displays additional information with low priority
         * @param _message
         * @param _args
         */
        static info(_message, ..._args) {
            Debug.delegate(Fudge.DEBUG_FILTER.INFO, _message, _args);
        }
        /**
         * Debug function to be implemented by the DebugTarget.
         * log(...) displays information with medium priority
         * @param _message
         * @param _args
         */
        static log(_message, ..._args) {
            Debug.delegate(Fudge.DEBUG_FILTER.LOG, _message, _args);
        }
        /**
         * Debug function to be implemented by the DebugTarget.
         * warn(...) displays information about non-conformities in usage, which is emphasized e.g. by color
         * @param _message
         * @param _args
         */
        static warn(_message, ..._args) {
            Debug.delegate(Fudge.DEBUG_FILTER.WARN, _message, _args);
        }
        /**
         * Debug function to be implemented by the DebugTarget.
         * error(...) displays critical information about failures, which is emphasized e.g. by color
         * @param _message
         * @param _args
         */
        static error(_message, ..._args) {
            Debug.delegate(Fudge.DEBUG_FILTER.ERROR, _message, _args);
        }
        /**
         * Lookup all delegates registered to the filter and call them using the given arguments
         * @param _filter
         * @param _message
         * @param _args
         */
        static delegate(_filter, _message, _args) {
            let delegates = Debug.delegates[_filter];
            for (let delegate of delegates.values())
                if (_args.length > 0)
                    delegate(_message, ..._args);
                else
                    delegate(_message);
        }
    }
    /**
     * For each set filter, this associative array keeps references to the registered delegate functions of the chosen [[DebugTargets]]
     */
    // TODO: implement anonymous function setting up all filters
    Debug.delegates = {
        [Fudge.DEBUG_FILTER.INFO]: new Map([[Fudge.DebugConsole, Fudge.DebugConsole.delegates[Fudge.DEBUG_FILTER.INFO]]]),
        [Fudge.DEBUG_FILTER.LOG]: new Map([[Fudge.DebugConsole, Fudge.DebugConsole.delegates[Fudge.DEBUG_FILTER.LOG]]]),
        [Fudge.DEBUG_FILTER.WARN]: new Map([[Fudge.DebugConsole, Fudge.DebugConsole.delegates[Fudge.DEBUG_FILTER.WARN]]]),
        [Fudge.DEBUG_FILTER.ERROR]: new Map([[Fudge.DebugConsole, Fudge.DebugConsole.delegates[Fudge.DEBUG_FILTER.ERROR]]])
    };
    Fudge.Debug = Debug;
})(Fudge || (Fudge = {}));
/// <reference path="DebugTarget.ts"/>
var Fudge;
/// <reference path="DebugTarget.ts"/>
(function (Fudge) {
    /**
     * Routing to a HTMLDialogElement
     */
    class DebugDialog extends Fudge.DebugTarget {
    }
    Fudge.DebugDialog = DebugDialog;
})(Fudge || (Fudge = {}));
/// <reference path="DebugTarget.ts"/>
var Fudge;
/// <reference path="DebugTarget.ts"/>
(function (Fudge) {
    /**
     * Route to an HTMLTextArea, may be obsolete when using HTMLDialogElement
     */
    class DebugTextArea extends Fudge.DebugTarget {
        static createDelegate(_headline) {
            let delegate = function (_message, ..._args) {
                let out = _headline + "\n\n" + Fudge.DebugTarget.mergeArguments(_message, _args);
                DebugTextArea.textArea.textContent += out;
            };
            return delegate;
        }
    }
    DebugTextArea.textArea = document.createElement("textarea");
    DebugTextArea.delegates = {
        [Fudge.DEBUG_FILTER.INFO]: Fudge.DebugAlert.createDelegate("Info")
    };
    Fudge.DebugTextArea = DebugTextArea;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    class Color {
        constructor(_r, _g, _b, _a) {
            this.r = _r;
            this.g = _g;
            this.b = _b;
            this.a = _a;
        }
        getArray() {
            return new Float32Array([this.r, this.g, this.b, this.a]);
        }
    }
    Fudge.Color = Color;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    class KeyboardEventƒ extends KeyboardEvent {
        constructor(type, _event) {
            super(type, _event);
        }
    }
    Fudge.KeyboardEventƒ = KeyboardEventƒ;
    class PointerEventƒ extends PointerEvent {
        constructor(type, _event) {
            super(type, _event);
            let target = _event.target;
            this.clientRect = target.getClientRects()[0];
            this.pointerX = _event.clientX - this.clientRect.left;
            this.pointerY = _event.clientY - this.clientRect.top;
        }
    }
    Fudge.PointerEventƒ = PointerEventƒ;
    class DragDropEventƒ extends DragEvent {
        constructor(type, _event) {
            super(type, _event);
            let target = _event.target;
            this.clientRect = target.getClientRects()[0];
            this.pointerX = _event.clientX - this.clientRect.left;
            this.pointerY = _event.clientY - this.clientRect.top;
        }
    }
    Fudge.DragDropEventƒ = DragDropEventƒ;
    class WheelEventƒ extends WheelEvent {
        constructor(type, _event) {
            super(type, _event);
        }
    }
    Fudge.WheelEventƒ = WheelEventƒ;
    /**
     * Base class for EventTarget singletons, which are fixed entities in the structure of Fudge, such as the core loop
     */
    class EventTargetStatic extends EventTarget {
        constructor() {
            super();
        }
        static addEventListener(_type, _handler) {
            EventTargetStatic.targetStatic.addEventListener(_type, _handler);
        }
        static removeEventListener(_type, _handler) {
            EventTargetStatic.targetStatic.removeEventListener(_type, _handler);
        }
        static dispatchEvent(_event) {
            EventTargetStatic.targetStatic.dispatchEvent(_event);
            return true;
        }
    }
    EventTargetStatic.targetStatic = new EventTargetStatic();
    Fudge.EventTargetStatic = EventTargetStatic;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Core loop of a Fudge application. Initializes automatically and must be startet via Loop.start().
     * it then fires EVENT.ANIMATION_FRAME to all listeners added at each animation frame requested from the host window
     */
    class Loop extends Fudge.EventTargetStatic {
        /**
         * Start the core loop
         */
        static start() {
            if (!Loop.running)
                Loop.loop(performance.now());
            console.log("Loop running");
        }
        static loop(_timestamp) {
            // TODO: do something with timestamp... store in gametime, since there actually is already a timestamp in the event by default
            let event = new Event("loopFrame" /* LOOP_FRAME */);
            Loop.targetStatic.dispatchEvent(event);
            window.requestAnimationFrame(Loop.loop);
        }
    }
    Loop.running = false;
    Fudge.Loop = Loop;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Baseclass for materials. Combines a [[Shader]] with a compatible [[Coat]]
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Material {
        constructor(_name, _shader, _coat) {
            this.name = _name;
            this.shaderType = _shader;
            if (_shader) {
                if (_coat)
                    this.setCoat(_coat);
                else
                    this.setCoat(this.createCoatMatchingShader());
            }
        }
        createCoatMatchingShader() {
            let coat = new (this.shaderType.getCoat())();
            return coat;
        }
        setCoat(_coat) {
            if (_coat.constructor != this.shaderType.getCoat())
                throw (new Error("Shader and coat don't match"));
            this.coat = _coat;
        }
        getCoat() {
            return this.coat;
        }
        setShader(_shaderType) {
            this.shaderType = _shaderType;
            let coat = this.createCoatMatchingShader();
            coat.mutate(this.coat.getMutator());
        }
        getShader() {
            return this.shaderType;
        }
    }
    Fudge.Material = Material;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Represents a node in the scenetree.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Node extends EventTarget {
        /**
         * Creates a new node with a name and initializes all attributes
         * @param _name The name by which the node can be called.
         */
        constructor(_name) {
            super();
            this.parent = null; // The parent of this node.
            this.children = []; // array of child nodes appended to this node.
            this.components = {};
            // private tags: string[] = []; // Names of tags that are attached to this node. (TODO: As of yet no functionality)
            // private layers: string[] = []; // Names of the layers this node is on. (TODO: As of yet no functionality)
            this.listeners = {};
            this.captures = {};
            this.name = _name;
        }
        getParent() {
            return this.parent;
        }
        getAncestor() {
            let ancestor = this;
            while (ancestor.getParent())
                ancestor.getParent();
            return ancestor;
        }
        get cmpTransform() {
            return this.getComponents(Fudge.ComponentTransform)[0];
        }
        // #region Scenetree
        /**
         * Returns a clone of the list of children
         */
        getChildren() {
            return this.children.slice(0);
        }
        /**
         * Returns an array of references to childnodes with the supplied name.
         * @param _name The name of the nodes to be found.
         * @return An array with references to nodes
         */
        getChildrenByName(_name) {
            let found = [];
            found = this.children.filter((_node) => _node.name == _name);
            return found;
        }
        /**
         * Adds the given reference to a node to the list of children, if not already in
         * @param _node The node to be added as a child
         * @throws Error when trying to add an ancestor of this
         */
        appendChild(_node) {
            if (this.children.includes(_node))
                // _node is already a child of this
                return;
            let ancestor = this.parent;
            while (ancestor) {
                if (ancestor == _node)
                    throw (new Error("Cyclic reference prohibited in node hierarchy, ancestors must not be added as children"));
                else
                    ancestor = ancestor.parent;
            }
            this.children.push(_node);
            _node.setParent(this);
            _node.dispatchEvent(new Event("childAdd" /* CHILD_APPEND */, { bubbles: true }));
        }
        /**
         * Removes the reference to the give node from the list of children
         * @param _node The node to be removed.
         */
        removeChild(_node) {
            let iFound = this.children.indexOf(_node);
            if (iFound < 0)
                return;
            _node.dispatchEvent(new Event("childRemove" /* CHILD_REMOVE */, { bubbles: true }));
            this.children.splice(iFound, 1);
            _node.setParent(null);
        }
        /**
         * Generator yielding the node and all successors in the branch below for iteration
         */
        get branch() {
            return this.getBranchGenerator();
        }
        // #endregion
        // #region Components
        /**
         * Returns a clone of the list of components of the given class attached this node.
         * @param _class The class of the components to be found.
         */
        getComponents(_class) {
            return (this.components[_class.name] || []).slice(0);
        }
        /**
         * Returns the first compontent found of the given class attached this node or null, if list is empty or doesn't exist
         * @param _class The class of the components to be found.
         */
        getComponent(_class) {
            let list = this.components[_class.name];
            if (list)
                return list[0];
            return null;
        }
        /**
         * Adds the supplied component into the nodes component map.
         * @param _component The component to be pushed into the array.
         */
        addComponent(_component) {
            if (_component.getContainer() == this)
                return;
            if (this.components[_component.type] === undefined)
                this.components[_component.type] = [_component];
            else if (_component.isSingleton)
                throw new Error("Component is marked singleton and can't be attached, no more than one allowed");
            else
                this.components[_component.type].push(_component);
            _component.setContainer(this);
            _component.dispatchEvent(new Event("componentAdd" /* COMPONENT_ADD */));
        }
        /**
         * Removes the given component from the node, if it was attached, and sets its parent to null.
         * @param _component The component to be removed
         * @throws Exception when component is not found
         */
        removeComponent(_component) {
            try {
                let componentsOfType = this.components[_component.type];
                let foundAt = componentsOfType.indexOf(_component);
                componentsOfType.splice(foundAt, 1);
                _component.setContainer(null);
                _component.dispatchEvent(new Event("componentRemove" /* COMPONENT_REMOVE */));
            }
            catch {
                throw new Error(`Unable to find component '${_component}'in node named '${this.name}'`);
            }
        }
        // #endregion
        // #region Serialization
        serialize() {
            let serialization = {
                name: this.name
                // TODO: serialize references, does parent need to be serialized at all?
                //parent: this.parent
            };
            let components = {};
            for (let type in this.components) {
                components[type] = [];
                for (let component of this.components[type]) {
                    components[type].push(component.serialize());
                }
            }
            serialization["components"] = components;
            let children = [];
            for (let child of this.children) {
                children.push(child.serialize());
            }
            serialization["children"] = children;
            return serialization;
        }
        deserialize(_serialization) {
            this.name = _serialization.name;
            // this.parent = is set when the nodes are added
            for (let type in _serialization.components) {
                for (let data of _serialization.components[type]) {
                    let serializedComponent = { [type]: data };
                    let deserializedComponent = Fudge.Serializer.deserialize(serializedComponent);
                    this.addComponent(deserializedComponent);
                }
            }
            for (let child of _serialization.children) {
                let serializedChild = { "Node": child };
                let deserializedChild = Fudge.Serializer.deserialize(serializedChild);
                this.appendChild(deserializedChild);
            }
            return this;
        }
        // #endregion
        // #region Events
        /**
         * Adds an event listener to the node. The given handler will be called when a matching event is passed to the node.
         * Deviating from the standard EventTarget, here the _handler must be a function and _capture is the only option.
         * @param _type The type of the event, should be an enumerated value of NODE_EVENT, can be any string
         * @param _handler The function to call when the event reaches this node
         * @param _capture When true, the listener listens in the capture phase, when the event travels deeper into the hierarchy of nodes.
         */
        addEventListener(_type, _handler, _capture = false) {
            if (_capture) {
                if (!this.captures[_type])
                    this.captures[_type] = [];
                this.captures[_type].push(_handler);
            }
            else {
                if (!this.listeners[_type])
                    this.listeners[_type] = [];
                this.listeners[_type].push(_handler);
            }
        }
        /**
         * Dispatches a synthetic event event to target. This implementation always returns true (standard: return true only if either event's cancelable attribute value is false or its preventDefault() method was not invoked)
         * The event travels into the hierarchy to this node dispatching the event, invoking matching handlers of the nodes ancestors listening to the capture phase,
         * than the matching handler of the target node in the target phase, and back out of the hierarchy in the bubbling phase, invoking appropriate handlers of the anvestors
         * @param _event The event to dispatch
         */
        dispatchEvent(_event) {
            let ancestors = [];
            let upcoming = this;
            // overwrite event target
            Object.defineProperty(_event, "target", { writable: true, value: this });
            while (upcoming.parent)
                ancestors.push(upcoming = upcoming.parent);
            // capture phase
            Object.defineProperty(_event, "eventPhase", { writable: true, value: Event.CAPTURING_PHASE });
            for (let i = ancestors.length - 1; i >= 0; i--) {
                let ancestor = ancestors[i];
                Object.defineProperty(_event, "currentTarget", { writable: true, value: ancestor });
                let captures = ancestor.captures[_event.type] || [];
                for (let handler of captures)
                    handler(_event);
            }
            if (!_event.bubbles)
                return true;
            // target phase
            Object.defineProperty(_event, "eventPhase", { writable: true, value: Event.AT_TARGET });
            Object.defineProperty(_event, "currentTarget", { writable: true, value: this });
            let listeners = this.listeners[_event.type] || [];
            for (let handler of listeners)
                handler(_event);
            // bubble phase
            Object.defineProperty(_event, "eventPhase", { writable: true, value: Event.BUBBLING_PHASE });
            for (let i = 0; i < ancestors.length; i++) {
                let ancestor = ancestors[i];
                Object.defineProperty(_event, "currentTarget", { writable: true, value: ancestor });
                let listeners = ancestor.listeners[_event.type] || [];
                for (let handler of listeners)
                    handler(_event);
            }
            return true; //TODO: return a meaningful value, see documentation of dispatch event
        }
        /**
         * Broadcasts a synthetic event event to this node and from there to all nodes deeper in the hierarchy,
         * invoking matching handlers of the nodes listening to the capture phase. Watch performance when there are many nodes involved
         * @param _event The event to broadcast
         */
        broadcastEvent(_event) {
            // overwrite event target and phase
            Object.defineProperty(_event, "eventPhase", { writable: true, value: Event.CAPTURING_PHASE });
            Object.defineProperty(_event, "target", { writable: true, value: this });
            this.broadcastEventRecursive(_event);
        }
        broadcastEventRecursive(_event) {
            // capture phase only
            Object.defineProperty(_event, "currentTarget", { writable: true, value: this });
            let captures = this.captures[_event.type] || [];
            for (let handler of captures)
                handler(_event);
            // appears to be slower, astonishingly...
            // captures.forEach(function (handler: Function): void {
            //     handler(_event);
            // });
            // same for children
            for (let child of this.children) {
                child.broadcastEventRecursive(_event);
            }
        }
        // #endregion
        /**
         * Sets the parent of this node to be the supplied node. Will be called on the child that is appended to this node by appendChild().
         * @param _parent The parent to be set for this node.
         */
        setParent(_parent) {
            this.parent = _parent;
        }
        *getBranchGenerator() {
            yield this;
            for (let child of this.children)
                yield* child.branch;
        }
    }
    Fudge.Node = Node;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Baseclass for different kinds of lights.
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Light extends Fudge.Mutable {
        constructor(_color = new Fudge.Color(1, 1, 1, 1)) {
            super();
            this.color = _color;
        }
        reduceMutator() { }
    }
    Fudge.Light = Light;
    /**
     * Ambient light, coming from all directions, illuminating everything with its color independent of position and orientation (like a foggy day or in the shades)
     * ```text
     * ~ ~ ~
     *  ~ ~ ~
     * ```
     */
    class LightAmbient extends Light {
        constructor(_color = new Fudge.Color(1, 1, 1, 1)) {
            super(_color);
        }
    }
    Fudge.LightAmbient = LightAmbient;
    /**
     * Directional light, illuminating everything from a specified direction with its color (like standing in bright sunlight)
     * ```text
     * --->
     * --->
     * --->
     * ```
     */
    class LightDirectional extends Light {
        constructor(_color = new Fudge.Color(1, 1, 1, 1), _direction = new Fudge.Vector3(0, -1, 0)) {
            super(_color);
            this.direction = new Fudge.Vector3(0, -1, 0);
            this.direction = _direction;
        }
    }
    Fudge.LightDirectional = LightDirectional;
    /**
     * Omnidirectional light emitting from its position, illuminating objects depending on their position and distance with its color (like a colored light bulb)
     * ```text
     *         .\|/.
     *        -- o --
     *         ´/|\`
     * ```
     */
    class LightPoint extends Light {
        constructor() {
            super(...arguments);
            this.range = 10;
        }
    }
    Fudge.LightPoint = LightPoint;
    /**
     * Spot light emitting within a specified angle from its position, illuminating objects depending on their position and distance with its color
     * ```text
     *          o
     *         /|\
     *        / | \
     * ```
     */
    class LightSpot extends Light {
    }
    Fudge.LightSpot = LightSpot;
})(Fudge || (Fudge = {}));
/// <reference path="../Lights/Light.ts"/>
/// <reference path="../Components/ComponentLight.ts"/>
var Fudge;
/// <reference path="../Lights/Light.ts"/>
/// <reference path="../Components/ComponentLight.ts"/>
(function (Fudge) {
    /**
     * Controls the rendering of a branch of a scenetree, using the given [[ComponentCamera]],
     * and the propagation of the rendered image from the offscreen renderbuffer to the target canvas
     * through a series of [[Framing]] objects. The stages involved are in order of rendering
     * [[RenderManager]].viewport -> [[Viewport]].source -> [[Viewport]].destination -> DOM-Canvas -> Client(CSS)
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Viewport extends EventTarget {
        constructor() {
            super(...arguments);
            this.name = "Viewport"; // The name to call this viewport by.
            this.camera = null; // The camera representing the view parameters to render the branch.
            // TODO: verify if client to canvas should be in Viewport or somewhere else (Window, Container?)
            // Multiple viewports using the same canvas shouldn't differ here...
            // different framing methods can be used, this is the default
            this.frameClientToCanvas = new Fudge.FramingScaled();
            this.frameCanvasToDestination = new Fudge.FramingComplex();
            this.frameDestinationToSource = new Fudge.FramingScaled();
            this.frameSourceToRender = new Fudge.FramingScaled();
            this.adjustingFrames = true;
            this.adjustingCamera = true;
            this.lights = null;
            this.branch = null; // The first node in the tree(branch) that will be rendered.
            this.crc2 = null;
            this.canvas = null;
            /**
             * Handle drag-drop events and dispatch to viewport as FUDGE-Event
             */
            this.hndDragDropEvent = (_event) => {
                let _dragevent = _event;
                switch (_dragevent.type) {
                    case "dragover":
                    case "drop":
                        _dragevent.preventDefault();
                        _dragevent.dataTransfer.effectAllowed = "none";
                        break;
                    case "dragstart":
                        // just dummy data,  valid data should be set in handler registered by the user
                        _dragevent.dataTransfer.setData("text", "Hallo");
                        // TODO: check if there is a better solution to hide the ghost image of the draggable object
                        _dragevent.dataTransfer.setDragImage(new Image(), 0, 0);
                        break;
                }
                let event = new Fudge.DragDropEventƒ("ƒ" + _event.type, _dragevent);
                this.addCanvasPosition(event);
                this.dispatchEvent(event);
            };
            /**
             * Handle pointer events and dispatch to viewport as FUDGE-Event
             */
            this.hndPointerEvent = (_event) => {
                let event = new Fudge.PointerEventƒ("ƒ" + _event.type, _event);
                this.addCanvasPosition(event);
                this.dispatchEvent(event);
            };
            /**
             * Handle keyboard events and dispatch to viewport as FUDGE-Event, if the viewport has the focus
             */
            this.hndKeyboardEvent = (_event) => {
                if (!this.hasFocus)
                    return;
                let event = new Fudge.KeyboardEventƒ("ƒ" + _event.type, _event);
                this.dispatchEvent(event);
            };
            /**
             * Handle wheel event and dispatch to viewport as FUDGE-Event
             */
            this.hndWheelEvent = (_event) => {
                let event = new Fudge.WheelEventƒ("ƒ" + _event.type, _event);
                this.dispatchEvent(event);
            };
        }
        /**
         * Creates a new viewport scenetree with a passed rootnode and camera and initializes all nodes currently in the tree(branch).
         * @param _branch
         * @param _camera
         */
        initialize(_name, _branch, _camera, _canvas) {
            this.name = _name;
            this.camera = _camera;
            this.canvas = _canvas;
            this.crc2 = _canvas.getContext("2d");
            this.rectSource = Fudge.RenderManager.getCanvasRect();
            this.rectDestination = this.getClientRectangle();
            this.setBranch(_branch);
        }
        /**
         * Retrieve the 2D-context attached to the destination canvas
         */
        getContext() {
            return this.crc2;
        }
        /**
         * Retrieve the size of the destination canvas as a rectangle, x and y are always 0
         */
        getCanvasRectangle() {
            return { x: 0, y: 0, width: this.canvas.width, height: this.canvas.height };
        }
        /**
         * Retrieve the client rectangle the canvas is displayed and fit in, x and y are always 0
         */
        getClientRectangle() {
            return { x: 0, y: 0, width: this.canvas.clientWidth, height: this.canvas.clientHeight };
        }
        /**
         * Set the branch to be drawn in the viewport.
         */
        setBranch(_branch) {
            if (this.branch) {
                this.branch.removeEventListener("componentAdd" /* COMPONENT_ADD */, this.hndComponentEvent);
                this.branch.removeEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndComponentEvent);
            }
            this.branch = _branch;
            this.collectLights();
            this.branch.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndComponentEvent);
            this.branch.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndComponentEvent);
        }
        /**
         * Collect all lights in the branch to pass to shaders
         */
        collectLights() {
            // TODO: make private
            this.lights = new Map();
            for (let node of this.branch.branch) {
                let cmpLights = node.getComponents(Fudge.ComponentLight);
                for (let cmpLight of cmpLights) {
                    let type = cmpLight.getLight().type;
                    let lightsOfType = this.lights.get(type);
                    if (!lightsOfType) {
                        lightsOfType = [];
                        this.lights.set(type, lightsOfType);
                    }
                    lightsOfType.push(cmpLight);
                }
            }
        }
        /**
         * Logs this viewports scenegraph to the console.
         */
        showSceneGraph() {
            // TODO: move to debug-class
            let output = "SceneGraph for this viewport:";
            output += "\n \n";
            output += this.branch.name;
            console.log(output + "   => ROOTNODE" + this.createSceneGraph(this.branch));
        }
        // #region Drawing
        /**
         * Draw this viewport
         */
        draw() {
            if (!this.camera.isActive)
                return;
            if (this.adjustingFrames)
                this.adjustFrames();
            if (this.adjustingCamera)
                this.adjustCamera();
            // HACK! no need to addBranch and recalc for each viewport and frame
            Fudge.RenderManager.clear(this.camera.getBackgoundColor());
            Fudge.RenderManager.addBranch(this.branch);
            Fudge.RenderManager.setLights(this.lights);
            Fudge.RenderManager.drawBranch(this.branch, this.camera);
            this.crc2.imageSmoothingEnabled = false;
            this.crc2.drawImage(Fudge.RenderManager.getCanvas(), this.rectSource.x, this.rectSource.y, this.rectSource.width, this.rectSource.height, this.rectDestination.x, this.rectDestination.y, this.rectDestination.width, this.rectDestination.height);
        }
        /**
         * Adjust all frames involved in the rendering process from the display area in the client up to the renderer canvas
         */
        adjustFrames() {
            // get the rectangle of the canvas area as displayed (consider css)
            let rectClient = this.getClientRectangle();
            // adjust the canvas size according to the given framing applied to client
            let rectCanvas = this.frameClientToCanvas.getRect(rectClient);
            this.canvas.width = rectCanvas.width;
            this.canvas.height = rectCanvas.height;
            // adjust the destination area on the target-canvas to render to by applying the framing to canvas
            this.rectDestination = this.frameCanvasToDestination.getRect(rectCanvas);
            // adjust the area on the source-canvas to render from by applying the framing to destination area
            this.rectSource = this.frameDestinationToSource.getRect(this.rectDestination);
            // having an offset source does make sense only when multiple viewports display parts of the same rendering. For now: shift it to 0,0
            this.rectSource.x = this.rectSource.y = 0;
            // still, a partial image of the rendering may be retrieved by moving and resizing the render viewport
            let rectRender = this.frameSourceToRender.getRect(this.rectSource);
            Fudge.RenderManager.setViewportRectangle(rectRender);
            // no more transformation after this for now, offscreen canvas and render-viewport have the same size
            Fudge.RenderManager.setCanvasSize(rectRender.width, rectRender.height);
        }
        /**
         * Adjust the camera parameters to fit the rendering into the render vieport
         */
        adjustCamera() {
            let rect = Fudge.RenderManager.getViewportRectangle();
            this.camera.projectCentral(rect.width / rect.height, this.camera.getFieldOfView());
        }
        // #endregion
        // #region Events (passing from canvas to viewport and from there into branch)
        /**
         * Returns true if this viewport currently has focus and thus receives keyboard events
         */
        get hasFocus() {
            return (Viewport.focus == this);
        }
        /**
         * Switch the viewports focus on or off. Only one viewport in one FUDGE instance can have the focus, thus receiving keyboard events.
         * So a viewport currently having the focus will lose it, when another one receives it. The viewports fire [[Event]]s accordingly.
         *
         * @param _on
         */
        setFocus(_on) {
            if (_on) {
                if (Viewport.focus == this)
                    return;
                if (Viewport.focus)
                    Viewport.focus.dispatchEvent(new Event("focusout" /* FOCUS_OUT */));
                Viewport.focus = this;
                this.dispatchEvent(new Event("focusin" /* FOCUS_IN */));
            }
            else {
                if (Viewport.focus != this)
                    return;
                this.dispatchEvent(new Event("focusout" /* FOCUS_OUT */));
                Viewport.focus = null;
            }
        }
        /**
         * De- / Activates the given pointer event to be propagated into the viewport as FUDGE-Event
         * @param _type
         * @param _on
         */
        activatePointerEvent(_type, _on) {
            this.activateEvent(this.canvas, _type, this.hndPointerEvent, _on);
        }
        /**
         * De- / Activates the given keyboard event to be propagated into the viewport as FUDGE-Event
         * @param _type
         * @param _on
         */
        activateKeyboardEvent(_type, _on) {
            this.activateEvent(this.canvas.ownerDocument, _type, this.hndKeyboardEvent, _on);
        }
        /**
         * De- / Activates the given drag-drop event to be propagated into the viewport as FUDGE-Event
         * @param _type
         * @param _on
         */
        activateDragDropEvent(_type, _on) {
            if (_type == "\u0192dragstart" /* START */)
                this.canvas.draggable = _on;
            this.activateEvent(this.canvas, _type, this.hndDragDropEvent, _on);
        }
        /**
         * De- / Activates the wheel event to be propagated into the viewport as FUDGE-Event
         * @param _type
         * @param _on
         */
        activateWheelEvent(_type, _on) {
            this.activateEvent(this.canvas, _type, this.hndWheelEvent, _on);
        }
        /**
         * Add position of the pointer mapped to canvas-coordinates as canvasX, canvasY to the event
         * @param event
         */
        addCanvasPosition(event) {
            event.canvasX = this.canvas.width * event.pointerX / event.clientRect.width;
            event.canvasY = this.canvas.height * event.pointerY / event.clientRect.height;
        }
        activateEvent(_target, _type, _handler, _on) {
            _type = _type.slice(1); // chip the ƒlorentin
            if (_on)
                _target.addEventListener(_type, _handler);
            else
                _target.removeEventListener(_type, _handler);
        }
        hndComponentEvent(_event) {
            Fudge.Debug.log(_event);
        }
        // #endregion
        /**
         * Creates an outputstring as visual representation of this viewports scenegraph. Called for the passed node and recursive for all its children.
         * @param _fudgeNode The node to create a scenegraphentry for.
         */
        createSceneGraph(_fudgeNode) {
            // TODO: move to debug-class
            let output = "";
            for (let name in _fudgeNode.getChildren()) {
                let child = _fudgeNode.getChildren()[name];
                output += "\n";
                let current = child;
                if (current.getParent() && current.getParent().getParent())
                    output += "|";
                while (current.getParent() && current.getParent().getParent()) {
                    output += "   ";
                    current = current.getParent();
                }
                output += "'--";
                output += child.name;
                output += this.createSceneGraph(child);
            }
            return output;
        }
    }
    Fudge.Viewport = Viewport;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Framing describes how to map a rectangle into a given frame
     * and how points in the frame correspond to points in the resulting rectangle
     */
    class Framing extends Fudge.Mutable {
        reduceMutator(_mutator) { }
    }
    Fudge.Framing = Framing;
    /**
     * The resulting rectangle has a fixed width and height and display should scale to fit the frame
     * Points are scaled in the same ratio
     */
    class FramingFixed extends Framing {
        constructor() {
            super(...arguments);
            this.width = 300;
            this.height = 150;
        }
        setSize(_width, _height) {
            this.width = _width;
            this.height = _height;
        }
        getPoint(_pointInFrame, _rectFrame) {
            let result = {
                x: this.width * (_pointInFrame.x - _rectFrame.x) / _rectFrame.width,
                y: this.height * (_pointInFrame.y - _rectFrame.y) / _rectFrame.height
            };
            return result;
        }
        getPointInverse(_point, _rect) {
            let result = {
                x: _point.x * _rect.width / this.width + _rect.x,
                y: _point.y * _rect.height / this.height + _rect.y
            };
            return result;
        }
        getRect(_rectFrame) {
            return { x: 0, y: 0, width: this.width, height: this.height };
        }
    }
    Fudge.FramingFixed = FramingFixed;
    /**
     * Width and height of the resulting rectangle are fractions of those of the frame, scaled by normed values normWidth and normHeight.
     * Display should scale to fit the frame and points are scaled in the same ratio
     */
    class FramingScaled extends Framing {
        constructor() {
            super(...arguments);
            this.normWidth = 1.0;
            this.normHeight = 1.0;
        }
        setScale(_normWidth, _normHeight) {
            this.normWidth = _normWidth;
            this.normHeight = _normHeight;
        }
        getPoint(_pointInFrame, _rectFrame) {
            let result = {
                x: this.normWidth * (_pointInFrame.x - _rectFrame.x),
                y: this.normHeight * (_pointInFrame.y - _rectFrame.y)
            };
            return result;
        }
        getPointInverse(_point, _rect) {
            let result = {
                x: _point.x / this.normWidth + _rect.x,
                y: _point.y / this.normHeight + _rect.y
            };
            return result;
        }
        getRect(_rectFrame) {
            return { x: 0, y: 0, width: this.normWidth * _rectFrame.width, height: this.normHeight * _rectFrame.height };
        }
    }
    Fudge.FramingScaled = FramingScaled;
    /**
     * The resulting rectangle fits into a margin given as fractions of the size of the frame given by normAnchor
     * plus an absolute padding given by pixelBorder. Display should fit into this.
     */
    class FramingComplex extends Framing {
        constructor() {
            super(...arguments);
            this.margin = { left: 0, top: 0, right: 0, bottom: 0 };
            this.padding = { left: 0, top: 0, right: 0, bottom: 0 };
        }
        getPoint(_pointInFrame, _rectFrame) {
            let result = {
                x: _pointInFrame.x - this.padding.left - this.margin.left * _rectFrame.width,
                y: _pointInFrame.y - this.padding.top - this.margin.top * _rectFrame.height
            };
            return result;
        }
        getPointInverse(_point, _rect) {
            let result = {
                x: _point.x + this.padding.left + this.margin.left * _rect.width,
                y: _point.y + this.padding.top + this.margin.top * _rect.height
            };
            return result;
        }
        getRect(_rectFrame) {
            if (!_rectFrame)
                return null;
            let minX = _rectFrame.x + this.margin.left * _rectFrame.width + this.padding.left;
            let minY = _rectFrame.y + this.margin.top * _rectFrame.height + this.padding.top;
            let maxX = _rectFrame.x + (1 - this.margin.right) * _rectFrame.width - this.padding.right;
            let maxY = _rectFrame.y + (1 - this.margin.bottom) * _rectFrame.height - this.padding.bottom;
            let rect = { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
            return rect;
        }
        getMutator() {
            return { margin: this.margin, padding: this.padding };
        }
    }
    Fudge.FramingComplex = FramingComplex;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Simple class for 3x3 matrix operations (This class can only handle 2D
     * transformations. Could be removed after applying full 2D compatibility to Mat4).
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Matrix3x3 {
        constructor() {
            this.data = [
                1, 0, 0,
                0, 1, 0,
                0, 0, 1
            ];
        }
        static projection(_width, _height) {
            let matrix = new Matrix3x3;
            matrix.data = [
                2 / _width, 0, 0,
                0, -2 / _height, 0,
                -1, 1, 1
            ];
            return matrix;
        }
        get Data() {
            return this.data;
        }
        identity() {
            return new Matrix3x3;
        }
        translate(_matrix, _xTranslation, _yTranslation) {
            return this.multiply(_matrix, this.translation(_xTranslation, _yTranslation));
        }
        rotate(_matrix, _angleInDegrees) {
            return this.multiply(_matrix, this.rotation(_angleInDegrees));
        }
        scale(_matrix, _xScale, _yscale) {
            return this.multiply(_matrix, this.scaling(_xScale, _yscale));
        }
        multiply(_a, _b) {
            let a00 = _a.data[0 * 3 + 0];
            let a01 = _a.data[0 * 3 + 1];
            let a02 = _a.data[0 * 3 + 2];
            let a10 = _a.data[1 * 3 + 0];
            let a11 = _a.data[1 * 3 + 1];
            let a12 = _a.data[1 * 3 + 2];
            let a20 = _a.data[2 * 3 + 0];
            let a21 = _a.data[2 * 3 + 1];
            let a22 = _a.data[2 * 3 + 2];
            let b00 = _b.data[0 * 3 + 0];
            let b01 = _b.data[0 * 3 + 1];
            let b02 = _b.data[0 * 3 + 2];
            let b10 = _b.data[1 * 3 + 0];
            let b11 = _b.data[1 * 3 + 1];
            let b12 = _b.data[1 * 3 + 2];
            let b20 = _b.data[2 * 3 + 0];
            let b21 = _b.data[2 * 3 + 1];
            let b22 = _b.data[2 * 3 + 2];
            let matrix = new Matrix3x3;
            matrix.data = [
                b00 * a00 + b01 * a10 + b02 * a20,
                b00 * a01 + b01 * a11 + b02 * a21,
                b00 * a02 + b01 * a12 + b02 * a22,
                b10 * a00 + b11 * a10 + b12 * a20,
                b10 * a01 + b11 * a11 + b12 * a21,
                b10 * a02 + b11 * a12 + b12 * a22,
                b20 * a00 + b21 * a10 + b22 * a20,
                b20 * a01 + b21 * a11 + b22 * a21,
                b20 * a02 + b21 * a12 + b22 * a22
            ];
            return matrix;
        }
        translation(_xTranslation, _yTranslation) {
            let matrix = new Matrix3x3;
            matrix.data = [
                1, 0, 0,
                0, 1, 0,
                _xTranslation, _yTranslation, 1
            ];
            return matrix;
        }
        scaling(_xScale, _yScale) {
            let matrix = new Matrix3x3;
            matrix.data = [
                _xScale, 0, 0,
                0, _yScale, 0,
                0, 0, 1
            ];
            return matrix;
        }
        rotation(_angleInDegrees) {
            let angleInDegrees = 360 - _angleInDegrees;
            let angleInRadians = angleInDegrees * Math.PI / 180;
            let sin = Math.sin(angleInRadians);
            let cos = Math.cos(angleInRadians);
            let matrix = new Matrix3x3;
            matrix.data = [
                cos, -sin, 0,
                sin, cos, 0,
                0, 0, 1
            ];
            return matrix;
        }
    }
    Fudge.Matrix3x3 = Matrix3x3;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Simple class for 4x4 transformation matrix operations.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Matrix4x4 extends Fudge.Mutable {
        constructor() {
            super();
            this.data = new Float32Array([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ]);
        }
        // Transformation methods.######################################################################################
        static get identity() {
            return new Matrix4x4;
        }
        /**
         * Wrapper function that multiplies a passed matrix by a scalingmatrix with passed x-, y- and z-multipliers.
         * @param _matrix The matrix to multiply.
         * @param _x The scaling multiplier for the x-Axis.
         * @param _y The scaling multiplier for the y-Axis.
         * @param _z The scaling multiplier for the z-Axis.
         */
        static scale(_matrix, _x, _y, _z) {
            return Matrix4x4.multiply(_matrix, this.scaling(_x, _y, _z));
        }
        /**
         * Computes and returns the product of two passed matrices.
         * @param _a The matrix to multiply.
         * @param _b The matrix to multiply by.
         */
        static multiply(_a, _b) {
            let matrix = new Matrix4x4();
            let a00 = _a.data[0 * 4 + 0];
            let a01 = _a.data[0 * 4 + 1];
            let a02 = _a.data[0 * 4 + 2];
            let a03 = _a.data[0 * 4 + 3];
            let a10 = _a.data[1 * 4 + 0];
            let a11 = _a.data[1 * 4 + 1];
            let a12 = _a.data[1 * 4 + 2];
            let a13 = _a.data[1 * 4 + 3];
            let a20 = _a.data[2 * 4 + 0];
            let a21 = _a.data[2 * 4 + 1];
            let a22 = _a.data[2 * 4 + 2];
            let a23 = _a.data[2 * 4 + 3];
            let a30 = _a.data[3 * 4 + 0];
            let a31 = _a.data[3 * 4 + 1];
            let a32 = _a.data[3 * 4 + 2];
            let a33 = _a.data[3 * 4 + 3];
            let b00 = _b.data[0 * 4 + 0];
            let b01 = _b.data[0 * 4 + 1];
            let b02 = _b.data[0 * 4 + 2];
            let b03 = _b.data[0 * 4 + 3];
            let b10 = _b.data[1 * 4 + 0];
            let b11 = _b.data[1 * 4 + 1];
            let b12 = _b.data[1 * 4 + 2];
            let b13 = _b.data[1 * 4 + 3];
            let b20 = _b.data[2 * 4 + 0];
            let b21 = _b.data[2 * 4 + 1];
            let b22 = _b.data[2 * 4 + 2];
            let b23 = _b.data[2 * 4 + 3];
            let b30 = _b.data[3 * 4 + 0];
            let b31 = _b.data[3 * 4 + 1];
            let b32 = _b.data[3 * 4 + 2];
            let b33 = _b.data[3 * 4 + 3];
            matrix.data = new Float32Array([
                b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
                b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
                b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
                b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
                b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
                b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
                b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
                b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
                b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
                b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
                b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
                b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
                b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
                b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
                b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
                b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33
            ]);
            return matrix;
        }
        /**
         * Computes and returns the inverse of a passed matrix.
         * @param _matrix Tha matrix to compute the inverse of.
         */
        static inverse(_matrix) {
            let m00 = _matrix.data[0 * 4 + 0];
            let m01 = _matrix.data[0 * 4 + 1];
            let m02 = _matrix.data[0 * 4 + 2];
            let m03 = _matrix.data[0 * 4 + 3];
            let m10 = _matrix.data[1 * 4 + 0];
            let m11 = _matrix.data[1 * 4 + 1];
            let m12 = _matrix.data[1 * 4 + 2];
            let m13 = _matrix.data[1 * 4 + 3];
            let m20 = _matrix.data[2 * 4 + 0];
            let m21 = _matrix.data[2 * 4 + 1];
            let m22 = _matrix.data[2 * 4 + 2];
            let m23 = _matrix.data[2 * 4 + 3];
            let m30 = _matrix.data[3 * 4 + 0];
            let m31 = _matrix.data[3 * 4 + 1];
            let m32 = _matrix.data[3 * 4 + 2];
            let m33 = _matrix.data[3 * 4 + 3];
            let tmp0 = m22 * m33;
            let tmp1 = m32 * m23;
            let tmp2 = m12 * m33;
            let tmp3 = m32 * m13;
            let tmp4 = m12 * m23;
            let tmp5 = m22 * m13;
            let tmp6 = m02 * m33;
            let tmp7 = m32 * m03;
            let tmp8 = m02 * m23;
            let tmp9 = m22 * m03;
            let tmp10 = m02 * m13;
            let tmp11 = m12 * m03;
            let tmp12 = m20 * m31;
            let tmp13 = m30 * m21;
            let tmp14 = m10 * m31;
            let tmp15 = m30 * m11;
            let tmp16 = m10 * m21;
            let tmp17 = m20 * m11;
            let tmp18 = m00 * m31;
            let tmp19 = m30 * m01;
            let tmp20 = m00 * m21;
            let tmp21 = m20 * m01;
            let tmp22 = m00 * m11;
            let tmp23 = m10 * m01;
            let t0 = (tmp0 * m11 + tmp3 * m21 + tmp4 * m31) -
                (tmp1 * m11 + tmp2 * m21 + tmp5 * m31);
            let t1 = (tmp1 * m01 + tmp6 * m21 + tmp9 * m31) -
                (tmp0 * m01 + tmp7 * m21 + tmp8 * m31);
            let t2 = (tmp2 * m01 + tmp7 * m11 + tmp10 * m31) -
                (tmp3 * m01 + tmp6 * m11 + tmp11 * m31);
            let t3 = (tmp5 * m01 + tmp8 * m11 + tmp11 * m21) -
                (tmp4 * m01 + tmp9 * m11 + tmp10 * m21);
            let d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);
            let matrix = new Matrix4x4;
            matrix.data = new Float32Array([
                d * t0,
                d * t1,
                d * t2,
                d * t3,
                d * ((tmp1 * m10 + tmp2 * m20 + tmp5 * m30) - (tmp0 * m10 + tmp3 * m20 + tmp4 * m30)),
                d * ((tmp0 * m00 + tmp7 * m20 + tmp8 * m30) - (tmp1 * m00 + tmp6 * m20 + tmp9 * m30)),
                d * ((tmp3 * m00 + tmp6 * m10 + tmp11 * m30) - (tmp2 * m00 + tmp7 * m10 + tmp10 * m30)),
                d * ((tmp4 * m00 + tmp9 * m10 + tmp10 * m20) - (tmp5 * m00 + tmp8 * m10 + tmp11 * m20)),
                d * ((tmp12 * m13 + tmp15 * m23 + tmp16 * m33) - (tmp13 * m13 + tmp14 * m23 + tmp17 * m33)),
                d * ((tmp13 * m03 + tmp18 * m23 + tmp21 * m33) - (tmp12 * m03 + tmp19 * m23 + tmp20 * m33)),
                d * ((tmp14 * m03 + tmp19 * m13 + tmp22 * m33) - (tmp15 * m03 + tmp18 * m13 + tmp23 * m33)),
                d * ((tmp17 * m03 + tmp20 * m13 + tmp23 * m23) - (tmp16 * m03 + tmp21 * m13 + tmp22 * m23)),
                d * ((tmp14 * m22 + tmp17 * m32 + tmp13 * m12) - (tmp16 * m32 + tmp12 * m12 + tmp15 * m22)),
                d * ((tmp20 * m32 + tmp12 * m02 + tmp19 * m22) - (tmp18 * m22 + tmp21 * m32 + tmp13 * m02)),
                d * ((tmp18 * m12 + tmp23 * m32 + tmp15 * m02) - (tmp22 * m32 + tmp14 * m02 + tmp19 * m12)),
                d * ((tmp22 * m22 + tmp16 * m02 + tmp21 * m12) - (tmp20 * m12 + tmp23 * m22 + tmp17 * m02)) // [15]
            ]);
            return matrix;
        }
        /**
         * Computes and returns a rotationmatrix that aligns a transformations z-axis with the vector between it and its target.
         * @param _transformPosition The x,y and z-coordinates of the object to rotate.
         * @param _targetPosition The position to look at.
         */
        static lookAt(_transformPosition, _targetPosition) {
            let matrix = new Matrix4x4;
            let transformPosition = new Fudge.Vector3(_transformPosition.x, _transformPosition.y, _transformPosition.z);
            let targetPosition = new Fudge.Vector3(_targetPosition.x, _targetPosition.y, _targetPosition.z);
            let zAxis = Fudge.Vector3.subtract(transformPosition, targetPosition);
            zAxis = Fudge.Vector3.normalize(zAxis);
            let xAxis;
            let yAxis;
            if (zAxis.Data != Fudge.Vector3.up.Data) { // TODO: verify intention - this is the comparison of references...
                xAxis = Fudge.Vector3.normalize(Fudge.Vector3.cross(Fudge.Vector3.up, zAxis));
                yAxis = Fudge.Vector3.normalize(Fudge.Vector3.cross(zAxis, xAxis));
            }
            else {
                xAxis = Fudge.Vector3.normalize(Fudge.Vector3.subtract(transformPosition, targetPosition));
                yAxis = Fudge.Vector3.normalize(Fudge.Vector3.cross(Fudge.Vector3.forward, xAxis));
                zAxis = Fudge.Vector3.normalize(Fudge.Vector3.cross(xAxis, yAxis));
            }
            matrix.data = new Float32Array([
                xAxis.x, xAxis.y, xAxis.z, 0,
                yAxis.x, yAxis.y, yAxis.z, 0,
                zAxis.x, zAxis.y, zAxis.z, 0,
                transformPosition.x,
                transformPosition.y,
                transformPosition.z,
                1
            ]);
            return matrix;
        }
        // Projection methods.######################################################################################
        /**
         * Computes and returns a matrix that applies perspective to an object, if its transform is multiplied by it.
         * @param _aspect The aspect ratio between width and height of projectionspace.(Default = canvas.clientWidth / canvas.ClientHeight)
         * @param _fieldOfViewInDegrees The field of view in Degrees. (Default = 45)
         * @param _near The near clipspace border on the z-axis.
         * @param _far The far clipspace borer on the z-axis.
         */
        static centralProjection(_aspect, _fieldOfViewInDegrees, _near, _far, _direction) {
            let fieldOfViewInRadians = _fieldOfViewInDegrees * Math.PI / 180;
            let f = Math.tan(0.5 * (Math.PI - fieldOfViewInRadians));
            let rangeInv = 1.0 / (_near - _far);
            let matrix = new Matrix4x4;
            matrix.data = new Float32Array([
                f, 0, 0, 0,
                0, f, 0, 0,
                0, 0, (_near + _far) * rangeInv, -1,
                0, 0, _near * _far * rangeInv * 2, 0
            ]);
            if (_direction == Fudge.FIELD_OF_VIEW.DIAGONAL) {
                _aspect = Math.sqrt(_aspect);
                matrix.data[0] = f / _aspect;
                matrix.data[5] = f * _aspect;
            }
            else if (_direction == Fudge.FIELD_OF_VIEW.VERTICAL)
                matrix.data[0] = f / _aspect;
            else //FOV_DIRECTION.HORIZONTAL
                matrix.data[5] = f * _aspect;
            return matrix;
        }
        /**
         * Computes and returns a matrix that applies orthographic projection to an object, if its transform is multiplied by it.
         * @param _left The positionvalue of the projectionspace's left border.
         * @param _right The positionvalue of the projectionspace's right border.
         * @param _bottom The positionvalue of the projectionspace's bottom border.
         * @param _top The positionvalue of the projectionspace's top border.
         * @param _near The positionvalue of the projectionspace's near border.
         * @param _far The positionvalue of the projectionspace's far border
         */
        static orthographicProjection(_left, _right, _bottom, _top, _near = -400, _far = 400) {
            let matrix = new Matrix4x4;
            matrix.data = new Float32Array([
                2 / (_right - _left), 0, 0, 0,
                0, 2 / (_top - _bottom), 0, 0,
                0, 0, 2 / (_near - _far), 0,
                (_left + _right) / (_left - _right),
                (_bottom + _top) / (_bottom - _top),
                (_near + _far) / (_near - _far),
                1
            ]);
            return matrix;
        }
        /**
        * Wrapper function that multiplies a passed matrix by a translationmatrix with passed x-, y- and z-values.
        * @param _matrix The matrix to multiply.
        * @param _xTranslation The x-value of the translation.
        * @param _yTranslation The y-value of the translation.
        * @param _zTranslation The z-value of the translation.
        */
        static translate(_matrix, _xTranslation, _yTranslation, _zTranslation) {
            return Matrix4x4.multiply(_matrix, this.translation(_xTranslation, _yTranslation, _zTranslation));
        }
        /**
        * Wrapper function that multiplies a passed matrix by a rotationmatrix with passed x-rotation.
        * @param _matrix The matrix to multiply.
        * @param _angleInDegrees The angle to rotate by.
        */
        static rotateX(_matrix, _angleInDegrees) {
            return Matrix4x4.multiply(_matrix, this.xRotation(_angleInDegrees));
        }
        /**
         * Wrapper function that multiplies a passed matrix by a rotationmatrix with passed y-rotation.
         * @param _matrix The matrix to multiply.
         * @param _angleInDegrees The angle to rotate by.
         */
        static rotateY(_matrix, _angleInDegrees) {
            return Matrix4x4.multiply(_matrix, this.yRotation(_angleInDegrees));
        }
        /**
         * Wrapper function that multiplies a passed matrix by a rotationmatrix with passed z-rotation.
         * @param _matrix The matrix to multiply.
         * @param _angleInDegrees The angle to rotate by.
         */
        static rotateZ(_matrix, _angleInDegrees) {
            return Matrix4x4.multiply(_matrix, this.zRotation(_angleInDegrees));
        }
        // Translation methods.######################################################################################
        /**
         * Returns a matrix that translates coordinates on the x-, y- and z-axis when multiplied by.
         * @param _xTranslation The x-value of the translation.
         * @param _yTranslation The y-value of the translation.
         * @param _zTranslation The z-value of the translation.
         */
        static translation(_xTranslation, _yTranslation, _zTranslation) {
            let matrix = new Matrix4x4;
            matrix.data = new Float32Array([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                _xTranslation, _yTranslation, _zTranslation, 1
            ]);
            return matrix;
        }
        // Rotation methods.######################################################################################
        /**
         * Returns a matrix that rotates coordinates on the x-axis when multiplied by.
         * @param _angleInDegrees The value of the rotation.
         */
        static xRotation(_angleInDegrees) {
            let matrix = new Matrix4x4;
            let angleInRadians = _angleInDegrees * Math.PI / 180;
            let sin = Math.sin(angleInRadians);
            let cos = Math.cos(angleInRadians);
            matrix.data = new Float32Array([
                1, 0, 0, 0,
                0, cos, sin, 0,
                0, -sin, cos, 0,
                0, 0, 0, 1
            ]);
            return matrix;
        }
        /**
         * Returns a matrix that rotates coordinates on the y-axis when multiplied by.
         * @param _angleInDegrees The value of the rotation.
         */
        static yRotation(_angleInDegrees) {
            let matrix = new Matrix4x4;
            let angleInRadians = _angleInDegrees * Math.PI / 180;
            let sin = Math.sin(angleInRadians);
            let cos = Math.cos(angleInRadians);
            matrix.data = new Float32Array([
                cos, 0, -sin, 0,
                0, 1, 0, 0,
                sin, 0, cos, 0,
                0, 0, 0, 1
            ]);
            return matrix;
        }
        /**
         * Returns a matrix that rotates coordinates on the z-axis when multiplied by.
         * @param _angleInDegrees The value of the rotation.
         */
        static zRotation(_angleInDegrees) {
            let matrix = new Matrix4x4;
            let angleInRadians = _angleInDegrees * Math.PI / 180;
            let sin = Math.sin(angleInRadians);
            let cos = Math.cos(angleInRadians);
            matrix.data = new Float32Array([
                cos, sin, 0, 0,
                -sin, cos, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ]);
            return matrix;
        }
        // Scaling methods.######################################################################################
        /**
         * Returns a matrix that scales coordinates on the x-, y- and z-axis when multiplied by.
         * @param _x The scaling multiplier for the x-axis.
         * @param _y The scaling multiplier for the y-axis.
         * @param _z The scaling multiplier for the z-axis.
         */
        static scaling(_x, _y, _z) {
            let matrix = new Matrix4x4;
            matrix.data = new Float32Array([
                _x, 0, 0, 0,
                0, _y, 0, 0,
                0, 0, _z, 0,
                0, 0, 0, 1
            ]);
            return matrix;
        }
        serialize() {
            // TODO: save translation, rotation and scale as vectors for readability and manipulation
            let serialization = {
                data: Array.from(this.data)
            };
            return serialization;
        }
        deserialize(_serialization) {
            this.data = new Float32Array(_serialization.data);
            return this;
        }
        getMutator() {
            let mutator = {
                data: Object.assign({}, this.data)
            };
            return mutator;
        }
        reduceMutator(_mutator) { }
    }
    Fudge.Matrix4x4 = Matrix4x4;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Class storing and manipulating a threedimensional vector
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Vector3 {
        constructor(_x = 0, _y = 0, _z = 0) {
            this.data = [_x, _y, _z];
        }
        // TODO: implement equals-functions
        // Get methods.######################################################################################
        get Data() {
            return this.data;
        }
        get x() {
            return this.data[0];
        }
        get y() {
            return this.data[1];
        }
        get z() {
            return this.data[2];
        }
        /**
         * The up-Vector (0, 1, 0)
         */
        static get up() {
            let vector = new Vector3(0, 1, 0);
            return vector;
        }
        /**
         * The down-Vector (0, -1, 0)
         */
        static get down() {
            let vector = new Vector3(0, -1, 0);
            return vector;
        }
        /**
         * The forward-Vector (0, 0, 1)
         */
        static get forward() {
            let vector = new Vector3(0, 0, 1);
            return vector;
        }
        /**
         * The backward-Vector (0, 0, -1)
         */
        static get backward() {
            let vector = new Vector3(0, 0, -1);
            return vector;
        }
        /**
         * The right-Vector (1, 0, 0)
         */
        static get right() {
            let vector = new Vector3(1, 0, 0);
            return vector;
        }
        /**
         * The left-Vector (-1, 0, 0)
         */
        static get left() {
            let vector = new Vector3(-1, 0, 0);
            return vector;
        }
        // Vectormath methods.######################################################################################
        /**
         * Adds two vectors.
         * @param _a The first vector to add
         * @param _b The second vector to add
         * @returns A new vector representing the sum of the given vectors
         */
        static add(_a, _b) {
            let vector = new Vector3(_a.x + _b.x, _a.y + _b.y, _a.z + _b.z);
            return vector;
        }
        /**
        * Sums up multiple vectors.
        * @param _a The first vector to add
        * @param _b The second vector to add
        * @returns A new vector representing the sum of the given vectors
        */
        static sum(..._vectors) {
            let result = new Vector3();
            for (let vector of _vectors)
                result.data = [result.x + vector.x, result.y + vector.y, result.z + vector.z];
            return result;
        }
        /**
         * Subtracts two vectors.
         * @param _a The vector to subtract from.
         * @param _b The vector to subtract.
         * @returns A new vector representing the difference of the given vectors
         */
        static subtract(_a, _b) {
            let vector = new Vector3;
            vector.data = [_a.x - _b.x, _a.y - _b.y, _a.z - _b.z];
            return vector;
        }
        /**
         * Computes the crossproduct of 2 vectors.
         * @param _a The vector to multiply.
         * @param _b The vector to multiply by.
         * @returns A new vector representing the crossproduct of the given vectors
         */
        static cross(_a, _b) {
            let vector = new Vector3;
            vector.data = [
                _a.y * _b.z - _a.z * _b.y,
                _a.z * _b.x - _a.x * _b.z,
                _a.x * _b.y - _a.y * _b.x
            ];
            return vector;
        }
        /**
         * Computes the dotproduct of 2 vectors.
         * @param _a The vector to multiply.
         * @param _b The vector to multiply by.
         * @returns A new vector representing the dotproduct of the given vectors
         */
        static dot(_a, _b) {
            let scalarProduct = _a.x * _b.x + _a.y * _b.y + _a.z * _b.z;
            return scalarProduct;
        }
        /**
         * Normalizes a vector.
         * @param _vector The vector to normalize.
         * @returns A new vector representing the given vector scaled to the length of 1
         */
        static normalize(_vector) {
            let length = Math.sqrt(_vector.x * _vector.x + _vector.y * _vector.y + _vector.z * _vector.z);
            let vector = new Vector3;
            // make sure we don't divide by 0. TODO: see if it's appropriate to use try/catch here
            if (length > 0.00001) {
                vector.data = [_vector.x / length, _vector.y / length, _vector.z / length];
            }
            else {
                vector.data = [0, 0, 0];
            }
            return vector;
        }
        /**
         * Retrieve the vector as an array with three elements
         */
        getArray() {
            return new Float32Array(this.data);
        }
    }
    Fudge.Vector3 = Vector3;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Abstract base class for all meshes.
     * Meshes provide indexed vertices, the order of indices to create trigons and normals, and texture coordinates
     *
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Mesh {
        static getBufferSpecification() {
            return { size: 3, dataType: WebGL2RenderingContext.FLOAT, normalize: false, stride: 0, offset: 0 };
        }
        getVertexCount() {
            return this.vertices.length / Mesh.getBufferSpecification().size;
        }
        getIndexCount() {
            return this.indices.length;
        }
    }
    Fudge.Mesh = Mesh;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Generate a simple cube with edges of length 1, each face consisting of two trigons
     * ```text
     *            4____7
     *           0/__3/|
     *            ||5_||6
     *           1|/_2|/
     * ```
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class MeshCube extends Fudge.Mesh {
        constructor() {
            super();
            this.create();
        }
        create() {
            this.vertices = this.createVertices();
            this.indices = this.createIndices();
            this.textureUVs = this.createTextureUVs();
            this.normalsFace = this.createFaceNormals();
        }
        serialize() {
            let serialization = {};
            serialization[this.constructor.name] = this;
            return serialization;
        }
        deserialize(_serialization) {
            this.create(); // TODO: must not be created, if an identical mesh already exists
            return this;
        }
        createVertices() {
            let vertices = new Float32Array([
                // First wrap
                // front
                /*0*/ -1, 1, 1, /*1*/ -1, -1, 1, /*2*/ 1, -1, 1, /*3*/ 1, 1, 1,
                // back
                /*4*/ -1, 1, -1, /* 5*/ -1, -1, -1, /* 6*/ 1, -1, -1, /* 7*/ 1, 1, -1,
                // Second wrap
                // front
                /*0*/ -1, 1, 1, /*1*/ -1, -1, 1, /*2*/ 1, -1, 1, /*3*/ 1, 1, 1,
                // back
                /*4*/ -1, 1, -1, /* 5*/ -1, -1, -1, /* 6*/ 1, -1, -1, /* 7*/ 1, 1, -1
            ]);
            // scale down to a length of 1 for all edges
            vertices = vertices.map(_value => _value / 2);
            return vertices;
        }
        createIndices() {
            let indices = new Uint16Array([
                // First wrap
                // front
                1, 2, 0, 2, 3, 0,
                // right
                2, 6, 3, 6, 7, 3,
                // back
                6, 5, 7, 5, 4, 7,
                // Second wrap
                // left
                5 + 8, 1 + 8, 4 + 8, 1 + 8, 0 + 8, 4 + 8,
                // top
                4 + 8, 0 + 8, 3 + 8, 7 + 8, 4 + 8, 3 + 8,
                // bottom
                5 + 8, 6 + 8, 1 + 8, 6 + 8, 2 + 8, 1 + 8
                /*,
                // left
                4, 5, 1, 4, 1, 0,
                // top
                4, 0, 3, 4, 3, 7,
                // bottom
                1, 5, 6, 1, 6, 2
                */
            ]);
            return indices;
        }
        createTextureUVs() {
            let textureUVs = new Float32Array([
                // First wrap
                // front
                /*0*/ 0, 0, /*1*/ 0, 1, /*2*/ 1, 1, /*3*/ 1, 0,
                // back
                /*4*/ 3, 0, /*5*/ 3, 1, /*6*/ 2, 1, /*7*/ 2, 0,
                // Second wrap
                // front
                /*0*/ 1, 0, /*1*/ 1, 1, /*2*/ 1, 2, /*3*/ 1, -1,
                // back
                /*4*/ 0, 0, /*5*/ 0, 1, /*6*/ 0, 2, /*7*/ 0, -1
            ]);
            return textureUVs;
        }
        createFaceNormals() {
            let normals = new Float32Array([
                // for each triangle, the last vertex of the three defining refers to the normalvector when using flat shading
                // First wrap
                // front
                /*0*/ 0, 0, 1, /*1*/ 0, 0, 0, /*2*/ 0, 0, 0, /*3*/ 1, 0, 0,
                // back
                /*4*/ 0, 0, 0, /*5*/ 0, 0, 0, /*6*/ 0, 0, 0, /*7*/ 0, 0, -1,
                // Second wrap
                // front
                /*0*/ 0, 0, 0, /*1*/ 0, -1, 0, /*2*/ 0, 0, 0, /*3*/ 0, 1, 0,
                // back
                /*4*/ -1, 0, 0, /*5*/ 0, 0, 0, /*6*/ 0, 0, 0, /*7*/ 0, 0, 0
            ]);
            //normals = this.createVertices();
            return normals;
        }
    }
    Fudge.MeshCube = MeshCube;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Generate a simple pyramid with edges at the base of length 1 and a height of 1. The sides consisting of one, the base of two trigons
     * ```text
     *               4
     *              /\`.
     *            3/__\_\ 2
     *           0/____\/1
     * ```
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class MeshPyramid extends Fudge.Mesh {
        constructor() {
            super();
            this.create();
        }
        create() {
            this.vertices = this.createVertices();
            this.indices = this.createIndices();
            this.textureUVs = this.createTextureUVs();
            this.normalsFace = this.createFaceNormals();
        }
        serialize() {
            let serialization = {};
            serialization[this.constructor.name] = this;
            return serialization;
        }
        deserialize(_serialization) {
            this.create(); // TODO: must not be created, if an identical mesh already exists
            return this;
        }
        createVertices() {
            let vertices = new Float32Array([
                // floor
                /*0*/ -1, 0, 1, /*1*/ 1, 0, 1, /*2*/ 1, 0, -1, /*3*/ -1, 0, -1,
                // tip
                /*4*/ 0, 2, 0,
                // floor again for texturing and normals
                /*5*/ -1, 0, 1, /*6*/ 1, 0, 1, /*7*/ 1, 0, -1, /*8*/ -1, 0, -1
            ]);
            // scale down to a length of 1 for bottom edges and height
            vertices = vertices.map(_value => _value / 2);
            return vertices;
        }
        createIndices() {
            let indices = new Uint16Array([
                // front
                4, 0, 1,
                // right
                4, 1, 2,
                // back
                4, 2, 3,
                // left
                4, 3, 0,
                // bottom
                5 + 0, 5 + 2, 5 + 1, 5 + 0, 5 + 3, 5 + 2
            ]);
            return indices;
        }
        createTextureUVs() {
            let textureUVs = new Float32Array([
                // front
                /*0*/ 0, 1, /*1*/ 0.5, 1, /*2*/ 1, 1, /*3*/ 0.5, 1,
                // back
                /*4*/ 0.5, 0,
                /*5*/ 0, 0, /*6*/ 1, 0, /*7*/ 1, 1, /*8*/ 0, 1
            ]);
            return textureUVs;
        }
        createFaceNormals() {
            let normals = [];
            let vertices = [];
            for (let v = 0; v < this.vertices.length; v += 3)
                vertices.push(new Fudge.Vector3(this.vertices[v], this.vertices[v + 1], this.vertices[v + 2]));
            for (let i = 0; i < this.indices.length; i += 3) {
                let vertex = [this.indices[i], this.indices[i + 1], this.indices[i + 2]];
                let v0 = Fudge.Vector3.subtract(vertices[vertex[0]], vertices[vertex[1]]);
                let v1 = Fudge.Vector3.subtract(vertices[vertex[0]], vertices[vertex[2]]);
                let normal = Fudge.Vector3.normalize(Fudge.Vector3.cross(v1, v0));
                let index = vertex[2] * 3;
                normals[index] = normal.x;
                normals[index + 1] = normal.y;
                normals[index + 2] = normal.z;
            }
            normals.push(0, 0, 0);
            return new Float32Array(normals);
        }
    }
    Fudge.MeshPyramid = MeshPyramid;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Generate a simple quad with edges of length 1, the face consisting of two trigons
     * ```text
     *        0 __ 3
     *         |__|
     *        1    2
     * ```
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class MeshQuad extends Fudge.Mesh {
        constructor() {
            super();
            this.create();
        }
        create() {
            this.vertices = this.createVertices();
            this.indices = this.createIndices();
            this.textureUVs = this.createTextureUVs();
        }
        serialize() {
            let serialization = {};
            serialization[this.constructor.name] = this;
            return serialization;
        }
        deserialize(_serialization) {
            this.create(); // TODO: must not be created, if an identical mesh already exists
            return this;
        }
        createVertices() {
            let vertices = new Float32Array([
                /*0*/ -1, 1, 0, /*1*/ -1, -1, 0, /*2*/ 1, -1, 0, /*3*/ 1, 1, 0
            ]);
            vertices = vertices.map(_value => _value / 2);
            return vertices;
        }
        createIndices() {
            let indices = new Uint16Array([
                0, 1, 2, 0, 2, 3
            ]);
            return indices;
        }
        createTextureUVs() {
            let textureUVs = new Float32Array([
                // front
                /*0*/ 0, 0, /*1*/ 0, 1, /*2*/ 1, 1, /*3*/ 1, 0
            ]);
            return textureUVs;
        }
        createFaceNormals() { return null; }
    }
    Fudge.MeshQuad = MeshQuad;
})(Fudge || (Fudge = {}));
/// <reference path="RenderOperator.ts"/>
var Fudge;
/// <reference path="RenderOperator.ts"/>
(function (Fudge) {
    /**
     * This class manages the references to render data used by nodes.
     * Multiple nodes may refer to the same data via their references to shader, coat and mesh
     */
    class Reference {
        constructor(_reference) {
            this.count = 0;
            this.reference = _reference;
        }
        getReference() {
            return this.reference;
        }
        increaseCounter() {
            this.count++;
            return this.count;
        }
        decreaseCounter() {
            if (this.count == 0)
                throw (new Error("Negative reference counter"));
            this.count--;
            return this.count;
        }
    }
    /**
     * Manages the handling of the ressources that are going to be rendered by [[RenderOperator]].
     * Stores the references to the shader, the coat and the mesh used for each node registered.
     * With these references, the already buffered data is retrieved when rendering.
     */
    class RenderManager extends Fudge.RenderOperator {
        // #region Adding
        /**
         * Register the node for rendering. Create a reference for it and increase the matching render-data references or create them first if necessary
         * @param _node
         */
        static addNode(_node) {
            if (this.nodes.get(_node))
                return;
            let cmpMaterial = _node.getComponent(Fudge.ComponentMaterial);
            if (!cmpMaterial)
                return;
            let shader = cmpMaterial.getMaterial().getShader();
            this.createReference(this.renderShaders, shader, this.createProgram);
            let coat = cmpMaterial.getMaterial().getCoat();
            this.createReference(this.renderCoats, coat, this.createParameter);
            let mesh = (_node.getComponent(Fudge.ComponentMesh)).getMesh();
            this.createReference(this.renderBuffers, mesh, this.createBuffers);
            let nodeReferences = { shader: shader, coat: coat, mesh: mesh, doneTransformToWorld: false };
            this.nodes.set(_node, nodeReferences);
        }
        /**
         * Register the node and its valid successors in the branch for rendering using [[addNode]]
         * @param _node
         */
        static addBranch(_node) {
            for (let node of _node.branch)
                try {
                    // may fail when some components are missing. TODO: cleanup
                    this.addNode(node);
                }
                catch (_e) {
                    console.log(_e);
                }
        }
        // #endregion
        // #region Removing
        /**
         * Unregister the node so that it won't be rendered any more. Decrease the render-data references and delete the node reference.
         * @param _node
         */
        static removeNode(_node) {
            let nodeReferences = this.nodes.get(_node);
            if (!nodeReferences)
                return;
            this.removeReference(this.renderShaders, nodeReferences.shader, this.deleteProgram);
            this.removeReference(this.renderCoats, nodeReferences.coat, this.deleteParameter);
            this.removeReference(this.renderBuffers, nodeReferences.mesh, this.deleteBuffers);
            this.nodes.delete(_node);
        }
        /**
         * Unregister the node and its valid successors in the branch to free renderer resources. Uses [[removeNode]]
         * @param _node
         */
        static removeBranch(_node) {
            for (let node of _node.branch)
                this.removeNode(node);
        }
        // #endregion
        // #region Updating
        /**
         * Reflect changes in the node concerning shader, coat and mesh, manage the render-data references accordingly and update the node references
         * @param _node
         */
        static updateNode(_node) {
            let nodeReferences = this.nodes.get(_node);
            if (!nodeReferences)
                return;
            let cmpMaterial = _node.getComponent(Fudge.ComponentMaterial);
            let shader = cmpMaterial.getMaterial().getShader();
            if (shader !== nodeReferences.shader) {
                this.removeReference(this.renderShaders, nodeReferences.shader, this.deleteProgram);
                this.createReference(this.renderShaders, shader, this.createProgram);
                nodeReferences.shader = shader;
            }
            let coat = cmpMaterial.getMaterial().getCoat();
            if (coat !== nodeReferences.coat) {
                this.removeReference(this.renderCoats, nodeReferences.coat, this.deleteParameter);
                this.createReference(this.renderCoats, coat, this.createParameter);
                nodeReferences.coat = coat;
            }
            let mesh = (_node.getComponent(Fudge.ComponentMesh)).getMesh();
            if (mesh !== nodeReferences.mesh) {
                this.removeReference(this.renderBuffers, nodeReferences.mesh, this.deleteBuffers);
                this.createReference(this.renderBuffers, mesh, this.createBuffers);
                nodeReferences.mesh = mesh;
            }
        }
        /**
         * Update the node and its valid successors in the branch using [[updateNode]]
         * @param _node
         */
        static updateBranch(_node) {
            for (let node of _node.branch)
                this.updateNode(node);
        }
        // #endregion
        // #region Lights
        static setLights(_lights) {
            // let renderLights: RenderLights = this.createRenderLights(_lights);
            for (let entry of this.renderShaders) {
                let renderShader = entry[1].getReference();
                this.setLightsInShader(renderShader, _lights);
            }
            // debugger;
        }
        // #endregion
        // #region Transformation & Rendering
        /**
         * Update all render data. After this, multiple viewports can render their associated data without updating the same data multiple times
         */
        static update() {
            this.recalculateAllNodeTransforms();
        }
        /**
         * Clear the offscreen renderbuffer with the given [[Color]]
         * @param _color
         */
        static clear(_color = null) {
            this.crc3.clearColor(_color.r, _color.g, _color.b, _color.a);
            this.crc3.clear(WebGL2RenderingContext.COLOR_BUFFER_BIT | WebGL2RenderingContext.DEPTH_BUFFER_BIT);
        }
        /**
         * Draws the branch starting with the given [[Node]] using the projection matrix given as _cameraMatrix.
         * If the node lacks a [[ComponentTransform]], respectively a worldMatrix, the matrix given as _matrix will be used to transform the node
         * or the identity matrix, if _matrix is null.
         * @param _node
         * @param _cameraMatrix
         * @param _world
         */
        static drawBranch(_node, _cmpCamera, _world) {
            let cmpTransform = _node.cmpTransform;
            let world = _world;
            if (cmpTransform)
                world = cmpTransform.world;
            if (!world)
                // neither ComponentTransform found nor world-transformation passed from parent -> use identity
                world = Fudge.Matrix4x4.identity;
            let finalTransform = world;
            let cmpPivot = _node.getComponent(Fudge.ComponentPivot);
            if (cmpPivot)
                finalTransform = Fudge.Matrix4x4.multiply(world, cmpPivot.local);
            // multiply camera matrix
            let projection = Fudge.Matrix4x4.multiply(_cmpCamera.ViewProjectionMatrix, finalTransform);
            this.drawNode(_node, finalTransform, projection);
            for (let name in _node.getChildren()) {
                let childNode = _node.getChildren()[name];
                this.drawBranch(childNode, _cmpCamera, world);
            }
        }
        static drawNode(_node, _finalTransform, _projection) {
            let references = this.nodes.get(_node);
            if (!references)
                return; // TODO: deal with partial references
            let bufferInfo = this.renderBuffers.get(references.mesh).getReference();
            let coatInfo = this.renderCoats.get(references.coat).getReference();
            let shaderInfo = this.renderShaders.get(references.shader).getReference();
            this.draw(shaderInfo, bufferInfo, coatInfo, _finalTransform, _projection);
        }
        /**
         * Recalculate the world matrix of all registered nodes respecting their hierarchical relation.
         */
        static recalculateAllNodeTransforms() {
            // inner function to be called in a for each node at the bottom of this function
            function markNodeToBeTransformed(_nodeReferences, _node, _map) {
                _nodeReferences.doneTransformToWorld = false;
            }
            // inner function to be called in a for each node at the bottom of this function
            let recalculateBranchContainingNode = (_nodeReferences, _node, _map) => {
                if (_nodeReferences.doneTransformToWorld)
                    return;
                _nodeReferences.doneTransformToWorld = true;
                // find uppermost ancestor not recalculated yet
                let ancestor = _node;
                let parent;
                while (true) {
                    parent = ancestor.getParent();
                    if (!parent)
                        break;
                    let parentReferences = _map.get(parent);
                    if (parentReferences && parentReferences.doneTransformToWorld)
                        break;
                    ancestor = parent;
                }
                // use the ancestors parent world matrix to start with, or identity if no parent exists or it's missing a ComponenTransform
                let matrix = Fudge.Matrix4x4.identity;
                if (parent && parent.cmpTransform)
                    matrix = parent.cmpTransform.world;
                // start recursive recalculation of the whole branch starting from the ancestor found
                this.recalculateTransformsOfNodeAndChildren(ancestor, matrix);
            };
            // call the functions above for each registered node
            this.nodes.forEach(markNodeToBeTransformed);
            this.nodes.forEach(recalculateBranchContainingNode);
        }
        /**
         * Recursive method receiving a childnode and its parents updated world transform.
         * If the childnode owns a ComponentTransform, its worldmatrix is recalculated and passed on to its children, otherwise its parents matrix
         * @param _node
         * @param _matrix
         */
        static recalculateTransformsOfNodeAndChildren(_node, _matrix = Fudge.Matrix4x4.identity) {
            let worldMatrix = _matrix;
            let transform = _node.cmpTransform;
            if (transform) {
                worldMatrix = Fudge.Matrix4x4.multiply(_matrix, transform.local);
                transform.world = worldMatrix;
            }
            for (let child of _node.getChildren()) {
                this.recalculateTransformsOfNodeAndChildren(child, worldMatrix);
            }
        }
        // #endregion
        // #region Manage references to render data
        /**
         * Removes a reference to a program, parameter or buffer by decreasing its reference counter and deleting it, if the counter reaches 0
         * @param _in
         * @param _key
         * @param _deletor
         */
        static removeReference(_in, _key, _deletor) {
            let reference;
            reference = _in.get(_key);
            if (reference.decreaseCounter() == 0) {
                // The following deletions may be an optimization, not necessary to start with and maybe counterproductive.
                // If data should be used later again, it must then be reconstructed...
                _deletor(reference.getReference());
                _in.delete(_key);
            }
        }
        /**
         * Increases the counter of the reference to a program, parameter or buffer. Creates the reference, if it's not existent.
         * @param _in
         * @param _key
         * @param _creator
         */
        static createReference(_in, _key, _creator) {
            let reference;
            reference = _in.get(_key);
            if (reference)
                reference.increaseCounter();
            else {
                let content = _creator(_key);
                reference = new Reference(content);
                reference.increaseCounter();
                _in.set(_key, reference);
            }
        }
    }
    /** Stores references to the compiled shader programs and makes them available via the references to shaders */
    RenderManager.renderShaders = new Map();
    /** Stores references to the vertex array objects and makes them available via the references to coats */
    RenderManager.renderCoats = new Map();
    /** Stores references to the vertex buffers and makes them available via the references to meshes */
    RenderManager.renderBuffers = new Map();
    RenderManager.nodes = new Map();
    Fudge.RenderManager = RenderManager;
})(Fudge || (Fudge = {}));
/// <reference path="../Coats/Coat.ts"/>
var Fudge;
/// <reference path="../Coats/Coat.ts"/>
(function (Fudge) {
    /**
     * Static superclass for the representation of WebGl shaderprograms.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    // TODO: define attribute/uniforms as layout and use those consistently in shaders
    class Shader {
        // The type of coat that can be used with this shader to create a material
        static getCoat() { return null; }
        static getVertexShaderSource() { return null; }
        static getFragmentShaderSource() { return null; }
    }
    Fudge.Shader = Shader;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Single color shading
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ShaderFlat extends Fudge.Shader {
        static getCoat() {
            return Fudge.CoatColored;
        }
        static getVertexShaderSource() {
            return `#version 300 es

                    struct LightAmbient {
                        vec4 color;
                    };
                    struct LightDirectional {
                        vec4 color;
                        vec3 direction;
                    };

                    const uint MAX_LIGHTS_DIRECTIONAL = 10u;

                    in vec3 a_position;
                    in vec3 a_normal;
                    uniform mat4 u_world;
                    uniform mat4 u_projection;

                    uniform LightAmbient u_ambient;
                    uniform uint u_nLightsDirectional;
                    uniform LightDirectional u_directional[MAX_LIGHTS_DIRECTIONAL];
                    flat out vec4 v_color;
                    
                    void main() {   
                        gl_Position = u_projection * vec4(a_position, 1.0);
                        vec3 normal = mat3(u_world) * a_normal;

                        v_color = vec4(0,0,0,0);
                        for (uint i = 0u; i < u_nLightsDirectional; i++) {
                            float illumination = -dot(normal, u_directional[i].direction);
                            v_color += illumination * u_directional[i].color; // vec4(1,1,1,1); // 
                        }
                        u_ambient;
                        u_directional[0];
                    }`;
        }
        static getFragmentShaderSource() {
            return `#version 300 es
                    precision mediump float;

                    flat in vec4 v_color;
                    out vec4 frag;
                    
                    void main() {
                        frag = v_color;
                    }`;
        }
    }
    Fudge.ShaderFlat = ShaderFlat;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Textured shading
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ShaderTexture extends Fudge.Shader {
        static getCoat() {
            return Fudge.CoatTextured;
        }
        static getVertexShaderSource() {
            return `#version 300 es

                in vec3 a_position;
                in vec2 a_textureUVs;
                uniform mat4 u_projection;
                uniform vec4 u_color;
                out vec2 v_textureUVs;

                void main() {  
                    gl_Position = u_projection * vec4(a_position, 1.0);
                    v_textureUVs = a_textureUVs;
                }`;
        }
        static getFragmentShaderSource() {
            return `#version 300 es
                precision mediump float;
                
                in vec2 v_textureUVs;
                uniform sampler2D u_texture;
                out vec4 frag;
                
                void main() {
                    frag = texture(u_texture, v_textureUVs);
            }`;
        }
    }
    Fudge.ShaderTexture = ShaderTexture;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Single color shading
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ShaderUniColor extends Fudge.Shader {
        static getCoat() {
            return Fudge.CoatColored;
        }
        static getVertexShaderSource() {
            return `#version 300 es

                    in vec3 a_position;
                    uniform mat4 u_projection;
                    
                    void main() {   
                        gl_Position = u_projection * vec4(a_position, 1.0);
                    }`;
        }
        static getFragmentShaderSource() {
            return `#version 300 es
                    precision mediump float;
                    
                    uniform vec4 u_color;
                    out vec4 frag;
                    
                    void main() {
                       frag = u_color;
                    }`;
        }
    }
    Fudge.ShaderUniColor = ShaderUniColor;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Baseclass for different kinds of textures.
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Texture extends Fudge.Mutable {
        reduceMutator() { }
    }
    Fudge.Texture = Texture;
    /**
     * Texture created from an existing image
     */
    class TextureImage extends Texture {
        constructor() {
            super(...arguments);
            this.image = null;
        }
    }
    Fudge.TextureImage = TextureImage;
    /**
     * Texture created from a canvas
     */
    class TextureCanvas extends Texture {
    }
    Fudge.TextureCanvas = TextureCanvas;
    /**
     * Texture created from a FUDGE-Sketch
     */
    class TextureSketch extends TextureCanvas {
    }
    Fudge.TextureSketch = TextureSketch;
    /**
     * Texture created from an HTML-page
     */
    class TextureHTML extends TextureCanvas {
    }
    Fudge.TextureHTML = TextureHTML;
})(Fudge || (Fudge = {}));
//# sourceMappingURL=Fudge.js.map