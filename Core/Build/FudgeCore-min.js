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
        static fudge(_message, ..._args) {
            console.debug(FudgeCore.DEBUG_SYMBOL[FudgeCore.DEBUG_FILTER.FUDGE], _message, ..._args);
        }
        static source(_message, ..._args) {
            console.log(FudgeCore.DEBUG_SYMBOL[FudgeCore.DEBUG_FILTER.SOURCE], _message, ..._args);
        }
    }
    DebugConsole.delegates = {
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
    FudgeCore.DebugConsole = DebugConsole;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Debug {
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
    Debug.delegates = Debug.setupConsole();
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
    Serializer.namespaces = { "ƒ": FudgeCore };
    FudgeCore.Serializer = Serializer;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Node extends FudgeCore.EventTargetUnified {
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
        #mtxWorldInverseUpdated;
        #mtxWorldInverse;
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
        constructor() {
            super();
            this.#node = null;
            this.singleton = true;
            this.active = true;
            this.addEventListener("mutate", (_event) => {
                if (this.#node) {
                    _event.detail.component = this;
                    _event.detail.componentIndex = this.node.getComponents(this.constructor).indexOf(this);
                    this.#node.dispatchEvent(_event);
                }
            });
        }
        #node;
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
    Component.baseClass = Component;
    Component.subclasses = [];
    FudgeCore.Component = Component;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class RecycableArray {
        constructor() {
            this.#length = 0;
            this.#array = new Array();
        }
        #length;
        #array;
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
                let oldLength = RenderInjectorShader.uboInfos.length;
                for (let i = 0; i < uniformCount; i++) {
                    let info = FudgeCore.RenderWebGL.assert(crc3.getActiveUniform(program, i));
                    if (!info) {
                        break;
                    }
                    if (crc3.getUniformLocation(program, info.name) != null)
                        detectedUniforms[info.name] = FudgeCore.RenderWebGL.assert(crc3.getUniformLocation(program, info.name));
                    else if (!RenderInjectorShader.uboInfos.includes(info.name))
                        RenderInjectorShader.uboInfos.push(info.name);
                }
                if (oldLength < RenderInjectorShader.uboInfos.length)
                    setUniformInfosInUBO();
                return detectedUniforms;
            }
            function setUniformInfosInUBO() {
                initializeUBO();
                let uboVariableIndices = crc3.getUniformIndices(program, RenderInjectorShader.uboInfos);
                let uboVariableOffsets = crc3.getActiveUniforms(program, uboVariableIndices, crc3.UNIFORM_OFFSET);
                RenderInjectorShader.uboInfos.forEach((_name, _index) => {
                    RenderInjectorShader.uboLightsInfo[_name] = new UboLightStrucure(uboVariableIndices[_index], uboVariableOffsets[_index]);
                });
            }
            function initializeUBO() {
                let crc3 = FudgeCore.RenderWebGL.getRenderingContext();
                const blockIndex = crc3.getUniformBlockIndex(program, FudgeCore.UNIFORM_BLOCKS.LIGHTS.NAME);
                const blockSize = crc3.getActiveUniformBlockParameter(program, blockIndex, crc3.UNIFORM_BLOCK_DATA_SIZE);
                const uboBuffer = crc3.createBuffer();
                crc3.bindBuffer(crc3.UNIFORM_BUFFER, uboBuffer);
                crc3.bufferData(crc3.UNIFORM_BUFFER, blockSize, crc3.DYNAMIC_DRAW);
                crc3.bindBuffer(crc3.UNIFORM_BUFFER, null);
                crc3.uniformBlockBinding(program, blockIndex, FudgeCore.UNIFORM_BLOCKS.LIGHTS.BINDING);
                crc3.bindBufferBase(crc3.UNIFORM_BUFFER, FudgeCore.UNIFORM_BLOCKS.LIGHTS.BINDING, uboBuffer);
            }
        }
    }
    RenderInjectorShader.uboLightsInfo = {};
    RenderInjectorShader.uboInfos = new Array();
    FudgeCore.RenderInjectorShader = RenderInjectorShader;
    class UboLightStrucure {
        constructor(_index, _offset) {
            this.index = {};
            this.offset = {};
            this.index = _index;
            this.offset = _offset;
        }
    }
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
            uniform = _shader.uniforms["u_fSpecular"];
            FudgeCore.RenderWebGL.getRenderingContext().uniform1f(uniform, this.specular);
            uniform = _shader.uniforms["u_fDiffuse"];
            FudgeCore.RenderWebGL.getRenderingContext().uniform1f(uniform, this.diffuse);
        }
        static injectCoatTextured(_shader, _cmpMaterial) {
            RenderInjectorCoat.injectCoatColored.call(this, _shader, _cmpMaterial);
            let crc3 = FudgeCore.RenderWebGL.getRenderingContext();
            this.texture.useRenderData();
            crc3.uniform1i(_shader.uniforms["u_texture"], 0);
            crc3.uniformMatrix3fv(_shader.uniforms["u_mtxPivot"], false, _cmpMaterial.mtxPivot.get());
        }
        static injectCoatRemissiveTextured(_shader, _cmpMaterial) {
            RenderInjectorCoat.injectCoatRemissive.call(this, _shader, _cmpMaterial);
            let crc3 = FudgeCore.RenderWebGL.getRenderingContext();
            this.texture.useRenderData();
            crc3.uniform1i(_shader.uniforms["u_texture"], 0);
            crc3.uniformMatrix3fv(_shader.uniforms["u_mtxPivot"], false, _cmpMaterial.mtxPivot.get());
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
        static getRenderBuffers(_shader) {
            let crc3 = FudgeCore.RenderWebGL.getRenderingContext();
            this.renderMesh = this.renderMesh || new FudgeCore.RenderMesh(this);
            if (_shader.define.includes("FLAT")) {
                if (this.renderMesh.flat == null)
                    this.renderMesh.flat = {
                        vertices: createBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.renderMesh.verticesFlat),
                        indices: createBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, this.renderMesh.indicesFlat),
                        normals: createBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.renderMesh.normalsFlat),
                        textureUVs: createBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.renderMesh.textureUVsFlat),
                        nIndices: this.renderMesh.indicesFlat.length
                    };
                return this.renderMesh.flat;
            }
            else {
                if (this.renderMesh.smooth == null)
                    this.renderMesh.smooth = {
                        vertices: createBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.renderMesh.vertices),
                        indices: createBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, this.renderMesh.indices),
                        normals: createBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.renderMesh.normalsVertex),
                        textureUVs: createBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.renderMesh.textureUVs),
                        nIndices: this.renderMesh.indices.length
                    };
                return this.renderMesh.smooth;
            }
            function createBuffer(_type, _array) {
                let buffer = FudgeCore.RenderWebGL.assert(crc3.createBuffer());
                crc3.bindBuffer(_type, buffer);
                crc3.bufferData(_type, _array, WebGL2RenderingContext.STATIC_DRAW);
                return buffer;
            }
        }
        static useRenderBuffers(_shader, _mtxMeshToWorld, _mtxMeshToView, _id) {
            let renderBuffers = this.getRenderBuffers(_shader);
            let crc3 = FudgeCore.RenderWebGL.getRenderingContext();
            function setBuffer(_name, _buffer) {
                let attribute = _shader.attributes[_name];
                if (attribute == undefined)
                    return;
                crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, _buffer);
                crc3.enableVertexAttribArray(attribute);
                FudgeCore.RenderWebGL.setAttributeStructure(attribute, { size: 3, dataType: WebGL2RenderingContext.FLOAT, normalize: false, stride: 0, offset: 0 });
            }
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
            setBuffer("a_vctPosition", renderBuffers.vertices);
            setBuffer("a_vctNormal", renderBuffers.normals);
            let attribute = _shader.attributes["a_vctTexture"];
            if (attribute) {
                crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, renderBuffers.textureUVs);
                crc3.enableVertexAttribArray(attribute);
                crc3.vertexAttribPointer(attribute, 2, WebGL2RenderingContext.FLOAT, false, 0, 0);
            }
            uniform = _shader.uniforms["u_id"];
            if (uniform)
                FudgeCore.RenderWebGL.getRenderingContext().uniform1i(uniform, _id);
            crc3.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, renderBuffers.indices);
            return renderBuffers;
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
            return this.fragmentShaderSource.replace("#version 300 es", `#version 300 es${this.data.color ? "\n#define PARTICLE_COLOR" : ""}`);
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
                let args = [functionRegex.lastIndex - 1, ...commaIndices, argumentsLastIndex - 1]
                    .reduce((_accumulator, _position, _index, _positions) => _index == _positions.length - 1 ?
                    _accumulator :
                    _accumulator.concat(_code.slice(_position + 1, _positions[_index + 1]).trim()), []);
                functionRegex.lastIndex = match.index;
                _code = `${_code.slice(0, match.index)}(${functionGenerator(args)})${_code.slice(argumentsLastIndex)}`;
            }
            return _code;
        }
    }
    RenderInjectorShaderParticleSystem.FUNCTIONS = {
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
                crc3.activeTexture(WebGL2RenderingContext.TEXTURE1);
                crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, this.renderData);
            }
            else {
                this.renderData = {};
                const texture = FudgeCore.Render.assert(crc3.createTexture());
                crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, texture);
                let textureSize = Math.ceil(Math.sqrt(this.size));
                textureSize = Math.min(textureSize, crc3.getParameter(crc3.MAX_TEXTURE_SIZE));
                let randomNumbers = [];
                for (let i = 0; i < textureSize * textureSize; i++) {
                    randomNumbers.push(Math.random());
                }
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
    Recycler.depot = {};
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
        }
    };
    class RenderWebGL extends FudgeCore.EventTargetStatic {
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
        static resetFrameBuffer(_frameBuffer = null) {
            RenderWebGL.crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, _frameBuffer);
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
                    RenderWebGL.crc3.blendEquation(WebGL2RenderingContext.FUNC_ADD);
                    RenderWebGL.crc3.blendFunc(WebGL2RenderingContext.ONE, WebGL2RenderingContext.ZERO);
                    break;
                case BLEND.TRANSPARENT:
                    RenderWebGL.crc3.blendEquation(WebGL2RenderingContext.FUNC_ADD);
                    RenderWebGL.crc3.blendFunc(WebGL2RenderingContext.SRC_ALPHA, WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA);
                    break;
                case BLEND.ADDITIVE:
                    RenderWebGL.crc3.blendEquation(WebGL2RenderingContext.FUNC_ADD);
                    RenderWebGL.crc3.blendFunc(WebGL2RenderingContext.SRC_ALPHA, WebGL2RenderingContext.DST_ALPHA);
                    break;
                case BLEND.SUBTRACTIVE:
                    RenderWebGL.crc3.blendEquation(WebGL2RenderingContext.FUNC_REVERSE_SUBTRACT);
                    RenderWebGL.crc3.blendFunc(WebGL2RenderingContext.SRC_ALPHA, WebGL2RenderingContext.DST_ALPHA);
                    break;
                case BLEND.MODULATE:
                    RenderWebGL.crc3.blendEquation(WebGL2RenderingContext.FUNC_ADD);
                    RenderWebGL.crc3.blendFunc(WebGL2RenderingContext.DST_COLOR, WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA);
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
        static pick(_node, _mtxMeshToWorld, _cmpCamera) {
            try {
                let cmpMesh = _node.getComponent(FudgeCore.ComponentMesh);
                let cmpMaterial = _node.getComponent(FudgeCore.ComponentMaterial);
                let coat = cmpMaterial.material.coat;
                let shader = coat instanceof FudgeCore.CoatTextured ? FudgeCore.ShaderPickTextured : FudgeCore.ShaderPick;
                shader.useProgram();
                coat.useRenderData(shader, cmpMaterial);
                let mtxMeshToView = this.calcMeshToView(_node, cmpMesh, _cmpCamera.mtxWorldToView, _cmpCamera.mtxWorld.translation);
                let sizeUniformLocation = shader.uniforms["u_vctSize"];
                RenderWebGL.getRenderingContext().uniform2fv(sizeUniformLocation, [RenderWebGL.sizePick, RenderWebGL.sizePick]);
                let mesh = cmpMesh.mesh;
                let renderBuffers = mesh.useRenderBuffers(shader, _mtxMeshToWorld, mtxMeshToView, FudgeCore.Render.ƒpicked.length);
                RenderWebGL.crc3.drawElements(WebGL2RenderingContext.TRIANGLES, renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0);
                let pick = new FudgeCore.Pick(_node);
                FudgeCore.Render.ƒpicked.push(pick);
            }
            catch (_error) {
            }
        }
        static setLightsInShader(_shader, _lights) {
            _shader.useProgram();
            let uni = _shader.uniforms;
            let ambient = uni["u_ambient.vctColor"];
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
            fillLightBuffers(FudgeCore.LightDirectional, "u_nLightsDirectional", "u_directional");
            fillLightBuffers(FudgeCore.LightPoint, "u_nLightsPoint", "u_point");
            fillLightBuffers(FudgeCore.LightSpot, "u_nLightsSpot", "u_spot");
            function fillLightBuffers(_type, _uniNumber, _uniStruct) {
                let uni = FudgeCore.RenderInjectorShader.uboLightsInfo;
                let uniLights = uni[_uniNumber];
                if (uniLights) {
                    let zeroOut = new Uint8Array([0]);
                    ;
                    RenderWebGL.crc3.bufferSubData(RenderWebGL.crc3.UNIFORM_BUFFER, uniLights.offset, zeroOut);
                    let cmpLights = _lights.get(_type);
                    if (cmpLights) {
                        let n = cmpLights.length;
                        let nLightsAmount = new Uint8Array([n]);
                        ;
                        RenderWebGL.crc3.bufferSubData(RenderWebGL.crc3.UNIFORM_BUFFER, uniLights.offset, nLightsAmount);
                        let i = 0;
                        for (let cmpLight of cmpLights) {
                            RenderWebGL.crc3.bufferSubData(RenderWebGL.crc3.UNIFORM_BUFFER, uni[`${_uniStruct}[${i}].vctColor`].offset, cmpLight.light.color.getArray());
                            let mtxTotal = FudgeCore.Matrix4x4.MULTIPLICATION(cmpLight.node.mtxWorld, cmpLight.mtxPivot);
                            RenderWebGL.crc3.bufferSubData(RenderWebGL.crc3.UNIFORM_BUFFER, uni[`${_uniStruct}[${i}].mtxShape`].offset, mtxTotal.get());
                            if (_type != FudgeCore.LightDirectional) {
                                let mtxInverse = mtxTotal.inverse();
                                RenderWebGL.crc3.bufferSubData(RenderWebGL.crc3.UNIFORM_BUFFER, uni[`${_uniStruct}[${i}].mtxShapeInverse`].offset, mtxInverse.get());
                                FudgeCore.Recycler.store(mtxInverse);
                            }
                            FudgeCore.Recycler.store(mtxTotal);
                            i++;
                        }
                    }
                }
            }
        }
        static drawNode(_node, _cmpCamera) {
            let cmpMesh = _node.getComponent(FudgeCore.ComponentMesh);
            let cmpMaterial = _node.getComponent(FudgeCore.ComponentMaterial);
            let coat = cmpMaterial.material.coat;
            let cmpParticleSystem = _node.getComponent(FudgeCore.ComponentParticleSystem);
            let drawParticles = cmpParticleSystem && cmpParticleSystem.isActive;
            let shader = cmpMaterial.material.getShader();
            if (drawParticles)
                shader = cmpParticleSystem.particleSystem.getShaderFrom(shader);
            shader.useProgram();
            coat.useRenderData(shader, cmpMaterial);
            let mtxMeshToView = this.calcMeshToView(_node, cmpMesh, _cmpCamera.mtxWorldToView, _cmpCamera.mtxWorld.translation);
            let renderBuffers = this.getRenderBuffers(cmpMesh, shader, mtxMeshToView);
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
            if (drawParticles) {
                RenderWebGL.drawParticles(cmpParticleSystem, shader, renderBuffers, _node.getComponent(FudgeCore.ComponentFaceCamera), cmpMaterial.sortForAlpha);
            }
            else {
                RenderWebGL.crc3.drawElements(WebGL2RenderingContext.TRIANGLES, renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0);
            }
        }
        static drawParticles(_cmpParticleSystem, _shader, _renderBuffers, _cmpFaceCamera, _sortForAlpha) {
            RenderWebGL.crc3.depthMask(_cmpParticleSystem.depthMask);
            RenderWebGL.setBlendMode(_cmpParticleSystem.blendMode);
            _cmpParticleSystem.useRenderData();
            RenderWebGL.crc3.uniform1f(_shader.uniforms["u_fParticleSystemDuration"], _cmpParticleSystem.duration);
            RenderWebGL.crc3.uniform1f(_shader.uniforms["u_fParticleSystemSize"], _cmpParticleSystem.size);
            RenderWebGL.crc3.uniform1f(_shader.uniforms["u_fParticleSystemTime"], _cmpParticleSystem.time);
            RenderWebGL.crc3.uniform1i(_shader.uniforms["u_fParticleSystemRandomNumbers"], 1);
            let faceCamera = _cmpFaceCamera && _cmpFaceCamera.isActive;
            RenderWebGL.crc3.uniform1i(_shader.uniforms["u_bParticleSystemFaceCamera"], faceCamera ? 1 : 0);
            RenderWebGL.crc3.uniform1i(_shader.uniforms["u_bParticleSystemRestrict"], faceCamera && _cmpFaceCamera.restrict ? 1 : 0);
            RenderWebGL.crc3.drawElementsInstanced(WebGL2RenderingContext.TRIANGLES, _renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0, _cmpParticleSystem.size);
            RenderWebGL.setBlendMode(BLEND.TRANSPARENT);
            RenderWebGL.crc3.depthMask(true);
        }
        static calcMeshToView(_node, _cmpMesh, _mtxWorldToView, _target) {
            let cmpFaceCamera = _node.getComponent(FudgeCore.ComponentFaceCamera);
            if (cmpFaceCamera && cmpFaceCamera.isActive) {
                let mtxMeshToView;
                mtxMeshToView = _cmpMesh.mtxWorld.clone;
                mtxMeshToView.lookAt(_target, cmpFaceCamera.upLocal ? null : cmpFaceCamera.up, cmpFaceCamera.restrict);
                return FudgeCore.Matrix4x4.MULTIPLICATION(_mtxWorldToView, mtxMeshToView);
            }
            return FudgeCore.Matrix4x4.MULTIPLICATION(_mtxWorldToView, _cmpMesh.mtxWorld);
        }
        static getRenderBuffers(_cmpMesh, _shader, _mtxMeshToView) {
            if (_cmpMesh.mesh instanceof FudgeCore.MeshSkin && (_shader.define.includes("SKIN")))
                return _cmpMesh.mesh.useRenderBuffers(_shader, _cmpMesh.mtxWorld, _mtxMeshToView, null, _cmpMesh.skeleton?.mtxBones);
            else
                return _cmpMesh.mesh.useRenderBuffers(_shader, _cmpMesh.mtxWorld, _mtxMeshToView);
        }
    }
    RenderWebGL.crc3 = RenderWebGL.initialize();
    RenderWebGL.rectRender = RenderWebGL.getCanvasRect();
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
        constructor(_bodyAnchor = null, _bodyTied = null) {
            super();
            this.#idBodyAnchor = 0;
            this.#idBodyTied = 0;
            this.#connected = false;
            this.#internalCollision = false;
            this.#breakForce = 0;
            this.#breakTorque = 0;
            this.singleton = false;
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
            this.bodyAnchor = _bodyAnchor;
            this.bodyTied = _bodyTied;
            this.addEventListener("componentAdd", this.hndEvent);
            this.addEventListener("componentRemove", this.hndEvent);
        }
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
            if (typeof (_mutator.anchor) !== "undefined")
                this.anchor = new FudgeCore.Vector3(...(Object.values(_mutator.anchor)));
            delete _mutator.anchor;
            if (typeof (_mutator.nameChildToConnect) !== "undefined")
                this.connectChild(_mutator.nameChildToConnect);
            this.#mutate(_mutator);
            this.deleteFromMutator(_mutator, this.#getMutator());
            super.mutate(_mutator);
        }
        #getMutator;
        #mutate;
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
    }
    Joint.baseClass = Joint;
    Joint.subclasses = [];
    FudgeCore.Joint = Joint;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class JointAxial extends FudgeCore.Joint {
        constructor(_bodyAnchor = null, _bodyTied = null, _axis = new FudgeCore.Vector3(0, 1, 0), _localAnchor = new FudgeCore.Vector3(0, 0, 0)) {
            super(_bodyAnchor, _bodyTied);
            this.#maxMotor = 10;
            this.#minMotor = -10;
            this.#motorSpeed = 0;
            this.#springFrequency = 0;
            this.#springDamping = 0;
            this.#getMutator = () => {
                let mutator = {
                    springDamping: this.#springDamping,
                    springFrequency: this.#springFrequency,
                    maxMotor: this.#maxMotor,
                    minMotor: this.#minMotor,
                    motorSpeed: this.#motorSpeed
                };
                return mutator;
            };
            this.#mutate = (_mutator) => {
                this.mutateBase(_mutator, ["springDamping", "springFrequency", "maxMotor", "minMotor", "motorSpeed"]);
            };
            this.axis = _axis;
            this.anchor = _localAnchor;
            this.minMotor = -10;
            this.maxMotor = 10;
        }
        #maxMotor;
        #minMotor;
        #motorSpeed;
        #axis;
        #springFrequency;
        #springDamping;
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
            if (typeof (_mutator.axis) !== "undefined")
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
        #getMutator;
        #mutate;
        constructJoint() {
            this.springDamper = new OIMO.SpringDamper().setSpring(this.#springFrequency, this.#springDamping);
            super.constructJoint(this.#axis);
        }
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
        #animationStructuresProcessed;
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
                framesPerSecond: this.framesPerSecond,
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
                if (structureOrSequence instanceof FudgeCore.AnimationSequence) {
                    serialization[property] = structureOrSequence.serialize();
                }
                else {
                    if (FudgeCore.Component.subclasses.some(type => type.name == property)) {
                        serialization[property] = [];
                        for (const i in structureOrSequence) {
                            serialization[property].push(this.traverseStructureForSerialization(structureOrSequence[i]));
                        }
                    }
                    else {
                        serialization[property] = this.traverseStructureForSerialization(structureOrSequence);
                    }
                }
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
                let key = new FudgeCore.AnimationKey(this.totalTime - oldKey.time, oldKey.value, oldKey.slopeOut, oldKey.slopeIn, oldKey.constant);
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
    Animation.subclasses = [];
    Animation.iSubclass = Animation.registerSubclass(Animation);
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
            if (!this.keyOut || this.keyIn.constant) {
                this.d = this.keyIn.value;
                this.c = this.b = this.a = 0;
                return;
            }
            let x1 = this.keyOut.time - this.keyIn.time;
            this.d = this.keyIn.value;
            this.c = this.keyIn.slopeOut;
            this.a = (-x1 * (this.keyIn.slopeOut + this.keyOut.slopeIn) - 2 * this.keyIn.value + 2 * this.keyOut.value) / -Math.pow(x1, 3);
            this.b = (this.keyOut.slopeIn - this.keyIn.slopeOut - 3 * this.a * Math.pow(x1, 2)) / (2 * x1);
        }
    }
    FudgeCore.AnimationFunction = AnimationFunction;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class AnimationKey extends FudgeCore.Mutable {
        constructor(_time = 0, _value = 0, _slopeIn = 0, _slopeOut = 0, _constant = false) {
            super();
            this.#constant = false;
            this.#slopeIn = 0;
            this.#slopeOut = 0;
            this.#time = _time;
            this.#value = _value;
            this.#slopeIn = _slopeIn;
            this.#slopeOut = _slopeOut;
            this.#constant = _constant;
            this.broken = this.slopeIn != -this.slopeOut;
            this.functionOut = new FudgeCore.AnimationFunction(this, null);
        }
        #time;
        #value;
        #constant;
        #slopeIn;
        #slopeOut;
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
        get constant() {
            return this.#constant;
        }
        set constant(_constant) {
            this.#constant = _constant;
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
            serialization.slopeIn = this.#slopeIn;
            serialization.slopeOut = this.#slopeOut;
            serialization.constant = this.#constant;
            return serialization;
        }
        async deserialize(_serialization) {
            this.#time = _serialization.time;
            this.#value = _serialization.value;
            this.#slopeIn = _serialization.slopeIn;
            this.#slopeOut = _serialization.slopeOut;
            this.#constant = _serialization.constant;
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
        constructor() {
            super(...arguments);
            this.keys = [];
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
                if (this.keys[i].time <= _time && this.keys[i + 1].time > _time) {
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
    class AnimationSprite extends FudgeCore.Animation {
        constructor(_name = "AnimationSprite") {
            super(_name, {}, 1);
            this.texture = FudgeCore.TextureDefault.texture;
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
                                    y: yTranslation,
                                },
                                "scaling": {
                                    x: xScale,
                                    y: yScale,
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
            super.mutate(_mutator);
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
                this.texture = FudgeCore.TextureDefault.texture;
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
    AnimationSprite.iSubclass = FudgeCore.Animation.registerSubclass(AnimationSprite);
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
        constructor(contextOptions) {
            super(contextOptions);
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
    AudioManager.default = new AudioManager({ latencyHint: "interactive", sampleRate: 44100 });
    AudioManager.eventUpdate = new Event("updateAudioGraph");
    FudgeCore.AudioManager = AudioManager;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ComponentAnimator extends FudgeCore.Component {
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
        #scale;
        #timeLocal;
        #previous;
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
        async mutate(_mutator) {
            await super.mutate(_mutator);
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
        executeEvents(events) {
            for (let i = 0; i < events.length; i++) {
                this.dispatchEvent(new Event(events[i]));
            }
        }
    }
    ComponentAnimator.iSubclass = FudgeCore.Component.registerSubclass(ComponentAnimator);
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
    }
    ComponentAudio.iSubclass = FudgeCore.Component.registerSubclass(ComponentAudio);
    FudgeCore.ComponentAudio = ComponentAudio;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ComponentAudioListener extends FudgeCore.Component {
        constructor() {
            super(...arguments);
            this.mtxPivot = FudgeCore.Matrix4x4.IDENTITY();
        }
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
    ComponentAudioListener.iSubclass = FudgeCore.Component.registerSubclass(ComponentAudioListener);
    FudgeCore.ComponentAudioListener = ComponentAudioListener;
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
            this.#mtxProjection = new FudgeCore.Matrix4x4;
            this.projection = PROJECTION.CENTRAL;
            this.fieldOfView = 45;
            this.aspectRatio = 1.0;
            this.direction = FIELD_OF_VIEW.DIAGONAL;
            this.near = 1;
            this.far = 2000;
            this.backgroundEnabled = true;
        }
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
        projectCentral(_aspect = this.aspectRatio, _fieldOfView = this.fieldOfView, _direction = this.direction, _near = 1, _far = 2000) {
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
    ComponentCamera.iSubclass = FudgeCore.Component.registerSubclass(ComponentCamera);
    FudgeCore.ComponentCamera = ComponentCamera;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ComponentFaceCamera extends FudgeCore.Component {
        constructor() {
            super();
            this.upLocal = true;
            this.up = FudgeCore.Vector3.Y(1);
            this.restrict = false;
            this.singleton = true;
        }
    }
    ComponentFaceCamera.iSubclass = FudgeCore.Component.registerSubclass(ComponentFaceCamera);
    FudgeCore.ComponentFaceCamera = ComponentFaceCamera;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ComponentGraphFilter extends FudgeCore.Component {
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
    ComponentGraphFilter.iSubclass = FudgeCore.Component.registerSubclass(ComponentGraphFilter);
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
        async mutate(_mutator) {
            let type = _mutator.type;
            if (typeof (type) !== "undefined" && type != this.light.constructor.name)
                this.setType(FudgeCore.Serializer.getConstructor(type));
            delete (_mutator.type);
            super.mutate(_mutator);
            _mutator.type = type;
        }
    }
    ComponentLight.iSubclass = FudgeCore.Component.registerSubclass(ComponentLight);
    FudgeCore.ComponentLight = ComponentLight;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ComponentMaterial extends FudgeCore.Component {
        constructor(_material = null) {
            super();
            this.clrPrimary = FudgeCore.Color.CSS("white");
            this.clrSecondary = FudgeCore.Color.CSS("white");
            this.mtxPivot = FudgeCore.Matrix3x3.IDENTITY();
            this.sortForAlpha = false;
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
    ComponentMaterial.iSubclass = FudgeCore.Component.registerSubclass(ComponentMaterial);
    FudgeCore.ComponentMaterial = ComponentMaterial;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ComponentMesh extends FudgeCore.Component {
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
                serialization.skeleton = this.skeleton.idSource;
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
            if (_serialization.skeleton)
                this.addEventListener("componentAdd", (_event) => {
                    if (_event.target != this)
                        return;
                    const trySetSkeleton = () => {
                        let root = this.node;
                        while (root.getParent()) {
                            root = root.getParent();
                        }
                        for (const node of root) {
                            if (node instanceof FudgeCore.SkeletonInstance && node.idSource == _serialization.skeleton)
                                this.skeleton = node;
                        }
                        if (!this.skeleton) {
                            const trySetSkeletonOnChildAppend = _event => {
                                root.removeEventListener("childAppend", trySetSkeletonOnChildAppend);
                                if (_event.target instanceof FudgeCore.SkeletonInstance && _event.target.idSource == _serialization.skeleton)
                                    this.skeleton = _event.target;
                                else {
                                    trySetSkeleton();
                                }
                            };
                            root.addEventListener("childAppend", trySetSkeletonOnChildAppend);
                        }
                    };
                    trySetSkeleton();
                });
            await this.mtxPivot.deserialize(_serialization.pivot);
            await super.deserialize(_serialization[super.constructor.name]);
            return this;
        }
        getMutatorForUserInterface() {
            let mutator = this.getMutator();
            return mutator;
        }
    }
    ComponentMesh.iSubclass = FudgeCore.Component.registerSubclass(ComponentMesh);
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
    let ComponentParticleSystem = ComponentParticleSystem_1 = class ComponentParticleSystem extends FudgeCore.Component {
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
        #size;
        #timeScale;
        #time;
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
    ComponentParticleSystem.iSubclass = FudgeCore.Component.registerSubclass(ComponentParticleSystem_1);
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
    ComponentPick.iSubclass = FudgeCore.Component.registerSubclass(ComponentPick);
    FudgeCore.ComponentPick = ComponentPick;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ComponentScript extends FudgeCore.Component {
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
    ComponentScript.iSubclass = FudgeCore.Component.registerSubclass(ComponentScript);
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
    ComponentTransform.iSubclass = FudgeCore.Component.registerSubclass(ComponentTransform);
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
        constructor() {
            super();
            this.rightCntrl = new VRController();
            this.leftCntrl = new VRController();
            this.addEventListener("componentAdd", this.getMtxLocalFromCmpTransform);
        }
        #mtxLocal;
        get mtxLocal() {
            return this.#mtxLocal;
        }
        set translation(_newPos) {
            let invTranslation = FudgeCore.Vector3.SCALE(FudgeCore.Vector3.DIFFERENCE(_newPos, this.#mtxLocal.translation), -1);
            FudgeCore.XRViewport.default.referenceSpace = FudgeCore.XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(invTranslation));
            this.#mtxLocal.translation = _newPos;
        }
        set rotation(_newRot) {
            let newRot = FudgeCore.Vector3.SCALE(FudgeCore.Vector3.SCALE(FudgeCore.Vector3.SUM(_newRot, this.#mtxLocal.rotation), -1), Math.PI / 180);
            let orientation = new FudgeCore.PhysicsQuaternion();
            orientation.setFromVector3(newRot.x, newRot.y, newRot.z);
            FudgeCore.XRViewport.default.referenceSpace = FudgeCore.XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(FudgeCore.Vector3.DIFFERENCE(this.#mtxLocal.translation, FudgeCore.Vector3.ZERO())));
            FudgeCore.XRViewport.default.referenceSpace = FudgeCore.XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(FudgeCore.Vector3.ZERO(), orientation));
            FudgeCore.XRViewport.default.referenceSpace = FudgeCore.XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(FudgeCore.Vector3.DIFFERENCE(FudgeCore.Vector3.ZERO(), this.#mtxLocal.translation)));
            this.#mtxLocal.rotation = FudgeCore.Vector3.SCALE(_newRot, -1);
        }
        translate(_by) {
            let invTranslation = FudgeCore.Vector3.SCALE(_by, -1);
            FudgeCore.XRViewport.default.referenceSpace = FudgeCore.XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(invTranslation));
            this.#mtxLocal.translate(_by);
        }
        rotate(_by) {
            let rotAmount = FudgeCore.Vector3.SCALE(FudgeCore.Vector3.SCALE(_by, -1), Math.PI / 180);
            let orientation = new FudgeCore.PhysicsQuaternion();
            orientation.setFromVector3(rotAmount.x, rotAmount.y, rotAmount.z);
            FudgeCore.XRViewport.default.referenceSpace = FudgeCore.XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(FudgeCore.Vector3.DIFFERENCE(this.#mtxLocal.translation, FudgeCore.Vector3.ZERO())));
            FudgeCore.XRViewport.default.referenceSpace = FudgeCore.XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(FudgeCore.Vector3.ZERO(), orientation));
            FudgeCore.XRViewport.default.referenceSpace = FudgeCore.XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(FudgeCore.Vector3.DIFFERENCE(FudgeCore.Vector3.ZERO(), this.#mtxLocal.translation)));
            this.#mtxLocal.rotate(FudgeCore.Vector3.SCALE(_by, -1));
        }
        getMtxLocalFromCmpTransform() {
            this.#mtxLocal = this.node.getComponent(FudgeCore.ComponentTransform).mtxLocal;
        }
    }
    ComponentVRDevice.iSubclass = FudgeCore.Component.registerSubclass(ComponentVRDevice);
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
                let event = new CustomEvent("output", { detail: {
                        control: control,
                        input: _event.detail.output,
                        output: this.getOutput()
                    } });
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
    Keyboard.keysPressed = Keyboard.initialize();
    FudgeCore.Keyboard = Keyboard;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class DebugAlert extends FudgeCore.DebugTarget {
        static createDelegate(_headline) {
            let delegate = function (_message, ..._args) {
                let args = _args.map(_arg => _arg.toString());
                let out = _headline + " " + FudgeCore.DebugTarget.mergeArguments(_message, args);
                alert(out);
            };
            return delegate;
        }
    }
    DebugAlert.delegates = {
        [FudgeCore.DEBUG_FILTER.INFO]: DebugAlert.createDelegate(FudgeCore.DEBUG_SYMBOL[FudgeCore.DEBUG_FILTER.INFO]),
        [FudgeCore.DEBUG_FILTER.LOG]: DebugAlert.createDelegate(FudgeCore.DEBUG_SYMBOL[FudgeCore.DEBUG_FILTER.LOG]),
        [FudgeCore.DEBUG_FILTER.WARN]: DebugAlert.createDelegate(FudgeCore.DEBUG_SYMBOL[FudgeCore.DEBUG_FILTER.WARN]),
        [FudgeCore.DEBUG_FILTER.ERROR]: DebugAlert.createDelegate(FudgeCore.DEBUG_SYMBOL[FudgeCore.DEBUG_FILTER.ERROR]),
        [FudgeCore.DEBUG_FILTER.FUDGE]: DebugAlert.createDelegate(FudgeCore.DEBUG_SYMBOL[FudgeCore.DEBUG_FILTER.FUDGE]),
        [FudgeCore.DEBUG_FILTER.SOURCE]: DebugAlert.createDelegate(FudgeCore.DEBUG_SYMBOL[FudgeCore.DEBUG_FILTER.SOURCE])
    };
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
    DebugTextArea.textArea = document.createElement("textarea");
    DebugTextArea.autoScroll = true;
    DebugTextArea.delegates = {
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
    DebugTextArea.groups = [];
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
            this.type = "Graph";
            this.hndMutate = async (_event) => {
                _event.detail.path = Reflect.get(_event, "path");
                this.dispatchEvent(new CustomEvent("mutateGraph", { detail: _event.detail }));
            };
            this.addEventListener("mutate", this.hndMutate);
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
            this.dispatchEvent(new Event("graphDeserialized"));
            return this;
        }
    }
    FudgeCore.Graph = Graph;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    let SYNC;
    (function (SYNC) {
        SYNC[SYNC["READY"] = 0] = "READY";
        SYNC[SYNC["GRAPH_SYNCED"] = 1] = "GRAPH_SYNCED";
        SYNC[SYNC["GRAPH_DONE"] = 2] = "GRAPH_DONE";
        SYNC[SYNC["INSTANCE"] = 3] = "INSTANCE";
    })(SYNC || (SYNC = {}));
    class GraphInstance extends FudgeCore.Node {
        constructor(_graph) {
            super("GraphInstance");
            this.#idSource = undefined;
            this.#sync = SYNC.READY;
            this.#deserializeFromSource = true;
            this.hndMutationGraph = async (_event) => {
                if (this.#sync != SYNC.READY) {
                    this.#sync = SYNC.READY;
                    return;
                }
                if (this.isFiltered())
                    return;
                this.#sync = SYNC.GRAPH_SYNCED;
                await this.reflectMutation(_event, _event.currentTarget, this, _event.detail.path);
                this.dispatchEvent(new Event("mutateGraphDone", { bubbles: false }));
            };
            this.hndMutationInstance = async (_event) => {
                if (this.#sync != SYNC.READY) {
                    this.#sync = SYNC.READY;
                    return;
                }
                if (_event.target instanceof GraphInstance && _event.target != this) {
                    return;
                }
                if (this.isFiltered())
                    return;
                this.#sync = SYNC.INSTANCE;
                await this.reflectMutation(_event, this, this.get(), Reflect.get(_event, "path"));
            };
            this.addEventListener("mutate", this.hndMutationInstance, true);
            if (!_graph)
                return;
            this.#idSource = _graph.idResource;
        }
        #idSource;
        #sync;
        #deserializeFromSource;
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
            if (filter && filter.isActive)
                serialization = super.serialize();
            else
                serialization.deserializeFromSource = true;
            serialization.name = this.name;
            serialization.idSource = this.#idSource;
            return serialization;
        }
        async deserialize(_serialization) {
            this.#idSource = _serialization.idSource;
            if (!_serialization.deserializeFromSource) {
                await super.deserialize(_serialization);
                this.#deserializeFromSource = false;
            }
            let graph = this.get();
            if (graph)
                await this.connectToGraph();
            else {
                FudgeCore.Project.registerGraphInstanceForResync(this);
            }
            return this;
        }
        async connectToGraph() {
            let graph = this.get();
            if (this.#deserializeFromSource)
                await this.set(graph);
            graph.addEventListener("mutateGraph", this.hndMutationGraph);
        }
        async set(_graph) {
            let serialization = FudgeCore.Serializer.serialize(_graph);
            for (let path in serialization) {
                await this.deserialize(serialization[path]);
                break;
            }
            this.#idSource = _graph.idResource;
            this.dispatchEvent(new Event("graphInstantiated"));
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
                await cmpMutate.mutate(_event.detail.mutator);
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
        constructor(_color = new FudgeCore.Color(), _diffuse = 1, _specular = 0) {
            super(_color);
            this.diffuse = _diffuse;
            this.specular = _specular;
        }
        serialize() {
            let serialization = super.serialize();
            serialization.diffuse = this.diffuse;
            serialization.specular = this.specular;
            return serialization;
        }
        async deserialize(_serialization) {
            await super.deserialize(_serialization);
            await this.color.deserialize(_serialization.color);
            this.diffuse = _serialization.diffuse;
            this.specular = _serialization.specular;
            return this;
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
        constructor(_color = new FudgeCore.Color(), _texture = FudgeCore.TextureDefault.texture) {
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
        constructor(_color = new FudgeCore.Color(), _texture = FudgeCore.TextureDefault.texture, _diffuse = 1, _specular = 0) {
            super(_color, _texture);
            this.diffuse = _diffuse;
            this.specular = _specular;
        }
        serialize() {
            let serialization = super.serialize();
            serialization.diffuse = this.diffuse;
            serialization.specular = this.specular;
            return serialization;
        }
        async deserialize(_serialization) {
            await super.deserialize(_serialization);
            this.diffuse = _serialization.diffuse;
            this.specular = _serialization.specular;
            return this;
        }
    };
    CoatRemissiveTextured = __decorate([
        FudgeCore.RenderInjectorCoat.decorate
    ], CoatRemissiveTextured);
    FudgeCore.CoatRemissiveTextured = CoatRemissiveTextured;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Color extends FudgeCore.Mutable {
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
    Color.crc2 = document.createElement("canvas").getContext("2d");
    FudgeCore.Color = Color;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Material extends FudgeCore.Mutable {
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
        #coat;
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
        reduceMutator(_mutator) {
        }
    }
    FudgeCore.Material = Material;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Calc {
        static clamp(_value, _min, _max, _isSmaller = (_value1, _value2) => { return _value1 < _value2; }) {
            if (_isSmaller(_value, _min))
                return _min;
            if (_isSmaller(_max, _value))
                return _max;
            return _value;
        }
    }
    Calc.deg2rad = Math.PI / 180;
    Calc.rad2deg = 1 / Calc.deg2rad;
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
        constructor() {
            super();
            this.#eulerAngles = FudgeCore.Vector3.ZERO();
            this.#vectors = { translation: FudgeCore.Vector3.ZERO(), rotation: FudgeCore.Vector3.ZERO(), scaling: FudgeCore.Vector3.ZERO() };
            this.data = new Float32Array(16);
            this.mutator = null;
            this.recycle();
            this.resetCache();
        }
        #eulerAngles;
        #vectors;
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
            let xAxis = FudgeCore.Vector3.NORMALIZATION(FudgeCore.Vector3.CROSS(_up, zAxis));
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
        static ROTATION(_eulerAnglesInDegrees) {
            const mtxResult = FudgeCore.Recycler.get(Matrix4x4);
            let anglesInRadians = FudgeCore.Vector3.SCALE(_eulerAnglesInDegrees, FudgeCore.Calc.deg2rad);
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
            return this.vectors.translation.clone;
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
            _up = _up ? FudgeCore.Vector3.NORMALIZATION(_up) : FudgeCore.Vector3.NORMALIZATION(this.getY());
            const mtxResult = Matrix4x4.LOOK_AT(this.translation, _target, _up, _restrict);
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
            this.#eulerAngles.scale(FudgeCore.Calc.rad2deg);
            return this.#eulerAngles;
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
            if (vectors.rotation)
                mtxResult.rotate(vectors.rotation);
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
        #sample;
    }
    Noise2.offset = (3.0 - Math.sqrt(3.0)) / 6.0;
    Noise2.gradient = [[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [-1, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [0, 1], [0, -1]];
    FudgeCore.Noise2 = Noise2;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Noise3 extends FudgeCore.Noise {
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
        #sample;
    }
    Noise3.offset = 1.0 / 6.0;
    Noise3.gradient = [[1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0], [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1], [0, 1, 1], [0, -1, -1], [0, 1, -1], [0, -1, -1]
    ];
    FudgeCore.Noise3 = Noise3;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Noise4 extends FudgeCore.Noise {
        constructor(_random = Math.random) {
            super(_random);
            this.#sample = null;
            this.sample = (_x, _y, _z, _w) => {
                return this.#sample(_x, _y, _z, _w);
            };
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
        #sample;
    }
    Noise4.offset = (5.0 - Math.sqrt(5.0)) / 20.0;
    Noise4.gradient = [[0, 1, 1, 1], [0, 1, 1, -1], [0, 1, -1, 1], [0, 1, -1, -1], [0, -1, 1, 1], [0, -1, 1, -1], [0, -1, -1, 1], [0, -1, -1, -1], [1, 0, 1, 1], [1, 0, 1, -1], [1, 0, -1, 1], [1, 0, -1, -1], [-1, 0, 1, 1], [-1, 0, 1, -1], [-1, 0, -1, 1], [-1, 0, -1, -1], [1, 1, 0, 1], [1, 1, 0, -1], [1, -1, 0, 1], [1, -1, 0, -1], [-1, 1, 0, 1], [-1, 1, 0, -1], [-1, -1, 0, 1], [-1, -1, 0, -1], [1, 1, 1, 0], [1, 1, -1, 0], [1, -1, 1, 0], [1, -1, -1, 0], [-1, 1, 1, 0], [-1, 1, -1, 0], [-1, -1, 1, 0], [-1, -1, -1, 0]];
    FudgeCore.Noise4 = Noise4;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Quaternion extends FudgeCore.Mutable {
        constructor() {
            super();
            this.data = new Float32Array(4);
            this.mutator = null;
            this.#eulerAngles = null;
            this.recycle();
        }
        #eulerAngles;
        static IDENTITY() {
            const result = FudgeCore.Recycler.get(Quaternion);
            return result;
        }
        static FROM_EULER_ANGLES(_eulerAngles, _order = "ZYX") {
            const result = FudgeCore.Recycler.get(Quaternion);
            result.setFromEulerAngles(_eulerAngles, _order);
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
        static TRANSFORM_VECTOR(_v, _q) {
            const v = FudgeCore.Recycler.get(Quaternion);
            v.set([0, _v.z, _v.x, _v.y]);
            v.multiply(_q, true);
            v.multiply(this.CONJUGATION(_q));
            const result = FudgeCore.Recycler.get(FudgeCore.Vector3);
            result.set(v.data[2], v.data[3], v.data[1]);
            return result;
        }
        static QUATERNION_TO_MATRIX(_q) {
            const x = _q.data[0], y = _q.data[1], z = _q.data[2], w = _q.data[3];
            const xx = x * x, xy = x * y, xz = x * z, xw = x * w;
            const yy = y * y, yz = y * z, yw = y * w;
            const zz = z * z, zw = z * w;
            const result = FudgeCore.Recycler.get(FudgeCore.Matrix4x4);
            result.set([
                1 - 2 * (yy + zz), 2 * (xy - zw), 2 * (xz + yw), 0,
                2 * (xy + zw), 1 - 2 * (xx + zz), 2 * (yz - xw), 0,
                2 * (xz - yw), 2 * (yz + xw), 1 - 2 * (xx + yy), 0,
                0, 0, 0, 1
            ]);
            return result;
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
        get w() {
            return this.data[3];
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
        set w(_w) {
            this.data[3] = _w;
        }
        getEulerAngles(_order = "ZYX") {
            if (!this.#eulerAngles) {
                const mtx = Quaternion.QUATERNION_TO_MATRIX(this);
                const mtxData = mtx.get();
                const m11 = mtxData[0], m12 = mtxData[1], m13 = mtxData[2];
                const m21 = mtxData[4], m22 = mtxData[5], m23 = mtxData[6];
                const m31 = mtxData[8], m32 = mtxData[9], m33 = mtxData[10];
                this.#eulerAngles = FudgeCore.Recycler.get(FudgeCore.Vector3);
                switch (_order) {
                    case "XYZ":
                        this.#eulerAngles.y = Math.asin(FudgeCore.Calc.clamp(m13, -1, 1));
                        if (Math.abs(m13) < 0.9999999) {
                            this.#eulerAngles.x = Math.atan2(-m23, m33);
                            this.#eulerAngles.z = Math.atan2(-m12, m11);
                        }
                        else {
                            this.#eulerAngles.x = Math.atan2(m32, m22);
                            this.#eulerAngles.z = 0;
                        }
                        break;
                    case "YXZ":
                        this.#eulerAngles.x = Math.asin(-FudgeCore.Calc.clamp(m23, -1, 1));
                        if (Math.abs(m23) < 0.9999999) {
                            this.#eulerAngles.y = Math.atan2(m13, m33);
                            this.#eulerAngles.z = Math.atan2(m21, m22);
                        }
                        else {
                            this.#eulerAngles.y = Math.atan2(-m31, m11);
                            this.#eulerAngles.z = 0;
                        }
                        break;
                    case "ZXY":
                        this.#eulerAngles.x = Math.asin(FudgeCore.Calc.clamp(m32, -1, 1));
                        if (Math.abs(m32) < 0.9999999) {
                            this.#eulerAngles.y = Math.atan2(-m31, m33);
                            this.#eulerAngles.z = Math.atan2(-m12, m22);
                        }
                        else {
                            this.#eulerAngles.y = 0;
                            this.#eulerAngles.z = Math.atan2(m21, m11);
                        }
                        break;
                    case "ZYX":
                        this.#eulerAngles.y = Math.asin(-FudgeCore.Calc.clamp(m31, -1, 1));
                        if (Math.abs(m31) < 0.9999999) {
                            this.#eulerAngles.x = Math.atan2(m32, m33);
                            this.#eulerAngles.z = Math.atan2(m21, m11);
                        }
                        else {
                            this.#eulerAngles.x = 0;
                            this.#eulerAngles.z = Math.atan2(-m12, m22);
                        }
                        break;
                    case "YZX":
                        this.#eulerAngles.z = Math.asin(FudgeCore.Calc.clamp(m21, -1, 1));
                        if (Math.abs(m21) < 0.9999999) {
                            this.#eulerAngles.x = Math.atan2(-m23, m22);
                            this.#eulerAngles.y = Math.atan2(-m31, m11);
                        }
                        else {
                            this.#eulerAngles.x = 0;
                            this.#eulerAngles.y = Math.atan2(m13, m33);
                        }
                        break;
                    case "XZY":
                        this.#eulerAngles.z = Math.asin(-FudgeCore.Calc.clamp(m12, -1, 1));
                        if (Math.abs(m12) < 0.9999999) {
                            this.#eulerAngles.x = Math.atan2(m32, m22);
                            this.#eulerAngles.y = Math.atan2(m13, m11);
                        }
                        else {
                            this.#eulerAngles.x = Math.atan2(-m23, m33);
                            this.#eulerAngles.y = 0;
                        }
                        break;
                    default:
                        console.warn("encountered an unknown order: " + _order);
                }
                this.#eulerAngles.scale(FudgeCore.Calc.rad2deg);
            }
            return this.#eulerAngles;
        }
        setFromEulerAngles(_eulerAngles, _order = "ZYX") {
            const cosX = Math.cos(_eulerAngles.x * FudgeCore.Calc.deg2rad / 2);
            const cosY = Math.cos(_eulerAngles.y * FudgeCore.Calc.deg2rad / 2);
            const cosZ = Math.cos(_eulerAngles.z * FudgeCore.Calc.deg2rad / 2);
            const sinX = Math.sin(_eulerAngles.x * FudgeCore.Calc.deg2rad / 2);
            const sinY = Math.sin(_eulerAngles.y * FudgeCore.Calc.deg2rad / 2);
            const sinZ = Math.sin(_eulerAngles.z * FudgeCore.Calc.deg2rad / 2);
            switch (_order) {
                case "XYZ":
                    this.set([
                        sinX * cosY * cosZ + cosX * sinY * sinZ,
                        cosX * sinY * cosZ - sinX * cosY * sinZ,
                        cosX * cosY * sinZ + sinX * sinY * cosZ,
                        cosX * cosY * cosZ - sinX * sinY * sinZ
                    ]);
                    break;
                case "YXZ":
                    this.set([
                        sinX * cosY * cosZ + cosX * sinY * sinZ,
                        cosX * sinY * cosZ - sinX * cosY * sinZ,
                        cosX * cosY * sinZ - sinX * sinY * cosZ,
                        cosX * cosY * cosZ + sinX * sinY * sinZ
                    ]);
                    break;
                case "ZXY":
                    this.set([
                        sinX * cosY * cosZ - cosX * sinY * sinZ,
                        cosX * sinY * cosZ + sinX * cosY * sinZ,
                        cosX * cosY * sinZ + sinX * sinY * cosZ,
                        cosX * cosY * cosZ - sinX * sinY * sinZ
                    ]);
                    break;
                case "ZYX":
                    this.set([
                        sinX * cosY * cosZ - cosX * sinY * sinZ,
                        cosX * sinY * cosZ + sinX * cosY * sinZ,
                        cosX * cosY * sinZ - sinX * sinY * cosZ,
                        cosX * cosY * cosZ + sinX * sinY * sinZ
                    ]);
                    break;
                case "YZX":
                    this.set([
                        sinX * cosY * cosZ + cosX * sinY * sinZ,
                        cosX * sinY * cosZ + sinX * cosY * sinZ,
                        cosX * cosY * sinZ - sinX * sinY * cosZ,
                        cosX * cosY * cosZ - sinX * sinY * sinZ
                    ]);
                    break;
                case "XZY":
                    this.set([
                        sinX * cosY * cosZ - cosX * sinY * sinZ,
                        cosX * sinY * cosZ - sinX * cosY * sinZ,
                        cosX * cosY * sinZ + sinX * sinY * cosZ,
                        cosX * cosY * cosZ + sinX * sinY * sinZ
                    ]);
                    break;
                default:
                    console.warn("encountered an unknown order: " + _order);
            }
        }
        get clone() {
            let result = FudgeCore.Recycler.get(Quaternion);
            result.set(this);
            return result;
        }
        recycle() {
            this.data.set([0, 0, 0, 1]);
            this.resetCache();
        }
        reset() {
            this.recycle();
        }
        inverse() {
            this.conjugate();
        }
        conjugate() {
            this.data[0] *= -1;
            this.data[1] *= -1;
            this.data[2] *= -1;
            this.resetCache();
        }
        multiply(_other, _fromLeft = false) {
            const a = _fromLeft ? _other : this;
            const b = _fromLeft ? this : _other;
            const ax = a.data[0];
            const ay = a.data[1];
            const az = a.data[2];
            const aw = a.data[3];
            const bx = b.data[0];
            const by = b.data[1];
            const bz = b.data[2];
            const bw = b.data[3];
            this.set([
                ax * bw + ay * bz - az * by + aw * bx,
                -ax * bz + ay * bw + az * bx + aw * by,
                ax * by - ay * bx + az * bw + aw * bz,
                -ax * bx - ay * by - az * bz + aw * bw,
            ]);
        }
        set(_qTo) {
            if (_qTo instanceof Quaternion)
                this.data.set(_qTo.data);
            else
                this.data.set(_qTo);
            this.resetCache();
        }
        toString() {
            return `ƒ.Quaternion(x: ${this.data[0]}, y: ${this.data[1]}, z: ${this.data[2]}, w: ${this.data[3]})`;
        }
        get() {
            return new Float32Array(this.data);
        }
        serialize() {
            return this.getMutator();
        }
        async deserialize(_serialization) {
            this.mutate(_serialization);
            return this;
        }
        getMutator() {
            if (!this.mutator)
                this.mutator = {
                    x: this.data[0], y: this.data[1], z: this.data[2], w: this.data[3]
                };
            return this.mutator;
        }
        async mutate(_mutator) {
            this.data[0] = _mutator.x;
            this.data[1] = _mutator.y;
            this.data[2] = _mutator.z;
            this.data[3] = _mutator.w;
            this.resetCache();
        }
        reduceMutator(_mutator) { }
        resetCache() {
            this.#eulerAngles = null;
            this.mutator = null;
        }
    }
    FudgeCore.Quaternion = Quaternion;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Random {
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
    Random.default = new Random();
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
            let magnitudeSquared = _vector.magnitudeSquared;
            let vector = _vector.clone;
            if (magnitudeSquared == 0)
                throw (new RangeError("Impossible normalization"));
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
    class Face {
        constructor(_vertices, _index0, _index1, _index2) {
            this.indices = [];
            this.indices = [_index0, _index1, _index2];
            this.vertices = _vertices;
            this.calculateNormals();
        }
        calculateNormals() {
            let trigon = this.indices.map((_index) => this.vertices.position(_index));
            let v1 = FudgeCore.Vector3.DIFFERENCE(trigon[1], trigon[0]);
            let v2 = FudgeCore.Vector3.DIFFERENCE(trigon[2], trigon[0]);
            this.normalUnscaled = FudgeCore.Vector3.CROSS(v1, v2);
            this.normal = FudgeCore.Vector3.NORMALIZATION(this.normalUnscaled);
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
    }
    FudgeCore.Face = Face;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    var Mesh_1;
    let Mesh = Mesh_1 = class Mesh extends FudgeCore.Mutable {
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
        get type() {
            return this.constructor.name;
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
        getRenderBuffers(_shader) { return null; }
        deleteRenderBuffers(_shader) { }
        clear() {
            this.ƒbox = undefined;
            this.ƒradius = undefined;
            this.renderMesh?.clear();
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
    Mesh.baseClass = Mesh_1;
    Mesh.subclasses = [];
    Mesh = Mesh_1 = __decorate([
        FudgeCore.RenderInjectorMesh.decorate
    ], Mesh);
    FudgeCore.Mesh = Mesh;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class MeshCube extends FudgeCore.Mesh {
        constructor(_name = "MeshCube") {
            super(_name);
            this.vertices = new FudgeCore.Vertices(new FudgeCore.Vertex(new FudgeCore.Vector3(-0.5, 0.5, 0.5), new FudgeCore.Vector2(0, 0)), new FudgeCore.Vertex(new FudgeCore.Vector3(-0.5, -0.5, 0.5), new FudgeCore.Vector2(0, 1)), new FudgeCore.Vertex(new FudgeCore.Vector3(0.5, -0.5, 0.5), new FudgeCore.Vector2(1, 1)), new FudgeCore.Vertex(new FudgeCore.Vector3(0.5, 0.5, 0.5), new FudgeCore.Vector2(1, 0)), new FudgeCore.Vertex(new FudgeCore.Vector3(-0.5, 0.5, -0.5), new FudgeCore.Vector2(3, 0)), new FudgeCore.Vertex(new FudgeCore.Vector3(-0.5, -0.5, -0.5), new FudgeCore.Vector2(3, 1)), new FudgeCore.Vertex(new FudgeCore.Vector3(0.5, -0.5, -0.5), new FudgeCore.Vector2(2, 1)), new FudgeCore.Vertex(new FudgeCore.Vector3(0.5, 0.5, -0.5), new FudgeCore.Vector2(2, 0)), new FudgeCore.Vertex(0, new FudgeCore.Vector2(4, 0)), new FudgeCore.Vertex(1, new FudgeCore.Vector2(4, 1)), new FudgeCore.Vertex(3, new FudgeCore.Vector2(0, 1)), new FudgeCore.Vertex(7, new FudgeCore.Vector2(1, 1)), new FudgeCore.Vertex(4, new FudgeCore.Vector2(1, 0)), new FudgeCore.Vertex(2, new FudgeCore.Vector2(0, 0)), new FudgeCore.Vertex(6, new FudgeCore.Vector2(1, 0)), new FudgeCore.Vertex(5, new FudgeCore.Vector2(1, 1)));
            this.faces = [
                ...new FudgeCore.Quad(this.vertices, 0, 1, 2, 3).faces,
                ...new FudgeCore.Quad(this.vertices, 7, 6, 5, 4).faces,
                ...new FudgeCore.Quad(this.vertices, 3, 2, 6, 7).faces,
                ...new FudgeCore.Quad(this.vertices, 4, 5, 9, 8).faces,
                ...new FudgeCore.Quad(this.vertices, 0, 10, 11, 12).faces,
                ...new FudgeCore.Quad(this.vertices, 13, 1, 15, 14).faces
            ];
        }
    }
    MeshCube.iSubclass = FudgeCore.Mesh.registerSubclass(MeshCube);
    FudgeCore.MeshCube = MeshCube;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class MeshPolygon extends FudgeCore.Mesh {
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
                    let textureUV = FudgeCore.Vector2.SUM(shape[i], min);
                    this.vertices[i].uv = new FudgeCore.Vector2(textureUV.x / size.x, -textureUV.y / size.y);
                }
            }
            else {
                _shape.forEach((_vertex, i) => this.vertices[i].uv = new FudgeCore.Vector2(_vertex.x, -_vertex.y));
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
        async mutate(_mutator) {
            await super.mutate(_mutator);
            this.create(this.shape, this.fitTexture);
            this.dispatchEvent(new Event("mutate"));
        }
        reduceMutator(_mutator) {
            super.reduceMutator(_mutator);
        }
    }
    MeshPolygon.iSubclass = FudgeCore.Mesh.registerSubclass(MeshPolygon);
    MeshPolygon.shapeDefault = [
        new FudgeCore.Vector2(-1, -1),
        new FudgeCore.Vector2(1, -1),
        new FudgeCore.Vector2(0, 1)
    ];
    FudgeCore.MeshPolygon = MeshPolygon;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class MeshExtrusion extends FudgeCore.MeshPolygon {
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
    MeshExtrusion.iSubclass = FudgeCore.Mesh.registerSubclass(MeshExtrusion);
    MeshExtrusion.mtxDefaults = [
        FudgeCore.Matrix4x4.TRANSLATION(FudgeCore.Vector3.Z(0.5)),
        FudgeCore.Matrix4x4.TRANSLATION(FudgeCore.Vector3.Z(-0.5))
    ];
    FudgeCore.MeshExtrusion = MeshExtrusion;
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
    class MeshImport extends FudgeCore.Mesh {
        serialize() {
            const serialization = super.serialize();
            serialization.url = this.url.toString();
            serialization.filetype = this.loader.name.replace(FudgeCore.MeshLoader.name, "");
            return serialization;
        }
        async deserialize(_serialization) {
            super.deserialize(_serialization);
            this.url = _serialization.url;
            this.loader = Reflect.get(FudgeCore, FudgeCore.MeshLoader.name.concat(_serialization.filetype));
            return this.load();
        }
        async load(_loader = this.loader, _url = this.url, _data) {
            this.url = _url;
            this.loader = _loader;
            if (!this.renderMesh)
                this.renderMesh = new FudgeCore.RenderMesh(this);
            this.clear();
            return _loader.load(this, _data);
        }
        async mutate(_mutator) {
            super.mutate(_mutator);
            if (typeof (_mutator.url) !== "undefined")
                this.load(this.loader, _mutator.url);
        }
    }
    FudgeCore.MeshImport = MeshImport;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class MeshPyramid extends FudgeCore.Mesh {
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
    MeshPyramid.iSubclass = FudgeCore.Mesh.registerSubclass(MeshPyramid);
    FudgeCore.MeshPyramid = MeshPyramid;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class MeshQuad extends FudgeCore.MeshPolygon {
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
    MeshQuad.iSubclass = FudgeCore.Mesh.registerSubclass(MeshQuad);
    MeshQuad.shape = [
        new FudgeCore.Vector2(-0.5, 0.5), new FudgeCore.Vector2(-0.5, -0.5), new FudgeCore.Vector2(0.5, -0.5), new FudgeCore.Vector2(0.5, 0.5)
    ];
    FudgeCore.MeshQuad = MeshQuad;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class TerrainInfo {
    }
    FudgeCore.TerrainInfo = TerrainInfo;
    class MeshTerrain extends FudgeCore.Mesh {
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
            this.faces = quads.flatMap((quad) => quad.faces);
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
        async mutate(_mutator) {
            super.mutate(_mutator);
            this.create(this.resolution, this.scale, this.seed);
        }
    }
    MeshTerrain.iSubclass = FudgeCore.Mesh.registerSubclass(MeshTerrain);
    FudgeCore.MeshTerrain = MeshTerrain;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class MeshRelief extends FudgeCore.MeshTerrain {
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
    MeshRelief.iSubclass = FudgeCore.Mesh.registerSubclass(MeshRelief);
    FudgeCore.MeshRelief = MeshRelief;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class MeshRotation extends FudgeCore.Mesh {
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
        async mutate(_mutator) {
            await super.mutate(_mutator);
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
            distances.forEach((entry, index) => { distances[index] = entry / total; });
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
    MeshRotation.iSubclass = FudgeCore.Mesh.registerSubclass(MeshRotation);
    MeshRotation.verticesDefault = [
        new FudgeCore.Vector2(0.5, 0.5),
        new FudgeCore.Vector2(0.5, -0.5)
    ];
    FudgeCore.MeshRotation = MeshRotation;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class RenderInjectorMeshSkin extends FudgeCore.RenderInjectorMesh {
        static decorate(_constructor) {
            Object.defineProperty(_constructor.prototype, "useRenderBuffers", {
                value: RenderInjectorMeshSkin.useRenderBuffers
            });
            Object.defineProperty(_constructor.prototype, "getRenderBuffers", {
                value: RenderInjectorMeshSkin.getRenderBuffers
            });
            Object.defineProperty(_constructor.prototype, "deleteRenderBuffers", {
                value: RenderInjectorMeshSkin.deleteRenderBuffers
            });
        }
        static getRenderBuffers(_shader) {
            let renderBuffers = super.getRenderBuffers.call(this, _shader);
            const crc3 = FudgeCore.RenderWebGL.getRenderingContext();
            let iBones = this.renderMesh.iBones;
            let weights = this.renderMesh.weights;
            if (_shader.define.includes("FLAT")) {
                iBones = this.renderMesh.iBonesFlat;
                weights = this.renderMesh.weightsFlat;
            }
            if (!renderBuffers.iBones) {
                renderBuffers.iBones = FudgeCore.RenderWebGL.assert(crc3.createBuffer());
                crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, renderBuffers.iBones);
                crc3.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, iBones, WebGL2RenderingContext.STATIC_DRAW);
            }
            if (!renderBuffers.weights) {
                renderBuffers.weights = FudgeCore.RenderWebGL.assert(crc3.createBuffer());
                crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, renderBuffers.weights);
                crc3.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, weights, WebGL2RenderingContext.STATIC_DRAW);
            }
            if (!renderBuffers.mtxBones) {
                const bones = crc3.getUniformBlockIndex(_shader.program, FudgeCore.UNIFORM_BLOCKS.SKIN.NAME);
                const bonesSize = crc3.getActiveUniformBlockParameter(_shader.program, bones, crc3.UNIFORM_BLOCK_DATA_SIZE);
                renderBuffers.mtxBones = crc3.createBuffer();
                crc3.bindBufferBase(crc3.UNIFORM_BUFFER, FudgeCore.UNIFORM_BLOCKS.SKIN.BINDING, renderBuffers.mtxBones);
                crc3.bufferData(crc3.UNIFORM_BUFFER, bonesSize, crc3.DYNAMIC_DRAW);
                crc3.uniformBlockBinding(_shader.program, bones, FudgeCore.UNIFORM_BLOCKS.SKIN.BINDING);
            }
            return renderBuffers;
        }
        static useRenderBuffers(_shader, _mtxMeshToWorld, _mtxMeshToView, _id, _mtxBones) {
            let renderBuffers = super.useRenderBuffers.call(this, _shader, _mtxMeshToWorld, _mtxMeshToView, _id);
            const crc3 = FudgeCore.RenderWebGL.getRenderingContext();
            const aIBone = _shader.attributes["a_iBone"];
            if (aIBone) {
                crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, renderBuffers.iBones);
                crc3.enableVertexAttribArray(aIBone);
                crc3.vertexAttribIPointer(aIBone, 4, WebGL2RenderingContext.UNSIGNED_BYTE, 0, 0);
            }
            const aWeight = _shader.attributes["a_fWeight"];
            if (aWeight) {
                crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, renderBuffers.weights);
                crc3.enableVertexAttribArray(aWeight);
                crc3.vertexAttribPointer(aWeight, 4, WebGL2RenderingContext.FLOAT, false, 0, 0);
            }
            if (_mtxBones) {
                const skin = crc3.getUniformBlockIndex(_shader.program, FudgeCore.UNIFORM_BLOCKS.SKIN.NAME);
                crc3.uniformBlockBinding(_shader.program, skin, FudgeCore.UNIFORM_BLOCKS.SKIN.BINDING);
                crc3.bindBuffer(crc3.UNIFORM_BUFFER, renderBuffers.mtxBones);
                crc3.bufferSubData(crc3.UNIFORM_BUFFER, 0, new Float32Array(iterableFrom(_mtxBones)));
            }
            return renderBuffers;
        }
        static deleteRenderBuffers(_renderBuffers) {
            super.deleteRenderBuffers(_renderBuffers);
            const crc3 = FudgeCore.RenderWebGL.getRenderingContext();
            if (_renderBuffers) {
                crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, null);
                crc3.deleteBuffer(_renderBuffers.iBones);
                crc3.deleteBuffer(_renderBuffers.weights);
                crc3.deleteBuffer(_renderBuffers.mtxBones);
            }
        }
    }
    FudgeCore.RenderInjectorMeshSkin = RenderInjectorMeshSkin;
    function* iterableFrom(_matrices) {
        for (const matrix of _matrices)
            for (const value of matrix.get())
                yield value;
    }
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    let MeshSkin = class MeshSkin extends FudgeCore.MeshImport {
        useRenderBuffers(_shader, _mtxWorld, _mtxProjection, _id, _mtxBones) { return null; }
        reduceMutator(_mutator) {
            super.reduceMutator(_mutator);
        }
    };
    MeshSkin = __decorate([
        FudgeCore.RenderInjectorMeshSkin.decorate
    ], MeshSkin);
    FudgeCore.MeshSkin = MeshSkin;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class MeshSphere extends FudgeCore.MeshRotation {
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
        async mutate(_mutator) {
            super.mutate(_mutator);
            this.create(this.longitudes, this.latitudes);
        }
        reduceMutator(_mutator) {
            super.reduceMutator(_mutator);
            delete _mutator.shape;
        }
    }
    MeshSphere.iSubclass = FudgeCore.Mesh.registerSubclass(MeshSphere);
    FudgeCore.MeshSphere = MeshSphere;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class MeshSprite extends FudgeCore.Mesh {
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
    MeshSprite.iSubclass = FudgeCore.Mesh.registerSubclass(MeshSprite);
    FudgeCore.MeshSprite = MeshSprite;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class MeshTorus extends FudgeCore.MeshRotation {
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
        async mutate(_mutator) {
            super.mutate(_mutator);
            this.create(this.size, this.longitudes, this.latitudes);
        }
        reduceMutator(_mutator) {
            super.reduceMutator(_mutator);
            delete _mutator.shape;
        }
    }
    MeshTorus.iSubclass = FudgeCore.Mesh.registerSubclass(MeshTorus);
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
        #split;
        get split() {
            return this.#split;
        }
    }
    FudgeCore.Quad = Quad;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Vertex {
        constructor(_positionOrIndex, _uv = null, _normal = FudgeCore.Vector3.ZERO()) {
            if (_positionOrIndex instanceof FudgeCore.Vector3)
                this.position = _positionOrIndex;
            else
                this.referTo = _positionOrIndex;
            this.uv = _uv;
            this.normal = _normal;
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
        uv(_index) {
            return this[_index].uv;
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
    class MeshLoader {
        static async load(_mesh, _data) {
            return _mesh;
        }
    }
    FudgeCore.MeshLoader = MeshLoader;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class MeshLoaderFBX extends FudgeCore.MeshLoader {
        static async load(_mesh, _data) {
            const loader = await FudgeCore.FBXLoader.LOAD(_mesh.url.toString());
            const geometryFBX = (_data ||
                loader.fbx.objects.geometries.find(object => object.name == _mesh.name) ||
                loader.fbx.objects.models.find(object => object.name == _mesh.name && object.subtype == "Mesh").children[0]).load();
            if (_data)
                _mesh.name = _data.name.length > 0 ? _data.name : _data.parents[0].name;
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
                let uv = uvs[getDataIndex(geometryFBX.LayerElementUV, _iVertex, iPolygon, _iPolygonVertex)];
                let vertexKey = position.toString() + uv.toString();
                if (!mapVertexToIndex.has(vertexKey)) {
                    let normal = normals[getDataIndex(geometryFBX.LayerElementNormal, _iVertex, iPolygon, _iPolygonVertex)];
                    _mesh.vertices.push(new FudgeCore.Vertex(position, uv, normal));
                    mapVertexToIndex.set(vertexKey, _mesh.vertices.length - 1);
                    if (!newVertexIndices[_iVertex])
                        newVertexIndices[_iVertex] = [];
                    newVertexIndices[_iVertex].push(_mesh.vertices.length - 1);
                }
                polygon.push(mapVertexToIndex.get(vertexKey));
                if (isEndOfPolygon) {
                    if (polygon.length == 3) {
                        _mesh.faces.push(new FudgeCore.Face(_mesh.vertices, polygon[0], polygon[1], polygon[2]));
                    }
                    else if (polygon.length == 4) {
                        let quad = new FudgeCore.Quad(_mesh.vertices, polygon[0], polygon[1], polygon[2], polygon[3], FudgeCore.QUADSPLIT.AT_0);
                        _mesh.faces.push(...quad.faces);
                    }
                    else {
                        console.warn(`${MeshLoaderFBX.name}: Polygons with more than 4 vertices are not supported.`);
                    }
                    polygon = [];
                    isEndOfPolygon = false;
                    iPolygon++;
                }
            });
            if (_mesh instanceof FudgeCore.MeshSkin) {
                const fbxDeformer = geometryFBX.children[0];
                const skeleton = await loader.getSkeleton(fbxDeformer.children[0].children[0]);
                createBones(fbxDeformer, skeleton, _mesh.vertices, newVertexIndices);
            }
            return _mesh;
        }
    }
    FudgeCore.MeshLoaderFBX = MeshLoaderFBX;
    function getDataIndex(_layerElement, _iVertex, _iPolygon, _iPolygonVertex) {
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
    function createBones(_deformerFBX, _skeleton, _vertices, _newVertexIndices) {
        for (const fbxSubDeformer of _deformerFBX.children) {
            fbxSubDeformer.load();
            if (fbxSubDeformer.Indexes)
                for (let iBoneInfluence = 0; iBoneInfluence < fbxSubDeformer.Indexes.length; iBoneInfluence++) {
                    const iVertex = fbxSubDeformer.Indexes[iBoneInfluence];
                    for (const iVertexNew of _newVertexIndices ? _newVertexIndices[iVertex] : [iVertex]) {
                        (_vertices[iVertexNew].bones || (_vertices[iVertexNew].bones = [])).push({
                            index: _skeleton.indexOfBone(fbxSubDeformer.children[0].name),
                            weight: fbxSubDeformer.Weights[iBoneInfluence] || 1
                        });
                    }
                }
        }
    }
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class MeshLoaderGLTF extends FudgeCore.MeshLoader {
        static async load(_mesh, _data) {
            const loader = await FudgeCore.GLTFLoader.LOAD(_mesh.url.toString());
            const meshGLTF = _data || loader.gltf.meshes.find(gltfMesh => gltfMesh.name == _mesh.name);
            const renderMesh = Reflect.get(_mesh, "renderMesh");
            _mesh.name = _data.name;
            Reflect.set(renderMesh, "ƒindices", await loader.getUint16Array(meshGLTF.primitives[0].indices));
            Reflect.set(renderMesh, "ƒvertices", await loader.getFloat32Array(meshGLTF.primitives[0].attributes.POSITION));
            if (meshGLTF.primitives[0].attributes.NORMAL)
                Reflect.set(renderMesh, "ƒnormalsVertex", await loader.getFloat32Array(meshGLTF.primitives[0].attributes.NORMAL));
            if (meshGLTF.primitives[0].attributes.TEXCOORD_0)
                Reflect.set(renderMesh, "ƒtextureUVs", await loader.getFloat32Array(meshGLTF.primitives[0].attributes.TEXCOORD_0));
            _mesh.vertices.push(...getVertices(renderMesh));
            _mesh.faces.push(...getFaces(renderMesh, _mesh.vertices));
            if (_mesh instanceof FudgeCore.MeshSkin) {
                Reflect.set(renderMesh, "ƒiBones", await loader.getUint8Array(meshGLTF.primitives[0].attributes.JOINTS_0));
                Reflect.set(renderMesh, "ƒweights", await loader.getFloat32Array(meshGLTF.primitives[0].attributes.WEIGHTS_0));
                createBones(renderMesh, _mesh.vertices);
            }
            return _mesh;
        }
    }
    FudgeCore.MeshLoaderGLTF = MeshLoaderGLTF;
    function* getVertices(_renderMesh) {
        for (let iVertex = 0, iTextureUV = 0; iVertex < _renderMesh.vertices.length; iVertex += 3, iTextureUV += 2) {
            yield new FudgeCore.Vertex(new FudgeCore.Vector3(_renderMesh.vertices[iVertex + 0], _renderMesh.vertices[iVertex + 1], _renderMesh.vertices[iVertex + 2]), new FudgeCore.Vector2(_renderMesh.textureUVs[iTextureUV + 0], _renderMesh.textureUVs[iTextureUV + 1]), new FudgeCore.Vector3(_renderMesh.normalsVertex[iVertex + 0], _renderMesh.normalsVertex[iVertex + 1], _renderMesh.normalsVertex[iVertex + 2]));
        }
    }
    function* getFaces(_renderMesh, _vertices) {
        for (let iFaceVertexIndex = 0; iFaceVertexIndex < _renderMesh.indices.length; iFaceVertexIndex += 3) {
            yield new FudgeCore.Face(_vertices, _renderMesh.indices[iFaceVertexIndex + 0], _renderMesh.indices[iFaceVertexIndex + 1], _renderMesh.indices[iFaceVertexIndex + 2]);
        }
    }
    function createBones(_renderMesh, _vertices) {
        for (let iVertex = 0, iBoneEntry = 0; iVertex < _vertices.length; iVertex++) {
            _vertices[iVertex].bones = [];
            for (let i = 0; i < 4; i++, iBoneEntry++) {
                _vertices[iVertex].bones.push({
                    index: _renderMesh.iBones[iBoneEntry],
                    weight: _renderMesh.weights[iBoneEntry]
                });
            }
        }
    }
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class MeshLoaderOBJ extends FudgeCore.MeshLoader {
        static async load(_mesh) {
            let url = new URL(_mesh.url.toString(), FudgeCore.Project.baseURL).toString();
            let data = await (await fetch(url)).text();
            _mesh.name = url.split("/").pop();
            parseObj(data, _mesh);
            return _mesh;
        }
    }
    FudgeCore.MeshLoaderOBJ = MeshLoaderOBJ;
    function parseObj(_data, _mesh) {
        const lines = _data.split("\n");
        let positions = [];
        let uvs = [];
        let faceInfo = [];
        for (let line of lines) {
            line = line.trim();
            if (!line || line.startsWith("#"))
                continue;
            const parts = line.split(" ");
            parts.shift();
            if (line.startsWith("v "))
                positions.push(new FudgeCore.Vector3(...parts.map(_value => +_value)));
            else if (line.startsWith("vt "))
                uvs.push(new FudgeCore.Vector2(...parts.map((_value, _index) => +_value * (_index == 1 ? -1 : 1))));
            else if (line.startsWith("f "))
                for (let i = 0; i < 3; i++) {
                    faceInfo.push({
                        iPosition: +parts[i].split("/")[0] - 1,
                        iUV: +parts[i].split("/")[1] - 1,
                        iNormal: +parts[i].split("/")[2] - 1
                    });
                }
        }
        _mesh.vertices = new FudgeCore.Vertices(...positions.map((_p) => new FudgeCore.Vertex(_p)));
        for (let i = 0; i < faceInfo.length; i += 3) {
            let indices = [];
            for (let v = 0; v < 3; v++) {
                let info = faceInfo[i + v];
                let index = info.iPosition;
                if (_mesh.vertices[index].uv) {
                    index = _mesh.vertices.length;
                    _mesh.vertices.push(new FudgeCore.Vertex(info.iPosition));
                }
                _mesh.vertices[index].uv = uvs[info.iUV];
                indices.push(index);
            }
            _mesh.faces.push(new FudgeCore.Face(_mesh.vertices, indices[0], indices[1], indices[2]));
        }
    }
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
        constructor(_name = ParticleSystem.name, _data = {}) {
            super();
            this.idResource = undefined;
            this.shaderToShaderParticleSystem = new Map();
            this.name = _name;
            this.data = _data;
            FudgeCore.Project.register(this);
        }
        #data;
        get data() {
            return this.#data;
        }
        set data(_data) {
            this.#data = _data;
            this.shaderToShaderParticleSystem.forEach(shader => shader.deleteProgram());
            this.shaderToShaderParticleSystem.clear();
        }
        getShaderFrom(_source) {
            if (!this.shaderToShaderParticleSystem.has(_source)) {
                let particleShader = new FudgeCore.ShaderParticleSystem();
                particleShader.data = this.data;
                particleShader.vertexShaderSource = _source.getVertexShaderSource();
                particleShader.fragmentShaderSource = _source.getFragmentShaderSource();
                this.shaderToShaderParticleSystem.set(_source, particleShader);
            }
            return this.shaderToShaderParticleSystem.get(_source);
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
    let BODY_INIT;
    (function (BODY_INIT) {
        BODY_INIT[BODY_INIT["TO_MESH"] = 0] = "TO_MESH";
        BODY_INIT[BODY_INIT["TO_NODE"] = 1] = "TO_NODE";
        BODY_INIT[BODY_INIT["TO_PIVOT"] = 2] = "TO_PIVOT";
    })(BODY_INIT = FudgeCore.BODY_INIT || (FudgeCore.BODY_INIT = {}));
    class ComponentRigidbody extends FudgeCore.Component {
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
                            FudgeCore.Debug.warn(`ComponentRigidbody attached to node missing ComponentTransform`, this.node);
                        break;
                    case "componentRemove":
                        this.removeEventListener("componentRemove", this.removeRigidbodyFromWorld);
                        this.node.removeEventListener("nodeDeactivate", this.removeRigidbodyFromWorld, true);
                        this.removeRigidbodyFromWorld();
                        break;
                    case "nodeDeserialized":
                        if (!this.node.cmpTransform)
                            FudgeCore.Debug.error(`ComponentRigidbody attached to node missing ComponentTransform`, this.node);
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
            let tmpQuat = new FudgeCore.PhysicsQuaternion(orientation.x, orientation.y, orientation.z, orientation.w);
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
            let scalingInverse = this.node.mtxWorld.scaling.map(_i => 1 / _i);
            this.#mtxPivotUnscaled = FudgeCore.Matrix4x4.CONSTRUCTION({ translation: this.mtxPivot.translation, rotation: this.mtxPivot.rotation, scaling: scalingInverse });
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
        deactivateAutoSleep() {
            this.#rigidbody.setAutoSleep(false);
        }
        activateAutoSleep() {
            this.#rigidbody.setAutoSleep(true);
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
        async mutate(_mutator) {
            if (_mutator.typeBody != undefined)
                _mutator.typeBody = parseInt(_mutator.typeBody);
            if (_mutator.typeCollider != undefined)
                _mutator.typeCollider = parseInt(_mutator.typeCollider);
            if (_mutator.initialization != undefined)
                _mutator.initialization = parseInt(_mutator.initialization);
            await super.mutate(_mutator);
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
    ComponentRigidbody.iSubclass = FudgeCore.Component.registerSubclass(ComponentRigidbody);
    ComponentRigidbody.mapBodyType = (typeof OIMO == "undefined") ?
        {
            [FudgeCore.BODY_TYPE.DYNAMIC]: FudgeCore.BODY_TYPE.DYNAMIC, [FudgeCore.BODY_TYPE.STATIC]: FudgeCore.BODY_TYPE.STATIC, [FudgeCore.BODY_TYPE.KINEMATIC]: FudgeCore.BODY_TYPE.KINEMATIC
        } : {
        [FudgeCore.BODY_TYPE.DYNAMIC]: OIMO.RigidBodyType.DYNAMIC, [FudgeCore.BODY_TYPE.STATIC]: OIMO.RigidBodyType.STATIC, [FudgeCore.BODY_TYPE.KINEMATIC]: OIMO.RigidBodyType.KINEMATIC
    };
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
        constructor(_bodyAnchor = null, _bodyTied = null, _axis = new FudgeCore.Vector3(0, 1, 0), _localAnchor = new FudgeCore.Vector3(0, 0, 0)) {
            super(_bodyAnchor, _bodyTied, _axis, _localAnchor);
            this.#springDampingRotation = 0;
            this.#springFrequencyRotation = 0;
            this.#motorForce = 0;
            this.#maxRotor = 360;
            this.#minRotor = 0;
            this.#rotorTorque = 0;
            this.#rotorSpeed = 0;
            this.config = new OIMO.CylindricalJointConfig();
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
        #springDampingRotation;
        #springFrequencyRotation;
        #motorForce;
        #maxRotor;
        #minRotor;
        #rotorTorque;
        #rotorSpeed;
        #rotor;
        #rotorSpringDamper;
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
        #getMutator;
        #mutate;
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
    }
    JointCylindrical.iSubclass = FudgeCore.Joint.registerSubclass(JointCylindrical);
    FudgeCore.JointCylindrical = JointCylindrical;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class JointPrismatic extends FudgeCore.JointAxial {
        constructor(_bodyAnchor = null, _bodyTied = null, _axis = new FudgeCore.Vector3(0, 1, 0), _localAnchor = new FudgeCore.Vector3(0, 0, 0)) {
            super(_bodyAnchor, _bodyTied, _axis, _localAnchor);
            this.#motorForce = 0;
            this.config = new OIMO.PrismaticJointConfig();
            this.maxMotor = 10;
            this.minMotor = -10;
        }
        #motorForce;
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
            if (typeof (_mutator.motorForce) !== "undefined")
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
    JointPrismatic.iSubclass = FudgeCore.Joint.registerSubclass(JointPrismatic);
    FudgeCore.JointPrismatic = JointPrismatic;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class JointRagdoll extends FudgeCore.Joint {
        constructor(_bodyAnchor = null, _bodyTied = null, _axisFirst = new FudgeCore.Vector3(1, 0, 0), _axisSecond = new FudgeCore.Vector3(0, 0, 1), _localAnchor = new FudgeCore.Vector3(0, 0, 0)) {
            super(_bodyAnchor, _bodyTied);
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
            this.config = new OIMO.RagdollJointConfig();
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
        async mutate(_mutator) {
            if (typeof (_mutator.axisFirst) !== "undefined")
                this.axisFirst = new FudgeCore.Vector3(...(Object.values(_mutator.axisFirst)));
            if (typeof (_mutator.axisSecond) !== "undefined")
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
        #getMutator;
        #mutate;
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
    JointRagdoll.iSubclass = FudgeCore.Joint.registerSubclass(JointRagdoll);
    FudgeCore.JointRagdoll = JointRagdoll;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class JointRevolute extends FudgeCore.JointAxial {
        constructor(_bodyAnchor = null, _bodyTied = null, _axis = new FudgeCore.Vector3(0, 1, 0), _localAnchor = new FudgeCore.Vector3(0, 0, 0)) {
            super(_bodyAnchor, _bodyTied, _axis, _localAnchor);
            this.#motorTorque = 0;
            this.config = new OIMO.RevoluteJointConfig();
            this.maxMotor = 360;
            this.minMotor = 0;
        }
        #motorTorque;
        #rotor;
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
        async mutate(_mutator) {
            if (typeof (_mutator.motorTorque) !== "undefined")
                this.motorTorque = _mutator.motorTorque;
            delete _mutator.motorTorque;
            super.mutate(_mutator);
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
    JointRevolute.iSubclass = FudgeCore.Joint.registerSubclass(JointRevolute);
    FudgeCore.JointRevolute = JointRevolute;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class JointSpherical extends FudgeCore.Joint {
        constructor(_bodyAnchor = null, _bodyTied = null, _localAnchor = new FudgeCore.Vector3(0, 0, 0)) {
            super(_bodyAnchor, _bodyTied);
            this.#springDamping = 0;
            this.#springFrequency = 0;
            this.config = new OIMO.SphericalJointConfig();
            this.anchor = new FudgeCore.Vector3(_localAnchor.x, _localAnchor.y, _localAnchor.z);
        }
        #springDamping;
        #springFrequency;
        #springDamper;
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
            this.mutateBase(_mutator, ["springDamping", "springFrequency"]);
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
    JointSpherical.iSubclass = FudgeCore.Joint.registerSubclass(JointSpherical);
    FudgeCore.JointSpherical = JointSpherical;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class JointUniversal extends FudgeCore.Joint {
        constructor(_bodyAnchor = null, _bodyTied = null, _axisFirst = new FudgeCore.Vector3(1, 0, 0), _axisSecond = new FudgeCore.Vector3(0, 0, 1), _localAnchor = new FudgeCore.Vector3(0, 0, 0)) {
            super(_bodyAnchor, _bodyTied);
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
            this.config = new OIMO.UniversalJointConfig();
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
        async mutate(_mutator) {
            if (typeof (_mutator.axisFirst) !== "undefined")
                this.axisFirst = new FudgeCore.Vector3(...(Object.values(_mutator.axisFirst)));
            if (typeof (_mutator.axisSecond) !== "undefined")
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
        #getMutator;
        #mutate;
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
    }
    JointUniversal.iSubclass = FudgeCore.Joint.registerSubclass(JointUniversal);
    FudgeCore.JointUniversal = JointUniversal;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class JointWelding extends FudgeCore.Joint {
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
    JointWelding.iSubclass = FudgeCore.Joint.registerSubclass(JointWelding);
    FudgeCore.JointWelding = JointWelding;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Physics {
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
        #debugDraw;
        #mainCam;
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
                Physics.ƒactive.bodyList.forEach(function (value) {
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
        static getRayEndPoint(start, direction, length) {
            let origin = FudgeCore.Recycler.get(FudgeCore.Vector3);
            origin.set(start.x, start.y, start.z);
            let scaledDirection = direction.clone;
            scaledDirection.scale(length);
            let endpoint = FudgeCore.Vector3.SUM(scaledDirection, origin);
            FudgeCore.Recycler.store(scaledDirection);
            FudgeCore.Recycler.store(endpoint);
            FudgeCore.Recycler.store(origin);
            return new OIMO.Vec3(endpoint.x, endpoint.y, endpoint.z);
        }
        static getRayDistance(origin, hitPoint) {
            let dx = origin.x - hitPoint.x;
            let dy = origin.y - hitPoint.y;
            let dz = origin.z - hitPoint.z;
            return Math.sqrt(dx * dx + dy * dy + dz * dz);
        }
        getOimoWorld() {
            return Physics.ƒactive.oimoWorld;
        }
    }
    Physics.settings = new FudgeCore.PhysicsSettings(FudgeCore.COLLISION_GROUP.DEFAULT, (FudgeCore.COLLISION_GROUP.DEFAULT | FudgeCore.COLLISION_GROUP.GROUP_1 | FudgeCore.COLLISION_GROUP.GROUP_2 | FudgeCore.COLLISION_GROUP.GROUP_3 | FudgeCore.COLLISION_GROUP.GROUP_4));
    Physics.ƒactive = new Physics();
    FudgeCore.Physics = Physics;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class PhysicsQuaternion extends FudgeCore.Mutable {
        constructor(_x = 0, _y = 0, _z = 0, _w = 0) {
            super();
            this.#x = _x;
            this.#y = _y;
            this.#z = _z;
            this.#w = _w;
        }
        #x;
        #y;
        #z;
        #w;
        get x() {
            return this.#x;
        }
        set x(_x) {
            this.#x = _x;
        }
        get y() {
            return this.#y;
        }
        set y(_y) {
            this.#y = _y;
        }
        get z() {
            return this.#z;
        }
        set z(_z) {
            this.#z = _z;
        }
        get w() {
            return this.#w;
        }
        set w(_w) {
            this.#w = _w;
        }
        multiply(_other, _fromLeft = false) {
            const a = _fromLeft ? _other : this;
            const b = _fromLeft ? this : _other;
            const x = a.x * b.x - a.y * b.y - a.z * b.z - a.w * b.w;
            const y = a.x * b.y + a.y * b.x + a.z * b.w - a.w * b.z;
            const z = a.x * b.z - a.y * b.w + a.z * b.x + a.w * b.y;
            const w = a.x * b.w + a.y * b.z - a.z * b.y + a.w * b.x;
            this.x = x;
            this.y = y;
            this.z = z;
            this.w = w;
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
            angles.x = angles.x * (FudgeCore.Calc.rad2deg);
            angles.y = angles.y * (FudgeCore.Calc.rad2deg);
            angles.z = angles.z * (FudgeCore.Calc.rad2deg);
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
    FudgeCore.PhysicsQuaternion = PhysicsQuaternion;
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
        constructor(_node) {
            this.node = _node;
        }
        #mtxViewToWorld;
        #posWorld;
        #posMesh;
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
        static pickRay(_nodes, _ray, _min, _max) {
            let cmpCameraPick = new FudgeCore.ComponentCamera();
            cmpCameraPick.mtxPivot.translation = _ray.origin;
            cmpCameraPick.mtxPivot.lookAt(_ray.direction);
            cmpCameraPick.projectCentral(1, 0.001, FudgeCore.FIELD_OF_VIEW.DIAGONAL, _min, _max);
            let picks = FudgeCore.Render.pickBranch(_nodes, cmpCameraPick);
            return picks;
        }
        static pickCamera(_nodes, _cmpCamera, _posProjection) {
            let ray = new FudgeCore.Ray(new FudgeCore.Vector3(-_posProjection.x, _posProjection.y, 1));
            let length = ray.direction.magnitude;
            if (_cmpCamera.node) {
                let mtxCamera = FudgeCore.Matrix4x4.MULTIPLICATION(_cmpCamera.node.mtxWorld, _cmpCamera.mtxPivot);
                ray.transform(mtxCamera);
                FudgeCore.Recycler.store(mtxCamera);
            }
            else
                ray.transform(_cmpCamera.mtxPivot);
            let picks = Picker.pickRay(_nodes, ray, length * _cmpCamera.getNear(), length * _cmpCamera.getFar());
            return picks;
        }
        static pickViewport(_viewport, _posClient) {
            let posProjection = _viewport.pointClientToProjection(_posClient);
            let nodes = Array.from(_viewport.getBranch().getIterator(true));
            let picks = Picker.pickCamera(nodes, _viewport.camera, posProjection);
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
        static prepare(_branch, _options = {}, _mtxWorld = FudgeCore.Matrix4x4.IDENTITY(), _shadersUsed = null) {
            let firstLevel = (_shadersUsed == null);
            if (firstLevel) {
                _shadersUsed = [];
                Render.timestampUpdate = performance.now();
                Render.nodesSimple.reset();
                Render.nodesAlpha.reset();
                Render.nodesPhysics.reset();
                Render.componentsPick.reset();
                Render.lights.forEach(_array => _array.reset());
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
                if (cmpMaterial.sortForAlpha)
                    Render.nodesAlpha.push(_branch);
                else
                    Render.nodesSimple.push(_branch);
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
                for (let shader of _shadersUsed) {
                    Render.setLightsInShader(shader, Render.lights);
                }
            }
        }
        static addLights(cmpLights) {
            for (let cmpLight of cmpLights) {
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
        static pickBranch(_nodes, _cmpCamera) {
            Render.ƒpicked = [];
            let size = Math.ceil(Math.sqrt(_nodes.length));
            Render.createPickTexture(size);
            Render.setBlendMode(FudgeCore.BLEND.OPAQUE);
            for (let node of _nodes) {
                let cmpMesh = node.getComponent(FudgeCore.ComponentMesh);
                let cmpMaterial = node.getComponent(FudgeCore.ComponentMaterial);
                if (cmpMesh && cmpMesh.isActive && cmpMaterial && cmpMaterial.isActive) {
                    Render.pick(node, node.mtxWorld, _cmpCamera);
                }
            }
            Render.setBlendMode(FudgeCore.BLEND.TRANSPARENT);
            let picks = Render.getPicks(size, _cmpCamera);
            Render.resetFrameBuffer();
            return picks;
        }
        static draw(_cmpCamera) {
            _cmpCamera.resetWorldToView();
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
                Render.drawNode(node, _cmpCamera);
            }
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
            let mtxWorld = FudgeCore.Matrix4x4.CONSTRUCTION({ translation: _cmpRigidbody.getPosition(), rotation: _cmpRigidbody.getRotation(), scaling: null });
            mtxWorld.multiply(_cmpRigidbody.mtxPivotInverse);
            _node.mtxWorld.translation = mtxWorld.translation;
            _node.mtxWorld.rotation = mtxWorld.rotation;
            let mtxLocal = _node.getParent() ? FudgeCore.Matrix4x4.RELATIVE(_node.mtxWorld, _node.getParent().mtxWorld) : _node.mtxWorld;
            _node.mtxLocal.set(mtxLocal);
            FudgeCore.Recycler.store(mtxWorld);
            FudgeCore.Recycler.store(mtxLocal);
        }
    }
    Render.rectClip = new FudgeCore.Rectangle(-1, 1, 2, -2);
    Render.nodesPhysics = new FudgeCore.RecycableArray();
    Render.componentsPick = new FudgeCore.RecycableArray();
    Render.lights = new Map();
    Render.nodesSimple = new FudgeCore.RecycableArray();
    Render.nodesAlpha = new FudgeCore.RecycableArray();
    FudgeCore.Render = Render;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class RenderMesh {
        constructor(_mesh) {
            this.smooth = null;
            this.flat = null;
            this.mesh = _mesh;
        }
        get iBones() {
            return this.ƒiBones || (this.ƒiBones = this.mesh.vertices.some(_vertex => _vertex.bones) ?
                new Uint8Array(this.mesh.vertices.flatMap((_vertex, _index) => {
                    const bones = this.mesh.vertices.bones(_index);
                    return [bones?.[0]?.index || 0, bones?.[1]?.index || 0, bones?.[2]?.index || 0, bones?.[3]?.index || 0];
                })) :
                undefined);
        }
        get weights() {
            return this.ƒweights || (this.ƒweights = this.mesh.vertices.some(_vertex => _vertex.bones) ?
                new Float32Array(this.mesh.vertices.flatMap((_vertex, _index) => {
                    const bones = this.mesh.vertices.bones(_index);
                    return [bones?.[0]?.weight || 0, bones?.[1]?.weight || 0, bones?.[2]?.weight || 0, bones?.[3]?.weight || 0];
                })) :
                undefined);
        }
        get vertices() {
            return this.ƒvertices || (this.ƒvertices = new Float32Array(this.mesh.vertices.flatMap((_vertex, _index) => {
                return [...this.mesh.vertices.position(_index).get()];
            })));
        }
        get indices() {
            return this.ƒindices || (this.ƒindices = new Uint16Array(this.mesh.faces.flatMap((_face) => [..._face.indices])));
        }
        get normalsVertex() {
            if (this.ƒnormalsVertex == null) {
                this.mesh.vertices.forEach(_vertex => _vertex.normal.set(0, 0, 0));
                for (let face of this.mesh.faces)
                    for (let index of face.indices) {
                        this.mesh.vertices.normal(index).add(face.normalUnscaled);
                    }
                this.mesh.vertices.forEach(_vertex => {
                    if (_vertex.normal.magnitudeSquared > 0)
                        _vertex.normal.normalize();
                });
                this.ƒnormalsVertex = new Float32Array(this.mesh.vertices.flatMap((_vertex, _index) => {
                    return [...this.mesh.vertices.normal(_index).get()];
                }));
            }
            return this.ƒnormalsVertex;
        }
        get textureUVs() {
            return this.ƒtextureUVs || (this.ƒtextureUVs = new Float32Array(this.mesh.vertices
                .filter(_vertex => _vertex.uv)
                .flatMap((_vertex) => [..._vertex.uv.get()])));
        }
        get verticesFlat() {
            return this.ƒverticesFlat || (this.ƒverticesFlat = this.createVerticesFlat());
        }
        get indicesFlat() {
            return this.ƒindicesFlat;
        }
        get normalsFlat() {
            return this.ƒnormalsFlat || (this.ƒnormalsFlat = this.createNormalsFlat());
        }
        get textureUVsFlat() {
            return this.ƒtextureUVsFlat || (this.ƒtextureUVsFlat = this.createTextureUVsFlat());
        }
        get iBonesFlat() {
            return this.ƒiBonesFlat;
        }
        get weightsFlat() {
            return this.ƒweightsFlat;
        }
        clear() {
            this.smooth = null;
            this.flat = null;
            this.ƒvertices = undefined;
            this.ƒindices = undefined;
            this.ƒtextureUVs = undefined;
            this.ƒnormalsVertex = undefined;
            this.ƒnormalsFlat = undefined;
            this.ƒverticesFlat = undefined;
            this.ƒindicesFlat = undefined;
            this.ƒtextureUVsFlat = undefined;
            this.ƒiBones = undefined;
            this.ƒweights = undefined;
        }
        createVerticesFlat() {
            let positions = [];
            let bones = [];
            let indices = [];
            let i = 0;
            for (let face of this.mesh.faces)
                for (let index of face.indices) {
                    indices.push(i++);
                    positions.push(this.mesh.vertices.position(index));
                    let bone = this.mesh.vertices.bones(index);
                    if (bone)
                        bones.push(bone);
                }
            this.ƒindicesFlat = new Uint16Array(indices);
            this.ƒiBonesFlat = new Uint8Array(bones.flatMap((_bones) => {
                return [..._bones.map(_bone => _bone.index)];
            }));
            this.ƒweightsFlat = new Float32Array(bones.flatMap((_bones) => {
                return [..._bones.map(_bone => _bone.weight)];
            }));
            return new Float32Array(positions.flatMap(_v => [..._v.get()]));
        }
        createNormalsFlat() {
            let normals = [];
            let zero = FudgeCore.Vector3.ZERO();
            for (let face of this.mesh.faces) {
                normals.push(zero);
                normals.push(zero);
                normals.push(face.normal);
            }
            this.ƒnormalsFlat = new Float32Array(normals.flatMap(_n => [..._n.get()]));
            return this.ƒnormalsFlat;
        }
        createTextureUVsFlat() {
            let uv = [];
            for (let i = 0; i < this.indices.length; i++) {
                let index = this.indices[i] * 2;
                uv.push(this.textureUVs[index], this.textureUVs[index + 1]);
            }
            return new Float32Array(uv);
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
            if (_branch)
                _branch.dispatchEvent(new Event("attachBranch"));
            this.#branch = _branch;
        }
        getBranch() {
            return this.#branch;
        }
        draw(_calculateTransforms = true) {
            this.computeDrawing(_calculateTransforms);
            if (this.physicsDebugMode != FudgeCore.PHYSICS_DEBUGMODE.PHYSIC_OBJECTS_ONLY)
                FudgeCore.Render.draw(this.camera);
            if (this.physicsDebugMode != FudgeCore.PHYSICS_DEBUGMODE.NONE) {
                FudgeCore.Physics.draw(this.camera, this.physicsDebugMode);
            }
            this.#crc2.imageSmoothingEnabled = false;
            this.#crc2.drawImage(FudgeCore.Render.getCanvas(), this.rectSource.x, this.rectSource.y, this.rectSource.width, this.rectSource.height, this.rectDestination.x, this.rectDestination.y, this.rectDestination.width, this.rectDestination.height);
        }
        computeDrawing(_calculateTransforms = true) {
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
        }
        calculateTransforms() {
            let mtxRoot = FudgeCore.Matrix4x4.IDENTITY();
            if (this.#branch.getParent())
                mtxRoot = this.#branch.getParent().mtxWorld;
            this.dispatchEvent(new Event("renderPrepareStart"));
            this.adjustFrames();
            FudgeCore.Render.prepare(this.#branch, null, mtxRoot);
            this.dispatchEvent(new Event("renderPrepareEnd"));
            this.componentsPick = FudgeCore.Render.componentsPick;
        }
        dispatchPointerEvent(_event) {
            let posClient = new FudgeCore.Vector2(_event.clientX, _event.clientY);
            let ray = this.getRayFromClient(posClient);
            let cameraPicks = [];
            let otherPicks = [];
            for (let cmpPick of this.componentsPick)
                cmpPick.pick == FudgeCore.PICK.CAMERA ? cameraPicks.push(cmpPick.node) : otherPicks.push(cmpPick);
            if (cameraPicks.length) {
                let picks = FudgeCore.Picker.pickCamera(cameraPicks, this.camera, this.pointClientToProjection(posClient));
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
        constructor() {
            super();
            this.vrDevice = null;
            this.session = null;
            this.referenceSpace = null;
            this.useVRController = false;
            this.crc3 = null;
            XRViewport.xrViewportInstance = this;
            this.crc3 = FudgeCore.RenderWebGL.getRenderingContext();
        }
        static get default() {
            return this.xrViewportInstance;
        }
        initialize(_name, _branch, _cameraXR, _canvas) {
            super.initialize(_name, _branch, _cameraXR, _canvas);
            this.camera = _cameraXR;
        }
        async initializeVR(_vrSessionMode = XR_SESSION_MODE.IMMERSIVE_VR, _vrReferenceSpaceType = XR_REFERENCE_SPACE.LOCAL, _vrController = false) {
            let session = await navigator.xr.requestSession(_vrSessionMode);
            this.referenceSpace = await session.requestReferenceSpace(_vrReferenceSpaceType);
            await this.crc3.makeXRCompatible();
            let nativeScaleFactor = XRWebGLLayer.getNativeFramebufferScaleFactor(session);
            await session.updateRenderState({ baseLayer: new XRWebGLLayer(session, this.crc3, { framebufferScaleFactor: nativeScaleFactor }) });
            this.vrDevice = this.camera;
            this.initializeReferenceSpace();
            this.useVRController = _vrController;
            if (_vrController) {
                this.vrDevice.rightCntrl.cmpTransform = new FudgeCore.ComponentTransform();
                this.vrDevice.leftCntrl.cmpTransform = new FudgeCore.ComponentTransform();
            }
            this.session = session;
            this.calculateTransforms();
        }
        async initializeAR(_arSessionMode = null, _arReferenceSpaceType = null) {
            FudgeCore.Debug.error("NOT IMPLEMENTED YET! Check out initializeVR!");
        }
        draw(_calculateTransforms = true, _xrFrame = null) {
            if (!this.session) {
                super.draw(_calculateTransforms);
                return;
            }
            let pose = _xrFrame?.getViewerPose(this.referenceSpace);
            if (!pose)
                return;
            this.vrDevice.mtxLocal.set(pose.transform.matrix);
            super.computeDrawing(_calculateTransforms);
            let glLayer = this.session.renderState.baseLayer;
            FudgeCore.Render.resetFrameBuffer(glLayer.framebuffer);
            FudgeCore.Render.clear(this.camera.clrBackground);
            for (let view of pose.views) {
                let viewport = glLayer.getViewport(view);
                this.crc3.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
                if (this.useVRController)
                    this.setControllerConfigs(_xrFrame);
                this.camera.mtxProjection.set(view.projectionMatrix);
                this.camera.mtxCameraInverse.set(view.transform.inverse.matrix);
                if (this.physicsDebugMode != FudgeCore.PHYSICS_DEBUGMODE.PHYSIC_OBJECTS_ONLY)
                    FudgeCore.Render.draw(this.camera);
                if (this.physicsDebugMode != FudgeCore.PHYSICS_DEBUGMODE.NONE) {
                    FudgeCore.Physics.draw(this.camera, this.physicsDebugMode);
                }
            }
            FudgeCore.Render.setRenderRectangle(FudgeCore.Render.getRenderRectangle());
        }
        initializeReferenceSpace() {
            let mtxWorld = this.vrDevice.node?.mtxWorld;
            if (!mtxWorld)
                return;
            mtxWorld = mtxWorld.clone;
            mtxWorld.rotateY(180);
            let invMtxTransfom = mtxWorld.inverse();
            let invRotation = FudgeCore.Vector3.SCALE(invMtxTransfom.rotation, Math.PI / 180);
            let invOrientation = new FudgeCore.PhysicsQuaternion();
            invOrientation.setFromVector3(invRotation.x, invRotation.y, invRotation.z);
            XRViewport.default.referenceSpace = XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(invMtxTransfom.translation, invOrientation));
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
    XRViewport.xrViewportInstance = null;
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
        constructor(_type, ..._args) {
            super(..._args);
            this.#type = _type;
        }
        #type;
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
    class Project extends FudgeCore.EventTargetStatic {
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
    Project.resources = {};
    Project.serialization = {};
    Project.scriptNamespaces = {};
    Project.baseURL = new URL(location.toString());
    Project.mode = MODE.RUNTIME;
    Project.graphInstancesToResync = {};
    FudgeCore.Project = Project;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
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
    })(FBX = FudgeCore.FBX || (FudgeCore.FBX = {}));
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    var FBX;
    (function (FBX) {
        let MappingInformationType;
        (function (MappingInformationType) {
            MappingInformationType[MappingInformationType["ByVertex"] = 0] = "ByVertex";
            MappingInformationType[MappingInformationType["ByPolygon"] = 1] = "ByPolygon";
            MappingInformationType[MappingInformationType["ByPolygonVertex"] = 2] = "ByPolygonVertex";
            MappingInformationType[MappingInformationType["ByEdge"] = 3] = "ByEdge";
            MappingInformationType[MappingInformationType["AllSame"] = 4] = "AllSame";
        })(MappingInformationType = FBX.MappingInformationType || (FBX.MappingInformationType = {}));
        let ReferenceInformationType;
        (function (ReferenceInformationType) {
            ReferenceInformationType[ReferenceInformationType["Direct"] = 0] = "Direct";
            ReferenceInformationType[ReferenceInformationType["IndexToDirect"] = 1] = "IndexToDirect";
        })(ReferenceInformationType = FBX.ReferenceInformationType || (FBX.ReferenceInformationType = {}));
    })(FBX = FudgeCore.FBX || (FudgeCore.FBX = {}));
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class FBXLoader {
        constructor(_buffer, _uri) {
            this.#skinMaterials = [];
            this.uri = _uri;
            this.nodes = FudgeCore.FBX.parseNodesFromBinary(_buffer);
            console.log(this.nodes);
            this.fbx = FudgeCore.FBX.loadFromNodes(this.nodes);
            console.log(this.fbx);
        }
        static #defaultMaterial;
        static #defaultSkinMaterial;
        #scenes;
        #nodes;
        #meshes;
        #materials;
        #skinMaterials;
        #textures;
        #skeletons;
        #animations;
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
        static get defaultMaterial() {
            return this.#defaultMaterial || (this.#defaultMaterial =
                new FudgeCore.Material("FBXDefaultMaterial", FudgeCore.ShaderGouraud, new FudgeCore.CoatRemissive(FudgeCore.Color.CSS("white"))));
        }
        static get defaultSkinMaterial() {
            return this.#defaultSkinMaterial || (this.#defaultSkinMaterial =
                new FudgeCore.Material("FBXDefaultSkinMaterial", FudgeCore.ShaderGouraudSkin, new FudgeCore.CoatRemissive(FudgeCore.Color.CSS("white"))));
        }
        async getScene(_index = 0) {
            if (!this.#scenes)
                this.#scenes = [];
            if (!this.#scenes[_index]) {
                const documentFBX = this.fbx.documents[_index].load();
                const scene = new FudgeCore.Graph(documentFBX.name);
                for (const childFBX of documentFBX.children) {
                    if (childFBX.type == "Model") {
                        if (childFBX.subtype == "LimbNode")
                            scene.addChild(await FudgeCore.SkeletonInstance.CREATE(await this.getSkeleton(childFBX)));
                        else
                            scene.addChild(await this.getNode(this.fbx.objects.models.indexOf(childFBX), scene));
                    }
                }
                if (this.fbx.objects.animStacks && this.fbx.objects.animStacks.length > 0) {
                    const animation = await this.getAnimation(documentFBX.ActiveAnimStackName.length > 0 ?
                        this.fbx.objects.animStacks.findIndex(_animStack => _animStack.name == documentFBX.ActiveAnimStackName) : 0);
                    for (const child of scene) {
                        if (child.name == "Skeleton0")
                            child.getParent().addComponent(new FudgeCore.ComponentAnimator(animation, FudgeCore.ANIMATION_PLAYMODE.LOOP, FudgeCore.ANIMATION_QUANTIZATION.CONTINOUS));
                    }
                }
                FudgeCore.Project.register(scene);
                this.#scenes[_index] = scene;
            }
            return await FudgeCore.Project.createGraphInstance(this.#scenes[_index]);
        }
        async getNode(_index, _root) {
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
                            if (_root && childFBX.subtype == "LimbNode") {
                                const skeleton = await this.getSkeleton(childFBX);
                                let skeletonInstance;
                                for (const child of _root) {
                                    if (child instanceof FudgeCore.SkeletonInstance && child.idSource == skeleton.idResource)
                                        skeletonInstance = child;
                                }
                                node.addChild(skeletonInstance || await FudgeCore.SkeletonInstance.CREATE(skeleton));
                            }
                            else
                                node.addChild(await this.getNode(this.fbx.objects.models.indexOf(childFBX)));
                        }
                        else if (childFBX.type == "Geometry") {
                            const mesh = await this.getMesh(this.fbx.objects.geometries.indexOf(childFBX));
                            const cmpMesh = new FudgeCore.ComponentMesh(mesh);
                            node.addComponent(new FudgeCore.ComponentMaterial(FBXLoader.defaultMaterial));
                            if (mesh instanceof FudgeCore.MeshSkin) {
                                const skeleton = await this.getSkeleton(childFBX.children[0].children[0].children[0]);
                                cmpMesh.skeleton = (_root?.getChild(0) || await FudgeCore.SkeletonInstance.CREATE(skeleton));
                                for (const subDeformerFBX of childFBX.children[0].children) {
                                    const bone = cmpMesh.skeleton.bones[subDeformerFBX.children[0].name];
                                    bone.mtxLocal.set(subDeformerFBX.TransformLink);
                                    if (bone.getParent())
                                        bone.mtxLocal.multiply(bone.getParent().mtxWorldInverse);
                                }
                                node.getComponent(FudgeCore.ComponentMaterial).material = FBXLoader.defaultSkinMaterial;
                            }
                            node.addComponent(cmpMesh);
                        }
                        else if (childFBX.type == "Material") {
                            const iMaterial = this.fbx.objects.materials.indexOf(childFBX);
                            const material = await this.getMaterial(iMaterial);
                            node.getComponent(FudgeCore.ComponentMaterial).material = node.getComponent(FudgeCore.ComponentMesh).mesh instanceof FudgeCore.MeshSkin ?
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
                this.#meshes[_index] = await (this.fbx.objects.geometries[_index].children?.[0].type == "Deformer" ?
                    new FudgeCore.MeshSkin() :
                    new FudgeCore.MeshImport()).load(FudgeCore.MeshLoaderFBX, this.uri, this.fbx.objects.geometries[_index]);
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
                    return _array.reduce((a, b) => a + b) / _array.length;
                else
                    return undefined;
            }
        }
        async getTexture(_index) {
            return new Promise((resolve, reject) => {
                if (!this.#textures)
                    this.#textures = [];
                if (this.#textures[_index])
                    return resolve(this.#textures[_index]);
                const videoFBX = this.fbx.objects.textures[_index].children[0];
                const texture = new FudgeCore.TextureImage();
                texture.image = new Image();
                texture.image.onload = () => resolve(texture);
                texture.image.onerror = reject;
                texture.image.src = URL.createObjectURL(new Blob([videoFBX.Content], { type: "image/png" }));
                this.#textures[_index] = texture;
            });
        }
        async getSkeleton(_fbxLimbNode) {
            if (!this.#skeletons)
                this.#skeletons = [];
            return this.#skeletons.find(_skeleton => _fbxLimbNode.name in _skeleton.bones) || await (async () => {
                const skeleton = new FudgeCore.Skeleton(`Skeleton${this.#skeletons.length}`);
                let rootNode = _fbxLimbNode;
                while (rootNode.parents && rootNode.parents.some(parent => parent.subtype == "LimbNode"))
                    rootNode = rootNode.parents.find(_parent => _parent.subtype == "LimbNode");
                const iRootNode = this.fbx.objects.models.findIndex(_model => _model.name == rootNode.name);
                skeleton.addChild(await this.getNode(iRootNode));
                for (const node of skeleton) {
                    if (node != skeleton && this.fbx.objects.models[this.#nodes.indexOf(node)].subtype == "LimbNode")
                        skeleton.registerBone(node);
                }
                skeleton.setDefaultPose();
                FudgeCore.Project.register(skeleton);
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
                const animStructure = { children: { "Skeleton0": { mtxBoneLocals: {} } } };
                for (const animNodeFBX of animNodesFBX) {
                    if (typeof animNodeFBX.dX == "number" && typeof animNodeFBX.dY == "number" && typeof animNodeFBX.dZ == "number")
                        continue;
                    const target = animNodeFBX.parents.find(_parent => _parent.type != "AnimLayer");
                    (animStructure.children.Skeleton0.mtxBoneLocals[target.name] ||
                        (animStructure.children.Skeleton0.mtxBoneLocals[target.name] = {}))[{
                        T: "translation",
                        R: "rotation",
                        S: "scale"
                    }[animNodeFBX.name]] = this.getAnimationVector3(animNodeFBX, target);
                }
                this.#animations[_index] = new FudgeCore.Animation(animStack.name, animStructure);
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
                    vctEulerAngles = mtxRotation.getEulerAngles();
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
var FudgeCore;
(function (FudgeCore) {
    var FBX;
    (function (FBX) {
        class Node {
            constructor(_name, _loadProperties, _loadChildren) {
                this.name = _name;
                this.loadProperties = _loadProperties;
                this.loadChildren = _loadChildren;
            }
            #children;
            #properties;
            get properties() {
                return this.#properties || (this.#properties = this.loadProperties());
            }
            get children() {
                return this.#children || (this.#children = this.loadChildren());
            }
        }
        FBX.Node = Node;
        let ArrayEncoding;
        (function (ArrayEncoding) {
            ArrayEncoding[ArrayEncoding["UNCOMPRESSED"] = 0] = "UNCOMPRESSED";
            ArrayEncoding[ArrayEncoding["COMPRESSED"] = 1] = "COMPRESSED";
        })(ArrayEncoding = FBX.ArrayEncoding || (FBX.ArrayEncoding = {}));
    })(FBX = FudgeCore.FBX || (FudgeCore.FBX = {}));
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
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
    })(FBX = FudgeCore.FBX || (FudgeCore.FBX = {}));
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
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
            const iterable = encoding == FBX.ArrayEncoding.COMPRESSED ?
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
        const binaryStartChars = Uint8Array.from("Kaydara FBX Binary\x20\x20\x00\x1a\x00".split(""), (v) => v.charCodeAt(0));
        const nullCountAtNodeEnd = 13;
    })(FBX = FudgeCore.FBX || (FudgeCore.FBX = {}));
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class GLTFLoader {
        constructor(_gltf, _url) {
            this.gltf = _gltf;
            this.url = _url;
        }
        #scenes;
        #nodes;
        #cameras;
        #animations;
        #meshes;
        #materials;
        #textures;
        #skeletons;
        #buffers;
        static async LOAD(_url) {
            if (!this.loaders)
                this.loaders = {};
            if (!this.loaders[_url]) {
                const response = await fetch(_url);
                const gltf = await response.json();
                gltf.nodes.forEach((_node, _iNode) => _node.children?.forEach(_iChild => gltf.nodes[_iChild].parent = _iNode));
                this.loaders[_url] = new GLTFLoader(gltf, _url);
            }
            return this.loaders[_url];
        }
        async getScene(_name) {
            const iScene = _name ? this.gltf.scenes.findIndex(scene => scene.name == _name) : this.gltf.scene;
            if (iScene == -1)
                throw new Error(`Couldn't find name ${_name} in gltf scenes.`);
            return await this.getSceneByIndex(iScene);
        }
        async getSceneByIndex(_iScene = this.gltf.scene) {
            if (!this.#scenes)
                this.#scenes = [];
            if (!this.#scenes[_iScene]) {
                const gltfScene = this.gltf.scenes[_iScene];
                const scene = new FudgeCore.Graph(gltfScene.name);
                for (const iNode of gltfScene.nodes)
                    scene.addChild(await this.getNodeByIndex(iNode));
                if (this.gltf.animations?.length > 0)
                    scene.addComponent(new FudgeCore.ComponentAnimator(await this.getAnimationByIndex(0)));
                FudgeCore.Project.register(scene);
                this.#scenes[_iScene] = scene;
            }
            return await FudgeCore.Project.createGraphInstance(this.#scenes[_iScene]);
        }
        async getNode(_name) {
            const iNode = this.gltf.nodes.findIndex(node => node.name == _name);
            if (iNode == -1)
                throw new Error(`Couldn't find name ${_name} in gltf nodes.`);
            return await this.getNodeByIndex(iNode);
        }
        async getNodeByIndex(_iNode) {
            if (!this.#nodes)
                this.#nodes = [];
            if (!this.#nodes[_iNode]) {
                const gltfNode = this.gltf.nodes[_iNode];
                let iSkeleton = this.gltf.skins?.findIndex(skin => skin.joints[0] == _iNode);
                const node = iSkeleton < 0 ? new FudgeCore.Node(gltfNode.name) : new FudgeCore.Skeleton(gltfNode.name);
                if (gltfNode.children)
                    for (const iNode of gltfNode.children)
                        node.addChild(await this.getNodeByIndex(iNode));
                if (gltfNode.matrix || gltfNode.rotation || gltfNode.scale || gltfNode.translation) {
                    if (!node.getComponent(FudgeCore.ComponentTransform))
                        node.addComponent(new FudgeCore.ComponentTransform());
                    if (gltfNode.matrix) {
                        node.mtxLocal.set(Float32Array.from(gltfNode.matrix));
                    }
                    else {
                        if (gltfNode.translation)
                            node.mtxLocal.translate(new FudgeCore.Vector3(...gltfNode.translation));
                        if (gltfNode.rotation) {
                            const rotation = new FudgeCore.Quaternion();
                            rotation.set(gltfNode.rotation);
                            node.mtxLocal.rotate(rotation.getEulerAngles());
                        }
                        if (gltfNode.scale)
                            node.mtxLocal.scale(new FudgeCore.Vector3(...gltfNode.scale));
                    }
                }
                if (gltfNode.camera != undefined) {
                    node.addComponent(await this.getCameraByIndex(gltfNode.camera));
                }
                if (gltfNode.mesh != undefined) {
                    node.addComponent(new FudgeCore.ComponentMesh(await this.getMeshByIndex(gltfNode.mesh)));
                    const gltfMesh = this.gltf.meshes?.[gltfNode.mesh];
                    if (gltfMesh.primitives.length > 1)
                        throw new Error(`Node ${gltfNode.name} has a mesh with more than one primitive attached to it. FUDGE currently only supports one primitive per mesh.`);
                    const iMaterial = gltfMesh.primitives?.[0]?.material;
                    if (iMaterial != undefined) {
                        node.addComponent(new FudgeCore.ComponentMaterial(await this.getMaterialByIndex(iMaterial)));
                    }
                    else {
                        if (node.getComponent(FudgeCore.ComponentMesh).mesh instanceof FudgeCore.MeshSkin) {
                            if (!GLTFLoader.defaultSkinMaterial)
                                GLTFLoader.defaultSkinMaterial = new FudgeCore.Material("GLTFDefaultSkinMaterial", FudgeCore.ShaderGouraudSkin, new FudgeCore.CoatRemissive(FudgeCore.Color.CSS("white")));
                            node.addComponent(new FudgeCore.ComponentMaterial(GLTFLoader.defaultSkinMaterial));
                        }
                        else {
                            if (!GLTFLoader.defaultMaterial)
                                GLTFLoader.defaultMaterial = new FudgeCore.Material("GLTFDefaultMaterial", FudgeCore.ShaderGouraud, new FudgeCore.CoatRemissive(FudgeCore.Color.CSS("white")));
                            node.addComponent(new FudgeCore.ComponentMaterial(GLTFLoader.defaultMaterial));
                        }
                    }
                }
                if (gltfNode.skin != undefined) {
                    let iSkeleton = this.gltf.skins[gltfNode.skin].joints[0];
                    node.getComponent(FudgeCore.ComponentMesh).skeleton = await this.getNodeByIndex(iSkeleton);
                }
                this.#nodes[_iNode] = node;
                if (iSkeleton >= 0) {
                    let skeletonInstance = await FudgeCore.SkeletonInstance.CREATE(await this.getSkeletonByIndex(iSkeleton));
                    this.#nodes = this.#nodes.map(_node => skeletonInstance.bones[_node.name] || _node);
                    this.#nodes[_iNode] = skeletonInstance;
                }
            }
            return this.#nodes[_iNode];
        }
        async getCamera(_name) {
            const iCamera = this.gltf.cameras.findIndex(camera => camera.name == _name);
            if (iCamera == -1)
                throw new Error(`Couldn't find name ${_name} in gltf cameras.`);
            return await this.getCameraByIndex(iCamera);
        }
        async getCameraByIndex(_iCamera) {
            if (!this.#cameras)
                this.#cameras = [];
            if (!this.#cameras[_iCamera]) {
                const gltfCamera = this.gltf.cameras[_iCamera];
                const camera = new FudgeCore.ComponentCamera();
                if (gltfCamera.perspective)
                    camera.projectCentral(gltfCamera.perspective.aspectRatio, gltfCamera.perspective.yfov * FudgeCore.Calc.rad2deg, null, gltfCamera.perspective.znear, gltfCamera.perspective.zfar);
                else
                    camera.projectOrthographic(-gltfCamera.orthographic.xmag, gltfCamera.orthographic.xmag, -gltfCamera.orthographic.ymag, gltfCamera.orthographic.ymag);
                return camera;
            }
            return this.#cameras[_iCamera];
        }
        async getAnimation(_name) {
            const iAnimation = this.gltf.animations.findIndex(animation => animation.name == _name);
            if (iAnimation == -1)
                throw new Error(`Couldn't find name ${_name} in gltf animations.`);
            return await this.getAnimationByIndex(iAnimation);
        }
        async getAnimationByIndex(_iAnimation) {
            if (!this.#animations)
                this.#animations = [];
            if (!this.#animations[_iAnimation]) {
                const gltfAnimation = this.gltf.animations[_iAnimation];
                const mapiNodeToGltfChannel = [];
                for (const gltfChannel of gltfAnimation.channels) {
                    if (gltfChannel.target.node == undefined)
                        continue;
                    if (!mapiNodeToGltfChannel[gltfChannel.target.node])
                        mapiNodeToGltfChannel[gltfChannel.target.node] = [];
                    mapiNodeToGltfChannel[gltfChannel.target.node].push(gltfChannel);
                }
                const animationStructure = {};
                for (const iNode in mapiNodeToGltfChannel) {
                    const gltfChannels = mapiNodeToGltfChannel[iNode];
                    const gltfNode = this.gltf.nodes[gltfChannels[0].target.node];
                    const path = [];
                    path.push(gltfChannels[0].target.node);
                    let root = gltfNode;
                    while (root.parent != undefined) {
                        path.push(root.parent);
                        root = this.gltf.nodes[root.parent];
                    }
                    let currentStructure = animationStructure;
                    for (const iPathNode of path.reverse()) {
                        const pathNode = this.gltf.nodes[iPathNode];
                        if (currentStructure.children == undefined)
                            currentStructure.children = {};
                        if (currentStructure.children[pathNode.name] == undefined)
                            currentStructure.children[pathNode.name] = {};
                        currentStructure = currentStructure.children[pathNode.name];
                        let iSkin = this.gltf.skins?.findIndex(skin => skin.joints[0] == iPathNode);
                        if (iSkin >= 0 && this.gltf.skins[iSkin].joints.includes(gltfChannels[0].target.node)) {
                            const mtxBoneLocal = {};
                            for (const gltfChannel of gltfChannels)
                                mtxBoneLocal[gltfChannel.target.path] =
                                    await this.getAnimationSequenceVector3(gltfAnimation.samplers[gltfChannel.sampler], gltfChannel.target.path);
                            if (currentStructure.mtxBoneLocals == undefined)
                                currentStructure.mtxBoneLocals = {};
                            currentStructure.mtxBoneLocals[gltfNode.name] = mtxBoneLocal;
                            break;
                        }
                        if (pathNode == gltfNode) {
                            const mtxLocal = {};
                            for (const gltfChannel of gltfChannels)
                                mtxLocal[gltfChannel.target.path] =
                                    await this.getAnimationSequenceVector3(gltfAnimation.samplers[gltfChannel.sampler], gltfChannel.target.path);
                            currentStructure.components = {
                                ComponentTransform: [
                                    { mtxLocal: mtxLocal }
                                ]
                            };
                        }
                    }
                }
                this.#animations[_iAnimation] = new FudgeCore.Animation(gltfAnimation.name, animationStructure);
            }
            return this.#animations[_iAnimation];
        }
        async getMesh(_name) {
            const iMesh = this.gltf.meshes.findIndex(mesh => mesh.name == _name);
            if (iMesh == -1)
                throw new Error(`Couldn't find name ${_name} in gltf meshes.`);
            return await this.getMeshByIndex(iMesh);
        }
        async getMeshByIndex(_iMesh) {
            if (!this.#meshes)
                this.#meshes = [];
            if (!this.#meshes[_iMesh]) {
                const gltfMesh = this.gltf.meshes[_iMesh];
                this.#meshes[_iMesh] = await (gltfMesh.primitives[0].attributes.JOINTS_0 != undefined ?
                    new FudgeCore.MeshSkin() :
                    new FudgeCore.MeshImport()).load(FudgeCore.MeshLoaderGLTF, this.url, gltfMesh);
            }
            return this.#meshes[_iMesh];
        }
        async getMaterialByIndex(_iMaterial) {
            if (!this.#materials)
                this.#materials = [];
            if (!this.#materials[_iMaterial]) {
                const gltfMaterial = this.gltf.materials[_iMaterial];
                const material = new FudgeCore.Material(gltfMaterial.name, FudgeCore.ShaderPhongTexturedSkin);
                const gltfTextureInfo = gltfMaterial.pbrMetallicRoughness?.baseColorTexture;
                if (gltfTextureInfo) {
                    const texture = await this.getTextureByIndex(gltfTextureInfo.index);
                    material.coat = new FudgeCore.CoatRemissiveTextured(new FudgeCore.Color(...gltfMaterial.pbrMetallicRoughness.baseColorFactor || [1, 1, 1, 1]), texture, 1, 1);
                }
                this.#materials[_iMaterial] = material;
            }
            return this.#materials[_iMaterial];
        }
        async getTextureByIndex(_iTexture) {
            if (!this.#textures)
                this.#textures = [];
            if (!this.#textures[_iTexture]) {
                const gltfTexture = this.gltf.textures[_iTexture];
                const gltfSampler = this.gltf.samplers[gltfTexture.sampler];
                const gltfImage = this.gltf.images[gltfTexture.source];
                if (gltfSampler.wrapS != undefined || gltfSampler.wrapT != undefined)
                    console.warn(`${GLTFLoader.name}: Texture ${_iTexture} in '${this.url}' has a wrapS and wrapT of '${getWebGLParameterName(gltfSampler.wrapS)}' and '${getWebGLParameterName(gltfSampler.wrapT)}' respectively. FUDGE only supports the default behavior of '${getWebGLParameterName(WebGL2RenderingContext.REPEAT)}'.`);
                let url = gltfImage.uri;
                if (!gltfImage.uri && gltfImage.bufferView) {
                    const gltfBufferView = this.gltf.bufferViews[gltfImage.bufferView];
                    const buffer = await this.getBuffer(gltfBufferView.buffer);
                    const byteOffset = gltfBufferView.byteOffset || 0;
                    const byteLength = gltfBufferView.byteLength || 0;
                    url = URL.createObjectURL(new Blob([new Uint8Array(buffer, byteOffset, byteLength / Uint8Array.BYTES_PER_ELEMENT)], { type: gltfImage.mimeType }));
                }
                const texture = new FudgeCore.TextureImage();
                await texture.load(url);
                if (gltfSampler.magFilter == WebGL2RenderingContext.NEAREST && gltfSampler.minFilter == WebGL2RenderingContext.NEAREST)
                    texture.mipmap = FudgeCore.MIPMAP.CRISP;
                else if (gltfSampler.magFilter == WebGL2RenderingContext.NEAREST && gltfSampler.minFilter == WebGL2RenderingContext.NEAREST_MIPMAP_LINEAR)
                    texture.mipmap = FudgeCore.MIPMAP.MEDIUM;
                else if (gltfSampler.magFilter == WebGL2RenderingContext.LINEAR && gltfSampler.minFilter == WebGL2RenderingContext.LINEAR_MIPMAP_LINEAR)
                    texture.mipmap = FudgeCore.MIPMAP.BLURRY;
                else if (gltfSampler.magFilter != undefined && gltfSampler.minFilter != undefined)
                    throw new Error(`${GLTFLoader.name}: Texture ${_iTexture} in '${this.url}' has a magFilter and minFilter of '${getWebGLParameterName(gltfSampler.magFilter)}' and '${getWebGLParameterName(gltfSampler.minFilter)}' respectively. FUDGE only supports the following combinations: NEAREST and NEAREST | NEAREST and NEAREST_MIPMAP_LINEAR | LINEAR and LINEAR_MIPMAP_LINEAR.`);
                this.#textures[_iTexture] = texture;
            }
            return this.#textures[_iTexture];
        }
        async getSkeleton(_name) {
            const iSkeleton = this.gltf.skins.findIndex(skeleton => skeleton.name == _name);
            if (iSkeleton == -1)
                throw new Error(`Couldn't find name ${_name} in gltf skins.`);
            return await this.getSkeletonByIndex(iSkeleton);
        }
        async getSkeletonByIndex(_iSkeleton) {
            if (!this.#skeletons)
                this.#skeletons = [];
            if (!this.#skeletons[_iSkeleton]) {
                const gltfSkeleton = this.gltf.skins[_iSkeleton];
                const skeleton = await this.getNodeByIndex(gltfSkeleton.joints[0]);
                const floatArray = await this.getFloat32Array(gltfSkeleton.inverseBindMatrices);
                const span = 16;
                for (let iFloat = 0, iBone = 0; iFloat < floatArray.length; iFloat += span, iBone++) {
                    const mtxBindInverse = new FudgeCore.Matrix4x4();
                    mtxBindInverse.set(floatArray.subarray(iFloat, iFloat + span));
                    skeleton.registerBone(this.#nodes[gltfSkeleton.joints[iBone]], mtxBindInverse);
                }
                FudgeCore.Project.register(skeleton);
                this.#skeletons[_iSkeleton] = skeleton;
            }
            return this.#skeletons[_iSkeleton];
        }
        async getUint8Array(_iAccessor) {
            const array = await this.getBufferData(_iAccessor);
            if (this.gltf.accessors[_iAccessor]?.componentType == ComponentType.UNSIGNED_BYTE)
                return array;
            else {
                console.warn(`Expected component type UNSIGNED_BYTE but was ${ComponentType[this.gltf.accessors[_iAccessor]?.componentType]}.`);
                return Uint8Array.from(array);
            }
        }
        async getUint16Array(_iAccessor) {
            const array = await this.getBufferData(_iAccessor);
            if (this.gltf.accessors[_iAccessor]?.componentType == ComponentType.UNSIGNED_SHORT)
                return array;
            else {
                console.warn(`Expected component type UNSIGNED_SHORT but was ${ComponentType[this.gltf.accessors[_iAccessor]?.componentType]}.`);
                return Uint16Array.from(array);
            }
        }
        async getUint32Array(_iAccessor) {
            const array = await this.getBufferData(_iAccessor);
            if (this.gltf.accessors[_iAccessor]?.componentType == ComponentType.UNSIGNED_INT)
                return array;
            else {
                console.warn(`Expected component type UNSIGNED_INT but was ${ComponentType[this.gltf.accessors[_iAccessor]?.componentType]}.`);
                return Uint32Array.from(array);
            }
        }
        async getFloat32Array(_iAccessor) {
            const array = await this.getBufferData(_iAccessor);
            if (this.gltf.accessors[_iAccessor]?.componentType == ComponentType.FLOAT)
                return array;
            else {
                console.warn(`Expected component type FLOAT but was ${ComponentType[this.gltf.accessors[_iAccessor]?.componentType]}.`);
                return Float32Array.from(array);
            }
        }
        async getBufferData(_iAccessor) {
            const gltfAccessor = this.gltf.accessors[_iAccessor];
            if (!gltfAccessor)
                throw new Error("Couldn't find accessor");
            const gltfBufferView = this.gltf.bufferViews[gltfAccessor.bufferView];
            if (!gltfBufferView)
                throw new Error("Couldn't find buffer view");
            const buffer = await this.getBuffer(gltfBufferView.buffer);
            ;
            const byteOffset = gltfBufferView.byteOffset || 0;
            const byteLength = gltfBufferView.byteLength || 0;
            switch (gltfAccessor.componentType) {
                case ComponentType.UNSIGNED_BYTE:
                    return new Uint8Array(buffer, byteOffset, byteLength / Uint8Array.BYTES_PER_ELEMENT);
                case ComponentType.BYTE:
                    return new Int8Array(buffer, byteOffset, byteLength / Int8Array.BYTES_PER_ELEMENT);
                case ComponentType.UNSIGNED_SHORT:
                    return new Uint16Array(buffer, byteOffset, byteLength / Uint16Array.BYTES_PER_ELEMENT);
                case ComponentType.SHORT:
                    return new Int16Array(buffer, byteOffset, byteLength / Int16Array.BYTES_PER_ELEMENT);
                case ComponentType.UNSIGNED_INT:
                    return new Uint32Array(buffer, byteOffset, byteLength / Uint32Array.BYTES_PER_ELEMENT);
                case ComponentType.INT:
                    return new Int32Array(buffer, byteOffset, byteLength / Int32Array.BYTES_PER_ELEMENT);
                case ComponentType.FLOAT:
                    return new Float32Array(buffer, byteOffset, byteLength / Float32Array.BYTES_PER_ELEMENT);
                default:
                    throw new Error(`Unsupported component type: ${gltfAccessor.componentType}.`);
            }
        }
        async getBuffer(_iBuffer) {
            const gltfBuffer = this.gltf.buffers[_iBuffer];
            if (!gltfBuffer)
                throw new Error("Couldn't find buffer");
            if (!this.#buffers)
                this.#buffers = [];
            if (!this.#buffers[_iBuffer]) {
                const response = await fetch(gltfBuffer.uri);
                this.#buffers[_iBuffer] = await response.arrayBuffer();
            }
            return this.#buffers[_iBuffer];
        }
        async getAnimationSequenceVector3(_sampler, _transformationType) {
            const input = await this.getFloat32Array(_sampler.input);
            const output = await this.getFloat32Array(_sampler.output);
            const millisPerSecond = 1000;
            const isRotation = _transformationType == "rotation";
            const sequences = {};
            sequences.x = new FudgeCore.AnimationSequence();
            sequences.y = new FudgeCore.AnimationSequence();
            sequences.z = new FudgeCore.AnimationSequence();
            if (isRotation)
                sequences.w = new FudgeCore.AnimationSequence();
            for (let iInput = 0; iInput < input.length; ++iInput) {
                let iOutput = iInput * (_transformationType == "rotation" ? 4 : 3);
                let time = millisPerSecond * input[iInput];
                sequences.x.addKey(new FudgeCore.AnimationKey(time, output[iOutput + 0]));
                sequences.y.addKey(new FudgeCore.AnimationKey(time, output[iOutput + 1]));
                sequences.z.addKey(new FudgeCore.AnimationKey(time, output[iOutput + 2]));
                if (isRotation)
                    sequences.w.addKey(new FudgeCore.AnimationKey(time, output[iOutput + 3]));
            }
            return sequences;
        }
    }
    FudgeCore.GLTFLoader = GLTFLoader;
    function getWebGLParameterName(_value) {
        return Object.keys(WebGL2RenderingContext).find(_key => Reflect.get(WebGL2RenderingContext, _key) == _value);
    }
    let ComponentType;
    (function (ComponentType) {
        ComponentType[ComponentType["BYTE"] = 5120] = "BYTE";
        ComponentType[ComponentType["UNSIGNED_BYTE"] = 5121] = "UNSIGNED_BYTE";
        ComponentType[ComponentType["SHORT"] = 5122] = "SHORT";
        ComponentType[ComponentType["UNSIGNED_SHORT"] = 5123] = "UNSIGNED_SHORT";
        ComponentType[ComponentType["INT"] = 5124] = "INT";
        ComponentType[ComponentType["UNSIGNED_INT"] = 5125] = "UNSIGNED_INT";
        ComponentType[ComponentType["FLOAT"] = 5126] = "FLOAT";
    })(ComponentType || (ComponentType = {}));
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    FudgeCore.shaderSources = {};
    FudgeCore.shaderSources["ShaderParticle.frag"] = `#version 300 es
/**
* Particle shader similar to lit textured shader
* @authors Jonas Plotzky, HFU, 2022
*/

precision mediump float;

uniform vec4 u_vctColor;
  
  #if defined(PARTICLE_COLOR)
in vec4 v_vctColor;
  #endif

in vec2 v_vctTexture;
uniform sampler2D u_texture;

out vec4 vctFrag;

void main() {
  // TEXTURE: multiply with texel color
  vec4 vctColorTexture = texture(u_texture, v_vctTexture);
  vctFrag = u_vctColor * vctColorTexture;
    #if defined(PARTICLE_COLOR)
  vctFrag *= v_vctColor;
    #endif


  // discard pixel alltogether when transparent: don't show in Z-Buffer
  if(vctFrag.a < 0.01)
    discard;
}`;
    FudgeCore.shaderSources["ShaderParticle.vert"] = `#version 300 es
/**
* Particle shader similar to lit textured shader
* @authors Jonas Plotzky, HFU, 2022
*/

uniform mat4 u_mtxMeshToWorld;
uniform mat4 u_mtxWorldToView;
uniform vec3 u_vctCamera;
in vec3 a_vctPosition;

uniform mat3 u_mtxPivot;
in vec2 a_vctTexture;
out vec2 v_vctTexture;

  #if defined(PARTICLE_COLOR)
out vec4 v_vctColor;
  #endif

uniform float u_fParticleSystemDuration;
uniform float u_fParticleSystemSize;
uniform float u_fParticleSystemTime;
uniform sampler2D u_fParticleSystemRandomNumbers;

uniform bool u_bParticleSystemFaceCamera;
uniform bool u_bParticleSystemRestrict;

mat4 lookAt(vec3 _vctTranslation, vec3 _vctTarget) {
  vec3 vctUp = vec3(0.0, 1.0, 0.0);
  vec3 zAxis = normalize(_vctTarget - _vctTranslation);
  vec3 xAxis = normalize(cross(vctUp, zAxis));
  vec3 yAxis = u_bParticleSystemRestrict ? vctUp : normalize(cross(zAxis, xAxis));
  zAxis = u_bParticleSystemRestrict ? normalize(cross(xAxis, vctUp)) : zAxis;

  return mat4(
    xAxis.x, xAxis.y, xAxis.z, 0.0,
    yAxis.x, yAxis.y, yAxis.z, 0.0,
    zAxis.x, zAxis.y, zAxis.z, 0.0,
    _vctTranslation.x,  _vctTranslation.y,  _vctTranslation.z, 1.0
  );
}

void main() {
  vec4 vctPosition = vec4(a_vctPosition, 1.0);
  float fParticleId = float(gl_InstanceID);

  /*$variables*/
  /*$mtxLocal*/
  /*$mtxWorld*/

  mat4 mtxMeshToWorld = /*$mtxWorld*/ u_mtxMeshToWorld /*$mtxLocal*/;
  if (u_bParticleSystemFaceCamera) mtxMeshToWorld = 
    lookAt(vec3(mtxMeshToWorld[3][0], mtxMeshToWorld[3][1], mtxMeshToWorld[3][2]), u_vctCamera) * 
    mat4(
      length(vec3(mtxMeshToWorld[0][0], mtxMeshToWorld[1][0], mtxMeshToWorld[2][0])), 0.0, 0.0, 0.0,
      0.0, length(vec3(mtxMeshToWorld[0][1], mtxMeshToWorld[1][1], mtxMeshToWorld[2][1])), 0.0, 0.0,
      0.0, 0.0, length(vec3(mtxMeshToWorld[0][2], mtxMeshToWorld[1][2], mtxMeshToWorld[2][2])), 0.0,
      0.0, 0.0, 0.0, 1.0
    );

  // calculate position
  gl_Position = u_mtxWorldToView * mtxMeshToWorld * vctPosition;
  v_vctTexture = vec2(u_mtxPivot * vec3(a_vctTexture, 1.0)).xy;
    #if defined(PARTICLE_COLOR)
  v_vctColor = /*$color*/;
    #endif
}`;
    FudgeCore.shaderSources["ShaderPhong.frag"] = `#version 300 es
/**
* Phong shading
* @authors Jirka Dell'Oro-Friedl, HFU, 2022
*/

precision mediump float;
precision highp int;

  // TEXTURE: input UVs and texture
  #if defined(TEXTURE)
in vec2 v_vctTexture;
uniform sampler2D u_texture;
  #endif

uniform vec4 u_vctColor;
uniform float u_fDiffuse;
uniform float u_fSpecular;
uniform mat4 u_mtxMeshToWorld;
uniform vec3 u_vctCamera;

in vec4 v_vctColor;
in vec4 v_vctPosition;
in vec3 v_vctNormal;
out vec4 vctFrag;

struct Light {
  vec4 vctColor;
  mat4 mtxShape;
  mat4 mtxShapeInverse;
};
uniform Light u_ambient;

const uint MAX_LIGHTS_DIRECTIONAL = 15u;
const uint MAX_LIGHTS_POINT = 100u;
const uint MAX_LIGHTS_SPOT = 100u;

layout(std140) uniform Lights
{
uniform uint u_nLightsDirectional;
uniform uint u_nLightsPoint;
uniform uint u_nLightsSpot;
uniform Light u_directional[MAX_LIGHTS_DIRECTIONAL];
uniform Light u_point[MAX_LIGHTS_POINT];
uniform Light u_spot[MAX_LIGHTS_SPOT];
} ;



float calculateReflection(vec3 _vctLight, vec3 _vctView, vec3 _vctNormal, float _fSpecular) {
  if(_fSpecular <= 0.0)
    return 0.0;
  vec3 vctReflection = normalize(reflect(-_vctLight, _vctNormal));
  float fHitCamera = dot(vctReflection, _vctView);
  // attempted BLINN 
  // vec3 halfway = normalize(_vctView + _vctLight);
  // float fHitCamera = dot(-halfway, _vctNormal);
  return pow(max(fHitCamera, 0.0), _fSpecular * 10.0) * _fSpecular; // 10.0 = magic number, looks good... 
}

vec4 illuminateDirected(vec3 _vctDirection, vec3 _vctNormal, vec4 _vctColor, vec3 _vctView, float _fSpecular) {
  vec4 vctResult = vec4(0, 0, 0, 1);
  vec3 vctDirection = normalize(_vctDirection);
  float fIllumination = -dot(_vctNormal, vctDirection);
  if(fIllumination > 0.0f) {
    vctResult += u_fDiffuse * fIllumination * _vctColor;
    float fReflection = calculateReflection(vctDirection, _vctView, _vctNormal, _fSpecular);
    vctResult += fReflection * _vctColor;
  }
  return vctResult;
}

void main() {
  vctFrag = v_vctColor;
  vec3 vctView = normalize(vec3(u_mtxMeshToWorld * v_vctPosition) - u_vctCamera);

  for(uint i = 0u; i < u_nLightsDirectional; i++) {
    vec3 vctDirection = vec3(u_directional[i].mtxShape * vec4(0.0, 0.0, 1.0, 1.0));
    vctFrag += illuminateDirected(vctDirection, v_vctNormal, u_directional[i].vctColor, vctView, u_fSpecular);
  }
  // calculate point light effect
  for(uint i = 0u; i < u_nLightsPoint; i++) {
    vec3 vctPositionLight = vec3(u_point[i].mtxShape * vec4(0.0, 0.0, 0.0, 1.0));
    vec3 vctDirection = vec3(u_mtxMeshToWorld * v_vctPosition) - vctPositionLight;
    float fIntensity = 1.0 - length(mat3(u_point[i].mtxShapeInverse) * vctDirection);
    if(fIntensity < 0.0)
      continue;
    vctFrag += illuminateDirected(vctDirection, v_vctNormal, fIntensity * u_point[i].vctColor, vctView, u_fSpecular);
  }
  // calculate spot light effect
  for(uint i = 0u; i < u_nLightsSpot; i++) {
    vec3 vctPositionLight = vec3(u_spot[i].mtxShape * vec4(0.0, 0.0, 0.0, 1.0));
    vec3 vctDirection = vec3(u_mtxMeshToWorld * v_vctPosition) - vctPositionLight;
    vec3 vctDirectionInverted = mat3(u_spot[i].mtxShapeInverse) * vctDirection;
    if(vctDirectionInverted.z <= 0.0)
      continue;
    float fIntensity = 1.0 - min(1.0, 2.0 * length(vctDirectionInverted.xy) / vctDirectionInverted.z);
    fIntensity *= 1.0 - pow(vctDirectionInverted.z, 2.0);
    if(fIntensity < 0.0)
      continue;
    vctFrag += illuminateDirected(vctDirection, v_vctNormal, fIntensity * u_spot[i].vctColor, vctView, u_fSpecular);
  }

  // TEXTURE: multiply with texel color
    #if defined(TEXTURE)
  vec4 vctColorTexture = texture(u_texture, v_vctTexture);
  vctFrag *= vctColorTexture;
    #endif
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
uniform sampler2D u_texture;

out ivec4 vctFrag;

void main() {
    int pixel = int(trunc(gl_FragCoord.x) + u_vctSize.x * trunc(gl_FragCoord.y));

    if (pixel != u_id)
      discard;
    
    vec4 vctColor = u_vctColor * texture(u_texture, v_vctTexture);
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
    v_vctTexture = vec2(u_mtxPivot * vec3(a_vctTexture, 1.0)).xy;
}`;
    FudgeCore.shaderSources["ShaderUniversal.frag"] = `#version 300 es
/**
* Universal Shader as base for many others. Controlled by compiler directives
* @authors Jirka Dell'Oro-Friedl, HFU, 2021
*/

precision mediump float;
precision highp int;

  // MINIMAL (no define needed): include base color
uniform vec4 u_vctColor;

  // FLAT: input vertex colors flat, so the third of a triangle determines the color
  #if defined(FLAT) 
flat in vec4 v_vctColor;
  // LIGHT: input vertex colors for each vertex for interpolation over the face
  #elif defined(LIGHT) || defined(PARTICLE_COLOR)
in vec4 v_vctColor;
  #endif

  // TEXTURE: input UVs and texture
  #if defined(TEXTURE) || defined(MATCAP)
in vec2 v_vctTexture;
uniform sampler2D u_texture;
  #endif

out vec4 vctFrag;

void main() {
    // MINIMAL: set the base color
  vctFrag = u_vctColor;

    // VERTEX: multiply with vertex color
    #if defined(FLAT) || defined(LIGHT) || defined(PARTICLE_COLOR)
  vctFrag *= v_vctColor;
    #endif

    // TEXTURE: multiply with texel color
    #if defined(TEXTURE) || defined(MATCAP)
  vec4 vctColorTexture = texture(u_texture, v_vctTexture);
  vctFrag *= vctColorTexture;
    #endif

    // discard pixel alltogether when transparent: don't show in Z-Buffer
  if(vctFrag.a < 0.01)
    discard;
}`;
    FudgeCore.shaderSources["ShaderUniversal.vert"] = `#version 300 es
/**
* Universal Shader as base for many others. Controlled by compiler directives
* @authors 2021, Luis Keck, HFU, 2021 | Jirka Dell'Oro-Friedl, HFU, 2021
*/

precision mediump float;
precision highp int;

  // MINIMAL (no define needed): buffers for transformation
uniform mat4 u_mtxMeshToView;
in vec3 a_vctPosition;

  // PARTICLE: offer buffer and functionality for in shader position calculation
  // CAMERA: offer buffer and functionality for specular reflection depending on the camera-position
  #if defined(CAMERA) || defined(PARTICLE)
uniform mat4 u_mtxMeshToWorld;
uniform vec3 u_vctCamera;
  #endif

  #if defined(CAMERA)
uniform float u_fSpecular;

float calculateReflection(vec3 _vctLight, vec3 _vctView, vec3 _vctNormal, float _fSpecular) {
  if(_fSpecular <= 0.0)
    return 0.0;
  vec3 vctReflection = normalize(reflect(-_vctLight, _vctNormal));
  float fHitCamera = dot(vctReflection, _vctView);
  return pow(max(fHitCamera, 0.0), _fSpecular * 10.0) * _fSpecular; // 10.0 = magic number, looks good... 
}
  #endif

  // LIGHT: offer buffers for lighting vertices with different light types
  #if defined(LIGHT)
uniform mat4 u_mtxNormalMeshToWorld;
in vec3 a_vctNormal;
uniform float u_fDiffuse;

struct Light {
  vec4 vctColor;
  mat4 mtxShape;
  mat4 mtxShapeInverse;
};

uniform Light u_ambient;

  #if !defined(PHONG)
const uint MAX_LIGHTS_DIRECTIONAL = 15u;
const uint MAX_LIGHTS_POINT = 100u;
const uint MAX_LIGHTS_SPOT = 100u;

layout(std140) uniform Lights {
  uniform uint u_nLightsDirectional;
  uniform uint u_nLightsPoint;
  uniform uint u_nLightsSpot;
  uniform Light u_directional[MAX_LIGHTS_DIRECTIONAL];
  uniform Light u_point[MAX_LIGHTS_POINT];
  uniform Light u_spot[MAX_LIGHTS_SPOT];
};
  #endif

vec4 illuminateDirected(vec3 _vctDirection, vec3 _vctNormal, vec4 _vctColor, vec3 _vctView, float _fSpecular) {
  vec4 vctResult = vec4(0, 0, 0, 1);
  vec3 vctDirection = normalize(_vctDirection);
  float fIllumination = -dot(_vctNormal, vctDirection);
  if(fIllumination > 0.0f) {
    vctResult += u_fDiffuse * fIllumination * _vctColor;
        #if defined(CAMERA)
    float fReflection = calculateReflection(vctDirection, _vctView, _vctNormal, _fSpecular);
    vctResult += fReflection * _vctColor;
        #endif
  }
  return vctResult;
}
  #endif 

  // TEXTURE: offer buffers for UVs and pivot matrix
  #if defined(TEXTURE)
uniform mat3 u_mtxPivot;
in vec2 a_vctTexture;
out vec2 v_vctTexture;
  #endif

  #if defined(MATCAP) // MatCap-shader generates texture coordinates from surface normals
in vec3 a_vctNormal;
uniform mat4 u_mtxNormalMeshToWorld;
uniform mat4 u_mtxWorldToCamera;
out vec2 v_vctTexture;
  #endif

  #if defined(PHONG)
out vec3 v_vctNormal;
out vec4 v_vctPosition;
  #endif

  #if defined(SKIN)
// uniform mat4 u_mtxMeshToWorld;
// Bones
// https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/skinning_pars_vertex.glsl.js
in uvec4 a_iBone;
in vec4 a_fWeight;
const uint MAX_BONES = 256u;
struct Bone {
  mat4 matrix; // TODO: change name to mtx to conform with naming scheme
};
layout (std140) uniform Skin {
  Bone u_bones[MAX_BONES];
};
  #endif

  // FLAT: outbuffer is flat
  #if defined(FLAT)
flat out vec4 v_vctColor;
  #elif defined(LIGHT) || defined(PARTICLE)
  // regular if not FLAT
out vec4 v_vctColor;
  #endif

  #if defined(PARTICLE)
uniform mat4 u_mtxWorldToView;
uniform float u_fParticleSystemDuration;
uniform float u_fParticleSystemSize;
uniform float u_fParticleSystemTime;
uniform sampler2D u_fParticleSystemRandomNumbers;
uniform bool u_bParticleSystemFaceCamera;
uniform bool u_bParticleSystemRestrict;

mat4 lookAt(vec3 _vctTranslation, vec3 _vctTarget) {
  vec3 vctUp = vec3(0.0, 1.0, 0.0);
  vec3 zAxis = normalize(_vctTarget - _vctTranslation);
  vec3 xAxis = normalize(cross(vctUp, zAxis));
  vec3 yAxis = u_bParticleSystemRestrict ? vctUp : normalize(cross(zAxis, xAxis));
  zAxis = u_bParticleSystemRestrict ? normalize(cross(xAxis, vctUp)) : zAxis;

  return mat4(
    xAxis.x, xAxis.y, xAxis.z, 0.0,
    yAxis.x, yAxis.y, yAxis.z, 0.0,
    zAxis.x, zAxis.y, zAxis.z, 0.0,
    _vctTranslation.x,  _vctTranslation.y,  _vctTranslation.z, 1.0
  );
}

float fetchRandomNumber(int _iIndex, int _iParticleSystemRandomNumbersSize, int _iParticleSystemRandomNumbersLength) {
  _iIndex = _iIndex % _iParticleSystemRandomNumbersLength;
  return texelFetch(u_fParticleSystemRandomNumbers, ivec2(_iIndex % _iParticleSystemRandomNumbersSize, _iIndex / _iParticleSystemRandomNumbersSize), 0).r;
}
  #endif

void main() {
  vec4 vctPosition = vec4(a_vctPosition, 1.0);

    #if defined(CAMERA) || defined(PARTICLE)
  mat4 mtxMeshToWorld = u_mtxMeshToWorld;
    #endif

    #if defined(PARTICLE)
  float fParticleId = float(gl_InstanceID);
  int iParticleSystemRandomNumbersSize = textureSize(u_fParticleSystemRandomNumbers, 0).x; // the dimension of the quadratic texture
  int iParticleSystemRandomNumbersLength = iParticleSystemRandomNumbersSize * iParticleSystemRandomNumbersSize; // the total number of texels in the texture
  /*$variables*/
  /*$mtxLocal*/
  /*$mtxWorld*/
  mtxMeshToWorld = /*$mtxWorld*/ mtxMeshToWorld /*$mtxLocal*/;
  if (u_bParticleSystemFaceCamera) 
    mtxMeshToWorld = 
      lookAt(vec3(mtxMeshToWorld[3][0], mtxMeshToWorld[3][1], mtxMeshToWorld[3][2]), u_vctCamera) * 
      mat4(
        length(vec3(mtxMeshToWorld[0][0], mtxMeshToWorld[1][0], mtxMeshToWorld[2][0])), 0.0, 0.0, 0.0,
        0.0, length(vec3(mtxMeshToWorld[0][1], mtxMeshToWorld[1][1], mtxMeshToWorld[2][1])), 0.0, 0.0,
        0.0, 0.0, length(vec3(mtxMeshToWorld[0][2], mtxMeshToWorld[1][2], mtxMeshToWorld[2][2])), 0.0,
        0.0, 0.0, 0.0, 1.0
      );
  mat4 mtxMeshToView = u_mtxWorldToView * mtxMeshToWorld;
    #else
  mat4 mtxMeshToView = u_mtxMeshToView;
    #endif

    #if defined(LIGHT) || defined(MATCAP)
  vec3 vctNormal = a_vctNormal;
      #if defined(PARTICLE)
  mat4 mtxNormalMeshToWorld = transpose(inverse(mtxMeshToWorld));
      #else
  mat4 mtxNormalMeshToWorld = u_mtxNormalMeshToWorld;
      #endif
      #if defined(LIGHT)
  v_vctColor = u_fDiffuse * u_ambient.vctColor;
      #endif
    #endif


    #if defined(SKIN)
  mat4 mtxSkin = a_fWeight.x * u_bones[a_iBone.x].matrix +
    a_fWeight.y * u_bones[a_iBone.y].matrix +
    a_fWeight.z * u_bones[a_iBone.z].matrix +
    a_fWeight.w * u_bones[a_iBone.w].matrix;

  mtxMeshToView *= mtxSkin;
  mtxNormalMeshToWorld = transpose(inverse(mtxMeshToWorld * mtxSkin));
    #endif

    // calculate position and normal according to input and defines
  gl_Position = mtxMeshToView * vctPosition;

    #if defined(CAMERA) || defined(MATCAP)
  vec3 vctView = normalize(vec3(u_mtxMeshToWorld * vctPosition) - u_vctCamera);
    #endif

    #if defined(LIGHT)
  vctNormal = normalize(mat3(mtxNormalMeshToWorld) * vctNormal);
      #if defined(PHONG)
  v_vctNormal = vctNormal; // pass normal to fragment shader
  v_vctPosition = vctPosition;
      #endif  

    #if !defined(PHONG)
  // calculate directional light effect
  for(uint i = 0u; i < u_nLightsDirectional; i++) {
    vec3 vctDirection = vec3(u_directional[i].mtxShape * vec4(0.0, 0.0, 1.0, 1.0));
    v_vctColor += illuminateDirected(vctDirection, vctNormal, u_directional[i].vctColor, vctView, u_fSpecular);
  }
  // calculate point light effect
  for(uint i = 0u; i < u_nLightsPoint; i++) {
    vec3 vctPositionLight = vec3(u_point[i].mtxShape * vec4(0.0, 0.0, 0.0, 1.0));
    vec3 vctDirection = vec3(mtxMeshToWorld * vctPosition) - vctPositionLight;
    float fIntensity = 1.0 - length(mat3(u_point[i].mtxShapeInverse) * vctDirection);
    if(fIntensity < 0.0)
      continue;
    v_vctColor += illuminateDirected(vctDirection, vctNormal, fIntensity * u_point[i].vctColor, vctView, u_fSpecular);
  }

  // calculate spot light effect
  for(uint i = 0u; i < u_nLightsSpot; i++) {
    vec3 vctPositionLight = vec3(u_spot[i].mtxShape * vec4(0.0, 0.0, 0.0, 1.0));
    vec3 vctDirection = vec3(mtxMeshToWorld * vctPosition) - vctPositionLight;
    vec3 vctDirectionInverted = mat3(u_spot[i].mtxShapeInverse) * vctDirection;
    if(vctDirectionInverted.z <= 0.0)
      continue;
    float fIntensity = 1.0 - min(1.0, 2.0 * length(vctDirectionInverted.xy) / vctDirectionInverted.z);
    fIntensity *= 1.0 - pow(vctDirectionInverted.z, 2.0);
    if(fIntensity < 0.0)
      continue;
    v_vctColor += illuminateDirected(vctDirection, vctNormal, fIntensity * u_spot[i].vctColor, vctView, u_fSpecular);
  }
      #endif // PHONG
    #endif

    // TEXTURE: transform UVs
    #if defined(TEXTURE)
  v_vctTexture = vec2(u_mtxPivot * vec3(a_vctTexture, 1.0)).xy;
    #endif

    #if defined(MATCAP)
  vec4 vctVertexInCamera = normalize(u_mtxWorldToCamera * vctPosition);
  vctVertexInCamera.xy *= -1.0;
  mat4 mtx_RotX = mat4(1, 0, 0, 0, 0, vctVertexInCamera.z, vctVertexInCamera.y, 0, 0, -vctVertexInCamera.y, vctVertexInCamera.z, 0, 0, 0, 0, 1);
  mat4 mtx_RotY = mat4(vctVertexInCamera.z, 0, -vctVertexInCamera.x, 0, 0, 1, 0, 0, vctVertexInCamera.x, 0, vctVertexInCamera.z, 0, 0, 0, 0, 1);

  vctNormal = mat3(u_mtxNormalMeshToWorld) * a_vctNormal;

  // adds correction for things being far and to the side, but distortion for things being close
  vctNormal = mat3(mtx_RotX * mtx_RotY) * vctNormal;
  
  vec3 vctReflection = normalize(mat3(u_mtxWorldToCamera) * normalize(vctNormal));
  vctReflection.y = -vctReflection.y;

  v_vctTexture = 0.5 * vctReflection.xy + 0.5;
    #endif

    #if defined(PARTICLE_COLOR)
  vec4 vctParticleColor = /*$color*/;
      #if defined(LIGHT)
  v_vctColor *= vctParticleColor;
  v_vctColor.a = vctParticleColor.a;
      #else
  v_vctColor = vctParticleColor;
      #endif
    #else
    // always full opacity for now...
      #if defined(LIGHT)
    v_vctColor.a = 1.0;
      #endif
    #endif
}`;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    var Shader_1;
    let Shader = Shader_1 = class Shader {
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
            let code = `#version 300 es\n`;
            for (let define of _defines)
                code += `#define ${define}\n`;
            return _shader.replace("#version 300 es", code);
        }
    };
    Shader.baseClass = Shader_1;
    Shader.subclasses = [];
    Shader = Shader_1 = __decorate([
        FudgeCore.RenderInjectorShader.decorate
    ], Shader);
    FudgeCore.Shader = Shader;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderFlat extends FudgeCore.Shader {
        static getCoat() { return FudgeCore.CoatRemissive; }
    }
    ShaderFlat.iSubclass = FudgeCore.Shader.registerSubclass(ShaderFlat);
    ShaderFlat.define = [
        "LIGHT",
        "FLAT",
        "CAMERA"
    ];
    FudgeCore.ShaderFlat = ShaderFlat;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderFlatSkin extends FudgeCore.Shader {
        static getCoat() { return FudgeCore.CoatRemissive; }
    }
    ShaderFlatSkin.iSubclass = FudgeCore.Shader.registerSubclass(ShaderFlatSkin);
    ShaderFlatSkin.define = [
        "LIGHT",
        "FLAT",
        "SKIN",
        "CAMERA"
    ];
    FudgeCore.ShaderFlatSkin = ShaderFlatSkin;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderFlatTextured extends FudgeCore.Shader {
        static getCoat() { return FudgeCore.CoatRemissiveTextured; }
    }
    ShaderFlatTextured.iSubclass = FudgeCore.Shader.registerSubclass(ShaderFlatTextured);
    ShaderFlatTextured.define = [
        "LIGHT",
        "FLAT",
        "TEXTURE",
        "CAMERA"
    ];
    FudgeCore.ShaderFlatTextured = ShaderFlatTextured;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderFlatTexturedSkin extends FudgeCore.Shader {
        static getCoat() { return FudgeCore.CoatRemissiveTextured; }
    }
    ShaderFlatTexturedSkin.iSubclass = FudgeCore.Shader.registerSubclass(FudgeCore.ShaderFlatTextured);
    ShaderFlatTexturedSkin.define = [
        "LIGHT",
        "FLAT",
        "TEXTURE",
        "CAMERA",
        "SKIN"
    ];
    FudgeCore.ShaderFlatTexturedSkin = ShaderFlatTexturedSkin;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderGouraud extends FudgeCore.Shader {
        static getCoat() { return FudgeCore.CoatRemissive; }
    }
    ShaderGouraud.iSubclass = FudgeCore.Shader.registerSubclass(ShaderGouraud);
    ShaderGouraud.define = [
        "LIGHT",
        "CAMERA"
    ];
    FudgeCore.ShaderGouraud = ShaderGouraud;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderGouraudSkin extends FudgeCore.Shader {
        static getCoat() { return FudgeCore.CoatRemissive; }
    }
    ShaderGouraudSkin.iSubclass = FudgeCore.Shader.registerSubclass(ShaderGouraudSkin);
    ShaderGouraudSkin.define = [
        "LIGHT",
        "SKIN",
        "CAMERA"
    ];
    FudgeCore.ShaderGouraudSkin = ShaderGouraudSkin;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderGouraudTextured extends FudgeCore.Shader {
        static getCoat() { return FudgeCore.CoatRemissiveTextured; }
    }
    ShaderGouraudTextured.iSubclass = FudgeCore.Shader.registerSubclass(ShaderGouraudTextured);
    ShaderGouraudTextured.define = [
        "LIGHT",
        "TEXTURE",
        "CAMERA"
    ];
    FudgeCore.ShaderGouraudTextured = ShaderGouraudTextured;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderGouraudTexturedSkin extends FudgeCore.Shader {
        static getCoat() { return FudgeCore.CoatRemissiveTextured; }
    }
    ShaderGouraudTexturedSkin.iSubclass = FudgeCore.Shader.registerSubclass(FudgeCore.ShaderGouraudTextured);
    ShaderGouraudTexturedSkin.define = [
        "LIGHT",
        "TEXTURE",
        "CAMERA",
        "SKIN"
    ];
    FudgeCore.ShaderGouraudTexturedSkin = ShaderGouraudTexturedSkin;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderLit extends FudgeCore.Shader {
    }
    ShaderLit.iSubclass = FudgeCore.Shader.registerSubclass(ShaderLit);
    ShaderLit.define = [];
    FudgeCore.ShaderLit = ShaderLit;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderLitSkin extends FudgeCore.Shader {
    }
    ShaderLitSkin.iSubclass = FudgeCore.Shader.registerSubclass(FudgeCore.ShaderLit);
    ShaderLitSkin.define = [
        "SKIN"
    ];
    FudgeCore.ShaderLitSkin = ShaderLitSkin;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderLitTextured extends FudgeCore.Shader {
        static getCoat() { return FudgeCore.CoatTextured; }
    }
    ShaderLitTextured.iSubclass = FudgeCore.Shader.registerSubclass(ShaderLitTextured);
    ShaderLitTextured.define = [
        "TEXTURE"
    ];
    FudgeCore.ShaderLitTextured = ShaderLitTextured;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderLitTexturedSkin extends FudgeCore.Shader {
        static getCoat() { return FudgeCore.CoatTextured; }
    }
    ShaderLitTexturedSkin.iSubclass = FudgeCore.Shader.registerSubclass(FudgeCore.ShaderLitTextured);
    ShaderLitTexturedSkin.define = [
        "TEXTURE",
        "SKIN"
    ];
    FudgeCore.ShaderLitTexturedSkin = ShaderLitTexturedSkin;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderMatCap extends FudgeCore.Shader {
        static getCoat() { return FudgeCore.CoatTextured; }
    }
    ShaderMatCap.iSubclass = FudgeCore.Shader.registerSubclass(ShaderMatCap);
    ShaderMatCap.define = [
        "MATCAP",
        "CAMERA"
    ];
    FudgeCore.ShaderMatCap = ShaderMatCap;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderParticle extends FudgeCore.Shader {
        static getCoat() { return FudgeCore.CoatTextured; }
        static getVertexShaderSource() {
            return this.insertDefines(FudgeCore.shaderSources["Source/ShaderParticle.vert"], this.define);
        }
        static getFragmentShaderSource() {
            return this.insertDefines(FudgeCore.shaderSources["Source/ShaderParticle.frag"], this.define);
        }
    }
    ShaderParticle.iSubclass = FudgeCore.Shader.registerSubclass(ShaderParticle);
    ShaderParticle.define = [];
    FudgeCore.ShaderParticle = ShaderParticle;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderPhong extends FudgeCore.Shader {
        static getCoat() { return FudgeCore.CoatRemissive; }
        static getFragmentShaderSource() {
            return this.insertDefines(FudgeCore.shaderSources["ShaderPhong.frag"], this.define);
        }
    }
    ShaderPhong.iSubclass = FudgeCore.Shader.registerSubclass(ShaderPhong);
    ShaderPhong.define = [
        "LIGHT",
        "CAMERA",
        "PHONG"
    ];
    FudgeCore.ShaderPhong = ShaderPhong;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderPhongSkin extends FudgeCore.Shader {
        static getCoat() { return FudgeCore.CoatRemissive; }
        static getFragmentShaderSource() {
            return this.insertDefines(FudgeCore.shaderSources["ShaderPhong.frag"], this.define);
        }
    }
    ShaderPhongSkin.iSubclass = FudgeCore.Shader.registerSubclass(ShaderPhongSkin);
    ShaderPhongSkin.define = [
        "LIGHT",
        "CAMERA",
        "PHONG",
        "SKIN"
    ];
    FudgeCore.ShaderPhongSkin = ShaderPhongSkin;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderPhongTextured extends FudgeCore.Shader {
        static getCoat() { return FudgeCore.CoatRemissiveTextured; }
        static getFragmentShaderSource() {
            return this.insertDefines(FudgeCore.shaderSources["ShaderPhong.frag"], this.define);
        }
    }
    ShaderPhongTextured.iSubclass = FudgeCore.Shader.registerSubclass(FudgeCore.ShaderPhong);
    ShaderPhongTextured.define = [
        "LIGHT",
        "CAMERA",
        "PHONG",
        "TEXTURE"
    ];
    FudgeCore.ShaderPhongTextured = ShaderPhongTextured;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderPhongTexturedSkin extends FudgeCore.Shader {
        static getCoat() { return FudgeCore.CoatRemissiveTextured; }
        static getFragmentShaderSource() {
            return this.insertDefines(FudgeCore.shaderSources["ShaderPhong.frag"], this.define);
        }
    }
    ShaderPhongTexturedSkin.iSubclass = FudgeCore.Shader.registerSubclass(FudgeCore.ShaderPhong);
    ShaderPhongTexturedSkin.define = [
        "LIGHT",
        "CAMERA",
        "PHONG",
        "TEXTURE",
        "SKIN"
    ];
    FudgeCore.ShaderPhongTexturedSkin = ShaderPhongTexturedSkin;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderPick extends FudgeCore.Shader {
        static getVertexShaderSource() {
            return this.insertDefines(FudgeCore.shaderSources["ShaderPick.vert"], this.define);
        }
        static getFragmentShaderSource() {
            return this.insertDefines(FudgeCore.shaderSources["ShaderPick.frag"], this.define);
        }
    }
    ShaderPick.define = [];
    FudgeCore.ShaderPick = ShaderPick;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class ShaderPickTextured extends FudgeCore.Shader {
        static getVertexShaderSource() {
            return this.insertDefines(FudgeCore.shaderSources["ShaderPickTextured.vert"], this.define);
        }
        static getFragmentShaderSource() {
            return this.insertDefines(FudgeCore.shaderSources["ShaderPickTextured.frag"], this.define);
        }
    }
    ShaderPickTextured.define = [];
    FudgeCore.ShaderPickTextured = ShaderPickTextured;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Skeleton extends FudgeCore.Graph {
        constructor(_name = "Skeleton") {
            super(_name);
            this.bones = {};
            this.mtxBindInverses = {};
            this.hndChildRemove = (_event) => {
                if (_event.currentTarget != this)
                    return;
                for (const node of _event.target)
                    if (this.bones[node.name]) {
                        delete this.bones[node.name];
                        delete this.mtxBindInverses[node.name];
                    }
            };
            this.registerBone(this);
            this.addEventListener("childRemove", this.hndChildRemove);
        }
        addBone(_bone, _parentName, _mtxInit) {
            if (_parentName)
                this.bones[_parentName].addChild(_bone);
            else
                this.addChild(_bone);
            if (!_bone.cmpTransform)
                _bone.addComponent(new FudgeCore.ComponentTransform());
            if (_mtxInit)
                _bone.mtxLocal.set(_mtxInit);
            this.calculateMtxWorld(_bone);
            this.registerBone(_bone);
        }
        registerBone(_bone, _mtxBindInverse = _bone.mtxWorldInverse) {
            this.bones[_bone.name] = _bone;
            this.mtxBindInverses[_bone.name] = _mtxBindInverse;
        }
        setDefaultPose() {
            for (const node of this) {
                if (!(node.name in this.mtxBindInverses))
                    continue;
                this.calculateMtxWorld(node);
                this.mtxBindInverses[node.name] = node.mtxWorldInverse;
            }
        }
        indexOfBone(_boneName) {
            let index = 0;
            for (const boneName in this.bones) {
                if (_boneName == boneName)
                    return index;
                index++;
            }
            return -1;
        }
        serialize() {
            const serialization = super.serialize();
            serialization.mtxBindInverses = {};
            for (const boneName in this.mtxBindInverses)
                serialization.mtxBindInverses[boneName] = this.mtxBindInverses[boneName].serialize();
            return serialization;
        }
        async deserialize(_serialization) {
            await super.deserialize(_serialization);
            for (const node of this)
                if (_serialization.mtxBindInverses[node.name])
                    this.registerBone(node, await new FudgeCore.Matrix4x4().deserialize(_serialization.mtxBindInverses[node.name]));
            return this;
        }
        calculateMtxWorld(_node) {
            _node.mtxWorld.set(_node.cmpTransform ?
                FudgeCore.Matrix4x4.MULTIPLICATION(_node.getParent().mtxWorld, _node.mtxLocal) :
                _node.getParent().mtxWorld);
            _node.mtxWorldInverse.set(FudgeCore.Matrix4x4.INVERSION(_node.mtxWorld));
        }
    }
    FudgeCore.Skeleton = Skeleton;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class SkeletonInstance extends FudgeCore.GraphInstance {
        #bones;
        #mtxBoneLocals;
        #mtxBones;
        #mtxBonesUpdated;
        static async CREATE(_skeleton) {
            const skeleton = new SkeletonInstance();
            await skeleton.set(_skeleton);
            return skeleton;
        }
        get bones() {
            return this.#bones;
        }
        get mtxBoneLocals() {
            return this.#mtxBoneLocals;
        }
        get mtxBones() {
            if (this.#mtxBonesUpdated != this.timestampUpdate) {
                this.calculateMtxBones();
                this.#mtxBonesUpdated = this.timestampUpdate;
            }
            return this.#mtxBones;
        }
        async set(_skeleton) {
            await super.set(_skeleton);
            this.skeletonSource = _skeleton;
            this.registerBones();
        }
        serialize() {
            const serialization = super.serialize();
            if (this.bindPose) {
                serialization.bindPose = {};
                for (const boneName in this.bindPose)
                    serialization.bindPose[boneName] = this.bindPose[boneName].serialize();
            }
            return serialization;
        }
        async deserialize(_serialization) {
            await super.deserialize(_serialization);
            this.skeletonSource = FudgeCore.Project.resources[_serialization.idSource || _serialization.idResource];
            this.registerBones();
            if (_serialization.bindPose) {
                this.bindPose = {};
                for (const boneName in _serialization.bindPose)
                    this.bindPose[boneName] = await new FudgeCore.Matrix4x4().deserialize(_serialization.bindPose[boneName]);
            }
            return this;
        }
        resetPose() {
            for (const boneName in this.bones)
                this.bones[boneName].mtxLocal.set(FudgeCore.Matrix4x4.INVERSION(this.skeletonSource.mtxBindInverses[boneName]));
        }
        applyAnimation(_mutator) {
            super.applyAnimation(_mutator);
            if (_mutator.mtxBoneLocals)
                for (const boneName in _mutator.mtxBoneLocals) {
                    const mtxMutator = _mutator.mtxBoneLocals[boneName];
                    if (mtxMutator.rotation?.w != undefined) {
                        mtxMutator.rotation = new FudgeCore.PhysicsQuaternion(mtxMutator.rotation.x, mtxMutator.rotation.y, mtxMutator.rotation.z, mtxMutator.rotation.w).toDegrees();
                    }
                    this.mtxBoneLocals[boneName]?.mutate(mtxMutator);
                }
            if (_mutator.bones)
                for (const boneName in _mutator.bones)
                    this.bones[boneName]?.applyAnimation(_mutator.bones[boneName]);
        }
        calculateMtxBones() {
            this.#mtxBones = [];
            for (const boneName in this.bones) {
                const mtxBone = this.getParent()?.mtxWorldInverse.clone || FudgeCore.Matrix4x4.IDENTITY();
                mtxBone.multiply(this.bones[boneName].mtxWorld);
                mtxBone.multiply(this.skeletonSource.mtxBindInverses[boneName]);
                this.#mtxBones.push(mtxBone);
            }
        }
        registerBones() {
            this.#bones = {};
            this.#mtxBoneLocals = {};
            for (const node of this)
                if (this.skeletonSource.mtxBindInverses[node.name]) {
                    this.bones[node.name] = node;
                    this.mtxBoneLocals[node.name] = node.mtxLocal;
                }
        }
    }
    FudgeCore.SkeletonInstance = SkeletonInstance;
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
        constructor(_name = "Texture") {
            super();
            this.idResource = undefined;
            this.mipmap = MIPMAP.CRISP;
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
        constructor(_name, _base64, _mipmap = MIPMAP.CRISP) {
            super(_name);
            this.image = new Image();
            this.image.src = _base64;
            this.mipmap = _mipmap;
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
        static get() {
            return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQCAYAAACAvzbMAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAADWLSURBVHhe7d0HnFTlvf/xH9uXZYGl9yrSRJpEUexYsJIba8Re498WNcZEb+41epOIsWs0Niyxm2g0duwaewO7oqJCAGnSt7H/8304B4dldpk5Z3b3zO7nzeu85pwzM8vMs7PPb35PO61qPBZjrVq18vfiKebFR/lFRPlFQ/lFE/fyy/FvAQBICwEEABAKAQQAEAp9IBHRhhoN5RcN5RdNSyg//YzCwkJr3bq1O169erXbMoEAEhF/wNFQftFQftE09/LLzc21Ll262E9+8hMbP368VVdX2+uvv27Tp093QSTq+yeARMQfcDSUXzSUXzTNtfxycnKspKTEBg0aZEceeaQdeuihtmLFCvvss89s3rx59vjjj9vDDz8cOROJHECqqqps9uzZtmzZMlu5cqVLldq1a2d9+/Z1+1HxAYyG8ouG8ouG8osmTPnl5+db9+7dbffdd7dTTz3V1cXvvvuuvfzyyy4DkVWrVtmNN95oS5YsccdhhQ4g5eXl9uyzz9qMGTNszZo1/tkfKQIq+u29995WWlrqn00fH8BoKL9oKL9oKL9o0ik/PbZNmza2xRZb2HHHHWeTJ0+2hQsX2pNPPmmLFy/2H7XOf/7zH7v11ltdPR5FqACyYMECu+eee1KKXmvXrrX99tvPRo8e7YJKuvgARkP5RROUnz67+iKUl5dnlZWVtnz58li8dj5/0TSn8lOT1b777msXXHCBde7c2V577TV78803k77Hb7/91u644w6rqKjwz4STdgBRtqHUJ4hoChCffPKJffXVV649rX379jZgwAC3BZQuTZo0ybbbbjuXXqWDD2A0lF80Qfl17NjRjjnmGOvUqZN988039sADD7gvUk39+vn8RdOcyq9r1642depU23rrre3RRx91X3JEdbSasIqLi23YsGHuXKYCSNopgXrvg+Ch/o/77rvPvVi9+J///Od29NFH29ChQ90LDGj4mNIlBZm4/8LQssycOdM1xb766qtJm2JF2UfPnj3t17/+tU2YMMF23XVXO/bYY11QQfM1f/58u+mmm1zfgfp44071sV6zPstB8FA9rC/8Tz31lOsXybS0MpAffvjBrr766vUdMUEfiFKm/fff38rKytan+MpGVPjBY/XHqezjrLPOcp3sqeIbTDSUX/3+8Ic/uM+r6EvQT3/6UzfsMSg33SqAqF35mWeesWuvvdadl4ceesjee+89/6hp8PmLpr7y06ilK6+80lXM0r9/fxs5cqT7glxQUODONbR0yi/4onPEEUe4Y420euedd9xgpqOOOsp23HFHNwpLmiQD+eCDDzboxX/77bddxnHggQdanz59rG3bti7bUIDo1q2b60APFBUV2XPPPReLtB9IRn9QL730Usodi7U7JtG8qEN6l1128Y/Mvv76a/vnP/9pf/7zn+3BBx+0L7/8MlZ1mZqq5s6d6z7H+qKjZivR+1DgCyYSZlJaAeSLL77w98w+//xz98IU7fTNLVmkHDFixAYd53q83lTUnn+gISjD1lD0VCuF4MsUmi/1J6hzWp+JYFPGqqZPVdSXXnqpy0w12ikO9JlUdrF06dL1n2NNJmyojCnlAKIX89133/lH5iKd2oPVrpYYJBKpOUujAQLqgHzrrbfqbGsGgDhR3TZu3LiN6rigctYXjldeecV947/++uvtjTfecK0zTSl4bY0h5QCib2dBW6BoCK+G5qpnvz7KTgJq2vr000/JQABkDTX/1FcpB/epA1v9Dmriuvvuu+3jjz9u9llqygGk9pwPRVkN1d3UsFwN6w2oj0RDIINOSwCIO9Vh6UyGVkBRE/+9995rF198cSz7SzIl5QBSOy1T770KVu1r9UkMMNpXlKbtGEA26d27d51N9ckoWKhfWF+WP/zwQ9dfctVVV7lBGmrNaS5SHsar4YoagRC4/PLL3WJc2267revrqItWfnziiSf8I7MrrrjCDS3TkLhU1O6cV2eQRnzFxWOPPebvxdNee+3l78VTU5Wfvsz06tXLTbwKMmLNadKowj333HP9Om4qP1Ucm2++ud12221uGHtA4+s18kWdrE2Fz180qZafRpxqCGzULCKoz3r06OG6ADQ8vL41A9MZxlsXDUvXcHX1QQfDzjM1jDflAKIp8YmFrXa+F154wUaNGlVvZFaweOSRR/yjdYFHHU36g0xF7QJUn8ovfvEL/wgIp0OHDi5Y6FthEEDU5DB8+HAbPHjwBpmzPoP6I5wyZYobdRO45ZZb3ECSVD/LQG2a3vCrX/2qzjq02QSQ2oHgsssuczMeNammvjdZO/Bccsklbo0WRd5U1P7ZajZLnF/S1PRtNc4Ss784aqryU3/cbrvt5r7QBAFE67tp3P/YsWPXD3tU+emPWxO0zj33XJdBBzRRdrPNNnP3NRU+f9GkWn6LFi1yQ2MzSavkaoSXvrTUpdkEEM04V2dQQDM0lYEoENT3JhVkNI1e1PehAKI3oW95qchEATakFIuvyVB+9Uucif73v//drZRw0EEHrR9dqPJTP5+aG1QZXnPNNe68qAlrzpw5/lHT4PMXTarlp+Z61Vthy1ufIdV/Wq1jzJgxtuWWW7ovMZuSifJryACScq9Q7YkomtWoP7xNFWjikN1gOZPE5gGgKSX236kvQ0PVEz/T+gPW8HNlJel0oqJ50UWY1N+VjqDyVx+HgoaWWD/ttNNcs2cqwSMbpPwXUXsYm2aVa8GuTRVq4iJkWvpBP2dTI7eAxpLYgakAohEyiaME9Y1RF+ZR81VcZhujcelLhQJIOtmAHjtw4EC3zJP6ODSYoCmbOhtKygEkcT6H6Pj777/fYHJhMonrBWkuiUa+1DdqC2hMiSvqqj9DQSLxM63mrD/96U8u+0hswkXLoTkdm2ppCYKLVuZQsFDQOOyww9zy6c35C3PKAURtwomLcamgtLRJfQFETVxa8iSg9mINwaUJC3GhjsyAPtMaqpk45+mPf/yja4ZVB3vU60cjO2kqQrLsI2jSVL2ozvCTTjrJTjjhBLe/qRU6GotedzqZU7pSDiAqrMS5G5qFrqn69a1rpdmXQQelaDVLdR5p6BoQB1qmIpFGxGg+iBbL0wSwp59+en3wUIdjpkfiIN70JXn27NnrM5CgQlYrihaL1WKyZ599trtgXuKyTU1Br0tdC5r0qC/qwaams2RzldSvrfv0eHWwh5FyAJEhQ4b4e+uGQeoCUXUtHKYC1yJjAf0S1L48fvz42ERnQJ/jbbbZxj9a90VJ/Xb/+Mc/3FUHP/roI/dZ1qJ5t99+e1ZcWAiZof5djb5KpC/Rutb4Oeec42513JDf8NOhTEiXtL3zzjvdnKZgu+GGG2yHHXbY4HUGCYEWgNTjzz//fLfwbbrvJa0Aojkfif0XmkSoIbq1U3v9wWmJYw0VC2juhx6vSVc0YSFOJk6c6EZaJcumVYkoG9HwXV3LRkMiAyzJ07xp3T7182rSqT4jv/zlL+3www93rShxrMPUsqM6Vv3TGq6rS2do/p4mbmsVEV16PKBgoStrqpVI13lSP83JJ5+c9qoKaV2RUPSCFJWDSKUmKnU+brXVVi4CqqNcLz5x6Xcdawy9Jh8q5UvnRcYlutclzeJrdJRfanT1Oa2gqm9sCgz6oqSMWX90weVBdU7zl9RMoM93U88BET5/0dRXfrpP9ZkCSFNJp/xUryor0kTr4MqD6dI8PWXbqUo7gIjWvldkTuXNaQSDLv25xx57uFm/am9Lp1CoAKOh/FKnIKLhmlo9YdasWa65Skv2JL5Gpf4qU51Ld15AQ+DzF01zKz99uTn44IPdaFf12aXz/jRiVs1d6QgVQNTvoWwiSO+SUWej/hC1CJkWXNTjNWs93SFtfACjofzSpyZZZdYKEJoHEmd8/qJpbuWnxysTUXNW7TlNm6KySLc8QgUQ0bezJ5980i0opzRPzVd68foWp0imFF/XRT/kkEPconUatRVm/gcfwGgov2gov2gov2jiXn6hA4jom5qChYbz6kqDSv81L0STszR8TB066nTUSJdgzHS6+ABGQ/lFQ/lFQ/lF06wDSEDpvtrbFDz049RMpVEKWiYiagHwAYyG8ouG8ouG8osm7uWXkQDSkPgARkP5RUP5RUP5RRP38gvXrgQAaPEIIACAUAggAIBQ1MAW70bAda8RIY0dOzbuv99Ye+vtt/09hNEq5n0McRf30iMDAQCEQgABAIRCAAEAhEIAAQCEQgABAIRCAAEAhJKRAKKrDOpKXVtvvbV/BgDQ3GUkgOhyoAMHDgx9YXYAQPahCQsAEEpGAkjcV7QEAGQeGQgAIBQCCAAgFAIIACCUjAaQuF89CwCQOWQgAIBQCCAAgFAyEkAYxgsALQ8ZCAAgFAIIACCUjAYQRmEBQMtBBgIACIUAAgAIhQACAAglIwGEYbwA0PKQgQAAQiGAAABCyWgAYRgvALQcZCAAgFAIIACAUAggAIBQMhJAGMYLAC0PGQgAIBQCCAAglIwGEIbxAkDLQQYCAAiFAAIACIUAAgAIJSMBhGG8ANDykIEAAELJUfYQdZs2bZr7YUcddVTS+6NsANBSaWRrnLeMZCD6QQCAloUmLABAKAQQAEAoGQ0g9FkAQMtBBgIACIUAAgAIhQACAAglIwGEYbwA0PKQgQAAQiGAAABCyWgAYRgvALQcZCAAgFAIIACAUAggAIBQMhJAGMYLAC0PGQgAIBQCCAAglIwGEIbxAkDLQQYCAAiFAAIACIUAAgAIJSMBhGG8ANDykIEAAEIhgAAAQsloAGEYLwC0HGQgAIBQCCAAgFAyEkAYhQUALQ8ZCAAgFAIIACAUAggAIJSMBhCG8QJAy0EGAgAIhQACAAglIwGEYbwA0PKQgQAAQiGAAABCIYAAAELJaABhGC8AtBzq/Y5c6w8bNswOOugg+/DDD+3+++/3z2aGF5R29ncRwoknnvicv4sQbvjrDf4ewqhpxZfKSGJefDRhAQBCyUgACZquGM4LAC0HGQgAIBQCCAAgFAIIACAUAggAIBQCCAAgFAIIACCUjAQQhvECQMtDBgIACIUAAgAIhQACAAiFAAIACIUAAgAIhQACAAglIwGEYbwA0PKQgQAAQiGAAABCIYAAAEIhgAAAQiGAAABCIYAAAELJSABhGC8AtDxkIACAUAggAIBQCCAAgFAIIACAUAggAIBQMhJAGIUFAC0PGQgAIBQCCAAgFAIIACAUAggAIBQCCAAgFAIIACCUjAQQhvECQMtDBgIACIUAAgAIhQACAAglR/0XUbfHH3/c/bA999wz6f1RNgBoqdSvHOeNDAQAEAoBBAAQCgEEABAKAQQAEAoBBAAQCgEEABBKRgKIhnMJw24BoOUgAwEAhEIAAQCEQgABAIRCAAEAhEIAAQCEkpEAwigsAGh5yEAAAKEQQAAAoRBAAAChEEAAAKEQQAAAoRBAAAChZCSAMIwXAFoeMhAAQCgEEABAKAQQAEAoBBAAQCgEEABAKAQQAEAoGQkgDOMFgJaHDAQAEEpGAkhubq67ra6udrcAgOYv5QCyYsUKu+OOO+zGG2+0e+65x5YvX+7fU7833njDpk2bZjfffLN9/PHH/lkAQLZLOYAoy5g9e7bNnTvXPv30U7vwwgvt888/t7Vr1/qP2Jgykmeffda++eYb++677+yqq67y7wEAZLuUA0hxcbH179/fPzJbvXq13X///S4zCQSd6YEvvvjCysvL3b6CycMPP+z2AQDZL60+kFGjRvl7Zp06dbLnnnuu3qasmTNn+ntmX375pS1btsw/AgBku7QCyODBg9d3mIv2P/vsM6uqqvLP/EjnlIEEPvroIxs3bpx/BADIdmkFkLy8PBsyZIh/tC6gPPPMM7Zq1Sr/zI/UPxI0X1VUVLhgMmnSJHcMAMh+aQUQGTNmjL9n1qFDB3vttdfWB5DEPpAPP/zQ3zPX6V5QUGATJ070zwAAsl3aAaRfv35WWFjoH5nbnzVrluskV5CQyspK17QVUDDZfvvtrUePHv4ZAEC2SzuA5OTk2JZbbukfmWvSevHFF12fh5q4RMFDQUQ0SkvDePfee28rLS115wAA2S/tACJjx47198zatm1rM2bMcPNB2rRp484lNl+p87ysrMy22247NxQYANA8qNMirRUQ27dvb6eccooLHEHfx5tvvmm9evWynXbayXbffXe77rrr1o/MuuGGG2z+/Pmhlzmpqam5wN9FCF75/4+/ixBOPPEEfw9h1NRsODcM6Yr3ArVpZyBqkpo+fboNHz7cP2M2dOhQN0u9T58+br5HEDy+//57N3OdNbIAoPlJO4AoOGhZksQlTNR0tWTJEmvXrp0bcRXQRMLas9MBAM1DqD4QzSh/6qmn3Gz0QPfu3e2DDz6wr7/+2h3r2iDqGwEANE+hAoiasTTyatCgQf4Zs80339ytvBs0X6lJa+nSpVxkCgCaqVABRM1XCxYssIULF65vomrdurXl5+e7fVE2krjsCQCgeQkVQCRoxurZs6d/Zt2KvaIsREN5yT4AoPkKHUA0hFfNWImz0gOaSKjl3uu7VggAILuFDiDKLtTPcdFFF7nFEoNgof4R9YVoxnoydZ0HAGSXtCcS1qZ+jhEjRriAoiG8a9as8e9JTo9PZ16I93OZSBgBEwmjYSJhNEwkjKqZTSSsTcFAo600A32fffbxz9aNSYUA0DykFEDUz6HOci1X0rVr1/WLJgYUFEpKStxEwoCaqrTcu56jVXg1SgsA0HykFEB0Yag5c+a4Geha1yqY61Ef9YksXrzYPUfLmSS76BQAIHvRow0ACCUjAYT5HgDQ8pCBAABCIYAAAEIhgAAAQsloAOHaHwDQcpCBAABCIYAAAELJSABhGC8AtDxkIACAUAggAIBQCCAAgFAyGkAYxgsALQcZCAAgFAIIACCUjAQQhvECQMtDBgIACIUAAgAIhQACAAglowGEYbwA0HKQgQAAQiGAAABCyUgAYRgvALQ8ZCAAgFAIIACAUDLahMUoLABoOchAAACh5Ch7iLq988477oeNHj066f1RNgBoqdSqE+eNDAQAEEpGAogikZAxAEDLQQYCAAiFAAIACIUAAgAIhQACAAiFAAIACIUAAgAIJSMBhGG8ANDykIEAAEIhgAAAQiGAAABCIYAAAEIhgAAAQiGAAABCyUgAYRgvALQ8ZCAAgFAIIACAUAggAIBQCCAAgFAIIACAUDISQBiFBQAtDxkIACAUAggAIBQCCAAglIz2gQAAWg4yEABAKAQQAEAoGQ0gDOMFgJaDDAQAEAoBBAAQCgEEABBKRgIIw3gBoOUhAwEAhEIAAQCEktEAwjBeAGg5yEAAAKEQQAAAoWQkgDAKCwBaHtX8kTsuOnbsaKeeeqotWrTIrr76av9sZtTU1Lzg7yKEt99+e0d/FyGMHTvW31un9pel2v1+TX1/bbUfX1tDPx/NG01YAIBQCCAAWhxlTm5bu3b9PtKXkQBC4QOIM9VRVZWVtmDed3bjn86xvYYUeFu+7TXUv/W2sw/byT5691WrqCi3tV5gwaaRgQD1UB9A4hZ8Ww22pr4fdVMQWLJogb3y9EN20j4jbd8tiu3IHfvZP6Zd5t27cdl9+NbLdtYh29v+I0rsoK272D9vv8YWzZ9r1dVV/iNQGwEEQLOhoPH15x/avX+92AWBn2/bwy465QD75ouP/EekZuWypXb9/51hU3boYz8b29Funvobm/Xxe14wqfYfAcloE5a+IQFAY1I/xgde9nDnNRfZz8aU2S+8bOPWy85zQSATylevtAduvsROmbyV+/l/u/r39sGbL/n3tmxkIACyRtB0t3Zttc1880Wbdul5tt+IEvvVYTt5Ffv/2hqvsm9I5WtWeYHq9/arKTvbvt7/e+c1F9pnM99ymU9LbFJUyhD5XZeVldnpp59uixcvtquuuso/mxneL4V5IBEwDySauM8D2ZTaz69tUz+voZ+fKv2c6qoqm/3FRzb9wdvtyQem2eqVy/x7m15Zp2626+TDbe9DT7DO3XtbTk5u2r+rbEQGAiCWgqAx5+vP7doLTrVjdx9ip0weaw/ddmWsgocsWTjPHrjpEjt610F2+s+2sTuvvcgWfz/P1lZXZyyIxhEBBECsqKP6hyUL7b4bptrpB4y34/YYao/efb0tmDvbf0S8qbP9zqsvsCN26mfnHrW7Pf+ve2zl8h+aZSAhgACIhVUrltkLj91nZx26g03ZvrfrCJ/18bv+vQ0nJ6eV5eXluvb8TFL2NPONF2zq2Ye7zOSCX0y2T99/w8rXrPYfkf1UZpHDIn0g8UUfSDRbbbWVv7dO7W+R6fZZNPT9tdV+fG1N/XzNsVgw5xu769qL7M0XHnOZR0MoLCiwfn172E4TxllJSZE7p5deXFxsnTuVWV5urpVXVNisr761Bx6abvMXLHKPyTSVl/pIdvuvo23Pg46xjl16bLIM40yvvP7fcArat29vZ5xxhi1ZssSuvPJK/2xmeB9AAkgEBJBoCCAN8/zKinI39Pa6C0+3ObM/d30FDaV3z67227OPd4FiU69X1IQ248PP7fJr77CVKxsuW8gvKLS+g4bbKf97rW02bLTl5uX592QPmrAANCr1ZRyz22D77dF72LdfftKgwSM/P8/O+eUx1qVzh5SCh+R62cioEYPt7FOP9M80DAXRLz58x844cFs7Yuf+9vF7r/n3ZA8CCIBGNfPZh2zN93P8o4bVyvtXVVW1yUyqNgWbFStX+UcNrcbWLJpnj175G/84exBAgHqo4kncVLEkbnG7v/ZW+/G1t2TPSdySPSdxS/acxC2ZZQvnWY82hda3pMCKc1PLCsKqqKy0s357qd121yP23sxPbekPyze5UKJe98LFS+3O+x71zzQcvf9+JfnWyysPVcZ1lVlc6bcX+RXTBxJf9IFEwwWloj0/mQcuOcteuv+v/pHZmqpqW7imylZVp/+zwiguKrRRWw62zp06WNvSEisoyHfnSloXu85zBZr3P/jMf3TDKMlrZZ0K86wwL9c/Y9ZryGg769YXLCcne77Xk4EAaFRVlRX+3jpFXiWqb+B9vW/ipV7F2tBWrym3V9+YYQ8/9rz97d5H7ZY7HrJrb7zXpl55q9129yMNGjza5udYvzYF1rOkcIPgITVa9TdEQG5KBBAAjaq6stLf25Aq1O5exdrfq2A7FGxYuWYzhcROhbk2oLTAurUusILc5NWuRn+FyeiaUkYDyKbSXSDb6DOduOkPPHFr6vuzUe0MpLZ8r4LtWJRnA0sLrYt3m60UArsVe++jbaGVFeZZ3iaaprJx2RMyEACNqrqq/gAiCpa5Oa2svVfxbuZVwD1b51t+lnw/LfZed+/WeTbAe91tC/Isxw/+m1KzVsOZCSAAUKdWrdKrdlQBl+TnWj8vI1H/QZu8HNcsFCd6R2X5Oda/tMB6e6+zOD8vpaCxgSxswMlIAMnWVBpA48vNz/f30qMKWf0H3b1sRBV1p4Jca4Q+93oVeDVo9+I87/UUWufWBZYfYQRVuoE1DrLvFQONKLG/QZsqscStqe/f1Fb7+bW3ZM9J3JI9J3FL9pzELZncvHABJKCfq/6EsqI8l5X09gJK61zv//Pvb2iqNNt6WZA6+/u2KbTSgjzX3BZVK+9n1FVmcUUAAdCoogaQgCpbNW8V5+daz5ICf/RWToP1lRR5FXxXL2gp++mqPhkvG8pkhb8uAyGAAECdkgWQbj262ennnW7Hn36cjdl6tBUUFPj3pMZlJW70Vr6XFRRYL6+Cb5MXPStRE1l7Lyip76W3t7UtyPWyjcwGjoALINkVPzIbQLIt/QLQ+JL1gRxw+M+8INLVBmw+wNs/wM6fep5tv+v2/r2pc1mJV8G39rKS7q0L3NyLLkW5VpTmkima8KcgpMDR2QtK6nvRz27IOq6VAhMZCNB8BJVGsG2qD6Cx789GyTKQ7j27+3vryjzfCzKTfrqn/fzYQ/2z6dPPUbbQvjDfevtNXJrQp47vZNp5QaNbUZ5t5k/4UxBSMNLPiapzt8625+Q9XYCsSyb+n8ZGAAHQqJIFkEULN76AkyrULUZvYWPHb7geWRguKHlZRAcvm+hXWmQDvSDRozjfunmbOuEVNLp6QaNtYV7G16KafMhkO+O8M2zH3XawY089xr2nZFrl5GZdEMlISWXrNyEAjS9ZAPlk5if+3oZUoU7ca1f/KHOUmbQpyHV9GuqEb4gFDPPy8uyYU462n0wY5/38dYFB/89BRx7o7qvNXVCqJQYQAEhVsgDyzOPPurWgkmlX1s7alLbxj7JDUXGRnfk/v7RBQwdtlFWoea5n357+UaJ1zZTZhAAC1KN2n4P+wBO3uN1fe6v9+Npbsuckbsmek7gle07ilkxOkgBSvqbc3nzlraTP0f/Ttn1b/yg7HHb8YVbWocw/2pDe4/IflvtH2Y0AAqBRFRS19vc29M97/2mzZ83eKIjoeFWjXR0wOmVLAwfV3Vm+cvlKW7xwsX+U3TLaB6JvCgBQn6KSUn9vY3+9/Aab/uh0W7li5fp6ZfaX39jSxUvdfjYYssVgN6s8GV0N8ZEH/uUfZT8yEACNqqik/uaoZx9/zi769f/Zf5/+O/vdL//H/nrZj1cvjD0vboz6ySj/YGPPPfG8zXh7hn+U/QggQD0S2/u16Vtx4tbU92ej0larrX1BlbdX/7XJ1aleWZH84lNxlZuTu8GcloB+V7O/nO2yq42ttTKvPIa3L/ePswcBBECjqlw616ssK214uworzMm+a2DUp3pttc35dq5/tC5wqNnqqUeetusvrZ1J1VhpXrWN9ALHMK88cltlXzkQQAA0qvJl6yYNti+ssTEdK2xASYXlumykGQQS7y1oMMCyH5a5wLFw/kKbdu2t9vyTz/sPkBor8gLn0LblNqKswtqkt+xXrBBAADSqtQmXtFVfc/eStbZVp3Lr07rSWjWDQLJowSK75HeX2MX/PdUuu+hy++KTL/x7aiy/1VobVFphoztUWIciNVH6d/myrVkyJ2hLjbLNmTPH/bAePXokvT/KBjSl4DOY+FlUX0Rw29T3B7Sf7FjPS3xu7eNAQz0/mbXVG1/SNs/7Ktu7TbVt1bHcuhVVeYFk4/8jm1RVVduypcu8AtNRjZdh1diANhU21nt/XYrXWrKJ7zVexuI/Yb2gHOO6ZSQD0Q8CmiN9tlVhxvU2G62tqrtjvCDXbGDbKu8b+hprl6eO9uwOJDne6+/tZVZjO66xbl7gyK2nxl1bWe4HkexBExZQj1Qq8aa8DTYdJ56Ly3EyNQlNWHUpzjMbXlZpo8vWWElu9nW0eyVgXQvXBY7eJdWW7wVGr1jqVbPWe591lFlcEUCAegSVYVxvs9Ha6tSG5npv0Vrnm43sUGFjvIxEHc95+XnWqUsn69Cpg/+oONHvo8ba51fZOC9wKJNSRqX3kYqamuzKPiSjASRbP9BAXeqrvONyG+zH8TiZ+pqwktGPUUaiEVtn/uo4O/N3v7Sz//csO/a0Y9O+cmHDqbE2edW2dac1bkhuKhlHbWq+8krPP8oOZCBAPYJKMa632Wht1aabsJJpXdbBynr2ce9d22aDB9qvLzrHiloX+Y9oCmvdXI6xXoY0skOlGwzgvbRwamjCApqVVCrxprwNNh0nnovLcTKpNmHVVrlqpZtbkah1SWs74oTD/aPGFEwCrLAtO1RY0caX90hbtnWgCwEEqEdQGcb1Nhul24QVqKootzkz3vKPftS5Y6kNbRd0tje0GmubX2Vbtl/jAkebgsz9DlwAybLfKQEEqEcqlXhT3wb7cTxOpiZkBiIzHrnXls3/cakQZSTvPXSXdSiscZ3tw7xA0rqBAomGFY9oX25btK+00gbpesm+LwQpBZA1a9bYypUr/aPwFi1aVOdVx4A4CirFuN5mo5y88LWvvqX/e9rVNv/zj6xizWp7+/5bbem3X7n7vCKxMi+QjNogkEQtIzVVrcs4NKy4rZdx6P9pCLomeoP98AaSUgB59tln7YorrrBXXnllozbIVKxatcoeeughu+aaa+yTT5Jf+xiIo1Qq8aa8DTYdJ56Ly3EyOfnROr2rytfYm3fdaE9d/Fub/8lM/+yPvP9+fSBRxtBm/YTEVIPJuse2dYFD61Up49B7W3dvQ8nJzXdll01SCiADBw60qqoqmz59ugskL7/8sq1YscK/d923NKn9gVHG8cQTT7jnvP/+++5x/fv39+8F4i+oDON6m41yCxpn1JRXRC5j2NILACPLyq19frW/REpd5eaVq7dpHsco7/FbNFLgCLTKVU98dgWQVt6HcJOfQmUdl1xyiWvKkuDD26lTJ+vbt68VFRW57KSwsNDGjx9vixcvtq+++sqWL19uOTk57vm63WyzzezQQw91PyMNL/i3COHtt9/e0d9FCGPHjt2o0o7brWhf4nqc6M2rTrCvnrrZP2o8eilrqs3mrc6179fkWWWNXqM2LXJYY52LqqxbcbUVNVFLUrv+I223K970MhHvBfiCcoyrlDIQVf5bbrml5fpvLPhQLFy40N5991179dVX3bECzIsvvmgzZ850wUOCJi/1fYwcOdLtA9lCf8D6vMf1NhtFbcIKyysyNyGxf2m1jelYbsPalVvXokp3q+N+bard/XpcU8j1yqVVslUWYyzlVztq1KikHeAKEEGQ0Ida+8k+2MpOBg8e7B8B2aG+yjsOt8Gm48RzcTlOprBtR3+v6WjCn/pJNmtb5W4jTQDMFO//V9llk5QDSPfu3a1jx/R/8foQKXNJzGCAbBFUhnG9zUYdNh/n7yFR6859/L3skVa+NHr0aPfBTYceT/MVslUqlXhT3wb7cTxOptuY3a3X9gf6R9mhbbee1nv01tZ3q+0stwHW32o/YLSNO+1G/yh7pBVAlEXow5EOPb5du3bWs2dP/wyQPYJKMa632SgnN8/Gn3O3bXH4RV4Bp1UFNbqi0nY27ufH24Tjz7SR+x1iI/Y+wHb6f7/1782Mntv9zHb988uW37rUP5M90vrtlZaWumG4+vCmSh3wYTIXIA5SqcSb8jbYdJx4Li7HddFjhh38G9vpD89YbnFmK8784hJrlYHmcmUdO53yG+s6aJirxwKFrUsyFviGT7nAtv313Y02tDnT0i4FBYOg0zwV+hApcwGyUVAZxvU223UZsYPtfdNn1mXURP9MNNsc/gvb45yLbNJvp9r4o06xjgM29+9Jj5qpfnLYCZZXUOif+VH5qpVexZb+hOpEuUUltvPFL9jwQ85fNwM9S6UdQIYOHZrWGvy9evWysrIy/wjILqlU4k19G+zH8TgVRe262I6/f9zGnPJX/0w4HfoMsE5+wFDG0LHvQNtmykleFvFbKyhJL8vpPXq8FdbxnMry1f5eOF1GTrR9b/3GOg+f4J/JXmkHkLy8PBs+fLj7BemDsinKWIBsFVSKcb1tLjT/YbM9j7P97phrecVt/bPp6Tly49FdKqc2HTvb1lNOTPmbvh43eOc93XOTKS5t5++lb9wZt9iOFz5uBW3a+2eyW6iGPM0JUTNWXQUcUJAZNmyYfwRkn1Qq8aa8DTYdJ56Ly3G6isq62uS7F9jQg8/zjtLrN61vdFTbrj1s2G77+Uf1K+3aPWnT1Y/S788t7TXE9r1jjvWfeKQLls1FqHfSp08fN7KqPvoQDRkyxC1zAmSroDKM621zlJOXb1tMucAm3fipFXVIffTm3Jnv+nsbU3l17L9ZSpV3aefu7vHJVJavsVduvtw/2rRWufmuo3yPa963ovZd/bPNR6gAosLVvI66Cln04WbuB7JdfZV3XG6D/Tgeh6Xntuk2wPa+ZZYNmHSif7Z+S7772tbWc7mIVJdLX7FovnsPibSM/PdffW5PX/LftmLhAv9s/Up7D7VJf/3EhnnZVE5eXqTyiKvQuZSCQ+1CTqTMQ4snAtksqBTjetuc6T3metnI2JOvtYlXvGGtu9W/knflqhX29n3T6iyXvMJCy0mhH+SHOd/YdzPesuqqSvezlsz51p658vf2+u1/8QKUloavn7KOQfuf7mUd73lBsJ97H81VSqvx1uXGG2+0uXN/vDpYQEuWjBs3zvbYYw//TCSsxhsBq/FGE/fVeAM6luBcXI4zqWZttb138zn2+b+uMa92989urPuwUTZ8z8luEmCilYsX2gvXXWxrqzYdBETLq+cXFlmFF5hS1W7AKNv67DusnZd9BGURRSZ+RkOK1JszZswYf29DWrqEuR9oDvQHrMowrrctiZqgRh33Z5t46WvWtt8W/tmN/eej92z6Fb+3L15+1qor110+V01bs/79XMrBQ2q8IJVq8NAKwyOO/pPtfuVb1r7PMPf7aQkiZSDl5eU2derUjSYWdujQwU499VT/KDIykAjIQKLheiCZOc40NSV99tAVNuO287yDuoNCbkGhte3ey8qX/2CrvAykIXQctp1tfeZt1mYTTWxhBOUYV5EyEC3RromFiW9S+3VlJkC20edZlWBcb1sqrac1+L/Oskk3fGxlm431z26suqLclsye1SDBQ9d23+acu2yXi59vkOCRDSIFEKm9wKL2R4wY4R8B2S1ZpR2n22DTceK5uBw3JP0/pd0G2K6X/tu2Ofce13ndWHptf5Dt+7e51meHg73XEbkazVqR37lGWiXO9RgwYIC1bRtuJikQN0FlGNdbrMtG+kw40Pa/a4H12ekw70zDNfvkFZfaxCvfsvFe5lHYhiWaIgcQzTbXzHR9oLUx9wPNSSqVeFPfBvtxPG5MBSVtbZuzb7c9/jLT8ks7+GczQ81VY065zibf/b11GMjq4oGM5F7BnBAFE80+B5qLoFKM6y021q7PUNv/znk2+IBfu4o/Eq+c2w8ca/vfvdAG7nG8myWPH2UkgHTr1s26du3q+j7SWakXiLtUKvGmvA02HSeei8txU9GEwZFH/cH28wJJx2ETXCBIly4xu8slL9tuV7y+7hojIX5GcxdpGG8iDenVSr0NcN1zhvFGwDDeaLbaaqv1FWNcb0X7ErfjuJj33jP29jUn2cp5X/pn6pbXuq1bv2rzfU/x3k/TdpAH5RlXGSsdDeltgOABNClVhPojjvNtsB/H47joNmpXm3T9R15g+L3lFrXxz9bivd5+E4+2/f82zwbvd5p32LTBIxtQQkA9gkoxrrdInfovhh9ynrvmyKD9z/DPrrPZ3ifb5HsW2U/OuMlNPkRqMtaE1YBowoqAJqxoWAsr2nGcVa5ebnNe/af1mnCA5cX0muRBecYVGQhQD/0BqzKM6y3Cyy8utX67TIlt8MgGCm+x/hTG/Y9Ef8hxRvlFQ/lFQ/lFE/fyIwMBAIRCAAGAFkDZzIoVK9xWn4qKClu6dKlVpbD0PU1YEZECR0P5RUP5RdOcyu/xxx+3N954wzp37mwnn3yyf3adjz76yJ588klbtmyZO9YlN/bZZx/r3//HVYRXrVpl//rXv+yTTz5x/6+mZWiZqkmTJtU5RYMMBACy3H/+8x978803rayszGUQiWbPnm0PPPCA9e3b10488UQ7/PDD3aTvu+++23744Qf/UWb33Xefe+yBBx5oJ510kk2YMEGjOG369On+IzYWOYAoMnXs2NH69OnjNr0BAEDjULbw6KOP2rBhw6xXr17+2R+9+OKL1q5dO5s8ebJbdkorpv/0pz+1yspKe+edd9xjvv76axc8dt99d3eNJy1NtdNOO9mgQYPsrbfeqrM5K3QAUepXUlJiW2yxhZ1zzjl2zz332J133mmnnHKKS4/inhoCQHPw/vvv24IFC1zlX5uuFqvgMHDgQLfYbUCBRJfd+O6779zxl1+uW+JFASPR5ptv7oKHfn4yoQKI0p8ePXq4iHbDDTe4tEjR7IMPPnAZyHHHHeciHgCg4WgNQjUx7bDDDkmvw6QOcwURtRLVprp65cqVbl99I8XFxda6dWt3HAhalOrqeE8rgCiC6UXqkrXnn3++XXHFFa7DRm1pzz33nM2fP9+9EL2p6upq/1kAgIagelfrEI4fP94/s6EgQOgxtemcOs5Fj6vrMbJ69Wp3W1vKAUTBQ2nPlClTbNq0aXbwwQfbu+++65qtFDgS6UUpiAAAGsb333/vOs733HPPTS5kqywkmcTn1felP/IoLGUeRx55pF144YUumNx2223273//2/2n6sRZs2aN/8h1nTrpDD8DAKRHw3LV2d2mTRs3CkubMgXVydpXnRw0SSXWzwGdUz+2qPmqrsdI8LjaUg4gulCUrn/+4Ycf2r333rt++NeiRYtcE5bOAwAax7x581ygUD90sH3xxReuv0L7r732mgsgGtC0cOFC/1nr6Au+zrVv394dKwipHzuYJxJQ/S519WmnHEAUiTRJZcaMGe5YTVRPP/20/eUvf7Hly5fbtttu684DABqe5mqcdtppG2yDBw+20tJSt695HPn5+dazZ08XWBKH4s6aNct1NWiUlWiOiHz66afuVhRkVN936tTJjaxNJuUAosikobqa0fjtt9+6wPHKK6+4Tpbjjz/eZScAgMahrEGjpBI3tRSpi0H7Gi0r22+/veskD1qKXn/9dXvwwQddn7amYYgCiY41ouvVV191j9PEwrlz59rEiRPdY5LRZI2UOyuUCgWpTtBJruFhF110kXXv3t11qovGFquPRI+LKu59Kc1pKYSmQPlFQ/lF09zKTwFAlf4RRxzhn1lHUyxeeukl1yRVVFTkAoYCQ+KwXTV9PfXUUy5bUd3dpUsXF3yGDBniP2JjaQWQZPSfqGNd0YsAEj+UXzSUXzSUXzRxL7+Um7AAAEhEAAGAZk7NUpdffrnrelBWc8stt2Rk5CwBBACaOQ1yUj/1888/7xZQVEe7Fl+MigACAC3AXnvtZe+9955b/mS//fbLSP8PAQQAWgAN8dWmmerBEN+oCCAA0AJoiO6IESNs5MiR7uqFmUAAAYBmTtcE0exzLfu+8847u6kWunRtVAQQAGjmtBjuUUcd5ZqwtHrI0Ucf7S7FERUBBACaAfVtLFmyZP01PhJpLSvNOtcyVNq0Xlayi0yJlon/6quvbPHixf6ZuqkbPtJUR2aiM5M1CsovGsovmuZUflolXc1SWgdLiykm0qU3NPoqWFBRmcg+++zj+kQCChj333+/W+U3oEvhHnjggUkvNiVkIACQ5TRRUCvp6gt97aCjBXC1cvo222xj5557rp166qnukuQPPfTQ+mXedcEpLZZbUVHhLlH+m9/8xl2yXNdKf+KJJ9xjkkk7gGgCSrDpKlW6rSuKb+p+AEA0arpSJT9u3DgXQGpT9qH+jl122cVlEmrO2nfffV3QCFqNPv/8c9d0tfvuu7vWJGUoGq2lyYZa0l2BJZmUA4gCgdaFHzVq1AablgNO1pamK1gNHz7cvQilQXo+ACCzdOEoXYlQo6tqU5PVnDlzXB2c+EVeQUQXk9IFqWT27Nnu/n79+rnjwIABA1ygUXBJJuVaXb34xx57rEuFHnvssfXbXXfdZTvuuKOLggFNUhk6dKjdfvvt9sgjj7irY2kqPUEEADJH12l64YUX3NLsWqa9Ni3RLsGVBxPpnK4TInqcOtlr93UEVyIMHldbWhmIsor333/frr/+erddd9117sJS11xzzforFYpSoD322MO1sd1000324osv2pQpU1zPPwAgM/SFXs1Wag1KJqj4k3WC62qFylxEj1OzVW3B84LH1ZZyAFGEUsbx8ccf+2fSozQouAgVACCab775xq2oO2nSpA2apxIFrT6Jl7MNqLNdQUT0uLoeI8Hjaks5gKgTRR0uDzzwgC1YsMBmzpzpjlPdNIRM11UHAESnpUm6du1qP/zwgxtppU37qqu1v3Tp0vVXHExW9yqrUKuSFBcXJ31MMKdEV6JNRmErrYHaSnPU1pZuNqEMJMy8EMaRR0P5RUP5RUP5RVNf+V122WW2fPly/2hju+66qxu6+8c//tH1SR9wwAH+Pevq46lTp7rL1Wq4ri6F+8orr7j5I5pHEtBlcJ999lk788wzk3ZBpB1AGhsfwGgov2gov2gov2jSLb+///3vbiL36aef7p8xN6lbkwN1LuhoV5/1gw8+aIcccogNHjzYzTzXoCcFnQkTJrjHaGCU+riVnRx33HHuXG0MiwKAZkzzP9SsNW3aNJdlaCXehx9+2A3t3Xzzzd1jNHy3f//+rqtB97/88st28803uyYxDYiqCxlIRHwDjIbyi4byi6a5ld+rr77q5mzoglGJ1OGuCYWLFi1yWYgCx7bbbusmewfUxaAmK63aq32N7tpuu+3clQzrQgCJiD/gaCi/aCi/aCi/aGjCAgCEQgABAIRg9v8B4hMOpI+XltsAAAAASUVORK5CYII=";
        }
    }
    TextureDefault.texture = new TextureDefault("TextureDefault", TextureDefault.get(), FudgeCore.MIPMAP.MEDIUM);
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
    Loop.ƒTimeStartGame = 0;
    Loop.ƒTimeStartReal = 0;
    Loop.ƒTimeFrameGame = 0;
    Loop.ƒTimeFrameReal = 0;
    Loop.ƒTimeFrameStartGame = 0;
    Loop.ƒTimeFrameStartReal = 0;
    Loop.ƒTimeLastFrameGameAvg = 0;
    Loop.ƒTimeLastFrameRealAvg = 0;
    Loop.ƒFrames = 0;
    Loop.running = false;
    Loop.mode = LOOP_MODE.FRAME_REQUEST;
    Loop.idIntervall = 0;
    Loop.idRequest = 0;
    Loop.fpsDesired = 30;
    Loop.framesToAverage = 30;
    Loop.syncWithAnimationFrame = false;
    FudgeCore.Loop = Loop;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Time extends FudgeCore.EventTargetUnified {
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
    Time.game = new Time();
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
