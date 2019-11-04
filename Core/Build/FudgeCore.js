"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FudgeCore;
(function (FudgeCore) {
    /**
     * Handles the external serialization and deserialization of [[Serializable]] objects. The internal process is handled by the objects themselves.
     * A [[Serialization]] object can be created from a [[Serializable]] object and a JSON-String may be created from that.
     * Vice versa, a JSON-String can be parsed to a [[Serialization]] which can be deserialized to a [[Serializable]] object.
     * ```plaintext
     *  [Serializable] → (serialize) → [Serialization] → (stringify)
     *                                                        ↓
     *                                                    [String]
     *                                                        ↓
     *  [Serializable] ← (deserialize) ← [Serialization] ← (parse)
     * ```
     * While the internal serialize/deserialize methods of the objects care of the selection of information needed to recreate the object and its structure,
     * the [[Serializer]] keeps track of the namespaces and classes in order to recreate [[Serializable]] objects. The general structure of a [[Serialization]] is as follows
     * ```plaintext
     * {
     *      namespaceName.className: {
     *          propertyName: propertyValue,
     *          ...,
     *          propertyNameOfReference: SerializationOfTheReferencedObject,
     *          ...,
     *          constructorNameOfSuperclass: SerializationOfSuperClass
     *      }
     * }
     * ```
     * Since the instance of the superclass is created automatically when an object is created,
     * the SerializationOfSuperClass omits the the namespaceName.className key and consists only of its value.
     * The constructorNameOfSuperclass is given instead as a property name in the serialization of the subclass.
     */
    class Serializer {
        /**
         * Registers a namespace to the [[Serializer]], to enable automatic instantiation of classes defined within
         * @param _namespace
         */
        static registerNamespace(_namespace) {
            for (let name in Serializer.namespaces)
                if (Serializer.namespaces[name] == _namespace)
                    return;
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
        }
        /**
         * Returns a javascript object representing the serializable FUDGE-object given,
         * including attached components, children, superclass-objects all information needed for reconstruction
         * @param _object An object to serialize, implementing the [[Serializable]] interface
         */
        static serialize(_object) {
            let serialization = {};
            // TODO: save the namespace with the constructors name
            // serialization[_object.constructor.name] = _object.serialize();
            let path = this.getFullPath(_object);
            if (!path)
                throw new Error(`Namespace of serializable object of type ${_object.constructor.name} not found. Maybe the namespace hasn't been registered or the class not exported?`);
            serialization[path] = _object.serialize();
            return serialization;
            // return _object.serialize();
        }
        /**
         * Returns a FUDGE-object reconstructed from the information in the [[Serialization]] given,
         * including attached components, children, superclass-objects
         * @param _serialization
         */
        static deserialize(_serialization) {
            let reconstruct;
            try {
                // loop constructed solely to access type-property. Only one expected!
                for (let path in _serialization) {
                    // reconstruct = new (<General>Fudge)[typeName];
                    reconstruct = Serializer.reconstruct(path);
                    reconstruct.deserialize(_serialization[path]);
                    return reconstruct;
                }
            }
            catch (message) {
                throw new Error("Deserialization failed: " + message);
            }
            return null;
        }
        //TODO: implement prettifier to make JSON-Stringification of serializations more readable, e.g. placing x, y and z in one line
        static prettify(_json) { return _json; }
        /**
         * Returns a formatted, human readable JSON-String, representing the given [[Serializaion]] that may have been created by [[Serializer]].serialize
         * @param _serialization
         */
        static stringify(_serialization) {
            // adjustments to serialization can be made here before stringification, if desired
            let json = JSON.stringify(_serialization, null, 2);
            let pretty = Serializer.prettify(json);
            return pretty;
        }
        /**
         * Returns a [[Serialization]] created from the given JSON-String. Result may be passed to [[Serializer]].deserialize
         * @param _json
         */
        static parse(_json) {
            return JSON.parse(_json);
        }
        /**
         * Creates an object of the class defined with the full path including the namespaceName(s) and the className seperated by dots(.)
         * @param _path
         */
        static reconstruct(_path) {
            let typeName = _path.substr(_path.lastIndexOf(".") + 1);
            let namespace = Serializer.getNamespace(_path);
            if (!namespace)
                throw new Error(`Namespace of serializable object of type ${typeName} not found. Maybe the namespace hasn't been registered?`);
            let reconstruction = new namespace[typeName];
            return reconstruction;
        }
        /**
         * Returns the full path to the class of the object, if found in the registered namespaces
         * @param _object
         */
        static getFullPath(_object) {
            let typeName = _object.constructor.name;
            // Debug.log("Searching namespace of: " + typeName);
            for (let namespaceName in Serializer.namespaces) {
                let found = Serializer.namespaces[namespaceName][typeName];
                if (found && _object instanceof found)
                    return namespaceName + "." + typeName;
            }
            return null;
        }
        /**
         * Returns the namespace-object defined within the full path, if registered
         * @param _path
         */
        static getNamespace(_path) {
            let namespaceName = _path.substr(0, _path.lastIndexOf("."));
            return Serializer.namespaces[namespaceName];
        }
        /**
         * Finds the namespace-object in properties of the parent-object (e.g. window), if present
         * @param _namespace
         * @param _parent
         */
        static findNamespaceIn(_namespace, _parent) {
            for (let prop in _parent)
                if (_parent[prop] == _namespace)
                    return prop;
            return null;
        }
    }
    /** In order for the Serializer to create class instances, it needs access to the appropriate namespaces */
    Serializer.namespaces = { "ƒ": FudgeCore };
    FudgeCore.Serializer = Serializer;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Base class for all types being mutable using [[Mutator]]-objects, thus providing and using interfaces created at runtime.
     * Mutables provide a [[Mutator]] that is build by collecting all object-properties that are either of a primitive type or again Mutable.
     * Subclasses can either reduce the standard [[Mutator]] built by this base class by deleting properties or implement an individual getMutator-method.
     * The provided properties of the [[Mutator]] must match public properties or getters/setters of the object.
     * Otherwise, they will be ignored if not handled by an override of the mutate-method in the subclass and throw errors in an automatically generated user-interface for the object.
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
         * Does not recurse into objects!
         * @param _mutator
         */
        getMutatorAttributeTypes(_mutator) {
            let types = {};
            for (let attribute in _mutator) {
                let type = null;
                let value = _mutator[attribute];
                if (_mutator[attribute] != undefined)
                    if (typeof (value) == "object")
                        type = this[attribute].constructor.name;
                    else
                        type = _mutator[attribute].constructor.name;
                types[attribute] = type;
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
            // TODO: don't assign unknown properties
            for (let attribute in _mutator) {
                let value = _mutator[attribute];
                let mutant = this[attribute];
                if (mutant instanceof Mutable)
                    mutant.mutate(value);
                else
                    this[attribute] = value;
            }
            this.dispatchEvent(new Event("mutate" /* MUTATE */));
        }
    }
    FudgeCore.Mutable = Mutable;
})(FudgeCore || (FudgeCore = {}));
/// <reference path="../Transfer/Serializer.ts"/>
/// <reference path="../Transfer/Mutable.ts"/>
var FudgeCore;
/// <reference path="../Transfer/Serializer.ts"/>
/// <reference path="../Transfer/Mutable.ts"/>
(function (FudgeCore) {
    /**
     * Internally used to differentiate between the various generated structures and events.
     * @author Lukas Scheuerle, HFU, 2019
     */
    let ANIMATION_STRUCTURE_TYPE;
    (function (ANIMATION_STRUCTURE_TYPE) {
        /**Default: forward, continous */
        ANIMATION_STRUCTURE_TYPE[ANIMATION_STRUCTURE_TYPE["NORMAL"] = 0] = "NORMAL";
        /**backward, continous */
        ANIMATION_STRUCTURE_TYPE[ANIMATION_STRUCTURE_TYPE["REVERSE"] = 1] = "REVERSE";
        /**forward, rastered */
        ANIMATION_STRUCTURE_TYPE[ANIMATION_STRUCTURE_TYPE["RASTERED"] = 2] = "RASTERED";
        /**backward, rastered */
        ANIMATION_STRUCTURE_TYPE[ANIMATION_STRUCTURE_TYPE["RASTEREDREVERSE"] = 3] = "RASTEREDREVERSE";
    })(ANIMATION_STRUCTURE_TYPE || (ANIMATION_STRUCTURE_TYPE = {}));
    /**
     * Animation Class to hold all required Objects that are part of an Animation.
     * Also holds functions to play said Animation.
     * Can be added to a Node and played through [[ComponentAnimator]].
     * @author Lukas Scheuerle, HFU, 2019
     */
    class Animation extends FudgeCore.Mutable {
        constructor(_name, _animStructure = {}, _fps = 60) {
            super();
            this.totalTime = 0;
            this.labels = {};
            this.stepsPerSecond = 10;
            this.events = {};
            this.framesPerSecond = 60;
            // processed eventlist and animation strucutres for playback.
            this.eventsProcessed = new Map();
            this.animationStructuresProcessed = new Map();
            this.name = _name;
            this.animationStructure = _animStructure;
            this.animationStructuresProcessed.set(ANIMATION_STRUCTURE_TYPE.NORMAL, _animStructure);
            this.framesPerSecond = _fps;
            this.calculateTotalTime();
        }
        /**
         * Generates a new "Mutator" with the information to apply to the [[Node]] the [[ComponentAnimator]] is attached to with [[Node.applyAnimation()]].
         * @param _time The time at which the animation currently is at
         * @param _direction The direction in which the animation is supposed to be playing back. >0 == forward, 0 == stop, <0 == backwards
         * @param _playback The playbackmode the animation is supposed to be calculated with.
         * @returns a "Mutator" to apply.
         */
        getMutated(_time, _direction, _playback) {
            let m = {};
            if (_playback == FudgeCore.ANIMATION_PLAYBACK.TIMEBASED_CONTINOUS) {
                if (_direction >= 0) {
                    m = this.traverseStructureForMutator(this.getProcessedAnimationStructure(ANIMATION_STRUCTURE_TYPE.NORMAL), _time);
                }
                else {
                    m = this.traverseStructureForMutator(this.getProcessedAnimationStructure(ANIMATION_STRUCTURE_TYPE.REVERSE), _time);
                }
            }
            else {
                if (_direction >= 0) {
                    m = this.traverseStructureForMutator(this.getProcessedAnimationStructure(ANIMATION_STRUCTURE_TYPE.RASTERED), _time);
                }
                else {
                    m = this.traverseStructureForMutator(this.getProcessedAnimationStructure(ANIMATION_STRUCTURE_TYPE.RASTEREDREVERSE), _time);
                }
            }
            return m;
        }
        /**
         * Returns a list of the names of the events the [[ComponentAnimator]] needs to fire between _min and _max.
         * @param _min The minimum time (inclusive) to check between
         * @param _max The maximum time (exclusive) to check between
         * @param _playback The playback mode to check in. Has an effect on when the Events are fired.
         * @param _direction The direction the animation is supposed to run in. >0 == forward, 0 == stop, <0 == backwards
         * @returns a list of strings with the names of the custom events to fire.
         */
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
        /**
         * Adds an Event to the List of events.
         * @param _name The name of the event (needs to be unique per Animation).
         * @param _time The timestamp of the event (in milliseconds).
         */
        setEvent(_name, _time) {
            this.events[_name] = _time;
            this.eventsProcessed.clear();
        }
        /**
         * Removes the event with the given name from the list of events.
         * @param _name name of the event to remove.
         */
        removeEvent(_name) {
            delete this.events[_name];
            this.eventsProcessed.clear();
        }
        get getLabels() {
            //TODO: this actually needs testing
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
        /**
         * (Re-)Calculate the total time of the Animation. Calculation-heavy, use only if actually needed.
         */
        calculateTotalTime() {
            this.totalTime = 0;
            this.traverseStructureForTime(this.animationStructure);
        }
        //#region transfer
        serialize() {
            let s = {
                idResource: this.idResource,
                name: this.name,
                labels: {},
                events: {},
                fps: this.framesPerSecond,
                sps: this.stepsPerSecond
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
        deserialize(_serialization) {
            this.idResource = _serialization.idResource;
            this.name = _serialization.name;
            this.framesPerSecond = _serialization.fps;
            this.stepsPerSecond = _serialization.sps;
            this.labels = {};
            for (let name in _serialization.labels) {
                this.labels[name] = _serialization.labels[name];
            }
            this.events = {};
            for (let name in _serialization.events) {
                this.events[name] = _serialization.events[name];
            }
            this.eventsProcessed = new Map();
            this.animationStructure = this.traverseStructureForDeserialisation(_serialization.animationStructure);
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
        /**
         * Traverses an AnimationStructure and returns the Serialization of said Structure.
         * @param _structure The Animation Structure at the current level to transform into the Serialization.
         * @returns the filled Serialization.
         */
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
        /**
         * Traverses a Serialization to create a new AnimationStructure.
         * @param _serialization The serialization to transfer into an AnimationStructure
         * @returns the newly created AnimationStructure.
         */
        traverseStructureForDeserialisation(_serialization) {
            let newStructure = {};
            for (let n in _serialization) {
                if (_serialization[n].animationSequence) {
                    let animSeq = new FudgeCore.AnimationSequence();
                    newStructure[n] = animSeq.deserialize(_serialization[n]);
                }
                else {
                    newStructure[n] = this.traverseStructureForDeserialisation(_serialization[n]);
                }
            }
            return newStructure;
        }
        //#endregion
        /**
         * Finds the list of events to be used with these settings.
         * @param _direction The direction the animation is playing in.
         * @param _playback The playbackmode the animation is playing in.
         * @returns The correct AnimationEventTrigger Object to use
         */
        getCorrectEventList(_direction, _playback) {
            if (_playback != FudgeCore.ANIMATION_PLAYBACK.FRAMEBASED) {
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
        /**
         * Traverses an AnimationStructure to turn it into the "Mutator" to return to the Component.
         * @param _structure The strcuture to traverse
         * @param _time the point in time to write the animation numbers into.
         * @returns The "Mutator" filled with the correct values at the given time.
         */
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
        /**
         * Traverses the current AnimationStrcuture to find the totalTime of this animation.
         * @param _structure The structure to traverse
         */
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
        /**
         * Ensures the existance of the requested [[AnimationStrcuture]] and returns it.
         * @param _type the type of the structure to get
         * @returns the requested [[AnimationStructure]]
         */
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
        /**
         * Ensures the existance of the requested [[AnimationEventTrigger]] and returns it.
         * @param _type The type of AnimationEventTrigger to get
         * @returns the requested [[AnimationEventTrigger]]
         */
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
        /**
         * Traverses an existing structure to apply a recalculation function to the AnimationStructure to store in a new Structure.
         * @param _oldStructure The old structure to traverse
         * @param _functionToUse The function to use to recalculated the structure.
         * @returns A new Animation Structure with the recalulated Animation Sequences.
         */
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
        /**
         * Creates a reversed Animation Sequence out of a given Sequence.
         * @param _sequence The sequence to calculate the new sequence out of
         * @returns The reversed Sequence
         */
        calculateReverseSequence(_sequence) {
            let seq = new FudgeCore.AnimationSequence();
            for (let i = 0; i < _sequence.length; i++) {
                let oldKey = _sequence.getKey(i);
                let key = new FudgeCore.AnimationKey(this.totalTime - oldKey.Time, oldKey.Value, oldKey.SlopeOut, oldKey.SlopeIn, oldKey.Constant);
                seq.addKey(key);
            }
            return seq;
        }
        /**
         * Creates a rastered [[AnimationSequence]] out of a given sequence.
         * @param _sequence The sequence to calculate the new sequence out of
         * @returns the rastered sequence.
         */
        calculateRasteredSequence(_sequence) {
            let seq = new FudgeCore.AnimationSequence();
            let frameTime = 1000 / this.framesPerSecond;
            for (let i = 0; i < this.totalTime; i += frameTime) {
                let key = new FudgeCore.AnimationKey(i, _sequence.evaluate(i), 0, 0, true);
                seq.addKey(key);
            }
            return seq;
        }
        /**
         * Creates a new reversed [[AnimationEventTrigger]] object based on the given one.
         * @param _events the event object to calculate the new one out of
         * @returns the reversed event object
         */
        calculateReverseEventTriggers(_events) {
            let ae = {};
            for (let name in _events) {
                ae[name] = this.totalTime - _events[name];
            }
            return ae;
        }
        /**
         * Creates a rastered [[AnimationEventTrigger]] object based on the given one.
         * @param _events the event object to calculate the new one out of
         * @returns the rastered event object
         */
        calculateRasteredEventTriggers(_events) {
            let ae = {};
            let frameTime = 1000 / this.framesPerSecond;
            for (let name in _events) {
                ae[name] = _events[name] - (_events[name] % frameTime);
            }
            return ae;
        }
        /**
         * Checks which events lay between two given times and returns the names of the ones that do.
         * @param _eventTriggers The event object to check the events inside of
         * @param _min the minimum of the range to check between (inclusive)
         * @param _max the maximum of the range to check between (exclusive)
         * @returns an array of the names of the events in the given range.
         */
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
/// <reference path="../Transfer/Serializer.ts"/>
/// <reference path="../Transfer/Mutable.ts"/>
var FudgeCore;
/// <reference path="../Transfer/Serializer.ts"/>
/// <reference path="../Transfer/Mutable.ts"/>
(function (FudgeCore) {
    /**
     * Calculates the values between [[AnimationKey]]s.
     * Represented internally by a cubic function (`f(x) = ax³ + bx² + cx + d`).
     * Only needs to be recalculated when the keys change, so at runtime it should only be calculated once.
     * @author Lukas Scheuerle, HFU, 2019
     */
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
        /**
         * Calculates the value of the function at the given time.
         * @param _time the point in time at which to evaluate the function in milliseconds. Will be corrected for offset internally.
         * @returns the value at the given time
         */
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
        /**
         * (Re-)Calculates the parameters of the cubic function.
         * See https://math.stackexchange.com/questions/3173469/calculate-cubic-equation-from-two-points-and-two-slopes-variably
         * and https://jirkadelloro.github.io/FUDGE/Documentation/Logs/190410_Notizen_LS
         */
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
/// <reference path="../Transfer/Serializer.ts"/>
/// <reference path="../Transfer/Mutable.ts"/>
var FudgeCore;
/// <reference path="../Transfer/Serializer.ts"/>
/// <reference path="../Transfer/Mutable.ts"/>
(function (FudgeCore) {
    /**
     * Holds information about set points in time, their accompanying values as well as their slopes.
     * Also holds a reference to the [[AnimationFunction]]s that come in and out of the sides. The [[AnimationFunction]]s are handled by the [[AnimationSequence]]s.
     * Saved inside an [[AnimationSequence]].
     * @author Lukas Scheuerle, HFU, 2019
     */
    class AnimationKey extends FudgeCore.Mutable {
        constructor(_time = 0, _value = 0, _slopeIn = 0, _slopeOut = 0, _constant = false) {
            super();
            this.constant = false;
            this.slopeIn = 0;
            this.slopeOut = 0;
            this.time = _time;
            this.value = _value;
            this.slopeIn = _slopeIn;
            this.slopeOut = _slopeOut;
            this.constant = _constant;
            this.broken = this.slopeIn != -this.slopeOut;
            this.functionOut = new FudgeCore.AnimationFunction(this, null);
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
        /**
         * Static comparation function to use in an array sort function to sort the keys by their time.
         * @param _a the animation key to check
         * @param _b the animation key to check against
         * @returns >0 if a>b, 0 if a=b, <0 if a<b
         */
        static compare(_a, _b) {
            return _a.time - _b.time;
        }
        //#region transfer
        serialize() {
            let s = {};
            s.time = this.time;
            s.value = this.value;
            s.slopeIn = this.slopeIn;
            s.slopeOut = this.slopeOut;
            s.constant = this.constant;
            return s;
        }
        deserialize(_serialization) {
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
            //
        }
    }
    FudgeCore.AnimationKey = AnimationKey;
})(FudgeCore || (FudgeCore = {}));
/// <reference path="../Transfer/Serializer.ts"/>
/// <reference path="../Transfer/Mutable.ts"/>
var FudgeCore;
/// <reference path="../Transfer/Serializer.ts"/>
/// <reference path="../Transfer/Mutable.ts"/>
(function (FudgeCore) {
    /**
     * A sequence of [[AnimationKey]]s that is mapped to an attribute of a [[Node]] or its [[Component]]s inside the [[Animation]].
     * Provides functions to modify said keys
     * @author Lukas Scheuerle, HFU, 2019
     */
    class AnimationSequence extends FudgeCore.Mutable {
        constructor() {
            super(...arguments);
            this.keys = [];
        }
        /**
         * Evaluates the sequence at the given point in time.
         * @param _time the point in time at which to evaluate the sequence in milliseconds.
         * @returns the value of the sequence at the given time. 0 if there are no keys.
         */
        evaluate(_time) {
            if (this.keys.length == 0)
                return 0; //TODO: shouldn't return 0 but something indicating no change, like null. probably needs to be changed in Node as well to ignore non-numeric values in the applyAnimation function
            if (this.keys.length == 1 || this.keys[0].Time >= _time)
                return this.keys[0].Value;
            for (let i = 0; i < this.keys.length - 1; i++) {
                if (this.keys[i].Time <= _time && this.keys[i + 1].Time > _time) {
                    return this.keys[i].functionOut.evaluate(_time);
                }
            }
            return this.keys[this.keys.length - 1].Value;
        }
        /**
         * Adds a new key to the sequence.
         * @param _key the key to add
         */
        addKey(_key) {
            this.keys.push(_key);
            this.keys.sort(FudgeCore.AnimationKey.compare);
            this.regenerateFunctions();
        }
        /**
         * Removes a given key from the sequence.
         * @param _key the key to remove
         */
        removeKey(_key) {
            for (let i = 0; i < this.keys.length; i++) {
                if (this.keys[i] == _key) {
                    this.keys.splice(i, 1);
                    this.regenerateFunctions();
                    return;
                }
            }
        }
        /**
         * Removes the Animation Key at the given index from the keys.
         * @param _index the zero-based index at which to remove the key
         * @returns the removed AnimationKey if successful, null otherwise.
         */
        removeKeyAtIndex(_index) {
            if (_index < 0 || _index >= this.keys.length) {
                return null;
            }
            let ak = this.keys[_index];
            this.keys.splice(_index, 1);
            this.regenerateFunctions();
            return ak;
        }
        /**
         * Gets a key from the sequence at the desired index.
         * @param _index the zero-based index at which to get the key
         * @returns the AnimationKey at the index if it exists, null otherwise.
         */
        getKey(_index) {
            if (_index < 0 || _index >= this.keys.length)
                return null;
            return this.keys[_index];
        }
        get length() {
            return this.keys.length;
        }
        //#region transfer
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
        deserialize(_serialization) {
            for (let i = 0; i < _serialization.keys.length; i++) {
                // this.keys.push(<AnimationKey>Serializer.deserialize(_serialization.keys[i]));
                let k = new FudgeCore.AnimationKey();
                k.deserialize(_serialization.keys[i]);
                this.keys[i] = k;
            }
            this.regenerateFunctions();
            return this;
        }
        reduceMutator(_mutator) {
            //
        }
        //#endregion
        /**
         * Utility function that (re-)generates all functions in the sequence.
         */
        regenerateFunctions() {
            for (let i = 0; i < this.keys.length; i++) {
                let f = new FudgeCore.AnimationFunction(this.keys[i]);
                this.keys[i].functionOut = f;
                if (i == this.keys.length - 1) {
                    //TODO: check if this is even useful. Maybe update the runcondition to length - 1 instead. Might be redundant if functionIn is removed, see TODO in AnimationKey.
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
    /**
     * Describes the [[Audio]] class in which all Audio Data is stored.
     * Audio will be given to the [[ComponentAudio]] for further usage.
     * @authors Thomas Dorner, HFU, 2019
     */
    class Audio {
        /**
         * Constructor for the [[Audio]] Class
         * @param _audioContext from [[AudioSettings]]
         * @param _gainValue 0 for muted | 1 for max volume
         */
        constructor(_audioContext, _audioSessionData, _url, _gainValue, _loop) {
            this.init(_audioContext, _audioSessionData, _url, _gainValue, _loop);
        }
        async init(_audioContext, _audioSessionData, _url, _gainValue, _loop) {
            // Do everything in constructor
            // Add url to Audio
            this.url = _url;
            console.log("Audio url " + this.url);
            // Get AudioBuffer
            const bufferProm = _audioSessionData.urlToBuffer(_audioContext, _url);
            while (!bufferProm) {
                console.log("waiting...");
            }
            await bufferProm.then(val => {
                this.audioBuffer = val;
                console.log("valBuffer " + val);
            });
            console.log("Audio audiobuffer " + this.audioBuffer);
            // // Add local Gain for Audio  and connect 
            this.localGain = await _audioContext.createGain();
            this.localGainValue = await _gainValue;
            //create Audio
            await this.createAudio(_audioContext, this.audioBuffer);
        }
        /**
         * initBufferSource
         */
        initBufferSource(_audioContext) {
            this.bufferSource = _audioContext.createBufferSource();
            this.bufferSource.buffer = this.audioBuffer;
            console.log("bS = " + this.bufferSource);
            this.bufferSource.connect(_audioContext.destination);
            this.setLoop();
            this.addLocalGain();
            console.log("BufferSource.buffer: " + this.bufferSource.buffer);
            console.log("AudioBuffer: " + this.audioBuffer);
        }
        //#region Getter/Setter LocalGainValue
        setLocalGainValue(_localGainValue) {
            this.localGainValue = _localGainValue;
        }
        getLocalGainValue() {
            return this.localGainValue;
        }
        //#endregion Getter/Setter LocalGainValue
        setBufferSource(_buffer) {
            this.bufferSource.buffer = _buffer;
        }
        /**
         * createAudio builds an [[Audio]] to use with the [[ComponentAudio]]
         * @param _audioContext from [[AudioSettings]]
         * @param _audioBuffer from [[AudioSessionData]]
         */
        createAudio(_audioContext, _audioBuffer) {
            console.log("createAudio() " + " | " + " AudioContext: " + _audioContext);
            this.audioBuffer = _audioBuffer;
            console.log("aB = " + this.audioBuffer);
            // AudioBuffersourceNode Setup
            this.initBufferSource(_audioContext);
            return this.audioBuffer;
        }
        setLoop() {
            this.bufferSource.loop = this.isLooping;
        }
        addLocalGain() {
            this.bufferSource.connect(this.localGain);
        }
    }
    FudgeCore.Audio = Audio;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Add an [[AudioFilter]] to an [[Audio]]
     * @authors Thomas Dorner, HFU, 2019
     */
    let FILTER_TYPE;
    (function (FILTER_TYPE) {
        FILTER_TYPE["LOWPASS"] = "LOWPASS";
        FILTER_TYPE["HIGHPASS"] = "HIGHPASS";
        FILTER_TYPE["BANDPASS"] = "BANDPASS";
        FILTER_TYPE["LOWSHELF"] = "LOWSHELF";
        FILTER_TYPE["HIGHSHELF"] = "HIGHSHELF";
        FILTER_TYPE["PEAKING"] = "PEAKING";
        FILTER_TYPE["NOTCH"] = "NOTCH";
        FILTER_TYPE["ALLPASS"] = "ALLPASS";
    })(FILTER_TYPE || (FILTER_TYPE = {}));
    class AudioFilter {
        constructor(_useFilter, _filterType) {
            this.useFilter = _useFilter;
            this.filterType = _filterType;
        }
        /**
         * addFilterTo
         */
        addFilterToAudio(_audioBuffer, _filterType) {
            console.log("do nothing for now");
        }
    }
    FudgeCore.AudioFilter = AudioFilter;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Describes a [[AudioListener]] attached to a [[Node]]
     * @authors Thomas Dorner, HFU, 2019
     */
    class AudioListener {
        //##TODO AudioListener
        constructor(_audioContext) {
            //this.audioListener = _audioContext.listener;
        }
        /**
         * We will call setAudioListenerPosition whenever there is a need to change Positions.
         * All the position values should be identical to the current Position this is atteched to.
         */
        // public setAudioListenerPosition(_position: Vector3): void {
        //     this.audioListener.positionX.value = _position.x;
        //     this.audioListener.positionY.value = _position.y;
        //     this.audioListener.positionZ.value = _position.z;
        //     this.position = _position;
        // }
        /**
         * getAudioListenerPosition
         */
        getAudioListenerPosition() {
            return this.position;
        }
        /**
         * setAudioListenerOrientation
         */
        // public setAudioListenerOrientation(_orientation: Vector3): void {
        //     this.audioListener.orientationX.value = _orientation.x;
        //     this.audioListener.orientationY.value = _orientation.y;
        //     this.audioListener.orientationZ.value = _orientation.z;
        //     this.orientation = _orientation;
        // }
        /**
         * getAudioListenerOrientation
         */
        getAudioListenerOrientation() {
            return this.orientation;
        }
    }
    FudgeCore.AudioListener = AudioListener;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     *
     * @authors Thomas Dorner, HFU, 2019
     */
    let PANNING_MODEL_TYPE;
    (function (PANNING_MODEL_TYPE) {
        PANNING_MODEL_TYPE["EQUALPOWER"] = "EQUALPOWER";
        PANNING_MODEL_TYPE["HRFT"] = "HRFT";
    })(PANNING_MODEL_TYPE || (PANNING_MODEL_TYPE = {}));
    let DISTANCE_MODEL_TYPE;
    (function (DISTANCE_MODEL_TYPE) {
        DISTANCE_MODEL_TYPE["LINEAR"] = "LINEAR";
        DISTANCE_MODEL_TYPE["INVERSE"] = "INVERSE";
        DISTANCE_MODEL_TYPE["EXPONENTIAL"] = "EXPONENTIAL";
    })(DISTANCE_MODEL_TYPE || (DISTANCE_MODEL_TYPE = {}));
    class AudioLocalisation {
        /**
         * Constructor for the [[AudioLocalisation]] Class
         * @param _audioContext from [[AudioSettings]]
         */
        constructor(_audioContext) {
            this.pannerNode = _audioContext.createPanner();
        }
        /**
        * We will call setPannerPosition whenever there is a need to change Positions.
        * All the position values should be identical to the current Position this is atteched to.
        */
        // public setPannePosition(_position: Vector3): void {
        //     this.pannerNode.positionX.value = _position.x;
        //     this.pannerNode.positionY.value = _position.y;
        //     this.pannerNode.positionZ.value = _position.z;
        //     this.position = _position;
        // }
        /**
         * getPannerPosition
         */
        getPannerPosition() {
            return this.position;
        }
        /**
         * setPanneOrientation
         */
        // public setPannerOrientation(_orientation: Vector3): void {
        //     this.pannerNode.orientationX.value = _orientation.x;
        //     this.pannerNode.orientationY.value = _orientation.y;
        //     this.pannerNode.orientationZ.value = _orientation.z;
        //     this.orientation = _orientation;
        // }
        /**
         * getPanneOrientation
         */
        getPanneOrientation() {
            return this.orientation;
        }
    }
    FudgeCore.AudioLocalisation = AudioLocalisation;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Describes Data Handler for all Audio Sources
     * @authors Thomas Dorner, HFU, 2019
     */
    class AudioSessionData {
        /**
         * constructor of the [[AudioSessionData]] class
         */
        constructor() {
            this.dataArray = new Array();
            this.bufferCounter = 0;
        }
        /**
         * getBufferCounter returns [bufferCounter] to keep track of number of different used sounds
         */
        getBufferCounter() {
            return this.bufferCounter;
        }
        /**
         * Decoding Audio Data
         * Asynchronous Function to permit the loading of multiple Data Sources at the same time
         * @param _url URL as String for Data fetching
         */
        async urlToBuffer(_audioContext, _url) {
            console.log("inside urlToBuffer");
            let initObject = {
                method: "GET",
                mode: "same-origin",
                cache: "no-cache",
                headers: {
                    "Content-Type": "audio/mpeg3"
                },
                redirect: "follow" // default -> follow
            };
            // Check for existing URL in DataArray, if no data inside add new AudioData
            //this.pushDataArray(_url, null);
            console.log("length" + this.dataArray.length);
            if (this.dataArray.length == 0) {
                try {
                    // need window to fetch?
                    const response = await window.fetch(_url, initObject);
                    const arrayBuffer = await response.arrayBuffer();
                    const decodedAudio = await _audioContext.decodeAudioData(arrayBuffer);
                    this.pushDataArray(_url, decodedAudio);
                    //this.dataArray[this.dataArray.length].buffer = decodedAudio;
                    console.log("length " + this.dataArray.length);
                    return decodedAudio;
                }
                catch (e) {
                    this.logErrorFetch(e);
                    return null;
                }
            }
            else {
                // If needed URL is inside Array, 
                // iterate through all existing Data to get needed values
                for (let x = 0; x < this.dataArray.length; x++) {
                    console.log("what is happening");
                    if (this.dataArray[x].url == _url) {
                        console.log("found existing url");
                        return this.dataArray[x].buffer;
                    }
                }
                return null;
            }
        }
        /**
         * pushTuple Source and Decoded Audio Data gets saved for later use
         * @param _url URL from used Data
         * @param _audioBuffer AudioBuffer generated from URL
         */
        pushDataArray(_url, _audioBuffer) {
            let data;
            data = { url: _url, buffer: _audioBuffer, counter: this.bufferCounter };
            this.dataArray.push(data);
            console.log("array: " + this.dataArray);
            //TODO audioBufferHolder obsolete if array working
            this.setAudioBufferHolder(data);
            console.log("dataPair " + data.url + " " + data.buffer + " " + data.counter);
            this.bufferCounter += 1;
            return this.audioBufferHolder;
        }
        /**
         * iterateArray
         * Look at saved Data Count
         */
        countDataInArray() {
            console.log("DataArray Length: " + this.dataArray.length);
        }
        /**
         * showDataInArray
         * Show all Data in Array
         */
        showDataInArray() {
            for (let x = 0; x < this.dataArray.length; x++) {
                console.log("Array Data: " + this.dataArray[x].url + this.dataArray[x].buffer);
            }
        }
        /**
         * getAudioBuffer
         */
        getAudioBufferHolder() {
            return this.audioBufferHolder;
        }
        /**
         * setAudioBuffer
         */
        setAudioBufferHolder(_audioData) {
            this.audioBufferHolder = _audioData;
        }
        /**
         * Error Message for Data Fetching
         * @param e Error
         */
        logErrorFetch(e) {
            console.log("Audio error", e);
        }
    }
    FudgeCore.AudioSessionData = AudioSessionData;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Describes Global Audio Settings.
     * Is meant to be used as a Menu option.
     * @authors Thomas Dorner, HFU, 2019
     */
    class AudioSettings {
        //
        /**
         * Constructor for master Volume
         * @param _gainValue
         */
        constructor(_gainValue) {
            this.setAudioContext(new AudioContext({ latencyHint: "interactive", sampleRate: 44100 }));
            //this.globalAudioContext.resume();
            console.log("GlobalAudioContext: " + this.globalAudioContext);
            this.masterGain = this.globalAudioContext.createGain();
            this.masterGainValue = _gainValue;
            //this.audioSessionData = new AudioSessionData();
        }
        setMasterGainValue(_masterGainValue) {
            this.masterGainValue = _masterGainValue;
        }
        getMasterGainValue() {
            return this.masterGainValue;
        }
        getAudioContext() {
            return this.globalAudioContext;
        }
        setAudioContext(_audioContext) {
            this.globalAudioContext = _audioContext;
        }
    }
    FudgeCore.AudioSettings = AudioSettings;
})(FudgeCore || (FudgeCore = {}));
//<reference path="../Coats/Coat.ts"/>
var FudgeCore;
//<reference path="../Coats/Coat.ts"/>
(function (FudgeCore) {
    class RenderInjector {
        static decorateCoat(_constructor) {
            let coatInjection = RenderInjector.coatInjections[_constructor.name];
            if (!coatInjection) {
                FudgeCore.Debug.error("No injection decorator defined for " + _constructor.name);
            }
            Object.defineProperty(_constructor.prototype, "useRenderData", {
                value: coatInjection
            });
        }
        static injectRenderDataForCoatColored(_renderShader) {
            let colorUniformLocation = _renderShader.uniforms["u_color"];
            // let { r, g, b, a } = (<CoatColored>this).color;
            // let color: Float32Array = new Float32Array([r, g, b, a]);
            let color = this.color.getArray();
            FudgeCore.RenderOperator.getRenderingContext().uniform4fv(colorUniformLocation, color);
        }
        static injectRenderDataForCoatTextured(_renderShader) {
            let crc3 = FudgeCore.RenderOperator.getRenderingContext();
            if (this.renderData) {
                // buffers exist
                crc3.activeTexture(WebGL2RenderingContext.TEXTURE0);
                crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, this.renderData["texture0"]);
                crc3.uniform1i(_renderShader.uniforms["u_texture"], 0);
            }
            else {
                this.renderData = {};
                // TODO: check if all WebGL-Creations are asserted
                const texture = FudgeCore.RenderManager.assert(crc3.createTexture());
                crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, texture);
                try {
                    crc3.texImage2D(crc3.TEXTURE_2D, 0, crc3.RGBA, crc3.RGBA, crc3.UNSIGNED_BYTE, this.texture.image);
                    crc3.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, this.texture.image);
                }
                catch (_e) {
                    FudgeCore.Debug.error(_e);
                }
                crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MAG_FILTER, WebGL2RenderingContext.NEAREST);
                crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.NEAREST);
                crc3.generateMipmap(crc3.TEXTURE_2D);
                this.renderData["texture0"] = texture;
                crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, null);
                this.useRenderData(_renderShader);
            }
        }
        static injectRenderDataForCoatMatCap(_renderShader) {
            let crc3 = FudgeCore.RenderOperator.getRenderingContext();
            let colorUniformLocation = _renderShader.uniforms["u_tint_color"];
            let { r, g, b, a } = this.tintColor;
            let tintColorArray = new Float32Array([r, g, b, a]);
            crc3.uniform4fv(colorUniformLocation, tintColorArray);
            let floatUniformLocation = _renderShader.uniforms["u_flatmix"];
            let flatMix = this.flatMix;
            crc3.uniform1f(floatUniformLocation, flatMix);
            if (this.renderData) {
                // buffers exist
                crc3.activeTexture(WebGL2RenderingContext.TEXTURE0);
                crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, this.renderData["texture0"]);
                crc3.uniform1i(_renderShader.uniforms["u_texture"], 0);
            }
            else {
                this.renderData = {};
                // TODO: check if all WebGL-Creations are asserted
                const texture = FudgeCore.RenderManager.assert(crc3.createTexture());
                crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, texture);
                try {
                    crc3.texImage2D(crc3.TEXTURE_2D, 0, crc3.RGBA, crc3.RGBA, crc3.UNSIGNED_BYTE, this.texture.image);
                    crc3.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, this.texture.image);
                }
                catch (_e) {
                    FudgeCore.Debug.error(_e);
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
        "CoatTextured": RenderInjector.injectRenderDataForCoatTextured,
        "CoatMatCap": RenderInjector.injectRenderDataForCoatMatCap
    };
    FudgeCore.RenderInjector = RenderInjector;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
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
            RenderOperator.renderShaderRayCast = RenderOperator.createProgram(FudgeCore.ShaderRayCast);
        }
        /**
         * Return a reference to the offscreen-canvas
         */
        static getCanvas() {
            return RenderOperator.crc3.canvas; // TODO: enable OffscreenCanvas
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
            return FudgeCore.Rectangle.GET(0, 0, canvas.width, canvas.height);
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
                    case FudgeCore.LightAmbient.name:
                        let ambient = [];
                        for (let light of entry[1]) {
                            let c = light.getLight().color;
                            ambient.push(c.r, c.g, c.b, c.a);
                        }
                        renderLights["u_ambient"] = new Float32Array(ambient);
                        break;
                    case FudgeCore.LightDirectional.name:
                        let directional = [];
                        for (let light of entry[1]) {
                            let c = light.getLight().color;
                            let d = light.getLight().direction;
                            directional.push(c.r, c.g, c.b, c.a, d.x, d.y, d.z);
                        }
                        renderLights["u_directional"] = new Float32Array(directional);
                        break;
                    default:
                        FudgeCore.Debug.warn("Shaderstructure undefined for", entry[0]);
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
                        let direction = light.direction.copy;
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
        static draw(_renderShader, _renderBuffers, _renderCoat, _world, _projection) {
            RenderOperator.useProgram(_renderShader);
            // RenderOperator.useBuffers(_renderBuffers);
            // RenderOperator.useParameter(_renderCoat);
            RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, _renderBuffers.vertices);
            RenderOperator.crc3.enableVertexAttribArray(_renderShader.attributes["a_position"]);
            RenderOperator.setAttributeStructure(_renderShader.attributes["a_position"], FudgeCore.Mesh.getBufferSpecification());
            RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, _renderBuffers.indices);
            if (_renderShader.attributes["a_textureUVs"]) {
                RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, _renderBuffers.textureUVs);
                RenderOperator.crc3.enableVertexAttribArray(_renderShader.attributes["a_textureUVs"]); // enable the buffer
                RenderOperator.crc3.vertexAttribPointer(_renderShader.attributes["a_textureUVs"], 2, WebGL2RenderingContext.FLOAT, false, 0, 0);
            }
            // Supply matrixdata to shader. 
            let uProjection = _renderShader.uniforms["u_projection"];
            RenderOperator.crc3.uniformMatrix4fv(uProjection, false, _projection.get());
            if (_renderShader.uniforms["u_world"]) {
                let uWorld = _renderShader.uniforms["u_world"];
                RenderOperator.crc3.uniformMatrix4fv(uWorld, false, _world.get());
                RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, _renderBuffers.normalsFace);
                RenderOperator.crc3.enableVertexAttribArray(_renderShader.attributes["a_normal"]);
                RenderOperator.setAttributeStructure(_renderShader.attributes["a_normal"], FudgeCore.Mesh.getBufferSpecification());
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
        static drawForRayCast(_id, _renderBuffers, _world, _projection) {
            let renderShader = RenderOperator.renderShaderRayCast;
            RenderOperator.useProgram(renderShader);
            RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, _renderBuffers.vertices);
            RenderOperator.crc3.enableVertexAttribArray(renderShader.attributes["a_position"]);
            RenderOperator.setAttributeStructure(renderShader.attributes["a_position"], FudgeCore.Mesh.getBufferSpecification());
            RenderOperator.crc3.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, _renderBuffers.indices);
            // Supply matrixdata to shader. 
            let uProjection = renderShader.uniforms["u_projection"];
            RenderOperator.crc3.uniformMatrix4fv(uProjection, false, _projection.get());
            if (renderShader.uniforms["u_world"]) {
                let uWorld = renderShader.uniforms["u_world"];
                RenderOperator.crc3.uniformMatrix4fv(uWorld, false, _world.get());
            }
            let idUniformLocation = renderShader.uniforms["u_id"];
            RenderOperator.getRenderingContext().uniform1i(idUniformLocation, _id);
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
                FudgeCore.Debug.error(_error);
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
    FudgeCore.RenderOperator = RenderOperator;
})(FudgeCore || (FudgeCore = {}));
/// <reference path="../Transfer/Mutable.ts"/>
/// <reference path="../Render/RenderInjector.ts"/>
/// <reference path="../Render/RenderOperator.ts"/>
var FudgeCore;
/// <reference path="../Transfer/Mutable.ts"/>
/// <reference path="../Render/RenderInjector.ts"/>
/// <reference path="../Render/RenderOperator.ts"/>
(function (FudgeCore) {
    /**
     * Holds data to feed into a [[Shader]] to describe the surface of [[Mesh]].
     * [[Material]]s reference [[Coat]] and [[Shader]].
     * The method useRenderData will be injected by [[RenderInjector]] at runtime, extending the functionality of this class to deal with the renderer.
     */
    class Coat extends FudgeCore.Mutable {
        constructor() {
            super(...arguments);
            this.name = "Coat";
            //#endregion
        }
        mutate(_mutator) {
            super.mutate(_mutator);
        }
        useRenderData(_renderShader) { }
        //#region Transfer
        serialize() {
            let serialization = this.getMutator();
            return serialization;
        }
        deserialize(_serialization) {
            this.mutate(_serialization);
            return this;
        }
        reduceMutator() { }
    }
    FudgeCore.Coat = Coat;
    /**
     * The simplest [[Coat]] providing just a color
     */
    let CoatColored = class CoatColored extends Coat {
        constructor(_color) {
            super();
            this.color = _color || new FudgeCore.Color(0.5, 0.5, 0.5, 1);
        }
    };
    CoatColored = __decorate([
        FudgeCore.RenderInjector.decorateCoat
    ], CoatColored);
    FudgeCore.CoatColored = CoatColored;
    /**
     * A [[Coat]] providing a texture and additional data for texturing
     */
    let CoatTextured = class CoatTextured extends Coat {
        constructor() {
            super(...arguments);
            this.texture = null;
        }
    };
    CoatTextured = __decorate([
        FudgeCore.RenderInjector.decorateCoat
    ], CoatTextured);
    FudgeCore.CoatTextured = CoatTextured;
    /**
     * A [[Coat]] to be used by the MatCap Shader providing a texture, a tint color (0.5 grey is neutral)
     * and a flatMix number for mixing between smooth and flat shading.
     */
    let CoatMatCap = class CoatMatCap extends Coat {
        constructor(_texture, _tintcolor, _flatmix) {
            super();
            this.texture = null;
            this.tintColor = new FudgeCore.Color(0.5, 0.5, 0.5, 1);
            this.flatMix = 0.5;
            this.texture = _texture || new FudgeCore.TextureImage();
            this.tintColor = _tintcolor || new FudgeCore.Color(0.5, 0.5, 0.5, 1);
            this.flatMix = _flatmix > 1.0 ? this.flatMix = 1.0 : this.flatMix = _flatmix || 0.5;
        }
    };
    CoatMatCap = __decorate([
        FudgeCore.RenderInjector.decorateCoat
    ], CoatMatCap);
    FudgeCore.CoatMatCap = CoatMatCap;
})(FudgeCore || (FudgeCore = {}));
/// <reference path="../Transfer/Serializer.ts"/>
/// <reference path="../Transfer/Mutable.ts"/>
var FudgeCore;
/// <reference path="../Transfer/Serializer.ts"/>
/// <reference path="../Transfer/Mutable.ts"/>
(function (FudgeCore) {
    /**
     * Superclass for all [[Component]]s that can be attached to [[Node]]s.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Component extends FudgeCore.Mutable {
        constructor() {
            super(...arguments);
            this.singleton = true;
            this.container = null;
            this.active = true;
            //#endregion
        }
        activate(_on) {
            this.active = _on;
            this.dispatchEvent(new Event(_on ? "componentActivate" /* COMPONENT_ACTIVATE */ : "componentDeactivate" /* COMPONENT_DEACTIVATE */));
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
         */
        setContainer(_container) {
            if (this.container == _container)
                return;
            let previousContainer = this.container;
            try {
                if (previousContainer)
                    previousContainer.removeComponent(this);
                this.container = _container;
                if (this.container)
                    this.container.addComponent(this);
            }
            catch {
                this.container = previousContainer;
            }
        }
        //#region Transfer
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
            delete _mutator.container;
        }
    }
    FudgeCore.Component = Component;
})(FudgeCore || (FudgeCore = {}));
/// <reference path="Component.ts"/>
var FudgeCore;
/// <reference path="Component.ts"/>
(function (FudgeCore) {
    /**
     * Holds different playmodes the animation uses to play back its animation.
     * @author Lukas Scheuerle, HFU, 2019
     */
    let ANIMATION_PLAYMODE;
    (function (ANIMATION_PLAYMODE) {
        /**Plays animation in a loop: it restarts once it hit the end.*/
        ANIMATION_PLAYMODE[ANIMATION_PLAYMODE["LOOP"] = 0] = "LOOP";
        /**Plays animation once and stops at the last key/frame*/
        ANIMATION_PLAYMODE[ANIMATION_PLAYMODE["PLAYONCE"] = 1] = "PLAYONCE";
        /**Plays animation once and stops on the first key/frame */
        ANIMATION_PLAYMODE[ANIMATION_PLAYMODE["PLAYONCESTOPAFTER"] = 2] = "PLAYONCESTOPAFTER";
        /**Plays animation like LOOP, but backwards.*/
        ANIMATION_PLAYMODE[ANIMATION_PLAYMODE["REVERSELOOP"] = 3] = "REVERSELOOP";
        /**Causes the animation not to play at all. Useful for jumping to various positions in the animation without proceeding in the animation.*/
        ANIMATION_PLAYMODE[ANIMATION_PLAYMODE["STOP"] = 4] = "STOP";
        //TODO: add an INHERIT and a PINGPONG mode
    })(ANIMATION_PLAYMODE = FudgeCore.ANIMATION_PLAYMODE || (FudgeCore.ANIMATION_PLAYMODE = {}));
    let ANIMATION_PLAYBACK;
    (function (ANIMATION_PLAYBACK) {
        //TODO: add an in-depth description of what happens to the animation (and events) depending on the Playback. Use Graphs to explain.
        /**Calculates the state of the animation at the exact position of time. Ignores FPS value of animation.*/
        ANIMATION_PLAYBACK[ANIMATION_PLAYBACK["TIMEBASED_CONTINOUS"] = 0] = "TIMEBASED_CONTINOUS";
        /**Limits the calculation of the state of the animation to the FPS value of the animation. Skips frames if needed.*/
        ANIMATION_PLAYBACK[ANIMATION_PLAYBACK["TIMEBASED_RASTERED_TO_FPS"] = 1] = "TIMEBASED_RASTERED_TO_FPS";
        /**Uses the FPS value of the animation to advance once per frame, no matter the speed of the frames. Doesn't skip any frames.*/
        ANIMATION_PLAYBACK[ANIMATION_PLAYBACK["FRAMEBASED"] = 2] = "FRAMEBASED";
    })(ANIMATION_PLAYBACK = FudgeCore.ANIMATION_PLAYBACK || (FudgeCore.ANIMATION_PLAYBACK = {}));
    /**
     * Holds a reference to an [[Animation]] and controls it. Controls playback and playmode as well as speed.
     * @authors Lukas Scheuerle, HFU, 2019
     */
    class ComponentAnimator extends FudgeCore.Component {
        constructor(_animation = new FudgeCore.Animation(""), _playmode = ANIMATION_PLAYMODE.LOOP, _playback = ANIMATION_PLAYBACK.TIMEBASED_CONTINOUS) {
            super();
            this.speedScalesWithGlobalSpeed = true;
            this.speedScale = 1;
            this.lastTime = 0;
            this.animation = _animation;
            this.playmode = _playmode;
            this.playback = _playback;
            this.localTime = new FudgeCore.Time();
            //TODO: update animation total time when loading a different animation?
            this.animation.calculateTotalTime();
            FudgeCore.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.updateAnimationLoop.bind(this));
            FudgeCore.Time.game.addEventListener("timeScaled" /* TIME_SCALED */, this.updateScale.bind(this));
        }
        set speed(_s) {
            this.speedScale = _s;
            this.updateScale();
        }
        /**
         * Jumps to a certain time in the animation to play from there.
         * @param _time The time to jump to
         */
        jumpTo(_time) {
            this.localTime.set(_time);
            this.lastTime = _time;
            _time = _time % this.animation.totalTime;
            let mutator = this.animation.getMutated(_time, this.calculateDirection(_time), this.playback);
            this.getContainer().applyAnimation(mutator);
        }
        /**
         * Returns the current time of the animation, modulated for animation length.
         */
        getCurrentTime() {
            return this.localTime.get() % this.animation.totalTime;
        }
        /**
         * Forces an update of the animation from outside. Used in the ViewAnimation. Shouldn't be used during the game.
         * @param _time the (unscaled) time to update the animation with.
         * @returns a Tupel containing the Mutator for Animation and the playmode corrected time.
         */
        updateAnimation(_time) {
            return this.updateAnimationLoop(null, _time);
        }
        //#region transfer
        serialize() {
            let s = super.serialize();
            s["animation"] = this.animation.serialize();
            s["playmode"] = this.playmode;
            s["playback"] = this.playback;
            s["speedScale"] = this.speedScale;
            s["speedScalesWithGlobalSpeed"] = this.speedScalesWithGlobalSpeed;
            s[super.constructor.name] = super.serialize();
            return s;
        }
        deserialize(_s) {
            this.animation = new FudgeCore.Animation("");
            this.animation.deserialize(_s.animation);
            this.playback = _s.playback;
            this.playmode = _s.playmode;
            this.speedScale = _s.speedScale;
            this.speedScalesWithGlobalSpeed = _s.speedScalesWithGlobalSpeed;
            super.deserialize(_s[super.constructor.name]);
            return this;
        }
        //#endregion
        //#region updateAnimation
        /**
         * Updates the Animation.
         * Gets called every time the Loop fires the LOOP_FRAME Event.
         * Uses the built-in time unless a different time is specified.
         * May also be called from updateAnimation().
         */
        updateAnimationLoop(_e, _time) {
            if (this.animation.totalTime == 0)
                return [null, 0];
            let time = _time || this.localTime.get();
            if (this.playback == ANIMATION_PLAYBACK.FRAMEBASED) {
                time = this.lastTime + (1000 / this.animation.fps);
            }
            let direction = this.calculateDirection(time);
            time = this.applyPlaymodes(time);
            this.executeEvents(this.animation.getEventsToFire(this.lastTime, time, this.playback, direction));
            if (this.lastTime != time) {
                this.lastTime = time;
                time = time % this.animation.totalTime;
                let mutator = this.animation.getMutated(time, direction, this.playback);
                if (this.getContainer()) {
                    this.getContainer().applyAnimation(mutator);
                }
                return [mutator, time];
            }
            return [null, time];
        }
        /**
         * Fires all custom events the Animation should have fired between the last frame and the current frame.
         * @param events a list of names of custom events to fire
         */
        executeEvents(events) {
            for (let i = 0; i < events.length; i++) {
                this.dispatchEvent(new Event(events[i]));
            }
        }
        /**
         * Calculates the actual time to use, using the current playmodes.
         * @param _time the time to apply the playmodes to
         * @returns the recalculated time
         */
        applyPlaymodes(_time) {
            switch (this.playmode) {
                case ANIMATION_PLAYMODE.STOP:
                    return this.localTime.getOffset();
                case ANIMATION_PLAYMODE.PLAYONCE:
                    if (_time >= this.animation.totalTime)
                        return this.animation.totalTime - 0.01; //TODO: this might cause some issues
                    else
                        return _time;
                case ANIMATION_PLAYMODE.PLAYONCESTOPAFTER:
                    if (_time >= this.animation.totalTime)
                        return this.animation.totalTime + 0.01; //TODO: this might cause some issues
                    else
                        return _time;
                default:
                    return _time;
            }
        }
        /**
         * Calculates and returns the direction the animation should currently be playing in.
         * @param _time the time at which to calculate the direction
         * @returns 1 if forward, 0 if stop, -1 if backwards
         */
        calculateDirection(_time) {
            switch (this.playmode) {
                case ANIMATION_PLAYMODE.STOP:
                    return 0;
                // case ANIMATION_PLAYMODE.PINGPONG:
                //   if (Math.floor(_time / this.animation.totalTime) % 2 == 0)
                //     return 1;
                //   else
                //     return -1;
                case ANIMATION_PLAYMODE.REVERSELOOP:
                    return -1;
                case ANIMATION_PLAYMODE.PLAYONCE:
                case ANIMATION_PLAYMODE.PLAYONCESTOPAFTER:
                    if (_time >= this.animation.totalTime) {
                        return 0;
                    }
                default:
                    return 1;
            }
        }
        /**
         * Updates the scale of the animation if the user changes it or if the global game timer changed its scale.
         */
        updateScale() {
            let newScale = this.speedScale;
            if (this.speedScalesWithGlobalSpeed)
                newScale *= FudgeCore.Time.game.getScale();
            this.localTime.setScale(newScale);
        }
    }
    FudgeCore.ComponentAnimator = ComponentAnimator;
})(FudgeCore || (FudgeCore = {}));
/// <reference path="Component.ts"/>
var FudgeCore;
/// <reference path="Component.ts"/>
(function (FudgeCore) {
    /**
     * Attaches a [[ComponentAudio]] to a [[Node]].
     * Only a single [[Audio]] can be used within a single [[ComponentAudio]]
     * @authors Thomas Dorner, HFU, 2019
     */
    class ComponentAudio extends FudgeCore.Component {
        constructor(_audio) {
            super();
            this.setAudio(_audio);
        }
        setLocalisation(_localisation) {
            this.localisation = _localisation;
        }
        /**
         * playAudio
         */
        playAudio(_audioContext) {
            this.audio.initBufferSource(_audioContext);
            this.audio.bufferSource.start(_audioContext.currentTime);
        }
        /**
         * Adds an [[Audio]] to the [[ComponentAudio]]
         * @param _audio Decoded Audio Data as [[Audio]]
         */
        setAudio(_audio) {
            this.audio = _audio;
        }
    }
    FudgeCore.ComponentAudio = ComponentAudio;
})(FudgeCore || (FudgeCore = {}));
/// <reference path="Component.ts"/>
var FudgeCore;
/// <reference path="Component.ts"/>
(function (FudgeCore) {
    /**
     * Attaches a [[AudioListener]] to the node
     * @authors Thomas Dorner, HFU, 2019
     */
    class ComponentAudioListener extends FudgeCore.Component {
    }
    FudgeCore.ComponentAudioListener = ComponentAudioListener;
})(FudgeCore || (FudgeCore = {}));
/// <reference path="Component.ts"/>
var FudgeCore;
/// <reference path="Component.ts"/>
(function (FudgeCore) {
    let FIELD_OF_VIEW;
    (function (FIELD_OF_VIEW) {
        FIELD_OF_VIEW[FIELD_OF_VIEW["HORIZONTAL"] = 0] = "HORIZONTAL";
        FIELD_OF_VIEW[FIELD_OF_VIEW["VERTICAL"] = 1] = "VERTICAL";
        FIELD_OF_VIEW[FIELD_OF_VIEW["DIAGONAL"] = 2] = "DIAGONAL";
    })(FIELD_OF_VIEW = FudgeCore.FIELD_OF_VIEW || (FudgeCore.FIELD_OF_VIEW = {}));
    /**
     * Defines identifiers for the various projections a camera can provide.
     * TODO: change back to number enum if strings not needed
     */
    let PROJECTION;
    (function (PROJECTION) {
        PROJECTION["CENTRAL"] = "central";
        PROJECTION["ORTHOGRAPHIC"] = "orthographic";
        PROJECTION["DIMETRIC"] = "dimetric";
        PROJECTION["STEREO"] = "stereo";
    })(PROJECTION = FudgeCore.PROJECTION || (FudgeCore.PROJECTION = {}));
    /**
     * The camera component holds the projection-matrix and other data needed to render a scene from the perspective of the node it is attached to.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentCamera extends FudgeCore.Component {
        constructor() {
            super(...arguments);
            this.pivot = FudgeCore.Matrix4x4.IDENTITY;
            //private orthographic: boolean = false; // Determines whether the image will be rendered with perspective or orthographic projection.
            this.projection = PROJECTION.CENTRAL;
            this.transform = new FudgeCore.Matrix4x4; // The matrix to multiply each scene objects transformation by, to determine where it will be drawn.
            this.fieldOfView = 45; // The camera's sensorangle.
            this.aspectRatio = 1.0;
            this.direction = FIELD_OF_VIEW.DIAGONAL;
            this.backgroundColor = new FudgeCore.Color(0, 0, 0, 1); // The color of the background the camera will render.
            this.backgroundEnabled = true; // Determines whether or not the background of this camera will be rendered.
            //#endregion
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
        getDirection() {
            return this.direction;
        }
        /**
         * Returns the multiplikation of the worldtransformation of the camera container with the projection matrix
         * @returns the world-projection-matrix
         */
        get ViewProjectionMatrix() {
            let world = this.pivot;
            try {
                world = FudgeCore.Matrix4x4.MULTIPLICATION(this.getContainer().mtxWorld, this.pivot);
            }
            catch (_error) {
                // no container node or no world transformation found -> continue with pivot only
            }
            let viewMatrix = FudgeCore.Matrix4x4.INVERSION(world);
            return FudgeCore.Matrix4x4.MULTIPLICATION(this.transform, viewMatrix);
        }
        /**
         * Set the camera to perspective projection. The world origin is in the center of the canvaselement.
         * @param _aspect The aspect ratio between width and height of projectionspace.(Default = canvas.clientWidth / canvas.ClientHeight)
         * @param _fieldOfView The field of view in Degrees. (Default = 45)
         * @param _direction The plane on which the fieldOfView-Angle is given
         */
        projectCentral(_aspect = this.aspectRatio, _fieldOfView = this.fieldOfView, _direction = this.direction) {
            this.aspectRatio = _aspect;
            this.fieldOfView = _fieldOfView;
            this.direction = _direction;
            this.projection = PROJECTION.CENTRAL;
            this.transform = FudgeCore.Matrix4x4.PROJECTION_CENTRAL(_aspect, this.fieldOfView, 1, 2000, this.direction); // TODO: remove magic numbers
        }
        /**
         * Set the camera to orthographic projection. The origin is in the top left corner of the canvas.
         * @param _left The positionvalue of the projectionspace's left border. (Default = 0)
         * @param _right The positionvalue of the projectionspace's right border. (Default = canvas.clientWidth)
         * @param _bottom The positionvalue of the projectionspace's bottom border.(Default = canvas.clientHeight)
         * @param _top The positionvalue of the projectionspace's top border.(Default = 0)
         */
        projectOrthographic(_left = 0, _right = FudgeCore.RenderManager.getCanvas().clientWidth, _bottom = FudgeCore.RenderManager.getCanvas().clientHeight, _top = 0) {
            this.projection = PROJECTION.ORTHOGRAPHIC;
            this.transform = FudgeCore.Matrix4x4.PROJECTION_ORTHOGRAPHIC(_left, _right, _bottom, _top, 400, -400); // TODO: examine magic numbers!
        }
        /**
         * Return the calculated normed dimension of the projection space
         */
        getProjectionRectangle() {
            let tanFov = Math.tan(Math.PI * this.fieldOfView / 360); // Half of the angle, to calculate dimension from the center -> right angle
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
            else { //FOV_DIRECTION.HORIZONTAL
                tanHorizontal = tanFov;
                tanVertical = tanHorizontal / this.aspectRatio;
            }
            return FudgeCore.Rectangle.GET(0, 0, tanHorizontal * 2, tanVertical * 2);
        }
        //#region Transfer
        serialize() {
            let serialization = {
                backgroundColor: this.backgroundColor,
                backgroundEnabled: this.backgroundEnabled,
                projection: this.projection,
                fieldOfView: this.fieldOfView,
                direction: this.direction,
                aspect: this.aspectRatio,
                pivot: this.pivot.serialize(),
                [super.constructor.name]: super.serialize()
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
            this.pivot.deserialize(_serialization.pivot);
            super.deserialize(_serialization[super.constructor.name]);
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
    /**
     * Attaches a [[Light]] to the node
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentLight extends FudgeCore.Component {
        constructor(_light = null) {
            super();
            this.singleton = false;
            this.light = _light;
        }
        getLight() {
            return this.light;
        }
    }
    FudgeCore.ComponentLight = ComponentLight;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Attaches a [[Material]] to the node
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentMaterial extends FudgeCore.Component {
        constructor(_material = null) {
            super();
            this.material = _material;
        }
        //#region Transfer
        serialize() {
            let serialization;
            /* at this point of time, serialization as resource and as inline object is possible. TODO: check if inline becomes obsolete */
            let idMaterial = this.material.idResource;
            if (idMaterial)
                serialization = { idMaterial: idMaterial };
            else
                serialization = { material: FudgeCore.Serializer.serialize(this.material) };
            serialization[super.constructor.name] = super.serialize();
            return serialization;
        }
        deserialize(_serialization) {
            let material;
            if (_serialization.idMaterial)
                material = FudgeCore.ResourceManager.get(_serialization.idMaterial);
            else
                material = FudgeCore.Serializer.deserialize(_serialization.material);
            this.material = material;
            super.deserialize(_serialization[super.constructor.name]);
            return this;
        }
    }
    FudgeCore.ComponentMaterial = ComponentMaterial;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Attaches a [[Mesh]] to the node
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentMesh extends FudgeCore.Component {
        constructor(_mesh = null) {
            super();
            this.pivot = FudgeCore.Matrix4x4.IDENTITY;
            this.mesh = null;
            this.mesh = _mesh;
        }
        //#region Transfer
        serialize() {
            let serialization;
            /* at this point of time, serialization as resource and as inline object is possible. TODO: check if inline becomes obsolete */
            let idMesh = this.mesh.idResource;
            if (idMesh)
                serialization = { idMesh: idMesh };
            else
                serialization = { mesh: FudgeCore.Serializer.serialize(this.mesh) };
            serialization.pivot = this.pivot.serialize();
            serialization[super.constructor.name] = super.serialize();
            return serialization;
        }
        deserialize(_serialization) {
            let mesh;
            if (_serialization.idMesh)
                mesh = FudgeCore.ResourceManager.get(_serialization.idMesh);
            else
                mesh = FudgeCore.Serializer.deserialize(_serialization.mesh);
            this.mesh = mesh;
            this.pivot.deserialize(_serialization.pivot);
            super.deserialize(_serialization[super.constructor.name]);
            return this;
        }
    }
    FudgeCore.ComponentMesh = ComponentMesh;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Base class for scripts the user writes
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentScript extends FudgeCore.Component {
        constructor() {
            super();
            this.singleton = false;
        }
        serialize() {
            return this.getMutator();
        }
        deserialize(_serialization) {
            this.mutate(_serialization);
            return this;
        }
    }
    FudgeCore.ComponentScript = ComponentScript;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Attaches a transform-[[Matrix4x4]] to the node, moving, scaling and rotating it in space relative to its parent.
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ComponentTransform extends FudgeCore.Component {
        constructor(_matrix = FudgeCore.Matrix4x4.IDENTITY) {
            super();
            this.local = _matrix;
        }
        //#region Transfer
        serialize() {
            let serialization = {
                local: this.local.serialize(),
                [super.constructor.name]: super.serialize()
            };
            return serialization;
        }
        deserialize(_serialization) {
            super.deserialize(_serialization[super.constructor.name]);
            this.local.deserialize(_serialization.local);
            return this;
        }
        // public mutate(_mutator: Mutator): void {
        //     this.local.mutate(_mutator);
        // }
        // public getMutator(): Mutator { 
        //     return this.local.getMutator();
        // }
        // public getMutatorAttributeTypes(_mutator: Mutator): MutatorAttributeTypes {
        //     let types: MutatorAttributeTypes = this.local.getMutatorAttributeTypes(_mutator);
        //     return types;
        // }
        reduceMutator(_mutator) {
            delete _mutator.world;
            super.reduceMutator(_mutator);
        }
    }
    FudgeCore.ComponentTransform = ComponentTransform;
})(FudgeCore || (FudgeCore = {}));
// <reference path="DebugAlert.ts"/>
var FudgeCore;
// <reference path="DebugAlert.ts"/>
(function (FudgeCore) {
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
    })(DEBUG_FILTER = FudgeCore.DEBUG_FILTER || (FudgeCore.DEBUG_FILTER = {}));
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
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
    FudgeCore.DebugTarget = DebugTarget;
})(FudgeCore || (FudgeCore = {}));
/// <reference path="DebugTarget.ts"/>
var FudgeCore;
/// <reference path="DebugTarget.ts"/>
(function (FudgeCore) {
    /**
     * Routing to the alert box
     */
    class DebugAlert extends FudgeCore.DebugTarget {
        static createDelegate(_headline) {
            let delegate = function (_message, ..._args) {
                let out = _headline + "\n\n" + FudgeCore.DebugTarget.mergeArguments(_message, ..._args);
                alert(out);
            };
            return delegate;
        }
    }
    DebugAlert.delegates = {
        [FudgeCore.DEBUG_FILTER.INFO]: DebugAlert.createDelegate("Info"),
        [FudgeCore.DEBUG_FILTER.LOG]: DebugAlert.createDelegate("Log"),
        [FudgeCore.DEBUG_FILTER.WARN]: DebugAlert.createDelegate("Warn"),
        [FudgeCore.DEBUG_FILTER.ERROR]: DebugAlert.createDelegate("Error")
    };
    FudgeCore.DebugAlert = DebugAlert;
})(FudgeCore || (FudgeCore = {}));
/// <reference path="DebugTarget.ts"/>
var FudgeCore;
/// <reference path="DebugTarget.ts"/>
(function (FudgeCore) {
    /**
     * Routing to the standard-console
     */
    class DebugConsole extends FudgeCore.DebugTarget {
    }
    DebugConsole.delegates = {
        [FudgeCore.DEBUG_FILTER.INFO]: console.info,
        [FudgeCore.DEBUG_FILTER.LOG]: console.log,
        [FudgeCore.DEBUG_FILTER.WARN]: console.warn,
        [FudgeCore.DEBUG_FILTER.ERROR]: console.error
    };
    FudgeCore.DebugConsole = DebugConsole;
})(FudgeCore || (FudgeCore = {}));
/// <reference path="DebugInterfaces.ts"/>
/// <reference path="DebugAlert.ts"/>
/// <reference path="DebugConsole.ts"/>
var FudgeCore;
/// <reference path="DebugInterfaces.ts"/>
/// <reference path="DebugAlert.ts"/>
/// <reference path="DebugConsole.ts"/>
(function (FudgeCore) {
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
            for (let filter in FudgeCore.DEBUG_FILTER) {
                let parsed = parseInt(filter);
                if (parsed == FudgeCore.DEBUG_FILTER.ALL)
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
            Debug.delegate(FudgeCore.DEBUG_FILTER.INFO, _message, _args);
        }
        /**
         * Debug function to be implemented by the DebugTarget.
         * log(...) displays information with medium priority
         * @param _message
         * @param _args
         */
        static log(_message, ..._args) {
            Debug.delegate(FudgeCore.DEBUG_FILTER.LOG, _message, _args);
        }
        /**
         * Debug function to be implemented by the DebugTarget.
         * warn(...) displays information about non-conformities in usage, which is emphasized e.g. by color
         * @param _message
         * @param _args
         */
        static warn(_message, ..._args) {
            Debug.delegate(FudgeCore.DEBUG_FILTER.WARN, _message, _args);
        }
        /**
         * Debug function to be implemented by the DebugTarget.
         * error(...) displays critical information about failures, which is emphasized e.g. by color
         * @param _message
         * @param _args
         */
        static error(_message, ..._args) {
            Debug.delegate(FudgeCore.DEBUG_FILTER.ERROR, _message, _args);
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
        [FudgeCore.DEBUG_FILTER.INFO]: new Map([[FudgeCore.DebugConsole, FudgeCore.DebugConsole.delegates[FudgeCore.DEBUG_FILTER.INFO]]]),
        [FudgeCore.DEBUG_FILTER.LOG]: new Map([[FudgeCore.DebugConsole, FudgeCore.DebugConsole.delegates[FudgeCore.DEBUG_FILTER.LOG]]]),
        [FudgeCore.DEBUG_FILTER.WARN]: new Map([[FudgeCore.DebugConsole, FudgeCore.DebugConsole.delegates[FudgeCore.DEBUG_FILTER.WARN]]]),
        [FudgeCore.DEBUG_FILTER.ERROR]: new Map([[FudgeCore.DebugConsole, FudgeCore.DebugConsole.delegates[FudgeCore.DEBUG_FILTER.ERROR]]])
    };
    FudgeCore.Debug = Debug;
})(FudgeCore || (FudgeCore = {}));
/// <reference path="DebugTarget.ts"/>
var FudgeCore;
/// <reference path="DebugTarget.ts"/>
(function (FudgeCore) {
    /**
     * Routing to a HTMLDialogElement
     */
    class DebugDialog extends FudgeCore.DebugTarget {
    }
    FudgeCore.DebugDialog = DebugDialog;
})(FudgeCore || (FudgeCore = {}));
/// <reference path="DebugTarget.ts"/>
var FudgeCore;
/// <reference path="DebugTarget.ts"/>
(function (FudgeCore) {
    /**
     * Route to an HTMLTextArea, may be obsolete when using HTMLDialogElement
     */
    class DebugTextArea extends FudgeCore.DebugTarget {
        static createDelegate(_headline) {
            let delegate = function (_message, ..._args) {
                let out = _headline + "\n\n" + FudgeCore.DebugTarget.mergeArguments(_message, _args);
                DebugTextArea.textArea.textContent += out;
            };
            return delegate;
        }
    }
    DebugTextArea.textArea = document.createElement("textarea");
    DebugTextArea.delegates = {
        [FudgeCore.DEBUG_FILTER.INFO]: FudgeCore.DebugAlert.createDelegate("Info")
    };
    FudgeCore.DebugTextArea = DebugTextArea;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Defines a color as values in the range of 0 to 1 for the four channels red, green, blue and alpha (for opacity)
     */
    class Color extends FudgeCore.Mutable {
        constructor(_r = 1, _g = 1, _b = 1, _a = 1) {
            super();
            this.setNormRGBA(_r, _g, _b, _a);
        }
        static get BLACK() {
            return new Color(0, 0, 0, 1);
        }
        static get WHITE() {
            return new Color(1, 1, 1, 1);
        }
        static get RED() {
            return new Color(1, 0, 0, 1);
        }
        static get GREEN() {
            return new Color(0, 1, 0, 1);
        }
        static get BLUE() {
            return new Color(0, 0, 1, 1);
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
        reduceMutator(_mutator) { }
    }
    FudgeCore.Color = Color;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Baseclass for materials. Combines a [[Shader]] with a compatible [[Coat]]
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Material {
        constructor(_name, _shader, _coat) {
            this.idResource = undefined;
            this.name = _name;
            this.shaderType = _shader;
            if (_shader) {
                if (_coat)
                    this.setCoat(_coat);
                else
                    this.setCoat(this.createCoatMatchingShader());
            }
        }
        /**
         * Creates a new [[Coat]] instance that is valid for the [[Shader]] referenced by this material
         */
        createCoatMatchingShader() {
            let coat = new (this.shaderType.getCoat())();
            return coat;
        }
        /**
         * Makes this material reference the given [[Coat]] if it is compatible with the referenced [[Shader]]
         * @param _coat
         */
        setCoat(_coat) {
            if (_coat.constructor != this.shaderType.getCoat())
                throw (new Error("Shader and coat don't match"));
            this.coat = _coat;
        }
        /**
         * Returns the currently referenced [[Coat]] instance
         */
        getCoat() {
            return this.coat;
        }
        /**
         * Changes the materials reference to the given [[Shader]], creates and references a new [[Coat]] instance
         * and mutates the new coat to preserve matching properties.
         * @param _shaderType
         */
        setShader(_shaderType) {
            this.shaderType = _shaderType;
            let coat = this.createCoatMatchingShader();
            coat.mutate(this.coat.getMutator());
        }
        /**
         * Returns the [[Shader]] referenced by this material
         */
        getShader() {
            return this.shaderType;
        }
        //#region Transfer
        // TODO: this type of serialization was implemented for implicit Material create. Check if obsolete when only one material class exists and/or materials are stored separately
        serialize() {
            let serialization = {
                name: this.name,
                idResource: this.idResource,
                shader: this.shaderType.name,
                coat: FudgeCore.Serializer.serialize(this.coat)
            };
            return serialization;
        }
        deserialize(_serialization) {
            this.name = _serialization.name;
            this.idResource = _serialization.idResource;
            // TODO: provide for shaders in the users namespace. See Serializer fullpath etc.
            // tslint:disable-next-line: no-any
            this.shaderType = FudgeCore[_serialization.shader];
            let coat = FudgeCore.Serializer.deserialize(_serialization.coat);
            this.setCoat(coat);
            return this;
        }
    }
    FudgeCore.Material = Material;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Keeps a depot of objects that have been marked for reuse, sorted by type.
     * Using [[Recycler]] reduces load on the carbage collector and thus supports smooth performance
     */
    class Recycler {
        /**
         * Returns an object of the requested type from the depot, or a new one, if the depot was empty
         * @param _T The class identifier of the desired object
         */
        static get(_T) {
            let key = _T.name;
            let instances = Recycler.depot[key];
            if (instances && instances.length > 0)
                return instances.pop();
            else
                return new _T();
        }
        /**
         * Stores the object in the depot for later recycling. Users are responsible for throwing in objects that are about to loose scope and are not referenced by any other
         * @param _instance
         */
        static store(_instance) {
            let key = _instance.constructor.name;
            //Debug.log(key);
            let instances = Recycler.depot[key] || [];
            instances.push(_instance);
            Recycler.depot[key] = instances;
            // Debug.log(`ObjectManager.depot[${key}]: ${ObjectManager.depot[key].length}`);
            //Debug.log(this.depot);
        }
        /**
         * Emptys the depot of a given type, leaving the objects for the garbage collector. May result in a short stall when many objects were in
         * @param _T
         */
        static dump(_T) {
            let key = _T.name;
            Recycler.depot[key] = [];
        }
        /**
         * Emptys all depots, leaving all objects to the garbage collector. May result in a short stall when many objects were in
         */
        static dumpAll() {
            Recycler.depot = {};
        }
    }
    Recycler.depot = {};
    FudgeCore.Recycler = Recycler;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Static class handling the resources used with the current FUDGE-instance.
     * Keeps a list of the resources and generates ids to retrieve them.
     * Resources are objects referenced multiple times but supposed to be stored only once
     */
    class ResourceManager {
        /**
         * Generates an id for the resources and registers it with the list of resources
         * @param _resource
         */
        static register(_resource) {
            if (!_resource.idResource)
                _resource.idResource = ResourceManager.generateId(_resource);
            ResourceManager.resources[_resource.idResource] = _resource;
        }
        /**
         * Generate a user readable and unique id using the type of the resource, the date and random numbers
         * @param _resource
         */
        static generateId(_resource) {
            // TODO: build id and integrate info from resource, not just date
            let idResource;
            do
                idResource = _resource.constructor.name + "|" + new Date().toISOString() + "|" + Math.random().toPrecision(5).substr(2, 5);
            while (ResourceManager.resources[idResource]);
            return idResource;
        }
        /**
         * Tests, if an object is a [[SerializableResource]]
         * @param _object The object to examine
         */
        static isResource(_object) {
            return (Reflect.has(_object, "idResource"));
        }
        /**
         * Retrieves the resource stored with the given id
         * @param _idResource
         */
        static get(_idResource) {
            let resource = ResourceManager.resources[_idResource];
            if (!resource) {
                let serialization = ResourceManager.serialization[_idResource];
                if (!serialization) {
                    FudgeCore.Debug.error("Resource not found", _idResource);
                    return null;
                }
                resource = ResourceManager.deserializeResource(serialization);
            }
            return resource;
        }
        /**
         * Creates and registers a resource from a [[Node]], copying the complete branch starting with it
         * @param _node A node to create the resource from
         * @param _replaceWithInstance if true (default), the node used as origin is replaced by a [[NodeResourceInstance]] of the [[NodeResource]] created
         */
        static registerNodeAsResource(_node, _replaceWithInstance = true) {
            let serialization = _node.serialize();
            let nodeResource = new FudgeCore.NodeResource("NodeResource");
            nodeResource.deserialize(serialization);
            ResourceManager.register(nodeResource);
            if (_replaceWithInstance && _node.getParent()) {
                let instance = new FudgeCore.NodeResourceInstance(nodeResource);
                _node.getParent().replaceChild(_node, instance);
            }
            return nodeResource;
        }
        /**
         * Serialize all resources
         */
        static serialize() {
            let serialization = {};
            for (let idResource in ResourceManager.resources) {
                let resource = ResourceManager.resources[idResource];
                if (idResource != resource.idResource)
                    FudgeCore.Debug.error("Resource-id mismatch", resource);
                serialization[idResource] = FudgeCore.Serializer.serialize(resource);
            }
            return serialization;
        }
        /**
         * Create resources from a serialization, deleting all resources previously registered
         * @param _serialization
         */
        static deserialize(_serialization) {
            ResourceManager.serialization = _serialization;
            ResourceManager.resources = {};
            for (let idResource in _serialization) {
                let serialization = _serialization[idResource];
                let resource = ResourceManager.deserializeResource(serialization);
                if (resource)
                    ResourceManager.resources[idResource] = resource;
            }
            return ResourceManager.resources;
        }
        static deserializeResource(_serialization) {
            return FudgeCore.Serializer.deserialize(_serialization);
        }
    }
    ResourceManager.resources = {};
    ResourceManager.serialization = null;
    FudgeCore.ResourceManager = ResourceManager;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Baseclass for different kinds of lights.
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Light extends FudgeCore.Mutable {
        constructor(_color = new FudgeCore.Color(1, 1, 1, 1)) {
            super();
            this.color = _color;
        }
        reduceMutator() { }
    }
    FudgeCore.Light = Light;
    /**
     * Ambient light, coming from all directions, illuminating everything with its color independent of position and orientation (like a foggy day or in the shades)
     * ```plaintext
     * ~ ~ ~
     *  ~ ~ ~
     * ```
     */
    class LightAmbient extends Light {
        constructor(_color = new FudgeCore.Color(1, 1, 1, 1)) {
            super(_color);
        }
    }
    FudgeCore.LightAmbient = LightAmbient;
    /**
     * Directional light, illuminating everything from a specified direction with its color (like standing in bright sunlight)
     * ```plaintext
     * --->
     * --->
     * --->
     * ```
     */
    class LightDirectional extends Light {
        constructor(_color = new FudgeCore.Color(1, 1, 1, 1), _direction = new FudgeCore.Vector3(0, -1, 0)) {
            super(_color);
            this.direction = new FudgeCore.Vector3(0, -1, 0);
            this.direction = _direction;
        }
    }
    FudgeCore.LightDirectional = LightDirectional;
    /**
     * Omnidirectional light emitting from its position, illuminating objects depending on their position and distance with its color (like a colored light bulb)
     * ```plaintext
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
    FudgeCore.LightPoint = LightPoint;
    /**
     * Spot light emitting within a specified angle from its position, illuminating objects depending on their position and distance with its color
     * ```plaintext
     *          o
     *         /|\
     *        / | \
     * ```
     */
    class LightSpot extends Light {
    }
    FudgeCore.LightSpot = LightSpot;
})(FudgeCore || (FudgeCore = {}));
/// <reference path="../Light/Light.ts"/>
/// <reference path="../Component/ComponentLight.ts"/>
var FudgeCore;
/// <reference path="../Light/Light.ts"/>
/// <reference path="../Component/ComponentLight.ts"/>
(function (FudgeCore) {
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
            this.frameClientToCanvas = new FudgeCore.FramingScaled();
            this.frameCanvasToDestination = new FudgeCore.FramingComplex();
            this.frameDestinationToSource = new FudgeCore.FramingScaled();
            this.frameSourceToRender = new FudgeCore.FramingScaled();
            this.adjustingFrames = true;
            this.adjustingCamera = true;
            this.lights = null;
            this.branch = null; // The first node in the tree(branch) that will be rendered.
            this.crc2 = null;
            this.canvas = null;
            this.pickBuffers = [];
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
                let event = new FudgeCore.DragDropEventƒ("ƒ" + _event.type, _dragevent);
                this.addCanvasPosition(event);
                this.dispatchEvent(event);
            };
            /**
             * Handle pointer events and dispatch to viewport as FUDGE-Event
             */
            this.hndPointerEvent = (_event) => {
                let event = new FudgeCore.PointerEventƒ("ƒ" + _event.type, _event);
                this.addCanvasPosition(event);
                this.dispatchEvent(event);
            };
            /**
             * Handle keyboard events and dispatch to viewport as FUDGE-Event, if the viewport has the focus
             */
            this.hndKeyboardEvent = (_event) => {
                if (!this.hasFocus)
                    return;
                let event = new FudgeCore.KeyboardEventƒ("ƒ" + _event.type, _event);
                this.dispatchEvent(event);
            };
            /**
             * Handle wheel event and dispatch to viewport as FUDGE-Event
             */
            this.hndWheelEvent = (_event) => {
                let event = new FudgeCore.WheelEventƒ("ƒ" + _event.type, _event);
                this.dispatchEvent(event);
            };
        }
        /**
         * Connects the viewport to the given canvas to render the given branch to using the given camera-component, and names the viewport as given.
         * @param _name
         * @param _branch
         * @param _camera
         * @param _canvas
         */
        initialize(_name, _branch, _camera, _canvas) {
            this.name = _name;
            this.camera = _camera;
            this.canvas = _canvas;
            this.crc2 = _canvas.getContext("2d");
            this.rectSource = FudgeCore.RenderManager.getCanvasRect();
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
            return FudgeCore.Rectangle.GET(0, 0, this.canvas.width, this.canvas.height);
        }
        /**
         * Retrieve the client rectangle the canvas is displayed and fit in, x and y are always 0
         */
        getClientRectangle() {
            return FudgeCore.Rectangle.GET(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
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
         * Logs this viewports scenegraph to the console.
         */
        showSceneGraph() {
            // TODO: move to debug-class
            let output = "SceneGraph for this viewport:";
            output += "\n \n";
            output += this.branch.name;
            FudgeCore.Debug.log(output + "   => ROOTNODE" + this.createSceneGraph(this.branch));
        }
        // #region Drawing
        /**
         * Draw this viewport
         */
        draw() {
            FudgeCore.RenderManager.resetFrameBuffer();
            if (!this.camera.isActive)
                return;
            if (this.adjustingFrames)
                this.adjustFrames();
            if (this.adjustingCamera)
                this.adjustCamera();
            FudgeCore.RenderManager.clear(this.camera.getBackgoundColor());
            if (FudgeCore.RenderManager.addBranch(this.branch))
                // branch has not yet been processed fully by rendermanager -> update all registered nodes
                FudgeCore.RenderManager.update();
            FudgeCore.RenderManager.setLights(this.lights);
            FudgeCore.RenderManager.drawBranch(this.branch, this.camera);
            this.crc2.imageSmoothingEnabled = false;
            this.crc2.drawImage(FudgeCore.RenderManager.getCanvas(), this.rectSource.x, this.rectSource.y, this.rectSource.width, this.rectSource.height, this.rectDestination.x, this.rectDestination.y, this.rectDestination.width, this.rectDestination.height);
        }
        /**
        * Draw this viewport for RayCast
        */
        createPickBuffers() {
            if (this.adjustingFrames)
                this.adjustFrames();
            if (this.adjustingCamera)
                this.adjustCamera();
            if (FudgeCore.RenderManager.addBranch(this.branch))
                // branch has not yet been processed fully by rendermanager -> update all registered nodes
                FudgeCore.RenderManager.update();
            this.pickBuffers = FudgeCore.RenderManager.drawBranchForRayCast(this.branch, this.camera);
            this.crc2.imageSmoothingEnabled = false;
            this.crc2.drawImage(FudgeCore.RenderManager.getCanvas(), this.rectSource.x, this.rectSource.y, this.rectSource.width, this.rectSource.height, this.rectDestination.x, this.rectDestination.y, this.rectDestination.width, this.rectDestination.height);
        }
        pickNodeAt(_pos) {
            // this.createPickBuffers();
            let hits = FudgeCore.RenderManager.pickNodeAt(_pos, this.pickBuffers, this.rectSource);
            hits.sort((a, b) => (b.zBuffer > 0) ? (a.zBuffer > 0) ? a.zBuffer - b.zBuffer : 1 : -1);
            return hits;
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
            FudgeCore.RenderManager.setViewportRectangle(rectRender);
            // no more transformation after this for now, offscreen canvas and render-viewport have the same size
            FudgeCore.RenderManager.setCanvasSize(rectRender.width, rectRender.height);
        }
        /**
         * Adjust the camera parameters to fit the rendering into the render vieport
         */
        adjustCamera() {
            let rect = FudgeCore.RenderManager.getViewportRectangle();
            this.camera.projectCentral(rect.width / rect.height, this.camera.getFieldOfView());
        }
        // #endregion
        //#region Points
        pointClientToSource(_client) {
            let result;
            let rect;
            rect = this.getClientRectangle();
            result = this.frameClientToCanvas.getPoint(_client, rect);
            rect = this.getCanvasRectangle();
            result = this.frameCanvasToDestination.getPoint(result, rect);
            result = this.frameDestinationToSource.getPoint(result, this.rectSource);
            //TODO: when Source, Render and RenderViewport deviate, continue transformation 
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
            //TODO: when Render and RenderViewport deviate, continue transformation 
            return point;
        }
        //#endregion
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
            FudgeCore.Debug.log(_event);
        }
        // #endregion
        /**
         * Collect all lights in the branch to pass to shaders
         */
        collectLights() {
            // TODO: make private
            this.lights = new Map();
            for (let node of this.branch.branch) {
                let cmpLights = node.getComponents(FudgeCore.ComponentLight);
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
    FudgeCore.Viewport = Viewport;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class PointerEventƒ extends PointerEvent {
        constructor(type, _event) {
            super(type, _event);
            let target = _event.target;
            this.clientRect = target.getClientRects()[0];
            this.pointerX = _event.clientX - this.clientRect.left;
            this.pointerY = _event.clientY - this.clientRect.top;
        }
    }
    FudgeCore.PointerEventƒ = PointerEventƒ;
    class DragDropEventƒ extends DragEvent {
        constructor(type, _event) {
            super(type, _event);
            let target = _event.target;
            this.clientRect = target.getClientRects()[0];
            this.pointerX = _event.clientX - this.clientRect.left;
            this.pointerY = _event.clientY - this.clientRect.top;
        }
    }
    FudgeCore.DragDropEventƒ = DragDropEventƒ;
    class WheelEventƒ extends WheelEvent {
        constructor(type, _event) {
            super(type, _event);
        }
    }
    FudgeCore.WheelEventƒ = WheelEventƒ;
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
    FudgeCore.EventTargetStatic = EventTargetStatic;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class KeyboardEventƒ extends KeyboardEvent {
        constructor(type, _event) {
            super(type, _event);
        }
    }
    FudgeCore.KeyboardEventƒ = KeyboardEventƒ;
    /**
     * The codes sent from a standard english keyboard layout
     */
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
        //mac brings this buttton
        KEYBOARD_CODE["FN"] = "Fn";
        //Linux brings these
        KEYBOARD_CODE["AGAIN"] = "Again";
        KEYBOARD_CODE["PROPS"] = "Props";
        KEYBOARD_CODE["SELECT"] = "Select";
        KEYBOARD_CODE["OPEN"] = "Open";
        KEYBOARD_CODE["FIND"] = "Find";
        KEYBOARD_CODE["WAKE_UP"] = "WakeUp";
        KEYBOARD_CODE["NUMPAD_PARENT_LEFT"] = "NumpadParentLeft";
        KEYBOARD_CODE["NUMPAD_PARENT_RIGHT"] = "NumpadParentRight";
        //android
        KEYBOARD_CODE["SLEEP"] = "Sleep";
    })(KEYBOARD_CODE = FudgeCore.KEYBOARD_CODE || (FudgeCore.KEYBOARD_CODE = {}));
    /*
    Firefox can't make use of those buttons and Combinations:
    SINGELE_BUTTONS:
     Druck,
    COMBINATIONS:
     Shift + F10, Shift + Numpad5,
     CTRL + q, CTRL + F4,
     ALT + F1, ALT + F2, ALT + F3, ALT + F7, ALT + F8, ALT + F10
    Opera won't do good with these Buttons and combinations:
    SINGLE_BUTTONS:
     Float32Array, F11, ALT,
    COMBINATIONS:
     CTRL + q, CTRL + t, CTRL + h, CTRL + g, CTRL + n, CTRL + f
     ALT + F1, ALT + F2, ALT + F4, ALT + F5, ALT + F6, ALT + F7, ALT + F8, ALT + F10
     */
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Framing describes how to map a rectangle into a given frame
     * and how points in the frame correspond to points in the resulting rectangle
     */
    class Framing extends FudgeCore.Mutable {
        reduceMutator(_mutator) { }
    }
    FudgeCore.Framing = Framing;
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
    FudgeCore.Matrix3x3 = Matrix3x3;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Stores a 4x4 transformation matrix and provides operations for it.
     * ```plaintext
     * [ 0, 1, 2, 3 ] ← row vector x
     * [ 4, 5, 6, 7 ] ← row vector y
     * [ 8, 9,10,11 ] ← row vector z
     * [12,13,14,15 ] ← translation
     *            ↑  homogeneous column
     * ```
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Matrix4x4 extends FudgeCore.Mutable {
        constructor() {
            super();
            this.data = new Float32Array(16); // The data of the matrix.
            this.mutator = null; // prepared for optimization, keep mutator to reduce redundant calculation and for comparison. Set to null when data changes!
            this.data.set([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ]);
            this.resetCache();
        }
        /**
         * - get: a copy of the calculated translation vector
         * - set: effect the matrix ignoring its rotation and scaling
         */
        get translation() {
            if (!this.vectors.translation)
                this.vectors.translation = new FudgeCore.Vector3(this.data[12], this.data[13], this.data[14]);
            return this.vectors.translation.copy;
        }
        set translation(_translation) {
            this.data.set(_translation.get(), 12);
            // no full cache reset required
            this.vectors.translation = _translation;
            this.mutator = null;
        }
        /**
         * - get: a copy of the calculated rotation vector
         * - set: effect the matrix
         */
        get rotation() {
            if (!this.vectors.rotation)
                this.vectors.rotation = this.getEulerAngles();
            return this.vectors.rotation.copy;
        }
        set rotation(_rotation) {
            this.mutate({ "rotation": _rotation });
            this.resetCache();
        }
        /**
         * - get: a copy of the calculated scale vector
         * - set: effect the matrix
         */
        get scaling() {
            if (!this.vectors.scaling)
                this.vectors.scaling = new FudgeCore.Vector3(Math.hypot(this.data[0], this.data[1], this.data[2]), Math.hypot(this.data[4], this.data[5], this.data[6]), Math.hypot(this.data[8], this.data[9], this.data[10]));
            return this.vectors.scaling.copy;
        }
        set scaling(_scaling) {
            this.mutate({ "scaling": _scaling });
            this.resetCache();
        }
        //#region STATICS
        /**
         * Retrieve a new identity matrix
         */
        static get IDENTITY() {
            // const result: Matrix4x4 = new Matrix4x4();
            const result = FudgeCore.Recycler.get(Matrix4x4);
            result.data.set([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ]);
            return result;
        }
        /**
         * Computes and returns the product of two passed matrices.
         * @param _a The matrix to multiply.
         * @param _b The matrix to multiply by.
         */
        static MULTIPLICATION(_a, _b) {
            let a = _a.data;
            let b = _b.data;
            // let matrix: Matrix4x4 = new Matrix4x4();
            const matrix = FudgeCore.Recycler.get(Matrix4x4);
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
            matrix.data.set([
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
         * @param _matrix The matrix to compute the inverse of.
         */
        static INVERSION(_matrix) {
            let m = _matrix.data;
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
            // let matrix: Matrix4x4 = new Matrix4x4;
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
                d * ((tmp22 * m22 + tmp16 * m02 + tmp21 * m12) - (tmp20 * m12 + tmp23 * m22 + tmp17 * m02)) // [15]
            ]);
            return matrix;
        }
        /**
         * Computes and returns a rotationmatrix that aligns a transformations z-axis with the vector between it and its target.
         * @param _transformPosition The x,y and z-coordinates of the object to rotate.
         * @param _targetPosition The position to look at.
         */
        static LOOK_AT(_transformPosition, _targetPosition, _up = FudgeCore.Vector3.Y()) {
            // const matrix: Matrix4x4 = new Matrix4x4;
            const matrix = FudgeCore.Recycler.get(Matrix4x4);
            let zAxis = FudgeCore.Vector3.DIFFERENCE(_transformPosition, _targetPosition);
            zAxis.normalize();
            let xAxis = FudgeCore.Vector3.NORMALIZATION(FudgeCore.Vector3.CROSS(_up, zAxis));
            let yAxis = FudgeCore.Vector3.NORMALIZATION(FudgeCore.Vector3.CROSS(zAxis, xAxis));
            matrix.data.set([
                xAxis.x, xAxis.y, xAxis.z, 0,
                yAxis.x, yAxis.y, yAxis.z, 0,
                zAxis.x, zAxis.y, zAxis.z, 0,
                _transformPosition.x,
                _transformPosition.y,
                _transformPosition.z,
                1
            ]);
            return matrix;
        }
        /**
         * Returns a matrix that translates coordinates along the x-, y- and z-axis according to the given vector.
         */
        static TRANSLATION(_translate) {
            // let matrix: Matrix4x4 = new Matrix4x4;
            const matrix = FudgeCore.Recycler.get(Matrix4x4);
            matrix.data.set([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                _translate.x, _translate.y, _translate.z, 1
            ]);
            return matrix;
        }
        /**
         * Returns a matrix that rotates coordinates on the x-axis when multiplied by.
         * @param _angleInDegrees The value of the rotation.
         */
        static ROTATION_X(_angleInDegrees) {
            // const matrix: Matrix4x4 = new Matrix4x4;
            const matrix = FudgeCore.Recycler.get(Matrix4x4);
            let angleInRadians = _angleInDegrees * Math.PI / 180;
            let sin = Math.sin(angleInRadians);
            let cos = Math.cos(angleInRadians);
            matrix.data.set([
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
        static ROTATION_Y(_angleInDegrees) {
            // const matrix: Matrix4x4 = new Matrix4x4;
            let matrix = FudgeCore.Recycler.get(Matrix4x4);
            let angleInRadians = _angleInDegrees * Math.PI / 180;
            let sin = Math.sin(angleInRadians);
            let cos = Math.cos(angleInRadians);
            matrix.data.set([
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
        static ROTATION_Z(_angleInDegrees) {
            // const matrix: Matrix4x4 = new Matrix4x4;
            const matrix = FudgeCore.Recycler.get(Matrix4x4);
            let angleInRadians = _angleInDegrees * Math.PI / 180;
            let sin = Math.sin(angleInRadians);
            let cos = Math.cos(angleInRadians);
            matrix.data.set([
                cos, sin, 0, 0,
                -sin, cos, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ]);
            return matrix;
        }
        /**
         * Returns a matrix that scales coordinates along the x-, y- and z-axis according to the given vector
         */
        static SCALING(_scalar) {
            // const matrix: Matrix4x4 = new Matrix4x4;
            const matrix = FudgeCore.Recycler.get(Matrix4x4);
            matrix.data.set([
                _scalar.x, 0, 0, 0,
                0, _scalar.y, 0, 0,
                0, 0, _scalar.z, 0,
                0, 0, 0, 1
            ]);
            return matrix;
        }
        //#endregion
        //#region PROJECTIONS
        /**
         * Computes and returns a matrix that applies perspective to an object, if its transform is multiplied by it.
         * @param _aspect The aspect ratio between width and height of projectionspace.(Default = canvas.clientWidth / canvas.ClientHeight)
         * @param _fieldOfViewInDegrees The field of view in Degrees. (Default = 45)
         * @param _near The near clipspace border on the z-axis.
         * @param _far The far clipspace border on the z-axis.
         * @param _direction The plane on which the fieldOfView-Angle is given
         */
        static PROJECTION_CENTRAL(_aspect, _fieldOfViewInDegrees, _near, _far, _direction) {
            let fieldOfViewInRadians = _fieldOfViewInDegrees * Math.PI / 180;
            let f = Math.tan(0.5 * (Math.PI - fieldOfViewInRadians));
            let rangeInv = 1.0 / (_near - _far);
            // const matrix: Matrix4x4 = new Matrix4x4;
            const matrix = FudgeCore.Recycler.get(Matrix4x4);
            matrix.data.set([
                f, 0, 0, 0,
                0, f, 0, 0,
                0, 0, (_near + _far) * rangeInv, -1,
                0, 0, _near * _far * rangeInv * 2, 0
            ]);
            if (_direction == FudgeCore.FIELD_OF_VIEW.DIAGONAL) {
                _aspect = Math.sqrt(_aspect);
                matrix.data[0] = f / _aspect;
                matrix.data[5] = f * _aspect;
            }
            else if (_direction == FudgeCore.FIELD_OF_VIEW.VERTICAL)
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
        static PROJECTION_ORTHOGRAPHIC(_left, _right, _bottom, _top, _near = -400, _far = 400) {
            // const matrix: Matrix4x4 = new Matrix4x4;
            const matrix = FudgeCore.Recycler.get(Matrix4x4);
            matrix.data.set([
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
        //#endregion
        //#region Rotation
        /**
         * Adds a rotation around the x-Axis to this matrix
         */
        rotateX(_angleInDegrees) {
            const matrix = Matrix4x4.MULTIPLICATION(this, Matrix4x4.ROTATION_X(_angleInDegrees));
            this.set(matrix);
            FudgeCore.Recycler.store(matrix);
        }
        /**
         * Adds a rotation around the y-Axis to this matrix
         */
        rotateY(_angleInDegrees) {
            const matrix = Matrix4x4.MULTIPLICATION(this, Matrix4x4.ROTATION_Y(_angleInDegrees));
            this.set(matrix);
            FudgeCore.Recycler.store(matrix);
        }
        /**
         * Adds a rotation around the z-Axis to this matrix
         */
        rotateZ(_angleInDegrees) {
            const matrix = Matrix4x4.MULTIPLICATION(this, Matrix4x4.ROTATION_Z(_angleInDegrees));
            this.set(matrix);
            FudgeCore.Recycler.store(matrix);
        }
        /**
         * Adjusts the rotation of this matrix to face the given target and tilts it to accord with the given up vector
         */
        lookAt(_target, _up = FudgeCore.Vector3.Y()) {
            const matrix = Matrix4x4.LOOK_AT(this.translation, _target); // TODO: Handle rotation around z-axis
            this.set(matrix);
            FudgeCore.Recycler.store(matrix);
        }
        //#endregion
        //#region Translation
        /**
         * Add a translation by the given vector to this matrix
         */
        translate(_by) {
            const matrix = Matrix4x4.MULTIPLICATION(this, Matrix4x4.TRANSLATION(_by));
            // TODO: possible optimization, translation may alter mutator instead of deleting it.
            this.set(matrix);
            FudgeCore.Recycler.store(matrix);
        }
        /**
         * Add a translation along the x-Axis by the given amount to this matrix
         */
        translateX(_x) {
            this.data[12] += _x;
            this.mutator = null;
        }
        /**
         * Add a translation along the y-Axis by the given amount to this matrix
         */
        translateY(_y) {
            this.data[13] += _y;
            this.mutator = null;
        }
        /**
         * Add a translation along the y-Axis by the given amount to this matrix
         */
        translateZ(_z) {
            this.data[14] += _z;
            this.mutator = null;
        }
        //#endregion
        //#region Scaling
        /**
         * Add a scaling by the given vector to this matrix
         */
        scale(_by) {
            const matrix = Matrix4x4.MULTIPLICATION(this, Matrix4x4.SCALING(_by));
            this.set(matrix);
            FudgeCore.Recycler.store(matrix);
        }
        /**
         * Add a scaling along the x-Axis by the given amount to this matrix
         */
        scaleX(_by) {
            this.scale(new FudgeCore.Vector3(_by, 1, 1));
        }
        /**
         * Add a scaling along the y-Axis by the given amount to this matrix
         */
        scaleY(_by) {
            this.scale(new FudgeCore.Vector3(1, _by, 1));
        }
        /**
         * Add a scaling along the z-Axis by the given amount to this matrix
         */
        scaleZ(_by) {
            this.scale(new FudgeCore.Vector3(1, 1, _by));
        }
        //#endregion
        //#region Transformation
        /**
         * Multiply this matrix with the given matrix
         */
        multiply(_matrix) {
            this.set(Matrix4x4.MULTIPLICATION(this, _matrix));
            this.mutator = null;
        }
        //#endregion
        //#region Transfer
        /**
         * Calculates and returns the euler-angles representing the current rotation of this matrix
         */
        getEulerAngles() {
            let scaling = this.scaling;
            let s0 = this.data[0] / scaling.x;
            let s1 = this.data[1] / scaling.x;
            let s2 = this.data[2] / scaling.x;
            let s6 = this.data[6] / scaling.y;
            let s10 = this.data[10] / scaling.z;
            let sy = Math.hypot(s0, s1); // probably 2. param should be this.data[4] / scaling.y
            let singular = sy < 1e-6; // If
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
            let rotation = new FudgeCore.Vector3(x1, y1, z1);
            rotation.scale(180 / Math.PI);
            return rotation;
        }
        /**
         * Sets the elements of this matrix to the values of the given matrix
         */
        set(_to) {
            // this.data = _to.get();
            this.data.set(_to.data);
            this.resetCache();
        }
        /**
         * Return the elements of this matrix as a Float32Array
         */
        get() {
            return new Float32Array(this.data);
        }
        serialize() {
            // TODO: save translation, rotation and scale as vectors for readability and manipulation
            let serialization = this.getMutator();
            return serialization;
        }
        deserialize(_serialization) {
            this.mutate(_serialization);
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
            // cache mutator
            this.mutator = mutator;
            return mutator;
        }
        mutate(_mutator) {
            let oldTranslation = this.translation;
            let oldRotation = this.rotation;
            let oldScaling = this.scaling;
            let newTranslation = _mutator["translation"];
            let newRotation = _mutator["rotation"];
            let newScaling = _mutator["scaling"];
            let vectors = { translation: null, rotation: null, scaling: null };
            if (newTranslation) {
                vectors.translation = new FudgeCore.Vector3(newTranslation.x != undefined ? newTranslation.x : oldTranslation.x, newTranslation.y != undefined ? newTranslation.y : oldTranslation.y, newTranslation.z != undefined ? newTranslation.z : oldTranslation.z);
            }
            if (newRotation) {
                vectors.rotation = new FudgeCore.Vector3(newRotation.x != undefined ? newRotation.x : oldRotation.x, newRotation.y != undefined ? newRotation.y : oldRotation.y, newRotation.z != undefined ? newRotation.z : oldRotation.z);
            }
            if (newScaling) {
                vectors.scaling = new FudgeCore.Vector3(newScaling.x != undefined ? newScaling.x : oldScaling.x, newScaling.y != undefined ? newScaling.y : oldScaling.y, newScaling.z != undefined ? newScaling.z : oldScaling.z);
            }
            // TODO: possible performance optimization when only one or two components change, then use old matrix instead of IDENTITY and transform by differences/quotients
            let matrix = Matrix4x4.IDENTITY;
            if (vectors.translation)
                matrix.translate(vectors.translation);
            if (vectors.rotation) {
                matrix.rotateZ(vectors.rotation.z);
                matrix.rotateY(vectors.rotation.y);
                matrix.rotateX(vectors.rotation.x);
            }
            if (vectors.scaling)
                matrix.scale(vectors.scaling);
            this.set(matrix);
            this.vectors = vectors;
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
    //#endregion
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Defines the origin of a rectangle
     */
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
    /**
     * Defines a rectangle with position and size and add comfortable methods to it
     * @author Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Rectangle extends FudgeCore.Mutable {
        constructor(_x = 0, _y = 0, _width = 1, _height = 1, _origin = ORIGIN2D.TOPLEFT) {
            super();
            this.position = FudgeCore.Recycler.get(FudgeCore.Vector2);
            this.size = FudgeCore.Recycler.get(FudgeCore.Vector2);
            this.setPositionAndSize(_x, _y, _width, _height, _origin);
        }
        /**
         * Returns a new rectangle created with the given parameters
         */
        static GET(_x = 0, _y = 0, _width = 1, _height = 1, _origin = ORIGIN2D.TOPLEFT) {
            let rect = FudgeCore.Recycler.get(Rectangle);
            rect.setPositionAndSize(_x, _y, _width, _height);
            return rect;
        }
        /**
         * Sets the position and size of the rectangle according to the given parameters
         */
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
            return this.position.x;
        }
        get top() {
            return this.position.y;
        }
        get right() {
            return this.position.x + this.size.x;
        }
        get bottom() {
            return this.position.y + this.size.y;
        }
        set x(_x) {
            this.position.x = _x;
        }
        set y(_y) {
            this.position.y = _y;
        }
        set width(_width) {
            this.position.x = _width;
        }
        set height(_height) {
            this.position.y = _height;
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
        /**
         * Returns true if the given point is inside of this rectangle or on the border
         * @param _point
         */
        isInside(_point) {
            return (_point.x >= this.left && _point.x <= this.right && _point.y >= this.top && _point.y <= this.bottom);
        }
        reduceMutator(_mutator) { }
    }
    FudgeCore.Rectangle = Rectangle;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Stores and manipulates a twodimensional vector comprised of the components x and y
     * ```plaintext
     *            +y
     *             |__ +x
     * ```
     * @authors Lukas Scheuerle, HFU, 2019
     */
    class Vector2 extends FudgeCore.Mutable {
        constructor(_x = 0, _y = 0) {
            super();
            this.data = new Float32Array([_x, _y]);
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
        /**
         * A shorthand for writing `new Vector2(0, 0)`.
         * @returns A new vector with the values (0, 0)
         */
        static get ZERO() {
            let vector = new Vector2();
            return vector;
        }
        /**
         * A shorthand for writing `new Vector2(_scale, _scale)`.
         */
        static ONE(_scale = 1) {
            let vector = new Vector2(_scale, _scale);
            return vector;
        }
        /**
         * A shorthand for writing `new Vector2(0, 1)`.
         * @returns A new vector with the values (0, 1)
         */
        static get UP() {
            let vector = new Vector2(0, 1);
            return vector;
        }
        /**
         * A shorthand for writing `new Vector2(0, -1)`.
         * @returns A new vector with the values (0, -1)
         */
        static get DOWN() {
            let vector = new Vector2(0, -1);
            return vector;
        }
        /**
         * A shorthand for writing `new Vector2(1, 0)`.
         * @returns A new vector with the values (1, 0)
         */
        static get RIGHT() {
            let vector = new Vector2(1, 0);
            return vector;
        }
        /**
         * A shorthand for writing `new Vector2(-1, 0)`.
         * @returns A new vector with the values (-1, 0)
         */
        static get LEFT() {
            let vector = new Vector2(-1, 0);
            return vector;
        }
        /**
         * Normalizes a given vector to the given length without editing the original vector.
         * @param _vector the vector to normalize
         * @param _length the length of the resulting vector. defaults to 1
         * @returns a new vector representing the normalised vector scaled by the given length
         */
        static NORMALIZATION(_vector, _length = 1) {
            let vector = Vector2.ZERO;
            try {
                let [x, y] = _vector.data;
                let factor = _length / Math.hypot(x, y);
                vector.data = new Float32Array([_vector.x * factor, _vector.y * factor]);
            }
            catch (_e) {
                console.warn(_e);
            }
            return vector;
        }
        /**
         * Scales a given vector by a given scale without changing the original vector
         * @param _vector The vector to scale.
         * @param _scale The scale to scale with.
         * @returns A new vector representing the scaled version of the given vector
         */
        static SCALE(_vector, _scale) {
            let vector = new Vector2();
            return vector;
        }
        /**
         * Sums up multiple vectors.
         * @param _vectors A series of vectors to sum up
         * @returns A new vector representing the sum of the given vectors
         */
        static SUM(..._vectors) {
            let result = new Vector2();
            for (let vector of _vectors)
                result.data = new Float32Array([result.x + vector.x, result.y + vector.y]);
            return result;
        }
        /**
         * Subtracts two vectors.
         * @param _a The vector to subtract from.
         * @param _b The vector to subtract.
         * @returns A new vector representing the difference of the given vectors
         */
        static DIFFERENCE(_a, _b) {
            let vector = new Vector2;
            vector.data = new Float32Array([_a.x - _b.x, _a.y - _b.y]);
            return vector;
        }
        /**
         * Computes the dotproduct of 2 vectors.
         * @param _a The vector to multiply.
         * @param _b The vector to multiply by.
         * @returns A new vector representing the dotproduct of the given vectors
         */
        static DOT(_a, _b) {
            let scalarProduct = _a.x * _b.x + _a.y * _b.y;
            return scalarProduct;
        }
        /**
         * Returns the magnitude of a given vector.
         * If you only need to compare magnitudes of different vectors, you can compare squared magnitudes using Vector2.MAGNITUDESQR instead.
         * @see Vector2.MAGNITUDESQR
         * @param _vector The vector to get the magnitude of.
         * @returns A number representing the magnitude of the given vector.
         */
        static MAGNITUDE(_vector) {
            let magnitude = Math.sqrt(Vector2.MAGNITUDESQR(_vector));
            return magnitude;
        }
        /**
         * Returns the squared magnitude of a given vector. Much less calculation intensive than Vector2.MAGNITUDE, should be used instead if possible.
         * @param _vector The vector to get the squared magnitude of.
         * @returns A number representing the squared magnitude of the given vector.
         */
        static MAGNITUDESQR(_vector) {
            let magnitude = Vector2.DOT(_vector, _vector);
            return magnitude;
        }
        /**
         * Calculates the cross product of two Vectors. Due to them being only 2 Dimensional, the result is a single number,
         * which implicitly is on the Z axis. It is also the signed magnitude of the result.
         * @param _a Vector to compute the cross product on
         * @param _b Vector to compute the cross product with
         * @returns A number representing result of the cross product.
         */
        static CROSSPRODUCT(_a, _b) {
            let crossProduct = _a.x * _b.y - _a.y * _b.x;
            return crossProduct;
        }
        /**
         * Calculates the orthogonal vector to the given vector. Rotates counterclockwise by default.
         * ```plaintext
         *    ^                |
         *    |  =>  <--  =>   v  =>  -->
         * ```
         * @param _vector Vector to get the orthogonal equivalent of
         * @param _clockwise Should the rotation be clockwise instead of the default counterclockwise? default: false
         * @returns A Vector that is orthogonal to and has the same magnitude as the given Vector.
         */
        static ORTHOGONAL(_vector, _clockwise = false) {
            if (_clockwise)
                return new Vector2(_vector.y, -_vector.x);
            else
                return new Vector2(-_vector.y, _vector.x);
        }
        /**
         * Adds the given vector to the executing vector, changing the executor.
         * @param _addend The vector to add.
         */
        add(_addend) {
            this.data = new Vector2(_addend.x + this.x, _addend.y + this.y).data;
        }
        /**
         * Subtracts the given vector from the executing vector, changing the executor.
         * @param _subtrahend The vector to subtract.
         */
        subtract(_subtrahend) {
            this.data = new Vector2(this.x - _subtrahend.x, this.y - _subtrahend.y).data;
        }
        /**
         * Scales the Vector by the _scale.
         * @param _scale The scale to multiply the vector with.
         */
        scale(_scale) {
            this.data = new Vector2(_scale * this.x, _scale * this.y).data;
        }
        /**
         * Normalizes the vector.
         * @param _length A modificator to get a different length of normalized vector.
         */
        normalize(_length = 1) {
            this.data = Vector2.NORMALIZATION(this, _length).data;
        }
        /**
         * Sets the Vector to the given parameters. Ommitted parameters default to 0.
         * @param _x new x to set
         * @param _y new y to set
         */
        set(_x = 0, _y = 0) {
            this.data = new Float32Array([_x, _y]);
        }
        /**
         * Checks whether the given Vector is equal to the executed Vector.
         * @param _vector The vector to comapre with.
         * @returns true if the two vectors are equal, otherwise false
         */
        equals(_vector) {
            if (this.data[0] == _vector.data[0] && this.data[1] == _vector.data[1])
                return true;
            return false;
        }
        /**
         * @returns An array of the data of the vector
         */
        get() {
            return new Float32Array(this.data);
        }
        /**
         * @returns A deep copy of the vector.
         */
        get copy() {
            return new Vector2(this.x, this.y);
        }
        /**
         * Adds a z-component to the vector and returns a new Vector3
         */
        toVector3() {
            return new FudgeCore.Vector3(this.x, this.y, 0);
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
    /**
     * Stores and manipulates a threedimensional vector comprised of the components x, y and z
     * ```plaintext
     *            +y
     *             |__ +x
     *            /
     *          +z
     * ```
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Vector3 extends FudgeCore.Mutable {
        constructor(_x = 0, _y = 0, _z = 0) {
            super();
            this.data = new Float32Array([_x, _y, _z]);
        }
        // TODO: implement equals-functions
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
        static X(_scale = 1) {
            const vector = new Vector3(_scale, 0, 0);
            return vector;
        }
        static Y(_scale = 1) {
            const vector = new Vector3(0, _scale, 0);
            return vector;
        }
        static Z(_scale = 1) {
            const vector = new Vector3(0, 0, _scale);
            return vector;
        }
        static ZERO() {
            const vector = new Vector3(0, 0, 0);
            return vector;
        }
        static ONE(_scale = 1) {
            const vector = new Vector3(_scale, _scale, _scale);
            return vector;
        }
        static TRANSFORMATION(_vector, _matrix, _includeTranslation = true) {
            let result = new Vector3();
            let m = _matrix.get();
            let [x, y, z] = _vector.get();
            result.x = m[0] * x + m[4] * y + m[8] * z;
            result.y = m[1] * x + m[5] * y + m[9] * z;
            result.z = m[2] * x + m[6] * y + m[10] * z;
            if (_includeTranslation) {
                result.add(_matrix.translation);
            }
            return result;
        }
        static NORMALIZATION(_vector, _length = 1) {
            let vector = Vector3.ZERO();
            try {
                let [x, y, z] = _vector.data;
                let factor = _length / Math.hypot(x, y, z);
                vector.data = new Float32Array([_vector.x * factor, _vector.y * factor, _vector.z * factor]);
            }
            catch (_e) {
                FudgeCore.Debug.warn(_e);
            }
            return vector;
        }
        /**
         * Sums up multiple vectors.
         * @param _vectors A series of vectors to sum up
         * @returns A new vector representing the sum of the given vectors
         */
        static SUM(..._vectors) {
            let result = new Vector3();
            for (let vector of _vectors)
                result.data = new Float32Array([result.x + vector.x, result.y + vector.y, result.z + vector.z]);
            return result;
        }
        /**
         * Subtracts two vectors.
         * @param _a The vector to subtract from.
         * @param _b The vector to subtract.
         * @returns A new vector representing the difference of the given vectors
         */
        static DIFFERENCE(_a, _b) {
            let vector = new Vector3;
            vector.data = new Float32Array([_a.x - _b.x, _a.y - _b.y, _a.z - _b.z]);
            return vector;
        }
        /**
         * Returns a new vector representing the given vector scaled by the given scaling factor
         */
        static SCALE(_vector, _scaling) {
            let scaled = new Vector3();
            scaled.data = new Float32Array([_vector.x * _scaling, _vector.y * _scaling, _vector.z * _scaling]);
            return scaled;
        }
        /**
         * Computes the crossproduct of 2 vectors.
         * @param _a The vector to multiply.
         * @param _b The vector to multiply by.
         * @returns A new vector representing the crossproduct of the given vectors
         */
        static CROSS(_a, _b) {
            let vector = new Vector3;
            vector.data = new Float32Array([
                _a.y * _b.z - _a.z * _b.y,
                _a.z * _b.x - _a.x * _b.z,
                _a.x * _b.y - _a.y * _b.x
            ]);
            return vector;
        }
        /**
         * Computes the dotproduct of 2 vectors.
         * @param _a The vector to multiply.
         * @param _b The vector to multiply by.
         * @returns A new vector representing the dotproduct of the given vectors
         */
        static DOT(_a, _b) {
            let scalarProduct = _a.x * _b.x + _a.y * _b.y + _a.z * _b.z;
            return scalarProduct;
        }
        /**
         * Calculates and returns the reflection of the incoming vector at the given normal vector. The length of normal should be 1.
         *     __________________
         *           /|\
         * incoming / | \ reflection
         *         /  |  \
         *          normal
         *
         */
        static REFLECTION(_incoming, _normal) {
            let dot = -Vector3.DOT(_incoming, _normal);
            let reflection = Vector3.SUM(_incoming, Vector3.SCALE(_normal, 2 * dot));
            return reflection;
        }
        add(_addend) {
            this.data = new Vector3(_addend.x + this.x, _addend.y + this.y, _addend.z + this.z).data;
        }
        subtract(_subtrahend) {
            this.data = new Vector3(this.x - _subtrahend.x, this.y - _subtrahend.y, this.z - _subtrahend.z).data;
        }
        scale(_scale) {
            this.data = new Vector3(_scale * this.x, _scale * this.y, _scale * this.z).data;
        }
        normalize(_length = 1) {
            this.data = Vector3.NORMALIZATION(this, _length).data;
        }
        set(_x = 0, _y = 0, _z = 0) {
            this.data = new Float32Array([_x, _y, _z]);
        }
        get() {
            return new Float32Array(this.data);
        }
        get copy() {
            return new Vector3(this.x, this.y, this.z);
        }
        transform(_matrix, _includeTranslation = true) {
            this.data = Vector3.TRANSFORMATION(this, _matrix, _includeTranslation).data;
        }
        /**
         * Drops the z-component and returns a Vector2 consisting of the x- and y-components
         */
        toVector2() {
            return new FudgeCore.Vector2(this.x, this.y);
        }
        reflect(_normal) {
            const reflected = Vector3.REFLECTION(this, _normal);
            this.set(reflected.x, reflected.y, reflected.z);
            FudgeCore.Recycler.store(reflected);
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
    /**
     * Abstract base class for all meshes.
     * Meshes provide indexed vertices, the order of indices to create trigons and normals, and texture coordinates
     *
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Mesh {
        constructor() {
            this.idResource = undefined;
        }
        static getBufferSpecification() {
            return { size: 3, dataType: WebGL2RenderingContext.FLOAT, normalize: false, stride: 0, offset: 0 };
        }
        getVertexCount() {
            return this.vertices.length / Mesh.getBufferSpecification().size;
        }
        getIndexCount() {
            return this.indices.length;
        }
        // Serialize/Deserialize for all meshes that calculate without parameters
        serialize() {
            let serialization = {
                idResource: this.idResource
            }; // no data needed ...
            return serialization;
        }
        deserialize(_serialization) {
            this.create(); // TODO: must not be created, if an identical mesh already exists
            this.idResource = _serialization.idResource;
            return this;
        }
    }
    FudgeCore.Mesh = Mesh;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Generate a simple cube with edges of length 1, each face consisting of two trigons
     * ```plaintext
     *            4____7
     *           0/__3/|
     *            ||5_||6
     *           1|/_2|/
     * ```
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class MeshCube extends FudgeCore.Mesh {
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
    FudgeCore.MeshCube = MeshCube;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Generate a simple pyramid with edges at the base of length 1 and a height of 1. The sides consisting of one, the base of two trigons
     * ```plaintext
     *               4
     *              /\`.
     *            3/__\_\ 2
     *           0/____\/1
     * ```
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class MeshPyramid extends FudgeCore.Mesh {
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
                vertices.push(new FudgeCore.Vector3(this.vertices[v], this.vertices[v + 1], this.vertices[v + 2]));
            for (let i = 0; i < this.indices.length; i += 3) {
                let vertex = [this.indices[i], this.indices[i + 1], this.indices[i + 2]];
                let v0 = FudgeCore.Vector3.DIFFERENCE(vertices[vertex[0]], vertices[vertex[1]]);
                let v1 = FudgeCore.Vector3.DIFFERENCE(vertices[vertex[0]], vertices[vertex[2]]);
                let normal = FudgeCore.Vector3.NORMALIZATION(FudgeCore.Vector3.CROSS(v0, v1));
                let index = vertex[2] * 3;
                normals[index] = normal.x;
                normals[index + 1] = normal.y;
                normals[index + 2] = normal.z;
                // normals.push(normal.x, normal.y, normal.z);
            }
            normals.push(0, 0, 0);
            return new Float32Array(normals);
        }
    }
    FudgeCore.MeshPyramid = MeshPyramid;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Generate a simple quad with edges of length 1, the face consisting of two trigons
     * ```plaintext
     *        0 __ 3
     *         |__|
     *        1    2
     * ```
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class MeshQuad extends FudgeCore.Mesh {
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
        createVertices() {
            let vertices = new Float32Array([
                /*0*/ -1, 1, 0, /*1*/ -1, -1, 0, /*2*/ 1, -1, 0, /*3*/ 1, 1, 0
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
                // front
                /*0*/ 0, 0, /*1*/ 0, 1, /*2*/ 1, 1, /*3*/ 1, 0
            ]);
            return textureUVs;
        }
        createFaceNormals() {
            return new Float32Array([
                /*0*/ 0, 0, 1, /*1*/ 0, 0, 0, /*2*/ 0, 0, 0, /*3*/ 1, 0, 0
            ]);
        }
    }
    FudgeCore.MeshQuad = MeshQuad;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
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
            this.mtxWorld = FudgeCore.Matrix4x4.IDENTITY;
            this.timestampUpdate = 0;
            this.parent = null; // The parent of this node.
            this.children = []; // array of child nodes appended to this node.
            this.components = {};
            // private tags: string[] = []; // Names of tags that are attached to this node. (TODO: As of yet no functionality)
            // private layers: string[] = []; // Names of the layers this node is on. (TODO: As of yet no functionality)
            this.listeners = {};
            this.captures = {};
            this.name = _name;
        }
        /**
         * Returns a reference to this nodes parent node
         */
        getParent() {
            return this.parent;
        }
        /**
         * Traces back the ancestors of this node and returns the first
         */
        getAncestor() {
            let ancestor = this;
            while (ancestor.getParent())
                ancestor = ancestor.getParent();
            return ancestor;
        }
        /**
         * Shortcut to retrieve this nodes [[ComponentTransform]]
         */
        get cmpTransform() {
            return this.getComponents(FudgeCore.ComponentTransform)[0];
        }
        /**
         * Shortcut to retrieve the local [[Matrix4x4]] attached to this nodes [[ComponentTransform]]
         * Returns null if no [[ComponentTransform]] is attached
         */
        // TODO: rejected for now, since there is some computational overhead, so node.mtxLocal should not be used carelessly
        // public get mtxLocal(): Matrix4x4 {
        //     let cmpTransform: ComponentTransform = this.cmpTransform;
        //     if (cmpTransform)
        //         return cmpTransform.local;
        //     else
        //         return null;
        // }
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
            let ancestor = this;
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
            let found = this.findChild(_node);
            if (found < 0)
                return;
            _node.dispatchEvent(new Event("childRemove" /* CHILD_REMOVE */, { bubbles: true }));
            this.children.splice(found, 1);
            _node.setParent(null);
        }
        /**
         * Returns the position of the node in the list of children or -1 if not found
         * @param _node The node to be found.
         */
        findChild(_node) {
            return this.children.indexOf(_node);
        }
        /**
         * Replaces a child node with another, preserving the position in the list of children
         * @param _replace The node to be replaced
         * @param _with The node to replace with
         */
        replaceChild(_replace, _with) {
            let found = this.findChild(_replace);
            if (found < 0)
                return false;
            let previousParent = _with.getParent();
            if (previousParent)
                previousParent.removeChild(_with);
            _replace.setParent(null);
            this.children[found] = _with;
            _with.setParent(this);
            return true;
        }
        /**
         * Generator yielding the node and all successors in the branch below for iteration
         */
        get branch() {
            return this.getBranchGenerator();
        }
        isUpdated(_timestampUpdate) {
            return (this.timestampUpdate == _timestampUpdate);
        }
        /**
         * Applies a Mutator from [[Animation]] to all its components and transfers it to its children.
         * @param _mutator The mutator generated from an [[Animation]]
         */
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
                                for (let cname in mutatorWithComponentName) { // trick used to get the only entry in the list
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
        // #endregion
        // #region Components
        /**
         * Returns a list of all components attached to this node, independent of type.
         */
        getAllComponents() {
            let all = [];
            for (let type in this.components) {
                all = all.concat(this.components[type]);
            }
            return all;
        }
        /**
         * Returns a clone of the list of components of the given class attached to this node.
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
                if (foundAt < 0)
                    return;
                componentsOfType.splice(foundAt, 1);
                _component.setContainer(null);
                _component.dispatchEvent(new Event("componentRemove" /* COMPONENT_REMOVE */));
            }
            catch {
                throw new Error(`Unable to remove component '${_component}'in node named '${this.name}'`);
            }
        }
        // #endregion
        // #region Serialization
        serialize() {
            let serialization = {
                name: this.name
            };
            let components = {};
            for (let type in this.components) {
                components[type] = [];
                for (let component of this.components[type]) {
                    // components[type].push(component.serialize());
                    components[type].push(FudgeCore.Serializer.serialize(component));
                }
            }
            serialization["components"] = components;
            let children = [];
            for (let child of this.children) {
                children.push(FudgeCore.Serializer.serialize(child));
            }
            serialization["children"] = children;
            this.dispatchEvent(new Event("nodeSerialized" /* NODE_SERIALIZED */));
            return serialization;
        }
        deserialize(_serialization) {
            this.name = _serialization.name;
            // this.parent = is set when the nodes are added
            // deserialize components first so scripts can react to children being appended
            for (let type in _serialization.components) {
                for (let serializedComponent of _serialization.components[type]) {
                    let deserializedComponent = FudgeCore.Serializer.deserialize(serializedComponent);
                    this.addComponent(deserializedComponent);
                }
            }
            for (let serializedChild of _serialization.children) {
                let deserializedChild = FudgeCore.Serializer.deserialize(serializedChild);
                this.appendChild(deserializedChild);
            }
            this.dispatchEvent(new Event("nodeDeserialized" /* NODE_DESERIALIZED */));
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
            // TODO: consider using Reflect instead of Object throughout. See also Render and Mutable...
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
    FudgeCore.Node = Node;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * A node managed by [[ResourceManager]] that functions as a template for [[NodeResourceInstance]]s
     */
    class NodeResource extends FudgeCore.Node {
        constructor() {
            super(...arguments);
            this.idResource = undefined;
        }
    }
    FudgeCore.NodeResource = NodeResource;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * An instance of a [[NodeResource]].
     * This node keeps a reference to its resource an can thus optimize serialization
     */
    class NodeResourceInstance extends FudgeCore.Node {
        constructor(_nodeResource) {
            super("NodeResourceInstance");
            /** id of the resource that instance was created from */
            // TODO: examine, if this should be a direct reference to the NodeResource, instead of the id
            this.idSource = undefined;
            if (_nodeResource)
                this.set(_nodeResource);
        }
        /**
         * Recreate this node from the [[NodeResource]] referenced
         */
        reset() {
            let resource = FudgeCore.ResourceManager.get(this.idSource);
            this.set(resource);
        }
        //TODO: optimize using the referenced NodeResource, serialize/deserialize only the differences
        serialize() {
            let serialization = super.serialize();
            serialization.idSource = this.idSource;
            return serialization;
        }
        deserialize(_serialization) {
            super.deserialize(_serialization);
            this.idSource = _serialization.idSource;
            return this;
        }
        /**
         * Set this node to be a recreation of the [[NodeResource]] given
         * @param _nodeResource
         */
        set(_nodeResource) {
            // TODO: examine, if the serialization should be stored in the NodeResource for optimization
            let serialization = FudgeCore.Serializer.serialize(_nodeResource);
            //Serializer.deserialize(serialization);
            for (let path in serialization) {
                this.deserialize(serialization[path]);
                break;
            }
            this.idSource = _nodeResource.idResource;
            this.dispatchEvent(new Event("nodeResourceInstantiated" /* NODERESOURCE_INSTANTIATED */));
        }
    }
    FudgeCore.NodeResourceInstance = NodeResourceInstance;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class Ray {
        constructor(_direction = FudgeCore.Vector3.Z(-1), _origin = FudgeCore.Vector3.ZERO(), _length = 1) {
            this.origin = _origin;
            this.direction = _direction;
            this.length = _length;
        }
    }
    FudgeCore.Ray = Ray;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    class RayHit {
        constructor(_node = null, _face = 0, _zBuffer = 0) {
            this.node = _node;
            this.face = _face;
            this.zBuffer = _zBuffer;
        }
    }
    FudgeCore.RayHit = RayHit;
})(FudgeCore || (FudgeCore = {}));
/// <reference path="RenderOperator.ts"/>
var FudgeCore;
/// <reference path="RenderOperator.ts"/>
(function (FudgeCore) {
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
    class RenderManager extends FudgeCore.RenderOperator {
        // #region Adding
        /**
         * Register the node for rendering. Create a reference for it and increase the matching render-data references or create them first if necessary
         * @param _node
         */
        static addNode(_node) {
            if (RenderManager.nodes.get(_node))
                return;
            let cmpMaterial = _node.getComponent(FudgeCore.ComponentMaterial);
            if (!cmpMaterial)
                return;
            let shader = cmpMaterial.material.getShader();
            RenderManager.createReference(RenderManager.renderShaders, shader, RenderManager.createProgram);
            let coat = cmpMaterial.material.getCoat();
            RenderManager.createReference(RenderManager.renderCoats, coat, RenderManager.createParameter);
            let mesh = _node.getComponent(FudgeCore.ComponentMesh).mesh;
            RenderManager.createReference(RenderManager.renderBuffers, mesh, RenderManager.createBuffers);
            let nodeReferences = { shader: shader, coat: coat, mesh: mesh }; //, doneTransformToWorld: false };
            RenderManager.nodes.set(_node, nodeReferences);
        }
        /**
         * Register the node and its valid successors in the branch for rendering using [[addNode]]
         * @param _node
         * @returns false, if the given node has a current timestamp thus having being processed during latest RenderManager.update and no addition is needed
         */
        static addBranch(_node) {
            if (_node.isUpdated(RenderManager.timestampUpdate))
                return false;
            for (let node of _node.branch)
                try {
                    // may fail when some components are missing. TODO: cleanup
                    RenderManager.addNode(node);
                }
                catch (_e) {
                    FudgeCore.Debug.log(_e);
                }
            return true;
        }
        // #endregion
        // #region Removing
        /**
         * Unregister the node so that it won't be rendered any more. Decrease the render-data references and delete the node reference.
         * @param _node
         */
        static removeNode(_node) {
            let nodeReferences = RenderManager.nodes.get(_node);
            if (!nodeReferences)
                return;
            RenderManager.removeReference(RenderManager.renderShaders, nodeReferences.shader, RenderManager.deleteProgram);
            RenderManager.removeReference(RenderManager.renderCoats, nodeReferences.coat, RenderManager.deleteParameter);
            RenderManager.removeReference(RenderManager.renderBuffers, nodeReferences.mesh, RenderManager.deleteBuffers);
            RenderManager.nodes.delete(_node);
        }
        /**
         * Unregister the node and its valid successors in the branch to free renderer resources. Uses [[removeNode]]
         * @param _node
         */
        static removeBranch(_node) {
            for (let node of _node.branch)
                RenderManager.removeNode(node);
        }
        // #endregion
        // #region Updating
        /**
         * Reflect changes in the node concerning shader, coat and mesh, manage the render-data references accordingly and update the node references
         * @param _node
         */
        static updateNode(_node) {
            let nodeReferences = RenderManager.nodes.get(_node);
            if (!nodeReferences)
                return;
            let cmpMaterial = _node.getComponent(FudgeCore.ComponentMaterial);
            let shader = cmpMaterial.material.getShader();
            if (shader !== nodeReferences.shader) {
                RenderManager.removeReference(RenderManager.renderShaders, nodeReferences.shader, RenderManager.deleteProgram);
                RenderManager.createReference(RenderManager.renderShaders, shader, RenderManager.createProgram);
                nodeReferences.shader = shader;
            }
            let coat = cmpMaterial.material.getCoat();
            if (coat !== nodeReferences.coat) {
                RenderManager.removeReference(RenderManager.renderCoats, nodeReferences.coat, RenderManager.deleteParameter);
                RenderManager.createReference(RenderManager.renderCoats, coat, RenderManager.createParameter);
                nodeReferences.coat = coat;
            }
            let mesh = (_node.getComponent(FudgeCore.ComponentMesh)).mesh;
            if (mesh !== nodeReferences.mesh) {
                RenderManager.removeReference(RenderManager.renderBuffers, nodeReferences.mesh, RenderManager.deleteBuffers);
                RenderManager.createReference(RenderManager.renderBuffers, mesh, RenderManager.createBuffers);
                nodeReferences.mesh = mesh;
            }
        }
        /**
         * Update the node and its valid successors in the branch using [[updateNode]]
         * @param _node
         */
        static updateBranch(_node) {
            for (let node of _node.branch)
                RenderManager.updateNode(node);
        }
        // #endregion
        // #region Lights
        /**
         * Viewports collect the lights relevant to the branch to render and calls setLights to pass the collection.
         * RenderManager passes it on to all shaders used that can process light
         * @param _lights
         */
        static setLights(_lights) {
            // let renderLights: RenderLights = RenderManager.createRenderLights(_lights);
            for (let entry of RenderManager.renderShaders) {
                let renderShader = entry[1].getReference();
                RenderManager.setLightsInShader(renderShader, _lights);
            }
            // debugger;
        }
        // #endregion
        // #region Rendering
        /**
         * Update all render data. After RenderManager, multiple viewports can render their associated data without updating the same data multiple times
         */
        static update() {
            RenderManager.timestampUpdate = performance.now();
            RenderManager.recalculateAllNodeTransforms();
        }
        /**
         * Clear the offscreen renderbuffer with the given [[Color]]
         * @param _color
         */
        static clear(_color = null) {
            RenderManager.crc3.clearColor(_color.r, _color.g, _color.b, _color.a);
            RenderManager.crc3.clear(WebGL2RenderingContext.COLOR_BUFFER_BIT | WebGL2RenderingContext.DEPTH_BUFFER_BIT);
        }
        /**
         * Reset the offscreen framebuffer to the original RenderingContext
         */
        static resetFrameBuffer(_color = null) {
            RenderManager.crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, null);
        }
        /**
         * Draws the branch starting with the given [[Node]] using the camera given [[ComponentCamera]].
         * @param _node
         * @param _cmpCamera
         */
        static drawBranch(_node, _cmpCamera, _drawNode = RenderManager.drawNode) {
            if (_drawNode == RenderManager.drawNode)
                RenderManager.resetFrameBuffer();
            let finalTransform;
            let cmpMesh = _node.getComponent(FudgeCore.ComponentMesh);
            if (cmpMesh)
                finalTransform = FudgeCore.Matrix4x4.MULTIPLICATION(_node.mtxWorld, cmpMesh.pivot);
            else
                finalTransform = _node.mtxWorld; // caution, RenderManager is a reference...
            // multiply camera matrix
            let projection = FudgeCore.Matrix4x4.MULTIPLICATION(_cmpCamera.ViewProjectionMatrix, finalTransform);
            _drawNode(_node, finalTransform, projection);
            for (let name in _node.getChildren()) {
                let childNode = _node.getChildren()[name];
                RenderManager.drawBranch(childNode, _cmpCamera, _drawNode); //, world);
            }
            FudgeCore.Recycler.store(projection);
            if (finalTransform != _node.mtxWorld)
                FudgeCore.Recycler.store(finalTransform);
        }
        //#region RayCast & Picking
        /**
         * Draws the branch for RayCasting starting with the given [[Node]] using the camera given [[ComponentCamera]].
         * @param _node
         * @param _cmpCamera
         */
        static drawBranchForRayCast(_node, _cmpCamera) {
            RenderManager.pickBuffers = [];
            if (!RenderManager.renderShaders.get(FudgeCore.ShaderRayCast))
                RenderManager.createReference(RenderManager.renderShaders, FudgeCore.ShaderRayCast, RenderManager.createProgram);
            RenderManager.drawBranch(_node, _cmpCamera, RenderManager.drawNodeForRayCast);
            RenderManager.resetFrameBuffer();
            return RenderManager.pickBuffers;
        }
        static pickNodeAt(_pos, _pickBuffers, _rect) {
            let hits = [];
            for (let pickBuffer of _pickBuffers) {
                RenderManager.crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, pickBuffer.frameBuffer);
                // TODO: instead of reading all data and afterwards pick the pixel, read only the pixel!
                let data = new Uint8Array(_rect.width * _rect.height * 4);
                RenderManager.crc3.readPixels(0, 0, _rect.width, _rect.height, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, data);
                let pixel = _pos.x + _rect.width * _pos.y;
                let zBuffer = data[4 * pixel + 2] + data[4 * pixel + 3] / 256;
                let hit = new FudgeCore.RayHit(pickBuffer.node, 0, zBuffer);
                hits.push(hit);
            }
            return hits;
        }
        static drawNode(_node, _finalTransform, _projection) {
            let references = RenderManager.nodes.get(_node);
            if (!references)
                return; // TODO: deal with partial references
            let bufferInfo = RenderManager.renderBuffers.get(references.mesh).getReference();
            let coatInfo = RenderManager.renderCoats.get(references.coat).getReference();
            let shaderInfo = RenderManager.renderShaders.get(references.shader).getReference();
            RenderManager.draw(shaderInfo, bufferInfo, coatInfo, _finalTransform, _projection);
        }
        static drawNodeForRayCast(_node, _finalTransform, _projection) {
            // TODO: look into SSBOs!
            let target = RenderManager.getRayCastTexture();
            const framebuffer = RenderManager.crc3.createFramebuffer();
            // render to our targetTexture by binding the framebuffer
            RenderManager.crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, framebuffer);
            // attach the texture as the first color attachment
            const attachmentPoint = WebGL2RenderingContext.COLOR_ATTACHMENT0;
            RenderManager.crc3.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, attachmentPoint, WebGL2RenderingContext.TEXTURE_2D, target, 0);
            // set render target
            let references = RenderManager.nodes.get(_node);
            if (!references)
                return; // TODO: deal with partial references
            let pickBuffer = { node: _node, texture: target, frameBuffer: framebuffer };
            RenderManager.pickBuffers.push(pickBuffer);
            let bufferInfo = RenderManager.renderBuffers.get(references.mesh).getReference();
            RenderManager.drawForRayCast(RenderManager.pickBuffers.length, bufferInfo, _finalTransform, _projection);
            // make texture available to onscreen-display
            // IDEA: Iterate over textures, collect data if z indicates hit, sort by z
        }
        static getRayCastTexture() {
            // create to render to
            const targetTextureWidth = RenderManager.getViewportRectangle().width;
            const targetTextureHeight = RenderManager.getViewportRectangle().height;
            const targetTexture = RenderManager.crc3.createTexture();
            RenderManager.crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, targetTexture);
            {
                const internalFormat = WebGL2RenderingContext.RGBA8;
                const format = WebGL2RenderingContext.RGBA;
                const type = WebGL2RenderingContext.UNSIGNED_BYTE;
                RenderManager.crc3.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, internalFormat, targetTextureWidth, targetTextureHeight, 0, format, type, null);
                // set the filtering so we don't need mips
                RenderManager.crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.LINEAR);
                RenderManager.crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_S, WebGL2RenderingContext.CLAMP_TO_EDGE);
                RenderManager.crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_T, WebGL2RenderingContext.CLAMP_TO_EDGE);
            }
            return targetTexture;
        }
        //#endregion
        //#region Transformation of branch
        /**
         * Recalculate the world matrix of all registered nodes respecting their hierarchical relation.
         */
        static recalculateAllNodeTransforms() {
            // inner function to be called in a for each node at the bottom of RenderManager function
            // function markNodeToBeTransformed(_nodeReferences: NodeReferences, _node: Node, _map: MapNodeToNodeReferences): void {
            //     _nodeReferences.doneTransformToWorld = false;
            // }
            // inner function to be called in a for each node at the bottom of RenderManager function
            let recalculateBranchContainingNode = (_nodeReferences, _node, _map) => {
                // find uppermost ancestor not recalculated yet
                let ancestor = _node;
                let parent;
                while (true) {
                    parent = ancestor.getParent();
                    if (!parent)
                        break;
                    if (_node.isUpdated(RenderManager.timestampUpdate))
                        break;
                    ancestor = parent;
                }
                // TODO: check if nodes without meshes must be registered
                // use the ancestors parent world matrix to start with, or identity if no parent exists or it's missing a ComponenTransform
                let matrix = FudgeCore.Matrix4x4.IDENTITY;
                if (parent)
                    matrix = parent.mtxWorld;
                // start recursive recalculation of the whole branch starting from the ancestor found
                RenderManager.recalculateTransformsOfNodeAndChildren(ancestor, matrix);
            };
            // call the functions above for each registered node
            // RenderManager.nodes.forEach(markNodeToBeTransformed);
            RenderManager.nodes.forEach(recalculateBranchContainingNode);
        }
        /**
         * Recursive method receiving a childnode and its parents updated world transform.
         * If the childnode owns a ComponentTransform, its worldmatrix is recalculated and passed on to its children, otherwise its parents matrix
         * @param _node
         * @param _world
         */
        static recalculateTransformsOfNodeAndChildren(_node, _world) {
            let world = _world;
            let cmpTransform = _node.cmpTransform;
            if (cmpTransform)
                world = FudgeCore.Matrix4x4.MULTIPLICATION(_world, cmpTransform.local);
            _node.mtxWorld = world;
            _node.timestampUpdate = RenderManager.timestampUpdate;
            for (let child of _node.getChildren()) {
                RenderManager.recalculateTransformsOfNodeAndChildren(child, world);
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
    FudgeCore.RenderManager = RenderManager;
})(FudgeCore || (FudgeCore = {}));
/// <reference path="../Coat/Coat.ts"/>
var FudgeCore;
/// <reference path="../Coat/Coat.ts"/>
(function (FudgeCore) {
    /**
     * Static superclass for the representation of WebGl shaderprograms.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    // TODO: define attribute/uniforms as layout and use those consistently in shaders
    class Shader {
        /** The type of coat that can be used with this shader to create a material */
        static getCoat() { return null; }
        static getVertexShaderSource() { return null; }
        static getFragmentShaderSource() { return null; }
    }
    FudgeCore.Shader = Shader;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Single color shading
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ShaderFlat extends FudgeCore.Shader {
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
    FudgeCore.ShaderFlat = ShaderFlat;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Matcap (Material Capture) shading. The texture provided by the coat is used as a matcap material.
     * Implementation based on https://www.clicktorelease.com/blog/creating-spherical-environment-mapping-shader/
     * @authors Simon Storl-Schulke, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ShaderMatCap extends FudgeCore.Shader {
        static getCoat() {
            return FudgeCore.CoatMatCap;
        }
        static getVertexShaderSource() {
            return `#version 300 es

                    in vec3 a_position;
                    in vec3 a_normal;
                    uniform mat4 u_projection;

                    out vec2 tex_coords_smooth;
                    flat out vec2 tex_coords_flat;

                    void main() {
                        mat4 normalMatrix = transpose(inverse(u_projection));
                        vec4 p = vec4(a_position, 1.0);
                        vec4 normal4 = vec4(a_normal, 1.0);
                        vec3 e = normalize( vec3( u_projection * p ) );
                        vec3 n = normalize( vec3(normalMatrix * normal4) );

                        vec3 r = reflect( e, n );
                        float m = 2. * sqrt(
                            pow( r.x, 2. ) +
                            pow( r.y, 2. ) +
                            pow( r.z + 1., 2. )
                        );

                        tex_coords_smooth = r.xy / m + .5;
                        tex_coords_flat = r.xy / m + .5;

                        gl_Position = u_projection * vec4(a_position, 1.0);
                    }`;
        }
        static getFragmentShaderSource() {
            return `#version 300 es
                    precision mediump float;
                    
                    uniform vec4 u_tint_color;
                    uniform float u_flatmix;
                    uniform sampler2D u_texture;
                    
                    in vec2 tex_coords_smooth;
                    flat in vec2 tex_coords_flat;

                    out vec4 frag;

                    void main() {
                        vec2 tc = mix(tex_coords_smooth, tex_coords_flat, u_flatmix);
                        frag = u_tint_color * texture(u_texture, tc) * 2.0;
                    }`;
        }
    }
    FudgeCore.ShaderMatCap = ShaderMatCap;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Renders for Raycasting
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ShaderRayCast extends FudgeCore.Shader {
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
                    out vec4 frag;
                    
                    void main() {
                       float id = float(u_id)/ 256.0;
                       float upperbyte = trunc(gl_FragCoord.z * 256.0) / 256.0;
                       float lowerbyte = fract(gl_FragCoord.z * 256.0);
                       frag = vec4(id, id, upperbyte , lowerbyte);
                    }`;
        }
    }
    FudgeCore.ShaderRayCast = ShaderRayCast;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Textured shading
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ShaderTexture extends FudgeCore.Shader {
        static getCoat() {
            return FudgeCore.CoatTextured;
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
    FudgeCore.ShaderTexture = ShaderTexture;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Single color shading
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class ShaderUniColor extends FudgeCore.Shader {
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
                       frag = u_color;
                    }`;
        }
    }
    FudgeCore.ShaderUniColor = ShaderUniColor;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    /**
     * Baseclass for different kinds of textures.
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Texture extends FudgeCore.Mutable {
        reduceMutator() { }
    }
    FudgeCore.Texture = Texture;
    /**
     * Texture created from an existing image
     */
    class TextureImage extends Texture {
        constructor() {
            super(...arguments);
            this.image = null;
        }
    }
    FudgeCore.TextureImage = TextureImage;
    /**
     * Texture created from a canvas
     */
    class TextureCanvas extends Texture {
    }
    FudgeCore.TextureCanvas = TextureCanvas;
    /**
     * Texture created from a FUDGE-Sketch
     */
    class TextureSketch extends TextureCanvas {
    }
    FudgeCore.TextureSketch = TextureSketch;
    /**
     * Texture created from an HTML-page
     */
    class TextureHTML extends TextureCanvas {
    }
    FudgeCore.TextureHTML = TextureHTML;
})(FudgeCore || (FudgeCore = {}));
var FudgeCore;
(function (FudgeCore) {
    let TIMER_TYPE;
    (function (TIMER_TYPE) {
        TIMER_TYPE[TIMER_TYPE["INTERVAL"] = 0] = "INTERVAL";
        TIMER_TYPE[TIMER_TYPE["TIMEOUT"] = 1] = "TIMEOUT";
    })(TIMER_TYPE || (TIMER_TYPE = {}));
    class Timer {
        constructor(_time, _type, _callback, _timeout, _arguments) {
            this.type = _type;
            this.timeout = _timeout;
            this.arguments = _arguments;
            this.startTimeReal = performance.now();
            this.callback = _callback;
            let scale = Math.abs(_time.getScale());
            if (!scale) {
                // Time is stopped, timer won't be active
                this.active = false;
                return;
            }
            let id;
            this.timeoutReal = this.timeout / scale;
            if (this.type == TIMER_TYPE.TIMEOUT) {
                let callback = () => {
                    _time.deleteTimerByInternalId(this.id);
                    _callback(_arguments);
                };
                id = window.setTimeout(callback, this.timeoutReal);
            }
            else
                id = window.setInterval(_callback, this.timeoutReal, _arguments);
            this.id = id;
            this.active = true;
        }
        clear() {
            if (this.type == TIMER_TYPE.TIMEOUT) {
                if (this.active)
                    // save remaining time to timeout as new timeout for restart
                    this.timeout = this.timeout * (1 - (performance.now() - this.startTimeReal) / this.timeoutReal);
                window.clearTimeout(this.id);
            }
            else
                // TODO: reusing timer starts interval anew. Should be remaining interval as timeout, then starting interval anew 
                window.clearInterval(this.id);
            this.active = false;
        }
    }
    /**
     * Instances of this class generate a timestamp that correlates with the time elapsed since the start of the program but allows for resetting and scaling.
     * Supports interval- and timeout-callbacks identical with standard Javascript but with respect to the scaled time
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    class Time extends EventTarget {
        constructor() {
            super();
            this.timers = {};
            this.idTimerNext = 0;
            this.start = performance.now();
            this.scale = 1.0;
            this.offset = 0.0;
            this.lastCallToElapsed = 0.0;
        }
        /**
         * Returns the game-time-object which starts automatically and serves as base for various internal operations.
         */
        static get game() {
            return Time.gameTime;
        }
        /**
         * Retrieves the current scaled timestamp of this instance in milliseconds
         */
        get() {
            return this.offset + this.scale * (performance.now() - this.start);
        }
        /**
         * (Re-) Sets the timestamp of this instance
         * @param _time The timestamp to represent the current time (default 0.0)
         */
        set(_time = 0) {
            this.offset = _time;
            this.start = performance.now();
            this.getElapsedSincePreviousCall();
        }
        /**
         * Sets the scaling of this time, allowing for slowmotion (<1) or fastforward (>1)
         * @param _scale The desired scaling (default 1.0)
         */
        setScale(_scale = 1.0) {
            this.set(this.get());
            this.scale = _scale;
            //TODO: catch scale=0
            this.rescaleAllTimers();
            this.getElapsedSincePreviousCall();
            this.dispatchEvent(new Event("timeScaled" /* TIME_SCALED */));
        }
        /**
         * Retrieves the current scaling of this time
         */
        getScale() {
            return this.scale;
        }
        /**
         * Retrieves the offset of this time
         */
        getOffset() {
            return this.offset;
        }
        /**
         * Retrieves the scaled time in milliseconds passed since the last call to this method
         * Automatically reset at every call to set(...) and setScale(...)
         */
        getElapsedSincePreviousCall() {
            let current = this.get();
            let elapsed = current - this.lastCallToElapsed;
            this.lastCallToElapsed = current;
            return elapsed;
        }
        //#region Timers
        // TODO: examine if web-workers would enhance performance here!
        /**
         * See Javascript documentation. Creates an internal [[Timer]] object
         * @param _callback
         * @param _timeout
         * @param _arguments
         */
        setTimeout(_callback, _timeout, ..._arguments) {
            return this.setTimer(TIMER_TYPE.TIMEOUT, _callback, _timeout, _arguments);
        }
        /**
         * See Javascript documentation. Creates an internal [[Timer]] object
         * @param _callback
         * @param _timeout
         * @param _arguments
         */
        setInterval(_callback, _timeout, ..._arguments) {
            return this.setTimer(TIMER_TYPE.INTERVAL, _callback, _timeout, _arguments);
        }
        /**
         * See Javascript documentation
         * @param _id
         */
        clearTimeout(_id) {
            this.deleteTimer(_id);
        }
        /**
         * See Javascript documentation
         * @param _id
         */
        clearInterval(_id) {
            this.deleteTimer(_id);
        }
        /**
         * Stops and deletes all [[Timer]]s attached. Should be called before this Time-object leaves scope
         */
        clearAllTimers() {
            for (let id in this.timers) {
                this.deleteTimer(Number(id));
            }
        }
        /**
         * Recreates [[Timer]]s when scaling changes
         */
        rescaleAllTimers() {
            for (let id in this.timers) {
                let timer = this.timers[id];
                timer.clear();
                if (!this.scale)
                    // Time has stopped, no need to replace cleared timers
                    continue;
                let timeout = timer.timeout;
                // if (timer.type == TIMER_TYPE.TIMEOUT && timer.active)
                //     // for an active timeout-timer, calculate the remaining time to timeout
                //     timeout = (performance.now() - timer.startTimeReal) / timer.timeoutReal;
                let replace = new Timer(this, timer.type, timer.callback, timeout, timer.arguments);
                this.timers[id] = replace;
            }
        }
        /**
         * Deletes [[Timer]] found using the id of the connected interval/timeout-object
         * @param _id
         */
        deleteTimerByInternalId(_id) {
            for (let id in this.timers) {
                let timer = this.timers[id];
                if (timer.id == _id) {
                    timer.clear();
                    delete this.timers[id];
                }
            }
        }
        setTimer(_type, _callback, _timeout, _arguments) {
            let timer = new Timer(this, _type, _callback, _timeout, _arguments);
            this.timers[++this.idTimerNext] = timer;
            return this.idTimerNext;
        }
        deleteTimer(_id) {
            this.timers[_id].clear();
            delete this.timers[_id];
        }
    }
    Time.gameTime = new Time();
    FudgeCore.Time = Time;
})(FudgeCore || (FudgeCore = {}));
///<reference path="../Event/Event.ts"/>
///<reference path="../Time/Time.ts"/>
var FudgeCore;
///<reference path="../Event/Event.ts"/>
///<reference path="../Time/Time.ts"/>
(function (FudgeCore) {
    let LOOP_MODE;
    (function (LOOP_MODE) {
        /** Loop cycles controlled by window.requestAnimationFrame */
        LOOP_MODE["FRAME_REQUEST"] = "frameRequest";
        /** Loop cycles with the given framerate in [[Time]].game */
        LOOP_MODE["TIME_GAME"] = "timeGame";
        /** Loop cycles with the given framerate in realtime, independent of [[Time]].game */
        LOOP_MODE["TIME_REAL"] = "timeReal";
    })(LOOP_MODE = FudgeCore.LOOP_MODE || (FudgeCore.LOOP_MODE = {}));
    /**
     * Core loop of a Fudge application. Initializes automatically and must be started explicitly.
     * It then fires [[EVENT]].LOOP\_FRAME to all added listeners at each frame
     */
    class Loop extends FudgeCore.EventTargetStatic {
        /**
         * Starts the loop with the given mode and fps
         * @param _mode
         * @param _fps Is only applicable in TIME-modes
         * @param _syncWithAnimationFrame Experimental and only applicable in TIME-modes. Should defer the loop-cycle until the next possible animation frame.
         */
        static start(_mode = LOOP_MODE.FRAME_REQUEST, _fps = 60, _syncWithAnimationFrame = false) {
            Loop.stop();
            Loop.timeStartGame = FudgeCore.Time.game.get();
            Loop.timeStartReal = performance.now();
            Loop.timeLastFrameGame = Loop.timeStartGame;
            Loop.timeLastFrameReal = Loop.timeStartReal;
            Loop.fpsDesired = (_mode == LOOP_MODE.FRAME_REQUEST) ? 60 : _fps;
            Loop.framesToAverage = Loop.fpsDesired;
            Loop.timeLastFrameGameAvg = Loop.timeLastFrameRealAvg = 1000 / Loop.fpsDesired;
            Loop.mode = _mode;
            Loop.syncWithAnimationFrame = _syncWithAnimationFrame;
            let log = `Loop starting in mode ${Loop.mode}`;
            if (Loop.mode != LOOP_MODE.FRAME_REQUEST)
                log += ` with attempted ${_fps} fps`;
            FudgeCore.Debug.log(log);
            switch (_mode) {
                case LOOP_MODE.FRAME_REQUEST:
                    Loop.loopFrame();
                    break;
                case LOOP_MODE.TIME_REAL:
                    Loop.idIntervall = window.setInterval(Loop.loopTime, 1000 / Loop.fpsDesired);
                    Loop.loopTime();
                    break;
                case LOOP_MODE.TIME_GAME:
                    Loop.idIntervall = FudgeCore.Time.game.setInterval(Loop.loopTime, 1000 / Loop.fpsDesired);
                    Loop.loopTime();
                    break;
                default:
                    break;
            }
            Loop.running = true;
        }
        /**
         * Stops the loop
         */
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
                    // TODO: DANGER! id changes internally in game when time is scaled!
                    FudgeCore.Time.game.clearInterval(Loop.idIntervall);
                    window.cancelAnimationFrame(Loop.idRequest);
                    break;
                default:
                    break;
            }
            FudgeCore.Debug.log("Loop stopped!");
        }
        static getFpsGameAverage() {
            return 1000 / Loop.timeLastFrameGameAvg;
        }
        static getFpsRealAverage() {
            return 1000 / Loop.timeLastFrameRealAvg;
        }
        static loop() {
            let time;
            time = performance.now();
            Loop.timeFrameReal = time - Loop.timeLastFrameReal;
            Loop.timeLastFrameReal = time;
            time = FudgeCore.Time.game.get();
            Loop.timeFrameGame = time - Loop.timeLastFrameGame;
            Loop.timeLastFrameGame = time;
            Loop.timeLastFrameGameAvg = ((Loop.framesToAverage - 1) * Loop.timeLastFrameGameAvg + Loop.timeFrameGame) / Loop.framesToAverage;
            Loop.timeLastFrameRealAvg = ((Loop.framesToAverage - 1) * Loop.timeLastFrameRealAvg + Loop.timeFrameReal) / Loop.framesToAverage;
            let event = new Event("loopFrame" /* LOOP_FRAME */);
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
    /** The gametime the loop was started, overwritten at each start */
    Loop.timeStartGame = 0;
    /** The realtime the loop was started, overwritten at each start */
    Loop.timeStartReal = 0;
    /** The gametime elapsed since the last loop cycle */
    Loop.timeFrameGame = 0;
    /** The realtime elapsed since the last loop cycle */
    Loop.timeFrameReal = 0;
    Loop.timeLastFrameGame = 0;
    Loop.timeLastFrameReal = 0;
    Loop.timeLastFrameGameAvg = 0;
    Loop.timeLastFrameRealAvg = 0;
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
    /**
     * Handles file transfer from a Fudge-Browserapp to the local filesystem without a local server.
     * Saves to the download-path given by the browser, loads from the player's choice.
     */
    class FileIoBrowserLocal extends FudgeCore.EventTargetStatic {
        // TODO: refactor to async function to be handled using promise, instead of using event target
        static load() {
            FileIoBrowserLocal.selector = document.createElement("input");
            FileIoBrowserLocal.selector.type = "file";
            FileIoBrowserLocal.selector.multiple = true;
            FileIoBrowserLocal.selector.hidden = true;
            FileIoBrowserLocal.selector.addEventListener("change", FileIoBrowserLocal.handleFileSelect);
            document.body.appendChild(FileIoBrowserLocal.selector);
            FileIoBrowserLocal.selector.click();
        }
        // TODO: refactor to async function to be handled using promise, instead of using event target
        static save(_toSave) {
            for (let filename in _toSave) {
                let content = _toSave[filename];
                let blob = new Blob([content], { type: "text/plain" });
                let url = window.URL.createObjectURL(blob);
                //*/ using anchor element for download
                let downloader;
                downloader = document.createElement("a");
                downloader.setAttribute("href", url);
                downloader.setAttribute("download", filename);
                document.body.appendChild(downloader);
                downloader.click();
                document.body.removeChild(downloader);
                window.URL.revokeObjectURL(url);
            }
            let event = new CustomEvent("fileSaved" /* FILE_SAVED */, { detail: { mapFilenameToContent: _toSave } });
            FileIoBrowserLocal.targetStatic.dispatchEvent(event);
        }
        static async handleFileSelect(_event) {
            console.log("-------------------------------- handleFileSelect");
            document.body.removeChild(FileIoBrowserLocal.selector);
            let fileList = _event.target.files;
            console.log(fileList, fileList.length);
            if (fileList.length == 0)
                return;
            let loaded = {};
            await FileIoBrowserLocal.loadFiles(fileList, loaded);
            let event = new CustomEvent("fileLoaded" /* FILE_LOADED */, { detail: { mapFilenameToContent: loaded } });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRnVkZ2VDb3JlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vU291cmNlL1RyYW5zZmVyL1NlcmlhbGl6ZXIudHMiLCIuLi9Tb3VyY2UvVHJhbnNmZXIvTXV0YWJsZS50cyIsIi4uL1NvdXJjZS9BbmltYXRpb24vQW5pbWF0aW9uLnRzIiwiLi4vU291cmNlL0FuaW1hdGlvbi9BbmltYXRpb25GdW5jdGlvbi50cyIsIi4uL1NvdXJjZS9BbmltYXRpb24vQW5pbWF0aW9uS2V5LnRzIiwiLi4vU291cmNlL0FuaW1hdGlvbi9BbmltYXRpb25TZXF1ZW5jZS50cyIsIi4uL1NvdXJjZS9BdWRpby9BdWRpby50cyIsIi4uL1NvdXJjZS9BdWRpby9BdWRpb0ZpbHRlci50cyIsIi4uL1NvdXJjZS9BdWRpby9BdWRpb0xpc3RlbmVyLnRzIiwiLi4vU291cmNlL0F1ZGlvL0F1ZGlvTG9jYWxpc2F0aW9uLnRzIiwiLi4vU291cmNlL0F1ZGlvL0F1ZGlvU2Vzc2lvbkRhdGEudHMiLCIuLi9Tb3VyY2UvQXVkaW8vQXVkaW9TZXR0aW5ncy50cyIsIi4uL1NvdXJjZS9SZW5kZXIvUmVuZGVySW5qZWN0b3IudHMiLCIuLi9Tb3VyY2UvUmVuZGVyL1JlbmRlck9wZXJhdG9yLnRzIiwiLi4vU291cmNlL0NvYXQvQ29hdC50cyIsIi4uL1NvdXJjZS9Db21wb25lbnQvQ29tcG9uZW50LnRzIiwiLi4vU291cmNlL0NvbXBvbmVudC9Db21wb25lbnRBbmltYXRvci50cyIsIi4uL1NvdXJjZS9Db21wb25lbnQvQ29tcG9uZW50QXVkaW8udHMiLCIuLi9Tb3VyY2UvQ29tcG9uZW50L0NvbXBvbmVudEF1ZGlvTGlzdGVuZXIudHMiLCIuLi9Tb3VyY2UvQ29tcG9uZW50L0NvbXBvbmVudENhbWVyYS50cyIsIi4uL1NvdXJjZS9Db21wb25lbnQvQ29tcG9uZW50TGlnaHQudHMiLCIuLi9Tb3VyY2UvQ29tcG9uZW50L0NvbXBvbmVudE1hdGVyaWFsLnRzIiwiLi4vU291cmNlL0NvbXBvbmVudC9Db21wb25lbnRNZXNoLnRzIiwiLi4vU291cmNlL0NvbXBvbmVudC9Db21wb25lbnRTY3JpcHQudHMiLCIuLi9Tb3VyY2UvQ29tcG9uZW50L0NvbXBvbmVudFRyYW5zZm9ybS50cyIsIi4uL1NvdXJjZS9EZWJ1Zy9EZWJ1Z0ludGVyZmFjZXMudHMiLCIuLi9Tb3VyY2UvRGVidWcvRGVidWdUYXJnZXQudHMiLCIuLi9Tb3VyY2UvRGVidWcvRGVidWdBbGVydC50cyIsIi4uL1NvdXJjZS9EZWJ1Zy9EZWJ1Z0NvbnNvbGUudHMiLCIuLi9Tb3VyY2UvRGVidWcvRGVidWcudHMiLCIuLi9Tb3VyY2UvRGVidWcvRGVidWdEaWFsb2cudHMiLCIuLi9Tb3VyY2UvRGVidWcvRGVidWdUZXh0QXJlYS50cyIsIi4uL1NvdXJjZS9FbmdpbmUvQ29sb3IudHMiLCIuLi9Tb3VyY2UvRW5naW5lL01hdGVyaWFsLnRzIiwiLi4vU291cmNlL0VuZ2luZS9SZWN5Y2xlci50cyIsIi4uL1NvdXJjZS9FbmdpbmUvUmVzb3VyY2VNYW5hZ2VyLnRzIiwiLi4vU291cmNlL0xpZ2h0L0xpZ2h0LnRzIiwiLi4vU291cmNlL0VuZ2luZS9WaWV3cG9ydC50cyIsIi4uL1NvdXJjZS9FdmVudC9FdmVudC50cyIsIi4uL1NvdXJjZS9FdmVudC9FdmVudEtleWJvYXJkLnRzIiwiLi4vU291cmNlL01hdGgvRnJhbWluZy50cyIsIi4uL1NvdXJjZS9NYXRoL01hdHJpeDN4My50cyIsIi4uL1NvdXJjZS9NYXRoL01hdHJpeDR4NC50cyIsIi4uL1NvdXJjZS9NYXRoL1JlY3RhbmdsZS50cyIsIi4uL1NvdXJjZS9NYXRoL1ZlY3RvcjIudHMiLCIuLi9Tb3VyY2UvTWF0aC9WZWN0b3IzLnRzIiwiLi4vU291cmNlL01lc2gvTWVzaC50cyIsIi4uL1NvdXJjZS9NZXNoL01lc2hDdWJlLnRzIiwiLi4vU291cmNlL01lc2gvTWVzaFB5cmFtaWQudHMiLCIuLi9Tb3VyY2UvTWVzaC9NZXNoUXVhZC50cyIsIi4uL1NvdXJjZS9Ob2RlL05vZGUudHMiLCIuLi9Tb3VyY2UvTm9kZS9Ob2RlUmVzb3VyY2UudHMiLCIuLi9Tb3VyY2UvTm9kZS9Ob2RlUmVzb3VyY2VJbnN0YW5jZS50cyIsIi4uL1NvdXJjZS9SYXkvUmF5LnRzIiwiLi4vU291cmNlL1JheS9SYXlIaXQudHMiLCIuLi9Tb3VyY2UvUmVuZGVyL1JlbmRlck1hbmFnZXIudHMiLCIuLi9Tb3VyY2UvU2hhZGVyL1NoYWRlci50cyIsIi4uL1NvdXJjZS9TaGFkZXIvU2hhZGVyRmxhdC50cyIsIi4uL1NvdXJjZS9TaGFkZXIvU2hhZGVyTWF0Q2FwLnRzIiwiLi4vU291cmNlL1NoYWRlci9TaGFkZXJSYXlDYXN0LnRzIiwiLi4vU291cmNlL1NoYWRlci9TaGFkZXJUZXh0dXJlLnRzIiwiLi4vU291cmNlL1NoYWRlci9TaGFkZXJVbmlDb2xvci50cyIsIi4uL1NvdXJjZS9UZXh0dXJlL1RleHR1cmUudHMiLCIuLi9Tb3VyY2UvVGltZS9UaW1lLnRzIiwiLi4vU291cmNlL1RpbWUvTG9vcC50cyIsIi4uL1NvdXJjZS9UcmFuc2Zlci9GaWxlSW9Ccm93c2VyTG9jYWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBLElBQVUsU0FBUyxDQXVMbEI7QUF2TEQsV0FBVSxTQUFTO0lBZ0JmOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0EyQkc7SUFDSCxNQUFzQixVQUFVO1FBSTVCOzs7V0FHRztRQUNJLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxVQUFrQjtZQUM5QyxLQUFLLElBQUksSUFBSSxJQUFJLFVBQVUsQ0FBQyxVQUFVO2dCQUNsQyxJQUFJLFVBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksVUFBVTtvQkFDekMsT0FBTztZQUVmLElBQUksSUFBSSxHQUFXLFVBQVUsQ0FBQyxlQUFlLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ2xFLElBQUksQ0FBQyxJQUFJO2dCQUNMLEtBQUssSUFBSSxVQUFVLElBQUksVUFBVSxDQUFDLFVBQVUsRUFBRTtvQkFD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RUQ7Ozs7V0FJRztRQUNILFNBQVM7WUFDUCxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtnQkFDZixJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDdEMsT0FBTzthQUNSO1lBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUU7Z0JBQ3ZDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7Z0JBQzFCLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDN0IsT0FBTzthQUNSO1lBRUQsSUFBSSxFQUFFLEdBQVcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7WUFFcEQsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztZQUMxQixJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDO1lBRTdCLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDL0gsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxL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LEVBQUUsQ0FBQyxDQUFDO1FBQ3JDLENBQUM7UUFFTSxNQUFNLEtBQUssS0FBSztZQUNuQixPQUFPLElBQUksS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLENBQUM7UUFDTSxNQUFNLEtBQUssS0FBSztZQUNuQixPQUFPLElBQUksS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLENBQUM7UUFDTSxNQUFNLEtBQUssR0FBRztZQUNqQixPQUFPLElBQUksS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLENBQUM7UUFDTSxNQUFNLEtBQUssS0FBSztZQUNuQixPQUFPLElBQUksS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLENBQUM7UUFDTSxNQUFNLEtBQUssSUFBSTtZQUNsQixPQUFPLElBQUksS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLENBQUM7UUFFTSxXQUFXLENBQUMsRUFBVSxFQUFFLEVBQVUsRUFBRSxFQUFVLEVBQUUsRUFBVTtZQUM3RCxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdEMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMs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QUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNyQyxJQUFJLEdBQUcsR0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDckMsSUFBSSxHQUFHLEdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLElBQUksR0FBRyxHQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNyQyxJQUFJLEdBQUcsR0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDckMsSUFBSSxHQUFHLEdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLElBQUksR0FBRyxHQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNyQyxJQUFJLEdBQUcsR0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDckMsSUFBSSxHQUFHLEdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLElBQUksR0FBRyxHQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNyQyxJQUFJLEdBQUcsR0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDckMsSUFBSSxHQUFHLEdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLElBQUksR0FBRyxHQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNyQyxJQUFJLEdBQUcsR0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDckMsSUFBSSxHQUFHLEdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLElBQUksR0FBRyxHQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNyQyxJQUFJLEdBQUcsR0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDckMsSUFBSSxNQUFNLEdBQWMsSUFBSSxTQUFTLENBQUM7WUFDdEMsTUFBTSxDQUFDLElBQUksR0FBRztnQkFDVixHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7Z0JBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztnQkFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO2dCQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7Z0JBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztnQkFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO2dCQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7Z0JBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FB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QU0sR0FBYyxVQUFBLFFBQVEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDbEQsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQ2I7Z0JBQ0UsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7Z0JBQzdDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO2dCQUM3QyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztnQkFDN0MsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7Z0JBQzdDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO2dCQUM3QyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztnQkFDN0MsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7Z0JBQzdDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO2dCQUM3QyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztnQkFDN0MsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7Z0JBQzdDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO2dCQUM3QyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztnQkFDN0MsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7Z0JBQzdDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO2dCQUM3QyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztnQkFDN0MsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7YUFDOUMsQ0FBQyxDQUFDO1lBQ0wsT0FBTyxNQUFNLENBQUM7UUFDaEIsQ0FBQztRQUVEOzs7V0FHRztRQUNJLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBa0I7WUFDeEMsSUFBSSxDQUFDLEdBQWlCLE9BQU8sQ0FBQyxJQUFJLENBQUM7WUFDbkMsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxHQUFHLEdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0IsSUFBSSxJQUFJLEdBQVcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM3QixJQUFJLElBQUksR0FBVyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzdCLElBQUksSUFBSSxHQUFXLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDN0IsSUFBSSxJQUFJLEdBQVcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM3QixJQUFJLElBQUksR0FBVyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzdCLElBQUksSUFBSSxHQUFXLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDN0IsSUFBSSxJQUFJLEdBQVcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM3QixJQUFJLElBQUksR0FBVyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzdCLElBQUksSUFBSSxHQUFXLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDN0IsSUFBSSxJQUFJLEdBQVcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM3QixJQUFJLEtBQUssR0FBVyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzlCLElBQUksS0FBSyxHQUFXLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDOUIsSUFBSSxLQUFLLEdBQVcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM5QixJQUFJLEtBQUssR0FBVyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzlCLElBQUksS0FBSyxHQUFXLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDOUIsSUFBSSxLQUFLLEdBQVcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM5QixJQUFJLEtBQUssR0FBVyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzlCLElBQUksS0FBSyxHQUFXLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDOUIsSUFBSSxLQUFLLEdBQVcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM5QixJQUFJLEtBQUssR0FBVyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzlCLElBQUksS0FBSyxHQUFXLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDOUIsSUFBSSxLQUFLLEdBQVcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM5QixJQUFJLEtBQUssR0FBVyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzlCLElBQUksS0FBSyxHQUFXLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFFOUIsSUFBSSxFQUFFLEdBQVcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsQ0FBQztnQkFDckQsQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBRXpDLElBQUksRUFBRSxHQUFXLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLENBQUM7Z0JBQ3JELENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztZQUN6QyxJQUFJLEVBQUUsR0FBVyxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDO2dCQUN0RCxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDMUMsSUFBSSxFQUFFLEdBQVcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQztnQkFDdEQsQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBRTFDLElBQUksQ0FBQyxHQUFXLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUVsRSx5Q0FBeUM7WUFDekMsTUFBTSxNQUFNLEdBQWMsVUFBQSxRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2xELE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO2dCQUNkLENBQUMsR0FBRyxFQUFFO2dCQUNOLENBQUMsR0FBRyxFQUFFO2dCQUNOLENBQUMsR0FBRyxFQUFFO2dCQUNOLENBQUMsR0FBRyxFQUFFO2dCQUNOLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBQ3JGLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBQ3JGLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBQ3ZGLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBQ3ZGLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBQzNGLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBQzNGLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBQzNGLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBQzNGLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDLENB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QkFDeEIsTUFBTSxPQUFPLEdBQVcsTUFBTSxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDeEQsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUM7YUFDaEM7UUFDTCxDQUFDO0tBQ0o7SUF2RFksNEJBQWtCLHFCQXVEOUIsQ0FBQTtBQUNMLENBQUMsRUFoRVMsU0FBUyxLQUFULFNBQVMsUUFnRWxCIiwic291cmNlc0NvbnRlbnQiOlsibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLWFueVxyXG4gICAgZXhwb3J0IHR5cGUgR2VuZXJhbCA9IGFueTtcclxuXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIFNlcmlhbGl6YXRpb24ge1xyXG4gICAgICAgIFt0eXBlOiBzdHJpbmddOiBHZW5lcmFsO1xyXG4gICAgfVxyXG4gICAgZXhwb3J0IGludGVyZmFjZSBTZXJpYWxpemFibGUge1xyXG4gICAgICAgIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemF0aW9uO1xyXG4gICAgICAgIGRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uKTogU2VyaWFsaXphYmxlO1xyXG4gICAgfVxyXG5cclxuICAgIGludGVyZmFjZSBOYW1lc3BhY2VSZWdpc3RlciB7XHJcbiAgICAgICAgW25hbWU6IHN0cmluZ106IE9iamVjdDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhhbmRsZXMgdGhlIGV4dGVybmFsIHNlcmlhbGl6YXRpb24gYW5kIGRlc2VyaWFsaXphdGlvbiBvZiBbW1NlcmlhbGl6YWJsZV1dIG9iamVjdHMuIFRoZSBpbnRlcm5hbCBwcm9jZXNzIGlzIGhhbmRsZWQgYnkgdGhlIG9iamVjdHMgdGhlbXNlbHZlcy4gIFxyXG4gICAgICogQSBbW1NlcmlhbGl6YXRpb25dXSBvYmplY3QgY2FuIGJlIGNyZWF0ZWQgZnJvbSBhIFtbU2VyaWFsaXphYmxlXV0gb2JqZWN0IGFuZCBhIEpTT04tU3RyaW5nIG1heSBiZSBjcmVhdGVkIGZyb20gdGhhdC4gIFxyXG4gICAgICogVmljZSB2ZXJzYSwgYSBKU09OLVN0cmluZyBjYW4gYmUgcGFyc2VkIHRvIGEgW1tTZXJpYWxpemF0aW9uXV0gd2hpY2ggY2FuIGJlIGRlc2VyaWFsaXplZCB0byBhIFtbU2VyaWFsaXphYmxlXV0gb2JqZWN0LlxyXG4gICAgICogYGBgcGxhaW50ZXh0XHJcbiAgICAgKiAgW1NlcmlhbGl6YWJsZV0g4oaSIChzZXJpYWxpemUpIOKGkiBbU2VyaWFsaXphdGlvbl0g4oaSIChzdHJpbmdpZnkpICBcclxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDihpNcclxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtTdHJpbmddXHJcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4oaTXHJcbiAgICAgKiAgW1NlcmlhbGl6YWJsZV0g4oaQIChkZXNlcmlhbGl6ZSkg4oaQIFtTZXJpYWxpemF0aW9uXSDihpAgKHBhcnNlKVxyXG4gICAgICogYGBgICAgICAgXHJcbiAgICAgKiBXaGlsZSB0aGUgaW50ZXJuYWwgc2VyaWFsaXplL2Rlc2VyaWFsaXplIG1ldGhvZHMgb2YgdGhlIG9iamVjdHMgY2FyZSBvZiB0aGUgc2VsZWN0aW9uIG9mIGluZm9ybWF0aW9uIG5lZWRlZCB0byByZWNyZWF0ZSB0aGUgb2JqZWN0IGFuZCBpdHMgc3RydWN0dXJlLCAgXHJcbiAgICAgKiB0aGUgW1tTZXJpYWxpemVyXV0ga2VlcHMgdHJhY2sgb2YgdGhlIG5hbWVzcGFjZXMgYW5kIGNsYXNzZXMgaW4gb3JkZXIgdG8gcmVjcmVhdGUgW1tTZXJpYWxpemFibGVdXSBvYmplY3RzLiBUaGUgZ2VuZXJhbCBzdHJ1Y3R1cmUgb2YgYSBbW1NlcmlhbGl6YXRpb25dXSBpcyBhcyBmb2xsb3dzICBcclxuICAgICAqIGBgYHBsYWludGV4dFxyXG4gICAgICoge1xyXG4gICAgICogICAgICBuYW1lc3BhY2VOYW1lLmNsYXNzTmFtZToge1xyXG4gICAgICogICAgICAgICAgcHJvcGVydHlOYW1lOiBwcm9wZXJ0eVZhbHVlLFxyXG4gICAgICogICAgICAgICAgLi4uLFxyXG4gICAgICogICAgICAgICAgcHJvcGVydHlOYW1lT2ZSZWZlcmVuY2U6IFNlcmlhbGl6YXRpb25PZlRoZVJlZmVyZW5jZWRPYmplY3QsXHJcbiAgICAgKiAgICAgICAgICAuLi4sXHJcbiAgICAgKiAgICAgICAgICBjb25zdHJ1Y3Rvck5hbWVPZlN1cGVyY2xhc3M6IFNlcmlhbGl6YXRpb25PZlN1cGVyQ2xhc3NcclxuICAgICAqICAgICAgfVxyXG4gICAgICogfVxyXG4gICAgICogYGBgXHJcbiAgICAgKiBTaW5jZSB0aGUgaW5zdGFuY2Ugb2YgdGhlIHN1cGVyY2xhc3MgaXMgY3JlYXRlZCBhdXRvbWF0aWNhbGx5IHdoZW4gYW4gb2JqZWN0IGlzIGNyZWF0ZWQsIFxyXG4gICAgICogdGhlIFNlcmlhbGl6YXRpb25PZlN1cGVyQ2xhc3Mgb21pdHMgdGhlIHRoZSBuYW1lc3BhY2VOYW1lLmNsYXNzTmFtZSBrZXkgYW5kIGNvbnNpc3RzIG9ubHkgb2YgaXRzIHZhbHVlLiBcclxuICAgICAqIFRoZSBjb25zdHJ1Y3Rvck5hbWVPZlN1cGVyY2xhc3MgaXMgZ2l2ZW4gaW5zdGVhZCBhcyBhIHByb3BlcnR5IG5hbWUgaW4gdGhlIHNlcmlhbGl6YXRpb24gb2YgdGhlIHN1YmNsYXNzLlxyXG4gICAgICovXHJcbiAgICBleHBvcnQgYWJzdHJhY3QgY2xhc3MgU2VyaWFsaXplciB7XHJcbiAgICAgICAgLyoqIEluIG9yZGVyIGZvciB0aGUgU2VyaWFsaXplciB0byBjcmVhdGUgY2xhc3MgaW5zdGFuY2VzLCBpdCBuZWVkcyBhY2Nlc3MgdG8gdGhlIGFwcHJvcHJpYXRlIG5hbWVzcGFjZXMgKi9cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBuYW1lc3BhY2VzOiBOYW1lc3BhY2VSZWdpc3RlciA9IHsgXCLGklwiOiBGdWRnZUNvcmUgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVnaXN0ZXJzIGEgbmFtZXNwYWNlIHRvIHRoZSBbW1NlcmlhbGl6ZXJdXSwgdG8gZW5hYmxlIGF1dG9tYXRpYyBpbnN0YW50aWF0aW9uIG9mIGNsYXNzZXMgZGVmaW5lZCB3aXRoaW5cclxuICAgICAgICAgKiBAcGFyYW0gX25hbWVzcGFjZSBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHJlZ2lzdGVyTmFtZXNwYWNlKF9uYW1lc3BhY2U6IE9iamVjdCk6IHZvaWQge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBuYW1lIGluIFNlcmlhbGl6ZXIubmFtZXNwYWNlcylcclxuICAgICAgICAgICAgICAgIGlmIChTZXJpYWxpemVyLm5hbWVzcGFjZXNbbmFtZV0gPT0gX25hbWVzcGFjZSlcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgICAgICBsZXQgbmFtZTogc3RyaW5nID0gU2VyaWFsaXplci5maW5kTmFtZXNwYWNlSW4oX25hbWVzcGFjZSwgd2luZG93KTtcclxuICAgICAgICAgICAgaWYgKCFuYW1lKVxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgcGFyZW50TmFtZSBpbiBTZXJpYWxpemVyLm5hbWVzcGFjZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lID0gU2VyaWFsaXplci5maW5kTmFtZXNwYWNlSW4oX25hbWVzcGFjZSwgU2VyaWFsaXplci5uYW1lc3BhY2VzW3BhcmVudE5hbWVdKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lID0gcGFyZW50TmFtZSArIFwiLlwiICsgbmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFuYW1lKVxyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTmFtZXNwYWNlIG5vdCBmb3VuZC4gTWF5YmUgcGFyZW50IG5hbWVzcGFjZSBoYXNuJ3QgYmVlbiByZWdpc3RlcmVkIGJlZm9yZT9cIik7XHJcblxyXG4gICAgICAgICAgICBTZXJpYWxpemVyLm5hbWVzcGFjZXNbbmFtZV0gPSBfbmFtZXNwYWNlO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgYSBqYXZhc2NyaXB0IG9iamVjdCByZXByZXNlbnRpbmcgdGhlIHNlcmlhbGl6YWJsZSBGVURHRS1vYmplY3QgZ2l2ZW4sXHJcbiAgICAgICAgICogaW5jbHVkaW5nIGF0dGFjaGVkIGNvbXBvbmVudHMsIGNoaWxkcmVuLCBzdXBlcmNsYXNzLW9iamVjdHMgYWxsIGluZm9ybWF0aW9uIG5lZWRlZCBmb3IgcmVjb25zdHJ1Y3Rpb25cclxuICAgICAgICAgKiBAcGFyYW0gX29iamVjdCBBbiBvYmplY3QgdG8gc2VyaWFsaXplLCBpbXBsZW1lbnRpbmcgdGhlIFtbU2VyaWFsaXphYmxlXV0gaW50ZXJmYWNlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBzZXJpYWxpemUoX29iamVjdDogU2VyaWFsaXphYmxlKTogU2VyaWFsaXphdGlvbiB7XHJcbiAgICAgICAgICAgIGxldCBzZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uID0ge307XHJcbiAgICAgICAgICAgIC8vIFRPRE86IHNhdmUgdGhlIG5hbWVzcGFjZSB3aXRoIHRoZSBjb25zdHJ1Y3RvcnMgbmFtZVxyXG4gICAgICAgICAgICAvLyBzZXJpYWxpemF0aW9uW19vYmplY3QuY29uc3RydWN0b3IubmFtZV0gPSBfb2JqZWN0LnNlcmlhbGl6ZSgpO1xyXG4gICAgICAgICAgICBsZXQgcGF0aDogc3RyaW5nID0gdGhpcy5nZXRGdWxsUGF0aChfb2JqZWN0KTtcclxuICAgICAgICAgICAgaWYgKCFwYXRoKVxyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBOYW1lc3BhY2Ugb2Ygc2VyaWFsaXphYmxlIG9iamVjdCBvZiB0eXBlICR7X29iamVjdC5jb25zdHJ1Y3Rvci5uYW1lfSBub3QgZm91bmQuIE1heWJlIHRoZSBuYW1lc3BhY2UgaGFzbid0IGJlZW4gcmVnaXN0ZXJlZCBvciB0aGUgY2xhc3Mgbm90IGV4cG9ydGVkP2ApO1xyXG4gICAgICAgICAgICBzZXJpYWxpemF0aW9uW3BhdGhdID0gX29iamVjdC5zZXJpYWxpemUoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHNlcmlhbGl6YXRpb247XHJcbiAgICAgICAgICAgIC8vIHJldHVybiBfb2JqZWN0LnNlcmlhbGl6ZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyBhIEZVREdFLW9iamVjdCByZWNvbnN0cnVjdGVkIGZyb20gdGhlIGluZm9ybWF0aW9uIGluIHRoZSBbW1NlcmlhbGl6YXRpb25dXSBnaXZlbixcclxuICAgICAgICAgKiBpbmNsdWRpbmcgYXR0YWNoZWQgY29tcG9uZW50cywgY2hpbGRyZW4sIHN1cGVyY2xhc3Mtb2JqZWN0c1xyXG4gICAgICAgICAqIEBwYXJhbSBfc2VyaWFsaXphdGlvbiBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uKTogU2VyaWFsaXphYmxlIHtcclxuICAgICAgICAgICAgbGV0IHJlY29uc3RydWN0OiBTZXJpYWxpemFibGU7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAvLyBsb29wIGNvbnN0cnVjdGVkIHNvbGVseSB0byBhY2Nlc3MgdHlwZS1wcm9wZXJ0eS4gT25seSBvbmUgZXhwZWN0ZWQhXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBwYXRoIGluIF9zZXJpYWxpemF0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gcmVjb25zdHJ1Y3QgPSBuZXcgKDxHZW5lcmFsPkZ1ZGdlKVt0eXBlTmFtZV07XHJcbiAgICAgICAgICAgICAgICAgICAgcmVjb25zdHJ1Y3QgPSBTZXJpYWxpemVyLnJlY29uc3RydWN0KHBhdGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlY29uc3RydWN0LmRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uW3BhdGhdKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVjb25zdHJ1Y3Q7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKG1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkRlc2VyaWFsaXphdGlvbiBmYWlsZWQ6IFwiICsgbWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL1RPRE86IGltcGxlbWVudCBwcmV0dGlmaWVyIHRvIG1ha2UgSlNPTi1TdHJpbmdpZmljYXRpb24gb2Ygc2VyaWFsaXphdGlvbnMgbW9yZSByZWFkYWJsZSwgZS5nLiBwbGFjaW5nIHgsIHkgYW5kIHogaW4gb25lIGxpbmVcclxuICAgICAgICBwdWJsaWMgc3RhdGljIHByZXR0aWZ5KF9qc29uOiBzdHJpbmcpOiBzdHJpbmcgeyByZXR1cm4gX2pzb247IH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyBhIGZvcm1hdHRlZCwgaHVtYW4gcmVhZGFibGUgSlNPTi1TdHJpbmcsIHJlcHJlc2VudGluZyB0aGUgZ2l2ZW4gW1tTZXJpYWxpemFpb25dXSB0aGF0IG1heSBoYXZlIGJlZW4gY3JlYXRlZCBieSBbW1NlcmlhbGl6ZXJdXS5zZXJpYWxpemVcclxuICAgICAgICAgKiBAcGFyYW0gX3NlcmlhbGl6YXRpb25cclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHN0cmluZ2lmeShfc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbik6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIC8vIGFkanVzdG1lbnRzIHRvIHNlcmlhbGl6YXRpb24gY2FuIGJlIG1hZGUgaGVyZSBiZWZvcmUgc3RyaW5naWZpY2F0aW9uLCBpZiBkZXNpcmVkXHJcbiAgICAgICAgICAgIGxldCBqc29uOiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeShfc2VyaWFsaXphdGlvbiwgbnVsbCwgMik7XHJcbiAgICAgICAgICAgIGxldCBwcmV0dHk6IHN0cmluZyA9IFNlcmlhbGl6ZXIucHJldHRpZnkoanNvbik7XHJcbiAgICAgICAgICAgIHJldHVybiBwcmV0dHk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIGEgW1tTZXJpYWxpemF0aW9uXV0gY3JlYXRlZCBmcm9tIHRoZSBnaXZlbiBKU09OLVN0cmluZy4gUmVzdWx0IG1heSBiZSBwYXNzZWQgdG8gW1tTZXJpYWxpemVyXV0uZGVzZXJpYWxpemVcclxuICAgICAgICAgKiBAcGFyYW0gX2pzb24gXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBwYXJzZShfanNvbjogc3RyaW5nKTogU2VyaWFsaXphdGlvbiB7XHJcbiAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKF9qc29uKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ3JlYXRlcyBhbiBvYmplY3Qgb2YgdGhlIGNsYXNzIGRlZmluZWQgd2l0aCB0aGUgZnVsbCBwYXRoIGluY2x1ZGluZyB0aGUgbmFtZXNwYWNlTmFtZShzKSBhbmQgdGhlIGNsYXNzTmFtZSBzZXBlcmF0ZWQgYnkgZG90cyguKSBcclxuICAgICAgICAgKiBAcGFyYW0gX3BhdGggXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgcmVjb25zdHJ1Y3QoX3BhdGg6IHN0cmluZyk6IFNlcmlhbGl6YWJsZSB7XHJcbiAgICAgICAgICAgIGxldCB0eXBlTmFtZTogc3RyaW5nID0gX3BhdGguc3Vic3RyKF9wYXRoLmxhc3RJbmRleE9mKFwiLlwiKSArIDEpO1xyXG4gICAgICAgICAgICBsZXQgbmFtZXNwYWNlOiBPYmplY3QgPSBTZXJpYWxpemVyLmdldE5hbWVzcGFjZShfcGF0aCk7XHJcbiAgICAgICAgICAgIGlmICghbmFtZXNwYWNlKVxyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBOYW1lc3BhY2Ugb2Ygc2VyaWFsaXphYmxlIG9iamVjdCBvZiB0eXBlICR7dHlwZU5hbWV9IG5vdCBmb3VuZC4gTWF5YmUgdGhlIG5hbWVzcGFjZSBoYXNuJ3QgYmVlbiByZWdpc3RlcmVkP2ApO1xyXG4gICAgICAgICAgICBsZXQgcmVjb25zdHJ1Y3Rpb246IFNlcmlhbGl6YWJsZSA9IG5ldyAoPEdlbmVyYWw+bmFtZXNwYWNlKVt0eXBlTmFtZV07XHJcbiAgICAgICAgICAgIHJldHVybiByZWNvbnN0cnVjdGlvbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgdGhlIGZ1bGwgcGF0aCB0byB0aGUgY2xhc3Mgb2YgdGhlIG9iamVjdCwgaWYgZm91bmQgaW4gdGhlIHJlZ2lzdGVyZWQgbmFtZXNwYWNlc1xyXG4gICAgICAgICAqIEBwYXJhbSBfb2JqZWN0IFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGdldEZ1bGxQYXRoKF9vYmplY3Q6IFNlcmlhbGl6YWJsZSk6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIGxldCB0eXBlTmFtZTogc3RyaW5nID0gX29iamVjdC5jb25zdHJ1Y3Rvci5uYW1lO1xyXG4gICAgICAgICAgICAvLyBEZWJ1Zy5sb2coXCJTZWFyY2hpbmcgbmFtZXNwYWNlIG9mOiBcIiArIHR5cGVOYW1lKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgbmFtZXNwYWNlTmFtZSBpbiBTZXJpYWxpemVyLm5hbWVzcGFjZXMpIHtcclxuICAgICAgICAgICAgICAgIGxldCBmb3VuZDogR2VuZXJhbCA9ICg8R2VuZXJhbD5TZXJpYWxpemVyLm5hbWVzcGFjZXMpW25hbWVzcGFjZU5hbWVdW3R5cGVOYW1lXTtcclxuICAgICAgICAgICAgICAgIGlmIChmb3VuZCAmJiBfb2JqZWN0IGluc3RhbmNlb2YgZm91bmQpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5hbWVzcGFjZU5hbWUgKyBcIi5cIiArIHR5cGVOYW1lO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgbmFtZXNwYWNlLW9iamVjdCBkZWZpbmVkIHdpdGhpbiB0aGUgZnVsbCBwYXRoLCBpZiByZWdpc3RlcmVkXHJcbiAgICAgICAgICogQHBhcmFtIF9wYXRoXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgZ2V0TmFtZXNwYWNlKF9wYXRoOiBzdHJpbmcpOiBPYmplY3Qge1xyXG4gICAgICAgICAgICBsZXQgbmFtZXNwYWNlTmFtZTogc3RyaW5nID0gX3BhdGguc3Vic3RyKDAsIF9wYXRoLmxhc3RJbmRleE9mKFwiLlwiKSk7XHJcbiAgICAgICAgICAgIHJldHVybiBTZXJpYWxpemVyLm5hbWVzcGFjZXNbbmFtZXNwYWNlTmFtZV07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBGaW5kcyB0aGUgbmFtZXNwYWNlLW9iamVjdCBpbiBwcm9wZXJ0aWVzIG9mIHRoZSBwYXJlbnQtb2JqZWN0IChlLmcuIHdpbmRvdyksIGlmIHByZXNlbnRcclxuICAgICAgICAgKiBAcGFyYW0gX25hbWVzcGFjZSBcclxuICAgICAgICAgKiBAcGFyYW0gX3BhcmVudCBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBmaW5kTmFtZXNwYWNlSW4oX25hbWVzcGFjZTogT2JqZWN0LCBfcGFyZW50OiBPYmplY3QpOiBzdHJpbmcge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBwcm9wIGluIF9wYXJlbnQpXHJcbiAgICAgICAgICAgICAgICBpZiAoKDxHZW5lcmFsPl9wYXJlbnQpW3Byb3BdID09IF9uYW1lc3BhY2UpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByb3A7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBJbnRlcmZhY2UgZGVzY3JpYmluZyB0aGUgZGF0YXR5cGVzIG9mIHRoZSBhdHRyaWJ1dGVzIGEgbXV0YXRvciBhcyBzdHJpbmdzIFxyXG4gICAgICovXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIE11dGF0b3JBdHRyaWJ1dGVUeXBlcyB7XHJcbiAgICAgICAgW2F0dHJpYnV0ZTogc3RyaW5nXTogc3RyaW5nIHwgT2JqZWN0O1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnRlcmZhY2UgZGVzY3JpYmluZyBhIG11dGF0b3IsIHdoaWNoIGlzIGFuIGFzc29jaWF0aXZlIGFycmF5IHdpdGggbmFtZXMgb2YgYXR0cmlidXRlcyBhbmQgdGhlaXIgY29ycmVzcG9uZGluZyB2YWx1ZXNcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGludGVyZmFjZSBNdXRhdG9yIHtcclxuICAgICAgICBbYXR0cmlidXRlOiBzdHJpbmddOiBPYmplY3Q7XHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIEludGVyZmFjZXMgZGVkaWNhdGVkIGZvciBlYWNoIHB1cnBvc2UuIEV4dHJhIGF0dHJpYnV0ZSBuZWNlc3NhcnkgZm9yIGNvbXBpbGV0aW1lIHR5cGUgY2hlY2tpbmcsIG5vdCBleGlzdGVudCBhdCBydW50aW1lXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgTXV0YXRvckZvckFuaW1hdGlvbiBleHRlbmRzIE11dGF0b3IgeyByZWFkb25seSBmb3JBbmltYXRpb246IG51bGw7IH1cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgTXV0YXRvckZvclVzZXJJbnRlcmZhY2UgZXh0ZW5kcyBNdXRhdG9yIHsgcmVhZG9ubHkgZm9yVXNlckludGVyZmFjZTogbnVsbDsgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQmFzZSBjbGFzcyBmb3IgYWxsIHR5cGVzIGJlaW5nIG11dGFibGUgdXNpbmcgW1tNdXRhdG9yXV0tb2JqZWN0cywgdGh1cyBwcm92aWRpbmcgYW5kIHVzaW5nIGludGVyZmFjZXMgY3JlYXRlZCBhdCBydW50aW1lLiAgXHJcbiAgICAgKiBNdXRhYmxlcyBwcm92aWRlIGEgW1tNdXRhdG9yXV0gdGhhdCBpcyBidWlsZCBieSBjb2xsZWN0aW5nIGFsbCBvYmplY3QtcHJvcGVydGllcyB0aGF0IGFyZSBlaXRoZXIgb2YgYSBwcmltaXRpdmUgdHlwZSBvciBhZ2FpbiBNdXRhYmxlLlxyXG4gICAgICogU3ViY2xhc3NlcyBjYW4gZWl0aGVyIHJlZHVjZSB0aGUgc3RhbmRhcmQgW1tNdXRhdG9yXV0gYnVpbHQgYnkgdGhpcyBiYXNlIGNsYXNzIGJ5IGRlbGV0aW5nIHByb3BlcnRpZXMgb3IgaW1wbGVtZW50IGFuIGluZGl2aWR1YWwgZ2V0TXV0YXRvci1tZXRob2QuXHJcbiAgICAgKiBUaGUgcHJvdmlkZWQgcHJvcGVydGllcyBvZiB0aGUgW1tNdXRhdG9yXV0gbXVzdCBtYXRjaCBwdWJsaWMgcHJvcGVydGllcyBvciBnZXR0ZXJzL3NldHRlcnMgb2YgdGhlIG9iamVjdC5cclxuICAgICAqIE90aGVyd2lzZSwgdGhleSB3aWxsIGJlIGlnbm9yZWQgaWYgbm90IGhhbmRsZWQgYnkgYW4gb3ZlcnJpZGUgb2YgdGhlIG11dGF0ZS1tZXRob2QgaW4gdGhlIHN1YmNsYXNzIGFuZCB0aHJvdyBlcnJvcnMgaW4gYW4gYXV0b21hdGljYWxseSBnZW5lcmF0ZWQgdXNlci1pbnRlcmZhY2UgZm9yIHRoZSBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBhYnN0cmFjdCBjbGFzcyBNdXRhYmxlIGV4dGVuZHMgRXZlbnRUYXJnZXQge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHJpZXZlcyB0aGUgdHlwZSBvZiB0aGlzIG11dGFibGUgc3ViY2xhc3MgYXMgdGhlIG5hbWUgb2YgdGhlIHJ1bnRpbWUgY2xhc3NcclxuICAgICAgICAgKiBAcmV0dXJucyBUaGUgdHlwZSBvZiB0aGUgbXV0YWJsZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBnZXQgdHlwZSgpOiBzdHJpbmcge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci5uYW1lO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDb2xsZWN0IGFwcGxpY2FibGUgYXR0cmlidXRlcyBvZiB0aGUgaW5zdGFuY2UgYW5kIGNvcGllcyBvZiB0aGVpciB2YWx1ZXMgaW4gYSBNdXRhdG9yLW9iamVjdFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBnZXRNdXRhdG9yKCk6IE11dGF0b3Ige1xyXG4gICAgICAgICAgICBsZXQgbXV0YXRvcjogTXV0YXRvciA9IHt9O1xyXG5cclxuICAgICAgICAgICAgLy8gY29sbGVjdCBwcmltaXRpdmUgYW5kIG11dGFibGUgYXR0cmlidXRlc1xyXG4gICAgICAgICAgICBmb3IgKGxldCBhdHRyaWJ1dGUgaW4gdGhpcykge1xyXG4gICAgICAgICAgICAgICAgbGV0IHZhbHVlOiBPYmplY3QgPSB0aGlzW2F0dHJpYnV0ZV07XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBGdW5jdGlvbilcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIE9iamVjdCAmJiAhKHZhbHVlIGluc3RhbmNlb2YgTXV0YWJsZSkpXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICBtdXRhdG9yW2F0dHJpYnV0ZV0gPSB0aGlzW2F0dHJpYnV0ZV07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIG11dGF0b3IgY2FuIGJlIHJlZHVjZWQgYnV0IG5vdCBleHRlbmRlZCFcclxuICAgICAgICAgICAgT2JqZWN0LnByZXZlbnRFeHRlbnNpb25zKG11dGF0b3IpO1xyXG4gICAgICAgICAgICAvLyBkZWxldGUgdW53YW50ZWQgYXR0cmlidXRlc1xyXG4gICAgICAgICAgICB0aGlzLnJlZHVjZU11dGF0b3IobXV0YXRvcik7XHJcblxyXG4gICAgICAgICAgICAvLyByZXBsYWNlIHJlZmVyZW5jZXMgdG8gbXV0YWJsZSBvYmplY3RzIHdpdGggcmVmZXJlbmNlcyB0byBjb3BpZXNcclxuICAgICAgICAgICAgZm9yIChsZXQgYXR0cmlidXRlIGluIG11dGF0b3IpIHtcclxuICAgICAgICAgICAgICAgIGxldCB2YWx1ZTogT2JqZWN0ID0gbXV0YXRvclthdHRyaWJ1dGVdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgTXV0YWJsZSlcclxuICAgICAgICAgICAgICAgICAgICBtdXRhdG9yW2F0dHJpYnV0ZV0gPSB2YWx1ZS5nZXRNdXRhdG9yKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBtdXRhdG9yO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ29sbGVjdCB0aGUgYXR0cmlidXRlcyBvZiB0aGUgaW5zdGFuY2UgYW5kIHRoZWlyIHZhbHVlcyBhcHBsaWNhYmxlIGZvciBhbmltYXRpb24uXHJcbiAgICAgICAgICogQmFzaWMgZnVuY3Rpb25hbGl0eSBpcyBpZGVudGljYWwgdG8gW1tnZXRNdXRhdG9yXV0sIHJldHVybmVkIG11dGF0b3Igc2hvdWxkIHRoZW4gYmUgcmVkdWNlZCBieSB0aGUgc3ViY2xhc3NlZCBpbnN0YW5jZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBnZXRNdXRhdG9yRm9yQW5pbWF0aW9uKCk6IE11dGF0b3JGb3JBbmltYXRpb24ge1xyXG4gICAgICAgICAgICByZXR1cm4gPE11dGF0b3JGb3JBbmltYXRpb24+dGhpcy5nZXRNdXRhdG9yKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENvbGxlY3QgdGhlIGF0dHJpYnV0ZXMgb2YgdGhlIGluc3RhbmNlIGFuZCB0aGVpciB2YWx1ZXMgYXBwbGljYWJsZSBmb3IgdGhlIHVzZXIgaW50ZXJmYWNlLlxyXG4gICAgICAgICAqIEJhc2ljIGZ1bmN0aW9uYWxpdHkgaXMgaWRlbnRpY2FsIHRvIFtbZ2V0TXV0YXRvcl1dLCByZXR1cm5lZCBtdXRhdG9yIHNob3VsZCB0aGVuIGJlIHJlZHVjZWQgYnkgdGhlIHN1YmNsYXNzZWQgaW5zdGFuY2VcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0TXV0YXRvckZvclVzZXJJbnRlcmZhY2UoKTogTXV0YXRvckZvclVzZXJJbnRlcmZhY2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gPE11dGF0b3JGb3JVc2VySW50ZXJmYWNlPnRoaXMuZ2V0TXV0YXRvcigpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIGFuIGFzc29jaWF0aXZlIGFycmF5IHdpdGggdGhlIHNhbWUgYXR0cmlidXRlcyBhcyB0aGUgZ2l2ZW4gbXV0YXRvciwgYnV0IHdpdGggdGhlIGNvcnJlc3BvbmRpbmcgdHlwZXMgYXMgc3RyaW5nLXZhbHVlc1xyXG4gICAgICAgICAqIERvZXMgbm90IHJlY3Vyc2UgaW50byBvYmplY3RzIVxyXG4gICAgICAgICAqIEBwYXJhbSBfbXV0YXRvciBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0TXV0YXRvckF0dHJpYnV0ZVR5cGVzKF9tdXRhdG9yOiBNdXRhdG9yKTogTXV0YXRvckF0dHJpYnV0ZVR5cGVzIHtcclxuICAgICAgICAgICAgbGV0IHR5cGVzOiBNdXRhdG9yQXR0cmlidXRlVHlwZXMgPSB7fTtcclxuICAgICAgICAgICAgZm9yIChsZXQgYXR0cmlidXRlIGluIF9tdXRhdG9yKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdHlwZTogc3RyaW5nID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIGxldCB2YWx1ZTogbnVtYmVyIHwgYm9vbGVhbiB8IHN0cmluZyB8IG9iamVjdCA9IF9tdXRhdG9yW2F0dHJpYnV0ZV07XHJcbiAgICAgICAgICAgICAgICBpZiAoX211dGF0b3JbYXR0cmlidXRlXSAhPSB1bmRlZmluZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiAodmFsdWUpID09IFwib2JqZWN0XCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGUgPSAoPEdlbmVyYWw+dGhpcylbYXR0cmlidXRlXS5jb25zdHJ1Y3Rvci5uYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZSA9IF9tdXRhdG9yW2F0dHJpYnV0ZV0uY29uc3RydWN0b3IubmFtZTtcclxuICAgICAgICAgICAgICAgIHR5cGVzW2F0dHJpYnV0ZV0gPSB0eXBlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0eXBlcztcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVXBkYXRlcyB0aGUgdmFsdWVzIG9mIHRoZSBnaXZlbiBtdXRhdG9yIGFjY29yZGluZyB0byB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgaW5zdGFuY2VcclxuICAgICAgICAgKiBAcGFyYW0gX211dGF0b3IgXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHVwZGF0ZU11dGF0b3IoX211dGF0b3I6IE11dGF0b3IpOiB2b2lkIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgYXR0cmlidXRlIGluIF9tdXRhdG9yKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdmFsdWU6IE9iamVjdCA9IF9tdXRhdG9yW2F0dHJpYnV0ZV07XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBNdXRhYmxlKVxyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUuZ2V0TXV0YXRvcigpO1xyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIF9tdXRhdG9yW2F0dHJpYnV0ZV0gPSAoPEdlbmVyYWw+dGhpcylbYXR0cmlidXRlXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBVcGRhdGVzIHRoZSBhdHRyaWJ1dGUgdmFsdWVzIG9mIHRoZSBpbnN0YW5jZSBhY2NvcmRpbmcgdG8gdGhlIHN0YXRlIG9mIHRoZSBtdXRhdG9yLiBNdXN0IGJlIHByb3RlY3RlZC4uLiFcclxuICAgICAgICAgKiBAcGFyYW0gX211dGF0b3JcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgbXV0YXRlKF9tdXRhdG9yOiBNdXRhdG9yKTogdm9pZCB7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IGRvbid0IGFzc2lnbiB1bmtub3duIHByb3BlcnRpZXNcclxuICAgICAgICAgICAgZm9yIChsZXQgYXR0cmlidXRlIGluIF9tdXRhdG9yKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdmFsdWU6IE11dGF0b3IgPSA8TXV0YXRvcj5fbXV0YXRvclthdHRyaWJ1dGVdO1xyXG4gICAgICAgICAgICAgICAgbGV0IG11dGFudDogT2JqZWN0ID0gKDxHZW5lcmFsPnRoaXMpW2F0dHJpYnV0ZV07XHJcbiAgICAgICAgICAgICAgICBpZiAobXV0YW50IGluc3RhbmNlb2YgTXV0YWJsZSlcclxuICAgICAgICAgICAgICAgICAgICBtdXRhbnQubXV0YXRlKHZhbHVlKTtcclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICAoPEdlbmVyYWw+dGhpcylbYXR0cmlidXRlXSA9IHZhbHVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoRVZFTlQuTVVUQVRFKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlZHVjZXMgdGhlIGF0dHJpYnV0ZXMgb2YgdGhlIGdlbmVyYWwgbXV0YXRvciBhY2NvcmRpbmcgdG8gZGVzaXJlZCBvcHRpb25zIGZvciBtdXRhdGlvbi4gVG8gYmUgaW1wbGVtZW50ZWQgaW4gc3ViY2xhc3Nlc1xyXG4gICAgICAgICAqIEBwYXJhbSBfbXV0YXRvciBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVkdWNlTXV0YXRvcihfbXV0YXRvcjogTXV0YXRvcik6IHZvaWQ7XHJcbiAgICB9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL1RyYW5zZmVyL1NlcmlhbGl6ZXIudHNcIi8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9UcmFuc2Zlci9NdXRhYmxlLnRzXCIvPlxyXG5cclxubmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgLyoqXHJcbiAgICogSG9sZHMgaW5mb3JtYXRpb24gYWJvdXQgdGhlIEFuaW1hdGlvblN0cnVjdHVyZSB0aGF0IHRoZSBBbmltYXRpb24gdXNlcyB0byBtYXAgdGhlIFNlcXVlbmNlcyB0byB0aGUgQXR0cmlidXRlcy5cclxuICAgKiBCdWlsdCBvdXQgb2YgYSBbW05vZGVdXSdzIHNlcmlhbHNhdGlvbiwgaXQgc3dhcHMgdGhlIHZhbHVlcyB3aXRoIFtbQW5pbWF0aW9uU2VxdWVuY2VdXXMuXHJcbiAgICovXHJcbiAgZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25TdHJ1Y3R1cmUge1xyXG4gICAgW2F0dHJpYnV0ZTogc3RyaW5nXTogU2VyaWFsaXphdGlvbiB8IEFuaW1hdGlvblNlcXVlbmNlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBBbiBhc3NvY2lhdGl2ZSBhcnJheSBtYXBwaW5nIG5hbWVzIG9mIGxhYmxlcyB0byB0aW1lc3RhbXBzLlxyXG4gICogTGFiZWxzIG5lZWQgdG8gYmUgdW5pcXVlIHBlciBBbmltYXRpb24uXHJcbiAgKiBAYXV0aG9yIEx1a2FzIFNjaGV1ZXJsZSwgSEZVLCAyMDE5XHJcbiAgKi9cclxuICBleHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvbkxhYmVsIHtcclxuICAgIFtuYW1lOiBzdHJpbmddOiBudW1iZXI7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIEhvbGRzIGluZm9ybWF0aW9uIGFib3V0IEFuaW1hdGlvbiBFdmVudCBUcmlnZ2Vyc1xyXG4gICogQGF1dGhvciBMdWthcyBTY2hldWVybGUsIEhGVSwgMjAxOVxyXG4gICovXHJcbiAgZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25FdmVudFRyaWdnZXIge1xyXG4gICAgW25hbWU6IHN0cmluZ106IG51bWJlcjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEludGVybmFsbHkgdXNlZCB0byBkaWZmZXJlbnRpYXRlIGJldHdlZW4gdGhlIHZhcmlvdXMgZ2VuZXJhdGVkIHN0cnVjdHVyZXMgYW5kIGV2ZW50cy5cclxuICAgKiBAYXV0aG9yIEx1a2FzIFNjaGV1ZXJsZSwgSEZVLCAyMDE5XHJcbiAgICovXHJcbiAgZW51bSBBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUge1xyXG4gICAgLyoqRGVmYXVsdDogZm9yd2FyZCwgY29udGlub3VzICovXHJcbiAgICBOT1JNQUwsXHJcbiAgICAvKipiYWNrd2FyZCwgY29udGlub3VzICovXHJcbiAgICBSRVZFUlNFLFxyXG4gICAgLyoqZm9yd2FyZCwgcmFzdGVyZWQgKi9cclxuICAgIFJBU1RFUkVELFxyXG4gICAgLyoqYmFja3dhcmQsIHJhc3RlcmVkICovXHJcbiAgICBSQVNURVJFRFJFVkVSU0VcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFuaW1hdGlvbiBDbGFzcyB0byBob2xkIGFsbCByZXF1aXJlZCBPYmplY3RzIHRoYXQgYXJlIHBhcnQgb2YgYW4gQW5pbWF0aW9uLlxyXG4gICAqIEFsc28gaG9sZHMgZnVuY3Rpb25zIHRvIHBsYXkgc2FpZCBBbmltYXRpb24uXHJcbiAgICogQ2FuIGJlIGFkZGVkIHRvIGEgTm9kZSBhbmQgcGxheWVkIHRocm91Z2ggW1tDb21wb25lbnRBbmltYXRvcl1dLlxyXG4gICAqIEBhdXRob3IgTHVrYXMgU2NoZXVlcmxlLCBIRlUsIDIwMTlcclxuICAgKi9cclxuICBleHBvcnQgY2xhc3MgQW5pbWF0aW9uIGV4dGVuZHMgTXV0YWJsZSBpbXBsZW1lbnRzIFNlcmlhbGl6YWJsZVJlc291cmNlIHtcclxuICAgIGlkUmVzb3VyY2U6IHN0cmluZztcclxuICAgIG5hbWU6IHN0cmluZztcclxuICAgIHRvdGFsVGltZTogbnVtYmVyID0gMDtcclxuICAgIGxhYmVsczogQW5pbWF0aW9uTGFiZWwgPSB7fTtcclxuICAgIHN0ZXBzUGVyU2Vjb25kOiBudW1iZXIgPSAxMDtcclxuICAgIGFuaW1hdGlvblN0cnVjdHVyZTogQW5pbWF0aW9uU3RydWN0dXJlO1xyXG4gICAgZXZlbnRzOiBBbmltYXRpb25FdmVudFRyaWdnZXIgPSB7fTtcclxuICAgIHByaXZhdGUgZnJhbWVzUGVyU2Vjb25kOiBudW1iZXIgPSA2MDtcclxuXHJcbiAgICAvLyBwcm9jZXNzZWQgZXZlbnRsaXN0IGFuZCBhbmltYXRpb24gc3RydWN1dHJlcyBmb3IgcGxheWJhY2suXHJcbiAgICBwcml2YXRlIGV2ZW50c1Byb2Nlc3NlZDogTWFwPEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRSwgQW5pbWF0aW9uRXZlbnRUcmlnZ2VyPiA9IG5ldyBNYXA8QU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFLCBBbmltYXRpb25FdmVudFRyaWdnZXI+KCk7XHJcbiAgICBwcml2YXRlIGFuaW1hdGlvblN0cnVjdHVyZXNQcm9jZXNzZWQ6IE1hcDxBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUsIEFuaW1hdGlvblN0cnVjdHVyZT4gPSBuZXcgTWFwPEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRSwgQW5pbWF0aW9uU3RydWN0dXJlPigpO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKF9uYW1lOiBzdHJpbmcsIF9hbmltU3RydWN0dXJlOiBBbmltYXRpb25TdHJ1Y3R1cmUgPSB7fSwgX2ZwczogbnVtYmVyID0gNjApIHtcclxuICAgICAgc3VwZXIoKTtcclxuICAgICAgdGhpcy5uYW1lID0gX25hbWU7XHJcbiAgICAgIHRoaXMuYW5pbWF0aW9uU3RydWN0dXJlID0gX2FuaW1TdHJ1Y3R1cmU7XHJcbiAgICAgIHRoaXMuYW5pbWF0aW9uU3RydWN0dXJlc1Byb2Nlc3NlZC5zZXQoQU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFLk5PUk1BTCwgX2FuaW1TdHJ1Y3R1cmUpO1xyXG4gICAgICB0aGlzLmZyYW1lc1BlclNlY29uZCA9IF9mcHM7XHJcbiAgICAgIHRoaXMuY2FsY3VsYXRlVG90YWxUaW1lKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZW5lcmF0ZXMgYSBuZXcgXCJNdXRhdG9yXCIgd2l0aCB0aGUgaW5mb3JtYXRpb24gdG8gYXBwbHkgdG8gdGhlIFtbTm9kZV1dIHRoZSBbW0NvbXBvbmVudEFuaW1hdG9yXV0gaXMgYXR0YWNoZWQgdG8gd2l0aCBbW05vZGUuYXBwbHlBbmltYXRpb24oKV1dLlxyXG4gICAgICogQHBhcmFtIF90aW1lIFRoZSB0aW1lIGF0IHdoaWNoIHRoZSBhbmltYXRpb24gY3VycmVudGx5IGlzIGF0XHJcbiAgICAgKiBAcGFyYW0gX2RpcmVjdGlvbiBUaGUgZGlyZWN0aW9uIGluIHdoaWNoIHRoZSBhbmltYXRpb24gaXMgc3VwcG9zZWQgdG8gYmUgcGxheWluZyBiYWNrLiA+MCA9PSBmb3J3YXJkLCAwID09IHN0b3AsIDwwID09IGJhY2t3YXJkc1xyXG4gICAgICogQHBhcmFtIF9wbGF5YmFjayBUaGUgcGxheWJhY2ttb2RlIHRoZSBhbmltYXRpb24gaXMgc3VwcG9zZWQgdG8gYmUgY2FsY3VsYXRlZCB3aXRoLlxyXG4gICAgICogQHJldHVybnMgYSBcIk11dGF0b3JcIiB0byBhcHBseS5cclxuICAgICAqL1xyXG4gICAgZ2V0TXV0YXRlZChfdGltZTogbnVtYmVyLCBfZGlyZWN0aW9uOiBudW1iZXIsIF9wbGF5YmFjazogQU5JTUFUSU9OX1BMQVlCQUNLKTogTXV0YXRvciB7ICAgICAvL1RPRE86IGZpbmQgYSBiZXR0ZXIgbmFtZSBmb3IgdGhpc1xyXG4gICAgICBsZXQgbTogTXV0YXRvciA9IHt9O1xyXG4gICAgICBpZiAoX3BsYXliYWNrID09IEFOSU1BVElPTl9QTEFZQkFDSy5USU1FQkFTRURfQ09OVElOT1VTKSB7XHJcbiAgICAgICAgaWYgKF9kaXJlY3Rpb24gPj0gMCkge1xyXG4gICAgICAgICAgbSA9IHRoaXMudHJhdmVyc2VTdHJ1Y3R1cmVGb3JNdXRhdG9yKHRoaXMuZ2V0UHJvY2Vzc2VkQW5pbWF0aW9uU3RydWN0dXJlKEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRS5OT1JNQUwpLCBfdGltZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG0gPSB0aGlzLnRyYXZlcnNlU3RydWN0dXJlRm9yTXV0YXRvcih0aGlzLmdldFByb2Nlc3NlZEFuaW1hdGlvblN0cnVjdHVyZShBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUuUkVWRVJTRSksIF90aW1lKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYgKF9kaXJlY3Rpb24gPj0gMCkge1xyXG4gICAgICAgICAgbSA9IHRoaXMudHJhdmVyc2VTdHJ1Y3R1cmVGb3JNdXRhdG9yKHRoaXMuZ2V0UHJvY2Vzc2VkQW5pbWF0aW9uU3RydWN0dXJlKEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRS5SQVNURVJFRCksIF90aW1lKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbSA9IHRoaXMudHJhdmVyc2VTdHJ1Y3R1cmVGb3JNdXRhdG9yKHRoaXMuZ2V0UHJvY2Vzc2VkQW5pbWF0aW9uU3RydWN0dXJlKEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRS5SQVNURVJFRFJFVkVSU0UpLCBfdGltZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gbTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBsaXN0IG9mIHRoZSBuYW1lcyBvZiB0aGUgZXZlbnRzIHRoZSBbW0NvbXBvbmVudEFuaW1hdG9yXV0gbmVlZHMgdG8gZmlyZSBiZXR3ZWVuIF9taW4gYW5kIF9tYXguIFxyXG4gICAgICogQHBhcmFtIF9taW4gVGhlIG1pbmltdW0gdGltZSAoaW5jbHVzaXZlKSB0byBjaGVjayBiZXR3ZWVuXHJcbiAgICAgKiBAcGFyYW0gX21heCBUaGUgbWF4aW11bSB0aW1lIChleGNsdXNpdmUpIHRvIGNoZWNrIGJldHdlZW5cclxuICAgICAqIEBwYXJhbSBfcGxheWJhY2sgVGhlIHBsYXliYWNrIG1vZGUgdG8gY2hlY2sgaW4uIEhhcyBhbiBlZmZlY3Qgb24gd2hlbiB0aGUgRXZlbnRzIGFyZSBmaXJlZC4gXHJcbiAgICAgKiBAcGFyYW0gX2RpcmVjdGlvbiBUaGUgZGlyZWN0aW9uIHRoZSBhbmltYXRpb24gaXMgc3VwcG9zZWQgdG8gcnVuIGluLiA+MCA9PSBmb3J3YXJkLCAwID09IHN0b3AsIDwwID09IGJhY2t3YXJkc1xyXG4gICAgICogQHJldHVybnMgYSBsaXN0IG9mIHN0cmluZ3Mgd2l0aCB0aGUgbmFtZXMgb2YgdGhlIGN1c3RvbSBldmVudHMgdG8gZmlyZS5cclxuICAgICAqL1xyXG4gICAgZ2V0RXZlbnRzVG9GaXJlKF9taW46IG51bWJlciwgX21heDogbnVtYmVyLCBfcGxheWJhY2s6IEFOSU1BVElPTl9QTEFZQkFDSywgX2RpcmVjdGlvbjogbnVtYmVyKTogc3RyaW5nW10ge1xyXG4gICAgICBsZXQgZXZlbnRMaXN0OiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICBsZXQgbWluU2VjdGlvbjogbnVtYmVyID0gTWF0aC5mbG9vcihfbWluIC8gdGhpcy50b3RhbFRpbWUpO1xyXG4gICAgICBsZXQgbWF4U2VjdGlvbjogbnVtYmVyID0gTWF0aC5mbG9vcihfbWF4IC8gdGhpcy50b3RhbFRpbWUpO1xyXG4gICAgICBfbWluID0gX21pbiAlIHRoaXMudG90YWxUaW1lO1xyXG4gICAgICBfbWF4ID0gX21heCAlIHRoaXMudG90YWxUaW1lO1xyXG5cclxuICAgICAgd2hpbGUgKG1pblNlY3Rpb24gPD0gbWF4U2VjdGlvbikge1xyXG4gICAgICAgIGxldCBldmVudFRyaWdnZXJzOiBBbmltYXRpb25FdmVudFRyaWdnZXIgPSB0aGlzLmdldENvcnJlY3RFdmVudExpc3QoX2RpcmVjdGlvbiwgX3BsYXliYWNrKTtcclxuICAgICAgICBpZiAobWluU2VjdGlvbiA9PSBtYXhTZWN0aW9uKSB7XHJcbiAgICAgICAgICBldmVudExpc3QgPSBldmVudExpc3QuY29uY2F0KHRoaXMuY2hlY2tFdmVudHNCZXR3ZWVuKGV2ZW50VHJpZ2dlcnMsIF9taW4sIF9tYXgpKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgZXZlbnRMaXN0ID0gZXZlbnRMaXN0LmNvbmNhdCh0aGlzLmNoZWNrRXZlbnRzQmV0d2VlbihldmVudFRyaWdnZXJzLCBfbWluLCB0aGlzLnRvdGFsVGltZSkpO1xyXG4gICAgICAgICAgX21pbiA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG1pblNlY3Rpb24rKztcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIGV2ZW50TGlzdDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgYW4gRXZlbnQgdG8gdGhlIExpc3Qgb2YgZXZlbnRzLlxyXG4gICAgICogQHBhcmFtIF9uYW1lIFRoZSBuYW1lIG9mIHRoZSBldmVudCAobmVlZHMgdG8gYmUgdW5pcXVlIHBlciBBbmltYXRpb24pLlxyXG4gICAgICogQHBhcmFtIF90aW1lIFRoZSB0aW1lc3RhbXAgb2YgdGhlIGV2ZW50IChpbiBtaWxsaXNlY29uZHMpLlxyXG4gICAgICovXHJcbiAgICBzZXRFdmVudChfbmFtZTogc3RyaW5nLCBfdGltZTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgIHRoaXMuZXZlbnRzW19uYW1lXSA9IF90aW1lO1xyXG4gICAgICB0aGlzLmV2ZW50c1Byb2Nlc3NlZC5jbGVhcigpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZXMgdGhlIGV2ZW50IHdpdGggdGhlIGdpdmVuIG5hbWUgZnJvbSB0aGUgbGlzdCBvZiBldmVudHMuXHJcbiAgICAgKiBAcGFyYW0gX25hbWUgbmFtZSBvZiB0aGUgZXZlbnQgdG8gcmVtb3ZlLlxyXG4gICAgICovXHJcbiAgICByZW1vdmVFdmVudChfbmFtZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgIGRlbGV0ZSB0aGlzLmV2ZW50c1tfbmFtZV07XHJcbiAgICAgIHRoaXMuZXZlbnRzUHJvY2Vzc2VkLmNsZWFyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGdldExhYmVscygpOiBFbnVtZXJhdG9yIHtcclxuICAgICAgLy9UT0RPOiB0aGlzIGFjdHVhbGx5IG5lZWRzIHRlc3RpbmdcclxuICAgICAgbGV0IGVuOiBFbnVtZXJhdG9yID0gbmV3IEVudW1lcmF0b3IodGhpcy5sYWJlbHMpO1xyXG4gICAgICByZXR1cm4gZW47XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGZwcygpOiBudW1iZXIge1xyXG4gICAgICByZXR1cm4gdGhpcy5mcmFtZXNQZXJTZWNvbmQ7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IGZwcyhfZnBzOiBudW1iZXIpIHtcclxuICAgICAgdGhpcy5mcmFtZXNQZXJTZWNvbmQgPSBfZnBzO1xyXG4gICAgICB0aGlzLmV2ZW50c1Byb2Nlc3NlZC5jbGVhcigpO1xyXG4gICAgICB0aGlzLmFuaW1hdGlvblN0cnVjdHVyZXNQcm9jZXNzZWQuY2xlYXIoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIChSZS0pQ2FsY3VsYXRlIHRoZSB0b3RhbCB0aW1lIG9mIHRoZSBBbmltYXRpb24uIENhbGN1bGF0aW9uLWhlYXZ5LCB1c2Ugb25seSBpZiBhY3R1YWxseSBuZWVkZWQuXHJcbiAgICAgKi9cclxuICAgIGNhbGN1bGF0ZVRvdGFsVGltZSgpOiB2b2lkIHtcclxuICAgICAgdGhpcy50b3RhbFRpbWUgPSAwO1xyXG4gICAgICB0aGlzLnRyYXZlcnNlU3RydWN0dXJlRm9yVGltZSh0aGlzLmFuaW1hdGlvblN0cnVjdHVyZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8jcmVnaW9uIHRyYW5zZmVyXHJcbiAgICBzZXJpYWxpemUoKTogU2VyaWFsaXphdGlvbiB7XHJcbiAgICAgIGxldCBzOiBTZXJpYWxpemF0aW9uID0ge1xyXG4gICAgICAgIGlkUmVzb3VyY2U6IHRoaXMuaWRSZXNvdXJjZSxcclxuICAgICAgICBuYW1lOiB0aGlzLm5hbWUsXHJcbiAgICAgICAgbGFiZWxzOiB7fSxcclxuICAgICAgICBldmVudHM6IHt9LFxyXG4gICAgICAgIGZwczogdGhpcy5mcmFtZXNQZXJTZWNvbmQsXHJcbiAgICAgICAgc3BzOiB0aGlzLnN0ZXBzUGVyU2Vjb25kXHJcbiAgICAgIH07XHJcbiAgICAgIGZvciAobGV0IG5hbWUgaW4gdGhpcy5sYWJlbHMpIHtcclxuICAgICAgICBzLmxhYmVsc1tuYW1lXSA9IHRoaXMubGFiZWxzW25hbWVdO1xyXG4gICAgICB9XHJcbiAgICAgIGZvciAobGV0IG5hbWUgaW4gdGhpcy5ldmVudHMpIHtcclxuICAgICAgICBzLmV2ZW50c1tuYW1lXSA9IHRoaXMuZXZlbnRzW25hbWVdO1xyXG4gICAgICB9XHJcbiAgICAgIHMuYW5pbWF0aW9uU3RydWN0dXJlID0gdGhpcy50cmF2ZXJzZVN0cnVjdHVyZUZvclNlcmlhbGlzYXRpb24odGhpcy5hbmltYXRpb25TdHJ1Y3R1cmUpO1xyXG4gICAgICByZXR1cm4gcztcclxuICAgIH1cclxuICAgIGRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uKTogU2VyaWFsaXphYmxlIHtcclxuICAgICAgdGhpcy5pZFJlc291cmNlID0gX3NlcmlhbGl6YXRpb24uaWRSZXNvdXJjZTtcclxuICAgICAgdGhpcy5uYW1lID0gX3NlcmlhbGl6YXRpb24ubmFtZTtcclxuICAgICAgdGhpcy5mcmFtZXNQZXJTZWNvbmQgPSBfc2VyaWFsaXphdGlvbi5mcHM7XHJcbiAgICAgIHRoaXMuc3RlcHNQZXJTZWNvbmQgPSBfc2VyaWFsaXphdGlvbi5zcHM7XHJcbiAgICAgIHRoaXMubGFiZWxzID0ge307XHJcbiAgICAgIGZvciAobGV0IG5hbWUgaW4gX3NlcmlhbGl6YXRpb24ubGFiZWxzKSB7XHJcbiAgICAgICAgdGhpcy5sYWJlbHNbbmFtZV0gPSBfc2VyaWFsaXphdGlvbi5sYWJlbHNbbmFtZV07XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5ldmVudHMgPSB7fTtcclxuICAgICAgZm9yIChsZXQgbmFtZSBpbiBfc2VyaWFsaXphdGlvbi5ldmVudHMpIHtcclxuICAgICAgICB0aGlzLmV2ZW50c1tuYW1lXSA9IF9zZXJpYWxpemF0aW9uLmV2ZW50c1tuYW1lXTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmV2ZW50c1Byb2Nlc3NlZCA9IG5ldyBNYXA8QU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFLCBBbmltYXRpb25FdmVudFRyaWdnZXI+KCk7XHJcblxyXG4gICAgICB0aGlzLmFuaW1hdGlvblN0cnVjdHVyZSA9IHRoaXMudHJhdmVyc2VTdHJ1Y3R1cmVGb3JEZXNlcmlhbGlzYXRpb24oX3NlcmlhbGl6YXRpb24uYW5pbWF0aW9uU3RydWN0dXJlKTtcclxuXHJcbiAgICAgIHRoaXMuYW5pbWF0aW9uU3RydWN0dXJlc1Byb2Nlc3NlZCA9IG5ldyBNYXA8QU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFLCBBbmltYXRpb25TdHJ1Y3R1cmU+KCk7XHJcblxyXG4gICAgICB0aGlzLmNhbGN1bGF0ZVRvdGFsVGltZSgpO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIHB1YmxpYyBnZXRNdXRhdG9yKCk6IE11dGF0b3Ige1xyXG4gICAgICByZXR1cm4gdGhpcy5zZXJpYWxpemUoKTtcclxuICAgIH1cclxuICAgIHByb3RlY3RlZCByZWR1Y2VNdXRhdG9yKF9tdXRhdG9yOiBNdXRhdG9yKTogdm9pZCB7XHJcbiAgICAgIGRlbGV0ZSBfbXV0YXRvci50b3RhbFRpbWU7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFRyYXZlcnNlcyBhbiBBbmltYXRpb25TdHJ1Y3R1cmUgYW5kIHJldHVybnMgdGhlIFNlcmlhbGl6YXRpb24gb2Ygc2FpZCBTdHJ1Y3R1cmUuXHJcbiAgICAgKiBAcGFyYW0gX3N0cnVjdHVyZSBUaGUgQW5pbWF0aW9uIFN0cnVjdHVyZSBhdCB0aGUgY3VycmVudCBsZXZlbCB0byB0cmFuc2Zvcm0gaW50byB0aGUgU2VyaWFsaXphdGlvbi5cclxuICAgICAqIEByZXR1cm5zIHRoZSBmaWxsZWQgU2VyaWFsaXphdGlvbi5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSB0cmF2ZXJzZVN0cnVjdHVyZUZvclNlcmlhbGlzYXRpb24oX3N0cnVjdHVyZTogQW5pbWF0aW9uU3RydWN0dXJlKTogU2VyaWFsaXphdGlvbiB7XHJcbiAgICAgIGxldCBuZXdTZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uID0ge307XHJcbiAgICAgIGZvciAobGV0IG4gaW4gX3N0cnVjdHVyZSkge1xyXG4gICAgICAgIGlmIChfc3RydWN0dXJlW25dIGluc3RhbmNlb2YgQW5pbWF0aW9uU2VxdWVuY2UpIHtcclxuICAgICAgICAgIG5ld1NlcmlhbGl6YXRpb25bbl0gPSBfc3RydWN0dXJlW25dLnNlcmlhbGl6ZSgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBuZXdTZXJpYWxpemF0aW9uW25dID0gdGhpcy50cmF2ZXJzZVN0cnVjdHVyZUZvclNlcmlhbGlzYXRpb24oPEFuaW1hdGlvblN0cnVjdHVyZT5fc3RydWN0dXJlW25dKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIG5ld1NlcmlhbGl6YXRpb247XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFRyYXZlcnNlcyBhIFNlcmlhbGl6YXRpb24gdG8gY3JlYXRlIGEgbmV3IEFuaW1hdGlvblN0cnVjdHVyZS5cclxuICAgICAqIEBwYXJhbSBfc2VyaWFsaXphdGlvbiBUaGUgc2VyaWFsaXphdGlvbiB0byB0cmFuc2ZlciBpbnRvIGFuIEFuaW1hdGlvblN0cnVjdHVyZVxyXG4gICAgICogQHJldHVybnMgdGhlIG5ld2x5IGNyZWF0ZWQgQW5pbWF0aW9uU3RydWN0dXJlLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHRyYXZlcnNlU3RydWN0dXJlRm9yRGVzZXJpYWxpc2F0aW9uKF9zZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uKTogQW5pbWF0aW9uU3RydWN0dXJlIHtcclxuICAgICAgbGV0IG5ld1N0cnVjdHVyZTogQW5pbWF0aW9uU3RydWN0dXJlID0ge307XHJcbiAgICAgIGZvciAobGV0IG4gaW4gX3NlcmlhbGl6YXRpb24pIHtcclxuICAgICAgICBpZiAoX3NlcmlhbGl6YXRpb25bbl0uYW5pbWF0aW9uU2VxdWVuY2UpIHtcclxuICAgICAgICAgIGxldCBhbmltU2VxOiBBbmltYXRpb25TZXF1ZW5jZSA9IG5ldyBBbmltYXRpb25TZXF1ZW5jZSgpO1xyXG4gICAgICAgICAgbmV3U3RydWN0dXJlW25dID0gYW5pbVNlcS5kZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbltuXSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG5ld1N0cnVjdHVyZVtuXSA9IHRoaXMudHJhdmVyc2VTdHJ1Y3R1cmVGb3JEZXNlcmlhbGlzYXRpb24oX3NlcmlhbGl6YXRpb25bbl0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gbmV3U3RydWN0dXJlO1xyXG4gICAgfVxyXG4gICAgLy8jZW5kcmVnaW9uXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGaW5kcyB0aGUgbGlzdCBvZiBldmVudHMgdG8gYmUgdXNlZCB3aXRoIHRoZXNlIHNldHRpbmdzLlxyXG4gICAgICogQHBhcmFtIF9kaXJlY3Rpb24gVGhlIGRpcmVjdGlvbiB0aGUgYW5pbWF0aW9uIGlzIHBsYXlpbmcgaW4uXHJcbiAgICAgKiBAcGFyYW0gX3BsYXliYWNrIFRoZSBwbGF5YmFja21vZGUgdGhlIGFuaW1hdGlvbiBpcyBwbGF5aW5nIGluLlxyXG4gICAgICogQHJldHVybnMgVGhlIGNvcnJlY3QgQW5pbWF0aW9uRXZlbnRUcmlnZ2VyIE9iamVjdCB0byB1c2VcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBnZXRDb3JyZWN0RXZlbnRMaXN0KF9kaXJlY3Rpb246IG51bWJlciwgX3BsYXliYWNrOiBBTklNQVRJT05fUExBWUJBQ0spOiBBbmltYXRpb25FdmVudFRyaWdnZXIge1xyXG4gICAgICBpZiAoX3BsYXliYWNrICE9IEFOSU1BVElPTl9QTEFZQkFDSy5GUkFNRUJBU0VEKSB7XHJcbiAgICAgICAgaWYgKF9kaXJlY3Rpb24gPj0gMCkge1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UHJvY2Vzc2VkRXZlbnRUcmlnZ2VyKEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRS5OT1JNQUwpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy5nZXRQcm9jZXNzZWRFdmVudFRyaWdnZXIoQU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFLlJFVkVSU0UpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBpZiAoX2RpcmVjdGlvbiA+PSAwKSB7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy5nZXRQcm9jZXNzZWRFdmVudFRyaWdnZXIoQU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFLlJBU1RFUkVEKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UHJvY2Vzc2VkRXZlbnRUcmlnZ2VyKEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRS5SQVNURVJFRFJFVkVSU0UpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVHJhdmVyc2VzIGFuIEFuaW1hdGlvblN0cnVjdHVyZSB0byB0dXJuIGl0IGludG8gdGhlIFwiTXV0YXRvclwiIHRvIHJldHVybiB0byB0aGUgQ29tcG9uZW50LlxyXG4gICAgICogQHBhcmFtIF9zdHJ1Y3R1cmUgVGhlIHN0cmN1dHVyZSB0byB0cmF2ZXJzZVxyXG4gICAgICogQHBhcmFtIF90aW1lIHRoZSBwb2ludCBpbiB0aW1lIHRvIHdyaXRlIHRoZSBhbmltYXRpb24gbnVtYmVycyBpbnRvLlxyXG4gICAgICogQHJldHVybnMgVGhlIFwiTXV0YXRvclwiIGZpbGxlZCB3aXRoIHRoZSBjb3JyZWN0IHZhbHVlcyBhdCB0aGUgZ2l2ZW4gdGltZS4gXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgdHJhdmVyc2VTdHJ1Y3R1cmVGb3JNdXRhdG9yKF9zdHJ1Y3R1cmU6IEFuaW1hdGlvblN0cnVjdHVyZSwgX3RpbWU6IG51bWJlcik6IE11dGF0b3Ige1xyXG4gICAgICBsZXQgbmV3TXV0YXRvcjogTXV0YXRvciA9IHt9O1xyXG4gICAgICBmb3IgKGxldCBuIGluIF9zdHJ1Y3R1cmUpIHtcclxuICAgICAgICBpZiAoX3N0cnVjdHVyZVtuXSBpbnN0YW5jZW9mIEFuaW1hdGlvblNlcXVlbmNlKSB7XHJcbiAgICAgICAgICBuZXdNdXRhdG9yW25dID0gKDxBbmltYXRpb25TZXF1ZW5jZT5fc3RydWN0dXJlW25dKS5ldmFsdWF0ZShfdGltZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG5ld011dGF0b3Jbbl0gPSB0aGlzLnRyYXZlcnNlU3RydWN0dXJlRm9yTXV0YXRvcig8QW5pbWF0aW9uU3RydWN0dXJlPl9zdHJ1Y3R1cmVbbl0sIF90aW1lKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIG5ld011dGF0b3I7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUcmF2ZXJzZXMgdGhlIGN1cnJlbnQgQW5pbWF0aW9uU3RyY3V0dXJlIHRvIGZpbmQgdGhlIHRvdGFsVGltZSBvZiB0aGlzIGFuaW1hdGlvbi5cclxuICAgICAqIEBwYXJhbSBfc3RydWN0dXJlIFRoZSBzdHJ1Y3R1cmUgdG8gdHJhdmVyc2VcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSB0cmF2ZXJzZVN0cnVjdHVyZUZvclRpbWUoX3N0cnVjdHVyZTogQW5pbWF0aW9uU3RydWN0dXJlKTogdm9pZCB7XHJcbiAgICAgIGZvciAobGV0IG4gaW4gX3N0cnVjdHVyZSkge1xyXG4gICAgICAgIGlmIChfc3RydWN0dXJlW25dIGluc3RhbmNlb2YgQW5pbWF0aW9uU2VxdWVuY2UpIHtcclxuICAgICAgICAgIGxldCBzZXF1ZW5jZTogQW5pbWF0aW9uU2VxdWVuY2UgPSA8QW5pbWF0aW9uU2VxdWVuY2U+X3N0cnVjdHVyZVtuXTtcclxuICAgICAgICAgIGlmIChzZXF1ZW5jZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGxldCBzZXF1ZW5jZVRpbWU6IG51bWJlciA9IHNlcXVlbmNlLmdldEtleShzZXF1ZW5jZS5sZW5ndGggLSAxKS5UaW1lO1xyXG4gICAgICAgICAgICB0aGlzLnRvdGFsVGltZSA9IHNlcXVlbmNlVGltZSA+IHRoaXMudG90YWxUaW1lID8gc2VxdWVuY2VUaW1lIDogdGhpcy50b3RhbFRpbWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMudHJhdmVyc2VTdHJ1Y3R1cmVGb3JUaW1lKDxBbmltYXRpb25TdHJ1Y3R1cmU+X3N0cnVjdHVyZVtuXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBFbnN1cmVzIHRoZSBleGlzdGFuY2Ugb2YgdGhlIHJlcXVlc3RlZCBbW0FuaW1hdGlvblN0cmN1dHVyZV1dIGFuZCByZXR1cm5zIGl0LlxyXG4gICAgICogQHBhcmFtIF90eXBlIHRoZSB0eXBlIG9mIHRoZSBzdHJ1Y3R1cmUgdG8gZ2V0XHJcbiAgICAgKiBAcmV0dXJucyB0aGUgcmVxdWVzdGVkIFtbQW5pbWF0aW9uU3RydWN0dXJlXV1cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBnZXRQcm9jZXNzZWRBbmltYXRpb25TdHJ1Y3R1cmUoX3R5cGU6IEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRSk6IEFuaW1hdGlvblN0cnVjdHVyZSB7XHJcbiAgICAgIGlmICghdGhpcy5hbmltYXRpb25TdHJ1Y3R1cmVzUHJvY2Vzc2VkLmhhcyhfdHlwZSkpIHtcclxuICAgICAgICB0aGlzLmNhbGN1bGF0ZVRvdGFsVGltZSgpO1xyXG4gICAgICAgIGxldCBhZTogQW5pbWF0aW9uU3RydWN0dXJlID0ge307XHJcbiAgICAgICAgc3dpdGNoIChfdHlwZSkge1xyXG4gICAgICAgICAgY2FzZSBBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUuTk9STUFMOlxyXG4gICAgICAgICAgICBhZSA9IHRoaXMuYW5pbWF0aW9uU3RydWN0dXJlO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgQU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFLlJFVkVSU0U6XHJcbiAgICAgICAgICAgIGFlID0gdGhpcy50cmF2ZXJzZVN0cnVjdHVyZUZvck5ld1N0cnVjdHVyZSh0aGlzLmFuaW1hdGlvblN0cnVjdHVyZSwgdGhpcy5jYWxjdWxhdGVSZXZlcnNlU2VxdWVuY2UuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSBBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUuUkFTVEVSRUQ6XHJcbiAgICAgICAgICAgIGFlID0gdGhpcy50cmF2ZXJzZVN0cnVjdHVyZUZvck5ld1N0cnVjdHVyZSh0aGlzLmFuaW1hdGlvblN0cnVjdHVyZSwgdGhpcy5jYWxjdWxhdGVSYXN0ZXJlZFNlcXVlbmNlLmJpbmQodGhpcykpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgQU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFLlJBU1RFUkVEUkVWRVJTRTpcclxuICAgICAgICAgICAgYWUgPSB0aGlzLnRyYXZlcnNlU3RydWN0dXJlRm9yTmV3U3RydWN0dXJlKHRoaXMuZ2V0UHJvY2Vzc2VkQW5pbWF0aW9uU3RydWN0dXJlKEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRS5SRVZFUlNFKSwgdGhpcy5jYWxjdWxhdGVSYXN0ZXJlZFNlcXVlbmNlLmJpbmQodGhpcykpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIHJldHVybiB7fTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5hbmltYXRpb25TdHJ1Y3R1cmVzUHJvY2Vzc2VkLnNldChfdHlwZSwgYWUpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB0aGlzLmFuaW1hdGlvblN0cnVjdHVyZXNQcm9jZXNzZWQuZ2V0KF90eXBlKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEVuc3VyZXMgdGhlIGV4aXN0YW5jZSBvZiB0aGUgcmVxdWVzdGVkIFtbQW5pbWF0aW9uRXZlbnRUcmlnZ2VyXV0gYW5kIHJldHVybnMgaXQuXHJcbiAgICAgKiBAcGFyYW0gX3R5cGUgVGhlIHR5cGUgb2YgQW5pbWF0aW9uRXZlbnRUcmlnZ2VyIHRvIGdldFxyXG4gICAgICogQHJldHVybnMgdGhlIHJlcXVlc3RlZCBbW0FuaW1hdGlvbkV2ZW50VHJpZ2dlcl1dXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZ2V0UHJvY2Vzc2VkRXZlbnRUcmlnZ2VyKF90eXBlOiBBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUpOiBBbmltYXRpb25FdmVudFRyaWdnZXIge1xyXG4gICAgICBpZiAoIXRoaXMuZXZlbnRzUHJvY2Vzc2VkLmhhcyhfdHlwZSkpIHtcclxuICAgICAgICB0aGlzLmNhbGN1bGF0ZVRvdGFsVGltZSgpO1xyXG4gICAgICAgIGxldCBldjogQW5pbWF0aW9uRXZlbnRUcmlnZ2VyID0ge307XHJcbiAgICAgICAgc3dpdGNoIChfdHlwZSkge1xyXG4gICAgICAgICAgY2FzZSBBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUuTk9STUFMOlxyXG4gICAgICAgICAgICBldiA9IHRoaXMuZXZlbnRzO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgQU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFLlJFVkVSU0U6XHJcbiAgICAgICAgICAgIGV2ID0gdGhpcy5jYWxjdWxhdGVSZXZlcnNlRXZlbnRUcmlnZ2Vycyh0aGlzLmV2ZW50cyk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSBBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUuUkFTVEVSRUQ6XHJcbiAgICAgICAgICAgIGV2ID0gdGhpcy5jYWxjdWxhdGVSYXN0ZXJlZEV2ZW50VHJpZ2dlcnModGhpcy5ldmVudHMpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgQU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFLlJBU1RFUkVEUkVWRVJTRTpcclxuICAgICAgICAgICAgZXYgPSB0aGlzLmNhbGN1bGF0ZVJhc3RlcmVkRXZlbnRUcmlnZ2Vycyh0aGlzLmdldFByb2Nlc3NlZEV2ZW50VHJpZ2dlcihBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUuUkVWRVJTRSkpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIHJldHVybiB7fTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5ldmVudHNQcm9jZXNzZWQuc2V0KF90eXBlLCBldik7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRoaXMuZXZlbnRzUHJvY2Vzc2VkLmdldChfdHlwZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUcmF2ZXJzZXMgYW4gZXhpc3Rpbmcgc3RydWN0dXJlIHRvIGFwcGx5IGEgcmVjYWxjdWxhdGlvbiBmdW5jdGlvbiB0byB0aGUgQW5pbWF0aW9uU3RydWN0dXJlIHRvIHN0b3JlIGluIGEgbmV3IFN0cnVjdHVyZS5cclxuICAgICAqIEBwYXJhbSBfb2xkU3RydWN0dXJlIFRoZSBvbGQgc3RydWN0dXJlIHRvIHRyYXZlcnNlXHJcbiAgICAgKiBAcGFyYW0gX2Z1bmN0aW9uVG9Vc2UgVGhlIGZ1bmN0aW9uIHRvIHVzZSB0byByZWNhbGN1bGF0ZWQgdGhlIHN0cnVjdHVyZS5cclxuICAgICAqIEByZXR1cm5zIEEgbmV3IEFuaW1hdGlvbiBTdHJ1Y3R1cmUgd2l0aCB0aGUgcmVjYWx1bGF0ZWQgQW5pbWF0aW9uIFNlcXVlbmNlcy5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSB0cmF2ZXJzZVN0cnVjdHVyZUZvck5ld1N0cnVjdHVyZShfb2xkU3RydWN0dXJlOiBBbmltYXRpb25TdHJ1Y3R1cmUsIF9mdW5jdGlvblRvVXNlOiBGdW5jdGlvbik6IEFuaW1hdGlvblN0cnVjdHVyZSB7XHJcbiAgICAgIGxldCBuZXdTdHJ1Y3R1cmU6IEFuaW1hdGlvblN0cnVjdHVyZSA9IHt9O1xyXG4gICAgICBmb3IgKGxldCBuIGluIF9vbGRTdHJ1Y3R1cmUpIHtcclxuICAgICAgICBpZiAoX29sZFN0cnVjdHVyZVtuXSBpbnN0YW5jZW9mIEFuaW1hdGlvblNlcXVlbmNlKSB7XHJcbiAgICAgICAgICBuZXdTdHJ1Y3R1cmVbbl0gPSBfZnVuY3Rpb25Ub1VzZShfb2xkU3RydWN0dXJlW25dKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbmV3U3RydWN0dXJlW25dID0gdGhpcy50cmF2ZXJzZVN0cnVjdHVyZUZvck5ld1N0cnVjdHVyZSg8QW5pbWF0aW9uU3RydWN0dXJlPl9vbGRTdHJ1Y3R1cmVbbl0sIF9mdW5jdGlvblRvVXNlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIG5ld1N0cnVjdHVyZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgYSByZXZlcnNlZCBBbmltYXRpb24gU2VxdWVuY2Ugb3V0IG9mIGEgZ2l2ZW4gU2VxdWVuY2UuXHJcbiAgICAgKiBAcGFyYW0gX3NlcXVlbmNlIFRoZSBzZXF1ZW5jZSB0byBjYWxjdWxhdGUgdGhlIG5ldyBzZXF1ZW5jZSBvdXQgb2ZcclxuICAgICAqIEByZXR1cm5zIFRoZSByZXZlcnNlZCBTZXF1ZW5jZVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGNhbGN1bGF0ZVJldmVyc2VTZXF1ZW5jZShfc2VxdWVuY2U6IEFuaW1hdGlvblNlcXVlbmNlKTogQW5pbWF0aW9uU2VxdWVuY2Uge1xyXG4gICAgICBsZXQgc2VxOiBBbmltYXRpb25TZXF1ZW5jZSA9IG5ldyBBbmltYXRpb25TZXF1ZW5jZSgpO1xyXG4gICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgX3NlcXVlbmNlLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgbGV0IG9sZEtleTogQW5pbWF0aW9uS2V5ID0gX3NlcXVlbmNlLmdldEtleShpKTtcclxuICAgICAgICBsZXQga2V5OiBBbmltYXRpb25LZXkgPSBuZXcgQW5pbWF0aW9uS2V5KHRoaXMudG90YWxUaW1lIC0gb2xkS2V5LlRpbWUsIG9sZEtleS5WYWx1ZSwgb2xkS2V5LlNsb3BlT3V0LCBvbGRLZXkuU2xvcGVJbiwgb2xkS2V5LkNvbnN0YW50KTtcclxuICAgICAgICBzZXEuYWRkS2V5KGtleSk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHNlcTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgYSByYXN0ZXJlZCBbW0FuaW1hdGlvblNlcXVlbmNlXV0gb3V0IG9mIGEgZ2l2ZW4gc2VxdWVuY2UuXHJcbiAgICAgKiBAcGFyYW0gX3NlcXVlbmNlIFRoZSBzZXF1ZW5jZSB0byBjYWxjdWxhdGUgdGhlIG5ldyBzZXF1ZW5jZSBvdXQgb2ZcclxuICAgICAqIEByZXR1cm5zIHRoZSByYXN0ZXJlZCBzZXF1ZW5jZS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjYWxjdWxhdGVSYXN0ZXJlZFNlcXVlbmNlKF9zZXF1ZW5jZTogQW5pbWF0aW9uU2VxdWVuY2UpOiBBbmltYXRpb25TZXF1ZW5jZSB7XHJcbiAgICAgIGxldCBzZXE6IEFuaW1hdGlvblNlcXVlbmNlID0gbmV3IEFuaW1hdGlvblNlcXVlbmNlKCk7XHJcbiAgICAgIGxldCBmcmFtZVRpbWU6IG51bWJlciA9IDEwMDAgLyB0aGlzLmZyYW1lc1BlclNlY29uZDtcclxuICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHRoaXMudG90YWxUaW1lOyBpICs9IGZyYW1lVGltZSkge1xyXG4gICAgICAgIGxldCBrZXk6IEFuaW1hdGlvbktleSA9IG5ldyBBbmltYXRpb25LZXkoaSwgX3NlcXVlbmNlLmV2YWx1YXRlKGkpLCAwLCAwLCB0cnVlKTtcclxuICAgICAgICBzZXEuYWRkS2V5KGtleSk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHNlcTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgYSBuZXcgcmV2ZXJzZWQgW1tBbmltYXRpb25FdmVudFRyaWdnZXJdXSBvYmplY3QgYmFzZWQgb24gdGhlIGdpdmVuIG9uZS4gIFxyXG4gICAgICogQHBhcmFtIF9ldmVudHMgdGhlIGV2ZW50IG9iamVjdCB0byBjYWxjdWxhdGUgdGhlIG5ldyBvbmUgb3V0IG9mXHJcbiAgICAgKiBAcmV0dXJucyB0aGUgcmV2ZXJzZWQgZXZlbnQgb2JqZWN0XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgY2FsY3VsYXRlUmV2ZXJzZUV2ZW50VHJpZ2dlcnMoX2V2ZW50czogQW5pbWF0aW9uRXZlbnRUcmlnZ2VyKTogQW5pbWF0aW9uRXZlbnRUcmlnZ2VyIHtcclxuICAgICAgbGV0IGFlOiBBbmltYXRpb25FdmVudFRyaWdnZXIgPSB7fTtcclxuICAgICAgZm9yIChsZXQgbmFtZSBpbiBfZXZlbnRzKSB7XHJcbiAgICAgICAgYWVbbmFtZV0gPSB0aGlzLnRvdGFsVGltZSAtIF9ldmVudHNbbmFtZV07XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGFlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgYSByYXN0ZXJlZCBbW0FuaW1hdGlvbkV2ZW50VHJpZ2dlcl1dIG9iamVjdCBiYXNlZCBvbiB0aGUgZ2l2ZW4gb25lLiAgXHJcbiAgICAgKiBAcGFyYW0gX2V2ZW50cyB0aGUgZXZlbnQgb2JqZWN0IHRvIGNhbGN1bGF0ZSB0aGUgbmV3IG9uZSBvdXQgb2ZcclxuICAgICAqIEByZXR1cm5zIHRoZSByYXN0ZXJlZCBldmVudCBvYmplY3RcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjYWxjdWxhdGVSYXN0ZXJlZEV2ZW50VHJpZ2dlcnMoX2V2ZW50czogQW5pbWF0aW9uRXZlbnRUcmlnZ2VyKTogQW5pbWF0aW9uRXZlbnRUcmlnZ2VyIHtcclxuICAgICAgbGV0IGFlOiBBbmltYXRpb25FdmVudFRyaWdnZXIgPSB7fTtcclxuICAgICAgbGV0IGZyYW1lVGltZTogbnVtYmVyID0gMTAwMCAvIHRoaXMuZnJhbWVzUGVyU2Vjb25kO1xyXG4gICAgICBmb3IgKGxldCBuYW1lIGluIF9ldmVudHMpIHtcclxuICAgICAgICBhZVtuYW1lXSA9IF9ldmVudHNbbmFtZV0gLSAoX2V2ZW50c1tuYW1lXSAlIGZyYW1lVGltZSk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGFlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrcyB3aGljaCBldmVudHMgbGF5IGJldHdlZW4gdHdvIGdpdmVuIHRpbWVzIGFuZCByZXR1cm5zIHRoZSBuYW1lcyBvZiB0aGUgb25lcyB0aGF0IGRvLlxyXG4gICAgICogQHBhcmFtIF9ldmVudFRyaWdnZXJzIFRoZSBldmVudCBvYmplY3QgdG8gY2hlY2sgdGhlIGV2ZW50cyBpbnNpZGUgb2ZcclxuICAgICAqIEBwYXJhbSBfbWluIHRoZSBtaW5pbXVtIG9mIHRoZSByYW5nZSB0byBjaGVjayBiZXR3ZWVuIChpbmNsdXNpdmUpXHJcbiAgICAgKiBAcGFyYW0gX21heCB0aGUgbWF4aW11bSBvZiB0aGUgcmFuZ2UgdG8gY2hlY2sgYmV0d2VlbiAoZXhjbHVzaXZlKVxyXG4gICAgICogQHJldHVybnMgYW4gYXJyYXkgb2YgdGhlIG5hbWVzIG9mIHRoZSBldmVudHMgaW4gdGhlIGdpdmVuIHJhbmdlLiBcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjaGVja0V2ZW50c0JldHdlZW4oX2V2ZW50VHJpZ2dlcnM6IEFuaW1hdGlvbkV2ZW50VHJpZ2dlciwgX21pbjogbnVtYmVyLCBfbWF4OiBudW1iZXIpOiBzdHJpbmdbXSB7XHJcbiAgICAgIGxldCBldmVudHNUb1RyaWdnZXI6IHN0cmluZ1tdID0gW107XHJcbiAgICAgIGZvciAobGV0IG5hbWUgaW4gX2V2ZW50VHJpZ2dlcnMpIHtcclxuICAgICAgICBpZiAoX21pbiA8PSBfZXZlbnRUcmlnZ2Vyc1tuYW1lXSAmJiBfZXZlbnRUcmlnZ2Vyc1tuYW1lXSA8IF9tYXgpIHtcclxuICAgICAgICAgIGV2ZW50c1RvVHJpZ2dlci5wdXNoKG5hbWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZXZlbnRzVG9UcmlnZ2VyO1xyXG4gICAgfVxyXG4gIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9UcmFuc2Zlci9TZXJpYWxpemVyLnRzXCIvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vVHJhbnNmZXIvTXV0YWJsZS50c1wiLz5cclxuXHJcbm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gIC8qKlxyXG4gICAqIENhbGN1bGF0ZXMgdGhlIHZhbHVlcyBiZXR3ZWVuIFtbQW5pbWF0aW9uS2V5XV1zLlxyXG4gICAqIFJlcHJlc2VudGVkIGludGVybmFsbHkgYnkgYSBjdWJpYyBmdW5jdGlvbiAoYGYoeCkgPSBheMKzICsgYnjCsiArIGN4ICsgZGApLiBcclxuICAgKiBPbmx5IG5lZWRzIHRvIGJlIHJlY2FsY3VsYXRlZCB3aGVuIHRoZSBrZXlzIGNoYW5nZSwgc28gYXQgcnVudGltZSBpdCBzaG91bGQgb25seSBiZSBjYWxjdWxhdGVkIG9uY2UuXHJcbiAgICogQGF1dGhvciBMdWthcyBTY2hldWVybGUsIEhGVSwgMjAxOVxyXG4gICAqL1xyXG4gIGV4cG9ydCBjbGFzcyBBbmltYXRpb25GdW5jdGlvbiB7XHJcbiAgICBwcml2YXRlIGE6IG51bWJlciA9IDA7XHJcbiAgICBwcml2YXRlIGI6IG51bWJlciA9IDA7XHJcbiAgICBwcml2YXRlIGM6IG51bWJlciA9IDA7XHJcbiAgICBwcml2YXRlIGQ6IG51bWJlciA9IDA7XHJcbiAgICBwcml2YXRlIGtleUluOiBBbmltYXRpb25LZXk7XHJcbiAgICBwcml2YXRlIGtleU91dDogQW5pbWF0aW9uS2V5O1xyXG5cclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihfa2V5SW46IEFuaW1hdGlvbktleSwgX2tleU91dDogQW5pbWF0aW9uS2V5ID0gbnVsbCkge1xyXG4gICAgICB0aGlzLmtleUluID0gX2tleUluO1xyXG4gICAgICB0aGlzLmtleU91dCA9IF9rZXlPdXQ7XHJcbiAgICAgIHRoaXMuY2FsY3VsYXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxjdWxhdGVzIHRoZSB2YWx1ZSBvZiB0aGUgZnVuY3Rpb24gYXQgdGhlIGdpdmVuIHRpbWUuXHJcbiAgICAgKiBAcGFyYW0gX3RpbWUgdGhlIHBvaW50IGluIHRpbWUgYXQgd2hpY2ggdG8gZXZhbHVhdGUgdGhlIGZ1bmN0aW9uIGluIG1pbGxpc2Vjb25kcy4gV2lsbCBiZSBjb3JyZWN0ZWQgZm9yIG9mZnNldCBpbnRlcm5hbGx5LlxyXG4gICAgICogQHJldHVybnMgdGhlIHZhbHVlIGF0IHRoZSBnaXZlbiB0aW1lXHJcbiAgICAgKi9cclxuICAgIGV2YWx1YXRlKF90aW1lOiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgICBfdGltZSAtPSB0aGlzLmtleUluLlRpbWU7XHJcbiAgICAgIGxldCB0aW1lMjogbnVtYmVyID0gX3RpbWUgKiBfdGltZTtcclxuICAgICAgbGV0IHRpbWUzOiBudW1iZXIgPSB0aW1lMiAqIF90aW1lO1xyXG4gICAgICByZXR1cm4gdGhpcy5hICogdGltZTMgKyB0aGlzLmIgKiB0aW1lMiArIHRoaXMuYyAqIF90aW1lICsgdGhpcy5kO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCBzZXRLZXlJbihfa2V5SW46IEFuaW1hdGlvbktleSkge1xyXG4gICAgICB0aGlzLmtleUluID0gX2tleUluO1xyXG4gICAgICB0aGlzLmNhbGN1bGF0ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCBzZXRLZXlPdXQoX2tleU91dDogQW5pbWF0aW9uS2V5KSB7XHJcbiAgICAgIHRoaXMua2V5T3V0ID0gX2tleU91dDtcclxuICAgICAgdGhpcy5jYWxjdWxhdGUoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIChSZS0pQ2FsY3VsYXRlcyB0aGUgcGFyYW1ldGVycyBvZiB0aGUgY3ViaWMgZnVuY3Rpb24uXHJcbiAgICAgKiBTZWUgaHR0cHM6Ly9tYXRoLnN0YWNrZXhjaGFuZ2UuY29tL3F1ZXN0aW9ucy8zMTczNDY5L2NhbGN1bGF0ZS1jdWJpYy1lcXVhdGlvbi1mcm9tLXR3by1wb2ludHMtYW5kLXR3by1zbG9wZXMtdmFyaWFibHlcclxuICAgICAqIGFuZCBodHRwczovL2ppcmthZGVsbG9yby5naXRodWIuaW8vRlVER0UvRG9jdW1lbnRhdGlvbi9Mb2dzLzE5MDQxMF9Ob3RpemVuX0xTXHJcbiAgICAgKi9cclxuICAgIGNhbGN1bGF0ZSgpOiB2b2lkIHtcclxuICAgICAgaWYgKCF0aGlzLmtleUluKSB7XHJcbiAgICAgICAgdGhpcy5kID0gdGhpcy5jID0gdGhpcy5iID0gdGhpcy5hID0gMDtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCF0aGlzLmtleU91dCB8fCB0aGlzLmtleUluLkNvbnN0YW50KSB7XHJcbiAgICAgICAgdGhpcy5kID0gdGhpcy5rZXlJbi5WYWx1ZTtcclxuICAgICAgICB0aGlzLmMgPSB0aGlzLmIgPSB0aGlzLmEgPSAwO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgbGV0IHgxOiBudW1iZXIgPSB0aGlzLmtleU91dC5UaW1lIC0gdGhpcy5rZXlJbi5UaW1lO1xyXG5cclxuICAgICAgdGhpcy5kID0gdGhpcy5rZXlJbi5WYWx1ZTtcclxuICAgICAgdGhpcy5jID0gdGhpcy5rZXlJbi5TbG9wZU91dDtcclxuXHJcbiAgICAgIHRoaXMuYSA9ICgteDEgKiAodGhpcy5rZXlJbi5TbG9wZU91dCArIHRoaXMua2V5T3V0LlNsb3BlSW4pIC0gMiAqIHRoaXMua2V5SW4uVmFsdWUgKyAyICogdGhpcy5rZXlPdXQuVmFsdWUpIC8gLU1hdGgucG93KHgxLCAzKTtcclxuICAgICAgdGhpcy5iID0gKHRoaXMua2V5T3V0LlNsb3BlSW4gLSB0aGlzLmtleUluLlNsb3BlT3V0IC0gMyAqIHRoaXMuYSAqIE1hdGgucG93KHgxLCAyKSkgLyAoMiAqIHgxKTtcclxuICAgIH1cclxuICB9XHJcblxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL1RyYW5zZmVyL1NlcmlhbGl6ZXIudHNcIi8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9UcmFuc2Zlci9NdXRhYmxlLnRzXCIvPlxyXG5cclxubmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgLyoqXHJcbiAgICogSG9sZHMgaW5mb3JtYXRpb24gYWJvdXQgc2V0IHBvaW50cyBpbiB0aW1lLCB0aGVpciBhY2NvbXBhbnlpbmcgdmFsdWVzIGFzIHdlbGwgYXMgdGhlaXIgc2xvcGVzLiBcclxuICAgKiBBbHNvIGhvbGRzIGEgcmVmZXJlbmNlIHRvIHRoZSBbW0FuaW1hdGlvbkZ1bmN0aW9uXV1zIHRoYXQgY29tZSBpbiBhbmQgb3V0IG9mIHRoZSBzaWRlcy4gVGhlIFtbQW5pbWF0aW9uRnVuY3Rpb25dXXMgYXJlIGhhbmRsZWQgYnkgdGhlIFtbQW5pbWF0aW9uU2VxdWVuY2VdXXMuXHJcbiAgICogU2F2ZWQgaW5zaWRlIGFuIFtbQW5pbWF0aW9uU2VxdWVuY2VdXS5cclxuICAgKiBAYXV0aG9yIEx1a2FzIFNjaGV1ZXJsZSwgSEZVLCAyMDE5XHJcbiAgICovXHJcbiAgZXhwb3J0IGNsYXNzIEFuaW1hdGlvbktleSBleHRlbmRzIE11dGFibGUgaW1wbGVtZW50cyBTZXJpYWxpemFibGUge1xyXG4gICAgLy8gVE9ETzogY2hlY2sgaWYgZnVuY3Rpb25JbiBjYW4gYmUgcmVtb3ZlZFxyXG4gICAgLyoqRG9uJ3QgbW9kaWZ5IHRoaXMgdW5sZXNzIHlvdSBrbm93IHdoYXQgeW91J3JlIGRvaW5nLiovXHJcbiAgICBmdW5jdGlvbkluOiBBbmltYXRpb25GdW5jdGlvbjtcclxuICAgIC8qKkRvbid0IG1vZGlmeSB0aGlzIHVubGVzcyB5b3Uga25vdyB3aGF0IHlvdSdyZSBkb2luZy4qL1xyXG4gICAgZnVuY3Rpb25PdXQ6IEFuaW1hdGlvbkZ1bmN0aW9uO1xyXG4gICAgXHJcbiAgICBicm9rZW46IGJvb2xlYW47XHJcblxyXG4gICAgcHJpdmF0ZSB0aW1lOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHZhbHVlOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGNvbnN0YW50OiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgcHJpdmF0ZSBzbG9wZUluOiBudW1iZXIgPSAwO1xyXG4gICAgcHJpdmF0ZSBzbG9wZU91dDogbnVtYmVyID0gMDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihfdGltZTogbnVtYmVyID0gMCwgX3ZhbHVlOiBudW1iZXIgPSAwLCBfc2xvcGVJbjogbnVtYmVyID0gMCwgX3Nsb3BlT3V0OiBudW1iZXIgPSAwLCBfY29uc3RhbnQ6IGJvb2xlYW4gPSBmYWxzZSkge1xyXG4gICAgICBzdXBlcigpO1xyXG4gICAgICB0aGlzLnRpbWUgPSBfdGltZTtcclxuICAgICAgdGhpcy52YWx1ZSA9IF92YWx1ZTtcclxuICAgICAgdGhpcy5zbG9wZUluID0gX3Nsb3BlSW47XHJcbiAgICAgIHRoaXMuc2xvcGVPdXQgPSBfc2xvcGVPdXQ7XHJcbiAgICAgIHRoaXMuY29uc3RhbnQgPSBfY29uc3RhbnQ7XHJcblxyXG4gICAgICB0aGlzLmJyb2tlbiA9IHRoaXMuc2xvcGVJbiAhPSAtdGhpcy5zbG9wZU91dDtcclxuICAgICAgdGhpcy5mdW5jdGlvbk91dCA9IG5ldyBBbmltYXRpb25GdW5jdGlvbih0aGlzLCBudWxsKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgVGltZSgpOiBudW1iZXIge1xyXG4gICAgICByZXR1cm4gdGhpcy50aW1lO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCBUaW1lKF90aW1lOiBudW1iZXIpIHtcclxuICAgICAgdGhpcy50aW1lID0gX3RpbWU7XHJcbiAgICAgIHRoaXMuZnVuY3Rpb25Jbi5jYWxjdWxhdGUoKTtcclxuICAgICAgdGhpcy5mdW5jdGlvbk91dC5jYWxjdWxhdGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgVmFsdWUoKTogbnVtYmVyIHtcclxuICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IFZhbHVlKF92YWx1ZTogbnVtYmVyKSB7XHJcbiAgICAgIHRoaXMudmFsdWUgPSBfdmFsdWU7XHJcbiAgICAgIHRoaXMuZnVuY3Rpb25Jbi5jYWxjdWxhdGUoKTtcclxuICAgICAgdGhpcy5mdW5jdGlvbk91dC5jYWxjdWxhdGUoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZ2V0IENvbnN0YW50KCk6IGJvb2xlYW4ge1xyXG4gICAgICByZXR1cm4gdGhpcy5jb25zdGFudDtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgQ29uc3RhbnQoX2NvbnN0YW50OiBib29sZWFuKSB7XHJcbiAgICAgIHRoaXMuY29uc3RhbnQgPSBfY29uc3RhbnQ7XHJcbiAgICAgIHRoaXMuZnVuY3Rpb25Jbi5jYWxjdWxhdGUoKTtcclxuICAgICAgdGhpcy5mdW5jdGlvbk91dC5jYWxjdWxhdGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgU2xvcGVJbigpOiBudW1iZXIge1xyXG4gICAgICByZXR1cm4gdGhpcy5zbG9wZUluO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzZXQgU2xvcGVJbihfc2xvcGU6IG51bWJlcikge1xyXG4gICAgICB0aGlzLnNsb3BlSW4gPSBfc2xvcGU7XHJcbiAgICAgIHRoaXMuZnVuY3Rpb25Jbi5jYWxjdWxhdGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgU2xvcGVPdXQoKTogbnVtYmVyIHtcclxuICAgICAgcmV0dXJuIHRoaXMuc2xvcGVPdXQ7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IFNsb3BlT3V0KF9zbG9wZTogbnVtYmVyKSB7XHJcbiAgICAgIHRoaXMuc2xvcGVPdXQgPSBfc2xvcGU7XHJcbiAgICAgIHRoaXMuZnVuY3Rpb25PdXQuY2FsY3VsYXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTdGF0aWMgY29tcGFyYXRpb24gZnVuY3Rpb24gdG8gdXNlIGluIGFuIGFycmF5IHNvcnQgZnVuY3Rpb24gdG8gc29ydCB0aGUga2V5cyBieSB0aGVpciB0aW1lLlxyXG4gICAgICogQHBhcmFtIF9hIHRoZSBhbmltYXRpb24ga2V5IHRvIGNoZWNrXHJcbiAgICAgKiBAcGFyYW0gX2IgdGhlIGFuaW1hdGlvbiBrZXkgdG8gY2hlY2sgYWdhaW5zdFxyXG4gICAgICogQHJldHVybnMgPjAgaWYgYT5iLCAwIGlmIGE9YiwgPDAgaWYgYTxiXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBjb21wYXJlKF9hOiBBbmltYXRpb25LZXksIF9iOiBBbmltYXRpb25LZXkpOiBudW1iZXIge1xyXG4gICAgICByZXR1cm4gX2EudGltZSAtIF9iLnRpbWU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8jcmVnaW9uIHRyYW5zZmVyXHJcbiAgICBzZXJpYWxpemUoKTogU2VyaWFsaXphdGlvbiB7XHJcbiAgICAgIGxldCBzOiBTZXJpYWxpemF0aW9uID0ge307XHJcbiAgICAgIHMudGltZSA9IHRoaXMudGltZTtcclxuICAgICAgcy52YWx1ZSA9IHRoaXMudmFsdWU7XHJcbiAgICAgIHMuc2xvcGVJbiA9IHRoaXMuc2xvcGVJbjtcclxuICAgICAgcy5zbG9wZU91dCA9IHRoaXMuc2xvcGVPdXQ7XHJcbiAgICAgIHMuY29uc3RhbnQgPSB0aGlzLmNvbnN0YW50O1xyXG4gICAgICByZXR1cm4gcztcclxuICAgIH1cclxuXHJcbiAgICBkZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbik6IFNlcmlhbGl6YWJsZSB7XHJcbiAgICAgIHRoaXMudGltZSA9IF9zZXJpYWxpemF0aW9uLnRpbWU7XHJcbiAgICAgIHRoaXMudmFsdWUgPSBfc2VyaWFsaXphdGlvbi52YWx1ZTtcclxuICAgICAgdGhpcy5zbG9wZUluID0gX3NlcmlhbGl6YXRpb24uc2xvcGVJbjtcclxuICAgICAgdGhpcy5zbG9wZU91dCA9IF9zZXJpYWxpemF0aW9uLnNsb3BlT3V0O1xyXG4gICAgICB0aGlzLmNvbnN0YW50ID0gX3NlcmlhbGl6YXRpb24uY29uc3RhbnQ7XHJcblxyXG4gICAgICB0aGlzLmJyb2tlbiA9IHRoaXMuc2xvcGVJbiAhPSAtdGhpcy5zbG9wZU91dDtcclxuXHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIGdldE11dGF0b3IoKTogTXV0YXRvciB7XHJcbiAgICAgIHJldHVybiB0aGlzLnNlcmlhbGl6ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCByZWR1Y2VNdXRhdG9yKF9tdXRhdG9yOiBNdXRhdG9yKTogdm9pZCB7XHJcbiAgICAgIC8vXHJcbiAgICB9XHJcbiAgICAvLyNlbmRyZWdpb25cclxuXHJcbiAgfVxyXG5cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9UcmFuc2Zlci9TZXJpYWxpemVyLnRzXCIvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vVHJhbnNmZXIvTXV0YWJsZS50c1wiLz5cclxuXHJcbm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gIC8qKlxyXG4gICAqIEEgc2VxdWVuY2Ugb2YgW1tBbmltYXRpb25LZXldXXMgdGhhdCBpcyBtYXBwZWQgdG8gYW4gYXR0cmlidXRlIG9mIGEgW1tOb2RlXV0gb3IgaXRzIFtbQ29tcG9uZW50XV1zIGluc2lkZSB0aGUgW1tBbmltYXRpb25dXS5cclxuICAgKiBQcm92aWRlcyBmdW5jdGlvbnMgdG8gbW9kaWZ5IHNhaWQga2V5c1xyXG4gICAqIEBhdXRob3IgTHVrYXMgU2NoZXVlcmxlLCBIRlUsIDIwMTlcclxuICAgKi9cclxuICBleHBvcnQgY2xhc3MgQW5pbWF0aW9uU2VxdWVuY2UgZXh0ZW5kcyBNdXRhYmxlIGltcGxlbWVudHMgU2VyaWFsaXphYmxlIHtcclxuICAgIHByaXZhdGUga2V5czogQW5pbWF0aW9uS2V5W10gPSBbXTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEV2YWx1YXRlcyB0aGUgc2VxdWVuY2UgYXQgdGhlIGdpdmVuIHBvaW50IGluIHRpbWUuXHJcbiAgICAgKiBAcGFyYW0gX3RpbWUgdGhlIHBvaW50IGluIHRpbWUgYXQgd2hpY2ggdG8gZXZhbHVhdGUgdGhlIHNlcXVlbmNlIGluIG1pbGxpc2Vjb25kcy5cclxuICAgICAqIEByZXR1cm5zIHRoZSB2YWx1ZSBvZiB0aGUgc2VxdWVuY2UgYXQgdGhlIGdpdmVuIHRpbWUuIDAgaWYgdGhlcmUgYXJlIG5vIGtleXMuXHJcbiAgICAgKi9cclxuICAgIGV2YWx1YXRlKF90aW1lOiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgICBpZiAodGhpcy5rZXlzLmxlbmd0aCA9PSAwKVxyXG4gICAgICAgIHJldHVybiAwOyAvL1RPRE86IHNob3VsZG4ndCByZXR1cm4gMCBidXQgc29tZXRoaW5nIGluZGljYXRpbmcgbm8gY2hhbmdlLCBsaWtlIG51bGwuIHByb2JhYmx5IG5lZWRzIHRvIGJlIGNoYW5nZWQgaW4gTm9kZSBhcyB3ZWxsIHRvIGlnbm9yZSBub24tbnVtZXJpYyB2YWx1ZXMgaW4gdGhlIGFwcGx5QW5pbWF0aW9uIGZ1bmN0aW9uXHJcbiAgICAgIGlmICh0aGlzLmtleXMubGVuZ3RoID09IDEgfHwgdGhpcy5rZXlzWzBdLlRpbWUgPj0gX3RpbWUpXHJcbiAgICAgICAgcmV0dXJuIHRoaXMua2V5c1swXS5WYWx1ZTtcclxuXHJcblxyXG4gICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgdGhpcy5rZXlzLmxlbmd0aCAtIDE7IGkrKykge1xyXG4gICAgICAgIGlmICh0aGlzLmtleXNbaV0uVGltZSA8PSBfdGltZSAmJiB0aGlzLmtleXNbaSArIDFdLlRpbWUgPiBfdGltZSkge1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMua2V5c1tpXS5mdW5jdGlvbk91dC5ldmFsdWF0ZShfdGltZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB0aGlzLmtleXNbdGhpcy5rZXlzLmxlbmd0aCAtIDFdLlZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkcyBhIG5ldyBrZXkgdG8gdGhlIHNlcXVlbmNlLlxyXG4gICAgICogQHBhcmFtIF9rZXkgdGhlIGtleSB0byBhZGRcclxuICAgICAqL1xyXG4gICAgYWRkS2V5KF9rZXk6IEFuaW1hdGlvbktleSk6IHZvaWQge1xyXG4gICAgICB0aGlzLmtleXMucHVzaChfa2V5KTtcclxuICAgICAgdGhpcy5rZXlzLnNvcnQoQW5pbWF0aW9uS2V5LmNvbXBhcmUpO1xyXG4gICAgICB0aGlzLnJlZ2VuZXJhdGVGdW5jdGlvbnMoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZXMgYSBnaXZlbiBrZXkgZnJvbSB0aGUgc2VxdWVuY2UuXHJcbiAgICAgKiBAcGFyYW0gX2tleSB0aGUga2V5IHRvIHJlbW92ZVxyXG4gICAgICovXHJcbiAgICByZW1vdmVLZXkoX2tleTogQW5pbWF0aW9uS2V5KTogdm9pZCB7XHJcbiAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB0aGlzLmtleXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBpZiAodGhpcy5rZXlzW2ldID09IF9rZXkpIHtcclxuICAgICAgICAgIHRoaXMua2V5cy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICB0aGlzLnJlZ2VuZXJhdGVGdW5jdGlvbnMoKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZXMgdGhlIEFuaW1hdGlvbiBLZXkgYXQgdGhlIGdpdmVuIGluZGV4IGZyb20gdGhlIGtleXMuXHJcbiAgICAgKiBAcGFyYW0gX2luZGV4IHRoZSB6ZXJvLWJhc2VkIGluZGV4IGF0IHdoaWNoIHRvIHJlbW92ZSB0aGUga2V5XHJcbiAgICAgKiBAcmV0dXJucyB0aGUgcmVtb3ZlZCBBbmltYXRpb25LZXkgaWYgc3VjY2Vzc2Z1bCwgbnVsbCBvdGhlcndpc2UuXHJcbiAgICAgKi9cclxuICAgIHJlbW92ZUtleUF0SW5kZXgoX2luZGV4OiBudW1iZXIpOiBBbmltYXRpb25LZXkge1xyXG4gICAgICBpZiAoX2luZGV4IDwgMCB8fCBfaW5kZXggPj0gdGhpcy5rZXlzLmxlbmd0aCkge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICB9XHJcbiAgICAgIGxldCBhazogQW5pbWF0aW9uS2V5ID0gdGhpcy5rZXlzW19pbmRleF07XHJcbiAgICAgIHRoaXMua2V5cy5zcGxpY2UoX2luZGV4LCAxKTtcclxuICAgICAgdGhpcy5yZWdlbmVyYXRlRnVuY3Rpb25zKCk7XHJcbiAgICAgIHJldHVybiBhaztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgYSBrZXkgZnJvbSB0aGUgc2VxdWVuY2UgYXQgdGhlIGRlc2lyZWQgaW5kZXguXHJcbiAgICAgKiBAcGFyYW0gX2luZGV4IHRoZSB6ZXJvLWJhc2VkIGluZGV4IGF0IHdoaWNoIHRvIGdldCB0aGUga2V5XHJcbiAgICAgKiBAcmV0dXJucyB0aGUgQW5pbWF0aW9uS2V5IGF0IHRoZSBpbmRleCBpZiBpdCBleGlzdHMsIG51bGwgb3RoZXJ3aXNlLlxyXG4gICAgICovXHJcbiAgICBnZXRLZXkoX2luZGV4OiBudW1iZXIpOiBBbmltYXRpb25LZXkge1xyXG4gICAgICBpZiAoX2luZGV4IDwgMCB8fCBfaW5kZXggPj0gdGhpcy5rZXlzLmxlbmd0aClcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgcmV0dXJuIHRoaXMua2V5c1tfaW5kZXhdO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBsZW5ndGgoKTogbnVtYmVyIHtcclxuICAgICAgcmV0dXJuIHRoaXMua2V5cy5sZW5ndGg7XHJcbiAgICB9XHJcblxyXG4gICAgLy8jcmVnaW9uIHRyYW5zZmVyXHJcbiAgICBzZXJpYWxpemUoKTogU2VyaWFsaXphdGlvbiB7XHJcbiAgICAgIGxldCBzOiBTZXJpYWxpemF0aW9uID0ge1xyXG4gICAgICAgIGtleXM6IFtdLFxyXG4gICAgICAgIGFuaW1hdGlvblNlcXVlbmNlOiB0cnVlXHJcbiAgICAgIH07XHJcbiAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB0aGlzLmtleXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBzLmtleXNbaV0gPSB0aGlzLmtleXNbaV0uc2VyaWFsaXplKCk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHM7XHJcbiAgICB9XHJcbiAgICBkZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbik6IFNlcmlhbGl6YWJsZSB7XHJcbiAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBfc2VyaWFsaXphdGlvbi5rZXlzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgLy8gdGhpcy5rZXlzLnB1c2goPEFuaW1hdGlvbktleT5TZXJpYWxpemVyLmRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uLmtleXNbaV0pKTtcclxuICAgICAgICBsZXQgazogQW5pbWF0aW9uS2V5ID0gbmV3IEFuaW1hdGlvbktleSgpO1xyXG4gICAgICAgIGsuZGVzZXJpYWxpemUoX3NlcmlhbGl6YXRpb24ua2V5c1tpXSk7XHJcbiAgICAgICAgdGhpcy5rZXlzW2ldID0gaztcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5yZWdlbmVyYXRlRnVuY3Rpb25zKCk7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgcHJvdGVjdGVkIHJlZHVjZU11dGF0b3IoX211dGF0b3I6IE11dGF0b3IpOiB2b2lkIHtcclxuICAgICAgLy9cclxuICAgIH1cclxuICAgIC8vI2VuZHJlZ2lvblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXRpbGl0eSBmdW5jdGlvbiB0aGF0IChyZS0pZ2VuZXJhdGVzIGFsbCBmdW5jdGlvbnMgaW4gdGhlIHNlcXVlbmNlLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHJlZ2VuZXJhdGVGdW5jdGlvbnMoKTogdm9pZCB7XHJcbiAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB0aGlzLmtleXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBsZXQgZjogQW5pbWF0aW9uRnVuY3Rpb24gPSBuZXcgQW5pbWF0aW9uRnVuY3Rpb24odGhpcy5rZXlzW2ldKTtcclxuICAgICAgICB0aGlzLmtleXNbaV0uZnVuY3Rpb25PdXQgPSBmO1xyXG4gICAgICAgIGlmIChpID09IHRoaXMua2V5cy5sZW5ndGggLSAxKSB7XHJcbiAgICAgICAgICAvL1RPRE86IGNoZWNrIGlmIHRoaXMgaXMgZXZlbiB1c2VmdWwuIE1heWJlIHVwZGF0ZSB0aGUgcnVuY29uZGl0aW9uIHRvIGxlbmd0aCAtIDEgaW5zdGVhZC4gTWlnaHQgYmUgcmVkdW5kYW50IGlmIGZ1bmN0aW9uSW4gaXMgcmVtb3ZlZCwgc2VlIFRPRE8gaW4gQW5pbWF0aW9uS2V5LlxyXG4gICAgICAgICAgZi5zZXRLZXlPdXQgPSB0aGlzLmtleXNbMF07XHJcbiAgICAgICAgICB0aGlzLmtleXNbMF0uZnVuY3Rpb25JbiA9IGY7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgZi5zZXRLZXlPdXQgPSB0aGlzLmtleXNbaSArIDFdO1xyXG4gICAgICAgIHRoaXMua2V5c1tpICsgMV0uZnVuY3Rpb25JbiA9IGY7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogRGVzY3JpYmVzIHRoZSBbW0F1ZGlvXV0gY2xhc3MgaW4gd2hpY2ggYWxsIEF1ZGlvIERhdGEgaXMgc3RvcmVkLlxyXG4gICAgICogQXVkaW8gd2lsbCBiZSBnaXZlbiB0byB0aGUgW1tDb21wb25lbnRBdWRpb11dIGZvciBmdXJ0aGVyIHVzYWdlLlxyXG4gICAgICogQGF1dGhvcnMgVGhvbWFzIERvcm5lciwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBBdWRpbyB7XHJcblxyXG4gICAgICAgIHB1YmxpYyB1cmw6IHN0cmluZztcclxuXHJcbiAgICAgICAgcHVibGljIGF1ZGlvQnVmZmVyOiBBdWRpb0J1ZmZlcjtcclxuICAgICAgICBwdWJsaWMgYnVmZmVyU291cmNlOiBBdWRpb0J1ZmZlclNvdXJjZU5vZGU7XHJcblxyXG4gICAgICAgIHB1YmxpYyBsb2NhbEdhaW46IEdhaW5Ob2RlO1xyXG4gICAgICAgIHB1YmxpYyBsb2NhbEdhaW5WYWx1ZTogbnVtYmVyO1xyXG5cclxuICAgICAgICBwdWJsaWMgaXNMb29waW5nOiBib29sZWFuO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDb25zdHJ1Y3RvciBmb3IgdGhlIFtbQXVkaW9dXSBDbGFzc1xyXG4gICAgICAgICAqIEBwYXJhbSBfYXVkaW9Db250ZXh0IGZyb20gW1tBdWRpb1NldHRpbmdzXV1cclxuICAgICAgICAgKiBAcGFyYW0gX2dhaW5WYWx1ZSAwIGZvciBtdXRlZCB8IDEgZm9yIG1heCB2b2x1bWVcclxuICAgICAgICAgKi9cclxuICAgICAgICBjb25zdHJ1Y3RvcihfYXVkaW9Db250ZXh0OiBBdWRpb0NvbnRleHQsIF9hdWRpb1Nlc3Npb25EYXRhOiBBdWRpb1Nlc3Npb25EYXRhLCBfdXJsOiBzdHJpbmcsIF9nYWluVmFsdWU6IG51bWJlciwgX2xvb3A6IGJvb2xlYW4pIHtcclxuICAgICAgICAgICAgdGhpcy5pbml0KF9hdWRpb0NvbnRleHQsIF9hdWRpb1Nlc3Npb25EYXRhLCBfdXJsLCBfZ2FpblZhbHVlLCBfbG9vcCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgYXN5bmMgaW5pdChfYXVkaW9Db250ZXh0OiBBdWRpb0NvbnRleHQsIF9hdWRpb1Nlc3Npb25EYXRhOiBBdWRpb1Nlc3Npb25EYXRhLCBfdXJsOiBzdHJpbmcsIF9nYWluVmFsdWU6IG51bWJlciwgX2xvb3A6IGJvb2xlYW4pOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICAgICAgLy8gRG8gZXZlcnl0aGluZyBpbiBjb25zdHJ1Y3RvclxyXG4gICAgICAgICAgICAvLyBBZGQgdXJsIHRvIEF1ZGlvXHJcbiAgICAgICAgICAgIHRoaXMudXJsID0gX3VybDtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJBdWRpbyB1cmwgXCIgKyB0aGlzLnVybCk7XHJcbiAgICAgICAgICAgIC8vIEdldCBBdWRpb0J1ZmZlclxyXG4gICAgICAgICAgICBjb25zdCBidWZmZXJQcm9tOiBQcm9taXNlPEF1ZGlvQnVmZmVyPiA9IF9hdWRpb1Nlc3Npb25EYXRhLnVybFRvQnVmZmVyKF9hdWRpb0NvbnRleHQsIF91cmwpO1xyXG4gICAgICAgICAgICB3aGlsZSAoIWJ1ZmZlclByb20pIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwid2FpdGluZy4uLlwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhd2FpdCBidWZmZXJQcm9tLnRoZW4odmFsID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYXVkaW9CdWZmZXIgPSB2YWw7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInZhbEJ1ZmZlciBcIiArIHZhbCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkF1ZGlvIGF1ZGlvYnVmZmVyIFwiICsgdGhpcy5hdWRpb0J1ZmZlcik7XHJcbiAgICAgICAgICAgIC8vIC8vIEFkZCBsb2NhbCBHYWluIGZvciBBdWRpbyAgYW5kIGNvbm5lY3QgXHJcbiAgICAgICAgICAgIHRoaXMubG9jYWxHYWluID0gYXdhaXQgX2F1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XHJcbiAgICAgICAgICAgIHRoaXMubG9jYWxHYWluVmFsdWUgPSBhd2FpdCBfZ2FpblZhbHVlO1xyXG4gICAgICAgICAgICAvL2NyZWF0ZSBBdWRpb1xyXG4gICAgICAgICAgICBhd2FpdCB0aGlzLmNyZWF0ZUF1ZGlvKF9hdWRpb0NvbnRleHQsIHRoaXMuYXVkaW9CdWZmZXIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogaW5pdEJ1ZmZlclNvdXJjZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBpbml0QnVmZmVyU291cmNlKF9hdWRpb0NvbnRleHQ6IEF1ZGlvQ29udGV4dCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmJ1ZmZlclNvdXJjZSA9IF9hdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuYnVmZmVyU291cmNlLmJ1ZmZlciA9IHRoaXMuYXVkaW9CdWZmZXI7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiYlMgPSBcIiArIHRoaXMuYnVmZmVyU291cmNlKTtcclxuICAgICAgICAgICAgdGhpcy5idWZmZXJTb3VyY2UuY29ubmVjdChfYXVkaW9Db250ZXh0LmRlc3RpbmF0aW9uKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2V0TG9vcCgpO1xyXG4gICAgICAgICAgICB0aGlzLmFkZExvY2FsR2FpbigpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkJ1ZmZlclNvdXJjZS5idWZmZXI6IFwiICsgdGhpcy5idWZmZXJTb3VyY2UuYnVmZmVyKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJBdWRpb0J1ZmZlcjogXCIgKyB0aGlzLmF1ZGlvQnVmZmVyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vI3JlZ2lvbiBHZXR0ZXIvU2V0dGVyIExvY2FsR2FpblZhbHVlXHJcbiAgICAgICAgcHVibGljIHNldExvY2FsR2FpblZhbHVlKF9sb2NhbEdhaW5WYWx1ZTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMubG9jYWxHYWluVmFsdWUgPSBfbG9jYWxHYWluVmFsdWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0TG9jYWxHYWluVmFsdWUoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubG9jYWxHYWluVmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vI2VuZHJlZ2lvbiBHZXR0ZXIvU2V0dGVyIExvY2FsR2FpblZhbHVlXHJcblxyXG4gICAgICAgIHB1YmxpYyBzZXRCdWZmZXJTb3VyY2UoX2J1ZmZlcjogQXVkaW9CdWZmZXIpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5idWZmZXJTb3VyY2UuYnVmZmVyID0gX2J1ZmZlcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIGNyZWF0ZUF1ZGlvIGJ1aWxkcyBhbiBbW0F1ZGlvXV0gdG8gdXNlIHdpdGggdGhlIFtbQ29tcG9uZW50QXVkaW9dXVxyXG4gICAgICAgICAqIEBwYXJhbSBfYXVkaW9Db250ZXh0IGZyb20gW1tBdWRpb1NldHRpbmdzXV1cclxuICAgICAgICAgKiBAcGFyYW0gX2F1ZGlvQnVmZmVyIGZyb20gW1tBdWRpb1Nlc3Npb25EYXRhXV1cclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIGNyZWF0ZUF1ZGlvKF9hdWRpb0NvbnRleHQ6IEF1ZGlvQ29udGV4dCwgX2F1ZGlvQnVmZmVyOiBBdWRpb0J1ZmZlcik6IEF1ZGlvQnVmZmVyIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJjcmVhdGVBdWRpbygpIFwiICsgXCIgfCBcIiArIFwiIEF1ZGlvQ29udGV4dDogXCIgKyBfYXVkaW9Db250ZXh0KTtcclxuICAgICAgICAgICAgdGhpcy5hdWRpb0J1ZmZlciA9IF9hdWRpb0J1ZmZlcjtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJhQiA9IFwiICsgdGhpcy5hdWRpb0J1ZmZlcik7XHJcbiAgICAgICAgICAgIC8vIEF1ZGlvQnVmZmVyc291cmNlTm9kZSBTZXR1cFxyXG4gICAgICAgICAgICB0aGlzLmluaXRCdWZmZXJTb3VyY2UoX2F1ZGlvQ29udGV4dCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmF1ZGlvQnVmZmVyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzZXRMb29wKCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmJ1ZmZlclNvdXJjZS5sb29wID0gdGhpcy5pc0xvb3Bpbmc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGFkZExvY2FsR2FpbigpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5idWZmZXJTb3VyY2UuY29ubmVjdCh0aGlzLmxvY2FsR2Fpbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIEFkZCBhbiBbW0F1ZGlvRmlsdGVyXV0gdG8gYW4gW1tBdWRpb11dXHJcbiAgICAgKiBAYXV0aG9ycyBUaG9tYXMgRG9ybmVyLCBIRlUsIDIwMTlcclxuICAgICAqL1xyXG4gICAgZW51bSBGSUxURVJfVFlQRSB7XHJcbiAgICAgICAgTE9XUEFTUyA9IFwiTE9XUEFTU1wiLFxyXG4gICAgICAgIEhJR0hQQVNTID0gXCJISUdIUEFTU1wiLFxyXG4gICAgICAgIEJBTkRQQVNTID0gXCJCQU5EUEFTU1wiLFxyXG4gICAgICAgIExPV1NIRUxGID0gXCJMT1dTSEVMRlwiLFxyXG4gICAgICAgIEhJR0hTSEVMRiA9IFwiSElHSFNIRUxGXCIsXHJcbiAgICAgICAgUEVBS0lORyA9IFwiUEVBS0lOR1wiLFxyXG4gICAgICAgIE5PVENIID0gXCJOT1RDSFwiLFxyXG4gICAgICAgIEFMTFBBU1MgPSBcIkFMTFBBU1NcIlxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBBdWRpb0ZpbHRlciB7XHJcblxyXG4gICAgICAgIHB1YmxpYyB1c2VGaWx0ZXI6IGJvb2xlYW47XHJcbiAgICAgICAgcHVibGljIGZpbHRlclR5cGU6IEZJTFRFUl9UWVBFO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnN0cnVjdG9yKF91c2VGaWx0ZXI6IGJvb2xlYW4sIF9maWx0ZXJUeXBlOiBGSUxURVJfVFlQRSkge1xyXG4gICAgICAgICAgICB0aGlzLnVzZUZpbHRlciA9IF91c2VGaWx0ZXI7XHJcbiAgICAgICAgICAgIHRoaXMuZmlsdGVyVHlwZSA9IF9maWx0ZXJUeXBlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogYWRkRmlsdGVyVG9cclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgYWRkRmlsdGVyVG9BdWRpbyhfYXVkaW9CdWZmZXI6IEF1ZGlvQnVmZmVyLCBfZmlsdGVyVHlwZTogRklMVEVSX1RZUEUpOiB2b2lkIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJkbyBub3RoaW5nIGZvciBub3dcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBEZXNjcmliZXMgYSBbW0F1ZGlvTGlzdGVuZXJdXSBhdHRhY2hlZCB0byBhIFtbTm9kZV1dXHJcbiAgICAgKiBAYXV0aG9ycyBUaG9tYXMgRG9ybmVyLCBIRlUsIDIwMTlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIEF1ZGlvTGlzdGVuZXIge1xyXG4gICAgICAgIHB1YmxpYyBhdWRpb0xpc3RlbmVyOiBBdWRpb0xpc3RlbmVyO1xyXG5cclxuICAgICAgICBwcml2YXRlIHBvc2l0aW9uOiBWZWN0b3IzO1xyXG4gICAgICAgIHByaXZhdGUgb3JpZW50YXRpb246IFZlY3RvcjM7XHJcblxyXG4gICAgICAgIC8vIyNUT0RPIEF1ZGlvTGlzdGVuZXJcclxuICAgICAgICBjb25zdHJ1Y3RvcihfYXVkaW9Db250ZXh0OiBBdWRpb0NvbnRleHQpIHtcclxuICAgICAgICAgICAgLy90aGlzLmF1ZGlvTGlzdGVuZXIgPSBfYXVkaW9Db250ZXh0Lmxpc3RlbmVyO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFdlIHdpbGwgY2FsbCBzZXRBdWRpb0xpc3RlbmVyUG9zaXRpb24gd2hlbmV2ZXIgdGhlcmUgaXMgYSBuZWVkIHRvIGNoYW5nZSBQb3NpdGlvbnMuXHJcbiAgICAgICAgICogQWxsIHRoZSBwb3NpdGlvbiB2YWx1ZXMgc2hvdWxkIGJlIGlkZW50aWNhbCB0byB0aGUgY3VycmVudCBQb3NpdGlvbiB0aGlzIGlzIGF0dGVjaGVkIHRvLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIC8vIHB1YmxpYyBzZXRBdWRpb0xpc3RlbmVyUG9zaXRpb24oX3Bvc2l0aW9uOiBWZWN0b3IzKTogdm9pZCB7XHJcbiAgICAgICAgLy8gICAgIHRoaXMuYXVkaW9MaXN0ZW5lci5wb3NpdGlvblgudmFsdWUgPSBfcG9zaXRpb24ueDtcclxuICAgICAgICAvLyAgICAgdGhpcy5hdWRpb0xpc3RlbmVyLnBvc2l0aW9uWS52YWx1ZSA9IF9wb3NpdGlvbi55O1xyXG4gICAgICAgIC8vICAgICB0aGlzLmF1ZGlvTGlzdGVuZXIucG9zaXRpb25aLnZhbHVlID0gX3Bvc2l0aW9uLno7XHJcblxyXG4gICAgICAgIC8vICAgICB0aGlzLnBvc2l0aW9uID0gX3Bvc2l0aW9uO1xyXG4gICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogZ2V0QXVkaW9MaXN0ZW5lclBvc2l0aW9uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGdldEF1ZGlvTGlzdGVuZXJQb3NpdGlvbigpOiBWZWN0b3IzIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucG9zaXRpb247XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBzZXRBdWRpb0xpc3RlbmVyT3JpZW50YXRpb25cclxuICAgICAgICAgKi9cclxuICAgICAgICAvLyBwdWJsaWMgc2V0QXVkaW9MaXN0ZW5lck9yaWVudGF0aW9uKF9vcmllbnRhdGlvbjogVmVjdG9yMyk6IHZvaWQge1xyXG4gICAgICAgIC8vICAgICB0aGlzLmF1ZGlvTGlzdGVuZXIub3JpZW50YXRpb25YLnZhbHVlID0gX29yaWVudGF0aW9uLng7XHJcbiAgICAgICAgLy8gICAgIHRoaXMuYXVkaW9MaXN0ZW5lci5vcmllbnRhdGlvblkudmFsdWUgPSBfb3JpZW50YXRpb24ueTtcclxuICAgICAgICAvLyAgICAgdGhpcy5hdWRpb0xpc3RlbmVyLm9yaWVudGF0aW9uWi52YWx1ZSA9IF9vcmllbnRhdGlvbi56O1xyXG5cclxuICAgICAgICAvLyAgICAgdGhpcy5vcmllbnRhdGlvbiA9IF9vcmllbnRhdGlvbjtcclxuICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIGdldEF1ZGlvTGlzdGVuZXJPcmllbnRhdGlvblxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBnZXRBdWRpb0xpc3RlbmVyT3JpZW50YXRpb24oKTogVmVjdG9yMyB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9yaWVudGF0aW9uO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVXNlIFBvc2l0aW9uIGZyb20gUGFyZW50IE5vZGUgdG8gdXBkYXRlIG93biBQb3NpdGlvbiBhY2NvcmRpbmdseVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIC8vIHByaXZhdGUgZ2V0UGFyZW50Tm9kZVBvc2l0aW9uKCkge1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAvLyB9XHJcbiAgICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogXHJcbiAgICAgKiBAYXV0aG9ycyBUaG9tYXMgRG9ybmVyLCBIRlUsIDIwMTlcclxuICAgICAqL1xyXG4gICAgZW51bSBQQU5OSU5HX01PREVMX1RZUEUge1xyXG4gICAgICAgIEVRVUFMUE9XRVIgPSBcIkVRVUFMUE9XRVJcIixcclxuICAgICAgICBIUkZUID0gXCJIUkZUXCJcclxuICAgIH1cclxuXHJcbiAgICBlbnVtIERJU1RBTkNFX01PREVMX1RZUEUge1xyXG4gICAgICAgIExJTkVBUiA9IFwiTElORUFSXCIsXHJcbiAgICAgICAgSU5WRVJTRSA9IFwiSU5WRVJTRVwiLFxyXG4gICAgICAgIEVYUE9ORU5USUFMID0gXCJFWFBPTkVOVElBTFwiXHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIEF1ZGlvTG9jYWxpc2F0aW9uIHtcclxuXHJcbiAgICAgICAgcHVibGljIHBhbm5lck5vZGU6IFBhbm5lck5vZGU7XHJcbiAgICAgICAgcHVibGljIHBhbm5pbmdNb2RlbDogUEFOTklOR19NT0RFTF9UWVBFO1xyXG4gICAgICAgIHB1YmxpYyBkaXN0YW5jZU1vZGVsOiBESVNUQU5DRV9NT0RFTF9UWVBFO1xyXG4gICAgICAgIHB1YmxpYyByZWZEaXN0YW5jZTogbnVtYmVyO1xyXG4gICAgICAgIHB1YmxpYyBtYXhEaXN0YW5jZTogbnVtYmVyO1xyXG4gICAgICAgIHB1YmxpYyByb2xsb2ZmRmFjdG9yOiBudW1iZXI7XHJcbiAgICAgICAgcHVibGljIGNvbm5lcklubmVyQW5nbGU6IG51bWJlcjtcclxuICAgICAgICBwdWJsaWMgY29uZU91dGVyQW5nbGU6IG51bWJlcjtcclxuICAgICAgICBwdWJsaWMgY29uZU91dGVyR2FpbjogbnVtYmVyO1xyXG4gICAgICAgIHB1YmxpYyBwb3NpdGlvbjogVmVjdG9yMztcclxuICAgICAgICBwdWJsaWMgb3JpZW50YXRpb246IFZlY3RvcjM7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ29uc3RydWN0b3IgZm9yIHRoZSBbW0F1ZGlvTG9jYWxpc2F0aW9uXV0gQ2xhc3NcclxuICAgICAgICAgKiBAcGFyYW0gX2F1ZGlvQ29udGV4dCBmcm9tIFtbQXVkaW9TZXR0aW5nc11dXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY29uc3RydWN0b3IoX2F1ZGlvQ29udGV4dDogQXVkaW9Db250ZXh0KSB7XHJcbiAgICAgICAgICAgdGhpcy5wYW5uZXJOb2RlID0gX2F1ZGlvQ29udGV4dC5jcmVhdGVQYW5uZXIoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICAvKipcclxuICAgICAgICAgKiBXZSB3aWxsIGNhbGwgc2V0UGFubmVyUG9zaXRpb24gd2hlbmV2ZXIgdGhlcmUgaXMgYSBuZWVkIHRvIGNoYW5nZSBQb3NpdGlvbnMuXHJcbiAgICAgICAgICogQWxsIHRoZSBwb3NpdGlvbiB2YWx1ZXMgc2hvdWxkIGJlIGlkZW50aWNhbCB0byB0aGUgY3VycmVudCBQb3NpdGlvbiB0aGlzIGlzIGF0dGVjaGVkIHRvLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIC8vIHB1YmxpYyBzZXRQYW5uZVBvc2l0aW9uKF9wb3NpdGlvbjogVmVjdG9yMyk6IHZvaWQge1xyXG4gICAgICAgIC8vICAgICB0aGlzLnBhbm5lck5vZGUucG9zaXRpb25YLnZhbHVlID0gX3Bvc2l0aW9uLng7XHJcbiAgICAgICAgLy8gICAgIHRoaXMucGFubmVyTm9kZS5wb3NpdGlvblkudmFsdWUgPSBfcG9zaXRpb24ueTtcclxuICAgICAgICAvLyAgICAgdGhpcy5wYW5uZXJOb2RlLnBvc2l0aW9uWi52YWx1ZSA9IF9wb3NpdGlvbi56O1xyXG5cclxuICAgICAgICAvLyAgICAgdGhpcy5wb3NpdGlvbiA9IF9wb3NpdGlvbjtcclxuICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIGdldFBhbm5lclBvc2l0aW9uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGdldFBhbm5lclBvc2l0aW9uKCk6IFZlY3RvcjMge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wb3NpdGlvbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIHNldFBhbm5lT3JpZW50YXRpb25cclxuICAgICAgICAgKi9cclxuICAgICAgICAvLyBwdWJsaWMgc2V0UGFubmVyT3JpZW50YXRpb24oX29yaWVudGF0aW9uOiBWZWN0b3IzKTogdm9pZCB7XHJcbiAgICAgICAgLy8gICAgIHRoaXMucGFubmVyTm9kZS5vcmllbnRhdGlvblgudmFsdWUgPSBfb3JpZW50YXRpb24ueDtcclxuICAgICAgICAvLyAgICAgdGhpcy5wYW5uZXJOb2RlLm9yaWVudGF0aW9uWS52YWx1ZSA9IF9vcmllbnRhdGlvbi55O1xyXG4gICAgICAgIC8vICAgICB0aGlzLnBhbm5lck5vZGUub3JpZW50YXRpb25aLnZhbHVlID0gX29yaWVudGF0aW9uLno7XHJcblxyXG4gICAgICAgIC8vICAgICB0aGlzLm9yaWVudGF0aW9uID0gX29yaWVudGF0aW9uO1xyXG4gICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogZ2V0UGFubmVPcmllbnRhdGlvblxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBnZXRQYW5uZU9yaWVudGF0aW9uKCk6IFZlY3RvcjMge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcmllbnRhdGlvbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIEludGVyZmFjZSB0byBnZW5lcmF0ZSBEYXRhIFBhaXJzIG9mIFVSTCBhbmQgQXVkaW9CdWZmZXJcclxuICAgICAqL1xyXG4gICAgaW50ZXJmYWNlIEF1ZGlvRGF0YSB7XHJcbiAgICAgICAgdXJsOiBzdHJpbmc7XHJcbiAgICAgICAgYnVmZmVyOiBBdWRpb0J1ZmZlcjtcclxuICAgICAgICBjb3VudGVyOiBudW1iZXI7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZXNjcmliZXMgRGF0YSBIYW5kbGVyIGZvciBhbGwgQXVkaW8gU291cmNlc1xyXG4gICAgICogQGF1dGhvcnMgVGhvbWFzIERvcm5lciwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBBdWRpb1Nlc3Npb25EYXRhIHtcclxuICAgICAgICBwdWJsaWMgZGF0YUFycmF5OiBBdWRpb0RhdGFbXTtcclxuICAgICAgICBwcml2YXRlIGJ1ZmZlckNvdW50ZXI6IG51bWJlcjtcclxuICAgICAgICAvL1RPRE8gb2Jzb2xldGUgaG9sZGVyIHdoZW4gYXJyYXkgd29ya2luZyAvIG1heWJlIHVzZSBhcyBoZWxwZXIgdmFyXHJcbiAgICAgICAgcHJpdmF0ZSBhdWRpb0J1ZmZlckhvbGRlcjogQXVkaW9EYXRhO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBjb25zdHJ1Y3RvciBvZiB0aGUgW1tBdWRpb1Nlc3Npb25EYXRhXV0gY2xhc3NcclxuICAgICAgICAgKi9cclxuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAgICAgdGhpcy5kYXRhQXJyYXkgPSBuZXcgQXJyYXkoKTtcclxuICAgICAgICAgICAgdGhpcy5idWZmZXJDb3VudGVyID0gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIGdldEJ1ZmZlckNvdW50ZXIgcmV0dXJucyBbYnVmZmVyQ291bnRlcl0gdG8ga2VlcCB0cmFjayBvZiBudW1iZXIgb2YgZGlmZmVyZW50IHVzZWQgc291bmRzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGdldEJ1ZmZlckNvdW50ZXIoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYnVmZmVyQ291bnRlcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERlY29kaW5nIEF1ZGlvIERhdGEgXHJcbiAgICAgICAgICogQXN5bmNocm9ub3VzIEZ1bmN0aW9uIHRvIHBlcm1pdCB0aGUgbG9hZGluZyBvZiBtdWx0aXBsZSBEYXRhIFNvdXJjZXMgYXQgdGhlIHNhbWUgdGltZVxyXG4gICAgICAgICAqIEBwYXJhbSBfdXJsIFVSTCBhcyBTdHJpbmcgZm9yIERhdGEgZmV0Y2hpbmdcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgYXN5bmMgdXJsVG9CdWZmZXIoX2F1ZGlvQ29udGV4dDogQXVkaW9Db250ZXh0LCBfdXJsOiBzdHJpbmcpOiBQcm9taXNlPEF1ZGlvQnVmZmVyPiB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiaW5zaWRlIHVybFRvQnVmZmVyXCIpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IGluaXRPYmplY3Q6IFJlcXVlc3RJbml0ID0ge1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiBcIkdFVFwiLFxyXG4gICAgICAgICAgICAgICAgbW9kZTogXCJzYW1lLW9yaWdpblwiLCAvL2RlZmF1bHQgLT4gc2FtZS1vcmlnaW5cclxuICAgICAgICAgICAgICAgIGNhY2hlOiBcIm5vLWNhY2hlXCIsIC8vZGVmYXVsdCAtPiBkZWZhdWx0IFxyXG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXVkaW8vbXBlZzNcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHJlZGlyZWN0OiBcImZvbGxvd1wiIC8vIGRlZmF1bHQgLT4gZm9sbG93XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIC8vIENoZWNrIGZvciBleGlzdGluZyBVUkwgaW4gRGF0YUFycmF5LCBpZiBubyBkYXRhIGluc2lkZSBhZGQgbmV3IEF1ZGlvRGF0YVxyXG4gICAgICAgICAgICAvL3RoaXMucHVzaERhdGFBcnJheShfdXJsLCBudWxsKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJsZW5ndGhcIiArIHRoaXMuZGF0YUFycmF5Lmxlbmd0aCk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGFBcnJheS5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBuZWVkIHdpbmRvdyB0byBmZXRjaD9cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZTogUmVzcG9uc2UgPSBhd2FpdCB3aW5kb3cuZmV0Y2goX3VybCwgaW5pdE9iamVjdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYXJyYXlCdWZmZXI6IEFycmF5QnVmZmVyID0gYXdhaXQgcmVzcG9uc2UuYXJyYXlCdWZmZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBkZWNvZGVkQXVkaW86IEF1ZGlvQnVmZmVyID0gYXdhaXQgX2F1ZGlvQ29udGV4dC5kZWNvZGVBdWRpb0RhdGEoYXJyYXlCdWZmZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHVzaERhdGFBcnJheShfdXJsLCBkZWNvZGVkQXVkaW8pO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vdGhpcy5kYXRhQXJyYXlbdGhpcy5kYXRhQXJyYXkubGVuZ3RoXS5idWZmZXIgPSBkZWNvZGVkQXVkaW87XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJsZW5ndGggXCIgKyB0aGlzLmRhdGFBcnJheS5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkZWNvZGVkQXVkaW87XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dFcnJvckZldGNoKGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gSWYgbmVlZGVkIFVSTCBpcyBpbnNpZGUgQXJyYXksIFxyXG4gICAgICAgICAgICAgICAgLy8gaXRlcmF0ZSB0aHJvdWdoIGFsbCBleGlzdGluZyBEYXRhIHRvIGdldCBuZWVkZWQgdmFsdWVzXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCB4OiBudW1iZXIgPSAwOyB4IDwgdGhpcy5kYXRhQXJyYXkubGVuZ3RoOyB4KyspIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIndoYXQgaXMgaGFwcGVuaW5nXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmRhdGFBcnJheVt4XS51cmwgPT0gX3VybCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImZvdW5kIGV4aXN0aW5nIHVybFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0YUFycmF5W3hdLmJ1ZmZlcjtcclxuICAgICAgICAgICAgICAgICAgICB9IFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBwdXNoVHVwbGUgU291cmNlIGFuZCBEZWNvZGVkIEF1ZGlvIERhdGEgZ2V0cyBzYXZlZCBmb3IgbGF0ZXIgdXNlXHJcbiAgICAgICAgICogQHBhcmFtIF91cmwgVVJMIGZyb20gdXNlZCBEYXRhXHJcbiAgICAgICAgICogQHBhcmFtIF9hdWRpb0J1ZmZlciBBdWRpb0J1ZmZlciBnZW5lcmF0ZWQgZnJvbSBVUkxcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgcHVzaERhdGFBcnJheShfdXJsOiBzdHJpbmcsIF9hdWRpb0J1ZmZlcjogQXVkaW9CdWZmZXIpOiBBdWRpb0RhdGEge1xyXG4gICAgICAgICAgICBsZXQgZGF0YTogQXVkaW9EYXRhO1xyXG4gICAgICAgICAgICBkYXRhID0geyB1cmw6IF91cmwsIGJ1ZmZlcjogX2F1ZGlvQnVmZmVyLCBjb3VudGVyOiB0aGlzLmJ1ZmZlckNvdW50ZXIgfTtcclxuICAgICAgICAgICAgdGhpcy5kYXRhQXJyYXkucHVzaChkYXRhKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJhcnJheTogXCIgKyB0aGlzLmRhdGFBcnJheSk7XHJcblxyXG4gICAgICAgICAgICAvL1RPRE8gYXVkaW9CdWZmZXJIb2xkZXIgb2Jzb2xldGUgaWYgYXJyYXkgd29ya2luZ1xyXG4gICAgICAgICAgICB0aGlzLnNldEF1ZGlvQnVmZmVySG9sZGVyKGRhdGEpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImRhdGFQYWlyIFwiICsgZGF0YS51cmwgKyBcIiBcIiArIGRhdGEuYnVmZmVyICsgXCIgXCIgKyBkYXRhLmNvdW50ZXIpO1xyXG4gICAgICAgICAgICB0aGlzLmJ1ZmZlckNvdW50ZXIgKz0gMTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXVkaW9CdWZmZXJIb2xkZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBpdGVyYXRlQXJyYXlcclxuICAgICAgICAgKiBMb29rIGF0IHNhdmVkIERhdGEgQ291bnRcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgY291bnREYXRhSW5BcnJheSgpOiB2b2lkIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJEYXRhQXJyYXkgTGVuZ3RoOiBcIiArIHRoaXMuZGF0YUFycmF5Lmxlbmd0aCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBzaG93RGF0YUluQXJyYXlcclxuICAgICAgICAgKiBTaG93IGFsbCBEYXRhIGluIEFycmF5XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHNob3dEYXRhSW5BcnJheSgpOiB2b2lkIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgeDogbnVtYmVyID0gMDsgeCA8IHRoaXMuZGF0YUFycmF5Lmxlbmd0aDsgeCsrKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkFycmF5IERhdGE6IFwiICsgdGhpcy5kYXRhQXJyYXlbeF0udXJsICsgdGhpcy5kYXRhQXJyYXlbeF0uYnVmZmVyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogZ2V0QXVkaW9CdWZmZXJcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0QXVkaW9CdWZmZXJIb2xkZXIoKTogQXVkaW9EYXRhIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXVkaW9CdWZmZXJIb2xkZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBzZXRBdWRpb0J1ZmZlclxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzZXRBdWRpb0J1ZmZlckhvbGRlcihfYXVkaW9EYXRhOiBBdWRpb0RhdGEpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5hdWRpb0J1ZmZlckhvbGRlciA9IF9hdWRpb0RhdGE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBFcnJvciBNZXNzYWdlIGZvciBEYXRhIEZldGNoaW5nXHJcbiAgICAgICAgICogQHBhcmFtIGUgRXJyb3JcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIGxvZ0Vycm9yRmV0Y2goZTogRXJyb3IpOiB2b2lkIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJBdWRpbyBlcnJvclwiLCBlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogRGVzY3JpYmVzIEdsb2JhbCBBdWRpbyBTZXR0aW5ncy5cclxuICAgICAqIElzIG1lYW50IHRvIGJlIHVzZWQgYXMgYSBNZW51IG9wdGlvbi5cclxuICAgICAqIEBhdXRob3JzIFRob21hcyBEb3JuZXIsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgQXVkaW9TZXR0aW5ncyB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9wdWJsaWMgYXVkaW9TZXNzaW9uRGF0YTogQXVkaW9TZXNzaW9uRGF0YTtcclxuXHJcbiAgICAgICAgLy9UT0RPIEFkZCBtYXN0ZXJHYWluXHJcbiAgICAgICAgcHVibGljIG1hc3RlckdhaW46IEdhaW5Ob2RlO1xyXG4gICAgICAgIHB1YmxpYyBtYXN0ZXJHYWluVmFsdWU6IG51bWJlcjtcclxuXHJcbiAgICAgICAgLy8gY29uc3Q/IG9yIHByaXZhdGUgd2l0aCBnZXR0ZXI/XHJcbiAgICAgICAgcHJpdmF0ZSBnbG9iYWxBdWRpb0NvbnRleHQ6IEF1ZGlvQ29udGV4dDtcclxuXHJcbiAgICAgICAgLy9cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDb25zdHJ1Y3RvciBmb3IgbWFzdGVyIFZvbHVtZVxyXG4gICAgICAgICAqIEBwYXJhbSBfZ2FpblZhbHVlIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKF9nYWluVmFsdWU6IG51bWJlcikge1xyXG4gICAgICAgICAgICB0aGlzLnNldEF1ZGlvQ29udGV4dChuZXcgQXVkaW9Db250ZXh0KHsgbGF0ZW5jeUhpbnQ6IFwiaW50ZXJhY3RpdmVcIiwgc2FtcGxlUmF0ZTogNDQxMDAgfSkpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy90aGlzLmdsb2JhbEF1ZGlvQ29udGV4dC5yZXN1bWUoKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJHbG9iYWxBdWRpb0NvbnRleHQ6IFwiICsgdGhpcy5nbG9iYWxBdWRpb0NvbnRleHQpO1xyXG4gICAgICAgICAgICB0aGlzLm1hc3RlckdhaW4gPSB0aGlzLmdsb2JhbEF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XHJcbiAgICAgICAgICAgIHRoaXMubWFzdGVyR2FpblZhbHVlID0gX2dhaW5WYWx1ZTtcclxuXHJcbiAgICAgICAgICAgIC8vdGhpcy5hdWRpb1Nlc3Npb25EYXRhID0gbmV3IEF1ZGlvU2Vzc2lvbkRhdGEoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzZXRNYXN0ZXJHYWluVmFsdWUoX21hc3RlckdhaW5WYWx1ZTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMubWFzdGVyR2FpblZhbHVlID0gX21hc3RlckdhaW5WYWx1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRNYXN0ZXJHYWluVmFsdWUoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubWFzdGVyR2FpblZhbHVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldEF1ZGlvQ29udGV4dCgpOiBBdWRpb0NvbnRleHQge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nbG9iYWxBdWRpb0NvbnRleHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc2V0QXVkaW9Db250ZXh0KF9hdWRpb0NvbnRleHQ6IEF1ZGlvQ29udGV4dCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmdsb2JhbEF1ZGlvQ29udGV4dCA9IF9hdWRpb0NvbnRleHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL1RPRE8gYWRkIHN1c3BlbmQvcmVzdW1lIGZ1bmN0aW9ucyBmb3IgQXVkaW9Db250ZXh0IGNvbnRyb2xzXHJcbiAgICB9XHJcbn0iLCIvLzxyZWZlcmVuY2UgcGF0aD1cIi4uL0NvYXRzL0NvYXQudHNcIi8+XHJcbm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgdHlwZSBDb2F0SW5qZWN0aW9uID0gKHRoaXM6IENvYXQsIF9yZW5kZXJTaGFkZXI6IFJlbmRlclNoYWRlcikgPT4gdm9pZDtcclxuICAgIGV4cG9ydCBjbGFzcyBSZW5kZXJJbmplY3RvciB7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgY29hdEluamVjdGlvbnM6IHsgW2NsYXNzTmFtZTogc3RyaW5nXTogQ29hdEluamVjdGlvbiB9ID0ge1xyXG4gICAgICAgICAgICBcIkNvYXRDb2xvcmVkXCI6IFJlbmRlckluamVjdG9yLmluamVjdFJlbmRlckRhdGFGb3JDb2F0Q29sb3JlZCxcclxuICAgICAgICAgICAgXCJDb2F0VGV4dHVyZWRcIjogUmVuZGVySW5qZWN0b3IuaW5qZWN0UmVuZGVyRGF0YUZvckNvYXRUZXh0dXJlZCxcclxuICAgICAgICAgICAgXCJDb2F0TWF0Q2FwXCI6IFJlbmRlckluamVjdG9yLmluamVjdFJlbmRlckRhdGFGb3JDb2F0TWF0Q2FwXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBkZWNvcmF0ZUNvYXQoX2NvbnN0cnVjdG9yOiBGdW5jdGlvbik6IHZvaWQge1xyXG4gICAgICAgICAgICBsZXQgY29hdEluamVjdGlvbjogQ29hdEluamVjdGlvbiA9IFJlbmRlckluamVjdG9yLmNvYXRJbmplY3Rpb25zW19jb25zdHJ1Y3Rvci5uYW1lXTtcclxuICAgICAgICAgICAgaWYgKCFjb2F0SW5qZWN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICBEZWJ1Zy5lcnJvcihcIk5vIGluamVjdGlvbiBkZWNvcmF0b3IgZGVmaW5lZCBmb3IgXCIgKyBfY29uc3RydWN0b3IubmFtZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KF9jb25zdHJ1Y3Rvci5wcm90b3R5cGUsIFwidXNlUmVuZGVyRGF0YVwiLCB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogY29hdEluamVjdGlvblxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGluamVjdFJlbmRlckRhdGFGb3JDb2F0Q29sb3JlZCh0aGlzOiBDb2F0LCBfcmVuZGVyU2hhZGVyOiBSZW5kZXJTaGFkZXIpOiB2b2lkIHtcclxuICAgICAgICAgICAgbGV0IGNvbG9yVW5pZm9ybUxvY2F0aW9uOiBXZWJHTFVuaWZvcm1Mb2NhdGlvbiA9IF9yZW5kZXJTaGFkZXIudW5pZm9ybXNbXCJ1X2NvbG9yXCJdO1xyXG4gICAgICAgICAgICAvLyBsZXQgeyByLCBnLCBiLCBhIH0gPSAoPENvYXRDb2xvcmVkPnRoaXMpLmNvbG9yO1xyXG4gICAgICAgICAgICAvLyBsZXQgY29sb3I6IEZsb2F0MzJBcnJheSA9IG5ldyBGbG9hdDMyQXJyYXkoW3IsIGcsIGIsIGFdKTtcclxuICAgICAgICAgICAgbGV0IGNvbG9yOiBGbG9hdDMyQXJyYXkgPSAoPENvYXRDb2xvcmVkPnRoaXMpLmNvbG9yLmdldEFycmF5KCk7XHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmdldFJlbmRlcmluZ0NvbnRleHQoKS51bmlmb3JtNGZ2KGNvbG9yVW5pZm9ybUxvY2F0aW9uLCBjb2xvcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBpbmplY3RSZW5kZXJEYXRhRm9yQ29hdFRleHR1cmVkKHRoaXM6IENvYXQsIF9yZW5kZXJTaGFkZXI6IFJlbmRlclNoYWRlcik6IHZvaWQge1xyXG4gICAgICAgICAgICBsZXQgY3JjMzogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCA9IFJlbmRlck9wZXJhdG9yLmdldFJlbmRlcmluZ0NvbnRleHQoKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMucmVuZGVyRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgLy8gYnVmZmVycyBleGlzdFxyXG4gICAgICAgICAgICAgICAgY3JjMy5hY3RpdmVUZXh0dXJlKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVEVYVFVSRTApO1xyXG4gICAgICAgICAgICAgICAgY3JjMy5iaW5kVGV4dHVyZShXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlRFWFRVUkVfMkQsIHRoaXMucmVuZGVyRGF0YVtcInRleHR1cmUwXCJdKTtcclxuICAgICAgICAgICAgICAgIGNyYzMudW5pZm9ybTFpKF9yZW5kZXJTaGFkZXIudW5pZm9ybXNbXCJ1X3RleHR1cmVcIl0sIDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJEYXRhID0ge307XHJcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBjaGVjayBpZiBhbGwgV2ViR0wtQ3JlYXRpb25zIGFyZSBhc3NlcnRlZFxyXG4gICAgICAgICAgICAgICAgY29uc3QgdGV4dHVyZTogV2ViR0xUZXh0dXJlID0gUmVuZGVyTWFuYWdlci5hc3NlcnQ8V2ViR0xUZXh0dXJlPihjcmMzLmNyZWF0ZVRleHR1cmUoKSk7XHJcbiAgICAgICAgICAgICAgICBjcmMzLmJpbmRUZXh0dXJlKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVEVYVFVSRV8yRCwgdGV4dHVyZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBjcmMzLnRleEltYWdlMkQoY3JjMy5URVhUVVJFXzJELCAwLCBjcmMzLlJHQkEsIGNyYzMuUkdCQSwgY3JjMy5VTlNJR05FRF9CWVRFLCAoPENvYXRUZXh0dXJlZD50aGlzKS50ZXh0dXJlLmltYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICBjcmMzLnRleEltYWdlMkQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVEVYVFVSRV8yRCwgMCwgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5SR0JBLCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlJHQkEsIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVU5TSUdORURfQllURSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgKDxDb2F0VGV4dHVyZWQ+dGhpcykudGV4dHVyZS5pbWFnZVxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChfZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIERlYnVnLmVycm9yKF9lKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNyYzMudGV4UGFyYW1ldGVyaShXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlRFWFRVUkVfMkQsIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVEVYVFVSRV9NQUdfRklMVEVSLCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0Lk5FQVJFU1QpO1xyXG4gICAgICAgICAgICAgICAgY3JjMy50ZXhQYXJhbWV0ZXJpKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVEVYVFVSRV8yRCwgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5URVhUVVJFX01JTl9GSUxURVIsIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuTkVBUkVTVCk7XHJcbiAgICAgICAgICAgICAgICBjcmMzLmdlbmVyYXRlTWlwbWFwKGNyYzMuVEVYVFVSRV8yRCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlckRhdGFbXCJ0ZXh0dXJlMFwiXSA9IHRleHR1cmU7XHJcblxyXG4gICAgICAgICAgICAgICAgY3JjMy5iaW5kVGV4dHVyZShXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlRFWFRVUkVfMkQsIG51bGwpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy51c2VSZW5kZXJEYXRhKF9yZW5kZXJTaGFkZXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBpbmplY3RSZW5kZXJEYXRhRm9yQ29hdE1hdENhcCh0aGlzOiBDb2F0LCBfcmVuZGVyU2hhZGVyOiBSZW5kZXJTaGFkZXIpOiB2b2lkIHtcclxuICAgICAgICAgICAgbGV0IGNyYzM6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQgPSBSZW5kZXJPcGVyYXRvci5nZXRSZW5kZXJpbmdDb250ZXh0KCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgY29sb3JVbmlmb3JtTG9jYXRpb246IFdlYkdMVW5pZm9ybUxvY2F0aW9uID0gX3JlbmRlclNoYWRlci51bmlmb3Jtc1tcInVfdGludF9jb2xvclwiXTtcclxuICAgICAgICAgICAgbGV0IHsgciwgZywgYiwgYSB9ID0gKDxDb2F0TWF0Q2FwPnRoaXMpLnRpbnRDb2xvcjtcclxuICAgICAgICAgICAgbGV0IHRpbnRDb2xvckFycmF5OiBGbG9hdDMyQXJyYXkgPSBuZXcgRmxvYXQzMkFycmF5KFtyLCBnLCBiLCBhXSk7XHJcbiAgICAgICAgICAgIGNyYzMudW5pZm9ybTRmdihjb2xvclVuaWZvcm1Mb2NhdGlvbiwgdGludENvbG9yQXJyYXkpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGZsb2F0VW5pZm9ybUxvY2F0aW9uOiBXZWJHTFVuaWZvcm1Mb2NhdGlvbiA9IF9yZW5kZXJTaGFkZXIudW5pZm9ybXNbXCJ1X2ZsYXRtaXhcIl07XHJcbiAgICAgICAgICAgIGxldCBmbGF0TWl4OiBudW1iZXIgPSAoPENvYXRNYXRDYXA+dGhpcykuZmxhdE1peDtcclxuICAgICAgICAgICAgY3JjMy51bmlmb3JtMWYoZmxvYXRVbmlmb3JtTG9jYXRpb24sIGZsYXRNaXgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMucmVuZGVyRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgLy8gYnVmZmVycyBleGlzdFxyXG4gICAgICAgICAgICAgICAgY3JjMy5hY3RpdmVUZXh0dXJlKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVEVYVFVSRTApO1xyXG4gICAgICAgICAgICAgICAgY3JjMy5iaW5kVGV4dHVyZShXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlRFWFRVUkVfMkQsIHRoaXMucmVuZGVyRGF0YVtcInRleHR1cmUwXCJdKTtcclxuICAgICAgICAgICAgICAgIGNyYzMudW5pZm9ybTFpKF9yZW5kZXJTaGFkZXIudW5pZm9ybXNbXCJ1X3RleHR1cmVcIl0sIDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJEYXRhID0ge307XHJcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBjaGVjayBpZiBhbGwgV2ViR0wtQ3JlYXRpb25zIGFyZSBhc3NlcnRlZFxyXG4gICAgICAgICAgICAgICAgY29uc3QgdGV4dHVyZTogV2ViR0xUZXh0dXJlID0gUmVuZGVyTWFuYWdlci5hc3NlcnQ8V2ViR0xUZXh0dXJlPihjcmMzLmNyZWF0ZVRleHR1cmUoKSk7XHJcbiAgICAgICAgICAgICAgICBjcmMzLmJpbmRUZXh0dXJlKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVEVYVFVSRV8yRCwgdGV4dHVyZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBjcmMzLnRleEltYWdlMkQoY3JjMy5URVhUVVJFXzJELCAwLCBjcmMzLlJHQkEsIGNyYzMuUkdCQSwgY3JjMy5VTlNJR05FRF9CWVRFLCAoPENvYXRNYXRDYXA+dGhpcykudGV4dHVyZS5pbWFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY3JjMy50ZXhJbWFnZTJEKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlRFWFRVUkVfMkQsIDAsIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuUkdCQSwgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5SR0JBLCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlVOU0lHTkVEX0JZVEUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICg8Q29hdE1hdENhcD50aGlzKS50ZXh0dXJlLmltYWdlXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKF9lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgRGVidWcuZXJyb3IoX2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY3JjMy50ZXhQYXJhbWV0ZXJpKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVEVYVFVSRV8yRCwgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5URVhUVVJFX01BR19GSUxURVIsIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuTkVBUkVTVCk7XHJcbiAgICAgICAgICAgICAgICBjcmMzLnRleFBhcmFtZXRlcmkoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5URVhUVVJFXzJELCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlRFWFRVUkVfTUlOX0ZJTFRFUiwgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5ORUFSRVNUKTtcclxuICAgICAgICAgICAgICAgIGNyYzMuZ2VuZXJhdGVNaXBtYXAoY3JjMy5URVhUVVJFXzJEKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyRGF0YVtcInRleHR1cmUwXCJdID0gdGV4dHVyZTtcclxuXHJcbiAgICAgICAgICAgICAgICBjcmMzLmJpbmRUZXh0dXJlKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVEVYVFVSRV8yRCwgbnVsbCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVzZVJlbmRlckRhdGEoX3JlbmRlclNoYWRlcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgQnVmZmVyU3BlY2lmaWNhdGlvbiB7XHJcbiAgICAgICAgc2l6ZTogbnVtYmVyOyAgIC8vIFRoZSBzaXplIG9mIHRoZSBkYXRhc2FtcGxlLlxyXG4gICAgICAgIGRhdGFUeXBlOiBudW1iZXI7IC8vIFRoZSBkYXRhdHlwZSBvZiB0aGUgc2FtcGxlIChlLmcuIGdsLkZMT0FULCBnbC5CWVRFLCBldGMuKVxyXG4gICAgICAgIG5vcm1hbGl6ZTogYm9vbGVhbjsgLy8gRmxhZyB0byBub3JtYWxpemUgdGhlIGRhdGEuXHJcbiAgICAgICAgc3RyaWRlOiBudW1iZXI7IC8vIE51bWJlciBvZiBpbmRpY2VzIHRoYXQgd2lsbCBiZSBza2lwcGVkIGVhY2ggaXRlcmF0aW9uLlxyXG4gICAgICAgIG9mZnNldDogbnVtYmVyOyAvLyBJbmRleCBvZiB0aGUgZWxlbWVudCB0byBiZWdpbiB3aXRoLlxyXG4gICAgfVxyXG4gICAgZXhwb3J0IGludGVyZmFjZSBSZW5kZXJTaGFkZXIge1xyXG4gICAgICAgIC8vIFRPRE86IGV4YW1pbmUsIGlmIHRoaXMgc2hvdWxkIGJlIGluamVjdGVkIGluIHNoYWRlciBjbGFzcyB2aWEgUmVuZGVySW5qZWN0b3IsIGFzIGRvbmUgd2l0aCBDb2F0XHJcbiAgICAgICAgcHJvZ3JhbTogV2ViR0xQcm9ncmFtO1xyXG4gICAgICAgIGF0dHJpYnV0ZXM6IHsgW25hbWU6IHN0cmluZ106IG51bWJlciB9O1xyXG4gICAgICAgIHVuaWZvcm1zOiB7IFtuYW1lOiBzdHJpbmddOiBXZWJHTFVuaWZvcm1Mb2NhdGlvbiB9O1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgUmVuZGVyQnVmZmVycyB7XHJcbiAgICAgICAgLy8gVE9ETzogZXhhbWluZSwgaWYgdGhpcyBzaG91bGQgYmUgaW5qZWN0ZWQgaW4gbWVzaCBjbGFzcyB2aWEgUmVuZGVySW5qZWN0b3IsIGFzIGRvbmUgd2l0aCBDb2F0XHJcbiAgICAgICAgdmVydGljZXM6IFdlYkdMQnVmZmVyO1xyXG4gICAgICAgIGluZGljZXM6IFdlYkdMQnVmZmVyO1xyXG4gICAgICAgIG5JbmRpY2VzOiBudW1iZXI7XHJcbiAgICAgICAgdGV4dHVyZVVWczogV2ViR0xCdWZmZXI7XHJcbiAgICAgICAgbm9ybWFsc0ZhY2U6IFdlYkdMQnVmZmVyO1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgUmVuZGVyQ29hdCB7XHJcbiAgICAgICAgLy9UT0RPOiBleGFtaW5lLCBpZiBpdCBtYWtlcyBzZW5zZSB0byBzdG9yZSBhIHZhbyBmb3IgZWFjaCBDb2F0LCBldmVuIHRob3VnaCBlLmcuIGNvbG9yIHdvbid0IGJlIHN0b3JlZCBhbnl3YXkuLi5cclxuICAgICAgICAvL3ZhbzogV2ViR0xWZXJ0ZXhBcnJheU9iamVjdDtcclxuICAgICAgICBjb2F0OiBDb2F0O1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgUmVuZGVyTGlnaHRzIHtcclxuICAgICAgICBbdHlwZTogc3RyaW5nXTogRmxvYXQzMkFycmF5O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQmFzZSBjbGFzcyBmb3IgUmVuZGVyTWFuYWdlciwgaGFuZGxpbmcgdGhlIGNvbm5lY3Rpb24gdG8gdGhlIHJlbmRlcmluZyBzeXN0ZW0sIGluIHRoaXMgY2FzZSBXZWJHTC5cclxuICAgICAqIE1ldGhvZHMgYW5kIGF0dHJpYnV0ZXMgb2YgdGhpcyBjbGFzcyBzaG91bGQgbm90IGJlIGNhbGxlZCBkaXJlY3RseSwgb25seSB0aHJvdWdoIFtbUmVuZGVyTWFuYWdlcl1dXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBhYnN0cmFjdCBjbGFzcyBSZW5kZXJPcGVyYXRvciB7XHJcbiAgICAgICAgcHJvdGVjdGVkIHN0YXRpYyBjcmMzOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0O1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHJlY3RWaWV3cG9ydDogUmVjdGFuZ2xlO1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHJlbmRlclNoYWRlclJheUNhc3Q6IFJlbmRlclNoYWRlcjtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgKiBDaGVja3MgdGhlIGZpcnN0IHBhcmFtZXRlciBhbmQgdGhyb3dzIGFuIGV4Y2VwdGlvbiB3aXRoIHRoZSBXZWJHTC1lcnJvcmNvZGUgaWYgdGhlIHZhbHVlIGlzIG51bGxcclxuICAgICAgICAqIEBwYXJhbSBfdmFsdWUgLy8gdmFsdWUgdG8gY2hlY2sgYWdhaW5zdCBudWxsXHJcbiAgICAgICAgKiBAcGFyYW0gX21lc3NhZ2UgLy8gb3B0aW9uYWwsIGFkZGl0aW9uYWwgbWVzc2FnZSBmb3IgdGhlIGV4Y2VwdGlvblxyXG4gICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBhc3NlcnQ8VD4oX3ZhbHVlOiBUIHwgbnVsbCwgX21lc3NhZ2U6IHN0cmluZyA9IFwiXCIpOiBUIHtcclxuICAgICAgICAgICAgaWYgKF92YWx1ZSA9PT0gbnVsbClcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQXNzZXJ0aW9uIGZhaWxlZC4gJHtfbWVzc2FnZX0sIFdlYkdMLUVycm9yOiAke1JlbmRlck9wZXJhdG9yLmNyYzMgPyBSZW5kZXJPcGVyYXRvci5jcmMzLmdldEVycm9yKCkgOiBcIlwifWApO1xyXG4gICAgICAgICAgICByZXR1cm4gX3ZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBJbml0aWFsaXplcyBvZmZzY3JlZW4tY2FudmFzLCByZW5kZXJpbmdjb250ZXh0IGFuZCBoYXJkd2FyZSB2aWV3cG9ydC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGluaXRpYWxpemUoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGxldCBjb250ZXh0QXR0cmlidXRlczogV2ViR0xDb250ZXh0QXR0cmlidXRlcyA9IHsgYWxwaGE6IGZhbHNlLCBhbnRpYWxpYXM6IGZhbHNlIH07XHJcbiAgICAgICAgICAgIGxldCBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMyA9IFJlbmRlck9wZXJhdG9yLmFzc2VydDxXZWJHTDJSZW5kZXJpbmdDb250ZXh0PihcclxuICAgICAgICAgICAgICAgIGNhbnZhcy5nZXRDb250ZXh0KFwid2ViZ2wyXCIsIGNvbnRleHRBdHRyaWJ1dGVzKSxcclxuICAgICAgICAgICAgICAgIFwiV2ViR0wtY29udGV4dCBjb3VsZG4ndCBiZSBjcmVhdGVkXCJcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgLy8gRW5hYmxlIGJhY2tmYWNlLSBhbmQgekJ1ZmZlci1jdWxsaW5nLlxyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmVuYWJsZShXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkNVTExfRkFDRSk7XHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMuZW5hYmxlKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuREVQVEhfVEVTVCk7XHJcbiAgICAgICAgICAgIC8vIFJlbmRlck9wZXJhdG9yLmNyYzMucGl4ZWxTdG9yZWkoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5VTlBBQ0tfRkxJUF9ZX1dFQkdMLCB0cnVlKTtcclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IucmVjdFZpZXdwb3J0ID0gUmVuZGVyT3BlcmF0b3IuZ2V0Q2FudmFzUmVjdCgpO1xyXG5cclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IucmVuZGVyU2hhZGVyUmF5Q2FzdCA9IFJlbmRlck9wZXJhdG9yLmNyZWF0ZVByb2dyYW0oU2hhZGVyUmF5Q2FzdCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm4gYSByZWZlcmVuY2UgdG8gdGhlIG9mZnNjcmVlbi1jYW52YXNcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGdldENhbnZhcygpOiBIVE1MQ2FudmFzRWxlbWVudCB7XHJcbiAgICAgICAgICAgIHJldHVybiA8SFRNTENhbnZhc0VsZW1lbnQ+UmVuZGVyT3BlcmF0b3IuY3JjMy5jYW52YXM7IC8vIFRPRE86IGVuYWJsZSBPZmZzY3JlZW5DYW52YXNcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJuIGEgcmVmZXJlbmNlIHRvIHRoZSByZW5kZXJpbmcgY29udGV4dFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0UmVuZGVyaW5nQ29udGV4dCgpOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0IHtcclxuICAgICAgICAgICAgcmV0dXJuIFJlbmRlck9wZXJhdG9yLmNyYzM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybiBhIHJlY3RhbmdsZSBkZXNjcmliaW5nIHRoZSBzaXplIG9mIHRoZSBvZmZzY3JlZW4tY2FudmFzLiB4LHkgYXJlIDAgYXQgYWxsIHRpbWVzLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0Q2FudmFzUmVjdCgpOiBSZWN0YW5nbGUge1xyXG4gICAgICAgICAgICBsZXQgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCA9IDxIVE1MQ2FudmFzRWxlbWVudD5SZW5kZXJPcGVyYXRvci5jcmMzLmNhbnZhcztcclxuICAgICAgICAgICAgcmV0dXJuIFJlY3RhbmdsZS5HRVQoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2V0IHRoZSBzaXplIG9mIHRoZSBvZmZzY3JlZW4tY2FudmFzLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgc2V0Q2FudmFzU2l6ZShfd2lkdGg6IG51bWJlciwgX2hlaWdodDogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMuY2FudmFzLndpZHRoID0gX3dpZHRoO1xyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmNhbnZhcy5oZWlnaHQgPSBfaGVpZ2h0O1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTZXQgdGhlIGFyZWEgb24gdGhlIG9mZnNjcmVlbi1jYW52YXMgdG8gcmVuZGVyIHRoZSBjYW1lcmEgaW1hZ2UgdG8uXHJcbiAgICAgICAgICogQHBhcmFtIF9yZWN0XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBzZXRWaWV3cG9ydFJlY3RhbmdsZShfcmVjdDogUmVjdGFuZ2xlKTogdm9pZCB7XHJcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oUmVuZGVyT3BlcmF0b3IucmVjdFZpZXdwb3J0LCBfcmVjdCk7XHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMudmlld3BvcnQoX3JlY3QueCwgX3JlY3QueSwgX3JlY3Qud2lkdGgsIF9yZWN0LmhlaWdodCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHJpZXZlIHRoZSBhcmVhIG9uIHRoZSBvZmZzY3JlZW4tY2FudmFzIHRoZSBjYW1lcmEgaW1hZ2UgZ2V0cyByZW5kZXJlZCB0by5cclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGdldFZpZXdwb3J0UmVjdGFuZ2xlKCk6IFJlY3RhbmdsZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBSZW5kZXJPcGVyYXRvci5yZWN0Vmlld3BvcnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDb252ZXJ0IGxpZ2h0IGRhdGEgdG8gZmxhdCBhcnJheXNcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcm90ZWN0ZWQgc3RhdGljIGNyZWF0ZVJlbmRlckxpZ2h0cyhfbGlnaHRzOiBNYXBMaWdodFR5cGVUb0xpZ2h0TGlzdCk6IFJlbmRlckxpZ2h0cyB7XHJcbiAgICAgICAgICAgIGxldCByZW5kZXJMaWdodHM6IFJlbmRlckxpZ2h0cyA9IHt9O1xyXG4gICAgICAgICAgICBmb3IgKGxldCBlbnRyeSBvZiBfbGlnaHRzKSB7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGVudHJ5WzBdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBMaWdodEFtYmllbnQubmFtZTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGFtYmllbnQ6IG51bWJlcltdID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGxpZ2h0IG9mIGVudHJ5WzFdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgYzogQ29sb3IgPSBsaWdodC5nZXRMaWdodCgpLmNvbG9yO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW1iaWVudC5wdXNoKGMuciwgYy5nLCBjLmIsIGMuYSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyTGlnaHRzW1widV9hbWJpZW50XCJdID0gbmV3IEZsb2F0MzJBcnJheShhbWJpZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBMaWdodERpcmVjdGlvbmFsLm5hbWU6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkaXJlY3Rpb25hbDogbnVtYmVyW10gPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgbGlnaHQgb2YgZW50cnlbMV0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjOiBDb2xvciA9IGxpZ2h0LmdldExpZ2h0KCkuY29sb3I7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZDogVmVjdG9yMyA9ICg8TGlnaHREaXJlY3Rpb25hbD5saWdodC5nZXRMaWdodCgpKS5kaXJlY3Rpb247XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3Rpb25hbC5wdXNoKGMuciwgYy5nLCBjLmIsIGMuYSwgZC54LCBkLnksIGQueik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyTGlnaHRzW1widV9kaXJlY3Rpb25hbFwiXSA9IG5ldyBGbG9hdDMyQXJyYXkoZGlyZWN0aW9uYWwpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBEZWJ1Zy53YXJuKFwiU2hhZGVyc3RydWN0dXJlIHVuZGVmaW5lZCBmb3JcIiwgZW50cnlbMF0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZW5kZXJMaWdodHM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTZXQgbGlnaHQgZGF0YSBpbiBzaGFkZXJzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJvdGVjdGVkIHN0YXRpYyBzZXRMaWdodHNJblNoYWRlcihfcmVuZGVyU2hhZGVyOiBSZW5kZXJTaGFkZXIsIF9saWdodHM6IE1hcExpZ2h0VHlwZVRvTGlnaHRMaXN0KTogdm9pZCB7XHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLnVzZVByb2dyYW0oX3JlbmRlclNoYWRlcik7XHJcbiAgICAgICAgICAgIGxldCB1bmk6IHsgW25hbWU6IHN0cmluZ106IFdlYkdMVW5pZm9ybUxvY2F0aW9uIH0gPSBfcmVuZGVyU2hhZGVyLnVuaWZvcm1zO1xyXG5cclxuICAgICAgICAgICAgbGV0IGFtYmllbnQ6IFdlYkdMVW5pZm9ybUxvY2F0aW9uID0gdW5pW1widV9hbWJpZW50LmNvbG9yXCJdO1xyXG4gICAgICAgICAgICBpZiAoYW1iaWVudCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNtcExpZ2h0czogQ29tcG9uZW50TGlnaHRbXSA9IF9saWdodHMuZ2V0KFwiTGlnaHRBbWJpZW50XCIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNtcExpZ2h0cykge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IGFkZCB1cCBhbWJpZW50IGxpZ2h0cyB0byBhIHNpbmdsZSBjb2xvclxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGxldCByZXN1bHQ6IENvbG9yID0gbmV3IENvbG9yKDAsIDAsIDAsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGNtcExpZ2h0IG9mIGNtcExpZ2h0cylcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZm9yIG5vdywgb25seSB0aGUgbGFzdCBpcyByZWxldmFudFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLnVuaWZvcm00ZnYoYW1iaWVudCwgY21wTGlnaHQuZ2V0TGlnaHQoKS5jb2xvci5nZXRBcnJheSgpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IG5EaXJlY3Rpb25hbDogV2ViR0xVbmlmb3JtTG9jYXRpb24gPSB1bmlbXCJ1X25MaWdodHNEaXJlY3Rpb25hbFwiXTtcclxuICAgICAgICAgICAgaWYgKG5EaXJlY3Rpb25hbCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNtcExpZ2h0czogQ29tcG9uZW50TGlnaHRbXSA9IF9saWdodHMuZ2V0KFwiTGlnaHREaXJlY3Rpb25hbFwiKTtcclxuICAgICAgICAgICAgICAgIGlmIChjbXBMaWdodHMpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbjogbnVtYmVyID0gY21wTGlnaHRzLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLnVuaWZvcm0xdWkobkRpcmVjdGlvbmFsLCBuKTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgbjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBsaWdodDogTGlnaHREaXJlY3Rpb25hbCA9IDxMaWdodERpcmVjdGlvbmFsPmNtcExpZ2h0c1tpXS5nZXRMaWdodCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLnVuaWZvcm00ZnYodW5pW2B1X2RpcmVjdGlvbmFsWyR7aX1dLmNvbG9yYF0sIGxpZ2h0LmNvbG9yLmdldEFycmF5KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZGlyZWN0aW9uOiBWZWN0b3IzID0gbGlnaHQuZGlyZWN0aW9uLmNvcHk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbi50cmFuc2Zvcm0oY21wTGlnaHRzW2ldLmdldENvbnRhaW5lcigpLm10eFdvcmxkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy51bmlmb3JtM2Z2KHVuaVtgdV9kaXJlY3Rpb25hbFske2l9XS5kaXJlY3Rpb25gXSwgZGlyZWN0aW9uLmdldCgpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gZGVidWdnZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEcmF3IGEgbWVzaCBidWZmZXIgdXNpbmcgdGhlIGdpdmVuIGluZm9zIGFuZCB0aGUgY29tcGxldGUgcHJvamVjdGlvbiBtYXRyaXhcclxuICAgICAgICAgKiBAcGFyYW0gX3JlbmRlclNoYWRlciBcclxuICAgICAgICAgKiBAcGFyYW0gX3JlbmRlckJ1ZmZlcnMgXHJcbiAgICAgICAgICogQHBhcmFtIF9yZW5kZXJDb2F0IFxyXG4gICAgICAgICAqIEBwYXJhbSBfd29ybGQgXHJcbiAgICAgICAgICogQHBhcmFtIF9wcm9qZWN0aW9uIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByb3RlY3RlZCBzdGF0aWMgZHJhdyhfcmVuZGVyU2hhZGVyOiBSZW5kZXJTaGFkZXIsIF9yZW5kZXJCdWZmZXJzOiBSZW5kZXJCdWZmZXJzLCBfcmVuZGVyQ29hdDogUmVuZGVyQ29hdCwgX3dvcmxkOiBNYXRyaXg0eDQsIF9wcm9qZWN0aW9uOiBNYXRyaXg0eDQpOiB2b2lkIHtcclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IudXNlUHJvZ3JhbShfcmVuZGVyU2hhZGVyKTtcclxuICAgICAgICAgICAgLy8gUmVuZGVyT3BlcmF0b3IudXNlQnVmZmVycyhfcmVuZGVyQnVmZmVycyk7XHJcbiAgICAgICAgICAgIC8vIFJlbmRlck9wZXJhdG9yLnVzZVBhcmFtZXRlcihfcmVuZGVyQ29hdCk7XHJcblxyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmJpbmRCdWZmZXIoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5BUlJBWV9CVUZGRVIsIF9yZW5kZXJCdWZmZXJzLnZlcnRpY2VzKTtcclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShfcmVuZGVyU2hhZGVyLmF0dHJpYnV0ZXNbXCJhX3Bvc2l0aW9uXCJdKTtcclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3Iuc2V0QXR0cmlidXRlU3RydWN0dXJlKF9yZW5kZXJTaGFkZXIuYXR0cmlidXRlc1tcImFfcG9zaXRpb25cIl0sIE1lc2guZ2V0QnVmZmVyU3BlY2lmaWNhdGlvbigpKTtcclxuXHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMuYmluZEJ1ZmZlcihXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBfcmVuZGVyQnVmZmVycy5pbmRpY2VzKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChfcmVuZGVyU2hhZGVyLmF0dHJpYnV0ZXNbXCJhX3RleHR1cmVVVnNcIl0pIHtcclxuICAgICAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMuYmluZEJ1ZmZlcihXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkFSUkFZX0JVRkZFUiwgX3JlbmRlckJ1ZmZlcnMudGV4dHVyZVVWcyk7XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KF9yZW5kZXJTaGFkZXIuYXR0cmlidXRlc1tcImFfdGV4dHVyZVVWc1wiXSk7IC8vIGVuYWJsZSB0aGUgYnVmZmVyXHJcbiAgICAgICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLnZlcnRleEF0dHJpYlBvaW50ZXIoX3JlbmRlclNoYWRlci5hdHRyaWJ1dGVzW1wiYV90ZXh0dXJlVVZzXCJdLCAyLCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkZMT0FULCBmYWxzZSwgMCwgMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gU3VwcGx5IG1hdHJpeGRhdGEgdG8gc2hhZGVyLiBcclxuICAgICAgICAgICAgbGV0IHVQcm9qZWN0aW9uOiBXZWJHTFVuaWZvcm1Mb2NhdGlvbiA9IF9yZW5kZXJTaGFkZXIudW5pZm9ybXNbXCJ1X3Byb2plY3Rpb25cIl07XHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMudW5pZm9ybU1hdHJpeDRmdih1UHJvamVjdGlvbiwgZmFsc2UsIF9wcm9qZWN0aW9uLmdldCgpKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChfcmVuZGVyU2hhZGVyLnVuaWZvcm1zW1widV93b3JsZFwiXSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHVXb3JsZDogV2ViR0xVbmlmb3JtTG9jYXRpb24gPSBfcmVuZGVyU2hhZGVyLnVuaWZvcm1zW1widV93b3JsZFwiXTtcclxuICAgICAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMudW5pZm9ybU1hdHJpeDRmdih1V29ybGQsIGZhbHNlLCBfd29ybGQuZ2V0KCkpO1xyXG5cclxuICAgICAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMuYmluZEJ1ZmZlcihXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkFSUkFZX0JVRkZFUiwgX3JlbmRlckJ1ZmZlcnMubm9ybWFsc0ZhY2UpO1xyXG4gICAgICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShfcmVuZGVyU2hhZGVyLmF0dHJpYnV0ZXNbXCJhX25vcm1hbFwiXSk7XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5zZXRBdHRyaWJ1dGVTdHJ1Y3R1cmUoX3JlbmRlclNoYWRlci5hdHRyaWJ1dGVzW1wiYV9ub3JtYWxcIl0sIE1lc2guZ2V0QnVmZmVyU3BlY2lmaWNhdGlvbigpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBUT0RPOiB0aGlzIGlzIGFsbCB0aGF0J3MgbGVmdCBvZiBjb2F0IGhhbmRsaW5nIGluIFJlbmRlck9wZXJhdG9yLCBkdWUgdG8gaW5qZWN0aW9uLiBTbyBleHRyYSByZWZlcmVuY2UgZnJvbSBub2RlIHRvIGNvYXQgaXMgdW5uZWNlc3NhcnlcclxuICAgICAgICAgICAgX3JlbmRlckNvYXQuY29hdC51c2VSZW5kZXJEYXRhKF9yZW5kZXJTaGFkZXIpO1xyXG5cclxuICAgICAgICAgICAgLy8gRHJhdyBjYWxsXHJcbiAgICAgICAgICAgIC8vIFJlbmRlck9wZXJhdG9yLmNyYzMuZHJhd0VsZW1lbnRzKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVFJJQU5HTEVTLCBNZXNoLmdldEJ1ZmZlclNwZWNpZmljYXRpb24oKS5vZmZzZXQsIF9yZW5kZXJCdWZmZXJzLm5JbmRpY2VzKTtcclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy5kcmF3RWxlbWVudHMoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5UUklBTkdMRVMsIF9yZW5kZXJCdWZmZXJzLm5JbmRpY2VzLCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlVOU0lHTkVEX1NIT1JULCAwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERyYXcgYSBidWZmZXIgd2l0aCBhIHNwZWNpYWwgc2hhZGVyIHRoYXQgdXNlcyBhbiBpZCBpbnN0ZWFkIG9mIGEgY29sb3JcclxuICAgICAgICAgKiBAcGFyYW0gX3JlbmRlclNoYWRlclxyXG4gICAgICAgICAqIEBwYXJhbSBfcmVuZGVyQnVmZmVycyBcclxuICAgICAgICAgKiBAcGFyYW0gX3dvcmxkIFxyXG4gICAgICAgICAqIEBwYXJhbSBfcHJvamVjdGlvbiBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcm90ZWN0ZWQgc3RhdGljIGRyYXdGb3JSYXlDYXN0KF9pZDogbnVtYmVyLCBfcmVuZGVyQnVmZmVyczogUmVuZGVyQnVmZmVycywgX3dvcmxkOiBNYXRyaXg0eDQsIF9wcm9qZWN0aW9uOiBNYXRyaXg0eDQpOiB2b2lkIHtcclxuICAgICAgICAgICAgbGV0IHJlbmRlclNoYWRlcjogUmVuZGVyU2hhZGVyID0gUmVuZGVyT3BlcmF0b3IucmVuZGVyU2hhZGVyUmF5Q2FzdDsgXHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLnVzZVByb2dyYW0ocmVuZGVyU2hhZGVyKTtcclxuXHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMuYmluZEJ1ZmZlcihXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkFSUkFZX0JVRkZFUiwgX3JlbmRlckJ1ZmZlcnMudmVydGljZXMpO1xyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHJlbmRlclNoYWRlci5hdHRyaWJ1dGVzW1wiYV9wb3NpdGlvblwiXSk7XHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLnNldEF0dHJpYnV0ZVN0cnVjdHVyZShyZW5kZXJTaGFkZXIuYXR0cmlidXRlc1tcImFfcG9zaXRpb25cIl0sIE1lc2guZ2V0QnVmZmVyU3BlY2lmaWNhdGlvbigpKTtcclxuXHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMuYmluZEJ1ZmZlcihXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBfcmVuZGVyQnVmZmVycy5pbmRpY2VzKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFN1cHBseSBtYXRyaXhkYXRhIHRvIHNoYWRlci4gXHJcbiAgICAgICAgICAgIGxldCB1UHJvamVjdGlvbjogV2ViR0xVbmlmb3JtTG9jYXRpb24gPSByZW5kZXJTaGFkZXIudW5pZm9ybXNbXCJ1X3Byb2plY3Rpb25cIl07XHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMudW5pZm9ybU1hdHJpeDRmdih1UHJvamVjdGlvbiwgZmFsc2UsIF9wcm9qZWN0aW9uLmdldCgpKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChyZW5kZXJTaGFkZXIudW5pZm9ybXNbXCJ1X3dvcmxkXCJdKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdVdvcmxkOiBXZWJHTFVuaWZvcm1Mb2NhdGlvbiA9IHJlbmRlclNoYWRlci51bmlmb3Jtc1tcInVfd29ybGRcIl07XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLnVuaWZvcm1NYXRyaXg0ZnYodVdvcmxkLCBmYWxzZSwgX3dvcmxkLmdldCgpKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGlkVW5pZm9ybUxvY2F0aW9uOiBXZWJHTFVuaWZvcm1Mb2NhdGlvbiA9IHJlbmRlclNoYWRlci51bmlmb3Jtc1tcInVfaWRcIl07XHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmdldFJlbmRlcmluZ0NvbnRleHQoKS51bmlmb3JtMWkoaWRVbmlmb3JtTG9jYXRpb24sIF9pZCk7XHJcblxyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmRyYXdFbGVtZW50cyhXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlRSSUFOR0xFUywgX3JlbmRlckJ1ZmZlcnMubkluZGljZXMsIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVU5TSUdORURfU0hPUlQsIDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gI3JlZ2lvbiBTaGFkZXJwcm9ncmFtIFxyXG4gICAgICAgIHByb3RlY3RlZCBzdGF0aWMgY3JlYXRlUHJvZ3JhbShfc2hhZGVyQ2xhc3M6IHR5cGVvZiBTaGFkZXIpOiBSZW5kZXJTaGFkZXIge1xyXG4gICAgICAgICAgICBsZXQgY3JjMzogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCA9IFJlbmRlck9wZXJhdG9yLmNyYzM7XHJcbiAgICAgICAgICAgIGxldCBwcm9ncmFtOiBXZWJHTFByb2dyYW0gPSBjcmMzLmNyZWF0ZVByb2dyYW0oKTtcclxuICAgICAgICAgICAgbGV0IHJlbmRlclNoYWRlcjogUmVuZGVyU2hhZGVyO1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgY3JjMy5hdHRhY2hTaGFkZXIocHJvZ3JhbSwgUmVuZGVyT3BlcmF0b3IuYXNzZXJ0PFdlYkdMU2hhZGVyPihjb21waWxlU2hhZGVyKF9zaGFkZXJDbGFzcy5nZXRWZXJ0ZXhTaGFkZXJTb3VyY2UoKSwgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5WRVJURVhfU0hBREVSKSkpO1xyXG4gICAgICAgICAgICAgICAgY3JjMy5hdHRhY2hTaGFkZXIocHJvZ3JhbSwgUmVuZGVyT3BlcmF0b3IuYXNzZXJ0PFdlYkdMU2hhZGVyPihjb21waWxlU2hhZGVyKF9zaGFkZXJDbGFzcy5nZXRGcmFnbWVudFNoYWRlclNvdXJjZSgpLCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkZSQUdNRU5UX1NIQURFUikpKTtcclxuICAgICAgICAgICAgICAgIGNyYzMubGlua1Byb2dyYW0ocHJvZ3JhbSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgZXJyb3I6IHN0cmluZyA9IFJlbmRlck9wZXJhdG9yLmFzc2VydDxzdHJpbmc+KGNyYzMuZ2V0UHJvZ3JhbUluZm9Mb2cocHJvZ3JhbSkpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGVycm9yICE9PSBcIlwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRXJyb3IgbGlua2luZyBTaGFkZXI6IFwiICsgZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmVuZGVyU2hhZGVyID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHByb2dyYW06IHByb2dyYW0sXHJcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlczogZGV0ZWN0QXR0cmlidXRlcygpLFxyXG4gICAgICAgICAgICAgICAgICAgIHVuaWZvcm1zOiBkZXRlY3RVbmlmb3JtcygpXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9IGNhdGNoIChfZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIERlYnVnLmVycm9yKF9lcnJvcik7XHJcbiAgICAgICAgICAgICAgICBkZWJ1Z2dlcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVuZGVyU2hhZGVyO1xyXG5cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGNvbXBpbGVTaGFkZXIoX3NoYWRlckNvZGU6IHN0cmluZywgX3NoYWRlclR5cGU6IEdMZW51bSk6IFdlYkdMU2hhZGVyIHwgbnVsbCB7XHJcbiAgICAgICAgICAgICAgICBsZXQgd2ViR0xTaGFkZXI6IFdlYkdMU2hhZGVyID0gY3JjMy5jcmVhdGVTaGFkZXIoX3NoYWRlclR5cGUpO1xyXG4gICAgICAgICAgICAgICAgY3JjMy5zaGFkZXJTb3VyY2Uod2ViR0xTaGFkZXIsIF9zaGFkZXJDb2RlKTtcclxuICAgICAgICAgICAgICAgIGNyYzMuY29tcGlsZVNoYWRlcih3ZWJHTFNoYWRlcik7XHJcbiAgICAgICAgICAgICAgICBsZXQgZXJyb3I6IHN0cmluZyA9IFJlbmRlck9wZXJhdG9yLmFzc2VydDxzdHJpbmc+KGNyYzMuZ2V0U2hhZGVySW5mb0xvZyh3ZWJHTFNoYWRlcikpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGVycm9yICE9PSBcIlwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRXJyb3IgY29tcGlsaW5nIHNoYWRlcjogXCIgKyBlcnJvcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBDaGVjayBmb3IgYW55IGNvbXBpbGF0aW9uIGVycm9ycy5cclxuICAgICAgICAgICAgICAgIGlmICghY3JjMy5nZXRTaGFkZXJQYXJhbWV0ZXIod2ViR0xTaGFkZXIsIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuQ09NUElMRV9TVEFUVVMpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWxlcnQoY3JjMy5nZXRTaGFkZXJJbmZvTG9nKHdlYkdMU2hhZGVyKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gd2ViR0xTaGFkZXI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZnVuY3Rpb24gZGV0ZWN0QXR0cmlidXRlcygpOiB7IFtuYW1lOiBzdHJpbmddOiBudW1iZXIgfSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGV0ZWN0ZWRBdHRyaWJ1dGVzOiB7IFtuYW1lOiBzdHJpbmddOiBudW1iZXIgfSA9IHt9O1xyXG4gICAgICAgICAgICAgICAgbGV0IGF0dHJpYnV0ZUNvdW50OiBudW1iZXIgPSBjcmMzLmdldFByb2dyYW1QYXJhbWV0ZXIocHJvZ3JhbSwgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5BQ1RJVkVfQVRUUklCVVRFUyk7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgYXR0cmlidXRlQ291bnQ7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBhdHRyaWJ1dGVJbmZvOiBXZWJHTEFjdGl2ZUluZm8gPSBSZW5kZXJPcGVyYXRvci5hc3NlcnQ8V2ViR0xBY3RpdmVJbmZvPihjcmMzLmdldEFjdGl2ZUF0dHJpYihwcm9ncmFtLCBpKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFhdHRyaWJ1dGVJbmZvKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBkZXRlY3RlZEF0dHJpYnV0ZXNbYXR0cmlidXRlSW5mby5uYW1lXSA9IGNyYzMuZ2V0QXR0cmliTG9jYXRpb24ocHJvZ3JhbSwgYXR0cmlidXRlSW5mby5uYW1lKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBkZXRlY3RlZEF0dHJpYnV0ZXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZnVuY3Rpb24gZGV0ZWN0VW5pZm9ybXMoKTogeyBbbmFtZTogc3RyaW5nXTogV2ViR0xVbmlmb3JtTG9jYXRpb24gfSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGV0ZWN0ZWRVbmlmb3JtczogeyBbbmFtZTogc3RyaW5nXTogV2ViR0xVbmlmb3JtTG9jYXRpb24gfSA9IHt9O1xyXG4gICAgICAgICAgICAgICAgbGV0IHVuaWZvcm1Db3VudDogbnVtYmVyID0gY3JjMy5nZXRQcm9ncmFtUGFyYW1ldGVyKHByb2dyYW0sIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuQUNUSVZFX1VOSUZPUk1TKTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB1bmlmb3JtQ291bnQ7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBpbmZvOiBXZWJHTEFjdGl2ZUluZm8gPSBSZW5kZXJPcGVyYXRvci5hc3NlcnQ8V2ViR0xBY3RpdmVJbmZvPihjcmMzLmdldEFjdGl2ZVVuaWZvcm0ocHJvZ3JhbSwgaSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghaW5mbykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZGV0ZWN0ZWRVbmlmb3Jtc1tpbmZvLm5hbWVdID0gUmVuZGVyT3BlcmF0b3IuYXNzZXJ0PFdlYkdMVW5pZm9ybUxvY2F0aW9uPihjcmMzLmdldFVuaWZvcm1Mb2NhdGlvbihwcm9ncmFtLCBpbmZvLm5hbWUpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBkZXRlY3RlZFVuaWZvcm1zO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByb3RlY3RlZCBzdGF0aWMgdXNlUHJvZ3JhbShfc2hhZGVySW5mbzogUmVuZGVyU2hhZGVyKTogdm9pZCB7XHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMudXNlUHJvZ3JhbShfc2hhZGVySW5mby5wcm9ncmFtKTtcclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShfc2hhZGVySW5mby5hdHRyaWJ1dGVzW1wiYV9wb3NpdGlvblwiXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByb3RlY3RlZCBzdGF0aWMgZGVsZXRlUHJvZ3JhbShfcHJvZ3JhbTogUmVuZGVyU2hhZGVyKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGlmIChfcHJvZ3JhbSkge1xyXG4gICAgICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy5kZWxldGVQcm9ncmFtKF9wcm9ncmFtLnByb2dyYW0pO1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIF9wcm9ncmFtLmF0dHJpYnV0ZXM7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgX3Byb2dyYW0udW5pZm9ybXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gI2VuZHJlZ2lvblxyXG5cclxuICAgICAgICAvLyAjcmVnaW9uIE1lc2hidWZmZXJcclxuICAgICAgICBwcm90ZWN0ZWQgc3RhdGljIGNyZWF0ZUJ1ZmZlcnMoX21lc2g6IE1lc2gpOiBSZW5kZXJCdWZmZXJzIHtcclxuICAgICAgICAgICAgbGV0IHZlcnRpY2VzOiBXZWJHTEJ1ZmZlciA9IFJlbmRlck9wZXJhdG9yLmFzc2VydDxXZWJHTEJ1ZmZlcj4oUmVuZGVyT3BlcmF0b3IuY3JjMy5jcmVhdGVCdWZmZXIoKSk7XHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMuYmluZEJ1ZmZlcihXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkFSUkFZX0JVRkZFUiwgdmVydGljZXMpO1xyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmJ1ZmZlckRhdGEoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5BUlJBWV9CVUZGRVIsIF9tZXNoLnZlcnRpY2VzLCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlNUQVRJQ19EUkFXKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBpbmRpY2VzOiBXZWJHTEJ1ZmZlciA9IFJlbmRlck9wZXJhdG9yLmFzc2VydDxXZWJHTEJ1ZmZlcj4oUmVuZGVyT3BlcmF0b3IuY3JjMy5jcmVhdGVCdWZmZXIoKSk7XHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMuYmluZEJ1ZmZlcihXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBpbmRpY2VzKTtcclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy5idWZmZXJEYXRhKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIF9tZXNoLmluZGljZXMsIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuU1RBVElDX0RSQVcpO1xyXG5cclxuICAgICAgICAgICAgbGV0IHRleHR1cmVVVnM6IFdlYkdMQnVmZmVyID0gUmVuZGVyT3BlcmF0b3IuY3JjMy5jcmVhdGVCdWZmZXIoKTtcclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy5iaW5kQnVmZmVyKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuQVJSQVlfQlVGRkVSLCB0ZXh0dXJlVVZzKTtcclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy5idWZmZXJEYXRhKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuQVJSQVlfQlVGRkVSLCBfbWVzaC50ZXh0dXJlVVZzLCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlNUQVRJQ19EUkFXKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBub3JtYWxzRmFjZTogV2ViR0xCdWZmZXIgPSBSZW5kZXJPcGVyYXRvci5hc3NlcnQ8V2ViR0xCdWZmZXI+KFJlbmRlck9wZXJhdG9yLmNyYzMuY3JlYXRlQnVmZmVyKCkpO1xyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmJpbmRCdWZmZXIoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5BUlJBWV9CVUZGRVIsIG5vcm1hbHNGYWNlKTtcclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy5idWZmZXJEYXRhKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuQVJSQVlfQlVGRkVSLCBfbWVzaC5ub3JtYWxzRmFjZSwgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5TVEFUSUNfRFJBVyk7XHJcblxyXG4gICAgICAgICAgICBsZXQgYnVmZmVySW5mbzogUmVuZGVyQnVmZmVycyA9IHtcclxuICAgICAgICAgICAgICAgIHZlcnRpY2VzOiB2ZXJ0aWNlcyxcclxuICAgICAgICAgICAgICAgIGluZGljZXM6IGluZGljZXMsXHJcbiAgICAgICAgICAgICAgICBuSW5kaWNlczogX21lc2guZ2V0SW5kZXhDb3VudCgpLFxyXG4gICAgICAgICAgICAgICAgdGV4dHVyZVVWczogdGV4dHVyZVVWcyxcclxuICAgICAgICAgICAgICAgIG5vcm1hbHNGYWNlOiBub3JtYWxzRmFjZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICByZXR1cm4gYnVmZmVySW5mbztcclxuICAgICAgICB9XHJcbiAgICAgICAgcHJvdGVjdGVkIHN0YXRpYyB1c2VCdWZmZXJzKF9yZW5kZXJCdWZmZXJzOiBSZW5kZXJCdWZmZXJzKTogdm9pZCB7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IGN1cnJlbnRseSB1bnVzZWQsIGRvbmUgc3BlY2lmaWNhbGx5IGluIGRyYXcuIENvdWxkIGJlIHNhdmVkIGluIFZBTyB3aXRoaW4gUmVuZGVyQnVmZmVyc1xyXG4gICAgICAgICAgICAvLyBSZW5kZXJPcGVyYXRvci5jcmMzLmJpbmRCdWZmZXIoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5BUlJBWV9CVUZGRVIsIF9yZW5kZXJCdWZmZXJzLnZlcnRpY2VzKTtcclxuICAgICAgICAgICAgLy8gUmVuZGVyT3BlcmF0b3IuY3JjMy5iaW5kQnVmZmVyKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIF9yZW5kZXJCdWZmZXJzLmluZGljZXMpO1xyXG4gICAgICAgICAgICAvLyBSZW5kZXJPcGVyYXRvci5jcmMzLmJpbmRCdWZmZXIoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5BUlJBWV9CVUZGRVIsIF9yZW5kZXJCdWZmZXJzLnRleHR1cmVVVnMpO1xyXG5cclxuICAgICAgICB9XHJcbiAgICAgICAgcHJvdGVjdGVkIHN0YXRpYyBkZWxldGVCdWZmZXJzKF9yZW5kZXJCdWZmZXJzOiBSZW5kZXJCdWZmZXJzKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGlmIChfcmVuZGVyQnVmZmVycykge1xyXG4gICAgICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy5iaW5kQnVmZmVyKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuQVJSQVlfQlVGRkVSLCBudWxsKTtcclxuICAgICAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMuZGVsZXRlQnVmZmVyKF9yZW5kZXJCdWZmZXJzLnZlcnRpY2VzKTtcclxuICAgICAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMuZGVsZXRlQnVmZmVyKF9yZW5kZXJCdWZmZXJzLnRleHR1cmVVVnMpO1xyXG4gICAgICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy5iaW5kQnVmZmVyKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIG51bGwpO1xyXG4gICAgICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy5kZWxldGVCdWZmZXIoX3JlbmRlckJ1ZmZlcnMuaW5kaWNlcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gI2VuZHJlZ2lvblxyXG5cclxuICAgICAgICAvLyAjcmVnaW9uIE1hdGVyaWFsUGFyYW1ldGVyc1xyXG4gICAgICAgIHByb3RlY3RlZCBzdGF0aWMgY3JlYXRlUGFyYW1ldGVyKF9jb2F0OiBDb2F0KTogUmVuZGVyQ29hdCB7XHJcbiAgICAgICAgICAgIC8vIGxldCB2YW86IFdlYkdMVmVydGV4QXJyYXlPYmplY3QgPSBSZW5kZXJPcGVyYXRvci5hc3NlcnQ8V2ViR0xWZXJ0ZXhBcnJheU9iamVjdD4oUmVuZGVyT3BlcmF0b3IuY3JjMy5jcmVhdGVWZXJ0ZXhBcnJheSgpKTtcclxuICAgICAgICAgICAgbGV0IGNvYXRJbmZvOiBSZW5kZXJDb2F0ID0ge1xyXG4gICAgICAgICAgICAgICAgLy92YW86IG51bGwsXHJcbiAgICAgICAgICAgICAgICBjb2F0OiBfY29hdFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICByZXR1cm4gY29hdEluZm87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByb3RlY3RlZCBzdGF0aWMgdXNlUGFyYW1ldGVyKF9jb2F0SW5mbzogUmVuZGVyQ29hdCk6IHZvaWQge1xyXG4gICAgICAgICAgICAvLyBSZW5kZXJPcGVyYXRvci5jcmMzLmJpbmRWZXJ0ZXhBcnJheShfY29hdEluZm8udmFvKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHJvdGVjdGVkIHN0YXRpYyBkZWxldGVQYXJhbWV0ZXIoX2NvYXRJbmZvOiBSZW5kZXJDb2F0KTogdm9pZCB7XHJcbiAgICAgICAgICAgIGlmIChfY29hdEluZm8pIHtcclxuICAgICAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMuYmluZFZlcnRleEFycmF5KG51bGwpO1xyXG4gICAgICAgICAgICAgICAgLy8gUmVuZGVyT3BlcmF0b3IuY3JjMy5kZWxldGVWZXJ0ZXhBcnJheShfY29hdEluZm8udmFvKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyAjZW5kcmVnaW9uXHJcblxyXG4gICAgICAgIC8qKiBcclxuICAgICAgICAgKiBXcmFwcGVyIGZ1bmN0aW9uIHRvIHV0aWxpemUgdGhlIGJ1ZmZlclNwZWNpZmljYXRpb24gaW50ZXJmYWNlIHdoZW4gcGFzc2luZyBkYXRhIHRvIHRoZSBzaGFkZXIgdmlhIGEgYnVmZmVyLlxyXG4gICAgICAgICAqIEBwYXJhbSBfYXR0cmlidXRlTG9jYXRpb24gLy8gVGhlIGxvY2F0aW9uIG9mIHRoZSBhdHRyaWJ1dGUgb24gdGhlIHNoYWRlciwgdG8gd2hpY2ggdGhleSBkYXRhIHdpbGwgYmUgcGFzc2VkLlxyXG4gICAgICAgICAqIEBwYXJhbSBfYnVmZmVyU3BlY2lmaWNhdGlvbiAvLyBJbnRlcmZhY2UgcGFzc2luZyBkYXRhcHVsbHNwZWNpZmljYXRpb25zIHRvIHRoZSBidWZmZXIuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgc2V0QXR0cmlidXRlU3RydWN0dXJlKF9hdHRyaWJ1dGVMb2NhdGlvbjogbnVtYmVyLCBfYnVmZmVyU3BlY2lmaWNhdGlvbjogQnVmZmVyU3BlY2lmaWNhdGlvbik6IHZvaWQge1xyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLnZlcnRleEF0dHJpYlBvaW50ZXIoX2F0dHJpYnV0ZUxvY2F0aW9uLCBfYnVmZmVyU3BlY2lmaWNhdGlvbi5zaXplLCBfYnVmZmVyU3BlY2lmaWNhdGlvbi5kYXRhVHlwZSwgX2J1ZmZlclNwZWNpZmljYXRpb24ubm9ybWFsaXplLCBfYnVmZmVyU3BlY2lmaWNhdGlvbi5zdHJpZGUsIF9idWZmZXJTcGVjaWZpY2F0aW9uLm9mZnNldCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL1RyYW5zZmVyL011dGFibGUudHNcIi8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9SZW5kZXIvUmVuZGVySW5qZWN0b3IudHNcIi8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9SZW5kZXIvUmVuZGVyT3BlcmF0b3IudHNcIi8+XHJcbm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBIb2xkcyBkYXRhIHRvIGZlZWQgaW50byBhIFtbU2hhZGVyXV0gdG8gZGVzY3JpYmUgdGhlIHN1cmZhY2Ugb2YgW1tNZXNoXV0uICBcclxuICAgICAqIFtbTWF0ZXJpYWxdXXMgcmVmZXJlbmNlIFtbQ29hdF1dIGFuZCBbW1NoYWRlcl1dLiAgIFxyXG4gICAgICogVGhlIG1ldGhvZCB1c2VSZW5kZXJEYXRhIHdpbGwgYmUgaW5qZWN0ZWQgYnkgW1tSZW5kZXJJbmplY3Rvcl1dIGF0IHJ1bnRpbWUsIGV4dGVuZGluZyB0aGUgZnVuY3Rpb25hbGl0eSBvZiB0aGlzIGNsYXNzIHRvIGRlYWwgd2l0aCB0aGUgcmVuZGVyZXIuXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBDb2F0IGV4dGVuZHMgTXV0YWJsZSBpbXBsZW1lbnRzIFNlcmlhbGl6YWJsZSB7XHJcbiAgICAgICAgcHVibGljIG5hbWU6IHN0cmluZyA9IFwiQ29hdFwiO1xyXG4gICAgICAgIHByb3RlY3RlZCByZW5kZXJEYXRhOiB7W2tleTogc3RyaW5nXTogdW5rbm93bn07XHJcblxyXG4gICAgICAgIHB1YmxpYyBtdXRhdGUoX211dGF0b3I6IE11dGF0b3IpOiB2b2lkIHtcclxuICAgICAgICAgICAgc3VwZXIubXV0YXRlKF9tdXRhdG9yKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB1c2VSZW5kZXJEYXRhKF9yZW5kZXJTaGFkZXI6IFJlbmRlclNoYWRlcik6IHZvaWQgey8qIGluamVjdGVkIGJ5IFJlbmRlckluamVjdG9yKi8gfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vI3JlZ2lvbiBUcmFuc2ZlclxyXG4gICAgICAgIHB1YmxpYyBzZXJpYWxpemUoKTogU2VyaWFsaXphdGlvbiB7XHJcbiAgICAgICAgICAgIGxldCBzZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uID0gdGhpcy5nZXRNdXRhdG9yKCk7IFxyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsaXphdGlvbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHVibGljIGRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uKTogU2VyaWFsaXphYmxlIHtcclxuICAgICAgICAgICAgdGhpcy5tdXRhdGUoX3NlcmlhbGl6YXRpb24pO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByb3RlY3RlZCByZWR1Y2VNdXRhdG9yKCk6IHZvaWQgeyAvKiovIH1cclxuICAgICAgICAvLyNlbmRyZWdpb25cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBzaW1wbGVzdCBbW0NvYXRdXSBwcm92aWRpbmcganVzdCBhIGNvbG9yXHJcbiAgICAgKi9cclxuICAgIEBSZW5kZXJJbmplY3Rvci5kZWNvcmF0ZUNvYXRcclxuICAgIGV4cG9ydCBjbGFzcyBDb2F0Q29sb3JlZCBleHRlbmRzIENvYXQge1xyXG4gICAgICAgIHB1YmxpYyBjb2xvcjogQ29sb3I7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKF9jb2xvcj86IENvbG9yKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY29sb3IgPSBfY29sb3IgfHwgbmV3IENvbG9yKDAuNSwgMC41LCAwLjUsIDEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEEgW1tDb2F0XV0gcHJvdmlkaW5nIGEgdGV4dHVyZSBhbmQgYWRkaXRpb25hbCBkYXRhIGZvciB0ZXh0dXJpbmdcclxuICAgICAqL1xyXG4gICAgQFJlbmRlckluamVjdG9yLmRlY29yYXRlQ29hdFxyXG4gICAgZXhwb3J0IGNsYXNzIENvYXRUZXh0dXJlZCBleHRlbmRzIENvYXQge1xyXG4gICAgICAgIHB1YmxpYyB0ZXh0dXJlOiBUZXh0dXJlSW1hZ2UgPSBudWxsO1xyXG4gICAgICAgIC8vIGp1c3QgaWRlYXMgc28gZmFyXHJcbiAgICAgICAgcHVibGljIHRpbGluZ1g6IG51bWJlcjtcclxuICAgICAgICBwdWJsaWMgdGlsaW5nWTogbnVtYmVyO1xyXG4gICAgICAgIHB1YmxpYyByZXBldGl0aW9uOiBib29sZWFuO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBBIFtbQ29hdF1dIHRvIGJlIHVzZWQgYnkgdGhlIE1hdENhcCBTaGFkZXIgcHJvdmlkaW5nIGEgdGV4dHVyZSwgYSB0aW50IGNvbG9yICgwLjUgZ3JleSBpcyBuZXV0cmFsKVxyXG4gICAgICogYW5kIGEgZmxhdE1peCBudW1iZXIgZm9yIG1peGluZyBiZXR3ZWVuIHNtb290aCBhbmQgZmxhdCBzaGFkaW5nLlxyXG4gICAgICovXHJcbiAgICBAUmVuZGVySW5qZWN0b3IuZGVjb3JhdGVDb2F0XHJcbiAgICBleHBvcnQgY2xhc3MgQ29hdE1hdENhcCBleHRlbmRzIENvYXQge1xyXG4gICAgICAgIHB1YmxpYyB0ZXh0dXJlOiBUZXh0dXJlSW1hZ2UgPSBudWxsO1xyXG4gICAgICAgIHB1YmxpYyB0aW50Q29sb3I6IENvbG9yID0gbmV3IENvbG9yKDAuNSwgMC41LCAwLjUsIDEpO1xyXG4gICAgICAgIHB1YmxpYyBmbGF0TWl4OiBudW1iZXIgPSAwLjU7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKF90ZXh0dXJlPzogVGV4dHVyZUltYWdlLCBfdGludGNvbG9yPzogQ29sb3IsIF9mbGF0bWl4PzogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMudGV4dHVyZSA9IF90ZXh0dXJlIHx8IG5ldyBUZXh0dXJlSW1hZ2UoKTtcclxuICAgICAgICAgICAgdGhpcy50aW50Q29sb3IgPSBfdGludGNvbG9yIHx8IG5ldyBDb2xvcigwLjUsIDAuNSwgMC41LCAxKTtcclxuICAgICAgICAgICAgdGhpcy5mbGF0TWl4ID0gX2ZsYXRtaXggPiAxLjAgPyB0aGlzLmZsYXRNaXggPSAxLjAgOiB0aGlzLmZsYXRNaXggPSBfZmxhdG1peCB8fCAwLjU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL1RyYW5zZmVyL1NlcmlhbGl6ZXIudHNcIi8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9UcmFuc2Zlci9NdXRhYmxlLnRzXCIvPlxyXG5uYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKiBcclxuICAgICAqIFN1cGVyY2xhc3MgZm9yIGFsbCBbW0NvbXBvbmVudF1dcyB0aGF0IGNhbiBiZSBhdHRhY2hlZCB0byBbW05vZGVdXXMuXHJcbiAgICAgKiBAYXV0aG9ycyBKYXNjaGEgS2FyYWfDtmwsIEhGVSwgMjAxOSB8IEppcmthIERlbGwnT3JvLUZyaWVkbCwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDb21wb25lbnQgZXh0ZW5kcyBNdXRhYmxlIGltcGxlbWVudHMgU2VyaWFsaXphYmxlIHtcclxuICAgICAgICBwcm90ZWN0ZWQgc2luZ2xldG9uOiBib29sZWFuID0gdHJ1ZTtcclxuICAgICAgICBwcml2YXRlIGNvbnRhaW5lcjogTm9kZSB8IG51bGwgPSBudWxsO1xyXG4gICAgICAgIHByaXZhdGUgYWN0aXZlOiBib29sZWFuID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgcHVibGljIGFjdGl2YXRlKF9vbjogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZSA9IF9vbjtcclxuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChfb24gPyBFVkVOVC5DT01QT05FTlRfQUNUSVZBVEUgOiBFVkVOVC5DT01QT05FTlRfREVBQ1RJVkFURSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwdWJsaWMgZ2V0IGlzQWN0aXZlKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hY3RpdmU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBJcyB0cnVlLCB3aGVuIG9ubHkgb25lIGluc3RhbmNlIG9mIHRoZSBjb21wb25lbnQgY2xhc3MgY2FuIGJlIGF0dGFjaGVkIHRvIGEgbm9kZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBnZXQgaXNTaW5nbGV0b24oKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNpbmdsZXRvbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0cmlldmVzIHRoZSBub2RlLCB0aGlzIGNvbXBvbmVudCBpcyBjdXJyZW50bHkgYXR0YWNoZWQgdG9cclxuICAgICAgICAgKiBAcmV0dXJucyBUaGUgY29udGFpbmVyIG5vZGUgb3IgbnVsbCwgaWYgdGhlIGNvbXBvbmVudCBpcyBub3QgYXR0YWNoZWQgdG9cclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0Q29udGFpbmVyKCk6IE5vZGUgfCBudWxsIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29udGFpbmVyO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUcmllcyB0byBhZGQgdGhlIGNvbXBvbmVudCB0byB0aGUgZ2l2ZW4gbm9kZSwgcmVtb3ZpbmcgaXQgZnJvbSB0aGUgcHJldmlvdXMgY29udGFpbmVyIGlmIGFwcGxpY2FibGVcclxuICAgICAgICAgKiBAcGFyYW0gX2NvbnRhaW5lciBUaGUgbm9kZSB0byBhdHRhY2ggdGhpcyBjb21wb25lbnQgdG9cclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc2V0Q29udGFpbmVyKF9jb250YWluZXI6IE5vZGUgfCBudWxsKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbnRhaW5lciA9PSBfY29udGFpbmVyKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICBsZXQgcHJldmlvdXNDb250YWluZXI6IE5vZGUgPSB0aGlzLmNvbnRhaW5lcjtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGlmIChwcmV2aW91c0NvbnRhaW5lcilcclxuICAgICAgICAgICAgICAgICAgICBwcmV2aW91c0NvbnRhaW5lci5yZW1vdmVDb21wb25lbnQodGhpcyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRhaW5lciA9IF9jb250YWluZXI7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jb250YWluZXIpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250YWluZXIuYWRkQ29tcG9uZW50KHRoaXMpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29udGFpbmVyID0gcHJldmlvdXNDb250YWluZXI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8jcmVnaW9uIFRyYW5zZmVyXHJcbiAgICAgICAgcHVibGljIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemF0aW9uIHtcclxuICAgICAgICAgICAgbGV0IHNlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24gPSB7XHJcbiAgICAgICAgICAgICAgICBhY3RpdmU6IHRoaXMuYWN0aXZlXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHJldHVybiBzZXJpYWxpemF0aW9uO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwdWJsaWMgZGVzZXJpYWxpemUoX3NlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24pOiBTZXJpYWxpemFibGUge1xyXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZSA9IF9zZXJpYWxpemF0aW9uLmFjdGl2ZTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcm90ZWN0ZWQgcmVkdWNlTXV0YXRvcihfbXV0YXRvcjogTXV0YXRvcik6IHZvaWQge1xyXG4gICAgICAgICAgICBkZWxldGUgX211dGF0b3Iuc2luZ2xldG9uO1xyXG4gICAgICAgICAgICBkZWxldGUgX211dGF0b3IuY29udGFpbmVyO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyNlbmRyZWdpb25cclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJDb21wb25lbnQudHNcIi8+XHJcbm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gIC8qKlxyXG4gICAqIEhvbGRzIGRpZmZlcmVudCBwbGF5bW9kZXMgdGhlIGFuaW1hdGlvbiB1c2VzIHRvIHBsYXkgYmFjayBpdHMgYW5pbWF0aW9uLlxyXG4gICAqIEBhdXRob3IgTHVrYXMgU2NoZXVlcmxlLCBIRlUsIDIwMTlcclxuICAgKi9cclxuICBleHBvcnQgZW51bSBBTklNQVRJT05fUExBWU1PREUge1xyXG4gICAgLyoqUGxheXMgYW5pbWF0aW9uIGluIGEgbG9vcDogaXQgcmVzdGFydHMgb25jZSBpdCBoaXQgdGhlIGVuZC4qL1xyXG4gICAgTE9PUCxcclxuICAgIC8qKlBsYXlzIGFuaW1hdGlvbiBvbmNlIGFuZCBzdG9wcyBhdCB0aGUgbGFzdCBrZXkvZnJhbWUqL1xyXG4gICAgUExBWU9OQ0UsXHJcbiAgICAvKipQbGF5cyBhbmltYXRpb24gb25jZSBhbmQgc3RvcHMgb24gdGhlIGZpcnN0IGtleS9mcmFtZSAqL1xyXG4gICAgUExBWU9OQ0VTVE9QQUZURVIsXHJcbiAgICAvKipQbGF5cyBhbmltYXRpb24gbGlrZSBMT09QLCBidXQgYmFja3dhcmRzLiovXHJcbiAgICBSRVZFUlNFTE9PUCxcclxuICAgIC8qKkNhdXNlcyB0aGUgYW5pbWF0aW9uIG5vdCB0byBwbGF5IGF0IGFsbC4gVXNlZnVsIGZvciBqdW1waW5nIHRvIHZhcmlvdXMgcG9zaXRpb25zIGluIHRoZSBhbmltYXRpb24gd2l0aG91dCBwcm9jZWVkaW5nIGluIHRoZSBhbmltYXRpb24uKi9cclxuICAgIFNUT1BcclxuICAgIC8vVE9ETzogYWRkIGFuIElOSEVSSVQgYW5kIGEgUElOR1BPTkcgbW9kZVxyXG4gIH1cclxuXHJcbiAgZXhwb3J0IGVudW0gQU5JTUFUSU9OX1BMQVlCQUNLIHtcclxuICAgIC8vVE9ETzogYWRkIGFuIGluLWRlcHRoIGRlc2NyaXB0aW9uIG9mIHdoYXQgaGFwcGVucyB0byB0aGUgYW5pbWF0aW9uIChhbmQgZXZlbnRzKSBkZXBlbmRpbmcgb24gdGhlIFBsYXliYWNrLiBVc2UgR3JhcGhzIHRvIGV4cGxhaW4uXHJcbiAgICAvKipDYWxjdWxhdGVzIHRoZSBzdGF0ZSBvZiB0aGUgYW5pbWF0aW9uIGF0IHRoZSBleGFjdCBwb3NpdGlvbiBvZiB0aW1lLiBJZ25vcmVzIEZQUyB2YWx1ZSBvZiBhbmltYXRpb24uKi9cclxuICAgIFRJTUVCQVNFRF9DT05USU5PVVMsXHJcbiAgICAvKipMaW1pdHMgdGhlIGNhbGN1bGF0aW9uIG9mIHRoZSBzdGF0ZSBvZiB0aGUgYW5pbWF0aW9uIHRvIHRoZSBGUFMgdmFsdWUgb2YgdGhlIGFuaW1hdGlvbi4gU2tpcHMgZnJhbWVzIGlmIG5lZWRlZC4qL1xyXG4gICAgVElNRUJBU0VEX1JBU1RFUkVEX1RPX0ZQUyxcclxuICAgIC8qKlVzZXMgdGhlIEZQUyB2YWx1ZSBvZiB0aGUgYW5pbWF0aW9uIHRvIGFkdmFuY2Ugb25jZSBwZXIgZnJhbWUsIG5vIG1hdHRlciB0aGUgc3BlZWQgb2YgdGhlIGZyYW1lcy4gRG9lc24ndCBza2lwIGFueSBmcmFtZXMuKi9cclxuICAgIEZSQU1FQkFTRURcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEhvbGRzIGEgcmVmZXJlbmNlIHRvIGFuIFtbQW5pbWF0aW9uXV0gYW5kIGNvbnRyb2xzIGl0LiBDb250cm9scyBwbGF5YmFjayBhbmQgcGxheW1vZGUgYXMgd2VsbCBhcyBzcGVlZC5cclxuICAgKiBAYXV0aG9ycyBMdWthcyBTY2hldWVybGUsIEhGVSwgMjAxOVxyXG4gICAqL1xyXG4gIGV4cG9ydCBjbGFzcyBDb21wb25lbnRBbmltYXRvciBleHRlbmRzIENvbXBvbmVudCB7XHJcbiAgICAvL1RPRE86IGFkZCBmdW5jdGlvbmFsaXR5IHRvIGJsZW5kIGZyb20gb25lIGFuaW1hdGlvbiB0byBhbm90aGVyLlxyXG4gICAgYW5pbWF0aW9uOiBBbmltYXRpb247XHJcbiAgICBwbGF5bW9kZTogQU5JTUFUSU9OX1BMQVlNT0RFO1xyXG4gICAgcGxheWJhY2s6IEFOSU1BVElPTl9QTEFZQkFDSztcclxuICAgIHNwZWVkU2NhbGVzV2l0aEdsb2JhbFNwZWVkOiBib29sZWFuID0gdHJ1ZTtcclxuXHJcbiAgICBwcml2YXRlIGxvY2FsVGltZTogVGltZTtcclxuICAgIHByaXZhdGUgc3BlZWRTY2FsZTogbnVtYmVyID0gMTtcclxuICAgIHByaXZhdGUgbGFzdFRpbWU6IG51bWJlciA9IDA7XHJcblxyXG4gICAgY29uc3RydWN0b3IoX2FuaW1hdGlvbjogQW5pbWF0aW9uID0gbmV3IEFuaW1hdGlvbihcIlwiKSwgX3BsYXltb2RlOiBBTklNQVRJT05fUExBWU1PREUgPSBBTklNQVRJT05fUExBWU1PREUuTE9PUCwgX3BsYXliYWNrOiBBTklNQVRJT05fUExBWUJBQ0sgPSBBTklNQVRJT05fUExBWUJBQ0suVElNRUJBU0VEX0NPTlRJTk9VUykge1xyXG4gICAgICBzdXBlcigpO1xyXG4gICAgICB0aGlzLmFuaW1hdGlvbiA9IF9hbmltYXRpb247XHJcbiAgICAgIHRoaXMucGxheW1vZGUgPSBfcGxheW1vZGU7XHJcbiAgICAgIHRoaXMucGxheWJhY2sgPSBfcGxheWJhY2s7XHJcblxyXG4gICAgICB0aGlzLmxvY2FsVGltZSA9IG5ldyBUaW1lKCk7XHJcblxyXG4gICAgICAvL1RPRE86IHVwZGF0ZSBhbmltYXRpb24gdG90YWwgdGltZSB3aGVuIGxvYWRpbmcgYSBkaWZmZXJlbnQgYW5pbWF0aW9uP1xyXG4gICAgICB0aGlzLmFuaW1hdGlvbi5jYWxjdWxhdGVUb3RhbFRpbWUoKTtcclxuXHJcbiAgICAgIExvb3AuYWRkRXZlbnRMaXN0ZW5lcihFVkVOVC5MT09QX0ZSQU1FLCB0aGlzLnVwZGF0ZUFuaW1hdGlvbkxvb3AuYmluZCh0aGlzKSk7XHJcbiAgICAgIFRpbWUuZ2FtZS5hZGRFdmVudExpc3RlbmVyKEVWRU5ULlRJTUVfU0NBTEVELCB0aGlzLnVwZGF0ZVNjYWxlLmJpbmQodGhpcykpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCBzcGVlZChfczogbnVtYmVyKSB7XHJcbiAgICAgIHRoaXMuc3BlZWRTY2FsZSA9IF9zO1xyXG4gICAgICB0aGlzLnVwZGF0ZVNjYWxlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBKdW1wcyB0byBhIGNlcnRhaW4gdGltZSBpbiB0aGUgYW5pbWF0aW9uIHRvIHBsYXkgZnJvbSB0aGVyZS5cclxuICAgICAqIEBwYXJhbSBfdGltZSBUaGUgdGltZSB0byBqdW1wIHRvXHJcbiAgICAgKi9cclxuICAgIGp1bXBUbyhfdGltZTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgIHRoaXMubG9jYWxUaW1lLnNldChfdGltZSk7XHJcbiAgICAgIHRoaXMubGFzdFRpbWUgPSBfdGltZTtcclxuICAgICAgX3RpbWUgPSBfdGltZSAlIHRoaXMuYW5pbWF0aW9uLnRvdGFsVGltZTtcclxuICAgICAgbGV0IG11dGF0b3I6IE11dGF0b3IgPSB0aGlzLmFuaW1hdGlvbi5nZXRNdXRhdGVkKF90aW1lLCB0aGlzLmNhbGN1bGF0ZURpcmVjdGlvbihfdGltZSksIHRoaXMucGxheWJhY2spO1xyXG4gICAgICB0aGlzLmdldENvbnRhaW5lcigpLmFwcGx5QW5pbWF0aW9uKG11dGF0b3IpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgY3VycmVudCB0aW1lIG9mIHRoZSBhbmltYXRpb24sIG1vZHVsYXRlZCBmb3IgYW5pbWF0aW9uIGxlbmd0aC5cclxuICAgICAqL1xyXG4gICAgZ2V0Q3VycmVudFRpbWUoKTogbnVtYmVyIHtcclxuICAgICAgcmV0dXJuIHRoaXMubG9jYWxUaW1lLmdldCgpICUgdGhpcy5hbmltYXRpb24udG90YWxUaW1lO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRm9yY2VzIGFuIHVwZGF0ZSBvZiB0aGUgYW5pbWF0aW9uIGZyb20gb3V0c2lkZS4gVXNlZCBpbiB0aGUgVmlld0FuaW1hdGlvbi4gU2hvdWxkbid0IGJlIHVzZWQgZHVyaW5nIHRoZSBnYW1lLlxyXG4gICAgICogQHBhcmFtIF90aW1lIHRoZSAodW5zY2FsZWQpIHRpbWUgdG8gdXBkYXRlIHRoZSBhbmltYXRpb24gd2l0aC5cclxuICAgICAqIEByZXR1cm5zIGEgVHVwZWwgY29udGFpbmluZyB0aGUgTXV0YXRvciBmb3IgQW5pbWF0aW9uIGFuZCB0aGUgcGxheW1vZGUgY29ycmVjdGVkIHRpbWUuIFxyXG4gICAgICovXHJcbiAgICB1cGRhdGVBbmltYXRpb24oX3RpbWU6IG51bWJlcik6IFtNdXRhdG9yLCBudW1iZXJdIHtcclxuICAgICAgcmV0dXJuIHRoaXMudXBkYXRlQW5pbWF0aW9uTG9vcChudWxsLCBfdGltZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8jcmVnaW9uIHRyYW5zZmVyXHJcbiAgICBzZXJpYWxpemUoKTogU2VyaWFsaXphdGlvbiB7XHJcbiAgICAgIGxldCBzOiBTZXJpYWxpemF0aW9uID0gc3VwZXIuc2VyaWFsaXplKCk7XHJcbiAgICAgIHNbXCJhbmltYXRpb25cIl0gPSB0aGlzLmFuaW1hdGlvbi5zZXJpYWxpemUoKTtcclxuICAgICAgc1tcInBsYXltb2RlXCJdID0gdGhpcy5wbGF5bW9kZTtcclxuICAgICAgc1tcInBsYXliYWNrXCJdID0gdGhpcy5wbGF5YmFjaztcclxuICAgICAgc1tcInNwZWVkU2NhbGVcIl0gPSB0aGlzLnNwZWVkU2NhbGU7XHJcbiAgICAgIHNbXCJzcGVlZFNjYWxlc1dpdGhHbG9iYWxTcGVlZFwiXSA9IHRoaXMuc3BlZWRTY2FsZXNXaXRoR2xvYmFsU3BlZWQ7XHJcblxyXG4gICAgICBzW3N1cGVyLmNvbnN0cnVjdG9yLm5hbWVdID0gc3VwZXIuc2VyaWFsaXplKCk7XHJcblxyXG4gICAgICByZXR1cm4gcztcclxuICAgIH1cclxuXHJcbiAgICBkZXNlcmlhbGl6ZShfczogU2VyaWFsaXphdGlvbik6IFNlcmlhbGl6YWJsZSB7XHJcbiAgICAgIHRoaXMuYW5pbWF0aW9uID0gbmV3IEFuaW1hdGlvbihcIlwiKTtcclxuICAgICAgdGhpcy5hbmltYXRpb24uZGVzZXJpYWxpemUoX3MuYW5pbWF0aW9uKTtcclxuICAgICAgdGhpcy5wbGF5YmFjayA9IF9zLnBsYXliYWNrO1xyXG4gICAgICB0aGlzLnBsYXltb2RlID0gX3MucGxheW1vZGU7XHJcbiAgICAgIHRoaXMuc3BlZWRTY2FsZSA9IF9zLnNwZWVkU2NhbGU7XHJcbiAgICAgIHRoaXMuc3BlZWRTY2FsZXNXaXRoR2xvYmFsU3BlZWQgPSBfcy5zcGVlZFNjYWxlc1dpdGhHbG9iYWxTcGVlZDtcclxuXHJcbiAgICAgIHN1cGVyLmRlc2VyaWFsaXplKF9zW3N1cGVyLmNvbnN0cnVjdG9yLm5hbWVdKTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvLyNlbmRyZWdpb25cclxuXHJcbiAgICAvLyNyZWdpb24gdXBkYXRlQW5pbWF0aW9uXHJcbiAgICAvKipcclxuICAgICAqIFVwZGF0ZXMgdGhlIEFuaW1hdGlvbi5cclxuICAgICAqIEdldHMgY2FsbGVkIGV2ZXJ5IHRpbWUgdGhlIExvb3AgZmlyZXMgdGhlIExPT1BfRlJBTUUgRXZlbnQuXHJcbiAgICAgKiBVc2VzIHRoZSBidWlsdC1pbiB0aW1lIHVubGVzcyBhIGRpZmZlcmVudCB0aW1lIGlzIHNwZWNpZmllZC5cclxuICAgICAqIE1heSBhbHNvIGJlIGNhbGxlZCBmcm9tIHVwZGF0ZUFuaW1hdGlvbigpLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHVwZGF0ZUFuaW1hdGlvbkxvb3AoX2U6IEV2ZW50LCBfdGltZTogbnVtYmVyKTogW011dGF0b3IsIG51bWJlcl0ge1xyXG4gICAgICBpZiAodGhpcy5hbmltYXRpb24udG90YWxUaW1lID09IDApXHJcbiAgICAgICAgcmV0dXJuIFtudWxsLCAwXTtcclxuICAgICAgbGV0IHRpbWU6IG51bWJlciA9IF90aW1lIHx8IHRoaXMubG9jYWxUaW1lLmdldCgpO1xyXG4gICAgICBpZiAodGhpcy5wbGF5YmFjayA9PSBBTklNQVRJT05fUExBWUJBQ0suRlJBTUVCQVNFRCkge1xyXG4gICAgICAgIHRpbWUgPSB0aGlzLmxhc3RUaW1lICsgKDEwMDAgLyB0aGlzLmFuaW1hdGlvbi5mcHMpO1xyXG4gICAgICB9XHJcbiAgICAgIGxldCBkaXJlY3Rpb246IG51bWJlciA9IHRoaXMuY2FsY3VsYXRlRGlyZWN0aW9uKHRpbWUpO1xyXG4gICAgICB0aW1lID0gdGhpcy5hcHBseVBsYXltb2Rlcyh0aW1lKTtcclxuICAgICAgdGhpcy5leGVjdXRlRXZlbnRzKHRoaXMuYW5pbWF0aW9uLmdldEV2ZW50c1RvRmlyZSh0aGlzLmxhc3RUaW1lLCB0aW1lLCB0aGlzLnBsYXliYWNrLCBkaXJlY3Rpb24pKTtcclxuXHJcbiAgICAgIGlmICh0aGlzLmxhc3RUaW1lICE9IHRpbWUpIHtcclxuICAgICAgICB0aGlzLmxhc3RUaW1lID0gdGltZTtcclxuICAgICAgICB0aW1lID0gdGltZSAlIHRoaXMuYW5pbWF0aW9uLnRvdGFsVGltZTtcclxuICAgICAgICBsZXQgbXV0YXRvcjogTXV0YXRvciA9IHRoaXMuYW5pbWF0aW9uLmdldE11dGF0ZWQodGltZSwgZGlyZWN0aW9uLCB0aGlzLnBsYXliYWNrKTtcclxuICAgICAgICBpZiAodGhpcy5nZXRDb250YWluZXIoKSkge1xyXG4gICAgICAgICAgdGhpcy5nZXRDb250YWluZXIoKS5hcHBseUFuaW1hdGlvbihtdXRhdG9yKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFttdXRhdG9yLCB0aW1lXTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gW251bGwsIHRpbWVdO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRmlyZXMgYWxsIGN1c3RvbSBldmVudHMgdGhlIEFuaW1hdGlvbiBzaG91bGQgaGF2ZSBmaXJlZCBiZXR3ZWVuIHRoZSBsYXN0IGZyYW1lIGFuZCB0aGUgY3VycmVudCBmcmFtZS5cclxuICAgICAqIEBwYXJhbSBldmVudHMgYSBsaXN0IG9mIG5hbWVzIG9mIGN1c3RvbSBldmVudHMgdG8gZmlyZVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGV4ZWN1dGVFdmVudHMoZXZlbnRzOiBzdHJpbmdbXSk6IHZvaWQge1xyXG4gICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgZXZlbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChldmVudHNbaV0pKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsY3VsYXRlcyB0aGUgYWN0dWFsIHRpbWUgdG8gdXNlLCB1c2luZyB0aGUgY3VycmVudCBwbGF5bW9kZXMuXHJcbiAgICAgKiBAcGFyYW0gX3RpbWUgdGhlIHRpbWUgdG8gYXBwbHkgdGhlIHBsYXltb2RlcyB0b1xyXG4gICAgICogQHJldHVybnMgdGhlIHJlY2FsY3VsYXRlZCB0aW1lXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgYXBwbHlQbGF5bW9kZXMoX3RpbWU6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICAgIHN3aXRjaCAodGhpcy5wbGF5bW9kZSkge1xyXG4gICAgICAgIGNhc2UgQU5JTUFUSU9OX1BMQVlNT0RFLlNUT1A6XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy5sb2NhbFRpbWUuZ2V0T2Zmc2V0KCk7XHJcbiAgICAgICAgY2FzZSBBTklNQVRJT05fUExBWU1PREUuUExBWU9OQ0U6XHJcbiAgICAgICAgICBpZiAoX3RpbWUgPj0gdGhpcy5hbmltYXRpb24udG90YWxUaW1lKVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hbmltYXRpb24udG90YWxUaW1lIC0gMC4wMTsgICAgIC8vVE9ETzogdGhpcyBtaWdodCBjYXVzZSBzb21lIGlzc3Vlc1xyXG4gICAgICAgICAgZWxzZSByZXR1cm4gX3RpbWU7XHJcbiAgICAgICAgY2FzZSBBTklNQVRJT05fUExBWU1PREUuUExBWU9OQ0VTVE9QQUZURVI6XHJcbiAgICAgICAgICBpZiAoX3RpbWUgPj0gdGhpcy5hbmltYXRpb24udG90YWxUaW1lKVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hbmltYXRpb24udG90YWxUaW1lICsgMC4wMTsgICAgIC8vVE9ETzogdGhpcyBtaWdodCBjYXVzZSBzb21lIGlzc3Vlc1xyXG4gICAgICAgICAgZWxzZSByZXR1cm4gX3RpbWU7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgIHJldHVybiBfdGltZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsY3VsYXRlcyBhbmQgcmV0dXJucyB0aGUgZGlyZWN0aW9uIHRoZSBhbmltYXRpb24gc2hvdWxkIGN1cnJlbnRseSBiZSBwbGF5aW5nIGluLlxyXG4gICAgICogQHBhcmFtIF90aW1lIHRoZSB0aW1lIGF0IHdoaWNoIHRvIGNhbGN1bGF0ZSB0aGUgZGlyZWN0aW9uXHJcbiAgICAgKiBAcmV0dXJucyAxIGlmIGZvcndhcmQsIDAgaWYgc3RvcCwgLTEgaWYgYmFja3dhcmRzXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgY2FsY3VsYXRlRGlyZWN0aW9uKF90aW1lOiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgICBzd2l0Y2ggKHRoaXMucGxheW1vZGUpIHtcclxuICAgICAgICBjYXNlIEFOSU1BVElPTl9QTEFZTU9ERS5TVE9QOlxyXG4gICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgLy8gY2FzZSBBTklNQVRJT05fUExBWU1PREUuUElOR1BPTkc6XHJcbiAgICAgICAgLy8gICBpZiAoTWF0aC5mbG9vcihfdGltZSAvIHRoaXMuYW5pbWF0aW9uLnRvdGFsVGltZSkgJSAyID09IDApXHJcbiAgICAgICAgLy8gICAgIHJldHVybiAxO1xyXG4gICAgICAgIC8vICAgZWxzZVxyXG4gICAgICAgIC8vICAgICByZXR1cm4gLTE7XHJcbiAgICAgICAgY2FzZSBBTklNQVRJT05fUExBWU1PREUuUkVWRVJTRUxPT1A6XHJcbiAgICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgICAgY2FzZSBBTklNQVRJT05fUExBWU1PREUuUExBWU9OQ0U6XHJcbiAgICAgICAgY2FzZSBBTklNQVRJT05fUExBWU1PREUuUExBWU9OQ0VTVE9QQUZURVI6XHJcbiAgICAgICAgICBpZiAoX3RpbWUgPj0gdGhpcy5hbmltYXRpb24udG90YWxUaW1lKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXBkYXRlcyB0aGUgc2NhbGUgb2YgdGhlIGFuaW1hdGlvbiBpZiB0aGUgdXNlciBjaGFuZ2VzIGl0IG9yIGlmIHRoZSBnbG9iYWwgZ2FtZSB0aW1lciBjaGFuZ2VkIGl0cyBzY2FsZS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSB1cGRhdGVTY2FsZSgpOiB2b2lkIHtcclxuICAgICAgbGV0IG5ld1NjYWxlOiBudW1iZXIgPSB0aGlzLnNwZWVkU2NhbGU7XHJcbiAgICAgIGlmICh0aGlzLnNwZWVkU2NhbGVzV2l0aEdsb2JhbFNwZWVkKVxyXG4gICAgICAgIG5ld1NjYWxlICo9IFRpbWUuZ2FtZS5nZXRTY2FsZSgpO1xyXG4gICAgICB0aGlzLmxvY2FsVGltZS5zZXRTY2FsZShuZXdTY2FsZSk7XHJcbiAgICB9XHJcbiAgICAvLyNlbmRyZWdpb25cclxuICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiQ29tcG9uZW50LnRzXCIvPlxyXG5uYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogQXR0YWNoZXMgYSBbW0NvbXBvbmVudEF1ZGlvXV0gdG8gYSBbW05vZGVdXS5cclxuICAgICAqIE9ubHkgYSBzaW5nbGUgW1tBdWRpb11dIGNhbiBiZSB1c2VkIHdpdGhpbiBhIHNpbmdsZSBbW0NvbXBvbmVudEF1ZGlvXV1cclxuICAgICAqIEBhdXRob3JzIFRob21hcyBEb3JuZXIsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgQ29tcG9uZW50QXVkaW8gZXh0ZW5kcyBDb21wb25lbnQge1xyXG5cclxuICAgICAgICBwdWJsaWMgYXVkaW86IEF1ZGlvO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHB1YmxpYyBpc0xvY2FsaXNlZDogYm9vbGVhbjtcclxuICAgICAgICBwdWJsaWMgbG9jYWxpc2F0aW9uOiBBdWRpb0xvY2FsaXNhdGlvbiB8IG51bGw7XHJcblxyXG4gICAgICAgIHB1YmxpYyBpc0ZpbHRlcmVkOiBib29sZWFuO1xyXG4gICAgICAgIHB1YmxpYyBmaWx0ZXI6IEF1ZGlvRmlsdGVyIHwgbnVsbDtcclxuXHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc3RydWN0b3IoX2F1ZGlvOiBBdWRpbykge1xyXG4gICAgICAgICAgICBzdXBlcigpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zZXRBdWRpbyhfYXVkaW8pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHNldExvY2FsaXNhdGlvbihfbG9jYWxpc2F0aW9uOiBBdWRpb0xvY2FsaXNhdGlvbik6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmxvY2FsaXNhdGlvbiA9IF9sb2NhbGlzYXRpb247XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBwbGF5QXVkaW9cclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgcGxheUF1ZGlvKF9hdWRpb0NvbnRleHQ6IEF1ZGlvQ29udGV4dCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmF1ZGlvLmluaXRCdWZmZXJTb3VyY2UoX2F1ZGlvQ29udGV4dCk7XHJcbiAgICAgICAgICAgIHRoaXMuYXVkaW8uYnVmZmVyU291cmNlLnN0YXJ0KF9hdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQWRkcyBhbiBbW0F1ZGlvXV0gdG8gdGhlIFtbQ29tcG9uZW50QXVkaW9dXVxyXG4gICAgICAgICAqIEBwYXJhbSBfYXVkaW8gRGVjb2RlZCBBdWRpbyBEYXRhIGFzIFtbQXVkaW9dXVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgc2V0QXVkaW8oX2F1ZGlvOiBBdWRpbyk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmF1ZGlvID0gX2F1ZGlvO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBGaW5hbCBhdHRhY2htZW50cyBmb3IgdGhlIEF1ZGlvIE5vZGVzIGluIGZvbGxvd2luZyBvcmRlclxyXG4gICAgICAgICAqIDEuIExvY2FsaXNhdGlvblxyXG4gICAgICAgICAqIDIuIEZpbHRlclxyXG4gICAgICAgICAqIDMuIE1hc3RlciBHYWluXHJcbiAgICAgICAgICogY29ubmVjdEF1ZGlvTm9kZXNcclxuICAgICAgICAgKi9cclxuICAgICAgICAvLyBwcml2YXRlIGNvbm5lY3RBdWRpb05vZGVzKCk6IHZvaWQge1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAvLyB9XHJcblxyXG5cclxuXHJcblxyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIkNvbXBvbmVudC50c1wiLz5cclxubmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIEF0dGFjaGVzIGEgW1tBdWRpb0xpc3RlbmVyXV0gdG8gdGhlIG5vZGVcclxuICAgICAqIEBhdXRob3JzIFRob21hcyBEb3JuZXIsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgQ29tcG9uZW50QXVkaW9MaXN0ZW5lciBleHRlbmRzIENvbXBvbmVudCB7XHJcblxyXG4gICAgICAgIFxyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIkNvbXBvbmVudC50c1wiLz5cclxubmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICBleHBvcnQgZW51bSBGSUVMRF9PRl9WSUVXIHtcclxuICAgICAgICBIT1JJWk9OVEFMLCBWRVJUSUNBTCwgRElBR09OQUxcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogRGVmaW5lcyBpZGVudGlmaWVycyBmb3IgdGhlIHZhcmlvdXMgcHJvamVjdGlvbnMgYSBjYW1lcmEgY2FuIHByb3ZpZGUuICBcclxuICAgICAqIFRPRE86IGNoYW5nZSBiYWNrIHRvIG51bWJlciBlbnVtIGlmIHN0cmluZ3Mgbm90IG5lZWRlZFxyXG4gICAgICovXHJcbiAgICBleHBvcnQgZW51bSBQUk9KRUNUSU9OIHtcclxuICAgICAgICBDRU5UUkFMID0gXCJjZW50cmFsXCIsXHJcbiAgICAgICAgT1JUSE9HUkFQSElDID0gXCJvcnRob2dyYXBoaWNcIixcclxuICAgICAgICBESU1FVFJJQyA9IFwiZGltZXRyaWNcIixcclxuICAgICAgICBTVEVSRU8gPSBcInN0ZXJlb1wiXHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBjYW1lcmEgY29tcG9uZW50IGhvbGRzIHRoZSBwcm9qZWN0aW9uLW1hdHJpeCBhbmQgb3RoZXIgZGF0YSBuZWVkZWQgdG8gcmVuZGVyIGEgc2NlbmUgZnJvbSB0aGUgcGVyc3BlY3RpdmUgb2YgdGhlIG5vZGUgaXQgaXMgYXR0YWNoZWQgdG8uXHJcbiAgICAgKiBAYXV0aG9ycyBKYXNjaGEgS2FyYWfDtmwsIEhGVSwgMjAxOSB8IEppcmthIERlbGwnT3JvLUZyaWVkbCwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBDb21wb25lbnRDYW1lcmEgZXh0ZW5kcyBDb21wb25lbnQge1xyXG4gICAgICAgIHB1YmxpYyBwaXZvdDogTWF0cml4NHg0ID0gTWF0cml4NHg0LklERU5USVRZO1xyXG4gICAgICAgIC8vcHJpdmF0ZSBvcnRob2dyYXBoaWM6IGJvb2xlYW4gPSBmYWxzZTsgLy8gRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBpbWFnZSB3aWxsIGJlIHJlbmRlcmVkIHdpdGggcGVyc3BlY3RpdmUgb3Igb3J0aG9ncmFwaGljIHByb2plY3Rpb24uXHJcbiAgICAgICAgcHJpdmF0ZSBwcm9qZWN0aW9uOiBQUk9KRUNUSU9OID0gUFJPSkVDVElPTi5DRU5UUkFMO1xyXG4gICAgICAgIHByaXZhdGUgdHJhbnNmb3JtOiBNYXRyaXg0eDQgPSBuZXcgTWF0cml4NHg0OyAvLyBUaGUgbWF0cml4IHRvIG11bHRpcGx5IGVhY2ggc2NlbmUgb2JqZWN0cyB0cmFuc2Zvcm1hdGlvbiBieSwgdG8gZGV0ZXJtaW5lIHdoZXJlIGl0IHdpbGwgYmUgZHJhd24uXHJcbiAgICAgICAgcHJpdmF0ZSBmaWVsZE9mVmlldzogbnVtYmVyID0gNDU7IC8vIFRoZSBjYW1lcmEncyBzZW5zb3JhbmdsZS5cclxuICAgICAgICBwcml2YXRlIGFzcGVjdFJhdGlvOiBudW1iZXIgPSAxLjA7XHJcbiAgICAgICAgcHJpdmF0ZSBkaXJlY3Rpb246IEZJRUxEX09GX1ZJRVcgPSBGSUVMRF9PRl9WSUVXLkRJQUdPTkFMO1xyXG4gICAgICAgIHByaXZhdGUgYmFja2dyb3VuZENvbG9yOiBDb2xvciA9IG5ldyBDb2xvcigwLCAwLCAwLCAxKTsgLy8gVGhlIGNvbG9yIG9mIHRoZSBiYWNrZ3JvdW5kIHRoZSBjYW1lcmEgd2lsbCByZW5kZXIuXHJcbiAgICAgICAgcHJpdmF0ZSBiYWNrZ3JvdW5kRW5hYmxlZDogYm9vbGVhbiA9IHRydWU7IC8vIERldGVybWluZXMgd2hldGhlciBvciBub3QgdGhlIGJhY2tncm91bmQgb2YgdGhpcyBjYW1lcmEgd2lsbCBiZSByZW5kZXJlZC5cclxuICAgICAgICAvLyBUT0RPOiBleGFtaW5lLCBpZiBiYWNrZ3JvdW5kIHNob3VsZCBiZSBhbiBhdHRyaWJ1dGUgb2YgQ2FtZXJhIG9yIFZpZXdwb3J0XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRQcm9qZWN0aW9uKCk6IFBST0pFQ1RJT04ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wcm9qZWN0aW9uO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldEJhY2tnb3VuZENvbG9yKCk6IENvbG9yIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYmFja2dyb3VuZENvbG9yO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldEJhY2tncm91bmRFbmFibGVkKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5iYWNrZ3JvdW5kRW5hYmxlZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRBc3BlY3QoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXNwZWN0UmF0aW87XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0RmllbGRPZlZpZXcoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmllbGRPZlZpZXc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0RGlyZWN0aW9uKCk6IEZJRUxEX09GX1ZJRVcge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kaXJlY3Rpb247XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHRoZSBtdWx0aXBsaWthdGlvbiBvZiB0aGUgd29ybGR0cmFuc2Zvcm1hdGlvbiBvZiB0aGUgY2FtZXJhIGNvbnRhaW5lciB3aXRoIHRoZSBwcm9qZWN0aW9uIG1hdHJpeFxyXG4gICAgICAgICAqIEByZXR1cm5zIHRoZSB3b3JsZC1wcm9qZWN0aW9uLW1hdHJpeFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBnZXQgVmlld1Byb2plY3Rpb25NYXRyaXgoKTogTWF0cml4NHg0IHtcclxuICAgICAgICAgICAgbGV0IHdvcmxkOiBNYXRyaXg0eDQgPSB0aGlzLnBpdm90O1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgd29ybGQgPSBNYXRyaXg0eDQuTVVMVElQTElDQVRJT04odGhpcy5nZXRDb250YWluZXIoKS5tdHhXb3JsZCwgdGhpcy5waXZvdCk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKF9lcnJvcikge1xyXG4gICAgICAgICAgICAgICAgLy8gbm8gY29udGFpbmVyIG5vZGUgb3Igbm8gd29ybGQgdHJhbnNmb3JtYXRpb24gZm91bmQgLT4gY29udGludWUgd2l0aCBwaXZvdCBvbmx5XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IHZpZXdNYXRyaXg6IE1hdHJpeDR4NCA9IE1hdHJpeDR4NC5JTlZFUlNJT04od29ybGQpOyBcclxuICAgICAgICAgICAgcmV0dXJuIE1hdHJpeDR4NC5NVUxUSVBMSUNBVElPTih0aGlzLnRyYW5zZm9ybSwgdmlld01hdHJpeCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTZXQgdGhlIGNhbWVyYSB0byBwZXJzcGVjdGl2ZSBwcm9qZWN0aW9uLiBUaGUgd29ybGQgb3JpZ2luIGlzIGluIHRoZSBjZW50ZXIgb2YgdGhlIGNhbnZhc2VsZW1lbnQuXHJcbiAgICAgICAgICogQHBhcmFtIF9hc3BlY3QgVGhlIGFzcGVjdCByYXRpbyBiZXR3ZWVuIHdpZHRoIGFuZCBoZWlnaHQgb2YgcHJvamVjdGlvbnNwYWNlLihEZWZhdWx0ID0gY2FudmFzLmNsaWVudFdpZHRoIC8gY2FudmFzLkNsaWVudEhlaWdodClcclxuICAgICAgICAgKiBAcGFyYW0gX2ZpZWxkT2ZWaWV3IFRoZSBmaWVsZCBvZiB2aWV3IGluIERlZ3JlZXMuIChEZWZhdWx0ID0gNDUpXHJcbiAgICAgICAgICogQHBhcmFtIF9kaXJlY3Rpb24gVGhlIHBsYW5lIG9uIHdoaWNoIHRoZSBmaWVsZE9mVmlldy1BbmdsZSBpcyBnaXZlbiBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgcHJvamVjdENlbnRyYWwoX2FzcGVjdDogbnVtYmVyID0gdGhpcy5hc3BlY3RSYXRpbywgX2ZpZWxkT2ZWaWV3OiBudW1iZXIgPSB0aGlzLmZpZWxkT2ZWaWV3LCBfZGlyZWN0aW9uOiBGSUVMRF9PRl9WSUVXID0gdGhpcy5kaXJlY3Rpb24pOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5hc3BlY3RSYXRpbyA9IF9hc3BlY3Q7XHJcbiAgICAgICAgICAgIHRoaXMuZmllbGRPZlZpZXcgPSBfZmllbGRPZlZpZXc7XHJcbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uID0gX2RpcmVjdGlvbjtcclxuICAgICAgICAgICAgdGhpcy5wcm9qZWN0aW9uID0gUFJPSkVDVElPTi5DRU5UUkFMO1xyXG4gICAgICAgICAgICB0aGlzLnRyYW5zZm9ybSA9IE1hdHJpeDR4NC5QUk9KRUNUSU9OX0NFTlRSQUwoX2FzcGVjdCwgdGhpcy5maWVsZE9mVmlldywgMSwgMjAwMCwgdGhpcy5kaXJlY3Rpb24pOyAvLyBUT0RPOiByZW1vdmUgbWFnaWMgbnVtYmVyc1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTZXQgdGhlIGNhbWVyYSB0byBvcnRob2dyYXBoaWMgcHJvamVjdGlvbi4gVGhlIG9yaWdpbiBpcyBpbiB0aGUgdG9wIGxlZnQgY29ybmVyIG9mIHRoZSBjYW52YXMuXHJcbiAgICAgICAgICogQHBhcmFtIF9sZWZ0IFRoZSBwb3NpdGlvbnZhbHVlIG9mIHRoZSBwcm9qZWN0aW9uc3BhY2UncyBsZWZ0IGJvcmRlci4gKERlZmF1bHQgPSAwKVxyXG4gICAgICAgICAqIEBwYXJhbSBfcmlnaHQgVGhlIHBvc2l0aW9udmFsdWUgb2YgdGhlIHByb2plY3Rpb25zcGFjZSdzIHJpZ2h0IGJvcmRlci4gKERlZmF1bHQgPSBjYW52YXMuY2xpZW50V2lkdGgpXHJcbiAgICAgICAgICogQHBhcmFtIF9ib3R0b20gVGhlIHBvc2l0aW9udmFsdWUgb2YgdGhlIHByb2plY3Rpb25zcGFjZSdzIGJvdHRvbSBib3JkZXIuKERlZmF1bHQgPSBjYW52YXMuY2xpZW50SGVpZ2h0KVxyXG4gICAgICAgICAqIEBwYXJhbSBfdG9wIFRoZSBwb3NpdGlvbnZhbHVlIG9mIHRoZSBwcm9qZWN0aW9uc3BhY2UncyB0b3AgYm9yZGVyLihEZWZhdWx0ID0gMClcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgcHJvamVjdE9ydGhvZ3JhcGhpYyhfbGVmdDogbnVtYmVyID0gMCwgX3JpZ2h0OiBudW1iZXIgPSBSZW5kZXJNYW5hZ2VyLmdldENhbnZhcygpLmNsaWVudFdpZHRoLCBfYm90dG9tOiBudW1iZXIgPSBSZW5kZXJNYW5hZ2VyLmdldENhbnZhcygpLmNsaWVudEhlaWdodCwgX3RvcDogbnVtYmVyID0gMCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLnByb2plY3Rpb24gPSBQUk9KRUNUSU9OLk9SVEhPR1JBUEhJQztcclxuICAgICAgICAgICAgdGhpcy50cmFuc2Zvcm0gPSBNYXRyaXg0eDQuUFJPSkVDVElPTl9PUlRIT0dSQVBISUMoX2xlZnQsIF9yaWdodCwgX2JvdHRvbSwgX3RvcCwgNDAwLCAtNDAwKTsgLy8gVE9ETzogZXhhbWluZSBtYWdpYyBudW1iZXJzIVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJuIHRoZSBjYWxjdWxhdGVkIG5vcm1lZCBkaW1lbnNpb24gb2YgdGhlIHByb2plY3Rpb24gc3BhY2VcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0UHJvamVjdGlvblJlY3RhbmdsZSgpOiBSZWN0YW5nbGUge1xyXG4gICAgICAgICAgICBsZXQgdGFuRm92OiBudW1iZXIgPSBNYXRoLnRhbihNYXRoLlBJICogdGhpcy5maWVsZE9mVmlldyAvIDM2MCk7IC8vIEhhbGYgb2YgdGhlIGFuZ2xlLCB0byBjYWxjdWxhdGUgZGltZW5zaW9uIGZyb20gdGhlIGNlbnRlciAtPiByaWdodCBhbmdsZVxyXG4gICAgICAgICAgICBsZXQgdGFuSG9yaXpvbnRhbDogbnVtYmVyID0gMDtcclxuICAgICAgICAgICAgbGV0IHRhblZlcnRpY2FsOiBudW1iZXIgPSAwO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuZGlyZWN0aW9uID09IEZJRUxEX09GX1ZJRVcuRElBR09OQUwpIHtcclxuICAgICAgICAgICAgICAgIGxldCBhc3BlY3Q6IG51bWJlciA9IE1hdGguc3FydCh0aGlzLmFzcGVjdFJhdGlvKTtcclxuICAgICAgICAgICAgICAgIHRhbkhvcml6b250YWwgPSB0YW5Gb3YgKiBhc3BlY3Q7XHJcbiAgICAgICAgICAgICAgICB0YW5WZXJ0aWNhbCA9IHRhbkZvdiAvIGFzcGVjdDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICh0aGlzLmRpcmVjdGlvbiA9PSBGSUVMRF9PRl9WSUVXLlZFUlRJQ0FMKSB7XHJcbiAgICAgICAgICAgICAgICB0YW5WZXJ0aWNhbCA9IHRhbkZvdjtcclxuICAgICAgICAgICAgICAgIHRhbkhvcml6b250YWwgPSB0YW5WZXJ0aWNhbCAqIHRoaXMuYXNwZWN0UmF0aW87XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7Ly9GT1ZfRElSRUNUSU9OLkhPUklaT05UQUxcclxuICAgICAgICAgICAgICAgIHRhbkhvcml6b250YWwgPSB0YW5Gb3Y7XHJcbiAgICAgICAgICAgICAgICB0YW5WZXJ0aWNhbCA9IHRhbkhvcml6b250YWwgLyB0aGlzLmFzcGVjdFJhdGlvO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gUmVjdGFuZ2xlLkdFVCgwLCAwLCB0YW5Ib3Jpem9udGFsICogMiwgdGFuVmVydGljYWwgKiAyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vI3JlZ2lvbiBUcmFuc2ZlclxyXG4gICAgICAgIHB1YmxpYyBzZXJpYWxpemUoKTogU2VyaWFsaXphdGlvbiB7XHJcbiAgICAgICAgICAgIGxldCBzZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uID0ge1xyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiB0aGlzLmJhY2tncm91bmRDb2xvcixcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRFbmFibGVkOiB0aGlzLmJhY2tncm91bmRFbmFibGVkLFxyXG4gICAgICAgICAgICAgICAgcHJvamVjdGlvbjogdGhpcy5wcm9qZWN0aW9uLFxyXG4gICAgICAgICAgICAgICAgZmllbGRPZlZpZXc6IHRoaXMuZmllbGRPZlZpZXcsXHJcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb246IHRoaXMuZGlyZWN0aW9uLFxyXG4gICAgICAgICAgICAgICAgYXNwZWN0OiB0aGlzLmFzcGVjdFJhdGlvLFxyXG4gICAgICAgICAgICAgICAgcGl2b3Q6IHRoaXMucGl2b3Quc2VyaWFsaXplKCksXHJcbiAgICAgICAgICAgICAgICBbc3VwZXIuY29uc3RydWN0b3IubmFtZV06IHN1cGVyLnNlcmlhbGl6ZSgpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHJldHVybiBzZXJpYWxpemF0aW9uO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uKTogU2VyaWFsaXphYmxlIHtcclxuICAgICAgICAgICAgdGhpcy5iYWNrZ3JvdW5kQ29sb3IgPSBfc2VyaWFsaXphdGlvbi5iYWNrZ3JvdW5kQ29sb3I7XHJcbiAgICAgICAgICAgIHRoaXMuYmFja2dyb3VuZEVuYWJsZWQgPSBfc2VyaWFsaXphdGlvbi5iYWNrZ3JvdW5kRW5hYmxlZDtcclxuICAgICAgICAgICAgdGhpcy5wcm9qZWN0aW9uID0gX3NlcmlhbGl6YXRpb24ucHJvamVjdGlvbjtcclxuICAgICAgICAgICAgdGhpcy5maWVsZE9mVmlldyA9IF9zZXJpYWxpemF0aW9uLmZpZWxkT2ZWaWV3O1xyXG4gICAgICAgICAgICB0aGlzLmFzcGVjdFJhdGlvID0gX3NlcmlhbGl6YXRpb24uYXNwZWN0O1xyXG4gICAgICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IF9zZXJpYWxpemF0aW9uLmRpcmVjdGlvbjtcclxuICAgICAgICAgICAgdGhpcy5waXZvdC5kZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbi5waXZvdCk7XHJcbiAgICAgICAgICAgIHN1cGVyLmRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uW3N1cGVyLmNvbnN0cnVjdG9yLm5hbWVdKTtcclxuICAgICAgICAgICAgc3dpdGNoICh0aGlzLnByb2plY3Rpb24pIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgUFJPSkVDVElPTi5PUlRIT0dSQVBISUM6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9qZWN0T3J0aG9ncmFwaGljKCk7IC8vIFRPRE86IHNlcmlhbGl6ZSBhbmQgZGVzZXJpYWxpemUgcGFyYW1ldGVyc1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBQUk9KRUNUSU9OLkNFTlRSQUw6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9qZWN0Q2VudHJhbCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldE11dGF0b3JBdHRyaWJ1dGVUeXBlcyhfbXV0YXRvcjogTXV0YXRvcik6IE11dGF0b3JBdHRyaWJ1dGVUeXBlcyB7XHJcbiAgICAgICAgICAgIGxldCB0eXBlczogTXV0YXRvckF0dHJpYnV0ZVR5cGVzID0gc3VwZXIuZ2V0TXV0YXRvckF0dHJpYnV0ZVR5cGVzKF9tdXRhdG9yKTtcclxuICAgICAgICAgICAgaWYgKHR5cGVzLmRpcmVjdGlvbilcclxuICAgICAgICAgICAgICAgIHR5cGVzLmRpcmVjdGlvbiA9IEZJRUxEX09GX1ZJRVc7XHJcbiAgICAgICAgICAgIGlmICh0eXBlcy5wcm9qZWN0aW9uKVxyXG4gICAgICAgICAgICAgICAgdHlwZXMucHJvamVjdGlvbiA9IFBST0pFQ1RJT047XHJcbiAgICAgICAgICAgIHJldHVybiB0eXBlcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBtdXRhdGUoX211dGF0b3I6IE11dGF0b3IpOiB2b2lkIHtcclxuICAgICAgICAgICAgc3VwZXIubXV0YXRlKF9tdXRhdG9yKTtcclxuXHJcbiAgICAgICAgICAgIHN3aXRjaCAodGhpcy5wcm9qZWN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFBST0pFQ1RJT04uQ0VOVFJBTDpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2plY3RDZW50cmFsKHRoaXMuYXNwZWN0UmF0aW8sIHRoaXMuZmllbGRPZlZpZXcsIHRoaXMuZGlyZWN0aW9uKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJvdGVjdGVkIHJlZHVjZU11dGF0b3IoX211dGF0b3I6IE11dGF0b3IpOiB2b2lkIHtcclxuICAgICAgICAgICAgZGVsZXRlIF9tdXRhdG9yLnRyYW5zZm9ybTtcclxuICAgICAgICAgICAgc3VwZXIucmVkdWNlTXV0YXRvcihfbXV0YXRvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vI2VuZHJlZ2lvblxyXG4gICAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIEF0dGFjaGVzIGEgW1tMaWdodF1dIHRvIHRoZSBub2RlXHJcbiAgICAgKiBAYXV0aG9ycyBKaXJrYSBEZWxsJ09yby1GcmllZGwsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgQ29tcG9uZW50TGlnaHQgZXh0ZW5kcyBDb21wb25lbnQge1xyXG4gICAgICAgIHByaXZhdGUgbGlnaHQ6IExpZ2h0O1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcihfbGlnaHQ6IExpZ2h0ID0gbnVsbCkge1xyXG4gICAgICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgICAgICB0aGlzLnNpbmdsZXRvbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmxpZ2h0ID0gX2xpZ2h0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldExpZ2h0KCk6IExpZ2h0IHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubGlnaHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIEF0dGFjaGVzIGEgW1tNYXRlcmlhbF1dIHRvIHRoZSBub2RlXHJcbiAgICAgKiBAYXV0aG9ycyBKaXJrYSBEZWxsJ09yby1GcmllZGwsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgQ29tcG9uZW50TWF0ZXJpYWwgZXh0ZW5kcyBDb21wb25lbnQge1xyXG4gICAgICAgIHB1YmxpYyBtYXRlcmlhbDogTWF0ZXJpYWw7XHJcblxyXG4gICAgICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihfbWF0ZXJpYWw6IE1hdGVyaWFsID0gbnVsbCkge1xyXG4gICAgICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgICAgICB0aGlzLm1hdGVyaWFsID0gX21hdGVyaWFsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8jcmVnaW9uIFRyYW5zZmVyXHJcbiAgICAgICAgcHVibGljIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemF0aW9uIHtcclxuICAgICAgICAgICAgbGV0IHNlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb247XHJcbiAgICAgICAgICAgIC8qIGF0IHRoaXMgcG9pbnQgb2YgdGltZSwgc2VyaWFsaXphdGlvbiBhcyByZXNvdXJjZSBhbmQgYXMgaW5saW5lIG9iamVjdCBpcyBwb3NzaWJsZS4gVE9ETzogY2hlY2sgaWYgaW5saW5lIGJlY29tZXMgb2Jzb2xldGUgKi9cclxuICAgICAgICAgICAgbGV0IGlkTWF0ZXJpYWw6IHN0cmluZyA9IHRoaXMubWF0ZXJpYWwuaWRSZXNvdXJjZTtcclxuICAgICAgICAgICAgaWYgKGlkTWF0ZXJpYWwpXHJcbiAgICAgICAgICAgICAgICBzZXJpYWxpemF0aW9uID0geyBpZE1hdGVyaWFsOiBpZE1hdGVyaWFsIH07XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHNlcmlhbGl6YXRpb24gPSB7IG1hdGVyaWFsOiBTZXJpYWxpemVyLnNlcmlhbGl6ZSh0aGlzLm1hdGVyaWFsKSB9O1xyXG5cclxuICAgICAgICAgICAgc2VyaWFsaXphdGlvbltzdXBlci5jb25zdHJ1Y3Rvci5uYW1lXSA9IHN1cGVyLnNlcmlhbGl6ZSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsaXphdGlvbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHVibGljIGRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uKTogU2VyaWFsaXphYmxlIHtcclxuICAgICAgICAgICAgbGV0IG1hdGVyaWFsOiBNYXRlcmlhbDtcclxuICAgICAgICAgICAgaWYgKF9zZXJpYWxpemF0aW9uLmlkTWF0ZXJpYWwpXHJcbiAgICAgICAgICAgICAgICBtYXRlcmlhbCA9IDxNYXRlcmlhbD5SZXNvdXJjZU1hbmFnZXIuZ2V0KF9zZXJpYWxpemF0aW9uLmlkTWF0ZXJpYWwpO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICBtYXRlcmlhbCA9IDxNYXRlcmlhbD5TZXJpYWxpemVyLmRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uLm1hdGVyaWFsKTtcclxuICAgICAgICAgICAgdGhpcy5tYXRlcmlhbCA9IG1hdGVyaWFsO1xyXG4gICAgICAgICAgICBzdXBlci5kZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbltzdXBlci5jb25zdHJ1Y3Rvci5uYW1lXSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyNlbmRyZWdpb25cclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBBdHRhY2hlcyBhIFtbTWVzaF1dIHRvIHRoZSBub2RlXHJcbiAgICAgKiBAYXV0aG9ycyBKaXJrYSBEZWxsJ09yby1GcmllZGwsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgQ29tcG9uZW50TWVzaCBleHRlbmRzIENvbXBvbmVudCB7XHJcbiAgICAgICAgcHVibGljIHBpdm90OiBNYXRyaXg0eDQgPSBNYXRyaXg0eDQuSURFTlRJVFk7XHJcbiAgICAgICAgcHVibGljIG1lc2g6IE1lc2ggPSBudWxsO1xyXG5cclxuICAgICAgICBwdWJsaWMgY29uc3RydWN0b3IoX21lc2g6IE1lc2ggPSBudWxsKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMubWVzaCA9IF9tZXNoO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8jcmVnaW9uIFRyYW5zZmVyXHJcbiAgICAgICAgcHVibGljIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemF0aW9uIHtcclxuICAgICAgICAgICAgbGV0IHNlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb247XHJcbiAgICAgICAgICAgIC8qIGF0IHRoaXMgcG9pbnQgb2YgdGltZSwgc2VyaWFsaXphdGlvbiBhcyByZXNvdXJjZSBhbmQgYXMgaW5saW5lIG9iamVjdCBpcyBwb3NzaWJsZS4gVE9ETzogY2hlY2sgaWYgaW5saW5lIGJlY29tZXMgb2Jzb2xldGUgKi9cclxuICAgICAgICAgICAgbGV0IGlkTWVzaDogc3RyaW5nID0gdGhpcy5tZXNoLmlkUmVzb3VyY2U7XHJcbiAgICAgICAgICAgIGlmIChpZE1lc2gpXHJcbiAgICAgICAgICAgICAgICBzZXJpYWxpemF0aW9uID0geyBpZE1lc2g6IGlkTWVzaCB9O1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICBzZXJpYWxpemF0aW9uID0geyBtZXNoOiBTZXJpYWxpemVyLnNlcmlhbGl6ZSh0aGlzLm1lc2gpIH07XHJcblxyXG4gICAgICAgICAgICBzZXJpYWxpemF0aW9uLnBpdm90ID0gdGhpcy5waXZvdC5zZXJpYWxpemUoKTtcclxuICAgICAgICAgICAgc2VyaWFsaXphdGlvbltzdXBlci5jb25zdHJ1Y3Rvci5uYW1lXSA9IHN1cGVyLnNlcmlhbGl6ZSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsaXphdGlvbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBkZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbik6IFNlcmlhbGl6YWJsZSB7XHJcbiAgICAgICAgICAgIGxldCBtZXNoOiBNZXNoO1xyXG4gICAgICAgICAgICBpZiAoX3NlcmlhbGl6YXRpb24uaWRNZXNoKVxyXG4gICAgICAgICAgICAgICAgbWVzaCA9IDxNZXNoPlJlc291cmNlTWFuYWdlci5nZXQoX3NlcmlhbGl6YXRpb24uaWRNZXNoKTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgbWVzaCA9IDxNZXNoPlNlcmlhbGl6ZXIuZGVzZXJpYWxpemUoX3NlcmlhbGl6YXRpb24ubWVzaCk7XHJcbiAgICAgICAgICAgIHRoaXMubWVzaCA9IG1lc2g7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnBpdm90LmRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uLnBpdm90KTtcclxuICAgICAgICAgICAgc3VwZXIuZGVzZXJpYWxpemUoX3NlcmlhbGl6YXRpb25bc3VwZXIuY29uc3RydWN0b3IubmFtZV0pO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8jZW5kcmVnaW9uXHJcbiAgICB9XHJcbn1cclxuIiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIEJhc2UgY2xhc3MgZm9yIHNjcmlwdHMgdGhlIHVzZXIgd3JpdGVzXHJcbiAgICAgKiBAYXV0aG9ycyBKaXJrYSBEZWxsJ09yby1GcmllZGwsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgQ29tcG9uZW50U2NyaXB0IGV4dGVuZHMgQ29tcG9uZW50IHtcclxuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5zaW5nbGV0b24gPSBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzZXJpYWxpemUoKTogU2VyaWFsaXphdGlvbiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE11dGF0b3IoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBkZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbik6IFNlcmlhbGl6YWJsZSB7XHJcbiAgICAgICAgICAgIHRoaXMubXV0YXRlKF9zZXJpYWxpemF0aW9uKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIEF0dGFjaGVzIGEgdHJhbnNmb3JtLVtbTWF0cml4NHg0XV0gdG8gdGhlIG5vZGUsIG1vdmluZywgc2NhbGluZyBhbmQgcm90YXRpbmcgaXQgaW4gc3BhY2UgcmVsYXRpdmUgdG8gaXRzIHBhcmVudC5cclxuICAgICAqIEBhdXRob3JzIEppcmthIERlbGwnT3JvLUZyaWVkbCwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBDb21wb25lbnRUcmFuc2Zvcm0gZXh0ZW5kcyBDb21wb25lbnQge1xyXG4gICAgICAgIHB1YmxpYyBsb2NhbDogTWF0cml4NHg0O1xyXG5cclxuICAgICAgICBwdWJsaWMgY29uc3RydWN0b3IoX21hdHJpeDogTWF0cml4NHg0ID0gTWF0cml4NHg0LklERU5USVRZKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMubG9jYWwgPSBfbWF0cml4O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8jcmVnaW9uIFRyYW5zZmVyXHJcbiAgICAgICAgcHVibGljIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemF0aW9uIHtcclxuICAgICAgICAgICAgbGV0IHNlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24gPSB7XHJcbiAgICAgICAgICAgICAgICBsb2NhbDogdGhpcy5sb2NhbC5zZXJpYWxpemUoKSxcclxuICAgICAgICAgICAgICAgIFtzdXBlci5jb25zdHJ1Y3Rvci5uYW1lXTogc3VwZXIuc2VyaWFsaXplKClcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcmV0dXJuIHNlcmlhbGl6YXRpb247XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHB1YmxpYyBkZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbik6IFNlcmlhbGl6YWJsZSB7XHJcbiAgICAgICAgICAgIHN1cGVyLmRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uW3N1cGVyLmNvbnN0cnVjdG9yLm5hbWVdKTtcclxuICAgICAgICAgICAgdGhpcy5sb2NhbC5kZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbi5sb2NhbCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gcHVibGljIG11dGF0ZShfbXV0YXRvcjogTXV0YXRvcik6IHZvaWQge1xyXG4gICAgICAgIC8vICAgICB0aGlzLmxvY2FsLm11dGF0ZShfbXV0YXRvcik7XHJcbiAgICAgICAgLy8gfVxyXG4gICAgICAgIC8vIHB1YmxpYyBnZXRNdXRhdG9yKCk6IE11dGF0b3IgeyBcclxuICAgICAgICAvLyAgICAgcmV0dXJuIHRoaXMubG9jYWwuZ2V0TXV0YXRvcigpO1xyXG4gICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgLy8gcHVibGljIGdldE11dGF0b3JBdHRyaWJ1dGVUeXBlcyhfbXV0YXRvcjogTXV0YXRvcik6IE11dGF0b3JBdHRyaWJ1dGVUeXBlcyB7XHJcbiAgICAgICAgLy8gICAgIGxldCB0eXBlczogTXV0YXRvckF0dHJpYnV0ZVR5cGVzID0gdGhpcy5sb2NhbC5nZXRNdXRhdG9yQXR0cmlidXRlVHlwZXMoX211dGF0b3IpO1xyXG4gICAgICAgIC8vICAgICByZXR1cm4gdHlwZXM7XHJcbiAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICBwcm90ZWN0ZWQgcmVkdWNlTXV0YXRvcihfbXV0YXRvcjogTXV0YXRvcik6IHZvaWQge1xyXG4gICAgICAgICAgICBkZWxldGUgX211dGF0b3Iud29ybGQ7XHJcbiAgICAgICAgICAgIHN1cGVyLnJlZHVjZU11dGF0b3IoX211dGF0b3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyNlbmRyZWdpb25cclxuICAgIH1cclxufVxyXG4iLCIvLyA8cmVmZXJlbmNlIHBhdGg9XCJEZWJ1Z0FsZXJ0LnRzXCIvPlxyXG5uYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGZpbHRlcnMgY29ycmVzcG9uZGluZyB0byBkZWJ1ZyBhY3Rpdml0aWVzLCBtb3JlIHRvIGNvbWVcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGVudW0gREVCVUdfRklMVEVSIHtcclxuICAgICAgICBOT05FID0gMHgwMCxcclxuICAgICAgICBJTkZPID0gMHgwMSxcclxuICAgICAgICBMT0cgPSAweDAyLFxyXG4gICAgICAgIFdBUk4gPSAweDA0LFxyXG4gICAgICAgIEVSUk9SID0gMHgwOCxcclxuICAgICAgICBBTEwgPSBJTkZPIHwgTE9HIHwgV0FSTiB8IEVSUk9SXHJcbiAgICB9XHJcbiAgICAvLyByZW1pbmVzY2VudCBvZiBhbiBlYXJseSBhdHRlbXB0IG9mIERlYnVnXHJcbiAgICAvLyBleHBvcnQgZW51bSBERUJVR19UQVJHRVQge1xyXG4gICAgLy8gICAgIENPTlNPTEUgPSBcImNvbnNvbGVcIixcclxuICAgIC8vICAgICBBTEVSVCA9IFwiYWxlcnRcIixcclxuICAgIC8vICAgICBURVhUQVJFQSA9IFwidGV4dGFyZWFcIixcclxuICAgIC8vICAgICBESUFMT0cgPSBcImRpYWxvZ1wiLFxyXG4gICAgLy8gICAgIEZJTEUgPSBcImZpbGVcIixcclxuICAgIC8vICAgICBTRVJWRVIgPSBcInNlcnZlclwiXHJcbiAgICAvLyB9XHJcblxyXG4gICAgLy8gZXhwb3J0IGludGVyZmFjZSBNYXBEZWJ1Z1RhcmdldFRvRnVuY3Rpb24geyBbdGFyZ2V0OiBzdHJpbmddOiBGdW5jdGlvbjsgfVxyXG4gICAgZXhwb3J0IHR5cGUgTWFwRGVidWdUYXJnZXRUb0RlbGVnYXRlID0gTWFwPERlYnVnVGFyZ2V0LCBGdW5jdGlvbj47XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIE1hcERlYnVnRmlsdGVyVG9EZWxlZ2F0ZSB7IFtmaWx0ZXI6IG51bWJlcl06IEZ1bmN0aW9uOyB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogQmFzZSBjbGFzcyBmb3IgdGhlIGRpZmZlcmVudCBEZWJ1Z1RhcmdldHMsIG1haW5seSBmb3IgdGVjaG5pY2FsIHB1cnBvc2Ugb2YgaW5oZXJpdGFuY2VcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGFic3RyYWN0IGNsYXNzIERlYnVnVGFyZ2V0IHtcclxuICAgICAgICBwdWJsaWMgZGVsZWdhdGVzOiBNYXBEZWJ1Z0ZpbHRlclRvRGVsZWdhdGU7XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBtZXJnZUFyZ3VtZW50cyhfbWVzc2FnZTogT2JqZWN0LCAuLi5fYXJnczogT2JqZWN0W10pOiBzdHJpbmcge1xyXG4gICAgICAgICAgICBsZXQgb3V0OiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeShfbWVzc2FnZSk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGFyZyBvZiBfYXJncylcclxuICAgICAgICAgICAgICAgIG91dCArPSBcIlxcblwiICsgSlNPTi5zdHJpbmdpZnkoYXJnLCBudWxsLCAyKTtcclxuICAgICAgICAgICAgcmV0dXJuIG91dDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiRGVidWdUYXJnZXQudHNcIi8+XHJcbm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBSb3V0aW5nIHRvIHRoZSBhbGVydCBib3hcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIERlYnVnQWxlcnQgZXh0ZW5kcyBEZWJ1Z1RhcmdldCB7XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBkZWxlZ2F0ZXM6IE1hcERlYnVnRmlsdGVyVG9EZWxlZ2F0ZSA9IHtcclxuICAgICAgICAgICAgW0RFQlVHX0ZJTFRFUi5JTkZPXTogRGVidWdBbGVydC5jcmVhdGVEZWxlZ2F0ZShcIkluZm9cIiksXHJcbiAgICAgICAgICAgIFtERUJVR19GSUxURVIuTE9HXTogRGVidWdBbGVydC5jcmVhdGVEZWxlZ2F0ZShcIkxvZ1wiKSxcclxuICAgICAgICAgICAgW0RFQlVHX0ZJTFRFUi5XQVJOXTogRGVidWdBbGVydC5jcmVhdGVEZWxlZ2F0ZShcIldhcm5cIiksXHJcbiAgICAgICAgICAgIFtERUJVR19GSUxURVIuRVJST1JdOiBEZWJ1Z0FsZXJ0LmNyZWF0ZURlbGVnYXRlKFwiRXJyb3JcIilcclxuICAgICAgICB9O1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlRGVsZWdhdGUoX2hlYWRsaW5lOiBzdHJpbmcpOiBGdW5jdGlvbiB7XHJcbiAgICAgICAgICAgIGxldCBkZWxlZ2F0ZTogRnVuY3Rpb24gPSBmdW5jdGlvbiAoX21lc3NhZ2U6IE9iamVjdCwgLi4uX2FyZ3M6IE9iamVjdFtdKTogdm9pZCB7XHJcbiAgICAgICAgICAgICAgICBsZXQgb3V0OiBzdHJpbmcgPSBfaGVhZGxpbmUgKyBcIlxcblxcblwiICsgRGVidWdUYXJnZXQubWVyZ2VBcmd1bWVudHMoX21lc3NhZ2UsIC4uLl9hcmdzKTtcclxuICAgICAgICAgICAgICAgIGFsZXJ0KG91dCk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHJldHVybiBkZWxlZ2F0ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiRGVidWdUYXJnZXQudHNcIi8+XHJcbm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBSb3V0aW5nIHRvIHRoZSBzdGFuZGFyZC1jb25zb2xlXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBEZWJ1Z0NvbnNvbGUgZXh0ZW5kcyBEZWJ1Z1RhcmdldCB7XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBkZWxlZ2F0ZXM6IE1hcERlYnVnRmlsdGVyVG9EZWxlZ2F0ZSA9IHtcclxuICAgICAgICAgICAgW0RFQlVHX0ZJTFRFUi5JTkZPXTogY29uc29sZS5pbmZvLFxyXG4gICAgICAgICAgICBbREVCVUdfRklMVEVSLkxPR106IGNvbnNvbGUubG9nLFxyXG4gICAgICAgICAgICBbREVCVUdfRklMVEVSLldBUk5dOiBjb25zb2xlLndhcm4sXHJcbiAgICAgICAgICAgIFtERUJVR19GSUxURVIuRVJST1JdOiBjb25zb2xlLmVycm9yXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJEZWJ1Z0ludGVyZmFjZXMudHNcIi8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJEZWJ1Z0FsZXJ0LnRzXCIvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiRGVidWdDb25zb2xlLnRzXCIvPlxyXG5uYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIERlYnVnLUNsYXNzIG9mZmVycyBmdW5jdGlvbnMga25vd24gZnJvbSB0aGUgY29uc29sZS1vYmplY3QgYW5kIGFkZGl0aW9ucywgXHJcbiAgICAgKiByb3V0aW5nIHRoZSBpbmZvcm1hdGlvbiB0byB2YXJpb3VzIFtbRGVidWdUYXJnZXRzXV0gdGhhdCBjYW4gYmUgZWFzaWx5IGRlZmluZWQgYnkgdGhlIGRldmVsb3BlcnMgYW5kIHJlZ2lzdGVyZCBieSB1c2Vyc1xyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgRGVidWcge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEZvciBlYWNoIHNldCBmaWx0ZXIsIHRoaXMgYXNzb2NpYXRpdmUgYXJyYXkga2VlcHMgcmVmZXJlbmNlcyB0byB0aGUgcmVnaXN0ZXJlZCBkZWxlZ2F0ZSBmdW5jdGlvbnMgb2YgdGhlIGNob3NlbiBbW0RlYnVnVGFyZ2V0c11dXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgLy8gVE9ETzogaW1wbGVtZW50IGFub255bW91cyBmdW5jdGlvbiBzZXR0aW5nIHVwIGFsbCBmaWx0ZXJzXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgZGVsZWdhdGVzOiB7IFtmaWx0ZXI6IG51bWJlcl06IE1hcERlYnVnVGFyZ2V0VG9EZWxlZ2F0ZSB9ID0ge1xyXG4gICAgICAgICAgICBbREVCVUdfRklMVEVSLklORk9dOiBuZXcgTWFwKFtbRGVidWdDb25zb2xlLCBEZWJ1Z0NvbnNvbGUuZGVsZWdhdGVzW0RFQlVHX0ZJTFRFUi5JTkZPXV1dKSxcclxuICAgICAgICAgICAgW0RFQlVHX0ZJTFRFUi5MT0ddOiBuZXcgTWFwKFtbRGVidWdDb25zb2xlLCBEZWJ1Z0NvbnNvbGUuZGVsZWdhdGVzW0RFQlVHX0ZJTFRFUi5MT0ddXV0pLFxyXG4gICAgICAgICAgICBbREVCVUdfRklMVEVSLldBUk5dOiBuZXcgTWFwKFtbRGVidWdDb25zb2xlLCBEZWJ1Z0NvbnNvbGUuZGVsZWdhdGVzW0RFQlVHX0ZJTFRFUi5XQVJOXV1dKSxcclxuICAgICAgICAgICAgW0RFQlVHX0ZJTFRFUi5FUlJPUl06IG5ldyBNYXAoW1tEZWJ1Z0NvbnNvbGUsIERlYnVnQ29uc29sZS5kZWxlZ2F0ZXNbREVCVUdfRklMVEVSLkVSUk9SXV1dKVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERlLSAvIEFjdGl2YXRlIGEgZmlsdGVyIGZvciB0aGUgZ2l2ZW4gRGVidWdUYXJnZXQuIFxyXG4gICAgICAgICAqIEBwYXJhbSBfdGFyZ2V0XHJcbiAgICAgICAgICogQHBhcmFtIF9maWx0ZXIgXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBzZXRGaWx0ZXIoX3RhcmdldDogRGVidWdUYXJnZXQsIF9maWx0ZXI6IERFQlVHX0ZJTFRFUik6IHZvaWQge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBmaWx0ZXIgaW4gRGVidWcuZGVsZWdhdGVzKVxyXG4gICAgICAgICAgICAgICAgRGVidWcuZGVsZWdhdGVzW2ZpbHRlcl0uZGVsZXRlKF90YXJnZXQpO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgZmlsdGVyIGluIERFQlVHX0ZJTFRFUikge1xyXG4gICAgICAgICAgICAgICAgbGV0IHBhcnNlZDogbnVtYmVyID0gcGFyc2VJbnQoZmlsdGVyKTtcclxuICAgICAgICAgICAgICAgIGlmIChwYXJzZWQgPT0gREVCVUdfRklMVEVSLkFMTClcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGlmIChfZmlsdGVyICYgcGFyc2VkKVxyXG4gICAgICAgICAgICAgICAgICAgIERlYnVnLmRlbGVnYXRlc1twYXJzZWRdLnNldChfdGFyZ2V0LCBfdGFyZ2V0LmRlbGVnYXRlc1twYXJzZWRdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGVidWcgZnVuY3Rpb24gdG8gYmUgaW1wbGVtZW50ZWQgYnkgdGhlIERlYnVnVGFyZ2V0LiBcclxuICAgICAgICAgKiBpbmZvKC4uLikgZGlzcGxheXMgYWRkaXRpb25hbCBpbmZvcm1hdGlvbiB3aXRoIGxvdyBwcmlvcml0eVxyXG4gICAgICAgICAqIEBwYXJhbSBfbWVzc2FnZVxyXG4gICAgICAgICAqIEBwYXJhbSBfYXJncyBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGluZm8oX21lc3NhZ2U6IE9iamVjdCwgLi4uX2FyZ3M6IE9iamVjdFtdKTogdm9pZCB7XHJcbiAgICAgICAgICAgIERlYnVnLmRlbGVnYXRlKERFQlVHX0ZJTFRFUi5JTkZPLCBfbWVzc2FnZSwgX2FyZ3MpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZWJ1ZyBmdW5jdGlvbiB0byBiZSBpbXBsZW1lbnRlZCBieSB0aGUgRGVidWdUYXJnZXQuIFxyXG4gICAgICAgICAqIGxvZyguLi4pIGRpc3BsYXlzIGluZm9ybWF0aW9uIHdpdGggbWVkaXVtIHByaW9yaXR5XHJcbiAgICAgICAgICogQHBhcmFtIF9tZXNzYWdlXHJcbiAgICAgICAgICogQHBhcmFtIF9hcmdzIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgbG9nKF9tZXNzYWdlOiBPYmplY3QsIC4uLl9hcmdzOiBPYmplY3RbXSk6IHZvaWQge1xyXG4gICAgICAgICAgICBEZWJ1Zy5kZWxlZ2F0ZShERUJVR19GSUxURVIuTE9HLCBfbWVzc2FnZSwgX2FyZ3MpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZWJ1ZyBmdW5jdGlvbiB0byBiZSBpbXBsZW1lbnRlZCBieSB0aGUgRGVidWdUYXJnZXQuIFxyXG4gICAgICAgICAqIHdhcm4oLi4uKSBkaXNwbGF5cyBpbmZvcm1hdGlvbiBhYm91dCBub24tY29uZm9ybWl0aWVzIGluIHVzYWdlLCB3aGljaCBpcyBlbXBoYXNpemVkIGUuZy4gYnkgY29sb3JcclxuICAgICAgICAgKiBAcGFyYW0gX21lc3NhZ2VcclxuICAgICAgICAgKiBAcGFyYW0gX2FyZ3MgXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyB3YXJuKF9tZXNzYWdlOiBPYmplY3QsIC4uLl9hcmdzOiBPYmplY3RbXSk6IHZvaWQge1xyXG4gICAgICAgICAgICBEZWJ1Zy5kZWxlZ2F0ZShERUJVR19GSUxURVIuV0FSTiwgX21lc3NhZ2UsIF9hcmdzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGVidWcgZnVuY3Rpb24gdG8gYmUgaW1wbGVtZW50ZWQgYnkgdGhlIERlYnVnVGFyZ2V0LiBcclxuICAgICAgICAgKiBlcnJvciguLi4pIGRpc3BsYXlzIGNyaXRpY2FsIGluZm9ybWF0aW9uIGFib3V0IGZhaWx1cmVzLCB3aGljaCBpcyBlbXBoYXNpemVkIGUuZy4gYnkgY29sb3JcclxuICAgICAgICAgKiBAcGFyYW0gX21lc3NhZ2VcclxuICAgICAgICAgKiBAcGFyYW0gX2FyZ3MgXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBlcnJvcihfbWVzc2FnZTogT2JqZWN0LCAuLi5fYXJnczogT2JqZWN0W10pOiB2b2lkIHtcclxuICAgICAgICAgICAgRGVidWcuZGVsZWdhdGUoREVCVUdfRklMVEVSLkVSUk9SLCBfbWVzc2FnZSwgX2FyZ3MpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBMb29rdXAgYWxsIGRlbGVnYXRlcyByZWdpc3RlcmVkIHRvIHRoZSBmaWx0ZXIgYW5kIGNhbGwgdGhlbSB1c2luZyB0aGUgZ2l2ZW4gYXJndW1lbnRzXHJcbiAgICAgICAgICogQHBhcmFtIF9maWx0ZXIgXHJcbiAgICAgICAgICogQHBhcmFtIF9tZXNzYWdlIFxyXG4gICAgICAgICAqIEBwYXJhbSBfYXJncyBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBkZWxlZ2F0ZShfZmlsdGVyOiBERUJVR19GSUxURVIsIF9tZXNzYWdlOiBPYmplY3QsIF9hcmdzOiBPYmplY3RbXSk6IHZvaWQge1xyXG4gICAgICAgICAgICBsZXQgZGVsZWdhdGVzOiBNYXBEZWJ1Z1RhcmdldFRvRGVsZWdhdGUgPSBEZWJ1Zy5kZWxlZ2F0ZXNbX2ZpbHRlcl07XHJcbiAgICAgICAgICAgIGZvciAobGV0IGRlbGVnYXRlIG9mIGRlbGVnYXRlcy52YWx1ZXMoKSlcclxuICAgICAgICAgICAgICAgIGlmIChfYXJncy5sZW5ndGggPiAwKVxyXG4gICAgICAgICAgICAgICAgICAgIGRlbGVnYXRlKF9tZXNzYWdlLCAuLi5fYXJncyk7XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZWdhdGUoX21lc3NhZ2UpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJEZWJ1Z1RhcmdldC50c1wiLz5cclxubmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIFJvdXRpbmcgdG8gYSBIVE1MRGlhbG9nRWxlbWVudFxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgRGVidWdEaWFsb2cgZXh0ZW5kcyBEZWJ1Z1RhcmdldCB7XHJcbiAgICAgICAgLy8gVE9ETzogY2hlY2tvdXQgSFRNTERpYWxvZ0VsZW1lbnQ7ICEhIVxyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIkRlYnVnVGFyZ2V0LnRzXCIvPlxyXG5uYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogUm91dGUgdG8gYW4gSFRNTFRleHRBcmVhLCBtYXkgYmUgb2Jzb2xldGUgd2hlbiB1c2luZyBIVE1MRGlhbG9nRWxlbWVudFxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgRGVidWdUZXh0QXJlYSBleHRlbmRzIERlYnVnVGFyZ2V0IHtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIHRleHRBcmVhOiBIVE1MVGV4dEFyZWFFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRleHRhcmVhXCIpO1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZGVsZWdhdGVzOiBNYXBEZWJ1Z0ZpbHRlclRvRGVsZWdhdGUgPSB7XHJcbiAgICAgICAgICAgIFtERUJVR19GSUxURVIuSU5GT106IERlYnVnQWxlcnQuY3JlYXRlRGVsZWdhdGUoXCJJbmZvXCIpXHJcbiAgICAgICAgfTtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZURlbGVnYXRlKF9oZWFkbGluZTogc3RyaW5nKTogRnVuY3Rpb24ge1xyXG4gICAgICAgICAgICBsZXQgZGVsZWdhdGU6IEZ1bmN0aW9uID0gZnVuY3Rpb24gKF9tZXNzYWdlOiBPYmplY3QsIC4uLl9hcmdzOiBPYmplY3RbXSk6IHZvaWQge1xyXG4gICAgICAgICAgICAgICAgbGV0IG91dDogc3RyaW5nID0gX2hlYWRsaW5lICsgXCJcXG5cXG5cIiArIERlYnVnVGFyZ2V0Lm1lcmdlQXJndW1lbnRzKF9tZXNzYWdlLCBfYXJncyk7XHJcbiAgICAgICAgICAgICAgICBEZWJ1Z1RleHRBcmVhLnRleHRBcmVhLnRleHRDb250ZW50ICs9IG91dDtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcmV0dXJuIGRlbGVnYXRlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBEZWZpbmVzIGEgY29sb3IgYXMgdmFsdWVzIGluIHRoZSByYW5nZSBvZiAwIHRvIDEgZm9yIHRoZSBmb3VyIGNoYW5uZWxzIHJlZCwgZ3JlZW4sIGJsdWUgYW5kIGFscGhhIChmb3Igb3BhY2l0eSlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIENvbG9yIGV4dGVuZHMgTXV0YWJsZSB7IC8vaW1wbGVtZW50cyBTZXJpYWxpemFibGUge1xyXG4gICAgICAgIHB1YmxpYyByOiBudW1iZXI7XHJcbiAgICAgICAgcHVibGljIGc6IG51bWJlcjtcclxuICAgICAgICBwdWJsaWMgYjogbnVtYmVyO1xyXG4gICAgICAgIHB1YmxpYyBhOiBudW1iZXI7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKF9yOiBudW1iZXIgPSAxLCBfZzogbnVtYmVyID0gMSwgX2I6IG51bWJlciA9IDEsIF9hOiBudW1iZXIgPSAxKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0Tm9ybVJHQkEoX3IsIF9nLCBfYiwgX2EpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXQgQkxBQ0soKTogQ29sb3Ige1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IENvbG9yKDAsIDAsIDAsIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGdldCBXSElURSgpOiBDb2xvciB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQ29sb3IoMSwgMSwgMSwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0IFJFRCgpOiBDb2xvciB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQ29sb3IoMSwgMCwgMCwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0IEdSRUVOKCk6IENvbG9yIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBDb2xvcigwLCAxLCAwLCAxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXQgQkxVRSgpOiBDb2xvciB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQ29sb3IoMCwgMCwgMSwgMSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc2V0Tm9ybVJHQkEoX3I6IG51bWJlciwgX2c6IG51bWJlciwgX2I6IG51bWJlciwgX2E6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLnIgPSBNYXRoLm1pbigxLCBNYXRoLm1heCgwLCBfcikpO1xyXG4gICAgICAgICAgICB0aGlzLmcgPSBNYXRoLm1pbigxLCBNYXRoLm1heCgwLCBfZykpO1xyXG4gICAgICAgICAgICB0aGlzLmIgPSBNYXRoLm1pbigxLCBNYXRoLm1heCgwLCBfYikpO1xyXG4gICAgICAgICAgICB0aGlzLmEgPSBNYXRoLm1pbigxLCBNYXRoLm1heCgwLCBfYSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHNldEJ5dGVzUkdCQShfcjogbnVtYmVyLCBfZzogbnVtYmVyLCBfYjogbnVtYmVyLCBfYTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0Tm9ybVJHQkEoX3IgLyAyNTUsIF9nIC8gMjU1LCBfYiAvIDI1NSwgX2EgLyAyNTUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldEFycmF5KCk6IEZsb2F0MzJBcnJheSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgRmxvYXQzMkFycmF5KFt0aGlzLnIsIHRoaXMuZywgdGhpcy5iLCB0aGlzLmFdKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzZXRBcnJheU5vcm1SR0JBKF9jb2xvcjogRmxvYXQzMkFycmF5KTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0Tm9ybVJHQkEoX2NvbG9yWzBdLCBfY29sb3JbMV0sIF9jb2xvclsyXSwgX2NvbG9yWzNdKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzZXRBcnJheUJ5dGVzUkdCQShfY29sb3I6IFVpbnQ4Q2xhbXBlZEFycmF5KTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0Qnl0ZXNSR0JBKF9jb2xvclswXSwgX2NvbG9yWzFdLCBfY29sb3JbMl0sIF9jb2xvclszXSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcm90ZWN0ZWQgcmVkdWNlTXV0YXRvcihfbXV0YXRvcjogTXV0YXRvcik6IHZvaWQgey8qKiAqLyB9XHJcbiAgICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogQmFzZWNsYXNzIGZvciBtYXRlcmlhbHMuIENvbWJpbmVzIGEgW1tTaGFkZXJdXSB3aXRoIGEgY29tcGF0aWJsZSBbW0NvYXRdXVxyXG4gICAgICogQGF1dGhvcnMgSmlya2EgRGVsbCdPcm8tRnJpZWRsLCBIRlUsIDIwMTlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIE1hdGVyaWFsIGltcGxlbWVudHMgU2VyaWFsaXphYmxlUmVzb3VyY2Uge1xyXG4gICAgICAgIC8qKiBUaGUgbmFtZSB0byBjYWxsIHRoZSBNYXRlcmlhbCBieS4gKi9cclxuICAgICAgICBwdWJsaWMgbmFtZTogc3RyaW5nO1xyXG4gICAgICAgIHB1YmxpYyBpZFJlc291cmNlOiBzdHJpbmcgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgcHJpdmF0ZSBzaGFkZXJUeXBlOiB0eXBlb2YgU2hhZGVyOyAvLyBUaGUgc2hhZGVyIHByb2dyYW0gdXNlZCBieSB0aGlzIEJhc2VNYXRlcmlhbFxyXG4gICAgICAgIHByaXZhdGUgY29hdDogQ29hdDtcclxuXHJcbiAgICAgICAgcHVibGljIGNvbnN0cnVjdG9yKF9uYW1lOiBzdHJpbmcsIF9zaGFkZXI/OiB0eXBlb2YgU2hhZGVyLCBfY29hdD86IENvYXQpIHtcclxuICAgICAgICAgICAgdGhpcy5uYW1lID0gX25hbWU7XHJcbiAgICAgICAgICAgIHRoaXMuc2hhZGVyVHlwZSA9IF9zaGFkZXI7XHJcbiAgICAgICAgICAgIGlmIChfc2hhZGVyKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoX2NvYXQpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRDb2F0KF9jb2F0KTtcclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldENvYXQodGhpcy5jcmVhdGVDb2F0TWF0Y2hpbmdTaGFkZXIoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENyZWF0ZXMgYSBuZXcgW1tDb2F0XV0gaW5zdGFuY2UgdGhhdCBpcyB2YWxpZCBmb3IgdGhlIFtbU2hhZGVyXV0gcmVmZXJlbmNlZCBieSB0aGlzIG1hdGVyaWFsXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGNyZWF0ZUNvYXRNYXRjaGluZ1NoYWRlcigpOiBDb2F0IHtcclxuICAgICAgICAgICAgbGV0IGNvYXQ6IENvYXQgPSBuZXcgKHRoaXMuc2hhZGVyVHlwZS5nZXRDb2F0KCkpKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBjb2F0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogTWFrZXMgdGhpcyBtYXRlcmlhbCByZWZlcmVuY2UgdGhlIGdpdmVuIFtbQ29hdF1dIGlmIGl0IGlzIGNvbXBhdGlibGUgd2l0aCB0aGUgcmVmZXJlbmNlZCBbW1NoYWRlcl1dXHJcbiAgICAgICAgICogQHBhcmFtIF9jb2F0IFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzZXRDb2F0KF9jb2F0OiBDb2F0KTogdm9pZCB7XHJcbiAgICAgICAgICAgIGlmIChfY29hdC5jb25zdHJ1Y3RvciAhPSB0aGlzLnNoYWRlclR5cGUuZ2V0Q29hdCgpKVxyXG4gICAgICAgICAgICAgICAgdGhyb3cgKG5ldyBFcnJvcihcIlNoYWRlciBhbmQgY29hdCBkb24ndCBtYXRjaFwiKSk7XHJcbiAgICAgICAgICAgIHRoaXMuY29hdCA9IF9jb2F0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgY3VycmVudGx5IHJlZmVyZW5jZWQgW1tDb2F0XV0gaW5zdGFuY2VcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0Q29hdCgpOiBDb2F0IHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29hdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENoYW5nZXMgdGhlIG1hdGVyaWFscyByZWZlcmVuY2UgdG8gdGhlIGdpdmVuIFtbU2hhZGVyXV0sIGNyZWF0ZXMgYW5kIHJlZmVyZW5jZXMgYSBuZXcgW1tDb2F0XV0gaW5zdGFuY2UgIFxyXG4gICAgICAgICAqIGFuZCBtdXRhdGVzIHRoZSBuZXcgY29hdCB0byBwcmVzZXJ2ZSBtYXRjaGluZyBwcm9wZXJ0aWVzLlxyXG4gICAgICAgICAqIEBwYXJhbSBfc2hhZGVyVHlwZSBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc2V0U2hhZGVyKF9zaGFkZXJUeXBlOiB0eXBlb2YgU2hhZGVyKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hhZGVyVHlwZSA9IF9zaGFkZXJUeXBlO1xyXG4gICAgICAgICAgICBsZXQgY29hdDogQ29hdCA9IHRoaXMuY3JlYXRlQ29hdE1hdGNoaW5nU2hhZGVyKCk7XHJcbiAgICAgICAgICAgIGNvYXQubXV0YXRlKHRoaXMuY29hdC5nZXRNdXRhdG9yKCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgW1tTaGFkZXJdXSByZWZlcmVuY2VkIGJ5IHRoaXMgbWF0ZXJpYWxcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0U2hhZGVyKCk6IHR5cGVvZiBTaGFkZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zaGFkZXJUeXBlO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8vI3JlZ2lvbiBUcmFuc2ZlclxyXG4gICAgICAgIC8vIFRPRE86IHRoaXMgdHlwZSBvZiBzZXJpYWxpemF0aW9uIHdhcyBpbXBsZW1lbnRlZCBmb3IgaW1wbGljaXQgTWF0ZXJpYWwgY3JlYXRlLiBDaGVjayBpZiBvYnNvbGV0ZSB3aGVuIG9ubHkgb25lIG1hdGVyaWFsIGNsYXNzIGV4aXN0cyBhbmQvb3IgbWF0ZXJpYWxzIGFyZSBzdG9yZWQgc2VwYXJhdGVseVxyXG4gICAgICAgIHB1YmxpYyBzZXJpYWxpemUoKTogU2VyaWFsaXphdGlvbiB7XHJcbiAgICAgICAgICAgIGxldCBzZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uID0ge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogdGhpcy5uYW1lLFxyXG4gICAgICAgICAgICAgICAgaWRSZXNvdXJjZTogdGhpcy5pZFJlc291cmNlLFxyXG4gICAgICAgICAgICAgICAgc2hhZGVyOiB0aGlzLnNoYWRlclR5cGUubmFtZSxcclxuICAgICAgICAgICAgICAgIGNvYXQ6IFNlcmlhbGl6ZXIuc2VyaWFsaXplKHRoaXMuY29hdClcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcmV0dXJuIHNlcmlhbGl6YXRpb247XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHB1YmxpYyBkZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbik6IFNlcmlhbGl6YWJsZSB7XHJcbiAgICAgICAgICAgIHRoaXMubmFtZSA9IF9zZXJpYWxpemF0aW9uLm5hbWU7XHJcbiAgICAgICAgICAgIHRoaXMuaWRSZXNvdXJjZSA9IF9zZXJpYWxpemF0aW9uLmlkUmVzb3VyY2U7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IHByb3ZpZGUgZm9yIHNoYWRlcnMgaW4gdGhlIHVzZXJzIG5hbWVzcGFjZS4gU2VlIFNlcmlhbGl6ZXIgZnVsbHBhdGggZXRjLlxyXG4gICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLWFueVxyXG4gICAgICAgICAgICB0aGlzLnNoYWRlclR5cGUgPSAoPGFueT5GdWRnZUNvcmUpW19zZXJpYWxpemF0aW9uLnNoYWRlcl07XHJcbiAgICAgICAgICAgIGxldCBjb2F0OiBDb2F0ID0gPENvYXQ+U2VyaWFsaXplci5kZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbi5jb2F0KTtcclxuICAgICAgICAgICAgdGhpcy5zZXRDb2F0KGNvYXQpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8jZW5kcmVnaW9uXHJcbiAgICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogS2VlcHMgYSBkZXBvdCBvZiBvYmplY3RzIHRoYXQgaGF2ZSBiZWVuIG1hcmtlZCBmb3IgcmV1c2UsIHNvcnRlZCBieSB0eXBlLiAgXHJcbiAgICAgKiBVc2luZyBbW1JlY3ljbGVyXV0gcmVkdWNlcyBsb2FkIG9uIHRoZSBjYXJiYWdlIGNvbGxlY3RvciBhbmQgdGh1cyBzdXBwb3J0cyBzbW9vdGggcGVyZm9ybWFuY2VcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGFic3RyYWN0IGNsYXNzIFJlY3ljbGVyIHtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBkZXBvdDogeyBbdHlwZTogc3RyaW5nXTogT2JqZWN0W10gfSA9IHt9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIGFuIG9iamVjdCBvZiB0aGUgcmVxdWVzdGVkIHR5cGUgZnJvbSB0aGUgZGVwb3QsIG9yIGEgbmV3IG9uZSwgaWYgdGhlIGRlcG90IHdhcyBlbXB0eSBcclxuICAgICAgICAgKiBAcGFyYW0gX1QgVGhlIGNsYXNzIGlkZW50aWZpZXIgb2YgdGhlIGRlc2lyZWQgb2JqZWN0XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXQ8VD4oX1Q6IG5ldyAoKSA9PiBUKTogVCB7XHJcbiAgICAgICAgICAgIGxldCBrZXk6IHN0cmluZyA9IF9ULm5hbWU7XHJcbiAgICAgICAgICAgIGxldCBpbnN0YW5jZXM6IE9iamVjdFtdID0gUmVjeWNsZXIuZGVwb3Rba2V5XTtcclxuICAgICAgICAgICAgaWYgKGluc3RhbmNlcyAmJiBpbnN0YW5jZXMubGVuZ3RoID4gMClcclxuICAgICAgICAgICAgICAgIHJldHVybiA8VD5pbnN0YW5jZXMucG9wKCk7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgX1QoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFN0b3JlcyB0aGUgb2JqZWN0IGluIHRoZSBkZXBvdCBmb3IgbGF0ZXIgcmVjeWNsaW5nLiBVc2VycyBhcmUgcmVzcG9uc2libGUgZm9yIHRocm93aW5nIGluIG9iamVjdHMgdGhhdCBhcmUgYWJvdXQgdG8gbG9vc2Ugc2NvcGUgYW5kIGFyZSBub3QgcmVmZXJlbmNlZCBieSBhbnkgb3RoZXJcclxuICAgICAgICAgKiBAcGFyYW0gX2luc3RhbmNlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBzdG9yZShfaW5zdGFuY2U6IE9iamVjdCk6IHZvaWQge1xyXG4gICAgICAgICAgICBsZXQga2V5OiBzdHJpbmcgPSBfaW5zdGFuY2UuY29uc3RydWN0b3IubmFtZTtcclxuICAgICAgICAgICAgLy9EZWJ1Zy5sb2coa2V5KTtcclxuICAgICAgICAgICAgbGV0IGluc3RhbmNlczogT2JqZWN0W10gPSBSZWN5Y2xlci5kZXBvdFtrZXldIHx8IFtdO1xyXG4gICAgICAgICAgICBpbnN0YW5jZXMucHVzaChfaW5zdGFuY2UpO1xyXG4gICAgICAgICAgICBSZWN5Y2xlci5kZXBvdFtrZXldID0gaW5zdGFuY2VzO1xyXG4gICAgICAgICAgICAvLyBEZWJ1Zy5sb2coYE9iamVjdE1hbmFnZXIuZGVwb3RbJHtrZXl9XTogJHtPYmplY3RNYW5hZ2VyLmRlcG90W2tleV0ubGVuZ3RofWApO1xyXG4gICAgICAgICAgICAvL0RlYnVnLmxvZyh0aGlzLmRlcG90KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEVtcHR5cyB0aGUgZGVwb3Qgb2YgYSBnaXZlbiB0eXBlLCBsZWF2aW5nIHRoZSBvYmplY3RzIGZvciB0aGUgZ2FyYmFnZSBjb2xsZWN0b3IuIE1heSByZXN1bHQgaW4gYSBzaG9ydCBzdGFsbCB3aGVuIG1hbnkgb2JqZWN0cyB3ZXJlIGluXHJcbiAgICAgICAgICogQHBhcmFtIF9UXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBkdW1wPFQ+KF9UOiBuZXcgKCkgPT4gVCk6IHZvaWQge1xyXG4gICAgICAgICAgICBsZXQga2V5OiBzdHJpbmcgPSBfVC5uYW1lO1xyXG4gICAgICAgICAgICBSZWN5Y2xlci5kZXBvdFtrZXldID0gW107XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBFbXB0eXMgYWxsIGRlcG90cywgbGVhdmluZyBhbGwgb2JqZWN0cyB0byB0aGUgZ2FyYmFnZSBjb2xsZWN0b3IuIE1heSByZXN1bHQgaW4gYSBzaG9ydCBzdGFsbCB3aGVuIG1hbnkgb2JqZWN0cyB3ZXJlIGluXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBkdW1wQWxsKCk6IHZvaWQge1xyXG4gICAgICAgICAgICBSZWN5Y2xlci5kZXBvdCA9IHt9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgZXhwb3J0IGludGVyZmFjZSBTZXJpYWxpemFibGVSZXNvdXJjZSBleHRlbmRzIFNlcmlhbGl6YWJsZSB7XHJcbiAgICAgICAgaWRSZXNvdXJjZTogc3RyaW5nO1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgUmVzb3VyY2VzIHtcclxuICAgICAgICBbaWRSZXNvdXJjZTogc3RyaW5nXTogU2VyaWFsaXphYmxlUmVzb3VyY2U7XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGludGVyZmFjZSBTZXJpYWxpemF0aW9uT2ZSZXNvdXJjZXMge1xyXG4gICAgICAgIFtpZFJlc291cmNlOiBzdHJpbmddOiBTZXJpYWxpemF0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3RhdGljIGNsYXNzIGhhbmRsaW5nIHRoZSByZXNvdXJjZXMgdXNlZCB3aXRoIHRoZSBjdXJyZW50IEZVREdFLWluc3RhbmNlLiAgXHJcbiAgICAgKiBLZWVwcyBhIGxpc3Qgb2YgdGhlIHJlc291cmNlcyBhbmQgZ2VuZXJhdGVzIGlkcyB0byByZXRyaWV2ZSB0aGVtLiAgXHJcbiAgICAgKiBSZXNvdXJjZXMgYXJlIG9iamVjdHMgcmVmZXJlbmNlZCBtdWx0aXBsZSB0aW1lcyBidXQgc3VwcG9zZWQgdG8gYmUgc3RvcmVkIG9ubHkgb25jZVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgYWJzdHJhY3QgY2xhc3MgUmVzb3VyY2VNYW5hZ2VyIHtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIHJlc291cmNlczogUmVzb3VyY2VzID0ge307XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBzZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uT2ZSZXNvdXJjZXMgPSBudWxsO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBHZW5lcmF0ZXMgYW4gaWQgZm9yIHRoZSByZXNvdXJjZXMgYW5kIHJlZ2lzdGVycyBpdCB3aXRoIHRoZSBsaXN0IG9mIHJlc291cmNlcyBcclxuICAgICAgICAgKiBAcGFyYW0gX3Jlc291cmNlIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgcmVnaXN0ZXIoX3Jlc291cmNlOiBTZXJpYWxpemFibGVSZXNvdXJjZSk6IHZvaWQge1xyXG4gICAgICAgICAgICBpZiAoIV9yZXNvdXJjZS5pZFJlc291cmNlKVxyXG4gICAgICAgICAgICAgICAgX3Jlc291cmNlLmlkUmVzb3VyY2UgPSBSZXNvdXJjZU1hbmFnZXIuZ2VuZXJhdGVJZChfcmVzb3VyY2UpO1xyXG4gICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIucmVzb3VyY2VzW19yZXNvdXJjZS5pZFJlc291cmNlXSA9IF9yZXNvdXJjZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEdlbmVyYXRlIGEgdXNlciByZWFkYWJsZSBhbmQgdW5pcXVlIGlkIHVzaW5nIHRoZSB0eXBlIG9mIHRoZSByZXNvdXJjZSwgdGhlIGRhdGUgYW5kIHJhbmRvbSBudW1iZXJzXHJcbiAgICAgICAgICogQHBhcmFtIF9yZXNvdXJjZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2VuZXJhdGVJZChfcmVzb3VyY2U6IFNlcmlhbGl6YWJsZVJlc291cmNlKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgLy8gVE9ETzogYnVpbGQgaWQgYW5kIGludGVncmF0ZSBpbmZvIGZyb20gcmVzb3VyY2UsIG5vdCBqdXN0IGRhdGVcclxuICAgICAgICAgICAgbGV0IGlkUmVzb3VyY2U6IHN0cmluZztcclxuICAgICAgICAgICAgZG9cclxuICAgICAgICAgICAgICAgIGlkUmVzb3VyY2UgPSBfcmVzb3VyY2UuY29uc3RydWN0b3IubmFtZSArIFwifFwiICsgbmV3IERhdGUoKS50b0lTT1N0cmluZygpICsgXCJ8XCIgKyBNYXRoLnJhbmRvbSgpLnRvUHJlY2lzaW9uKDUpLnN1YnN0cigyLCA1KTtcclxuICAgICAgICAgICAgd2hpbGUgKFJlc291cmNlTWFuYWdlci5yZXNvdXJjZXNbaWRSZXNvdXJjZV0pO1xyXG4gICAgICAgICAgICByZXR1cm4gaWRSZXNvdXJjZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRlc3RzLCBpZiBhbiBvYmplY3QgaXMgYSBbW1NlcmlhbGl6YWJsZVJlc291cmNlXV1cclxuICAgICAgICAgKiBAcGFyYW0gX29iamVjdCBUaGUgb2JqZWN0IHRvIGV4YW1pbmVcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGlzUmVzb3VyY2UoX29iamVjdDogU2VyaWFsaXphYmxlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHJldHVybiAoUmVmbGVjdC5oYXMoX29iamVjdCwgXCJpZFJlc291cmNlXCIpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHJpZXZlcyB0aGUgcmVzb3VyY2Ugc3RvcmVkIHdpdGggdGhlIGdpdmVuIGlkXHJcbiAgICAgICAgICogQHBhcmFtIF9pZFJlc291cmNlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXQoX2lkUmVzb3VyY2U6IHN0cmluZyk6IFNlcmlhbGl6YWJsZVJlc291cmNlIHtcclxuICAgICAgICAgICAgbGV0IHJlc291cmNlOiBTZXJpYWxpemFibGVSZXNvdXJjZSA9IFJlc291cmNlTWFuYWdlci5yZXNvdXJjZXNbX2lkUmVzb3VyY2VdO1xyXG4gICAgICAgICAgICBpZiAoIXJlc291cmNlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IFJlc291cmNlTWFuYWdlci5zZXJpYWxpemF0aW9uW19pZFJlc291cmNlXTtcclxuICAgICAgICAgICAgICAgIGlmICghc2VyaWFsaXphdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIERlYnVnLmVycm9yKFwiUmVzb3VyY2Ugbm90IGZvdW5kXCIsIF9pZFJlc291cmNlKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJlc291cmNlID0gUmVzb3VyY2VNYW5hZ2VyLmRlc2VyaWFsaXplUmVzb3VyY2Uoc2VyaWFsaXphdGlvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc291cmNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ3JlYXRlcyBhbmQgcmVnaXN0ZXJzIGEgcmVzb3VyY2UgZnJvbSBhIFtbTm9kZV1dLCBjb3B5aW5nIHRoZSBjb21wbGV0ZSBicmFuY2ggc3RhcnRpbmcgd2l0aCBpdFxyXG4gICAgICAgICAqIEBwYXJhbSBfbm9kZSBBIG5vZGUgdG8gY3JlYXRlIHRoZSByZXNvdXJjZSBmcm9tXHJcbiAgICAgICAgICogQHBhcmFtIF9yZXBsYWNlV2l0aEluc3RhbmNlIGlmIHRydWUgKGRlZmF1bHQpLCB0aGUgbm9kZSB1c2VkIGFzIG9yaWdpbiBpcyByZXBsYWNlZCBieSBhIFtbTm9kZVJlc291cmNlSW5zdGFuY2VdXSBvZiB0aGUgW1tOb2RlUmVzb3VyY2VdXSBjcmVhdGVkXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyByZWdpc3Rlck5vZGVBc1Jlc291cmNlKF9ub2RlOiBOb2RlLCBfcmVwbGFjZVdpdGhJbnN0YW5jZTogYm9vbGVhbiA9IHRydWUpOiBOb2RlUmVzb3VyY2Uge1xyXG4gICAgICAgICAgICBsZXQgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IF9ub2RlLnNlcmlhbGl6ZSgpO1xyXG4gICAgICAgICAgICBsZXQgbm9kZVJlc291cmNlOiBOb2RlUmVzb3VyY2UgPSBuZXcgTm9kZVJlc291cmNlKFwiTm9kZVJlc291cmNlXCIpO1xyXG4gICAgICAgICAgICBub2RlUmVzb3VyY2UuZGVzZXJpYWxpemUoc2VyaWFsaXphdGlvbik7XHJcbiAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5yZWdpc3Rlcihub2RlUmVzb3VyY2UpO1xyXG5cclxuICAgICAgICAgICAgaWYgKF9yZXBsYWNlV2l0aEluc3RhbmNlICYmIF9ub2RlLmdldFBhcmVudCgpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaW5zdGFuY2U6IE5vZGVSZXNvdXJjZUluc3RhbmNlID0gbmV3IE5vZGVSZXNvdXJjZUluc3RhbmNlKG5vZGVSZXNvdXJjZSk7XHJcbiAgICAgICAgICAgICAgICBfbm9kZS5nZXRQYXJlbnQoKS5yZXBsYWNlQ2hpbGQoX25vZGUsIGluc3RhbmNlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG5vZGVSZXNvdXJjZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNlcmlhbGl6ZSBhbGwgcmVzb3VyY2VzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBzZXJpYWxpemUoKTogU2VyaWFsaXphdGlvbk9mUmVzb3VyY2VzIHtcclxuICAgICAgICAgICAgbGV0IHNlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb25PZlJlc291cmNlcyA9IHt9O1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpZFJlc291cmNlIGluIFJlc291cmNlTWFuYWdlci5yZXNvdXJjZXMpIHtcclxuICAgICAgICAgICAgICAgIGxldCByZXNvdXJjZTogU2VyaWFsaXphYmxlUmVzb3VyY2UgPSBSZXNvdXJjZU1hbmFnZXIucmVzb3VyY2VzW2lkUmVzb3VyY2VdO1xyXG4gICAgICAgICAgICAgICAgaWYgKGlkUmVzb3VyY2UgIT0gcmVzb3VyY2UuaWRSZXNvdXJjZSlcclxuICAgICAgICAgICAgICAgICAgICBEZWJ1Zy5lcnJvcihcIlJlc291cmNlLWlkIG1pc21hdGNoXCIsIHJlc291cmNlKTtcclxuICAgICAgICAgICAgICAgIHNlcmlhbGl6YXRpb25baWRSZXNvdXJjZV0gPSBTZXJpYWxpemVyLnNlcmlhbGl6ZShyZXNvdXJjZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHNlcmlhbGl6YXRpb247XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDcmVhdGUgcmVzb3VyY2VzIGZyb20gYSBzZXJpYWxpemF0aW9uLCBkZWxldGluZyBhbGwgcmVzb3VyY2VzIHByZXZpb3VzbHkgcmVnaXN0ZXJlZFxyXG4gICAgICAgICAqIEBwYXJhbSBfc2VyaWFsaXphdGlvbiBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uT2ZSZXNvdXJjZXMpOiBSZXNvdXJjZXMge1xyXG4gICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuc2VyaWFsaXphdGlvbiA9IF9zZXJpYWxpemF0aW9uO1xyXG4gICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIucmVzb3VyY2VzID0ge307XHJcbiAgICAgICAgICAgIGZvciAobGV0IGlkUmVzb3VyY2UgaW4gX3NlcmlhbGl6YXRpb24pIHtcclxuICAgICAgICAgICAgICAgIGxldCBzZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uID0gX3NlcmlhbGl6YXRpb25baWRSZXNvdXJjZV07XHJcbiAgICAgICAgICAgICAgICBsZXQgcmVzb3VyY2U6IFNlcmlhbGl6YWJsZVJlc291cmNlID0gUmVzb3VyY2VNYW5hZ2VyLmRlc2VyaWFsaXplUmVzb3VyY2Uoc2VyaWFsaXphdGlvbik7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzb3VyY2UpXHJcbiAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLnJlc291cmNlc1tpZFJlc291cmNlXSA9IHJlc291cmNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBSZXNvdXJjZU1hbmFnZXIucmVzb3VyY2VzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgZGVzZXJpYWxpemVSZXNvdXJjZShfc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbik6IFNlcmlhbGl6YWJsZVJlc291cmNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIDxTZXJpYWxpemFibGVSZXNvdXJjZT5TZXJpYWxpemVyLmRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogQmFzZWNsYXNzIGZvciBkaWZmZXJlbnQga2luZHMgb2YgbGlnaHRzLiBcclxuICAgICAqIEBhdXRob3JzIEppcmthIERlbGwnT3JvLUZyaWVkbCwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBhYnN0cmFjdCBjbGFzcyBMaWdodCBleHRlbmRzIE11dGFibGUge1xyXG4gICAgICAgIHB1YmxpYyBjb2xvcjogQ29sb3I7XHJcbiAgICAgICAgY29uc3RydWN0b3IoX2NvbG9yOiBDb2xvciA9IG5ldyBDb2xvcigxLCAxLCAxLCAxKSkge1xyXG4gICAgICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgICAgICB0aGlzLmNvbG9yID0gX2NvbG9yO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwcm90ZWN0ZWQgcmVkdWNlTXV0YXRvcigpOiB2b2lkIHsvKiovIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFtYmllbnQgbGlnaHQsIGNvbWluZyBmcm9tIGFsbCBkaXJlY3Rpb25zLCBpbGx1bWluYXRpbmcgZXZlcnl0aGluZyB3aXRoIGl0cyBjb2xvciBpbmRlcGVuZGVudCBvZiBwb3NpdGlvbiBhbmQgb3JpZW50YXRpb24gKGxpa2UgYSBmb2dneSBkYXkgb3IgaW4gdGhlIHNoYWRlcykgIFxyXG4gICAgICogYGBgcGxhaW50ZXh0XHJcbiAgICAgKiB+IH4gfiAgXHJcbiAgICAgKiAgfiB+IH4gIFxyXG4gICAgICogYGBgXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBMaWdodEFtYmllbnQgZXh0ZW5kcyBMaWdodCB7XHJcbiAgICAgICAgY29uc3RydWN0b3IoX2NvbG9yOiBDb2xvciA9IG5ldyBDb2xvcigxLCAxLCAxLCAxKSkge1xyXG4gICAgICAgICAgICBzdXBlcihfY29sb3IpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogRGlyZWN0aW9uYWwgbGlnaHQsIGlsbHVtaW5hdGluZyBldmVyeXRoaW5nIGZyb20gYSBzcGVjaWZpZWQgZGlyZWN0aW9uIHdpdGggaXRzIGNvbG9yIChsaWtlIHN0YW5kaW5nIGluIGJyaWdodCBzdW5saWdodCkgIFxyXG4gICAgICogYGBgcGxhaW50ZXh0XHJcbiAgICAgKiAtLS0+ICBcclxuICAgICAqIC0tLT4gIFxyXG4gICAgICogLS0tPiAgXHJcbiAgICAgKiBgYGBcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIExpZ2h0RGlyZWN0aW9uYWwgZXh0ZW5kcyBMaWdodCB7XHJcbiAgICAgICAgcHVibGljIGRpcmVjdGlvbjogVmVjdG9yMyA9IG5ldyBWZWN0b3IzKDAsIC0xLCAwKTtcclxuICAgICAgICBjb25zdHJ1Y3RvcihfY29sb3I6IENvbG9yID0gbmV3IENvbG9yKDEsIDEsIDEsIDEpLCBfZGlyZWN0aW9uOiBWZWN0b3IzID0gbmV3IFZlY3RvcjMoMCwgLTEsIDApKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKF9jb2xvcik7XHJcbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uID0gX2RpcmVjdGlvbjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIE9tbmlkaXJlY3Rpb25hbCBsaWdodCBlbWl0dGluZyBmcm9tIGl0cyBwb3NpdGlvbiwgaWxsdW1pbmF0aW5nIG9iamVjdHMgZGVwZW5kaW5nIG9uIHRoZWlyIHBvc2l0aW9uIGFuZCBkaXN0YW5jZSB3aXRoIGl0cyBjb2xvciAobGlrZSBhIGNvbG9yZWQgbGlnaHQgYnVsYikgIFxyXG4gICAgICogYGBgcGxhaW50ZXh0XHJcbiAgICAgKiAgICAgICAgIC5cXHwvLlxyXG4gICAgICogICAgICAgIC0tIG8gLS1cclxuICAgICAqICAgICAgICAgwrQvfFxcYFxyXG4gICAgICogYGBgXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBMaWdodFBvaW50IGV4dGVuZHMgTGlnaHQge1xyXG4gICAgICAgIHB1YmxpYyByYW5nZTogbnVtYmVyID0gMTA7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFNwb3QgbGlnaHQgZW1pdHRpbmcgd2l0aGluIGEgc3BlY2lmaWVkIGFuZ2xlIGZyb20gaXRzIHBvc2l0aW9uLCBpbGx1bWluYXRpbmcgb2JqZWN0cyBkZXBlbmRpbmcgb24gdGhlaXIgcG9zaXRpb24gYW5kIGRpc3RhbmNlIHdpdGggaXRzIGNvbG9yICBcclxuICAgICAqIGBgYHBsYWludGV4dFxyXG4gICAgICogICAgICAgICAgbyAgXHJcbiAgICAgKiAgICAgICAgIC98XFwgIFxyXG4gICAgICogICAgICAgIC8gfCBcXCBcclxuICAgICAqIGBgYCAgIFxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgTGlnaHRTcG90IGV4dGVuZHMgTGlnaHQge1xyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL0xpZ2h0L0xpZ2h0LnRzXCIvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vQ29tcG9uZW50L0NvbXBvbmVudExpZ2h0LnRzXCIvPlxyXG5uYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIGV4cG9ydCB0eXBlIE1hcExpZ2h0VHlwZVRvTGlnaHRMaXN0ID0gTWFwPHN0cmluZywgQ29tcG9uZW50TGlnaHRbXT47XHJcbiAgICAvKipcclxuICAgICAqIENvbnRyb2xzIHRoZSByZW5kZXJpbmcgb2YgYSBicmFuY2ggb2YgYSBzY2VuZXRyZWUsIHVzaW5nIHRoZSBnaXZlbiBbW0NvbXBvbmVudENhbWVyYV1dLFxyXG4gICAgICogYW5kIHRoZSBwcm9wYWdhdGlvbiBvZiB0aGUgcmVuZGVyZWQgaW1hZ2UgZnJvbSB0aGUgb2Zmc2NyZWVuIHJlbmRlcmJ1ZmZlciB0byB0aGUgdGFyZ2V0IGNhbnZhc1xyXG4gICAgICogdGhyb3VnaCBhIHNlcmllcyBvZiBbW0ZyYW1pbmddXSBvYmplY3RzLiBUaGUgc3RhZ2VzIGludm9sdmVkIGFyZSBpbiBvcmRlciBvZiByZW5kZXJpbmdcclxuICAgICAqIFtbUmVuZGVyTWFuYWdlcl1dLnZpZXdwb3J0IC0+IFtbVmlld3BvcnRdXS5zb3VyY2UgLT4gW1tWaWV3cG9ydF1dLmRlc3RpbmF0aW9uIC0+IERPTS1DYW52YXMgLT4gQ2xpZW50KENTUylcclxuICAgICAqIEBhdXRob3JzIEphc2NoYSBLYXJhZ8O2bCwgSEZVLCAyMDE5IHwgSmlya2EgRGVsbCdPcm8tRnJpZWRsLCBIRlUsIDIwMTlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIFZpZXdwb3J0IGV4dGVuZHMgRXZlbnRUYXJnZXQge1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGZvY3VzOiBWaWV3cG9ydDtcclxuXHJcbiAgICAgICAgcHVibGljIG5hbWU6IHN0cmluZyA9IFwiVmlld3BvcnRcIjsgLy8gVGhlIG5hbWUgdG8gY2FsbCB0aGlzIHZpZXdwb3J0IGJ5LlxyXG4gICAgICAgIHB1YmxpYyBjYW1lcmE6IENvbXBvbmVudENhbWVyYSA9IG51bGw7IC8vIFRoZSBjYW1lcmEgcmVwcmVzZW50aW5nIHRoZSB2aWV3IHBhcmFtZXRlcnMgdG8gcmVuZGVyIHRoZSBicmFuY2guXHJcblxyXG4gICAgICAgIHB1YmxpYyByZWN0U291cmNlOiBSZWN0YW5nbGU7XHJcbiAgICAgICAgcHVibGljIHJlY3REZXN0aW5hdGlvbjogUmVjdGFuZ2xlO1xyXG5cclxuICAgICAgICAvLyBUT0RPOiB2ZXJpZnkgaWYgY2xpZW50IHRvIGNhbnZhcyBzaG91bGQgYmUgaW4gVmlld3BvcnQgb3Igc29tZXdoZXJlIGVsc2UgKFdpbmRvdywgQ29udGFpbmVyPylcclxuICAgICAgICAvLyBNdWx0aXBsZSB2aWV3cG9ydHMgdXNpbmcgdGhlIHNhbWUgY2FudmFzIHNob3VsZG4ndCBkaWZmZXIgaGVyZS4uLlxyXG4gICAgICAgIC8vIGRpZmZlcmVudCBmcmFtaW5nIG1ldGhvZHMgY2FuIGJlIHVzZWQsIHRoaXMgaXMgdGhlIGRlZmF1bHRcclxuICAgICAgICBwdWJsaWMgZnJhbWVDbGllbnRUb0NhbnZhczogRnJhbWluZ1NjYWxlZCA9IG5ldyBGcmFtaW5nU2NhbGVkKCk7XHJcbiAgICAgICAgcHVibGljIGZyYW1lQ2FudmFzVG9EZXN0aW5hdGlvbjogRnJhbWluZ0NvbXBsZXggPSBuZXcgRnJhbWluZ0NvbXBsZXgoKTtcclxuICAgICAgICBwdWJsaWMgZnJhbWVEZXN0aW5hdGlvblRvU291cmNlOiBGcmFtaW5nU2NhbGVkID0gbmV3IEZyYW1pbmdTY2FsZWQoKTtcclxuICAgICAgICBwdWJsaWMgZnJhbWVTb3VyY2VUb1JlbmRlcjogRnJhbWluZ1NjYWxlZCA9IG5ldyBGcmFtaW5nU2NhbGVkKCk7XHJcblxyXG4gICAgICAgIHB1YmxpYyBhZGp1c3RpbmdGcmFtZXM6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgICAgIHB1YmxpYyBhZGp1c3RpbmdDYW1lcmE6IGJvb2xlYW4gPSB0cnVlO1xyXG5cclxuICAgICAgICBwdWJsaWMgbGlnaHRzOiBNYXBMaWdodFR5cGVUb0xpZ2h0TGlzdCA9IG51bGw7XHJcblxyXG4gICAgICAgIHByaXZhdGUgYnJhbmNoOiBOb2RlID0gbnVsbDsgLy8gVGhlIGZpcnN0IG5vZGUgaW4gdGhlIHRyZWUoYnJhbmNoKSB0aGF0IHdpbGwgYmUgcmVuZGVyZWQuXHJcbiAgICAgICAgcHJpdmF0ZSBjcmMyOiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgPSBudWxsO1xyXG4gICAgICAgIHByaXZhdGUgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCA9IG51bGw7XHJcbiAgICAgICAgcHJpdmF0ZSBwaWNrQnVmZmVyczogUGlja0J1ZmZlcltdID0gW107XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENvbm5lY3RzIHRoZSB2aWV3cG9ydCB0byB0aGUgZ2l2ZW4gY2FudmFzIHRvIHJlbmRlciB0aGUgZ2l2ZW4gYnJhbmNoIHRvIHVzaW5nIHRoZSBnaXZlbiBjYW1lcmEtY29tcG9uZW50LCBhbmQgbmFtZXMgdGhlIHZpZXdwb3J0IGFzIGdpdmVuLlxyXG4gICAgICAgICAqIEBwYXJhbSBfbmFtZSBcclxuICAgICAgICAgKiBAcGFyYW0gX2JyYW5jaCBcclxuICAgICAgICAgKiBAcGFyYW0gX2NhbWVyYSBcclxuICAgICAgICAgKiBAcGFyYW0gX2NhbnZhcyBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgaW5pdGlhbGl6ZShfbmFtZTogc3RyaW5nLCBfYnJhbmNoOiBOb2RlLCBfY2FtZXJhOiBDb21wb25lbnRDYW1lcmEsIF9jYW52YXM6IEhUTUxDYW52YXNFbGVtZW50KTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMubmFtZSA9IF9uYW1lO1xyXG4gICAgICAgICAgICB0aGlzLmNhbWVyYSA9IF9jYW1lcmE7XHJcbiAgICAgICAgICAgIHRoaXMuY2FudmFzID0gX2NhbnZhcztcclxuICAgICAgICAgICAgdGhpcy5jcmMyID0gX2NhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnJlY3RTb3VyY2UgPSBSZW5kZXJNYW5hZ2VyLmdldENhbnZhc1JlY3QoKTtcclxuICAgICAgICAgICAgdGhpcy5yZWN0RGVzdGluYXRpb24gPSB0aGlzLmdldENsaWVudFJlY3RhbmdsZSgpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zZXRCcmFuY2goX2JyYW5jaCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHJpZXZlIHRoZSAyRC1jb250ZXh0IGF0dGFjaGVkIHRvIHRoZSBkZXN0aW5hdGlvbiBjYW52YXNcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0Q29udGV4dCgpOiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jcmMyO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXRyaWV2ZSB0aGUgc2l6ZSBvZiB0aGUgZGVzdGluYXRpb24gY2FudmFzIGFzIGEgcmVjdGFuZ2xlLCB4IGFuZCB5IGFyZSBhbHdheXMgMCBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0Q2FudmFzUmVjdGFuZ2xlKCk6IFJlY3RhbmdsZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBSZWN0YW5nbGUuR0VUKDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXRyaWV2ZSB0aGUgY2xpZW50IHJlY3RhbmdsZSB0aGUgY2FudmFzIGlzIGRpc3BsYXllZCBhbmQgZml0IGluLCB4IGFuZCB5IGFyZSBhbHdheXMgMCBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0Q2xpZW50UmVjdGFuZ2xlKCk6IFJlY3RhbmdsZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBSZWN0YW5nbGUuR0VUKDAsIDAsIHRoaXMuY2FudmFzLmNsaWVudFdpZHRoLCB0aGlzLmNhbnZhcy5jbGllbnRIZWlnaHQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2V0IHRoZSBicmFuY2ggdG8gYmUgZHJhd24gaW4gdGhlIHZpZXdwb3J0LlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzZXRCcmFuY2goX2JyYW5jaDogTm9kZSk6IHZvaWQge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5icmFuY2gpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYnJhbmNoLnJlbW92ZUV2ZW50TGlzdGVuZXIoRVZFTlQuQ09NUE9ORU5UX0FERCwgdGhpcy5obmRDb21wb25lbnRFdmVudCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJyYW5jaC5yZW1vdmVFdmVudExpc3RlbmVyKEVWRU5ULkNPTVBPTkVOVF9SRU1PVkUsIHRoaXMuaG5kQ29tcG9uZW50RXZlbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuYnJhbmNoID0gX2JyYW5jaDtcclxuICAgICAgICAgICAgdGhpcy5jb2xsZWN0TGlnaHRzKCk7XHJcbiAgICAgICAgICAgIHRoaXMuYnJhbmNoLmFkZEV2ZW50TGlzdGVuZXIoRVZFTlQuQ09NUE9ORU5UX0FERCwgdGhpcy5obmRDb21wb25lbnRFdmVudCk7XHJcbiAgICAgICAgICAgIHRoaXMuYnJhbmNoLmFkZEV2ZW50TGlzdGVuZXIoRVZFTlQuQ09NUE9ORU5UX1JFTU9WRSwgdGhpcy5obmRDb21wb25lbnRFdmVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIExvZ3MgdGhpcyB2aWV3cG9ydHMgc2NlbmVncmFwaCB0byB0aGUgY29uc29sZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc2hvd1NjZW5lR3JhcGgoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IG1vdmUgdG8gZGVidWctY2xhc3NcclxuICAgICAgICAgICAgbGV0IG91dHB1dDogc3RyaW5nID0gXCJTY2VuZUdyYXBoIGZvciB0aGlzIHZpZXdwb3J0OlwiO1xyXG4gICAgICAgICAgICBvdXRwdXQgKz0gXCJcXG4gXFxuXCI7XHJcbiAgICAgICAgICAgIG91dHB1dCArPSB0aGlzLmJyYW5jaC5uYW1lO1xyXG4gICAgICAgICAgICBEZWJ1Zy5sb2cob3V0cHV0ICsgXCIgICA9PiBST09UTk9ERVwiICsgdGhpcy5jcmVhdGVTY2VuZUdyYXBoKHRoaXMuYnJhbmNoKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyAjcmVnaW9uIERyYXdpbmdcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEcmF3IHRoaXMgdmlld3BvcnRcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZHJhdygpOiB2b2lkIHtcclxuICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5yZXNldEZyYW1lQnVmZmVyKCk7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5jYW1lcmEuaXNBY3RpdmUpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmFkanVzdGluZ0ZyYW1lcylcclxuICAgICAgICAgICAgICAgIHRoaXMuYWRqdXN0RnJhbWVzKCk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmFkanVzdGluZ0NhbWVyYSlcclxuICAgICAgICAgICAgICAgIHRoaXMuYWRqdXN0Q2FtZXJhKCk7XHJcblxyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmNsZWFyKHRoaXMuY2FtZXJhLmdldEJhY2tnb3VuZENvbG9yKCkpO1xyXG4gICAgICAgICAgICBpZiAoUmVuZGVyTWFuYWdlci5hZGRCcmFuY2godGhpcy5icmFuY2gpKVxyXG4gICAgICAgICAgICAgICAgLy8gYnJhbmNoIGhhcyBub3QgeWV0IGJlZW4gcHJvY2Vzc2VkIGZ1bGx5IGJ5IHJlbmRlcm1hbmFnZXIgLT4gdXBkYXRlIGFsbCByZWdpc3RlcmVkIG5vZGVzXHJcbiAgICAgICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLnNldExpZ2h0cyh0aGlzLmxpZ2h0cyk7XHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIuZHJhd0JyYW5jaCh0aGlzLmJyYW5jaCwgdGhpcy5jYW1lcmEpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jcmMyLmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmNyYzIuZHJhd0ltYWdlKFxyXG4gICAgICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5nZXRDYW52YXMoKSxcclxuICAgICAgICAgICAgICAgIHRoaXMucmVjdFNvdXJjZS54LCB0aGlzLnJlY3RTb3VyY2UueSwgdGhpcy5yZWN0U291cmNlLndpZHRoLCB0aGlzLnJlY3RTb3VyY2UuaGVpZ2h0LFxyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWN0RGVzdGluYXRpb24ueCwgdGhpcy5yZWN0RGVzdGluYXRpb24ueSwgdGhpcy5yZWN0RGVzdGluYXRpb24ud2lkdGgsIHRoaXMucmVjdERlc3RpbmF0aW9uLmhlaWdodFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgKiBEcmF3IHRoaXMgdmlld3BvcnQgZm9yIFJheUNhc3RcclxuICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBjcmVhdGVQaWNrQnVmZmVycygpOiB2b2lkIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuYWRqdXN0aW5nRnJhbWVzKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5hZGp1c3RGcmFtZXMoKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuYWRqdXN0aW5nQ2FtZXJhKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5hZGp1c3RDYW1lcmEoKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChSZW5kZXJNYW5hZ2VyLmFkZEJyYW5jaCh0aGlzLmJyYW5jaCkpXHJcbiAgICAgICAgICAgICAgICAvLyBicmFuY2ggaGFzIG5vdCB5ZXQgYmVlbiBwcm9jZXNzZWQgZnVsbHkgYnkgcmVuZGVybWFuYWdlciAtPiB1cGRhdGUgYWxsIHJlZ2lzdGVyZWQgbm9kZXNcclxuICAgICAgICAgICAgICAgIFJlbmRlck1hbmFnZXIudXBkYXRlKCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnBpY2tCdWZmZXJzID0gUmVuZGVyTWFuYWdlci5kcmF3QnJhbmNoRm9yUmF5Q2FzdCh0aGlzLmJyYW5jaCwgdGhpcy5jYW1lcmEpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jcmMyLmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmNyYzIuZHJhd0ltYWdlKFxyXG4gICAgICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5nZXRDYW52YXMoKSxcclxuICAgICAgICAgICAgICAgIHRoaXMucmVjdFNvdXJjZS54LCB0aGlzLnJlY3RTb3VyY2UueSwgdGhpcy5yZWN0U291cmNlLndpZHRoLCB0aGlzLnJlY3RTb3VyY2UuaGVpZ2h0LFxyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWN0RGVzdGluYXRpb24ueCwgdGhpcy5yZWN0RGVzdGluYXRpb24ueSwgdGhpcy5yZWN0RGVzdGluYXRpb24ud2lkdGgsIHRoaXMucmVjdERlc3RpbmF0aW9uLmhlaWdodFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIHB1YmxpYyBwaWNrTm9kZUF0KF9wb3M6IFZlY3RvcjIpOiBSYXlIaXRbXSB7XHJcbiAgICAgICAgICAgIC8vIHRoaXMuY3JlYXRlUGlja0J1ZmZlcnMoKTtcclxuICAgICAgICAgICAgbGV0IGhpdHM6IFJheUhpdFtdID0gUmVuZGVyTWFuYWdlci5waWNrTm9kZUF0KF9wb3MsIHRoaXMucGlja0J1ZmZlcnMsIHRoaXMucmVjdFNvdXJjZSk7XHJcbiAgICAgICAgICAgIGhpdHMuc29ydCgoYTogUmF5SGl0LCBiOiBSYXlIaXQpID0+IChiLnpCdWZmZXIgPiAwKSA/IChhLnpCdWZmZXIgPiAwKSA/IGEuekJ1ZmZlciAtIGIuekJ1ZmZlciA6IDEgOiAtMSk7XHJcbiAgICAgICAgICAgIHJldHVybiBoaXRzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQWRqdXN0IGFsbCBmcmFtZXMgaW52b2x2ZWQgaW4gdGhlIHJlbmRlcmluZyBwcm9jZXNzIGZyb20gdGhlIGRpc3BsYXkgYXJlYSBpbiB0aGUgY2xpZW50IHVwIHRvIHRoZSByZW5kZXJlciBjYW52YXNcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgYWRqdXN0RnJhbWVzKCk6IHZvaWQge1xyXG4gICAgICAgICAgICAvLyBnZXQgdGhlIHJlY3RhbmdsZSBvZiB0aGUgY2FudmFzIGFyZWEgYXMgZGlzcGxheWVkIChjb25zaWRlciBjc3MpXHJcbiAgICAgICAgICAgIGxldCByZWN0Q2xpZW50OiBSZWN0YW5nbGUgPSB0aGlzLmdldENsaWVudFJlY3RhbmdsZSgpO1xyXG4gICAgICAgICAgICAvLyBhZGp1c3QgdGhlIGNhbnZhcyBzaXplIGFjY29yZGluZyB0byB0aGUgZ2l2ZW4gZnJhbWluZyBhcHBsaWVkIHRvIGNsaWVudFxyXG4gICAgICAgICAgICBsZXQgcmVjdENhbnZhczogUmVjdGFuZ2xlID0gdGhpcy5mcmFtZUNsaWVudFRvQ2FudmFzLmdldFJlY3QocmVjdENsaWVudCk7XHJcbiAgICAgICAgICAgIHRoaXMuY2FudmFzLndpZHRoID0gcmVjdENhbnZhcy53aWR0aDtcclxuICAgICAgICAgICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gcmVjdENhbnZhcy5oZWlnaHQ7XHJcbiAgICAgICAgICAgIC8vIGFkanVzdCB0aGUgZGVzdGluYXRpb24gYXJlYSBvbiB0aGUgdGFyZ2V0LWNhbnZhcyB0byByZW5kZXIgdG8gYnkgYXBwbHlpbmcgdGhlIGZyYW1pbmcgdG8gY2FudmFzXHJcbiAgICAgICAgICAgIHRoaXMucmVjdERlc3RpbmF0aW9uID0gdGhpcy5mcmFtZUNhbnZhc1RvRGVzdGluYXRpb24uZ2V0UmVjdChyZWN0Q2FudmFzKTtcclxuICAgICAgICAgICAgLy8gYWRqdXN0IHRoZSBhcmVhIG9uIHRoZSBzb3VyY2UtY2FudmFzIHRvIHJlbmRlciBmcm9tIGJ5IGFwcGx5aW5nIHRoZSBmcmFtaW5nIHRvIGRlc3RpbmF0aW9uIGFyZWFcclxuICAgICAgICAgICAgdGhpcy5yZWN0U291cmNlID0gdGhpcy5mcmFtZURlc3RpbmF0aW9uVG9Tb3VyY2UuZ2V0UmVjdCh0aGlzLnJlY3REZXN0aW5hdGlvbik7XHJcbiAgICAgICAgICAgIC8vIGhhdmluZyBhbiBvZmZzZXQgc291cmNlIGRvZXMgbWFrZSBzZW5zZSBvbmx5IHdoZW4gbXVsdGlwbGUgdmlld3BvcnRzIGRpc3BsYXkgcGFydHMgb2YgdGhlIHNhbWUgcmVuZGVyaW5nLiBGb3Igbm93OiBzaGlmdCBpdCB0byAwLDBcclxuICAgICAgICAgICAgdGhpcy5yZWN0U291cmNlLnggPSB0aGlzLnJlY3RTb3VyY2UueSA9IDA7XHJcbiAgICAgICAgICAgIC8vIHN0aWxsLCBhIHBhcnRpYWwgaW1hZ2Ugb2YgdGhlIHJlbmRlcmluZyBtYXkgYmUgcmV0cmlldmVkIGJ5IG1vdmluZyBhbmQgcmVzaXppbmcgdGhlIHJlbmRlciB2aWV3cG9ydFxyXG4gICAgICAgICAgICBsZXQgcmVjdFJlbmRlcjogUmVjdGFuZ2xlID0gdGhpcy5mcmFtZVNvdXJjZVRvUmVuZGVyLmdldFJlY3QodGhpcy5yZWN0U291cmNlKTtcclxuICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5zZXRWaWV3cG9ydFJlY3RhbmdsZShyZWN0UmVuZGVyKTtcclxuICAgICAgICAgICAgLy8gbm8gbW9yZSB0cmFuc2Zvcm1hdGlvbiBhZnRlciB0aGlzIGZvciBub3csIG9mZnNjcmVlbiBjYW52YXMgYW5kIHJlbmRlci12aWV3cG9ydCBoYXZlIHRoZSBzYW1lIHNpemVcclxuICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5zZXRDYW52YXNTaXplKHJlY3RSZW5kZXIud2lkdGgsIHJlY3RSZW5kZXIuaGVpZ2h0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQWRqdXN0IHRoZSBjYW1lcmEgcGFyYW1ldGVycyB0byBmaXQgdGhlIHJlbmRlcmluZyBpbnRvIHRoZSByZW5kZXIgdmllcG9ydFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBhZGp1c3RDYW1lcmEoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGxldCByZWN0OiBSZWN0YW5nbGUgPSBSZW5kZXJNYW5hZ2VyLmdldFZpZXdwb3J0UmVjdGFuZ2xlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY2FtZXJhLnByb2plY3RDZW50cmFsKHJlY3Qud2lkdGggLyByZWN0LmhlaWdodCwgdGhpcy5jYW1lcmEuZ2V0RmllbGRPZlZpZXcoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vICNlbmRyZWdpb25cclxuXHJcbiAgICAgICAgLy8jcmVnaW9uIFBvaW50c1xyXG4gICAgICAgIHB1YmxpYyBwb2ludENsaWVudFRvU291cmNlKF9jbGllbnQ6IFZlY3RvcjIpOiBWZWN0b3IyIHtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdDogVmVjdG9yMjtcclxuICAgICAgICAgICAgbGV0IHJlY3Q6IFJlY3RhbmdsZTtcclxuICAgICAgICAgICAgcmVjdCA9IHRoaXMuZ2V0Q2xpZW50UmVjdGFuZ2xlKCk7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuZnJhbWVDbGllbnRUb0NhbnZhcy5nZXRQb2ludChfY2xpZW50LCByZWN0KTtcclxuICAgICAgICAgICAgcmVjdCA9IHRoaXMuZ2V0Q2FudmFzUmVjdGFuZ2xlKCk7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuZnJhbWVDYW52YXNUb0Rlc3RpbmF0aW9uLmdldFBvaW50KHJlc3VsdCwgcmVjdCk7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuZnJhbWVEZXN0aW5hdGlvblRvU291cmNlLmdldFBvaW50KHJlc3VsdCwgdGhpcy5yZWN0U291cmNlKTtcclxuICAgICAgICAgICAgLy9UT0RPOiB3aGVuIFNvdXJjZSwgUmVuZGVyIGFuZCBSZW5kZXJWaWV3cG9ydCBkZXZpYXRlLCBjb250aW51ZSB0cmFuc2Zvcm1hdGlvbiBcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBwb2ludFNvdXJjZVRvUmVuZGVyKF9zb3VyY2U6IFZlY3RvcjIpOiBWZWN0b3IyIHtcclxuICAgICAgICAgICAgbGV0IHByb2plY3Rpb25SZWN0YW5nbGU6IFJlY3RhbmdsZSA9IHRoaXMuY2FtZXJhLmdldFByb2plY3Rpb25SZWN0YW5nbGUoKTtcclxuICAgICAgICAgICAgbGV0IHBvaW50OiBWZWN0b3IyID0gdGhpcy5mcmFtZVNvdXJjZVRvUmVuZGVyLmdldFBvaW50KF9zb3VyY2UsIHByb2plY3Rpb25SZWN0YW5nbGUpO1xyXG4gICAgICAgICAgICByZXR1cm4gcG9pbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgcG9pbnRDbGllbnRUb1JlbmRlcihfY2xpZW50OiBWZWN0b3IyKTogVmVjdG9yMiB7XHJcbiAgICAgICAgICAgIGxldCBwb2ludDogVmVjdG9yMiA9IHRoaXMucG9pbnRDbGllbnRUb1NvdXJjZShfY2xpZW50KTtcclxuICAgICAgICAgICAgcG9pbnQgPSB0aGlzLnBvaW50U291cmNlVG9SZW5kZXIocG9pbnQpO1xyXG4gICAgICAgICAgICAvL1RPRE86IHdoZW4gUmVuZGVyIGFuZCBSZW5kZXJWaWV3cG9ydCBkZXZpYXRlLCBjb250aW51ZSB0cmFuc2Zvcm1hdGlvbiBcclxuICAgICAgICAgICAgcmV0dXJuIHBvaW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8jZW5kcmVnaW9uXHJcblxyXG4gICAgICAgIC8vICNyZWdpb24gRXZlbnRzIChwYXNzaW5nIGZyb20gY2FudmFzIHRvIHZpZXdwb3J0IGFuZCBmcm9tIHRoZXJlIGludG8gYnJhbmNoKVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGlzIHZpZXdwb3J0IGN1cnJlbnRseSBoYXMgZm9jdXMgYW5kIHRodXMgcmVjZWl2ZXMga2V5Ym9hcmQgZXZlbnRzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGdldCBoYXNGb2N1cygpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgcmV0dXJuIChWaWV3cG9ydC5mb2N1cyA9PSB0aGlzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU3dpdGNoIHRoZSB2aWV3cG9ydHMgZm9jdXMgb24gb3Igb2ZmLiBPbmx5IG9uZSB2aWV3cG9ydCBpbiBvbmUgRlVER0UgaW5zdGFuY2UgY2FuIGhhdmUgdGhlIGZvY3VzLCB0aHVzIHJlY2VpdmluZyBrZXlib2FyZCBldmVudHMuIFxyXG4gICAgICAgICAqIFNvIGEgdmlld3BvcnQgY3VycmVudGx5IGhhdmluZyB0aGUgZm9jdXMgd2lsbCBsb3NlIGl0LCB3aGVuIGFub3RoZXIgb25lIHJlY2VpdmVzIGl0LiBUaGUgdmlld3BvcnRzIGZpcmUgW1tFdmVudF1dcyBhY2NvcmRpbmdseS5cclxuICAgICAgICAgKiAgXHJcbiAgICAgICAgICogQHBhcmFtIF9vbiBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc2V0Rm9jdXMoX29uOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGlmIChfb24pIHtcclxuICAgICAgICAgICAgICAgIGlmIChWaWV3cG9ydC5mb2N1cyA9PSB0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIGlmIChWaWV3cG9ydC5mb2N1cylcclxuICAgICAgICAgICAgICAgICAgICBWaWV3cG9ydC5mb2N1cy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChFVkVOVC5GT0NVU19PVVQpKTtcclxuICAgICAgICAgICAgICAgIFZpZXdwb3J0LmZvY3VzID0gdGhpcztcclxuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoRVZFTlQuRk9DVVNfSU4pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChWaWV3cG9ydC5mb2N1cyAhPSB0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KEVWRU5ULkZPQ1VTX09VVCkpO1xyXG4gICAgICAgICAgICAgICAgVmlld3BvcnQuZm9jdXMgPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERlLSAvIEFjdGl2YXRlcyB0aGUgZ2l2ZW4gcG9pbnRlciBldmVudCB0byBiZSBwcm9wYWdhdGVkIGludG8gdGhlIHZpZXdwb3J0IGFzIEZVREdFLUV2ZW50IFxyXG4gICAgICAgICAqIEBwYXJhbSBfdHlwZSBcclxuICAgICAgICAgKiBAcGFyYW0gX29uIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBhY3RpdmF0ZVBvaW50ZXJFdmVudChfdHlwZTogRVZFTlRfUE9JTlRFUiwgX29uOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuYWN0aXZhdGVFdmVudCh0aGlzLmNhbnZhcywgX3R5cGUsIHRoaXMuaG5kUG9pbnRlckV2ZW50LCBfb24pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZS0gLyBBY3RpdmF0ZXMgdGhlIGdpdmVuIGtleWJvYXJkIGV2ZW50IHRvIGJlIHByb3BhZ2F0ZWQgaW50byB0aGUgdmlld3BvcnQgYXMgRlVER0UtRXZlbnRcclxuICAgICAgICAgKiBAcGFyYW0gX3R5cGUgXHJcbiAgICAgICAgICogQHBhcmFtIF9vbiBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgYWN0aXZhdGVLZXlib2FyZEV2ZW50KF90eXBlOiBFVkVOVF9LRVlCT0FSRCwgX29uOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuYWN0aXZhdGVFdmVudCh0aGlzLmNhbnZhcy5vd25lckRvY3VtZW50LCBfdHlwZSwgdGhpcy5obmRLZXlib2FyZEV2ZW50LCBfb24pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZS0gLyBBY3RpdmF0ZXMgdGhlIGdpdmVuIGRyYWctZHJvcCBldmVudCB0byBiZSBwcm9wYWdhdGVkIGludG8gdGhlIHZpZXdwb3J0IGFzIEZVREdFLUV2ZW50XHJcbiAgICAgICAgICogQHBhcmFtIF90eXBlIFxyXG4gICAgICAgICAqIEBwYXJhbSBfb24gXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGFjdGl2YXRlRHJhZ0Ryb3BFdmVudChfdHlwZTogRVZFTlRfRFJBR0RST1AsIF9vbjogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgICAgICBpZiAoX3R5cGUgPT0gRVZFTlRfRFJBR0RST1AuU1RBUlQpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhcy5kcmFnZ2FibGUgPSBfb247XHJcbiAgICAgICAgICAgIHRoaXMuYWN0aXZhdGVFdmVudCh0aGlzLmNhbnZhcywgX3R5cGUsIHRoaXMuaG5kRHJhZ0Ryb3BFdmVudCwgX29uKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGUtIC8gQWN0aXZhdGVzIHRoZSB3aGVlbCBldmVudCB0byBiZSBwcm9wYWdhdGVkIGludG8gdGhlIHZpZXdwb3J0IGFzIEZVREdFLUV2ZW50XHJcbiAgICAgICAgICogQHBhcmFtIF90eXBlIFxyXG4gICAgICAgICAqIEBwYXJhbSBfb24gXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGFjdGl2YXRlV2hlZWxFdmVudChfdHlwZTogRVZFTlRfV0hFRUwsIF9vbjogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmFjdGl2YXRlRXZlbnQodGhpcy5jYW52YXMsIF90eXBlLCB0aGlzLmhuZFdoZWVsRXZlbnQsIF9vbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEhhbmRsZSBkcmFnLWRyb3AgZXZlbnRzIGFuZCBkaXNwYXRjaCB0byB2aWV3cG9ydCBhcyBGVURHRS1FdmVudFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgaG5kRHJhZ0Ryb3BFdmVudDogRXZlbnRMaXN0ZW5lciA9IChfZXZlbnQ6IEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBfZHJhZ2V2ZW50OiBEcmFnRHJvcEV2ZW50xpIgPSA8RHJhZ0Ryb3BFdmVudMaSPl9ldmVudDtcclxuICAgICAgICAgICAgc3dpdGNoIChfZHJhZ2V2ZW50LnR5cGUpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgXCJkcmFnb3ZlclwiOlxyXG4gICAgICAgICAgICAgICAgY2FzZSBcImRyb3BcIjpcclxuICAgICAgICAgICAgICAgICAgICBfZHJhZ2V2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgX2RyYWdldmVudC5kYXRhVHJhbnNmZXIuZWZmZWN0QWxsb3dlZCA9IFwibm9uZVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBcImRyYWdzdGFydFwiOlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGp1c3QgZHVtbXkgZGF0YSwgIHZhbGlkIGRhdGEgc2hvdWxkIGJlIHNldCBpbiBoYW5kbGVyIHJlZ2lzdGVyZWQgYnkgdGhlIHVzZXJcclxuICAgICAgICAgICAgICAgICAgICBfZHJhZ2V2ZW50LmRhdGFUcmFuc2Zlci5zZXREYXRhKFwidGV4dFwiLCBcIkhhbGxvXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IGNoZWNrIGlmIHRoZXJlIGlzIGEgYmV0dGVyIHNvbHV0aW9uIHRvIGhpZGUgdGhlIGdob3N0IGltYWdlIG9mIHRoZSBkcmFnZ2FibGUgb2JqZWN0XHJcbiAgICAgICAgICAgICAgICAgICAgX2RyYWdldmVudC5kYXRhVHJhbnNmZXIuc2V0RHJhZ0ltYWdlKG5ldyBJbWFnZSgpLCAwLCAwKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgZXZlbnQ6IERyYWdEcm9wRXZlbnTGkiA9IG5ldyBEcmFnRHJvcEV2ZW50xpIoXCLGklwiICsgX2V2ZW50LnR5cGUsIF9kcmFnZXZlbnQpO1xyXG4gICAgICAgICAgICB0aGlzLmFkZENhbnZhc1Bvc2l0aW9uKGV2ZW50KTtcclxuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQWRkIHBvc2l0aW9uIG9mIHRoZSBwb2ludGVyIG1hcHBlZCB0byBjYW52YXMtY29vcmRpbmF0ZXMgYXMgY2FudmFzWCwgY2FudmFzWSB0byB0aGUgZXZlbnRcclxuICAgICAgICAgKiBAcGFyYW0gZXZlbnRcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIGFkZENhbnZhc1Bvc2l0aW9uKGV2ZW50OiBQb2ludGVyRXZlbnTGkiB8IERyYWdEcm9wRXZlbnTGkik6IHZvaWQge1xyXG4gICAgICAgICAgICBldmVudC5jYW52YXNYID0gdGhpcy5jYW52YXMud2lkdGggKiBldmVudC5wb2ludGVyWCAvIGV2ZW50LmNsaWVudFJlY3Qud2lkdGg7XHJcbiAgICAgICAgICAgIGV2ZW50LmNhbnZhc1kgPSB0aGlzLmNhbnZhcy5oZWlnaHQgKiBldmVudC5wb2ludGVyWSAvIGV2ZW50LmNsaWVudFJlY3QuaGVpZ2h0O1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBIYW5kbGUgcG9pbnRlciBldmVudHMgYW5kIGRpc3BhdGNoIHRvIHZpZXdwb3J0IGFzIEZVREdFLUV2ZW50XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBobmRQb2ludGVyRXZlbnQ6IEV2ZW50TGlzdGVuZXIgPSAoX2V2ZW50OiBFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZXZlbnQ6IFBvaW50ZXJFdmVudMaSID0gbmV3IFBvaW50ZXJFdmVudMaSKFwixpJcIiArIF9ldmVudC50eXBlLCA8UG9pbnRlckV2ZW50xpI+X2V2ZW50KTtcclxuICAgICAgICAgICAgdGhpcy5hZGRDYW52YXNQb3NpdGlvbihldmVudCk7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChldmVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEhhbmRsZSBrZXlib2FyZCBldmVudHMgYW5kIGRpc3BhdGNoIHRvIHZpZXdwb3J0IGFzIEZVREdFLUV2ZW50LCBpZiB0aGUgdmlld3BvcnQgaGFzIHRoZSBmb2N1c1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgaG5kS2V5Ym9hcmRFdmVudDogRXZlbnRMaXN0ZW5lciA9IChfZXZlbnQ6IEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5oYXNGb2N1cylcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgbGV0IGV2ZW50OiBLZXlib2FyZEV2ZW50xpIgPSBuZXcgS2V5Ym9hcmRFdmVudMaSKFwixpJcIiArIF9ldmVudC50eXBlLCA8S2V5Ym9hcmRFdmVudMaSPl9ldmVudCk7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChldmVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEhhbmRsZSB3aGVlbCBldmVudCBhbmQgZGlzcGF0Y2ggdG8gdmlld3BvcnQgYXMgRlVER0UtRXZlbnRcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIGhuZFdoZWVsRXZlbnQ6IEV2ZW50TGlzdGVuZXIgPSAoX2V2ZW50OiBFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZXZlbnQ6IFdoZWVsRXZlbnTGkiA9IG5ldyBXaGVlbEV2ZW50xpIoXCLGklwiICsgX2V2ZW50LnR5cGUsIDxXaGVlbEV2ZW50xpI+X2V2ZW50KTtcclxuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgYWN0aXZhdGVFdmVudChfdGFyZ2V0OiBFdmVudFRhcmdldCwgX3R5cGU6IHN0cmluZywgX2hhbmRsZXI6IEV2ZW50TGlzdGVuZXIsIF9vbjogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgICAgICBfdHlwZSA9IF90eXBlLnNsaWNlKDEpOyAvLyBjaGlwIHRoZSDGkmxvcmVudGluXHJcbiAgICAgICAgICAgIGlmIChfb24pXHJcbiAgICAgICAgICAgICAgICBfdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoX3R5cGUsIF9oYW5kbGVyKTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgX3RhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKF90eXBlLCBfaGFuZGxlcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGhuZENvbXBvbmVudEV2ZW50KF9ldmVudDogRXZlbnQpOiB2b2lkIHtcclxuICAgICAgICAgICAgRGVidWcubG9nKF9ldmVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vICNlbmRyZWdpb25cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ29sbGVjdCBhbGwgbGlnaHRzIGluIHRoZSBicmFuY2ggdG8gcGFzcyB0byBzaGFkZXJzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBjb2xsZWN0TGlnaHRzKCk6IHZvaWQge1xyXG4gICAgICAgICAgICAvLyBUT0RPOiBtYWtlIHByaXZhdGVcclxuICAgICAgICAgICAgdGhpcy5saWdodHMgPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2YgdGhpcy5icmFuY2guYnJhbmNoKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY21wTGlnaHRzOiBDb21wb25lbnRMaWdodFtdID0gbm9kZS5nZXRDb21wb25lbnRzKENvbXBvbmVudExpZ2h0KTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGNtcExpZ2h0IG9mIGNtcExpZ2h0cykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0eXBlOiBzdHJpbmcgPSBjbXBMaWdodC5nZXRMaWdodCgpLnR5cGU7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGxpZ2h0c09mVHlwZTogQ29tcG9uZW50TGlnaHRbXSA9IHRoaXMubGlnaHRzLmdldCh0eXBlKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWxpZ2h0c09mVHlwZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsaWdodHNPZlR5cGUgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5saWdodHMuc2V0KHR5cGUsIGxpZ2h0c09mVHlwZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGxpZ2h0c09mVHlwZS5wdXNoKGNtcExpZ2h0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDcmVhdGVzIGFuIG91dHB1dHN0cmluZyBhcyB2aXN1YWwgcmVwcmVzZW50YXRpb24gb2YgdGhpcyB2aWV3cG9ydHMgc2NlbmVncmFwaC4gQ2FsbGVkIGZvciB0aGUgcGFzc2VkIG5vZGUgYW5kIHJlY3Vyc2l2ZSBmb3IgYWxsIGl0cyBjaGlsZHJlbi5cclxuICAgICAgICAgKiBAcGFyYW0gX2Z1ZGdlTm9kZSBUaGUgbm9kZSB0byBjcmVhdGUgYSBzY2VuZWdyYXBoZW50cnkgZm9yLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgY3JlYXRlU2NlbmVHcmFwaChfZnVkZ2VOb2RlOiBOb2RlKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgLy8gVE9ETzogbW92ZSB0byBkZWJ1Zy1jbGFzc1xyXG4gICAgICAgICAgICBsZXQgb3V0cHV0OiBzdHJpbmcgPSBcIlwiO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBuYW1lIGluIF9mdWRnZU5vZGUuZ2V0Q2hpbGRyZW4oKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNoaWxkOiBOb2RlID0gX2Z1ZGdlTm9kZS5nZXRDaGlsZHJlbigpW25hbWVdO1xyXG4gICAgICAgICAgICAgICAgb3V0cHV0ICs9IFwiXFxuXCI7XHJcbiAgICAgICAgICAgICAgICBsZXQgY3VycmVudDogTm9kZSA9IGNoaWxkO1xyXG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnQuZ2V0UGFyZW50KCkgJiYgY3VycmVudC5nZXRQYXJlbnQoKS5nZXRQYXJlbnQoKSlcclxuICAgICAgICAgICAgICAgICAgICBvdXRwdXQgKz0gXCJ8XCI7XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoY3VycmVudC5nZXRQYXJlbnQoKSAmJiBjdXJyZW50LmdldFBhcmVudCgpLmdldFBhcmVudCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0ICs9IFwiICAgXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudCA9IGN1cnJlbnQuZ2V0UGFyZW50KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBvdXRwdXQgKz0gXCInLS1cIjtcclxuXHJcbiAgICAgICAgICAgICAgICBvdXRwdXQgKz0gY2hpbGQubmFtZTtcclxuICAgICAgICAgICAgICAgIG91dHB1dCArPSB0aGlzLmNyZWF0ZVNjZW5lR3JhcGgoY2hpbGQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBvdXRwdXQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgZXhwb3J0IGludGVyZmFjZSBNYXBFdmVudFR5cGVUb0xpc3RlbmVyIHtcclxuICAgICAgICBbZXZlbnRUeXBlOiBzdHJpbmddOiBFdmVudExpc3RlbmVyW107XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUeXBlcyBvZiBldmVudHMgc3BlY2lmaWMgdG8gRnVkZ2UsIGluIGFkZGl0aW9uIHRvIHRoZSBzdGFuZGFyZCBET00vQnJvd3Nlci1UeXBlcyBhbmQgY3VzdG9tIHN0cmluZ3NcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNvbnN0IGVudW0gRVZFTlQge1xyXG4gICAgICAgIC8qKiBkaXNwYXRjaGVkIHRvIHRhcmdldHMgcmVnaXN0ZXJlZCBhdCBbW0xvb3BdXSwgd2hlbiByZXF1ZXN0ZWQgYW5pbWF0aW9uIGZyYW1lIHN0YXJ0cyAqL1xyXG4gICAgICAgIExPT1BfRlJBTUUgPSBcImxvb3BGcmFtZVwiLFxyXG4gICAgICAgIC8qKiBkaXNwYXRjaGVkIHRvIGEgW1tDb21wb25lbnRdXSB3aGVuIGl0cyBiZWluZyBhZGRlZCB0byBhIFtbTm9kZV1dICovXHJcbiAgICAgICAgQ09NUE9ORU5UX0FERCA9IFwiY29tcG9uZW50QWRkXCIsXHJcbiAgICAgICAgLyoqIGRpc3BhdGNoZWQgdG8gYSBbW0NvbXBvbmVudF1dIHdoZW4gaXRzIGJlaW5nIHJlbW92ZWQgZnJvbSBhIFtbTm9kZV1dICovXHJcbiAgICAgICAgQ09NUE9ORU5UX1JFTU9WRSA9IFwiY29tcG9uZW50UmVtb3ZlXCIsXHJcbiAgICAgICAgLyoqIGRpc3BhdGNoZWQgdG8gYSBbW0NvbXBvbmVudF1dIHdoZW4gaXRzIGJlaW5nIGFjdGl2YXRlZCAqL1xyXG4gICAgICAgIENPTVBPTkVOVF9BQ1RJVkFURSA9IFwiY29tcG9uZW50QWN0aXZhdGVcIixcclxuICAgICAgICAvKiogZGlzcGF0Y2hlZCB0byBhIFtbQ29tcG9uZW50XV0gd2hlbiBpdHMgYmVpbmcgZGVhY3RpdmF0ZWQgKi9cclxuICAgICAgICBDT01QT05FTlRfREVBQ1RJVkFURSA9IFwiY29tcG9uZW50RGVhY3RpdmF0ZVwiLFxyXG4gICAgICAgIC8qKiBkaXNwYXRjaGVkIHRvIGEgY2hpbGQgW1tOb2RlXV0gYW5kIGl0cyBhbmNlc3RvcnMgYWZ0ZXIgaXQgd2FzIGFwcGVuZGVkIHRvIGEgcGFyZW50ICovXHJcbiAgICAgICAgQ0hJTERfQVBQRU5EID0gXCJjaGlsZEFkZFwiLFxyXG4gICAgICAgIC8qKiBkaXNwYXRjaGVkIHRvIGEgY2hpbGQgW1tOb2RlXV0gYW5kIGl0cyBhbmNlc3RvcnMganVzdCBiZWZvcmUgaXRzIGJlaW5nIHJlbW92ZWQgZnJvbSBpdHMgcGFyZW50ICovXHJcbiAgICAgICAgQ0hJTERfUkVNT1ZFID0gXCJjaGlsZFJlbW92ZVwiLFxyXG4gICAgICAgIC8qKiBkaXNwYXRjaGVkIHRvIGEgW1tNdXRhYmxlXV0gd2hlbiBpdHMgYmVpbmcgbXV0YXRlZCAqL1xyXG4gICAgICAgIE1VVEFURSA9IFwibXV0YXRlXCIsXHJcbiAgICAgICAgLyoqIGRpc3BhdGNoZWQgdG8gW1tWaWV3cG9ydF1dIHdoZW4gaXQgZ2V0cyB0aGUgZm9jdXMgdG8gcmVjZWl2ZSBrZXlib2FyZCBpbnB1dCAqL1xyXG4gICAgICAgIEZPQ1VTX0lOID0gXCJmb2N1c2luXCIsXHJcbiAgICAgICAgLyoqIGRpc3BhdGNoZWQgdG8gW1tWaWV3cG9ydF1dIHdoZW4gaXQgbG9zZXMgdGhlIGZvY3VzIHRvIHJlY2VpdmUga2V5Ym9hcmQgaW5wdXQgKi9cclxuICAgICAgICBGT0NVU19PVVQgPSBcImZvY3Vzb3V0XCIsXHJcbiAgICAgICAgLyoqIGRpc3BhdGNoZWQgdG8gW1tOb2RlXV0gd2hlbiBpdCdzIGRvbmUgc2VyaWFsaXppbmcgKi9cclxuICAgICAgICBOT0RFX1NFUklBTElaRUQgPSBcIm5vZGVTZXJpYWxpemVkXCIsXHJcbiAgICAgICAgLyoqIGRpc3BhdGNoZWQgdG8gW1tOb2RlXV0gd2hlbiBpdCdzIGRvbmUgZGVzZXJpYWxpemluZywgc28gYWxsIGNvbXBvbmVudHMsIGNoaWxkcmVuIGFuZCBhdHRyaWJ1dGVzIGFyZSBhdmFpbGFibGUgKi9cclxuICAgICAgICBOT0RFX0RFU0VSSUFMSVpFRCA9IFwibm9kZURlc2VyaWFsaXplZFwiLFxyXG4gICAgICAgIC8qKiBkaXNwYXRjaGVkIHRvIFtbTm9kZVJlc291cmNlSW5zdGFuY2VdXSB3aGVuIGl0J3MgY29udGVudCBpcyBzZXQgYWNjb3JkaW5nIHRvIGEgc2VyaWFsaXphdGlvbiBvZiBhIFtbTm9kZVJlc291cmNlXV0gICovXHJcbiAgICAgICAgTk9ERVJFU09VUkNFX0lOU1RBTlRJQVRFRCA9IFwibm9kZVJlc291cmNlSW5zdGFudGlhdGVkXCIsXHJcbiAgICAgICAgLyoqIGRpc3BhdGNoZWQgdG8gW1tUaW1lXV0gd2hlbiBpdCdzIHNjYWxpbmcgY2hhbmdlZCAgKi9cclxuICAgICAgICBUSU1FX1NDQUxFRCA9IFwidGltZVNjYWxlZFwiLFxyXG4gICAgICAgIC8qKiBkaXNwYXRjaGVkIHRvIFtbRmlsZUlvXV0gd2hlbiBhIGxpc3Qgb2YgZmlsZXMgaGFzIGJlZW4gbG9hZGVkICAqL1xyXG4gICAgICAgIEZJTEVfTE9BREVEID0gXCJmaWxlTG9hZGVkXCIsXHJcbiAgICAgICAgLyoqIGRpc3BhdGNoZWQgdG8gW1tGaWxlSW9dXSB3aGVuIGEgbGlzdCBvZiBmaWxlcyBoYXMgYmVlbiBzYXZlZCAqL1xyXG4gICAgICAgIEZJTEVfU0FWRUQgPSBcImZpbGVTYXZlZFwiXHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNvbnN0IGVudW0gRVZFTlRfUE9JTlRFUiB7XHJcbiAgICAgICAgVVAgPSBcIsaScG9pbnRlcnVwXCIsXHJcbiAgICAgICAgRE9XTiA9IFwixpJwb2ludGVyZG93blwiXHJcbiAgICB9XHJcbiAgICBleHBvcnQgY29uc3QgZW51bSBFVkVOVF9EUkFHRFJPUCB7XHJcbiAgICAgICAgRFJBRyA9IFwixpJkcmFnXCIsXHJcbiAgICAgICAgRFJPUCA9IFwixpJkcm9wXCIsXHJcbiAgICAgICAgU1RBUlQgPSBcIsaSZHJhZ3N0YXJ0XCIsXHJcbiAgICAgICAgRU5EID0gXCLGkmRyYWdlbmRcIixcclxuICAgICAgICBPVkVSID0gXCLGkmRyYWdvdmVyXCJcclxuICAgIH1cclxuICAgIGV4cG9ydCBjb25zdCBlbnVtIEVWRU5UX1dIRUVMIHtcclxuICAgICAgICBXSEVFTCA9IFwixpJ3aGVlbFwiXHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIFBvaW50ZXJFdmVudMaSIGV4dGVuZHMgUG9pbnRlckV2ZW50IHtcclxuICAgICAgICBwdWJsaWMgcG9pbnRlclg6IG51bWJlcjtcclxuICAgICAgICBwdWJsaWMgcG9pbnRlclk6IG51bWJlcjtcclxuICAgICAgICBwdWJsaWMgY2FudmFzWDogbnVtYmVyO1xyXG4gICAgICAgIHB1YmxpYyBjYW52YXNZOiBudW1iZXI7XHJcbiAgICAgICAgcHVibGljIGNsaWVudFJlY3Q6IENsaWVudFJlY3Q7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKHR5cGU6IHN0cmluZywgX2V2ZW50OiBQb2ludGVyRXZlbnTGkikge1xyXG4gICAgICAgICAgICBzdXBlcih0eXBlLCBfZXZlbnQpO1xyXG4gICAgICAgICAgICBsZXQgdGFyZ2V0OiBIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD5fZXZlbnQudGFyZ2V0O1xyXG4gICAgICAgICAgICB0aGlzLmNsaWVudFJlY3QgPSB0YXJnZXQuZ2V0Q2xpZW50UmVjdHMoKVswXTtcclxuICAgICAgICAgICAgdGhpcy5wb2ludGVyWCA9IF9ldmVudC5jbGllbnRYIC0gdGhpcy5jbGllbnRSZWN0LmxlZnQ7XHJcbiAgICAgICAgICAgIHRoaXMucG9pbnRlclkgPSBfZXZlbnQuY2xpZW50WSAtIHRoaXMuY2xpZW50UmVjdC50b3A7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBEcmFnRHJvcEV2ZW50xpIgZXh0ZW5kcyBEcmFnRXZlbnQge1xyXG4gICAgICAgIHB1YmxpYyBwb2ludGVyWDogbnVtYmVyO1xyXG4gICAgICAgIHB1YmxpYyBwb2ludGVyWTogbnVtYmVyO1xyXG4gICAgICAgIHB1YmxpYyBjYW52YXNYOiBudW1iZXI7XHJcbiAgICAgICAgcHVibGljIGNhbnZhc1k6IG51bWJlcjtcclxuICAgICAgICBwdWJsaWMgY2xpZW50UmVjdDogQ2xpZW50UmVjdDtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IodHlwZTogc3RyaW5nLCBfZXZlbnQ6IERyYWdEcm9wRXZlbnTGkikge1xyXG4gICAgICAgICAgICBzdXBlcih0eXBlLCBfZXZlbnQpO1xyXG4gICAgICAgICAgICBsZXQgdGFyZ2V0OiBIVE1MRWxlbWVudCA9IDxIVE1MRWxlbWVudD5fZXZlbnQudGFyZ2V0O1xyXG4gICAgICAgICAgICB0aGlzLmNsaWVudFJlY3QgPSB0YXJnZXQuZ2V0Q2xpZW50UmVjdHMoKVswXTtcclxuICAgICAgICAgICAgdGhpcy5wb2ludGVyWCA9IF9ldmVudC5jbGllbnRYIC0gdGhpcy5jbGllbnRSZWN0LmxlZnQ7XHJcbiAgICAgICAgICAgIHRoaXMucG9pbnRlclkgPSBfZXZlbnQuY2xpZW50WSAtIHRoaXMuY2xpZW50UmVjdC50b3A7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBXaGVlbEV2ZW50xpIgZXh0ZW5kcyBXaGVlbEV2ZW50IHtcclxuICAgICAgICBjb25zdHJ1Y3Rvcih0eXBlOiBzdHJpbmcsIF9ldmVudDogV2hlZWxFdmVudMaSKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKHR5cGUsIF9ldmVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQmFzZSBjbGFzcyBmb3IgRXZlbnRUYXJnZXQgc2luZ2xldG9ucywgd2hpY2ggYXJlIGZpeGVkIGVudGl0aWVzIGluIHRoZSBzdHJ1Y3R1cmUgb2YgRnVkZ2UsIHN1Y2ggYXMgdGhlIGNvcmUgbG9vcCBcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIEV2ZW50VGFyZ2V0U3RhdGljIGV4dGVuZHMgRXZlbnRUYXJnZXQge1xyXG4gICAgICAgIHByb3RlY3RlZCBzdGF0aWMgdGFyZ2V0U3RhdGljOiBFdmVudFRhcmdldFN0YXRpYyA9IG5ldyBFdmVudFRhcmdldFN0YXRpYygpO1xyXG5cclxuICAgICAgICBwcm90ZWN0ZWQgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGFkZEV2ZW50TGlzdGVuZXIoX3R5cGU6IHN0cmluZywgX2hhbmRsZXI6IEV2ZW50TGlzdGVuZXIpOiB2b2lkIHtcclxuICAgICAgICAgICAgRXZlbnRUYXJnZXRTdGF0aWMudGFyZ2V0U3RhdGljLmFkZEV2ZW50TGlzdGVuZXIoX3R5cGUsIF9oYW5kbGVyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyByZW1vdmVFdmVudExpc3RlbmVyKF90eXBlOiBzdHJpbmcsIF9oYW5kbGVyOiBFdmVudExpc3RlbmVyKTogdm9pZCB7XHJcbiAgICAgICAgICAgIEV2ZW50VGFyZ2V0U3RhdGljLnRhcmdldFN0YXRpYy5yZW1vdmVFdmVudExpc3RlbmVyKF90eXBlLCBfaGFuZGxlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZGlzcGF0Y2hFdmVudChfZXZlbnQ6IEV2ZW50KTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIEV2ZW50VGFyZ2V0U3RhdGljLnRhcmdldFN0YXRpYy5kaXNwYXRjaEV2ZW50KF9ldmVudCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgZXhwb3J0IGNsYXNzIEtleWJvYXJkRXZlbnTGkiBleHRlbmRzIEtleWJvYXJkRXZlbnQge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKHR5cGU6IHN0cmluZywgX2V2ZW50OiBLZXlib2FyZEV2ZW50xpIpIHtcclxuICAgICAgICAgICAgc3VwZXIodHlwZSwgX2V2ZW50KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBNYXBwaW5ncyBvZiBzdGFuZGFyZCBET00vQnJvd3Nlci1FdmVudHMgYXMgcGFzc2VkIGZyb20gYSBjYW52YXMgdG8gdGhlIHZpZXdwb3J0XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjb25zdCBlbnVtIEVWRU5UX0tFWUJPQVJEIHtcclxuICAgICAgICBVUCA9IFwixpJrZXl1cFwiLFxyXG4gICAgICAgIERPV04gPSBcIsaSa2V5ZG93blwiXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgY29kZXMgc2VudCBmcm9tIGEgc3RhbmRhcmQgZW5nbGlzaCBrZXlib2FyZCBsYXlvdXRcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGVudW0gS0VZQk9BUkRfQ09ERSB7XHJcbiAgICAgICAgQSA9IFwiS2V5QVwiLFxyXG4gICAgICAgIEIgPSBcIktleUJcIixcclxuICAgICAgICBDID0gXCJLZXlDXCIsXHJcbiAgICAgICAgRCA9IFwiS2V5RFwiLFxyXG4gICAgICAgIEUgPSBcIktleUVcIixcclxuICAgICAgICBGID0gXCJLZXlGXCIsXHJcbiAgICAgICAgRyA9IFwiS2V5R1wiLFxyXG4gICAgICAgIEggPSBcIktleUhcIixcclxuICAgICAgICBJID0gXCJLZXlJXCIsXHJcbiAgICAgICAgSiA9IFwiS2V5SlwiLFxyXG4gICAgICAgIEsgPSBcIktleUtcIixcclxuICAgICAgICBMID0gXCJLZXlMXCIsXHJcbiAgICAgICAgTSA9IFwiS2V5TVwiLFxyXG4gICAgICAgIE4gPSBcIktleU5cIixcclxuICAgICAgICBPID0gXCJLZXlPXCIsXHJcbiAgICAgICAgUCA9IFwiS2V5UFwiLFxyXG4gICAgICAgIFEgPSBcIktleVFcIixcclxuICAgICAgICBSID0gXCJLZXlSXCIsXHJcbiAgICAgICAgUyA9IFwiS2V5U1wiLFxyXG4gICAgICAgIFQgPSBcIktleVRcIixcclxuICAgICAgICBVID0gXCJLZXlVXCIsXHJcbiAgICAgICAgViA9IFwiS2V5VlwiLFxyXG4gICAgICAgIFcgPSBcIktleVdcIixcclxuICAgICAgICBYID0gXCJLZXlYXCIsXHJcbiAgICAgICAgWSA9IFwiS2V5WVwiLFxyXG4gICAgICAgIFogPSBcIktleVpcIixcclxuICAgICAgICBFU0MgPSBcIkVzY2FwZVwiLFxyXG4gICAgICAgIFpFUk8gPSBcIkRpZ2l0MFwiLFxyXG4gICAgICAgIE9ORSA9IFwiRGlnaXQxXCIsXHJcbiAgICAgICAgVFdPID0gXCJEaWdpdDJcIixcclxuICAgICAgICBUSFJFRSA9IFwiRGlnaXQzXCIsXHJcbiAgICAgICAgRk9VUiA9IFwiRGlnaXQ0XCIsXHJcbiAgICAgICAgRklWRSA9IFwiRGlnaXQ1XCIsXHJcbiAgICAgICAgU0lYID0gXCJEaWdpdDZcIixcclxuICAgICAgICBTRVZFTiA9IFwiRGlnaXQ3XCIsXHJcbiAgICAgICAgRUlHSFQgPSBcIkRpZ2l0OFwiLFxyXG4gICAgICAgIE5JTkUgPSBcIkRpZ2l0OVwiLFxyXG4gICAgICAgIE1JTlVTID0gXCJNaW51c1wiLFxyXG4gICAgICAgIEVRVUFMID0gXCJFcXVhbFwiLFxyXG4gICAgICAgIEJBQ0tTUEFDRSA9IFwiQmFja3NwYWNlXCIsXHJcbiAgICAgICAgVEFCVUxBVE9SID0gXCJUYWJcIixcclxuICAgICAgICBCUkFDS0VUX0xFRlQgPSBcIkJyYWNrZXRMZWZ0XCIsXHJcbiAgICAgICAgQlJBQ0tFVF9SSUdIVCA9IFwiQnJhY2tldFJpZ2h0XCIsXHJcbiAgICAgICAgRU5URVIgPSBcIkVudGVyXCIsXHJcbiAgICAgICAgQ1RSTF9MRUZUID0gXCJDb250cm9sTGVmdFwiLFxyXG4gICAgICAgIFNFTUlDT0xPTiA9IFwiU2VtaWNvbG9uXCIsXHJcbiAgICAgICAgUVVPVEUgPSBcIlF1b3RlXCIsXHJcbiAgICAgICAgQkFDS19RVU9URSA9IFwiQmFja3F1b3RlXCIsXHJcbiAgICAgICAgU0hJRlRfTEVGVCA9IFwiU2hpZnRMZWZ0XCIsXHJcbiAgICAgICAgQkFDS1NMQVNIID0gXCJCYWNrc2xhc2hcIixcclxuICAgICAgICBDT01NQSA9IFwiQ29tbWFcIixcclxuICAgICAgICBQRVJJT0QgPSBcIlBlcmlvZFwiLFxyXG4gICAgICAgIFNMQVNIID0gXCJTbGFzaFwiLFxyXG4gICAgICAgIFNISUZUX1JJR0hUID0gXCJTaGlmdFJpZ2h0XCIsXHJcbiAgICAgICAgTlVNUEFEX01VTFRJUExZID0gXCJOdW1wYWRNdWx0aXBseVwiLFxyXG4gICAgICAgIEFMVF9MRUZUID0gXCJBbHRMZWZ0XCIsXHJcbiAgICAgICAgU1BBQ0UgPSBcIlNwYWNlXCIsXHJcbiAgICAgICAgQ0FQU19MT0NLID0gXCJDYXBzTG9ja1wiLFxyXG4gICAgICAgIEYxID0gXCJGMVwiLFxyXG4gICAgICAgIEYyID0gXCJGMlwiLFxyXG4gICAgICAgIEYzID0gXCJGM1wiLFxyXG4gICAgICAgIEY0ID0gXCJGNFwiLFxyXG4gICAgICAgIEY1ID0gXCJGNVwiLFxyXG4gICAgICAgIEY2ID0gXCJGNlwiLFxyXG4gICAgICAgIEY3ID0gXCJGN1wiLFxyXG4gICAgICAgIEY4ID0gXCJGOFwiLFxyXG4gICAgICAgIEY5ID0gXCJGOVwiLFxyXG4gICAgICAgIEYxMCA9IFwiRjEwXCIsXHJcbiAgICAgICAgUEFVU0UgPSBcIlBhdXNlXCIsXHJcbiAgICAgICAgU0NST0xMX0xPQ0sgPSBcIlNjcm9sbExvY2tcIixcclxuICAgICAgICBOVU1QQUQ3ID0gXCJOdW1wYWQ3XCIsXHJcbiAgICAgICAgTlVNUEFEOCA9IFwiTnVtcGFkOFwiLFxyXG4gICAgICAgIE5VTVBBRDkgPSBcIk51bXBhZDlcIixcclxuICAgICAgICBOVU1QQURfU1VCVFJBQ1QgPSBcIk51bXBhZFN1YnRyYWN0XCIsXHJcbiAgICAgICAgTlVNUEFENCA9IFwiTnVtcGFkNFwiLFxyXG4gICAgICAgIE5VTVBBRDUgPSBcIk51bXBhZDVcIixcclxuICAgICAgICBOVU1QQUQ2ID0gXCJOdW1wYWQ2XCIsXHJcbiAgICAgICAgTlVNUEFEX0FERCA9IFwiTnVtcGFkQWRkXCIsXHJcbiAgICAgICAgTlVNUEFEMSA9IFwiTnVtcGFkMVwiLFxyXG4gICAgICAgIE5VTVBBRDIgPSBcIk51bXBhZDJcIixcclxuICAgICAgICBOVU1QQUQzID0gXCJOdW1wYWQzXCIsXHJcbiAgICAgICAgTlVNUEFEMCA9IFwiTnVtcGFkMFwiLFxyXG4gICAgICAgIE5VTVBBRF9ERUNJTUFMID0gXCJOdW1wYWREZWNpbWFsXCIsXHJcbiAgICAgICAgUFJJTlRfU0NSRUVOID0gXCJQcmludFNjcmVlblwiLFxyXG4gICAgICAgIElOVExfQkFDS19TTEFTSCA9IFwiSW50bEJhY2tTbGFzaFwiLFxyXG4gICAgICAgIEYxMSA9IFwiRjExXCIsXHJcbiAgICAgICAgRjEyID0gXCJGMTJcIixcclxuICAgICAgICBOVU1QQURfRVFVQUwgPSBcIk51bXBhZEVxdWFsXCIsXHJcbiAgICAgICAgRjEzID0gXCJGMTNcIixcclxuICAgICAgICBGMTQgPSBcIkYxNFwiLFxyXG4gICAgICAgIEYxNSA9IFwiRjE1XCIsXHJcbiAgICAgICAgRjE2ID0gXCJGMTZcIixcclxuICAgICAgICBGMTcgPSBcIkYxN1wiLFxyXG4gICAgICAgIEYxOCA9IFwiRjE4XCIsXHJcbiAgICAgICAgRjE5ID0gXCJGMTlcIixcclxuICAgICAgICBGMjAgPSBcIkYyMFwiLFxyXG4gICAgICAgIEYyMSA9IFwiRjIxXCIsXHJcbiAgICAgICAgRjIyID0gXCJGMjJcIixcclxuICAgICAgICBGMjMgPSBcIkYyM1wiLFxyXG4gICAgICAgIEYyNCA9IFwiRjI0XCIsXHJcbiAgICAgICAgS0FOQV9NT0RFID0gXCJLYW5hTW9kZVwiLFxyXG4gICAgICAgIExBTkcyID0gXCJMYW5nMlwiLFxyXG4gICAgICAgIExBTkcxID0gXCJMYW5nMVwiLFxyXG4gICAgICAgIElOVExfUk8gPSBcIkludGxSb1wiLFxyXG4gICAgICAgIENPTlZFUlQgPSBcIkNvbnZlcnRcIixcclxuICAgICAgICBOT05fQ09OVkVSVCA9IFwiTm9uQ29udmVydFwiLFxyXG4gICAgICAgIElOVExfWUVOID0gXCJJbnRsWWVuXCIsXHJcbiAgICAgICAgTlVNUEFEX0NPTU1BID0gXCJOdW1wYWRDb21tYVwiLFxyXG4gICAgICAgIFVORE8gPSBcIlVuZG9cIixcclxuICAgICAgICBQQVNURSA9IFwiUGFzdGVcIixcclxuICAgICAgICBNRURJQV9UUkFDS19QUkVWSU9VUyA9IFwiTWVkaWFUcmFja1ByZXZpb3VzXCIsXHJcbiAgICAgICAgQ1VUID0gXCJDdXRcIixcclxuICAgICAgICBDT1BZID0gXCJDb3B5XCIsXHJcbiAgICAgICAgTUVESUFfVFJBQ0tfTkVYVCA9IFwiTWVkaWFUcmFja05leHRcIixcclxuICAgICAgICBOVU1QQURfRU5URVIgPSBcIk51bXBhZEVudGVyXCIsXHJcbiAgICAgICAgQ1RSTF9SSUdIVCA9IFwiQ29udHJvbFJpZ2h0XCIsXHJcbiAgICAgICAgQVVESU9fVk9MVU1FX01VVEUgPSBcIkF1ZGlvVm9sdW1lTXV0ZVwiLFxyXG4gICAgICAgIExBVU5DSF9BUFAyID0gXCJMYXVuY2hBcHAyXCIsXHJcbiAgICAgICAgTUVESUFfUExBWV9QQVVTRSA9IFwiTWVkaWFQbGF5UGF1c2VcIixcclxuICAgICAgICBNRURJQV9TVE9QID0gXCJNZWRpYVN0b3BcIixcclxuICAgICAgICBFSkVDVCA9IFwiRWplY3RcIixcclxuICAgICAgICBBVURJT19WT0xVTUVfRE9XTiA9IFwiQXVkaW9Wb2x1bWVEb3duXCIsXHJcbiAgICAgICAgVk9MVU1FX0RPV04gPSBcIlZvbHVtZURvd25cIixcclxuICAgICAgICBBVURJT19WT0xVTUVfVVAgPSBcIkF1ZGlvVm9sdW1lVXBcIixcclxuICAgICAgICBWT0xVTUVfVVAgPSBcIlZvbHVtZVVwXCIsXHJcbiAgICAgICAgQlJPV1NFUl9IT01FID0gXCJCcm93c2VySG9tZVwiLFxyXG4gICAgICAgIE5VTVBBRF9ESVZJREUgPSBcIk51bXBhZERpdmlkZVwiLFxyXG4gICAgICAgIEFMVF9SSUdIVCA9IFwiQWx0UmlnaHRcIixcclxuICAgICAgICBIRUxQID0gXCJIZWxwXCIsXHJcbiAgICAgICAgTlVNX0xPQ0sgPSBcIk51bUxvY2tcIixcclxuICAgICAgICBIT01FID0gXCJIb21lXCIsXHJcbiAgICAgICAgQVJST1dfVVAgPSBcIkFycm93VXBcIixcclxuICAgICAgICBBUlJPV19SSUdIVCA9IFwiQXJyb3dSaWdodFwiLFxyXG4gICAgICAgIEFSUk9XX0RPV04gPSBcIkFycm93RG93blwiLFxyXG4gICAgICAgIEFSUk9XX0xFRlQgPSBcIkFycm93TGVmdFwiLFxyXG4gICAgICAgIEVORCA9IFwiRW5kXCIsXHJcbiAgICAgICAgUEFHRV9VUCA9IFwiUGFnZVVwXCIsXHJcbiAgICAgICAgUEFHRV9ET1dOID0gXCJQYWdlRG93blwiLFxyXG4gICAgICAgIElOU0VSVCA9IFwiSW5zZXJ0XCIsXHJcbiAgICAgICAgREVMRVRFID0gXCJEZWxldGVcIixcclxuICAgICAgICBNRVRBX0xFRlQgPSBcIk1ldGFfTGVmdFwiLFxyXG4gICAgICAgIE9TX0xFRlQgPSBcIk9TTGVmdFwiLFxyXG4gICAgICAgIE1FVEFfUklHSFQgPSBcIk1ldGFSaWdodFwiLFxyXG4gICAgICAgIE9TX1JJR0hUID0gXCJPU1JpZ2h0XCIsXHJcbiAgICAgICAgQ09OVEVYVF9NRU5VID0gXCJDb250ZXh0TWVudVwiLFxyXG4gICAgICAgIFBPV0VSID0gXCJQb3dlclwiLFxyXG4gICAgICAgIEJST1dTRVJfU0VBUkNIID0gXCJCcm93c2VyU2VhcmNoXCIsXHJcbiAgICAgICAgQlJPV1NFUl9GQVZPUklURVMgPSBcIkJyb3dzZXJGYXZvcml0ZXNcIixcclxuICAgICAgICBCUk9XU0VSX1JFRlJFU0ggPSBcIkJyb3dzZXJSZWZyZXNoXCIsXHJcbiAgICAgICAgQlJPV1NFUl9TVE9QID0gXCJCcm93c2VyU3RvcFwiLFxyXG4gICAgICAgIEJST1dTRVJfRk9SV0FSRCA9IFwiQnJvd3NlckZvcndhcmRcIixcclxuICAgICAgICBCUk9XU0VSX0JBQ0sgPSBcIkJyb3dzZXJCYWNrXCIsXHJcbiAgICAgICAgTEFVTkNIX0FQUDEgPSBcIkxhdW5jaEFwcDFcIixcclxuICAgICAgICBMQVVOQ0hfTUFJTCA9IFwiTGF1bmNoTWFpbFwiLFxyXG4gICAgICAgIExBVU5DSF9NRURJQV9QTEFZRVIgPSBcIkxhdW5jaE1lZGlhUGxheWVyXCIsXHJcblxyXG4gICAgICAgIC8vbWFjIGJyaW5ncyB0aGlzIGJ1dHR0b25cclxuICAgICAgICBGTiA9IFwiRm5cIiwgLy9ubyBldmVudCBmaXJlZCBhY3R1YWxseVxyXG5cclxuICAgICAgICAvL0xpbnV4IGJyaW5ncyB0aGVzZVxyXG4gICAgICAgIEFHQUlOID0gXCJBZ2FpblwiLFxyXG4gICAgICAgIFBST1BTID0gXCJQcm9wc1wiLFxyXG4gICAgICAgIFNFTEVDVCA9IFwiU2VsZWN0XCIsXHJcbiAgICAgICAgT1BFTiA9IFwiT3BlblwiLFxyXG4gICAgICAgIEZJTkQgPSBcIkZpbmRcIixcclxuICAgICAgICBXQUtFX1VQID0gXCJXYWtlVXBcIixcclxuICAgICAgICBOVU1QQURfUEFSRU5UX0xFRlQgPSBcIk51bXBhZFBhcmVudExlZnRcIixcclxuICAgICAgICBOVU1QQURfUEFSRU5UX1JJR0hUID0gXCJOdW1wYWRQYXJlbnRSaWdodFwiLFxyXG5cclxuICAgICAgICAvL2FuZHJvaWRcclxuICAgICAgICBTTEVFUCA9IFwiU2xlZXBcIlxyXG4gICAgfVxyXG4gICAgLyogXHJcbiAgICBGaXJlZm94IGNhbid0IG1ha2UgdXNlIG9mIHRob3NlIGJ1dHRvbnMgYW5kIENvbWJpbmF0aW9uczpcclxuICAgIFNJTkdFTEVfQlVUVE9OUzpcclxuICAgICBEcnVjayxcclxuICAgIENPTUJJTkFUSU9OUzpcclxuICAgICBTaGlmdCArIEYxMCwgU2hpZnQgKyBOdW1wYWQ1LFxyXG4gICAgIENUUkwgKyBxLCBDVFJMICsgRjQsXHJcbiAgICAgQUxUICsgRjEsIEFMVCArIEYyLCBBTFQgKyBGMywgQUxUICsgRjcsIEFMVCArIEY4LCBBTFQgKyBGMTBcclxuICAgIE9wZXJhIHdvbid0IGRvIGdvb2Qgd2l0aCB0aGVzZSBCdXR0b25zIGFuZCBjb21iaW5hdGlvbnM6XHJcbiAgICBTSU5HTEVfQlVUVE9OUzpcclxuICAgICBGbG9hdDMyQXJyYXksIEYxMSwgQUxULFxyXG4gICAgQ09NQklOQVRJT05TOlxyXG4gICAgIENUUkwgKyBxLCBDVFJMICsgdCwgQ1RSTCArIGgsIENUUkwgKyBnLCBDVFJMICsgbiwgQ1RSTCArIGYgXHJcbiAgICAgQUxUICsgRjEsIEFMVCArIEYyLCBBTFQgKyBGNCwgQUxUICsgRjUsIEFMVCArIEY2LCBBTFQgKyBGNywgQUxUICsgRjgsIEFMVCArIEYxMFxyXG4gICAgICovXHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgQm9yZGVyIHtcclxuICAgICAgICBsZWZ0OiBudW1iZXI7XHJcbiAgICAgICAgdG9wOiBudW1iZXI7XHJcbiAgICAgICAgcmlnaHQ6IG51bWJlcjtcclxuICAgICAgICBib3R0b206IG51bWJlcjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZyYW1pbmcgZGVzY3JpYmVzIGhvdyB0byBtYXAgYSByZWN0YW5nbGUgaW50byBhIGdpdmVuIGZyYW1lXHJcbiAgICAgKiBhbmQgaG93IHBvaW50cyBpbiB0aGUgZnJhbWUgY29ycmVzcG9uZCB0byBwb2ludHMgaW4gdGhlIHJlc3VsdGluZyByZWN0YW5nbGUgXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBhYnN0cmFjdCBjbGFzcyBGcmFtaW5nIGV4dGVuZHMgTXV0YWJsZSB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogTWFwcyBhIHBvaW50IGluIHRoZSBnaXZlbiBmcmFtZSBhY2NvcmRpbmcgdG8gdGhpcyBmcmFtaW5nXHJcbiAgICAgICAgICogQHBhcmFtIF9wb2ludEluRnJhbWUgVGhlIHBvaW50IGluIHRoZSBmcmFtZSBnaXZlblxyXG4gICAgICAgICAqIEBwYXJhbSBfcmVjdEZyYW1lIFRoZSBmcmFtZSB0aGUgcG9pbnQgaXMgcmVsYXRpdmUgdG9cclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgYWJzdHJhY3QgZ2V0UG9pbnQoX3BvaW50SW5GcmFtZTogVmVjdG9yMiwgX3JlY3RGcmFtZTogUmVjdGFuZ2xlKTogVmVjdG9yMjtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogTWFwcyBhIHBvaW50IGluIGEgZ2l2ZW4gcmVjdGFuZ2xlIGJhY2sgdG8gYSBjYWxjdWxhdGVkIGZyYW1lIG9mIG9yaWdpblxyXG4gICAgICAgICAqIEBwYXJhbSBfcG9pbnQgVGhlIHBvaW50IGluIHRoZSByZWN0YW5nbGVcclxuICAgICAgICAgKiBAcGFyYW0gX3JlY3QgVGhlIHJlY3RhbmdsZSB0aGUgcG9pbnQgaXMgcmVsYXRpdmUgdG9cclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgYWJzdHJhY3QgZ2V0UG9pbnRJbnZlcnNlKF9wb2ludDogVmVjdG9yMiwgX3JlY3Q6IFJlY3RhbmdsZSk6IFZlY3RvcjI7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRha2VzIGEgcmVjdGFuZ2xlIGFzIHRoZSBmcmFtZSBhbmQgY3JlYXRlcyBhIG5ldyByZWN0YW5nbGUgYWNjb3JkaW5nIHRvIHRoZSBmcmFtaW5nXHJcbiAgICAgICAgICogQHBhcmFtIF9yZWN0RnJhbWVcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgYWJzdHJhY3QgZ2V0UmVjdChfcmVjdEZyYW1lOiBSZWN0YW5nbGUpOiBSZWN0YW5nbGU7XHJcbiAgICAgICAgcHJvdGVjdGVkIHJlZHVjZU11dGF0b3IoX211dGF0b3I6IE11dGF0b3IpOiB2b2lkIHsvKiogKi8gfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIHJlc3VsdGluZyByZWN0YW5nbGUgaGFzIGEgZml4ZWQgd2lkdGggYW5kIGhlaWdodCBhbmQgZGlzcGxheSBzaG91bGQgc2NhbGUgdG8gZml0IHRoZSBmcmFtZVxyXG4gICAgICogUG9pbnRzIGFyZSBzY2FsZWQgaW4gdGhlIHNhbWUgcmF0aW9cclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIEZyYW1pbmdGaXhlZCBleHRlbmRzIEZyYW1pbmcge1xyXG4gICAgICAgIHB1YmxpYyB3aWR0aDogbnVtYmVyID0gMzAwO1xyXG4gICAgICAgIHB1YmxpYyBoZWlnaHQ6IG51bWJlciA9IDE1MDtcclxuXHJcbiAgICAgICAgcHVibGljIHNldFNpemUoX3dpZHRoOiBudW1iZXIsIF9oZWlnaHQ6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLndpZHRoID0gX3dpZHRoO1xyXG4gICAgICAgICAgICB0aGlzLmhlaWdodCA9IF9oZWlnaHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0UG9pbnQoX3BvaW50SW5GcmFtZTogVmVjdG9yMiwgX3JlY3RGcmFtZTogUmVjdGFuZ2xlKTogVmVjdG9yMiB7XHJcbiAgICAgICAgICAgIGxldCByZXN1bHQ6IFZlY3RvcjIgPSBuZXcgVmVjdG9yMihcclxuICAgICAgICAgICAgICAgIHRoaXMud2lkdGggKiAoX3BvaW50SW5GcmFtZS54IC0gX3JlY3RGcmFtZS54KSAvIF9yZWN0RnJhbWUud2lkdGgsXHJcbiAgICAgICAgICAgICAgICB0aGlzLmhlaWdodCAqIChfcG9pbnRJbkZyYW1lLnkgLSBfcmVjdEZyYW1lLnkpIC8gX3JlY3RGcmFtZS5oZWlnaHRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRQb2ludEludmVyc2UoX3BvaW50OiBWZWN0b3IyLCBfcmVjdDogUmVjdGFuZ2xlKTogVmVjdG9yMiB7XHJcbiAgICAgICAgICAgIGxldCByZXN1bHQ6IFZlY3RvcjIgPSBuZXcgVmVjdG9yMihcclxuICAgICAgICAgICAgICAgIF9wb2ludC54ICogX3JlY3Qud2lkdGggLyB0aGlzLndpZHRoICsgX3JlY3QueCxcclxuICAgICAgICAgICAgICAgIF9wb2ludC55ICogX3JlY3QuaGVpZ2h0IC8gdGhpcy5oZWlnaHQgKyBfcmVjdC55XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0UmVjdChfcmVjdEZyYW1lOiBSZWN0YW5nbGUpOiBSZWN0YW5nbGUge1xyXG4gICAgICAgICAgICByZXR1cm4gUmVjdGFuZ2xlLkdFVCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBXaWR0aCBhbmQgaGVpZ2h0IG9mIHRoZSByZXN1bHRpbmcgcmVjdGFuZ2xlIGFyZSBmcmFjdGlvbnMgb2YgdGhvc2Ugb2YgdGhlIGZyYW1lLCBzY2FsZWQgYnkgbm9ybWVkIHZhbHVlcyBub3JtV2lkdGggYW5kIG5vcm1IZWlnaHQuXHJcbiAgICAgKiBEaXNwbGF5IHNob3VsZCBzY2FsZSB0byBmaXQgdGhlIGZyYW1lIGFuZCBwb2ludHMgYXJlIHNjYWxlZCBpbiB0aGUgc2FtZSByYXRpb1xyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgRnJhbWluZ1NjYWxlZCBleHRlbmRzIEZyYW1pbmcge1xyXG4gICAgICAgIHB1YmxpYyBub3JtV2lkdGg6IG51bWJlciA9IDEuMDtcclxuICAgICAgICBwdWJsaWMgbm9ybUhlaWdodDogbnVtYmVyID0gMS4wO1xyXG5cclxuICAgICAgICBwdWJsaWMgc2V0U2NhbGUoX25vcm1XaWR0aDogbnVtYmVyLCBfbm9ybUhlaWdodDogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMubm9ybVdpZHRoID0gX25vcm1XaWR0aDtcclxuICAgICAgICAgICAgdGhpcy5ub3JtSGVpZ2h0ID0gX25vcm1IZWlnaHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0UG9pbnQoX3BvaW50SW5GcmFtZTogVmVjdG9yMiwgX3JlY3RGcmFtZTogUmVjdGFuZ2xlKTogVmVjdG9yMiB7XHJcbiAgICAgICAgICAgIGxldCByZXN1bHQ6IFZlY3RvcjIgPSBuZXcgVmVjdG9yMihcclxuICAgICAgICAgICAgICAgIHRoaXMubm9ybVdpZHRoICogKF9wb2ludEluRnJhbWUueCAtIF9yZWN0RnJhbWUueCksXHJcbiAgICAgICAgICAgICAgICB0aGlzLm5vcm1IZWlnaHQgKiAoX3BvaW50SW5GcmFtZS55IC0gX3JlY3RGcmFtZS55KVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldFBvaW50SW52ZXJzZShfcG9pbnQ6IFZlY3RvcjIsIF9yZWN0OiBSZWN0YW5nbGUpOiBWZWN0b3IyIHtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdDogVmVjdG9yMiA9IG5ldyBWZWN0b3IyKFxyXG4gICAgICAgICAgICAgICAgX3BvaW50LnggLyB0aGlzLm5vcm1XaWR0aCArIF9yZWN0LngsXHJcbiAgICAgICAgICAgICAgICBfcG9pbnQueSAvIHRoaXMubm9ybUhlaWdodCArIF9yZWN0LnlcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWN0KF9yZWN0RnJhbWU6IFJlY3RhbmdsZSk6IFJlY3RhbmdsZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBSZWN0YW5nbGUuR0VUKDAsIDAsIHRoaXMubm9ybVdpZHRoICogX3JlY3RGcmFtZS53aWR0aCwgdGhpcy5ub3JtSGVpZ2h0ICogX3JlY3RGcmFtZS5oZWlnaHQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSByZXN1bHRpbmcgcmVjdGFuZ2xlIGZpdHMgaW50byBhIG1hcmdpbiBnaXZlbiBhcyBmcmFjdGlvbnMgb2YgdGhlIHNpemUgb2YgdGhlIGZyYW1lIGdpdmVuIGJ5IG5vcm1BbmNob3JcclxuICAgICAqIHBsdXMgYW4gYWJzb2x1dGUgcGFkZGluZyBnaXZlbiBieSBwaXhlbEJvcmRlci4gRGlzcGxheSBzaG91bGQgZml0IGludG8gdGhpcy5cclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIEZyYW1pbmdDb21wbGV4IGV4dGVuZHMgRnJhbWluZyB7XHJcbiAgICAgICAgcHVibGljIG1hcmdpbjogQm9yZGVyID0geyBsZWZ0OiAwLCB0b3A6IDAsIHJpZ2h0OiAwLCBib3R0b206IDAgfTtcclxuICAgICAgICBwdWJsaWMgcGFkZGluZzogQm9yZGVyID0geyBsZWZ0OiAwLCB0b3A6IDAsIHJpZ2h0OiAwLCBib3R0b206IDAgfTtcclxuXHJcbiAgICAgICAgcHVibGljIGdldFBvaW50KF9wb2ludEluRnJhbWU6IFZlY3RvcjIsIF9yZWN0RnJhbWU6IFJlY3RhbmdsZSk6IFZlY3RvcjIge1xyXG4gICAgICAgICAgICBsZXQgcmVzdWx0OiBWZWN0b3IyID0gbmV3IFZlY3RvcjIoXHJcbiAgICAgICAgICAgICAgICBfcG9pbnRJbkZyYW1lLnggLSB0aGlzLnBhZGRpbmcubGVmdCAtIHRoaXMubWFyZ2luLmxlZnQgKiBfcmVjdEZyYW1lLndpZHRoLFxyXG4gICAgICAgICAgICAgICAgX3BvaW50SW5GcmFtZS55IC0gdGhpcy5wYWRkaW5nLnRvcCAtIHRoaXMubWFyZ2luLnRvcCAqIF9yZWN0RnJhbWUuaGVpZ2h0XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHB1YmxpYyBnZXRQb2ludEludmVyc2UoX3BvaW50OiBWZWN0b3IyLCBfcmVjdDogUmVjdGFuZ2xlKTogVmVjdG9yMiB7XHJcbiAgICAgICAgICAgIGxldCByZXN1bHQ6IFZlY3RvcjIgPSBuZXcgVmVjdG9yMihcclxuICAgICAgICAgICAgICAgIF9wb2ludC54ICsgdGhpcy5wYWRkaW5nLmxlZnQgKyB0aGlzLm1hcmdpbi5sZWZ0ICogX3JlY3Qud2lkdGgsXHJcbiAgICAgICAgICAgICAgICBfcG9pbnQueSArIHRoaXMucGFkZGluZy50b3AgKyB0aGlzLm1hcmdpbi50b3AgKiBfcmVjdC5oZWlnaHRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWN0KF9yZWN0RnJhbWU6IFJlY3RhbmdsZSk6IFJlY3RhbmdsZSB7XHJcbiAgICAgICAgICAgIGlmICghX3JlY3RGcmFtZSlcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG5cclxuICAgICAgICAgICAgbGV0IG1pblg6IG51bWJlciA9IF9yZWN0RnJhbWUueCArIHRoaXMubWFyZ2luLmxlZnQgKiBfcmVjdEZyYW1lLndpZHRoICsgdGhpcy5wYWRkaW5nLmxlZnQ7XHJcbiAgICAgICAgICAgIGxldCBtaW5ZOiBudW1iZXIgPSBfcmVjdEZyYW1lLnkgKyB0aGlzLm1hcmdpbi50b3AgKiBfcmVjdEZyYW1lLmhlaWdodCArIHRoaXMucGFkZGluZy50b3A7XHJcbiAgICAgICAgICAgIGxldCBtYXhYOiBudW1iZXIgPSBfcmVjdEZyYW1lLnggKyAoMSAtIHRoaXMubWFyZ2luLnJpZ2h0KSAqIF9yZWN0RnJhbWUud2lkdGggLSB0aGlzLnBhZGRpbmcucmlnaHQ7XHJcbiAgICAgICAgICAgIGxldCBtYXhZOiBudW1iZXIgPSBfcmVjdEZyYW1lLnkgKyAoMSAtIHRoaXMubWFyZ2luLmJvdHRvbSkgKiBfcmVjdEZyYW1lLmhlaWdodCAtIHRoaXMucGFkZGluZy5ib3R0b207XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gUmVjdGFuZ2xlLkdFVChtaW5YLCBtaW5ZLCBtYXhYIC0gbWluWCwgbWF4WSAtIG1pblkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldE11dGF0b3IoKTogTXV0YXRvciB7XHJcbiAgICAgICAgICAgIHJldHVybiB7IG1hcmdpbjogdGhpcy5tYXJnaW4sIHBhZGRpbmc6IHRoaXMucGFkZGluZyB9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2ltcGxlIGNsYXNzIGZvciAzeDMgbWF0cml4IG9wZXJhdGlvbnMgKFRoaXMgY2xhc3MgY2FuIG9ubHkgaGFuZGxlIDJEXHJcbiAgICAgKiB0cmFuc2Zvcm1hdGlvbnMuIENvdWxkIGJlIHJlbW92ZWQgYWZ0ZXIgYXBwbHlpbmcgZnVsbCAyRCBjb21wYXRpYmlsaXR5IHRvIE1hdDQpLlxyXG4gICAgICogQGF1dGhvcnMgSmFzY2hhIEthcmFnw7ZsLCBIRlUsIDIwMTkgfCBKaXJrYSBEZWxsJ09yby1GcmllZGwsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgTWF0cml4M3gzIHtcclxuXHJcbiAgICAgICAgcHVibGljIGRhdGE6IG51bWJlcltdO1xyXG5cclxuICAgICAgICBwdWJsaWMgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IFtcclxuICAgICAgICAgICAgICAgIDEsIDAsIDAsXHJcbiAgICAgICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAgICAgMCwgMCwgMVxyXG4gICAgICAgICAgICBdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBwcm9qZWN0aW9uKF93aWR0aDogbnVtYmVyLCBfaGVpZ2h0OiBudW1iZXIpOiBNYXRyaXgzeDMge1xyXG4gICAgICAgICAgICBsZXQgbWF0cml4OiBNYXRyaXgzeDMgPSBuZXcgTWF0cml4M3gzO1xyXG4gICAgICAgICAgICBtYXRyaXguZGF0YSA9IFtcclxuICAgICAgICAgICAgICAgIDIgLyBfd2lkdGgsIDAsIDAsXHJcbiAgICAgICAgICAgICAgICAwLCAtMiAvIF9oZWlnaHQsIDAsXHJcbiAgICAgICAgICAgICAgICAtMSwgMSwgMVxyXG4gICAgICAgICAgICBdO1xyXG4gICAgICAgICAgICByZXR1cm4gbWF0cml4O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldCBEYXRhKCk6IG51bWJlcltdIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0YTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBpZGVudGl0eSgpOiBNYXRyaXgzeDMge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IE1hdHJpeDN4MztcclxuICAgICAgICB9XHJcbiAgICAgICAgcHVibGljIHRyYW5zbGF0ZShfbWF0cml4OiBNYXRyaXgzeDMsIF94VHJhbnNsYXRpb246IG51bWJlciwgX3lUcmFuc2xhdGlvbjogbnVtYmVyKTogTWF0cml4M3gzIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubXVsdGlwbHkoX21hdHJpeCwgdGhpcy50cmFuc2xhdGlvbihfeFRyYW5zbGF0aW9uLCBfeVRyYW5zbGF0aW9uKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgcm90YXRlKF9tYXRyaXg6IE1hdHJpeDN4MywgX2FuZ2xlSW5EZWdyZWVzOiBudW1iZXIpOiBNYXRyaXgzeDMge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tdWx0aXBseShfbWF0cml4LCB0aGlzLnJvdGF0aW9uKF9hbmdsZUluRGVncmVlcykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHNjYWxlKF9tYXRyaXg6IE1hdHJpeDN4MywgX3hTY2FsZTogbnVtYmVyLCBfeXNjYWxlOiBudW1iZXIpOiBNYXRyaXgzeDMge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tdWx0aXBseShfbWF0cml4LCB0aGlzLnNjYWxpbmcoX3hTY2FsZSwgX3lzY2FsZSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG11bHRpcGx5KF9hOiBNYXRyaXgzeDMsIF9iOiBNYXRyaXgzeDMpOiBNYXRyaXgzeDMge1xyXG4gICAgICAgICAgICBsZXQgYTAwOiBudW1iZXIgPSBfYS5kYXRhWzAgKiAzICsgMF07XHJcbiAgICAgICAgICAgIGxldCBhMDE6IG51bWJlciA9IF9hLmRhdGFbMCAqIDMgKyAxXTtcclxuICAgICAgICAgICAgbGV0IGEwMjogbnVtYmVyID0gX2EuZGF0YVswICogMyArIDJdO1xyXG4gICAgICAgICAgICBsZXQgYTEwOiBudW1iZXIgPSBfYS5kYXRhWzEgKiAzICsgMF07XHJcbiAgICAgICAgICAgIGxldCBhMTE6IG51bWJlciA9IF9hLmRhdGFbMSAqIDMgKyAxXTtcclxuICAgICAgICAgICAgbGV0IGExMjogbnVtYmVyID0gX2EuZGF0YVsxICogMyArIDJdO1xyXG4gICAgICAgICAgICBsZXQgYTIwOiBudW1iZXIgPSBfYS5kYXRhWzIgKiAzICsgMF07XHJcbiAgICAgICAgICAgIGxldCBhMjE6IG51bWJlciA9IF9hLmRhdGFbMiAqIDMgKyAxXTtcclxuICAgICAgICAgICAgbGV0IGEyMjogbnVtYmVyID0gX2EuZGF0YVsyICogMyArIDJdO1xyXG4gICAgICAgICAgICBsZXQgYjAwOiBudW1iZXIgPSBfYi5kYXRhWzAgKiAzICsgMF07XHJcbiAgICAgICAgICAgIGxldCBiMDE6IG51bWJlciA9IF9iLmRhdGFbMCAqIDMgKyAxXTtcclxuICAgICAgICAgICAgbGV0IGIwMjogbnVtYmVyID0gX2IuZGF0YVswICogMyArIDJdO1xyXG4gICAgICAgICAgICBsZXQgYjEwOiBudW1iZXIgPSBfYi5kYXRhWzEgKiAzICsgMF07XHJcbiAgICAgICAgICAgIGxldCBiMTE6IG51bWJlciA9IF9iLmRhdGFbMSAqIDMgKyAxXTtcclxuICAgICAgICAgICAgbGV0IGIxMjogbnVtYmVyID0gX2IuZGF0YVsxICogMyArIDJdO1xyXG4gICAgICAgICAgICBsZXQgYjIwOiBudW1iZXIgPSBfYi5kYXRhWzIgKiAzICsgMF07XHJcbiAgICAgICAgICAgIGxldCBiMjE6IG51bWJlciA9IF9iLmRhdGFbMiAqIDMgKyAxXTtcclxuICAgICAgICAgICAgbGV0IGIyMjogbnVtYmVyID0gX2IuZGF0YVsyICogMyArIDJdO1xyXG4gICAgICAgICAgICBsZXQgbWF0cml4OiBNYXRyaXgzeDMgPSBuZXcgTWF0cml4M3gzO1xyXG4gICAgICAgICAgICBtYXRyaXguZGF0YSA9IFtcclxuICAgICAgICAgICAgICAgIGIwMCAqIGEwMCArIGIwMSAqIGExMCArIGIwMiAqIGEyMCxcclxuICAgICAgICAgICAgICAgIGIwMCAqIGEwMSArIGIwMSAqIGExMSArIGIwMiAqIGEyMSxcclxuICAgICAgICAgICAgICAgIGIwMCAqIGEwMiArIGIwMSAqIGExMiArIGIwMiAqIGEyMixcclxuICAgICAgICAgICAgICAgIGIxMCAqIGEwMCArIGIxMSAqIGExMCArIGIxMiAqIGEyMCxcclxuICAgICAgICAgICAgICAgIGIxMCAqIGEwMSArIGIxMSAqIGExMSArIGIxMiAqIGEyMSxcclxuICAgICAgICAgICAgICAgIGIxMCAqIGEwMiArIGIxMSAqIGExMiArIGIxMiAqIGEyMixcclxuICAgICAgICAgICAgICAgIGIyMCAqIGEwMCArIGIyMSAqIGExMCArIGIyMiAqIGEyMCxcclxuICAgICAgICAgICAgICAgIGIyMCAqIGEwMSArIGIyMSAqIGExMSArIGIyMiAqIGEyMSxcclxuICAgICAgICAgICAgICAgIGIyMCAqIGEwMiArIGIyMSAqIGExMiArIGIyMiAqIGEyMlxyXG4gICAgICAgICAgICBdO1xyXG4gICAgICAgICAgICByZXR1cm4gbWF0cml4O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB0cmFuc2xhdGlvbihfeFRyYW5zbGF0aW9uOiBudW1iZXIsIF95VHJhbnNsYXRpb246IG51bWJlcik6IE1hdHJpeDN4MyB7XHJcbiAgICAgICAgICAgIGxldCBtYXRyaXg6IE1hdHJpeDN4MyA9IG5ldyBNYXRyaXgzeDM7XHJcbiAgICAgICAgICAgIG1hdHJpeC5kYXRhID0gW1xyXG4gICAgICAgICAgICAgICAgMSwgMCwgMCxcclxuICAgICAgICAgICAgICAgIDAsIDEsIDAsXHJcbiAgICAgICAgICAgICAgICBfeFRyYW5zbGF0aW9uLCBfeVRyYW5zbGF0aW9uLCAxXHJcbiAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgIHJldHVybiBtYXRyaXg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHNjYWxpbmcoX3hTY2FsZTogbnVtYmVyLCBfeVNjYWxlOiBudW1iZXIpOiBNYXRyaXgzeDMge1xyXG4gICAgICAgICAgICBsZXQgbWF0cml4OiBNYXRyaXgzeDMgPSBuZXcgTWF0cml4M3gzO1xyXG4gICAgICAgICAgICBtYXRyaXguZGF0YSA9IFtcclxuICAgICAgICAgICAgICAgIF94U2NhbGUsIDAsIDAsXHJcbiAgICAgICAgICAgICAgICAwLCBfeVNjYWxlLCAwLFxyXG4gICAgICAgICAgICAgICAgMCwgMCwgMVxyXG4gICAgICAgICAgICBdO1xyXG4gICAgICAgICAgICByZXR1cm4gbWF0cml4O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSByb3RhdGlvbihfYW5nbGVJbkRlZ3JlZXM6IG51bWJlcik6IE1hdHJpeDN4MyB7XHJcbiAgICAgICAgICAgIGxldCBhbmdsZUluRGVncmVlczogbnVtYmVyID0gMzYwIC0gX2FuZ2xlSW5EZWdyZWVzO1xyXG4gICAgICAgICAgICBsZXQgYW5nbGVJblJhZGlhbnM6IG51bWJlciA9IGFuZ2xlSW5EZWdyZWVzICogTWF0aC5QSSAvIDE4MDtcclxuICAgICAgICAgICAgbGV0IHNpbjogbnVtYmVyID0gTWF0aC5zaW4oYW5nbGVJblJhZGlhbnMpO1xyXG4gICAgICAgICAgICBsZXQgY29zOiBudW1iZXIgPSBNYXRoLmNvcyhhbmdsZUluUmFkaWFucyk7XHJcbiAgICAgICAgICAgIGxldCBtYXRyaXg6IE1hdHJpeDN4MyA9IG5ldyBNYXRyaXgzeDM7XHJcbiAgICAgICAgICAgIG1hdHJpeC5kYXRhID0gW1xyXG4gICAgICAgICAgICAgICAgY29zLCAtc2luLCAwLFxyXG4gICAgICAgICAgICAgICAgc2luLCBjb3MsIDAsXHJcbiAgICAgICAgICAgICAgICAwLCAwLCAxXHJcbiAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgIHJldHVybiBtYXRyaXg7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICB9XHJcblxyXG59XHJcbiIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG5cclxuICAvKipcclxuICAgKiBSZXByZXNlbnRzIHRoZSBtYXRyaXggYXMgdHJhbnNsYXRpb24sIHJvdGF0aW9uIGFuZCBzY2FsaW5nIHZlY3RvciwgYmVpbmcgY2FsY3VsYXRlZCBmcm9tIHRoZSBtYXRyaXhcclxuICAgKi9cclxuICBpbnRlcmZhY2UgVmVjdG9yUmVwcmVzZW50YXRpb24ge1xyXG4gICAgdHJhbnNsYXRpb246IFZlY3RvcjM7XHJcbiAgICByb3RhdGlvbjogVmVjdG9yMztcclxuICAgIHNjYWxpbmc6IFZlY3RvcjM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTdG9yZXMgYSA0eDQgdHJhbnNmb3JtYXRpb24gbWF0cml4IGFuZCBwcm92aWRlcyBvcGVyYXRpb25zIGZvciBpdC5cclxuICAgKiBgYGBwbGFpbnRleHRcclxuICAgKiBbIDAsIDEsIDIsIDMgXSDihpAgcm93IHZlY3RvciB4XHJcbiAgICogWyA0LCA1LCA2LCA3IF0g4oaQIHJvdyB2ZWN0b3IgeVxyXG4gICAqIFsgOCwgOSwxMCwxMSBdIOKGkCByb3cgdmVjdG9yIHpcclxuICAgKiBbMTIsMTMsMTQsMTUgXSDihpAgdHJhbnNsYXRpb25cclxuICAgKiAgICAgICAgICAgIOKGkSAgaG9tb2dlbmVvdXMgY29sdW1uXHJcbiAgICogYGBgXHJcbiAgICogQGF1dGhvcnMgSmFzY2hhIEthcmFnw7ZsLCBIRlUsIDIwMTkgfCBKaXJrYSBEZWxsJ09yby1GcmllZGwsIEhGVSwgMjAxOVxyXG4gICAqL1xyXG5cclxuICBleHBvcnQgY2xhc3MgTWF0cml4NHg0IGV4dGVuZHMgTXV0YWJsZSBpbXBsZW1lbnRzIFNlcmlhbGl6YWJsZSB7XHJcbiAgICBwcml2YXRlIGRhdGE6IEZsb2F0MzJBcnJheSA9IG5ldyBGbG9hdDMyQXJyYXkoMTYpOyAvLyBUaGUgZGF0YSBvZiB0aGUgbWF0cml4LlxyXG4gICAgcHJpdmF0ZSBtdXRhdG9yOiBNdXRhdG9yID0gbnVsbDsgLy8gcHJlcGFyZWQgZm9yIG9wdGltaXphdGlvbiwga2VlcCBtdXRhdG9yIHRvIHJlZHVjZSByZWR1bmRhbnQgY2FsY3VsYXRpb24gYW5kIGZvciBjb21wYXJpc29uLiBTZXQgdG8gbnVsbCB3aGVuIGRhdGEgY2hhbmdlcyFcclxuICAgIHByaXZhdGUgdmVjdG9yczogVmVjdG9yUmVwcmVzZW50YXRpb247IC8vIHZlY3RvciByZXByZXNlbnRhdGlvbiBvZiBcclxuXHJcbiAgICBwdWJsaWMgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgIHN1cGVyKCk7XHJcbiAgICAgIHRoaXMuZGF0YS5zZXQoW1xyXG4gICAgICAgIDEsIDAsIDAsIDAsXHJcbiAgICAgICAgMCwgMSwgMCwgMCxcclxuICAgICAgICAwLCAwLCAxLCAwLFxyXG4gICAgICAgIDAsIDAsIDAsIDFcclxuICAgICAgXSk7XHJcbiAgICAgIHRoaXMucmVzZXRDYWNoZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBcclxuICAgICAqIC0gZ2V0OiBhIGNvcHkgb2YgdGhlIGNhbGN1bGF0ZWQgdHJhbnNsYXRpb24gdmVjdG9yICAgXHJcbiAgICAgKiAtIHNldDogZWZmZWN0IHRoZSBtYXRyaXggaWdub3JpbmcgaXRzIHJvdGF0aW9uIGFuZCBzY2FsaW5nXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgdHJhbnNsYXRpb24oKTogVmVjdG9yMyB7XHJcbiAgICAgIGlmICghdGhpcy52ZWN0b3JzLnRyYW5zbGF0aW9uKVxyXG4gICAgICAgIHRoaXMudmVjdG9ycy50cmFuc2xhdGlvbiA9IG5ldyBWZWN0b3IzKHRoaXMuZGF0YVsxMl0sIHRoaXMuZGF0YVsxM10sIHRoaXMuZGF0YVsxNF0pO1xyXG4gICAgICByZXR1cm4gdGhpcy52ZWN0b3JzLnRyYW5zbGF0aW9uLmNvcHk7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgc2V0IHRyYW5zbGF0aW9uKF90cmFuc2xhdGlvbjogVmVjdG9yMykge1xyXG4gICAgICB0aGlzLmRhdGEuc2V0KF90cmFuc2xhdGlvbi5nZXQoKSwgMTIpO1xyXG4gICAgICAvLyBubyBmdWxsIGNhY2hlIHJlc2V0IHJlcXVpcmVkXHJcbiAgICAgIHRoaXMudmVjdG9ycy50cmFuc2xhdGlvbiA9IF90cmFuc2xhdGlvbjtcclxuICAgICAgdGhpcy5tdXRhdG9yID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvKiogXHJcbiAgICAgKiAtIGdldDogYSBjb3B5IG9mIHRoZSBjYWxjdWxhdGVkIHJvdGF0aW9uIHZlY3RvciAgIFxyXG4gICAgICogLSBzZXQ6IGVmZmVjdCB0aGUgbWF0cml4XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgcm90YXRpb24oKTogVmVjdG9yMyB7XHJcbiAgICAgIGlmICghdGhpcy52ZWN0b3JzLnJvdGF0aW9uKVxyXG4gICAgICAgIHRoaXMudmVjdG9ycy5yb3RhdGlvbiA9IHRoaXMuZ2V0RXVsZXJBbmdsZXMoKTtcclxuICAgICAgcmV0dXJuIHRoaXMudmVjdG9ycy5yb3RhdGlvbi5jb3B5O1xyXG4gICAgfVxyXG4gICAgcHVibGljIHNldCByb3RhdGlvbihfcm90YXRpb246IFZlY3RvcjMpIHtcclxuICAgICAgdGhpcy5tdXRhdGUoeyBcInJvdGF0aW9uXCI6IF9yb3RhdGlvbiB9KTtcclxuICAgICAgdGhpcy5yZXNldENhY2hlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIFxyXG4gICAgICogLSBnZXQ6IGEgY29weSBvZiB0aGUgY2FsY3VsYXRlZCBzY2FsZSB2ZWN0b3IgICBcclxuICAgICAqIC0gc2V0OiBlZmZlY3QgdGhlIG1hdHJpeFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IHNjYWxpbmcoKTogVmVjdG9yMyB7XHJcbiAgICAgIGlmICghdGhpcy52ZWN0b3JzLnNjYWxpbmcpXHJcbiAgICAgICAgdGhpcy52ZWN0b3JzLnNjYWxpbmcgPSBuZXcgVmVjdG9yMyhcclxuICAgICAgICAgIE1hdGguaHlwb3QodGhpcy5kYXRhWzBdLCB0aGlzLmRhdGFbMV0sIHRoaXMuZGF0YVsyXSksXHJcbiAgICAgICAgICBNYXRoLmh5cG90KHRoaXMuZGF0YVs0XSwgdGhpcy5kYXRhWzVdLCB0aGlzLmRhdGFbNl0pLFxyXG4gICAgICAgICAgTWF0aC5oeXBvdCh0aGlzLmRhdGFbOF0sIHRoaXMuZGF0YVs5XSwgdGhpcy5kYXRhWzEwXSlcclxuICAgICAgICApO1xyXG4gICAgICByZXR1cm4gdGhpcy52ZWN0b3JzLnNjYWxpbmcuY29weTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBzZXQgc2NhbGluZyhfc2NhbGluZzogVmVjdG9yMykge1xyXG4gICAgICB0aGlzLm11dGF0ZSh7IFwic2NhbGluZ1wiOiBfc2NhbGluZyB9KTtcclxuICAgICAgdGhpcy5yZXNldENhY2hlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8jcmVnaW9uIFNUQVRJQ1NcclxuICAgIC8qKlxyXG4gICAgICogUmV0cmlldmUgYSBuZXcgaWRlbnRpdHkgbWF0cml4XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0IElERU5USVRZKCk6IE1hdHJpeDR4NCB7XHJcbiAgICAgIC8vIGNvbnN0IHJlc3VsdDogTWF0cml4NHg0ID0gbmV3IE1hdHJpeDR4NCgpO1xyXG4gICAgICBjb25zdCByZXN1bHQ6IE1hdHJpeDR4NCA9IFJlY3ljbGVyLmdldChNYXRyaXg0eDQpO1xyXG4gICAgICByZXN1bHQuZGF0YS5zZXQoW1xyXG4gICAgICAgIDEsIDAsIDAsIDAsXHJcbiAgICAgICAgMCwgMSwgMCwgMCxcclxuICAgICAgICAwLCAwLCAxLCAwLFxyXG4gICAgICAgIDAsIDAsIDAsIDFcclxuICAgICAgXSk7XHJcbiAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb21wdXRlcyBhbmQgcmV0dXJucyB0aGUgcHJvZHVjdCBvZiB0d28gcGFzc2VkIG1hdHJpY2VzLlxyXG4gICAgICogQHBhcmFtIF9hIFRoZSBtYXRyaXggdG8gbXVsdGlwbHkuXHJcbiAgICAgKiBAcGFyYW0gX2IgVGhlIG1hdHJpeCB0byBtdWx0aXBseSBieS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBNVUxUSVBMSUNBVElPTihfYTogTWF0cml4NHg0LCBfYjogTWF0cml4NHg0KTogTWF0cml4NHg0IHtcclxuICAgICAgbGV0IGE6IEZsb2F0MzJBcnJheSA9IF9hLmRhdGE7XHJcbiAgICAgIGxldCBiOiBGbG9hdDMyQXJyYXkgPSBfYi5kYXRhO1xyXG4gICAgICAvLyBsZXQgbWF0cml4OiBNYXRyaXg0eDQgPSBuZXcgTWF0cml4NHg0KCk7XHJcbiAgICAgIGNvbnN0IG1hdHJpeDogTWF0cml4NHg0ID0gUmVjeWNsZXIuZ2V0KE1hdHJpeDR4NCk7XHJcbiAgICAgIGxldCBhMDA6IG51bWJlciA9IGFbMCAqIDQgKyAwXTtcclxuICAgICAgbGV0IGEwMTogbnVtYmVyID0gYVswICogNCArIDFdO1xyXG4gICAgICBsZXQgYTAyOiBudW1iZXIgPSBhWzAgKiA0ICsgMl07XHJcbiAgICAgIGxldCBhMDM6IG51bWJlciA9IGFbMCAqIDQgKyAzXTtcclxuICAgICAgbGV0IGExMDogbnVtYmVyID0gYVsxICogNCArIDBdO1xyXG4gICAgICBsZXQgYTExOiBudW1iZXIgPSBhWzEgKiA0ICsgMV07XHJcbiAgICAgIGxldCBhMTI6IG51bWJlciA9IGFbMSAqIDQgKyAyXTtcclxuICAgICAgbGV0IGExMzogbnVtYmVyID0gYVsxICogNCArIDNdO1xyXG4gICAgICBsZXQgYTIwOiBudW1iZXIgPSBhWzIgKiA0ICsgMF07XHJcbiAgICAgIGxldCBhMjE6IG51bWJlciA9IGFbMiAqIDQgKyAxXTtcclxuICAgICAgbGV0IGEyMjogbnVtYmVyID0gYVsyICogNCArIDJdO1xyXG4gICAgICBsZXQgYTIzOiBudW1iZXIgPSBhWzIgKiA0ICsgM107XHJcbiAgICAgIGxldCBhMzA6IG51bWJlciA9IGFbMyAqIDQgKyAwXTtcclxuICAgICAgbGV0IGEzMTogbnVtYmVyID0gYVszICogNCArIDFdO1xyXG4gICAgICBsZXQgYTMyOiBudW1iZXIgPSBhWzMgKiA0ICsgMl07XHJcbiAgICAgIGxldCBhMzM6IG51bWJlciA9IGFbMyAqIDQgKyAzXTtcclxuICAgICAgbGV0IGIwMDogbnVtYmVyID0gYlswICogNCArIDBdO1xyXG4gICAgICBsZXQgYjAxOiBudW1iZXIgPSBiWzAgKiA0ICsgMV07XHJcbiAgICAgIGxldCBiMDI6IG51bWJlciA9IGJbMCAqIDQgKyAyXTtcclxuICAgICAgbGV0IGIwMzogbnVtYmVyID0gYlswICogNCArIDNdO1xyXG4gICAgICBsZXQgYjEwOiBudW1iZXIgPSBiWzEgKiA0ICsgMF07XHJcbiAgICAgIGxldCBiMTE6IG51bWJlciA9IGJbMSAqIDQgKyAxXTtcclxuICAgICAgbGV0IGIxMjogbnVtYmVyID0gYlsxICogNCArIDJdO1xyXG4gICAgICBsZXQgYjEzOiBudW1iZXIgPSBiWzEgKiA0ICsgM107XHJcbiAgICAgIGxldCBiMjA6IG51bWJlciA9IGJbMiAqIDQgKyAwXTtcclxuICAgICAgbGV0IGIyMTogbnVtYmVyID0gYlsyICogNCArIDFdO1xyXG4gICAgICBsZXQgYjIyOiBudW1iZXIgPSBiWzIgKiA0ICsgMl07XHJcbiAgICAgIGxldCBiMjM6IG51bWJlciA9IGJbMiAqIDQgKyAzXTtcclxuICAgICAgbGV0IGIzMDogbnVtYmVyID0gYlszICogNCArIDBdO1xyXG4gICAgICBsZXQgYjMxOiBudW1iZXIgPSBiWzMgKiA0ICsgMV07XHJcbiAgICAgIGxldCBiMzI6IG51bWJlciA9IGJbMyAqIDQgKyAyXTtcclxuICAgICAgbGV0IGIzMzogbnVtYmVyID0gYlszICogNCArIDNdO1xyXG4gICAgICBtYXRyaXguZGF0YS5zZXQoXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgYjAwICogYTAwICsgYjAxICogYTEwICsgYjAyICogYTIwICsgYjAzICogYTMwLFxyXG4gICAgICAgICAgYjAwICogYTAxICsgYjAxICogYTExICsgYjAyICogYTIxICsgYjAzICogYTMxLFxyXG4gICAgICAgICAgYjAwICogYTAyICsgYjAxICogYTEyICsgYjAyICogYTIyICsgYjAzICogYTMyLFxyXG4gICAgICAgICAgYjAwICogYTAzICsgYjAxICogYTEzICsgYjAyICogYTIzICsgYjAzICogYTMzLFxyXG4gICAgICAgICAgYjEwICogYTAwICsgYjExICogYTEwICsgYjEyICogYTIwICsgYjEzICogYTMwLFxyXG4gICAgICAgICAgYjEwICogYTAxICsgYjExICogYTExICsgYjEyICogYTIxICsgYjEzICogYTMxLFxyXG4gICAgICAgICAgYjEwICogYTAyICsgYjExICogYTEyICsgYjEyICogYTIyICsgYjEzICogYTMyLFxyXG4gICAgICAgICAgYjEwICogYTAzICsgYjExICogYTEzICsgYjEyICogYTIzICsgYjEzICogYTMzLFxyXG4gICAgICAgICAgYjIwICogYTAwICsgYjIxICogYTEwICsgYjIyICogYTIwICsgYjIzICogYTMwLFxyXG4gICAgICAgICAgYjIwICogYTAxICsgYjIxICogYTExICsgYjIyICogYTIxICsgYjIzICogYTMxLFxyXG4gICAgICAgICAgYjIwICogYTAyICsgYjIxICogYTEyICsgYjIyICogYTIyICsgYjIzICogYTMyLFxyXG4gICAgICAgICAgYjIwICogYTAzICsgYjIxICogYTEzICsgYjIyICogYTIzICsgYjIzICogYTMzLFxyXG4gICAgICAgICAgYjMwICogYTAwICsgYjMxICogYTEwICsgYjMyICogYTIwICsgYjMzICogYTMwLFxyXG4gICAgICAgICAgYjMwICogYTAxICsgYjMxICogYTExICsgYjMyICogYTIxICsgYjMzICogYTMxLFxyXG4gICAgICAgICAgYjMwICogYTAyICsgYjMxICogYTEyICsgYjMyICogYTIyICsgYjMzICogYTMyLFxyXG4gICAgICAgICAgYjMwICogYTAzICsgYjMxICogYTEzICsgYjMyICogYTIzICsgYjMzICogYTMzXHJcbiAgICAgICAgXSk7XHJcbiAgICAgIHJldHVybiBtYXRyaXg7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb21wdXRlcyBhbmQgcmV0dXJucyB0aGUgaW52ZXJzZSBvZiBhIHBhc3NlZCBtYXRyaXguXHJcbiAgICAgKiBAcGFyYW0gX21hdHJpeCBUaGUgbWF0cml4IHRvIGNvbXB1dGUgdGhlIGludmVyc2Ugb2YuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgSU5WRVJTSU9OKF9tYXRyaXg6IE1hdHJpeDR4NCk6IE1hdHJpeDR4NCB7XHJcbiAgICAgIGxldCBtOiBGbG9hdDMyQXJyYXkgPSBfbWF0cml4LmRhdGE7XHJcbiAgICAgIGxldCBtMDA6IG51bWJlciA9IG1bMCAqIDQgKyAwXTtcclxuICAgICAgbGV0IG0wMTogbnVtYmVyID0gbVswICogNCArIDFdO1xyXG4gICAgICBsZXQgbTAyOiBudW1iZXIgPSBtWzAgKiA0ICsgMl07XHJcbiAgICAgIGxldCBtMDM6IG51bWJlciA9IG1bMCAqIDQgKyAzXTtcclxuICAgICAgbGV0IG0xMDogbnVtYmVyID0gbVsxICogNCArIDBdO1xyXG4gICAgICBsZXQgbTExOiBudW1iZXIgPSBtWzEgKiA0ICsgMV07XHJcbiAgICAgIGxldCBtMTI6IG51bWJlciA9IG1bMSAqIDQgKyAyXTtcclxuICAgICAgbGV0IG0xMzogbnVtYmVyID0gbVsxICogNCArIDNdO1xyXG4gICAgICBsZXQgbTIwOiBudW1iZXIgPSBtWzIgKiA0ICsgMF07XHJcbiAgICAgIGxldCBtMjE6IG51bWJlciA9IG1bMiAqIDQgKyAxXTtcclxuICAgICAgbGV0IG0yMjogbnVtYmVyID0gbVsyICogNCArIDJdO1xyXG4gICAgICBsZXQgbTIzOiBudW1iZXIgPSBtWzIgKiA0ICsgM107XHJcbiAgICAgIGxldCBtMzA6IG51bWJlciA9IG1bMyAqIDQgKyAwXTtcclxuICAgICAgbGV0IG0zMTogbnVtYmVyID0gbVszICogNCArIDFdO1xyXG4gICAgICBsZXQgbTMyOiBudW1iZXIgPSBtWzMgKiA0ICsgMl07XHJcbiAgICAgIGxldCBtMzM6IG51bWJlciA9IG1bMyAqIDQgKyAzXTtcclxuICAgICAgbGV0IHRtcDA6IG51bWJlciA9IG0yMiAqIG0zMztcclxuICAgICAgbGV0IHRtcDE6IG51bWJlciA9IG0zMiAqIG0yMztcclxuICAgICAgbGV0IHRtcDI6IG51bWJlciA9IG0xMiAqIG0zMztcclxuICAgICAgbGV0IHRtcDM6IG51bWJlciA9IG0zMiAqIG0xMztcclxuICAgICAgbGV0IHRtcDQ6IG51bWJlciA9IG0xMiAqIG0yMztcclxuICAgICAgbGV0IHRtcDU6IG51bWJlciA9IG0yMiAqIG0xMztcclxuICAgICAgbGV0IHRtcDY6IG51bWJlciA9IG0wMiAqIG0zMztcclxuICAgICAgbGV0IHRtcDc6IG51bWJlciA9IG0zMiAqIG0wMztcclxuICAgICAgbGV0IHRtcDg6IG51bWJlciA9IG0wMiAqIG0yMztcclxuICAgICAgbGV0IHRtcDk6IG51bWJlciA9IG0yMiAqIG0wMztcclxuICAgICAgbGV0IHRtcDEwOiBudW1iZXIgPSBtMDIgKiBtMTM7XHJcbiAgICAgIGxldCB0bXAxMTogbnVtYmVyID0gbTEyICogbTAzO1xyXG4gICAgICBsZXQgdG1wMTI6IG51bWJlciA9IG0yMCAqIG0zMTtcclxuICAgICAgbGV0IHRtcDEzOiBudW1iZXIgPSBtMzAgKiBtMjE7XHJcbiAgICAgIGxldCB0bXAxNDogbnVtYmVyID0gbTEwICogbTMxO1xyXG4gICAgICBsZXQgdG1wMTU6IG51bWJlciA9IG0zMCAqIG0xMTtcclxuICAgICAgbGV0IHRtcDE2OiBudW1iZXIgPSBtMTAgKiBtMjE7XHJcbiAgICAgIGxldCB0bXAxNzogbnVtYmVyID0gbTIwICogbTExO1xyXG4gICAgICBsZXQgdG1wMTg6IG51bWJlciA9IG0wMCAqIG0zMTtcclxuICAgICAgbGV0IHRtcDE5OiBudW1iZXIgPSBtMzAgKiBtMDE7XHJcbiAgICAgIGxldCB0bXAyMDogbnVtYmVyID0gbTAwICogbTIxO1xyXG4gICAgICBsZXQgdG1wMjE6IG51bWJlciA9IG0yMCAqIG0wMTtcclxuICAgICAgbGV0IHRtcDIyOiBudW1iZXIgPSBtMDAgKiBtMTE7XHJcbiAgICAgIGxldCB0bXAyMzogbnVtYmVyID0gbTEwICogbTAxO1xyXG5cclxuICAgICAgbGV0IHQwOiBudW1iZXIgPSAodG1wMCAqIG0xMSArIHRtcDMgKiBtMjEgKyB0bXA0ICogbTMxKSAtXHJcbiAgICAgICAgKHRtcDEgKiBtMTEgKyB0bXAyICogbTIxICsgdG1wNSAqIG0zMSk7XHJcblxyXG4gICAgICBsZXQgdDE6IG51bWJlciA9ICh0bXAxICogbTAxICsgdG1wNiAqIG0yMSArIHRtcDkgKiBtMzEpIC1cclxuICAgICAgICAodG1wMCAqIG0wMSArIHRtcDcgKiBtMjEgKyB0bXA4ICogbTMxKTtcclxuICAgICAgbGV0IHQyOiBudW1iZXIgPSAodG1wMiAqIG0wMSArIHRtcDcgKiBtMTEgKyB0bXAxMCAqIG0zMSkgLVxyXG4gICAgICAgICh0bXAzICogbTAxICsgdG1wNiAqIG0xMSArIHRtcDExICogbTMxKTtcclxuICAgICAgbGV0IHQzOiBudW1iZXIgPSAodG1wNSAqIG0wMSArIHRtcDggKiBtMTEgKyB0bXAxMSAqIG0yMSkgLVxyXG4gICAgICAgICh0bXA0ICogbTAxICsgdG1wOSAqIG0xMSArIHRtcDEwICogbTIxKTtcclxuXHJcbiAgICAgIGxldCBkOiBudW1iZXIgPSAxLjAgLyAobTAwICogdDAgKyBtMTAgKiB0MSArIG0yMCAqIHQyICsgbTMwICogdDMpO1xyXG5cclxuICAgICAgLy8gbGV0IG1hdHJpeDogTWF0cml4NHg0ID0gbmV3IE1hdHJpeDR4NDtcclxuICAgICAgY29uc3QgbWF0cml4OiBNYXRyaXg0eDQgPSBSZWN5Y2xlci5nZXQoTWF0cml4NHg0KTtcclxuICAgICAgbWF0cml4LmRhdGEuc2V0KFtcclxuICAgICAgICBkICogdDAsIC8vIFswXVxyXG4gICAgICAgIGQgKiB0MSwgLy8gWzFdXHJcbiAgICAgICAgZCAqIHQyLCAvLyBbMl1cclxuICAgICAgICBkICogdDMsIC8vIFszXVxyXG4gICAgICAgIGQgKiAoKHRtcDEgKiBtMTAgKyB0bXAyICogbTIwICsgdG1wNSAqIG0zMCkgLSAodG1wMCAqIG0xMCArIHRtcDMgKiBtMjAgKyB0bXA0ICogbTMwKSksICAgICAgICAvLyBbNF1cclxuICAgICAgICBkICogKCh0bXAwICogbTAwICsgdG1wNyAqIG0yMCArIHRtcDggKiBtMzApIC0gKHRtcDEgKiBtMDAgKyB0bXA2ICogbTIwICsgdG1wOSAqIG0zMCkpLCAgICAgICAgLy8gWzVdXHJcbiAgICAgICAgZCAqICgodG1wMyAqIG0wMCArIHRtcDYgKiBtMTAgKyB0bXAxMSAqIG0zMCkgLSAodG1wMiAqIG0wMCArIHRtcDcgKiBtMTAgKyB0bXAxMCAqIG0zMCkpLCAgICAgIC8vIFs2XVxyXG4gICAgICAgIGQgKiAoKHRtcDQgKiBtMDAgKyB0bXA5ICogbTEwICsgdG1wMTAgKiBtMjApIC0gKHRtcDUgKiBtMDAgKyB0bXA4ICogbTEwICsgdG1wMTEgKiBtMjApKSwgICAgICAvLyBbN11cclxuICAgICAgICBkICogKCh0bXAxMiAqIG0xMyArIHRtcDE1ICogbTIzICsgdG1wMTYgKiBtMzMpIC0gKHRtcDEzICogbTEzICsgdG1wMTQgKiBtMjMgKyB0bXAxNyAqIG0zMykpLCAgLy8gWzhdXHJcbiAgICAgICAgZCAqICgodG1wMTMgKiBtMDMgKyB0bXAxOCAqIG0yMyArIHRtcDIxICogbTMzKSAtICh0bXAxMiAqIG0wMyArIHRtcDE5ICogbTIzICsgdG1wMjAgKiBtMzMpKSwgIC8vIFs5XVxyXG4gICAgICAgIGQgKiAoKHRtcDE0ICogbTAzICsgdG1wMTkgKiBtMTMgKyB0bXAyMiAqIG0zMykgLSAodG1wMTUgKiBtMDMgKyB0bXAxOCAqIG0xMyArIHRtcDIzICogbTMzKSksICAvLyBbMTBdXHJcbiAgICAgICAgZCAqICgodG1wMTcgKiBtMDMgKyB0bXAyMCAqIG0xMyArIHRtcDIzICogbTIzKSAtICh0bXAxNiAqIG0wMyArIHRtcDIxICogbTEzICsgdG1wMjIgKiBtMjMpKSwgIC8vIFsxMV1cclxuICAgICAgICBkICogKCh0bXAxNCAqIG0yMiArIHRtcDE3ICogbTMyICsgdG1wMTMgKiBtMTIpIC0gKHRtcDE2ICogbTMyICsgdG1wMTIgKiBtMTIgKyB0bXAxNSAqIG0yMikpLCAgLy8gWzEyXVxyXG4gICAgICAgIGQgKiAoKHRtcDIwICogbTMyICsgdG1wMTIgKiBtMDIgKyB0bXAxOSAqIG0yMikgLSAodG1wMTggKiBtMjIgKyB0bXAyMSAqIG0zMiArIHRtcDEzICogbTAyKSksICAvLyBbMTNdXHJcbiAgICAgICAgZCAqICgodG1wMTggKiBtMTIgKyB0bXAyMyAqIG0zMiArIHRtcDE1ICogbTAyKSAtICh0bXAyMiAqIG0zMiArIHRtcDE0ICogbTAyICsgdG1wMTkgKiBtMTIpKSwgIC8vIFsxNF1cclxuICAgICAgICBkICogKCh0bXAyMiAqIG0yMiArIHRtcDE2ICogbTAyICsgdG1wMjEgKiBtMTIpIC0gKHRtcDIwICogbTEyICsgdG1wMjMgKiBtMjIgKyB0bXAxNyAqIG0wMikpICAvLyBbMTVdXHJcbiAgICAgIF0pO1xyXG4gICAgICByZXR1cm4gbWF0cml4O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29tcHV0ZXMgYW5kIHJldHVybnMgYSByb3RhdGlvbm1hdHJpeCB0aGF0IGFsaWducyBhIHRyYW5zZm9ybWF0aW9ucyB6LWF4aXMgd2l0aCB0aGUgdmVjdG9yIGJldHdlZW4gaXQgYW5kIGl0cyB0YXJnZXQuXHJcbiAgICAgKiBAcGFyYW0gX3RyYW5zZm9ybVBvc2l0aW9uIFRoZSB4LHkgYW5kIHotY29vcmRpbmF0ZXMgb2YgdGhlIG9iamVjdCB0byByb3RhdGUuXHJcbiAgICAgKiBAcGFyYW0gX3RhcmdldFBvc2l0aW9uIFRoZSBwb3NpdGlvbiB0byBsb29rIGF0LlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIExPT0tfQVQoX3RyYW5zZm9ybVBvc2l0aW9uOiBWZWN0b3IzLCBfdGFyZ2V0UG9zaXRpb246IFZlY3RvcjMsIF91cDogVmVjdG9yMyA9IFZlY3RvcjMuWSgpKTogTWF0cml4NHg0IHtcclxuICAgICAgLy8gY29uc3QgbWF0cml4OiBNYXRyaXg0eDQgPSBuZXcgTWF0cml4NHg0O1xyXG4gICAgICBjb25zdCBtYXRyaXg6IE1hdHJpeDR4NCA9IFJlY3ljbGVyLmdldChNYXRyaXg0eDQpO1xyXG4gICAgICBsZXQgekF4aXM6IFZlY3RvcjMgPSBWZWN0b3IzLkRJRkZFUkVOQ0UoX3RyYW5zZm9ybVBvc2l0aW9uLCBfdGFyZ2V0UG9zaXRpb24pO1xyXG4gICAgICB6QXhpcy5ub3JtYWxpemUoKTtcclxuICAgICAgbGV0IHhBeGlzOiBWZWN0b3IzID0gVmVjdG9yMy5OT1JNQUxJWkFUSU9OKFZlY3RvcjMuQ1JPU1MoX3VwLCB6QXhpcykpO1xyXG4gICAgICBsZXQgeUF4aXM6IFZlY3RvcjMgPSBWZWN0b3IzLk5PUk1BTElaQVRJT04oVmVjdG9yMy5DUk9TUyh6QXhpcywgeEF4aXMpKTtcclxuICAgICAgbWF0cml4LmRhdGEuc2V0KFxyXG4gICAgICAgIFtcclxuICAgICAgICAgIHhBeGlzLngsIHhBeGlzLnksIHhBeGlzLnosIDAsXHJcbiAgICAgICAgICB5QXhpcy54LCB5QXhpcy55LCB5QXhpcy56LCAwLFxyXG4gICAgICAgICAgekF4aXMueCwgekF4aXMueSwgekF4aXMueiwgMCxcclxuICAgICAgICAgIF90cmFuc2Zvcm1Qb3NpdGlvbi54LFxyXG4gICAgICAgICAgX3RyYW5zZm9ybVBvc2l0aW9uLnksXHJcbiAgICAgICAgICBfdHJhbnNmb3JtUG9zaXRpb24ueixcclxuICAgICAgICAgIDFcclxuICAgICAgICBdKTtcclxuICAgICAgcmV0dXJuIG1hdHJpeDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBtYXRyaXggdGhhdCB0cmFuc2xhdGVzIGNvb3JkaW5hdGVzIGFsb25nIHRoZSB4LSwgeS0gYW5kIHotYXhpcyBhY2NvcmRpbmcgdG8gdGhlIGdpdmVuIHZlY3Rvci5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBUUkFOU0xBVElPTihfdHJhbnNsYXRlOiBWZWN0b3IzKTogTWF0cml4NHg0IHtcclxuICAgICAgLy8gbGV0IG1hdHJpeDogTWF0cml4NHg0ID0gbmV3IE1hdHJpeDR4NDtcclxuICAgICAgY29uc3QgbWF0cml4OiBNYXRyaXg0eDQgPSBSZWN5Y2xlci5nZXQoTWF0cml4NHg0KTtcclxuICAgICAgbWF0cml4LmRhdGEuc2V0KFtcclxuICAgICAgICAxLCAwLCAwLCAwLFxyXG4gICAgICAgIDAsIDEsIDAsIDAsXHJcbiAgICAgICAgMCwgMCwgMSwgMCxcclxuICAgICAgICBfdHJhbnNsYXRlLngsIF90cmFuc2xhdGUueSwgX3RyYW5zbGF0ZS56LCAxXHJcbiAgICAgIF0pO1xyXG4gICAgICByZXR1cm4gbWF0cml4O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIG1hdHJpeCB0aGF0IHJvdGF0ZXMgY29vcmRpbmF0ZXMgb24gdGhlIHgtYXhpcyB3aGVuIG11bHRpcGxpZWQgYnkuXHJcbiAgICAgKiBAcGFyYW0gX2FuZ2xlSW5EZWdyZWVzIFRoZSB2YWx1ZSBvZiB0aGUgcm90YXRpb24uXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgUk9UQVRJT05fWChfYW5nbGVJbkRlZ3JlZXM6IG51bWJlcik6IE1hdHJpeDR4NCB7XHJcbiAgICAgIC8vIGNvbnN0IG1hdHJpeDogTWF0cml4NHg0ID0gbmV3IE1hdHJpeDR4NDtcclxuICAgICAgY29uc3QgbWF0cml4OiBNYXRyaXg0eDQgPSBSZWN5Y2xlci5nZXQoTWF0cml4NHg0KTtcclxuICAgICAgbGV0IGFuZ2xlSW5SYWRpYW5zOiBudW1iZXIgPSBfYW5nbGVJbkRlZ3JlZXMgKiBNYXRoLlBJIC8gMTgwO1xyXG4gICAgICBsZXQgc2luOiBudW1iZXIgPSBNYXRoLnNpbihhbmdsZUluUmFkaWFucyk7XHJcbiAgICAgIGxldCBjb3M6IG51bWJlciA9IE1hdGguY29zKGFuZ2xlSW5SYWRpYW5zKTtcclxuICAgICAgbWF0cml4LmRhdGEuc2V0KFtcclxuICAgICAgICAxLCAwLCAwLCAwLFxyXG4gICAgICAgIDAsIGNvcywgc2luLCAwLFxyXG4gICAgICAgIDAsIC1zaW4sIGNvcywgMCxcclxuICAgICAgICAwLCAwLCAwLCAxXHJcbiAgICAgIF0pO1xyXG4gICAgICByZXR1cm4gbWF0cml4O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIG1hdHJpeCB0aGF0IHJvdGF0ZXMgY29vcmRpbmF0ZXMgb24gdGhlIHktYXhpcyB3aGVuIG11bHRpcGxpZWQgYnkuXHJcbiAgICAgKiBAcGFyYW0gX2FuZ2xlSW5EZWdyZWVzIFRoZSB2YWx1ZSBvZiB0aGUgcm90YXRpb24uXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgUk9UQVRJT05fWShfYW5nbGVJbkRlZ3JlZXM6IG51bWJlcik6IE1hdHJpeDR4NCB7XHJcbiAgICAgIC8vIGNvbnN0IG1hdHJpeDogTWF0cml4NHg0ID0gbmV3IE1hdHJpeDR4NDtcclxuICAgICAgbGV0IG1hdHJpeDogTWF0cml4NHg0ID0gUmVjeWNsZXIuZ2V0KE1hdHJpeDR4NCk7XHJcbiAgICAgIGxldCBhbmdsZUluUmFkaWFuczogbnVtYmVyID0gX2FuZ2xlSW5EZWdyZWVzICogTWF0aC5QSSAvIDE4MDtcclxuICAgICAgbGV0IHNpbjogbnVtYmVyID0gTWF0aC5zaW4oYW5nbGVJblJhZGlhbnMpO1xyXG4gICAgICBsZXQgY29zOiBudW1iZXIgPSBNYXRoLmNvcyhhbmdsZUluUmFkaWFucyk7XHJcbiAgICAgIG1hdHJpeC5kYXRhLnNldChbXHJcbiAgICAgICAgY29zLCAwLCAtc2luLCAwLFxyXG4gICAgICAgIDAsIDEsIDAsIDAsXHJcbiAgICAgICAgc2luLCAwLCBjb3MsIDAsXHJcbiAgICAgICAgMCwgMCwgMCwgMVxyXG4gICAgICBdKTtcclxuICAgICAgcmV0dXJuIG1hdHJpeDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBtYXRyaXggdGhhdCByb3RhdGVzIGNvb3JkaW5hdGVzIG9uIHRoZSB6LWF4aXMgd2hlbiBtdWx0aXBsaWVkIGJ5LlxyXG4gICAgICogQHBhcmFtIF9hbmdsZUluRGVncmVlcyBUaGUgdmFsdWUgb2YgdGhlIHJvdGF0aW9uLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIFJPVEFUSU9OX1ooX2FuZ2xlSW5EZWdyZWVzOiBudW1iZXIpOiBNYXRyaXg0eDQge1xyXG4gICAgICAvLyBjb25zdCBtYXRyaXg6IE1hdHJpeDR4NCA9IG5ldyBNYXRyaXg0eDQ7XHJcbiAgICAgIGNvbnN0IG1hdHJpeDogTWF0cml4NHg0ID0gUmVjeWNsZXIuZ2V0KE1hdHJpeDR4NCk7XHJcbiAgICAgIGxldCBhbmdsZUluUmFkaWFuczogbnVtYmVyID0gX2FuZ2xlSW5EZWdyZWVzICogTWF0aC5QSSAvIDE4MDtcclxuICAgICAgbGV0IHNpbjogbnVtYmVyID0gTWF0aC5zaW4oYW5nbGVJblJhZGlhbnMpO1xyXG4gICAgICBsZXQgY29zOiBudW1iZXIgPSBNYXRoLmNvcyhhbmdsZUluUmFkaWFucyk7XHJcbiAgICAgIG1hdHJpeC5kYXRhLnNldChbXHJcbiAgICAgICAgY29zLCBzaW4sIDAsIDAsXHJcbiAgICAgICAgLXNpbiwgY29zLCAwLCAwLFxyXG4gICAgICAgIDAsIDAsIDEsIDAsXHJcbiAgICAgICAgMCwgMCwgMCwgMVxyXG4gICAgICBdKTtcclxuICAgICAgcmV0dXJuIG1hdHJpeDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBtYXRyaXggdGhhdCBzY2FsZXMgY29vcmRpbmF0ZXMgYWxvbmcgdGhlIHgtLCB5LSBhbmQgei1heGlzIGFjY29yZGluZyB0byB0aGUgZ2l2ZW4gdmVjdG9yXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgU0NBTElORyhfc2NhbGFyOiBWZWN0b3IzKTogTWF0cml4NHg0IHtcclxuICAgICAgLy8gY29uc3QgbWF0cml4OiBNYXRyaXg0eDQgPSBuZXcgTWF0cml4NHg0O1xyXG4gICAgICBjb25zdCBtYXRyaXg6IE1hdHJpeDR4NCA9IFJlY3ljbGVyLmdldChNYXRyaXg0eDQpO1xyXG4gICAgICBtYXRyaXguZGF0YS5zZXQoW1xyXG4gICAgICAgIF9zY2FsYXIueCwgMCwgMCwgMCxcclxuICAgICAgICAwLCBfc2NhbGFyLnksIDAsIDAsXHJcbiAgICAgICAgMCwgMCwgX3NjYWxhci56LCAwLFxyXG4gICAgICAgIDAsIDAsIDAsIDFcclxuICAgICAgXSk7XHJcbiAgICAgIHJldHVybiBtYXRyaXg7XHJcbiAgICB9XHJcbiAgICAvLyNlbmRyZWdpb25cclxuXHJcbiAgICAvLyNyZWdpb24gUFJPSkVDVElPTlNcclxuICAgIC8qKlxyXG4gICAgICogQ29tcHV0ZXMgYW5kIHJldHVybnMgYSBtYXRyaXggdGhhdCBhcHBsaWVzIHBlcnNwZWN0aXZlIHRvIGFuIG9iamVjdCwgaWYgaXRzIHRyYW5zZm9ybSBpcyBtdWx0aXBsaWVkIGJ5IGl0LlxyXG4gICAgICogQHBhcmFtIF9hc3BlY3QgVGhlIGFzcGVjdCByYXRpbyBiZXR3ZWVuIHdpZHRoIGFuZCBoZWlnaHQgb2YgcHJvamVjdGlvbnNwYWNlLihEZWZhdWx0ID0gY2FudmFzLmNsaWVudFdpZHRoIC8gY2FudmFzLkNsaWVudEhlaWdodClcclxuICAgICAqIEBwYXJhbSBfZmllbGRPZlZpZXdJbkRlZ3JlZXMgVGhlIGZpZWxkIG9mIHZpZXcgaW4gRGVncmVlcy4gKERlZmF1bHQgPSA0NSlcclxuICAgICAqIEBwYXJhbSBfbmVhciBUaGUgbmVhciBjbGlwc3BhY2UgYm9yZGVyIG9uIHRoZSB6LWF4aXMuXHJcbiAgICAgKiBAcGFyYW0gX2ZhciBUaGUgZmFyIGNsaXBzcGFjZSBib3JkZXIgb24gdGhlIHotYXhpcy5cclxuICAgICAqIEBwYXJhbSBfZGlyZWN0aW9uIFRoZSBwbGFuZSBvbiB3aGljaCB0aGUgZmllbGRPZlZpZXctQW5nbGUgaXMgZ2l2ZW4gXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgUFJPSkVDVElPTl9DRU5UUkFMKF9hc3BlY3Q6IG51bWJlciwgX2ZpZWxkT2ZWaWV3SW5EZWdyZWVzOiBudW1iZXIsIF9uZWFyOiBudW1iZXIsIF9mYXI6IG51bWJlciwgX2RpcmVjdGlvbjogRklFTERfT0ZfVklFVyk6IE1hdHJpeDR4NCB7XHJcbiAgICAgIGxldCBmaWVsZE9mVmlld0luUmFkaWFuczogbnVtYmVyID0gX2ZpZWxkT2ZWaWV3SW5EZWdyZWVzICogTWF0aC5QSSAvIDE4MDtcclxuICAgICAgbGV0IGY6IG51bWJlciA9IE1hdGgudGFuKDAuNSAqIChNYXRoLlBJIC0gZmllbGRPZlZpZXdJblJhZGlhbnMpKTtcclxuICAgICAgbGV0IHJhbmdlSW52OiBudW1iZXIgPSAxLjAgLyAoX25lYXIgLSBfZmFyKTtcclxuICAgICAgLy8gY29uc3QgbWF0cml4OiBNYXRyaXg0eDQgPSBuZXcgTWF0cml4NHg0O1xyXG4gICAgICBjb25zdCBtYXRyaXg6IE1hdHJpeDR4NCA9IFJlY3ljbGVyLmdldChNYXRyaXg0eDQpO1xyXG4gICAgICBtYXRyaXguZGF0YS5zZXQoW1xyXG4gICAgICAgIGYsIDAsIDAsIDAsXHJcbiAgICAgICAgMCwgZiwgMCwgMCxcclxuICAgICAgICAwLCAwLCAoX25lYXIgKyBfZmFyKSAqIHJhbmdlSW52LCAtMSxcclxuICAgICAgICAwLCAwLCBfbmVhciAqIF9mYXIgKiByYW5nZUludiAqIDIsIDBcclxuICAgICAgXSk7XHJcblxyXG4gICAgICBpZiAoX2RpcmVjdGlvbiA9PSBGSUVMRF9PRl9WSUVXLkRJQUdPTkFMKSB7XHJcbiAgICAgICAgX2FzcGVjdCA9IE1hdGguc3FydChfYXNwZWN0KTtcclxuICAgICAgICBtYXRyaXguZGF0YVswXSA9IGYgLyBfYXNwZWN0O1xyXG4gICAgICAgIG1hdHJpeC5kYXRhWzVdID0gZiAqIF9hc3BlY3Q7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoX2RpcmVjdGlvbiA9PSBGSUVMRF9PRl9WSUVXLlZFUlRJQ0FMKVxyXG4gICAgICAgIG1hdHJpeC5kYXRhWzBdID0gZiAvIF9hc3BlY3Q7XHJcbiAgICAgIGVsc2UgLy9GT1ZfRElSRUNUSU9OLkhPUklaT05UQUxcclxuICAgICAgICBtYXRyaXguZGF0YVs1XSA9IGYgKiBfYXNwZWN0O1xyXG5cclxuICAgICAgcmV0dXJuIG1hdHJpeDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbXB1dGVzIGFuZCByZXR1cm5zIGEgbWF0cml4IHRoYXQgYXBwbGllcyBvcnRob2dyYXBoaWMgcHJvamVjdGlvbiB0byBhbiBvYmplY3QsIGlmIGl0cyB0cmFuc2Zvcm0gaXMgbXVsdGlwbGllZCBieSBpdC5cclxuICAgICAqIEBwYXJhbSBfbGVmdCBUaGUgcG9zaXRpb252YWx1ZSBvZiB0aGUgcHJvamVjdGlvbnNwYWNlJ3MgbGVmdCBib3JkZXIuXHJcbiAgICAgKiBAcGFyYW0gX3JpZ2h0IFRoZSBwb3NpdGlvbnZhbHVlIG9mIHRoZSBwcm9qZWN0aW9uc3BhY2UncyByaWdodCBib3JkZXIuXHJcbiAgICAgKiBAcGFyYW0gX2JvdHRvbSBUaGUgcG9zaXRpb252YWx1ZSBvZiB0aGUgcHJvamVjdGlvbnNwYWNlJ3MgYm90dG9tIGJvcmRlci5cclxuICAgICAqIEBwYXJhbSBfdG9wIFRoZSBwb3NpdGlvbnZhbHVlIG9mIHRoZSBwcm9qZWN0aW9uc3BhY2UncyB0b3AgYm9yZGVyLlxyXG4gICAgICogQHBhcmFtIF9uZWFyIFRoZSBwb3NpdGlvbnZhbHVlIG9mIHRoZSBwcm9qZWN0aW9uc3BhY2UncyBuZWFyIGJvcmRlci5cclxuICAgICAqIEBwYXJhbSBfZmFyIFRoZSBwb3NpdGlvbnZhbHVlIG9mIHRoZSBwcm9qZWN0aW9uc3BhY2UncyBmYXIgYm9yZGVyXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgUFJPSkVDVElPTl9PUlRIT0dSQVBISUMoX2xlZnQ6IG51bWJlciwgX3JpZ2h0OiBudW1iZXIsIF9ib3R0b206IG51bWJlciwgX3RvcDogbnVtYmVyLCBfbmVhcjogbnVtYmVyID0gLTQwMCwgX2ZhcjogbnVtYmVyID0gNDAwKTogTWF0cml4NHg0IHtcclxuICAgICAgLy8gY29uc3QgbWF0cml4OiBNYXRyaXg0eDQgPSBuZXcgTWF0cml4NHg0O1xyXG4gICAgICBjb25zdCBtYXRyaXg6IE1hdHJpeDR4NCA9IFJlY3ljbGVyLmdldChNYXRyaXg0eDQpO1xyXG4gICAgICBtYXRyaXguZGF0YS5zZXQoW1xyXG4gICAgICAgIDIgLyAoX3JpZ2h0IC0gX2xlZnQpLCAwLCAwLCAwLFxyXG4gICAgICAgIDAsIDIgLyAoX3RvcCAtIF9ib3R0b20pLCAwLCAwLFxyXG4gICAgICAgIDAsIDAsIDIgLyAoX25lYXIgLSBfZmFyKSwgMCxcclxuICAgICAgICAoX2xlZnQgKyBfcmlnaHQpIC8gKF9sZWZ0IC0gX3JpZ2h0KSxcclxuICAgICAgICAoX2JvdHRvbSArIF90b3ApIC8gKF9ib3R0b20gLSBfdG9wKSxcclxuICAgICAgICAoX25lYXIgKyBfZmFyKSAvIChfbmVhciAtIF9mYXIpLFxyXG4gICAgICAgIDFcclxuICAgICAgXSk7XHJcbiAgICAgIHJldHVybiBtYXRyaXg7XHJcbiAgICB9XHJcbiAgICAvLyNlbmRyZWdpb25cclxuXHJcbiAgICAvLyNyZWdpb24gUm90YXRpb25cclxuICAgIC8qKlxyXG4gICAgICogQWRkcyBhIHJvdGF0aW9uIGFyb3VuZCB0aGUgeC1BeGlzIHRvIHRoaXMgbWF0cml4XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyByb3RhdGVYKF9hbmdsZUluRGVncmVlczogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgIGNvbnN0IG1hdHJpeDogTWF0cml4NHg0ID0gTWF0cml4NHg0Lk1VTFRJUExJQ0FUSU9OKHRoaXMsIE1hdHJpeDR4NC5ST1RBVElPTl9YKF9hbmdsZUluRGVncmVlcykpO1xyXG4gICAgICB0aGlzLnNldChtYXRyaXgpO1xyXG4gICAgICBSZWN5Y2xlci5zdG9yZShtYXRyaXgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkcyBhIHJvdGF0aW9uIGFyb3VuZCB0aGUgeS1BeGlzIHRvIHRoaXMgbWF0cml4XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyByb3RhdGVZKF9hbmdsZUluRGVncmVlczogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgIGNvbnN0IG1hdHJpeDogTWF0cml4NHg0ID0gTWF0cml4NHg0Lk1VTFRJUExJQ0FUSU9OKHRoaXMsIE1hdHJpeDR4NC5ST1RBVElPTl9ZKF9hbmdsZUluRGVncmVlcykpO1xyXG4gICAgICB0aGlzLnNldChtYXRyaXgpO1xyXG4gICAgICBSZWN5Y2xlci5zdG9yZShtYXRyaXgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkcyBhIHJvdGF0aW9uIGFyb3VuZCB0aGUgei1BeGlzIHRvIHRoaXMgbWF0cml4XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyByb3RhdGVaKF9hbmdsZUluRGVncmVlczogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgIGNvbnN0IG1hdHJpeDogTWF0cml4NHg0ID0gTWF0cml4NHg0Lk1VTFRJUExJQ0FUSU9OKHRoaXMsIE1hdHJpeDR4NC5ST1RBVElPTl9aKF9hbmdsZUluRGVncmVlcykpO1xyXG4gICAgICB0aGlzLnNldChtYXRyaXgpO1xyXG4gICAgICBSZWN5Y2xlci5zdG9yZShtYXRyaXgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRqdXN0cyB0aGUgcm90YXRpb24gb2YgdGhpcyBtYXRyaXggdG8gZmFjZSB0aGUgZ2l2ZW4gdGFyZ2V0IGFuZCB0aWx0cyBpdCB0byBhY2NvcmQgd2l0aCB0aGUgZ2l2ZW4gdXAgdmVjdG9yIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgbG9va0F0KF90YXJnZXQ6IFZlY3RvcjMsIF91cDogVmVjdG9yMyA9IFZlY3RvcjMuWSgpKTogdm9pZCB7XHJcbiAgICAgIGNvbnN0IG1hdHJpeDogTWF0cml4NHg0ID0gTWF0cml4NHg0LkxPT0tfQVQodGhpcy50cmFuc2xhdGlvbiwgX3RhcmdldCk7IC8vIFRPRE86IEhhbmRsZSByb3RhdGlvbiBhcm91bmQgei1heGlzXHJcbiAgICAgIHRoaXMuc2V0KG1hdHJpeCk7XHJcbiAgICAgIFJlY3ljbGVyLnN0b3JlKG1hdHJpeCk7XHJcbiAgICB9XHJcbiAgICAvLyNlbmRyZWdpb25cclxuXHJcbiAgICAvLyNyZWdpb24gVHJhbnNsYXRpb25cclxuICAgIC8qKlxyXG4gICAgICogQWRkIGEgdHJhbnNsYXRpb24gYnkgdGhlIGdpdmVuIHZlY3RvciB0byB0aGlzIG1hdHJpeCBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHRyYW5zbGF0ZShfYnk6IFZlY3RvcjMpOiB2b2lkIHtcclxuICAgICAgY29uc3QgbWF0cml4OiBNYXRyaXg0eDQgPSBNYXRyaXg0eDQuTVVMVElQTElDQVRJT04odGhpcywgTWF0cml4NHg0LlRSQU5TTEFUSU9OKF9ieSkpO1xyXG4gICAgICAvLyBUT0RPOiBwb3NzaWJsZSBvcHRpbWl6YXRpb24sIHRyYW5zbGF0aW9uIG1heSBhbHRlciBtdXRhdG9yIGluc3RlYWQgb2YgZGVsZXRpbmcgaXQuXHJcbiAgICAgIHRoaXMuc2V0KG1hdHJpeCk7XHJcbiAgICAgIFJlY3ljbGVyLnN0b3JlKG1hdHJpeCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGQgYSB0cmFuc2xhdGlvbiBhbG9uZyB0aGUgeC1BeGlzIGJ5IHRoZSBnaXZlbiBhbW91bnQgdG8gdGhpcyBtYXRyaXggXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyB0cmFuc2xhdGVYKF94OiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgdGhpcy5kYXRhWzEyXSArPSBfeDtcclxuICAgICAgdGhpcy5tdXRhdG9yID0gbnVsbDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQWRkIGEgdHJhbnNsYXRpb24gYWxvbmcgdGhlIHktQXhpcyBieSB0aGUgZ2l2ZW4gYW1vdW50IHRvIHRoaXMgbWF0cml4IFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgdHJhbnNsYXRlWShfeTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgIHRoaXMuZGF0YVsxM10gKz0gX3k7XHJcbiAgICAgIHRoaXMubXV0YXRvciA9IG51bGw7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEFkZCBhIHRyYW5zbGF0aW9uIGFsb25nIHRoZSB5LUF4aXMgYnkgdGhlIGdpdmVuIGFtb3VudCB0byB0aGlzIG1hdHJpeCBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHRyYW5zbGF0ZVooX3o6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICB0aGlzLmRhdGFbMTRdICs9IF96O1xyXG4gICAgICB0aGlzLm11dGF0b3IgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgLy8jZW5kcmVnaW9uXHJcblxyXG4gICAgLy8jcmVnaW9uIFNjYWxpbmdcclxuICAgIC8qKlxyXG4gICAgICogQWRkIGEgc2NhbGluZyBieSB0aGUgZ2l2ZW4gdmVjdG9yIHRvIHRoaXMgbWF0cml4IFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2NhbGUoX2J5OiBWZWN0b3IzKTogdm9pZCB7XHJcbiAgICAgIGNvbnN0IG1hdHJpeDogTWF0cml4NHg0ID0gTWF0cml4NHg0Lk1VTFRJUExJQ0FUSU9OKHRoaXMsIE1hdHJpeDR4NC5TQ0FMSU5HKF9ieSkpO1xyXG4gICAgICB0aGlzLnNldChtYXRyaXgpO1xyXG4gICAgICBSZWN5Y2xlci5zdG9yZShtYXRyaXgpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGQgYSBzY2FsaW5nIGFsb25nIHRoZSB4LUF4aXMgYnkgdGhlIGdpdmVuIGFtb3VudCB0byB0aGlzIG1hdHJpeCBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHNjYWxlWChfYnk6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICB0aGlzLnNjYWxlKG5ldyBWZWN0b3IzKF9ieSwgMSwgMSkpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGQgYSBzY2FsaW5nIGFsb25nIHRoZSB5LUF4aXMgYnkgdGhlIGdpdmVuIGFtb3VudCB0byB0aGlzIG1hdHJpeCBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHNjYWxlWShfYnk6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICB0aGlzLnNjYWxlKG5ldyBWZWN0b3IzKDEsIF9ieSwgMSkpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGQgYSBzY2FsaW5nIGFsb25nIHRoZSB6LUF4aXMgYnkgdGhlIGdpdmVuIGFtb3VudCB0byB0aGlzIG1hdHJpeCBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHNjYWxlWihfYnk6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICB0aGlzLnNjYWxlKG5ldyBWZWN0b3IzKDEsIDEsIF9ieSkpO1xyXG4gICAgfVxyXG4gICAgLy8jZW5kcmVnaW9uXHJcblxyXG4gICAgLy8jcmVnaW9uIFRyYW5zZm9ybWF0aW9uXHJcbiAgICAvKipcclxuICAgICAqIE11bHRpcGx5IHRoaXMgbWF0cml4IHdpdGggdGhlIGdpdmVuIG1hdHJpeFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgbXVsdGlwbHkoX21hdHJpeDogTWF0cml4NHg0KTogdm9pZCB7XHJcbiAgICAgIHRoaXMuc2V0KE1hdHJpeDR4NC5NVUxUSVBMSUNBVElPTih0aGlzLCBfbWF0cml4KSk7XHJcbiAgICAgIHRoaXMubXV0YXRvciA9IG51bGw7XHJcbiAgICB9XHJcbiAgICAvLyNlbmRyZWdpb25cclxuXHJcbiAgICAvLyNyZWdpb24gVHJhbnNmZXJcclxuICAgIC8qKlxyXG4gICAgICogQ2FsY3VsYXRlcyBhbmQgcmV0dXJucyB0aGUgZXVsZXItYW5nbGVzIHJlcHJlc2VudGluZyB0aGUgY3VycmVudCByb3RhdGlvbiBvZiB0aGlzIG1hdHJpeFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0RXVsZXJBbmdsZXMoKTogVmVjdG9yMyB7XHJcbiAgICAgIGxldCBzY2FsaW5nOiBWZWN0b3IzID0gdGhpcy5zY2FsaW5nO1xyXG5cclxuICAgICAgbGV0IHMwOiBudW1iZXIgPSB0aGlzLmRhdGFbMF0gLyBzY2FsaW5nLng7XHJcbiAgICAgIGxldCBzMTogbnVtYmVyID0gdGhpcy5kYXRhWzFdIC8gc2NhbGluZy54O1xyXG4gICAgICBsZXQgczI6IG51bWJlciA9IHRoaXMuZGF0YVsyXSAvIHNjYWxpbmcueDtcclxuICAgICAgbGV0IHM2OiBudW1iZXIgPSB0aGlzLmRhdGFbNl0gLyBzY2FsaW5nLnk7XHJcbiAgICAgIGxldCBzMTA6IG51bWJlciA9IHRoaXMuZGF0YVsxMF0gLyBzY2FsaW5nLno7XHJcblxyXG4gICAgICBsZXQgc3k6IG51bWJlciA9IE1hdGguaHlwb3QoczAsIHMxKTsgLy8gcHJvYmFibHkgMi4gcGFyYW0gc2hvdWxkIGJlIHRoaXMuZGF0YVs0XSAvIHNjYWxpbmcueVxyXG5cclxuICAgICAgbGV0IHNpbmd1bGFyOiBib29sZWFuID0gc3kgPCAxZS02OyAvLyBJZlxyXG5cclxuICAgICAgbGV0IHgxOiBudW1iZXIsIHkxOiBudW1iZXIsIHoxOiBudW1iZXI7XHJcbiAgICAgIGxldCB4MjogbnVtYmVyLCB5MjogbnVtYmVyLCB6MjogbnVtYmVyO1xyXG5cclxuICAgICAgaWYgKCFzaW5ndWxhcikge1xyXG4gICAgICAgIHgxID0gTWF0aC5hdGFuMihzNiwgczEwKTtcclxuICAgICAgICB5MSA9IE1hdGguYXRhbjIoLXMyLCBzeSk7XHJcbiAgICAgICAgejEgPSBNYXRoLmF0YW4yKHMxLCBzMCk7XHJcblxyXG4gICAgICAgIHgyID0gTWF0aC5hdGFuMigtczYsIC1zMTApO1xyXG4gICAgICAgIHkyID0gTWF0aC5hdGFuMigtczIsIC1zeSk7XHJcbiAgICAgICAgejIgPSBNYXRoLmF0YW4yKC1zMSwgLXMwKTtcclxuXHJcbiAgICAgICAgaWYgKE1hdGguYWJzKHgyKSArIE1hdGguYWJzKHkyKSArIE1hdGguYWJzKHoyKSA8IE1hdGguYWJzKHgxKSArIE1hdGguYWJzKHkxKSArIE1hdGguYWJzKHoxKSkge1xyXG4gICAgICAgICAgeDEgPSB4MjtcclxuICAgICAgICAgIHkxID0geTI7XHJcbiAgICAgICAgICB6MSA9IHoyO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB4MSA9IE1hdGguYXRhbjIoLXRoaXMuZGF0YVs5XSAvIHNjYWxpbmcueiwgdGhpcy5kYXRhWzVdIC8gc2NhbGluZy55KTtcclxuICAgICAgICB5MSA9IE1hdGguYXRhbjIoLXRoaXMuZGF0YVsyXSAvIHNjYWxpbmcueCwgc3kpO1xyXG4gICAgICAgIHoxID0gMDtcclxuICAgICAgfVxyXG5cclxuICAgICAgbGV0IHJvdGF0aW9uOiBWZWN0b3IzID0gbmV3IFZlY3RvcjMoeDEsIHkxLCB6MSk7XHJcbiAgICAgIHJvdGF0aW9uLnNjYWxlKDE4MCAvIE1hdGguUEkpO1xyXG5cclxuICAgICAgcmV0dXJuIHJvdGF0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0aGUgZWxlbWVudHMgb2YgdGhpcyBtYXRyaXggdG8gdGhlIHZhbHVlcyBvZiB0aGUgZ2l2ZW4gbWF0cml4XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZXQoX3RvOiBNYXRyaXg0eDQpOiB2b2lkIHtcclxuICAgICAgLy8gdGhpcy5kYXRhID0gX3RvLmdldCgpO1xyXG4gICAgICB0aGlzLmRhdGEuc2V0KF90by5kYXRhKTtcclxuICAgICAgdGhpcy5yZXNldENhY2hlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gdGhlIGVsZW1lbnRzIG9mIHRoaXMgbWF0cml4IGFzIGEgRmxvYXQzMkFycmF5XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQoKTogRmxvYXQzMkFycmF5IHtcclxuICAgICAgcmV0dXJuIG5ldyBGbG9hdDMyQXJyYXkodGhpcy5kYXRhKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2VyaWFsaXplKCk6IFNlcmlhbGl6YXRpb24ge1xyXG4gICAgICAvLyBUT0RPOiBzYXZlIHRyYW5zbGF0aW9uLCByb3RhdGlvbiBhbmQgc2NhbGUgYXMgdmVjdG9ycyBmb3IgcmVhZGFiaWxpdHkgYW5kIG1hbmlwdWxhdGlvblxyXG4gICAgICBsZXQgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IHRoaXMuZ2V0TXV0YXRvcigpO1xyXG4gICAgICByZXR1cm4gc2VyaWFsaXphdGlvbjtcclxuICAgIH1cclxuICAgIHB1YmxpYyBkZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbik6IFNlcmlhbGl6YWJsZSB7XHJcbiAgICAgIHRoaXMubXV0YXRlKF9zZXJpYWxpemF0aW9uKTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldE11dGF0b3IoKTogTXV0YXRvciB7XHJcbiAgICAgIGlmICh0aGlzLm11dGF0b3IpXHJcbiAgICAgICAgcmV0dXJuIHRoaXMubXV0YXRvcjtcclxuXHJcbiAgICAgIGxldCBtdXRhdG9yOiBNdXRhdG9yID0ge1xyXG4gICAgICAgIHRyYW5zbGF0aW9uOiB0aGlzLnRyYW5zbGF0aW9uLmdldE11dGF0b3IoKSxcclxuICAgICAgICByb3RhdGlvbjogdGhpcy5yb3RhdGlvbi5nZXRNdXRhdG9yKCksXHJcbiAgICAgICAgc2NhbGluZzogdGhpcy5zY2FsaW5nLmdldE11dGF0b3IoKVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgLy8gY2FjaGUgbXV0YXRvclxyXG4gICAgICB0aGlzLm11dGF0b3IgPSBtdXRhdG9yO1xyXG4gICAgICByZXR1cm4gbXV0YXRvcjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgbXV0YXRlKF9tdXRhdG9yOiBNdXRhdG9yKTogdm9pZCB7XHJcbiAgICAgIGxldCBvbGRUcmFuc2xhdGlvbjogVmVjdG9yMyA9IHRoaXMudHJhbnNsYXRpb247XHJcbiAgICAgIGxldCBvbGRSb3RhdGlvbjogVmVjdG9yMyA9IHRoaXMucm90YXRpb247XHJcbiAgICAgIGxldCBvbGRTY2FsaW5nOiBWZWN0b3IzID0gdGhpcy5zY2FsaW5nO1xyXG4gICAgICBsZXQgbmV3VHJhbnNsYXRpb246IFZlY3RvcjMgPSA8VmVjdG9yMz5fbXV0YXRvcltcInRyYW5zbGF0aW9uXCJdO1xyXG4gICAgICBsZXQgbmV3Um90YXRpb246IFZlY3RvcjMgPSA8VmVjdG9yMz5fbXV0YXRvcltcInJvdGF0aW9uXCJdO1xyXG4gICAgICBsZXQgbmV3U2NhbGluZzogVmVjdG9yMyA9IDxWZWN0b3IzPl9tdXRhdG9yW1wic2NhbGluZ1wiXTtcclxuICAgICAgbGV0IHZlY3RvcnM6IFZlY3RvclJlcHJlc2VudGF0aW9uID0geyB0cmFuc2xhdGlvbjogbnVsbCwgcm90YXRpb246IG51bGwsIHNjYWxpbmc6IG51bGwgfTtcclxuICAgICAgaWYgKG5ld1RyYW5zbGF0aW9uKSB7XHJcbiAgICAgICAgdmVjdG9ycy50cmFuc2xhdGlvbiA9IG5ldyBWZWN0b3IzKFxyXG4gICAgICAgICAgbmV3VHJhbnNsYXRpb24ueCAhPSB1bmRlZmluZWQgPyBuZXdUcmFuc2xhdGlvbi54IDogb2xkVHJhbnNsYXRpb24ueCxcclxuICAgICAgICAgIG5ld1RyYW5zbGF0aW9uLnkgIT0gdW5kZWZpbmVkID8gbmV3VHJhbnNsYXRpb24ueSA6IG9sZFRyYW5zbGF0aW9uLnksXHJcbiAgICAgICAgICBuZXdUcmFuc2xhdGlvbi56ICE9IHVuZGVmaW5lZCA/IG5ld1RyYW5zbGF0aW9uLnogOiBvbGRUcmFuc2xhdGlvbi56XHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAobmV3Um90YXRpb24pIHtcclxuICAgICAgICB2ZWN0b3JzLnJvdGF0aW9uID0gbmV3IFZlY3RvcjMoXHJcbiAgICAgICAgICBuZXdSb3RhdGlvbi54ICE9IHVuZGVmaW5lZCA/IG5ld1JvdGF0aW9uLnggOiBvbGRSb3RhdGlvbi54LFxyXG4gICAgICAgICAgbmV3Um90YXRpb24ueSAhPSB1bmRlZmluZWQgPyBuZXdSb3RhdGlvbi55IDogb2xkUm90YXRpb24ueSxcclxuICAgICAgICAgIG5ld1JvdGF0aW9uLnogIT0gdW5kZWZpbmVkID8gbmV3Um90YXRpb24ueiA6IG9sZFJvdGF0aW9uLnpcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChuZXdTY2FsaW5nKSB7XHJcbiAgICAgICAgdmVjdG9ycy5zY2FsaW5nID0gbmV3IFZlY3RvcjMoXHJcbiAgICAgICAgICBuZXdTY2FsaW5nLnggIT0gdW5kZWZpbmVkID8gbmV3U2NhbGluZy54IDogb2xkU2NhbGluZy54LFxyXG4gICAgICAgICAgbmV3U2NhbGluZy55ICE9IHVuZGVmaW5lZCA/IG5ld1NjYWxpbmcueSA6IG9sZFNjYWxpbmcueSxcclxuICAgICAgICAgIG5ld1NjYWxpbmcueiAhPSB1bmRlZmluZWQgPyBuZXdTY2FsaW5nLnogOiBvbGRTY2FsaW5nLnpcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBUT0RPOiBwb3NzaWJsZSBwZXJmb3JtYW5jZSBvcHRpbWl6YXRpb24gd2hlbiBvbmx5IG9uZSBvciB0d28gY29tcG9uZW50cyBjaGFuZ2UsIHRoZW4gdXNlIG9sZCBtYXRyaXggaW5zdGVhZCBvZiBJREVOVElUWSBhbmQgdHJhbnNmb3JtIGJ5IGRpZmZlcmVuY2VzL3F1b3RpZW50c1xyXG4gICAgICBsZXQgbWF0cml4OiBNYXRyaXg0eDQgPSBNYXRyaXg0eDQuSURFTlRJVFk7XHJcbiAgICAgIGlmICh2ZWN0b3JzLnRyYW5zbGF0aW9uKVxyXG4gICAgICAgIG1hdHJpeC50cmFuc2xhdGUodmVjdG9ycy50cmFuc2xhdGlvbik7XHJcbiAgICAgIGlmICh2ZWN0b3JzLnJvdGF0aW9uKSB7XHJcbiAgICAgICAgbWF0cml4LnJvdGF0ZVoodmVjdG9ycy5yb3RhdGlvbi56KTtcclxuICAgICAgICBtYXRyaXgucm90YXRlWSh2ZWN0b3JzLnJvdGF0aW9uLnkpO1xyXG4gICAgICAgIG1hdHJpeC5yb3RhdGVYKHZlY3RvcnMucm90YXRpb24ueCk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHZlY3RvcnMuc2NhbGluZylcclxuICAgICAgICBtYXRyaXguc2NhbGUodmVjdG9ycy5zY2FsaW5nKTtcclxuICAgICAgdGhpcy5zZXQobWF0cml4KTtcclxuXHJcbiAgICAgIHRoaXMudmVjdG9ycyA9IHZlY3RvcnM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldE11dGF0b3JBdHRyaWJ1dGVUeXBlcyhfbXV0YXRvcjogTXV0YXRvcik6IE11dGF0b3JBdHRyaWJ1dGVUeXBlcyB7XHJcbiAgICAgIGxldCB0eXBlczogTXV0YXRvckF0dHJpYnV0ZVR5cGVzID0ge307XHJcbiAgICAgIGlmIChfbXV0YXRvci50cmFuc2xhdGlvbikgdHlwZXMudHJhbnNsYXRpb24gPSBcIlZlY3RvcjNcIjtcclxuICAgICAgaWYgKF9tdXRhdG9yLnJvdGF0aW9uKSB0eXBlcy5yb3RhdGlvbiA9IFwiVmVjdG9yM1wiO1xyXG4gICAgICBpZiAoX211dGF0b3Iuc2NhbGluZykgdHlwZXMuc2NhbGluZyA9IFwiVmVjdG9yM1wiO1xyXG4gICAgICByZXR1cm4gdHlwZXM7XHJcbiAgICB9XHJcbiAgICBwcm90ZWN0ZWQgcmVkdWNlTXV0YXRvcihfbXV0YXRvcjogTXV0YXRvcik6IHZvaWQgey8qKiAqLyB9XHJcblxyXG4gICAgcHJpdmF0ZSByZXNldENhY2hlKCk6IHZvaWQge1xyXG4gICAgICB0aGlzLnZlY3RvcnMgPSB7IHRyYW5zbGF0aW9uOiBudWxsLCByb3RhdGlvbjogbnVsbCwgc2NhbGluZzogbnVsbCB9O1xyXG4gICAgICB0aGlzLm11dGF0b3IgPSBudWxsO1xyXG4gICAgfVxyXG4gIH1cclxuICAvLyNlbmRyZWdpb25cclxufVxyXG4iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogRGVmaW5lcyB0aGUgb3JpZ2luIG9mIGEgcmVjdGFuZ2xlXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBlbnVtIE9SSUdJTjJEIHtcclxuICAgICAgICBUT1BMRUZUID0gMHgwMCxcclxuICAgICAgICBUT1BDRU5URVIgPSAweDAxLFxyXG4gICAgICAgIFRPUFJJR0hUID0gMHgwMixcclxuICAgICAgICBDRU5URVJMRUZUID0gMHgxMCxcclxuICAgICAgICBDRU5URVIgPSAweDExLFxyXG4gICAgICAgIENFTlRFUlJJR0hUID0gMHgxMixcclxuICAgICAgICBCT1RUT01MRUZUID0gMHgyMCxcclxuICAgICAgICBCT1RUT01DRU5URVIgPSAweDIxLFxyXG4gICAgICAgIEJPVFRPTVJJR0hUID0gMHgyMlxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGVmaW5lcyBhIHJlY3RhbmdsZSB3aXRoIHBvc2l0aW9uIGFuZCBzaXplIGFuZCBhZGQgY29tZm9ydGFibGUgbWV0aG9kcyB0byBpdFxyXG4gICAgICogQGF1dGhvciBKaXJrYSBEZWxsJ09yby1GcmllZGwsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgUmVjdGFuZ2xlIGV4dGVuZHMgTXV0YWJsZSB7XHJcbiAgICAgICAgcHVibGljIHBvc2l0aW9uOiBWZWN0b3IyID0gUmVjeWNsZXIuZ2V0KFZlY3RvcjIpO1xyXG4gICAgICAgIHB1YmxpYyBzaXplOiBWZWN0b3IyID0gUmVjeWNsZXIuZ2V0KFZlY3RvcjIpO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcihfeDogbnVtYmVyID0gMCwgX3k6IG51bWJlciA9IDAsIF93aWR0aDogbnVtYmVyID0gMSwgX2hlaWdodDogbnVtYmVyID0gMSwgX29yaWdpbjogT1JJR0lOMkQgPSBPUklHSU4yRC5UT1BMRUZUKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0UG9zaXRpb25BbmRTaXplKF94LCBfeSwgX3dpZHRoLCBfaGVpZ2h0LCBfb3JpZ2luKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgYSBuZXcgcmVjdGFuZ2xlIGNyZWF0ZWQgd2l0aCB0aGUgZ2l2ZW4gcGFyYW1ldGVyc1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgR0VUKF94OiBudW1iZXIgPSAwLCBfeTogbnVtYmVyID0gMCwgX3dpZHRoOiBudW1iZXIgPSAxLCBfaGVpZ2h0OiBudW1iZXIgPSAxLCBfb3JpZ2luOiBPUklHSU4yRCA9IE9SSUdJTjJELlRPUExFRlQpOiBSZWN0YW5nbGUge1xyXG4gICAgICAgICAgICBsZXQgcmVjdDogUmVjdGFuZ2xlID0gUmVjeWNsZXIuZ2V0KFJlY3RhbmdsZSk7XHJcbiAgICAgICAgICAgIHJlY3Quc2V0UG9zaXRpb25BbmRTaXplKF94LCBfeSwgX3dpZHRoLCBfaGVpZ2h0KTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlY3Q7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTZXRzIHRoZSBwb3NpdGlvbiBhbmQgc2l6ZSBvZiB0aGUgcmVjdGFuZ2xlIGFjY29yZGluZyB0byB0aGUgZ2l2ZW4gcGFyYW1ldGVyc1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzZXRQb3NpdGlvbkFuZFNpemUoX3g6IG51bWJlciA9IDAsIF95OiBudW1iZXIgPSAwLCBfd2lkdGg6IG51bWJlciA9IDEsIF9oZWlnaHQ6IG51bWJlciA9IDEsIF9vcmlnaW46IE9SSUdJTjJEID0gT1JJR0lOMkQuVE9QTEVGVCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLnNpemUuc2V0KF93aWR0aCwgX2hlaWdodCk7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoX29yaWdpbiAmIDB4MDMpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMHgwMDogdGhpcy5wb3NpdGlvbi54ID0gX3g7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAweDAxOiB0aGlzLnBvc2l0aW9uLnggPSBfeCAtIF93aWR0aCAvIDI7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAweDAyOiB0aGlzLnBvc2l0aW9uLnggPSBfeCAtIF93aWR0aDsgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc3dpdGNoIChfb3JpZ2luICYgMHgzMCkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAweDAwOiB0aGlzLnBvc2l0aW9uLnkgPSBfeTsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDB4MTA6IHRoaXMucG9zaXRpb24ueSA9IF95IC0gX2hlaWdodCAvIDI7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAweDIwOiB0aGlzLnBvc2l0aW9uLnkgPSBfeSAtIF9oZWlnaHQ7IGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnZXQgeCgpOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wb3NpdGlvbi54O1xyXG4gICAgICAgIH1cclxuICAgICAgICBnZXQgeSgpOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wb3NpdGlvbi55O1xyXG4gICAgICAgIH1cclxuICAgICAgICBnZXQgd2lkdGgoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2l6ZS54O1xyXG4gICAgICAgIH1cclxuICAgICAgICBnZXQgaGVpZ2h0KCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNpemUueTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdldCBsZWZ0KCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBvc2l0aW9uLng7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGdldCB0b3AoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucG9zaXRpb24ueTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZ2V0IHJpZ2h0KCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBvc2l0aW9uLnggKyB0aGlzLnNpemUueDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZ2V0IGJvdHRvbSgpOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wb3NpdGlvbi55ICsgdGhpcy5zaXplLnk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzZXQgeChfeDogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueCA9IF94O1xyXG4gICAgICAgIH1cclxuICAgICAgICBzZXQgeShfeTogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueSA9IF95O1xyXG4gICAgICAgIH1cclxuICAgICAgICBzZXQgd2lkdGgoX3dpZHRoOiBudW1iZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi54ID0gX3dpZHRoO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzZXQgaGVpZ2h0KF9oZWlnaHQ6IG51bWJlcikge1xyXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnkgPSBfaGVpZ2h0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBzZXQgbGVmdChfdmFsdWU6IG51bWJlcikge1xyXG4gICAgICAgICAgICB0aGlzLnNpemUueCA9IHRoaXMucmlnaHQgLSBfdmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueCA9IF92YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2V0IHRvcChfdmFsdWU6IG51bWJlcikge1xyXG4gICAgICAgICAgICB0aGlzLnNpemUueSA9IHRoaXMuYm90dG9tIC0gX3ZhbHVlO1xyXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnkgPSBfdmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNldCByaWdodChfdmFsdWU6IG51bWJlcikge1xyXG4gICAgICAgICAgICB0aGlzLnNpemUueCA9IHRoaXMucG9zaXRpb24ueCArIF92YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2V0IGJvdHRvbShfdmFsdWU6IG51bWJlcikge1xyXG4gICAgICAgICAgICB0aGlzLnNpemUueSA9IHRoaXMucG9zaXRpb24ueSArIF92YWx1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgZ2l2ZW4gcG9pbnQgaXMgaW5zaWRlIG9mIHRoaXMgcmVjdGFuZ2xlIG9yIG9uIHRoZSBib3JkZXJcclxuICAgICAgICAgKiBAcGFyYW0gX3BvaW50XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGlzSW5zaWRlKF9wb2ludDogVmVjdG9yMik6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICByZXR1cm4gKF9wb2ludC54ID49IHRoaXMubGVmdCAmJiBfcG9pbnQueCA8PSB0aGlzLnJpZ2h0ICYmIF9wb2ludC55ID49IHRoaXMudG9wICYmIF9wb2ludC55IDw9IHRoaXMuYm90dG9tKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByb3RlY3RlZCByZWR1Y2VNdXRhdG9yKF9tdXRhdG9yOiBNdXRhdG9yKTogdm9pZCB7LyogKi8gfVxyXG4gICAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgLyoqXHJcbiAgICogU3RvcmVzIGFuZCBtYW5pcHVsYXRlcyBhIHR3b2RpbWVuc2lvbmFsIHZlY3RvciBjb21wcmlzZWQgb2YgdGhlIGNvbXBvbmVudHMgeCBhbmQgeVxyXG4gICAqIGBgYHBsYWludGV4dFxyXG4gICAqICAgICAgICAgICAgK3lcclxuICAgKiAgICAgICAgICAgICB8X18gK3hcclxuICAgKiBgYGBcclxuICAgKiBAYXV0aG9ycyBMdWthcyBTY2hldWVybGUsIEhGVSwgMjAxOVxyXG4gICAqL1xyXG4gIGV4cG9ydCBjbGFzcyBWZWN0b3IyIGV4dGVuZHMgTXV0YWJsZSB7XHJcbiAgICBwcml2YXRlIGRhdGE6IEZsb2F0MzJBcnJheTtcclxuXHJcbiAgICBwdWJsaWMgY29uc3RydWN0b3IoX3g6IG51bWJlciA9IDAsIF95OiBudW1iZXIgPSAwKSB7XHJcbiAgICAgIHN1cGVyKCk7XHJcbiAgICAgIHRoaXMuZGF0YSA9IG5ldyBGbG9hdDMyQXJyYXkoW194LCBfeV0pO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCB4KCk6IG51bWJlciB7XHJcbiAgICAgIHJldHVybiB0aGlzLmRhdGFbMF07XHJcbiAgICB9XHJcbiAgICBnZXQgeSgpOiBudW1iZXIge1xyXG4gICAgICByZXR1cm4gdGhpcy5kYXRhWzFdO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCB4KF94OiBudW1iZXIpIHtcclxuICAgICAgdGhpcy5kYXRhWzBdID0gX3g7XHJcbiAgICB9XHJcbiAgICBzZXQgeShfeTogbnVtYmVyKSB7XHJcbiAgICAgIHRoaXMuZGF0YVsxXSA9IF95O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBcclxuICAgICAqIEEgc2hvcnRoYW5kIGZvciB3cml0aW5nIGBuZXcgVmVjdG9yMigwLCAwKWAuXHJcbiAgICAgKiBAcmV0dXJucyBBIG5ldyB2ZWN0b3Igd2l0aCB0aGUgdmFsdWVzICgwLCAwKVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGdldCBaRVJPKCk6IFZlY3RvcjIge1xyXG4gICAgICBsZXQgdmVjdG9yOiBWZWN0b3IyID0gbmV3IFZlY3RvcjIoKTtcclxuICAgICAgcmV0dXJuIHZlY3RvcjtcclxuICAgIH1cclxuXHJcbiAgICAvKiogXHJcbiAgICAgKiBBIHNob3J0aGFuZCBmb3Igd3JpdGluZyBgbmV3IFZlY3RvcjIoX3NjYWxlLCBfc2NhbGUpYC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBPTkUoX3NjYWxlOiBudW1iZXIgPSAxKTogVmVjdG9yMiB7XHJcbiAgICAgIGxldCB2ZWN0b3I6IFZlY3RvcjIgPSBuZXcgVmVjdG9yMihfc2NhbGUsIF9zY2FsZSk7XHJcbiAgICAgIHJldHVybiB2ZWN0b3I7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIFxyXG4gICAgICogQSBzaG9ydGhhbmQgZm9yIHdyaXRpbmcgYG5ldyBWZWN0b3IyKDAsIDEpYC5cclxuICAgICAqIEByZXR1cm5zIEEgbmV3IHZlY3RvciB3aXRoIHRoZSB2YWx1ZXMgKDAsIDEpXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0IFVQKCk6IFZlY3RvcjIge1xyXG4gICAgICBsZXQgdmVjdG9yOiBWZWN0b3IyID0gbmV3IFZlY3RvcjIoMCwgMSk7XHJcbiAgICAgIHJldHVybiB2ZWN0b3I7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIFxyXG4gICAgICogQSBzaG9ydGhhbmQgZm9yIHdyaXRpbmcgYG5ldyBWZWN0b3IyKDAsIC0xKWAuXHJcbiAgICAgKiBAcmV0dXJucyBBIG5ldyB2ZWN0b3Igd2l0aCB0aGUgdmFsdWVzICgwLCAtMSlcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBnZXQgRE9XTigpOiBWZWN0b3IyIHtcclxuICAgICAgbGV0IHZlY3RvcjogVmVjdG9yMiA9IG5ldyBWZWN0b3IyKDAsIC0xKTtcclxuICAgICAgcmV0dXJuIHZlY3RvcjtcclxuICAgIH1cclxuXHJcbiAgICAvKiogXHJcbiAgICAgKiBBIHNob3J0aGFuZCBmb3Igd3JpdGluZyBgbmV3IFZlY3RvcjIoMSwgMClgLlxyXG4gICAgICogQHJldHVybnMgQSBuZXcgdmVjdG9yIHdpdGggdGhlIHZhbHVlcyAoMSwgMClcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBnZXQgUklHSFQoKTogVmVjdG9yMiB7XHJcbiAgICAgIGxldCB2ZWN0b3I6IFZlY3RvcjIgPSBuZXcgVmVjdG9yMigxLCAwKTtcclxuICAgICAgcmV0dXJuIHZlY3RvcjtcclxuICAgIH1cclxuXHJcbiAgICAvKiogXHJcbiAgICAgKiBBIHNob3J0aGFuZCBmb3Igd3JpdGluZyBgbmV3IFZlY3RvcjIoLTEsIDApYC5cclxuICAgICAqIEByZXR1cm5zIEEgbmV3IHZlY3RvciB3aXRoIHRoZSB2YWx1ZXMgKC0xLCAwKVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGdldCBMRUZUKCk6IFZlY3RvcjIge1xyXG4gICAgICBsZXQgdmVjdG9yOiBWZWN0b3IyID0gbmV3IFZlY3RvcjIoLTEsIDApO1xyXG4gICAgICByZXR1cm4gdmVjdG9yO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTm9ybWFsaXplcyBhIGdpdmVuIHZlY3RvciB0byB0aGUgZ2l2ZW4gbGVuZ3RoIHdpdGhvdXQgZWRpdGluZyB0aGUgb3JpZ2luYWwgdmVjdG9yLlxyXG4gICAgICogQHBhcmFtIF92ZWN0b3IgdGhlIHZlY3RvciB0byBub3JtYWxpemVcclxuICAgICAqIEBwYXJhbSBfbGVuZ3RoIHRoZSBsZW5ndGggb2YgdGhlIHJlc3VsdGluZyB2ZWN0b3IuIGRlZmF1bHRzIHRvIDFcclxuICAgICAqIEByZXR1cm5zIGEgbmV3IHZlY3RvciByZXByZXNlbnRpbmcgdGhlIG5vcm1hbGlzZWQgdmVjdG9yIHNjYWxlZCBieSB0aGUgZ2l2ZW4gbGVuZ3RoXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgTk9STUFMSVpBVElPTihfdmVjdG9yOiBWZWN0b3IyLCBfbGVuZ3RoOiBudW1iZXIgPSAxKTogVmVjdG9yMiB7XHJcbiAgICAgIGxldCB2ZWN0b3I6IFZlY3RvcjIgPSBWZWN0b3IyLlpFUk87XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgbGV0IFt4LCB5XSA9IF92ZWN0b3IuZGF0YTtcclxuICAgICAgICBsZXQgZmFjdG9yOiBudW1iZXIgPSBfbGVuZ3RoIC8gTWF0aC5oeXBvdCh4LCB5KTtcclxuICAgICAgICB2ZWN0b3IuZGF0YSA9IG5ldyBGbG9hdDMyQXJyYXkoW192ZWN0b3IueCAqIGZhY3RvciwgX3ZlY3Rvci55ICogZmFjdG9yXSk7XHJcbiAgICAgIH0gY2F0Y2ggKF9lKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKF9lKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdmVjdG9yO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2NhbGVzIGEgZ2l2ZW4gdmVjdG9yIGJ5IGEgZ2l2ZW4gc2NhbGUgd2l0aG91dCBjaGFuZ2luZyB0aGUgb3JpZ2luYWwgdmVjdG9yXHJcbiAgICAgKiBAcGFyYW0gX3ZlY3RvciBUaGUgdmVjdG9yIHRvIHNjYWxlLlxyXG4gICAgICogQHBhcmFtIF9zY2FsZSBUaGUgc2NhbGUgdG8gc2NhbGUgd2l0aC5cclxuICAgICAqIEByZXR1cm5zIEEgbmV3IHZlY3RvciByZXByZXNlbnRpbmcgdGhlIHNjYWxlZCB2ZXJzaW9uIG9mIHRoZSBnaXZlbiB2ZWN0b3JcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBTQ0FMRShfdmVjdG9yOiBWZWN0b3IyLCBfc2NhbGU6IG51bWJlcik6IFZlY3RvcjIge1xyXG4gICAgICBsZXQgdmVjdG9yOiBWZWN0b3IyID0gbmV3IFZlY3RvcjIoKTtcclxuICAgICAgcmV0dXJuIHZlY3RvcjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFN1bXMgdXAgbXVsdGlwbGUgdmVjdG9ycy5cclxuICAgICAqIEBwYXJhbSBfdmVjdG9ycyBBIHNlcmllcyBvZiB2ZWN0b3JzIHRvIHN1bSB1cFxyXG4gICAgICogQHJldHVybnMgQSBuZXcgdmVjdG9yIHJlcHJlc2VudGluZyB0aGUgc3VtIG9mIHRoZSBnaXZlbiB2ZWN0b3JzXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgU1VNKC4uLl92ZWN0b3JzOiBWZWN0b3IyW10pOiBWZWN0b3IyIHtcclxuICAgICAgbGV0IHJlc3VsdDogVmVjdG9yMiA9IG5ldyBWZWN0b3IyKCk7XHJcbiAgICAgIGZvciAobGV0IHZlY3RvciBvZiBfdmVjdG9ycylcclxuICAgICAgICByZXN1bHQuZGF0YSA9IG5ldyBGbG9hdDMyQXJyYXkoW3Jlc3VsdC54ICsgdmVjdG9yLngsIHJlc3VsdC55ICsgdmVjdG9yLnldKTtcclxuICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFN1YnRyYWN0cyB0d28gdmVjdG9ycy5cclxuICAgICAqIEBwYXJhbSBfYSBUaGUgdmVjdG9yIHRvIHN1YnRyYWN0IGZyb20uXHJcbiAgICAgKiBAcGFyYW0gX2IgVGhlIHZlY3RvciB0byBzdWJ0cmFjdC5cclxuICAgICAqIEByZXR1cm5zIEEgbmV3IHZlY3RvciByZXByZXNlbnRpbmcgdGhlIGRpZmZlcmVuY2Ugb2YgdGhlIGdpdmVuIHZlY3RvcnNcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBESUZGRVJFTkNFKF9hOiBWZWN0b3IyLCBfYjogVmVjdG9yMik6IFZlY3RvcjIge1xyXG4gICAgICBsZXQgdmVjdG9yOiBWZWN0b3IyID0gbmV3IFZlY3RvcjI7XHJcbiAgICAgIHZlY3Rvci5kYXRhID0gbmV3IEZsb2F0MzJBcnJheShbX2EueCAtIF9iLngsIF9hLnkgLSBfYi55XSk7XHJcbiAgICAgIHJldHVybiB2ZWN0b3I7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb21wdXRlcyB0aGUgZG90cHJvZHVjdCBvZiAyIHZlY3RvcnMuXHJcbiAgICAgKiBAcGFyYW0gX2EgVGhlIHZlY3RvciB0byBtdWx0aXBseS5cclxuICAgICAqIEBwYXJhbSBfYiBUaGUgdmVjdG9yIHRvIG11bHRpcGx5IGJ5LlxyXG4gICAgICogQHJldHVybnMgQSBuZXcgdmVjdG9yIHJlcHJlc2VudGluZyB0aGUgZG90cHJvZHVjdCBvZiB0aGUgZ2l2ZW4gdmVjdG9yc1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIERPVChfYTogVmVjdG9yMiwgX2I6IFZlY3RvcjIpOiBudW1iZXIge1xyXG4gICAgICBsZXQgc2NhbGFyUHJvZHVjdDogbnVtYmVyID0gX2EueCAqIF9iLnggKyBfYS55ICogX2IueTtcclxuICAgICAgcmV0dXJuIHNjYWxhclByb2R1Y3Q7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBtYWduaXR1ZGUgb2YgYSBnaXZlbiB2ZWN0b3IuXHJcbiAgICAgKiBJZiB5b3Ugb25seSBuZWVkIHRvIGNvbXBhcmUgbWFnbml0dWRlcyBvZiBkaWZmZXJlbnQgdmVjdG9ycywgeW91IGNhbiBjb21wYXJlIHNxdWFyZWQgbWFnbml0dWRlcyB1c2luZyBWZWN0b3IyLk1BR05JVFVERVNRUiBpbnN0ZWFkLlxyXG4gICAgICogQHNlZSBWZWN0b3IyLk1BR05JVFVERVNRUlxyXG4gICAgICogQHBhcmFtIF92ZWN0b3IgVGhlIHZlY3RvciB0byBnZXQgdGhlIG1hZ25pdHVkZSBvZi5cclxuICAgICAqIEByZXR1cm5zIEEgbnVtYmVyIHJlcHJlc2VudGluZyB0aGUgbWFnbml0dWRlIG9mIHRoZSBnaXZlbiB2ZWN0b3IuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgTUFHTklUVURFKF92ZWN0b3I6IFZlY3RvcjIpOiBudW1iZXIge1xyXG4gICAgICBsZXQgbWFnbml0dWRlOiBudW1iZXIgPSBNYXRoLnNxcnQoVmVjdG9yMi5NQUdOSVRVREVTUVIoX3ZlY3RvcikpO1xyXG4gICAgICByZXR1cm4gbWFnbml0dWRlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgc3F1YXJlZCBtYWduaXR1ZGUgb2YgYSBnaXZlbiB2ZWN0b3IuIE11Y2ggbGVzcyBjYWxjdWxhdGlvbiBpbnRlbnNpdmUgdGhhbiBWZWN0b3IyLk1BR05JVFVERSwgc2hvdWxkIGJlIHVzZWQgaW5zdGVhZCBpZiBwb3NzaWJsZS5cclxuICAgICAqIEBwYXJhbSBfdmVjdG9yIFRoZSB2ZWN0b3IgdG8gZ2V0IHRoZSBzcXVhcmVkIG1hZ25pdHVkZSBvZi5cclxuICAgICAqIEByZXR1cm5zIEEgbnVtYmVyIHJlcHJlc2VudGluZyB0aGUgc3F1YXJlZCBtYWduaXR1ZGUgb2YgdGhlIGdpdmVuIHZlY3Rvci5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBNQUdOSVRVREVTUVIoX3ZlY3RvcjogVmVjdG9yMik6IG51bWJlciB7XHJcbiAgICAgIGxldCBtYWduaXR1ZGU6IG51bWJlciA9IFZlY3RvcjIuRE9UKF92ZWN0b3IsIF92ZWN0b3IpO1xyXG4gICAgICByZXR1cm4gbWFnbml0dWRlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsY3VsYXRlcyB0aGUgY3Jvc3MgcHJvZHVjdCBvZiB0d28gVmVjdG9ycy4gRHVlIHRvIHRoZW0gYmVpbmcgb25seSAyIERpbWVuc2lvbmFsLCB0aGUgcmVzdWx0IGlzIGEgc2luZ2xlIG51bWJlcixcclxuICAgICAqIHdoaWNoIGltcGxpY2l0bHkgaXMgb24gdGhlIFogYXhpcy4gSXQgaXMgYWxzbyB0aGUgc2lnbmVkIG1hZ25pdHVkZSBvZiB0aGUgcmVzdWx0LlxyXG4gICAgICogQHBhcmFtIF9hIFZlY3RvciB0byBjb21wdXRlIHRoZSBjcm9zcyBwcm9kdWN0IG9uXHJcbiAgICAgKiBAcGFyYW0gX2IgVmVjdG9yIHRvIGNvbXB1dGUgdGhlIGNyb3NzIHByb2R1Y3Qgd2l0aFxyXG4gICAgICogQHJldHVybnMgQSBudW1iZXIgcmVwcmVzZW50aW5nIHJlc3VsdCBvZiB0aGUgY3Jvc3MgcHJvZHVjdC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBDUk9TU1BST0RVQ1QoX2E6IFZlY3RvcjIsIF9iOiBWZWN0b3IyKTogbnVtYmVyIHtcclxuICAgICAgbGV0IGNyb3NzUHJvZHVjdDogbnVtYmVyID0gX2EueCAqIF9iLnkgLSBfYS55ICogX2IueDtcclxuICAgICAgcmV0dXJuIGNyb3NzUHJvZHVjdDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGN1bGF0ZXMgdGhlIG9ydGhvZ29uYWwgdmVjdG9yIHRvIHRoZSBnaXZlbiB2ZWN0b3IuIFJvdGF0ZXMgY291bnRlcmNsb2Nrd2lzZSBieSBkZWZhdWx0LlxyXG4gICAgICogYGBgcGxhaW50ZXh0XHJcbiAgICAgKiAgICBeICAgICAgICAgICAgICAgIHxcclxuICAgICAqICAgIHwgID0+ICA8LS0gID0+ICAgdiAgPT4gIC0tPlxyXG4gICAgICogYGBgXHJcbiAgICAgKiBAcGFyYW0gX3ZlY3RvciBWZWN0b3IgdG8gZ2V0IHRoZSBvcnRob2dvbmFsIGVxdWl2YWxlbnQgb2ZcclxuICAgICAqIEBwYXJhbSBfY2xvY2t3aXNlIFNob3VsZCB0aGUgcm90YXRpb24gYmUgY2xvY2t3aXNlIGluc3RlYWQgb2YgdGhlIGRlZmF1bHQgY291bnRlcmNsb2Nrd2lzZT8gZGVmYXVsdDogZmFsc2VcclxuICAgICAqIEByZXR1cm5zIEEgVmVjdG9yIHRoYXQgaXMgb3J0aG9nb25hbCB0byBhbmQgaGFzIHRoZSBzYW1lIG1hZ25pdHVkZSBhcyB0aGUgZ2l2ZW4gVmVjdG9yLiAgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgT1JUSE9HT05BTChfdmVjdG9yOiBWZWN0b3IyLCBfY2xvY2t3aXNlOiBib29sZWFuID0gZmFsc2UpOiBWZWN0b3IyIHtcclxuICAgICAgaWYgKF9jbG9ja3dpc2UpIHJldHVybiBuZXcgVmVjdG9yMihfdmVjdG9yLnksIC1fdmVjdG9yLngpO1xyXG4gICAgICBlbHNlIHJldHVybiBuZXcgVmVjdG9yMigtX3ZlY3Rvci55LCBfdmVjdG9yLngpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkcyB0aGUgZ2l2ZW4gdmVjdG9yIHRvIHRoZSBleGVjdXRpbmcgdmVjdG9yLCBjaGFuZ2luZyB0aGUgZXhlY3V0b3IuXHJcbiAgICAgKiBAcGFyYW0gX2FkZGVuZCBUaGUgdmVjdG9yIHRvIGFkZC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGFkZChfYWRkZW5kOiBWZWN0b3IyKTogdm9pZCB7XHJcbiAgICAgIHRoaXMuZGF0YSA9IG5ldyBWZWN0b3IyKF9hZGRlbmQueCArIHRoaXMueCwgX2FkZGVuZC55ICsgdGhpcy55KS5kYXRhO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3VidHJhY3RzIHRoZSBnaXZlbiB2ZWN0b3IgZnJvbSB0aGUgZXhlY3V0aW5nIHZlY3RvciwgY2hhbmdpbmcgdGhlIGV4ZWN1dG9yLlxyXG4gICAgICogQHBhcmFtIF9zdWJ0cmFoZW5kIFRoZSB2ZWN0b3IgdG8gc3VidHJhY3QuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdWJ0cmFjdChfc3VidHJhaGVuZDogVmVjdG9yMik6IHZvaWQge1xyXG4gICAgICB0aGlzLmRhdGEgPSBuZXcgVmVjdG9yMih0aGlzLnggLSBfc3VidHJhaGVuZC54LCB0aGlzLnkgLSBfc3VidHJhaGVuZC55KS5kYXRhO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2NhbGVzIHRoZSBWZWN0b3IgYnkgdGhlIF9zY2FsZS5cclxuICAgICAqIEBwYXJhbSBfc2NhbGUgVGhlIHNjYWxlIHRvIG11bHRpcGx5IHRoZSB2ZWN0b3Igd2l0aC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHNjYWxlKF9zY2FsZTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgIHRoaXMuZGF0YSA9IG5ldyBWZWN0b3IyKF9zY2FsZSAqIHRoaXMueCwgX3NjYWxlICogdGhpcy55KS5kYXRhO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTm9ybWFsaXplcyB0aGUgdmVjdG9yLlxyXG4gICAgICogQHBhcmFtIF9sZW5ndGggQSBtb2RpZmljYXRvciB0byBnZXQgYSBkaWZmZXJlbnQgbGVuZ3RoIG9mIG5vcm1hbGl6ZWQgdmVjdG9yLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgbm9ybWFsaXplKF9sZW5ndGg6IG51bWJlciA9IDEpOiB2b2lkIHtcclxuICAgICAgdGhpcy5kYXRhID0gVmVjdG9yMi5OT1JNQUxJWkFUSU9OKHRoaXMsIF9sZW5ndGgpLmRhdGE7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSBWZWN0b3IgdG8gdGhlIGdpdmVuIHBhcmFtZXRlcnMuIE9tbWl0dGVkIHBhcmFtZXRlcnMgZGVmYXVsdCB0byAwLlxyXG4gICAgICogQHBhcmFtIF94IG5ldyB4IHRvIHNldFxyXG4gICAgICogQHBhcmFtIF95IG5ldyB5IHRvIHNldFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2V0KF94OiBudW1iZXIgPSAwLCBfeTogbnVtYmVyID0gMCk6IHZvaWQge1xyXG4gICAgICB0aGlzLmRhdGEgPSBuZXcgRmxvYXQzMkFycmF5KFtfeCwgX3ldKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrcyB3aGV0aGVyIHRoZSBnaXZlbiBWZWN0b3IgaXMgZXF1YWwgdG8gdGhlIGV4ZWN1dGVkIFZlY3Rvci5cclxuICAgICAqIEBwYXJhbSBfdmVjdG9yIFRoZSB2ZWN0b3IgdG8gY29tYXByZSB3aXRoLlxyXG4gICAgICogQHJldHVybnMgdHJ1ZSBpZiB0aGUgdHdvIHZlY3RvcnMgYXJlIGVxdWFsLCBvdGhlcndpc2UgZmFsc2VcclxuICAgICAqL1xyXG4gICAgcHVibGljIGVxdWFscyhfdmVjdG9yOiBWZWN0b3IyKTogYm9vbGVhbiB7XHJcbiAgICAgIGlmICh0aGlzLmRhdGFbMF0gPT0gX3ZlY3Rvci5kYXRhWzBdICYmIHRoaXMuZGF0YVsxXSA9PSBfdmVjdG9yLmRhdGFbMV0pIHJldHVybiB0cnVlO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJucyBBbiBhcnJheSBvZiB0aGUgZGF0YSBvZiB0aGUgdmVjdG9yXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQoKTogRmxvYXQzMkFycmF5IHtcclxuICAgICAgcmV0dXJuIG5ldyBGbG9hdDMyQXJyYXkodGhpcy5kYXRhKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm5zIEEgZGVlcCBjb3B5IG9mIHRoZSB2ZWN0b3IuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgY29weSgpOiBWZWN0b3IyIHtcclxuICAgICAgcmV0dXJuIG5ldyBWZWN0b3IyKHRoaXMueCwgdGhpcy55KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgYSB6LWNvbXBvbmVudCB0byB0aGUgdmVjdG9yIGFuZCByZXR1cm5zIGEgbmV3IFZlY3RvcjNcclxuICAgICAqL1xyXG4gICAgcHVibGljIHRvVmVjdG9yMygpOiBWZWN0b3IzIHtcclxuICAgICAgcmV0dXJuIG5ldyBWZWN0b3IzKHRoaXMueCwgdGhpcy55LCAwKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0TXV0YXRvcigpOiBNdXRhdG9yIHtcclxuICAgICAgbGV0IG11dGF0b3I6IE11dGF0b3IgPSB7XHJcbiAgICAgICAgeDogdGhpcy5kYXRhWzBdLCB5OiB0aGlzLmRhdGFbMV1cclxuICAgICAgfTtcclxuICAgICAgcmV0dXJuIG11dGF0b3I7XHJcbiAgICB9XHJcbiAgICBwcm90ZWN0ZWQgcmVkdWNlTXV0YXRvcihfbXV0YXRvcjogTXV0YXRvcik6IHZvaWQgey8qKiAqLyB9XHJcbiAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIFN0b3JlcyBhbmQgbWFuaXB1bGF0ZXMgYSB0aHJlZWRpbWVuc2lvbmFsIHZlY3RvciBjb21wcmlzZWQgb2YgdGhlIGNvbXBvbmVudHMgeCwgeSBhbmQgelxyXG4gICAgICogYGBgcGxhaW50ZXh0XHJcbiAgICAgKiAgICAgICAgICAgICt5XHJcbiAgICAgKiAgICAgICAgICAgICB8X18gK3hcclxuICAgICAqICAgICAgICAgICAgL1xyXG4gICAgICogICAgICAgICAgK3ogICBcclxuICAgICAqIGBgYFxyXG4gICAgICogQGF1dGhvcnMgSmFzY2hhIEthcmFnw7ZsLCBIRlUsIDIwMTkgfCBKaXJrYSBEZWxsJ09yby1GcmllZGwsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgVmVjdG9yMyBleHRlbmRzIE11dGFibGUge1xyXG4gICAgICAgIHByaXZhdGUgZGF0YTogRmxvYXQzMkFycmF5OyAvLyBUT0RPOiBjaGVjayB3aHkgdGhpcyBzaG91bGRuJ3QgYmUgeCx5LHogYXMgbnVtYmVycy4uLlxyXG5cclxuICAgICAgICBwdWJsaWMgY29uc3RydWN0b3IoX3g6IG51bWJlciA9IDAsIF95OiBudW1iZXIgPSAwLCBfejogbnVtYmVyID0gMCkge1xyXG4gICAgICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBuZXcgRmxvYXQzMkFycmF5KFtfeCwgX3ksIF96XSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBUT0RPOiBpbXBsZW1lbnQgZXF1YWxzLWZ1bmN0aW9uc1xyXG4gICAgICAgIGdldCB4KCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGFbMF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGdldCB5KCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGFbMV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGdldCB6KCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGFbMl07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzZXQgeChfeDogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSA9IF94O1xyXG4gICAgICAgIH1cclxuICAgICAgICBzZXQgeShfeTogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxXSA9IF95O1xyXG4gICAgICAgIH1cclxuICAgICAgICBzZXQgeihfejogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsyXSA9IF96O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBYKF9zY2FsZTogbnVtYmVyID0gMSk6IFZlY3RvcjMge1xyXG4gICAgICAgICAgICBjb25zdCB2ZWN0b3I6IFZlY3RvcjMgPSBuZXcgVmVjdG9yMyhfc2NhbGUsIDAsIDApO1xyXG4gICAgICAgICAgICByZXR1cm4gdmVjdG9yO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBZKF9zY2FsZTogbnVtYmVyID0gMSk6IFZlY3RvcjMge1xyXG4gICAgICAgICAgICBjb25zdCB2ZWN0b3I6IFZlY3RvcjMgPSBuZXcgVmVjdG9yMygwLCBfc2NhbGUsIDApO1xyXG4gICAgICAgICAgICByZXR1cm4gdmVjdG9yO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBaKF9zY2FsZTogbnVtYmVyID0gMSk6IFZlY3RvcjMge1xyXG4gICAgICAgICAgICBjb25zdCB2ZWN0b3I6IFZlY3RvcjMgPSBuZXcgVmVjdG9yMygwLCAwLCBfc2NhbGUpO1xyXG4gICAgICAgICAgICByZXR1cm4gdmVjdG9yO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBaRVJPKCk6IFZlY3RvcjMge1xyXG4gICAgICAgICAgICBjb25zdCB2ZWN0b3I6IFZlY3RvcjMgPSBuZXcgVmVjdG9yMygwLCAwLCAwKTtcclxuICAgICAgICAgICAgcmV0dXJuIHZlY3RvcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgT05FKF9zY2FsZTogbnVtYmVyID0gMSk6IFZlY3RvcjMge1xyXG4gICAgICAgICAgICBjb25zdCB2ZWN0b3I6IFZlY3RvcjMgPSBuZXcgVmVjdG9yMyhfc2NhbGUsIF9zY2FsZSwgX3NjYWxlKTtcclxuICAgICAgICAgICAgcmV0dXJuIHZlY3RvcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgVFJBTlNGT1JNQVRJT04oX3ZlY3RvcjogVmVjdG9yMywgX21hdHJpeDogTWF0cml4NHg0LCBfaW5jbHVkZVRyYW5zbGF0aW9uOiBib29sZWFuID0gdHJ1ZSk6IFZlY3RvcjMge1xyXG4gICAgICAgICAgICBsZXQgcmVzdWx0OiBWZWN0b3IzID0gbmV3IFZlY3RvcjMoKTtcclxuICAgICAgICAgICAgbGV0IG06IEZsb2F0MzJBcnJheSA9IF9tYXRyaXguZ2V0KCk7XHJcbiAgICAgICAgICAgIGxldCBbeCwgeSwgel0gPSBfdmVjdG9yLmdldCgpO1xyXG4gICAgICAgICAgICByZXN1bHQueCA9IG1bMF0gKiB4ICsgbVs0XSAqIHkgKyBtWzhdICogejtcclxuICAgICAgICAgICAgcmVzdWx0LnkgPSBtWzFdICogeCArIG1bNV0gKiB5ICsgbVs5XSAqIHo7XHJcbiAgICAgICAgICAgIHJlc3VsdC56ID0gbVsyXSAqIHggKyBtWzZdICogeSArIG1bMTBdICogejtcclxuXHJcbiAgICAgICAgICAgIGlmIChfaW5jbHVkZVRyYW5zbGF0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQuYWRkKF9tYXRyaXgudHJhbnNsYXRpb24pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgTk9STUFMSVpBVElPTihfdmVjdG9yOiBWZWN0b3IzLCBfbGVuZ3RoOiBudW1iZXIgPSAxKTogVmVjdG9yMyB7XHJcbiAgICAgICAgICAgIGxldCB2ZWN0b3I6IFZlY3RvcjMgPSBWZWN0b3IzLlpFUk8oKTtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGxldCBbeCwgeSwgel0gPSBfdmVjdG9yLmRhdGE7XHJcbiAgICAgICAgICAgICAgICBsZXQgZmFjdG9yOiBudW1iZXIgPSBfbGVuZ3RoIC8gTWF0aC5oeXBvdCh4LCB5LCB6KTtcclxuICAgICAgICAgICAgICAgIHZlY3Rvci5kYXRhID0gbmV3IEZsb2F0MzJBcnJheShbX3ZlY3Rvci54ICogZmFjdG9yLCBfdmVjdG9yLnkgKiBmYWN0b3IsIF92ZWN0b3IueiAqIGZhY3Rvcl0pO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChfZSkge1xyXG4gICAgICAgICAgICAgICAgRGVidWcud2FybihfZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHZlY3RvcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFN1bXMgdXAgbXVsdGlwbGUgdmVjdG9ycy5cclxuICAgICAgICAgKiBAcGFyYW0gX3ZlY3RvcnMgQSBzZXJpZXMgb2YgdmVjdG9ycyB0byBzdW0gdXBcclxuICAgICAgICAgKiBAcmV0dXJucyBBIG5ldyB2ZWN0b3IgcmVwcmVzZW50aW5nIHRoZSBzdW0gb2YgdGhlIGdpdmVuIHZlY3RvcnNcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIFNVTSguLi5fdmVjdG9yczogVmVjdG9yM1tdKTogVmVjdG9yMyB7XHJcbiAgICAgICAgICAgIGxldCByZXN1bHQ6IFZlY3RvcjMgPSBuZXcgVmVjdG9yMygpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCB2ZWN0b3Igb2YgX3ZlY3RvcnMpXHJcbiAgICAgICAgICAgICAgICByZXN1bHQuZGF0YSA9IG5ldyBGbG9hdDMyQXJyYXkoW3Jlc3VsdC54ICsgdmVjdG9yLngsIHJlc3VsdC55ICsgdmVjdG9yLnksIHJlc3VsdC56ICsgdmVjdG9yLnpdKTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU3VidHJhY3RzIHR3byB2ZWN0b3JzLlxyXG4gICAgICAgICAqIEBwYXJhbSBfYSBUaGUgdmVjdG9yIHRvIHN1YnRyYWN0IGZyb20uXHJcbiAgICAgICAgICogQHBhcmFtIF9iIFRoZSB2ZWN0b3IgdG8gc3VidHJhY3QuXHJcbiAgICAgICAgICogQHJldHVybnMgQSBuZXcgdmVjdG9yIHJlcHJlc2VudGluZyB0aGUgZGlmZmVyZW5jZSBvZiB0aGUgZ2l2ZW4gdmVjdG9yc1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgRElGRkVSRU5DRShfYTogVmVjdG9yMywgX2I6IFZlY3RvcjMpOiBWZWN0b3IzIHtcclxuICAgICAgICAgICAgbGV0IHZlY3RvcjogVmVjdG9yMyA9IG5ldyBWZWN0b3IzO1xyXG4gICAgICAgICAgICB2ZWN0b3IuZGF0YSA9IG5ldyBGbG9hdDMyQXJyYXkoW19hLnggLSBfYi54LCBfYS55IC0gX2IueSwgX2EueiAtIF9iLnpdKTtcclxuICAgICAgICAgICAgcmV0dXJuIHZlY3RvcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyBhIG5ldyB2ZWN0b3IgcmVwcmVzZW50aW5nIHRoZSBnaXZlbiB2ZWN0b3Igc2NhbGVkIGJ5IHRoZSBnaXZlbiBzY2FsaW5nIGZhY3RvclxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgU0NBTEUoX3ZlY3RvcjogVmVjdG9yMywgX3NjYWxpbmc6IG51bWJlcik6IFZlY3RvcjMge1xyXG4gICAgICAgICAgICBsZXQgc2NhbGVkOiBWZWN0b3IzID0gbmV3IFZlY3RvcjMoKTtcclxuICAgICAgICAgICAgc2NhbGVkLmRhdGEgPSBuZXcgRmxvYXQzMkFycmF5KFtfdmVjdG9yLnggKiBfc2NhbGluZywgX3ZlY3Rvci55ICogX3NjYWxpbmcsIF92ZWN0b3IueiAqIF9zY2FsaW5nXSk7XHJcbiAgICAgICAgICAgIHJldHVybiBzY2FsZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENvbXB1dGVzIHRoZSBjcm9zc3Byb2R1Y3Qgb2YgMiB2ZWN0b3JzLlxyXG4gICAgICAgICAqIEBwYXJhbSBfYSBUaGUgdmVjdG9yIHRvIG11bHRpcGx5LlxyXG4gICAgICAgICAqIEBwYXJhbSBfYiBUaGUgdmVjdG9yIHRvIG11bHRpcGx5IGJ5LlxyXG4gICAgICAgICAqIEByZXR1cm5zIEEgbmV3IHZlY3RvciByZXByZXNlbnRpbmcgdGhlIGNyb3NzcHJvZHVjdCBvZiB0aGUgZ2l2ZW4gdmVjdG9yc1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgQ1JPU1MoX2E6IFZlY3RvcjMsIF9iOiBWZWN0b3IzKTogVmVjdG9yMyB7XHJcbiAgICAgICAgICAgIGxldCB2ZWN0b3I6IFZlY3RvcjMgPSBuZXcgVmVjdG9yMztcclxuICAgICAgICAgICAgdmVjdG9yLmRhdGEgPSBuZXcgRmxvYXQzMkFycmF5KFtcclxuICAgICAgICAgICAgICAgIF9hLnkgKiBfYi56IC0gX2EueiAqIF9iLnksXHJcbiAgICAgICAgICAgICAgICBfYS56ICogX2IueCAtIF9hLnggKiBfYi56LFxyXG4gICAgICAgICAgICAgICAgX2EueCAqIF9iLnkgLSBfYS55ICogX2IueF0pO1xyXG4gICAgICAgICAgICByZXR1cm4gdmVjdG9yO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDb21wdXRlcyB0aGUgZG90cHJvZHVjdCBvZiAyIHZlY3RvcnMuXHJcbiAgICAgICAgICogQHBhcmFtIF9hIFRoZSB2ZWN0b3IgdG8gbXVsdGlwbHkuXHJcbiAgICAgICAgICogQHBhcmFtIF9iIFRoZSB2ZWN0b3IgdG8gbXVsdGlwbHkgYnkuXHJcbiAgICAgICAgICogQHJldHVybnMgQSBuZXcgdmVjdG9yIHJlcHJlc2VudGluZyB0aGUgZG90cHJvZHVjdCBvZiB0aGUgZ2l2ZW4gdmVjdG9yc1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgRE9UKF9hOiBWZWN0b3IzLCBfYjogVmVjdG9yMyk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIGxldCBzY2FsYXJQcm9kdWN0OiBudW1iZXIgPSBfYS54ICogX2IueCArIF9hLnkgKiBfYi55ICsgX2EueiAqIF9iLno7XHJcbiAgICAgICAgICAgIHJldHVybiBzY2FsYXJQcm9kdWN0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ2FsY3VsYXRlcyBhbmQgcmV0dXJucyB0aGUgcmVmbGVjdGlvbiBvZiB0aGUgaW5jb21pbmcgdmVjdG9yIGF0IHRoZSBnaXZlbiBub3JtYWwgdmVjdG9yLiBUaGUgbGVuZ3RoIG9mIG5vcm1hbCBzaG91bGQgYmUgMS5cclxuICAgICAgICAgKiAgICAgX19fX19fX19fX19fX19fX19fXHJcbiAgICAgICAgICogICAgICAgICAgIC98XFxcclxuICAgICAgICAgKiBpbmNvbWluZyAvIHwgXFwgcmVmbGVjdGlvblxyXG4gICAgICAgICAqICAgICAgICAgLyAgfCAgXFwgICBcclxuICAgICAgICAgKiAgICAgICAgICBub3JtYWxcclxuICAgICAgICAgKiBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIFJFRkxFQ1RJT04oX2luY29taW5nOiBWZWN0b3IzLCBfbm9ybWFsOiBWZWN0b3IzKTogVmVjdG9yMyB7XHJcbiAgICAgICAgICAgIGxldCBkb3Q6IG51bWJlciA9IC1WZWN0b3IzLkRPVChfaW5jb21pbmcsIF9ub3JtYWwpO1xyXG4gICAgICAgICAgICBsZXQgcmVmbGVjdGlvbjogVmVjdG9yMyA9IFZlY3RvcjMuU1VNKF9pbmNvbWluZywgVmVjdG9yMy5TQ0FMRShfbm9ybWFsLCAyICogZG90KSk7XHJcbiAgICAgICAgICAgIHJldHVybiByZWZsZWN0aW9uO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGFkZChfYWRkZW5kOiBWZWN0b3IzKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IG5ldyBWZWN0b3IzKF9hZGRlbmQueCArIHRoaXMueCwgX2FkZGVuZC55ICsgdGhpcy55LCBfYWRkZW5kLnogKyB0aGlzLnopLmRhdGE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHB1YmxpYyBzdWJ0cmFjdChfc3VidHJhaGVuZDogVmVjdG9yMyk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBuZXcgVmVjdG9yMyh0aGlzLnggLSBfc3VidHJhaGVuZC54LCB0aGlzLnkgLSBfc3VidHJhaGVuZC55LCB0aGlzLnogLSBfc3VidHJhaGVuZC56KS5kYXRhO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwdWJsaWMgc2NhbGUoX3NjYWxlOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5kYXRhID0gbmV3IFZlY3RvcjMoX3NjYWxlICogdGhpcy54LCBfc2NhbGUgKiB0aGlzLnksIF9zY2FsZSAqIHRoaXMueikuZGF0YTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBub3JtYWxpemUoX2xlbmd0aDogbnVtYmVyID0gMSk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBWZWN0b3IzLk5PUk1BTElaQVRJT04odGhpcywgX2xlbmd0aCkuZGF0YTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzZXQoX3g6IG51bWJlciA9IDAsIF95OiBudW1iZXIgPSAwLCBfejogbnVtYmVyID0gMCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBuZXcgRmxvYXQzMkFycmF5KFtfeCwgX3ksIF96XSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0KCk6IEZsb2F0MzJBcnJheSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgRmxvYXQzMkFycmF5KHRoaXMuZGF0YSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0IGNvcHkoKTogVmVjdG9yMyB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVmVjdG9yMyh0aGlzLngsIHRoaXMueSwgdGhpcy56KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB0cmFuc2Zvcm0oX21hdHJpeDogTWF0cml4NHg0LCBfaW5jbHVkZVRyYW5zbGF0aW9uOiBib29sZWFuID0gdHJ1ZSk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBWZWN0b3IzLlRSQU5TRk9STUFUSU9OKHRoaXMsIF9tYXRyaXgsIF9pbmNsdWRlVHJhbnNsYXRpb24pLmRhdGE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEcm9wcyB0aGUgei1jb21wb25lbnQgYW5kIHJldHVybnMgYSBWZWN0b3IyIGNvbnNpc3Rpbmcgb2YgdGhlIHgtIGFuZCB5LWNvbXBvbmVudHNcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgdG9WZWN0b3IyKCk6IFZlY3RvcjIge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFZlY3RvcjIodGhpcy54LCB0aGlzLnkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHJlZmxlY3QoX25vcm1hbDogVmVjdG9yMyk6IHZvaWQge1xyXG4gICAgICAgICAgICBjb25zdCByZWZsZWN0ZWQ6IFZlY3RvcjMgPSBWZWN0b3IzLlJFRkxFQ1RJT04odGhpcywgX25vcm1hbCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0KHJlZmxlY3RlZC54LCByZWZsZWN0ZWQueSwgcmVmbGVjdGVkLnopO1xyXG4gICAgICAgICAgICBSZWN5Y2xlci5zdG9yZShyZWZsZWN0ZWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldE11dGF0b3IoKTogTXV0YXRvciB7XHJcbiAgICAgICAgICAgIGxldCBtdXRhdG9yOiBNdXRhdG9yID0ge1xyXG4gICAgICAgICAgICAgICAgeDogdGhpcy5kYXRhWzBdLCB5OiB0aGlzLmRhdGFbMV0sIHo6IHRoaXMuZGF0YVsyXVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICByZXR1cm4gbXV0YXRvcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHJvdGVjdGVkIHJlZHVjZU11dGF0b3IoX211dGF0b3I6IE11dGF0b3IpOiB2b2lkIHsvKiogKi8gfVxyXG4gICAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIEFic3RyYWN0IGJhc2UgY2xhc3MgZm9yIGFsbCBtZXNoZXMuIFxyXG4gICAgICogTWVzaGVzIHByb3ZpZGUgaW5kZXhlZCB2ZXJ0aWNlcywgdGhlIG9yZGVyIG9mIGluZGljZXMgdG8gY3JlYXRlIHRyaWdvbnMgYW5kIG5vcm1hbHMsIGFuZCB0ZXh0dXJlIGNvb3JkaW5hdGVzXHJcbiAgICAgKiBcclxuICAgICAqIEBhdXRob3JzIEppcmthIERlbGwnT3JvLUZyaWVkbCwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBhYnN0cmFjdCBjbGFzcyBNZXNoIGltcGxlbWVudHMgU2VyaWFsaXphYmxlUmVzb3VyY2Uge1xyXG4gICAgICAgIC8vIFRPRE86IGNoZWNrIGlmIHRoZXNlIGFycmF5cyBtdXN0IGJlIGNhY2hlZCBsaWtlIHRoaXMgb3IgaWYgY2FsbGluZyB0aGUgbWV0aG9kcyBpcyBiZXR0ZXIuXHJcbiAgICAgICAgcHVibGljIHZlcnRpY2VzOiBGbG9hdDMyQXJyYXk7XHJcbiAgICAgICAgcHVibGljIGluZGljZXM6IFVpbnQxNkFycmF5O1xyXG4gICAgICAgIHB1YmxpYyB0ZXh0dXJlVVZzOiBGbG9hdDMyQXJyYXk7XHJcbiAgICAgICAgcHVibGljIG5vcm1hbHNGYWNlOiBGbG9hdDMyQXJyYXk7XHJcblxyXG4gICAgICAgIHB1YmxpYyBpZFJlc291cmNlOiBzdHJpbmcgPSB1bmRlZmluZWQ7XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0QnVmZmVyU3BlY2lmaWNhdGlvbigpOiBCdWZmZXJTcGVjaWZpY2F0aW9uIHtcclxuICAgICAgICAgICAgcmV0dXJuIHsgc2l6ZTogMywgZGF0YVR5cGU6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuRkxPQVQsIG5vcm1hbGl6ZTogZmFsc2UsIHN0cmlkZTogMCwgb2Zmc2V0OiAwIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHB1YmxpYyBnZXRWZXJ0ZXhDb3VudCgpOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy52ZXJ0aWNlcy5sZW5ndGggLyBNZXNoLmdldEJ1ZmZlclNwZWNpZmljYXRpb24oKS5zaXplO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwdWJsaWMgZ2V0SW5kZXhDb3VudCgpOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pbmRpY2VzLmxlbmd0aDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFNlcmlhbGl6ZS9EZXNlcmlhbGl6ZSBmb3IgYWxsIG1lc2hlcyB0aGF0IGNhbGN1bGF0ZSB3aXRob3V0IHBhcmFtZXRlcnNcclxuICAgICAgICBwdWJsaWMgc2VyaWFsaXplKCk6IFNlcmlhbGl6YXRpb24ge1xyXG4gICAgICAgICAgICBsZXQgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IHtcclxuICAgICAgICAgICAgICAgIGlkUmVzb3VyY2U6IHRoaXMuaWRSZXNvdXJjZVxyXG4gICAgICAgICAgICB9OyAvLyBubyBkYXRhIG5lZWRlZCAuLi5cclxuICAgICAgICAgICAgcmV0dXJuIHNlcmlhbGl6YXRpb247XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHB1YmxpYyBkZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbik6IFNlcmlhbGl6YWJsZSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlKCk7IC8vIFRPRE86IG11c3Qgbm90IGJlIGNyZWF0ZWQsIGlmIGFuIGlkZW50aWNhbCBtZXNoIGFscmVhZHkgZXhpc3RzXHJcbiAgICAgICAgICAgIHRoaXMuaWRSZXNvdXJjZSA9IF9zZXJpYWxpemF0aW9uLmlkUmVzb3VyY2U7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGFic3RyYWN0IGNyZWF0ZSgpOiB2b2lkO1xyXG4gICAgICAgIHByb3RlY3RlZCBhYnN0cmFjdCBjcmVhdGVWZXJ0aWNlcygpOiBGbG9hdDMyQXJyYXk7XHJcbiAgICAgICAgcHJvdGVjdGVkIGFic3RyYWN0IGNyZWF0ZVRleHR1cmVVVnMoKTogRmxvYXQzMkFycmF5O1xyXG4gICAgICAgIHByb3RlY3RlZCBhYnN0cmFjdCBjcmVhdGVJbmRpY2VzKCk6IFVpbnQxNkFycmF5O1xyXG4gICAgICAgIHByb3RlY3RlZCBhYnN0cmFjdCBjcmVhdGVGYWNlTm9ybWFscygpOiBGbG9hdDMyQXJyYXk7XHJcbiAgICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogR2VuZXJhdGUgYSBzaW1wbGUgY3ViZSB3aXRoIGVkZ2VzIG9mIGxlbmd0aCAxLCBlYWNoIGZhY2UgY29uc2lzdGluZyBvZiB0d28gdHJpZ29uc1xyXG4gICAgICogYGBgcGxhaW50ZXh0XHJcbiAgICAgKiAgICAgICAgICAgIDRfX19fN1xyXG4gICAgICogICAgICAgICAgIDAvX18zL3xcclxuICAgICAqICAgICAgICAgICAgfHw1X3x8NlxyXG4gICAgICogICAgICAgICAgIDF8L18yfC8gXHJcbiAgICAgKiBgYGBcclxuICAgICAqIEBhdXRob3JzIEppcmthIERlbGwnT3JvLUZyaWVkbCwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBNZXNoQ3ViZSBleHRlbmRzIE1lc2gge1xyXG4gICAgICAgIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBjcmVhdGUoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMudmVydGljZXMgPSB0aGlzLmNyZWF0ZVZlcnRpY2VzKCk7XHJcbiAgICAgICAgICAgIHRoaXMuaW5kaWNlcyA9IHRoaXMuY3JlYXRlSW5kaWNlcygpO1xyXG4gICAgICAgICAgICB0aGlzLnRleHR1cmVVVnMgPSB0aGlzLmNyZWF0ZVRleHR1cmVVVnMoKTtcclxuICAgICAgICAgICAgdGhpcy5ub3JtYWxzRmFjZSA9IHRoaXMuY3JlYXRlRmFjZU5vcm1hbHMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByb3RlY3RlZCBjcmVhdGVWZXJ0aWNlcygpOiBGbG9hdDMyQXJyYXkge1xyXG4gICAgICAgICAgICBsZXQgdmVydGljZXM6IEZsb2F0MzJBcnJheSA9IG5ldyBGbG9hdDMyQXJyYXkoW1xyXG4gICAgICAgICAgICAgICAgLy8gRmlyc3Qgd3JhcFxyXG4gICAgICAgICAgICAgICAgLy8gZnJvbnRcclxuICAgICAgICAgICAgICAgIC8qMCovIC0xLCAxLCAxLCAvKjEqLyAtMSwgLTEsIDEsICAvKjIqLyAxLCAtMSwgMSwgLyozKi8gMSwgMSwgMSxcclxuICAgICAgICAgICAgICAgIC8vIGJhY2tcclxuICAgICAgICAgICAgICAgIC8qNCovIC0xLCAxLCAtMSwgLyogNSovIC0xLCAtMSwgLTEsICAvKiA2Ki8gMSwgLTEsIC0xLCAvKiA3Ki8gMSwgMSwgLTEsXHJcbiAgICAgICAgICAgICAgICAvLyBTZWNvbmQgd3JhcFxyXG4gICAgICAgICAgICAgICAgLy8gZnJvbnRcclxuICAgICAgICAgICAgICAgIC8qMCovIC0xLCAxLCAxLCAvKjEqLyAtMSwgLTEsIDEsICAvKjIqLyAxLCAtMSwgMSwgLyozKi8gMSwgMSwgMSxcclxuICAgICAgICAgICAgICAgIC8vIGJhY2tcclxuICAgICAgICAgICAgICAgIC8qNCovIC0xLCAxLCAtMSwgLyogNSovIC0xLCAtMSwgLTEsICAvKiA2Ki8gMSwgLTEsIC0xLCAvKiA3Ki8gMSwgMSwgLTFcclxuICAgICAgICAgICAgXSk7XHJcblxyXG4gICAgICAgICAgICAvLyBzY2FsZSBkb3duIHRvIGEgbGVuZ3RoIG9mIDEgZm9yIGFsbCBlZGdlc1xyXG4gICAgICAgICAgICB2ZXJ0aWNlcyA9IHZlcnRpY2VzLm1hcChfdmFsdWUgPT4gX3ZhbHVlIC8gMik7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdmVydGljZXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcm90ZWN0ZWQgY3JlYXRlSW5kaWNlcygpOiBVaW50MTZBcnJheSB7XHJcbiAgICAgICAgICAgIGxldCBpbmRpY2VzOiBVaW50MTZBcnJheSA9IG5ldyBVaW50MTZBcnJheShbXHJcbiAgICAgICAgICAgICAgICAvLyBGaXJzdCB3cmFwXHJcbiAgICAgICAgICAgICAgICAvLyBmcm9udFxyXG4gICAgICAgICAgICAgICAgMSwgMiwgMCwgMiwgMywgMCwgXHJcbiAgICAgICAgICAgICAgICAvLyByaWdodFxyXG4gICAgICAgICAgICAgICAgMiwgNiwgMywgNiwgNywgMyxcclxuICAgICAgICAgICAgICAgIC8vIGJhY2tcclxuICAgICAgICAgICAgICAgIDYsIDUsIDcsIDUsIDQsIDcsXHJcblxyXG4gICAgICAgICAgICAgICAgLy8gU2Vjb25kIHdyYXBcclxuICAgICAgICAgICAgICAgIC8vIGxlZnRcclxuICAgICAgICAgICAgICAgIDUgKyA4LCAxICsgOCwgNCArIDgsIDEgKyA4LCAwICsgOCwgNCArIDgsXHJcbiAgICAgICAgICAgICAgICAvLyB0b3BcclxuICAgICAgICAgICAgICAgIDQgKyA4LCAwICsgOCwgMyArIDgsIDcgKyA4LCA0ICsgOCwgMyArIDgsXHJcbiAgICAgICAgICAgICAgICAvLyBib3R0b21cclxuICAgICAgICAgICAgICAgIDUgKyA4LCA2ICsgOCwgMSArIDgsIDYgKyA4LCAyICsgOCwgMSArIDhcclxuXHJcbiAgICAgICAgICAgICAgICAvKixcclxuICAgICAgICAgICAgICAgIC8vIGxlZnRcclxuICAgICAgICAgICAgICAgIDQsIDUsIDEsIDQsIDEsIDAsXHJcbiAgICAgICAgICAgICAgICAvLyB0b3BcclxuICAgICAgICAgICAgICAgIDQsIDAsIDMsIDQsIDMsIDcsXHJcbiAgICAgICAgICAgICAgICAvLyBib3R0b21cclxuICAgICAgICAgICAgICAgIDEsIDUsIDYsIDEsIDYsIDJcclxuICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIF0pO1xyXG4gICAgICAgICAgICByZXR1cm4gaW5kaWNlcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByb3RlY3RlZCBjcmVhdGVUZXh0dXJlVVZzKCk6IEZsb2F0MzJBcnJheSB7XHJcbiAgICAgICAgICAgIGxldCB0ZXh0dXJlVVZzOiBGbG9hdDMyQXJyYXkgPSBuZXcgRmxvYXQzMkFycmF5KFtcclxuICAgICAgICAgICAgICAgIC8vIEZpcnN0IHdyYXBcclxuICAgICAgICAgICAgICAgIC8vIGZyb250XHJcbiAgICAgICAgICAgICAgICAvKjAqLyAwLCAwLCAvKjEqLyAwLCAxLCAgLyoyKi8gMSwgMSwgLyozKi8gMSwgMCxcclxuICAgICAgICAgICAgICAgIC8vIGJhY2tcclxuICAgICAgICAgICAgICAgIC8qNCovIDMsIDAsIC8qNSovIDMsIDEsICAvKjYqLyAyLCAxLCAvKjcqLyAyLCAwLFxyXG5cclxuICAgICAgICAgICAgICAgIC8vIFNlY29uZCB3cmFwXHJcbiAgICAgICAgICAgICAgICAvLyBmcm9udFxyXG4gICAgICAgICAgICAgICAgLyowKi8gMSwgMCwgLyoxKi8gMSwgMSwgIC8qMiovIDEsIDIsIC8qMyovIDEsIC0xLFxyXG4gICAgICAgICAgICAgICAgLy8gYmFja1xyXG4gICAgICAgICAgICAgICAgLyo0Ki8gMCwgMCwgLyo1Ki8gMCwgMSwgIC8qNiovIDAsIDIsIC8qNyovIDAsIC0xXHJcbiAgICAgICAgICAgIF0pO1xyXG4gICAgICAgICAgICByZXR1cm4gdGV4dHVyZVVWcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByb3RlY3RlZCBjcmVhdGVGYWNlTm9ybWFscygpOiBGbG9hdDMyQXJyYXkge1xyXG4gICAgICAgICAgICBsZXQgbm9ybWFsczogRmxvYXQzMkFycmF5ID0gbmV3IEZsb2F0MzJBcnJheShbXHJcbiAgICAgICAgICAgICAgICAvLyBmb3IgZWFjaCB0cmlhbmdsZSwgdGhlIGxhc3QgdmVydGV4IG9mIHRoZSB0aHJlZSBkZWZpbmluZyByZWZlcnMgdG8gdGhlIG5vcm1hbHZlY3RvciB3aGVuIHVzaW5nIGZsYXQgc2hhZGluZ1xyXG4gICAgICAgICAgICAgICAgLy8gRmlyc3Qgd3JhcFxyXG4gICAgICAgICAgICAgICAgLy8gZnJvbnRcclxuICAgICAgICAgICAgICAgIC8qMCovIDAsIDAsIDEsIC8qMSovIDAsIDAsIDAsIC8qMiovIDAsIDAsIDAsIC8qMyovIDEsIDAsIDAsXHJcbiAgICAgICAgICAgICAgICAvLyBiYWNrXHJcbiAgICAgICAgICAgICAgICAvKjQqLyAwLCAwLCAwLCAvKjUqLyAwLCAwLCAwLCAvKjYqLyAwLCAwLCAwLCAvKjcqLyAwLCAwLCAtMSxcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBTZWNvbmQgd3JhcFxyXG4gICAgICAgICAgICAgICAgLy8gZnJvbnRcclxuICAgICAgICAgICAgICAgIC8qMCovIDAsIDAsIDAsIC8qMSovIDAsIC0xLCAwLCAvKjIqLyAwLCAwLCAwLCAvKjMqLyAwLCAxLCAwLFxyXG4gICAgICAgICAgICAgICAgLy8gYmFja1xyXG4gICAgICAgICAgICAgICAgLyo0Ki8gLTEsIDAsIDAsIC8qNSovIDAsIDAsIDAsIC8qNiovIDAsIDAsIDAsIC8qNyovIDAsIDAsIDBcclxuICAgICAgICAgICAgXSk7XHJcblxyXG4gICAgICAgICAgICAvL25vcm1hbHMgPSB0aGlzLmNyZWF0ZVZlcnRpY2VzKCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbm9ybWFscztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogR2VuZXJhdGUgYSBzaW1wbGUgcHlyYW1pZCB3aXRoIGVkZ2VzIGF0IHRoZSBiYXNlIG9mIGxlbmd0aCAxIGFuZCBhIGhlaWdodCBvZiAxLiBUaGUgc2lkZXMgY29uc2lzdGluZyBvZiBvbmUsIHRoZSBiYXNlIG9mIHR3byB0cmlnb25zXHJcbiAgICAgKiBgYGBwbGFpbnRleHRcclxuICAgICAqICAgICAgICAgICAgICAgNFxyXG4gICAgICogICAgICAgICAgICAgIC9cXGAuXHJcbiAgICAgKiAgICAgICAgICAgIDMvX19cXF9cXCAyXHJcbiAgICAgKiAgICAgICAgICAgMC9fX19fXFwvMVxyXG4gICAgICogYGBgXHJcbiAgICAgKiBAYXV0aG9ycyBKaXJrYSBEZWxsJ09yby1GcmllZGwsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgTWVzaFB5cmFtaWQgZXh0ZW5kcyBNZXNoIHtcclxuICAgICAgICBwdWJsaWMgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgY3JlYXRlKCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLnZlcnRpY2VzID0gdGhpcy5jcmVhdGVWZXJ0aWNlcygpO1xyXG4gICAgICAgICAgICB0aGlzLmluZGljZXMgPSB0aGlzLmNyZWF0ZUluZGljZXMoKTtcclxuICAgICAgICAgICAgdGhpcy50ZXh0dXJlVVZzID0gdGhpcy5jcmVhdGVUZXh0dXJlVVZzKCk7XHJcbiAgICAgICAgICAgIHRoaXMubm9ybWFsc0ZhY2UgPSB0aGlzLmNyZWF0ZUZhY2VOb3JtYWxzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcm90ZWN0ZWQgY3JlYXRlVmVydGljZXMoKTogRmxvYXQzMkFycmF5IHtcclxuICAgICAgICAgICAgbGV0IHZlcnRpY2VzOiBGbG9hdDMyQXJyYXkgPSBuZXcgRmxvYXQzMkFycmF5KFtcclxuICAgICAgICAgICAgICAgIC8vIGZsb29yXHJcbiAgICAgICAgICAgICAgICAvKjAqLyAtMSwgMCwgMSwgLyoxKi8gMSwgMCwgMSwgIC8qMiovIDEsIDAsIC0xLCAvKjMqLyAtMSwgMCwgLTEsXHJcbiAgICAgICAgICAgICAgICAvLyB0aXBcclxuICAgICAgICAgICAgICAgIC8qNCovIDAsIDIsIDAsICAvLyBkb3VibGUgaGVpZ2h0IHdpbGwgYmUgc2NhbGVkIGRvd25cclxuICAgICAgICAgICAgICAgIC8vIGZsb29yIGFnYWluIGZvciB0ZXh0dXJpbmcgYW5kIG5vcm1hbHNcclxuICAgICAgICAgICAgICAgIC8qNSovIC0xLCAwLCAxLCAvKjYqLyAxLCAwLCAxLCAgLyo3Ki8gMSwgMCwgLTEsIC8qOCovIC0xLCAwLCAtMVxyXG4gICAgICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgICAgIC8vIHNjYWxlIGRvd24gdG8gYSBsZW5ndGggb2YgMSBmb3IgYm90dG9tIGVkZ2VzIGFuZCBoZWlnaHRcclxuICAgICAgICAgICAgdmVydGljZXMgPSB2ZXJ0aWNlcy5tYXAoX3ZhbHVlID0+IF92YWx1ZSAvIDIpO1xyXG4gICAgICAgICAgICByZXR1cm4gdmVydGljZXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcm90ZWN0ZWQgY3JlYXRlSW5kaWNlcygpOiBVaW50MTZBcnJheSB7XHJcbiAgICAgICAgICAgIGxldCBpbmRpY2VzOiBVaW50MTZBcnJheSA9IG5ldyBVaW50MTZBcnJheShbXHJcbiAgICAgICAgICAgICAgICAvLyBmcm9udFxyXG4gICAgICAgICAgICAgICAgNCwgMCwgMSxcclxuICAgICAgICAgICAgICAgIC8vIHJpZ2h0XHJcbiAgICAgICAgICAgICAgICA0LCAxLCAyLFxyXG4gICAgICAgICAgICAgICAgLy8gYmFja1xyXG4gICAgICAgICAgICAgICAgNCwgMiwgMyxcclxuICAgICAgICAgICAgICAgIC8vIGxlZnRcclxuICAgICAgICAgICAgICAgIDQsIDMsIDAsXHJcbiAgICAgICAgICAgICAgICAvLyBib3R0b21cclxuICAgICAgICAgICAgICAgIDUgKyAwLCA1ICsgMiwgNSArIDEsIDUgKyAwLCA1ICsgMywgNSArIDJcclxuICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgICAgIHJldHVybiBpbmRpY2VzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJvdGVjdGVkIGNyZWF0ZVRleHR1cmVVVnMoKTogRmxvYXQzMkFycmF5IHtcclxuICAgICAgICAgICAgbGV0IHRleHR1cmVVVnM6IEZsb2F0MzJBcnJheSA9IG5ldyBGbG9hdDMyQXJyYXkoW1xyXG4gICAgICAgICAgICAgICAgLy8gZnJvbnRcclxuICAgICAgICAgICAgICAgIC8qMCovIDAsIDEsIC8qMSovIDAuNSwgMSwgIC8qMiovIDEsIDEsIC8qMyovIDAuNSwgMSxcclxuICAgICAgICAgICAgICAgIC8vIGJhY2tcclxuICAgICAgICAgICAgICAgIC8qNCovIDAuNSwgMCxcclxuICAgICAgICAgICAgICAgIC8qNSovIDAsIDAsIC8qNiovIDEsIDAsICAvKjcqLyAxLCAxLCAvKjgqLyAwLCAxXHJcbiAgICAgICAgICAgIF0pO1xyXG4gICAgICAgICAgICByZXR1cm4gdGV4dHVyZVVWcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByb3RlY3RlZCBjcmVhdGVGYWNlTm9ybWFscygpOiBGbG9hdDMyQXJyYXkge1xyXG4gICAgICAgICAgICBsZXQgbm9ybWFsczogbnVtYmVyW10gPSBbXTtcclxuICAgICAgICAgICAgbGV0IHZlcnRpY2VzOiBWZWN0b3IzW10gPSBbXTtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IHY6IG51bWJlciA9IDA7IHYgPCB0aGlzLnZlcnRpY2VzLmxlbmd0aDsgdiArPSAzKVxyXG4gICAgICAgICAgICAgICAgdmVydGljZXMucHVzaChuZXcgVmVjdG9yMyh0aGlzLnZlcnRpY2VzW3ZdLCB0aGlzLnZlcnRpY2VzW3YgKyAxXSwgdGhpcy52ZXJ0aWNlc1t2ICsgMl0pKTtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB0aGlzLmluZGljZXMubGVuZ3RoOyBpICs9IDMpIHtcclxuICAgICAgICAgICAgICAgIGxldCB2ZXJ0ZXg6IG51bWJlcltdID0gW3RoaXMuaW5kaWNlc1tpXSwgdGhpcy5pbmRpY2VzW2kgKyAxXSwgdGhpcy5pbmRpY2VzW2kgKyAyXV07XHJcbiAgICAgICAgICAgICAgICBsZXQgdjA6IFZlY3RvcjMgPSBWZWN0b3IzLkRJRkZFUkVOQ0UodmVydGljZXNbdmVydGV4WzBdXSwgdmVydGljZXNbdmVydGV4WzFdXSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgdjE6IFZlY3RvcjMgPSBWZWN0b3IzLkRJRkZFUkVOQ0UodmVydGljZXNbdmVydGV4WzBdXSwgdmVydGljZXNbdmVydGV4WzJdXSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgbm9ybWFsOiBWZWN0b3IzID0gVmVjdG9yMy5OT1JNQUxJWkFUSU9OKFZlY3RvcjMuQ1JPU1ModjAsIHYxKSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgaW5kZXg6IG51bWJlciA9IHZlcnRleFsyXSAqIDM7XHJcbiAgICAgICAgICAgICAgICBub3JtYWxzW2luZGV4XSA9IG5vcm1hbC54O1xyXG4gICAgICAgICAgICAgICAgbm9ybWFsc1tpbmRleCArIDFdID0gbm9ybWFsLnk7XHJcbiAgICAgICAgICAgICAgICBub3JtYWxzW2luZGV4ICsgMl0gPSBub3JtYWwuejtcclxuICAgICAgICAgICAgICAgIC8vIG5vcm1hbHMucHVzaChub3JtYWwueCwgbm9ybWFsLnksIG5vcm1hbC56KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBub3JtYWxzLnB1c2goMCwgMCwgMCk7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgRmxvYXQzMkFycmF5KG5vcm1hbHMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBHZW5lcmF0ZSBhIHNpbXBsZSBxdWFkIHdpdGggZWRnZXMgb2YgbGVuZ3RoIDEsIHRoZSBmYWNlIGNvbnNpc3Rpbmcgb2YgdHdvIHRyaWdvbnNcclxuICAgICAqIGBgYHBsYWludGV4dFxyXG4gICAgICogICAgICAgIDAgX18gM1xyXG4gICAgICogICAgICAgICB8X198XHJcbiAgICAgKiAgICAgICAgMSAgICAyICAgICAgICAgICAgIFxyXG4gICAgICogYGBgIFxyXG4gICAgICogQGF1dGhvcnMgSmlya2EgRGVsbCdPcm8tRnJpZWRsLCBIRlUsIDIwMTlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIE1lc2hRdWFkIGV4dGVuZHMgTWVzaCB7XHJcbiAgICAgICAgcHVibGljIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGNyZWF0ZSgpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy52ZXJ0aWNlcyA9IHRoaXMuY3JlYXRlVmVydGljZXMoKTtcclxuICAgICAgICAgICAgdGhpcy5pbmRpY2VzID0gdGhpcy5jcmVhdGVJbmRpY2VzKCk7XHJcbiAgICAgICAgICAgIHRoaXMudGV4dHVyZVVWcyA9IHRoaXMuY3JlYXRlVGV4dHVyZVVWcygpO1xyXG4gICAgICAgICAgICB0aGlzLm5vcm1hbHNGYWNlID0gdGhpcy5jcmVhdGVGYWNlTm9ybWFscygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJvdGVjdGVkIGNyZWF0ZVZlcnRpY2VzKCk6IEZsb2F0MzJBcnJheSB7XHJcbiAgICAgICAgICAgIGxldCB2ZXJ0aWNlczogRmxvYXQzMkFycmF5ID0gbmV3IEZsb2F0MzJBcnJheShbXHJcbiAgICAgICAgICAgICAgICAvKjAqLyAtMSwgMSwgMCwgLyoxKi8gLTEsIC0xLCAwLCAgLyoyKi8gMSwgLTEsIDAsIC8qMyovIDEsIDEsIDBcclxuICAgICAgICAgICAgXSk7XHJcblxyXG4gICAgICAgICAgICB2ZXJ0aWNlcyA9IHZlcnRpY2VzLm1hcChfdmFsdWUgPT4gX3ZhbHVlIC8gMik7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdmVydGljZXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByb3RlY3RlZCBjcmVhdGVJbmRpY2VzKCk6IFVpbnQxNkFycmF5IHtcclxuICAgICAgICAgICAgbGV0IGluZGljZXM6IFVpbnQxNkFycmF5ID0gbmV3IFVpbnQxNkFycmF5KFtcclxuICAgICAgICAgICAgICAgIDEsIDIsIDAsIDIsIDMsIDBcclxuICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgICAgIHJldHVybiBpbmRpY2VzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJvdGVjdGVkIGNyZWF0ZVRleHR1cmVVVnMoKTogRmxvYXQzMkFycmF5IHtcclxuICAgICAgICAgICAgbGV0IHRleHR1cmVVVnM6IEZsb2F0MzJBcnJheSA9IG5ldyBGbG9hdDMyQXJyYXkoW1xyXG4gICAgICAgICAgICAgICAgLy8gZnJvbnRcclxuICAgICAgICAgICAgICAgIC8qMCovIDAsIDAsIC8qMSovIDAsIDEsICAvKjIqLyAxLCAxLCAvKjMqLyAxLCAwXHJcbiAgICAgICAgICAgIF0pO1xyXG4gICAgICAgICAgICByZXR1cm4gdGV4dHVyZVVWcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByb3RlY3RlZCBjcmVhdGVGYWNlTm9ybWFscygpOiBGbG9hdDMyQXJyYXkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEZsb2F0MzJBcnJheShbXHJcbiAgICAgICAgICAgICAgICAvKjAqLyAwLCAwLCAxLCAvKjEqLyAwLCAwLCAwLCAvKjIqLyAwLCAwLCAwLCAvKjMqLyAxLCAwLCAwXHJcbiAgICAgICAgICAgIF0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gIGV4cG9ydCBpbnRlcmZhY2UgTWFwQ2xhc3NUb0NvbXBvbmVudHMge1xyXG4gICAgW2NsYXNzTmFtZTogc3RyaW5nXTogQ29tcG9uZW50W107XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXByZXNlbnRzIGEgbm9kZSBpbiB0aGUgc2NlbmV0cmVlLlxyXG4gICAqIEBhdXRob3JzIEphc2NoYSBLYXJhZ8O2bCwgSEZVLCAyMDE5IHwgSmlya2EgRGVsbCdPcm8tRnJpZWRsLCBIRlUsIDIwMTlcclxuICAgKi9cclxuICBleHBvcnQgY2xhc3MgTm9kZSBleHRlbmRzIEV2ZW50VGFyZ2V0IGltcGxlbWVudHMgU2VyaWFsaXphYmxlIHtcclxuICAgIHB1YmxpYyBuYW1lOiBzdHJpbmc7IC8vIFRoZSBuYW1lIHRvIGNhbGwgdGhpcyBub2RlIGJ5LlxyXG4gICAgcHVibGljIG10eFdvcmxkOiBNYXRyaXg0eDQgPSBNYXRyaXg0eDQuSURFTlRJVFk7XHJcbiAgICBwdWJsaWMgdGltZXN0YW1wVXBkYXRlOiBudW1iZXIgPSAwO1xyXG5cclxuICAgIHByaXZhdGUgcGFyZW50OiBOb2RlIHwgbnVsbCA9IG51bGw7IC8vIFRoZSBwYXJlbnQgb2YgdGhpcyBub2RlLlxyXG4gICAgcHJpdmF0ZSBjaGlsZHJlbjogTm9kZVtdID0gW107IC8vIGFycmF5IG9mIGNoaWxkIG5vZGVzIGFwcGVuZGVkIHRvIHRoaXMgbm9kZS5cclxuICAgIHByaXZhdGUgY29tcG9uZW50czogTWFwQ2xhc3NUb0NvbXBvbmVudHMgPSB7fTtcclxuICAgIC8vIHByaXZhdGUgdGFnczogc3RyaW5nW10gPSBbXTsgLy8gTmFtZXMgb2YgdGFncyB0aGF0IGFyZSBhdHRhY2hlZCB0byB0aGlzIG5vZGUuIChUT0RPOiBBcyBvZiB5ZXQgbm8gZnVuY3Rpb25hbGl0eSlcclxuICAgIC8vIHByaXZhdGUgbGF5ZXJzOiBzdHJpbmdbXSA9IFtdOyAvLyBOYW1lcyBvZiB0aGUgbGF5ZXJzIHRoaXMgbm9kZSBpcyBvbi4gKFRPRE86IEFzIG9mIHlldCBubyBmdW5jdGlvbmFsaXR5KVxyXG4gICAgcHJpdmF0ZSBsaXN0ZW5lcnM6IE1hcEV2ZW50VHlwZVRvTGlzdGVuZXIgPSB7fTtcclxuICAgIHByaXZhdGUgY2FwdHVyZXM6IE1hcEV2ZW50VHlwZVRvTGlzdGVuZXIgPSB7fTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgYSBuZXcgbm9kZSB3aXRoIGEgbmFtZSBhbmQgaW5pdGlhbGl6ZXMgYWxsIGF0dHJpYnV0ZXNcclxuICAgICAqIEBwYXJhbSBfbmFtZSBUaGUgbmFtZSBieSB3aGljaCB0aGUgbm9kZSBjYW4gYmUgY2FsbGVkLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgY29uc3RydWN0b3IoX25hbWU6IHN0cmluZykge1xyXG4gICAgICBzdXBlcigpO1xyXG4gICAgICB0aGlzLm5hbWUgPSBfbmFtZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSByZWZlcmVuY2UgdG8gdGhpcyBub2RlcyBwYXJlbnQgbm9kZVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0UGFyZW50KCk6IE5vZGUgfCBudWxsIHtcclxuICAgICAgcmV0dXJuIHRoaXMucGFyZW50O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVHJhY2VzIGJhY2sgdGhlIGFuY2VzdG9ycyBvZiB0aGlzIG5vZGUgYW5kIHJldHVybnMgdGhlIGZpcnN0XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRBbmNlc3RvcigpOiBOb2RlIHwgbnVsbCB7XHJcbiAgICAgIGxldCBhbmNlc3RvcjogTm9kZSA9IHRoaXM7XHJcbiAgICAgIHdoaWxlIChhbmNlc3Rvci5nZXRQYXJlbnQoKSlcclxuICAgICAgICBhbmNlc3RvciA9IGFuY2VzdG9yLmdldFBhcmVudCgpO1xyXG4gICAgICByZXR1cm4gYW5jZXN0b3I7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTaG9ydGN1dCB0byByZXRyaWV2ZSB0aGlzIG5vZGVzIFtbQ29tcG9uZW50VHJhbnNmb3JtXV1cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBjbXBUcmFuc2Zvcm0oKTogQ29tcG9uZW50VHJhbnNmb3JtIHtcclxuICAgICAgcmV0dXJuIDxDb21wb25lbnRUcmFuc2Zvcm0+dGhpcy5nZXRDb21wb25lbnRzKENvbXBvbmVudFRyYW5zZm9ybSlbMF07XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFNob3J0Y3V0IHRvIHJldHJpZXZlIHRoZSBsb2NhbCBbW01hdHJpeDR4NF1dIGF0dGFjaGVkIHRvIHRoaXMgbm9kZXMgW1tDb21wb25lbnRUcmFuc2Zvcm1dXSAgXHJcbiAgICAgKiBSZXR1cm5zIG51bGwgaWYgbm8gW1tDb21wb25lbnRUcmFuc2Zvcm1dXSBpcyBhdHRhY2hlZFxyXG4gICAgICovXHJcbiAgICAvLyBUT0RPOiByZWplY3RlZCBmb3Igbm93LCBzaW5jZSB0aGVyZSBpcyBzb21lIGNvbXB1dGF0aW9uYWwgb3ZlcmhlYWQsIHNvIG5vZGUubXR4TG9jYWwgc2hvdWxkIG5vdCBiZSB1c2VkIGNhcmVsZXNzbHlcclxuICAgIC8vIHB1YmxpYyBnZXQgbXR4TG9jYWwoKTogTWF0cml4NHg0IHtcclxuICAgIC8vICAgICBsZXQgY21wVHJhbnNmb3JtOiBDb21wb25lbnRUcmFuc2Zvcm0gPSB0aGlzLmNtcFRyYW5zZm9ybTtcclxuICAgIC8vICAgICBpZiAoY21wVHJhbnNmb3JtKVxyXG4gICAgLy8gICAgICAgICByZXR1cm4gY21wVHJhbnNmb3JtLmxvY2FsO1xyXG4gICAgLy8gICAgIGVsc2VcclxuICAgIC8vICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAvLyB9XHJcblxyXG4gICAgLy8gI3JlZ2lvbiBTY2VuZXRyZWVcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIGNsb25lIG9mIHRoZSBsaXN0IG9mIGNoaWxkcmVuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRDaGlsZHJlbigpOiBOb2RlW10ge1xyXG4gICAgICByZXR1cm4gdGhpcy5jaGlsZHJlbi5zbGljZSgwKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhbiBhcnJheSBvZiByZWZlcmVuY2VzIHRvIGNoaWxkbm9kZXMgd2l0aCB0aGUgc3VwcGxpZWQgbmFtZS4gXHJcbiAgICAgKiBAcGFyYW0gX25hbWUgVGhlIG5hbWUgb2YgdGhlIG5vZGVzIHRvIGJlIGZvdW5kLlxyXG4gICAgICogQHJldHVybiBBbiBhcnJheSB3aXRoIHJlZmVyZW5jZXMgdG8gbm9kZXNcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldENoaWxkcmVuQnlOYW1lKF9uYW1lOiBzdHJpbmcpOiBOb2RlW10ge1xyXG4gICAgICBsZXQgZm91bmQ6IE5vZGVbXSA9IFtdO1xyXG4gICAgICBmb3VuZCA9IHRoaXMuY2hpbGRyZW4uZmlsdGVyKChfbm9kZTogTm9kZSkgPT4gX25vZGUubmFtZSA9PSBfbmFtZSk7XHJcbiAgICAgIHJldHVybiBmb3VuZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgdGhlIGdpdmVuIHJlZmVyZW5jZSB0byBhIG5vZGUgdG8gdGhlIGxpc3Qgb2YgY2hpbGRyZW4sIGlmIG5vdCBhbHJlYWR5IGluXHJcbiAgICAgKiBAcGFyYW0gX25vZGUgVGhlIG5vZGUgdG8gYmUgYWRkZWQgYXMgYSBjaGlsZFxyXG4gICAgICogQHRocm93cyBFcnJvciB3aGVuIHRyeWluZyB0byBhZGQgYW4gYW5jZXN0b3Igb2YgdGhpcyBcclxuICAgICAqL1xyXG4gICAgcHVibGljIGFwcGVuZENoaWxkKF9ub2RlOiBOb2RlKTogdm9pZCB7XHJcbiAgICAgIGlmICh0aGlzLmNoaWxkcmVuLmluY2x1ZGVzKF9ub2RlKSlcclxuICAgICAgICAvLyBfbm9kZSBpcyBhbHJlYWR5IGEgY2hpbGQgb2YgdGhpc1xyXG4gICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgIGxldCBhbmNlc3RvcjogTm9kZSA9IHRoaXM7XHJcbiAgICAgIHdoaWxlIChhbmNlc3Rvcikge1xyXG4gICAgICAgIGlmIChhbmNlc3RvciA9PSBfbm9kZSlcclxuICAgICAgICAgIHRocm93IChuZXcgRXJyb3IoXCJDeWNsaWMgcmVmZXJlbmNlIHByb2hpYml0ZWQgaW4gbm9kZSBoaWVyYXJjaHksIGFuY2VzdG9ycyBtdXN0IG5vdCBiZSBhZGRlZCBhcyBjaGlsZHJlblwiKSk7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgYW5jZXN0b3IgPSBhbmNlc3Rvci5wYXJlbnQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuY2hpbGRyZW4ucHVzaChfbm9kZSk7XHJcbiAgICAgIF9ub2RlLnNldFBhcmVudCh0aGlzKTtcclxuICAgICAgX25vZGUuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoRVZFTlQuQ0hJTERfQVBQRU5ELCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyB0aGUgcmVmZXJlbmNlIHRvIHRoZSBnaXZlIG5vZGUgZnJvbSB0aGUgbGlzdCBvZiBjaGlsZHJlblxyXG4gICAgICogQHBhcmFtIF9ub2RlIFRoZSBub2RlIHRvIGJlIHJlbW92ZWQuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyByZW1vdmVDaGlsZChfbm9kZTogTm9kZSk6IHZvaWQge1xyXG4gICAgICBsZXQgZm91bmQ6IG51bWJlciA9IHRoaXMuZmluZENoaWxkKF9ub2RlKTtcclxuICAgICAgaWYgKGZvdW5kIDwgMClcclxuICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICBfbm9kZS5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChFVkVOVC5DSElMRF9SRU1PVkUsIHsgYnViYmxlczogdHJ1ZSB9KSk7XHJcbiAgICAgIHRoaXMuY2hpbGRyZW4uc3BsaWNlKGZvdW5kLCAxKTtcclxuICAgICAgX25vZGUuc2V0UGFyZW50KG51bGwpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgcG9zaXRpb24gb2YgdGhlIG5vZGUgaW4gdGhlIGxpc3Qgb2YgY2hpbGRyZW4gb3IgLTEgaWYgbm90IGZvdW5kXHJcbiAgICAgKiBAcGFyYW0gX25vZGUgVGhlIG5vZGUgdG8gYmUgZm91bmQuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBmaW5kQ2hpbGQoX25vZGU6IE5vZGUpOiBudW1iZXIge1xyXG4gICAgICByZXR1cm4gdGhpcy5jaGlsZHJlbi5pbmRleE9mKF9ub2RlKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlcGxhY2VzIGEgY2hpbGQgbm9kZSB3aXRoIGFub3RoZXIsIHByZXNlcnZpbmcgdGhlIHBvc2l0aW9uIGluIHRoZSBsaXN0IG9mIGNoaWxkcmVuXHJcbiAgICAgKiBAcGFyYW0gX3JlcGxhY2UgVGhlIG5vZGUgdG8gYmUgcmVwbGFjZWRcclxuICAgICAqIEBwYXJhbSBfd2l0aCBUaGUgbm9kZSB0byByZXBsYWNlIHdpdGhcclxuICAgICAqL1xyXG4gICAgcHVibGljIHJlcGxhY2VDaGlsZChfcmVwbGFjZTogTm9kZSwgX3dpdGg6IE5vZGUpOiBib29sZWFuIHtcclxuICAgICAgbGV0IGZvdW5kOiBudW1iZXIgPSB0aGlzLmZpbmRDaGlsZChfcmVwbGFjZSk7XHJcbiAgICAgIGlmIChmb3VuZCA8IDApXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICBsZXQgcHJldmlvdXNQYXJlbnQ6IE5vZGUgPSBfd2l0aC5nZXRQYXJlbnQoKTtcclxuICAgICAgaWYgKHByZXZpb3VzUGFyZW50KVxyXG4gICAgICAgIHByZXZpb3VzUGFyZW50LnJlbW92ZUNoaWxkKF93aXRoKTtcclxuICAgICAgX3JlcGxhY2Uuc2V0UGFyZW50KG51bGwpO1xyXG4gICAgICB0aGlzLmNoaWxkcmVuW2ZvdW5kXSA9IF93aXRoO1xyXG4gICAgICBfd2l0aC5zZXRQYXJlbnQodGhpcyk7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2VuZXJhdG9yIHlpZWxkaW5nIHRoZSBub2RlIGFuZCBhbGwgc3VjY2Vzc29ycyBpbiB0aGUgYnJhbmNoIGJlbG93IGZvciBpdGVyYXRpb25cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBicmFuY2goKTogSXRlcmFibGVJdGVyYXRvcjxOb2RlPiB7XHJcbiAgICAgIHJldHVybiB0aGlzLmdldEJyYW5jaEdlbmVyYXRvcigpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpc1VwZGF0ZWQoX3RpbWVzdGFtcFVwZGF0ZTogbnVtYmVyKTogYm9vbGVhbiB7XHJcbiAgICAgIHJldHVybiAodGhpcy50aW1lc3RhbXBVcGRhdGUgPT0gX3RpbWVzdGFtcFVwZGF0ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBcHBsaWVzIGEgTXV0YXRvciBmcm9tIFtbQW5pbWF0aW9uXV0gdG8gYWxsIGl0cyBjb21wb25lbnRzIGFuZCB0cmFuc2ZlcnMgaXQgdG8gaXRzIGNoaWxkcmVuLlxyXG4gICAgICogQHBhcmFtIF9tdXRhdG9yIFRoZSBtdXRhdG9yIGdlbmVyYXRlZCBmcm9tIGFuIFtbQW5pbWF0aW9uXV1cclxuICAgICAqL1xyXG4gICAgcHVibGljIGFwcGx5QW5pbWF0aW9uKF9tdXRhdG9yOiBNdXRhdG9yKTogdm9pZCB7XHJcbiAgICAgIGlmIChfbXV0YXRvci5jb21wb25lbnRzKSB7XHJcbiAgICAgICAgZm9yIChsZXQgY29tcG9uZW50TmFtZSBpbiBfbXV0YXRvci5jb21wb25lbnRzKSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5jb21wb25lbnRzW2NvbXBvbmVudE5hbWVdKSB7XHJcbiAgICAgICAgICAgIGxldCBtdXRhdG9yT2ZDb21wb25lbnQ6IE11dGF0b3IgPSA8TXV0YXRvcj5fbXV0YXRvci5jb21wb25lbnRzO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpIGluIG11dGF0b3JPZkNvbXBvbmVudFtjb21wb25lbnROYW1lXSkge1xyXG4gICAgICAgICAgICAgIGlmICh0aGlzLmNvbXBvbmVudHNbY29tcG9uZW50TmFtZV1bK2ldKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY29tcG9uZW50VG9NdXRhdGU6IENvbXBvbmVudCA9IHRoaXMuY29tcG9uZW50c1tjb21wb25lbnROYW1lXVsraV07XHJcbiAgICAgICAgICAgICAgICBsZXQgbXV0YXRvckFycmF5OiBNdXRhdG9yW10gPSAoPEFycmF5PE11dGF0b3I+Pm11dGF0b3JPZkNvbXBvbmVudFtjb21wb25lbnROYW1lXSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgbXV0YXRvcldpdGhDb21wb25lbnROYW1lOiBNdXRhdG9yID0gPE11dGF0b3I+bXV0YXRvckFycmF5WytpXTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGNuYW1lIGluIG11dGF0b3JXaXRoQ29tcG9uZW50TmFtZSkgeyAgIC8vIHRyaWNrIHVzZWQgdG8gZ2V0IHRoZSBvbmx5IGVudHJ5IGluIHRoZSBsaXN0XHJcbiAgICAgICAgICAgICAgICAgIGxldCBtdXRhdG9yVG9HaXZlOiBNdXRhdG9yID0gPE11dGF0b3I+bXV0YXRvcldpdGhDb21wb25lbnROYW1lW2NuYW1lXTtcclxuICAgICAgICAgICAgICAgICAgY29tcG9uZW50VG9NdXRhdGUubXV0YXRlKG11dGF0b3JUb0dpdmUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZiAoX211dGF0b3IuY2hpbGRyZW4pIHtcclxuICAgICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgKDxBcnJheTxPYmplY3Q+Pl9tdXRhdG9yLmNoaWxkcmVuKS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgbGV0IG5hbWU6IHN0cmluZyA9ICg8Tm9kZT4oPEFycmF5PE11dGF0b3I+Pl9tdXRhdG9yLmNoaWxkcmVuKVtpXVtcIsaSLk5vZGVcIl0pLm5hbWU7XHJcbiAgICAgICAgICBsZXQgY2hpbGROb2RlczogTm9kZVtdID0gdGhpcy5nZXRDaGlsZHJlbkJ5TmFtZShuYW1lKTtcclxuICAgICAgICAgIGZvciAobGV0IGNoaWxkTm9kZSBvZiBjaGlsZE5vZGVzKSB7XHJcbiAgICAgICAgICAgIGNoaWxkTm9kZS5hcHBseUFuaW1hdGlvbig8TXV0YXRvcj4oPEFycmF5PE11dGF0b3I+Pl9tdXRhdG9yLmNoaWxkcmVuKVtpXVtcIsaSLk5vZGVcIl0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8gI2VuZHJlZ2lvblxyXG5cclxuICAgIC8vICNyZWdpb24gQ29tcG9uZW50c1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgbGlzdCBvZiBhbGwgY29tcG9uZW50cyBhdHRhY2hlZCB0byB0aGlzIG5vZGUsIGluZGVwZW5kZW50IG9mIHR5cGUuIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0QWxsQ29tcG9uZW50cygpOiBDb21wb25lbnRbXSB7XHJcbiAgICAgIGxldCBhbGw6IENvbXBvbmVudFtdID0gW107XHJcbiAgICAgIGZvciAobGV0IHR5cGUgaW4gdGhpcy5jb21wb25lbnRzKSB7XHJcbiAgICAgICAgYWxsID0gYWxsLmNvbmNhdCh0aGlzLmNvbXBvbmVudHNbdHlwZV0pO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBhbGw7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgY2xvbmUgb2YgdGhlIGxpc3Qgb2YgY29tcG9uZW50cyBvZiB0aGUgZ2l2ZW4gY2xhc3MgYXR0YWNoZWQgdG8gdGhpcyBub2RlLiBcclxuICAgICAqIEBwYXJhbSBfY2xhc3MgVGhlIGNsYXNzIG9mIHRoZSBjb21wb25lbnRzIHRvIGJlIGZvdW5kLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0Q29tcG9uZW50czxUIGV4dGVuZHMgQ29tcG9uZW50PihfY2xhc3M6IG5ldyAoKSA9PiBUKTogVFtdIHtcclxuICAgICAgcmV0dXJuIDxUW10+KHRoaXMuY29tcG9uZW50c1tfY2xhc3MubmFtZV0gfHwgW10pLnNsaWNlKDApO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBmaXJzdCBjb21wb250ZW50IGZvdW5kIG9mIHRoZSBnaXZlbiBjbGFzcyBhdHRhY2hlZCB0aGlzIG5vZGUgb3IgbnVsbCwgaWYgbGlzdCBpcyBlbXB0eSBvciBkb2Vzbid0IGV4aXN0XHJcbiAgICAgKiBAcGFyYW0gX2NsYXNzIFRoZSBjbGFzcyBvZiB0aGUgY29tcG9uZW50cyB0byBiZSBmb3VuZC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldENvbXBvbmVudDxUIGV4dGVuZHMgQ29tcG9uZW50PihfY2xhc3M6IG5ldyAoKSA9PiBUKTogVCB7XHJcbiAgICAgIGxldCBsaXN0OiBUW10gPSA8VFtdPnRoaXMuY29tcG9uZW50c1tfY2xhc3MubmFtZV07XHJcbiAgICAgIGlmIChsaXN0KVxyXG4gICAgICAgIHJldHVybiBsaXN0WzBdO1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgdGhlIHN1cHBsaWVkIGNvbXBvbmVudCBpbnRvIHRoZSBub2RlcyBjb21wb25lbnQgbWFwLlxyXG4gICAgICogQHBhcmFtIF9jb21wb25lbnQgVGhlIGNvbXBvbmVudCB0byBiZSBwdXNoZWQgaW50byB0aGUgYXJyYXkuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhZGRDb21wb25lbnQoX2NvbXBvbmVudDogQ29tcG9uZW50KTogdm9pZCB7XHJcbiAgICAgIGlmIChfY29tcG9uZW50LmdldENvbnRhaW5lcigpID09IHRoaXMpXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICBpZiAodGhpcy5jb21wb25lbnRzW19jb21wb25lbnQudHlwZV0gPT09IHVuZGVmaW5lZClcclxuICAgICAgICB0aGlzLmNvbXBvbmVudHNbX2NvbXBvbmVudC50eXBlXSA9IFtfY29tcG9uZW50XTtcclxuICAgICAgZWxzZVxyXG4gICAgICAgIGlmIChfY29tcG9uZW50LmlzU2luZ2xldG9uKVxyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ29tcG9uZW50IGlzIG1hcmtlZCBzaW5nbGV0b24gYW5kIGNhbid0IGJlIGF0dGFjaGVkLCBubyBtb3JlIHRoYW4gb25lIGFsbG93ZWRcIik7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgdGhpcy5jb21wb25lbnRzW19jb21wb25lbnQudHlwZV0ucHVzaChfY29tcG9uZW50KTtcclxuXHJcbiAgICAgIF9jb21wb25lbnQuc2V0Q29udGFpbmVyKHRoaXMpO1xyXG4gICAgICBfY29tcG9uZW50LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KEVWRU5ULkNPTVBPTkVOVF9BREQpKTtcclxuICAgIH1cclxuICAgIC8qKiBcclxuICAgICAqIFJlbW92ZXMgdGhlIGdpdmVuIGNvbXBvbmVudCBmcm9tIHRoZSBub2RlLCBpZiBpdCB3YXMgYXR0YWNoZWQsIGFuZCBzZXRzIGl0cyBwYXJlbnQgdG8gbnVsbC4gXHJcbiAgICAgKiBAcGFyYW0gX2NvbXBvbmVudCBUaGUgY29tcG9uZW50IHRvIGJlIHJlbW92ZWRcclxuICAgICAqIEB0aHJvd3MgRXhjZXB0aW9uIHdoZW4gY29tcG9uZW50IGlzIG5vdCBmb3VuZFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgcmVtb3ZlQ29tcG9uZW50KF9jb21wb25lbnQ6IENvbXBvbmVudCk6IHZvaWQge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGxldCBjb21wb25lbnRzT2ZUeXBlOiBDb21wb25lbnRbXSA9IHRoaXMuY29tcG9uZW50c1tfY29tcG9uZW50LnR5cGVdO1xyXG4gICAgICAgIGxldCBmb3VuZEF0OiBudW1iZXIgPSBjb21wb25lbnRzT2ZUeXBlLmluZGV4T2YoX2NvbXBvbmVudCk7XHJcbiAgICAgICAgaWYgKGZvdW5kQXQgPCAwKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGNvbXBvbmVudHNPZlR5cGUuc3BsaWNlKGZvdW5kQXQsIDEpO1xyXG4gICAgICAgIF9jb21wb25lbnQuc2V0Q29udGFpbmVyKG51bGwpO1xyXG4gICAgICAgIF9jb21wb25lbnQuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoRVZFTlQuQ09NUE9ORU5UX1JFTU9WRSkpO1xyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byByZW1vdmUgY29tcG9uZW50ICcke19jb21wb25lbnR9J2luIG5vZGUgbmFtZWQgJyR7dGhpcy5uYW1lfSdgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8gI2VuZHJlZ2lvblxyXG5cclxuICAgIC8vICNyZWdpb24gU2VyaWFsaXphdGlvblxyXG4gICAgcHVibGljIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemF0aW9uIHtcclxuICAgICAgbGV0IHNlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24gPSB7XHJcbiAgICAgICAgbmFtZTogdGhpcy5uYW1lXHJcbiAgICAgIH07XHJcblxyXG4gICAgICBsZXQgY29tcG9uZW50czogU2VyaWFsaXphdGlvbiA9IHt9O1xyXG4gICAgICBmb3IgKGxldCB0eXBlIGluIHRoaXMuY29tcG9uZW50cykge1xyXG4gICAgICAgIGNvbXBvbmVudHNbdHlwZV0gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBjb21wb25lbnQgb2YgdGhpcy5jb21wb25lbnRzW3R5cGVdKSB7XHJcbiAgICAgICAgICAvLyBjb21wb25lbnRzW3R5cGVdLnB1c2goY29tcG9uZW50LnNlcmlhbGl6ZSgpKTtcclxuICAgICAgICAgIGNvbXBvbmVudHNbdHlwZV0ucHVzaChTZXJpYWxpemVyLnNlcmlhbGl6ZShjb21wb25lbnQpKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgc2VyaWFsaXphdGlvbltcImNvbXBvbmVudHNcIl0gPSBjb21wb25lbnRzO1xyXG5cclxuICAgICAgbGV0IGNoaWxkcmVuOiBTZXJpYWxpemF0aW9uW10gPSBbXTtcclxuICAgICAgZm9yIChsZXQgY2hpbGQgb2YgdGhpcy5jaGlsZHJlbikge1xyXG4gICAgICAgIGNoaWxkcmVuLnB1c2goU2VyaWFsaXplci5zZXJpYWxpemUoY2hpbGQpKTtcclxuICAgICAgfVxyXG4gICAgICBzZXJpYWxpemF0aW9uW1wiY2hpbGRyZW5cIl0gPSBjaGlsZHJlbjtcclxuXHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoRVZFTlQuTk9ERV9TRVJJQUxJWkVEKSk7XHJcbiAgICAgIHJldHVybiBzZXJpYWxpemF0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBkZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbik6IFNlcmlhbGl6YWJsZSB7XHJcbiAgICAgIHRoaXMubmFtZSA9IF9zZXJpYWxpemF0aW9uLm5hbWU7XHJcbiAgICAgIC8vIHRoaXMucGFyZW50ID0gaXMgc2V0IHdoZW4gdGhlIG5vZGVzIGFyZSBhZGRlZFxyXG5cclxuICAgICAgLy8gZGVzZXJpYWxpemUgY29tcG9uZW50cyBmaXJzdCBzbyBzY3JpcHRzIGNhbiByZWFjdCB0byBjaGlsZHJlbiBiZWluZyBhcHBlbmRlZFxyXG4gICAgICBmb3IgKGxldCB0eXBlIGluIF9zZXJpYWxpemF0aW9uLmNvbXBvbmVudHMpIHtcclxuICAgICAgICBmb3IgKGxldCBzZXJpYWxpemVkQ29tcG9uZW50IG9mIF9zZXJpYWxpemF0aW9uLmNvbXBvbmVudHNbdHlwZV0pIHtcclxuICAgICAgICAgIGxldCBkZXNlcmlhbGl6ZWRDb21wb25lbnQ6IENvbXBvbmVudCA9IDxDb21wb25lbnQ+U2VyaWFsaXplci5kZXNlcmlhbGl6ZShzZXJpYWxpemVkQ29tcG9uZW50KTtcclxuICAgICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KGRlc2VyaWFsaXplZENvbXBvbmVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3IgKGxldCBzZXJpYWxpemVkQ2hpbGQgb2YgX3NlcmlhbGl6YXRpb24uY2hpbGRyZW4pIHtcclxuICAgICAgICBsZXQgZGVzZXJpYWxpemVkQ2hpbGQ6IE5vZGUgPSA8Tm9kZT5TZXJpYWxpemVyLmRlc2VyaWFsaXplKHNlcmlhbGl6ZWRDaGlsZCk7XHJcbiAgICAgICAgdGhpcy5hcHBlbmRDaGlsZChkZXNlcmlhbGl6ZWRDaGlsZCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoRVZFTlQuTk9ERV9ERVNFUklBTElaRUQpKTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvLyAjZW5kcmVnaW9uXHJcblxyXG4gICAgLy8gI3JlZ2lvbiBFdmVudHNcclxuICAgIC8qKlxyXG4gICAgICogQWRkcyBhbiBldmVudCBsaXN0ZW5lciB0byB0aGUgbm9kZS4gVGhlIGdpdmVuIGhhbmRsZXIgd2lsbCBiZSBjYWxsZWQgd2hlbiBhIG1hdGNoaW5nIGV2ZW50IGlzIHBhc3NlZCB0byB0aGUgbm9kZS5cclxuICAgICAqIERldmlhdGluZyBmcm9tIHRoZSBzdGFuZGFyZCBFdmVudFRhcmdldCwgaGVyZSB0aGUgX2hhbmRsZXIgbXVzdCBiZSBhIGZ1bmN0aW9uIGFuZCBfY2FwdHVyZSBpcyB0aGUgb25seSBvcHRpb24uXHJcbiAgICAgKiBAcGFyYW0gX3R5cGUgVGhlIHR5cGUgb2YgdGhlIGV2ZW50LCBzaG91bGQgYmUgYW4gZW51bWVyYXRlZCB2YWx1ZSBvZiBOT0RFX0VWRU5ULCBjYW4gYmUgYW55IHN0cmluZ1xyXG4gICAgICogQHBhcmFtIF9oYW5kbGVyIFRoZSBmdW5jdGlvbiB0byBjYWxsIHdoZW4gdGhlIGV2ZW50IHJlYWNoZXMgdGhpcyBub2RlXHJcbiAgICAgKiBAcGFyYW0gX2NhcHR1cmUgV2hlbiB0cnVlLCB0aGUgbGlzdGVuZXIgbGlzdGVucyBpbiB0aGUgY2FwdHVyZSBwaGFzZSwgd2hlbiB0aGUgZXZlbnQgdHJhdmVscyBkZWVwZXIgaW50byB0aGUgaGllcmFyY2h5IG9mIG5vZGVzLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYWRkRXZlbnRMaXN0ZW5lcihfdHlwZTogRVZFTlQgfCBzdHJpbmcsIF9oYW5kbGVyOiBFdmVudExpc3RlbmVyLCBfY2FwdHVyZTogYm9vbGVhbiAvKnwgQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMqLyA9IGZhbHNlKTogdm9pZCB7XHJcbiAgICAgIGlmIChfY2FwdHVyZSkge1xyXG4gICAgICAgIGlmICghdGhpcy5jYXB0dXJlc1tfdHlwZV0pXHJcbiAgICAgICAgICB0aGlzLmNhcHR1cmVzW190eXBlXSA9IFtdO1xyXG4gICAgICAgIHRoaXMuY2FwdHVyZXNbX3R5cGVdLnB1c2goX2hhbmRsZXIpO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGlmICghdGhpcy5saXN0ZW5lcnNbX3R5cGVdKVxyXG4gICAgICAgICAgdGhpcy5saXN0ZW5lcnNbX3R5cGVdID0gW107XHJcbiAgICAgICAgdGhpcy5saXN0ZW5lcnNbX3R5cGVdLnB1c2goX2hhbmRsZXIpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIERpc3BhdGNoZXMgYSBzeW50aGV0aWMgZXZlbnQgZXZlbnQgdG8gdGFyZ2V0LiBUaGlzIGltcGxlbWVudGF0aW9uIGFsd2F5cyByZXR1cm5zIHRydWUgKHN0YW5kYXJkOiByZXR1cm4gdHJ1ZSBvbmx5IGlmIGVpdGhlciBldmVudCdzIGNhbmNlbGFibGUgYXR0cmlidXRlIHZhbHVlIGlzIGZhbHNlIG9yIGl0cyBwcmV2ZW50RGVmYXVsdCgpIG1ldGhvZCB3YXMgbm90IGludm9rZWQpXHJcbiAgICAgKiBUaGUgZXZlbnQgdHJhdmVscyBpbnRvIHRoZSBoaWVyYXJjaHkgdG8gdGhpcyBub2RlIGRpc3BhdGNoaW5nIHRoZSBldmVudCwgaW52b2tpbmcgbWF0Y2hpbmcgaGFuZGxlcnMgb2YgdGhlIG5vZGVzIGFuY2VzdG9ycyBsaXN0ZW5pbmcgdG8gdGhlIGNhcHR1cmUgcGhhc2UsIFxyXG4gICAgICogdGhhbiB0aGUgbWF0Y2hpbmcgaGFuZGxlciBvZiB0aGUgdGFyZ2V0IG5vZGUgaW4gdGhlIHRhcmdldCBwaGFzZSwgYW5kIGJhY2sgb3V0IG9mIHRoZSBoaWVyYXJjaHkgaW4gdGhlIGJ1YmJsaW5nIHBoYXNlLCBpbnZva2luZyBhcHByb3ByaWF0ZSBoYW5kbGVycyBvZiB0aGUgYW52ZXN0b3JzXHJcbiAgICAgKiBAcGFyYW0gX2V2ZW50IFRoZSBldmVudCB0byBkaXNwYXRjaFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZGlzcGF0Y2hFdmVudChfZXZlbnQ6IEV2ZW50KTogYm9vbGVhbiB7XHJcbiAgICAgIGxldCBhbmNlc3RvcnM6IE5vZGVbXSA9IFtdO1xyXG4gICAgICBsZXQgdXBjb21pbmc6IE5vZGUgPSB0aGlzO1xyXG4gICAgICAvLyBvdmVyd3JpdGUgZXZlbnQgdGFyZ2V0XHJcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShfZXZlbnQsIFwidGFyZ2V0XCIsIHsgd3JpdGFibGU6IHRydWUsIHZhbHVlOiB0aGlzIH0pO1xyXG4gICAgICAvLyBUT0RPOiBjb25zaWRlciB1c2luZyBSZWZsZWN0IGluc3RlYWQgb2YgT2JqZWN0IHRocm91Z2hvdXQuIFNlZSBhbHNvIFJlbmRlciBhbmQgTXV0YWJsZS4uLlxyXG4gICAgICB3aGlsZSAodXBjb21pbmcucGFyZW50KVxyXG4gICAgICAgIGFuY2VzdG9ycy5wdXNoKHVwY29taW5nID0gdXBjb21pbmcucGFyZW50KTtcclxuXHJcbiAgICAgIC8vIGNhcHR1cmUgcGhhc2VcclxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KF9ldmVudCwgXCJldmVudFBoYXNlXCIsIHsgd3JpdGFibGU6IHRydWUsIHZhbHVlOiBFdmVudC5DQVBUVVJJTkdfUEhBU0UgfSk7XHJcbiAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IGFuY2VzdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgIGxldCBhbmNlc3RvcjogTm9kZSA9IGFuY2VzdG9yc1tpXTtcclxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoX2V2ZW50LCBcImN1cnJlbnRUYXJnZXRcIiwgeyB3cml0YWJsZTogdHJ1ZSwgdmFsdWU6IGFuY2VzdG9yIH0pO1xyXG4gICAgICAgIGxldCBjYXB0dXJlczogRXZlbnRMaXN0ZW5lcltdID0gYW5jZXN0b3IuY2FwdHVyZXNbX2V2ZW50LnR5cGVdIHx8IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGhhbmRsZXIgb2YgY2FwdHVyZXMpXHJcbiAgICAgICAgICBoYW5kbGVyKF9ldmVudCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghX2V2ZW50LmJ1YmJsZXMpXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgICAvLyB0YXJnZXQgcGhhc2VcclxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KF9ldmVudCwgXCJldmVudFBoYXNlXCIsIHsgd3JpdGFibGU6IHRydWUsIHZhbHVlOiBFdmVudC5BVF9UQVJHRVQgfSk7XHJcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShfZXZlbnQsIFwiY3VycmVudFRhcmdldFwiLCB7IHdyaXRhYmxlOiB0cnVlLCB2YWx1ZTogdGhpcyB9KTtcclxuICAgICAgbGV0IGxpc3RlbmVyczogRXZlbnRMaXN0ZW5lcltdID0gdGhpcy5saXN0ZW5lcnNbX2V2ZW50LnR5cGVdIHx8IFtdO1xyXG4gICAgICBmb3IgKGxldCBoYW5kbGVyIG9mIGxpc3RlbmVycylcclxuICAgICAgICBoYW5kbGVyKF9ldmVudCk7XHJcblxyXG4gICAgICAvLyBidWJibGUgcGhhc2VcclxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KF9ldmVudCwgXCJldmVudFBoYXNlXCIsIHsgd3JpdGFibGU6IHRydWUsIHZhbHVlOiBFdmVudC5CVUJCTElOR19QSEFTRSB9KTtcclxuICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IGFuY2VzdG9ycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGxldCBhbmNlc3RvcjogTm9kZSA9IGFuY2VzdG9yc1tpXTtcclxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoX2V2ZW50LCBcImN1cnJlbnRUYXJnZXRcIiwgeyB3cml0YWJsZTogdHJ1ZSwgdmFsdWU6IGFuY2VzdG9yIH0pO1xyXG4gICAgICAgIGxldCBsaXN0ZW5lcnM6IEZ1bmN0aW9uW10gPSBhbmNlc3Rvci5saXN0ZW5lcnNbX2V2ZW50LnR5cGVdIHx8IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGhhbmRsZXIgb2YgbGlzdGVuZXJzKVxyXG4gICAgICAgICAgaGFuZGxlcihfZXZlbnQpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB0cnVlOyAvL1RPRE86IHJldHVybiBhIG1lYW5pbmdmdWwgdmFsdWUsIHNlZSBkb2N1bWVudGF0aW9uIG9mIGRpc3BhdGNoIGV2ZW50XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEJyb2FkY2FzdHMgYSBzeW50aGV0aWMgZXZlbnQgZXZlbnQgdG8gdGhpcyBub2RlIGFuZCBmcm9tIHRoZXJlIHRvIGFsbCBub2RlcyBkZWVwZXIgaW4gdGhlIGhpZXJhcmNoeSxcclxuICAgICAqIGludm9raW5nIG1hdGNoaW5nIGhhbmRsZXJzIG9mIHRoZSBub2RlcyBsaXN0ZW5pbmcgdG8gdGhlIGNhcHR1cmUgcGhhc2UuIFdhdGNoIHBlcmZvcm1hbmNlIHdoZW4gdGhlcmUgYXJlIG1hbnkgbm9kZXMgaW52b2x2ZWRcclxuICAgICAqIEBwYXJhbSBfZXZlbnQgVGhlIGV2ZW50IHRvIGJyb2FkY2FzdFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYnJvYWRjYXN0RXZlbnQoX2V2ZW50OiBFdmVudCk6IHZvaWQge1xyXG4gICAgICAvLyBvdmVyd3JpdGUgZXZlbnQgdGFyZ2V0IGFuZCBwaGFzZVxyXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoX2V2ZW50LCBcImV2ZW50UGhhc2VcIiwgeyB3cml0YWJsZTogdHJ1ZSwgdmFsdWU6IEV2ZW50LkNBUFRVUklOR19QSEFTRSB9KTtcclxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KF9ldmVudCwgXCJ0YXJnZXRcIiwgeyB3cml0YWJsZTogdHJ1ZSwgdmFsdWU6IHRoaXMgfSk7XHJcbiAgICAgIHRoaXMuYnJvYWRjYXN0RXZlbnRSZWN1cnNpdmUoX2V2ZW50KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGJyb2FkY2FzdEV2ZW50UmVjdXJzaXZlKF9ldmVudDogRXZlbnQpOiB2b2lkIHtcclxuICAgICAgLy8gY2FwdHVyZSBwaGFzZSBvbmx5XHJcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShfZXZlbnQsIFwiY3VycmVudFRhcmdldFwiLCB7IHdyaXRhYmxlOiB0cnVlLCB2YWx1ZTogdGhpcyB9KTtcclxuICAgICAgbGV0IGNhcHR1cmVzOiBGdW5jdGlvbltdID0gdGhpcy5jYXB0dXJlc1tfZXZlbnQudHlwZV0gfHwgW107XHJcbiAgICAgIGZvciAobGV0IGhhbmRsZXIgb2YgY2FwdHVyZXMpXHJcbiAgICAgICAgaGFuZGxlcihfZXZlbnQpO1xyXG4gICAgICAvLyBhcHBlYXJzIHRvIGJlIHNsb3dlciwgYXN0b25pc2hpbmdseS4uLlxyXG4gICAgICAvLyBjYXB0dXJlcy5mb3JFYWNoKGZ1bmN0aW9uIChoYW5kbGVyOiBGdW5jdGlvbik6IHZvaWQge1xyXG4gICAgICAvLyAgICAgaGFuZGxlcihfZXZlbnQpO1xyXG4gICAgICAvLyB9KTtcclxuXHJcbiAgICAgIC8vIHNhbWUgZm9yIGNoaWxkcmVuXHJcbiAgICAgIGZvciAobGV0IGNoaWxkIG9mIHRoaXMuY2hpbGRyZW4pIHtcclxuICAgICAgICBjaGlsZC5icm9hZGNhc3RFdmVudFJlY3Vyc2l2ZShfZXZlbnQpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyAjZW5kcmVnaW9uXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSBwYXJlbnQgb2YgdGhpcyBub2RlIHRvIGJlIHRoZSBzdXBwbGllZCBub2RlLiBXaWxsIGJlIGNhbGxlZCBvbiB0aGUgY2hpbGQgdGhhdCBpcyBhcHBlbmRlZCB0byB0aGlzIG5vZGUgYnkgYXBwZW5kQ2hpbGQoKS5cclxuICAgICAqIEBwYXJhbSBfcGFyZW50IFRoZSBwYXJlbnQgdG8gYmUgc2V0IGZvciB0aGlzIG5vZGUuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgc2V0UGFyZW50KF9wYXJlbnQ6IE5vZGUgfCBudWxsKTogdm9pZCB7XHJcbiAgICAgIHRoaXMucGFyZW50ID0gX3BhcmVudDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlICpnZXRCcmFuY2hHZW5lcmF0b3IoKTogSXRlcmFibGVJdGVyYXRvcjxOb2RlPiB7XHJcbiAgICAgIHlpZWxkIHRoaXM7XHJcbiAgICAgIGZvciAobGV0IGNoaWxkIG9mIHRoaXMuY2hpbGRyZW4pXHJcbiAgICAgICAgeWllbGQqIGNoaWxkLmJyYW5jaDtcclxuICAgIH1cclxuICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogQSBub2RlIG1hbmFnZWQgYnkgW1tSZXNvdXJjZU1hbmFnZXJdXSB0aGF0IGZ1bmN0aW9ucyBhcyBhIHRlbXBsYXRlIGZvciBbW05vZGVSZXNvdXJjZUluc3RhbmNlXV1zIFxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgTm9kZVJlc291cmNlIGV4dGVuZHMgTm9kZSBpbXBsZW1lbnRzIFNlcmlhbGl6YWJsZVJlc291cmNlIHtcclxuICAgICAgICBwdWJsaWMgaWRSZXNvdXJjZTogc3RyaW5nID0gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIEFuIGluc3RhbmNlIG9mIGEgW1tOb2RlUmVzb3VyY2VdXS4gIFxyXG4gICAgICogVGhpcyBub2RlIGtlZXBzIGEgcmVmZXJlbmNlIHRvIGl0cyByZXNvdXJjZSBhbiBjYW4gdGh1cyBvcHRpbWl6ZSBzZXJpYWxpemF0aW9uXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBOb2RlUmVzb3VyY2VJbnN0YW5jZSBleHRlbmRzIE5vZGUge1xyXG4gICAgICAgIC8qKiBpZCBvZiB0aGUgcmVzb3VyY2UgdGhhdCBpbnN0YW5jZSB3YXMgY3JlYXRlZCBmcm9tICovXHJcbiAgICAgICAgLy8gVE9ETzogZXhhbWluZSwgaWYgdGhpcyBzaG91bGQgYmUgYSBkaXJlY3QgcmVmZXJlbmNlIHRvIHRoZSBOb2RlUmVzb3VyY2UsIGluc3RlYWQgb2YgdGhlIGlkXHJcbiAgICAgICAgcHJpdmF0ZSBpZFNvdXJjZTogc3RyaW5nID0gdW5kZWZpbmVkO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3Rvcihfbm9kZVJlc291cmNlOiBOb2RlUmVzb3VyY2UpIHtcclxuICAgICAgICAgICAgc3VwZXIoXCJOb2RlUmVzb3VyY2VJbnN0YW5jZVwiKTtcclxuICAgICAgICAgICAgaWYgKF9ub2RlUmVzb3VyY2UpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldChfbm9kZVJlc291cmNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlY3JlYXRlIHRoaXMgbm9kZSBmcm9tIHRoZSBbW05vZGVSZXNvdXJjZV1dIHJlZmVyZW5jZWRcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGxldCByZXNvdXJjZTogTm9kZVJlc291cmNlID0gPE5vZGVSZXNvdXJjZT5SZXNvdXJjZU1hbmFnZXIuZ2V0KHRoaXMuaWRTb3VyY2UpO1xyXG4gICAgICAgICAgICB0aGlzLnNldChyZXNvdXJjZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL1RPRE86IG9wdGltaXplIHVzaW5nIHRoZSByZWZlcmVuY2VkIE5vZGVSZXNvdXJjZSwgc2VyaWFsaXplL2Rlc2VyaWFsaXplIG9ubHkgdGhlIGRpZmZlcmVuY2VzXHJcbiAgICAgICAgcHVibGljIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemF0aW9uIHtcclxuICAgICAgICAgICAgbGV0IHNlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24gPSBzdXBlci5zZXJpYWxpemUoKTtcclxuICAgICAgICAgICAgc2VyaWFsaXphdGlvbi5pZFNvdXJjZSA9IHRoaXMuaWRTb3VyY2U7XHJcbiAgICAgICAgICAgIHJldHVybiBzZXJpYWxpemF0aW9uO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uKTogU2VyaWFsaXphYmxlIHtcclxuICAgICAgICAgICAgc3VwZXIuZGVzZXJpYWxpemUoX3NlcmlhbGl6YXRpb24pO1xyXG4gICAgICAgICAgICB0aGlzLmlkU291cmNlID0gX3NlcmlhbGl6YXRpb24uaWRTb3VyY2U7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2V0IHRoaXMgbm9kZSB0byBiZSBhIHJlY3JlYXRpb24gb2YgdGhlIFtbTm9kZVJlc291cmNlXV0gZ2l2ZW5cclxuICAgICAgICAgKiBAcGFyYW0gX25vZGVSZXNvdXJjZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgc2V0KF9ub2RlUmVzb3VyY2U6IE5vZGVSZXNvdXJjZSk6IHZvaWQge1xyXG4gICAgICAgICAgICAvLyBUT0RPOiBleGFtaW5lLCBpZiB0aGUgc2VyaWFsaXphdGlvbiBzaG91bGQgYmUgc3RvcmVkIGluIHRoZSBOb2RlUmVzb3VyY2UgZm9yIG9wdGltaXphdGlvblxyXG4gICAgICAgICAgICBsZXQgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IFNlcmlhbGl6ZXIuc2VyaWFsaXplKF9ub2RlUmVzb3VyY2UpO1xyXG4gICAgICAgICAgICAvL1NlcmlhbGl6ZXIuZGVzZXJpYWxpemUoc2VyaWFsaXphdGlvbik7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHBhdGggaW4gc2VyaWFsaXphdGlvbikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXNlcmlhbGl6ZShzZXJpYWxpemF0aW9uW3BhdGhdKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuaWRTb3VyY2UgPSBfbm9kZVJlc291cmNlLmlkUmVzb3VyY2U7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoRVZFTlQuTk9ERVJFU09VUkNFX0lOU1RBTlRJQVRFRCkpO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICBleHBvcnQgY2xhc3MgUmF5IHtcclxuICAgICAgICBwdWJsaWMgb3JpZ2luOiBWZWN0b3IzO1xyXG4gICAgICAgIHB1YmxpYyBkaXJlY3Rpb246IFZlY3RvcjM7XHJcbiAgICAgICAgcHVibGljIGxlbmd0aDogbnVtYmVyO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcihfZGlyZWN0aW9uOiBWZWN0b3IzID0gVmVjdG9yMy5aKC0xKSwgX29yaWdpbjogVmVjdG9yMyA9IFZlY3RvcjMuWkVSTygpLCBfbGVuZ3RoOiBudW1iZXIgPSAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3JpZ2luID0gX29yaWdpbjtcclxuICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSBfZGlyZWN0aW9uO1xyXG4gICAgICAgICAgICB0aGlzLmxlbmd0aCA9IF9sZW5ndGg7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICBleHBvcnQgY2xhc3MgUmF5SGl0IHtcclxuICAgICAgICBwdWJsaWMgbm9kZTogTm9kZTtcclxuICAgICAgICBwdWJsaWMgZmFjZTogbnVtYmVyO1xyXG4gICAgICAgIHB1YmxpYyB6QnVmZmVyOiBudW1iZXI7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKF9ub2RlOiBOb2RlID0gbnVsbCwgX2ZhY2U6IG51bWJlciA9IDAsIF96QnVmZmVyOiBudW1iZXIgPSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMubm9kZSA9IF9ub2RlO1xyXG4gICAgICAgICAgICB0aGlzLmZhY2UgPSBfZmFjZTtcclxuICAgICAgICAgICAgdGhpcy56QnVmZmVyID0gX3pCdWZmZXI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIlJlbmRlck9wZXJhdG9yLnRzXCIvPlxyXG5uYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIGludGVyZmFjZSBOb2RlUmVmZXJlbmNlcyB7XHJcbiAgICAgICAgc2hhZGVyOiB0eXBlb2YgU2hhZGVyO1xyXG4gICAgICAgIGNvYXQ6IENvYXQ7XHJcbiAgICAgICAgbWVzaDogTWVzaDtcclxuICAgICAgICAvLyBkb25lVHJhbnNmb3JtVG9Xb3JsZDogYm9vbGVhbjtcclxuICAgIH1cclxuICAgIHR5cGUgTWFwTm9kZVRvTm9kZVJlZmVyZW5jZXMgPSBNYXA8Tm9kZSwgTm9kZVJlZmVyZW5jZXM+O1xyXG5cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgUGlja0J1ZmZlciB7XHJcbiAgICAgICAgbm9kZTogTm9kZTtcclxuICAgICAgICB0ZXh0dXJlOiBXZWJHTFRleHR1cmU7XHJcbiAgICAgICAgZnJhbWVCdWZmZXI6IFdlYkdMRnJhbWVidWZmZXI7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGlzIGNsYXNzIG1hbmFnZXMgdGhlIHJlZmVyZW5jZXMgdG8gcmVuZGVyIGRhdGEgdXNlZCBieSBub2Rlcy5cclxuICAgICAqIE11bHRpcGxlIG5vZGVzIG1heSByZWZlciB0byB0aGUgc2FtZSBkYXRhIHZpYSB0aGVpciByZWZlcmVuY2VzIHRvIHNoYWRlciwgY29hdCBhbmQgbWVzaCBcclxuICAgICAqL1xyXG4gICAgY2xhc3MgUmVmZXJlbmNlPFQ+IHtcclxuICAgICAgICBwcml2YXRlIHJlZmVyZW5jZTogVDtcclxuICAgICAgICBwcml2YXRlIGNvdW50OiBudW1iZXIgPSAwO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcihfcmVmZXJlbmNlOiBUKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVmZXJlbmNlID0gX3JlZmVyZW5jZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWZlcmVuY2UoKTogVCB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlZmVyZW5jZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBpbmNyZWFzZUNvdW50ZXIoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgdGhpcy5jb3VudCsrO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb3VudDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHVibGljIGRlY3JlYXNlQ291bnRlcigpOiBudW1iZXIge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jb3VudCA9PSAwKSB0aHJvdyAobmV3IEVycm9yKFwiTmVnYXRpdmUgcmVmZXJlbmNlIGNvdW50ZXJcIikpO1xyXG4gICAgICAgICAgICB0aGlzLmNvdW50LS07XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvdW50O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE1hbmFnZXMgdGhlIGhhbmRsaW5nIG9mIHRoZSByZXNzb3VyY2VzIHRoYXQgYXJlIGdvaW5nIHRvIGJlIHJlbmRlcmVkIGJ5IFtbUmVuZGVyT3BlcmF0b3JdXS5cclxuICAgICAqIFN0b3JlcyB0aGUgcmVmZXJlbmNlcyB0byB0aGUgc2hhZGVyLCB0aGUgY29hdCBhbmQgdGhlIG1lc2ggdXNlZCBmb3IgZWFjaCBub2RlIHJlZ2lzdGVyZWQuIFxyXG4gICAgICogV2l0aCB0aGVzZSByZWZlcmVuY2VzLCB0aGUgYWxyZWFkeSBidWZmZXJlZCBkYXRhIGlzIHJldHJpZXZlZCB3aGVuIHJlbmRlcmluZy5cclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGFic3RyYWN0IGNsYXNzIFJlbmRlck1hbmFnZXIgZXh0ZW5kcyBSZW5kZXJPcGVyYXRvciB7XHJcbiAgICAgICAgLyoqIFN0b3JlcyByZWZlcmVuY2VzIHRvIHRoZSBjb21waWxlZCBzaGFkZXIgcHJvZ3JhbXMgYW5kIG1ha2VzIHRoZW0gYXZhaWxhYmxlIHZpYSB0aGUgcmVmZXJlbmNlcyB0byBzaGFkZXJzICovXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgcmVuZGVyU2hhZGVyczogTWFwPHR5cGVvZiBTaGFkZXIsIFJlZmVyZW5jZTxSZW5kZXJTaGFkZXI+PiA9IG5ldyBNYXAoKTtcclxuICAgICAgICAvKiogU3RvcmVzIHJlZmVyZW5jZXMgdG8gdGhlIHZlcnRleCBhcnJheSBvYmplY3RzIGFuZCBtYWtlcyB0aGVtIGF2YWlsYWJsZSB2aWEgdGhlIHJlZmVyZW5jZXMgdG8gY29hdHMgKi9cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyByZW5kZXJDb2F0czogTWFwPENvYXQsIFJlZmVyZW5jZTxSZW5kZXJDb2F0Pj4gPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgLyoqIFN0b3JlcyByZWZlcmVuY2VzIHRvIHRoZSB2ZXJ0ZXggYnVmZmVycyBhbmQgbWFrZXMgdGhlbSBhdmFpbGFibGUgdmlhIHRoZSByZWZlcmVuY2VzIHRvIG1lc2hlcyAqL1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHJlbmRlckJ1ZmZlcnM6IE1hcDxNZXNoLCBSZWZlcmVuY2U8UmVuZGVyQnVmZmVycz4+ID0gbmV3IE1hcCgpO1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIG5vZGVzOiBNYXBOb2RlVG9Ob2RlUmVmZXJlbmNlcyA9IG5ldyBNYXAoKTtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyB0aW1lc3RhbXBVcGRhdGU6IG51bWJlcjtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBwaWNrQnVmZmVyczogUGlja0J1ZmZlcltdO1xyXG5cclxuICAgICAgICAvLyAjcmVnaW9uIEFkZGluZ1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlZ2lzdGVyIHRoZSBub2RlIGZvciByZW5kZXJpbmcuIENyZWF0ZSBhIHJlZmVyZW5jZSBmb3IgaXQgYW5kIGluY3JlYXNlIHRoZSBtYXRjaGluZyByZW5kZXItZGF0YSByZWZlcmVuY2VzIG9yIGNyZWF0ZSB0aGVtIGZpcnN0IGlmIG5lY2Vzc2FyeVxyXG4gICAgICAgICAqIEBwYXJhbSBfbm9kZSBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGFkZE5vZGUoX25vZGU6IE5vZGUpOiB2b2lkIHtcclxuICAgICAgICAgICAgaWYgKFJlbmRlck1hbmFnZXIubm9kZXMuZ2V0KF9ub2RlKSlcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIGxldCBjbXBNYXRlcmlhbDogQ29tcG9uZW50TWF0ZXJpYWwgPSBfbm9kZS5nZXRDb21wb25lbnQoQ29tcG9uZW50TWF0ZXJpYWwpO1xyXG4gICAgICAgICAgICBpZiAoIWNtcE1hdGVyaWFsKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgbGV0IHNoYWRlcjogdHlwZW9mIFNoYWRlciA9IGNtcE1hdGVyaWFsLm1hdGVyaWFsLmdldFNoYWRlcigpO1xyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmNyZWF0ZVJlZmVyZW5jZTx0eXBlb2YgU2hhZGVyLCBSZW5kZXJTaGFkZXI+KFJlbmRlck1hbmFnZXIucmVuZGVyU2hhZGVycywgc2hhZGVyLCBSZW5kZXJNYW5hZ2VyLmNyZWF0ZVByb2dyYW0pO1xyXG5cclxuICAgICAgICAgICAgbGV0IGNvYXQ6IENvYXQgPSBjbXBNYXRlcmlhbC5tYXRlcmlhbC5nZXRDb2F0KCk7XHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIuY3JlYXRlUmVmZXJlbmNlPENvYXQsIFJlbmRlckNvYXQ+KFJlbmRlck1hbmFnZXIucmVuZGVyQ29hdHMsIGNvYXQsIFJlbmRlck1hbmFnZXIuY3JlYXRlUGFyYW1ldGVyKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBtZXNoOiBNZXNoID0gKDxDb21wb25lbnRNZXNoPl9ub2RlLmdldENvbXBvbmVudChDb21wb25lbnRNZXNoKSkubWVzaDtcclxuICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5jcmVhdGVSZWZlcmVuY2U8TWVzaCwgUmVuZGVyQnVmZmVycz4oUmVuZGVyTWFuYWdlci5yZW5kZXJCdWZmZXJzLCBtZXNoLCBSZW5kZXJNYW5hZ2VyLmNyZWF0ZUJ1ZmZlcnMpO1xyXG5cclxuICAgICAgICAgICAgbGV0IG5vZGVSZWZlcmVuY2VzOiBOb2RlUmVmZXJlbmNlcyA9IHsgc2hhZGVyOiBzaGFkZXIsIGNvYXQ6IGNvYXQsIG1lc2g6IG1lc2ggfTsgLy8sIGRvbmVUcmFuc2Zvcm1Ub1dvcmxkOiBmYWxzZSB9O1xyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLm5vZGVzLnNldChfbm9kZSwgbm9kZVJlZmVyZW5jZXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVnaXN0ZXIgdGhlIG5vZGUgYW5kIGl0cyB2YWxpZCBzdWNjZXNzb3JzIGluIHRoZSBicmFuY2ggZm9yIHJlbmRlcmluZyB1c2luZyBbW2FkZE5vZGVdXVxyXG4gICAgICAgICAqIEBwYXJhbSBfbm9kZSBcclxuICAgICAgICAgKiBAcmV0dXJucyBmYWxzZSwgaWYgdGhlIGdpdmVuIG5vZGUgaGFzIGEgY3VycmVudCB0aW1lc3RhbXAgdGh1cyBoYXZpbmcgYmVpbmcgcHJvY2Vzc2VkIGR1cmluZyBsYXRlc3QgUmVuZGVyTWFuYWdlci51cGRhdGUgYW5kIG5vIGFkZGl0aW9uIGlzIG5lZWRlZFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgYWRkQnJhbmNoKF9ub2RlOiBOb2RlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIGlmIChfbm9kZS5pc1VwZGF0ZWQoUmVuZGVyTWFuYWdlci50aW1lc3RhbXBVcGRhdGUpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBub2RlIG9mIF9ub2RlLmJyYW5jaClcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gbWF5IGZhaWwgd2hlbiBzb21lIGNvbXBvbmVudHMgYXJlIG1pc3NpbmcuIFRPRE86IGNsZWFudXBcclxuICAgICAgICAgICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmFkZE5vZGUobm9kZSk7XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChfZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIERlYnVnLmxvZyhfZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyAjZW5kcmVnaW9uXHJcblxyXG4gICAgICAgIC8vICNyZWdpb24gUmVtb3ZpbmdcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBVbnJlZ2lzdGVyIHRoZSBub2RlIHNvIHRoYXQgaXQgd29uJ3QgYmUgcmVuZGVyZWQgYW55IG1vcmUuIERlY3JlYXNlIHRoZSByZW5kZXItZGF0YSByZWZlcmVuY2VzIGFuZCBkZWxldGUgdGhlIG5vZGUgcmVmZXJlbmNlLlxyXG4gICAgICAgICAqIEBwYXJhbSBfbm9kZSBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHJlbW92ZU5vZGUoX25vZGU6IE5vZGUpOiB2b2lkIHtcclxuICAgICAgICAgICAgbGV0IG5vZGVSZWZlcmVuY2VzOiBOb2RlUmVmZXJlbmNlcyA9IFJlbmRlck1hbmFnZXIubm9kZXMuZ2V0KF9ub2RlKTtcclxuICAgICAgICAgICAgaWYgKCFub2RlUmVmZXJlbmNlcylcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIucmVtb3ZlUmVmZXJlbmNlPHR5cGVvZiBTaGFkZXIsIFJlbmRlclNoYWRlcj4oUmVuZGVyTWFuYWdlci5yZW5kZXJTaGFkZXJzLCBub2RlUmVmZXJlbmNlcy5zaGFkZXIsIFJlbmRlck1hbmFnZXIuZGVsZXRlUHJvZ3JhbSk7XHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIucmVtb3ZlUmVmZXJlbmNlPENvYXQsIFJlbmRlckNvYXQ+KFJlbmRlck1hbmFnZXIucmVuZGVyQ29hdHMsIG5vZGVSZWZlcmVuY2VzLmNvYXQsIFJlbmRlck1hbmFnZXIuZGVsZXRlUGFyYW1ldGVyKTtcclxuICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5yZW1vdmVSZWZlcmVuY2U8TWVzaCwgUmVuZGVyQnVmZmVycz4oUmVuZGVyTWFuYWdlci5yZW5kZXJCdWZmZXJzLCBub2RlUmVmZXJlbmNlcy5tZXNoLCBSZW5kZXJNYW5hZ2VyLmRlbGV0ZUJ1ZmZlcnMpO1xyXG5cclxuICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5ub2Rlcy5kZWxldGUoX25vZGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVW5yZWdpc3RlciB0aGUgbm9kZSBhbmQgaXRzIHZhbGlkIHN1Y2Nlc3NvcnMgaW4gdGhlIGJyYW5jaCB0byBmcmVlIHJlbmRlcmVyIHJlc291cmNlcy4gVXNlcyBbW3JlbW92ZU5vZGVdXVxyXG4gICAgICAgICAqIEBwYXJhbSBfbm9kZSBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHJlbW92ZUJyYW5jaChfbm9kZTogTm9kZSk6IHZvaWQge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBub2RlIG9mIF9ub2RlLmJyYW5jaClcclxuICAgICAgICAgICAgICAgIFJlbmRlck1hbmFnZXIucmVtb3ZlTm9kZShub2RlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gI2VuZHJlZ2lvblxyXG5cclxuICAgICAgICAvLyAjcmVnaW9uIFVwZGF0aW5nXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVmbGVjdCBjaGFuZ2VzIGluIHRoZSBub2RlIGNvbmNlcm5pbmcgc2hhZGVyLCBjb2F0IGFuZCBtZXNoLCBtYW5hZ2UgdGhlIHJlbmRlci1kYXRhIHJlZmVyZW5jZXMgYWNjb3JkaW5nbHkgYW5kIHVwZGF0ZSB0aGUgbm9kZSByZWZlcmVuY2VzXHJcbiAgICAgICAgICogQHBhcmFtIF9ub2RlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyB1cGRhdGVOb2RlKF9ub2RlOiBOb2RlKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGxldCBub2RlUmVmZXJlbmNlczogTm9kZVJlZmVyZW5jZXMgPSBSZW5kZXJNYW5hZ2VyLm5vZGVzLmdldChfbm9kZSk7XHJcbiAgICAgICAgICAgIGlmICghbm9kZVJlZmVyZW5jZXMpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgICAgICBsZXQgY21wTWF0ZXJpYWw6IENvbXBvbmVudE1hdGVyaWFsID0gX25vZGUuZ2V0Q29tcG9uZW50KENvbXBvbmVudE1hdGVyaWFsKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBzaGFkZXI6IHR5cGVvZiBTaGFkZXIgPSBjbXBNYXRlcmlhbC5tYXRlcmlhbC5nZXRTaGFkZXIoKTtcclxuICAgICAgICAgICAgaWYgKHNoYWRlciAhPT0gbm9kZVJlZmVyZW5jZXMuc2hhZGVyKSB7XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLnJlbW92ZVJlZmVyZW5jZTx0eXBlb2YgU2hhZGVyLCBSZW5kZXJTaGFkZXI+KFJlbmRlck1hbmFnZXIucmVuZGVyU2hhZGVycywgbm9kZVJlZmVyZW5jZXMuc2hhZGVyLCBSZW5kZXJNYW5hZ2VyLmRlbGV0ZVByb2dyYW0pO1xyXG4gICAgICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5jcmVhdGVSZWZlcmVuY2U8dHlwZW9mIFNoYWRlciwgUmVuZGVyU2hhZGVyPihSZW5kZXJNYW5hZ2VyLnJlbmRlclNoYWRlcnMsIHNoYWRlciwgUmVuZGVyTWFuYWdlci5jcmVhdGVQcm9ncmFtKTtcclxuICAgICAgICAgICAgICAgIG5vZGVSZWZlcmVuY2VzLnNoYWRlciA9IHNoYWRlcjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGNvYXQ6IENvYXQgPSBjbXBNYXRlcmlhbC5tYXRlcmlhbC5nZXRDb2F0KCk7XHJcbiAgICAgICAgICAgIGlmIChjb2F0ICE9PSBub2RlUmVmZXJlbmNlcy5jb2F0KSB7XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLnJlbW92ZVJlZmVyZW5jZTxDb2F0LCBSZW5kZXJDb2F0PihSZW5kZXJNYW5hZ2VyLnJlbmRlckNvYXRzLCBub2RlUmVmZXJlbmNlcy5jb2F0LCBSZW5kZXJNYW5hZ2VyLmRlbGV0ZVBhcmFtZXRlcik7XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmNyZWF0ZVJlZmVyZW5jZTxDb2F0LCBSZW5kZXJDb2F0PihSZW5kZXJNYW5hZ2VyLnJlbmRlckNvYXRzLCBjb2F0LCBSZW5kZXJNYW5hZ2VyLmNyZWF0ZVBhcmFtZXRlcik7XHJcbiAgICAgICAgICAgICAgICBub2RlUmVmZXJlbmNlcy5jb2F0ID0gY29hdDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IG1lc2g6IE1lc2ggPSAoPENvbXBvbmVudE1lc2g+KF9ub2RlLmdldENvbXBvbmVudChDb21wb25lbnRNZXNoKSkpLm1lc2g7XHJcbiAgICAgICAgICAgIGlmIChtZXNoICE9PSBub2RlUmVmZXJlbmNlcy5tZXNoKSB7XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLnJlbW92ZVJlZmVyZW5jZTxNZXNoLCBSZW5kZXJCdWZmZXJzPihSZW5kZXJNYW5hZ2VyLnJlbmRlckJ1ZmZlcnMsIG5vZGVSZWZlcmVuY2VzLm1lc2gsIFJlbmRlck1hbmFnZXIuZGVsZXRlQnVmZmVycyk7XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmNyZWF0ZVJlZmVyZW5jZTxNZXNoLCBSZW5kZXJCdWZmZXJzPihSZW5kZXJNYW5hZ2VyLnJlbmRlckJ1ZmZlcnMsIG1lc2gsIFJlbmRlck1hbmFnZXIuY3JlYXRlQnVmZmVycyk7XHJcbiAgICAgICAgICAgICAgICBub2RlUmVmZXJlbmNlcy5tZXNoID0gbWVzaDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVXBkYXRlIHRoZSBub2RlIGFuZCBpdHMgdmFsaWQgc3VjY2Vzc29ycyBpbiB0aGUgYnJhbmNoIHVzaW5nIFtbdXBkYXRlTm9kZV1dXHJcbiAgICAgICAgICogQHBhcmFtIF9ub2RlIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdXBkYXRlQnJhbmNoKF9ub2RlOiBOb2RlKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2YgX25vZGUuYnJhbmNoKVxyXG4gICAgICAgICAgICAgICAgUmVuZGVyTWFuYWdlci51cGRhdGVOb2RlKG5vZGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyAjZW5kcmVnaW9uXHJcblxyXG4gICAgICAgIC8vICNyZWdpb24gTGlnaHRzXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVmlld3BvcnRzIGNvbGxlY3QgdGhlIGxpZ2h0cyByZWxldmFudCB0byB0aGUgYnJhbmNoIHRvIHJlbmRlciBhbmQgY2FsbHMgc2V0TGlnaHRzIHRvIHBhc3MgdGhlIGNvbGxlY3Rpb24uICBcclxuICAgICAgICAgKiBSZW5kZXJNYW5hZ2VyIHBhc3NlcyBpdCBvbiB0byBhbGwgc2hhZGVycyB1c2VkIHRoYXQgY2FuIHByb2Nlc3MgbGlnaHRcclxuICAgICAgICAgKiBAcGFyYW0gX2xpZ2h0c1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgc2V0TGlnaHRzKF9saWdodHM6IE1hcExpZ2h0VHlwZVRvTGlnaHRMaXN0KTogdm9pZCB7XHJcbiAgICAgICAgICAgIC8vIGxldCByZW5kZXJMaWdodHM6IFJlbmRlckxpZ2h0cyA9IFJlbmRlck1hbmFnZXIuY3JlYXRlUmVuZGVyTGlnaHRzKF9saWdodHMpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBlbnRyeSBvZiBSZW5kZXJNYW5hZ2VyLnJlbmRlclNoYWRlcnMpIHtcclxuICAgICAgICAgICAgICAgIGxldCByZW5kZXJTaGFkZXI6IFJlbmRlclNoYWRlciA9IGVudHJ5WzFdLmdldFJlZmVyZW5jZSgpO1xyXG4gICAgICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5zZXRMaWdodHNJblNoYWRlcihyZW5kZXJTaGFkZXIsIF9saWdodHMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIGRlYnVnZ2VyO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyAjZW5kcmVnaW9uXHJcblxyXG4gICAgICAgIC8vICNyZWdpb24gUmVuZGVyaW5nXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVXBkYXRlIGFsbCByZW5kZXIgZGF0YS4gQWZ0ZXIgUmVuZGVyTWFuYWdlciwgbXVsdGlwbGUgdmlld3BvcnRzIGNhbiByZW5kZXIgdGhlaXIgYXNzb2NpYXRlZCBkYXRhIHdpdGhvdXQgdXBkYXRpbmcgdGhlIHNhbWUgZGF0YSBtdWx0aXBsZSB0aW1lc1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdXBkYXRlKCk6IHZvaWQge1xyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLnRpbWVzdGFtcFVwZGF0ZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLnJlY2FsY3VsYXRlQWxsTm9kZVRyYW5zZm9ybXMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENsZWFyIHRoZSBvZmZzY3JlZW4gcmVuZGVyYnVmZmVyIHdpdGggdGhlIGdpdmVuIFtbQ29sb3JdXVxyXG4gICAgICAgICAqIEBwYXJhbSBfY29sb3IgXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBjbGVhcihfY29sb3I6IENvbG9yID0gbnVsbCk6IHZvaWQge1xyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmNyYzMuY2xlYXJDb2xvcihfY29sb3IuciwgX2NvbG9yLmcsIF9jb2xvci5iLCBfY29sb3IuYSk7XHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIuY3JjMy5jbGVhcihXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkNPTE9SX0JVRkZFUl9CSVQgfCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkRFUFRIX0JVRkZFUl9CSVQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVzZXQgdGhlIG9mZnNjcmVlbiBmcmFtZWJ1ZmZlciB0byB0aGUgb3JpZ2luYWwgUmVuZGVyaW5nQ29udGV4dFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgcmVzZXRGcmFtZUJ1ZmZlcihfY29sb3I6IENvbG9yID0gbnVsbCk6IHZvaWQge1xyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmNyYzMuYmluZEZyYW1lYnVmZmVyKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuRlJBTUVCVUZGRVIsIG51bGwpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRHJhd3MgdGhlIGJyYW5jaCBzdGFydGluZyB3aXRoIHRoZSBnaXZlbiBbW05vZGVdXSB1c2luZyB0aGUgY2FtZXJhIGdpdmVuIFtbQ29tcG9uZW50Q2FtZXJhXV0uXHJcbiAgICAgICAgICogQHBhcmFtIF9ub2RlIFxyXG4gICAgICAgICAqIEBwYXJhbSBfY21wQ2FtZXJhIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZHJhd0JyYW5jaChfbm9kZTogTm9kZSwgX2NtcENhbWVyYTogQ29tcG9uZW50Q2FtZXJhLCBfZHJhd05vZGU6IEZ1bmN0aW9uID0gUmVuZGVyTWFuYWdlci5kcmF3Tm9kZSk6IHZvaWQgeyAvLyBUT0RPOiBzZWUgaWYgdGhpcmQgcGFyYW1ldGVyIF93b3JsZD86IE1hdHJpeDR4NCB3b3VsZCBiZSB1c2VmdWxsXHJcbiAgICAgICAgICAgIGlmIChfZHJhd05vZGUgPT0gUmVuZGVyTWFuYWdlci5kcmF3Tm9kZSlcclxuICAgICAgICAgICAgICAgIFJlbmRlck1hbmFnZXIucmVzZXRGcmFtZUJ1ZmZlcigpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGZpbmFsVHJhbnNmb3JtOiBNYXRyaXg0eDQ7XHJcblxyXG4gICAgICAgICAgICBsZXQgY21wTWVzaDogQ29tcG9uZW50TWVzaCA9IF9ub2RlLmdldENvbXBvbmVudChDb21wb25lbnRNZXNoKTtcclxuICAgICAgICAgICAgaWYgKGNtcE1lc2gpXHJcbiAgICAgICAgICAgICAgICBmaW5hbFRyYW5zZm9ybSA9IE1hdHJpeDR4NC5NVUxUSVBMSUNBVElPTihfbm9kZS5tdHhXb3JsZCwgY21wTWVzaC5waXZvdCk7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIGZpbmFsVHJhbnNmb3JtID0gX25vZGUubXR4V29ybGQ7IC8vIGNhdXRpb24sIFJlbmRlck1hbmFnZXIgaXMgYSByZWZlcmVuY2UuLi5cclxuXHJcbiAgICAgICAgICAgIC8vIG11bHRpcGx5IGNhbWVyYSBtYXRyaXhcclxuICAgICAgICAgICAgbGV0IHByb2plY3Rpb246IE1hdHJpeDR4NCA9IE1hdHJpeDR4NC5NVUxUSVBMSUNBVElPTihfY21wQ2FtZXJhLlZpZXdQcm9qZWN0aW9uTWF0cml4LCBmaW5hbFRyYW5zZm9ybSk7XHJcblxyXG4gICAgICAgICAgICBfZHJhd05vZGUoX25vZGUsIGZpbmFsVHJhbnNmb3JtLCBwcm9qZWN0aW9uKTtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IG5hbWUgaW4gX25vZGUuZ2V0Q2hpbGRyZW4oKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNoaWxkTm9kZTogTm9kZSA9IF9ub2RlLmdldENoaWxkcmVuKClbbmFtZV07XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmRyYXdCcmFuY2goY2hpbGROb2RlLCBfY21wQ2FtZXJhLCBfZHJhd05vZGUpOyAvLywgd29ybGQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBSZWN5Y2xlci5zdG9yZShwcm9qZWN0aW9uKTtcclxuICAgICAgICAgICAgaWYgKGZpbmFsVHJhbnNmb3JtICE9IF9ub2RlLm10eFdvcmxkKVxyXG4gICAgICAgICAgICAgICAgUmVjeWNsZXIuc3RvcmUoZmluYWxUcmFuc2Zvcm0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8jcmVnaW9uIFJheUNhc3QgJiBQaWNraW5nXHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERyYXdzIHRoZSBicmFuY2ggZm9yIFJheUNhc3Rpbmcgc3RhcnRpbmcgd2l0aCB0aGUgZ2l2ZW4gW1tOb2RlXV0gdXNpbmcgdGhlIGNhbWVyYSBnaXZlbiBbW0NvbXBvbmVudENhbWVyYV1dLlxyXG4gICAgICAgICAqIEBwYXJhbSBfbm9kZSBcclxuICAgICAgICAgKiBAcGFyYW0gX2NtcENhbWVyYSBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGRyYXdCcmFuY2hGb3JSYXlDYXN0KF9ub2RlOiBOb2RlLCBfY21wQ2FtZXJhOiBDb21wb25lbnRDYW1lcmEpOiBQaWNrQnVmZmVyW10geyAvLyBUT0RPOiBzZWUgaWYgdGhpcmQgcGFyYW1ldGVyIF93b3JsZD86IE1hdHJpeDR4NCB3b3VsZCBiZSB1c2VmdWxsXHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIucGlja0J1ZmZlcnMgPSBbXTtcclxuICAgICAgICAgICAgaWYgKCFSZW5kZXJNYW5hZ2VyLnJlbmRlclNoYWRlcnMuZ2V0KFNoYWRlclJheUNhc3QpKVxyXG4gICAgICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5jcmVhdGVSZWZlcmVuY2U8dHlwZW9mIFNoYWRlciwgUmVuZGVyU2hhZGVyPihSZW5kZXJNYW5hZ2VyLnJlbmRlclNoYWRlcnMsIFNoYWRlclJheUNhc3QsIFJlbmRlck1hbmFnZXIuY3JlYXRlUHJvZ3JhbSk7XHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIuZHJhd0JyYW5jaChfbm9kZSwgX2NtcENhbWVyYSwgUmVuZGVyTWFuYWdlci5kcmF3Tm9kZUZvclJheUNhc3QpO1xyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLnJlc2V0RnJhbWVCdWZmZXIoKTtcclxuICAgICAgICAgICAgcmV0dXJuIFJlbmRlck1hbmFnZXIucGlja0J1ZmZlcnM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHBpY2tOb2RlQXQoX3BvczogVmVjdG9yMiwgX3BpY2tCdWZmZXJzOiBQaWNrQnVmZmVyW10sIF9yZWN0OiBSZWN0YW5nbGUpOiBSYXlIaXRbXSB7XHJcbiAgICAgICAgICAgIGxldCBoaXRzOiBSYXlIaXRbXSA9IFtdO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgZm9yIChsZXQgcGlja0J1ZmZlciBvZiBfcGlja0J1ZmZlcnMpIHtcclxuICAgICAgICAgICAgICAgIFJlbmRlck1hbmFnZXIuY3JjMy5iaW5kRnJhbWVidWZmZXIoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5GUkFNRUJVRkZFUiwgcGlja0J1ZmZlci5mcmFtZUJ1ZmZlcik7XHJcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBpbnN0ZWFkIG9mIHJlYWRpbmcgYWxsIGRhdGEgYW5kIGFmdGVyd2FyZHMgcGljayB0aGUgcGl4ZWwsIHJlYWQgb25seSB0aGUgcGl4ZWwhXHJcbiAgICAgICAgICAgICAgICBsZXQgZGF0YTogVWludDhBcnJheSA9IG5ldyBVaW50OEFycmF5KF9yZWN0LndpZHRoICogX3JlY3QuaGVpZ2h0ICogNCk7XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmNyYzMucmVhZFBpeGVscygwLCAwLCBfcmVjdC53aWR0aCwgX3JlY3QuaGVpZ2h0LCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlJHQkEsIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVU5TSUdORURfQllURSwgZGF0YSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGl4ZWw6IG51bWJlciA9IF9wb3MueCArIF9yZWN0LndpZHRoICogX3Bvcy55O1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCB6QnVmZmVyOiBudW1iZXIgPSBkYXRhWzQgKiBwaXhlbCArIDJdICsgZGF0YVs0ICogcGl4ZWwgKyAzXSAvIDI1NjtcclxuICAgICAgICAgICAgICAgIGxldCBoaXQ6IFJheUhpdCA9IG5ldyBSYXlIaXQocGlja0J1ZmZlci5ub2RlLCAwLCB6QnVmZmVyKTtcclxuXHJcbiAgICAgICAgICAgICAgICBoaXRzLnB1c2goaGl0KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGhpdHM7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgZHJhd05vZGUoX25vZGU6IE5vZGUsIF9maW5hbFRyYW5zZm9ybTogTWF0cml4NHg0LCBfcHJvamVjdGlvbjogTWF0cml4NHg0KTogdm9pZCB7XHJcbiAgICAgICAgICAgIGxldCByZWZlcmVuY2VzOiBOb2RlUmVmZXJlbmNlcyA9IFJlbmRlck1hbmFnZXIubm9kZXMuZ2V0KF9ub2RlKTtcclxuICAgICAgICAgICAgaWYgKCFyZWZlcmVuY2VzKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuOyAvLyBUT0RPOiBkZWFsIHdpdGggcGFydGlhbCByZWZlcmVuY2VzXHJcblxyXG4gICAgICAgICAgICBsZXQgYnVmZmVySW5mbzogUmVuZGVyQnVmZmVycyA9IFJlbmRlck1hbmFnZXIucmVuZGVyQnVmZmVycy5nZXQocmVmZXJlbmNlcy5tZXNoKS5nZXRSZWZlcmVuY2UoKTtcclxuICAgICAgICAgICAgbGV0IGNvYXRJbmZvOiBSZW5kZXJDb2F0ID0gUmVuZGVyTWFuYWdlci5yZW5kZXJDb2F0cy5nZXQocmVmZXJlbmNlcy5jb2F0KS5nZXRSZWZlcmVuY2UoKTtcclxuICAgICAgICAgICAgbGV0IHNoYWRlckluZm86IFJlbmRlclNoYWRlciA9IFJlbmRlck1hbmFnZXIucmVuZGVyU2hhZGVycy5nZXQocmVmZXJlbmNlcy5zaGFkZXIpLmdldFJlZmVyZW5jZSgpO1xyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmRyYXcoc2hhZGVySW5mbywgYnVmZmVySW5mbywgY29hdEluZm8sIF9maW5hbFRyYW5zZm9ybSwgX3Byb2plY3Rpb24pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgZHJhd05vZGVGb3JSYXlDYXN0KF9ub2RlOiBOb2RlLCBfZmluYWxUcmFuc2Zvcm06IE1hdHJpeDR4NCwgX3Byb2plY3Rpb246IE1hdHJpeDR4NCk6IHZvaWQgeyAvLyBjcmVhdGUgVGV4dHVyZSB0byByZW5kZXIgdG8sIGludC1yZ2JhXHJcbiAgICAgICAgICAgIC8vIFRPRE86IGxvb2sgaW50byBTU0JPcyFcclxuICAgICAgICAgICAgbGV0IHRhcmdldDogV2ViR0xUZXh0dXJlID0gUmVuZGVyTWFuYWdlci5nZXRSYXlDYXN0VGV4dHVyZSgpO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgZnJhbWVidWZmZXI6IFdlYkdMRnJhbWVidWZmZXIgPSBSZW5kZXJNYW5hZ2VyLmNyYzMuY3JlYXRlRnJhbWVidWZmZXIoKTtcclxuICAgICAgICAgICAgLy8gcmVuZGVyIHRvIG91ciB0YXJnZXRUZXh0dXJlIGJ5IGJpbmRpbmcgdGhlIGZyYW1lYnVmZmVyXHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIuY3JjMy5iaW5kRnJhbWVidWZmZXIoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5GUkFNRUJVRkZFUiwgZnJhbWVidWZmZXIpO1xyXG4gICAgICAgICAgICAvLyBhdHRhY2ggdGhlIHRleHR1cmUgYXMgdGhlIGZpcnN0IGNvbG9yIGF0dGFjaG1lbnRcclxuICAgICAgICAgICAgY29uc3QgYXR0YWNobWVudFBvaW50OiBudW1iZXIgPSBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkNPTE9SX0FUVEFDSE1FTlQwO1xyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmNyYzMuZnJhbWVidWZmZXJUZXh0dXJlMkQoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5GUkFNRUJVRkZFUiwgYXR0YWNobWVudFBvaW50LCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlRFWFRVUkVfMkQsIHRhcmdldCwgMCk7XHJcblxyXG4gICAgICAgICAgICAvLyBzZXQgcmVuZGVyIHRhcmdldFxyXG5cclxuICAgICAgICAgICAgbGV0IHJlZmVyZW5jZXM6IE5vZGVSZWZlcmVuY2VzID0gUmVuZGVyTWFuYWdlci5ub2Rlcy5nZXQoX25vZGUpO1xyXG4gICAgICAgICAgICBpZiAoIXJlZmVyZW5jZXMpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47IC8vIFRPRE86IGRlYWwgd2l0aCBwYXJ0aWFsIHJlZmVyZW5jZXNcclxuXHJcbiAgICAgICAgICAgIGxldCBwaWNrQnVmZmVyOiBQaWNrQnVmZmVyID0ge25vZGU6IF9ub2RlLCB0ZXh0dXJlOiB0YXJnZXQsIGZyYW1lQnVmZmVyOiBmcmFtZWJ1ZmZlcn07XHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIucGlja0J1ZmZlcnMucHVzaChwaWNrQnVmZmVyKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBidWZmZXJJbmZvOiBSZW5kZXJCdWZmZXJzID0gUmVuZGVyTWFuYWdlci5yZW5kZXJCdWZmZXJzLmdldChyZWZlcmVuY2VzLm1lc2gpLmdldFJlZmVyZW5jZSgpO1xyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmRyYXdGb3JSYXlDYXN0KFJlbmRlck1hbmFnZXIucGlja0J1ZmZlcnMubGVuZ3RoLCBidWZmZXJJbmZvLCBfZmluYWxUcmFuc2Zvcm0sIF9wcm9qZWN0aW9uKTtcclxuICAgICAgICAgICAgLy8gbWFrZSB0ZXh0dXJlIGF2YWlsYWJsZSB0byBvbnNjcmVlbi1kaXNwbGF5XHJcbiAgICAgICAgICAgIC8vIElERUE6IEl0ZXJhdGUgb3ZlciB0ZXh0dXJlcywgY29sbGVjdCBkYXRhIGlmIHogaW5kaWNhdGVzIGhpdCwgc29ydCBieSB6XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBnZXRSYXlDYXN0VGV4dHVyZSgpOiBXZWJHTFRleHR1cmUge1xyXG4gICAgICAgICAgICAvLyBjcmVhdGUgdG8gcmVuZGVyIHRvXHJcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldFRleHR1cmVXaWR0aDogbnVtYmVyID0gUmVuZGVyTWFuYWdlci5nZXRWaWV3cG9ydFJlY3RhbmdsZSgpLndpZHRoO1xyXG4gICAgICAgICAgICBjb25zdCB0YXJnZXRUZXh0dXJlSGVpZ2h0OiBudW1iZXIgPSBSZW5kZXJNYW5hZ2VyLmdldFZpZXdwb3J0UmVjdGFuZ2xlKCkuaGVpZ2h0O1xyXG4gICAgICAgICAgICBjb25zdCB0YXJnZXRUZXh0dXJlOiBXZWJHTFRleHR1cmUgPSBSZW5kZXJNYW5hZ2VyLmNyYzMuY3JlYXRlVGV4dHVyZSgpO1xyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmNyYzMuYmluZFRleHR1cmUoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5URVhUVVJFXzJELCB0YXJnZXRUZXh0dXJlKTtcclxuXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGludGVybmFsRm9ybWF0OiBudW1iZXIgPSBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlJHQkE4O1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZm9ybWF0OiBudW1iZXIgPSBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlJHQkE7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0eXBlOiBudW1iZXIgPSBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlVOU0lHTkVEX0JZVEU7XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmNyYzMudGV4SW1hZ2UyRChcclxuICAgICAgICAgICAgICAgICAgICBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlRFWFRVUkVfMkQsIDAsIGludGVybmFsRm9ybWF0LCB0YXJnZXRUZXh0dXJlV2lkdGgsIHRhcmdldFRleHR1cmVIZWlnaHQsIDAsIGZvcm1hdCwgdHlwZSwgbnVsbFxyXG4gICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBzZXQgdGhlIGZpbHRlcmluZyBzbyB3ZSBkb24ndCBuZWVkIG1pcHNcclxuICAgICAgICAgICAgICAgIFJlbmRlck1hbmFnZXIuY3JjMy50ZXhQYXJhbWV0ZXJpKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVEVYVFVSRV8yRCwgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5URVhUVVJFX01JTl9GSUxURVIsIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuTElORUFSKTtcclxuICAgICAgICAgICAgICAgIFJlbmRlck1hbmFnZXIuY3JjMy50ZXhQYXJhbWV0ZXJpKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVEVYVFVSRV8yRCwgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5URVhUVVJFX1dSQVBfUywgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5DTEFNUF9UT19FREdFKTtcclxuICAgICAgICAgICAgICAgIFJlbmRlck1hbmFnZXIuY3JjMy50ZXhQYXJhbWV0ZXJpKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVEVYVFVSRV8yRCwgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5URVhUVVJFX1dSQVBfVCwgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5DTEFNUF9UT19FREdFKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRhcmdldFRleHR1cmU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vI2VuZHJlZ2lvblxyXG5cclxuICAgICAgICAvLyNyZWdpb24gVHJhbnNmb3JtYXRpb24gb2YgYnJhbmNoXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVjYWxjdWxhdGUgdGhlIHdvcmxkIG1hdHJpeCBvZiBhbGwgcmVnaXN0ZXJlZCBub2RlcyByZXNwZWN0aW5nIHRoZWlyIGhpZXJhcmNoaWNhbCByZWxhdGlvbi5cclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyByZWNhbGN1bGF0ZUFsbE5vZGVUcmFuc2Zvcm1zKCk6IHZvaWQge1xyXG4gICAgICAgICAgICAvLyBpbm5lciBmdW5jdGlvbiB0byBiZSBjYWxsZWQgaW4gYSBmb3IgZWFjaCBub2RlIGF0IHRoZSBib3R0b20gb2YgUmVuZGVyTWFuYWdlciBmdW5jdGlvblxyXG4gICAgICAgICAgICAvLyBmdW5jdGlvbiBtYXJrTm9kZVRvQmVUcmFuc2Zvcm1lZChfbm9kZVJlZmVyZW5jZXM6IE5vZGVSZWZlcmVuY2VzLCBfbm9kZTogTm9kZSwgX21hcDogTWFwTm9kZVRvTm9kZVJlZmVyZW5jZXMpOiB2b2lkIHtcclxuICAgICAgICAgICAgLy8gICAgIF9ub2RlUmVmZXJlbmNlcy5kb25lVHJhbnNmb3JtVG9Xb3JsZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgICAgICAvLyBpbm5lciBmdW5jdGlvbiB0byBiZSBjYWxsZWQgaW4gYSBmb3IgZWFjaCBub2RlIGF0IHRoZSBib3R0b20gb2YgUmVuZGVyTWFuYWdlciBmdW5jdGlvblxyXG4gICAgICAgICAgICBsZXQgcmVjYWxjdWxhdGVCcmFuY2hDb250YWluaW5nTm9kZTogKF9yOiBOb2RlUmVmZXJlbmNlcywgX246IE5vZGUsIF9tOiBNYXBOb2RlVG9Ob2RlUmVmZXJlbmNlcykgPT4gdm9pZCA9IChfbm9kZVJlZmVyZW5jZXM6IE5vZGVSZWZlcmVuY2VzLCBfbm9kZTogTm9kZSwgX21hcDogTWFwTm9kZVRvTm9kZVJlZmVyZW5jZXMpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIGZpbmQgdXBwZXJtb3N0IGFuY2VzdG9yIG5vdCByZWNhbGN1bGF0ZWQgeWV0XHJcbiAgICAgICAgICAgICAgICBsZXQgYW5jZXN0b3I6IE5vZGUgPSBfbm9kZTtcclxuICAgICAgICAgICAgICAgIGxldCBwYXJlbnQ6IE5vZGU7XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudCA9IGFuY2VzdG9yLmdldFBhcmVudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghcGFyZW50KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBpZiAoX25vZGUuaXNVcGRhdGVkKFJlbmRlck1hbmFnZXIudGltZXN0YW1wVXBkYXRlKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgYW5jZXN0b3IgPSBwYXJlbnQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBjaGVjayBpZiBub2RlcyB3aXRob3V0IG1lc2hlcyBtdXN0IGJlIHJlZ2lzdGVyZWRcclxuXHJcbiAgICAgICAgICAgICAgICAvLyB1c2UgdGhlIGFuY2VzdG9ycyBwYXJlbnQgd29ybGQgbWF0cml4IHRvIHN0YXJ0IHdpdGgsIG9yIGlkZW50aXR5IGlmIG5vIHBhcmVudCBleGlzdHMgb3IgaXQncyBtaXNzaW5nIGEgQ29tcG9uZW5UcmFuc2Zvcm1cclxuICAgICAgICAgICAgICAgIGxldCBtYXRyaXg6IE1hdHJpeDR4NCA9IE1hdHJpeDR4NC5JREVOVElUWTtcclxuICAgICAgICAgICAgICAgIGlmIChwYXJlbnQpXHJcbiAgICAgICAgICAgICAgICAgICAgbWF0cml4ID0gcGFyZW50Lm10eFdvcmxkO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIHN0YXJ0IHJlY3Vyc2l2ZSByZWNhbGN1bGF0aW9uIG9mIHRoZSB3aG9sZSBicmFuY2ggc3RhcnRpbmcgZnJvbSB0aGUgYW5jZXN0b3IgZm91bmRcclxuICAgICAgICAgICAgICAgIFJlbmRlck1hbmFnZXIucmVjYWxjdWxhdGVUcmFuc2Zvcm1zT2ZOb2RlQW5kQ2hpbGRyZW4oYW5jZXN0b3IsIG1hdHJpeCk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvLyBjYWxsIHRoZSBmdW5jdGlvbnMgYWJvdmUgZm9yIGVhY2ggcmVnaXN0ZXJlZCBub2RlXHJcbiAgICAgICAgICAgIC8vIFJlbmRlck1hbmFnZXIubm9kZXMuZm9yRWFjaChtYXJrTm9kZVRvQmVUcmFuc2Zvcm1lZCk7XHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIubm9kZXMuZm9yRWFjaChyZWNhbGN1bGF0ZUJyYW5jaENvbnRhaW5pbmdOb2RlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlY3Vyc2l2ZSBtZXRob2QgcmVjZWl2aW5nIGEgY2hpbGRub2RlIGFuZCBpdHMgcGFyZW50cyB1cGRhdGVkIHdvcmxkIHRyYW5zZm9ybS4gIFxyXG4gICAgICAgICAqIElmIHRoZSBjaGlsZG5vZGUgb3ducyBhIENvbXBvbmVudFRyYW5zZm9ybSwgaXRzIHdvcmxkbWF0cml4IGlzIHJlY2FsY3VsYXRlZCBhbmQgcGFzc2VkIG9uIHRvIGl0cyBjaGlsZHJlbiwgb3RoZXJ3aXNlIGl0cyBwYXJlbnRzIG1hdHJpeFxyXG4gICAgICAgICAqIEBwYXJhbSBfbm9kZSBcclxuICAgICAgICAgKiBAcGFyYW0gX3dvcmxkIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHJlY2FsY3VsYXRlVHJhbnNmb3Jtc09mTm9kZUFuZENoaWxkcmVuKF9ub2RlOiBOb2RlLCBfd29ybGQ6IE1hdHJpeDR4NCk6IHZvaWQge1xyXG4gICAgICAgICAgICBsZXQgd29ybGQ6IE1hdHJpeDR4NCA9IF93b3JsZDtcclxuICAgICAgICAgICAgbGV0IGNtcFRyYW5zZm9ybTogQ29tcG9uZW50VHJhbnNmb3JtID0gX25vZGUuY21wVHJhbnNmb3JtO1xyXG4gICAgICAgICAgICBpZiAoY21wVHJhbnNmb3JtKVxyXG4gICAgICAgICAgICAgICAgd29ybGQgPSBNYXRyaXg0eDQuTVVMVElQTElDQVRJT04oX3dvcmxkLCBjbXBUcmFuc2Zvcm0ubG9jYWwpO1xyXG5cclxuICAgICAgICAgICAgX25vZGUubXR4V29ybGQgPSB3b3JsZDtcclxuICAgICAgICAgICAgX25vZGUudGltZXN0YW1wVXBkYXRlID0gUmVuZGVyTWFuYWdlci50aW1lc3RhbXBVcGRhdGU7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBfbm9kZS5nZXRDaGlsZHJlbigpKSB7XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLnJlY2FsY3VsYXRlVHJhbnNmb3Jtc09mTm9kZUFuZENoaWxkcmVuKGNoaWxkLCB3b3JsZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gI2VuZHJlZ2lvblxyXG5cclxuICAgICAgICAvLyAjcmVnaW9uIE1hbmFnZSByZWZlcmVuY2VzIHRvIHJlbmRlciBkYXRhXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVtb3ZlcyBhIHJlZmVyZW5jZSB0byBhIHByb2dyYW0sIHBhcmFtZXRlciBvciBidWZmZXIgYnkgZGVjcmVhc2luZyBpdHMgcmVmZXJlbmNlIGNvdW50ZXIgYW5kIGRlbGV0aW5nIGl0LCBpZiB0aGUgY291bnRlciByZWFjaGVzIDBcclxuICAgICAgICAgKiBAcGFyYW0gX2luIFxyXG4gICAgICAgICAqIEBwYXJhbSBfa2V5IFxyXG4gICAgICAgICAqIEBwYXJhbSBfZGVsZXRvciBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyByZW1vdmVSZWZlcmVuY2U8S2V5VHlwZSwgUmVmZXJlbmNlVHlwZT4oX2luOiBNYXA8S2V5VHlwZSwgUmVmZXJlbmNlPFJlZmVyZW5jZVR5cGU+PiwgX2tleTogS2V5VHlwZSwgX2RlbGV0b3I6IEZ1bmN0aW9uKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGxldCByZWZlcmVuY2U6IFJlZmVyZW5jZTxSZWZlcmVuY2VUeXBlPjtcclxuICAgICAgICAgICAgcmVmZXJlbmNlID0gX2luLmdldChfa2V5KTtcclxuICAgICAgICAgICAgaWYgKHJlZmVyZW5jZS5kZWNyZWFzZUNvdW50ZXIoKSA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBUaGUgZm9sbG93aW5nIGRlbGV0aW9ucyBtYXkgYmUgYW4gb3B0aW1pemF0aW9uLCBub3QgbmVjZXNzYXJ5IHRvIHN0YXJ0IHdpdGggYW5kIG1heWJlIGNvdW50ZXJwcm9kdWN0aXZlLlxyXG4gICAgICAgICAgICAgICAgLy8gSWYgZGF0YSBzaG91bGQgYmUgdXNlZCBsYXRlciBhZ2FpbiwgaXQgbXVzdCB0aGVuIGJlIHJlY29uc3RydWN0ZWQuLi5cclxuICAgICAgICAgICAgICAgIF9kZWxldG9yKHJlZmVyZW5jZS5nZXRSZWZlcmVuY2UoKSk7XHJcbiAgICAgICAgICAgICAgICBfaW4uZGVsZXRlKF9rZXkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBJbmNyZWFzZXMgdGhlIGNvdW50ZXIgb2YgdGhlIHJlZmVyZW5jZSB0byBhIHByb2dyYW0sIHBhcmFtZXRlciBvciBidWZmZXIuIENyZWF0ZXMgdGhlIHJlZmVyZW5jZSwgaWYgaXQncyBub3QgZXhpc3RlbnQuXHJcbiAgICAgICAgICogQHBhcmFtIF9pbiBcclxuICAgICAgICAgKiBAcGFyYW0gX2tleSBcclxuICAgICAgICAgKiBAcGFyYW0gX2NyZWF0b3IgXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgY3JlYXRlUmVmZXJlbmNlPEtleVR5cGUsIFJlZmVyZW5jZVR5cGU+KF9pbjogTWFwPEtleVR5cGUsIFJlZmVyZW5jZTxSZWZlcmVuY2VUeXBlPj4sIF9rZXk6IEtleVR5cGUsIF9jcmVhdG9yOiBGdW5jdGlvbik6IHZvaWQge1xyXG4gICAgICAgICAgICBsZXQgcmVmZXJlbmNlOiBSZWZlcmVuY2U8UmVmZXJlbmNlVHlwZT47XHJcbiAgICAgICAgICAgIHJlZmVyZW5jZSA9IF9pbi5nZXQoX2tleSk7XHJcbiAgICAgICAgICAgIGlmIChyZWZlcmVuY2UpXHJcbiAgICAgICAgICAgICAgICByZWZlcmVuY2UuaW5jcmVhc2VDb3VudGVyKCk7XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNvbnRlbnQ6IFJlZmVyZW5jZVR5cGUgPSBfY3JlYXRvcihfa2V5KTtcclxuICAgICAgICAgICAgICAgIHJlZmVyZW5jZSA9IG5ldyBSZWZlcmVuY2U8UmVmZXJlbmNlVHlwZT4oY29udGVudCk7XHJcbiAgICAgICAgICAgICAgICByZWZlcmVuY2UuaW5jcmVhc2VDb3VudGVyKCk7XHJcbiAgICAgICAgICAgICAgICBfaW4uc2V0KF9rZXksIHJlZmVyZW5jZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gI2VuZHJlZ2lvblxyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL0NvYXQvQ29hdC50c1wiLz5cclxubmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIFN0YXRpYyBzdXBlcmNsYXNzIGZvciB0aGUgcmVwcmVzZW50YXRpb24gb2YgV2ViR2wgc2hhZGVycHJvZ3JhbXMuIFxyXG4gICAgICogQGF1dGhvcnMgSmFzY2hhIEthcmFnw7ZsLCBIRlUsIDIwMTkgfCBKaXJrYSBEZWxsJ09yby1GcmllZGwsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcblxyXG4gICAgIC8vIFRPRE86IGRlZmluZSBhdHRyaWJ1dGUvdW5pZm9ybXMgYXMgbGF5b3V0IGFuZCB1c2UgdGhvc2UgY29uc2lzdGVudGx5IGluIHNoYWRlcnNcclxuICAgICBcclxuICAgIGV4cG9ydCBjbGFzcyBTaGFkZXIge1xyXG4gICAgICAgIC8qKiBUaGUgdHlwZSBvZiBjb2F0IHRoYXQgY2FuIGJlIHVzZWQgd2l0aCB0aGlzIHNoYWRlciB0byBjcmVhdGUgYSBtYXRlcmlhbCAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0Q29hdCgpOiB0eXBlb2YgQ29hdCB7IHJldHVybiBudWxsOyB9XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXRWZXJ0ZXhTaGFkZXJTb3VyY2UoKTogc3RyaW5nIHsgcmV0dXJuIG51bGw7IH1cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGdldEZyYWdtZW50U2hhZGVyU291cmNlKCk6IHN0cmluZyB7IHJldHVybiBudWxsOyB9XHJcbiAgICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogU2luZ2xlIGNvbG9yIHNoYWRpbmdcclxuICAgICAqIEBhdXRob3JzIEphc2NoYSBLYXJhZ8O2bCwgSEZVLCAyMDE5IHwgSmlya2EgRGVsbCdPcm8tRnJpZWRsLCBIRlUsIDIwMTlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIFNoYWRlckZsYXQgZXh0ZW5kcyBTaGFkZXIge1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0Q29hdCgpOiB0eXBlb2YgQ29hdCB7XHJcbiAgICAgICAgICAgIHJldHVybiBDb2F0Q29sb3JlZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0VmVydGV4U2hhZGVyU291cmNlKCk6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIHJldHVybiBgI3ZlcnNpb24gMzAwIGVzXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHN0cnVjdCBMaWdodEFtYmllbnQge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2ZWM0IGNvbG9yO1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgc3RydWN0IExpZ2h0RGlyZWN0aW9uYWwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2ZWM0IGNvbG9yO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2ZWMzIGRpcmVjdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB1aW50IE1BWF9MSUdIVFNfRElSRUNUSU9OQUwgPSAxMHU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGluIHZlYzMgYV9wb3NpdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICBpbiB2ZWMzIGFfbm9ybWFsO1xyXG4gICAgICAgICAgICAgICAgICAgIHVuaWZvcm0gbWF0NCB1X3dvcmxkO1xyXG4gICAgICAgICAgICAgICAgICAgIHVuaWZvcm0gbWF0NCB1X3Byb2plY3Rpb247XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHVuaWZvcm0gTGlnaHRBbWJpZW50IHVfYW1iaWVudDtcclxuICAgICAgICAgICAgICAgICAgICB1bmlmb3JtIHVpbnQgdV9uTGlnaHRzRGlyZWN0aW9uYWw7XHJcbiAgICAgICAgICAgICAgICAgICAgdW5pZm9ybSBMaWdodERpcmVjdGlvbmFsIHVfZGlyZWN0aW9uYWxbTUFYX0xJR0hUU19ESVJFQ1RJT05BTF07XHJcbiAgICAgICAgICAgICAgICAgICAgZmxhdCBvdXQgdmVjNCB2X2NvbG9yO1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIHZvaWQgbWFpbigpIHsgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ2xfUG9zaXRpb24gPSB1X3Byb2plY3Rpb24gKiB2ZWM0KGFfcG9zaXRpb24sIDEuMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlYzMgbm9ybWFsID0gbWF0Myh1X3dvcmxkKSAqIGFfbm9ybWFsO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdl9jb2xvciA9IHZlYzQoMCwwLDAsMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodWludCBpID0gMHU7IGkgPCB1X25MaWdodHNEaXJlY3Rpb25hbDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmbG9hdCBpbGx1bWluYXRpb24gPSAtZG90KG5vcm1hbCwgdV9kaXJlY3Rpb25hbFtpXS5kaXJlY3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdl9jb2xvciArPSBpbGx1bWluYXRpb24gKiB1X2RpcmVjdGlvbmFsW2ldLmNvbG9yOyAvLyB2ZWM0KDEsMSwxLDEpOyAvLyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1X2FtYmllbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVfZGlyZWN0aW9uYWxbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgfWA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0RnJhZ21lbnRTaGFkZXJTb3VyY2UoKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgcmV0dXJuIGAjdmVyc2lvbiAzMDAgZXNcclxuICAgICAgICAgICAgICAgICAgICBwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZmxhdCBpbiB2ZWM0IHZfY29sb3I7XHJcbiAgICAgICAgICAgICAgICAgICAgb3V0IHZlYzQgZnJhZztcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICB2b2lkIG1haW4oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyYWcgPSB2X2NvbG9yO1xyXG4gICAgICAgICAgICAgICAgICAgIH1gO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIlxyXG5uYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogTWF0Y2FwIChNYXRlcmlhbCBDYXB0dXJlKSBzaGFkaW5nLiBUaGUgdGV4dHVyZSBwcm92aWRlZCBieSB0aGUgY29hdCBpcyB1c2VkIGFzIGEgbWF0Y2FwIG1hdGVyaWFsLiBcclxuICAgICAqIEltcGxlbWVudGF0aW9uIGJhc2VkIG9uIGh0dHBzOi8vd3d3LmNsaWNrdG9yZWxlYXNlLmNvbS9ibG9nL2NyZWF0aW5nLXNwaGVyaWNhbC1lbnZpcm9ubWVudC1tYXBwaW5nLXNoYWRlci9cclxuICAgICAqIEBhdXRob3JzIFNpbW9uIFN0b3JsLVNjaHVsa2UsIEhGVSwgMjAxOSB8IEppcmthIERlbGwnT3JvLUZyaWVkbCwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBTaGFkZXJNYXRDYXAgZXh0ZW5kcyBTaGFkZXIge1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0Q29hdCgpOiB0eXBlb2YgQ29hdCB7XHJcbiAgICAgICAgICAgIHJldHVybiBDb2F0TWF0Q2FwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXRWZXJ0ZXhTaGFkZXJTb3VyY2UoKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgcmV0dXJuIGAjdmVyc2lvbiAzMDAgZXNcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaW4gdmVjMyBhX3Bvc2l0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgIGluIHZlYzMgYV9ub3JtYWw7XHJcbiAgICAgICAgICAgICAgICAgICAgdW5pZm9ybSBtYXQ0IHVfcHJvamVjdGlvbjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgb3V0IHZlYzIgdGV4X2Nvb3Jkc19zbW9vdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgZmxhdCBvdXQgdmVjMiB0ZXhfY29vcmRzX2ZsYXQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZvaWQgbWFpbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF0NCBub3JtYWxNYXRyaXggPSB0cmFuc3Bvc2UoaW52ZXJzZSh1X3Byb2plY3Rpb24pKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmVjNCBwID0gdmVjNChhX3Bvc2l0aW9uLCAxLjApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2ZWM0IG5vcm1hbDQgPSB2ZWM0KGFfbm9ybWFsLCAxLjApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2ZWMzIGUgPSBub3JtYWxpemUoIHZlYzMoIHVfcHJvamVjdGlvbiAqIHAgKSApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2ZWMzIG4gPSBub3JtYWxpemUoIHZlYzMobm9ybWFsTWF0cml4ICogbm9ybWFsNCkgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlYzMgciA9IHJlZmxlY3QoIGUsIG4gKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmxvYXQgbSA9IDIuICogc3FydChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvdyggci54LCAyLiApICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvdyggci55LCAyLiApICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvdyggci56ICsgMS4sIDIuIClcclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleF9jb29yZHNfc21vb3RoID0gci54eSAvIG0gKyAuNTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4X2Nvb3Jkc19mbGF0ID0gci54eSAvIG0gKyAuNTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsX1Bvc2l0aW9uID0gdV9wcm9qZWN0aW9uICogdmVjNChhX3Bvc2l0aW9uLCAxLjApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1gO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGdldEZyYWdtZW50U2hhZGVyU291cmNlKCk6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIHJldHVybiBgI3ZlcnNpb24gMzAwIGVzXHJcbiAgICAgICAgICAgICAgICAgICAgcHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgdW5pZm9ybSB2ZWM0IHVfdGludF9jb2xvcjtcclxuICAgICAgICAgICAgICAgICAgICB1bmlmb3JtIGZsb2F0IHVfZmxhdG1peDtcclxuICAgICAgICAgICAgICAgICAgICB1bmlmb3JtIHNhbXBsZXIyRCB1X3RleHR1cmU7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgaW4gdmVjMiB0ZXhfY29vcmRzX3Ntb290aDtcclxuICAgICAgICAgICAgICAgICAgICBmbGF0IGluIHZlYzIgdGV4X2Nvb3Jkc19mbGF0O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBvdXQgdmVjNCBmcmFnO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2b2lkIG1haW4oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlYzIgdGMgPSBtaXgodGV4X2Nvb3Jkc19zbW9vdGgsIHRleF9jb29yZHNfZmxhdCwgdV9mbGF0bWl4KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZnJhZyA9IHVfdGludF9jb2xvciAqIHRleHR1cmUodV90ZXh0dXJlLCB0YykgKiAyLjA7XHJcbiAgICAgICAgICAgICAgICAgICAgfWA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIFJlbmRlcnMgZm9yIFJheWNhc3RpbmdcclxuICAgICAqIEBhdXRob3JzIEppcmthIERlbGwnT3JvLUZyaWVkbCwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBTaGFkZXJSYXlDYXN0IGV4dGVuZHMgU2hhZGVyIHtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIGdldFZlcnRleFNoYWRlclNvdXJjZSgpOiBzdHJpbmcge1xyXG4gICAgICAgICAgICByZXR1cm4gYCN2ZXJzaW9uIDMwMCBlc1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpbiB2ZWMzIGFfcG9zaXRpb247XHJcbiAgICAgICAgICAgICAgICAgICAgdW5pZm9ybSBtYXQ0IHVfcHJvamVjdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICB2b2lkIG1haW4oKSB7ICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsX1Bvc2l0aW9uID0gdV9wcm9qZWN0aW9uICogdmVjNChhX3Bvc2l0aW9uLCAxLjApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1gO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGdldEZyYWdtZW50U2hhZGVyU291cmNlKCk6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIHJldHVybiBgI3ZlcnNpb24gMzAwIGVzXHJcbiAgICAgICAgICAgICAgICAgICAgcHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJlY2lzaW9uIGhpZ2hwIGludDtcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICB1bmlmb3JtIGludCB1X2lkO1xyXG4gICAgICAgICAgICAgICAgICAgIG91dCB2ZWM0IGZyYWc7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgdm9pZCBtYWluKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgIGZsb2F0IGlkID0gZmxvYXQodV9pZCkvIDI1Ni4wO1xyXG4gICAgICAgICAgICAgICAgICAgICAgIGZsb2F0IHVwcGVyYnl0ZSA9IHRydW5jKGdsX0ZyYWdDb29yZC56ICogMjU2LjApIC8gMjU2LjA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgZmxvYXQgbG93ZXJieXRlID0gZnJhY3QoZ2xfRnJhZ0Nvb3JkLnogKiAyNTYuMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgZnJhZyA9IHZlYzQoaWQsIGlkLCB1cHBlcmJ5dGUgLCBsb3dlcmJ5dGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1gO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBUZXh0dXJlZCBzaGFkaW5nXHJcbiAgICAgKiBAYXV0aG9ycyBKYXNjaGEgS2FyYWfDtmwsIEhGVSwgMjAxOSB8IEppcmthIERlbGwnT3JvLUZyaWVkbCwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBTaGFkZXJUZXh0dXJlIGV4dGVuZHMgU2hhZGVyIHtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIGdldENvYXQoKTogdHlwZW9mIENvYXQge1xyXG4gICAgICAgICAgICByZXR1cm4gQ29hdFRleHR1cmVkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXRWZXJ0ZXhTaGFkZXJTb3VyY2UoKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgcmV0dXJuIGAjdmVyc2lvbiAzMDAgZXNcclxuXHJcbiAgICAgICAgICAgICAgICBpbiB2ZWMzIGFfcG9zaXRpb247XHJcbiAgICAgICAgICAgICAgICBpbiB2ZWMyIGFfdGV4dHVyZVVWcztcclxuICAgICAgICAgICAgICAgIHVuaWZvcm0gbWF0NCB1X3Byb2plY3Rpb247XHJcbiAgICAgICAgICAgICAgICB1bmlmb3JtIHZlYzQgdV9jb2xvcjtcclxuICAgICAgICAgICAgICAgIG91dCB2ZWMyIHZfdGV4dHVyZVVWcztcclxuXHJcbiAgICAgICAgICAgICAgICB2b2lkIG1haW4oKSB7ICBcclxuICAgICAgICAgICAgICAgICAgICBnbF9Qb3NpdGlvbiA9IHVfcHJvamVjdGlvbiAqIHZlYzQoYV9wb3NpdGlvbiwgMS4wKTtcclxuICAgICAgICAgICAgICAgICAgICB2X3RleHR1cmVVVnMgPSBhX3RleHR1cmVVVnM7XHJcbiAgICAgICAgICAgICAgICB9YDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXRGcmFnbWVudFNoYWRlclNvdXJjZSgpOiBzdHJpbmcge1xyXG4gICAgICAgICAgICByZXR1cm4gYCN2ZXJzaW9uIDMwMCBlc1xyXG4gICAgICAgICAgICAgICAgcHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGluIHZlYzIgdl90ZXh0dXJlVVZzO1xyXG4gICAgICAgICAgICAgICAgdW5pZm9ybSBzYW1wbGVyMkQgdV90ZXh0dXJlO1xyXG4gICAgICAgICAgICAgICAgb3V0IHZlYzQgZnJhZztcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdm9pZCBtYWluKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZyYWcgPSB0ZXh0dXJlKHVfdGV4dHVyZSwgdl90ZXh0dXJlVVZzKTtcclxuICAgICAgICAgICAgfWA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIFNpbmdsZSBjb2xvciBzaGFkaW5nXHJcbiAgICAgKiBAYXV0aG9ycyBKYXNjaGEgS2FyYWfDtmwsIEhGVSwgMjAxOSB8IEppcmthIERlbGwnT3JvLUZyaWVkbCwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBTaGFkZXJVbmlDb2xvciBleHRlbmRzIFNoYWRlciB7XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXRDb2F0KCk6IHR5cGVvZiBDb2F0IHtcclxuICAgICAgICAgICAgcmV0dXJuIENvYXRDb2xvcmVkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXRWZXJ0ZXhTaGFkZXJTb3VyY2UoKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgcmV0dXJuIGAjdmVyc2lvbiAzMDAgZXNcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaW4gdmVjMyBhX3Bvc2l0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgIHVuaWZvcm0gbWF0NCB1X3Byb2plY3Rpb247XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgdm9pZCBtYWluKCkgeyAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBnbF9Qb3NpdGlvbiA9IHVfcHJvamVjdGlvbiAqIHZlYzQoYV9wb3NpdGlvbiwgMS4wKTtcclxuICAgICAgICAgICAgICAgICAgICB9YDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXRGcmFnbWVudFNoYWRlclNvdXJjZSgpOiBzdHJpbmcge1xyXG4gICAgICAgICAgICByZXR1cm4gYCN2ZXJzaW9uIDMwMCBlc1xyXG4gICAgICAgICAgICAgICAgICAgIHByZWNpc2lvbiBtZWRpdW1wIGZsb2F0O1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIHVuaWZvcm0gdmVjNCB1X2NvbG9yO1xyXG4gICAgICAgICAgICAgICAgICAgIG91dCB2ZWM0IGZyYWc7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgdm9pZCBtYWluKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgIGZyYWcgPSB1X2NvbG9yO1xyXG4gICAgICAgICAgICAgICAgICAgIH1gO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBCYXNlY2xhc3MgZm9yIGRpZmZlcmVudCBraW5kcyBvZiB0ZXh0dXJlcy4gXHJcbiAgICAgKiBAYXV0aG9ycyBKaXJrYSBEZWxsJ09yby1GcmllZGwsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgYWJzdHJhY3QgY2xhc3MgVGV4dHVyZSBleHRlbmRzIE11dGFibGUge1xyXG4gICAgICAgIHByb3RlY3RlZCByZWR1Y2VNdXRhdG9yKCk6IHZvaWQgey8qKi8gfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGV4dHVyZSBjcmVhdGVkIGZyb20gYW4gZXhpc3RpbmcgaW1hZ2VcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIFRleHR1cmVJbWFnZSBleHRlbmRzIFRleHR1cmUge1xyXG4gICAgICAgIHB1YmxpYyBpbWFnZTogSFRNTEltYWdlRWxlbWVudCA9IG51bGw7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFRleHR1cmUgY3JlYXRlZCBmcm9tIGEgY2FudmFzXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBUZXh0dXJlQ2FudmFzIGV4dGVuZHMgVGV4dHVyZSB7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFRleHR1cmUgY3JlYXRlZCBmcm9tIGEgRlVER0UtU2tldGNoXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBUZXh0dXJlU2tldGNoIGV4dGVuZHMgVGV4dHVyZUNhbnZhcyB7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFRleHR1cmUgY3JlYXRlZCBmcm9tIGFuIEhUTUwtcGFnZVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgVGV4dHVyZUhUTUwgZXh0ZW5kcyBUZXh0dXJlQ2FudmFzIHtcclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgZW51bSBUSU1FUl9UWVBFIHtcclxuICAgICAgICBJTlRFUlZBTCxcclxuICAgICAgICBUSU1FT1VUXHJcbiAgICB9XHJcblxyXG4gICAgaW50ZXJmYWNlIFRpbWVycyB7XHJcbiAgICAgICAgW2lkOiBudW1iZXJdOiBUaW1lcjtcclxuICAgIH1cclxuXHJcbiAgICBjbGFzcyBUaW1lciB7XHJcbiAgICAgICAgYWN0aXZlOiBib29sZWFuO1xyXG4gICAgICAgIHR5cGU6IFRJTUVSX1RZUEU7XHJcbiAgICAgICAgY2FsbGJhY2s6IEZ1bmN0aW9uO1xyXG4gICAgICAgIHRpbWVvdXQ6IG51bWJlcjtcclxuICAgICAgICBhcmd1bWVudHM6IE9iamVjdFtdO1xyXG4gICAgICAgIHN0YXJ0VGltZVJlYWw6IG51bWJlcjtcclxuICAgICAgICB0aW1lb3V0UmVhbDogbnVtYmVyO1xyXG4gICAgICAgIGlkOiBudW1iZXI7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKF90aW1lOiBUaW1lLCBfdHlwZTogVElNRVJfVFlQRSwgX2NhbGxiYWNrOiBGdW5jdGlvbiwgX3RpbWVvdXQ6IG51bWJlciwgX2FyZ3VtZW50czogT2JqZWN0W10pIHtcclxuICAgICAgICAgICAgdGhpcy50eXBlID0gX3R5cGU7XHJcbiAgICAgICAgICAgIHRoaXMudGltZW91dCA9IF90aW1lb3V0O1xyXG4gICAgICAgICAgICB0aGlzLmFyZ3VtZW50cyA9IF9hcmd1bWVudHM7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhcnRUaW1lUmVhbCA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrID0gX2NhbGxiYWNrO1xyXG5cclxuICAgICAgICAgICAgbGV0IHNjYWxlOiBudW1iZXIgPSBNYXRoLmFicyhfdGltZS5nZXRTY2FsZSgpKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghc2NhbGUpIHtcclxuICAgICAgICAgICAgICAgIC8vIFRpbWUgaXMgc3RvcHBlZCwgdGltZXIgd29uJ3QgYmUgYWN0aXZlXHJcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgaWQ6IG51bWJlcjtcclxuICAgICAgICAgICAgdGhpcy50aW1lb3V0UmVhbCA9IHRoaXMudGltZW91dCAvIHNjYWxlO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMudHlwZSA9PSBUSU1FUl9UWVBFLlRJTUVPVVQpIHtcclxuICAgICAgICAgICAgICAgIGxldCBjYWxsYmFjazogRnVuY3Rpb24gPSAoKTogdm9pZCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RpbWUuZGVsZXRlVGltZXJCeUludGVybmFsSWQodGhpcy5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgX2NhbGxiYWNrKF9hcmd1bWVudHMpO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGlkID0gd2luZG93LnNldFRpbWVvdXQoY2FsbGJhY2ssIHRoaXMudGltZW91dFJlYWwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIGlkID0gd2luZG93LnNldEludGVydmFsKF9jYWxsYmFjaywgdGhpcy50aW1lb3V0UmVhbCwgX2FyZ3VtZW50cyk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmlkID0gaWQ7XHJcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBjbGVhcigpOiB2b2lkIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMudHlwZSA9PSBUSU1FUl9UWVBFLlRJTUVPVVQpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmFjdGl2ZSlcclxuICAgICAgICAgICAgICAgICAgICAvLyBzYXZlIHJlbWFpbmluZyB0aW1lIHRvIHRpbWVvdXQgYXMgbmV3IHRpbWVvdXQgZm9yIHJlc3RhcnRcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRpbWVvdXQgPSB0aGlzLnRpbWVvdXQgKiAoMSAtIChwZXJmb3JtYW5jZS5ub3coKSAtIHRoaXMuc3RhcnRUaW1lUmVhbCkgLyB0aGlzLnRpbWVvdXRSZWFsKTtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGhpcy5pZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogcmV1c2luZyB0aW1lciBzdGFydHMgaW50ZXJ2YWwgYW5ldy4gU2hvdWxkIGJlIHJlbWFpbmluZyBpbnRlcnZhbCBhcyB0aW1lb3V0LCB0aGVuIHN0YXJ0aW5nIGludGVydmFsIGFuZXcgXHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLmlkKTtcclxuICAgICAgICAgICAgdGhpcy5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnN0YW5jZXMgb2YgdGhpcyBjbGFzcyBnZW5lcmF0ZSBhIHRpbWVzdGFtcCB0aGF0IGNvcnJlbGF0ZXMgd2l0aCB0aGUgdGltZSBlbGFwc2VkIHNpbmNlIHRoZSBzdGFydCBvZiB0aGUgcHJvZ3JhbSBidXQgYWxsb3dzIGZvciByZXNldHRpbmcgYW5kIHNjYWxpbmcuICBcclxuICAgICAqIFN1cHBvcnRzIGludGVydmFsLSBhbmQgdGltZW91dC1jYWxsYmFja3MgaWRlbnRpY2FsIHdpdGggc3RhbmRhcmQgSmF2YXNjcmlwdCBidXQgd2l0aCByZXNwZWN0IHRvIHRoZSBzY2FsZWQgdGltZVxyXG4gICAgICogQGF1dGhvcnMgSmlya2EgRGVsbCdPcm8tRnJpZWRsLCBIRlUsIDIwMTlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIFRpbWUgZXh0ZW5kcyBFdmVudFRhcmdldCB7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgZ2FtZVRpbWU6IFRpbWUgPSBuZXcgVGltZSgpO1xyXG4gICAgICAgIHByaXZhdGUgc3RhcnQ6IG51bWJlcjtcclxuICAgICAgICBwcml2YXRlIHNjYWxlOiBudW1iZXI7XHJcbiAgICAgICAgcHJpdmF0ZSBvZmZzZXQ6IG51bWJlcjtcclxuICAgICAgICBwcml2YXRlIGxhc3RDYWxsVG9FbGFwc2VkOiBudW1iZXI7XHJcbiAgICAgICAgcHJpdmF0ZSB0aW1lcnM6IFRpbWVycyA9IHt9O1xyXG4gICAgICAgIHByaXZhdGUgaWRUaW1lck5leHQ6IG51bWJlciA9IDA7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgICAgICB0aGlzLnN0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2NhbGUgPSAxLjA7XHJcbiAgICAgICAgICAgIHRoaXMub2Zmc2V0ID0gMC4wO1xyXG4gICAgICAgICAgICB0aGlzLmxhc3RDYWxsVG9FbGFwc2VkID0gMC4wO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgZ2FtZS10aW1lLW9iamVjdCB3aGljaCBzdGFydHMgYXV0b21hdGljYWxseSBhbmQgc2VydmVzIGFzIGJhc2UgZm9yIHZhcmlvdXMgaW50ZXJuYWwgb3BlcmF0aW9ucy4gXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXQgZ2FtZSgpOiBUaW1lIHtcclxuICAgICAgICAgICAgcmV0dXJuIFRpbWUuZ2FtZVRpbWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXRyaWV2ZXMgdGhlIGN1cnJlbnQgc2NhbGVkIHRpbWVzdGFtcCBvZiB0aGlzIGluc3RhbmNlIGluIG1pbGxpc2Vjb25kc1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBnZXQoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMub2Zmc2V0ICsgdGhpcy5zY2FsZSAqIChwZXJmb3JtYW5jZS5ub3coKSAtIHRoaXMuc3RhcnQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogKFJlLSkgU2V0cyB0aGUgdGltZXN0YW1wIG9mIHRoaXMgaW5zdGFuY2VcclxuICAgICAgICAgKiBAcGFyYW0gX3RpbWUgVGhlIHRpbWVzdGFtcCB0byByZXByZXNlbnQgdGhlIGN1cnJlbnQgdGltZSAoZGVmYXVsdCAwLjApXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHNldChfdGltZTogbnVtYmVyID0gMCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLm9mZnNldCA9IF90aW1lO1xyXG4gICAgICAgICAgICB0aGlzLnN0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0RWxhcHNlZFNpbmNlUHJldmlvdXNDYWxsKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTZXRzIHRoZSBzY2FsaW5nIG9mIHRoaXMgdGltZSwgYWxsb3dpbmcgZm9yIHNsb3dtb3Rpb24gKDwxKSBvciBmYXN0Zm9yd2FyZCAoPjEpIFxyXG4gICAgICAgICAqIEBwYXJhbSBfc2NhbGUgVGhlIGRlc2lyZWQgc2NhbGluZyAoZGVmYXVsdCAxLjApXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHNldFNjYWxlKF9zY2FsZTogbnVtYmVyID0gMS4wKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0KHRoaXMuZ2V0KCkpO1xyXG4gICAgICAgICAgICB0aGlzLnNjYWxlID0gX3NjYWxlO1xyXG4gICAgICAgICAgICAvL1RPRE86IGNhdGNoIHNjYWxlPTBcclxuICAgICAgICAgICAgdGhpcy5yZXNjYWxlQWxsVGltZXJzKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0RWxhcHNlZFNpbmNlUHJldmlvdXNDYWxsKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoRVZFTlQuVElNRV9TQ0FMRUQpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHJpZXZlcyB0aGUgY3VycmVudCBzY2FsaW5nIG9mIHRoaXMgdGltZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBnZXRTY2FsZSgpOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zY2FsZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHJpZXZlcyB0aGUgb2Zmc2V0IG9mIHRoaXMgdGltZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBnZXRPZmZzZXQoKTogbnVtYmVyIHtcclxuICAgICAgICAgIHJldHVybiB0aGlzLm9mZnNldDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHJpZXZlcyB0aGUgc2NhbGVkIHRpbWUgaW4gbWlsbGlzZWNvbmRzIHBhc3NlZCBzaW5jZSB0aGUgbGFzdCBjYWxsIHRvIHRoaXMgbWV0aG9kXHJcbiAgICAgICAgICogQXV0b21hdGljYWxseSByZXNldCBhdCBldmVyeSBjYWxsIHRvIHNldCguLi4pIGFuZCBzZXRTY2FsZSguLi4pXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGdldEVsYXBzZWRTaW5jZVByZXZpb3VzQ2FsbCgpOiBudW1iZXIge1xyXG4gICAgICAgICAgICBsZXQgY3VycmVudDogbnVtYmVyID0gdGhpcy5nZXQoKTtcclxuICAgICAgICAgICAgbGV0IGVsYXBzZWQ6IG51bWJlciA9IGN1cnJlbnQgLSB0aGlzLmxhc3RDYWxsVG9FbGFwc2VkO1xyXG4gICAgICAgICAgICB0aGlzLmxhc3RDYWxsVG9FbGFwc2VkID0gY3VycmVudDtcclxuICAgICAgICAgICAgcmV0dXJuIGVsYXBzZWQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyNyZWdpb24gVGltZXJzXHJcbiAgICAgICAgLy8gVE9ETzogZXhhbWluZSBpZiB3ZWItd29ya2VycyB3b3VsZCBlbmhhbmNlIHBlcmZvcm1hbmNlIGhlcmUhXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2VlIEphdmFzY3JpcHQgZG9jdW1lbnRhdGlvbi4gQ3JlYXRlcyBhbiBpbnRlcm5hbCBbW1RpbWVyXV0gb2JqZWN0XHJcbiAgICAgICAgICogQHBhcmFtIF9jYWxsYmFja1xyXG4gICAgICAgICAqIEBwYXJhbSBfdGltZW91dCBcclxuICAgICAgICAgKiBAcGFyYW0gX2FyZ3VtZW50cyBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc2V0VGltZW91dChfY2FsbGJhY2s6IEZ1bmN0aW9uLCBfdGltZW91dDogbnVtYmVyLCAuLi5fYXJndW1lbnRzOiBPYmplY3RbXSk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFRpbWVyKFRJTUVSX1RZUEUuVElNRU9VVCwgX2NhbGxiYWNrLCBfdGltZW91dCwgX2FyZ3VtZW50cyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNlZSBKYXZhc2NyaXB0IGRvY3VtZW50YXRpb24uIENyZWF0ZXMgYW4gaW50ZXJuYWwgW1tUaW1lcl1dIG9iamVjdFxyXG4gICAgICAgICAqIEBwYXJhbSBfY2FsbGJhY2sgXHJcbiAgICAgICAgICogQHBhcmFtIF90aW1lb3V0IFxyXG4gICAgICAgICAqIEBwYXJhbSBfYXJndW1lbnRzIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzZXRJbnRlcnZhbChfY2FsbGJhY2s6IEZ1bmN0aW9uLCBfdGltZW91dDogbnVtYmVyLCAuLi5fYXJndW1lbnRzOiBPYmplY3RbXSk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFRpbWVyKFRJTUVSX1RZUEUuSU5URVJWQUwsIF9jYWxsYmFjaywgX3RpbWVvdXQsIF9hcmd1bWVudHMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTZWUgSmF2YXNjcmlwdCBkb2N1bWVudGF0aW9uXHJcbiAgICAgICAgICogQHBhcmFtIF9pZCBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgY2xlYXJUaW1lb3V0KF9pZDogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVsZXRlVGltZXIoX2lkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2VlIEphdmFzY3JpcHQgZG9jdW1lbnRhdGlvblxyXG4gICAgICAgICAqIEBwYXJhbSBfaWQgXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGNsZWFySW50ZXJ2YWwoX2lkOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5kZWxldGVUaW1lcihfaWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU3RvcHMgYW5kIGRlbGV0ZXMgYWxsIFtbVGltZXJdXXMgYXR0YWNoZWQuIFNob3VsZCBiZSBjYWxsZWQgYmVmb3JlIHRoaXMgVGltZS1vYmplY3QgbGVhdmVzIHNjb3BlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGNsZWFyQWxsVGltZXJzKCk6IHZvaWQge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpZCBpbiB0aGlzLnRpbWVycykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWxldGVUaW1lcihOdW1iZXIoaWQpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVjcmVhdGVzIFtbVGltZXJdXXMgd2hlbiBzY2FsaW5nIGNoYW5nZXNcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgcmVzY2FsZUFsbFRpbWVycygpOiB2b2lkIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaWQgaW4gdGhpcy50aW1lcnMpIHtcclxuICAgICAgICAgICAgICAgIGxldCB0aW1lcjogVGltZXIgPSB0aGlzLnRpbWVyc1tpZF07XHJcbiAgICAgICAgICAgICAgICB0aW1lci5jbGVhcigpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLnNjYWxlKVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRpbWUgaGFzIHN0b3BwZWQsIG5vIG5lZWQgdG8gcmVwbGFjZSBjbGVhcmVkIHRpbWVyc1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCB0aW1lb3V0OiBudW1iZXIgPSB0aW1lci50aW1lb3V0O1xyXG4gICAgICAgICAgICAgICAgLy8gaWYgKHRpbWVyLnR5cGUgPT0gVElNRVJfVFlQRS5USU1FT1VUICYmIHRpbWVyLmFjdGl2ZSlcclxuICAgICAgICAgICAgICAgIC8vICAgICAvLyBmb3IgYW4gYWN0aXZlIHRpbWVvdXQtdGltZXIsIGNhbGN1bGF0ZSB0aGUgcmVtYWluaW5nIHRpbWUgdG8gdGltZW91dFxyXG4gICAgICAgICAgICAgICAgLy8gICAgIHRpbWVvdXQgPSAocGVyZm9ybWFuY2Uubm93KCkgLSB0aW1lci5zdGFydFRpbWVSZWFsKSAvIHRpbWVyLnRpbWVvdXRSZWFsO1xyXG4gICAgICAgICAgICAgICAgbGV0IHJlcGxhY2U6IFRpbWVyID0gbmV3IFRpbWVyKHRoaXMsIHRpbWVyLnR5cGUsIHRpbWVyLmNhbGxiYWNrLCB0aW1lb3V0LCB0aW1lci5hcmd1bWVudHMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy50aW1lcnNbaWRdID0gcmVwbGFjZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGVsZXRlcyBbW1RpbWVyXV0gZm91bmQgdXNpbmcgdGhlIGlkIG9mIHRoZSBjb25uZWN0ZWQgaW50ZXJ2YWwvdGltZW91dC1vYmplY3RcclxuICAgICAgICAgKiBAcGFyYW0gX2lkIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBkZWxldGVUaW1lckJ5SW50ZXJuYWxJZChfaWQ6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpZCBpbiB0aGlzLnRpbWVycykge1xyXG4gICAgICAgICAgICAgICAgbGV0IHRpbWVyOiBUaW1lciA9IHRoaXMudGltZXJzW2lkXTtcclxuICAgICAgICAgICAgICAgIGlmICh0aW1lci5pZCA9PSBfaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aW1lci5jbGVhcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnRpbWVyc1tpZF07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc2V0VGltZXIoX3R5cGU6IFRJTUVSX1RZUEUsIF9jYWxsYmFjazogRnVuY3Rpb24sIF90aW1lb3V0OiBudW1iZXIsIF9hcmd1bWVudHM6IE9iamVjdFtdKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgbGV0IHRpbWVyOiBUaW1lciA9IG5ldyBUaW1lcih0aGlzLCBfdHlwZSwgX2NhbGxiYWNrLCBfdGltZW91dCwgX2FyZ3VtZW50cyk7XHJcbiAgICAgICAgICAgIHRoaXMudGltZXJzWysrdGhpcy5pZFRpbWVyTmV4dF0gPSB0aW1lcjtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaWRUaW1lck5leHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGRlbGV0ZVRpbWVyKF9pZDogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMudGltZXJzW19pZF0uY2xlYXIoKTtcclxuICAgICAgICAgICAgZGVsZXRlIHRoaXMudGltZXJzW19pZF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vI2VuZHJlZ2lvblxyXG4gICAgfVxyXG59IiwiLy8vPHJlZmVyZW5jZSBwYXRoPVwiLi4vRXZlbnQvRXZlbnQudHNcIi8+XHJcbi8vLzxyZWZlcmVuY2UgcGF0aD1cIi4uL1RpbWUvVGltZS50c1wiLz5cclxubmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICBleHBvcnQgZW51bSBMT09QX01PREUge1xyXG4gICAgICAgIC8qKiBMb29wIGN5Y2xlcyBjb250cm9sbGVkIGJ5IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgKi9cclxuICAgICAgICBGUkFNRV9SRVFVRVNUID0gXCJmcmFtZVJlcXVlc3RcIixcclxuICAgICAgICAvKiogTG9vcCBjeWNsZXMgd2l0aCB0aGUgZ2l2ZW4gZnJhbWVyYXRlIGluIFtbVGltZV1dLmdhbWUgKi9cclxuICAgICAgICBUSU1FX0dBTUUgPSBcInRpbWVHYW1lXCIsXHJcbiAgICAgICAgLyoqIExvb3AgY3ljbGVzIHdpdGggdGhlIGdpdmVuIGZyYW1lcmF0ZSBpbiByZWFsdGltZSwgaW5kZXBlbmRlbnQgb2YgW1tUaW1lXV0uZ2FtZSAqL1xyXG4gICAgICAgIFRJTUVfUkVBTCA9IFwidGltZVJlYWxcIlxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBDb3JlIGxvb3Agb2YgYSBGdWRnZSBhcHBsaWNhdGlvbi4gSW5pdGlhbGl6ZXMgYXV0b21hdGljYWxseSBhbmQgbXVzdCBiZSBzdGFydGVkIGV4cGxpY2l0bHkuXHJcbiAgICAgKiBJdCB0aGVuIGZpcmVzIFtbRVZFTlRdXS5MT09QXFxfRlJBTUUgdG8gYWxsIGFkZGVkIGxpc3RlbmVycyBhdCBlYWNoIGZyYW1lXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBMb29wIGV4dGVuZHMgRXZlbnRUYXJnZXRTdGF0aWMge1xyXG4gICAgICAgIC8qKiBUaGUgZ2FtZXRpbWUgdGhlIGxvb3Agd2FzIHN0YXJ0ZWQsIG92ZXJ3cml0dGVuIGF0IGVhY2ggc3RhcnQgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHRpbWVTdGFydEdhbWU6IG51bWJlciA9IDA7XHJcbiAgICAgICAgLyoqIFRoZSByZWFsdGltZSB0aGUgbG9vcCB3YXMgc3RhcnRlZCwgb3ZlcndyaXR0ZW4gYXQgZWFjaCBzdGFydCAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdGltZVN0YXJ0UmVhbDogbnVtYmVyID0gMDtcclxuICAgICAgICAvKiogVGhlIGdhbWV0aW1lIGVsYXBzZWQgc2luY2UgdGhlIGxhc3QgbG9vcCBjeWNsZSAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdGltZUZyYW1lR2FtZTogbnVtYmVyID0gMDtcclxuICAgICAgICAvKiogVGhlIHJlYWx0aW1lIGVsYXBzZWQgc2luY2UgdGhlIGxhc3QgbG9vcCBjeWNsZSAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdGltZUZyYW1lUmVhbDogbnVtYmVyID0gMDtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdGltZUxhc3RGcmFtZUdhbWU6IG51bWJlciA9IDA7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdGltZUxhc3RGcmFtZVJlYWw6IG51bWJlciA9IDA7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdGltZUxhc3RGcmFtZUdhbWVBdmc6IG51bWJlciA9IDA7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdGltZUxhc3RGcmFtZVJlYWxBdmc6IG51bWJlciA9IDA7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgcnVubmluZzogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIG1vZGU6IExPT1BfTU9ERSA9IExPT1BfTU9ERS5GUkFNRV9SRVFVRVNUO1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGlkSW50ZXJ2YWxsOiBudW1iZXIgPSAwO1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGlkUmVxdWVzdDogbnVtYmVyID0gMDtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBmcHNEZXNpcmVkOiBudW1iZXIgPSAzMDtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBmcmFtZXNUb0F2ZXJhZ2U6IG51bWJlciA9IDMwO1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHN5bmNXaXRoQW5pbWF0aW9uRnJhbWU6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU3RhcnRzIHRoZSBsb29wIHdpdGggdGhlIGdpdmVuIG1vZGUgYW5kIGZwc1xyXG4gICAgICAgICAqIEBwYXJhbSBfbW9kZSBcclxuICAgICAgICAgKiBAcGFyYW0gX2ZwcyBJcyBvbmx5IGFwcGxpY2FibGUgaW4gVElNRS1tb2Rlc1xyXG4gICAgICAgICAqIEBwYXJhbSBfc3luY1dpdGhBbmltYXRpb25GcmFtZSBFeHBlcmltZW50YWwgYW5kIG9ubHkgYXBwbGljYWJsZSBpbiBUSU1FLW1vZGVzLiBTaG91bGQgZGVmZXIgdGhlIGxvb3AtY3ljbGUgdW50aWwgdGhlIG5leHQgcG9zc2libGUgYW5pbWF0aW9uIGZyYW1lLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgc3RhcnQoX21vZGU6IExPT1BfTU9ERSA9IExPT1BfTU9ERS5GUkFNRV9SRVFVRVNULCBfZnBzOiBudW1iZXIgPSA2MCwgX3N5bmNXaXRoQW5pbWF0aW9uRnJhbWU6IGJvb2xlYW4gPSBmYWxzZSk6IHZvaWQge1xyXG4gICAgICAgICAgICBMb29wLnN0b3AoKTtcclxuXHJcbiAgICAgICAgICAgIExvb3AudGltZVN0YXJ0R2FtZSA9IFRpbWUuZ2FtZS5nZXQoKTtcclxuICAgICAgICAgICAgTG9vcC50aW1lU3RhcnRSZWFsID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICAgICAgICAgIExvb3AudGltZUxhc3RGcmFtZUdhbWUgPSBMb29wLnRpbWVTdGFydEdhbWU7XHJcbiAgICAgICAgICAgIExvb3AudGltZUxhc3RGcmFtZVJlYWwgPSBMb29wLnRpbWVTdGFydFJlYWw7XHJcbiAgICAgICAgICAgIExvb3AuZnBzRGVzaXJlZCA9IChfbW9kZSA9PSBMT09QX01PREUuRlJBTUVfUkVRVUVTVCkgPyA2MCA6IF9mcHM7XHJcbiAgICAgICAgICAgIExvb3AuZnJhbWVzVG9BdmVyYWdlID0gTG9vcC5mcHNEZXNpcmVkO1xyXG4gICAgICAgICAgICBMb29wLnRpbWVMYXN0RnJhbWVHYW1lQXZnID0gTG9vcC50aW1lTGFzdEZyYW1lUmVhbEF2ZyA9IDEwMDAgLyBMb29wLmZwc0Rlc2lyZWQ7XHJcbiAgICAgICAgICAgIExvb3AubW9kZSA9IF9tb2RlO1xyXG4gICAgICAgICAgICBMb29wLnN5bmNXaXRoQW5pbWF0aW9uRnJhbWUgPSBfc3luY1dpdGhBbmltYXRpb25GcmFtZTtcclxuXHJcbiAgICAgICAgICAgIGxldCBsb2c6IHN0cmluZyA9IGBMb29wIHN0YXJ0aW5nIGluIG1vZGUgJHtMb29wLm1vZGV9YDtcclxuICAgICAgICAgICAgaWYgKExvb3AubW9kZSAhPSBMT09QX01PREUuRlJBTUVfUkVRVUVTVClcclxuICAgICAgICAgICAgICAgIGxvZyArPSBgIHdpdGggYXR0ZW1wdGVkICR7X2Zwc30gZnBzYDtcclxuICAgICAgICAgICAgRGVidWcubG9nKGxvZyk7XHJcblxyXG4gICAgICAgICAgICBzd2l0Y2ggKF9tb2RlKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIExPT1BfTU9ERS5GUkFNRV9SRVFVRVNUOlxyXG4gICAgICAgICAgICAgICAgICAgIExvb3AubG9vcEZyYW1lKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIExPT1BfTU9ERS5USU1FX1JFQUw6XHJcbiAgICAgICAgICAgICAgICAgICAgTG9vcC5pZEludGVydmFsbCA9IHdpbmRvdy5zZXRJbnRlcnZhbChMb29wLmxvb3BUaW1lLCAxMDAwIC8gTG9vcC5mcHNEZXNpcmVkKTtcclxuICAgICAgICAgICAgICAgICAgICBMb29wLmxvb3BUaW1lKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIExPT1BfTU9ERS5USU1FX0dBTUU6XHJcbiAgICAgICAgICAgICAgICAgICAgTG9vcC5pZEludGVydmFsbCA9IFRpbWUuZ2FtZS5zZXRJbnRlcnZhbChMb29wLmxvb3BUaW1lLCAxMDAwIC8gTG9vcC5mcHNEZXNpcmVkKTtcclxuICAgICAgICAgICAgICAgICAgICBMb29wLmxvb3BUaW1lKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBMb29wLnJ1bm5pbmcgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU3RvcHMgdGhlIGxvb3BcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHN0b3AoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGlmICghTG9vcC5ydW5uaW5nKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgc3dpdGNoIChMb29wLm1vZGUpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgTE9PUF9NT0RFLkZSQU1FX1JFUVVFU1Q6XHJcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKExvb3AuaWRSZXF1ZXN0KTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgTE9PUF9NT0RFLlRJTUVfUkVBTDpcclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChMb29wLmlkSW50ZXJ2YWxsKTtcclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoTG9vcC5pZFJlcXVlc3QpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBMT09QX01PREUuVElNRV9HQU1FOlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IERBTkdFUiEgaWQgY2hhbmdlcyBpbnRlcm5hbGx5IGluIGdhbWUgd2hlbiB0aW1lIGlzIHNjYWxlZCFcclxuICAgICAgICAgICAgICAgICAgICBUaW1lLmdhbWUuY2xlYXJJbnRlcnZhbChMb29wLmlkSW50ZXJ2YWxsKTtcclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoTG9vcC5pZFJlcXVlc3QpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgRGVidWcubG9nKFwiTG9vcCBzdG9wcGVkIVwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0RnBzR2FtZUF2ZXJhZ2UoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIDEwMDAgLyBMb29wLnRpbWVMYXN0RnJhbWVHYW1lQXZnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGdldEZwc1JlYWxBdmVyYWdlKCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiAxMDAwIC8gTG9vcC50aW1lTGFzdEZyYW1lUmVhbEF2ZztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGxvb3AoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGxldCB0aW1lOiBudW1iZXI7XHJcbiAgICAgICAgICAgIHRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuICAgICAgICAgICAgTG9vcC50aW1lRnJhbWVSZWFsID0gdGltZSAtIExvb3AudGltZUxhc3RGcmFtZVJlYWw7XHJcbiAgICAgICAgICAgIExvb3AudGltZUxhc3RGcmFtZVJlYWwgPSB0aW1lO1xyXG5cclxuICAgICAgICAgICAgdGltZSA9IFRpbWUuZ2FtZS5nZXQoKTtcclxuICAgICAgICAgICAgTG9vcC50aW1lRnJhbWVHYW1lID0gdGltZSAtIExvb3AudGltZUxhc3RGcmFtZUdhbWU7XHJcbiAgICAgICAgICAgIExvb3AudGltZUxhc3RGcmFtZUdhbWUgPSB0aW1lO1xyXG5cclxuICAgICAgICAgICAgTG9vcC50aW1lTGFzdEZyYW1lR2FtZUF2ZyA9ICgoTG9vcC5mcmFtZXNUb0F2ZXJhZ2UgLSAxKSAqIExvb3AudGltZUxhc3RGcmFtZUdhbWVBdmcgKyBMb29wLnRpbWVGcmFtZUdhbWUpIC8gTG9vcC5mcmFtZXNUb0F2ZXJhZ2U7XHJcbiAgICAgICAgICAgIExvb3AudGltZUxhc3RGcmFtZVJlYWxBdmcgPSAoKExvb3AuZnJhbWVzVG9BdmVyYWdlIC0gMSkgKiBMb29wLnRpbWVMYXN0RnJhbWVSZWFsQXZnICsgTG9vcC50aW1lRnJhbWVSZWFsKSAvIExvb3AuZnJhbWVzVG9BdmVyYWdlO1xyXG5cclxuICAgICAgICAgICAgbGV0IGV2ZW50OiBFdmVudCA9IG5ldyBFdmVudChFVkVOVC5MT09QX0ZSQU1FKTtcclxuICAgICAgICAgICAgTG9vcC50YXJnZXRTdGF0aWMuZGlzcGF0Y2hFdmVudChldmVudCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBsb29wRnJhbWUoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIExvb3AubG9vcCgpO1xyXG4gICAgICAgICAgICBMb29wLmlkUmVxdWVzdCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoTG9vcC5sb29wRnJhbWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgbG9vcFRpbWUoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGlmIChMb29wLnN5bmNXaXRoQW5pbWF0aW9uRnJhbWUpXHJcbiAgICAgICAgICAgICAgICBMb29wLmlkUmVxdWVzdCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoTG9vcC5sb29wKTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgTG9vcC5sb29wKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgZXhwb3J0IGludGVyZmFjZSBNYXBGaWxlbmFtZVRvQ29udGVudCB7XHJcbiAgICAgICAgW2ZpbGVuYW1lOiBzdHJpbmddOiBzdHJpbmc7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEhhbmRsZXMgZmlsZSB0cmFuc2ZlciBmcm9tIGEgRnVkZ2UtQnJvd3NlcmFwcCB0byB0aGUgbG9jYWwgZmlsZXN5c3RlbSB3aXRob3V0IGEgbG9jYWwgc2VydmVyLiAgXHJcbiAgICAgKiBTYXZlcyB0byB0aGUgZG93bmxvYWQtcGF0aCBnaXZlbiBieSB0aGUgYnJvd3NlciwgbG9hZHMgZnJvbSB0aGUgcGxheWVyJ3MgY2hvaWNlLlxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgRmlsZUlvQnJvd3NlckxvY2FsIGV4dGVuZHMgRXZlbnRUYXJnZXRTdGF0aWMge1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHNlbGVjdG9yOiBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgICAgIC8vIFRPRE86IHJlZmFjdG9yIHRvIGFzeW5jIGZ1bmN0aW9uIHRvIGJlIGhhbmRsZWQgdXNpbmcgcHJvbWlzZSwgaW5zdGVhZCBvZiB1c2luZyBldmVudCB0YXJnZXRcclxuICAgICAgICBwdWJsaWMgc3RhdGljIGxvYWQoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIEZpbGVJb0Jyb3dzZXJMb2NhbC5zZWxlY3RvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTtcclxuICAgICAgICAgICAgRmlsZUlvQnJvd3NlckxvY2FsLnNlbGVjdG9yLnR5cGUgPSBcImZpbGVcIjtcclxuICAgICAgICAgICAgRmlsZUlvQnJvd3NlckxvY2FsLnNlbGVjdG9yLm11bHRpcGxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgRmlsZUlvQnJvd3NlckxvY2FsLnNlbGVjdG9yLmhpZGRlbiA9IHRydWU7XHJcbiAgICAgICAgICAgIEZpbGVJb0Jyb3dzZXJMb2NhbC5zZWxlY3Rvci5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIEZpbGVJb0Jyb3dzZXJMb2NhbC5oYW5kbGVGaWxlU2VsZWN0KTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChGaWxlSW9Ccm93c2VyTG9jYWwuc2VsZWN0b3IpO1xyXG4gICAgICAgICAgICBGaWxlSW9Ccm93c2VyTG9jYWwuc2VsZWN0b3IuY2xpY2soKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFRPRE86IHJlZmFjdG9yIHRvIGFzeW5jIGZ1bmN0aW9uIHRvIGJlIGhhbmRsZWQgdXNpbmcgcHJvbWlzZSwgaW5zdGVhZCBvZiB1c2luZyBldmVudCB0YXJnZXRcclxuICAgICAgICBwdWJsaWMgc3RhdGljIHNhdmUoX3RvU2F2ZTogTWFwRmlsZW5hbWVUb0NvbnRlbnQpOiB2b2lkIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgZmlsZW5hbWUgaW4gX3RvU2F2ZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNvbnRlbnQ6IHN0cmluZyA9IF90b1NhdmVbZmlsZW5hbWVdO1xyXG4gICAgICAgICAgICAgICAgbGV0IGJsb2I6IEJsb2IgPSBuZXcgQmxvYihbY29udGVudF0sIHsgdHlwZTogXCJ0ZXh0L3BsYWluXCIgfSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgdXJsOiBzdHJpbmcgPSB3aW5kb3cuVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcclxuICAgICAgICAgICAgICAgIC8vKi8gdXNpbmcgYW5jaG9yIGVsZW1lbnQgZm9yIGRvd25sb2FkXHJcbiAgICAgICAgICAgICAgICBsZXQgZG93bmxvYWRlcjogSFRNTEFuY2hvckVsZW1lbnQ7XHJcbiAgICAgICAgICAgICAgICBkb3dubG9hZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XHJcbiAgICAgICAgICAgICAgICBkb3dubG9hZGVyLnNldEF0dHJpYnV0ZShcImhyZWZcIiwgdXJsKTtcclxuICAgICAgICAgICAgICAgIGRvd25sb2FkZXIuc2V0QXR0cmlidXRlKFwiZG93bmxvYWRcIiwgZmlsZW5hbWUpO1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkb3dubG9hZGVyKTtcclxuICAgICAgICAgICAgICAgIGRvd25sb2FkZXIuY2xpY2soKTtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoZG93bmxvYWRlcik7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuVVJMLnJldm9rZU9iamVjdFVSTCh1cmwpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgZXZlbnQ6IEN1c3RvbUV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KEVWRU5ULkZJTEVfU0FWRUQsIHsgZGV0YWlsOiB7IG1hcEZpbGVuYW1lVG9Db250ZW50OiBfdG9TYXZlIH0gfSk7XHJcbiAgICAgICAgICAgIEZpbGVJb0Jyb3dzZXJMb2NhbC50YXJnZXRTdGF0aWMuZGlzcGF0Y2hFdmVudChldmVudCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGFzeW5jIGhhbmRsZUZpbGVTZWxlY3QoX2V2ZW50OiBFdmVudCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGhhbmRsZUZpbGVTZWxlY3RcIik7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoRmlsZUlvQnJvd3NlckxvY2FsLnNlbGVjdG9yKTtcclxuICAgICAgICAgICAgbGV0IGZpbGVMaXN0OiBGaWxlTGlzdCA9ICg8SFRNTElucHV0RWxlbWVudD5fZXZlbnQudGFyZ2V0KS5maWxlcztcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZmlsZUxpc3QsIGZpbGVMaXN0Lmxlbmd0aCk7XHJcbiAgICAgICAgICAgIGlmIChmaWxlTGlzdC5sZW5ndGggPT0gMClcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIGxldCBsb2FkZWQ6IE1hcEZpbGVuYW1lVG9Db250ZW50ID0ge307XHJcbiAgICAgICAgICAgIGF3YWl0IEZpbGVJb0Jyb3dzZXJMb2NhbC5sb2FkRmlsZXMoZmlsZUxpc3QsIGxvYWRlZCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgZXZlbnQ6IEN1c3RvbUV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KEVWRU5ULkZJTEVfTE9BREVELCB7IGRldGFpbDogeyBtYXBGaWxlbmFtZVRvQ29udGVudDogbG9hZGVkIH0gfSk7XHJcbiAgICAgICAgICAgIEZpbGVJb0Jyb3dzZXJMb2NhbC50YXJnZXRTdGF0aWMuZGlzcGF0Y2hFdmVudChldmVudCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGFzeW5jIGxvYWRGaWxlcyhfZmlsZUxpc3Q6IEZpbGVMaXN0LCBfbG9hZGVkOiBNYXBGaWxlbmFtZVRvQ29udGVudCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBmaWxlIG9mIF9maWxlTGlzdCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY29udGVudDogc3RyaW5nID0gYXdhaXQgbmV3IFJlc3BvbnNlKGZpbGUpLnRleHQoKTtcclxuICAgICAgICAgICAgICAgIF9sb2FkZWRbZmlsZS5uYW1lXSA9IGNvbnRlbnQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iXX0=