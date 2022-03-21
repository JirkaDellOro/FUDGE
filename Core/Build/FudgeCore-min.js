"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
        r = Reflect.decorate(decorators, target, key, desc);
    else
        for (var i = decorators.length - 1; i >= 0; i--)
            if (d = decorators[i])
                r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FudgeCore;
(function (FudgeCore) {
    class DebugTarget {
        delegates;
        static mergeArguments(_message, ..._args) {
            let out = _message.toString();
            for (let arg of _args)
                if (arg instanceof Number)
                    out += ", " + arg.toPrecision(2).toString();
                else
                    out += ", " + arg.toString();
            return out;
        }
    }
    FudgeCore.DebugTarget = DebugTarget;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    let DEBUG_FILTER;
    (function (DEBUG_FILTER) {
        DEBUG_FILTER[DEBUG_FILTER["NONE"] = 0] = "NONE";
        DEBUG_FILTER[DEBUG_FILTER["INFO"] = 1] = "INFO";
        DEBUG_FILTER[DEBUG_FILTER["LOG"] = 2] = "LOG";
        DEBUG_FILTER[DEBUG_FILTER["WARN"] = 4] = "WARN";
        DEBUG_FILTER[DEBUG_FILTER["ERROR"] = 8] = "ERROR";
        DEBUG_FILTER[DEBUG_FILTER["FUDGE"] = 16] = "FUDGE";
        DEBUG_FILTER[DEBUG_FILTER["CLEAR"] = 256] = "CLEAR";
        DEBUG_FILTER[DEBUG_FILTER["GROUP"] = 257] = "GROUP";
        DEBUG_FILTER[DEBUG_FILTER["GROUPCOLLAPSED"] = 258] = "GROUPCOLLAPSED";
        DEBUG_FILTER[DEBUG_FILTER["GROUPEND"] = 260] = "GROUPEND";
        DEBUG_FILTER[DEBUG_FILTER["SOURCE"] = 512] = "SOURCE";
        DEBUG_FILTER[DEBUG_FILTER["MESSAGES"] = 31] = "MESSAGES";
        DEBUG_FILTER[DEBUG_FILTER["FORMAT"] = 263] = "FORMAT";
        DEBUG_FILTER[DEBUG_FILTER["ALL"] = 287] = "ALL";
    })(DEBUG_FILTER = FudgeCore.DEBUG_FILTER || (FudgeCore.DEBUG_FILTER = {}));
    FudgeCore.DEBUG_SYMBOL = {
        [DEBUG_FILTER.INFO]: "✓",
        [DEBUG_FILTER.LOG]: "✎",
        [DEBUG_FILTER.WARN]: "⚠",
        [DEBUG_FILTER.ERROR]: "❌",
        [DEBUG_FILTER.FUDGE]: "🎲",
        [DEBUG_FILTER.SOURCE]: "🔗"
    };
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class DebugConsole extends FudgeCore.DebugTarget {
        static delegates = {
            [FudgeCore.DEBUG_FILTER.INFO]: console.info,
            [FudgeCore.DEBUG_FILTER.LOG]: console.log,
            [FudgeCore.DEBUG_FILTER.WARN]: console.warn,
            [FudgeCore.DEBUG_FILTER.ERROR]: console.error,
            [FudgeCore.DEBUG_FILTER.FUDGE]: DebugConsole.fudge,
            [FudgeCore.DEBUG_FILTER.CLEAR]: console.clear,
            [FudgeCore.DEBUG_FILTER.GROUP]: console.group,
            [FudgeCore.DEBUG_FILTER.GROUPCOLLAPSED]: console.groupCollapsed,
            [FudgeCore.DEBUG_FILTER.GROUPEND]: console.groupEnd,
            [FudgeCore.DEBUG_FILTER.SOURCE]: DebugConsole.source
        };
        static fudge(_message, ..._args) {
            console.debug(FudgeCore.DEBUG_SYMBOL[FudgeCore.DEBUG_FILTER.FUDGE], _message, ..._args);
        }
        static source(_message, ..._args) {
            console.log(FudgeCore.DEBUG_SYMBOL[FudgeCore.DEBUG_FILTER.SOURCE], _message, ..._args);
        }
    }
    FudgeCore.DebugConsole = DebugConsole;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Debug {
        static delegates = Debug.setupConsole();
        static setFilter(_target, _filter) {
            for (let filter in Debug.delegates)
                Debug.delegates[filter].delete(_target);
            for (let filter in FudgeCore.DEBUG_FILTER) {
                let parsed = parseInt(filter);
                if (isNaN(parsed))
                    break;
                if ([FudgeCore.DEBUG_FILTER.MESSAGES, FudgeCore.DEBUG_FILTER.FORMAT, FudgeCore.DEBUG_FILTER.ALL].indexOf(parsed) != -1)
                    continue;
                if (_filter & parsed)
                    Debug.delegates[parsed].set(_target, _target.delegates[parsed]);
            }
        }
        static info(_message, ..._args) {
            Debug.delegate(FudgeCore.DEBUG_FILTER.INFO, _message, _args);
        }
        static log(_message, ..._args) {
            Debug.delegate(FudgeCore.DEBUG_FILTER.LOG, _message, _args);
        }
        static warn(_message, ..._args) {
            Debug.delegate(FudgeCore.DEBUG_FILTER.WARN, _message, _args);
        }
        static error(_message, ..._args) {
            Debug.delegate(FudgeCore.DEBUG_FILTER.ERROR, _message, _args);
        }
        static fudge(_message, ..._args) {
            Debug.delegate(FudgeCore.DEBUG_FILTER.FUDGE, _message, _args);
        }
        static clear() {
            Debug.delegate(FudgeCore.DEBUG_FILTER.CLEAR, null, null);
        }
        static group(_name) {
            Debug.delegate(FudgeCore.DEBUG_FILTER.GROUP, _name, null);
        }
        static groupCollapsed(_name) {
            Debug.delegate(FudgeCore.DEBUG_FILTER.GROUPCOLLAPSED, _name, null);
        }
        static groupEnd() {
            Debug.delegate(FudgeCore.DEBUG_FILTER.GROUPEND, null, null);
        }
        static branch(_branch) {
            if (_branch.nChildren > 0)
                Debug.group(_branch.name);
            else
                Debug.fudge(_branch.name);
            for (let child of _branch.getChildren())
                Debug.branch(child);
            if (_branch.nChildren > 0)
                Debug.groupEnd();
        }
        static source(_message, ..._args) {
            Debug.delegate(FudgeCore.DEBUG_FILTER.SOURCE, _message, _args);
        }
        static delegate(_filter, _message, _args) {
            if (_filter == FudgeCore.DEBUG_FILTER.LOG || _filter == FudgeCore.DEBUG_FILTER.WARN || _filter == FudgeCore.DEBUG_FILTER.ERROR) {
                if (Debug.delegates[FudgeCore.DEBUG_FILTER.SOURCE])
                    for (let delegate of Debug.delegates[FudgeCore.DEBUG_FILTER.SOURCE].values())
                        if (delegate) {
                            let trace = new Error("Test").stack.split("\n");
                            delegate(trace[3]);
                        }
            }
            let delegates = Debug.delegates[_filter];
            for (let delegate of delegates.values())
                if (delegate)
                    if (_args && _args.length > 0)
                        delegate(_message, ..._args);
                    else
                        delegate(_message);
        }
        static setupConsole() {
            let result = {};
            let filters = [
                FudgeCore.DEBUG_FILTER.INFO, FudgeCore.DEBUG_FILTER.LOG, FudgeCore.DEBUG_FILTER.WARN, FudgeCore.DEBUG_FILTER.ERROR, FudgeCore.DEBUG_FILTER.FUDGE,
                FudgeCore.DEBUG_FILTER.CLEAR, FudgeCore.DEBUG_FILTER.GROUP, FudgeCore.DEBUG_FILTER.GROUPCOLLAPSED, FudgeCore.DEBUG_FILTER.GROUPEND,
                FudgeCore.DEBUG_FILTER.SOURCE
            ];
            for (let filter of filters)
                result[filter] = new Map([[FudgeCore.DebugConsole, FudgeCore.DebugConsole.delegates[filter]]]);
            result[FudgeCore.DEBUG_FILTER.SOURCE].delete(FudgeCore.DebugConsole);
            return result;
        }
    }
    FudgeCore.Debug = Debug;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class EventTargetƒ extends EventTarget {
        addEventListener(_type, _handler, _options) {
            super.addEventListener(_type, _handler, _options);
        }
        removeEventListener(_type, _handler, _options) {
            super.removeEventListener(_type, _handler, _options);
        }
        dispatchEvent(_event) {
            return super.dispatchEvent(_event);
        }
    }
    FudgeCore.EventTargetƒ = EventTargetƒ;
    class EventTargetStatic extends EventTargetƒ {
        static targetStatic = new EventTargetStatic();
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
    FudgeCore.EventTargetStatic = EventTargetStatic;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    function getMutatorOfArbitrary(_object) {
        let mutator = {};
        let attributes = Reflect.ownKeys(Reflect.getPrototypeOf(_object));
        for (let attribute of attributes) {
            let value = Reflect.get(_object, attribute);
            if (value instanceof Function)
                continue;
            mutator[attribute.toString()] = value;
        }
        return mutator;
    }
    FudgeCore.getMutatorOfArbitrary = getMutatorOfArbitrary;
    class Mutable extends FudgeCore.EventTargetƒ {
        get type() {
            return this.constructor.name;
        }
        getMutator(_extendable = false) {
            let mutator = {};
            for (let attribute in this) {
                let value = this[attribute];
                if (value instanceof Function)
                    continue;
                if (value instanceof Object && !(value instanceof Mutable) && !(value instanceof FudgeCore.MutableArray) && !(value.hasOwnProperty("idResource")))
                    continue;
                mutator[attribute] = this[attribute];
            }
            if (!_extendable)
                Object.preventExtensions(mutator);
            this.reduceMutator(mutator);
            for (let attribute in mutator) {
                let value = mutator[attribute];
                if (value instanceof Mutable)
                    mutator[attribute] = value.getMutator();
                if (value instanceof FudgeCore.MutableArray)
                    mutator[attribute] = value.map((_value) => _value.getMutator());
            }
            return mutator;
        }
        getMutatorForAnimation() {
            return this.getMutator();
        }
        getMutatorForUserInterface() {
            return this.getMutator();
        }
        getMutatorAttributeTypes(_mutator) {
            let types = {};
            for (let attribute in _mutator) {
                let type = null;
                let value = _mutator[attribute];
                if (_mutator[attribute] != undefined)
                    if (typeof (value) == "object")
                        type = this[attribute].constructor.name;
                    else if (typeof (value) == "function")
                        type = value["name"];
                    else
                        type = _mutator[attribute].constructor.name;
                types[attribute] = type;
            }
            return types;
        }
        updateMutator(_mutator) {
            for (let attribute in _mutator) {
                let value = _mutator[attribute];
                if (value instanceof Mutable)
                    _mutator[attribute] = value.getMutator();
                else
                    _mutator[attribute] = this[attribute];
            }
        }
        async mutate(_mutator) {
            for (let attribute in _mutator) {
                if (!Reflect.has(this, attribute))
                    continue;
                let mutant = Reflect.get(this, attribute);
                let value = _mutator[attribute];
                if (mutant instanceof FudgeCore.MutableArray || mutant instanceof Mutable)
                    await mutant.mutate(value);
                else
                    Reflect.set(this, attribute, value);
            }
            this.dispatchEvent(new Event("mutate"));
        }
    }
    FudgeCore.Mutable = Mutable;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Serializer {
        static namespaces = { "ƒ": FudgeCore };
        static registerNamespace(_namespace) {
            for (let name in Serializer.namespaces)
                if (Serializer.namespaces[name] == _namespace)
                    return name;
            let name = Serializer.findNamespaceIn(_namespace, window);
            if (!name)
                for (let parentName in Serializer.namespaces) {
                    name = Serializer.findNamespaceIn(_namespace, Serializer.namespaces[parentName]);
                    if (name) {
                        name = parentName + "." + name;
                        break;
                    }
                }
            if (!name)
                throw new Error("Namespace not found. Maybe parent namespace hasn't been registered before?");
            Serializer.namespaces[name] = _namespace;
            return name;
        }
        static serialize(_object) {
            let serialization = {};
            let path = this.getFullPath(_object);
            if (!path)
                throw new Error(`Namespace of serializable object of type ${_object.constructor.name} not found. Maybe the namespace hasn't been registered or the class not exported?`);
            serialization[path] = _object.serialize();
            return serialization;
        }
        static async deserialize(_serialization) {
            let reconstruct;
            let path;
            try {
                for (path in _serialization) {
                    reconstruct = Serializer.reconstruct(path);
                    reconstruct = await reconstruct.deserialize(_serialization[path]);
                    return reconstruct;
                }
            }
            catch (_error) {
                throw new Error(`Deserialization of ${path} failed: ` + _error);
            }
            return null;
        }
        static serializeArray(_type, _objects) {
            let serializations = [];
            let path = this.getFullPath(new _type());
            if (!path)
                throw new Error(`Namespace of serializable object of type ${_type.name} not found. Maybe the namespace hasn't been registered or the class not exported?`);
            for (let object of _objects)
                serializations.push(object.serialize());
            let serialization = {};
            serialization[path] = serializations;
            return serialization;
        }
        static async deserializeArray(_serialization) {
            let serializables = [];
            let construct;
            let serializations = [];
            try {
                for (let path in _serialization) {
                    construct = Serializer.getConstructor(path);
                    serializations = _serialization[path];
                    break;
                }
            }
            catch (_error) {
                throw new Error("Deserialization failed: " + _error);
            }
            for (let serialization of serializations) {
                let serializable = new construct();
                await serializable.deserialize(serialization);
                serializables.push(serializable);
            }
            return serializables;
        }
        static prettify(_json) { return _json; }
        static stringify(_serialization) {
            let json = JSON.stringify(_serialization, null, 2);
            let pretty = Serializer.prettify(json);
            return pretty;
        }
        static parse(_json) {
            return JSON.parse(_json);
        }
        static reconstruct(_path) {
            let constructor = Serializer.getConstructor(_path);
            let reconstruction = new constructor();
            return reconstruction;
        }
        static getConstructor(_path) {
            let typeName = _path.substr(_path.lastIndexOf(".") + 1);
            let namespace = Serializer.getNamespace(_path);
            if (!namespace)
                throw new Error(`Constructor of serializable object of type ${_path} not found. Maybe the namespace hasn't been registered?`);
            return namespace[typeName];
        }
        static getFullPath(_object) {
            let typeName = _object.constructor.name;
            for (let namespaceName in Serializer.namespaces) {
                let found = Serializer.namespaces[namespaceName][typeName];
                if (found && _object instanceof found)
                    return namespaceName + "." + typeName;
            }
            return null;
        }
        static getNamespace(_path) {
            let namespaceName = _path.substr(0, _path.lastIndexOf("."));
            return Serializer.namespaces[namespaceName] || FudgeCore;
        }
        static findNamespaceIn(_namespace, _parent) {
            for (let prop in _parent)
                if (_parent[prop] == _namespace)
                    return prop;
            return null;
        }
    }
    FudgeCore.Serializer = Serializer;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Component extends FudgeCore.Mutable {
        static iSubclass;
        static baseClass = Component;
        static subclasses = [];
        #node = null;
        singleton = true;
        active = true;
        static registerSubclass(_subclass) { return Component.subclasses.push(_subclass) - 1; }
        get isActive() {
            return this.active;
        }
        get isSingleton() {
            return this.singleton;
        }
        get node() {
            return this.#node;
        }
        activate(_on) {
            this.active = _on;
            this.dispatchEvent(new Event(_on ? "componentActivate" : "componentDeactivate"));
        }
        attachToNode(_container) {
            if (this.#node == _container)
                return;
            let previousContainer = this.#node;
            try {
                if (previousContainer)
                    previousContainer.removeComponent(this);
                this.#node = _container;
                if (this.#node)
                    this.#node.addComponent(this);
            }
            catch (_error) {
                this.#node = previousContainer;
            }
        }
        serialize() {
            let serialization = {
                active: this.active
            };
            return serialization;
        }
        async deserialize(_serialization) {
            this.active = _serialization.active;
            return this;
        }
        reduceMutator(_mutator) {
            delete _mutator.singleton;
            delete _mutator.mtxWorld;
        }
    }
    FudgeCore.Component = Component;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class RecycableArray {
        #length = 0;
        #array = new Array();
        get length() {
            return this.#length;
        }
        reset() {
            this.#length = 0;
        }
        push(_entry) {
            this.#array[this.#length] = _entry;
            this.#length++;
            return this.#length;
        }
        pop() {
            this.#length--;
            return this.#array[this.#length];
        }
        *[Symbol.iterator]() {
            for (let i = 0; i < this.#length; i++)
                yield this.#array[i];
        }
        getSorted(_sort) {
            let sorted = this.#array.slice(0, this.#length);
            sorted.sort(_sort);
            return sorted;
        }
    }
    FudgeCore.RecycableArray = RecycableArray;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class RenderInjector {
        static inject(_constructor, _injector) {
            let injection = Reflect.get(_injector, "inject" + _constructor.name);
            if (!injection) {
                FudgeCore.Debug.error("No injection decorator defined for " + _constructor.name);
            }
            Object.defineProperty(_constructor.prototype, "useRenderData", {
                value: injection
            });
        }
    }
    FudgeCore.RenderInjector = RenderInjector;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class RenderInjectorShader {
        static decorate(_constructor) {
            Object.defineProperty(_constructor, "useProgram", {
                value: RenderInjectorShader.useProgram
            });
            Object.defineProperty(_constructor, "deleteProgram", {
                value: RenderInjectorShader.deleteProgram
            });
            Object.defineProperty(_constructor, "createProgram", {
                value: RenderInjectorShader.createProgram
            });
        }
        static useProgram() {
            if (!this.program)
                this.createProgram();
            let crc3 = FudgeCore.RenderWebGL.getRenderingContext();
            crc3.useProgram(this.program);
            crc3.enableVertexAttribArray(this.attributes["a_position"]);
        }
        static deleteProgram() {
            let crc3 = FudgeCore.RenderWebGL.getRenderingContext();
            if (this.program) {
                crc3.deleteProgram(this.program);
                delete this.attributes;
                delete this.uniforms;
            }
        }
        static createProgram() {
            FudgeCore.Debug.fudge("Create shader program", this.name);
            let crc3 = FudgeCore.RenderWebGL.getRenderingContext();
            let program = crc3.createProgram();
            try {
                crc3.attachShader(program, FudgeCore.RenderWebGL.assert(compileShader(this.getVertexShaderSource(), WebGL2RenderingContext.VERTEX_SHADER)));
                crc3.attachShader(program, FudgeCore.RenderWebGL.assert(compileShader(this.getFragmentShaderSource(), WebGL2RenderingContext.FRAGMENT_SHADER)));
                crc3.linkProgram(program);
                let error = FudgeCore.RenderWebGL.assert(crc3.getProgramInfoLog(program));
                if (error !== "") {
                    throw new Error("Error linking Shader: " + error);
                }
                this.program = program;
                this.attributes = detectAttributes();
                this.uniforms = detectUniforms();
            }
            catch (_error) {
                FudgeCore.Debug.error(_error);
                debugger;
            }
            function compileShader(_shaderCode, _shaderType) {
                let webGLShader = crc3.createShader(_shaderType);
                crc3.shaderSource(webGLShader, _shaderCode);
                crc3.compileShader(webGLShader);
                let error = FudgeCore.RenderWebGL.assert(crc3.getShaderInfoLog(webGLShader));
                if (error !== "") {
                    throw new Error("Error compiling shader: " + error);
                }
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
                    let attributeInfo = FudgeCore.RenderWebGL.assert(crc3.getActiveAttrib(program, i));
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
                    let info = FudgeCore.RenderWebGL.assert(crc3.getActiveUniform(program, i));
                    if (!info) {
                        break;
                    }
                    detectedUniforms[info.name] = FudgeCore.RenderWebGL.assert(crc3.getUniformLocation(program, info.name));
                }
                return detectedUniforms;
            }
        }
    }
    FudgeCore.RenderInjectorShader = RenderInjectorShader;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class RenderInjectorCoat extends FudgeCore.RenderInjector {
        static decorate(_constructor) {
            FudgeCore.RenderInjector.inject(_constructor, RenderInjectorCoat);
        }
        static injectCoatColored(_shader, _cmpMaterial) {
            let colorUniformLocation = _shader.uniforms["u_color"];
            let color = FudgeCore.Color.MULTIPLY(this.color, _cmpMaterial.clrPrimary);
            FudgeCore.RenderWebGL.getRenderingContext().uniform4fv(colorUniformLocation, color.getArray());
        }
        static injectCoatTextured(_shader, _cmpMaterial) {
            let crc3 = FudgeCore.RenderWebGL.getRenderingContext();
            let colorUniformLocation = _shader.uniforms["u_color"];
            let color = FudgeCore.Color.MULTIPLY(this.color, _cmpMaterial.clrPrimary);
            FudgeCore.RenderWebGL.getRenderingContext().uniform4fv(colorUniformLocation, color.getArray());
            this.texture.useRenderData();
            crc3.uniform1i(_shader.uniforms["u_texture"], 0);
            crc3.uniformMatrix3fv(_shader.uniforms["u_pivot"], false, _cmpMaterial.mtxPivot.get());
        }
        static injectCoatMatCap(_shader, _cmpMaterial) {
            let crc3 = FudgeCore.RenderWebGL.getRenderingContext();
            let colorUniformLocation = _shader.uniforms["u_tint_color"];
            let { r, g, b, a } = this.color;
            let tintColorArray = new Float32Array([r, g, b, a]);
            crc3.uniform4fv(colorUniformLocation, tintColorArray);
            let floatUniformLocation = _shader.uniforms["shade_smooth"];
            let shadeSmooth = this.shadeSmooth;
            crc3.uniform1i(floatUniformLocation, shadeSmooth);
            if (this.renderData) {
                crc3.activeTexture(WebGL2RenderingContext.TEXTURE0);
                crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, this.renderData["texture0"]);
                crc3.uniform1i(_shader.uniforms["u_texture"], 0);
            }
            else {
                this.renderData = {};
                const texture = FudgeCore.Render.assert(crc3.createTexture());
                crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, texture);
                try {
                    crc3.texImage2D(crc3.TEXTURE_2D, 0, crc3.RGBA, crc3.RGBA, crc3.UNSIGNED_BYTE, this.texture.image);
                    crc3.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, this.texture.image);
                }
                catch (_error) {
                    FudgeCore.Debug.error(_error);
                }
                crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MAG_FILTER, WebGL2RenderingContext.NEAREST);
                crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.NEAREST);
                crc3.generateMipmap(crc3.TEXTURE_2D);
                this.renderData["texture0"] = texture;
                crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, null);
                this.useRenderData(_shader, _cmpMaterial);
            }
        }
    }
    FudgeCore.RenderInjectorCoat = RenderInjectorCoat;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class RenderInjectorMesh {
        static decorate(_constructor) {
            Object.defineProperty(_constructor.prototype, "useRenderBuffers", {
                value: RenderInjectorMesh.useRenderBuffers
            });
            Object.defineProperty(_constructor.prototype, "createRenderBuffers", {
                value: RenderInjectorMesh.createRenderBuffers
            });
            Object.defineProperty(_constructor.prototype, "deleteRenderBuffers", {
                value: RenderInjectorMesh.deleteRenderBuffers
            });
        }
        static createRenderBuffers() {
            let crc3 = FudgeCore.RenderWebGL.getRenderingContext();
            let vertices = FudgeCore.RenderWebGL.assert(crc3.createBuffer());
            crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, vertices);
            crc3.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, this.vertices, WebGL2RenderingContext.STATIC_DRAW);
            let indices = FudgeCore.RenderWebGL.assert(crc3.createBuffer());
            crc3.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, indices);
            crc3.bufferData(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, this.indices, WebGL2RenderingContext.STATIC_DRAW);
            let textureUVs = crc3.createBuffer();
            crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, textureUVs);
            crc3.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, this.textureUVs, WebGL2RenderingContext.STATIC_DRAW);
            let normalsFace = FudgeCore.RenderWebGL.assert(crc3.createBuffer());
            crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, normalsFace);
            crc3.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, this.normalsFace, WebGL2RenderingContext.STATIC_DRAW);
            let renderBuffers = {
                vertices: vertices,
                indices: indices,
                nIndices: this.getIndexCount(),
                textureUVs: textureUVs,
                normalsFace: normalsFace
            };
            this.renderBuffers = renderBuffers;
        }
        static useRenderBuffers(_shader, _mtxWorld, _mtxProjection, _id) {
            if (!this.renderBuffers)
                this.createRenderBuffers();
            let crc3 = FudgeCore.RenderWebGL.getRenderingContext();
            let aPosition = _shader.attributes["a_position"];
            crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.renderBuffers.vertices);
            crc3.enableVertexAttribArray(aPosition);
            FudgeCore.RenderWebGL.setAttributeStructure(aPosition, FudgeCore.Mesh.getBufferSpecification());
            crc3.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, this.renderBuffers.indices);
            let uProjection = _shader.uniforms["u_projection"];
            crc3.uniformMatrix4fv(uProjection, false, _mtxProjection.get());
            let uWorld = _shader.uniforms["u_world"];
            if (uWorld) {
                crc3.uniformMatrix4fv(uWorld, false, _mtxWorld.get());
            }
            let aNormal = _shader.attributes["a_normal"];
            if (aNormal) {
                crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.renderBuffers.normalsFace);
                crc3.enableVertexAttribArray(aNormal);
                FudgeCore.RenderWebGL.setAttributeStructure(aNormal, FudgeCore.Mesh.getBufferSpecification());
            }
            let aTextureUVs = _shader.attributes["a_textureUVs"];
            if (aTextureUVs) {
                crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.renderBuffers.textureUVs);
                crc3.enableVertexAttribArray(aTextureUVs);
                crc3.vertexAttribPointer(aTextureUVs, 2, WebGL2RenderingContext.FLOAT, false, 0, 0);
            }
            let uId = _shader.uniforms["u_id"];
            if (uId)
                FudgeCore.RenderWebGL.getRenderingContext().uniform1i(uId, _id);
        }
        static deleteRenderBuffers(_renderBuffers) {
            let crc3 = FudgeCore.RenderWebGL.getRenderingContext();
            if (_renderBuffers) {
                crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, null);
                crc3.deleteBuffer(_renderBuffers.vertices);
                crc3.deleteBuffer(_renderBuffers.textureUVs);
                crc3.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, null);
                crc3.deleteBuffer(_renderBuffers.indices);
            }
        }
    }
    FudgeCore.RenderInjectorMesh = RenderInjectorMesh;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Recycler {
        static depot = {};
        static get(_T) {
            let key = _T.name;
            let instances = Recycler.depot[key];
            if (instances && instances.length > 0) {
                let instance = instances.pop();
                instance.recycle();
                return instance;
            }
            else
                return new _T();
        }
        static borrow(_T) {
            let t;
            let key = _T.name;
            let instances = Recycler.depot[key];
            if (!instances || instances.length == 0) {
                t = new _T();
                Recycler.store(t);
                return t;
            }
            let instance = instances[0];
            instance.recycle();
            return instance;
        }
        static store(_instance) {
            let key = _instance.constructor.name;
            let instances = Recycler.depot[key] || [];
            instances.push(_instance);
            Recycler.depot[key] = instances;
        }
        static dump(_T) {
            let key = _T.name;
            Recycler.depot[key] = [];
        }
        static dumpAll() {
            Recycler.depot = {};
        }
    }
    FudgeCore.Recycler = Recycler;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Vector2 extends FudgeCore.Mutable {
        data;
        constructor(_x = 0, _y = 0) {
            super();
            this.data = new Float32Array([_x, _y]);
        }
        static ZERO() {
            const vector = FudgeCore.Recycler.get(Vector2);
            vector.set(0, 0);
            return vector;
        }
        static ONE(_scale = 1) {
            const vector = FudgeCore.Recycler.get(Vector2);
            vector.set(_scale, _scale);
            return vector;
        }
        static Y(_scale = 1) {
            const vector = FudgeCore.Recycler.get(Vector2);
            vector.set(0, _scale);
            return vector;
        }
        static X(_scale = 1) {
            const vector = FudgeCore.Recycler.get(Vector2);
            vector.set(_scale, 0);
            return vector;
        }
        static TRANSFORMATION(_vector, _mtxTransform, _includeTranslation = true) {
            let result = FudgeCore.Recycler.get(Vector2);
            let m = _mtxTransform.get();
            let [x, y] = _vector.get();
            result.x = m[0] * x + m[3] * y;
            result.y = m[1] * x + m[4] * y;
            if (_includeTranslation) {
                result.add(_mtxTransform.translation);
            }
            return result;
        }
        static NORMALIZATION(_vector, _length = 1) {
            let vector = Vector2.ZERO();
            try {
                let [x, y] = _vector.data;
                let factor = _length / Math.hypot(x, y);
                vector.set(_vector.x * factor, _vector.y * factor);
            }
            catch (_error) {
                FudgeCore.Debug.warn(_error);
            }
            return vector;
        }
        static SCALE(_vector, _scale) {
            let vector = FudgeCore.Recycler.get(Vector2);
            vector.set(_vector.x * _scale, _vector.y * _scale);
            return vector;
        }
        static SUM(..._vectors) {
            let result = FudgeCore.Recycler.get(Vector2);
            for (let vector of _vectors)
                result.set(result.x + vector.x, result.y + vector.y);
            return result;
        }
        static DIFFERENCE(_minuend, _subtrahend) {
            let vector = FudgeCore.Recycler.get(Vector2);
            vector.set(_minuend.x - _subtrahend.x, _minuend.y - _subtrahend.y);
            return vector;
        }
        static DOT(_a, _b) {
            let scalarProduct = _a.x * _b.x + _a.y * _b.y;
            return scalarProduct;
        }
        static CROSS(_a, _b) {
            let crossProduct = _a.x * _b.y - _a.y * _b.x;
            return crossProduct;
        }
        static ORTHOGONAL(_vector, _clockwise = false) {
            let result = FudgeCore.Recycler.get(Vector2);
            if (_clockwise)
                result.set(_vector.y, -_vector.x);
            else
                result.set(-_vector.y, _vector.x);
            return result;
        }
        static GEO(_angle = 0, _magnitude = 1) {
            let vector = FudgeCore.Recycler.get(Vector2);
            let geo = FudgeCore.Recycler.get(FudgeCore.Geo2);
            geo.set(_angle, _magnitude);
            vector.geo = geo;
            FudgeCore.Recycler.store(geo);
            return vector;
        }
        get x() {
            return this.data[0];
        }
        get y() {
            return this.data[1];
        }
        set x(_x) {
            this.data[0] = _x;
        }
        set y(_y) {
            this.data[1] = _y;
        }
        get magnitude() {
            return Math.hypot(...this.data);
        }
        get magnitudeSquared() {
            return Vector2.DOT(this, this);
        }
        get clone() {
            let clone = FudgeCore.Recycler.get(Vector2);
            clone.data.set(this.data);
            return clone;
        }
        get geo() {
            let geo = FudgeCore.Recycler.get(FudgeCore.Geo2);
            geo.magnitude = this.magnitude;
            if (geo.magnitude === 0)
                return geo;
            geo.angle = 180 * Math.atan2(this.y / geo.magnitude, this.x / geo.magnitude) / Math.PI;
            return geo;
        }
        set geo(_geo) {
            this.set(_geo.magnitude, 0);
            this.transform(FudgeCore.Matrix3x3.ROTATION(_geo.angle));
        }
        recycle() {
            this.data.set([0, 0]);
        }
        equals(_compare, _tolerance = Number.EPSILON) {
            if (Math.abs(this.x - _compare.x) > _tolerance)
                return false;
            if (Math.abs(this.y - _compare.y) > _tolerance)
                return false;
            return true;
        }
        add(_addend) {
            this.data.set([_addend.x + this.x, _addend.y + this.y]);
        }
        subtract(_subtrahend) {
            this.data.set([this.x - _subtrahend.x, this.y - _subtrahend.y]);
        }
        scale(_scalar) {
            this.data.set([_scalar * this.x, _scalar * this.y]);
        }
        normalize(_length = 1) {
            this.data = Vector2.NORMALIZATION(this, _length).data;
        }
        set(_x = 0, _y = 0) {
            this.data[0] = _x;
            this.data[1] = _y;
        }
        get() {
            return new Float32Array(this.data);
        }
        transform(_mtxTransform, _includeTranslation = true) {
            this.data = Vector2.TRANSFORMATION(this, _mtxTransform, _includeTranslation).data;
        }
        min(_compare) {
            this.x = Math.min(this.x, _compare.x);
            this.y = Math.min(this.y, _compare.y);
        }
        max(_compare) {
            this.x = Math.max(this.x, _compare.x);
            this.y = Math.max(this.y, _compare.y);
        }
        toVector3(_z = 0) {
            return new FudgeCore.Vector3(this.x, this.y, _z);
        }
        toString() {
            let result = `(${this.x.toPrecision(5)}, ${this.y.toPrecision(5)})`;
            return result;
        }
        serialize() {
            let serialization = this.getMutator();
            serialization.toJSON = () => { return `[${this.x}, ${this.y}]`; };
            return serialization;
        }
        async deserialize(_serialization) {
            if (typeof (_serialization) == "string") {
                [this.x, this.y] = JSON.parse(_serialization);
            }
            else
                this.mutate(_serialization);
            return this;
        }
        getMutator() {
            let mutator = {
                x: this.data[0], y: this.data[1]
            };
            return mutator;
        }
        reduceMutator(_mutator) { }
    }
    FudgeCore.Vector2 = Vector2;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    let ORIGIN2D;
    (function (ORIGIN2D) {
        ORIGIN2D[ORIGIN2D["TOPLEFT"] = 0] = "TOPLEFT";
        ORIGIN2D[ORIGIN2D["TOPCENTER"] = 1] = "TOPCENTER";
        ORIGIN2D[ORIGIN2D["TOPRIGHT"] = 2] = "TOPRIGHT";
        ORIGIN2D[ORIGIN2D["CENTERLEFT"] = 16] = "CENTERLEFT";
        ORIGIN2D[ORIGIN2D["CENTER"] = 17] = "CENTER";
        ORIGIN2D[ORIGIN2D["CENTERRIGHT"] = 18] = "CENTERRIGHT";
        ORIGIN2D[ORIGIN2D["BOTTOMLEFT"] = 32] = "BOTTOMLEFT";
        ORIGIN2D[ORIGIN2D["BOTTOMCENTER"] = 33] = "BOTTOMCENTER";
        ORIGIN2D[ORIGIN2D["BOTTOMRIGHT"] = 34] = "BOTTOMRIGHT";
    })(ORIGIN2D = FudgeCore.ORIGIN2D || (FudgeCore.ORIGIN2D = {}));
    class Rectangle extends FudgeCore.Mutable {
        position = FudgeCore.Recycler.get(FudgeCore.Vector2);
        size = FudgeCore.Recycler.get(FudgeCore.Vector2);
        constructor(_x = 0, _y = 0, _width = 1, _height = 1, _origin = ORIGIN2D.TOPLEFT) {
            super();
            this.setPositionAndSize(_x, _y, _width, _height, _origin);
        }
        static GET(_x = 0, _y = 0, _width = 1, _height = 1, _origin = ORIGIN2D.TOPLEFT) {
            let rect = FudgeCore.Recycler.get(Rectangle);
            rect.setPositionAndSize(_x, _y, _width, _height);
            return rect;
        }
        get x() {
            return this.position.x;
        }
        get y() {
            return this.position.y;
        }
        get width() {
            return this.size.x;
        }
        get height() {
            return this.size.y;
        }
        get left() {
            if (this.size.x > 0)
                return this.position.x;
            return (this.position.x + this.size.x);
        }
        get top() {
            if (this.size.y > 0)
                return this.position.y;
            return (this.position.y + this.size.y);
        }
        get right() {
            if (this.size.x > 0)
                return (this.position.x + this.size.x);
            return this.position.x;
        }
        get bottom() {
            if (this.size.y > 0)
                return (this.position.y + this.size.y);
            return this.position.y;
        }
        set x(_x) {
            this.position.x = _x;
        }
        set y(_y) {
            this.position.y = _y;
        }
        set width(_width) {
            this.size.x = _width;
        }
        set height(_height) {
            this.size.y = _height;
        }
        set left(_value) {
            this.size.x = this.right - _value;
            this.position.x = _value;
        }
        set top(_value) {
            this.size.y = this.bottom - _value;
            this.position.y = _value;
        }
        set right(_value) {
            this.size.x = this.position.x + _value;
        }
        set bottom(_value) {
            this.size.y = this.position.y + _value;
        }
        get clone() {
            return Rectangle.GET(this.x, this.y, this.width, this.height);
        }
        recycle() {
            this.setPositionAndSize();
        }
        copy(_rect) {
            this.setPositionAndSize(_rect.x, _rect.y, _rect.width, _rect.height);
        }
        setPositionAndSize(_x = 0, _y = 0, _width = 1, _height = 1, _origin = ORIGIN2D.TOPLEFT) {
            this.size.set(_width, _height);
            switch (_origin & 0x03) {
                case 0x00:
                    this.position.x = _x;
                    break;
                case 0x01:
                    this.position.x = _x - _width / 2;
                    break;
                case 0x02:
                    this.position.x = _x - _width;
                    break;
            }
            switch (_origin & 0x30) {
                case 0x00:
                    this.position.y = _y;
                    break;
                case 0x10:
                    this.position.y = _y - _height / 2;
                    break;
                case 0x20:
                    this.position.y = _y - _height;
                    break;
            }
        }
        pointToRect(_point, _target) {
            let result = _point.clone;
            result.subtract(this.position);
            result.x *= _target.width / this.width;
            result.y *= _target.height / this.height;
            result.add(_target.position);
            return result;
        }
        isInside(_point) {
            return (_point.x >= this.left && _point.x <= this.right && _point.y >= this.top && _point.y <= this.bottom);
        }
        collides(_rect) {
            if (this.left > _rect.right)
                return false;
            if (this.right < _rect.left)
                return false;
            if (this.top > _rect.bottom)
                return false;
            if (this.bottom < _rect.top)
                return false;
            return true;
        }
        getIntersection(_rect) {
            if (!this.collides(_rect))
                return null;
            let intersection = new Rectangle();
            intersection.x = Math.max(this.left, _rect.left);
            intersection.y = Math.max(this.top, _rect.top);
            intersection.width = Math.min(this.right, _rect.right) - intersection.x;
            intersection.height = Math.min(this.bottom, _rect.bottom) - intersection.y;
            return intersection;
        }
        covers(_rect) {
            if (this.left > _rect.left)
                return false;
            if (this.right < _rect.right)
                return false;
            if (this.top > _rect.top)
                return false;
            if (this.bottom < _rect.bottom)
                return false;
            return true;
        }
        toString() {
            let result = `ƒ.Rectangle(position:${this.position.toString()}, size:${this.size.toString()}`;
            result += `, left:${this.left.toPrecision(5)}, top:${this.top.toPrecision(5)}, right:${this.right.toPrecision(5)}, bottom:${this.bottom.toPrecision(5)}`;
            return result;
        }
        reduceMutator(_mutator) { }
    }
    FudgeCore.Rectangle = Rectangle;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    let BLEND;
    (function (BLEND) {
        BLEND[BLEND["OPAQUE"] = 0] = "OPAQUE";
        BLEND[BLEND["TRANSPARENT"] = 1] = "TRANSPARENT";
        BLEND[BLEND["PARTICLE"] = 2] = "PARTICLE";
    })(BLEND = FudgeCore.BLEND || (FudgeCore.BLEND = {}));
    class RenderWebGL extends FudgeCore.EventTargetStatic {
        static crc3 = RenderWebGL.initialize();
        static ƒpicked;
        static rectRender = RenderWebGL.getCanvasRect();
        static sizePick;
        static initialize(_antialias, _alpha) {
            FudgeCore.fudgeConfig = FudgeCore.fudgeConfig || {};
            let contextAttributes = {
                alpha: (_alpha != undefined) ? _alpha : FudgeCore.fudgeConfig.alpha || false,
                antialias: (_antialias != undefined) ? _antialias : FudgeCore.fudgeConfig.antialias || false,
                premultipliedAlpha: false
            };
            FudgeCore.Debug.fudge("Initialize RenderWebGL", contextAttributes);
            let canvas = document.createElement("canvas");
            let crc3;
            crc3 = RenderWebGL.assert(canvas.getContext("webgl2", contextAttributes), "WebGL-context couldn't be created");
            RenderWebGL.crc3 = crc3;
            crc3.enable(WebGL2RenderingContext.CULL_FACE);
            crc3.enable(WebGL2RenderingContext.DEPTH_TEST);
            crc3.enable(WebGL2RenderingContext.BLEND);
            crc3.blendEquation(WebGL2RenderingContext.FUNC_ADD);
            RenderWebGL.setBlendMode(BLEND.TRANSPARENT);
            RenderWebGL.rectRender = RenderWebGL.getCanvasRect();
            return crc3;
        }
        static setAttributeStructure(_attributeLocation, _bufferSpecification) {
            RenderWebGL.crc3.vertexAttribPointer(_attributeLocation, _bufferSpecification.size, _bufferSpecification.dataType, _bufferSpecification.normalize, _bufferSpecification.stride, _bufferSpecification.offset);
        }
        static assert(_value, _message = "") {
            if (_value === null)
                throw new Error(`Assertion failed. ${_message}, WebGL-Error: ${RenderWebGL.crc3 ? RenderWebGL.crc3.getError() : ""}`);
            return _value;
        }
        static getCanvas() {
            return RenderWebGL.crc3.canvas;
        }
        static getRenderingContext() {
            return RenderWebGL.crc3;
        }
        static getCanvasRect() {
            let canvas = RenderWebGL.crc3.canvas;
            return FudgeCore.Rectangle.GET(0, 0, canvas.width, canvas.height);
        }
        static setCanvasSize(_width, _height) {
            RenderWebGL.crc3.canvas.width = _width;
            RenderWebGL.crc3.canvas.height = _height;
        }
        static setRenderRectangle(_rect) {
            RenderWebGL.rectRender.setPositionAndSize(_rect.x, _rect.y, _rect.width, _rect.height);
            RenderWebGL.crc3.viewport(_rect.x, _rect.y, _rect.width, _rect.height);
        }
        static clear(_color = null) {
            RenderWebGL.crc3.clearColor(_color.r, _color.g, _color.b, _color.a);
            RenderWebGL.crc3.clear(WebGL2RenderingContext.COLOR_BUFFER_BIT | WebGL2RenderingContext.DEPTH_BUFFER_BIT);
        }
        static resetFrameBuffer(_color = null) {
            RenderWebGL.crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, null);
        }
        static getRenderRectangle() {
            return RenderWebGL.rectRender;
        }
        static setDepthTest(_test) {
            if (_test)
                RenderWebGL.crc3.enable(WebGL2RenderingContext.DEPTH_TEST);
            else
                RenderWebGL.crc3.disable(WebGL2RenderingContext.DEPTH_TEST);
        }
        static setBlendMode(_mode) {
            switch (_mode) {
                case BLEND.OPAQUE:
                    RenderWebGL.crc3.blendFunc(WebGL2RenderingContext.ONE, WebGL2RenderingContext.ZERO);
                    break;
                case BLEND.TRANSPARENT:
                    RenderWebGL.crc3.blendFunc(WebGL2RenderingContext.SRC_ALPHA, WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA);
                    break;
                case BLEND.PARTICLE:
                    RenderWebGL.crc3.blendFunc(WebGL2RenderingContext.SRC_ALPHA, WebGL2RenderingContext.DST_ALPHA);
                    break;
                default:
                    break;
            }
        }
        static createPickTexture(_size) {
            const targetTexture = FudgeCore.Render.crc3.createTexture();
            FudgeCore.Render.crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, targetTexture);
            {
                const internalFormat = WebGL2RenderingContext.RGBA32I;
                const format = WebGL2RenderingContext.RGBA_INTEGER;
                const type = WebGL2RenderingContext.INT;
                FudgeCore.Render.pickBuffer = new Int32Array(_size * _size * 4);
                FudgeCore.Render.crc3.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, internalFormat, _size, _size, 0, format, type, FudgeCore.Render.pickBuffer);
                FudgeCore.Render.crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.LINEAR);
                FudgeCore.Render.crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_S, WebGL2RenderingContext.CLAMP_TO_EDGE);
                FudgeCore.Render.crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_T, WebGL2RenderingContext.CLAMP_TO_EDGE);
            }
            const framebuffer = FudgeCore.Render.crc3.createFramebuffer();
            FudgeCore.Render.crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, framebuffer);
            const attachmentPoint = WebGL2RenderingContext.COLOR_ATTACHMENT0;
            FudgeCore.Render.crc3.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, attachmentPoint, WebGL2RenderingContext.TEXTURE_2D, targetTexture, 0);
            RenderWebGL.sizePick = _size;
            return targetTexture;
        }
        static getPicks(_size, _cmpCamera) {
            let data = new Int32Array(_size * _size * 4);
            FudgeCore.Render.crc3.readPixels(0, 0, _size, _size, WebGL2RenderingContext.RGBA_INTEGER, WebGL2RenderingContext.INT, data);
            let mtxViewToWorld = FudgeCore.Matrix4x4.INVERSION(_cmpCamera.mtxWorldToView);
            let picked = [];
            for (let i = 0; i < FudgeCore.Render.ƒpicked.length; i++) {
                let zBuffer = data[4 * i + 0] + data[4 * i + 1] / 256;
                if (zBuffer == 0)
                    continue;
                let pick = FudgeCore.Render.ƒpicked[i];
                pick.zBuffer = convertInt32toFloat32(data, 4 * i + 0) * 2 - 1;
                pick.color = convertInt32toColor(data, 4 * i + 1);
                pick.textureUV = FudgeCore.Recycler.get(FudgeCore.Vector2);
                pick.textureUV.set(convertInt32toFloat32(data, 4 * i + 2), convertInt32toFloat32(data, 4 * i + 3));
                pick.mtxViewToWorld = mtxViewToWorld;
                picked.push(pick);
            }
            return picked;
            function convertInt32toFloat32(_int32Array, _index) {
                let buffer = new ArrayBuffer(4);
                let view = new DataView(buffer);
                view.setInt32(0, _int32Array[_index]);
                return view.getFloat32(0);
            }
            function convertInt32toColor(_int32Array, _index) {
                let buffer = new ArrayBuffer(4);
                let view = new DataView(buffer);
                view.setInt32(0, _int32Array[_index]);
                let color = FudgeCore.Color.CSS(`rgb(${view.getUint8(0)}, ${view.getUint8(1)}, ${view.getUint8(2)})`, view.getUint8(3) / 255);
                return color;
            }
        }
        static pick(_node, _mtxMeshToWorld, _mtxWorldToView) {
            try {
                let cmpMaterial = _node.getComponent(FudgeCore.ComponentMaterial);
                let cmpMesh = _node.getComponent(FudgeCore.ComponentMesh);
                let coat = cmpMaterial.material.coat;
                let shader = coat instanceof FudgeCore.CoatTextured ? FudgeCore.ShaderPickTextured : FudgeCore.ShaderPick;
                shader.useProgram();
                coat.useRenderData(shader, cmpMaterial);
                let sizeUniformLocation = shader.uniforms["u_size"];
                RenderWebGL.getRenderingContext().uniform2fv(sizeUniformLocation, [RenderWebGL.sizePick, RenderWebGL.sizePick]);
                let mesh = cmpMesh.mesh;
                mesh.useRenderBuffers(shader, _mtxMeshToWorld, _mtxWorldToView, FudgeCore.Render.ƒpicked.length);
                RenderWebGL.crc3.drawElements(WebGL2RenderingContext.TRIANGLES, mesh.renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0);
                let pick = new FudgeCore.Pick(_node);
                FudgeCore.Render.ƒpicked.push(pick);
            }
            catch (_error) {
            }
        }
        static setLightsInShader(_shader, _lights) {
            _shader.useProgram();
            let uni = _shader.uniforms;
            let ambient = uni["u_ambient.color"];
            if (ambient) {
                RenderWebGL.crc3.uniform4fv(ambient, [0, 0, 0, 0]);
                let cmpLights = _lights.get(FudgeCore.LightAmbient);
                if (cmpLights) {
                    let result = new FudgeCore.Color(0, 0, 0, 1);
                    for (let cmpLight of cmpLights)
                        result.add(cmpLight.light.color);
                    RenderWebGL.crc3.uniform4fv(ambient, result.getArray());
                }
            }
            let nDirectional = uni["u_nLightsDirectional"];
            if (nDirectional) {
                RenderWebGL.crc3.uniform1ui(nDirectional, 0);
                let cmpLights = _lights.get(FudgeCore.LightDirectional);
                if (cmpLights) {
                    let n = cmpLights.length;
                    RenderWebGL.crc3.uniform1ui(nDirectional, n);
                    for (let i = 0; i < n; i++) {
                        let cmpLight = cmpLights[i];
                        RenderWebGL.crc3.uniform4fv(uni[`u_directional[${i}].color`], cmpLight.light.color.getArray());
                        let direction = FudgeCore.Vector3.Z();
                        direction.transform(cmpLight.mtxPivot, false);
                        direction.transform(cmpLight.node.mtxWorld);
                        RenderWebGL.crc3.uniform3fv(uni[`u_directional[${i}].direction`], direction.get());
                    }
                }
            }
        }
        static drawMesh(_cmpMesh, cmpMaterial, _mtxMeshToWorld, _mtxWorldToView) {
            let shader = cmpMaterial.material.getShader();
            let coat = cmpMaterial.material.coat;
            shader.useProgram();
            _cmpMesh.mesh.useRenderBuffers(shader, _mtxMeshToWorld, _mtxWorldToView);
            coat.useRenderData(shader, cmpMaterial);
            RenderWebGL.crc3.drawElements(WebGL2RenderingContext.TRIANGLES, _cmpMesh.mesh.renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0);
        }
    }
    FudgeCore.RenderWebGL = RenderWebGL;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class RenderInjectorTexture extends FudgeCore.RenderInjector {
        static decorate(_constructor) {
            FudgeCore.RenderInjector.inject(_constructor, RenderInjectorTexture);
        }
        static injectTexture() {
            let crc3 = FudgeCore.RenderWebGL.getRenderingContext();
            if (this.renderData) {
                crc3.activeTexture(WebGL2RenderingContext.TEXTURE0);
                crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, this.renderData["texture0"]);
            }
            else {
                this.renderData = {};
                const texture = FudgeCore.Render.assert(crc3.createTexture());
                crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, texture);
                try {
                    crc3.texImage2D(crc3.TEXTURE_2D, 0, crc3.RGBA, crc3.RGBA, crc3.UNSIGNED_BYTE, this.texImageSource);
                    crc3.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, this.texImageSource);
                }
                catch (_error) {
                    FudgeCore.Debug.error(_error);
                }
                switch (this.mipmap) {
                    case FudgeCore.MIPMAP.CRISP:
                        crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MAG_FILTER, WebGL2RenderingContext.NEAREST);
                        crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.NEAREST);
                        break;
                    case FudgeCore.MIPMAP.MEDIUM:
                        crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MAG_FILTER, WebGL2RenderingContext.NEAREST);
                        crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.NEAREST_MIPMAP_LINEAR);
                        crc3.generateMipmap(crc3.TEXTURE_2D);
                        break;
                    case FudgeCore.MIPMAP.BLURRY:
                        crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MAG_FILTER, WebGL2RenderingContext.LINEAR);
                        crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.LINEAR_MIPMAP_LINEAR);
                        crc3.generateMipmap(crc3.TEXTURE_2D);
                        break;
                }
                this.renderData["texture0"] = texture;
                crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, null);
                this.useRenderData();
            }
        }
    }
    FudgeCore.RenderInjectorTexture = RenderInjectorTexture;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Node extends FudgeCore.EventTargetƒ {
        name;
        mtxWorld = FudgeCore.Matrix4x4.IDENTITY();
        timestampUpdate = 0;
        nNodesInBranch = 0;
        radius = 0;
        #mtxWorldInverseUpdated;
        #mtxWorldInverse;
        parent = null;
        children = [];
        components = {};
        listeners = {};
        captures = {};
        active = true;
        constructor(_name) {
            super();
            this.name = _name;
        }
        get isActive() {
            return this.active;
        }
        get cmpTransform() {
            return this.getComponents(FudgeCore.ComponentTransform)[0];
        }
        get mtxLocal() {
            return this.cmpTransform.mtxLocal;
        }
        get mtxWorldInverse() {
            if (this.#mtxWorldInverseUpdated != this.timestampUpdate)
                this.#mtxWorldInverse = FudgeCore.Matrix4x4.INVERSION(this.mtxWorld);
            this.#mtxWorldInverseUpdated = this.timestampUpdate;
            return this.#mtxWorldInverse;
        }
        get nChildren() {
            return this.children.length;
        }
        *getIterator(_active = false) {
            if (!_active || this.isActive) {
                yield this;
                for (let child of this.children)
                    yield* child.getIterator(_active);
            }
        }
        [Symbol.iterator]() {
            return this.getIterator();
        }
        activate(_on) {
            this.active = _on;
            this.dispatchEvent(new Event(_on ? "componentActivate" : "componentDeactivate"));
        }
        getParent() {
            return this.parent;
        }
        getAncestor() {
            let ancestor = this;
            while (ancestor.getParent())
                ancestor = ancestor.getParent();
            return ancestor;
        }
        getPath() {
            let ancestor = this;
            let path = [this];
            while (ancestor.getParent())
                path.unshift(ancestor = ancestor.getParent());
            return path;
        }
        getChild(_index) {
            return this.children[_index];
        }
        getChildren() {
            return this.children.slice(0);
        }
        getChildrenByName(_name) {
            let found = [];
            found = this.children.filter((_node) => _node.name == _name);
            return found;
        }
        appendChild = this.addChild;
        addChild(_child) {
            if (this.children.includes(_child))
                return;
            let inAudioGraph = false;
            let graphListened = FudgeCore.AudioManager.default.getGraphListeningTo();
            let ancestor = this;
            while (ancestor) {
                ancestor.timestampUpdate = 0;
                inAudioGraph = inAudioGraph || (ancestor == graphListened);
                if (ancestor == _child)
                    throw (new Error("Cyclic reference prohibited in node hierarchy, ancestors must not be added as children"));
                else
                    ancestor = ancestor.parent;
            }
            let previousParent = _child.parent;
            if (previousParent)
                previousParent.removeChild(_child);
            this.children.push(_child);
            _child.parent = this;
            _child.dispatchEvent(new Event("childAppend", { bubbles: true }));
            if (inAudioGraph)
                _child.broadcastEvent(new Event("childAppendToAudioGraph"));
        }
        removeChild(_child) {
            let found = this.findChild(_child);
            if (found < 0)
                return;
            _child.dispatchEvent(new Event("childRemove", { bubbles: true }));
            if (this.isDescendantOf(FudgeCore.AudioManager.default.getGraphListeningTo()))
                _child.broadcastEvent(new Event("childRemoveFromAudioGraph"));
            this.children.splice(found, 1);
            _child.parent = null;
        }
        removeAllChildren() {
            while (this.children.length)
                this.removeChild(this.children[0]);
        }
        findChild(_search) {
            return this.children.indexOf(_search);
        }
        replaceChild(_replace, _with) {
            let found = this.findChild(_replace);
            if (found < 0)
                return false;
            let previousParent = _with.getParent();
            if (previousParent)
                previousParent.removeChild(_with);
            _replace.parent = null;
            this.children[found] = _with;
            _with.parent = this;
            _with.dispatchEvent(new Event("childAppend", { bubbles: true }));
            if (this.isDescendantOf(FudgeCore.AudioManager.default.getGraphListeningTo()))
                _with.broadcastEvent(new Event("childAppendToAudioGraph"));
            return true;
        }
        isUpdated(_timestampUpdate) {
            return (this.timestampUpdate == _timestampUpdate);
        }
        isDescendantOf(_ancestor) {
            let node = this;
            while (node && node != _ancestor)
                node = node.parent;
            return (node != null);
        }
        applyAnimation(_mutator) {
            if (_mutator.components) {
                for (let componentName in _mutator.components) {
                    if (this.components[componentName]) {
                        let mutatorOfComponent = _mutator.components;
                        for (let i in mutatorOfComponent[componentName]) {
                            if (this.components[componentName][+i]) {
                                let componentToMutate = this.components[componentName][+i];
                                let mutatorArray = mutatorOfComponent[componentName];
                                let mutatorWithComponentName = mutatorArray[+i];
                                for (let cname in mutatorWithComponentName) {
                                    let mutatorToGive = mutatorWithComponentName[cname];
                                    componentToMutate.mutate(mutatorToGive);
                                }
                            }
                        }
                    }
                }
            }
            if (_mutator.children) {
                for (let i = 0; i < _mutator.children.length; i++) {
                    let name = _mutator.children[i]["ƒ.Node"].name;
                    let childNodes = this.getChildrenByName(name);
                    for (let childNode of childNodes) {
                        childNode.applyAnimation(_mutator.children[i]["ƒ.Node"]);
                    }
                }
            }
        }
        getAllComponents() {
            let all = [];
            for (let type in this.components) {
                all = all.concat(this.components[type]);
            }
            return all;
        }
        getComponents(_class) {
            return (this.components[_class.name] || []).slice(0);
        }
        getComponent(_class) {
            let list = this.components[_class.name];
            if (list)
                return list[0];
            return null;
        }
        attach(_component) {
            this.addComponent(_component);
        }
        addComponent(_component) {
            if (_component.node == this)
                return;
            let cmpList = this.components[_component.type];
            if (cmpList === undefined)
                this.components[_component.type] = [_component];
            else if (cmpList.length && _component.isSingleton)
                throw new Error("Component is marked singleton and can't be attached, no more than one allowed");
            else
                cmpList.push(_component);
            _component.attachToNode(this);
            _component.dispatchEvent(new Event("componentAdd"));
            this.dispatchEventToTargetOnly(new CustomEvent("componentAdd", { detail: _component }));
        }
        detach(_component) {
            this.removeComponent(_component);
        }
        removeComponent(_component) {
            try {
                let componentsOfType = this.components[_component.type];
                let foundAt = componentsOfType.indexOf(_component);
                if (foundAt < 0)
                    return;
                _component.dispatchEvent(new Event("componentRemove"));
                this.dispatchEventToTargetOnly(new CustomEvent("componentRemove", { detail: _component }));
                componentsOfType.splice(foundAt, 1);
                _component.attachToNode(null);
            }
            catch (_error) {
                throw new Error(`Unable to remove component '${_component}'in node named '${this.name}'`);
            }
        }
        serialize() {
            let serialization = {
                name: this.name
            };
            let components = {};
            for (let type in this.components) {
                components[type] = [];
                for (let component of this.components[type]) {
                    components[type].push(FudgeCore.Serializer.serialize(component));
                }
            }
            serialization["components"] = components;
            let children = [];
            for (let child of this.children) {
                children.push(FudgeCore.Serializer.serialize(child));
            }
            serialization["children"] = children;
            this.dispatchEvent(new Event("nodeSerialized"));
            return serialization;
        }
        async deserialize(_serialization) {
            this.name = _serialization.name;
            for (let type in _serialization.components) {
                for (let serializedComponent of _serialization.components[type]) {
                    let deserializedComponent = await FudgeCore.Serializer.deserialize(serializedComponent);
                    this.addComponent(deserializedComponent);
                }
            }
            for (let serializedChild of _serialization.children) {
                let deserializedChild = await FudgeCore.Serializer.deserialize(serializedChild);
                this.appendChild(deserializedChild);
            }
            this.dispatchEvent(new Event("nodeDeserialized"));
            return this;
        }
        toHierarchyString(_node = null, _level = 0) {
            if (!_node)
                _node = this;
            let prefix = "+".repeat(_level);
            let output = prefix + " " + _node.name + " | ";
            for (let type in _node.components)
                output += _node.components[type].length + " " + type.split("Component").pop() + ", ";
            output = output.slice(0, -2) + "</br>";
            for (let child of _node.children) {
                output += this.toHierarchyString(child, _level + 1);
            }
            return output;
        }
        addEventListener(_type, _handler, _capture = false) {
            let listListeners = _capture ? this.captures : this.listeners;
            if (!listListeners[_type])
                listListeners[_type] = [];
            listListeners[_type].push(_handler);
        }
        removeEventListener(_type, _handler, _capture = false) {
            let listenersForType = _capture ? this.captures[_type] : this.listeners[_type];
            if (listenersForType)
                for (let i = listenersForType.length - 1; i >= 0; i--)
                    if (listenersForType[i] == _handler)
                        listenersForType.splice(i, 1);
        }
        dispatchEvent(_event) {
            let ancestors = [];
            let upcoming = this;
            Object.defineProperty(_event, "target", { writable: true, value: this });
            while (upcoming.parent)
                ancestors.push(upcoming = upcoming.parent);
            Object.defineProperty(_event, "eventPhase", { writable: true, value: Event.CAPTURING_PHASE });
            for (let i = ancestors.length - 1; i >= 0; i--) {
                let ancestor = ancestors[i];
                Object.defineProperty(_event, "currentTarget", { writable: true, value: ancestor });
                this.callListeners(ancestor.captures[_event.type], _event);
            }
            Object.defineProperty(_event, "eventPhase", { writable: true, value: Event.AT_TARGET });
            Object.defineProperty(_event, "currentTarget", { writable: true, value: this });
            this.callListeners(this.captures[_event.type], _event);
            this.callListeners(this.listeners[_event.type], _event);
            if (!_event.bubbles)
                return true;
            Object.defineProperty(_event, "eventPhase", { writable: true, value: Event.BUBBLING_PHASE });
            for (let i = 0; i < ancestors.length; i++) {
                let ancestor = ancestors[i];
                Object.defineProperty(_event, "currentTarget", { writable: true, value: ancestor });
                this.callListeners(ancestor.listeners[_event.type], _event);
            }
            return true;
        }
        dispatchEventToTargetOnly(_event) {
            Object.defineProperty(_event, "eventPhase", { writable: true, value: Event.AT_TARGET });
            Object.defineProperty(_event, "currentTarget", { writable: true, value: this });
            this.callListeners(this.listeners[_event.type], _event);
            return true;
        }
        broadcastEvent(_event) {
            Object.defineProperty(_event, "eventPhase", { writable: true, value: Event.CAPTURING_PHASE });
            Object.defineProperty(_event, "target", { writable: true, value: this });
            this.broadcastEventRecursive(_event);
        }
        broadcastEventRecursive(_event) {
            Object.defineProperty(_event, "currentTarget", { writable: true, value: this });
            let captures = this.captures[_event.type] || [];
            for (let handler of captures)
                handler(_event);
            for (let child of this.children) {
                child.broadcastEventRecursive(_event);
            }
        }
        callListeners(_listeners, _event) {
            if (_listeners?.length > 0)
                for (let handler of _listeners)
                    handler(_event);
        }
    }
    FudgeCore.Node = Node;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Joint extends FudgeCore.Component {
        static baseClass = Joint;
        static subclasses = [];
        #idBodyAnchor = 0;
        #idBodyTied = 0;
        #bodyAnchor;
        #bodyTied;
        #connected = false;
        #anchor;
        #internalCollision = false;
        #breakForce = 0;
        #breakTorque = 0;
        #nameChildToConnect;
        singleton = false;
        constructor(_bodyAnchor = null, _bodyTied = null) {
            super();
            this.bodyAnchor = _bodyAnchor;
            this.bodyTied = _bodyTied;
            this.addEventListener("componentAdd", this.dirtyStatus);
            this.addEventListener("componentRemove", this.removeJoint);
        }
        static registerSubclass(_subclass) { return Joint.subclasses.push(_subclass) - 1; }
        get bodyAnchor() {
            return this.#bodyAnchor;
        }
        set bodyAnchor(_cmpRB) {
            this.#idBodyAnchor = _cmpRB != null ? _cmpRB.id : -1;
            this.#bodyAnchor = _cmpRB;
            this.disconnect();
            this.dirtyStatus();
        }
        get bodyTied() {
            return this.#bodyTied;
        }
        set bodyTied(_cmpRB) {
            this.#idBodyTied = _cmpRB != null ? _cmpRB.id : -1;
            this.#bodyTied = _cmpRB;
            this.disconnect();
            this.dirtyStatus();
        }
        get anchor() {
            return new FudgeCore.Vector3(this.#anchor.x, this.#anchor.y, this.#anchor.z);
        }
        set anchor(_value) {
            this.#anchor = new OIMO.Vec3(_value.x, _value.y, _value.z);
            this.disconnect();
            this.dirtyStatus();
        }
        get breakTorque() {
            return this.#breakTorque;
        }
        set breakTorque(_value) {
            this.#breakTorque = _value;
            if (this.joint != null)
                this.joint.setBreakTorque(this.#breakTorque);
        }
        get breakForce() {
            return this.#breakForce;
        }
        set breakForce(_value) {
            this.#breakForce = _value;
            if (this.joint != null)
                this.joint.setBreakForce(this.#breakForce);
        }
        get internalCollision() {
            return this.#internalCollision;
        }
        set internalCollision(_value) {
            this.#internalCollision = _value;
            if (this.joint != null)
                this.joint.setAllowCollision(this.#internalCollision);
        }
        connectChild(_name) {
            this.#nameChildToConnect = _name;
            if (!this.node)
                return;
            let children = this.node.getChildrenByName(_name);
            if (children.length == 1)
                this.connectNode(children.pop());
            else
                FudgeCore.Debug.warn(`${this.constructor.name} at ${this.node.name} fails to connect child with non existent or ambigous name ${_name}`);
        }
        connectNode(_node) {
            if (!_node || !this.node)
                return;
            FudgeCore.Debug.fudge(`${this.constructor.name} connected ${this.node.name} and ${_node.name}`);
            let connectBody = _node.getComponent(FudgeCore.ComponentRigidbody);
            let thisBody = this.node.getComponent(FudgeCore.ComponentRigidbody);
            if (!connectBody || !thisBody) {
                FudgeCore.Debug.warn(`${this.constructor.name} at ${this.node.name} fails due to missing rigidbodies on ${this.node.name} or ${_node.name}`);
                return;
            }
            this.bodyAnchor = thisBody;
            this.bodyTied = connectBody;
        }
        isConnected() {
            return this.#connected;
        }
        connect() {
            if (this.#connected == false) {
                if (this.#idBodyAnchor == -1 || this.#idBodyTied == -1) {
                    if (this.#nameChildToConnect)
                        this.connectChild(this.#nameChildToConnect);
                    return;
                }
                this.constructJoint();
                this.#connected = true;
                this.addJoint();
            }
        }
        disconnect() {
            if (this.#connected == true) {
                this.removeJoint();
                this.#connected = false;
            }
        }
        getOimoJoint() {
            return this.joint;
        }
        serialize() {
            let serialization = this.#getMutator();
            serialization.anchor = this.anchor.serialize();
            serialization[super.constructor.name] = super.serialize();
            return serialization;
        }
        async deserialize(_serialization) {
            this.anchor = await new FudgeCore.Vector3().deserialize(_serialization.anchor);
            this.#mutate(_serialization);
            await super.deserialize(_serialization[super.constructor.name]);
            this.connectChild(_serialization.nameChildToConnect);
            return this;
        }
        getMutator() {
            let mutator = super.getMutator(true);
            Object.assign(mutator, this.#getMutator());
            mutator.anchor = this.anchor.getMutator();
            return mutator;
        }
        async mutate(_mutator) {
            this.anchor = new FudgeCore.Vector3(...(Object.values(_mutator.anchor)));
            delete _mutator.anchor;
            this.connectChild(_mutator.nameChildToConnect);
            this.#mutate(_mutator);
            this.deleteFromMutator(_mutator, this.#getMutator());
            super.mutate(_mutator);
        }
        #getMutator = () => {
            let mutator = {
                nameChildToConnect: this.#nameChildToConnect,
                internalCollision: this.#internalCollision,
                breakForce: this.#breakForce,
                breakTorque: this.#breakTorque
            };
            return mutator;
        };
        #mutate = (_mutator) => {
            this.internalCollision = _mutator.internalCollision;
            this.breakForce = _mutator.breakForce;
            this.breakTorque = _mutator.breakTorque;
        };
        reduceMutator(_mutator) {
            delete _mutator.springDamper;
            delete _mutator.joint;
            delete _mutator.motor;
            super.reduceMutator(_mutator);
        }
        dirtyStatus() {
            FudgeCore.Physics.world.changeJointStatus(this);
        }
        addJoint() {
            FudgeCore.Physics.world.addJoint(this);
        }
        removeJoint() {
            FudgeCore.Physics.world.removeJoint(this);
        }
        constructJoint(..._configParams) {
            let posBodyAnchor = this.bodyAnchor.node.mtxWorld.translation;
            let worldAnchor = new OIMO.Vec3(posBodyAnchor.x + this.#anchor.x, posBodyAnchor.y + this.#anchor.y, posBodyAnchor.z + this.#anchor.z);
            this.config.init(this.#bodyAnchor.getOimoRigidbody(), this.#bodyTied.getOimoRigidbody(), worldAnchor, ..._configParams);
        }
        configureJoint() {
            this.joint.setBreakForce(this.breakForce);
            this.joint.setBreakTorque(this.breakTorque);
            this.joint.setAllowCollision(this.#internalCollision);
        }
        deleteFromMutator(_mutator, _delete) {
            for (let key in _delete)
                delete _mutator[key];
        }
    }
    FudgeCore.Joint = Joint;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class JointAxial extends FudgeCore.Joint {
        #maxMotor = 10;
        #minMotor = -10;
        #motorSpeed = 0;
        #axis;
        #springFrequency = 0;
        #springDamping = 0;
        springDamper;
        constructor(_bodyAnchor = null, _bodyTied = null, _axis = new FudgeCore.Vector3(0, 1, 0), _localAnchor = new FudgeCore.Vector3(0, 0, 0)) {
            super(_bodyAnchor, _bodyTied);
            this.axis = _axis;
            this.anchor = _localAnchor;
            this.minMotor = -10;
            this.maxMotor = 10;
        }
        get axis() {
            return new FudgeCore.Vector3(this.#axis.x, this.#axis.y, this.#axis.z);
        }
        set axis(_value) {
            this.#axis = new OIMO.Vec3(_value.x, _value.y, _value.z);
            this.disconnect();
            this.dirtyStatus();
        }
        get maxMotor() {
            return this.#maxMotor;
        }
        set maxMotor(_value) {
            this.#maxMotor = _value;
            try {
                this.joint.getLimitMotor().upperLimit = _value;
            }
            catch (_e) { }
        }
        get minMotor() {
            return this.#minMotor;
        }
        set minMotor(_value) {
            this.#minMotor = _value;
            try {
                this.joint.getLimitMotor().lowerLimit = _value;
            }
            catch (_e) { }
        }
        get springDamping() {
            return this.#springDamping;
        }
        set springDamping(_value) {
            this.#springDamping = _value;
            try {
                this.joint.getSpringDamper().dampingRatio = _value;
            }
            catch (_e) { }
        }
        get motorSpeed() {
            return this.#motorSpeed;
        }
        set motorSpeed(_value) {
            this.#motorSpeed = _value;
            try {
                this.joint.getLimitMotor().motorSpeed = _value;
            }
            catch (_e) { }
        }
        get springFrequency() {
            return this.#springFrequency;
        }
        set springFrequency(_value) {
            this.#springFrequency = _value;
            try {
                this.joint.getSpringDamper().frequency = _value;
            }
            catch (_e) { }
        }
        serialize() {
            let serialization = this.#getMutator();
            serialization.axis = this.axis.serialize();
            serialization[super.constructor.name] = super.serialize();
            return serialization;
        }
        async deserialize(_serialization) {
            this.axis = await new FudgeCore.Vector3().deserialize(_serialization.axis);
            this.#mutate(_serialization);
            super.deserialize(_serialization[super.constructor.name]);
            return this;
        }
        async mutate(_mutator) {
            this.axis = new FudgeCore.Vector3(...(Object.values(_mutator.axis)));
            delete _mutator.axis;
            this.#mutate(_mutator);
            this.deleteFromMutator(_mutator, this.#getMutator());
            super.mutate(_mutator);
        }
        getMutator() {
            let mutator = super.getMutator();
            mutator.axis = this.axis.getMutator();
            Object.assign(mutator, this.#getMutator());
            return mutator;
        }
        #getMutator = () => {
            let mutator = {
                springDamping: this.#springDamping,
                springFrequency: this.#springFrequency,
                maxMotor: this.#maxMotor,
                minMotor: this.#minMotor,
                motorSpeed: this.#motorSpeed
            };
            return mutator;
        };
        #mutate = (_mutator) => {
            this.springDamping = _mutator.springDamping;
            this.springFrequency = _mutator.springFrequency;
            this.maxMotor = _mutator.maxMotor;
            this.minMotor = _mutator.minMotor;
            this.motorSpeed = _mutator.motorSpeed;
        };
        constructJoint() {
            this.springDamper = new OIMO.SpringDamper().setSpring(this.#springFrequency, this.#springDamping);
            super.constructJoint(this.#axis);
        }
    }
    FudgeCore.JointAxial = JointAxial;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    let ANIMATION_STRUCTURE_TYPE;
    (function (ANIMATION_STRUCTURE_TYPE) {
        ANIMATION_STRUCTURE_TYPE[ANIMATION_STRUCTURE_TYPE["NORMAL"] = 0] = "NORMAL";
        ANIMATION_STRUCTURE_TYPE[ANIMATION_STRUCTURE_TYPE["REVERSE"] = 1] = "REVERSE";
        ANIMATION_STRUCTURE_TYPE[ANIMATION_STRUCTURE_TYPE["RASTERED"] = 2] = "RASTERED";
        ANIMATION_STRUCTURE_TYPE[ANIMATION_STRUCTURE_TYPE["RASTEREDREVERSE"] = 3] = "RASTEREDREVERSE";
    })(ANIMATION_STRUCTURE_TYPE || (ANIMATION_STRUCTURE_TYPE = {}));
    let ANIMATION_PLAYMODE;
    (function (ANIMATION_PLAYMODE) {
        ANIMATION_PLAYMODE[ANIMATION_PLAYMODE["LOOP"] = 0] = "LOOP";
        ANIMATION_PLAYMODE[ANIMATION_PLAYMODE["PLAYONCE"] = 1] = "PLAYONCE";
        ANIMATION_PLAYMODE[ANIMATION_PLAYMODE["PLAYONCESTOPAFTER"] = 2] = "PLAYONCESTOPAFTER";
        ANIMATION_PLAYMODE[ANIMATION_PLAYMODE["REVERSELOOP"] = 3] = "REVERSELOOP";
        ANIMATION_PLAYMODE[ANIMATION_PLAYMODE["STOP"] = 4] = "STOP";
    })(ANIMATION_PLAYMODE = FudgeCore.ANIMATION_PLAYMODE || (FudgeCore.ANIMATION_PLAYMODE = {}));
    let ANIMATION_PLAYBACK;
    (function (ANIMATION_PLAYBACK) {
        ANIMATION_PLAYBACK[ANIMATION_PLAYBACK["TIMEBASED_CONTINOUS"] = 0] = "TIMEBASED_CONTINOUS";
        ANIMATION_PLAYBACK[ANIMATION_PLAYBACK["TIMEBASED_RASTERED_TO_FPS"] = 1] = "TIMEBASED_RASTERED_TO_FPS";
        ANIMATION_PLAYBACK[ANIMATION_PLAYBACK["FRAMEBASED"] = 2] = "FRAMEBASED";
    })(ANIMATION_PLAYBACK = FudgeCore.ANIMATION_PLAYBACK || (FudgeCore.ANIMATION_PLAYBACK = {}));
    class Animation extends FudgeCore.Mutable {
        idResource;
        name;
        totalTime = 0;
        labels = {};
        animationStructure;
        events = {};
        framesPerSecond = 60;
        eventsProcessed = new Map();
        animationStructuresProcessed = new Map();
        constructor(_name, _animStructure = {}, _fps = 60) {
            super();
            this.name = _name;
            this.animationStructure = _animStructure;
            this.animationStructuresProcessed.set(ANIMATION_STRUCTURE_TYPE.NORMAL, _animStructure);
            this.framesPerSecond = _fps;
            this.calculateTotalTime();
            FudgeCore.Project.register(this);
        }
        get getLabels() {
            let en = new Enumerator(this.labels);
            return en;
        }
        get fps() {
            return this.framesPerSecond;
        }
        set fps(_fps) {
            this.framesPerSecond = _fps;
            this.eventsProcessed.clear();
            this.animationStructuresProcessed.clear();
        }
        getMutated(_time, _direction, _playback) {
            let m = {};
            let animationStructure;
            if (_playback == ANIMATION_PLAYBACK.TIMEBASED_CONTINOUS)
                animationStructure = _direction < 0 ? ANIMATION_STRUCTURE_TYPE.REVERSE : ANIMATION_STRUCTURE_TYPE.NORMAL;
            else
                animationStructure = _direction < 0 ? ANIMATION_STRUCTURE_TYPE.RASTEREDREVERSE : ANIMATION_STRUCTURE_TYPE.RASTERED;
            m = this.traverseStructureForMutator(this.getProcessedAnimationStructure(animationStructure), _time);
            return m;
        }
        getEventsToFire(_min, _max, _playback, _direction) {
            let eventList = [];
            let minSection = Math.floor(_min / this.totalTime);
            let maxSection = Math.floor(_max / this.totalTime);
            _min = _min % this.totalTime;
            _max = _max % this.totalTime;
            while (minSection <= maxSection) {
                let eventTriggers = this.getCorrectEventList(_direction, _playback);
                if (minSection == maxSection) {
                    eventList = eventList.concat(this.checkEventsBetween(eventTriggers, _min, _max));
                }
                else {
                    eventList = eventList.concat(this.checkEventsBetween(eventTriggers, _min, this.totalTime));
                    _min = 0;
                }
                minSection++;
            }
            return eventList;
        }
        setEvent(_name, _time) {
            this.events[_name] = _time;
            this.eventsProcessed.clear();
        }
        removeEvent(_name) {
            delete this.events[_name];
            this.eventsProcessed.clear();
        }
        calculateTotalTime() {
            this.totalTime = 0;
            this.traverseStructureForTime(this.animationStructure);
        }
        getModalTime(_time, _playmode, _timeStop = _time) {
            switch (_playmode) {
                case ANIMATION_PLAYMODE.STOP:
                    return _timeStop;
                case ANIMATION_PLAYMODE.PLAYONCE:
                    if (_time >= this.totalTime)
                        return this.totalTime - 0.01;
                case ANIMATION_PLAYMODE.PLAYONCESTOPAFTER:
                    if (_time >= this.totalTime)
                        return this.totalTime + 0.01;
            }
            return _time;
        }
        calculateDirection(_time, _playmode) {
            switch (_playmode) {
                case ANIMATION_PLAYMODE.STOP:
                    return 0;
                case ANIMATION_PLAYMODE.REVERSELOOP:
                    return -1;
                case ANIMATION_PLAYMODE.PLAYONCE:
                case ANIMATION_PLAYMODE.PLAYONCESTOPAFTER:
                    if (_time >= this.totalTime) {
                        return 0;
                    }
                default:
                    return 1;
            }
        }
        serialize() {
            let s = {
                idResource: this.idResource,
                name: this.name,
                labels: {},
                events: {},
                fps: this.framesPerSecond,
            };
            for (let name in this.labels) {
                s.labels[name] = this.labels[name];
            }
            for (let name in this.events) {
                s.events[name] = this.events[name];
            }
            s.animationStructure = this.traverseStructureForSerialisation(this.animationStructure);
            return s;
        }
        async deserialize(_serialization) {
            this.idResource = _serialization.idResource;
            this.name = _serialization.name;
            this.framesPerSecond = _serialization.fps;
            this.labels = {};
            for (let name in _serialization.labels) {
                this.labels[name] = _serialization.labels[name];
            }
            this.events = {};
            for (let name in _serialization.events) {
                this.events[name] = _serialization.events[name];
            }
            this.eventsProcessed = new Map();
            this.animationStructure = await this.traverseStructureForDeserialisation(_serialization.animationStructure);
            this.animationStructuresProcessed = new Map();
            this.calculateTotalTime();
            return this;
        }
        getMutator() {
            return this.serialize();
        }
        reduceMutator(_mutator) {
            delete _mutator.totalTime;
        }
        traverseStructureForSerialisation(_structure) {
            let newSerialization = {};
            for (let n in _structure) {
                if (_structure[n] instanceof FudgeCore.AnimationSequence) {
                    newSerialization[n] = _structure[n].serialize();
                }
                else {
                    newSerialization[n] = this.traverseStructureForSerialisation(_structure[n]);
                }
            }
            return newSerialization;
        }
        async traverseStructureForDeserialisation(_serialization) {
            let newStructure = {};
            for (let n in _serialization) {
                if (_serialization[n].animationSequence) {
                    let animSeq = new FudgeCore.AnimationSequence();
                    newStructure[n] = await animSeq.deserialize(_serialization[n]);
                }
                else {
                    newStructure[n] = await this.traverseStructureForDeserialisation(_serialization[n]);
                }
            }
            return newStructure;
        }
        getCorrectEventList(_direction, _playback) {
            if (_playback != ANIMATION_PLAYBACK.FRAMEBASED) {
                if (_direction >= 0) {
                    return this.getProcessedEventTrigger(ANIMATION_STRUCTURE_TYPE.NORMAL);
                }
                else {
                    return this.getProcessedEventTrigger(ANIMATION_STRUCTURE_TYPE.REVERSE);
                }
            }
            else {
                if (_direction >= 0) {
                    return this.getProcessedEventTrigger(ANIMATION_STRUCTURE_TYPE.RASTERED);
                }
                else {
                    return this.getProcessedEventTrigger(ANIMATION_STRUCTURE_TYPE.RASTEREDREVERSE);
                }
            }
        }
        traverseStructureForMutator(_structure, _time) {
            let newMutator = {};
            for (let n in _structure) {
                if (_structure[n] instanceof FudgeCore.AnimationSequence) {
                    newMutator[n] = _structure[n].evaluate(_time);
                }
                else {
                    newMutator[n] = this.traverseStructureForMutator(_structure[n], _time);
                }
            }
            return newMutator;
        }
        traverseStructureForTime(_structure) {
            for (let n in _structure) {
                if (_structure[n] instanceof FudgeCore.AnimationSequence) {
                    let sequence = _structure[n];
                    if (sequence.length > 0) {
                        let sequenceTime = sequence.getKey(sequence.length - 1).Time;
                        this.totalTime = sequenceTime > this.totalTime ? sequenceTime : this.totalTime;
                    }
                }
                else {
                    this.traverseStructureForTime(_structure[n]);
                }
            }
        }
        getProcessedAnimationStructure(_type) {
            if (!this.animationStructuresProcessed.has(_type)) {
                this.calculateTotalTime();
                let ae = {};
                switch (_type) {
                    case ANIMATION_STRUCTURE_TYPE.NORMAL:
                        ae = this.animationStructure;
                        break;
                    case ANIMATION_STRUCTURE_TYPE.REVERSE:
                        ae = this.traverseStructureForNewStructure(this.animationStructure, this.calculateReverseSequence.bind(this));
                        break;
                    case ANIMATION_STRUCTURE_TYPE.RASTERED:
                        ae = this.traverseStructureForNewStructure(this.animationStructure, this.calculateRasteredSequence.bind(this));
                        break;
                    case ANIMATION_STRUCTURE_TYPE.RASTEREDREVERSE:
                        ae = this.traverseStructureForNewStructure(this.getProcessedAnimationStructure(ANIMATION_STRUCTURE_TYPE.REVERSE), this.calculateRasteredSequence.bind(this));
                        break;
                    default:
                        return {};
                }
                this.animationStructuresProcessed.set(_type, ae);
            }
            return this.animationStructuresProcessed.get(_type);
        }
        getProcessedEventTrigger(_type) {
            if (!this.eventsProcessed.has(_type)) {
                this.calculateTotalTime();
                let ev = {};
                switch (_type) {
                    case ANIMATION_STRUCTURE_TYPE.NORMAL:
                        ev = this.events;
                        break;
                    case ANIMATION_STRUCTURE_TYPE.REVERSE:
                        ev = this.calculateReverseEventTriggers(this.events);
                        break;
                    case ANIMATION_STRUCTURE_TYPE.RASTERED:
                        ev = this.calculateRasteredEventTriggers(this.events);
                        break;
                    case ANIMATION_STRUCTURE_TYPE.RASTEREDREVERSE:
                        ev = this.calculateRasteredEventTriggers(this.getProcessedEventTrigger(ANIMATION_STRUCTURE_TYPE.REVERSE));
                        break;
                    default:
                        return {};
                }
                this.eventsProcessed.set(_type, ev);
            }
            return this.eventsProcessed.get(_type);
        }
        traverseStructureForNewStructure(_oldStructure, _functionToUse) {
            let newStructure = {};
            for (let n in _oldStructure) {
                if (_oldStructure[n] instanceof FudgeCore.AnimationSequence) {
                    newStructure[n] = _functionToUse(_oldStructure[n]);
                }
                else {
                    newStructure[n] = this.traverseStructureForNewStructure(_oldStructure[n], _functionToUse);
                }
            }
            return newStructure;
        }
        calculateReverseSequence(_sequence) {
            let seq = new FudgeCore.AnimationSequence();
            for (let i = 0; i < _sequence.length; i++) {
                let oldKey = _sequence.getKey(i);
                let key = new FudgeCore.AnimationKey(this.totalTime - oldKey.Time, oldKey.Value, oldKey.SlopeOut, oldKey.SlopeIn, oldKey.Constant);
                seq.addKey(key);
            }
            return seq;
        }
        calculateRasteredSequence(_sequence) {
            let seq = new FudgeCore.AnimationSequence();
            let frameTime = 1000 / this.framesPerSecond;
            for (let i = 0; i < this.totalTime; i += frameTime) {
                let key = new FudgeCore.AnimationKey(i, _sequence.evaluate(i), 0, 0, true);
                seq.addKey(key);
            }
            return seq;
        }
        calculateReverseEventTriggers(_events) {
            let ae = {};
            for (let name in _events) {
                ae[name] = this.totalTime - _events[name];
            }
            return ae;
        }
        calculateRasteredEventTriggers(_events) {
            let ae = {};
            let frameTime = 1000 / this.framesPerSecond;
            for (let name in _events) {
                ae[name] = _events[name] - (_events[name] % frameTime);
            }
            return ae;
        }
        checkEventsBetween(_eventTriggers, _min, _max) {
            let eventsToTrigger = [];
            for (let name in _eventTriggers) {
                if (_min <= _eventTriggers[name] && _eventTriggers[name] < _max) {
                    eventsToTrigger.push(name);
                }
            }
            return eventsToTrigger;
        }
    }
    FudgeCore.Animation = Animation;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class AnimationFunction {
        a = 0;
        b = 0;
        c = 0;
        d = 0;
        keyIn;
        keyOut;
        constructor(_keyIn, _keyOut = null) {
            this.keyIn = _keyIn;
            this.keyOut = _keyOut;
            this.calculate();
        }
        evaluate(_time) {
            _time -= this.keyIn.Time;
            let time2 = _time * _time;
            let time3 = time2 * _time;
            return this.a * time3 + this.b * time2 + this.c * _time + this.d;
        }
        set setKeyIn(_keyIn) {
            this.keyIn = _keyIn;
            this.calculate();
        }
        set setKeyOut(_keyOut) {
            this.keyOut = _keyOut;
            this.calculate();
        }
        calculate() {
            if (!this.keyIn) {
                this.d = this.c = this.b = this.a = 0;
                return;
            }
            if (!this.keyOut || this.keyIn.Constant) {
                this.d = this.keyIn.Value;
                this.c = this.b = this.a = 0;
                return;
            }
            let x1 = this.keyOut.Time - this.keyIn.Time;
            this.d = this.keyIn.Value;
            this.c = this.keyIn.SlopeOut;
            this.a = (-x1 * (this.keyIn.SlopeOut + this.keyOut.SlopeIn) - 2 * this.keyIn.Value + 2 * this.keyOut.Value) / -Math.pow(x1, 3);
            this.b = (this.keyOut.SlopeIn - this.keyIn.SlopeOut - 3 * this.a * Math.pow(x1, 2)) / (2 * x1);
        }
    }
    FudgeCore.AnimationFunction = AnimationFunction;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class AnimationKey extends FudgeCore.Mutable {
        functionIn;
        functionOut;
        broken;
        time;
        value;
        constant = false;
        slopeIn = 0;
        slopeOut = 0;
        constructor(_time = 0, _value = 0, _slopeIn = 0, _slopeOut = 0, _constant = false) {
            super();
            this.time = _time;
            this.value = _value;
            this.slopeIn = _slopeIn;
            this.slopeOut = _slopeOut;
            this.constant = _constant;
            this.broken = this.slopeIn != -this.slopeOut;
            this.functionOut = new FudgeCore.AnimationFunction(this, null);
        }
        static compare(_a, _b) {
            return _a.time - _b.time;
        }
        get Time() {
            return this.time;
        }
        set Time(_time) {
            this.time = _time;
            this.functionIn.calculate();
            this.functionOut.calculate();
        }
        get Value() {
            return this.value;
        }
        set Value(_value) {
            this.value = _value;
            this.functionIn.calculate();
            this.functionOut.calculate();
        }
        get Constant() {
            return this.constant;
        }
        set Constant(_constant) {
            this.constant = _constant;
            this.functionIn.calculate();
            this.functionOut.calculate();
        }
        get SlopeIn() {
            return this.slopeIn;
        }
        set SlopeIn(_slope) {
            this.slopeIn = _slope;
            this.functionIn.calculate();
        }
        get SlopeOut() {
            return this.slopeOut;
        }
        set SlopeOut(_slope) {
            this.slopeOut = _slope;
            this.functionOut.calculate();
        }
        serialize() {
            let s = {};
            s.time = this.time;
            s.value = this.value;
            s.slopeIn = this.slopeIn;
            s.slopeOut = this.slopeOut;
            s.constant = this.constant;
            return s;
        }
        async deserialize(_serialization) {
            this.time = _serialization.time;
            this.value = _serialization.value;
            this.slopeIn = _serialization.slopeIn;
            this.slopeOut = _serialization.slopeOut;
            this.constant = _serialization.constant;
            this.broken = this.slopeIn != -this.slopeOut;
            return this;
        }
        getMutator() {
            return this.serialize();
        }
        reduceMutator(_mutator) {
        }
    }
    FudgeCore.AnimationKey = AnimationKey;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class AnimationSequence extends FudgeCore.Mutable {
        keys = [];
        get length() {
            return this.keys.length;
        }
        evaluate(_time) {
            if (this.keys.length == 0)
                return 0;
            if (this.keys.length == 1 || this.keys[0].Time >= _time)
                return this.keys[0].Value;
            for (let i = 0; i < this.keys.length - 1; i++) {
                if (this.keys[i].Time <= _time && this.keys[i + 1].Time > _time) {
                    return this.keys[i].functionOut.evaluate(_time);
                }
            }
            return this.keys[this.keys.length - 1].Value;
        }
        addKey(_key) {
            this.keys.push(_key);
            this.keys.sort(FudgeCore.AnimationKey.compare);
            this.regenerateFunctions();
        }
        removeKey(_key) {
            for (let i = 0; i < this.keys.length; i++) {
                if (this.keys[i] == _key) {
                    this.keys.splice(i, 1);
                    this.regenerateFunctions();
                    return;
                }
            }
        }
        removeKeyAtIndex(_index) {
            if (_index < 0 || _index >= this.keys.length) {
                return null;
            }
            let ak = this.keys[_index];
            this.keys.splice(_index, 1);
            this.regenerateFunctions();
            return ak;
        }
        getKey(_index) {
            if (_index < 0 || _index >= this.keys.length)
                return null;
            return this.keys[_index];
        }
        serialize() {
            let s = {
                keys: [],
                animationSequence: true
            };
            for (let i = 0; i < this.keys.length; i++) {
                s.keys[i] = this.keys[i].serialize();
            }
            return s;
        }
        async deserialize(_serialization) {
            for (let i = 0; i < _serialization.keys.length; i++) {
                let k = new FudgeCore.AnimationKey();
                await k.deserialize(_serialization.keys[i]);
                this.keys[i] = k;
            }
            this.regenerateFunctions();
            return this;
        }
        reduceMutator(_mutator) {
        }
        regenerateFunctions() {
            for (let i = 0; i < this.keys.length; i++) {
                let f = new FudgeCore.AnimationFunction(this.keys[i]);
                this.keys[i].functionOut = f;
                if (i == this.keys.length - 1) {
                    f.setKeyOut = this.keys[0];
                    this.keys[0].functionIn = f;
                    break;
                }
                f.setKeyOut = this.keys[i + 1];
                this.keys[i + 1].functionIn = f;
            }
        }
    }
    FudgeCore.AnimationSequence = AnimationSequence;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Audio extends FudgeCore.Mutable {
        name = "Audio";
        idResource = undefined;
        buffer = undefined;
        path = undefined;
        url = undefined;
        ready = false;
        constructor(_url) {
            super();
            if (_url) {
                this.load(_url);
                this.name = _url.toString().split("/").pop();
            }
            FudgeCore.Project.register(this);
        }
        get isReady() {
            return this.ready;
        }
        async load(_url) {
            FudgeCore.Debug.fudge("AudioLoad", _url);
            this.url = _url;
            this.ready = false;
            this.path = new URL(this.url.toString(), FudgeCore.Project.baseURL);
            const response = await window.fetch(this.path.toString());
            const arrayBuffer = await response.arrayBuffer();
            let buffer = await FudgeCore.AudioManager.default.decodeAudioData(arrayBuffer);
            this.buffer = buffer;
            this.ready = true;
            this.dispatchEvent(new Event("ready"));
        }
        serialize() {
            return {
                url: this.url,
                idResource: this.idResource,
                name: this.name,
                type: this.type
            };
        }
        async deserialize(_serialization) {
            FudgeCore.Project.register(this, _serialization.idResource);
            await this.load(_serialization.url);
            this.name = _serialization.name;
            return this;
        }
        async mutate(_mutator) {
            let url = _mutator.url;
            if (_mutator.url != this.url.toString())
                this.load(_mutator.url);
            delete (_mutator.url);
            super.mutate(_mutator);
            Reflect.set(_mutator, "url", url);
        }
        reduceMutator(_mutator) {
            delete _mutator.ready;
        }
    }
    FudgeCore.Audio = Audio;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class AudioManager extends AudioContext {
        static default = new AudioManager({ latencyHint: "interactive", sampleRate: 44100 });
        gain;
        graph = null;
        cmpListener = null;
        constructor(contextOptions) {
            super(contextOptions);
            this.gain = this.createGain();
            this.gain.connect(this.destination);
        }
        set volume(_value) {
            this.gain.gain.value = _value;
        }
        get volume() {
            return this.gain.gain.value;
        }
        listenTo = (_graph) => {
            if (this.graph)
                this.graph.broadcastEvent(new Event("childRemoveFromAudioGraph"));
            if (!_graph)
                return;
            this.graph = _graph;
            this.graph.broadcastEvent(new Event("childAppendToAudioGraph"));
        };
        getGraphListeningTo = () => {
            return this.graph;
        };
        listenWith = (_cmpListener) => {
            this.cmpListener = _cmpListener;
        };
        update = () => {
            this.graph.broadcastEvent(new Event("updateAudioGraph"));
            if (this.cmpListener)
                this.cmpListener.update(this.listener);
        };
    }
    FudgeCore.AudioManager = AudioManager;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ComponentAnimator extends FudgeCore.Component {
        static iSubclass = FudgeCore.Component.registerSubclass(ComponentAnimator);
        animation;
        playmode;
        playback;
        scaleWithGameTime = true;
        #scale = 1;
        #timeLocal;
        #previous = 0;
        constructor(_animation = new FudgeCore.Animation(""), _playmode = FudgeCore.ANIMATION_PLAYMODE.LOOP, _playback = FudgeCore.ANIMATION_PLAYBACK.TIMEBASED_CONTINOUS) {
            super();
            this.animation = _animation;
            this.playmode = _playmode;
            this.playback = _playback;
            this.#timeLocal = new FudgeCore.Time();
            this.animation.calculateTotalTime();
            this.addEventListener("componentRemove", () => this.activate(false));
            this.addEventListener("componentAdd", () => {
                this.node.addEventListener("childRemove", () => this.activate(false));
                this.activate(true);
            });
        }
        set scale(_scale) {
            this.#scale = _scale;
            this.updateScale();
        }
        get scale() {
            return this.#scale;
        }
        get time() {
            return this.#timeLocal.get() % this.animation.totalTime;
        }
        activate(_on) {
            super.activate(_on);
            if (!this.node)
                return;
            if (_on) {
                FudgeCore.Time.game.addEventListener("timeScaled", this.updateScale);
                this.node.addEventListener("renderPrepare", this.updateAnimationLoop);
            }
            else {
                FudgeCore.Time.game.addEventListener("timeScaled", this.updateScale);
                this.node.removeEventListener("renderPrepare", this.updateAnimationLoop);
            }
        }
        jumpTo(_time) {
            this.#timeLocal.set(_time);
            this.#previous = _time;
            _time = _time % this.animation.totalTime;
            let mutator = this.animation.getMutated(_time, this.animation.calculateDirection(_time, this.playmode), this.playback);
            this.node.applyAnimation(mutator);
        }
        jumpToLabel(_label) {
            let time = this.animation.labels[_label];
            if (time)
                this.jumpTo(time);
        }
        updateAnimation(_time) {
            return this.updateAnimationLoop(null, _time);
        }
        serialize() {
            let serialization = super.serialize();
            serialization.idAnimation = this.animation.idResource;
            serialization.playmode = this.playmode;
            serialization.playback = this.playback;
            serialization.scale = this.scale;
            serialization.scaleWithGameTime = this.scaleWithGameTime;
            serialization[super.constructor.name] = super.serialize();
            return serialization;
        }
        async deserialize(_serialization) {
            await super.deserialize(_serialization[super.constructor.name]);
            this.animation = await FudgeCore.Project.getResource(_serialization.idAnimation);
            this.playback = _serialization.playback;
            this.playmode = _serialization.playmode;
            this.scale = _serialization.scale;
            this.scaleWithGameTime = _serialization.scaleWithGameTime;
            return this;
        }
        updateAnimationLoop = (_e, _time) => {
            if (this.animation.totalTime == 0)
                return [null, 0];
            let time = _time || this.#timeLocal.get();
            if (this.playback == FudgeCore.ANIMATION_PLAYBACK.FRAMEBASED) {
                time = this.#previous + (1000 / this.animation.fps);
            }
            let direction = this.animation.calculateDirection(time, this.playmode);
            time = this.animation.getModalTime(time, this.playmode, this.#timeLocal.getOffset());
            this.executeEvents(this.animation.getEventsToFire(this.#previous, time, this.playback, direction));
            if (this.#previous != time) {
                this.#previous = time;
                time = time % this.animation.totalTime;
                let mutator = this.animation.getMutated(time, direction, this.playback);
                if (this.node) {
                    this.node.applyAnimation(mutator);
                }
                return [mutator, time];
            }
            return [null, time];
        };
        executeEvents(events) {
            for (let i = 0; i < events.length; i++) {
                this.dispatchEvent(new Event(events[i]));
            }
        }
        updateScale = () => {
            let newScale = this.#scale;
            if (this.scaleWithGameTime)
                newScale *= FudgeCore.Time.game.getScale();
            this.#timeLocal.setScale(newScale);
        };
    }
    FudgeCore.ComponentAnimator = ComponentAnimator;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    let AUDIO_PANNER;
    (function (AUDIO_PANNER) {
        AUDIO_PANNER["CONE_INNER_ANGLE"] = "coneInnerAngle";
        AUDIO_PANNER["CONE_OUTER_ANGLE"] = "coneOuterAngle";
        AUDIO_PANNER["CONE_OUTER_GAIN"] = "coneOuterGain";
        AUDIO_PANNER["DISTANCE_MODEL"] = "distanceModel";
        AUDIO_PANNER["MAX_DISTANCE"] = "maxDistance";
        AUDIO_PANNER["PANNING_MODEL"] = "panningModel";
        AUDIO_PANNER["REF_DISTANCE"] = "refDistance";
        AUDIO_PANNER["ROLLOFF_FACTOR"] = "rolloffFactor";
    })(AUDIO_PANNER = FudgeCore.AUDIO_PANNER || (FudgeCore.AUDIO_PANNER = {}));
    let AUDIO_NODE_TYPE;
    (function (AUDIO_NODE_TYPE) {
        AUDIO_NODE_TYPE[AUDIO_NODE_TYPE["SOURCE"] = 0] = "SOURCE";
        AUDIO_NODE_TYPE[AUDIO_NODE_TYPE["PANNER"] = 1] = "PANNER";
        AUDIO_NODE_TYPE[AUDIO_NODE_TYPE["GAIN"] = 2] = "GAIN";
    })(AUDIO_NODE_TYPE = FudgeCore.AUDIO_NODE_TYPE || (FudgeCore.AUDIO_NODE_TYPE = {}));
    class ComponentAudio extends FudgeCore.Component {
        static iSubclass = FudgeCore.Component.registerSubclass(ComponentAudio);
        mtxPivot = FudgeCore.Matrix4x4.IDENTITY();
        singleton = false;
        audio;
        gain;
        panner;
        source;
        audioManager;
        playing = false;
        listened = false;
        constructor(_audio = null, _loop = false, _start = false, _audioManager = FudgeCore.AudioManager.default) {
            super();
            this.install(_audioManager);
            this.createSource(_audio, _loop);
            this.addEventListener("componentAdd", this.handleAttach);
            this.addEventListener("componentRemove", this.handleAttach);
            if (_start)
                this.play(_start);
        }
        set volume(_value) {
            this.gain.gain.value = _value;
        }
        get volume() {
            return this.gain.gain.value;
        }
        set loop(_on) {
            this.source.loop = _on;
        }
        get loop() {
            return this.source.loop;
        }
        get isPlaying() {
            return this.playing;
        }
        get isAttached() {
            return this.node != null;
        }
        get isListened() {
            return this.listened;
        }
        setAudio(_audio) {
            this.createSource(_audio, this.source.loop);
        }
        getAudio() {
            return this.audio;
        }
        setPanner(_property, _value) {
            Reflect.set(this.panner, _property, _value);
        }
        getMutatorOfNode(_type) {
            let node = this.getAudioNode(_type);
            let mutator = FudgeCore.getMutatorOfArbitrary(node);
            return mutator;
        }
        getAudioNode(_type) {
            switch (_type) {
                case AUDIO_NODE_TYPE.SOURCE: return this.source;
                case AUDIO_NODE_TYPE.PANNER: return this.panner;
                case AUDIO_NODE_TYPE.GAIN: return this.gain;
            }
        }
        play(_on) {
            if (_on) {
                if (this.audio.isReady) {
                    this.createSource(this.audio, this.source.loop);
                    this.source.start(0, 0);
                }
                else {
                    this.audio.addEventListener("ready", this.hndAudioReady);
                }
                this.source.addEventListener("ended", this.hndAudioEnded);
            }
            else
                try {
                    this.source.stop();
                }
                catch (_error) { }
            this.playing = _on;
        }
        insertAudioNodes(_input, _output) {
            this.panner.disconnect(0);
            if (!_input && !_output) {
                this.panner.connect(this.gain);
                return;
            }
            this.panner.connect(_input);
            _output.connect(this.gain);
        }
        activate(_on) {
            super.activate(_on);
            this.updateConnection();
        }
        connect(_on) {
            if (_on)
                this.gain.connect(this.audioManager.gain);
            else
                this.gain.disconnect(this.audioManager.gain);
        }
        serialize() {
            let serialization = super.serialize();
            serialization.idResource = this.audio.idResource;
            serialization.playing = this.playing;
            serialization.loop = this.loop;
            serialization.volume = this.volume;
            return serialization;
        }
        async deserialize(_serialization) {
            await super.deserialize(_serialization);
            let audio = await FudgeCore.Project.getResource(_serialization.idResource);
            this.createSource(audio, _serialization.loop);
            this.volume = _serialization.volume;
            this.play(_serialization.playing);
            return this;
        }
        getMutator() {
            let mutator = super.getMutator(true);
            let audio = mutator.audio;
            delete mutator.audio;
            mutator.loop = this.loop;
            mutator.volume = this.volume;
            mutator.audio = audio;
            return mutator;
        }
        async mutate(_mutator) {
            await super.mutate(_mutator);
            this.volume = _mutator.volume;
            this.loop = _mutator.loop;
        }
        reduceMutator(_mutator) {
            super.reduceMutator(_mutator);
            delete _mutator.listened;
        }
        hndAudioReady = (_event) => {
            FudgeCore.Debug.fudge("Audio start", Reflect.get(_event.target, "url"));
            if (this.playing)
                this.play(true);
        };
        hndAudioEnded = (_event) => {
            this.playing = false;
        };
        install(_audioManager = FudgeCore.AudioManager.default) {
            let active = this.isActive;
            this.activate(false);
            this.audioManager = _audioManager;
            this.panner = _audioManager.createPanner();
            this.gain = _audioManager.createGain();
            this.panner.connect(this.gain);
            this.gain.connect(_audioManager.gain);
            this.activate(active);
        }
        createSource(_audio, _loop) {
            if (this.source) {
                this.source.disconnect();
                this.source.buffer = null;
            }
            this.source = this.audioManager.createBufferSource();
            this.source.connect(this.panner);
            if (_audio) {
                this.audio = _audio;
                this.source.buffer = _audio.buffer;
            }
            this.source.loop = _loop;
        }
        updateConnection() {
            try {
                this.connect(this.isActive && this.isAttached && this.listened);
            }
            catch (_error) {
            }
        }
        handleAttach = (_event) => {
            if (_event.type == "componentAdd") {
                this.node.addEventListener("childAppendToAudioGraph", this.handleGraph, true);
                this.node.addEventListener("childRemoveFromAudioGraph", this.handleGraph, true);
                this.node.addEventListener("updateAudioGraph", this.update, true);
                this.listened = this.node.isDescendantOf(FudgeCore.AudioManager.default.getGraphListeningTo());
            }
            else {
                this.node.removeEventListener("childAppendToAudioGraph", this.handleGraph, true);
                this.node.removeEventListener("childRemoveFromAudioGraph", this.handleGraph, true);
                this.node.removeEventListener("updateAudioGraph", this.update, true);
                this.listened = false;
            }
            this.updateConnection();
        };
        handleGraph = (_event) => {
            this.listened = (_event.type == "childAppendToAudioGraph");
            this.updateConnection();
        };
        update = (_event) => {
            let mtxResult = this.mtxPivot;
            if (this.node)
                mtxResult = FudgeCore.Matrix4x4.MULTIPLICATION(this.node.mtxWorld, this.mtxPivot);
            let position = mtxResult.translation;
            let forward = FudgeCore.Vector3.TRANSFORMATION(FudgeCore.Vector3.Z(1), mtxResult, false);
            this.panner.positionX.value = position.x;
            this.panner.positionY.value = position.y;
            this.panner.positionZ.value = position.z;
            this.panner.orientationX.value = forward.x;
            this.panner.orientationY.value = forward.y;
            this.panner.orientationZ.value = forward.z;
            FudgeCore.Recycler.store(forward);
            if (this.node)
                FudgeCore.Recycler.store(mtxResult);
        };
    }
    FudgeCore.ComponentAudio = ComponentAudio;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ComponentAudioListener extends FudgeCore.Component {
        static iSubclass = FudgeCore.Component.registerSubclass(ComponentAudioListener);
        mtxPivot = FudgeCore.Matrix4x4.IDENTITY();
        update(_listener) {
            let mtxResult = this.mtxPivot;
            if (this.node)
                mtxResult = FudgeCore.Matrix4x4.MULTIPLICATION(this.node.mtxWorld, this.mtxPivot);
            let position = mtxResult.translation;
            let forward = FudgeCore.Vector3.TRANSFORMATION(FudgeCore.Vector3.Z(1), mtxResult, false);
            let up = FudgeCore.Vector3.TRANSFORMATION(FudgeCore.Vector3.Y(), mtxResult, false);
            if (_listener.positionX != undefined) {
                _listener.positionX.value = position.x;
                _listener.positionY.value = position.y;
                _listener.positionZ.value = position.z;
                _listener.forwardX.value = forward.x;
                _listener.forwardY.value = forward.y;
                _listener.forwardZ.value = forward.z;
                _listener.upX.value = up.x;
                _listener.upY.value = up.y;
                _listener.upZ.value = up.z;
            }
            else {
                _listener.setPosition(position.x, position.y, position.z);
                _listener.setOrientation(forward.x, forward.y, forward.z, up.x, up.y, up.z);
            }
            FudgeCore.Recycler.store(forward);
            FudgeCore.Recycler.store(up);
        }
    }
    FudgeCore.ComponentAudioListener = ComponentAudioListener;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    let FIELD_OF_VIEW;
    (function (FIELD_OF_VIEW) {
        FIELD_OF_VIEW[FIELD_OF_VIEW["HORIZONTAL"] = 0] = "HORIZONTAL";
        FIELD_OF_VIEW[FIELD_OF_VIEW["VERTICAL"] = 1] = "VERTICAL";
        FIELD_OF_VIEW[FIELD_OF_VIEW["DIAGONAL"] = 2] = "DIAGONAL";
    })(FIELD_OF_VIEW = FudgeCore.FIELD_OF_VIEW || (FudgeCore.FIELD_OF_VIEW = {}));
    let PROJECTION;
    (function (PROJECTION) {
        PROJECTION["CENTRAL"] = "central";
        PROJECTION["ORTHOGRAPHIC"] = "orthographic";
        PROJECTION["DIMETRIC"] = "dimetric";
        PROJECTION["STEREO"] = "stereo";
    })(PROJECTION = FudgeCore.PROJECTION || (FudgeCore.PROJECTION = {}));
    class ComponentCamera extends FudgeCore.Component {
        static iSubclass = FudgeCore.Component.registerSubclass(ComponentCamera);
        mtxPivot = FudgeCore.Matrix4x4.IDENTITY();
        clrBackground = new FudgeCore.Color(0, 0, 0, 1);
        #mtxWorldToView;
        projection = PROJECTION.CENTRAL;
        mtxProjection = new FudgeCore.Matrix4x4;
        fieldOfView = 45;
        aspectRatio = 1.0;
        direction = FIELD_OF_VIEW.DIAGONAL;
        near = 1;
        far = 2000;
        backgroundEnabled = true;
        get mtxWorldToView() {
            let mtxCamera = this.mtxPivot.clone;
            try {
                mtxCamera = FudgeCore.Matrix4x4.MULTIPLICATION(this.node.mtxWorld, this.mtxPivot);
            }
            catch (_error) {
            }
            let mtxInversion = FudgeCore.Matrix4x4.INVERSION(mtxCamera);
            this.#mtxWorldToView = FudgeCore.Matrix4x4.MULTIPLICATION(this.mtxProjection, mtxInversion);
            FudgeCore.Recycler.store(mtxCamera);
            FudgeCore.Recycler.store(mtxInversion);
            return this.#mtxWorldToView;
        }
        getProjection() {
            return this.projection;
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
        getDirection() {
            return this.direction;
        }
        getNear() {
            return this.near;
        }
        getFar() {
            return this.far;
        }
        projectCentral(_aspect = this.aspectRatio, _fieldOfView = this.fieldOfView, _direction = this.direction, _near = 1, _far = 2000) {
            this.aspectRatio = _aspect;
            this.fieldOfView = _fieldOfView;
            this.direction = _direction;
            this.projection = PROJECTION.CENTRAL;
            this.near = _near;
            this.far = _far;
            this.mtxProjection = FudgeCore.Matrix4x4.PROJECTION_CENTRAL(_aspect, this.fieldOfView, _near, _far, this.direction);
        }
        projectOrthographic(_left = 0, _right = FudgeCore.Render.getCanvas().clientWidth, _bottom = FudgeCore.Render.getCanvas().clientHeight, _top = 0) {
            this.projection = PROJECTION.ORTHOGRAPHIC;
            this.mtxProjection = FudgeCore.Matrix4x4.PROJECTION_ORTHOGRAPHIC(_left, _right, _bottom, _top, 400, -400);
        }
        getProjectionRectangle() {
            let tanFov = Math.tan(Math.PI * this.fieldOfView / 360);
            let tanHorizontal = 0;
            let tanVertical = 0;
            if (this.direction == FIELD_OF_VIEW.DIAGONAL) {
                let aspect = Math.sqrt(this.aspectRatio);
                tanHorizontal = tanFov * aspect;
                tanVertical = tanFov / aspect;
            }
            else if (this.direction == FIELD_OF_VIEW.VERTICAL) {
                tanVertical = tanFov;
                tanHorizontal = tanVertical * this.aspectRatio;
            }
            else {
                tanHorizontal = tanFov;
                tanVertical = tanHorizontal / this.aspectRatio;
            }
            return FudgeCore.Rectangle.GET(0, 0, tanHorizontal * 2, tanVertical * 2);
        }
        pointWorldToClip(_pointInWorldSpace) {
            let result;
            let m = this.mtxWorldToView.get();
            let w = m[3] * _pointInWorldSpace.x + m[7] * _pointInWorldSpace.y + m[11] * _pointInWorldSpace.z + m[15];
            result = FudgeCore.Vector3.TRANSFORMATION(_pointInWorldSpace, this.mtxWorldToView);
            result.scale(1 / w);
            return result;
        }
        pointClipToWorld(_pointInClipSpace) {
            let mtxViewToWorld = FudgeCore.Matrix4x4.INVERSION(this.mtxWorldToView);
            let m = mtxViewToWorld.get();
            let rayWorld = FudgeCore.Vector3.TRANSFORMATION(_pointInClipSpace, mtxViewToWorld, true);
            let w = m[3] * _pointInClipSpace.x + m[7] * _pointInClipSpace.y + m[11] * _pointInClipSpace.z + m[15];
            rayWorld.scale(1 / w);
            return rayWorld;
        }
        serialize() {
            let serialization = {
                backgroundColor: this.clrBackground,
                backgroundEnabled: this.backgroundEnabled,
                projection: this.projection,
                fieldOfView: this.fieldOfView,
                direction: this.direction,
                aspect: this.aspectRatio,
                pivot: this.mtxPivot.serialize(),
                [super.constructor.name]: super.serialize()
            };
            return serialization;
        }
        async deserialize(_serialization) {
            this.clrBackground = _serialization.backgroundColor;
            this.backgroundEnabled = _serialization.backgroundEnabled;
            this.projection = _serialization.projection;
            this.fieldOfView = _serialization.fieldOfView;
            this.aspectRatio = _serialization.aspect;
            this.direction = _serialization.direction;
            await this.mtxPivot.deserialize(_serialization.pivot);
            await super.deserialize(_serialization[super.constructor.name]);
            switch (this.projection) {
                case PROJECTION.ORTHOGRAPHIC:
                    this.projectOrthographic();
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
        async mutate(_mutator) {
            super.mutate(_mutator);
            switch (this.projection) {
                case PROJECTION.CENTRAL:
                    this.projectCentral(this.aspectRatio, this.fieldOfView, this.direction);
                    break;
            }
        }
        reduceMutator(_mutator) {
            delete _mutator.transform;
            super.reduceMutator(_mutator);
        }
    }
    FudgeCore.ComponentCamera = ComponentCamera;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Light extends FudgeCore.Mutable {
        color;
        constructor(_color = new FudgeCore.Color(1, 1, 1, 1)) {
            super();
            this.color = _color;
        }
        getType() {
            return this.constructor;
        }
        serialize() {
            let serialization = {
                color: this.color.serialize()
            };
            return serialization;
        }
        async deserialize(_serialization) {
            await this.color.deserialize(_serialization.color);
            return this;
        }
        reduceMutator() { }
    }
    FudgeCore.Light = Light;
    class LightAmbient extends Light {
        constructor(_color = new FudgeCore.Color(1, 1, 1, 1)) {
            super(_color);
        }
    }
    FudgeCore.LightAmbient = LightAmbient;
    class LightDirectional extends Light {
        constructor(_color = new FudgeCore.Color(1, 1, 1, 1)) {
            super(_color);
        }
    }
    FudgeCore.LightDirectional = LightDirectional;
    class LightPoint extends Light {
        range = 10;
    }
    FudgeCore.LightPoint = LightPoint;
    class LightSpot extends Light {
    }
    FudgeCore.LightSpot = LightSpot;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    let LIGHT_TYPE;
    (function (LIGHT_TYPE) {
        LIGHT_TYPE["AMBIENT"] = "LightAmbient";
        LIGHT_TYPE["DIRECTIONAL"] = "LightDirectional";
        LIGHT_TYPE["POINT"] = "LightPoint";
        LIGHT_TYPE["SPOT"] = "LightSpot";
    })(LIGHT_TYPE = FudgeCore.LIGHT_TYPE || (FudgeCore.LIGHT_TYPE = {}));
    class ComponentLight extends FudgeCore.Component {
        static iSubclass = FudgeCore.Component.registerSubclass(ComponentLight);
        mtxPivot = FudgeCore.Matrix4x4.IDENTITY();
        light = null;
        constructor(_light = new FudgeCore.LightAmbient()) {
            super();
            this.singleton = false;
            this.light = _light;
        }
        setType(_class) {
            let mtrOld = {};
            if (this.light)
                mtrOld = this.light.getMutator();
            this.light = new _class();
            this.light.mutate(mtrOld);
        }
        serialize() {
            let serialization = {
                pivot: this.mtxPivot.serialize(),
                light: FudgeCore.Serializer.serialize(this.light)
            };
            return serialization;
        }
        async deserialize(_serialization) {
            await this.mtxPivot.deserialize(_serialization.pivot);
            this.light = await FudgeCore.Serializer.deserialize(_serialization.light);
            return this;
        }
        getMutator() {
            let mutator = super.getMutator(true);
            mutator.type = this.light.getType().name;
            return mutator;
        }
        getMutatorAttributeTypes(_mutator) {
            let types = super.getMutatorAttributeTypes(_mutator);
            if (types.type)
                types.type = LIGHT_TYPE;
            return types;
        }
        async mutate(_mutator) {
            let type = _mutator.type;
            if (type != this.light.constructor.name)
                this.setType(FudgeCore.Serializer.getConstructor(type));
            delete (_mutator.type);
            super.mutate(_mutator);
            _mutator.type = type;
        }
    }
    FudgeCore.ComponentLight = ComponentLight;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ComponentMaterial extends FudgeCore.Component {
        static iSubclass = FudgeCore.Component.registerSubclass(ComponentMaterial);
        clrPrimary = FudgeCore.Color.CSS("white");
        clrSecondary = FudgeCore.Color.CSS("white");
        mtxPivot = FudgeCore.Matrix3x3.IDENTITY();
        material;
        sortForAlpha = false;
        constructor(_material = null) {
            super();
            this.material = _material;
        }
        serialize() {
            let serialization = {
                sortForAlpha: this.sortForAlpha,
                clrPrimary: this.clrPrimary.serialize(),
                clrSecondary: this.clrSecondary.serialize(),
                pivot: this.mtxPivot.serialize(),
                [super.constructor.name]: super.serialize(),
                idMaterial: this.material.idResource
            };
            return serialization;
        }
        async deserialize(_serialization) {
            this.material = await FudgeCore.Project.getResource(_serialization.idMaterial);
            await this.clrPrimary.deserialize(_serialization.clrPrimary);
            await this.clrSecondary.deserialize(_serialization.clrSecondary);
            this.sortForAlpha = _serialization.sortForAlpha;
            await this.mtxPivot.deserialize(_serialization.pivot);
            await super.deserialize(_serialization[super.constructor.name]);
            return this;
        }
    }
    FudgeCore.ComponentMaterial = ComponentMaterial;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ComponentMesh extends FudgeCore.Component {
        static iSubclass = FudgeCore.Component.registerSubclass(ComponentMesh);
        mtxPivot = FudgeCore.Matrix4x4.IDENTITY();
        mtxWorld = FudgeCore.Matrix4x4.IDENTITY();
        mesh = null;
        constructor(_mesh = null) {
            super();
            this.mesh = _mesh;
        }
        get radius() {
            let scaling = this.mtxWorld.scaling;
            let scale = Math.max(Math.abs(scaling.x), Math.abs(scaling.y), Math.abs(scaling.z));
            return this.mesh.radius * scale;
        }
        serialize() {
            let serialization;
            let idMesh = this.mesh.idResource;
            if (idMesh)
                serialization = { idMesh: idMesh };
            else
                serialization = { mesh: FudgeCore.Serializer.serialize(this.mesh) };
            serialization.pivot = this.mtxPivot.serialize();
            serialization[super.constructor.name] = super.serialize();
            return serialization;
        }
        async deserialize(_serialization) {
            let mesh;
            if (_serialization.idMesh)
                mesh = await FudgeCore.Project.getResource(_serialization.idMesh);
            else
                mesh = await FudgeCore.Serializer.deserialize(_serialization.mesh);
            this.mesh = mesh;
            await this.mtxPivot.deserialize(_serialization.pivot);
            await super.deserialize(_serialization[super.constructor.name]);
            return this;
        }
        getMutatorForUserInterface() {
            let mutator = this.getMutator();
            return mutator;
        }
    }
    FudgeCore.ComponentMesh = ComponentMesh;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ComponentScript extends FudgeCore.Component {
        static iSubclass = FudgeCore.Component.registerSubclass(ComponentScript);
        constructor() {
            super();
            this.singleton = false;
        }
        serialize() {
            return this.getMutator();
        }
        async deserialize(_serialization) {
            this.mutate(_serialization);
            return this;
        }
    }
    FudgeCore.ComponentScript = ComponentScript;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    let BASE;
    (function (BASE) {
        BASE[BASE["SELF"] = 0] = "SELF";
        BASE[BASE["PARENT"] = 1] = "PARENT";
        BASE[BASE["WORLD"] = 2] = "WORLD";
        BASE[BASE["NODE"] = 3] = "NODE";
    })(BASE = FudgeCore.BASE || (FudgeCore.BASE = {}));
    class ComponentTransform extends FudgeCore.Component {
        static iSubclass = FudgeCore.Component.registerSubclass(ComponentTransform);
        mtxLocal;
        constructor(_mtxInit = FudgeCore.Matrix4x4.IDENTITY()) {
            super();
            this.mtxLocal = _mtxInit;
        }
        lookAt(_targetWorld, _up) {
            let container = this.node;
            if (!container && !container.getParent())
                return this.mtxLocal.lookAt(_targetWorld, _up);
            let mtxWorld = container.mtxWorld.clone;
            mtxWorld.lookAt(_targetWorld, _up, true);
            let mtxLocal = FudgeCore.Matrix4x4.RELATIVE(mtxWorld, null, container.getParent().mtxWorldInverse);
            this.mtxLocal = mtxLocal;
        }
        showTo(_targetWorld, _up) {
            let container = this.node;
            if (!container && !container.getParent())
                return this.mtxLocal.showTo(_targetWorld, _up);
            let mtxWorld = container.mtxWorld.clone;
            mtxWorld.showTo(_targetWorld, _up, true);
            let mtxLocal = FudgeCore.Matrix4x4.RELATIVE(mtxWorld, null, container.getParent().mtxWorldInverse);
            this.mtxLocal = mtxLocal;
        }
        rebase(_node = null) {
            let mtxResult = this.mtxLocal;
            let container = this.node;
            if (container)
                mtxResult = container.mtxWorld;
            if (_node)
                mtxResult = FudgeCore.Matrix4x4.RELATIVE(mtxResult, null, _node.mtxWorldInverse);
            this.mtxLocal = mtxResult;
        }
        transform(_mtxTransform, _base = BASE.SELF, _node = null) {
            switch (_base) {
                case BASE.SELF:
                    this.mtxLocal.multiply(_mtxTransform);
                    break;
                case BASE.PARENT:
                    this.mtxLocal.multiply(_mtxTransform, true);
                    break;
                case BASE.NODE:
                    if (!_node)
                        throw new Error("BASE.NODE requires a node given as base");
                case BASE.WORLD:
                    this.rebase(_node);
                    this.mtxLocal.multiply(_mtxTransform, true);
                    let node = this.node;
                    if (node) {
                        let mtxTemp;
                        if (_base == BASE.NODE) {
                            mtxTemp = FudgeCore.Matrix4x4.MULTIPLICATION(_node.mtxWorld, node.mtxLocal);
                            node.mtxWorld.set(mtxTemp);
                            FudgeCore.Recycler.store(mtxTemp);
                        }
                        let parent = node.getParent();
                        if (parent) {
                            this.rebase(node.getParent());
                            mtxTemp = FudgeCore.Matrix4x4.MULTIPLICATION(node.getParent().mtxWorld, node.mtxLocal);
                            node.mtxWorld.set(mtxTemp);
                            FudgeCore.Recycler.store(mtxTemp);
                        }
                    }
                    break;
            }
        }
        serialize() {
            let serialization = {
                local: this.mtxLocal.serialize(),
                [super.constructor.name]: super.serialize()
            };
            return serialization;
        }
        async deserialize(_serialization) {
            await super.deserialize(_serialization[super.constructor.name]);
            await this.mtxLocal.deserialize(_serialization.local);
            return this;
        }
        reduceMutator(_mutator) {
            delete _mutator.world;
            super.reduceMutator(_mutator);
        }
    }
    FudgeCore.ComponentTransform = ComponentTransform;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Control extends EventTarget {
        type;
        active;
        name;
        rateDispatchOutput = 0;
        valuePrevious = 0;
        outputBase = 0;
        outputTarget = 0;
        outputPrevious = 0;
        outputTargetPrevious = 0;
        factor = 0;
        time = FudgeCore.Time.game;
        timeValueDelay = 0;
        timeOutputTargetSet = 0;
        idTimer = undefined;
        constructor(_name, _factor = 1, _type = 0, _active = true) {
            super();
            this.factor = _factor;
            this.type = _type;
            this.active = _active;
            this.name = _name;
        }
        setTimebase(_time) {
            this.time = _time;
            this.calculateOutput();
        }
        setInput(_input) {
            if (!this.active)
                return;
            this.outputBase = this.calculateOutput();
            this.valuePrevious = this.getValueDelayed();
            this.outputTarget = this.factor * _input;
            this.timeOutputTargetSet = this.time.get();
            if (this.type == 2) {
                this.valuePrevious = this.outputTarget - this.outputTargetPrevious;
                this.outputTargetPrevious = this.outputTarget;
                this.outputTarget = 0;
            }
            this.dispatchEvent(new Event("input"));
            if (this.type == 2)
                this.dispatchOutput(this.valuePrevious);
            else
                this.dispatchOutput(null);
        }
        pulse(_input) {
            this.setInput(_input);
            this.setInput(0);
        }
        setDelay(_time) {
            this.timeValueDelay = Math.max(0, _time);
        }
        setRateDispatchOutput(_rateDispatchOutput = 0) {
            this.rateDispatchOutput = _rateDispatchOutput;
            this.time.deleteTimer(this.idTimer);
            this.idTimer = undefined;
            if (this.rateDispatchOutput)
                this.idTimer = this.time.setTimer(1000 / this.rateDispatchOutput, 0, this.dispatchOutput);
        }
        setFactor(_factor) {
            this.factor = _factor;
        }
        getOutput() {
            return this.calculateOutput();
        }
        calculateOutput() {
            let output = 0;
            let value = this.getValueDelayed();
            switch (this.type) {
                case 1:
                    let timeCurrent = this.time.get();
                    let timeElapsedSinceInput = timeCurrent - this.timeOutputTargetSet;
                    output = this.outputBase;
                    if (this.timeValueDelay > 0) {
                        if (timeElapsedSinceInput < this.timeValueDelay) {
                            output += 0.5 * (this.valuePrevious + value) * timeElapsedSinceInput;
                            break;
                        }
                        else {
                            output += 0.5 * (this.valuePrevious + value) * this.timeValueDelay;
                            timeElapsedSinceInput -= this.timeValueDelay;
                        }
                    }
                    output += value * timeElapsedSinceInput;
                    break;
                case 2:
                case 0:
                default:
                    output = value;
                    break;
            }
            return output;
        }
        getValueDelayed() {
            if (this.timeValueDelay > 0) {
                let timeElapsedSinceInput = this.time.get() - this.timeOutputTargetSet;
                if (timeElapsedSinceInput < this.timeValueDelay)
                    return this.valuePrevious + (this.outputTarget - this.valuePrevious) * timeElapsedSinceInput / this.timeValueDelay;
            }
            return this.outputTarget;
        }
        dispatchOutput = (_eventOrValue) => {
            if (!this.active)
                return;
            let timer = this.time.getTimer(this.idTimer);
            let output;
            if (typeof (_eventOrValue) == "number")
                output = _eventOrValue;
            else
                output = this.calculateOutput();
            let outputChanged = (output != this.outputPrevious);
            if (timer) {
                timer.active = outputChanged;
                if (!outputChanged)
                    return;
            }
            this.outputPrevious = output;
            let event = new CustomEvent("output", {
                detail: {
                    output: output
                }
            });
            this.dispatchEvent(event);
        };
    }
    FudgeCore.Control = Control;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Axis extends FudgeCore.Control {
        controls = new Map();
        sumPrevious = 0;
        addControl(_control) {
            this.controls.set(_control.name, _control);
            _control.addEventListener("input", this.hndInputEvent);
            _control.addEventListener("output", this.hndOutputEvent);
        }
        getControl(_name) {
            return this.controls.get(_name);
        }
        removeControl(_name) {
            let control = this.getControl(_name);
            if (control) {
                control.removeEventListener("input", this.hndInputEvent);
                control.removeEventListener("output", this.hndOutputEvent);
                this.controls.delete(_name);
            }
        }
        getOutput() {
            let sumInput = 0;
            for (let control of this.controls) {
                if (control[1].active)
                    sumInput += control[1].getOutput();
            }
            if (sumInput != this.sumPrevious)
                super.setInput(sumInput);
            this.sumPrevious = sumInput;
            return super.getOutput();
        }
        hndOutputEvent = (_event) => {
            if (!this.active)
                return;
            let control = _event.target;
            let event = new CustomEvent("output", { detail: {
                    control: control,
                    input: _event.detail.output,
                    output: this.getOutput()
                } });
            this.dispatchEvent(event);
        };
        hndInputEvent = (_event) => {
            if (!this.active)
                return;
            let event = new Event("input", _event);
            this.dispatchEvent(event);
        };
    }
    FudgeCore.Axis = Axis;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Keyboard {
        static keysPressed = Keyboard.initialize();
        static isPressedOne(_keys) {
            for (let code of _keys) {
                if (Keyboard.keysPressed[code])
                    return true;
            }
            return false;
        }
        static isPressedCombo(_keys) {
            for (let code of _keys) {
                if (!Keyboard.keysPressed[code])
                    return false;
            }
            return true;
        }
        static mapToValue(_active, _inactive, _keys, _combo = false) {
            if (!_combo && Keyboard.isPressedOne(_keys))
                return _active;
            if (Keyboard.isPressedCombo(_keys))
                return _active;
            return _inactive;
        }
        static mapToTrit(_positive, _negative) {
            return Keyboard.mapToValue(-1, 0, _negative) + Keyboard.mapToValue(1, 0, _positive);
        }
        static initialize() {
            let store = {};
            document.addEventListener("keydown", Keyboard.hndKeyInteraction);
            document.addEventListener("keyup", Keyboard.hndKeyInteraction);
            return store;
        }
        static hndKeyInteraction(_event) {
            Keyboard.keysPressed[_event.code] = (_event.type == "keydown");
        }
    }
    FudgeCore.Keyboard = Keyboard;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class DebugAlert extends FudgeCore.DebugTarget {
        static delegates = {
            [FudgeCore.DEBUG_FILTER.INFO]: DebugAlert.createDelegate(FudgeCore.DEBUG_SYMBOL[FudgeCore.DEBUG_FILTER.INFO]),
            [FudgeCore.DEBUG_FILTER.LOG]: DebugAlert.createDelegate(FudgeCore.DEBUG_SYMBOL[FudgeCore.DEBUG_FILTER.LOG]),
            [FudgeCore.DEBUG_FILTER.WARN]: DebugAlert.createDelegate(FudgeCore.DEBUG_SYMBOL[FudgeCore.DEBUG_FILTER.WARN]),
            [FudgeCore.DEBUG_FILTER.ERROR]: DebugAlert.createDelegate(FudgeCore.DEBUG_SYMBOL[FudgeCore.DEBUG_FILTER.ERROR]),
            [FudgeCore.DEBUG_FILTER.FUDGE]: DebugAlert.createDelegate(FudgeCore.DEBUG_SYMBOL[FudgeCore.DEBUG_FILTER.FUDGE]),
            [FudgeCore.DEBUG_FILTER.SOURCE]: DebugAlert.createDelegate(FudgeCore.DEBUG_SYMBOL[FudgeCore.DEBUG_FILTER.SOURCE])
        };
        static createDelegate(_headline) {
            let delegate = function (_message, ..._args) {
                let args = _args.map(_arg => _arg.toString());
                let out = _headline + " " + FudgeCore.DebugTarget.mergeArguments(_message, args);
                alert(out);
            };
            return delegate;
        }
    }
    FudgeCore.DebugAlert = DebugAlert;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class DebugDialog extends FudgeCore.DebugTarget {
    }
    FudgeCore.DebugDialog = DebugDialog;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class DebugTextArea extends FudgeCore.DebugTarget {
        static textArea = document.createElement("textarea");
        static autoScroll = true;
        static delegates = {
            [FudgeCore.DEBUG_FILTER.INFO]: DebugTextArea.createDelegate(FudgeCore.DEBUG_SYMBOL[FudgeCore.DEBUG_FILTER.INFO]),
            [FudgeCore.DEBUG_FILTER.LOG]: DebugTextArea.createDelegate(FudgeCore.DEBUG_SYMBOL[FudgeCore.DEBUG_FILTER.LOG]),
            [FudgeCore.DEBUG_FILTER.WARN]: DebugTextArea.createDelegate(FudgeCore.DEBUG_SYMBOL[FudgeCore.DEBUG_FILTER.WARN]),
            [FudgeCore.DEBUG_FILTER.ERROR]: DebugTextArea.createDelegate(FudgeCore.DEBUG_SYMBOL[FudgeCore.DEBUG_FILTER.ERROR]),
            [FudgeCore.DEBUG_FILTER.FUDGE]: DebugTextArea.createDelegate(FudgeCore.DEBUG_SYMBOL[FudgeCore.DEBUG_FILTER.FUDGE]),
            [FudgeCore.DEBUG_FILTER.CLEAR]: DebugTextArea.clear,
            [FudgeCore.DEBUG_FILTER.GROUP]: DebugTextArea.group,
            [FudgeCore.DEBUG_FILTER.GROUPCOLLAPSED]: DebugTextArea.group,
            [FudgeCore.DEBUG_FILTER.GROUPEND]: DebugTextArea.groupEnd,
            [FudgeCore.DEBUG_FILTER.SOURCE]: DebugTextArea.createDelegate(FudgeCore.DEBUG_SYMBOL[FudgeCore.DEBUG_FILTER.SOURCE])
        };
        static groups = [];
        static clear() {
            DebugTextArea.textArea.textContent = "";
            DebugTextArea.groups = [];
        }
        static group(_name) {
            DebugTextArea.print("▼ " + _name);
            DebugTextArea.groups.push(_name);
        }
        static groupEnd() {
            DebugTextArea.groups.pop();
        }
        static createDelegate(_headline) {
            let delegate = function (_message, ..._args) {
                DebugTextArea.print(_headline + " " + FudgeCore.DebugTarget.mergeArguments(_message, _args));
            };
            return delegate;
        }
        static getIndentation(_level) {
            let result = "";
            for (let i = 0; i < _level; i++)
                result += "| ";
            return result;
        }
        static print(_text) {
            DebugTextArea.textArea.textContent += DebugTextArea.getIndentation(DebugTextArea.groups.length) + _text + "\n";
            if (DebugTextArea.autoScroll)
                DebugTextArea.textArea.scrollTop = DebugTextArea.textArea.scrollHeight;
        }
    }
    FudgeCore.DebugTextArea = DebugTextArea;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class EventDragDrop extends DragEvent {
        pointerX;
        pointerY;
        canvasX;
        canvasY;
        clientRect;
        constructor(type, _event) {
            super(type, _event);
            let target = _event.target;
            this.clientRect = target.getClientRects()[0];
            this.pointerX = _event.clientX - this.clientRect.left;
            this.pointerY = _event.clientY - this.clientRect.top;
        }
    }
    FudgeCore.EventDragDrop = EventDragDrop;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class EventKeyboard extends KeyboardEvent {
        constructor(type, _event) {
            super(type, _event);
        }
    }
    FudgeCore.EventKeyboard = EventKeyboard;
    let KEYBOARD_CODE;
    (function (KEYBOARD_CODE) {
        KEYBOARD_CODE["A"] = "KeyA";
        KEYBOARD_CODE["B"] = "KeyB";
        KEYBOARD_CODE["C"] = "KeyC";
        KEYBOARD_CODE["D"] = "KeyD";
        KEYBOARD_CODE["E"] = "KeyE";
        KEYBOARD_CODE["F"] = "KeyF";
        KEYBOARD_CODE["G"] = "KeyG";
        KEYBOARD_CODE["H"] = "KeyH";
        KEYBOARD_CODE["I"] = "KeyI";
        KEYBOARD_CODE["J"] = "KeyJ";
        KEYBOARD_CODE["K"] = "KeyK";
        KEYBOARD_CODE["L"] = "KeyL";
        KEYBOARD_CODE["M"] = "KeyM";
        KEYBOARD_CODE["N"] = "KeyN";
        KEYBOARD_CODE["O"] = "KeyO";
        KEYBOARD_CODE["P"] = "KeyP";
        KEYBOARD_CODE["Q"] = "KeyQ";
        KEYBOARD_CODE["R"] = "KeyR";
        KEYBOARD_CODE["S"] = "KeyS";
        KEYBOARD_CODE["T"] = "KeyT";
        KEYBOARD_CODE["U"] = "KeyU";
        KEYBOARD_CODE["V"] = "KeyV";
        KEYBOARD_CODE["W"] = "KeyW";
        KEYBOARD_CODE["X"] = "KeyX";
        KEYBOARD_CODE["Y"] = "KeyY";
        KEYBOARD_CODE["Z"] = "KeyZ";
        KEYBOARD_CODE["ESC"] = "Escape";
        KEYBOARD_CODE["ZERO"] = "Digit0";
        KEYBOARD_CODE["ONE"] = "Digit1";
        KEYBOARD_CODE["TWO"] = "Digit2";
        KEYBOARD_CODE["THREE"] = "Digit3";
        KEYBOARD_CODE["FOUR"] = "Digit4";
        KEYBOARD_CODE["FIVE"] = "Digit5";
        KEYBOARD_CODE["SIX"] = "Digit6";
        KEYBOARD_CODE["SEVEN"] = "Digit7";
        KEYBOARD_CODE["EIGHT"] = "Digit8";
        KEYBOARD_CODE["NINE"] = "Digit9";
        KEYBOARD_CODE["MINUS"] = "Minus";
        KEYBOARD_CODE["EQUAL"] = "Equal";
        KEYBOARD_CODE["BACKSPACE"] = "Backspace";
        KEYBOARD_CODE["TABULATOR"] = "Tab";
        KEYBOARD_CODE["BRACKET_LEFT"] = "BracketLeft";
        KEYBOARD_CODE["BRACKET_RIGHT"] = "BracketRight";
        KEYBOARD_CODE["ENTER"] = "Enter";
        KEYBOARD_CODE["CTRL_LEFT"] = "ControlLeft";
        KEYBOARD_CODE["SEMICOLON"] = "Semicolon";
        KEYBOARD_CODE["QUOTE"] = "Quote";
        KEYBOARD_CODE["BACK_QUOTE"] = "Backquote";
        KEYBOARD_CODE["SHIFT_LEFT"] = "ShiftLeft";
        KEYBOARD_CODE["BACKSLASH"] = "Backslash";
        KEYBOARD_CODE["COMMA"] = "Comma";
        KEYBOARD_CODE["PERIOD"] = "Period";
        KEYBOARD_CODE["SLASH"] = "Slash";
        KEYBOARD_CODE["SHIFT_RIGHT"] = "ShiftRight";
        KEYBOARD_CODE["NUMPAD_MULTIPLY"] = "NumpadMultiply";
        KEYBOARD_CODE["ALT_LEFT"] = "AltLeft";
        KEYBOARD_CODE["SPACE"] = "Space";
        KEYBOARD_CODE["CAPS_LOCK"] = "CapsLock";
        KEYBOARD_CODE["F1"] = "F1";
        KEYBOARD_CODE["F2"] = "F2";
        KEYBOARD_CODE["F3"] = "F3";
        KEYBOARD_CODE["F4"] = "F4";
        KEYBOARD_CODE["F5"] = "F5";
        KEYBOARD_CODE["F6"] = "F6";
        KEYBOARD_CODE["F7"] = "F7";
        KEYBOARD_CODE["F8"] = "F8";
        KEYBOARD_CODE["F9"] = "F9";
        KEYBOARD_CODE["F10"] = "F10";
        KEYBOARD_CODE["PAUSE"] = "Pause";
        KEYBOARD_CODE["SCROLL_LOCK"] = "ScrollLock";
        KEYBOARD_CODE["NUMPAD7"] = "Numpad7";
        KEYBOARD_CODE["NUMPAD8"] = "Numpad8";
        KEYBOARD_CODE["NUMPAD9"] = "Numpad9";
        KEYBOARD_CODE["NUMPAD_SUBTRACT"] = "NumpadSubtract";
        KEYBOARD_CODE["NUMPAD4"] = "Numpad4";
        KEYBOARD_CODE["NUMPAD5"] = "Numpad5";
        KEYBOARD_CODE["NUMPAD6"] = "Numpad6";
        KEYBOARD_CODE["NUMPAD_ADD"] = "NumpadAdd";
        KEYBOARD_CODE["NUMPAD1"] = "Numpad1";
        KEYBOARD_CODE["NUMPAD2"] = "Numpad2";
        KEYBOARD_CODE["NUMPAD3"] = "Numpad3";
        KEYBOARD_CODE["NUMPAD0"] = "Numpad0";
        KEYBOARD_CODE["NUMPAD_DECIMAL"] = "NumpadDecimal";
        KEYBOARD_CODE["PRINT_SCREEN"] = "PrintScreen";
        KEYBOARD_CODE["INTL_BACK_SLASH"] = "IntlBackSlash";
        KEYBOARD_CODE["F11"] = "F11";
        KEYBOARD_CODE["F12"] = "F12";
        KEYBOARD_CODE["NUMPAD_EQUAL"] = "NumpadEqual";
        KEYBOARD_CODE["F13"] = "F13";
        KEYBOARD_CODE["F14"] = "F14";
        KEYBOARD_CODE["F15"] = "F15";
        KEYBOARD_CODE["F16"] = "F16";
        KEYBOARD_CODE["F17"] = "F17";
        KEYBOARD_CODE["F18"] = "F18";
        KEYBOARD_CODE["F19"] = "F19";
        KEYBOARD_CODE["F20"] = "F20";
        KEYBOARD_CODE["F21"] = "F21";
        KEYBOARD_CODE["F22"] = "F22";
        KEYBOARD_CODE["F23"] = "F23";
        KEYBOARD_CODE["F24"] = "F24";
        KEYBOARD_CODE["KANA_MODE"] = "KanaMode";
        KEYBOARD_CODE["LANG2"] = "Lang2";
        KEYBOARD_CODE["LANG1"] = "Lang1";
        KEYBOARD_CODE["INTL_RO"] = "IntlRo";
        KEYBOARD_CODE["CONVERT"] = "Convert";
        KEYBOARD_CODE["NON_CONVERT"] = "NonConvert";
        KEYBOARD_CODE["INTL_YEN"] = "IntlYen";
        KEYBOARD_CODE["NUMPAD_COMMA"] = "NumpadComma";
        KEYBOARD_CODE["UNDO"] = "Undo";
        KEYBOARD_CODE["PASTE"] = "Paste";
        KEYBOARD_CODE["MEDIA_TRACK_PREVIOUS"] = "MediaTrackPrevious";
        KEYBOARD_CODE["CUT"] = "Cut";
        KEYBOARD_CODE["COPY"] = "Copy";
        KEYBOARD_CODE["MEDIA_TRACK_NEXT"] = "MediaTrackNext";
        KEYBOARD_CODE["NUMPAD_ENTER"] = "NumpadEnter";
        KEYBOARD_CODE["CTRL_RIGHT"] = "ControlRight";
        KEYBOARD_CODE["AUDIO_VOLUME_MUTE"] = "AudioVolumeMute";
        KEYBOARD_CODE["LAUNCH_APP2"] = "LaunchApp2";
        KEYBOARD_CODE["MEDIA_PLAY_PAUSE"] = "MediaPlayPause";
        KEYBOARD_CODE["MEDIA_STOP"] = "MediaStop";
        KEYBOARD_CODE["EJECT"] = "Eject";
        KEYBOARD_CODE["AUDIO_VOLUME_DOWN"] = "AudioVolumeDown";
        KEYBOARD_CODE["VOLUME_DOWN"] = "VolumeDown";
        KEYBOARD_CODE["AUDIO_VOLUME_UP"] = "AudioVolumeUp";
        KEYBOARD_CODE["VOLUME_UP"] = "VolumeUp";
        KEYBOARD_CODE["BROWSER_HOME"] = "BrowserHome";
        KEYBOARD_CODE["NUMPAD_DIVIDE"] = "NumpadDivide";
        KEYBOARD_CODE["ALT_RIGHT"] = "AltRight";
        KEYBOARD_CODE["HELP"] = "Help";
        KEYBOARD_CODE["NUM_LOCK"] = "NumLock";
        KEYBOARD_CODE["HOME"] = "Home";
        KEYBOARD_CODE["ARROW_UP"] = "ArrowUp";
        KEYBOARD_CODE["ARROW_RIGHT"] = "ArrowRight";
        KEYBOARD_CODE["ARROW_DOWN"] = "ArrowDown";
        KEYBOARD_CODE["ARROW_LEFT"] = "ArrowLeft";
        KEYBOARD_CODE["END"] = "End";
        KEYBOARD_CODE["PAGE_UP"] = "PageUp";
        KEYBOARD_CODE["PAGE_DOWN"] = "PageDown";
        KEYBOARD_CODE["INSERT"] = "Insert";
        KEYBOARD_CODE["DELETE"] = "Delete";
        KEYBOARD_CODE["META_LEFT"] = "Meta_Left";
        KEYBOARD_CODE["OS_LEFT"] = "OSLeft";
        KEYBOARD_CODE["META_RIGHT"] = "MetaRight";
        KEYBOARD_CODE["OS_RIGHT"] = "OSRight";
        KEYBOARD_CODE["CONTEXT_MENU"] = "ContextMenu";
        KEYBOARD_CODE["POWER"] = "Power";
        KEYBOARD_CODE["BROWSER_SEARCH"] = "BrowserSearch";
        KEYBOARD_CODE["BROWSER_FAVORITES"] = "BrowserFavorites";
        KEYBOARD_CODE["BROWSER_REFRESH"] = "BrowserRefresh";
        KEYBOARD_CODE["BROWSER_STOP"] = "BrowserStop";
        KEYBOARD_CODE["BROWSER_FORWARD"] = "BrowserForward";
        KEYBOARD_CODE["BROWSER_BACK"] = "BrowserBack";
        KEYBOARD_CODE["LAUNCH_APP1"] = "LaunchApp1";
        KEYBOARD_CODE["LAUNCH_MAIL"] = "LaunchMail";
        KEYBOARD_CODE["LAUNCH_MEDIA_PLAYER"] = "LaunchMediaPlayer";
        KEYBOARD_CODE["FN"] = "Fn";
        KEYBOARD_CODE["AGAIN"] = "Again";
        KEYBOARD_CODE["PROPS"] = "Props";
        KEYBOARD_CODE["SELECT"] = "Select";
        KEYBOARD_CODE["OPEN"] = "Open";
        KEYBOARD_CODE["FIND"] = "Find";
        KEYBOARD_CODE["WAKE_UP"] = "WakeUp";
        KEYBOARD_CODE["NUMPAD_PARENT_LEFT"] = "NumpadParentLeft";
        KEYBOARD_CODE["NUMPAD_PARENT_RIGHT"] = "NumpadParentRight";
        KEYBOARD_CODE["SLEEP"] = "Sleep";
    })(KEYBOARD_CODE = FudgeCore.KEYBOARD_CODE || (FudgeCore.KEYBOARD_CODE = {}));
    let KEYBOARD_CODE_DE;
    (function (KEYBOARD_CODE_DE) {
        KEYBOARD_CODE_DE["Z"] = "KeyY";
        KEYBOARD_CODE_DE["Y"] = "KeyZ";
        KEYBOARD_CODE_DE["\u00D6"] = "Semicolon";
        KEYBOARD_CODE_DE["\u00C4"] = "Quote";
        KEYBOARD_CODE_DE["\u00DC"] = "BracketLeft";
        KEYBOARD_CODE_DE["HASH"] = "Backslash";
        KEYBOARD_CODE_DE["PLUS"] = "BracketRight";
        KEYBOARD_CODE_DE["\u00DF"] = "Minus";
        KEYBOARD_CODE_DE["ACUTE"] = "Equal";
        KEYBOARD_CODE_DE["LESS_THAN"] = "IntlBackSlash";
        KEYBOARD_CODE_DE["MINUS"] = "Slash";
    })(KEYBOARD_CODE_DE = FudgeCore.KEYBOARD_CODE_DE || (FudgeCore.KEYBOARD_CODE_DE = {}));
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class EventPointer extends PointerEvent {
        pointerX;
        pointerY;
        canvasX;
        canvasY;
        clientRect;
        constructor(type, _event) {
            super(type, _event);
            let target = _event.target;
            this.clientRect = target.getClientRects()[0];
            this.pointerX = _event.clientX - this.clientRect.left;
            this.pointerY = _event.clientY - this.clientRect.top;
        }
    }
    FudgeCore.EventPointer = EventPointer;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class EventTimer {
        type = "\u0192lapse";
        target;
        arguments;
        firstCall = true;
        lastCall = false;
        count;
        constructor(_timer, ..._arguments) {
            this.target = _timer;
            this.arguments = _arguments;
            this.firstCall = true;
        }
    }
    FudgeCore.EventTimer = EventTimer;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class EventWheel extends WheelEvent {
        constructor(type, _event) {
            super(type, _event);
        }
    }
    FudgeCore.EventWheel = EventWheel;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Graph extends FudgeCore.Node {
        idResource = undefined;
        type = "Graph";
        serialize() {
            let serialization = super.serialize();
            serialization.idResource = this.idResource;
            serialization.type = this.type;
            return serialization;
        }
        async deserialize(_serialization) {
            await super.deserialize(_serialization);
            FudgeCore.Project.register(this, _serialization.idResource);
            return this;
        }
    }
    FudgeCore.Graph = Graph;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class GraphInstance extends FudgeCore.Node {
        idSource = undefined;
        constructor(_graph) {
            super("Graph");
            if (!_graph)
                return;
            this.idSource = _graph.idResource;
        }
        async reset() {
            let resource = await FudgeCore.Project.getResource(this.idSource);
            await this.set(resource);
        }
        serialize() {
            let serialization = super.serialize();
            serialization.idSource = this.idSource;
            return serialization;
        }
        async deserialize(_serialization) {
            await super.deserialize(_serialization);
            this.idSource = _serialization.idSource;
            return this;
        }
        async set(_graph) {
            let serialization = FudgeCore.Serializer.serialize(_graph);
            for (let path in serialization) {
                await this.deserialize(serialization[path]);
                break;
            }
            this.idSource = _graph.idResource;
            this.dispatchEvent(new Event("graphInstantiated"));
        }
    }
    FudgeCore.GraphInstance = GraphInstance;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Coat extends FudgeCore.Mutable {
        renderData;
        useRenderData(_shader, _cmpMaterial) { }
        serialize() {
            return {};
        }
        async deserialize(_serialization) {
            return this;
        }
        reduceMutator(_mutator) {
            delete _mutator.renderData;
        }
    }
    FudgeCore.Coat = Coat;
    let CoatColored = class CoatColored extends Coat {
        color;
        constructor(_color) {
            super();
            this.color = _color || new FudgeCore.Color();
        }
        serialize() {
            let serialization = super.serialize();
            serialization.color = this.color.serialize();
            return serialization;
        }
        async deserialize(_serialization) {
            await super.deserialize(_serialization);
            await this.color.deserialize(_serialization.color);
            return this;
        }
    };
    CoatColored = __decorate([
        FudgeCore.RenderInjectorCoat.decorate
    ], CoatColored);
    FudgeCore.CoatColored = CoatColored;
    let CoatMatCap = class CoatMatCap extends Coat {
        texture = null;
        color = new FudgeCore.Color();
        shadeSmooth;
        constructor(_texture, _color, _shadeSmooth) {
            super();
            this.texture = _texture || new FudgeCore.TextureImage();
            this.color = _color || new FudgeCore.Color();
            this.shadeSmooth = _shadeSmooth || 0;
        }
        serialize() {
            let serialization = super.serialize();
            serialization.color = this.color.serialize();
            return serialization;
        }
        async deserialize(_serialization) {
            await super.deserialize(_serialization);
            await this.color.deserialize(_serialization.color);
            return this;
        }
    };
    CoatMatCap = __decorate([
        FudgeCore.RenderInjectorCoat.decorate
    ], CoatMatCap);
    FudgeCore.CoatMatCap = CoatMatCap;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    let CoatTextured = class CoatTextured extends FudgeCore.CoatColored {
        texture = null;
        constructor(_color, _texture) {
            super(_color);
            this.texture = _texture || FudgeCore.TextureDefault.texture;
        }
        serialize() {
            let serialization = super.serialize();
            serialization.idTexture = this.texture.idResource;
            return serialization;
        }
        async deserialize(_serialization) {
            await super.deserialize(_serialization);
            if (_serialization.idTexture)
                this.texture = await FudgeCore.Project.getResource(_serialization.idTexture);
            return this;
        }
    };
    CoatTextured = __decorate([
        FudgeCore.RenderInjectorCoat.decorate
    ], CoatTextured);
    FudgeCore.CoatTextured = CoatTextured;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Color extends FudgeCore.Mutable {
        static crc2 = document.createElement("canvas").getContext("2d");
        r;
        g;
        b;
        a;
        constructor(_r = 1, _g = 1, _b = 1, _a = 1) {
            super();
            this.setNormRGBA(_r, _g, _b, _a);
        }
        static getHexFromCSSKeyword(_keyword) {
            Color.crc2.fillStyle = _keyword;
            return Color.crc2.fillStyle;
        }
        static CSS(_keyword, _alpha = 1) {
            let hex = Color.getHexFromCSSKeyword(_keyword);
            let color = new Color(parseInt(hex.substr(1, 2), 16) / 255, parseInt(hex.substr(3, 2), 16) / 255, parseInt(hex.substr(5, 2), 16) / 255, _alpha);
            return color;
        }
        static MULTIPLY(_color1, _color2) {
            return new Color(_color1.r * _color2.r, _color1.g * _color2.g, _color1.b * _color2.b, _color1.a * _color2.a);
        }
        setNormRGBA(_r, _g, _b, _a) {
            this.r = Math.min(1, Math.max(0, _r));
            this.g = Math.min(1, Math.max(0, _g));
            this.b = Math.min(1, Math.max(0, _b));
            this.a = Math.min(1, Math.max(0, _a));
        }
        setBytesRGBA(_r, _g, _b, _a) {
            this.setNormRGBA(_r / 255, _g / 255, _b / 255, _a / 255);
        }
        getArray() {
            return new Float32Array([this.r, this.g, this.b, this.a]);
        }
        setArrayNormRGBA(_color) {
            this.setNormRGBA(_color[0], _color[1], _color[2], _color[3]);
        }
        setArrayBytesRGBA(_color) {
            this.setBytesRGBA(_color[0], _color[1], _color[2], _color[3]);
        }
        getArrayBytesRGBA() {
            return new Uint8ClampedArray([this.r * 255, this.g * 255, this.b * 255, this.a * 255]);
        }
        add(_color) {
            this.r += _color.r;
            this.g += _color.g;
            this.b += _color.b;
            this.a += _color.a;
        }
        getCSS() {
            let bytes = this.getArrayBytesRGBA();
            return `RGBA(${bytes[0]}, ${bytes[1]}, ${bytes[2]}, ${bytes[3]})`;
        }
        getHex() {
            let bytes = this.getArrayBytesRGBA();
            let hex = "";
            for (let byte of bytes)
                hex += byte.toString(16).padStart(2, "0");
            return hex;
        }
        setHex(_hex) {
            let bytes = this.getArrayBytesRGBA();
            let channel = 0;
            for (let byte in bytes)
                bytes[byte] = parseInt(_hex.substr(channel++ * 2, 2), 16);
            this.setArrayBytesRGBA(bytes);
        }
        copy(_color) {
            this.r = _color.r;
            this.g = _color.g;
            this.b = _color.b;
            this.a = _color.a;
        }
        toString() {
            return `(r: ${this.r.toFixed(3)}, g: ${this.g.toFixed(3)}, b: ${this.b.toFixed(3)}, a: ${this.a.toFixed(3)})`;
        }
        serialize() {
            let serialization = this.getMutator(true);
            serialization.toJSON = () => { return `[${this.r}, ${this.g}, ${this.b}, ${this.a}]`; };
            return serialization;
        }
        async deserialize(_serialization) {
            if (typeof (_serialization) == "string") {
                [this.r, this.g, this.b, this.a] = JSON.parse(_serialization);
            }
            else
                this.mutate(_serialization);
            return this;
        }
        reduceMutator(_mutator) { }
    }
    FudgeCore.Color = Color;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Material extends FudgeCore.Mutable {
        #coat;
        name;
        idResource = undefined;
        shaderType;
        constructor(_name, _shader, _coat) {
            super();
            this.name = _name;
            this.shaderType = _shader;
            if (_shader) {
                if (_coat)
                    this.coat = _coat;
                else
                    this.coat = this.createCoatMatchingShader();
            }
            FudgeCore.Project.register(this);
        }
        get coat() {
            return this.#coat;
        }
        set coat(_coat) {
            if (_coat.constructor != this.shaderType.getCoat())
                if (_coat instanceof this.shaderType.getCoat())
                    FudgeCore.Debug.fudge("Coat is extension of Coat required by shader");
                else
                    throw (new Error("Shader and coat don't match"));
            this.#coat = _coat;
        }
        createCoatMatchingShader() {
            let coat = new (this.shaderType.getCoat())();
            return coat;
        }
        setShader(_shaderType) {
            this.shaderType = _shaderType;
            let coat = this.createCoatMatchingShader();
            coat.mutate(this.#coat.getMutator());
            this.coat = coat;
        }
        getShader() {
            return this.shaderType;
        }
        serialize() {
            let serialization = {
                name: this.name,
                idResource: this.idResource,
                shader: this.shaderType.name,
                coat: FudgeCore.Serializer.serialize(this.#coat)
            };
            return serialization;
        }
        async deserialize(_serialization) {
            this.name = _serialization.name;
            FudgeCore.Project.register(this, _serialization.idResource);
            this.shaderType = FudgeCore[_serialization.shader];
            let coat = await FudgeCore.Serializer.deserialize(_serialization.coat);
            this.coat = coat;
            return this;
        }
        getMutator() {
            let mutator = super.getMutator(true);
            mutator.coat = this.coat.getMutator();
            return mutator;
        }
        async mutate(_mutator) {
            await super.mutate(_mutator);
            await this.coat.mutate(_mutator.coat);
        }
        reduceMutator(_mutator) {
        }
    }
    FudgeCore.Material = Material;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Framing extends FudgeCore.Mutable {
        reduceMutator(_mutator) { }
    }
    FudgeCore.Framing = Framing;
    class FramingFixed extends Framing {
        width = 300;
        height = 150;
        constructor(_width = 300, _height = 150) {
            super();
            this.setSize(_width, _height);
        }
        setSize(_width, _height) {
            this.width = _width;
            this.height = _height;
        }
        getPoint(_pointInFrame, _rectFrame) {
            let result = new FudgeCore.Vector2(this.width * (_pointInFrame.x - _rectFrame.x) / _rectFrame.width, this.height * (_pointInFrame.y - _rectFrame.y) / _rectFrame.height);
            return result;
        }
        getPointInverse(_point, _rect) {
            let result = new FudgeCore.Vector2(_point.x * _rect.width / this.width + _rect.x, _point.y * _rect.height / this.height + _rect.y);
            return result;
        }
        getRect(_rectFrame) {
            return FudgeCore.Rectangle.GET(0, 0, this.width, this.height);
        }
    }
    FudgeCore.FramingFixed = FramingFixed;
    class FramingScaled extends Framing {
        normWidth = 1.0;
        normHeight = 1.0;
        setScale(_normWidth, _normHeight) {
            this.normWidth = _normWidth;
            this.normHeight = _normHeight;
        }
        getPoint(_pointInFrame, _rectFrame) {
            let result = new FudgeCore.Vector2(this.normWidth * (_pointInFrame.x - _rectFrame.x), this.normHeight * (_pointInFrame.y - _rectFrame.y));
            return result;
        }
        getPointInverse(_point, _rect) {
            let result = new FudgeCore.Vector2(_point.x / this.normWidth + _rect.x, _point.y / this.normHeight + _rect.y);
            return result;
        }
        getRect(_rectFrame) {
            return FudgeCore.Rectangle.GET(0, 0, this.normWidth * _rectFrame.width, this.normHeight * _rectFrame.height);
        }
    }
    FudgeCore.FramingScaled = FramingScaled;
    class FramingComplex extends Framing {
        margin = { left: 0, top: 0, right: 0, bottom: 0 };
        padding = { left: 0, top: 0, right: 0, bottom: 0 };
        getPoint(_pointInFrame, _rectFrame) {
            let result = new FudgeCore.Vector2(_pointInFrame.x - this.padding.left - this.margin.left * _rectFrame.width, _pointInFrame.y - this.padding.top - this.margin.top * _rectFrame.height);
            return result;
        }
        getPointInverse(_point, _rect) {
            let result = new FudgeCore.Vector2(_point.x + this.padding.left + this.margin.left * _rect.width, _point.y + this.padding.top + this.margin.top * _rect.height);
            return result;
        }
        getRect(_rectFrame) {
            if (!_rectFrame)
                return null;
            let minX = _rectFrame.x + this.margin.left * _rectFrame.width + this.padding.left;
            let minY = _rectFrame.y + this.margin.top * _rectFrame.height + this.padding.top;
            let maxX = _rectFrame.x + (1 - this.margin.right) * _rectFrame.width - this.padding.right;
            let maxY = _rectFrame.y + (1 - this.margin.bottom) * _rectFrame.height - this.padding.bottom;
            return FudgeCore.Rectangle.GET(minX, minY, maxX - minX, maxY - minY);
        }
        getMutator() {
            return { margin: this.margin, padding: this.padding };
        }
    }
    FudgeCore.FramingComplex = FramingComplex;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Geo2 {
        magnitude = 0;
        angle = 0;
        constructor(_angle = 0, _magnitude = 1) {
            this.set(_angle, _magnitude);
        }
        set(_angle = 0, _magnitude = 1) {
            this.magnitude = _magnitude;
            this.angle = _angle;
        }
        recycle() {
            this.set();
        }
        toString() {
            return `angle: ${this.angle.toPrecision(5)},  magnitude: ${this.magnitude.toPrecision(5)}`;
        }
    }
    FudgeCore.Geo2 = Geo2;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Geo3 {
        magnitude = 0;
        latitude = 0;
        longitude = 0;
        constructor(_longitude = 0, _latitude = 0, _magnitude = 1) {
            this.set(_longitude, _latitude, _magnitude);
        }
        set(_longitude = 0, _latitude = 0, _magnitude = 1) {
            this.magnitude = _magnitude;
            this.latitude = _latitude;
            this.longitude = _longitude;
        }
        recycle() {
            this.set();
        }
        toString() {
            return `longitude: ${this.longitude.toPrecision(5)}, latitude: ${this.latitude.toPrecision(5)}, magnitude: ${this.magnitude.toPrecision(5)}`;
        }
    }
    FudgeCore.Geo3 = Geo3;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    function Mash() {
        let n = 0xefc8249d;
        let mash = function (data) {
            data = data.toString();
            for (let i = 0; i < data.length; i++) {
                n += data.charCodeAt(i);
                let h = 0.02519603282416938 * n;
                n = h >>> 0;
                h -= n;
                h *= n;
                n = h >>> 0;
                h -= n;
                n += h * 0x100000000;
            }
            return (n >>> 0) * 2.3283064365386963e-10;
        };
        return mash;
    }
    FudgeCore.Mash = Mash;
    function LFIB4() {
        let args = Array.prototype.slice.call(arguments);
        let k0 = 0, k1 = 58, k2 = 119, k3 = 178;
        let s = [];
        let mash = Mash();
        if (args.length === 0) {
            args = [+new Date()];
        }
        for (let j = 0; j < 256; j++) {
            s[j] = mash(" ");
            s[j] -= mash(" ") * 4.76837158203125e-7;
            if (s[j] < 0) {
                s[j] += 1;
            }
        }
        for (let i = 0; i < args.length; i++) {
            for (let j = 0; j < 256; j++) {
                s[j] -= mash(args[i]);
                s[j] -= mash(args[i]) * 4.76837158203125e-7;
                if (s[j] < 0) {
                    s[j] += 1;
                }
            }
        }
        mash = null;
        let random = function () {
            let x;
            k0 = (k0 + 1) & 255;
            k1 = (k1 + 1) & 255;
            k2 = (k2 + 1) & 255;
            k3 = (k3 + 1) & 255;
            x = s[k0] - s[k1];
            if (x < 0) {
                x += 1;
            }
            x -= s[k2];
            if (x < 0) {
                x += 1;
            }
            x -= s[k3];
            if (x < 0) {
                x += 1;
            }
            return s[k0] = x;
        };
        return random;
    }
    FudgeCore.LFIB4 = LFIB4;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Matrix3x3 extends FudgeCore.Mutable {
        static deg2rad = Math.PI / 180;
        data = new Float32Array(9);
        mutator = null;
        vectors;
        constructor() {
            super();
            this.recycle();
            this.resetCache();
        }
        static PROJECTION(_width, _height) {
            let mtxResult = new Matrix3x3;
            mtxResult.data.set([
                2 / _width, 0, 0,
                0, -2 / _height, 0,
                -1, 1, 1
            ]);
            return mtxResult;
        }
        static IDENTITY() {
            const mtxResult = FudgeCore.Recycler.get(Matrix3x3);
            return mtxResult;
        }
        static TRANSLATION(_translate) {
            const mtxResult = FudgeCore.Recycler.get(Matrix3x3);
            mtxResult.data.set([
                1, 0, 0,
                0, 1, 0,
                _translate.x, _translate.y, 1
            ]);
            return mtxResult;
        }
        static ROTATION(_angleInDegrees) {
            const mtxResult = FudgeCore.Recycler.get(Matrix3x3);
            let angleInRadians = _angleInDegrees * Matrix3x3.deg2rad;
            let sin = Math.sin(angleInRadians);
            let cos = Math.cos(angleInRadians);
            mtxResult.data.set([
                cos, sin, 0,
                -sin, cos, 0,
                0, 0, 1
            ]);
            return mtxResult;
        }
        static SCALING(_scalar) {
            const mtxResult = FudgeCore.Recycler.get(Matrix3x3);
            mtxResult.data.set([
                _scalar.x, 0, 0,
                0, _scalar.y, 0,
                0, 0, 1
            ]);
            return mtxResult;
        }
        static MULTIPLICATION(_mtxLeft, _mtxRight) {
            let a00 = _mtxLeft.data[0 * 3 + 0];
            let a01 = _mtxLeft.data[0 * 3 + 1];
            let a02 = _mtxLeft.data[0 * 3 + 2];
            let a10 = _mtxLeft.data[1 * 3 + 0];
            let a11 = _mtxLeft.data[1 * 3 + 1];
            let a12 = _mtxLeft.data[1 * 3 + 2];
            let a20 = _mtxLeft.data[2 * 3 + 0];
            let a21 = _mtxLeft.data[2 * 3 + 1];
            let a22 = _mtxLeft.data[2 * 3 + 2];
            let b00 = _mtxRight.data[0 * 3 + 0];
            let b01 = _mtxRight.data[0 * 3 + 1];
            let b02 = _mtxRight.data[0 * 3 + 2];
            let b10 = _mtxRight.data[1 * 3 + 0];
            let b11 = _mtxRight.data[1 * 3 + 1];
            let b12 = _mtxRight.data[1 * 3 + 2];
            let b20 = _mtxRight.data[2 * 3 + 0];
            let b21 = _mtxRight.data[2 * 3 + 1];
            let b22 = _mtxRight.data[2 * 3 + 2];
            let mtxResult = new Matrix3x3;
            mtxResult.data.set([
                b00 * a00 + b01 * a10 + b02 * a20,
                b00 * a01 + b01 * a11 + b02 * a21,
                b00 * a02 + b01 * a12 + b02 * a22,
                b10 * a00 + b11 * a10 + b12 * a20,
                b10 * a01 + b11 * a11 + b12 * a21,
                b10 * a02 + b11 * a12 + b12 * a22,
                b20 * a00 + b21 * a10 + b22 * a20,
                b20 * a01 + b21 * a11 + b22 * a21,
                b20 * a02 + b21 * a12 + b22 * a22
            ]);
            return mtxResult;
        }
        get translation() {
            if (!this.vectors.translation)
                this.vectors.translation = new FudgeCore.Vector2(this.data[6], this.data[7]);
            return this.vectors.translation;
        }
        set translation(_translation) {
            this.data.set(_translation.get(), 6);
            this.vectors.translation = _translation;
            this.mutator = null;
        }
        get rotation() {
            if (!this.vectors.rotation)
                this.vectors.rotation = this.getEulerAngle();
            return this.vectors.rotation;
        }
        set rotation(_rotation) {
            this.mutate({ "rotation": _rotation });
            this.resetCache();
        }
        get scaling() {
            if (!this.vectors.scaling)
                this.vectors.scaling = new FudgeCore.Vector2(Math.hypot(this.data[0], this.data[1]), Math.hypot(this.data[3], this.data[4]));
            return this.vectors.scaling;
        }
        set scaling(_scaling) {
            this.mutate({ "scaling": _scaling });
            this.resetCache();
        }
        get clone() {
            let mtxClone = FudgeCore.Recycler.get(Matrix3x3);
            mtxClone.set(this);
            return mtxClone;
        }
        recycle() {
            this.data = new Float32Array([
                1, 0, 0,
                0, 1, 0,
                0, 0, 1
            ]);
            this.resetCache();
        }
        translate(_by) {
            const mtxResult = Matrix3x3.MULTIPLICATION(this, Matrix3x3.TRANSLATION(_by));
            this.set(mtxResult);
            FudgeCore.Recycler.store(mtxResult);
        }
        translateX(_x) {
            this.data[6] += _x;
            this.mutator = null;
            this.vectors.translation = null;
        }
        translateY(_y) {
            this.data[7] += _y;
            this.mutator = null;
            this.vectors.translation = null;
        }
        scale(_by) {
            const mtxResult = Matrix3x3.MULTIPLICATION(this, Matrix3x3.SCALING(_by));
            this.set(mtxResult);
            FudgeCore.Recycler.store(mtxResult);
        }
        scaleX(_by) {
            let vector = FudgeCore.Recycler.get(FudgeCore.Vector2);
            vector.set(_by, 1);
            this.scale(vector);
            FudgeCore.Recycler.store(vector);
        }
        scaleY(_by) {
            let vector = FudgeCore.Recycler.get(FudgeCore.Vector2);
            vector.set(1, _by);
            this.scale(vector);
            FudgeCore.Recycler.store(vector);
        }
        rotate(_angleInDegrees) {
            const mtxResult = Matrix3x3.MULTIPLICATION(this, Matrix3x3.ROTATION(_angleInDegrees));
            this.set(mtxResult);
            FudgeCore.Recycler.store(mtxResult);
        }
        multiply(_mtxRight) {
            let mtxResult = Matrix3x3.MULTIPLICATION(this, _mtxRight);
            this.set(mtxResult);
            FudgeCore.Recycler.store(mtxResult);
            this.mutator = null;
        }
        getEulerAngle() {
            let scaling = this.scaling;
            let s0 = this.data[0] / scaling.x;
            let s1 = this.data[1] / scaling.x;
            let s3 = this.data[3] / scaling.y;
            let s4 = this.data[4] / scaling.y;
            let xSkew = Math.atan2(-s3, s4);
            let ySkew = Math.atan2(s0, s1);
            let sy = Math.hypot(s0, s1);
            let rotation;
            if (!(sy > 1e-6))
                rotation = ySkew;
            else
                rotation = xSkew;
            rotation *= 180 / Math.PI;
            return rotation;
        }
        set(_mtxTo) {
            this.data.set(_mtxTo.data);
            this.resetCache();
        }
        toString() {
            return `ƒ.Matrix3x3(translation: ${this.translation.toString()}, rotation: ${this.rotation.toString()}, scaling: ${this.scaling.toString()}`;
        }
        get() {
            return new Float32Array(this.data);
        }
        serialize() {
            let serialization = {
                translation: this.translation.serialize(),
                rotation: this.rotation,
                scaling: this.scaling.serialize()
            };
            return serialization;
        }
        async deserialize(_serialization) {
            let mutator = {
                translation: await this.translation.deserialize(_serialization.translation),
                rotation: _serialization.rotation,
                scaling: await this.scaling.deserialize(_serialization.scaling)
            };
            this.mutate(mutator);
            return this;
        }
        getMutator() {
            if (this.mutator)
                return this.mutator;
            let mutator = {
                translation: this.translation.getMutator(),
                rotation: this.rotation,
                scaling: this.scaling.getMutator()
            };
            this.mutator = mutator;
            return mutator;
        }
        async mutate(_mutator) {
            let oldTranslation = this.translation;
            let oldRotation = this.rotation;
            let oldScaling = this.scaling;
            let newTranslation = _mutator["translation"];
            let newRotation = _mutator["rotation"];
            let newScaling = _mutator["scaling"];
            let vectors = { translation: oldTranslation, rotation: oldRotation, scaling: oldScaling };
            if (newTranslation) {
                vectors.translation = new FudgeCore.Vector2(newTranslation.x != undefined ? newTranslation.x : oldTranslation.x, newTranslation.y != undefined ? newTranslation.y : oldTranslation.y);
            }
            vectors.rotation = (newRotation == undefined) ? oldRotation : newRotation;
            if (newScaling) {
                vectors.scaling = new FudgeCore.Vector2(newScaling.x != undefined ? newScaling.x : oldScaling.x, newScaling.y != undefined ? newScaling.y : oldScaling.y);
            }
            let mtxResult = Matrix3x3.IDENTITY();
            if (vectors.translation)
                mtxResult.translate(vectors.translation);
            if (vectors.rotation) {
                mtxResult.rotate(vectors.rotation);
            }
            if (vectors.scaling)
                mtxResult.scale(vectors.scaling);
            this.set(mtxResult);
            this.vectors = vectors;
        }
        getMutatorAttributeTypes(_mutator) {
            let types = {};
            if (_mutator.translation)
                types.translation = "Vector2";
            if (_mutator.rotation != undefined)
                types.rotation = "number";
            if (_mutator.scaling)
                types.scaling = "Vector2";
            return types;
        }
        reduceMutator(_mutator) { }
        resetCache() {
            this.vectors = { translation: null, rotation: null, scaling: null };
            this.mutator = null;
        }
    }
    FudgeCore.Matrix3x3 = Matrix3x3;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Matrix4x4 extends FudgeCore.Mutable {
        static deg2rad = Math.PI / 180;
        #eulerAngles = FudgeCore.Vector3.ZERO();
        #vectors = { translation: FudgeCore.Vector3.ZERO(), rotation: FudgeCore.Vector3.ZERO(), scaling: FudgeCore.Vector3.ZERO() };
        data = new Float32Array(16);
        mutator = null;
        vectors;
        constructor() {
            super();
            this.recycle();
            this.resetCache();
        }
        static IDENTITY() {
            const mtxResult = FudgeCore.Recycler.get(Matrix4x4);
            return mtxResult;
        }
        static CONSTRUCTION(_vectors) {
            let result = Matrix4x4.IDENTITY();
            result.mutate(_vectors);
            return result;
        }
        static MULTIPLICATION(_mtxLeft, _mtxRight) {
            let a = _mtxLeft.data;
            let b = _mtxRight.data;
            const mtxResult = FudgeCore.Recycler.get(Matrix4x4);
            let a00 = a[0 * 4 + 0];
            let a01 = a[0 * 4 + 1];
            let a02 = a[0 * 4 + 2];
            let a03 = a[0 * 4 + 3];
            let a10 = a[1 * 4 + 0];
            let a11 = a[1 * 4 + 1];
            let a12 = a[1 * 4 + 2];
            let a13 = a[1 * 4 + 3];
            let a20 = a[2 * 4 + 0];
            let a21 = a[2 * 4 + 1];
            let a22 = a[2 * 4 + 2];
            let a23 = a[2 * 4 + 3];
            let a30 = a[3 * 4 + 0];
            let a31 = a[3 * 4 + 1];
            let a32 = a[3 * 4 + 2];
            let a33 = a[3 * 4 + 3];
            let b00 = b[0 * 4 + 0];
            let b01 = b[0 * 4 + 1];
            let b02 = b[0 * 4 + 2];
            let b03 = b[0 * 4 + 3];
            let b10 = b[1 * 4 + 0];
            let b11 = b[1 * 4 + 1];
            let b12 = b[1 * 4 + 2];
            let b13 = b[1 * 4 + 3];
            let b20 = b[2 * 4 + 0];
            let b21 = b[2 * 4 + 1];
            let b22 = b[2 * 4 + 2];
            let b23 = b[2 * 4 + 3];
            let b30 = b[3 * 4 + 0];
            let b31 = b[3 * 4 + 1];
            let b32 = b[3 * 4 + 2];
            let b33 = b[3 * 4 + 3];
            mtxResult.data.set([
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
            return mtxResult;
        }
        static INVERSION(_mtx) {
            let m = _mtx.data;
            let m00 = m[0 * 4 + 0];
            let m01 = m[0 * 4 + 1];
            let m02 = m[0 * 4 + 2];
            let m03 = m[0 * 4 + 3];
            let m10 = m[1 * 4 + 0];
            let m11 = m[1 * 4 + 1];
            let m12 = m[1 * 4 + 2];
            let m13 = m[1 * 4 + 3];
            let m20 = m[2 * 4 + 0];
            let m21 = m[2 * 4 + 1];
            let m22 = m[2 * 4 + 2];
            let m23 = m[2 * 4 + 3];
            let m30 = m[3 * 4 + 0];
            let m31 = m[3 * 4 + 1];
            let m32 = m[3 * 4 + 2];
            let m33 = m[3 * 4 + 3];
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
            const mtxResult = FudgeCore.Recycler.get(Matrix4x4);
            mtxResult.data.set([
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
                d * ((tmp22 * m22 + tmp16 * m02 + tmp21 * m12) - (tmp20 * m12 + tmp23 * m22 + tmp17 * m02))
            ]);
            return mtxResult;
        }
        static LOOK_AT(_translation, _target, _up = FudgeCore.Vector3.Y()) {
            const mtxResult = FudgeCore.Recycler.get(Matrix4x4);
            let zAxis = FudgeCore.Vector3.DIFFERENCE(_target, _translation);
            zAxis.normalize();
            let xAxis = FudgeCore.Vector3.NORMALIZATION(FudgeCore.Vector3.CROSS(_up, zAxis));
            let yAxis = FudgeCore.Vector3.NORMALIZATION(FudgeCore.Vector3.CROSS(zAxis, xAxis));
            mtxResult.data.set([
                xAxis.x, xAxis.y, xAxis.z, 0,
                yAxis.x, yAxis.y, yAxis.z, 0,
                zAxis.x, zAxis.y, zAxis.z, 0,
                _translation.x,
                _translation.y,
                _translation.z,
                1
            ]);
            return mtxResult;
        }
        static SHOW_TO(_translation, _target, _up = FudgeCore.Vector3.Y()) {
            const mtxResult = FudgeCore.Recycler.get(Matrix4x4);
            let zAxis = FudgeCore.Vector3.DIFFERENCE(_target, _translation);
            zAxis.normalize();
            let xAxis = FudgeCore.Vector3.NORMALIZATION(FudgeCore.Vector3.CROSS(_up, zAxis));
            zAxis = FudgeCore.Vector3.NORMALIZATION(FudgeCore.Vector3.CROSS(xAxis, _up));
            mtxResult.data.set([
                xAxis.x, xAxis.y, xAxis.z, 0,
                _up.x, _up.y, _up.z, 0,
                zAxis.x, zAxis.y, zAxis.z, 0,
                _translation.x,
                _translation.y,
                _translation.z,
                1
            ]);
            return mtxResult;
        }
        static TRANSLATION(_translate) {
            const mtxResult = FudgeCore.Recycler.get(Matrix4x4);
            mtxResult.data.set([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                _translate.x, _translate.y, _translate.z, 1
            ]);
            return mtxResult;
        }
        static ROTATION_X(_angleInDegrees) {
            const mtxResult = FudgeCore.Recycler.get(Matrix4x4);
            let angleInRadians = _angleInDegrees * Matrix4x4.deg2rad;
            let sin = Math.sin(angleInRadians);
            let cos = Math.cos(angleInRadians);
            mtxResult.data.set([
                1, 0, 0, 0,
                0, cos, sin, 0,
                0, -sin, cos, 0,
                0, 0, 0, 1
            ]);
            return mtxResult;
        }
        static ROTATION_Y(_angleInDegrees) {
            let mtxResult = FudgeCore.Recycler.get(Matrix4x4);
            let angleInRadians = _angleInDegrees * Matrix4x4.deg2rad;
            let sin = Math.sin(angleInRadians);
            let cos = Math.cos(angleInRadians);
            mtxResult.data.set([
                cos, 0, -sin, 0,
                0, 1, 0, 0,
                sin, 0, cos, 0,
                0, 0, 0, 1
            ]);
            return mtxResult;
        }
        static ROTATION_Z(_angleInDegrees) {
            const mtxResult = FudgeCore.Recycler.get(Matrix4x4);
            let angleInRadians = _angleInDegrees * Matrix4x4.deg2rad;
            let sin = Math.sin(angleInRadians);
            let cos = Math.cos(angleInRadians);
            mtxResult.data.set([
                cos, sin, 0, 0,
                -sin, cos, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ]);
            return mtxResult;
        }
        static ROTATION(_eulerAnglesInDegrees) {
            const mtxResult = FudgeCore.Recycler.get(Matrix4x4);
            let anglesInRadians = FudgeCore.Vector3.SCALE(_eulerAnglesInDegrees, Matrix4x4.deg2rad);
            let sinX = Math.sin(anglesInRadians.x);
            let cosX = Math.cos(anglesInRadians.x);
            let sinY = Math.sin(anglesInRadians.y);
            let cosY = Math.cos(anglesInRadians.y);
            let sinZ = Math.sin(anglesInRadians.z);
            let cosZ = Math.cos(anglesInRadians.z);
            mtxResult.data.set([
                cosZ * cosY, sinZ * cosY, -sinY, 0,
                cosZ * sinY * sinX - sinZ * cosX, sinZ * sinY * sinX + cosZ * cosX, cosY * sinX, 0,
                cosZ * sinY * cosX + sinZ * sinX, sinZ * sinY * cosX - cosZ * sinX, cosY * cosX, 0,
                0, 0, 0, 1
            ]);
            return mtxResult;
        }
        static SCALING(_scalar) {
            const mtxResult = FudgeCore.Recycler.get(Matrix4x4);
            mtxResult.data.set([
                _scalar.x, 0, 0, 0,
                0, _scalar.y, 0, 0,
                0, 0, _scalar.z, 0,
                0, 0, 0, 1
            ]);
            return mtxResult;
        }
        static RELATIVE(_mtx, _mtxBase, _mtxInverse) {
            if (_mtxInverse)
                return Matrix4x4.MULTIPLICATION(_mtxInverse, _mtx);
            let mtxInverse = Matrix4x4.INVERSION(_mtxBase);
            let mtxResult = Matrix4x4.MULTIPLICATION(mtxInverse, _mtx);
            FudgeCore.Recycler.store(mtxInverse);
            return mtxResult;
        }
        static PROJECTION_CENTRAL(_aspect, _fieldOfViewInDegrees, _near, _far, _direction) {
            let fieldOfViewInRadians = _fieldOfViewInDegrees * Matrix4x4.deg2rad;
            let f = Math.tan(0.5 * (Math.PI - fieldOfViewInRadians));
            let rangeInv = 1.0 / (_near - _far);
            const mtxResult = FudgeCore.Recycler.get(Matrix4x4);
            mtxResult.data.set([
                f, 0, 0, 0,
                0, f, 0, 0,
                0, 0, (_near + _far) * rangeInv, -1,
                0, 0, _near * _far * rangeInv * 2, 0
            ]);
            if (_direction == FudgeCore.FIELD_OF_VIEW.DIAGONAL) {
                _aspect = Math.sqrt(_aspect);
                mtxResult.data[0] = f / _aspect;
                mtxResult.data[5] = f * _aspect;
            }
            else if (_direction == FudgeCore.FIELD_OF_VIEW.VERTICAL)
                mtxResult.data[0] = f / _aspect;
            else
                mtxResult.data[5] = f * _aspect;
            mtxResult.rotateY(180);
            return mtxResult;
        }
        static PROJECTION_ORTHOGRAPHIC(_left, _right, _bottom, _top, _near = -400, _far = 400) {
            const mtxResult = FudgeCore.Recycler.get(Matrix4x4);
            mtxResult.data.set([
                2 / (_right - _left), 0, 0, 0,
                0, 2 / (_top - _bottom), 0, 0,
                0, 0, 2 / (_near - _far), 0,
                (_left + _right) / (_left - _right),
                (_bottom + _top) / (_bottom - _top),
                (_near + _far) / (_near - _far),
                1
            ]);
            return mtxResult;
        }
        set translation(_translation) {
            this.data.set(_translation.get(), 12);
            if (this.vectors.translation)
                this.vectors.translation.set(_translation.x, _translation.y, _translation.z);
            else
                this.vectors.translation = _translation.clone;
            this.mutator = null;
        }
        get translation() {
            if (!this.vectors.translation) {
                this.vectors.translation = this.#vectors.translation;
                this.vectors.translation.set(this.data[12], this.data[13], this.data[14]);
            }
            return this.vectors.translation;
        }
        get rotation() {
            if (!this.vectors.rotation)
                this.vectors.rotation = this.getEulerAngles().clone;
            return this.vectors.rotation;
        }
        set rotation(_rotation) {
            this.mutate({ "rotation": _rotation });
            this.resetCache();
        }
        get scaling() {
            if (!this.vectors.scaling) {
                this.vectors.scaling = this.#vectors.scaling;
                this.vectors.scaling.set(Math.hypot(this.data[0], this.data[1], this.data[2]), Math.hypot(this.data[4], this.data[5], this.data[6]), Math.hypot(this.data[8], this.data[9], this.data[10]));
            }
            return this.vectors.scaling;
        }
        set scaling(_scaling) {
            this.mutate({ "scaling": _scaling });
            this.resetCache();
        }
        get clone() {
            let mtxClone = FudgeCore.Recycler.get(Matrix4x4);
            mtxClone.set(this);
            return mtxClone;
        }
        recycle() {
            this.data.set([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ]);
            this.resetCache();
        }
        rotate(_by, _fromLeft = false) {
            let mtxRotation = Matrix4x4.ROTATION(_by);
            this.multiply(mtxRotation, _fromLeft);
            FudgeCore.Recycler.store(mtxRotation);
        }
        rotateX(_angleInDegrees, _fromLeft = false) {
            let mtxRotation = Matrix4x4.ROTATION_X(_angleInDegrees);
            this.multiply(mtxRotation, _fromLeft);
            FudgeCore.Recycler.store(mtxRotation);
        }
        rotateY(_angleInDegrees, _fromLeft = false) {
            let mtxRotation = Matrix4x4.ROTATION_Y(_angleInDegrees);
            this.multiply(mtxRotation, _fromLeft);
            FudgeCore.Recycler.store(mtxRotation);
        }
        rotateZ(_angleInDegrees, _fromLeft = false) {
            let mtxRotation = Matrix4x4.ROTATION_Z(_angleInDegrees);
            this.multiply(mtxRotation, _fromLeft);
            FudgeCore.Recycler.store(mtxRotation);
        }
        lookAt(_target, _up, _preserveScaling = true) {
            if (!_up)
                _up = this.getY();
            const mtxResult = Matrix4x4.LOOK_AT(this.translation, _target, _up);
            if (_preserveScaling)
                mtxResult.scale(this.scaling);
            this.set(mtxResult);
            FudgeCore.Recycler.store(mtxResult);
        }
        lookAtRotate(_target, _up, _preserveScaling = true) {
            if (!_up)
                _up = this.getY();
            let scaling = this.scaling;
            let difference = FudgeCore.Vector3.DIFFERENCE(_target, this.translation);
            difference.normalize();
            let cos = FudgeCore.Vector3.DOT(FudgeCore.Vector3.NORMALIZATION(this.getZ()), difference);
            let sin = FudgeCore.Vector3.DOT(FudgeCore.Vector3.NORMALIZATION(this.getX()), difference);
            let mtxRotation = FudgeCore.Recycler.borrow(Matrix4x4);
            mtxRotation.data.set([
                cos, 0, -sin, 0,
                0, 1, 0, 0,
                sin, 0, cos, 0,
                0, 0, 0, 1
            ]);
            this.multiply(mtxRotation, false);
            cos = FudgeCore.Vector3.DOT(FudgeCore.Vector3.NORMALIZATION(this.getZ()), difference);
            sin = -FudgeCore.Vector3.DOT(FudgeCore.Vector3.NORMALIZATION(this.getY()), difference);
            mtxRotation.data.set([
                1, 0, 0, 0,
                0, cos, sin, 0,
                0, -sin, cos, 0,
                0, 0, 0, 1
            ]);
            this.multiply(mtxRotation, false);
            this.scaling = scaling;
        }
        showTo(_target, _up, _preserveScaling = true) {
            if (!_up)
                _up = this.getY();
            const mtxResult = Matrix4x4.SHOW_TO(this.translation, _target, _up);
            if (_preserveScaling)
                mtxResult.scale(this.scaling);
            this.set(mtxResult);
            FudgeCore.Recycler.store(mtxResult);
        }
        translate(_by, _local = true) {
            if (_local) {
                let mtxTranslation = Matrix4x4.TRANSLATION(_by);
                this.multiply(mtxTranslation);
                FudgeCore.Recycler.store(mtxTranslation);
            }
            else {
                this.data[12] += _by.x;
                this.data[13] += _by.y;
                this.data[14] += _by.z;
                this.mutator = null;
                if (this.vectors.translation)
                    FudgeCore.Recycler.store(this.vectors.translation);
                this.vectors.translation = null;
            }
        }
        translateX(_x, _local = true) {
            let translation = FudgeCore.Vector3.X(_x);
            this.translate(translation, _local);
            FudgeCore.Recycler.store(translation);
        }
        translateY(_y, _local = true) {
            let translation = FudgeCore.Vector3.Y(_y);
            this.translate(translation, _local);
            FudgeCore.Recycler.store(translation);
        }
        translateZ(_z, _local = true) {
            let translation = FudgeCore.Vector3.Z(_z);
            this.translate(translation, _local);
            FudgeCore.Recycler.store(translation);
        }
        scale(_by) {
            const mtxResult = Matrix4x4.MULTIPLICATION(this, Matrix4x4.SCALING(_by));
            this.set(mtxResult);
            FudgeCore.Recycler.store(mtxResult);
        }
        scaleX(_by) {
            let vector = FudgeCore.Recycler.get(FudgeCore.Vector3);
            vector.set(_by, 1, 1);
            this.scale(vector);
            FudgeCore.Recycler.store(vector);
        }
        scaleY(_by) {
            let vector = FudgeCore.Recycler.get(FudgeCore.Vector3);
            vector.set(1, _by, 1);
            this.scale(vector);
            FudgeCore.Recycler.store(vector);
        }
        scaleZ(_by) {
            let vector = FudgeCore.Recycler.get(FudgeCore.Vector3);
            vector.set(1, 1, _by);
            this.scale(vector);
            FudgeCore.Recycler.store(vector);
        }
        multiply(_matrix, _fromLeft = false) {
            const mtxResult = _fromLeft ? Matrix4x4.MULTIPLICATION(_matrix, this) : Matrix4x4.MULTIPLICATION(this, _matrix);
            this.set(mtxResult);
            FudgeCore.Recycler.store(mtxResult);
        }
        getEulerAngles() {
            let scaling = this.scaling;
            let s0 = this.data[0] / scaling.x;
            let s1 = this.data[1] / scaling.x;
            let s2 = this.data[2] / scaling.x;
            let s6 = this.data[6] / scaling.y;
            let s10 = this.data[10] / scaling.z;
            let sy = Math.hypot(s0, s1);
            let singular = sy < 1e-6;
            let x1, y1, z1;
            let x2, y2, z2;
            if (!singular) {
                x1 = Math.atan2(s6, s10);
                y1 = Math.atan2(-s2, sy);
                z1 = Math.atan2(s1, s0);
                x2 = Math.atan2(-s6, -s10);
                y2 = Math.atan2(-s2, -sy);
                z2 = Math.atan2(-s1, -s0);
                if (Math.abs(x2) + Math.abs(y2) + Math.abs(z2) < Math.abs(x1) + Math.abs(y1) + Math.abs(z1)) {
                    x1 = x2;
                    y1 = y2;
                    z1 = z2;
                }
            }
            else {
                x1 = Math.atan2(-this.data[9] / scaling.z, this.data[5] / scaling.y);
                y1 = Math.atan2(-this.data[2] / scaling.x, sy);
                z1 = 0;
            }
            this.#eulerAngles.set(x1, y1, z1);
            this.#eulerAngles.scale(180 / Math.PI);
            return this.#eulerAngles;
        }
        set(_mtxTo) {
            if (_mtxTo instanceof Float32Array)
                this.data.set(_mtxTo);
            else
                this.data.set(_mtxTo.data);
            this.resetCache();
        }
        toString() {
            return `ƒ.Matrix4x4(translation: ${this.translation.toString()}, rotation: ${this.rotation.toString()}, scaling: ${this.scaling.toString()}`;
        }
        get() {
            return new Float32Array(this.data);
        }
        getX() {
            let result = FudgeCore.Recycler.get(FudgeCore.Vector3);
            result.set(this.data[0], this.data[1], this.data[2]);
            return result;
        }
        getY() {
            let result = FudgeCore.Recycler.get(FudgeCore.Vector3);
            result.set(this.data[4], this.data[5], this.data[6]);
            return result;
        }
        getZ() {
            let result = FudgeCore.Recycler.get(FudgeCore.Vector3);
            result.set(this.data[8], this.data[9], this.data[10]);
            return result;
        }
        swapXY() {
            let temp = [this.data[0], this.data[1], this.data[2]];
            this.data.set([this.data[4], this.data[5], this.data[6]], 0);
            this.data.set(temp, 4);
            this.data.set([-this.data[8], -this.data[9], -this.data[10]], 8);
        }
        swapXZ() {
            let temp = [this.data[0], this.data[1], this.data[2]];
            this.data.set([this.data[8], this.data[9], this.data[10]], 0);
            this.data.set(temp, 8);
            this.data.set([-this.data[4], -this.data[5], -this.data[6]], 4);
        }
        swapYZ() {
            let temp = [this.data[4], this.data[5], this.data[6]];
            this.data.set([this.data[8], this.data[9], this.data[10]], 4);
            this.data.set(temp, 8);
            this.data.set([-this.data[0], -this.data[1], -this.data[2]], 0);
        }
        getTranslationTo(_mtxTarget) {
            let difference = FudgeCore.Recycler.get(FudgeCore.Vector3);
            difference.set(_mtxTarget.data[12] - this.data[12], _mtxTarget.data[13] - this.data[13], _mtxTarget.data[14] - this.data[14]);
            return difference;
        }
        serialize() {
            let serialization = {
                translation: this.translation.serialize(),
                rotation: this.rotation.serialize(),
                scaling: this.scaling.serialize()
            };
            return serialization;
        }
        async deserialize(_serialization) {
            let mutator = {
                translation: await this.translation.deserialize(_serialization.translation),
                rotation: await this.rotation.deserialize(_serialization.rotation),
                scaling: await this.scaling.deserialize(_serialization.scaling)
            };
            this.mutate(mutator);
            return this;
        }
        getMutator() {
            if (this.mutator)
                return this.mutator;
            let mutator = {
                translation: this.translation.getMutator(),
                rotation: this.rotation.getMutator(),
                scaling: this.scaling.getMutator()
            };
            this.mutator = mutator;
            return mutator;
        }
        async mutate(_mutator) {
            let oldTranslation = this.translation;
            let oldRotation = this.rotation;
            let oldScaling = this.scaling;
            let newTranslation = _mutator["translation"];
            let newRotation = _mutator["rotation"];
            let newScaling = _mutator["scaling"];
            let vectors = { translation: oldTranslation, rotation: oldRotation, scaling: oldScaling };
            if (newTranslation) {
                vectors.translation = vectors.translation || this.#vectors.translation;
                vectors.translation.set(newTranslation.x != undefined ? newTranslation.x : oldTranslation.x, newTranslation.y != undefined ? newTranslation.y : oldTranslation.y, newTranslation.z != undefined ? newTranslation.z : oldTranslation.z);
            }
            if (newRotation) {
                vectors.rotation = vectors.rotation || this.#vectors.rotation;
                vectors.rotation.set(newRotation.x != undefined ? newRotation.x : oldRotation.x, newRotation.y != undefined ? newRotation.y : oldRotation.y, newRotation.z != undefined ? newRotation.z : oldRotation.z);
            }
            if (newScaling) {
                vectors.scaling = vectors.scaling || this.#vectors.scaling;
                vectors.scaling.set(newScaling.x != undefined ? newScaling.x : oldScaling.x, newScaling.y != undefined ? newScaling.y : oldScaling.y, newScaling.z != undefined ? newScaling.z : oldScaling.z);
            }
            let mtxResult = Matrix4x4.IDENTITY();
            if (vectors.translation)
                mtxResult.translate(vectors.translation);
            if (vectors.rotation) {
                mtxResult.rotate(vectors.rotation);
            }
            if (vectors.scaling)
                mtxResult.scale(vectors.scaling);
            this.set(mtxResult);
            this.vectors = vectors;
            FudgeCore.Recycler.store(mtxResult);
        }
        getMutatorAttributeTypes(_mutator) {
            let types = {};
            if (_mutator.translation)
                types.translation = "Vector3";
            if (_mutator.rotation)
                types.rotation = "Vector3";
            if (_mutator.scaling)
                types.scaling = "Vector3";
            return types;
        }
        reduceMutator(_mutator) { }
        resetCache() {
            this.vectors = { translation: null, rotation: null, scaling: null };
            this.mutator = null;
        }
    }
    FudgeCore.Matrix4x4 = Matrix4x4;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Noise {
        perm = new Uint8Array(512);
        permMod12 = new Uint8Array(512);
        constructor(_random = Math.random) {
            const p = new Uint8Array(256);
            for (let i = 0; i < 256; i++)
                p[i] = i;
            let n;
            let q;
            for (let i = 255; i > 0; i--) {
                n = Math.floor((i + 1) * _random());
                q = p[i];
                p[i] = p[n];
                p[n] = q;
            }
            for (let i = 0; i < 512; i++) {
                this.perm[i] = p[i & 255];
                this.permMod12[i] = this.perm[i] % 12;
            }
        }
    }
    FudgeCore.Noise = Noise;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Noise2 extends FudgeCore.Noise {
        static offset = (3.0 - Math.sqrt(3.0)) / 6.0;
        static gradient = [[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [-1, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [0, 1], [0, -1]];
        #sample = null;
        constructor(_random = Math.random) {
            super(_random);
            this.#sample = (_x, _y) => {
                const s = (_x + _y) * 0.5 * (Math.sqrt(3.0) - 1.0);
                const i = Math.floor(_x + s);
                const j = Math.floor(_y + s);
                const t = (i + j) * Noise2.offset;
                const X0 = i - t;
                const Y0 = j - t;
                const x0 = _x - X0;
                const y0 = _y - Y0;
                const i1 = x0 > y0 ? 1 : 0;
                const j1 = x0 > y0 ? 0 : 1;
                const x1 = x0 - i1 + Noise2.offset;
                const y1 = y0 - j1 + Noise2.offset;
                const x2 = x0 - 1.0 + 2.0 * Noise2.offset;
                const y2 = y0 - 1.0 + 2.0 * Noise2.offset;
                const ii = i & 255;
                const jj = j & 255;
                const g0 = Noise2.gradient[this.permMod12[ii + this.perm[jj]]];
                const g1 = Noise2.gradient[this.permMod12[ii + i1 + this.perm[jj + j1]]];
                const g2 = Noise2.gradient[this.permMod12[ii + 1 + this.perm[jj + 1]]];
                const t0 = 0.5 - x0 * x0 - y0 * y0;
                const n0 = t0 < 0 ? 0.0 : Math.pow(t0, 4) * (g0[0] * x0 + g0[1] * y0);
                const t1 = 0.5 - x1 * x1 - y1 * y1;
                const n1 = t1 < 0 ? 0.0 : Math.pow(t1, 4) * (g1[0] * x1 + g1[1] * y1);
                const t2 = 0.5 - x2 * x2 - y2 * y2;
                const n2 = t2 < 0 ? 0.0 : Math.pow(t2, 4) * (g2[0] * x2 + g2[1] * y2);
                return 70.14805770653952 * (n0 + n1 + n2);
            };
        }
        sample = (_x, _y) => {
            return this.#sample(_x, _y);
        };
    }
    FudgeCore.Noise2 = Noise2;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Noise3 extends FudgeCore.Noise {
        static offset = 1.0 / 6.0;
        static gradient = [[1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0], [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1], [0, 1, 1], [0, -1, -1], [0, 1, -1], [0, -1, -1]
        ];
        #sample = null;
        constructor(_random = Math.random) {
            super(_random);
            this.#sample = (_x, _y, _z) => {
                const s = (_x + _y + _z) / 3.0;
                const i = Math.floor(_x + s);
                const j = Math.floor(_y + s);
                const k = Math.floor(_z + s);
                const t = (i + j + k) * Noise3.offset;
                const X0 = i - t;
                const Y0 = j - t;
                const Z0 = k - t;
                const x0 = _x - X0;
                const y0 = _y - Y0;
                const z0 = _z - Z0;
                let i1, j1, k1;
                let i2, j2, k2;
                if (x0 >= y0) {
                    if (y0 >= z0) {
                        i1 = i2 = j2 = 1;
                        j1 = k1 = k2 = 0;
                    }
                    else if (x0 >= z0) {
                        i1 = i2 = k2 = 1;
                        j1 = k1 = j2 = 0;
                    }
                    else {
                        k1 = i2 = k2 = 1;
                        i1 = j1 = j2 = 0;
                    }
                }
                else {
                    if (y0 < z0) {
                        k1 = j2 = k2 = 1;
                        i1 = j1 = i2 = 0;
                    }
                    else if (x0 < z0) {
                        j1 = j2 = k2 = 1;
                        i1 = k1 = i2 = 0;
                    }
                    else {
                        j1 = i2 = j2 = 1;
                        i1 = k1 = k2 = 0;
                    }
                }
                const x1 = x0 - i1 + Noise3.offset;
                const y1 = y0 - j1 + Noise3.offset;
                const z1 = z0 - k1 + Noise3.offset;
                const x2 = x0 - i2 + 2.0 * Noise3.offset;
                const y2 = y0 - j2 + 2.0 * Noise3.offset;
                const z2 = z0 - k2 + 2.0 * Noise3.offset;
                const x3 = x0 - 1.0 + 3.0 * Noise3.offset;
                const y3 = y0 - 1.0 + 3.0 * Noise3.offset;
                const z3 = z0 - 1.0 + 3.0 * Noise3.offset;
                const ii = i & 255;
                const jj = j & 255;
                const kk = k & 255;
                const g0 = Noise3.gradient[this.permMod12[ii + this.perm[jj + this.perm[kk]]]];
                const g1 = Noise3.gradient[this.permMod12[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1]]]];
                const g2 = Noise3.gradient[this.permMod12[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2]]]];
                const g3 = Noise3.gradient[this.permMod12[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1]]]];
                const t0 = 0.5 - x0 * x0 - y0 * y0 - z0 * z0;
                const n0 = t0 < 0
                    ? 0.0
                    : Math.pow(t0, 4) * (g0[0] * x0 + g0[1] * y0 + g0[2] * z0);
                const t1 = 0.5 - x1 * x1 - y1 * y1 - z1 * z1;
                const n1 = t1 < 0
                    ? 0.0
                    : Math.pow(t1, 4) * (g1[0] * x1 + g1[1] * y1 + g1[2] * z1);
                const t2 = 0.5 - x2 * x2 - y2 * y2 - z2 * z2;
                const n2 = t2 < 0
                    ? 0.0
                    : Math.pow(t2, 4) * (g2[0] * x2 + g2[1] * y2 + g2[2] * z2);
                const t3 = 0.5 - x3 * x3 - y3 * y3 - z3 * z3;
                const n3 = t3 < 0
                    ? 0.0
                    : Math.pow(t3, 4) * (g3[0] * x3 + g3[1] * y3 + g3[2] * z3);
                return 94.68493150681972 * (n0 + n1 + n2 + n3);
            };
        }
        sample = (_x, _y, _z) => {
            return this.#sample(_x, _y, _z);
        };
    }
    FudgeCore.Noise3 = Noise3;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Noise4 extends FudgeCore.Noise {
        static offset = (5.0 - Math.sqrt(5.0)) / 20.0;
        static gradient = [[0, 1, 1, 1], [0, 1, 1, -1], [0, 1, -1, 1], [0, 1, -1, -1], [0, -1, 1, 1], [0, -1, 1, -1], [0, -1, -1, 1], [0, -1, -1, -1], [1, 0, 1, 1], [1, 0, 1, -1], [1, 0, -1, 1], [1, 0, -1, -1], [-1, 0, 1, 1], [-1, 0, 1, -1], [-1, 0, -1, 1], [-1, 0, -1, -1], [1, 1, 0, 1], [1, 1, 0, -1], [1, -1, 0, 1], [1, -1, 0, -1], [-1, 1, 0, 1], [-1, 1, 0, -1], [-1, -1, 0, 1], [-1, -1, 0, -1], [1, 1, 1, 0], [1, 1, -1, 0], [1, -1, 1, 0], [1, -1, -1, 0], [-1, 1, 1, 0], [-1, 1, -1, 0], [-1, -1, 1, 0], [-1, -1, -1, 0]];
        #sample = null;
        constructor(_random = Math.random) {
            super(_random);
            this.#sample = (x, y, z, w) => {
                const s = (x + y + z + w) * (Math.sqrt(5.0) - 1.0) / 4.0;
                const i = Math.floor(x + s);
                const j = Math.floor(y + s);
                const k = Math.floor(z + s);
                const l = Math.floor(w + s);
                const t = (i + j + k + l) * Noise4.offset;
                const X0 = i - t;
                const Y0 = j - t;
                const Z0 = k - t;
                const W0 = l - t;
                const x0 = x - X0;
                const y0 = y - Y0;
                const z0 = z - Z0;
                const w0 = w - W0;
                let rankx = 0;
                let ranky = 0;
                let rankz = 0;
                let rankw = 0;
                if (x0 > y0)
                    rankx++;
                else
                    ranky++;
                if (x0 > z0)
                    rankx++;
                else
                    rankz++;
                if (x0 > w0)
                    rankx++;
                else
                    rankw++;
                if (y0 > z0)
                    ranky++;
                else
                    rankz++;
                if (y0 > w0)
                    ranky++;
                else
                    rankw++;
                if (z0 > w0)
                    rankz++;
                else
                    rankw++;
                const i1 = rankx >= 3 ? 1 : 0;
                const j1 = ranky >= 3 ? 1 : 0;
                const k1 = rankz >= 3 ? 1 : 0;
                const l1 = rankw >= 3 ? 1 : 0;
                const i2 = rankx >= 2 ? 1 : 0;
                const j2 = ranky >= 2 ? 1 : 0;
                const k2 = rankz >= 2 ? 1 : 0;
                const l2 = rankw >= 2 ? 1 : 0;
                const i3 = rankx >= 1 ? 1 : 0;
                const j3 = ranky >= 1 ? 1 : 0;
                const k3 = rankz >= 1 ? 1 : 0;
                const l3 = rankw >= 1 ? 1 : 0;
                const x1 = x0 - i1 + Noise4.offset;
                const y1 = y0 - j1 + Noise4.offset;
                const z1 = z0 - k1 + Noise4.offset;
                const w1 = w0 - l1 + Noise4.offset;
                const x2 = x0 - i2 + 2.0 * Noise4.offset;
                const y2 = y0 - j2 + 2.0 * Noise4.offset;
                const z2 = z0 - k2 + 2.0 * Noise4.offset;
                const w2 = w0 - l2 + 2.0 * Noise4.offset;
                const x3 = x0 - i3 + 3.0 * Noise4.offset;
                const y3 = y0 - j3 + 3.0 * Noise4.offset;
                const z3 = z0 - k3 + 3.0 * Noise4.offset;
                const w3 = w0 - l3 + 3.0 * Noise4.offset;
                const x4 = x0 - 1.0 + 4.0 * Noise4.offset;
                const y4 = y0 - 1.0 + 4.0 * Noise4.offset;
                const z4 = z0 - 1.0 + 4.0 * Noise4.offset;
                const w4 = w0 - 1.0 + 4.0 * Noise4.offset;
                const ii = i & 255;
                const jj = j & 255;
                const kk = k & 255;
                const ll = l & 255;
                const g0 = Noise4.gradient[this.perm[ii + this.perm[jj + this.perm[kk + this.perm[ll]]]] %
                    32];
                const g1 = Noise4.gradient[this.perm[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1 + this.perm[ll + l1]]]] % 32];
                const g2 = Noise4.gradient[this.perm[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2 + this.perm[ll + l2]]]] % 32];
                const g3 = Noise4.gradient[this.perm[ii + i3 + this.perm[jj + j3 + this.perm[kk + k3 + this.perm[ll + l3]]]] % 32];
                const g4 = Noise4.gradient[this.perm[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1 + this.perm[ll + 1]]]] % 32];
                const t0 = 0.5 - x0 * x0 - y0 * y0 - z0 * z0 - w0 * w0;
                const n0 = t0 < 0
                    ? 0.0
                    : Math.pow(t0, 4) * (g0[0] * x0 + g0[1] * y0 + g0[2] * z0 + g0[3] * w0);
                const t1 = 0.5 - x1 * x1 - y1 * y1 - z1 * z1 - w1 * w1;
                const n1 = t1 < 0
                    ? 0.0
                    : Math.pow(t1, 4) * (g1[0] * x1 + g1[1] * y1 + g1[2] * z1 + g1[3] * w1);
                const t2 = 0.5 - x2 * x2 - y2 * y2 - z2 * z2 - w2 * w2;
                const n2 = t2 < 0
                    ? 0.0
                    : Math.pow(t2, 4) * (g2[0] * x2 + g2[1] * y2 + g2[2] * z2 + g2[3] * w2);
                const t3 = 0.5 - x3 * x3 - y3 * y3 - z3 * z3 - w3 * w3;
                const n3 = t3 < 0
                    ? 0.0
                    : Math.pow(t3, 4) * (g3[0] * x3 + g3[1] * y3 + g3[2] * z3 + g3[3] * w3);
                const t4 = 0.5 - x4 * x4 - y4 * y4 - z4 * z4 - w4 * w4;
                const n4 = t4 < 0
                    ? 0.0
                    : Math.pow(t4, 4) * (g4[0] * x4 + g4[1] * y4 + g4[2] * z4 + g4[3] * w4);
                return 72.37855765153665 * (n0 + n1 + n2 + n3 + n4);
            };
        }
        sample = (_x, _y, _z, _w) => {
            return this.#sample(_x, _y, _z, _w);
        };
    }
    FudgeCore.Noise4 = Noise4;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Random {
        static default = new Random();
        generate = Math.random;
        constructor(_seedOrFunction) {
            if (_seedOrFunction instanceof Function)
                this.generate = _seedOrFunction;
            else if (_seedOrFunction == undefined)
                this.generate = Math.random;
            else
                this.generate = new FudgeCore.LFIB4(_seedOrFunction);
        }
        getNorm() {
            return this.generate();
        }
        getRange(_min, _max) {
            return _min + this.generate() * (_max - _min);
        }
        getRangeFloored(_min, _max) {
            return Math.floor(this.getRange(_min, _max));
        }
        getBoolean() {
            return this.generate() < 0.5;
        }
        getSign() {
            return this.getBoolean() ? 1 : -1;
        }
        getIndex(_array) {
            if (_array.length > 0)
                return this.getRangeFloored(0, _array.length);
            return -1;
        }
        getElement(_array) {
            if (_array.length > 0)
                return _array[this.getIndex(_array)];
            return null;
        }
        splice(_array) {
            return _array.splice(this.getIndex(_array), 1)[0];
        }
        getKey(_map) {
            let keys = Array.from(_map.keys());
            return keys[this.getIndex(keys)];
        }
        getPropertyName(_object) {
            let keys = Object.getOwnPropertyNames(_object);
            return keys[this.getIndex(keys)];
        }
        getPropertySymbol(_object) {
            let keys = Object.getOwnPropertySymbols(_object);
            return keys[this.getIndex(keys)];
        }
        getVector3(_corner0, _corner1) {
            return new FudgeCore.Vector3(this.getRange(_corner0.x, _corner1.x), this.getRange(_corner0.y, _corner1.y), this.getRange(_corner0.z, _corner1.z));
        }
        getVector2(_corner0, _corner1) {
            return new FudgeCore.Vector2(this.getRange(_corner0.x, _corner1.x), this.getRange(_corner0.y, _corner1.y));
        }
    }
    FudgeCore.Random = Random;
    FudgeCore.random = new Random();
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Vector3 extends FudgeCore.Mutable {
        data;
        constructor(_x = 0, _y = 0, _z = 0) {
            super();
            this.data = new Float32Array([_x, _y, _z]);
        }
        static X(_scale = 1) {
            const vector = FudgeCore.Recycler.get(Vector3);
            vector.set(_scale, 0, 0);
            return vector;
        }
        static Y(_scale = 1) {
            const vector = FudgeCore.Recycler.get(Vector3);
            vector.set(0, _scale, 0);
            return vector;
        }
        static Z(_scale = 1) {
            const vector = FudgeCore.Recycler.get(Vector3);
            vector.data.set([0, 0, _scale]);
            return vector;
        }
        static ZERO() {
            const vector = FudgeCore.Recycler.get(Vector3);
            vector.set(0, 0, 0);
            return vector;
        }
        static ONE(_scale = 1) {
            const vector = FudgeCore.Recycler.get(Vector3);
            vector.set(_scale, _scale, _scale);
            return vector;
        }
        static TRANSFORMATION(_vector, _mtxTransform, _includeTranslation = true) {
            let result = FudgeCore.Recycler.get(Vector3);
            let m = _mtxTransform.get();
            let [x, y, z] = _vector.get();
            result.x = m[0] * x + m[4] * y + m[8] * z;
            result.y = m[1] * x + m[5] * y + m[9] * z;
            result.z = m[2] * x + m[6] * y + m[10] * z;
            if (_includeTranslation) {
                result.add(_mtxTransform.translation);
            }
            return result;
        }
        static NORMALIZATION(_vector, _length = 1) {
            let magnitude = _vector.magnitude;
            let vector;
            try {
                if (magnitude == 0)
                    throw (new RangeError("Impossible normalization"));
                vector = Vector3.ZERO();
                let factor = _length / _vector.magnitude;
                vector.set(_vector.x * factor, _vector.y * factor, _vector.z * factor);
            }
            catch (_error) {
                FudgeCore.Debug.warn(_error);
            }
            return vector;
        }
        static SUM(..._vectors) {
            let result = FudgeCore.Recycler.get(Vector3);
            for (let vector of _vectors)
                result.set(result.x + vector.x, result.y + vector.y, result.z + vector.z);
            return result;
        }
        static DIFFERENCE(_minuend, _subtrahend) {
            let vector = FudgeCore.Recycler.get(Vector3);
            vector.set(_minuend.x - _subtrahend.x, _minuend.y - _subtrahend.y, _minuend.z - _subtrahend.z);
            return vector;
        }
        static SCALE(_vector, _scaling) {
            let scaled = FudgeCore.Recycler.get(Vector3);
            scaled.set(_vector.x * _scaling, _vector.y * _scaling, _vector.z * _scaling);
            return scaled;
        }
        static CROSS(_a, _b) {
            let vector = FudgeCore.Recycler.get(Vector3);
            vector.set(_a.y * _b.z - _a.z * _b.y, _a.z * _b.x - _a.x * _b.z, _a.x * _b.y - _a.y * _b.x);
            return vector;
        }
        static DOT(_a, _b) {
            let scalarProduct = _a.x * _b.x + _a.y * _b.y + _a.z * _b.z;
            return scalarProduct;
        }
        static REFLECTION(_incoming, _normal) {
            let dot = -Vector3.DOT(_incoming, _normal);
            let reflection = Vector3.SUM(_incoming, Vector3.SCALE(_normal, 2 * dot));
            return reflection;
        }
        static RATIO(_dividend, _divisor) {
            let vector = FudgeCore.Recycler.get(Vector3);
            vector.set(_dividend.x / _divisor.x, _dividend.y / _divisor.y, _dividend.z / _divisor.z);
            return vector;
        }
        static GEO(_longitude = 0, _latitude = 0, _magnitude = 1) {
            let vector = FudgeCore.Recycler.get(Vector3);
            let geo = FudgeCore.Recycler.get(FudgeCore.Geo3);
            geo.set(_longitude, _latitude, _magnitude);
            vector.geo = geo;
            FudgeCore.Recycler.store(geo);
            return vector;
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
        set x(_x) {
            this.data[0] = _x;
        }
        set y(_y) {
            this.data[1] = _y;
        }
        set z(_z) {
            this.data[2] = _z;
        }
        get magnitude() {
            return Math.hypot(...this.data);
        }
        get magnitudeSquared() {
            return Vector3.DOT(this, this);
        }
        get clone() {
            let clone = FudgeCore.Recycler.get(Vector3);
            clone.data.set(this.data);
            return clone;
        }
        set geo(_geo) {
            this.set(0, 0, _geo.magnitude);
            this.transform(FudgeCore.Matrix4x4.ROTATION_X(-_geo.latitude));
            this.transform(FudgeCore.Matrix4x4.ROTATION_Y(_geo.longitude));
        }
        get geo() {
            let geo = FudgeCore.Recycler.get(FudgeCore.Geo3);
            geo.magnitude = this.magnitude;
            if (geo.magnitude === 0)
                return geo;
            geo.longitude = 180 * Math.atan2(this.x / geo.magnitude, this.z / geo.magnitude) / Math.PI;
            geo.latitude = 180 * Math.asin(this.y / geo.magnitude) / Math.PI;
            return geo;
        }
        recycle() {
            this.data.set([0, 0, 0]);
        }
        equals(_compare, _tolerance = Number.EPSILON) {
            if (Math.abs(this.x - _compare.x) > _tolerance)
                return false;
            if (Math.abs(this.y - _compare.y) > _tolerance)
                return false;
            if (Math.abs(this.z - _compare.z) > _tolerance)
                return false;
            return true;
        }
        isInsideCube(_corner1, _corner2) {
            let diagonal = Vector3.DIFFERENCE(_corner2, _corner1);
            let relative = Vector3.DIFFERENCE(this, _corner1);
            let ratio = Vector3.RATIO(relative, diagonal);
            if (ratio.x > 1 || ratio.x < 0)
                return false;
            if (ratio.y > 1 || ratio.y < 0)
                return false;
            if (ratio.z > 1 || ratio.z < 0)
                return false;
            return true;
        }
        isInsideSphere(_center, _radius) {
            let difference = Vector3.DIFFERENCE(this, _center);
            return difference.magnitudeSquared < (_radius * _radius);
        }
        add(_addend) {
            this.data.set([_addend.x + this.x, _addend.y + this.y, _addend.z + this.z]);
        }
        subtract(_subtrahend) {
            this.data.set([this.x - _subtrahend.x, this.y - _subtrahend.y, this.z - _subtrahend.z]);
        }
        scale(_scalar) {
            this.data.set([_scalar * this.x, _scalar * this.y, _scalar * this.z]);
        }
        normalize(_length = 1) {
            this.data = Vector3.NORMALIZATION(this, _length).data;
        }
        set(_x = 0, _y = 0, _z = 0) {
            this.data[0] = _x;
            this.data[1] = _y;
            this.data[2] = _z;
        }
        get() {
            return new Float32Array(this.data);
        }
        transform(_mtxTransform, _includeTranslation = true) {
            let transformed = Vector3.TRANSFORMATION(this, _mtxTransform, _includeTranslation);
            this.data.set(transformed.data);
            FudgeCore.Recycler.store(transformed);
        }
        toVector2() {
            return new FudgeCore.Vector2(this.x, this.y);
        }
        reflect(_normal) {
            const reflected = Vector3.REFLECTION(this, _normal);
            this.set(reflected.x, reflected.y, reflected.z);
            FudgeCore.Recycler.store(reflected);
        }
        shuffle() {
            let a = Array.from(this.data);
            this.set(FudgeCore.Random.default.splice(a), FudgeCore.Random.default.splice(a), a[0]);
        }
        getDistance(_to) {
            let difference = Vector3.DIFFERENCE(this, _to);
            FudgeCore.Recycler.store(difference);
            return difference.magnitude;
        }
        min(_compare) {
            this.x = Math.min(this.x, _compare.x);
            this.y = Math.min(this.y, _compare.y);
            this.z = Math.min(this.z, _compare.z);
        }
        max(_compare) {
            this.x = Math.max(this.x, _compare.x);
            this.y = Math.max(this.y, _compare.y);
            this.z = Math.max(this.z, _compare.z);
        }
        toString() {
            let result = `(${this.x.toPrecision(5)}, ${this.y.toPrecision(5)}, ${this.z.toPrecision(5)})`;
            return result;
        }
        map(_function) {
            let copy = FudgeCore.Recycler.get(Vector3);
            copy.data = this.data.map(_function);
            return copy;
        }
        serialize() {
            let serialization = this.getMutator();
            serialization.toJSON = () => { return `[${this.x}, ${this.y}, ${this.z}]`; };
            return serialization;
        }
        async deserialize(_serialization) {
            if (typeof (_serialization) == "string") {
                [this.x, this.y, this.z] = JSON.parse(_serialization);
            }
            else
                this.mutate(_serialization);
            return this;
        }
        getMutator() {
            let mutator = {
                x: this.data[0], y: this.data[1], z: this.data[2]
            };
            return mutator;
        }
        reduceMutator(_mutator) { }
    }
    FudgeCore.Vector3 = Vector3;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    var Mesh_1;
    let Mesh = Mesh_1 = class Mesh extends FudgeCore.Mutable {
        static baseClass = Mesh_1;
        static subclasses = [];
        idResource = undefined;
        name = "Mesh";
        renderBuffers;
        ƒvertices;
        ƒindices;
        ƒtextureUVs;
        ƒnormalsFace;
        ƒnormals;
        ƒbox;
        ƒradius;
        constructor(_name = "Mesh") {
            super();
            this.name = _name;
            this.clear();
            FudgeCore.Project.register(this);
        }
        static getBufferSpecification() {
            return { size: 3, dataType: WebGL2RenderingContext.FLOAT, normalize: false, stride: 0, offset: 0 };
        }
        static registerSubclass(_subClass) { return Mesh_1.subclasses.push(_subClass) - 1; }
        static getTrigonsFromQuad(_quad, _even = true) {
            let indices;
            if (_even)
                indices = [_quad[0], _quad[1], _quad[2], _quad[3], _quad[0], _quad[2]];
            else
                indices = [_quad[0], _quad[1], _quad[2], _quad[0], _quad[2], _quad[3]];
            return indices;
        }
        static deleteInvalidIndices(_indices, _vertices) {
            for (let i = _indices.length - 3; i >= 0; i -= 3) {
                let v0 = _vertices[_indices[i]];
                let v1 = _vertices[_indices[i + 1]];
                let v2 = _vertices[_indices[i + 2]];
                if (v0.equals(v1) || v2.equals(v1) || v0.equals(v2))
                    _indices.splice(i, 3);
            }
        }
        get type() {
            return this.constructor.name;
        }
        get vertices() {
            if (this.ƒvertices == null)
                this.ƒvertices = this.createVertices();
            return this.ƒvertices;
        }
        get indices() {
            if (this.ƒindices == null)
                this.ƒindices = this.createIndices();
            return this.ƒindices;
        }
        get normalsFace() {
            if (this.ƒnormalsFace == null)
                this.ƒnormalsFace = this.createFaceNormals();
            return this.ƒnormalsFace;
        }
        get textureUVs() {
            if (this.ƒtextureUVs == null)
                this.ƒtextureUVs = this.createTextureUVs();
            return this.ƒtextureUVs;
        }
        get boundingBox() {
            if (this.ƒbox == null)
                this.ƒbox = this.createBoundingBox();
            return this.ƒbox;
        }
        get radius() {
            if (this.ƒradius == null)
                this.ƒradius = this.createRadius();
            return this.ƒradius;
        }
        useRenderBuffers(_shader, _mtxWorld, _mtxProjection, _id) { }
        createRenderBuffers() { }
        deleteRenderBuffers(_shader) { }
        getVertexCount() {
            return this.vertices.length / Mesh_1.getBufferSpecification().size;
        }
        getIndexCount() {
            return this.indices.length;
        }
        clear() {
            this.ƒvertices = undefined;
            this.ƒindices = undefined;
            this.ƒtextureUVs = undefined;
            this.ƒnormalsFace = undefined;
            this.ƒnormals = undefined;
            this.ƒbox = undefined;
            this.ƒradius = undefined;
            this.renderBuffers = null;
        }
        serialize() {
            let serialization = {
                idResource: this.idResource,
                name: this.name,
                type: this.type
            };
            return serialization;
        }
        async deserialize(_serialization) {
            FudgeCore.Project.register(this, _serialization.idResource);
            this.name = _serialization.name;
            return this;
        }
        flipNormals() {
            for (let n = 0; n < this.normalsFace.length; n++) {
                this.normalsFace[n] = -this.normalsFace[n];
            }
            for (let i = 0; i < this.indices.length - 2; i += 3) {
                let i0 = this.indices[i];
                this.indices[i] = this.indices[i + 1];
                this.indices[i + 1] = i0;
            }
            this.createRenderBuffers();
        }
        createVertices() { return null; }
        createTextureUVs() { return null; }
        createIndices() { return null; }
        createNormals() { return null; }
        createFaceNormals() {
            let normals = new Float32Array(this.vertices.length);
            let vertices = [];
            for (let v = 0; v < this.vertices.length; v += 3)
                vertices.push(new FudgeCore.Vector3(...this.vertices.slice(v, v + 3)));
            for (let i = 0; i < this.indices.length; i += 3) {
                let trigon = [this.indices[i], this.indices[i + 1], this.indices[i + 2]];
                let v0 = FudgeCore.Vector3.DIFFERENCE(vertices[trigon[0]], vertices[trigon[1]]);
                let v1 = FudgeCore.Vector3.DIFFERENCE(vertices[trigon[0]], vertices[trigon[2]]);
                let normal = (FudgeCore.Vector3.CROSS(v0, v1));
                let index = trigon[2] * 3;
                normals.set(normal.get(), index);
            }
            return normals;
        }
        createRadius() {
            let radius = 0;
            for (let vertex = 0; vertex < this.vertices.length; vertex += 3) {
                radius = Math.max(radius, Math.hypot(this.vertices[vertex], this.vertices[vertex + 1], this.vertices[vertex + 2]));
            }
            return radius;
        }
        createBoundingBox() {
            let box = FudgeCore.Recycler.get(FudgeCore.Box);
            box.set();
            for (let vertex = 0; vertex < this.vertices.length; vertex += 3) {
                box.min.x = Math.min(this.vertices[vertex], box.min.x);
                box.max.x = Math.max(this.vertices[vertex], box.max.x);
                box.min.y = Math.min(this.vertices[vertex + 1], box.min.y);
                box.max.y = Math.max(this.vertices[vertex + 1], box.max.y);
                box.min.z = Math.min(this.vertices[vertex + 2], box.min.z);
                box.max.z = Math.max(this.vertices[vertex + 2], box.max.z);
            }
            return box;
        }
        reduceMutator(_mutator) {
            delete _mutator.ƒbox;
            delete _mutator.ƒradius;
            delete _mutator.ƒvertices;
            delete _mutator.ƒindices;
            delete _mutator.ƒnormals;
            delete _mutator.ƒnormalsFace;
            delete _mutator.ƒtextureUVs;
            delete _mutator.renderBuffers;
        }
    };
    Mesh = Mesh_1 = __decorate([
        FudgeCore.RenderInjectorMesh.decorate
    ], Mesh);
    FudgeCore.Mesh = Mesh;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class MeshCube extends FudgeCore.Mesh {
        static iSubclass = FudgeCore.Mesh.registerSubclass(MeshCube);
        constructor(_name = "MeshCube") {
            super(_name);
        }
        createVertices() {
            let vertices = new Float32Array([
                -1, 1, 1, -1, -1, 1, 1, -1, 1, 1, 1, 1,
                -1, 1, -1, -1, -1, -1, 1, -1, -1, 1, 1, -1,
                -1, 1, 1, -1, -1, 1, 1, -1, 1, 1, 1, 1,
                -1, 1, -1, -1, -1, -1, 1, -1, -1, 1, 1, -1
            ]);
            vertices = vertices.map(_value => _value / 2);
            return vertices;
        }
        createIndices() {
            let indices = new Uint16Array([
                1, 2, 0, 2, 3, 0,
                2, 6, 3, 6, 7, 3,
                6, 5, 7, 5, 4, 7,
                5 + 8, 1 + 8, 4 + 8, 1 + 8, 0 + 8, 4 + 8,
                4 + 8, 0 + 8, 3 + 8, 7 + 8, 4 + 8, 3 + 8,
                5 + 8, 6 + 8, 1 + 8, 6 + 8, 2 + 8, 1 + 8
            ]);
            return indices;
        }
        createTextureUVs() {
            let textureUVs = new Float32Array([
                0, 0, 0, 1, 1, 1, 1, 0,
                3, 0, 3, 1, 2, 1, 2, 0,
                1, 0, 1, 1, 1, 2, 1, -1,
                0, 0, 0, 1, 0, 2, 0, -1
            ]);
            return textureUVs;
        }
        createFaceNormals() {
            let normals = new Float32Array([
                0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1,
                0, 0, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0,
                -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
            ]);
            return normals;
        }
    }
    FudgeCore.MeshCube = MeshCube;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class MeshPolygon extends FudgeCore.Mesh {
        static iSubclass = FudgeCore.Mesh.registerSubclass(MeshPolygon);
        static verticesDefault = [
            new FudgeCore.Vector2(-1, -1),
            new FudgeCore.Vector2(1, -1),
            new FudgeCore.Vector2(0, 1)
        ];
        shape = new FudgeCore.MutableArray();
        fitTexture;
        constructor(_name = "MeshPolygon", _shape = MeshPolygon.verticesDefault, _fitTexture = true) {
            super(_name);
            this.create(_shape, _fitTexture);
        }
        get minVertices() {
            return 3;
        }
        create(_shape = [], _fitTexture = true) {
            this.shape = FudgeCore.MutableArray.from(_shape.map(_vertex => _vertex.clone));
            this.clear();
            this.fitTexture = _fitTexture;
            if (_shape.length < this.minVertices) {
                FudgeCore.Debug.warn(`At least ${this.minVertices} vertices needed to construct MeshPolygon, default trigon used`);
                this.create(MeshPolygon.verticesDefault, true);
                return;
            }
            let shape = _shape;
            let min = FudgeCore.Vector2.ZERO();
            let max = FudgeCore.Vector2.ZERO();
            let vertices = [];
            for (let vertex of shape) {
                vertices.push(vertex.x);
                vertices.push(vertex.y);
                vertices.push(0);
                min.x = Math.min(min.x, vertex.x);
                max.x = Math.max(max.x, vertex.x);
                min.y = Math.min(min.y, vertex.y);
                max.y = Math.max(max.y, vertex.y);
            }
            let size = new FudgeCore.Vector2(max.x - min.x, max.y - min.y);
            let textureUVs = [];
            if (this.fitTexture) {
                for (let vertex of shape) {
                    let textureUV = FudgeCore.Vector2.SUM(vertex, min);
                    textureUV.y *= -1;
                    textureUVs.push(textureUV.x / size.x);
                    textureUVs.push(textureUV.y / size.y);
                }
            }
            else {
                textureUVs = _shape.map(_vertex => [_vertex.x, -_vertex.y]).flat();
            }
            this.ƒvertices = new Float32Array(vertices);
            this.ƒtextureUVs = new Float32Array(textureUVs);
            this.ƒindices = this.createIndices();
        }
        serialize() {
            let serialization = super.serialize();
            serialization.shape = FudgeCore.Serializer.serializeArray(FudgeCore.Vector2, this.shape);
            serialization.fitTexture = this.fitTexture;
            return serialization;
        }
        async deserialize(_serialization) {
            await super.deserialize(_serialization);
            let vectors = await FudgeCore.Serializer.deserializeArray(_serialization.shape);
            this.create(vectors, _serialization.fitTexture);
            return this;
        }
        async mutate(_mutator) {
            await super.mutate(_mutator);
            this.create(this.shape, _mutator.fitTexture);
            this.dispatchEvent(new Event("mutate"));
        }
        reduceMutator(_mutator) {
            super.reduceMutator(_mutator);
        }
        createIndices() {
            let indices = [];
            for (let i = 2; i < this.vertices.length / 3; i++)
                indices.push(0, i - 1, i);
            return new Uint16Array(indices);
        }
    }
    FudgeCore.MeshPolygon = MeshPolygon;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class MeshExtrusion extends FudgeCore.MeshPolygon {
        static iSubclass = FudgeCore.Mesh.registerSubclass(MeshExtrusion);
        static mtxDefaults = [
            FudgeCore.Matrix4x4.TRANSLATION(FudgeCore.Vector3.Z(0.5)),
            FudgeCore.Matrix4x4.TRANSLATION(FudgeCore.Vector3.Z(-0.5))
        ];
        mtxTransforms = new FudgeCore.MutableArray();
        constructor(_name = "MeshExtrusion", _vertices = FudgeCore.MeshPolygon.verticesDefault, _mtxTransforms = MeshExtrusion.mtxDefaults, _fitTexture = true) {
            super(_name, _vertices, _fitTexture);
            this.extrude(_mtxTransforms);
        }
        serialize() {
            let serialization = super.serialize();
            serialization.transforms = FudgeCore.Serializer.serializeArray(FudgeCore.Matrix4x4, this.mtxTransforms);
            return serialization;
        }
        async deserialize(_serialization) {
            await super.deserialize(_serialization);
            let mtxTransforms;
            if (_serialization.transforms)
                mtxTransforms = await FudgeCore.Serializer.deserializeArray(_serialization.transforms);
            this.extrude(mtxTransforms);
            return this;
        }
        async mutate(_mutator) {
            await super.mutate(_mutator);
            this.extrude(this.mtxTransforms);
            this.dispatchEvent(new Event("mutate"));
        }
        reduceMutator(_mutator) {
            super.reduceMutator(_mutator);
        }
        extrude(_mtxTransforms = MeshExtrusion.mtxDefaults) {
            this.mtxTransforms = FudgeCore.MutableArray.from(_mtxTransforms);
            let polygon = [];
            for (let i = 0; i < this.vertices.length; i += 3)
                polygon.push(new FudgeCore.Vector3(this.vertices[i], this.vertices[i + 1], this.vertices[i + 2]));
            let nTransforms = _mtxTransforms.length;
            let nVerticesPolygon = polygon.length;
            let nFacesPolygon = nVerticesPolygon - 2;
            let nIndicesPolygon = nFacesPolygon * 3;
            let vertices = [];
            let base = polygon.map((_v) => FudgeCore.Vector3.TRANSFORMATION(_v, _mtxTransforms[0], true));
            vertices.push(...base);
            let lid = polygon.map((_v) => FudgeCore.Vector3.TRANSFORMATION(_v, _mtxTransforms[nTransforms - 1], true));
            vertices.push(...lid);
            polygon.push(polygon[0].clone);
            let wrap;
            for (let i = 0; i < nTransforms; i++) {
                let mtxTransform = _mtxTransforms[i];
                wrap = polygon.map((_v) => FudgeCore.Vector3.TRANSFORMATION(_v, mtxTransform, true));
                vertices.push(...wrap);
                if (i > 0 && i < nTransforms - 1)
                    vertices.push(...wrap.map((_vector) => _vector.clone));
            }
            let indices = [];
            indices.push(...this.indices);
            for (let i = 0; i < nIndicesPolygon; i += 3) {
                indices.push(this.indices[i] + nVerticesPolygon);
                indices.push(this.indices[i + 2] + nVerticesPolygon);
                indices.push(this.indices[i + 1] + nVerticesPolygon);
            }
            for (let t = 0; t < nTransforms - 1; t++)
                for (let i = 0; i < nVerticesPolygon; i++) {
                    let index = i + 2 * nVerticesPolygon + 2 * t * (nVerticesPolygon + 1);
                    indices.push(...FudgeCore.Mesh.getTrigonsFromQuad([index, index + nVerticesPolygon + 1, index + nVerticesPolygon + 2, index + 1], false));
                }
            FudgeCore.Mesh.deleteInvalidIndices(indices, vertices);
            let nTextureUVs = this.textureUVs.length;
            let textureUVs = [];
            textureUVs.push(...this.textureUVs);
            textureUVs.push(...this.textureUVs);
            let index = nTextureUVs * 2;
            let incV = 1 / nVerticesPolygon;
            let incU = 1 / (nTransforms - 1);
            let u = 1;
            for (let t = 0; t < nTransforms - 1; t++) {
                let v = 0;
                for (let vertex = 0; vertex <= nVerticesPolygon; vertex++) {
                    textureUVs[index] = v;
                    textureUVs[index + nVerticesPolygon * 2 + 2] = v;
                    index++;
                    textureUVs[index] = u;
                    textureUVs[index + nVerticesPolygon * 2 + 2] = u - incU;
                    index++;
                    v += incV;
                }
                u -= incU;
            }
            this.ƒvertices = new Float32Array(vertices.map((_v) => [_v.x, _v.y, _v.z]).flat());
            this.ƒindices = new Uint16Array(indices);
            this.ƒtextureUVs = new Float32Array(textureUVs);
        }
    }
    FudgeCore.MeshExtrusion = MeshExtrusion;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class MeshFromData extends FudgeCore.Mesh {
        verticesToSet;
        textureUVsToSet;
        indicesToSet;
        faceNormalsToSet;
        constructor(_vertices, _textureUVs, _indices, _faceNormals) {
            super();
            this.verticesToSet = _vertices;
            this.textureUVsToSet = _textureUVs;
            this.indicesToSet = _indices;
            this.faceNormalsToSet = _faceNormals;
        }
        createVertices() {
            return this.verticesToSet;
        }
        createTextureUVs() {
            return this.textureUVsToSet;
        }
        createIndices() {
            return this.indicesToSet;
        }
        createFaceNormals() {
            return this.faceNormalsToSet;
        }
    }
    FudgeCore.MeshFromData = MeshFromData;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class MeshObj extends FudgeCore.Mesh {
        verts = [];
        uvs = [];
        inds = [];
        facenormals = [];
        constructor(objString) {
            super();
            this.parseObj(objString);
            this.splitVertices();
        }
        static LOAD(src, name = "ObjNode", material = new FudgeCore.Material("MaterialRed", FudgeCore.ShaderFlat)) {
            let xmlhttp = new XMLHttpRequest();
            let fileContent = "";
            let nodeObj = new FudgeCore.Node(name);
            nodeObj.addComponent(new FudgeCore.ComponentTransform());
            xmlhttp.onreadystatechange = async function () {
                if (this.readyState == 4 && this.status == 200) {
                    fileContent = this.responseText;
                    let meshObj = new MeshObj(fileContent);
                    nodeObj.addComponent(new FudgeCore.ComponentMesh(meshObj));
                    nodeObj.addComponent(new FudgeCore.ComponentMaterial(material));
                }
            };
            xmlhttp.open("GET", src, true);
            xmlhttp.send();
            return nodeObj;
        }
        splitVertices() {
            let vertsNew = [];
            let indicesNew = [];
            let faceNormalsNew = [];
            for (let i = 0; i < this.inds.length; i += 3) {
                let v1 = new FudgeCore.Vector3(this.verts[this.inds[i + 0] * 3 + 0], this.verts[this.inds[i + 0] * 3 + 1], this.verts[this.inds[i + 0] * 3 + 2]);
                let v2 = new FudgeCore.Vector3(this.verts[this.inds[i + 1] * 3 + 0], this.verts[this.inds[i + 1] * 3 + 1], this.verts[this.inds[i + 1] * 3 + 2]);
                let v3 = new FudgeCore.Vector3(this.verts[this.inds[i + 2] * 3 + 0], this.verts[this.inds[i + 2] * 3 + 1], this.verts[this.inds[i + 2] * 3 + 2]);
                let normal = FudgeCore.Vector3.CROSS(FudgeCore.Vector3.DIFFERENCE(v2, v1), FudgeCore.Vector3.DIFFERENCE(v3, v1));
                normal.normalize();
                faceNormalsNew.push(normal.x, normal.y, normal.z, normal.x, normal.y, normal.z, normal.x, normal.y, normal.z);
                vertsNew.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z, v3.x, v3.y, v3.z);
                indicesNew.push(i, i + 1, i + 2);
            }
            this.verts = vertsNew;
            this.inds = indicesNew;
            this.facenormals = faceNormalsNew;
        }
        parseObj(data) {
            const lines = data.split("\n");
            for (let line of lines) {
                line = line.trim();
                if (!line || line.startsWith("#"))
                    continue;
                const parts = line.split(" ");
                parts.shift();
                if (!line || line.startsWith("v "))
                    this.verts.push(...parts.map(x => +x));
                else if (!line || line.startsWith("vt "))
                    this.uvs.push(...parts.map(x => +x));
                else if (!line || line.startsWith("f ")) {
                    this.inds.push(+parts[0].split("/")[0] - 1, +parts[1].split("/")[0] - 1, +parts[2].split("/")[0] - 1);
                }
            }
        }
        createVertices() {
            return new Float32Array(this.verts);
        }
        createTextureUVs() {
            return new Float32Array(this.uvs);
        }
        createIndices() {
            return new Uint16Array(this.inds);
        }
        createFaceNormals() {
            return new Float32Array(this.facenormals);
        }
    }
    FudgeCore.MeshObj = MeshObj;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class MeshPyramid extends FudgeCore.Mesh {
        static iSubclass = FudgeCore.Mesh.registerSubclass(MeshPyramid);
        constructor(_name = "MeshPyramid") {
            super(_name);
        }
        createVertices() {
            let vertices = new Float32Array([
                -1, 0, 1, 1, 0, 1, 1, 0, -1, -1, 0, -1,
                0, 2, 0,
                -1, 0, 1, 1, 0, 1, 1, 0, -1, -1, 0, -1
            ]);
            vertices = vertices.map(_value => _value / 2);
            return vertices;
        }
        createIndices() {
            let indices = new Uint16Array([
                4, 0, 1,
                4, 1, 2,
                4, 2, 3,
                4, 3, 0,
                5 + 0, 5 + 2, 5 + 1, 5 + 0, 5 + 3, 5 + 2
            ]);
            return indices;
        }
        createTextureUVs() {
            let textureUVs = new Float32Array([
                0, 1, 1, 1, 1, 0, 0, 0,
                0.5, 0.5,
                0, 0, 1, 0, 1, 1, 0, 1
            ]);
            return textureUVs;
        }
    }
    FudgeCore.MeshPyramid = MeshPyramid;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class MeshQuad extends FudgeCore.Mesh {
        static iSubclass = FudgeCore.Mesh.registerSubclass(MeshQuad);
        constructor(_name = "MeshQuad") {
            super(_name);
        }
        createVertices() {
            let vertices = new Float32Array([
                -1, 1, 0, -1, -1, 0, 1, -1, 0, 1, 1, 0
            ]);
            vertices = vertices.map(_value => _value / 2);
            return vertices;
        }
        createIndices() {
            let indices = new Uint16Array([
                1, 2, 0, 2, 3, 0
            ]);
            return indices;
        }
        createTextureUVs() {
            let textureUVs = new Float32Array([
                0, 0, 0, 1, 1, 1, 1, 0
            ]);
            return textureUVs;
        }
        createFaceNormals() {
            return new Float32Array([
                0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0
            ]);
        }
    }
    FudgeCore.MeshQuad = MeshQuad;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class TerrainInfo {
        position;
        normal;
    }
    FudgeCore.TerrainInfo = TerrainInfo;
    class MeshTerrain extends FudgeCore.Mesh {
        static iSubclass = FudgeCore.Mesh.registerSubclass(MeshTerrain);
        resolution;
        scale;
        seed;
        heightMapFunction = null;
        constructor(_name = "MeshTerrain", _resolution = FudgeCore.Vector2.ONE(2), _scaleInput = FudgeCore.Vector2.ONE(), _functionOrSeed = 0) {
            super(_name);
            this.create(_resolution, _scaleInput, _functionOrSeed);
        }
        create(_resolution = FudgeCore.Vector2.ONE(2), _scaleInput = FudgeCore.Vector2.ONE(), _functionOrSeed = 0) {
            this.clear();
            this.seed = undefined;
            this.resolution = _resolution.clone;
            this.scale = _scaleInput.clone;
            if (_functionOrSeed instanceof Function)
                this.heightMapFunction = _functionOrSeed;
            else if (typeof (_functionOrSeed) == "number") {
                this.seed = _functionOrSeed;
                let prng = new FudgeCore.Random(this.seed);
                this.heightMapFunction = new FudgeCore.Noise2(() => prng.getNorm()).sample;
            }
            else
                this.heightMapFunction = new FudgeCore.Noise2().sample;
        }
        getTerrainInfo(position, mtxWorld) {
            let relPosObject = position;
            if (mtxWorld)
                relPosObject = FudgeCore.Vector3.TRANSFORMATION(position, FudgeCore.Matrix4x4.INVERSION(mtxWorld), true);
            let nearestFace = this.findNearestFace(relPosObject);
            let posOnTerrain = new TerrainInfo;
            let origin = new FudgeCore.Vector3(relPosObject.x, this.calculateHeight(nearestFace, relPosObject), relPosObject.z);
            let direction = nearestFace.faceNormal;
            if (mtxWorld) {
                origin = FudgeCore.Vector3.TRANSFORMATION(origin, mtxWorld, true);
                direction = FudgeCore.Vector3.TRANSFORMATION(direction, mtxWorld, false);
            }
            posOnTerrain.position = origin;
            posOnTerrain.normal = direction;
            return posOnTerrain;
        }
        serialize() {
            let serialization = super.serialize();
            serialization.seed = this.seed;
            serialization.scale = this.scale.serialize();
            serialization.resolution = this.resolution.serialize();
            return serialization;
        }
        async deserialize(_serialization) {
            await super.deserialize(_serialization);
            await this.resolution.deserialize(_serialization.resolution);
            await this.scale.deserialize(_serialization.scale);
            this.seed = _serialization.seed;
            this.create(this.resolution, this.scale, this.seed);
            return this;
        }
        async mutate(_mutator) {
            super.mutate(_mutator);
            this.create(new FudgeCore.Vector2(_mutator.resolution.x, _mutator.resolution.y), new FudgeCore.Vector2(_mutator.scale.x, _mutator.scale.y), _mutator.seed);
        }
        createVertices() {
            let vertices = [];
            let row;
            for (let z = 0; z <= this.resolution.y; z++) {
                row = [];
                for (let x = 0; x <= this.resolution.x; x++) {
                    let xNorm = x / this.resolution.x;
                    let zNorm = z / this.resolution.y;
                    row.push(new FudgeCore.Vector3(xNorm - 0.5, this.heightMapFunction(xNorm * this.scale.x, zNorm * this.scale.y), zNorm - 0.5));
                }
                vertices.push(...row);
                if (z > 0 && z <= this.resolution.y - 1)
                    vertices.push(...row);
            }
            return new Float32Array(vertices.map((_v) => [_v.x, _v.y, _v.z]).flat());
        }
        createIndices() {
            let vert = 0;
            let tris = 0;
            let indices = new Uint16Array(this.resolution.x * this.resolution.y * 6);
            let switchOrientation = false;
            for (let z = 0; z < 2 * this.resolution.y; z += 2) {
                for (let x = 0; x < this.resolution.x; x++) {
                    if (!switchOrientation) {
                        indices[tris + 1] = vert + this.resolution.x + 1;
                        indices[tris + 2] = vert + 1;
                        indices[tris + 0] = vert + 0;
                        indices[tris + 4] = vert + this.resolution.x + 1;
                        indices[tris + 5] = vert + this.resolution.x + 2;
                        indices[tris + 3] = vert + 1;
                    }
                    else {
                        indices[tris + 1] = vert + this.resolution.x + 1;
                        indices[tris + 2] = vert + this.resolution.x + 2;
                        indices[tris + 0] = vert + 0;
                        indices[tris + 3] = vert + 0;
                        indices[tris + 4] = vert + this.resolution.x + 2;
                        indices[tris + 5] = vert + 1;
                    }
                    switchOrientation = !switchOrientation;
                    vert++;
                    tris += 6;
                }
                if (this.resolution.x % 2 == 0)
                    switchOrientation = !switchOrientation;
                vert += this.resolution.x + 2;
            }
            return indices;
        }
        createTextureUVs() {
            let textureUVs = [];
            for (let i = 0; i < this.vertices.length; i += 3)
                textureUVs.push(new FudgeCore.Vector2(this.vertices[i], this.vertices[i + 2]));
            return new Float32Array(textureUVs.map((_v) => [_v.x + 0.5, _v.y + 0.5]).flat());
        }
        calculateHeight(face, relativePosObject) {
            let ray = new FudgeCore.Ray(new FudgeCore.Vector3(0, 1, 0), relativePosObject);
            let intersection = ray.intersectPlane(face.vertexONE, face.faceNormal);
            return intersection.y;
        }
        findNearestFace(relativPosObject) {
            let vertices = this.vertices;
            let indices = this.indices;
            let row = Math.floor((relativPosObject.z + 0.5) * this.resolution.y);
            let column = Math.floor((relativPosObject.x + 0.5) * this.resolution.x);
            if (row >= this.resolution.y)
                row = this.resolution.y - 1;
            if (row < 0)
                row = 0;
            if (column >= this.resolution.x)
                column = this.resolution.y - 1;
            if (column < 0)
                column = 0;
            let field = ((row * this.resolution.x) + column) * 6;
            let vertexONE1 = new FudgeCore.Vector3(vertices[indices[field] * 3], vertices[indices[field] * 3 + 1], vertices[indices[field] * 3 + 2]);
            let vertexTWO1 = new FudgeCore.Vector3(vertices[indices[field + 1] * 3], vertices[indices[field + 1] * 3 + 1], vertices[indices[field + 1] * 3 + 2]);
            let vertexTHREE1 = new FudgeCore.Vector3(vertices[indices[field + 2] * 3], vertices[indices[field + 2] * 3 + 1], vertices[indices[field + 2] * 3 + 2]);
            let face1 = new DistanceToFaceVertices(vertexONE1, vertexTWO1, vertexTHREE1, relativPosObject);
            field = field + 3;
            let vertexONE2 = new FudgeCore.Vector3(vertices[indices[field] * 3], vertices[indices[field] * 3 + 1], vertices[indices[field] * 3 + 2]);
            let vertexTWO2 = new FudgeCore.Vector3(vertices[indices[field + 1] * 3], vertices[indices[field + 1] * 3 + 1], vertices[indices[field + 1] * 3 + 2]);
            let vertexTHREE2 = new FudgeCore.Vector3(vertices[indices[field + 2] * 3], vertices[indices[field + 2] * 3 + 1], vertices[indices[field + 2] * 3 + 2]);
            let face2 = new DistanceToFaceVertices(vertexONE2, vertexTWO2, vertexTHREE2, relativPosObject);
            if (face1.distance < face2.distance)
                return face1;
            else
                return face2;
        }
    }
    FudgeCore.MeshTerrain = MeshTerrain;
    class DistanceToFaceVertices {
        vertexONE;
        vertexTWO;
        vertexTHREE;
        distanceONE;
        distanceTWO;
        distanceTHREE;
        distance;
        faceNormal;
        constructor(vertexONE, vertexTWO, vertexTHREE, relativPosObject) {
            this.vertexONE = vertexONE;
            this.vertexTWO = vertexTWO;
            this.vertexTHREE = vertexTHREE;
            this.distanceONE = new FudgeCore.Vector2(vertexONE.x - relativPosObject.x, vertexONE.z - relativPosObject.z).magnitude;
            this.distanceTWO = new FudgeCore.Vector2(vertexTWO.x - relativPosObject.x, vertexTWO.z - relativPosObject.z).magnitude;
            this.distanceTHREE = new FudgeCore.Vector2(vertexTHREE.x - relativPosObject.x, vertexTHREE.z - relativPosObject.z).magnitude;
            this.distance = this.distanceONE + this.distanceTWO + this.distanceTHREE;
            this.calculateFaceNormal();
        }
        calculateFaceNormal() {
            let v1 = FudgeCore.Vector3.DIFFERENCE(this.vertexTWO, this.vertexONE);
            let v2 = FudgeCore.Vector3.DIFFERENCE(this.vertexTHREE, this.vertexONE);
            this.faceNormal = FudgeCore.Vector3.CROSS(v1, v2);
        }
    }
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class MeshRelief extends FudgeCore.MeshTerrain {
        static iSubclass = FudgeCore.Mesh.registerSubclass(MeshRelief);
        texture = null;
        constructor(_name = "MeshRelief", _texture = null) {
            super(_name, FudgeCore.Vector2.ONE(2), undefined, (_x, _z) => 0);
            this.setTexture(_texture);
        }
        static createHeightMapFunction(_texture) {
            let array = MeshRelief.textureToClampedArray(_texture);
            let heightMapFunction = (_x, _z) => {
                let pixel = _z * _texture.image.width + _x;
                return array[pixel * 4] / 255;
            };
            return heightMapFunction;
        }
        static textureToClampedArray(_texture) {
            let canvas = document.createElement("canvas");
            canvas.width = _texture.image.width;
            canvas.height = _texture.image.height;
            let crc = canvas.getContext("2d");
            crc.imageSmoothingEnabled = false;
            crc.drawImage(_texture.image, 0, 0);
            return crc.getImageData(0, 0, _texture.image.width, _texture.image.height).data;
        }
        setTexture(_texture = null) {
            if (!_texture)
                return;
            this.texture = _texture;
            super.create(_texture ? new FudgeCore.Vector2(_texture.image.width - 1, _texture.image.height - 1) : undefined, undefined, MeshRelief.createHeightMapFunction(_texture));
        }
        serialize() {
            let serialization = super.serialize();
            delete serialization.seed;
            delete serialization.scale;
            delete serialization.resolution;
            if (this.texture)
                serialization.idTexture = this.texture.idResource;
            return serialization;
        }
        async deserialize(_serialization) {
            await super.deserialize(_serialization);
            if (_serialization.idTexture) {
                this.texture = await FudgeCore.Project.getResource(_serialization.idTexture);
                this.setTexture(this.texture);
            }
            return this;
        }
        async mutate(_mutator) {
            this.setTexture(_mutator.texture);
        }
        reduceMutator(_mutator) {
            super.reduceMutator(_mutator);
            delete _mutator.seed;
            delete _mutator.scale;
            delete _mutator.resolution;
        }
        createVertices() {
            let vertices = [];
            let row;
            for (let z = 0; z <= this.resolution.y; z++) {
                row = [];
                for (let x = 0; x <= this.resolution.x; x++) {
                    let xNorm = x / this.resolution.x;
                    let zNorm = z / this.resolution.y;
                    row.push(new FudgeCore.Vector3(xNorm - 0.5, this.heightMapFunction(x, z), zNorm - 0.5));
                }
                vertices.push(...row);
                if (z > 0 && z <= this.resolution.y - 1)
                    vertices.push(...row);
            }
            return new Float32Array(vertices.map((_v) => [_v.x, _v.y, _v.z]).flat());
        }
    }
    FudgeCore.MeshRelief = MeshRelief;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class MeshRotation extends FudgeCore.MeshPolygon {
        static iSubclass = FudgeCore.Mesh.registerSubclass(MeshRotation);
        static verticesDefault = [
            new FudgeCore.Vector2(0.5, 0.5),
            new FudgeCore.Vector2(0.5, -0.5)
        ];
        sectors;
        constructor(_name = "MeshRotation", _vertices = MeshRotation.verticesDefault, _sectors = 3, _fitTexture = true) {
            super(_name, _vertices, _fitTexture);
            this.rotate(_sectors);
        }
        get minVertices() {
            return 2;
        }
        serialize() {
            let serialization = super.serialize();
            serialization.sectors = this.sectors;
            return serialization;
        }
        async deserialize(_serialization) {
            await super.deserialize(_serialization);
            this.sectors = _serialization.sectors;
            this.rotate(this.sectors);
            return this;
        }
        async mutate(_mutator) {
            await super.mutate(_mutator);
            this.rotate(this.sectors);
            this.dispatchEvent(new Event("mutate"));
        }
        reduceMutator(_mutator) {
            super.reduceMutator(_mutator);
        }
        rotate(_sectors) {
            this.sectors = Math.round(_sectors);
            let angle = 360 / this.sectors;
            let mtxRotate = FudgeCore.Matrix4x4.ROTATION_Y(angle);
            let polygon = [];
            for (let i = 0; i < this.vertices.length; i += 3)
                polygon.push(new FudgeCore.Vector3(this.vertices[i], this.vertices[i + 1], this.vertices[i + 2]));
            let nVerticesPolygon = polygon.length;
            let vertices = [];
            for (let sector = 0; sector <= this.sectors; sector++) {
                vertices.push(...polygon.map((_vector) => _vector.clone));
                polygon.forEach((_vector) => _vector.transform(mtxRotate));
            }
            let indices = [];
            for (let sector = 0; sector < this.sectors; sector++) {
                for (let quad = 0; quad < nVerticesPolygon - 1; quad++) {
                    let start = sector * nVerticesPolygon + quad;
                    let quadIndices = [start + 1, start + 1 + nVerticesPolygon, start + nVerticesPolygon, start];
                    indices.push(...FudgeCore.Mesh.getTrigonsFromQuad(quadIndices));
                }
            }
            FudgeCore.Mesh.deleteInvalidIndices(indices, vertices);
            let textureUVs = [];
            for (let sector = 0; sector <= this.sectors; sector++) {
                for (let i = 0; i < nVerticesPolygon; i++) {
                    let u = sector / this.sectors;
                    let v = i * 1 / (nVerticesPolygon - 1);
                    textureUVs.push(u, v);
                }
            }
            this.ƒvertices = new Float32Array(vertices.map((_v) => [_v.x, _v.y, _v.z]).flat());
            this.ƒindices = new Uint16Array(indices);
            this.ƒtextureUVs = new Float32Array(textureUVs);
        }
    }
    FudgeCore.MeshRotation = MeshRotation;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class MeshSphere extends FudgeCore.Mesh {
        static iSubclass = FudgeCore.Mesh.registerSubclass(MeshSphere);
        sectors;
        stacks;
        constructor(_name = "MeshSphere", _sectors = 8, _stacks = 8) {
            super(_name);
            this.create(_sectors, _stacks);
        }
        create(_sectors = 3, _stacks = 2) {
            this.clear();
            this.sectors = Math.min(Math.round(_sectors), 128);
            this.stacks = Math.min(Math.round(_stacks), 128);
            if (_sectors < 3 || _stacks < 2) {
                FudgeCore.Debug.warn("UV Sphere must have at least 3 sectors and 2 stacks to form a 3-dimensional shape.");
                this.sectors = Math.max(3, _sectors);
                this.stacks = Math.max(2, _stacks);
            }
            let vertices = [];
            let normals = [];
            let textureUVs = [];
            let x;
            let z;
            let xz;
            let y;
            let sectorStep = 2 * Math.PI / this.sectors;
            let stackStep = Math.PI / this.stacks;
            let stackAngle;
            let sectorAngle;
            for (let i = 0; i <= this.stacks; ++i) {
                stackAngle = Math.PI / 2 - i * stackStep;
                xz = Math.cos(stackAngle);
                y = Math.sin(stackAngle);
                for (let j = 0; j <= this.sectors; ++j) {
                    sectorAngle = j * sectorStep;
                    x = xz * Math.cos(sectorAngle);
                    z = xz * Math.sin(sectorAngle);
                    vertices.push(x, y, z);
                    normals.push(x, y, z);
                    textureUVs.push(j / this.sectors * -1);
                    textureUVs.push(i / this.stacks);
                }
            }
            vertices = vertices.map(_value => _value / 2);
            this.ƒtextureUVs = new Float32Array(textureUVs);
            this.ƒnormals = new Float32Array(normals);
            this.ƒvertices = new Float32Array(vertices);
            this.ƒnormalsFace = this.createFaceNormals();
            this.ƒindices = this.createIndices();
        }
        serialize() {
            let serialization = super.serialize();
            serialization.sectors = this.sectors;
            serialization.stacks = this.stacks;
            return serialization;
        }
        async deserialize(_serialization) {
            await super.deserialize(_serialization);
            this.create(_serialization.sectors, _serialization.stacks);
            return this;
        }
        async mutate(_mutator) {
            super.mutate(_mutator);
            this.create(_mutator.sectors, _mutator.stacks);
        }
        createIndices() {
            let inds = [];
            let k1;
            let k2;
            for (let i = 0; i < this.stacks; ++i) {
                k1 = i * (this.sectors + 1);
                k2 = k1 + this.sectors + 1;
                for (let j = 0; j < this.sectors; ++j, ++k1, ++k2) {
                    if (i != 0) {
                        inds.push(k1);
                        inds.push(k1 + 1);
                        inds.push(k2);
                    }
                    if (i != (this.stacks - 1)) {
                        inds.push(k1 + 1);
                        inds.push(k2 + 1);
                        inds.push(k2);
                    }
                }
            }
            let indices = new Uint16Array(inds);
            return indices;
        }
    }
    FudgeCore.MeshSphere = MeshSphere;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class MeshSprite extends FudgeCore.Mesh {
        static iSubclass = FudgeCore.Mesh.registerSubclass(MeshSprite);
        constructor(_name = "MeshSprite") {
            super(_name);
        }
        createVertices() {
            let vertices = new Float32Array([
                -1, 1, 0, -1, -1, 0, 1, -1, 0, 1, 1, 0
            ]);
            vertices = vertices.map(_value => _value / 2);
            return vertices;
        }
        createIndices() {
            let indices = new Uint16Array([
                1, 2, 0, 2, 3, 0,
                0, 3, 1, 3, 2, 1
            ]);
            return indices;
        }
        createTextureUVs() {
            let textureUVs = new Float32Array([
                0, 0, 0, 1, 1, 1, 1, 0
            ]);
            return textureUVs;
        }
        createFaceNormals() {
            return new Float32Array([
                0, 0, 1,
                0, 0, -1,
                0, 0, 0,
                0, 0, 0
            ]);
        }
    }
    FudgeCore.MeshSprite = MeshSprite;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class MeshTorus extends FudgeCore.Mesh {
        static iSubclass = FudgeCore.Mesh.registerSubclass(MeshTorus);
        thickness = 0.25;
        majorSegments = 32;
        minorSegments = 12;
        constructor(_name = "MeshTorus", _thickness = 0.25, _majorSegments = 32, _minorSegments = 12) {
            super(_name);
            this.create(_thickness, _majorSegments, _minorSegments);
        }
        create(_thickness = 0.25, _majorSegments = 32, _minorSegments = 12) {
            this.majorSegments = Math.min(_majorSegments, 128);
            this.minorSegments = Math.min(_minorSegments, 128);
            if (_majorSegments < 3 || _minorSegments < 3) {
                FudgeCore.Debug.warn("Torus must have at least 3 major and minor segments");
                this.majorSegments = Math.max(3, _majorSegments);
                this.minorSegments = Math.max(3, _minorSegments);
            }
            this.clear();
            let vertices = [];
            let normals = [];
            let textureUVs = [];
            let centerX;
            let centerY;
            let x, y, z;
            let PI2 = Math.PI * 2;
            for (let j = 0; j <= this.minorSegments; j++) {
                for (let i = 0; i <= this.majorSegments; i++) {
                    let u = i / this.majorSegments * PI2;
                    let v = j / this.minorSegments * PI2;
                    centerX = Math.cos(u);
                    centerY = Math.sin(u);
                    x = (1 + this.thickness * Math.cos(v)) * Math.sin(u);
                    y = this.thickness * Math.sin(v);
                    z = (1 + this.thickness * Math.cos(v)) * Math.cos(u);
                    vertices.push(x, y, z);
                    let normal = new FudgeCore.Vector3(x - centerX, y - centerY, z);
                    normal.normalize();
                    normals.push(normal.x, normal.y, normal.z);
                    textureUVs.push(i / this.majorSegments, j / this.minorSegments);
                }
            }
            vertices = vertices.map(_value => _value / 2);
            this.ƒtextureUVs = new Float32Array(textureUVs);
            this.ƒnormals = new Float32Array(normals);
            this.ƒvertices = new Float32Array(vertices);
            this.ƒindices = this.createIndices();
            this.createRenderBuffers();
        }
        async mutate(_mutator) {
            super.mutate(_mutator);
            let thickness = Math.round(_mutator.thickness);
            let majorSegments = Math.round(_mutator.majorSegments);
            let minorSegments = Math.round(_mutator.minorSegments);
            this.create(thickness, majorSegments, minorSegments);
        }
        createIndices() {
            let inds = [];
            for (let j = 1; j <= this.minorSegments; j++) {
                for (let i = 1; i <= this.majorSegments; i++) {
                    let a = (this.majorSegments + 1) * j + i - 1;
                    let b = (this.majorSegments + 1) * (j - 1) + i - 1;
                    let c = (this.majorSegments + 1) * (j - 1) + i;
                    let d = (this.majorSegments + 1) * j + i;
                    inds.push(a, b, d, b, c, d);
                }
            }
            let indices = new Uint16Array(inds);
            return indices;
        }
    }
    FudgeCore.MeshTorus = MeshTorus;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    let BODY_INIT;
    (function (BODY_INIT) {
        BODY_INIT[BODY_INIT["TO_MESH"] = 0] = "TO_MESH";
        BODY_INIT[BODY_INIT["TO_NODE"] = 1] = "TO_NODE";
        BODY_INIT[BODY_INIT["TO_PIVOT"] = 2] = "TO_PIVOT";
    })(BODY_INIT = FudgeCore.BODY_INIT || (FudgeCore.BODY_INIT = {}));
    class ComponentRigidbody extends FudgeCore.Component {
        static iSubclass = FudgeCore.Component.registerSubclass(ComponentRigidbody);
        mtxPivot = FudgeCore.Matrix4x4.IDENTITY();
        convexMesh = null;
        collisions = new Array();
        triggerings = new Array();
        collisionMask;
        initialization = BODY_INIT.TO_PIVOT;
        isInitialized = false;
        #id = 0;
        #collider;
        #colliderInfo;
        #collisionGroup = FudgeCore.COLLISION_GROUP.DEFAULT;
        #typeCollider = FudgeCore.COLLIDER_TYPE.CUBE;
        #rigidbody;
        #rigidbodyInfo = new OIMO.RigidBodyConfig();
        #typeBody = FudgeCore.BODY_TYPE.DYNAMIC;
        #massData = new OIMO.MassData();
        #restitution;
        #friction;
        #dampingLinear = 0.1;
        #dampingAngular = 0.1;
        #effectRotation = FudgeCore.Vector3.ONE();
        #effectGravity = 1;
        #isTrigger = false;
        #mtxPivotUnscaled = FudgeCore.Matrix4x4.IDENTITY();
        #mtxPivotInverse = FudgeCore.Matrix4x4.IDENTITY();
        #callbacks;
        constructor(_mass = 1, _type = FudgeCore.BODY_TYPE.DYNAMIC, _colliderType = FudgeCore.COLLIDER_TYPE.CUBE, _group = FudgeCore.Physics.settings.defaultCollisionGroup, _mtxTransform = null, _convexMesh = null) {
            super();
            this.create(_mass, _type, _colliderType, _group, _mtxTransform, _convexMesh);
        }
        get id() {
            return this.#id;
        }
        get mtxPivotInverse() {
            return this.#mtxPivotInverse;
        }
        get mtxPivotUnscaled() {
            return this.#mtxPivotUnscaled;
        }
        get typeBody() {
            return this.#typeBody;
        }
        set typeBody(_value) {
            this.#typeBody = _value;
            let oimoType;
            switch (this.#typeBody) {
                case FudgeCore.BODY_TYPE.DYNAMIC:
                    oimoType = OIMO.RigidBodyType.DYNAMIC;
                    break;
                case FudgeCore.BODY_TYPE.STATIC:
                    oimoType = OIMO.RigidBodyType.STATIC;
                    break;
                case FudgeCore.BODY_TYPE.KINEMATIC:
                    oimoType = OIMO.RigidBodyType.KINEMATIC;
                    break;
                default:
                    oimoType = OIMO.RigidBodyType.DYNAMIC;
                    break;
            }
            this.#rigidbody.setType(oimoType);
            this.#rigidbody.setMassData(this.#massData);
        }
        get typeCollider() {
            return this.#typeCollider;
        }
        set typeCollider(_value) {
            if (_value != this.#typeCollider && this.#rigidbody != null) {
                this.#typeCollider = _value;
                this.initialize();
            }
        }
        get collisionGroup() {
            return this.#collisionGroup;
        }
        set collisionGroup(_value) {
            this.#collisionGroup = _value;
            if (this.#rigidbody != null)
                this.#rigidbody.getShapeList().setCollisionGroup(this.#collisionGroup);
        }
        get isTrigger() {
            return this.#isTrigger;
        }
        set isTrigger(_value) {
            this.#isTrigger = _value;
            if (this.getOimoRigidbody() != null) {
                this.getOimoRigidbody()._isTrigger = this.#isTrigger;
            }
        }
        get mass() {
            return this.#rigidbody.getMass();
        }
        set mass(_value) {
            this.#massData.mass = _value;
            if (this.node != null)
                if (this.#rigidbody != null)
                    this.#rigidbody.setMassData(this.#massData);
        }
        get dampTranslation() {
            return this.#rigidbody.getLinearDamping();
        }
        set dampTranslation(_value) {
            this.#dampingLinear = _value;
            this.#rigidbody.setLinearDamping(_value);
        }
        get dampRotation() {
            return this.#rigidbody.getAngularDamping();
        }
        set dampRotation(_value) {
            this.#dampingAngular = _value;
            this.#rigidbody.setAngularDamping(_value);
        }
        get effectRotation() {
            return this.#effectRotation;
        }
        set effectRotation(_effect) {
            this.#effectRotation = _effect;
            this.#rigidbody.setRotationFactor(new OIMO.Vec3(this.#effectRotation.x, this.#effectRotation.y, this.#effectRotation.z));
        }
        get effectGravity() {
            return this.#effectGravity;
        }
        set effectGravity(_effect) {
            this.#effectGravity = _effect;
            if (this.#rigidbody != null)
                this.#rigidbody.setGravityScale(this.#effectGravity);
        }
        get friction() {
            return this.#friction;
        }
        set friction(_friction) {
            this.#friction = _friction;
            if (this.#rigidbody.getShapeList() != null)
                this.#rigidbody.getShapeList().setFriction(this.#friction);
        }
        get restitution() {
            return this.#restitution;
        }
        set restitution(_restitution) {
            this.#restitution = _restitution;
            if (this.#rigidbody.getShapeList() != null)
                this.#rigidbody.getShapeList().setRestitution(this.#restitution);
        }
        getOimoRigidbody() {
            return this.#rigidbody;
        }
        rotateBody(_rotationChange) {
            this.#rigidbody.rotateXyz(new OIMO.Vec3(_rotationChange.x * Math.PI / 180, _rotationChange.y * Math.PI / 180, _rotationChange.z * Math.PI / 180));
        }
        translateBody(_translationChange) {
            this.#rigidbody.translate(new OIMO.Vec3(_translationChange.x, _translationChange.y, _translationChange.z));
        }
        getPosition() {
            let tmpPos = this.#rigidbody.getPosition();
            return new FudgeCore.Vector3(tmpPos.x, tmpPos.y, tmpPos.z);
        }
        setPosition(_value) {
            this.#rigidbody.setPosition(new OIMO.Vec3(_value.x, _value.y, _value.z));
        }
        getRotation() {
            let orientation = this.#rigidbody.getOrientation();
            let tmpQuat = new FudgeCore.Quaternion(orientation.x, orientation.y, orientation.z, orientation.w);
            return tmpQuat.toDegrees();
        }
        setRotation(_value) {
            let quat = new OIMO.Quat();
            let mtxRot = FudgeCore.Matrix4x4.IDENTITY();
            mtxRot.rotate(new FudgeCore.Vector3(_value.x, _value.y, _value.z));
            let array = mtxRot.get();
            let rot = new OIMO.Mat3(array[0], array[4], array[8], array[1], array[5], array[9], array[2], array[6], array[10]);
            quat.fromMat3(rot);
            this.#rigidbody.setOrientation(quat);
        }
        getScaling() {
            let scaling = this.node.mtxWorld.scaling.clone;
            scaling.x *= this.mtxPivot.scaling.x;
            scaling.y *= this.mtxPivot.scaling.y;
            scaling.z *= this.mtxPivot.scaling.z;
            return scaling;
        }
        setScaling(_value) {
            this.createCollider(new OIMO.Vec3(_value.x / 2, _value.y / 2, _value.z / 2), this.#typeCollider);
            this.#collider = new OIMO.Shape(this.#colliderInfo);
            let oldCollider = this.#rigidbody.getShapeList();
            this.#rigidbody.addShape(this.#collider);
            this.#rigidbody.removeShape(oldCollider);
            this.#collider.userData = this;
            this.#collider.setCollisionGroup(this.collisionGroup);
            this.#collider.setCollisionMask(this.collisionMask);
            this.#collider.setRestitution(this.#restitution);
            this.#collider.setFriction(this.#friction);
            this.#collider.setContactCallback(this.#callbacks);
        }
        initialize() {
            if (!this.node)
                return;
            switch (Number(this.initialization)) {
                case BODY_INIT.TO_NODE:
                    this.mtxPivot = FudgeCore.Matrix4x4.IDENTITY();
                    break;
                case BODY_INIT.TO_MESH:
                    let cmpMesh = this.node.getComponent(FudgeCore.ComponentMesh);
                    if (cmpMesh)
                        this.mtxPivot = cmpMesh.mtxPivot.clone;
                    break;
                case BODY_INIT.TO_PIVOT:
                    break;
            }
            let mtxWorld = FudgeCore.Matrix4x4.MULTIPLICATION(this.node.mtxWorld, this.mtxPivot);
            let position = mtxWorld.translation;
            let rotation = mtxWorld.getEulerAngles();
            let scaling = mtxWorld.scaling;
            this.setScaling(scaling);
            this.#rigidbody.setMassData(this.#massData);
            this.setPosition(position);
            this.setRotation(rotation);
            this.#mtxPivotUnscaled = FudgeCore.Matrix4x4.CONSTRUCTION({ translation: this.mtxPivot.translation, rotation: this.mtxPivot.rotation, scaling: FudgeCore.Vector3.ONE() });
            this.#mtxPivotInverse = FudgeCore.Matrix4x4.INVERSION(this.#mtxPivotUnscaled);
            this.isInitialized = true;
        }
        getVelocity() {
            let velocity = this.#rigidbody.getLinearVelocity();
            return new FudgeCore.Vector3(velocity.x, velocity.y, velocity.z);
        }
        setVelocity(_value) {
            let velocity = new OIMO.Vec3(_value.x, _value.y, _value.z);
            this.#rigidbody.setLinearVelocity(velocity);
        }
        getAngularVelocity() {
            let velocity = this.#rigidbody.getAngularVelocity();
            return new FudgeCore.Vector3(velocity.x, velocity.y, velocity.z);
        }
        setAngularVelocity(_value) {
            let velocity = new OIMO.Vec3(_value.x, _value.y, _value.z);
            this.#rigidbody.setAngularVelocity(velocity);
        }
        applyForce(_force) {
            this.#rigidbody.applyForceToCenter(new OIMO.Vec3(_force.x, _force.y, _force.z));
        }
        applyForceAtPoint(_force, _worldPoint) {
            this.#rigidbody.applyForce(new OIMO.Vec3(_force.x, _force.y, _force.z), new OIMO.Vec3(_worldPoint.x, _worldPoint.y, _worldPoint.z));
        }
        applyTorque(_rotationalForce) {
            this.#rigidbody.applyTorque(new OIMO.Vec3(_rotationalForce.x, _rotationalForce.y, _rotationalForce.z));
        }
        applyImpulseAtPoint(_impulse, _worldPoint = null) {
            _worldPoint = _worldPoint != null ? _worldPoint : this.getPosition();
            this.#rigidbody.applyImpulse(new OIMO.Vec3(_impulse.x, _impulse.y, _impulse.z), new OIMO.Vec3(_worldPoint.x, _worldPoint.y, _worldPoint.z));
        }
        applyLinearImpulse(_impulse) {
            this.#rigidbody.applyLinearImpulse(new OIMO.Vec3(_impulse.x, _impulse.y, _impulse.z));
        }
        applyAngularImpulse(_rotationalImpulse) {
            this.#rigidbody.applyAngularImpulse(new OIMO.Vec3(_rotationalImpulse.x, _rotationalImpulse.y, _rotationalImpulse.z));
        }
        addVelocity(_value) {
            this.#rigidbody.addLinearVelocity(new OIMO.Vec3(_value.x, _value.y, _value.z));
        }
        addAngularVelocity(_value) {
            this.#rigidbody.addAngularVelocity(new OIMO.Vec3(_value.x, _value.y, _value.z));
        }
        deactivateAutoSleep() {
            this.#rigidbody.setAutoSleep(false);
        }
        activateAutoSleep() {
            this.#rigidbody.setAutoSleep(true);
        }
        checkCollisionEvents() {
            let list = this.#rigidbody.getContactLinkList();
            let objHit;
            let objHit2;
            let event;
            let normalImpulse = 0;
            let binormalImpulse = 0;
            let tangentImpulse = 0;
            let colPoint;
            for (let i = 0; i < this.#rigidbody.getNumContactLinks(); i++) {
                let collisionManifold = list.getContact().getManifold();
                objHit = list.getContact().getShape1().userData;
                if (objHit == null || list.getContact().isTouching() == false)
                    return;
                objHit2 = list.getContact().getShape2().userData;
                if (objHit2 == null || list.getContact().isTouching() == false)
                    return;
                let points = collisionManifold.getPoints();
                let normal = collisionManifold.getNormal();
                if (objHit.getOimoRigidbody() != this.getOimoRigidbody() && this.collisions.indexOf(objHit) == -1) {
                    let colPos = this.collisionCenterPoint(points, collisionManifold.getNumPoints());
                    colPoint = new FudgeCore.Vector3(colPos.x, colPos.y, colPos.z);
                    points.forEach((value) => {
                        normalImpulse += value.getNormalImpulse();
                        binormalImpulse += value.getBinormalImpulse();
                        tangentImpulse += value.getTangentImpulse();
                    });
                    this.collisions.push(objHit);
                    event = new FudgeCore.EventPhysics("ColliderEnteredCollision", objHit, normalImpulse, tangentImpulse, binormalImpulse, colPoint, new FudgeCore.Vector3(normal.x, normal.y, normal.z));
                    this.dispatchEvent(event);
                }
                if (objHit2 != this && this.collisions.indexOf(objHit2) == -1) {
                    let colPos = this.collisionCenterPoint(points, collisionManifold.getNumPoints());
                    colPoint = new FudgeCore.Vector3(colPos.x, colPos.y, colPos.z);
                    points.forEach((value) => {
                        normalImpulse += value.getNormalImpulse();
                        binormalImpulse += value.getBinormalImpulse();
                        tangentImpulse += value.getTangentImpulse();
                    });
                    this.collisions.push(objHit2);
                    event = new FudgeCore.EventPhysics("ColliderEnteredCollision", objHit2, normalImpulse, tangentImpulse, binormalImpulse, colPoint, new FudgeCore.Vector3(normal.x, normal.y, normal.z));
                    this.dispatchEvent(event);
                }
                list = list.getNext();
            }
            this.collisions.forEach((value) => {
                let isColliding = false;
                list = this.#rigidbody.getContactLinkList();
                for (let i = 0; i < this.#rigidbody.getNumContactLinks(); i++) {
                    objHit = list.getContact().getShape1().userData;
                    objHit2 = list.getContact().getShape2().userData;
                    if (value == objHit || value == objHit2) {
                        isColliding = true;
                    }
                    list = list.getNext();
                }
                if (isColliding == false) {
                    let index = this.collisions.indexOf(value);
                    this.collisions.splice(index);
                    event = new FudgeCore.EventPhysics("ColliderLeftCollision", value, 0, 0, 0);
                    this.dispatchEvent(event);
                }
            });
        }
        raycastThisBody(_origin, _direction, _length, _debugDraw = false) {
            let hitInfo = new FudgeCore.RayHitInfo();
            let geometry = this.#rigidbody.getShapeList().getGeometry();
            let transform = this.#rigidbody.getTransform();
            let scaledDirection = _direction.clone;
            scaledDirection.scale(_length);
            let endpoint = FudgeCore.Vector3.SUM(scaledDirection, _origin.clone);
            let oimoRay = new OIMO.RayCastHit();
            let hit = geometry.rayCast(new OIMO.Vec3(_origin.x, _origin.y, _origin.z), new OIMO.Vec3(endpoint.x, endpoint.y, endpoint.z), transform, oimoRay);
            if (hit) {
                hitInfo.hit = true;
                hitInfo.hitPoint = new FudgeCore.Vector3(oimoRay.position.x, oimoRay.position.y, oimoRay.position.z);
                hitInfo.hitNormal = new FudgeCore.Vector3(oimoRay.normal.x, oimoRay.normal.y, oimoRay.normal.z);
                let dx = _origin.x - hitInfo.hitPoint.x;
                let dy = _origin.y - hitInfo.hitPoint.y;
                let dz = _origin.z - hitInfo.hitPoint.z;
                hitInfo.hitDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                hitInfo.rigidbodyComponent = this;
                hitInfo.rayOrigin = _origin;
                hitInfo.rayEnd = endpoint;
            }
            else {
                hitInfo.rayOrigin = _origin;
                hitInfo.hitPoint = new FudgeCore.Vector3(endpoint.x, endpoint.y, endpoint.z);
            }
            if (_debugDraw) {
                FudgeCore.Physics.world.debugDraw.debugRay(hitInfo.rayOrigin, hitInfo.hitPoint, new FudgeCore.Color(0, 1, 0, 1));
            }
            return hitInfo;
        }
        serialize() {
            let serialization = this.getMutator();
            delete serialization.mtxPivot;
            delete serialization.active;
            serialization.typeBody = FudgeCore.BODY_TYPE[this.#typeBody];
            serialization.typeCollider = FudgeCore.COLLIDER_TYPE[this.#typeCollider];
            serialization.initialization = BODY_INIT[this.initialization];
            serialization.id = this.#id;
            serialization.pivot = this.mtxPivot.serialize();
            serialization[super.constructor.name] = super.serialize();
            return serialization;
        }
        async deserialize(_serialization) {
            super.deserialize(_serialization[super.constructor.name]);
            this.mtxPivot.deserialize(_serialization.pivot);
            this.#id = _serialization.id;
            this.mass = _serialization.mass || this.mass;
            this.dampTranslation = _serialization.dampTranslation || this.dampTranslation;
            this.dampRotation = _serialization.dampRotation || this.dampRotation;
            this.collisionGroup = _serialization.collisionGroup || this.collisionGroup;
            this.effectRotation = _serialization.effectRotation || this.effectRotation;
            this.effectGravity = _serialization.effectGravity || this.effectGravity;
            this.friction = _serialization.friction || this.friction;
            this.restitution = _serialization.restitution || this.restitution;
            this.isTrigger = _serialization.trigger || this.isTrigger;
            this.initialization = _serialization.initialization;
            this.initialization = BODY_INIT[_serialization.initialization];
            this.typeBody = FudgeCore.BODY_TYPE[_serialization.typeBody];
            this.typeCollider = FudgeCore.COLLIDER_TYPE[_serialization.typeCollider];
            return this;
        }
        async mutate(_mutator) {
            super.mutate(_mutator);
            let callIfExist = (_key, _setter) => {
                if (_mutator[_key])
                    _setter(_mutator[_key]);
            };
            callIfExist("friction", (_value) => this.friction = _value);
            callIfExist("restitution", (_value) => this.restitution = _value);
            callIfExist("mass", (_value) => this.mass = _value);
            callIfExist("dampTranslation", (_value) => this.dampTranslation = _value);
            callIfExist("dampRotation", (_value) => this.dampRotation = _value);
            callIfExist("effectGravity", (_value) => this.effectGravity = _value);
            callIfExist("collisionGroup", (_value) => this.collisionGroup = _value);
            callIfExist("typeBody", (_value) => this.typeBody = parseInt(_value));
            callIfExist("typeCollider", (_value) => this.typeCollider = parseInt(_value));
            this.dispatchEvent(new Event("mutate"));
        }
        getMutator() {
            let mutator = super.getMutator(true);
            mutator.friction = this.friction;
            mutator.restitution = this.restitution;
            mutator.mass = this.mass;
            mutator.dampTranslation = this.dampTranslation;
            mutator.dampRotation = this.dampRotation;
            mutator.effectGravity = this.effectGravity;
            mutator.typeBody = this.#typeBody;
            mutator.typeCollider = this.#typeCollider;
            mutator.isTrigger = this.#isTrigger;
            return mutator;
        }
        getMutatorAttributeTypes(_mutator) {
            let types = super.getMutatorAttributeTypes(_mutator);
            if (types.typeBody)
                types.typeBody = FudgeCore.BODY_TYPE;
            if (types.typeCollider)
                types.typeCollider = FudgeCore.COLLIDER_TYPE;
            if (types.initialization)
                types.initialization = BODY_INIT;
            return types;
        }
        reduceMutator(_mutator) {
            super.reduceMutator(_mutator);
            delete _mutator.convexMesh;
            delete _mutator.collisionMask;
            delete _mutator.isInitialized;
        }
        create(_mass = 1, _type = FudgeCore.BODY_TYPE.DYNAMIC, _colliderType = FudgeCore.COLLIDER_TYPE.CUBE, _group = FudgeCore.Physics.settings.defaultCollisionGroup, _mtxTransform = null, _convexMesh = null) {
            this.convexMesh = _convexMesh;
            this.#typeBody = _type;
            this.#collisionGroup = _group;
            this.#typeCollider = _colliderType;
            this.mass = _mass;
            this.#restitution = FudgeCore.Physics.settings.defaultRestitution;
            this.#friction = FudgeCore.Physics.settings.defaultFriction;
            this.collisionMask = FudgeCore.Physics.settings.defaultCollisionMask;
            this.createRigidbody(_mass, _type, this.#typeCollider, _mtxTransform, this.#collisionGroup);
            this.#id = FudgeCore.Physics.world.distributeBodyID();
            this.#callbacks = new OIMO.ContactCallback();
            this.#callbacks.beginTriggerContact = this.triggerEnter;
            this.#callbacks.endTriggerContact = this.triggerExit;
            this.addEventListener("componentAdd", this.addRigidbodyToWorld);
            this.addEventListener("componentRemove", this.removeRigidbodyFromWorld);
        }
        createRigidbody(_mass, _type, _colliderType, _mtxTransform, _collisionGroup = FudgeCore.COLLISION_GROUP.DEFAULT) {
            let oimoType;
            switch (_type) {
                case FudgeCore.BODY_TYPE.DYNAMIC:
                    oimoType = OIMO.RigidBodyType.DYNAMIC;
                    break;
                case FudgeCore.BODY_TYPE.STATIC:
                    oimoType = OIMO.RigidBodyType.STATIC;
                    break;
                case FudgeCore.BODY_TYPE.KINEMATIC:
                    oimoType = OIMO.RigidBodyType.KINEMATIC;
                    break;
                default:
                    oimoType = OIMO.RigidBodyType.DYNAMIC;
                    break;
            }
            let tmpTransform = _mtxTransform == null ? super.node != null ? super.node.mtxWorld : FudgeCore.Matrix4x4.IDENTITY() : _mtxTransform;
            let scale = new OIMO.Vec3((tmpTransform.scaling.x * this.mtxPivot.scaling.x) / 2, (tmpTransform.scaling.y * this.mtxPivot.scaling.y) / 2, (tmpTransform.scaling.z * this.mtxPivot.scaling.z) / 2);
            let position = new OIMO.Vec3(tmpTransform.translation.x + this.mtxPivot.translation.x, tmpTransform.translation.y + this.mtxPivot.translation.y, tmpTransform.translation.z + this.mtxPivot.translation.z);
            let rotation = new OIMO.Vec3(tmpTransform.rotation.x + this.mtxPivot.rotation.x, tmpTransform.rotation.y + this.mtxPivot.rotation.y, tmpTransform.rotation.z + this.mtxPivot.rotation.z);
            this.createCollider(scale, _colliderType);
            this.#massData.mass = _mass;
            this.#rigidbodyInfo.type = oimoType;
            this.#rigidbodyInfo.position = position;
            this.#rigidbodyInfo.rotation.fromEulerXyz(new OIMO.Vec3(rotation.x, rotation.y, rotation.z));
            this.#rigidbody = new OIMO.RigidBody(this.#rigidbodyInfo);
            this.#collider = new OIMO.Shape(this.#colliderInfo);
            this.#collider.userData = this;
            this.#collider.setCollisionGroup(_collisionGroup);
            this.#collider.setCollisionMask(this.collisionMask);
            this.#rigidbody.addShape(this.#collider);
            this.#rigidbody.setMassData(this.#massData);
            this.#rigidbody.getShapeList().setRestitution(this.#restitution);
            this.#rigidbody.getShapeList().setFriction(this.#friction);
            this.#rigidbody.getShapeList().setContactCallback(this.#callbacks);
            this.#rigidbody.setLinearDamping(this.#dampingLinear);
            this.#rigidbody.setAngularDamping(this.#dampingAngular);
            this.#rigidbody.setGravityScale(this.#effectGravity);
            this.#rigidbody.setRotationFactor(new OIMO.Vec3(this.#effectRotation.x, this.#effectRotation.y, this.#effectRotation.z));
        }
        createCollider(_scale, _colliderType) {
            let shapeConf = new OIMO.ShapeConfig();
            let geometry;
            if (this.typeCollider != _colliderType)
                this.typeCollider = _colliderType;
            switch (_colliderType) {
                case FudgeCore.COLLIDER_TYPE.CUBE:
                    geometry = new OIMO.BoxGeometry(_scale);
                    break;
                case FudgeCore.COLLIDER_TYPE.SPHERE:
                    geometry = new OIMO.SphereGeometry(_scale.x);
                    break;
                case FudgeCore.COLLIDER_TYPE.CAPSULE:
                    geometry = new OIMO.CapsuleGeometry(_scale.x, _scale.y);
                    break;
                case FudgeCore.COLLIDER_TYPE.CYLINDER:
                    geometry = new OIMO.CylinderGeometry(_scale.x, _scale.y);
                    break;
                case FudgeCore.COLLIDER_TYPE.CONE:
                    geometry = new OIMO.ConeGeometry(_scale.x, _scale.y);
                    break;
                case FudgeCore.COLLIDER_TYPE.PYRAMID:
                    geometry = this.createConvexGeometryCollider(this.createPyramidVertices(), _scale);
                    break;
                case FudgeCore.COLLIDER_TYPE.CONVEX:
                    geometry = this.createConvexGeometryCollider(this.convexMesh, _scale);
                    break;
            }
            shapeConf.geometry = geometry;
            this.#colliderInfo = shapeConf;
        }
        createConvexGeometryCollider(_vertices, _scale) {
            let verticesAsVec3 = new Array();
            for (let i = 0; i < _vertices.length; i += 3) {
                verticesAsVec3.push(new OIMO.Vec3(_vertices[i] * _scale.x, _vertices[i + 1] * _scale.y, _vertices[i + 2] * _scale.z));
            }
            return new OIMO.ConvexHullGeometry(verticesAsVec3);
        }
        createPyramidVertices() {
            let vertices = new Float32Array([
                -1, 0, 1, 1, 0, 1, 1, 0, -1, -1, 0, -1,
                0, 2, 0
            ]);
            return vertices;
        }
        addRigidbodyToWorld() {
            FudgeCore.Physics.world.addRigidbody(this);
        }
        removeRigidbodyFromWorld() {
            FudgeCore.Physics.world.removeRigidbody(this);
        }
        collisionCenterPoint(_colPoints, _numPoints) {
            let center;
            let totalPoints = 0;
            let totalX = 0;
            let totalY = 0;
            let totalZ = 0;
            _colPoints.forEach((value) => {
                if (totalPoints < _numPoints) {
                    totalPoints++;
                    totalX += value.getPosition2().x;
                    totalY += value.getPosition2().y;
                    totalZ += value.getPosition2().z;
                }
            });
            center = new OIMO.Vec3(totalX / _numPoints, totalY / _numPoints, totalZ / _numPoints);
            return center;
        }
        triggerEnter(contact) {
            let objHit;
            let objHit2;
            let event;
            let colPoint;
            let collisionManifold = contact.getManifold();
            objHit = contact.getShape1().userData;
            if (objHit == null || contact.isTouching() == false)
                return;
            objHit2 = contact.getShape2().userData;
            if (objHit2 == null || contact.isTouching() == false)
                return;
            let points = collisionManifold.getPoints();
            let normal = collisionManifold.getNormal();
            if (objHit2.triggerings.indexOf(objHit) == -1) {
                let colPos = objHit2.collisionCenterPoint(points, collisionManifold.getNumPoints());
                colPoint = new FudgeCore.Vector3(colPos.x, colPos.y, colPos.z);
                objHit2.triggerings.push(objHit);
                event = new FudgeCore.EventPhysics("TriggerEnteredCollision", objHit, 0, 0, 0, colPoint, new FudgeCore.Vector3(normal.x, normal.y, normal.z));
                objHit2.dispatchEvent(event);
            }
            if (objHit.triggerings.indexOf(objHit2) == -1) {
                let colPos = objHit.collisionCenterPoint(points, collisionManifold.getNumPoints());
                colPoint = new FudgeCore.Vector3(colPos.x, colPos.y, colPos.z);
                objHit.triggerings.push(objHit2);
                event = new FudgeCore.EventPhysics("TriggerEnteredCollision", objHit2, 0, 0, 0, colPoint, new FudgeCore.Vector3(normal.x, normal.y, normal.z));
                objHit.dispatchEvent(event);
            }
        }
        triggerExit(contact) {
            let objHit;
            let objHit2;
            let event;
            objHit = contact.getShape1().userData;
            objHit2 = contact.getShape2().userData;
            let index = objHit.triggerings.indexOf(objHit2);
            if (index != -1) {
                objHit.triggerings.splice(index);
                event = new FudgeCore.EventPhysics("TriggerLeftCollision", objHit2, 0, 0, 0);
                objHit.dispatchEvent(event);
            }
            index = objHit2.triggerings.indexOf(objHit);
            if (index != -1) {
                objHit2.triggerings.splice(index);
                event = new FudgeCore.EventPhysics("TriggerLeftCollision", objHit, 0, 0, 0);
                objHit2.dispatchEvent(event);
            }
        }
    }
    FudgeCore.ComponentRigidbody = ComponentRigidbody;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class PhysicsDebugVertexBuffer {
        gl;
        numVertices = 0;
        attribs;
        indices;
        offsets;
        stride;
        buffer;
        dataLength;
        constructor(_renderingContext) {
            this.gl = _renderingContext;
            this.buffer = this.gl.createBuffer();
        }
        setData(array) {
            if (this.attribs == null)
                throw "set attributes first";
            this.numVertices = array.length / (this.stride / 4);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(array), this.gl.DYNAMIC_DRAW);
        }
        setAttribs(attribs) {
            this.attribs = attribs;
            this.offsets = [];
            this.stride = 0;
            let n = attribs.length;
            for (let i = 0; i < n; i++) {
                this.offsets.push(this.stride);
                this.stride += attribs[i].float32Count * Float32Array.BYTES_PER_ELEMENT;
            }
        }
        loadAttribIndices(_program) {
            this.indices = _program.getAttribIndices(this.attribs);
        }
        bindAttribs() {
            if (this.indices == null)
                throw "indices are not loaded";
            let n = this.attribs.length;
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
            for (let i = 0; i < n; i++) {
                this.gl.enableVertexAttribArray(this.indices[i]);
                this.gl.vertexAttribPointer(this.indices[i], this.attribs[i].float32Count, this.gl.FLOAT, false, this.stride, this.offsets[i]);
            }
        }
    }
    FudgeCore.PhysicsDebugVertexBuffer = PhysicsDebugVertexBuffer;
    class PhysicsDebugIndexBuffer {
        gl;
        buffer;
        count;
        constructor(_renderingContext) {
            this.gl = _renderingContext;
            this.buffer = this.gl.createBuffer();
        }
        setData(array) {
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffer);
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Int16Array(array), this.gl.DYNAMIC_DRAW);
            this.count = array.length;
        }
        draw(_mode = this.gl.TRIANGLES, _count = -1) {
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffer);
            this.gl.drawElements(_mode, _count >= 0 ? _count : this.count, this.gl.UNSIGNED_SHORT, 0);
        }
    }
    FudgeCore.PhysicsDebugIndexBuffer = PhysicsDebugIndexBuffer;
    class PhysicsDebugVertexAttribute {
        float32Count;
        name;
        constructor(_float32Count, _name) {
            this.name = _name;
            this.float32Count = _float32Count;
        }
    }
    FudgeCore.PhysicsDebugVertexAttribute = PhysicsDebugVertexAttribute;
    class PhysicsDebugShader {
        gl;
        program;
        vertexShader;
        fragmentShader;
        uniformLocationMap;
        constructor(_renderingContext) {
            this.gl = _renderingContext;
            this.program = this.gl.createProgram();
            this.vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
            this.fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        }
        compile(vertexSource, fragmentSource) {
            this.uniformLocationMap = new Map();
            this.compileShader(this.vertexShader, vertexSource);
            this.compileShader(this.fragmentShader, fragmentSource);
            this.gl.attachShader(this.program, this.vertexShader);
            this.gl.attachShader(this.program, this.fragmentShader);
            this.gl.linkProgram(this.program);
            if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
                FudgeCore.Debug.log(this.gl.getProgramInfoLog(this.program));
            }
            this.gl.validateProgram(this.program);
            if (!this.gl.getProgramParameter(this.program, this.gl.VALIDATE_STATUS)) {
                console.error("ERROR validating program!", this.gl.getProgramInfoLog(this.program));
                return;
            }
        }
        getAttribIndex(_name) {
            return this.gl.getAttribLocation(this.program, _name);
        }
        getUniformLocation(_name) {
            if (this.uniformLocationMap.has(_name))
                return this.uniformLocationMap.get(_name);
            let location = this.gl.getUniformLocation(this.program, _name);
            this.uniformLocationMap.set(_name, location);
            return location;
        }
        getAttribIndices(_attribs) {
            let indices = [];
            _attribs.forEach(value => {
                indices.push(this.getAttribIndex(value.name));
            });
            return indices;
        }
        use() {
            this.gl.useProgram(this.program);
        }
        compileShader(shader, source) {
            this.gl.shaderSource(shader, source);
            this.gl.compileShader(shader);
            if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
                FudgeCore.Debug.log(this.gl.getShaderInfoLog(shader));
            }
        }
    }
    FudgeCore.PhysicsDebugShader = PhysicsDebugShader;
    class PhysicsDebugDraw extends FudgeCore.RenderWebGL {
        oimoDebugDraw;
        style;
        gl;
        program;
        shader;
        pointVBO;
        pointIBO;
        lineVBO;
        lineIBO;
        triVBO;
        triIBO;
        pointData;
        pointIboData;
        numPointData;
        lineData;
        lineIboData;
        numLineData;
        triData;
        triIboData;
        numTriData;
        constructor() {
            super();
            this.style = new OIMO.DebugDrawStyle();
            this.oimoDebugDraw = new OIMO.DebugDraw();
            this.oimoDebugDraw.wireframe = true;
            this.gl = FudgeCore.RenderWebGL.crc3;
            this.initializeOverride();
            this.shader = new PhysicsDebugShader(this.gl);
            this.shader.compile(this.vertexShaderSource(), this.fragmentShaderSource());
            this.initializeBuffers();
        }
        setDebugMode(_mode = FudgeCore.PHYSICS_DEBUGMODE.NONE) {
            let draw = { drawAabbs: false, drawBases: false, drawBvh: false, drawContactBases: false, drawContacts: false, drawJointLimits: false, drawJoints: false, drawPairs: false, drawShapes: false };
            switch (_mode) {
                case FudgeCore.PHYSICS_DEBUGMODE.COLLIDERS:
                    draw.drawBases = draw.drawShapes = true;
                    break;
                case FudgeCore.PHYSICS_DEBUGMODE.JOINTS_AND_COLLIDER:
                    draw.drawJoints = draw.drawJointLimits = draw.drawShapes = true;
                    break;
                case FudgeCore.PHYSICS_DEBUGMODE.PHYSIC_OBJECTS_ONLY:
                    draw.drawBases = draw.drawJointLimits = draw.drawJoints = draw.drawShapes = true;
                    break;
                case FudgeCore.PHYSICS_DEBUGMODE.CONTACTS:
                    draw.drawBases = draw.drawContactBases = draw.drawContacts = draw.drawPairs = draw.drawShapes = true;
                    break;
                case FudgeCore.PHYSICS_DEBUGMODE.BOUNDING_BOXES:
                    draw.drawAabbs = draw.drawBases = draw.drawBvh = true;
                    break;
            }
            Object.assign(this.oimoDebugDraw, draw);
        }
        initializeBuffers() {
            let attribs = [
                new PhysicsDebugVertexAttribute(3, "aPosition"),
                new PhysicsDebugVertexAttribute(3, "aNormal"),
                new PhysicsDebugVertexAttribute(3, "aColor")
            ];
            this.pointVBO = new PhysicsDebugVertexBuffer(this.gl);
            this.pointIBO = new PhysicsDebugIndexBuffer(this.gl);
            this.pointVBO.setAttribs(attribs);
            this.pointVBO.loadAttribIndices(this.shader);
            this.lineVBO = new PhysicsDebugVertexBuffer(this.gl);
            this.lineIBO = new PhysicsDebugIndexBuffer(this.gl);
            this.lineVBO.setAttribs(attribs);
            this.lineVBO.loadAttribIndices(this.shader);
            this.triVBO = new PhysicsDebugVertexBuffer(this.gl);
            this.triIBO = new PhysicsDebugIndexBuffer(this.gl);
            this.triVBO.setAttribs(attribs);
            this.triVBO.loadAttribIndices(this.shader);
            this.clearBuffers();
        }
        clearBuffers() {
            this.gl.lineWidth(2.0);
            this.pointData = [];
            this.lineData = [];
            this.triData = [];
            this.numPointData = 0;
            this.numLineData = 0;
            this.numTriData = 0;
        }
        drawBuffers() {
            this.shader.use();
            let projection = FudgeCore.Physics.world.mainCam.mtxWorldToView.get();
            this.gl.uniformMatrix4fv(this.shader.getUniformLocation("u_projection"), false, projection);
            if (this.numPointData > 0) {
                this.pointIboData = [];
                for (let i = 0; i < this.numPointData; i++) {
                    this.pointIboData.push(i);
                }
                this.pointIBO.setData(this.pointIboData);
                this.pointVBO.setData(this.pointData);
                this.pointVBO.bindAttribs();
                this.pointIBO.draw(this.gl.POINTS, this.numPointData);
                this.numPointData = 0;
            }
            if (this.numLineData > 0) {
                this.lineIboData = [];
                for (let i = 0; i < this.numLineData; i++) {
                    this.lineIboData.push(i * 2);
                    this.lineIboData.push(i * 2 + 1);
                }
                this.lineIBO.setData(this.lineIboData);
                this.lineVBO.setData(this.lineData);
                this.lineVBO.bindAttribs();
                this.lineIBO.draw(this.gl.LINES, this.numLineData * 2);
                this.numLineData = 0;
            }
            if (this.numTriData > 0) {
                this.triIboData = [];
                for (let i = 0; i < this.numTriData; i++) {
                    this.triIboData.push(i * 3);
                    this.triIboData.push(i * 3 + 1);
                    this.triIboData.push(i * 3 + 2);
                }
                this.triIBO.setData(this.triIboData);
                this.triVBO.setData(this.triData);
                this.triVBO.bindAttribs();
                this.triIBO.draw(this.gl.TRIANGLES, this.numTriData * 3);
                this.numTriData = 0;
            }
        }
        debugRay(_origin, _end, _color) {
            this.oimoDebugDraw.line(new OIMO.Vec3(_origin.x, _origin.y, _origin.z), new OIMO.Vec3(_end.x, _end.y, _end.z), new OIMO.Vec3(_color.r, _color.g, _color.b));
            this.oimoDebugDraw.point(new OIMO.Vec3(_end.x, _end.y, _end.z), new OIMO.Vec3(_color.r, _color.g, _color.b));
        }
        initializeOverride() {
            OIMO.DebugDraw.prototype.point = function (_v, _color) {
                let debugWrapper = FudgeCore.Physics.world.debugDraw;
                if (FudgeCore.Physics.world.mainCam != null) {
                    let data = debugWrapper.pointData;
                    data.push(_v.x, _v.y, _v.z);
                    data.push(0, 0, 0);
                    data.push(_color.x, _color.y, _color.z);
                    debugWrapper.numPointData++;
                }
            };
            OIMO.DebugDraw.prototype.line = function (_v1, _v2, _color) {
                let debugWrapper = FudgeCore.Physics.world.debugDraw;
                if (FudgeCore.Physics.world.mainCam != null) {
                    let data = debugWrapper.lineData;
                    data.push(_v1.x, _v1.y, _v1.z);
                    data.push(0, 0, 0);
                    data.push(_color.x, _color.y, _color.z);
                    data.push(_v2.x, _v2.y, _v2.z);
                    data.push(0, 0, 0);
                    data.push(_color.x, _color.y, _color.z);
                    debugWrapper.numLineData++;
                }
            };
            OIMO.DebugDraw.prototype.triangle = function (_v1, _v2, _v3, _n1, _n2, _n3, _color) {
                let debugWrapper = FudgeCore.Physics.world.debugDraw;
                if (FudgeCore.Physics.world.mainCam != null) {
                    let data = debugWrapper.triData;
                    data.push(_v1.x, _v1.y, _v1.z);
                    data.push(_n1.x, _n1.y, _n1.z);
                    data.push(_color.x, _color.y, _color.z);
                    data.push(_v2.x, _v2.y, _v2.z);
                    data.push(_n2.x, _n2.y, _n2.z);
                    data.push(_color.x, _color.y, _color.z);
                    data.push(_v3.x, _v3.y, _v3.z);
                    data.push(_n3.x, _n3.y, _n3.z);
                    data.push(_color.x, _color.y, _color.z);
                    debugWrapper.numTriData++;
                }
            };
        }
        vertexShaderSource() {
            return `
			precision mediump float;
			attribute vec3 aPosition;
			attribute vec3 aColor;
			attribute vec3 aNormal;
			varying vec3 vPosition;
			varying vec3 vNormal;
			varying vec3 vColor;
			uniform mat4 u_projection;

			void main() {
				vPosition = aPosition;
				vColor = aColor;
				vNormal = aNormal;
				gl_Position = u_projection * vec4(aPosition,1.0);
				gl_PointSize = 6.0;
			}`;
        }
        fragmentShaderSource() {
            return `
      precision mediump float;
			varying vec3 vPosition;
			varying vec3 vNormal;
			varying vec3 vColor;

			void main() {
				gl_FragColor = vec4(vColor, 1.0);
			}`;
        }
    }
    FudgeCore.PhysicsDebugDraw = PhysicsDebugDraw;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class EventPhysics extends Event {
        cmpRigidbody;
        normalImpulse;
        tangentImpulse;
        binomalImpulse;
        collisionPoint;
        collisionNormal;
        constructor(_type, _hitRigidbody, _normalImpulse, _tangentImpulse, _binormalImpulse, _collisionPoint = null, _collisionNormal = null) {
            super(_type);
            this.cmpRigidbody = _hitRigidbody;
            this.normalImpulse = _normalImpulse;
            this.tangentImpulse = _tangentImpulse;
            this.binomalImpulse = _binormalImpulse;
            this.collisionPoint = _collisionPoint;
            this.collisionNormal = _collisionNormal;
        }
    }
    FudgeCore.EventPhysics = EventPhysics;
    let COLLISION_GROUP;
    (function (COLLISION_GROUP) {
        COLLISION_GROUP[COLLISION_GROUP["DEFAULT"] = 1] = "DEFAULT";
        COLLISION_GROUP[COLLISION_GROUP["GROUP_1"] = 2] = "GROUP_1";
        COLLISION_GROUP[COLLISION_GROUP["GROUP_2"] = 4] = "GROUP_2";
        COLLISION_GROUP[COLLISION_GROUP["GROUP_3"] = 8] = "GROUP_3";
        COLLISION_GROUP[COLLISION_GROUP["GROUP_4"] = 16] = "GROUP_4";
        COLLISION_GROUP[COLLISION_GROUP["GROUP_5"] = 32] = "GROUP_5";
    })(COLLISION_GROUP = FudgeCore.COLLISION_GROUP || (FudgeCore.COLLISION_GROUP = {}));
    let BODY_TYPE;
    (function (BODY_TYPE) {
        BODY_TYPE[BODY_TYPE["DYNAMIC"] = 0] = "DYNAMIC";
        BODY_TYPE[BODY_TYPE["STATIC"] = 1] = "STATIC";
        BODY_TYPE[BODY_TYPE["KINEMATIC"] = 2] = "KINEMATIC";
    })(BODY_TYPE = FudgeCore.BODY_TYPE || (FudgeCore.BODY_TYPE = {}));
    let COLLIDER_TYPE;
    (function (COLLIDER_TYPE) {
        COLLIDER_TYPE[COLLIDER_TYPE["CUBE"] = 0] = "CUBE";
        COLLIDER_TYPE[COLLIDER_TYPE["SPHERE"] = 1] = "SPHERE";
        COLLIDER_TYPE[COLLIDER_TYPE["CAPSULE"] = 2] = "CAPSULE";
        COLLIDER_TYPE[COLLIDER_TYPE["CYLINDER"] = 3] = "CYLINDER";
        COLLIDER_TYPE[COLLIDER_TYPE["CONE"] = 4] = "CONE";
        COLLIDER_TYPE[COLLIDER_TYPE["PYRAMID"] = 5] = "PYRAMID";
        COLLIDER_TYPE[COLLIDER_TYPE["CONVEX"] = 6] = "CONVEX";
    })(COLLIDER_TYPE = FudgeCore.COLLIDER_TYPE || (FudgeCore.COLLIDER_TYPE = {}));
    let PHYSICS_DEBUGMODE;
    (function (PHYSICS_DEBUGMODE) {
        PHYSICS_DEBUGMODE[PHYSICS_DEBUGMODE["NONE"] = 0] = "NONE";
        PHYSICS_DEBUGMODE[PHYSICS_DEBUGMODE["COLLIDERS"] = 1] = "COLLIDERS";
        PHYSICS_DEBUGMODE[PHYSICS_DEBUGMODE["JOINTS_AND_COLLIDER"] = 2] = "JOINTS_AND_COLLIDER";
        PHYSICS_DEBUGMODE[PHYSICS_DEBUGMODE["BOUNDING_BOXES"] = 3] = "BOUNDING_BOXES";
        PHYSICS_DEBUGMODE[PHYSICS_DEBUGMODE["CONTACTS"] = 4] = "CONTACTS";
        PHYSICS_DEBUGMODE[PHYSICS_DEBUGMODE["PHYSIC_OBJECTS_ONLY"] = 5] = "PHYSIC_OBJECTS_ONLY";
    })(PHYSICS_DEBUGMODE = FudgeCore.PHYSICS_DEBUGMODE || (FudgeCore.PHYSICS_DEBUGMODE = {}));
    class RayHitInfo {
        hit;
        hitDistance;
        hitPoint;
        rigidbodyComponent;
        hitNormal;
        rayOrigin;
        rayEnd;
        constructor() {
            this.recycle();
        }
        recycle() {
            this.hit = false;
            this.hitDistance = 0;
            this.hitPoint = FudgeCore.Vector3.ZERO();
            this.rigidbodyComponent = null;
            this.hitNormal = FudgeCore.Vector3.ZERO();
            this.rayOrigin = FudgeCore.Vector3.ZERO();
            this.rayEnd = FudgeCore.Vector3.ZERO();
        }
    }
    FudgeCore.RayHitInfo = RayHitInfo;
    class PhysicsSettings {
        constructor(_defGroup, _defMask) {
            this.defaultCollisionGroup = _defGroup;
            this.defaultCollisionMask = _defMask;
        }
        get disableSleeping() {
            return OIMO.Setting.disableSleeping;
        }
        set disableSleeping(_value) {
            OIMO.Setting.disableSleeping = _value;
        }
        get sleepingVelocityThreshold() {
            return OIMO.Setting.sleepingVelocityThreshold;
        }
        set sleepingVelocityThreshold(_value) {
            OIMO.Setting.sleepingVelocityThreshold = _value;
        }
        get sleepingAngularVelocityThreshold() {
            return OIMO.Setting.sleepingAngularVelocityThreshold;
        }
        set sleepingAngularVelocityThreshold(_value) {
            OIMO.Setting.sleepingAngularVelocityThreshold = _value;
        }
        get sleepingTimeThreshold() {
            return OIMO.Setting.sleepingTimeThreshold;
        }
        set sleepingTimeThreshold(_value) {
            OIMO.Setting.sleepingTimeThreshold = _value;
        }
        get defaultCollisionMargin() {
            return OIMO.Setting.defaultGJKMargin;
        }
        set defaultCollisionMargin(_thickness) {
            OIMO.Setting.defaultGJKMargin = _thickness;
        }
        get defaultFriction() {
            return OIMO.Setting.defaultFriction;
        }
        set defaultFriction(_value) {
            OIMO.Setting.defaultFriction = _value;
        }
        get defaultRestitution() {
            return OIMO.Setting.defaultRestitution;
        }
        set defaultRestitution(_value) {
            OIMO.Setting.defaultRestitution = _value;
        }
        get defaultCollisionMask() {
            return OIMO.Setting.defaultCollisionMask;
        }
        set defaultCollisionMask(_value) {
            OIMO.Setting.defaultCollisionMask = _value;
        }
        get defaultCollisionGroup() {
            return OIMO.Setting.defaultCollisionGroup;
        }
        set defaultCollisionGroup(_value) {
            OIMO.Setting.defaultCollisionGroup = _value;
        }
        get defaultConstraintSolverType() {
            return OIMO.Setting.defaultJointConstraintSolverType;
        }
        set defaultConstraintSolverType(_value) {
            OIMO.Setting.defaultJointConstraintSolverType = _value;
        }
        get defaultCorrectionAlgorithm() {
            return OIMO.Setting.defaultJointPositionCorrectionAlgorithm;
        }
        set defaultCorrectionAlgorithm(_value) {
            OIMO.Setting.defaultJointPositionCorrectionAlgorithm = _value;
        }
    }
    FudgeCore.PhysicsSettings = PhysicsSettings;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class JointCylindrical extends FudgeCore.JointAxial {
        static iSubclass = FudgeCore.Joint.registerSubclass(JointCylindrical);
        #springDampingRotation = 0;
        #springFrequencyRotation = 0;
        #motorForce = 0;
        #maxRotor = 360;
        #minRotor = 0;
        #rotorTorque = 0;
        #rotorSpeed = 0;
        #rotor;
        #rotorSpringDamper;
        joint;
        config = new OIMO.CylindricalJointConfig();
        motor;
        constructor(_bodyAnchor = null, _bodyTied = null, _axis = new FudgeCore.Vector3(0, 1, 0), _localAnchor = new FudgeCore.Vector3(0, 0, 0)) {
            super(_bodyAnchor, _bodyTied, _axis, _localAnchor);
        }
        set springDamping(_value) {
            super.springDamping = _value;
            if (this.joint != null)
                this.joint.getTranslationalSpringDamper().dampingRatio = _value;
        }
        set springFrequency(_value) {
            super.springFrequency = _value;
            if (this.joint != null)
                this.joint.getTranslationalSpringDamper().frequency = _value;
        }
        get springDampingRotation() {
            return this.#springDampingRotation;
        }
        set springDampingRotation(_value) {
            this.#springDampingRotation = _value;
            if (this.joint != null)
                this.joint.getRotationalSpringDamper().dampingRatio = _value;
        }
        get springFrequencyRotation() {
            return this.#springFrequencyRotation;
        }
        set springFrequencyRotation(_value) {
            this.#springFrequencyRotation = _value;
            if (this.joint != null)
                this.joint.getRotationalSpringDamper().frequency = _value;
        }
        get maxRotor() {
            return this.#maxRotor;
        }
        set maxRotor(_value) {
            this.#maxRotor = _value;
            if (this.joint != null)
                this.joint.getRotationalLimitMotor().upperLimit = _value * Math.PI / 180;
        }
        get minRotor() {
            return this.#minRotor;
        }
        set minRotor(_value) {
            this.#minRotor = _value;
            if (this.joint != null)
                this.joint.getRotationalLimitMotor().lowerLimit = _value * Math.PI / 180;
        }
        get rotorSpeed() {
            return this.#rotorSpeed;
        }
        set rotorSpeed(_value) {
            this.#rotorSpeed = _value;
            if (this.joint != null)
                this.joint.getRotationalLimitMotor().motorSpeed = _value;
        }
        get rotorTorque() {
            return this.#rotorTorque;
        }
        set rotorTorque(_value) {
            this.#rotorTorque = _value;
            if (this.joint != null)
                this.joint.getRotationalLimitMotor().motorTorque = _value;
        }
        set maxMotor(_value) {
            super.maxMotor = _value;
            if (this.joint != null)
                this.joint.getTranslationalLimitMotor().upperLimit = _value;
        }
        set minMotor(_value) {
            super.minMotor = _value;
            if (this.joint != null)
                this.joint.getTranslationalLimitMotor().lowerLimit = _value;
        }
        set motorSpeed(_value) {
            super.motorSpeed = _value;
            if (this.joint != null)
                this.joint.getTranslationalLimitMotor().motorSpeed = _value;
        }
        get motorForce() {
            return this.#motorForce;
        }
        set motorForce(_value) {
            this.#motorForce = _value;
            if (this.joint != null)
                this.joint.getTranslationalLimitMotor().motorForce = _value;
        }
        serialize() {
            let serialization = this.#getMutator();
            serialization[super.constructor.name] = super.serialize();
            return serialization;
        }
        async deserialize(_serialization) {
            this.#mutate(_serialization);
            super.deserialize(_serialization[super.constructor.name]);
            return this;
        }
        async mutate(_mutator) {
            this.#mutate(_mutator);
            this.deleteFromMutator(_mutator, this.#getMutator());
            super.mutate(_mutator);
        }
        getMutator() {
            let mutator = super.getMutator();
            Object.assign(mutator, this.#getMutator());
            return mutator;
        }
        #getMutator = () => {
            let mutator = {
                motorForce: this.motorForce,
                springDampingRotation: this.springDampingRotation,
                springFrequencyRotation: this.springFrequencyRotation,
                maxRotor: this.maxRotor,
                minRotor: this.minRotor,
                rotorTorque: this.rotorTorque,
                rotorSpeed: this.rotorSpeed
            };
            return mutator;
        };
        #mutate = (_mutator) => {
            this.motorForce = _mutator.motorForce;
            this.rotorTorque = _mutator.rotorTorque;
            this.rotorSpeed = _mutator.rotorSpeed;
            this.maxRotor = _mutator.maxRotor;
            this.minRotor = _mutator.minRotor;
            this.springDampingRotation = _mutator.springDampingRotation;
            this.springFrequencyRotation = _mutator.springFrequencyRotation;
            this.springFrequency = _mutator.springFrequency;
        };
        constructJoint() {
            this.#rotorSpringDamper = new OIMO.SpringDamper().setSpring(this.springFrequencyRotation, this.springDampingRotation);
            this.motor = new OIMO.TranslationalLimitMotor().setLimits(super.minMotor, super.maxMotor);
            this.motor.setMotor(super.motorSpeed, this.motorForce);
            this.#rotor = new OIMO.RotationalLimitMotor().setLimits(this.minRotor * Math.PI / 180, this.maxRotor * Math.PI / 180);
            this.#rotor.setMotor(this.rotorSpeed, this.rotorTorque);
            this.config = new OIMO.CylindricalJointConfig();
            super.constructJoint();
            this.config.translationalSpringDamper = this.springDamper;
            this.config.translationalLimitMotor = this.motor;
            this.config.rotationalLimitMotor = this.#rotor;
            this.config.rotationalSpringDamper = this.#rotorSpringDamper;
            this.joint = new OIMO.CylindricalJoint(this.config);
            this.configureJoint();
        }
    }
    FudgeCore.JointCylindrical = JointCylindrical;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class JointPrismatic extends FudgeCore.JointAxial {
        static iSubclass = FudgeCore.Joint.registerSubclass(JointPrismatic);
        #motorForce = 0;
        joint;
        config = new OIMO.PrismaticJointConfig();
        motor;
        constructor(_bodyAnchor = null, _bodyTied = null, _axis = new FudgeCore.Vector3(0, 1, 0), _localAnchor = new FudgeCore.Vector3(0, 0, 0)) {
            super(_bodyAnchor, _bodyTied, _axis, _localAnchor);
            this.maxMotor = 10;
            this.minMotor = -10;
        }
        get motorForce() {
            return this.#motorForce;
        }
        set motorForce(_value) {
            this.#motorForce = _value;
            if (this.joint != null)
                this.joint.getLimitMotor().motorForce = _value;
        }
        serialize() {
            let serialization = {
                motorForce: this.motorForce,
                [super.constructor.name]: super.serialize()
            };
            return serialization;
        }
        async deserialize(_serialization) {
            this.motorForce = _serialization.motorForce;
            super.deserialize(_serialization[super.constructor.name]);
            return this;
        }
        getMutator() {
            let mutator = super.getMutator();
            mutator.motorForce = this.motorForce;
            return mutator;
        }
        async mutate(_mutator) {
            this.motorForce = _mutator.motorForce;
            delete _mutator.motorForce;
            super.mutate(_mutator);
        }
        constructJoint() {
            this.motor = new OIMO.TranslationalLimitMotor().setLimits(this.minMotor, this.maxMotor);
            this.motor.setMotor(this.motorSpeed, this.motorForce);
            this.config = new OIMO.PrismaticJointConfig();
            super.constructJoint();
            this.config.springDamper = this.springDamper;
            this.config.limitMotor = this.motor;
            this.joint = new OIMO.PrismaticJoint(this.config);
            this.configureJoint();
        }
    }
    FudgeCore.JointPrismatic = JointPrismatic;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class JointRagdoll extends FudgeCore.Joint {
        static iSubclass = FudgeCore.Joint.registerSubclass(JointRagdoll);
        #springDampingTwist = 0;
        #springFrequencyTwist = 0;
        #springDampingSwing = 0;
        #springFrequencySwing = 0;
        #maxMotorTwist = 360;
        #minMotorTwist = 0;
        #motorTorqueTwist = 0;
        #motorSpeedTwist = 0;
        #motorTwist;
        #springDamperTwist;
        #springDamperSwing;
        #axisFirst;
        #axisSecond;
        #maxAngleFirst = 0;
        #maxAngleSecond = 0;
        joint;
        config = new OIMO.RagdollJointConfig();
        constructor(_bodyAnchor = null, _bodyTied = null, _axisFirst = new FudgeCore.Vector3(1, 0, 0), _axisSecond = new FudgeCore.Vector3(0, 0, 1), _localAnchor = new FudgeCore.Vector3(0, 0, 0)) {
            super(_bodyAnchor, _bodyTied);
            this.axisFirst = _axisFirst;
            this.axisSecond = _axisSecond;
            this.anchor = _localAnchor;
        }
        get axisFirst() {
            return new FudgeCore.Vector3(this.#axisFirst.x, this.#axisFirst.y, this.#axisFirst.z);
        }
        set axisFirst(_value) {
            this.#axisFirst = new OIMO.Vec3(_value.x, _value.y, _value.z);
            this.disconnect();
            this.dirtyStatus();
        }
        get axisSecond() {
            return new FudgeCore.Vector3(this.#axisSecond.x, this.#axisSecond.y, this.#axisSecond.z);
        }
        set axisSecond(_value) {
            this.#axisSecond = new OIMO.Vec3(_value.x, _value.y, _value.z);
            this.disconnect();
            this.dirtyStatus();
        }
        get maxAngleFirstAxis() {
            return this.#maxAngleFirst * 180 / Math.PI;
        }
        set maxAngleFirstAxis(_value) {
            this.#maxAngleFirst = _value * Math.PI / 180;
            this.disconnect();
            this.dirtyStatus();
        }
        get maxAngleSecondAxis() {
            return this.#maxAngleSecond * 180 / Math.PI;
        }
        set maxAngleSecondAxis(_value) {
            this.#maxAngleSecond = _value * Math.PI / 180;
            this.disconnect();
            this.dirtyStatus();
        }
        get springDampingTwist() {
            return this.#springDampingTwist;
        }
        set springDampingTwist(_value) {
            this.#springDampingTwist = _value;
            if (this.joint != null)
                this.joint.getTwistSpringDamper().dampingRatio = _value;
        }
        get springFrequencyTwist() {
            return this.#springFrequencyTwist;
        }
        set springFrequencyTwist(_value) {
            this.#springFrequencyTwist = _value;
            if (this.joint != null)
                this.joint.getTwistSpringDamper().frequency = _value;
        }
        get springDampingSwing() {
            return this.#springDampingSwing;
        }
        set springDampingSwing(_value) {
            this.#springDampingSwing = _value;
            if (this.joint != null)
                this.joint.getSwingSpringDamper().dampingRatio = _value;
        }
        get springFrequencySwing() {
            return this.#springFrequencySwing;
        }
        set springFrequencySwing(_value) {
            this.#springFrequencySwing = _value;
            if (this.joint != null)
                this.joint.getSwingSpringDamper().frequency = _value;
        }
        get maxMotorTwist() {
            return this.#maxMotorTwist * 180 / Math.PI;
        }
        set maxMotorTwist(_value) {
            _value *= Math.PI / 180;
            this.#maxMotorTwist = _value;
            if (this.joint != null)
                this.joint.getTwistLimitMotor().upperLimit = _value;
        }
        get minMotorTwist() {
            return this.#minMotorTwist * 180 / Math.PI;
        }
        set minMotorTwist(_value) {
            _value *= Math.PI / 180;
            this.#minMotorTwist = _value;
            if (this.joint != null)
                this.joint.getTwistLimitMotor().lowerLimit = _value;
        }
        get motorSpeedTwist() {
            return this.#motorSpeedTwist;
        }
        set motorSpeedTwist(_value) {
            this.#motorSpeedTwist = _value;
            if (this.joint != null)
                this.joint.getTwistLimitMotor().motorSpeed = _value;
        }
        get motorTorqueTwist() {
            return this.#motorTorqueTwist;
        }
        set motorTorqueTwist(_value) {
            this.#motorTorqueTwist = _value;
            if (this.joint != null)
                this.joint.getTwistLimitMotor().motorTorque = _value;
        }
        serialize() {
            let serialization = this.#getMutator();
            serialization.axisFirst = this.axisFirst.serialize();
            serialization.axisSecond = this.axisSecond.serialize();
            serialization[super.constructor.name] = super.serialize();
            return serialization;
        }
        async deserialize(_serialization) {
            await this.axisFirst.deserialize(_serialization.axisFirst);
            await this.axisSecond.deserialize(_serialization.axisSecond);
            this.#mutate(_serialization);
            super.deserialize(_serialization[super.constructor.name]);
            return this;
        }
        async mutate(_mutator) {
            this.axisFirst = new FudgeCore.Vector3(...(Object.values(_mutator.axisFirst)));
            this.axisSecond = new FudgeCore.Vector3(...(Object.values(_mutator.axisSecond)));
            delete _mutator.axisFirst;
            delete _mutator.axisSecond;
            this.#mutate(_mutator);
            this.deleteFromMutator(_mutator, this.#getMutator());
            super.mutate(_mutator);
        }
        getMutator() {
            let mutator = super.getMutator();
            Object.assign(mutator, this.#getMutator());
            mutator.axisFirst = this.axisFirst.getMutator();
            mutator.axisSecond = this.axisSecond.getMutator();
            return mutator;
        }
        #getMutator = () => {
            let mutator = {
                maxAngleFirst: this.#maxAngleFirst,
                maxAngleSecond: this.#maxAngleSecond,
                springDampingTwist: this.springDampingTwist,
                springFrequencyTwist: this.springFrequencyTwist,
                springDampingSwing: this.springDampingSwing,
                springFrequencySwing: this.springFrequencySwing,
                maxMotorTwist: this.#maxMotorTwist,
                minMotorTwist: this.#minMotorTwist,
                motorSpeedTwist: this.motorSpeedTwist,
                motorTorqueTwist: this.motorTorqueTwist
            };
            return mutator;
        };
        #mutate = (_mutator) => {
            this.#maxAngleFirst = _mutator.maxAngleFirst;
            this.#maxAngleSecond = _mutator.maxAngleSecond;
            this.springDampingTwist = _mutator.springDampingTwist;
            this.springFrequencyTwist = _mutator.springFrequencyTwist;
            this.springDampingSwing = _mutator.springDampingSwing;
            this.springFrequencySwing = _mutator.springFrequencySwing;
            this.maxMotorTwist = _mutator.maxMotorTwist;
            this.minMotorTwist = _mutator.minMotorTwist;
            this.motorSpeedTwist = _mutator.motorSpeedTwist;
            this.motorTorqueTwist = _mutator.motorTorqueTwist;
        };
        constructJoint() {
            this.#springDamperTwist = new OIMO.SpringDamper().setSpring(this.springFrequencyTwist, this.springDampingTwist);
            this.#springDamperSwing = new OIMO.SpringDamper().setSpring(this.springFrequencySwing, this.springDampingSwing);
            this.#motorTwist = new OIMO.RotationalLimitMotor().setLimits(this.minMotorTwist, this.maxMotorTwist);
            this.#motorTwist.setMotor(this.motorSpeedTwist, this.motorTorqueTwist);
            this.config = new OIMO.RagdollJointConfig();
            super.constructJoint(this.axisFirst, this.axisSecond);
            this.config.swingSpringDamper = this.#springDamperSwing;
            this.config.twistSpringDamper = this.#springDamperTwist;
            this.config.twistLimitMotor = this.#motorTwist;
            this.config.maxSwingAngle1 = this.#maxAngleFirst;
            this.config.maxSwingAngle2 = this.#maxAngleSecond;
            this.joint = new OIMO.RagdollJoint(this.config);
            super.configureJoint();
        }
    }
    FudgeCore.JointRagdoll = JointRagdoll;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class JointRevolute extends FudgeCore.JointAxial {
        static iSubclass = FudgeCore.Joint.registerSubclass(JointRevolute);
        #motorTorque = 0;
        #rotor;
        joint;
        config = new OIMO.RevoluteJointConfig();
        constructor(_bodyAnchor = null, _bodyTied = null, _axis = new FudgeCore.Vector3(0, 1, 0), _localAnchor = new FudgeCore.Vector3(0, 0, 0)) {
            super(_bodyAnchor, _bodyTied, _axis, _localAnchor);
            this.maxMotor = 360;
            this.minMotor = 0;
        }
        set maxMotor(_value) {
            super.maxMotor = _value;
            _value *= Math.PI / 180;
            if (this.joint)
                this.joint.getLimitMotor().upperLimit = _value;
        }
        set minMotor(_value) {
            super.minMotor = _value;
            if (this.joint)
                this.joint.getLimitMotor().lowerLimit = _value * Math.PI / 180;
        }
        get motorTorque() {
            return this.#motorTorque;
        }
        set motorTorque(_value) {
            this.#motorTorque = _value;
            if (this.joint != null)
                this.joint.getLimitMotor().motorTorque = _value;
        }
        serialize() {
            let serialization = {
                motorTorque: this.motorTorque,
                [super.constructor.name]: super.serialize()
            };
            return serialization;
        }
        async deserialize(_serialization) {
            this.motorTorque = _serialization.motorTorque;
            super.deserialize(_serialization[super.constructor.name]);
            return this;
        }
        getMutator() {
            let mutator = super.getMutator();
            mutator.motorTorque = this.motorTorque;
            return mutator;
        }
        async mutate(_mutator) {
            this.motorTorque = _mutator.motorTorque;
            delete _mutator.motorTorque;
            super.mutate(_mutator);
        }
        constructJoint() {
            this.#rotor = new OIMO.RotationalLimitMotor().setLimits(super.minMotor * Math.PI / 180, super.maxMotor * Math.PI / 180);
            this.#rotor.setMotor(this.motorSpeed, this.motorTorque);
            this.config = new OIMO.RevoluteJointConfig();
            super.constructJoint();
            this.config.springDamper = this.springDamper;
            this.config.limitMotor = this.#rotor;
            this.joint = new OIMO.RevoluteJoint(this.config);
            this.configureJoint();
        }
    }
    FudgeCore.JointRevolute = JointRevolute;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class JointSpherical extends FudgeCore.Joint {
        static iSubclass = FudgeCore.Joint.registerSubclass(JointSpherical);
        #springDamping = 0;
        #springFrequency = 0;
        #springDamper;
        joint;
        config = new OIMO.SphericalJointConfig();
        constructor(_bodyAnchor = null, _bodyTied = null, _localAnchor = new FudgeCore.Vector3(0, 0, 0)) {
            super(_bodyAnchor, _bodyTied);
            this.anchor = new FudgeCore.Vector3(_localAnchor.x, _localAnchor.y, _localAnchor.z);
        }
        get springDamping() {
            return this.#springDamping;
        }
        set springDamping(_value) {
            this.#springDamping = _value;
            if (this.joint != null)
                this.joint.getSpringDamper().dampingRatio = _value;
        }
        get springFrequency() {
            return this.#springFrequency;
        }
        set springFrequency(_value) {
            this.#springFrequency = _value;
            if (this.joint != null)
                this.joint.getSpringDamper().frequency = _value;
        }
        serialize() {
            let serialization = {
                springDamping: this.springDamping,
                springFrequency: this.springFrequency,
                [super.constructor.name]: super.serialize()
            };
            return serialization;
        }
        async deserialize(_serialization) {
            this.springDamping = _serialization.springDamping;
            this.springFrequency = _serialization.springFrequency;
            super.deserialize(_serialization[super.constructor.name]);
            return this;
        }
        getMutator() {
            let mutator = super.getMutator();
            mutator.springDamping = this.springDamping;
            mutator.springFrequency = this.springFrequency;
            return mutator;
        }
        async mutate(_mutator) {
            this.springDamping = _mutator.springDamping;
            this.springFrequency = _mutator.springFrequency;
            delete _mutator.springDamping;
            delete _mutator.springFrequency;
            super.mutate(_mutator);
        }
        constructJoint() {
            this.#springDamper = new OIMO.SpringDamper().setSpring(this.springFrequency, this.springDamping);
            this.config = new OIMO.SphericalJointConfig();
            super.constructJoint();
            this.config.springDamper = this.#springDamper;
            this.joint = new OIMO.SphericalJoint(this.config);
            super.configureJoint();
        }
    }
    FudgeCore.JointSpherical = JointSpherical;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class JointUniversal extends FudgeCore.Joint {
        static iSubclass = FudgeCore.Joint.registerSubclass(JointUniversal);
        #springDampingFirst = 0;
        #springFrequencyFirst = 0;
        #springDampingSecond = 0;
        #springFrequencySecond = 0;
        #maxRotorFirst = 360;
        #minRotorFirst = 0;
        #rotorTorqueFirst = 0;
        #rotorSpeedFirst = 0;
        #maxRotorSecond = 360;
        #minRotorSecond = 0;
        #rotorTorqueSecond = 0;
        #rotorSpeedSecond = 0;
        #motorFirst;
        #motorSecond;
        #axisSpringDamperFirst;
        #axisSpringDamperSecond;
        #axisFirst;
        #axisSecond;
        joint;
        config = new OIMO.UniversalJointConfig();
        constructor(_bodyAnchor = null, _bodyTied = null, _axisFirst = new FudgeCore.Vector3(1, 0, 0), _axisSecond = new FudgeCore.Vector3(0, 0, 1), _localAnchor = new FudgeCore.Vector3(0, 0, 0)) {
            super(_bodyAnchor, _bodyTied);
            this.axisFirst = _axisFirst;
            this.axisSecond = _axisSecond;
            this.anchor = _localAnchor;
        }
        get axisFirst() {
            return new FudgeCore.Vector3(this.#axisFirst.x, this.#axisFirst.y, this.#axisFirst.z);
        }
        set axisFirst(_value) {
            this.#axisFirst = new OIMO.Vec3(_value.x, _value.y, _value.z);
            this.disconnect();
            this.dirtyStatus();
        }
        get axisSecond() {
            return new FudgeCore.Vector3(this.#axisSecond.x, this.#axisSecond.y, this.#axisSecond.z);
        }
        set axisSecond(_value) {
            this.#axisSecond = new OIMO.Vec3(_value.x, _value.y, _value.z);
            this.disconnect();
            this.dirtyStatus();
        }
        get springDampingFirst() {
            return this.#springDampingFirst;
        }
        set springDampingFirst(_value) {
            this.#springDampingFirst = _value;
            if (this.joint != null)
                this.joint.getSpringDamper1().dampingRatio = _value;
        }
        get springFrequencyFirst() {
            return this.#springFrequencyFirst;
        }
        set springFrequencyFirst(_value) {
            this.#springFrequencyFirst = _value;
            if (this.joint != null)
                this.joint.getSpringDamper1().frequency = _value;
        }
        get springDampingSecond() {
            return this.#springDampingSecond;
        }
        set springDampingSecond(_value) {
            this.#springDampingSecond = _value;
            if (this.joint != null)
                this.joint.getSpringDamper2().dampingRatio = _value;
        }
        get springFrequencySecond() {
            return this.#springFrequencySecond;
        }
        set springFrequencySecond(_value) {
            this.#springFrequencySecond = _value;
            if (this.joint != null)
                this.joint.getSpringDamper2().frequency = _value;
        }
        get maxRotorFirst() {
            return this.#maxRotorFirst;
        }
        set maxRotorFirst(_value) {
            this.#maxRotorFirst = _value;
            if (this.joint != null)
                this.joint.getLimitMotor1().upperLimit = _value * Math.PI / 180;
        }
        get minRotorFirst() {
            return this.#minRotorFirst;
        }
        set minRotorFirst(_value) {
            this.#minRotorFirst = _value;
            if (this.joint != null)
                this.joint.getLimitMotor1().lowerLimit = _value * Math.PI / 180;
        }
        get rotorSpeedFirst() {
            return this.#rotorSpeedFirst;
        }
        set rotorSpeedFirst(_value) {
            this.#rotorSpeedFirst = _value;
            if (this.joint != null)
                this.joint.getLimitMotor1().motorSpeed = _value;
        }
        get rotorTorqueFirst() {
            return this.#rotorTorqueFirst;
        }
        set rotorTorqueFirst(_value) {
            this.#rotorTorqueFirst = _value;
            if (this.joint != null)
                this.joint.getLimitMotor1().motorTorque = _value;
        }
        get maxRotorSecond() {
            return this.#maxRotorSecond;
        }
        set maxRotorSecond(_value) {
            this.#maxRotorSecond = _value;
            if (this.joint != null)
                this.joint.getLimitMotor2().upperLimit = _value * Math.PI / 180;
        }
        get minRotorSecond() {
            return this.#minRotorSecond;
        }
        set minRotorSecond(_value) {
            this.#minRotorSecond = _value;
            if (this.joint != null)
                this.joint.getLimitMotor2().lowerLimit = _value * Math.PI / 180;
        }
        get rotorSpeedSecond() {
            return this.#rotorSpeedSecond;
        }
        set rotorSpeedSecond(_value) {
            this.#rotorSpeedSecond = _value;
            if (this.joint != null)
                this.joint.getLimitMotor2().motorSpeed = _value;
        }
        get rotorTorqueSecond() {
            return this.#rotorTorqueSecond;
        }
        set rotorTorqueSecond(_value) {
            this.#rotorTorqueSecond = _value;
            if (this.joint != null)
                this.joint.getLimitMotor2().motorTorque = _value;
        }
        serialize() {
            let serialization = this.#getMutator();
            serialization.firstAxis = this.axisFirst.serialize();
            serialization.secondAxis = this.axisSecond.serialize();
            serialization[super.constructor.name] = super.serialize();
            return serialization;
        }
        async deserialize(_serialization) {
            this.axisFirst = await new FudgeCore.Vector3().deserialize(_serialization.axisFirst);
            this.axisSecond = await new FudgeCore.Vector3().deserialize(_serialization.axisSecond);
            this.#mutate(_serialization);
            super.deserialize(_serialization[super.constructor.name]);
            return this;
        }
        async mutate(_mutator) {
            this.axisFirst = new FudgeCore.Vector3(...(Object.values(_mutator.axisFirst)));
            this.axisSecond = new FudgeCore.Vector3(...(Object.values(_mutator.axisSecond)));
            delete _mutator.axisFirst;
            delete _mutator.axisSecond;
            this.#mutate(_mutator);
            this.deleteFromMutator(_mutator, this.#getMutator());
            super.mutate(_mutator);
        }
        getMutator() {
            let mutator = super.getMutator();
            Object.assign(mutator, this.#getMutator());
            mutator.axisFirst = this.axisFirst.getMutator();
            mutator.axisSecond = this.axisSecond.getMutator();
            return mutator;
        }
        #getMutator = () => {
            let mutator = {
                springDampingFirst: this.#springDampingFirst,
                springFrequencyFirst: this.#springFrequencyFirst,
                springDampingSecond: this.#springDampingSecond,
                springFrequencySecond: this.#springFrequencySecond,
                maxRotorFirst: this.#maxRotorFirst,
                minRotorFirst: this.#minRotorFirst,
                rotorSpeedFirst: this.#rotorSpeedFirst,
                rotorTorqueFirst: this.#rotorTorqueFirst,
                maxRotorSecond: this.#maxRotorSecond,
                minRotorSecond: this.#minRotorSecond,
                rotorSpeedSecond: this.#rotorSpeedSecond,
                rotorTorqueSecond: this.#rotorTorqueSecond
            };
            return mutator;
        };
        #mutate = (_mutator) => {
            this.springDampingFirst = _mutator.springDampingFirst;
            this.springFrequencyFirst = _mutator.springFrequencyFirst;
            this.springDampingSecond = _mutator.springDampingSecond;
            this.springFrequencySecond = _mutator.springFrequencySecond;
            this.maxRotorFirst = _mutator.maxRotorFirst;
            this.minRotorFirst = _mutator.minRotorFirst;
            this.rotorSpeedFirst = _mutator.rotorSpeedFirst;
            this.rotorTorqueFirst = _mutator.rotorTorqueFirst;
            this.maxRotorSecond = _mutator.maxRotorSecond;
            this.minRotorSecond = _mutator.minRotorSecond;
            this.rotorSpeedSecond = _mutator.rotorSpeedSecond;
            this.rotorTorqueSecond = _mutator.rotorTorqueSecond;
        };
        constructJoint() {
            this.#axisSpringDamperFirst = new OIMO.SpringDamper().setSpring(this.#springFrequencyFirst, this.#springDampingFirst);
            this.#axisSpringDamperSecond = new OIMO.SpringDamper().setSpring(this.#springFrequencySecond, this.#springDampingSecond);
            this.#motorFirst = new OIMO.RotationalLimitMotor().setLimits(this.#minRotorFirst * Math.PI / 180, this.#maxRotorFirst * Math.PI / 180);
            this.#motorFirst.setMotor(this.#rotorSpeedFirst, this.#rotorTorqueFirst);
            this.#motorSecond = new OIMO.RotationalLimitMotor().setLimits(this.#minRotorFirst * Math.PI / 180, this.#maxRotorFirst * Math.PI / 180);
            this.#motorSecond.setMotor(this.#rotorSpeedFirst, this.#rotorTorqueFirst);
            this.config = new OIMO.UniversalJointConfig();
            super.constructJoint(this.#axisFirst, this.#axisSecond);
            this.config.limitMotor1 = this.#motorFirst;
            this.config.limitMotor2 = this.#motorSecond;
            this.config.springDamper1 = this.#axisSpringDamperFirst;
            this.config.springDamper2 = this.#axisSpringDamperSecond;
            this.joint = new OIMO.UniversalJoint(this.config);
            super.configureJoint();
        }
    }
    FudgeCore.JointUniversal = JointUniversal;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class JointWelding extends FudgeCore.Joint {
        static iSubclass = FudgeCore.Joint.registerSubclass(JointWelding);
        joint;
        config = new OIMO.GenericJointConfig();
        constructor(_bodyAnchor = null, _bodyTied = null, _localAnchor = new FudgeCore.Vector3(0, 0, 0)) {
            super(_bodyAnchor, _bodyTied);
            this.anchor = new FudgeCore.Vector3(_localAnchor.x, _localAnchor.y, _localAnchor.z);
        }
        serialize() {
            let serialization = {
                [super.constructor.name]: super.serialize()
            };
            return serialization;
        }
        async deserialize(_serialization) {
            super.deserialize(_serialization[super.constructor.name]);
            return this;
        }
        constructJoint() {
            this.config = new OIMO.GenericJointConfig();
            super.constructJoint(new OIMO.Mat3(), new OIMO.Mat3());
            this.joint = new OIMO.GenericJoint(this.config);
            this.joint.setAllowCollision(this.internalCollision);
        }
    }
    FudgeCore.JointWelding = JointWelding;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Physics {
        static settings;
        static world = Physics.initializePhysics();
        debugDraw;
        mainCam;
        oimoWorld;
        bodyList = new Array();
        jointList = new Array();
        static initializePhysics() {
            if (typeof OIMO !== "undefined") {
                this.world = new Physics();
                this.settings = new FudgeCore.PhysicsSettings(FudgeCore.COLLISION_GROUP.DEFAULT, (FudgeCore.COLLISION_GROUP.DEFAULT | FudgeCore.COLLISION_GROUP.GROUP_1 | FudgeCore.COLLISION_GROUP.GROUP_2 | FudgeCore.COLLISION_GROUP.GROUP_3 | FudgeCore.COLLISION_GROUP.GROUP_4));
                this.world.createWorld();
                this.world.debugDraw = new FudgeCore.PhysicsDebugDraw();
                this.world.oimoWorld.setDebugDraw(this.world.debugDraw.oimoDebugDraw);
            }
            return this.world;
        }
        static raycast(_origin, _direction, _length = 1, _debugDraw = false, _group = FudgeCore.COLLISION_GROUP.DEFAULT) {
            let hitInfo = new FudgeCore.RayHitInfo();
            let ray = new OIMO.RayCastClosest();
            let begin = new OIMO.Vec3(_origin.x, _origin.y, _origin.z);
            let end = this.getRayEndPoint(begin, new FudgeCore.Vector3(_direction.x, _direction.y, _direction.z), _length);
            ray.clear();
            if (_group == FudgeCore.COLLISION_GROUP.DEFAULT) {
                Physics.world.oimoWorld.rayCast(begin, end, ray);
            }
            else {
                let allHits = new Array();
                this.world.bodyList.forEach(function (value) {
                    if (value.collisionGroup == _group) {
                        hitInfo = value.raycastThisBody(_origin, _direction, _length);
                        if (hitInfo.hit == true) {
                            allHits.push(hitInfo);
                        }
                    }
                });
                allHits.forEach(function (value) {
                    if (value.hitDistance < hitInfo.hitDistance || hitInfo.hit == false) {
                        hitInfo = value;
                    }
                });
            }
            if (ray.hit) {
                hitInfo.hit = true;
                hitInfo.hitPoint = new FudgeCore.Vector3(ray.position.x, ray.position.y, ray.position.z);
                hitInfo.hitNormal = new FudgeCore.Vector3(ray.normal.x, ray.normal.y, ray.normal.z);
                hitInfo.hitDistance = this.getRayDistance(_origin, hitInfo.hitPoint);
                hitInfo.rigidbodyComponent = ray.shape.userData;
                hitInfo.rayEnd = new FudgeCore.Vector3(end.x, end.y, end.z);
                hitInfo.rayOrigin = _origin;
            }
            else {
                hitInfo.rayOrigin = _origin;
                hitInfo.hitPoint = new FudgeCore.Vector3(end.x, end.y, end.z);
            }
            if (_debugDraw) {
                Physics.world.debugDraw.debugRay(hitInfo.rayOrigin, hitInfo.hitPoint, new FudgeCore.Color(0, 1, 0, 1));
            }
            return hitInfo;
        }
        static adjustTransforms(_branch, _toMesh = false) {
            FudgeCore.Render.prepare(_branch, { ignorePhysics: true });
            for (let node of FudgeCore.Render.nodesPhysics)
                node.getComponent(FudgeCore.ComponentRigidbody).initialize();
        }
        static getRayEndPoint(start, direction, length) {
            let origin = FudgeCore.Recycler.borrow(FudgeCore.Vector3);
            origin.set(start.x, start.y, start.z);
            let scaledDirection = direction.clone;
            scaledDirection.scale(length);
            let endpoint = FudgeCore.Vector3.SUM(scaledDirection, origin);
            FudgeCore.Recycler.store(scaledDirection);
            FudgeCore.Recycler.store(endpoint);
            return new OIMO.Vec3(endpoint.x, endpoint.y, endpoint.z);
        }
        static getRayDistance(origin, hitPoint) {
            let dx = origin.x - hitPoint.x;
            let dy = origin.y - hitPoint.y;
            let dz = origin.z - hitPoint.z;
            return Math.sqrt(dx * dx + dy * dy + dz * dz);
        }
        getBodyList() {
            return this.bodyList;
        }
        getSolverIterations() {
            return Physics.world.oimoWorld.getNumPositionIterations();
        }
        setSolverIterations(_value) {
            Physics.world.oimoWorld.setNumPositionIterations(_value);
            Physics.world.oimoWorld.setNumVelocityIterations(_value);
        }
        getGravity() {
            let tmpVec = Physics.world.oimoWorld.getGravity();
            return new FudgeCore.Vector3(tmpVec.x, tmpVec.y, tmpVec.z);
        }
        setGravity(_value) {
            let tmpVec = new OIMO.Vec3(_value.x, _value.y, _value.z);
            Physics.world.oimoWorld.setGravity(tmpVec);
        }
        addRigidbody(_cmpRB) {
            this.bodyList.push(_cmpRB);
            Physics.world.oimoWorld.addRigidBody(_cmpRB.getOimoRigidbody());
        }
        removeRigidbody(_cmpRB) {
            let id = this.bodyList.indexOf(_cmpRB);
            this.bodyList.splice(id, 1);
            Physics.world.oimoWorld.removeRigidBody(_cmpRB.getOimoRigidbody());
        }
        addJoint(_cmpJoint) {
            Physics.world.oimoWorld.addJoint(_cmpJoint.getOimoJoint());
        }
        removeJoint(_cmpJoint) {
            Physics.world.oimoWorld.removeJoint(_cmpJoint.getOimoJoint());
        }
        getOimoWorld() {
            return this.oimoWorld;
        }
        simulate(_deltaTime = 1 / 60) {
            if (this.jointList.length > 0)
                this.connectJoints();
            if (FudgeCore.Time.game.getScale() != 0) {
                _deltaTime = _deltaTime > 1 / 30 ? 1 / 30 : _deltaTime;
                Physics.world.oimoWorld.step(_deltaTime * FudgeCore.Time.game.getScale());
            }
        }
        draw(_cmpCamera, _mode) {
            Physics.world.debugDraw.setDebugMode(_mode);
            Physics.world.mainCam = _cmpCamera;
            Physics.world.oimoWorld.debugDraw();
            Physics.world.debugDraw.drawBuffers();
            Physics.world.debugDraw.clearBuffers();
        }
        connectJoints() {
            let jointsToConnect = this.jointList;
            this.jointList = [];
            jointsToConnect.forEach((_joint) => {
                if (_joint.isConnected() == false) {
                    _joint.connect();
                }
            });
        }
        changeJointStatus(_cmpJoint) {
            if (this.jointList.indexOf(_cmpJoint) < 0)
                this.jointList.push(_cmpJoint);
        }
        distributeBodyID() {
            let freeId = 0;
            let free = false;
            this.bodyList.forEach((_value) => {
                if (_value.id != freeId) {
                    free = true;
                }
                else {
                    free = false;
                }
                if (!free) {
                    freeId++;
                }
            });
            return freeId;
        }
        getBodyByID(_id) {
            let body = null;
            this.bodyList.forEach((value) => {
                if (value.id == _id) {
                    body = value;
                }
            });
            return body;
        }
        createWorld() {
            if (Physics.world.oimoWorld != null) {
                let jointsWorld = Physics.world.oimoWorld.getNumJoints();
                let bodiesWorld = Physics.world.oimoWorld.getNumRigidBodies();
                this.bodyList = null;
                this.jointList = null;
                for (let i = 0; i < jointsWorld; i++) {
                    Physics.world.oimoWorld.removeJoint(Physics.world.oimoWorld.getJointList());
                }
                for (let i = 0; i < bodiesWorld; i++) {
                    Physics.world.oimoWorld.removeRigidBody(Physics.world.oimoWorld.getRigidBodyList());
                }
            }
            Physics.world.oimoWorld = new OIMO.World();
        }
    }
    FudgeCore.Physics = Physics;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Quaternion extends FudgeCore.Mutable {
        x;
        y;
        z;
        w;
        constructor(_x = 0, _y = 0, _z = 0, _w = 0) {
            super();
            this.x = _x;
            this.y = _y;
            this.z = _z;
            this.w = _w;
        }
        get X() {
            return this.x;
        }
        set X(_x) {
            this.x = _x;
        }
        get Y() {
            return this.y;
        }
        set Y(_y) {
            this.y = _y;
        }
        get Z() {
            return this.z;
        }
        set Z(_z) {
            this.z = _z;
        }
        get W() {
            return this.w;
        }
        set W(_w) {
            this.w = _w;
        }
        setFromVector3(rollX, pitchY, yawZ) {
            let cy = Math.cos(yawZ * 0.5);
            let sy = Math.sin(yawZ * 0.5);
            let cp = Math.cos(pitchY * 0.5);
            let sp = Math.sin(pitchY * 0.5);
            let cr = Math.cos(rollX * 0.5);
            let sr = Math.sin(rollX * 0.5);
            this.w = cr * cp * cy + sr * sp * sy;
            this.x = sr * cp * cy - cr * sp * sy;
            this.y = cr * sp * cy + sr * cp * sy;
            this.z = cr * cp * sy - sr * sp * cy;
        }
        toEulerangles() {
            let angles = new FudgeCore.Vector3();
            let sinrcosp = 2 * (this.w * this.x + this.y * this.z);
            let cosrcosp = 1 - 2 * (this.x * this.x + this.y * this.y);
            angles.x = Math.atan2(sinrcosp, cosrcosp);
            let sinp = 2 * (this.w * this.y - this.z * this.x);
            if (Math.abs(sinp) >= 1)
                angles.y = this.copysign(Math.PI / 2, sinp);
            else
                angles.y = Math.asin(sinp);
            let sinycosp = 2 * (this.w * this.z + this.x * this.y);
            let cosycosp = 1 - 2 * (this.y * this.y + this.z * this.z);
            angles.z = Math.atan2(sinycosp, cosycosp);
            return angles;
        }
        toDegrees() {
            let angles = this.toEulerangles();
            angles.x = angles.x * (180 / Math.PI);
            angles.y = angles.y * (180 / Math.PI);
            angles.z = angles.z * (180 / Math.PI);
            return angles;
        }
        getMutator() {
            let mutator = {
                x: this.x, y: this.y, z: this.z, w: this.w
            };
            return mutator;
        }
        reduceMutator(_mutator) { }
        copysign(a, b) {
            return b < 0 ? -Math.abs(a) : Math.abs(a);
        }
    }
    FudgeCore.Quaternion = Quaternion;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Box {
        min;
        max;
        constructor(_min = FudgeCore.Vector3.ONE(Infinity), _max = FudgeCore.Vector3.ONE(-Infinity)) {
            this.set(_min, _max);
        }
        set(_min = FudgeCore.Vector3.ONE(Infinity), _max = FudgeCore.Vector3.ONE(-Infinity)) {
            this.min = _min;
            this.max = _max;
        }
        expand(_include) {
            this.min.min(_include);
            this.max.max(_include);
        }
        recycle() {
            this.min.set(Infinity, Infinity, Infinity);
            this.max.set(-Infinity, -Infinity, -Infinity);
        }
    }
    FudgeCore.Box = Box;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Pick {
        node;
        zBuffer;
        color;
        textureUV;
        #mtxViewToWorld;
        #posWorld;
        #posMesh;
        constructor(_node) {
            this.node = _node;
        }
        get posWorld() {
            if (this.#posWorld)
                return this.#posWorld;
            let pointInClipSpace = FudgeCore.Vector3.Z(this.zBuffer);
            let m = this.#mtxViewToWorld.get();
            let result = FudgeCore.Vector3.TRANSFORMATION(pointInClipSpace, this.#mtxViewToWorld, true);
            let w = m[3] * pointInClipSpace.x + m[7] * pointInClipSpace.y + m[11] * pointInClipSpace.z + m[15];
            result.scale(1 / w);
            this.#posWorld = result;
            return result;
        }
        get posMesh() {
            if (this.#posMesh)
                return this.#posMesh;
            let mtxWorldToMesh = FudgeCore.Matrix4x4.INVERSION(this.node.getComponent(FudgeCore.ComponentMesh).mtxWorld);
            let posMesh = FudgeCore.Vector3.TRANSFORMATION(this.posWorld, mtxWorldToMesh);
            this.#posMesh = posMesh;
            return posMesh;
        }
        get normal() {
            let cmpMesh = this.node.getComponent(FudgeCore.ComponentMesh);
            let mesh = cmpMesh.mesh;
            let normal = FudgeCore.Vector3.ZERO();
            let vertex = FudgeCore.Vector3.ZERO();
            let minDistance = Infinity;
            let result;
            for (let i = 2; i < mesh.indices.length; i += 3) {
                let iVertex = mesh.indices[i];
                let [x, y, z] = mesh.vertices.subarray(iVertex * 3, (iVertex + 1) * 3);
                vertex.set(x, y, z);
                [x, y, z] = mesh.normalsFace.subarray(iVertex * 3, (iVertex + 1) * 3);
                normal.set(x, y, z);
                let difference = FudgeCore.Vector3.DIFFERENCE(this.posMesh, vertex);
                let distance = Math.abs(FudgeCore.Vector3.DOT(normal, difference));
                if (distance < minDistance) {
                    result = normal.clone;
                    minDistance = distance;
                }
            }
            result.transform(cmpMesh.mtxWorld, false);
            result.normalize();
            return result;
        }
        set mtxViewToWorld(_mtxViewToWorld) {
            this.#mtxViewToWorld = _mtxViewToWorld;
        }
    }
    FudgeCore.Pick = Pick;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Picker {
        static pickRay(_branch, _ray, _min, _max) {
            let cmpCameraPick = new FudgeCore.ComponentCamera();
            cmpCameraPick.mtxPivot.translation = _ray.origin;
            cmpCameraPick.mtxPivot.lookAt(_ray.direction);
            cmpCameraPick.projectCentral(1, 0.001, FudgeCore.FIELD_OF_VIEW.DIAGONAL, _min, _max);
            let picks = FudgeCore.Render.pickBranch(_branch, cmpCameraPick);
            return picks;
        }
        static pickCamera(_branch, _cmpCamera, _posProjection) {
            let ray = new FudgeCore.Ray(new FudgeCore.Vector3(-_posProjection.x, _posProjection.y, 1));
            let length = ray.direction.magnitude;
            if (_cmpCamera.node) {
                let mtxCamera = FudgeCore.Matrix4x4.MULTIPLICATION(_cmpCamera.node.mtxWorld, _cmpCamera.mtxPivot);
                ray.transform(mtxCamera);
                FudgeCore.Recycler.store(mtxCamera);
            }
            else
                ray.transform(_cmpCamera.mtxPivot);
            let picks = Picker.pickRay(_branch, ray, length * _cmpCamera.getNear(), length * _cmpCamera.getFar());
            return picks;
        }
        static pickViewport(_viewport, _posClient) {
            let posProjection = _viewport.pointClientToProjection(_posClient);
            let picks = Picker.pickCamera(_viewport.getBranch(), _viewport.camera, posProjection);
            return picks;
        }
    }
    FudgeCore.Picker = Picker;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Ray {
        origin;
        direction;
        length;
        constructor(_direction = FudgeCore.Vector3.Z(-1), _origin = FudgeCore.Vector3.ZERO(), _length = 1) {
            this.origin = _origin;
            this.direction = _direction;
            this.length = _length;
        }
        intersectPlane(_origin, _normal) {
            let difference = FudgeCore.Vector3.DIFFERENCE(_origin, this.origin);
            let factor = FudgeCore.Vector3.DOT(difference, _normal) / FudgeCore.Vector3.DOT(this.direction, _normal);
            let intersect = FudgeCore.Vector3.SUM(this.origin, FudgeCore.Vector3.SCALE(this.direction, factor));
            return intersect;
        }
        getDistance(_target) {
            let originToTarget = FudgeCore.Vector3.DIFFERENCE(_target, this.origin);
            let raySection = FudgeCore.Vector3.NORMALIZATION(this.direction, 1);
            let projectedLength = FudgeCore.Vector3.DOT(originToTarget, raySection);
            raySection.scale(projectedLength);
            raySection.add(this.origin);
            let distance = FudgeCore.Vector3.DIFFERENCE(_target, raySection);
            return distance;
        }
        transform(_mtxTransform) {
            this.direction.transform(_mtxTransform);
            this.origin.transform(_mtxTransform);
        }
        toString() {
            return `origin: ${this.origin.toString()}, direction: ${this.direction.toString()}, length: ${this.length.toPrecision(5)}`;
        }
    }
    FudgeCore.Ray = Ray;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Render extends FudgeCore.RenderWebGL {
        static rectClip = new FudgeCore.Rectangle(-1, 1, 2, -2);
        static pickBuffer;
        static nodesPhysics = new FudgeCore.RecycableArray();
        static nodesSimple = new FudgeCore.RecycableArray();
        static nodesAlpha = new FudgeCore.RecycableArray();
        static timestampUpdate;
        static prepare(_branch, _options = {}, _mtxWorld = FudgeCore.Matrix4x4.IDENTITY(), _lights = new Map(), _shadersUsed = null) {
            let firstLevel = (_shadersUsed == null);
            if (firstLevel) {
                _shadersUsed = [];
                Render.timestampUpdate = performance.now();
                Render.nodesSimple.reset();
                Render.nodesAlpha.reset();
                Render.nodesPhysics.reset();
                Render.dispatchEvent(new Event("renderPrepareStart"));
            }
            if (!_branch.isActive)
                return;
            _branch.nNodesInBranch = 1;
            _branch.radius = 0;
            _branch.dispatchEventToTargetOnly(new Event("renderPrepare"));
            _branch.timestampUpdate = Render.timestampUpdate;
            if (_branch.cmpTransform && _branch.cmpTransform.isActive) {
                let mtxWorldBranch = FudgeCore.Matrix4x4.MULTIPLICATION(_mtxWorld, _branch.cmpTransform.mtxLocal);
                _branch.mtxWorld.set(mtxWorldBranch);
                FudgeCore.Recycler.store(mtxWorldBranch);
            }
            else
                _branch.mtxWorld.set(_mtxWorld);
            let cmpRigidbody = _branch.getComponent(FudgeCore.ComponentRigidbody);
            if (cmpRigidbody && cmpRigidbody.isActive) {
                Render.nodesPhysics.push(_branch);
                if (!_options?.ignorePhysics)
                    this.transformByPhysics(_branch, cmpRigidbody);
            }
            let cmpLights = _branch.getComponents(FudgeCore.ComponentLight);
            for (let cmpLight of cmpLights) {
                if (!cmpLight.isActive)
                    continue;
                let type = cmpLight.light.getType();
                let lightsOfType = _lights.get(type);
                if (!lightsOfType) {
                    lightsOfType = [];
                    _lights.set(type, lightsOfType);
                }
                lightsOfType.push(cmpLight);
            }
            let cmpMesh = _branch.getComponent(FudgeCore.ComponentMesh);
            let cmpMaterial = _branch.getComponent(FudgeCore.ComponentMaterial);
            if (cmpMesh && cmpMesh.isActive && cmpMaterial && cmpMaterial.isActive) {
                let mtxWorldMesh = FudgeCore.Matrix4x4.MULTIPLICATION(_branch.mtxWorld, cmpMesh.mtxPivot);
                cmpMesh.mtxWorld.set(mtxWorldMesh);
                FudgeCore.Recycler.store(mtxWorldMesh);
                let shader = cmpMaterial.material.getShader();
                if (_shadersUsed.indexOf(shader) < 0)
                    _shadersUsed.push(shader);
                _branch.radius = cmpMesh.radius;
                if (cmpMaterial.sortForAlpha)
                    Render.nodesAlpha.push(_branch);
                else
                    Render.nodesSimple.push(_branch);
            }
            for (let child of _branch.getChildren()) {
                Render.prepare(child, _options, _branch.mtxWorld, _lights, _shadersUsed);
                _branch.nNodesInBranch += child.nNodesInBranch;
                let cmpMeshChild = child.getComponent(FudgeCore.ComponentMesh);
                let position = cmpMeshChild ? cmpMeshChild.mtxWorld.translation : child.mtxWorld.translation;
                position = position.clone;
                _branch.radius = Math.max(_branch.radius, position.getDistance(_branch.mtxWorld.translation) + child.radius);
                FudgeCore.Recycler.store(position);
            }
            if (firstLevel) {
                Render.dispatchEvent(new Event("renderPrepareEnd"));
                for (let shader of _shadersUsed)
                    Render.setLightsInShader(shader, _lights);
            }
        }
        static pickBranch(_branch, _cmpCamera) {
            Render.ƒpicked = [];
            let size = Math.ceil(Math.sqrt(_branch.nNodesInBranch));
            Render.createPickTexture(size);
            Render.setBlendMode(FudgeCore.BLEND.OPAQUE);
            for (let node of _branch.getIterator(true)) {
                let cmpMesh = node.getComponent(FudgeCore.ComponentMesh);
                let cmpMaterial = node.getComponent(FudgeCore.ComponentMaterial);
                if (cmpMesh && cmpMesh.isActive && cmpMaterial && cmpMaterial.isActive) {
                    let mtxMeshToView = FudgeCore.Matrix4x4.MULTIPLICATION(_cmpCamera.mtxWorldToView, cmpMesh.mtxWorld);
                    Render.pick(node, node.mtxWorld, mtxMeshToView);
                    FudgeCore.Recycler.store(mtxMeshToView);
                }
            }
            Render.setBlendMode(FudgeCore.BLEND.TRANSPARENT);
            let picks = Render.getPicks(size, _cmpCamera);
            Render.resetFrameBuffer();
            return picks;
        }
        static draw(_cmpCamera) {
            Render.drawList(_cmpCamera, this.nodesSimple);
            Render.drawListAlpha(_cmpCamera);
        }
        static drawListAlpha(_cmpCamera) {
            function sort(_a, _b) {
                return (Reflect.get(_a, "zCamera") < Reflect.get(_b, "zCamera")) ? 1 : -1;
            }
            for (let node of Render.nodesAlpha)
                Reflect.set(node, "zCamera", _cmpCamera.pointWorldToClip(node.getComponent(FudgeCore.ComponentMesh).mtxWorld.translation).z);
            let sorted = Render.nodesAlpha.getSorted(sort);
            Render.drawList(_cmpCamera, sorted);
        }
        static drawList(_cmpCamera, _list) {
            for (let node of _list) {
                let cmpMesh = node.getComponent(FudgeCore.ComponentMesh);
                let mtxMeshToView = FudgeCore.Matrix4x4.MULTIPLICATION(_cmpCamera.mtxWorldToView, cmpMesh.mtxWorld);
                let cmpMaterial = node.getComponent(FudgeCore.ComponentMaterial);
                Render.drawMesh(cmpMesh, cmpMaterial, cmpMesh.mtxWorld, mtxMeshToView);
                FudgeCore.Recycler.store(mtxMeshToView);
            }
        }
        static transformByPhysics(_node, _cmpRigidbody) {
            if (!FudgeCore.Physics.world?.getBodyList().length)
                return;
            if (!_node.mtxLocal) {
                throw (new Error("ComponentRigidbody requires ComponentTransform at the same Node"));
            }
            if (!_cmpRigidbody.isInitialized || FudgeCore.Project.mode == FudgeCore.MODE.EDITOR)
                _cmpRigidbody.initialize();
            _cmpRigidbody.checkCollisionEvents();
            if (_cmpRigidbody.typeBody == FudgeCore.BODY_TYPE.KINEMATIC || FudgeCore.Project.mode == FudgeCore.MODE.EDITOR) {
                let mtxPivotWorld = FudgeCore.Matrix4x4.MULTIPLICATION(_node.mtxWorld, _cmpRigidbody.mtxPivotUnscaled);
                _cmpRigidbody.setPosition(mtxPivotWorld.translation);
                _cmpRigidbody.setRotation(mtxPivotWorld.rotation);
                FudgeCore.Recycler.store(mtxPivotWorld);
                return;
            }
            let mtxWorld = FudgeCore.Matrix4x4.CONSTRUCTION({ translation: _cmpRigidbody.getPosition(), rotation: _cmpRigidbody.getRotation(), scaling: null });
            mtxWorld.multiply(_cmpRigidbody.mtxPivotInverse);
            _node.mtxWorld.translation = mtxWorld.translation;
            _node.mtxWorld.rotation = mtxWorld.rotation;
            let mtxLocal = FudgeCore.Matrix4x4.RELATIVE(_node.mtxWorld, _node.getParent().mtxWorld);
            _node.mtxLocal.set(mtxLocal);
            FudgeCore.Recycler.store(mtxWorld);
            FudgeCore.Recycler.store(mtxLocal);
        }
    }
    FudgeCore.Render = Render;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class RenderParticles extends FudgeCore.Render {
        static drawParticles() {
        }
    }
    FudgeCore.RenderParticles = RenderParticles;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Viewport extends FudgeCore.EventTargetƒ {
        static focus;
        name = "Viewport";
        camera = null;
        rectSource;
        rectDestination;
        frameClientToCanvas = new FudgeCore.FramingScaled();
        frameCanvasToDestination = new FudgeCore.FramingComplex();
        frameDestinationToSource = new FudgeCore.FramingScaled();
        frameSourceToRender = new FudgeCore.FramingScaled();
        adjustingFrames = true;
        adjustingCamera = true;
        physicsDebugMode = FudgeCore.PHYSICS_DEBUGMODE.NONE;
        #branch = null;
        #crc2 = null;
        #canvas = null;
        get hasFocus() {
            return (Viewport.focus == this);
        }
        initialize(_name, _branch, _camera, _canvas) {
            this.name = _name;
            this.camera = _camera;
            this.#canvas = _canvas;
            this.#crc2 = _canvas.getContext("2d");
            this.rectSource = FudgeCore.Render.getCanvasRect();
            this.rectDestination = this.getClientRectangle();
            this.setBranch(_branch);
        }
        getCanvas() {
            return this.#canvas;
        }
        getContext() {
            return this.#crc2;
        }
        getCanvasRectangle() {
            return FudgeCore.Rectangle.GET(0, 0, this.#canvas.width, this.#canvas.height);
        }
        getClientRectangle() {
            return FudgeCore.Rectangle.GET(0, 0, this.#canvas.clientWidth, this.#canvas.clientHeight);
        }
        setBranch(_branch) {
            if (this.#branch) {
                this.#branch.removeEventListener("componentAdd", this.hndComponentEvent);
                this.#branch.removeEventListener("componentRemove", this.hndComponentEvent);
            }
            this.#branch = _branch;
            if (this.#branch) {
                this.#branch.addEventListener("componentAdd", this.hndComponentEvent);
                this.#branch.addEventListener("componentRemove", this.hndComponentEvent);
            }
        }
        getBranch() {
            return this.#branch;
        }
        showSceneGraph() {
            FudgeCore.Debug.branch(this.#branch);
        }
        draw(_calculateTransforms = true) {
            if (!this.#branch)
                return;
            FudgeCore.Render.resetFrameBuffer();
            if (!this.camera.isActive)
                return;
            if (this.adjustingFrames)
                this.adjustFrames();
            if (this.adjustingCamera)
                this.adjustCamera();
            if (_calculateTransforms)
                this.calculateTransforms();
            FudgeCore.Render.clear(this.camera.clrBackground);
            if (this.physicsDebugMode != FudgeCore.PHYSICS_DEBUGMODE.PHYSIC_OBJECTS_ONLY)
                FudgeCore.Render.draw(this.camera);
            if (this.physicsDebugMode != FudgeCore.PHYSICS_DEBUGMODE.NONE) {
                FudgeCore.Physics.world.draw(this.camera, this.physicsDebugMode);
            }
            this.#crc2.imageSmoothingEnabled = false;
            this.#crc2.drawImage(FudgeCore.Render.getCanvas(), this.rectSource.x, this.rectSource.y, this.rectSource.width, this.rectSource.height, this.rectDestination.x, this.rectDestination.y, this.rectDestination.width, this.rectDestination.height);
        }
        calculateTransforms() {
            let mtxRoot = FudgeCore.Matrix4x4.IDENTITY();
            if (this.#branch.getParent())
                mtxRoot = this.#branch.getParent().mtxWorld;
            FudgeCore.Render.prepare(this.#branch, null, mtxRoot);
        }
        adjustFrames() {
            let rectClient = this.getClientRectangle();
            let rectCanvas = this.frameClientToCanvas.getRect(rectClient);
            this.#canvas.width = rectCanvas.width;
            this.#canvas.height = rectCanvas.height;
            let rectTemp;
            rectTemp = this.frameCanvasToDestination.getRect(rectCanvas);
            this.rectDestination.copy(rectTemp);
            FudgeCore.Recycler.store(rectTemp);
            rectTemp = this.frameDestinationToSource.getRect(this.rectDestination);
            this.rectSource.copy(rectTemp);
            FudgeCore.Recycler.store(rectTemp);
            this.rectSource.x = this.rectSource.y = 0;
            let rectRender = this.frameSourceToRender.getRect(this.rectSource);
            FudgeCore.Render.setRenderRectangle(rectRender);
            FudgeCore.Render.setCanvasSize(rectRender.width, rectRender.height);
            FudgeCore.Recycler.store(rectClient);
            FudgeCore.Recycler.store(rectCanvas);
            FudgeCore.Recycler.store(rectRender);
        }
        adjustCamera() {
            let rect = FudgeCore.Render.getRenderRectangle();
            this.camera.projectCentral(rect.width / rect.height, this.camera.getFieldOfView(), this.camera.getDirection(), this.camera.getNear(), this.camera.getFar());
        }
        getRayFromClient(_point) {
            let posProjection = this.pointClientToProjection(_point);
            let ray = new FudgeCore.Ray(new FudgeCore.Vector3(-posProjection.x, posProjection.y, 1));
            ray.origin.transform(this.camera.mtxPivot);
            ray.direction.transform(this.camera.mtxPivot, false);
            let cameraNode = this.camera.node;
            if (cameraNode) {
                ray.origin.transform(cameraNode.mtxWorld);
                ray.direction.transform(cameraNode.mtxWorld, false);
            }
            return ray;
        }
        pointWorldToClient(_position) {
            let projection = this.camera.pointWorldToClip(_position);
            let posClient = this.pointClipToClient(projection.toVector2());
            return posClient;
        }
        pointClientToSource(_client) {
            let result = this.frameClientToCanvas.getPoint(_client, this.getClientRectangle());
            result = this.frameCanvasToDestination.getPoint(result, this.getCanvasRectangle());
            result = this.frameDestinationToSource.getPoint(result, this.rectSource);
            return result;
        }
        pointSourceToRender(_source) {
            let projectionRectangle = this.camera.getProjectionRectangle();
            let point = this.frameSourceToRender.getPoint(_source, projectionRectangle);
            return point;
        }
        pointClientToRender(_client) {
            let point = this.pointClientToSource(_client);
            point = this.pointSourceToRender(point);
            return point;
        }
        pointClientToProjection(_client) {
            let posRender = this.pointClientToRender(_client);
            let rectRender = this.frameSourceToRender.getRect(this.rectSource);
            let rectProjection = this.camera.getProjectionRectangle();
            let posProjection = new FudgeCore.Vector2(rectProjection.width * posRender.x / rectRender.width, rectProjection.height * posRender.y / rectRender.height);
            posProjection.subtract(new FudgeCore.Vector2(rectProjection.width / 2, rectProjection.height / 2));
            posProjection.y *= -1;
            return posProjection;
        }
        pointClipToClient(_normed) {
            let pointClient = FudgeCore.Render.rectClip.pointToRect(_normed, this.rectDestination);
            return pointClient;
        }
        pointClipToCanvas(_normed) {
            let pointCanvas = FudgeCore.Render.rectClip.pointToRect(_normed, this.getCanvasRectangle());
            return pointCanvas;
        }
        pointClientToScreen(_client) {
            let screen = new FudgeCore.Vector2(this.#canvas.offsetLeft + _client.x, this.#canvas.offsetTop + _client.y);
            return screen;
        }
        setFocus(_on) {
            if (_on) {
                if (Viewport.focus == this)
                    return;
                if (Viewport.focus)
                    Viewport.focus.dispatchEvent(new Event("focusout"));
                Viewport.focus = this;
                this.dispatchEvent(new Event("focusin"));
            }
            else {
                if (Viewport.focus != this)
                    return;
                this.dispatchEvent(new Event("focusout"));
                Viewport.focus = null;
            }
        }
        activatePointerEvent(_type, _on) {
            this.activateEvent(this.#canvas, _type, this.hndPointerEvent, _on);
        }
        activateKeyboardEvent(_type, _on) {
            this.activateEvent(this.#canvas.ownerDocument, _type, this.hndKeyboardEvent, _on);
        }
        activateDragDropEvent(_type, _on) {
            if (_type == "\u0192dragstart")
                this.#canvas.draggable = _on;
            this.activateEvent(this.#canvas, _type, this.hndDragDropEvent, _on);
        }
        activateWheelEvent(_type, _on) {
            this.activateEvent(this.#canvas, _type, this.hndWheelEvent, _on);
        }
        hndDragDropEvent = (_event) => {
            let _dragevent = _event;
            switch (_dragevent.type) {
                case "dragover":
                case "drop":
                    _dragevent.preventDefault();
                    _dragevent.dataTransfer.effectAllowed = "none";
                    break;
                case "dragstart":
                    _dragevent.dataTransfer.setData("text", "Hallo");
                    _dragevent.dataTransfer.setDragImage(new Image(), 0, 0);
                    break;
            }
            let event = new FudgeCore.EventDragDrop("ƒ" + _event.type, _dragevent);
            this.addCanvasPosition(event);
            this.dispatchEvent(event);
        };
        addCanvasPosition(event) {
            event.canvasX = this.#canvas.width * event.pointerX / event.clientRect.width;
            event.canvasY = this.#canvas.height * event.pointerY / event.clientRect.height;
        }
        hndPointerEvent = (_event) => {
            let event = new FudgeCore.EventPointer("ƒ" + _event.type, _event);
            this.addCanvasPosition(event);
            this.dispatchEvent(event);
        };
        hndKeyboardEvent = (_event) => {
            if (!this.hasFocus)
                return;
            let event = new FudgeCore.EventKeyboard("ƒ" + _event.type, _event);
            this.dispatchEvent(event);
        };
        hndWheelEvent = (_event) => {
            let event = new FudgeCore.EventWheel("ƒ" + _event.type, _event);
            this.dispatchEvent(event);
        };
        activateEvent(_target, _type, _handler, _on) {
            _type = _type.slice(1);
            if (_on)
                _target.addEventListener(_type, _handler);
            else
                _target.removeEventListener(_type, _handler);
        }
        hndComponentEvent(_event) {
        }
    }
    FudgeCore.Viewport = Viewport;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class FileIoBrowserLocal extends FudgeCore.EventTargetStatic {
        static selector;
        static async load(_multiple = false) {
            FileIoBrowserLocal.selector = document.createElement("input");
            FileIoBrowserLocal.selector.type = "file";
            FileIoBrowserLocal.selector.multiple = _multiple;
            FileIoBrowserLocal.selector.hidden = true;
            FileIoBrowserLocal.selector.addEventListener("change", FileIoBrowserLocal.handleFileSelect);
            document.body.appendChild(FileIoBrowserLocal.selector);
            return new Promise(_resolve => {
                function hndLoaded(_event) {
                    FileIoBrowserLocal.removeEventListener("fileLoaded", hndLoaded);
                    _resolve(_event.detail.mapFilenameToContent);
                }
                FileIoBrowserLocal.addEventListener("fileLoaded", hndLoaded);
                FileIoBrowserLocal.selector.click();
            });
        }
        static save(_toSave, _type = "text/plain") {
            for (let filename in _toSave) {
                let content = _toSave[filename];
                let blob = new Blob([content], { type: _type });
                let url = window.URL.createObjectURL(blob);
                let downloader;
                downloader = document.createElement("a");
                downloader.setAttribute("href", url);
                downloader.setAttribute("download", filename);
                document.body.appendChild(downloader);
                downloader.click();
                document.body.removeChild(downloader);
                window.URL.revokeObjectURL(url);
            }
            return new Promise(_resolve => {
                _resolve(_toSave);
            });
        }
        static async handleFileSelect(_event) {
            FudgeCore.Debug.fudge("-------------------------------- handleFileSelect");
            document.body.removeChild(FileIoBrowserLocal.selector);
            let fileList = _event.target.files;
            FudgeCore.Debug.fudge(fileList, fileList.length);
            if (fileList.length == 0)
                return;
            let loaded = {};
            await FileIoBrowserLocal.loadFiles(fileList, loaded);
            let event = new CustomEvent("fileLoaded", { detail: { mapFilenameToContent: loaded } });
            FileIoBrowserLocal.targetStatic.dispatchEvent(event);
        }
        static async loadFiles(_fileList, _loaded) {
            for (let file of _fileList) {
                const content = await new Response(file).text();
                _loaded[file.name] = content;
            }
        }
    }
    FudgeCore.FileIoBrowserLocal = FileIoBrowserLocal;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class MutableArray extends Array {
        rearrange(_sequence) {
            let length = this.length;
            for (let index of _sequence) {
                let original = this[index];
                let copy = new original.constructor();
                copy.mutate(original.getMutator());
                this.push(copy);
            }
            this.splice(0, length);
        }
        getMutatorAttributeTypes(_mutator) {
            let types = {};
            for (let entry in this)
                types[entry] = this[entry].constructor.name;
            return types;
        }
        getMutator() {
            return this.map((_value) => _value.getMutator());
        }
        getMutatorForUserInterface() {
            return this.getMutator();
        }
        async mutate(_mutator) {
            for (let entry in this)
                await this[entry].mutate(_mutator[entry]);
        }
        updateMutator(_mutator) {
            for (let entry in this) {
                let mutatorValue = _mutator[entry];
                if (!mutatorValue)
                    continue;
                if (this[entry] instanceof FudgeCore.Mutable)
                    _mutator[entry] = this[entry].getMutator();
                else
                    _mutator[entry] = this[entry];
            }
        }
    }
    FudgeCore.MutableArray = MutableArray;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    let MODE;
    (function (MODE) {
        MODE[MODE["EDITOR"] = 0] = "EDITOR";
        MODE[MODE["RUNTIME"] = 1] = "RUNTIME";
    })(MODE = FudgeCore.MODE || (FudgeCore.MODE = {}));
    class Project {
        static resources = {};
        static serialization = {};
        static scriptNamespaces = {};
        static baseURL = new URL(location.toString());
        static mode = MODE.RUNTIME;
        static register(_resource, _idResource) {
            if (_resource.idResource)
                if (_resource.idResource == _idResource)
                    return;
                else
                    this.deregister(_resource);
            _resource.idResource = _idResource || Project.generateId(_resource);
            Project.resources[_resource.idResource] = _resource;
        }
        static deregister(_resource) {
            delete (Project.resources[_resource.idResource]);
            delete (Project.serialization[_resource.idResource]);
        }
        static clear() {
            Project.resources = {};
            Project.serialization = {};
            Project.scriptNamespaces = {};
        }
        static getResourcesOfType(_type) {
            let found = {};
            for (let resourceId in Project.resources) {
                let resource = Project.resources[resourceId];
                if (resource instanceof _type)
                    found[resourceId] = resource;
            }
            return found;
        }
        static generateId(_resource) {
            let idResource;
            do
                idResource = _resource.constructor.name + "|" + new Date().toISOString() + "|" + Math.random().toPrecision(5).substr(2, 5);
            while (Project.resources[idResource]);
            return idResource;
        }
        static isResource(_object) {
            return (Reflect.has(_object, "idResource"));
        }
        static async getResource(_idResource) {
            let resource = Project.resources[_idResource];
            if (!resource) {
                let serialization = Project.serialization[_idResource];
                if (!serialization) {
                    FudgeCore.Debug.error("Resource not found", _idResource);
                    return null;
                }
                resource = await Project.deserializeResource(serialization);
            }
            return resource;
        }
        static async registerAsGraph(_node, _replaceWithInstance = true) {
            let serialization = _node.serialize();
            let graph = new FudgeCore.Graph(_node.name);
            await graph.deserialize(serialization);
            Project.register(graph);
            if (_replaceWithInstance && _node.getParent()) {
                let instance = await Project.createGraphInstance(graph);
                _node.getParent().replaceChild(_node, instance);
            }
            return graph;
        }
        static async createGraphInstance(_graph) {
            let instance = new FudgeCore.GraphInstance();
            await instance.set(_graph);
            return instance;
        }
        static registerScriptNamespace(_namespace) {
            let name = FudgeCore.Serializer.registerNamespace(_namespace);
            if (!Project.scriptNamespaces[name])
                Project.scriptNamespaces[name] = _namespace;
        }
        static getComponentScripts() {
            let compoments = {};
            for (let namespace in Project.scriptNamespaces) {
                compoments[namespace] = [];
                for (let name in Project.scriptNamespaces[namespace]) {
                    let script = Reflect.get(Project.scriptNamespaces[namespace], name);
                    let o = Object.create(script);
                    if (o.prototype instanceof FudgeCore.ComponentScript)
                        compoments[namespace].push(script);
                }
            }
            return compoments;
        }
        static async loadScript(_url) {
            let script = document.createElement("script");
            script.type = "text/javascript";
            script.async = false;
            let head = document.head;
            head.appendChild(script);
            FudgeCore.Debug.log("Loading: ", _url);
            return new Promise((resolve, reject) => {
                script.addEventListener("load", () => resolve());
                script.addEventListener("error", () => {
                    FudgeCore.Debug.error("Loading script", _url);
                    reject();
                });
                script.src = _url.toString();
            });
        }
        static async loadResources(_url) {
            const response = await fetch(_url);
            const resourceFileContent = await response.text();
            let serialization = FudgeCore.Serializer.parse(resourceFileContent);
            let reconstruction = await Project.deserialize(serialization);
            return reconstruction;
        }
        static async loadResourcesFromHTML() {
            const head = document.head;
            let links = head.querySelectorAll("link[type=resources]");
            for (let link of links) {
                let url = link.getAttribute("src");
                await Project.loadResources(url);
            }
        }
        static serialize() {
            let serialization = {};
            for (let idResource in Project.resources) {
                let resource = Project.resources[idResource];
                if (idResource != resource.idResource)
                    FudgeCore.Debug.error("Resource-id mismatch", resource);
                serialization[idResource] = FudgeCore.Serializer.serialize(resource);
            }
            return serialization;
        }
        static async deserialize(_serialization) {
            Project.serialization = _serialization;
            Project.resources = {};
            for (let idResource in _serialization) {
                let serialization = _serialization[idResource];
                let resource = await Project.deserializeResource(serialization);
                if (resource)
                    Project.resources[idResource] = resource;
            }
            return Project.resources;
        }
        static async deserializeResource(_serialization) {
            return FudgeCore.Serializer.deserialize(_serialization);
        }
    }
    FudgeCore.Project = Project;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    var Shader_1;
    let Shader = Shader_1 = class Shader {
        static baseClass = Shader_1;
        static subclasses = [];
        static program;
        static attributes;
        static uniforms;
        static getCoat() { return null; }
        static getVertexShaderSource() { return null; }
        static getFragmentShaderSource() { return null; }
        static deleteProgram() { }
        static useProgram() { }
        static createProgram() { }
        static registerSubclass(_subclass) { return Shader_1.subclasses.push(_subclass) - 1; }
    };
    Shader = Shader_1 = __decorate([
        FudgeCore.RenderInjectorShader.decorate
    ], Shader);
    FudgeCore.Shader = Shader;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderFlat extends FudgeCore.Shader {
        static iSubclass = FudgeCore.Shader.registerSubclass(ShaderFlat);
        static getCoat() {
            return FudgeCore.CoatColored;
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

        const uint MAX_LIGHTS_DIRECTIONAL = 100u;

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
            vec3 normal = normalize(transpose(inverse(mat3(u_world))) * a_normal);
            // vec3 normal = normalize(vec3(u_world * vec4(a_normal, 1.0)));

            v_color = u_ambient.color;
            for (uint i = 0u; i < u_nLightsDirectional; i++) {
                float illumination = -dot(normal, u_directional[i].direction);
                if (illumination > 0.0f)
                    v_color += illumination * u_directional[i].color; // vec4(1,1,1,1); // 
            }
            v_color.a = 1.0;
        }`;
        }
        static getFragmentShaderSource() {
            return `#version 300 es
        precision mediump float;

        uniform vec4 u_color;
        flat in vec4 v_color;
        out vec4 frag;
        
        void main() {
            frag = u_color * v_color;
        }`;
        }
    }
    FudgeCore.ShaderFlat = ShaderFlat;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderMatCap extends FudgeCore.Shader {
        static iSubclass = FudgeCore.Shader.registerSubclass(ShaderMatCap);
        static getCoat() {
            return FudgeCore.CoatMatCap;
        }
        static getVertexShaderSource() {
            return `#version 300 es
        in vec3 a_position;
        in vec3 a_normal;

        uniform mat4 u_projection;

        out vec2 texcoords_smooth;
        flat out vec2 texcoords_flat;

        void main() {
            texcoords_smooth = normalize(mat3(u_projection) * a_normal).xy * 0.5 - 0.5;
            texcoords_flat = texcoords_smooth;
            gl_Position = u_projection * vec4(a_position, 1.0);
        }`;
        }
        static getFragmentShaderSource() {
            return `#version 300 es
        precision mediump float;
        
        uniform vec4 u_tint_color;
        uniform int shade_smooth;
        uniform sampler2D u_texture;
        
        in vec2 texcoords_smooth;
        flat in vec2 texcoords_flat;

        out vec4 frag;

        void main() {

            if (shade_smooth > 0) {
              frag = u_tint_color * texture(u_texture, texcoords_smooth) * 2.0;
            } else {
              frag = u_tint_color * texture(u_texture, texcoords_flat) * 2.0;
            }
        }`;
        }
    }
    FudgeCore.ShaderMatCap = ShaderMatCap;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderPick extends FudgeCore.Shader {
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
        precision highp int;
        
        uniform int u_id;
        uniform vec2 u_size;
        uniform vec4 u_color;
        out ivec4 frag;
        
        void main() {
           float id = float(u_id); 
           float pixel = trunc(gl_FragCoord.x) + u_size.x * trunc(gl_FragCoord.y);

           if (pixel != id)
             discard;

           uint icolor = uint(u_color.r * 255.0) << 24 | uint(u_color.g * 255.0) << 16 | uint(u_color.b * 255.0) << 8 | uint(u_color.a * 255.0);
                        
           frag = ivec4(floatBitsToInt(gl_FragCoord.z), icolor, 0, 0);
        }`;
        }
    }
    FudgeCore.ShaderPick = ShaderPick;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderPickTextured extends FudgeCore.Shader {
        static getVertexShaderSource() {
            return `#version 300 es
         in vec3 a_position;       
         in vec2 a_textureUVs;
         uniform mat4 u_projection;
         uniform mat3 u_pivot;
        
         out vec2 v_textureUVs;
         
         void main() {   
             gl_Position = u_projection * vec4(a_position, 1.0);
             v_textureUVs = vec2(u_pivot * vec3(a_textureUVs, 1.0)).xy;
         }`;
        }
        static getFragmentShaderSource() {
            return `#version 300 es
        precision mediump float;
        precision highp int;
        
        uniform int u_id;
        uniform vec2 u_size;
        in vec2 v_textureUVs;
        uniform vec4 u_color;
        uniform sampler2D u_texture;
        
        out ivec4 frag;
        
        void main() {
           float id = float(u_id); 
           float pixel = trunc(gl_FragCoord.x) + u_size.x * trunc(gl_FragCoord.y);

           if (pixel != id)
             discard;
           
           vec4 color = u_color * texture(u_texture, v_textureUVs);
           uint icolor = uint(color.r * 255.0) << 24 | uint(color.g * 255.0) << 16 | uint(color.b * 255.0) << 8 | uint(color.a * 255.0);
          
          frag = ivec4(floatBitsToInt(gl_FragCoord.z), icolor, floatBitsToInt(v_textureUVs.x), floatBitsToInt(v_textureUVs.y));
        }`;
        }
    }
    FudgeCore.ShaderPickTextured = ShaderPickTextured;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderTexture extends FudgeCore.Shader {
        static iSubclass = FudgeCore.Shader.registerSubclass(ShaderTexture);
        static getCoat() {
            return FudgeCore.CoatTextured;
        }
        static getVertexShaderSource() {
            return `#version 300 es
        in vec3 a_position;
        in vec2 a_textureUVs;
        uniform mat4 u_projection;
        uniform mat3 u_pivot;
        out vec2 v_textureUVs;

        void main() {  
            gl_Position = u_projection * vec4(a_position, 1.0);
            v_textureUVs = vec2(u_pivot * vec3(a_textureUVs, 1.0)).xy;
        }`;
        }
        static getFragmentShaderSource() {
            return `#version 300 es
        precision mediump float;
        
        in vec2 v_textureUVs;
        uniform vec4 u_color;
        uniform sampler2D u_texture;
        // uniform vec4 u_colorBackground; // maybe a material background color can shine through... but where and with which intensity?
        out vec4 frag;
        
        void main() {
            vec4 colorTexture = texture(u_texture, v_textureUVs);
            frag = u_color * colorTexture;
            //frag = vec4(colorTexture.r * 1.0, colorTexture.g * 0.4, colorTexture.b * 0.1, colorTexture.a * 1.5);//u_color;
            //frag = colorTexture;
            if (frag.a < 0.01)
              discard;
        }`;
        }
    }
    FudgeCore.ShaderTexture = ShaderTexture;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderTextureFlat extends FudgeCore.Shader {
        static iSubclass = FudgeCore.Shader.registerSubclass(ShaderTextureFlat);
        static getCoat() { return FudgeCore.CoatTextured; }
        static getVertexShaderSource() {
            return `#version 300 es
struct LightAmbient {
  vec4 color;
};
struct LightDirectional {
  vec4 color;
  vec3 direction;
};

const uint MAX_LIGHTS_DIRECTIONAL = 100u;

in vec3 a_position;
in vec3 a_normal;
in vec2 a_textureUVs;
uniform mat4 u_world;
uniform mat4 u_projection;
uniform mat3 u_pivot;

uniform LightAmbient u_ambient;
uniform uint u_nLightsDirectional;
uniform LightDirectional u_directional[MAX_LIGHTS_DIRECTIONAL];
flat out vec4 v_color;
out vec2 v_textureUVs;

void main() {
  gl_Position = u_projection * vec4(a_position, 1.0);
  vec3 normal = normalize(transpose(inverse(mat3(u_world))) * a_normal);

  v_color = u_ambient.color;
  for(uint i = 0u; i < u_nLightsDirectional; i++) {
    float illumination = -dot(normal, u_directional[i].direction);
    if(illumination > 0.0f)
      v_color += illumination * u_directional[i].color; // vec4(1,1,1,1); // 
  }

  v_color.a = 1.0;
  v_textureUVs = vec2(u_pivot * vec3(a_textureUVs, 1.0)).xy;
}
`;
        }
        static getFragmentShaderSource() {
            return `#version 300 es
precision mediump float;

uniform vec4 u_color;
flat in vec4 v_color;
in vec2 v_textureUVs;
uniform sampler2D u_texture;
out vec4 frag;

void main() {
  vec4 colorTexture = texture(u_texture, v_textureUVs);
  frag = u_color * v_color * colorTexture;
  if(frag.a < 0.01)
    discard;
}
`;
        }
    }
    FudgeCore.ShaderTextureFlat = ShaderTextureFlat;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderUniColor extends FudgeCore.Shader {
        static iSubclass = FudgeCore.Shader.registerSubclass(ShaderUniColor);
        static getCoat() {
            return FudgeCore.CoatColored;
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
          // if (gl_FragCoord.x < 200.0)
          frag = u_color;
         //    frag = vec4(1.0,1.0,1.0,1.0);
        }`;
        }
    }
    FudgeCore.ShaderUniColor = ShaderUniColor;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    let MIPMAP;
    (function (MIPMAP) {
        MIPMAP[MIPMAP["CRISP"] = 0] = "CRISP";
        MIPMAP[MIPMAP["MEDIUM"] = 1] = "MEDIUM";
        MIPMAP[MIPMAP["BLURRY"] = 2] = "BLURRY";
    })(MIPMAP = FudgeCore.MIPMAP || (FudgeCore.MIPMAP = {}));
    let Texture = class Texture extends FudgeCore.Mutable {
        name;
        idResource = undefined;
        mipmap = MIPMAP.CRISP;
        renderData;
        constructor(_name = "Texture") {
            super();
            this.name = _name;
        }
        useRenderData() { }
        refresh() {
            this.renderData = null;
        }
        serialize() {
            let serialization = {
                idResource: this.idResource,
                name: this.name,
                mipmap: MIPMAP[this.mipmap]
            };
            return serialization;
        }
        async deserialize(_serialization) {
            FudgeCore.Project.register(this, _serialization.idResource);
            this.name = _serialization.name;
            this.mipmap = MIPMAP[_serialization.mipmap];
            return this;
        }
        getMutatorAttributeTypes(_mutator) {
            let types = super.getMutatorAttributeTypes(_mutator);
            if (types.mipmap)
                types.mipmap = MIPMAP;
            return types;
        }
        reduceMutator(_mutator) {
            delete _mutator.idResource;
        }
    };
    Texture = __decorate([
        FudgeCore.RenderInjectorTexture.decorate
    ], Texture);
    FudgeCore.Texture = Texture;
    class TextureImage extends Texture {
        image = null;
        url;
        constructor(_url) {
            super();
            if (_url) {
                this.load(_url);
                this.name = _url.toString().split("/").pop();
            }
            FudgeCore.Project.register(this);
        }
        get texImageSource() {
            return this.image;
        }
        async load(_url) {
            this.url = _url;
            this.image = new Image();
            return new Promise((resolve, reject) => {
                this.image.addEventListener("load", () => {
                    this.renderData = null;
                    resolve();
                });
                this.image.addEventListener("error", () => reject());
                this.image.src = new URL(this.url.toString(), FudgeCore.Project.baseURL).toString();
            });
        }
        serialize() {
            return {
                url: this.url,
                type: this.type,
                [super.constructor.name]: super.serialize()
            };
        }
        async deserialize(_serialization) {
            await super.deserialize(_serialization[super.constructor.name]);
            await this.load(_serialization.url);
            return this;
        }
        async mutate(_mutator) {
            if (_mutator.url != this.url.toString())
                await this.load(_mutator.url);
            delete (_mutator.url);
            super.mutate(_mutator);
        }
    }
    FudgeCore.TextureImage = TextureImage;
    class TextureBase64 extends Texture {
        image = new Image();
        constructor(_name, _base64, _mipmap = MIPMAP.CRISP) {
            super(_name);
            this.image.src = _base64;
            this.mipmap = _mipmap;
        }
        get texImageSource() {
            return this.image;
        }
    }
    FudgeCore.TextureBase64 = TextureBase64;
    class TextureCanvas extends Texture {
        crc2;
        constructor(_name, _crc2) {
            super(_name);
            this.crc2 = _crc2;
        }
        get texImageSource() {
            return this.crc2.canvas;
        }
    }
    FudgeCore.TextureCanvas = TextureCanvas;
    class TextureSketch extends TextureCanvas {
        get texImageSource() {
            return null;
        }
    }
    FudgeCore.TextureSketch = TextureSketch;
    class TextureHTML extends TextureCanvas {
        get texImageSource() {
            return null;
        }
    }
    FudgeCore.TextureHTML = TextureHTML;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class TextureDefault extends FudgeCore.TextureBase64 {
        static texture = new TextureDefault("TextureDefault", TextureDefault.get(), FudgeCore.MIPMAP.MEDIUM);
        static get() {
            return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQCAYAAACAvzbMAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAADWLSURBVHhe7d0HnFTlvf/xH9uXZYGl9yrSRJpEUexYsJIba8Re498WNcZEb+41epOIsWs0Niyxm2g0duwaewO7oqJCAGnSt7H/8304B4dldpk5Z3b3zO7nzeu85pwzM8vMs7PPb35PO61qPBZjrVq18vfiKebFR/lFRPlFQ/lFE/fyy/FvAQBICwEEABAKAQQAEAp9IBHRhhoN5RcN5RdNSyg//YzCwkJr3bq1O169erXbMoEAEhF/wNFQftFQftE09/LLzc21Ll262E9+8hMbP368VVdX2+uvv27Tp093QSTq+yeARMQfcDSUXzSUXzTNtfxycnKspKTEBg0aZEceeaQdeuihtmLFCvvss89s3rx59vjjj9vDDz8cOROJHECqqqps9uzZtmzZMlu5cqVLldq1a2d9+/Z1+1HxAYyG8ouG8ouG8osmTPnl5+db9+7dbffdd7dTTz3V1cXvvvuuvfzyyy4DkVWrVtmNN95oS5YsccdhhQ4g5eXl9uyzz9qMGTNszZo1/tkfKQIq+u29995WWlrqn00fH8BoKL9oKL9oKL9o0ik/PbZNmza2xRZb2HHHHWeTJ0+2hQsX2pNPPmmLFy/2H7XOf/7zH7v11ltdPR5FqACyYMECu+eee1KKXmvXrrX99tvPRo8e7YJKuvgARkP5RROUnz67+iKUl5dnlZWVtnz58li8dj5/0TSn8lOT1b777msXXHCBde7c2V577TV78803k77Hb7/91u644w6rqKjwz4STdgBRtqHUJ4hoChCffPKJffXVV649rX379jZgwAC3BZQuTZo0ybbbbjuXXqWDD2A0lF80Qfl17NjRjjnmGOvUqZN988039sADD7gvUk39+vn8RdOcyq9r1642depU23rrre3RRx91X3JEdbSasIqLi23YsGHuXKYCSNopgXrvg+Ch/o/77rvPvVi9+J///Od29NFH29ChQ90LDGj4mNIlBZm4/8LQssycOdM1xb766qtJm2JF2UfPnj3t17/+tU2YMMF23XVXO/bYY11QQfM1f/58u+mmm1zfgfp44071sV6zPstB8FA9rC/8Tz31lOsXybS0MpAffvjBrr766vUdMUEfiFKm/fff38rKytan+MpGVPjBY/XHqezjrLPOcp3sqeIbTDSUX/3+8Ic/uM+r6EvQT3/6UzfsMSg33SqAqF35mWeesWuvvdadl4ceesjee+89/6hp8PmLpr7y06ilK6+80lXM0r9/fxs5cqT7glxQUODONbR0yi/4onPEEUe4Y420euedd9xgpqOOOsp23HFHNwpLmiQD+eCDDzboxX/77bddxnHggQdanz59rG3bti7bUIDo1q2b60APFBUV2XPPPReLtB9IRn9QL730Usodi7U7JtG8qEN6l1128Y/Mvv76a/vnP/9pf/7zn+3BBx+0L7/8MlZ1mZqq5s6d6z7H+qKjZivR+1DgCyYSZlJaAeSLL77w98w+//xz98IU7fTNLVmkHDFixAYd53q83lTUnn+gISjD1lD0VCuF4MsUmi/1J6hzWp+JYFPGqqZPVdSXXnqpy0w12ikO9JlUdrF06dL1n2NNJmyojCnlAKIX89133/lH5iKd2oPVrpYYJBKpOUujAQLqgHzrrbfqbGsGgDhR3TZu3LiN6rigctYXjldeecV947/++uvtjTfecK0zTSl4bY0h5QCib2dBW6BoCK+G5qpnvz7KTgJq2vr000/JQABkDTX/1FcpB/epA1v9Dmriuvvuu+3jjz9u9llqygGk9pwPRVkN1d3UsFwN6w2oj0RDIINOSwCIO9Vh6UyGVkBRE/+9995rF198cSz7SzIl5QBSOy1T770KVu1r9UkMMNpXlKbtGEA26d27d51N9ckoWKhfWF+WP/zwQ9dfctVVV7lBGmrNaS5SHsar4YoagRC4/PLL3WJc2267revrqItWfnziiSf8I7MrrrjCDS3TkLhU1O6cV2eQRnzFxWOPPebvxdNee+3l78VTU5Wfvsz06tXLTbwKMmLNadKowj333HP9Om4qP1Ucm2++ud12221uGHtA4+s18kWdrE2Fz180qZafRpxqCGzULCKoz3r06OG6ADQ8vL41A9MZxlsXDUvXcHX1QQfDzjM1jDflAKIp8YmFrXa+F154wUaNGlVvZFaweOSRR/yjdYFHHU36g0xF7QJUn8ovfvEL/wgIp0OHDi5Y6FthEEDU5DB8+HAbPHjwBpmzPoP6I5wyZYobdRO45ZZb3ECSVD/LQG2a3vCrX/2qzjq02QSQ2oHgsssuczMeNammvjdZO/Bccsklbo0WRd5U1P7ZajZLnF/S1PRtNc4Ss784aqryU3/cbrvt5r7QBAFE67tp3P/YsWPXD3tU+emPWxO0zj33XJdBBzRRdrPNNnP3NRU+f9GkWn6LFi1yQ2MzSavkaoSXvrTUpdkEEM04V2dQQDM0lYEoENT3JhVkNI1e1PehAKI3oW95qchEATakFIuvyVB+9Uucif73v//drZRw0EEHrR9dqPJTP5+aG1QZXnPNNe68qAlrzpw5/lHT4PMXTarlp+Z61Vthy1ufIdV/Wq1jzJgxtuWWW7ovMZuSifJryACScq9Q7YkomtWoP7xNFWjikN1gOZPE5gGgKSX236kvQ0PVEz/T+gPW8HNlJel0oqJ50UWY1N+VjqDyVx+HgoaWWD/ttNNcs2cqwSMbpPwXUXsYm2aVa8GuTRVq4iJkWvpBP2dTI7eAxpLYgakAohEyiaME9Y1RF+ZR81VcZhujcelLhQJIOtmAHjtw4EC3zJP6ODSYoCmbOhtKygEkcT6H6Pj777/fYHJhMonrBWkuiUa+1DdqC2hMiSvqqj9DQSLxM63mrD/96U8u+0hswkXLoTkdm2ppCYKLVuZQsFDQOOyww9zy6c35C3PKAURtwomLcamgtLRJfQFETVxa8iSg9mINwaUJC3GhjsyAPtMaqpk45+mPf/yja4ZVB3vU60cjO2kqQrLsI2jSVL2ozvCTTjrJTjjhBLe/qRU6GotedzqZU7pSDiAqrMS5G5qFrqn69a1rpdmXQQelaDVLdR5p6BoQB1qmIpFGxGg+iBbL0wSwp59+en3wUIdjpkfiIN70JXn27NnrM5CgQlYrihaL1WKyZ599trtgXuKyTU1Br0tdC5r0qC/qwaams2RzldSvrfv0eHWwh5FyAJEhQ4b4e+uGQeoCUXUtHKYC1yJjAf0S1L48fvz42ERnQJ/jbbbZxj9a90VJ/Xb/+Mc/3FUHP/roI/dZ1qJ5t99+e1ZcWAiZof5djb5KpC/Rutb4Oeec42513JDf8NOhTEiXtL3zzjvdnKZgu+GGG2yHHXbY4HUGCYEWgNTjzz//fLfwbbrvJa0Aojkfif0XmkSoIbq1U3v9wWmJYw0VC2juhx6vSVc0YSFOJk6c6EZaJcumVYkoG9HwXV3LRkMiAyzJ07xp3T7182rSqT4jv/zlL+3www93rShxrMPUsqM6Vv3TGq6rS2do/p4mbmsVEV16PKBgoStrqpVI13lSP83JJ5+c9qoKaV2RUPSCFJWDSKUmKnU+brXVVi4CqqNcLz5x6Xcdawy9Jh8q5UvnRcYlutclzeJrdJRfanT1Oa2gqm9sCgz6oqSMWX90weVBdU7zl9RMoM93U88BET5/0dRXfrpP9ZkCSFNJp/xUryor0kTr4MqD6dI8PWXbqUo7gIjWvldkTuXNaQSDLv25xx57uFm/am9Lp1CoAKOh/FKnIKLhmlo9YdasWa65Skv2JL5Gpf4qU51Ld15AQ+DzF01zKz99uTn44IPdaFf12aXz/jRiVs1d6QgVQNTvoWwiSO+SUWej/hC1CJkWXNTjNWs93SFtfACjofzSpyZZZdYKEJoHEmd8/qJpbuWnxysTUXNW7TlNm6KySLc8QgUQ0bezJ5980i0opzRPzVd68foWp0imFF/XRT/kkEPconUatRVm/gcfwGgov2gov2gov2jiXn6hA4jom5qChYbz6kqDSv81L0STszR8TB066nTUSJdgzHS6+ABGQ/lFQ/lFQ/lF06wDSEDpvtrbFDz049RMpVEKWiYiagHwAYyG8ouG8ouG8osm7uWXkQDSkPgARkP5RUP5RUP5RRP38gvXrgQAaPEIIACAUAggAIBQ1MAW70bAda8RIY0dOzbuv99Ye+vtt/09hNEq5n0McRf30iMDAQCEQgABAIRCAAEAhEIAAQCEQgABAIRCAAEAhJKRAKKrDOpKXVtvvbV/BgDQ3GUkgOhyoAMHDgx9YXYAQPahCQsAEEpGAkjcV7QEAGQeGQgAIBQCCAAgFAIIACCUjAaQuF89CwCQOWQgAIBQCCAAgFAyEkAYxgsALQ8ZCAAgFAIIACCUjAYQRmEBQMtBBgIACIUAAgAIhQACAAglIwGEYbwA0PKQgQAAQiGAAABCyWgAYRgvALQcZCAAgFAIIACAUAggAIBQMhJAGMYLAC0PGQgAIBQCCAAglIwGEIbxAkDLQQYCAAiFAAIACIUAAgAIJSMBhGG8ANDykIEAAELJUfYQdZs2bZr7YUcddVTS+6NsANBSaWRrnLeMZCD6QQCAloUmLABAKAQQAEAoGQ0g9FkAQMtBBgIACIUAAgAIhQACAAglIwGEYbwA0PKQgQAAQiGAAABCyWgAYRgvALQcZCAAgFAIIACAUAggAIBQMhJAGMYLAC0PGQgAIBQCCAAglIwGEIbxAkDLQQYCAAiFAAIACIUAAgAIJSMBhGG8ANDykIEAAEIhgAAAQsloAGEYLwC0HGQgAIBQCCAAgFAyEkAYhQUALQ8ZCAAgFAIIACAUAggAIJSMBhCG8QJAy0EGAgAIhQACAAglIwGEYbwA0PKQgQAAQiGAAABCIYAAAELJaABhGC8AtBzq/Y5c6w8bNswOOugg+/DDD+3+++/3z2aGF5R29ncRwoknnvicv4sQbvjrDf4ewqhpxZfKSGJefDRhAQBCyUgACZquGM4LAC0HGQgAIBQCCAAgFAIIACAUAggAIBQCCAAgFAIIACCUjAQQhvECQMtDBgIACIUAAgAIhQACAAiFAAIACIUAAgAIhQACAAglIwGEYbwA0PKQgQAAQiGAAABCIYAAAEIhgAAAQiGAAABCIYAAAELJSABhGC8AtDxkIACAUAggAIBQCCAAgFAIIACAUAggAIBQMhJAGIUFAC0PGQgAIBQCCAAgFAIIACAUAggAIBQCCAAgFAIIACCUjAQQhvECQMtDBgIACIUAAgAIhQACAAglR/0XUbfHH3/c/bA999wz6f1RNgBoqdSvHOeNDAQAEAoBBAAQCgEEABAKAQQAEAoBBAAQCgEEABBKRgKIhnMJw24BoOUgAwEAhEIAAQCEQgABAIRCAAEAhEIAAQCEkpEAwigsAGh5yEAAAKEQQAAAoRBAAAChEEAAAKEQQAAAoRBAAAChZCSAMIwXAFoeMhAAQCgEEABAKAQQAEAoBBAAQCgEEABAKAQQAEAoGQkgDOMFgJaHDAQAEEpGAkhubq67ra6udrcAgOYv5QCyYsUKu+OOO+zGG2+0e+65x5YvX+7fU7833njDpk2bZjfffLN9/PHH/lkAQLZLOYAoy5g9e7bNnTvXPv30U7vwwgvt888/t7Vr1/qP2Jgykmeffda++eYb++677+yqq67y7wEAZLuUA0hxcbH179/fPzJbvXq13X///S4zCQSd6YEvvvjCysvL3b6CycMPP+z2AQDZL60+kFGjRvl7Zp06dbLnnnuu3qasmTNn+ntmX375pS1btsw/AgBku7QCyODBg9d3mIv2P/vsM6uqqvLP/EjnlIEEPvroIxs3bpx/BADIdmkFkLy8PBsyZIh/tC6gPPPMM7Zq1Sr/zI/UPxI0X1VUVLhgMmnSJHcMAMh+aQUQGTNmjL9n1qFDB3vttdfWB5DEPpAPP/zQ3zPX6V5QUGATJ070zwAAsl3aAaRfv35WWFjoH5nbnzVrluskV5CQyspK17QVUDDZfvvtrUePHv4ZAEC2SzuA5OTk2JZbbukfmWvSevHFF12fh5q4RMFDQUQ0SkvDePfee28rLS115wAA2S/tACJjx47198zatm1rM2bMcPNB2rRp484lNl+p87ysrMy22247NxQYANA8qNMirRUQ27dvb6eccooLHEHfx5tvvmm9evWynXbayXbffXe77rrr1o/MuuGGG2z+/Pmhlzmpqam5wN9FCF75/4+/ixBOPPEEfw9h1NRsODcM6Yr3ArVpZyBqkpo+fboNHz7cP2M2dOhQN0u9T58+br5HEDy+//57N3OdNbIAoPlJO4AoOGhZksQlTNR0tWTJEmvXrp0bcRXQRMLas9MBAM1DqD4QzSh/6qmn3Gz0QPfu3e2DDz6wr7/+2h3r2iDqGwEANE+hAoiasTTyatCgQf4Zs80339ytvBs0X6lJa+nSpVxkCgCaqVABRM1XCxYssIULF65vomrdurXl5+e7fVE2krjsCQCgeQkVQCRoxurZs6d/Zt2KvaIsREN5yT4AoPkKHUA0hFfNWImz0gOaSKjl3uu7VggAILuFDiDKLtTPcdFFF7nFEoNgof4R9YVoxnoydZ0HAGSXtCcS1qZ+jhEjRriAoiG8a9as8e9JTo9PZ16I93OZSBgBEwmjYSJhNEwkjKqZTSSsTcFAo600A32fffbxz9aNSYUA0DykFEDUz6HOci1X0rVr1/WLJgYUFEpKStxEwoCaqrTcu56jVXg1SgsA0HykFEB0Yag5c+a4Geha1yqY61Ef9YksXrzYPUfLmSS76BQAIHvRow0ACCUjAYT5HgDQ8pCBAABCIYAAAEIhgAAAQsloAOHaHwDQcpCBAABCIYAAAELJSABhGC8AtDxkIACAUAggAIBQCCAAgFAyGkAYxgsALQcZCAAgFAIIACCUjAQQhvECQMtDBgIACIUAAgAIhQACAAglowGEYbwA0HKQgQAAQiGAAABCyUgAYRgvALQ8ZCAAgFAIIACAUDLahMUoLABoOchAAACh5Ch7iLq988477oeNHj066f1RNgBoqdSqE+eNDAQAEEpGAogikZAxAEDLQQYCAAiFAAIACIUAAgAIhQACAAiFAAIACIUAAgAIJSMBhGG8ANDykIEAAEIhgAAAQiGAAABCIYAAAEIhgAAAQiGAAABCyUgAYRgvALQ8ZCAAgFAIIACAUAggAIBQCCAAgFAIIACAUDISQBiFBQAtDxkIACAUAggAIBQCCAAglIz2gQAAWg4yEABAKAQQAEAoGQ0gDOMFgJaDDAQAEAoBBAAQCgEEABBKRgIIw3gBoOUhAwEAhEIAAQCEktEAwjBeAGg5yEAAAKEQQAAAoWQkgDAKCwBaHtX8kTsuOnbsaKeeeqotWrTIrr76av9sZtTU1Lzg7yKEt99+e0d/FyGMHTvW31un9pel2v1+TX1/bbUfX1tDPx/NG01YAIBQCCAAWhxlTm5bu3b9PtKXkQBC4QOIM9VRVZWVtmDed3bjn86xvYYUeFu+7TXUv/W2sw/byT5691WrqCi3tV5gwaaRgQD1UB9A4hZ8Ww22pr4fdVMQWLJogb3y9EN20j4jbd8tiu3IHfvZP6Zd5t27cdl9+NbLdtYh29v+I0rsoK272D9vv8YWzZ9r1dVV/iNQGwEEQLOhoPH15x/avX+92AWBn2/bwy465QD75ouP/EekZuWypXb9/51hU3boYz8b29Funvobm/Xxe14wqfYfAcloE5a+IQFAY1I/xgde9nDnNRfZz8aU2S+8bOPWy85zQSATylevtAduvsROmbyV+/l/u/r39sGbL/n3tmxkIACyRtB0t3Zttc1880Wbdul5tt+IEvvVYTt5Ffv/2hqvsm9I5WtWeYHq9/arKTvbvt7/e+c1F9pnM99ymU9LbFJUyhD5XZeVldnpp59uixcvtquuuso/mxneL4V5IBEwDySauM8D2ZTaz69tUz+voZ+fKv2c6qoqm/3FRzb9wdvtyQem2eqVy/x7m15Zp2626+TDbe9DT7DO3XtbTk5u2r+rbEQGAiCWgqAx5+vP7doLTrVjdx9ip0weaw/ddmWsgocsWTjPHrjpEjt610F2+s+2sTuvvcgWfz/P1lZXZyyIxhEBBECsqKP6hyUL7b4bptrpB4y34/YYao/efb0tmDvbf0S8qbP9zqsvsCN26mfnHrW7Pf+ve2zl8h+aZSAhgACIhVUrltkLj91nZx26g03ZvrfrCJ/18bv+vQ0nJ6eV5eXluvb8TFL2NPONF2zq2Ye7zOSCX0y2T99/w8rXrPYfkf1UZpHDIn0g8UUfSDRbbbWVv7dO7W+R6fZZNPT9tdV+fG1N/XzNsVgw5xu769qL7M0XHnOZR0MoLCiwfn172E4TxllJSZE7p5deXFxsnTuVWV5urpVXVNisr761Bx6abvMXLHKPyTSVl/pIdvuvo23Pg46xjl16bLIM40yvvP7fcArat29vZ5xxhi1ZssSuvPJK/2xmeB9AAkgEBJBoCCAN8/zKinI39Pa6C0+3ObM/d30FDaV3z67227OPd4FiU69X1IQ248PP7fJr77CVKxsuW8gvKLS+g4bbKf97rW02bLTl5uX592QPmrAANCr1ZRyz22D77dF72LdfftKgwSM/P8/O+eUx1qVzh5SCh+R62cioEYPt7FOP9M80DAXRLz58x844cFs7Yuf+9vF7r/n3ZA8CCIBGNfPZh2zN93P8o4bVyvtXVVW1yUyqNgWbFStX+UcNrcbWLJpnj175G/84exBAgHqo4kncVLEkbnG7v/ZW+/G1t2TPSdySPSdxS/acxC2ZZQvnWY82hda3pMCKc1PLCsKqqKy0s357qd121yP23sxPbekPyze5UKJe98LFS+3O+x71zzQcvf9+JfnWyysPVcZ1lVlc6bcX+RXTBxJf9IFEwwWloj0/mQcuOcteuv+v/pHZmqpqW7imylZVp/+zwiguKrRRWw62zp06WNvSEisoyHfnSloXu85zBZr3P/jMf3TDKMlrZZ0K86wwL9c/Y9ZryGg769YXLCcne77Xk4EAaFRVlRX+3jpFXiWqb+B9vW/ipV7F2tBWrym3V9+YYQ8/9rz97d5H7ZY7HrJrb7zXpl55q9129yMNGjza5udYvzYF1rOkcIPgITVa9TdEQG5KBBAAjaq6stLf25Aq1O5exdrfq2A7FGxYuWYzhcROhbk2oLTAurUusILc5NWuRn+FyeiaUkYDyKbSXSDb6DOduOkPPHFr6vuzUe0MpLZ8r4LtWJRnA0sLrYt3m60UArsVe++jbaGVFeZZ3iaaprJx2RMyEACNqrqq/gAiCpa5Oa2svVfxbuZVwD1b51t+lnw/LfZed+/WeTbAe91tC/Isxw/+m1KzVsOZCSAAUKdWrdKrdlQBl+TnWj8vI1H/QZu8HNcsFCd6R2X5Oda/tMB6e6+zOD8vpaCxgSxswMlIAMnWVBpA48vNz/f30qMKWf0H3b1sRBV1p4Jca4Q+93oVeDVo9+I87/UUWufWBZYfYQRVuoE1DrLvFQONKLG/QZsqscStqe/f1Fb7+bW3ZM9J3JI9J3FL9pzELZncvHABJKCfq/6EsqI8l5X09gJK61zv//Pvb2iqNNt6WZA6+/u2KbTSgjzX3BZVK+9n1FVmcUUAAdCoogaQgCpbNW8V5+daz5ICf/RWToP1lRR5FXxXL2gp++mqPhkvG8pkhb8uAyGAAECdkgWQbj262ennnW7Hn36cjdl6tBUUFPj3pMZlJW70Vr6XFRRYL6+Cb5MXPStRE1l7Lyip76W3t7UtyPWyjcwGjoALINkVPzIbQLIt/QLQ+JL1gRxw+M+8INLVBmw+wNs/wM6fep5tv+v2/r2pc1mJV8G39rKS7q0L3NyLLkW5VpTmkima8KcgpMDR2QtK6nvRz27IOq6VAhMZCNB8BJVGsG2qD6Cx789GyTKQ7j27+3vryjzfCzKTfrqn/fzYQ/2z6dPPUbbQvjDfevtNXJrQp47vZNp5QaNbUZ5t5k/4UxBSMNLPiapzt8625+Q9XYCsSyb+n8ZGAAHQqJIFkEULN76AkyrULUZvYWPHb7geWRguKHlZRAcvm+hXWmQDvSDRozjfunmbOuEVNLp6QaNtYV7G16KafMhkO+O8M2zH3XawY089xr2nZFrl5GZdEMlISWXrNyEAjS9ZAPlk5if+3oZUoU7ca1f/KHOUmbQpyHV9GuqEb4gFDPPy8uyYU462n0wY5/38dYFB/89BRx7o7qvNXVCqJQYQAEhVsgDyzOPPurWgkmlX1s7alLbxj7JDUXGRnfk/v7RBQwdtlFWoea5n357+UaJ1zZTZhAAC1KN2n4P+wBO3uN1fe6v9+Npbsuckbsmek7gle07ilkxOkgBSvqbc3nzlraTP0f/Ttn1b/yg7HHb8YVbWocw/2pDe4/IflvtH2Y0AAqBRFRS19vc29M97/2mzZ83eKIjoeFWjXR0wOmVLAwfV3Vm+cvlKW7xwsX+U3TLaB6JvCgBQn6KSUn9vY3+9/Aab/uh0W7li5fp6ZfaX39jSxUvdfjYYssVgN6s8GV0N8ZEH/uUfZT8yEACNqqik/uaoZx9/zi769f/Zf5/+O/vdL//H/nrZj1cvjD0vboz6ySj/YGPPPfG8zXh7hn+U/QggQD0S2/u16Vtx4tbU92ej0larrX1BlbdX/7XJ1aleWZH84lNxlZuTu8GcloB+V7O/nO2yq42ttTKvPIa3L/ePswcBBECjqlw616ssK214uworzMm+a2DUp3pttc35dq5/tC5wqNnqqUeetusvrZ1J1VhpXrWN9ALHMK88cltlXzkQQAA0qvJl6yYNti+ssTEdK2xASYXlumykGQQS7y1oMMCyH5a5wLFw/kKbdu2t9vyTz/sPkBor8gLn0LblNqKswtqkt+xXrBBAADSqtQmXtFVfc/eStbZVp3Lr07rSWjWDQLJowSK75HeX2MX/PdUuu+hy++KTL/x7aiy/1VobVFphoztUWIciNVH6d/myrVkyJ2hLjbLNmTPH/bAePXokvT/KBjSl4DOY+FlUX0Rw29T3B7Sf7FjPS3xu7eNAQz0/mbXVG1/SNs/7Ktu7TbVt1bHcuhVVeYFk4/8jm1RVVduypcu8AtNRjZdh1diANhU21nt/XYrXWrKJ7zVexuI/Yb2gHOO6ZSQD0Q8CmiN9tlVhxvU2G62tqrtjvCDXbGDbKu8b+hprl6eO9uwOJDne6+/tZVZjO66xbl7gyK2nxl1bWe4HkexBExZQj1Qq8aa8DTYdJ56Ly3EyNQlNWHUpzjMbXlZpo8vWWElu9nW0eyVgXQvXBY7eJdWW7wVGr1jqVbPWe591lFlcEUCAegSVYVxvs9Ha6tSG5npv0Vrnm43sUGFjvIxEHc95+XnWqUsn69Cpg/+oONHvo8ba51fZOC9wKJNSRqX3kYqamuzKPiSjASRbP9BAXeqrvONyG+zH8TiZ+pqwktGPUUaiEVtn/uo4O/N3v7Sz//csO/a0Y9O+cmHDqbE2edW2dac1bkhuKhlHbWq+8krPP8oOZCBAPYJKMa632Wht1aabsJJpXdbBynr2ce9d22aDB9qvLzrHiloX+Y9oCmvdXI6xXoY0skOlGwzgvbRwamjCApqVVCrxprwNNh0nnovLcTKpNmHVVrlqpZtbkah1SWs74oTD/aPGFEwCrLAtO1RY0caX90hbtnWgCwEEqEdQGcb1Nhul24QVqKootzkz3vKPftS5Y6kNbRd0tje0GmubX2Vbtl/jAkebgsz9DlwAybLfKQEEqEcqlXhT3wb7cTxOpiZkBiIzHrnXls3/cakQZSTvPXSXdSiscZ3tw7xA0rqBAomGFY9oX25btK+00gbpesm+LwQpBZA1a9bYypUr/aPwFi1aVOdVx4A4CirFuN5mo5y88LWvvqX/e9rVNv/zj6xizWp7+/5bbem3X7n7vCKxMi+QjNogkEQtIzVVrcs4NKy4rZdx6P9pCLomeoP98AaSUgB59tln7YorrrBXXnllozbIVKxatcoeeughu+aaa+yTT5Jf+xiIo1Qq8aa8DTYdJ56Ly3EyOfnROr2rytfYm3fdaE9d/Fub/8lM/+yPvP9+fSBRxtBm/YTEVIPJuse2dYFD61Up49B7W3dvQ8nJzXdll01SCiADBw60qqoqmz59ugskL7/8sq1YscK/d923NKn9gVHG8cQTT7jnvP/+++5x/fv39+8F4i+oDON6m41yCxpn1JRXRC5j2NILACPLyq19frW/REpd5eaVq7dpHsco7/FbNFLgCLTKVU98dgWQVt6HcJOfQmUdl1xyiWvKkuDD26lTJ+vbt68VFRW57KSwsNDGjx9vixcvtq+++sqWL19uOTk57vm63WyzzezQQw91PyMNL/i3COHtt9/e0d9FCGPHjt2o0o7brWhf4nqc6M2rTrCvnrrZP2o8eilrqs3mrc6179fkWWWNXqM2LXJYY52LqqxbcbUVNVFLUrv+I223K970MhHvBfiCcoyrlDIQVf5bbrml5fpvLPhQLFy40N5991179dVX3bECzIsvvmgzZ850wUOCJi/1fYwcOdLtA9lCf8D6vMf1NhtFbcIKyysyNyGxf2m1jelYbsPalVvXokp3q+N+bard/XpcU8j1yqVVslUWYyzlVztq1KikHeAKEEGQ0Ida+8k+2MpOBg8e7B8B2aG+yjsOt8Gm48RzcTlOprBtR3+v6WjCn/pJNmtb5W4jTQDMFO//V9llk5QDSPfu3a1jx/R/8foQKXNJzGCAbBFUhnG9zUYdNh/n7yFR6859/L3skVa+NHr0aPfBTYceT/MVslUqlXhT3wb7cTxOptuY3a3X9gf6R9mhbbee1nv01tZ3q+0stwHW32o/YLSNO+1G/yh7pBVAlEXow5EOPb5du3bWs2dP/wyQPYJKMa632SgnN8/Gn3O3bXH4RV4Bp1UFNbqi0nY27ufH24Tjz7SR+x1iI/Y+wHb6f7/1782Mntv9zHb988uW37rUP5M90vrtlZaWumG4+vCmSh3wYTIXIA5SqcSb8jbYdJx4Li7HddFjhh38G9vpD89YbnFmK8784hJrlYHmcmUdO53yG+s6aJirxwKFrUsyFviGT7nAtv313Y02tDnT0i4FBYOg0zwV+hApcwGyUVAZxvU223UZsYPtfdNn1mXURP9MNNsc/gvb45yLbNJvp9r4o06xjgM29+9Jj5qpfnLYCZZXUOif+VH5qpVexZb+hOpEuUUltvPFL9jwQ85fNwM9S6UdQIYOHZrWGvy9evWysrIy/wjILqlU4k19G+zH8TgVRe262I6/f9zGnPJX/0w4HfoMsE5+wFDG0LHvQNtmykleFvFbKyhJL8vpPXq8FdbxnMry1f5eOF1GTrR9b/3GOg+f4J/JXmkHkLy8PBs+fLj7BemDsinKWIBsFVSKcb1tLjT/YbM9j7P97phrecVt/bPp6Tly49FdKqc2HTvb1lNOTPmbvh43eOc93XOTKS5t5++lb9wZt9iOFz5uBW3a+2eyW6iGPM0JUTNWXQUcUJAZNmyYfwRkn1Qq8aa8DTYdJ56Ly3G6isq62uS7F9jQg8/zjtLrN61vdFTbrj1s2G77+Uf1K+3aPWnT1Y/S788t7TXE9r1jjvWfeKQLls1FqHfSp08fN7KqPvoQDRkyxC1zAmSroDKM621zlJOXb1tMucAm3fipFXVIffTm3Jnv+nsbU3l17L9ZSpV3aefu7vHJVJavsVduvtw/2rRWufmuo3yPa963ovZd/bPNR6gAosLVvI66Cln04WbuB7JdfZV3XG6D/Tgeh6Xntuk2wPa+ZZYNmHSif7Z+S7772tbWc7mIVJdLX7FovnsPibSM/PdffW5PX/LftmLhAv9s/Up7D7VJf/3EhnnZVE5eXqTyiKvQuZSCQ+1CTqTMQ4snAtksqBTjetuc6T3metnI2JOvtYlXvGGtu9W/knflqhX29n3T6iyXvMJCy0mhH+SHOd/YdzPesuqqSvezlsz51p658vf2+u1/8QKUloavn7KOQfuf7mUd73lBsJ97H81VSqvx1uXGG2+0uXN/vDpYQEuWjBs3zvbYYw//TCSsxhsBq/FGE/fVeAM6luBcXI4zqWZttb138zn2+b+uMa92989urPuwUTZ8z8luEmCilYsX2gvXXWxrqzYdBETLq+cXFlmFF5hS1W7AKNv67DusnZd9BGURRSZ+RkOK1JszZswYf29DWrqEuR9oDvQHrMowrrctiZqgRh33Z5t46WvWtt8W/tmN/eej92z6Fb+3L15+1qor110+V01bs/79XMrBQ2q8IJVq8NAKwyOO/pPtfuVb1r7PMPf7aQkiZSDl5eU2derUjSYWdujQwU499VT/KDIykAjIQKLheiCZOc40NSV99tAVNuO287yDuoNCbkGhte3ey8qX/2CrvAykIXQctp1tfeZt1mYTTWxhBOUYV5EyEC3RromFiW9S+3VlJkC20edZlWBcb1sqrac1+L/Oskk3fGxlm431z26suqLclsye1SDBQ9d23+acu2yXi59vkOCRDSIFEKm9wKL2R4wY4R8B2S1ZpR2n22DTceK5uBw3JP0/pd0G2K6X/tu2Ofce13ndWHptf5Dt+7e51meHg73XEbkazVqR37lGWiXO9RgwYIC1bRtuJikQN0FlGNdbrMtG+kw40Pa/a4H12ekw70zDNfvkFZfaxCvfsvFe5lHYhiWaIgcQzTbXzHR9oLUx9wPNSSqVeFPfBvtxPG5MBSVtbZuzb7c9/jLT8ks7+GczQ81VY065zibf/b11GMjq4oGM5F7BnBAFE80+B5qLoFKM6y021q7PUNv/znk2+IBfu4o/Eq+c2w8ca/vfvdAG7nG8myWPH2UkgHTr1s26du3q+j7SWakXiLtUKvGmvA02HSeei8txU9GEwZFH/cH28wJJx2ETXCBIly4xu8slL9tuV7y+7hojIX5GcxdpGG8iDenVSr0NcN1zhvFGwDDeaLbaaqv1FWNcb0X7ErfjuJj33jP29jUn2cp5X/pn6pbXuq1bv2rzfU/x3k/TdpAH5RlXGSsdDeltgOABNClVhPojjvNtsB/H47joNmpXm3T9R15g+L3lFrXxz9bivd5+E4+2/f82zwbvd5p32LTBIxtQQkA9gkoxrrdInfovhh9ynrvmyKD9z/DPrrPZ3ifb5HsW2U/OuMlNPkRqMtaE1YBowoqAJqxoWAsr2nGcVa5ebnNe/af1mnCA5cX0muRBecYVGQhQD/0BqzKM6y3Cyy8utX67TIlt8MgGCm+x/hTG/Y9Ef8hxRvlFQ/lFQ/lFE/fyIwMBAIRCAAGAFkDZzIoVK9xWn4qKClu6dKlVpbD0PU1YEZECR0P5RUP5RdOcyu/xxx+3N954wzp37mwnn3yyf3adjz76yJ588klbtmyZO9YlN/bZZx/r3//HVYRXrVpl//rXv+yTTz5x/6+mZWiZqkmTJtU5RYMMBACy3H/+8x978803rayszGUQiWbPnm0PPPCA9e3b10488UQ7/PDD3aTvu+++23744Qf/UWb33Xefe+yBBx5oJ510kk2YMEGjOG369On+IzYWOYAoMnXs2NH69OnjNr0BAEDjULbw6KOP2rBhw6xXr17+2R+9+OKL1q5dO5s8ebJbdkorpv/0pz+1yspKe+edd9xjvv76axc8dt99d3eNJy1NtdNOO9mgQYPsrbfeqrM5K3QAUepXUlJiW2yxhZ1zzjl2zz332J133mmnnHKKS4/inhoCQHPw/vvv24IFC1zlX5uuFqvgMHDgQLfYbUCBRJfd+O6779zxl1+uW+JFASPR5ptv7oKHfn4yoQKI0p8ePXq4iHbDDTe4tEjR7IMPPnAZyHHHHeciHgCg4WgNQjUx7bDDDkmvw6QOcwURtRLVprp65cqVbl99I8XFxda6dWt3HAhalOrqeE8rgCiC6UXqkrXnn3++XXHFFa7DRm1pzz33nM2fP9+9EL2p6upq/1kAgIagelfrEI4fP94/s6EgQOgxtemcOs5Fj6vrMbJ69Wp3W1vKAUTBQ2nPlClTbNq0aXbwwQfbu+++65qtFDgS6UUpiAAAGsb333/vOs733HPPTS5kqywkmcTn1felP/IoLGUeRx55pF144YUumNx2223273//2/2n6sRZs2aN/8h1nTrpDD8DAKRHw3LV2d2mTRs3CkubMgXVydpXnRw0SSXWzwGdUz+2qPmqrsdI8LjaUg4gulCUrn/+4Ycf2r333rt++NeiRYtcE5bOAwAax7x581ygUD90sH3xxReuv0L7r732mgsgGtC0cOFC/1nr6Au+zrVv394dKwipHzuYJxJQ/S519WmnHEAUiTRJZcaMGe5YTVRPP/20/eUvf7Hly5fbtttu684DABqe5mqcdtppG2yDBw+20tJSt695HPn5+dazZ08XWBKH4s6aNct1NWiUlWiOiHz66afuVhRkVN936tTJjaxNJuUAosikobqa0fjtt9+6wPHKK6+4Tpbjjz/eZScAgMahrEGjpBI3tRSpi0H7Gi0r22+/veskD1qKXn/9dXvwwQddn7amYYgCiY41ouvVV191j9PEwrlz59rEiRPdY5LRZI2UOyuUCgWpTtBJruFhF110kXXv3t11qovGFquPRI+LKu59Kc1pKYSmQPlFQ/lF09zKTwFAlf4RRxzhn1lHUyxeeukl1yRVVFTkAoYCQ+KwXTV9PfXUUy5bUd3dpUsXF3yGDBniP2JjaQWQZPSfqGNd0YsAEj+UXzSUXzSUXzRxL7+Um7AAAEhEAAGAZk7NUpdffrnrelBWc8stt2Rk5CwBBACaOQ1yUj/1888/7xZQVEe7Fl+MigACAC3AXnvtZe+9955b/mS//fbLSP8PAQQAWgAN8dWmmerBEN+oCCAA0AJoiO6IESNs5MiR7uqFmUAAAYBmTtcE0exzLfu+8847u6kWunRtVAQQAGjmtBjuUUcd5ZqwtHrI0Ucf7S7FERUBBACaAfVtLFmyZP01PhJpLSvNOtcyVNq0Xlayi0yJlon/6quvbPHixf6ZuqkbPtJUR2aiM5M1CsovGsovmuZUflolXc1SWgdLiykm0qU3NPoqWFBRmcg+++zj+kQCChj333+/W+U3oEvhHnjggUkvNiVkIACQ5TRRUCvp6gt97aCjBXC1cvo222xj5557rp166qnukuQPPfTQ+mXedcEpLZZbUVHhLlH+m9/8xl2yXNdKf+KJJ9xjkkk7gGgCSrDpKlW6rSuKb+p+AEA0arpSJT9u3DgXQGpT9qH+jl122cVlEmrO2nfffV3QCFqNPv/8c9d0tfvuu7vWJGUoGq2lyYZa0l2BJZmUA4gCgdaFHzVq1AablgNO1pamK1gNHz7cvQilQXo+ACCzdOEoXYlQo6tqU5PVnDlzXB2c+EVeQUQXk9IFqWT27Nnu/n79+rnjwIABA1ygUXBJJuVaXb34xx57rEuFHnvssfXbXXfdZTvuuKOLggFNUhk6dKjdfvvt9sgjj7irY2kqPUEEADJH12l64YUX3NLsWqa9Ni3RLsGVBxPpnK4TInqcOtlr93UEVyIMHldbWhmIsor333/frr/+erddd9117sJS11xzzforFYpSoD322MO1sd1000324osv2pQpU1zPPwAgM/SFXs1Wag1KJqj4k3WC62qFylxEj1OzVW3B84LH1ZZyAFGEUsbx8ccf+2fSozQouAgVACCab775xq2oO2nSpA2apxIFrT6Jl7MNqLNdQUT0uLoeI8Hjaks5gKgTRR0uDzzwgC1YsMBmzpzpjlPdNIRM11UHAESnpUm6du1qP/zwgxtppU37qqu1v3Tp0vVXHExW9yqrUKuSFBcXJ31MMKdEV6JNRmErrYHaSnPU1pZuNqEMJMy8EMaRR0P5RUP5RUP5RVNf+V122WW2fPly/2hju+66qxu6+8c//tH1SR9wwAH+Pevq46lTp7rL1Wq4ri6F+8orr7j5I5pHEtBlcJ999lk788wzk3ZBpB1AGhsfwGgov2gov2gov2jSLb+///3vbiL36aef7p8xN6lbkwN1LuhoV5/1gw8+aIcccogNHjzYzTzXoCcFnQkTJrjHaGCU+riVnRx33HHuXG0MiwKAZkzzP9SsNW3aNJdlaCXehx9+2A3t3Xzzzd1jNHy3f//+rqtB97/88st28803uyYxDYiqCxlIRHwDjIbyi4byi6a5ld+rr77q5mzoglGJ1OGuCYWLFi1yWYgCx7bbbusmewfUxaAmK63aq32N7tpuu+3clQzrQgCJiD/gaCi/aCi/aCi/aGjCAgCEQgABAIRg9v8B4hMOpI+XltsAAAAASUVORK5CYII=";
        }
    }
    FudgeCore.TextureDefault = TextureDefault;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    let LOOP_MODE;
    (function (LOOP_MODE) {
        LOOP_MODE["FRAME_REQUEST"] = "frameRequest";
        LOOP_MODE["TIME_GAME"] = "timeGame";
        LOOP_MODE["TIME_REAL"] = "timeReal";
    })(LOOP_MODE = FudgeCore.LOOP_MODE || (FudgeCore.LOOP_MODE = {}));
    class Loop extends FudgeCore.EventTargetStatic {
        static ƒTimeStartGame = 0;
        static ƒTimeStartReal = 0;
        static ƒTimeFrameGame = 0;
        static ƒTimeFrameReal = 0;
        static ƒTimeFrameStartGame = 0;
        static ƒTimeFrameStartReal = 0;
        static ƒTimeLastFrameGameAvg = 0;
        static ƒTimeLastFrameRealAvg = 0;
        static ƒFrames = 0;
        static running = false;
        static mode = LOOP_MODE.FRAME_REQUEST;
        static idIntervall = 0;
        static idRequest = 0;
        static fpsDesired = 30;
        static framesToAverage = 30;
        static syncWithAnimationFrame = false;
        static get timeStartGame() { return Loop.ƒTimeStartGame; }
        static get timeStartReal() { return Loop.ƒTimeStartReal; }
        static get timeFrameGame() { return Loop.ƒTimeFrameGame; }
        static get timeFrameReal() { return Loop.ƒTimeFrameReal; }
        static get timeFrameStartGame() { return Loop.ƒTimeFrameStartGame; }
        static get timeFrameStartReal() { return Loop.ƒTimeFrameStartReal; }
        static get fpsGameAverage() { return 1000 / Loop.ƒTimeLastFrameGameAvg; }
        static get fpsRealAverage() { return 1000 / Loop.ƒTimeLastFrameRealAvg; }
        static get frames() { return Loop.ƒFrames; }
        static start(_mode = LOOP_MODE.FRAME_REQUEST, _fps = 60, _syncWithAnimationFrame = false) {
            Loop.stop();
            Loop.ƒTimeStartGame = FudgeCore.Time.game.get();
            Loop.ƒTimeStartReal = performance.now();
            Loop.ƒTimeFrameStartGame = Loop.ƒTimeStartGame;
            Loop.ƒTimeFrameStartReal = Loop.ƒTimeStartReal;
            Loop.fpsDesired = (_mode == LOOP_MODE.FRAME_REQUEST) ? 60 : _fps;
            Loop.framesToAverage = Loop.fpsDesired;
            Loop.ƒTimeLastFrameGameAvg = Loop.ƒTimeLastFrameRealAvg = 1000 / Loop.fpsDesired;
            Loop.mode = _mode;
            Loop.syncWithAnimationFrame = _syncWithAnimationFrame;
            let log = `Loop starting in mode ${Loop.mode}`;
            if (Loop.mode != LOOP_MODE.FRAME_REQUEST)
                log += ` with attempted ${_fps} fps`;
            FudgeCore.Debug.fudge(log);
            switch (_mode) {
                case LOOP_MODE.FRAME_REQUEST:
                    Loop.loopFrame();
                    break;
                case LOOP_MODE.TIME_REAL:
                    Loop.idIntervall = window.setInterval(Loop.loopTime, 1000 / Loop.fpsDesired);
                    Loop.loopTime();
                    break;
                case LOOP_MODE.TIME_GAME:
                    Loop.idIntervall = FudgeCore.Time.game.setTimer(1000 / Loop.fpsDesired, 0, Loop.loopTime);
                    Loop.loopTime();
                    break;
                default:
                    break;
            }
            Loop.running = true;
        }
        static stop() {
            if (!Loop.running)
                return;
            switch (Loop.mode) {
                case LOOP_MODE.FRAME_REQUEST:
                    window.cancelAnimationFrame(Loop.idRequest);
                    break;
                case LOOP_MODE.TIME_REAL:
                    window.clearInterval(Loop.idIntervall);
                    window.cancelAnimationFrame(Loop.idRequest);
                    break;
                case LOOP_MODE.TIME_GAME:
                    FudgeCore.Time.game.deleteTimer(Loop.idIntervall);
                    window.cancelAnimationFrame(Loop.idRequest);
                    break;
                default:
                    break;
            }
            Loop.running = false;
            FudgeCore.Debug.fudge("Loop stopped!");
        }
        static continue() {
            if (Loop.running)
                return;
            Loop.start(Loop.mode, Loop.fpsDesired, Loop.syncWithAnimationFrame);
        }
        static loop() {
            let time;
            time = performance.now();
            Loop.ƒTimeFrameReal = time - Loop.ƒTimeFrameStartReal;
            Loop.ƒTimeFrameStartReal = time;
            time = FudgeCore.Time.game.get();
            Loop.ƒTimeFrameGame = time - Loop.ƒTimeFrameStartGame;
            Loop.ƒTimeFrameStartGame = time;
            Loop.ƒTimeLastFrameGameAvg = ((Loop.framesToAverage - 1) * Loop.ƒTimeLastFrameGameAvg + Loop.ƒTimeFrameGame) / Loop.framesToAverage;
            Loop.ƒTimeLastFrameRealAvg = ((Loop.framesToAverage - 1) * Loop.ƒTimeLastFrameRealAvg + Loop.ƒTimeFrameReal) / Loop.framesToAverage;
            Loop.ƒFrames++;
            let event = new Event("loopFrame");
            Loop.targetStatic.dispatchEvent(event);
        }
        static loopFrame() {
            Loop.loop();
            Loop.idRequest = window.requestAnimationFrame(Loop.loopFrame);
        }
        static loopTime() {
            if (Loop.syncWithAnimationFrame)
                Loop.idRequest = window.requestAnimationFrame(Loop.loop);
            else
                Loop.loop();
        }
    }
    FudgeCore.Loop = Loop;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Time extends FudgeCore.EventTargetƒ {
        static game = new Time();
        start;
        scale;
        offset;
        lastCallToElapsed;
        timers = {};
        idTimerAddedLast = 0;
        constructor() {
            super();
            this.start = performance.now();
            this.scale = 1.0;
            this.offset = 0.0;
            this.lastCallToElapsed = 0.0;
        }
        static getUnits(_milliseconds) {
            let units = {};
            units.asSeconds = _milliseconds / 1000;
            units.asMinutes = units.asSeconds / 60;
            units.asHours = units.asMinutes / 60;
            units.hours = Math.floor(units.asHours);
            units.minutes = Math.floor(units.asMinutes) % 60;
            units.seconds = Math.floor(units.asSeconds) % 60;
            units.fraction = _milliseconds % 1000;
            units.thousands = _milliseconds % 10;
            units.hundreds = _milliseconds % 100 - units.thousands;
            units.tenths = units.fraction - units.hundreds - units.thousands;
            return units;
        }
        get() {
            return this.offset + this.scale * (performance.now() - this.start);
        }
        getRemainder(_to) {
            return _to - this.get();
        }
        set(_time = 0) {
            this.offset = _time;
            this.start = performance.now();
            this.getElapsedSincePreviousCall();
        }
        setScale(_scale = 1.0) {
            this.set(this.get());
            this.scale = _scale;
            this.rescaleAllTimers();
            this.getElapsedSincePreviousCall();
            this.dispatchEvent(new Event("timeScaled"));
        }
        getScale() {
            return this.scale;
        }
        getOffset() {
            return this.offset;
        }
        getElapsedSincePreviousCall() {
            let current = this.get();
            let elapsed = current - this.lastCallToElapsed;
            this.lastCallToElapsed = current;
            return elapsed;
        }
        delay(_lapse) {
            return new Promise(_resolve => this.setTimer(_lapse, 1, () => _resolve()));
        }
        clearAllTimers() {
            for (let id in this.timers) {
                this.deleteTimer(Number(id));
            }
        }
        deleteTimerByItsInternalId(_id) {
            for (let id in this.timers) {
                let timer = this.timers[id];
                if (timer.id == _id) {
                    timer.clear();
                    delete this.timers[id];
                }
            }
        }
        setTimer(_lapse, _count, _handler, ..._arguments) {
            new FudgeCore.Timer(this, _lapse, _count, _handler, _arguments);
            return this.idTimerAddedLast;
        }
        addTimer(_timer) {
            this.timers[++this.idTimerAddedLast] = _timer;
            return this.idTimerAddedLast;
        }
        deleteTimer(_id) {
            let timer = this.timers[_id];
            if (!timer)
                return;
            timer.clear();
            delete this.timers[_id];
        }
        getTimer(_id) {
            return this.timers[_id];
        }
        getTimers() {
            let result = {};
            return Object.assign(result, this.timers);
        }
        hasTimers() {
            return (Object.keys(this.timers).length > 0);
        }
        rescaleAllTimers() {
            for (let id in this.timers) {
                let timer = this.timers[id];
                timer.clear();
                delete this.timers[id];
                if (!this.scale)
                    continue;
                timer = timer.installCopy();
                delete this.timers[this.idTimerAddedLast];
                this.timers[id] = timer;
            }
        }
    }
    FudgeCore.Time = Time;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Timer {
        active;
        count;
        handler;
        time;
        elapse;
        event;
        timeoutReal;
        idWindow;
        constructor(_time, _elapse, _count, _handler, ..._arguments) {
            this.time = _time;
            this.elapse = _elapse;
            this.event = new FudgeCore.EventTimer(this, _arguments);
            this.handler = _handler;
            this.count = _count;
            let scale = Math.abs(_time.getScale());
            if (!scale) {
                this.active = false;
                return;
            }
            this.timeoutReal = this.elapse / scale;
            let callback = () => {
                if (!this.active)
                    return;
                this.event.count = this.count;
                this.event.lastCall = (this.count == 1);
                _handler(this.event);
                this.event.firstCall = false;
                if (this.count > 0)
                    if (--this.count == 0)
                        _time.deleteTimerByItsInternalId(this.idWindow);
            };
            this.idWindow = window.setInterval(callback, this.timeoutReal, _arguments);
            this.active = true;
            _time.addTimer(this);
        }
        get id() {
            return this.idWindow;
        }
        get lapse() {
            return this.elapse;
        }
        installCopy() {
            return new Timer(this.time, this.elapse, this.count, this.handler, this.event.arguments);
        }
        clear() {
            window.clearInterval(this.idWindow);
            this.active = false;
        }
    }
    FudgeCore.Timer = Timer;
})(FudgeCore || (FudgeCore = {}));
