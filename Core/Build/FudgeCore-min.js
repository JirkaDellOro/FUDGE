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
        static {
            this.delegates = {
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
        }
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
        static { this.delegates = Debug.setupConsole(); }
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
        static getFilter(_target) {
            let result = 0;
            for (let filter in _target.delegates)
                result |= parseInt(filter);
            return result;
        }
        static addFilter(_target, _filter) {
            let current = Debug.getFilter(_target);
            Debug.setFilter(_target, current | _filter);
        }
        static removeFilter(_target, _filter) {
            let current = Debug.getFilter(_target);
            Debug.setFilter(_target, current ^ _filter);
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
    class EventTargetUnified extends EventTarget {
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
    FudgeCore.EventTargetUnified = EventTargetUnified;
    class EventTargetStatic extends EventTargetUnified {
        static { this.targetStatic = new EventTargetStatic(); }
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
    class Mutable extends FudgeCore.EventTargetUnified {
        static getMutatorFromPath(_mutator, _path) {
            let key = _path[0];
            let mutator = {};
            if (_mutator[key] == undefined)
                return _mutator;
            mutator[key] = _mutator[key];
            if (_path.length > 1)
                mutator[key] = Mutable.getMutatorFromPath(mutator[key], _path.slice(1, _path.length));
            return mutator;
        }
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
        async mutate(_mutator, _selection = null, _dispatchMutate = true) {
            await this.mutateBase(_mutator, _selection);
            if (_dispatchMutate)
                this.dispatchEvent(new CustomEvent("mutate", { bubbles: true, detail: { mutator: _mutator } }));
        }
        async mutateBase(_mutator, _selection) {
            let mutator = {};
            if (!_selection)
                mutator = _mutator;
            else
                for (let attribute of _selection)
                    if (typeof (_mutator[attribute]) !== "undefined")
                        mutator[attribute] = _mutator[attribute];
            for (let attribute in mutator) {
                if (!Reflect.has(this, attribute))
                    continue;
                let mutant = Reflect.get(this, attribute);
                let value = mutator[attribute];
                if (mutant instanceof FudgeCore.MutableArray || mutant instanceof Mutable)
                    await mutant.mutate(value, null, false);
                else
                    Reflect.set(this, attribute, value);
            }
        }
    }
    FudgeCore.Mutable = Mutable;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Serializer {
        static { this.namespaces = { "ƒ": FudgeCore }; }
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
                let message = `Deserialization of ${path}, ${reconstruct ? Reflect.get(reconstruct, "idResource") : ""} failed: ` + _error;
                throw new Error(message);
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
            let typeName = _path.substring(_path.lastIndexOf(".") + 1);
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
    function mixinSerializableResourceExternal(_base) {
        class SerializableResourceExternal extends _base {
            constructor() {
                super(...arguments);
                this.status = FudgeCore.RESOURCE_STATUS.PENDING;
            }
            serialize(_super = false) {
                const serialization = _super ? super.serialize() : { idResource: this.idResource, name: this.name };
                serialization.url = this.url.toString();
                return serialization;
            }
            async deserialize(_serialization) {
                this.url = _serialization.url;
                await super.deserialize(_serialization);
                return this.load();
            }
        }
        ;
        if (_base.prototype instanceof FudgeCore.Mutable) {
            function mixinMutableSerializableResourceExternal(_base) {
                class MutableSerializableResourceExternal extends _base {
                    async mutate(_mutator, _selection = null, _dispatchMutate = true) {
                        await super.mutate(_mutator, _selection, false);
                        if (_mutator.url != undefined || _mutator.name != undefined)
                            await this.load();
                    }
                    reduceMutator(_mutator) {
                        delete _mutator.status;
                    }
                }
                return MutableSerializableResourceExternal;
            }
            return mixinMutableSerializableResourceExternal(SerializableResourceExternal);
        }
        return SerializableResourceExternal;
    }
    FudgeCore.mixinSerializableResourceExternal = mixinSerializableResourceExternal;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Node extends FudgeCore.EventTargetUnified {
        #mtxWorldInverseUpdated;
        #mtxWorldInverse;
        constructor(_name) {
            super();
            this.mtxWorld = FudgeCore.Matrix4x4.IDENTITY();
            this.timestampUpdate = 0;
            this.nNodesInBranch = 0;
            this.radius = 0;
            this.parent = null;
            this.children = [];
            this.components = {};
            this.listeners = {};
            this.captures = {};
            this.active = true;
            this.appendChild = this.addChild;
            this.name = _name;
        }
        static PATH_FROM_TO(_from, _to) {
            const from = _from instanceof FudgeCore.Component ? _from.node : _from;
            const to = _to instanceof FudgeCore.Component ? _to.node : _to;
            if (!from || !to)
                return null;
            let pathFrom = from.getPath();
            let pathTo = to.getPath();
            let ancestor = null;
            while (pathFrom.length && pathTo.length && pathFrom[0] == pathTo[0]) {
                ancestor = pathFrom.shift();
                pathTo.shift();
            }
            pathTo.unshift(ancestor);
            if (!ancestor)
                return null;
            let pathToAncestor = pathFrom.map(_node => "parent");
            let pathFromAncestor = pathTo
                .flatMap((_node, _index, _array) => ["children", _node.findChild(_array[_index + 1]).toString()])
                .slice(0, -2);
            if (_from instanceof FudgeCore.Component)
                pathToAncestor.unshift("node");
            if (_to instanceof FudgeCore.Component)
                pathFromAncestor.push("components", _to.type, to.components[_to.type].indexOf(_to).toString());
            return pathToAncestor.concat(pathFromAncestor).join("/");
        }
        static FIND(_from, _path) {
            if (_path == "")
                return _from;
            let path = _path.split("/");
            let to = _from;
            while (path.length && to)
                to = Reflect.get(to, path.shift());
            return to;
        }
        get isActive() {
            return this.active;
        }
        get cmpTransform() {
            return this.getComponents(FudgeCore.ComponentTransform)?.[0];
        }
        get mtxLocal() {
            return this.cmpTransform?.mtxLocal;
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
            this.dispatchEvent(new Event(_on ? "nodeActivate" : "nodeDeactivate", { bubbles: true }));
            this.broadcastEvent(new Event(_on ? "nodeActivate" : "nodeDeactivate"));
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
        addChild(_child, _index) {
            if (this.children.includes(_child) && _index == undefined)
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
            if (previousParent == this && _index > previousParent.findChild(_child))
                _index--;
            if (previousParent)
                previousParent.removeChild(_child);
            this.children.splice(_index ?? this.children.length, 0, _child);
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
            _child.broadcastEvent(new Event("nodeDeactivate"));
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
            if ("components" in _mutator) {
                for (const componentType in _mutator.components) {
                    let componentsOfType = this.components[componentType];
                    let mutatorsForType = _mutator.components[componentType];
                    if (componentsOfType != undefined && mutatorsForType != undefined) {
                        for (const i in mutatorsForType) {
                            componentsOfType[i].mutate(mutatorsForType[i], null, false);
                        }
                    }
                }
            }
            if ("children" in _mutator) {
                for (const childName in _mutator.children) {
                    for (const childNode of this.getChildrenByName(childName)) {
                        childNode.applyAnimation(_mutator.children[childName]);
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
                throw new Error(`Component ${_component.type} is marked singleton and can't be attached, no more than one allowed`);
            else
                cmpList.push(_component);
            _component.attachToNode(this);
            _component.dispatchEvent(new Event("componentAdd"));
            this.dispatchEventToTargetOnly(new CustomEvent("componentAdd", { detail: _component }));
        }
        detach(_component) {
            this.removeComponent(_component);
        }
        removeComponents(_class) {
            this.getComponents(_class).forEach(_component => this.removeComponent(_component));
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
                name: this.name,
                active: this.active
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
            if (_serialization.children)
                for (let serializedChild of _serialization.children) {
                    let deserializedChild = await FudgeCore.Serializer.deserialize(serializedChild);
                    this.appendChild(deserializedChild);
                }
            this.dispatchEvent(new Event("nodeDeserialized"));
            for (let component of this.getAllComponents())
                component.dispatchEvent(new Event("nodeDeserialized"));
            this.activate(_serialization.active);
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
            Object.defineProperty(_event, "path", { writable: true, value: new Array(this, ...ancestors) });
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
    class Component extends FudgeCore.Mutable {
        static { this.baseClass = Component; }
        static { this.subclasses = []; }
        #node;
        constructor() {
            super();
            this.singleton = true;
            this.active = true;
            this.#node = null;
            this.addEventListener("mutate", (_event) => {
                if (this.#node) {
                    _event.detail.component = this;
                    _event.detail.componentIndex = this.node.getComponents(this.constructor).indexOf(this);
                    this.#node.dispatchEvent(_event);
                }
            });
        }
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
            this.activate(_serialization.active);
            return this;
        }
        async mutate(_mutator, _selection = null, _dispatchMutate = true) {
            await super.mutate(_mutator, _selection, _dispatchMutate);
            if (typeof (_mutator.active) !== "undefined")
                this.activate(_mutator.active);
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
        recycle() {
            this.reset();
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
        }
        static deleteProgram() {
            let crc3 = FudgeCore.RenderWebGL.getRenderingContext();
            if (this.program) {
                crc3.deleteProgram(this.program);
                delete this.attributes;
                delete this.uniforms;
                delete this.program;
            }
        }
        static createProgram() {
            FudgeCore.Debug.fudge("Create shader program", this.name);
            let crc3 = FudgeCore.RenderWebGL.getRenderingContext();
            let program = crc3.createProgram();
            try {
                let shdVertex = compileShader(this.getVertexShaderSource(), WebGL2RenderingContext.VERTEX_SHADER);
                let shdFragment = compileShader(this.getFragmentShaderSource(), WebGL2RenderingContext.FRAGMENT_SHADER);
                crc3.attachShader(program, FudgeCore.RenderWebGL.assert(shdVertex));
                crc3.attachShader(program, FudgeCore.RenderWebGL.assert(shdFragment));
                crc3.linkProgram(program);
                let error = FudgeCore.RenderWebGL.assert(crc3.getProgramInfoLog(program));
                if (error !== "") {
                    throw new Error("Error linking Shader: " + error);
                }
                this.program = program;
                this.attributes = detectAttributes();
                this.uniforms = detectUniforms();
                if (this.define.includes("SKIN")) {
                    const blockIndex = crc3.getUniformBlockIndex(program, FudgeCore.UNIFORM_BLOCKS.SKIN.NAME);
                    crc3.uniformBlockBinding(program, blockIndex, FudgeCore.UNIFORM_BLOCKS.SKIN.BINDING);
                }
                if (this.define.find(_define => ["FLAT", "GOURAUD", "PHONG"].includes(_define))) {
                    if (!FudgeCore.RenderWebGL.uboLights)
                        FudgeCore.RenderWebGL.uboLights = createUBOLights();
                    if (!FudgeCore.RenderWebGL.uboLightsVariableOffsets)
                        FudgeCore.RenderWebGL.uboLightsVariableOffsets = detectUBOLightsVariableOffsets();
                    const blockIndex = crc3.getUniformBlockIndex(program, FudgeCore.UNIFORM_BLOCKS.LIGHTS.NAME);
                    crc3.uniformBlockBinding(program, blockIndex, FudgeCore.UNIFORM_BLOCKS.LIGHTS.BINDING);
                }
                const blockIndex = crc3.getUniformBlockIndex(program, FudgeCore.UNIFORM_BLOCKS.FOG.NAME);
                if (blockIndex != WebGL2RenderingContext.INVALID_INDEX)
                    crc3.uniformBlockBinding(program, blockIndex, FudgeCore.UNIFORM_BLOCKS.FOG.BINDING);
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
                    console.log(_shaderCode);
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
                    let location = crc3.getUniformLocation(program, info.name);
                    if (location)
                        detectedUniforms[info.name] = FudgeCore.RenderWebGL.assert(location);
                }
                return detectedUniforms;
            }
            function createUBOLights() {
                const blockIndex = crc3.getUniformBlockIndex(program, FudgeCore.UNIFORM_BLOCKS.LIGHTS.NAME);
                const blockSize = crc3.getActiveUniformBlockParameter(program, blockIndex, crc3.UNIFORM_BLOCK_DATA_SIZE);
                const ubo = FudgeCore.RenderWebGL.assert(crc3.createBuffer());
                crc3.bindBuffer(WebGL2RenderingContext.UNIFORM_BUFFER, ubo);
                crc3.bufferData(WebGL2RenderingContext.UNIFORM_BUFFER, blockSize, crc3.DYNAMIC_DRAW);
                crc3.bindBufferBase(WebGL2RenderingContext.UNIFORM_BUFFER, FudgeCore.UNIFORM_BLOCKS.LIGHTS.BINDING, ubo);
                return ubo;
            }
            function detectUBOLightsVariableOffsets() {
                const uboVariableNames = [
                    "u_nLightsDirectional",
                    "u_nLightsPoint",
                    "u_nLightsSpot",
                    "u_ambient.vctColor",
                    "u_directional[0].vctColor",
                    "u_point[0].vctColor",
                    "u_spot[0].vctColor"
                ];
                const uboVariableIndices = crc3.getUniformIndices(program, uboVariableNames);
                const uboVariableOffsets = crc3.getActiveUniforms(program, uboVariableIndices, crc3.UNIFORM_OFFSET);
                const uboVariableNameToOffset = {};
                uboVariableNames.forEach((_name, _index) => uboVariableNameToOffset[_name] = uboVariableOffsets[_index]);
                return uboVariableNameToOffset;
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
            let uniform = _shader.uniforms["u_vctColor"];
            let color = FudgeCore.Color.MULTIPLY(this.color, _cmpMaterial.clrPrimary);
            FudgeCore.RenderWebGL.getRenderingContext().uniform4fv(uniform, color.getArray());
        }
        static injectCoatRemissive(_shader, _cmpMaterial) {
            RenderInjectorCoat.injectCoatColored.call(this, _shader, _cmpMaterial);
            let uniform;
            uniform = _shader.uniforms["u_fDiffuse"];
            FudgeCore.RenderWebGL.getRenderingContext().uniform1f(uniform, this.diffuse);
            uniform = _shader.uniforms["u_fMetallic"];
            FudgeCore.RenderWebGL.getRenderingContext().uniform1f(uniform, this.metallic);
            uniform = _shader.uniforms["u_fSpecular"];
            FudgeCore.RenderWebGL.getRenderingContext().uniform1f(uniform, this.specular);
            uniform = _shader.uniforms["u_fIntensity"];
            FudgeCore.RenderWebGL.getRenderingContext().uniform1f(uniform, this.intensity);
        }
        static injectCoatTextured(_shader, _cmpMaterial) {
            RenderInjectorCoat.injectCoatColored.call(this, _shader, _cmpMaterial);
            let crc3 = FudgeCore.RenderWebGL.getRenderingContext();
            this.texture.useRenderData(FudgeCore.TEXTURE_LOCATION.COLOR.UNIT);
            crc3.uniform1i(_shader.uniforms[FudgeCore.TEXTURE_LOCATION.COLOR.UNIFORM], FudgeCore.TEXTURE_LOCATION.COLOR.INDEX);
            crc3.uniformMatrix3fv(_shader.uniforms["u_mtxPivot"], false, _cmpMaterial.mtxPivot.get());
        }
        static injectCoatRemissiveTextured(_shader, _cmpMaterial) {
            RenderInjectorCoat.injectCoatRemissive.call(this, _shader, _cmpMaterial);
            let crc3 = FudgeCore.RenderWebGL.getRenderingContext();
            this.texture.useRenderData(FudgeCore.TEXTURE_LOCATION.COLOR.UNIT);
            crc3.uniform1i(_shader.uniforms[FudgeCore.TEXTURE_LOCATION.COLOR.UNIFORM], FudgeCore.TEXTURE_LOCATION.COLOR.INDEX);
            crc3.uniformMatrix3fv(_shader.uniforms["u_mtxPivot"], false, _cmpMaterial.mtxPivot.get());
        }
        static injectCoatRemissiveTexturedNormals(_shader, _cmpMaterial) {
            RenderInjectorCoat.injectCoatRemissiveTextured.call(this, _shader, _cmpMaterial);
            let crc3 = FudgeCore.RenderWebGL.getRenderingContext();
            this.normalMap.useRenderData(FudgeCore.TEXTURE_LOCATION.NORMAL.UNIT);
            crc3.uniform1i(_shader.uniforms[FudgeCore.TEXTURE_LOCATION.NORMAL.UNIFORM], FudgeCore.TEXTURE_LOCATION.NORMAL.INDEX);
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
            Object.defineProperty(_constructor.prototype, "getRenderBuffers", {
                value: RenderInjectorMesh.getRenderBuffers
            });
            Object.defineProperty(_constructor.prototype, "deleteRenderBuffers", {
                value: RenderInjectorMesh.deleteRenderBuffers
            });
        }
        static getRenderBuffers() {
            if (this.renderMesh.buffers == null) {
                this.renderMesh.buffers = {
                    vertices: createBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.renderMesh.vertices),
                    indices: createBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, this.renderMesh.indices),
                    normals: createBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.renderMesh.normals),
                    textureUVs: createBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.renderMesh.textureUVs),
                    colors: createBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.renderMesh.colors),
                    tangents: createBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.renderMesh.tangents),
                    nIndices: this.renderMesh.indices.length
                };
                if (this.renderMesh.bones)
                    this.renderMesh.buffers.bones = createBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.renderMesh.bones);
                if (this.renderMesh.weights)
                    this.renderMesh.buffers.weights = createBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.renderMesh.weights);
            }
            return this.renderMesh.buffers;
            function createBuffer(_type, _array) {
                const crc3 = FudgeCore.RenderWebGL.getRenderingContext();
                let buffer = FudgeCore.RenderWebGL.assert(crc3.createBuffer());
                crc3.bindBuffer(_type, buffer);
                crc3.bufferData(_type, _array, WebGL2RenderingContext.STATIC_DRAW);
                return buffer;
            }
        }
        static useRenderBuffers(_shader, _mtxMeshToWorld, _mtxMeshToView, _id) {
            let crc3 = FudgeCore.RenderWebGL.getRenderingContext();
            let renderBuffers = this.getRenderBuffers();
            let uniform;
            uniform = _shader.uniforms["u_mtxMeshToView"];
            crc3.uniformMatrix4fv(uniform, false, _mtxMeshToView.get());
            uniform = _shader.uniforms["u_mtxMeshToWorld"];
            if (uniform)
                crc3.uniformMatrix4fv(uniform, false, _mtxMeshToWorld.get());
            uniform = _shader.uniforms["u_mtxNormalMeshToWorld"];
            if (uniform) {
                let normalMatrix = FudgeCore.Matrix4x4.TRANSPOSE(FudgeCore.Matrix4x4.INVERSION(_mtxMeshToWorld));
                crc3.uniformMatrix4fv(uniform, false, normalMatrix.get());
            }
            uniform = _shader.uniforms["u_id"];
            if (uniform)
                crc3.uniform1i(uniform, _id);
            setAttributeBuffer("a_vctPosition", renderBuffers.vertices, 3);
            setAttributeBuffer("a_vctColor", renderBuffers.colors, 4);
            setAttributeBuffer("a_vctTexture", renderBuffers.textureUVs, 2);
            setAttributeBuffer("a_vctNormal", renderBuffers.normals, 3);
            setAttributeBuffer("a_vctTangent", renderBuffers.tangents, 4);
            const aBone = _shader.attributes["a_vctBones"];
            if (aBone) {
                crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, renderBuffers.bones);
                crc3.enableVertexAttribArray(aBone);
                crc3.vertexAttribIPointer(aBone, 4, WebGL2RenderingContext.UNSIGNED_BYTE, 0, 0);
            }
            setAttributeBuffer("a_vctWeights", renderBuffers.weights, 4);
            crc3.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, renderBuffers.indices);
            return renderBuffers;
            function setAttributeBuffer(_name, _buffer, _size) {
                let attribute = _shader.attributes[_name];
                if (attribute == undefined)
                    return;
                crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, _buffer);
                crc3.enableVertexAttribArray(attribute);
                crc3.vertexAttribPointer(attribute, _size, WebGL2RenderingContext.FLOAT, false, 0, 0);
            }
        }
        static deleteRenderBuffers(_renderBuffers) {
            let crc3 = FudgeCore.RenderWebGL.getRenderingContext();
            if (_renderBuffers) {
                crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, null);
                crc3.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, null);
                Object.values(_renderBuffers).filter(_buffer => _buffer instanceof WebGLBuffer).forEach((_buffer, _index) => {
                    crc3.deleteBuffer(_buffer);
                    crc3.disableVertexAttribArray(_index);
                });
            }
        }
    }
    FudgeCore.RenderInjectorMesh = RenderInjectorMesh;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    let ParticleData;
    (function (ParticleData) {
        let FUNCTION;
        (function (FUNCTION) {
            FUNCTION["ADDITION"] = "addition";
            FUNCTION["SUBTRACTION"] = "subtraction";
            FUNCTION["MULTIPLICATION"] = "multiplication";
            FUNCTION["DIVISION"] = "division";
            FUNCTION["MODULO"] = "modulo";
            FUNCTION["POWER"] = "power";
            FUNCTION["POLYNOMIAL3"] = "polynomial3";
            FUNCTION["SQUARE_ROOT"] = "squareRoot";
            FUNCTION["RANDOM"] = "random";
            FUNCTION["RANDOM_RANGE"] = "randomRange";
        })(FUNCTION = ParticleData.FUNCTION || (ParticleData.FUNCTION = {}));
        ParticleData.FUNCTION_MINIMUM_PARAMETERS = {
            [ParticleData.FUNCTION.ADDITION]: 2,
            [ParticleData.FUNCTION.SUBTRACTION]: 2,
            [ParticleData.FUNCTION.MULTIPLICATION]: 2,
            [ParticleData.FUNCTION.DIVISION]: 2,
            [ParticleData.FUNCTION.MODULO]: 2,
            [ParticleData.FUNCTION.POWER]: 2,
            [ParticleData.FUNCTION.POLYNOMIAL3]: 5,
            [ParticleData.FUNCTION.SQUARE_ROOT]: 1,
            [ParticleData.FUNCTION.RANDOM]: 1,
            [ParticleData.FUNCTION.RANDOM_RANGE]: 3
        };
        ParticleData.PREDEFINED_VARIABLES = {
            systemDuration: "u_fParticleSystemDuration",
            systemSize: "u_fParticleSystemSize",
            systemTime: "u_fParticleSystemTime",
            particleId: "fParticleId"
        };
    })(ParticleData = FudgeCore.ParticleData || (FudgeCore.ParticleData = {}));
    class RenderInjectorShaderParticleSystem extends FudgeCore.RenderInjectorShader {
        static {
            this.FUNCTIONS = {
                [ParticleData.FUNCTION.ADDITION]: (_parameters) => {
                    return `(${_parameters.reduce((_accumulator, _value) => `${_accumulator} + ${_value}`)})`;
                },
                [ParticleData.FUNCTION.SUBTRACTION]: (_parameters) => {
                    return `(${_parameters.reduce((_accumulator, _value) => `${_accumulator} - ${_value}`)})`;
                },
                [ParticleData.FUNCTION.MULTIPLICATION]: (_parameters) => {
                    return `(${_parameters.reduce((_accumulator, _value) => `${_accumulator} * ${_value}`)})`;
                },
                [ParticleData.FUNCTION.DIVISION]: (_parameters) => {
                    return `(${_parameters[0]} / ${_parameters[1]})`;
                },
                [ParticleData.FUNCTION.MODULO]: (_parameters) => {
                    return `(${_parameters.reduce((_accumulator, _value) => `mod(${_accumulator}, ${_value})`)})`;
                },
                [ParticleData.FUNCTION.POWER]: (_parameters) => {
                    return `pow(${_parameters[0]}, ${_parameters[1]})`;
                },
                [ParticleData.FUNCTION.POLYNOMIAL3]: (_parameters) => {
                    let x = _parameters[0];
                    let a = _parameters[1];
                    let b = _parameters[2];
                    let c = _parameters[3];
                    let d = _parameters[4];
                    return `(${a} * pow(${x}, 3.0) + ${b} * pow(${x}, 2.0) + ${c} * ${x} + ${d})`;
                },
                [ParticleData.FUNCTION.SQUARE_ROOT]: (_parameters) => {
                    let x = _parameters[0];
                    return `sqrt(${x})`;
                },
                [ParticleData.FUNCTION.RANDOM]: (_parameters) => {
                    return `fetchRandomNumber(int(${_parameters[0]}), iParticleSystemRandomNumbersSize, iParticleSystemRandomNumbersLength)`;
                },
                [ParticleData.FUNCTION.RANDOM_RANGE]: (_parameters) => {
                    return `(${RenderInjectorShaderParticleSystem.FUNCTIONS["random"](_parameters)} * (${_parameters[2]} - ${_parameters[1]}) + ${_parameters[1]})`;
                }
            };
        }
        static decorate(_constructor) {
            super.decorate(_constructor.prototype);
            Object.defineProperty(_constructor.prototype, "getVertexShaderSource", {
                value: RenderInjectorShaderParticleSystem.getVertexShaderSource
            });
            Object.defineProperty(_constructor.prototype, "getFragmentShaderSource", {
                value: RenderInjectorShaderParticleSystem.getFragmentShaderSource
            });
        }
        static getVertexShaderSource() {
            let data = this.data;
            let mtxLocal = data?.mtxLocal;
            let mtxWorld = data?.mtxWorld;
            let source = this.vertexShaderSource
                .replace("#version 300 es", `#version 300 es\n#define ${this.define[0]}${data.color ? "\n#define PARTICLE_COLOR" : ""}`)
                .replace("/*$variables*/", RenderInjectorShaderParticleSystem.generateVariables(data?.variables, data?.variableNames))
                .replace("/*$mtxLocal*/", RenderInjectorShaderParticleSystem.generateTransformations(mtxLocal, "Local"))
                .replace("/*$mtxLocal*/", mtxLocal && mtxLocal.length > 0 ? "* mtxLocal" : "")
                .replace("/*$mtxWorld*/", RenderInjectorShaderParticleSystem.generateTransformations(mtxWorld, "World"))
                .replace("/*$mtxWorld*/", mtxWorld && mtxWorld.length > 0 ? "mtxWorld *" : "")
                .replaceAll("/*$color*/", RenderInjectorShaderParticleSystem.generateColor(data?.color));
            return source;
        }
        static getFragmentShaderSource() {
            return this.fragmentShaderSource.replace("#version 300 es", `#version 300 es\n#define ${this.define[0]}${this.data.color ? "\n#define PARTICLE_COLOR" : ""}`);
        }
        static generateVariables(_variables, _variableNames) {
            if (!_variables)
                return "";
            return _variables
                .map((_variable, _index) => ({ name: "fParticleSystemVariable_" + _variableNames[_index], value: RenderInjectorShaderParticleSystem.generateExpression(_variable) }))
                .map(_variable => `float ${_variable.name} = ${_variable.value};`)
                .reduce((_accumulator, _code) => `${_accumulator}\n${_code}`, "");
        }
        static generateTransformations(_transformations, _localOrWorld) {
            if (!_transformations || _transformations.length == 0)
                return "";
            let transformations = _transformations
                .map(_data => {
                let isScale = _data.transformation === "scale";
                let [x, y, z] = [_data.parameters[0], _data.parameters[1], _data.parameters[2]]
                    .map((_value) => _value ? RenderInjectorShaderParticleSystem.generateExpression(_value) : (isScale ? "1.0" : "0.0"));
                return [_data.transformation, x, y, z];
            });
            let code = "";
            code += transformations
                .map(([_transformation, _x, _y, _z], _index) => {
                let rotateId = _index + _localOrWorld;
                if (_transformation == "rotate") {
                    let toRadians = (_value) => `${_value} * ${FudgeCore.Calc.deg2rad}`;
                    return `float fXRadians${rotateId} = ${toRadians(_x)};
              float fYRadians${rotateId} = ${toRadians(_y)};
              float fZRadians${rotateId} = ${toRadians(_z)};
              float fSinX${rotateId} = sin(fXRadians${rotateId});
              float fCosX${rotateId} = cos(fXRadians${rotateId}); 
              float fSinY${rotateId} = sin(fYRadians${rotateId});
              float fCosY${rotateId} = cos(fYRadians${rotateId});
              float fSinZ${rotateId} = sin(fZRadians${rotateId});
              float fCosZ${rotateId} = cos(fZRadians${rotateId});\n`;
                }
                else
                    return "";
            })
                .filter((_transformation) => _transformation != "")
                .reduce((_accumulator, _code) => `${_accumulator}\n${_code}`, "");
            code += "\n";
            code += `mat4 mtx${_localOrWorld} = `;
            code += transformations
                .map(([_transformation, _x, _y, _z], _index) => {
                let rotateId = _index + _localOrWorld;
                switch (_transformation) {
                    case "translate":
                        return `mat4(
              1.0, 0.0, 0.0, 0.0,
              0.0, 1.0, 0.0, 0.0,
              0.0, 0.0, 1.0, 0.0,
              ${_x}, ${_y}, ${_z}, 1.0)`;
                    case "rotate":
                        return `mat4(
              fCosZ${rotateId} * fCosY${rotateId}, fSinZ${rotateId} * fCosY${rotateId}, -fSinY${rotateId}, 0.0,
              fCosZ${rotateId} * fSinY${rotateId} * fSinX${rotateId} - fSinZ${rotateId} * fCosX${rotateId}, fSinZ${rotateId} * fSinY${rotateId} * fSinX${rotateId} + fCosZ${rotateId} * fCosX${rotateId}, fCosY${rotateId} * fSinX${rotateId}, 0.0,
              fCosZ${rotateId} * fSinY${rotateId} * fCosX${rotateId} + fSinZ${rotateId} * fSinX${rotateId}, fSinZ${rotateId} * fSinY${rotateId} * fCosX${rotateId} - fCosZ${rotateId} * fSinX${rotateId}, fCosY${rotateId} * fCosX${rotateId}, 0.0,
              0.0, 0.0, 0.0, 1.0
              )`;
                    case "scale":
                        return `mat4(
              ${_x}, 0.0, 0.0, 0.0,
              0.0, ${_y}, 0.0, 0.0,
              0.0, 0.0, ${_z}, 0.0,
              0.0, 0.0, 0.0, 1.0
              )`;
                    default:
                        throw `Error in ${FudgeCore.ParticleSystem.name}: "${_transformation}" is not a transformation`;
                }
            })
                .reduce((_accumulator, _code) => `${_accumulator} * \n${_code}`);
            code += ";\n";
            return code;
        }
        static generateColor(_color) {
            if (!_color)
                return "";
            let rgba = [_color[0], _color[1], _color[2], _color[3]]
                .map((_value) => _value ? RenderInjectorShaderParticleSystem.generateExpression(_value) : "1.0")
                .join(", ");
            return `vec4(${rgba});`;
        }
        static generateExpression(_expression) {
            if (ParticleData.isFunction(_expression)) {
                let parameters = [];
                for (let param of _expression.parameters) {
                    parameters.push(RenderInjectorShaderParticleSystem.generateExpression(param));
                }
                return RenderInjectorShaderParticleSystem.generateFunction(_expression.function, parameters);
            }
            if (ParticleData.isVariable(_expression)) {
                return ParticleData.PREDEFINED_VARIABLES[_expression.value] || "fParticleSystemVariable_" + _expression.value;
            }
            if (ParticleData.isConstant(_expression)) {
                let value = _expression.value.toString();
                return `${value}${value.includes(".") ? "" : ".0"}`;
            }
            if (ParticleData.isCode(_expression)) {
                let code = _expression.code
                    .replaceAll(/\b[a-zA-z]+\w*(?!\()\b/g, (_match) => ParticleData.PREDEFINED_VARIABLES[_match] || "fParticleSystemVariable_" + _match)
                    .replaceAll(/(?<!\.)\b\d+\b(?!\.)/g, (_match) => _match + ".0");
                code = RenderInjectorShaderParticleSystem.replaceFunctions(code);
                return code;
            }
            throw `Error in ${FudgeCore.ParticleSystem.name}: invalid node structure in particle system serialization`;
        }
        static generateFunction(_function, _parameters) {
            if (_parameters.length < ParticleData.FUNCTION_MINIMUM_PARAMETERS[_function])
                throw `Error in ${FudgeCore.ParticleSystem.name}: "${_function}" needs at least ${ParticleData.FUNCTION_MINIMUM_PARAMETERS[_function]} parameters`;
            if (Object.values(ParticleData.FUNCTION).includes(_function))
                return RenderInjectorShaderParticleSystem.FUNCTIONS[_function](_parameters);
            else
                throw `Error in ${FudgeCore.ParticleSystem.name}: "${_function}" is not an operation`;
        }
        static replaceFunctions(_code) {
            let functionRegex = /\b[a-zA-z_]+\w*\(/g;
            let match;
            while ((match = functionRegex.exec(_code)) != null) {
                let functionGenerator = RenderInjectorShaderParticleSystem.FUNCTIONS[match[0].slice(0, -1)];
                if (!functionGenerator)
                    continue;
                let commaIndices = [];
                let openBrackets = 1;
                let argumentsLastIndex = functionRegex.lastIndex;
                while (openBrackets > 0) {
                    switch (_code[argumentsLastIndex]) {
                        case "(":
                            openBrackets++;
                            break;
                        case ")":
                            openBrackets--;
                            break;
                        case ",":
                            if (openBrackets == 1)
                                commaIndices.push(argumentsLastIndex);
                            break;
                    }
                    argumentsLastIndex++;
                }
                let args = [functionRegex.lastIndex - 1, ...commaIndices, argumentsLastIndex - 1].reduce((_accumulator, _position, _index, _positions) => {
                    return _index == _positions.length - 1 ?
                        _accumulator :
                        _accumulator.concat(_code.slice(_position + 1, _positions[_index + 1]).trim());
                }, []);
                functionRegex.lastIndex = match.index;
                _code = `${_code.slice(0, match.index)}(${functionGenerator(args)})${_code.slice(argumentsLastIndex)}`;
            }
            return _code;
        }
    }
    FudgeCore.RenderInjectorShaderParticleSystem = RenderInjectorShaderParticleSystem;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class RenderInjectorComponentParticleSystem {
        static decorate(_constructor) {
            Object.defineProperty(_constructor.prototype, "useRenderData", {
                value: RenderInjectorComponentParticleSystem.useRenderData
            });
            Object.defineProperty(_constructor.prototype, "deleteRenderData", {
                value: RenderInjectorComponentParticleSystem.deleteRenderData
            });
        }
        static useRenderData() {
            let crc3 = FudgeCore.RenderWebGL.getRenderingContext();
            if (this.renderData) {
                crc3.activeTexture(FudgeCore.TEXTURE_LOCATION.PARTICLE.UNIT);
                crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, this.renderData);
            }
            else {
                const texture = FudgeCore.Render.assert(crc3.createTexture());
                crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, texture);
                let textureSize = Math.ceil(Math.sqrt(this.size));
                textureSize = Math.min(textureSize, crc3.getParameter(crc3.MAX_TEXTURE_SIZE));
                let randomNumbers = [];
                for (let i = 0; i < textureSize * textureSize; i++)
                    randomNumbers.push(Math.random());
                try {
                    crc3.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.R32F, textureSize, textureSize, 0, WebGL2RenderingContext.RED, WebGL2RenderingContext.FLOAT, Float32Array.from(randomNumbers));
                }
                catch (_error) {
                    FudgeCore.Debug.error(_error);
                }
                crc3.texParameteri(crc3.TEXTURE_2D, crc3.TEXTURE_MIN_FILTER, crc3.NEAREST);
                crc3.texParameteri(crc3.TEXTURE_2D, crc3.TEXTURE_MAG_FILTER, crc3.NEAREST);
                this.renderData = texture;
                crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, null);
                this.useRenderData();
            }
        }
        static deleteRenderData() {
            if (!this.renderData)
                return;
            let crc3 = FudgeCore.RenderWebGL.getRenderingContext();
            crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, null);
            crc3.deleteTexture(this.renderData);
            delete this.renderData;
        }
    }
    FudgeCore.RenderInjectorComponentParticleSystem = RenderInjectorComponentParticleSystem;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Recycler {
        static { this.depot = {}; }
        static get(_t) {
            let key = _t.name;
            let instances = Recycler.depot[key];
            if (instances && instances.length > 0) {
                let instance = instances.pop();
                instance.recycle();
                return instance;
            }
            else
                return new _t();
        }
        static borrow(_t) {
            let t;
            let key = _t.name;
            let instances = Recycler.depot[key];
            if (!instances || instances.length == 0) {
                t = new _t();
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
        static storeMultiple(..._instances) {
            for (const instance of _instances)
                Recycler.store(instance);
        }
        static dump(_t) {
            let key = _t.name;
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
        copy(_original) {
            this.data.set(_original.data);
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
        map(_function) {
            let copy = FudgeCore.Recycler.get(Vector2);
            copy.data = this.data.map(_function);
            return copy;
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
        constructor(_x = 0, _y = 0, _width = 1, _height = 1, _origin = ORIGIN2D.TOPLEFT) {
            super();
            this.position = FudgeCore.Recycler.get(FudgeCore.Vector2);
            this.size = FudgeCore.Recycler.get(FudgeCore.Vector2);
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
        BLEND[BLEND["ADDITIVE"] = 2] = "ADDITIVE";
        BLEND[BLEND["SUBTRACTIVE"] = 3] = "SUBTRACTIVE";
        BLEND[BLEND["MODULATE"] = 4] = "MODULATE";
    })(BLEND = FudgeCore.BLEND || (FudgeCore.BLEND = {}));
    FudgeCore.UNIFORM_BLOCKS = {
        LIGHTS: {
            NAME: "Lights",
            BINDING: 0
        },
        SKIN: {
            NAME: "Skin",
            BINDING: 1
        },
        FOG: {
            NAME: "Fog",
            BINDING: 2
        }
    };
    FudgeCore.TEXTURE_LOCATION = {
        COLOR: {
            UNIFORM: "u_texColor",
            UNIT: WebGL2RenderingContext.TEXTURE0,
            INDEX: 0
        },
        NORMAL: {
            UNIFORM: "u_texNormal",
            UNIT: WebGL2RenderingContext.TEXTURE1,
            INDEX: 1
        },
        PARTICLE: {
            UNIFORM: "u_particleSystemRandomNumbers",
            UNIT: WebGL2RenderingContext.TEXTURE2,
            INDEX: 2
        },
        TEXT: {
            UNIFORM: "u_texText",
            UNIT: WebGL2RenderingContext.TEXTURE3,
            INDEX: 3
        }
    };
    class RenderWebGL extends FudgeCore.EventTargetStatic {
        static { this.crc3 = RenderWebGL.initialize(); }
        static { this.rectRender = RenderWebGL.getCanvasRect(); }
        static initialize(_antialias, _alpha) {
            let fudgeConfig = Reflect.get(globalThis, "fudgeConfig") || {};
            const antialias = (_antialias != undefined) ? _antialias : fudgeConfig.antialias || false;
            if (antialias)
                FudgeCore.Debug.error("The default antialiasing is not compatible with the current post-processing effects and will therefore be disabled.");
            let contextAttributes = {
                alpha: (_alpha != undefined) ? _alpha : fudgeConfig.alpha || false,
                antialias: false,
                premultipliedAlpha: false,
                stencil: true
            };
            FudgeCore.Debug.fudge("Initialize RenderWebGL", contextAttributes);
            let canvas = document.createElement("canvas");
            let crc3;
            crc3 = RenderWebGL.assert(canvas.getContext("webgl2", contextAttributes), "WebGL-context couldn't be created");
            RenderWebGL.crc3 = crc3;
            crc3.enable(WebGL2RenderingContext.CULL_FACE);
            crc3.enable(WebGL2RenderingContext.DEPTH_TEST);
            crc3.enable(WebGL2RenderingContext.BLEND);
            RenderWebGL.setBlendMode(BLEND.TRANSPARENT);
            RenderWebGL.rectRender = RenderWebGL.getCanvasRect();
            RenderWebGL.initializeAttachments();
            RenderWebGL.adjustAttachments();
            RenderWebGL.uboFog = RenderWebGL.assert(crc3.createBuffer());
            return crc3;
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
        static clear(_color) {
            RenderWebGL.crc3.clearColor(_color?.r ?? 0, _color?.g ?? 0, _color?.b ?? 0, _color?.a ?? 1);
            RenderWebGL.crc3.clear(WebGL2RenderingContext.COLOR_BUFFER_BIT | WebGL2RenderingContext.DEPTH_BUFFER_BIT | WebGL2RenderingContext.STENCIL_BUFFER_BIT);
        }
        static setFramebufferTarget(_buffer) {
            RenderWebGL.fboTarget = _buffer;
        }
        static resetFramebuffer() {
            RenderWebGL.crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, RenderWebGL.fboMain);
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
        static setScissorTest(_test, _x, _y, _width, _height) {
            if (_test)
                RenderWebGL.crc3.enable(WebGL2RenderingContext.SCISSOR_TEST);
            else
                RenderWebGL.crc3.disable(WebGL2RenderingContext.SCISSOR_TEST);
            RenderWebGL.crc3.scissor(_x, _y, _width, _height);
        }
        static setViewport(_x, _y, _width, _height) {
            RenderWebGL.crc3.viewport(_x, _y, _width, _height);
        }
        static setBlendMode(_mode) {
            switch (_mode) {
                case BLEND.OPAQUE:
                    RenderWebGL.crc3.blendEquation(WebGL2RenderingContext.FUNC_ADD);
                    RenderWebGL.crc3.blendFunc(WebGL2RenderingContext.ONE, WebGL2RenderingContext.ZERO);
                    break;
                case BLEND.TRANSPARENT:
                    RenderWebGL.crc3.blendEquation(WebGL2RenderingContext.FUNC_ADD);
                    RenderWebGL.crc3.blendFunc(WebGL2RenderingContext.ONE, WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA);
                    break;
                case BLEND.ADDITIVE:
                    RenderWebGL.crc3.blendEquation(WebGL2RenderingContext.FUNC_ADD);
                    RenderWebGL.crc3.blendFunc(WebGL2RenderingContext.ONE, WebGL2RenderingContext.ONE);
                    break;
                case BLEND.SUBTRACTIVE:
                    RenderWebGL.crc3.blendEquation(WebGL2RenderingContext.FUNC_REVERSE_SUBTRACT);
                    RenderWebGL.crc3.blendFunc(WebGL2RenderingContext.ONE, WebGL2RenderingContext.ONE);
                    break;
                case BLEND.MODULATE:
                    RenderWebGL.crc3.blendEquation(WebGL2RenderingContext.FUNC_ADD);
                    RenderWebGL.crc3.blendFunc(WebGL2RenderingContext.DST_COLOR, WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA);
                default:
                    break;
            }
        }
        static pointRenderToWorld(_render) {
            const crc3 = RenderWebGL.getRenderingContext();
            const data = new Float32Array(4);
            crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, RenderWebGL.fboMain);
            crc3.readBuffer(WebGL2RenderingContext.COLOR_ATTACHMENT1);
            crc3.readPixels(_render.x, RenderWebGL.rectRender.height - _render.y, 1, 1, crc3.RGBA, crc3.FLOAT, data);
            crc3.readBuffer(WebGL2RenderingContext.COLOR_ATTACHMENT0);
            let position = FudgeCore.Recycler.get(FudgeCore.Vector3);
            position.set(data[0], data[1], data[2]);
            return position;
        }
        static initializeAttachments() {
            RenderWebGL.crc3.getExtension("EXT_color_buffer_float");
            RenderWebGL.fboMain = RenderWebGL.assert(RenderWebGL.crc3.createFramebuffer());
            RenderWebGL.fboPost = RenderWebGL.assert(RenderWebGL.crc3.createFramebuffer());
            RenderWebGL.fboTarget = null;
            RenderWebGL.texColor = createTexture(WebGL2RenderingContext.NEAREST, WebGL2RenderingContext.CLAMP_TO_EDGE);
            RenderWebGL.texPosition = createTexture(WebGL2RenderingContext.NEAREST, WebGL2RenderingContext.CLAMP_TO_EDGE);
            RenderWebGL.texNormal = createTexture(WebGL2RenderingContext.NEAREST, WebGL2RenderingContext.CLAMP_TO_EDGE);
            RenderWebGL.texDepthStencil = createTexture(WebGL2RenderingContext.NEAREST, WebGL2RenderingContext.CLAMP_TO_EDGE);
            RenderWebGL.texNoise = createTexture(WebGL2RenderingContext.NEAREST, WebGL2RenderingContext.CLAMP_TO_EDGE);
            RenderWebGL.texBloomSamples = new Array(6);
            for (let i = 0; i < RenderWebGL.texBloomSamples.length; i++)
                RenderWebGL.texBloomSamples[i] = createTexture(WebGL2RenderingContext.LINEAR, WebGL2RenderingContext.CLAMP_TO_EDGE);
            function createTexture(_filter, _wrap) {
                const crc3 = RenderWebGL.crc3;
                const texture = RenderWebGL.assert(crc3.createTexture());
                crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, texture);
                crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, _filter);
                crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MAG_FILTER, _filter);
                crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_S, _wrap);
                crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_T, _wrap);
                crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, null);
                return texture;
            }
        }
        static adjustAttachments() {
            const crc3 = RenderWebGL.getRenderingContext();
            const width = crc3.canvas.width || 1;
            const height = crc3.canvas.height || 1;
            crc3.activeTexture(crc3.TEXTURE0);
            crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texColor);
            crc3.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.RGBA, width, height, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, null);
            crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texPosition);
            crc3.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.RGBA32F, width, height, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.FLOAT, null);
            crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texNormal);
            crc3.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.RGBA16F, width, height, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.FLOAT, null);
            crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texDepthStencil);
            crc3.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.DEPTH24_STENCIL8, width, height, 0, WebGL2RenderingContext.DEPTH_STENCIL, WebGL2RenderingContext.UNSIGNED_INT_24_8, null);
            crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, RenderWebGL.fboMain);
            crc3.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, WebGL2RenderingContext.COLOR_ATTACHMENT0, WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texColor, 0);
            crc3.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, WebGL2RenderingContext.COLOR_ATTACHMENT1, WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texPosition, 0);
            crc3.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, WebGL2RenderingContext.COLOR_ATTACHMENT2, WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texNormal, 0);
            crc3.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, WebGL2RenderingContext.DEPTH_STENCIL_ATTACHMENT, WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texDepthStencil, 0);
            crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, null);
            for (let i = 0, divisor = 1; i < RenderWebGL.texBloomSamples.length; i++, divisor *= 2) {
                let width = Math.max(Math.round(crc3.canvas.width / divisor), 1);
                let height = Math.max(Math.round(crc3.canvas.height / divisor), 1);
                crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texBloomSamples[i]);
                crc3.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.RGBA, width, height, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, null);
            }
            const nValues = width * height * 4;
            const noiseData = new Uint8Array(nValues);
            for (let i = 0; i < nValues; i += 4) {
                noiseData[i] = Math.floor(Math.random() * 256);
                noiseData[i + 1] = Math.floor(Math.random() * 256);
                noiseData[i + 2] = Math.floor(Math.random() * 256);
                noiseData[i + 3] = Math.floor(Math.random() * 256);
            }
            crc3.bindTexture(crc3.TEXTURE_2D, RenderWebGL.texNoise);
            crc3.texImage2D(crc3.TEXTURE_2D, 0, crc3.RGBA, width, height, 0, crc3.RGBA, crc3.UNSIGNED_BYTE, noiseData);
            crc3.bindTexture(crc3.TEXTURE_2D, null);
        }
        static createPickTexture(_size) {
            const targetTexture = RenderWebGL.assert(FudgeCore.Render.crc3.createTexture());
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
        static pick(_node, _cmpCamera) {
            try {
                let cmpMesh = _node.getComponent(FudgeCore.ComponentMesh);
                let cmpMaterial = _node.getComponent(FudgeCore.ComponentMaterial);
                let coat = cmpMaterial.material.coat;
                let shader = coat instanceof FudgeCore.CoatTextured ? FudgeCore.ShaderPickTextured : FudgeCore.ShaderPick;
                shader.useProgram();
                coat.useRenderData(shader, cmpMaterial);
                let mtxMeshToView = this.calcMeshToView(_node, cmpMesh.mtxWorld, _cmpCamera.mtxWorldToView, _cmpCamera.mtxWorld.translation);
                let sizeUniformLocation = shader.uniforms["u_vctSize"];
                RenderWebGL.getRenderingContext().uniform2fv(sizeUniformLocation, [RenderWebGL.sizePick, RenderWebGL.sizePick]);
                let mesh = cmpMesh.mesh;
                let renderBuffers = mesh.useRenderBuffers(shader, _node.mtxWorld, mtxMeshToView, FudgeCore.Render.ƒpicked.length);
                RenderWebGL.crc3.drawElements(WebGL2RenderingContext.TRIANGLES, renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0);
                let pick = new FudgeCore.Pick(_node);
                FudgeCore.Render.ƒpicked.push(pick);
            }
            catch (_error) {
            }
        }
        static pickGizmos(_gizmos, _cmpCamera) {
            const crc3 = RenderWebGL.getRenderingContext();
            let shader = FudgeCore.ShaderPick;
            shader.useProgram();
            crc3.uniform2fv(shader.uniforms["u_vctSize"], [RenderWebGL.sizePick, RenderWebGL.sizePick]);
            shader = FudgeCore.ShaderPickTextured;
            shader.useProgram();
            crc3.uniform2fv(shader.uniforms["u_vctSize"], [RenderWebGL.sizePick, RenderWebGL.sizePick]);
            crc3.uniformMatrix3fv(shader.uniforms["u_mtxPivot"], false, FudgeCore.Matrix3x3.IDENTITY().get());
            FudgeCore.Gizmos.pick(_gizmos, _cmpCamera, FudgeCore.Render.ƒpicked);
        }
        static bufferFog(_cmpFog) {
            const crc3 = RenderWebGL.getRenderingContext();
            const data = new Float32Array(8);
            data[0] = _cmpFog?.isActive ? 1 : 0;
            if (_cmpFog) {
                data[1] = _cmpFog.near;
                data[2] = _cmpFog.far;
                data.set(_cmpFog.color.getArray(), 4);
            }
            crc3.bindBuffer(WebGL2RenderingContext.UNIFORM_BUFFER, RenderWebGL.uboFog);
            crc3.bufferData(WebGL2RenderingContext.UNIFORM_BUFFER, data, WebGL2RenderingContext.STATIC_DRAW);
            crc3.bindBufferBase(WebGL2RenderingContext.UNIFORM_BUFFER, FudgeCore.UNIFORM_BLOCKS.FOG.BINDING, RenderWebGL.uboFog);
        }
        static bufferLights(_lights) {
            if (!RenderWebGL.uboLights)
                return;
            RenderWebGL.crc3.bindBuffer(WebGL2RenderingContext.UNIFORM_BUFFER, RenderWebGL.uboLights);
            let cmpLights = _lights.get(FudgeCore.LightAmbient);
            if (cmpLights) {
                let clrSum = new FudgeCore.Color(0, 0, 0, 0);
                for (let cmpLight of cmpLights)
                    clrSum.add(cmpLight.light.color);
                RenderWebGL.crc3.bufferSubData(RenderWebGL.crc3.UNIFORM_BUFFER, RenderWebGL.uboLightsVariableOffsets["u_ambient.vctColor"], new Float32Array(clrSum.getArray()));
            }
            bufferLightsOfType(FudgeCore.LightDirectional, "u_nLightsDirectional", "u_directional");
            bufferLightsOfType(FudgeCore.LightPoint, "u_nLightsPoint", "u_point");
            bufferLightsOfType(FudgeCore.LightSpot, "u_nLightsSpot", "u_spot");
            function bufferLightsOfType(_type, _uniName, _uniStruct) {
                const cmpLights = _lights.get(_type);
                RenderWebGL.crc3.bufferSubData(RenderWebGL.crc3.UNIFORM_BUFFER, RenderWebGL.uboLightsVariableOffsets[_uniName], new Uint8Array([cmpLights?.length ?? 0]));
                if (!cmpLights)
                    return;
                const lightDataSize = 4 + 16 + 16;
                const lightsData = new Float32Array(cmpLights.length * lightDataSize);
                let iLight = 0;
                for (let cmpLight of cmpLights) {
                    const lightDataOffset = iLight * lightDataSize;
                    lightsData.set(cmpLight.light.color.getArray(), lightDataOffset + 0);
                    let mtxTotal = FudgeCore.Matrix4x4.MULTIPLICATION(cmpLight.node.mtxWorld, cmpLight.mtxPivot);
                    if (_type == FudgeCore.LightDirectional) {
                        let zero = FudgeCore.Vector3.ZERO();
                        mtxTotal.translation = zero;
                        FudgeCore.Recycler.store(zero);
                    }
                    lightsData.set(mtxTotal.get(), lightDataOffset + 4);
                    if (_type != FudgeCore.LightDirectional) {
                        let mtxInverse = mtxTotal.inverse();
                        lightsData.set(mtxInverse.get(), lightDataOffset + 4 + 16);
                        FudgeCore.Recycler.store(mtxInverse);
                    }
                    FudgeCore.Recycler.store(mtxTotal);
                    iLight++;
                }
                RenderWebGL.crc3.bufferSubData(RenderWebGL.crc3.UNIFORM_BUFFER, RenderWebGL.uboLightsVariableOffsets[`${_uniStruct}[0].vctColor`], lightsData);
            }
        }
        static drawNodes(_nodesOpaque, _nodesAlpha, _cmpCamera) {
            const crc3 = RenderWebGL.getRenderingContext();
            const cmpFog = _cmpCamera.node?.getComponent(FudgeCore.ComponentFog);
            const cmpAmbientOcclusion = _cmpCamera.node?.getComponent(FudgeCore.ComponentAmbientOcclusion);
            const cmpBloom = _cmpCamera.node?.getComponent(FudgeCore.ComponentBloom);
            RenderWebGL.bufferFog(cmpFog);
            crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, RenderWebGL.fboMain);
            crc3.drawBuffers(cmpAmbientOcclusion?.isActive ?
                [WebGL2RenderingContext.COLOR_ATTACHMENT0, WebGL2RenderingContext.COLOR_ATTACHMENT1, WebGL2RenderingContext.COLOR_ATTACHMENT2] :
                [WebGL2RenderingContext.COLOR_ATTACHMENT0]);
            RenderWebGL.clear(_cmpCamera.clrBackground);
            for (let node of _nodesOpaque)
                RenderWebGL.drawNode(node, _cmpCamera);
            if (cmpAmbientOcclusion?.isActive)
                RenderWebGL.drawAmbientOcclusion(_cmpCamera, cmpAmbientOcclusion);
            if (cmpBloom?.isActive)
                RenderWebGL.drawBloom(cmpBloom);
            crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, RenderWebGL.fboMain);
            crc3.drawBuffers([WebGL2RenderingContext.COLOR_ATTACHMENT0]);
            for (let node of _nodesAlpha)
                RenderWebGL.drawNode(node, _cmpCamera);
            crc3.bindFramebuffer(WebGL2RenderingContext.READ_FRAMEBUFFER, RenderWebGL.fboMain);
            crc3.bindFramebuffer(WebGL2RenderingContext.DRAW_FRAMEBUFFER, RenderWebGL.fboTarget);
            crc3.blitFramebuffer(0, 0, crc3.canvas.width, crc3.canvas.height, 0, 0, crc3.canvas.width, crc3.canvas.height, WebGL2RenderingContext.COLOR_BUFFER_BIT | WebGL2RenderingContext.DEPTH_BUFFER_BIT, WebGL2RenderingContext.NEAREST);
        }
        static drawAmbientOcclusion(_cmpCamera, _cmpAmbientOcclusion) {
            const crc3 = RenderWebGL.getRenderingContext();
            FudgeCore.ShaderAmbientOcclusion.useProgram();
            RenderWebGL.bindTexture(FudgeCore.ShaderAmbientOcclusion, RenderWebGL.texPosition, WebGL2RenderingContext.TEXTURE0, "u_texPosition");
            RenderWebGL.bindTexture(FudgeCore.ShaderAmbientOcclusion, RenderWebGL.texNormal, WebGL2RenderingContext.TEXTURE1, "u_texNormal");
            RenderWebGL.bindTexture(FudgeCore.ShaderAmbientOcclusion, RenderWebGL.texNoise, WebGL2RenderingContext.TEXTURE2, "u_texNoise");
            crc3.uniform1f(FudgeCore.ShaderAmbientOcclusion.uniforms["u_fNear"], _cmpCamera.getNear());
            crc3.uniform1f(FudgeCore.ShaderAmbientOcclusion.uniforms["u_fFar"], _cmpCamera.getFar());
            crc3.uniform1f(FudgeCore.ShaderAmbientOcclusion.uniforms["u_fBias"], _cmpAmbientOcclusion.bias);
            crc3.uniform1f(FudgeCore.ShaderAmbientOcclusion.uniforms["u_fSampleRadius"], _cmpAmbientOcclusion.sampleRadius);
            crc3.uniform1f(FudgeCore.ShaderAmbientOcclusion.uniforms["u_fAttenuationConstant"], _cmpAmbientOcclusion.attenuationConstant);
            crc3.uniform1f(FudgeCore.ShaderAmbientOcclusion.uniforms["u_fAttenuationLinear"], _cmpAmbientOcclusion.attenuationLinear);
            crc3.uniform1f(FudgeCore.ShaderAmbientOcclusion.uniforms["u_fAttenuationQuadratic"], _cmpAmbientOcclusion.attenuationQuadratic);
            crc3.uniform2f(FudgeCore.ShaderAmbientOcclusion.uniforms["u_vctResolution"], RenderWebGL.getCanvas().width, RenderWebGL.getCanvas().height);
            crc3.uniform3fv(FudgeCore.ShaderAmbientOcclusion.uniforms["u_vctCamera"], _cmpCamera.mtxWorld.translation.get());
            crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, RenderWebGL.fboPost);
            crc3.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, WebGL2RenderingContext.COLOR_ATTACHMENT0, WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texColor, 0);
            RenderWebGL.setBlendMode(BLEND.SUBTRACTIVE);
            crc3.drawArrays(WebGL2RenderingContext.TRIANGLES, 0, 3);
            RenderWebGL.setBlendMode(BLEND.TRANSPARENT);
        }
        static drawBloom(_cmpBloom) {
            const crc3 = RenderWebGL.getRenderingContext();
            FudgeCore.ShaderBloom.useProgram();
            crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, RenderWebGL.fboPost);
            crc3.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, WebGL2RenderingContext.COLOR_ATTACHMENT0, WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texBloomSamples[0], 0);
            RenderWebGL.clear();
            RenderWebGL.bindTexture(FudgeCore.ShaderBloom, RenderWebGL.texColor, WebGL2RenderingContext.TEXTURE0, "u_texSource");
            crc3.uniform1f(FudgeCore.ShaderBloom.uniforms["u_fThreshold"], _cmpBloom.threshold);
            crc3.uniform1i(FudgeCore.ShaderBloom.uniforms["u_iMode"], 0);
            crc3.drawArrays(WebGL2RenderingContext.TRIANGLES, 0, 3);
            const iterations = RenderWebGL.texBloomSamples.length;
            for (let i = 1, divisor = 2; i < iterations; i++, divisor *= 2) {
                let width = Math.max(Math.round(crc3.canvas.width / divisor), 1);
                let height = Math.max(Math.round(crc3.canvas.height / divisor), 1);
                crc3.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, WebGL2RenderingContext.COLOR_ATTACHMENT0, WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texBloomSamples[i], 0);
                crc3.viewport(0, 0, width, height);
                RenderWebGL.clear();
                RenderWebGL.bindTexture(FudgeCore.ShaderBloom, RenderWebGL.texBloomSamples[i - 1], WebGL2RenderingContext.TEXTURE0, "u_texSource");
                crc3.uniform1i(FudgeCore.ShaderBloom.uniforms["u_iMode"], 1);
                crc3.uniform2f(FudgeCore.ShaderBloom.uniforms["u_vctTexel"], 0.5 / width, 0.5 / height);
                crc3.drawArrays(WebGL2RenderingContext.TRIANGLES, 0, 3);
            }
            RenderWebGL.setBlendMode(BLEND.ADDITIVE);
            for (let i = iterations - 1, divisor = 2 ** (iterations - 2); i > 0; i--, divisor /= 2) {
                let width = Math.max(Math.round(crc3.canvas.width / divisor), 1);
                let height = Math.max(Math.round(crc3.canvas.height / divisor), 1);
                crc3.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, WebGL2RenderingContext.COLOR_ATTACHMENT0, WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texBloomSamples[i - 1], 0);
                crc3.viewport(0, 0, Math.round(width), Math.round(height));
                RenderWebGL.bindTexture(FudgeCore.ShaderBloom, RenderWebGL.texBloomSamples[i], WebGL2RenderingContext.TEXTURE0, "u_texSource");
                crc3.uniform1i(FudgeCore.ShaderBloom.uniforms["u_iMode"], 2);
                crc3.uniform2f(FudgeCore.ShaderBloom.uniforms["u_vctTexel"], 0.5 / width, 0.5 / height);
                crc3.drawArrays(WebGL2RenderingContext.TRIANGLES, 0, 3);
            }
            crc3.viewport(0, 0, crc3.canvas.width, crc3.canvas.height);
            crc3.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, WebGL2RenderingContext.COLOR_ATTACHMENT0, WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texColor, 0);
            RenderWebGL.bindTexture(FudgeCore.ShaderBloom, RenderWebGL.texBloomSamples[0], WebGL2RenderingContext.TEXTURE0, "u_texSource");
            crc3.uniform1i(FudgeCore.ShaderBloom.uniforms["u_iMode"], 3);
            crc3.uniform1f(FudgeCore.ShaderBloom.uniforms["u_fIntensity"], _cmpBloom.intensity);
            crc3.uniform1f(FudgeCore.ShaderBloom.uniforms["u_fHighlightDesaturation"], _cmpBloom.highlightDesaturation);
            crc3.drawArrays(WebGL2RenderingContext.TRIANGLES, 0, 3);
            RenderWebGL.setBlendMode(BLEND.TRANSPARENT);
        }
        static drawNode(_node, _cmpCamera) {
            let cmpMesh = _node.getComponent(FudgeCore.ComponentMesh);
            let cmpMaterial = _node.getComponent(FudgeCore.ComponentMaterial);
            let cmpText = _node.getComponent(FudgeCore.ComponentText);
            let coat = cmpMaterial.material.coat;
            let cmpParticleSystem = _node.getComponent(FudgeCore.ComponentParticleSystem);
            let drawParticles = cmpParticleSystem && cmpParticleSystem.isActive;
            let shader = cmpMaterial.material.getShader();
            if (drawParticles)
                shader = cmpParticleSystem.particleSystem.getShaderFrom(shader);
            shader.useProgram();
            coat.useRenderData(shader, cmpMaterial);
            let mtxMeshToWorld = cmpMesh.mtxWorld;
            if (cmpText?.isActive)
                mtxMeshToWorld = cmpText.useRenderData(mtxMeshToWorld, _cmpCamera);
            let mtxMeshToView = RenderWebGL.calcMeshToView(_node, mtxMeshToWorld, _cmpCamera.mtxWorldToView, _cmpCamera.mtxWorld.translation);
            let renderBuffers = cmpMesh.mesh.useRenderBuffers(shader, mtxMeshToWorld, mtxMeshToView);
            if (cmpMesh.skeleton?.isActive)
                cmpMesh.skeleton.useRenderBuffer(shader);
            let uniform = shader.uniforms["u_vctCamera"];
            if (uniform)
                RenderWebGL.crc3.uniform3fv(uniform, _cmpCamera.mtxWorld.translation.get());
            uniform = shader.uniforms["u_mtxWorldToView"];
            if (uniform)
                RenderWebGL.crc3.uniformMatrix4fv(uniform, false, _cmpCamera.mtxWorldToView.get());
            uniform = shader.uniforms["u_mtxWorldToCamera"];
            if (uniform) {
                RenderWebGL.crc3.uniformMatrix4fv(uniform, false, _cmpCamera.mtxCameraInverse.get());
            }
            if (drawParticles)
                RenderWebGL.drawParticles(cmpParticleSystem, shader, renderBuffers, _node.getComponent(FudgeCore.ComponentFaceCamera), cmpMaterial.sortForAlpha);
            else
                RenderWebGL.crc3.drawElements(WebGL2RenderingContext.TRIANGLES, renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0);
        }
        static drawParticles(_cmpParticleSystem, _shader, _renderBuffers, _cmpFaceCamera, _sortForAlpha) {
            const crc3 = RenderWebGL.getRenderingContext();
            crc3.depthMask(_cmpParticleSystem.depthMask);
            RenderWebGL.setBlendMode(_cmpParticleSystem.blendMode);
            crc3.uniform1i(_shader.uniforms["u_iBlendMode"], _cmpParticleSystem.blendMode);
            _cmpParticleSystem.useRenderData();
            crc3.uniform1f(_shader.uniforms["u_fParticleSystemDuration"], _cmpParticleSystem.duration);
            crc3.uniform1f(_shader.uniforms["u_fParticleSystemSize"], _cmpParticleSystem.size);
            crc3.uniform1f(_shader.uniforms["u_fParticleSystemTime"], _cmpParticleSystem.time);
            crc3.uniform1i(_shader.uniforms[FudgeCore.TEXTURE_LOCATION.PARTICLE.UNIFORM], FudgeCore.TEXTURE_LOCATION.PARTICLE.INDEX);
            let faceCamera = _cmpFaceCamera && _cmpFaceCamera.isActive;
            crc3.uniform1i(_shader.uniforms["u_bParticleSystemFaceCamera"], faceCamera ? 1 : 0);
            crc3.uniform1i(_shader.uniforms["u_bParticleSystemRestrict"], faceCamera && _cmpFaceCamera.restrict ? 1 : 0);
            crc3.drawElementsInstanced(WebGL2RenderingContext.TRIANGLES, _renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0, _cmpParticleSystem.size);
            RenderWebGL.setBlendMode(BLEND.TRANSPARENT);
            crc3.depthMask(true);
        }
        static calcMeshToView(_node, _mtxMeshToWorld, _mtxWorldToView, _target) {
            let cmpFaceCamera = _node.getComponent(FudgeCore.ComponentFaceCamera);
            if (cmpFaceCamera && cmpFaceCamera.isActive) {
                let mtxMeshToView;
                mtxMeshToView = _mtxMeshToWorld.clone;
                mtxMeshToView.lookAt(_target, cmpFaceCamera.upLocal ? null : cmpFaceCamera.up, cmpFaceCamera.restrict);
                return FudgeCore.Matrix4x4.MULTIPLICATION(_mtxWorldToView, mtxMeshToView);
            }
            return FudgeCore.Matrix4x4.MULTIPLICATION(_mtxWorldToView, _mtxMeshToWorld);
        }
        static bindTexture(_shader, _texture, _unit, _uniform) {
            const crc3 = RenderWebGL.getRenderingContext();
            crc3.activeTexture(_unit);
            crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, _texture);
            crc3.uniform1i(_shader.uniforms[_uniform], _unit - WebGL2RenderingContext.TEXTURE0);
        }
    }
    FudgeCore.RenderWebGL = RenderWebGL;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class RenderInjectorTexture extends FudgeCore.RenderInjector {
        static decorate(_constructor) {
            FudgeCore.RenderInjector.inject(_constructor, RenderInjectorTexture);
            Object.defineProperty(_constructor.prototype, "deleteRenderData", {
                value: RenderInjectorTexture.deleteRenderData
            });
        }
        static injectTexture(_textureUnit = WebGL2RenderingContext.TEXTURE0) {
            let crc3 = FudgeCore.RenderWebGL.getRenderingContext();
            if (!this.renderData)
                this.renderData = FudgeCore.RenderWebGL.assert(crc3.createTexture());
            crc3.activeTexture(_textureUnit);
            crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, this.renderData);
            if (this.textureDirty) {
                try {
                    crc3.pixelStorei(crc3.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
                    crc3.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, this.texImageSource);
                    crc3.pixelStorei(crc3.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
                    this.mipmapDirty = true;
                    this.textureDirty = false;
                }
                catch (_error) {
                    FudgeCore.Debug.error(_error);
                }
            }
            if (this.mipmapDirty) {
                switch (this.mipmap) {
                    case FudgeCore.MIPMAP.CRISP:
                        crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MAG_FILTER, WebGL2RenderingContext.NEAREST);
                        crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.NEAREST);
                        break;
                    case FudgeCore.MIPMAP.MEDIUM:
                        crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MAG_FILTER, WebGL2RenderingContext.NEAREST);
                        crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.NEAREST_MIPMAP_LINEAR);
                        crc3.generateMipmap(WebGL2RenderingContext.TEXTURE_2D);
                        break;
                    case FudgeCore.MIPMAP.BLURRY:
                        crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MAG_FILTER, WebGL2RenderingContext.LINEAR);
                        crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.LINEAR_MIPMAP_LINEAR);
                        crc3.generateMipmap(WebGL2RenderingContext.TEXTURE_2D);
                        break;
                }
                this.mipmapDirty = false;
            }
            if (this.wrapDirty) {
                switch (this.wrap) {
                    case FudgeCore.WRAP.REPEAT:
                        crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_S, WebGL2RenderingContext.REPEAT);
                        crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_T, WebGL2RenderingContext.REPEAT);
                        break;
                    case FudgeCore.WRAP.CLAMP:
                        crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_S, WebGL2RenderingContext.CLAMP_TO_EDGE);
                        crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_T, WebGL2RenderingContext.CLAMP_TO_EDGE);
                        break;
                    case FudgeCore.WRAP.MIRROR:
                        crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_S, WebGL2RenderingContext.MIRRORED_REPEAT);
                        crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_T, WebGL2RenderingContext.MIRRORED_REPEAT);
                        break;
                }
                this.wrapDirty = false;
            }
        }
        static deleteRenderData() {
            if (!this.renderData)
                return;
            let crc3 = FudgeCore.RenderWebGL.getRenderingContext();
            crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, null);
            crc3.deleteTexture(this.renderData);
            this.renderData = null;
            this.textureDirty = true;
            this.mipmapDirty = true;
            this.wrapDirty = true;
        }
    }
    FudgeCore.RenderInjectorTexture = RenderInjectorTexture;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class EventPhysics extends Event {
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
        constructor() {
            this.hitPoint = FudgeCore.Vector3.ZERO();
            this.hitNormal = FudgeCore.Vector3.ZERO();
            this.rayEnd = FudgeCore.Vector3.ZERO();
            this.rayOrigin = FudgeCore.Vector3.ZERO();
            this.recycle();
        }
        recycle() {
            this.hit = false;
            this.hitDistance = 0;
            this.hitPoint.recycle();
            this.rigidbodyComponent = null;
            this.hitNormal.recycle();
            this.rayOrigin.recycle();
            this.rayEnd.recycle();
        }
    }
    FudgeCore.RayHitInfo = RayHitInfo;
    class PhysicsSettings {
        constructor(_defaultCollisionGroup, _defaultCollisionMask) {
            if (typeof OIMO == "undefined")
                return;
            this.defaultCollisionGroup = _defaultCollisionGroup;
            this.defaultCollisionMask = _defaultCollisionMask;
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
        get solverIterations() {
            return FudgeCore.Physics.activeInstance.getOimoWorld().getNumPositionIterations();
        }
        set solverIterations(_value) {
            FudgeCore.Physics.activeInstance.getOimoWorld().setNumPositionIterations(_value);
            FudgeCore.Physics.activeInstance.getOimoWorld().setNumVelocityIterations(_value);
        }
    }
    FudgeCore.PhysicsSettings = PhysicsSettings;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Joint extends FudgeCore.Component {
        static { this.baseClass = Joint; }
        static { this.subclasses = []; }
        #idBodyAnchor;
        #idBodyTied;
        #bodyAnchor;
        #bodyTied;
        #connected;
        #anchor;
        #internalCollision;
        #breakForce;
        #breakTorque;
        #nameChildToConnect;
        constructor(_bodyAnchor = null, _bodyTied = null) {
            super();
            this.singleton = false;
            this.#idBodyAnchor = 0;
            this.#idBodyTied = 0;
            this.#connected = false;
            this.#internalCollision = false;
            this.#breakForce = 0;
            this.#breakTorque = 0;
            this.hndEvent = (_event) => {
                switch (_event.type) {
                    case "componentAdd":
                        this.node.addEventListener("disconnectJoint", () => { this.disconnect(); this.dirtyStatus(); }, true);
                        this.dirtyStatus();
                        break;
                    case "componentRemove":
                        this.node.removeEventListener("disconnectJoint", () => { this.disconnect(); this.dirtyStatus(); }, true);
                        this.removeJoint();
                        break;
                }
            };
            this.#getMutator = () => {
                let mutator = {
                    nameChildToConnect: this.#nameChildToConnect,
                    internalCollision: this.#internalCollision,
                    breakForce: this.#breakForce,
                    breakTorque: this.#breakTorque
                };
                return mutator;
            };
            this.#mutate = (_mutator) => {
                this.mutateBase(_mutator, ["internalCollision", "breakForce", "breakTorque"]);
            };
            this.bodyAnchor = _bodyAnchor;
            this.bodyTied = _bodyTied;
            this.addEventListener("componentAdd", this.hndEvent);
            this.addEventListener("componentRemove", this.hndEvent);
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
        async mutate(_mutator, _selection = null, _dispatchMutate = true) {
            if (typeof (_mutator.anchor) !== "undefined")
                this.anchor = new FudgeCore.Vector3(...(Object.values(_mutator.anchor)));
            delete _mutator.anchor;
            if (typeof (_mutator.nameChildToConnect) !== "undefined")
                this.connectChild(_mutator.nameChildToConnect);
            this.#mutate(_mutator);
            this.deleteFromMutator(_mutator, this.#getMutator());
            await super.mutate(_mutator, _selection, _dispatchMutate);
        }
        reduceMutator(_mutator) {
            delete _mutator.springDamper;
            delete _mutator.joint;
            delete _mutator.motor;
            super.reduceMutator(_mutator);
        }
        dirtyStatus() {
            FudgeCore.Physics.changeJointStatus(this);
        }
        addJoint() {
            FudgeCore.Physics.addJoint(this);
        }
        removeJoint() {
            FudgeCore.Physics.removeJoint(this);
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
        #getMutator;
        #mutate;
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
        async mutate(_mutator, _selection = null, _dispatchMutate = true) {
            if (typeof (_mutator.axis) !== "undefined")
                this.axis = new FudgeCore.Vector3(...(Object.values(_mutator.axis)));
            delete _mutator.axis;
            this.#mutate(_mutator);
            this.deleteFromMutator(_mutator, this.#getMutator());
            await super.mutate(_mutator, _selection, _dispatchMutate);
        }
        getMutator() {
            let mutator = super.getMutator();
            mutator.axis = this.axis.getMutator();
            Object.assign(mutator, this.#getMutator());
            return mutator;
        }
        constructJoint() {
            this.springDamper = new OIMO.SpringDamper().setSpring(this.#springFrequency, this.#springDamping);
            super.constructJoint(this.#axis);
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
            this.mutateBase(_mutator, ["springDamping", "springFrequency", "maxMotor", "minMotor", "motorSpeed"]);
        };
    }
    FudgeCore.JointAxial = JointAxial;
})(FudgeCore || (FudgeCore = {}));
function ifNumber(_check, _default) {
    return typeof _check == "undefined" ? _default : _check;
}
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
        ANIMATION_PLAYMODE["LOOP"] = "loop";
        ANIMATION_PLAYMODE["PLAY_ONCE"] = "playOnce";
        ANIMATION_PLAYMODE["PLAY_ONCE_RESET"] = "playOnceReset";
        ANIMATION_PLAYMODE["REVERSE_LOOP"] = "reverseLoop";
        ANIMATION_PLAYMODE["STOP"] = "stop";
    })(ANIMATION_PLAYMODE = FudgeCore.ANIMATION_PLAYMODE || (FudgeCore.ANIMATION_PLAYMODE = {}));
    let ANIMATION_QUANTIZATION;
    (function (ANIMATION_QUANTIZATION) {
        ANIMATION_QUANTIZATION["CONTINOUS"] = "continous";
        ANIMATION_QUANTIZATION["DISCRETE"] = "discrete";
        ANIMATION_QUANTIZATION["FRAMES"] = "frames";
    })(ANIMATION_QUANTIZATION = FudgeCore.ANIMATION_QUANTIZATION || (FudgeCore.ANIMATION_QUANTIZATION = {}));
    class Animation extends FudgeCore.Mutable {
        static { this.subclasses = []; }
        static { this.iSubclass = Animation.registerSubclass(Animation); }
        #animationStructuresProcessed;
        constructor(_name = Animation.name, _animStructure = {}, _fps = 60) {
            super();
            this.idResource = undefined;
            this.totalTime = 0;
            this.labels = {};
            this.events = {};
            this.framesPerSecond = 60;
            this.eventsProcessed = new Map();
            this.#animationStructuresProcessed = new Map();
            this.name = _name;
            this.animationStructure = _animStructure;
            this.#animationStructuresProcessed.set(ANIMATION_STRUCTURE_TYPE.NORMAL, _animStructure);
            this.framesPerSecond = _fps;
            this.calculateTotalTime();
            FudgeCore.Project.register(this);
        }
        static registerSubclass(_subClass) { return Animation.subclasses.push(_subClass) - 1; }
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
            this.clearCache();
        }
        clearCache() {
            this.#animationStructuresProcessed.clear();
        }
        getState(_time, _direction, _quantization) {
            let m = {};
            let animationStructure;
            if (_quantization == ANIMATION_QUANTIZATION.CONTINOUS)
                animationStructure = _direction < 0 ? ANIMATION_STRUCTURE_TYPE.REVERSE : ANIMATION_STRUCTURE_TYPE.NORMAL;
            else
                animationStructure = _direction < 0 ? ANIMATION_STRUCTURE_TYPE.RASTEREDREVERSE : ANIMATION_STRUCTURE_TYPE.RASTERED;
            m = this.traverseStructureForMutator(this.getProcessedAnimationStructure(animationStructure), _time);
            return m;
        }
        getEventsToFire(_min, _max, _quantization, _direction) {
            let eventList = [];
            let minSection = Math.floor(_min / this.totalTime);
            let maxSection = Math.floor(_max / this.totalTime);
            _min = _min % this.totalTime;
            _max = _max % this.totalTime;
            while (minSection <= maxSection) {
                let eventTriggers = this.getCorrectEventList(_direction, _quantization);
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
                case ANIMATION_PLAYMODE.PLAY_ONCE:
                    if (_time >= this.totalTime)
                        return this.totalTime - 0.01;
                case ANIMATION_PLAYMODE.PLAY_ONCE_RESET:
                    if (_time >= this.totalTime)
                        return this.totalTime + 0.01;
            }
            return _time;
        }
        calculateDirection(_time, _playmode) {
            switch (_playmode) {
                case ANIMATION_PLAYMODE.STOP:
                    return 0;
                case ANIMATION_PLAYMODE.REVERSE_LOOP:
                    return -1;
                case ANIMATION_PLAYMODE.PLAY_ONCE:
                case ANIMATION_PLAYMODE.PLAY_ONCE_RESET:
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
                framesPerSecond: this.framesPerSecond
            };
            for (let name in this.labels) {
                s.labels[name] = this.labels[name];
            }
            for (let name in this.events) {
                s.events[name] = this.events[name];
            }
            s.animationStructure = this.traverseStructureForSerialization(this.animationStructure);
            return s;
        }
        async deserialize(_serialization) {
            FudgeCore.Project.register(this, _serialization.idResource);
            this.name = _serialization.name;
            this.framesPerSecond = _serialization.framesPerSecond;
            this.labels = {};
            for (let name in _serialization.labels) {
                this.labels[name] = _serialization.labels[name];
            }
            this.events = {};
            for (let name in _serialization.events) {
                this.events[name] = _serialization.events[name];
            }
            this.eventsProcessed = new Map();
            this.animationStructure = await this.traverseStructureForDeserialization(_serialization.animationStructure);
            this.#animationStructuresProcessed = new Map();
            this.calculateTotalTime();
            return this;
        }
        reduceMutator(_mutator) {
            delete _mutator.totalTime;
        }
        traverseStructureForSerialization(_structure) {
            let serialization = {};
            for (const property in _structure) {
                let structureOrSequence = _structure[property];
                if (structureOrSequence instanceof FudgeCore.AnimationSequence)
                    serialization[property] = structureOrSequence.serialize();
                else
                    serialization[property] = this.traverseStructureForSerialization(structureOrSequence);
            }
            return serialization;
        }
        async traverseStructureForDeserialization(_serialization) {
            let structure = {};
            for (let n in _serialization) {
                if (_serialization[n].animationSequence) {
                    let animSeq = new FudgeCore.AnimationSequence();
                    structure[n] = (await animSeq.deserialize(_serialization[n]));
                }
                else {
                    structure[n] = await this.traverseStructureForDeserialization(_serialization[n]);
                }
            }
            return structure;
        }
        getCorrectEventList(_direction, _quantization) {
            if (_quantization != ANIMATION_QUANTIZATION.FRAMES) {
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
                        let sequenceTime = sequence.getKey(sequence.length - 1).time;
                        this.totalTime = Math.max(sequenceTime, this.totalTime);
                    }
                }
                else {
                    this.traverseStructureForTime(_structure[n]);
                }
            }
        }
        getProcessedAnimationStructure(_type) {
            if (!this.#animationStructuresProcessed.has(_type)) {
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
                this.#animationStructuresProcessed.set(_type, ae);
            }
            return this.#animationStructuresProcessed.get(_type);
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
                let key = new FudgeCore.AnimationKey(this.totalTime - oldKey.time, oldKey.value, oldKey.interpolation, oldKey.slopeOut, oldKey.slopeIn);
                seq.addKey(key);
            }
            return seq;
        }
        calculateRasteredSequence(_sequence) {
            let seq = new FudgeCore.AnimationSequence();
            let frameTime = 1000 / this.framesPerSecond;
            for (let i = 0; i < this.totalTime; i += frameTime) {
                let key = new FudgeCore.AnimationKey(i, _sequence.evaluate(i), FudgeCore.ANIMATION_INTERPOLATION.CONSTANT, 0, 0);
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
        constructor(_keyIn, _keyOut = null) {
            this.a = 0;
            this.b = 0;
            this.c = 0;
            this.d = 0;
            this.keyIn = _keyIn;
            this.keyOut = _keyOut;
            this.calculate();
        }
        set setKeyIn(_keyIn) {
            this.keyIn = _keyIn;
            this.calculate();
        }
        set setKeyOut(_keyOut) {
            this.keyOut = _keyOut;
            this.calculate();
        }
        getParameters() {
            return { a: this.a, b: this.b, c: this.c, d: this.d };
        }
        evaluate(_time) {
            _time -= this.keyIn.time;
            let time2 = _time * _time;
            let time3 = time2 * _time;
            return this.a * time3 + this.b * time2 + this.c * _time + this.d;
        }
        calculate() {
            if (!this.keyIn) {
                this.d = this.c = this.b = this.a = 0;
                return;
            }
            if (!this.keyOut || this.keyIn.interpolation == FudgeCore.ANIMATION_INTERPOLATION.CONSTANT) {
                this.d = this.keyIn.value;
                this.c = this.b = this.a = 0;
                return;
            }
            let x1 = this.keyOut.time - this.keyIn.time;
            this.d = this.keyIn.value;
            if (this.keyIn.interpolation == FudgeCore.ANIMATION_INTERPOLATION.LINEAR) {
                this.c = (this.keyOut.value - this.keyIn.value) / x1;
                return;
            }
            this.c = this.keyIn.slopeOut;
            this.a = (-x1 * (this.keyIn.slopeOut + this.keyOut.slopeIn) - 2 * this.keyIn.value + 2 * this.keyOut.value) / -Math.pow(x1, 3);
            this.b = (this.keyOut.slopeIn - this.keyIn.slopeOut - 3 * this.a * Math.pow(x1, 2)) / (2 * x1);
        }
    }
    FudgeCore.AnimationFunction = AnimationFunction;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class AnimationGLTF extends FudgeCore.mixinSerializableResourceExternal(FudgeCore.Animation) {
        async load(_url = this.url, _name = this.name) {
            this.url = _url;
            this.name = _name;
            return FudgeCore.GLTFLoader.loadResource(this);
        }
        serialize() {
            const serialization = super.serialize();
            serialization.framesPerSecond = this.fps;
            return serialization;
        }
    }
    FudgeCore.AnimationGLTF = AnimationGLTF;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    let ANIMATION_INTERPOLATION;
    (function (ANIMATION_INTERPOLATION) {
        ANIMATION_INTERPOLATION[ANIMATION_INTERPOLATION["CONSTANT"] = 0] = "CONSTANT";
        ANIMATION_INTERPOLATION[ANIMATION_INTERPOLATION["LINEAR"] = 1] = "LINEAR";
        ANIMATION_INTERPOLATION[ANIMATION_INTERPOLATION["CUBIC"] = 2] = "CUBIC";
    })(ANIMATION_INTERPOLATION = FudgeCore.ANIMATION_INTERPOLATION || (FudgeCore.ANIMATION_INTERPOLATION = {}));
    class AnimationKey extends FudgeCore.Mutable {
        #time;
        #value;
        #interpolation;
        #slopeIn = 0;
        #slopeOut = 0;
        constructor(_time = 0, _value = 0, _interpolation = ANIMATION_INTERPOLATION.CUBIC, _slopeIn = 0, _slopeOut = 0) {
            super();
            this.#time = _time;
            this.#value = _value;
            this.#interpolation = _interpolation;
            this.#slopeIn = _slopeIn;
            this.#slopeOut = _slopeOut;
            this.functionOut = new FudgeCore.AnimationFunction(this, null);
        }
        static compare(_a, _b) {
            return _a.time - _b.time;
        }
        get time() {
            return this.#time;
        }
        set time(_time) {
            this.#time = _time;
            this.functionIn.calculate();
            this.functionOut.calculate();
        }
        get value() {
            return this.#value;
        }
        set value(_value) {
            this.#value = _value;
            this.functionIn.calculate();
            this.functionOut.calculate();
        }
        get interpolation() {
            return this.#interpolation;
        }
        set interpolation(_interpolation) {
            this.#interpolation = _interpolation;
            this.functionIn.calculate();
            this.functionOut.calculate();
        }
        get slopeIn() {
            return this.#slopeIn;
        }
        set slopeIn(_slope) {
            this.#slopeIn = _slope;
            this.functionIn.calculate();
        }
        get slopeOut() {
            return this.#slopeOut;
        }
        set slopeOut(_slope) {
            this.#slopeOut = _slope;
            this.functionOut.calculate();
        }
        serialize() {
            let serialization = {};
            serialization.time = this.#time;
            serialization.value = this.#value;
            serialization.interpolation = this.#interpolation;
            serialization.slopeIn = this.#slopeIn;
            serialization.slopeOut = this.#slopeOut;
            return serialization;
        }
        async deserialize(_serialization) {
            this.#time = _serialization.time;
            this.#value = _serialization.value;
            this.#interpolation = _serialization.interpolation;
            this.#slopeIn = _serialization.slopeIn;
            this.#slopeOut = _serialization.slopeOut;
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
        constructor(_keys = []) {
            super();
            this.keys = _keys;
            this.regenerateFunctions();
        }
        get length() {
            return this.keys.length;
        }
        evaluate(_time) {
            if (this.keys.length == 0)
                return undefined;
            if (this.keys.length == 1 || this.keys[0].time >= _time)
                return this.keys[0].value;
            for (let i = 0; i < this.keys.length - 1; i++) {
                if (this.keys[i].time <= _time && _time < this.keys[i + 1].time) {
                    return this.keys[i].functionOut.evaluate(_time);
                }
            }
            return this.keys[this.keys.length - 1].value;
        }
        addKey(_key) {
            this.keys.push(_key);
            this.keys.sort(FudgeCore.AnimationKey.compare);
            this.regenerateFunctions();
        }
        modifyKey(_key, _time, _value) {
            if (_time != null)
                _key.time = _time;
            if (_value != null)
                _key.value = _value;
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
        findKey(_time) {
            for (let key of this.keys)
                if (key.time == _time)
                    return key;
            return null;
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
        getKeys() {
            return this.keys;
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
        reduceMutator(_mutator) { }
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
    class AnimationSprite extends FudgeCore.Animation {
        static { this.iSubclass = FudgeCore.Animation.registerSubclass(AnimationSprite); }
        constructor(_name = "AnimationSprite") {
            super(_name, {}, 1);
            this.texture = FudgeCore.TextureDefault.color;
            this.frames = 25;
            this.wrapAfter = 5;
            this.start = new FudgeCore.Vector2(0, 0);
            this.size = new FudgeCore.Vector2(80, 80);
            this.next = new FudgeCore.Vector2(80, 0);
            this.wrap = new FudgeCore.Vector2(0, 80);
            this.framesPerSecond = this.frames;
            this.create(this.texture, this.frames, this.wrapAfter, this.start, this.size, this.next, this.wrap, this.framesPerSecond);
        }
        setTexture(_texture) {
            this.texture = _texture;
            this.idTexture = _texture.idResource;
        }
        create(_texture, _frames, _wrapAfter, _start, _size, _next, _wrap, _framesPerSecond) {
            this.setTexture(_texture);
            this.frames = _frames;
            this.wrapAfter = _wrapAfter;
            this.start = _start;
            this.size = _size;
            this.next = _next;
            this.wrap = _wrap;
            this.framesPerSecond = _framesPerSecond;
            let scale = this.getScale();
            let positions = this.getPositions();
            let xTranslation = new FudgeCore.AnimationSequence();
            let yTranslation = new FudgeCore.AnimationSequence();
            let xScale = new FudgeCore.AnimationSequence();
            let yScale = new FudgeCore.AnimationSequence();
            xScale.addKey(new FudgeCore.AnimationKey(0, scale.x));
            yScale.addKey(new FudgeCore.AnimationKey(0, scale.y));
            for (let frame = 0; frame <= this.frames; frame++) {
                let time = 1000 * frame / this.framesPerSecond;
                let position = positions[Math.min(frame, this.frames - 1)];
                xTranslation.addKey(new FudgeCore.AnimationKey(time, position.x / this.texture.texImageSource.width));
                yTranslation.addKey(new FudgeCore.AnimationKey(time, position.y / this.texture.texImageSource.height));
            }
            this.animationStructure = {
                "components": {
                    "ComponentMaterial": [{
                            "mtxPivot": {
                                "translation": {
                                    x: xTranslation,
                                    y: yTranslation
                                },
                                "scaling": {
                                    x: xScale,
                                    y: yScale
                                }
                            }
                        }]
                }
            };
            this.calculateTotalTime();
        }
        getScale() {
            return new FudgeCore.Vector2(this.size.x / this.texture.texImageSource.width, this.size.y / this.texture.texImageSource.height);
        }
        getPositions() {
            let iNext = 0;
            let iWrap = 0;
            let positions = [];
            for (let frame = 0; frame < this.frames; frame++) {
                positions.push(new FudgeCore.Vector2(this.start.x + iNext * this.next.x + iWrap * this.wrap.x, this.start.y + iNext * this.next.y + iWrap * this.wrap.y));
                iNext++;
                if (iNext >= this.wrapAfter) {
                    iNext = 0;
                    iWrap++;
                }
            }
            return positions;
        }
        async mutate(_mutator, _selection, _dispatchMutate) {
            super.mutate(_mutator, _selection, _dispatchMutate);
            this.create(this.texture, this.frames, this.wrapAfter, this.start, this.size, this.next, this.wrap, this.framesPerSecond);
        }
        serialize() {
            let serialization = {};
            serialization.idResource = this.idResource;
            serialization.idTexture = this.idTexture;
            serialization.frames = this.frames;
            serialization.wrapAfter = this.wrapAfter;
            for (let name of ["start", "size", "next", "wrap"])
                serialization[name] = Reflect.get(this, name).serialize();
            let animationsStructure = this.animationStructure;
            this.animationStructure = {};
            serialization[super.constructor.name] = super.serialize();
            this.animationStructure = animationsStructure;
            return serialization;
        }
        async deserialize(_s) {
            await super.deserialize(_s[super.constructor.name]);
            if (_s.idTexture)
                this.texture = await FudgeCore.Project.getResource(_s.idTexture);
            else
                this.texture = FudgeCore.TextureDefault.color;
            for (let name of ["start", "size", "next", "wrap"])
                Reflect.get(this, name).deserialize(_s[name]);
            this.create(this.texture, _s.frames, _s.wrapAfter, this.start, this.size, this.next, this.wrap, this.framesPerSecond);
            return this;
        }
        convertToAnimation() {
            let animation = new FudgeCore.Animation(this.name, this.animationStructure, this.framesPerSecond);
            return animation;
        }
    }
    FudgeCore.AnimationSprite = AnimationSprite;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Audio extends FudgeCore.Mutable {
        constructor(_url) {
            super();
            this.name = "Audio";
            this.idResource = undefined;
            this.buffer = undefined;
            this.path = undefined;
            this.url = undefined;
            this.ready = false;
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
        async mutate(_mutator, _selection, _dispatchMutate) {
            let url = _mutator.url;
            if (_mutator.url != this.url.toString())
                this.load(_mutator.url);
            delete (_mutator.url);
            super.mutate(_mutator, _selection, _dispatchMutate);
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
        static { this.default = new AudioManager({ latencyHint: "interactive", sampleRate: 44100 }); }
        static { this.eventUpdate = new Event("updateAudioGraph"); }
        constructor(_contextOptions) {
            super(_contextOptions);
            this.graph = null;
            this.cmpListener = null;
            this.listenTo = (_graph) => {
                if (this.graph)
                    this.graph.broadcastEvent(new Event("childRemoveFromAudioGraph"));
                if (!_graph)
                    return;
                this.graph = _graph;
                this.graph.broadcastEvent(new Event("childAppendToAudioGraph"));
            };
            this.getGraphListeningTo = () => {
                return this.graph;
            };
            this.listenWith = (_cmpListener) => {
                this.cmpListener = _cmpListener;
            };
            this.update = () => {
                if (this.state != "running")
                    return;
                this.graph.broadcastEvent(AudioManager.eventUpdate);
                if (this.cmpListener)
                    this.cmpListener.update(this.listener);
            };
            this.gain = this.createGain();
            this.gain.connect(this.destination);
        }
        set volume(_value) {
            this.gain.gain.value = _value;
        }
        get volume() {
            return this.gain.gain.value;
        }
    }
    FudgeCore.AudioManager = AudioManager;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ComponentAmbientOcclusion extends FudgeCore.Component {
        static { this.iSubclass = FudgeCore.Component.registerSubclass(ComponentAmbientOcclusion); }
        constructor(_sampleRadius = 16, _bias = 0.07, _attenuationConstant = 2.5, _attenuationLinear = 1, _attenuationQuadratic = 1) {
            super();
            this.sampleRadius = _sampleRadius;
            this.bias = _bias;
            this.attenuationConstant = _attenuationConstant;
            this.attenuationLinear = _attenuationLinear;
            this.attenuationQuadratic = _attenuationQuadratic;
        }
        serialize() {
            let serialization = {
                sampleRadius: this.sampleRadius,
                bias: this.bias,
                attenuationConstant: this.attenuationConstant,
                attenuationLinear: this.attenuationLinear,
                attenuationQuadratic: this.attenuationQuadratic
            };
            serialization[super.constructor.name] = super.serialize();
            return serialization;
        }
        async deserialize(_serialization) {
            this.sampleRadius = _serialization.sampleRadius;
            this.bias = _serialization.bias;
            this.attenuationConstant = _serialization.attenuationConstant;
            this.attenuationLinear = _serialization.attenuationLinear;
            this.attenuationQuadratic = _serialization.attenuationQuadratic;
            await super.deserialize(_serialization[super.constructor.name]);
            return this;
        }
    }
    FudgeCore.ComponentAmbientOcclusion = ComponentAmbientOcclusion;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ComponentAnimator extends FudgeCore.Component {
        static { this.iSubclass = FudgeCore.Component.registerSubclass(ComponentAnimator); }
        #scale;
        #timeLocal;
        #previous;
        constructor(_animation, _playmode = FudgeCore.ANIMATION_PLAYMODE.LOOP, _quantization = FudgeCore.ANIMATION_QUANTIZATION.CONTINOUS) {
            super();
            this.scaleWithGameTime = true;
            this.animateInEditor = false;
            this.#scale = 1;
            this.#previous = 0;
            this.updateAnimationLoop = (_e, _time) => {
                if (this.animation.totalTime == 0)
                    return null;
                let time = _time || _time === 0 ? _time : this.#timeLocal.get();
                if (this.quantization == FudgeCore.ANIMATION_QUANTIZATION.FRAMES) {
                    time = this.#previous + (1000 / this.animation.fps);
                }
                let direction = this.animation.calculateDirection(time, this.playmode);
                time = this.animation.getModalTime(time, this.playmode, this.#timeLocal.getOffset());
                this.executeEvents(this.animation.getEventsToFire(this.#previous, time, this.quantization, direction));
                if (this.#previous != time) {
                    this.#previous = time;
                    time = time % this.animation.totalTime;
                    let mutator = this.animation.getState(time, direction, this.quantization);
                    if (this.node) {
                        this.node.applyAnimation(mutator);
                    }
                    return mutator;
                }
                return null;
            };
            this.updateScale = () => {
                let newScale = this.#scale;
                if (this.scaleWithGameTime)
                    newScale *= FudgeCore.Time.game.getScale();
                this.#timeLocal.setScale(newScale);
            };
            this.playmode = _playmode;
            this.quantization = _quantization;
            this.animation = _animation;
            this.#timeLocal = new FudgeCore.Time();
            this.animation?.calculateTotalTime();
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
        set time(_time) {
            this.jumpTo(_time);
        }
        activate(_on) {
            super.activate(_on);
            if (!this.node)
                return;
            this.activateListeners(_on);
        }
        jumpTo(_time) {
            this.#timeLocal.set(_time);
            this.#previous = _time;
            _time = _time % this.animation.totalTime;
            let mutator = this.animation.getState(_time, this.animation.calculateDirection(_time, this.playmode), this.quantization);
            this.node.applyAnimation(mutator);
        }
        jumpToLabel(_label) {
            let time = this.animation.labels[_label];
            if (time)
                this.jumpTo(time);
        }
        updateAnimation(_time) {
            this.#previous = undefined;
            return this.updateAnimationLoop(null, _time);
        }
        serialize() {
            let serialization = {};
            serialization[super.constructor.name] = super.serialize();
            serialization.idAnimation = this.animation.idResource;
            serialization.playmode = this.playmode;
            serialization.quantization = this.quantization;
            serialization.scale = this.scale;
            serialization.scaleWithGameTime = this.scaleWithGameTime;
            serialization.animateInEditor = this.animateInEditor;
            return serialization;
        }
        async deserialize(_serialization) {
            await super.deserialize(_serialization[super.constructor.name]);
            this.animation = await FudgeCore.Project.getResource(_serialization.idAnimation);
            this.playmode = _serialization.playmode;
            this.quantization = _serialization.quantization;
            this.scale = _serialization.scale;
            this.scaleWithGameTime = _serialization.scaleWithGameTime;
            this.animateInEditor = _serialization.animateInEditor;
            return this;
        }
        async mutate(_mutator, _selection = null, _dispatchMutate = true) {
            await super.mutate(_mutator, _selection, _dispatchMutate);
            if (typeof (_mutator.animateInEditor) !== "undefined") {
                this.updateAnimation(0);
                this.activateListeners(this.active);
            }
        }
        getMutatorAttributeTypes(_mutator) {
            let types = super.getMutatorAttributeTypes(_mutator);
            if (types.playmode)
                types.playmode = FudgeCore.ANIMATION_PLAYMODE;
            if (types.quantization)
                types.quantization = FudgeCore.ANIMATION_QUANTIZATION;
            return types;
        }
        activateListeners(_on) {
            if (_on && (FudgeCore.Project.mode != FudgeCore.MODE.EDITOR || FudgeCore.Project.mode == FudgeCore.MODE.EDITOR && this.animateInEditor)) {
                FudgeCore.Time.game.addEventListener("timeScaled", this.updateScale);
                this.node.addEventListener("renderPrepare", this.updateAnimationLoop);
            }
            else {
                FudgeCore.Time.game.removeEventListener("timeScaled", this.updateScale);
                this.node.removeEventListener("renderPrepare", this.updateAnimationLoop);
            }
        }
        executeEvents(_events) {
            for (let i = 0; i < _events.length; i++) {
                this.dispatchEvent(new Event(_events[i]));
            }
        }
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
        static { this.iSubclass = FudgeCore.Component.registerSubclass(ComponentAudio); }
        constructor(_audio = null, _loop = false, _start = false, _audioManager = FudgeCore.AudioManager.default) {
            super();
            this.mtxPivot = FudgeCore.Matrix4x4.IDENTITY();
            this.singleton = false;
            this.playing = false;
            this.listened = false;
            this.hndAudioReady = (_event) => {
                FudgeCore.Debug.fudge("Audio start", Reflect.get(_event.target, "url"));
                if (this.playing)
                    this.play(true);
            };
            this.hndAudioEnded = (_event) => {
                this.playing = false;
            };
            this.handleAttach = (_event) => {
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
            this.handleGraph = (_event) => {
                this.listened = (_event.type == "childAppendToAudioGraph");
                this.updateConnection();
            };
            this.update = (_event) => {
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
        set playbackRate(_value) {
            this.source.playbackRate.value = _value;
        }
        get playbackRate() {
            return this.source.playbackRate.value;
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
                    this.createSource(this.audio, this.source.loop, this.playbackRate);
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
        drawGizmos() {
            let mtxShape = FudgeCore.Matrix4x4.MULTIPLICATION(this.node.mtxWorld, this.mtxPivot);
            mtxShape.scaling = new FudgeCore.Vector3(0.5, 0.5, 0.5);
            let color = FudgeCore.Color.CSS("cornflowerblue");
            FudgeCore.Gizmos.drawIcon(FudgeCore.TextureDefault.iconAudio, mtxShape, color);
            FudgeCore.Recycler.storeMultiple(mtxShape, color);
        }
        ;
        serialize() {
            let serialization = super.serialize();
            serialization.idResource = this.audio?.idResource;
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
        reduceMutator(_mutator) {
            super.reduceMutator(_mutator);
            delete _mutator.listened;
        }
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
        createSource(_audio, _loop, _playbackRate = 1.0) {
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
            this.playbackRate = _playbackRate;
        }
        updateConnection() {
            try {
                this.connect(this.isActive && this.isAttached && this.listened);
            }
            catch (_error) {
            }
        }
    }
    FudgeCore.ComponentAudio = ComponentAudio;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ComponentAudioListener extends FudgeCore.Component {
        constructor() {
            super(...arguments);
            this.mtxPivot = FudgeCore.Matrix4x4.IDENTITY();
        }
        static { this.iSubclass = FudgeCore.Component.registerSubclass(ComponentAudioListener); }
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
            if (this.node)
                FudgeCore.Recycler.store(mtxResult);
        }
    }
    FudgeCore.ComponentAudioListener = ComponentAudioListener;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ComponentBloom extends FudgeCore.Component {
        static { this.iSubclass = FudgeCore.Component.registerSubclass(ComponentBloom); }
        #threshold;
        #intensity;
        #highlightDesaturation;
        constructor(_threshold = 0.95, _intensity = 1.0, _desaturateHighlights = 0.5) {
            super();
            this.#threshold = _threshold;
            this.#intensity = _intensity;
            this.#highlightDesaturation = _desaturateHighlights;
        }
        get threshold() {
            return this.#threshold;
        }
        set threshold(_value) {
            this.#threshold = FudgeCore.Calc.clamp(_value, 0, 1);
        }
        get intensity() {
            return this.#intensity;
        }
        set intensity(_value) {
            this.#intensity = Math.max(0, _value);
        }
        get highlightDesaturation() {
            return this.#highlightDesaturation;
        }
        set highlightDesaturation(_value) {
            this.#highlightDesaturation = FudgeCore.Calc.clamp(_value, 0, 1);
        }
        serialize() {
            let serialization = {
                threshold: this.#threshold,
                intensity: this.#intensity,
                desaturateHighlights: this.#highlightDesaturation,
            };
            serialization[super.constructor.name] = super.serialize();
            return serialization;
        }
        async deserialize(_serialization) {
            this.#threshold = _serialization.threshold;
            this.#intensity = _serialization.intensity;
            this.#highlightDesaturation = _serialization.desaturateHighlights;
            await super.deserialize(_serialization[super.constructor.name]);
            return this;
        }
        getMutator() {
            let mutator = super.getMutator(true);
            mutator.threshold = this.threshold;
            mutator.intensity = this.intensity;
            mutator.highlightDesaturation = this.highlightDesaturation;
            return mutator;
        }
    }
    FudgeCore.ComponentBloom = ComponentBloom;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    let FIELD_OF_VIEW;
    (function (FIELD_OF_VIEW) {
        FIELD_OF_VIEW["HORIZONTAL"] = "horizontal";
        FIELD_OF_VIEW["VERTICAL"] = "vertical";
        FIELD_OF_VIEW["DIAGONAL"] = "diagonal";
    })(FIELD_OF_VIEW = FudgeCore.FIELD_OF_VIEW || (FudgeCore.FIELD_OF_VIEW = {}));
    let PROJECTION;
    (function (PROJECTION) {
        PROJECTION["CENTRAL"] = "central";
        PROJECTION["ORTHOGRAPHIC"] = "orthographic";
        PROJECTION["DIMETRIC"] = "dimetric";
        PROJECTION["STEREO"] = "stereo";
    })(PROJECTION = FudgeCore.PROJECTION || (FudgeCore.PROJECTION = {}));
    class ComponentCamera extends FudgeCore.Component {
        constructor() {
            super(...arguments);
            this.mtxPivot = FudgeCore.Matrix4x4.IDENTITY();
            this.clrBackground = new FudgeCore.Color(0, 0, 0, 1);
            this.projection = PROJECTION.CENTRAL;
            this.fieldOfView = 45;
            this.aspectRatio = 1.0;
            this.direction = FIELD_OF_VIEW.DIAGONAL;
            this.near = 1;
            this.far = 2000;
            this.backgroundEnabled = true;
            this.#mtxProjection = new FudgeCore.Matrix4x4;
        }
        static { this.iSubclass = FudgeCore.Component.registerSubclass(ComponentCamera); }
        #mtxWorldToView;
        #mtxCameraInverse;
        #mtxProjection;
        get mtxWorld() {
            let mtxCamera = this.mtxPivot.clone;
            try {
                mtxCamera = FudgeCore.Matrix4x4.MULTIPLICATION(this.node.mtxWorld, this.mtxPivot);
            }
            catch (_error) {
            }
            return mtxCamera;
        }
        get mtxWorldToView() {
            if (this.#mtxWorldToView)
                return this.#mtxWorldToView;
            this.#mtxWorldToView = FudgeCore.Matrix4x4.MULTIPLICATION(this.#mtxProjection, this.mtxCameraInverse);
            return this.#mtxWorldToView;
        }
        get mtxCameraInverse() {
            if (this.#mtxCameraInverse)
                return this.#mtxCameraInverse;
            this.#mtxCameraInverse = FudgeCore.Matrix4x4.INVERSION(this.mtxWorld);
            return this.#mtxCameraInverse;
        }
        get mtxProjection() {
            if (this.#mtxProjection)
                return this.#mtxProjection;
            this.#mtxProjection = new FudgeCore.Matrix4x4;
            return this.#mtxProjection;
        }
        resetWorldToView() {
            if (this.#mtxWorldToView)
                FudgeCore.Recycler.store(this.#mtxWorldToView);
            if (this.#mtxCameraInverse)
                FudgeCore.Recycler.store(this.#mtxCameraInverse);
            this.#mtxWorldToView = null;
            this.#mtxCameraInverse = null;
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
        projectCentral(_aspect = this.aspectRatio, _fieldOfView = this.fieldOfView, _direction = this.direction, _near = this.near, _far = this.far) {
            this.aspectRatio = _aspect;
            this.fieldOfView = _fieldOfView;
            this.direction = _direction;
            this.projection = PROJECTION.CENTRAL;
            this.near = _near;
            this.far = _far;
            this.#mtxProjection = FudgeCore.Matrix4x4.PROJECTION_CENTRAL(_aspect, this.fieldOfView, _near, _far, this.direction);
        }
        projectOrthographic(_left = -FudgeCore.Render.getCanvas().clientWidth / 2, _right = FudgeCore.Render.getCanvas().clientWidth / 2, _bottom = FudgeCore.Render.getCanvas().clientHeight / 2, _top = -FudgeCore.Render.getCanvas().clientHeight / 2) {
            this.projection = PROJECTION.ORTHOGRAPHIC;
            this.#mtxProjection = FudgeCore.Matrix4x4.PROJECTION_ORTHOGRAPHIC(_left, _right, _bottom, _top, 400, -400);
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
                near: this.near,
                far: this.far,
                aspect: this.aspectRatio,
                pivot: this.mtxPivot.serialize(),
                [super.constructor.name]: super.serialize()
            };
            return serialization;
        }
        async deserialize(_serialization) {
            await this.clrBackground.deserialize(_serialization.backgroundColor);
            this.backgroundEnabled = _serialization.backgroundEnabled;
            this.projection = _serialization.projection;
            this.fieldOfView = _serialization.fieldOfView;
            this.aspectRatio = _serialization.aspect;
            this.direction = _serialization.direction;
            this.near = _serialization.near ?? this.near;
            this.far = _serialization.far ?? this.far;
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
        async mutate(_mutator, _selection = null, _dispatchMutate = true) {
            await super.mutate(_mutator, _selection, _dispatchMutate);
            switch (this.projection) {
                case PROJECTION.CENTRAL:
                    this.projectCentral(this.aspectRatio, this.fieldOfView, this.direction, this.near, this.far);
                    break;
            }
        }
        drawGizmos() {
            let mtxWorld = this.mtxWorld.clone;
            mtxWorld.scaling = new FudgeCore.Vector3(0.5, 0.5, 0.5);
            let color = FudgeCore.Color.CSS("lightgrey");
            FudgeCore.Gizmos.drawIcon(FudgeCore.TextureDefault.iconCamera, mtxWorld, color);
            FudgeCore.Recycler.storeMultiple(mtxWorld, color);
        }
        drawGizmosSelected() {
            FudgeCore.Gizmos.drawWireFrustum(this.getAspect(), this.getFieldOfView(), this.getNear(), this.getFar(), this.getDirection(), this.mtxWorld, FudgeCore.Color.CSS("lightgrey"));
        }
        ;
        reduceMutator(_mutator) {
            delete _mutator.transform;
            super.reduceMutator(_mutator);
        }
    }
    FudgeCore.ComponentCamera = ComponentCamera;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ComponentFaceCamera extends FudgeCore.Component {
        static { this.iSubclass = FudgeCore.Component.registerSubclass(ComponentFaceCamera); }
        constructor() {
            super();
            this.upLocal = true;
            this.up = FudgeCore.Vector3.Y(1);
            this.restrict = false;
            this.singleton = true;
        }
    }
    FudgeCore.ComponentFaceCamera = ComponentFaceCamera;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ComponentFog extends FudgeCore.Component {
        static { this.iSubclass = FudgeCore.Component.registerSubclass(ComponentFog); }
        constructor(_color = new FudgeCore.Color(1, 1, 1, 1), _near = 1, _far = 50) {
            super();
            this.color = _color;
            this.near = _near;
            this.far = _far;
        }
        serialize() {
            let serialization = {
                color: this.color.serialize(),
                near: this.near,
                far: this.far
            };
            serialization[super.constructor.name] = super.serialize();
            return serialization;
        }
        async deserialize(_serialization) {
            await this.color.deserialize(_serialization.color);
            this.near = _serialization.near ?? this.near;
            this.far = _serialization.far ?? this.far;
            await super.deserialize(_serialization[super.constructor.name]);
            return this;
        }
    }
    FudgeCore.ComponentFog = ComponentFog;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ComponentGraphFilter extends FudgeCore.Component {
        static { this.iSubclass = FudgeCore.Component.registerSubclass(ComponentGraphFilter); }
        constructor() {
            super();
            this.singleton = true;
        }
        serialize() {
            return this.getMutator();
        }
        async deserialize(_serialization) {
            this.mutate(_serialization);
            return this;
        }
    }
    FudgeCore.ComponentGraphFilter = ComponentGraphFilter;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Light extends FudgeCore.Mutable {
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
    }
    FudgeCore.LightAmbient = LightAmbient;
    class LightDirectional extends Light {
    }
    FudgeCore.LightDirectional = LightDirectional;
    class LightPoint extends Light {
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
        static { this.iSubclass = FudgeCore.Component.registerSubclass(ComponentLight); }
        constructor(_light = new FudgeCore.LightAmbient()) {
            super();
            this.mtxPivot = FudgeCore.Matrix4x4.IDENTITY();
            this.light = null;
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
            serialization[super.constructor.name] = super.serialize();
            return serialization;
        }
        async deserialize(_serialization) {
            await super.deserialize(_serialization[super.constructor.name]);
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
        async mutate(_mutator, _selection = null, _dispatchMutate = true) {
            let type = _mutator.type;
            if (typeof (type) !== "undefined" && type != this.light.constructor.name)
                this.setType(FudgeCore.Serializer.getConstructor(type));
            delete (_mutator.type);
            super.mutate(_mutator, _selection, _dispatchMutate);
            _mutator.type = type;
        }
        drawGizmos() {
            let mtxShape = FudgeCore.Matrix4x4.MULTIPLICATION(this.node.mtxWorld, this.mtxPivot);
            mtxShape.scaling = new FudgeCore.Vector3(0.5, 0.5, 0.5);
            FudgeCore.Gizmos.drawIcon(FudgeCore.TextureDefault.iconLight, mtxShape, this.light.color);
            FudgeCore.Recycler.store(mtxShape);
        }
        ;
        drawGizmosSelected() {
            let mtxShape = FudgeCore.Matrix4x4.MULTIPLICATION(this.node.mtxWorld, this.mtxPivot);
            let color = FudgeCore.Color.CSS("yellow");
            switch (this.light.getType()) {
                case FudgeCore.LightDirectional:
                    const radius = 0.5;
                    FudgeCore.Gizmos.drawWireCircle(mtxShape, color);
                    const lines = new Array(10).fill(null).map(() => FudgeCore.Recycler.get(FudgeCore.Vector3));
                    lines[0].set(0, 0, 0);
                    lines[1].set(0, 0, 1);
                    lines[2].set(0, radius, 0);
                    lines[3].set(0, radius, 1);
                    lines[6].set(0, -radius, 0);
                    lines[7].set(0, -radius, 1);
                    lines[4].set(radius, 0, 0);
                    lines[5].set(radius, 0, 1);
                    lines[8].set(-radius, 0, 0);
                    lines[9].set(-radius, 0, 1);
                    FudgeCore.Gizmos.drawLines(lines, mtxShape, color);
                    FudgeCore.Recycler.storeMultiple(...lines);
                    break;
                case FudgeCore.LightPoint:
                    mtxShape.scale(new FudgeCore.Vector3(2, 2, 2));
                    FudgeCore.Gizmos.drawWireSphere(mtxShape, color);
                    break;
                case FudgeCore.LightSpot:
                    FudgeCore.Gizmos.drawWireCone(mtxShape, color);
                    break;
            }
            FudgeCore.Recycler.storeMultiple(mtxShape, color);
        }
    }
    FudgeCore.ComponentLight = ComponentLight;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ComponentMaterial extends FudgeCore.Component {
        static { this.iSubclass = FudgeCore.Component.registerSubclass(ComponentMaterial); }
        constructor(_material = null) {
            super();
            this.clrPrimary = FudgeCore.Color.CSS("white");
            this.clrSecondary = FudgeCore.Color.CSS("white");
            this.mtxPivot = FudgeCore.Matrix3x3.IDENTITY();
            this.sortForAlpha = false;
            this.material = _material;
        }
        get hasTransparency() {
            return this.material?.hasTransparency || this.clrPrimary.a < 1;
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
        static { this.iSubclass = FudgeCore.Component.registerSubclass(ComponentMesh); }
        constructor(_mesh, _skeleton) {
            super();
            this.mtxPivot = FudgeCore.Matrix4x4.IDENTITY();
            this.mtxWorld = FudgeCore.Matrix4x4.IDENTITY();
            this.mesh = _mesh;
            this.skeleton = _skeleton;
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
            if (this.skeleton)
                serialization.skeleton = FudgeCore.Node.PATH_FROM_TO(this, this.skeleton);
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
            if (_serialization.skeleton) {
                const hndNodeDeserialized = () => {
                    const hndGraphDeserialized = () => {
                        this.skeleton = FudgeCore.Node.FIND(this, _serialization.skeleton);
                        this.node.removeEventListener("graphDeserialized", hndGraphDeserialized);
                        this.node.removeEventListener("graphInstantiated", hndGraphDeserialized);
                        this.removeEventListener("nodeDeserialized", hndNodeDeserialized);
                    };
                    this.node.addEventListener("graphDeserialized", hndGraphDeserialized, true);
                    this.node.addEventListener("graphInstantiated", hndGraphDeserialized, true);
                };
                this.addEventListener("nodeDeserialized", hndNodeDeserialized);
            }
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
    var ComponentParticleSystem_1;
    let PARTICLE_SYSTEM_PLAYMODE;
    (function (PARTICLE_SYSTEM_PLAYMODE) {
        PARTICLE_SYSTEM_PLAYMODE[PARTICLE_SYSTEM_PLAYMODE["LOOP"] = 0] = "LOOP";
        PARTICLE_SYSTEM_PLAYMODE[PARTICLE_SYSTEM_PLAYMODE["PLAY_ONCE"] = 1] = "PLAY_ONCE";
    })(PARTICLE_SYSTEM_PLAYMODE = FudgeCore.PARTICLE_SYSTEM_PLAYMODE || (FudgeCore.PARTICLE_SYSTEM_PLAYMODE = {}));
    let ComponentParticleSystem = class ComponentParticleSystem extends FudgeCore.Component {
        static { ComponentParticleSystem_1 = this; }
        static { this.iSubclass = FudgeCore.Component.registerSubclass(ComponentParticleSystem_1); }
        #size;
        #timeScale;
        #time;
        constructor(_particleSystem = null) {
            super();
            this.#timeScale = 1;
            this.hndEvent = (_event) => {
                switch (_event.type) {
                    case "nodeDeserialized":
                    case "componentAdd":
                        FudgeCore.Time.game.addEventListener("timeScaled", this.updateTimeScale);
                        this.node.addEventListener("renderPrepare", this.update);
                        break;
                    case "componentRemove":
                        FudgeCore.Time.game.removeEventListener("timeScaled", this.updateTimeScale);
                        this.node.removeEventListener("renderPrepare", this.update);
                }
            };
            this.update = () => {
                if (this.time > this.duration)
                    switch (this.playMode) {
                        default:
                        case PARTICLE_SYSTEM_PLAYMODE.LOOP:
                            this.time = 0;
                            break;
                        case PARTICLE_SYSTEM_PLAYMODE.PLAY_ONCE:
                            this.time = this.duration;
                            this.timeScale = 0;
                            break;
                    }
            };
            this.updateTimeScale = () => {
                let timeScale = this.#timeScale * FudgeCore.Time.game.getScale();
                this.#time.setScale(timeScale);
            };
            this.particleSystem = _particleSystem;
            this.depthMask = true;
            this.blendMode = FudgeCore.BLEND.ADDITIVE;
            this.playMode = PARTICLE_SYSTEM_PLAYMODE.LOOP;
            this.duration = 1000;
            this.size = 10;
            this.#time = new FudgeCore.Time();
            this.addEventListener("componentAdd", this.hndEvent);
            this.addEventListener("componentRemove", this.hndEvent);
            this.addEventListener("nodeDeserialized", this.hndEvent);
        }
        get size() {
            return this.#size;
        }
        set size(_size) {
            this.#size = _size;
            this.deleteRenderData();
        }
        get time() {
            return this.#time.get();
        }
        set time(_time) {
            this.#time.set(_time);
        }
        get timeScale() {
            return this.#timeScale;
        }
        set timeScale(_scale) {
            this.#timeScale = _scale;
            this.updateTimeScale();
        }
        useRenderData() { }
        deleteRenderData() { }
        serialize() {
            let serialization = {
                [super.constructor.name]: super.serialize(),
                idParticleSystem: this.particleSystem?.idResource,
                depthMask: this.depthMask,
                blendMode: this.blendMode,
                playMode: this.playMode,
                duration: this.duration,
                size: this.size
            };
            return serialization;
        }
        async deserialize(_serialization) {
            await super.deserialize(_serialization[super.constructor.name]);
            if (_serialization.idParticleSystem)
                this.particleSystem = await FudgeCore.Project.getResource(_serialization.idParticleSystem);
            this.depthMask = _serialization.depthMask;
            this.blendMode = _serialization.blendMode;
            this.playMode = _serialization.playMode;
            this.duration = _serialization.duration;
            this.size = _serialization.size;
            return this;
        }
        getMutator(_extendable) {
            let mutator = super.getMutator(true);
            mutator.size = this.size;
            return mutator;
        }
        getMutatorForUserInterface() {
            let mutator = this.getMutator(true);
            delete mutator.particleSystem;
            mutator.particleSystem = this.particleSystem?.getMutatorForUserInterface();
            return mutator;
        }
        getMutatorForAnimation() {
            let mutator = this.getMutator();
            delete mutator.particleSystem;
            delete mutator.size;
            return mutator;
        }
        getMutatorAttributeTypes(_mutator) {
            let types = super.getMutatorAttributeTypes(_mutator);
            if (types.blendMode)
                types.blendMode = FudgeCore.BLEND;
            if (types.playMode)
                types.playMode = PARTICLE_SYSTEM_PLAYMODE;
            return types;
        }
        reduceMutator(_mutator) {
            super.reduceMutator(_mutator);
            delete _mutator.randomNumbersRenderData;
            delete _mutator.time;
        }
    };
    ComponentParticleSystem = ComponentParticleSystem_1 = __decorate([
        FudgeCore.RenderInjectorComponentParticleSystem.decorate
    ], ComponentParticleSystem);
    FudgeCore.ComponentParticleSystem = ComponentParticleSystem;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    let PICK;
    (function (PICK) {
        PICK["RADIUS"] = "radius";
        PICK["CAMERA"] = "camera";
        PICK["PHYSICS"] = "physics";
    })(PICK = FudgeCore.PICK || (FudgeCore.PICK = {}));
    class ComponentPick extends FudgeCore.Component {
        constructor() {
            super(...arguments);
            this.pick = PICK.RADIUS;
        }
        static { this.iSubclass = FudgeCore.Component.registerSubclass(ComponentPick); }
        pickAndDispatch(_ray, _event) {
            let cmpMesh = this.node.getComponent(FudgeCore.ComponentMesh);
            let position = cmpMesh ? cmpMesh.mtxWorld.translation : this.node.mtxWorld.translation;
            switch (this.pick) {
                case PICK.RADIUS:
                    if (_ray.getDistance(position).magnitude < this.node.radius) {
                        this.node.dispatchEvent(_event);
                    }
                    break;
                case PICK.PHYSICS:
                    let hitInfo = FudgeCore.Physics.raycast(_ray.origin, _ray.direction, FudgeCore.Vector3.DIFFERENCE(position, _ray.origin).magnitudeSquared);
                    if (hitInfo.hit)
                        this.node.dispatchEvent(_event);
                    break;
            }
        }
        serialize() {
            return this.getMutator();
        }
        async deserialize(_serialization) {
            this.mutate(_serialization);
            return this;
        }
        getMutatorAttributeTypes(_mutator) {
            let types = super.getMutatorAttributeTypes(_mutator);
            if (types.pick)
                types.pick = PICK;
            return types;
        }
    }
    FudgeCore.ComponentPick = ComponentPick;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ComponentScript extends FudgeCore.Component {
        static { this.iSubclass = FudgeCore.Component.registerSubclass(ComponentScript); }
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
    class RenderInjectorComponentSkeleton {
        static decorate(_constructor) {
            Object.defineProperty(_constructor.prototype, "useRenderBuffer", {
                value: RenderInjectorComponentSkeleton.useRenderBuffer
            });
            Object.defineProperty(_constructor.prototype, "updateRenderBuffer", {
                value: RenderInjectorComponentSkeleton.updateRenderBuffer
            });
            Object.defineProperty(_constructor.prototype, "deleteRenderBuffer", {
                value: RenderInjectorComponentSkeleton.deleteRenderBuffer
            });
        }
        static useRenderBuffer(_shader) {
            const crc3 = FudgeCore.RenderWebGL.getRenderingContext();
            if (this.renderBuffer)
                crc3.bindBufferBase(WebGL2RenderingContext.UNIFORM_BUFFER, FudgeCore.UNIFORM_BLOCKS.SKIN.BINDING, this.renderBuffer);
        }
        static updateRenderBuffer() {
            const crc3 = FudgeCore.RenderWebGL.getRenderingContext();
            if (!this.renderBuffer) {
                const bonesByteSize = 256 * 16 * 4;
                this.renderBuffer = FudgeCore.RenderWebGL.assert(crc3.createBuffer());
                crc3.bindBuffer(WebGL2RenderingContext.UNIFORM_BUFFER, this.renderBuffer);
                crc3.bufferData(WebGL2RenderingContext.UNIFORM_BUFFER, bonesByteSize, WebGL2RenderingContext.DYNAMIC_DRAW);
            }
            const data = new Float32Array(this.mtxBones.length * 16);
            for (let i = 0; i < this.mtxBones.length; i++)
                data.set(this.mtxBones[i].get(), i * 16);
            crc3.bindBuffer(WebGL2RenderingContext.UNIFORM_BUFFER, this.renderBuffer);
            crc3.bufferSubData(WebGL2RenderingContext.UNIFORM_BUFFER, 0, data);
        }
        static deleteRenderBuffer() {
            const crc3 = FudgeCore.RenderWebGL.getRenderingContext();
            if (this.renderBuffer)
                crc3.deleteBuffer(this.renderBuffer);
        }
    }
    FudgeCore.RenderInjectorComponentSkeleton = RenderInjectorComponentSkeleton;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    var ComponentSkeleton_1;
    let ComponentSkeleton = ComponentSkeleton_1 = class ComponentSkeleton extends FudgeCore.Component {
        constructor(_bones = [], _mtxBoneInverses = []) {
            super();
            this.singleton = false;
            this.mtxBones = [];
            this.bones = _bones;
            this.mtxBindInverses = _mtxBoneInverses;
            for (let i = 0; i < this.bones.length; i++)
                if (this.mtxBindInverses[i] == null)
                    this.mtxBindInverses[i] = this.bones[i].mtxWorldInverse.clone;
        }
        useRenderBuffer(_shader) { return null; }
        updateRenderBuffer() { return null; }
        deleteRenderBuffer() { }
        addBone(_bone, _mtxBindInverse = _bone.mtxWorldInverse.clone) {
            this.bones.push(_bone);
            this.mtxBindInverses.push(_mtxBindInverse);
        }
        indexOf(_name) {
            if (typeof (_name) == "string")
                return this.bones.findIndex((_bone) => _bone.name == _name);
            else
                return this.bones.indexOf(_name);
        }
        update() {
            for (const mtxBone of this.mtxBones)
                FudgeCore.Recycler.store(mtxBone);
            this.mtxBones.length = 0;
            for (let i = 0; i < this.bones.length; i++) {
                let mtxBone = FudgeCore.Matrix4x4.MULTIPLICATION(this.bones[i].mtxWorld, this.mtxBindInverses[i]);
                this.mtxBones.push(mtxBone);
            }
        }
        resetPose() {
            for (let i = 0; i < this.bones.length; i++)
                this.bones[i].mtxLocal.set(FudgeCore.Matrix4x4.INVERSION(this.mtxBindInverses[i]));
        }
        serialize() {
            const serialization = {};
            serialization[super.constructor.name] = super.serialize();
            serialization.bones = this.bones.map(_bone => FudgeCore.Node.PATH_FROM_TO(this, _bone));
            serialization.mtxBindInverses = FudgeCore.Serializer.serializeArray(FudgeCore.Matrix4x4, this.mtxBindInverses);
            return serialization;
        }
        async deserialize(_serialization) {
            await super.deserialize(_serialization[super.constructor.name]);
            const hndNodeDeserialized = () => {
                this.bones = _serialization.bones.map((_path) => {
                    let bone = FudgeCore.Node.FIND(this, _path);
                    if (!bone)
                        throw new Error(`${FudgeCore.Node.name} "${this.node.name}" ${ComponentSkeleton_1.name}: Could not find bone ${_path}`);
                    return bone;
                });
                this.removeEventListener("nodeDeserialized", hndNodeDeserialized);
            };
            this.addEventListener("nodeDeserialized", hndNodeDeserialized);
            this.mtxBindInverses = await FudgeCore.Serializer.deserializeArray(_serialization.mtxBindInverses);
            return this;
        }
    };
    ComponentSkeleton = ComponentSkeleton_1 = __decorate([
        FudgeCore.RenderInjectorComponentSkeleton.decorate
    ], ComponentSkeleton);
    FudgeCore.ComponentSkeleton = ComponentSkeleton;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ComponentText extends FudgeCore.Component {
        static { this.iSubclass = FudgeCore.Component.registerSubclass(ComponentText); }
        constructor(_text, _font) {
            super();
            this.texture = new FudgeCore.TextureText(ComponentText.name, _text, _font);
            this.mtxWorld = FudgeCore.Matrix4x4.IDENTITY();
            this.fixedSize = false;
        }
        serialize() {
            return this.getMutator();
        }
        async deserialize(_serialization) {
            this.mutate(_serialization);
            return this;
        }
        useRenderData(_mtxMeshToWorld, _cmpCamera) {
            this.texture.useRenderData(FudgeCore.TEXTURE_LOCATION.COLOR.UNIT);
            this.mtxWorld.set(_mtxMeshToWorld);
            let scaling = FudgeCore.Recycler.get(FudgeCore.Vector3);
            if (this.fixedSize) {
                let scale;
                let rect = FudgeCore.Render.getRenderRectangle();
                switch (_cmpCamera.getDirection()) {
                    case FudgeCore.FIELD_OF_VIEW.VERTICAL:
                        scale = 1 / rect.height * window.devicePixelRatio;
                        break;
                    case FudgeCore.FIELD_OF_VIEW.HORIZONTAL:
                        scale = 1 / rect.width * window.devicePixelRatio;
                        break;
                    case FudgeCore.FIELD_OF_VIEW.DIAGONAL:
                        scale = 1 / Math.sqrt((rect.width * rect.height) * window.devicePixelRatio);
                        break;
                }
                let distance = _cmpCamera.mtxWorld.translation.getDistance(_mtxMeshToWorld.translation);
                scale = scale * distance;
                scaling.set(this.texture.width * scale, this.texture.height * scale, 1);
                this.mtxWorld.scaling = scaling;
                FudgeCore.Recycler.store(distance);
            }
            else {
                let pixelsToUnits = 1 / this.texture.height;
                scaling.set(this.texture.width * pixelsToUnits, this.texture.height * pixelsToUnits, 1);
                this.mtxWorld.scale(scaling);
            }
            FudgeCore.Recycler.store(scaling);
            return this.mtxWorld;
        }
        drawGizmosSelected() {
            let mesh = this.node.getComponent(FudgeCore.ComponentMesh)?.mesh;
            let cmpMaterial = this.node.getComponent(FudgeCore.ComponentMaterial);
            if (mesh == null || cmpMaterial == null)
                return;
            FudgeCore.Gizmos.drawWireMesh(mesh, this.mtxWorld, cmpMaterial.clrPrimary);
        }
        reduceMutator(_mutator) {
            super.reduceMutator(_mutator);
            delete _mutator.texture.name;
        }
    }
    FudgeCore.ComponentText = ComponentText;
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
        static { this.iSubclass = FudgeCore.Component.registerSubclass(ComponentTransform); }
        constructor(_mtxInit = FudgeCore.Matrix4x4.IDENTITY()) {
            super();
            this.mtxLocal = _mtxInit;
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
    class VRController {
        constructor() {
            this.cmpTransform = null;
            this.gamePad = null;
            this.thumbstickX = null;
            this.thumbstickY = null;
        }
    }
    FudgeCore.VRController = VRController;
    class ComponentVRDevice extends FudgeCore.ComponentCamera {
        static { this.iSubclass = FudgeCore.Component.registerSubclass(ComponentVRDevice); }
        #mtxLocal;
        constructor() {
            super();
            this.rightCntrl = new VRController();
            this.leftCntrl = new VRController();
            this.addEventListener("componentAdd", this.getMtxLocalFromCmpTransform);
        }
        get mtxLocal() {
            return this.#mtxLocal;
        }
        set translation(_translation) {
            let translation = _translation.clone;
            translation.subtract(this.#mtxLocal.translation);
            translation.negate();
            FudgeCore.XRViewport.default.referenceSpace = FudgeCore.XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(translation));
            this.#mtxLocal.translation = _translation;
            FudgeCore.Recycler.store(translation);
        }
        set rotation(_rotation) {
            let rotation = _rotation.clone;
            rotation.subtract(this.#mtxLocal.rotation);
            rotation.negate();
            let orientation = new FudgeCore.Quaternion();
            orientation.eulerAngles = rotation;
            FudgeCore.XRViewport.default.referenceSpace = FudgeCore.XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(FudgeCore.Vector3.DIFFERENCE(this.#mtxLocal.translation, FudgeCore.Vector3.ZERO())));
            FudgeCore.XRViewport.default.referenceSpace = FudgeCore.XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(FudgeCore.Vector3.ZERO(), orientation));
            FudgeCore.XRViewport.default.referenceSpace = FudgeCore.XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(FudgeCore.Vector3.DIFFERENCE(FudgeCore.Vector3.ZERO(), this.#mtxLocal.translation)));
            this.#mtxLocal.rotation = _rotation;
            FudgeCore.Recycler.store(rotation);
        }
        translate(_by) {
            let translation = _by.clone;
            translation.transform(this.#mtxLocal.quaternion);
            translation.negate();
            FudgeCore.XRViewport.default.referenceSpace = FudgeCore.XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(translation));
            this.#mtxLocal.translate(_by);
            FudgeCore.Recycler.store(translation);
        }
        rotate(_by) {
            let rotation = _by.clone.negate();
            let orientation = new FudgeCore.Quaternion();
            orientation.eulerAngles = rotation;
            FudgeCore.XRViewport.default.referenceSpace = FudgeCore.XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(FudgeCore.Vector3.DIFFERENCE(this.#mtxLocal.translation, FudgeCore.Vector3.ZERO())));
            FudgeCore.XRViewport.default.referenceSpace = FudgeCore.XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(FudgeCore.Vector3.ZERO(), orientation));
            FudgeCore.XRViewport.default.referenceSpace = FudgeCore.XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(FudgeCore.Vector3.DIFFERENCE(FudgeCore.Vector3.ZERO(), this.#mtxLocal.translation)));
            this.#mtxLocal.rotate(_by);
            FudgeCore.Recycler.store(rotation);
        }
        getMtxLocalFromCmpTransform() {
            this.#mtxLocal = this.node.mtxLocal;
        }
    }
    FudgeCore.ComponentVRDevice = ComponentVRDevice;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Control extends EventTarget {
        constructor(_name, _factor = 1, _type = 0, _delay = 0) {
            super();
            this.rateDispatchOutput = 0;
            this.valuePrevious = 0;
            this.outputBase = 0;
            this.outputTarget = 0;
            this.outputPrevious = 0;
            this.outputTargetPrevious = 0;
            this.factor = 0;
            this.time = FudgeCore.Time.game;
            this.timeValueDelay = 0;
            this.timeOutputTargetSet = 0;
            this.idTimer = undefined;
            this.dispatchOutput = (_eventOrValue) => {
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
            this.factor = _factor;
            this.type = _type;
            this.active = true;
            this.name = _name;
            this.setDelay(_delay);
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
    }
    FudgeCore.Control = Control;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Axis extends FudgeCore.Control {
        constructor() {
            super(...arguments);
            this.controls = new Map();
            this.sumPrevious = 0;
            this.hndOutputEvent = (_event) => {
                if (!this.active)
                    return;
                let control = _event.target;
                let event = new CustomEvent("output", {
                    detail: {
                        control: control,
                        input: _event.detail.output,
                        output: this.getOutput()
                    }
                });
                this.dispatchEvent(event);
            };
            this.hndInputEvent = (_event) => {
                if (!this.active)
                    return;
                let event = new Event("input", _event);
                this.dispatchEvent(event);
            };
        }
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
    }
    FudgeCore.Axis = Axis;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Keyboard {
        static { this.keysPressed = Keyboard.initialize(); }
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
        static {
            this.delegates = {
                [FudgeCore.DEBUG_FILTER.INFO]: DebugAlert.createDelegate(FudgeCore.DEBUG_SYMBOL[FudgeCore.DEBUG_FILTER.INFO]),
                [FudgeCore.DEBUG_FILTER.LOG]: DebugAlert.createDelegate(FudgeCore.DEBUG_SYMBOL[FudgeCore.DEBUG_FILTER.LOG]),
                [FudgeCore.DEBUG_FILTER.WARN]: DebugAlert.createDelegate(FudgeCore.DEBUG_SYMBOL[FudgeCore.DEBUG_FILTER.WARN]),
                [FudgeCore.DEBUG_FILTER.ERROR]: DebugAlert.createDelegate(FudgeCore.DEBUG_SYMBOL[FudgeCore.DEBUG_FILTER.ERROR]),
                [FudgeCore.DEBUG_FILTER.FUDGE]: DebugAlert.createDelegate(FudgeCore.DEBUG_SYMBOL[FudgeCore.DEBUG_FILTER.FUDGE]),
                [FudgeCore.DEBUG_FILTER.SOURCE]: DebugAlert.createDelegate(FudgeCore.DEBUG_SYMBOL[FudgeCore.DEBUG_FILTER.SOURCE])
            };
        }
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
        static { this.textArea = document.createElement("textarea"); }
        static { this.autoScroll = true; }
        static {
            this.delegates = {
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
        }
        static { this.groups = []; }
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
    class EventTimer {
        constructor(_timer, ..._arguments) {
            this.type = "\u0192lapse";
            this.firstCall = true;
            this.lastCall = false;
            this.target = _timer;
            this.arguments = _arguments;
            this.firstCall = true;
        }
    }
    FudgeCore.EventTimer = EventTimer;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    let EVENT_TOUCH;
    (function (EVENT_TOUCH) {
        EVENT_TOUCH["MOVE"] = "touchMove";
        EVENT_TOUCH["TAP"] = "touchTap";
        EVENT_TOUCH["NOTCH"] = "touchNotch";
        EVENT_TOUCH["LONG"] = "touchLong";
        EVENT_TOUCH["DOUBLE"] = "touchDouble";
        EVENT_TOUCH["PINCH"] = "touchPinch";
        EVENT_TOUCH["ROTATE"] = "touchRotate";
    })(EVENT_TOUCH = FudgeCore.EVENT_TOUCH || (FudgeCore.EVENT_TOUCH = {}));
    class TouchEventDispatcher {
        constructor(_target, _radiusTap = 5, _radiusNotch = 50, _timeDouble = 200, _timerLong = 1000) {
            this.posStart = FudgeCore.Vector2.ZERO();
            this.posNotch = FudgeCore.Vector2.ZERO();
            this.posPrev = FudgeCore.Vector2.ZERO();
            this.moved = false;
            this.time = new FudgeCore.Time();
            this.pinchDistance = 0;
            this.pinchTolerance = 1;
            this.hndEvent = (_event) => {
                _event.preventDefault();
                let touchFirst = _event.touches[0];
                let position = this.calcAveragePosition(_event.touches);
                let offset;
                switch (_event.type) {
                    case "touchstart":
                        this.moved = false;
                        this.startGesture(position);
                        if (_event.touches.length == 2) {
                            let pinch = new FudgeCore.Vector2(_event.touches[1].clientX - touchFirst.clientX, _event.touches[1].clientY - touchFirst.clientY);
                            this.pinchDistance = pinch.magnitude;
                        }
                        let dispatchLong = (_eventTimer) => {
                            this.moved = true;
                            this.target.dispatchEvent(new CustomEvent(EVENT_TOUCH.LONG, {
                                bubbles: true, detail: { position: position, touches: _event.touches }
                            }));
                        };
                        this.timerLong?.clear();
                        this.timerLong = new FudgeCore.Timer(this.time, this.timeLong, 1, dispatchLong);
                        break;
                    case "touchend":
                        this.timerLong?.clear();
                        if (_event.touches.length > 0) {
                            this.startGesture(position);
                            break;
                        }
                        let dispatchTap = (_eventTimer) => {
                            this.target.dispatchEvent(new CustomEvent(EVENT_TOUCH.TAP, {
                                bubbles: true, detail: { position: position, touches: _event.touches }
                            }));
                        };
                        if (this.timerDouble?.active) {
                            this.timerDouble.clear();
                            this.target.dispatchEvent(new CustomEvent(EVENT_TOUCH.DOUBLE, {
                                bubbles: true, detail: { position: position, touches: _event.touches }
                            }));
                        }
                        else if (!this.moved)
                            this.timerDouble = new FudgeCore.Timer(this.time, this.timeDouble, 1, dispatchTap);
                        break;
                    case "touchmove":
                        this.detectPinch(_event, position);
                        offset = FudgeCore.Vector2.DIFFERENCE(this.posPrev, this.posStart);
                        this.moved ||= (offset.magnitude < this.radiusTap);
                        let movement = FudgeCore.Vector2.DIFFERENCE(position, this.posPrev);
                        this.target.dispatchEvent(new CustomEvent(EVENT_TOUCH.MOVE, {
                            bubbles: true, detail: { position: position, touches: _event.touches, offset: offset, movement: movement }
                        }));
                        offset = FudgeCore.Vector2.DIFFERENCE(position, this.posNotch);
                        if (offset.magnitude > this.radiusNotch) {
                            let cardinal = Math.abs(offset.x) > Math.abs(offset.y) ?
                                FudgeCore.Vector2.X(offset.x < 0 ? -1 : 1) :
                                FudgeCore.Vector2.Y(offset.y < 0 ? -1 : 1);
                            this.target.dispatchEvent(new CustomEvent(EVENT_TOUCH.NOTCH, {
                                bubbles: true, detail: { position: position, touches: _event.touches, offset: offset, cardinal: cardinal, movement: movement }
                            }));
                            this.posNotch = position;
                        }
                        break;
                    default:
                        break;
                }
                this.posPrev.set(position.x, position.y);
            };
            this.detectPinch = (_event, _position) => {
                if (_event.touches.length != 2)
                    return;
                let t = _event.touches;
                let pinch = new FudgeCore.Vector2(t[1].clientX - t[0].clientX, t[1].clientY - t[0].clientY);
                let pinchDistance = pinch.magnitude;
                let pinchDelta = pinchDistance - this.pinchDistance;
                if (Math.abs(pinchDelta) > this.pinchTolerance)
                    this.target.dispatchEvent(new CustomEvent(EVENT_TOUCH.PINCH, {
                        bubbles: true, detail: { position: _position, touches: _event.touches, pinch: pinch, pinchDelta: pinchDelta }
                    }));
                this.pinchDistance = pinchDistance;
            };
            this.target = _target;
            this.radiusTap = _radiusTap;
            this.radiusNotch = _radiusNotch;
            this.timeDouble = _timeDouble;
            this.timeLong = _timerLong;
            this.activate(true);
        }
        activate(_on) {
            if (_on) {
                this.target.addEventListener("touchstart", this.hndEvent);
                this.target.addEventListener("touchend", this.hndEvent);
                this.target.addEventListener("touchmove", this.hndEvent);
                return;
            }
            this.target.removeEventListener("touchstart", this.hndEvent);
            this.target.removeEventListener("touchend", this.hndEvent);
            this.target.removeEventListener("touchmove", this.hndEvent);
        }
        startGesture(_position) {
            this.posNotch.set(_position.x, _position.y);
            this.posStart.set(_position.x, _position.y);
        }
        calcAveragePosition(_touches) {
            let average = FudgeCore.Vector2.ZERO();
            for (let touch of _touches) {
                average.x += touch.clientX;
                average.y += touch.clientY;
            }
            average.scale(1 / _touches.length);
            return average;
        }
    }
    FudgeCore.TouchEventDispatcher = TouchEventDispatcher;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Graph extends FudgeCore.Node {
        constructor(_name = "Graph") {
            super(_name);
            this.idResource = undefined;
            this.hndMutate = async (_event) => {
                _event.detail.path = Reflect.get(_event, "path");
                this.dispatchEvent(new CustomEvent("mutateGraph", { detail: _event.detail }));
                this.dispatchEvent(new CustomEvent("graphMutated", { detail: _event.detail }));
            };
            this.addEventListener("mutate", this.hndMutate);
        }
        get type() {
            return this.constructor.name;
        }
        serialize() {
            let serialization = super.serialize();
            serialization.idResource = this.idResource;
            serialization.type = this.type;
            return serialization;
        }
        async deserialize(_serialization) {
            await super.deserialize(_serialization);
            FudgeCore.Project.register(this, _serialization.idResource);
            await FudgeCore.Project.resyncGraphInstances(this);
            this.broadcastEvent(new Event("graphDeserialized"));
            console.log("Deserialized", this.name);
            return this;
        }
    }
    FudgeCore.Graph = Graph;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class GraphGLTF extends FudgeCore.mixinSerializableResourceExternal(FudgeCore.Graph) {
        async load(_url = this.url, _name = this.name) {
            this.url = _url;
            this.name = _name;
            return FudgeCore.GLTFLoader.loadResource(this);
        }
        serialize() {
            const serialization = super.serialize(true);
            delete serialization.components[FudgeCore.ComponentSkeleton.name];
            delete serialization.children;
            return serialization;
        }
    }
    FudgeCore.GraphGLTF = GraphGLTF;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class GraphInstance extends FudgeCore.Node {
        static { this.count = 0; }
        #idSource;
        #deserializeFromSource;
        constructor(_graph) {
            super("GraphInstance");
            this.#idSource = undefined;
            this.#deserializeFromSource = true;
            this.hndMutationGraph = async (_event) => {
                if (this.isFiltered())
                    return;
                await this.reflectMutation(_event, _event.currentTarget, this, _event.detail.path);
                this.dispatchEvent(new Event("mutateGraphDone", { bubbles: true }));
            };
            this.hndMutationInstance = async (_event) => {
                if (this.isFiltered())
                    return;
                await this.reflectMutation(_event, this, this.get(), Reflect.get(_event, "path"));
                this.get().dispatchEvent(new CustomEvent("mutate", { detail: _event.detail }));
            };
            this.addEventListener("mutate", this.hndMutationInstance);
            if (!_graph)
                return;
            this.#idSource = _graph.idResource;
        }
        get idSource() {
            return this.#idSource;
        }
        async reset() {
            let resource = await FudgeCore.Project.getResource(this.#idSource);
            await this.set(resource);
        }
        serialize() {
            let filter = this.getComponent(FudgeCore.ComponentGraphFilter);
            let serialization = {};
            if (filter && filter.isActive) {
                serialization = super.serialize();
                let graph = this.get();
                if (graph instanceof FudgeCore.GraphGLTF) {
                    delete serialization.components[FudgeCore.ComponentSkeleton.name];
                    delete serialization.children;
                    serialization.url = graph.url;
                }
            }
            else {
                serialization.deserializeFromSource = true;
            }
            serialization.idSource = this.#idSource;
            return serialization;
        }
        async deserialize(_serialization) {
            this.#idSource = _serialization.idSource ?? _serialization.idResource;
            if (!_serialization.deserializeFromSource) {
                let graph = await FudgeCore.Project.getResource(this.#idSource);
                if (graph instanceof FudgeCore.GraphGLTF)
                    await FudgeCore.GLTFLoader.loadResource(this, _serialization.url);
                await super.deserialize(_serialization);
                this.#deserializeFromSource = false;
            }
            let graph = this.get();
            if (graph)
                await this.connectToGraph();
            else {
                console.log("Register for resync", _serialization.name, this.name);
                FudgeCore.Project.registerGraphInstanceForResync(this);
            }
            return this;
        }
        async connectToGraph() {
            let graph = this.get();
            if (this.#deserializeFromSource)
                await this.set(graph);
        }
        async set(_graph) {
            this.#idSource = _graph.idResource;
            let currentGraph = this.get();
            if (currentGraph) {
                currentGraph.removeEventListener("mutateGraph", this.hndMutationGraph);
            }
            let serialization = FudgeCore.Serializer.serialize(_graph);
            for (let path in serialization) {
                await this.deserialize(serialization[path]);
                break;
            }
            console.log(this.name + GraphInstance.count++);
            _graph.addEventListener("mutateGraph", this.hndMutationGraph);
            console.log(_graph?.listeners);
            this.broadcastEvent(new Event("graphInstantiated"));
        }
        get() {
            return FudgeCore.Project.resources[this.#idSource];
        }
        async reflectMutation(_event, _source, _destination, _path) {
            for (let node of _path)
                if (node instanceof GraphInstance)
                    if (node == this)
                        break;
                    else {
                        console.log("Sync aborted, target already synced");
                        return;
                    }
            let index = _path.indexOf(_source);
            for (let i = index - 1; i >= 0; i--) {
                let childIndex = _path[i].getParent().findChild(_path[i]);
                _destination = _destination.getChild(childIndex);
            }
            let cmpMutate = _destination.getComponent(_event.detail.component.constructor);
            if (cmpMutate)
                await cmpMutate.mutate(_event.detail.mutator, null, false);
        }
        isFiltered() {
            let cmpFilter = this.getComponent(FudgeCore.ComponentGraphFilter);
            return (cmpFilter && cmpFilter.isActive);
        }
    }
    FudgeCore.GraphInstance = GraphInstance;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Coat extends FudgeCore.Mutable {
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
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    let CoatColored = class CoatColored extends FudgeCore.Coat {
        constructor(_color = new FudgeCore.Color()) {
            super();
            this.color = _color;
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
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    let CoatRemissive = class CoatRemissive extends FudgeCore.CoatColored {
        #metallic;
        constructor(_color = new FudgeCore.Color(), _diffuse = 1, _specular = 0.5, _intensity = 0.7, _metallic = 0.0) {
            super(_color);
            this.diffuse = _diffuse;
            this.specular = _specular;
            this.intensity = _intensity;
            this.metallic = _metallic;
        }
        get metallic() {
            return this.#metallic;
        }
        set metallic(_value) {
            this.#metallic = FudgeCore.Calc.clamp(_value, 0, 1);
        }
        serialize() {
            let serialization = super.serialize();
            serialization.diffuse = this.diffuse;
            serialization.specular = this.specular;
            serialization.intensity = this.intensity;
            serialization.metallic = this.metallic;
            return serialization;
        }
        async deserialize(_serialization) {
            await super.deserialize(_serialization);
            this.diffuse = _serialization.diffuse;
            this.specular = _serialization.specular;
            this.intensity = _serialization.intensity ?? this.intensity;
            this.metallic = _serialization.metallic ?? this.metallic;
            return this;
        }
        getMutator() {
            let mutator = super.getMutator(true);
            mutator.metallic = this.metallic;
            return mutator;
        }
    };
    CoatRemissive = __decorate([
        FudgeCore.RenderInjectorCoat.decorate
    ], CoatRemissive);
    FudgeCore.CoatRemissive = CoatRemissive;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    let CoatTextured = class CoatTextured extends FudgeCore.CoatColored {
        constructor(_color = new FudgeCore.Color(), _texture = FudgeCore.TextureDefault.color) {
            super(_color);
            this.texture = null;
            this.texture = _texture;
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
    let CoatRemissiveTextured = class CoatRemissiveTextured extends FudgeCore.CoatTextured {
        #metallic;
        constructor(_color = new FudgeCore.Color(), _texture = FudgeCore.TextureDefault.color, _diffuse = 1, _specular = 0.5, _intensity = 0.7, _metallic = 0.0) {
            super(_color, _texture);
            this.diffuse = _diffuse;
            this.specular = _specular;
            this.intensity = _intensity;
            this.metallic = _metallic;
        }
        get metallic() {
            return this.#metallic;
        }
        set metallic(_value) {
            this.#metallic = FudgeCore.Calc.clamp(_value, 0, 1);
        }
        serialize() {
            let serialization = super.serialize();
            serialization.diffuse = this.diffuse;
            serialization.specular = this.specular;
            serialization.intensity = this.intensity;
            serialization.metallic = this.metallic;
            return serialization;
        }
        async deserialize(_serialization) {
            await super.deserialize(_serialization);
            this.diffuse = _serialization.diffuse;
            this.specular = _serialization.specular;
            this.intensity = _serialization.intensity ?? this.intensity;
            this.metallic = _serialization.metallic ?? this.metallic;
            return this;
        }
        getMutator() {
            let mutator = super.getMutator(true);
            mutator.metallic = this.metallic;
            return mutator;
        }
    };
    CoatRemissiveTextured = __decorate([
        FudgeCore.RenderInjectorCoat.decorate
    ], CoatRemissiveTextured);
    FudgeCore.CoatRemissiveTextured = CoatRemissiveTextured;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    let CoatRemissiveTexturedNormals = class CoatRemissiveTexturedNormals extends FudgeCore.CoatRemissiveTextured {
        constructor(_color = new FudgeCore.Color(), _texture = FudgeCore.TextureDefault.color, _normalMap = FudgeCore.TextureDefault.normal, _diffuse, _specular = undefined, _intensity = undefined, _metallic = undefined) {
            super(_color, _texture, _diffuse, _specular, _intensity, _metallic);
            this.normalMap = null;
            this.normalMap = _normalMap;
        }
        serialize() {
            let serialization = super.serialize();
            serialization.idNormalMap = this.normalMap.idResource;
            return serialization;
        }
        async deserialize(_serialization) {
            await super.deserialize(_serialization);
            if (_serialization.idNormalMap)
                this.normalMap = await FudgeCore.Project.getResource(_serialization.idNormalMap);
            return this;
        }
    };
    CoatRemissiveTexturedNormals = __decorate([
        FudgeCore.RenderInjectorCoat.decorate
    ], CoatRemissiveTexturedNormals);
    FudgeCore.CoatRemissiveTexturedNormals = CoatRemissiveTexturedNormals;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Color extends FudgeCore.Mutable {
        static {
            this.crc2 = (() => {
                const crc2 = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
                crc2.globalCompositeOperation = "copy";
                return crc2;
            })();
        }
        constructor(_r = 1, _g = 1, _b = 1, _a = 1) {
            super();
            this.setNormRGBA(_r, _g, _b, _a);
        }
        static getBytesRGBAFromCSS(_keyword) {
            Color.crc2.fillStyle = _keyword;
            Color.crc2.fillRect(0, 0, 1, 1);
            return Color.crc2.getImageData(0, 0, 1, 1).data;
        }
        static CSS(_keyword, _alpha) {
            const color = FudgeCore.Recycler.get(Color);
            color.setCSS(_keyword, _alpha);
            return color;
        }
        static MULTIPLY(_color1, _color2) {
            return new Color(_color1.r * _color2.r, _color1.g * _color2.g, _color1.b * _color2.b, _color1.a * _color2.a);
        }
        get clone() {
            let clone = FudgeCore.Recycler.get(Color);
            clone.copy(this);
            return clone;
        }
        setCSS(_keyword, _alpha) {
            const bytesRGBA = Color.getBytesRGBAFromCSS(_keyword);
            this.setBytesRGBA(bytesRGBA[0], bytesRGBA[1], bytesRGBA[2], bytesRGBA[3]);
            this.a = _alpha ?? this.a;
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
            return `RGBA(${bytes[0]}, ${bytes[1]}, ${bytes[2]}, ${this.a})`;
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
        recycle() {
            this.r = 1;
            this.g = 1;
            this.b = 1;
            this.a = 1;
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
        constructor(_name, _shader, _coat) {
            super();
            this.idResource = undefined;
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
            if (this.shaderType)
                if (_coat.constructor != this.shaderType.getCoat())
                    if (_coat instanceof this.shaderType.getCoat())
                        FudgeCore.Debug.fudge("Coat is extension of Coat required by shader");
                    else
                        throw (new Error("Shader and coat don't match"));
            this.#coat = _coat;
        }
        get hasTransparency() {
            let coat = this.coat;
            return coat.color?.a < 1 || coat.texture?.hasTransparency;
        }
        createCoatMatchingShader() {
            let coat = new (this.shaderType.getCoat())();
            return coat;
        }
        setShader(_shaderType) {
            this.shaderType = _shaderType;
            let coat = this.createCoatMatchingShader();
            coat.mutate(this.#coat?.getMutator());
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
        reduceMutator(_mutator) {
        }
    }
    FudgeCore.Material = Material;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class MaterialGLTF extends FudgeCore.mixinSerializableResourceExternal(FudgeCore.Material) {
        async load(_url = this.url, _name = this.name) {
            this.url = _url;
            this.name = _name;
            return FudgeCore.GLTFLoader.loadResource(this);
        }
    }
    FudgeCore.MaterialGLTF = MaterialGLTF;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Calc {
        static { this.deg2rad = Math.PI / 180; }
        static { this.rad2deg = 1 / Calc.deg2rad; }
        static clamp(_value, _min, _max, _isSmaller = (_value1, _value2) => { return _value1 < _value2; }) {
            if (_isSmaller(_value, _min))
                return _min;
            if (_isSmaller(_max, _value))
                return _max;
            return _value;
        }
        static lerp(_a, _b, _f) {
            return _a + (_b - _a) * Calc.clamp(_f, 0, 1);
        }
    }
    FudgeCore.Calc = Calc;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Framing extends FudgeCore.Mutable {
        reduceMutator(_mutator) { }
    }
    FudgeCore.Framing = Framing;
    class FramingFixed extends Framing {
        constructor(_width = 300, _height = 150) {
            super();
            this.width = 300;
            this.height = 150;
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
        constructor() {
            super(...arguments);
            this.margin = { left: 0, top: 0, right: 0, bottom: 0 };
            this.padding = { left: 0, top: 0, right: 0, bottom: 0 };
        }
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
        constructor(_angle = 0, _magnitude = 1) {
            this.magnitude = 0;
            this.angle = 0;
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
        constructor(_longitude = 0, _latitude = 0, _magnitude = 1) {
            this.magnitude = 0;
            this.latitude = 0;
            this.longitude = 0;
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
        let mash = function (_data) {
            _data = _data.toString();
            for (let i = 0; i < _data.length; i++) {
                n += _data.charCodeAt(i);
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
        constructor() {
            super();
            this.data = new Float32Array(9);
            this.mutator = null;
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
            let angleInRadians = _angleInDegrees * FudgeCore.Calc.deg2rad;
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
        static INVERSION(_mtx) {
            let m = _mtx.data;
            let m00 = m[0 * 3 + 0];
            let m01 = m[0 * 3 + 1];
            let m02 = m[0 * 3 + 2];
            let m10 = m[1 * 3 + 0];
            let m11 = m[1 * 3 + 1];
            let m12 = m[1 * 3 + 2];
            let m20 = m[2 * 3 + 0];
            let m21 = m[2 * 3 + 1];
            let m22 = m[2 * 3 + 2];
            let d = 1 /
                (m00 * (m11 * m22 - m21 * m12) -
                    m01 * (m10 * m22 - m12 * m20) +
                    m02 * (m10 * m21 - m11 * m20));
            const mtxResult = FudgeCore.Recycler.get(Matrix3x3);
            mtxResult.data.set([
                d * (m11 * m22 - m21 * m12),
                d * (m02 * m21 - m01 * m22),
                d * (m01 * m12 - m02 * m11),
                d * (m12 * m20 - m10 * m22),
                d * (m00 * m22 - m02 * m20),
                d * (m10 * m02 - m00 * m12),
                d * (m10 * m21 - m20 * m11),
                d * (m20 * m01 - m00 * m21),
                d * (m00 * m11 - m10 * m01)
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
                this.vectors.scaling = new FudgeCore.Vector2(Math.hypot(this.data[0], this.data[1]) * (this.data[0] < 0 ? -1 : 1), Math.hypot(this.data[3], this.data[4]) * (this.data[4] < 0 ? -1 : 1));
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
        reset() {
            this.recycle();
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
            rotation *= FudgeCore.Calc.rad2deg;
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
        #translation;
        #scaling;
        #rotation;
        #quaternion;
        #translationDirty;
        #scalingDirty;
        #rotationDirty;
        #quaternionDirty;
        constructor() {
            super();
            this.data = new Float32Array(16);
            this.mutator = null;
            this.#translation = FudgeCore.Vector3.ZERO();
            this.#scaling = FudgeCore.Vector3.ZERO();
            this.#rotation = FudgeCore.Vector3.ONE();
            this.#quaternion = FudgeCore.Quaternion.IDENTITY();
            this.recycle();
        }
        static IDENTITY() {
            const mtxResult = FudgeCore.Recycler.get(Matrix4x4);
            return mtxResult;
        }
        static CONSTRUCTION(_translation, _rotation, _scaling) {
            let result = Matrix4x4.IDENTITY();
            result.mutate({ "translation": _translation, "rotation": _rotation, "scaling": _scaling });
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
        static TRANSPOSE(_mtx) {
            let m = _mtx.data;
            let result = FudgeCore.Recycler.get(Matrix4x4);
            result.data.set([
                m[0], m[4], m[8], m[12],
                m[1], m[5], m[9], m[13],
                m[2], m[6], m[10], m[14],
                m[3], m[7], m[11], m[15]
            ]);
            return result;
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
        static LOOK_AT(_translation, _target, _up = FudgeCore.Vector3.Y(), _restrict = false) {
            const mtxResult = FudgeCore.Recycler.get(Matrix4x4);
            let zAxis = FudgeCore.Vector3.DIFFERENCE(_target, _translation);
            zAxis.normalize();
            let vctCross = FudgeCore.Vector3.CROSS(_up, zAxis);
            if (vctCross.magnitudeSquared == 0)
                vctCross.x = 0.001;
            let xAxis = FudgeCore.Vector3.NORMALIZATION(vctCross);
            let yAxis = _restrict ? _up : FudgeCore.Vector3.NORMALIZATION(FudgeCore.Vector3.CROSS(zAxis, xAxis));
            zAxis = _restrict ? FudgeCore.Vector3.NORMALIZATION(FudgeCore.Vector3.CROSS(xAxis, _up)) : zAxis;
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
        static LOOK_IN(_translation, _direction, _up = FudgeCore.Vector3.Y()) {
            let zAxis = FudgeCore.Vector3.NORMALIZATION(_direction);
            let xAxis = FudgeCore.Vector3.NORMALIZATION(FudgeCore.Vector3.CROSS(_up, zAxis));
            let yAxis = FudgeCore.Vector3.NORMALIZATION(FudgeCore.Vector3.CROSS(zAxis, xAxis));
            const mtxResult = FudgeCore.Recycler.get(Matrix4x4);
            mtxResult.data.set([
                xAxis.x, xAxis.y, xAxis.z, 0,
                yAxis.x, yAxis.y, yAxis.z, 0,
                zAxis.x, zAxis.y, zAxis.z, 0,
                _translation.x, _translation.y, _translation.z, 1
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
            let angleInRadians = _angleInDegrees * FudgeCore.Calc.deg2rad;
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
            let angleInRadians = _angleInDegrees * FudgeCore.Calc.deg2rad;
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
            let angleInRadians = _angleInDegrees * FudgeCore.Calc.deg2rad;
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
        static ROTATION(_rotation) {
            const mtxResult = FudgeCore.Recycler.get(Matrix4x4);
            Matrix4x4.SET_ROTATION(mtxResult.data, _rotation);
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
            let fieldOfViewInRadians = _fieldOfViewInDegrees * FudgeCore.Calc.deg2rad;
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
                0, -2 / (_top - _bottom), 0, 0,
                0, 0, 2 / (_far - _near), 0,
                (_left + _right) / (_left - _right),
                (_bottom + _top) / (_bottom - _top),
                (_near + _far) / (_near - _far),
                1
            ]);
            return mtxResult;
        }
        static SET_ROTATION(_m, _rotation) {
            if (_rotation instanceof FudgeCore.Vector3) {
                const anglesInRadians = FudgeCore.Vector3.SCALE(_rotation, FudgeCore.Calc.deg2rad);
                const sinX = Math.sin(anglesInRadians.x);
                const cosX = Math.cos(anglesInRadians.x);
                const sinY = Math.sin(anglesInRadians.y);
                const cosY = Math.cos(anglesInRadians.y);
                const sinZ = Math.sin(anglesInRadians.z);
                const cosZ = Math.cos(anglesInRadians.z);
                FudgeCore.Recycler.store(anglesInRadians);
                _m[0] = cosZ * cosY;
                _m[1] = sinZ * cosY;
                _m[2] = -sinY;
                _m[4] = cosZ * sinY * sinX - sinZ * cosX;
                _m[5] = sinZ * sinY * sinX + cosZ * cosX;
                _m[6] = cosY * sinX;
                _m[8] = cosZ * sinY * cosX + sinZ * sinX;
                _m[9] = sinZ * sinY * cosX - cosZ * sinX;
                _m[10] = cosY * cosX;
            }
            else {
                const rotationNormalized = FudgeCore.Quaternion.NORMALIZATION(_rotation);
                const x = rotationNormalized.x, y = rotationNormalized.y, z = rotationNormalized.z, w = rotationNormalized.w;
                const xx = x * x, xy = x * y, xz = x * z, xw = x * w;
                const yy = y * y, yz = y * z, yw = y * w;
                const zz = z * z, zw = z * w;
                const ww = w * w;
                _m[0] = ww + xx - yy - zz;
                _m[1] = 2 * (xy + zw);
                _m[2] = 2 * (xz - yw);
                _m[4] = 2 * (xy - zw);
                _m[5] = ww - xx + yy - zz;
                _m[6] = 2 * (yz + xw);
                _m[8] = 2 * (xz + yw);
                _m[9] = 2 * (yz - xw);
                _m[10] = ww - xx - yy + zz;
                FudgeCore.Recycler.store(rotationNormalized);
            }
        }
        get translation() {
            if (this.#translationDirty) {
                this.#translation.set(this.data[12], this.data[13], this.data[14]);
                this.#translationDirty = false;
            }
            return this.#translation;
        }
        set translation(_translation) {
            this.mutate({ "translation": _translation });
        }
        get rotation() {
            if (this.#rotationDirty) {
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
                this.#rotation.set(x1, y1, z1);
                this.#rotation.scale(FudgeCore.Calc.rad2deg);
                this.#rotationDirty = false;
            }
            return this.#rotation;
        }
        set rotation(_rotation) {
            this.mutate({ "rotation": _rotation });
        }
        get scaling() {
            if (this.#scalingDirty) {
                this.#scaling.set(Math.hypot(this.data[0], this.data[1], this.data[2]), Math.hypot(this.data[4], this.data[5], this.data[6]), Math.hypot(this.data[8], this.data[9], this.data[10]));
                this.#scalingDirty = false;
            }
            return this.#scaling;
        }
        set scaling(_scaling) {
            this.mutate({ "scaling": _scaling });
        }
        get quaternion() {
            if (this.#quaternionDirty) {
                this.#quaternion.eulerAngles = this.rotation;
                this.#quaternionDirty = false;
            }
            return this.#quaternion;
        }
        set quaternion(_quaternion) {
            this.mutate({ "rotation": _quaternion });
        }
        get clone() {
            let mtxClone = FudgeCore.Recycler.get(Matrix4x4);
            mtxClone.set(this);
            return mtxClone;
        }
        get right() {
            let right = this.getX();
            right.normalize();
            return right;
        }
        get up() {
            let up = this.getY();
            up.normalize();
            return up;
        }
        get forward() {
            let forward = this.getZ();
            forward.normalize();
            return forward;
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
        reset() {
            this.recycle();
        }
        rotate(_by, _fromLeft = false) {
            let mtxRotation = Matrix4x4.ROTATION(_by);
            this.multiply(mtxRotation, _fromLeft);
            FudgeCore.Recycler.store(mtxRotation);
        }
        transpose() {
            let matrix = this.data;
            this.data.set([
                matrix[0], matrix[4], matrix[8], matrix[12],
                matrix[1], matrix[5], matrix[9], matrix[13],
                matrix[2], matrix[6], matrix[10], matrix[14],
                matrix[3], matrix[7], matrix[11], matrix[15]
            ]);
            return this;
        }
        inverse() {
            let m = this.data;
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
            const matrix = FudgeCore.Recycler.get(Matrix4x4);
            matrix.data.set([
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
            return matrix;
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
        lookAt(_target, _up, _restrict = false) {
            _up = _up ? FudgeCore.Vector3.NORMALIZATION(_up) : FudgeCore.Vector3.NORMALIZATION(this.up);
            const mtxResult = Matrix4x4.LOOK_AT(this.translation, _target, _up, _restrict);
            mtxResult.scale(this.scaling);
            this.set(mtxResult);
            FudgeCore.Recycler.store(mtxResult);
        }
        lookIn(_direction, _up = FudgeCore.Vector3.Y()) {
            const mtxResult = Matrix4x4.LOOK_IN(this.translation, _direction, _up);
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
                this.#translationDirty = true;
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
        set(_mtxTo) {
            if (_mtxTo instanceof Matrix4x4)
                this.data.set(_mtxTo.data);
            else
                this.data.set(_mtxTo);
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
            const m = this.data;
            if (_mutator.translation) {
                let translation = this.translation;
                translation.mutate(_mutator.translation);
                m[12] = translation.x;
                m[13] = translation.y;
                m[14] = translation.z;
                this.#translationDirty = false;
            }
            if (_mutator.rotation || _mutator.scaling) {
                let rotation = _mutator.rotation?.w != undefined ?
                    this.#quaternion :
                    isFullVectorMutator(_mutator.rotation) ? this.#rotation : this.rotation;
                let scaling = isFullVectorMutator(_mutator.scaling) ? this.#scaling : this.scaling;
                if (_mutator.rotation)
                    rotation.mutate(_mutator.rotation);
                if (_mutator.scaling)
                    scaling.mutate(_mutator.scaling);
                Matrix4x4.SET_ROTATION(m, rotation);
                const isEulerRotation = rotation instanceof FudgeCore.Vector3;
                this.#rotationDirty = !isEulerRotation;
                this.#quaternionDirty = isEulerRotation;
                const sx = scaling.x, sy = scaling.y, sz = scaling.z;
                m[0] *= sx;
                m[1] *= sx;
                m[2] *= sx;
                m[4] *= sy;
                m[5] *= sy;
                m[6] *= sy;
                m[8] *= sz;
                m[9] *= sz;
                m[10] *= sz;
                this.#scalingDirty = false;
            }
            this.mutator = null;
            function isFullVectorMutator(_mutator) {
                return _mutator && _mutator.x != undefined && _mutator.y != undefined && _mutator.z != undefined;
            }
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
            this.#translationDirty = true;
            this.#rotationDirty = true;
            this.#quaternionDirty = true;
            this.#scalingDirty = true;
            this.mutator = null;
        }
    }
    FudgeCore.Matrix4x4 = Matrix4x4;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Noise {
        constructor(_random = Math.random) {
            this.perm = new Uint8Array(512);
            this.permMod12 = new Uint8Array(512);
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
        static { this.offset = (3.0 - Math.sqrt(3.0)) / 6.0; }
        static { this.gradient = [[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [-1, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [0, 1], [0, -1]]; }
        #sample;
        constructor(_random = Math.random) {
            super(_random);
            this.#sample = null;
            this.sample = (_x, _y) => {
                return this.#sample(_x, _y);
            };
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
    }
    FudgeCore.Noise2 = Noise2;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Noise3 extends FudgeCore.Noise {
        static { this.offset = 1.0 / 6.0; }
        static {
            this.gradient = [[1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0], [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1], [0, 1, 1], [0, -1, -1], [0, 1, -1], [0, -1, -1]
            ];
        }
        #sample;
        constructor(_random = Math.random) {
            super(_random);
            this.#sample = null;
            this.sample = (_x, _y, _z) => {
                return this.#sample(_x, _y, _z);
            };
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
    }
    FudgeCore.Noise3 = Noise3;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Noise4 extends FudgeCore.Noise {
        static { this.offset = (5.0 - Math.sqrt(5.0)) / 20.0; }
        static { this.gradient = [[0, 1, 1, 1], [0, 1, 1, -1], [0, 1, -1, 1], [0, 1, -1, -1], [0, -1, 1, 1], [0, -1, 1, -1], [0, -1, -1, 1], [0, -1, -1, -1], [1, 0, 1, 1], [1, 0, 1, -1], [1, 0, -1, 1], [1, 0, -1, -1], [-1, 0, 1, 1], [-1, 0, 1, -1], [-1, 0, -1, 1], [-1, 0, -1, -1], [1, 1, 0, 1], [1, 1, 0, -1], [1, -1, 0, 1], [1, -1, 0, -1], [-1, 1, 0, 1], [-1, 1, 0, -1], [-1, -1, 0, 1], [-1, -1, 0, -1], [1, 1, 1, 0], [1, 1, -1, 0], [1, -1, 1, 0], [1, -1, -1, 0], [-1, 1, 1, 0], [-1, 1, -1, 0], [-1, -1, 1, 0], [-1, -1, -1, 0]]; }
        #sample;
        constructor(_random = Math.random) {
            super(_random);
            this.#sample = null;
            this.sample = (_x, _y, _z, _w) => {
                return this.#sample(_x, _y, _z, _w);
            };
            this.#sample = (_x, _y, _z, _w) => {
                const s = (_x + _y + _z + _w) * (Math.sqrt(5.0) - 1.0) / 4.0;
                const i = Math.floor(_x + s);
                const j = Math.floor(_y + s);
                const k = Math.floor(_z + s);
                const l = Math.floor(_w + s);
                const t = (i + j + k + l) * Noise4.offset;
                const X0 = i - t;
                const Y0 = j - t;
                const Z0 = k - t;
                const W0 = l - t;
                const x0 = _x - X0;
                const y0 = _y - Y0;
                const z0 = _z - Z0;
                const w0 = _w - W0;
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
    }
    FudgeCore.Noise4 = Noise4;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Quaternion extends FudgeCore.Mutable {
        #eulerAngles;
        #eulerAnglesDirty;
        constructor(_x = 0, _y = 0, _z = 0, _w = 1) {
            super();
            this.mutator = null;
            this.#eulerAngles = FudgeCore.Vector3.ZERO();
            this.set(_x, _y, _z, _w);
        }
        static IDENTITY() {
            const result = FudgeCore.Recycler.get(Quaternion);
            return result;
        }
        static NORMALIZATION(_q) {
            const result = _q.clone;
            result.normalize();
            return result;
        }
        static ROTATION(_eulerAngles) {
            const result = FudgeCore.Recycler.get(Quaternion);
            result.eulerAngles = _eulerAngles;
            return result;
        }
        static MULTIPLICATION(_qLeft, _qRight) {
            const result = _qLeft.clone;
            result.multiply(_qRight);
            return result;
        }
        static INVERSION(_q) {
            const result = _q.clone;
            result.inverse();
            return result;
        }
        static CONJUGATION(_q) {
            const result = _q.clone;
            result.conjugate();
            return result;
        }
        static DOT(_q1, _q2) {
            return _q1.x * _q2.x + _q1.y * _q2.y + _q1.z * _q2.z + _q1.w * _q2.w;
        }
        static LERP(_from, _to, _factor) {
            let result = FudgeCore.Recycler.get(Quaternion);
            result.set((_from.x * (1 - _factor) + _to.x * _factor), (_from.y * (1 - _factor) + _to.y * _factor), (_from.z * (1 - _factor) + _to.z * _factor), (_from.w * (1 - _factor) + _to.w * _factor));
            result.normalize();
            return result;
        }
        static SLERP(_from, _to, _factor) {
            let cosHalfTheta = _from.w * _to.w + _from.x * _to.x + _from.y * _to.y + _from.z * _to.z;
            if (Math.abs(cosHalfTheta) >= 1)
                return _from;
            let halfTheta = Math.acos(cosHalfTheta);
            let sinHalfTheta = Math.sqrt(1 - cosHalfTheta * cosHalfTheta);
            if (Math.abs(sinHalfTheta) < 0.001) {
                let result = FudgeCore.Recycler.get(Quaternion);
                result.set((_from.x * 0.5 + _to.x * 0.5), (_from.y * 0.5 + _to.y * 0.5), (_from.z * 0.5 + _to.z * 0.5), (_from.w * 0.5 + _to.w * 0.5));
                return result;
            }
            let ratioA = Math.sin((1 - _factor) * halfTheta) / sinHalfTheta;
            let ratioB = Math.sin(_factor * halfTheta) / sinHalfTheta;
            let result = FudgeCore.Recycler.get(Quaternion);
            result.set((_from.x * ratioA + _to.x * ratioB), (_from.y * ratioA + _to.y * ratioB), (_from.z * ratioA + _to.z * ratioB), (_from.w * ratioA + _to.w * ratioB));
            return result;
        }
        get clone() {
            let result = FudgeCore.Recycler.get(Quaternion);
            result.set(this.x, this.y, this.z, this.w);
            return result;
        }
        get eulerAngles() {
            if (this.#eulerAnglesDirty) {
                this.#eulerAnglesDirty = false;
                if (this.x == 0 && this.y == 0 && this.z == 0 && this.w == 1) {
                    this.#eulerAngles.set(0, 0, 0);
                    return this.#eulerAngles;
                }
                let sinrcosp = 2 * (this.w * this.x + this.y * this.z);
                let cosrcosp = 1 - 2 * (this.x * this.x + this.y * this.y);
                this.#eulerAngles.x = Math.atan2(sinrcosp, cosrcosp);
                let sinp = 2 * (this.w * this.y - this.z * this.x);
                if (Math.abs(sinp) >= 1)
                    this.#eulerAngles.y = sinp < 0 ? -Math.abs(Math.PI / 2) : Math.abs(Math.PI / 2);
                else
                    this.#eulerAngles.y = Math.asin(sinp);
                let sinycosp = 2 * (this.w * this.z + this.x * this.y);
                let cosycosp = 1 - 2 * (this.y * this.y + this.z * this.z);
                this.#eulerAngles.z = Math.atan2(sinycosp, cosycosp);
                this.#eulerAngles.scale(FudgeCore.Calc.rad2deg);
            }
            return this.#eulerAngles;
        }
        set eulerAngles(_eulerAngles) {
            const halfAnglesInRadians = FudgeCore.Vector3.SCALE(_eulerAngles, FudgeCore.Calc.deg2rad / 2);
            const cosX = Math.cos(halfAnglesInRadians.x);
            const cosY = Math.cos(halfAnglesInRadians.y);
            const cosZ = Math.cos(halfAnglesInRadians.z);
            const sinX = Math.sin(halfAnglesInRadians.x);
            const sinY = Math.sin(halfAnglesInRadians.y);
            const sinZ = Math.sin(halfAnglesInRadians.z);
            this.set(sinX * cosY * cosZ - cosX * sinY * sinZ, cosX * sinY * cosZ + sinX * cosY * sinZ, cosX * cosY * sinZ - sinX * sinY * cosZ, cosX * cosY * cosZ + sinX * sinY * sinZ);
            this.#eulerAnglesDirty = false;
        }
        normalize() {
            let length = Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2 + this.w ** 2);
            this.x /= length;
            this.y /= length;
            this.z /= length;
            this.w /= length;
            this.resetCache();
            return this;
        }
        negate() {
            this.x *= -1;
            this.y *= -1;
            this.z *= -1;
            this.w *= -1;
            this.resetCache();
            return this;
        }
        recycle() {
            this.set(0, 0, 0, 1);
        }
        inverse() {
            this.conjugate();
        }
        conjugate() {
            this.x *= -1;
            this.y *= -1;
            this.z *= -1;
            this.resetCache();
            return this;
        }
        multiply(_other, _fromLeft = false) {
            const a = _fromLeft ? _other : this;
            const b = _fromLeft ? this : _other;
            const ax = a.x;
            const ay = a.y;
            const az = a.z;
            const aw = a.w;
            const bx = b.x;
            const by = b.y;
            const bz = b.z;
            const bw = b.w;
            this.set(ax * bw + ay * bz - az * by + aw * bx, -ax * bz + ay * bw + az * bx + aw * by, ax * by - ay * bx + az * bw + aw * bz, -ax * bx - ay * by - az * bz + aw * bw);
        }
        set(_x, _y, _z, _w) {
            this.x = _x;
            this.y = _y;
            this.z = _z;
            this.w = _w;
            this.resetCache();
        }
        toString() {
            return `ƒ.Quaternion(x: ${this.x}, y: ${this.y}, z: ${this.z}, w: ${this.w})`;
        }
        serialize() {
            let serialization = this.getMutator();
            serialization.toJSON = () => { return `[${this.x}, ${this.y}, ${this.z}, ${this.w}]`; };
            return serialization;
        }
        async deserialize(_serialization) {
            if (typeof (_serialization) == "string") {
                [this.x, this.y, this.z, this.w] = JSON.parse(_serialization);
            }
            else
                this.mutate(_serialization);
            return this;
        }
        getMutator() {
            if (!this.mutator)
                this.mutator = { x: this.x, y: this.y, z: this.z, w: this.w };
            return this.mutator;
        }
        async mutate(_mutator) {
            this.x = _mutator.x ?? this.x;
            this.y = _mutator.y ?? this.y;
            this.z = _mutator.z ?? this.z;
            this.w = _mutator.w ?? this.w;
            this.resetCache();
        }
        reduceMutator(_mutator) { }
        resetCache() {
            this.#eulerAnglesDirty = true;
            this.mutator = null;
        }
    }
    FudgeCore.Quaternion = Quaternion;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Random {
        static { this.default = new Random(); }
        constructor(_seedOrFunction) {
            this.generate = Math.random;
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
        static TRANSFORMATION(_vector, _transform, _includeTranslation = true) {
            let result = FudgeCore.Recycler.get(Vector3);
            let [x, y, z] = _vector.get();
            if (_transform instanceof FudgeCore.Matrix4x4) {
                let m = _transform.get();
                result.x = m[0] * x + m[4] * y + m[8] * z;
                result.y = m[1] * x + m[5] * y + m[9] * z;
                result.z = m[2] * x + m[6] * y + m[10] * z;
                if (_includeTranslation) {
                    result.add(_transform.translation);
                }
            }
            else {
                const qx = _transform.w * x + _transform.y * z - _transform.z * y;
                const qy = _transform.w * y + _transform.z * x - _transform.x * z;
                const qz = _transform.w * z + _transform.x * y - _transform.y * x;
                const qw = -_transform.x * x - _transform.y * y - _transform.z * z;
                result.set(qx * _transform.w + qw * -_transform.x + qy * -_transform.z - qz * -_transform.y, qy * _transform.w + qw * -_transform.y + qz * -_transform.x - qx * -_transform.z, qz * _transform.w + qw * -_transform.z + qx * -_transform.y - qy * -_transform.x);
            }
            return result;
        }
        static NORMALIZATION(_vector, _length = 1) {
            let magnitudeSquared = _vector.magnitudeSquared;
            if (magnitudeSquared == 0)
                throw (new RangeError("Impossible normalization"));
            let vector = _vector.clone;
            vector.scale(_length / Math.sqrt(magnitudeSquared));
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
        static ANGLE(_from, _to) {
            let angle = Math.acos(Vector3.DOT(_from, _to) / (_from.magnitude * _to.magnitude));
            return angle * FudgeCore.Calc.rad2deg;
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
        copy(_original) {
            this.data.set(_original.data);
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
        negate() {
            this.x = -this.x;
            this.y = -this.y;
            this.z = -this.z;
            return this;
        }
        set(_x = 0, _y = 0, _z = 0) {
            this.data[0] = _x;
            this.data[1] = _y;
            this.data[2] = _z;
        }
        get() {
            return new Float32Array(this.data);
        }
        transform(_transform, _includeTranslation = true) {
            let transformed = Vector3.TRANSFORMATION(this, _transform, _includeTranslation);
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
        async mutate(_mutator) {
            this.data[0] = _mutator.x ?? this.data[0];
            this.data[1] = _mutator.y ?? this.data[1];
            this.data[2] = _mutator.z ?? this.data[2];
        }
        getMutator() {
            let mutator = { x: this.data[0], y: this.data[1], z: this.data[2] };
            return mutator;
        }
        reduceMutator(_mutator) { }
    }
    FudgeCore.Vector3 = Vector3;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Vector4 extends FudgeCore.Mutable {
        constructor(_x = 0, _y = 0, _z = 0, _w = 0) {
            super();
            this.set(_x, _y, _z, _w);
        }
        get magnitude() {
            return Math.hypot(this.x, this.y, this.z, this.w);
        }
        get magnitudeSquared() {
            return this.dot(this);
        }
        get clone() {
            let clone = FudgeCore.Recycler.get(Vector4);
            clone.set(this.x, this.y, this.z, this.w);
            return clone;
        }
        set(_x, _y, _z, _w) {
            this.x = _x;
            this.y = _y;
            this.z = _z;
            this.w = _w;
        }
        get() {
            return [this.x, this.y, this.z, this.w];
        }
        copy(_original) {
            this.set(_original.x, _original.y, _original.z, _original.w);
        }
        add(_addend) {
            this.x += _addend.x;
            this.y += _addend.y;
            this.z += _addend.z;
            this.w += _addend.w;
            return this;
        }
        subtract(_subtrahend) {
            this.x -= _subtrahend.x;
            this.y -= _subtrahend.y;
            this.z -= _subtrahend.z;
            this.w -= _subtrahend.w;
            return this;
        }
        scale(_scalar) {
            this.x *= _scalar;
            this.y *= _scalar;
            this.z *= _scalar;
            this.w *= _scalar;
            return this;
        }
        normalize(_length = 1) {
            let magnitudeSquared = this.magnitudeSquared;
            if (magnitudeSquared == 0)
                throw (new RangeError("Impossible normalization"));
            this.scale(_length / Math.sqrt(magnitudeSquared));
            return this;
        }
        dot(_other) {
            return this.x * _other.x + this.y * _other.y + this.z * _other.z + this.w * _other.w;
        }
        recycle() {
            this.set(0, 0, 0, 0);
        }
        serialize() {
            return { toJSON: () => `[${this.x}, ${this.y}, ${this.z}, ${this.w}]` };
        }
        async deserialize(_serialization) {
            [this.x, this.y, this.z, this.w] = JSON.parse(_serialization);
            return this;
        }
        reduceMutator(_mutator) { }
        ;
    }
    FudgeCore.Vector4 = Vector4;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Face {
        constructor(_vertices, _index0, _index1, _index2) {
            this.indices = [];
            this.angles = [];
            this.indices = [_index0, _index1, _index2];
            this.vertices = _vertices;
            this.calculateNormals();
        }
        getPosition(_index) {
            return this.vertices.position(this.indices[_index]);
        }
        isInside(_point) {
            let diffs = [];
            for (let index of this.indices) {
                let diff = FudgeCore.Vector3.DIFFERENCE(this.vertices.position(index), _point);
                diffs.push(diff);
            }
            let n0 = FudgeCore.Vector3.CROSS(diffs[1], diffs[0]);
            let n1 = FudgeCore.Vector3.CROSS(diffs[2], diffs[1]);
            let n2 = FudgeCore.Vector3.CROSS(diffs[0], diffs[2]);
            let dot1 = FudgeCore.Vector3.DOT(n0, n1);
            let dot2 = FudgeCore.Vector3.DOT(n0, n2);
            return !(dot1 < 0 || dot2 < 0);
        }
        calculateNormals() {
            let trigon = this.indices.map((_index) => this.vertices.position(_index));
            let v1 = FudgeCore.Vector3.DIFFERENCE(trigon[1], trigon[0]);
            let v2 = FudgeCore.Vector3.DIFFERENCE(trigon[2], trigon[0]);
            this.normalUnscaled = FudgeCore.Vector3.CROSS(v1, v2);
            this.normal = FudgeCore.Vector3.NORMALIZATION(this.normalUnscaled);
            this.angles.push(FudgeCore.Vector3.ANGLE(v1, v2), FudgeCore.Vector3.ANGLE(FudgeCore.Vector3.DIFFERENCE(trigon[2], trigon[1]), FudgeCore.Vector3.DIFFERENCE(trigon[0], trigon[1])), FudgeCore.Vector3.ANGLE(FudgeCore.Vector3.DIFFERENCE(trigon[0], trigon[2]), FudgeCore.Vector3.DIFFERENCE(trigon[1], trigon[2])));
        }
    }
    FudgeCore.Face = Face;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    var Mesh_1;
    let Mesh = class Mesh extends FudgeCore.Mutable {
        static { Mesh_1 = this; }
        static { this.baseClass = Mesh_1; }
        static { this.subclasses = []; }
        #renderMesh;
        constructor(_name = "Mesh") {
            super();
            this.idResource = undefined;
            this.name = "Mesh";
            this.vertices = new FudgeCore.Vertices();
            this.faces = [];
            this.name = _name;
            this.clear();
            FudgeCore.Project.register(this);
        }
        static registerSubclass(_subClass) { return Mesh_1.subclasses.push(_subClass) - 1; }
        get renderMesh() {
            if (this.#renderMesh == null)
                this.#renderMesh = new FudgeCore.RenderMesh(this);
            return this.#renderMesh;
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
        useRenderBuffers(_shader, _mtxMeshToWorld, _mtxMeshToView, _id) { return null; }
        getRenderBuffers() { return null; }
        deleteRenderBuffers(_renderBuffers) { }
        clear() {
            this.ƒbox = undefined;
            this.ƒradius = undefined;
            this.deleteRenderBuffers(this.renderMesh.buffers);
            this.renderMesh.clear();
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
        reduceMutator(_mutator) {
            delete _mutator.ƒbox;
            delete _mutator.ƒradius;
            delete _mutator.renderBuffers;
        }
        createRadius() {
            let radius = 0;
            for (let i = 0; i < this.vertices.length; i++) {
                radius = Math.max(radius, this.vertices.position(i).magnitudeSquared);
            }
            return Math.sqrt(radius);
        }
        createBoundingBox() {
            let box = FudgeCore.Recycler.get(FudgeCore.Box);
            box.set();
            for (let i = 0; i < this.vertices.length; i++) {
                let point = this.vertices.position(i);
                box.expand(point);
            }
            return box;
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
        static { this.iSubclass = FudgeCore.Mesh.registerSubclass(MeshCube); }
        constructor(_name = "MeshCube") {
            super(_name);
            this.vertices = new FudgeCore.Vertices(new FudgeCore.Vertex(new FudgeCore.Vector3(-0.5, 0.5, 0.5), new FudgeCore.Vector2(0, 0)), new FudgeCore.Vertex(new FudgeCore.Vector3(-0.5, -0.5, 0.5), new FudgeCore.Vector2(0, 1)), new FudgeCore.Vertex(new FudgeCore.Vector3(0.5, -0.5, 0.5), new FudgeCore.Vector2(1, 1)), new FudgeCore.Vertex(new FudgeCore.Vector3(0.5, 0.5, 0.5), new FudgeCore.Vector2(1, 0)));
            for (let angle = 90; angle < 360; angle += 90) {
                let transform = FudgeCore.Matrix4x4.ROTATION(FudgeCore.Vector3.Y(angle));
                let side = this.vertices.slice(0, 4).map((_v) => new FudgeCore.Vertex(FudgeCore.Vector3.TRANSFORMATION(_v.position, transform), _v.uv));
                this.vertices.push(...side);
            }
            for (let angle = 90; angle < 360; angle += 180) {
                let transform = FudgeCore.Matrix4x4.ROTATION(FudgeCore.Vector3.X(angle));
                let side = this.vertices.slice(0, 4).map((_v) => new FudgeCore.Vertex(FudgeCore.Vector3.TRANSFORMATION(_v.position, transform), _v.uv));
                this.vertices.push(...side);
            }
            this.faces = [];
            for (let i = 0; i < 24; i += 4)
                this.faces.push(...new FudgeCore.Quad(this.vertices, i + 0, i + 1, i + 2, i + 3).faces);
        }
    }
    FudgeCore.MeshCube = MeshCube;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class MeshPolygon extends FudgeCore.Mesh {
        static { this.iSubclass = FudgeCore.Mesh.registerSubclass(MeshPolygon); }
        static {
            this.shapeDefault = [
                new FudgeCore.Vector2(-1, -1),
                new FudgeCore.Vector2(1, -1),
                new FudgeCore.Vector2(0, 1)
            ];
        }
        constructor(_name = "MeshPolygon", _shape = MeshPolygon.shapeDefault, _fitTexture = true) {
            super(_name);
            this.shape = new FudgeCore.MutableArray(FudgeCore.Vector2);
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
                this.create(MeshPolygon.shapeDefault, true);
                return;
            }
            let shape = _shape;
            let min = FudgeCore.Vector2.ZERO();
            let max = FudgeCore.Vector2.ZERO();
            this.vertices = new FudgeCore.Vertices();
            for (let vertex of shape) {
                this.vertices.push(new FudgeCore.Vertex(vertex.toVector3()));
                min.x = Math.min(min.x, vertex.x);
                max.x = Math.max(max.x, vertex.x);
                min.y = Math.min(min.y, vertex.y);
                max.y = Math.max(max.y, vertex.y);
            }
            let size = new FudgeCore.Vector2(max.x - min.x, max.y - min.y);
            if (this.fitTexture) {
                for (let i = 0; i < shape.length; i++) {
                    let textureUV = FudgeCore.Vector2.DIFFERENCE(shape[i], min);
                    this.vertices[i].uv = new FudgeCore.Vector2(textureUV.x / size.x, 1 - textureUV.y / size.y);
                }
            }
            else {
                _shape.forEach((_vertex, _i) => this.vertices[_i].uv = new FudgeCore.Vector2(_vertex.x, -_vertex.y));
            }
            this.faces = [];
            for (let i = 2; i < this.vertices.length; i++)
                this.faces.push(new FudgeCore.Face(this.vertices, i - 1, i, 0));
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
        async mutate(_mutator, _selection = null, _dispatchMutate = true) {
            await super.mutate(_mutator, _selection, _dispatchMutate);
            this.create(this.shape, this.fitTexture);
            this.dispatchEvent(new Event("mutate"));
        }
        reduceMutator(_mutator) {
            super.reduceMutator(_mutator);
        }
    }
    FudgeCore.MeshPolygon = MeshPolygon;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class MeshExtrusion extends FudgeCore.MeshPolygon {
        static { this.iSubclass = FudgeCore.Mesh.registerSubclass(MeshExtrusion); }
        static {
            this.mtxDefaults = [
                FudgeCore.Matrix4x4.TRANSLATION(FudgeCore.Vector3.Z(0.5)),
                FudgeCore.Matrix4x4.TRANSLATION(FudgeCore.Vector3.Z(-0.5))
            ];
        }
        constructor(_name = "MeshExtrusion", _vertices = FudgeCore.MeshPolygon.shapeDefault, _mtxTransforms = MeshExtrusion.mtxDefaults, _fitTexture = true) {
            super(_name, _vertices, _fitTexture);
            this.mtxTransforms = new FudgeCore.MutableArray(FudgeCore.Matrix4x4);
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
        async mutate(_mutator, _selection = null, _dispatchMutate = true) {
            await super.mutate(_mutator, _selection, _dispatchMutate);
            this.extrude(this.mtxTransforms);
            this.dispatchEvent(new Event("mutate"));
        }
        reduceMutator(_mutator) {
            super.reduceMutator(_mutator);
        }
        extrude(_mtxTransforms = MeshExtrusion.mtxDefaults) {
            this.mtxTransforms = FudgeCore.MutableArray.from(_mtxTransforms);
            let nTransforms = _mtxTransforms.length;
            let nVerticesShape = this.vertices.length;
            let vertices = new FudgeCore.Vertices();
            let base = this.vertices.map((_v) => new FudgeCore.Vertex(FudgeCore.Vector3.TRANSFORMATION(_v.position, _mtxTransforms[0], true), _v.uv));
            vertices.push(...base);
            let lid = this.vertices.map((_v) => new FudgeCore.Vertex(FudgeCore.Vector3.TRANSFORMATION(_v.position, _mtxTransforms[nTransforms - 1], true), _v.uv));
            vertices.push(...lid);
            this.faces = this.faces.map((_face) => new FudgeCore.Face(vertices, _face.indices[0], _face.indices[1], _face.indices[2]));
            this.faces.push(...this.faces.map(_face => new FudgeCore.Face(vertices, _face.indices[2] + nVerticesShape, _face.indices[1] + nVerticesShape, _face.indices[0] + nVerticesShape)));
            for (let t = 0; t < nTransforms; t++) {
                let mtxTransform = _mtxTransforms[t];
                let referToClose = vertices.length;
                let wrap = this.vertices.map((_v, _i) => new FudgeCore.Vertex(FudgeCore.Vector3.TRANSFORMATION(_v.position, mtxTransform, true), new FudgeCore.Vector2(_i / nVerticesShape, t / nTransforms)));
                vertices.push(...wrap);
                vertices.push(new FudgeCore.Vertex(referToClose, new FudgeCore.Vector2(1, t / nTransforms)));
            }
            for (let t = 0; t < nTransforms - 1; t++)
                for (let i = 0; i < nVerticesShape; i++) {
                    let index = +2 * nVerticesShape
                        + t * (nVerticesShape + 1)
                        + i;
                    let quad = new FudgeCore.Quad(vertices, index, index + nVerticesShape + 1, index + nVerticesShape + 2, index + 1, FudgeCore.QUADSPLIT.AT_0);
                    this.faces.push(...quad.faces);
                }
            this.vertices = vertices;
            return;
        }
    }
    FudgeCore.MeshExtrusion = MeshExtrusion;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class MeshFBX extends FudgeCore.mixinSerializableResourceExternal(FudgeCore.Mesh) {
        async load(_url = this.url, _iMesh = this.iMesh) {
            this.clear();
            this.url = _url;
            this.iMesh = _iMesh;
            const loader = await FudgeCore.FBXLoader.LOAD(this.url.toString());
            const geometryFBX = (loader.fbx.objects.geometries[_iMesh] ||
                loader.fbx.objects.geometries.find(_object => _object.name == this.name) ||
                loader.fbx.objects.models.find(_object => _object.name == this.name && _object.subtype == "Mesh").children[0]).load();
            if (geometryFBX)
                this.name = geometryFBX.name.length > 0 ? geometryFBX.name : geometryFBX.parents[0].name;
            let positions = [];
            let vertexBuffer = geometryFBX.Vertices;
            for (let iVertex = 0; iVertex < vertexBuffer.length; iVertex += 3) {
                positions.push(new FudgeCore.Vector3(vertexBuffer[iVertex + 0], vertexBuffer[iVertex + 1], vertexBuffer[iVertex + 2]));
            }
            let uvs = [];
            if (geometryFBX.LayerElementUV) {
                let uvBuffer = geometryFBX.LayerElementUV.UV;
                for (let iuv = 0; iuv < uvBuffer.length; iuv += 2) {
                    uvs.push(new FudgeCore.Vector2(uvBuffer[iuv], 1 - uvBuffer[iuv + 1]));
                }
            }
            let normals = [];
            if (geometryFBX.LayerElementNormal) {
                let normalBuffer = geometryFBX.LayerElementNormal.Normals;
                for (let iNormal = 0; iNormal < normalBuffer.length; iNormal += 3) {
                    normals.push(new FudgeCore.Vector3(normalBuffer[iNormal], normalBuffer[iNormal + 1], normalBuffer[iNormal + 2]));
                }
            }
            let mapVertexToIndex = new Map();
            let newVertexIndices = [];
            let iPolygon = 0;
            let isEndOfPolygon = false;
            let polygon = [];
            geometryFBX.PolygonVertexIndex.forEach((_iVertex, _iPolygonVertex) => {
                if (_iVertex < 0) {
                    _iVertex = _iVertex ^ -1;
                    isEndOfPolygon = true;
                }
                let position = positions[_iVertex];
                let uv = uvs[this.getDataIndex(geometryFBX.LayerElementUV, _iVertex, iPolygon, _iPolygonVertex)];
                let vertexKey = position.toString() + uv.toString();
                if (!mapVertexToIndex.has(vertexKey)) {
                    let normal = normals[this.getDataIndex(geometryFBX.LayerElementNormal, _iVertex, iPolygon, _iPolygonVertex)];
                    this.vertices.push(new FudgeCore.Vertex(position, uv, normal));
                    mapVertexToIndex.set(vertexKey, this.vertices.length - 1);
                    if (!newVertexIndices[_iVertex])
                        newVertexIndices[_iVertex] = [];
                    newVertexIndices[_iVertex].push(this.vertices.length - 1);
                }
                polygon.push(mapVertexToIndex.get(vertexKey));
                if (isEndOfPolygon) {
                    if (polygon.length == 3) {
                        this.faces.push(new FudgeCore.Face(this.vertices, polygon[0], polygon[1], polygon[2]));
                    }
                    else if (polygon.length == 4) {
                        let quad = new FudgeCore.Quad(this.vertices, polygon[0], polygon[1], polygon[2], polygon[3]);
                        this.faces.push(...quad.faces);
                    }
                    else {
                        for (let i = 2; i < polygon.length; i++)
                            this.faces.push(new FudgeCore.Face(this.vertices, polygon[0], polygon[i - 1], polygon[i - 0]));
                    }
                    polygon = [];
                    isEndOfPolygon = false;
                    iPolygon++;
                }
            });
            if (geometryFBX.children?.[0].type == "Deformer") {
                const fbxDeformer = geometryFBX.children[0];
                const skeleton = await loader.getSkeleton(fbxDeformer.children[0].children[0]);
                this.createBones(fbxDeformer, skeleton, this.vertices, newVertexIndices);
            }
            return this;
        }
        serialize() {
            const serialization = super.serialize();
            serialization.iMesh = this.iMesh;
            return serialization;
        }
        async deserialize(_serialization) {
            this.iMesh = _serialization.iMesh;
            return super.deserialize(_serialization);
        }
        getDataIndex(_layerElement, _iVertex, _iPolygon, _iPolygonVertex) {
            let index = _layerElement.MappingInformationType == "ByVertex" ?
                _iVertex :
                _layerElement.MappingInformationType == "ByPolygon" ?
                    _iPolygon :
                    _iPolygonVertex;
            if (_layerElement.ReferenceInformationType === 'IndexToDirect') {
                let indices = _layerElement.UVIndex || _layerElement.NormalsIndex;
                index = indices[index];
            }
            return index;
        }
        createBones(_deformerFBX, _skeleton, _vertices, _newVertexIndices) {
            for (const fbxSubDeformer of _deformerFBX.children) {
                fbxSubDeformer.load();
                if (fbxSubDeformer.Indexes)
                    for (let iBoneInfluence = 0; iBoneInfluence < fbxSubDeformer.Indexes.length; iBoneInfluence++) {
                        const iVertex = fbxSubDeformer.Indexes[iBoneInfluence];
                        for (const iVertexNew of _newVertexIndices ? _newVertexIndices[iVertex] : [iVertex]) {
                            (_vertices[iVertexNew].bones || (_vertices[iVertexNew].bones = [])).push({
                                index: _skeleton.indexOf(fbxSubDeformer.children[0].name),
                                weight: fbxSubDeformer.Weights[iBoneInfluence] || 1
                            });
                        }
                    }
            }
        }
    }
    FudgeCore.MeshFBX = MeshFBX;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class MeshFromData extends FudgeCore.Mesh {
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
        createFlatNormals() {
            return this.faceNormalsToSet;
        }
    }
    FudgeCore.MeshFromData = MeshFromData;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class MeshGLTF extends FudgeCore.mixinSerializableResourceExternal(FudgeCore.Mesh) {
        async load(_url = this.url, _name = this.name, _iPrimitive = this.iPrimitive) {
            this.url = _url;
            this.name = _name;
            this.iPrimitive = _iPrimitive;
            return FudgeCore.GLTFLoader.loadResource(this);
        }
        serialize() {
            const serialization = super.serialize();
            serialization.iPrimitive = this.iPrimitive;
            return serialization;
        }
        deserialize(_serialization) {
            this.iPrimitive = _serialization.iPrimitive;
            return super.deserialize(_serialization);
        }
    }
    FudgeCore.MeshGLTF = MeshGLTF;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class MeshOBJ extends FudgeCore.mixinSerializableResourceExternal(FudgeCore.Mesh) {
        async load(_url = this.url) {
            const url = new URL(_url.toString(), FudgeCore.Project.baseURL).toString();
            const data = await (await fetch(url)).text();
            this.name = url.split("/").pop();
            this.url = _url;
            const lines = data.split("\n");
            const indices = [];
            const positions = [];
            const uvs = [];
            const normals = [];
            const norms = [];
            const vertices = new FudgeCore.Vertices();
            const faces = [];
            const mapPositionUVNormalToIndex = {};
            const mapPositionNormalToIndex = {};
            for (let line of lines) {
                const parts = line.trim().split(" ");
                switch (parts.shift()) {
                    case "v":
                        positions.push(new FudgeCore.Vector3(...parts.map(_value => +_value)));
                        break;
                    case "vn":
                        normals.push(new FudgeCore.Vector3(...parts.map(_value => +_value)));
                        break;
                    case "vt":
                        uvs.push(new FudgeCore.Vector2(...parts.map((_value, _index) => +_value * (_index == 1 ? -1 : 1))));
                        break;
                    case "f":
                        for (let i = 0; i < 3; i++) {
                            let key = parts[i];
                            let index = mapPositionUVNormalToIndex[key];
                            if (index === undefined) {
                                index = vertices.length;
                                const vertexInfo = parts[i].split("/");
                                let position = positions[+vertexInfo[0] - 1];
                                let uv = uvs[+vertexInfo[1] - 1] ?? undefined;
                                let normal = normals[+vertexInfo[2] - 1] ?? undefined;
                                if (normal)
                                    norms.push(normal.x, normal.y, normal.z);
                                let keyPosNorm = `${vertexInfo[0]}/${vertexInfo[2]}`;
                                vertices.push(new FudgeCore.Vertex(mapPositionNormalToIndex[keyPosNorm] ?? position, uv, normal));
                                mapPositionUVNormalToIndex[key] = index;
                                if (mapPositionNormalToIndex[keyPosNorm] == undefined)
                                    mapPositionNormalToIndex[keyPosNorm] = index;
                            }
                            indices.push(index);
                        }
                        try {
                            faces.push(new FudgeCore.Face(vertices, indices[indices.length - 2], indices[indices.length - 1], indices[indices.length - 3]));
                        }
                        catch (_e) {
                            FudgeCore.Debug.fudge("Face excluded", _e.message);
                        }
                        break;
                }
            }
            this.clear();
            this.vertices = vertices;
            this.faces = faces;
            if (norms.length > 0)
                this.renderMesh.normals = new Float32Array(norms);
            return this;
        }
    }
    FudgeCore.MeshOBJ = MeshOBJ;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class MeshPyramid extends FudgeCore.Mesh {
        static { this.iSubclass = FudgeCore.Mesh.registerSubclass(MeshPyramid); }
        constructor(_name = "MeshPyramid") {
            super(_name);
            this.vertices = new FudgeCore.Vertices(new FudgeCore.Vertex(new FudgeCore.Vector3(-0.5, 0.0, 0.5), new FudgeCore.Vector2(0, 1)), new FudgeCore.Vertex(new FudgeCore.Vector3(0.5, 0.0, 0.5), new FudgeCore.Vector2(1, 1)), new FudgeCore.Vertex(new FudgeCore.Vector3(0.5, 0.0, -0.5), new FudgeCore.Vector2(1, 0)), new FudgeCore.Vertex(new FudgeCore.Vector3(-0.5, 0.0, -0.5), new FudgeCore.Vector2(0, 0)), new FudgeCore.Vertex(new FudgeCore.Vector3(0.0, 1.0, 0.0), new FudgeCore.Vector2(0.5, 0.5)), new FudgeCore.Vertex(0, new FudgeCore.Vector2(0, 0)), new FudgeCore.Vertex(1, new FudgeCore.Vector2(1, 0)), new FudgeCore.Vertex(2, new FudgeCore.Vector2(1, 1)), new FudgeCore.Vertex(3, new FudgeCore.Vector2(0, 1)));
            this.faces = [
                new FudgeCore.Face(this.vertices, 4, 0, 1),
                new FudgeCore.Face(this.vertices, 4, 1, 2),
                new FudgeCore.Face(this.vertices, 4, 2, 3),
                new FudgeCore.Face(this.vertices, 4, 3, 0),
                new FudgeCore.Face(this.vertices, 5 + 0, 5 + 2, 5 + 1),
                new FudgeCore.Face(this.vertices, 5 + 0, 5 + 3, 5 + 2)
            ];
        }
    }
    FudgeCore.MeshPyramid = MeshPyramid;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class MeshQuad extends FudgeCore.MeshPolygon {
        static { this.iSubclass = FudgeCore.Mesh.registerSubclass(MeshQuad); }
        static {
            this.shape = [
                new FudgeCore.Vector2(-0.5, 0.5), new FudgeCore.Vector2(-0.5, -0.5), new FudgeCore.Vector2(0.5, -0.5), new FudgeCore.Vector2(0.5, 0.5)
            ];
        }
        constructor(_name = "MeshQuad") {
            super(_name, MeshQuad.shape);
        }
        serialize() {
            let serialization = this.getMutator();
            return serialization;
        }
        async deserialize(_serialization) {
            await super.deserialize(_serialization);
            this.create(MeshQuad.shape, true);
            return this;
        }
        reduceMutator(_mutator) {
            super.reduceMutator(_mutator);
            delete _mutator.shape;
            delete _mutator.fitTexture;
        }
    }
    FudgeCore.MeshQuad = MeshQuad;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class TerrainInfo {
    }
    FudgeCore.TerrainInfo = TerrainInfo;
    class MeshTerrain extends FudgeCore.Mesh {
        static { this.iSubclass = FudgeCore.Mesh.registerSubclass(MeshTerrain); }
        constructor(_name = "MeshTerrain", _resolution = FudgeCore.Vector2.ONE(2), _scaleInput = FudgeCore.Vector2.ONE(), _functionOrSeed = 0) {
            super(_name);
            this.heightMapFunction = null;
            this.create(_resolution, _scaleInput, _functionOrSeed);
        }
        create(_resolution = FudgeCore.Vector2.ONE(2), _scaleInput = FudgeCore.Vector2.ONE(), _functionOrSeed = 0) {
            this.clear();
            this.seed = undefined;
            this.resolution = new FudgeCore.Vector2(Math.round(_resolution.x), Math.round(_resolution.y));
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
            this.vertices = new FudgeCore.Vertices();
            for (let z = 0; z <= this.resolution.y; z++) {
                for (let x = 0; x <= this.resolution.x; x++) {
                    let xNorm = x / this.resolution.x;
                    let zNorm = z / this.resolution.y;
                    this.vertices.push(new FudgeCore.Vertex(new FudgeCore.Vector3(xNorm - 0.5, this.heightMapFunction(xNorm * this.scale.x, zNorm * this.scale.y), zNorm - 0.5), new FudgeCore.Vector2(xNorm, zNorm)));
                }
            }
            let quads = [];
            let split = FudgeCore.QUADSPLIT.AT_0;
            for (let z = 0; z < this.resolution.y; z++) {
                for (let x = 0; x < this.resolution.x; x++) {
                    quads.push(new FudgeCore.Quad(this.vertices, (x + 0) + (z + 0) * (this.resolution.x + 1), (x + 0) + (z + 1) * (this.resolution.x + 1), (x + 1) + (z + 1) * (this.resolution.x + 1), (x + 1) + (z + 0) * (this.resolution.x + 1), split));
                    split = (split == FudgeCore.QUADSPLIT.AT_0) ? FudgeCore.QUADSPLIT.AT_1 : FudgeCore.QUADSPLIT.AT_0;
                }
                if (this.resolution.x % 2 == 0)
                    split = (split == FudgeCore.QUADSPLIT.AT_0) ? FudgeCore.QUADSPLIT.AT_1 : FudgeCore.QUADSPLIT.AT_0;
            }
            this.faces = quads.flatMap((_quad) => _quad.faces);
        }
        getTerrainInfo(_position, _mtxWorld = FudgeCore.Matrix4x4.IDENTITY(), _mtxInverse) {
            if (!_mtxInverse)
                _mtxInverse = FudgeCore.Matrix4x4.INVERSION(_mtxWorld);
            let terrainInfo = new TerrainInfo;
            let posLocal = FudgeCore.Vector3.TRANSFORMATION(_position, _mtxInverse, true);
            let z = Math.floor((posLocal.z + 0.5) * this.resolution.y);
            let x = Math.floor((posLocal.x + 0.5) * this.resolution.x);
            if (z < 0 || z > this.resolution.y - 1 || x < 0 || x > this.resolution.x - 1)
                return null;
            let index = (z * this.resolution.x + x) * 2;
            let face = this.faces[index];
            let ray = new FudgeCore.Ray(FudgeCore.Vector3.Y(), posLocal);
            let point = ray.intersectFacePlane(face);
            if (!face.isInside(point)) {
                index++;
                face = this.faces[index];
                point = ray.intersectFacePlane(face);
            }
            terrainInfo.index = index;
            terrainInfo.positionFace = point;
            terrainInfo.position = FudgeCore.Vector3.TRANSFORMATION(point, _mtxWorld, true);
            terrainInfo.normal = FudgeCore.Vector3.TRANSFORMATION(face.normal, FudgeCore.Matrix4x4.TRANSPOSE(_mtxInverse), false);
            terrainInfo.distance = _position.y - terrainInfo.position.y;
            terrainInfo.grid = this.getGridFromFaceIndex(index);
            return terrainInfo;
        }
        getGridFromFaceIndex(_index) {
            let result = FudgeCore.Recycler.get(FudgeCore.Vector2);
            let iQuad = Math.floor(_index / 2);
            result.set(iQuad % this.resolution.y, Math.floor(iQuad / this.resolution.x));
            return result;
        }
        getFaceIndicesFromGrid(_grid) {
            let iQuad = _grid.y * 2 * this.resolution.x + _grid.x * 2;
            return [iQuad, iQuad + 1];
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
        async mutate(_mutator, _selection = null, _dispatchMutate = true) {
            super.mutate(_mutator, _selection, _dispatchMutate);
            this.create(this.resolution, this.scale, this.seed);
        }
    }
    FudgeCore.MeshTerrain = MeshTerrain;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class MeshRelief extends FudgeCore.MeshTerrain {
        static { this.iSubclass = FudgeCore.Mesh.registerSubclass(MeshRelief); }
        constructor(_name = "MeshRelief", _texture = null) {
            super(_name, FudgeCore.Vector2.ONE(2), undefined, (_x, _z) => 0);
            this.texture = null;
            this.setTexture(_texture);
        }
        static createHeightMapFunction(_texture) {
            let array = MeshRelief.textureToClampedArray(_texture);
            let heightMapFunction = (_x, _z) => {
                let pixel = Math.round(_z * _texture.image.width + _x);
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
            let resolution = _texture ? new FudgeCore.Vector2(_texture.image.width - 1, _texture.image.height - 1) : undefined;
            super.create(resolution, resolution, MeshRelief.createHeightMapFunction(_texture));
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
            if (typeof (_mutator.texture) !== "undefined")
                this.setTexture(_mutator.texture);
        }
        reduceMutator(_mutator) {
            super.reduceMutator(_mutator);
            delete _mutator.seed;
            delete _mutator.scale;
            delete _mutator.resolution;
        }
    }
    FudgeCore.MeshRelief = MeshRelief;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class MeshRotation extends FudgeCore.Mesh {
        static { this.iSubclass = FudgeCore.Mesh.registerSubclass(MeshRotation); }
        static {
            this.verticesDefault = [
                new FudgeCore.Vector2(0.5, 0.5),
                new FudgeCore.Vector2(0.5, -0.5)
            ];
        }
        constructor(_name = "MeshRotation", _shape = MeshRotation.verticesDefault, _longitudes = 3) {
            super(_name);
            this.shape = new FudgeCore.MutableArray(FudgeCore.Vector2);
            this.rotate(_shape, _longitudes);
        }
        get minVertices() {
            return 2;
        }
        serialize() {
            let serialization = super.serialize();
            serialization.shape = FudgeCore.Serializer.serializeArray(FudgeCore.Vector2, this.shape);
            serialization.longitudes = this.longitudes;
            return serialization;
        }
        async deserialize(_serialization) {
            await super.deserialize(_serialization);
            let shape = await FudgeCore.Serializer.deserializeArray(_serialization.shape);
            this.longitudes = _serialization.longitudes;
            this.rotate(shape, this.longitudes);
            return this;
        }
        async mutate(_mutator, _selection = null, _dispatchMutate = true) {
            await super.mutate(_mutator, _selection, _dispatchMutate);
            this.rotate(this.shape, this.longitudes);
            this.dispatchEvent(new Event("mutate"));
        }
        rotate(_shape, _longitudes) {
            this.clear();
            this.shape = FudgeCore.MutableArray.from(_shape.map(_vertex => _vertex.clone));
            this.longitudes = Math.round(_longitudes);
            let angle = 360 / this.longitudes;
            let mtxRotate = FudgeCore.Matrix4x4.ROTATION_Y(angle);
            let polygon = [];
            let distances = [0];
            let total = 0;
            for (let i = 0; i < this.shape.length; i++) {
                polygon.push(this.shape[i].toVector3());
                if (i > 0) {
                    let distance = FudgeCore.Vector2.DIFFERENCE(this.shape[i], this.shape[i - 1]).magnitude;
                    total += distance;
                    distances.push(total);
                }
            }
            distances.forEach((_entry, _index) => { distances[_index] = _entry / total; });
            let nVerticesPolygon = polygon.length;
            let cloud = new FudgeCore.Vertices();
            for (let longitude = 0; longitude <= this.longitudes; longitude++) {
                for (let i = 0; i < nVerticesPolygon; i++) {
                    let uv = new FudgeCore.Vector2(longitude / this.longitudes, distances[i]);
                    if (longitude == this.longitudes)
                        cloud.push(new FudgeCore.Vertex(i, uv));
                    else {
                        if (longitude > 0 && this.shape[i].x == 0)
                            cloud.push(new FudgeCore.Vertex(i, uv));
                        else
                            cloud.push(new FudgeCore.Vertex(polygon[i].clone, uv));
                    }
                }
                polygon.forEach((_vector) => _vector.transform(mtxRotate));
            }
            let faces = [];
            for (let longitude = 0; longitude < this.longitudes; longitude++) {
                for (let latitude = 0; latitude < nVerticesPolygon - 1; latitude++) {
                    let start = longitude * nVerticesPolygon + latitude;
                    let quad = new FudgeCore.Quad(cloud, start + 1, start + 1 + nVerticesPolygon, start + nVerticesPolygon, start);
                    faces.push(...quad.faces);
                }
            }
            this.vertices = cloud;
            this.faces = faces;
        }
    }
    FudgeCore.MeshRotation = MeshRotation;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class MeshSphere extends FudgeCore.MeshRotation {
        static { this.iSubclass = FudgeCore.Mesh.registerSubclass(MeshSphere); }
        constructor(_name = "MeshSphere", _longitudes = 8, _latitudes = 8) {
            super(_name);
            this.create(_longitudes, _latitudes);
        }
        create(_longitudes = 3, _latitudes = 2) {
            this.clear();
            this.longitudes = Math.min(Math.round(_longitudes), 128);
            this.latitudes = Math.min(Math.round(_latitudes), 128);
            if (_longitudes < 3 || _latitudes < 2) {
                FudgeCore.Debug.warn("UV Sphere must have at least 3 longitudes and 2 latitudes to form a 3-dimensional shape.");
                this.longitudes = Math.max(3, _longitudes);
                this.latitudes = Math.max(2, _latitudes);
            }
            let shape = [];
            let step = Math.PI / this.latitudes;
            for (let i = 0; i <= this.latitudes; ++i) {
                let angle = Math.PI / 2 - i * step;
                let x = Math.cos(angle);
                let y = Math.sin(angle);
                shape.push(new FudgeCore.Vector2(x / 2, y / 2));
            }
            shape[0].x = 0;
            shape[shape.length - 1].x = 0;
            super.rotate(shape, _longitudes);
        }
        serialize() {
            let serialization = super.serialize();
            delete serialization.shape;
            serialization.latitudes = this.latitudes;
            return serialization;
        }
        async deserialize(_serialization) {
            await super.deserialize(_serialization);
            this.create(_serialization.longitudes, _serialization.latitudes);
            return this;
        }
        async mutate(_mutator, _selection = null, _dispatchMutate = true) {
            super.mutate(_mutator, _selection, _dispatchMutate);
            this.create(this.longitudes, this.latitudes);
        }
        reduceMutator(_mutator) {
            super.reduceMutator(_mutator);
            delete _mutator.shape;
        }
    }
    FudgeCore.MeshSphere = MeshSphere;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class MeshSprite extends FudgeCore.Mesh {
        static { this.iSubclass = FudgeCore.Mesh.registerSubclass(MeshSprite); }
        constructor(_name = "MeshSprite") {
            super(_name);
            this.vertices = new FudgeCore.Vertices(new FudgeCore.Vertex(new FudgeCore.Vector3(-0.5, 0.5, 0), new FudgeCore.Vector2(0, 0)), new FudgeCore.Vertex(new FudgeCore.Vector3(-0.5, -0.5, 0), new FudgeCore.Vector2(0, 1)), new FudgeCore.Vertex(new FudgeCore.Vector3(0.5, -0.5, 0), new FudgeCore.Vector2(1, 1)), new FudgeCore.Vertex(new FudgeCore.Vector3(0.5, 0.5, 0), new FudgeCore.Vector2(1, 0)));
            this.faces = [
                new FudgeCore.Face(this.vertices, 1, 2, 0),
                new FudgeCore.Face(this.vertices, 2, 3, 0),
                new FudgeCore.Face(this.vertices, 0, 3, 1),
                new FudgeCore.Face(this.vertices, 3, 2, 1)
            ];
        }
        get verticesFlat() { return this.renderMesh.vertices; }
        get indicesFlat() { return this.renderMesh.indices; }
    }
    FudgeCore.MeshSprite = MeshSprite;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class MeshTorus extends FudgeCore.MeshRotation {
        static { this.iSubclass = FudgeCore.Mesh.registerSubclass(MeshTorus); }
        constructor(_name = "MeshTorus", _size = 0.25, _longitudes = 8, _latitudes = 6) {
            super(_name, MeshTorus.getShape(_size, Math.max(3, _latitudes)), _longitudes);
            this.size = 0.25;
            this.latitudes = 12;
            this.size = _size;
            this.longitudes = _longitudes;
            this.latitudes = Math.max(3, _latitudes);
        }
        static getShape(_size, _latitudes) {
            let shape = [];
            let radius = _size / 2;
            let center = new FudgeCore.Vector2(0.25 + radius, 0);
            for (let latitude = 0; latitude <= _latitudes; latitude++) {
                let angle = 2 * Math.PI * latitude / _latitudes;
                shape.push(FudgeCore.Vector2.SUM(center, new FudgeCore.Vector2(radius * -Math.cos(angle), radius * Math.sin(angle))));
            }
            return shape;
        }
        create(_size = 0.25, _longitudes = 8, _latitudes = 6) {
            this.size = _size;
            this.latitudes = Math.max(3, _latitudes);
            super.rotate(MeshTorus.getShape(_size, _latitudes), _longitudes);
        }
        serialize() {
            let serialization = super.serialize();
            serialization.latitudes = this.latitudes;
            serialization.size = this.size;
            return serialization;
        }
        async deserialize(_serialization) {
            await super.deserialize(_serialization);
            this.create(_serialization.size, _serialization.longitudes, _serialization.latitudes);
            return this;
        }
        async mutate(_mutator, _selection = null, _dispatchMutate = true) {
            super.mutate(_mutator, _selection, _dispatchMutate);
            this.create(this.size, this.longitudes, this.latitudes);
        }
        reduceMutator(_mutator) {
            super.reduceMutator(_mutator);
            delete _mutator.shape;
        }
    }
    FudgeCore.MeshTorus = MeshTorus;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    let QUADSPLIT;
    (function (QUADSPLIT) {
        QUADSPLIT[QUADSPLIT["PLANAR"] = 0] = "PLANAR";
        QUADSPLIT[QUADSPLIT["AT_0"] = 1] = "AT_0";
        QUADSPLIT[QUADSPLIT["AT_1"] = 2] = "AT_1";
    })(QUADSPLIT = FudgeCore.QUADSPLIT || (FudgeCore.QUADSPLIT = {}));
    class Quad {
        #split;
        constructor(_vertices, _index0, _index1, _index2, _index3, _split = QUADSPLIT.PLANAR) {
            this.faces = [];
            this.#split = _split;
            try {
                if (_split != QUADSPLIT.AT_1)
                    this.faces.push(new FudgeCore.Face(_vertices, _index0, _index1, _index2));
                else
                    this.faces.push(new FudgeCore.Face(_vertices, _index1, _index2, _index3));
            }
            catch (_e) {
                FudgeCore.Debug.fudge("Face excluded", _e.message);
            }
            try {
                if (_split == QUADSPLIT.PLANAR)
                    this.faces.push(new FudgeCore.Face(_vertices, _index3, _index0, _index2));
                else if (_split == QUADSPLIT.AT_0)
                    this.faces.push(new FudgeCore.Face(_vertices, _index0, _index2, _index3));
                else
                    this.faces.push(new FudgeCore.Face(_vertices, _index1, _index3, _index0));
            }
            catch (_e) {
                FudgeCore.Debug.fudge("Face excluded", _e.message);
            }
        }
        get split() {
            return this.#split;
        }
    }
    FudgeCore.Quad = Quad;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Vertex {
        constructor(_positionOrIndex, _uv = null, _normal = FudgeCore.Vector3.ZERO(), _tangent = null, _color = new FudgeCore.Color(1, 1, 1, 1), _bones = null) {
            if (_positionOrIndex instanceof FudgeCore.Vector3)
                this.position = _positionOrIndex;
            else
                this.referTo = _positionOrIndex;
            this.uv = _uv;
            this.normal = _normal;
            this.tangent = _tangent;
            this.color = _color;
            this.bones = _bones;
        }
    }
    FudgeCore.Vertex = Vertex;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Vertices extends Array {
        get originals() {
            return this.filter(_vertex => _vertex.referTo == undefined);
        }
        position(_index) {
            let vertex = this[_index];
            return (vertex.referTo == undefined) ? vertex.position : this[vertex.referTo].position;
        }
        normal(_index) {
            let vertex = this[_index];
            return (vertex.referTo == undefined) ? vertex.normal : this[vertex.referTo].normal;
        }
        tangent(_index) {
            return this[_index].tangent;
        }
        uv(_index) {
            return this[_index].uv;
        }
        color(_index) {
            return this[_index].color;
        }
        bones(_index) {
            let vertex = this[_index];
            return (vertex.referTo == undefined) ? vertex.bones : this[vertex.referTo].bones;
        }
    }
    FudgeCore.Vertices = Vertices;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    let ParticleData;
    (function (ParticleData) {
        function isExpression(_data) {
            return isFunction(_data) || isVariable(_data) || isConstant(_data) || isCode(_data);
        }
        ParticleData.isExpression = isExpression;
        function isFunction(_data) {
            return typeof _data == "object" && "function" in _data;
        }
        ParticleData.isFunction = isFunction;
        function isVariable(_data) {
            return typeof _data == "object" && "value" in _data && typeof _data.value == "string";
        }
        ParticleData.isVariable = isVariable;
        function isConstant(_data) {
            return typeof _data == "object" && "value" in _data && typeof _data.value == "number";
        }
        ParticleData.isConstant = isConstant;
        function isCode(_data) {
            return typeof _data == "object" && "code" in _data;
        }
        ParticleData.isCode = isCode;
        function isTransformation(_data) {
            return typeof _data == "object" && "transformation" in _data;
        }
        ParticleData.isTransformation = isTransformation;
    })(ParticleData = FudgeCore.ParticleData || (FudgeCore.ParticleData = {}));
    class ParticleSystem extends FudgeCore.Mutable {
        #data;
        #shaderToShaderParticleSystem;
        constructor(_name = ParticleSystem.name, _data = {}) {
            super();
            this.idResource = undefined;
            this.#shaderToShaderParticleSystem = new Map();
            this.name = _name;
            this.data = _data;
            FudgeCore.Project.register(this);
        }
        get data() {
            return this.#data;
        }
        set data(_data) {
            this.#data = _data;
            this.#shaderToShaderParticleSystem.forEach(_shader => _shader.deleteProgram());
            this.#shaderToShaderParticleSystem.clear();
        }
        getShaderFrom(_source) {
            if (!this.#shaderToShaderParticleSystem.has(_source)) {
                let particleShader = new FudgeCore.ShaderParticleSystem();
                particleShader.data = this.data;
                particleShader.define = [...particleShader.define, ..._source.define];
                particleShader.vertexShaderSource = _source.getVertexShaderSource();
                particleShader.fragmentShaderSource = _source.getFragmentShaderSource();
                this.#shaderToShaderParticleSystem.set(_source, particleShader);
            }
            return this.#shaderToShaderParticleSystem.get(_source);
        }
        serialize() {
            let serialization = {
                idResource: this.idResource,
                name: this.name,
                data: this.data
            };
            return serialization;
        }
        async deserialize(_serialization) {
            FudgeCore.Project.register(this, _serialization.idResource);
            this.name = _serialization.name;
            this.data = _serialization.data;
            return this;
        }
        getMutatorForUserInterface() {
            return super.getMutator();
        }
        getMutator() {
            let mutator = super.getMutator(true);
            mutator.data = this.data;
            return mutator;
        }
        reduceMutator(_mutator) {
            delete _mutator.cachedMutators;
            delete _mutator.shaderMap;
        }
    }
    FudgeCore.ParticleSystem = ParticleSystem;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    let ShaderParticleSystem = class ShaderParticleSystem {
        constructor() {
            this.define = ["PARTICLE"];
        }
        getVertexShaderSource() { return ""; }
        getFragmentShaderSource() { return ""; }
        deleteProgram() { }
        useProgram() { }
        createProgram() { }
    };
    ShaderParticleSystem = __decorate([
        FudgeCore.RenderInjectorShaderParticleSystem.decorate
    ], ShaderParticleSystem);
    FudgeCore.ShaderParticleSystem = ShaderParticleSystem;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ComponentWalker extends FudgeCore.Component {
        static { this.iSubclass = FudgeCore.Component.registerSubclass(ComponentWalker); }
        #walkData;
        #promiseResolverOnWalkFinished;
        #rotateInWalkDirection;
        constructor() {
            super();
            this.speed = 1;
            this.#walkData = { path: [], totalProgress: -1 };
            this.#rotateInWalkDirection = false;
            if (FudgeCore.Project.mode == FudgeCore.MODE.EDITOR)
                return;
            this.addEventListener("componentAdd", this.#handleAttach.bind(this));
            this.addEventListener("componentRemove", this.#handleDetach.bind(this));
        }
        serialize() {
            let serialization = {
                [super.constructor.name]: super.serialize(),
                speed: this.speed
            };
            return serialization;
        }
        async deserialize(_serialization) {
            this.speed = _serialization.speed;
            await super.deserialize(_serialization[super.constructor.name]);
            return this;
        }
        async moveTo(_start, _end, _rotate = false) {
            if (!_start)
                return;
            let translate = FudgeCore.Vector3.DIFFERENCE(_start.mtxWorld.translation, this.node.mtxWorld.translation);
            this.node.mtxLocal.translate(translate);
            if (!_end || _start === _end) {
                this.#walkData = { path: [], totalProgress: -1 };
                return;
            }
            this.#rotateInWalkDirection = _rotate;
            return new Promise((_resolve, _reject) => {
                let path = this.getPath(_start, _end);
                if (!path || path.length === 0) {
                    _reject();
                    return;
                }
                this.#walkData = { path, totalProgress: 0 };
                this.#promiseResolverOnWalkFinished = _resolve;
                if (this.#rotateInWalkDirection && this.#walkData.path.length >= 1) {
                    this.rotateTowards(this.#walkData.path[0].waypoint);
                }
            });
        }
        moving() {
            if (this.#walkData.totalProgress < 0 || this.#walkData.path.length == 0)
                return;
            let currentPath = this.#walkData.path[this.#walkData.totalProgress];
            if (!currentPath)
                return;
            let delta = this.speed * currentPath.previousConnection.speedModifier * FudgeCore.Loop.timeFrameGame / 1000;
            let step = FudgeCore.Vector3.DIFFERENCE(currentPath.waypoint.mtxWorld.translation, this.node.mtxWorld.translation);
            let scale = FudgeCore.Vector3.DIFFERENCE(currentPath.waypoint.mtxWorld.scaling, this.node.mtxWorld.scaling);
            if (delta * delta < step.magnitudeSquared) {
                step.normalize(delta);
                this.node.mtxLocal.translate(step, false);
                if (scale.magnitudeSquared > 0) {
                    scale.normalize(delta);
                }
                this.node.mtxLocal.scaling = FudgeCore.Vector3.SUM(scale, this.node.mtxLocal.scaling);
                return;
            }
            this.dispatchEvent(new CustomEvent("waypointReached", { bubbles: true, detail: currentPath.waypoint }));
            currentPath.waypoint.dispatchEvent(new CustomEvent("waypointReached", { bubbles: true, detail: this }));
            let translate = FudgeCore.Vector3.DIFFERENCE(currentPath.waypoint.mtxWorld.translation, this.node.mtxWorld.translation);
            this.node.mtxLocal.translate(translate, false);
            this.node.mtxLocal.scaling = currentPath.waypoint.mtxWorld.scaling;
            this.#walkData.totalProgress++;
            if (this.#walkData.totalProgress >= this.#walkData.path.length) {
                if (this.#promiseResolverOnWalkFinished)
                    this.#promiseResolverOnWalkFinished();
                this.dispatchEvent(new CustomEvent("pathingConcluded", { bubbles: true, detail: currentPath.waypoint }));
                return;
            }
            if (this.#rotateInWalkDirection) {
                this.rotateTowards(this.#walkData.path[this.#walkData.totalProgress].waypoint);
            }
        }
        getPath(_start, _end) {
            let unvisitedNodes = [];
            let processedWaypoints = [_start];
            let waypointsToSearchThrough = [_start];
            do {
                let waypoint = waypointsToSearchThrough.pop();
                for (let connection of waypoint.connections) {
                    if (!processedWaypoints.includes(connection.end) && connection.start.isActive && connection.end.isActive) {
                        waypointsToSearchThrough.push(connection.end);
                        processedWaypoints.push(connection.end);
                    }
                }
                unvisitedNodes.push({ waypoint, distance: waypoint === _start ? 0 : Infinity, previous: null, previousConnection: null });
            } while (waypointsToSearchThrough.length > 0);
            while (unvisitedNodes.length > 0) {
                unvisitedNodes.sort((_a, _b) => _a.distance - _b.distance);
                let currentNode = unvisitedNodes.shift();
                if (currentNode.waypoint === _end)
                    return this.pathingNodeToPath(currentNode);
                for (let con of currentNode.waypoint.connections) {
                    if (!this.isConnectionUsable(con))
                        continue;
                    let endNode = unvisitedNodes.find(_n => _n.waypoint === con.end);
                    if (!endNode)
                        continue;
                    let newDistance = currentNode.distance + this.calculateConnectionCost(con);
                    if (newDistance >= endNode.distance)
                        continue;
                    endNode.distance = newDistance;
                    endNode.previous = currentNode;
                    endNode.previousConnection = con;
                }
            }
            return null;
        }
        isConnectionUsable(_connection) {
            return true;
        }
        calculateConnectionCost(_connection) {
            if (_connection.cost >= 0)
                return _connection.cost;
            return 0;
        }
        pathingNodeToPath(_node) {
            let path = [];
            if (!_node)
                return path;
            do {
                path.push(_node);
                _node = _node.previous;
            } while (_node?.previous);
            return path.reverse();
        }
        rotateTowards(_waypoint) {
            let mtxLook = FudgeCore.Matrix4x4.LOOK_AT(this.node.mtxWorld.translation, _waypoint.mtxWorld.translation);
            this.node.mtxLocal.rotation = mtxLook.rotation;
        }
        #handleAttach() {
            FudgeCore.Loop.addEventListener("loopFrame", this.moving.bind(this));
        }
        #handleDetach() {
            FudgeCore.Loop.removeEventListener("loopFrame", this.moving.bind(this));
        }
    }
    FudgeCore.ComponentWalker = ComponentWalker;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ComponentWaypoint extends FudgeCore.Component {
        static { this.iSubclass = FudgeCore.Component.registerSubclass(this); }
        static #waypoints = [];
        #connections;
        constructor(_mtxInit = FudgeCore.Matrix4x4.IDENTITY(), _connections = []) {
            super();
            this.#connections = _connections;
            this.mtxLocal = _mtxInit;
            this.singleton = false;
            if (FudgeCore.Project.mode == FudgeCore.MODE.EDITOR)
                return;
            this.addEventListener("componentAdd", this.#handleAttach.bind(this));
            this.addEventListener("componentRemove", this.#handleDetach.bind(this));
        }
        static get waypoints() {
            return ComponentWaypoint.#waypoints;
        }
        static addConnection(_start, _end, _cost, _speedModifier = 1, _bothWays = false) {
            _start.addConnection({ cost: _cost, end: _end, start: _start, speedModifier: _speedModifier });
            if (_bothWays)
                _end.addConnection({ cost: _cost, end: _start, start: _end, speedModifier: _speedModifier });
        }
        get isActive() {
            return this.active;
        }
        get connections() {
            return this.#connections;
        }
        get mtxWorld() {
            return FudgeCore.Matrix4x4.MULTIPLICATION(this.mtxLocal, this.node.mtxWorld);
        }
        addConnection(_connection) {
            this.#connections.push(_connection);
        }
        removeConnection(_connection) {
            let index = this.#connections.indexOf(_connection);
            if (index < 0)
                return;
            this.#connections.splice(index, 1);
        }
        serialize() {
            let serialization = {
                [super.constructor.name]: super.serialize(),
                matrix: this.mtxLocal.serialize(),
                connections: this.#connections.map(_con => {
                    let connection = { cost: _con.cost, end: _con.end, speedModifier: _con.speedModifier };
                    if (connection.end instanceof ComponentWaypoint) {
                        connection.end = FudgeCore.Node.PATH_FROM_TO(this, connection.end);
                    }
                    return connection;
                })
            };
            return serialization;
        }
        async deserialize(_serialization) {
            this.mtxLocal.deserialize(_serialization.matrix);
            const hndNodeDeserialized = () => {
                this.#connections = _serialization.connections.map((_con) => {
                    let connection = { cost: _con.cost, end: this.serializedWaypointToWaypoint(_con.end), speedModifier: _con.speedModifier, start: this };
                    return connection;
                });
                this.removeEventListener("nodeDeserialized", hndNodeDeserialized);
            };
            this.addEventListener("nodeDeserialized", hndNodeDeserialized);
            await super.deserialize(_serialization[super.constructor.name]);
            return this;
        }
        drawGizmos() {
            let scaleVector = FudgeCore.Vector3.SCALE(FudgeCore.Vector3.ONE(), 0.1);
            let mtx = this.mtxWorld;
            FudgeCore.Gizmos.drawSphere(FudgeCore.Matrix4x4.CONSTRUCTION(mtx.translation, FudgeCore.Vector3.ZERO(), scaleVector), FudgeCore.Color.CSS("orange"));
            let lines = [];
            for (let connection of this.connections) {
                let tmpMtx = connection.end.mtxWorld.clone;
                let directionVector = FudgeCore.Vector3.DIFFERENCE(mtx.translation, tmpMtx.translation);
                if (directionVector.magnitudeSquared === 0)
                    continue;
                if (!connection.end.isActive || !connection.start.isActive)
                    continue;
                lines.push(mtx.translation);
                lines.push(tmpMtx.translation);
                let directionMtx = FudgeCore.Matrix4x4.LOOK_IN(tmpMtx.translation, directionVector);
                directionMtx.scale(scaleVector);
                FudgeCore.Gizmos.drawWireCone(directionMtx, FudgeCore.Color.CSS("orange"));
            }
            FudgeCore.Gizmos.drawLines(lines, FudgeCore.Matrix4x4.IDENTITY(), FudgeCore.Color.CSS("orange"));
        }
        serializedWaypointToWaypoint(_point) {
            if (typeof _point !== "string")
                return _point;
            return FudgeCore.Node.FIND(this, _point);
        }
        #handleAttach() {
            ComponentWaypoint.#waypoints.push(this);
        }
        #handleDetach() {
            let index = ComponentWaypoint.#waypoints.indexOf(this);
            if (index >= 0) {
                ComponentWaypoint.#waypoints.splice(index, 1);
            }
        }
    }
    FudgeCore.ComponentWaypoint = ComponentWaypoint;
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
        static { this.iSubclass = FudgeCore.Component.registerSubclass(ComponentRigidbody); }
        static {
            this.mapBodyType = (typeof OIMO == "undefined") ?
                {
                    [FudgeCore.BODY_TYPE.DYNAMIC]: FudgeCore.BODY_TYPE.DYNAMIC, [FudgeCore.BODY_TYPE.STATIC]: FudgeCore.BODY_TYPE.STATIC, [FudgeCore.BODY_TYPE.KINEMATIC]: FudgeCore.BODY_TYPE.KINEMATIC
                } : {
                [FudgeCore.BODY_TYPE.DYNAMIC]: OIMO.RigidBodyType.DYNAMIC, [FudgeCore.BODY_TYPE.STATIC]: OIMO.RigidBodyType.STATIC, [FudgeCore.BODY_TYPE.KINEMATIC]: OIMO.RigidBodyType.KINEMATIC
            };
        }
        #id;
        #collider;
        #colliderInfo;
        #collisionGroup;
        #typeCollider;
        #rigidbody;
        #rigidbodyInfo;
        #typeBody;
        #massData;
        #restitution;
        #friction;
        #dampingLinear;
        #dampingAngular;
        #effectRotation;
        #effectGravity;
        #isTrigger;
        #mtxPivotUnscaled;
        #mtxPivotInverse;
        #callbacks;
        constructor(_mass = 1, _type = FudgeCore.BODY_TYPE.DYNAMIC, _colliderType = FudgeCore.COLLIDER_TYPE.CUBE, _group = FudgeCore.Physics.settings.defaultCollisionGroup, _mtxTransform = null, _convexMesh = null) {
            super();
            this.mtxPivot = FudgeCore.Matrix4x4.IDENTITY();
            this.convexMesh = null;
            this.collisions = new Array();
            this.triggerings = new Array();
            this.initialization = BODY_INIT.TO_PIVOT;
            this.isInitialized = false;
            this.#id = 0;
            this.#collisionGroup = FudgeCore.COLLISION_GROUP.DEFAULT;
            this.#typeCollider = FudgeCore.COLLIDER_TYPE.CUBE;
            this.#rigidbodyInfo = new OIMO.RigidBodyConfig();
            this.#typeBody = FudgeCore.BODY_TYPE.DYNAMIC;
            this.#massData = new OIMO.MassData();
            this.#dampingLinear = 0.1;
            this.#dampingAngular = 0.1;
            this.#effectRotation = FudgeCore.Vector3.ONE();
            this.#effectGravity = 1;
            this.#isTrigger = false;
            this.#mtxPivotUnscaled = FudgeCore.Matrix4x4.IDENTITY();
            this.#mtxPivotInverse = FudgeCore.Matrix4x4.IDENTITY();
            this.hndEvent = (_event) => {
                switch (_event.type) {
                    case "componentAdd":
                        this.addEventListener("componentDeactivate", this.removeRigidbodyFromWorld);
                        this.node.addEventListener("nodeDeactivate", this.removeRigidbodyFromWorld, true);
                        if (!this.node.cmpTransform)
                            FudgeCore.Debug.warn("ComponentRigidbody attached to node missing ComponentTransform", this.node);
                        break;
                    case "componentRemove":
                        this.removeEventListener("componentRemove", this.removeRigidbodyFromWorld);
                        this.node.removeEventListener("nodeDeactivate", this.removeRigidbodyFromWorld, true);
                        this.removeRigidbodyFromWorld();
                        break;
                    case "nodeDeserialized":
                        if (!this.node.cmpTransform)
                            FudgeCore.Debug.error("ComponentRigidbody attached to node missing ComponentTransform", this.node);
                        break;
                }
            };
            this.addRigidbodyToWorld = () => {
                if (!this.#rigidbody._world)
                    FudgeCore.Physics.addRigidbody(this);
            };
            this.removeRigidbodyFromWorld = () => {
                FudgeCore.Physics.removeRigidbody(this);
                this.isInitialized = false;
            };
            this.create(_mass, _type, _colliderType, _group, _mtxTransform, _convexMesh);
            this.addEventListener("componentAdd", this.hndEvent);
            this.addEventListener("componentRemove", this.hndEvent);
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
            this.#rigidbody.setType(ComponentRigidbody.mapBodyType[this.#typeBody]);
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
            this.#rigidbody.rotateXyz(new OIMO.Vec3(_rotationChange.x * FudgeCore.Calc.deg2rad, _rotationChange.y * FudgeCore.Calc.deg2rad, _rotationChange.z * FudgeCore.Calc.deg2rad));
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
            let tmpQuat = FudgeCore.Recycler.get(FudgeCore.Quaternion);
            tmpQuat.set(orientation.x, orientation.y, orientation.z, orientation.w);
            let eulerAngles = tmpQuat.eulerAngles.clone;
            FudgeCore.Recycler.store(tmpQuat);
            return eulerAngles;
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
            let rotation = mtxWorld.rotation;
            let scaling = mtxWorld.scaling;
            this.setScaling(scaling);
            this.#rigidbody.setMassData(this.#massData);
            this.setPosition(position);
            this.setRotation(rotation);
            let scalingInverse = this.node.mtxWorld.scaling.map(_i => 1 / _i);
            this.#mtxPivotUnscaled = FudgeCore.Matrix4x4.CONSTRUCTION(this.mtxPivot.translation, this.mtxPivot.rotation, scalingInverse);
            this.#mtxPivotInverse = FudgeCore.Matrix4x4.INVERSION(this.#mtxPivotUnscaled);
            this.addRigidbodyToWorld();
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
        activateAutoSleep(_on) {
            this.#rigidbody.setAutoSleep(_on);
        }
        checkCollisionEvents() {
            if (!this.isInitialized)
                return;
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
                if (!objHit.isInitialized)
                    continue;
                if (objHit == null || list.getContact().isTouching() == false)
                    return;
                objHit2 = list.getContact().getShape2().userData;
                if (!objHit2.isInitialized)
                    continue;
                if (objHit2 == null || list.getContact().isTouching() == false)
                    return;
                let points = collisionManifold.getPoints();
                let normal = collisionManifold.getNormal();
                if (objHit.getOimoRigidbody() != this.getOimoRigidbody() && this.collisions.indexOf(objHit) == -1) {
                    let colPos = this.collisionCenterPoint(points, collisionManifold.getNumPoints());
                    colPoint = new FudgeCore.Vector3(colPos.x, colPos.y, colPos.z);
                    points.forEach((_value) => {
                        normalImpulse += _value.getNormalImpulse();
                        binormalImpulse += _value.getBinormalImpulse();
                        tangentImpulse += _value.getTangentImpulse();
                    });
                    this.collisions.push(objHit);
                    event = new FudgeCore.EventPhysics("ColliderEnteredCollision", objHit, normalImpulse, tangentImpulse, binormalImpulse, colPoint, new FudgeCore.Vector3(normal.x, normal.y, normal.z));
                    this.dispatchEvent(event);
                }
                if (objHit2 != this && this.collisions.indexOf(objHit2) == -1) {
                    let colPos = this.collisionCenterPoint(points, collisionManifold.getNumPoints());
                    colPoint = new FudgeCore.Vector3(colPos.x, colPos.y, colPos.z);
                    points.forEach((_value) => {
                        normalImpulse += _value.getNormalImpulse();
                        binormalImpulse += _value.getBinormalImpulse();
                        tangentImpulse += _value.getTangentImpulse();
                    });
                    this.collisions.push(objHit2);
                    event = new FudgeCore.EventPhysics("ColliderEnteredCollision", objHit2, normalImpulse, tangentImpulse, binormalImpulse, colPoint, new FudgeCore.Vector3(normal.x, normal.y, normal.z));
                    this.dispatchEvent(event);
                }
                list = list.getNext();
            }
            this.collisions.forEach((_value) => {
                let isColliding = false;
                list = this.#rigidbody.getContactLinkList();
                for (let i = 0; i < this.#rigidbody.getNumContactLinks(); i++) {
                    objHit = list.getContact().getShape1().userData;
                    objHit2 = list.getContact().getShape2().userData;
                    if (_value == objHit || _value == objHit2) {
                        isColliding = true;
                    }
                    list = list.getNext();
                }
                if (isColliding == false) {
                    let index = this.collisions.indexOf(_value);
                    this.collisions.splice(index);
                    event = new FudgeCore.EventPhysics("ColliderLeftCollision", _value, 0, 0, 0);
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
                FudgeCore.Physics.debugDraw.debugRay(hitInfo.rayOrigin, hitInfo.hitPoint, new FudgeCore.Color(0, 1, 0, 1));
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
            this.mass = ifNumber(_serialization.mass, this.mass);
            this.dampTranslation = ifNumber(_serialization.dampTranslation, this.dampTranslation);
            this.dampRotation = ifNumber(_serialization.dampRotation, this.dampRotation);
            this.collisionGroup = ifNumber(_serialization.collisionGroup, this.collisionGroup);
            this.effectRotation = _serialization.effectRotation || this.effectRotation;
            this.effectGravity = ifNumber(_serialization.effectGravity, this.effectGravity);
            this.friction = ifNumber(_serialization.friction, this.friction);
            this.restitution = ifNumber(_serialization.restitution, this.restitution);
            this.isTrigger = _serialization.isTrigger || this.isTrigger;
            this.initialization = _serialization.initialization;
            this.initialization = BODY_INIT[_serialization.initialization];
            this.typeBody = FudgeCore.BODY_TYPE[_serialization.typeBody];
            this.typeCollider = FudgeCore.COLLIDER_TYPE[_serialization.typeCollider];
            return this;
        }
        async mutate(_mutator, _selection = null, _dispatchMutate = true) {
            if (_mutator.typeBody != undefined)
                _mutator.typeBody = parseInt(_mutator.typeBody);
            if (_mutator.typeCollider != undefined)
                _mutator.typeCollider = parseInt(_mutator.typeCollider);
            if (_mutator.initialization != undefined)
                _mutator.initialization = parseInt(_mutator.initialization);
            await super.mutate(_mutator, _selection, _dispatchMutate);
            if (_mutator.initialization != undefined && this.isActive)
                this.initialize();
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
            this.#id = FudgeCore.Physics.distributeBodyID();
            this.#callbacks = new OIMO.ContactCallback();
            this.#callbacks.beginTriggerContact = this.triggerEnter;
            this.#callbacks.endTriggerContact = this.triggerExit;
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
        collisionCenterPoint(_colPoints, _numPoints) {
            let center;
            let totalPoints = 0;
            let totalX = 0;
            let totalY = 0;
            let totalZ = 0;
            _colPoints.forEach((_value) => {
                if (totalPoints < _numPoints) {
                    totalPoints++;
                    totalX += _value.getPosition2().x;
                    totalY += _value.getPosition2().y;
                    totalZ += _value.getPosition2().z;
                }
            });
            center = new OIMO.Vec3(totalX / _numPoints, totalY / _numPoints, totalZ / _numPoints);
            return center;
        }
        triggerEnter(_contact) {
            let objHit;
            let objHit2;
            let event;
            let colPoint;
            let collisionManifold = _contact.getManifold();
            objHit = _contact.getShape1().userData;
            if (objHit == null || _contact.isTouching() == false)
                return;
            objHit2 = _contact.getShape2().userData;
            if (objHit2 == null || _contact.isTouching() == false)
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
        triggerExit(_contact) {
            let objHit;
            let objHit2;
            let event;
            objHit = _contact.getShape1().userData;
            objHit2 = _contact.getShape2().userData;
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
        constructor(_renderingContext) {
            this.numVertices = 0;
            this.gl = _renderingContext;
            this.buffer = this.gl.createBuffer();
        }
        setData(_array) {
            if (this.attribs == null)
                throw "set attributes first";
            this.numVertices = _array.length / (this.stride / 4);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(_array), this.gl.DYNAMIC_DRAW);
        }
        setAttribs(_attribs) {
            this.attribs = _attribs;
            this.offsets = [];
            this.stride = 0;
            let n = _attribs.length;
            for (let i = 0; i < n; i++) {
                this.offsets.push(this.stride);
                this.stride += _attribs[i].float32Count * Float32Array.BYTES_PER_ELEMENT;
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
        constructor(_renderingContext) {
            this.gl = _renderingContext;
            this.buffer = this.gl.createBuffer();
        }
        setData(_array) {
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffer);
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Int16Array(_array), this.gl.DYNAMIC_DRAW);
            this.count = _array.length;
        }
        draw(_mode = this.gl.TRIANGLES, _count = -1) {
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffer);
            this.gl.drawElements(_mode, _count >= 0 ? _count : this.count, this.gl.UNSIGNED_SHORT, 0);
        }
    }
    FudgeCore.PhysicsDebugIndexBuffer = PhysicsDebugIndexBuffer;
    class PhysicsDebugVertexAttribute {
        constructor(_float32Count, _name) {
            this.name = _name;
            this.float32Count = _float32Count;
        }
    }
    FudgeCore.PhysicsDebugVertexAttribute = PhysicsDebugVertexAttribute;
    class PhysicsDebugShader {
        constructor(_renderingContext) {
            this.gl = _renderingContext;
            this.program = this.gl.createProgram();
            this.vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
            this.fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        }
        compile(_vertexSource, _fragmentSource) {
            this.uniformLocationMap = new Map();
            this.compileShader(this.vertexShader, _vertexSource);
            this.compileShader(this.fragmentShader, _fragmentSource);
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
            _attribs.forEach(_value => {
                indices.push(this.getAttribIndex(_value.name));
            });
            return indices;
        }
        use() {
            this.gl.useProgram(this.program);
        }
        compileShader(_shader, _source) {
            this.gl.shaderSource(_shader, _source);
            this.gl.compileShader(_shader);
            if (!this.gl.getShaderParameter(_shader, this.gl.COMPILE_STATUS)) {
                FudgeCore.Debug.log(this.gl.getShaderInfoLog(_shader));
            }
        }
    }
    FudgeCore.PhysicsDebugShader = PhysicsDebugShader;
    class PhysicsDebugDraw extends FudgeCore.RenderWebGL {
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
            let projection = FudgeCore.Physics.mainCam.mtxWorldToView.get();
            this.gl.uniformMatrix4fv(this.shader.getUniformLocation("u_mtxMeshToView"), false, projection);
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
                let debugWrapper = FudgeCore.Physics.debugDraw;
                if (FudgeCore.Physics.mainCam != null) {
                    let data = debugWrapper.pointData;
                    data.push(_v.x, _v.y, _v.z);
                    data.push(0, 0, 0);
                    data.push(_color.x, _color.y, _color.z);
                    debugWrapper.numPointData++;
                }
            };
            OIMO.DebugDraw.prototype.line = function (_v1, _v2, _color) {
                let debugWrapper = FudgeCore.Physics.debugDraw;
                if (FudgeCore.Physics.mainCam != null) {
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
                let debugWrapper = FudgeCore.Physics.debugDraw;
                if (FudgeCore.Physics.mainCam != null) {
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
			uniform mat4 u_mtxMeshToView;

			void main() {
				vPosition = aPosition;
				vColor = aColor;
				vNormal = aNormal;
				gl_Position = u_mtxMeshToView * vec4(aPosition,1.0);
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
    class JointCylindrical extends FudgeCore.JointAxial {
        static { this.iSubclass = FudgeCore.Joint.registerSubclass(JointCylindrical); }
        #springDampingRotation;
        #springFrequencyRotation;
        #motorForce;
        #maxRotor;
        #minRotor;
        #rotorTorque;
        #rotorSpeed;
        #rotor;
        #rotorSpringDamper;
        constructor(_bodyAnchor = null, _bodyTied = null, _axis = new FudgeCore.Vector3(0, 1, 0), _localAnchor = new FudgeCore.Vector3(0, 0, 0)) {
            super(_bodyAnchor, _bodyTied, _axis, _localAnchor);
            this.config = new OIMO.CylindricalJointConfig();
            this.#springDampingRotation = 0;
            this.#springFrequencyRotation = 0;
            this.#motorForce = 0;
            this.#maxRotor = 360;
            this.#minRotor = 0;
            this.#rotorTorque = 0;
            this.#rotorSpeed = 0;
            this.#getMutator = () => {
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
            this.#mutate = (_mutator) => {
                this.mutateBase(_mutator, ["motorForce", "rotorTorque", "rotorSpeed", "maxRotor", "minRotor", "springDampingRotation", "springFrequencyRotation", "springFrequency"]);
            };
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
                this.joint.getRotationalLimitMotor().upperLimit = _value * FudgeCore.Calc.deg2rad;
        }
        get minRotor() {
            return this.#minRotor;
        }
        set minRotor(_value) {
            this.#minRotor = _value;
            if (this.joint != null)
                this.joint.getRotationalLimitMotor().lowerLimit = _value * FudgeCore.Calc.deg2rad;
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
        async mutate(_mutator, _selection = null, _dispatchMutate = true) {
            this.#mutate(_mutator);
            this.deleteFromMutator(_mutator, this.#getMutator());
            await super.mutate(_mutator, _selection, _dispatchMutate);
        }
        getMutator() {
            let mutator = super.getMutator();
            Object.assign(mutator, this.#getMutator());
            return mutator;
        }
        constructJoint() {
            this.#rotorSpringDamper = new OIMO.SpringDamper().setSpring(this.springFrequencyRotation, this.springDampingRotation);
            this.motor = new OIMO.TranslationalLimitMotor().setLimits(super.minMotor, super.maxMotor);
            this.motor.setMotor(super.motorSpeed, this.motorForce);
            this.#rotor = new OIMO.RotationalLimitMotor().setLimits(this.minRotor * FudgeCore.Calc.deg2rad, this.maxRotor * FudgeCore.Calc.deg2rad);
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
        #getMutator;
        #mutate;
    }
    FudgeCore.JointCylindrical = JointCylindrical;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class JointPrismatic extends FudgeCore.JointAxial {
        static { this.iSubclass = FudgeCore.Joint.registerSubclass(JointPrismatic); }
        #motorForce;
        constructor(_bodyAnchor = null, _bodyTied = null, _axis = new FudgeCore.Vector3(0, 1, 0), _localAnchor = new FudgeCore.Vector3(0, 0, 0)) {
            super(_bodyAnchor, _bodyTied, _axis, _localAnchor);
            this.config = new OIMO.PrismaticJointConfig();
            this.#motorForce = 0;
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
        async mutate(_mutator, _selection = null, _dispatchMutate = true) {
            if (typeof (_mutator.motorForce) !== "undefined")
                this.motorForce = _mutator.motorForce;
            delete _mutator.motorForce;
            await super.mutate(_mutator, _selection, _dispatchMutate);
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
        static { this.iSubclass = FudgeCore.Joint.registerSubclass(JointRagdoll); }
        #springDampingTwist;
        #springFrequencyTwist;
        #springDampingSwing;
        #springFrequencySwing;
        #maxMotorTwist;
        #minMotorTwist;
        #motorTorqueTwist;
        #motorSpeedTwist;
        #motorTwist;
        #springDamperTwist;
        #springDamperSwing;
        #axisFirst;
        #axisSecond;
        #maxAngleFirst;
        #maxAngleSecond;
        constructor(_bodyAnchor = null, _bodyTied = null, _axisFirst = new FudgeCore.Vector3(1, 0, 0), _axisSecond = new FudgeCore.Vector3(0, 0, 1), _localAnchor = new FudgeCore.Vector3(0, 0, 0)) {
            super(_bodyAnchor, _bodyTied);
            this.config = new OIMO.RagdollJointConfig();
            this.#springDampingTwist = 0;
            this.#springFrequencyTwist = 0;
            this.#springDampingSwing = 0;
            this.#springFrequencySwing = 0;
            this.#maxMotorTwist = 360;
            this.#minMotorTwist = 0;
            this.#motorTorqueTwist = 0;
            this.#motorSpeedTwist = 0;
            this.#maxAngleFirst = 0;
            this.#maxAngleSecond = 0;
            this.#getMutator = () => {
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
            this.#mutate = (_mutator) => {
                if (typeof (_mutator.maxAngleFirst) !== "undefined")
                    this.#maxAngleFirst = _mutator.maxAngleFirst;
                if (typeof (_mutator.maxAngleSecond) !== "undefined")
                    this.#maxAngleSecond = _mutator.maxAngleSecond;
                this.mutateBase(_mutator, [
                    "springDampingTwist", "springFrequencyTwist", "springDampingSwing", "springFrequencySwing", "maxMotorTwist", "minMotorTwist", "motorSpeedTwist", "motorTorqueTwist"
                ]);
            };
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
            return this.#maxAngleFirst * FudgeCore.Calc.rad2deg;
        }
        set maxAngleFirstAxis(_value) {
            this.#maxAngleFirst = _value * FudgeCore.Calc.deg2rad;
            this.disconnect();
            this.dirtyStatus();
        }
        get maxAngleSecondAxis() {
            return this.#maxAngleSecond * FudgeCore.Calc.rad2deg;
        }
        set maxAngleSecondAxis(_value) {
            this.#maxAngleSecond = _value * FudgeCore.Calc.deg2rad;
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
            return this.#maxMotorTwist * FudgeCore.Calc.rad2deg;
        }
        set maxMotorTwist(_value) {
            _value *= FudgeCore.Calc.deg2rad;
            this.#maxMotorTwist = _value;
            if (this.joint != null)
                this.joint.getTwistLimitMotor().upperLimit = _value;
        }
        get minMotorTwist() {
            return this.#minMotorTwist * FudgeCore.Calc.rad2deg;
        }
        set minMotorTwist(_value) {
            _value *= FudgeCore.Calc.deg2rad;
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
        async mutate(_mutator, _selection = null, _dispatchMutate = true) {
            if (typeof (_mutator.axisFirst) !== "undefined")
                this.axisFirst = new FudgeCore.Vector3(...(Object.values(_mutator.axisFirst)));
            if (typeof (_mutator.axisSecond) !== "undefined")
                this.axisSecond = new FudgeCore.Vector3(...(Object.values(_mutator.axisSecond)));
            delete _mutator.axisFirst;
            delete _mutator.axisSecond;
            this.#mutate(_mutator);
            this.deleteFromMutator(_mutator, this.#getMutator());
            await super.mutate(_mutator, _selection, _dispatchMutate);
        }
        getMutator() {
            let mutator = super.getMutator();
            Object.assign(mutator, this.#getMutator());
            mutator.axisFirst = this.axisFirst.getMutator();
            mutator.axisSecond = this.axisSecond.getMutator();
            return mutator;
        }
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
        #getMutator;
        #mutate;
    }
    FudgeCore.JointRagdoll = JointRagdoll;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class JointRevolute extends FudgeCore.JointAxial {
        static { this.iSubclass = FudgeCore.Joint.registerSubclass(JointRevolute); }
        #motorTorque;
        #rotor;
        constructor(_bodyAnchor = null, _bodyTied = null, _axis = new FudgeCore.Vector3(0, 1, 0), _localAnchor = new FudgeCore.Vector3(0, 0, 0)) {
            super(_bodyAnchor, _bodyTied, _axis, _localAnchor);
            this.config = new OIMO.RevoluteJointConfig();
            this.#motorTorque = 0;
            this.maxMotor = 360;
            this.minMotor = 0;
        }
        set maxMotor(_value) {
            super.maxMotor = _value;
            _value *= FudgeCore.Calc.deg2rad;
            if (this.joint)
                this.joint.getLimitMotor().upperLimit = _value;
        }
        set minMotor(_value) {
            super.minMotor = _value;
            if (this.joint)
                this.joint.getLimitMotor().lowerLimit = _value * FudgeCore.Calc.deg2rad;
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
        async mutate(_mutator, _selection = null, _dispatchMutate = true) {
            if (typeof (_mutator.motorTorque) !== "undefined")
                this.motorTorque = _mutator.motorTorque;
            delete _mutator.motorTorque;
            await super.mutate(_mutator, _selection, _dispatchMutate);
        }
        constructJoint() {
            this.#rotor = new OIMO.RotationalLimitMotor().setLimits(super.minMotor * FudgeCore.Calc.deg2rad, super.maxMotor * FudgeCore.Calc.deg2rad);
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
        static { this.iSubclass = FudgeCore.Joint.registerSubclass(JointSpherical); }
        #springDamping;
        #springFrequency;
        #springDamper;
        constructor(_bodyAnchor = null, _bodyTied = null, _localAnchor = new FudgeCore.Vector3(0, 0, 0)) {
            super(_bodyAnchor, _bodyTied);
            this.config = new OIMO.SphericalJointConfig();
            this.#springDamping = 0;
            this.#springFrequency = 0;
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
        async mutate(_mutator, _selection = null, _dispatchMutate = true) {
            this.mutateBase(_mutator, ["springDamping", "springFrequency"]);
            delete _mutator.springDamping;
            delete _mutator.springFrequency;
            await super.mutate(_mutator, _selection, _dispatchMutate);
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
        static { this.iSubclass = FudgeCore.Joint.registerSubclass(JointUniversal); }
        #springDampingFirst;
        #springFrequencyFirst;
        #springDampingSecond;
        #springFrequencySecond;
        #maxRotorFirst;
        #minRotorFirst;
        #rotorTorqueFirst;
        #rotorSpeedFirst;
        #maxRotorSecond;
        #minRotorSecond;
        #rotorTorqueSecond;
        #rotorSpeedSecond;
        #motorFirst;
        #motorSecond;
        #axisSpringDamperFirst;
        #axisSpringDamperSecond;
        #axisFirst;
        #axisSecond;
        constructor(_bodyAnchor = null, _bodyTied = null, _axisFirst = new FudgeCore.Vector3(1, 0, 0), _axisSecond = new FudgeCore.Vector3(0, 0, 1), _localAnchor = new FudgeCore.Vector3(0, 0, 0)) {
            super(_bodyAnchor, _bodyTied);
            this.config = new OIMO.UniversalJointConfig();
            this.#springDampingFirst = 0;
            this.#springFrequencyFirst = 0;
            this.#springDampingSecond = 0;
            this.#springFrequencySecond = 0;
            this.#maxRotorFirst = 360;
            this.#minRotorFirst = 0;
            this.#rotorTorqueFirst = 0;
            this.#rotorSpeedFirst = 0;
            this.#maxRotorSecond = 360;
            this.#minRotorSecond = 0;
            this.#rotorTorqueSecond = 0;
            this.#rotorSpeedSecond = 0;
            this.#getMutator = () => {
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
            this.#mutate = (_mutator) => {
                this.mutateBase(_mutator, [
                    "springDampingFirst", "springFrequencyFirst", "springDampingSecond", "springFrequencySecond",
                    "maxRotorFirst", "minRotorFirst", "rotorSpeedFirst", "rotorTorqueFirst",
                    "maxRotorSecond", "minRotorSecond", "rotorSpeedSecond", ".rotorTorqueSecond"
                ]);
            };
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
                this.joint.getLimitMotor1().upperLimit = _value * FudgeCore.Calc.deg2rad;
        }
        get minRotorFirst() {
            return this.#minRotorFirst;
        }
        set minRotorFirst(_value) {
            this.#minRotorFirst = _value;
            if (this.joint != null)
                this.joint.getLimitMotor1().lowerLimit = _value * FudgeCore.Calc.deg2rad;
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
                this.joint.getLimitMotor2().upperLimit = _value * FudgeCore.Calc.deg2rad;
        }
        get minRotorSecond() {
            return this.#minRotorSecond;
        }
        set minRotorSecond(_value) {
            this.#minRotorSecond = _value;
            if (this.joint != null)
                this.joint.getLimitMotor2().lowerLimit = _value * FudgeCore.Calc.deg2rad;
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
        async mutate(_mutator, _selection = null, _dispatchMutate = true) {
            if (typeof (_mutator.axisFirst) !== "undefined")
                this.axisFirst = new FudgeCore.Vector3(...(Object.values(_mutator.axisFirst)));
            if (typeof (_mutator.axisSecond) !== "undefined")
                this.axisSecond = new FudgeCore.Vector3(...(Object.values(_mutator.axisSecond)));
            delete _mutator.axisFirst;
            delete _mutator.axisSecond;
            this.#mutate(_mutator);
            this.deleteFromMutator(_mutator, this.#getMutator());
            await super.mutate(_mutator, _selection, _dispatchMutate);
        }
        getMutator() {
            let mutator = super.getMutator();
            Object.assign(mutator, this.#getMutator());
            mutator.axisFirst = this.axisFirst.getMutator();
            mutator.axisSecond = this.axisSecond.getMutator();
            return mutator;
        }
        constructJoint() {
            this.#axisSpringDamperFirst = new OIMO.SpringDamper().setSpring(this.#springFrequencyFirst, this.#springDampingFirst);
            this.#axisSpringDamperSecond = new OIMO.SpringDamper().setSpring(this.#springFrequencySecond, this.#springDampingSecond);
            this.#motorFirst = new OIMO.RotationalLimitMotor().setLimits(this.#minRotorFirst * FudgeCore.Calc.deg2rad, this.#maxRotorFirst * FudgeCore.Calc.deg2rad);
            this.#motorFirst.setMotor(this.#rotorSpeedFirst, this.#rotorTorqueFirst);
            this.#motorSecond = new OIMO.RotationalLimitMotor().setLimits(this.#minRotorFirst * FudgeCore.Calc.deg2rad, this.#maxRotorFirst * FudgeCore.Calc.deg2rad);
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
        #getMutator;
        #mutate;
    }
    FudgeCore.JointUniversal = JointUniversal;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class JointWelding extends FudgeCore.Joint {
        static { this.iSubclass = FudgeCore.Joint.registerSubclass(JointWelding); }
        constructor(_bodyAnchor = null, _bodyTied = null, _localAnchor = new FudgeCore.Vector3(0, 0, 0)) {
            super(_bodyAnchor, _bodyTied);
            this.config = new OIMO.GenericJointConfig();
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
        static { this.settings = new FudgeCore.PhysicsSettings(FudgeCore.COLLISION_GROUP.DEFAULT, (FudgeCore.COLLISION_GROUP.DEFAULT | FudgeCore.COLLISION_GROUP.GROUP_1 | FudgeCore.COLLISION_GROUP.GROUP_2 | FudgeCore.COLLISION_GROUP.GROUP_3 | FudgeCore.COLLISION_GROUP.GROUP_4)); }
        static { this.ƒactive = new Physics(); }
        #debugDraw;
        #mainCam;
        constructor() {
            this.bodyList = new Array();
            this.jointList = new Array();
            if (typeof OIMO == "undefined") {
                FudgeCore.Debug.error("OIMO physics engine not connected!");
                return null;
            }
            this.oimoWorld = new OIMO.World();
            this.#debugDraw = new FudgeCore.PhysicsDebugDraw();
            this.oimoWorld.setDebugDraw(this.#debugDraw.oimoDebugDraw);
        }
        static set activeInstance(_physics) {
            Physics.ƒactive = _physics;
        }
        static get activeInstance() {
            return Physics.ƒactive;
        }
        static get debugDraw() {
            return Physics.ƒactive.#debugDraw;
        }
        static get mainCam() {
            return Physics.ƒactive.#mainCam;
        }
        static raycast(_origin, _direction, _length = 1, _debugDraw = false, _group = FudgeCore.COLLISION_GROUP.DEFAULT) {
            let hitInfo = new FudgeCore.RayHitInfo();
            let ray = new OIMO.RayCastClosest();
            let begin = new OIMO.Vec3(_origin.x, _origin.y, _origin.z);
            let end = this.getRayEndPoint(begin, new FudgeCore.Vector3(_direction.x, _direction.y, _direction.z), _length);
            ray.clear();
            if (_group == FudgeCore.COLLISION_GROUP.DEFAULT) {
                Physics.ƒactive.oimoWorld.rayCast(begin, end, ray);
            }
            else {
                let allHits = new Array();
                Physics.ƒactive.bodyList.forEach(function (_value) {
                    if (_value.collisionGroup == _group) {
                        hitInfo = _value.raycastThisBody(_origin, _direction, _length);
                        if (hitInfo.hit == true) {
                            allHits.push(hitInfo);
                        }
                    }
                });
                allHits.forEach(function (_value) {
                    if (_value.hitDistance < hitInfo.hitDistance || hitInfo.hit == false) {
                        hitInfo = _value;
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
                Physics.ƒactive.#debugDraw.debugRay(hitInfo.rayOrigin, hitInfo.hitPoint, new FudgeCore.Color(0, 1, 0, 1));
            }
            return hitInfo;
        }
        static simulate(_deltaTime = 1 / 60) {
            if (Physics.ƒactive.jointList.length > 0)
                Physics.connectJoints();
            if (FudgeCore.Time.game.getScale() != 0) {
                _deltaTime = _deltaTime > 1 / 30 ? 1 / 30 : _deltaTime;
                Physics.ƒactive.oimoWorld.step(_deltaTime * FudgeCore.Time.game.getScale());
            }
        }
        static draw(_cmpCamera, _mode) {
            Physics.ƒactive.#debugDraw.setDebugMode(_mode);
            Physics.ƒactive.#mainCam = _cmpCamera;
            Physics.ƒactive.oimoWorld.debugDraw();
            Physics.ƒactive.#debugDraw.drawBuffers();
            Physics.ƒactive.#debugDraw.clearBuffers();
        }
        static adjustTransforms(_branch, _toMesh = false) {
            FudgeCore.Render.prepare(_branch, { ignorePhysics: true });
            for (let node of FudgeCore.Render.nodesPhysics)
                node.getComponent(FudgeCore.ComponentRigidbody).initialize();
        }
        static getGravity() {
            let tmpVec = Physics.ƒactive.oimoWorld.getGravity();
            return new FudgeCore.Vector3(tmpVec.x, tmpVec.y, tmpVec.z);
        }
        static setGravity(_value) {
            let tmpVec = new OIMO.Vec3(_value.x, _value.y, _value.z);
            Physics.ƒactive.oimoWorld.setGravity(tmpVec);
        }
        static addRigidbody(_cmpRB) {
            Physics.ƒactive.bodyList.push(_cmpRB);
            Physics.ƒactive.oimoWorld.addRigidBody(_cmpRB.getOimoRigidbody());
        }
        static removeRigidbody(_cmpRB) {
            let oimoRigidBody = _cmpRB.getOimoRigidbody();
            if (oimoRigidBody._world)
                oimoRigidBody._world.removeRigidBody(oimoRigidBody);
            let id = Physics.ƒactive.bodyList.indexOf(_cmpRB);
            Physics.ƒactive.bodyList.splice(id, 1);
        }
        static addJoint(_cmpJoint) {
            Physics.ƒactive.oimoWorld.addJoint(_cmpJoint.getOimoJoint());
        }
        static changeJointStatus(_cmpJoint) {
            if (Physics.ƒactive.jointList.indexOf(_cmpJoint) < 0)
                Physics.ƒactive.jointList.push(_cmpJoint);
        }
        static removeJoint(_cmpJoint) {
            try {
                Physics.ƒactive.oimoWorld.removeJoint(_cmpJoint.getOimoJoint());
            }
            catch (_error) {
                FudgeCore.Debug.fudge(_error);
            }
        }
        static getBodyList() {
            return Physics.ƒactive.bodyList;
        }
        static distributeBodyID() {
            let freeId = 0;
            let free = false;
            Physics.ƒactive.bodyList.forEach((_value) => {
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
        static connectJoints() {
            let jointsToConnect = Physics.ƒactive.jointList;
            Physics.ƒactive.jointList = [];
            jointsToConnect.forEach((_joint) => {
                if (_joint.isConnected() == false)
                    if (_joint.isActive)
                        _joint.connect();
                    else
                        Physics.ƒactive.jointList.push(_joint);
            });
        }
        static cleanup() {
            let oimoWorld = Physics.ƒactive.oimoWorld;
            if (oimoWorld != null) {
                let jointsWorld = oimoWorld.getNumJoints();
                let bodiesWorld = oimoWorld.getNumRigidBodies();
                for (let body of Physics.ƒactive.bodyList)
                    body.isInitialized = false;
                Physics.ƒactive.jointList = new Array();
                for (let i = 0; i < jointsWorld; i++) {
                    let oimoJoint = Physics.ƒactive.oimoWorld.getJointList();
                    oimoWorld.removeJoint(oimoJoint);
                }
                for (let i = 0; i < bodiesWorld; i++) {
                    let oimoBody = oimoWorld.getRigidBodyList();
                    oimoWorld.removeRigidBody(oimoBody);
                }
            }
        }
        static getRayEndPoint(_start, _direction, _length) {
            let origin = FudgeCore.Recycler.get(FudgeCore.Vector3);
            origin.set(_start.x, _start.y, _start.z);
            let scaledDirection = _direction.clone;
            scaledDirection.scale(_length);
            let endpoint = FudgeCore.Vector3.SUM(scaledDirection, origin);
            FudgeCore.Recycler.store(scaledDirection);
            FudgeCore.Recycler.store(endpoint);
            FudgeCore.Recycler.store(origin);
            return new OIMO.Vec3(endpoint.x, endpoint.y, endpoint.z);
        }
        static getRayDistance(_origin, _hitPoint) {
            let dx = _origin.x - _hitPoint.x;
            let dy = _origin.y - _hitPoint.y;
            let dz = _origin.z - _hitPoint.z;
            return Math.sqrt(dx * dx + dy * dy + dz * dz);
        }
        getOimoWorld() {
            return Physics.ƒactive.oimoWorld;
        }
    }
    FudgeCore.Physics = Physics;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Box {
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
            let result;
            for (let face of cmpMesh.mesh.faces) {
                if (face.isInside(this.posMesh)) {
                    result = face.normal.clone;
                    break;
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
        static pickRay(_nodes, _ray, _min, _max, _pickGizmos = false) {
            let cmpCameraPick = new FudgeCore.ComponentCamera();
            cmpCameraPick.mtxPivot.translation = _ray.origin;
            cmpCameraPick.mtxPivot.lookAt(FudgeCore.Vector3.SUM(_ray.origin, _ray.direction));
            cmpCameraPick.projectCentral(1, 0.001, FudgeCore.FIELD_OF_VIEW.DIAGONAL, _min, _max);
            let picks = FudgeCore.Render.pickBranch(_nodes, cmpCameraPick, _pickGizmos);
            return picks;
        }
        static pickCamera(_nodes, _cmpCamera, _posProjection, _pickGizmos = false) {
            let ray = new FudgeCore.Ray(new FudgeCore.Vector3(-_posProjection.x, _posProjection.y, 1));
            let length = ray.direction.magnitude;
            if (_cmpCamera.node) {
                let mtxCamera = FudgeCore.Matrix4x4.MULTIPLICATION(_cmpCamera.node.mtxWorld, _cmpCamera.mtxPivot);
                ray.transform(mtxCamera);
                FudgeCore.Recycler.store(mtxCamera);
            }
            else
                ray.transform(_cmpCamera.mtxPivot);
            let picks = Picker.pickRay(_nodes, ray, length * _cmpCamera.getNear(), length * _cmpCamera.getFar(), _pickGizmos);
            return picks;
        }
        static pickViewport(_viewport, _posClient) {
            let posProjection = _viewport.pointClientToProjection(_posClient);
            let nodes = Array.from(_viewport.getBranch().getIterator(true));
            let picks = Picker.pickCamera(nodes, _viewport.camera, posProjection, _viewport.renderingGizmos);
            return picks;
        }
    }
    FudgeCore.Picker = Picker;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Ray {
        constructor(_direction = FudgeCore.Vector3.Z(1), _origin = FudgeCore.Vector3.ZERO(), _length = 1) {
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
        intersectFacePlane(_face) {
            return this.intersectPlane(_face.getPosition(0), _face.normal);
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
            this.origin.transform(_mtxTransform);
            this.direction.transform(_mtxTransform, false);
        }
        toString() {
            return `origin: ${this.origin.toString()}, direction: ${this.direction.toString()}, length: ${this.length.toPrecision(5)}`;
        }
    }
    FudgeCore.Ray = Ray;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Gizmos {
        static {
            this.filter = new Map(FudgeCore.Component.subclasses
                .filter((_class) => _class.prototype.drawGizmos || _class.prototype.drawGizmosSelected)
                .map((_class) => [_class.name, true]));
        }
        static { this.alphaOccluded = 0.3; }
        static { this.posIcons = new Set(); }
        static { this.arrayBuffer = FudgeCore.RenderWebGL.assert(FudgeCore.RenderWebGL.getRenderingContext().createBuffer()); }
        static { this.indexBuffer = FudgeCore.RenderWebGL.assert(FudgeCore.RenderWebGL.getRenderingContext().createBuffer()); }
        static #camera;
        static get camera() {
            return Gizmos.#camera;
        }
        static get quad() {
            let quad = new FudgeCore.MeshQuad("GizmoQuad");
            FudgeCore.Project.deregister(quad);
            Reflect.defineProperty(Gizmos, "quad", { value: quad });
            return Gizmos.quad;
        }
        static get cube() {
            let cube = new FudgeCore.MeshCube("GizmoCube");
            FudgeCore.Project.deregister(cube);
            Reflect.defineProperty(Gizmos, "cube", { value: cube });
            return Gizmos.cube;
        }
        static get sphere() {
            let sphere = new FudgeCore.MeshSphere("GizmoSphere", 6, 6);
            FudgeCore.Project.deregister(sphere);
            Reflect.defineProperty(Gizmos, "sphere", { value: sphere });
            return Gizmos.sphere;
        }
        static get wireCircle() {
            const radius = 0.5;
            const segments = 45;
            const circle = new Array(segments).fill(null).map(() => FudgeCore.Recycler.get(FudgeCore.Vector3));
            for (let i = 0; i < segments; i++) {
                const angle = (i / segments) * 2 * Math.PI;
                const x = radius * Math.cos(angle);
                const y = radius * Math.sin(angle);
                circle[i].set(x, y, 0);
            }
            const lines = [];
            for (let i = 0; i < segments; i++)
                lines.push(circle[i], circle[(i + 1) % segments]);
            Reflect.defineProperty(Gizmos, "wireCircle", { value: lines });
            return Gizmos.wireCircle;
        }
        static get wireSphere() {
            let lines = Gizmos.wireCircle.concat();
            let mtxRotation = FudgeCore.Matrix4x4.ROTATION_X(90);
            lines.push(...Gizmos.wireCircle.map((_point) => FudgeCore.Vector3.TRANSFORMATION(_point, mtxRotation)));
            mtxRotation.rotateY(90);
            lines.push(...Gizmos.wireCircle.map((_point) => FudgeCore.Vector3.TRANSFORMATION(_point, mtxRotation)));
            Reflect.defineProperty(Gizmos, "wireSphere", { value: lines });
            return Gizmos.wireSphere;
        }
        static get wireCone() {
            const radius = 0.5;
            const height = 1;
            const apex = FudgeCore.Vector3.ZERO();
            const quad = [
                new FudgeCore.Vector3(radius, 0, height),
                new FudgeCore.Vector3(-radius, 0, height),
                new FudgeCore.Vector3(0, radius, height),
                new FudgeCore.Vector3(0, -radius, height)
            ];
            let lines = Gizmos.wireCircle.map((_point) => FudgeCore.Vector3.TRANSFORMATION(_point, FudgeCore.Matrix4x4.TRANSLATION(FudgeCore.Vector3.Z(1))));
            lines.push(...[apex, quad[0], apex, quad[1], apex, quad[2], apex, quad[3]]);
            Reflect.defineProperty(Gizmos, "wireCone", { value: lines });
            return Gizmos.wireCone;
        }
        static get wireCube() {
            const halfSize = 0.5;
            const cube = [
                new FudgeCore.Vector3(halfSize, halfSize, halfSize), new FudgeCore.Vector3(-halfSize, halfSize, halfSize),
                new FudgeCore.Vector3(-halfSize, -halfSize, halfSize), new FudgeCore.Vector3(halfSize, -halfSize, halfSize),
                new FudgeCore.Vector3(halfSize, halfSize, -halfSize), new FudgeCore.Vector3(-halfSize, halfSize, -halfSize),
                new FudgeCore.Vector3(-halfSize, -halfSize, -halfSize), new FudgeCore.Vector3(halfSize, -halfSize, -halfSize)
            ];
            const lines = [
                cube[0], cube[1], cube[1], cube[2], cube[2], cube[3], cube[3], cube[0],
                cube[4], cube[5], cube[5], cube[6], cube[6], cube[7], cube[7], cube[4],
                cube[0], cube[4], cube[1], cube[5], cube[2], cube[6], cube[3], cube[7]
            ];
            Reflect.defineProperty(Gizmos, "wireCube", { value: lines });
            return Gizmos.wireCube;
        }
        static get picking() {
            return this.pickId != null;
        }
        static draw(_cmpCamera) {
            Gizmos.#camera = _cmpCamera;
            Gizmos.posIcons.clear();
            for (const gizmo of FudgeCore.Render.gizmos)
                Reflect.set(gizmo.node, "zCamera", _cmpCamera.pointWorldToClip(gizmo.node.mtxWorld.translation).z);
            const sorted = FudgeCore.Render.gizmos.getSorted((_a, _b) => Reflect.get(_b.node, "zCamera") - Reflect.get(_a.node, "zCamera"));
            for (const gizmo of sorted) {
                gizmo.drawGizmos?.();
                if (gizmo.node == Gizmos.selected)
                    gizmo.drawGizmosSelected?.();
            }
        }
        static pick(_gizmos, _cmpCamera, _picked) {
            Gizmos.#camera = _cmpCamera;
            Gizmos.posIcons.clear();
            for (let gizmo of _gizmos) {
                Gizmos.pickId = _picked.length;
                gizmo.drawGizmos();
                let pick = new FudgeCore.Pick(gizmo.node);
                pick.gizmo = gizmo;
                _picked.push(pick);
            }
            Gizmos.pickId = null;
        }
        static drawWireFrustum(_aspect, _fov, _near, _far, _direction, _mtxWorld, _color, _alphaOccluded = Gizmos.alphaOccluded) {
            const f = Math.tan(FudgeCore.Calc.deg2rad * _fov / 2);
            let scaleX = f;
            let scaleY = f;
            switch (_direction) {
                case FudgeCore.FIELD_OF_VIEW.HORIZONTAL:
                    scaleY = f / _aspect;
                    break;
                case FudgeCore.FIELD_OF_VIEW.VERTICAL:
                    scaleX = f * _aspect;
                    break;
                case FudgeCore.FIELD_OF_VIEW.DIAGONAL:
                    const diagonalAspect = Math.sqrt(_aspect);
                    scaleX = f * diagonalAspect;
                    scaleY = f / diagonalAspect;
                    break;
            }
            const nearX = _near * scaleX;
            const nearY = _near * scaleY;
            const farX = _far * scaleX;
            const farY = _far * scaleY;
            const frustum = new Array(8).fill(null).map(() => FudgeCore.Recycler.get(FudgeCore.Vector3));
            frustum[0].set(-nearX, nearY, _near);
            frustum[1].set(nearX, nearY, _near);
            frustum[2].set(nearX, -nearY, _near);
            frustum[3].set(-nearX, -nearY, _near);
            frustum[4].set(-farX, farY, _far);
            frustum[5].set(farX, farY, _far);
            frustum[6].set(farX, -farY, _far);
            frustum[7].set(-farX, -farY, _far);
            Gizmos.drawLines([
                frustum[0], frustum[1], frustum[1], frustum[2], frustum[2], frustum[3], frustum[3], frustum[0],
                frustum[4], frustum[5], frustum[5], frustum[6], frustum[6], frustum[7], frustum[7], frustum[4],
                frustum[0], frustum[4], frustum[1], frustum[5], frustum[2], frustum[6], frustum[3], frustum[7]
            ], _mtxWorld, _color, _alphaOccluded);
            FudgeCore.Recycler.storeMultiple(...frustum);
        }
        static drawWireCube(_mtxWorld, _color, _alphaOccluded = Gizmos.alphaOccluded) {
            Gizmos.drawLines(Gizmos.wireCube, _mtxWorld, _color, _alphaOccluded);
        }
        static drawWireSphere(_mtxWorld, _color, _alphaOccluded = Gizmos.alphaOccluded) {
            let mtxWorld = _mtxWorld.clone;
            Gizmos.drawLines(Gizmos.wireSphere, mtxWorld, _color, _alphaOccluded);
            mtxWorld.lookAt(Gizmos.camera.mtxWorld.translation);
            Gizmos.drawWireCircle(mtxWorld, _color, _alphaOccluded);
            FudgeCore.Recycler.store(mtxWorld);
        }
        static drawWireCone(_mtxWorld, _color, _alphaOccluded = Gizmos.alphaOccluded) {
            Gizmos.drawLines(Gizmos.wireCone, _mtxWorld, _color, _alphaOccluded);
        }
        static drawWireCircle(_mtxWorld, _color, _alphaOccluded = Gizmos.alphaOccluded) {
            Gizmos.drawLines(Gizmos.wireCircle, _mtxWorld, _color, _alphaOccluded);
        }
        static drawLines(_vertices, _mtxWorld, _color, _alphaOccluded = Gizmos.alphaOccluded) {
            const crc3 = FudgeCore.RenderWebGL.getRenderingContext();
            const shader = FudgeCore.ShaderGizmo;
            shader.useProgram();
            const lineData = new Float32Array(_vertices.length * 3);
            for (let i = 0; i < _vertices.length; i++) {
                const point = _vertices[i];
                lineData.set(point.get(), i * 3);
            }
            Gizmos.bufferPositions(shader, Gizmos.arrayBuffer);
            Gizmos.bufferMatrix(shader, _mtxWorld);
            crc3.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, lineData, WebGL2RenderingContext.DYNAMIC_DRAW);
            Gizmos.drawGizmos(shader, Gizmos.drawArrays, _vertices.length, _color, _alphaOccluded);
        }
        static drawWireMesh(_mesh, _mtxWorld, _color, _alphaOccluded = Gizmos.alphaOccluded) {
            const crc3 = FudgeCore.RenderWebGL.getRenderingContext();
            const shader = FudgeCore.ShaderGizmo;
            shader.useProgram();
            const indices = [];
            const renderBuffers = _mesh.getRenderBuffers();
            const renderMesh = _mesh.renderMesh;
            for (let i = 0; i < renderMesh.indices.length; i += 3) {
                const a = renderMesh.indices[i];
                const b = renderMesh.indices[i + 1];
                const c = renderMesh.indices[i + 2];
                indices.push(a, b, b, c, c, a);
            }
            crc3.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, Gizmos.indexBuffer);
            crc3.bufferData(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), WebGL2RenderingContext.DYNAMIC_DRAW);
            Gizmos.bufferPositions(shader, renderBuffers.vertices);
            Gizmos.bufferMatrix(shader, _mtxWorld);
            Gizmos.drawGizmos(shader, Gizmos.drawElementsLines, indices.length, _color, _alphaOccluded);
        }
        static drawCube(_mtxWorld, _color, _alphaOccluded = Gizmos.alphaOccluded) {
            Gizmos.drawMesh(Gizmos.cube, _mtxWorld, _color, _alphaOccluded);
        }
        static drawSphere(_mtxWorld, _color, _alphaOccluded = Gizmos.alphaOccluded) {
            Gizmos.drawMesh(Gizmos.sphere, _mtxWorld, _color, _alphaOccluded);
        }
        static drawMesh(_mesh, _mtxWorld, _color, _alphaOccluded = Gizmos.alphaOccluded) {
            const shader = Gizmos.picking ? FudgeCore.ShaderPick : FudgeCore.ShaderGizmo;
            shader.useProgram();
            let renderBuffers = _mesh.useRenderBuffers(shader, _mtxWorld, FudgeCore.Matrix4x4.MULTIPLICATION(Gizmos.camera.mtxWorldToView, _mtxWorld), Gizmos.pickId);
            Gizmos.drawGizmos(shader, Gizmos.drawElementsTrianlges, renderBuffers.nIndices, _color, _alphaOccluded);
        }
        static drawIcon(_texture, _mtxWorld, _color, _alphaOccluded = Gizmos.alphaOccluded) {
            let position = _mtxWorld.translation.toString();
            if (Gizmos.posIcons.has(position))
                return;
            Gizmos.posIcons.add(position);
            const crc3 = FudgeCore.RenderWebGL.getRenderingContext();
            const shader = Gizmos.picking ? FudgeCore.ShaderPickTextured : FudgeCore.ShaderGizmoTextured;
            shader.useProgram();
            let mtxWorld = _mtxWorld.clone;
            let color = _color.clone;
            let back = Gizmos.camera.mtxWorld.forward.negate();
            let up = Gizmos.camera.mtxWorld.up;
            mtxWorld.lookIn(back, up);
            let distance = FudgeCore.Vector3.DIFFERENCE(Gizmos.camera.mtxWorld.translation, mtxWorld.translation).magnitude;
            let fadeFar = 4;
            let fadeNear = 1.5;
            if (distance > 0 && distance < fadeFar) {
                distance = (distance - fadeNear) / (fadeFar - fadeNear);
                color.a = FudgeCore.Calc.lerp(0, color.a, distance);
            }
            let renderBuffers = Gizmos.quad.useRenderBuffers(shader, mtxWorld, FudgeCore.Matrix4x4.MULTIPLICATION(Gizmos.camera.mtxWorldToView, mtxWorld), Gizmos.pickId);
            _texture.useRenderData(FudgeCore.TEXTURE_LOCATION.COLOR.UNIT);
            crc3.uniform1i(shader.uniforms[FudgeCore.TEXTURE_LOCATION.COLOR.UNIFORM], FudgeCore.TEXTURE_LOCATION.COLOR.INDEX);
            Gizmos.drawGizmos(shader, Gizmos.drawElementsTrianlges, renderBuffers.nIndices, color, _alphaOccluded);
            FudgeCore.Recycler.storeMultiple(mtxWorld, color, back, up);
        }
        static bufferPositions(_shader, _buffer) {
            const crc3 = FudgeCore.RenderWebGL.getRenderingContext();
            crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, _buffer);
            let attribute = _shader.attributes["a_vctPosition"];
            crc3.enableVertexAttribArray(attribute);
            crc3.vertexAttribPointer(attribute, 3, WebGL2RenderingContext.FLOAT, false, 0, 0);
        }
        static bufferColor(_shader, _color) {
            FudgeCore.RenderWebGL.getRenderingContext().uniform4fv(_shader.uniforms["u_vctColor"], _color.getArray());
        }
        static bufferMatrix(_shader, _mtxWorld) {
            const mtxMeshToView = FudgeCore.Matrix4x4.MULTIPLICATION(Gizmos.camera.mtxWorldToView, _mtxWorld);
            FudgeCore.RenderWebGL.getRenderingContext().uniformMatrix4fv(_shader.uniforms["u_mtxMeshToView"], false, mtxMeshToView.get());
            FudgeCore.Recycler.store(mtxMeshToView);
        }
        static drawGizmos(_shader, _draw, _count, _color, _alphaOccluded = Gizmos.alphaOccluded) {
            const crc3 = FudgeCore.RenderWebGL.getRenderingContext();
            let color = _color.clone;
            Gizmos.bufferColor(_shader, color);
            crc3.clear(WebGL2RenderingContext.STENCIL_BUFFER_BIT);
            crc3.stencilFunc(WebGL2RenderingContext.ALWAYS, 1, 0xFF);
            crc3.stencilOp(WebGL2RenderingContext.KEEP, WebGL2RenderingContext.KEEP, WebGL2RenderingContext.REPLACE);
            crc3.enable(WebGL2RenderingContext.STENCIL_TEST);
            _draw(_count);
            color.a *= _alphaOccluded;
            Gizmos.bufferColor(_shader, color);
            crc3.stencilFunc(WebGL2RenderingContext.EQUAL, 0, 0xFF);
            crc3.stencilOp(WebGL2RenderingContext.KEEP, WebGL2RenderingContext.KEEP, WebGL2RenderingContext.KEEP);
            FudgeCore.Render.setDepthTest(false);
            _draw(_count);
            FudgeCore.Render.setDepthTest(true);
            crc3.disable(WebGL2RenderingContext.STENCIL_TEST);
            FudgeCore.Recycler.store(color);
        }
        static drawElementsTrianlges(_count) {
            FudgeCore.RenderWebGL.getRenderingContext().drawElements(WebGL2RenderingContext.TRIANGLES, _count, WebGL2RenderingContext.UNSIGNED_SHORT, 0);
        }
        static drawElementsLines(_count) {
            FudgeCore.RenderWebGL.getRenderingContext().drawElements(WebGL2RenderingContext.LINES, _count, WebGL2RenderingContext.UNSIGNED_SHORT, 0);
        }
        static drawArrays(_count) {
            FudgeCore.RenderWebGL.getRenderingContext().drawArrays(WebGL2RenderingContext.LINES, 0, _count);
        }
    }
    FudgeCore.Gizmos = Gizmos;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Render extends FudgeCore.RenderWebGL {
        static { this.rectClip = new FudgeCore.Rectangle(-1, 1, 2, -2); }
        static { this.nodesPhysics = new FudgeCore.RecycableArray(); }
        static { this.componentsPick = new FudgeCore.RecycableArray(); }
        static { this.lights = new Map(); }
        static { this.gizmos = new FudgeCore.RecycableArray(); }
        static { this.nodesSimple = new FudgeCore.RecycableArray(); }
        static { this.nodesAlpha = new FudgeCore.RecycableArray(); }
        static { this.componentsSkeleton = new FudgeCore.RecycableArray(); }
        static prepare(_branch, _options = {}, _mtxWorld = FudgeCore.Matrix4x4.IDENTITY(), _shadersUsed = null) {
            let firstLevel = (_shadersUsed == null);
            if (firstLevel) {
                _shadersUsed = [];
                Render.timestampUpdate = performance.now();
                Render.nodesSimple.reset();
                Render.nodesAlpha.reset();
                Render.nodesPhysics.reset();
                Render.componentsPick.reset();
                Render.componentsSkeleton.reset();
                Render.lights.forEach(_array => _array.reset());
                if (_options?.collectGizmos)
                    Render.gizmos.reset();
                _branch.dispatchEvent(new Event("renderPrepareStart"));
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
            let cmpPick = _branch.getComponent(FudgeCore.ComponentPick);
            if (cmpPick && cmpPick.isActive) {
                Render.componentsPick.push(cmpPick);
            }
            let cmpLights = _branch.getComponents(FudgeCore.ComponentLight);
            Render.addLights(cmpLights);
            let cmpMesh = _branch.getComponent(FudgeCore.ComponentMesh);
            let cmpMaterial = _branch.getComponent(FudgeCore.ComponentMaterial);
            if (cmpMesh && cmpMesh.isActive && cmpMaterial && cmpMaterial.isActive) {
                let mtxWorldMesh = FudgeCore.Matrix4x4.MULTIPLICATION(_branch.mtxWorld, cmpMesh.mtxPivot);
                cmpMesh.mtxWorld.set(mtxWorldMesh);
                FudgeCore.Recycler.store(mtxWorldMesh);
                let shader = cmpMaterial.material.getShader();
                let cmpParticleSystem = _branch.getComponent(FudgeCore.ComponentParticleSystem);
                if (cmpParticleSystem && cmpParticleSystem.isActive && cmpParticleSystem.particleSystem != null)
                    shader = cmpParticleSystem.particleSystem.getShaderFrom(shader);
                if (_shadersUsed.indexOf(shader) < 0)
                    _shadersUsed.push(shader);
                _branch.radius = cmpMesh.radius;
                if (cmpMaterial.sortForAlpha || _branch.getComponent(FudgeCore.ComponentText))
                    Render.nodesAlpha.push(_branch);
                else
                    Render.nodesSimple.push(_branch);
            }
            let cmpSkeletons = _branch.getComponents(FudgeCore.ComponentSkeleton);
            for (let cmpSkeleton of cmpSkeletons)
                if (cmpSkeleton && cmpSkeleton.isActive)
                    Render.componentsSkeleton.push(cmpSkeleton);
            if (_options?.collectGizmos) {
                for (const component of _branch.getAllComponents())
                    if (component.isActive && FudgeCore.Gizmos.filter.get(component.type))
                        Render.gizmos.push(component);
            }
            for (let child of _branch.getChildren()) {
                Render.prepare(child, _options, _branch.mtxWorld, _shadersUsed);
                _branch.nNodesInBranch += child.nNodesInBranch;
                let cmpMeshChild = child.getComponent(FudgeCore.ComponentMesh);
                let position = cmpMeshChild ? cmpMeshChild.mtxWorld.translation : child.mtxWorld.translation;
                position = position.clone;
                _branch.radius = Math.max(_branch.radius, position.getDistance(_branch.mtxWorld.translation) + child.radius);
                FudgeCore.Recycler.store(position);
            }
            if (firstLevel) {
                _branch.dispatchEvent(new Event("renderPrepareEnd"));
                for (const cmpSkeleton of Render.componentsSkeleton) {
                    cmpSkeleton.update();
                    cmpSkeleton.updateRenderBuffer();
                }
                Render.bufferLights(Render.lights);
            }
        }
        static addLights(_cmpLights) {
            for (let cmpLight of _cmpLights) {
                if (!cmpLight.isActive)
                    continue;
                let type = cmpLight.light.getType();
                let lightsOfType = Render.lights.get(type);
                if (!lightsOfType) {
                    lightsOfType = new FudgeCore.RecycableArray();
                    Render.lights.set(type, lightsOfType);
                }
                lightsOfType.push(cmpLight);
            }
        }
        static pickBranch(_nodes, _cmpCamera, _pickGizmos = false) {
            Render.ƒpicked = [];
            let size = Math.ceil(Math.sqrt(_nodes.length + Render.gizmos.length));
            Render.createPickTexture(size);
            Render.setBlendMode(FudgeCore.BLEND.OPAQUE);
            let gizmos = [];
            for (let node of _nodes) {
                let cmpMesh = node.getComponent(FudgeCore.ComponentMesh);
                let cmpMaterial = node.getComponent(FudgeCore.ComponentMaterial);
                if (cmpMesh && cmpMesh.isActive && cmpMaterial && cmpMaterial.isActive)
                    Render.pick(node, _cmpCamera);
                if (_pickGizmos) {
                    for (let gizmo of node.getAllComponents()) {
                        if (!gizmo.isActive || !FudgeCore.Gizmos.filter.get(gizmo.type) || !gizmo.drawGizmos)
                            continue;
                        gizmos.push(gizmo);
                    }
                }
            }
            if (_pickGizmos)
                Render.pickGizmos(gizmos, _cmpCamera);
            Render.setBlendMode(FudgeCore.BLEND.TRANSPARENT);
            let picks = Render.getPicks(size, _cmpCamera);
            Render.resetFramebuffer();
            return picks;
        }
        static draw(_cmpCamera) {
            for (let node of Render.nodesAlpha)
                Reflect.set(node, "zCamera", _cmpCamera.pointWorldToClip(node.getComponent(FudgeCore.ComponentMesh).mtxWorld.translation).z);
            const sorted = Render.nodesAlpha.getSorted((_a, _b) => Reflect.get(_b, "zCamera") - Reflect.get(_a, "zCamera"));
            Render.drawNodes(Render.nodesSimple, sorted, _cmpCamera);
        }
        static transformByPhysics(_node, _cmpRigidbody) {
            if (!_cmpRigidbody.isInitialized)
                _cmpRigidbody.initialize();
            if (!FudgeCore.Physics.getBodyList().length)
                return;
            if (!_node.mtxLocal) {
                throw (new Error("ComponentRigidbody requires ComponentTransform at the same Node"));
            }
            _cmpRigidbody.checkCollisionEvents();
            if (_cmpRigidbody.typeBody == FudgeCore.BODY_TYPE.KINEMATIC || FudgeCore.Project.mode == FudgeCore.MODE.EDITOR) {
                let mtxPivotWorld = FudgeCore.Matrix4x4.MULTIPLICATION(_node.mtxWorld, _cmpRigidbody.mtxPivotUnscaled);
                _cmpRigidbody.setPosition(mtxPivotWorld.translation);
                _cmpRigidbody.setRotation(mtxPivotWorld.rotation);
                FudgeCore.Recycler.store(mtxPivotWorld);
                return;
            }
            let mtxWorld = FudgeCore.Matrix4x4.CONSTRUCTION(_cmpRigidbody.getPosition(), _cmpRigidbody.getRotation(), null);
            mtxWorld.multiply(_cmpRigidbody.mtxPivotInverse);
            _node.mtxWorld.translation = mtxWorld.translation;
            _node.mtxWorld.rotation = mtxWorld.rotation;
            let mtxLocal = _node.getParent() ? FudgeCore.Matrix4x4.RELATIVE(_node.mtxWorld, _node.getParent().mtxWorld) : _node.mtxWorld;
            _node.mtxLocal.set(mtxLocal);
            FudgeCore.Recycler.store(mtxWorld);
            FudgeCore.Recycler.store(mtxLocal);
        }
    }
    FudgeCore.Render = Render;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class RenderMesh {
        #vertices;
        #indices;
        #textureUVs;
        #normals;
        #colors;
        #tangents;
        #bones;
        #weights;
        constructor(_mesh) {
            this.buffers = null;
            this.mesh = _mesh;
        }
        get vertices() {
            return this.#vertices || (this.#vertices = new Float32Array(this.mesh.vertices.flatMap((_vertex, _index) => {
                return [...this.mesh.vertices.position(_index).get()];
            })));
        }
        set vertices(_vertices) {
            this.#vertices = _vertices;
        }
        get indices() {
            return this.#indices || (this.#indices = new Uint16Array(this.mesh.faces.flatMap((_face) => [..._face.indices])));
        }
        set indices(_indices) {
            this.#indices = _indices;
        }
        get normals() {
            if (this.#normals == null) {
                this.mesh.vertices.forEach(_vertex => _vertex.normal.set(0, 0, 0));
                for (let face of this.mesh.faces)
                    face.indices.forEach((_iVertex, _iFaceVertex) => {
                        this.mesh.vertices.normal(_iVertex).add(FudgeCore.Vector3.SCALE(face.normalUnscaled, face.angles[_iFaceVertex]));
                    });
                this.mesh.vertices.forEach(_vertex => {
                    if (_vertex.normal.magnitudeSquared > 0)
                        _vertex.normal.normalize();
                });
                this.#normals = new Float32Array(this.mesh.vertices.flatMap((_vertex, _index) => [...this.mesh.vertices.normal(_index).get()]));
            }
            return this.#normals;
        }
        set normals(_normals) {
            this.#normals = _normals;
        }
        get tangents() {
            if (this.#tangents == null) {
                if (this.mesh.vertices.some(_vertex => !_vertex.uv)) {
                    this.#tangents = new Float32Array();
                    return this.#tangents;
                }
                if (this.mesh.vertices.some(_vertex => !_vertex.tangent)) {
                    const tangents = new Array(this.mesh.vertices.length);
                    const bitangents = new Array(this.mesh.vertices.length);
                    for (let i = 0; i < tangents.length; i++) {
                        tangents[i] = FudgeCore.Vector3.ZERO();
                        bitangents[i] = FudgeCore.Vector3.ZERO();
                    }
                    for (let face of this.mesh.faces) {
                        let i0 = face.indices[0];
                        let i1 = face.indices[1];
                        let i2 = face.indices[2];
                        let v0 = this.mesh.vertices.position(i0);
                        let v1 = this.mesh.vertices.position(i1);
                        let v2 = this.mesh.vertices.position(i2);
                        let uv0 = this.mesh.vertices.uv(i0);
                        let uv1 = this.mesh.vertices.uv(i1);
                        let uv2 = this.mesh.vertices.uv(i2);
                        let deltaPos0 = FudgeCore.Vector3.DIFFERENCE(v1, v0);
                        let deltaPos1 = FudgeCore.Vector3.DIFFERENCE(v2, v0);
                        let deltaUV0 = FudgeCore.Vector2.DIFFERENCE(uv1, uv0);
                        let deltaUV1 = FudgeCore.Vector2.DIFFERENCE(uv2, uv0);
                        let r = 1 / FudgeCore.Vector2.CROSS(deltaUV0, deltaUV1);
                        let faceTangent = FudgeCore.Vector3.SCALE(FudgeCore.Vector3.DIFFERENCE(FudgeCore.Vector3.SCALE(deltaPos0, deltaUV1.y), FudgeCore.Vector3.SCALE(deltaPos1, deltaUV0.y)), r);
                        let faceBitangent = FudgeCore.Vector3.SCALE(FudgeCore.Vector3.DIFFERENCE(FudgeCore.Vector3.SCALE(deltaPos1, -deltaUV0.x), FudgeCore.Vector3.SCALE(deltaPos0, -deltaUV1.x)), r);
                        tangents[i0].add(FudgeCore.Vector3.SCALE(faceTangent, face.angles[0]));
                        tangents[i1].add(FudgeCore.Vector3.SCALE(faceTangent, face.angles[1]));
                        tangents[i2].add(FudgeCore.Vector3.SCALE(faceTangent, face.angles[2]));
                        bitangents[i0].add(FudgeCore.Vector3.SCALE(faceBitangent, face.angles[0]));
                        bitangents[i1].add(FudgeCore.Vector3.SCALE(faceBitangent, face.angles[1]));
                        bitangents[i2].add(FudgeCore.Vector3.SCALE(faceBitangent, face.angles[2]));
                    }
                    this.mesh.vertices.forEach((_vertex, _index) => {
                        let normal = this.mesh.vertices.normal(_index);
                        let tangent = tangents[_index];
                        let bitangent = bitangents[_index];
                        tangent.add(FudgeCore.Vector3.SCALE(normal, -FudgeCore.Vector3.DOT(normal, tangent)));
                        if (tangent.magnitudeSquared > 0)
                            tangent.normalize();
                        let handedness = (FudgeCore.Vector3.DOT(FudgeCore.Vector3.CROSS(normal, tangent), bitangent) < 0) ? -1 : 1;
                        _vertex.tangent = new FudgeCore.Vector4(tangent.x, tangent.y, tangent.z, handedness);
                    });
                }
                this.#tangents = new Float32Array(this.mesh.vertices.flatMap(_vertex => _vertex.tangent.get()));
            }
            return this.#tangents;
        }
        set tangents(_tangents) {
            this.#tangents = _tangents;
        }
        get textureUVs() {
            return this.#textureUVs || (this.#textureUVs = new Float32Array(this.mesh.vertices
                .filter(_vertex => _vertex.uv)
                .flatMap((_vertex) => [..._vertex.uv.get()])));
        }
        set textureUVs(_textureUVs) {
            this.#textureUVs = _textureUVs;
        }
        get colors() {
            return this.#colors || (this.#colors = new Float32Array(this.mesh.vertices
                .filter(_vertex => _vertex.color)
                .flatMap(_vertex => [..._vertex.color.getArray()])));
        }
        set colors(_colors) {
            this.#colors = _colors;
        }
        get bones() {
            return this.#bones || (this.#bones = this.mesh.vertices.some(_vertex => _vertex.bones) ?
                new Uint8Array(this.mesh.vertices.flatMap((_vertex, _index) => {
                    const bones = this.mesh.vertices.bones(_index);
                    return [bones?.[0]?.index || 0, bones?.[1]?.index || 0, bones?.[2]?.index || 0, bones?.[3]?.index || 0];
                })) :
                undefined);
        }
        set bones(_iBones) {
            this.#bones = _iBones;
        }
        get weights() {
            return this.#weights || (this.#weights = this.mesh.vertices.some(_vertex => _vertex.bones) ?
                new Float32Array(this.mesh.vertices.flatMap((_vertex, _index) => {
                    const bones = this.mesh.vertices.bones(_index);
                    return [bones?.[0]?.weight || 0, bones?.[1]?.weight || 0, bones?.[2]?.weight || 0, bones?.[3]?.weight || 0];
                })) :
                undefined);
        }
        set weights(_weights) {
            this.#weights = _weights;
        }
        clear() {
            this.buffers = null;
            this.#vertices = null;
            this.#indices = null;
            this.#textureUVs = null;
            this.#normals = null;
            this.#colors = null;
            this.#tangents = null;
            this.#bones = null;
            this.#weights = null;
        }
    }
    FudgeCore.RenderMesh = RenderMesh;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Viewport extends FudgeCore.EventTargetUnified {
        constructor() {
            super(...arguments);
            this.name = "Viewport";
            this.camera = null;
            this.frameClientToCanvas = new FudgeCore.FramingScaled();
            this.frameCanvasToDestination = new FudgeCore.FramingComplex();
            this.frameDestinationToSource = new FudgeCore.FramingScaled();
            this.frameSourceToRender = new FudgeCore.FramingScaled();
            this.adjustingFrames = true;
            this.adjustingCamera = true;
            this.physicsDebugMode = FudgeCore.PHYSICS_DEBUGMODE.NONE;
            this.renderingGizmos = false;
            this.componentsPick = new FudgeCore.RecycableArray();
            this.#branch = null;
            this.#crc2 = null;
            this.#canvas = null;
        }
        #branch;
        #crc2;
        #canvas;
        get hasFocus() {
            return (Viewport.focus == this);
        }
        get canvas() {
            return this.#canvas;
        }
        get context() {
            return this.#crc2;
        }
        initialize(_name, _branch, _camera, _canvas) {
            this.name = _name;
            this.camera = _camera;
            this.#canvas = _canvas;
            this.#crc2 = _canvas.getContext("2d");
            this.#canvas.tabIndex = 0;
            this.rectSource = FudgeCore.Render.getCanvasRect();
            this.rectDestination = this.getClientRectangle();
            this.setBranch(_branch);
        }
        getCanvasRectangle() {
            return FudgeCore.Rectangle.GET(0, 0, this.#canvas.width, this.#canvas.height);
        }
        getClientRectangle() {
            return FudgeCore.Rectangle.GET(0, 0, this.#canvas.clientWidth, this.#canvas.clientHeight);
        }
        setBranch(_branch) {
            if (_branch) {
                _branch.broadcastEvent(new Event("attachBranch"));
            }
            this.#branch = _branch;
        }
        getBranch() {
            return this.#branch;
        }
        draw(_prepareBranch = true) {
            this.prepare(_prepareBranch);
            if (this.physicsDebugMode != FudgeCore.PHYSICS_DEBUGMODE.PHYSIC_OBJECTS_ONLY) {
                FudgeCore.Render.draw(this.camera);
                if (this.renderingGizmos)
                    FudgeCore.Gizmos.draw(this.camera);
            }
            if (this.physicsDebugMode != FudgeCore.PHYSICS_DEBUGMODE.NONE) {
                FudgeCore.Physics.draw(this.camera, this.physicsDebugMode);
            }
            this.dispatchEvent(new Event("renderEnd"));
            this.#crc2.imageSmoothingEnabled = false;
            this.#crc2.drawImage(FudgeCore.Render.getCanvas(), this.rectSource.x, this.rectSource.y, this.rectSource.width, this.rectSource.height, this.rectDestination.x, this.rectDestination.y, this.rectDestination.width, this.rectDestination.height);
        }
        prepare(_prepareBranch = true) {
            if (!this.#branch)
                return;
            if (!this.camera.isActive)
                return;
            if (this.adjustingFrames)
                this.adjustFrames();
            if (this.adjustingCamera)
                this.adjustCamera();
            if (_prepareBranch)
                this.prepareBranch();
        }
        prepareBranch() {
            let mtxRoot = FudgeCore.Matrix4x4.IDENTITY();
            if (this.#branch.getParent())
                mtxRoot = this.#branch.getParent().mtxWorld;
            this.dispatchEvent(new Event("renderPrepareStart"));
            FudgeCore.Render.prepare(this.#branch, { collectGizmos: this.renderingGizmos }, mtxRoot);
            this.dispatchEvent(new Event("renderPrepareEnd"));
            this.componentsPick = FudgeCore.Render.componentsPick;
        }
        dispatchPointerEvent(_event) {
            let posClient = new FudgeCore.Vector2(_event.clientX, _event.clientY);
            let ray = this.getRayFromClient(posClient);
            let cameraPicks = [];
            let otherPicks = [];
            for (let cmpPick of this.componentsPick)
                if (cmpPick.pick == FudgeCore.PICK.CAMERA)
                    cameraPicks.push(cmpPick.node);
                else
                    otherPicks.push(cmpPick);
            if (cameraPicks.length) {
                let picks = FudgeCore.Picker.pickCamera(cameraPicks, this.camera, this.pointClientToProjection(posClient), this.renderingGizmos);
                for (let pick of picks) {
                    Reflect.set(_event, "pick", pick);
                    pick.node.dispatchEvent(_event);
                }
            }
            for (let cmpPick of otherPicks) {
                cmpPick.pickAndDispatch(ray, _event);
            }
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
            let rectOffscreenCanvas = FudgeCore.Render.getCanvasRect();
            FudgeCore.Render.setCanvasSize(rectRender.width, rectRender.height);
            if (rectRender.width != rectOffscreenCanvas.width || rectRender.height != rectOffscreenCanvas.height)
                FudgeCore.Render.adjustAttachments();
            FudgeCore.Recycler.store(rectClient);
            FudgeCore.Recycler.store(rectCanvas);
            FudgeCore.Recycler.store(rectRender);
            FudgeCore.Recycler.store(rectOffscreenCanvas);
        }
        adjustCamera() {
            let rect = FudgeCore.Render.getRenderRectangle();
            this.camera.projectCentral(rect.width / rect.height, this.camera.getFieldOfView(), this.camera.getDirection(), this.camera.getNear(), this.camera.getFar());
            this.camera.resetWorldToView();
        }
        getRayFromClient(_point) {
            let posProjection = this.pointClientToProjection(_point);
            let ray = new FudgeCore.Ray(new FudgeCore.Vector3(-posProjection.x, posProjection.y, 1));
            ray.transform(this.camera.mtxPivot);
            let cameraNode = this.camera.node;
            if (cameraNode)
                ray.transform(cameraNode.mtxWorld);
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
    }
    FudgeCore.Viewport = Viewport;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    let XR_SESSION_MODE;
    (function (XR_SESSION_MODE) {
        XR_SESSION_MODE["IMMERSIVE_VR"] = "immersive-vr";
    })(XR_SESSION_MODE = FudgeCore.XR_SESSION_MODE || (FudgeCore.XR_SESSION_MODE = {}));
    let XR_REFERENCE_SPACE;
    (function (XR_REFERENCE_SPACE) {
        XR_REFERENCE_SPACE["VIEWER"] = "viewer";
        XR_REFERENCE_SPACE["LOCAL"] = "local";
    })(XR_REFERENCE_SPACE = FudgeCore.XR_REFERENCE_SPACE || (FudgeCore.XR_REFERENCE_SPACE = {}));
    class XRViewport extends FudgeCore.Viewport {
        static { this.xrViewportInstance = null; }
        constructor() {
            super();
            this.vrDevice = null;
            this.session = null;
            this.referenceSpace = null;
            this.useVRController = false;
            XRViewport.xrViewportInstance = this;
        }
        static get default() {
            return this.xrViewportInstance;
        }
        initialize(_name, _branch, _cameraXR, _canvas) {
            super.initialize(_name, _branch, _cameraXR, _canvas);
        }
        async initializeVR(_vrSessionMode = XR_SESSION_MODE.IMMERSIVE_VR, _vrReferenceSpaceType = XR_REFERENCE_SPACE.LOCAL, _vrController = false) {
            let session = await navigator.xr.requestSession(_vrSessionMode);
            this.referenceSpace = await session.requestReferenceSpace(_vrReferenceSpaceType);
            await FudgeCore.Render.getRenderingContext().makeXRCompatible();
            let nativeScaleFactor = XRWebGLLayer.getNativeFramebufferScaleFactor(session);
            let baseLayer = new XRWebGLLayer(session, FudgeCore.Render.getRenderingContext(), { framebufferScaleFactor: nativeScaleFactor });
            await session.updateRenderState({ baseLayer: baseLayer });
            FudgeCore.Render.setFramebufferTarget(baseLayer.framebuffer);
            FudgeCore.Render.setCanvasSize(baseLayer.framebufferWidth, baseLayer.framebufferHeight);
            FudgeCore.Render.setRenderRectangle(FudgeCore.Rectangle.GET(0, 0, baseLayer.framebufferWidth, baseLayer.framebufferHeight));
            FudgeCore.Render.adjustAttachments();
            this.adjustingFrames = false;
            this.vrDevice = this.camera;
            this.initializeReferenceSpace();
            this.useVRController = _vrController;
            if (_vrController) {
                this.vrDevice.rightCntrl.cmpTransform = new FudgeCore.ComponentTransform();
                this.vrDevice.leftCntrl.cmpTransform = new FudgeCore.ComponentTransform();
            }
            this.session = session;
            this.prepareBranch();
        }
        async initializeAR(_arSessionMode = null, _arReferenceSpaceType = null) {
            FudgeCore.Debug.error("NOT IMPLEMENTED YET! Check out initializeVR!");
        }
        draw(_prepareBranch = true, _xrFrame = null) {
            if (!this.session) {
                super.draw(_prepareBranch);
                return;
            }
            let pose = _xrFrame?.getViewerPose(this.referenceSpace);
            if (!pose)
                return;
            this.vrDevice.mtxLocal.set(pose.transform.matrix);
            this.vrDevice.mtxLocal.rotateY(180);
            super.prepare(_prepareBranch);
            let glLayer = this.session.renderState.baseLayer;
            for (let view of pose.views) {
                let viewport = glLayer.getViewport(view);
                FudgeCore.Render.setViewport(viewport.x, viewport.y, viewport.width, viewport.height);
                FudgeCore.Render.setScissorTest(true, viewport.x, viewport.y, viewport.width, viewport.height);
                if (this.useVRController)
                    this.setControllerConfigs(_xrFrame);
                this.camera.resetWorldToView();
                this.camera.mtxProjection.set(view.projectionMatrix);
                this.camera.mtxCameraInverse.set(view.transform.inverse.matrix);
                if (this.physicsDebugMode != FudgeCore.PHYSICS_DEBUGMODE.PHYSIC_OBJECTS_ONLY)
                    FudgeCore.Render.draw(this.camera);
                if (this.physicsDebugMode != FudgeCore.PHYSICS_DEBUGMODE.NONE) {
                    FudgeCore.Physics.draw(this.camera, this.physicsDebugMode);
                }
            }
            FudgeCore.Render.setScissorTest(false);
            FudgeCore.Render.setRenderRectangle(FudgeCore.Render.getRenderRectangle());
        }
        initializeReferenceSpace() {
            let mtxWorld = this.vrDevice.node?.getComponent(FudgeCore.ComponentVRDevice)?.mtxWorld;
            if (!mtxWorld)
                return;
            mtxWorld = mtxWorld.clone;
            mtxWorld.rotateY(180);
            let invMtxTransfom = mtxWorld.inverse();
            XRViewport.default.referenceSpace = XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(invMtxTransfom.translation, invMtxTransfom.quaternion));
        }
        setControllerConfigs(_xrFrame) {
            if (_xrFrame) {
                if (XRViewport.default.session.inputSources.length > 0) {
                    XRViewport.default.session.inputSources.forEach(_controller => {
                        try {
                            switch (_controller.handedness) {
                                case ("right"):
                                    this.vrDevice.rightCntrl.cmpTransform.mtxLocal.set(_xrFrame.getPose(_controller.targetRaySpace, XRViewport.default.referenceSpace).transform.matrix);
                                    if (!this.vrDevice.rightCntrl.gamePad)
                                        this.vrDevice.rightCntrl.gamePad = _controller.gamepad;
                                    else {
                                        this.vrDevice.rightCntrl.thumbstickX = _controller.gamepad.axes[2];
                                        this.vrDevice.rightCntrl.thumbstickY = _controller.gamepad.axes[3];
                                    }
                                    break;
                                case ("left"):
                                    this.vrDevice.leftCntrl.cmpTransform.mtxLocal.set(_xrFrame.getPose(_controller.targetRaySpace, XRViewport.default.referenceSpace).transform.matrix);
                                    if (!this.vrDevice.leftCntrl.gamePad)
                                        this.vrDevice.leftCntrl.gamePad = _controller.gamepad;
                                    else {
                                        this.vrDevice.leftCntrl.thumbstickX = _controller.gamepad.axes[2];
                                        this.vrDevice.leftCntrl.thumbstickY = _controller.gamepad.axes[3];
                                    }
                                    break;
                            }
                        }
                        catch (e) {
                            FudgeCore.Debug.info("Input Sources Error: " + e);
                        }
                    });
                }
            }
        }
    }
    FudgeCore.XRViewport = XRViewport;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class FileIoBrowserLocal extends FudgeCore.EventTargetStatic {
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
        static async loadFiles(_fileList, _loaded) {
            for (let file of _fileList) {
                const content = await new Response(file).text();
                _loaded[file.name] = content;
            }
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
    }
    FudgeCore.FileIoBrowserLocal = FileIoBrowserLocal;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class MutableArray extends Array {
        #type;
        constructor(_type, ..._args) {
            super(..._args);
            this.#type = _type;
        }
        get type() {
            return this.#type;
        }
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
    let RESOURCE_STATUS;
    (function (RESOURCE_STATUS) {
        RESOURCE_STATUS[RESOURCE_STATUS["PENDING"] = 0] = "PENDING";
        RESOURCE_STATUS[RESOURCE_STATUS["READY"] = 1] = "READY";
        RESOURCE_STATUS[RESOURCE_STATUS["ERROR"] = 2] = "ERROR";
    })(RESOURCE_STATUS = FudgeCore.RESOURCE_STATUS || (FudgeCore.RESOURCE_STATUS = {}));
    class Project extends FudgeCore.EventTargetStatic {
        static { this.resources = {}; }
        static { this.serialization = {}; }
        static { this.scriptNamespaces = {}; }
        static { this.baseURL = new URL(location.toString()); }
        static { this.mode = MODE.RUNTIME; }
        static { this.graphInstancesToResync = {}; }
        static register(_resource, _idResource) {
            if (_resource.idResource)
                if (_resource.idResource == _idResource)
                    return;
                else
                    this.deregister(_resource);
            _resource.idResource = _idResource || Project.generateId(_resource);
            Project.resources[_resource.idResource] = _resource;
            if (_resource instanceof FudgeCore.Graph)
                _resource.addEventListener("graphMutated", (_event) => this.dispatchEvent(new CustomEvent("graphMutated", { detail: _resource })));
        }
        static deregister(_resource) {
            delete (Project.resources[_resource.idResource]);
            delete (Project.serialization[_resource.idResource]);
        }
        static clear() {
            Project.resources = {};
            Project.serialization = {};
            Project.clearScriptNamespaces();
        }
        static getResourcesByType(_type) {
            let found = [];
            for (let resourceId in Project.resources) {
                let resource = Project.resources[resourceId];
                if (resource instanceof _type)
                    found.push(resource);
            }
            return found;
        }
        static getResourcesByName(_name) {
            let found = [];
            for (let resourceId in Project.resources) {
                let resource = Project.resources[resourceId];
                if (resource.name == _name)
                    found.push(resource);
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
            let instance = new FudgeCore.GraphInstance(_graph);
            await instance.connectToGraph();
            return instance;
        }
        static registerGraphInstanceForResync(_instance) {
            let instances = Project.graphInstancesToResync[_instance.idSource] || [];
            instances.push(_instance);
            Project.graphInstancesToResync[_instance.idSource] = instances;
        }
        static async resyncGraphInstances(_graph) {
            let instances = Project.graphInstancesToResync[_graph.idResource];
            if (!instances)
                return;
            for (let instance of instances)
                await instance.connectToGraph();
            delete (Project.graphInstancesToResync[_graph.idResource]);
        }
        static registerScriptNamespace(_namespace) {
            let name = FudgeCore.Serializer.registerNamespace(_namespace);
            if (!Project.scriptNamespaces[name])
                Project.scriptNamespaces[name] = _namespace;
        }
        static clearScriptNamespaces() {
            for (let name in Project.scriptNamespaces) {
                Reflect.set(window, name, undefined);
                Project.scriptNamespaces[name] = undefined;
                delete Project.scriptNamespaces[name];
            }
        }
        static getComponentScripts() {
            let compoments = {};
            for (let namespace in Project.scriptNamespaces) {
                compoments[namespace] = [];
                for (let name in Project.scriptNamespaces[namespace]) {
                    let script = Reflect.get(Project.scriptNamespaces[namespace], name);
                    try {
                        let o = Object.create(script);
                        if (o.prototype instanceof FudgeCore.ComponentScript)
                            compoments[namespace].push(script);
                    }
                    catch (_e) { }
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
            return new Promise((_resolve, _reject) => {
                script.addEventListener("load", () => _resolve());
                script.addEventListener("error", () => {
                    FudgeCore.Debug.error("Loading script", _url);
                    _reject();
                });
                script.src = _url.toString();
            });
        }
        static async loadResources(_url) {
            const response = await fetch(_url);
            const resourceFileContent = await response.text();
            let serialization = FudgeCore.Serializer.parse(resourceFileContent);
            let reconstruction = await Project.deserialize(serialization);
            Project.dispatchEvent(new CustomEvent("resourcesLoaded", { detail: { url: _url, resources: reconstruction } }));
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
var FBX;
(function (FBX) {
    class BufferReader {
        constructor(_buffer) {
            this.view = new DataView(_buffer);
            this.offset = 0;
        }
        getChar(_offset = this.offset) {
            return String.fromCharCode(this.getUint8(_offset));
        }
        getBool(_offset = this.offset) {
            return this.getUint8(_offset) != 0;
        }
        getUint8(_offset = this.offset) {
            this.offset = _offset + 1;
            return this.view.getUint8(_offset);
        }
        getUint32(_offset = this.offset) {
            this.offset = _offset + 4;
            return this.view.getUint32(_offset, true);
        }
        getUint64(_offset = this.offset) {
            this.offset = _offset + 8;
            return this.view.getBigUint64(_offset, true);
        }
        getInt16(_offset = this.offset) {
            this.offset = _offset + 2;
            return this.view.getInt16(_offset, true);
        }
        getInt32(_offset = this.offset) {
            this.offset = _offset + 4;
            return this.view.getInt32(_offset, true);
        }
        getInt64(_offset = this.offset) {
            this.offset = _offset + 8;
            return this.view.getBigInt64(_offset, true);
        }
        getFloat32(_offset = this.offset) {
            this.offset = _offset + 4;
            return this.view.getFloat32(_offset, true);
        }
        getFloat64(_offset = this.offset) {
            this.offset = _offset + 8;
            return this.view.getFloat64(_offset, true);
        }
        getString(_length, _offset = this.offset) {
            return String.fromCharCode(...this.getSequence(this.getUint8, _length, _offset));
        }
        *getSequence(_getter, _length, _offset = this.offset) {
            this.offset = _offset;
            for (let i = 0; i < _length; i++) {
                yield _getter.call(this);
            }
        }
    }
    FBX.BufferReader = BufferReader;
})(FBX || (FBX = {}));
var FBX;
(function (FBX) {
    let MAPPING_INFORMATION_TYPE;
    (function (MAPPING_INFORMATION_TYPE) {
        MAPPING_INFORMATION_TYPE[MAPPING_INFORMATION_TYPE["BY_VERTEX"] = 0] = "BY_VERTEX";
        MAPPING_INFORMATION_TYPE[MAPPING_INFORMATION_TYPE["BY_POLYGON"] = 1] = "BY_POLYGON";
        MAPPING_INFORMATION_TYPE[MAPPING_INFORMATION_TYPE["BY_POLYGON_VERTEX"] = 2] = "BY_POLYGON_VERTEX";
        MAPPING_INFORMATION_TYPE[MAPPING_INFORMATION_TYPE["BY_EDGE"] = 3] = "BY_EDGE";
        MAPPING_INFORMATION_TYPE[MAPPING_INFORMATION_TYPE["ALL_SAME"] = 4] = "ALL_SAME";
    })(MAPPING_INFORMATION_TYPE = FBX.MAPPING_INFORMATION_TYPE || (FBX.MAPPING_INFORMATION_TYPE = {}));
    let REFERENCE_INFORMATION_TYPE;
    (function (REFERENCE_INFORMATION_TYPE) {
        REFERENCE_INFORMATION_TYPE[REFERENCE_INFORMATION_TYPE["DIRECT"] = 0] = "DIRECT";
        REFERENCE_INFORMATION_TYPE[REFERENCE_INFORMATION_TYPE["INDEX_TO_DIRECT"] = 1] = "INDEX_TO_DIRECT";
    })(REFERENCE_INFORMATION_TYPE = FBX.REFERENCE_INFORMATION_TYPE || (FBX.REFERENCE_INFORMATION_TYPE = {}));
})(FBX || (FBX = {}));
var FudgeCore;
(function (FudgeCore) {
    class FBXLoader {
        static #defaultMaterial;
        static #defaultSkinMaterial;
        #scenes;
        #nodes;
        #meshes;
        #materials;
        #skinMaterials = [];
        #textures;
        #skeletons;
        #animations;
        constructor(_buffer, _uri) {
            this.uri = _uri;
            this.nodes = FBX.parseNodesFromBinary(_buffer);
            console.log(this.nodes);
            this.fbx = FBX.loadFromNodes(this.nodes);
            console.log(this.fbx);
        }
        static get defaultMaterial() {
            return this.#defaultMaterial || (this.#defaultMaterial =
                new FudgeCore.Material("FBXDefaultMaterial", FudgeCore.ShaderGouraud, new FudgeCore.CoatRemissive(FudgeCore.Color.CSS("white"))));
        }
        static get defaultSkinMaterial() {
            return this.#defaultSkinMaterial || (this.#defaultSkinMaterial =
                new FudgeCore.Material("FBXDefaultSkinMaterial", FudgeCore.ShaderGouraudSkin, new FudgeCore.CoatRemissive(FudgeCore.Color.CSS("white"))));
        }
        static async LOAD(_uri) {
            if (!this.loaders)
                this.loaders = {};
            if (!this.loaders[_uri]) {
                const response = await fetch(_uri);
                const binary = await response.arrayBuffer();
                this.loaders[_uri] = new FBXLoader(binary, _uri);
            }
            return this.loaders[_uri];
        }
        async getScene(_index = 0) {
            if (!this.#scenes)
                this.#scenes = [];
            if (!this.#scenes[_index]) {
                const documentFBX = this.fbx.documents[_index].load();
                const scene = new FudgeCore.Graph(documentFBX.name);
                for (const childFBX of documentFBX.children) {
                    if (childFBX.type == "Model") {
                        scene.addChild(await this.getNode(this.fbx.objects.models.indexOf(childFBX)));
                    }
                }
                if (this.fbx.objects.animStacks && this.fbx.objects.animStacks.length > 0) {
                    const animation = await this.getAnimation(documentFBX.ActiveAnimStackName.length > 0 ?
                        this.fbx.objects.animStacks.findIndex(_animStack => _animStack.name == documentFBX.ActiveAnimStackName) : 0);
                    if (animation)
                        scene.addComponent(new FudgeCore.ComponentAnimator(animation));
                }
                for (const skeleton of this.#skeletons)
                    scene.addComponent(skeleton);
                FudgeCore.Project.register(scene);
                this.#scenes[_index] = scene;
            }
            return this.#scenes[_index];
        }
        async getNode(_index) {
            if (!this.#nodes)
                this.#nodes = [];
            if (!this.#nodes[_index]) {
                const modelFBX = this.fbx.objects.models[_index].load();
                const node = new FudgeCore.Node(modelFBX.name);
                await this.generateTransform(modelFBX, node);
                this.#nodes[_index] = node;
                if (modelFBX.children)
                    for (const childFBX of modelFBX.children) {
                        if (childFBX.type == "Model") {
                            node.addChild(await this.getNode(this.fbx.objects.models.indexOf(childFBX)));
                        }
                        else if (childFBX.type == "Geometry") {
                            const mesh = await this.getMesh(this.fbx.objects.geometries.indexOf(childFBX));
                            const cmpMesh = new FudgeCore.ComponentMesh(mesh);
                            node.addComponent(new FudgeCore.ComponentMaterial(FBXLoader.defaultMaterial));
                            if (mesh.renderMesh.bones) {
                                cmpMesh.skeleton = await this.getSkeleton(childFBX.children[0].children[0].children[0]);
                                node.getComponent(FudgeCore.ComponentMaterial).material = FBXLoader.defaultSkinMaterial;
                            }
                            node.addComponent(cmpMesh);
                        }
                        else if (childFBX.type == "Material") {
                            const iMaterial = this.fbx.objects.materials.indexOf(childFBX);
                            const material = await this.getMaterial(iMaterial);
                            node.getComponent(FudgeCore.ComponentMaterial).material = node.getComponent(FudgeCore.ComponentMesh).mesh.renderMesh.bones ?
                                this.#skinMaterials[iMaterial] || (this.#skinMaterials[iMaterial] = new FudgeCore.Material(material.name, material.getShader() == FudgeCore.ShaderPhong ?
                                    FudgeCore.ShaderPhongSkin :
                                    FudgeCore.ShaderPhongTexturedSkin, material.coat)) :
                                material;
                        }
                    }
            }
            return this.#nodes[_index];
        }
        async getMesh(_index) {
            if (!this.#meshes)
                this.#meshes = [];
            if (!this.#meshes[_index])
                this.#meshes[_index] = await new FudgeCore.MeshFBX().load(this.uri, _index);
            return this.#meshes[_index];
        }
        async getMaterial(_index) {
            if (!this.#materials)
                this.#materials = [];
            if (!this.#materials[_index]) {
                const materialFBX = this.fbx.objects.materials[_index].load();
                if (!(materialFBX.DiffuseColor instanceof FudgeCore.Vector3))
                    materialFBX.DiffuseColor?.children[0].load();
                this.#materials[_index] = new FudgeCore.Material(materialFBX.name, materialFBX.DiffuseColor && !(materialFBX.DiffuseColor instanceof FudgeCore.Vector3) ?
                    FudgeCore.ShaderPhongTextured :
                    FudgeCore.ShaderPhong, materialFBX.DiffuseColor && !(materialFBX.DiffuseColor instanceof FudgeCore.Vector3) ?
                    new FudgeCore.CoatRemissiveTextured(new FudgeCore.Color(...materialFBX.Diffuse.get()), await this.getTexture(this.fbx.objects.textures.indexOf(materialFBX.DiffuseColor)), materialFBX.DiffuseFactor ?? 1, materialFBX.SpecularFactor ?? average(materialFBX.Specular?.get()) ?? 0) :
                    new FudgeCore.CoatRemissive(new FudgeCore.Color(...(materialFBX.DiffuseColor ?? materialFBX.Diffuse).get()), materialFBX.DiffuseFactor ?? 1, materialFBX.SpecularFactor ?? average(materialFBX.Specular?.get()) ?? 0));
            }
            return this.#materials[_index];
            function average(_array) {
                if (_array)
                    return _array.reduce((_a, _b) => _a + _b) / _array.length;
                else
                    return undefined;
            }
        }
        async getTexture(_index) {
            return new Promise((_resolve, _reject) => {
                if (!this.#textures)
                    this.#textures = [];
                if (this.#textures[_index])
                    return _resolve(this.#textures[_index]);
                const videoFBX = this.fbx.objects.textures[_index].children[0];
                const texture = new FudgeCore.TextureImage();
                texture.image = new Image();
                texture.image.onload = () => _resolve(texture);
                texture.image.onerror = _reject;
                texture.image.src = URL.createObjectURL(new Blob([videoFBX.Content], { type: "image/png" }));
                this.#textures[_index] = texture;
            });
        }
        async getSkeleton(_fbxLimbNode) {
            if (!this.#skeletons)
                this.#skeletons = [];
            return this.#skeletons.find(_skeleton => _fbxLimbNode.name in _skeleton.bones) || await (async () => {
                const skeleton = new FudgeCore.ComponentSkeleton();
                let rootNode = _fbxLimbNode;
                while (rootNode.parents && rootNode.parents.some(_parent => _parent.subtype == "LimbNode"))
                    rootNode = rootNode.parents.find(_parent => _parent.subtype == "LimbNode");
                const iRootNode = this.fbx.objects.models.findIndex(_model => _model.name == rootNode.name);
                for (const node of await this.getNode(iRootNode)) {
                    if (this.fbx.objects.models[this.#nodes.indexOf(node)].subtype == "LimbNode") {
                        node.mtxWorld.set(node.cmpTransform ?
                            FudgeCore.Matrix4x4.MULTIPLICATION(node.getParent().mtxWorld, node.mtxLocal) :
                            node.getParent().mtxWorld);
                        node.mtxWorldInverse.set(FudgeCore.Matrix4x4.INVERSION(node.mtxWorld));
                        skeleton.addBone(node);
                    }
                }
                this.#skeletons.push(skeleton);
                return skeleton;
            })();
        }
        async getAnimation(_index) {
            if (!this.#animations)
                this.#animations = [];
            if (!this.#animations[_index]) {
                const animStack = this.fbx.objects.animStacks[_index];
                const animNodesFBX = animStack.children[0].children;
                let fbxAnimNodeGrouped = new Map();
                for (const fbxAnimNode of animNodesFBX) {
                    const key = fbxAnimNode.parents.find(_parent => _parent.type == "Model");
                    if (key == undefined)
                        continue;
                    if (!fbxAnimNodeGrouped.has(key))
                        fbxAnimNodeGrouped.set(key, []);
                    fbxAnimNodeGrouped.get(key).push(fbxAnimNode);
                }
                const animationStructure = {};
                for (const [fbxModel, fbxAnimNodes] of fbxAnimNodeGrouped) {
                    let currentStructure = animationStructure;
                    let parent = fbxModel.parents.find(_parent => _parent.type == "Model");
                    let path = [];
                    path.push(fbxModel);
                    while (parent != undefined) {
                        path.push(parent);
                        parent = parent.parents.find(_parent => _parent.type == "Model");
                    }
                    for (const fbxPathModel of path.reverse()) {
                        if (currentStructure.children == undefined)
                            currentStructure.children = {};
                        if (currentStructure.children[fbxPathModel.name] == undefined)
                            currentStructure.children[fbxPathModel.name] = {};
                        currentStructure = currentStructure.children[fbxPathModel.name];
                        if (fbxPathModel == fbxModel) {
                            const mtxLocal = {};
                            for (const fbxAnimNode of fbxAnimNodes)
                                mtxLocal[{
                                    T: "translation",
                                    R: "rotation",
                                    S: "scale"
                                }[fbxAnimNode.name]] = this.getAnimationVector3(fbxAnimNode, fbxPathModel);
                            currentStructure.components = {
                                ComponentTransform: [
                                    { mtxLocal: mtxLocal }
                                ]
                            };
                        }
                    }
                }
                this.#animations[_index] = new FudgeCore.Animation(animStack.name, animationStructure);
            }
            return this.#animations[_index];
        }
        async generateTransform(_modelFBX, _node) {
            const parentIndex = this.fbx.objects.models.indexOf(_modelFBX.parents.find(_parent => _parent.type == "Model"));
            const parent = parentIndex >= 0 ? await this.getNode(parentIndex) : undefined;
            const mtxLocalRotation = _modelFBX.PreRotation || _modelFBX.LclRotation || _modelFBX.PostRotation ?
                FudgeCore.Matrix4x4.IDENTITY() :
                undefined;
            if (_modelFBX.PreRotation) {
                mtxLocalRotation.rotate(this.getOrdered(_modelFBX.PreRotation, _modelFBX));
            }
            if (_modelFBX.LclRotation) {
                mtxLocalRotation.rotate(this.getOrdered(this.getTransformVector(_modelFBX.LclRotation, FudgeCore.Vector3.ZERO), _modelFBX));
            }
            if (_modelFBX.PostRotation) {
                let mtxPostRotationInverse = FudgeCore.Matrix4x4.ROTATION(this.getOrdered(_modelFBX.PostRotation, _modelFBX));
                mtxPostRotationInverse = FudgeCore.Matrix4x4.INVERSION(mtxPostRotationInverse);
                mtxLocalRotation.multiply(mtxPostRotationInverse);
            }
            const mtxLocalScaling = _modelFBX.LclScaling ?
                FudgeCore.Matrix4x4.SCALING(this.getTransformVector(_modelFBX.LclScaling, FudgeCore.Vector3.ONE)) :
                undefined;
            const mtxParentWorldRotation = parent ? FudgeCore.Matrix4x4.ROTATION(parent.mtxWorld.rotation) : undefined;
            const mtxParentWorldScale = parent ? (() => {
                const mtxParentWorldScale = FudgeCore.Matrix4x4.INVERSION(mtxParentWorldRotation);
                mtxParentWorldScale.translate(FudgeCore.Vector3.SCALE(parent.mtxWorld.translation, -1));
                mtxParentWorldScale.multiply(parent.mtxWorld);
                return mtxParentWorldScale;
            })() : undefined;
            const mtxWorldRotationScale = parent || mtxLocalRotation || mtxLocalScaling ? FudgeCore.Matrix4x4.IDENTITY() : undefined;
            if (parent || mtxLocalRotation || mtxLocalScaling) {
                const inheritType = _modelFBX.InheritType || 0;
                if (inheritType == 0) {
                    if (parent)
                        mtxWorldRotationScale.multiply(mtxParentWorldRotation);
                    if (mtxLocalRotation)
                        mtxWorldRotationScale.multiply(mtxLocalRotation);
                    if (parent)
                        mtxWorldRotationScale.multiply(mtxParentWorldScale);
                    if (mtxLocalScaling)
                        mtxWorldRotationScale.multiply(mtxLocalScaling);
                }
                else if (inheritType == 1) {
                    if (parent) {
                        mtxWorldRotationScale.multiply(mtxParentWorldRotation);
                        mtxWorldRotationScale.multiply(mtxParentWorldScale);
                    }
                    if (mtxLocalRotation)
                        mtxWorldRotationScale.multiply(mtxLocalRotation);
                    if (mtxLocalScaling)
                        mtxWorldRotationScale.multiply(mtxLocalScaling);
                }
                else {
                    if (parent)
                        mtxWorldRotationScale.multiply(mtxParentWorldRotation);
                    if (mtxLocalRotation)
                        mtxWorldRotationScale.multiply(mtxLocalRotation);
                    if (parent) {
                        mtxWorldRotationScale.multiply(mtxParentWorldScale);
                        let mtxParentLocalScalingInverse = FudgeCore.Matrix4x4.SCALING(parent.mtxLocal.scaling);
                        mtxParentLocalScalingInverse = FudgeCore.Matrix4x4.INVERSION(mtxParentLocalScalingInverse);
                        mtxWorldRotationScale.multiply(mtxParentLocalScalingInverse);
                    }
                    if (mtxLocalScaling)
                        mtxWorldRotationScale.multiply(mtxLocalScaling);
                }
            }
            let translation;
            translation = FudgeCore.Vector3.ZERO();
            if (_modelFBX.LclTranslation)
                translation.add(this.getTransformVector(_modelFBX.LclTranslation, FudgeCore.Vector3.ZERO));
            if (_modelFBX.RotationOffset)
                translation.add(_modelFBX.RotationOffset);
            if (_modelFBX.RotationPivot)
                translation.add(_modelFBX.RotationPivot);
            const mtxTransform = FudgeCore.Matrix4x4.TRANSLATION(translation);
            if (mtxLocalRotation)
                mtxTransform.multiply(mtxLocalRotation);
            translation = FudgeCore.Vector3.ZERO();
            if (_modelFBX.RotationPivot)
                translation.subtract(_modelFBX.RotationPivot);
            if (_modelFBX.ScalingOffset)
                translation.add(_modelFBX.ScalingOffset);
            if (_modelFBX.ScalingPivot)
                translation.add(_modelFBX.ScalingPivot);
            mtxTransform.translate(translation);
            if (mtxLocalScaling)
                mtxTransform.multiply(mtxLocalScaling);
            if (_modelFBX.ScalingPivot)
                mtxTransform.translate(FudgeCore.Vector3.SCALE(_modelFBX.ScalingPivot, -1));
            const mtxWorldTranslation = parent ?
                FudgeCore.Matrix4x4.TRANSLATION(FudgeCore.Matrix4x4.MULTIPLICATION(parent.mtxWorld, FudgeCore.Matrix4x4.TRANSLATION(mtxTransform.translation)).translation) :
                FudgeCore.Matrix4x4.TRANSLATION(mtxTransform.translation);
            mtxTransform.set(mtxWorldTranslation);
            mtxTransform.multiply(mtxWorldRotationScale);
            _node.mtxWorld.set(mtxTransform);
            if (parent)
                mtxTransform.multiply(FudgeCore.Matrix4x4.INVERSION(parent.mtxWorld), true);
            _node.addComponent(new FudgeCore.ComponentTransform(mtxTransform));
        }
        getTransformVector(_vector, _default) {
            return (_vector == undefined ?
                _default() :
                _vector instanceof FudgeCore.Vector3 ?
                    _vector :
                    new FudgeCore.Vector3(typeof (_vector = _vector.load()).dX == "number" ?
                        _vector.dX :
                        _vector.dX.load().Default, typeof _vector.dY == "number" ?
                        _vector.dY :
                        _vector.dY.load().Default, typeof _vector.dZ == "number" ?
                        _vector.dZ :
                        _vector.dZ.load().Default));
        }
        getAnimationVector3(_animNode, _target) {
            const vectorSequence = {};
            for (const valueName in _animNode)
                if (valueName == "dX" || valueName == "dY" || valueName == "dZ") {
                    const value = _animNode[valueName];
                    if (typeof value != "number") {
                        const sequence = new FudgeCore.AnimationSequence();
                        for (let i = 0; i < value.KeyTime.length; ++i) {
                            sequence.addKey(new FudgeCore.AnimationKey(Number((value.KeyTime[i] - value.KeyTime.reduce((_min, _v) => _v < _min ? _v : _min)) / BigInt("46186158")), value.KeyValueFloat[i]));
                        }
                        vectorSequence[valueName[1].toLowerCase()] = sequence;
                    }
                }
            if (_animNode.name == "R" && (_target.PreRotation || _target.PostRotation)) {
                let preRototation;
                if (_target.PreRotation)
                    preRototation = FudgeCore.Matrix4x4.ROTATION(_target.PreRotation);
                let postRotation;
                if (_target.PostRotation)
                    postRotation = FudgeCore.Matrix4x4.ROTATION(_target.PostRotation);
                [vectorSequence.x, vectorSequence.y, vectorSequence.z]
                    .flatMap(_seq => _seq?.getKeys())
                    .map(_key => _key?.time)
                    .sort((_timeA, _timeB) => _timeA - _timeB)
                    .filter((_time, _index, _times) => _time != _times[_index + 1])
                    .map(_time => {
                    return { x: findKey(vectorSequence.x), y: findKey(vectorSequence.y), z: findKey(vectorSequence.z) };
                    function findKey(_sequence) {
                        return _sequence?.getKeys().find(_key => _key.time == _time);
                    }
                })
                    .forEach(_frame => {
                    let vctEulerAngles = FudgeCore.Recycler.get(FudgeCore.Vector3);
                    vctEulerAngles.set(_frame.x?.value ?? 0, _frame.y?.value ?? 0, _frame.z?.value ?? 0);
                    const mtxRotation = FudgeCore.Matrix4x4.ROTATION(vctEulerAngles);
                    if (preRototation)
                        mtxRotation.multiply(preRototation, true);
                    if (postRotation)
                        mtxRotation.multiply(postRotation);
                    vctEulerAngles = mtxRotation.rotation;
                    if (_frame.x)
                        _frame.x.value = vctEulerAngles.x;
                    if (_frame.y)
                        _frame.y.value = vctEulerAngles.y;
                    if (_frame.z)
                        _frame.z.value = vctEulerAngles.z;
                });
            }
            return vectorSequence;
        }
        getOrdered(_rotation, _modelFBX) {
            if (!_modelFBX.EulerOrder)
                return _rotation;
            const data = _rotation.get();
            const result = FudgeCore.Recycler.get(FudgeCore.Vector3);
            result.set(data[_modelFBX.EulerOrder.indexOf("Z")], data[_modelFBX.EulerOrder.indexOf("Y")], data[_modelFBX.EulerOrder.indexOf("X")]);
            return result;
        }
    }
    FudgeCore.FBXLoader = FBXLoader;
})(FudgeCore || (FudgeCore = {}));
var FBX;
(function (FBX) {
    class Node {
        #children;
        #properties;
        constructor(_name, _loadProperties, _loadChildren) {
            this.name = _name;
            this.loadProperties = _loadProperties;
            this.loadChildren = _loadChildren;
        }
        get properties() {
            return this.#properties || (this.#properties = this.loadProperties());
        }
        get children() {
            return this.#children || (this.#children = this.loadChildren());
        }
    }
    FBX.Node = Node;
    let ARRAY_ENCODING;
    (function (ARRAY_ENCODING) {
        ARRAY_ENCODING[ARRAY_ENCODING["UNCOMPRESSED"] = 0] = "UNCOMPRESSED";
        ARRAY_ENCODING[ARRAY_ENCODING["COMPRESSED"] = 1] = "COMPRESSED";
    })(ARRAY_ENCODING = FBX.ARRAY_ENCODING || (FBX.ARRAY_ENCODING = {}));
})(FBX || (FBX = {}));
var FBX;
(function (FBX) {
    function loadFromNodes(_nodes) {
        const fbx = {
            documents: undefined,
            objects: {
                all: undefined,
                models: [],
                geometries: [],
                materials: [],
                poses: [],
                textures: [],
                animStacks: []
            },
            connections: undefined
        };
        for (const node of _nodes) {
            if (node.name == "Documents")
                fbx.documents = node.children
                    .filter(_documentNode => _documentNode.name == "Document")
                    .map(_documentNode => getDocument(_documentNode));
            else if (node.name == "Objects")
                fbx.objects.all = node.children.map(_objectNode => getObject(_objectNode, fbx));
            else if (node.name == "Connections")
                fbx.connections = node.children.map(_connectionNode => getConnection(_connectionNode));
            if (fbx.documents && fbx.objects.all && fbx.connections)
                break;
        }
        groupObjects(fbx);
        applyConnections(fbx.connections, fbx.documents, fbx.objects.all);
        return fbx;
    }
    FBX.loadFromNodes = loadFromNodes;
    function getDocument(_node) {
        const document = {
            uid: _node.properties[0],
            name: _node.properties[2],
            loaded: false,
            load: () => loadObjectProperties(_node, document)
        };
        return document;
    }
    function getObject(_node, _fbx) {
        const nameAndType = _node.properties[1].split("::");
        const object = {
            uid: _node.properties[0],
            name: nameAndType[0],
            type: nameAndType[1],
            subtype: _node.properties[2],
            loaded: false,
            load: () => loadObjectProperties(_node, object)
        };
        return object;
    }
    function groupObjects(_fbx) {
        for (const object of _fbx.objects.all) {
            if (object.type == "Model")
                _fbx.objects.models.push(object);
            else if (object.type == "Geometry")
                _fbx.objects.geometries.push(object);
            else if (object.type == "Material")
                _fbx.objects.materials.push(object);
            else if (object.type == "Pose")
                _fbx.objects.poses.push(object);
            else if (object.type == "Texture")
                _fbx.objects.textures.push(object);
            else if (object.type == "AnimStack")
                _fbx.objects.animStacks.push(object);
        }
    }
    function getConnection(_node) {
        if (!(_node.properties[0] == "OO" || _node.properties[0] == "OP")) {
            console.warn(`Connection type ${_node.properties[0]} is not supported`);
            return null;
        }
        return {
            childUID: _node.properties[1],
            parentUID: _node.properties[2],
            propertyName: _node.properties[0] == "OP" ? _node.properties[3] : null
        };
    }
    function applyConnections(_connections, _documents, _objects) {
        for (const connection of _connections) {
            let parent = _documents.find(_document => _document.load().RootNode == connection.parentUID);
            let child;
            for (const object of _objects) {
                if (parent == undefined && object.uid == connection.parentUID)
                    parent = object;
                if (child == undefined && object.uid == connection.childUID)
                    child = object;
                if (parent != undefined && child != undefined)
                    break;
            }
            if (child)
                (child.parents || (child.parents = [])).push(parent);
            if (connection.propertyName == null)
                (parent.children || (parent.children = [])).push(child);
            else
                parent[formatPropertyName(connection.propertyName)] = child;
        }
    }
    function loadObjectProperties(_node, _object) {
        if (_object.loaded)
            return _object;
        for (const child of _node.children) {
            if (child.name == "Properties70")
                for (const property70 of child.children) {
                    const name = formatPropertyName(property70.properties[0]);
                    if (!_object[name])
                        _object[name] = getProperty70Value(property70);
                }
            else {
                const name = formatPropertyName(child.name);
                if (!_object[name])
                    _object[name] = getPropertyValue(child);
            }
        }
        _object.loaded = true;
        return _object;
    }
    function getPropertyValue(_node) {
        return _node.children.length > 0
            ? _node.children.reduce((_subProperties, _subProperty) => {
                const name = formatPropertyName(_subProperty.name);
                if (_subProperties[name] == undefined)
                    _subProperties[name] = getPropertyValue(_subProperty);
                else {
                    if (!(_subProperties[name] instanceof Array))
                        _subProperties[name] = [_subProperties[name]];
                    _subProperties[name].push(getPropertyValue(_subProperty));
                }
                return _subProperties;
            }, {})
            : _node.properties[0];
    }
    function getProperty70Value(_node) {
        switch (_node.properties[1]) {
            case "bool":
                return _node.properties[4];
            case "int":
            case "enum":
            case "ULongLong":
            case "double":
            case "Number":
            case "FieldOfView":
                return _node.properties[4];
            case "Color":
            case "ColorRGB":
            case "Vector3D":
            case "Lcl Translation":
            case "Lcl Rotation":
            case "Lcl Scaling":
                return new FudgeCore.Vector3(..._node.properties.slice(4, 7));
            case "KString":
            default:
                return _node.properties[4];
        }
    }
    function formatPropertyName(_name) {
        return _name.replace(/[^a-zA-Z]/, "");
    }
})(FBX || (FBX = {}));
var FBX;
(function (FBX) {
    function parseNodesFromBinary(_buffer) {
        if (_buffer.byteLength < binaryStartChars.length)
            throw "Not a binary FBX file";
        const data = new FBX.BufferReader(_buffer);
        const firstChars = new Uint8Array(data.getSequence(data.getUint8, binaryStartChars.length));
        const matchesFBXBinaryFirstChars = firstChars.every((_value, _index) => _value == binaryStartChars[_index]);
        if (!matchesFBXBinaryFirstChars)
            throw "Not a binary FBX file";
        const version = data.getUint32();
        const nodeAttributesAsUInt64 = version >= 7500;
        const nodes = [];
        while (true) {
            const node = readNode(data, nodeAttributesAsUInt64);
            if (node == null)
                break;
            nodes.push(node);
        }
        return nodes;
    }
    FBX.parseNodesFromBinary = parseNodesFromBinary;
    function readNode(_data, _attributesAsUint64) {
        const endOffset = _attributesAsUint64 ? Number(_data.getUint64()) : _data.getUint32();
        if (endOffset == 0)
            return null;
        const propertiesLength = _attributesAsUint64 ? Number(_data.getUint64()) : _data.getUint32();
        const propertiesByteLength = _attributesAsUint64 ? Number(_data.getUint64()) : _data.getUint32();
        const nameLength = _data.getUint8();
        const name = _data.getString(nameLength);
        const propertiesOffset = _data.offset;
        const childrenOffset = propertiesOffset + propertiesByteLength;
        const node = new FBX.Node(name, () => {
            _data.offset = propertiesOffset;
            const properties = [];
            for (let iProperty = 0; iProperty < propertiesLength; iProperty++) {
                properties.push(readProperty(_data));
            }
            return properties;
        }, () => {
            _data.offset = childrenOffset;
            const children = [];
            while (endOffset - _data.offset > nullCountAtNodeEnd) {
                const child = readNode(_data, _attributesAsUint64);
                if (child)
                    children.push(child);
            }
            return children;
        });
        _data.offset = endOffset;
        return node;
    }
    function readProperty(_data) {
        const typeCode = _data.getChar();
        const value = {
            C: _data.getBool,
            Y: _data.getInt16,
            I: _data.getInt32,
            L: _data.getInt64,
            F: _data.getFloat32,
            D: _data.getFloat64,
            S: () => _data.getString(_data.getUint32()).replace("\x00\x01", "::"),
            s: () => _data.getString(_data.getUint32()).replace("\x00\x01", "::"),
            R: () => new Uint8Array(readRaw(_data, _data.getUint8)),
            r: () => new Uint8Array(readArray(_data, _data.getUint8)),
            b: () => new Uint8Array(readArray(_data, _data.getUint8)),
            i: () => new Int32Array(readArray(_data, _data.getInt32)),
            l: () => new BigInt64Array(readArray(_data, _data.getInt64)),
            f: () => new Float32Array(readArray(_data, _data.getFloat32)),
            d: () => new Float32Array(readArray(_data, _data.getFloat64))
        }[typeCode]?.call(_data);
        if (value == null)
            FudgeCore.Debug.warn(`Unknown property type ${typeCode.charCodeAt(0)}`);
        return value;
    }
    function readArray(_data, _getter) {
        const length = _data.getUint32();
        const encoding = _data.getUint32();
        const byteLength = _data.getUint32();
        const endOffset = _data.offset + byteLength;
        const iterable = encoding == FBX.ARRAY_ENCODING.COMPRESSED ?
            (() => {
                const arrayData = new Uint8Array(_data.view.buffer, _data.offset, byteLength);
                const inflatedData = (Reflect.get(globalThis, "pako") ? pako.inflate : fflate.inflateSync)(arrayData);
                return new FBX.BufferReader(inflatedData.buffer).getSequence(_getter, length);
            })() :
            _data.getSequence(_getter, length);
        _data.offset = endOffset;
        return iterable;
    }
    function readRaw(_data, _getter) {
        const length = _data.getUint32();
        return _data.getSequence(_getter, length);
        ;
    }
    const binaryStartChars = Uint8Array.from("Kaydara FBX Binary\x20\x20\x00\x1a\x00".split(""), _v => _v.charCodeAt(0));
    const nullCountAtNodeEnd = 13;
})(FBX || (FBX = {}));
var GLTF;
(function (GLTF) {
    let COMPONENT_TYPE;
    (function (COMPONENT_TYPE) {
        COMPONENT_TYPE[COMPONENT_TYPE["BYTE"] = 5120] = "BYTE";
        COMPONENT_TYPE[COMPONENT_TYPE["UNSIGNED_BYTE"] = 5121] = "UNSIGNED_BYTE";
        COMPONENT_TYPE[COMPONENT_TYPE["SHORT"] = 5122] = "SHORT";
        COMPONENT_TYPE[COMPONENT_TYPE["UNSIGNED_SHORT"] = 5123] = "UNSIGNED_SHORT";
        COMPONENT_TYPE[COMPONENT_TYPE["UNSIGNED_INT"] = 5125] = "UNSIGNED_INT";
        COMPONENT_TYPE[COMPONENT_TYPE["FLOAT"] = 5126] = "FLOAT";
    })(COMPONENT_TYPE = GLTF.COMPONENT_TYPE || (GLTF.COMPONENT_TYPE = {}));
    let ACCESSOR_TYPE;
    (function (ACCESSOR_TYPE) {
        ACCESSOR_TYPE["SCALAR"] = "SCALAR";
        ACCESSOR_TYPE["VEC2"] = "VEC2";
        ACCESSOR_TYPE["VEC3"] = "VEC3";
        ACCESSOR_TYPE["VEC4"] = "VEC4";
        ACCESSOR_TYPE["MAT2"] = "MAT2";
        ACCESSOR_TYPE["MAT3"] = "MAT3";
        ACCESSOR_TYPE["MAT4"] = "MAT4";
    })(ACCESSOR_TYPE = GLTF.ACCESSOR_TYPE || (GLTF.ACCESSOR_TYPE = {}));
    let MESH_PRIMITIVE_MODE;
    (function (MESH_PRIMITIVE_MODE) {
        MESH_PRIMITIVE_MODE[MESH_PRIMITIVE_MODE["POINTS"] = 0] = "POINTS";
        MESH_PRIMITIVE_MODE[MESH_PRIMITIVE_MODE["LINES"] = 1] = "LINES";
        MESH_PRIMITIVE_MODE[MESH_PRIMITIVE_MODE["LINE_LOOP"] = 2] = "LINE_LOOP";
        MESH_PRIMITIVE_MODE[MESH_PRIMITIVE_MODE["LINE_STRIP"] = 3] = "LINE_STRIP";
        MESH_PRIMITIVE_MODE[MESH_PRIMITIVE_MODE["TRIANGLES"] = 4] = "TRIANGLES";
        MESH_PRIMITIVE_MODE[MESH_PRIMITIVE_MODE["TRIANGLE_STRIP"] = 5] = "TRIANGLE_STRIP";
        MESH_PRIMITIVE_MODE[MESH_PRIMITIVE_MODE["TRIANGLE_FAN"] = 6] = "TRIANGLE_FAN";
    })(MESH_PRIMITIVE_MODE = GLTF.MESH_PRIMITIVE_MODE || (GLTF.MESH_PRIMITIVE_MODE = {}));
})(GLTF || (GLTF = {}));
var FudgeCore;
(function (FudgeCore) {
    class GLTFLoader {
        static #defaultMaterial;
        static #defaultSkinMaterial;
        #url;
        #gltf;
        #resources = {};
        #nodes = [];
        #cameras;
        #skeletons;
        #buffers;
        constructor(_gltf, _url, _bufferChunk) {
            this.#gltf = _gltf;
            this.#url = _url;
            if (_bufferChunk)
                this.#buffers = [_bufferChunk];
        }
        static get defaultMaterial() {
            if (!this.#defaultMaterial) {
                this.#defaultMaterial = new FudgeCore.Material("GLTFDefaultMaterial", FudgeCore.ShaderPhong, new FudgeCore.CoatRemissive(FudgeCore.Color.CSS("white"), 1, 0.5));
                FudgeCore.Project.deregister(this.#defaultMaterial);
            }
            return this.#defaultMaterial;
        }
        static get defaultSkinMaterial() {
            if (!this.#defaultSkinMaterial) {
                this.#defaultSkinMaterial = new FudgeCore.Material("GLTFDefaultSkinMaterial", FudgeCore.ShaderPhongSkin, new FudgeCore.CoatRemissive(FudgeCore.Color.CSS("white"), 1, 0.5));
                FudgeCore.Project.deregister(this.#defaultSkinMaterial);
            }
            return this.#defaultSkinMaterial;
        }
        static async loadResource(_resource, _url) {
            const loader = await GLTFLoader.LOAD((_resource.url ?? _url).toString());
            if (!loader) {
                if (!(_resource instanceof FudgeCore.GraphInstance))
                    _resource.status = FudgeCore.RESOURCE_STATUS.ERROR;
                return _resource;
            }
            let loaded;
            if (_resource instanceof FudgeCore.GraphInstance)
                loaded = await loader.getGraph(_resource.get().name, _resource);
            else if (_resource instanceof FudgeCore.GraphGLTF)
                loaded = await loader.getGraph(_resource.name, _resource);
            else if (_resource instanceof FudgeCore.MeshGLTF)
                loaded = await loader.getMesh(_resource.name, _resource.iPrimitive, _resource);
            else if (_resource instanceof FudgeCore.MaterialGLTF)
                loaded = await loader.getMaterial(_resource.name, _resource);
            else if (_resource instanceof FudgeCore.AnimationGLTF)
                loaded = await loader.getAnimation(_resource.name, _resource);
            if (!loaded) {
                FudgeCore.Debug.error(`${_resource.constructor.name} | ${_resource instanceof FudgeCore.GraphInstance ? _resource.idSource : _resource.idResource}: Failed to load resource.`);
                if (!(_resource instanceof FudgeCore.GraphInstance))
                    _resource.status = FudgeCore.RESOURCE_STATUS.ERROR;
                return _resource;
            }
            if (!(loaded instanceof FudgeCore.GraphInstance)) {
                loaded.status = FudgeCore.RESOURCE_STATUS.READY;
            }
            return loaded;
        }
        static async LOAD(_url, _registerResources = false) {
            if (!this.loaders)
                GLTFLoader.loaders = {};
            if (!this.loaders[_url]) {
                let gltf;
                let buffer;
                try {
                    const response = await fetch(new URL(_url, FudgeCore.Project.baseURL));
                    const fileExtension = _url.split('.').pop()?.toLowerCase();
                    if (fileExtension == "gltf")
                        gltf = await response.json();
                    if (fileExtension == "glb") {
                        const arrayBuffer = await response.arrayBuffer();
                        const dataView = new DataView(arrayBuffer);
                        const magic = dataView.getUint32(0, true);
                        if (magic !== 0x46546C67)
                            throw new Error(`${GLTFLoader.name} | ${_url}: Invalid magic number in GLB file.`);
                        const version = dataView.getUint32(4, true);
                        if (version != 2)
                            throw new Error(`${GLTFLoader.name} | ${_url}: Unsupported version in GLB file.`);
                        const jsonLength = dataView.getUint32(12, true);
                        const jsonFormat = dataView.getUint32(16, true);
                        if (jsonFormat !== 0x4E4F534A)
                            throw new Error('Invalid format. The first chunk of the file is not in JSON format.');
                        const decoder = new TextDecoder();
                        const jsonChunk = decoder.decode(new Uint8Array(arrayBuffer, 20, jsonLength));
                        gltf = JSON.parse(jsonChunk);
                        if (arrayBuffer.byteLength >= 20 + jsonLength) {
                            const binaryLength = dataView.getUint32(20 + jsonLength, true);
                            const binaryFormat = dataView.getUint32(24 + jsonLength, true);
                            if (binaryFormat !== 0x004E4942)
                                throw new Error('Invalid format. The second chunk of the file is not in binary format.');
                            buffer = arrayBuffer.slice(28 + jsonLength, 28 + jsonLength + binaryLength);
                        }
                    }
                }
                catch (error) {
                    FudgeCore.Debug.error(`${GLTFLoader.name} | ${_url}: Failed to load file. ${error}`);
                    return null;
                }
                GLTFLoader.checkCompatibility(gltf, _url);
                GLTFLoader.preProcess(gltf, _url);
                GLTFLoader.loaders[_url] = new GLTFLoader(gltf, _url, buffer);
            }
            return GLTFLoader.loaders[_url];
        }
        static checkCompatibility(_gltf, _url) {
            if (_gltf.asset.version != "2.0")
                FudgeCore.Debug.warn(`${GLTFLoader.name} | ${_url}: This loader was developed for glTF 2.0. It may not work as intended with version ${_gltf.asset.version}.`);
            if (_gltf.asset.minVersion != undefined && _gltf.asset.minVersion != "2.0")
                throw new Error(`${GLTFLoader.name} | ${_url}: This loader was developed for glTF 2.0. It does not work with required min version ${_gltf.asset.minVersion}.`);
            if (_gltf.extensionsUsed?.length > 0)
                FudgeCore.Debug.warn(`${GLTFLoader.name} | ${_url}: This loader does not support glTF extensions. It may not work as intended with extensions ${_gltf.extensionsUsed.toString()}.`);
            if (_gltf.extensionsRequired?.length > 0)
                throw new Error(`${GLTFLoader.name} | ${_url}: This loader does not support glTF extensions. It does not work with required extensions ${_gltf.extensionsRequired.toString()}.`);
        }
        static preProcess(_gltf, _url) {
            if (_gltf.scenes) {
                _gltf.scene = _gltf.scene ?? 0;
                addNames("Scene", _gltf.scenes);
            }
            if (_gltf.nodes) {
                _gltf.animations?.forEach(_animation => {
                    _animation.channels.forEach(_channel => {
                        const iNode = _channel.target.node;
                        if (iNode != undefined)
                            _gltf.nodes[iNode].isAnimated = true;
                    });
                });
                _gltf.nodes.forEach((_node, _iNode) => _node.children?.forEach(_iChild => _gltf.nodes[_iChild].parent = _iNode));
                _gltf.nodes.forEach((_node, _iNode) => {
                    if (_node.name == undefined)
                        _node.name = `Node${_iNode}`;
                    if (_node.isAnimated) {
                        let iParent = _node.parent;
                        let path = [];
                        path.push(_iNode);
                        while (iParent != undefined) {
                            path.push(iParent);
                            iParent = _gltf.nodes[iParent].parent;
                        }
                        _node.path = path.reverse();
                    }
                });
            }
            if (_gltf.materials)
                addNames("Material", _gltf.materials);
            if (_gltf.meshes)
                addNames("Mesh", _gltf.meshes);
            if (_gltf.animations)
                addNames("Animation", _gltf.animations);
            function addNames(_template, _target) {
                _target.forEach((_item, _index) => {
                    if (_item.name == undefined)
                        _item.name = `${_template}${_index}`;
                });
            }
        }
        get name() {
            return this.#url.split("\\").pop();
        }
        async loadResources(_class) {
            let resources = [];
            switch (_class.name) {
                case FudgeCore.Graph.name:
                    for (let iScene = 0; iScene < this.#gltf.scenes?.length; iScene++)
                        resources.push(await this.getGraph(iScene, new FudgeCore.GraphGLTF()));
                    break;
                case FudgeCore.Mesh.name:
                    for (let iMesh = 0; iMesh < this.#gltf.meshes?.length; iMesh++)
                        for (let iPrimitive = 0; iPrimitive < this.#gltf.meshes[iMesh].primitives.length; iPrimitive++)
                            resources.push(await this.getMesh(iMesh, iPrimitive, new FudgeCore.MeshGLTF()));
                    break;
                case FudgeCore.Material.name:
                    for (let iMaterial = 0; iMaterial < this.#gltf.materials?.length; iMaterial++)
                        resources.push(await this.getMaterial(iMaterial, new FudgeCore.MaterialGLTF("Hi :)")));
                    break;
                case FudgeCore.Animation.name:
                    for (let iAnimation = 0; iAnimation < this.#gltf.animations?.length; iAnimation++)
                        resources.push(await this.getAnimation(iAnimation, new FudgeCore.AnimationGLTF()));
                    break;
            }
            for (const resource of resources) {
                if (!FudgeCore.Project.resources[resource.idResource])
                    FudgeCore.Project.register(resource);
                resource.status = FudgeCore.RESOURCE_STATUS.READY;
            }
            return resources;
        }
        async getGraph(_iScene = this.#gltf.scene, _graph) {
            _iScene = this.getIndex(_iScene, this.#gltf.scenes);
            if (_iScene == -1)
                return null;
            const id = `${FudgeCore.GraphGLTF.name}|${_iScene}`;
            if (!_graph && this.#resources[id])
                return this.#resources[id];
            this.#nodes = [];
            this.#cameras = [];
            this.#skeletons = [];
            const gltfScene = this.#gltf.scenes[_iScene];
            const graph = _graph ?? new FudgeCore.GraphGLTF();
            graph.name = gltfScene.name;
            if (graph instanceof FudgeCore.GraphGLTF)
                graph.url = this.#url;
            if (_graph) {
                _graph.removeAllChildren();
                _graph.removeComponents(FudgeCore.ComponentSkeleton);
            }
            for (const iNode of gltfScene.nodes)
                graph.addChild(await this.getNodeByIndex(iNode));
            if (this.#skeletons)
                for (const skeleton of this.#skeletons)
                    graph.addComponent(skeleton);
            if (!_graph)
                this.#resources[id] = graph;
            return graph;
        }
        async getNode(_name) {
            const iNode = this.#gltf.nodes.findIndex(_node => _node.name == _name);
            if (iNode == -1)
                throw new Error(`${this}: Couldn't find name '${_name}' in glTF nodes.`);
            return await this.getNodeByIndex(iNode);
        }
        async getNodeByIndex(_iNode) {
            if (!this.#nodes[_iNode]) {
                const gltfNode = this.#gltf.nodes[_iNode];
                const node = new FudgeCore.Node(gltfNode.name);
                this.#nodes[_iNode] = node;
                if (gltfNode.children)
                    for (const iNode of gltfNode.children)
                        node.addChild(await this.getNodeByIndex(iNode));
                if (gltfNode.matrix || gltfNode.rotation || gltfNode.scale || gltfNode.translation || gltfNode.isAnimated) {
                    node.addComponent(new FudgeCore.ComponentTransform());
                    if (gltfNode.matrix) {
                        node.mtxLocal.set(Float32Array.from(gltfNode.matrix));
                    }
                    else {
                        if (gltfNode.translation) {
                            const translation = FudgeCore.Recycler.get(FudgeCore.Vector3);
                            translation.set(gltfNode.translation[0], gltfNode.translation[1], gltfNode.translation[2]);
                            node.mtxLocal.translation = translation;
                            FudgeCore.Recycler.store(translation);
                        }
                        if (gltfNode.rotation) {
                            const rotation = FudgeCore.Recycler.get(FudgeCore.Quaternion);
                            rotation.set(gltfNode.rotation[0], gltfNode.rotation[1], gltfNode.rotation[2], gltfNode.rotation[3]);
                            node.mtxLocal.rotation = rotation;
                            FudgeCore.Recycler.store(rotation);
                        }
                        if (gltfNode.scale) {
                            const scale = FudgeCore.Recycler.get(FudgeCore.Vector3);
                            scale.set(gltfNode.scale[0], gltfNode.scale[1], gltfNode.scale[2]);
                            node.mtxLocal.scaling = scale;
                            FudgeCore.Recycler.store(scale);
                        }
                    }
                }
                if (gltfNode.camera != undefined) {
                    node.addComponent(await this.getCameraByIndex(gltfNode.camera));
                }
                if (gltfNode.mesh != undefined) {
                    const gltfMesh = this.#gltf.meshes?.[gltfNode.mesh];
                    const subComponents = [];
                    for (let iPrimitive = 0; iPrimitive < gltfMesh.primitives.length; iPrimitive++) {
                        const cmpMesh = new FudgeCore.ComponentMesh(await this.getMesh(gltfNode.mesh, iPrimitive));
                        const isSkin = gltfNode.skin != undefined;
                        if (isSkin)
                            cmpMesh.skeleton = await this.getSkeletonByIndex(gltfNode.skin);
                        let cmpMaterial;
                        const iMaterial = gltfMesh.primitives?.[iPrimitive]?.material;
                        if (iMaterial == undefined) {
                            cmpMaterial = new FudgeCore.ComponentMaterial(isSkin ?
                                GLTFLoader.defaultSkinMaterial :
                                GLTFLoader.defaultMaterial);
                        }
                        else {
                            const isFlat = gltfMesh.primitives[iPrimitive].attributes.NORMAL == undefined;
                            cmpMaterial = new FudgeCore.ComponentMaterial(await this.getMaterial(iMaterial, null, isSkin, isFlat));
                            const alphaMode = this.#gltf.materials[iMaterial]?.alphaMode;
                            if (alphaMode == "MASK")
                                FudgeCore.Debug.warn(`${this}: Material with index ${iMaterial} uses alpha mode 'MASK'. FUDGE does not support this mode.`);
                            cmpMaterial.sortForAlpha = alphaMode == "BLEND";
                        }
                        subComponents.push([cmpMesh, cmpMaterial]);
                    }
                    if (subComponents.length == 1) {
                        node.addComponent(subComponents[0][0]);
                        node.addComponent(subComponents[0][1]);
                    }
                    else {
                        subComponents.forEach(([_cmpMesh, _cmpMaterial], _i) => {
                            const nodePart = new FudgeCore.Node(`${node.name}_Primitive${_i}`);
                            nodePart.addComponent(_cmpMesh);
                            nodePart.addComponent(_cmpMaterial);
                            node.addChild(nodePart);
                        });
                    }
                }
            }
            return this.#nodes[_iNode];
        }
        async getCamera(_name) {
            const iCamera = this.#gltf.cameras.findIndex(_camera => _camera.name == _name);
            if (iCamera == -1)
                throw new Error(`${this}: Couldn't find name '${_name}' in glTF cameras.`);
            return await this.getCameraByIndex(iCamera);
        }
        async getCameraByIndex(_iCamera) {
            if (!this.#cameras)
                this.#cameras = [];
            if (!this.#cameras[_iCamera]) {
                const gltfCamera = this.#gltf.cameras[_iCamera];
                const camera = new FudgeCore.ComponentCamera();
                if (gltfCamera.perspective)
                    camera.projectCentral(gltfCamera.perspective.aspectRatio, gltfCamera.perspective.yfov * FudgeCore.Calc.rad2deg, null, gltfCamera.perspective.znear, gltfCamera.perspective.zfar);
                else
                    camera.projectOrthographic(-gltfCamera.orthographic.xmag, gltfCamera.orthographic.xmag, -gltfCamera.orthographic.ymag, gltfCamera.orthographic.ymag);
                return camera;
            }
            return this.#cameras[_iCamera];
        }
        async getAnimation(_iAnimation, _animation) {
            _iAnimation = this.getIndex(_iAnimation, this.#gltf.animations);
            if (_iAnimation == -1)
                return null;
            const id = `${FudgeCore.Animation.name}|${_iAnimation}`;
            if (!_animation && this.#resources[id])
                return this.#resources[id];
            const gltfAnimation = this.#gltf.animations?.[_iAnimation];
            if (!gltfAnimation)
                throw new Error(`${this}: Couldn't find animation with index ${_iAnimation}.`);
            const animationStructure = {};
            for (const gltfChannel of gltfAnimation.channels) {
                const gltfNode = this.#gltf.nodes[gltfChannel.target.node];
                if (!gltfNode)
                    continue;
                let node = animationStructure;
                for (const iNode of gltfNode.path) {
                    const childName = this.#gltf.nodes[iNode].name;
                    node = (node.children ??= {})[childName] ??= {};
                }
                let mtxLocal = ((((node.components ??= {}).ComponentTransform ??= [])[0] ??= {}).mtxLocal ??= {});
                mtxLocal[toInternTransformation[gltfChannel.target.path]] =
                    await this.getAnimationSequenceVector(gltfAnimation.samplers[gltfChannel.sampler], gltfChannel.target.path);
            }
            const animation = _animation ?? new FudgeCore.AnimationGLTF();
            animation.animationStructure = animationStructure;
            animation.clearCache();
            animation.name = gltfAnimation.name;
            animation.calculateTotalTime();
            if (animation instanceof FudgeCore.AnimationGLTF)
                animation.url = this.#url;
            if (!_animation) {
                FudgeCore.Project.deregister(animation);
                this.#resources[id] = animation;
            }
            return animation;
        }
        async getMesh(_iMesh, _iPrimitive = 0, _mesh) {
            _iMesh = this.getIndex(_iMesh, this.#gltf.meshes);
            if (_iMesh == -1)
                return null;
            const id = `${FudgeCore.MeshGLTF.name}|${_iMesh}|${_iPrimitive}`;
            if (!_mesh && this.#resources[id])
                return this.#resources[id];
            const gltfMesh = this.#gltf.meshes[_iMesh];
            const gltfPrimitive = gltfMesh.primitives[_iPrimitive];
            if (gltfPrimitive.indices == undefined)
                FudgeCore.Debug.warn(`${this}: Mesh with index ${_iMesh} primitive ${_iPrimitive} has no indices. FUDGE does not support non-indexed meshes.`);
            if (gltfPrimitive.attributes.POSITION == undefined)
                FudgeCore.Debug.warn(`${this}: Mesh with index ${_iMesh} primitive ${_iPrimitive} has no position attribute. Primitive will be ignored.`);
            if (gltfPrimitive.mode != undefined && gltfPrimitive.mode != GLTF.MESH_PRIMITIVE_MODE.TRIANGLES)
                FudgeCore.Debug.warn(`${this}: Mesh with index ${_iMesh} primitive ${_iPrimitive} has topology type mode ${GLTF.MESH_PRIMITIVE_MODE[gltfPrimitive.mode]}. FUDGE only supports ${GLTF.MESH_PRIMITIVE_MODE[4]}.`);
            checkMaxSupport(this, "TEXCOORD", 2);
            checkMaxSupport(this, "COLOR", 1);
            checkMaxSupport(this, "JOINTS", 1);
            checkMaxSupport(this, "WEIGHTS", 1);
            let vertices, indices;
            let normals, tangents;
            let colors, textureUVs;
            let bones, weights;
            if (gltfPrimitive.indices != undefined) {
                indices = await this.getVertexIndices(gltfPrimitive.indices);
                for (let i = 0; i < indices.length; i += 3) {
                    const temp = indices[i + 2];
                    indices[i + 2] = indices[i + 0];
                    indices[i + 0] = indices[i + 1];
                    indices[i + 1] = temp;
                }
            }
            else {
                FudgeCore.Debug.warn(`${this}: Mesh with index ${_iMesh} primitive ${_iPrimitive} has no indices. FUDGE does not support non-indexed meshes.`);
            }
            if (gltfPrimitive.attributes.POSITION != undefined)
                vertices = await this.getFloat32Array(gltfPrimitive.attributes.POSITION);
            else
                FudgeCore.Debug.warn(`${this}: Mesh with index ${_iMesh} primitive ${_iPrimitive} has no position attribute. Primitive will be ignored.`);
            if (gltfPrimitive.attributes.NORMAL != undefined)
                normals = await this.getFloat32Array(gltfPrimitive.attributes.NORMAL);
            if (gltfPrimitive.attributes.TANGENT != undefined)
                tangents = await this.getFloat32Array(gltfPrimitive.attributes.TANGENT);
            if (gltfPrimitive.attributes.TEXCOORD_1 != undefined)
                textureUVs = await this.getFloat32Array(gltfPrimitive.attributes.TEXCOORD_1);
            else if (gltfPrimitive.attributes.TEXCOORD_0 != undefined)
                textureUVs = await this.getFloat32Array(gltfPrimitive.attributes.TEXCOORD_0);
            if (gltfPrimitive.attributes.COLOR_0 != undefined)
                colors = await this.getVertexColors(gltfPrimitive.attributes.COLOR_0);
            if (gltfPrimitive.attributes.JOINTS_0 != undefined && gltfPrimitive.attributes.WEIGHTS_0 != undefined) {
                bones = await this.getBoneIndices(gltfPrimitive.attributes.JOINTS_0);
                weights = await this.getFloat32Array(gltfPrimitive.attributes.WEIGHTS_0);
            }
            const mesh = _mesh ?? new FudgeCore.MeshGLTF();
            mesh.name = gltfMesh.name;
            if (mesh instanceof FudgeCore.MeshGLTF) {
                mesh.iPrimitive = _iPrimitive;
                mesh.url = this.#url;
            }
            if (_mesh) {
                _mesh.clear();
                _mesh.faces = [];
                _mesh.vertices = new FudgeCore.Vertices();
            }
            for (let iVector2 = 0, iVector3 = 0, iVector4 = 0; iVector3 < vertices?.length; iVector2 += 2, iVector3 += 3, iVector4 += 4) {
                mesh.vertices.push(new FudgeCore.Vertex(new FudgeCore.Vector3(vertices[iVector3 + 0], vertices[iVector3 + 1], vertices[iVector3 + 2]), textureUVs ?
                    new FudgeCore.Vector2(textureUVs[iVector2 + 0], textureUVs[iVector2 + 1]) :
                    undefined, normals ?
                    new FudgeCore.Vector3(normals[iVector3 + 0], normals[iVector3 + 1], normals[iVector3 + 2]) :
                    undefined, tangents ?
                    new FudgeCore.Vector4(tangents[iVector4 + 0], tangents[iVector4 + 1], tangents[iVector4 + 2], tangents[iVector4 + 3]) :
                    undefined, colors ?
                    new FudgeCore.Color(colors[iVector4 + 0], colors[iVector4 + 1], colors[iVector4 + 2], colors[iVector4 + 3]) :
                    undefined, bones && weights ?
                    [
                        { index: bones[iVector4 + 0], weight: weights[iVector4 + 0] },
                        { index: bones[iVector4 + 1], weight: weights[iVector4 + 1] },
                        { index: bones[iVector4 + 2], weight: weights[iVector4 + 2] },
                        { index: bones[iVector4 + 3], weight: weights[iVector4 + 3] }
                    ] :
                    undefined));
            }
            for (let iFaceVertexIndex = 0; iFaceVertexIndex < indices?.length; iFaceVertexIndex += 3) {
                try {
                    mesh.faces.push(new FudgeCore.Face(mesh.vertices, indices[iFaceVertexIndex + 0], indices[iFaceVertexIndex + 1], indices[iFaceVertexIndex + 2]));
                }
                catch (_e) {
                    FudgeCore.Debug.fudge("Face excluded", _e.message);
                }
            }
            mesh.renderMesh.vertices = vertices;
            mesh.renderMesh.indices = indices;
            mesh.renderMesh.normals = normals;
            mesh.renderMesh.tangents = tangents;
            mesh.renderMesh.textureUVs = textureUVs;
            mesh.renderMesh.colors = colors;
            mesh.renderMesh.bones = bones;
            mesh.renderMesh.weights = weights;
            if (!_mesh) {
                FudgeCore.Project.deregister(mesh);
                this.#resources[id] = mesh;
            }
            return mesh;
            function checkMaxSupport(_loader, _check, _max) {
                if (Object.keys(gltfPrimitive.attributes).filter((_key) => _key.startsWith(_check)).length > _max)
                    FudgeCore.Debug.warn(`${_loader}: Mesh with index ${_iMesh} primitive ${_iPrimitive} has more than ${_max} sets of '${_check}' associated with it. FUGDE only supports up to ${_max} ${_check} sets per primitive.`);
            }
        }
        async getMaterial(_iMaterial, _material, _skin = false, _flat = false) {
            _iMaterial = this.getIndex(_iMaterial, this.#gltf.materials);
            if (_iMaterial == -1)
                return null;
            const id = `${FudgeCore.Material.name}|${_iMaterial}`;
            if (this.#resources[id] && !_material)
                return this.#resources[id];
            const gltfMaterial = this.#gltf.materials[_iMaterial];
            if (!gltfMaterial)
                throw new Error(`${this}: Couldn't find material with index ${_iMaterial}.`);
            const gltfBaseColorFactor = gltfMaterial.pbrMetallicRoughness?.baseColorFactor ?? [1, 1, 1, 1];
            let gltfMetallicFactor = gltfMaterial.pbrMetallicRoughness?.metallicFactor ?? 1;
            let gltfRoughnessFactor = gltfMaterial.pbrMetallicRoughness?.roughnessFactor ?? 1;
            const gltfBaseColorTexture = gltfMaterial.pbrMetallicRoughness?.baseColorTexture;
            const gltfNormalTexture = gltfMaterial.normalTexture;
            const diffuse = 1;
            const specular = 1.8 * (1 - gltfRoughnessFactor) + 0.6 * gltfMetallicFactor;
            const intensity = 0.7 * (1 - gltfRoughnessFactor) + gltfMetallicFactor;
            const metallic = gltfMetallicFactor;
            const color = new FudgeCore.Color(...gltfBaseColorFactor);
            const coat = gltfBaseColorTexture ?
                gltfNormalTexture ?
                    new FudgeCore.CoatRemissiveTexturedNormals(color, await this.getTexture(gltfBaseColorTexture.index), await this.getTexture(gltfNormalTexture.index), diffuse, specular, intensity, metallic) :
                    new FudgeCore.CoatRemissiveTextured(color, await this.getTexture(gltfBaseColorTexture.index), diffuse, specular, intensity, metallic) :
                new FudgeCore.CoatRemissive(color, diffuse, specular, intensity, metallic);
            let shader;
            if (_flat) {
                shader = gltfBaseColorTexture ?
                    (_skin ? FudgeCore.ShaderFlatTexturedSkin : FudgeCore.ShaderFlatTextured) :
                    (_skin ? FudgeCore.ShaderFlatSkin : FudgeCore.ShaderFlat);
            }
            else {
                shader = gltfBaseColorTexture ?
                    gltfNormalTexture ?
                        (_skin ? FudgeCore.ShaderPhongTexturedNormalsSkin : FudgeCore.ShaderPhongTexturedNormals) :
                        (_skin ? FudgeCore.ShaderPhongTexturedSkin : FudgeCore.ShaderPhongTextured) :
                    (_skin ? FudgeCore.ShaderPhongSkin : FudgeCore.ShaderPhong);
            }
            const material = _material ?? new FudgeCore.MaterialGLTF(gltfMaterial.name);
            material.name = gltfMaterial.name;
            material.coat = coat;
            Reflect.set(material, "shaderType", shader);
            if (material instanceof FudgeCore.MaterialGLTF)
                material.url = this.#url;
            if (!_material) {
                FudgeCore.Project.deregister(material);
                this.#resources[id] = material;
            }
            return material;
        }
        async getTexture(_iTexture) {
            const id = `${FudgeCore.Texture.name}|${_iTexture}`;
            if (this.#resources[id])
                return this.#resources[id];
            const gltfTexture = this.#gltf.textures[_iTexture];
            const gltfSampler = this.#gltf.samplers?.[gltfTexture.sampler];
            const gltfImage = this.#gltf.images?.[gltfTexture.source];
            if (gltfImage == undefined) {
                FudgeCore.Debug.warn(`${this}: Texture with index ${_iTexture} has no image.`);
                return FudgeCore.TextureDefault.color;
            }
            let url = new URL(gltfImage.uri, new URL(this.#url, FudgeCore.Project.baseURL)).toString();
            if (!gltfImage.uri && gltfImage.bufferView) {
                const gltfBufferView = this.#gltf.bufferViews[gltfImage.bufferView];
                const buffer = await this.getBuffer(gltfBufferView.buffer);
                const byteOffset = gltfBufferView.byteOffset || 0;
                const byteLength = gltfBufferView.byteLength || 0;
                url = URL.createObjectURL(new Blob([new Uint8Array(buffer, byteOffset, byteLength / Uint8Array.BYTES_PER_ELEMENT)], { type: gltfImage.mimeType }));
            }
            const texture = new FudgeCore.TextureImage();
            await texture.load(url);
            if (gltfSampler) {
                gltfSampler.magFilter = gltfSampler.magFilter ?? WebGL2RenderingContext.NEAREST;
                gltfSampler.minFilter = gltfSampler.minFilter ?? WebGL2RenderingContext.NEAREST;
                if (gltfSampler.magFilter == WebGL2RenderingContext.NEAREST && gltfSampler.minFilter == WebGL2RenderingContext.NEAREST)
                    texture.mipmap = FudgeCore.MIPMAP.CRISP;
                else if (gltfSampler.magFilter == WebGL2RenderingContext.NEAREST && gltfSampler.minFilter == WebGL2RenderingContext.NEAREST_MIPMAP_LINEAR)
                    texture.mipmap = FudgeCore.MIPMAP.MEDIUM;
                else if (gltfSampler.magFilter == WebGL2RenderingContext.LINEAR && gltfSampler.minFilter == WebGL2RenderingContext.LINEAR_MIPMAP_LINEAR)
                    texture.mipmap = FudgeCore.MIPMAP.BLURRY;
                else
                    FudgeCore.Debug.warn(`${this}: Texture with index ${_iTexture} has a magFilter and minFilter of '${getWebGLParameterName(gltfSampler.magFilter)}' and '${getWebGLParameterName(gltfSampler.minFilter)}' respectively. FUDGE only supports the following combinations: NEAREST and NEAREST | NEAREST and NEAREST_MIPMAP_LINEAR | LINEAR and LINEAR_MIPMAP_LINEAR.`);
                gltfSampler.wrapS = gltfSampler.wrapS ?? WebGL2RenderingContext.REPEAT;
                gltfSampler.wrapT = gltfSampler.wrapT ?? WebGL2RenderingContext.REPEAT;
                if (gltfSampler.wrapS == WebGL2RenderingContext.REPEAT && gltfSampler.wrapT == WebGL2RenderingContext.REPEAT)
                    texture.wrap = FudgeCore.WRAP.REPEAT;
                else if (gltfSampler.wrapS == WebGL2RenderingContext.CLAMP_TO_EDGE && gltfSampler.wrapT == WebGL2RenderingContext.CLAMP_TO_EDGE)
                    texture.wrap = FudgeCore.WRAP.CLAMP;
                else if (gltfSampler.wrapS == WebGL2RenderingContext.MIRRORED_REPEAT && gltfSampler.wrapT == WebGL2RenderingContext.MIRRORED_REPEAT)
                    texture.wrap = FudgeCore.WRAP.MIRROR;
                else
                    FudgeCore.Debug.warn(`${this}: Texture with index ${_iTexture} has a wrapS and wrapT of '${getWebGLParameterName(gltfSampler.wrapS)}' and '${getWebGLParameterName(gltfSampler.wrapT)}' respectively. FUDGE only supports the following combinations: REPEAT and REPEAT | CLAMP_TO_EDGE and CLAMP_TO_EDGE | MIRRORED_REPEAT and MIRRORED_REPEAT.`);
            }
            FudgeCore.Project.deregister(texture);
            this.#resources[id] = texture;
            return texture;
        }
        async getSkeleton(_name) {
            const iSkeleton = this.#gltf.skins.findIndex(_skeleton => _skeleton.name == _name);
            if (iSkeleton == -1)
                throw new Error(`${this}: Couldn't find name '${_name}' in glTF skins.`);
            return await this.getSkeletonByIndex(iSkeleton);
        }
        async getSkeletonByIndex(_iSkeleton) {
            if (!this.#skeletons)
                this.#skeletons = [];
            if (!this.#skeletons[_iSkeleton]) {
                const gltfSkin = this.#gltf.skins[_iSkeleton];
                const bones = [];
                let mtxData;
                if (gltfSkin.inverseBindMatrices != undefined)
                    mtxData = await this.getFloat32Array(gltfSkin.inverseBindMatrices);
                const mtxDataSpan = 16;
                const mtxBindInverses = [];
                for (let iBone = 0; iBone < gltfSkin.joints.length; iBone++) {
                    let mtxBindInverse;
                    if (mtxData) {
                        mtxBindInverse = new FudgeCore.Matrix4x4();
                        mtxBindInverse.set(mtxData.subarray(iBone * mtxDataSpan, iBone * mtxDataSpan + mtxDataSpan));
                    }
                    bones.push(await this.getNodeByIndex(gltfSkin.joints[iBone]));
                    mtxBindInverses.push(mtxBindInverse);
                }
                this.#skeletons[_iSkeleton] = new FudgeCore.ComponentSkeleton(bones, mtxBindInverses);
            }
            return this.#skeletons[_iSkeleton];
        }
        toString() {
            return `${GLTFLoader.name} | ${this.#url}`;
        }
        getIndex(_nameOrIndex, _array) {
            let index = typeof _nameOrIndex == "number" ?
                _nameOrIndex :
                _array.findIndex(_object => _object.name == _nameOrIndex);
            if (index == -1) {
                let arrayName = Object.entries(this.#gltf).find(([_key, _value]) => _value == _array)?.[0];
                FudgeCore.Debug.error(`${this}: Couldn't find name '${_nameOrIndex}' in glTF ${arrayName}.`);
            }
            return index;
        }
        async getBoneIndices(_iAccessor) {
            const array = await this.getBufferData(_iAccessor);
            const componentType = this.#gltf.accessors[_iAccessor]?.componentType;
            if (componentType == GLTF.COMPONENT_TYPE.UNSIGNED_BYTE)
                return array;
            if (componentType == GLTF.COMPONENT_TYPE.UNSIGNED_SHORT) {
                FudgeCore.Debug.log(`${this}: Bone indices are stored as '${GLTF.COMPONENT_TYPE[GLTF.COMPONENT_TYPE.UNSIGNED_SHORT]}'. FUDGE will convert them to '${GLTF.COMPONENT_TYPE[GLTF.COMPONENT_TYPE.UNSIGNED_BYTE]}'. FUDGE only supports skeletons with up to 256 bones, so make sure your skeleton has no more than 256 bones.`);
                return Uint8Array.from(array);
            }
            throw new Error(`${this}: Invalid component type '${GLTF.COMPONENT_TYPE[componentType]}' for bone indices. Expected '${GLTF.COMPONENT_TYPE[GLTF.COMPONENT_TYPE.UNSIGNED_BYTE]}' or '${GLTF.COMPONENT_TYPE[GLTF.COMPONENT_TYPE.UNSIGNED_SHORT]}'.`);
        }
        async getFloat32Array(_iAccessor) {
            const array = await this.getBufferData(_iAccessor);
            const gltfAccessor = this.#gltf.accessors[_iAccessor];
            if (gltfAccessor.componentType == GLTF.COMPONENT_TYPE.FLOAT)
                return array;
            if (gltfAccessor.normalized) {
                switch (gltfAccessor.componentType) {
                    case GLTF.COMPONENT_TYPE.BYTE:
                        return Float32Array.from(array, _value => Math.max(_value / 127, -1));
                    case GLTF.COMPONENT_TYPE.UNSIGNED_BYTE:
                        return Float32Array.from(array, _value => _value / 255);
                    case GLTF.COMPONENT_TYPE.SHORT:
                        return Float32Array.from(array, _value => Math.max(_value / 32767, -1));
                    case GLTF.COMPONENT_TYPE.UNSIGNED_SHORT:
                        return Float32Array.from(array, _value => _value / 65535);
                    default:
                        throw new Error(`${this}: Invalid component type '${GLTF.COMPONENT_TYPE[gltfAccessor.componentType]}' for normalized accessor.`);
                }
            }
            FudgeCore.Debug.warn(`${this}: Expected component type '${GLTF.COMPONENT_TYPE[GLTF.COMPONENT_TYPE.FLOAT]}' but was '${GLTF.COMPONENT_TYPE[gltfAccessor?.componentType]}'.`);
            return Float32Array.from(array);
        }
        async getVertexIndices(_iAccessor) {
            const array = await this.getBufferData(_iAccessor);
            const gltfAccessor = this.#gltf.accessors[_iAccessor];
            if (gltfAccessor.componentType == GLTF.COMPONENT_TYPE.UNSIGNED_SHORT)
                return array;
            if (gltfAccessor.count > 65535 && gltfAccessor.type == "SCALAR")
                throw new Error(`${this}: File includes a mesh with more than 65535 vertices. FUDGE does not support meshes with more than 65535 vertices.`);
            if (gltfAccessor.componentType == GLTF.COMPONENT_TYPE.UNSIGNED_BYTE || gltfAccessor.componentType == GLTF.COMPONENT_TYPE.UNSIGNED_INT)
                return Uint16Array.from(array);
            FudgeCore.Debug.warn(`${this}: Expected an unsigned integer component type but was '${GLTF.COMPONENT_TYPE[this.#gltf.accessors[_iAccessor]?.componentType]}'.`);
            return Uint16Array.from(array);
        }
        async getVertexColors(_iAccessor) {
            const array = await this.getFloat32Array(_iAccessor);
            const gltfAccessor = this.#gltf.accessors[_iAccessor];
            if (gltfAccessor.type == GLTF.ACCESSOR_TYPE.VEC3) {
                const rgbaArray = new Float32Array(array.length * 4 / 3);
                for (let iVec3 = 0, iVec4 = 0; iVec3 < array.length; iVec3 += 3, iVec4 += 4) {
                    rgbaArray[iVec4] = array[iVec3];
                    rgbaArray[iVec4 + 1] = array[iVec3 + 1];
                    rgbaArray[iVec4 + 2] = array[iVec3 + 2];
                    rgbaArray[iVec4 + 3] = 1;
                }
                return rgbaArray;
            }
            return array;
        }
        async getBufferData(_iAccessor) {
            const gltfAccessor = this.#gltf.accessors[_iAccessor];
            if (!gltfAccessor)
                throw new Error(`${this}: Couldn't find accessor with index ${_iAccessor}.`);
            let array;
            const componentType = gltfAccessor.componentType;
            const accessorType = gltfAccessor.type;
            if (gltfAccessor.bufferView != undefined)
                array = await this.getBufferViewData(this.#gltf.bufferViews[gltfAccessor.bufferView], gltfAccessor.byteOffset, componentType, accessorType);
            if (gltfAccessor.sparse) {
                const gltfBufferViewIndices = this.#gltf.bufferViews[gltfAccessor.sparse.indices.bufferView];
                const gltfBufferViewValues = this.#gltf.bufferViews[gltfAccessor.sparse.values.bufferView];
                if (!gltfBufferViewIndices || !gltfBufferViewValues)
                    throw new Error(`${this}: Couldn't find buffer views for sparse indices or values of accessor with index ${_iAccessor}.`);
                const arrayIndices = await this.getBufferViewData(gltfBufferViewIndices, gltfAccessor.sparse.indices.byteOffset, gltfAccessor.sparse.indices.componentType, GLTF.ACCESSOR_TYPE.SCALAR);
                const arrayValues = await this.getBufferViewData(gltfBufferViewValues, gltfAccessor.sparse.values.byteOffset, componentType, accessorType);
                const accessorTypeLength = toAccessorTypeLength[gltfAccessor.type];
                if (gltfAccessor.bufferView == undefined)
                    array = new toArrayConstructor[gltfAccessor.componentType](gltfAccessor.count * accessorTypeLength);
                for (let i = 0; i < gltfAccessor.sparse.count; i++) {
                    array.set(arrayValues.slice(i * accessorTypeLength, (i + 1) * accessorTypeLength), arrayIndices[i] * accessorTypeLength);
                }
            }
            return array;
        }
        async getBufferViewData(_bufferView, _byteOffset, _componentType, _accessorType) {
            const buffer = await this.getBuffer(_bufferView.buffer);
            const byteOffset = (_bufferView.byteOffset ?? 0) + (_byteOffset ?? 0);
            const byteLength = _bufferView.byteLength ?? 0;
            const byteStride = _bufferView.byteStride;
            const arrayConstructor = toArrayConstructor[_componentType];
            const array = new arrayConstructor(buffer, byteOffset, byteLength / arrayConstructor.BYTES_PER_ELEMENT);
            if (byteStride != undefined) {
                const nComponentsPerElement = toAccessorTypeLength[_accessorType];
                const nElements = byteLength / byteStride;
                const stride = byteStride / arrayConstructor.BYTES_PER_ELEMENT;
                const newArray = new arrayConstructor(nElements * nComponentsPerElement);
                for (let iNewElement = 0; iNewElement < nElements; iNewElement++) {
                    const iElement = iNewElement * stride;
                    for (let iComponent = 0; iComponent < nComponentsPerElement; iComponent++)
                        newArray[iNewElement * nComponentsPerElement + iComponent] = array[iElement + iComponent];
                }
                return newArray;
            }
            return array;
        }
        async getBuffer(_iBuffer) {
            const gltfBuffer = this.#gltf.buffers[_iBuffer];
            if (!gltfBuffer)
                throw new Error(`${this}: Couldn't find buffer with index ${_iBuffer}.`);
            if (!this.#buffers)
                this.#buffers = [];
            if (!this.#buffers[_iBuffer]) {
                const response = await fetch(new URL(gltfBuffer.uri, new URL(this.#url, FudgeCore.Project.baseURL)));
                this.#buffers[_iBuffer] = await response.arrayBuffer();
            }
            return this.#buffers[_iBuffer];
        }
        async getAnimationSequenceVector(_sampler, _transformationType) {
            const input = await this.getFloat32Array(_sampler.input);
            const output = await this.getFloat32Array(_sampler.output);
            const millisPerSecond = 1000;
            const isRotation = _transformationType == "rotation";
            const vectorLength = isRotation ? 4 : 3;
            const interpolation = this.toInternInterpolation(_sampler.interpolation);
            const isCubic = interpolation == FudgeCore.ANIMATION_INTERPOLATION.CUBIC ? true : undefined;
            const vectorsPerInput = isCubic ? 3 : 1;
            let lastRotation;
            let nextRotation;
            const sequences = { x: [], y: [], z: [] };
            if (isRotation) {
                sequences.w = [];
                lastRotation = FudgeCore.Recycler.get(FudgeCore.Quaternion);
                nextRotation = FudgeCore.Recycler.get(FudgeCore.Quaternion);
            }
            for (let iInput = 0; iInput < input.length; iInput++) {
                const iOutput = iInput * vectorsPerInput * vectorLength + (isCubic ? vectorLength : 0);
                const iOutputSlopeIn = iOutput - vectorLength;
                const iOutputSlopeOut = iOutput + vectorLength;
                const time = millisPerSecond * input[iInput];
                if (isRotation) {
                    nextRotation.set(output[iOutput + 0], output[iOutput + 1], output[iOutput + 2], output[iOutput + 3]);
                    if (FudgeCore.Quaternion.DOT(lastRotation, nextRotation) < 0)
                        nextRotation.negate();
                    output[iOutput + 0] = nextRotation.x;
                    output[iOutput + 1] = nextRotation.y;
                    output[iOutput + 2] = nextRotation.z;
                    output[iOutput + 3] = nextRotation.w;
                    lastRotation.set(nextRotation.x, nextRotation.y, nextRotation.z, nextRotation.w);
                }
                sequences.x.push(new FudgeCore.AnimationKey(time, output[iOutput + 0], interpolation, isCubic && output[iOutputSlopeIn + 0] / millisPerSecond, isCubic && output[iOutputSlopeOut + 0] / millisPerSecond));
                sequences.y.push(new FudgeCore.AnimationKey(time, output[iOutput + 1], interpolation, isCubic && output[iOutputSlopeIn + 1] / millisPerSecond, isCubic && output[iOutputSlopeOut + 1] / millisPerSecond));
                sequences.z.push(new FudgeCore.AnimationKey(time, output[iOutput + 2], interpolation, isCubic && output[iOutputSlopeIn + 2] / millisPerSecond, isCubic && output[iOutputSlopeOut + 2] / millisPerSecond));
                if (isRotation)
                    sequences.w.push(new FudgeCore.AnimationKey(time, output[iOutput + 3], interpolation, isCubic && output[iOutputSlopeIn + 3] / millisPerSecond, isCubic && output[iOutputSlopeOut + 3] / millisPerSecond));
            }
            if (isRotation) {
                FudgeCore.Recycler.store(lastRotation);
                FudgeCore.Recycler.store(nextRotation);
            }
            return Object.fromEntries(Object.entries(sequences).map(([_key, _value]) => [_key, new FudgeCore.AnimationSequence(_value)]));
        }
        toInternInterpolation(_interpolation) {
            switch (_interpolation) {
                case "LINEAR":
                    return FudgeCore.ANIMATION_INTERPOLATION.LINEAR;
                case "STEP":
                    return FudgeCore.ANIMATION_INTERPOLATION.CONSTANT;
                case "CUBICSPLINE":
                    return FudgeCore.ANIMATION_INTERPOLATION.CUBIC;
                default:
                    if (_interpolation != undefined)
                        FudgeCore.Debug.warn(`${this}: Unknown interpolation type ${_interpolation}.`);
                    return FudgeCore.ANIMATION_INTERPOLATION.LINEAR;
            }
        }
    }
    FudgeCore.GLTFLoader = GLTFLoader;
    function getWebGLParameterName(_value) {
        return Object.keys(WebGL2RenderingContext).find(_key => Reflect.get(WebGL2RenderingContext, _key) == _value);
    }
    const toInternTransformation = {
        "translation": "translation",
        "rotation": "rotation",
        "scale": "scaling",
        "weights": "weights"
    };
    const toAccessorTypeLength = {
        "SCALAR": 1,
        "VEC2": 2,
        "VEC3": 3,
        "VEC4": 4,
        "MAT2": 4,
        "MAT3": 9,
        "MAT4": 16
    };
    const toArrayConstructor = {
        [GLTF.COMPONENT_TYPE.UNSIGNED_BYTE]: Uint8Array,
        [GLTF.COMPONENT_TYPE.BYTE]: Int8Array,
        [GLTF.COMPONENT_TYPE.UNSIGNED_SHORT]: Uint16Array,
        [GLTF.COMPONENT_TYPE.SHORT]: Int16Array,
        [GLTF.COMPONENT_TYPE.UNSIGNED_INT]: Uint32Array,
        [GLTF.COMPONENT_TYPE.FLOAT]: Float32Array
    };
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    FudgeCore.shaderSources = {};
    FudgeCore.shaderSources["ShaderAmbientOcclusion.frag"] = `#version 300 es
/**
 * Calculates ambient occlusion for a given fragment
 * @authors Roland Heer, HFU, 2023 | Jonas Plotzky, HFU, 2023
 * adaption of https://github.com/tsherif/webgl2examples/blob/da1153a15ebc09bb13498e5f732ef2036507740c/ssao.html
 * see here for an in depth explanation: 
*/
precision mediump float;
precision highp int;

const float sin45 = 0.707107; // 45 degrees in radians
const vec2 kernel[4] = vec2[4](vec2(0.0, 1.0), vec2(1.0, 0.0), vec2(0.0, -1.0), vec2(-1.0, 0.0));

uniform float u_fNear;
uniform float u_fFar;
uniform float u_fSampleRadius;
uniform float u_fBias;
uniform float u_fAttenuationConstant;
uniform float u_fAttenuationLinear;
uniform float u_fAttenuationQuadratic;
uniform vec2 u_vctResolution;
uniform vec3 u_vctCamera;
// uniform mat4 u_mtxViewProjectionInverse;

uniform sampler2D u_texPosition;
uniform sampler2D u_texNormal;
uniform sampler2D u_texNoise;
// uniform sampler2D u_texDepth;

in vec2 v_vctTexture;
out vec4 vctFrag;

layout(std140) uniform Fog {
  bool u_bFogActive;
  float u_fFogNear;
  float u_fFogFar;
  float pading;
  vec4 u_vctFogColor;
};

// This function could be used to calculate the position from the depth texture, but mobile devices seems to lack in precision to do this
// vec3 getPosition(vec2 _vctTexture) {
//   float fDepth = texture(u_texDepth, _vctTexture).r;
//   vec4 clipSpacePosition = vec4(_vctTexture * 2.0 - 1.0, fDepth * 2.0 - 1.0, 1.0);
//   vec4 worldSpacePosition = u_mtxViewProjectionInverse * clipSpacePosition;
//   return worldSpacePosition.xyz / worldSpacePosition.w;
// }

float getOcclusion(vec3 _vctPosition, vec3 _vctNormal, vec2 _vctTexture) {
  vec3 vctOccluder = texture(u_texPosition, _vctTexture).xyz;

  if (vctOccluder.x == 0.0 && vctOccluder.y == 0.0 && vctOccluder.z == 0.0) // no occluder at this position
    return 0.0;

  vec3 vctDistance = vctOccluder - _vctPosition;
  float fIntensity = max(dot(_vctNormal, normalize(vctDistance)) - u_fBias, 0.0);

  float fDistance = length(vctDistance);
  float fAttenuation = 1.0 / (u_fAttenuationConstant + u_fAttenuationLinear * fDistance + u_fAttenuationQuadratic * fDistance * fDistance);

  return fIntensity * fAttenuation;
}

float getFog(vec3 _vctPosition) {
  float fDistance = length(_vctPosition - u_vctCamera); // maybe use z-depth instead of euclidean depth
  float fFog = clamp((fDistance - u_fFogNear) / (u_fFogFar - u_fFogNear), 0.0, 1.0);
  fFog = -pow(fFog, 2.0) + (2.0 * fFog); // lets fog appear quicker and fall off slower results in a more gradual falloff
  return fFog * u_vctFogColor.a;
}

void main() {
  vec3 vctPosition = texture(u_texPosition, v_vctTexture).xyz;
  vec3 vctNormal = texture(u_texNormal, v_vctTexture).xyz;
  vec2 vctRandom = normalize(texture(u_texNoise, v_vctTexture).xy * 2.0 - 1.0);
  float fDepth = (length(vctPosition - u_vctCamera) - u_fNear) / (u_fFar - u_fNear); // linear euclidean depth in range [0,1], when changing to view space, don't subtract camera position
  float fKernelRadius = u_fSampleRadius * (1.0 - fDepth);

  float fOcclusion = 0.0;
  for (int i = 0; i < 4; ++i) {
    vec2 vctK1 = reflect(kernel[i], vctRandom);
    vec2 vctK2 = vec2(vctK1.x * sin45 - vctK1.y * sin45, vctK1.x * sin45 + vctK1.y * sin45);

    vctK1 /= u_vctResolution;
    vctK2 /= u_vctResolution;

    vctK1 *= fKernelRadius;
    vctK2 *= fKernelRadius;

    fOcclusion += getOcclusion(vctPosition, vctNormal, v_vctTexture + vctK1);
    fOcclusion += getOcclusion(vctPosition, vctNormal, v_vctTexture + vctK2 * 0.75);
    fOcclusion += getOcclusion(vctPosition, vctNormal, v_vctTexture + vctK1 * 0.5);
    fOcclusion += getOcclusion(vctPosition, vctNormal, v_vctTexture + vctK2 * 0.25);
  }

  fOcclusion = clamp(fOcclusion / 16.0, 0.0, 1.0);

  if (u_bFogActive && fOcclusion > 0.0) // correct occlusion by fog factor
    fOcclusion = mix(fOcclusion, 0.0, getFog(vctPosition));
  
  vctFrag.rgb = vec3(fOcclusion);
  vctFrag.a = 1.0;
}`;
    FudgeCore.shaderSources["ShaderBloom.frag"] = `#version 300 es
/**
 * Extracts colors, downsamples and upsamples a texture
 * Adaption of the "dual filtering kawase" method described in SIGGRAPH 2015 by Marius Bjørge
 * https://community.arm.com/cfs-file/__key/communityserver-blogs-components-weblogfiles/00-00-00-20-66/siggraph2015_2D00_mmg_2D00_marius_2D00_notes.pdf
 * @authors Roland Heer, HFU, 2023 | Jirka Dell'Oro-Friedl, HFU, 2023 | Jonas Plotzky, HFU, 2023
 */
precision mediump float;
precision highp int;

uniform int u_iMode; // 0: extract, 1: downsample, 2: upsample, 3: apply
uniform float u_fThreshold;
uniform float u_fIntensity;
uniform float u_fHighlightDesaturation;
uniform vec2 u_vctTexel;

uniform sampler2D u_texSource;

in vec2 v_vctTexture;
out vec4 vctFrag;

// old gaussian blur
// flat in vec2[9] v_vctOffsets;
// const float gaussianKernel[9] = float[](0.045, 0.122, 0.045, 0.122, 0.332, 0.122, 0.045, 0.122, 0.045);
// vec4 downsample(vec2 _vctTexture) {
//   vec4 vctColor = vec4(0.0);
//   for (int i = 0; i < 9; i++) 
//     vctColor += texture(u_texSource, v_vctTexture + v_vctOffsets[i]) * gaussianKernel[i];
//   return vctColor;
// }
// vec4 upsample(vec2 _vctTexture) {
//   vec4 vctColor = vec4(0.0);
//   for (int i = 0; i < 9; i++) 
//     vctColor += texture(u_texSource, _vctTexture + v_vctOffsets[i]) * gaussianKernel[i];
//   return vctColor;
// }

// vec3 extract(vec2 _vctTexture) {
//   vec3 vctColor = texture(u_texSource, _vctTexture).rgb;
//   if(any(greaterThan(vctColor, vec3(u_fThreshold))))
//     return vctColor;
//   discard;
// }

// vec3 extract(vec2 _vctTexture) {
//   vec3 vctColor = texture(u_texSource, _vctTexture).rgb;
//   float luminance = dot(vctColor, vec3(0.299, 0.587, 0.114));
//   if(luminance > u_fThreshold)
//     return vctColor;
//   discard;
// }

// old extraction with average brightness
vec3 extract(vec2 _vctTexture) {
  vec3 vctColor = texture(u_texSource, _vctTexture).rgb;
  float fThreshold = u_fThreshold;
  if(fThreshold >= 1.0)
    fThreshold = 0.999999;

  vctColor = vctColor - fThreshold;
  vctColor = vctColor / (1.0 - fThreshold); // negative values might receive values above 1.0...
  
  float averageBrightness = (((vctColor.r + vctColor.g + vctColor.b) / 3.0) * 0.2) + 0.8; //the effect is reduced by first setting it to a 0.0-0.2 range and then adding 0.8
  vctColor = clamp(vctColor, 0.0, 1.0) * clamp(averageBrightness, 0.0, 1.0);
  return vctColor;
}

vec4 downsample(vec2 _vctTexture) {
  vec4 sum = texture(u_texSource, _vctTexture) * 4.0;
  sum += texture(u_texSource, _vctTexture - u_vctTexel.xy);
  sum += texture(u_texSource, _vctTexture + u_vctTexel.xy);
  sum += texture(u_texSource, _vctTexture + vec2(u_vctTexel.x, -u_vctTexel.y));
  sum += texture(u_texSource, _vctTexture - vec2(u_vctTexel.x, -u_vctTexel.y));

  return sum / 8.0;
}

vec4 upsample(vec2 _vctTexture) {
  vec4 sum = texture(u_texSource, _vctTexture + vec2(-u_vctTexel.x * 2.0, 0.0));
  sum += texture(u_texSource, _vctTexture + vec2(-u_vctTexel.x, u_vctTexel.y)) * 2.0;
  sum += texture(u_texSource, _vctTexture + vec2(0.0, u_vctTexel.y * 2.0));
  sum += texture(u_texSource, _vctTexture + vec2(u_vctTexel.x, u_vctTexel.y)) * 2.0;
  sum += texture(u_texSource, _vctTexture + vec2(u_vctTexel.x * 2.0, 0.0));
  sum += texture(u_texSource, _vctTexture + vec2(u_vctTexel.x, -u_vctTexel.y)) * 2.0;
  sum += texture(u_texSource, _vctTexture + vec2(0.0, -u_vctTexel.y * 2.0));
  sum += texture(u_texSource, _vctTexture + vec2(-u_vctTexel.x, -u_vctTexel.y)) * 2.0;
  return sum / 12.0;
}

vec3 apply(vec2 _vctTexture) {
  vec3 vctBloom = texture(u_texSource, _vctTexture).rgb;
  if (vctBloom.r >= 1.0 || vctBloom.g >= 1.0 || vctBloom.b >= 1.0) // maybe use threshold instead of 1.0?
    vctBloom = mix(vctBloom, vec3(1.0), u_fHighlightDesaturation);
  vctBloom = clamp(vctBloom * u_fIntensity, 0.0, 1.0);
  return vctBloom;
}

void main() {
  switch(u_iMode) {
    case 0:
      vctFrag.rgb = extract(v_vctTexture);
      vctFrag.a = 1.0;
      return;
    case 1:
      vctFrag = downsample(v_vctTexture);
      return;
    case 2:
      vctFrag = upsample(v_vctTexture);
      return;
    case 3:
      vctFrag.rgb = apply(v_vctTexture);
      vctFrag.a = 1.0;
      return;
    default:
      vctFrag = texture(u_texSource, v_vctTexture);
      return;
  }
}`;
    FudgeCore.shaderSources["ShaderGizmo.frag"] = `#version 300 es
/**
* ...
* @authors Jonas Plotzky, HFU, 2023
*/
precision mediump float;
precision highp int;

uniform vec4 u_vctColor;

out vec4 vctFrag;

// uniform sampler2D u_texDepthStencil;
#if defined(TEXTURE)
  uniform sampler2D u_texColor;
  in vec2 v_vctTexture;
#endif

// // 4x4 Bayer matrix for dithering
// const float mtxDither[16] = float[](
//   1.0 / 17.0,  9.0 / 17.0,  3.0 / 17.0, 11.0 / 17.0,
//   13.0 / 17.0,  5.0 / 17.0, 15.0 / 17.0,  7.0 / 17.0,
//   4.0 / 17.0, 12.0 / 17.0,  2.0 / 17.0, 10.0 / 17.0,
//   16.0 / 17.0,  8.0 / 17.0, 14.0 / 17.0,  6.0 / 17.0
// );

void main() {
  vctFrag = u_vctColor;

  #if defined(TEXTURE)

      vctFrag *= texture(u_texColor, v_vctTexture);

  #endif

  // int x = int(gl_FragCoord.x) % 4;
  // int y = int(gl_FragCoord.y) % 4;
  // int index = y * 4 + x;
  // // Discard the fragment if its alpha is less than the corresponding value in the dithering matrix
  // if (vctFrag.a < mtxDither[index]) 
  //   discard;

  // // Discard the fragment if its alpha is 0
  // if (vctFrag.a == 0.0)
  //   discard;

  // // Create a checkerboard pattern for alpha values less than 0.5
  // else if (vctFrag.a < 0.5 && ((x + y) % 2 == 0))
  //   discard;

  // vctFrag.a = 1.0;

  if (vctFrag.a < 0.01)
    discard;

  // premultiply alpha for blending
  vctFrag.rgb *= vctFrag.a;
}`;
    FudgeCore.shaderSources["ShaderGizmo.vert"] = `#version 300 es
/**
* ...
* @authors Jonas Plotzky, HFU, 2023
*/
precision mediump float;
precision highp int;

// uniform mat4 u_mtxViewProjection;
// uniform mat4 u_mtxModel;
uniform mat4 u_mtxMeshToView; // model-view-projection matrix

in vec3 a_vctPosition;

#if defined(TEXTURE)

  in vec2 a_vctTexture;
  out vec2 v_vctTexture;

#endif

void main() {
  gl_Position = u_mtxMeshToView * vec4(a_vctPosition, 1.0);

  #if defined(TEXTURE)

    v_vctTexture = a_vctTexture;

  #endif
}`;
    FudgeCore.shaderSources["ShaderPhong.frag"] = `#version 300 es
/**
* Phong shading
* @authors Jirka Dell'Oro-Friedl, HFU, 2022 | Roland Heer, HFU, 2023 | Jonas Plotzky, HFU, 2023
*/

precision mediump float;
precision highp int;

uniform vec4 u_vctColor;
uniform float u_fDiffuse;
uniform float u_fSpecular;
uniform float u_fIntensity;
uniform float u_fMetallic;
uniform vec3 u_vctCamera;

uniform bool u_bFog;
uniform vec4 u_vctFogColor;
uniform float u_fFogNear;
uniform float u_fFogFar;

in vec4 v_vctColor;
in vec3 v_vctPosition;

layout(location = 0) out vec4 vctFrag;
layout(location = 1) out vec4 vctFragPosition;
layout(location = 2) out vec4 vctFragNormal;

#ifdef PHONG

  in vec3 v_vctNormal;

#endif

#ifdef FLAT

  flat in vec3 v_vctPositionFlat;

#endif

struct Light {
  vec4 vctColor;
  mat4 mtxShape;
  mat4 mtxShapeInverse;
};

const uint MAX_LIGHTS_DIRECTIONAL = 15u;
const uint MAX_LIGHTS_POINT = 100u;
const uint MAX_LIGHTS_SPOT = 100u;

layout(std140) uniform Lights {
  uint u_nLightsDirectional;
  uint u_nLightsPoint;
  uint u_nLightsSpot;
  uint padding; // Add padding to align to 16 bytes
  Light u_ambient;
  Light u_directional[MAX_LIGHTS_DIRECTIONAL];
  Light u_point[MAX_LIGHTS_POINT];
  Light u_spot[MAX_LIGHTS_SPOT];
};

// TEXTURE: input UVs and texture
#ifdef TEXTURE

  in vec2 v_vctTexture;
  uniform sampler2D u_texColor;

#endif

// NORMALMAP: input UVs and texture
#ifdef NORMALMAP

  in vec3 v_vctTangent;
  in vec3 v_vctBitangent;
  uniform sampler2D u_texNormal;

#endif

// Returns a vector for visualizing on model. Great for debugging
vec4 showVectorAsColor(vec3 _vector, bool _clamp) {
  if(_clamp) {
    _vector *= 0.5;
    _vector += 0.5;
  }
  return vec4(_vector.x, _vector.y, _vector.z, 1);
}

void illuminateDirected(vec3 _vctDirection, vec3 _vctView, vec3 _vctNormal, vec3 _vctColor, inout vec3 _vctDiffuse, inout vec3 _vctSpecular) {
  vec3 vctDirection = normalize(_vctDirection);
  float fIllumination = -dot(_vctNormal, vctDirection);
  if(fIllumination > 0.0) {
    _vctDiffuse += u_fDiffuse * fIllumination * _vctColor;

    if(u_fSpecular <= 0.0)
      return;
      
    //BLINN-Phong Shading
    vec3 halfwayDir = normalize(-vctDirection - _vctView);
    float factor = max(dot(-vctDirection, _vctNormal), 0.0); //Factor for smoothing out transition from surface facing the lightsource to surface facing away from the lightsource
    factor = 1.0 - (pow(factor - 1.0, 8.0));                 //The factor is altered in order to clearly see the specular highlight even at steep angles, while still preventing artifacts

    _vctSpecular += pow(max(dot(_vctNormal, halfwayDir), 0.0), exp2(u_fSpecular * 5.0)) * u_fSpecular * u_fIntensity * factor * _vctColor;
  }
}

float getFog(vec3 _vctPosition) {
  float fDistance = length(_vctPosition - u_vctCamera); // maybe use z-depth instead of euclidean depth
  float fFog = clamp((fDistance - u_fFogNear) / (u_fFogFar - u_fFogNear), 0.0, 1.0);
  fFog = -pow(fFog, 2.0) + (2.0 * fFog); // lets fog appear quicker and fall off slower results in a more gradual falloff
  return fFog;
}

void main() {
  #if defined(PHONG) && !defined(FLAT)

    #ifdef NORMALMAP

      mat3 mtxTBN = mat3(normalize(v_vctTangent), normalize(v_vctBitangent), normalize(v_vctNormal));
      vec3 vctNormal = texture(u_texNormal, v_vctTexture).xyz * 2.0 - 1.0;
      vctNormal = normalize(mtxTBN * vctNormal);

    #else

      vec3 vctNormal = normalize(v_vctNormal);

    #endif

    vec3 vctView = normalize(v_vctPosition - u_vctCamera);
    vec3 vctPosition = v_vctPosition;

  #endif

  #ifdef FLAT

    vec3 vctFdx = dFdx(v_vctPosition);
    vec3 vctFdy = dFdy(v_vctPosition);
    vec3 vctNormal = normalize(cross(vctFdx, vctFdy));
    vec3 vctView = normalize(v_vctPositionFlat - u_vctCamera);
    vec3 vctPosition = v_vctPositionFlat;

  #endif

  vec3 vctDiffuse = u_fDiffuse * u_ambient.vctColor.rgb;
  vec3 vctSpecular = vec3(0, 0, 0);

  // calculate directional light effect
  for(uint i = 0u; i < u_nLightsDirectional; i++) {
    vec3 vctDirection = vec3(u_directional[i].mtxShape * vec4(0.0, 0.0, 1.0, 1.0));
    illuminateDirected(vctDirection, vctView, vctNormal, u_directional[i].vctColor.rgb, vctDiffuse, vctSpecular);
  }

  // calculate point light effect
  for(uint i = 0u; i < u_nLightsPoint; i++) {
    vec3 vctPositionLight = vec3(u_point[i].mtxShape * vec4(0.0, 0.0, 0.0, 1.0));
    vec3 vctDirection = vctPosition - vctPositionLight;
    float fIntensity = 1.0 - length(mat3(u_point[i].mtxShapeInverse) * vctDirection);
    if(fIntensity < 0.0)
      continue;

    illuminateDirected(vctDirection, vctView, vctNormal, u_point[i].vctColor.rgb * fIntensity, vctDiffuse, vctSpecular);
  }

  // calculate spot light effect
  for(uint i = 0u; i < u_nLightsSpot; i++) {
    vec3 vctPositionLight = vec3(u_spot[i].mtxShape * vec4(0.0, 0.0, 0.0, 1.0));
    vec3 vctDirection = vctPosition - vctPositionLight;
    vec3 vctDirectionInverted = mat3(u_spot[i].mtxShapeInverse) * vctDirection;
    if(vctDirectionInverted.z <= 0.0)
      continue;

    float fIntensity = 1.0 - min(1.0, 2.0 * length(vctDirectionInverted.xy) / vctDirectionInverted.z);    //Coneshape that is brightest in the center. Possible TODO: "Variable Spotlightsoftness"
    fIntensity *= 1.0 - pow(vctDirectionInverted.z, 2.0);                                                 //Prevents harsh lighting artifacts at boundary of the given spotlight
    if(fIntensity < 0.0)
      continue;

    illuminateDirected(vctDirection, vctView, vctNormal, u_spot[i].vctColor.rgb * fIntensity, vctDiffuse, vctSpecular);
  }

  vctFrag.rgb = vctDiffuse + vctSpecular * u_fMetallic;
  vctFrag.a = 1.0;

  #ifdef TEXTURE

    vec4 vctColorTexture = texture(u_texColor, v_vctTexture);
    vctFrag *= vctColorTexture;

  #endif

  vctFrag *= u_vctColor * v_vctColor;
  vctFrag.rgb += vctSpecular * (1.0 - u_fMetallic);

  vctFragPosition = vec4(v_vctPosition, 1.0); // don't use flat here, because we want to interpolate the position
  vctFragNormal = vec4(vctNormal, 1.0);

  if (u_bFog) 
    vctFrag.rgb = mix(vctFrag.rgb, u_vctFogColor.rgb, getFog(vctPosition) * u_vctFogColor.a);

  vctFrag.rgb *= vctFrag.a;

  if(vctFrag.a < 0.01)
    discard;
}`;
    FudgeCore.shaderSources["ShaderPick.frag"] = `#version 300 es
/**
* Renders for Raycasting
* @authors Jirka Dell'Oro-Friedl, HFU, 2019
*/
precision mediump float;
precision highp int;

uniform int u_id;
uniform vec2 u_vctSize;
uniform vec4 u_vctColor;
out ivec4 vctFrag;

void main() {
    int pixel = int(trunc(gl_FragCoord.x) + u_vctSize.x * trunc(gl_FragCoord.y));

    if (pixel != u_id)
      discard;

    uint icolor = uint(u_vctColor.r * 255.0) << 24 | uint(u_vctColor.g * 255.0) << 16 | uint(u_vctColor.b * 255.0) << 8 | uint(u_vctColor.a * 255.0);
                
    vctFrag = ivec4(floatBitsToInt(gl_FragCoord.z), icolor, 0, 0);
}`;
    FudgeCore.shaderSources["ShaderPick.vert"] = `#version 300 es
/**
* Renders for Raycasting
* @authors Jirka Dell'Oro-Friedl, HFU, 2019
*/
in vec3 a_vctPosition;       
uniform mat4 u_mtxMeshToView;

void main() {   
    gl_Position = u_mtxMeshToView * vec4(a_vctPosition, 1.0);
}`;
    FudgeCore.shaderSources["ShaderPickTextured.frag"] = `#version 300 es
/**
* Renders for Raycasting
* @authors Jirka Dell'Oro-Friedl, HFU, 2019
*/
precision mediump float;
precision highp int;

uniform int u_id;
uniform vec2 u_vctSize;
in vec2 v_vctTexture;
uniform vec4 u_vctColor;
uniform sampler2D u_texColor;

out ivec4 vctFrag;

void main() {
  int pixel = int(trunc(gl_FragCoord.x) + u_vctSize.x * trunc(gl_FragCoord.y));

  if (pixel != u_id)
    discard;
  
  vec4 vctColor = u_vctColor * texture(u_texColor, v_vctTexture);
  uint icolor = uint(vctColor.r * 255.0) << 24 | uint(vctColor.g * 255.0) << 16 | uint(vctColor.b * 255.0) << 8 | uint(vctColor.a * 255.0);
  
  vctFrag = ivec4(floatBitsToInt(gl_FragCoord.z), icolor, floatBitsToInt(v_vctTexture.x), floatBitsToInt(v_vctTexture.y));
}`;
    FudgeCore.shaderSources["ShaderPickTextured.vert"] = `#version 300 es
/**
* Renders for Raycasting
* @authors Jirka Dell'Oro-Friedl, HFU, 2019
*/
in vec3 a_vctPosition;       
in vec2 a_vctTexture;
uniform mat4 u_mtxMeshToView;
uniform mat3 u_mtxPivot;

out vec2 v_vctTexture;

void main() {   
  gl_Position = u_mtxMeshToView * vec4(a_vctPosition, 1.0);
  v_vctTexture = (u_mtxPivot * vec3(a_vctTexture, 1.0)).xy;
}`;
    FudgeCore.shaderSources["ShaderScreen.vert"] = `#version 300 es
precision mediump float;
precision highp int;
/**
 * Creates a fullscreen triangle which cotains the screen quad and sets the texture coordinates accordingly.
 * @authors Roland Heer, HFU, 2023 | Jirka Dell'Oro-Friedl, HFU, 2023 | Jonas Plotzky, HFU, 2023
 *
 *  2  3 .
 *       .  .
 *       .     .  
 *       .        .
 *  1  1 ..........  .
 *       . screen .     .
 *       .  quad  .        .
 *  0 -1 ..........  .  .  .  .
 *    p -1        1           3
 *  t    0        1           2
 *  
 *  p == postion
 *  t == texture coordinate
 */

uniform float u_width;
uniform float u_height;
uniform vec2 u_vctResolution;

out vec2 v_vctTexture;

#ifdef SAMPLE

  flat out vec2[9] v_vctOffsets;

#endif

void main() {
  float x = float((gl_VertexID % 2) * 4); // 0, 4, 0
  float y = float((gl_VertexID / 2) * 4); // 0, 0, 4
  gl_Position = vec4(x - 1.0, y - 1.0, 0.0, 1.0); // (-1, -1), (3, -1), (-1, 3)
  v_vctTexture = vec2(x / 2.0, y / 2.0);  // (0, 0), (2, 0), (0, 2) -> interpolation will yield (0, 0), (1, 0), (0, 1) as the positions are double the size of the screen

  #ifdef SAMPLE

    vec2 offset = vec2(1.0 / u_vctResolution.x, 1.0 / u_vctResolution.y);
    v_vctOffsets = vec2[](
      vec2(-offset.x, offset.y),  vec2(0.0, offset.y),  vec2(offset.x, offset.y),
      vec2(-offset.x, 0.0),       vec2(0.0, 0.0),       vec2(offset.x, 0.0),
      vec2(-offset.x, -offset.y), vec2(0.0, -offset.y),  vec2(offset.x, -offset.y)
    );

  #endif
}`;
    FudgeCore.shaderSources["ShaderUniversal.frag"] = `#version 300 es
/**
* Universal Shader as base for many others. Controlled by compiler directives
* @authors Jirka Dell'Oro-Friedl, HFU, 2021 | Jonas Plotzky, HFU, 2023
*/
precision mediump float;
precision highp int;

// MINIMAL
uniform vec4 u_vctColor;
uniform vec3 u_vctCamera; // needed for fog

layout(std140) uniform Fog {
  bool u_bFogActive;
  float u_fFogNear;
  float u_fFogFar;
  float fogPadding; // add padding to align to 16 bytes
  vec4 u_vctFogColor;
};

in vec3 v_vctPosition;
in vec4 v_vctColor;

layout(location = 0) out vec4 vctFrag;
layout(location = 1) out vec4 vctFragPosition; // TODO: make these optional?
layout(location = 2) out vec4 vctFragNormal;

#if defined(FLAT) || defined(GOURAUD) || defined(PHONG)

  in vec3 v_vctNormal;

#endif

#if defined(FLAT)

  flat in vec3 v_vctPositionFlat;

#endif

#if defined(GOURAUD)

    uniform float u_fMetallic;
    in vec3 v_vctDiffuse;
    in vec3 v_vctSpecular;

#endif

#if defined(PHONG) || defined(FLAT)

  uniform float u_fDiffuse;
  uniform float u_fSpecular;
  uniform float u_fIntensity;
  uniform float u_fMetallic;

  struct Light {
    vec4 vctColor;
    mat4 mtxShape;
    mat4 mtxShapeInverse;
  };

  const uint MAX_LIGHTS_DIRECTIONAL = 15u;
  const uint MAX_LIGHTS_POINT = 100u;
  const uint MAX_LIGHTS_SPOT = 100u;

  layout(std140) uniform Lights {
    uint u_nLightsDirectional;
    uint u_nLightsPoint;
    uint u_nLightsSpot;
    uint ligthsPadding; // Add padding to align to 16 bytes
    Light u_ambient;
    Light u_directional[MAX_LIGHTS_DIRECTIONAL];
    Light u_point[MAX_LIGHTS_POINT];
    Light u_spot[MAX_LIGHTS_SPOT];
  };

  void illuminateDirected(vec3 _vctDirection, vec3 _vctView, vec3 _vctNormal, vec3 _vctColor, inout vec3 _vctDiffuse, inout vec3 _vctSpecular) {
    vec3 vctDirection = normalize(_vctDirection);
    float fIllumination = -dot(_vctNormal, vctDirection);
    if(fIllumination > 0.0) {
      _vctDiffuse += u_fDiffuse * fIllumination * _vctColor;

      if(u_fSpecular <= 0.0)
        return;
        
      //BLINN-Phong Shading
      vec3 halfwayDir = normalize(-vctDirection - _vctView);
      float factor = max(dot(-vctDirection, _vctNormal), 0.0); //Factor for smoothing out transition from surface facing the lightsource to surface facing away from the lightsource
      factor = 1.0 - (pow(factor - 1.0, 8.0));                 //The factor is altered in order to clearly see the specular highlight even at steep angles, while still preventing artifacts

      _vctSpecular += pow(max(dot(_vctNormal, halfwayDir), 0.0), exp2(u_fSpecular * 5.0)) * u_fSpecular * u_fIntensity * factor * _vctColor;
    }
  }

#endif

#if defined(TEXTURE) || defined(MATCAP)

  uniform sampler2D u_texColor;
  in vec2 v_vctTexture;

#endif

#if defined(NORMALMAP)

  uniform sampler2D u_texNormal;
  in vec3 v_vctTangent;
  in vec3 v_vctBitangent;

#endif

#if defined(PARTICLE)

  uniform int u_iBlendMode;

#endif

float getFog(vec3 _vctPosition) {
  float fDistance = length(_vctPosition - u_vctCamera); // maybe use z-depth instead of euclidean depth
  float fFog = clamp((fDistance - u_fFogNear) / (u_fFogFar - u_fFogNear), 0.0, 1.0);
  fFog = -pow(fFog, 2.0) + (2.0 * fFog); // lets fog appear quicker and fall off slower results in a more gradual falloff
  return fFog * u_vctFogColor.a;
}

void main() {

  #if defined(FLAT)

    vec3 vctFdx = dFdx(v_vctPosition);
    vec3 vctFdy = dFdy(v_vctPosition);
    vec3 vctNormal = normalize(cross(vctFdx, vctFdy));
    vec3 vctView = normalize(v_vctPositionFlat - u_vctCamera);
    vec3 vctPosition = v_vctPositionFlat;

  #endif

  #if (defined(PHONG) || defined(GOURAUD)) && !defined(NORMALMAP)

    vec3 vctNormal = normalize(v_vctNormal);

  #endif

  #if defined(PHONG)

    vec3 vctView = normalize(v_vctPosition - u_vctCamera);
    vec3 vctPosition = v_vctPosition;

  #endif

  #if defined(NORMALMAP)

    mat3 mtxTBN = mat3(normalize(v_vctTangent), normalize(v_vctBitangent), normalize(v_vctNormal));
    vec3 vctNormal = texture(u_texNormal, v_vctTexture).xyz * 2.0 - 1.0;
    vctNormal = normalize(mtxTBN * vctNormal);

  #endif
  
  #if defined(FLAT) || defined(PHONG)

    vec3 vctDiffuse = u_fDiffuse * u_ambient.vctColor.rgb;
    vec3 vctSpecular = vec3(0, 0, 0);

    // directional lights
    for(uint i = 0u; i < u_nLightsDirectional; i++) {
      vec3 vctDirection = vec3(u_directional[i].mtxShape * vec4(0.0, 0.0, 1.0, 1.0));
      illuminateDirected(vctDirection, vctView, vctNormal, u_directional[i].vctColor.rgb, vctDiffuse, vctSpecular);
    }

    // point lights
    for(uint i = 0u; i < u_nLightsPoint; i++) {
      vec3 vctPositionLight = vec3(u_point[i].mtxShape * vec4(0.0, 0.0, 0.0, 1.0));
      vec3 vctDirection = vctPosition - vctPositionLight;
      float fIntensity = 1.0 - length(mat3(u_point[i].mtxShapeInverse) * vctDirection);
      if(fIntensity < 0.0)
        continue;

      illuminateDirected(vctDirection, vctView, vctNormal, u_point[i].vctColor.rgb * fIntensity, vctDiffuse, vctSpecular);
    }

    // spot lights
    for(uint i = 0u; i < u_nLightsSpot; i++) {
      vec3 vctPositionLight = vec3(u_spot[i].mtxShape * vec4(0.0, 0.0, 0.0, 1.0));
      vec3 vctDirection = vctPosition - vctPositionLight;
      vec3 vctDirectionInverted = mat3(u_spot[i].mtxShapeInverse) * vctDirection;
      if(vctDirectionInverted.z <= 0.0)
        continue;

      float fIntensity = 1.0 - min(1.0, 2.0 * length(vctDirectionInverted.xy) / vctDirectionInverted.z);    //Coneshape that is brightest in the center. Possible TODO: "Variable Spotlightsoftness"
      fIntensity *= 1.0 - pow(vctDirectionInverted.z, 2.0);                                                 //Prevents harsh lighting artifacts at boundary of the given spotlight
      if(fIntensity < 0.0)
        continue;

      illuminateDirected(vctDirection, vctView, vctNormal, u_spot[i].vctColor.rgb * fIntensity, vctDiffuse, vctSpecular);
    }

  #endif

  vec4 vctColor = u_vctColor * v_vctColor;
  vctColor.rgb *= vctColor.a; // premultiply alpha

  #if defined(GOURAUD)

    vec3 vctDiffuse = v_vctDiffuse;
    vec3 vctSpecular = v_vctSpecular;

  #endif

  #if defined(FLAT) || defined(GOURAUD) || defined(PHONG)

    vctFrag.rgb = vctDiffuse + vctSpecular * u_fMetallic;
    vctFrag.a = 1.0;

  #else

    // MINIMAL: set the base color
    vctFrag = vctColor;

  #endif

  #if defined(TEXTURE) || defined(MATCAP)
    
    // TEXTURE: multiply with texel color
    vec4 vctColorTexture = texture(u_texColor, v_vctTexture); // has premultiplied alpha by webgl
    vctFrag *= vctColorTexture;

  #endif

  #if defined(FLAT) || defined(GOURAUD) || defined(PHONG)

    vctFrag *= vctColor;
    vctFrag.rgb += vctSpecular * (1.0 - u_fMetallic);

    vctFragPosition = vec4(v_vctPosition, 1.0);
    vctFragNormal = vec4(vctNormal, 1.0);
  
  #endif

  #if !defined(PHONG) && !defined(FLAT) && !defined(GOURAUD) // MINIMAL

    vctFragPosition = vec4(0.0, 0.0, 0.0, 1.0); // (0, 0, 0) will treat occluders as non existing in ssao
    vctFragNormal = vec4(0.0, 0.0, 0.0, 1.0); // (0, 0, 0) normal will yield not occlusion in ssao
  
  #endif

  // discard pixel alltogether when transparent: don't show in Z-Buffer
  if(vctFrag.a < 0.01)
    discard;

  if (u_bFogActive) {
    float fFog = getFog(v_vctPosition);
    vctFrag.rgb /= vctFrag.a; // unpremultiply alpha
    vctFrag.rgb = mix(vctFrag.rgb, u_vctFogColor.rgb, fFog);

    #if defined(PARTICLE)

      if (u_iBlendMode == 2 || u_iBlendMode == 3 || u_iBlendMode == 4)  // for blend additive, subtractive, modulate
        vctFrag.a = mix(vctFrag.a, 0.0, fFog);                          // fade out particle when in fog to make it disappear completely

    #endif

    vctFrag.rgb *= vctFrag.a; // premultiply alpha
  }
}`;
    FudgeCore.shaderSources["ShaderUniversal.vert"] = `#version 300 es
/**
* Universal Shader as base for many others. Controlled by compiler directives
* @authors 2021, Luis Keck, HFU, 2021 | Jirka Dell'Oro-Friedl, HFU, 2021 | Jonas Plotzky, HFU, 2023
*/
precision mediump float;
precision highp int;

uniform mat4 u_mtxMeshToWorld; // needed for FOG
uniform mat4 u_mtxMeshToView;

in vec3 a_vctPosition;
in vec4 a_vctColor; // TODO: think about making vertex color optional

out vec3 v_vctPosition;
out vec4 v_vctColor;

#if defined(FLAT) || defined(GOURAUD) || defined(PHONG) || defined(PARTICLE) || defined(MATCAP)

  uniform vec3 u_vctCamera;

#endif

#if defined(FLAT) || defined(GOURAUD) || defined(PHONG)

  uniform mat4 u_mtxNormalMeshToWorld;

  in vec3 a_vctNormal;
  out vec3 v_vctNormal;

#endif

#if defined(FLAT)

  flat out vec3 v_vctPositionFlat;

#endif

#if defined(GOURAUD)

  uniform float u_fDiffuse;
  uniform float u_fSpecular;
  uniform float u_fIntensity;

  out vec3 v_vctDiffuse;
  out vec3 v_vctSpecular;

  struct Light {
    vec4 vctColor;
    mat4 mtxShape;
    mat4 mtxShapeInverse;
  };

  const uint MAX_LIGHTS_DIRECTIONAL = 15u;
  const uint MAX_LIGHTS_POINT = 100u;
  const uint MAX_LIGHTS_SPOT = 100u;

  layout(std140) uniform Lights {
    uint u_nLightsDirectional;
    uint u_nLightsPoint;
    uint u_nLightsSpot;
    uint padding; // Add padding to align to 16 bytes
    Light u_ambient;
    Light u_directional[MAX_LIGHTS_DIRECTIONAL];
    Light u_point[MAX_LIGHTS_POINT];
    Light u_spot[MAX_LIGHTS_SPOT];
  };

  void illuminateDirected(vec3 _vctDirection, vec3 _vctView, vec3 _vctNormal, vec3 _vctColor, inout vec3 _vctDiffuse, inout vec3 _vctSpecular) {
    vec3 vctDirection = normalize(_vctDirection);
    float fIllumination = -dot(_vctNormal, vctDirection);
    if(fIllumination > 0.0) {
      _vctDiffuse += u_fDiffuse * fIllumination * _vctColor;

      if(u_fSpecular <= 0.0)
        return;

      //BLINN
      vec3 halfwayDir = normalize(-vctDirection - _vctView);
      float factor = max(dot(-vctDirection, _vctNormal), 0.0); //Factor for smoothing out transition from surface facing the lightsource to surface facing away from the lightsource
      factor = 1.0 - (pow(factor - 1.0, 8.0));                 //The factor is altered in order to clearly see the specular highlight even at steep angles, while still preventing artifacts

      _vctSpecular += pow(max(dot(_vctNormal, halfwayDir), 0.0), exp2(u_fSpecular * 5.0)) * u_fSpecular * u_fIntensity * factor * _vctColor;

      //PHONG (old)
      // vec3 vctReflection = normalize(reflect(-vctDirection, _vctNormal));
      // float fHitCamera = dot(vctReflection, _vctView);
      // _vctSpecular += pow(max(fHitCamera, 0.0), u_fSpecular * 10.0) * u_fSpecular * _vctColor; // 10.0 = magic number, looks good... 
    }
  }

#endif

#if defined(TEXTURE) || defined(NORMALMAP)

  uniform mat3 u_mtxPivot;

  in vec2 a_vctTexture;
  out vec2 v_vctTexture;

#endif

#if defined(NORMALMAP)

  in vec4 a_vctTangent;
  out vec3 v_vctTangent;
  out vec3 v_vctBitangent;

#endif

// MATCAP: offer buffers for UVs and pivot matrix
#if defined(MATCAP) // MatCap-shader generates texture coordinates from surface normals
  
  uniform mat4 u_mtxWorldToCamera;
  uniform mat4 u_mtxNormalMeshToWorld;

  in vec3 a_vctNormal;
  out vec2 v_vctTexture;

#endif

#if defined(SKIN)

  // Bones https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/skinning_pars_vertex.glsl.js
  uniform mat4 u_mtxWorldToView;
  in uvec4 a_vctBones;
  in vec4 a_vctWeights;

  const uint MAX_BONES = 256u; // CAUTION: this number must be the same as in RenderInjectorSkeletonInstance where the corresponding buffers are created
  layout(std140) uniform Skin {
    mat4 u_mtxBones[MAX_BONES];
  };

#endif

#if defined(PARTICLE)

  uniform mat4 u_mtxWorldToView;
  uniform float u_fParticleSystemDuration;
  uniform float u_fParticleSystemSize;
  uniform float u_fParticleSystemTime;
  uniform sampler2D u_particleSystemRandomNumbers;
  uniform bool u_bParticleSystemFaceCamera;
  uniform bool u_bParticleSystemRestrict;

  mat4 lookAt(vec3 _vctTranslation, vec3 _vctTarget) {
    vec3 vctUp = vec3(0.0, 1.0, 0.0);
    vec3 zAxis = normalize(_vctTarget - _vctTranslation);
    vec3 xAxis = normalize(cross(vctUp, zAxis));
    vec3 yAxis = u_bParticleSystemRestrict ? vctUp : normalize(cross(zAxis, xAxis));
    zAxis = u_bParticleSystemRestrict ? normalize(cross(xAxis, vctUp)) : zAxis;

    return mat4(xAxis.x, xAxis.y, xAxis.z, 0.0, yAxis.x, yAxis.y, yAxis.z, 0.0, zAxis.x, zAxis.y, zAxis.z, 0.0, _vctTranslation.x, _vctTranslation.y, _vctTranslation.z, 1.0);
  }

  float fetchRandomNumber(int _iIndex, int _iParticleSystemRandomNumbersSize, int _iParticleSystemRandomNumbersLength) {
    _iIndex = _iIndex % _iParticleSystemRandomNumbersLength;
    return texelFetch(u_particleSystemRandomNumbers, ivec2(_iIndex % _iParticleSystemRandomNumbersSize, _iIndex / _iParticleSystemRandomNumbersSize), 0).r;
  }

#endif

void main() {

  vec4 vctPosition = vec4(a_vctPosition, 1.0);
  mat4 mtxMeshToWorld = u_mtxMeshToWorld;
  mat4 mtxMeshToView = u_mtxMeshToView;

  #if defined(FLAT) || defined(GOURAUD) || defined(PHONG) // only these work with particle and skinning

    mat4 mtxNormalMeshToWorld = u_mtxNormalMeshToWorld;

  #endif

  #if defined(PARTICLE)
  
    float fParticleId = float(gl_InstanceID);
    int iParticleSystemRandomNumbersSize = textureSize(u_particleSystemRandomNumbers, 0).x; // the dimension of the quadratic texture
    int iParticleSystemRandomNumbersLength = iParticleSystemRandomNumbersSize * iParticleSystemRandomNumbersSize; // the total number of texels in the texture
    /*$variables*/
    /*$mtxLocal*/
    /*$mtxWorld*/
    mtxMeshToWorld = /*$mtxWorld*/ mtxMeshToWorld /*$mtxLocal*/;
    if(u_bParticleSystemFaceCamera) mtxMeshToWorld = lookAt(vec3(mtxMeshToWorld[3][0], mtxMeshToWorld[3][1], mtxMeshToWorld[3][2]), u_vctCamera) *
      mat4(length(vec3(mtxMeshToWorld[0][0], mtxMeshToWorld[1][0], mtxMeshToWorld[2][0])), 0.0, 0.0, 0.0, 0.0, length(vec3(mtxMeshToWorld[0][1], mtxMeshToWorld[1][1], mtxMeshToWorld[2][1])), 0.0, 0.0, 0.0, 0.0, length(vec3(mtxMeshToWorld[0][2], mtxMeshToWorld[1][2], mtxMeshToWorld[2][2])), 0.0, 0.0, 0.0, 0.0, 1.0);
    mtxMeshToView = u_mtxWorldToView * mtxMeshToWorld;

    #if defined(FLAT) || defined(GOURAUD) || defined(PHONG)

      mtxNormalMeshToWorld = transpose(inverse(mtxMeshToWorld));

    #endif

  #endif

  #if defined(SKIN)

    mtxMeshToWorld = a_vctWeights.x * u_mtxBones[a_vctBones.x] +
      a_vctWeights.y * u_mtxBones[a_vctBones.y] +
      a_vctWeights.z * u_mtxBones[a_vctBones.z] +
      a_vctWeights.w * u_mtxBones[a_vctBones.w];

    mtxMeshToView = u_mtxWorldToView * mtxMeshToWorld;
    mtxNormalMeshToWorld = transpose(inverse(mtxMeshToWorld));

  #endif

  gl_Position = mtxMeshToView * vctPosition; 
  vctPosition = mtxMeshToWorld * vctPosition;

  v_vctColor = a_vctColor;
  v_vctPosition = vctPosition.xyz;

  #if defined(PARTICLE_COLOR)

    v_vctColor *= /*$color*/;

  #endif

  #if defined(FLAT)

    v_vctPositionFlat = v_vctPosition;
    
  #endif

  #if defined(FLAT) || defined(GOURAUD) || defined(PHONG)

    v_vctNormal = mat3(mtxNormalMeshToWorld) * a_vctNormal; // unnormalized as it must be normalized in the fragment shader anyway

  #endif 

  #if defined(NORMALMAP)

    v_vctTangent = mat3(mtxNormalMeshToWorld) * a_vctTangent.xyz;
    v_vctBitangent = cross(v_vctNormal, v_vctTangent) * a_vctTangent.w;

  #endif

  #if defined(GOURAUD)
  
    vec3 vctView = normalize(vctPosition.xyz - u_vctCamera);
    vec3 vctNormal = normalize(v_vctNormal);
    v_vctDiffuse = u_fDiffuse * u_ambient.vctColor.rgb;
    v_vctSpecular = vec3(0, 0, 0);

    // calculate directional light effect
    for(uint i = 0u; i < u_nLightsDirectional; i ++) {
      vec3 vctDirection = vec3(u_directional[i].mtxShape * vec4(0.0, 0.0, 1.0, 1.0));
      illuminateDirected(vctDirection, vctView, vctNormal, u_directional[i].vctColor.rgb, v_vctDiffuse, v_vctSpecular);
    }

    // calculate point light effect
    for(uint i = 0u;i < u_nLightsPoint;i ++) {
      vec3 vctPositionLight = vec3(u_point[i].mtxShape * vec4(0.0, 0.0, 0.0, 1.0));
      vec3 vctDirection = vctPosition.xyz - vctPositionLight;
      float fIntensity = 1.0 - length(mat3(u_point[i].mtxShapeInverse) * vctDirection);
      if(fIntensity < 0.0) continue;

      illuminateDirected(vctDirection, vctView, vctNormal, u_point[i].vctColor.rgb * fIntensity, v_vctDiffuse, v_vctSpecular);
    }

    // calculate spot light effect
    for(uint i = 0u;i < u_nLightsSpot;i ++) {
      vec3 vctPositionLight = vec3(u_spot[i].mtxShape * vec4(0.0, 0.0, 0.0, 1.0));
      vec3 vctDirection = vctPosition.xyz - vctPositionLight;
      vec3 vctDirectionInverted = mat3(u_spot[i].mtxShapeInverse) * vctDirection;
      if(vctDirectionInverted.z <= 0.0) continue;

      float fIntensity = 1.0 - min(1.0, 2.0 * length(vctDirectionInverted.xy) / vctDirectionInverted.z);    //Coneshape that is brightest in the center. Possible TODO: "Variable Spotlightsoftness"
      fIntensity *= 1.0 - pow(vctDirectionInverted.z, 2.0);                                                 //Prevents harsh lighting artifacts at boundary of the given spotlight
      if(fIntensity < 0.0) continue;

      illuminateDirected(vctDirection, vctView, vctNormal, u_spot[i].vctColor.rgb * fIntensity, v_vctDiffuse, v_vctSpecular);
    }

  #endif

    // TEXTURE: transform UVs
  #if defined(TEXTURE) || defined(NORMALMAP)

    v_vctTexture = vec2(u_mtxPivot * vec3(a_vctTexture, 1.0)).xy;

  #endif

  #if defined(MATCAP)

    vec4 vctVertexInCamera = normalize(u_mtxWorldToCamera * vctPosition);
    vctVertexInCamera.xy *= - 1.0;
    mat4 mtx_RotX = mat4(1, 0, 0, 0, 0, vctVertexInCamera.z, vctVertexInCamera.y, 0, 0, - vctVertexInCamera.y, vctVertexInCamera.z, 0, 0, 0, 0, 1);
    mat4 mtx_RotY = mat4(vctVertexInCamera.z, 0, - vctVertexInCamera.x, 0, 0, 1, 0, 0, vctVertexInCamera.x, 0, vctVertexInCamera.z, 0, 0, 0, 0, 1);

    vec3 vctNormal = mat3(u_mtxNormalMeshToWorld) * a_vctNormal;

    // adds correction for things being far and to the side, but distortion for things being close
    vctNormal = mat3(mtx_RotX * mtx_RotY) * vctNormal;

    vec3 vctReflection = normalize(mat3(u_mtxWorldToCamera) * normalize(vctNormal));
    vctReflection.y = - vctReflection.y;

    v_vctTexture = 0.5 * vctReflection.xy + 0.5;

  #endif
}`;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    var Shader_1;
    let Shader = class Shader {
        static { Shader_1 = this; }
        static { this.baseClass = Shader_1; }
        static { this.subclasses = []; }
        static getCoat() { return FudgeCore.CoatColored; }
        static getVertexShaderSource() {
            return this.insertDefines(FudgeCore.shaderSources["ShaderUniversal.vert"], this.define);
        }
        static getFragmentShaderSource() {
            return this.insertDefines(FudgeCore.shaderSources["ShaderUniversal.frag"], this.define);
        }
        static deleteProgram() { }
        static useProgram() { }
        static createProgram() { }
        static registerSubclass(_subclass) { return Shader_1.subclasses.push(_subclass) - 1; }
        static insertDefines(_shader, _defines) {
            if (!_defines)
                return _shader;
            let code = "#version 300 es\n";
            for (let define of _defines)
                code += `#define ${define}\n`;
            return _shader.replace("#version 300 es", code);
        }
    };
    Shader = Shader_1 = __decorate([
        FudgeCore.RenderInjectorShader.decorate
    ], Shader);
    FudgeCore.Shader = Shader;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderAmbientOcclusion extends FudgeCore.Shader {
        static { this.define = []; }
        static getVertexShaderSource() {
            return this.insertDefines(FudgeCore.shaderSources["ShaderScreen.vert"], this.define);
        }
        static getFragmentShaderSource() {
            return this.insertDefines(FudgeCore.shaderSources["ShaderAmbientOcclusion.frag"], this.define);
        }
    }
    FudgeCore.ShaderAmbientOcclusion = ShaderAmbientOcclusion;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderBloom extends FudgeCore.Shader {
        static { this.define = []; }
        static getVertexShaderSource() {
            return this.insertDefines(FudgeCore.shaderSources["ShaderScreen.vert"], this.define);
        }
        static getFragmentShaderSource() {
            return this.insertDefines(FudgeCore.shaderSources["ShaderBloom.frag"], this.define);
        }
    }
    FudgeCore.ShaderBloom = ShaderBloom;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderFlat extends FudgeCore.Shader {
        static { this.iSubclass = FudgeCore.Shader.registerSubclass(ShaderFlat); }
        static {
            this.define = [
                "FLAT"
            ];
        }
        static getCoat() { return FudgeCore.CoatRemissive; }
    }
    FudgeCore.ShaderFlat = ShaderFlat;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderFlatSkin extends FudgeCore.Shader {
        static { this.iSubclass = FudgeCore.Shader.registerSubclass(ShaderFlatSkin); }
        static {
            this.define = [
                "FLAT",
                "SKIN"
            ];
        }
        static getCoat() { return FudgeCore.CoatRemissive; }
    }
    FudgeCore.ShaderFlatSkin = ShaderFlatSkin;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderFlatTextured extends FudgeCore.Shader {
        static { this.iSubclass = FudgeCore.Shader.registerSubclass(ShaderFlatTextured); }
        static {
            this.define = [
                "FLAT",
                "TEXTURE"
            ];
        }
        static getCoat() { return FudgeCore.CoatRemissiveTextured; }
    }
    FudgeCore.ShaderFlatTextured = ShaderFlatTextured;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderFlatTexturedSkin extends FudgeCore.Shader {
        static { this.iSubclass = FudgeCore.Shader.registerSubclass(ShaderFlatTexturedSkin); }
        static {
            this.define = [
                "FLAT",
                "TEXTURE",
                "SKIN"
            ];
        }
        static getCoat() { return FudgeCore.CoatRemissiveTextured; }
    }
    FudgeCore.ShaderFlatTexturedSkin = ShaderFlatTexturedSkin;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderGizmo extends FudgeCore.Shader {
        static { this.define = []; }
        static getVertexShaderSource() {
            return this.insertDefines(FudgeCore.shaderSources["ShaderGizmo.vert"], this.define);
        }
        static getFragmentShaderSource() {
            return this.insertDefines(FudgeCore.shaderSources["ShaderGizmo.frag"], this.define);
        }
    }
    FudgeCore.ShaderGizmo = ShaderGizmo;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderGizmoTextured extends FudgeCore.Shader {
        static { this.define = ["TEXTURE"]; }
        static getVertexShaderSource() {
            return this.insertDefines(FudgeCore.shaderSources["ShaderGizmo.vert"], this.define);
        }
        static getFragmentShaderSource() {
            return this.insertDefines(FudgeCore.shaderSources["ShaderGizmo.frag"], this.define);
        }
    }
    FudgeCore.ShaderGizmoTextured = ShaderGizmoTextured;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderGouraud extends FudgeCore.Shader {
        static { this.iSubclass = FudgeCore.Shader.registerSubclass(ShaderGouraud); }
        static {
            this.define = [
                "GOURAUD"
            ];
        }
        static getCoat() { return FudgeCore.CoatRemissive; }
    }
    FudgeCore.ShaderGouraud = ShaderGouraud;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderGouraudSkin extends FudgeCore.Shader {
        static { this.iSubclass = FudgeCore.Shader.registerSubclass(ShaderGouraudSkin); }
        static {
            this.define = [
                "GOURAUD",
                "SKIN"
            ];
        }
        static getCoat() { return FudgeCore.CoatRemissive; }
    }
    FudgeCore.ShaderGouraudSkin = ShaderGouraudSkin;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderGouraudTextured extends FudgeCore.Shader {
        static { this.iSubclass = FudgeCore.Shader.registerSubclass(ShaderGouraudTextured); }
        static {
            this.define = [
                "GOURAUD",
                "TEXTURE"
            ];
        }
        static getCoat() { return FudgeCore.CoatRemissiveTextured; }
    }
    FudgeCore.ShaderGouraudTextured = ShaderGouraudTextured;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderGouraudTexturedSkin extends FudgeCore.Shader {
        static { this.iSubclass = FudgeCore.Shader.registerSubclass(ShaderGouraudTexturedSkin); }
        static {
            this.define = [
                "GOURAUD",
                "TEXTURE",
                "SKIN"
            ];
        }
        static getCoat() { return FudgeCore.CoatRemissiveTextured; }
    }
    FudgeCore.ShaderGouraudTexturedSkin = ShaderGouraudTexturedSkin;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderLit extends FudgeCore.Shader {
        static { this.iSubclass = FudgeCore.Shader.registerSubclass(ShaderLit); }
        static { this.define = []; }
    }
    FudgeCore.ShaderLit = ShaderLit;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderLitSkin extends FudgeCore.Shader {
        static { this.iSubclass = FudgeCore.Shader.registerSubclass(ShaderLitSkin); }
        static {
            this.define = [
                "SKIN"
            ];
        }
    }
    FudgeCore.ShaderLitSkin = ShaderLitSkin;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderLitTextured extends FudgeCore.Shader {
        static { this.iSubclass = FudgeCore.Shader.registerSubclass(ShaderLitTextured); }
        static {
            this.define = [
                "TEXTURE"
            ];
        }
        static getCoat() { return FudgeCore.CoatTextured; }
    }
    FudgeCore.ShaderLitTextured = ShaderLitTextured;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderLitTexturedSkin extends FudgeCore.Shader {
        static { this.iSubclass = FudgeCore.Shader.registerSubclass(ShaderLitTexturedSkin); }
        static {
            this.define = [
                "TEXTURE",
                "SKIN"
            ];
        }
        static getCoat() { return FudgeCore.CoatTextured; }
    }
    FudgeCore.ShaderLitTexturedSkin = ShaderLitTexturedSkin;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderMatCap extends FudgeCore.Shader {
        static { this.iSubclass = FudgeCore.Shader.registerSubclass(ShaderMatCap); }
        static {
            this.define = [
                "MATCAP"
            ];
        }
        static getCoat() { return FudgeCore.CoatTextured; }
    }
    FudgeCore.ShaderMatCap = ShaderMatCap;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderPhong extends FudgeCore.Shader {
        static { this.iSubclass = FudgeCore.Shader.registerSubclass(ShaderPhong); }
        static {
            this.define = [
                "PHONG"
            ];
        }
        static getCoat() { return FudgeCore.CoatRemissive; }
    }
    FudgeCore.ShaderPhong = ShaderPhong;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderPhongSkin extends FudgeCore.Shader {
        static { this.iSubclass = FudgeCore.Shader.registerSubclass(ShaderPhongSkin); }
        static {
            this.define = [
                "PHONG",
                "SKIN"
            ];
        }
        static getCoat() { return FudgeCore.CoatRemissive; }
    }
    FudgeCore.ShaderPhongSkin = ShaderPhongSkin;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderPhongTextured extends FudgeCore.Shader {
        static { this.iSubclass = FudgeCore.Shader.registerSubclass(ShaderPhongTextured); }
        static {
            this.define = [
                "PHONG",
                "TEXTURE"
            ];
        }
        static getCoat() { return FudgeCore.CoatRemissiveTextured; }
    }
    FudgeCore.ShaderPhongTextured = ShaderPhongTextured;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderPhongTexturedNormals extends FudgeCore.Shader {
        static { this.iSubclass = FudgeCore.Shader.registerSubclass(ShaderPhongTexturedNormals); }
        static {
            this.define = [
                "PHONG",
                "TEXTURE",
                "NORMALMAP"
            ];
        }
        static getCoat() { return FudgeCore.CoatRemissiveTexturedNormals; }
    }
    FudgeCore.ShaderPhongTexturedNormals = ShaderPhongTexturedNormals;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderPhongTexturedNormalsSkin extends FudgeCore.Shader {
        static { this.iSubclass = FudgeCore.Shader.registerSubclass(ShaderPhongTexturedNormalsSkin); }
        static {
            this.define = [
                "PHONG",
                "TEXTURE",
                "NORMALMAP",
                "SKIN"
            ];
        }
        static getCoat() { return FudgeCore.CoatRemissiveTexturedNormals; }
    }
    FudgeCore.ShaderPhongTexturedNormalsSkin = ShaderPhongTexturedNormalsSkin;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderPhongTexturedSkin extends FudgeCore.Shader {
        static { this.iSubclass = FudgeCore.Shader.registerSubclass(ShaderPhongTexturedSkin); }
        static {
            this.define = [
                "PHONG",
                "TEXTURE",
                "SKIN"
            ];
        }
        static getCoat() { return FudgeCore.CoatRemissiveTextured; }
    }
    FudgeCore.ShaderPhongTexturedSkin = ShaderPhongTexturedSkin;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderPick extends FudgeCore.Shader {
        static { this.define = []; }
        static getVertexShaderSource() {
            return this.insertDefines(FudgeCore.shaderSources["ShaderPick.vert"], this.define);
        }
        static getFragmentShaderSource() {
            return this.insertDefines(FudgeCore.shaderSources["ShaderPick.frag"], this.define);
        }
    }
    FudgeCore.ShaderPick = ShaderPick;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderPickTextured extends FudgeCore.Shader {
        static { this.define = []; }
        static getVertexShaderSource() {
            return this.insertDefines(FudgeCore.shaderSources["ShaderPickTextured.vert"], this.define);
        }
        static getFragmentShaderSource() {
            return this.insertDefines(FudgeCore.shaderSources["ShaderPickTextured.frag"], this.define);
        }
    }
    FudgeCore.ShaderPickTextured = ShaderPickTextured;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    let MIPMAP;
    (function (MIPMAP) {
        MIPMAP[MIPMAP["CRISP"] = 0] = "CRISP";
        MIPMAP[MIPMAP["MEDIUM"] = 1] = "MEDIUM";
        MIPMAP[MIPMAP["BLURRY"] = 2] = "BLURRY";
    })(MIPMAP = FudgeCore.MIPMAP || (FudgeCore.MIPMAP = {}));
    let WRAP;
    (function (WRAP) {
        WRAP[WRAP["REPEAT"] = 0] = "REPEAT";
        WRAP[WRAP["CLAMP"] = 1] = "CLAMP";
        WRAP[WRAP["MIRROR"] = 2] = "MIRROR";
    })(WRAP = FudgeCore.WRAP || (FudgeCore.WRAP = {}));
    let Texture = class Texture extends FudgeCore.Mutable {
        #mipmap;
        #wrap;
        #hasTransparency;
        constructor(_name = "Texture") {
            super();
            this.idResource = undefined;
            this.textureDirty = true;
            this.mipmapDirty = true;
            this.wrapDirty = true;
            this.#mipmap = MIPMAP.CRISP;
            this.#wrap = WRAP.REPEAT;
            this.name = _name;
        }
        set mipmap(_mipmap) {
            this.#mipmap = _mipmap;
            this.mipmapDirty = true;
        }
        get mipmap() {
            return this.#mipmap;
        }
        set wrap(_wrap) {
            this.#wrap = _wrap;
            this.wrapDirty = true;
        }
        get wrap() {
            return this.#wrap;
        }
        get hasTransparency() {
            if (this.#hasTransparency != null)
                return this.#hasTransparency;
            let imageData;
            if (this.texImageSource instanceof ImageData) {
                imageData = this.texImageSource;
            }
            else {
                const canvas = document.createElement('canvas');
                canvas.width = this.texImageSource.width;
                canvas.height = this.texImageSource.height;
                const crc2 = canvas.getContext('2d');
                crc2.drawImage(this.texImageSource, 0, 0);
                imageData = crc2.getImageData(0, 0, this.texImageSource.width, this.texImageSource.height);
            }
            for (let i = 0; i < imageData.data.length; i += 4)
                if (imageData.data[i + 3] < 255)
                    return this.#hasTransparency = true;
            return this.#hasTransparency = false;
        }
        set hasTransparency(_hasTransparency) {
            this.#hasTransparency = _hasTransparency;
        }
        useRenderData(_textureUnit = 0) { }
        deleteRenderData() { }
        refresh() {
            this.textureDirty = true;
        }
        serialize() {
            let serialization = {
                idResource: this.idResource,
                name: this.name,
                mipmap: MIPMAP[this.#mipmap],
                wrap: WRAP[this.#wrap]
            };
            return serialization;
        }
        async deserialize(_serialization) {
            FudgeCore.Project.register(this, _serialization.idResource);
            this.name = _serialization.name;
            this.#mipmap = MIPMAP[_serialization.mipmap];
            this.#wrap = WRAP[_serialization.wrap];
            return this;
        }
        getMutator(_extendable) {
            let mutator = super.getMutator(true);
            mutator.mipmap = this.#mipmap;
            mutator.wrap = this.#wrap;
            return mutator;
        }
        getMutatorAttributeTypes(_mutator) {
            let types = super.getMutatorAttributeTypes(_mutator);
            if (types.mipmap)
                types.mipmap = MIPMAP;
            if (types.wrap)
                types.wrap = WRAP;
            return types;
        }
        reduceMutator(_mutator) {
            delete _mutator.idResource;
            delete _mutator.renderData;
            delete _mutator.textureDirty;
            delete _mutator.mipmapDirty;
            delete _mutator.mipmapGenerated;
            delete _mutator.wrapDirty;
        }
    };
    Texture = __decorate([
        FudgeCore.RenderInjectorTexture.decorate
    ], Texture);
    FudgeCore.Texture = Texture;
    class TextureImage extends Texture {
        constructor(_url) {
            super();
            this.image = null;
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
            return new Promise((_resolve, _reject) => {
                this.image.addEventListener("load", () => {
                    this.renderData = null;
                    this.hasTransparency = null;
                    _resolve();
                });
                this.image.addEventListener("error", () => _reject());
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
        async mutate(_mutator, _selection = null, _dispatchMutate = true) {
            if (_mutator.url && _mutator.url != this.url.toString())
                await this.load(_mutator.url);
            delete (_mutator.url);
            await super.mutate(_mutator, _selection, _dispatchMutate);
        }
    }
    FudgeCore.TextureImage = TextureImage;
    class TextureBase64 extends Texture {
        constructor(_name, _base64, _mipmap = MIPMAP.CRISP, _wrap = WRAP.REPEAT, _width, _height) {
            super(_name);
            this.image = new Image();
            this.image.src = _base64;
            this.mipmap = _mipmap;
            if (_width)
                this.image.width = _width;
            if (_height)
                this.image.height = _height;
        }
        get texImageSource() {
            return this.image;
        }
    }
    FudgeCore.TextureBase64 = TextureBase64;
    class TextureCanvas extends Texture {
        constructor(_name, _crc2) {
            super(_name);
            this.crc2 = _crc2;
        }
        get texImageSource() {
            return this.crc2.canvas;
        }
    }
    FudgeCore.TextureCanvas = TextureCanvas;
    class TextureText extends Texture {
        #text;
        #font;
        constructor(_name, _text = "Text", _font = "20px monospace") {
            super(_name);
            this.crc2 = document.createElement("canvas").getContext("2d");
            this.text = _text;
            this.font = _font;
        }
        set text(_text) {
            this.#text = _text;
            this.textureDirty = true;
        }
        get text() {
            return this.#text;
        }
        set font(_font) {
            this.#font = _font;
            document.fonts.load(this.#font)
                .catch((_error) => FudgeCore.Debug.error(`${TextureText.name}: ${_error}`))
                .finally(() => this.textureDirty = true);
        }
        get font() {
            return this.#font;
        }
        get texImageSource() {
            return this.canvas;
        }
        get width() {
            return this.canvas.width;
        }
        get height() {
            return this.canvas.height;
        }
        get hasTransparency() {
            return true;
        }
        get canvas() {
            return this.crc2.canvas;
        }
        useRenderData(_textureUnit) {
            if (this.textureDirty) {
                this.crc2.font = this.font;
                let metrics = this.crc2.measureText(this.text);
                let width = metrics.width;
                let height = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
                this.canvas.width = width + this.crc2.measureText("  ").width;
                this.canvas.height = height * 1.1;
                if (this.canvas.width == 0)
                    return;
                this.crc2.font = this.font;
                this.crc2.textAlign = "center";
                this.crc2.textBaseline = "middle";
                this.crc2.fillStyle = "white";
                this.crc2.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.crc2.fillText(this.#text, this.canvas.width / 2, this.canvas.height / 2);
            }
            super.useRenderData(_textureUnit);
        }
        serialize() {
            return {
                [super.constructor.name]: super.serialize(),
                text: this.text,
                font: this.font
            };
        }
        async deserialize(_serialization) {
            await super.deserialize(_serialization[super.constructor.name]);
            this.text = _serialization.text;
            this.font = _serialization.font;
            return this;
        }
        getMutator(_extendable) {
            let mutator = super.getMutator(true);
            mutator.text = this.text;
            mutator.font = this.font;
            return mutator;
        }
    }
    FudgeCore.TextureText = TextureText;
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
        static { this.color = new TextureDefault("TextureDefault", TextureDefault.getColor(), FudgeCore.MIPMAP.MEDIUM); }
        static { this.normal = new TextureDefault("TextureNormalDefault", TextureDefault.getNormal(), FudgeCore.MIPMAP.MEDIUM); }
        static { this.iconLight = new TextureDefault("IconDefaultLight", TextureDefault.getIconLight(), FudgeCore.MIPMAP.BLURRY, FudgeCore.WRAP.CLAMP, 256, 256); }
        static { this.iconCamera = new TextureDefault("IconDefaultCamera", TextureDefault.getIconCamera(), FudgeCore.MIPMAP.BLURRY, FudgeCore.WRAP.CLAMP, 256, 256); }
        static { this.iconAudio = new TextureDefault("IconDefaultAudio", TextureDefault.getIconAudio(), FudgeCore.MIPMAP.BLURRY, FudgeCore.WRAP.CLAMP, 256, 256); }
        static getColor() {
            return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQCAYAAACAvzbMAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAADWLSURBVHhe7d0HnFTlvf/xH9uXZYGl9yrSRJpEUexYsJIba8Re498WNcZEb+41epOIsWs0Niyxm2g0duwaewO7oqJCAGnSt7H/8304B4dldpk5Z3b3zO7nzeu85pwzM8vMs7PPb35PO61qPBZjrVq18vfiKebFR/lFRPlFQ/lFE/fyy/FvAQBICwEEABAKAQQAEAp9IBHRhhoN5RcN5RdNSyg//YzCwkJr3bq1O169erXbMoEAEhF/wNFQftFQftE09/LLzc21Ll262E9+8hMbP368VVdX2+uvv27Tp093QSTq+yeARMQfcDSUXzSUXzTNtfxycnKspKTEBg0aZEceeaQdeuihtmLFCvvss89s3rx59vjjj9vDDz8cOROJHECqqqps9uzZtmzZMlu5cqVLldq1a2d9+/Z1+1HxAYyG8ouG8ouG8osmTPnl5+db9+7dbffdd7dTTz3V1cXvvvuuvfzyyy4DkVWrVtmNN95oS5YsccdhhQ4g5eXl9uyzz9qMGTNszZo1/tkfKQIq+u29995WWlrqn00fH8BoKL9oKL9oKL9o0ik/PbZNmza2xRZb2HHHHWeTJ0+2hQsX2pNPPmmLFy/2H7XOf/7zH7v11ltdPR5FqACyYMECu+eee1KKXmvXrrX99tvPRo8e7YJKuvgARkP5RROUnz67+iKUl5dnlZWVtnz58li8dj5/0TSn8lOT1b777msXXHCBde7c2V577TV78803k77Hb7/91u644w6rqKjwz4STdgBRtqHUJ4hoChCffPKJffXVV649rX379jZgwAC3BZQuTZo0ybbbbjuXXqWDD2A0lF80Qfl17NjRjjnmGOvUqZN988039sADD7gvUk39+vn8RdOcyq9r1642depU23rrre3RRx91X3JEdbSasIqLi23YsGHuXKYCSNopgXrvg+Ch/o/77rvPvVi9+J///Od29NFH29ChQ90LDGj4mNIlBZm4/8LQssycOdM1xb766qtJm2JF2UfPnj3t17/+tU2YMMF23XVXO/bYY11QQfM1f/58u+mmm1zfgfp44071sV6zPstB8FA9rC/8Tz31lOsXybS0MpAffvjBrr766vUdMUEfiFKm/fff38rKytan+MpGVPjBY/XHqezjrLPOcp3sqeIbTDSUX/3+8Ic/uM+r6EvQT3/6UzfsMSg33SqAqF35mWeesWuvvdadl4ceesjee+89/6hp8PmLpr7y06ilK6+80lXM0r9/fxs5cqT7glxQUODONbR0yi/4onPEEUe4Y420euedd9xgpqOOOsp23HFHNwpLmiQD+eCDDzboxX/77bddxnHggQdanz59rG3bti7bUIDo1q2b60APFBUV2XPPPReLtB9IRn9QL730Usodi7U7JtG8qEN6l1128Y/Mvv76a/vnP/9pf/7zn+3BBx+0L7/8MlZ1mZqq5s6d6z7H+qKjZivR+1DgCyYSZlJaAeSLL77w98w+//xz98IU7fTNLVmkHDFixAYd53q83lTUnn+gISjD1lD0VCuF4MsUmi/1J6hzWp+JYFPGqqZPVdSXXnqpy0w12ikO9JlUdrF06dL1n2NNJmyojCnlAKIX89133/lH5iKd2oPVrpYYJBKpOUujAQLqgHzrrbfqbGsGgDhR3TZu3LiN6rigctYXjldeecV947/++uvtjTfecK0zTSl4bY0h5QCib2dBW6BoCK+G5qpnvz7KTgJq2vr000/JQABkDTX/1FcpB/epA1v9Dmriuvvuu+3jjz9u9llqygGk9pwPRVkN1d3UsFwN6w2oj0RDIINOSwCIO9Vh6UyGVkBRE/+9995rF198cSz7SzIl5QBSOy1T770KVu1r9UkMMNpXlKbtGEA26d27d51N9ckoWKhfWF+WP/zwQ9dfctVVV7lBGmrNaS5SHsar4YoagRC4/PLL3WJc2267revrqItWfnziiSf8I7MrrrjCDS3TkLhU1O6cV2eQRnzFxWOPPebvxdNee+3l78VTU5Wfvsz06tXLTbwKMmLNadKowj333HP9Om4qP1Ucm2++ud12221uGHtA4+s18kWdrE2Fz180qZafRpxqCGzULCKoz3r06OG6ADQ8vL41A9MZxlsXDUvXcHX1QQfDzjM1jDflAKIp8YmFrXa+F154wUaNGlVvZFaweOSRR/yjdYFHHU36g0xF7QJUn8ovfvEL/wgIp0OHDi5Y6FthEEDU5DB8+HAbPHjwBpmzPoP6I5wyZYobdRO45ZZb3ECSVD/LQG2a3vCrX/2qzjq02QSQ2oHgsssuczMeNammvjdZO/Bccsklbo0WRd5U1P7ZajZLnF/S1PRtNc4Ss784aqryU3/cbrvt5r7QBAFE67tp3P/YsWPXD3tU+emPWxO0zj33XJdBBzRRdrPNNnP3NRU+f9GkWn6LFi1yQ2MzSavkaoSXvrTUpdkEEM04V2dQQDM0lYEoENT3JhVkNI1e1PehAKI3oW95qchEATakFIuvyVB+9Uucif73v//drZRw0EEHrR9dqPJTP5+aG1QZXnPNNe68qAlrzpw5/lHT4PMXTarlp+Z61Vthy1ufIdV/Wq1jzJgxtuWWW7ovMZuSifJryACScq9Q7YkomtWoP7xNFWjikN1gOZPE5gGgKSX236kvQ0PVEz/T+gPW8HNlJel0oqJ50UWY1N+VjqDyVx+HgoaWWD/ttNNcs2cqwSMbpPwXUXsYm2aVa8GuTRVq4iJkWvpBP2dTI7eAxpLYgakAohEyiaME9Y1RF+ZR81VcZhujcelLhQJIOtmAHjtw4EC3zJP6ODSYoCmbOhtKygEkcT6H6Pj777/fYHJhMonrBWkuiUa+1DdqC2hMiSvqqj9DQSLxM63mrD/96U8u+0hswkXLoTkdm2ppCYKLVuZQsFDQOOyww9zy6c35C3PKAURtwomLcamgtLRJfQFETVxa8iSg9mINwaUJC3GhjsyAPtMaqpk45+mPf/yja4ZVB3vU60cjO2kqQrLsI2jSVL2ozvCTTjrJTjjhBLe/qRU6GotedzqZU7pSDiAqrMS5G5qFrqn69a1rpdmXQQelaDVLdR5p6BoQB1qmIpFGxGg+iBbL0wSwp59+en3wUIdjpkfiIN70JXn27NnrM5CgQlYrihaL1WKyZ599trtgXuKyTU1Br0tdC5r0qC/qwaams2RzldSvrfv0eHWwh5FyAJEhQ4b4e+uGQeoCUXUtHKYC1yJjAf0S1L48fvz42ERnQJ/jbbbZxj9a90VJ/Xb/+Mc/3FUHP/roI/dZ1qJ5t99+e1ZcWAiZof5djb5KpC/Rutb4Oeec42513JDf8NOhTEiXtL3zzjvdnKZgu+GGG2yHHXbY4HUGCYEWgNTjzz//fLfwbbrvJa0Aojkfif0XmkSoIbq1U3v9wWmJYw0VC2juhx6vSVc0YSFOJk6c6EZaJcumVYkoG9HwXV3LRkMiAyzJ07xp3T7182rSqT4jv/zlL+3www93rShxrMPUsqM6Vv3TGq6rS2do/p4mbmsVEV16PKBgoStrqpVI13lSP83JJ5+c9qoKaV2RUPSCFJWDSKUmKnU+brXVVi4CqqNcLz5x6Xcdawy9Jh8q5UvnRcYlutclzeJrdJRfanT1Oa2gqm9sCgz6oqSMWX90weVBdU7zl9RMoM93U88BET5/0dRXfrpP9ZkCSFNJp/xUryor0kTr4MqD6dI8PWXbqUo7gIjWvldkTuXNaQSDLv25xx57uFm/am9Lp1CoAKOh/FKnIKLhmlo9YdasWa65Skv2JL5Gpf4qU51Ld15AQ+DzF01zKz99uTn44IPdaFf12aXz/jRiVs1d6QgVQNTvoWwiSO+SUWej/hC1CJkWXNTjNWs93SFtfACjofzSpyZZZdYKEJoHEmd8/qJpbuWnxysTUXNW7TlNm6KySLc8QgUQ0bezJ5980i0opzRPzVd68foWp0imFF/XRT/kkEPconUatRVm/gcfwGgov2gov2gov2jiXn6hA4jom5qChYbz6kqDSv81L0STszR8TB066nTUSJdgzHS6+ABGQ/lFQ/lFQ/lF06wDSEDpvtrbFDz049RMpVEKWiYiagHwAYyG8ouG8ouG8osm7uWXkQDSkPgARkP5RUP5RUP5RRP38gvXrgQAaPEIIACAUAggAIBQ1MAW70bAda8RIY0dOzbuv99Ye+vtt/09hNEq5n0McRf30iMDAQCEQgABAIRCAAEAhEIAAQCEQgABAIRCAAEAhJKRAKKrDOpKXVtvvbV/BgDQ3GUkgOhyoAMHDgx9YXYAQPahCQsAEEpGAkjcV7QEAGQeGQgAIBQCCAAgFAIIACCUjAaQuF89CwCQOWQgAIBQCCAAgFAyEkAYxgsALQ8ZCAAgFAIIACCUjAYQRmEBQMtBBgIACIUAAgAIhQACAAglIwGEYbwA0PKQgQAAQiGAAABCyWgAYRgvALQcZCAAgFAIIACAUAggAIBQMhJAGMYLAC0PGQgAIBQCCAAglIwGEIbxAkDLQQYCAAiFAAIACIUAAgAIJSMBhGG8ANDykIEAAELJUfYQdZs2bZr7YUcddVTS+6NsANBSaWRrnLeMZCD6QQCAloUmLABAKAQQAEAoGQ0g9FkAQMtBBgIACIUAAgAIhQACAAglIwGEYbwA0PKQgQAAQiGAAABCyWgAYRgvALQcZCAAgFAIIACAUAggAIBQMhJAGMYLAC0PGQgAIBQCCAAglIwGEIbxAkDLQQYCAAiFAAIACIUAAgAIJSMBhGG8ANDykIEAAEIhgAAAQsloAGEYLwC0HGQgAIBQCCAAgFAyEkAYhQUALQ8ZCAAgFAIIACAUAggAIJSMBhCG8QJAy0EGAgAIhQACAAglIwGEYbwA0PKQgQAAQiGAAABCIYAAAELJaABhGC8AtBzq/Y5c6w8bNswOOugg+/DDD+3+++/3z2aGF5R29ncRwoknnvicv4sQbvjrDf4ewqhpxZfKSGJefDRhAQBCyUgACZquGM4LAC0HGQgAIBQCCAAgFAIIACAUAggAIBQCCAAgFAIIACCUjAQQhvECQMtDBgIACIUAAgAIhQACAAiFAAIACIUAAgAIhQACAAglIwGEYbwA0PKQgQAAQiGAAABCIYAAAEIhgAAAQiGAAABCIYAAAELJSABhGC8AtDxkIACAUAggAIBQCCAAgFAIIACAUAggAIBQMhJAGIUFAC0PGQgAIBQCCAAgFAIIACAUAggAIBQCCAAgFAIIACCUjAQQhvECQMtDBgIACIUAAgAIhQACAAglR/0XUbfHH3/c/bA999wz6f1RNgBoqdSvHOeNDAQAEAoBBAAQCgEEABAKAQQAEAoBBAAQCgEEABBKRgKIhnMJw24BoOUgAwEAhEIAAQCEQgABAIRCAAEAhEIAAQCEkpEAwigsAGh5yEAAAKEQQAAAoRBAAAChEEAAAKEQQAAAoRBAAAChZCSAMIwXAFoeMhAAQCgEEABAKAQQAEAoBBAAQCgEEABAKAQQAEAoGQkgDOMFgJaHDAQAEEpGAkhubq67ra6udrcAgOYv5QCyYsUKu+OOO+zGG2+0e+65x5YvX+7fU7833njDpk2bZjfffLN9/PHH/lkAQLZLOYAoy5g9e7bNnTvXPv30U7vwwgvt888/t7Vr1/qP2Jgykmeffda++eYb++677+yqq67y7wEAZLuUA0hxcbH179/fPzJbvXq13X///S4zCQSd6YEvvvjCysvL3b6CycMPP+z2AQDZL60+kFGjRvl7Zp06dbLnnnuu3qasmTNn+ntmX375pS1btsw/AgBku7QCyODBg9d3mIv2P/vsM6uqqvLP/EjnlIEEPvroIxs3bpx/BADIdmkFkLy8PBsyZIh/tC6gPPPMM7Zq1Sr/zI/UPxI0X1VUVLhgMmnSJHcMAMh+aQUQGTNmjL9n1qFDB3vttdfWB5DEPpAPP/zQ3zPX6V5QUGATJ070zwAAsl3aAaRfv35WWFjoH5nbnzVrluskV5CQyspK17QVUDDZfvvtrUePHv4ZAEC2SzuA5OTk2JZbbukfmWvSevHFF12fh5q4RMFDQUQ0SkvDePfee28rLS115wAA2S/tACJjx47198zatm1rM2bMcPNB2rRp484lNl+p87ysrMy22247NxQYANA8qNMirRUQ27dvb6eccooLHEHfx5tvvmm9evWynXbayXbffXe77rrr1o/MuuGGG2z+/Pmhlzmpqam5wN9FCF75/4+/ixBOPPEEfw9h1NRsODcM6Yr3ArVpZyBqkpo+fboNHz7cP2M2dOhQN0u9T58+br5HEDy+//57N3OdNbIAoPlJO4AoOGhZksQlTNR0tWTJEmvXrp0bcRXQRMLas9MBAM1DqD4QzSh/6qmn3Gz0QPfu3e2DDz6wr7/+2h3r2iDqGwEANE+hAoiasTTyatCgQf4Zs80339ytvBs0X6lJa+nSpVxkCgCaqVABRM1XCxYssIULF65vomrdurXl5+e7fVE2krjsCQCgeQkVQCRoxurZs6d/Zt2KvaIsREN5yT4AoPkKHUA0hFfNWImz0gOaSKjl3uu7VggAILuFDiDKLtTPcdFFF7nFEoNgof4R9YVoxnoydZ0HAGSXtCcS1qZ+jhEjRriAoiG8a9as8e9JTo9PZ16I93OZSBgBEwmjYSJhNEwkjKqZTSSsTcFAo600A32fffbxz9aNSYUA0DykFEDUz6HOci1X0rVr1/WLJgYUFEpKStxEwoCaqrTcu56jVXg1SgsA0HykFEB0Yag5c+a4Geha1yqY61Ef9YksXrzYPUfLmSS76BQAIHvRow0ACCUjAYT5HgDQ8pCBAABCIYAAAEIhgAAAQsloAOHaHwDQcpCBAABCIYAAAELJSABhGC8AtDxkIACAUAggAIBQCCAAgFAyGkAYxgsALQcZCAAgFAIIACCUjAQQhvECQMtDBgIACIUAAgAIhQACAAglowGEYbwA0HKQgQAAQiGAAABCyUgAYRgvALQ8ZCAAgFAIIACAUDLahMUoLABoOchAAACh5Ch7iLq988477oeNHj066f1RNgBoqdSqE+eNDAQAEEpGAogikZAxAEDLQQYCAAiFAAIACIUAAgAIhQACAAiFAAIACIUAAgAIJSMBhGG8ANDykIEAAEIhgAAAQiGAAABCIYAAAEIhgAAAQiGAAABCyUgAYRgvALQ8ZCAAgFAIIACAUAggAIBQCCAAgFAIIACAUDISQBiFBQAtDxkIACAUAggAIBQCCAAglIz2gQAAWg4yEABAKAQQAEAoGQ0gDOMFgJaDDAQAEAoBBAAQCgEEABBKRgIIw3gBoOUhAwEAhEIAAQCEktEAwjBeAGg5yEAAAKEQQAAAoWQkgDAKCwBaHtX8kTsuOnbsaKeeeqotWrTIrr76av9sZtTU1Lzg7yKEt99+e0d/FyGMHTvW31un9pel2v1+TX1/bbUfX1tDPx/NG01YAIBQCCAAWhxlTm5bu3b9PtKXkQBC4QOIM9VRVZWVtmDed3bjn86xvYYUeFu+7TXUv/W2sw/byT5691WrqCi3tV5gwaaRgQD1UB9A4hZ8Ww22pr4fdVMQWLJogb3y9EN20j4jbd8tiu3IHfvZP6Zd5t27cdl9+NbLdtYh29v+I0rsoK272D9vv8YWzZ9r1dVV/iNQGwEEQLOhoPH15x/avX+92AWBn2/bwy465QD75ouP/EekZuWypXb9/51hU3boYz8b29Funvobm/Xxe14wqfYfAcloE5a+IQFAY1I/xgde9nDnNRfZz8aU2S+8bOPWy85zQSATylevtAduvsROmbyV+/l/u/r39sGbL/n3tmxkIACyRtB0t3Zttc1880Wbdul5tt+IEvvVYTt5Ffv/2hqvsm9I5WtWeYHq9/arKTvbvt7/e+c1F9pnM99ymU9LbFJUyhD5XZeVldnpp59uixcvtquuuso/mxneL4V5IBEwDySauM8D2ZTaz69tUz+voZ+fKv2c6qoqm/3FRzb9wdvtyQem2eqVy/x7m15Zp2626+TDbe9DT7DO3XtbTk5u2r+rbEQGAiCWgqAx5+vP7doLTrVjdx9ip0weaw/ddmWsgocsWTjPHrjpEjt610F2+s+2sTuvvcgWfz/P1lZXZyyIxhEBBECsqKP6hyUL7b4bptrpB4y34/YYao/efb0tmDvbf0S8qbP9zqsvsCN26mfnHrW7Pf+ve2zl8h+aZSAhgACIhVUrltkLj91nZx26g03ZvrfrCJ/18bv+vQ0nJ6eV5eXluvb8TFL2NPONF2zq2Ye7zOSCX0y2T99/w8rXrPYfkf1UZpHDIn0g8UUfSDRbbbWVv7dO7W+R6fZZNPT9tdV+fG1N/XzNsVgw5xu769qL7M0XHnOZR0MoLCiwfn172E4TxllJSZE7p5deXFxsnTuVWV5urpVXVNisr761Bx6abvMXLHKPyTSVl/pIdvuvo23Pg46xjl16bLIM40yvvP7fcArat29vZ5xxhi1ZssSuvPJK/2xmeB9AAkgEBJBoCCAN8/zKinI39Pa6C0+3ObM/d30FDaV3z67227OPd4FiU69X1IQ248PP7fJr77CVKxsuW8gvKLS+g4bbKf97rW02bLTl5uX592QPmrAANCr1ZRyz22D77dF72LdfftKgwSM/P8/O+eUx1qVzh5SCh+R62cioEYPt7FOP9M80DAXRLz58x844cFs7Yuf+9vF7r/n3ZA8CCIBGNfPZh2zN93P8o4bVyvtXVVW1yUyqNgWbFStX+UcNrcbWLJpnj175G/84exBAgHqo4kncVLEkbnG7v/ZW+/G1t2TPSdySPSdxS/acxC2ZZQvnWY82hda3pMCKc1PLCsKqqKy0s357qd121yP23sxPbekPyze5UKJe98LFS+3O+x71zzQcvf9+JfnWyysPVcZ1lVlc6bcX+RXTBxJf9IFEwwWloj0/mQcuOcteuv+v/pHZmqpqW7imylZVp/+zwiguKrRRWw62zp06WNvSEisoyHfnSloXu85zBZr3P/jMf3TDKMlrZZ0K86wwL9c/Y9ZryGg769YXLCcne77Xk4EAaFRVlRX+3jpFXiWqb+B9vW/ipV7F2tBWrym3V9+YYQ8/9rz97d5H7ZY7HrJrb7zXpl55q9129yMNGjza5udYvzYF1rOkcIPgITVa9TdEQG5KBBAAjaq6stLf25Aq1O5exdrfq2A7FGxYuWYzhcROhbk2oLTAurUusILc5NWuRn+FyeiaUkYDyKbSXSDb6DOduOkPPHFr6vuzUe0MpLZ8r4LtWJRnA0sLrYt3m60UArsVe++jbaGVFeZZ3iaaprJx2RMyEACNqrqq/gAiCpa5Oa2svVfxbuZVwD1b51t+lnw/LfZed+/WeTbAe91tC/Isxw/+m1KzVsOZCSAAUKdWrdKrdlQBl+TnWj8vI1H/QZu8HNcsFCd6R2X5Oda/tMB6e6+zOD8vpaCxgSxswMlIAMnWVBpA48vNz/f30qMKWf0H3b1sRBV1p4Jca4Q+93oVeDVo9+I87/UUWufWBZYfYQRVuoE1DrLvFQONKLG/QZsqscStqe/f1Fb7+bW3ZM9J3JI9J3FL9pzELZncvHABJKCfq/6EsqI8l5X09gJK61zv//Pvb2iqNNt6WZA6+/u2KbTSgjzX3BZVK+9n1FVmcUUAAdCoogaQgCpbNW8V5+daz5ICf/RWToP1lRR5FXxXL2gp++mqPhkvG8pkhb8uAyGAAECdkgWQbj262ennnW7Hn36cjdl6tBUUFPj3pMZlJW70Vr6XFRRYL6+Cb5MXPStRE1l7Lyip76W3t7UtyPWyjcwGjoALINkVPzIbQLIt/QLQ+JL1gRxw+M+8INLVBmw+wNs/wM6fep5tv+v2/r2pc1mJV8G39rKS7q0L3NyLLkW5VpTmkima8KcgpMDR2QtK6nvRz27IOq6VAhMZCNB8BJVGsG2qD6Cx789GyTKQ7j27+3vryjzfCzKTfrqn/fzYQ/2z6dPPUbbQvjDfevtNXJrQp47vZNp5QaNbUZ5t5k/4UxBSMNLPiapzt8625+Q9XYCsSyb+n8ZGAAHQqJIFkEULN76AkyrULUZvYWPHb7geWRguKHlZRAcvm+hXWmQDvSDRozjfunmbOuEVNLp6QaNtYV7G16KafMhkO+O8M2zH3XawY089xr2nZFrl5GZdEMlISWXrNyEAjS9ZAPlk5if+3oZUoU7ca1f/KHOUmbQpyHV9GuqEb4gFDPPy8uyYU462n0wY5/38dYFB/89BRx7o7qvNXVCqJQYQAEhVsgDyzOPPurWgkmlX1s7alLbxj7JDUXGRnfk/v7RBQwdtlFWoea5n357+UaJ1zZTZhAAC1KN2n4P+wBO3uN1fe6v9+Npbsuckbsmek7gle07ilkxOkgBSvqbc3nzlraTP0f/Ttn1b/yg7HHb8YVbWocw/2pDe4/IflvtH2Y0AAqBRFRS19vc29M97/2mzZ83eKIjoeFWjXR0wOmVLAwfV3Vm+cvlKW7xwsX+U3TLaB6JvCgBQn6KSUn9vY3+9/Aab/uh0W7li5fp6ZfaX39jSxUvdfjYYssVgN6s8GV0N8ZEH/uUfZT8yEACNqqik/uaoZx9/zi769f/Zf5/+O/vdL//H/nrZj1cvjD0vboz6ySj/YGPPPfG8zXh7hn+U/QggQD0S2/u16Vtx4tbU92ej0larrX1BlbdX/7XJ1aleWZH84lNxlZuTu8GcloB+V7O/nO2yq42ttTKvPIa3L/ePswcBBECjqlw616ssK214uworzMm+a2DUp3pttc35dq5/tC5wqNnqqUeetusvrZ1J1VhpXrWN9ALHMK88cltlXzkQQAA0qvJl6yYNti+ssTEdK2xASYXlumykGQQS7y1oMMCyH5a5wLFw/kKbdu2t9vyTz/sPkBor8gLn0LblNqKswtqkt+xXrBBAADSqtQmXtFVfc/eStbZVp3Lr07rSWjWDQLJowSK75HeX2MX/PdUuu+hy++KTL/x7aiy/1VobVFphoztUWIciNVH6d/myrVkyJ2hLjbLNmTPH/bAePXokvT/KBjSl4DOY+FlUX0Rw29T3B7Sf7FjPS3xu7eNAQz0/mbXVG1/SNs/7Ktu7TbVt1bHcuhVVeYFk4/8jm1RVVduypcu8AtNRjZdh1diANhU21nt/XYrXWrKJ7zVexuI/Yb2gHOO6ZSQD0Q8CmiN9tlVhxvU2G62tqrtjvCDXbGDbKu8b+hprl6eO9uwOJDne6+/tZVZjO66xbl7gyK2nxl1bWe4HkexBExZQj1Qq8aa8DTYdJ56Ly3EyNQlNWHUpzjMbXlZpo8vWWElu9nW0eyVgXQvXBY7eJdWW7wVGr1jqVbPWe591lFlcEUCAegSVYVxvs9Ha6tSG5npv0Vrnm43sUGFjvIxEHc95+XnWqUsn69Cpg/+oONHvo8ba51fZOC9wKJNSRqX3kYqamuzKPiSjASRbP9BAXeqrvONyG+zH8TiZ+pqwktGPUUaiEVtn/uo4O/N3v7Sz//csO/a0Y9O+cmHDqbE2edW2dac1bkhuKhlHbWq+8krPP8oOZCBAPYJKMa632Wht1aabsJJpXdbBynr2ce9d22aDB9qvLzrHiloX+Y9oCmvdXI6xXoY0skOlGwzgvbRwamjCApqVVCrxprwNNh0nnovLcTKpNmHVVrlqpZtbkah1SWs74oTD/aPGFEwCrLAtO1RY0caX90hbtnWgCwEEqEdQGcb1Nhul24QVqKootzkz3vKPftS5Y6kNbRd0tje0GmubX2Vbtl/jAkebgsz9DlwAybLfKQEEqEcqlXhT3wb7cTxOpiZkBiIzHrnXls3/cakQZSTvPXSXdSiscZ3tw7xA0rqBAomGFY9oX25btK+00gbpesm+LwQpBZA1a9bYypUr/aPwFi1aVOdVx4A4CirFuN5mo5y88LWvvqX/e9rVNv/zj6xizWp7+/5bbem3X7n7vCKxMi+QjNogkEQtIzVVrcs4NKy4rZdx6P9pCLomeoP98AaSUgB59tln7YorrrBXXnllozbIVKxatcoeeughu+aaa+yTT5Jf+xiIo1Qq8aa8DTYdJ56Ly3EyOfnROr2rytfYm3fdaE9d/Fub/8lM/+yPvP9+fSBRxtBm/YTEVIPJuse2dYFD61Up49B7W3dvQ8nJzXdll01SCiADBw60qqoqmz59ugskL7/8sq1YscK/d923NKn9gVHG8cQTT7jnvP/+++5x/fv39+8F4i+oDON6m41yCxpn1JRXRC5j2NILACPLyq19frW/REpd5eaVq7dpHsco7/FbNFLgCLTKVU98dgWQVt6HcJOfQmUdl1xyiWvKkuDD26lTJ+vbt68VFRW57KSwsNDGjx9vixcvtq+++sqWL19uOTk57vm63WyzzezQQw91PyMNL/i3COHtt9/e0d9FCGPHjt2o0o7brWhf4nqc6M2rTrCvnrrZP2o8eilrqs3mrc6179fkWWWNXqM2LXJYY52LqqxbcbUVNVFLUrv+I223K970MhHvBfiCcoyrlDIQVf5bbrml5fpvLPhQLFy40N5991179dVX3bECzIsvvmgzZ850wUOCJi/1fYwcOdLtA9lCf8D6vMf1NhtFbcIKyysyNyGxf2m1jelYbsPalVvXokp3q+N+bard/XpcU8j1yqVVslUWYyzlVztq1KikHeAKEEGQ0Ida+8k+2MpOBg8e7B8B2aG+yjsOt8Gm48RzcTlOprBtR3+v6WjCn/pJNmtb5W4jTQDMFO//V9llk5QDSPfu3a1jx/R/8foQKXNJzGCAbBFUhnG9zUYdNh/n7yFR6859/L3skVa+NHr0aPfBTYceT/MVslUqlXhT3wb7cTxOptuY3a3X9gf6R9mhbbee1nv01tZ3q+0stwHW32o/YLSNO+1G/yh7pBVAlEXow5EOPb5du3bWs2dP/wyQPYJKMa632SgnN8/Gn3O3bXH4RV4Bp1UFNbqi0nY27ufH24Tjz7SR+x1iI/Y+wHb6f7/1782Mntv9zHb988uW37rUP5M90vrtlZaWumG4+vCmSh3wYTIXIA5SqcSb8jbYdJx4Li7HddFjhh38G9vpD89YbnFmK8784hJrlYHmcmUdO53yG+s6aJirxwKFrUsyFviGT7nAtv313Y02tDnT0i4FBYOg0zwV+hApcwGyUVAZxvU223UZsYPtfdNn1mXURP9MNNsc/gvb45yLbNJvp9r4o06xjgM29+9Jj5qpfnLYCZZXUOif+VH5qpVexZb+hOpEuUUltvPFL9jwQ85fNwM9S6UdQIYOHZrWGvy9evWysrIy/wjILqlU4k19G+zH8TgVRe262I6/f9zGnPJX/0w4HfoMsE5+wFDG0LHvQNtmykleFvFbKyhJL8vpPXq8FdbxnMry1f5eOF1GTrR9b/3GOg+f4J/JXmkHkLy8PBs+fLj7BemDsinKWIBsFVSKcb1tLjT/YbM9j7P97phrecVt/bPp6Tly49FdKqc2HTvb1lNOTPmbvh43eOc93XOTKS5t5++lb9wZt9iOFz5uBW3a+2eyW6iGPM0JUTNWXQUcUJAZNmyYfwRkn1Qq8aa8DTYdJ56Ly3G6isq62uS7F9jQg8/zjtLrN61vdFTbrj1s2G77+Uf1K+3aPWnT1Y/S788t7TXE9r1jjvWfeKQLls1FqHfSp08fN7KqPvoQDRkyxC1zAmSroDKM621zlJOXb1tMucAm3fipFXVIffTm3Jnv+nsbU3l17L9ZSpV3aefu7vHJVJavsVduvtw/2rRWufmuo3yPa963ovZd/bPNR6gAosLVvI66Cln04WbuB7JdfZV3XG6D/Tgeh6Xntuk2wPa+ZZYNmHSif7Z+S7772tbWc7mIVJdLX7FovnsPibSM/PdffW5PX/LftmLhAv9s/Up7D7VJf/3EhnnZVE5eXqTyiKvQuZSCQ+1CTqTMQ4snAtksqBTjetuc6T3metnI2JOvtYlXvGGtu9W/knflqhX29n3T6iyXvMJCy0mhH+SHOd/YdzPesuqqSvezlsz51p658vf2+u1/8QKUloavn7KOQfuf7mUd73lBsJ97H81VSqvx1uXGG2+0uXN/vDpYQEuWjBs3zvbYYw//TCSsxhsBq/FGE/fVeAM6luBcXI4zqWZttb138zn2+b+uMa92989urPuwUTZ8z8luEmCilYsX2gvXXWxrqzYdBETLq+cXFlmFF5hS1W7AKNv67DusnZd9BGURRSZ+RkOK1JszZswYf29DWrqEuR9oDvQHrMowrrctiZqgRh33Z5t46WvWtt8W/tmN/eej92z6Fb+3L15+1qor110+V01bs/79XMrBQ2q8IJVq8NAKwyOO/pPtfuVb1r7PMPf7aQkiZSDl5eU2derUjSYWdujQwU499VT/KDIykAjIQKLheiCZOc40NSV99tAVNuO287yDuoNCbkGhte3ey8qX/2CrvAykIXQctp1tfeZt1mYTTWxhBOUYV5EyEC3RromFiW9S+3VlJkC20edZlWBcb1sqrac1+L/Oskk3fGxlm431z26suqLclsye1SDBQ9d23+acu2yXi59vkOCRDSIFEKm9wKL2R4wY4R8B2S1ZpR2n22DTceK5uBw3JP0/pd0G2K6X/tu2Ofce13ndWHptf5Dt+7e51meHg73XEbkazVqR37lGWiXO9RgwYIC1bRtuJikQN0FlGNdbrMtG+kw40Pa/a4H12ekw70zDNfvkFZfaxCvfsvFe5lHYhiWaIgcQzTbXzHR9oLUx9wPNSSqVeFPfBvtxPG5MBSVtbZuzb7c9/jLT8ks7+GczQ81VY065zibf/b11GMjq4oGM5F7BnBAFE80+B5qLoFKM6y021q7PUNv/znk2+IBfu4o/Eq+c2w8ca/vfvdAG7nG8myWPH2UkgHTr1s26du3q+j7SWakXiLtUKvGmvA02HSeei8txU9GEwZFH/cH28wJJx2ETXCBIly4xu8slL9tuV7y+7hojIX5GcxdpGG8iDenVSr0NcN1zhvFGwDDeaLbaaqv1FWNcb0X7ErfjuJj33jP29jUn2cp5X/pn6pbXuq1bv2rzfU/x3k/TdpAH5RlXGSsdDeltgOABNClVhPojjvNtsB/H47joNmpXm3T9R15g+L3lFrXxz9bivd5+E4+2/f82zwbvd5p32LTBIxtQQkA9gkoxrrdInfovhh9ynrvmyKD9z/DPrrPZ3ifb5HsW2U/OuMlNPkRqMtaE1YBowoqAJqxoWAsr2nGcVa5ebnNe/af1mnCA5cX0muRBecYVGQhQD/0BqzKM6y3Cyy8utX67TIlt8MgGCm+x/hTG/Y9Ef8hxRvlFQ/lFQ/lFE/fyIwMBAIRCAAGAFkDZzIoVK9xWn4qKClu6dKlVpbD0PU1YEZECR0P5RUP5RdOcyu/xxx+3N954wzp37mwnn3yyf3adjz76yJ588klbtmyZO9YlN/bZZx/r3//HVYRXrVpl//rXv+yTTz5x/6+mZWiZqkmTJtU5RYMMBACy3H/+8x978803rayszGUQiWbPnm0PPPCA9e3b10488UQ7/PDD3aTvu+++23744Qf/UWb33Xefe+yBBx5oJ510kk2YMEGjOG369On+IzYWOYAoMnXs2NH69OnjNr0BAEDjULbw6KOP2rBhw6xXr17+2R+9+OKL1q5dO5s8ebJbdkorpv/0pz+1yspKe+edd9xjvv76axc8dt99d3eNJy1NtdNOO9mgQYPsrbfeqrM5K3QAUepXUlJiW2yxhZ1zzjl2zz332J133mmnnHKKS4/inhoCQHPw/vvv24IFC1zlX5uuFqvgMHDgQLfYbUCBRJfd+O6779zxl1+uW+JFASPR5ptv7oKHfn4yoQKI0p8ePXq4iHbDDTe4tEjR7IMPPnAZyHHHHeciHgCg4WgNQjUx7bDDDkmvw6QOcwURtRLVprp65cqVbl99I8XFxda6dWt3HAhalOrqeE8rgCiC6UXqkrXnn3++XXHFFa7DRm1pzz33nM2fP9+9EL2p6upq/1kAgIagelfrEI4fP94/s6EgQOgxtemcOs5Fj6vrMbJ69Wp3W1vKAUTBQ2nPlClTbNq0aXbwwQfbu+++65qtFDgS6UUpiAAAGsb333/vOs733HPPTS5kqywkmcTn1felP/IoLGUeRx55pF144YUumNx2223273//2/2n6sRZs2aN/8h1nTrpDD8DAKRHw3LV2d2mTRs3CkubMgXVydpXnRw0SSXWzwGdUz+2qPmqrsdI8LjaUg4gulCUrn/+4Ycf2r333rt++NeiRYtcE5bOAwAax7x581ygUD90sH3xxReuv0L7r732mgsgGtC0cOFC/1nr6Au+zrVv394dKwipHzuYJxJQ/S519WmnHEAUiTRJZcaMGe5YTVRPP/20/eUvf7Hly5fbtttu684DABqe5mqcdtppG2yDBw+20tJSt695HPn5+dazZ08XWBKH4s6aNct1NWiUlWiOiHz66afuVhRkVN936tTJjaxNJuUAosikobqa0fjtt9+6wPHKK6+4Tpbjjz/eZScAgMahrEGjpBI3tRSpi0H7Gi0r22+/veskD1qKXn/9dXvwwQddn7amYYgCiY41ouvVV191j9PEwrlz59rEiRPdY5LRZI2UOyuUCgWpTtBJruFhF110kXXv3t11qovGFquPRI+LKu59Kc1pKYSmQPlFQ/lF09zKTwFAlf4RRxzhn1lHUyxeeukl1yRVVFTkAoYCQ+KwXTV9PfXUUy5bUd3dpUsXF3yGDBniP2JjaQWQZPSfqGNd0YsAEj+UXzSUXzSUXzRxL7+Um7AAAEhEAAGAZk7NUpdffrnrelBWc8stt2Rk5CwBBACaOQ1yUj/1888/7xZQVEe7Fl+MigACAC3AXnvtZe+9955b/mS//fbLSP8PAQQAWgAN8dWmmerBEN+oCCAA0AJoiO6IESNs5MiR7uqFmUAAAYBmTtcE0exzLfu+8847u6kWunRtVAQQAGjmtBjuUUcd5ZqwtHrI0Ucf7S7FERUBBACaAfVtLFmyZP01PhJpLSvNOtcyVNq0Xlayi0yJlon/6quvbPHixf6ZuqkbPtJUR2aiM5M1CsovGsovmuZUflolXc1SWgdLiykm0qU3NPoqWFBRmcg+++zj+kQCChj333+/W+U3oEvhHnjggUkvNiVkIACQ5TRRUCvp6gt97aCjBXC1cvo222xj5557rp166qnukuQPPfTQ+mXedcEpLZZbUVHhLlH+m9/8xl2yXNdKf+KJJ9xjkkk7gGgCSrDpKlW6rSuKb+p+AEA0arpSJT9u3DgXQGpT9qH+jl122cVlEmrO2nfffV3QCFqNPv/8c9d0tfvuu7vWJGUoGq2lyYZa0l2BJZmUA4gCgdaFHzVq1AablgNO1pamK1gNHz7cvQilQXo+ACCzdOEoXYlQo6tqU5PVnDlzXB2c+EVeQUQXk9IFqWT27Nnu/n79+rnjwIABA1ygUXBJJuVaXb34xx57rEuFHnvssfXbXXfdZTvuuKOLggFNUhk6dKjdfvvt9sgjj7irY2kqPUEEADJH12l64YUX3NLsWqa9Ni3RLsGVBxPpnK4TInqcOtlr93UEVyIMHldbWhmIsor333/frr/+erddd9117sJS11xzzforFYpSoD322MO1sd1000324osv2pQpU1zPPwAgM/SFXs1Wag1KJqj4k3WC62qFylxEj1OzVW3B84LH1ZZyAFGEUsbx8ccf+2fSozQouAgVACCab775xq2oO2nSpA2apxIFrT6Jl7MNqLNdQUT0uLoeI8Hjaks5gKgTRR0uDzzwgC1YsMBmzpzpjlPdNIRM11UHAESnpUm6du1qP/zwgxtppU37qqu1v3Tp0vVXHExW9yqrUKuSFBcXJ31MMKdEV6JNRmErrYHaSnPU1pZuNqEMJMy8EMaRR0P5RUP5RUP5RVNf+V122WW2fPly/2hju+66qxu6+8c//tH1SR9wwAH+Pevq46lTp7rL1Wq4ri6F+8orr7j5I5pHEtBlcJ999lk788wzk3ZBpB1AGhsfwGgov2gov2gov2jSLb+///3vbiL36aef7p8xN6lbkwN1LuhoV5/1gw8+aIcccogNHjzYzTzXoCcFnQkTJrjHaGCU+riVnRx33HHuXG0MiwKAZkzzP9SsNW3aNJdlaCXehx9+2A3t3Xzzzd1jNHy3f//+rqtB97/88st28803uyYxDYiqCxlIRHwDjIbyi4byi6a5ld+rr77q5mzoglGJ1OGuCYWLFi1yWYgCx7bbbusmewfUxaAmK63aq32N7tpuu+3clQzrQgCJiD/gaCi/aCi/aCi/aGjCAgCEQgABAIRg9v8B4hMOpI+XltsAAAAASUVORK5CYII=";
        }
        static getNormal() {
            return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAFDmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS41LjAiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICAgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIgogICAgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iCiAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIKICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIgogICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgeG1wOkNyZWF0ZURhdGU9IjIwMjMtMDUtMDZUMjI6Mjg6MDYrMDIwMCIKICAgeG1wOk1vZGlmeURhdGU9IjIwMjMtMDUtMDZUMjI6MzA6MjErMDI6MDAiCiAgIHhtcDpNZXRhZGF0YURhdGU9IjIwMjMtMDUtMDZUMjI6MzA6MjErMDI6MDAiCiAgIHBob3Rvc2hvcDpEYXRlQ3JlYXRlZD0iMjAyMy0wNS0wNlQyMjoyODowNiswMjAwIgogICBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIgogICBwaG90b3Nob3A6SUNDUHJvZmlsZT0ic1JHQiBJRUM2MTk2Ni0yLjEiCiAgIGV4aWY6UGl4ZWxYRGltZW5zaW9uPSIxIgogICBleGlmOlBpeGVsWURpbWVuc2lvbj0iMSIKICAgZXhpZjpDb2xvclNwYWNlPSIxIgogICB0aWZmOkltYWdlV2lkdGg9IjEiCiAgIHRpZmY6SW1hZ2VMZW5ndGg9IjEiCiAgIHRpZmY6UmVzb2x1dGlvblVuaXQ9IjIiCiAgIHRpZmY6WFJlc29sdXRpb249IjcyLzEiCiAgIHRpZmY6WVJlc29sdXRpb249IjcyLzEiPgogICA8eG1wTU06SGlzdG9yeT4KICAgIDxyZGY6U2VxPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJwcm9kdWNlZCIKICAgICAgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWZmaW5pdHkgUGhvdG8gMiAyLjAuNCIKICAgICAgc3RFdnQ6d2hlbj0iMjAyMy0wNS0wNlQyMjozMDoyMSswMjowMCIvPgogICAgPC9yZGY6U2VxPgogICA8L3htcE1NOkhpc3Rvcnk+CiAgPC9yZGY6RGVzY3JpcHRpb24+CiA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgo8P3hwYWNrZXQgZW5kPSJyIj8+0IgVxAAAAYBpQ0NQc1JHQiBJRUM2MTk2Ni0yLjEAACiRdZHPK0RRFMc/M37mR6NYKBYvDauhQYmNxcivwmKMMtjMvPml5o3Xe2/SZKtsFSU2fi34C9gqa6WIlGxZExv0nOepkcy5nXs+93vvOd17LngjWVUzy4Og5SwjPBpSZqNzStUjFVTSRAu+mGrqk9MjEUra2w0eJ151OrVKn/vXahNJUwVPtfCgqhuW8JjwxLKlO7wp3KRmYgnhY+GAIRcUvnb0uMtPDqdd/nDYiISHwNsgrKR/cfwXqxlDE5aX49eyefXnPs5L6pK5mWmJbeKtmIQZJYTCOMMM0Uc3AzL30UkPXbKiRH7wO3+KJclVZdYpYLBImgwWAVHzUj0pMSV6UkaWgtP/v301U709bvW6EFQ82PZLO1RtwOe6bb/v2/bnAZTdw1mumL+0B/2voq8XNf8u+Fbh5LyoxbfgdA2a7/SYEfuWysS9qRQ8H0F9FBovoWbe7dnPPoe3EFmRr7qA7R3okPO+hS824WfQgxGCcgAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAxJREFUCJljaGj4DwADgwIAVbjWPwAAAABJRU5ErkJggg==";
        }
        static getIconLight() {
            return "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8' standalone='no'%3F%3E%3Csvg viewBox='0 0 16 16' version='1.1' width='16' height='16' id='Light' xmlns='http://www.w3.org/2000/svg'%3E%3Cstyle%3E .s%7Bfill:%23fff;stroke:%23000;stroke-width:.1px;%7D %3C/style%3E%3Crect class='s' x='0.17039293' y='10.002448' width='3.9000568' height='0.90009934' id='NNE' transform='rotate(-67.5)' /%3E%3Crect x='8.8295078' y='10.002447' width='3.9000568' height='0.90009934' id='ENE' transform='rotate(-22.5)' class='s' /%3E%3Crect x='14.952469' y='3.8795717' width='3.9000139' height='0.90009987' id='ESE' transform='rotate(22.5)' class='s' /%3E%3Crect x='14.95247' y='-4.7795429' width='3.9000139' height='0.90009987' id='SSE' transform='rotate(67.5)' class='s' /%3E%3Crect x='-12.729565' y='10.002447' width='3.9000139' height='0.90009987' id='SSW' transform='rotate(-67.5)' class='s' /%3E%3Crect x='-4.0704498' y='10.002447' width='3.9000139' height='0.90009987' id='WSW' transform='rotate(-22.5)' class='s' /%3E%3Crect x='2.0524685' y='3.8795717' width='3.9000139' height='0.90009987' id='WNW' transform='rotate(22.5)' class='s' /%3E%3Crect x='2.0524685' y='-4.7795429' width='3.9000139' height='0.90009987' id='NNW' transform='rotate(67.5)' class='s' /%3E%3Cellipse id='CENTER' cx='8.000082' cy='8.0002575' rx='3.4500823' ry='3.4502573' class='s' /%3E%3C/svg%3E";
        }
        static getIconCamera() {
            return "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8' standalone='no'%3F%3E%3Csvg id='Camera' viewBox='0 0 16 16' version='1.1' width='16' height='16' xmlns='http://www.w3.org/2000/svg'%3E%3Cstyle id='style1'%3E.s%7Bfill:%23fff;stroke:%23000;stroke-width:.1px;%7D %3C/style%3E%3Cpath class='s' d='M 13.857322,8.8755297 H 12.413424 L 12.413,6.787 h -1.425311 c 0.227026,-0.4494693 0.363243,-0.9453919 0.363243,-1.4885008 0,-1.7978775 -1.4075727,-3.2492893 -3.1511466,-3.2492893 -1.7435746,0 -3.1511479,1.4514118 -3.1511479,3.2492893 v 0.028093 C 4.5764194,5.0363118 4.0315524,4.8583968 3.4503606,4.8583968 1.7067863,4.8677567 0.29921298,6.3191723 0.29921298,8.107686 c 0,1.7885135 1.66538582,3.311789 3.42458512,3.249289 L 3.732,13.976 h 8.681 v -2.113368 h 1.444322 z' id='path1' /%3E%3Crect class='s' x='12.80391' y='8.3979683' width='2.8968766' height='3.8860376' rx='0' ry='0' id='rect1' /%3E%3C/svg%3E%0A";
        }
        static getIconAudio() {
            return "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8' standalone='no'%3F%3E%3Csvg id='Audio' viewBox='0 0 16 16' version='1.1' width='16' height='16' xmlns='http://www.w3.org/2000/svg'%3E%3Cstyle%3E.s%7Bfill:%23fff;stroke:%23000;stroke-width:.1px;%7D %3C/style%3E%3Cpath class='s' d='M 9.1563588,1.0804006 3.6729341,4.642017 H 0.54364971 v 6.784031 H 3.7590612 l 5.3972976,3.493776 z' id='path1' /%3E%3Cpath class='s' d='m 13.347518,13.676645 -0.765157,-0.563566 c 4.227485,-5.5605241 0.210418,-9.881202 0.03825,-10.0596648 l 0.698204,-0.6481019 c 0.04782,0.046964 4.75353,5.0627076 0.03825,11.2713327 z' id='path2' /%3E%3Cpath class='s' d='m 11.321868,11.79809 -0.822541,-0.479032 c 2.142434,-3.5786474 0.114773,-6.35891 0.02869,-6.4716232 l 0.765156,-0.5635666 c 0.105208,0.1408915 2.505883,3.3814001 0.02869,7.5048298 z' id='path3' /%3E%3C/svg%3E%0A";
        }
    }
    FudgeCore.TextureDefault = TextureDefault;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    let LOOP_MODE;
    (function (LOOP_MODE) {
        LOOP_MODE["FRAME_REQUEST"] = "frameRequest";
        LOOP_MODE["FRAME_REQUEST_XR"] = "frameRequestXR";
        LOOP_MODE["TIME_GAME"] = "timeGame";
        LOOP_MODE["TIME_REAL"] = "timeReal";
    })(LOOP_MODE = FudgeCore.LOOP_MODE || (FudgeCore.LOOP_MODE = {}));
    class Loop extends FudgeCore.EventTargetStatic {
        static { this.ƒTimeStartGame = 0; }
        static { this.ƒTimeStartReal = 0; }
        static { this.ƒTimeFrameGame = 0; }
        static { this.ƒTimeFrameReal = 0; }
        static { this.ƒTimeFrameStartGame = 0; }
        static { this.ƒTimeFrameStartReal = 0; }
        static { this.ƒTimeLastFrameGameAvg = 0; }
        static { this.ƒTimeLastFrameRealAvg = 0; }
        static { this.ƒFrames = 0; }
        static { this.running = false; }
        static { this.mode = LOOP_MODE.FRAME_REQUEST; }
        static { this.idIntervall = 0; }
        static { this.idRequest = 0; }
        static { this.fpsDesired = 30; }
        static { this.framesToAverage = 30; }
        static { this.syncWithAnimationFrame = false; }
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
                case LOOP_MODE.FRAME_REQUEST_XR:
                    Loop.loopFrameXR();
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
                case LOOP_MODE.FRAME_REQUEST_XR:
                    FudgeCore.XRViewport.default.session.cancelAnimationFrame(Loop.idRequest);
                    FudgeCore.XRViewport.default.session = null;
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
        static loopFrameXR(_time = null, _xrFrame = null) {
            Loop.loop();
            FudgeCore.XRViewport.default.draw(true, _xrFrame);
            Loop.idRequest = FudgeCore.XRViewport.default.session.requestAnimationFrame(Loop.loopFrameXR);
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
    class Time extends FudgeCore.EventTargetUnified {
        static { this.game = new Time(); }
        constructor() {
            super();
            this.timers = {};
            this.idTimerAddedLast = 0;
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
