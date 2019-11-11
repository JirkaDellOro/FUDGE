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
///<reference path="../Light/Light.ts"/>
var FudgeCore;
///<reference path="../Light/Light.ts"/>
(function (FudgeCore) {
    /**
     * Attaches a [[Light]] to the node
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    /**
     * Defines identifiers for the various types of light this component can provide.
     */
    let LIGHT_TYPE;
    (function (LIGHT_TYPE) {
        LIGHT_TYPE["AMBIENT"] = "ambient";
        LIGHT_TYPE["DIRECTIONAL"] = "directional";
        LIGHT_TYPE["POINT"] = "point";
        LIGHT_TYPE["SPOT"] = "spot";
    })(LIGHT_TYPE = FudgeCore.LIGHT_TYPE || (FudgeCore.LIGHT_TYPE = {}));
    class ComponentLight extends FudgeCore.Component {
        constructor(_type = LIGHT_TYPE.AMBIENT, _color = new FudgeCore.Color(1, 1, 1, 1)) {
            super();
            this.pivot = FudgeCore.Matrix4x4.IDENTITY;
            this.light = null;
            this.singleton = false;
            this.setType(_type);
            this.light.color = _color;
        }
        getLight() {
            return this.light;
        }
        getType() {
            return this.lightType;
        }
        setType(_type) {
            let mtrOld = {};
            if (this.light)
                mtrOld = this.light.getMutator();
            this.light = new ComponentLight.constructors[_type]();
            this.light.mutate(mtrOld);
            this.lightType = _type;
        }
    }
    ComponentLight.constructors = { [LIGHT_TYPE.AMBIENT]: FudgeCore.LightAmbient, [LIGHT_TYPE.DIRECTIONAL]: FudgeCore.LightDirectional, [LIGHT_TYPE.POINT]: FudgeCore.LightPoint, [LIGHT_TYPE.SPOT]: FudgeCore.LightSpot };
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
        static ZERO() {
            let vector = new Vector2();
            return vector;
        }
        /**
         * A shorthand for writing `new Vector2(_scale, _scale)`.
         * @param _scale the scale of the vector. Default: 1
         */
        static ONE(_scale = 1) {
            let vector = new Vector2(_scale, _scale);
            return vector;
        }
        /**
         * A shorthand for writing `new Vector2(0, y)`.
         * @param _scale The number to write in the y coordinate. Default: 1
         * @returns A new vector with the values (0, _scale)
         */
        static Y(_scale = 1) {
            let vector = new Vector2(0, _scale);
            return vector;
        }
        /**
         * A shorthand for writing `new Vector2(x, 0)`.
         * @param _scale The number to write in the x coordinate. Default: 1
         * @returns A new vector with the values (_scale, 0)
         */
        static X(_scale = 1) {
            let vector = new Vector2(_scale, 0);
            return vector;
        }
        /**
         * Normalizes a given vector to the given length without editing the original vector.
         * @param _vector the vector to normalize
         * @param _length the length of the resulting vector. defaults to 1
         * @returns a new vector representing the normalised vector scaled by the given length
         */
        static NORMALIZATION(_vector, _length = 1) {
            let vector = Vector2.ZERO();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRnVkZ2VDb3JlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vU291cmNlL1RyYW5zZmVyL1NlcmlhbGl6ZXIudHMiLCIuLi9Tb3VyY2UvVHJhbnNmZXIvTXV0YWJsZS50cyIsIi4uL1NvdXJjZS9BbmltYXRpb24vQW5pbWF0aW9uLnRzIiwiLi4vU291cmNlL0FuaW1hdGlvbi9BbmltYXRpb25GdW5jdGlvbi50cyIsIi4uL1NvdXJjZS9BbmltYXRpb24vQW5pbWF0aW9uS2V5LnRzIiwiLi4vU291cmNlL0FuaW1hdGlvbi9BbmltYXRpb25TZXF1ZW5jZS50cyIsIi4uL1NvdXJjZS9BdWRpby9BdWRpby50cyIsIi4uL1NvdXJjZS9BdWRpby9BdWRpb0ZpbHRlci50cyIsIi4uL1NvdXJjZS9BdWRpby9BdWRpb0xpc3RlbmVyLnRzIiwiLi4vU291cmNlL0F1ZGlvL0F1ZGlvTG9jYWxpc2F0aW9uLnRzIiwiLi4vU291cmNlL0F1ZGlvL0F1ZGlvU2Vzc2lvbkRhdGEudHMiLCIuLi9Tb3VyY2UvQXVkaW8vQXVkaW9TZXR0aW5ncy50cyIsIi4uL1NvdXJjZS9SZW5kZXIvUmVuZGVySW5qZWN0b3IudHMiLCIuLi9Tb3VyY2UvUmVuZGVyL1JlbmRlck9wZXJhdG9yLnRzIiwiLi4vU291cmNlL0NvYXQvQ29hdC50cyIsIi4uL1NvdXJjZS9Db21wb25lbnQvQ29tcG9uZW50LnRzIiwiLi4vU291cmNlL0NvbXBvbmVudC9Db21wb25lbnRBbmltYXRvci50cyIsIi4uL1NvdXJjZS9Db21wb25lbnQvQ29tcG9uZW50QXVkaW8udHMiLCIuLi9Tb3VyY2UvQ29tcG9uZW50L0NvbXBvbmVudEF1ZGlvTGlzdGVuZXIudHMiLCIuLi9Tb3VyY2UvQ29tcG9uZW50L0NvbXBvbmVudENhbWVyYS50cyIsIi4uL1NvdXJjZS9MaWdodC9MaWdodC50cyIsIi4uL1NvdXJjZS9Db21wb25lbnQvQ29tcG9uZW50TGlnaHQudHMiLCIuLi9Tb3VyY2UvQ29tcG9uZW50L0NvbXBvbmVudE1hdGVyaWFsLnRzIiwiLi4vU291cmNlL0NvbXBvbmVudC9Db21wb25lbnRNZXNoLnRzIiwiLi4vU291cmNlL0NvbXBvbmVudC9Db21wb25lbnRTY3JpcHQudHMiLCIuLi9Tb3VyY2UvQ29tcG9uZW50L0NvbXBvbmVudFRyYW5zZm9ybS50cyIsIi4uL1NvdXJjZS9EZWJ1Zy9EZWJ1Z0ludGVyZmFjZXMudHMiLCIuLi9Tb3VyY2UvRGVidWcvRGVidWdUYXJnZXQudHMiLCIuLi9Tb3VyY2UvRGVidWcvRGVidWdBbGVydC50cyIsIi4uL1NvdXJjZS9EZWJ1Zy9EZWJ1Z0NvbnNvbGUudHMiLCIuLi9Tb3VyY2UvRGVidWcvRGVidWcudHMiLCIuLi9Tb3VyY2UvRGVidWcvRGVidWdEaWFsb2cudHMiLCIuLi9Tb3VyY2UvRGVidWcvRGVidWdUZXh0QXJlYS50cyIsIi4uL1NvdXJjZS9FbmdpbmUvQ29sb3IudHMiLCIuLi9Tb3VyY2UvRW5naW5lL01hdGVyaWFsLnRzIiwiLi4vU291cmNlL0VuZ2luZS9SZWN5Y2xlci50cyIsIi4uL1NvdXJjZS9FbmdpbmUvUmVzb3VyY2VNYW5hZ2VyLnRzIiwiLi4vU291cmNlL0VuZ2luZS9WaWV3cG9ydC50cyIsIi4uL1NvdXJjZS9FdmVudC9FdmVudC50cyIsIi4uL1NvdXJjZS9FdmVudC9FdmVudEtleWJvYXJkLnRzIiwiLi4vU291cmNlL01hdGgvRnJhbWluZy50cyIsIi4uL1NvdXJjZS9NYXRoL01hdHJpeDN4My50cyIsIi4uL1NvdXJjZS9NYXRoL01hdHJpeDR4NC50cyIsIi4uL1NvdXJjZS9NYXRoL1JlY3RhbmdsZS50cyIsIi4uL1NvdXJjZS9NYXRoL1ZlY3RvcjIudHMiLCIuLi9Tb3VyY2UvTWF0aC9WZWN0b3IzLnRzIiwiLi4vU291cmNlL01lc2gvTWVzaC50cyIsIi4uL1NvdXJjZS9NZXNoL01lc2hDdWJlLnRzIiwiLi4vU291cmNlL01lc2gvTWVzaFB5cmFtaWQudHMiLCIuLi9Tb3VyY2UvTWVzaC9NZXNoUXVhZC50cyIsIi4uL1NvdXJjZS9Ob2RlL05vZGUudHMiLCIuLi9Tb3VyY2UvTm9kZS9Ob2RlUmVzb3VyY2UudHMiLCIuLi9Tb3VyY2UvTm9kZS9Ob2RlUmVzb3VyY2VJbnN0YW5jZS50cyIsIi4uL1NvdXJjZS9SYXkvUmF5LnRzIiwiLi4vU291cmNlL1JheS9SYXlIaXQudHMiLCIuLi9Tb3VyY2UvUmVuZGVyL1JlbmRlck1hbmFnZXIudHMiLCIuLi9Tb3VyY2UvU2hhZGVyL1NoYWRlci50cyIsIi4uL1NvdXJjZS9TaGFkZXIvU2hhZGVyRmxhdC50cyIsIi4uL1NvdXJjZS9TaGFkZXIvU2hhZGVyTWF0Q2FwLnRzIiwiLi4vU291cmNlL1NoYWRlci9TaGFkZXJSYXlDYXN0LnRzIiwiLi4vU291cmNlL1NoYWRlci9TaGFkZXJUZXh0dXJlLnRzIiwiLi4vU291cmNlL1NoYWRlci9TaGFkZXJVbmlDb2xvci50cyIsIi4uL1NvdXJjZS9UZXh0dXJlL1RleHR1cmUudHMiLCIuLi9Tb3VyY2UvVGltZS9UaW1lLnRzIiwiLi4vU291cmNlL1RpbWUvTG9vcC50cyIsIi4uL1NvdXJjZS9UcmFuc2Zlci9GaWxlSW9Ccm93c2VyTG9jYWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBLElBQVUsU0FBUyxDQXVMbEI7QUF2TEQsV0FBVSxTQUFTO0lBZ0JmOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0EyQkc7SUFDSCxNQUFzQixVQUFVO1FBSTVCOzs7V0FHRztRQUNJLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxVQUFrQjtZQUM5QyxLQUFLLElBQUksSUFBSSxJQUFJLFVBQVUsQ0FBQyxVQUFVO2dCQUNsQyxJQUFJLFVBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksVUFBVTtvQkFDekMsT0FBTztZQUVmLElBQUksSUFBSSxHQUFXLFVBQVUsQ0FBQyxlQUFlLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ2xFLElBQUksQ0FBQyxJQUFJO2dCQUNMLEtBQUssSUFBSSxVQUFVLElBQUksVUFBVSxDQUFDLFVBQVUsRUFBRTtvQkFD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RUQ7Ozs7V0FJRztRQUNILFNBQVM7WUFDUCxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtnQkFDZixJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDdEMsT0FBTzthQUNSO1lBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUU7Z0JBQ3ZDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7Z0JBQzFCLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDN0IsT0FBTzthQUNSO1lBRUQsSUFBSSxFQUFFLEdBQVcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7WUFFcEQsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztZQUMxQixJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDO1lBRTdCLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDL0gsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxL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U0FBUztJQUNmOztPQUVHO0lBQ0gsTUFBYSxLQUFNLFNBQVEsVUFBQSxPQUFPO1FBTTlCLFlBQVksS0FBYSxDQUFDLEVBQUUsS0FBYSxDQUFDLEVBQUUsS0FBYSxDQUFDLEVBQUUsS0FBYSxDQUFDO1lBQ3RFLEtBQUssRUFBRSxDQUFDO1lBQ1IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNyQyxDQUFDO1FBRU0sTUFBTSxLQUFLLEtBQUs7WUFDbkIsT0FBTyxJQUFJLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNqQyxDQUFDO1FBQ00sTUFBTSxLQUFLLEtBQUs7WUFDbkIsT0FBTyxJQUFJLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNqQyxDQUFDO1FBQ00sTUFBTSxLQUFLLEdBQUc7WUFDakIsT0FBTyxJQUFJLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNqQyxDQUFDO1FBQ00sTUFBTSxLQUFLLEtBQUs7WUFDbkIsT0FBTyxJQUFJLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNqQyxDQUFDO1FBQ00sTUFBTSxLQUFLLElBQUk7WUFDbEIsT0FBTyxJQUFJLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNqQyxDQUFDO1FBRU0sV0FBVyxDQUFDLEVBQVUsRUFBRSxFQUFVLEVBQUUsRUFBVSxFQUFFLEVBQVU7WUFDN0QsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxDQUFD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SUFBSSxHQUFHLEdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLElBQUksR0FBRyxHQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNyQyxJQUFJLEdBQUcsR0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDckMsSUFBSSxHQUFHLEdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLElBQUksR0FBRyxHQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNyQyxJQUFJLEdBQUcsR0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDckMsSUFBSSxHQUFHLEdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLElBQUksR0FBRyxHQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNyQyxJQUFJLEdBQUcsR0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDckMsSUFBSSxHQUFHLEdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLElBQUksR0FBRyxHQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNyQyxJQUFJLEdBQUcsR0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDckMsSUFBSSxHQUFHLEdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLElBQUksR0FBRyxHQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNyQyxJQUFJLEdBQUcsR0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDckMsSUFBSSxHQUFHLEdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLElBQUksR0FBRyxHQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNyQyxJQUFJLE1BQU0sR0FBYyxJQUFJLFNBQVMsQ0FBQztZQUN0QyxNQUFNLENBQUMsSUFBSSxHQUFHO2dCQUNWLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztnQkFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO2dCQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7Z0JBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztnQkFDakMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO2dCQUNqQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7Z0JBQ2pDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztnQkFDakMsR0FBRyxHQUFHLEdB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Q0FBQyxJQUFJLENBQUM7WUFDOUIsMkNBQTJDO1lBQzNDLE1BQU0sTUFBTSxHQUFjLFVBQUEsUUFBUSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNsRCxJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FDYjtnQkFDRSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztnQkFDN0MsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7Z0JBQzdDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO2dCQUM3QyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztnQkFDN0MsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7Z0JBQzdDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO2dCQUM3QyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztnQkFDN0MsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7Z0JBQzdDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO2dCQUM3QyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztnQkFDN0MsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7Z0JBQzdDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO2dCQUM3QyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztnQkFDN0MsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7Z0JBQzdDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO2dCQUM3QyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRzthQUM5QyxDQUFDLENBQUM7WUFDTCxPQUFPLE1BQU0sQ0FBQztRQUNoQixDQUFDO1FBRUQ7OztXQUdHO1FBQ0ksTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFrQjtZQUN4QyxJQUFJLENBQUMsR0FBaUIsT0FBTyxDQUFDLElBQUksQ0FBQztZQUNuQyxJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLElBQUksR0FBVyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzdCLElBQUksSUFBSSxHQUFXLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDN0IsSUFBSSxJQUFJLEdBQVcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM3QixJQUFJLElBQUksR0FBVyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzdCLElBQUksSUFBSSxHQUFXLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDN0IsSUFBSSxJQUFJLEdBQVcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM3QixJQUFJLElBQUksR0FBVyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzdCLElBQUksSUFBSSxHQUFXLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDN0IsSUFBSSxJQUFJLEdBQVcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM3QixJQUFJLElBQUksR0FBVyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzdCLElBQUksS0FBSyxHQUFXLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDOUIsSUFBSSxLQUFLLEdBQVcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM5QixJQUFJLEtBQUssR0FBVyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzlCLElBQUksS0FBSyxHQUFXLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDOUIsSUFBSSxLQUFLLEdBQVcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM5QixJQUFJLEtBQUssR0FBVyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzlCLElBQUksS0FBSyxHQUFXLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDOUIsSUFBSSxLQUFLLEdBQVcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM5QixJQUFJLEtBQUssR0FBVyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzlCLElBQUksS0FBSyxHQUFXLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDOUIsSUFBSSxLQUFLLEdBQVcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM5QixJQUFJLEtBQUssR0FBVyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzlCLElBQUksS0FBSyxHQUFXLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDOUIsSUFBSSxLQUFLLEdBQVcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUU5QixJQUFJLEVBQUUsR0FBVyxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDO2dCQUNyRCxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFFekMsSUFBSSxFQUFFLEdBQVcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsQ0FBQztnQkFDckQsQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQ3pDLElBQUksRUFBRSxHQUFXLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUM7Z0JBQ3RELENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQztZQUMxQyxJQUFJLEVBQUUsR0FBVyxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDO2dCQUN0RCxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFFMUMsSUFBSSxDQUFDLEdBQVcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBRWxFLHlDQUF5QztZQUN6QyxNQUFNLE1BQU0sR0FBYyxVQUFBLFFBQVEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDbEQsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7Z0JBQ2QsQ0FBQyxHQUFHLEVBQUU7Z0JBQ04sQ0FBQyxHQUFHLEVBQUU7Z0JBQ04sQ0FBQyxHQUFHLEVBQUU7Z0JBQ04sQ0FBQyxHQUFHLEVBQUU7Z0JBQ04sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDckYsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDckYsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDdkYsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDdkYsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDM0YsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDM0YsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDM0YsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDM0YsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxL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LEVBaEVTLFNBQVMsS0FBVCxTQUFTLFFBZ0VsQiIsInNvdXJjZXNDb250ZW50IjpbIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiBuby1hbnlcclxuICAgIGV4cG9ydCB0eXBlIEdlbmVyYWwgPSBhbnk7XHJcblxyXG4gICAgZXhwb3J0IGludGVyZmFjZSBTZXJpYWxpemF0aW9uIHtcclxuICAgICAgICBbdHlwZTogc3RyaW5nXTogR2VuZXJhbDtcclxuICAgIH1cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgU2VyaWFsaXphYmxlIHtcclxuICAgICAgICBzZXJpYWxpemUoKTogU2VyaWFsaXphdGlvbjtcclxuICAgICAgICBkZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbik6IFNlcmlhbGl6YWJsZTtcclxuICAgIH1cclxuXHJcbiAgICBpbnRlcmZhY2UgTmFtZXNwYWNlUmVnaXN0ZXIge1xyXG4gICAgICAgIFtuYW1lOiBzdHJpbmddOiBPYmplY3Q7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGVzIHRoZSBleHRlcm5hbCBzZXJpYWxpemF0aW9uIGFuZCBkZXNlcmlhbGl6YXRpb24gb2YgW1tTZXJpYWxpemFibGVdXSBvYmplY3RzLiBUaGUgaW50ZXJuYWwgcHJvY2VzcyBpcyBoYW5kbGVkIGJ5IHRoZSBvYmplY3RzIHRoZW1zZWx2ZXMuICBcclxuICAgICAqIEEgW1tTZXJpYWxpemF0aW9uXV0gb2JqZWN0IGNhbiBiZSBjcmVhdGVkIGZyb20gYSBbW1NlcmlhbGl6YWJsZV1dIG9iamVjdCBhbmQgYSBKU09OLVN0cmluZyBtYXkgYmUgY3JlYXRlZCBmcm9tIHRoYXQuICBcclxuICAgICAqIFZpY2UgdmVyc2EsIGEgSlNPTi1TdHJpbmcgY2FuIGJlIHBhcnNlZCB0byBhIFtbU2VyaWFsaXphdGlvbl1dIHdoaWNoIGNhbiBiZSBkZXNlcmlhbGl6ZWQgdG8gYSBbW1NlcmlhbGl6YWJsZV1dIG9iamVjdC5cclxuICAgICAqIGBgYHBsYWludGV4dFxyXG4gICAgICogIFtTZXJpYWxpemFibGVdIOKGkiAoc2VyaWFsaXplKSDihpIgW1NlcmlhbGl6YXRpb25dIOKGkiAoc3RyaW5naWZ5KSAgXHJcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4oaTXHJcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbU3RyaW5nXVxyXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKGk1xyXG4gICAgICogIFtTZXJpYWxpemFibGVdIOKGkCAoZGVzZXJpYWxpemUpIOKGkCBbU2VyaWFsaXphdGlvbl0g4oaQIChwYXJzZSlcclxuICAgICAqIGBgYCAgICAgIFxyXG4gICAgICogV2hpbGUgdGhlIGludGVybmFsIHNlcmlhbGl6ZS9kZXNlcmlhbGl6ZSBtZXRob2RzIG9mIHRoZSBvYmplY3RzIGNhcmUgb2YgdGhlIHNlbGVjdGlvbiBvZiBpbmZvcm1hdGlvbiBuZWVkZWQgdG8gcmVjcmVhdGUgdGhlIG9iamVjdCBhbmQgaXRzIHN0cnVjdHVyZSwgIFxyXG4gICAgICogdGhlIFtbU2VyaWFsaXplcl1dIGtlZXBzIHRyYWNrIG9mIHRoZSBuYW1lc3BhY2VzIGFuZCBjbGFzc2VzIGluIG9yZGVyIHRvIHJlY3JlYXRlIFtbU2VyaWFsaXphYmxlXV0gb2JqZWN0cy4gVGhlIGdlbmVyYWwgc3RydWN0dXJlIG9mIGEgW1tTZXJpYWxpemF0aW9uXV0gaXMgYXMgZm9sbG93cyAgXHJcbiAgICAgKiBgYGBwbGFpbnRleHRcclxuICAgICAqIHtcclxuICAgICAqICAgICAgbmFtZXNwYWNlTmFtZS5jbGFzc05hbWU6IHtcclxuICAgICAqICAgICAgICAgIHByb3BlcnR5TmFtZTogcHJvcGVydHlWYWx1ZSxcclxuICAgICAqICAgICAgICAgIC4uLixcclxuICAgICAqICAgICAgICAgIHByb3BlcnR5TmFtZU9mUmVmZXJlbmNlOiBTZXJpYWxpemF0aW9uT2ZUaGVSZWZlcmVuY2VkT2JqZWN0LFxyXG4gICAgICogICAgICAgICAgLi4uLFxyXG4gICAgICogICAgICAgICAgY29uc3RydWN0b3JOYW1lT2ZTdXBlcmNsYXNzOiBTZXJpYWxpemF0aW9uT2ZTdXBlckNsYXNzXHJcbiAgICAgKiAgICAgIH1cclxuICAgICAqIH1cclxuICAgICAqIGBgYFxyXG4gICAgICogU2luY2UgdGhlIGluc3RhbmNlIG9mIHRoZSBzdXBlcmNsYXNzIGlzIGNyZWF0ZWQgYXV0b21hdGljYWxseSB3aGVuIGFuIG9iamVjdCBpcyBjcmVhdGVkLCBcclxuICAgICAqIHRoZSBTZXJpYWxpemF0aW9uT2ZTdXBlckNsYXNzIG9taXRzIHRoZSB0aGUgbmFtZXNwYWNlTmFtZS5jbGFzc05hbWUga2V5IGFuZCBjb25zaXN0cyBvbmx5IG9mIGl0cyB2YWx1ZS4gXHJcbiAgICAgKiBUaGUgY29uc3RydWN0b3JOYW1lT2ZTdXBlcmNsYXNzIGlzIGdpdmVuIGluc3RlYWQgYXMgYSBwcm9wZXJ0eSBuYW1lIGluIHRoZSBzZXJpYWxpemF0aW9uIG9mIHRoZSBzdWJjbGFzcy5cclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGFic3RyYWN0IGNsYXNzIFNlcmlhbGl6ZXIge1xyXG4gICAgICAgIC8qKiBJbiBvcmRlciBmb3IgdGhlIFNlcmlhbGl6ZXIgdG8gY3JlYXRlIGNsYXNzIGluc3RhbmNlcywgaXQgbmVlZHMgYWNjZXNzIHRvIHRoZSBhcHByb3ByaWF0ZSBuYW1lc3BhY2VzICovXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgbmFtZXNwYWNlczogTmFtZXNwYWNlUmVnaXN0ZXIgPSB7IFwixpJcIjogRnVkZ2VDb3JlIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlZ2lzdGVycyBhIG5hbWVzcGFjZSB0byB0aGUgW1tTZXJpYWxpemVyXV0sIHRvIGVuYWJsZSBhdXRvbWF0aWMgaW5zdGFudGlhdGlvbiBvZiBjbGFzc2VzIGRlZmluZWQgd2l0aGluXHJcbiAgICAgICAgICogQHBhcmFtIF9uYW1lc3BhY2UgXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyByZWdpc3Rlck5hbWVzcGFjZShfbmFtZXNwYWNlOiBPYmplY3QpOiB2b2lkIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgbmFtZSBpbiBTZXJpYWxpemVyLm5hbWVzcGFjZXMpXHJcbiAgICAgICAgICAgICAgICBpZiAoU2VyaWFsaXplci5uYW1lc3BhY2VzW25hbWVdID09IF9uYW1lc3BhY2UpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgbGV0IG5hbWU6IHN0cmluZyA9IFNlcmlhbGl6ZXIuZmluZE5hbWVzcGFjZUluKF9uYW1lc3BhY2UsIHdpbmRvdyk7XHJcbiAgICAgICAgICAgIGlmICghbmFtZSlcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHBhcmVudE5hbWUgaW4gU2VyaWFsaXplci5uYW1lc3BhY2VzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZSA9IFNlcmlhbGl6ZXIuZmluZE5hbWVzcGFjZUluKF9uYW1lc3BhY2UsIFNlcmlhbGl6ZXIubmFtZXNwYWNlc1twYXJlbnROYW1lXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSA9IHBhcmVudE5hbWUgKyBcIi5cIiArIG5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghbmFtZSlcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5hbWVzcGFjZSBub3QgZm91bmQuIE1heWJlIHBhcmVudCBuYW1lc3BhY2UgaGFzbid0IGJlZW4gcmVnaXN0ZXJlZCBiZWZvcmU/XCIpO1xyXG5cclxuICAgICAgICAgICAgU2VyaWFsaXplci5uYW1lc3BhY2VzW25hbWVdID0gX25hbWVzcGFjZTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIGEgamF2YXNjcmlwdCBvYmplY3QgcmVwcmVzZW50aW5nIHRoZSBzZXJpYWxpemFibGUgRlVER0Utb2JqZWN0IGdpdmVuLFxyXG4gICAgICAgICAqIGluY2x1ZGluZyBhdHRhY2hlZCBjb21wb25lbnRzLCBjaGlsZHJlbiwgc3VwZXJjbGFzcy1vYmplY3RzIGFsbCBpbmZvcm1hdGlvbiBuZWVkZWQgZm9yIHJlY29uc3RydWN0aW9uXHJcbiAgICAgICAgICogQHBhcmFtIF9vYmplY3QgQW4gb2JqZWN0IHRvIHNlcmlhbGl6ZSwgaW1wbGVtZW50aW5nIHRoZSBbW1NlcmlhbGl6YWJsZV1dIGludGVyZmFjZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgc2VyaWFsaXplKF9vYmplY3Q6IFNlcmlhbGl6YWJsZSk6IFNlcmlhbGl6YXRpb24ge1xyXG4gICAgICAgICAgICBsZXQgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IHt9O1xyXG4gICAgICAgICAgICAvLyBUT0RPOiBzYXZlIHRoZSBuYW1lc3BhY2Ugd2l0aCB0aGUgY29uc3RydWN0b3JzIG5hbWVcclxuICAgICAgICAgICAgLy8gc2VyaWFsaXphdGlvbltfb2JqZWN0LmNvbnN0cnVjdG9yLm5hbWVdID0gX29iamVjdC5zZXJpYWxpemUoKTtcclxuICAgICAgICAgICAgbGV0IHBhdGg6IHN0cmluZyA9IHRoaXMuZ2V0RnVsbFBhdGgoX29iamVjdCk7XHJcbiAgICAgICAgICAgIGlmICghcGF0aClcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTmFtZXNwYWNlIG9mIHNlcmlhbGl6YWJsZSBvYmplY3Qgb2YgdHlwZSAke19vYmplY3QuY29uc3RydWN0b3IubmFtZX0gbm90IGZvdW5kLiBNYXliZSB0aGUgbmFtZXNwYWNlIGhhc24ndCBiZWVuIHJlZ2lzdGVyZWQgb3IgdGhlIGNsYXNzIG5vdCBleHBvcnRlZD9gKTtcclxuICAgICAgICAgICAgc2VyaWFsaXphdGlvbltwYXRoXSA9IF9vYmplY3Quc2VyaWFsaXplKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBzZXJpYWxpemF0aW9uO1xyXG4gICAgICAgICAgICAvLyByZXR1cm4gX29iamVjdC5zZXJpYWxpemUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgYSBGVURHRS1vYmplY3QgcmVjb25zdHJ1Y3RlZCBmcm9tIHRoZSBpbmZvcm1hdGlvbiBpbiB0aGUgW1tTZXJpYWxpemF0aW9uXV0gZ2l2ZW4sXHJcbiAgICAgICAgICogaW5jbHVkaW5nIGF0dGFjaGVkIGNvbXBvbmVudHMsIGNoaWxkcmVuLCBzdXBlcmNsYXNzLW9iamVjdHNcclxuICAgICAgICAgKiBAcGFyYW0gX3NlcmlhbGl6YXRpb24gXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBkZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbik6IFNlcmlhbGl6YWJsZSB7XHJcbiAgICAgICAgICAgIGxldCByZWNvbnN0cnVjdDogU2VyaWFsaXphYmxlO1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgLy8gbG9vcCBjb25zdHJ1Y3RlZCBzb2xlbHkgdG8gYWNjZXNzIHR5cGUtcHJvcGVydHkuIE9ubHkgb25lIGV4cGVjdGVkIVxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgcGF0aCBpbiBfc2VyaWFsaXphdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHJlY29uc3RydWN0ID0gbmV3ICg8R2VuZXJhbD5GdWRnZSlbdHlwZU5hbWVdO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlY29uc3RydWN0ID0gU2VyaWFsaXplci5yZWNvbnN0cnVjdChwYXRoKTtcclxuICAgICAgICAgICAgICAgICAgICByZWNvbnN0cnVjdC5kZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbltwYXRoXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlY29uc3RydWN0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGNhdGNoIChtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJEZXNlcmlhbGl6YXRpb24gZmFpbGVkOiBcIiArIG1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9UT0RPOiBpbXBsZW1lbnQgcHJldHRpZmllciB0byBtYWtlIEpTT04tU3RyaW5naWZpY2F0aW9uIG9mIHNlcmlhbGl6YXRpb25zIG1vcmUgcmVhZGFibGUsIGUuZy4gcGxhY2luZyB4LCB5IGFuZCB6IGluIG9uZSBsaW5lXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBwcmV0dGlmeShfanNvbjogc3RyaW5nKTogc3RyaW5nIHsgcmV0dXJuIF9qc29uOyB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgYSBmb3JtYXR0ZWQsIGh1bWFuIHJlYWRhYmxlIEpTT04tU3RyaW5nLCByZXByZXNlbnRpbmcgdGhlIGdpdmVuIFtbU2VyaWFsaXphaW9uXV0gdGhhdCBtYXkgaGF2ZSBiZWVuIGNyZWF0ZWQgYnkgW1tTZXJpYWxpemVyXV0uc2VyaWFsaXplXHJcbiAgICAgICAgICogQHBhcmFtIF9zZXJpYWxpemF0aW9uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBzdHJpbmdpZnkoX3NlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24pOiBzdHJpbmcge1xyXG4gICAgICAgICAgICAvLyBhZGp1c3RtZW50cyB0byBzZXJpYWxpemF0aW9uIGNhbiBiZSBtYWRlIGhlcmUgYmVmb3JlIHN0cmluZ2lmaWNhdGlvbiwgaWYgZGVzaXJlZFxyXG4gICAgICAgICAgICBsZXQganNvbjogc3RyaW5nID0gSlNPTi5zdHJpbmdpZnkoX3NlcmlhbGl6YXRpb24sIG51bGwsIDIpO1xyXG4gICAgICAgICAgICBsZXQgcHJldHR5OiBzdHJpbmcgPSBTZXJpYWxpemVyLnByZXR0aWZ5KGpzb24pO1xyXG4gICAgICAgICAgICByZXR1cm4gcHJldHR5O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyBhIFtbU2VyaWFsaXphdGlvbl1dIGNyZWF0ZWQgZnJvbSB0aGUgZ2l2ZW4gSlNPTi1TdHJpbmcuIFJlc3VsdCBtYXkgYmUgcGFzc2VkIHRvIFtbU2VyaWFsaXplcl1dLmRlc2VyaWFsaXplXHJcbiAgICAgICAgICogQHBhcmFtIF9qc29uIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgcGFyc2UoX2pzb246IHN0cmluZyk6IFNlcmlhbGl6YXRpb24ge1xyXG4gICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShfanNvbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENyZWF0ZXMgYW4gb2JqZWN0IG9mIHRoZSBjbGFzcyBkZWZpbmVkIHdpdGggdGhlIGZ1bGwgcGF0aCBpbmNsdWRpbmcgdGhlIG5hbWVzcGFjZU5hbWUocykgYW5kIHRoZSBjbGFzc05hbWUgc2VwZXJhdGVkIGJ5IGRvdHMoLikgXHJcbiAgICAgICAgICogQHBhcmFtIF9wYXRoIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHJlY29uc3RydWN0KF9wYXRoOiBzdHJpbmcpOiBTZXJpYWxpemFibGUge1xyXG4gICAgICAgICAgICBsZXQgdHlwZU5hbWU6IHN0cmluZyA9IF9wYXRoLnN1YnN0cihfcGF0aC5sYXN0SW5kZXhPZihcIi5cIikgKyAxKTtcclxuICAgICAgICAgICAgbGV0IG5hbWVzcGFjZTogT2JqZWN0ID0gU2VyaWFsaXplci5nZXROYW1lc3BhY2UoX3BhdGgpO1xyXG4gICAgICAgICAgICBpZiAoIW5hbWVzcGFjZSlcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTmFtZXNwYWNlIG9mIHNlcmlhbGl6YWJsZSBvYmplY3Qgb2YgdHlwZSAke3R5cGVOYW1lfSBub3QgZm91bmQuIE1heWJlIHRoZSBuYW1lc3BhY2UgaGFzbid0IGJlZW4gcmVnaXN0ZXJlZD9gKTtcclxuICAgICAgICAgICAgbGV0IHJlY29uc3RydWN0aW9uOiBTZXJpYWxpemFibGUgPSBuZXcgKDxHZW5lcmFsPm5hbWVzcGFjZSlbdHlwZU5hbWVdO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVjb25zdHJ1Y3Rpb247XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHRoZSBmdWxsIHBhdGggdG8gdGhlIGNsYXNzIG9mIHRoZSBvYmplY3QsIGlmIGZvdW5kIGluIHRoZSByZWdpc3RlcmVkIG5hbWVzcGFjZXNcclxuICAgICAgICAgKiBAcGFyYW0gX29iamVjdCBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBnZXRGdWxsUGF0aChfb2JqZWN0OiBTZXJpYWxpemFibGUpOiBzdHJpbmcge1xyXG4gICAgICAgICAgICBsZXQgdHlwZU5hbWU6IHN0cmluZyA9IF9vYmplY3QuY29uc3RydWN0b3IubmFtZTtcclxuICAgICAgICAgICAgLy8gRGVidWcubG9nKFwiU2VhcmNoaW5nIG5hbWVzcGFjZSBvZjogXCIgKyB0eXBlTmFtZSk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IG5hbWVzcGFjZU5hbWUgaW4gU2VyaWFsaXplci5uYW1lc3BhY2VzKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZm91bmQ6IEdlbmVyYWwgPSAoPEdlbmVyYWw+U2VyaWFsaXplci5uYW1lc3BhY2VzKVtuYW1lc3BhY2VOYW1lXVt0eXBlTmFtZV07XHJcbiAgICAgICAgICAgICAgICBpZiAoZm91bmQgJiYgX29iamVjdCBpbnN0YW5jZW9mIGZvdW5kKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuYW1lc3BhY2VOYW1lICsgXCIuXCIgKyB0eXBlTmFtZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgdGhlIG5hbWVzcGFjZS1vYmplY3QgZGVmaW5lZCB3aXRoaW4gdGhlIGZ1bGwgcGF0aCwgaWYgcmVnaXN0ZXJlZFxyXG4gICAgICAgICAqIEBwYXJhbSBfcGF0aFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGdldE5hbWVzcGFjZShfcGF0aDogc3RyaW5nKTogT2JqZWN0IHtcclxuICAgICAgICAgICAgbGV0IG5hbWVzcGFjZU5hbWU6IHN0cmluZyA9IF9wYXRoLnN1YnN0cigwLCBfcGF0aC5sYXN0SW5kZXhPZihcIi5cIikpO1xyXG4gICAgICAgICAgICByZXR1cm4gU2VyaWFsaXplci5uYW1lc3BhY2VzW25hbWVzcGFjZU5hbWVdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRmluZHMgdGhlIG5hbWVzcGFjZS1vYmplY3QgaW4gcHJvcGVydGllcyBvZiB0aGUgcGFyZW50LW9iamVjdCAoZS5nLiB3aW5kb3cpLCBpZiBwcmVzZW50XHJcbiAgICAgICAgICogQHBhcmFtIF9uYW1lc3BhY2UgXHJcbiAgICAgICAgICogQHBhcmFtIF9wYXJlbnQgXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgZmluZE5hbWVzcGFjZUluKF9uYW1lc3BhY2U6IE9iamVjdCwgX3BhcmVudDogT2JqZWN0KTogc3RyaW5nIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgcHJvcCBpbiBfcGFyZW50KVxyXG4gICAgICAgICAgICAgICAgaWYgKCg8R2VuZXJhbD5fcGFyZW50KVtwcm9wXSA9PSBfbmFtZXNwYWNlKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwcm9wO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogSW50ZXJmYWNlIGRlc2NyaWJpbmcgdGhlIGRhdGF0eXBlcyBvZiB0aGUgYXR0cmlidXRlcyBhIG11dGF0b3IgYXMgc3RyaW5ncyBcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGludGVyZmFjZSBNdXRhdG9yQXR0cmlidXRlVHlwZXMge1xyXG4gICAgICAgIFthdHRyaWJ1dGU6IHN0cmluZ106IHN0cmluZyB8IE9iamVjdDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogSW50ZXJmYWNlIGRlc2NyaWJpbmcgYSBtdXRhdG9yLCB3aGljaCBpcyBhbiBhc3NvY2lhdGl2ZSBhcnJheSB3aXRoIG5hbWVzIG9mIGF0dHJpYnV0ZXMgYW5kIHRoZWlyIGNvcnJlc3BvbmRpbmcgdmFsdWVzXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgTXV0YXRvciB7XHJcbiAgICAgICAgW2F0dHJpYnV0ZTogc3RyaW5nXTogT2JqZWN0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBJbnRlcmZhY2VzIGRlZGljYXRlZCBmb3IgZWFjaCBwdXJwb3NlLiBFeHRyYSBhdHRyaWJ1dGUgbmVjZXNzYXJ5IGZvciBjb21waWxldGltZSB0eXBlIGNoZWNraW5nLCBub3QgZXhpc3RlbnQgYXQgcnVudGltZVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIE11dGF0b3JGb3JBbmltYXRpb24gZXh0ZW5kcyBNdXRhdG9yIHsgcmVhZG9ubHkgZm9yQW5pbWF0aW9uOiBudWxsOyB9XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIE11dGF0b3JGb3JVc2VySW50ZXJmYWNlIGV4dGVuZHMgTXV0YXRvciB7IHJlYWRvbmx5IGZvclVzZXJJbnRlcmZhY2U6IG51bGw7IH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEJhc2UgY2xhc3MgZm9yIGFsbCB0eXBlcyBiZWluZyBtdXRhYmxlIHVzaW5nIFtbTXV0YXRvcl1dLW9iamVjdHMsIHRodXMgcHJvdmlkaW5nIGFuZCB1c2luZyBpbnRlcmZhY2VzIGNyZWF0ZWQgYXQgcnVudGltZS4gIFxyXG4gICAgICogTXV0YWJsZXMgcHJvdmlkZSBhIFtbTXV0YXRvcl1dIHRoYXQgaXMgYnVpbGQgYnkgY29sbGVjdGluZyBhbGwgb2JqZWN0LXByb3BlcnRpZXMgdGhhdCBhcmUgZWl0aGVyIG9mIGEgcHJpbWl0aXZlIHR5cGUgb3IgYWdhaW4gTXV0YWJsZS5cclxuICAgICAqIFN1YmNsYXNzZXMgY2FuIGVpdGhlciByZWR1Y2UgdGhlIHN0YW5kYXJkIFtbTXV0YXRvcl1dIGJ1aWx0IGJ5IHRoaXMgYmFzZSBjbGFzcyBieSBkZWxldGluZyBwcm9wZXJ0aWVzIG9yIGltcGxlbWVudCBhbiBpbmRpdmlkdWFsIGdldE11dGF0b3ItbWV0aG9kLlxyXG4gICAgICogVGhlIHByb3ZpZGVkIHByb3BlcnRpZXMgb2YgdGhlIFtbTXV0YXRvcl1dIG11c3QgbWF0Y2ggcHVibGljIHByb3BlcnRpZXMgb3IgZ2V0dGVycy9zZXR0ZXJzIG9mIHRoZSBvYmplY3QuXHJcbiAgICAgKiBPdGhlcndpc2UsIHRoZXkgd2lsbCBiZSBpZ25vcmVkIGlmIG5vdCBoYW5kbGVkIGJ5IGFuIG92ZXJyaWRlIG9mIHRoZSBtdXRhdGUtbWV0aG9kIGluIHRoZSBzdWJjbGFzcyBhbmQgdGhyb3cgZXJyb3JzIGluIGFuIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkIHVzZXItaW50ZXJmYWNlIGZvciB0aGUgb2JqZWN0LlxyXG4gICAgICovXHJcbiAgICBleHBvcnQgYWJzdHJhY3QgY2xhc3MgTXV0YWJsZSBleHRlbmRzIEV2ZW50VGFyZ2V0IHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXRyaWV2ZXMgdGhlIHR5cGUgb2YgdGhpcyBtdXRhYmxlIHN1YmNsYXNzIGFzIHRoZSBuYW1lIG9mIHRoZSBydW50aW1lIGNsYXNzXHJcbiAgICAgICAgICogQHJldHVybnMgVGhlIHR5cGUgb2YgdGhlIG11dGFibGVcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0IHR5cGUoKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IubmFtZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ29sbGVjdCBhcHBsaWNhYmxlIGF0dHJpYnV0ZXMgb2YgdGhlIGluc3RhbmNlIGFuZCBjb3BpZXMgb2YgdGhlaXIgdmFsdWVzIGluIGEgTXV0YXRvci1vYmplY3RcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0TXV0YXRvcigpOiBNdXRhdG9yIHtcclxuICAgICAgICAgICAgbGV0IG11dGF0b3I6IE11dGF0b3IgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIC8vIGNvbGxlY3QgcHJpbWl0aXZlIGFuZCBtdXRhYmxlIGF0dHJpYnV0ZXNcclxuICAgICAgICAgICAgZm9yIChsZXQgYXR0cmlidXRlIGluIHRoaXMpIHtcclxuICAgICAgICAgICAgICAgIGxldCB2YWx1ZTogT2JqZWN0ID0gdGhpc1thdHRyaWJ1dGVdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgRnVuY3Rpb24pXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBPYmplY3QgJiYgISh2YWx1ZSBpbnN0YW5jZW9mIE11dGFibGUpKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgbXV0YXRvclthdHRyaWJ1dGVdID0gdGhpc1thdHRyaWJ1dGVdO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBtdXRhdG9yIGNhbiBiZSByZWR1Y2VkIGJ1dCBub3QgZXh0ZW5kZWQhXHJcbiAgICAgICAgICAgIE9iamVjdC5wcmV2ZW50RXh0ZW5zaW9ucyhtdXRhdG9yKTtcclxuICAgICAgICAgICAgLy8gZGVsZXRlIHVud2FudGVkIGF0dHJpYnV0ZXNcclxuICAgICAgICAgICAgdGhpcy5yZWR1Y2VNdXRhdG9yKG11dGF0b3IpO1xyXG5cclxuICAgICAgICAgICAgLy8gcmVwbGFjZSByZWZlcmVuY2VzIHRvIG11dGFibGUgb2JqZWN0cyB3aXRoIHJlZmVyZW5jZXMgdG8gY29waWVzXHJcbiAgICAgICAgICAgIGZvciAobGV0IGF0dHJpYnV0ZSBpbiBtdXRhdG9yKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdmFsdWU6IE9iamVjdCA9IG11dGF0b3JbYXR0cmlidXRlXTtcclxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIE11dGFibGUpXHJcbiAgICAgICAgICAgICAgICAgICAgbXV0YXRvclthdHRyaWJ1dGVdID0gdmFsdWUuZ2V0TXV0YXRvcigpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbXV0YXRvcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENvbGxlY3QgdGhlIGF0dHJpYnV0ZXMgb2YgdGhlIGluc3RhbmNlIGFuZCB0aGVpciB2YWx1ZXMgYXBwbGljYWJsZSBmb3IgYW5pbWF0aW9uLlxyXG4gICAgICAgICAqIEJhc2ljIGZ1bmN0aW9uYWxpdHkgaXMgaWRlbnRpY2FsIHRvIFtbZ2V0TXV0YXRvcl1dLCByZXR1cm5lZCBtdXRhdG9yIHNob3VsZCB0aGVuIGJlIHJlZHVjZWQgYnkgdGhlIHN1YmNsYXNzZWQgaW5zdGFuY2VcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0TXV0YXRvckZvckFuaW1hdGlvbigpOiBNdXRhdG9yRm9yQW5pbWF0aW9uIHtcclxuICAgICAgICAgICAgcmV0dXJuIDxNdXRhdG9yRm9yQW5pbWF0aW9uPnRoaXMuZ2V0TXV0YXRvcigpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDb2xsZWN0IHRoZSBhdHRyaWJ1dGVzIG9mIHRoZSBpbnN0YW5jZSBhbmQgdGhlaXIgdmFsdWVzIGFwcGxpY2FibGUgZm9yIHRoZSB1c2VyIGludGVyZmFjZS5cclxuICAgICAgICAgKiBCYXNpYyBmdW5jdGlvbmFsaXR5IGlzIGlkZW50aWNhbCB0byBbW2dldE11dGF0b3JdXSwgcmV0dXJuZWQgbXV0YXRvciBzaG91bGQgdGhlbiBiZSByZWR1Y2VkIGJ5IHRoZSBzdWJjbGFzc2VkIGluc3RhbmNlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGdldE11dGF0b3JGb3JVc2VySW50ZXJmYWNlKCk6IE11dGF0b3JGb3JVc2VySW50ZXJmYWNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIDxNdXRhdG9yRm9yVXNlckludGVyZmFjZT50aGlzLmdldE11dGF0b3IoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyBhbiBhc3NvY2lhdGl2ZSBhcnJheSB3aXRoIHRoZSBzYW1lIGF0dHJpYnV0ZXMgYXMgdGhlIGdpdmVuIG11dGF0b3IsIGJ1dCB3aXRoIHRoZSBjb3JyZXNwb25kaW5nIHR5cGVzIGFzIHN0cmluZy12YWx1ZXNcclxuICAgICAgICAgKiBEb2VzIG5vdCByZWN1cnNlIGludG8gb2JqZWN0cyFcclxuICAgICAgICAgKiBAcGFyYW0gX211dGF0b3IgXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGdldE11dGF0b3JBdHRyaWJ1dGVUeXBlcyhfbXV0YXRvcjogTXV0YXRvcik6IE11dGF0b3JBdHRyaWJ1dGVUeXBlcyB7XHJcbiAgICAgICAgICAgIGxldCB0eXBlczogTXV0YXRvckF0dHJpYnV0ZVR5cGVzID0ge307XHJcbiAgICAgICAgICAgIGZvciAobGV0IGF0dHJpYnV0ZSBpbiBfbXV0YXRvcikge1xyXG4gICAgICAgICAgICAgICAgbGV0IHR5cGU6IHN0cmluZyA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICBsZXQgdmFsdWU6IG51bWJlciB8IGJvb2xlYW4gfCBzdHJpbmcgfCBvYmplY3QgPSBfbXV0YXRvclthdHRyaWJ1dGVdO1xyXG4gICAgICAgICAgICAgICAgaWYgKF9tdXRhdG9yW2F0dHJpYnV0ZV0gIT0gdW5kZWZpbmVkKVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgKHZhbHVlKSA9PSBcIm9iamVjdFwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlID0gKDxHZW5lcmFsPnRoaXMpW2F0dHJpYnV0ZV0uY29uc3RydWN0b3IubmFtZTtcclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGUgPSBfbXV0YXRvclthdHRyaWJ1dGVdLmNvbnN0cnVjdG9yLm5hbWU7XHJcbiAgICAgICAgICAgICAgICB0eXBlc1thdHRyaWJ1dGVdID0gdHlwZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdHlwZXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFVwZGF0ZXMgdGhlIHZhbHVlcyBvZiB0aGUgZ2l2ZW4gbXV0YXRvciBhY2NvcmRpbmcgdG8gdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIGluc3RhbmNlXHJcbiAgICAgICAgICogQHBhcmFtIF9tdXRhdG9yIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyB1cGRhdGVNdXRhdG9yKF9tdXRhdG9yOiBNdXRhdG9yKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGF0dHJpYnV0ZSBpbiBfbXV0YXRvcikge1xyXG4gICAgICAgICAgICAgICAgbGV0IHZhbHVlOiBPYmplY3QgPSBfbXV0YXRvclthdHRyaWJ1dGVdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgTXV0YWJsZSlcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLmdldE11dGF0b3IoKTtcclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICBfbXV0YXRvclthdHRyaWJ1dGVdID0gKDxHZW5lcmFsPnRoaXMpW2F0dHJpYnV0ZV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVXBkYXRlcyB0aGUgYXR0cmlidXRlIHZhbHVlcyBvZiB0aGUgaW5zdGFuY2UgYWNjb3JkaW5nIHRvIHRoZSBzdGF0ZSBvZiB0aGUgbXV0YXRvci4gTXVzdCBiZSBwcm90ZWN0ZWQuLi4hXHJcbiAgICAgICAgICogQHBhcmFtIF9tdXRhdG9yXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIG11dGF0ZShfbXV0YXRvcjogTXV0YXRvcik6IHZvaWQge1xyXG4gICAgICAgICAgICAvLyBUT0RPOiBkb24ndCBhc3NpZ24gdW5rbm93biBwcm9wZXJ0aWVzXHJcbiAgICAgICAgICAgIGZvciAobGV0IGF0dHJpYnV0ZSBpbiBfbXV0YXRvcikge1xyXG4gICAgICAgICAgICAgICAgbGV0IHZhbHVlOiBNdXRhdG9yID0gPE11dGF0b3I+X211dGF0b3JbYXR0cmlidXRlXTtcclxuICAgICAgICAgICAgICAgIGxldCBtdXRhbnQ6IE9iamVjdCA9ICg8R2VuZXJhbD50aGlzKVthdHRyaWJ1dGVdO1xyXG4gICAgICAgICAgICAgICAgaWYgKG11dGFudCBpbnN0YW5jZW9mIE11dGFibGUpXHJcbiAgICAgICAgICAgICAgICAgICAgbXV0YW50Lm11dGF0ZSh2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgKDxHZW5lcmFsPnRoaXMpW2F0dHJpYnV0ZV0gPSB2YWx1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KEVWRU5ULk1VVEFURSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZWR1Y2VzIHRoZSBhdHRyaWJ1dGVzIG9mIHRoZSBnZW5lcmFsIG11dGF0b3IgYWNjb3JkaW5nIHRvIGRlc2lyZWQgb3B0aW9ucyBmb3IgbXV0YXRpb24uIFRvIGJlIGltcGxlbWVudGVkIGluIHN1YmNsYXNzZXNcclxuICAgICAgICAgKiBAcGFyYW0gX211dGF0b3IgXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJvdGVjdGVkIGFic3RyYWN0IHJlZHVjZU11dGF0b3IoX211dGF0b3I6IE11dGF0b3IpOiB2b2lkO1xyXG4gICAgfVxyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9UcmFuc2Zlci9TZXJpYWxpemVyLnRzXCIvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vVHJhbnNmZXIvTXV0YWJsZS50c1wiLz5cclxuXHJcbm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gIC8qKlxyXG4gICAqIEhvbGRzIGluZm9ybWF0aW9uIGFib3V0IHRoZSBBbmltYXRpb25TdHJ1Y3R1cmUgdGhhdCB0aGUgQW5pbWF0aW9uIHVzZXMgdG8gbWFwIHRoZSBTZXF1ZW5jZXMgdG8gdGhlIEF0dHJpYnV0ZXMuXHJcbiAgICogQnVpbHQgb3V0IG9mIGEgW1tOb2RlXV0ncyBzZXJpYWxzYXRpb24sIGl0IHN3YXBzIHRoZSB2YWx1ZXMgd2l0aCBbW0FuaW1hdGlvblNlcXVlbmNlXV1zLlxyXG4gICAqL1xyXG4gIGV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uU3RydWN0dXJlIHtcclxuICAgIFthdHRyaWJ1dGU6IHN0cmluZ106IFNlcmlhbGl6YXRpb24gfCBBbmltYXRpb25TZXF1ZW5jZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogQW4gYXNzb2NpYXRpdmUgYXJyYXkgbWFwcGluZyBuYW1lcyBvZiBsYWJsZXMgdG8gdGltZXN0YW1wcy5cclxuICAqIExhYmVscyBuZWVkIHRvIGJlIHVuaXF1ZSBwZXIgQW5pbWF0aW9uLlxyXG4gICogQGF1dGhvciBMdWthcyBTY2hldWVybGUsIEhGVSwgMjAxOVxyXG4gICovXHJcbiAgZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25MYWJlbCB7XHJcbiAgICBbbmFtZTogc3RyaW5nXTogbnVtYmVyO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBIb2xkcyBpbmZvcm1hdGlvbiBhYm91dCBBbmltYXRpb24gRXZlbnQgVHJpZ2dlcnNcclxuICAqIEBhdXRob3IgTHVrYXMgU2NoZXVlcmxlLCBIRlUsIDIwMTlcclxuICAqL1xyXG4gIGV4cG9ydCBpbnRlcmZhY2UgQW5pbWF0aW9uRXZlbnRUcmlnZ2VyIHtcclxuICAgIFtuYW1lOiBzdHJpbmddOiBudW1iZXI7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbnRlcm5hbGx5IHVzZWQgdG8gZGlmZmVyZW50aWF0ZSBiZXR3ZWVuIHRoZSB2YXJpb3VzIGdlbmVyYXRlZCBzdHJ1Y3R1cmVzIGFuZCBldmVudHMuXHJcbiAgICogQGF1dGhvciBMdWthcyBTY2hldWVybGUsIEhGVSwgMjAxOVxyXG4gICAqL1xyXG4gIGVudW0gQU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFIHtcclxuICAgIC8qKkRlZmF1bHQ6IGZvcndhcmQsIGNvbnRpbm91cyAqL1xyXG4gICAgTk9STUFMLFxyXG4gICAgLyoqYmFja3dhcmQsIGNvbnRpbm91cyAqL1xyXG4gICAgUkVWRVJTRSxcclxuICAgIC8qKmZvcndhcmQsIHJhc3RlcmVkICovXHJcbiAgICBSQVNURVJFRCxcclxuICAgIC8qKmJhY2t3YXJkLCByYXN0ZXJlZCAqL1xyXG4gICAgUkFTVEVSRURSRVZFUlNFXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBbmltYXRpb24gQ2xhc3MgdG8gaG9sZCBhbGwgcmVxdWlyZWQgT2JqZWN0cyB0aGF0IGFyZSBwYXJ0IG9mIGFuIEFuaW1hdGlvbi5cclxuICAgKiBBbHNvIGhvbGRzIGZ1bmN0aW9ucyB0byBwbGF5IHNhaWQgQW5pbWF0aW9uLlxyXG4gICAqIENhbiBiZSBhZGRlZCB0byBhIE5vZGUgYW5kIHBsYXllZCB0aHJvdWdoIFtbQ29tcG9uZW50QW5pbWF0b3JdXS5cclxuICAgKiBAYXV0aG9yIEx1a2FzIFNjaGV1ZXJsZSwgSEZVLCAyMDE5XHJcbiAgICovXHJcbiAgZXhwb3J0IGNsYXNzIEFuaW1hdGlvbiBleHRlbmRzIE11dGFibGUgaW1wbGVtZW50cyBTZXJpYWxpemFibGVSZXNvdXJjZSB7XHJcbiAgICBpZFJlc291cmNlOiBzdHJpbmc7XHJcbiAgICBuYW1lOiBzdHJpbmc7XHJcbiAgICB0b3RhbFRpbWU6IG51bWJlciA9IDA7XHJcbiAgICBsYWJlbHM6IEFuaW1hdGlvbkxhYmVsID0ge307XHJcbiAgICBzdGVwc1BlclNlY29uZDogbnVtYmVyID0gMTA7XHJcbiAgICBhbmltYXRpb25TdHJ1Y3R1cmU6IEFuaW1hdGlvblN0cnVjdHVyZTtcclxuICAgIGV2ZW50czogQW5pbWF0aW9uRXZlbnRUcmlnZ2VyID0ge307XHJcbiAgICBwcml2YXRlIGZyYW1lc1BlclNlY29uZDogbnVtYmVyID0gNjA7XHJcblxyXG4gICAgLy8gcHJvY2Vzc2VkIGV2ZW50bGlzdCBhbmQgYW5pbWF0aW9uIHN0cnVjdXRyZXMgZm9yIHBsYXliYWNrLlxyXG4gICAgcHJpdmF0ZSBldmVudHNQcm9jZXNzZWQ6IE1hcDxBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUsIEFuaW1hdGlvbkV2ZW50VHJpZ2dlcj4gPSBuZXcgTWFwPEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRSwgQW5pbWF0aW9uRXZlbnRUcmlnZ2VyPigpO1xyXG4gICAgcHJpdmF0ZSBhbmltYXRpb25TdHJ1Y3R1cmVzUHJvY2Vzc2VkOiBNYXA8QU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFLCBBbmltYXRpb25TdHJ1Y3R1cmU+ID0gbmV3IE1hcDxBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUsIEFuaW1hdGlvblN0cnVjdHVyZT4oKTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihfbmFtZTogc3RyaW5nLCBfYW5pbVN0cnVjdHVyZTogQW5pbWF0aW9uU3RydWN0dXJlID0ge30sIF9mcHM6IG51bWJlciA9IDYwKSB7XHJcbiAgICAgIHN1cGVyKCk7XHJcbiAgICAgIHRoaXMubmFtZSA9IF9uYW1lO1xyXG4gICAgICB0aGlzLmFuaW1hdGlvblN0cnVjdHVyZSA9IF9hbmltU3RydWN0dXJlO1xyXG4gICAgICB0aGlzLmFuaW1hdGlvblN0cnVjdHVyZXNQcm9jZXNzZWQuc2V0KEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRS5OT1JNQUwsIF9hbmltU3RydWN0dXJlKTtcclxuICAgICAgdGhpcy5mcmFtZXNQZXJTZWNvbmQgPSBfZnBzO1xyXG4gICAgICB0aGlzLmNhbGN1bGF0ZVRvdGFsVGltZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2VuZXJhdGVzIGEgbmV3IFwiTXV0YXRvclwiIHdpdGggdGhlIGluZm9ybWF0aW9uIHRvIGFwcGx5IHRvIHRoZSBbW05vZGVdXSB0aGUgW1tDb21wb25lbnRBbmltYXRvcl1dIGlzIGF0dGFjaGVkIHRvIHdpdGggW1tOb2RlLmFwcGx5QW5pbWF0aW9uKCldXS5cclxuICAgICAqIEBwYXJhbSBfdGltZSBUaGUgdGltZSBhdCB3aGljaCB0aGUgYW5pbWF0aW9uIGN1cnJlbnRseSBpcyBhdFxyXG4gICAgICogQHBhcmFtIF9kaXJlY3Rpb24gVGhlIGRpcmVjdGlvbiBpbiB3aGljaCB0aGUgYW5pbWF0aW9uIGlzIHN1cHBvc2VkIHRvIGJlIHBsYXlpbmcgYmFjay4gPjAgPT0gZm9yd2FyZCwgMCA9PSBzdG9wLCA8MCA9PSBiYWNrd2FyZHNcclxuICAgICAqIEBwYXJhbSBfcGxheWJhY2sgVGhlIHBsYXliYWNrbW9kZSB0aGUgYW5pbWF0aW9uIGlzIHN1cHBvc2VkIHRvIGJlIGNhbGN1bGF0ZWQgd2l0aC5cclxuICAgICAqIEByZXR1cm5zIGEgXCJNdXRhdG9yXCIgdG8gYXBwbHkuXHJcbiAgICAgKi9cclxuICAgIGdldE11dGF0ZWQoX3RpbWU6IG51bWJlciwgX2RpcmVjdGlvbjogbnVtYmVyLCBfcGxheWJhY2s6IEFOSU1BVElPTl9QTEFZQkFDSyk6IE11dGF0b3IgeyAgICAgLy9UT0RPOiBmaW5kIGEgYmV0dGVyIG5hbWUgZm9yIHRoaXNcclxuICAgICAgbGV0IG06IE11dGF0b3IgPSB7fTtcclxuICAgICAgaWYgKF9wbGF5YmFjayA9PSBBTklNQVRJT05fUExBWUJBQ0suVElNRUJBU0VEX0NPTlRJTk9VUykge1xyXG4gICAgICAgIGlmIChfZGlyZWN0aW9uID49IDApIHtcclxuICAgICAgICAgIG0gPSB0aGlzLnRyYXZlcnNlU3RydWN0dXJlRm9yTXV0YXRvcih0aGlzLmdldFByb2Nlc3NlZEFuaW1hdGlvblN0cnVjdHVyZShBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUuTk9STUFMKSwgX3RpbWUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBtID0gdGhpcy50cmF2ZXJzZVN0cnVjdHVyZUZvck11dGF0b3IodGhpcy5nZXRQcm9jZXNzZWRBbmltYXRpb25TdHJ1Y3R1cmUoQU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFLlJFVkVSU0UpLCBfdGltZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmIChfZGlyZWN0aW9uID49IDApIHtcclxuICAgICAgICAgIG0gPSB0aGlzLnRyYXZlcnNlU3RydWN0dXJlRm9yTXV0YXRvcih0aGlzLmdldFByb2Nlc3NlZEFuaW1hdGlvblN0cnVjdHVyZShBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUuUkFTVEVSRUQpLCBfdGltZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG0gPSB0aGlzLnRyYXZlcnNlU3RydWN0dXJlRm9yTXV0YXRvcih0aGlzLmdldFByb2Nlc3NlZEFuaW1hdGlvblN0cnVjdHVyZShBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUuUkFTVEVSRURSRVZFUlNFKSwgX3RpbWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIG07XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgbGlzdCBvZiB0aGUgbmFtZXMgb2YgdGhlIGV2ZW50cyB0aGUgW1tDb21wb25lbnRBbmltYXRvcl1dIG5lZWRzIHRvIGZpcmUgYmV0d2VlbiBfbWluIGFuZCBfbWF4LiBcclxuICAgICAqIEBwYXJhbSBfbWluIFRoZSBtaW5pbXVtIHRpbWUgKGluY2x1c2l2ZSkgdG8gY2hlY2sgYmV0d2VlblxyXG4gICAgICogQHBhcmFtIF9tYXggVGhlIG1heGltdW0gdGltZSAoZXhjbHVzaXZlKSB0byBjaGVjayBiZXR3ZWVuXHJcbiAgICAgKiBAcGFyYW0gX3BsYXliYWNrIFRoZSBwbGF5YmFjayBtb2RlIHRvIGNoZWNrIGluLiBIYXMgYW4gZWZmZWN0IG9uIHdoZW4gdGhlIEV2ZW50cyBhcmUgZmlyZWQuIFxyXG4gICAgICogQHBhcmFtIF9kaXJlY3Rpb24gVGhlIGRpcmVjdGlvbiB0aGUgYW5pbWF0aW9uIGlzIHN1cHBvc2VkIHRvIHJ1biBpbi4gPjAgPT0gZm9yd2FyZCwgMCA9PSBzdG9wLCA8MCA9PSBiYWNrd2FyZHNcclxuICAgICAqIEByZXR1cm5zIGEgbGlzdCBvZiBzdHJpbmdzIHdpdGggdGhlIG5hbWVzIG9mIHRoZSBjdXN0b20gZXZlbnRzIHRvIGZpcmUuXHJcbiAgICAgKi9cclxuICAgIGdldEV2ZW50c1RvRmlyZShfbWluOiBudW1iZXIsIF9tYXg6IG51bWJlciwgX3BsYXliYWNrOiBBTklNQVRJT05fUExBWUJBQ0ssIF9kaXJlY3Rpb246IG51bWJlcik6IHN0cmluZ1tdIHtcclxuICAgICAgbGV0IGV2ZW50TGlzdDogc3RyaW5nW10gPSBbXTtcclxuICAgICAgbGV0IG1pblNlY3Rpb246IG51bWJlciA9IE1hdGguZmxvb3IoX21pbiAvIHRoaXMudG90YWxUaW1lKTtcclxuICAgICAgbGV0IG1heFNlY3Rpb246IG51bWJlciA9IE1hdGguZmxvb3IoX21heCAvIHRoaXMudG90YWxUaW1lKTtcclxuICAgICAgX21pbiA9IF9taW4gJSB0aGlzLnRvdGFsVGltZTtcclxuICAgICAgX21heCA9IF9tYXggJSB0aGlzLnRvdGFsVGltZTtcclxuXHJcbiAgICAgIHdoaWxlIChtaW5TZWN0aW9uIDw9IG1heFNlY3Rpb24pIHtcclxuICAgICAgICBsZXQgZXZlbnRUcmlnZ2VyczogQW5pbWF0aW9uRXZlbnRUcmlnZ2VyID0gdGhpcy5nZXRDb3JyZWN0RXZlbnRMaXN0KF9kaXJlY3Rpb24sIF9wbGF5YmFjayk7XHJcbiAgICAgICAgaWYgKG1pblNlY3Rpb24gPT0gbWF4U2VjdGlvbikge1xyXG4gICAgICAgICAgZXZlbnRMaXN0ID0gZXZlbnRMaXN0LmNvbmNhdCh0aGlzLmNoZWNrRXZlbnRzQmV0d2VlbihldmVudFRyaWdnZXJzLCBfbWluLCBfbWF4KSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGV2ZW50TGlzdCA9IGV2ZW50TGlzdC5jb25jYXQodGhpcy5jaGVja0V2ZW50c0JldHdlZW4oZXZlbnRUcmlnZ2VycywgX21pbiwgdGhpcy50b3RhbFRpbWUpKTtcclxuICAgICAgICAgIF9taW4gPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBtaW5TZWN0aW9uKys7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBldmVudExpc3Q7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIGFuIEV2ZW50IHRvIHRoZSBMaXN0IG9mIGV2ZW50cy5cclxuICAgICAqIEBwYXJhbSBfbmFtZSBUaGUgbmFtZSBvZiB0aGUgZXZlbnQgKG5lZWRzIHRvIGJlIHVuaXF1ZSBwZXIgQW5pbWF0aW9uKS5cclxuICAgICAqIEBwYXJhbSBfdGltZSBUaGUgdGltZXN0YW1wIG9mIHRoZSBldmVudCAoaW4gbWlsbGlzZWNvbmRzKS5cclxuICAgICAqL1xyXG4gICAgc2V0RXZlbnQoX25hbWU6IHN0cmluZywgX3RpbWU6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICB0aGlzLmV2ZW50c1tfbmFtZV0gPSBfdGltZTtcclxuICAgICAgdGhpcy5ldmVudHNQcm9jZXNzZWQuY2xlYXIoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmVzIHRoZSBldmVudCB3aXRoIHRoZSBnaXZlbiBuYW1lIGZyb20gdGhlIGxpc3Qgb2YgZXZlbnRzLlxyXG4gICAgICogQHBhcmFtIF9uYW1lIG5hbWUgb2YgdGhlIGV2ZW50IHRvIHJlbW92ZS5cclxuICAgICAqL1xyXG4gICAgcmVtb3ZlRXZlbnQoX25hbWU6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICBkZWxldGUgdGhpcy5ldmVudHNbX25hbWVdO1xyXG4gICAgICB0aGlzLmV2ZW50c1Byb2Nlc3NlZC5jbGVhcigpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBnZXRMYWJlbHMoKTogRW51bWVyYXRvciB7XHJcbiAgICAgIC8vVE9ETzogdGhpcyBhY3R1YWxseSBuZWVkcyB0ZXN0aW5nXHJcbiAgICAgIGxldCBlbjogRW51bWVyYXRvciA9IG5ldyBFbnVtZXJhdG9yKHRoaXMubGFiZWxzKTtcclxuICAgICAgcmV0dXJuIGVuO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBmcHMoKTogbnVtYmVyIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZnJhbWVzUGVyU2Vjb25kO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCBmcHMoX2ZwczogbnVtYmVyKSB7XHJcbiAgICAgIHRoaXMuZnJhbWVzUGVyU2Vjb25kID0gX2ZwcztcclxuICAgICAgdGhpcy5ldmVudHNQcm9jZXNzZWQuY2xlYXIoKTtcclxuICAgICAgdGhpcy5hbmltYXRpb25TdHJ1Y3R1cmVzUHJvY2Vzc2VkLmNsZWFyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAoUmUtKUNhbGN1bGF0ZSB0aGUgdG90YWwgdGltZSBvZiB0aGUgQW5pbWF0aW9uLiBDYWxjdWxhdGlvbi1oZWF2eSwgdXNlIG9ubHkgaWYgYWN0dWFsbHkgbmVlZGVkLlxyXG4gICAgICovXHJcbiAgICBjYWxjdWxhdGVUb3RhbFRpbWUoKTogdm9pZCB7XHJcbiAgICAgIHRoaXMudG90YWxUaW1lID0gMDtcclxuICAgICAgdGhpcy50cmF2ZXJzZVN0cnVjdHVyZUZvclRpbWUodGhpcy5hbmltYXRpb25TdHJ1Y3R1cmUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vI3JlZ2lvbiB0cmFuc2ZlclxyXG4gICAgc2VyaWFsaXplKCk6IFNlcmlhbGl6YXRpb24ge1xyXG4gICAgICBsZXQgczogU2VyaWFsaXphdGlvbiA9IHtcclxuICAgICAgICBpZFJlc291cmNlOiB0aGlzLmlkUmVzb3VyY2UsXHJcbiAgICAgICAgbmFtZTogdGhpcy5uYW1lLFxyXG4gICAgICAgIGxhYmVsczoge30sXHJcbiAgICAgICAgZXZlbnRzOiB7fSxcclxuICAgICAgICBmcHM6IHRoaXMuZnJhbWVzUGVyU2Vjb25kLFxyXG4gICAgICAgIHNwczogdGhpcy5zdGVwc1BlclNlY29uZFxyXG4gICAgICB9O1xyXG4gICAgICBmb3IgKGxldCBuYW1lIGluIHRoaXMubGFiZWxzKSB7XHJcbiAgICAgICAgcy5sYWJlbHNbbmFtZV0gPSB0aGlzLmxhYmVsc1tuYW1lXTtcclxuICAgICAgfVxyXG4gICAgICBmb3IgKGxldCBuYW1lIGluIHRoaXMuZXZlbnRzKSB7XHJcbiAgICAgICAgcy5ldmVudHNbbmFtZV0gPSB0aGlzLmV2ZW50c1tuYW1lXTtcclxuICAgICAgfVxyXG4gICAgICBzLmFuaW1hdGlvblN0cnVjdHVyZSA9IHRoaXMudHJhdmVyc2VTdHJ1Y3R1cmVGb3JTZXJpYWxpc2F0aW9uKHRoaXMuYW5pbWF0aW9uU3RydWN0dXJlKTtcclxuICAgICAgcmV0dXJuIHM7XHJcbiAgICB9XHJcbiAgICBkZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbik6IFNlcmlhbGl6YWJsZSB7XHJcbiAgICAgIHRoaXMuaWRSZXNvdXJjZSA9IF9zZXJpYWxpemF0aW9uLmlkUmVzb3VyY2U7XHJcbiAgICAgIHRoaXMubmFtZSA9IF9zZXJpYWxpemF0aW9uLm5hbWU7XHJcbiAgICAgIHRoaXMuZnJhbWVzUGVyU2Vjb25kID0gX3NlcmlhbGl6YXRpb24uZnBzO1xyXG4gICAgICB0aGlzLnN0ZXBzUGVyU2Vjb25kID0gX3NlcmlhbGl6YXRpb24uc3BzO1xyXG4gICAgICB0aGlzLmxhYmVscyA9IHt9O1xyXG4gICAgICBmb3IgKGxldCBuYW1lIGluIF9zZXJpYWxpemF0aW9uLmxhYmVscykge1xyXG4gICAgICAgIHRoaXMubGFiZWxzW25hbWVdID0gX3NlcmlhbGl6YXRpb24ubGFiZWxzW25hbWVdO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuZXZlbnRzID0ge307XHJcbiAgICAgIGZvciAobGV0IG5hbWUgaW4gX3NlcmlhbGl6YXRpb24uZXZlbnRzKSB7XHJcbiAgICAgICAgdGhpcy5ldmVudHNbbmFtZV0gPSBfc2VyaWFsaXphdGlvbi5ldmVudHNbbmFtZV07XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5ldmVudHNQcm9jZXNzZWQgPSBuZXcgTWFwPEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRSwgQW5pbWF0aW9uRXZlbnRUcmlnZ2VyPigpO1xyXG5cclxuICAgICAgdGhpcy5hbmltYXRpb25TdHJ1Y3R1cmUgPSB0aGlzLnRyYXZlcnNlU3RydWN0dXJlRm9yRGVzZXJpYWxpc2F0aW9uKF9zZXJpYWxpemF0aW9uLmFuaW1hdGlvblN0cnVjdHVyZSk7XHJcblxyXG4gICAgICB0aGlzLmFuaW1hdGlvblN0cnVjdHVyZXNQcm9jZXNzZWQgPSBuZXcgTWFwPEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRSwgQW5pbWF0aW9uU3RydWN0dXJlPigpO1xyXG5cclxuICAgICAgdGhpcy5jYWxjdWxhdGVUb3RhbFRpbWUoKTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZ2V0TXV0YXRvcigpOiBNdXRhdG9yIHtcclxuICAgICAgcmV0dXJuIHRoaXMuc2VyaWFsaXplKCk7XHJcbiAgICB9XHJcbiAgICBwcm90ZWN0ZWQgcmVkdWNlTXV0YXRvcihfbXV0YXRvcjogTXV0YXRvcik6IHZvaWQge1xyXG4gICAgICBkZWxldGUgX211dGF0b3IudG90YWxUaW1lO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBUcmF2ZXJzZXMgYW4gQW5pbWF0aW9uU3RydWN0dXJlIGFuZCByZXR1cm5zIHRoZSBTZXJpYWxpemF0aW9uIG9mIHNhaWQgU3RydWN0dXJlLlxyXG4gICAgICogQHBhcmFtIF9zdHJ1Y3R1cmUgVGhlIEFuaW1hdGlvbiBTdHJ1Y3R1cmUgYXQgdGhlIGN1cnJlbnQgbGV2ZWwgdG8gdHJhbnNmb3JtIGludG8gdGhlIFNlcmlhbGl6YXRpb24uXHJcbiAgICAgKiBAcmV0dXJucyB0aGUgZmlsbGVkIFNlcmlhbGl6YXRpb24uXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgdHJhdmVyc2VTdHJ1Y3R1cmVGb3JTZXJpYWxpc2F0aW9uKF9zdHJ1Y3R1cmU6IEFuaW1hdGlvblN0cnVjdHVyZSk6IFNlcmlhbGl6YXRpb24ge1xyXG4gICAgICBsZXQgbmV3U2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IHt9O1xyXG4gICAgICBmb3IgKGxldCBuIGluIF9zdHJ1Y3R1cmUpIHtcclxuICAgICAgICBpZiAoX3N0cnVjdHVyZVtuXSBpbnN0YW5jZW9mIEFuaW1hdGlvblNlcXVlbmNlKSB7XHJcbiAgICAgICAgICBuZXdTZXJpYWxpemF0aW9uW25dID0gX3N0cnVjdHVyZVtuXS5zZXJpYWxpemUoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbmV3U2VyaWFsaXphdGlvbltuXSA9IHRoaXMudHJhdmVyc2VTdHJ1Y3R1cmVGb3JTZXJpYWxpc2F0aW9uKDxBbmltYXRpb25TdHJ1Y3R1cmU+X3N0cnVjdHVyZVtuXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBuZXdTZXJpYWxpemF0aW9uO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBUcmF2ZXJzZXMgYSBTZXJpYWxpemF0aW9uIHRvIGNyZWF0ZSBhIG5ldyBBbmltYXRpb25TdHJ1Y3R1cmUuXHJcbiAgICAgKiBAcGFyYW0gX3NlcmlhbGl6YXRpb24gVGhlIHNlcmlhbGl6YXRpb24gdG8gdHJhbnNmZXIgaW50byBhbiBBbmltYXRpb25TdHJ1Y3R1cmVcclxuICAgICAqIEByZXR1cm5zIHRoZSBuZXdseSBjcmVhdGVkIEFuaW1hdGlvblN0cnVjdHVyZS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSB0cmF2ZXJzZVN0cnVjdHVyZUZvckRlc2VyaWFsaXNhdGlvbihfc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbik6IEFuaW1hdGlvblN0cnVjdHVyZSB7XHJcbiAgICAgIGxldCBuZXdTdHJ1Y3R1cmU6IEFuaW1hdGlvblN0cnVjdHVyZSA9IHt9O1xyXG4gICAgICBmb3IgKGxldCBuIGluIF9zZXJpYWxpemF0aW9uKSB7XHJcbiAgICAgICAgaWYgKF9zZXJpYWxpemF0aW9uW25dLmFuaW1hdGlvblNlcXVlbmNlKSB7XHJcbiAgICAgICAgICBsZXQgYW5pbVNlcTogQW5pbWF0aW9uU2VxdWVuY2UgPSBuZXcgQW5pbWF0aW9uU2VxdWVuY2UoKTtcclxuICAgICAgICAgIG5ld1N0cnVjdHVyZVtuXSA9IGFuaW1TZXEuZGVzZXJpYWxpemUoX3NlcmlhbGl6YXRpb25bbl0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBuZXdTdHJ1Y3R1cmVbbl0gPSB0aGlzLnRyYXZlcnNlU3RydWN0dXJlRm9yRGVzZXJpYWxpc2F0aW9uKF9zZXJpYWxpemF0aW9uW25dKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIG5ld1N0cnVjdHVyZTtcclxuICAgIH1cclxuICAgIC8vI2VuZHJlZ2lvblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRmluZHMgdGhlIGxpc3Qgb2YgZXZlbnRzIHRvIGJlIHVzZWQgd2l0aCB0aGVzZSBzZXR0aW5ncy5cclxuICAgICAqIEBwYXJhbSBfZGlyZWN0aW9uIFRoZSBkaXJlY3Rpb24gdGhlIGFuaW1hdGlvbiBpcyBwbGF5aW5nIGluLlxyXG4gICAgICogQHBhcmFtIF9wbGF5YmFjayBUaGUgcGxheWJhY2ttb2RlIHRoZSBhbmltYXRpb24gaXMgcGxheWluZyBpbi5cclxuICAgICAqIEByZXR1cm5zIFRoZSBjb3JyZWN0IEFuaW1hdGlvbkV2ZW50VHJpZ2dlciBPYmplY3QgdG8gdXNlXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZ2V0Q29ycmVjdEV2ZW50TGlzdChfZGlyZWN0aW9uOiBudW1iZXIsIF9wbGF5YmFjazogQU5JTUFUSU9OX1BMQVlCQUNLKTogQW5pbWF0aW9uRXZlbnRUcmlnZ2VyIHtcclxuICAgICAgaWYgKF9wbGF5YmFjayAhPSBBTklNQVRJT05fUExBWUJBQ0suRlJBTUVCQVNFRCkge1xyXG4gICAgICAgIGlmIChfZGlyZWN0aW9uID49IDApIHtcclxuICAgICAgICAgIHJldHVybiB0aGlzLmdldFByb2Nlc3NlZEV2ZW50VHJpZ2dlcihBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUuTk9STUFMKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UHJvY2Vzc2VkRXZlbnRUcmlnZ2VyKEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRS5SRVZFUlNFKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYgKF9kaXJlY3Rpb24gPj0gMCkge1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UHJvY2Vzc2VkRXZlbnRUcmlnZ2VyKEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRS5SQVNURVJFRCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHJldHVybiB0aGlzLmdldFByb2Nlc3NlZEV2ZW50VHJpZ2dlcihBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUuUkFTVEVSRURSRVZFUlNFKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRyYXZlcnNlcyBhbiBBbmltYXRpb25TdHJ1Y3R1cmUgdG8gdHVybiBpdCBpbnRvIHRoZSBcIk11dGF0b3JcIiB0byByZXR1cm4gdG8gdGhlIENvbXBvbmVudC5cclxuICAgICAqIEBwYXJhbSBfc3RydWN0dXJlIFRoZSBzdHJjdXR1cmUgdG8gdHJhdmVyc2VcclxuICAgICAqIEBwYXJhbSBfdGltZSB0aGUgcG9pbnQgaW4gdGltZSB0byB3cml0ZSB0aGUgYW5pbWF0aW9uIG51bWJlcnMgaW50by5cclxuICAgICAqIEByZXR1cm5zIFRoZSBcIk11dGF0b3JcIiBmaWxsZWQgd2l0aCB0aGUgY29ycmVjdCB2YWx1ZXMgYXQgdGhlIGdpdmVuIHRpbWUuIFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHRyYXZlcnNlU3RydWN0dXJlRm9yTXV0YXRvcihfc3RydWN0dXJlOiBBbmltYXRpb25TdHJ1Y3R1cmUsIF90aW1lOiBudW1iZXIpOiBNdXRhdG9yIHtcclxuICAgICAgbGV0IG5ld011dGF0b3I6IE11dGF0b3IgPSB7fTtcclxuICAgICAgZm9yIChsZXQgbiBpbiBfc3RydWN0dXJlKSB7XHJcbiAgICAgICAgaWYgKF9zdHJ1Y3R1cmVbbl0gaW5zdGFuY2VvZiBBbmltYXRpb25TZXF1ZW5jZSkge1xyXG4gICAgICAgICAgbmV3TXV0YXRvcltuXSA9ICg8QW5pbWF0aW9uU2VxdWVuY2U+X3N0cnVjdHVyZVtuXSkuZXZhbHVhdGUoX3RpbWUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBuZXdNdXRhdG9yW25dID0gdGhpcy50cmF2ZXJzZVN0cnVjdHVyZUZvck11dGF0b3IoPEFuaW1hdGlvblN0cnVjdHVyZT5fc3RydWN0dXJlW25dLCBfdGltZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBuZXdNdXRhdG9yO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVHJhdmVyc2VzIHRoZSBjdXJyZW50IEFuaW1hdGlvblN0cmN1dHVyZSB0byBmaW5kIHRoZSB0b3RhbFRpbWUgb2YgdGhpcyBhbmltYXRpb24uXHJcbiAgICAgKiBAcGFyYW0gX3N0cnVjdHVyZSBUaGUgc3RydWN0dXJlIHRvIHRyYXZlcnNlXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgdHJhdmVyc2VTdHJ1Y3R1cmVGb3JUaW1lKF9zdHJ1Y3R1cmU6IEFuaW1hdGlvblN0cnVjdHVyZSk6IHZvaWQge1xyXG4gICAgICBmb3IgKGxldCBuIGluIF9zdHJ1Y3R1cmUpIHtcclxuICAgICAgICBpZiAoX3N0cnVjdHVyZVtuXSBpbnN0YW5jZW9mIEFuaW1hdGlvblNlcXVlbmNlKSB7XHJcbiAgICAgICAgICBsZXQgc2VxdWVuY2U6IEFuaW1hdGlvblNlcXVlbmNlID0gPEFuaW1hdGlvblNlcXVlbmNlPl9zdHJ1Y3R1cmVbbl07XHJcbiAgICAgICAgICBpZiAoc2VxdWVuY2UubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBsZXQgc2VxdWVuY2VUaW1lOiBudW1iZXIgPSBzZXF1ZW5jZS5nZXRLZXkoc2VxdWVuY2UubGVuZ3RoIC0gMSkuVGltZTtcclxuICAgICAgICAgICAgdGhpcy50b3RhbFRpbWUgPSBzZXF1ZW5jZVRpbWUgPiB0aGlzLnRvdGFsVGltZSA/IHNlcXVlbmNlVGltZSA6IHRoaXMudG90YWxUaW1lO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLnRyYXZlcnNlU3RydWN0dXJlRm9yVGltZSg8QW5pbWF0aW9uU3RydWN0dXJlPl9zdHJ1Y3R1cmVbbl0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRW5zdXJlcyB0aGUgZXhpc3RhbmNlIG9mIHRoZSByZXF1ZXN0ZWQgW1tBbmltYXRpb25TdHJjdXR1cmVdXSBhbmQgcmV0dXJucyBpdC5cclxuICAgICAqIEBwYXJhbSBfdHlwZSB0aGUgdHlwZSBvZiB0aGUgc3RydWN0dXJlIHRvIGdldFxyXG4gICAgICogQHJldHVybnMgdGhlIHJlcXVlc3RlZCBbW0FuaW1hdGlvblN0cnVjdHVyZV1dXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZ2V0UHJvY2Vzc2VkQW5pbWF0aW9uU3RydWN0dXJlKF90eXBlOiBBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUpOiBBbmltYXRpb25TdHJ1Y3R1cmUge1xyXG4gICAgICBpZiAoIXRoaXMuYW5pbWF0aW9uU3RydWN0dXJlc1Byb2Nlc3NlZC5oYXMoX3R5cGUpKSB7XHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVUb3RhbFRpbWUoKTtcclxuICAgICAgICBsZXQgYWU6IEFuaW1hdGlvblN0cnVjdHVyZSA9IHt9O1xyXG4gICAgICAgIHN3aXRjaCAoX3R5cGUpIHtcclxuICAgICAgICAgIGNhc2UgQU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFLk5PUk1BTDpcclxuICAgICAgICAgICAgYWUgPSB0aGlzLmFuaW1hdGlvblN0cnVjdHVyZTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlIEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRS5SRVZFUlNFOlxyXG4gICAgICAgICAgICBhZSA9IHRoaXMudHJhdmVyc2VTdHJ1Y3R1cmVGb3JOZXdTdHJ1Y3R1cmUodGhpcy5hbmltYXRpb25TdHJ1Y3R1cmUsIHRoaXMuY2FsY3VsYXRlUmV2ZXJzZVNlcXVlbmNlLmJpbmQodGhpcykpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgQU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFLlJBU1RFUkVEOlxyXG4gICAgICAgICAgICBhZSA9IHRoaXMudHJhdmVyc2VTdHJ1Y3R1cmVGb3JOZXdTdHJ1Y3R1cmUodGhpcy5hbmltYXRpb25TdHJ1Y3R1cmUsIHRoaXMuY2FsY3VsYXRlUmFzdGVyZWRTZXF1ZW5jZS5iaW5kKHRoaXMpKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlIEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRS5SQVNURVJFRFJFVkVSU0U6XHJcbiAgICAgICAgICAgIGFlID0gdGhpcy50cmF2ZXJzZVN0cnVjdHVyZUZvck5ld1N0cnVjdHVyZSh0aGlzLmdldFByb2Nlc3NlZEFuaW1hdGlvblN0cnVjdHVyZShBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUuUkVWRVJTRSksIHRoaXMuY2FsY3VsYXRlUmFzdGVyZWRTZXF1ZW5jZS5iaW5kKHRoaXMpKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICByZXR1cm4ge307XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYW5pbWF0aW9uU3RydWN0dXJlc1Byb2Nlc3NlZC5zZXQoX3R5cGUsIGFlKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdGhpcy5hbmltYXRpb25TdHJ1Y3R1cmVzUHJvY2Vzc2VkLmdldChfdHlwZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBFbnN1cmVzIHRoZSBleGlzdGFuY2Ugb2YgdGhlIHJlcXVlc3RlZCBbW0FuaW1hdGlvbkV2ZW50VHJpZ2dlcl1dIGFuZCByZXR1cm5zIGl0LlxyXG4gICAgICogQHBhcmFtIF90eXBlIFRoZSB0eXBlIG9mIEFuaW1hdGlvbkV2ZW50VHJpZ2dlciB0byBnZXRcclxuICAgICAqIEByZXR1cm5zIHRoZSByZXF1ZXN0ZWQgW1tBbmltYXRpb25FdmVudFRyaWdnZXJdXVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGdldFByb2Nlc3NlZEV2ZW50VHJpZ2dlcihfdHlwZTogQU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFKTogQW5pbWF0aW9uRXZlbnRUcmlnZ2VyIHtcclxuICAgICAgaWYgKCF0aGlzLmV2ZW50c1Byb2Nlc3NlZC5oYXMoX3R5cGUpKSB7XHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVUb3RhbFRpbWUoKTtcclxuICAgICAgICBsZXQgZXY6IEFuaW1hdGlvbkV2ZW50VHJpZ2dlciA9IHt9O1xyXG4gICAgICAgIHN3aXRjaCAoX3R5cGUpIHtcclxuICAgICAgICAgIGNhc2UgQU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFLk5PUk1BTDpcclxuICAgICAgICAgICAgZXYgPSB0aGlzLmV2ZW50cztcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlIEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRS5SRVZFUlNFOlxyXG4gICAgICAgICAgICBldiA9IHRoaXMuY2FsY3VsYXRlUmV2ZXJzZUV2ZW50VHJpZ2dlcnModGhpcy5ldmVudHMpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgQU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFLlJBU1RFUkVEOlxyXG4gICAgICAgICAgICBldiA9IHRoaXMuY2FsY3VsYXRlUmFzdGVyZWRFdmVudFRyaWdnZXJzKHRoaXMuZXZlbnRzKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlIEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRS5SQVNURVJFRFJFVkVSU0U6XHJcbiAgICAgICAgICAgIGV2ID0gdGhpcy5jYWxjdWxhdGVSYXN0ZXJlZEV2ZW50VHJpZ2dlcnModGhpcy5nZXRQcm9jZXNzZWRFdmVudFRyaWdnZXIoQU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFLlJFVkVSU0UpKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICByZXR1cm4ge307XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZXZlbnRzUHJvY2Vzc2VkLnNldChfdHlwZSwgZXYpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB0aGlzLmV2ZW50c1Byb2Nlc3NlZC5nZXQoX3R5cGUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVHJhdmVyc2VzIGFuIGV4aXN0aW5nIHN0cnVjdHVyZSB0byBhcHBseSBhIHJlY2FsY3VsYXRpb24gZnVuY3Rpb24gdG8gdGhlIEFuaW1hdGlvblN0cnVjdHVyZSB0byBzdG9yZSBpbiBhIG5ldyBTdHJ1Y3R1cmUuXHJcbiAgICAgKiBAcGFyYW0gX29sZFN0cnVjdHVyZSBUaGUgb2xkIHN0cnVjdHVyZSB0byB0cmF2ZXJzZVxyXG4gICAgICogQHBhcmFtIF9mdW5jdGlvblRvVXNlIFRoZSBmdW5jdGlvbiB0byB1c2UgdG8gcmVjYWxjdWxhdGVkIHRoZSBzdHJ1Y3R1cmUuXHJcbiAgICAgKiBAcmV0dXJucyBBIG5ldyBBbmltYXRpb24gU3RydWN0dXJlIHdpdGggdGhlIHJlY2FsdWxhdGVkIEFuaW1hdGlvbiBTZXF1ZW5jZXMuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgdHJhdmVyc2VTdHJ1Y3R1cmVGb3JOZXdTdHJ1Y3R1cmUoX29sZFN0cnVjdHVyZTogQW5pbWF0aW9uU3RydWN0dXJlLCBfZnVuY3Rpb25Ub1VzZTogRnVuY3Rpb24pOiBBbmltYXRpb25TdHJ1Y3R1cmUge1xyXG4gICAgICBsZXQgbmV3U3RydWN0dXJlOiBBbmltYXRpb25TdHJ1Y3R1cmUgPSB7fTtcclxuICAgICAgZm9yIChsZXQgbiBpbiBfb2xkU3RydWN0dXJlKSB7XHJcbiAgICAgICAgaWYgKF9vbGRTdHJ1Y3R1cmVbbl0gaW5zdGFuY2VvZiBBbmltYXRpb25TZXF1ZW5jZSkge1xyXG4gICAgICAgICAgbmV3U3RydWN0dXJlW25dID0gX2Z1bmN0aW9uVG9Vc2UoX29sZFN0cnVjdHVyZVtuXSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG5ld1N0cnVjdHVyZVtuXSA9IHRoaXMudHJhdmVyc2VTdHJ1Y3R1cmVGb3JOZXdTdHJ1Y3R1cmUoPEFuaW1hdGlvblN0cnVjdHVyZT5fb2xkU3RydWN0dXJlW25dLCBfZnVuY3Rpb25Ub1VzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBuZXdTdHJ1Y3R1cmU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIGEgcmV2ZXJzZWQgQW5pbWF0aW9uIFNlcXVlbmNlIG91dCBvZiBhIGdpdmVuIFNlcXVlbmNlLlxyXG4gICAgICogQHBhcmFtIF9zZXF1ZW5jZSBUaGUgc2VxdWVuY2UgdG8gY2FsY3VsYXRlIHRoZSBuZXcgc2VxdWVuY2Ugb3V0IG9mXHJcbiAgICAgKiBAcmV0dXJucyBUaGUgcmV2ZXJzZWQgU2VxdWVuY2VcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjYWxjdWxhdGVSZXZlcnNlU2VxdWVuY2UoX3NlcXVlbmNlOiBBbmltYXRpb25TZXF1ZW5jZSk6IEFuaW1hdGlvblNlcXVlbmNlIHtcclxuICAgICAgbGV0IHNlcTogQW5pbWF0aW9uU2VxdWVuY2UgPSBuZXcgQW5pbWF0aW9uU2VxdWVuY2UoKTtcclxuICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IF9zZXF1ZW5jZS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGxldCBvbGRLZXk6IEFuaW1hdGlvbktleSA9IF9zZXF1ZW5jZS5nZXRLZXkoaSk7XHJcbiAgICAgICAgbGV0IGtleTogQW5pbWF0aW9uS2V5ID0gbmV3IEFuaW1hdGlvbktleSh0aGlzLnRvdGFsVGltZSAtIG9sZEtleS5UaW1lLCBvbGRLZXkuVmFsdWUsIG9sZEtleS5TbG9wZU91dCwgb2xkS2V5LlNsb3BlSW4sIG9sZEtleS5Db25zdGFudCk7XHJcbiAgICAgICAgc2VxLmFkZEtleShrZXkpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBzZXE7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIGEgcmFzdGVyZWQgW1tBbmltYXRpb25TZXF1ZW5jZV1dIG91dCBvZiBhIGdpdmVuIHNlcXVlbmNlLlxyXG4gICAgICogQHBhcmFtIF9zZXF1ZW5jZSBUaGUgc2VxdWVuY2UgdG8gY2FsY3VsYXRlIHRoZSBuZXcgc2VxdWVuY2Ugb3V0IG9mXHJcbiAgICAgKiBAcmV0dXJucyB0aGUgcmFzdGVyZWQgc2VxdWVuY2UuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgY2FsY3VsYXRlUmFzdGVyZWRTZXF1ZW5jZShfc2VxdWVuY2U6IEFuaW1hdGlvblNlcXVlbmNlKTogQW5pbWF0aW9uU2VxdWVuY2Uge1xyXG4gICAgICBsZXQgc2VxOiBBbmltYXRpb25TZXF1ZW5jZSA9IG5ldyBBbmltYXRpb25TZXF1ZW5jZSgpO1xyXG4gICAgICBsZXQgZnJhbWVUaW1lOiBudW1iZXIgPSAxMDAwIC8gdGhpcy5mcmFtZXNQZXJTZWNvbmQ7XHJcbiAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB0aGlzLnRvdGFsVGltZTsgaSArPSBmcmFtZVRpbWUpIHtcclxuICAgICAgICBsZXQga2V5OiBBbmltYXRpb25LZXkgPSBuZXcgQW5pbWF0aW9uS2V5KGksIF9zZXF1ZW5jZS5ldmFsdWF0ZShpKSwgMCwgMCwgdHJ1ZSk7XHJcbiAgICAgICAgc2VxLmFkZEtleShrZXkpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBzZXE7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIGEgbmV3IHJldmVyc2VkIFtbQW5pbWF0aW9uRXZlbnRUcmlnZ2VyXV0gb2JqZWN0IGJhc2VkIG9uIHRoZSBnaXZlbiBvbmUuICBcclxuICAgICAqIEBwYXJhbSBfZXZlbnRzIHRoZSBldmVudCBvYmplY3QgdG8gY2FsY3VsYXRlIHRoZSBuZXcgb25lIG91dCBvZlxyXG4gICAgICogQHJldHVybnMgdGhlIHJldmVyc2VkIGV2ZW50IG9iamVjdFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGNhbGN1bGF0ZVJldmVyc2VFdmVudFRyaWdnZXJzKF9ldmVudHM6IEFuaW1hdGlvbkV2ZW50VHJpZ2dlcik6IEFuaW1hdGlvbkV2ZW50VHJpZ2dlciB7XHJcbiAgICAgIGxldCBhZTogQW5pbWF0aW9uRXZlbnRUcmlnZ2VyID0ge307XHJcbiAgICAgIGZvciAobGV0IG5hbWUgaW4gX2V2ZW50cykge1xyXG4gICAgICAgIGFlW25hbWVdID0gdGhpcy50b3RhbFRpbWUgLSBfZXZlbnRzW25hbWVdO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBhZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIGEgcmFzdGVyZWQgW1tBbmltYXRpb25FdmVudFRyaWdnZXJdXSBvYmplY3QgYmFzZWQgb24gdGhlIGdpdmVuIG9uZS4gIFxyXG4gICAgICogQHBhcmFtIF9ldmVudHMgdGhlIGV2ZW50IG9iamVjdCB0byBjYWxjdWxhdGUgdGhlIG5ldyBvbmUgb3V0IG9mXHJcbiAgICAgKiBAcmV0dXJucyB0aGUgcmFzdGVyZWQgZXZlbnQgb2JqZWN0XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgY2FsY3VsYXRlUmFzdGVyZWRFdmVudFRyaWdnZXJzKF9ldmVudHM6IEFuaW1hdGlvbkV2ZW50VHJpZ2dlcik6IEFuaW1hdGlvbkV2ZW50VHJpZ2dlciB7XHJcbiAgICAgIGxldCBhZTogQW5pbWF0aW9uRXZlbnRUcmlnZ2VyID0ge307XHJcbiAgICAgIGxldCBmcmFtZVRpbWU6IG51bWJlciA9IDEwMDAgLyB0aGlzLmZyYW1lc1BlclNlY29uZDtcclxuICAgICAgZm9yIChsZXQgbmFtZSBpbiBfZXZlbnRzKSB7XHJcbiAgICAgICAgYWVbbmFtZV0gPSBfZXZlbnRzW25hbWVdIC0gKF9ldmVudHNbbmFtZV0gJSBmcmFtZVRpbWUpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBhZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVja3Mgd2hpY2ggZXZlbnRzIGxheSBiZXR3ZWVuIHR3byBnaXZlbiB0aW1lcyBhbmQgcmV0dXJucyB0aGUgbmFtZXMgb2YgdGhlIG9uZXMgdGhhdCBkby5cclxuICAgICAqIEBwYXJhbSBfZXZlbnRUcmlnZ2VycyBUaGUgZXZlbnQgb2JqZWN0IHRvIGNoZWNrIHRoZSBldmVudHMgaW5zaWRlIG9mXHJcbiAgICAgKiBAcGFyYW0gX21pbiB0aGUgbWluaW11bSBvZiB0aGUgcmFuZ2UgdG8gY2hlY2sgYmV0d2VlbiAoaW5jbHVzaXZlKVxyXG4gICAgICogQHBhcmFtIF9tYXggdGhlIG1heGltdW0gb2YgdGhlIHJhbmdlIHRvIGNoZWNrIGJldHdlZW4gKGV4Y2x1c2l2ZSlcclxuICAgICAqIEByZXR1cm5zIGFuIGFycmF5IG9mIHRoZSBuYW1lcyBvZiB0aGUgZXZlbnRzIGluIHRoZSBnaXZlbiByYW5nZS4gXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgY2hlY2tFdmVudHNCZXR3ZWVuKF9ldmVudFRyaWdnZXJzOiBBbmltYXRpb25FdmVudFRyaWdnZXIsIF9taW46IG51bWJlciwgX21heDogbnVtYmVyKTogc3RyaW5nW10ge1xyXG4gICAgICBsZXQgZXZlbnRzVG9UcmlnZ2VyOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICBmb3IgKGxldCBuYW1lIGluIF9ldmVudFRyaWdnZXJzKSB7XHJcbiAgICAgICAgaWYgKF9taW4gPD0gX2V2ZW50VHJpZ2dlcnNbbmFtZV0gJiYgX2V2ZW50VHJpZ2dlcnNbbmFtZV0gPCBfbWF4KSB7XHJcbiAgICAgICAgICBldmVudHNUb1RyaWdnZXIucHVzaChuYW1lKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGV2ZW50c1RvVHJpZ2dlcjtcclxuICAgIH1cclxuICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vVHJhbnNmZXIvU2VyaWFsaXplci50c1wiLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL1RyYW5zZmVyL011dGFibGUudHNcIi8+XHJcblxyXG5uYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAvKipcclxuICAgKiBDYWxjdWxhdGVzIHRoZSB2YWx1ZXMgYmV0d2VlbiBbW0FuaW1hdGlvbktleV1dcy5cclxuICAgKiBSZXByZXNlbnRlZCBpbnRlcm5hbGx5IGJ5IGEgY3ViaWMgZnVuY3Rpb24gKGBmKHgpID0gYXjCsyArIGJ4wrIgKyBjeCArIGRgKS4gXHJcbiAgICogT25seSBuZWVkcyB0byBiZSByZWNhbGN1bGF0ZWQgd2hlbiB0aGUga2V5cyBjaGFuZ2UsIHNvIGF0IHJ1bnRpbWUgaXQgc2hvdWxkIG9ubHkgYmUgY2FsY3VsYXRlZCBvbmNlLlxyXG4gICAqIEBhdXRob3IgTHVrYXMgU2NoZXVlcmxlLCBIRlUsIDIwMTlcclxuICAgKi9cclxuICBleHBvcnQgY2xhc3MgQW5pbWF0aW9uRnVuY3Rpb24ge1xyXG4gICAgcHJpdmF0ZSBhOiBudW1iZXIgPSAwO1xyXG4gICAgcHJpdmF0ZSBiOiBudW1iZXIgPSAwO1xyXG4gICAgcHJpdmF0ZSBjOiBudW1iZXIgPSAwO1xyXG4gICAgcHJpdmF0ZSBkOiBudW1iZXIgPSAwO1xyXG4gICAgcHJpdmF0ZSBrZXlJbjogQW5pbWF0aW9uS2V5O1xyXG4gICAgcHJpdmF0ZSBrZXlPdXQ6IEFuaW1hdGlvbktleTtcclxuXHJcblxyXG4gICAgY29uc3RydWN0b3IoX2tleUluOiBBbmltYXRpb25LZXksIF9rZXlPdXQ6IEFuaW1hdGlvbktleSA9IG51bGwpIHtcclxuICAgICAgdGhpcy5rZXlJbiA9IF9rZXlJbjtcclxuICAgICAgdGhpcy5rZXlPdXQgPSBfa2V5T3V0O1xyXG4gICAgICB0aGlzLmNhbGN1bGF0ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsY3VsYXRlcyB0aGUgdmFsdWUgb2YgdGhlIGZ1bmN0aW9uIGF0IHRoZSBnaXZlbiB0aW1lLlxyXG4gICAgICogQHBhcmFtIF90aW1lIHRoZSBwb2ludCBpbiB0aW1lIGF0IHdoaWNoIHRvIGV2YWx1YXRlIHRoZSBmdW5jdGlvbiBpbiBtaWxsaXNlY29uZHMuIFdpbGwgYmUgY29ycmVjdGVkIGZvciBvZmZzZXQgaW50ZXJuYWxseS5cclxuICAgICAqIEByZXR1cm5zIHRoZSB2YWx1ZSBhdCB0aGUgZ2l2ZW4gdGltZVxyXG4gICAgICovXHJcbiAgICBldmFsdWF0ZShfdGltZTogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgICAgX3RpbWUgLT0gdGhpcy5rZXlJbi5UaW1lO1xyXG4gICAgICBsZXQgdGltZTI6IG51bWJlciA9IF90aW1lICogX3RpbWU7XHJcbiAgICAgIGxldCB0aW1lMzogbnVtYmVyID0gdGltZTIgKiBfdGltZTtcclxuICAgICAgcmV0dXJuIHRoaXMuYSAqIHRpbWUzICsgdGhpcy5iICogdGltZTIgKyB0aGlzLmMgKiBfdGltZSArIHRoaXMuZDtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgc2V0S2V5SW4oX2tleUluOiBBbmltYXRpb25LZXkpIHtcclxuICAgICAgdGhpcy5rZXlJbiA9IF9rZXlJbjtcclxuICAgICAgdGhpcy5jYWxjdWxhdGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgc2V0S2V5T3V0KF9rZXlPdXQ6IEFuaW1hdGlvbktleSkge1xyXG4gICAgICB0aGlzLmtleU91dCA9IF9rZXlPdXQ7XHJcbiAgICAgIHRoaXMuY2FsY3VsYXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAoUmUtKUNhbGN1bGF0ZXMgdGhlIHBhcmFtZXRlcnMgb2YgdGhlIGN1YmljIGZ1bmN0aW9uLlxyXG4gICAgICogU2VlIGh0dHBzOi8vbWF0aC5zdGFja2V4Y2hhbmdlLmNvbS9xdWVzdGlvbnMvMzE3MzQ2OS9jYWxjdWxhdGUtY3ViaWMtZXF1YXRpb24tZnJvbS10d28tcG9pbnRzLWFuZC10d28tc2xvcGVzLXZhcmlhYmx5XHJcbiAgICAgKiBhbmQgaHR0cHM6Ly9qaXJrYWRlbGxvcm8uZ2l0aHViLmlvL0ZVREdFL0RvY3VtZW50YXRpb24vTG9ncy8xOTA0MTBfTm90aXplbl9MU1xyXG4gICAgICovXHJcbiAgICBjYWxjdWxhdGUoKTogdm9pZCB7XHJcbiAgICAgIGlmICghdGhpcy5rZXlJbikge1xyXG4gICAgICAgIHRoaXMuZCA9IHRoaXMuYyA9IHRoaXMuYiA9IHRoaXMuYSA9IDA7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICghdGhpcy5rZXlPdXQgfHwgdGhpcy5rZXlJbi5Db25zdGFudCkge1xyXG4gICAgICAgIHRoaXMuZCA9IHRoaXMua2V5SW4uVmFsdWU7XHJcbiAgICAgICAgdGhpcy5jID0gdGhpcy5iID0gdGhpcy5hID0gMDtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGxldCB4MTogbnVtYmVyID0gdGhpcy5rZXlPdXQuVGltZSAtIHRoaXMua2V5SW4uVGltZTtcclxuXHJcbiAgICAgIHRoaXMuZCA9IHRoaXMua2V5SW4uVmFsdWU7XHJcbiAgICAgIHRoaXMuYyA9IHRoaXMua2V5SW4uU2xvcGVPdXQ7XHJcblxyXG4gICAgICB0aGlzLmEgPSAoLXgxICogKHRoaXMua2V5SW4uU2xvcGVPdXQgKyB0aGlzLmtleU91dC5TbG9wZUluKSAtIDIgKiB0aGlzLmtleUluLlZhbHVlICsgMiAqIHRoaXMua2V5T3V0LlZhbHVlKSAvIC1NYXRoLnBvdyh4MSwgMyk7XHJcbiAgICAgIHRoaXMuYiA9ICh0aGlzLmtleU91dC5TbG9wZUluIC0gdGhpcy5rZXlJbi5TbG9wZU91dCAtIDMgKiB0aGlzLmEgKiBNYXRoLnBvdyh4MSwgMikpIC8gKDIgKiB4MSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9UcmFuc2Zlci9TZXJpYWxpemVyLnRzXCIvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vVHJhbnNmZXIvTXV0YWJsZS50c1wiLz5cclxuXHJcbm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gIC8qKlxyXG4gICAqIEhvbGRzIGluZm9ybWF0aW9uIGFib3V0IHNldCBwb2ludHMgaW4gdGltZSwgdGhlaXIgYWNjb21wYW55aW5nIHZhbHVlcyBhcyB3ZWxsIGFzIHRoZWlyIHNsb3Blcy4gXHJcbiAgICogQWxzbyBob2xkcyBhIHJlZmVyZW5jZSB0byB0aGUgW1tBbmltYXRpb25GdW5jdGlvbl1dcyB0aGF0IGNvbWUgaW4gYW5kIG91dCBvZiB0aGUgc2lkZXMuIFRoZSBbW0FuaW1hdGlvbkZ1bmN0aW9uXV1zIGFyZSBoYW5kbGVkIGJ5IHRoZSBbW0FuaW1hdGlvblNlcXVlbmNlXV1zLlxyXG4gICAqIFNhdmVkIGluc2lkZSBhbiBbW0FuaW1hdGlvblNlcXVlbmNlXV0uXHJcbiAgICogQGF1dGhvciBMdWthcyBTY2hldWVybGUsIEhGVSwgMjAxOVxyXG4gICAqL1xyXG4gIGV4cG9ydCBjbGFzcyBBbmltYXRpb25LZXkgZXh0ZW5kcyBNdXRhYmxlIGltcGxlbWVudHMgU2VyaWFsaXphYmxlIHtcclxuICAgIC8vIFRPRE86IGNoZWNrIGlmIGZ1bmN0aW9uSW4gY2FuIGJlIHJlbW92ZWRcclxuICAgIC8qKkRvbid0IG1vZGlmeSB0aGlzIHVubGVzcyB5b3Uga25vdyB3aGF0IHlvdSdyZSBkb2luZy4qL1xyXG4gICAgZnVuY3Rpb25JbjogQW5pbWF0aW9uRnVuY3Rpb247XHJcbiAgICAvKipEb24ndCBtb2RpZnkgdGhpcyB1bmxlc3MgeW91IGtub3cgd2hhdCB5b3UncmUgZG9pbmcuKi9cclxuICAgIGZ1bmN0aW9uT3V0OiBBbmltYXRpb25GdW5jdGlvbjtcclxuICAgIFxyXG4gICAgYnJva2VuOiBib29sZWFuO1xyXG5cclxuICAgIHByaXZhdGUgdGltZTogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSB2YWx1ZTogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBjb25zdGFudDogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgIHByaXZhdGUgc2xvcGVJbjogbnVtYmVyID0gMDtcclxuICAgIHByaXZhdGUgc2xvcGVPdXQ6IG51bWJlciA9IDA7XHJcblxyXG4gICAgY29uc3RydWN0b3IoX3RpbWU6IG51bWJlciA9IDAsIF92YWx1ZTogbnVtYmVyID0gMCwgX3Nsb3BlSW46IG51bWJlciA9IDAsIF9zbG9wZU91dDogbnVtYmVyID0gMCwgX2NvbnN0YW50OiBib29sZWFuID0gZmFsc2UpIHtcclxuICAgICAgc3VwZXIoKTtcclxuICAgICAgdGhpcy50aW1lID0gX3RpbWU7XHJcbiAgICAgIHRoaXMudmFsdWUgPSBfdmFsdWU7XHJcbiAgICAgIHRoaXMuc2xvcGVJbiA9IF9zbG9wZUluO1xyXG4gICAgICB0aGlzLnNsb3BlT3V0ID0gX3Nsb3BlT3V0O1xyXG4gICAgICB0aGlzLmNvbnN0YW50ID0gX2NvbnN0YW50O1xyXG5cclxuICAgICAgdGhpcy5icm9rZW4gPSB0aGlzLnNsb3BlSW4gIT0gLXRoaXMuc2xvcGVPdXQ7XHJcbiAgICAgIHRoaXMuZnVuY3Rpb25PdXQgPSBuZXcgQW5pbWF0aW9uRnVuY3Rpb24odGhpcywgbnVsbCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IFRpbWUoKTogbnVtYmVyIHtcclxuICAgICAgcmV0dXJuIHRoaXMudGltZTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgVGltZShfdGltZTogbnVtYmVyKSB7XHJcbiAgICAgIHRoaXMudGltZSA9IF90aW1lO1xyXG4gICAgICB0aGlzLmZ1bmN0aW9uSW4uY2FsY3VsYXRlKCk7XHJcbiAgICAgIHRoaXMuZnVuY3Rpb25PdXQuY2FsY3VsYXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IFZhbHVlKCk6IG51bWJlciB7XHJcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCBWYWx1ZShfdmFsdWU6IG51bWJlcikge1xyXG4gICAgICB0aGlzLnZhbHVlID0gX3ZhbHVlO1xyXG4gICAgICB0aGlzLmZ1bmN0aW9uSW4uY2FsY3VsYXRlKCk7XHJcbiAgICAgIHRoaXMuZnVuY3Rpb25PdXQuY2FsY3VsYXRlKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGdldCBDb25zdGFudCgpOiBib29sZWFuIHtcclxuICAgICAgcmV0dXJuIHRoaXMuY29uc3RhbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IENvbnN0YW50KF9jb25zdGFudDogYm9vbGVhbikge1xyXG4gICAgICB0aGlzLmNvbnN0YW50ID0gX2NvbnN0YW50O1xyXG4gICAgICB0aGlzLmZ1bmN0aW9uSW4uY2FsY3VsYXRlKCk7XHJcbiAgICAgIHRoaXMuZnVuY3Rpb25PdXQuY2FsY3VsYXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IFNsb3BlSW4oKTogbnVtYmVyIHtcclxuICAgICAgcmV0dXJuIHRoaXMuc2xvcGVJbjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgc2V0IFNsb3BlSW4oX3Nsb3BlOiBudW1iZXIpIHtcclxuICAgICAgdGhpcy5zbG9wZUluID0gX3Nsb3BlO1xyXG4gICAgICB0aGlzLmZ1bmN0aW9uSW4uY2FsY3VsYXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IFNsb3BlT3V0KCk6IG51bWJlciB7XHJcbiAgICAgIHJldHVybiB0aGlzLnNsb3BlT3V0O1xyXG4gICAgfVxyXG5cclxuICAgIHNldCBTbG9wZU91dChfc2xvcGU6IG51bWJlcikge1xyXG4gICAgICB0aGlzLnNsb3BlT3V0ID0gX3Nsb3BlO1xyXG4gICAgICB0aGlzLmZ1bmN0aW9uT3V0LmNhbGN1bGF0ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3RhdGljIGNvbXBhcmF0aW9uIGZ1bmN0aW9uIHRvIHVzZSBpbiBhbiBhcnJheSBzb3J0IGZ1bmN0aW9uIHRvIHNvcnQgdGhlIGtleXMgYnkgdGhlaXIgdGltZS5cclxuICAgICAqIEBwYXJhbSBfYSB0aGUgYW5pbWF0aW9uIGtleSB0byBjaGVja1xyXG4gICAgICogQHBhcmFtIF9iIHRoZSBhbmltYXRpb24ga2V5IHRvIGNoZWNrIGFnYWluc3RcclxuICAgICAqIEByZXR1cm5zID4wIGlmIGE+YiwgMCBpZiBhPWIsIDwwIGlmIGE8YlxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgY29tcGFyZShfYTogQW5pbWF0aW9uS2V5LCBfYjogQW5pbWF0aW9uS2V5KTogbnVtYmVyIHtcclxuICAgICAgcmV0dXJuIF9hLnRpbWUgLSBfYi50aW1lO1xyXG4gICAgfVxyXG5cclxuICAgIC8vI3JlZ2lvbiB0cmFuc2ZlclxyXG4gICAgc2VyaWFsaXplKCk6IFNlcmlhbGl6YXRpb24ge1xyXG4gICAgICBsZXQgczogU2VyaWFsaXphdGlvbiA9IHt9O1xyXG4gICAgICBzLnRpbWUgPSB0aGlzLnRpbWU7XHJcbiAgICAgIHMudmFsdWUgPSB0aGlzLnZhbHVlO1xyXG4gICAgICBzLnNsb3BlSW4gPSB0aGlzLnNsb3BlSW47XHJcbiAgICAgIHMuc2xvcGVPdXQgPSB0aGlzLnNsb3BlT3V0O1xyXG4gICAgICBzLmNvbnN0YW50ID0gdGhpcy5jb25zdGFudDtcclxuICAgICAgcmV0dXJuIHM7XHJcbiAgICB9XHJcblxyXG4gICAgZGVzZXJpYWxpemUoX3NlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24pOiBTZXJpYWxpemFibGUge1xyXG4gICAgICB0aGlzLnRpbWUgPSBfc2VyaWFsaXphdGlvbi50aW1lO1xyXG4gICAgICB0aGlzLnZhbHVlID0gX3NlcmlhbGl6YXRpb24udmFsdWU7XHJcbiAgICAgIHRoaXMuc2xvcGVJbiA9IF9zZXJpYWxpemF0aW9uLnNsb3BlSW47XHJcbiAgICAgIHRoaXMuc2xvcGVPdXQgPSBfc2VyaWFsaXphdGlvbi5zbG9wZU91dDtcclxuICAgICAgdGhpcy5jb25zdGFudCA9IF9zZXJpYWxpemF0aW9uLmNvbnN0YW50O1xyXG5cclxuICAgICAgdGhpcy5icm9rZW4gPSB0aGlzLnNsb3BlSW4gIT0gLXRoaXMuc2xvcGVPdXQ7XHJcblxyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBnZXRNdXRhdG9yKCk6IE11dGF0b3Ige1xyXG4gICAgICByZXR1cm4gdGhpcy5zZXJpYWxpemUoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgcmVkdWNlTXV0YXRvcihfbXV0YXRvcjogTXV0YXRvcik6IHZvaWQge1xyXG4gICAgICAvL1xyXG4gICAgfVxyXG4gICAgLy8jZW5kcmVnaW9uXHJcblxyXG4gIH1cclxuXHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vVHJhbnNmZXIvU2VyaWFsaXplci50c1wiLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL1RyYW5zZmVyL011dGFibGUudHNcIi8+XHJcblxyXG5uYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAvKipcclxuICAgKiBBIHNlcXVlbmNlIG9mIFtbQW5pbWF0aW9uS2V5XV1zIHRoYXQgaXMgbWFwcGVkIHRvIGFuIGF0dHJpYnV0ZSBvZiBhIFtbTm9kZV1dIG9yIGl0cyBbW0NvbXBvbmVudF1dcyBpbnNpZGUgdGhlIFtbQW5pbWF0aW9uXV0uXHJcbiAgICogUHJvdmlkZXMgZnVuY3Rpb25zIHRvIG1vZGlmeSBzYWlkIGtleXNcclxuICAgKiBAYXV0aG9yIEx1a2FzIFNjaGV1ZXJsZSwgSEZVLCAyMDE5XHJcbiAgICovXHJcbiAgZXhwb3J0IGNsYXNzIEFuaW1hdGlvblNlcXVlbmNlIGV4dGVuZHMgTXV0YWJsZSBpbXBsZW1lbnRzIFNlcmlhbGl6YWJsZSB7XHJcbiAgICBwcml2YXRlIGtleXM6IEFuaW1hdGlvbktleVtdID0gW107XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBFdmFsdWF0ZXMgdGhlIHNlcXVlbmNlIGF0IHRoZSBnaXZlbiBwb2ludCBpbiB0aW1lLlxyXG4gICAgICogQHBhcmFtIF90aW1lIHRoZSBwb2ludCBpbiB0aW1lIGF0IHdoaWNoIHRvIGV2YWx1YXRlIHRoZSBzZXF1ZW5jZSBpbiBtaWxsaXNlY29uZHMuXHJcbiAgICAgKiBAcmV0dXJucyB0aGUgdmFsdWUgb2YgdGhlIHNlcXVlbmNlIGF0IHRoZSBnaXZlbiB0aW1lLiAwIGlmIHRoZXJlIGFyZSBubyBrZXlzLlxyXG4gICAgICovXHJcbiAgICBldmFsdWF0ZShfdGltZTogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgICAgaWYgKHRoaXMua2V5cy5sZW5ndGggPT0gMClcclxuICAgICAgICByZXR1cm4gMDsgLy9UT0RPOiBzaG91bGRuJ3QgcmV0dXJuIDAgYnV0IHNvbWV0aGluZyBpbmRpY2F0aW5nIG5vIGNoYW5nZSwgbGlrZSBudWxsLiBwcm9iYWJseSBuZWVkcyB0byBiZSBjaGFuZ2VkIGluIE5vZGUgYXMgd2VsbCB0byBpZ25vcmUgbm9uLW51bWVyaWMgdmFsdWVzIGluIHRoZSBhcHBseUFuaW1hdGlvbiBmdW5jdGlvblxyXG4gICAgICBpZiAodGhpcy5rZXlzLmxlbmd0aCA9PSAxIHx8IHRoaXMua2V5c1swXS5UaW1lID49IF90aW1lKVxyXG4gICAgICAgIHJldHVybiB0aGlzLmtleXNbMF0uVmFsdWU7XHJcblxyXG5cclxuICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHRoaXMua2V5cy5sZW5ndGggLSAxOyBpKyspIHtcclxuICAgICAgICBpZiAodGhpcy5rZXlzW2ldLlRpbWUgPD0gX3RpbWUgJiYgdGhpcy5rZXlzW2kgKyAxXS5UaW1lID4gX3RpbWUpIHtcclxuICAgICAgICAgIHJldHVybiB0aGlzLmtleXNbaV0uZnVuY3Rpb25PdXQuZXZhbHVhdGUoX3RpbWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdGhpcy5rZXlzW3RoaXMua2V5cy5sZW5ndGggLSAxXS5WYWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgYSBuZXcga2V5IHRvIHRoZSBzZXF1ZW5jZS5cclxuICAgICAqIEBwYXJhbSBfa2V5IHRoZSBrZXkgdG8gYWRkXHJcbiAgICAgKi9cclxuICAgIGFkZEtleShfa2V5OiBBbmltYXRpb25LZXkpOiB2b2lkIHtcclxuICAgICAgdGhpcy5rZXlzLnB1c2goX2tleSk7XHJcbiAgICAgIHRoaXMua2V5cy5zb3J0KEFuaW1hdGlvbktleS5jb21wYXJlKTtcclxuICAgICAgdGhpcy5yZWdlbmVyYXRlRnVuY3Rpb25zKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmVzIGEgZ2l2ZW4ga2V5IGZyb20gdGhlIHNlcXVlbmNlLlxyXG4gICAgICogQHBhcmFtIF9rZXkgdGhlIGtleSB0byByZW1vdmVcclxuICAgICAqL1xyXG4gICAgcmVtb3ZlS2V5KF9rZXk6IEFuaW1hdGlvbktleSk6IHZvaWQge1xyXG4gICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgdGhpcy5rZXlzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKHRoaXMua2V5c1tpXSA9PSBfa2V5KSB7XHJcbiAgICAgICAgICB0aGlzLmtleXMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgdGhpcy5yZWdlbmVyYXRlRnVuY3Rpb25zKCk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmVzIHRoZSBBbmltYXRpb24gS2V5IGF0IHRoZSBnaXZlbiBpbmRleCBmcm9tIHRoZSBrZXlzLlxyXG4gICAgICogQHBhcmFtIF9pbmRleCB0aGUgemVyby1iYXNlZCBpbmRleCBhdCB3aGljaCB0byByZW1vdmUgdGhlIGtleVxyXG4gICAgICogQHJldHVybnMgdGhlIHJlbW92ZWQgQW5pbWF0aW9uS2V5IGlmIHN1Y2Nlc3NmdWwsIG51bGwgb3RoZXJ3aXNlLlxyXG4gICAgICovXHJcbiAgICByZW1vdmVLZXlBdEluZGV4KF9pbmRleDogbnVtYmVyKTogQW5pbWF0aW9uS2V5IHtcclxuICAgICAgaWYgKF9pbmRleCA8IDAgfHwgX2luZGV4ID49IHRoaXMua2V5cy5sZW5ndGgpIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgfVxyXG4gICAgICBsZXQgYWs6IEFuaW1hdGlvbktleSA9IHRoaXMua2V5c1tfaW5kZXhdO1xyXG4gICAgICB0aGlzLmtleXMuc3BsaWNlKF9pbmRleCwgMSk7XHJcbiAgICAgIHRoaXMucmVnZW5lcmF0ZUZ1bmN0aW9ucygpO1xyXG4gICAgICByZXR1cm4gYWs7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIGEga2V5IGZyb20gdGhlIHNlcXVlbmNlIGF0IHRoZSBkZXNpcmVkIGluZGV4LlxyXG4gICAgICogQHBhcmFtIF9pbmRleCB0aGUgemVyby1iYXNlZCBpbmRleCBhdCB3aGljaCB0byBnZXQgdGhlIGtleVxyXG4gICAgICogQHJldHVybnMgdGhlIEFuaW1hdGlvbktleSBhdCB0aGUgaW5kZXggaWYgaXQgZXhpc3RzLCBudWxsIG90aGVyd2lzZS5cclxuICAgICAqL1xyXG4gICAgZ2V0S2V5KF9pbmRleDogbnVtYmVyKTogQW5pbWF0aW9uS2V5IHtcclxuICAgICAgaWYgKF9pbmRleCA8IDAgfHwgX2luZGV4ID49IHRoaXMua2V5cy5sZW5ndGgpXHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgIHJldHVybiB0aGlzLmtleXNbX2luZGV4XTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgbGVuZ3RoKCk6IG51bWJlciB7XHJcbiAgICAgIHJldHVybiB0aGlzLmtleXMubGVuZ3RoO1xyXG4gICAgfVxyXG5cclxuICAgIC8vI3JlZ2lvbiB0cmFuc2ZlclxyXG4gICAgc2VyaWFsaXplKCk6IFNlcmlhbGl6YXRpb24ge1xyXG4gICAgICBsZXQgczogU2VyaWFsaXphdGlvbiA9IHtcclxuICAgICAgICBrZXlzOiBbXSxcclxuICAgICAgICBhbmltYXRpb25TZXF1ZW5jZTogdHJ1ZVxyXG4gICAgICB9O1xyXG4gICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgdGhpcy5rZXlzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgcy5rZXlzW2ldID0gdGhpcy5rZXlzW2ldLnNlcmlhbGl6ZSgpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBzO1xyXG4gICAgfVxyXG4gICAgZGVzZXJpYWxpemUoX3NlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24pOiBTZXJpYWxpemFibGUge1xyXG4gICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgX3NlcmlhbGl6YXRpb24ua2V5cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIC8vIHRoaXMua2V5cy5wdXNoKDxBbmltYXRpb25LZXk+U2VyaWFsaXplci5kZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbi5rZXlzW2ldKSk7XHJcbiAgICAgICAgbGV0IGs6IEFuaW1hdGlvbktleSA9IG5ldyBBbmltYXRpb25LZXkoKTtcclxuICAgICAgICBrLmRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uLmtleXNbaV0pO1xyXG4gICAgICAgIHRoaXMua2V5c1tpXSA9IGs7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMucmVnZW5lcmF0ZUZ1bmN0aW9ucygpO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIHByb3RlY3RlZCByZWR1Y2VNdXRhdG9yKF9tdXRhdG9yOiBNdXRhdG9yKTogdm9pZCB7XHJcbiAgICAgIC8vXHJcbiAgICB9XHJcbiAgICAvLyNlbmRyZWdpb25cclxuXHJcbiAgICAvKipcclxuICAgICAqIFV0aWxpdHkgZnVuY3Rpb24gdGhhdCAocmUtKWdlbmVyYXRlcyBhbGwgZnVuY3Rpb25zIGluIHRoZSBzZXF1ZW5jZS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSByZWdlbmVyYXRlRnVuY3Rpb25zKCk6IHZvaWQge1xyXG4gICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgdGhpcy5rZXlzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgbGV0IGY6IEFuaW1hdGlvbkZ1bmN0aW9uID0gbmV3IEFuaW1hdGlvbkZ1bmN0aW9uKHRoaXMua2V5c1tpXSk7XHJcbiAgICAgICAgdGhpcy5rZXlzW2ldLmZ1bmN0aW9uT3V0ID0gZjtcclxuICAgICAgICBpZiAoaSA9PSB0aGlzLmtleXMubGVuZ3RoIC0gMSkge1xyXG4gICAgICAgICAgLy9UT0RPOiBjaGVjayBpZiB0aGlzIGlzIGV2ZW4gdXNlZnVsLiBNYXliZSB1cGRhdGUgdGhlIHJ1bmNvbmRpdGlvbiB0byBsZW5ndGggLSAxIGluc3RlYWQuIE1pZ2h0IGJlIHJlZHVuZGFudCBpZiBmdW5jdGlvbkluIGlzIHJlbW92ZWQsIHNlZSBUT0RPIGluIEFuaW1hdGlvbktleS5cclxuICAgICAgICAgIGYuc2V0S2V5T3V0ID0gdGhpcy5rZXlzWzBdO1xyXG4gICAgICAgICAgdGhpcy5rZXlzWzBdLmZ1bmN0aW9uSW4gPSBmO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGYuc2V0S2V5T3V0ID0gdGhpcy5rZXlzW2kgKyAxXTtcclxuICAgICAgICB0aGlzLmtleXNbaSArIDFdLmZ1bmN0aW9uSW4gPSBmO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIERlc2NyaWJlcyB0aGUgW1tBdWRpb11dIGNsYXNzIGluIHdoaWNoIGFsbCBBdWRpbyBEYXRhIGlzIHN0b3JlZC5cclxuICAgICAqIEF1ZGlvIHdpbGwgYmUgZ2l2ZW4gdG8gdGhlIFtbQ29tcG9uZW50QXVkaW9dXSBmb3IgZnVydGhlciB1c2FnZS5cclxuICAgICAqIEBhdXRob3JzIFRob21hcyBEb3JuZXIsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgQXVkaW8ge1xyXG5cclxuICAgICAgICBwdWJsaWMgdXJsOiBzdHJpbmc7XHJcblxyXG4gICAgICAgIHB1YmxpYyBhdWRpb0J1ZmZlcjogQXVkaW9CdWZmZXI7XHJcbiAgICAgICAgcHVibGljIGJ1ZmZlclNvdXJjZTogQXVkaW9CdWZmZXJTb3VyY2VOb2RlO1xyXG5cclxuICAgICAgICBwdWJsaWMgbG9jYWxHYWluOiBHYWluTm9kZTtcclxuICAgICAgICBwdWJsaWMgbG9jYWxHYWluVmFsdWU6IG51bWJlcjtcclxuXHJcbiAgICAgICAgcHVibGljIGlzTG9vcGluZzogYm9vbGVhbjtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ29uc3RydWN0b3IgZm9yIHRoZSBbW0F1ZGlvXV0gQ2xhc3NcclxuICAgICAgICAgKiBAcGFyYW0gX2F1ZGlvQ29udGV4dCBmcm9tIFtbQXVkaW9TZXR0aW5nc11dXHJcbiAgICAgICAgICogQHBhcmFtIF9nYWluVmFsdWUgMCBmb3IgbXV0ZWQgfCAxIGZvciBtYXggdm9sdW1lXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY29uc3RydWN0b3IoX2F1ZGlvQ29udGV4dDogQXVkaW9Db250ZXh0LCBfYXVkaW9TZXNzaW9uRGF0YTogQXVkaW9TZXNzaW9uRGF0YSwgX3VybDogc3RyaW5nLCBfZ2FpblZhbHVlOiBudW1iZXIsIF9sb29wOiBib29sZWFuKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5pdChfYXVkaW9Db250ZXh0LCBfYXVkaW9TZXNzaW9uRGF0YSwgX3VybCwgX2dhaW5WYWx1ZSwgX2xvb3ApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGFzeW5jIGluaXQoX2F1ZGlvQ29udGV4dDogQXVkaW9Db250ZXh0LCBfYXVkaW9TZXNzaW9uRGF0YTogQXVkaW9TZXNzaW9uRGF0YSwgX3VybDogc3RyaW5nLCBfZ2FpblZhbHVlOiBudW1iZXIsIF9sb29wOiBib29sZWFuKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgICAgIC8vIERvIGV2ZXJ5dGhpbmcgaW4gY29uc3RydWN0b3JcclxuICAgICAgICAgICAgLy8gQWRkIHVybCB0byBBdWRpb1xyXG4gICAgICAgICAgICB0aGlzLnVybCA9IF91cmw7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQXVkaW8gdXJsIFwiICsgdGhpcy51cmwpO1xyXG4gICAgICAgICAgICAvLyBHZXQgQXVkaW9CdWZmZXJcclxuICAgICAgICAgICAgY29uc3QgYnVmZmVyUHJvbTogUHJvbWlzZTxBdWRpb0J1ZmZlcj4gPSBfYXVkaW9TZXNzaW9uRGF0YS51cmxUb0J1ZmZlcihfYXVkaW9Db250ZXh0LCBfdXJsKTtcclxuICAgICAgICAgICAgd2hpbGUgKCFidWZmZXJQcm9tKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIndhaXRpbmcuLi5cIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYXdhaXQgYnVmZmVyUHJvbS50aGVuKHZhbCA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmF1ZGlvQnVmZmVyID0gdmFsO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJ2YWxCdWZmZXIgXCIgKyB2YWwpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJBdWRpbyBhdWRpb2J1ZmZlciBcIiArIHRoaXMuYXVkaW9CdWZmZXIpO1xyXG4gICAgICAgICAgICAvLyAvLyBBZGQgbG9jYWwgR2FpbiBmb3IgQXVkaW8gIGFuZCBjb25uZWN0IFxyXG4gICAgICAgICAgICB0aGlzLmxvY2FsR2FpbiA9IGF3YWl0IF9hdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xyXG4gICAgICAgICAgICB0aGlzLmxvY2FsR2FpblZhbHVlID0gYXdhaXQgX2dhaW5WYWx1ZTtcclxuICAgICAgICAgICAgLy9jcmVhdGUgQXVkaW9cclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5jcmVhdGVBdWRpbyhfYXVkaW9Db250ZXh0LCB0aGlzLmF1ZGlvQnVmZmVyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIGluaXRCdWZmZXJTb3VyY2VcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgaW5pdEJ1ZmZlclNvdXJjZShfYXVkaW9Db250ZXh0OiBBdWRpb0NvbnRleHQpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5idWZmZXJTb3VyY2UgPSBfYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmJ1ZmZlclNvdXJjZS5idWZmZXIgPSB0aGlzLmF1ZGlvQnVmZmVyO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImJTID0gXCIgKyB0aGlzLmJ1ZmZlclNvdXJjZSk7XHJcbiAgICAgICAgICAgIHRoaXMuYnVmZmVyU291cmNlLmNvbm5lY3QoX2F1ZGlvQ29udGV4dC5kZXN0aW5hdGlvbik7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNldExvb3AoKTtcclxuICAgICAgICAgICAgdGhpcy5hZGRMb2NhbEdhaW4oKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJCdWZmZXJTb3VyY2UuYnVmZmVyOiBcIiArIHRoaXMuYnVmZmVyU291cmNlLmJ1ZmZlcik7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQXVkaW9CdWZmZXI6IFwiICsgdGhpcy5hdWRpb0J1ZmZlcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyNyZWdpb24gR2V0dGVyL1NldHRlciBMb2NhbEdhaW5WYWx1ZVxyXG4gICAgICAgIHB1YmxpYyBzZXRMb2NhbEdhaW5WYWx1ZShfbG9jYWxHYWluVmFsdWU6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmxvY2FsR2FpblZhbHVlID0gX2xvY2FsR2FpblZhbHVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldExvY2FsR2FpblZhbHVlKCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmxvY2FsR2FpblZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyNlbmRyZWdpb24gR2V0dGVyL1NldHRlciBMb2NhbEdhaW5WYWx1ZVxyXG5cclxuICAgICAgICBwdWJsaWMgc2V0QnVmZmVyU291cmNlKF9idWZmZXI6IEF1ZGlvQnVmZmVyKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuYnVmZmVyU291cmNlLmJ1ZmZlciA9IF9idWZmZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBjcmVhdGVBdWRpbyBidWlsZHMgYW4gW1tBdWRpb11dIHRvIHVzZSB3aXRoIHRoZSBbW0NvbXBvbmVudEF1ZGlvXV1cclxuICAgICAgICAgKiBAcGFyYW0gX2F1ZGlvQ29udGV4dCBmcm9tIFtbQXVkaW9TZXR0aW5nc11dXHJcbiAgICAgICAgICogQHBhcmFtIF9hdWRpb0J1ZmZlciBmcm9tIFtbQXVkaW9TZXNzaW9uRGF0YV1dXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBjcmVhdGVBdWRpbyhfYXVkaW9Db250ZXh0OiBBdWRpb0NvbnRleHQsIF9hdWRpb0J1ZmZlcjogQXVkaW9CdWZmZXIpOiBBdWRpb0J1ZmZlciB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiY3JlYXRlQXVkaW8oKSBcIiArIFwiIHwgXCIgKyBcIiBBdWRpb0NvbnRleHQ6IFwiICsgX2F1ZGlvQ29udGV4dCk7XHJcbiAgICAgICAgICAgIHRoaXMuYXVkaW9CdWZmZXIgPSBfYXVkaW9CdWZmZXI7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiYUIgPSBcIiArIHRoaXMuYXVkaW9CdWZmZXIpO1xyXG4gICAgICAgICAgICAvLyBBdWRpb0J1ZmZlcnNvdXJjZU5vZGUgU2V0dXBcclxuICAgICAgICAgICAgdGhpcy5pbml0QnVmZmVyU291cmNlKF9hdWRpb0NvbnRleHQpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hdWRpb0J1ZmZlcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc2V0TG9vcCgpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5idWZmZXJTb3VyY2UubG9vcCA9IHRoaXMuaXNMb29waW5nO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBhZGRMb2NhbEdhaW4oKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuYnVmZmVyU291cmNlLmNvbm5lY3QodGhpcy5sb2NhbEdhaW4pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBBZGQgYW4gW1tBdWRpb0ZpbHRlcl1dIHRvIGFuIFtbQXVkaW9dXVxyXG4gICAgICogQGF1dGhvcnMgVGhvbWFzIERvcm5lciwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGVudW0gRklMVEVSX1RZUEUge1xyXG4gICAgICAgIExPV1BBU1MgPSBcIkxPV1BBU1NcIixcclxuICAgICAgICBISUdIUEFTUyA9IFwiSElHSFBBU1NcIixcclxuICAgICAgICBCQU5EUEFTUyA9IFwiQkFORFBBU1NcIixcclxuICAgICAgICBMT1dTSEVMRiA9IFwiTE9XU0hFTEZcIixcclxuICAgICAgICBISUdIU0hFTEYgPSBcIkhJR0hTSEVMRlwiLFxyXG4gICAgICAgIFBFQUtJTkcgPSBcIlBFQUtJTkdcIixcclxuICAgICAgICBOT1RDSCA9IFwiTk9UQ0hcIixcclxuICAgICAgICBBTExQQVNTID0gXCJBTExQQVNTXCJcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgQXVkaW9GaWx0ZXIge1xyXG5cclxuICAgICAgICBwdWJsaWMgdXNlRmlsdGVyOiBib29sZWFuO1xyXG4gICAgICAgIHB1YmxpYyBmaWx0ZXJUeXBlOiBGSUxURVJfVFlQRTtcclxuICAgICAgICBcclxuICAgICAgICBjb25zdHJ1Y3RvcihfdXNlRmlsdGVyOiBib29sZWFuLCBfZmlsdGVyVHlwZTogRklMVEVSX1RZUEUpIHtcclxuICAgICAgICAgICAgdGhpcy51c2VGaWx0ZXIgPSBfdXNlRmlsdGVyO1xyXG4gICAgICAgICAgICB0aGlzLmZpbHRlclR5cGUgPSBfZmlsdGVyVHlwZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIGFkZEZpbHRlclRvXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGFkZEZpbHRlclRvQXVkaW8oX2F1ZGlvQnVmZmVyOiBBdWRpb0J1ZmZlciwgX2ZpbHRlclR5cGU6IEZJTFRFUl9UWVBFKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZG8gbm90aGluZyBmb3Igbm93XCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogRGVzY3JpYmVzIGEgW1tBdWRpb0xpc3RlbmVyXV0gYXR0YWNoZWQgdG8gYSBbW05vZGVdXVxyXG4gICAgICogQGF1dGhvcnMgVGhvbWFzIERvcm5lciwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBBdWRpb0xpc3RlbmVyIHtcclxuICAgICAgICBwdWJsaWMgYXVkaW9MaXN0ZW5lcjogQXVkaW9MaXN0ZW5lcjtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSBwb3NpdGlvbjogVmVjdG9yMztcclxuICAgICAgICBwcml2YXRlIG9yaWVudGF0aW9uOiBWZWN0b3IzO1xyXG5cclxuICAgICAgICAvLyMjVE9ETyBBdWRpb0xpc3RlbmVyXHJcbiAgICAgICAgY29uc3RydWN0b3IoX2F1ZGlvQ29udGV4dDogQXVkaW9Db250ZXh0KSB7XHJcbiAgICAgICAgICAgIC8vdGhpcy5hdWRpb0xpc3RlbmVyID0gX2F1ZGlvQ29udGV4dC5saXN0ZW5lcjtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBXZSB3aWxsIGNhbGwgc2V0QXVkaW9MaXN0ZW5lclBvc2l0aW9uIHdoZW5ldmVyIHRoZXJlIGlzIGEgbmVlZCB0byBjaGFuZ2UgUG9zaXRpb25zLlxyXG4gICAgICAgICAqIEFsbCB0aGUgcG9zaXRpb24gdmFsdWVzIHNob3VsZCBiZSBpZGVudGljYWwgdG8gdGhlIGN1cnJlbnQgUG9zaXRpb24gdGhpcyBpcyBhdHRlY2hlZCB0by5cclxuICAgICAgICAgKi9cclxuICAgICAgICAvLyBwdWJsaWMgc2V0QXVkaW9MaXN0ZW5lclBvc2l0aW9uKF9wb3NpdGlvbjogVmVjdG9yMyk6IHZvaWQge1xyXG4gICAgICAgIC8vICAgICB0aGlzLmF1ZGlvTGlzdGVuZXIucG9zaXRpb25YLnZhbHVlID0gX3Bvc2l0aW9uLng7XHJcbiAgICAgICAgLy8gICAgIHRoaXMuYXVkaW9MaXN0ZW5lci5wb3NpdGlvblkudmFsdWUgPSBfcG9zaXRpb24ueTtcclxuICAgICAgICAvLyAgICAgdGhpcy5hdWRpb0xpc3RlbmVyLnBvc2l0aW9uWi52YWx1ZSA9IF9wb3NpdGlvbi56O1xyXG5cclxuICAgICAgICAvLyAgICAgdGhpcy5wb3NpdGlvbiA9IF9wb3NpdGlvbjtcclxuICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIGdldEF1ZGlvTGlzdGVuZXJQb3NpdGlvblxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBnZXRBdWRpb0xpc3RlbmVyUG9zaXRpb24oKTogVmVjdG9yMyB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBvc2l0aW9uO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogc2V0QXVkaW9MaXN0ZW5lck9yaWVudGF0aW9uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgLy8gcHVibGljIHNldEF1ZGlvTGlzdGVuZXJPcmllbnRhdGlvbihfb3JpZW50YXRpb246IFZlY3RvcjMpOiB2b2lkIHtcclxuICAgICAgICAvLyAgICAgdGhpcy5hdWRpb0xpc3RlbmVyLm9yaWVudGF0aW9uWC52YWx1ZSA9IF9vcmllbnRhdGlvbi54O1xyXG4gICAgICAgIC8vICAgICB0aGlzLmF1ZGlvTGlzdGVuZXIub3JpZW50YXRpb25ZLnZhbHVlID0gX29yaWVudGF0aW9uLnk7XHJcbiAgICAgICAgLy8gICAgIHRoaXMuYXVkaW9MaXN0ZW5lci5vcmllbnRhdGlvbloudmFsdWUgPSBfb3JpZW50YXRpb24uejtcclxuXHJcbiAgICAgICAgLy8gICAgIHRoaXMub3JpZW50YXRpb24gPSBfb3JpZW50YXRpb247XHJcbiAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBnZXRBdWRpb0xpc3RlbmVyT3JpZW50YXRpb25cclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0QXVkaW9MaXN0ZW5lck9yaWVudGF0aW9uKCk6IFZlY3RvcjMge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcmllbnRhdGlvbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFVzZSBQb3NpdGlvbiBmcm9tIFBhcmVudCBOb2RlIHRvIHVwZGF0ZSBvd24gUG9zaXRpb24gYWNjb3JkaW5nbHlcclxuICAgICAgICAgKi9cclxuICAgICAgICAvLyBwcml2YXRlIGdldFBhcmVudE5vZGVQb3NpdGlvbigpIHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgLy8gfVxyXG4gICAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIFxyXG4gICAgICogQGF1dGhvcnMgVGhvbWFzIERvcm5lciwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGVudW0gUEFOTklOR19NT0RFTF9UWVBFIHtcclxuICAgICAgICBFUVVBTFBPV0VSID0gXCJFUVVBTFBPV0VSXCIsXHJcbiAgICAgICAgSFJGVCA9IFwiSFJGVFwiXHJcbiAgICB9XHJcblxyXG4gICAgZW51bSBESVNUQU5DRV9NT0RFTF9UWVBFIHtcclxuICAgICAgICBMSU5FQVIgPSBcIkxJTkVBUlwiLFxyXG4gICAgICAgIElOVkVSU0UgPSBcIklOVkVSU0VcIixcclxuICAgICAgICBFWFBPTkVOVElBTCA9IFwiRVhQT05FTlRJQUxcIlxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBBdWRpb0xvY2FsaXNhdGlvbiB7XHJcblxyXG4gICAgICAgIHB1YmxpYyBwYW5uZXJOb2RlOiBQYW5uZXJOb2RlO1xyXG4gICAgICAgIHB1YmxpYyBwYW5uaW5nTW9kZWw6IFBBTk5JTkdfTU9ERUxfVFlQRTtcclxuICAgICAgICBwdWJsaWMgZGlzdGFuY2VNb2RlbDogRElTVEFOQ0VfTU9ERUxfVFlQRTtcclxuICAgICAgICBwdWJsaWMgcmVmRGlzdGFuY2U6IG51bWJlcjtcclxuICAgICAgICBwdWJsaWMgbWF4RGlzdGFuY2U6IG51bWJlcjtcclxuICAgICAgICBwdWJsaWMgcm9sbG9mZkZhY3RvcjogbnVtYmVyO1xyXG4gICAgICAgIHB1YmxpYyBjb25uZXJJbm5lckFuZ2xlOiBudW1iZXI7XHJcbiAgICAgICAgcHVibGljIGNvbmVPdXRlckFuZ2xlOiBudW1iZXI7XHJcbiAgICAgICAgcHVibGljIGNvbmVPdXRlckdhaW46IG51bWJlcjtcclxuICAgICAgICBwdWJsaWMgcG9zaXRpb246IFZlY3RvcjM7XHJcbiAgICAgICAgcHVibGljIG9yaWVudGF0aW9uOiBWZWN0b3IzO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENvbnN0cnVjdG9yIGZvciB0aGUgW1tBdWRpb0xvY2FsaXNhdGlvbl1dIENsYXNzXHJcbiAgICAgICAgICogQHBhcmFtIF9hdWRpb0NvbnRleHQgZnJvbSBbW0F1ZGlvU2V0dGluZ3NdXVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKF9hdWRpb0NvbnRleHQ6IEF1ZGlvQ29udGV4dCkge1xyXG4gICAgICAgICAgIHRoaXMucGFubmVyTm9kZSA9IF9hdWRpb0NvbnRleHQuY3JlYXRlUGFubmVyKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAgLyoqXHJcbiAgICAgICAgICogV2Ugd2lsbCBjYWxsIHNldFBhbm5lclBvc2l0aW9uIHdoZW5ldmVyIHRoZXJlIGlzIGEgbmVlZCB0byBjaGFuZ2UgUG9zaXRpb25zLlxyXG4gICAgICAgICAqIEFsbCB0aGUgcG9zaXRpb24gdmFsdWVzIHNob3VsZCBiZSBpZGVudGljYWwgdG8gdGhlIGN1cnJlbnQgUG9zaXRpb24gdGhpcyBpcyBhdHRlY2hlZCB0by5cclxuICAgICAgICAgKi9cclxuICAgICAgICAvLyBwdWJsaWMgc2V0UGFubmVQb3NpdGlvbihfcG9zaXRpb246IFZlY3RvcjMpOiB2b2lkIHtcclxuICAgICAgICAvLyAgICAgdGhpcy5wYW5uZXJOb2RlLnBvc2l0aW9uWC52YWx1ZSA9IF9wb3NpdGlvbi54O1xyXG4gICAgICAgIC8vICAgICB0aGlzLnBhbm5lck5vZGUucG9zaXRpb25ZLnZhbHVlID0gX3Bvc2l0aW9uLnk7XHJcbiAgICAgICAgLy8gICAgIHRoaXMucGFubmVyTm9kZS5wb3NpdGlvbloudmFsdWUgPSBfcG9zaXRpb24uejtcclxuXHJcbiAgICAgICAgLy8gICAgIHRoaXMucG9zaXRpb24gPSBfcG9zaXRpb247XHJcbiAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBnZXRQYW5uZXJQb3NpdGlvblxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBnZXRQYW5uZXJQb3NpdGlvbigpOiBWZWN0b3IzIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucG9zaXRpb247XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBzZXRQYW5uZU9yaWVudGF0aW9uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgLy8gcHVibGljIHNldFBhbm5lck9yaWVudGF0aW9uKF9vcmllbnRhdGlvbjogVmVjdG9yMyk6IHZvaWQge1xyXG4gICAgICAgIC8vICAgICB0aGlzLnBhbm5lck5vZGUub3JpZW50YXRpb25YLnZhbHVlID0gX29yaWVudGF0aW9uLng7XHJcbiAgICAgICAgLy8gICAgIHRoaXMucGFubmVyTm9kZS5vcmllbnRhdGlvblkudmFsdWUgPSBfb3JpZW50YXRpb24ueTtcclxuICAgICAgICAvLyAgICAgdGhpcy5wYW5uZXJOb2RlLm9yaWVudGF0aW9uWi52YWx1ZSA9IF9vcmllbnRhdGlvbi56O1xyXG5cclxuICAgICAgICAvLyAgICAgdGhpcy5vcmllbnRhdGlvbiA9IF9vcmllbnRhdGlvbjtcclxuICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIGdldFBhbm5lT3JpZW50YXRpb25cclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0UGFubmVPcmllbnRhdGlvbigpOiBWZWN0b3IzIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMub3JpZW50YXRpb247XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBJbnRlcmZhY2UgdG8gZ2VuZXJhdGUgRGF0YSBQYWlycyBvZiBVUkwgYW5kIEF1ZGlvQnVmZmVyXHJcbiAgICAgKi9cclxuICAgIGludGVyZmFjZSBBdWRpb0RhdGEge1xyXG4gICAgICAgIHVybDogc3RyaW5nO1xyXG4gICAgICAgIGJ1ZmZlcjogQXVkaW9CdWZmZXI7XHJcbiAgICAgICAgY291bnRlcjogbnVtYmVyO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGVzY3JpYmVzIERhdGEgSGFuZGxlciBmb3IgYWxsIEF1ZGlvIFNvdXJjZXNcclxuICAgICAqIEBhdXRob3JzIFRob21hcyBEb3JuZXIsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgQXVkaW9TZXNzaW9uRGF0YSB7XHJcbiAgICAgICAgcHVibGljIGRhdGFBcnJheTogQXVkaW9EYXRhW107XHJcbiAgICAgICAgcHJpdmF0ZSBidWZmZXJDb3VudGVyOiBudW1iZXI7XHJcbiAgICAgICAgLy9UT0RPIG9ic29sZXRlIGhvbGRlciB3aGVuIGFycmF5IHdvcmtpbmcgLyBtYXliZSB1c2UgYXMgaGVscGVyIHZhclxyXG4gICAgICAgIHByaXZhdGUgYXVkaW9CdWZmZXJIb2xkZXI6IEF1ZGlvRGF0YTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogY29uc3RydWN0b3Igb2YgdGhlIFtbQXVkaW9TZXNzaW9uRGF0YV1dIGNsYXNzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YUFycmF5ID0gbmV3IEFycmF5KCk7XHJcbiAgICAgICAgICAgIHRoaXMuYnVmZmVyQ291bnRlciA9IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBnZXRCdWZmZXJDb3VudGVyIHJldHVybnMgW2J1ZmZlckNvdW50ZXJdIHRvIGtlZXAgdHJhY2sgb2YgbnVtYmVyIG9mIGRpZmZlcmVudCB1c2VkIHNvdW5kc1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBnZXRCdWZmZXJDb3VudGVyKCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmJ1ZmZlckNvdW50ZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZWNvZGluZyBBdWRpbyBEYXRhIFxyXG4gICAgICAgICAqIEFzeW5jaHJvbm91cyBGdW5jdGlvbiB0byBwZXJtaXQgdGhlIGxvYWRpbmcgb2YgbXVsdGlwbGUgRGF0YSBTb3VyY2VzIGF0IHRoZSBzYW1lIHRpbWVcclxuICAgICAgICAgKiBAcGFyYW0gX3VybCBVUkwgYXMgU3RyaW5nIGZvciBEYXRhIGZldGNoaW5nXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGFzeW5jIHVybFRvQnVmZmVyKF9hdWRpb0NvbnRleHQ6IEF1ZGlvQ29udGV4dCwgX3VybDogc3RyaW5nKTogUHJvbWlzZTxBdWRpb0J1ZmZlcj4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImluc2lkZSB1cmxUb0J1ZmZlclwiKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGxldCBpbml0T2JqZWN0OiBSZXF1ZXN0SW5pdCA9IHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogXCJHRVRcIixcclxuICAgICAgICAgICAgICAgIG1vZGU6IFwic2FtZS1vcmlnaW5cIiwgLy9kZWZhdWx0IC0+IHNhbWUtb3JpZ2luXHJcbiAgICAgICAgICAgICAgICBjYWNoZTogXCJuby1jYWNoZVwiLCAvL2RlZmF1bHQgLT4gZGVmYXVsdCBcclxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImF1ZGlvL21wZWczXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICByZWRpcmVjdDogXCJmb2xsb3dcIiAvLyBkZWZhdWx0IC0+IGZvbGxvd1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAvLyBDaGVjayBmb3IgZXhpc3RpbmcgVVJMIGluIERhdGFBcnJheSwgaWYgbm8gZGF0YSBpbnNpZGUgYWRkIG5ldyBBdWRpb0RhdGFcclxuICAgICAgICAgICAgLy90aGlzLnB1c2hEYXRhQXJyYXkoX3VybCwgbnVsbCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwibGVuZ3RoXCIgKyB0aGlzLmRhdGFBcnJheS5sZW5ndGgpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5kYXRhQXJyYXkubGVuZ3RoID09IDApIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gbmVlZCB3aW5kb3cgdG8gZmV0Y2g/XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2U6IFJlc3BvbnNlID0gYXdhaXQgd2luZG93LmZldGNoKF91cmwsIGluaXRPYmplY3QpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFycmF5QnVmZmVyOiBBcnJheUJ1ZmZlciA9IGF3YWl0IHJlc3BvbnNlLmFycmF5QnVmZmVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGVjb2RlZEF1ZGlvOiBBdWRpb0J1ZmZlciA9IGF3YWl0IF9hdWRpb0NvbnRleHQuZGVjb2RlQXVkaW9EYXRhKGFycmF5QnVmZmVyKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnB1c2hEYXRhQXJyYXkoX3VybCwgZGVjb2RlZEF1ZGlvKTtcclxuICAgICAgICAgICAgICAgICAgICAvL3RoaXMuZGF0YUFycmF5W3RoaXMuZGF0YUFycmF5Lmxlbmd0aF0uYnVmZmVyID0gZGVjb2RlZEF1ZGlvO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwibGVuZ3RoIFwiICsgdGhpcy5kYXRhQXJyYXkubGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGVjb2RlZEF1ZGlvO1xyXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nRXJyb3JGZXRjaChlKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIElmIG5lZWRlZCBVUkwgaXMgaW5zaWRlIEFycmF5LCBcclxuICAgICAgICAgICAgICAgIC8vIGl0ZXJhdGUgdGhyb3VnaCBhbGwgZXhpc3RpbmcgRGF0YSB0byBnZXQgbmVlZGVkIHZhbHVlc1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgeDogbnVtYmVyID0gMDsgeCA8IHRoaXMuZGF0YUFycmF5Lmxlbmd0aDsgeCsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJ3aGF0IGlzIGhhcHBlbmluZ1wiKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5kYXRhQXJyYXlbeF0udXJsID09IF91cmwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJmb3VuZCBleGlzdGluZyB1cmxcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGFBcnJheVt4XS5idWZmZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogcHVzaFR1cGxlIFNvdXJjZSBhbmQgRGVjb2RlZCBBdWRpbyBEYXRhIGdldHMgc2F2ZWQgZm9yIGxhdGVyIHVzZVxyXG4gICAgICAgICAqIEBwYXJhbSBfdXJsIFVSTCBmcm9tIHVzZWQgRGF0YVxyXG4gICAgICAgICAqIEBwYXJhbSBfYXVkaW9CdWZmZXIgQXVkaW9CdWZmZXIgZ2VuZXJhdGVkIGZyb20gVVJMXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHB1c2hEYXRhQXJyYXkoX3VybDogc3RyaW5nLCBfYXVkaW9CdWZmZXI6IEF1ZGlvQnVmZmVyKTogQXVkaW9EYXRhIHtcclxuICAgICAgICAgICAgbGV0IGRhdGE6IEF1ZGlvRGF0YTtcclxuICAgICAgICAgICAgZGF0YSA9IHsgdXJsOiBfdXJsLCBidWZmZXI6IF9hdWRpb0J1ZmZlciwgY291bnRlcjogdGhpcy5idWZmZXJDb3VudGVyIH07XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YUFycmF5LnB1c2goZGF0YSk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiYXJyYXk6IFwiICsgdGhpcy5kYXRhQXJyYXkpO1xyXG5cclxuICAgICAgICAgICAgLy9UT0RPIGF1ZGlvQnVmZmVySG9sZGVyIG9ic29sZXRlIGlmIGFycmF5IHdvcmtpbmdcclxuICAgICAgICAgICAgdGhpcy5zZXRBdWRpb0J1ZmZlckhvbGRlcihkYXRhKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJkYXRhUGFpciBcIiArIGRhdGEudXJsICsgXCIgXCIgKyBkYXRhLmJ1ZmZlciArIFwiIFwiICsgZGF0YS5jb3VudGVyKTtcclxuICAgICAgICAgICAgdGhpcy5idWZmZXJDb3VudGVyICs9IDE7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmF1ZGlvQnVmZmVySG9sZGVyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogaXRlcmF0ZUFycmF5XHJcbiAgICAgICAgICogTG9vayBhdCBzYXZlZCBEYXRhIENvdW50XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGNvdW50RGF0YUluQXJyYXkoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRGF0YUFycmF5IExlbmd0aDogXCIgKyB0aGlzLmRhdGFBcnJheS5sZW5ndGgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogc2hvd0RhdGFJbkFycmF5XHJcbiAgICAgICAgICogU2hvdyBhbGwgRGF0YSBpbiBBcnJheVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzaG93RGF0YUluQXJyYXkoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHg6IG51bWJlciA9IDA7IHggPCB0aGlzLmRhdGFBcnJheS5sZW5ndGg7IHgrKykge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJBcnJheSBEYXRhOiBcIiArIHRoaXMuZGF0YUFycmF5W3hdLnVybCArIHRoaXMuZGF0YUFycmF5W3hdLmJ1ZmZlcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIGdldEF1ZGlvQnVmZmVyXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGdldEF1ZGlvQnVmZmVySG9sZGVyKCk6IEF1ZGlvRGF0YSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmF1ZGlvQnVmZmVySG9sZGVyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogc2V0QXVkaW9CdWZmZXJcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc2V0QXVkaW9CdWZmZXJIb2xkZXIoX2F1ZGlvRGF0YTogQXVkaW9EYXRhKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuYXVkaW9CdWZmZXJIb2xkZXIgPSBfYXVkaW9EYXRhO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRXJyb3IgTWVzc2FnZSBmb3IgRGF0YSBGZXRjaGluZ1xyXG4gICAgICAgICAqIEBwYXJhbSBlIEVycm9yXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBsb2dFcnJvckZldGNoKGU6IEVycm9yKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQXVkaW8gZXJyb3JcIiwgZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIERlc2NyaWJlcyBHbG9iYWwgQXVkaW8gU2V0dGluZ3MuXHJcbiAgICAgKiBJcyBtZWFudCB0byBiZSB1c2VkIGFzIGEgTWVudSBvcHRpb24uXHJcbiAgICAgKiBAYXV0aG9ycyBUaG9tYXMgRG9ybmVyLCBIRlUsIDIwMTlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIEF1ZGlvU2V0dGluZ3Mge1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vcHVibGljIGF1ZGlvU2Vzc2lvbkRhdGE6IEF1ZGlvU2Vzc2lvbkRhdGE7XHJcblxyXG4gICAgICAgIC8vVE9ETyBBZGQgbWFzdGVyR2FpblxyXG4gICAgICAgIHB1YmxpYyBtYXN0ZXJHYWluOiBHYWluTm9kZTtcclxuICAgICAgICBwdWJsaWMgbWFzdGVyR2FpblZhbHVlOiBudW1iZXI7XHJcblxyXG4gICAgICAgIC8vIGNvbnN0PyBvciBwcml2YXRlIHdpdGggZ2V0dGVyP1xyXG4gICAgICAgIHByaXZhdGUgZ2xvYmFsQXVkaW9Db250ZXh0OiBBdWRpb0NvbnRleHQ7XHJcblxyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ29uc3RydWN0b3IgZm9yIG1hc3RlciBWb2x1bWVcclxuICAgICAgICAgKiBAcGFyYW0gX2dhaW5WYWx1ZSBcclxuICAgICAgICAgKi9cclxuICAgICAgICBjb25zdHJ1Y3RvcihfZ2FpblZhbHVlOiBudW1iZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5zZXRBdWRpb0NvbnRleHQobmV3IEF1ZGlvQ29udGV4dCh7IGxhdGVuY3lIaW50OiBcImludGVyYWN0aXZlXCIsIHNhbXBsZVJhdGU6IDQ0MTAwIH0pKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vdGhpcy5nbG9iYWxBdWRpb0NvbnRleHQucmVzdW1lKCk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiR2xvYmFsQXVkaW9Db250ZXh0OiBcIiArIHRoaXMuZ2xvYmFsQXVkaW9Db250ZXh0KTtcclxuICAgICAgICAgICAgdGhpcy5tYXN0ZXJHYWluID0gdGhpcy5nbG9iYWxBdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xyXG4gICAgICAgICAgICB0aGlzLm1hc3RlckdhaW5WYWx1ZSA9IF9nYWluVmFsdWU7XHJcblxyXG4gICAgICAgICAgICAvL3RoaXMuYXVkaW9TZXNzaW9uRGF0YSA9IG5ldyBBdWRpb1Nlc3Npb25EYXRhKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc2V0TWFzdGVyR2FpblZhbHVlKF9tYXN0ZXJHYWluVmFsdWU6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLm1hc3RlckdhaW5WYWx1ZSA9IF9tYXN0ZXJHYWluVmFsdWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0TWFzdGVyR2FpblZhbHVlKCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1hc3RlckdhaW5WYWx1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRBdWRpb0NvbnRleHQoKTogQXVkaW9Db250ZXh0IHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2xvYmFsQXVkaW9Db250ZXh0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHNldEF1ZGlvQ29udGV4dChfYXVkaW9Db250ZXh0OiBBdWRpb0NvbnRleHQpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5nbG9iYWxBdWRpb0NvbnRleHQgPSBfYXVkaW9Db250ZXh0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9UT0RPIGFkZCBzdXNwZW5kL3Jlc3VtZSBmdW5jdGlvbnMgZm9yIEF1ZGlvQ29udGV4dCBjb250cm9sc1xyXG4gICAgfVxyXG59IiwiLy88cmVmZXJlbmNlIHBhdGg9XCIuLi9Db2F0cy9Db2F0LnRzXCIvPlxyXG5uYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIHR5cGUgQ29hdEluamVjdGlvbiA9ICh0aGlzOiBDb2F0LCBfcmVuZGVyU2hhZGVyOiBSZW5kZXJTaGFkZXIpID0+IHZvaWQ7XHJcbiAgICBleHBvcnQgY2xhc3MgUmVuZGVySW5qZWN0b3Ige1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGNvYXRJbmplY3Rpb25zOiB7IFtjbGFzc05hbWU6IHN0cmluZ106IENvYXRJbmplY3Rpb24gfSA9IHtcclxuICAgICAgICAgICAgXCJDb2F0Q29sb3JlZFwiOiBSZW5kZXJJbmplY3Rvci5pbmplY3RSZW5kZXJEYXRhRm9yQ29hdENvbG9yZWQsXHJcbiAgICAgICAgICAgIFwiQ29hdFRleHR1cmVkXCI6IFJlbmRlckluamVjdG9yLmluamVjdFJlbmRlckRhdGFGb3JDb2F0VGV4dHVyZWQsXHJcbiAgICAgICAgICAgIFwiQ29hdE1hdENhcFwiOiBSZW5kZXJJbmplY3Rvci5pbmplY3RSZW5kZXJEYXRhRm9yQ29hdE1hdENhcFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZGVjb3JhdGVDb2F0KF9jb25zdHJ1Y3RvcjogRnVuY3Rpb24pOiB2b2lkIHtcclxuICAgICAgICAgICAgbGV0IGNvYXRJbmplY3Rpb246IENvYXRJbmplY3Rpb24gPSBSZW5kZXJJbmplY3Rvci5jb2F0SW5qZWN0aW9uc1tfY29uc3RydWN0b3IubmFtZV07XHJcbiAgICAgICAgICAgIGlmICghY29hdEluamVjdGlvbikge1xyXG4gICAgICAgICAgICAgICAgRGVidWcuZXJyb3IoXCJObyBpbmplY3Rpb24gZGVjb3JhdG9yIGRlZmluZWQgZm9yIFwiICsgX2NvbnN0cnVjdG9yLm5hbWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShfY29uc3RydWN0b3IucHJvdG90eXBlLCBcInVzZVJlbmRlckRhdGFcIiwge1xyXG4gICAgICAgICAgICAgICAgdmFsdWU6IGNvYXRJbmplY3Rpb25cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBpbmplY3RSZW5kZXJEYXRhRm9yQ29hdENvbG9yZWQodGhpczogQ29hdCwgX3JlbmRlclNoYWRlcjogUmVuZGVyU2hhZGVyKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGxldCBjb2xvclVuaWZvcm1Mb2NhdGlvbjogV2ViR0xVbmlmb3JtTG9jYXRpb24gPSBfcmVuZGVyU2hhZGVyLnVuaWZvcm1zW1widV9jb2xvclwiXTtcclxuICAgICAgICAgICAgLy8gbGV0IHsgciwgZywgYiwgYSB9ID0gKDxDb2F0Q29sb3JlZD50aGlzKS5jb2xvcjtcclxuICAgICAgICAgICAgLy8gbGV0IGNvbG9yOiBGbG9hdDMyQXJyYXkgPSBuZXcgRmxvYXQzMkFycmF5KFtyLCBnLCBiLCBhXSk7XHJcbiAgICAgICAgICAgIGxldCBjb2xvcjogRmxvYXQzMkFycmF5ID0gKDxDb2F0Q29sb3JlZD50aGlzKS5jb2xvci5nZXRBcnJheSgpO1xyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5nZXRSZW5kZXJpbmdDb250ZXh0KCkudW5pZm9ybTRmdihjb2xvclVuaWZvcm1Mb2NhdGlvbiwgY29sb3IpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgaW5qZWN0UmVuZGVyRGF0YUZvckNvYXRUZXh0dXJlZCh0aGlzOiBDb2F0LCBfcmVuZGVyU2hhZGVyOiBSZW5kZXJTaGFkZXIpOiB2b2lkIHtcclxuICAgICAgICAgICAgbGV0IGNyYzM6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQgPSBSZW5kZXJPcGVyYXRvci5nZXRSZW5kZXJpbmdDb250ZXh0KCk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnJlbmRlckRhdGEpIHtcclxuICAgICAgICAgICAgICAgIC8vIGJ1ZmZlcnMgZXhpc3RcclxuICAgICAgICAgICAgICAgIGNyYzMuYWN0aXZlVGV4dHVyZShXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlRFWFRVUkUwKTtcclxuICAgICAgICAgICAgICAgIGNyYzMuYmluZFRleHR1cmUoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5URVhUVVJFXzJELCB0aGlzLnJlbmRlckRhdGFbXCJ0ZXh0dXJlMFwiXSk7XHJcbiAgICAgICAgICAgICAgICBjcmMzLnVuaWZvcm0xaShfcmVuZGVyU2hhZGVyLnVuaWZvcm1zW1widV90ZXh0dXJlXCJdLCAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyRGF0YSA9IHt9O1xyXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogY2hlY2sgaWYgYWxsIFdlYkdMLUNyZWF0aW9ucyBhcmUgYXNzZXJ0ZWRcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRleHR1cmU6IFdlYkdMVGV4dHVyZSA9IFJlbmRlck1hbmFnZXIuYXNzZXJ0PFdlYkdMVGV4dHVyZT4oY3JjMy5jcmVhdGVUZXh0dXJlKCkpO1xyXG4gICAgICAgICAgICAgICAgY3JjMy5iaW5kVGV4dHVyZShXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlRFWFRVUkVfMkQsIHRleHR1cmUpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3JjMy50ZXhJbWFnZTJEKGNyYzMuVEVYVFVSRV8yRCwgMCwgY3JjMy5SR0JBLCBjcmMzLlJHQkEsIGNyYzMuVU5TSUdORURfQllURSwgKDxDb2F0VGV4dHVyZWQ+dGhpcykudGV4dHVyZS5pbWFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY3JjMy50ZXhJbWFnZTJEKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlRFWFRVUkVfMkQsIDAsIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuUkdCQSwgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5SR0JBLCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlVOU0lHTkVEX0JZVEUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICg8Q29hdFRleHR1cmVkPnRoaXMpLnRleHR1cmUuaW1hZ2VcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoX2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBEZWJ1Zy5lcnJvcihfZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjcmMzLnRleFBhcmFtZXRlcmkoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5URVhUVVJFXzJELCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlRFWFRVUkVfTUFHX0ZJTFRFUiwgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5ORUFSRVNUKTtcclxuICAgICAgICAgICAgICAgIGNyYzMudGV4UGFyYW1ldGVyaShXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlRFWFRVUkVfMkQsIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVEVYVFVSRV9NSU5fRklMVEVSLCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0Lk5FQVJFU1QpO1xyXG4gICAgICAgICAgICAgICAgY3JjMy5nZW5lcmF0ZU1pcG1hcChjcmMzLlRFWFRVUkVfMkQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJEYXRhW1widGV4dHVyZTBcIl0gPSB0ZXh0dXJlO1xyXG5cclxuICAgICAgICAgICAgICAgIGNyYzMuYmluZFRleHR1cmUoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5URVhUVVJFXzJELCBudWxsKTtcclxuICAgICAgICAgICAgICAgIHRoaXMudXNlUmVuZGVyRGF0YShfcmVuZGVyU2hhZGVyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgaW5qZWN0UmVuZGVyRGF0YUZvckNvYXRNYXRDYXAodGhpczogQ29hdCwgX3JlbmRlclNoYWRlcjogUmVuZGVyU2hhZGVyKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGxldCBjcmMzOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0ID0gUmVuZGVyT3BlcmF0b3IuZ2V0UmVuZGVyaW5nQ29udGV4dCgpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGNvbG9yVW5pZm9ybUxvY2F0aW9uOiBXZWJHTFVuaWZvcm1Mb2NhdGlvbiA9IF9yZW5kZXJTaGFkZXIudW5pZm9ybXNbXCJ1X3RpbnRfY29sb3JcIl07XHJcbiAgICAgICAgICAgIGxldCB7IHIsIGcsIGIsIGEgfSA9ICg8Q29hdE1hdENhcD50aGlzKS50aW50Q29sb3I7XHJcbiAgICAgICAgICAgIGxldCB0aW50Q29sb3JBcnJheTogRmxvYXQzMkFycmF5ID0gbmV3IEZsb2F0MzJBcnJheShbciwgZywgYiwgYV0pO1xyXG4gICAgICAgICAgICBjcmMzLnVuaWZvcm00ZnYoY29sb3JVbmlmb3JtTG9jYXRpb24sIHRpbnRDb2xvckFycmF5KTtcclxuXHJcbiAgICAgICAgICAgIGxldCBmbG9hdFVuaWZvcm1Mb2NhdGlvbjogV2ViR0xVbmlmb3JtTG9jYXRpb24gPSBfcmVuZGVyU2hhZGVyLnVuaWZvcm1zW1widV9mbGF0bWl4XCJdO1xyXG4gICAgICAgICAgICBsZXQgZmxhdE1peDogbnVtYmVyID0gKDxDb2F0TWF0Q2FwPnRoaXMpLmZsYXRNaXg7XHJcbiAgICAgICAgICAgIGNyYzMudW5pZm9ybTFmKGZsb2F0VW5pZm9ybUxvY2F0aW9uLCBmbGF0TWl4KTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnJlbmRlckRhdGEpIHtcclxuICAgICAgICAgICAgICAgIC8vIGJ1ZmZlcnMgZXhpc3RcclxuICAgICAgICAgICAgICAgIGNyYzMuYWN0aXZlVGV4dHVyZShXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlRFWFRVUkUwKTtcclxuICAgICAgICAgICAgICAgIGNyYzMuYmluZFRleHR1cmUoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5URVhUVVJFXzJELCB0aGlzLnJlbmRlckRhdGFbXCJ0ZXh0dXJlMFwiXSk7XHJcbiAgICAgICAgICAgICAgICBjcmMzLnVuaWZvcm0xaShfcmVuZGVyU2hhZGVyLnVuaWZvcm1zW1widV90ZXh0dXJlXCJdLCAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyRGF0YSA9IHt9O1xyXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogY2hlY2sgaWYgYWxsIFdlYkdMLUNyZWF0aW9ucyBhcmUgYXNzZXJ0ZWRcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRleHR1cmU6IFdlYkdMVGV4dHVyZSA9IFJlbmRlck1hbmFnZXIuYXNzZXJ0PFdlYkdMVGV4dHVyZT4oY3JjMy5jcmVhdGVUZXh0dXJlKCkpO1xyXG4gICAgICAgICAgICAgICAgY3JjMy5iaW5kVGV4dHVyZShXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlRFWFRVUkVfMkQsIHRleHR1cmUpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3JjMy50ZXhJbWFnZTJEKGNyYzMuVEVYVFVSRV8yRCwgMCwgY3JjMy5SR0JBLCBjcmMzLlJHQkEsIGNyYzMuVU5TSUdORURfQllURSwgKDxDb2F0TWF0Q2FwPnRoaXMpLnRleHR1cmUuaW1hZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNyYzMudGV4SW1hZ2UyRChcclxuICAgICAgICAgICAgICAgICAgICAgICAgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5URVhUVVJFXzJELCAwLCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlJHQkEsIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuUkdCQSwgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5VTlNJR05FRF9CWVRFLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAoPENvYXRNYXRDYXA+dGhpcykudGV4dHVyZS5pbWFnZVxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChfZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIERlYnVnLmVycm9yKF9lKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNyYzMudGV4UGFyYW1ldGVyaShXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlRFWFRVUkVfMkQsIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVEVYVFVSRV9NQUdfRklMVEVSLCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0Lk5FQVJFU1QpO1xyXG4gICAgICAgICAgICAgICAgY3JjMy50ZXhQYXJhbWV0ZXJpKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVEVYVFVSRV8yRCwgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5URVhUVVJFX01JTl9GSUxURVIsIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuTkVBUkVTVCk7XHJcbiAgICAgICAgICAgICAgICBjcmMzLmdlbmVyYXRlTWlwbWFwKGNyYzMuVEVYVFVSRV8yRCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlckRhdGFbXCJ0ZXh0dXJlMFwiXSA9IHRleHR1cmU7XHJcblxyXG4gICAgICAgICAgICAgICAgY3JjMy5iaW5kVGV4dHVyZShXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlRFWFRVUkVfMkQsIG51bGwpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy51c2VSZW5kZXJEYXRhKF9yZW5kZXJTaGFkZXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIEJ1ZmZlclNwZWNpZmljYXRpb24ge1xyXG4gICAgICAgIHNpemU6IG51bWJlcjsgICAvLyBUaGUgc2l6ZSBvZiB0aGUgZGF0YXNhbXBsZS5cclxuICAgICAgICBkYXRhVHlwZTogbnVtYmVyOyAvLyBUaGUgZGF0YXR5cGUgb2YgdGhlIHNhbXBsZSAoZS5nLiBnbC5GTE9BVCwgZ2wuQllURSwgZXRjLilcclxuICAgICAgICBub3JtYWxpemU6IGJvb2xlYW47IC8vIEZsYWcgdG8gbm9ybWFsaXplIHRoZSBkYXRhLlxyXG4gICAgICAgIHN0cmlkZTogbnVtYmVyOyAvLyBOdW1iZXIgb2YgaW5kaWNlcyB0aGF0IHdpbGwgYmUgc2tpcHBlZCBlYWNoIGl0ZXJhdGlvbi5cclxuICAgICAgICBvZmZzZXQ6IG51bWJlcjsgLy8gSW5kZXggb2YgdGhlIGVsZW1lbnQgdG8gYmVnaW4gd2l0aC5cclxuICAgIH1cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgUmVuZGVyU2hhZGVyIHtcclxuICAgICAgICAvLyBUT0RPOiBleGFtaW5lLCBpZiB0aGlzIHNob3VsZCBiZSBpbmplY3RlZCBpbiBzaGFkZXIgY2xhc3MgdmlhIFJlbmRlckluamVjdG9yLCBhcyBkb25lIHdpdGggQ29hdFxyXG4gICAgICAgIHByb2dyYW06IFdlYkdMUHJvZ3JhbTtcclxuICAgICAgICBhdHRyaWJ1dGVzOiB7IFtuYW1lOiBzdHJpbmddOiBudW1iZXIgfTtcclxuICAgICAgICB1bmlmb3JtczogeyBbbmFtZTogc3RyaW5nXTogV2ViR0xVbmlmb3JtTG9jYXRpb24gfTtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIFJlbmRlckJ1ZmZlcnMge1xyXG4gICAgICAgIC8vIFRPRE86IGV4YW1pbmUsIGlmIHRoaXMgc2hvdWxkIGJlIGluamVjdGVkIGluIG1lc2ggY2xhc3MgdmlhIFJlbmRlckluamVjdG9yLCBhcyBkb25lIHdpdGggQ29hdFxyXG4gICAgICAgIHZlcnRpY2VzOiBXZWJHTEJ1ZmZlcjtcclxuICAgICAgICBpbmRpY2VzOiBXZWJHTEJ1ZmZlcjtcclxuICAgICAgICBuSW5kaWNlczogbnVtYmVyO1xyXG4gICAgICAgIHRleHR1cmVVVnM6IFdlYkdMQnVmZmVyO1xyXG4gICAgICAgIG5vcm1hbHNGYWNlOiBXZWJHTEJ1ZmZlcjtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIFJlbmRlckNvYXQge1xyXG4gICAgICAgIC8vVE9ETzogZXhhbWluZSwgaWYgaXQgbWFrZXMgc2Vuc2UgdG8gc3RvcmUgYSB2YW8gZm9yIGVhY2ggQ29hdCwgZXZlbiB0aG91Z2ggZS5nLiBjb2xvciB3b24ndCBiZSBzdG9yZWQgYW55d2F5Li4uXHJcbiAgICAgICAgLy92YW86IFdlYkdMVmVydGV4QXJyYXlPYmplY3Q7XHJcbiAgICAgICAgY29hdDogQ29hdDtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIFJlbmRlckxpZ2h0cyB7XHJcbiAgICAgICAgW3R5cGU6IHN0cmluZ106IEZsb2F0MzJBcnJheTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEJhc2UgY2xhc3MgZm9yIFJlbmRlck1hbmFnZXIsIGhhbmRsaW5nIHRoZSBjb25uZWN0aW9uIHRvIHRoZSByZW5kZXJpbmcgc3lzdGVtLCBpbiB0aGlzIGNhc2UgV2ViR0wuXHJcbiAgICAgKiBNZXRob2RzIGFuZCBhdHRyaWJ1dGVzIG9mIHRoaXMgY2xhc3Mgc2hvdWxkIG5vdCBiZSBjYWxsZWQgZGlyZWN0bHksIG9ubHkgdGhyb3VnaCBbW1JlbmRlck1hbmFnZXJdXVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgYWJzdHJhY3QgY2xhc3MgUmVuZGVyT3BlcmF0b3Ige1xyXG4gICAgICAgIHByb3RlY3RlZCBzdGF0aWMgY3JjMzogV2ViR0wyUmVuZGVyaW5nQ29udGV4dDtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyByZWN0Vmlld3BvcnQ6IFJlY3RhbmdsZTtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyByZW5kZXJTaGFkZXJSYXlDYXN0OiBSZW5kZXJTaGFkZXI7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICogQ2hlY2tzIHRoZSBmaXJzdCBwYXJhbWV0ZXIgYW5kIHRocm93cyBhbiBleGNlcHRpb24gd2l0aCB0aGUgV2ViR0wtZXJyb3Jjb2RlIGlmIHRoZSB2YWx1ZSBpcyBudWxsXHJcbiAgICAgICAgKiBAcGFyYW0gX3ZhbHVlIC8vIHZhbHVlIHRvIGNoZWNrIGFnYWluc3QgbnVsbFxyXG4gICAgICAgICogQHBhcmFtIF9tZXNzYWdlIC8vIG9wdGlvbmFsLCBhZGRpdGlvbmFsIG1lc3NhZ2UgZm9yIHRoZSBleGNlcHRpb25cclxuICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgYXNzZXJ0PFQ+KF92YWx1ZTogVCB8IG51bGwsIF9tZXNzYWdlOiBzdHJpbmcgPSBcIlwiKTogVCB7XHJcbiAgICAgICAgICAgIGlmIChfdmFsdWUgPT09IG51bGwpXHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEFzc2VydGlvbiBmYWlsZWQuICR7X21lc3NhZ2V9LCBXZWJHTC1FcnJvcjogJHtSZW5kZXJPcGVyYXRvci5jcmMzID8gUmVuZGVyT3BlcmF0b3IuY3JjMy5nZXRFcnJvcigpIDogXCJcIn1gKTtcclxuICAgICAgICAgICAgcmV0dXJuIF92YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogSW5pdGlhbGl6ZXMgb2Zmc2NyZWVuLWNhbnZhcywgcmVuZGVyaW5nY29udGV4dCBhbmQgaGFyZHdhcmUgdmlld3BvcnQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBpbml0aWFsaXplKCk6IHZvaWQge1xyXG4gICAgICAgICAgICBsZXQgY29udGV4dEF0dHJpYnV0ZXM6IFdlYkdMQ29udGV4dEF0dHJpYnV0ZXMgPSB7IGFscGhhOiBmYWxzZSwgYW50aWFsaWFzOiBmYWxzZSB9O1xyXG4gICAgICAgICAgICBsZXQgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMgPSBSZW5kZXJPcGVyYXRvci5hc3NlcnQ8V2ViR0wyUmVuZGVyaW5nQ29udGV4dD4oXHJcbiAgICAgICAgICAgICAgICBjYW52YXMuZ2V0Q29udGV4dChcIndlYmdsMlwiLCBjb250ZXh0QXR0cmlidXRlcyksXHJcbiAgICAgICAgICAgICAgICBcIldlYkdMLWNvbnRleHQgY291bGRuJ3QgYmUgY3JlYXRlZFwiXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIC8vIEVuYWJsZSBiYWNrZmFjZS0gYW5kIHpCdWZmZXItY3VsbGluZy5cclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy5lbmFibGUoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5DVUxMX0ZBQ0UpO1xyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmVuYWJsZShXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkRFUFRIX1RFU1QpO1xyXG4gICAgICAgICAgICAvLyBSZW5kZXJPcGVyYXRvci5jcmMzLnBpeGVsU3RvcmVpKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVU5QQUNLX0ZMSVBfWV9XRUJHTCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLnJlY3RWaWV3cG9ydCA9IFJlbmRlck9wZXJhdG9yLmdldENhbnZhc1JlY3QoKTtcclxuXHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLnJlbmRlclNoYWRlclJheUNhc3QgPSBSZW5kZXJPcGVyYXRvci5jcmVhdGVQcm9ncmFtKFNoYWRlclJheUNhc3QpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJuIGEgcmVmZXJlbmNlIHRvIHRoZSBvZmZzY3JlZW4tY2FudmFzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXRDYW52YXMoKTogSFRNTENhbnZhc0VsZW1lbnQge1xyXG4gICAgICAgICAgICByZXR1cm4gPEhUTUxDYW52YXNFbGVtZW50PlJlbmRlck9wZXJhdG9yLmNyYzMuY2FudmFzOyAvLyBUT0RPOiBlbmFibGUgT2Zmc2NyZWVuQ2FudmFzXHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybiBhIHJlZmVyZW5jZSB0byB0aGUgcmVuZGVyaW5nIGNvbnRleHRcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGdldFJlbmRlcmluZ0NvbnRleHQoKTogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCB7XHJcbiAgICAgICAgICAgIHJldHVybiBSZW5kZXJPcGVyYXRvci5jcmMzO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm4gYSByZWN0YW5nbGUgZGVzY3JpYmluZyB0aGUgc2l6ZSBvZiB0aGUgb2Zmc2NyZWVuLWNhbnZhcy4geCx5IGFyZSAwIGF0IGFsbCB0aW1lcy5cclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGdldENhbnZhc1JlY3QoKTogUmVjdGFuZ2xlIHtcclxuICAgICAgICAgICAgbGV0IGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQgPSA8SFRNTENhbnZhc0VsZW1lbnQ+UmVuZGVyT3BlcmF0b3IuY3JjMy5jYW52YXM7XHJcbiAgICAgICAgICAgIHJldHVybiBSZWN0YW5nbGUuR0VUKDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNldCB0aGUgc2l6ZSBvZiB0aGUgb2Zmc2NyZWVuLWNhbnZhcy5cclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHNldENhbnZhc1NpemUoX3dpZHRoOiBudW1iZXIsIF9oZWlnaHQ6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmNhbnZhcy53aWR0aCA9IF93aWR0aDtcclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy5jYW52YXMuaGVpZ2h0ID0gX2hlaWdodDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2V0IHRoZSBhcmVhIG9uIHRoZSBvZmZzY3JlZW4tY2FudmFzIHRvIHJlbmRlciB0aGUgY2FtZXJhIGltYWdlIHRvLlxyXG4gICAgICAgICAqIEBwYXJhbSBfcmVjdFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgc2V0Vmlld3BvcnRSZWN0YW5nbGUoX3JlY3Q6IFJlY3RhbmdsZSk6IHZvaWQge1xyXG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKFJlbmRlck9wZXJhdG9yLnJlY3RWaWV3cG9ydCwgX3JlY3QpO1xyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLnZpZXdwb3J0KF9yZWN0LngsIF9yZWN0LnksIF9yZWN0LndpZHRoLCBfcmVjdC5oZWlnaHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXRyaWV2ZSB0aGUgYXJlYSBvbiB0aGUgb2Zmc2NyZWVuLWNhbnZhcyB0aGUgY2FtZXJhIGltYWdlIGdldHMgcmVuZGVyZWQgdG8uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXRWaWV3cG9ydFJlY3RhbmdsZSgpOiBSZWN0YW5nbGUge1xyXG4gICAgICAgICAgICByZXR1cm4gUmVuZGVyT3BlcmF0b3IucmVjdFZpZXdwb3J0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ29udmVydCBsaWdodCBkYXRhIHRvIGZsYXQgYXJyYXlzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJvdGVjdGVkIHN0YXRpYyBjcmVhdGVSZW5kZXJMaWdodHMoX2xpZ2h0czogTWFwTGlnaHRUeXBlVG9MaWdodExpc3QpOiBSZW5kZXJMaWdodHMge1xyXG4gICAgICAgICAgICBsZXQgcmVuZGVyTGlnaHRzOiBSZW5kZXJMaWdodHMgPSB7fTtcclxuICAgICAgICAgICAgZm9yIChsZXQgZW50cnkgb2YgX2xpZ2h0cykge1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoIChlbnRyeVswXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgTGlnaHRBbWJpZW50Lm5hbWU6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBhbWJpZW50OiBudW1iZXJbXSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBsaWdodCBvZiBlbnRyeVsxXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGM6IENvbG9yID0gbGlnaHQuZ2V0TGlnaHQoKS5jb2xvcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFtYmllbnQucHVzaChjLnIsIGMuZywgYy5iLCBjLmEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckxpZ2h0c1tcInVfYW1iaWVudFwiXSA9IG5ldyBGbG9hdDMyQXJyYXkoYW1iaWVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgTGlnaHREaXJlY3Rpb25hbC5uYW1lOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZGlyZWN0aW9uYWw6IG51bWJlcltdID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGxpZ2h0IG9mIGVudHJ5WzFdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgYzogQ29sb3IgPSBsaWdodC5nZXRMaWdodCgpLmNvbG9yO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGQ6IFZlY3RvcjMgPSAoPExpZ2h0RGlyZWN0aW9uYWw+bGlnaHQuZ2V0TGlnaHQoKSkuZGlyZWN0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uYWwucHVzaChjLnIsIGMuZywgYy5iLCBjLmEsIGQueCwgZC55LCBkLnopO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckxpZ2h0c1tcInVfZGlyZWN0aW9uYWxcIl0gPSBuZXcgRmxvYXQzMkFycmF5KGRpcmVjdGlvbmFsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgRGVidWcud2FybihcIlNoYWRlcnN0cnVjdHVyZSB1bmRlZmluZWQgZm9yXCIsIGVudHJ5WzBdKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVuZGVyTGlnaHRzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2V0IGxpZ2h0IGRhdGEgaW4gc2hhZGVyc1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByb3RlY3RlZCBzdGF0aWMgc2V0TGlnaHRzSW5TaGFkZXIoX3JlbmRlclNoYWRlcjogUmVuZGVyU2hhZGVyLCBfbGlnaHRzOiBNYXBMaWdodFR5cGVUb0xpZ2h0TGlzdCk6IHZvaWQge1xyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci51c2VQcm9ncmFtKF9yZW5kZXJTaGFkZXIpO1xyXG4gICAgICAgICAgICBsZXQgdW5pOiB7IFtuYW1lOiBzdHJpbmddOiBXZWJHTFVuaWZvcm1Mb2NhdGlvbiB9ID0gX3JlbmRlclNoYWRlci51bmlmb3JtcztcclxuXHJcbiAgICAgICAgICAgIGxldCBhbWJpZW50OiBXZWJHTFVuaWZvcm1Mb2NhdGlvbiA9IHVuaVtcInVfYW1iaWVudC5jb2xvclwiXTtcclxuICAgICAgICAgICAgaWYgKGFtYmllbnQpIHtcclxuICAgICAgICAgICAgICAgIGxldCBjbXBMaWdodHM6IENvbXBvbmVudExpZ2h0W10gPSBfbGlnaHRzLmdldChcIkxpZ2h0QW1iaWVudFwiKTtcclxuICAgICAgICAgICAgICAgIGlmIChjbXBMaWdodHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBhZGQgdXAgYW1iaWVudCBsaWdodHMgdG8gYSBzaW5nbGUgY29sb3JcclxuICAgICAgICAgICAgICAgICAgICAvLyBsZXQgcmVzdWx0OiBDb2xvciA9IG5ldyBDb2xvcigwLCAwLCAwLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBjbXBMaWdodCBvZiBjbXBMaWdodHMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZvciBub3csIG9ubHkgdGhlIGxhc3QgaXMgcmVsZXZhbnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy51bmlmb3JtNGZ2KGFtYmllbnQsIGNtcExpZ2h0LmdldExpZ2h0KCkuY29sb3IuZ2V0QXJyYXkoKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBuRGlyZWN0aW9uYWw6IFdlYkdMVW5pZm9ybUxvY2F0aW9uID0gdW5pW1widV9uTGlnaHRzRGlyZWN0aW9uYWxcIl07XHJcbiAgICAgICAgICAgIGlmIChuRGlyZWN0aW9uYWwpIHtcclxuICAgICAgICAgICAgICAgIGxldCBjbXBMaWdodHM6IENvbXBvbmVudExpZ2h0W10gPSBfbGlnaHRzLmdldChcIkxpZ2h0RGlyZWN0aW9uYWxcIik7XHJcbiAgICAgICAgICAgICAgICBpZiAoY21wTGlnaHRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG46IG51bWJlciA9IGNtcExpZ2h0cy5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy51bmlmb3JtMXVpKG5EaXJlY3Rpb25hbCwgbik7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IG47IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbGlnaHQ6IExpZ2h0RGlyZWN0aW9uYWwgPSA8TGlnaHREaXJlY3Rpb25hbD5jbXBMaWdodHNbaV0uZ2V0TGlnaHQoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy51bmlmb3JtNGZ2KHVuaVtgdV9kaXJlY3Rpb25hbFske2l9XS5jb2xvcmBdLCBsaWdodC5jb2xvci5nZXRBcnJheSgpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGRpcmVjdGlvbjogVmVjdG9yMyA9IGxpZ2h0LmRpcmVjdGlvbi5jb3B5O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3Rpb24udHJhbnNmb3JtKGNtcExpZ2h0c1tpXS5nZXRDb250YWluZXIoKS5tdHhXb3JsZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMudW5pZm9ybTNmdih1bmlbYHVfZGlyZWN0aW9uYWxbJHtpfV0uZGlyZWN0aW9uYF0sIGRpcmVjdGlvbi5nZXQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIGRlYnVnZ2VyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRHJhdyBhIG1lc2ggYnVmZmVyIHVzaW5nIHRoZSBnaXZlbiBpbmZvcyBhbmQgdGhlIGNvbXBsZXRlIHByb2plY3Rpb24gbWF0cml4XHJcbiAgICAgICAgICogQHBhcmFtIF9yZW5kZXJTaGFkZXIgXHJcbiAgICAgICAgICogQHBhcmFtIF9yZW5kZXJCdWZmZXJzIFxyXG4gICAgICAgICAqIEBwYXJhbSBfcmVuZGVyQ29hdCBcclxuICAgICAgICAgKiBAcGFyYW0gX3dvcmxkIFxyXG4gICAgICAgICAqIEBwYXJhbSBfcHJvamVjdGlvbiBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcm90ZWN0ZWQgc3RhdGljIGRyYXcoX3JlbmRlclNoYWRlcjogUmVuZGVyU2hhZGVyLCBfcmVuZGVyQnVmZmVyczogUmVuZGVyQnVmZmVycywgX3JlbmRlckNvYXQ6IFJlbmRlckNvYXQsIF93b3JsZDogTWF0cml4NHg0LCBfcHJvamVjdGlvbjogTWF0cml4NHg0KTogdm9pZCB7XHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLnVzZVByb2dyYW0oX3JlbmRlclNoYWRlcik7XHJcbiAgICAgICAgICAgIC8vIFJlbmRlck9wZXJhdG9yLnVzZUJ1ZmZlcnMoX3JlbmRlckJ1ZmZlcnMpO1xyXG4gICAgICAgICAgICAvLyBSZW5kZXJPcGVyYXRvci51c2VQYXJhbWV0ZXIoX3JlbmRlckNvYXQpO1xyXG5cclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy5iaW5kQnVmZmVyKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuQVJSQVlfQlVGRkVSLCBfcmVuZGVyQnVmZmVycy52ZXJ0aWNlcyk7XHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoX3JlbmRlclNoYWRlci5hdHRyaWJ1dGVzW1wiYV9wb3NpdGlvblwiXSk7XHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLnNldEF0dHJpYnV0ZVN0cnVjdHVyZShfcmVuZGVyU2hhZGVyLmF0dHJpYnV0ZXNbXCJhX3Bvc2l0aW9uXCJdLCBNZXNoLmdldEJ1ZmZlclNwZWNpZmljYXRpb24oKSk7XHJcblxyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmJpbmRCdWZmZXIoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgX3JlbmRlckJ1ZmZlcnMuaW5kaWNlcyk7XHJcblxyXG4gICAgICAgICAgICBpZiAoX3JlbmRlclNoYWRlci5hdHRyaWJ1dGVzW1wiYV90ZXh0dXJlVVZzXCJdKSB7XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmJpbmRCdWZmZXIoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5BUlJBWV9CVUZGRVIsIF9yZW5kZXJCdWZmZXJzLnRleHR1cmVVVnMpO1xyXG4gICAgICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShfcmVuZGVyU2hhZGVyLmF0dHJpYnV0ZXNbXCJhX3RleHR1cmVVVnNcIl0pOyAvLyBlbmFibGUgdGhlIGJ1ZmZlclxyXG4gICAgICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy52ZXJ0ZXhBdHRyaWJQb2ludGVyKF9yZW5kZXJTaGFkZXIuYXR0cmlidXRlc1tcImFfdGV4dHVyZVVWc1wiXSwgMiwgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5GTE9BVCwgZmFsc2UsIDAsIDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIFN1cHBseSBtYXRyaXhkYXRhIHRvIHNoYWRlci4gXHJcbiAgICAgICAgICAgIGxldCB1UHJvamVjdGlvbjogV2ViR0xVbmlmb3JtTG9jYXRpb24gPSBfcmVuZGVyU2hhZGVyLnVuaWZvcm1zW1widV9wcm9qZWN0aW9uXCJdO1xyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLnVuaWZvcm1NYXRyaXg0ZnYodVByb2plY3Rpb24sIGZhbHNlLCBfcHJvamVjdGlvbi5nZXQoKSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoX3JlbmRlclNoYWRlci51bmlmb3Jtc1tcInVfd29ybGRcIl0pIHtcclxuICAgICAgICAgICAgICAgIGxldCB1V29ybGQ6IFdlYkdMVW5pZm9ybUxvY2F0aW9uID0gX3JlbmRlclNoYWRlci51bmlmb3Jtc1tcInVfd29ybGRcIl07XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLnVuaWZvcm1NYXRyaXg0ZnYodVdvcmxkLCBmYWxzZSwgX3dvcmxkLmdldCgpKTtcclxuXHJcbiAgICAgICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmJpbmRCdWZmZXIoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5BUlJBWV9CVUZGRVIsIF9yZW5kZXJCdWZmZXJzLm5vcm1hbHNGYWNlKTtcclxuICAgICAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoX3JlbmRlclNoYWRlci5hdHRyaWJ1dGVzW1wiYV9ub3JtYWxcIl0pO1xyXG4gICAgICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3Iuc2V0QXR0cmlidXRlU3RydWN0dXJlKF9yZW5kZXJTaGFkZXIuYXR0cmlidXRlc1tcImFfbm9ybWFsXCJdLCBNZXNoLmdldEJ1ZmZlclNwZWNpZmljYXRpb24oKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gVE9ETzogdGhpcyBpcyBhbGwgdGhhdCdzIGxlZnQgb2YgY29hdCBoYW5kbGluZyBpbiBSZW5kZXJPcGVyYXRvciwgZHVlIHRvIGluamVjdGlvbi4gU28gZXh0cmEgcmVmZXJlbmNlIGZyb20gbm9kZSB0byBjb2F0IGlzIHVubmVjZXNzYXJ5XHJcbiAgICAgICAgICAgIF9yZW5kZXJDb2F0LmNvYXQudXNlUmVuZGVyRGF0YShfcmVuZGVyU2hhZGVyKTtcclxuXHJcbiAgICAgICAgICAgIC8vIERyYXcgY2FsbFxyXG4gICAgICAgICAgICAvLyBSZW5kZXJPcGVyYXRvci5jcmMzLmRyYXdFbGVtZW50cyhXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlRSSUFOR0xFUywgTWVzaC5nZXRCdWZmZXJTcGVjaWZpY2F0aW9uKCkub2Zmc2V0LCBfcmVuZGVyQnVmZmVycy5uSW5kaWNlcyk7XHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMuZHJhd0VsZW1lbnRzKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVFJJQU5HTEVTLCBfcmVuZGVyQnVmZmVycy5uSW5kaWNlcywgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5VTlNJR05FRF9TSE9SVCwgMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEcmF3IGEgYnVmZmVyIHdpdGggYSBzcGVjaWFsIHNoYWRlciB0aGF0IHVzZXMgYW4gaWQgaW5zdGVhZCBvZiBhIGNvbG9yXHJcbiAgICAgICAgICogQHBhcmFtIF9yZW5kZXJTaGFkZXJcclxuICAgICAgICAgKiBAcGFyYW0gX3JlbmRlckJ1ZmZlcnMgXHJcbiAgICAgICAgICogQHBhcmFtIF93b3JsZCBcclxuICAgICAgICAgKiBAcGFyYW0gX3Byb2plY3Rpb24gXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJvdGVjdGVkIHN0YXRpYyBkcmF3Rm9yUmF5Q2FzdChfaWQ6IG51bWJlciwgX3JlbmRlckJ1ZmZlcnM6IFJlbmRlckJ1ZmZlcnMsIF93b3JsZDogTWF0cml4NHg0LCBfcHJvamVjdGlvbjogTWF0cml4NHg0KTogdm9pZCB7XHJcbiAgICAgICAgICAgIGxldCByZW5kZXJTaGFkZXI6IFJlbmRlclNoYWRlciA9IFJlbmRlck9wZXJhdG9yLnJlbmRlclNoYWRlclJheUNhc3Q7IFxyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci51c2VQcm9ncmFtKHJlbmRlclNoYWRlcik7XHJcblxyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmJpbmRCdWZmZXIoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5BUlJBWV9CVUZGRVIsIF9yZW5kZXJCdWZmZXJzLnZlcnRpY2VzKTtcclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShyZW5kZXJTaGFkZXIuYXR0cmlidXRlc1tcImFfcG9zaXRpb25cIl0pO1xyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5zZXRBdHRyaWJ1dGVTdHJ1Y3R1cmUocmVuZGVyU2hhZGVyLmF0dHJpYnV0ZXNbXCJhX3Bvc2l0aW9uXCJdLCBNZXNoLmdldEJ1ZmZlclNwZWNpZmljYXRpb24oKSk7XHJcblxyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmJpbmRCdWZmZXIoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgX3JlbmRlckJ1ZmZlcnMuaW5kaWNlcyk7XHJcblxyXG4gICAgICAgICAgICAvLyBTdXBwbHkgbWF0cml4ZGF0YSB0byBzaGFkZXIuIFxyXG4gICAgICAgICAgICBsZXQgdVByb2plY3Rpb246IFdlYkdMVW5pZm9ybUxvY2F0aW9uID0gcmVuZGVyU2hhZGVyLnVuaWZvcm1zW1widV9wcm9qZWN0aW9uXCJdO1xyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLnVuaWZvcm1NYXRyaXg0ZnYodVByb2plY3Rpb24sIGZhbHNlLCBfcHJvamVjdGlvbi5nZXQoKSk7XHJcblxyXG4gICAgICAgICAgICBpZiAocmVuZGVyU2hhZGVyLnVuaWZvcm1zW1widV93b3JsZFwiXSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHVXb3JsZDogV2ViR0xVbmlmb3JtTG9jYXRpb24gPSByZW5kZXJTaGFkZXIudW5pZm9ybXNbXCJ1X3dvcmxkXCJdO1xyXG4gICAgICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy51bmlmb3JtTWF0cml4NGZ2KHVXb3JsZCwgZmFsc2UsIF93b3JsZC5nZXQoKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBpZFVuaWZvcm1Mb2NhdGlvbjogV2ViR0xVbmlmb3JtTG9jYXRpb24gPSByZW5kZXJTaGFkZXIudW5pZm9ybXNbXCJ1X2lkXCJdO1xyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5nZXRSZW5kZXJpbmdDb250ZXh0KCkudW5pZm9ybTFpKGlkVW5pZm9ybUxvY2F0aW9uLCBfaWQpO1xyXG5cclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy5kcmF3RWxlbWVudHMoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5UUklBTkdMRVMsIF9yZW5kZXJCdWZmZXJzLm5JbmRpY2VzLCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlVOU0lHTkVEX1NIT1JULCAwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vICNyZWdpb24gU2hhZGVycHJvZ3JhbSBcclxuICAgICAgICBwcm90ZWN0ZWQgc3RhdGljIGNyZWF0ZVByb2dyYW0oX3NoYWRlckNsYXNzOiB0eXBlb2YgU2hhZGVyKTogUmVuZGVyU2hhZGVyIHtcclxuICAgICAgICAgICAgbGV0IGNyYzM6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQgPSBSZW5kZXJPcGVyYXRvci5jcmMzO1xyXG4gICAgICAgICAgICBsZXQgcHJvZ3JhbTogV2ViR0xQcm9ncmFtID0gY3JjMy5jcmVhdGVQcm9ncmFtKCk7XHJcbiAgICAgICAgICAgIGxldCByZW5kZXJTaGFkZXI6IFJlbmRlclNoYWRlcjtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGNyYzMuYXR0YWNoU2hhZGVyKHByb2dyYW0sIFJlbmRlck9wZXJhdG9yLmFzc2VydDxXZWJHTFNoYWRlcj4oY29tcGlsZVNoYWRlcihfc2hhZGVyQ2xhc3MuZ2V0VmVydGV4U2hhZGVyU291cmNlKCksIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVkVSVEVYX1NIQURFUikpKTtcclxuICAgICAgICAgICAgICAgIGNyYzMuYXR0YWNoU2hhZGVyKHByb2dyYW0sIFJlbmRlck9wZXJhdG9yLmFzc2VydDxXZWJHTFNoYWRlcj4oY29tcGlsZVNoYWRlcihfc2hhZGVyQ2xhc3MuZ2V0RnJhZ21lbnRTaGFkZXJTb3VyY2UoKSwgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5GUkFHTUVOVF9TSEFERVIpKSk7XHJcbiAgICAgICAgICAgICAgICBjcmMzLmxpbmtQcm9ncmFtKHByb2dyYW0pO1xyXG4gICAgICAgICAgICAgICAgbGV0IGVycm9yOiBzdHJpbmcgPSBSZW5kZXJPcGVyYXRvci5hc3NlcnQ8c3RyaW5nPihjcmMzLmdldFByb2dyYW1JbmZvTG9nKHByb2dyYW0pKTtcclxuICAgICAgICAgICAgICAgIGlmIChlcnJvciAhPT0gXCJcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVycm9yIGxpbmtpbmcgU2hhZGVyOiBcIiArIGVycm9yKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJlbmRlclNoYWRlciA9IHtcclxuICAgICAgICAgICAgICAgICAgICBwcm9ncmFtOiBwcm9ncmFtLFxyXG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IGRldGVjdEF0dHJpYnV0ZXMoKSxcclxuICAgICAgICAgICAgICAgICAgICB1bmlmb3JtczogZGV0ZWN0VW5pZm9ybXMoKVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoX2Vycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBEZWJ1Zy5lcnJvcihfZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgZGVidWdnZXI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlbmRlclNoYWRlcjtcclxuXHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBjb21waWxlU2hhZGVyKF9zaGFkZXJDb2RlOiBzdHJpbmcsIF9zaGFkZXJUeXBlOiBHTGVudW0pOiBXZWJHTFNoYWRlciB8IG51bGwge1xyXG4gICAgICAgICAgICAgICAgbGV0IHdlYkdMU2hhZGVyOiBXZWJHTFNoYWRlciA9IGNyYzMuY3JlYXRlU2hhZGVyKF9zaGFkZXJUeXBlKTtcclxuICAgICAgICAgICAgICAgIGNyYzMuc2hhZGVyU291cmNlKHdlYkdMU2hhZGVyLCBfc2hhZGVyQ29kZSk7XHJcbiAgICAgICAgICAgICAgICBjcmMzLmNvbXBpbGVTaGFkZXIod2ViR0xTaGFkZXIpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGVycm9yOiBzdHJpbmcgPSBSZW5kZXJPcGVyYXRvci5hc3NlcnQ8c3RyaW5nPihjcmMzLmdldFNoYWRlckluZm9Mb2cod2ViR0xTaGFkZXIpKTtcclxuICAgICAgICAgICAgICAgIGlmIChlcnJvciAhPT0gXCJcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVycm9yIGNvbXBpbGluZyBzaGFkZXI6IFwiICsgZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIGFueSBjb21waWxhdGlvbiBlcnJvcnMuXHJcbiAgICAgICAgICAgICAgICBpZiAoIWNyYzMuZ2V0U2hhZGVyUGFyYW1ldGVyKHdlYkdMU2hhZGVyLCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkNPTVBJTEVfU1RBVFVTKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFsZXJ0KGNyYzMuZ2V0U2hhZGVySW5mb0xvZyh3ZWJHTFNoYWRlcikpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHdlYkdMU2hhZGVyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGRldGVjdEF0dHJpYnV0ZXMoKTogeyBbbmFtZTogc3RyaW5nXTogbnVtYmVyIH0ge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRldGVjdGVkQXR0cmlidXRlczogeyBbbmFtZTogc3RyaW5nXTogbnVtYmVyIH0gPSB7fTtcclxuICAgICAgICAgICAgICAgIGxldCBhdHRyaWJ1dGVDb3VudDogbnVtYmVyID0gY3JjMy5nZXRQcm9ncmFtUGFyYW1ldGVyKHByb2dyYW0sIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuQUNUSVZFX0FUVFJJQlVURVMpO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IGF0dHJpYnV0ZUNvdW50OyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgYXR0cmlidXRlSW5mbzogV2ViR0xBY3RpdmVJbmZvID0gUmVuZGVyT3BlcmF0b3IuYXNzZXJ0PFdlYkdMQWN0aXZlSW5mbz4oY3JjMy5nZXRBY3RpdmVBdHRyaWIocHJvZ3JhbSwgaSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghYXR0cmlidXRlSW5mbykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZGV0ZWN0ZWRBdHRyaWJ1dGVzW2F0dHJpYnV0ZUluZm8ubmFtZV0gPSBjcmMzLmdldEF0dHJpYkxvY2F0aW9uKHByb2dyYW0sIGF0dHJpYnV0ZUluZm8ubmFtZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGV0ZWN0ZWRBdHRyaWJ1dGVzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGRldGVjdFVuaWZvcm1zKCk6IHsgW25hbWU6IHN0cmluZ106IFdlYkdMVW5pZm9ybUxvY2F0aW9uIH0ge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRldGVjdGVkVW5pZm9ybXM6IHsgW25hbWU6IHN0cmluZ106IFdlYkdMVW5pZm9ybUxvY2F0aW9uIH0gPSB7fTtcclxuICAgICAgICAgICAgICAgIGxldCB1bmlmb3JtQ291bnQ6IG51bWJlciA9IGNyYzMuZ2V0UHJvZ3JhbVBhcmFtZXRlcihwcm9ncmFtLCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkFDVElWRV9VTklGT1JNUyk7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgdW5pZm9ybUNvdW50OyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgaW5mbzogV2ViR0xBY3RpdmVJbmZvID0gUmVuZGVyT3BlcmF0b3IuYXNzZXJ0PFdlYkdMQWN0aXZlSW5mbz4oY3JjMy5nZXRBY3RpdmVVbmlmb3JtKHByb2dyYW0sIGkpKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWluZm8pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGRldGVjdGVkVW5pZm9ybXNbaW5mby5uYW1lXSA9IFJlbmRlck9wZXJhdG9yLmFzc2VydDxXZWJHTFVuaWZvcm1Mb2NhdGlvbj4oY3JjMy5nZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbSwgaW5mby5uYW1lKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGV0ZWN0ZWRVbmlmb3JtcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBwcm90ZWN0ZWQgc3RhdGljIHVzZVByb2dyYW0oX3NoYWRlckluZm86IFJlbmRlclNoYWRlcik6IHZvaWQge1xyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLnVzZVByb2dyYW0oX3NoYWRlckluZm8ucHJvZ3JhbSk7XHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoX3NoYWRlckluZm8uYXR0cmlidXRlc1tcImFfcG9zaXRpb25cIl0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwcm90ZWN0ZWQgc3RhdGljIGRlbGV0ZVByb2dyYW0oX3Byb2dyYW06IFJlbmRlclNoYWRlcik6IHZvaWQge1xyXG4gICAgICAgICAgICBpZiAoX3Byb2dyYW0pIHtcclxuICAgICAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMuZGVsZXRlUHJvZ3JhbShfcHJvZ3JhbS5wcm9ncmFtKTtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBfcHJvZ3JhbS5hdHRyaWJ1dGVzO1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIF9wcm9ncmFtLnVuaWZvcm1zO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vICNlbmRyZWdpb25cclxuXHJcbiAgICAgICAgLy8gI3JlZ2lvbiBNZXNoYnVmZmVyXHJcbiAgICAgICAgcHJvdGVjdGVkIHN0YXRpYyBjcmVhdGVCdWZmZXJzKF9tZXNoOiBNZXNoKTogUmVuZGVyQnVmZmVycyB7XHJcbiAgICAgICAgICAgIGxldCB2ZXJ0aWNlczogV2ViR0xCdWZmZXIgPSBSZW5kZXJPcGVyYXRvci5hc3NlcnQ8V2ViR0xCdWZmZXI+KFJlbmRlck9wZXJhdG9yLmNyYzMuY3JlYXRlQnVmZmVyKCkpO1xyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmJpbmRCdWZmZXIoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5BUlJBWV9CVUZGRVIsIHZlcnRpY2VzKTtcclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy5idWZmZXJEYXRhKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuQVJSQVlfQlVGRkVSLCBfbWVzaC52ZXJ0aWNlcywgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5TVEFUSUNfRFJBVyk7XHJcblxyXG4gICAgICAgICAgICBsZXQgaW5kaWNlczogV2ViR0xCdWZmZXIgPSBSZW5kZXJPcGVyYXRvci5hc3NlcnQ8V2ViR0xCdWZmZXI+KFJlbmRlck9wZXJhdG9yLmNyYzMuY3JlYXRlQnVmZmVyKCkpO1xyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmJpbmRCdWZmZXIoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgaW5kaWNlcyk7XHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMuYnVmZmVyRGF0YShXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBfbWVzaC5pbmRpY2VzLCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlNUQVRJQ19EUkFXKTtcclxuXHJcbiAgICAgICAgICAgIGxldCB0ZXh0dXJlVVZzOiBXZWJHTEJ1ZmZlciA9IFJlbmRlck9wZXJhdG9yLmNyYzMuY3JlYXRlQnVmZmVyKCk7XHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMuYmluZEJ1ZmZlcihXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkFSUkFZX0JVRkZFUiwgdGV4dHVyZVVWcyk7XHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMuYnVmZmVyRGF0YShXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkFSUkFZX0JVRkZFUiwgX21lc2gudGV4dHVyZVVWcywgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5TVEFUSUNfRFJBVyk7XHJcblxyXG4gICAgICAgICAgICBsZXQgbm9ybWFsc0ZhY2U6IFdlYkdMQnVmZmVyID0gUmVuZGVyT3BlcmF0b3IuYXNzZXJ0PFdlYkdMQnVmZmVyPihSZW5kZXJPcGVyYXRvci5jcmMzLmNyZWF0ZUJ1ZmZlcigpKTtcclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy5iaW5kQnVmZmVyKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuQVJSQVlfQlVGRkVSLCBub3JtYWxzRmFjZSk7XHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMuYnVmZmVyRGF0YShXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkFSUkFZX0JVRkZFUiwgX21lc2gubm9ybWFsc0ZhY2UsIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuU1RBVElDX0RSQVcpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGJ1ZmZlckluZm86IFJlbmRlckJ1ZmZlcnMgPSB7XHJcbiAgICAgICAgICAgICAgICB2ZXJ0aWNlczogdmVydGljZXMsXHJcbiAgICAgICAgICAgICAgICBpbmRpY2VzOiBpbmRpY2VzLFxyXG4gICAgICAgICAgICAgICAgbkluZGljZXM6IF9tZXNoLmdldEluZGV4Q291bnQoKSxcclxuICAgICAgICAgICAgICAgIHRleHR1cmVVVnM6IHRleHR1cmVVVnMsXHJcbiAgICAgICAgICAgICAgICBub3JtYWxzRmFjZTogbm9ybWFsc0ZhY2VcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcmV0dXJuIGJ1ZmZlckluZm87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByb3RlY3RlZCBzdGF0aWMgdXNlQnVmZmVycyhfcmVuZGVyQnVmZmVyczogUmVuZGVyQnVmZmVycyk6IHZvaWQge1xyXG4gICAgICAgICAgICAvLyBUT0RPOiBjdXJyZW50bHkgdW51c2VkLCBkb25lIHNwZWNpZmljYWxseSBpbiBkcmF3LiBDb3VsZCBiZSBzYXZlZCBpbiBWQU8gd2l0aGluIFJlbmRlckJ1ZmZlcnNcclxuICAgICAgICAgICAgLy8gUmVuZGVyT3BlcmF0b3IuY3JjMy5iaW5kQnVmZmVyKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuQVJSQVlfQlVGRkVSLCBfcmVuZGVyQnVmZmVycy52ZXJ0aWNlcyk7XHJcbiAgICAgICAgICAgIC8vIFJlbmRlck9wZXJhdG9yLmNyYzMuYmluZEJ1ZmZlcihXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBfcmVuZGVyQnVmZmVycy5pbmRpY2VzKTtcclxuICAgICAgICAgICAgLy8gUmVuZGVyT3BlcmF0b3IuY3JjMy5iaW5kQnVmZmVyKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuQVJSQVlfQlVGRkVSLCBfcmVuZGVyQnVmZmVycy50ZXh0dXJlVVZzKTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByb3RlY3RlZCBzdGF0aWMgZGVsZXRlQnVmZmVycyhfcmVuZGVyQnVmZmVyczogUmVuZGVyQnVmZmVycyk6IHZvaWQge1xyXG4gICAgICAgICAgICBpZiAoX3JlbmRlckJ1ZmZlcnMpIHtcclxuICAgICAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMuYmluZEJ1ZmZlcihXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkFSUkFZX0JVRkZFUiwgbnVsbCk7XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmRlbGV0ZUJ1ZmZlcihfcmVuZGVyQnVmZmVycy52ZXJ0aWNlcyk7XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmRlbGV0ZUJ1ZmZlcihfcmVuZGVyQnVmZmVycy50ZXh0dXJlVVZzKTtcclxuICAgICAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMuYmluZEJ1ZmZlcihXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBudWxsKTtcclxuICAgICAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMuZGVsZXRlQnVmZmVyKF9yZW5kZXJCdWZmZXJzLmluZGljZXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vICNlbmRyZWdpb25cclxuXHJcbiAgICAgICAgLy8gI3JlZ2lvbiBNYXRlcmlhbFBhcmFtZXRlcnNcclxuICAgICAgICBwcm90ZWN0ZWQgc3RhdGljIGNyZWF0ZVBhcmFtZXRlcihfY29hdDogQ29hdCk6IFJlbmRlckNvYXQge1xyXG4gICAgICAgICAgICAvLyBsZXQgdmFvOiBXZWJHTFZlcnRleEFycmF5T2JqZWN0ID0gUmVuZGVyT3BlcmF0b3IuYXNzZXJ0PFdlYkdMVmVydGV4QXJyYXlPYmplY3Q+KFJlbmRlck9wZXJhdG9yLmNyYzMuY3JlYXRlVmVydGV4QXJyYXkoKSk7XHJcbiAgICAgICAgICAgIGxldCBjb2F0SW5mbzogUmVuZGVyQ29hdCA9IHtcclxuICAgICAgICAgICAgICAgIC8vdmFvOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgY29hdDogX2NvYXRcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcmV0dXJuIGNvYXRJbmZvO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwcm90ZWN0ZWQgc3RhdGljIHVzZVBhcmFtZXRlcihfY29hdEluZm86IFJlbmRlckNvYXQpOiB2b2lkIHtcclxuICAgICAgICAgICAgLy8gUmVuZGVyT3BlcmF0b3IuY3JjMy5iaW5kVmVydGV4QXJyYXkoX2NvYXRJbmZvLnZhbyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByb3RlY3RlZCBzdGF0aWMgZGVsZXRlUGFyYW1ldGVyKF9jb2F0SW5mbzogUmVuZGVyQ29hdCk6IHZvaWQge1xyXG4gICAgICAgICAgICBpZiAoX2NvYXRJbmZvKSB7XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmJpbmRWZXJ0ZXhBcnJheShudWxsKTtcclxuICAgICAgICAgICAgICAgIC8vIFJlbmRlck9wZXJhdG9yLmNyYzMuZGVsZXRlVmVydGV4QXJyYXkoX2NvYXRJbmZvLnZhbyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gI2VuZHJlZ2lvblxyXG5cclxuICAgICAgICAvKiogXHJcbiAgICAgICAgICogV3JhcHBlciBmdW5jdGlvbiB0byB1dGlsaXplIHRoZSBidWZmZXJTcGVjaWZpY2F0aW9uIGludGVyZmFjZSB3aGVuIHBhc3NpbmcgZGF0YSB0byB0aGUgc2hhZGVyIHZpYSBhIGJ1ZmZlci5cclxuICAgICAgICAgKiBAcGFyYW0gX2F0dHJpYnV0ZUxvY2F0aW9uIC8vIFRoZSBsb2NhdGlvbiBvZiB0aGUgYXR0cmlidXRlIG9uIHRoZSBzaGFkZXIsIHRvIHdoaWNoIHRoZXkgZGF0YSB3aWxsIGJlIHBhc3NlZC5cclxuICAgICAgICAgKiBAcGFyYW0gX2J1ZmZlclNwZWNpZmljYXRpb24gLy8gSW50ZXJmYWNlIHBhc3NpbmcgZGF0YXB1bGxzcGVjaWZpY2F0aW9ucyB0byB0aGUgYnVmZmVyLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHNldEF0dHJpYnV0ZVN0cnVjdHVyZShfYXR0cmlidXRlTG9jYXRpb246IG51bWJlciwgX2J1ZmZlclNwZWNpZmljYXRpb246IEJ1ZmZlclNwZWNpZmljYXRpb24pOiB2b2lkIHtcclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy52ZXJ0ZXhBdHRyaWJQb2ludGVyKF9hdHRyaWJ1dGVMb2NhdGlvbiwgX2J1ZmZlclNwZWNpZmljYXRpb24uc2l6ZSwgX2J1ZmZlclNwZWNpZmljYXRpb24uZGF0YVR5cGUsIF9idWZmZXJTcGVjaWZpY2F0aW9uLm5vcm1hbGl6ZSwgX2J1ZmZlclNwZWNpZmljYXRpb24uc3RyaWRlLCBfYnVmZmVyU3BlY2lmaWNhdGlvbi5vZmZzZXQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9UcmFuc2Zlci9NdXRhYmxlLnRzXCIvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vUmVuZGVyL1JlbmRlckluamVjdG9yLnRzXCIvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vUmVuZGVyL1JlbmRlck9wZXJhdG9yLnRzXCIvPlxyXG5uYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogSG9sZHMgZGF0YSB0byBmZWVkIGludG8gYSBbW1NoYWRlcl1dIHRvIGRlc2NyaWJlIHRoZSBzdXJmYWNlIG9mIFtbTWVzaF1dLiAgXHJcbiAgICAgKiBbW01hdGVyaWFsXV1zIHJlZmVyZW5jZSBbW0NvYXRdXSBhbmQgW1tTaGFkZXJdXS4gICBcclxuICAgICAqIFRoZSBtZXRob2QgdXNlUmVuZGVyRGF0YSB3aWxsIGJlIGluamVjdGVkIGJ5IFtbUmVuZGVySW5qZWN0b3JdXSBhdCBydW50aW1lLCBleHRlbmRpbmcgdGhlIGZ1bmN0aW9uYWxpdHkgb2YgdGhpcyBjbGFzcyB0byBkZWFsIHdpdGggdGhlIHJlbmRlcmVyLlxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgQ29hdCBleHRlbmRzIE11dGFibGUgaW1wbGVtZW50cyBTZXJpYWxpemFibGUge1xyXG4gICAgICAgIHB1YmxpYyBuYW1lOiBzdHJpbmcgPSBcIkNvYXRcIjtcclxuICAgICAgICBwcm90ZWN0ZWQgcmVuZGVyRGF0YToge1trZXk6IHN0cmluZ106IHVua25vd259O1xyXG5cclxuICAgICAgICBwdWJsaWMgbXV0YXRlKF9tdXRhdG9yOiBNdXRhdG9yKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHN1cGVyLm11dGF0ZShfbXV0YXRvcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdXNlUmVuZGVyRGF0YShfcmVuZGVyU2hhZGVyOiBSZW5kZXJTaGFkZXIpOiB2b2lkIHsvKiBpbmplY3RlZCBieSBSZW5kZXJJbmplY3RvciovIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyNyZWdpb24gVHJhbnNmZXJcclxuICAgICAgICBwdWJsaWMgc2VyaWFsaXplKCk6IFNlcmlhbGl6YXRpb24ge1xyXG4gICAgICAgICAgICBsZXQgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IHRoaXMuZ2V0TXV0YXRvcigpOyBcclxuICAgICAgICAgICAgcmV0dXJuIHNlcmlhbGl6YXRpb247XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHB1YmxpYyBkZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbik6IFNlcmlhbGl6YWJsZSB7XHJcbiAgICAgICAgICAgIHRoaXMubXV0YXRlKF9zZXJpYWxpemF0aW9uKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcm90ZWN0ZWQgcmVkdWNlTXV0YXRvcigpOiB2b2lkIHsgLyoqLyB9XHJcbiAgICAgICAgLy8jZW5kcmVnaW9uXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgc2ltcGxlc3QgW1tDb2F0XV0gcHJvdmlkaW5nIGp1c3QgYSBjb2xvclxyXG4gICAgICovXHJcbiAgICBAUmVuZGVySW5qZWN0b3IuZGVjb3JhdGVDb2F0XHJcbiAgICBleHBvcnQgY2xhc3MgQ29hdENvbG9yZWQgZXh0ZW5kcyBDb2F0IHtcclxuICAgICAgICBwdWJsaWMgY29sb3I6IENvbG9yO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcihfY29sb3I/OiBDb2xvcikge1xyXG4gICAgICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgICAgICB0aGlzLmNvbG9yID0gX2NvbG9yIHx8IG5ldyBDb2xvcigwLjUsIDAuNSwgMC41LCAxKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBIFtbQ29hdF1dIHByb3ZpZGluZyBhIHRleHR1cmUgYW5kIGFkZGl0aW9uYWwgZGF0YSBmb3IgdGV4dHVyaW5nXHJcbiAgICAgKi9cclxuICAgIEBSZW5kZXJJbmplY3Rvci5kZWNvcmF0ZUNvYXRcclxuICAgIGV4cG9ydCBjbGFzcyBDb2F0VGV4dHVyZWQgZXh0ZW5kcyBDb2F0IHtcclxuICAgICAgICBwdWJsaWMgdGV4dHVyZTogVGV4dHVyZUltYWdlID0gbnVsbDtcclxuICAgICAgICAvLyBqdXN0IGlkZWFzIHNvIGZhclxyXG4gICAgICAgIHB1YmxpYyB0aWxpbmdYOiBudW1iZXI7XHJcbiAgICAgICAgcHVibGljIHRpbGluZ1k6IG51bWJlcjtcclxuICAgICAgICBwdWJsaWMgcmVwZXRpdGlvbjogYm9vbGVhbjtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQSBbW0NvYXRdXSB0byBiZSB1c2VkIGJ5IHRoZSBNYXRDYXAgU2hhZGVyIHByb3ZpZGluZyBhIHRleHR1cmUsIGEgdGludCBjb2xvciAoMC41IGdyZXkgaXMgbmV1dHJhbClcclxuICAgICAqIGFuZCBhIGZsYXRNaXggbnVtYmVyIGZvciBtaXhpbmcgYmV0d2VlbiBzbW9vdGggYW5kIGZsYXQgc2hhZGluZy5cclxuICAgICAqL1xyXG4gICAgQFJlbmRlckluamVjdG9yLmRlY29yYXRlQ29hdFxyXG4gICAgZXhwb3J0IGNsYXNzIENvYXRNYXRDYXAgZXh0ZW5kcyBDb2F0IHtcclxuICAgICAgICBwdWJsaWMgdGV4dHVyZTogVGV4dHVyZUltYWdlID0gbnVsbDtcclxuICAgICAgICBwdWJsaWMgdGludENvbG9yOiBDb2xvciA9IG5ldyBDb2xvcigwLjUsIDAuNSwgMC41LCAxKTtcclxuICAgICAgICBwdWJsaWMgZmxhdE1peDogbnVtYmVyID0gMC41O1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcihfdGV4dHVyZT86IFRleHR1cmVJbWFnZSwgX3RpbnRjb2xvcj86IENvbG9yLCBfZmxhdG1peD86IG51bWJlcikge1xyXG4gICAgICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgICAgICB0aGlzLnRleHR1cmUgPSBfdGV4dHVyZSB8fCBuZXcgVGV4dHVyZUltYWdlKCk7XHJcbiAgICAgICAgICAgIHRoaXMudGludENvbG9yID0gX3RpbnRjb2xvciB8fCBuZXcgQ29sb3IoMC41LCAwLjUsIDAuNSwgMSk7XHJcbiAgICAgICAgICAgIHRoaXMuZmxhdE1peCA9IF9mbGF0bWl4ID4gMS4wID8gdGhpcy5mbGF0TWl4ID0gMS4wIDogdGhpcy5mbGF0TWl4ID0gX2ZsYXRtaXggfHwgMC41O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9UcmFuc2Zlci9TZXJpYWxpemVyLnRzXCIvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vVHJhbnNmZXIvTXV0YWJsZS50c1wiLz5cclxubmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKiogXHJcbiAgICAgKiBTdXBlcmNsYXNzIGZvciBhbGwgW1tDb21wb25lbnRdXXMgdGhhdCBjYW4gYmUgYXR0YWNoZWQgdG8gW1tOb2RlXV1zLlxyXG4gICAgICogQGF1dGhvcnMgSmFzY2hhIEthcmFnw7ZsLCBIRlUsIDIwMTkgfCBKaXJrYSBEZWxsJ09yby1GcmllZGwsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgYWJzdHJhY3QgY2xhc3MgQ29tcG9uZW50IGV4dGVuZHMgTXV0YWJsZSBpbXBsZW1lbnRzIFNlcmlhbGl6YWJsZSB7XHJcbiAgICAgICAgcHJvdGVjdGVkIHNpbmdsZXRvbjogYm9vbGVhbiA9IHRydWU7XHJcbiAgICAgICAgcHJpdmF0ZSBjb250YWluZXI6IE5vZGUgfCBudWxsID0gbnVsbDtcclxuICAgICAgICBwcml2YXRlIGFjdGl2ZTogYm9vbGVhbiA9IHRydWU7XHJcblxyXG4gICAgICAgIHB1YmxpYyBhY3RpdmF0ZShfb246IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5hY3RpdmUgPSBfb247XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoX29uID8gRVZFTlQuQ09NUE9ORU5UX0FDVElWQVRFIDogRVZFTlQuQ09NUE9ORU5UX0RFQUNUSVZBVEUpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHVibGljIGdldCBpc0FjdGl2ZSgpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWN0aXZlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogSXMgdHJ1ZSwgd2hlbiBvbmx5IG9uZSBpbnN0YW5jZSBvZiB0aGUgY29tcG9uZW50IGNsYXNzIGNhbiBiZSBhdHRhY2hlZCB0byBhIG5vZGVcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0IGlzU2luZ2xldG9uKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zaW5nbGV0b247XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHJpZXZlcyB0aGUgbm9kZSwgdGhpcyBjb21wb25lbnQgaXMgY3VycmVudGx5IGF0dGFjaGVkIHRvXHJcbiAgICAgICAgICogQHJldHVybnMgVGhlIGNvbnRhaW5lciBub2RlIG9yIG51bGwsIGlmIHRoZSBjb21wb25lbnQgaXMgbm90IGF0dGFjaGVkIHRvXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGdldENvbnRhaW5lcigpOiBOb2RlIHwgbnVsbCB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbnRhaW5lcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVHJpZXMgdG8gYWRkIHRoZSBjb21wb25lbnQgdG8gdGhlIGdpdmVuIG5vZGUsIHJlbW92aW5nIGl0IGZyb20gdGhlIHByZXZpb3VzIGNvbnRhaW5lciBpZiBhcHBsaWNhYmxlXHJcbiAgICAgICAgICogQHBhcmFtIF9jb250YWluZXIgVGhlIG5vZGUgdG8gYXR0YWNoIHRoaXMgY29tcG9uZW50IHRvXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHNldENvbnRhaW5lcihfY29udGFpbmVyOiBOb2RlIHwgbnVsbCk6IHZvaWQge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jb250YWluZXIgPT0gX2NvbnRhaW5lcilcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgbGV0IHByZXZpb3VzQ29udGFpbmVyOiBOb2RlID0gdGhpcy5jb250YWluZXI7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocHJldmlvdXNDb250YWluZXIpXHJcbiAgICAgICAgICAgICAgICAgICAgcHJldmlvdXNDb250YWluZXIucmVtb3ZlQ29tcG9uZW50KHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb250YWluZXIgPSBfY29udGFpbmVyO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29udGFpbmVyKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29udGFpbmVyLmFkZENvbXBvbmVudCh0aGlzKTtcclxuICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRhaW5lciA9IHByZXZpb3VzQ29udGFpbmVyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vI3JlZ2lvbiBUcmFuc2ZlclxyXG4gICAgICAgIHB1YmxpYyBzZXJpYWxpemUoKTogU2VyaWFsaXphdGlvbiB7XHJcbiAgICAgICAgICAgIGxldCBzZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uID0ge1xyXG4gICAgICAgICAgICAgICAgYWN0aXZlOiB0aGlzLmFjdGl2ZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsaXphdGlvbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHVibGljIGRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uKTogU2VyaWFsaXphYmxlIHtcclxuICAgICAgICAgICAgdGhpcy5hY3RpdmUgPSBfc2VyaWFsaXphdGlvbi5hY3RpdmU7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJvdGVjdGVkIHJlZHVjZU11dGF0b3IoX211dGF0b3I6IE11dGF0b3IpOiB2b2lkIHtcclxuICAgICAgICAgICAgZGVsZXRlIF9tdXRhdG9yLnNpbmdsZXRvbjtcclxuICAgICAgICAgICAgZGVsZXRlIF9tdXRhdG9yLmNvbnRhaW5lcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8jZW5kcmVnaW9uXHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiQ29tcG9uZW50LnRzXCIvPlxyXG5uYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAvKipcclxuICAgKiBIb2xkcyBkaWZmZXJlbnQgcGxheW1vZGVzIHRoZSBhbmltYXRpb24gdXNlcyB0byBwbGF5IGJhY2sgaXRzIGFuaW1hdGlvbi5cclxuICAgKiBAYXV0aG9yIEx1a2FzIFNjaGV1ZXJsZSwgSEZVLCAyMDE5XHJcbiAgICovXHJcbiAgZXhwb3J0IGVudW0gQU5JTUFUSU9OX1BMQVlNT0RFIHtcclxuICAgIC8qKlBsYXlzIGFuaW1hdGlvbiBpbiBhIGxvb3A6IGl0IHJlc3RhcnRzIG9uY2UgaXQgaGl0IHRoZSBlbmQuKi9cclxuICAgIExPT1AsXHJcbiAgICAvKipQbGF5cyBhbmltYXRpb24gb25jZSBhbmQgc3RvcHMgYXQgdGhlIGxhc3Qga2V5L2ZyYW1lKi9cclxuICAgIFBMQVlPTkNFLFxyXG4gICAgLyoqUGxheXMgYW5pbWF0aW9uIG9uY2UgYW5kIHN0b3BzIG9uIHRoZSBmaXJzdCBrZXkvZnJhbWUgKi9cclxuICAgIFBMQVlPTkNFU1RPUEFGVEVSLFxyXG4gICAgLyoqUGxheXMgYW5pbWF0aW9uIGxpa2UgTE9PUCwgYnV0IGJhY2t3YXJkcy4qL1xyXG4gICAgUkVWRVJTRUxPT1AsXHJcbiAgICAvKipDYXVzZXMgdGhlIGFuaW1hdGlvbiBub3QgdG8gcGxheSBhdCBhbGwuIFVzZWZ1bCBmb3IganVtcGluZyB0byB2YXJpb3VzIHBvc2l0aW9ucyBpbiB0aGUgYW5pbWF0aW9uIHdpdGhvdXQgcHJvY2VlZGluZyBpbiB0aGUgYW5pbWF0aW9uLiovXHJcbiAgICBTVE9QXHJcbiAgICAvL1RPRE86IGFkZCBhbiBJTkhFUklUIGFuZCBhIFBJTkdQT05HIG1vZGVcclxuICB9XHJcblxyXG4gIGV4cG9ydCBlbnVtIEFOSU1BVElPTl9QTEFZQkFDSyB7XHJcbiAgICAvL1RPRE86IGFkZCBhbiBpbi1kZXB0aCBkZXNjcmlwdGlvbiBvZiB3aGF0IGhhcHBlbnMgdG8gdGhlIGFuaW1hdGlvbiAoYW5kIGV2ZW50cykgZGVwZW5kaW5nIG9uIHRoZSBQbGF5YmFjay4gVXNlIEdyYXBocyB0byBleHBsYWluLlxyXG4gICAgLyoqQ2FsY3VsYXRlcyB0aGUgc3RhdGUgb2YgdGhlIGFuaW1hdGlvbiBhdCB0aGUgZXhhY3QgcG9zaXRpb24gb2YgdGltZS4gSWdub3JlcyBGUFMgdmFsdWUgb2YgYW5pbWF0aW9uLiovXHJcbiAgICBUSU1FQkFTRURfQ09OVElOT1VTLFxyXG4gICAgLyoqTGltaXRzIHRoZSBjYWxjdWxhdGlvbiBvZiB0aGUgc3RhdGUgb2YgdGhlIGFuaW1hdGlvbiB0byB0aGUgRlBTIHZhbHVlIG9mIHRoZSBhbmltYXRpb24uIFNraXBzIGZyYW1lcyBpZiBuZWVkZWQuKi9cclxuICAgIFRJTUVCQVNFRF9SQVNURVJFRF9UT19GUFMsXHJcbiAgICAvKipVc2VzIHRoZSBGUFMgdmFsdWUgb2YgdGhlIGFuaW1hdGlvbiB0byBhZHZhbmNlIG9uY2UgcGVyIGZyYW1lLCBubyBtYXR0ZXIgdGhlIHNwZWVkIG9mIHRoZSBmcmFtZXMuIERvZXNuJ3Qgc2tpcCBhbnkgZnJhbWVzLiovXHJcbiAgICBGUkFNRUJBU0VEXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBIb2xkcyBhIHJlZmVyZW5jZSB0byBhbiBbW0FuaW1hdGlvbl1dIGFuZCBjb250cm9scyBpdC4gQ29udHJvbHMgcGxheWJhY2sgYW5kIHBsYXltb2RlIGFzIHdlbGwgYXMgc3BlZWQuXHJcbiAgICogQGF1dGhvcnMgTHVrYXMgU2NoZXVlcmxlLCBIRlUsIDIwMTlcclxuICAgKi9cclxuICBleHBvcnQgY2xhc3MgQ29tcG9uZW50QW5pbWF0b3IgZXh0ZW5kcyBDb21wb25lbnQge1xyXG4gICAgLy9UT0RPOiBhZGQgZnVuY3Rpb25hbGl0eSB0byBibGVuZCBmcm9tIG9uZSBhbmltYXRpb24gdG8gYW5vdGhlci5cclxuICAgIGFuaW1hdGlvbjogQW5pbWF0aW9uO1xyXG4gICAgcGxheW1vZGU6IEFOSU1BVElPTl9QTEFZTU9ERTtcclxuICAgIHBsYXliYWNrOiBBTklNQVRJT05fUExBWUJBQ0s7XHJcbiAgICBzcGVlZFNjYWxlc1dpdGhHbG9iYWxTcGVlZDogYm9vbGVhbiA9IHRydWU7XHJcblxyXG4gICAgcHJpdmF0ZSBsb2NhbFRpbWU6IFRpbWU7XHJcbiAgICBwcml2YXRlIHNwZWVkU2NhbGU6IG51bWJlciA9IDE7XHJcbiAgICBwcml2YXRlIGxhc3RUaW1lOiBudW1iZXIgPSAwO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKF9hbmltYXRpb246IEFuaW1hdGlvbiA9IG5ldyBBbmltYXRpb24oXCJcIiksIF9wbGF5bW9kZTogQU5JTUFUSU9OX1BMQVlNT0RFID0gQU5JTUFUSU9OX1BMQVlNT0RFLkxPT1AsIF9wbGF5YmFjazogQU5JTUFUSU9OX1BMQVlCQUNLID0gQU5JTUFUSU9OX1BMQVlCQUNLLlRJTUVCQVNFRF9DT05USU5PVVMpIHtcclxuICAgICAgc3VwZXIoKTtcclxuICAgICAgdGhpcy5hbmltYXRpb24gPSBfYW5pbWF0aW9uO1xyXG4gICAgICB0aGlzLnBsYXltb2RlID0gX3BsYXltb2RlO1xyXG4gICAgICB0aGlzLnBsYXliYWNrID0gX3BsYXliYWNrO1xyXG5cclxuICAgICAgdGhpcy5sb2NhbFRpbWUgPSBuZXcgVGltZSgpO1xyXG5cclxuICAgICAgLy9UT0RPOiB1cGRhdGUgYW5pbWF0aW9uIHRvdGFsIHRpbWUgd2hlbiBsb2FkaW5nIGEgZGlmZmVyZW50IGFuaW1hdGlvbj9cclxuICAgICAgdGhpcy5hbmltYXRpb24uY2FsY3VsYXRlVG90YWxUaW1lKCk7XHJcblxyXG4gICAgICBMb29wLmFkZEV2ZW50TGlzdGVuZXIoRVZFTlQuTE9PUF9GUkFNRSwgdGhpcy51cGRhdGVBbmltYXRpb25Mb29wLmJpbmQodGhpcykpO1xyXG4gICAgICBUaW1lLmdhbWUuYWRkRXZlbnRMaXN0ZW5lcihFVkVOVC5USU1FX1NDQUxFRCwgdGhpcy51cGRhdGVTY2FsZS5iaW5kKHRoaXMpKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgc3BlZWQoX3M6IG51bWJlcikge1xyXG4gICAgICB0aGlzLnNwZWVkU2NhbGUgPSBfcztcclxuICAgICAgdGhpcy51cGRhdGVTY2FsZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSnVtcHMgdG8gYSBjZXJ0YWluIHRpbWUgaW4gdGhlIGFuaW1hdGlvbiB0byBwbGF5IGZyb20gdGhlcmUuXHJcbiAgICAgKiBAcGFyYW0gX3RpbWUgVGhlIHRpbWUgdG8ganVtcCB0b1xyXG4gICAgICovXHJcbiAgICBqdW1wVG8oX3RpbWU6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICB0aGlzLmxvY2FsVGltZS5zZXQoX3RpbWUpO1xyXG4gICAgICB0aGlzLmxhc3RUaW1lID0gX3RpbWU7XHJcbiAgICAgIF90aW1lID0gX3RpbWUgJSB0aGlzLmFuaW1hdGlvbi50b3RhbFRpbWU7XHJcbiAgICAgIGxldCBtdXRhdG9yOiBNdXRhdG9yID0gdGhpcy5hbmltYXRpb24uZ2V0TXV0YXRlZChfdGltZSwgdGhpcy5jYWxjdWxhdGVEaXJlY3Rpb24oX3RpbWUpLCB0aGlzLnBsYXliYWNrKTtcclxuICAgICAgdGhpcy5nZXRDb250YWluZXIoKS5hcHBseUFuaW1hdGlvbihtdXRhdG9yKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGN1cnJlbnQgdGltZSBvZiB0aGUgYW5pbWF0aW9uLCBtb2R1bGF0ZWQgZm9yIGFuaW1hdGlvbiBsZW5ndGguXHJcbiAgICAgKi9cclxuICAgIGdldEN1cnJlbnRUaW1lKCk6IG51bWJlciB7XHJcbiAgICAgIHJldHVybiB0aGlzLmxvY2FsVGltZS5nZXQoKSAlIHRoaXMuYW5pbWF0aW9uLnRvdGFsVGltZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZvcmNlcyBhbiB1cGRhdGUgb2YgdGhlIGFuaW1hdGlvbiBmcm9tIG91dHNpZGUuIFVzZWQgaW4gdGhlIFZpZXdBbmltYXRpb24uIFNob3VsZG4ndCBiZSB1c2VkIGR1cmluZyB0aGUgZ2FtZS5cclxuICAgICAqIEBwYXJhbSBfdGltZSB0aGUgKHVuc2NhbGVkKSB0aW1lIHRvIHVwZGF0ZSB0aGUgYW5pbWF0aW9uIHdpdGguXHJcbiAgICAgKiBAcmV0dXJucyBhIFR1cGVsIGNvbnRhaW5pbmcgdGhlIE11dGF0b3IgZm9yIEFuaW1hdGlvbiBhbmQgdGhlIHBsYXltb2RlIGNvcnJlY3RlZCB0aW1lLiBcclxuICAgICAqL1xyXG4gICAgdXBkYXRlQW5pbWF0aW9uKF90aW1lOiBudW1iZXIpOiBbTXV0YXRvciwgbnVtYmVyXSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnVwZGF0ZUFuaW1hdGlvbkxvb3AobnVsbCwgX3RpbWUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vI3JlZ2lvbiB0cmFuc2ZlclxyXG4gICAgc2VyaWFsaXplKCk6IFNlcmlhbGl6YXRpb24ge1xyXG4gICAgICBsZXQgczogU2VyaWFsaXphdGlvbiA9IHN1cGVyLnNlcmlhbGl6ZSgpO1xyXG4gICAgICBzW1wiYW5pbWF0aW9uXCJdID0gdGhpcy5hbmltYXRpb24uc2VyaWFsaXplKCk7XHJcbiAgICAgIHNbXCJwbGF5bW9kZVwiXSA9IHRoaXMucGxheW1vZGU7XHJcbiAgICAgIHNbXCJwbGF5YmFja1wiXSA9IHRoaXMucGxheWJhY2s7XHJcbiAgICAgIHNbXCJzcGVlZFNjYWxlXCJdID0gdGhpcy5zcGVlZFNjYWxlO1xyXG4gICAgICBzW1wic3BlZWRTY2FsZXNXaXRoR2xvYmFsU3BlZWRcIl0gPSB0aGlzLnNwZWVkU2NhbGVzV2l0aEdsb2JhbFNwZWVkO1xyXG5cclxuICAgICAgc1tzdXBlci5jb25zdHJ1Y3Rvci5uYW1lXSA9IHN1cGVyLnNlcmlhbGl6ZSgpO1xyXG5cclxuICAgICAgcmV0dXJuIHM7XHJcbiAgICB9XHJcblxyXG4gICAgZGVzZXJpYWxpemUoX3M6IFNlcmlhbGl6YXRpb24pOiBTZXJpYWxpemFibGUge1xyXG4gICAgICB0aGlzLmFuaW1hdGlvbiA9IG5ldyBBbmltYXRpb24oXCJcIik7XHJcbiAgICAgIHRoaXMuYW5pbWF0aW9uLmRlc2VyaWFsaXplKF9zLmFuaW1hdGlvbik7XHJcbiAgICAgIHRoaXMucGxheWJhY2sgPSBfcy5wbGF5YmFjaztcclxuICAgICAgdGhpcy5wbGF5bW9kZSA9IF9zLnBsYXltb2RlO1xyXG4gICAgICB0aGlzLnNwZWVkU2NhbGUgPSBfcy5zcGVlZFNjYWxlO1xyXG4gICAgICB0aGlzLnNwZWVkU2NhbGVzV2l0aEdsb2JhbFNwZWVkID0gX3Muc3BlZWRTY2FsZXNXaXRoR2xvYmFsU3BlZWQ7XHJcblxyXG4gICAgICBzdXBlci5kZXNlcmlhbGl6ZShfc1tzdXBlci5jb25zdHJ1Y3Rvci5uYW1lXSk7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLy8jZW5kcmVnaW9uXHJcblxyXG4gICAgLy8jcmVnaW9uIHVwZGF0ZUFuaW1hdGlvblxyXG4gICAgLyoqXHJcbiAgICAgKiBVcGRhdGVzIHRoZSBBbmltYXRpb24uXHJcbiAgICAgKiBHZXRzIGNhbGxlZCBldmVyeSB0aW1lIHRoZSBMb29wIGZpcmVzIHRoZSBMT09QX0ZSQU1FIEV2ZW50LlxyXG4gICAgICogVXNlcyB0aGUgYnVpbHQtaW4gdGltZSB1bmxlc3MgYSBkaWZmZXJlbnQgdGltZSBpcyBzcGVjaWZpZWQuXHJcbiAgICAgKiBNYXkgYWxzbyBiZSBjYWxsZWQgZnJvbSB1cGRhdGVBbmltYXRpb24oKS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSB1cGRhdGVBbmltYXRpb25Mb29wKF9lOiBFdmVudCwgX3RpbWU6IG51bWJlcik6IFtNdXRhdG9yLCBudW1iZXJdIHtcclxuICAgICAgaWYgKHRoaXMuYW5pbWF0aW9uLnRvdGFsVGltZSA9PSAwKVxyXG4gICAgICAgIHJldHVybiBbbnVsbCwgMF07XHJcbiAgICAgIGxldCB0aW1lOiBudW1iZXIgPSBfdGltZSB8fCB0aGlzLmxvY2FsVGltZS5nZXQoKTtcclxuICAgICAgaWYgKHRoaXMucGxheWJhY2sgPT0gQU5JTUFUSU9OX1BMQVlCQUNLLkZSQU1FQkFTRUQpIHtcclxuICAgICAgICB0aW1lID0gdGhpcy5sYXN0VGltZSArICgxMDAwIC8gdGhpcy5hbmltYXRpb24uZnBzKTtcclxuICAgICAgfVxyXG4gICAgICBsZXQgZGlyZWN0aW9uOiBudW1iZXIgPSB0aGlzLmNhbGN1bGF0ZURpcmVjdGlvbih0aW1lKTtcclxuICAgICAgdGltZSA9IHRoaXMuYXBwbHlQbGF5bW9kZXModGltZSk7XHJcbiAgICAgIHRoaXMuZXhlY3V0ZUV2ZW50cyh0aGlzLmFuaW1hdGlvbi5nZXRFdmVudHNUb0ZpcmUodGhpcy5sYXN0VGltZSwgdGltZSwgdGhpcy5wbGF5YmFjaywgZGlyZWN0aW9uKSk7XHJcblxyXG4gICAgICBpZiAodGhpcy5sYXN0VGltZSAhPSB0aW1lKSB7XHJcbiAgICAgICAgdGhpcy5sYXN0VGltZSA9IHRpbWU7XHJcbiAgICAgICAgdGltZSA9IHRpbWUgJSB0aGlzLmFuaW1hdGlvbi50b3RhbFRpbWU7XHJcbiAgICAgICAgbGV0IG11dGF0b3I6IE11dGF0b3IgPSB0aGlzLmFuaW1hdGlvbi5nZXRNdXRhdGVkKHRpbWUsIGRpcmVjdGlvbiwgdGhpcy5wbGF5YmFjayk7XHJcbiAgICAgICAgaWYgKHRoaXMuZ2V0Q29udGFpbmVyKCkpIHtcclxuICAgICAgICAgIHRoaXMuZ2V0Q29udGFpbmVyKCkuYXBwbHlBbmltYXRpb24obXV0YXRvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBbbXV0YXRvciwgdGltZV07XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIFtudWxsLCB0aW1lXTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZpcmVzIGFsbCBjdXN0b20gZXZlbnRzIHRoZSBBbmltYXRpb24gc2hvdWxkIGhhdmUgZmlyZWQgYmV0d2VlbiB0aGUgbGFzdCBmcmFtZSBhbmQgdGhlIGN1cnJlbnQgZnJhbWUuXHJcbiAgICAgKiBAcGFyYW0gZXZlbnRzIGEgbGlzdCBvZiBuYW1lcyBvZiBjdXN0b20gZXZlbnRzIHRvIGZpcmVcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBleGVjdXRlRXZlbnRzKGV2ZW50czogc3RyaW5nW10pOiB2b2lkIHtcclxuICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IGV2ZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoZXZlbnRzW2ldKSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGN1bGF0ZXMgdGhlIGFjdHVhbCB0aW1lIHRvIHVzZSwgdXNpbmcgdGhlIGN1cnJlbnQgcGxheW1vZGVzLlxyXG4gICAgICogQHBhcmFtIF90aW1lIHRoZSB0aW1lIHRvIGFwcGx5IHRoZSBwbGF5bW9kZXMgdG9cclxuICAgICAqIEByZXR1cm5zIHRoZSByZWNhbGN1bGF0ZWQgdGltZVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGFwcGx5UGxheW1vZGVzKF90aW1lOiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgICBzd2l0Y2ggKHRoaXMucGxheW1vZGUpIHtcclxuICAgICAgICBjYXNlIEFOSU1BVElPTl9QTEFZTU9ERS5TVE9QOlxyXG4gICAgICAgICAgcmV0dXJuIHRoaXMubG9jYWxUaW1lLmdldE9mZnNldCgpO1xyXG4gICAgICAgIGNhc2UgQU5JTUFUSU9OX1BMQVlNT0RFLlBMQVlPTkNFOlxyXG4gICAgICAgICAgaWYgKF90aW1lID49IHRoaXMuYW5pbWF0aW9uLnRvdGFsVGltZSlcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYW5pbWF0aW9uLnRvdGFsVGltZSAtIDAuMDE7ICAgICAvL1RPRE86IHRoaXMgbWlnaHQgY2F1c2Ugc29tZSBpc3N1ZXNcclxuICAgICAgICAgIGVsc2UgcmV0dXJuIF90aW1lO1xyXG4gICAgICAgIGNhc2UgQU5JTUFUSU9OX1BMQVlNT0RFLlBMQVlPTkNFU1RPUEFGVEVSOlxyXG4gICAgICAgICAgaWYgKF90aW1lID49IHRoaXMuYW5pbWF0aW9uLnRvdGFsVGltZSlcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYW5pbWF0aW9uLnRvdGFsVGltZSArIDAuMDE7ICAgICAvL1RPRE86IHRoaXMgbWlnaHQgY2F1c2Ugc29tZSBpc3N1ZXNcclxuICAgICAgICAgIGVsc2UgcmV0dXJuIF90aW1lO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICByZXR1cm4gX3RpbWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGN1bGF0ZXMgYW5kIHJldHVybnMgdGhlIGRpcmVjdGlvbiB0aGUgYW5pbWF0aW9uIHNob3VsZCBjdXJyZW50bHkgYmUgcGxheWluZyBpbi5cclxuICAgICAqIEBwYXJhbSBfdGltZSB0aGUgdGltZSBhdCB3aGljaCB0byBjYWxjdWxhdGUgdGhlIGRpcmVjdGlvblxyXG4gICAgICogQHJldHVybnMgMSBpZiBmb3J3YXJkLCAwIGlmIHN0b3AsIC0xIGlmIGJhY2t3YXJkc1xyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGNhbGN1bGF0ZURpcmVjdGlvbihfdGltZTogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgICAgc3dpdGNoICh0aGlzLnBsYXltb2RlKSB7XHJcbiAgICAgICAgY2FzZSBBTklNQVRJT05fUExBWU1PREUuU1RPUDpcclxuICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIC8vIGNhc2UgQU5JTUFUSU9OX1BMQVlNT0RFLlBJTkdQT05HOlxyXG4gICAgICAgIC8vICAgaWYgKE1hdGguZmxvb3IoX3RpbWUgLyB0aGlzLmFuaW1hdGlvbi50b3RhbFRpbWUpICUgMiA9PSAwKVxyXG4gICAgICAgIC8vICAgICByZXR1cm4gMTtcclxuICAgICAgICAvLyAgIGVsc2VcclxuICAgICAgICAvLyAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgIGNhc2UgQU5JTUFUSU9OX1BMQVlNT0RFLlJFVkVSU0VMT09QOlxyXG4gICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgIGNhc2UgQU5JTUFUSU9OX1BMQVlNT0RFLlBMQVlPTkNFOlxyXG4gICAgICAgIGNhc2UgQU5JTUFUSU9OX1BMQVlNT0RFLlBMQVlPTkNFU1RPUEFGVEVSOlxyXG4gICAgICAgICAgaWYgKF90aW1lID49IHRoaXMuYW5pbWF0aW9uLnRvdGFsVGltZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgIH1cclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFVwZGF0ZXMgdGhlIHNjYWxlIG9mIHRoZSBhbmltYXRpb24gaWYgdGhlIHVzZXIgY2hhbmdlcyBpdCBvciBpZiB0aGUgZ2xvYmFsIGdhbWUgdGltZXIgY2hhbmdlZCBpdHMgc2NhbGUuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgdXBkYXRlU2NhbGUoKTogdm9pZCB7XHJcbiAgICAgIGxldCBuZXdTY2FsZTogbnVtYmVyID0gdGhpcy5zcGVlZFNjYWxlO1xyXG4gICAgICBpZiAodGhpcy5zcGVlZFNjYWxlc1dpdGhHbG9iYWxTcGVlZClcclxuICAgICAgICBuZXdTY2FsZSAqPSBUaW1lLmdhbWUuZ2V0U2NhbGUoKTtcclxuICAgICAgdGhpcy5sb2NhbFRpbWUuc2V0U2NhbGUobmV3U2NhbGUpO1xyXG4gICAgfVxyXG4gICAgLy8jZW5kcmVnaW9uXHJcbiAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIkNvbXBvbmVudC50c1wiLz5cclxubmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIEF0dGFjaGVzIGEgW1tDb21wb25lbnRBdWRpb11dIHRvIGEgW1tOb2RlXV0uXHJcbiAgICAgKiBPbmx5IGEgc2luZ2xlIFtbQXVkaW9dXSBjYW4gYmUgdXNlZCB3aXRoaW4gYSBzaW5nbGUgW1tDb21wb25lbnRBdWRpb11dXHJcbiAgICAgKiBAYXV0aG9ycyBUaG9tYXMgRG9ybmVyLCBIRlUsIDIwMTlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIENvbXBvbmVudEF1ZGlvIGV4dGVuZHMgQ29tcG9uZW50IHtcclxuXHJcbiAgICAgICAgcHVibGljIGF1ZGlvOiBBdWRpbztcclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgaXNMb2NhbGlzZWQ6IGJvb2xlYW47XHJcbiAgICAgICAgcHVibGljIGxvY2FsaXNhdGlvbjogQXVkaW9Mb2NhbGlzYXRpb24gfCBudWxsO1xyXG5cclxuICAgICAgICBwdWJsaWMgaXNGaWx0ZXJlZDogYm9vbGVhbjtcclxuICAgICAgICBwdWJsaWMgZmlsdGVyOiBBdWRpb0ZpbHRlciB8IG51bGw7XHJcblxyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnN0cnVjdG9yKF9hdWRpbzogQXVkaW8pIHtcclxuICAgICAgICAgICAgc3VwZXIoKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2V0QXVkaW8oX2F1ZGlvKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzZXRMb2NhbGlzYXRpb24oX2xvY2FsaXNhdGlvbjogQXVkaW9Mb2NhbGlzYXRpb24pOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5sb2NhbGlzYXRpb24gPSBfbG9jYWxpc2F0aW9uO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogcGxheUF1ZGlvXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHBsYXlBdWRpbyhfYXVkaW9Db250ZXh0OiBBdWRpb0NvbnRleHQpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5hdWRpby5pbml0QnVmZmVyU291cmNlKF9hdWRpb0NvbnRleHQpO1xyXG4gICAgICAgICAgICB0aGlzLmF1ZGlvLmJ1ZmZlclNvdXJjZS5zdGFydChfYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEFkZHMgYW4gW1tBdWRpb11dIHRvIHRoZSBbW0NvbXBvbmVudEF1ZGlvXV1cclxuICAgICAgICAgKiBAcGFyYW0gX2F1ZGlvIERlY29kZWQgQXVkaW8gRGF0YSBhcyBbW0F1ZGlvXV1cclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIHNldEF1ZGlvKF9hdWRpbzogQXVkaW8pOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5hdWRpbyA9IF9hdWRpbztcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRmluYWwgYXR0YWNobWVudHMgZm9yIHRoZSBBdWRpbyBOb2RlcyBpbiBmb2xsb3dpbmcgb3JkZXJcclxuICAgICAgICAgKiAxLiBMb2NhbGlzYXRpb25cclxuICAgICAgICAgKiAyLiBGaWx0ZXJcclxuICAgICAgICAgKiAzLiBNYXN0ZXIgR2FpblxyXG4gICAgICAgICAqIGNvbm5lY3RBdWRpb05vZGVzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgLy8gcHJpdmF0ZSBjb25uZWN0QXVkaW9Ob2RlcygpOiB2b2lkIHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgLy8gfVxyXG5cclxuXHJcblxyXG5cclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJDb21wb25lbnQudHNcIi8+XHJcbm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBBdHRhY2hlcyBhIFtbQXVkaW9MaXN0ZW5lcl1dIHRvIHRoZSBub2RlXHJcbiAgICAgKiBAYXV0aG9ycyBUaG9tYXMgRG9ybmVyLCBIRlUsIDIwMTlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIENvbXBvbmVudEF1ZGlvTGlzdGVuZXIgZXh0ZW5kcyBDb21wb25lbnQge1xyXG5cclxuICAgICAgICBcclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJDb21wb25lbnQudHNcIi8+XHJcbm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgZXhwb3J0IGVudW0gRklFTERfT0ZfVklFVyB7XHJcbiAgICAgICAgSE9SSVpPTlRBTCwgVkVSVElDQUwsIERJQUdPTkFMXHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIERlZmluZXMgaWRlbnRpZmllcnMgZm9yIHRoZSB2YXJpb3VzIHByb2plY3Rpb25zIGEgY2FtZXJhIGNhbiBwcm92aWRlLiAgXHJcbiAgICAgKiBUT0RPOiBjaGFuZ2UgYmFjayB0byBudW1iZXIgZW51bSBpZiBzdHJpbmdzIG5vdCBuZWVkZWRcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGVudW0gUFJPSkVDVElPTiB7XHJcbiAgICAgICAgQ0VOVFJBTCA9IFwiY2VudHJhbFwiLFxyXG4gICAgICAgIE9SVEhPR1JBUEhJQyA9IFwib3J0aG9ncmFwaGljXCIsXHJcbiAgICAgICAgRElNRVRSSUMgPSBcImRpbWV0cmljXCIsXHJcbiAgICAgICAgU1RFUkVPID0gXCJzdGVyZW9cIlxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgY2FtZXJhIGNvbXBvbmVudCBob2xkcyB0aGUgcHJvamVjdGlvbi1tYXRyaXggYW5kIG90aGVyIGRhdGEgbmVlZGVkIHRvIHJlbmRlciBhIHNjZW5lIGZyb20gdGhlIHBlcnNwZWN0aXZlIG9mIHRoZSBub2RlIGl0IGlzIGF0dGFjaGVkIHRvLlxyXG4gICAgICogQGF1dGhvcnMgSmFzY2hhIEthcmFnw7ZsLCBIRlUsIDIwMTkgfCBKaXJrYSBEZWxsJ09yby1GcmllZGwsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgQ29tcG9uZW50Q2FtZXJhIGV4dGVuZHMgQ29tcG9uZW50IHtcclxuICAgICAgICBwdWJsaWMgcGl2b3Q6IE1hdHJpeDR4NCA9IE1hdHJpeDR4NC5JREVOVElUWTtcclxuICAgICAgICAvL3ByaXZhdGUgb3J0aG9ncmFwaGljOiBib29sZWFuID0gZmFsc2U7IC8vIERldGVybWluZXMgd2hldGhlciB0aGUgaW1hZ2Ugd2lsbCBiZSByZW5kZXJlZCB3aXRoIHBlcnNwZWN0aXZlIG9yIG9ydGhvZ3JhcGhpYyBwcm9qZWN0aW9uLlxyXG4gICAgICAgIHByaXZhdGUgcHJvamVjdGlvbjogUFJPSkVDVElPTiA9IFBST0pFQ1RJT04uQ0VOVFJBTDtcclxuICAgICAgICBwcml2YXRlIHRyYW5zZm9ybTogTWF0cml4NHg0ID0gbmV3IE1hdHJpeDR4NDsgLy8gVGhlIG1hdHJpeCB0byBtdWx0aXBseSBlYWNoIHNjZW5lIG9iamVjdHMgdHJhbnNmb3JtYXRpb24gYnksIHRvIGRldGVybWluZSB3aGVyZSBpdCB3aWxsIGJlIGRyYXduLlxyXG4gICAgICAgIHByaXZhdGUgZmllbGRPZlZpZXc6IG51bWJlciA9IDQ1OyAvLyBUaGUgY2FtZXJhJ3Mgc2Vuc29yYW5nbGUuXHJcbiAgICAgICAgcHJpdmF0ZSBhc3BlY3RSYXRpbzogbnVtYmVyID0gMS4wO1xyXG4gICAgICAgIHByaXZhdGUgZGlyZWN0aW9uOiBGSUVMRF9PRl9WSUVXID0gRklFTERfT0ZfVklFVy5ESUFHT05BTDtcclxuICAgICAgICBwcml2YXRlIGJhY2tncm91bmRDb2xvcjogQ29sb3IgPSBuZXcgQ29sb3IoMCwgMCwgMCwgMSk7IC8vIFRoZSBjb2xvciBvZiB0aGUgYmFja2dyb3VuZCB0aGUgY2FtZXJhIHdpbGwgcmVuZGVyLlxyXG4gICAgICAgIHByaXZhdGUgYmFja2dyb3VuZEVuYWJsZWQ6IGJvb2xlYW4gPSB0cnVlOyAvLyBEZXRlcm1pbmVzIHdoZXRoZXIgb3Igbm90IHRoZSBiYWNrZ3JvdW5kIG9mIHRoaXMgY2FtZXJhIHdpbGwgYmUgcmVuZGVyZWQuXHJcbiAgICAgICAgLy8gVE9ETzogZXhhbWluZSwgaWYgYmFja2dyb3VuZCBzaG91bGQgYmUgYW4gYXR0cmlidXRlIG9mIENhbWVyYSBvciBWaWV3cG9ydFxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0UHJvamVjdGlvbigpOiBQUk9KRUNUSU9OIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvamVjdGlvbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRCYWNrZ291bmRDb2xvcigpOiBDb2xvciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmJhY2tncm91bmRDb2xvcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRCYWNrZ3JvdW5kRW5hYmxlZCgpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYmFja2dyb3VuZEVuYWJsZWQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0QXNwZWN0KCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFzcGVjdFJhdGlvO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldEZpZWxkT2ZWaWV3KCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZpZWxkT2ZWaWV3O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldERpcmVjdGlvbigpOiBGSUVMRF9PRl9WSUVXIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGlyZWN0aW9uO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgbXVsdGlwbGlrYXRpb24gb2YgdGhlIHdvcmxkdHJhbnNmb3JtYXRpb24gb2YgdGhlIGNhbWVyYSBjb250YWluZXIgd2l0aCB0aGUgcHJvamVjdGlvbiBtYXRyaXhcclxuICAgICAgICAgKiBAcmV0dXJucyB0aGUgd29ybGQtcHJvamVjdGlvbi1tYXRyaXhcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0IFZpZXdQcm9qZWN0aW9uTWF0cml4KCk6IE1hdHJpeDR4NCB7XHJcbiAgICAgICAgICAgIGxldCB3b3JsZDogTWF0cml4NHg0ID0gdGhpcy5waXZvdDtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHdvcmxkID0gTWF0cml4NHg0Lk1VTFRJUExJQ0FUSU9OKHRoaXMuZ2V0Q29udGFpbmVyKCkubXR4V29ybGQsIHRoaXMucGl2b3QpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChfZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIC8vIG5vIGNvbnRhaW5lciBub2RlIG9yIG5vIHdvcmxkIHRyYW5zZm9ybWF0aW9uIGZvdW5kIC0+IGNvbnRpbnVlIHdpdGggcGl2b3Qgb25seVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCB2aWV3TWF0cml4OiBNYXRyaXg0eDQgPSBNYXRyaXg0eDQuSU5WRVJTSU9OKHdvcmxkKTsgXHJcbiAgICAgICAgICAgIHJldHVybiBNYXRyaXg0eDQuTVVMVElQTElDQVRJT04odGhpcy50cmFuc2Zvcm0sIHZpZXdNYXRyaXgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2V0IHRoZSBjYW1lcmEgdG8gcGVyc3BlY3RpdmUgcHJvamVjdGlvbi4gVGhlIHdvcmxkIG9yaWdpbiBpcyBpbiB0aGUgY2VudGVyIG9mIHRoZSBjYW52YXNlbGVtZW50LlxyXG4gICAgICAgICAqIEBwYXJhbSBfYXNwZWN0IFRoZSBhc3BlY3QgcmF0aW8gYmV0d2VlbiB3aWR0aCBhbmQgaGVpZ2h0IG9mIHByb2plY3Rpb25zcGFjZS4oRGVmYXVsdCA9IGNhbnZhcy5jbGllbnRXaWR0aCAvIGNhbnZhcy5DbGllbnRIZWlnaHQpXHJcbiAgICAgICAgICogQHBhcmFtIF9maWVsZE9mVmlldyBUaGUgZmllbGQgb2YgdmlldyBpbiBEZWdyZWVzLiAoRGVmYXVsdCA9IDQ1KVxyXG4gICAgICAgICAqIEBwYXJhbSBfZGlyZWN0aW9uIFRoZSBwbGFuZSBvbiB3aGljaCB0aGUgZmllbGRPZlZpZXctQW5nbGUgaXMgZ2l2ZW4gXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHByb2plY3RDZW50cmFsKF9hc3BlY3Q6IG51bWJlciA9IHRoaXMuYXNwZWN0UmF0aW8sIF9maWVsZE9mVmlldzogbnVtYmVyID0gdGhpcy5maWVsZE9mVmlldywgX2RpcmVjdGlvbjogRklFTERfT0ZfVklFVyA9IHRoaXMuZGlyZWN0aW9uKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuYXNwZWN0UmF0aW8gPSBfYXNwZWN0O1xyXG4gICAgICAgICAgICB0aGlzLmZpZWxkT2ZWaWV3ID0gX2ZpZWxkT2ZWaWV3O1xyXG4gICAgICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IF9kaXJlY3Rpb247XHJcbiAgICAgICAgICAgIHRoaXMucHJvamVjdGlvbiA9IFBST0pFQ1RJT04uQ0VOVFJBTDtcclxuICAgICAgICAgICAgdGhpcy50cmFuc2Zvcm0gPSBNYXRyaXg0eDQuUFJPSkVDVElPTl9DRU5UUkFMKF9hc3BlY3QsIHRoaXMuZmllbGRPZlZpZXcsIDEsIDIwMDAsIHRoaXMuZGlyZWN0aW9uKTsgLy8gVE9ETzogcmVtb3ZlIG1hZ2ljIG51bWJlcnNcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2V0IHRoZSBjYW1lcmEgdG8gb3J0aG9ncmFwaGljIHByb2plY3Rpb24uIFRoZSBvcmlnaW4gaXMgaW4gdGhlIHRvcCBsZWZ0IGNvcm5lciBvZiB0aGUgY2FudmFzLlxyXG4gICAgICAgICAqIEBwYXJhbSBfbGVmdCBUaGUgcG9zaXRpb252YWx1ZSBvZiB0aGUgcHJvamVjdGlvbnNwYWNlJ3MgbGVmdCBib3JkZXIuIChEZWZhdWx0ID0gMClcclxuICAgICAgICAgKiBAcGFyYW0gX3JpZ2h0IFRoZSBwb3NpdGlvbnZhbHVlIG9mIHRoZSBwcm9qZWN0aW9uc3BhY2UncyByaWdodCBib3JkZXIuIChEZWZhdWx0ID0gY2FudmFzLmNsaWVudFdpZHRoKVxyXG4gICAgICAgICAqIEBwYXJhbSBfYm90dG9tIFRoZSBwb3NpdGlvbnZhbHVlIG9mIHRoZSBwcm9qZWN0aW9uc3BhY2UncyBib3R0b20gYm9yZGVyLihEZWZhdWx0ID0gY2FudmFzLmNsaWVudEhlaWdodClcclxuICAgICAgICAgKiBAcGFyYW0gX3RvcCBUaGUgcG9zaXRpb252YWx1ZSBvZiB0aGUgcHJvamVjdGlvbnNwYWNlJ3MgdG9wIGJvcmRlci4oRGVmYXVsdCA9IDApXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHByb2plY3RPcnRob2dyYXBoaWMoX2xlZnQ6IG51bWJlciA9IDAsIF9yaWdodDogbnVtYmVyID0gUmVuZGVyTWFuYWdlci5nZXRDYW52YXMoKS5jbGllbnRXaWR0aCwgX2JvdHRvbTogbnVtYmVyID0gUmVuZGVyTWFuYWdlci5nZXRDYW52YXMoKS5jbGllbnRIZWlnaHQsIF90b3A6IG51bWJlciA9IDApOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5wcm9qZWN0aW9uID0gUFJPSkVDVElPTi5PUlRIT0dSQVBISUM7XHJcbiAgICAgICAgICAgIHRoaXMudHJhbnNmb3JtID0gTWF0cml4NHg0LlBST0pFQ1RJT05fT1JUSE9HUkFQSElDKF9sZWZ0LCBfcmlnaHQsIF9ib3R0b20sIF90b3AsIDQwMCwgLTQwMCk7IC8vIFRPRE86IGV4YW1pbmUgbWFnaWMgbnVtYmVycyFcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybiB0aGUgY2FsY3VsYXRlZCBub3JtZWQgZGltZW5zaW9uIG9mIHRoZSBwcm9qZWN0aW9uIHNwYWNlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGdldFByb2plY3Rpb25SZWN0YW5nbGUoKTogUmVjdGFuZ2xlIHtcclxuICAgICAgICAgICAgbGV0IHRhbkZvdjogbnVtYmVyID0gTWF0aC50YW4oTWF0aC5QSSAqIHRoaXMuZmllbGRPZlZpZXcgLyAzNjApOyAvLyBIYWxmIG9mIHRoZSBhbmdsZSwgdG8gY2FsY3VsYXRlIGRpbWVuc2lvbiBmcm9tIHRoZSBjZW50ZXIgLT4gcmlnaHQgYW5nbGVcclxuICAgICAgICAgICAgbGV0IHRhbkhvcml6b250YWw6IG51bWJlciA9IDA7XHJcbiAgICAgICAgICAgIGxldCB0YW5WZXJ0aWNhbDogbnVtYmVyID0gMDtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRpcmVjdGlvbiA9PSBGSUVMRF9PRl9WSUVXLkRJQUdPTkFMKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgYXNwZWN0OiBudW1iZXIgPSBNYXRoLnNxcnQodGhpcy5hc3BlY3RSYXRpbyk7XHJcbiAgICAgICAgICAgICAgICB0YW5Ib3Jpem9udGFsID0gdGFuRm92ICogYXNwZWN0O1xyXG4gICAgICAgICAgICAgICAgdGFuVmVydGljYWwgPSB0YW5Gb3YgLyBhc3BlY3Q7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5kaXJlY3Rpb24gPT0gRklFTERfT0ZfVklFVy5WRVJUSUNBTCkge1xyXG4gICAgICAgICAgICAgICAgdGFuVmVydGljYWwgPSB0YW5Gb3Y7XHJcbiAgICAgICAgICAgICAgICB0YW5Ib3Jpem9udGFsID0gdGFuVmVydGljYWwgKiB0aGlzLmFzcGVjdFJhdGlvO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Ugey8vRk9WX0RJUkVDVElPTi5IT1JJWk9OVEFMXHJcbiAgICAgICAgICAgICAgICB0YW5Ib3Jpem9udGFsID0gdGFuRm92O1xyXG4gICAgICAgICAgICAgICAgdGFuVmVydGljYWwgPSB0YW5Ib3Jpem9udGFsIC8gdGhpcy5hc3BlY3RSYXRpbztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIFJlY3RhbmdsZS5HRVQoMCwgMCwgdGFuSG9yaXpvbnRhbCAqIDIsIHRhblZlcnRpY2FsICogMik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyNyZWdpb24gVHJhbnNmZXJcclxuICAgICAgICBwdWJsaWMgc2VyaWFsaXplKCk6IFNlcmlhbGl6YXRpb24ge1xyXG4gICAgICAgICAgICBsZXQgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IHtcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogdGhpcy5iYWNrZ3JvdW5kQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kRW5hYmxlZDogdGhpcy5iYWNrZ3JvdW5kRW5hYmxlZCxcclxuICAgICAgICAgICAgICAgIHByb2plY3Rpb246IHRoaXMucHJvamVjdGlvbixcclxuICAgICAgICAgICAgICAgIGZpZWxkT2ZWaWV3OiB0aGlzLmZpZWxkT2ZWaWV3LFxyXG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uOiB0aGlzLmRpcmVjdGlvbixcclxuICAgICAgICAgICAgICAgIGFzcGVjdDogdGhpcy5hc3BlY3RSYXRpbyxcclxuICAgICAgICAgICAgICAgIHBpdm90OiB0aGlzLnBpdm90LnNlcmlhbGl6ZSgpLFxyXG4gICAgICAgICAgICAgICAgW3N1cGVyLmNvbnN0cnVjdG9yLm5hbWVdOiBzdXBlci5zZXJpYWxpemUoKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsaXphdGlvbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBkZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbik6IFNlcmlhbGl6YWJsZSB7XHJcbiAgICAgICAgICAgIHRoaXMuYmFja2dyb3VuZENvbG9yID0gX3NlcmlhbGl6YXRpb24uYmFja2dyb3VuZENvbG9yO1xyXG4gICAgICAgICAgICB0aGlzLmJhY2tncm91bmRFbmFibGVkID0gX3NlcmlhbGl6YXRpb24uYmFja2dyb3VuZEVuYWJsZWQ7XHJcbiAgICAgICAgICAgIHRoaXMucHJvamVjdGlvbiA9IF9zZXJpYWxpemF0aW9uLnByb2plY3Rpb247XHJcbiAgICAgICAgICAgIHRoaXMuZmllbGRPZlZpZXcgPSBfc2VyaWFsaXphdGlvbi5maWVsZE9mVmlldztcclxuICAgICAgICAgICAgdGhpcy5hc3BlY3RSYXRpbyA9IF9zZXJpYWxpemF0aW9uLmFzcGVjdDtcclxuICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSBfc2VyaWFsaXphdGlvbi5kaXJlY3Rpb247XHJcbiAgICAgICAgICAgIHRoaXMucGl2b3QuZGVzZXJpYWxpemUoX3NlcmlhbGl6YXRpb24ucGl2b3QpO1xyXG4gICAgICAgICAgICBzdXBlci5kZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbltzdXBlci5jb25zdHJ1Y3Rvci5uYW1lXSk7XHJcbiAgICAgICAgICAgIHN3aXRjaCAodGhpcy5wcm9qZWN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFBST0pFQ1RJT04uT1JUSE9HUkFQSElDOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvamVjdE9ydGhvZ3JhcGhpYygpOyAvLyBUT0RPOiBzZXJpYWxpemUgYW5kIGRlc2VyaWFsaXplIHBhcmFtZXRlcnNcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgUFJPSkVDVElPTi5DRU5UUkFMOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvamVjdENlbnRyYWwoKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRNdXRhdG9yQXR0cmlidXRlVHlwZXMoX211dGF0b3I6IE11dGF0b3IpOiBNdXRhdG9yQXR0cmlidXRlVHlwZXMge1xyXG4gICAgICAgICAgICBsZXQgdHlwZXM6IE11dGF0b3JBdHRyaWJ1dGVUeXBlcyA9IHN1cGVyLmdldE11dGF0b3JBdHRyaWJ1dGVUeXBlcyhfbXV0YXRvcik7XHJcbiAgICAgICAgICAgIGlmICh0eXBlcy5kaXJlY3Rpb24pXHJcbiAgICAgICAgICAgICAgICB0eXBlcy5kaXJlY3Rpb24gPSBGSUVMRF9PRl9WSUVXO1xyXG4gICAgICAgICAgICBpZiAodHlwZXMucHJvamVjdGlvbilcclxuICAgICAgICAgICAgICAgIHR5cGVzLnByb2plY3Rpb24gPSBQUk9KRUNUSU9OO1xyXG4gICAgICAgICAgICByZXR1cm4gdHlwZXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgbXV0YXRlKF9tdXRhdG9yOiBNdXRhdG9yKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHN1cGVyLm11dGF0ZShfbXV0YXRvcik7XHJcblxyXG4gICAgICAgICAgICBzd2l0Y2ggKHRoaXMucHJvamVjdGlvbikge1xyXG4gICAgICAgICAgICAgICAgY2FzZSBQUk9KRUNUSU9OLkNFTlRSQUw6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9qZWN0Q2VudHJhbCh0aGlzLmFzcGVjdFJhdGlvLCB0aGlzLmZpZWxkT2ZWaWV3LCB0aGlzLmRpcmVjdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByb3RlY3RlZCByZWR1Y2VNdXRhdG9yKF9tdXRhdG9yOiBNdXRhdG9yKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBfbXV0YXRvci50cmFuc2Zvcm07XHJcbiAgICAgICAgICAgIHN1cGVyLnJlZHVjZU11dGF0b3IoX211dGF0b3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyNlbmRyZWdpb25cclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBCYXNlY2xhc3MgZm9yIGRpZmZlcmVudCBraW5kcyBvZiBsaWdodHMuIFxyXG4gICAgICogQGF1dGhvcnMgSmlya2EgRGVsbCdPcm8tRnJpZWRsLCBIRlUsIDIwMTlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGFic3RyYWN0IGNsYXNzIExpZ2h0IGV4dGVuZHMgTXV0YWJsZSB7XHJcbiAgICAgICAgcHVibGljIGNvbG9yOiBDb2xvcjtcclxuICAgICAgICBjb25zdHJ1Y3RvcihfY29sb3I6IENvbG9yID0gbmV3IENvbG9yKDEsIDEsIDEsIDEpKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY29sb3IgPSBfY29sb3I7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByb3RlY3RlZCByZWR1Y2VNdXRhdG9yKCk6IHZvaWQgey8qKi8gfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQW1iaWVudCBsaWdodCwgY29taW5nIGZyb20gYWxsIGRpcmVjdGlvbnMsIGlsbHVtaW5hdGluZyBldmVyeXRoaW5nIHdpdGggaXRzIGNvbG9yIGluZGVwZW5kZW50IG9mIHBvc2l0aW9uIGFuZCBvcmllbnRhdGlvbiAobGlrZSBhIGZvZ2d5IGRheSBvciBpbiB0aGUgc2hhZGVzKSAgXHJcbiAgICAgKiBgYGBwbGFpbnRleHRcclxuICAgICAqIH4gfiB+ICBcclxuICAgICAqICB+IH4gfiAgXHJcbiAgICAgKiBgYGBcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIExpZ2h0QW1iaWVudCBleHRlbmRzIExpZ2h0IHtcclxuICAgICAgICBjb25zdHJ1Y3RvcihfY29sb3I6IENvbG9yID0gbmV3IENvbG9yKDEsIDEsIDEsIDEpKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKF9jb2xvcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBEaXJlY3Rpb25hbCBsaWdodCwgaWxsdW1pbmF0aW5nIGV2ZXJ5dGhpbmcgZnJvbSBhIHNwZWNpZmllZCBkaXJlY3Rpb24gd2l0aCBpdHMgY29sb3IgKGxpa2Ugc3RhbmRpbmcgaW4gYnJpZ2h0IHN1bmxpZ2h0KSAgXHJcbiAgICAgKiBgYGBwbGFpbnRleHRcclxuICAgICAqIC0tLT4gIFxyXG4gICAgICogLS0tPiAgXHJcbiAgICAgKiAtLS0+ICBcclxuICAgICAqIGBgYFxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgTGlnaHREaXJlY3Rpb25hbCBleHRlbmRzIExpZ2h0IHtcclxuICAgICAgICBwdWJsaWMgZGlyZWN0aW9uOiBWZWN0b3IzID0gbmV3IFZlY3RvcjMoMCwgLTEsIDApO1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKF9jb2xvcjogQ29sb3IgPSBuZXcgQ29sb3IoMSwgMSwgMSwgMSksIF9kaXJlY3Rpb246IFZlY3RvcjMgPSBuZXcgVmVjdG9yMygwLCAtMSwgMCkpIHtcclxuICAgICAgICAgICAgc3VwZXIoX2NvbG9yKTtcclxuICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSBfZGlyZWN0aW9uO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogT21uaWRpcmVjdGlvbmFsIGxpZ2h0IGVtaXR0aW5nIGZyb20gaXRzIHBvc2l0aW9uLCBpbGx1bWluYXRpbmcgb2JqZWN0cyBkZXBlbmRpbmcgb24gdGhlaXIgcG9zaXRpb24gYW5kIGRpc3RhbmNlIHdpdGggaXRzIGNvbG9yIChsaWtlIGEgY29sb3JlZCBsaWdodCBidWxiKSAgXHJcbiAgICAgKiBgYGBwbGFpbnRleHRcclxuICAgICAqICAgICAgICAgLlxcfC8uXHJcbiAgICAgKiAgICAgICAgLS0gbyAtLVxyXG4gICAgICogICAgICAgICDCtC98XFxgXHJcbiAgICAgKiBgYGBcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIExpZ2h0UG9pbnQgZXh0ZW5kcyBMaWdodCB7XHJcbiAgICAgICAgcHVibGljIHJhbmdlOiBudW1iZXIgPSAxMDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogU3BvdCBsaWdodCBlbWl0dGluZyB3aXRoaW4gYSBzcGVjaWZpZWQgYW5nbGUgZnJvbSBpdHMgcG9zaXRpb24sIGlsbHVtaW5hdGluZyBvYmplY3RzIGRlcGVuZGluZyBvbiB0aGVpciBwb3NpdGlvbiBhbmQgZGlzdGFuY2Ugd2l0aCBpdHMgY29sb3IgIFxyXG4gICAgICogYGBgcGxhaW50ZXh0XHJcbiAgICAgKiAgICAgICAgICBvICBcclxuICAgICAqICAgICAgICAgL3xcXCAgXHJcbiAgICAgKiAgICAgICAgLyB8IFxcIFxyXG4gICAgICogYGBgICAgXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBMaWdodFNwb3QgZXh0ZW5kcyBMaWdodCB7XHJcbiAgICB9XHJcbn0iLCIvLy88cmVmZXJlbmNlIHBhdGg9XCIuLi9MaWdodC9MaWdodC50c1wiLz5cclxubmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIEF0dGFjaGVzIGEgW1tMaWdodF1dIHRvIHRoZSBub2RlXHJcbiAgICAgKiBAYXV0aG9ycyBKaXJrYSBEZWxsJ09yby1GcmllZGwsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZWZpbmVzIGlkZW50aWZpZXJzIGZvciB0aGUgdmFyaW91cyB0eXBlcyBvZiBsaWdodCB0aGlzIGNvbXBvbmVudCBjYW4gcHJvdmlkZS4gIFxyXG4gICAgICovXHJcbiAgICBleHBvcnQgZW51bSBMSUdIVF9UWVBFIHtcclxuICAgICAgICBBTUJJRU5UID0gXCJhbWJpZW50XCIsXHJcbiAgICAgICAgRElSRUNUSU9OQUwgPSBcImRpcmVjdGlvbmFsXCIsXHJcbiAgICAgICAgUE9JTlQgPSBcInBvaW50XCIsXHJcbiAgICAgICAgU1BPVCA9IFwic3BvdFwiXHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIENvbXBvbmVudExpZ2h0IGV4dGVuZHMgQ29tcG9uZW50IHtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBjb25zdHJ1Y3RvcnM6IHsgW3R5cGU6IHN0cmluZ106IEdlbmVyYWwgfSA9IHsgW0xJR0hUX1RZUEUuQU1CSUVOVF06IExpZ2h0QW1iaWVudCwgW0xJR0hUX1RZUEUuRElSRUNUSU9OQUxdOiBMaWdodERpcmVjdGlvbmFsLCBbTElHSFRfVFlQRS5QT0lOVF06IExpZ2h0UG9pbnQsIFtMSUdIVF9UWVBFLlNQT1RdOiBMaWdodFNwb3QgfTtcclxuICAgICAgICBwdWJsaWMgcGl2b3Q6IE1hdHJpeDR4NCA9IE1hdHJpeDR4NC5JREVOVElUWTtcclxuICAgICAgICBwcml2YXRlIGxpZ2h0OiBMaWdodCA9IG51bGw7XHJcbiAgICAgICAgcHJpdmF0ZSBsaWdodFR5cGU6IExJR0hUX1RZUEU7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKF90eXBlOiBMSUdIVF9UWVBFID0gTElHSFRfVFlQRS5BTUJJRU5ULCBfY29sb3I6IENvbG9yID0gbmV3IENvbG9yKDEsIDEsIDEsIDEpKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2luZ2xldG9uID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0VHlwZShfdHlwZSk7XHJcbiAgICAgICAgICAgIHRoaXMubGlnaHQuY29sb3IgPSBfY29sb3I7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0TGlnaHQoKTogTGlnaHQge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5saWdodDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRUeXBlKCk6IExJR0hUX1RZUEUge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5saWdodFR5cGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc2V0VHlwZShfdHlwZTogTElHSFRfVFlQRSk6IHZvaWQge1xyXG4gICAgICAgICAgICBsZXQgbXRyT2xkOiBNdXRhdG9yID0ge307XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmxpZ2h0KVxyXG4gICAgICAgICAgICAgICAgbXRyT2xkID0gdGhpcy5saWdodC5nZXRNdXRhdG9yKCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmxpZ2h0ID0gbmV3IENvbXBvbmVudExpZ2h0LmNvbnN0cnVjdG9yc1tfdHlwZV0oKTtcclxuICAgICAgICAgICAgdGhpcy5saWdodC5tdXRhdGUobXRyT2xkKTtcclxuICAgICAgICAgICAgdGhpcy5saWdodFR5cGUgPSBfdHlwZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIEF0dGFjaGVzIGEgW1tNYXRlcmlhbF1dIHRvIHRoZSBub2RlXHJcbiAgICAgKiBAYXV0aG9ycyBKaXJrYSBEZWxsJ09yby1GcmllZGwsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgQ29tcG9uZW50TWF0ZXJpYWwgZXh0ZW5kcyBDb21wb25lbnQge1xyXG4gICAgICAgIHB1YmxpYyBtYXRlcmlhbDogTWF0ZXJpYWw7XHJcblxyXG4gICAgICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihfbWF0ZXJpYWw6IE1hdGVyaWFsID0gbnVsbCkge1xyXG4gICAgICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgICAgICB0aGlzLm1hdGVyaWFsID0gX21hdGVyaWFsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8jcmVnaW9uIFRyYW5zZmVyXHJcbiAgICAgICAgcHVibGljIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemF0aW9uIHtcclxuICAgICAgICAgICAgbGV0IHNlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb247XHJcbiAgICAgICAgICAgIC8qIGF0IHRoaXMgcG9pbnQgb2YgdGltZSwgc2VyaWFsaXphdGlvbiBhcyByZXNvdXJjZSBhbmQgYXMgaW5saW5lIG9iamVjdCBpcyBwb3NzaWJsZS4gVE9ETzogY2hlY2sgaWYgaW5saW5lIGJlY29tZXMgb2Jzb2xldGUgKi9cclxuICAgICAgICAgICAgbGV0IGlkTWF0ZXJpYWw6IHN0cmluZyA9IHRoaXMubWF0ZXJpYWwuaWRSZXNvdXJjZTtcclxuICAgICAgICAgICAgaWYgKGlkTWF0ZXJpYWwpXHJcbiAgICAgICAgICAgICAgICBzZXJpYWxpemF0aW9uID0geyBpZE1hdGVyaWFsOiBpZE1hdGVyaWFsIH07XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHNlcmlhbGl6YXRpb24gPSB7IG1hdGVyaWFsOiBTZXJpYWxpemVyLnNlcmlhbGl6ZSh0aGlzLm1hdGVyaWFsKSB9O1xyXG5cclxuICAgICAgICAgICAgc2VyaWFsaXphdGlvbltzdXBlci5jb25zdHJ1Y3Rvci5uYW1lXSA9IHN1cGVyLnNlcmlhbGl6ZSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsaXphdGlvbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHVibGljIGRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uKTogU2VyaWFsaXphYmxlIHtcclxuICAgICAgICAgICAgbGV0IG1hdGVyaWFsOiBNYXRlcmlhbDtcclxuICAgICAgICAgICAgaWYgKF9zZXJpYWxpemF0aW9uLmlkTWF0ZXJpYWwpXHJcbiAgICAgICAgICAgICAgICBtYXRlcmlhbCA9IDxNYXRlcmlhbD5SZXNvdXJjZU1hbmFnZXIuZ2V0KF9zZXJpYWxpemF0aW9uLmlkTWF0ZXJpYWwpO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICBtYXRlcmlhbCA9IDxNYXRlcmlhbD5TZXJpYWxpemVyLmRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uLm1hdGVyaWFsKTtcclxuICAgICAgICAgICAgdGhpcy5tYXRlcmlhbCA9IG1hdGVyaWFsO1xyXG4gICAgICAgICAgICBzdXBlci5kZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbltzdXBlci5jb25zdHJ1Y3Rvci5uYW1lXSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyNlbmRyZWdpb25cclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBBdHRhY2hlcyBhIFtbTWVzaF1dIHRvIHRoZSBub2RlXHJcbiAgICAgKiBAYXV0aG9ycyBKaXJrYSBEZWxsJ09yby1GcmllZGwsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgQ29tcG9uZW50TWVzaCBleHRlbmRzIENvbXBvbmVudCB7XHJcbiAgICAgICAgcHVibGljIHBpdm90OiBNYXRyaXg0eDQgPSBNYXRyaXg0eDQuSURFTlRJVFk7XHJcbiAgICAgICAgcHVibGljIG1lc2g6IE1lc2ggPSBudWxsO1xyXG5cclxuICAgICAgICBwdWJsaWMgY29uc3RydWN0b3IoX21lc2g6IE1lc2ggPSBudWxsKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMubWVzaCA9IF9tZXNoO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8jcmVnaW9uIFRyYW5zZmVyXHJcbiAgICAgICAgcHVibGljIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemF0aW9uIHtcclxuICAgICAgICAgICAgbGV0IHNlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb247XHJcbiAgICAgICAgICAgIC8qIGF0IHRoaXMgcG9pbnQgb2YgdGltZSwgc2VyaWFsaXphdGlvbiBhcyByZXNvdXJjZSBhbmQgYXMgaW5saW5lIG9iamVjdCBpcyBwb3NzaWJsZS4gVE9ETzogY2hlY2sgaWYgaW5saW5lIGJlY29tZXMgb2Jzb2xldGUgKi9cclxuICAgICAgICAgICAgbGV0IGlkTWVzaDogc3RyaW5nID0gdGhpcy5tZXNoLmlkUmVzb3VyY2U7XHJcbiAgICAgICAgICAgIGlmIChpZE1lc2gpXHJcbiAgICAgICAgICAgICAgICBzZXJpYWxpemF0aW9uID0geyBpZE1lc2g6IGlkTWVzaCB9O1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICBzZXJpYWxpemF0aW9uID0geyBtZXNoOiBTZXJpYWxpemVyLnNlcmlhbGl6ZSh0aGlzLm1lc2gpIH07XHJcblxyXG4gICAgICAgICAgICBzZXJpYWxpemF0aW9uLnBpdm90ID0gdGhpcy5waXZvdC5zZXJpYWxpemUoKTtcclxuICAgICAgICAgICAgc2VyaWFsaXphdGlvbltzdXBlci5jb25zdHJ1Y3Rvci5uYW1lXSA9IHN1cGVyLnNlcmlhbGl6ZSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsaXphdGlvbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBkZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbik6IFNlcmlhbGl6YWJsZSB7XHJcbiAgICAgICAgICAgIGxldCBtZXNoOiBNZXNoO1xyXG4gICAgICAgICAgICBpZiAoX3NlcmlhbGl6YXRpb24uaWRNZXNoKVxyXG4gICAgICAgICAgICAgICAgbWVzaCA9IDxNZXNoPlJlc291cmNlTWFuYWdlci5nZXQoX3NlcmlhbGl6YXRpb24uaWRNZXNoKTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgbWVzaCA9IDxNZXNoPlNlcmlhbGl6ZXIuZGVzZXJpYWxpemUoX3NlcmlhbGl6YXRpb24ubWVzaCk7XHJcbiAgICAgICAgICAgIHRoaXMubWVzaCA9IG1lc2g7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnBpdm90LmRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uLnBpdm90KTtcclxuICAgICAgICAgICAgc3VwZXIuZGVzZXJpYWxpemUoX3NlcmlhbGl6YXRpb25bc3VwZXIuY29uc3RydWN0b3IubmFtZV0pO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8jZW5kcmVnaW9uXHJcbiAgICB9XHJcbn1cclxuIiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIEJhc2UgY2xhc3MgZm9yIHNjcmlwdHMgdGhlIHVzZXIgd3JpdGVzXHJcbiAgICAgKiBAYXV0aG9ycyBKaXJrYSBEZWxsJ09yby1GcmllZGwsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgQ29tcG9uZW50U2NyaXB0IGV4dGVuZHMgQ29tcG9uZW50IHtcclxuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5zaW5nbGV0b24gPSBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzZXJpYWxpemUoKTogU2VyaWFsaXphdGlvbiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE11dGF0b3IoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBkZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbik6IFNlcmlhbGl6YWJsZSB7XHJcbiAgICAgICAgICAgIHRoaXMubXV0YXRlKF9zZXJpYWxpemF0aW9uKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIEF0dGFjaGVzIGEgdHJhbnNmb3JtLVtbTWF0cml4NHg0XV0gdG8gdGhlIG5vZGUsIG1vdmluZywgc2NhbGluZyBhbmQgcm90YXRpbmcgaXQgaW4gc3BhY2UgcmVsYXRpdmUgdG8gaXRzIHBhcmVudC5cclxuICAgICAqIEBhdXRob3JzIEppcmthIERlbGwnT3JvLUZyaWVkbCwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBDb21wb25lbnRUcmFuc2Zvcm0gZXh0ZW5kcyBDb21wb25lbnQge1xyXG4gICAgICAgIHB1YmxpYyBsb2NhbDogTWF0cml4NHg0O1xyXG5cclxuICAgICAgICBwdWJsaWMgY29uc3RydWN0b3IoX21hdHJpeDogTWF0cml4NHg0ID0gTWF0cml4NHg0LklERU5USVRZKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMubG9jYWwgPSBfbWF0cml4O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8jcmVnaW9uIFRyYW5zZmVyXHJcbiAgICAgICAgcHVibGljIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemF0aW9uIHtcclxuICAgICAgICAgICAgbGV0IHNlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24gPSB7XHJcbiAgICAgICAgICAgICAgICBsb2NhbDogdGhpcy5sb2NhbC5zZXJpYWxpemUoKSxcclxuICAgICAgICAgICAgICAgIFtzdXBlci5jb25zdHJ1Y3Rvci5uYW1lXTogc3VwZXIuc2VyaWFsaXplKClcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcmV0dXJuIHNlcmlhbGl6YXRpb247XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHB1YmxpYyBkZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbik6IFNlcmlhbGl6YWJsZSB7XHJcbiAgICAgICAgICAgIHN1cGVyLmRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uW3N1cGVyLmNvbnN0cnVjdG9yLm5hbWVdKTtcclxuICAgICAgICAgICAgdGhpcy5sb2NhbC5kZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbi5sb2NhbCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gcHVibGljIG11dGF0ZShfbXV0YXRvcjogTXV0YXRvcik6IHZvaWQge1xyXG4gICAgICAgIC8vICAgICB0aGlzLmxvY2FsLm11dGF0ZShfbXV0YXRvcik7XHJcbiAgICAgICAgLy8gfVxyXG4gICAgICAgIC8vIHB1YmxpYyBnZXRNdXRhdG9yKCk6IE11dGF0b3IgeyBcclxuICAgICAgICAvLyAgICAgcmV0dXJuIHRoaXMubG9jYWwuZ2V0TXV0YXRvcigpO1xyXG4gICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgLy8gcHVibGljIGdldE11dGF0b3JBdHRyaWJ1dGVUeXBlcyhfbXV0YXRvcjogTXV0YXRvcik6IE11dGF0b3JBdHRyaWJ1dGVUeXBlcyB7XHJcbiAgICAgICAgLy8gICAgIGxldCB0eXBlczogTXV0YXRvckF0dHJpYnV0ZVR5cGVzID0gdGhpcy5sb2NhbC5nZXRNdXRhdG9yQXR0cmlidXRlVHlwZXMoX211dGF0b3IpO1xyXG4gICAgICAgIC8vICAgICByZXR1cm4gdHlwZXM7XHJcbiAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICBwcm90ZWN0ZWQgcmVkdWNlTXV0YXRvcihfbXV0YXRvcjogTXV0YXRvcik6IHZvaWQge1xyXG4gICAgICAgICAgICBkZWxldGUgX211dGF0b3Iud29ybGQ7XHJcbiAgICAgICAgICAgIHN1cGVyLnJlZHVjZU11dGF0b3IoX211dGF0b3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyNlbmRyZWdpb25cclxuICAgIH1cclxufVxyXG4iLCIvLyA8cmVmZXJlbmNlIHBhdGg9XCJEZWJ1Z0FsZXJ0LnRzXCIvPlxyXG5uYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGZpbHRlcnMgY29ycmVzcG9uZGluZyB0byBkZWJ1ZyBhY3Rpdml0aWVzLCBtb3JlIHRvIGNvbWVcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGVudW0gREVCVUdfRklMVEVSIHtcclxuICAgICAgICBOT05FID0gMHgwMCxcclxuICAgICAgICBJTkZPID0gMHgwMSxcclxuICAgICAgICBMT0cgPSAweDAyLFxyXG4gICAgICAgIFdBUk4gPSAweDA0LFxyXG4gICAgICAgIEVSUk9SID0gMHgwOCxcclxuICAgICAgICBBTEwgPSBJTkZPIHwgTE9HIHwgV0FSTiB8IEVSUk9SXHJcbiAgICB9XHJcbiAgICAvLyByZW1pbmVzY2VudCBvZiBhbiBlYXJseSBhdHRlbXB0IG9mIERlYnVnXHJcbiAgICAvLyBleHBvcnQgZW51bSBERUJVR19UQVJHRVQge1xyXG4gICAgLy8gICAgIENPTlNPTEUgPSBcImNvbnNvbGVcIixcclxuICAgIC8vICAgICBBTEVSVCA9IFwiYWxlcnRcIixcclxuICAgIC8vICAgICBURVhUQVJFQSA9IFwidGV4dGFyZWFcIixcclxuICAgIC8vICAgICBESUFMT0cgPSBcImRpYWxvZ1wiLFxyXG4gICAgLy8gICAgIEZJTEUgPSBcImZpbGVcIixcclxuICAgIC8vICAgICBTRVJWRVIgPSBcInNlcnZlclwiXHJcbiAgICAvLyB9XHJcblxyXG4gICAgLy8gZXhwb3J0IGludGVyZmFjZSBNYXBEZWJ1Z1RhcmdldFRvRnVuY3Rpb24geyBbdGFyZ2V0OiBzdHJpbmddOiBGdW5jdGlvbjsgfVxyXG4gICAgZXhwb3J0IHR5cGUgTWFwRGVidWdUYXJnZXRUb0RlbGVnYXRlID0gTWFwPERlYnVnVGFyZ2V0LCBGdW5jdGlvbj47XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIE1hcERlYnVnRmlsdGVyVG9EZWxlZ2F0ZSB7IFtmaWx0ZXI6IG51bWJlcl06IEZ1bmN0aW9uOyB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogQmFzZSBjbGFzcyBmb3IgdGhlIGRpZmZlcmVudCBEZWJ1Z1RhcmdldHMsIG1haW5seSBmb3IgdGVjaG5pY2FsIHB1cnBvc2Ugb2YgaW5oZXJpdGFuY2VcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGFic3RyYWN0IGNsYXNzIERlYnVnVGFyZ2V0IHtcclxuICAgICAgICBwdWJsaWMgZGVsZWdhdGVzOiBNYXBEZWJ1Z0ZpbHRlclRvRGVsZWdhdGU7XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBtZXJnZUFyZ3VtZW50cyhfbWVzc2FnZTogT2JqZWN0LCAuLi5fYXJnczogT2JqZWN0W10pOiBzdHJpbmcge1xyXG4gICAgICAgICAgICBsZXQgb3V0OiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeShfbWVzc2FnZSk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGFyZyBvZiBfYXJncylcclxuICAgICAgICAgICAgICAgIG91dCArPSBcIlxcblwiICsgSlNPTi5zdHJpbmdpZnkoYXJnLCBudWxsLCAyKTtcclxuICAgICAgICAgICAgcmV0dXJuIG91dDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiRGVidWdUYXJnZXQudHNcIi8+XHJcbm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBSb3V0aW5nIHRvIHRoZSBhbGVydCBib3hcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIERlYnVnQWxlcnQgZXh0ZW5kcyBEZWJ1Z1RhcmdldCB7XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBkZWxlZ2F0ZXM6IE1hcERlYnVnRmlsdGVyVG9EZWxlZ2F0ZSA9IHtcclxuICAgICAgICAgICAgW0RFQlVHX0ZJTFRFUi5JTkZPXTogRGVidWdBbGVydC5jcmVhdGVEZWxlZ2F0ZShcIkluZm9cIiksXHJcbiAgICAgICAgICAgIFtERUJVR19GSUxURVIuTE9HXTogRGVidWdBbGVydC5jcmVhdGVEZWxlZ2F0ZShcIkxvZ1wiKSxcclxuICAgICAgICAgICAgW0RFQlVHX0ZJTFRFUi5XQVJOXTogRGVidWdBbGVydC5jcmVhdGVEZWxlZ2F0ZShcIldhcm5cIiksXHJcbiAgICAgICAgICAgIFtERUJVR19GSUxURVIuRVJST1JdOiBEZWJ1Z0FsZXJ0LmNyZWF0ZURlbGVnYXRlKFwiRXJyb3JcIilcclxuICAgICAgICB9O1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlRGVsZWdhdGUoX2hlYWRsaW5lOiBzdHJpbmcpOiBGdW5jdGlvbiB7XHJcbiAgICAgICAgICAgIGxldCBkZWxlZ2F0ZTogRnVuY3Rpb24gPSBmdW5jdGlvbiAoX21lc3NhZ2U6IE9iamVjdCwgLi4uX2FyZ3M6IE9iamVjdFtdKTogdm9pZCB7XHJcbiAgICAgICAgICAgICAgICBsZXQgb3V0OiBzdHJpbmcgPSBfaGVhZGxpbmUgKyBcIlxcblxcblwiICsgRGVidWdUYXJnZXQubWVyZ2VBcmd1bWVudHMoX21lc3NhZ2UsIC4uLl9hcmdzKTtcclxuICAgICAgICAgICAgICAgIGFsZXJ0KG91dCk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHJldHVybiBkZWxlZ2F0ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiRGVidWdUYXJnZXQudHNcIi8+XHJcbm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBSb3V0aW5nIHRvIHRoZSBzdGFuZGFyZC1jb25zb2xlXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBEZWJ1Z0NvbnNvbGUgZXh0ZW5kcyBEZWJ1Z1RhcmdldCB7XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBkZWxlZ2F0ZXM6IE1hcERlYnVnRmlsdGVyVG9EZWxlZ2F0ZSA9IHtcclxuICAgICAgICAgICAgW0RFQlVHX0ZJTFRFUi5JTkZPXTogY29uc29sZS5pbmZvLFxyXG4gICAgICAgICAgICBbREVCVUdfRklMVEVSLkxPR106IGNvbnNvbGUubG9nLFxyXG4gICAgICAgICAgICBbREVCVUdfRklMVEVSLldBUk5dOiBjb25zb2xlLndhcm4sXHJcbiAgICAgICAgICAgIFtERUJVR19GSUxURVIuRVJST1JdOiBjb25zb2xlLmVycm9yXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJEZWJ1Z0ludGVyZmFjZXMudHNcIi8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJEZWJ1Z0FsZXJ0LnRzXCIvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiRGVidWdDb25zb2xlLnRzXCIvPlxyXG5uYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIERlYnVnLUNsYXNzIG9mZmVycyBmdW5jdGlvbnMga25vd24gZnJvbSB0aGUgY29uc29sZS1vYmplY3QgYW5kIGFkZGl0aW9ucywgXHJcbiAgICAgKiByb3V0aW5nIHRoZSBpbmZvcm1hdGlvbiB0byB2YXJpb3VzIFtbRGVidWdUYXJnZXRzXV0gdGhhdCBjYW4gYmUgZWFzaWx5IGRlZmluZWQgYnkgdGhlIGRldmVsb3BlcnMgYW5kIHJlZ2lzdGVyZCBieSB1c2Vyc1xyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgRGVidWcge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEZvciBlYWNoIHNldCBmaWx0ZXIsIHRoaXMgYXNzb2NpYXRpdmUgYXJyYXkga2VlcHMgcmVmZXJlbmNlcyB0byB0aGUgcmVnaXN0ZXJlZCBkZWxlZ2F0ZSBmdW5jdGlvbnMgb2YgdGhlIGNob3NlbiBbW0RlYnVnVGFyZ2V0c11dXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgLy8gVE9ETzogaW1wbGVtZW50IGFub255bW91cyBmdW5jdGlvbiBzZXR0aW5nIHVwIGFsbCBmaWx0ZXJzXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgZGVsZWdhdGVzOiB7IFtmaWx0ZXI6IG51bWJlcl06IE1hcERlYnVnVGFyZ2V0VG9EZWxlZ2F0ZSB9ID0ge1xyXG4gICAgICAgICAgICBbREVCVUdfRklMVEVSLklORk9dOiBuZXcgTWFwKFtbRGVidWdDb25zb2xlLCBEZWJ1Z0NvbnNvbGUuZGVsZWdhdGVzW0RFQlVHX0ZJTFRFUi5JTkZPXV1dKSxcclxuICAgICAgICAgICAgW0RFQlVHX0ZJTFRFUi5MT0ddOiBuZXcgTWFwKFtbRGVidWdDb25zb2xlLCBEZWJ1Z0NvbnNvbGUuZGVsZWdhdGVzW0RFQlVHX0ZJTFRFUi5MT0ddXV0pLFxyXG4gICAgICAgICAgICBbREVCVUdfRklMVEVSLldBUk5dOiBuZXcgTWFwKFtbRGVidWdDb25zb2xlLCBEZWJ1Z0NvbnNvbGUuZGVsZWdhdGVzW0RFQlVHX0ZJTFRFUi5XQVJOXV1dKSxcclxuICAgICAgICAgICAgW0RFQlVHX0ZJTFRFUi5FUlJPUl06IG5ldyBNYXAoW1tEZWJ1Z0NvbnNvbGUsIERlYnVnQ29uc29sZS5kZWxlZ2F0ZXNbREVCVUdfRklMVEVSLkVSUk9SXV1dKVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERlLSAvIEFjdGl2YXRlIGEgZmlsdGVyIGZvciB0aGUgZ2l2ZW4gRGVidWdUYXJnZXQuIFxyXG4gICAgICAgICAqIEBwYXJhbSBfdGFyZ2V0XHJcbiAgICAgICAgICogQHBhcmFtIF9maWx0ZXIgXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBzZXRGaWx0ZXIoX3RhcmdldDogRGVidWdUYXJnZXQsIF9maWx0ZXI6IERFQlVHX0ZJTFRFUik6IHZvaWQge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBmaWx0ZXIgaW4gRGVidWcuZGVsZWdhdGVzKVxyXG4gICAgICAgICAgICAgICAgRGVidWcuZGVsZWdhdGVzW2ZpbHRlcl0uZGVsZXRlKF90YXJnZXQpO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgZmlsdGVyIGluIERFQlVHX0ZJTFRFUikge1xyXG4gICAgICAgICAgICAgICAgbGV0IHBhcnNlZDogbnVtYmVyID0gcGFyc2VJbnQoZmlsdGVyKTtcclxuICAgICAgICAgICAgICAgIGlmIChwYXJzZWQgPT0gREVCVUdfRklMVEVSLkFMTClcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGlmIChfZmlsdGVyICYgcGFyc2VkKVxyXG4gICAgICAgICAgICAgICAgICAgIERlYnVnLmRlbGVnYXRlc1twYXJzZWRdLnNldChfdGFyZ2V0LCBfdGFyZ2V0LmRlbGVnYXRlc1twYXJzZWRdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGVidWcgZnVuY3Rpb24gdG8gYmUgaW1wbGVtZW50ZWQgYnkgdGhlIERlYnVnVGFyZ2V0LiBcclxuICAgICAgICAgKiBpbmZvKC4uLikgZGlzcGxheXMgYWRkaXRpb25hbCBpbmZvcm1hdGlvbiB3aXRoIGxvdyBwcmlvcml0eVxyXG4gICAgICAgICAqIEBwYXJhbSBfbWVzc2FnZVxyXG4gICAgICAgICAqIEBwYXJhbSBfYXJncyBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGluZm8oX21lc3NhZ2U6IE9iamVjdCwgLi4uX2FyZ3M6IE9iamVjdFtdKTogdm9pZCB7XHJcbiAgICAgICAgICAgIERlYnVnLmRlbGVnYXRlKERFQlVHX0ZJTFRFUi5JTkZPLCBfbWVzc2FnZSwgX2FyZ3MpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZWJ1ZyBmdW5jdGlvbiB0byBiZSBpbXBsZW1lbnRlZCBieSB0aGUgRGVidWdUYXJnZXQuIFxyXG4gICAgICAgICAqIGxvZyguLi4pIGRpc3BsYXlzIGluZm9ybWF0aW9uIHdpdGggbWVkaXVtIHByaW9yaXR5XHJcbiAgICAgICAgICogQHBhcmFtIF9tZXNzYWdlXHJcbiAgICAgICAgICogQHBhcmFtIF9hcmdzIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgbG9nKF9tZXNzYWdlOiBPYmplY3QsIC4uLl9hcmdzOiBPYmplY3RbXSk6IHZvaWQge1xyXG4gICAgICAgICAgICBEZWJ1Zy5kZWxlZ2F0ZShERUJVR19GSUxURVIuTE9HLCBfbWVzc2FnZSwgX2FyZ3MpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZWJ1ZyBmdW5jdGlvbiB0byBiZSBpbXBsZW1lbnRlZCBieSB0aGUgRGVidWdUYXJnZXQuIFxyXG4gICAgICAgICAqIHdhcm4oLi4uKSBkaXNwbGF5cyBpbmZvcm1hdGlvbiBhYm91dCBub24tY29uZm9ybWl0aWVzIGluIHVzYWdlLCB3aGljaCBpcyBlbXBoYXNpemVkIGUuZy4gYnkgY29sb3JcclxuICAgICAgICAgKiBAcGFyYW0gX21lc3NhZ2VcclxuICAgICAgICAgKiBAcGFyYW0gX2FyZ3MgXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyB3YXJuKF9tZXNzYWdlOiBPYmplY3QsIC4uLl9hcmdzOiBPYmplY3RbXSk6IHZvaWQge1xyXG4gICAgICAgICAgICBEZWJ1Zy5kZWxlZ2F0ZShERUJVR19GSUxURVIuV0FSTiwgX21lc3NhZ2UsIF9hcmdzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGVidWcgZnVuY3Rpb24gdG8gYmUgaW1wbGVtZW50ZWQgYnkgdGhlIERlYnVnVGFyZ2V0LiBcclxuICAgICAgICAgKiBlcnJvciguLi4pIGRpc3BsYXlzIGNyaXRpY2FsIGluZm9ybWF0aW9uIGFib3V0IGZhaWx1cmVzLCB3aGljaCBpcyBlbXBoYXNpemVkIGUuZy4gYnkgY29sb3JcclxuICAgICAgICAgKiBAcGFyYW0gX21lc3NhZ2VcclxuICAgICAgICAgKiBAcGFyYW0gX2FyZ3MgXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBlcnJvcihfbWVzc2FnZTogT2JqZWN0LCAuLi5fYXJnczogT2JqZWN0W10pOiB2b2lkIHtcclxuICAgICAgICAgICAgRGVidWcuZGVsZWdhdGUoREVCVUdfRklMVEVSLkVSUk9SLCBfbWVzc2FnZSwgX2FyZ3MpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBMb29rdXAgYWxsIGRlbGVnYXRlcyByZWdpc3RlcmVkIHRvIHRoZSBmaWx0ZXIgYW5kIGNhbGwgdGhlbSB1c2luZyB0aGUgZ2l2ZW4gYXJndW1lbnRzXHJcbiAgICAgICAgICogQHBhcmFtIF9maWx0ZXIgXHJcbiAgICAgICAgICogQHBhcmFtIF9tZXNzYWdlIFxyXG4gICAgICAgICAqIEBwYXJhbSBfYXJncyBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBkZWxlZ2F0ZShfZmlsdGVyOiBERUJVR19GSUxURVIsIF9tZXNzYWdlOiBPYmplY3QsIF9hcmdzOiBPYmplY3RbXSk6IHZvaWQge1xyXG4gICAgICAgICAgICBsZXQgZGVsZWdhdGVzOiBNYXBEZWJ1Z1RhcmdldFRvRGVsZWdhdGUgPSBEZWJ1Zy5kZWxlZ2F0ZXNbX2ZpbHRlcl07XHJcbiAgICAgICAgICAgIGZvciAobGV0IGRlbGVnYXRlIG9mIGRlbGVnYXRlcy52YWx1ZXMoKSlcclxuICAgICAgICAgICAgICAgIGlmIChfYXJncy5sZW5ndGggPiAwKVxyXG4gICAgICAgICAgICAgICAgICAgIGRlbGVnYXRlKF9tZXNzYWdlLCAuLi5fYXJncyk7XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZWdhdGUoX21lc3NhZ2UpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJEZWJ1Z1RhcmdldC50c1wiLz5cclxubmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIFJvdXRpbmcgdG8gYSBIVE1MRGlhbG9nRWxlbWVudFxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgRGVidWdEaWFsb2cgZXh0ZW5kcyBEZWJ1Z1RhcmdldCB7XHJcbiAgICAgICAgLy8gVE9ETzogY2hlY2tvdXQgSFRNTERpYWxvZ0VsZW1lbnQ7ICEhIVxyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIkRlYnVnVGFyZ2V0LnRzXCIvPlxyXG5uYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogUm91dGUgdG8gYW4gSFRNTFRleHRBcmVhLCBtYXkgYmUgb2Jzb2xldGUgd2hlbiB1c2luZyBIVE1MRGlhbG9nRWxlbWVudFxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgRGVidWdUZXh0QXJlYSBleHRlbmRzIERlYnVnVGFyZ2V0IHtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIHRleHRBcmVhOiBIVE1MVGV4dEFyZWFFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRleHRhcmVhXCIpO1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZGVsZWdhdGVzOiBNYXBEZWJ1Z0ZpbHRlclRvRGVsZWdhdGUgPSB7XHJcbiAgICAgICAgICAgIFtERUJVR19GSUxURVIuSU5GT106IERlYnVnQWxlcnQuY3JlYXRlRGVsZWdhdGUoXCJJbmZvXCIpXHJcbiAgICAgICAgfTtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZURlbGVnYXRlKF9oZWFkbGluZTogc3RyaW5nKTogRnVuY3Rpb24ge1xyXG4gICAgICAgICAgICBsZXQgZGVsZWdhdGU6IEZ1bmN0aW9uID0gZnVuY3Rpb24gKF9tZXNzYWdlOiBPYmplY3QsIC4uLl9hcmdzOiBPYmplY3RbXSk6IHZvaWQge1xyXG4gICAgICAgICAgICAgICAgbGV0IG91dDogc3RyaW5nID0gX2hlYWRsaW5lICsgXCJcXG5cXG5cIiArIERlYnVnVGFyZ2V0Lm1lcmdlQXJndW1lbnRzKF9tZXNzYWdlLCBfYXJncyk7XHJcbiAgICAgICAgICAgICAgICBEZWJ1Z1RleHRBcmVhLnRleHRBcmVhLnRleHRDb250ZW50ICs9IG91dDtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcmV0dXJuIGRlbGVnYXRlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBEZWZpbmVzIGEgY29sb3IgYXMgdmFsdWVzIGluIHRoZSByYW5nZSBvZiAwIHRvIDEgZm9yIHRoZSBmb3VyIGNoYW5uZWxzIHJlZCwgZ3JlZW4sIGJsdWUgYW5kIGFscGhhIChmb3Igb3BhY2l0eSlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIENvbG9yIGV4dGVuZHMgTXV0YWJsZSB7IC8vaW1wbGVtZW50cyBTZXJpYWxpemFibGUge1xyXG4gICAgICAgIHB1YmxpYyByOiBudW1iZXI7XHJcbiAgICAgICAgcHVibGljIGc6IG51bWJlcjtcclxuICAgICAgICBwdWJsaWMgYjogbnVtYmVyO1xyXG4gICAgICAgIHB1YmxpYyBhOiBudW1iZXI7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKF9yOiBudW1iZXIgPSAxLCBfZzogbnVtYmVyID0gMSwgX2I6IG51bWJlciA9IDEsIF9hOiBudW1iZXIgPSAxKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0Tm9ybVJHQkEoX3IsIF9nLCBfYiwgX2EpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXQgQkxBQ0soKTogQ29sb3Ige1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IENvbG9yKDAsIDAsIDAsIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGdldCBXSElURSgpOiBDb2xvciB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQ29sb3IoMSwgMSwgMSwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0IFJFRCgpOiBDb2xvciB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQ29sb3IoMSwgMCwgMCwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0IEdSRUVOKCk6IENvbG9yIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBDb2xvcigwLCAxLCAwLCAxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXQgQkxVRSgpOiBDb2xvciB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQ29sb3IoMCwgMCwgMSwgMSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc2V0Tm9ybVJHQkEoX3I6IG51bWJlciwgX2c6IG51bWJlciwgX2I6IG51bWJlciwgX2E6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLnIgPSBNYXRoLm1pbigxLCBNYXRoLm1heCgwLCBfcikpO1xyXG4gICAgICAgICAgICB0aGlzLmcgPSBNYXRoLm1pbigxLCBNYXRoLm1heCgwLCBfZykpO1xyXG4gICAgICAgICAgICB0aGlzLmIgPSBNYXRoLm1pbigxLCBNYXRoLm1heCgwLCBfYikpO1xyXG4gICAgICAgICAgICB0aGlzLmEgPSBNYXRoLm1pbigxLCBNYXRoLm1heCgwLCBfYSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHNldEJ5dGVzUkdCQShfcjogbnVtYmVyLCBfZzogbnVtYmVyLCBfYjogbnVtYmVyLCBfYTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0Tm9ybVJHQkEoX3IgLyAyNTUsIF9nIC8gMjU1LCBfYiAvIDI1NSwgX2EgLyAyNTUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldEFycmF5KCk6IEZsb2F0MzJBcnJheSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgRmxvYXQzMkFycmF5KFt0aGlzLnIsIHRoaXMuZywgdGhpcy5iLCB0aGlzLmFdKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzZXRBcnJheU5vcm1SR0JBKF9jb2xvcjogRmxvYXQzMkFycmF5KTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0Tm9ybVJHQkEoX2NvbG9yWzBdLCBfY29sb3JbMV0sIF9jb2xvclsyXSwgX2NvbG9yWzNdKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzZXRBcnJheUJ5dGVzUkdCQShfY29sb3I6IFVpbnQ4Q2xhbXBlZEFycmF5KTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0Qnl0ZXNSR0JBKF9jb2xvclswXSwgX2NvbG9yWzFdLCBfY29sb3JbMl0sIF9jb2xvclszXSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcm90ZWN0ZWQgcmVkdWNlTXV0YXRvcihfbXV0YXRvcjogTXV0YXRvcik6IHZvaWQgey8qKiAqLyB9XHJcbiAgICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogQmFzZWNsYXNzIGZvciBtYXRlcmlhbHMuIENvbWJpbmVzIGEgW1tTaGFkZXJdXSB3aXRoIGEgY29tcGF0aWJsZSBbW0NvYXRdXVxyXG4gICAgICogQGF1dGhvcnMgSmlya2EgRGVsbCdPcm8tRnJpZWRsLCBIRlUsIDIwMTlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIE1hdGVyaWFsIGltcGxlbWVudHMgU2VyaWFsaXphYmxlUmVzb3VyY2Uge1xyXG4gICAgICAgIC8qKiBUaGUgbmFtZSB0byBjYWxsIHRoZSBNYXRlcmlhbCBieS4gKi9cclxuICAgICAgICBwdWJsaWMgbmFtZTogc3RyaW5nO1xyXG4gICAgICAgIHB1YmxpYyBpZFJlc291cmNlOiBzdHJpbmcgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgcHJpdmF0ZSBzaGFkZXJUeXBlOiB0eXBlb2YgU2hhZGVyOyAvLyBUaGUgc2hhZGVyIHByb2dyYW0gdXNlZCBieSB0aGlzIEJhc2VNYXRlcmlhbFxyXG4gICAgICAgIHByaXZhdGUgY29hdDogQ29hdDtcclxuXHJcbiAgICAgICAgcHVibGljIGNvbnN0cnVjdG9yKF9uYW1lOiBzdHJpbmcsIF9zaGFkZXI/OiB0eXBlb2YgU2hhZGVyLCBfY29hdD86IENvYXQpIHtcclxuICAgICAgICAgICAgdGhpcy5uYW1lID0gX25hbWU7XHJcbiAgICAgICAgICAgIHRoaXMuc2hhZGVyVHlwZSA9IF9zaGFkZXI7XHJcbiAgICAgICAgICAgIGlmIChfc2hhZGVyKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoX2NvYXQpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRDb2F0KF9jb2F0KTtcclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldENvYXQodGhpcy5jcmVhdGVDb2F0TWF0Y2hpbmdTaGFkZXIoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENyZWF0ZXMgYSBuZXcgW1tDb2F0XV0gaW5zdGFuY2UgdGhhdCBpcyB2YWxpZCBmb3IgdGhlIFtbU2hhZGVyXV0gcmVmZXJlbmNlZCBieSB0aGlzIG1hdGVyaWFsXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGNyZWF0ZUNvYXRNYXRjaGluZ1NoYWRlcigpOiBDb2F0IHtcclxuICAgICAgICAgICAgbGV0IGNvYXQ6IENvYXQgPSBuZXcgKHRoaXMuc2hhZGVyVHlwZS5nZXRDb2F0KCkpKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBjb2F0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogTWFrZXMgdGhpcyBtYXRlcmlhbCByZWZlcmVuY2UgdGhlIGdpdmVuIFtbQ29hdF1dIGlmIGl0IGlzIGNvbXBhdGlibGUgd2l0aCB0aGUgcmVmZXJlbmNlZCBbW1NoYWRlcl1dXHJcbiAgICAgICAgICogQHBhcmFtIF9jb2F0IFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzZXRDb2F0KF9jb2F0OiBDb2F0KTogdm9pZCB7XHJcbiAgICAgICAgICAgIGlmIChfY29hdC5jb25zdHJ1Y3RvciAhPSB0aGlzLnNoYWRlclR5cGUuZ2V0Q29hdCgpKVxyXG4gICAgICAgICAgICAgICAgdGhyb3cgKG5ldyBFcnJvcihcIlNoYWRlciBhbmQgY29hdCBkb24ndCBtYXRjaFwiKSk7XHJcbiAgICAgICAgICAgIHRoaXMuY29hdCA9IF9jb2F0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgY3VycmVudGx5IHJlZmVyZW5jZWQgW1tDb2F0XV0gaW5zdGFuY2VcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0Q29hdCgpOiBDb2F0IHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29hdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENoYW5nZXMgdGhlIG1hdGVyaWFscyByZWZlcmVuY2UgdG8gdGhlIGdpdmVuIFtbU2hhZGVyXV0sIGNyZWF0ZXMgYW5kIHJlZmVyZW5jZXMgYSBuZXcgW1tDb2F0XV0gaW5zdGFuY2UgIFxyXG4gICAgICAgICAqIGFuZCBtdXRhdGVzIHRoZSBuZXcgY29hdCB0byBwcmVzZXJ2ZSBtYXRjaGluZyBwcm9wZXJ0aWVzLlxyXG4gICAgICAgICAqIEBwYXJhbSBfc2hhZGVyVHlwZSBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc2V0U2hhZGVyKF9zaGFkZXJUeXBlOiB0eXBlb2YgU2hhZGVyKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hhZGVyVHlwZSA9IF9zaGFkZXJUeXBlO1xyXG4gICAgICAgICAgICBsZXQgY29hdDogQ29hdCA9IHRoaXMuY3JlYXRlQ29hdE1hdGNoaW5nU2hhZGVyKCk7XHJcbiAgICAgICAgICAgIGNvYXQubXV0YXRlKHRoaXMuY29hdC5nZXRNdXRhdG9yKCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgW1tTaGFkZXJdXSByZWZlcmVuY2VkIGJ5IHRoaXMgbWF0ZXJpYWxcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0U2hhZGVyKCk6IHR5cGVvZiBTaGFkZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zaGFkZXJUeXBlO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8vI3JlZ2lvbiBUcmFuc2ZlclxyXG4gICAgICAgIC8vIFRPRE86IHRoaXMgdHlwZSBvZiBzZXJpYWxpemF0aW9uIHdhcyBpbXBsZW1lbnRlZCBmb3IgaW1wbGljaXQgTWF0ZXJpYWwgY3JlYXRlLiBDaGVjayBpZiBvYnNvbGV0ZSB3aGVuIG9ubHkgb25lIG1hdGVyaWFsIGNsYXNzIGV4aXN0cyBhbmQvb3IgbWF0ZXJpYWxzIGFyZSBzdG9yZWQgc2VwYXJhdGVseVxyXG4gICAgICAgIHB1YmxpYyBzZXJpYWxpemUoKTogU2VyaWFsaXphdGlvbiB7XHJcbiAgICAgICAgICAgIGxldCBzZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uID0ge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogdGhpcy5uYW1lLFxyXG4gICAgICAgICAgICAgICAgaWRSZXNvdXJjZTogdGhpcy5pZFJlc291cmNlLFxyXG4gICAgICAgICAgICAgICAgc2hhZGVyOiB0aGlzLnNoYWRlclR5cGUubmFtZSxcclxuICAgICAgICAgICAgICAgIGNvYXQ6IFNlcmlhbGl6ZXIuc2VyaWFsaXplKHRoaXMuY29hdClcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcmV0dXJuIHNlcmlhbGl6YXRpb247XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHB1YmxpYyBkZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbik6IFNlcmlhbGl6YWJsZSB7XHJcbiAgICAgICAgICAgIHRoaXMubmFtZSA9IF9zZXJpYWxpemF0aW9uLm5hbWU7XHJcbiAgICAgICAgICAgIHRoaXMuaWRSZXNvdXJjZSA9IF9zZXJpYWxpemF0aW9uLmlkUmVzb3VyY2U7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IHByb3ZpZGUgZm9yIHNoYWRlcnMgaW4gdGhlIHVzZXJzIG5hbWVzcGFjZS4gU2VlIFNlcmlhbGl6ZXIgZnVsbHBhdGggZXRjLlxyXG4gICAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLWFueVxyXG4gICAgICAgICAgICB0aGlzLnNoYWRlclR5cGUgPSAoPGFueT5GdWRnZUNvcmUpW19zZXJpYWxpemF0aW9uLnNoYWRlcl07XHJcbiAgICAgICAgICAgIGxldCBjb2F0OiBDb2F0ID0gPENvYXQ+U2VyaWFsaXplci5kZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbi5jb2F0KTtcclxuICAgICAgICAgICAgdGhpcy5zZXRDb2F0KGNvYXQpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8jZW5kcmVnaW9uXHJcbiAgICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogS2VlcHMgYSBkZXBvdCBvZiBvYmplY3RzIHRoYXQgaGF2ZSBiZWVuIG1hcmtlZCBmb3IgcmV1c2UsIHNvcnRlZCBieSB0eXBlLiAgXHJcbiAgICAgKiBVc2luZyBbW1JlY3ljbGVyXV0gcmVkdWNlcyBsb2FkIG9uIHRoZSBjYXJiYWdlIGNvbGxlY3RvciBhbmQgdGh1cyBzdXBwb3J0cyBzbW9vdGggcGVyZm9ybWFuY2VcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGFic3RyYWN0IGNsYXNzIFJlY3ljbGVyIHtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBkZXBvdDogeyBbdHlwZTogc3RyaW5nXTogT2JqZWN0W10gfSA9IHt9O1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIGFuIG9iamVjdCBvZiB0aGUgcmVxdWVzdGVkIHR5cGUgZnJvbSB0aGUgZGVwb3QsIG9yIGEgbmV3IG9uZSwgaWYgdGhlIGRlcG90IHdhcyBlbXB0eSBcclxuICAgICAgICAgKiBAcGFyYW0gX1QgVGhlIGNsYXNzIGlkZW50aWZpZXIgb2YgdGhlIGRlc2lyZWQgb2JqZWN0XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXQ8VD4oX1Q6IG5ldyAoKSA9PiBUKTogVCB7XHJcbiAgICAgICAgICAgIGxldCBrZXk6IHN0cmluZyA9IF9ULm5hbWU7XHJcbiAgICAgICAgICAgIGxldCBpbnN0YW5jZXM6IE9iamVjdFtdID0gUmVjeWNsZXIuZGVwb3Rba2V5XTtcclxuICAgICAgICAgICAgaWYgKGluc3RhbmNlcyAmJiBpbnN0YW5jZXMubGVuZ3RoID4gMClcclxuICAgICAgICAgICAgICAgIHJldHVybiA8VD5pbnN0YW5jZXMucG9wKCk7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgX1QoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFN0b3JlcyB0aGUgb2JqZWN0IGluIHRoZSBkZXBvdCBmb3IgbGF0ZXIgcmVjeWNsaW5nLiBVc2VycyBhcmUgcmVzcG9uc2libGUgZm9yIHRocm93aW5nIGluIG9iamVjdHMgdGhhdCBhcmUgYWJvdXQgdG8gbG9vc2Ugc2NvcGUgYW5kIGFyZSBub3QgcmVmZXJlbmNlZCBieSBhbnkgb3RoZXJcclxuICAgICAgICAgKiBAcGFyYW0gX2luc3RhbmNlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBzdG9yZShfaW5zdGFuY2U6IE9iamVjdCk6IHZvaWQge1xyXG4gICAgICAgICAgICBsZXQga2V5OiBzdHJpbmcgPSBfaW5zdGFuY2UuY29uc3RydWN0b3IubmFtZTtcclxuICAgICAgICAgICAgLy9EZWJ1Zy5sb2coa2V5KTtcclxuICAgICAgICAgICAgbGV0IGluc3RhbmNlczogT2JqZWN0W10gPSBSZWN5Y2xlci5kZXBvdFtrZXldIHx8IFtdO1xyXG4gICAgICAgICAgICBpbnN0YW5jZXMucHVzaChfaW5zdGFuY2UpO1xyXG4gICAgICAgICAgICBSZWN5Y2xlci5kZXBvdFtrZXldID0gaW5zdGFuY2VzO1xyXG4gICAgICAgICAgICAvLyBEZWJ1Zy5sb2coYE9iamVjdE1hbmFnZXIuZGVwb3RbJHtrZXl9XTogJHtPYmplY3RNYW5hZ2VyLmRlcG90W2tleV0ubGVuZ3RofWApO1xyXG4gICAgICAgICAgICAvL0RlYnVnLmxvZyh0aGlzLmRlcG90KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEVtcHR5cyB0aGUgZGVwb3Qgb2YgYSBnaXZlbiB0eXBlLCBsZWF2aW5nIHRoZSBvYmplY3RzIGZvciB0aGUgZ2FyYmFnZSBjb2xsZWN0b3IuIE1heSByZXN1bHQgaW4gYSBzaG9ydCBzdGFsbCB3aGVuIG1hbnkgb2JqZWN0cyB3ZXJlIGluXHJcbiAgICAgICAgICogQHBhcmFtIF9UXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBkdW1wPFQ+KF9UOiBuZXcgKCkgPT4gVCk6IHZvaWQge1xyXG4gICAgICAgICAgICBsZXQga2V5OiBzdHJpbmcgPSBfVC5uYW1lO1xyXG4gICAgICAgICAgICBSZWN5Y2xlci5kZXBvdFtrZXldID0gW107XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBFbXB0eXMgYWxsIGRlcG90cywgbGVhdmluZyBhbGwgb2JqZWN0cyB0byB0aGUgZ2FyYmFnZSBjb2xsZWN0b3IuIE1heSByZXN1bHQgaW4gYSBzaG9ydCBzdGFsbCB3aGVuIG1hbnkgb2JqZWN0cyB3ZXJlIGluXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBkdW1wQWxsKCk6IHZvaWQge1xyXG4gICAgICAgICAgICBSZWN5Y2xlci5kZXBvdCA9IHt9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgZXhwb3J0IGludGVyZmFjZSBTZXJpYWxpemFibGVSZXNvdXJjZSBleHRlbmRzIFNlcmlhbGl6YWJsZSB7XHJcbiAgICAgICAgaWRSZXNvdXJjZTogc3RyaW5nO1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgUmVzb3VyY2VzIHtcclxuICAgICAgICBbaWRSZXNvdXJjZTogc3RyaW5nXTogU2VyaWFsaXphYmxlUmVzb3VyY2U7XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGludGVyZmFjZSBTZXJpYWxpemF0aW9uT2ZSZXNvdXJjZXMge1xyXG4gICAgICAgIFtpZFJlc291cmNlOiBzdHJpbmddOiBTZXJpYWxpemF0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3RhdGljIGNsYXNzIGhhbmRsaW5nIHRoZSByZXNvdXJjZXMgdXNlZCB3aXRoIHRoZSBjdXJyZW50IEZVREdFLWluc3RhbmNlLiAgXHJcbiAgICAgKiBLZWVwcyBhIGxpc3Qgb2YgdGhlIHJlc291cmNlcyBhbmQgZ2VuZXJhdGVzIGlkcyB0byByZXRyaWV2ZSB0aGVtLiAgXHJcbiAgICAgKiBSZXNvdXJjZXMgYXJlIG9iamVjdHMgcmVmZXJlbmNlZCBtdWx0aXBsZSB0aW1lcyBidXQgc3VwcG9zZWQgdG8gYmUgc3RvcmVkIG9ubHkgb25jZVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgYWJzdHJhY3QgY2xhc3MgUmVzb3VyY2VNYW5hZ2VyIHtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIHJlc291cmNlczogUmVzb3VyY2VzID0ge307XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBzZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uT2ZSZXNvdXJjZXMgPSBudWxsO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBHZW5lcmF0ZXMgYW4gaWQgZm9yIHRoZSByZXNvdXJjZXMgYW5kIHJlZ2lzdGVycyBpdCB3aXRoIHRoZSBsaXN0IG9mIHJlc291cmNlcyBcclxuICAgICAgICAgKiBAcGFyYW0gX3Jlc291cmNlIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgcmVnaXN0ZXIoX3Jlc291cmNlOiBTZXJpYWxpemFibGVSZXNvdXJjZSk6IHZvaWQge1xyXG4gICAgICAgICAgICBpZiAoIV9yZXNvdXJjZS5pZFJlc291cmNlKVxyXG4gICAgICAgICAgICAgICAgX3Jlc291cmNlLmlkUmVzb3VyY2UgPSBSZXNvdXJjZU1hbmFnZXIuZ2VuZXJhdGVJZChfcmVzb3VyY2UpO1xyXG4gICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIucmVzb3VyY2VzW19yZXNvdXJjZS5pZFJlc291cmNlXSA9IF9yZXNvdXJjZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEdlbmVyYXRlIGEgdXNlciByZWFkYWJsZSBhbmQgdW5pcXVlIGlkIHVzaW5nIHRoZSB0eXBlIG9mIHRoZSByZXNvdXJjZSwgdGhlIGRhdGUgYW5kIHJhbmRvbSBudW1iZXJzXHJcbiAgICAgICAgICogQHBhcmFtIF9yZXNvdXJjZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2VuZXJhdGVJZChfcmVzb3VyY2U6IFNlcmlhbGl6YWJsZVJlc291cmNlKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgLy8gVE9ETzogYnVpbGQgaWQgYW5kIGludGVncmF0ZSBpbmZvIGZyb20gcmVzb3VyY2UsIG5vdCBqdXN0IGRhdGVcclxuICAgICAgICAgICAgbGV0IGlkUmVzb3VyY2U6IHN0cmluZztcclxuICAgICAgICAgICAgZG9cclxuICAgICAgICAgICAgICAgIGlkUmVzb3VyY2UgPSBfcmVzb3VyY2UuY29uc3RydWN0b3IubmFtZSArIFwifFwiICsgbmV3IERhdGUoKS50b0lTT1N0cmluZygpICsgXCJ8XCIgKyBNYXRoLnJhbmRvbSgpLnRvUHJlY2lzaW9uKDUpLnN1YnN0cigyLCA1KTtcclxuICAgICAgICAgICAgd2hpbGUgKFJlc291cmNlTWFuYWdlci5yZXNvdXJjZXNbaWRSZXNvdXJjZV0pO1xyXG4gICAgICAgICAgICByZXR1cm4gaWRSZXNvdXJjZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRlc3RzLCBpZiBhbiBvYmplY3QgaXMgYSBbW1NlcmlhbGl6YWJsZVJlc291cmNlXV1cclxuICAgICAgICAgKiBAcGFyYW0gX29iamVjdCBUaGUgb2JqZWN0IHRvIGV4YW1pbmVcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGlzUmVzb3VyY2UoX29iamVjdDogU2VyaWFsaXphYmxlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHJldHVybiAoUmVmbGVjdC5oYXMoX29iamVjdCwgXCJpZFJlc291cmNlXCIpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHJpZXZlcyB0aGUgcmVzb3VyY2Ugc3RvcmVkIHdpdGggdGhlIGdpdmVuIGlkXHJcbiAgICAgICAgICogQHBhcmFtIF9pZFJlc291cmNlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXQoX2lkUmVzb3VyY2U6IHN0cmluZyk6IFNlcmlhbGl6YWJsZVJlc291cmNlIHtcclxuICAgICAgICAgICAgbGV0IHJlc291cmNlOiBTZXJpYWxpemFibGVSZXNvdXJjZSA9IFJlc291cmNlTWFuYWdlci5yZXNvdXJjZXNbX2lkUmVzb3VyY2VdO1xyXG4gICAgICAgICAgICBpZiAoIXJlc291cmNlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IFJlc291cmNlTWFuYWdlci5zZXJpYWxpemF0aW9uW19pZFJlc291cmNlXTtcclxuICAgICAgICAgICAgICAgIGlmICghc2VyaWFsaXphdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIERlYnVnLmVycm9yKFwiUmVzb3VyY2Ugbm90IGZvdW5kXCIsIF9pZFJlc291cmNlKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJlc291cmNlID0gUmVzb3VyY2VNYW5hZ2VyLmRlc2VyaWFsaXplUmVzb3VyY2Uoc2VyaWFsaXphdGlvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc291cmNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ3JlYXRlcyBhbmQgcmVnaXN0ZXJzIGEgcmVzb3VyY2UgZnJvbSBhIFtbTm9kZV1dLCBjb3B5aW5nIHRoZSBjb21wbGV0ZSBicmFuY2ggc3RhcnRpbmcgd2l0aCBpdFxyXG4gICAgICAgICAqIEBwYXJhbSBfbm9kZSBBIG5vZGUgdG8gY3JlYXRlIHRoZSByZXNvdXJjZSBmcm9tXHJcbiAgICAgICAgICogQHBhcmFtIF9yZXBsYWNlV2l0aEluc3RhbmNlIGlmIHRydWUgKGRlZmF1bHQpLCB0aGUgbm9kZSB1c2VkIGFzIG9yaWdpbiBpcyByZXBsYWNlZCBieSBhIFtbTm9kZVJlc291cmNlSW5zdGFuY2VdXSBvZiB0aGUgW1tOb2RlUmVzb3VyY2VdXSBjcmVhdGVkXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyByZWdpc3Rlck5vZGVBc1Jlc291cmNlKF9ub2RlOiBOb2RlLCBfcmVwbGFjZVdpdGhJbnN0YW5jZTogYm9vbGVhbiA9IHRydWUpOiBOb2RlUmVzb3VyY2Uge1xyXG4gICAgICAgICAgICBsZXQgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IF9ub2RlLnNlcmlhbGl6ZSgpO1xyXG4gICAgICAgICAgICBsZXQgbm9kZVJlc291cmNlOiBOb2RlUmVzb3VyY2UgPSBuZXcgTm9kZVJlc291cmNlKFwiTm9kZVJlc291cmNlXCIpO1xyXG4gICAgICAgICAgICBub2RlUmVzb3VyY2UuZGVzZXJpYWxpemUoc2VyaWFsaXphdGlvbik7XHJcbiAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5yZWdpc3Rlcihub2RlUmVzb3VyY2UpO1xyXG5cclxuICAgICAgICAgICAgaWYgKF9yZXBsYWNlV2l0aEluc3RhbmNlICYmIF9ub2RlLmdldFBhcmVudCgpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaW5zdGFuY2U6IE5vZGVSZXNvdXJjZUluc3RhbmNlID0gbmV3IE5vZGVSZXNvdXJjZUluc3RhbmNlKG5vZGVSZXNvdXJjZSk7XHJcbiAgICAgICAgICAgICAgICBfbm9kZS5nZXRQYXJlbnQoKS5yZXBsYWNlQ2hpbGQoX25vZGUsIGluc3RhbmNlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG5vZGVSZXNvdXJjZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNlcmlhbGl6ZSBhbGwgcmVzb3VyY2VzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBzZXJpYWxpemUoKTogU2VyaWFsaXphdGlvbk9mUmVzb3VyY2VzIHtcclxuICAgICAgICAgICAgbGV0IHNlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb25PZlJlc291cmNlcyA9IHt9O1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpZFJlc291cmNlIGluIFJlc291cmNlTWFuYWdlci5yZXNvdXJjZXMpIHtcclxuICAgICAgICAgICAgICAgIGxldCByZXNvdXJjZTogU2VyaWFsaXphYmxlUmVzb3VyY2UgPSBSZXNvdXJjZU1hbmFnZXIucmVzb3VyY2VzW2lkUmVzb3VyY2VdO1xyXG4gICAgICAgICAgICAgICAgaWYgKGlkUmVzb3VyY2UgIT0gcmVzb3VyY2UuaWRSZXNvdXJjZSlcclxuICAgICAgICAgICAgICAgICAgICBEZWJ1Zy5lcnJvcihcIlJlc291cmNlLWlkIG1pc21hdGNoXCIsIHJlc291cmNlKTtcclxuICAgICAgICAgICAgICAgIHNlcmlhbGl6YXRpb25baWRSZXNvdXJjZV0gPSBTZXJpYWxpemVyLnNlcmlhbGl6ZShyZXNvdXJjZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHNlcmlhbGl6YXRpb247XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDcmVhdGUgcmVzb3VyY2VzIGZyb20gYSBzZXJpYWxpemF0aW9uLCBkZWxldGluZyBhbGwgcmVzb3VyY2VzIHByZXZpb3VzbHkgcmVnaXN0ZXJlZFxyXG4gICAgICAgICAqIEBwYXJhbSBfc2VyaWFsaXphdGlvbiBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uT2ZSZXNvdXJjZXMpOiBSZXNvdXJjZXMge1xyXG4gICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIuc2VyaWFsaXphdGlvbiA9IF9zZXJpYWxpemF0aW9uO1xyXG4gICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIucmVzb3VyY2VzID0ge307XHJcbiAgICAgICAgICAgIGZvciAobGV0IGlkUmVzb3VyY2UgaW4gX3NlcmlhbGl6YXRpb24pIHtcclxuICAgICAgICAgICAgICAgIGxldCBzZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uID0gX3NlcmlhbGl6YXRpb25baWRSZXNvdXJjZV07XHJcbiAgICAgICAgICAgICAgICBsZXQgcmVzb3VyY2U6IFNlcmlhbGl6YWJsZVJlc291cmNlID0gUmVzb3VyY2VNYW5hZ2VyLmRlc2VyaWFsaXplUmVzb3VyY2Uoc2VyaWFsaXphdGlvbik7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzb3VyY2UpXHJcbiAgICAgICAgICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLnJlc291cmNlc1tpZFJlc291cmNlXSA9IHJlc291cmNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBSZXNvdXJjZU1hbmFnZXIucmVzb3VyY2VzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgZGVzZXJpYWxpemVSZXNvdXJjZShfc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbik6IFNlcmlhbGl6YWJsZVJlc291cmNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIDxTZXJpYWxpemFibGVSZXNvdXJjZT5TZXJpYWxpemVyLmRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vTGlnaHQvTGlnaHQudHNcIi8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9Db21wb25lbnQvQ29tcG9uZW50TGlnaHQudHNcIi8+XHJcbm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgZXhwb3J0IHR5cGUgTWFwTGlnaHRUeXBlVG9MaWdodExpc3QgPSBNYXA8c3RyaW5nLCBDb21wb25lbnRMaWdodFtdPjtcclxuICAgIC8qKlxyXG4gICAgICogQ29udHJvbHMgdGhlIHJlbmRlcmluZyBvZiBhIGJyYW5jaCBvZiBhIHNjZW5ldHJlZSwgdXNpbmcgdGhlIGdpdmVuIFtbQ29tcG9uZW50Q2FtZXJhXV0sXHJcbiAgICAgKiBhbmQgdGhlIHByb3BhZ2F0aW9uIG9mIHRoZSByZW5kZXJlZCBpbWFnZSBmcm9tIHRoZSBvZmZzY3JlZW4gcmVuZGVyYnVmZmVyIHRvIHRoZSB0YXJnZXQgY2FudmFzXHJcbiAgICAgKiB0aHJvdWdoIGEgc2VyaWVzIG9mIFtbRnJhbWluZ11dIG9iamVjdHMuIFRoZSBzdGFnZXMgaW52b2x2ZWQgYXJlIGluIG9yZGVyIG9mIHJlbmRlcmluZ1xyXG4gICAgICogW1tSZW5kZXJNYW5hZ2VyXV0udmlld3BvcnQgLT4gW1tWaWV3cG9ydF1dLnNvdXJjZSAtPiBbW1ZpZXdwb3J0XV0uZGVzdGluYXRpb24gLT4gRE9NLUNhbnZhcyAtPiBDbGllbnQoQ1NTKVxyXG4gICAgICogQGF1dGhvcnMgSmFzY2hhIEthcmFnw7ZsLCBIRlUsIDIwMTkgfCBKaXJrYSBEZWxsJ09yby1GcmllZGwsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgVmlld3BvcnQgZXh0ZW5kcyBFdmVudFRhcmdldCB7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgZm9jdXM6IFZpZXdwb3J0O1xyXG5cclxuICAgICAgICBwdWJsaWMgbmFtZTogc3RyaW5nID0gXCJWaWV3cG9ydFwiOyAvLyBUaGUgbmFtZSB0byBjYWxsIHRoaXMgdmlld3BvcnQgYnkuXHJcbiAgICAgICAgcHVibGljIGNhbWVyYTogQ29tcG9uZW50Q2FtZXJhID0gbnVsbDsgLy8gVGhlIGNhbWVyYSByZXByZXNlbnRpbmcgdGhlIHZpZXcgcGFyYW1ldGVycyB0byByZW5kZXIgdGhlIGJyYW5jaC5cclxuXHJcbiAgICAgICAgcHVibGljIHJlY3RTb3VyY2U6IFJlY3RhbmdsZTtcclxuICAgICAgICBwdWJsaWMgcmVjdERlc3RpbmF0aW9uOiBSZWN0YW5nbGU7XHJcblxyXG4gICAgICAgIC8vIFRPRE86IHZlcmlmeSBpZiBjbGllbnQgdG8gY2FudmFzIHNob3VsZCBiZSBpbiBWaWV3cG9ydCBvciBzb21ld2hlcmUgZWxzZSAoV2luZG93LCBDb250YWluZXI/KVxyXG4gICAgICAgIC8vIE11bHRpcGxlIHZpZXdwb3J0cyB1c2luZyB0aGUgc2FtZSBjYW52YXMgc2hvdWxkbid0IGRpZmZlciBoZXJlLi4uXHJcbiAgICAgICAgLy8gZGlmZmVyZW50IGZyYW1pbmcgbWV0aG9kcyBjYW4gYmUgdXNlZCwgdGhpcyBpcyB0aGUgZGVmYXVsdFxyXG4gICAgICAgIHB1YmxpYyBmcmFtZUNsaWVudFRvQ2FudmFzOiBGcmFtaW5nU2NhbGVkID0gbmV3IEZyYW1pbmdTY2FsZWQoKTtcclxuICAgICAgICBwdWJsaWMgZnJhbWVDYW52YXNUb0Rlc3RpbmF0aW9uOiBGcmFtaW5nQ29tcGxleCA9IG5ldyBGcmFtaW5nQ29tcGxleCgpO1xyXG4gICAgICAgIHB1YmxpYyBmcmFtZURlc3RpbmF0aW9uVG9Tb3VyY2U6IEZyYW1pbmdTY2FsZWQgPSBuZXcgRnJhbWluZ1NjYWxlZCgpO1xyXG4gICAgICAgIHB1YmxpYyBmcmFtZVNvdXJjZVRvUmVuZGVyOiBGcmFtaW5nU2NhbGVkID0gbmV3IEZyYW1pbmdTY2FsZWQoKTtcclxuXHJcbiAgICAgICAgcHVibGljIGFkanVzdGluZ0ZyYW1lczogYm9vbGVhbiA9IHRydWU7XHJcbiAgICAgICAgcHVibGljIGFkanVzdGluZ0NhbWVyYTogYm9vbGVhbiA9IHRydWU7XHJcblxyXG4gICAgICAgIHB1YmxpYyBsaWdodHM6IE1hcExpZ2h0VHlwZVRvTGlnaHRMaXN0ID0gbnVsbDtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSBicmFuY2g6IE5vZGUgPSBudWxsOyAvLyBUaGUgZmlyc3Qgbm9kZSBpbiB0aGUgdHJlZShicmFuY2gpIHRoYXQgd2lsbCBiZSByZW5kZXJlZC5cclxuICAgICAgICBwcml2YXRlIGNyYzI6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCA9IG51bGw7XHJcbiAgICAgICAgcHJpdmF0ZSBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50ID0gbnVsbDtcclxuICAgICAgICBwcml2YXRlIHBpY2tCdWZmZXJzOiBQaWNrQnVmZmVyW10gPSBbXTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ29ubmVjdHMgdGhlIHZpZXdwb3J0IHRvIHRoZSBnaXZlbiBjYW52YXMgdG8gcmVuZGVyIHRoZSBnaXZlbiBicmFuY2ggdG8gdXNpbmcgdGhlIGdpdmVuIGNhbWVyYS1jb21wb25lbnQsIGFuZCBuYW1lcyB0aGUgdmlld3BvcnQgYXMgZ2l2ZW4uXHJcbiAgICAgICAgICogQHBhcmFtIF9uYW1lIFxyXG4gICAgICAgICAqIEBwYXJhbSBfYnJhbmNoIFxyXG4gICAgICAgICAqIEBwYXJhbSBfY2FtZXJhIFxyXG4gICAgICAgICAqIEBwYXJhbSBfY2FudmFzIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBpbml0aWFsaXplKF9uYW1lOiBzdHJpbmcsIF9icmFuY2g6IE5vZGUsIF9jYW1lcmE6IENvbXBvbmVudENhbWVyYSwgX2NhbnZhczogSFRNTENhbnZhc0VsZW1lbnQpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5uYW1lID0gX25hbWU7XHJcbiAgICAgICAgICAgIHRoaXMuY2FtZXJhID0gX2NhbWVyYTtcclxuICAgICAgICAgICAgdGhpcy5jYW52YXMgPSBfY2FudmFzO1xyXG4gICAgICAgICAgICB0aGlzLmNyYzIgPSBfY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucmVjdFNvdXJjZSA9IFJlbmRlck1hbmFnZXIuZ2V0Q2FudmFzUmVjdCgpO1xyXG4gICAgICAgICAgICB0aGlzLnJlY3REZXN0aW5hdGlvbiA9IHRoaXMuZ2V0Q2xpZW50UmVjdGFuZ2xlKCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNldEJyYW5jaChfYnJhbmNoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0cmlldmUgdGhlIDJELWNvbnRleHQgYXR0YWNoZWQgdG8gdGhlIGRlc3RpbmF0aW9uIGNhbnZhc1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBnZXRDb250ZXh0KCk6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNyYzI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHJpZXZlIHRoZSBzaXplIG9mIHRoZSBkZXN0aW5hdGlvbiBjYW52YXMgYXMgYSByZWN0YW5nbGUsIHggYW5kIHkgYXJlIGFsd2F5cyAwIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBnZXRDYW52YXNSZWN0YW5nbGUoKTogUmVjdGFuZ2xlIHtcclxuICAgICAgICAgICAgcmV0dXJuIFJlY3RhbmdsZS5HRVQoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHJpZXZlIHRoZSBjbGllbnQgcmVjdGFuZ2xlIHRoZSBjYW52YXMgaXMgZGlzcGxheWVkIGFuZCBmaXQgaW4sIHggYW5kIHkgYXJlIGFsd2F5cyAwIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBnZXRDbGllbnRSZWN0YW5nbGUoKTogUmVjdGFuZ2xlIHtcclxuICAgICAgICAgICAgcmV0dXJuIFJlY3RhbmdsZS5HRVQoMCwgMCwgdGhpcy5jYW52YXMuY2xpZW50V2lkdGgsIHRoaXMuY2FudmFzLmNsaWVudEhlaWdodCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTZXQgdGhlIGJyYW5jaCB0byBiZSBkcmF3biBpbiB0aGUgdmlld3BvcnQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHNldEJyYW5jaChfYnJhbmNoOiBOb2RlKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmJyYW5jaCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5icmFuY2gucmVtb3ZlRXZlbnRMaXN0ZW5lcihFVkVOVC5DT01QT05FTlRfQURELCB0aGlzLmhuZENvbXBvbmVudEV2ZW50KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYnJhbmNoLnJlbW92ZUV2ZW50TGlzdGVuZXIoRVZFTlQuQ09NUE9ORU5UX1JFTU9WRSwgdGhpcy5obmRDb21wb25lbnRFdmVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5icmFuY2ggPSBfYnJhbmNoO1xyXG4gICAgICAgICAgICB0aGlzLmNvbGxlY3RMaWdodHMoKTtcclxuICAgICAgICAgICAgdGhpcy5icmFuY2guYWRkRXZlbnRMaXN0ZW5lcihFVkVOVC5DT01QT05FTlRfQURELCB0aGlzLmhuZENvbXBvbmVudEV2ZW50KTtcclxuICAgICAgICAgICAgdGhpcy5icmFuY2guYWRkRXZlbnRMaXN0ZW5lcihFVkVOVC5DT01QT05FTlRfUkVNT1ZFLCB0aGlzLmhuZENvbXBvbmVudEV2ZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogTG9ncyB0aGlzIHZpZXdwb3J0cyBzY2VuZWdyYXBoIHRvIHRoZSBjb25zb2xlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzaG93U2NlbmVHcmFwaCgpOiB2b2lkIHtcclxuICAgICAgICAgICAgLy8gVE9ETzogbW92ZSB0byBkZWJ1Zy1jbGFzc1xyXG4gICAgICAgICAgICBsZXQgb3V0cHV0OiBzdHJpbmcgPSBcIlNjZW5lR3JhcGggZm9yIHRoaXMgdmlld3BvcnQ6XCI7XHJcbiAgICAgICAgICAgIG91dHB1dCArPSBcIlxcbiBcXG5cIjtcclxuICAgICAgICAgICAgb3V0cHV0ICs9IHRoaXMuYnJhbmNoLm5hbWU7XHJcbiAgICAgICAgICAgIERlYnVnLmxvZyhvdXRwdXQgKyBcIiAgID0+IFJPT1ROT0RFXCIgKyB0aGlzLmNyZWF0ZVNjZW5lR3JhcGgodGhpcy5icmFuY2gpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vICNyZWdpb24gRHJhd2luZ1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERyYXcgdGhpcyB2aWV3cG9ydFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBkcmF3KCk6IHZvaWQge1xyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLnJlc2V0RnJhbWVCdWZmZXIoKTtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmNhbWVyYS5pc0FjdGl2ZSlcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgaWYgKHRoaXMuYWRqdXN0aW5nRnJhbWVzKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5hZGp1c3RGcmFtZXMoKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuYWRqdXN0aW5nQ2FtZXJhKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5hZGp1c3RDYW1lcmEoKTtcclxuXHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIuY2xlYXIodGhpcy5jYW1lcmEuZ2V0QmFja2dvdW5kQ29sb3IoKSk7XHJcbiAgICAgICAgICAgIGlmIChSZW5kZXJNYW5hZ2VyLmFkZEJyYW5jaCh0aGlzLmJyYW5jaCkpXHJcbiAgICAgICAgICAgICAgICAvLyBicmFuY2ggaGFzIG5vdCB5ZXQgYmVlbiBwcm9jZXNzZWQgZnVsbHkgYnkgcmVuZGVybWFuYWdlciAtPiB1cGRhdGUgYWxsIHJlZ2lzdGVyZWQgbm9kZXNcclxuICAgICAgICAgICAgICAgIFJlbmRlck1hbmFnZXIudXBkYXRlKCk7XHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIuc2V0TGlnaHRzKHRoaXMubGlnaHRzKTtcclxuICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5kcmF3QnJhbmNoKHRoaXMuYnJhbmNoLCB0aGlzLmNhbWVyYSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNyYzIuaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuY3JjMi5kcmF3SW1hZ2UoXHJcbiAgICAgICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmdldENhbnZhcygpLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWN0U291cmNlLngsIHRoaXMucmVjdFNvdXJjZS55LCB0aGlzLnJlY3RTb3VyY2Uud2lkdGgsIHRoaXMucmVjdFNvdXJjZS5oZWlnaHQsXHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlY3REZXN0aW5hdGlvbi54LCB0aGlzLnJlY3REZXN0aW5hdGlvbi55LCB0aGlzLnJlY3REZXN0aW5hdGlvbi53aWR0aCwgdGhpcy5yZWN0RGVzdGluYXRpb24uaGVpZ2h0XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAqIERyYXcgdGhpcyB2aWV3cG9ydCBmb3IgUmF5Q2FzdFxyXG4gICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGNyZWF0ZVBpY2tCdWZmZXJzKCk6IHZvaWQge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5hZGp1c3RpbmdGcmFtZXMpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmFkanVzdEZyYW1lcygpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5hZGp1c3RpbmdDYW1lcmEpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmFkanVzdENhbWVyYSgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKFJlbmRlck1hbmFnZXIuYWRkQnJhbmNoKHRoaXMuYnJhbmNoKSlcclxuICAgICAgICAgICAgICAgIC8vIGJyYW5jaCBoYXMgbm90IHlldCBiZWVuIHByb2Nlc3NlZCBmdWxseSBieSByZW5kZXJtYW5hZ2VyIC0+IHVwZGF0ZSBhbGwgcmVnaXN0ZXJlZCBub2Rlc1xyXG4gICAgICAgICAgICAgICAgUmVuZGVyTWFuYWdlci51cGRhdGUoKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucGlja0J1ZmZlcnMgPSBSZW5kZXJNYW5hZ2VyLmRyYXdCcmFuY2hGb3JSYXlDYXN0KHRoaXMuYnJhbmNoLCB0aGlzLmNhbWVyYSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNyYzIuaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuY3JjMi5kcmF3SW1hZ2UoXHJcbiAgICAgICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmdldENhbnZhcygpLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWN0U291cmNlLngsIHRoaXMucmVjdFNvdXJjZS55LCB0aGlzLnJlY3RTb3VyY2Uud2lkdGgsIHRoaXMucmVjdFNvdXJjZS5oZWlnaHQsXHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlY3REZXN0aW5hdGlvbi54LCB0aGlzLnJlY3REZXN0aW5hdGlvbi55LCB0aGlzLnJlY3REZXN0aW5hdGlvbi53aWR0aCwgdGhpcy5yZWN0RGVzdGluYXRpb24uaGVpZ2h0XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgcHVibGljIHBpY2tOb2RlQXQoX3BvczogVmVjdG9yMik6IFJheUhpdFtdIHtcclxuICAgICAgICAgICAgLy8gdGhpcy5jcmVhdGVQaWNrQnVmZmVycygpO1xyXG4gICAgICAgICAgICBsZXQgaGl0czogUmF5SGl0W10gPSBSZW5kZXJNYW5hZ2VyLnBpY2tOb2RlQXQoX3BvcywgdGhpcy5waWNrQnVmZmVycywgdGhpcy5yZWN0U291cmNlKTtcclxuICAgICAgICAgICAgaGl0cy5zb3J0KChhOiBSYXlIaXQsIGI6IFJheUhpdCkgPT4gKGIuekJ1ZmZlciA+IDApID8gKGEuekJ1ZmZlciA+IDApID8gYS56QnVmZmVyIC0gYi56QnVmZmVyIDogMSA6IC0xKTtcclxuICAgICAgICAgICAgcmV0dXJuIGhpdHM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBBZGp1c3QgYWxsIGZyYW1lcyBpbnZvbHZlZCBpbiB0aGUgcmVuZGVyaW5nIHByb2Nlc3MgZnJvbSB0aGUgZGlzcGxheSBhcmVhIGluIHRoZSBjbGllbnQgdXAgdG8gdGhlIHJlbmRlcmVyIGNhbnZhc1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBhZGp1c3RGcmFtZXMoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIC8vIGdldCB0aGUgcmVjdGFuZ2xlIG9mIHRoZSBjYW52YXMgYXJlYSBhcyBkaXNwbGF5ZWQgKGNvbnNpZGVyIGNzcylcclxuICAgICAgICAgICAgbGV0IHJlY3RDbGllbnQ6IFJlY3RhbmdsZSA9IHRoaXMuZ2V0Q2xpZW50UmVjdGFuZ2xlKCk7XHJcbiAgICAgICAgICAgIC8vIGFkanVzdCB0aGUgY2FudmFzIHNpemUgYWNjb3JkaW5nIHRvIHRoZSBnaXZlbiBmcmFtaW5nIGFwcGxpZWQgdG8gY2xpZW50XHJcbiAgICAgICAgICAgIGxldCByZWN0Q2FudmFzOiBSZWN0YW5nbGUgPSB0aGlzLmZyYW1lQ2xpZW50VG9DYW52YXMuZ2V0UmVjdChyZWN0Q2xpZW50KTtcclxuICAgICAgICAgICAgdGhpcy5jYW52YXMud2lkdGggPSByZWN0Q2FudmFzLndpZHRoO1xyXG4gICAgICAgICAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSByZWN0Q2FudmFzLmhlaWdodDtcclxuICAgICAgICAgICAgLy8gYWRqdXN0IHRoZSBkZXN0aW5hdGlvbiBhcmVhIG9uIHRoZSB0YXJnZXQtY2FudmFzIHRvIHJlbmRlciB0byBieSBhcHBseWluZyB0aGUgZnJhbWluZyB0byBjYW52YXNcclxuICAgICAgICAgICAgdGhpcy5yZWN0RGVzdGluYXRpb24gPSB0aGlzLmZyYW1lQ2FudmFzVG9EZXN0aW5hdGlvbi5nZXRSZWN0KHJlY3RDYW52YXMpO1xyXG4gICAgICAgICAgICAvLyBhZGp1c3QgdGhlIGFyZWEgb24gdGhlIHNvdXJjZS1jYW52YXMgdG8gcmVuZGVyIGZyb20gYnkgYXBwbHlpbmcgdGhlIGZyYW1pbmcgdG8gZGVzdGluYXRpb24gYXJlYVxyXG4gICAgICAgICAgICB0aGlzLnJlY3RTb3VyY2UgPSB0aGlzLmZyYW1lRGVzdGluYXRpb25Ub1NvdXJjZS5nZXRSZWN0KHRoaXMucmVjdERlc3RpbmF0aW9uKTtcclxuICAgICAgICAgICAgLy8gaGF2aW5nIGFuIG9mZnNldCBzb3VyY2UgZG9lcyBtYWtlIHNlbnNlIG9ubHkgd2hlbiBtdWx0aXBsZSB2aWV3cG9ydHMgZGlzcGxheSBwYXJ0cyBvZiB0aGUgc2FtZSByZW5kZXJpbmcuIEZvciBub3c6IHNoaWZ0IGl0IHRvIDAsMFxyXG4gICAgICAgICAgICB0aGlzLnJlY3RTb3VyY2UueCA9IHRoaXMucmVjdFNvdXJjZS55ID0gMDtcclxuICAgICAgICAgICAgLy8gc3RpbGwsIGEgcGFydGlhbCBpbWFnZSBvZiB0aGUgcmVuZGVyaW5nIG1heSBiZSByZXRyaWV2ZWQgYnkgbW92aW5nIGFuZCByZXNpemluZyB0aGUgcmVuZGVyIHZpZXdwb3J0XHJcbiAgICAgICAgICAgIGxldCByZWN0UmVuZGVyOiBSZWN0YW5nbGUgPSB0aGlzLmZyYW1lU291cmNlVG9SZW5kZXIuZ2V0UmVjdCh0aGlzLnJlY3RTb3VyY2UpO1xyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLnNldFZpZXdwb3J0UmVjdGFuZ2xlKHJlY3RSZW5kZXIpO1xyXG4gICAgICAgICAgICAvLyBubyBtb3JlIHRyYW5zZm9ybWF0aW9uIGFmdGVyIHRoaXMgZm9yIG5vdywgb2Zmc2NyZWVuIGNhbnZhcyBhbmQgcmVuZGVyLXZpZXdwb3J0IGhhdmUgdGhlIHNhbWUgc2l6ZVxyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLnNldENhbnZhc1NpemUocmVjdFJlbmRlci53aWR0aCwgcmVjdFJlbmRlci5oZWlnaHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBBZGp1c3QgdGhlIGNhbWVyYSBwYXJhbWV0ZXJzIHRvIGZpdCB0aGUgcmVuZGVyaW5nIGludG8gdGhlIHJlbmRlciB2aWVwb3J0XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGFkanVzdENhbWVyYSgpOiB2b2lkIHtcclxuICAgICAgICAgICAgbGV0IHJlY3Q6IFJlY3RhbmdsZSA9IFJlbmRlck1hbmFnZXIuZ2V0Vmlld3BvcnRSZWN0YW5nbGUoKTtcclxuICAgICAgICAgICAgdGhpcy5jYW1lcmEucHJvamVjdENlbnRyYWwocmVjdC53aWR0aCAvIHJlY3QuaGVpZ2h0LCB0aGlzLmNhbWVyYS5nZXRGaWVsZE9mVmlldygpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gI2VuZHJlZ2lvblxyXG5cclxuICAgICAgICAvLyNyZWdpb24gUG9pbnRzXHJcbiAgICAgICAgcHVibGljIHBvaW50Q2xpZW50VG9Tb3VyY2UoX2NsaWVudDogVmVjdG9yMik6IFZlY3RvcjIge1xyXG4gICAgICAgICAgICBsZXQgcmVzdWx0OiBWZWN0b3IyO1xyXG4gICAgICAgICAgICBsZXQgcmVjdDogUmVjdGFuZ2xlO1xyXG4gICAgICAgICAgICByZWN0ID0gdGhpcy5nZXRDbGllbnRSZWN0YW5nbGUoKTtcclxuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5mcmFtZUNsaWVudFRvQ2FudmFzLmdldFBvaW50KF9jbGllbnQsIHJlY3QpO1xyXG4gICAgICAgICAgICByZWN0ID0gdGhpcy5nZXRDYW52YXNSZWN0YW5nbGUoKTtcclxuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5mcmFtZUNhbnZhc1RvRGVzdGluYXRpb24uZ2V0UG9pbnQocmVzdWx0LCByZWN0KTtcclxuICAgICAgICAgICAgcmVzdWx0ID0gdGhpcy5mcmFtZURlc3RpbmF0aW9uVG9Tb3VyY2UuZ2V0UG9pbnQocmVzdWx0LCB0aGlzLnJlY3RTb3VyY2UpO1xyXG4gICAgICAgICAgICAvL1RPRE86IHdoZW4gU291cmNlLCBSZW5kZXIgYW5kIFJlbmRlclZpZXdwb3J0IGRldmlhdGUsIGNvbnRpbnVlIHRyYW5zZm9ybWF0aW9uIFxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHBvaW50U291cmNlVG9SZW5kZXIoX3NvdXJjZTogVmVjdG9yMik6IFZlY3RvcjIge1xyXG4gICAgICAgICAgICBsZXQgcHJvamVjdGlvblJlY3RhbmdsZTogUmVjdGFuZ2xlID0gdGhpcy5jYW1lcmEuZ2V0UHJvamVjdGlvblJlY3RhbmdsZSgpO1xyXG4gICAgICAgICAgICBsZXQgcG9pbnQ6IFZlY3RvcjIgPSB0aGlzLmZyYW1lU291cmNlVG9SZW5kZXIuZ2V0UG9pbnQoX3NvdXJjZSwgcHJvamVjdGlvblJlY3RhbmdsZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBwb2ludDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBwb2ludENsaWVudFRvUmVuZGVyKF9jbGllbnQ6IFZlY3RvcjIpOiBWZWN0b3IyIHtcclxuICAgICAgICAgICAgbGV0IHBvaW50OiBWZWN0b3IyID0gdGhpcy5wb2ludENsaWVudFRvU291cmNlKF9jbGllbnQpO1xyXG4gICAgICAgICAgICBwb2ludCA9IHRoaXMucG9pbnRTb3VyY2VUb1JlbmRlcihwb2ludCk7XHJcbiAgICAgICAgICAgIC8vVE9ETzogd2hlbiBSZW5kZXIgYW5kIFJlbmRlclZpZXdwb3J0IGRldmlhdGUsIGNvbnRpbnVlIHRyYW5zZm9ybWF0aW9uIFxyXG4gICAgICAgICAgICByZXR1cm4gcG9pbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyNlbmRyZWdpb25cclxuXHJcbiAgICAgICAgLy8gI3JlZ2lvbiBFdmVudHMgKHBhc3NpbmcgZnJvbSBjYW52YXMgdG8gdmlld3BvcnQgYW5kIGZyb20gdGhlcmUgaW50byBicmFuY2gpXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0cnVlIGlmIHRoaXMgdmlld3BvcnQgY3VycmVudGx5IGhhcyBmb2N1cyBhbmQgdGh1cyByZWNlaXZlcyBrZXlib2FyZCBldmVudHNcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0IGhhc0ZvY3VzKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICByZXR1cm4gKFZpZXdwb3J0LmZvY3VzID09IHRoaXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTd2l0Y2ggdGhlIHZpZXdwb3J0cyBmb2N1cyBvbiBvciBvZmYuIE9ubHkgb25lIHZpZXdwb3J0IGluIG9uZSBGVURHRSBpbnN0YW5jZSBjYW4gaGF2ZSB0aGUgZm9jdXMsIHRodXMgcmVjZWl2aW5nIGtleWJvYXJkIGV2ZW50cy4gXHJcbiAgICAgICAgICogU28gYSB2aWV3cG9ydCBjdXJyZW50bHkgaGF2aW5nIHRoZSBmb2N1cyB3aWxsIGxvc2UgaXQsIHdoZW4gYW5vdGhlciBvbmUgcmVjZWl2ZXMgaXQuIFRoZSB2aWV3cG9ydHMgZmlyZSBbW0V2ZW50XV1zIGFjY29yZGluZ2x5LlxyXG4gICAgICAgICAqICBcclxuICAgICAgICAgKiBAcGFyYW0gX29uIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzZXRGb2N1cyhfb246IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgICAgICAgaWYgKF9vbikge1xyXG4gICAgICAgICAgICAgICAgaWYgKFZpZXdwb3J0LmZvY3VzID09IHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgaWYgKFZpZXdwb3J0LmZvY3VzKVxyXG4gICAgICAgICAgICAgICAgICAgIFZpZXdwb3J0LmZvY3VzLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KEVWRU5ULkZPQ1VTX09VVCkpO1xyXG4gICAgICAgICAgICAgICAgVmlld3BvcnQuZm9jdXMgPSB0aGlzO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChFVkVOVC5GT0NVU19JTikpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKFZpZXdwb3J0LmZvY3VzICE9IHRoaXMpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoRVZFTlQuRk9DVVNfT1VUKSk7XHJcbiAgICAgICAgICAgICAgICBWaWV3cG9ydC5mb2N1cyA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGUtIC8gQWN0aXZhdGVzIHRoZSBnaXZlbiBwb2ludGVyIGV2ZW50IHRvIGJlIHByb3BhZ2F0ZWQgaW50byB0aGUgdmlld3BvcnQgYXMgRlVER0UtRXZlbnQgXHJcbiAgICAgICAgICogQHBhcmFtIF90eXBlIFxyXG4gICAgICAgICAqIEBwYXJhbSBfb24gXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGFjdGl2YXRlUG9pbnRlckV2ZW50KF90eXBlOiBFVkVOVF9QT0lOVEVSLCBfb246IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5hY3RpdmF0ZUV2ZW50KHRoaXMuY2FudmFzLCBfdHlwZSwgdGhpcy5obmRQb2ludGVyRXZlbnQsIF9vbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERlLSAvIEFjdGl2YXRlcyB0aGUgZ2l2ZW4ga2V5Ym9hcmQgZXZlbnQgdG8gYmUgcHJvcGFnYXRlZCBpbnRvIHRoZSB2aWV3cG9ydCBhcyBGVURHRS1FdmVudFxyXG4gICAgICAgICAqIEBwYXJhbSBfdHlwZSBcclxuICAgICAgICAgKiBAcGFyYW0gX29uIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBhY3RpdmF0ZUtleWJvYXJkRXZlbnQoX3R5cGU6IEVWRU5UX0tFWUJPQVJELCBfb246IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5hY3RpdmF0ZUV2ZW50KHRoaXMuY2FudmFzLm93bmVyRG9jdW1lbnQsIF90eXBlLCB0aGlzLmhuZEtleWJvYXJkRXZlbnQsIF9vbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERlLSAvIEFjdGl2YXRlcyB0aGUgZ2l2ZW4gZHJhZy1kcm9wIGV2ZW50IHRvIGJlIHByb3BhZ2F0ZWQgaW50byB0aGUgdmlld3BvcnQgYXMgRlVER0UtRXZlbnRcclxuICAgICAgICAgKiBAcGFyYW0gX3R5cGUgXHJcbiAgICAgICAgICogQHBhcmFtIF9vbiBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgYWN0aXZhdGVEcmFnRHJvcEV2ZW50KF90eXBlOiBFVkVOVF9EUkFHRFJPUCwgX29uOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGlmIChfdHlwZSA9PSBFVkVOVF9EUkFHRFJPUC5TVEFSVClcclxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzLmRyYWdnYWJsZSA9IF9vbjtcclxuICAgICAgICAgICAgdGhpcy5hY3RpdmF0ZUV2ZW50KHRoaXMuY2FudmFzLCBfdHlwZSwgdGhpcy5obmREcmFnRHJvcEV2ZW50LCBfb24pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZS0gLyBBY3RpdmF0ZXMgdGhlIHdoZWVsIGV2ZW50IHRvIGJlIHByb3BhZ2F0ZWQgaW50byB0aGUgdmlld3BvcnQgYXMgRlVER0UtRXZlbnRcclxuICAgICAgICAgKiBAcGFyYW0gX3R5cGUgXHJcbiAgICAgICAgICogQHBhcmFtIF9vbiBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgYWN0aXZhdGVXaGVlbEV2ZW50KF90eXBlOiBFVkVOVF9XSEVFTCwgX29uOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuYWN0aXZhdGVFdmVudCh0aGlzLmNhbnZhcywgX3R5cGUsIHRoaXMuaG5kV2hlZWxFdmVudCwgX29uKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogSGFuZGxlIGRyYWctZHJvcCBldmVudHMgYW5kIGRpc3BhdGNoIHRvIHZpZXdwb3J0IGFzIEZVREdFLUV2ZW50XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBobmREcmFnRHJvcEV2ZW50OiBFdmVudExpc3RlbmVyID0gKF9ldmVudDogRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgbGV0IF9kcmFnZXZlbnQ6IERyYWdEcm9wRXZlbnTGkiA9IDxEcmFnRHJvcEV2ZW50xpI+X2V2ZW50O1xyXG4gICAgICAgICAgICBzd2l0Y2ggKF9kcmFnZXZlbnQudHlwZSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSBcImRyYWdvdmVyXCI6XHJcbiAgICAgICAgICAgICAgICBjYXNlIFwiZHJvcFwiOlxyXG4gICAgICAgICAgICAgICAgICAgIF9kcmFnZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICBfZHJhZ2V2ZW50LmRhdGFUcmFuc2Zlci5lZmZlY3RBbGxvd2VkID0gXCJub25lXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFwiZHJhZ3N0YXJ0XCI6XHJcbiAgICAgICAgICAgICAgICAgICAgLy8ganVzdCBkdW1teSBkYXRhLCAgdmFsaWQgZGF0YSBzaG91bGQgYmUgc2V0IGluIGhhbmRsZXIgcmVnaXN0ZXJlZCBieSB0aGUgdXNlclxyXG4gICAgICAgICAgICAgICAgICAgIF9kcmFnZXZlbnQuZGF0YVRyYW5zZmVyLnNldERhdGEoXCJ0ZXh0XCIsIFwiSGFsbG9cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogY2hlY2sgaWYgdGhlcmUgaXMgYSBiZXR0ZXIgc29sdXRpb24gdG8gaGlkZSB0aGUgZ2hvc3QgaW1hZ2Ugb2YgdGhlIGRyYWdnYWJsZSBvYmplY3RcclxuICAgICAgICAgICAgICAgICAgICBfZHJhZ2V2ZW50LmRhdGFUcmFuc2Zlci5zZXREcmFnSW1hZ2UobmV3IEltYWdlKCksIDAsIDApO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBldmVudDogRHJhZ0Ryb3BFdmVudMaSID0gbmV3IERyYWdEcm9wRXZlbnTGkihcIsaSXCIgKyBfZXZlbnQudHlwZSwgX2RyYWdldmVudCk7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkQ2FudmFzUG9zaXRpb24oZXZlbnQpO1xyXG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBBZGQgcG9zaXRpb24gb2YgdGhlIHBvaW50ZXIgbWFwcGVkIHRvIGNhbnZhcy1jb29yZGluYXRlcyBhcyBjYW52YXNYLCBjYW52YXNZIHRvIHRoZSBldmVudFxyXG4gICAgICAgICAqIEBwYXJhbSBldmVudFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgYWRkQ2FudmFzUG9zaXRpb24oZXZlbnQ6IFBvaW50ZXJFdmVudMaSIHwgRHJhZ0Ryb3BFdmVudMaSKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGV2ZW50LmNhbnZhc1ggPSB0aGlzLmNhbnZhcy53aWR0aCAqIGV2ZW50LnBvaW50ZXJYIC8gZXZlbnQuY2xpZW50UmVjdC53aWR0aDtcclxuICAgICAgICAgICAgZXZlbnQuY2FudmFzWSA9IHRoaXMuY2FudmFzLmhlaWdodCAqIGV2ZW50LnBvaW50ZXJZIC8gZXZlbnQuY2xpZW50UmVjdC5oZWlnaHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEhhbmRsZSBwb2ludGVyIGV2ZW50cyBhbmQgZGlzcGF0Y2ggdG8gdmlld3BvcnQgYXMgRlVER0UtRXZlbnRcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIGhuZFBvaW50ZXJFdmVudDogRXZlbnRMaXN0ZW5lciA9IChfZXZlbnQ6IEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBldmVudDogUG9pbnRlckV2ZW50xpIgPSBuZXcgUG9pbnRlckV2ZW50xpIoXCLGklwiICsgX2V2ZW50LnR5cGUsIDxQb2ludGVyRXZlbnTGkj5fZXZlbnQpO1xyXG4gICAgICAgICAgICB0aGlzLmFkZENhbnZhc1Bvc2l0aW9uKGV2ZW50KTtcclxuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogSGFuZGxlIGtleWJvYXJkIGV2ZW50cyBhbmQgZGlzcGF0Y2ggdG8gdmlld3BvcnQgYXMgRlVER0UtRXZlbnQsIGlmIHRoZSB2aWV3cG9ydCBoYXMgdGhlIGZvY3VzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBobmRLZXlib2FyZEV2ZW50OiBFdmVudExpc3RlbmVyID0gKF9ldmVudDogRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmhhc0ZvY3VzKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICBsZXQgZXZlbnQ6IEtleWJvYXJkRXZlbnTGkiA9IG5ldyBLZXlib2FyZEV2ZW50xpIoXCLGklwiICsgX2V2ZW50LnR5cGUsIDxLZXlib2FyZEV2ZW50xpI+X2V2ZW50KTtcclxuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogSGFuZGxlIHdoZWVsIGV2ZW50IGFuZCBkaXNwYXRjaCB0byB2aWV3cG9ydCBhcyBGVURHRS1FdmVudFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgaG5kV2hlZWxFdmVudDogRXZlbnRMaXN0ZW5lciA9IChfZXZlbnQ6IEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBldmVudDogV2hlZWxFdmVudMaSID0gbmV3IFdoZWVsRXZlbnTGkihcIsaSXCIgKyBfZXZlbnQudHlwZSwgPFdoZWVsRXZlbnTGkj5fZXZlbnQpO1xyXG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBhY3RpdmF0ZUV2ZW50KF90YXJnZXQ6IEV2ZW50VGFyZ2V0LCBfdHlwZTogc3RyaW5nLCBfaGFuZGxlcjogRXZlbnRMaXN0ZW5lciwgX29uOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgICAgIF90eXBlID0gX3R5cGUuc2xpY2UoMSk7IC8vIGNoaXAgdGhlIMaSbG9yZW50aW5cclxuICAgICAgICAgICAgaWYgKF9vbilcclxuICAgICAgICAgICAgICAgIF90YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihfdHlwZSwgX2hhbmRsZXIpO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICBfdGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoX3R5cGUsIF9oYW5kbGVyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgaG5kQ29tcG9uZW50RXZlbnQoX2V2ZW50OiBFdmVudCk6IHZvaWQge1xyXG4gICAgICAgICAgICBEZWJ1Zy5sb2coX2V2ZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gI2VuZHJlZ2lvblxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDb2xsZWN0IGFsbCBsaWdodHMgaW4gdGhlIGJyYW5jaCB0byBwYXNzIHRvIHNoYWRlcnNcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIGNvbGxlY3RMaWdodHMoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IG1ha2UgcHJpdmF0ZVxyXG4gICAgICAgICAgICB0aGlzLmxpZ2h0cyA9IG5ldyBNYXAoKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgbm9kZSBvZiB0aGlzLmJyYW5jaC5icmFuY2gpIHtcclxuICAgICAgICAgICAgICAgIGxldCBjbXBMaWdodHM6IENvbXBvbmVudExpZ2h0W10gPSBub2RlLmdldENvbXBvbmVudHMoQ29tcG9uZW50TGlnaHQpO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgY21wTGlnaHQgb2YgY21wTGlnaHRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHR5cGU6IHN0cmluZyA9IGNtcExpZ2h0LmdldExpZ2h0KCkudHlwZTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbGlnaHRzT2ZUeXBlOiBDb21wb25lbnRMaWdodFtdID0gdGhpcy5saWdodHMuZ2V0KHR5cGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghbGlnaHRzT2ZUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpZ2h0c09mVHlwZSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxpZ2h0cy5zZXQodHlwZSwgbGlnaHRzT2ZUeXBlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgbGlnaHRzT2ZUeXBlLnB1c2goY21wTGlnaHQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENyZWF0ZXMgYW4gb3V0cHV0c3RyaW5nIGFzIHZpc3VhbCByZXByZXNlbnRhdGlvbiBvZiB0aGlzIHZpZXdwb3J0cyBzY2VuZWdyYXBoLiBDYWxsZWQgZm9yIHRoZSBwYXNzZWQgbm9kZSBhbmQgcmVjdXJzaXZlIGZvciBhbGwgaXRzIGNoaWxkcmVuLlxyXG4gICAgICAgICAqIEBwYXJhbSBfZnVkZ2VOb2RlIFRoZSBub2RlIHRvIGNyZWF0ZSBhIHNjZW5lZ3JhcGhlbnRyeSBmb3IuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBjcmVhdGVTY2VuZUdyYXBoKF9mdWRnZU5vZGU6IE5vZGUpOiBzdHJpbmcge1xyXG4gICAgICAgICAgICAvLyBUT0RPOiBtb3ZlIHRvIGRlYnVnLWNsYXNzXHJcbiAgICAgICAgICAgIGxldCBvdXRwdXQ6IHN0cmluZyA9IFwiXCI7XHJcbiAgICAgICAgICAgIGZvciAobGV0IG5hbWUgaW4gX2Z1ZGdlTm9kZS5nZXRDaGlsZHJlbigpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY2hpbGQ6IE5vZGUgPSBfZnVkZ2VOb2RlLmdldENoaWxkcmVuKClbbmFtZV07XHJcbiAgICAgICAgICAgICAgICBvdXRwdXQgKz0gXCJcXG5cIjtcclxuICAgICAgICAgICAgICAgIGxldCBjdXJyZW50OiBOb2RlID0gY2hpbGQ7XHJcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudC5nZXRQYXJlbnQoKSAmJiBjdXJyZW50LmdldFBhcmVudCgpLmdldFBhcmVudCgpKVxyXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dCArPSBcInxcIjtcclxuICAgICAgICAgICAgICAgIHdoaWxlIChjdXJyZW50LmdldFBhcmVudCgpICYmIGN1cnJlbnQuZ2V0UGFyZW50KCkuZ2V0UGFyZW50KCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBvdXRwdXQgKz0gXCIgICBcIjtcclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50ID0gY3VycmVudC5nZXRQYXJlbnQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIG91dHB1dCArPSBcIictLVwiO1xyXG5cclxuICAgICAgICAgICAgICAgIG91dHB1dCArPSBjaGlsZC5uYW1lO1xyXG4gICAgICAgICAgICAgICAgb3V0cHV0ICs9IHRoaXMuY3JlYXRlU2NlbmVHcmFwaChjaGlsZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG91dHB1dDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIE1hcEV2ZW50VHlwZVRvTGlzdGVuZXIge1xyXG4gICAgICAgIFtldmVudFR5cGU6IHN0cmluZ106IEV2ZW50TGlzdGVuZXJbXTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFR5cGVzIG9mIGV2ZW50cyBzcGVjaWZpYyB0byBGdWRnZSwgaW4gYWRkaXRpb24gdG8gdGhlIHN0YW5kYXJkIERPTS9Ccm93c2VyLVR5cGVzIGFuZCBjdXN0b20gc3RyaW5nc1xyXG4gICAgICovXHJcbiAgICBleHBvcnQgY29uc3QgZW51bSBFVkVOVCB7XHJcbiAgICAgICAgLyoqIGRpc3BhdGNoZWQgdG8gdGFyZ2V0cyByZWdpc3RlcmVkIGF0IFtbTG9vcF1dLCB3aGVuIHJlcXVlc3RlZCBhbmltYXRpb24gZnJhbWUgc3RhcnRzICovXHJcbiAgICAgICAgTE9PUF9GUkFNRSA9IFwibG9vcEZyYW1lXCIsXHJcbiAgICAgICAgLyoqIGRpc3BhdGNoZWQgdG8gYSBbW0NvbXBvbmVudF1dIHdoZW4gaXRzIGJlaW5nIGFkZGVkIHRvIGEgW1tOb2RlXV0gKi9cclxuICAgICAgICBDT01QT05FTlRfQUREID0gXCJjb21wb25lbnRBZGRcIixcclxuICAgICAgICAvKiogZGlzcGF0Y2hlZCB0byBhIFtbQ29tcG9uZW50XV0gd2hlbiBpdHMgYmVpbmcgcmVtb3ZlZCBmcm9tIGEgW1tOb2RlXV0gKi9cclxuICAgICAgICBDT01QT05FTlRfUkVNT1ZFID0gXCJjb21wb25lbnRSZW1vdmVcIixcclxuICAgICAgICAvKiogZGlzcGF0Y2hlZCB0byBhIFtbQ29tcG9uZW50XV0gd2hlbiBpdHMgYmVpbmcgYWN0aXZhdGVkICovXHJcbiAgICAgICAgQ09NUE9ORU5UX0FDVElWQVRFID0gXCJjb21wb25lbnRBY3RpdmF0ZVwiLFxyXG4gICAgICAgIC8qKiBkaXNwYXRjaGVkIHRvIGEgW1tDb21wb25lbnRdXSB3aGVuIGl0cyBiZWluZyBkZWFjdGl2YXRlZCAqL1xyXG4gICAgICAgIENPTVBPTkVOVF9ERUFDVElWQVRFID0gXCJjb21wb25lbnREZWFjdGl2YXRlXCIsXHJcbiAgICAgICAgLyoqIGRpc3BhdGNoZWQgdG8gYSBjaGlsZCBbW05vZGVdXSBhbmQgaXRzIGFuY2VzdG9ycyBhZnRlciBpdCB3YXMgYXBwZW5kZWQgdG8gYSBwYXJlbnQgKi9cclxuICAgICAgICBDSElMRF9BUFBFTkQgPSBcImNoaWxkQWRkXCIsXHJcbiAgICAgICAgLyoqIGRpc3BhdGNoZWQgdG8gYSBjaGlsZCBbW05vZGVdXSBhbmQgaXRzIGFuY2VzdG9ycyBqdXN0IGJlZm9yZSBpdHMgYmVpbmcgcmVtb3ZlZCBmcm9tIGl0cyBwYXJlbnQgKi9cclxuICAgICAgICBDSElMRF9SRU1PVkUgPSBcImNoaWxkUmVtb3ZlXCIsXHJcbiAgICAgICAgLyoqIGRpc3BhdGNoZWQgdG8gYSBbW011dGFibGVdXSB3aGVuIGl0cyBiZWluZyBtdXRhdGVkICovXHJcbiAgICAgICAgTVVUQVRFID0gXCJtdXRhdGVcIixcclxuICAgICAgICAvKiogZGlzcGF0Y2hlZCB0byBbW1ZpZXdwb3J0XV0gd2hlbiBpdCBnZXRzIHRoZSBmb2N1cyB0byByZWNlaXZlIGtleWJvYXJkIGlucHV0ICovXHJcbiAgICAgICAgRk9DVVNfSU4gPSBcImZvY3VzaW5cIixcclxuICAgICAgICAvKiogZGlzcGF0Y2hlZCB0byBbW1ZpZXdwb3J0XV0gd2hlbiBpdCBsb3NlcyB0aGUgZm9jdXMgdG8gcmVjZWl2ZSBrZXlib2FyZCBpbnB1dCAqL1xyXG4gICAgICAgIEZPQ1VTX09VVCA9IFwiZm9jdXNvdXRcIixcclxuICAgICAgICAvKiogZGlzcGF0Y2hlZCB0byBbW05vZGVdXSB3aGVuIGl0J3MgZG9uZSBzZXJpYWxpemluZyAqL1xyXG4gICAgICAgIE5PREVfU0VSSUFMSVpFRCA9IFwibm9kZVNlcmlhbGl6ZWRcIixcclxuICAgICAgICAvKiogZGlzcGF0Y2hlZCB0byBbW05vZGVdXSB3aGVuIGl0J3MgZG9uZSBkZXNlcmlhbGl6aW5nLCBzbyBhbGwgY29tcG9uZW50cywgY2hpbGRyZW4gYW5kIGF0dHJpYnV0ZXMgYXJlIGF2YWlsYWJsZSAqL1xyXG4gICAgICAgIE5PREVfREVTRVJJQUxJWkVEID0gXCJub2RlRGVzZXJpYWxpemVkXCIsXHJcbiAgICAgICAgLyoqIGRpc3BhdGNoZWQgdG8gW1tOb2RlUmVzb3VyY2VJbnN0YW5jZV1dIHdoZW4gaXQncyBjb250ZW50IGlzIHNldCBhY2NvcmRpbmcgdG8gYSBzZXJpYWxpemF0aW9uIG9mIGEgW1tOb2RlUmVzb3VyY2VdXSAgKi9cclxuICAgICAgICBOT0RFUkVTT1VSQ0VfSU5TVEFOVElBVEVEID0gXCJub2RlUmVzb3VyY2VJbnN0YW50aWF0ZWRcIixcclxuICAgICAgICAvKiogZGlzcGF0Y2hlZCB0byBbW1RpbWVdXSB3aGVuIGl0J3Mgc2NhbGluZyBjaGFuZ2VkICAqL1xyXG4gICAgICAgIFRJTUVfU0NBTEVEID0gXCJ0aW1lU2NhbGVkXCIsXHJcbiAgICAgICAgLyoqIGRpc3BhdGNoZWQgdG8gW1tGaWxlSW9dXSB3aGVuIGEgbGlzdCBvZiBmaWxlcyBoYXMgYmVlbiBsb2FkZWQgICovXHJcbiAgICAgICAgRklMRV9MT0FERUQgPSBcImZpbGVMb2FkZWRcIixcclxuICAgICAgICAvKiogZGlzcGF0Y2hlZCB0byBbW0ZpbGVJb11dIHdoZW4gYSBsaXN0IG9mIGZpbGVzIGhhcyBiZWVuIHNhdmVkICovXHJcbiAgICAgICAgRklMRV9TQVZFRCA9IFwiZmlsZVNhdmVkXCJcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY29uc3QgZW51bSBFVkVOVF9QT0lOVEVSIHtcclxuICAgICAgICBVUCA9IFwixpJwb2ludGVydXBcIixcclxuICAgICAgICBET1dOID0gXCLGknBvaW50ZXJkb3duXCJcclxuICAgIH1cclxuICAgIGV4cG9ydCBjb25zdCBlbnVtIEVWRU5UX0RSQUdEUk9QIHtcclxuICAgICAgICBEUkFHID0gXCLGkmRyYWdcIixcclxuICAgICAgICBEUk9QID0gXCLGkmRyb3BcIixcclxuICAgICAgICBTVEFSVCA9IFwixpJkcmFnc3RhcnRcIixcclxuICAgICAgICBFTkQgPSBcIsaSZHJhZ2VuZFwiLFxyXG4gICAgICAgIE9WRVIgPSBcIsaSZHJhZ292ZXJcIlxyXG4gICAgfVxyXG4gICAgZXhwb3J0IGNvbnN0IGVudW0gRVZFTlRfV0hFRUwge1xyXG4gICAgICAgIFdIRUVMID0gXCLGkndoZWVsXCJcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgUG9pbnRlckV2ZW50xpIgZXh0ZW5kcyBQb2ludGVyRXZlbnQge1xyXG4gICAgICAgIHB1YmxpYyBwb2ludGVyWDogbnVtYmVyO1xyXG4gICAgICAgIHB1YmxpYyBwb2ludGVyWTogbnVtYmVyO1xyXG4gICAgICAgIHB1YmxpYyBjYW52YXNYOiBudW1iZXI7XHJcbiAgICAgICAgcHVibGljIGNhbnZhc1k6IG51bWJlcjtcclxuICAgICAgICBwdWJsaWMgY2xpZW50UmVjdDogQ2xpZW50UmVjdDtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IodHlwZTogc3RyaW5nLCBfZXZlbnQ6IFBvaW50ZXJFdmVudMaSKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKHR5cGUsIF9ldmVudCk7XHJcbiAgICAgICAgICAgIGxldCB0YXJnZXQ6IEhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50Pl9ldmVudC50YXJnZXQ7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpZW50UmVjdCA9IHRhcmdldC5nZXRDbGllbnRSZWN0cygpWzBdO1xyXG4gICAgICAgICAgICB0aGlzLnBvaW50ZXJYID0gX2V2ZW50LmNsaWVudFggLSB0aGlzLmNsaWVudFJlY3QubGVmdDtcclxuICAgICAgICAgICAgdGhpcy5wb2ludGVyWSA9IF9ldmVudC5jbGllbnRZIC0gdGhpcy5jbGllbnRSZWN0LnRvcDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIERyYWdEcm9wRXZlbnTGkiBleHRlbmRzIERyYWdFdmVudCB7XHJcbiAgICAgICAgcHVibGljIHBvaW50ZXJYOiBudW1iZXI7XHJcbiAgICAgICAgcHVibGljIHBvaW50ZXJZOiBudW1iZXI7XHJcbiAgICAgICAgcHVibGljIGNhbnZhc1g6IG51bWJlcjtcclxuICAgICAgICBwdWJsaWMgY2FudmFzWTogbnVtYmVyO1xyXG4gICAgICAgIHB1YmxpYyBjbGllbnRSZWN0OiBDbGllbnRSZWN0O1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3Rvcih0eXBlOiBzdHJpbmcsIF9ldmVudDogRHJhZ0Ryb3BFdmVudMaSKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKHR5cGUsIF9ldmVudCk7XHJcbiAgICAgICAgICAgIGxldCB0YXJnZXQ6IEhUTUxFbGVtZW50ID0gPEhUTUxFbGVtZW50Pl9ldmVudC50YXJnZXQ7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpZW50UmVjdCA9IHRhcmdldC5nZXRDbGllbnRSZWN0cygpWzBdO1xyXG4gICAgICAgICAgICB0aGlzLnBvaW50ZXJYID0gX2V2ZW50LmNsaWVudFggLSB0aGlzLmNsaWVudFJlY3QubGVmdDtcclxuICAgICAgICAgICAgdGhpcy5wb2ludGVyWSA9IF9ldmVudC5jbGllbnRZIC0gdGhpcy5jbGllbnRSZWN0LnRvcDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIFdoZWVsRXZlbnTGkiBleHRlbmRzIFdoZWVsRXZlbnQge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKHR5cGU6IHN0cmluZywgX2V2ZW50OiBXaGVlbEV2ZW50xpIpIHtcclxuICAgICAgICAgICAgc3VwZXIodHlwZSwgX2V2ZW50KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBCYXNlIGNsYXNzIGZvciBFdmVudFRhcmdldCBzaW5nbGV0b25zLCB3aGljaCBhcmUgZml4ZWQgZW50aXRpZXMgaW4gdGhlIHN0cnVjdHVyZSBvZiBGdWRnZSwgc3VjaCBhcyB0aGUgY29yZSBsb29wIFxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgRXZlbnRUYXJnZXRTdGF0aWMgZXh0ZW5kcyBFdmVudFRhcmdldCB7XHJcbiAgICAgICAgcHJvdGVjdGVkIHN0YXRpYyB0YXJnZXRTdGF0aWM6IEV2ZW50VGFyZ2V0U3RhdGljID0gbmV3IEV2ZW50VGFyZ2V0U3RhdGljKCk7XHJcblxyXG4gICAgICAgIHByb3RlY3RlZCBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgYWRkRXZlbnRMaXN0ZW5lcihfdHlwZTogc3RyaW5nLCBfaGFuZGxlcjogRXZlbnRMaXN0ZW5lcik6IHZvaWQge1xyXG4gICAgICAgICAgICBFdmVudFRhcmdldFN0YXRpYy50YXJnZXRTdGF0aWMuYWRkRXZlbnRMaXN0ZW5lcihfdHlwZSwgX2hhbmRsZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHJlbW92ZUV2ZW50TGlzdGVuZXIoX3R5cGU6IHN0cmluZywgX2hhbmRsZXI6IEV2ZW50TGlzdGVuZXIpOiB2b2lkIHtcclxuICAgICAgICAgICAgRXZlbnRUYXJnZXRTdGF0aWMudGFyZ2V0U3RhdGljLnJlbW92ZUV2ZW50TGlzdGVuZXIoX3R5cGUsIF9oYW5kbGVyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBkaXNwYXRjaEV2ZW50KF9ldmVudDogRXZlbnQpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgRXZlbnRUYXJnZXRTdGF0aWMudGFyZ2V0U3RhdGljLmRpc3BhdGNoRXZlbnQoX2V2ZW50KTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICBleHBvcnQgY2xhc3MgS2V5Ym9hcmRFdmVudMaSIGV4dGVuZHMgS2V5Ym9hcmRFdmVudCB7XHJcbiAgICAgICAgY29uc3RydWN0b3IodHlwZTogc3RyaW5nLCBfZXZlbnQ6IEtleWJvYXJkRXZlbnTGkikge1xyXG4gICAgICAgICAgICBzdXBlcih0eXBlLCBfZXZlbnQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE1hcHBpbmdzIG9mIHN0YW5kYXJkIERPTS9Ccm93c2VyLUV2ZW50cyBhcyBwYXNzZWQgZnJvbSBhIGNhbnZhcyB0byB0aGUgdmlld3BvcnRcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNvbnN0IGVudW0gRVZFTlRfS0VZQk9BUkQge1xyXG4gICAgICAgIFVQID0gXCLGkmtleXVwXCIsXHJcbiAgICAgICAgRE9XTiA9IFwixpJrZXlkb3duXCJcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBjb2RlcyBzZW50IGZyb20gYSBzdGFuZGFyZCBlbmdsaXNoIGtleWJvYXJkIGxheW91dFxyXG4gICAgICovXHJcbiAgICBleHBvcnQgZW51bSBLRVlCT0FSRF9DT0RFIHtcclxuICAgICAgICBBID0gXCJLZXlBXCIsXHJcbiAgICAgICAgQiA9IFwiS2V5QlwiLFxyXG4gICAgICAgIEMgPSBcIktleUNcIixcclxuICAgICAgICBEID0gXCJLZXlEXCIsXHJcbiAgICAgICAgRSA9IFwiS2V5RVwiLFxyXG4gICAgICAgIEYgPSBcIktleUZcIixcclxuICAgICAgICBHID0gXCJLZXlHXCIsXHJcbiAgICAgICAgSCA9IFwiS2V5SFwiLFxyXG4gICAgICAgIEkgPSBcIktleUlcIixcclxuICAgICAgICBKID0gXCJLZXlKXCIsXHJcbiAgICAgICAgSyA9IFwiS2V5S1wiLFxyXG4gICAgICAgIEwgPSBcIktleUxcIixcclxuICAgICAgICBNID0gXCJLZXlNXCIsXHJcbiAgICAgICAgTiA9IFwiS2V5TlwiLFxyXG4gICAgICAgIE8gPSBcIktleU9cIixcclxuICAgICAgICBQID0gXCJLZXlQXCIsXHJcbiAgICAgICAgUSA9IFwiS2V5UVwiLFxyXG4gICAgICAgIFIgPSBcIktleVJcIixcclxuICAgICAgICBTID0gXCJLZXlTXCIsXHJcbiAgICAgICAgVCA9IFwiS2V5VFwiLFxyXG4gICAgICAgIFUgPSBcIktleVVcIixcclxuICAgICAgICBWID0gXCJLZXlWXCIsXHJcbiAgICAgICAgVyA9IFwiS2V5V1wiLFxyXG4gICAgICAgIFggPSBcIktleVhcIixcclxuICAgICAgICBZID0gXCJLZXlZXCIsXHJcbiAgICAgICAgWiA9IFwiS2V5WlwiLFxyXG4gICAgICAgIEVTQyA9IFwiRXNjYXBlXCIsXHJcbiAgICAgICAgWkVSTyA9IFwiRGlnaXQwXCIsXHJcbiAgICAgICAgT05FID0gXCJEaWdpdDFcIixcclxuICAgICAgICBUV08gPSBcIkRpZ2l0MlwiLFxyXG4gICAgICAgIFRIUkVFID0gXCJEaWdpdDNcIixcclxuICAgICAgICBGT1VSID0gXCJEaWdpdDRcIixcclxuICAgICAgICBGSVZFID0gXCJEaWdpdDVcIixcclxuICAgICAgICBTSVggPSBcIkRpZ2l0NlwiLFxyXG4gICAgICAgIFNFVkVOID0gXCJEaWdpdDdcIixcclxuICAgICAgICBFSUdIVCA9IFwiRGlnaXQ4XCIsXHJcbiAgICAgICAgTklORSA9IFwiRGlnaXQ5XCIsXHJcbiAgICAgICAgTUlOVVMgPSBcIk1pbnVzXCIsXHJcbiAgICAgICAgRVFVQUwgPSBcIkVxdWFsXCIsXHJcbiAgICAgICAgQkFDS1NQQUNFID0gXCJCYWNrc3BhY2VcIixcclxuICAgICAgICBUQUJVTEFUT1IgPSBcIlRhYlwiLFxyXG4gICAgICAgIEJSQUNLRVRfTEVGVCA9IFwiQnJhY2tldExlZnRcIixcclxuICAgICAgICBCUkFDS0VUX1JJR0hUID0gXCJCcmFja2V0UmlnaHRcIixcclxuICAgICAgICBFTlRFUiA9IFwiRW50ZXJcIixcclxuICAgICAgICBDVFJMX0xFRlQgPSBcIkNvbnRyb2xMZWZ0XCIsXHJcbiAgICAgICAgU0VNSUNPTE9OID0gXCJTZW1pY29sb25cIixcclxuICAgICAgICBRVU9URSA9IFwiUXVvdGVcIixcclxuICAgICAgICBCQUNLX1FVT1RFID0gXCJCYWNrcXVvdGVcIixcclxuICAgICAgICBTSElGVF9MRUZUID0gXCJTaGlmdExlZnRcIixcclxuICAgICAgICBCQUNLU0xBU0ggPSBcIkJhY2tzbGFzaFwiLFxyXG4gICAgICAgIENPTU1BID0gXCJDb21tYVwiLFxyXG4gICAgICAgIFBFUklPRCA9IFwiUGVyaW9kXCIsXHJcbiAgICAgICAgU0xBU0ggPSBcIlNsYXNoXCIsXHJcbiAgICAgICAgU0hJRlRfUklHSFQgPSBcIlNoaWZ0UmlnaHRcIixcclxuICAgICAgICBOVU1QQURfTVVMVElQTFkgPSBcIk51bXBhZE11bHRpcGx5XCIsXHJcbiAgICAgICAgQUxUX0xFRlQgPSBcIkFsdExlZnRcIixcclxuICAgICAgICBTUEFDRSA9IFwiU3BhY2VcIixcclxuICAgICAgICBDQVBTX0xPQ0sgPSBcIkNhcHNMb2NrXCIsXHJcbiAgICAgICAgRjEgPSBcIkYxXCIsXHJcbiAgICAgICAgRjIgPSBcIkYyXCIsXHJcbiAgICAgICAgRjMgPSBcIkYzXCIsXHJcbiAgICAgICAgRjQgPSBcIkY0XCIsXHJcbiAgICAgICAgRjUgPSBcIkY1XCIsXHJcbiAgICAgICAgRjYgPSBcIkY2XCIsXHJcbiAgICAgICAgRjcgPSBcIkY3XCIsXHJcbiAgICAgICAgRjggPSBcIkY4XCIsXHJcbiAgICAgICAgRjkgPSBcIkY5XCIsXHJcbiAgICAgICAgRjEwID0gXCJGMTBcIixcclxuICAgICAgICBQQVVTRSA9IFwiUGF1c2VcIixcclxuICAgICAgICBTQ1JPTExfTE9DSyA9IFwiU2Nyb2xsTG9ja1wiLFxyXG4gICAgICAgIE5VTVBBRDcgPSBcIk51bXBhZDdcIixcclxuICAgICAgICBOVU1QQUQ4ID0gXCJOdW1wYWQ4XCIsXHJcbiAgICAgICAgTlVNUEFEOSA9IFwiTnVtcGFkOVwiLFxyXG4gICAgICAgIE5VTVBBRF9TVUJUUkFDVCA9IFwiTnVtcGFkU3VidHJhY3RcIixcclxuICAgICAgICBOVU1QQUQ0ID0gXCJOdW1wYWQ0XCIsXHJcbiAgICAgICAgTlVNUEFENSA9IFwiTnVtcGFkNVwiLFxyXG4gICAgICAgIE5VTVBBRDYgPSBcIk51bXBhZDZcIixcclxuICAgICAgICBOVU1QQURfQUREID0gXCJOdW1wYWRBZGRcIixcclxuICAgICAgICBOVU1QQUQxID0gXCJOdW1wYWQxXCIsXHJcbiAgICAgICAgTlVNUEFEMiA9IFwiTnVtcGFkMlwiLFxyXG4gICAgICAgIE5VTVBBRDMgPSBcIk51bXBhZDNcIixcclxuICAgICAgICBOVU1QQUQwID0gXCJOdW1wYWQwXCIsXHJcbiAgICAgICAgTlVNUEFEX0RFQ0lNQUwgPSBcIk51bXBhZERlY2ltYWxcIixcclxuICAgICAgICBQUklOVF9TQ1JFRU4gPSBcIlByaW50U2NyZWVuXCIsXHJcbiAgICAgICAgSU5UTF9CQUNLX1NMQVNIID0gXCJJbnRsQmFja1NsYXNoXCIsXHJcbiAgICAgICAgRjExID0gXCJGMTFcIixcclxuICAgICAgICBGMTIgPSBcIkYxMlwiLFxyXG4gICAgICAgIE5VTVBBRF9FUVVBTCA9IFwiTnVtcGFkRXF1YWxcIixcclxuICAgICAgICBGMTMgPSBcIkYxM1wiLFxyXG4gICAgICAgIEYxNCA9IFwiRjE0XCIsXHJcbiAgICAgICAgRjE1ID0gXCJGMTVcIixcclxuICAgICAgICBGMTYgPSBcIkYxNlwiLFxyXG4gICAgICAgIEYxNyA9IFwiRjE3XCIsXHJcbiAgICAgICAgRjE4ID0gXCJGMThcIixcclxuICAgICAgICBGMTkgPSBcIkYxOVwiLFxyXG4gICAgICAgIEYyMCA9IFwiRjIwXCIsXHJcbiAgICAgICAgRjIxID0gXCJGMjFcIixcclxuICAgICAgICBGMjIgPSBcIkYyMlwiLFxyXG4gICAgICAgIEYyMyA9IFwiRjIzXCIsXHJcbiAgICAgICAgRjI0ID0gXCJGMjRcIixcclxuICAgICAgICBLQU5BX01PREUgPSBcIkthbmFNb2RlXCIsXHJcbiAgICAgICAgTEFORzIgPSBcIkxhbmcyXCIsXHJcbiAgICAgICAgTEFORzEgPSBcIkxhbmcxXCIsXHJcbiAgICAgICAgSU5UTF9STyA9IFwiSW50bFJvXCIsXHJcbiAgICAgICAgQ09OVkVSVCA9IFwiQ29udmVydFwiLFxyXG4gICAgICAgIE5PTl9DT05WRVJUID0gXCJOb25Db252ZXJ0XCIsXHJcbiAgICAgICAgSU5UTF9ZRU4gPSBcIkludGxZZW5cIixcclxuICAgICAgICBOVU1QQURfQ09NTUEgPSBcIk51bXBhZENvbW1hXCIsXHJcbiAgICAgICAgVU5ETyA9IFwiVW5kb1wiLFxyXG4gICAgICAgIFBBU1RFID0gXCJQYXN0ZVwiLFxyXG4gICAgICAgIE1FRElBX1RSQUNLX1BSRVZJT1VTID0gXCJNZWRpYVRyYWNrUHJldmlvdXNcIixcclxuICAgICAgICBDVVQgPSBcIkN1dFwiLFxyXG4gICAgICAgIENPUFkgPSBcIkNvcHlcIixcclxuICAgICAgICBNRURJQV9UUkFDS19ORVhUID0gXCJNZWRpYVRyYWNrTmV4dFwiLFxyXG4gICAgICAgIE5VTVBBRF9FTlRFUiA9IFwiTnVtcGFkRW50ZXJcIixcclxuICAgICAgICBDVFJMX1JJR0hUID0gXCJDb250cm9sUmlnaHRcIixcclxuICAgICAgICBBVURJT19WT0xVTUVfTVVURSA9IFwiQXVkaW9Wb2x1bWVNdXRlXCIsXHJcbiAgICAgICAgTEFVTkNIX0FQUDIgPSBcIkxhdW5jaEFwcDJcIixcclxuICAgICAgICBNRURJQV9QTEFZX1BBVVNFID0gXCJNZWRpYVBsYXlQYXVzZVwiLFxyXG4gICAgICAgIE1FRElBX1NUT1AgPSBcIk1lZGlhU3RvcFwiLFxyXG4gICAgICAgIEVKRUNUID0gXCJFamVjdFwiLFxyXG4gICAgICAgIEFVRElPX1ZPTFVNRV9ET1dOID0gXCJBdWRpb1ZvbHVtZURvd25cIixcclxuICAgICAgICBWT0xVTUVfRE9XTiA9IFwiVm9sdW1lRG93blwiLFxyXG4gICAgICAgIEFVRElPX1ZPTFVNRV9VUCA9IFwiQXVkaW9Wb2x1bWVVcFwiLFxyXG4gICAgICAgIFZPTFVNRV9VUCA9IFwiVm9sdW1lVXBcIixcclxuICAgICAgICBCUk9XU0VSX0hPTUUgPSBcIkJyb3dzZXJIb21lXCIsXHJcbiAgICAgICAgTlVNUEFEX0RJVklERSA9IFwiTnVtcGFkRGl2aWRlXCIsXHJcbiAgICAgICAgQUxUX1JJR0hUID0gXCJBbHRSaWdodFwiLFxyXG4gICAgICAgIEhFTFAgPSBcIkhlbHBcIixcclxuICAgICAgICBOVU1fTE9DSyA9IFwiTnVtTG9ja1wiLFxyXG4gICAgICAgIEhPTUUgPSBcIkhvbWVcIixcclxuICAgICAgICBBUlJPV19VUCA9IFwiQXJyb3dVcFwiLFxyXG4gICAgICAgIEFSUk9XX1JJR0hUID0gXCJBcnJvd1JpZ2h0XCIsXHJcbiAgICAgICAgQVJST1dfRE9XTiA9IFwiQXJyb3dEb3duXCIsXHJcbiAgICAgICAgQVJST1dfTEVGVCA9IFwiQXJyb3dMZWZ0XCIsXHJcbiAgICAgICAgRU5EID0gXCJFbmRcIixcclxuICAgICAgICBQQUdFX1VQID0gXCJQYWdlVXBcIixcclxuICAgICAgICBQQUdFX0RPV04gPSBcIlBhZ2VEb3duXCIsXHJcbiAgICAgICAgSU5TRVJUID0gXCJJbnNlcnRcIixcclxuICAgICAgICBERUxFVEUgPSBcIkRlbGV0ZVwiLFxyXG4gICAgICAgIE1FVEFfTEVGVCA9IFwiTWV0YV9MZWZ0XCIsXHJcbiAgICAgICAgT1NfTEVGVCA9IFwiT1NMZWZ0XCIsXHJcbiAgICAgICAgTUVUQV9SSUdIVCA9IFwiTWV0YVJpZ2h0XCIsXHJcbiAgICAgICAgT1NfUklHSFQgPSBcIk9TUmlnaHRcIixcclxuICAgICAgICBDT05URVhUX01FTlUgPSBcIkNvbnRleHRNZW51XCIsXHJcbiAgICAgICAgUE9XRVIgPSBcIlBvd2VyXCIsXHJcbiAgICAgICAgQlJPV1NFUl9TRUFSQ0ggPSBcIkJyb3dzZXJTZWFyY2hcIixcclxuICAgICAgICBCUk9XU0VSX0ZBVk9SSVRFUyA9IFwiQnJvd3NlckZhdm9yaXRlc1wiLFxyXG4gICAgICAgIEJST1dTRVJfUkVGUkVTSCA9IFwiQnJvd3NlclJlZnJlc2hcIixcclxuICAgICAgICBCUk9XU0VSX1NUT1AgPSBcIkJyb3dzZXJTdG9wXCIsXHJcbiAgICAgICAgQlJPV1NFUl9GT1JXQVJEID0gXCJCcm93c2VyRm9yd2FyZFwiLFxyXG4gICAgICAgIEJST1dTRVJfQkFDSyA9IFwiQnJvd3NlckJhY2tcIixcclxuICAgICAgICBMQVVOQ0hfQVBQMSA9IFwiTGF1bmNoQXBwMVwiLFxyXG4gICAgICAgIExBVU5DSF9NQUlMID0gXCJMYXVuY2hNYWlsXCIsXHJcbiAgICAgICAgTEFVTkNIX01FRElBX1BMQVlFUiA9IFwiTGF1bmNoTWVkaWFQbGF5ZXJcIixcclxuXHJcbiAgICAgICAgLy9tYWMgYnJpbmdzIHRoaXMgYnV0dHRvblxyXG4gICAgICAgIEZOID0gXCJGblwiLCAvL25vIGV2ZW50IGZpcmVkIGFjdHVhbGx5XHJcblxyXG4gICAgICAgIC8vTGludXggYnJpbmdzIHRoZXNlXHJcbiAgICAgICAgQUdBSU4gPSBcIkFnYWluXCIsXHJcbiAgICAgICAgUFJPUFMgPSBcIlByb3BzXCIsXHJcbiAgICAgICAgU0VMRUNUID0gXCJTZWxlY3RcIixcclxuICAgICAgICBPUEVOID0gXCJPcGVuXCIsXHJcbiAgICAgICAgRklORCA9IFwiRmluZFwiLFxyXG4gICAgICAgIFdBS0VfVVAgPSBcIldha2VVcFwiLFxyXG4gICAgICAgIE5VTVBBRF9QQVJFTlRfTEVGVCA9IFwiTnVtcGFkUGFyZW50TGVmdFwiLFxyXG4gICAgICAgIE5VTVBBRF9QQVJFTlRfUklHSFQgPSBcIk51bXBhZFBhcmVudFJpZ2h0XCIsXHJcblxyXG4gICAgICAgIC8vYW5kcm9pZFxyXG4gICAgICAgIFNMRUVQID0gXCJTbGVlcFwiXHJcbiAgICB9XHJcbiAgICAvKiBcclxuICAgIEZpcmVmb3ggY2FuJ3QgbWFrZSB1c2Ugb2YgdGhvc2UgYnV0dG9ucyBhbmQgQ29tYmluYXRpb25zOlxyXG4gICAgU0lOR0VMRV9CVVRUT05TOlxyXG4gICAgIERydWNrLFxyXG4gICAgQ09NQklOQVRJT05TOlxyXG4gICAgIFNoaWZ0ICsgRjEwLCBTaGlmdCArIE51bXBhZDUsXHJcbiAgICAgQ1RSTCArIHEsIENUUkwgKyBGNCxcclxuICAgICBBTFQgKyBGMSwgQUxUICsgRjIsIEFMVCArIEYzLCBBTFQgKyBGNywgQUxUICsgRjgsIEFMVCArIEYxMFxyXG4gICAgT3BlcmEgd29uJ3QgZG8gZ29vZCB3aXRoIHRoZXNlIEJ1dHRvbnMgYW5kIGNvbWJpbmF0aW9uczpcclxuICAgIFNJTkdMRV9CVVRUT05TOlxyXG4gICAgIEZsb2F0MzJBcnJheSwgRjExLCBBTFQsXHJcbiAgICBDT01CSU5BVElPTlM6XHJcbiAgICAgQ1RSTCArIHEsIENUUkwgKyB0LCBDVFJMICsgaCwgQ1RSTCArIGcsIENUUkwgKyBuLCBDVFJMICsgZiBcclxuICAgICBBTFQgKyBGMSwgQUxUICsgRjIsIEFMVCArIEY0LCBBTFQgKyBGNSwgQUxUICsgRjYsIEFMVCArIEY3LCBBTFQgKyBGOCwgQUxUICsgRjEwXHJcbiAgICAgKi9cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgZXhwb3J0IGludGVyZmFjZSBCb3JkZXIge1xyXG4gICAgICAgIGxlZnQ6IG51bWJlcjtcclxuICAgICAgICB0b3A6IG51bWJlcjtcclxuICAgICAgICByaWdodDogbnVtYmVyO1xyXG4gICAgICAgIGJvdHRvbTogbnVtYmVyO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRnJhbWluZyBkZXNjcmliZXMgaG93IHRvIG1hcCBhIHJlY3RhbmdsZSBpbnRvIGEgZ2l2ZW4gZnJhbWVcclxuICAgICAqIGFuZCBob3cgcG9pbnRzIGluIHRoZSBmcmFtZSBjb3JyZXNwb25kIHRvIHBvaW50cyBpbiB0aGUgcmVzdWx0aW5nIHJlY3RhbmdsZSBcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGFic3RyYWN0IGNsYXNzIEZyYW1pbmcgZXh0ZW5kcyBNdXRhYmxlIHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBNYXBzIGEgcG9pbnQgaW4gdGhlIGdpdmVuIGZyYW1lIGFjY29yZGluZyB0byB0aGlzIGZyYW1pbmdcclxuICAgICAgICAgKiBAcGFyYW0gX3BvaW50SW5GcmFtZSBUaGUgcG9pbnQgaW4gdGhlIGZyYW1lIGdpdmVuXHJcbiAgICAgICAgICogQHBhcmFtIF9yZWN0RnJhbWUgVGhlIGZyYW1lIHRoZSBwb2ludCBpcyByZWxhdGl2ZSB0b1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBhYnN0cmFjdCBnZXRQb2ludChfcG9pbnRJbkZyYW1lOiBWZWN0b3IyLCBfcmVjdEZyYW1lOiBSZWN0YW5nbGUpOiBWZWN0b3IyO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBNYXBzIGEgcG9pbnQgaW4gYSBnaXZlbiByZWN0YW5nbGUgYmFjayB0byBhIGNhbGN1bGF0ZWQgZnJhbWUgb2Ygb3JpZ2luXHJcbiAgICAgICAgICogQHBhcmFtIF9wb2ludCBUaGUgcG9pbnQgaW4gdGhlIHJlY3RhbmdsZVxyXG4gICAgICAgICAqIEBwYXJhbSBfcmVjdCBUaGUgcmVjdGFuZ2xlIHRoZSBwb2ludCBpcyByZWxhdGl2ZSB0b1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBhYnN0cmFjdCBnZXRQb2ludEludmVyc2UoX3BvaW50OiBWZWN0b3IyLCBfcmVjdDogUmVjdGFuZ2xlKTogVmVjdG9yMjtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVGFrZXMgYSByZWN0YW5nbGUgYXMgdGhlIGZyYW1lIGFuZCBjcmVhdGVzIGEgbmV3IHJlY3RhbmdsZSBhY2NvcmRpbmcgdG8gdGhlIGZyYW1pbmdcclxuICAgICAgICAgKiBAcGFyYW0gX3JlY3RGcmFtZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBhYnN0cmFjdCBnZXRSZWN0KF9yZWN0RnJhbWU6IFJlY3RhbmdsZSk6IFJlY3RhbmdsZTtcclxuICAgICAgICBwcm90ZWN0ZWQgcmVkdWNlTXV0YXRvcihfbXV0YXRvcjogTXV0YXRvcik6IHZvaWQgey8qKiAqLyB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgcmVzdWx0aW5nIHJlY3RhbmdsZSBoYXMgYSBmaXhlZCB3aWR0aCBhbmQgaGVpZ2h0IGFuZCBkaXNwbGF5IHNob3VsZCBzY2FsZSB0byBmaXQgdGhlIGZyYW1lXHJcbiAgICAgKiBQb2ludHMgYXJlIHNjYWxlZCBpbiB0aGUgc2FtZSByYXRpb1xyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgRnJhbWluZ0ZpeGVkIGV4dGVuZHMgRnJhbWluZyB7XHJcbiAgICAgICAgcHVibGljIHdpZHRoOiBudW1iZXIgPSAzMDA7XHJcbiAgICAgICAgcHVibGljIGhlaWdodDogbnVtYmVyID0gMTUwO1xyXG5cclxuICAgICAgICBwdWJsaWMgc2V0U2l6ZShfd2lkdGg6IG51bWJlciwgX2hlaWdodDogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMud2lkdGggPSBfd2lkdGg7XHJcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gX2hlaWdodDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRQb2ludChfcG9pbnRJbkZyYW1lOiBWZWN0b3IyLCBfcmVjdEZyYW1lOiBSZWN0YW5nbGUpOiBWZWN0b3IyIHtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdDogVmVjdG9yMiA9IG5ldyBWZWN0b3IyKFxyXG4gICAgICAgICAgICAgICAgdGhpcy53aWR0aCAqIChfcG9pbnRJbkZyYW1lLnggLSBfcmVjdEZyYW1lLngpIC8gX3JlY3RGcmFtZS53aWR0aCxcclxuICAgICAgICAgICAgICAgIHRoaXMuaGVpZ2h0ICogKF9wb2ludEluRnJhbWUueSAtIF9yZWN0RnJhbWUueSkgLyBfcmVjdEZyYW1lLmhlaWdodFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldFBvaW50SW52ZXJzZShfcG9pbnQ6IFZlY3RvcjIsIF9yZWN0OiBSZWN0YW5nbGUpOiBWZWN0b3IyIHtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdDogVmVjdG9yMiA9IG5ldyBWZWN0b3IyKFxyXG4gICAgICAgICAgICAgICAgX3BvaW50LnggKiBfcmVjdC53aWR0aCAvIHRoaXMud2lkdGggKyBfcmVjdC54LFxyXG4gICAgICAgICAgICAgICAgX3BvaW50LnkgKiBfcmVjdC5oZWlnaHQgLyB0aGlzLmhlaWdodCArIF9yZWN0LnlcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWN0KF9yZWN0RnJhbWU6IFJlY3RhbmdsZSk6IFJlY3RhbmdsZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBSZWN0YW5nbGUuR0VUKDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFdpZHRoIGFuZCBoZWlnaHQgb2YgdGhlIHJlc3VsdGluZyByZWN0YW5nbGUgYXJlIGZyYWN0aW9ucyBvZiB0aG9zZSBvZiB0aGUgZnJhbWUsIHNjYWxlZCBieSBub3JtZWQgdmFsdWVzIG5vcm1XaWR0aCBhbmQgbm9ybUhlaWdodC5cclxuICAgICAqIERpc3BsYXkgc2hvdWxkIHNjYWxlIHRvIGZpdCB0aGUgZnJhbWUgYW5kIHBvaW50cyBhcmUgc2NhbGVkIGluIHRoZSBzYW1lIHJhdGlvXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBGcmFtaW5nU2NhbGVkIGV4dGVuZHMgRnJhbWluZyB7XHJcbiAgICAgICAgcHVibGljIG5vcm1XaWR0aDogbnVtYmVyID0gMS4wO1xyXG4gICAgICAgIHB1YmxpYyBub3JtSGVpZ2h0OiBudW1iZXIgPSAxLjA7XHJcblxyXG4gICAgICAgIHB1YmxpYyBzZXRTY2FsZShfbm9ybVdpZHRoOiBudW1iZXIsIF9ub3JtSGVpZ2h0OiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5ub3JtV2lkdGggPSBfbm9ybVdpZHRoO1xyXG4gICAgICAgICAgICB0aGlzLm5vcm1IZWlnaHQgPSBfbm9ybUhlaWdodDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRQb2ludChfcG9pbnRJbkZyYW1lOiBWZWN0b3IyLCBfcmVjdEZyYW1lOiBSZWN0YW5nbGUpOiBWZWN0b3IyIHtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdDogVmVjdG9yMiA9IG5ldyBWZWN0b3IyKFxyXG4gICAgICAgICAgICAgICAgdGhpcy5ub3JtV2lkdGggKiAoX3BvaW50SW5GcmFtZS54IC0gX3JlY3RGcmFtZS54KSxcclxuICAgICAgICAgICAgICAgIHRoaXMubm9ybUhlaWdodCAqIChfcG9pbnRJbkZyYW1lLnkgLSBfcmVjdEZyYW1lLnkpXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0UG9pbnRJbnZlcnNlKF9wb2ludDogVmVjdG9yMiwgX3JlY3Q6IFJlY3RhbmdsZSk6IFZlY3RvcjIge1xyXG4gICAgICAgICAgICBsZXQgcmVzdWx0OiBWZWN0b3IyID0gbmV3IFZlY3RvcjIoXHJcbiAgICAgICAgICAgICAgICBfcG9pbnQueCAvIHRoaXMubm9ybVdpZHRoICsgX3JlY3QueCxcclxuICAgICAgICAgICAgICAgIF9wb2ludC55IC8gdGhpcy5ub3JtSGVpZ2h0ICsgX3JlY3QueVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldFJlY3QoX3JlY3RGcmFtZTogUmVjdGFuZ2xlKTogUmVjdGFuZ2xlIHtcclxuICAgICAgICAgICAgcmV0dXJuIFJlY3RhbmdsZS5HRVQoMCwgMCwgdGhpcy5ub3JtV2lkdGggKiBfcmVjdEZyYW1lLndpZHRoLCB0aGlzLm5vcm1IZWlnaHQgKiBfcmVjdEZyYW1lLmhlaWdodCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIHJlc3VsdGluZyByZWN0YW5nbGUgZml0cyBpbnRvIGEgbWFyZ2luIGdpdmVuIGFzIGZyYWN0aW9ucyBvZiB0aGUgc2l6ZSBvZiB0aGUgZnJhbWUgZ2l2ZW4gYnkgbm9ybUFuY2hvclxyXG4gICAgICogcGx1cyBhbiBhYnNvbHV0ZSBwYWRkaW5nIGdpdmVuIGJ5IHBpeGVsQm9yZGVyLiBEaXNwbGF5IHNob3VsZCBmaXQgaW50byB0aGlzLlxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgRnJhbWluZ0NvbXBsZXggZXh0ZW5kcyBGcmFtaW5nIHtcclxuICAgICAgICBwdWJsaWMgbWFyZ2luOiBCb3JkZXIgPSB7IGxlZnQ6IDAsIHRvcDogMCwgcmlnaHQ6IDAsIGJvdHRvbTogMCB9O1xyXG4gICAgICAgIHB1YmxpYyBwYWRkaW5nOiBCb3JkZXIgPSB7IGxlZnQ6IDAsIHRvcDogMCwgcmlnaHQ6IDAsIGJvdHRvbTogMCB9O1xyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0UG9pbnQoX3BvaW50SW5GcmFtZTogVmVjdG9yMiwgX3JlY3RGcmFtZTogUmVjdGFuZ2xlKTogVmVjdG9yMiB7XHJcbiAgICAgICAgICAgIGxldCByZXN1bHQ6IFZlY3RvcjIgPSBuZXcgVmVjdG9yMihcclxuICAgICAgICAgICAgICAgIF9wb2ludEluRnJhbWUueCAtIHRoaXMucGFkZGluZy5sZWZ0IC0gdGhpcy5tYXJnaW4ubGVmdCAqIF9yZWN0RnJhbWUud2lkdGgsXHJcbiAgICAgICAgICAgICAgICBfcG9pbnRJbkZyYW1lLnkgLSB0aGlzLnBhZGRpbmcudG9wIC0gdGhpcy5tYXJnaW4udG9wICogX3JlY3RGcmFtZS5oZWlnaHRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHVibGljIGdldFBvaW50SW52ZXJzZShfcG9pbnQ6IFZlY3RvcjIsIF9yZWN0OiBSZWN0YW5nbGUpOiBWZWN0b3IyIHtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdDogVmVjdG9yMiA9IG5ldyBWZWN0b3IyKFxyXG4gICAgICAgICAgICAgICAgX3BvaW50LnggKyB0aGlzLnBhZGRpbmcubGVmdCArIHRoaXMubWFyZ2luLmxlZnQgKiBfcmVjdC53aWR0aCxcclxuICAgICAgICAgICAgICAgIF9wb2ludC55ICsgdGhpcy5wYWRkaW5nLnRvcCArIHRoaXMubWFyZ2luLnRvcCAqIF9yZWN0LmhlaWdodFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldFJlY3QoX3JlY3RGcmFtZTogUmVjdGFuZ2xlKTogUmVjdGFuZ2xlIHtcclxuICAgICAgICAgICAgaWYgKCFfcmVjdEZyYW1lKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgICAgICAgICBsZXQgbWluWDogbnVtYmVyID0gX3JlY3RGcmFtZS54ICsgdGhpcy5tYXJnaW4ubGVmdCAqIF9yZWN0RnJhbWUud2lkdGggKyB0aGlzLnBhZGRpbmcubGVmdDtcclxuICAgICAgICAgICAgbGV0IG1pblk6IG51bWJlciA9IF9yZWN0RnJhbWUueSArIHRoaXMubWFyZ2luLnRvcCAqIF9yZWN0RnJhbWUuaGVpZ2h0ICsgdGhpcy5wYWRkaW5nLnRvcDtcclxuICAgICAgICAgICAgbGV0IG1heFg6IG51bWJlciA9IF9yZWN0RnJhbWUueCArICgxIC0gdGhpcy5tYXJnaW4ucmlnaHQpICogX3JlY3RGcmFtZS53aWR0aCAtIHRoaXMucGFkZGluZy5yaWdodDtcclxuICAgICAgICAgICAgbGV0IG1heFk6IG51bWJlciA9IF9yZWN0RnJhbWUueSArICgxIC0gdGhpcy5tYXJnaW4uYm90dG9tKSAqIF9yZWN0RnJhbWUuaGVpZ2h0IC0gdGhpcy5wYWRkaW5nLmJvdHRvbTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBSZWN0YW5nbGUuR0VUKG1pblgsIG1pblksIG1heFggLSBtaW5YLCBtYXhZIC0gbWluWSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0TXV0YXRvcigpOiBNdXRhdG9yIHtcclxuICAgICAgICAgICAgcmV0dXJuIHsgbWFyZ2luOiB0aGlzLm1hcmdpbiwgcGFkZGluZzogdGhpcy5wYWRkaW5nIH07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTaW1wbGUgY2xhc3MgZm9yIDN4MyBtYXRyaXggb3BlcmF0aW9ucyAoVGhpcyBjbGFzcyBjYW4gb25seSBoYW5kbGUgMkRcclxuICAgICAqIHRyYW5zZm9ybWF0aW9ucy4gQ291bGQgYmUgcmVtb3ZlZCBhZnRlciBhcHBseWluZyBmdWxsIDJEIGNvbXBhdGliaWxpdHkgdG8gTWF0NCkuXHJcbiAgICAgKiBAYXV0aG9ycyBKYXNjaGEgS2FyYWfDtmwsIEhGVSwgMjAxOSB8IEppcmthIERlbGwnT3JvLUZyaWVkbCwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBNYXRyaXgzeDMge1xyXG5cclxuICAgICAgICBwdWJsaWMgZGF0YTogbnVtYmVyW107XHJcblxyXG4gICAgICAgIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAgICAgdGhpcy5kYXRhID0gW1xyXG4gICAgICAgICAgICAgICAgMSwgMCwgMCxcclxuICAgICAgICAgICAgICAgIDAsIDEsIDAsXHJcbiAgICAgICAgICAgICAgICAwLCAwLCAxXHJcbiAgICAgICAgICAgIF07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHByb2plY3Rpb24oX3dpZHRoOiBudW1iZXIsIF9oZWlnaHQ6IG51bWJlcik6IE1hdHJpeDN4MyB7XHJcbiAgICAgICAgICAgIGxldCBtYXRyaXg6IE1hdHJpeDN4MyA9IG5ldyBNYXRyaXgzeDM7XHJcbiAgICAgICAgICAgIG1hdHJpeC5kYXRhID0gW1xyXG4gICAgICAgICAgICAgICAgMiAvIF93aWR0aCwgMCwgMCxcclxuICAgICAgICAgICAgICAgIDAsIC0yIC8gX2hlaWdodCwgMCxcclxuICAgICAgICAgICAgICAgIC0xLCAxLCAxXHJcbiAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgIHJldHVybiBtYXRyaXg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0IERhdGEoKTogbnVtYmVyW10ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRhO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGlkZW50aXR5KCk6IE1hdHJpeDN4MyB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgTWF0cml4M3gzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwdWJsaWMgdHJhbnNsYXRlKF9tYXRyaXg6IE1hdHJpeDN4MywgX3hUcmFuc2xhdGlvbjogbnVtYmVyLCBfeVRyYW5zbGF0aW9uOiBudW1iZXIpOiBNYXRyaXgzeDMge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tdWx0aXBseShfbWF0cml4LCB0aGlzLnRyYW5zbGF0aW9uKF94VHJhbnNsYXRpb24sIF95VHJhbnNsYXRpb24pKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyByb3RhdGUoX21hdHJpeDogTWF0cml4M3gzLCBfYW5nbGVJbkRlZ3JlZXM6IG51bWJlcik6IE1hdHJpeDN4MyB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm11bHRpcGx5KF9tYXRyaXgsIHRoaXMucm90YXRpb24oX2FuZ2xlSW5EZWdyZWVzKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc2NhbGUoX21hdHJpeDogTWF0cml4M3gzLCBfeFNjYWxlOiBudW1iZXIsIF95c2NhbGU6IG51bWJlcik6IE1hdHJpeDN4MyB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm11bHRpcGx5KF9tYXRyaXgsIHRoaXMuc2NhbGluZyhfeFNjYWxlLCBfeXNjYWxlKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgbXVsdGlwbHkoX2E6IE1hdHJpeDN4MywgX2I6IE1hdHJpeDN4Myk6IE1hdHJpeDN4MyB7XHJcbiAgICAgICAgICAgIGxldCBhMDA6IG51bWJlciA9IF9hLmRhdGFbMCAqIDMgKyAwXTtcclxuICAgICAgICAgICAgbGV0IGEwMTogbnVtYmVyID0gX2EuZGF0YVswICogMyArIDFdO1xyXG4gICAgICAgICAgICBsZXQgYTAyOiBudW1iZXIgPSBfYS5kYXRhWzAgKiAzICsgMl07XHJcbiAgICAgICAgICAgIGxldCBhMTA6IG51bWJlciA9IF9hLmRhdGFbMSAqIDMgKyAwXTtcclxuICAgICAgICAgICAgbGV0IGExMTogbnVtYmVyID0gX2EuZGF0YVsxICogMyArIDFdO1xyXG4gICAgICAgICAgICBsZXQgYTEyOiBudW1iZXIgPSBfYS5kYXRhWzEgKiAzICsgMl07XHJcbiAgICAgICAgICAgIGxldCBhMjA6IG51bWJlciA9IF9hLmRhdGFbMiAqIDMgKyAwXTtcclxuICAgICAgICAgICAgbGV0IGEyMTogbnVtYmVyID0gX2EuZGF0YVsyICogMyArIDFdO1xyXG4gICAgICAgICAgICBsZXQgYTIyOiBudW1iZXIgPSBfYS5kYXRhWzIgKiAzICsgMl07XHJcbiAgICAgICAgICAgIGxldCBiMDA6IG51bWJlciA9IF9iLmRhdGFbMCAqIDMgKyAwXTtcclxuICAgICAgICAgICAgbGV0IGIwMTogbnVtYmVyID0gX2IuZGF0YVswICogMyArIDFdO1xyXG4gICAgICAgICAgICBsZXQgYjAyOiBudW1iZXIgPSBfYi5kYXRhWzAgKiAzICsgMl07XHJcbiAgICAgICAgICAgIGxldCBiMTA6IG51bWJlciA9IF9iLmRhdGFbMSAqIDMgKyAwXTtcclxuICAgICAgICAgICAgbGV0IGIxMTogbnVtYmVyID0gX2IuZGF0YVsxICogMyArIDFdO1xyXG4gICAgICAgICAgICBsZXQgYjEyOiBudW1iZXIgPSBfYi5kYXRhWzEgKiAzICsgMl07XHJcbiAgICAgICAgICAgIGxldCBiMjA6IG51bWJlciA9IF9iLmRhdGFbMiAqIDMgKyAwXTtcclxuICAgICAgICAgICAgbGV0IGIyMTogbnVtYmVyID0gX2IuZGF0YVsyICogMyArIDFdO1xyXG4gICAgICAgICAgICBsZXQgYjIyOiBudW1iZXIgPSBfYi5kYXRhWzIgKiAzICsgMl07XHJcbiAgICAgICAgICAgIGxldCBtYXRyaXg6IE1hdHJpeDN4MyA9IG5ldyBNYXRyaXgzeDM7XHJcbiAgICAgICAgICAgIG1hdHJpeC5kYXRhID0gW1xyXG4gICAgICAgICAgICAgICAgYjAwICogYTAwICsgYjAxICogYTEwICsgYjAyICogYTIwLFxyXG4gICAgICAgICAgICAgICAgYjAwICogYTAxICsgYjAxICogYTExICsgYjAyICogYTIxLFxyXG4gICAgICAgICAgICAgICAgYjAwICogYTAyICsgYjAxICogYTEyICsgYjAyICogYTIyLFxyXG4gICAgICAgICAgICAgICAgYjEwICogYTAwICsgYjExICogYTEwICsgYjEyICogYTIwLFxyXG4gICAgICAgICAgICAgICAgYjEwICogYTAxICsgYjExICogYTExICsgYjEyICogYTIxLFxyXG4gICAgICAgICAgICAgICAgYjEwICogYTAyICsgYjExICogYTEyICsgYjEyICogYTIyLFxyXG4gICAgICAgICAgICAgICAgYjIwICogYTAwICsgYjIxICogYTEwICsgYjIyICogYTIwLFxyXG4gICAgICAgICAgICAgICAgYjIwICogYTAxICsgYjIxICogYTExICsgYjIyICogYTIxLFxyXG4gICAgICAgICAgICAgICAgYjIwICogYTAyICsgYjIxICogYTEyICsgYjIyICogYTIyXHJcbiAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgIHJldHVybiBtYXRyaXg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHRyYW5zbGF0aW9uKF94VHJhbnNsYXRpb246IG51bWJlciwgX3lUcmFuc2xhdGlvbjogbnVtYmVyKTogTWF0cml4M3gzIHtcclxuICAgICAgICAgICAgbGV0IG1hdHJpeDogTWF0cml4M3gzID0gbmV3IE1hdHJpeDN4MztcclxuICAgICAgICAgICAgbWF0cml4LmRhdGEgPSBbXHJcbiAgICAgICAgICAgICAgICAxLCAwLCAwLFxyXG4gICAgICAgICAgICAgICAgMCwgMSwgMCxcclxuICAgICAgICAgICAgICAgIF94VHJhbnNsYXRpb24sIF95VHJhbnNsYXRpb24sIDFcclxuICAgICAgICAgICAgXTtcclxuICAgICAgICAgICAgcmV0dXJuIG1hdHJpeDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc2NhbGluZyhfeFNjYWxlOiBudW1iZXIsIF95U2NhbGU6IG51bWJlcik6IE1hdHJpeDN4MyB7XHJcbiAgICAgICAgICAgIGxldCBtYXRyaXg6IE1hdHJpeDN4MyA9IG5ldyBNYXRyaXgzeDM7XHJcbiAgICAgICAgICAgIG1hdHJpeC5kYXRhID0gW1xyXG4gICAgICAgICAgICAgICAgX3hTY2FsZSwgMCwgMCxcclxuICAgICAgICAgICAgICAgIDAsIF95U2NhbGUsIDAsXHJcbiAgICAgICAgICAgICAgICAwLCAwLCAxXHJcbiAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgIHJldHVybiBtYXRyaXg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHJvdGF0aW9uKF9hbmdsZUluRGVncmVlczogbnVtYmVyKTogTWF0cml4M3gzIHtcclxuICAgICAgICAgICAgbGV0IGFuZ2xlSW5EZWdyZWVzOiBudW1iZXIgPSAzNjAgLSBfYW5nbGVJbkRlZ3JlZXM7XHJcbiAgICAgICAgICAgIGxldCBhbmdsZUluUmFkaWFuczogbnVtYmVyID0gYW5nbGVJbkRlZ3JlZXMgKiBNYXRoLlBJIC8gMTgwO1xyXG4gICAgICAgICAgICBsZXQgc2luOiBudW1iZXIgPSBNYXRoLnNpbihhbmdsZUluUmFkaWFucyk7XHJcbiAgICAgICAgICAgIGxldCBjb3M6IG51bWJlciA9IE1hdGguY29zKGFuZ2xlSW5SYWRpYW5zKTtcclxuICAgICAgICAgICAgbGV0IG1hdHJpeDogTWF0cml4M3gzID0gbmV3IE1hdHJpeDN4MztcclxuICAgICAgICAgICAgbWF0cml4LmRhdGEgPSBbXHJcbiAgICAgICAgICAgICAgICBjb3MsIC1zaW4sIDAsXHJcbiAgICAgICAgICAgICAgICBzaW4sIGNvcywgMCxcclxuICAgICAgICAgICAgICAgIDAsIDAsIDFcclxuICAgICAgICAgICAgXTtcclxuICAgICAgICAgICAgcmV0dXJuIG1hdHJpeDtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgIH1cclxuXHJcbn1cclxuIiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlcHJlc2VudHMgdGhlIG1hdHJpeCBhcyB0cmFuc2xhdGlvbiwgcm90YXRpb24gYW5kIHNjYWxpbmcgdmVjdG9yLCBiZWluZyBjYWxjdWxhdGVkIGZyb20gdGhlIG1hdHJpeFxyXG4gICAqL1xyXG4gIGludGVyZmFjZSBWZWN0b3JSZXByZXNlbnRhdGlvbiB7XHJcbiAgICB0cmFuc2xhdGlvbjogVmVjdG9yMztcclxuICAgIHJvdGF0aW9uOiBWZWN0b3IzO1xyXG4gICAgc2NhbGluZzogVmVjdG9yMztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0b3JlcyBhIDR4NCB0cmFuc2Zvcm1hdGlvbiBtYXRyaXggYW5kIHByb3ZpZGVzIG9wZXJhdGlvbnMgZm9yIGl0LlxyXG4gICAqIGBgYHBsYWludGV4dFxyXG4gICAqIFsgMCwgMSwgMiwgMyBdIOKGkCByb3cgdmVjdG9yIHhcclxuICAgKiBbIDQsIDUsIDYsIDcgXSDihpAgcm93IHZlY3RvciB5XHJcbiAgICogWyA4LCA5LDEwLDExIF0g4oaQIHJvdyB2ZWN0b3IgelxyXG4gICAqIFsxMiwxMywxNCwxNSBdIOKGkCB0cmFuc2xhdGlvblxyXG4gICAqICAgICAgICAgICAg4oaRICBob21vZ2VuZW91cyBjb2x1bW5cclxuICAgKiBgYGBcclxuICAgKiBAYXV0aG9ycyBKYXNjaGEgS2FyYWfDtmwsIEhGVSwgMjAxOSB8IEppcmthIERlbGwnT3JvLUZyaWVkbCwgSEZVLCAyMDE5XHJcbiAgICovXHJcblxyXG4gIGV4cG9ydCBjbGFzcyBNYXRyaXg0eDQgZXh0ZW5kcyBNdXRhYmxlIGltcGxlbWVudHMgU2VyaWFsaXphYmxlIHtcclxuICAgIHByaXZhdGUgZGF0YTogRmxvYXQzMkFycmF5ID0gbmV3IEZsb2F0MzJBcnJheSgxNik7IC8vIFRoZSBkYXRhIG9mIHRoZSBtYXRyaXguXHJcbiAgICBwcml2YXRlIG11dGF0b3I6IE11dGF0b3IgPSBudWxsOyAvLyBwcmVwYXJlZCBmb3Igb3B0aW1pemF0aW9uLCBrZWVwIG11dGF0b3IgdG8gcmVkdWNlIHJlZHVuZGFudCBjYWxjdWxhdGlvbiBhbmQgZm9yIGNvbXBhcmlzb24uIFNldCB0byBudWxsIHdoZW4gZGF0YSBjaGFuZ2VzIVxyXG4gICAgcHJpdmF0ZSB2ZWN0b3JzOiBWZWN0b3JSZXByZXNlbnRhdGlvbjsgLy8gdmVjdG9yIHJlcHJlc2VudGF0aW9uIG9mIFxyXG5cclxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgc3VwZXIoKTtcclxuICAgICAgdGhpcy5kYXRhLnNldChbXHJcbiAgICAgICAgMSwgMCwgMCwgMCxcclxuICAgICAgICAwLCAxLCAwLCAwLFxyXG4gICAgICAgIDAsIDAsIDEsIDAsXHJcbiAgICAgICAgMCwgMCwgMCwgMVxyXG4gICAgICBdKTtcclxuICAgICAgdGhpcy5yZXNldENhY2hlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIFxyXG4gICAgICogLSBnZXQ6IGEgY29weSBvZiB0aGUgY2FsY3VsYXRlZCB0cmFuc2xhdGlvbiB2ZWN0b3IgICBcclxuICAgICAqIC0gc2V0OiBlZmZlY3QgdGhlIG1hdHJpeCBpZ25vcmluZyBpdHMgcm90YXRpb24gYW5kIHNjYWxpbmdcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCB0cmFuc2xhdGlvbigpOiBWZWN0b3IzIHtcclxuICAgICAgaWYgKCF0aGlzLnZlY3RvcnMudHJhbnNsYXRpb24pXHJcbiAgICAgICAgdGhpcy52ZWN0b3JzLnRyYW5zbGF0aW9uID0gbmV3IFZlY3RvcjModGhpcy5kYXRhWzEyXSwgdGhpcy5kYXRhWzEzXSwgdGhpcy5kYXRhWzE0XSk7XHJcbiAgICAgIHJldHVybiB0aGlzLnZlY3RvcnMudHJhbnNsYXRpb24uY29weTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBzZXQgdHJhbnNsYXRpb24oX3RyYW5zbGF0aW9uOiBWZWN0b3IzKSB7XHJcbiAgICAgIHRoaXMuZGF0YS5zZXQoX3RyYW5zbGF0aW9uLmdldCgpLCAxMik7XHJcbiAgICAgIC8vIG5vIGZ1bGwgY2FjaGUgcmVzZXQgcmVxdWlyZWRcclxuICAgICAgdGhpcy52ZWN0b3JzLnRyYW5zbGF0aW9uID0gX3RyYW5zbGF0aW9uO1xyXG4gICAgICB0aGlzLm11dGF0b3IgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBcclxuICAgICAqIC0gZ2V0OiBhIGNvcHkgb2YgdGhlIGNhbGN1bGF0ZWQgcm90YXRpb24gdmVjdG9yICAgXHJcbiAgICAgKiAtIHNldDogZWZmZWN0IHRoZSBtYXRyaXhcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCByb3RhdGlvbigpOiBWZWN0b3IzIHtcclxuICAgICAgaWYgKCF0aGlzLnZlY3RvcnMucm90YXRpb24pXHJcbiAgICAgICAgdGhpcy52ZWN0b3JzLnJvdGF0aW9uID0gdGhpcy5nZXRFdWxlckFuZ2xlcygpO1xyXG4gICAgICByZXR1cm4gdGhpcy52ZWN0b3JzLnJvdGF0aW9uLmNvcHk7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgc2V0IHJvdGF0aW9uKF9yb3RhdGlvbjogVmVjdG9yMykge1xyXG4gICAgICB0aGlzLm11dGF0ZSh7IFwicm90YXRpb25cIjogX3JvdGF0aW9uIH0pO1xyXG4gICAgICB0aGlzLnJlc2V0Q2FjaGUoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKiogXHJcbiAgICAgKiAtIGdldDogYSBjb3B5IG9mIHRoZSBjYWxjdWxhdGVkIHNjYWxlIHZlY3RvciAgIFxyXG4gICAgICogLSBzZXQ6IGVmZmVjdCB0aGUgbWF0cml4XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgc2NhbGluZygpOiBWZWN0b3IzIHtcclxuICAgICAgaWYgKCF0aGlzLnZlY3RvcnMuc2NhbGluZylcclxuICAgICAgICB0aGlzLnZlY3RvcnMuc2NhbGluZyA9IG5ldyBWZWN0b3IzKFxyXG4gICAgICAgICAgTWF0aC5oeXBvdCh0aGlzLmRhdGFbMF0sIHRoaXMuZGF0YVsxXSwgdGhpcy5kYXRhWzJdKSxcclxuICAgICAgICAgIE1hdGguaHlwb3QodGhpcy5kYXRhWzRdLCB0aGlzLmRhdGFbNV0sIHRoaXMuZGF0YVs2XSksXHJcbiAgICAgICAgICBNYXRoLmh5cG90KHRoaXMuZGF0YVs4XSwgdGhpcy5kYXRhWzldLCB0aGlzLmRhdGFbMTBdKVxyXG4gICAgICAgICk7XHJcbiAgICAgIHJldHVybiB0aGlzLnZlY3RvcnMuc2NhbGluZy5jb3B5O1xyXG4gICAgfVxyXG4gICAgcHVibGljIHNldCBzY2FsaW5nKF9zY2FsaW5nOiBWZWN0b3IzKSB7XHJcbiAgICAgIHRoaXMubXV0YXRlKHsgXCJzY2FsaW5nXCI6IF9zY2FsaW5nIH0pO1xyXG4gICAgICB0aGlzLnJlc2V0Q2FjaGUoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyNyZWdpb24gU1RBVElDU1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXRyaWV2ZSBhIG5ldyBpZGVudGl0eSBtYXRyaXhcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBnZXQgSURFTlRJVFkoKTogTWF0cml4NHg0IHtcclxuICAgICAgLy8gY29uc3QgcmVzdWx0OiBNYXRyaXg0eDQgPSBuZXcgTWF0cml4NHg0KCk7XHJcbiAgICAgIGNvbnN0IHJlc3VsdDogTWF0cml4NHg0ID0gUmVjeWNsZXIuZ2V0KE1hdHJpeDR4NCk7XHJcbiAgICAgIHJlc3VsdC5kYXRhLnNldChbXHJcbiAgICAgICAgMSwgMCwgMCwgMCxcclxuICAgICAgICAwLCAxLCAwLCAwLFxyXG4gICAgICAgIDAsIDAsIDEsIDAsXHJcbiAgICAgICAgMCwgMCwgMCwgMVxyXG4gICAgICBdKTtcclxuICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbXB1dGVzIGFuZCByZXR1cm5zIHRoZSBwcm9kdWN0IG9mIHR3byBwYXNzZWQgbWF0cmljZXMuXHJcbiAgICAgKiBAcGFyYW0gX2EgVGhlIG1hdHJpeCB0byBtdWx0aXBseS5cclxuICAgICAqIEBwYXJhbSBfYiBUaGUgbWF0cml4IHRvIG11bHRpcGx5IGJ5LlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIE1VTFRJUExJQ0FUSU9OKF9hOiBNYXRyaXg0eDQsIF9iOiBNYXRyaXg0eDQpOiBNYXRyaXg0eDQge1xyXG4gICAgICBsZXQgYTogRmxvYXQzMkFycmF5ID0gX2EuZGF0YTtcclxuICAgICAgbGV0IGI6IEZsb2F0MzJBcnJheSA9IF9iLmRhdGE7XHJcbiAgICAgIC8vIGxldCBtYXRyaXg6IE1hdHJpeDR4NCA9IG5ldyBNYXRyaXg0eDQoKTtcclxuICAgICAgY29uc3QgbWF0cml4OiBNYXRyaXg0eDQgPSBSZWN5Y2xlci5nZXQoTWF0cml4NHg0KTtcclxuICAgICAgbGV0IGEwMDogbnVtYmVyID0gYVswICogNCArIDBdO1xyXG4gICAgICBsZXQgYTAxOiBudW1iZXIgPSBhWzAgKiA0ICsgMV07XHJcbiAgICAgIGxldCBhMDI6IG51bWJlciA9IGFbMCAqIDQgKyAyXTtcclxuICAgICAgbGV0IGEwMzogbnVtYmVyID0gYVswICogNCArIDNdO1xyXG4gICAgICBsZXQgYTEwOiBudW1iZXIgPSBhWzEgKiA0ICsgMF07XHJcbiAgICAgIGxldCBhMTE6IG51bWJlciA9IGFbMSAqIDQgKyAxXTtcclxuICAgICAgbGV0IGExMjogbnVtYmVyID0gYVsxICogNCArIDJdO1xyXG4gICAgICBsZXQgYTEzOiBudW1iZXIgPSBhWzEgKiA0ICsgM107XHJcbiAgICAgIGxldCBhMjA6IG51bWJlciA9IGFbMiAqIDQgKyAwXTtcclxuICAgICAgbGV0IGEyMTogbnVtYmVyID0gYVsyICogNCArIDFdO1xyXG4gICAgICBsZXQgYTIyOiBudW1iZXIgPSBhWzIgKiA0ICsgMl07XHJcbiAgICAgIGxldCBhMjM6IG51bWJlciA9IGFbMiAqIDQgKyAzXTtcclxuICAgICAgbGV0IGEzMDogbnVtYmVyID0gYVszICogNCArIDBdO1xyXG4gICAgICBsZXQgYTMxOiBudW1iZXIgPSBhWzMgKiA0ICsgMV07XHJcbiAgICAgIGxldCBhMzI6IG51bWJlciA9IGFbMyAqIDQgKyAyXTtcclxuICAgICAgbGV0IGEzMzogbnVtYmVyID0gYVszICogNCArIDNdO1xyXG4gICAgICBsZXQgYjAwOiBudW1iZXIgPSBiWzAgKiA0ICsgMF07XHJcbiAgICAgIGxldCBiMDE6IG51bWJlciA9IGJbMCAqIDQgKyAxXTtcclxuICAgICAgbGV0IGIwMjogbnVtYmVyID0gYlswICogNCArIDJdO1xyXG4gICAgICBsZXQgYjAzOiBudW1iZXIgPSBiWzAgKiA0ICsgM107XHJcbiAgICAgIGxldCBiMTA6IG51bWJlciA9IGJbMSAqIDQgKyAwXTtcclxuICAgICAgbGV0IGIxMTogbnVtYmVyID0gYlsxICogNCArIDFdO1xyXG4gICAgICBsZXQgYjEyOiBudW1iZXIgPSBiWzEgKiA0ICsgMl07XHJcbiAgICAgIGxldCBiMTM6IG51bWJlciA9IGJbMSAqIDQgKyAzXTtcclxuICAgICAgbGV0IGIyMDogbnVtYmVyID0gYlsyICogNCArIDBdO1xyXG4gICAgICBsZXQgYjIxOiBudW1iZXIgPSBiWzIgKiA0ICsgMV07XHJcbiAgICAgIGxldCBiMjI6IG51bWJlciA9IGJbMiAqIDQgKyAyXTtcclxuICAgICAgbGV0IGIyMzogbnVtYmVyID0gYlsyICogNCArIDNdO1xyXG4gICAgICBsZXQgYjMwOiBudW1iZXIgPSBiWzMgKiA0ICsgMF07XHJcbiAgICAgIGxldCBiMzE6IG51bWJlciA9IGJbMyAqIDQgKyAxXTtcclxuICAgICAgbGV0IGIzMjogbnVtYmVyID0gYlszICogNCArIDJdO1xyXG4gICAgICBsZXQgYjMzOiBudW1iZXIgPSBiWzMgKiA0ICsgM107XHJcbiAgICAgIG1hdHJpeC5kYXRhLnNldChcclxuICAgICAgICBbXHJcbiAgICAgICAgICBiMDAgKiBhMDAgKyBiMDEgKiBhMTAgKyBiMDIgKiBhMjAgKyBiMDMgKiBhMzAsXHJcbiAgICAgICAgICBiMDAgKiBhMDEgKyBiMDEgKiBhMTEgKyBiMDIgKiBhMjEgKyBiMDMgKiBhMzEsXHJcbiAgICAgICAgICBiMDAgKiBhMDIgKyBiMDEgKiBhMTIgKyBiMDIgKiBhMjIgKyBiMDMgKiBhMzIsXHJcbiAgICAgICAgICBiMDAgKiBhMDMgKyBiMDEgKiBhMTMgKyBiMDIgKiBhMjMgKyBiMDMgKiBhMzMsXHJcbiAgICAgICAgICBiMTAgKiBhMDAgKyBiMTEgKiBhMTAgKyBiMTIgKiBhMjAgKyBiMTMgKiBhMzAsXHJcbiAgICAgICAgICBiMTAgKiBhMDEgKyBiMTEgKiBhMTEgKyBiMTIgKiBhMjEgKyBiMTMgKiBhMzEsXHJcbiAgICAgICAgICBiMTAgKiBhMDIgKyBiMTEgKiBhMTIgKyBiMTIgKiBhMjIgKyBiMTMgKiBhMzIsXHJcbiAgICAgICAgICBiMTAgKiBhMDMgKyBiMTEgKiBhMTMgKyBiMTIgKiBhMjMgKyBiMTMgKiBhMzMsXHJcbiAgICAgICAgICBiMjAgKiBhMDAgKyBiMjEgKiBhMTAgKyBiMjIgKiBhMjAgKyBiMjMgKiBhMzAsXHJcbiAgICAgICAgICBiMjAgKiBhMDEgKyBiMjEgKiBhMTEgKyBiMjIgKiBhMjEgKyBiMjMgKiBhMzEsXHJcbiAgICAgICAgICBiMjAgKiBhMDIgKyBiMjEgKiBhMTIgKyBiMjIgKiBhMjIgKyBiMjMgKiBhMzIsXHJcbiAgICAgICAgICBiMjAgKiBhMDMgKyBiMjEgKiBhMTMgKyBiMjIgKiBhMjMgKyBiMjMgKiBhMzMsXHJcbiAgICAgICAgICBiMzAgKiBhMDAgKyBiMzEgKiBhMTAgKyBiMzIgKiBhMjAgKyBiMzMgKiBhMzAsXHJcbiAgICAgICAgICBiMzAgKiBhMDEgKyBiMzEgKiBhMTEgKyBiMzIgKiBhMjEgKyBiMzMgKiBhMzEsXHJcbiAgICAgICAgICBiMzAgKiBhMDIgKyBiMzEgKiBhMTIgKyBiMzIgKiBhMjIgKyBiMzMgKiBhMzIsXHJcbiAgICAgICAgICBiMzAgKiBhMDMgKyBiMzEgKiBhMTMgKyBiMzIgKiBhMjMgKyBiMzMgKiBhMzNcclxuICAgICAgICBdKTtcclxuICAgICAgcmV0dXJuIG1hdHJpeDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbXB1dGVzIGFuZCByZXR1cm5zIHRoZSBpbnZlcnNlIG9mIGEgcGFzc2VkIG1hdHJpeC5cclxuICAgICAqIEBwYXJhbSBfbWF0cml4IFRoZSBtYXRyaXggdG8gY29tcHV0ZSB0aGUgaW52ZXJzZSBvZi5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBJTlZFUlNJT04oX21hdHJpeDogTWF0cml4NHg0KTogTWF0cml4NHg0IHtcclxuICAgICAgbGV0IG06IEZsb2F0MzJBcnJheSA9IF9tYXRyaXguZGF0YTtcclxuICAgICAgbGV0IG0wMDogbnVtYmVyID0gbVswICogNCArIDBdO1xyXG4gICAgICBsZXQgbTAxOiBudW1iZXIgPSBtWzAgKiA0ICsgMV07XHJcbiAgICAgIGxldCBtMDI6IG51bWJlciA9IG1bMCAqIDQgKyAyXTtcclxuICAgICAgbGV0IG0wMzogbnVtYmVyID0gbVswICogNCArIDNdO1xyXG4gICAgICBsZXQgbTEwOiBudW1iZXIgPSBtWzEgKiA0ICsgMF07XHJcbiAgICAgIGxldCBtMTE6IG51bWJlciA9IG1bMSAqIDQgKyAxXTtcclxuICAgICAgbGV0IG0xMjogbnVtYmVyID0gbVsxICogNCArIDJdO1xyXG4gICAgICBsZXQgbTEzOiBudW1iZXIgPSBtWzEgKiA0ICsgM107XHJcbiAgICAgIGxldCBtMjA6IG51bWJlciA9IG1bMiAqIDQgKyAwXTtcclxuICAgICAgbGV0IG0yMTogbnVtYmVyID0gbVsyICogNCArIDFdO1xyXG4gICAgICBsZXQgbTIyOiBudW1iZXIgPSBtWzIgKiA0ICsgMl07XHJcbiAgICAgIGxldCBtMjM6IG51bWJlciA9IG1bMiAqIDQgKyAzXTtcclxuICAgICAgbGV0IG0zMDogbnVtYmVyID0gbVszICogNCArIDBdO1xyXG4gICAgICBsZXQgbTMxOiBudW1iZXIgPSBtWzMgKiA0ICsgMV07XHJcbiAgICAgIGxldCBtMzI6IG51bWJlciA9IG1bMyAqIDQgKyAyXTtcclxuICAgICAgbGV0IG0zMzogbnVtYmVyID0gbVszICogNCArIDNdO1xyXG4gICAgICBsZXQgdG1wMDogbnVtYmVyID0gbTIyICogbTMzO1xyXG4gICAgICBsZXQgdG1wMTogbnVtYmVyID0gbTMyICogbTIzO1xyXG4gICAgICBsZXQgdG1wMjogbnVtYmVyID0gbTEyICogbTMzO1xyXG4gICAgICBsZXQgdG1wMzogbnVtYmVyID0gbTMyICogbTEzO1xyXG4gICAgICBsZXQgdG1wNDogbnVtYmVyID0gbTEyICogbTIzO1xyXG4gICAgICBsZXQgdG1wNTogbnVtYmVyID0gbTIyICogbTEzO1xyXG4gICAgICBsZXQgdG1wNjogbnVtYmVyID0gbTAyICogbTMzO1xyXG4gICAgICBsZXQgdG1wNzogbnVtYmVyID0gbTMyICogbTAzO1xyXG4gICAgICBsZXQgdG1wODogbnVtYmVyID0gbTAyICogbTIzO1xyXG4gICAgICBsZXQgdG1wOTogbnVtYmVyID0gbTIyICogbTAzO1xyXG4gICAgICBsZXQgdG1wMTA6IG51bWJlciA9IG0wMiAqIG0xMztcclxuICAgICAgbGV0IHRtcDExOiBudW1iZXIgPSBtMTIgKiBtMDM7XHJcbiAgICAgIGxldCB0bXAxMjogbnVtYmVyID0gbTIwICogbTMxO1xyXG4gICAgICBsZXQgdG1wMTM6IG51bWJlciA9IG0zMCAqIG0yMTtcclxuICAgICAgbGV0IHRtcDE0OiBudW1iZXIgPSBtMTAgKiBtMzE7XHJcbiAgICAgIGxldCB0bXAxNTogbnVtYmVyID0gbTMwICogbTExO1xyXG4gICAgICBsZXQgdG1wMTY6IG51bWJlciA9IG0xMCAqIG0yMTtcclxuICAgICAgbGV0IHRtcDE3OiBudW1iZXIgPSBtMjAgKiBtMTE7XHJcbiAgICAgIGxldCB0bXAxODogbnVtYmVyID0gbTAwICogbTMxO1xyXG4gICAgICBsZXQgdG1wMTk6IG51bWJlciA9IG0zMCAqIG0wMTtcclxuICAgICAgbGV0IHRtcDIwOiBudW1iZXIgPSBtMDAgKiBtMjE7XHJcbiAgICAgIGxldCB0bXAyMTogbnVtYmVyID0gbTIwICogbTAxO1xyXG4gICAgICBsZXQgdG1wMjI6IG51bWJlciA9IG0wMCAqIG0xMTtcclxuICAgICAgbGV0IHRtcDIzOiBudW1iZXIgPSBtMTAgKiBtMDE7XHJcblxyXG4gICAgICBsZXQgdDA6IG51bWJlciA9ICh0bXAwICogbTExICsgdG1wMyAqIG0yMSArIHRtcDQgKiBtMzEpIC1cclxuICAgICAgICAodG1wMSAqIG0xMSArIHRtcDIgKiBtMjEgKyB0bXA1ICogbTMxKTtcclxuXHJcbiAgICAgIGxldCB0MTogbnVtYmVyID0gKHRtcDEgKiBtMDEgKyB0bXA2ICogbTIxICsgdG1wOSAqIG0zMSkgLVxyXG4gICAgICAgICh0bXAwICogbTAxICsgdG1wNyAqIG0yMSArIHRtcDggKiBtMzEpO1xyXG4gICAgICBsZXQgdDI6IG51bWJlciA9ICh0bXAyICogbTAxICsgdG1wNyAqIG0xMSArIHRtcDEwICogbTMxKSAtXHJcbiAgICAgICAgKHRtcDMgKiBtMDEgKyB0bXA2ICogbTExICsgdG1wMTEgKiBtMzEpO1xyXG4gICAgICBsZXQgdDM6IG51bWJlciA9ICh0bXA1ICogbTAxICsgdG1wOCAqIG0xMSArIHRtcDExICogbTIxKSAtXHJcbiAgICAgICAgKHRtcDQgKiBtMDEgKyB0bXA5ICogbTExICsgdG1wMTAgKiBtMjEpO1xyXG5cclxuICAgICAgbGV0IGQ6IG51bWJlciA9IDEuMCAvIChtMDAgKiB0MCArIG0xMCAqIHQxICsgbTIwICogdDIgKyBtMzAgKiB0Myk7XHJcblxyXG4gICAgICAvLyBsZXQgbWF0cml4OiBNYXRyaXg0eDQgPSBuZXcgTWF0cml4NHg0O1xyXG4gICAgICBjb25zdCBtYXRyaXg6IE1hdHJpeDR4NCA9IFJlY3ljbGVyLmdldChNYXRyaXg0eDQpO1xyXG4gICAgICBtYXRyaXguZGF0YS5zZXQoW1xyXG4gICAgICAgIGQgKiB0MCwgLy8gWzBdXHJcbiAgICAgICAgZCAqIHQxLCAvLyBbMV1cclxuICAgICAgICBkICogdDIsIC8vIFsyXVxyXG4gICAgICAgIGQgKiB0MywgLy8gWzNdXHJcbiAgICAgICAgZCAqICgodG1wMSAqIG0xMCArIHRtcDIgKiBtMjAgKyB0bXA1ICogbTMwKSAtICh0bXAwICogbTEwICsgdG1wMyAqIG0yMCArIHRtcDQgKiBtMzApKSwgICAgICAgIC8vIFs0XVxyXG4gICAgICAgIGQgKiAoKHRtcDAgKiBtMDAgKyB0bXA3ICogbTIwICsgdG1wOCAqIG0zMCkgLSAodG1wMSAqIG0wMCArIHRtcDYgKiBtMjAgKyB0bXA5ICogbTMwKSksICAgICAgICAvLyBbNV1cclxuICAgICAgICBkICogKCh0bXAzICogbTAwICsgdG1wNiAqIG0xMCArIHRtcDExICogbTMwKSAtICh0bXAyICogbTAwICsgdG1wNyAqIG0xMCArIHRtcDEwICogbTMwKSksICAgICAgLy8gWzZdXHJcbiAgICAgICAgZCAqICgodG1wNCAqIG0wMCArIHRtcDkgKiBtMTAgKyB0bXAxMCAqIG0yMCkgLSAodG1wNSAqIG0wMCArIHRtcDggKiBtMTAgKyB0bXAxMSAqIG0yMCkpLCAgICAgIC8vIFs3XVxyXG4gICAgICAgIGQgKiAoKHRtcDEyICogbTEzICsgdG1wMTUgKiBtMjMgKyB0bXAxNiAqIG0zMykgLSAodG1wMTMgKiBtMTMgKyB0bXAxNCAqIG0yMyArIHRtcDE3ICogbTMzKSksICAvLyBbOF1cclxuICAgICAgICBkICogKCh0bXAxMyAqIG0wMyArIHRtcDE4ICogbTIzICsgdG1wMjEgKiBtMzMpIC0gKHRtcDEyICogbTAzICsgdG1wMTkgKiBtMjMgKyB0bXAyMCAqIG0zMykpLCAgLy8gWzldXHJcbiAgICAgICAgZCAqICgodG1wMTQgKiBtMDMgKyB0bXAxOSAqIG0xMyArIHRtcDIyICogbTMzKSAtICh0bXAxNSAqIG0wMyArIHRtcDE4ICogbTEzICsgdG1wMjMgKiBtMzMpKSwgIC8vIFsxMF1cclxuICAgICAgICBkICogKCh0bXAxNyAqIG0wMyArIHRtcDIwICogbTEzICsgdG1wMjMgKiBtMjMpIC0gKHRtcDE2ICogbTAzICsgdG1wMjEgKiBtMTMgKyB0bXAyMiAqIG0yMykpLCAgLy8gWzExXVxyXG4gICAgICAgIGQgKiAoKHRtcDE0ICogbTIyICsgdG1wMTcgKiBtMzIgKyB0bXAxMyAqIG0xMikgLSAodG1wMTYgKiBtMzIgKyB0bXAxMiAqIG0xMiArIHRtcDE1ICogbTIyKSksICAvLyBbMTJdXHJcbiAgICAgICAgZCAqICgodG1wMjAgKiBtMzIgKyB0bXAxMiAqIG0wMiArIHRtcDE5ICogbTIyKSAtICh0bXAxOCAqIG0yMiArIHRtcDIxICogbTMyICsgdG1wMTMgKiBtMDIpKSwgIC8vIFsxM11cclxuICAgICAgICBkICogKCh0bXAxOCAqIG0xMiArIHRtcDIzICogbTMyICsgdG1wMTUgKiBtMDIpIC0gKHRtcDIyICogbTMyICsgdG1wMTQgKiBtMDIgKyB0bXAxOSAqIG0xMikpLCAgLy8gWzE0XVxyXG4gICAgICAgIGQgKiAoKHRtcDIyICogbTIyICsgdG1wMTYgKiBtMDIgKyB0bXAyMSAqIG0xMikgLSAodG1wMjAgKiBtMTIgKyB0bXAyMyAqIG0yMiArIHRtcDE3ICogbTAyKSkgIC8vIFsxNV1cclxuICAgICAgXSk7XHJcbiAgICAgIHJldHVybiBtYXRyaXg7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb21wdXRlcyBhbmQgcmV0dXJucyBhIHJvdGF0aW9ubWF0cml4IHRoYXQgYWxpZ25zIGEgdHJhbnNmb3JtYXRpb25zIHotYXhpcyB3aXRoIHRoZSB2ZWN0b3IgYmV0d2VlbiBpdCBhbmQgaXRzIHRhcmdldC5cclxuICAgICAqIEBwYXJhbSBfdHJhbnNmb3JtUG9zaXRpb24gVGhlIHgseSBhbmQgei1jb29yZGluYXRlcyBvZiB0aGUgb2JqZWN0IHRvIHJvdGF0ZS5cclxuICAgICAqIEBwYXJhbSBfdGFyZ2V0UG9zaXRpb24gVGhlIHBvc2l0aW9uIHRvIGxvb2sgYXQuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgTE9PS19BVChfdHJhbnNmb3JtUG9zaXRpb246IFZlY3RvcjMsIF90YXJnZXRQb3NpdGlvbjogVmVjdG9yMywgX3VwOiBWZWN0b3IzID0gVmVjdG9yMy5ZKCkpOiBNYXRyaXg0eDQge1xyXG4gICAgICAvLyBjb25zdCBtYXRyaXg6IE1hdHJpeDR4NCA9IG5ldyBNYXRyaXg0eDQ7XHJcbiAgICAgIGNvbnN0IG1hdHJpeDogTWF0cml4NHg0ID0gUmVjeWNsZXIuZ2V0KE1hdHJpeDR4NCk7XHJcbiAgICAgIGxldCB6QXhpczogVmVjdG9yMyA9IFZlY3RvcjMuRElGRkVSRU5DRShfdHJhbnNmb3JtUG9zaXRpb24sIF90YXJnZXRQb3NpdGlvbik7XHJcbiAgICAgIHpBeGlzLm5vcm1hbGl6ZSgpO1xyXG4gICAgICBsZXQgeEF4aXM6IFZlY3RvcjMgPSBWZWN0b3IzLk5PUk1BTElaQVRJT04oVmVjdG9yMy5DUk9TUyhfdXAsIHpBeGlzKSk7XHJcbiAgICAgIGxldCB5QXhpczogVmVjdG9yMyA9IFZlY3RvcjMuTk9STUFMSVpBVElPTihWZWN0b3IzLkNST1NTKHpBeGlzLCB4QXhpcykpO1xyXG4gICAgICBtYXRyaXguZGF0YS5zZXQoXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgeEF4aXMueCwgeEF4aXMueSwgeEF4aXMueiwgMCxcclxuICAgICAgICAgIHlBeGlzLngsIHlBeGlzLnksIHlBeGlzLnosIDAsXHJcbiAgICAgICAgICB6QXhpcy54LCB6QXhpcy55LCB6QXhpcy56LCAwLFxyXG4gICAgICAgICAgX3RyYW5zZm9ybVBvc2l0aW9uLngsXHJcbiAgICAgICAgICBfdHJhbnNmb3JtUG9zaXRpb24ueSxcclxuICAgICAgICAgIF90cmFuc2Zvcm1Qb3NpdGlvbi56LFxyXG4gICAgICAgICAgMVxyXG4gICAgICAgIF0pO1xyXG4gICAgICByZXR1cm4gbWF0cml4O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIG1hdHJpeCB0aGF0IHRyYW5zbGF0ZXMgY29vcmRpbmF0ZXMgYWxvbmcgdGhlIHgtLCB5LSBhbmQgei1heGlzIGFjY29yZGluZyB0byB0aGUgZ2l2ZW4gdmVjdG9yLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIFRSQU5TTEFUSU9OKF90cmFuc2xhdGU6IFZlY3RvcjMpOiBNYXRyaXg0eDQge1xyXG4gICAgICAvLyBsZXQgbWF0cml4OiBNYXRyaXg0eDQgPSBuZXcgTWF0cml4NHg0O1xyXG4gICAgICBjb25zdCBtYXRyaXg6IE1hdHJpeDR4NCA9IFJlY3ljbGVyLmdldChNYXRyaXg0eDQpO1xyXG4gICAgICBtYXRyaXguZGF0YS5zZXQoW1xyXG4gICAgICAgIDEsIDAsIDAsIDAsXHJcbiAgICAgICAgMCwgMSwgMCwgMCxcclxuICAgICAgICAwLCAwLCAxLCAwLFxyXG4gICAgICAgIF90cmFuc2xhdGUueCwgX3RyYW5zbGF0ZS55LCBfdHJhbnNsYXRlLnosIDFcclxuICAgICAgXSk7XHJcbiAgICAgIHJldHVybiBtYXRyaXg7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgbWF0cml4IHRoYXQgcm90YXRlcyBjb29yZGluYXRlcyBvbiB0aGUgeC1heGlzIHdoZW4gbXVsdGlwbGllZCBieS5cclxuICAgICAqIEBwYXJhbSBfYW5nbGVJbkRlZ3JlZXMgVGhlIHZhbHVlIG9mIHRoZSByb3RhdGlvbi5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBST1RBVElPTl9YKF9hbmdsZUluRGVncmVlczogbnVtYmVyKTogTWF0cml4NHg0IHtcclxuICAgICAgLy8gY29uc3QgbWF0cml4OiBNYXRyaXg0eDQgPSBuZXcgTWF0cml4NHg0O1xyXG4gICAgICBjb25zdCBtYXRyaXg6IE1hdHJpeDR4NCA9IFJlY3ljbGVyLmdldChNYXRyaXg0eDQpO1xyXG4gICAgICBsZXQgYW5nbGVJblJhZGlhbnM6IG51bWJlciA9IF9hbmdsZUluRGVncmVlcyAqIE1hdGguUEkgLyAxODA7XHJcbiAgICAgIGxldCBzaW46IG51bWJlciA9IE1hdGguc2luKGFuZ2xlSW5SYWRpYW5zKTtcclxuICAgICAgbGV0IGNvczogbnVtYmVyID0gTWF0aC5jb3MoYW5nbGVJblJhZGlhbnMpO1xyXG4gICAgICBtYXRyaXguZGF0YS5zZXQoW1xyXG4gICAgICAgIDEsIDAsIDAsIDAsXHJcbiAgICAgICAgMCwgY29zLCBzaW4sIDAsXHJcbiAgICAgICAgMCwgLXNpbiwgY29zLCAwLFxyXG4gICAgICAgIDAsIDAsIDAsIDFcclxuICAgICAgXSk7XHJcbiAgICAgIHJldHVybiBtYXRyaXg7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgbWF0cml4IHRoYXQgcm90YXRlcyBjb29yZGluYXRlcyBvbiB0aGUgeS1heGlzIHdoZW4gbXVsdGlwbGllZCBieS5cclxuICAgICAqIEBwYXJhbSBfYW5nbGVJbkRlZ3JlZXMgVGhlIHZhbHVlIG9mIHRoZSByb3RhdGlvbi5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBST1RBVElPTl9ZKF9hbmdsZUluRGVncmVlczogbnVtYmVyKTogTWF0cml4NHg0IHtcclxuICAgICAgLy8gY29uc3QgbWF0cml4OiBNYXRyaXg0eDQgPSBuZXcgTWF0cml4NHg0O1xyXG4gICAgICBsZXQgbWF0cml4OiBNYXRyaXg0eDQgPSBSZWN5Y2xlci5nZXQoTWF0cml4NHg0KTtcclxuICAgICAgbGV0IGFuZ2xlSW5SYWRpYW5zOiBudW1iZXIgPSBfYW5nbGVJbkRlZ3JlZXMgKiBNYXRoLlBJIC8gMTgwO1xyXG4gICAgICBsZXQgc2luOiBudW1iZXIgPSBNYXRoLnNpbihhbmdsZUluUmFkaWFucyk7XHJcbiAgICAgIGxldCBjb3M6IG51bWJlciA9IE1hdGguY29zKGFuZ2xlSW5SYWRpYW5zKTtcclxuICAgICAgbWF0cml4LmRhdGEuc2V0KFtcclxuICAgICAgICBjb3MsIDAsIC1zaW4sIDAsXHJcbiAgICAgICAgMCwgMSwgMCwgMCxcclxuICAgICAgICBzaW4sIDAsIGNvcywgMCxcclxuICAgICAgICAwLCAwLCAwLCAxXHJcbiAgICAgIF0pO1xyXG4gICAgICByZXR1cm4gbWF0cml4O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIG1hdHJpeCB0aGF0IHJvdGF0ZXMgY29vcmRpbmF0ZXMgb24gdGhlIHotYXhpcyB3aGVuIG11bHRpcGxpZWQgYnkuXHJcbiAgICAgKiBAcGFyYW0gX2FuZ2xlSW5EZWdyZWVzIFRoZSB2YWx1ZSBvZiB0aGUgcm90YXRpb24uXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgUk9UQVRJT05fWihfYW5nbGVJbkRlZ3JlZXM6IG51bWJlcik6IE1hdHJpeDR4NCB7XHJcbiAgICAgIC8vIGNvbnN0IG1hdHJpeDogTWF0cml4NHg0ID0gbmV3IE1hdHJpeDR4NDtcclxuICAgICAgY29uc3QgbWF0cml4OiBNYXRyaXg0eDQgPSBSZWN5Y2xlci5nZXQoTWF0cml4NHg0KTtcclxuICAgICAgbGV0IGFuZ2xlSW5SYWRpYW5zOiBudW1iZXIgPSBfYW5nbGVJbkRlZ3JlZXMgKiBNYXRoLlBJIC8gMTgwO1xyXG4gICAgICBsZXQgc2luOiBudW1iZXIgPSBNYXRoLnNpbihhbmdsZUluUmFkaWFucyk7XHJcbiAgICAgIGxldCBjb3M6IG51bWJlciA9IE1hdGguY29zKGFuZ2xlSW5SYWRpYW5zKTtcclxuICAgICAgbWF0cml4LmRhdGEuc2V0KFtcclxuICAgICAgICBjb3MsIHNpbiwgMCwgMCxcclxuICAgICAgICAtc2luLCBjb3MsIDAsIDAsXHJcbiAgICAgICAgMCwgMCwgMSwgMCxcclxuICAgICAgICAwLCAwLCAwLCAxXHJcbiAgICAgIF0pO1xyXG4gICAgICByZXR1cm4gbWF0cml4O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIG1hdHJpeCB0aGF0IHNjYWxlcyBjb29yZGluYXRlcyBhbG9uZyB0aGUgeC0sIHktIGFuZCB6LWF4aXMgYWNjb3JkaW5nIHRvIHRoZSBnaXZlbiB2ZWN0b3JcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBTQ0FMSU5HKF9zY2FsYXI6IFZlY3RvcjMpOiBNYXRyaXg0eDQge1xyXG4gICAgICAvLyBjb25zdCBtYXRyaXg6IE1hdHJpeDR4NCA9IG5ldyBNYXRyaXg0eDQ7XHJcbiAgICAgIGNvbnN0IG1hdHJpeDogTWF0cml4NHg0ID0gUmVjeWNsZXIuZ2V0KE1hdHJpeDR4NCk7XHJcbiAgICAgIG1hdHJpeC5kYXRhLnNldChbXHJcbiAgICAgICAgX3NjYWxhci54LCAwLCAwLCAwLFxyXG4gICAgICAgIDAsIF9zY2FsYXIueSwgMCwgMCxcclxuICAgICAgICAwLCAwLCBfc2NhbGFyLnosIDAsXHJcbiAgICAgICAgMCwgMCwgMCwgMVxyXG4gICAgICBdKTtcclxuICAgICAgcmV0dXJuIG1hdHJpeDtcclxuICAgIH1cclxuICAgIC8vI2VuZHJlZ2lvblxyXG5cclxuICAgIC8vI3JlZ2lvbiBQUk9KRUNUSU9OU1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb21wdXRlcyBhbmQgcmV0dXJucyBhIG1hdHJpeCB0aGF0IGFwcGxpZXMgcGVyc3BlY3RpdmUgdG8gYW4gb2JqZWN0LCBpZiBpdHMgdHJhbnNmb3JtIGlzIG11bHRpcGxpZWQgYnkgaXQuXHJcbiAgICAgKiBAcGFyYW0gX2FzcGVjdCBUaGUgYXNwZWN0IHJhdGlvIGJldHdlZW4gd2lkdGggYW5kIGhlaWdodCBvZiBwcm9qZWN0aW9uc3BhY2UuKERlZmF1bHQgPSBjYW52YXMuY2xpZW50V2lkdGggLyBjYW52YXMuQ2xpZW50SGVpZ2h0KVxyXG4gICAgICogQHBhcmFtIF9maWVsZE9mVmlld0luRGVncmVlcyBUaGUgZmllbGQgb2YgdmlldyBpbiBEZWdyZWVzLiAoRGVmYXVsdCA9IDQ1KVxyXG4gICAgICogQHBhcmFtIF9uZWFyIFRoZSBuZWFyIGNsaXBzcGFjZSBib3JkZXIgb24gdGhlIHotYXhpcy5cclxuICAgICAqIEBwYXJhbSBfZmFyIFRoZSBmYXIgY2xpcHNwYWNlIGJvcmRlciBvbiB0aGUgei1heGlzLlxyXG4gICAgICogQHBhcmFtIF9kaXJlY3Rpb24gVGhlIHBsYW5lIG9uIHdoaWNoIHRoZSBmaWVsZE9mVmlldy1BbmdsZSBpcyBnaXZlbiBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBQUk9KRUNUSU9OX0NFTlRSQUwoX2FzcGVjdDogbnVtYmVyLCBfZmllbGRPZlZpZXdJbkRlZ3JlZXM6IG51bWJlciwgX25lYXI6IG51bWJlciwgX2ZhcjogbnVtYmVyLCBfZGlyZWN0aW9uOiBGSUVMRF9PRl9WSUVXKTogTWF0cml4NHg0IHtcclxuICAgICAgbGV0IGZpZWxkT2ZWaWV3SW5SYWRpYW5zOiBudW1iZXIgPSBfZmllbGRPZlZpZXdJbkRlZ3JlZXMgKiBNYXRoLlBJIC8gMTgwO1xyXG4gICAgICBsZXQgZjogbnVtYmVyID0gTWF0aC50YW4oMC41ICogKE1hdGguUEkgLSBmaWVsZE9mVmlld0luUmFkaWFucykpO1xyXG4gICAgICBsZXQgcmFuZ2VJbnY6IG51bWJlciA9IDEuMCAvIChfbmVhciAtIF9mYXIpO1xyXG4gICAgICAvLyBjb25zdCBtYXRyaXg6IE1hdHJpeDR4NCA9IG5ldyBNYXRyaXg0eDQ7XHJcbiAgICAgIGNvbnN0IG1hdHJpeDogTWF0cml4NHg0ID0gUmVjeWNsZXIuZ2V0KE1hdHJpeDR4NCk7XHJcbiAgICAgIG1hdHJpeC5kYXRhLnNldChbXHJcbiAgICAgICAgZiwgMCwgMCwgMCxcclxuICAgICAgICAwLCBmLCAwLCAwLFxyXG4gICAgICAgIDAsIDAsIChfbmVhciArIF9mYXIpICogcmFuZ2VJbnYsIC0xLFxyXG4gICAgICAgIDAsIDAsIF9uZWFyICogX2ZhciAqIHJhbmdlSW52ICogMiwgMFxyXG4gICAgICBdKTtcclxuXHJcbiAgICAgIGlmIChfZGlyZWN0aW9uID09IEZJRUxEX09GX1ZJRVcuRElBR09OQUwpIHtcclxuICAgICAgICBfYXNwZWN0ID0gTWF0aC5zcXJ0KF9hc3BlY3QpO1xyXG4gICAgICAgIG1hdHJpeC5kYXRhWzBdID0gZiAvIF9hc3BlY3Q7XHJcbiAgICAgICAgbWF0cml4LmRhdGFbNV0gPSBmICogX2FzcGVjdDtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmIChfZGlyZWN0aW9uID09IEZJRUxEX09GX1ZJRVcuVkVSVElDQUwpXHJcbiAgICAgICAgbWF0cml4LmRhdGFbMF0gPSBmIC8gX2FzcGVjdDtcclxuICAgICAgZWxzZSAvL0ZPVl9ESVJFQ1RJT04uSE9SSVpPTlRBTFxyXG4gICAgICAgIG1hdHJpeC5kYXRhWzVdID0gZiAqIF9hc3BlY3Q7XHJcblxyXG4gICAgICByZXR1cm4gbWF0cml4O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29tcHV0ZXMgYW5kIHJldHVybnMgYSBtYXRyaXggdGhhdCBhcHBsaWVzIG9ydGhvZ3JhcGhpYyBwcm9qZWN0aW9uIHRvIGFuIG9iamVjdCwgaWYgaXRzIHRyYW5zZm9ybSBpcyBtdWx0aXBsaWVkIGJ5IGl0LlxyXG4gICAgICogQHBhcmFtIF9sZWZ0IFRoZSBwb3NpdGlvbnZhbHVlIG9mIHRoZSBwcm9qZWN0aW9uc3BhY2UncyBsZWZ0IGJvcmRlci5cclxuICAgICAqIEBwYXJhbSBfcmlnaHQgVGhlIHBvc2l0aW9udmFsdWUgb2YgdGhlIHByb2plY3Rpb25zcGFjZSdzIHJpZ2h0IGJvcmRlci5cclxuICAgICAqIEBwYXJhbSBfYm90dG9tIFRoZSBwb3NpdGlvbnZhbHVlIG9mIHRoZSBwcm9qZWN0aW9uc3BhY2UncyBib3R0b20gYm9yZGVyLlxyXG4gICAgICogQHBhcmFtIF90b3AgVGhlIHBvc2l0aW9udmFsdWUgb2YgdGhlIHByb2plY3Rpb25zcGFjZSdzIHRvcCBib3JkZXIuXHJcbiAgICAgKiBAcGFyYW0gX25lYXIgVGhlIHBvc2l0aW9udmFsdWUgb2YgdGhlIHByb2plY3Rpb25zcGFjZSdzIG5lYXIgYm9yZGVyLlxyXG4gICAgICogQHBhcmFtIF9mYXIgVGhlIHBvc2l0aW9udmFsdWUgb2YgdGhlIHByb2plY3Rpb25zcGFjZSdzIGZhciBib3JkZXJcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBQUk9KRUNUSU9OX09SVEhPR1JBUEhJQyhfbGVmdDogbnVtYmVyLCBfcmlnaHQ6IG51bWJlciwgX2JvdHRvbTogbnVtYmVyLCBfdG9wOiBudW1iZXIsIF9uZWFyOiBudW1iZXIgPSAtNDAwLCBfZmFyOiBudW1iZXIgPSA0MDApOiBNYXRyaXg0eDQge1xyXG4gICAgICAvLyBjb25zdCBtYXRyaXg6IE1hdHJpeDR4NCA9IG5ldyBNYXRyaXg0eDQ7XHJcbiAgICAgIGNvbnN0IG1hdHJpeDogTWF0cml4NHg0ID0gUmVjeWNsZXIuZ2V0KE1hdHJpeDR4NCk7XHJcbiAgICAgIG1hdHJpeC5kYXRhLnNldChbXHJcbiAgICAgICAgMiAvIChfcmlnaHQgLSBfbGVmdCksIDAsIDAsIDAsXHJcbiAgICAgICAgMCwgMiAvIChfdG9wIC0gX2JvdHRvbSksIDAsIDAsXHJcbiAgICAgICAgMCwgMCwgMiAvIChfbmVhciAtIF9mYXIpLCAwLFxyXG4gICAgICAgIChfbGVmdCArIF9yaWdodCkgLyAoX2xlZnQgLSBfcmlnaHQpLFxyXG4gICAgICAgIChfYm90dG9tICsgX3RvcCkgLyAoX2JvdHRvbSAtIF90b3ApLFxyXG4gICAgICAgIChfbmVhciArIF9mYXIpIC8gKF9uZWFyIC0gX2ZhciksXHJcbiAgICAgICAgMVxyXG4gICAgICBdKTtcclxuICAgICAgcmV0dXJuIG1hdHJpeDtcclxuICAgIH1cclxuICAgIC8vI2VuZHJlZ2lvblxyXG5cclxuICAgIC8vI3JlZ2lvbiBSb3RhdGlvblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIGEgcm90YXRpb24gYXJvdW5kIHRoZSB4LUF4aXMgdG8gdGhpcyBtYXRyaXhcclxuICAgICAqL1xyXG4gICAgcHVibGljIHJvdGF0ZVgoX2FuZ2xlSW5EZWdyZWVzOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgY29uc3QgbWF0cml4OiBNYXRyaXg0eDQgPSBNYXRyaXg0eDQuTVVMVElQTElDQVRJT04odGhpcywgTWF0cml4NHg0LlJPVEFUSU9OX1goX2FuZ2xlSW5EZWdyZWVzKSk7XHJcbiAgICAgIHRoaXMuc2V0KG1hdHJpeCk7XHJcbiAgICAgIFJlY3ljbGVyLnN0b3JlKG1hdHJpeCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIGEgcm90YXRpb24gYXJvdW5kIHRoZSB5LUF4aXMgdG8gdGhpcyBtYXRyaXhcclxuICAgICAqL1xyXG4gICAgcHVibGljIHJvdGF0ZVkoX2FuZ2xlSW5EZWdyZWVzOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgY29uc3QgbWF0cml4OiBNYXRyaXg0eDQgPSBNYXRyaXg0eDQuTVVMVElQTElDQVRJT04odGhpcywgTWF0cml4NHg0LlJPVEFUSU9OX1koX2FuZ2xlSW5EZWdyZWVzKSk7XHJcbiAgICAgIHRoaXMuc2V0KG1hdHJpeCk7XHJcbiAgICAgIFJlY3ljbGVyLnN0b3JlKG1hdHJpeCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIGEgcm90YXRpb24gYXJvdW5kIHRoZSB6LUF4aXMgdG8gdGhpcyBtYXRyaXhcclxuICAgICAqL1xyXG4gICAgcHVibGljIHJvdGF0ZVooX2FuZ2xlSW5EZWdyZWVzOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgY29uc3QgbWF0cml4OiBNYXRyaXg0eDQgPSBNYXRyaXg0eDQuTVVMVElQTElDQVRJT04odGhpcywgTWF0cml4NHg0LlJPVEFUSU9OX1ooX2FuZ2xlSW5EZWdyZWVzKSk7XHJcbiAgICAgIHRoaXMuc2V0KG1hdHJpeCk7XHJcbiAgICAgIFJlY3ljbGVyLnN0b3JlKG1hdHJpeCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGp1c3RzIHRoZSByb3RhdGlvbiBvZiB0aGlzIG1hdHJpeCB0byBmYWNlIHRoZSBnaXZlbiB0YXJnZXQgYW5kIHRpbHRzIGl0IHRvIGFjY29yZCB3aXRoIHRoZSBnaXZlbiB1cCB2ZWN0b3IgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBsb29rQXQoX3RhcmdldDogVmVjdG9yMywgX3VwOiBWZWN0b3IzID0gVmVjdG9yMy5ZKCkpOiB2b2lkIHtcclxuICAgICAgY29uc3QgbWF0cml4OiBNYXRyaXg0eDQgPSBNYXRyaXg0eDQuTE9PS19BVCh0aGlzLnRyYW5zbGF0aW9uLCBfdGFyZ2V0KTsgLy8gVE9ETzogSGFuZGxlIHJvdGF0aW9uIGFyb3VuZCB6LWF4aXNcclxuICAgICAgdGhpcy5zZXQobWF0cml4KTtcclxuICAgICAgUmVjeWNsZXIuc3RvcmUobWF0cml4KTtcclxuICAgIH1cclxuICAgIC8vI2VuZHJlZ2lvblxyXG5cclxuICAgIC8vI3JlZ2lvbiBUcmFuc2xhdGlvblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGQgYSB0cmFuc2xhdGlvbiBieSB0aGUgZ2l2ZW4gdmVjdG9yIHRvIHRoaXMgbWF0cml4IFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgdHJhbnNsYXRlKF9ieTogVmVjdG9yMyk6IHZvaWQge1xyXG4gICAgICBjb25zdCBtYXRyaXg6IE1hdHJpeDR4NCA9IE1hdHJpeDR4NC5NVUxUSVBMSUNBVElPTih0aGlzLCBNYXRyaXg0eDQuVFJBTlNMQVRJT04oX2J5KSk7XHJcbiAgICAgIC8vIFRPRE86IHBvc3NpYmxlIG9wdGltaXphdGlvbiwgdHJhbnNsYXRpb24gbWF5IGFsdGVyIG11dGF0b3IgaW5zdGVhZCBvZiBkZWxldGluZyBpdC5cclxuICAgICAgdGhpcy5zZXQobWF0cml4KTtcclxuICAgICAgUmVjeWNsZXIuc3RvcmUobWF0cml4KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZCBhIHRyYW5zbGF0aW9uIGFsb25nIHRoZSB4LUF4aXMgYnkgdGhlIGdpdmVuIGFtb3VudCB0byB0aGlzIG1hdHJpeCBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHRyYW5zbGF0ZVgoX3g6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICB0aGlzLmRhdGFbMTJdICs9IF94O1xyXG4gICAgICB0aGlzLm11dGF0b3IgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGQgYSB0cmFuc2xhdGlvbiBhbG9uZyB0aGUgeS1BeGlzIGJ5IHRoZSBnaXZlbiBhbW91bnQgdG8gdGhpcyBtYXRyaXggXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyB0cmFuc2xhdGVZKF95OiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgdGhpcy5kYXRhWzEzXSArPSBfeTtcclxuICAgICAgdGhpcy5tdXRhdG9yID0gbnVsbDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQWRkIGEgdHJhbnNsYXRpb24gYWxvbmcgdGhlIHktQXhpcyBieSB0aGUgZ2l2ZW4gYW1vdW50IHRvIHRoaXMgbWF0cml4IFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgdHJhbnNsYXRlWihfejogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgIHRoaXMuZGF0YVsxNF0gKz0gX3o7XHJcbiAgICAgIHRoaXMubXV0YXRvciA9IG51bGw7XHJcbiAgICB9XHJcbiAgICAvLyNlbmRyZWdpb25cclxuXHJcbiAgICAvLyNyZWdpb24gU2NhbGluZ1xyXG4gICAgLyoqXHJcbiAgICAgKiBBZGQgYSBzY2FsaW5nIGJ5IHRoZSBnaXZlbiB2ZWN0b3IgdG8gdGhpcyBtYXRyaXggXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzY2FsZShfYnk6IFZlY3RvcjMpOiB2b2lkIHtcclxuICAgICAgY29uc3QgbWF0cml4OiBNYXRyaXg0eDQgPSBNYXRyaXg0eDQuTVVMVElQTElDQVRJT04odGhpcywgTWF0cml4NHg0LlNDQUxJTkcoX2J5KSk7XHJcbiAgICAgIHRoaXMuc2V0KG1hdHJpeCk7XHJcbiAgICAgIFJlY3ljbGVyLnN0b3JlKG1hdHJpeCk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEFkZCBhIHNjYWxpbmcgYWxvbmcgdGhlIHgtQXhpcyBieSB0aGUgZ2l2ZW4gYW1vdW50IHRvIHRoaXMgbWF0cml4IFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2NhbGVYKF9ieTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgIHRoaXMuc2NhbGUobmV3IFZlY3RvcjMoX2J5LCAxLCAxKSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEFkZCBhIHNjYWxpbmcgYWxvbmcgdGhlIHktQXhpcyBieSB0aGUgZ2l2ZW4gYW1vdW50IHRvIHRoaXMgbWF0cml4IFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2NhbGVZKF9ieTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgIHRoaXMuc2NhbGUobmV3IFZlY3RvcjMoMSwgX2J5LCAxKSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEFkZCBhIHNjYWxpbmcgYWxvbmcgdGhlIHotQXhpcyBieSB0aGUgZ2l2ZW4gYW1vdW50IHRvIHRoaXMgbWF0cml4IFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2NhbGVaKF9ieTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgIHRoaXMuc2NhbGUobmV3IFZlY3RvcjMoMSwgMSwgX2J5KSk7XHJcbiAgICB9XHJcbiAgICAvLyNlbmRyZWdpb25cclxuXHJcbiAgICAvLyNyZWdpb24gVHJhbnNmb3JtYXRpb25cclxuICAgIC8qKlxyXG4gICAgICogTXVsdGlwbHkgdGhpcyBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gbWF0cml4XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBtdWx0aXBseShfbWF0cml4OiBNYXRyaXg0eDQpOiB2b2lkIHtcclxuICAgICAgdGhpcy5zZXQoTWF0cml4NHg0Lk1VTFRJUExJQ0FUSU9OKHRoaXMsIF9tYXRyaXgpKTtcclxuICAgICAgdGhpcy5tdXRhdG9yID0gbnVsbDtcclxuICAgIH1cclxuICAgIC8vI2VuZHJlZ2lvblxyXG5cclxuICAgIC8vI3JlZ2lvbiBUcmFuc2ZlclxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxjdWxhdGVzIGFuZCByZXR1cm5zIHRoZSBldWxlci1hbmdsZXMgcmVwcmVzZW50aW5nIHRoZSBjdXJyZW50IHJvdGF0aW9uIG9mIHRoaXMgbWF0cml4XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRFdWxlckFuZ2xlcygpOiBWZWN0b3IzIHtcclxuICAgICAgbGV0IHNjYWxpbmc6IFZlY3RvcjMgPSB0aGlzLnNjYWxpbmc7XHJcblxyXG4gICAgICBsZXQgczA6IG51bWJlciA9IHRoaXMuZGF0YVswXSAvIHNjYWxpbmcueDtcclxuICAgICAgbGV0IHMxOiBudW1iZXIgPSB0aGlzLmRhdGFbMV0gLyBzY2FsaW5nLng7XHJcbiAgICAgIGxldCBzMjogbnVtYmVyID0gdGhpcy5kYXRhWzJdIC8gc2NhbGluZy54O1xyXG4gICAgICBsZXQgczY6IG51bWJlciA9IHRoaXMuZGF0YVs2XSAvIHNjYWxpbmcueTtcclxuICAgICAgbGV0IHMxMDogbnVtYmVyID0gdGhpcy5kYXRhWzEwXSAvIHNjYWxpbmcuejtcclxuXHJcbiAgICAgIGxldCBzeTogbnVtYmVyID0gTWF0aC5oeXBvdChzMCwgczEpOyAvLyBwcm9iYWJseSAyLiBwYXJhbSBzaG91bGQgYmUgdGhpcy5kYXRhWzRdIC8gc2NhbGluZy55XHJcblxyXG4gICAgICBsZXQgc2luZ3VsYXI6IGJvb2xlYW4gPSBzeSA8IDFlLTY7IC8vIElmXHJcblxyXG4gICAgICBsZXQgeDE6IG51bWJlciwgeTE6IG51bWJlciwgejE6IG51bWJlcjtcclxuICAgICAgbGV0IHgyOiBudW1iZXIsIHkyOiBudW1iZXIsIHoyOiBudW1iZXI7XHJcblxyXG4gICAgICBpZiAoIXNpbmd1bGFyKSB7XHJcbiAgICAgICAgeDEgPSBNYXRoLmF0YW4yKHM2LCBzMTApO1xyXG4gICAgICAgIHkxID0gTWF0aC5hdGFuMigtczIsIHN5KTtcclxuICAgICAgICB6MSA9IE1hdGguYXRhbjIoczEsIHMwKTtcclxuXHJcbiAgICAgICAgeDIgPSBNYXRoLmF0YW4yKC1zNiwgLXMxMCk7XHJcbiAgICAgICAgeTIgPSBNYXRoLmF0YW4yKC1zMiwgLXN5KTtcclxuICAgICAgICB6MiA9IE1hdGguYXRhbjIoLXMxLCAtczApO1xyXG5cclxuICAgICAgICBpZiAoTWF0aC5hYnMoeDIpICsgTWF0aC5hYnMoeTIpICsgTWF0aC5hYnMoejIpIDwgTWF0aC5hYnMoeDEpICsgTWF0aC5hYnMoeTEpICsgTWF0aC5hYnMoejEpKSB7XHJcbiAgICAgICAgICB4MSA9IHgyO1xyXG4gICAgICAgICAgeTEgPSB5MjtcclxuICAgICAgICAgIHoxID0gejI7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHgxID0gTWF0aC5hdGFuMigtdGhpcy5kYXRhWzldIC8gc2NhbGluZy56LCB0aGlzLmRhdGFbNV0gLyBzY2FsaW5nLnkpO1xyXG4gICAgICAgIHkxID0gTWF0aC5hdGFuMigtdGhpcy5kYXRhWzJdIC8gc2NhbGluZy54LCBzeSk7XHJcbiAgICAgICAgejEgPSAwO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBsZXQgcm90YXRpb246IFZlY3RvcjMgPSBuZXcgVmVjdG9yMyh4MSwgeTEsIHoxKTtcclxuICAgICAgcm90YXRpb24uc2NhbGUoMTgwIC8gTWF0aC5QSSk7XHJcblxyXG4gICAgICByZXR1cm4gcm90YXRpb247XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSBlbGVtZW50cyBvZiB0aGlzIG1hdHJpeCB0byB0aGUgdmFsdWVzIG9mIHRoZSBnaXZlbiBtYXRyaXhcclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldChfdG86IE1hdHJpeDR4NCk6IHZvaWQge1xyXG4gICAgICAvLyB0aGlzLmRhdGEgPSBfdG8uZ2V0KCk7XHJcbiAgICAgIHRoaXMuZGF0YS5zZXQoX3RvLmRhdGEpO1xyXG4gICAgICB0aGlzLnJlc2V0Q2FjaGUoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybiB0aGUgZWxlbWVudHMgb2YgdGhpcyBtYXRyaXggYXMgYSBGbG9hdDMyQXJyYXlcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCgpOiBGbG9hdDMyQXJyYXkge1xyXG4gICAgICByZXR1cm4gbmV3IEZsb2F0MzJBcnJheSh0aGlzLmRhdGEpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXJpYWxpemUoKTogU2VyaWFsaXphdGlvbiB7XHJcbiAgICAgIC8vIFRPRE86IHNhdmUgdHJhbnNsYXRpb24sIHJvdGF0aW9uIGFuZCBzY2FsZSBhcyB2ZWN0b3JzIGZvciByZWFkYWJpbGl0eSBhbmQgbWFuaXB1bGF0aW9uXHJcbiAgICAgIGxldCBzZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uID0gdGhpcy5nZXRNdXRhdG9yKCk7XHJcbiAgICAgIHJldHVybiBzZXJpYWxpemF0aW9uO1xyXG4gICAgfVxyXG4gICAgcHVibGljIGRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uKTogU2VyaWFsaXphYmxlIHtcclxuICAgICAgdGhpcy5tdXRhdGUoX3NlcmlhbGl6YXRpb24pO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0TXV0YXRvcigpOiBNdXRhdG9yIHtcclxuICAgICAgaWYgKHRoaXMubXV0YXRvcilcclxuICAgICAgICByZXR1cm4gdGhpcy5tdXRhdG9yO1xyXG5cclxuICAgICAgbGV0IG11dGF0b3I6IE11dGF0b3IgPSB7XHJcbiAgICAgICAgdHJhbnNsYXRpb246IHRoaXMudHJhbnNsYXRpb24uZ2V0TXV0YXRvcigpLFxyXG4gICAgICAgIHJvdGF0aW9uOiB0aGlzLnJvdGF0aW9uLmdldE11dGF0b3IoKSxcclxuICAgICAgICBzY2FsaW5nOiB0aGlzLnNjYWxpbmcuZ2V0TXV0YXRvcigpXHJcbiAgICAgIH07XHJcblxyXG4gICAgICAvLyBjYWNoZSBtdXRhdG9yXHJcbiAgICAgIHRoaXMubXV0YXRvciA9IG11dGF0b3I7XHJcbiAgICAgIHJldHVybiBtdXRhdG9yO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBtdXRhdGUoX211dGF0b3I6IE11dGF0b3IpOiB2b2lkIHtcclxuICAgICAgbGV0IG9sZFRyYW5zbGF0aW9uOiBWZWN0b3IzID0gdGhpcy50cmFuc2xhdGlvbjtcclxuICAgICAgbGV0IG9sZFJvdGF0aW9uOiBWZWN0b3IzID0gdGhpcy5yb3RhdGlvbjtcclxuICAgICAgbGV0IG9sZFNjYWxpbmc6IFZlY3RvcjMgPSB0aGlzLnNjYWxpbmc7XHJcbiAgICAgIGxldCBuZXdUcmFuc2xhdGlvbjogVmVjdG9yMyA9IDxWZWN0b3IzPl9tdXRhdG9yW1widHJhbnNsYXRpb25cIl07XHJcbiAgICAgIGxldCBuZXdSb3RhdGlvbjogVmVjdG9yMyA9IDxWZWN0b3IzPl9tdXRhdG9yW1wicm90YXRpb25cIl07XHJcbiAgICAgIGxldCBuZXdTY2FsaW5nOiBWZWN0b3IzID0gPFZlY3RvcjM+X211dGF0b3JbXCJzY2FsaW5nXCJdO1xyXG4gICAgICBsZXQgdmVjdG9yczogVmVjdG9yUmVwcmVzZW50YXRpb24gPSB7IHRyYW5zbGF0aW9uOiBudWxsLCByb3RhdGlvbjogbnVsbCwgc2NhbGluZzogbnVsbCB9O1xyXG4gICAgICBpZiAobmV3VHJhbnNsYXRpb24pIHtcclxuICAgICAgICB2ZWN0b3JzLnRyYW5zbGF0aW9uID0gbmV3IFZlY3RvcjMoXHJcbiAgICAgICAgICBuZXdUcmFuc2xhdGlvbi54ICE9IHVuZGVmaW5lZCA/IG5ld1RyYW5zbGF0aW9uLnggOiBvbGRUcmFuc2xhdGlvbi54LFxyXG4gICAgICAgICAgbmV3VHJhbnNsYXRpb24ueSAhPSB1bmRlZmluZWQgPyBuZXdUcmFuc2xhdGlvbi55IDogb2xkVHJhbnNsYXRpb24ueSxcclxuICAgICAgICAgIG5ld1RyYW5zbGF0aW9uLnogIT0gdW5kZWZpbmVkID8gbmV3VHJhbnNsYXRpb24ueiA6IG9sZFRyYW5zbGF0aW9uLnpcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChuZXdSb3RhdGlvbikge1xyXG4gICAgICAgIHZlY3RvcnMucm90YXRpb24gPSBuZXcgVmVjdG9yMyhcclxuICAgICAgICAgIG5ld1JvdGF0aW9uLnggIT0gdW5kZWZpbmVkID8gbmV3Um90YXRpb24ueCA6IG9sZFJvdGF0aW9uLngsXHJcbiAgICAgICAgICBuZXdSb3RhdGlvbi55ICE9IHVuZGVmaW5lZCA/IG5ld1JvdGF0aW9uLnkgOiBvbGRSb3RhdGlvbi55LFxyXG4gICAgICAgICAgbmV3Um90YXRpb24ueiAhPSB1bmRlZmluZWQgPyBuZXdSb3RhdGlvbi56IDogb2xkUm90YXRpb24uelxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKG5ld1NjYWxpbmcpIHtcclxuICAgICAgICB2ZWN0b3JzLnNjYWxpbmcgPSBuZXcgVmVjdG9yMyhcclxuICAgICAgICAgIG5ld1NjYWxpbmcueCAhPSB1bmRlZmluZWQgPyBuZXdTY2FsaW5nLnggOiBvbGRTY2FsaW5nLngsXHJcbiAgICAgICAgICBuZXdTY2FsaW5nLnkgIT0gdW5kZWZpbmVkID8gbmV3U2NhbGluZy55IDogb2xkU2NhbGluZy55LFxyXG4gICAgICAgICAgbmV3U2NhbGluZy56ICE9IHVuZGVmaW5lZCA/IG5ld1NjYWxpbmcueiA6IG9sZFNjYWxpbmcuelxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFRPRE86IHBvc3NpYmxlIHBlcmZvcm1hbmNlIG9wdGltaXphdGlvbiB3aGVuIG9ubHkgb25lIG9yIHR3byBjb21wb25lbnRzIGNoYW5nZSwgdGhlbiB1c2Ugb2xkIG1hdHJpeCBpbnN0ZWFkIG9mIElERU5USVRZIGFuZCB0cmFuc2Zvcm0gYnkgZGlmZmVyZW5jZXMvcXVvdGllbnRzXHJcbiAgICAgIGxldCBtYXRyaXg6IE1hdHJpeDR4NCA9IE1hdHJpeDR4NC5JREVOVElUWTtcclxuICAgICAgaWYgKHZlY3RvcnMudHJhbnNsYXRpb24pXHJcbiAgICAgICAgbWF0cml4LnRyYW5zbGF0ZSh2ZWN0b3JzLnRyYW5zbGF0aW9uKTtcclxuICAgICAgaWYgKHZlY3RvcnMucm90YXRpb24pIHtcclxuICAgICAgICBtYXRyaXgucm90YXRlWih2ZWN0b3JzLnJvdGF0aW9uLnopO1xyXG4gICAgICAgIG1hdHJpeC5yb3RhdGVZKHZlY3RvcnMucm90YXRpb24ueSk7XHJcbiAgICAgICAgbWF0cml4LnJvdGF0ZVgodmVjdG9ycy5yb3RhdGlvbi54KTtcclxuICAgICAgfVxyXG4gICAgICBpZiAodmVjdG9ycy5zY2FsaW5nKVxyXG4gICAgICAgIG1hdHJpeC5zY2FsZSh2ZWN0b3JzLnNjYWxpbmcpO1xyXG4gICAgICB0aGlzLnNldChtYXRyaXgpO1xyXG5cclxuICAgICAgdGhpcy52ZWN0b3JzID0gdmVjdG9ycztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0TXV0YXRvckF0dHJpYnV0ZVR5cGVzKF9tdXRhdG9yOiBNdXRhdG9yKTogTXV0YXRvckF0dHJpYnV0ZVR5cGVzIHtcclxuICAgICAgbGV0IHR5cGVzOiBNdXRhdG9yQXR0cmlidXRlVHlwZXMgPSB7fTtcclxuICAgICAgaWYgKF9tdXRhdG9yLnRyYW5zbGF0aW9uKSB0eXBlcy50cmFuc2xhdGlvbiA9IFwiVmVjdG9yM1wiO1xyXG4gICAgICBpZiAoX211dGF0b3Iucm90YXRpb24pIHR5cGVzLnJvdGF0aW9uID0gXCJWZWN0b3IzXCI7XHJcbiAgICAgIGlmIChfbXV0YXRvci5zY2FsaW5nKSB0eXBlcy5zY2FsaW5nID0gXCJWZWN0b3IzXCI7XHJcbiAgICAgIHJldHVybiB0eXBlcztcclxuICAgIH1cclxuICAgIHByb3RlY3RlZCByZWR1Y2VNdXRhdG9yKF9tdXRhdG9yOiBNdXRhdG9yKTogdm9pZCB7LyoqICovIH1cclxuXHJcbiAgICBwcml2YXRlIHJlc2V0Q2FjaGUoKTogdm9pZCB7XHJcbiAgICAgIHRoaXMudmVjdG9ycyA9IHsgdHJhbnNsYXRpb246IG51bGwsIHJvdGF0aW9uOiBudWxsLCBzY2FsaW5nOiBudWxsIH07XHJcbiAgICAgIHRoaXMubXV0YXRvciA9IG51bGw7XHJcbiAgICB9XHJcbiAgfVxyXG4gIC8vI2VuZHJlZ2lvblxyXG59XHJcbiIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBEZWZpbmVzIHRoZSBvcmlnaW4gb2YgYSByZWN0YW5nbGVcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGVudW0gT1JJR0lOMkQge1xyXG4gICAgICAgIFRPUExFRlQgPSAweDAwLFxyXG4gICAgICAgIFRPUENFTlRFUiA9IDB4MDEsXHJcbiAgICAgICAgVE9QUklHSFQgPSAweDAyLFxyXG4gICAgICAgIENFTlRFUkxFRlQgPSAweDEwLFxyXG4gICAgICAgIENFTlRFUiA9IDB4MTEsXHJcbiAgICAgICAgQ0VOVEVSUklHSFQgPSAweDEyLFxyXG4gICAgICAgIEJPVFRPTUxFRlQgPSAweDIwLFxyXG4gICAgICAgIEJPVFRPTUNFTlRFUiA9IDB4MjEsXHJcbiAgICAgICAgQk9UVE9NUklHSFQgPSAweDIyXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZWZpbmVzIGEgcmVjdGFuZ2xlIHdpdGggcG9zaXRpb24gYW5kIHNpemUgYW5kIGFkZCBjb21mb3J0YWJsZSBtZXRob2RzIHRvIGl0XHJcbiAgICAgKiBAYXV0aG9yIEppcmthIERlbGwnT3JvLUZyaWVkbCwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBSZWN0YW5nbGUgZXh0ZW5kcyBNdXRhYmxlIHtcclxuICAgICAgICBwdWJsaWMgcG9zaXRpb246IFZlY3RvcjIgPSBSZWN5Y2xlci5nZXQoVmVjdG9yMik7XHJcbiAgICAgICAgcHVibGljIHNpemU6IFZlY3RvcjIgPSBSZWN5Y2xlci5nZXQoVmVjdG9yMik7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKF94OiBudW1iZXIgPSAwLCBfeTogbnVtYmVyID0gMCwgX3dpZHRoOiBudW1iZXIgPSAxLCBfaGVpZ2h0OiBudW1iZXIgPSAxLCBfb3JpZ2luOiBPUklHSU4yRCA9IE9SSUdJTjJELlRPUExFRlQpIHtcclxuICAgICAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRQb3NpdGlvbkFuZFNpemUoX3gsIF95LCBfd2lkdGgsIF9oZWlnaHQsIF9vcmlnaW4pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyBhIG5ldyByZWN0YW5nbGUgY3JlYXRlZCB3aXRoIHRoZSBnaXZlbiBwYXJhbWV0ZXJzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBHRVQoX3g6IG51bWJlciA9IDAsIF95OiBudW1iZXIgPSAwLCBfd2lkdGg6IG51bWJlciA9IDEsIF9oZWlnaHQ6IG51bWJlciA9IDEsIF9vcmlnaW46IE9SSUdJTjJEID0gT1JJR0lOMkQuVE9QTEVGVCk6IFJlY3RhbmdsZSB7XHJcbiAgICAgICAgICAgIGxldCByZWN0OiBSZWN0YW5nbGUgPSBSZWN5Y2xlci5nZXQoUmVjdGFuZ2xlKTtcclxuICAgICAgICAgICAgcmVjdC5zZXRQb3NpdGlvbkFuZFNpemUoX3gsIF95LCBfd2lkdGgsIF9oZWlnaHQpO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVjdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNldHMgdGhlIHBvc2l0aW9uIGFuZCBzaXplIG9mIHRoZSByZWN0YW5nbGUgYWNjb3JkaW5nIHRvIHRoZSBnaXZlbiBwYXJhbWV0ZXJzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHNldFBvc2l0aW9uQW5kU2l6ZShfeDogbnVtYmVyID0gMCwgX3k6IG51bWJlciA9IDAsIF93aWR0aDogbnVtYmVyID0gMSwgX2hlaWdodDogbnVtYmVyID0gMSwgX29yaWdpbjogT1JJR0lOMkQgPSBPUklHSU4yRC5UT1BMRUZUKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuc2l6ZS5zZXQoX3dpZHRoLCBfaGVpZ2h0KTtcclxuICAgICAgICAgICAgc3dpdGNoIChfb3JpZ2luICYgMHgwMykge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAweDAwOiB0aGlzLnBvc2l0aW9uLnggPSBfeDsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDB4MDE6IHRoaXMucG9zaXRpb24ueCA9IF94IC0gX3dpZHRoIC8gMjsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDB4MDI6IHRoaXMucG9zaXRpb24ueCA9IF94IC0gX3dpZHRoOyBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzd2l0Y2ggKF9vcmlnaW4gJiAweDMwKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDB4MDA6IHRoaXMucG9zaXRpb24ueSA9IF95OyBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgMHgxMDogdGhpcy5wb3NpdGlvbi55ID0gX3kgLSBfaGVpZ2h0IC8gMjsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDB4MjA6IHRoaXMucG9zaXRpb24ueSA9IF95IC0gX2hlaWdodDsgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdldCB4KCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBvc2l0aW9uLng7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGdldCB5KCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBvc2l0aW9uLnk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGdldCB3aWR0aCgpOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zaXplLng7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGdldCBoZWlnaHQoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2l6ZS55O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ2V0IGxlZnQoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucG9zaXRpb24ueDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZ2V0IHRvcCgpOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wb3NpdGlvbi55O1xyXG4gICAgICAgIH1cclxuICAgICAgICBnZXQgcmlnaHQoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucG9zaXRpb24ueCArIHRoaXMuc2l6ZS54O1xyXG4gICAgICAgIH1cclxuICAgICAgICBnZXQgYm90dG9tKCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBvc2l0aW9uLnkgKyB0aGlzLnNpemUueTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHNldCB4KF94OiBudW1iZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi54ID0gX3g7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNldCB5KF95OiBudW1iZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi55ID0gX3k7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNldCB3aWR0aChfd2lkdGg6IG51bWJlcikge1xyXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnggPSBfd2lkdGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNldCBoZWlnaHQoX2hlaWdodDogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueSA9IF9oZWlnaHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNldCBsZWZ0KF92YWx1ZTogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2l6ZS54ID0gdGhpcy5yaWdodCAtIF92YWx1ZTtcclxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi54ID0gX3ZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzZXQgdG9wKF92YWx1ZTogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2l6ZS55ID0gdGhpcy5ib3R0b20gLSBfdmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueSA9IF92YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2V0IHJpZ2h0KF92YWx1ZTogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2l6ZS54ID0gdGhpcy5wb3NpdGlvbi54ICsgX3ZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzZXQgYm90dG9tKF92YWx1ZTogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2l6ZS55ID0gdGhpcy5wb3NpdGlvbi55ICsgX3ZhbHVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiBwb2ludCBpcyBpbnNpZGUgb2YgdGhpcyByZWN0YW5nbGUgb3Igb24gdGhlIGJvcmRlclxyXG4gICAgICAgICAqIEBwYXJhbSBfcG9pbnRcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgaXNJbnNpZGUoX3BvaW50OiBWZWN0b3IyKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIHJldHVybiAoX3BvaW50LnggPj0gdGhpcy5sZWZ0ICYmIF9wb2ludC54IDw9IHRoaXMucmlnaHQgJiYgX3BvaW50LnkgPj0gdGhpcy50b3AgJiYgX3BvaW50LnkgPD0gdGhpcy5ib3R0b20pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJvdGVjdGVkIHJlZHVjZU11dGF0b3IoX211dGF0b3I6IE11dGF0b3IpOiB2b2lkIHsvKiAqLyB9XHJcbiAgICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAvKipcclxuICAgKiBTdG9yZXMgYW5kIG1hbmlwdWxhdGVzIGEgdHdvZGltZW5zaW9uYWwgdmVjdG9yIGNvbXByaXNlZCBvZiB0aGUgY29tcG9uZW50cyB4IGFuZCB5XHJcbiAgICogYGBgcGxhaW50ZXh0XHJcbiAgICogICAgICAgICAgICAreVxyXG4gICAqICAgICAgICAgICAgIHxfXyAreFxyXG4gICAqIGBgYFxyXG4gICAqIEBhdXRob3JzIEx1a2FzIFNjaGV1ZXJsZSwgSEZVLCAyMDE5XHJcbiAgICovXHJcbiAgZXhwb3J0IGNsYXNzIFZlY3RvcjIgZXh0ZW5kcyBNdXRhYmxlIHtcclxuICAgIHByaXZhdGUgZGF0YTogRmxvYXQzMkFycmF5O1xyXG5cclxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihfeDogbnVtYmVyID0gMCwgX3k6IG51bWJlciA9IDApIHtcclxuICAgICAgc3VwZXIoKTtcclxuICAgICAgdGhpcy5kYXRhID0gbmV3IEZsb2F0MzJBcnJheShbX3gsIF95XSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHgoKTogbnVtYmVyIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZGF0YVswXTtcclxuICAgIH1cclxuICAgIGdldCB5KCk6IG51bWJlciB7XHJcbiAgICAgIHJldHVybiB0aGlzLmRhdGFbMV07XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IHgoX3g6IG51bWJlcikge1xyXG4gICAgICB0aGlzLmRhdGFbMF0gPSBfeDtcclxuICAgIH1cclxuICAgIHNldCB5KF95OiBudW1iZXIpIHtcclxuICAgICAgdGhpcy5kYXRhWzFdID0gX3k7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIFxyXG4gICAgICogQSBzaG9ydGhhbmQgZm9yIHdyaXRpbmcgYG5ldyBWZWN0b3IyKDAsIDApYC5cclxuICAgICAqIEByZXR1cm5zIEEgbmV3IHZlY3RvciB3aXRoIHRoZSB2YWx1ZXMgKDAsIDApXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgWkVSTygpOiBWZWN0b3IyIHtcclxuICAgICAgbGV0IHZlY3RvcjogVmVjdG9yMiA9IG5ldyBWZWN0b3IyKCk7XHJcbiAgICAgIHJldHVybiB2ZWN0b3I7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIFxyXG4gICAgICogQSBzaG9ydGhhbmQgZm9yIHdyaXRpbmcgYG5ldyBWZWN0b3IyKF9zY2FsZSwgX3NjYWxlKWAuXHJcbiAgICAgKiBAcGFyYW0gX3NjYWxlIHRoZSBzY2FsZSBvZiB0aGUgdmVjdG9yLiBEZWZhdWx0OiAxXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgT05FKF9zY2FsZTogbnVtYmVyID0gMSk6IFZlY3RvcjIge1xyXG4gICAgICBsZXQgdmVjdG9yOiBWZWN0b3IyID0gbmV3IFZlY3RvcjIoX3NjYWxlLCBfc2NhbGUpO1xyXG4gICAgICByZXR1cm4gdmVjdG9yO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBcclxuICAgICAqIEEgc2hvcnRoYW5kIGZvciB3cml0aW5nIGBuZXcgVmVjdG9yMigwLCB5KWAuXHJcbiAgICAgKiBAcGFyYW0gX3NjYWxlIFRoZSBudW1iZXIgdG8gd3JpdGUgaW4gdGhlIHkgY29vcmRpbmF0ZS4gRGVmYXVsdDogMVxyXG4gICAgICogQHJldHVybnMgQSBuZXcgdmVjdG9yIHdpdGggdGhlIHZhbHVlcyAoMCwgX3NjYWxlKVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIFkoX3NjYWxlOiBudW1iZXIgPSAxKTogVmVjdG9yMiB7XHJcbiAgICAgIGxldCB2ZWN0b3I6IFZlY3RvcjIgPSBuZXcgVmVjdG9yMigwLCBfc2NhbGUpO1xyXG4gICAgICByZXR1cm4gdmVjdG9yO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBcclxuICAgICAqIEEgc2hvcnRoYW5kIGZvciB3cml0aW5nIGBuZXcgVmVjdG9yMih4LCAwKWAuXHJcbiAgICAgKiBAcGFyYW0gX3NjYWxlIFRoZSBudW1iZXIgdG8gd3JpdGUgaW4gdGhlIHggY29vcmRpbmF0ZS4gRGVmYXVsdDogMVxyXG4gICAgICogQHJldHVybnMgQSBuZXcgdmVjdG9yIHdpdGggdGhlIHZhbHVlcyAoX3NjYWxlLCAwKVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIFgoX3NjYWxlOiBudW1iZXIgPSAxKTogVmVjdG9yMiB7XHJcbiAgICAgIGxldCB2ZWN0b3I6IFZlY3RvcjIgPSBuZXcgVmVjdG9yMihfc2NhbGUsIDApO1xyXG4gICAgICByZXR1cm4gdmVjdG9yO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIE5vcm1hbGl6ZXMgYSBnaXZlbiB2ZWN0b3IgdG8gdGhlIGdpdmVuIGxlbmd0aCB3aXRob3V0IGVkaXRpbmcgdGhlIG9yaWdpbmFsIHZlY3Rvci5cclxuICAgICAqIEBwYXJhbSBfdmVjdG9yIHRoZSB2ZWN0b3IgdG8gbm9ybWFsaXplXHJcbiAgICAgKiBAcGFyYW0gX2xlbmd0aCB0aGUgbGVuZ3RoIG9mIHRoZSByZXN1bHRpbmcgdmVjdG9yLiBkZWZhdWx0cyB0byAxXHJcbiAgICAgKiBAcmV0dXJucyBhIG5ldyB2ZWN0b3IgcmVwcmVzZW50aW5nIHRoZSBub3JtYWxpc2VkIHZlY3RvciBzY2FsZWQgYnkgdGhlIGdpdmVuIGxlbmd0aFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIE5PUk1BTElaQVRJT04oX3ZlY3RvcjogVmVjdG9yMiwgX2xlbmd0aDogbnVtYmVyID0gMSk6IFZlY3RvcjIge1xyXG4gICAgICBsZXQgdmVjdG9yOiBWZWN0b3IyID0gVmVjdG9yMi5aRVJPKCk7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgbGV0IFt4LCB5XSA9IF92ZWN0b3IuZGF0YTtcclxuICAgICAgICBsZXQgZmFjdG9yOiBudW1iZXIgPSBfbGVuZ3RoIC8gTWF0aC5oeXBvdCh4LCB5KTtcclxuICAgICAgICB2ZWN0b3IuZGF0YSA9IG5ldyBGbG9hdDMyQXJyYXkoW192ZWN0b3IueCAqIGZhY3RvciwgX3ZlY3Rvci55ICogZmFjdG9yXSk7XHJcbiAgICAgIH0gY2F0Y2ggKF9lKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKF9lKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdmVjdG9yO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2NhbGVzIGEgZ2l2ZW4gdmVjdG9yIGJ5IGEgZ2l2ZW4gc2NhbGUgd2l0aG91dCBjaGFuZ2luZyB0aGUgb3JpZ2luYWwgdmVjdG9yXHJcbiAgICAgKiBAcGFyYW0gX3ZlY3RvciBUaGUgdmVjdG9yIHRvIHNjYWxlLlxyXG4gICAgICogQHBhcmFtIF9zY2FsZSBUaGUgc2NhbGUgdG8gc2NhbGUgd2l0aC5cclxuICAgICAqIEByZXR1cm5zIEEgbmV3IHZlY3RvciByZXByZXNlbnRpbmcgdGhlIHNjYWxlZCB2ZXJzaW9uIG9mIHRoZSBnaXZlbiB2ZWN0b3JcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBTQ0FMRShfdmVjdG9yOiBWZWN0b3IyLCBfc2NhbGU6IG51bWJlcik6IFZlY3RvcjIge1xyXG4gICAgICBsZXQgdmVjdG9yOiBWZWN0b3IyID0gbmV3IFZlY3RvcjIoKTtcclxuICAgICAgcmV0dXJuIHZlY3RvcjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFN1bXMgdXAgbXVsdGlwbGUgdmVjdG9ycy5cclxuICAgICAqIEBwYXJhbSBfdmVjdG9ycyBBIHNlcmllcyBvZiB2ZWN0b3JzIHRvIHN1bSB1cFxyXG4gICAgICogQHJldHVybnMgQSBuZXcgdmVjdG9yIHJlcHJlc2VudGluZyB0aGUgc3VtIG9mIHRoZSBnaXZlbiB2ZWN0b3JzXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgU1VNKC4uLl92ZWN0b3JzOiBWZWN0b3IyW10pOiBWZWN0b3IyIHtcclxuICAgICAgbGV0IHJlc3VsdDogVmVjdG9yMiA9IG5ldyBWZWN0b3IyKCk7XHJcbiAgICAgIGZvciAobGV0IHZlY3RvciBvZiBfdmVjdG9ycylcclxuICAgICAgICByZXN1bHQuZGF0YSA9IG5ldyBGbG9hdDMyQXJyYXkoW3Jlc3VsdC54ICsgdmVjdG9yLngsIHJlc3VsdC55ICsgdmVjdG9yLnldKTtcclxuICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFN1YnRyYWN0cyB0d28gdmVjdG9ycy5cclxuICAgICAqIEBwYXJhbSBfYSBUaGUgdmVjdG9yIHRvIHN1YnRyYWN0IGZyb20uXHJcbiAgICAgKiBAcGFyYW0gX2IgVGhlIHZlY3RvciB0byBzdWJ0cmFjdC5cclxuICAgICAqIEByZXR1cm5zIEEgbmV3IHZlY3RvciByZXByZXNlbnRpbmcgdGhlIGRpZmZlcmVuY2Ugb2YgdGhlIGdpdmVuIHZlY3RvcnNcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBESUZGRVJFTkNFKF9hOiBWZWN0b3IyLCBfYjogVmVjdG9yMik6IFZlY3RvcjIge1xyXG4gICAgICBsZXQgdmVjdG9yOiBWZWN0b3IyID0gbmV3IFZlY3RvcjI7XHJcbiAgICAgIHZlY3Rvci5kYXRhID0gbmV3IEZsb2F0MzJBcnJheShbX2EueCAtIF9iLngsIF9hLnkgLSBfYi55XSk7XHJcbiAgICAgIHJldHVybiB2ZWN0b3I7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb21wdXRlcyB0aGUgZG90cHJvZHVjdCBvZiAyIHZlY3RvcnMuXHJcbiAgICAgKiBAcGFyYW0gX2EgVGhlIHZlY3RvciB0byBtdWx0aXBseS5cclxuICAgICAqIEBwYXJhbSBfYiBUaGUgdmVjdG9yIHRvIG11bHRpcGx5IGJ5LlxyXG4gICAgICogQHJldHVybnMgQSBuZXcgdmVjdG9yIHJlcHJlc2VudGluZyB0aGUgZG90cHJvZHVjdCBvZiB0aGUgZ2l2ZW4gdmVjdG9yc1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIERPVChfYTogVmVjdG9yMiwgX2I6IFZlY3RvcjIpOiBudW1iZXIge1xyXG4gICAgICBsZXQgc2NhbGFyUHJvZHVjdDogbnVtYmVyID0gX2EueCAqIF9iLnggKyBfYS55ICogX2IueTtcclxuICAgICAgcmV0dXJuIHNjYWxhclByb2R1Y3Q7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBtYWduaXR1ZGUgb2YgYSBnaXZlbiB2ZWN0b3IuXHJcbiAgICAgKiBJZiB5b3Ugb25seSBuZWVkIHRvIGNvbXBhcmUgbWFnbml0dWRlcyBvZiBkaWZmZXJlbnQgdmVjdG9ycywgeW91IGNhbiBjb21wYXJlIHNxdWFyZWQgbWFnbml0dWRlcyB1c2luZyBWZWN0b3IyLk1BR05JVFVERVNRUiBpbnN0ZWFkLlxyXG4gICAgICogQHNlZSBWZWN0b3IyLk1BR05JVFVERVNRUlxyXG4gICAgICogQHBhcmFtIF92ZWN0b3IgVGhlIHZlY3RvciB0byBnZXQgdGhlIG1hZ25pdHVkZSBvZi5cclxuICAgICAqIEByZXR1cm5zIEEgbnVtYmVyIHJlcHJlc2VudGluZyB0aGUgbWFnbml0dWRlIG9mIHRoZSBnaXZlbiB2ZWN0b3IuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgTUFHTklUVURFKF92ZWN0b3I6IFZlY3RvcjIpOiBudW1iZXIge1xyXG4gICAgICBsZXQgbWFnbml0dWRlOiBudW1iZXIgPSBNYXRoLnNxcnQoVmVjdG9yMi5NQUdOSVRVREVTUVIoX3ZlY3RvcikpO1xyXG4gICAgICByZXR1cm4gbWFnbml0dWRlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgc3F1YXJlZCBtYWduaXR1ZGUgb2YgYSBnaXZlbiB2ZWN0b3IuIE11Y2ggbGVzcyBjYWxjdWxhdGlvbiBpbnRlbnNpdmUgdGhhbiBWZWN0b3IyLk1BR05JVFVERSwgc2hvdWxkIGJlIHVzZWQgaW5zdGVhZCBpZiBwb3NzaWJsZS5cclxuICAgICAqIEBwYXJhbSBfdmVjdG9yIFRoZSB2ZWN0b3IgdG8gZ2V0IHRoZSBzcXVhcmVkIG1hZ25pdHVkZSBvZi5cclxuICAgICAqIEByZXR1cm5zIEEgbnVtYmVyIHJlcHJlc2VudGluZyB0aGUgc3F1YXJlZCBtYWduaXR1ZGUgb2YgdGhlIGdpdmVuIHZlY3Rvci5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBNQUdOSVRVREVTUVIoX3ZlY3RvcjogVmVjdG9yMik6IG51bWJlciB7XHJcbiAgICAgIGxldCBtYWduaXR1ZGU6IG51bWJlciA9IFZlY3RvcjIuRE9UKF92ZWN0b3IsIF92ZWN0b3IpO1xyXG4gICAgICByZXR1cm4gbWFnbml0dWRlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsY3VsYXRlcyB0aGUgY3Jvc3MgcHJvZHVjdCBvZiB0d28gVmVjdG9ycy4gRHVlIHRvIHRoZW0gYmVpbmcgb25seSAyIERpbWVuc2lvbmFsLCB0aGUgcmVzdWx0IGlzIGEgc2luZ2xlIG51bWJlcixcclxuICAgICAqIHdoaWNoIGltcGxpY2l0bHkgaXMgb24gdGhlIFogYXhpcy4gSXQgaXMgYWxzbyB0aGUgc2lnbmVkIG1hZ25pdHVkZSBvZiB0aGUgcmVzdWx0LlxyXG4gICAgICogQHBhcmFtIF9hIFZlY3RvciB0byBjb21wdXRlIHRoZSBjcm9zcyBwcm9kdWN0IG9uXHJcbiAgICAgKiBAcGFyYW0gX2IgVmVjdG9yIHRvIGNvbXB1dGUgdGhlIGNyb3NzIHByb2R1Y3Qgd2l0aFxyXG4gICAgICogQHJldHVybnMgQSBudW1iZXIgcmVwcmVzZW50aW5nIHJlc3VsdCBvZiB0aGUgY3Jvc3MgcHJvZHVjdC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBDUk9TU1BST0RVQ1QoX2E6IFZlY3RvcjIsIF9iOiBWZWN0b3IyKTogbnVtYmVyIHtcclxuICAgICAgbGV0IGNyb3NzUHJvZHVjdDogbnVtYmVyID0gX2EueCAqIF9iLnkgLSBfYS55ICogX2IueDtcclxuICAgICAgcmV0dXJuIGNyb3NzUHJvZHVjdDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGN1bGF0ZXMgdGhlIG9ydGhvZ29uYWwgdmVjdG9yIHRvIHRoZSBnaXZlbiB2ZWN0b3IuIFJvdGF0ZXMgY291bnRlcmNsb2Nrd2lzZSBieSBkZWZhdWx0LlxyXG4gICAgICogYGBgcGxhaW50ZXh0XHJcbiAgICAgKiAgICBeICAgICAgICAgICAgICAgIHxcclxuICAgICAqICAgIHwgID0+ICA8LS0gID0+ICAgdiAgPT4gIC0tPlxyXG4gICAgICogYGBgXHJcbiAgICAgKiBAcGFyYW0gX3ZlY3RvciBWZWN0b3IgdG8gZ2V0IHRoZSBvcnRob2dvbmFsIGVxdWl2YWxlbnQgb2ZcclxuICAgICAqIEBwYXJhbSBfY2xvY2t3aXNlIFNob3VsZCB0aGUgcm90YXRpb24gYmUgY2xvY2t3aXNlIGluc3RlYWQgb2YgdGhlIGRlZmF1bHQgY291bnRlcmNsb2Nrd2lzZT8gZGVmYXVsdDogZmFsc2VcclxuICAgICAqIEByZXR1cm5zIEEgVmVjdG9yIHRoYXQgaXMgb3J0aG9nb25hbCB0byBhbmQgaGFzIHRoZSBzYW1lIG1hZ25pdHVkZSBhcyB0aGUgZ2l2ZW4gVmVjdG9yLiAgXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgT1JUSE9HT05BTChfdmVjdG9yOiBWZWN0b3IyLCBfY2xvY2t3aXNlOiBib29sZWFuID0gZmFsc2UpOiBWZWN0b3IyIHtcclxuICAgICAgaWYgKF9jbG9ja3dpc2UpIHJldHVybiBuZXcgVmVjdG9yMihfdmVjdG9yLnksIC1fdmVjdG9yLngpO1xyXG4gICAgICBlbHNlIHJldHVybiBuZXcgVmVjdG9yMigtX3ZlY3Rvci55LCBfdmVjdG9yLngpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkcyB0aGUgZ2l2ZW4gdmVjdG9yIHRvIHRoZSBleGVjdXRpbmcgdmVjdG9yLCBjaGFuZ2luZyB0aGUgZXhlY3V0b3IuXHJcbiAgICAgKiBAcGFyYW0gX2FkZGVuZCBUaGUgdmVjdG9yIHRvIGFkZC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGFkZChfYWRkZW5kOiBWZWN0b3IyKTogdm9pZCB7XHJcbiAgICAgIHRoaXMuZGF0YSA9IG5ldyBWZWN0b3IyKF9hZGRlbmQueCArIHRoaXMueCwgX2FkZGVuZC55ICsgdGhpcy55KS5kYXRhO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3VidHJhY3RzIHRoZSBnaXZlbiB2ZWN0b3IgZnJvbSB0aGUgZXhlY3V0aW5nIHZlY3RvciwgY2hhbmdpbmcgdGhlIGV4ZWN1dG9yLlxyXG4gICAgICogQHBhcmFtIF9zdWJ0cmFoZW5kIFRoZSB2ZWN0b3IgdG8gc3VidHJhY3QuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdWJ0cmFjdChfc3VidHJhaGVuZDogVmVjdG9yMik6IHZvaWQge1xyXG4gICAgICB0aGlzLmRhdGEgPSBuZXcgVmVjdG9yMih0aGlzLnggLSBfc3VidHJhaGVuZC54LCB0aGlzLnkgLSBfc3VidHJhaGVuZC55KS5kYXRhO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2NhbGVzIHRoZSBWZWN0b3IgYnkgdGhlIF9zY2FsZS5cclxuICAgICAqIEBwYXJhbSBfc2NhbGUgVGhlIHNjYWxlIHRvIG11bHRpcGx5IHRoZSB2ZWN0b3Igd2l0aC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHNjYWxlKF9zY2FsZTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgIHRoaXMuZGF0YSA9IG5ldyBWZWN0b3IyKF9zY2FsZSAqIHRoaXMueCwgX3NjYWxlICogdGhpcy55KS5kYXRhO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTm9ybWFsaXplcyB0aGUgdmVjdG9yLlxyXG4gICAgICogQHBhcmFtIF9sZW5ndGggQSBtb2RpZmljYXRvciB0byBnZXQgYSBkaWZmZXJlbnQgbGVuZ3RoIG9mIG5vcm1hbGl6ZWQgdmVjdG9yLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgbm9ybWFsaXplKF9sZW5ndGg6IG51bWJlciA9IDEpOiB2b2lkIHtcclxuICAgICAgdGhpcy5kYXRhID0gVmVjdG9yMi5OT1JNQUxJWkFUSU9OKHRoaXMsIF9sZW5ndGgpLmRhdGE7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSBWZWN0b3IgdG8gdGhlIGdpdmVuIHBhcmFtZXRlcnMuIE9tbWl0dGVkIHBhcmFtZXRlcnMgZGVmYXVsdCB0byAwLlxyXG4gICAgICogQHBhcmFtIF94IG5ldyB4IHRvIHNldFxyXG4gICAgICogQHBhcmFtIF95IG5ldyB5IHRvIHNldFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2V0KF94OiBudW1iZXIgPSAwLCBfeTogbnVtYmVyID0gMCk6IHZvaWQge1xyXG4gICAgICB0aGlzLmRhdGEgPSBuZXcgRmxvYXQzMkFycmF5KFtfeCwgX3ldKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrcyB3aGV0aGVyIHRoZSBnaXZlbiBWZWN0b3IgaXMgZXF1YWwgdG8gdGhlIGV4ZWN1dGVkIFZlY3Rvci5cclxuICAgICAqIEBwYXJhbSBfdmVjdG9yIFRoZSB2ZWN0b3IgdG8gY29tYXByZSB3aXRoLlxyXG4gICAgICogQHJldHVybnMgdHJ1ZSBpZiB0aGUgdHdvIHZlY3RvcnMgYXJlIGVxdWFsLCBvdGhlcndpc2UgZmFsc2VcclxuICAgICAqL1xyXG4gICAgcHVibGljIGVxdWFscyhfdmVjdG9yOiBWZWN0b3IyKTogYm9vbGVhbiB7XHJcbiAgICAgIGlmICh0aGlzLmRhdGFbMF0gPT0gX3ZlY3Rvci5kYXRhWzBdICYmIHRoaXMuZGF0YVsxXSA9PSBfdmVjdG9yLmRhdGFbMV0pIHJldHVybiB0cnVlO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcmV0dXJucyBBbiBhcnJheSBvZiB0aGUgZGF0YSBvZiB0aGUgdmVjdG9yXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQoKTogRmxvYXQzMkFycmF5IHtcclxuICAgICAgcmV0dXJuIG5ldyBGbG9hdDMyQXJyYXkodGhpcy5kYXRhKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm5zIEEgZGVlcCBjb3B5IG9mIHRoZSB2ZWN0b3IuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXQgY29weSgpOiBWZWN0b3IyIHtcclxuICAgICAgcmV0dXJuIG5ldyBWZWN0b3IyKHRoaXMueCwgdGhpcy55KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgYSB6LWNvbXBvbmVudCB0byB0aGUgdmVjdG9yIGFuZCByZXR1cm5zIGEgbmV3IFZlY3RvcjNcclxuICAgICAqL1xyXG4gICAgcHVibGljIHRvVmVjdG9yMygpOiBWZWN0b3IzIHtcclxuICAgICAgcmV0dXJuIG5ldyBWZWN0b3IzKHRoaXMueCwgdGhpcy55LCAwKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0TXV0YXRvcigpOiBNdXRhdG9yIHtcclxuICAgICAgbGV0IG11dGF0b3I6IE11dGF0b3IgPSB7XHJcbiAgICAgICAgeDogdGhpcy5kYXRhWzBdLCB5OiB0aGlzLmRhdGFbMV1cclxuICAgICAgfTtcclxuICAgICAgcmV0dXJuIG11dGF0b3I7XHJcbiAgICB9XHJcbiAgICBwcm90ZWN0ZWQgcmVkdWNlTXV0YXRvcihfbXV0YXRvcjogTXV0YXRvcik6IHZvaWQgey8qKiAqLyB9XHJcbiAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIFN0b3JlcyBhbmQgbWFuaXB1bGF0ZXMgYSB0aHJlZWRpbWVuc2lvbmFsIHZlY3RvciBjb21wcmlzZWQgb2YgdGhlIGNvbXBvbmVudHMgeCwgeSBhbmQgelxyXG4gICAgICogYGBgcGxhaW50ZXh0XHJcbiAgICAgKiAgICAgICAgICAgICt5XHJcbiAgICAgKiAgICAgICAgICAgICB8X18gK3hcclxuICAgICAqICAgICAgICAgICAgL1xyXG4gICAgICogICAgICAgICAgK3ogICBcclxuICAgICAqIGBgYFxyXG4gICAgICogQGF1dGhvcnMgSmFzY2hhIEthcmFnw7ZsLCBIRlUsIDIwMTkgfCBKaXJrYSBEZWxsJ09yby1GcmllZGwsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgVmVjdG9yMyBleHRlbmRzIE11dGFibGUge1xyXG4gICAgICAgIHByaXZhdGUgZGF0YTogRmxvYXQzMkFycmF5OyAvLyBUT0RPOiBjaGVjayB3aHkgdGhpcyBzaG91bGRuJ3QgYmUgeCx5LHogYXMgbnVtYmVycy4uLlxyXG5cclxuICAgICAgICBwdWJsaWMgY29uc3RydWN0b3IoX3g6IG51bWJlciA9IDAsIF95OiBudW1iZXIgPSAwLCBfejogbnVtYmVyID0gMCkge1xyXG4gICAgICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBuZXcgRmxvYXQzMkFycmF5KFtfeCwgX3ksIF96XSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBUT0RPOiBpbXBsZW1lbnQgZXF1YWxzLWZ1bmN0aW9uc1xyXG4gICAgICAgIGdldCB4KCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGFbMF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGdldCB5KCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGFbMV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGdldCB6KCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGFbMl07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzZXQgeChfeDogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVswXSA9IF94O1xyXG4gICAgICAgIH1cclxuICAgICAgICBzZXQgeShfeTogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsxXSA9IF95O1xyXG4gICAgICAgIH1cclxuICAgICAgICBzZXQgeihfejogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVsyXSA9IF96O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBYKF9zY2FsZTogbnVtYmVyID0gMSk6IFZlY3RvcjMge1xyXG4gICAgICAgICAgICBjb25zdCB2ZWN0b3I6IFZlY3RvcjMgPSBuZXcgVmVjdG9yMyhfc2NhbGUsIDAsIDApO1xyXG4gICAgICAgICAgICByZXR1cm4gdmVjdG9yO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBZKF9zY2FsZTogbnVtYmVyID0gMSk6IFZlY3RvcjMge1xyXG4gICAgICAgICAgICBjb25zdCB2ZWN0b3I6IFZlY3RvcjMgPSBuZXcgVmVjdG9yMygwLCBfc2NhbGUsIDApO1xyXG4gICAgICAgICAgICByZXR1cm4gdmVjdG9yO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBaKF9zY2FsZTogbnVtYmVyID0gMSk6IFZlY3RvcjMge1xyXG4gICAgICAgICAgICBjb25zdCB2ZWN0b3I6IFZlY3RvcjMgPSBuZXcgVmVjdG9yMygwLCAwLCBfc2NhbGUpO1xyXG4gICAgICAgICAgICByZXR1cm4gdmVjdG9yO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBaRVJPKCk6IFZlY3RvcjMge1xyXG4gICAgICAgICAgICBjb25zdCB2ZWN0b3I6IFZlY3RvcjMgPSBuZXcgVmVjdG9yMygwLCAwLCAwKTtcclxuICAgICAgICAgICAgcmV0dXJuIHZlY3RvcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgT05FKF9zY2FsZTogbnVtYmVyID0gMSk6IFZlY3RvcjMge1xyXG4gICAgICAgICAgICBjb25zdCB2ZWN0b3I6IFZlY3RvcjMgPSBuZXcgVmVjdG9yMyhfc2NhbGUsIF9zY2FsZSwgX3NjYWxlKTtcclxuICAgICAgICAgICAgcmV0dXJuIHZlY3RvcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgVFJBTlNGT1JNQVRJT04oX3ZlY3RvcjogVmVjdG9yMywgX21hdHJpeDogTWF0cml4NHg0LCBfaW5jbHVkZVRyYW5zbGF0aW9uOiBib29sZWFuID0gdHJ1ZSk6IFZlY3RvcjMge1xyXG4gICAgICAgICAgICBsZXQgcmVzdWx0OiBWZWN0b3IzID0gbmV3IFZlY3RvcjMoKTtcclxuICAgICAgICAgICAgbGV0IG06IEZsb2F0MzJBcnJheSA9IF9tYXRyaXguZ2V0KCk7XHJcbiAgICAgICAgICAgIGxldCBbeCwgeSwgel0gPSBfdmVjdG9yLmdldCgpO1xyXG4gICAgICAgICAgICByZXN1bHQueCA9IG1bMF0gKiB4ICsgbVs0XSAqIHkgKyBtWzhdICogejtcclxuICAgICAgICAgICAgcmVzdWx0LnkgPSBtWzFdICogeCArIG1bNV0gKiB5ICsgbVs5XSAqIHo7XHJcbiAgICAgICAgICAgIHJlc3VsdC56ID0gbVsyXSAqIHggKyBtWzZdICogeSArIG1bMTBdICogejtcclxuXHJcbiAgICAgICAgICAgIGlmIChfaW5jbHVkZVRyYW5zbGF0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQuYWRkKF9tYXRyaXgudHJhbnNsYXRpb24pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgTk9STUFMSVpBVElPTihfdmVjdG9yOiBWZWN0b3IzLCBfbGVuZ3RoOiBudW1iZXIgPSAxKTogVmVjdG9yMyB7XHJcbiAgICAgICAgICAgIGxldCB2ZWN0b3I6IFZlY3RvcjMgPSBWZWN0b3IzLlpFUk8oKTtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGxldCBbeCwgeSwgel0gPSBfdmVjdG9yLmRhdGE7XHJcbiAgICAgICAgICAgICAgICBsZXQgZmFjdG9yOiBudW1iZXIgPSBfbGVuZ3RoIC8gTWF0aC5oeXBvdCh4LCB5LCB6KTtcclxuICAgICAgICAgICAgICAgIHZlY3Rvci5kYXRhID0gbmV3IEZsb2F0MzJBcnJheShbX3ZlY3Rvci54ICogZmFjdG9yLCBfdmVjdG9yLnkgKiBmYWN0b3IsIF92ZWN0b3IueiAqIGZhY3Rvcl0pO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChfZSkge1xyXG4gICAgICAgICAgICAgICAgRGVidWcud2FybihfZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHZlY3RvcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFN1bXMgdXAgbXVsdGlwbGUgdmVjdG9ycy5cclxuICAgICAgICAgKiBAcGFyYW0gX3ZlY3RvcnMgQSBzZXJpZXMgb2YgdmVjdG9ycyB0byBzdW0gdXBcclxuICAgICAgICAgKiBAcmV0dXJucyBBIG5ldyB2ZWN0b3IgcmVwcmVzZW50aW5nIHRoZSBzdW0gb2YgdGhlIGdpdmVuIHZlY3RvcnNcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIFNVTSguLi5fdmVjdG9yczogVmVjdG9yM1tdKTogVmVjdG9yMyB7XHJcbiAgICAgICAgICAgIGxldCByZXN1bHQ6IFZlY3RvcjMgPSBuZXcgVmVjdG9yMygpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCB2ZWN0b3Igb2YgX3ZlY3RvcnMpXHJcbiAgICAgICAgICAgICAgICByZXN1bHQuZGF0YSA9IG5ldyBGbG9hdDMyQXJyYXkoW3Jlc3VsdC54ICsgdmVjdG9yLngsIHJlc3VsdC55ICsgdmVjdG9yLnksIHJlc3VsdC56ICsgdmVjdG9yLnpdKTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU3VidHJhY3RzIHR3byB2ZWN0b3JzLlxyXG4gICAgICAgICAqIEBwYXJhbSBfYSBUaGUgdmVjdG9yIHRvIHN1YnRyYWN0IGZyb20uXHJcbiAgICAgICAgICogQHBhcmFtIF9iIFRoZSB2ZWN0b3IgdG8gc3VidHJhY3QuXHJcbiAgICAgICAgICogQHJldHVybnMgQSBuZXcgdmVjdG9yIHJlcHJlc2VudGluZyB0aGUgZGlmZmVyZW5jZSBvZiB0aGUgZ2l2ZW4gdmVjdG9yc1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgRElGRkVSRU5DRShfYTogVmVjdG9yMywgX2I6IFZlY3RvcjMpOiBWZWN0b3IzIHtcclxuICAgICAgICAgICAgbGV0IHZlY3RvcjogVmVjdG9yMyA9IG5ldyBWZWN0b3IzO1xyXG4gICAgICAgICAgICB2ZWN0b3IuZGF0YSA9IG5ldyBGbG9hdDMyQXJyYXkoW19hLnggLSBfYi54LCBfYS55IC0gX2IueSwgX2EueiAtIF9iLnpdKTtcclxuICAgICAgICAgICAgcmV0dXJuIHZlY3RvcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyBhIG5ldyB2ZWN0b3IgcmVwcmVzZW50aW5nIHRoZSBnaXZlbiB2ZWN0b3Igc2NhbGVkIGJ5IHRoZSBnaXZlbiBzY2FsaW5nIGZhY3RvclxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgU0NBTEUoX3ZlY3RvcjogVmVjdG9yMywgX3NjYWxpbmc6IG51bWJlcik6IFZlY3RvcjMge1xyXG4gICAgICAgICAgICBsZXQgc2NhbGVkOiBWZWN0b3IzID0gbmV3IFZlY3RvcjMoKTtcclxuICAgICAgICAgICAgc2NhbGVkLmRhdGEgPSBuZXcgRmxvYXQzMkFycmF5KFtfdmVjdG9yLnggKiBfc2NhbGluZywgX3ZlY3Rvci55ICogX3NjYWxpbmcsIF92ZWN0b3IueiAqIF9zY2FsaW5nXSk7XHJcbiAgICAgICAgICAgIHJldHVybiBzY2FsZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENvbXB1dGVzIHRoZSBjcm9zc3Byb2R1Y3Qgb2YgMiB2ZWN0b3JzLlxyXG4gICAgICAgICAqIEBwYXJhbSBfYSBUaGUgdmVjdG9yIHRvIG11bHRpcGx5LlxyXG4gICAgICAgICAqIEBwYXJhbSBfYiBUaGUgdmVjdG9yIHRvIG11bHRpcGx5IGJ5LlxyXG4gICAgICAgICAqIEByZXR1cm5zIEEgbmV3IHZlY3RvciByZXByZXNlbnRpbmcgdGhlIGNyb3NzcHJvZHVjdCBvZiB0aGUgZ2l2ZW4gdmVjdG9yc1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgQ1JPU1MoX2E6IFZlY3RvcjMsIF9iOiBWZWN0b3IzKTogVmVjdG9yMyB7XHJcbiAgICAgICAgICAgIGxldCB2ZWN0b3I6IFZlY3RvcjMgPSBuZXcgVmVjdG9yMztcclxuICAgICAgICAgICAgdmVjdG9yLmRhdGEgPSBuZXcgRmxvYXQzMkFycmF5KFtcclxuICAgICAgICAgICAgICAgIF9hLnkgKiBfYi56IC0gX2EueiAqIF9iLnksXHJcbiAgICAgICAgICAgICAgICBfYS56ICogX2IueCAtIF9hLnggKiBfYi56LFxyXG4gICAgICAgICAgICAgICAgX2EueCAqIF9iLnkgLSBfYS55ICogX2IueF0pO1xyXG4gICAgICAgICAgICByZXR1cm4gdmVjdG9yO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDb21wdXRlcyB0aGUgZG90cHJvZHVjdCBvZiAyIHZlY3RvcnMuXHJcbiAgICAgICAgICogQHBhcmFtIF9hIFRoZSB2ZWN0b3IgdG8gbXVsdGlwbHkuXHJcbiAgICAgICAgICogQHBhcmFtIF9iIFRoZSB2ZWN0b3IgdG8gbXVsdGlwbHkgYnkuXHJcbiAgICAgICAgICogQHJldHVybnMgQSBuZXcgdmVjdG9yIHJlcHJlc2VudGluZyB0aGUgZG90cHJvZHVjdCBvZiB0aGUgZ2l2ZW4gdmVjdG9yc1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgRE9UKF9hOiBWZWN0b3IzLCBfYjogVmVjdG9yMyk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIGxldCBzY2FsYXJQcm9kdWN0OiBudW1iZXIgPSBfYS54ICogX2IueCArIF9hLnkgKiBfYi55ICsgX2EueiAqIF9iLno7XHJcbiAgICAgICAgICAgIHJldHVybiBzY2FsYXJQcm9kdWN0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ2FsY3VsYXRlcyBhbmQgcmV0dXJucyB0aGUgcmVmbGVjdGlvbiBvZiB0aGUgaW5jb21pbmcgdmVjdG9yIGF0IHRoZSBnaXZlbiBub3JtYWwgdmVjdG9yLiBUaGUgbGVuZ3RoIG9mIG5vcm1hbCBzaG91bGQgYmUgMS5cclxuICAgICAgICAgKiAgICAgX19fX19fX19fX19fX19fX19fXHJcbiAgICAgICAgICogICAgICAgICAgIC98XFxcclxuICAgICAgICAgKiBpbmNvbWluZyAvIHwgXFwgcmVmbGVjdGlvblxyXG4gICAgICAgICAqICAgICAgICAgLyAgfCAgXFwgICBcclxuICAgICAgICAgKiAgICAgICAgICBub3JtYWxcclxuICAgICAgICAgKiBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIFJFRkxFQ1RJT04oX2luY29taW5nOiBWZWN0b3IzLCBfbm9ybWFsOiBWZWN0b3IzKTogVmVjdG9yMyB7XHJcbiAgICAgICAgICAgIGxldCBkb3Q6IG51bWJlciA9IC1WZWN0b3IzLkRPVChfaW5jb21pbmcsIF9ub3JtYWwpO1xyXG4gICAgICAgICAgICBsZXQgcmVmbGVjdGlvbjogVmVjdG9yMyA9IFZlY3RvcjMuU1VNKF9pbmNvbWluZywgVmVjdG9yMy5TQ0FMRShfbm9ybWFsLCAyICogZG90KSk7XHJcbiAgICAgICAgICAgIHJldHVybiByZWZsZWN0aW9uO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGFkZChfYWRkZW5kOiBWZWN0b3IzKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IG5ldyBWZWN0b3IzKF9hZGRlbmQueCArIHRoaXMueCwgX2FkZGVuZC55ICsgdGhpcy55LCBfYWRkZW5kLnogKyB0aGlzLnopLmRhdGE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHB1YmxpYyBzdWJ0cmFjdChfc3VidHJhaGVuZDogVmVjdG9yMyk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBuZXcgVmVjdG9yMyh0aGlzLnggLSBfc3VidHJhaGVuZC54LCB0aGlzLnkgLSBfc3VidHJhaGVuZC55LCB0aGlzLnogLSBfc3VidHJhaGVuZC56KS5kYXRhO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwdWJsaWMgc2NhbGUoX3NjYWxlOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5kYXRhID0gbmV3IFZlY3RvcjMoX3NjYWxlICogdGhpcy54LCBfc2NhbGUgKiB0aGlzLnksIF9zY2FsZSAqIHRoaXMueikuZGF0YTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBub3JtYWxpemUoX2xlbmd0aDogbnVtYmVyID0gMSk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBWZWN0b3IzLk5PUk1BTElaQVRJT04odGhpcywgX2xlbmd0aCkuZGF0YTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzZXQoX3g6IG51bWJlciA9IDAsIF95OiBudW1iZXIgPSAwLCBfejogbnVtYmVyID0gMCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBuZXcgRmxvYXQzMkFycmF5KFtfeCwgX3ksIF96XSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0KCk6IEZsb2F0MzJBcnJheSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgRmxvYXQzMkFycmF5KHRoaXMuZGF0YSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0IGNvcHkoKTogVmVjdG9yMyB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVmVjdG9yMyh0aGlzLngsIHRoaXMueSwgdGhpcy56KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB0cmFuc2Zvcm0oX21hdHJpeDogTWF0cml4NHg0LCBfaW5jbHVkZVRyYW5zbGF0aW9uOiBib29sZWFuID0gdHJ1ZSk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBWZWN0b3IzLlRSQU5TRk9STUFUSU9OKHRoaXMsIF9tYXRyaXgsIF9pbmNsdWRlVHJhbnNsYXRpb24pLmRhdGE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEcm9wcyB0aGUgei1jb21wb25lbnQgYW5kIHJldHVybnMgYSBWZWN0b3IyIGNvbnNpc3Rpbmcgb2YgdGhlIHgtIGFuZCB5LWNvbXBvbmVudHNcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgdG9WZWN0b3IyKCk6IFZlY3RvcjIge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFZlY3RvcjIodGhpcy54LCB0aGlzLnkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHJlZmxlY3QoX25vcm1hbDogVmVjdG9yMyk6IHZvaWQge1xyXG4gICAgICAgICAgICBjb25zdCByZWZsZWN0ZWQ6IFZlY3RvcjMgPSBWZWN0b3IzLlJFRkxFQ1RJT04odGhpcywgX25vcm1hbCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0KHJlZmxlY3RlZC54LCByZWZsZWN0ZWQueSwgcmVmbGVjdGVkLnopO1xyXG4gICAgICAgICAgICBSZWN5Y2xlci5zdG9yZShyZWZsZWN0ZWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldE11dGF0b3IoKTogTXV0YXRvciB7XHJcbiAgICAgICAgICAgIGxldCBtdXRhdG9yOiBNdXRhdG9yID0ge1xyXG4gICAgICAgICAgICAgICAgeDogdGhpcy5kYXRhWzBdLCB5OiB0aGlzLmRhdGFbMV0sIHo6IHRoaXMuZGF0YVsyXVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICByZXR1cm4gbXV0YXRvcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHJvdGVjdGVkIHJlZHVjZU11dGF0b3IoX211dGF0b3I6IE11dGF0b3IpOiB2b2lkIHsvKiogKi8gfVxyXG4gICAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIEFic3RyYWN0IGJhc2UgY2xhc3MgZm9yIGFsbCBtZXNoZXMuIFxyXG4gICAgICogTWVzaGVzIHByb3ZpZGUgaW5kZXhlZCB2ZXJ0aWNlcywgdGhlIG9yZGVyIG9mIGluZGljZXMgdG8gY3JlYXRlIHRyaWdvbnMgYW5kIG5vcm1hbHMsIGFuZCB0ZXh0dXJlIGNvb3JkaW5hdGVzXHJcbiAgICAgKiBcclxuICAgICAqIEBhdXRob3JzIEppcmthIERlbGwnT3JvLUZyaWVkbCwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBhYnN0cmFjdCBjbGFzcyBNZXNoIGltcGxlbWVudHMgU2VyaWFsaXphYmxlUmVzb3VyY2Uge1xyXG4gICAgICAgIC8vIFRPRE86IGNoZWNrIGlmIHRoZXNlIGFycmF5cyBtdXN0IGJlIGNhY2hlZCBsaWtlIHRoaXMgb3IgaWYgY2FsbGluZyB0aGUgbWV0aG9kcyBpcyBiZXR0ZXIuXHJcbiAgICAgICAgcHVibGljIHZlcnRpY2VzOiBGbG9hdDMyQXJyYXk7XHJcbiAgICAgICAgcHVibGljIGluZGljZXM6IFVpbnQxNkFycmF5O1xyXG4gICAgICAgIHB1YmxpYyB0ZXh0dXJlVVZzOiBGbG9hdDMyQXJyYXk7XHJcbiAgICAgICAgcHVibGljIG5vcm1hbHNGYWNlOiBGbG9hdDMyQXJyYXk7XHJcblxyXG4gICAgICAgIHB1YmxpYyBpZFJlc291cmNlOiBzdHJpbmcgPSB1bmRlZmluZWQ7XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0QnVmZmVyU3BlY2lmaWNhdGlvbigpOiBCdWZmZXJTcGVjaWZpY2F0aW9uIHtcclxuICAgICAgICAgICAgcmV0dXJuIHsgc2l6ZTogMywgZGF0YVR5cGU6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuRkxPQVQsIG5vcm1hbGl6ZTogZmFsc2UsIHN0cmlkZTogMCwgb2Zmc2V0OiAwIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHB1YmxpYyBnZXRWZXJ0ZXhDb3VudCgpOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy52ZXJ0aWNlcy5sZW5ndGggLyBNZXNoLmdldEJ1ZmZlclNwZWNpZmljYXRpb24oKS5zaXplO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwdWJsaWMgZ2V0SW5kZXhDb3VudCgpOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pbmRpY2VzLmxlbmd0aDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFNlcmlhbGl6ZS9EZXNlcmlhbGl6ZSBmb3IgYWxsIG1lc2hlcyB0aGF0IGNhbGN1bGF0ZSB3aXRob3V0IHBhcmFtZXRlcnNcclxuICAgICAgICBwdWJsaWMgc2VyaWFsaXplKCk6IFNlcmlhbGl6YXRpb24ge1xyXG4gICAgICAgICAgICBsZXQgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IHtcclxuICAgICAgICAgICAgICAgIGlkUmVzb3VyY2U6IHRoaXMuaWRSZXNvdXJjZVxyXG4gICAgICAgICAgICB9OyAvLyBubyBkYXRhIG5lZWRlZCAuLi5cclxuICAgICAgICAgICAgcmV0dXJuIHNlcmlhbGl6YXRpb247XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHB1YmxpYyBkZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbik6IFNlcmlhbGl6YWJsZSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlKCk7IC8vIFRPRE86IG11c3Qgbm90IGJlIGNyZWF0ZWQsIGlmIGFuIGlkZW50aWNhbCBtZXNoIGFscmVhZHkgZXhpc3RzXHJcbiAgICAgICAgICAgIHRoaXMuaWRSZXNvdXJjZSA9IF9zZXJpYWxpemF0aW9uLmlkUmVzb3VyY2U7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGFic3RyYWN0IGNyZWF0ZSgpOiB2b2lkO1xyXG4gICAgICAgIHByb3RlY3RlZCBhYnN0cmFjdCBjcmVhdGVWZXJ0aWNlcygpOiBGbG9hdDMyQXJyYXk7XHJcbiAgICAgICAgcHJvdGVjdGVkIGFic3RyYWN0IGNyZWF0ZVRleHR1cmVVVnMoKTogRmxvYXQzMkFycmF5O1xyXG4gICAgICAgIHByb3RlY3RlZCBhYnN0cmFjdCBjcmVhdGVJbmRpY2VzKCk6IFVpbnQxNkFycmF5O1xyXG4gICAgICAgIHByb3RlY3RlZCBhYnN0cmFjdCBjcmVhdGVGYWNlTm9ybWFscygpOiBGbG9hdDMyQXJyYXk7XHJcbiAgICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogR2VuZXJhdGUgYSBzaW1wbGUgY3ViZSB3aXRoIGVkZ2VzIG9mIGxlbmd0aCAxLCBlYWNoIGZhY2UgY29uc2lzdGluZyBvZiB0d28gdHJpZ29uc1xyXG4gICAgICogYGBgcGxhaW50ZXh0XHJcbiAgICAgKiAgICAgICAgICAgIDRfX19fN1xyXG4gICAgICogICAgICAgICAgIDAvX18zL3xcclxuICAgICAqICAgICAgICAgICAgfHw1X3x8NlxyXG4gICAgICogICAgICAgICAgIDF8L18yfC8gXHJcbiAgICAgKiBgYGBcclxuICAgICAqIEBhdXRob3JzIEppcmthIERlbGwnT3JvLUZyaWVkbCwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBNZXNoQ3ViZSBleHRlbmRzIE1lc2gge1xyXG4gICAgICAgIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBjcmVhdGUoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMudmVydGljZXMgPSB0aGlzLmNyZWF0ZVZlcnRpY2VzKCk7XHJcbiAgICAgICAgICAgIHRoaXMuaW5kaWNlcyA9IHRoaXMuY3JlYXRlSW5kaWNlcygpO1xyXG4gICAgICAgICAgICB0aGlzLnRleHR1cmVVVnMgPSB0aGlzLmNyZWF0ZVRleHR1cmVVVnMoKTtcclxuICAgICAgICAgICAgdGhpcy5ub3JtYWxzRmFjZSA9IHRoaXMuY3JlYXRlRmFjZU5vcm1hbHMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByb3RlY3RlZCBjcmVhdGVWZXJ0aWNlcygpOiBGbG9hdDMyQXJyYXkge1xyXG4gICAgICAgICAgICBsZXQgdmVydGljZXM6IEZsb2F0MzJBcnJheSA9IG5ldyBGbG9hdDMyQXJyYXkoW1xyXG4gICAgICAgICAgICAgICAgLy8gRmlyc3Qgd3JhcFxyXG4gICAgICAgICAgICAgICAgLy8gZnJvbnRcclxuICAgICAgICAgICAgICAgIC8qMCovIC0xLCAxLCAxLCAvKjEqLyAtMSwgLTEsIDEsICAvKjIqLyAxLCAtMSwgMSwgLyozKi8gMSwgMSwgMSxcclxuICAgICAgICAgICAgICAgIC8vIGJhY2tcclxuICAgICAgICAgICAgICAgIC8qNCovIC0xLCAxLCAtMSwgLyogNSovIC0xLCAtMSwgLTEsICAvKiA2Ki8gMSwgLTEsIC0xLCAvKiA3Ki8gMSwgMSwgLTEsXHJcbiAgICAgICAgICAgICAgICAvLyBTZWNvbmQgd3JhcFxyXG4gICAgICAgICAgICAgICAgLy8gZnJvbnRcclxuICAgICAgICAgICAgICAgIC8qMCovIC0xLCAxLCAxLCAvKjEqLyAtMSwgLTEsIDEsICAvKjIqLyAxLCAtMSwgMSwgLyozKi8gMSwgMSwgMSxcclxuICAgICAgICAgICAgICAgIC8vIGJhY2tcclxuICAgICAgICAgICAgICAgIC8qNCovIC0xLCAxLCAtMSwgLyogNSovIC0xLCAtMSwgLTEsICAvKiA2Ki8gMSwgLTEsIC0xLCAvKiA3Ki8gMSwgMSwgLTFcclxuICAgICAgICAgICAgXSk7XHJcblxyXG4gICAgICAgICAgICAvLyBzY2FsZSBkb3duIHRvIGEgbGVuZ3RoIG9mIDEgZm9yIGFsbCBlZGdlc1xyXG4gICAgICAgICAgICB2ZXJ0aWNlcyA9IHZlcnRpY2VzLm1hcChfdmFsdWUgPT4gX3ZhbHVlIC8gMik7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdmVydGljZXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcm90ZWN0ZWQgY3JlYXRlSW5kaWNlcygpOiBVaW50MTZBcnJheSB7XHJcbiAgICAgICAgICAgIGxldCBpbmRpY2VzOiBVaW50MTZBcnJheSA9IG5ldyBVaW50MTZBcnJheShbXHJcbiAgICAgICAgICAgICAgICAvLyBGaXJzdCB3cmFwXHJcbiAgICAgICAgICAgICAgICAvLyBmcm9udFxyXG4gICAgICAgICAgICAgICAgMSwgMiwgMCwgMiwgMywgMCwgXHJcbiAgICAgICAgICAgICAgICAvLyByaWdodFxyXG4gICAgICAgICAgICAgICAgMiwgNiwgMywgNiwgNywgMyxcclxuICAgICAgICAgICAgICAgIC8vIGJhY2tcclxuICAgICAgICAgICAgICAgIDYsIDUsIDcsIDUsIDQsIDcsXHJcblxyXG4gICAgICAgICAgICAgICAgLy8gU2Vjb25kIHdyYXBcclxuICAgICAgICAgICAgICAgIC8vIGxlZnRcclxuICAgICAgICAgICAgICAgIDUgKyA4LCAxICsgOCwgNCArIDgsIDEgKyA4LCAwICsgOCwgNCArIDgsXHJcbiAgICAgICAgICAgICAgICAvLyB0b3BcclxuICAgICAgICAgICAgICAgIDQgKyA4LCAwICsgOCwgMyArIDgsIDcgKyA4LCA0ICsgOCwgMyArIDgsXHJcbiAgICAgICAgICAgICAgICAvLyBib3R0b21cclxuICAgICAgICAgICAgICAgIDUgKyA4LCA2ICsgOCwgMSArIDgsIDYgKyA4LCAyICsgOCwgMSArIDhcclxuXHJcbiAgICAgICAgICAgICAgICAvKixcclxuICAgICAgICAgICAgICAgIC8vIGxlZnRcclxuICAgICAgICAgICAgICAgIDQsIDUsIDEsIDQsIDEsIDAsXHJcbiAgICAgICAgICAgICAgICAvLyB0b3BcclxuICAgICAgICAgICAgICAgIDQsIDAsIDMsIDQsIDMsIDcsXHJcbiAgICAgICAgICAgICAgICAvLyBib3R0b21cclxuICAgICAgICAgICAgICAgIDEsIDUsIDYsIDEsIDYsIDJcclxuICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIF0pO1xyXG4gICAgICAgICAgICByZXR1cm4gaW5kaWNlcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByb3RlY3RlZCBjcmVhdGVUZXh0dXJlVVZzKCk6IEZsb2F0MzJBcnJheSB7XHJcbiAgICAgICAgICAgIGxldCB0ZXh0dXJlVVZzOiBGbG9hdDMyQXJyYXkgPSBuZXcgRmxvYXQzMkFycmF5KFtcclxuICAgICAgICAgICAgICAgIC8vIEZpcnN0IHdyYXBcclxuICAgICAgICAgICAgICAgIC8vIGZyb250XHJcbiAgICAgICAgICAgICAgICAvKjAqLyAwLCAwLCAvKjEqLyAwLCAxLCAgLyoyKi8gMSwgMSwgLyozKi8gMSwgMCxcclxuICAgICAgICAgICAgICAgIC8vIGJhY2tcclxuICAgICAgICAgICAgICAgIC8qNCovIDMsIDAsIC8qNSovIDMsIDEsICAvKjYqLyAyLCAxLCAvKjcqLyAyLCAwLFxyXG5cclxuICAgICAgICAgICAgICAgIC8vIFNlY29uZCB3cmFwXHJcbiAgICAgICAgICAgICAgICAvLyBmcm9udFxyXG4gICAgICAgICAgICAgICAgLyowKi8gMSwgMCwgLyoxKi8gMSwgMSwgIC8qMiovIDEsIDIsIC8qMyovIDEsIC0xLFxyXG4gICAgICAgICAgICAgICAgLy8gYmFja1xyXG4gICAgICAgICAgICAgICAgLyo0Ki8gMCwgMCwgLyo1Ki8gMCwgMSwgIC8qNiovIDAsIDIsIC8qNyovIDAsIC0xXHJcbiAgICAgICAgICAgIF0pO1xyXG4gICAgICAgICAgICByZXR1cm4gdGV4dHVyZVVWcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByb3RlY3RlZCBjcmVhdGVGYWNlTm9ybWFscygpOiBGbG9hdDMyQXJyYXkge1xyXG4gICAgICAgICAgICBsZXQgbm9ybWFsczogRmxvYXQzMkFycmF5ID0gbmV3IEZsb2F0MzJBcnJheShbXHJcbiAgICAgICAgICAgICAgICAvLyBmb3IgZWFjaCB0cmlhbmdsZSwgdGhlIGxhc3QgdmVydGV4IG9mIHRoZSB0aHJlZSBkZWZpbmluZyByZWZlcnMgdG8gdGhlIG5vcm1hbHZlY3RvciB3aGVuIHVzaW5nIGZsYXQgc2hhZGluZ1xyXG4gICAgICAgICAgICAgICAgLy8gRmlyc3Qgd3JhcFxyXG4gICAgICAgICAgICAgICAgLy8gZnJvbnRcclxuICAgICAgICAgICAgICAgIC8qMCovIDAsIDAsIDEsIC8qMSovIDAsIDAsIDAsIC8qMiovIDAsIDAsIDAsIC8qMyovIDEsIDAsIDAsXHJcbiAgICAgICAgICAgICAgICAvLyBiYWNrXHJcbiAgICAgICAgICAgICAgICAvKjQqLyAwLCAwLCAwLCAvKjUqLyAwLCAwLCAwLCAvKjYqLyAwLCAwLCAwLCAvKjcqLyAwLCAwLCAtMSxcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBTZWNvbmQgd3JhcFxyXG4gICAgICAgICAgICAgICAgLy8gZnJvbnRcclxuICAgICAgICAgICAgICAgIC8qMCovIDAsIDAsIDAsIC8qMSovIDAsIC0xLCAwLCAvKjIqLyAwLCAwLCAwLCAvKjMqLyAwLCAxLCAwLFxyXG4gICAgICAgICAgICAgICAgLy8gYmFja1xyXG4gICAgICAgICAgICAgICAgLyo0Ki8gLTEsIDAsIDAsIC8qNSovIDAsIDAsIDAsIC8qNiovIDAsIDAsIDAsIC8qNyovIDAsIDAsIDBcclxuICAgICAgICAgICAgXSk7XHJcblxyXG4gICAgICAgICAgICAvL25vcm1hbHMgPSB0aGlzLmNyZWF0ZVZlcnRpY2VzKCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbm9ybWFscztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogR2VuZXJhdGUgYSBzaW1wbGUgcHlyYW1pZCB3aXRoIGVkZ2VzIGF0IHRoZSBiYXNlIG9mIGxlbmd0aCAxIGFuZCBhIGhlaWdodCBvZiAxLiBUaGUgc2lkZXMgY29uc2lzdGluZyBvZiBvbmUsIHRoZSBiYXNlIG9mIHR3byB0cmlnb25zXHJcbiAgICAgKiBgYGBwbGFpbnRleHRcclxuICAgICAqICAgICAgICAgICAgICAgNFxyXG4gICAgICogICAgICAgICAgICAgIC9cXGAuXHJcbiAgICAgKiAgICAgICAgICAgIDMvX19cXF9cXCAyXHJcbiAgICAgKiAgICAgICAgICAgMC9fX19fXFwvMVxyXG4gICAgICogYGBgXHJcbiAgICAgKiBAYXV0aG9ycyBKaXJrYSBEZWxsJ09yby1GcmllZGwsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgTWVzaFB5cmFtaWQgZXh0ZW5kcyBNZXNoIHtcclxuICAgICAgICBwdWJsaWMgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgY3JlYXRlKCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLnZlcnRpY2VzID0gdGhpcy5jcmVhdGVWZXJ0aWNlcygpO1xyXG4gICAgICAgICAgICB0aGlzLmluZGljZXMgPSB0aGlzLmNyZWF0ZUluZGljZXMoKTtcclxuICAgICAgICAgICAgdGhpcy50ZXh0dXJlVVZzID0gdGhpcy5jcmVhdGVUZXh0dXJlVVZzKCk7XHJcbiAgICAgICAgICAgIHRoaXMubm9ybWFsc0ZhY2UgPSB0aGlzLmNyZWF0ZUZhY2VOb3JtYWxzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcm90ZWN0ZWQgY3JlYXRlVmVydGljZXMoKTogRmxvYXQzMkFycmF5IHtcclxuICAgICAgICAgICAgbGV0IHZlcnRpY2VzOiBGbG9hdDMyQXJyYXkgPSBuZXcgRmxvYXQzMkFycmF5KFtcclxuICAgICAgICAgICAgICAgIC8vIGZsb29yXHJcbiAgICAgICAgICAgICAgICAvKjAqLyAtMSwgMCwgMSwgLyoxKi8gMSwgMCwgMSwgIC8qMiovIDEsIDAsIC0xLCAvKjMqLyAtMSwgMCwgLTEsXHJcbiAgICAgICAgICAgICAgICAvLyB0aXBcclxuICAgICAgICAgICAgICAgIC8qNCovIDAsIDIsIDAsICAvLyBkb3VibGUgaGVpZ2h0IHdpbGwgYmUgc2NhbGVkIGRvd25cclxuICAgICAgICAgICAgICAgIC8vIGZsb29yIGFnYWluIGZvciB0ZXh0dXJpbmcgYW5kIG5vcm1hbHNcclxuICAgICAgICAgICAgICAgIC8qNSovIC0xLCAwLCAxLCAvKjYqLyAxLCAwLCAxLCAgLyo3Ki8gMSwgMCwgLTEsIC8qOCovIC0xLCAwLCAtMVxyXG4gICAgICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgICAgIC8vIHNjYWxlIGRvd24gdG8gYSBsZW5ndGggb2YgMSBmb3IgYm90dG9tIGVkZ2VzIGFuZCBoZWlnaHRcclxuICAgICAgICAgICAgdmVydGljZXMgPSB2ZXJ0aWNlcy5tYXAoX3ZhbHVlID0+IF92YWx1ZSAvIDIpO1xyXG4gICAgICAgICAgICByZXR1cm4gdmVydGljZXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcm90ZWN0ZWQgY3JlYXRlSW5kaWNlcygpOiBVaW50MTZBcnJheSB7XHJcbiAgICAgICAgICAgIGxldCBpbmRpY2VzOiBVaW50MTZBcnJheSA9IG5ldyBVaW50MTZBcnJheShbXHJcbiAgICAgICAgICAgICAgICAvLyBmcm9udFxyXG4gICAgICAgICAgICAgICAgNCwgMCwgMSxcclxuICAgICAgICAgICAgICAgIC8vIHJpZ2h0XHJcbiAgICAgICAgICAgICAgICA0LCAxLCAyLFxyXG4gICAgICAgICAgICAgICAgLy8gYmFja1xyXG4gICAgICAgICAgICAgICAgNCwgMiwgMyxcclxuICAgICAgICAgICAgICAgIC8vIGxlZnRcclxuICAgICAgICAgICAgICAgIDQsIDMsIDAsXHJcbiAgICAgICAgICAgICAgICAvLyBib3R0b21cclxuICAgICAgICAgICAgICAgIDUgKyAwLCA1ICsgMiwgNSArIDEsIDUgKyAwLCA1ICsgMywgNSArIDJcclxuICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgICAgIHJldHVybiBpbmRpY2VzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJvdGVjdGVkIGNyZWF0ZVRleHR1cmVVVnMoKTogRmxvYXQzMkFycmF5IHtcclxuICAgICAgICAgICAgbGV0IHRleHR1cmVVVnM6IEZsb2F0MzJBcnJheSA9IG5ldyBGbG9hdDMyQXJyYXkoW1xyXG4gICAgICAgICAgICAgICAgLy8gZnJvbnRcclxuICAgICAgICAgICAgICAgIC8qMCovIDAsIDEsIC8qMSovIDAuNSwgMSwgIC8qMiovIDEsIDEsIC8qMyovIDAuNSwgMSxcclxuICAgICAgICAgICAgICAgIC8vIGJhY2tcclxuICAgICAgICAgICAgICAgIC8qNCovIDAuNSwgMCxcclxuICAgICAgICAgICAgICAgIC8qNSovIDAsIDAsIC8qNiovIDEsIDAsICAvKjcqLyAxLCAxLCAvKjgqLyAwLCAxXHJcbiAgICAgICAgICAgIF0pO1xyXG4gICAgICAgICAgICByZXR1cm4gdGV4dHVyZVVWcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByb3RlY3RlZCBjcmVhdGVGYWNlTm9ybWFscygpOiBGbG9hdDMyQXJyYXkge1xyXG4gICAgICAgICAgICBsZXQgbm9ybWFsczogbnVtYmVyW10gPSBbXTtcclxuICAgICAgICAgICAgbGV0IHZlcnRpY2VzOiBWZWN0b3IzW10gPSBbXTtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IHY6IG51bWJlciA9IDA7IHYgPCB0aGlzLnZlcnRpY2VzLmxlbmd0aDsgdiArPSAzKVxyXG4gICAgICAgICAgICAgICAgdmVydGljZXMucHVzaChuZXcgVmVjdG9yMyh0aGlzLnZlcnRpY2VzW3ZdLCB0aGlzLnZlcnRpY2VzW3YgKyAxXSwgdGhpcy52ZXJ0aWNlc1t2ICsgMl0pKTtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB0aGlzLmluZGljZXMubGVuZ3RoOyBpICs9IDMpIHtcclxuICAgICAgICAgICAgICAgIGxldCB2ZXJ0ZXg6IG51bWJlcltdID0gW3RoaXMuaW5kaWNlc1tpXSwgdGhpcy5pbmRpY2VzW2kgKyAxXSwgdGhpcy5pbmRpY2VzW2kgKyAyXV07XHJcbiAgICAgICAgICAgICAgICBsZXQgdjA6IFZlY3RvcjMgPSBWZWN0b3IzLkRJRkZFUkVOQ0UodmVydGljZXNbdmVydGV4WzBdXSwgdmVydGljZXNbdmVydGV4WzFdXSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgdjE6IFZlY3RvcjMgPSBWZWN0b3IzLkRJRkZFUkVOQ0UodmVydGljZXNbdmVydGV4WzBdXSwgdmVydGljZXNbdmVydGV4WzJdXSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgbm9ybWFsOiBWZWN0b3IzID0gVmVjdG9yMy5OT1JNQUxJWkFUSU9OKFZlY3RvcjMuQ1JPU1ModjAsIHYxKSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgaW5kZXg6IG51bWJlciA9IHZlcnRleFsyXSAqIDM7XHJcbiAgICAgICAgICAgICAgICBub3JtYWxzW2luZGV4XSA9IG5vcm1hbC54O1xyXG4gICAgICAgICAgICAgICAgbm9ybWFsc1tpbmRleCArIDFdID0gbm9ybWFsLnk7XHJcbiAgICAgICAgICAgICAgICBub3JtYWxzW2luZGV4ICsgMl0gPSBub3JtYWwuejtcclxuICAgICAgICAgICAgICAgIC8vIG5vcm1hbHMucHVzaChub3JtYWwueCwgbm9ybWFsLnksIG5vcm1hbC56KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBub3JtYWxzLnB1c2goMCwgMCwgMCk7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgRmxvYXQzMkFycmF5KG5vcm1hbHMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBHZW5lcmF0ZSBhIHNpbXBsZSBxdWFkIHdpdGggZWRnZXMgb2YgbGVuZ3RoIDEsIHRoZSBmYWNlIGNvbnNpc3Rpbmcgb2YgdHdvIHRyaWdvbnNcclxuICAgICAqIGBgYHBsYWludGV4dFxyXG4gICAgICogICAgICAgIDAgX18gM1xyXG4gICAgICogICAgICAgICB8X198XHJcbiAgICAgKiAgICAgICAgMSAgICAyICAgICAgICAgICAgIFxyXG4gICAgICogYGBgIFxyXG4gICAgICogQGF1dGhvcnMgSmlya2EgRGVsbCdPcm8tRnJpZWRsLCBIRlUsIDIwMTlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIE1lc2hRdWFkIGV4dGVuZHMgTWVzaCB7XHJcbiAgICAgICAgcHVibGljIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGNyZWF0ZSgpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy52ZXJ0aWNlcyA9IHRoaXMuY3JlYXRlVmVydGljZXMoKTtcclxuICAgICAgICAgICAgdGhpcy5pbmRpY2VzID0gdGhpcy5jcmVhdGVJbmRpY2VzKCk7XHJcbiAgICAgICAgICAgIHRoaXMudGV4dHVyZVVWcyA9IHRoaXMuY3JlYXRlVGV4dHVyZVVWcygpO1xyXG4gICAgICAgICAgICB0aGlzLm5vcm1hbHNGYWNlID0gdGhpcy5jcmVhdGVGYWNlTm9ybWFscygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJvdGVjdGVkIGNyZWF0ZVZlcnRpY2VzKCk6IEZsb2F0MzJBcnJheSB7XHJcbiAgICAgICAgICAgIGxldCB2ZXJ0aWNlczogRmxvYXQzMkFycmF5ID0gbmV3IEZsb2F0MzJBcnJheShbXHJcbiAgICAgICAgICAgICAgICAvKjAqLyAtMSwgMSwgMCwgLyoxKi8gLTEsIC0xLCAwLCAgLyoyKi8gMSwgLTEsIDAsIC8qMyovIDEsIDEsIDBcclxuICAgICAgICAgICAgXSk7XHJcblxyXG4gICAgICAgICAgICB2ZXJ0aWNlcyA9IHZlcnRpY2VzLm1hcChfdmFsdWUgPT4gX3ZhbHVlIC8gMik7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdmVydGljZXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByb3RlY3RlZCBjcmVhdGVJbmRpY2VzKCk6IFVpbnQxNkFycmF5IHtcclxuICAgICAgICAgICAgbGV0IGluZGljZXM6IFVpbnQxNkFycmF5ID0gbmV3IFVpbnQxNkFycmF5KFtcclxuICAgICAgICAgICAgICAgIDEsIDIsIDAsIDIsIDMsIDBcclxuICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgICAgIHJldHVybiBpbmRpY2VzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJvdGVjdGVkIGNyZWF0ZVRleHR1cmVVVnMoKTogRmxvYXQzMkFycmF5IHtcclxuICAgICAgICAgICAgbGV0IHRleHR1cmVVVnM6IEZsb2F0MzJBcnJheSA9IG5ldyBGbG9hdDMyQXJyYXkoW1xyXG4gICAgICAgICAgICAgICAgLy8gZnJvbnRcclxuICAgICAgICAgICAgICAgIC8qMCovIDAsIDAsIC8qMSovIDAsIDEsICAvKjIqLyAxLCAxLCAvKjMqLyAxLCAwXHJcbiAgICAgICAgICAgIF0pO1xyXG4gICAgICAgICAgICByZXR1cm4gdGV4dHVyZVVWcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByb3RlY3RlZCBjcmVhdGVGYWNlTm9ybWFscygpOiBGbG9hdDMyQXJyYXkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEZsb2F0MzJBcnJheShbXHJcbiAgICAgICAgICAgICAgICAvKjAqLyAwLCAwLCAxLCAvKjEqLyAwLCAwLCAwLCAvKjIqLyAwLCAwLCAwLCAvKjMqLyAxLCAwLCAwXHJcbiAgICAgICAgICAgIF0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gIGV4cG9ydCBpbnRlcmZhY2UgTWFwQ2xhc3NUb0NvbXBvbmVudHMge1xyXG4gICAgW2NsYXNzTmFtZTogc3RyaW5nXTogQ29tcG9uZW50W107XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXByZXNlbnRzIGEgbm9kZSBpbiB0aGUgc2NlbmV0cmVlLlxyXG4gICAqIEBhdXRob3JzIEphc2NoYSBLYXJhZ8O2bCwgSEZVLCAyMDE5IHwgSmlya2EgRGVsbCdPcm8tRnJpZWRsLCBIRlUsIDIwMTlcclxuICAgKi9cclxuICBleHBvcnQgY2xhc3MgTm9kZSBleHRlbmRzIEV2ZW50VGFyZ2V0IGltcGxlbWVudHMgU2VyaWFsaXphYmxlIHtcclxuICAgIHB1YmxpYyBuYW1lOiBzdHJpbmc7IC8vIFRoZSBuYW1lIHRvIGNhbGwgdGhpcyBub2RlIGJ5LlxyXG4gICAgcHVibGljIG10eFdvcmxkOiBNYXRyaXg0eDQgPSBNYXRyaXg0eDQuSURFTlRJVFk7XHJcbiAgICBwdWJsaWMgdGltZXN0YW1wVXBkYXRlOiBudW1iZXIgPSAwO1xyXG5cclxuICAgIHByaXZhdGUgcGFyZW50OiBOb2RlIHwgbnVsbCA9IG51bGw7IC8vIFRoZSBwYXJlbnQgb2YgdGhpcyBub2RlLlxyXG4gICAgcHJpdmF0ZSBjaGlsZHJlbjogTm9kZVtdID0gW107IC8vIGFycmF5IG9mIGNoaWxkIG5vZGVzIGFwcGVuZGVkIHRvIHRoaXMgbm9kZS5cclxuICAgIHByaXZhdGUgY29tcG9uZW50czogTWFwQ2xhc3NUb0NvbXBvbmVudHMgPSB7fTtcclxuICAgIC8vIHByaXZhdGUgdGFnczogc3RyaW5nW10gPSBbXTsgLy8gTmFtZXMgb2YgdGFncyB0aGF0IGFyZSBhdHRhY2hlZCB0byB0aGlzIG5vZGUuIChUT0RPOiBBcyBvZiB5ZXQgbm8gZnVuY3Rpb25hbGl0eSlcclxuICAgIC8vIHByaXZhdGUgbGF5ZXJzOiBzdHJpbmdbXSA9IFtdOyAvLyBOYW1lcyBvZiB0aGUgbGF5ZXJzIHRoaXMgbm9kZSBpcyBvbi4gKFRPRE86IEFzIG9mIHlldCBubyBmdW5jdGlvbmFsaXR5KVxyXG4gICAgcHJpdmF0ZSBsaXN0ZW5lcnM6IE1hcEV2ZW50VHlwZVRvTGlzdGVuZXIgPSB7fTtcclxuICAgIHByaXZhdGUgY2FwdHVyZXM6IE1hcEV2ZW50VHlwZVRvTGlzdGVuZXIgPSB7fTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgYSBuZXcgbm9kZSB3aXRoIGEgbmFtZSBhbmQgaW5pdGlhbGl6ZXMgYWxsIGF0dHJpYnV0ZXNcclxuICAgICAqIEBwYXJhbSBfbmFtZSBUaGUgbmFtZSBieSB3aGljaCB0aGUgbm9kZSBjYW4gYmUgY2FsbGVkLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgY29uc3RydWN0b3IoX25hbWU6IHN0cmluZykge1xyXG4gICAgICBzdXBlcigpO1xyXG4gICAgICB0aGlzLm5hbWUgPSBfbmFtZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSByZWZlcmVuY2UgdG8gdGhpcyBub2RlcyBwYXJlbnQgbm9kZVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0UGFyZW50KCk6IE5vZGUgfCBudWxsIHtcclxuICAgICAgcmV0dXJuIHRoaXMucGFyZW50O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVHJhY2VzIGJhY2sgdGhlIGFuY2VzdG9ycyBvZiB0aGlzIG5vZGUgYW5kIHJldHVybnMgdGhlIGZpcnN0XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRBbmNlc3RvcigpOiBOb2RlIHwgbnVsbCB7XHJcbiAgICAgIGxldCBhbmNlc3RvcjogTm9kZSA9IHRoaXM7XHJcbiAgICAgIHdoaWxlIChhbmNlc3Rvci5nZXRQYXJlbnQoKSlcclxuICAgICAgICBhbmNlc3RvciA9IGFuY2VzdG9yLmdldFBhcmVudCgpO1xyXG4gICAgICByZXR1cm4gYW5jZXN0b3I7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTaG9ydGN1dCB0byByZXRyaWV2ZSB0aGlzIG5vZGVzIFtbQ29tcG9uZW50VHJhbnNmb3JtXV1cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBjbXBUcmFuc2Zvcm0oKTogQ29tcG9uZW50VHJhbnNmb3JtIHtcclxuICAgICAgcmV0dXJuIDxDb21wb25lbnRUcmFuc2Zvcm0+dGhpcy5nZXRDb21wb25lbnRzKENvbXBvbmVudFRyYW5zZm9ybSlbMF07XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFNob3J0Y3V0IHRvIHJldHJpZXZlIHRoZSBsb2NhbCBbW01hdHJpeDR4NF1dIGF0dGFjaGVkIHRvIHRoaXMgbm9kZXMgW1tDb21wb25lbnRUcmFuc2Zvcm1dXSAgXHJcbiAgICAgKiBSZXR1cm5zIG51bGwgaWYgbm8gW1tDb21wb25lbnRUcmFuc2Zvcm1dXSBpcyBhdHRhY2hlZFxyXG4gICAgICovXHJcbiAgICAvLyBUT0RPOiByZWplY3RlZCBmb3Igbm93LCBzaW5jZSB0aGVyZSBpcyBzb21lIGNvbXB1dGF0aW9uYWwgb3ZlcmhlYWQsIHNvIG5vZGUubXR4TG9jYWwgc2hvdWxkIG5vdCBiZSB1c2VkIGNhcmVsZXNzbHlcclxuICAgIC8vIHB1YmxpYyBnZXQgbXR4TG9jYWwoKTogTWF0cml4NHg0IHtcclxuICAgIC8vICAgICBsZXQgY21wVHJhbnNmb3JtOiBDb21wb25lbnRUcmFuc2Zvcm0gPSB0aGlzLmNtcFRyYW5zZm9ybTtcclxuICAgIC8vICAgICBpZiAoY21wVHJhbnNmb3JtKVxyXG4gICAgLy8gICAgICAgICByZXR1cm4gY21wVHJhbnNmb3JtLmxvY2FsO1xyXG4gICAgLy8gICAgIGVsc2VcclxuICAgIC8vICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAvLyB9XHJcblxyXG4gICAgLy8gI3JlZ2lvbiBTY2VuZXRyZWVcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIGNsb25lIG9mIHRoZSBsaXN0IG9mIGNoaWxkcmVuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRDaGlsZHJlbigpOiBOb2RlW10ge1xyXG4gICAgICByZXR1cm4gdGhpcy5jaGlsZHJlbi5zbGljZSgwKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhbiBhcnJheSBvZiByZWZlcmVuY2VzIHRvIGNoaWxkbm9kZXMgd2l0aCB0aGUgc3VwcGxpZWQgbmFtZS4gXHJcbiAgICAgKiBAcGFyYW0gX25hbWUgVGhlIG5hbWUgb2YgdGhlIG5vZGVzIHRvIGJlIGZvdW5kLlxyXG4gICAgICogQHJldHVybiBBbiBhcnJheSB3aXRoIHJlZmVyZW5jZXMgdG8gbm9kZXNcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldENoaWxkcmVuQnlOYW1lKF9uYW1lOiBzdHJpbmcpOiBOb2RlW10ge1xyXG4gICAgICBsZXQgZm91bmQ6IE5vZGVbXSA9IFtdO1xyXG4gICAgICBmb3VuZCA9IHRoaXMuY2hpbGRyZW4uZmlsdGVyKChfbm9kZTogTm9kZSkgPT4gX25vZGUubmFtZSA9PSBfbmFtZSk7XHJcbiAgICAgIHJldHVybiBmb3VuZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgdGhlIGdpdmVuIHJlZmVyZW5jZSB0byBhIG5vZGUgdG8gdGhlIGxpc3Qgb2YgY2hpbGRyZW4sIGlmIG5vdCBhbHJlYWR5IGluXHJcbiAgICAgKiBAcGFyYW0gX25vZGUgVGhlIG5vZGUgdG8gYmUgYWRkZWQgYXMgYSBjaGlsZFxyXG4gICAgICogQHRocm93cyBFcnJvciB3aGVuIHRyeWluZyB0byBhZGQgYW4gYW5jZXN0b3Igb2YgdGhpcyBcclxuICAgICAqL1xyXG4gICAgcHVibGljIGFwcGVuZENoaWxkKF9ub2RlOiBOb2RlKTogdm9pZCB7XHJcbiAgICAgIGlmICh0aGlzLmNoaWxkcmVuLmluY2x1ZGVzKF9ub2RlKSlcclxuICAgICAgICAvLyBfbm9kZSBpcyBhbHJlYWR5IGEgY2hpbGQgb2YgdGhpc1xyXG4gICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgIGxldCBhbmNlc3RvcjogTm9kZSA9IHRoaXM7XHJcbiAgICAgIHdoaWxlIChhbmNlc3Rvcikge1xyXG4gICAgICAgIGlmIChhbmNlc3RvciA9PSBfbm9kZSlcclxuICAgICAgICAgIHRocm93IChuZXcgRXJyb3IoXCJDeWNsaWMgcmVmZXJlbmNlIHByb2hpYml0ZWQgaW4gbm9kZSBoaWVyYXJjaHksIGFuY2VzdG9ycyBtdXN0IG5vdCBiZSBhZGRlZCBhcyBjaGlsZHJlblwiKSk7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgYW5jZXN0b3IgPSBhbmNlc3Rvci5wYXJlbnQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuY2hpbGRyZW4ucHVzaChfbm9kZSk7XHJcbiAgICAgIF9ub2RlLnNldFBhcmVudCh0aGlzKTtcclxuICAgICAgX25vZGUuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoRVZFTlQuQ0hJTERfQVBQRU5ELCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyB0aGUgcmVmZXJlbmNlIHRvIHRoZSBnaXZlIG5vZGUgZnJvbSB0aGUgbGlzdCBvZiBjaGlsZHJlblxyXG4gICAgICogQHBhcmFtIF9ub2RlIFRoZSBub2RlIHRvIGJlIHJlbW92ZWQuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyByZW1vdmVDaGlsZChfbm9kZTogTm9kZSk6IHZvaWQge1xyXG4gICAgICBsZXQgZm91bmQ6IG51bWJlciA9IHRoaXMuZmluZENoaWxkKF9ub2RlKTtcclxuICAgICAgaWYgKGZvdW5kIDwgMClcclxuICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICBfbm9kZS5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChFVkVOVC5DSElMRF9SRU1PVkUsIHsgYnViYmxlczogdHJ1ZSB9KSk7XHJcbiAgICAgIHRoaXMuY2hpbGRyZW4uc3BsaWNlKGZvdW5kLCAxKTtcclxuICAgICAgX25vZGUuc2V0UGFyZW50KG51bGwpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgcG9zaXRpb24gb2YgdGhlIG5vZGUgaW4gdGhlIGxpc3Qgb2YgY2hpbGRyZW4gb3IgLTEgaWYgbm90IGZvdW5kXHJcbiAgICAgKiBAcGFyYW0gX25vZGUgVGhlIG5vZGUgdG8gYmUgZm91bmQuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBmaW5kQ2hpbGQoX25vZGU6IE5vZGUpOiBudW1iZXIge1xyXG4gICAgICByZXR1cm4gdGhpcy5jaGlsZHJlbi5pbmRleE9mKF9ub2RlKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlcGxhY2VzIGEgY2hpbGQgbm9kZSB3aXRoIGFub3RoZXIsIHByZXNlcnZpbmcgdGhlIHBvc2l0aW9uIGluIHRoZSBsaXN0IG9mIGNoaWxkcmVuXHJcbiAgICAgKiBAcGFyYW0gX3JlcGxhY2UgVGhlIG5vZGUgdG8gYmUgcmVwbGFjZWRcclxuICAgICAqIEBwYXJhbSBfd2l0aCBUaGUgbm9kZSB0byByZXBsYWNlIHdpdGhcclxuICAgICAqL1xyXG4gICAgcHVibGljIHJlcGxhY2VDaGlsZChfcmVwbGFjZTogTm9kZSwgX3dpdGg6IE5vZGUpOiBib29sZWFuIHtcclxuICAgICAgbGV0IGZvdW5kOiBudW1iZXIgPSB0aGlzLmZpbmRDaGlsZChfcmVwbGFjZSk7XHJcbiAgICAgIGlmIChmb3VuZCA8IDApXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICBsZXQgcHJldmlvdXNQYXJlbnQ6IE5vZGUgPSBfd2l0aC5nZXRQYXJlbnQoKTtcclxuICAgICAgaWYgKHByZXZpb3VzUGFyZW50KVxyXG4gICAgICAgIHByZXZpb3VzUGFyZW50LnJlbW92ZUNoaWxkKF93aXRoKTtcclxuICAgICAgX3JlcGxhY2Uuc2V0UGFyZW50KG51bGwpO1xyXG4gICAgICB0aGlzLmNoaWxkcmVuW2ZvdW5kXSA9IF93aXRoO1xyXG4gICAgICBfd2l0aC5zZXRQYXJlbnQodGhpcyk7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2VuZXJhdG9yIHlpZWxkaW5nIHRoZSBub2RlIGFuZCBhbGwgc3VjY2Vzc29ycyBpbiB0aGUgYnJhbmNoIGJlbG93IGZvciBpdGVyYXRpb25cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBicmFuY2goKTogSXRlcmFibGVJdGVyYXRvcjxOb2RlPiB7XHJcbiAgICAgIHJldHVybiB0aGlzLmdldEJyYW5jaEdlbmVyYXRvcigpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpc1VwZGF0ZWQoX3RpbWVzdGFtcFVwZGF0ZTogbnVtYmVyKTogYm9vbGVhbiB7XHJcbiAgICAgIHJldHVybiAodGhpcy50aW1lc3RhbXBVcGRhdGUgPT0gX3RpbWVzdGFtcFVwZGF0ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBcHBsaWVzIGEgTXV0YXRvciBmcm9tIFtbQW5pbWF0aW9uXV0gdG8gYWxsIGl0cyBjb21wb25lbnRzIGFuZCB0cmFuc2ZlcnMgaXQgdG8gaXRzIGNoaWxkcmVuLlxyXG4gICAgICogQHBhcmFtIF9tdXRhdG9yIFRoZSBtdXRhdG9yIGdlbmVyYXRlZCBmcm9tIGFuIFtbQW5pbWF0aW9uXV1cclxuICAgICAqL1xyXG4gICAgcHVibGljIGFwcGx5QW5pbWF0aW9uKF9tdXRhdG9yOiBNdXRhdG9yKTogdm9pZCB7XHJcbiAgICAgIGlmIChfbXV0YXRvci5jb21wb25lbnRzKSB7XHJcbiAgICAgICAgZm9yIChsZXQgY29tcG9uZW50TmFtZSBpbiBfbXV0YXRvci5jb21wb25lbnRzKSB7XHJcbiAgICAgICAgICBpZiAodGhpcy5jb21wb25lbnRzW2NvbXBvbmVudE5hbWVdKSB7XHJcbiAgICAgICAgICAgIGxldCBtdXRhdG9yT2ZDb21wb25lbnQ6IE11dGF0b3IgPSA8TXV0YXRvcj5fbXV0YXRvci5jb21wb25lbnRzO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpIGluIG11dGF0b3JPZkNvbXBvbmVudFtjb21wb25lbnROYW1lXSkge1xyXG4gICAgICAgICAgICAgIGlmICh0aGlzLmNvbXBvbmVudHNbY29tcG9uZW50TmFtZV1bK2ldKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY29tcG9uZW50VG9NdXRhdGU6IENvbXBvbmVudCA9IHRoaXMuY29tcG9uZW50c1tjb21wb25lbnROYW1lXVsraV07XHJcbiAgICAgICAgICAgICAgICBsZXQgbXV0YXRvckFycmF5OiBNdXRhdG9yW10gPSAoPEFycmF5PE11dGF0b3I+Pm11dGF0b3JPZkNvbXBvbmVudFtjb21wb25lbnROYW1lXSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgbXV0YXRvcldpdGhDb21wb25lbnROYW1lOiBNdXRhdG9yID0gPE11dGF0b3I+bXV0YXRvckFycmF5WytpXTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGNuYW1lIGluIG11dGF0b3JXaXRoQ29tcG9uZW50TmFtZSkgeyAgIC8vIHRyaWNrIHVzZWQgdG8gZ2V0IHRoZSBvbmx5IGVudHJ5IGluIHRoZSBsaXN0XHJcbiAgICAgICAgICAgICAgICAgIGxldCBtdXRhdG9yVG9HaXZlOiBNdXRhdG9yID0gPE11dGF0b3I+bXV0YXRvcldpdGhDb21wb25lbnROYW1lW2NuYW1lXTtcclxuICAgICAgICAgICAgICAgICAgY29tcG9uZW50VG9NdXRhdGUubXV0YXRlKG11dGF0b3JUb0dpdmUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZiAoX211dGF0b3IuY2hpbGRyZW4pIHtcclxuICAgICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgKDxBcnJheTxPYmplY3Q+Pl9tdXRhdG9yLmNoaWxkcmVuKS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgbGV0IG5hbWU6IHN0cmluZyA9ICg8Tm9kZT4oPEFycmF5PE11dGF0b3I+Pl9tdXRhdG9yLmNoaWxkcmVuKVtpXVtcIsaSLk5vZGVcIl0pLm5hbWU7XHJcbiAgICAgICAgICBsZXQgY2hpbGROb2RlczogTm9kZVtdID0gdGhpcy5nZXRDaGlsZHJlbkJ5TmFtZShuYW1lKTtcclxuICAgICAgICAgIGZvciAobGV0IGNoaWxkTm9kZSBvZiBjaGlsZE5vZGVzKSB7XHJcbiAgICAgICAgICAgIGNoaWxkTm9kZS5hcHBseUFuaW1hdGlvbig8TXV0YXRvcj4oPEFycmF5PE11dGF0b3I+Pl9tdXRhdG9yLmNoaWxkcmVuKVtpXVtcIsaSLk5vZGVcIl0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8gI2VuZHJlZ2lvblxyXG5cclxuICAgIC8vICNyZWdpb24gQ29tcG9uZW50c1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgbGlzdCBvZiBhbGwgY29tcG9uZW50cyBhdHRhY2hlZCB0byB0aGlzIG5vZGUsIGluZGVwZW5kZW50IG9mIHR5cGUuIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0QWxsQ29tcG9uZW50cygpOiBDb21wb25lbnRbXSB7XHJcbiAgICAgIGxldCBhbGw6IENvbXBvbmVudFtdID0gW107XHJcbiAgICAgIGZvciAobGV0IHR5cGUgaW4gdGhpcy5jb21wb25lbnRzKSB7XHJcbiAgICAgICAgYWxsID0gYWxsLmNvbmNhdCh0aGlzLmNvbXBvbmVudHNbdHlwZV0pO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBhbGw7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgY2xvbmUgb2YgdGhlIGxpc3Qgb2YgY29tcG9uZW50cyBvZiB0aGUgZ2l2ZW4gY2xhc3MgYXR0YWNoZWQgdG8gdGhpcyBub2RlLiBcclxuICAgICAqIEBwYXJhbSBfY2xhc3MgVGhlIGNsYXNzIG9mIHRoZSBjb21wb25lbnRzIHRvIGJlIGZvdW5kLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0Q29tcG9uZW50czxUIGV4dGVuZHMgQ29tcG9uZW50PihfY2xhc3M6IG5ldyAoKSA9PiBUKTogVFtdIHtcclxuICAgICAgcmV0dXJuIDxUW10+KHRoaXMuY29tcG9uZW50c1tfY2xhc3MubmFtZV0gfHwgW10pLnNsaWNlKDApO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBmaXJzdCBjb21wb250ZW50IGZvdW5kIG9mIHRoZSBnaXZlbiBjbGFzcyBhdHRhY2hlZCB0aGlzIG5vZGUgb3IgbnVsbCwgaWYgbGlzdCBpcyBlbXB0eSBvciBkb2Vzbid0IGV4aXN0XHJcbiAgICAgKiBAcGFyYW0gX2NsYXNzIFRoZSBjbGFzcyBvZiB0aGUgY29tcG9uZW50cyB0byBiZSBmb3VuZC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldENvbXBvbmVudDxUIGV4dGVuZHMgQ29tcG9uZW50PihfY2xhc3M6IG5ldyAoKSA9PiBUKTogVCB7XHJcbiAgICAgIGxldCBsaXN0OiBUW10gPSA8VFtdPnRoaXMuY29tcG9uZW50c1tfY2xhc3MubmFtZV07XHJcbiAgICAgIGlmIChsaXN0KVxyXG4gICAgICAgIHJldHVybiBsaXN0WzBdO1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgdGhlIHN1cHBsaWVkIGNvbXBvbmVudCBpbnRvIHRoZSBub2RlcyBjb21wb25lbnQgbWFwLlxyXG4gICAgICogQHBhcmFtIF9jb21wb25lbnQgVGhlIGNvbXBvbmVudCB0byBiZSBwdXNoZWQgaW50byB0aGUgYXJyYXkuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhZGRDb21wb25lbnQoX2NvbXBvbmVudDogQ29tcG9uZW50KTogdm9pZCB7XHJcbiAgICAgIGlmIChfY29tcG9uZW50LmdldENvbnRhaW5lcigpID09IHRoaXMpXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICBpZiAodGhpcy5jb21wb25lbnRzW19jb21wb25lbnQudHlwZV0gPT09IHVuZGVmaW5lZClcclxuICAgICAgICB0aGlzLmNvbXBvbmVudHNbX2NvbXBvbmVudC50eXBlXSA9IFtfY29tcG9uZW50XTtcclxuICAgICAgZWxzZVxyXG4gICAgICAgIGlmIChfY29tcG9uZW50LmlzU2luZ2xldG9uKVxyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ29tcG9uZW50IGlzIG1hcmtlZCBzaW5nbGV0b24gYW5kIGNhbid0IGJlIGF0dGFjaGVkLCBubyBtb3JlIHRoYW4gb25lIGFsbG93ZWRcIik7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgdGhpcy5jb21wb25lbnRzW19jb21wb25lbnQudHlwZV0ucHVzaChfY29tcG9uZW50KTtcclxuXHJcbiAgICAgIF9jb21wb25lbnQuc2V0Q29udGFpbmVyKHRoaXMpO1xyXG4gICAgICBfY29tcG9uZW50LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KEVWRU5ULkNPTVBPTkVOVF9BREQpKTtcclxuICAgIH1cclxuICAgIC8qKiBcclxuICAgICAqIFJlbW92ZXMgdGhlIGdpdmVuIGNvbXBvbmVudCBmcm9tIHRoZSBub2RlLCBpZiBpdCB3YXMgYXR0YWNoZWQsIGFuZCBzZXRzIGl0cyBwYXJlbnQgdG8gbnVsbC4gXHJcbiAgICAgKiBAcGFyYW0gX2NvbXBvbmVudCBUaGUgY29tcG9uZW50IHRvIGJlIHJlbW92ZWRcclxuICAgICAqIEB0aHJvd3MgRXhjZXB0aW9uIHdoZW4gY29tcG9uZW50IGlzIG5vdCBmb3VuZFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgcmVtb3ZlQ29tcG9uZW50KF9jb21wb25lbnQ6IENvbXBvbmVudCk6IHZvaWQge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGxldCBjb21wb25lbnRzT2ZUeXBlOiBDb21wb25lbnRbXSA9IHRoaXMuY29tcG9uZW50c1tfY29tcG9uZW50LnR5cGVdO1xyXG4gICAgICAgIGxldCBmb3VuZEF0OiBudW1iZXIgPSBjb21wb25lbnRzT2ZUeXBlLmluZGV4T2YoX2NvbXBvbmVudCk7XHJcbiAgICAgICAgaWYgKGZvdW5kQXQgPCAwKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGNvbXBvbmVudHNPZlR5cGUuc3BsaWNlKGZvdW5kQXQsIDEpO1xyXG4gICAgICAgIF9jb21wb25lbnQuc2V0Q29udGFpbmVyKG51bGwpO1xyXG4gICAgICAgIF9jb21wb25lbnQuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoRVZFTlQuQ09NUE9ORU5UX1JFTU9WRSkpO1xyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byByZW1vdmUgY29tcG9uZW50ICcke19jb21wb25lbnR9J2luIG5vZGUgbmFtZWQgJyR7dGhpcy5uYW1lfSdgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8gI2VuZHJlZ2lvblxyXG5cclxuICAgIC8vICNyZWdpb24gU2VyaWFsaXphdGlvblxyXG4gICAgcHVibGljIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemF0aW9uIHtcclxuICAgICAgbGV0IHNlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24gPSB7XHJcbiAgICAgICAgbmFtZTogdGhpcy5uYW1lXHJcbiAgICAgIH07XHJcblxyXG4gICAgICBsZXQgY29tcG9uZW50czogU2VyaWFsaXphdGlvbiA9IHt9O1xyXG4gICAgICBmb3IgKGxldCB0eXBlIGluIHRoaXMuY29tcG9uZW50cykge1xyXG4gICAgICAgIGNvbXBvbmVudHNbdHlwZV0gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBjb21wb25lbnQgb2YgdGhpcy5jb21wb25lbnRzW3R5cGVdKSB7XHJcbiAgICAgICAgICAvLyBjb21wb25lbnRzW3R5cGVdLnB1c2goY29tcG9uZW50LnNlcmlhbGl6ZSgpKTtcclxuICAgICAgICAgIGNvbXBvbmVudHNbdHlwZV0ucHVzaChTZXJpYWxpemVyLnNlcmlhbGl6ZShjb21wb25lbnQpKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgc2VyaWFsaXphdGlvbltcImNvbXBvbmVudHNcIl0gPSBjb21wb25lbnRzO1xyXG5cclxuICAgICAgbGV0IGNoaWxkcmVuOiBTZXJpYWxpemF0aW9uW10gPSBbXTtcclxuICAgICAgZm9yIChsZXQgY2hpbGQgb2YgdGhpcy5jaGlsZHJlbikge1xyXG4gICAgICAgIGNoaWxkcmVuLnB1c2goU2VyaWFsaXplci5zZXJpYWxpemUoY2hpbGQpKTtcclxuICAgICAgfVxyXG4gICAgICBzZXJpYWxpemF0aW9uW1wiY2hpbGRyZW5cIl0gPSBjaGlsZHJlbjtcclxuXHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoRVZFTlQuTk9ERV9TRVJJQUxJWkVEKSk7XHJcbiAgICAgIHJldHVybiBzZXJpYWxpemF0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBkZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbik6IFNlcmlhbGl6YWJsZSB7XHJcbiAgICAgIHRoaXMubmFtZSA9IF9zZXJpYWxpemF0aW9uLm5hbWU7XHJcbiAgICAgIC8vIHRoaXMucGFyZW50ID0gaXMgc2V0IHdoZW4gdGhlIG5vZGVzIGFyZSBhZGRlZFxyXG5cclxuICAgICAgLy8gZGVzZXJpYWxpemUgY29tcG9uZW50cyBmaXJzdCBzbyBzY3JpcHRzIGNhbiByZWFjdCB0byBjaGlsZHJlbiBiZWluZyBhcHBlbmRlZFxyXG4gICAgICBmb3IgKGxldCB0eXBlIGluIF9zZXJpYWxpemF0aW9uLmNvbXBvbmVudHMpIHtcclxuICAgICAgICBmb3IgKGxldCBzZXJpYWxpemVkQ29tcG9uZW50IG9mIF9zZXJpYWxpemF0aW9uLmNvbXBvbmVudHNbdHlwZV0pIHtcclxuICAgICAgICAgIGxldCBkZXNlcmlhbGl6ZWRDb21wb25lbnQ6IENvbXBvbmVudCA9IDxDb21wb25lbnQ+U2VyaWFsaXplci5kZXNlcmlhbGl6ZShzZXJpYWxpemVkQ29tcG9uZW50KTtcclxuICAgICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KGRlc2VyaWFsaXplZENvbXBvbmVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3IgKGxldCBzZXJpYWxpemVkQ2hpbGQgb2YgX3NlcmlhbGl6YXRpb24uY2hpbGRyZW4pIHtcclxuICAgICAgICBsZXQgZGVzZXJpYWxpemVkQ2hpbGQ6IE5vZGUgPSA8Tm9kZT5TZXJpYWxpemVyLmRlc2VyaWFsaXplKHNlcmlhbGl6ZWRDaGlsZCk7XHJcbiAgICAgICAgdGhpcy5hcHBlbmRDaGlsZChkZXNlcmlhbGl6ZWRDaGlsZCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoRVZFTlQuTk9ERV9ERVNFUklBTElaRUQpKTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICAvLyAjZW5kcmVnaW9uXHJcblxyXG4gICAgLy8gI3JlZ2lvbiBFdmVudHNcclxuICAgIC8qKlxyXG4gICAgICogQWRkcyBhbiBldmVudCBsaXN0ZW5lciB0byB0aGUgbm9kZS4gVGhlIGdpdmVuIGhhbmRsZXIgd2lsbCBiZSBjYWxsZWQgd2hlbiBhIG1hdGNoaW5nIGV2ZW50IGlzIHBhc3NlZCB0byB0aGUgbm9kZS5cclxuICAgICAqIERldmlhdGluZyBmcm9tIHRoZSBzdGFuZGFyZCBFdmVudFRhcmdldCwgaGVyZSB0aGUgX2hhbmRsZXIgbXVzdCBiZSBhIGZ1bmN0aW9uIGFuZCBfY2FwdHVyZSBpcyB0aGUgb25seSBvcHRpb24uXHJcbiAgICAgKiBAcGFyYW0gX3R5cGUgVGhlIHR5cGUgb2YgdGhlIGV2ZW50LCBzaG91bGQgYmUgYW4gZW51bWVyYXRlZCB2YWx1ZSBvZiBOT0RFX0VWRU5ULCBjYW4gYmUgYW55IHN0cmluZ1xyXG4gICAgICogQHBhcmFtIF9oYW5kbGVyIFRoZSBmdW5jdGlvbiB0byBjYWxsIHdoZW4gdGhlIGV2ZW50IHJlYWNoZXMgdGhpcyBub2RlXHJcbiAgICAgKiBAcGFyYW0gX2NhcHR1cmUgV2hlbiB0cnVlLCB0aGUgbGlzdGVuZXIgbGlzdGVucyBpbiB0aGUgY2FwdHVyZSBwaGFzZSwgd2hlbiB0aGUgZXZlbnQgdHJhdmVscyBkZWVwZXIgaW50byB0aGUgaGllcmFyY2h5IG9mIG5vZGVzLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYWRkRXZlbnRMaXN0ZW5lcihfdHlwZTogRVZFTlQgfCBzdHJpbmcsIF9oYW5kbGVyOiBFdmVudExpc3RlbmVyLCBfY2FwdHVyZTogYm9vbGVhbiAvKnwgQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnMqLyA9IGZhbHNlKTogdm9pZCB7XHJcbiAgICAgIGlmIChfY2FwdHVyZSkge1xyXG4gICAgICAgIGlmICghdGhpcy5jYXB0dXJlc1tfdHlwZV0pXHJcbiAgICAgICAgICB0aGlzLmNhcHR1cmVzW190eXBlXSA9IFtdO1xyXG4gICAgICAgIHRoaXMuY2FwdHVyZXNbX3R5cGVdLnB1c2goX2hhbmRsZXIpO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGlmICghdGhpcy5saXN0ZW5lcnNbX3R5cGVdKVxyXG4gICAgICAgICAgdGhpcy5saXN0ZW5lcnNbX3R5cGVdID0gW107XHJcbiAgICAgICAgdGhpcy5saXN0ZW5lcnNbX3R5cGVdLnB1c2goX2hhbmRsZXIpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIERpc3BhdGNoZXMgYSBzeW50aGV0aWMgZXZlbnQgZXZlbnQgdG8gdGFyZ2V0LiBUaGlzIGltcGxlbWVudGF0aW9uIGFsd2F5cyByZXR1cm5zIHRydWUgKHN0YW5kYXJkOiByZXR1cm4gdHJ1ZSBvbmx5IGlmIGVpdGhlciBldmVudCdzIGNhbmNlbGFibGUgYXR0cmlidXRlIHZhbHVlIGlzIGZhbHNlIG9yIGl0cyBwcmV2ZW50RGVmYXVsdCgpIG1ldGhvZCB3YXMgbm90IGludm9rZWQpXHJcbiAgICAgKiBUaGUgZXZlbnQgdHJhdmVscyBpbnRvIHRoZSBoaWVyYXJjaHkgdG8gdGhpcyBub2RlIGRpc3BhdGNoaW5nIHRoZSBldmVudCwgaW52b2tpbmcgbWF0Y2hpbmcgaGFuZGxlcnMgb2YgdGhlIG5vZGVzIGFuY2VzdG9ycyBsaXN0ZW5pbmcgdG8gdGhlIGNhcHR1cmUgcGhhc2UsIFxyXG4gICAgICogdGhhbiB0aGUgbWF0Y2hpbmcgaGFuZGxlciBvZiB0aGUgdGFyZ2V0IG5vZGUgaW4gdGhlIHRhcmdldCBwaGFzZSwgYW5kIGJhY2sgb3V0IG9mIHRoZSBoaWVyYXJjaHkgaW4gdGhlIGJ1YmJsaW5nIHBoYXNlLCBpbnZva2luZyBhcHByb3ByaWF0ZSBoYW5kbGVycyBvZiB0aGUgYW52ZXN0b3JzXHJcbiAgICAgKiBAcGFyYW0gX2V2ZW50IFRoZSBldmVudCB0byBkaXNwYXRjaFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZGlzcGF0Y2hFdmVudChfZXZlbnQ6IEV2ZW50KTogYm9vbGVhbiB7XHJcbiAgICAgIGxldCBhbmNlc3RvcnM6IE5vZGVbXSA9IFtdO1xyXG4gICAgICBsZXQgdXBjb21pbmc6IE5vZGUgPSB0aGlzO1xyXG4gICAgICAvLyBvdmVyd3JpdGUgZXZlbnQgdGFyZ2V0XHJcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShfZXZlbnQsIFwidGFyZ2V0XCIsIHsgd3JpdGFibGU6IHRydWUsIHZhbHVlOiB0aGlzIH0pO1xyXG4gICAgICAvLyBUT0RPOiBjb25zaWRlciB1c2luZyBSZWZsZWN0IGluc3RlYWQgb2YgT2JqZWN0IHRocm91Z2hvdXQuIFNlZSBhbHNvIFJlbmRlciBhbmQgTXV0YWJsZS4uLlxyXG4gICAgICB3aGlsZSAodXBjb21pbmcucGFyZW50KVxyXG4gICAgICAgIGFuY2VzdG9ycy5wdXNoKHVwY29taW5nID0gdXBjb21pbmcucGFyZW50KTtcclxuXHJcbiAgICAgIC8vIGNhcHR1cmUgcGhhc2VcclxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KF9ldmVudCwgXCJldmVudFBoYXNlXCIsIHsgd3JpdGFibGU6IHRydWUsIHZhbHVlOiBFdmVudC5DQVBUVVJJTkdfUEhBU0UgfSk7XHJcbiAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IGFuY2VzdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgIGxldCBhbmNlc3RvcjogTm9kZSA9IGFuY2VzdG9yc1tpXTtcclxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoX2V2ZW50LCBcImN1cnJlbnRUYXJnZXRcIiwgeyB3cml0YWJsZTogdHJ1ZSwgdmFsdWU6IGFuY2VzdG9yIH0pO1xyXG4gICAgICAgIGxldCBjYXB0dXJlczogRXZlbnRMaXN0ZW5lcltdID0gYW5jZXN0b3IuY2FwdHVyZXNbX2V2ZW50LnR5cGVdIHx8IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGhhbmRsZXIgb2YgY2FwdHVyZXMpXHJcbiAgICAgICAgICBoYW5kbGVyKF9ldmVudCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghX2V2ZW50LmJ1YmJsZXMpXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgICAvLyB0YXJnZXQgcGhhc2VcclxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KF9ldmVudCwgXCJldmVudFBoYXNlXCIsIHsgd3JpdGFibGU6IHRydWUsIHZhbHVlOiBFdmVudC5BVF9UQVJHRVQgfSk7XHJcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShfZXZlbnQsIFwiY3VycmVudFRhcmdldFwiLCB7IHdyaXRhYmxlOiB0cnVlLCB2YWx1ZTogdGhpcyB9KTtcclxuICAgICAgbGV0IGxpc3RlbmVyczogRXZlbnRMaXN0ZW5lcltdID0gdGhpcy5saXN0ZW5lcnNbX2V2ZW50LnR5cGVdIHx8IFtdO1xyXG4gICAgICBmb3IgKGxldCBoYW5kbGVyIG9mIGxpc3RlbmVycylcclxuICAgICAgICBoYW5kbGVyKF9ldmVudCk7XHJcblxyXG4gICAgICAvLyBidWJibGUgcGhhc2VcclxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KF9ldmVudCwgXCJldmVudFBoYXNlXCIsIHsgd3JpdGFibGU6IHRydWUsIHZhbHVlOiBFdmVudC5CVUJCTElOR19QSEFTRSB9KTtcclxuICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IGFuY2VzdG9ycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGxldCBhbmNlc3RvcjogTm9kZSA9IGFuY2VzdG9yc1tpXTtcclxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoX2V2ZW50LCBcImN1cnJlbnRUYXJnZXRcIiwgeyB3cml0YWJsZTogdHJ1ZSwgdmFsdWU6IGFuY2VzdG9yIH0pO1xyXG4gICAgICAgIGxldCBsaXN0ZW5lcnM6IEZ1bmN0aW9uW10gPSBhbmNlc3Rvci5saXN0ZW5lcnNbX2V2ZW50LnR5cGVdIHx8IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGhhbmRsZXIgb2YgbGlzdGVuZXJzKVxyXG4gICAgICAgICAgaGFuZGxlcihfZXZlbnQpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB0cnVlOyAvL1RPRE86IHJldHVybiBhIG1lYW5pbmdmdWwgdmFsdWUsIHNlZSBkb2N1bWVudGF0aW9uIG9mIGRpc3BhdGNoIGV2ZW50XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEJyb2FkY2FzdHMgYSBzeW50aGV0aWMgZXZlbnQgZXZlbnQgdG8gdGhpcyBub2RlIGFuZCBmcm9tIHRoZXJlIHRvIGFsbCBub2RlcyBkZWVwZXIgaW4gdGhlIGhpZXJhcmNoeSxcclxuICAgICAqIGludm9raW5nIG1hdGNoaW5nIGhhbmRsZXJzIG9mIHRoZSBub2RlcyBsaXN0ZW5pbmcgdG8gdGhlIGNhcHR1cmUgcGhhc2UuIFdhdGNoIHBlcmZvcm1hbmNlIHdoZW4gdGhlcmUgYXJlIG1hbnkgbm9kZXMgaW52b2x2ZWRcclxuICAgICAqIEBwYXJhbSBfZXZlbnQgVGhlIGV2ZW50IHRvIGJyb2FkY2FzdFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYnJvYWRjYXN0RXZlbnQoX2V2ZW50OiBFdmVudCk6IHZvaWQge1xyXG4gICAgICAvLyBvdmVyd3JpdGUgZXZlbnQgdGFyZ2V0IGFuZCBwaGFzZVxyXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoX2V2ZW50LCBcImV2ZW50UGhhc2VcIiwgeyB3cml0YWJsZTogdHJ1ZSwgdmFsdWU6IEV2ZW50LkNBUFRVUklOR19QSEFTRSB9KTtcclxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KF9ldmVudCwgXCJ0YXJnZXRcIiwgeyB3cml0YWJsZTogdHJ1ZSwgdmFsdWU6IHRoaXMgfSk7XHJcbiAgICAgIHRoaXMuYnJvYWRjYXN0RXZlbnRSZWN1cnNpdmUoX2V2ZW50KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGJyb2FkY2FzdEV2ZW50UmVjdXJzaXZlKF9ldmVudDogRXZlbnQpOiB2b2lkIHtcclxuICAgICAgLy8gY2FwdHVyZSBwaGFzZSBvbmx5XHJcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShfZXZlbnQsIFwiY3VycmVudFRhcmdldFwiLCB7IHdyaXRhYmxlOiB0cnVlLCB2YWx1ZTogdGhpcyB9KTtcclxuICAgICAgbGV0IGNhcHR1cmVzOiBGdW5jdGlvbltdID0gdGhpcy5jYXB0dXJlc1tfZXZlbnQudHlwZV0gfHwgW107XHJcbiAgICAgIGZvciAobGV0IGhhbmRsZXIgb2YgY2FwdHVyZXMpXHJcbiAgICAgICAgaGFuZGxlcihfZXZlbnQpO1xyXG4gICAgICAvLyBhcHBlYXJzIHRvIGJlIHNsb3dlciwgYXN0b25pc2hpbmdseS4uLlxyXG4gICAgICAvLyBjYXB0dXJlcy5mb3JFYWNoKGZ1bmN0aW9uIChoYW5kbGVyOiBGdW5jdGlvbik6IHZvaWQge1xyXG4gICAgICAvLyAgICAgaGFuZGxlcihfZXZlbnQpO1xyXG4gICAgICAvLyB9KTtcclxuXHJcbiAgICAgIC8vIHNhbWUgZm9yIGNoaWxkcmVuXHJcbiAgICAgIGZvciAobGV0IGNoaWxkIG9mIHRoaXMuY2hpbGRyZW4pIHtcclxuICAgICAgICBjaGlsZC5icm9hZGNhc3RFdmVudFJlY3Vyc2l2ZShfZXZlbnQpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyAjZW5kcmVnaW9uXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSBwYXJlbnQgb2YgdGhpcyBub2RlIHRvIGJlIHRoZSBzdXBwbGllZCBub2RlLiBXaWxsIGJlIGNhbGxlZCBvbiB0aGUgY2hpbGQgdGhhdCBpcyBhcHBlbmRlZCB0byB0aGlzIG5vZGUgYnkgYXBwZW5kQ2hpbGQoKS5cclxuICAgICAqIEBwYXJhbSBfcGFyZW50IFRoZSBwYXJlbnQgdG8gYmUgc2V0IGZvciB0aGlzIG5vZGUuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgc2V0UGFyZW50KF9wYXJlbnQ6IE5vZGUgfCBudWxsKTogdm9pZCB7XHJcbiAgICAgIHRoaXMucGFyZW50ID0gX3BhcmVudDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlICpnZXRCcmFuY2hHZW5lcmF0b3IoKTogSXRlcmFibGVJdGVyYXRvcjxOb2RlPiB7XHJcbiAgICAgIHlpZWxkIHRoaXM7XHJcbiAgICAgIGZvciAobGV0IGNoaWxkIG9mIHRoaXMuY2hpbGRyZW4pXHJcbiAgICAgICAgeWllbGQqIGNoaWxkLmJyYW5jaDtcclxuICAgIH1cclxuICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogQSBub2RlIG1hbmFnZWQgYnkgW1tSZXNvdXJjZU1hbmFnZXJdXSB0aGF0IGZ1bmN0aW9ucyBhcyBhIHRlbXBsYXRlIGZvciBbW05vZGVSZXNvdXJjZUluc3RhbmNlXV1zIFxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgTm9kZVJlc291cmNlIGV4dGVuZHMgTm9kZSBpbXBsZW1lbnRzIFNlcmlhbGl6YWJsZVJlc291cmNlIHtcclxuICAgICAgICBwdWJsaWMgaWRSZXNvdXJjZTogc3RyaW5nID0gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIEFuIGluc3RhbmNlIG9mIGEgW1tOb2RlUmVzb3VyY2VdXS4gIFxyXG4gICAgICogVGhpcyBub2RlIGtlZXBzIGEgcmVmZXJlbmNlIHRvIGl0cyByZXNvdXJjZSBhbiBjYW4gdGh1cyBvcHRpbWl6ZSBzZXJpYWxpemF0aW9uXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBOb2RlUmVzb3VyY2VJbnN0YW5jZSBleHRlbmRzIE5vZGUge1xyXG4gICAgICAgIC8qKiBpZCBvZiB0aGUgcmVzb3VyY2UgdGhhdCBpbnN0YW5jZSB3YXMgY3JlYXRlZCBmcm9tICovXHJcbiAgICAgICAgLy8gVE9ETzogZXhhbWluZSwgaWYgdGhpcyBzaG91bGQgYmUgYSBkaXJlY3QgcmVmZXJlbmNlIHRvIHRoZSBOb2RlUmVzb3VyY2UsIGluc3RlYWQgb2YgdGhlIGlkXHJcbiAgICAgICAgcHJpdmF0ZSBpZFNvdXJjZTogc3RyaW5nID0gdW5kZWZpbmVkO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3Rvcihfbm9kZVJlc291cmNlOiBOb2RlUmVzb3VyY2UpIHtcclxuICAgICAgICAgICAgc3VwZXIoXCJOb2RlUmVzb3VyY2VJbnN0YW5jZVwiKTtcclxuICAgICAgICAgICAgaWYgKF9ub2RlUmVzb3VyY2UpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldChfbm9kZVJlc291cmNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlY3JlYXRlIHRoaXMgbm9kZSBmcm9tIHRoZSBbW05vZGVSZXNvdXJjZV1dIHJlZmVyZW5jZWRcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGxldCByZXNvdXJjZTogTm9kZVJlc291cmNlID0gPE5vZGVSZXNvdXJjZT5SZXNvdXJjZU1hbmFnZXIuZ2V0KHRoaXMuaWRTb3VyY2UpO1xyXG4gICAgICAgICAgICB0aGlzLnNldChyZXNvdXJjZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL1RPRE86IG9wdGltaXplIHVzaW5nIHRoZSByZWZlcmVuY2VkIE5vZGVSZXNvdXJjZSwgc2VyaWFsaXplL2Rlc2VyaWFsaXplIG9ubHkgdGhlIGRpZmZlcmVuY2VzXHJcbiAgICAgICAgcHVibGljIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemF0aW9uIHtcclxuICAgICAgICAgICAgbGV0IHNlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24gPSBzdXBlci5zZXJpYWxpemUoKTtcclxuICAgICAgICAgICAgc2VyaWFsaXphdGlvbi5pZFNvdXJjZSA9IHRoaXMuaWRTb3VyY2U7XHJcbiAgICAgICAgICAgIHJldHVybiBzZXJpYWxpemF0aW9uO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uKTogU2VyaWFsaXphYmxlIHtcclxuICAgICAgICAgICAgc3VwZXIuZGVzZXJpYWxpemUoX3NlcmlhbGl6YXRpb24pO1xyXG4gICAgICAgICAgICB0aGlzLmlkU291cmNlID0gX3NlcmlhbGl6YXRpb24uaWRTb3VyY2U7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2V0IHRoaXMgbm9kZSB0byBiZSBhIHJlY3JlYXRpb24gb2YgdGhlIFtbTm9kZVJlc291cmNlXV0gZ2l2ZW5cclxuICAgICAgICAgKiBAcGFyYW0gX25vZGVSZXNvdXJjZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgc2V0KF9ub2RlUmVzb3VyY2U6IE5vZGVSZXNvdXJjZSk6IHZvaWQge1xyXG4gICAgICAgICAgICAvLyBUT0RPOiBleGFtaW5lLCBpZiB0aGUgc2VyaWFsaXphdGlvbiBzaG91bGQgYmUgc3RvcmVkIGluIHRoZSBOb2RlUmVzb3VyY2UgZm9yIG9wdGltaXphdGlvblxyXG4gICAgICAgICAgICBsZXQgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IFNlcmlhbGl6ZXIuc2VyaWFsaXplKF9ub2RlUmVzb3VyY2UpO1xyXG4gICAgICAgICAgICAvL1NlcmlhbGl6ZXIuZGVzZXJpYWxpemUoc2VyaWFsaXphdGlvbik7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHBhdGggaW4gc2VyaWFsaXphdGlvbikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXNlcmlhbGl6ZShzZXJpYWxpemF0aW9uW3BhdGhdKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuaWRTb3VyY2UgPSBfbm9kZVJlc291cmNlLmlkUmVzb3VyY2U7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoRVZFTlQuTk9ERVJFU09VUkNFX0lOU1RBTlRJQVRFRCkpO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICBleHBvcnQgY2xhc3MgUmF5IHtcclxuICAgICAgICBwdWJsaWMgb3JpZ2luOiBWZWN0b3IzO1xyXG4gICAgICAgIHB1YmxpYyBkaXJlY3Rpb246IFZlY3RvcjM7XHJcbiAgICAgICAgcHVibGljIGxlbmd0aDogbnVtYmVyO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcihfZGlyZWN0aW9uOiBWZWN0b3IzID0gVmVjdG9yMy5aKC0xKSwgX29yaWdpbjogVmVjdG9yMyA9IFZlY3RvcjMuWkVSTygpLCBfbGVuZ3RoOiBudW1iZXIgPSAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3JpZ2luID0gX29yaWdpbjtcclxuICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSBfZGlyZWN0aW9uO1xyXG4gICAgICAgICAgICB0aGlzLmxlbmd0aCA9IF9sZW5ndGg7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICBleHBvcnQgY2xhc3MgUmF5SGl0IHtcclxuICAgICAgICBwdWJsaWMgbm9kZTogTm9kZTtcclxuICAgICAgICBwdWJsaWMgZmFjZTogbnVtYmVyO1xyXG4gICAgICAgIHB1YmxpYyB6QnVmZmVyOiBudW1iZXI7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKF9ub2RlOiBOb2RlID0gbnVsbCwgX2ZhY2U6IG51bWJlciA9IDAsIF96QnVmZmVyOiBudW1iZXIgPSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMubm9kZSA9IF9ub2RlO1xyXG4gICAgICAgICAgICB0aGlzLmZhY2UgPSBfZmFjZTtcclxuICAgICAgICAgICAgdGhpcy56QnVmZmVyID0gX3pCdWZmZXI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIlJlbmRlck9wZXJhdG9yLnRzXCIvPlxyXG5uYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIGludGVyZmFjZSBOb2RlUmVmZXJlbmNlcyB7XHJcbiAgICAgICAgc2hhZGVyOiB0eXBlb2YgU2hhZGVyO1xyXG4gICAgICAgIGNvYXQ6IENvYXQ7XHJcbiAgICAgICAgbWVzaDogTWVzaDtcclxuICAgICAgICAvLyBkb25lVHJhbnNmb3JtVG9Xb3JsZDogYm9vbGVhbjtcclxuICAgIH1cclxuICAgIHR5cGUgTWFwTm9kZVRvTm9kZVJlZmVyZW5jZXMgPSBNYXA8Tm9kZSwgTm9kZVJlZmVyZW5jZXM+O1xyXG5cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgUGlja0J1ZmZlciB7XHJcbiAgICAgICAgbm9kZTogTm9kZTtcclxuICAgICAgICB0ZXh0dXJlOiBXZWJHTFRleHR1cmU7XHJcbiAgICAgICAgZnJhbWVCdWZmZXI6IFdlYkdMRnJhbWVidWZmZXI7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGlzIGNsYXNzIG1hbmFnZXMgdGhlIHJlZmVyZW5jZXMgdG8gcmVuZGVyIGRhdGEgdXNlZCBieSBub2Rlcy5cclxuICAgICAqIE11bHRpcGxlIG5vZGVzIG1heSByZWZlciB0byB0aGUgc2FtZSBkYXRhIHZpYSB0aGVpciByZWZlcmVuY2VzIHRvIHNoYWRlciwgY29hdCBhbmQgbWVzaCBcclxuICAgICAqL1xyXG4gICAgY2xhc3MgUmVmZXJlbmNlPFQ+IHtcclxuICAgICAgICBwcml2YXRlIHJlZmVyZW5jZTogVDtcclxuICAgICAgICBwcml2YXRlIGNvdW50OiBudW1iZXIgPSAwO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcihfcmVmZXJlbmNlOiBUKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVmZXJlbmNlID0gX3JlZmVyZW5jZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRSZWZlcmVuY2UoKTogVCB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlZmVyZW5jZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBpbmNyZWFzZUNvdW50ZXIoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgdGhpcy5jb3VudCsrO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb3VudDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHVibGljIGRlY3JlYXNlQ291bnRlcigpOiBudW1iZXIge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jb3VudCA9PSAwKSB0aHJvdyAobmV3IEVycm9yKFwiTmVnYXRpdmUgcmVmZXJlbmNlIGNvdW50ZXJcIikpO1xyXG4gICAgICAgICAgICB0aGlzLmNvdW50LS07XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvdW50O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE1hbmFnZXMgdGhlIGhhbmRsaW5nIG9mIHRoZSByZXNzb3VyY2VzIHRoYXQgYXJlIGdvaW5nIHRvIGJlIHJlbmRlcmVkIGJ5IFtbUmVuZGVyT3BlcmF0b3JdXS5cclxuICAgICAqIFN0b3JlcyB0aGUgcmVmZXJlbmNlcyB0byB0aGUgc2hhZGVyLCB0aGUgY29hdCBhbmQgdGhlIG1lc2ggdXNlZCBmb3IgZWFjaCBub2RlIHJlZ2lzdGVyZWQuIFxyXG4gICAgICogV2l0aCB0aGVzZSByZWZlcmVuY2VzLCB0aGUgYWxyZWFkeSBidWZmZXJlZCBkYXRhIGlzIHJldHJpZXZlZCB3aGVuIHJlbmRlcmluZy5cclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGFic3RyYWN0IGNsYXNzIFJlbmRlck1hbmFnZXIgZXh0ZW5kcyBSZW5kZXJPcGVyYXRvciB7XHJcbiAgICAgICAgLyoqIFN0b3JlcyByZWZlcmVuY2VzIHRvIHRoZSBjb21waWxlZCBzaGFkZXIgcHJvZ3JhbXMgYW5kIG1ha2VzIHRoZW0gYXZhaWxhYmxlIHZpYSB0aGUgcmVmZXJlbmNlcyB0byBzaGFkZXJzICovXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgcmVuZGVyU2hhZGVyczogTWFwPHR5cGVvZiBTaGFkZXIsIFJlZmVyZW5jZTxSZW5kZXJTaGFkZXI+PiA9IG5ldyBNYXAoKTtcclxuICAgICAgICAvKiogU3RvcmVzIHJlZmVyZW5jZXMgdG8gdGhlIHZlcnRleCBhcnJheSBvYmplY3RzIGFuZCBtYWtlcyB0aGVtIGF2YWlsYWJsZSB2aWEgdGhlIHJlZmVyZW5jZXMgdG8gY29hdHMgKi9cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyByZW5kZXJDb2F0czogTWFwPENvYXQsIFJlZmVyZW5jZTxSZW5kZXJDb2F0Pj4gPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgLyoqIFN0b3JlcyByZWZlcmVuY2VzIHRvIHRoZSB2ZXJ0ZXggYnVmZmVycyBhbmQgbWFrZXMgdGhlbSBhdmFpbGFibGUgdmlhIHRoZSByZWZlcmVuY2VzIHRvIG1lc2hlcyAqL1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHJlbmRlckJ1ZmZlcnM6IE1hcDxNZXNoLCBSZWZlcmVuY2U8UmVuZGVyQnVmZmVycz4+ID0gbmV3IE1hcCgpO1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIG5vZGVzOiBNYXBOb2RlVG9Ob2RlUmVmZXJlbmNlcyA9IG5ldyBNYXAoKTtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyB0aW1lc3RhbXBVcGRhdGU6IG51bWJlcjtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBwaWNrQnVmZmVyczogUGlja0J1ZmZlcltdO1xyXG5cclxuICAgICAgICAvLyAjcmVnaW9uIEFkZGluZ1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlZ2lzdGVyIHRoZSBub2RlIGZvciByZW5kZXJpbmcuIENyZWF0ZSBhIHJlZmVyZW5jZSBmb3IgaXQgYW5kIGluY3JlYXNlIHRoZSBtYXRjaGluZyByZW5kZXItZGF0YSByZWZlcmVuY2VzIG9yIGNyZWF0ZSB0aGVtIGZpcnN0IGlmIG5lY2Vzc2FyeVxyXG4gICAgICAgICAqIEBwYXJhbSBfbm9kZSBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGFkZE5vZGUoX25vZGU6IE5vZGUpOiB2b2lkIHtcclxuICAgICAgICAgICAgaWYgKFJlbmRlck1hbmFnZXIubm9kZXMuZ2V0KF9ub2RlKSlcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIGxldCBjbXBNYXRlcmlhbDogQ29tcG9uZW50TWF0ZXJpYWwgPSBfbm9kZS5nZXRDb21wb25lbnQoQ29tcG9uZW50TWF0ZXJpYWwpO1xyXG4gICAgICAgICAgICBpZiAoIWNtcE1hdGVyaWFsKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgbGV0IHNoYWRlcjogdHlwZW9mIFNoYWRlciA9IGNtcE1hdGVyaWFsLm1hdGVyaWFsLmdldFNoYWRlcigpO1xyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmNyZWF0ZVJlZmVyZW5jZTx0eXBlb2YgU2hhZGVyLCBSZW5kZXJTaGFkZXI+KFJlbmRlck1hbmFnZXIucmVuZGVyU2hhZGVycywgc2hhZGVyLCBSZW5kZXJNYW5hZ2VyLmNyZWF0ZVByb2dyYW0pO1xyXG5cclxuICAgICAgICAgICAgbGV0IGNvYXQ6IENvYXQgPSBjbXBNYXRlcmlhbC5tYXRlcmlhbC5nZXRDb2F0KCk7XHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIuY3JlYXRlUmVmZXJlbmNlPENvYXQsIFJlbmRlckNvYXQ+KFJlbmRlck1hbmFnZXIucmVuZGVyQ29hdHMsIGNvYXQsIFJlbmRlck1hbmFnZXIuY3JlYXRlUGFyYW1ldGVyKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBtZXNoOiBNZXNoID0gKDxDb21wb25lbnRNZXNoPl9ub2RlLmdldENvbXBvbmVudChDb21wb25lbnRNZXNoKSkubWVzaDtcclxuICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5jcmVhdGVSZWZlcmVuY2U8TWVzaCwgUmVuZGVyQnVmZmVycz4oUmVuZGVyTWFuYWdlci5yZW5kZXJCdWZmZXJzLCBtZXNoLCBSZW5kZXJNYW5hZ2VyLmNyZWF0ZUJ1ZmZlcnMpO1xyXG5cclxuICAgICAgICAgICAgbGV0IG5vZGVSZWZlcmVuY2VzOiBOb2RlUmVmZXJlbmNlcyA9IHsgc2hhZGVyOiBzaGFkZXIsIGNvYXQ6IGNvYXQsIG1lc2g6IG1lc2ggfTsgLy8sIGRvbmVUcmFuc2Zvcm1Ub1dvcmxkOiBmYWxzZSB9O1xyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLm5vZGVzLnNldChfbm9kZSwgbm9kZVJlZmVyZW5jZXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVnaXN0ZXIgdGhlIG5vZGUgYW5kIGl0cyB2YWxpZCBzdWNjZXNzb3JzIGluIHRoZSBicmFuY2ggZm9yIHJlbmRlcmluZyB1c2luZyBbW2FkZE5vZGVdXVxyXG4gICAgICAgICAqIEBwYXJhbSBfbm9kZSBcclxuICAgICAgICAgKiBAcmV0dXJucyBmYWxzZSwgaWYgdGhlIGdpdmVuIG5vZGUgaGFzIGEgY3VycmVudCB0aW1lc3RhbXAgdGh1cyBoYXZpbmcgYmVpbmcgcHJvY2Vzc2VkIGR1cmluZyBsYXRlc3QgUmVuZGVyTWFuYWdlci51cGRhdGUgYW5kIG5vIGFkZGl0aW9uIGlzIG5lZWRlZFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgYWRkQnJhbmNoKF9ub2RlOiBOb2RlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgIGlmIChfbm9kZS5pc1VwZGF0ZWQoUmVuZGVyTWFuYWdlci50aW1lc3RhbXBVcGRhdGUpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBub2RlIG9mIF9ub2RlLmJyYW5jaClcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gbWF5IGZhaWwgd2hlbiBzb21lIGNvbXBvbmVudHMgYXJlIG1pc3NpbmcuIFRPRE86IGNsZWFudXBcclxuICAgICAgICAgICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmFkZE5vZGUobm9kZSk7XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChfZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIERlYnVnLmxvZyhfZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyAjZW5kcmVnaW9uXHJcblxyXG4gICAgICAgIC8vICNyZWdpb24gUmVtb3ZpbmdcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBVbnJlZ2lzdGVyIHRoZSBub2RlIHNvIHRoYXQgaXQgd29uJ3QgYmUgcmVuZGVyZWQgYW55IG1vcmUuIERlY3JlYXNlIHRoZSByZW5kZXItZGF0YSByZWZlcmVuY2VzIGFuZCBkZWxldGUgdGhlIG5vZGUgcmVmZXJlbmNlLlxyXG4gICAgICAgICAqIEBwYXJhbSBfbm9kZSBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHJlbW92ZU5vZGUoX25vZGU6IE5vZGUpOiB2b2lkIHtcclxuICAgICAgICAgICAgbGV0IG5vZGVSZWZlcmVuY2VzOiBOb2RlUmVmZXJlbmNlcyA9IFJlbmRlck1hbmFnZXIubm9kZXMuZ2V0KF9ub2RlKTtcclxuICAgICAgICAgICAgaWYgKCFub2RlUmVmZXJlbmNlcylcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIucmVtb3ZlUmVmZXJlbmNlPHR5cGVvZiBTaGFkZXIsIFJlbmRlclNoYWRlcj4oUmVuZGVyTWFuYWdlci5yZW5kZXJTaGFkZXJzLCBub2RlUmVmZXJlbmNlcy5zaGFkZXIsIFJlbmRlck1hbmFnZXIuZGVsZXRlUHJvZ3JhbSk7XHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIucmVtb3ZlUmVmZXJlbmNlPENvYXQsIFJlbmRlckNvYXQ+KFJlbmRlck1hbmFnZXIucmVuZGVyQ29hdHMsIG5vZGVSZWZlcmVuY2VzLmNvYXQsIFJlbmRlck1hbmFnZXIuZGVsZXRlUGFyYW1ldGVyKTtcclxuICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5yZW1vdmVSZWZlcmVuY2U8TWVzaCwgUmVuZGVyQnVmZmVycz4oUmVuZGVyTWFuYWdlci5yZW5kZXJCdWZmZXJzLCBub2RlUmVmZXJlbmNlcy5tZXNoLCBSZW5kZXJNYW5hZ2VyLmRlbGV0ZUJ1ZmZlcnMpO1xyXG5cclxuICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5ub2Rlcy5kZWxldGUoX25vZGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVW5yZWdpc3RlciB0aGUgbm9kZSBhbmQgaXRzIHZhbGlkIHN1Y2Nlc3NvcnMgaW4gdGhlIGJyYW5jaCB0byBmcmVlIHJlbmRlcmVyIHJlc291cmNlcy4gVXNlcyBbW3JlbW92ZU5vZGVdXVxyXG4gICAgICAgICAqIEBwYXJhbSBfbm9kZSBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHJlbW92ZUJyYW5jaChfbm9kZTogTm9kZSk6IHZvaWQge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBub2RlIG9mIF9ub2RlLmJyYW5jaClcclxuICAgICAgICAgICAgICAgIFJlbmRlck1hbmFnZXIucmVtb3ZlTm9kZShub2RlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gI2VuZHJlZ2lvblxyXG5cclxuICAgICAgICAvLyAjcmVnaW9uIFVwZGF0aW5nXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVmbGVjdCBjaGFuZ2VzIGluIHRoZSBub2RlIGNvbmNlcm5pbmcgc2hhZGVyLCBjb2F0IGFuZCBtZXNoLCBtYW5hZ2UgdGhlIHJlbmRlci1kYXRhIHJlZmVyZW5jZXMgYWNjb3JkaW5nbHkgYW5kIHVwZGF0ZSB0aGUgbm9kZSByZWZlcmVuY2VzXHJcbiAgICAgICAgICogQHBhcmFtIF9ub2RlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyB1cGRhdGVOb2RlKF9ub2RlOiBOb2RlKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGxldCBub2RlUmVmZXJlbmNlczogTm9kZVJlZmVyZW5jZXMgPSBSZW5kZXJNYW5hZ2VyLm5vZGVzLmdldChfbm9kZSk7XHJcbiAgICAgICAgICAgIGlmICghbm9kZVJlZmVyZW5jZXMpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgICAgICBsZXQgY21wTWF0ZXJpYWw6IENvbXBvbmVudE1hdGVyaWFsID0gX25vZGUuZ2V0Q29tcG9uZW50KENvbXBvbmVudE1hdGVyaWFsKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBzaGFkZXI6IHR5cGVvZiBTaGFkZXIgPSBjbXBNYXRlcmlhbC5tYXRlcmlhbC5nZXRTaGFkZXIoKTtcclxuICAgICAgICAgICAgaWYgKHNoYWRlciAhPT0gbm9kZVJlZmVyZW5jZXMuc2hhZGVyKSB7XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLnJlbW92ZVJlZmVyZW5jZTx0eXBlb2YgU2hhZGVyLCBSZW5kZXJTaGFkZXI+KFJlbmRlck1hbmFnZXIucmVuZGVyU2hhZGVycywgbm9kZVJlZmVyZW5jZXMuc2hhZGVyLCBSZW5kZXJNYW5hZ2VyLmRlbGV0ZVByb2dyYW0pO1xyXG4gICAgICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5jcmVhdGVSZWZlcmVuY2U8dHlwZW9mIFNoYWRlciwgUmVuZGVyU2hhZGVyPihSZW5kZXJNYW5hZ2VyLnJlbmRlclNoYWRlcnMsIHNoYWRlciwgUmVuZGVyTWFuYWdlci5jcmVhdGVQcm9ncmFtKTtcclxuICAgICAgICAgICAgICAgIG5vZGVSZWZlcmVuY2VzLnNoYWRlciA9IHNoYWRlcjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGNvYXQ6IENvYXQgPSBjbXBNYXRlcmlhbC5tYXRlcmlhbC5nZXRDb2F0KCk7XHJcbiAgICAgICAgICAgIGlmIChjb2F0ICE9PSBub2RlUmVmZXJlbmNlcy5jb2F0KSB7XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLnJlbW92ZVJlZmVyZW5jZTxDb2F0LCBSZW5kZXJDb2F0PihSZW5kZXJNYW5hZ2VyLnJlbmRlckNvYXRzLCBub2RlUmVmZXJlbmNlcy5jb2F0LCBSZW5kZXJNYW5hZ2VyLmRlbGV0ZVBhcmFtZXRlcik7XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmNyZWF0ZVJlZmVyZW5jZTxDb2F0LCBSZW5kZXJDb2F0PihSZW5kZXJNYW5hZ2VyLnJlbmRlckNvYXRzLCBjb2F0LCBSZW5kZXJNYW5hZ2VyLmNyZWF0ZVBhcmFtZXRlcik7XHJcbiAgICAgICAgICAgICAgICBub2RlUmVmZXJlbmNlcy5jb2F0ID0gY29hdDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IG1lc2g6IE1lc2ggPSAoPENvbXBvbmVudE1lc2g+KF9ub2RlLmdldENvbXBvbmVudChDb21wb25lbnRNZXNoKSkpLm1lc2g7XHJcbiAgICAgICAgICAgIGlmIChtZXNoICE9PSBub2RlUmVmZXJlbmNlcy5tZXNoKSB7XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLnJlbW92ZVJlZmVyZW5jZTxNZXNoLCBSZW5kZXJCdWZmZXJzPihSZW5kZXJNYW5hZ2VyLnJlbmRlckJ1ZmZlcnMsIG5vZGVSZWZlcmVuY2VzLm1lc2gsIFJlbmRlck1hbmFnZXIuZGVsZXRlQnVmZmVycyk7XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmNyZWF0ZVJlZmVyZW5jZTxNZXNoLCBSZW5kZXJCdWZmZXJzPihSZW5kZXJNYW5hZ2VyLnJlbmRlckJ1ZmZlcnMsIG1lc2gsIFJlbmRlck1hbmFnZXIuY3JlYXRlQnVmZmVycyk7XHJcbiAgICAgICAgICAgICAgICBub2RlUmVmZXJlbmNlcy5tZXNoID0gbWVzaDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVXBkYXRlIHRoZSBub2RlIGFuZCBpdHMgdmFsaWQgc3VjY2Vzc29ycyBpbiB0aGUgYnJhbmNoIHVzaW5nIFtbdXBkYXRlTm9kZV1dXHJcbiAgICAgICAgICogQHBhcmFtIF9ub2RlIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdXBkYXRlQnJhbmNoKF9ub2RlOiBOb2RlKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2YgX25vZGUuYnJhbmNoKVxyXG4gICAgICAgICAgICAgICAgUmVuZGVyTWFuYWdlci51cGRhdGVOb2RlKG5vZGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyAjZW5kcmVnaW9uXHJcblxyXG4gICAgICAgIC8vICNyZWdpb24gTGlnaHRzXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVmlld3BvcnRzIGNvbGxlY3QgdGhlIGxpZ2h0cyByZWxldmFudCB0byB0aGUgYnJhbmNoIHRvIHJlbmRlciBhbmQgY2FsbHMgc2V0TGlnaHRzIHRvIHBhc3MgdGhlIGNvbGxlY3Rpb24uICBcclxuICAgICAgICAgKiBSZW5kZXJNYW5hZ2VyIHBhc3NlcyBpdCBvbiB0byBhbGwgc2hhZGVycyB1c2VkIHRoYXQgY2FuIHByb2Nlc3MgbGlnaHRcclxuICAgICAgICAgKiBAcGFyYW0gX2xpZ2h0c1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgc2V0TGlnaHRzKF9saWdodHM6IE1hcExpZ2h0VHlwZVRvTGlnaHRMaXN0KTogdm9pZCB7XHJcbiAgICAgICAgICAgIC8vIGxldCByZW5kZXJMaWdodHM6IFJlbmRlckxpZ2h0cyA9IFJlbmRlck1hbmFnZXIuY3JlYXRlUmVuZGVyTGlnaHRzKF9saWdodHMpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBlbnRyeSBvZiBSZW5kZXJNYW5hZ2VyLnJlbmRlclNoYWRlcnMpIHtcclxuICAgICAgICAgICAgICAgIGxldCByZW5kZXJTaGFkZXI6IFJlbmRlclNoYWRlciA9IGVudHJ5WzFdLmdldFJlZmVyZW5jZSgpO1xyXG4gICAgICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5zZXRMaWdodHNJblNoYWRlcihyZW5kZXJTaGFkZXIsIF9saWdodHMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIGRlYnVnZ2VyO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyAjZW5kcmVnaW9uXHJcblxyXG4gICAgICAgIC8vICNyZWdpb24gUmVuZGVyaW5nXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVXBkYXRlIGFsbCByZW5kZXIgZGF0YS4gQWZ0ZXIgUmVuZGVyTWFuYWdlciwgbXVsdGlwbGUgdmlld3BvcnRzIGNhbiByZW5kZXIgdGhlaXIgYXNzb2NpYXRlZCBkYXRhIHdpdGhvdXQgdXBkYXRpbmcgdGhlIHNhbWUgZGF0YSBtdWx0aXBsZSB0aW1lc1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdXBkYXRlKCk6IHZvaWQge1xyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLnRpbWVzdGFtcFVwZGF0ZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLnJlY2FsY3VsYXRlQWxsTm9kZVRyYW5zZm9ybXMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENsZWFyIHRoZSBvZmZzY3JlZW4gcmVuZGVyYnVmZmVyIHdpdGggdGhlIGdpdmVuIFtbQ29sb3JdXVxyXG4gICAgICAgICAqIEBwYXJhbSBfY29sb3IgXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBjbGVhcihfY29sb3I6IENvbG9yID0gbnVsbCk6IHZvaWQge1xyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmNyYzMuY2xlYXJDb2xvcihfY29sb3IuciwgX2NvbG9yLmcsIF9jb2xvci5iLCBfY29sb3IuYSk7XHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIuY3JjMy5jbGVhcihXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkNPTE9SX0JVRkZFUl9CSVQgfCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkRFUFRIX0JVRkZFUl9CSVQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVzZXQgdGhlIG9mZnNjcmVlbiBmcmFtZWJ1ZmZlciB0byB0aGUgb3JpZ2luYWwgUmVuZGVyaW5nQ29udGV4dFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgcmVzZXRGcmFtZUJ1ZmZlcihfY29sb3I6IENvbG9yID0gbnVsbCk6IHZvaWQge1xyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmNyYzMuYmluZEZyYW1lYnVmZmVyKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuRlJBTUVCVUZGRVIsIG51bGwpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRHJhd3MgdGhlIGJyYW5jaCBzdGFydGluZyB3aXRoIHRoZSBnaXZlbiBbW05vZGVdXSB1c2luZyB0aGUgY2FtZXJhIGdpdmVuIFtbQ29tcG9uZW50Q2FtZXJhXV0uXHJcbiAgICAgICAgICogQHBhcmFtIF9ub2RlIFxyXG4gICAgICAgICAqIEBwYXJhbSBfY21wQ2FtZXJhIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZHJhd0JyYW5jaChfbm9kZTogTm9kZSwgX2NtcENhbWVyYTogQ29tcG9uZW50Q2FtZXJhLCBfZHJhd05vZGU6IEZ1bmN0aW9uID0gUmVuZGVyTWFuYWdlci5kcmF3Tm9kZSk6IHZvaWQgeyAvLyBUT0RPOiBzZWUgaWYgdGhpcmQgcGFyYW1ldGVyIF93b3JsZD86IE1hdHJpeDR4NCB3b3VsZCBiZSB1c2VmdWxsXHJcbiAgICAgICAgICAgIGlmIChfZHJhd05vZGUgPT0gUmVuZGVyTWFuYWdlci5kcmF3Tm9kZSlcclxuICAgICAgICAgICAgICAgIFJlbmRlck1hbmFnZXIucmVzZXRGcmFtZUJ1ZmZlcigpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGZpbmFsVHJhbnNmb3JtOiBNYXRyaXg0eDQ7XHJcblxyXG4gICAgICAgICAgICBsZXQgY21wTWVzaDogQ29tcG9uZW50TWVzaCA9IF9ub2RlLmdldENvbXBvbmVudChDb21wb25lbnRNZXNoKTtcclxuICAgICAgICAgICAgaWYgKGNtcE1lc2gpXHJcbiAgICAgICAgICAgICAgICBmaW5hbFRyYW5zZm9ybSA9IE1hdHJpeDR4NC5NVUxUSVBMSUNBVElPTihfbm9kZS5tdHhXb3JsZCwgY21wTWVzaC5waXZvdCk7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIGZpbmFsVHJhbnNmb3JtID0gX25vZGUubXR4V29ybGQ7IC8vIGNhdXRpb24sIFJlbmRlck1hbmFnZXIgaXMgYSByZWZlcmVuY2UuLi5cclxuXHJcbiAgICAgICAgICAgIC8vIG11bHRpcGx5IGNhbWVyYSBtYXRyaXhcclxuICAgICAgICAgICAgbGV0IHByb2plY3Rpb246IE1hdHJpeDR4NCA9IE1hdHJpeDR4NC5NVUxUSVBMSUNBVElPTihfY21wQ2FtZXJhLlZpZXdQcm9qZWN0aW9uTWF0cml4LCBmaW5hbFRyYW5zZm9ybSk7XHJcblxyXG4gICAgICAgICAgICBfZHJhd05vZGUoX25vZGUsIGZpbmFsVHJhbnNmb3JtLCBwcm9qZWN0aW9uKTtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IG5hbWUgaW4gX25vZGUuZ2V0Q2hpbGRyZW4oKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNoaWxkTm9kZTogTm9kZSA9IF9ub2RlLmdldENoaWxkcmVuKClbbmFtZV07XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmRyYXdCcmFuY2goY2hpbGROb2RlLCBfY21wQ2FtZXJhLCBfZHJhd05vZGUpOyAvLywgd29ybGQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBSZWN5Y2xlci5zdG9yZShwcm9qZWN0aW9uKTtcclxuICAgICAgICAgICAgaWYgKGZpbmFsVHJhbnNmb3JtICE9IF9ub2RlLm10eFdvcmxkKVxyXG4gICAgICAgICAgICAgICAgUmVjeWNsZXIuc3RvcmUoZmluYWxUcmFuc2Zvcm0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8jcmVnaW9uIFJheUNhc3QgJiBQaWNraW5nXHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERyYXdzIHRoZSBicmFuY2ggZm9yIFJheUNhc3Rpbmcgc3RhcnRpbmcgd2l0aCB0aGUgZ2l2ZW4gW1tOb2RlXV0gdXNpbmcgdGhlIGNhbWVyYSBnaXZlbiBbW0NvbXBvbmVudENhbWVyYV1dLlxyXG4gICAgICAgICAqIEBwYXJhbSBfbm9kZSBcclxuICAgICAgICAgKiBAcGFyYW0gX2NtcENhbWVyYSBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGRyYXdCcmFuY2hGb3JSYXlDYXN0KF9ub2RlOiBOb2RlLCBfY21wQ2FtZXJhOiBDb21wb25lbnRDYW1lcmEpOiBQaWNrQnVmZmVyW10geyAvLyBUT0RPOiBzZWUgaWYgdGhpcmQgcGFyYW1ldGVyIF93b3JsZD86IE1hdHJpeDR4NCB3b3VsZCBiZSB1c2VmdWxsXHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIucGlja0J1ZmZlcnMgPSBbXTtcclxuICAgICAgICAgICAgaWYgKCFSZW5kZXJNYW5hZ2VyLnJlbmRlclNoYWRlcnMuZ2V0KFNoYWRlclJheUNhc3QpKVxyXG4gICAgICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5jcmVhdGVSZWZlcmVuY2U8dHlwZW9mIFNoYWRlciwgUmVuZGVyU2hhZGVyPihSZW5kZXJNYW5hZ2VyLnJlbmRlclNoYWRlcnMsIFNoYWRlclJheUNhc3QsIFJlbmRlck1hbmFnZXIuY3JlYXRlUHJvZ3JhbSk7XHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIuZHJhd0JyYW5jaChfbm9kZSwgX2NtcENhbWVyYSwgUmVuZGVyTWFuYWdlci5kcmF3Tm9kZUZvclJheUNhc3QpO1xyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLnJlc2V0RnJhbWVCdWZmZXIoKTtcclxuICAgICAgICAgICAgcmV0dXJuIFJlbmRlck1hbmFnZXIucGlja0J1ZmZlcnM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHBpY2tOb2RlQXQoX3BvczogVmVjdG9yMiwgX3BpY2tCdWZmZXJzOiBQaWNrQnVmZmVyW10sIF9yZWN0OiBSZWN0YW5nbGUpOiBSYXlIaXRbXSB7XHJcbiAgICAgICAgICAgIGxldCBoaXRzOiBSYXlIaXRbXSA9IFtdO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgZm9yIChsZXQgcGlja0J1ZmZlciBvZiBfcGlja0J1ZmZlcnMpIHtcclxuICAgICAgICAgICAgICAgIFJlbmRlck1hbmFnZXIuY3JjMy5iaW5kRnJhbWVidWZmZXIoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5GUkFNRUJVRkZFUiwgcGlja0J1ZmZlci5mcmFtZUJ1ZmZlcik7XHJcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBpbnN0ZWFkIG9mIHJlYWRpbmcgYWxsIGRhdGEgYW5kIGFmdGVyd2FyZHMgcGljayB0aGUgcGl4ZWwsIHJlYWQgb25seSB0aGUgcGl4ZWwhXHJcbiAgICAgICAgICAgICAgICBsZXQgZGF0YTogVWludDhBcnJheSA9IG5ldyBVaW50OEFycmF5KF9yZWN0LndpZHRoICogX3JlY3QuaGVpZ2h0ICogNCk7XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmNyYzMucmVhZFBpeGVscygwLCAwLCBfcmVjdC53aWR0aCwgX3JlY3QuaGVpZ2h0LCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlJHQkEsIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVU5TSUdORURfQllURSwgZGF0YSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGl4ZWw6IG51bWJlciA9IF9wb3MueCArIF9yZWN0LndpZHRoICogX3Bvcy55O1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCB6QnVmZmVyOiBudW1iZXIgPSBkYXRhWzQgKiBwaXhlbCArIDJdICsgZGF0YVs0ICogcGl4ZWwgKyAzXSAvIDI1NjtcclxuICAgICAgICAgICAgICAgIGxldCBoaXQ6IFJheUhpdCA9IG5ldyBSYXlIaXQocGlja0J1ZmZlci5ub2RlLCAwLCB6QnVmZmVyKTtcclxuXHJcbiAgICAgICAgICAgICAgICBoaXRzLnB1c2goaGl0KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGhpdHM7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgZHJhd05vZGUoX25vZGU6IE5vZGUsIF9maW5hbFRyYW5zZm9ybTogTWF0cml4NHg0LCBfcHJvamVjdGlvbjogTWF0cml4NHg0KTogdm9pZCB7XHJcbiAgICAgICAgICAgIGxldCByZWZlcmVuY2VzOiBOb2RlUmVmZXJlbmNlcyA9IFJlbmRlck1hbmFnZXIubm9kZXMuZ2V0KF9ub2RlKTtcclxuICAgICAgICAgICAgaWYgKCFyZWZlcmVuY2VzKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuOyAvLyBUT0RPOiBkZWFsIHdpdGggcGFydGlhbCByZWZlcmVuY2VzXHJcblxyXG4gICAgICAgICAgICBsZXQgYnVmZmVySW5mbzogUmVuZGVyQnVmZmVycyA9IFJlbmRlck1hbmFnZXIucmVuZGVyQnVmZmVycy5nZXQocmVmZXJlbmNlcy5tZXNoKS5nZXRSZWZlcmVuY2UoKTtcclxuICAgICAgICAgICAgbGV0IGNvYXRJbmZvOiBSZW5kZXJDb2F0ID0gUmVuZGVyTWFuYWdlci5yZW5kZXJDb2F0cy5nZXQocmVmZXJlbmNlcy5jb2F0KS5nZXRSZWZlcmVuY2UoKTtcclxuICAgICAgICAgICAgbGV0IHNoYWRlckluZm86IFJlbmRlclNoYWRlciA9IFJlbmRlck1hbmFnZXIucmVuZGVyU2hhZGVycy5nZXQocmVmZXJlbmNlcy5zaGFkZXIpLmdldFJlZmVyZW5jZSgpO1xyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmRyYXcoc2hhZGVySW5mbywgYnVmZmVySW5mbywgY29hdEluZm8sIF9maW5hbFRyYW5zZm9ybSwgX3Byb2plY3Rpb24pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgZHJhd05vZGVGb3JSYXlDYXN0KF9ub2RlOiBOb2RlLCBfZmluYWxUcmFuc2Zvcm06IE1hdHJpeDR4NCwgX3Byb2plY3Rpb246IE1hdHJpeDR4NCk6IHZvaWQgeyAvLyBjcmVhdGUgVGV4dHVyZSB0byByZW5kZXIgdG8sIGludC1yZ2JhXHJcbiAgICAgICAgICAgIC8vIFRPRE86IGxvb2sgaW50byBTU0JPcyFcclxuICAgICAgICAgICAgbGV0IHRhcmdldDogV2ViR0xUZXh0dXJlID0gUmVuZGVyTWFuYWdlci5nZXRSYXlDYXN0VGV4dHVyZSgpO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgZnJhbWVidWZmZXI6IFdlYkdMRnJhbWVidWZmZXIgPSBSZW5kZXJNYW5hZ2VyLmNyYzMuY3JlYXRlRnJhbWVidWZmZXIoKTtcclxuICAgICAgICAgICAgLy8gcmVuZGVyIHRvIG91ciB0YXJnZXRUZXh0dXJlIGJ5IGJpbmRpbmcgdGhlIGZyYW1lYnVmZmVyXHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIuY3JjMy5iaW5kRnJhbWVidWZmZXIoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5GUkFNRUJVRkZFUiwgZnJhbWVidWZmZXIpO1xyXG4gICAgICAgICAgICAvLyBhdHRhY2ggdGhlIHRleHR1cmUgYXMgdGhlIGZpcnN0IGNvbG9yIGF0dGFjaG1lbnRcclxuICAgICAgICAgICAgY29uc3QgYXR0YWNobWVudFBvaW50OiBudW1iZXIgPSBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkNPTE9SX0FUVEFDSE1FTlQwO1xyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmNyYzMuZnJhbWVidWZmZXJUZXh0dXJlMkQoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5GUkFNRUJVRkZFUiwgYXR0YWNobWVudFBvaW50LCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlRFWFRVUkVfMkQsIHRhcmdldCwgMCk7XHJcblxyXG4gICAgICAgICAgICAvLyBzZXQgcmVuZGVyIHRhcmdldFxyXG5cclxuICAgICAgICAgICAgbGV0IHJlZmVyZW5jZXM6IE5vZGVSZWZlcmVuY2VzID0gUmVuZGVyTWFuYWdlci5ub2Rlcy5nZXQoX25vZGUpO1xyXG4gICAgICAgICAgICBpZiAoIXJlZmVyZW5jZXMpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47IC8vIFRPRE86IGRlYWwgd2l0aCBwYXJ0aWFsIHJlZmVyZW5jZXNcclxuXHJcbiAgICAgICAgICAgIGxldCBwaWNrQnVmZmVyOiBQaWNrQnVmZmVyID0ge25vZGU6IF9ub2RlLCB0ZXh0dXJlOiB0YXJnZXQsIGZyYW1lQnVmZmVyOiBmcmFtZWJ1ZmZlcn07XHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIucGlja0J1ZmZlcnMucHVzaChwaWNrQnVmZmVyKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBidWZmZXJJbmZvOiBSZW5kZXJCdWZmZXJzID0gUmVuZGVyTWFuYWdlci5yZW5kZXJCdWZmZXJzLmdldChyZWZlcmVuY2VzLm1lc2gpLmdldFJlZmVyZW5jZSgpO1xyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmRyYXdGb3JSYXlDYXN0KFJlbmRlck1hbmFnZXIucGlja0J1ZmZlcnMubGVuZ3RoLCBidWZmZXJJbmZvLCBfZmluYWxUcmFuc2Zvcm0sIF9wcm9qZWN0aW9uKTtcclxuICAgICAgICAgICAgLy8gbWFrZSB0ZXh0dXJlIGF2YWlsYWJsZSB0byBvbnNjcmVlbi1kaXNwbGF5XHJcbiAgICAgICAgICAgIC8vIElERUE6IEl0ZXJhdGUgb3ZlciB0ZXh0dXJlcywgY29sbGVjdCBkYXRhIGlmIHogaW5kaWNhdGVzIGhpdCwgc29ydCBieSB6XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBnZXRSYXlDYXN0VGV4dHVyZSgpOiBXZWJHTFRleHR1cmUge1xyXG4gICAgICAgICAgICAvLyBjcmVhdGUgdG8gcmVuZGVyIHRvXHJcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldFRleHR1cmVXaWR0aDogbnVtYmVyID0gUmVuZGVyTWFuYWdlci5nZXRWaWV3cG9ydFJlY3RhbmdsZSgpLndpZHRoO1xyXG4gICAgICAgICAgICBjb25zdCB0YXJnZXRUZXh0dXJlSGVpZ2h0OiBudW1iZXIgPSBSZW5kZXJNYW5hZ2VyLmdldFZpZXdwb3J0UmVjdGFuZ2xlKCkuaGVpZ2h0O1xyXG4gICAgICAgICAgICBjb25zdCB0YXJnZXRUZXh0dXJlOiBXZWJHTFRleHR1cmUgPSBSZW5kZXJNYW5hZ2VyLmNyYzMuY3JlYXRlVGV4dHVyZSgpO1xyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmNyYzMuYmluZFRleHR1cmUoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5URVhUVVJFXzJELCB0YXJnZXRUZXh0dXJlKTtcclxuXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGludGVybmFsRm9ybWF0OiBudW1iZXIgPSBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlJHQkE4O1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZm9ybWF0OiBudW1iZXIgPSBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlJHQkE7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0eXBlOiBudW1iZXIgPSBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlVOU0lHTkVEX0JZVEU7XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmNyYzMudGV4SW1hZ2UyRChcclxuICAgICAgICAgICAgICAgICAgICBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlRFWFRVUkVfMkQsIDAsIGludGVybmFsRm9ybWF0LCB0YXJnZXRUZXh0dXJlV2lkdGgsIHRhcmdldFRleHR1cmVIZWlnaHQsIDAsIGZvcm1hdCwgdHlwZSwgbnVsbFxyXG4gICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBzZXQgdGhlIGZpbHRlcmluZyBzbyB3ZSBkb24ndCBuZWVkIG1pcHNcclxuICAgICAgICAgICAgICAgIFJlbmRlck1hbmFnZXIuY3JjMy50ZXhQYXJhbWV0ZXJpKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVEVYVFVSRV8yRCwgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5URVhUVVJFX01JTl9GSUxURVIsIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuTElORUFSKTtcclxuICAgICAgICAgICAgICAgIFJlbmRlck1hbmFnZXIuY3JjMy50ZXhQYXJhbWV0ZXJpKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVEVYVFVSRV8yRCwgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5URVhUVVJFX1dSQVBfUywgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5DTEFNUF9UT19FREdFKTtcclxuICAgICAgICAgICAgICAgIFJlbmRlck1hbmFnZXIuY3JjMy50ZXhQYXJhbWV0ZXJpKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVEVYVFVSRV8yRCwgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5URVhUVVJFX1dSQVBfVCwgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5DTEFNUF9UT19FREdFKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRhcmdldFRleHR1cmU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vI2VuZHJlZ2lvblxyXG5cclxuICAgICAgICAvLyNyZWdpb24gVHJhbnNmb3JtYXRpb24gb2YgYnJhbmNoXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVjYWxjdWxhdGUgdGhlIHdvcmxkIG1hdHJpeCBvZiBhbGwgcmVnaXN0ZXJlZCBub2RlcyByZXNwZWN0aW5nIHRoZWlyIGhpZXJhcmNoaWNhbCByZWxhdGlvbi5cclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyByZWNhbGN1bGF0ZUFsbE5vZGVUcmFuc2Zvcm1zKCk6IHZvaWQge1xyXG4gICAgICAgICAgICAvLyBpbm5lciBmdW5jdGlvbiB0byBiZSBjYWxsZWQgaW4gYSBmb3IgZWFjaCBub2RlIGF0IHRoZSBib3R0b20gb2YgUmVuZGVyTWFuYWdlciBmdW5jdGlvblxyXG4gICAgICAgICAgICAvLyBmdW5jdGlvbiBtYXJrTm9kZVRvQmVUcmFuc2Zvcm1lZChfbm9kZVJlZmVyZW5jZXM6IE5vZGVSZWZlcmVuY2VzLCBfbm9kZTogTm9kZSwgX21hcDogTWFwTm9kZVRvTm9kZVJlZmVyZW5jZXMpOiB2b2lkIHtcclxuICAgICAgICAgICAgLy8gICAgIF9ub2RlUmVmZXJlbmNlcy5kb25lVHJhbnNmb3JtVG9Xb3JsZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgICAgICAvLyBpbm5lciBmdW5jdGlvbiB0byBiZSBjYWxsZWQgaW4gYSBmb3IgZWFjaCBub2RlIGF0IHRoZSBib3R0b20gb2YgUmVuZGVyTWFuYWdlciBmdW5jdGlvblxyXG4gICAgICAgICAgICBsZXQgcmVjYWxjdWxhdGVCcmFuY2hDb250YWluaW5nTm9kZTogKF9yOiBOb2RlUmVmZXJlbmNlcywgX246IE5vZGUsIF9tOiBNYXBOb2RlVG9Ob2RlUmVmZXJlbmNlcykgPT4gdm9pZCA9IChfbm9kZVJlZmVyZW5jZXM6IE5vZGVSZWZlcmVuY2VzLCBfbm9kZTogTm9kZSwgX21hcDogTWFwTm9kZVRvTm9kZVJlZmVyZW5jZXMpID0+IHtcclxuICAgICAgICAgICAgICAgIC8vIGZpbmQgdXBwZXJtb3N0IGFuY2VzdG9yIG5vdCByZWNhbGN1bGF0ZWQgeWV0XHJcbiAgICAgICAgICAgICAgICBsZXQgYW5jZXN0b3I6IE5vZGUgPSBfbm9kZTtcclxuICAgICAgICAgICAgICAgIGxldCBwYXJlbnQ6IE5vZGU7XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudCA9IGFuY2VzdG9yLmdldFBhcmVudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghcGFyZW50KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBpZiAoX25vZGUuaXNVcGRhdGVkKFJlbmRlck1hbmFnZXIudGltZXN0YW1wVXBkYXRlKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgYW5jZXN0b3IgPSBwYXJlbnQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBjaGVjayBpZiBub2RlcyB3aXRob3V0IG1lc2hlcyBtdXN0IGJlIHJlZ2lzdGVyZWRcclxuXHJcbiAgICAgICAgICAgICAgICAvLyB1c2UgdGhlIGFuY2VzdG9ycyBwYXJlbnQgd29ybGQgbWF0cml4IHRvIHN0YXJ0IHdpdGgsIG9yIGlkZW50aXR5IGlmIG5vIHBhcmVudCBleGlzdHMgb3IgaXQncyBtaXNzaW5nIGEgQ29tcG9uZW5UcmFuc2Zvcm1cclxuICAgICAgICAgICAgICAgIGxldCBtYXRyaXg6IE1hdHJpeDR4NCA9IE1hdHJpeDR4NC5JREVOVElUWTtcclxuICAgICAgICAgICAgICAgIGlmIChwYXJlbnQpXHJcbiAgICAgICAgICAgICAgICAgICAgbWF0cml4ID0gcGFyZW50Lm10eFdvcmxkO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIHN0YXJ0IHJlY3Vyc2l2ZSByZWNhbGN1bGF0aW9uIG9mIHRoZSB3aG9sZSBicmFuY2ggc3RhcnRpbmcgZnJvbSB0aGUgYW5jZXN0b3IgZm91bmRcclxuICAgICAgICAgICAgICAgIFJlbmRlck1hbmFnZXIucmVjYWxjdWxhdGVUcmFuc2Zvcm1zT2ZOb2RlQW5kQ2hpbGRyZW4oYW5jZXN0b3IsIG1hdHJpeCk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvLyBjYWxsIHRoZSBmdW5jdGlvbnMgYWJvdmUgZm9yIGVhY2ggcmVnaXN0ZXJlZCBub2RlXHJcbiAgICAgICAgICAgIC8vIFJlbmRlck1hbmFnZXIubm9kZXMuZm9yRWFjaChtYXJrTm9kZVRvQmVUcmFuc2Zvcm1lZCk7XHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIubm9kZXMuZm9yRWFjaChyZWNhbGN1bGF0ZUJyYW5jaENvbnRhaW5pbmdOb2RlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlY3Vyc2l2ZSBtZXRob2QgcmVjZWl2aW5nIGEgY2hpbGRub2RlIGFuZCBpdHMgcGFyZW50cyB1cGRhdGVkIHdvcmxkIHRyYW5zZm9ybS4gIFxyXG4gICAgICAgICAqIElmIHRoZSBjaGlsZG5vZGUgb3ducyBhIENvbXBvbmVudFRyYW5zZm9ybSwgaXRzIHdvcmxkbWF0cml4IGlzIHJlY2FsY3VsYXRlZCBhbmQgcGFzc2VkIG9uIHRvIGl0cyBjaGlsZHJlbiwgb3RoZXJ3aXNlIGl0cyBwYXJlbnRzIG1hdHJpeFxyXG4gICAgICAgICAqIEBwYXJhbSBfbm9kZSBcclxuICAgICAgICAgKiBAcGFyYW0gX3dvcmxkIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHJlY2FsY3VsYXRlVHJhbnNmb3Jtc09mTm9kZUFuZENoaWxkcmVuKF9ub2RlOiBOb2RlLCBfd29ybGQ6IE1hdHJpeDR4NCk6IHZvaWQge1xyXG4gICAgICAgICAgICBsZXQgd29ybGQ6IE1hdHJpeDR4NCA9IF93b3JsZDtcclxuICAgICAgICAgICAgbGV0IGNtcFRyYW5zZm9ybTogQ29tcG9uZW50VHJhbnNmb3JtID0gX25vZGUuY21wVHJhbnNmb3JtO1xyXG4gICAgICAgICAgICBpZiAoY21wVHJhbnNmb3JtKVxyXG4gICAgICAgICAgICAgICAgd29ybGQgPSBNYXRyaXg0eDQuTVVMVElQTElDQVRJT04oX3dvcmxkLCBjbXBUcmFuc2Zvcm0ubG9jYWwpO1xyXG5cclxuICAgICAgICAgICAgX25vZGUubXR4V29ybGQgPSB3b3JsZDtcclxuICAgICAgICAgICAgX25vZGUudGltZXN0YW1wVXBkYXRlID0gUmVuZGVyTWFuYWdlci50aW1lc3RhbXBVcGRhdGU7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiBfbm9kZS5nZXRDaGlsZHJlbigpKSB7XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLnJlY2FsY3VsYXRlVHJhbnNmb3Jtc09mTm9kZUFuZENoaWxkcmVuKGNoaWxkLCB3b3JsZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gI2VuZHJlZ2lvblxyXG5cclxuICAgICAgICAvLyAjcmVnaW9uIE1hbmFnZSByZWZlcmVuY2VzIHRvIHJlbmRlciBkYXRhXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVtb3ZlcyBhIHJlZmVyZW5jZSB0byBhIHByb2dyYW0sIHBhcmFtZXRlciBvciBidWZmZXIgYnkgZGVjcmVhc2luZyBpdHMgcmVmZXJlbmNlIGNvdW50ZXIgYW5kIGRlbGV0aW5nIGl0LCBpZiB0aGUgY291bnRlciByZWFjaGVzIDBcclxuICAgICAgICAgKiBAcGFyYW0gX2luIFxyXG4gICAgICAgICAqIEBwYXJhbSBfa2V5IFxyXG4gICAgICAgICAqIEBwYXJhbSBfZGVsZXRvciBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyByZW1vdmVSZWZlcmVuY2U8S2V5VHlwZSwgUmVmZXJlbmNlVHlwZT4oX2luOiBNYXA8S2V5VHlwZSwgUmVmZXJlbmNlPFJlZmVyZW5jZVR5cGU+PiwgX2tleTogS2V5VHlwZSwgX2RlbGV0b3I6IEZ1bmN0aW9uKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGxldCByZWZlcmVuY2U6IFJlZmVyZW5jZTxSZWZlcmVuY2VUeXBlPjtcclxuICAgICAgICAgICAgcmVmZXJlbmNlID0gX2luLmdldChfa2V5KTtcclxuICAgICAgICAgICAgaWYgKHJlZmVyZW5jZS5kZWNyZWFzZUNvdW50ZXIoKSA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBUaGUgZm9sbG93aW5nIGRlbGV0aW9ucyBtYXkgYmUgYW4gb3B0aW1pemF0aW9uLCBub3QgbmVjZXNzYXJ5IHRvIHN0YXJ0IHdpdGggYW5kIG1heWJlIGNvdW50ZXJwcm9kdWN0aXZlLlxyXG4gICAgICAgICAgICAgICAgLy8gSWYgZGF0YSBzaG91bGQgYmUgdXNlZCBsYXRlciBhZ2FpbiwgaXQgbXVzdCB0aGVuIGJlIHJlY29uc3RydWN0ZWQuLi5cclxuICAgICAgICAgICAgICAgIF9kZWxldG9yKHJlZmVyZW5jZS5nZXRSZWZlcmVuY2UoKSk7XHJcbiAgICAgICAgICAgICAgICBfaW4uZGVsZXRlKF9rZXkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBJbmNyZWFzZXMgdGhlIGNvdW50ZXIgb2YgdGhlIHJlZmVyZW5jZSB0byBhIHByb2dyYW0sIHBhcmFtZXRlciBvciBidWZmZXIuIENyZWF0ZXMgdGhlIHJlZmVyZW5jZSwgaWYgaXQncyBub3QgZXhpc3RlbnQuXHJcbiAgICAgICAgICogQHBhcmFtIF9pbiBcclxuICAgICAgICAgKiBAcGFyYW0gX2tleSBcclxuICAgICAgICAgKiBAcGFyYW0gX2NyZWF0b3IgXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgY3JlYXRlUmVmZXJlbmNlPEtleVR5cGUsIFJlZmVyZW5jZVR5cGU+KF9pbjogTWFwPEtleVR5cGUsIFJlZmVyZW5jZTxSZWZlcmVuY2VUeXBlPj4sIF9rZXk6IEtleVR5cGUsIF9jcmVhdG9yOiBGdW5jdGlvbik6IHZvaWQge1xyXG4gICAgICAgICAgICBsZXQgcmVmZXJlbmNlOiBSZWZlcmVuY2U8UmVmZXJlbmNlVHlwZT47XHJcbiAgICAgICAgICAgIHJlZmVyZW5jZSA9IF9pbi5nZXQoX2tleSk7XHJcbiAgICAgICAgICAgIGlmIChyZWZlcmVuY2UpXHJcbiAgICAgICAgICAgICAgICByZWZlcmVuY2UuaW5jcmVhc2VDb3VudGVyKCk7XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNvbnRlbnQ6IFJlZmVyZW5jZVR5cGUgPSBfY3JlYXRvcihfa2V5KTtcclxuICAgICAgICAgICAgICAgIHJlZmVyZW5jZSA9IG5ldyBSZWZlcmVuY2U8UmVmZXJlbmNlVHlwZT4oY29udGVudCk7XHJcbiAgICAgICAgICAgICAgICByZWZlcmVuY2UuaW5jcmVhc2VDb3VudGVyKCk7XHJcbiAgICAgICAgICAgICAgICBfaW4uc2V0KF9rZXksIHJlZmVyZW5jZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gI2VuZHJlZ2lvblxyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL0NvYXQvQ29hdC50c1wiLz5cclxubmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIFN0YXRpYyBzdXBlcmNsYXNzIGZvciB0aGUgcmVwcmVzZW50YXRpb24gb2YgV2ViR2wgc2hhZGVycHJvZ3JhbXMuIFxyXG4gICAgICogQGF1dGhvcnMgSmFzY2hhIEthcmFnw7ZsLCBIRlUsIDIwMTkgfCBKaXJrYSBEZWxsJ09yby1GcmllZGwsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcblxyXG4gICAgIC8vIFRPRE86IGRlZmluZSBhdHRyaWJ1dGUvdW5pZm9ybXMgYXMgbGF5b3V0IGFuZCB1c2UgdGhvc2UgY29uc2lzdGVudGx5IGluIHNoYWRlcnNcclxuICAgICBcclxuICAgIGV4cG9ydCBjbGFzcyBTaGFkZXIge1xyXG4gICAgICAgIC8qKiBUaGUgdHlwZSBvZiBjb2F0IHRoYXQgY2FuIGJlIHVzZWQgd2l0aCB0aGlzIHNoYWRlciB0byBjcmVhdGUgYSBtYXRlcmlhbCAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0Q29hdCgpOiB0eXBlb2YgQ29hdCB7IHJldHVybiBudWxsOyB9XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXRWZXJ0ZXhTaGFkZXJTb3VyY2UoKTogc3RyaW5nIHsgcmV0dXJuIG51bGw7IH1cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGdldEZyYWdtZW50U2hhZGVyU291cmNlKCk6IHN0cmluZyB7IHJldHVybiBudWxsOyB9XHJcbiAgICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogU2luZ2xlIGNvbG9yIHNoYWRpbmdcclxuICAgICAqIEBhdXRob3JzIEphc2NoYSBLYXJhZ8O2bCwgSEZVLCAyMDE5IHwgSmlya2EgRGVsbCdPcm8tRnJpZWRsLCBIRlUsIDIwMTlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIFNoYWRlckZsYXQgZXh0ZW5kcyBTaGFkZXIge1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0Q29hdCgpOiB0eXBlb2YgQ29hdCB7XHJcbiAgICAgICAgICAgIHJldHVybiBDb2F0Q29sb3JlZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0VmVydGV4U2hhZGVyU291cmNlKCk6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIHJldHVybiBgI3ZlcnNpb24gMzAwIGVzXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHN0cnVjdCBMaWdodEFtYmllbnQge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2ZWM0IGNvbG9yO1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgc3RydWN0IExpZ2h0RGlyZWN0aW9uYWwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2ZWM0IGNvbG9yO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2ZWMzIGRpcmVjdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB1aW50IE1BWF9MSUdIVFNfRElSRUNUSU9OQUwgPSAxMHU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGluIHZlYzMgYV9wb3NpdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICBpbiB2ZWMzIGFfbm9ybWFsO1xyXG4gICAgICAgICAgICAgICAgICAgIHVuaWZvcm0gbWF0NCB1X3dvcmxkO1xyXG4gICAgICAgICAgICAgICAgICAgIHVuaWZvcm0gbWF0NCB1X3Byb2plY3Rpb247XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHVuaWZvcm0gTGlnaHRBbWJpZW50IHVfYW1iaWVudDtcclxuICAgICAgICAgICAgICAgICAgICB1bmlmb3JtIHVpbnQgdV9uTGlnaHRzRGlyZWN0aW9uYWw7XHJcbiAgICAgICAgICAgICAgICAgICAgdW5pZm9ybSBMaWdodERpcmVjdGlvbmFsIHVfZGlyZWN0aW9uYWxbTUFYX0xJR0hUU19ESVJFQ1RJT05BTF07XHJcbiAgICAgICAgICAgICAgICAgICAgZmxhdCBvdXQgdmVjNCB2X2NvbG9yO1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIHZvaWQgbWFpbigpIHsgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ2xfUG9zaXRpb24gPSB1X3Byb2plY3Rpb24gKiB2ZWM0KGFfcG9zaXRpb24sIDEuMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlYzMgbm9ybWFsID0gbWF0Myh1X3dvcmxkKSAqIGFfbm9ybWFsO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdl9jb2xvciA9IHZlYzQoMCwwLDAsMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodWludCBpID0gMHU7IGkgPCB1X25MaWdodHNEaXJlY3Rpb25hbDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmbG9hdCBpbGx1bWluYXRpb24gPSAtZG90KG5vcm1hbCwgdV9kaXJlY3Rpb25hbFtpXS5kaXJlY3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdl9jb2xvciArPSBpbGx1bWluYXRpb24gKiB1X2RpcmVjdGlvbmFsW2ldLmNvbG9yOyAvLyB2ZWM0KDEsMSwxLDEpOyAvLyBcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1X2FtYmllbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVfZGlyZWN0aW9uYWxbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgfWA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0RnJhZ21lbnRTaGFkZXJTb3VyY2UoKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgcmV0dXJuIGAjdmVyc2lvbiAzMDAgZXNcclxuICAgICAgICAgICAgICAgICAgICBwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZmxhdCBpbiB2ZWM0IHZfY29sb3I7XHJcbiAgICAgICAgICAgICAgICAgICAgb3V0IHZlYzQgZnJhZztcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICB2b2lkIG1haW4oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyYWcgPSB2X2NvbG9yO1xyXG4gICAgICAgICAgICAgICAgICAgIH1gO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIlxyXG5uYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogTWF0Y2FwIChNYXRlcmlhbCBDYXB0dXJlKSBzaGFkaW5nLiBUaGUgdGV4dHVyZSBwcm92aWRlZCBieSB0aGUgY29hdCBpcyB1c2VkIGFzIGEgbWF0Y2FwIG1hdGVyaWFsLiBcclxuICAgICAqIEltcGxlbWVudGF0aW9uIGJhc2VkIG9uIGh0dHBzOi8vd3d3LmNsaWNrdG9yZWxlYXNlLmNvbS9ibG9nL2NyZWF0aW5nLXNwaGVyaWNhbC1lbnZpcm9ubWVudC1tYXBwaW5nLXNoYWRlci9cclxuICAgICAqIEBhdXRob3JzIFNpbW9uIFN0b3JsLVNjaHVsa2UsIEhGVSwgMjAxOSB8IEppcmthIERlbGwnT3JvLUZyaWVkbCwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBTaGFkZXJNYXRDYXAgZXh0ZW5kcyBTaGFkZXIge1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0Q29hdCgpOiB0eXBlb2YgQ29hdCB7XHJcbiAgICAgICAgICAgIHJldHVybiBDb2F0TWF0Q2FwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXRWZXJ0ZXhTaGFkZXJTb3VyY2UoKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgcmV0dXJuIGAjdmVyc2lvbiAzMDAgZXNcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaW4gdmVjMyBhX3Bvc2l0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgIGluIHZlYzMgYV9ub3JtYWw7XHJcbiAgICAgICAgICAgICAgICAgICAgdW5pZm9ybSBtYXQ0IHVfcHJvamVjdGlvbjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgb3V0IHZlYzIgdGV4X2Nvb3Jkc19zbW9vdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgZmxhdCBvdXQgdmVjMiB0ZXhfY29vcmRzX2ZsYXQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZvaWQgbWFpbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWF0NCBub3JtYWxNYXRyaXggPSB0cmFuc3Bvc2UoaW52ZXJzZSh1X3Byb2plY3Rpb24pKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmVjNCBwID0gdmVjNChhX3Bvc2l0aW9uLCAxLjApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2ZWM0IG5vcm1hbDQgPSB2ZWM0KGFfbm9ybWFsLCAxLjApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2ZWMzIGUgPSBub3JtYWxpemUoIHZlYzMoIHVfcHJvamVjdGlvbiAqIHAgKSApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2ZWMzIG4gPSBub3JtYWxpemUoIHZlYzMobm9ybWFsTWF0cml4ICogbm9ybWFsNCkgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlYzMgciA9IHJlZmxlY3QoIGUsIG4gKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmxvYXQgbSA9IDIuICogc3FydChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvdyggci54LCAyLiApICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvdyggci55LCAyLiApICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvdyggci56ICsgMS4sIDIuIClcclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleF9jb29yZHNfc21vb3RoID0gci54eSAvIG0gKyAuNTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4X2Nvb3Jkc19mbGF0ID0gci54eSAvIG0gKyAuNTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsX1Bvc2l0aW9uID0gdV9wcm9qZWN0aW9uICogdmVjNChhX3Bvc2l0aW9uLCAxLjApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1gO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGdldEZyYWdtZW50U2hhZGVyU291cmNlKCk6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIHJldHVybiBgI3ZlcnNpb24gMzAwIGVzXHJcbiAgICAgICAgICAgICAgICAgICAgcHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgdW5pZm9ybSB2ZWM0IHVfdGludF9jb2xvcjtcclxuICAgICAgICAgICAgICAgICAgICB1bmlmb3JtIGZsb2F0IHVfZmxhdG1peDtcclxuICAgICAgICAgICAgICAgICAgICB1bmlmb3JtIHNhbXBsZXIyRCB1X3RleHR1cmU7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgaW4gdmVjMiB0ZXhfY29vcmRzX3Ntb290aDtcclxuICAgICAgICAgICAgICAgICAgICBmbGF0IGluIHZlYzIgdGV4X2Nvb3Jkc19mbGF0O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBvdXQgdmVjNCBmcmFnO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2b2lkIG1haW4oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlYzIgdGMgPSBtaXgodGV4X2Nvb3Jkc19zbW9vdGgsIHRleF9jb29yZHNfZmxhdCwgdV9mbGF0bWl4KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZnJhZyA9IHVfdGludF9jb2xvciAqIHRleHR1cmUodV90ZXh0dXJlLCB0YykgKiAyLjA7XHJcbiAgICAgICAgICAgICAgICAgICAgfWA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIFJlbmRlcnMgZm9yIFJheWNhc3RpbmdcclxuICAgICAqIEBhdXRob3JzIEppcmthIERlbGwnT3JvLUZyaWVkbCwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBTaGFkZXJSYXlDYXN0IGV4dGVuZHMgU2hhZGVyIHtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIGdldFZlcnRleFNoYWRlclNvdXJjZSgpOiBzdHJpbmcge1xyXG4gICAgICAgICAgICByZXR1cm4gYCN2ZXJzaW9uIDMwMCBlc1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpbiB2ZWMzIGFfcG9zaXRpb247XHJcbiAgICAgICAgICAgICAgICAgICAgdW5pZm9ybSBtYXQ0IHVfcHJvamVjdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICB2b2lkIG1haW4oKSB7ICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsX1Bvc2l0aW9uID0gdV9wcm9qZWN0aW9uICogdmVjNChhX3Bvc2l0aW9uLCAxLjApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1gO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGdldEZyYWdtZW50U2hhZGVyU291cmNlKCk6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIHJldHVybiBgI3ZlcnNpb24gMzAwIGVzXHJcbiAgICAgICAgICAgICAgICAgICAgcHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJlY2lzaW9uIGhpZ2hwIGludDtcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICB1bmlmb3JtIGludCB1X2lkO1xyXG4gICAgICAgICAgICAgICAgICAgIG91dCB2ZWM0IGZyYWc7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgdm9pZCBtYWluKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgIGZsb2F0IGlkID0gZmxvYXQodV9pZCkvIDI1Ni4wO1xyXG4gICAgICAgICAgICAgICAgICAgICAgIGZsb2F0IHVwcGVyYnl0ZSA9IHRydW5jKGdsX0ZyYWdDb29yZC56ICogMjU2LjApIC8gMjU2LjA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgZmxvYXQgbG93ZXJieXRlID0gZnJhY3QoZ2xfRnJhZ0Nvb3JkLnogKiAyNTYuMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgZnJhZyA9IHZlYzQoaWQsIGlkLCB1cHBlcmJ5dGUgLCBsb3dlcmJ5dGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1gO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBUZXh0dXJlZCBzaGFkaW5nXHJcbiAgICAgKiBAYXV0aG9ycyBKYXNjaGEgS2FyYWfDtmwsIEhGVSwgMjAxOSB8IEppcmthIERlbGwnT3JvLUZyaWVkbCwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBTaGFkZXJUZXh0dXJlIGV4dGVuZHMgU2hhZGVyIHtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIGdldENvYXQoKTogdHlwZW9mIENvYXQge1xyXG4gICAgICAgICAgICByZXR1cm4gQ29hdFRleHR1cmVkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXRWZXJ0ZXhTaGFkZXJTb3VyY2UoKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgcmV0dXJuIGAjdmVyc2lvbiAzMDAgZXNcclxuXHJcbiAgICAgICAgICAgICAgICBpbiB2ZWMzIGFfcG9zaXRpb247XHJcbiAgICAgICAgICAgICAgICBpbiB2ZWMyIGFfdGV4dHVyZVVWcztcclxuICAgICAgICAgICAgICAgIHVuaWZvcm0gbWF0NCB1X3Byb2plY3Rpb247XHJcbiAgICAgICAgICAgICAgICB1bmlmb3JtIHZlYzQgdV9jb2xvcjtcclxuICAgICAgICAgICAgICAgIG91dCB2ZWMyIHZfdGV4dHVyZVVWcztcclxuXHJcbiAgICAgICAgICAgICAgICB2b2lkIG1haW4oKSB7ICBcclxuICAgICAgICAgICAgICAgICAgICBnbF9Qb3NpdGlvbiA9IHVfcHJvamVjdGlvbiAqIHZlYzQoYV9wb3NpdGlvbiwgMS4wKTtcclxuICAgICAgICAgICAgICAgICAgICB2X3RleHR1cmVVVnMgPSBhX3RleHR1cmVVVnM7XHJcbiAgICAgICAgICAgICAgICB9YDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXRGcmFnbWVudFNoYWRlclNvdXJjZSgpOiBzdHJpbmcge1xyXG4gICAgICAgICAgICByZXR1cm4gYCN2ZXJzaW9uIDMwMCBlc1xyXG4gICAgICAgICAgICAgICAgcHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGluIHZlYzIgdl90ZXh0dXJlVVZzO1xyXG4gICAgICAgICAgICAgICAgdW5pZm9ybSBzYW1wbGVyMkQgdV90ZXh0dXJlO1xyXG4gICAgICAgICAgICAgICAgb3V0IHZlYzQgZnJhZztcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdm9pZCBtYWluKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZyYWcgPSB0ZXh0dXJlKHVfdGV4dHVyZSwgdl90ZXh0dXJlVVZzKTtcclxuICAgICAgICAgICAgfWA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIFNpbmdsZSBjb2xvciBzaGFkaW5nXHJcbiAgICAgKiBAYXV0aG9ycyBKYXNjaGEgS2FyYWfDtmwsIEhGVSwgMjAxOSB8IEppcmthIERlbGwnT3JvLUZyaWVkbCwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBTaGFkZXJVbmlDb2xvciBleHRlbmRzIFNoYWRlciB7XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXRDb2F0KCk6IHR5cGVvZiBDb2F0IHtcclxuICAgICAgICAgICAgcmV0dXJuIENvYXRDb2xvcmVkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXRWZXJ0ZXhTaGFkZXJTb3VyY2UoKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgcmV0dXJuIGAjdmVyc2lvbiAzMDAgZXNcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaW4gdmVjMyBhX3Bvc2l0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgIHVuaWZvcm0gbWF0NCB1X3Byb2plY3Rpb247XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgdm9pZCBtYWluKCkgeyAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBnbF9Qb3NpdGlvbiA9IHVfcHJvamVjdGlvbiAqIHZlYzQoYV9wb3NpdGlvbiwgMS4wKTtcclxuICAgICAgICAgICAgICAgICAgICB9YDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXRGcmFnbWVudFNoYWRlclNvdXJjZSgpOiBzdHJpbmcge1xyXG4gICAgICAgICAgICByZXR1cm4gYCN2ZXJzaW9uIDMwMCBlc1xyXG4gICAgICAgICAgICAgICAgICAgIHByZWNpc2lvbiBtZWRpdW1wIGZsb2F0O1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIHVuaWZvcm0gdmVjNCB1X2NvbG9yO1xyXG4gICAgICAgICAgICAgICAgICAgIG91dCB2ZWM0IGZyYWc7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgdm9pZCBtYWluKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgIGZyYWcgPSB1X2NvbG9yO1xyXG4gICAgICAgICAgICAgICAgICAgIH1gO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBCYXNlY2xhc3MgZm9yIGRpZmZlcmVudCBraW5kcyBvZiB0ZXh0dXJlcy4gXHJcbiAgICAgKiBAYXV0aG9ycyBKaXJrYSBEZWxsJ09yby1GcmllZGwsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgYWJzdHJhY3QgY2xhc3MgVGV4dHVyZSBleHRlbmRzIE11dGFibGUge1xyXG4gICAgICAgIHByb3RlY3RlZCByZWR1Y2VNdXRhdG9yKCk6IHZvaWQgey8qKi8gfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGV4dHVyZSBjcmVhdGVkIGZyb20gYW4gZXhpc3RpbmcgaW1hZ2VcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIFRleHR1cmVJbWFnZSBleHRlbmRzIFRleHR1cmUge1xyXG4gICAgICAgIHB1YmxpYyBpbWFnZTogSFRNTEltYWdlRWxlbWVudCA9IG51bGw7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFRleHR1cmUgY3JlYXRlZCBmcm9tIGEgY2FudmFzXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBUZXh0dXJlQ2FudmFzIGV4dGVuZHMgVGV4dHVyZSB7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFRleHR1cmUgY3JlYXRlZCBmcm9tIGEgRlVER0UtU2tldGNoXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBUZXh0dXJlU2tldGNoIGV4dGVuZHMgVGV4dHVyZUNhbnZhcyB7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFRleHR1cmUgY3JlYXRlZCBmcm9tIGFuIEhUTUwtcGFnZVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgVGV4dHVyZUhUTUwgZXh0ZW5kcyBUZXh0dXJlQ2FudmFzIHtcclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgZW51bSBUSU1FUl9UWVBFIHtcclxuICAgICAgICBJTlRFUlZBTCxcclxuICAgICAgICBUSU1FT1VUXHJcbiAgICB9XHJcblxyXG4gICAgaW50ZXJmYWNlIFRpbWVycyB7XHJcbiAgICAgICAgW2lkOiBudW1iZXJdOiBUaW1lcjtcclxuICAgIH1cclxuXHJcbiAgICBjbGFzcyBUaW1lciB7XHJcbiAgICAgICAgYWN0aXZlOiBib29sZWFuO1xyXG4gICAgICAgIHR5cGU6IFRJTUVSX1RZUEU7XHJcbiAgICAgICAgY2FsbGJhY2s6IEZ1bmN0aW9uO1xyXG4gICAgICAgIHRpbWVvdXQ6IG51bWJlcjtcclxuICAgICAgICBhcmd1bWVudHM6IE9iamVjdFtdO1xyXG4gICAgICAgIHN0YXJ0VGltZVJlYWw6IG51bWJlcjtcclxuICAgICAgICB0aW1lb3V0UmVhbDogbnVtYmVyO1xyXG4gICAgICAgIGlkOiBudW1iZXI7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKF90aW1lOiBUaW1lLCBfdHlwZTogVElNRVJfVFlQRSwgX2NhbGxiYWNrOiBGdW5jdGlvbiwgX3RpbWVvdXQ6IG51bWJlciwgX2FyZ3VtZW50czogT2JqZWN0W10pIHtcclxuICAgICAgICAgICAgdGhpcy50eXBlID0gX3R5cGU7XHJcbiAgICAgICAgICAgIHRoaXMudGltZW91dCA9IF90aW1lb3V0O1xyXG4gICAgICAgICAgICB0aGlzLmFyZ3VtZW50cyA9IF9hcmd1bWVudHM7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhcnRUaW1lUmVhbCA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrID0gX2NhbGxiYWNrO1xyXG5cclxuICAgICAgICAgICAgbGV0IHNjYWxlOiBudW1iZXIgPSBNYXRoLmFicyhfdGltZS5nZXRTY2FsZSgpKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghc2NhbGUpIHtcclxuICAgICAgICAgICAgICAgIC8vIFRpbWUgaXMgc3RvcHBlZCwgdGltZXIgd29uJ3QgYmUgYWN0aXZlXHJcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgaWQ6IG51bWJlcjtcclxuICAgICAgICAgICAgdGhpcy50aW1lb3V0UmVhbCA9IHRoaXMudGltZW91dCAvIHNjYWxlO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMudHlwZSA9PSBUSU1FUl9UWVBFLlRJTUVPVVQpIHtcclxuICAgICAgICAgICAgICAgIGxldCBjYWxsYmFjazogRnVuY3Rpb24gPSAoKTogdm9pZCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgX3RpbWUuZGVsZXRlVGltZXJCeUludGVybmFsSWQodGhpcy5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgX2NhbGxiYWNrKF9hcmd1bWVudHMpO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGlkID0gd2luZG93LnNldFRpbWVvdXQoY2FsbGJhY2ssIHRoaXMudGltZW91dFJlYWwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIGlkID0gd2luZG93LnNldEludGVydmFsKF9jYWxsYmFjaywgdGhpcy50aW1lb3V0UmVhbCwgX2FyZ3VtZW50cyk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmlkID0gaWQ7XHJcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBjbGVhcigpOiB2b2lkIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMudHlwZSA9PSBUSU1FUl9UWVBFLlRJTUVPVVQpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmFjdGl2ZSlcclxuICAgICAgICAgICAgICAgICAgICAvLyBzYXZlIHJlbWFpbmluZyB0aW1lIHRvIHRpbWVvdXQgYXMgbmV3IHRpbWVvdXQgZm9yIHJlc3RhcnRcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRpbWVvdXQgPSB0aGlzLnRpbWVvdXQgKiAoMSAtIChwZXJmb3JtYW5jZS5ub3coKSAtIHRoaXMuc3RhcnRUaW1lUmVhbCkgLyB0aGlzLnRpbWVvdXRSZWFsKTtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGhpcy5pZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogcmV1c2luZyB0aW1lciBzdGFydHMgaW50ZXJ2YWwgYW5ldy4gU2hvdWxkIGJlIHJlbWFpbmluZyBpbnRlcnZhbCBhcyB0aW1lb3V0LCB0aGVuIHN0YXJ0aW5nIGludGVydmFsIGFuZXcgXHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aGlzLmlkKTtcclxuICAgICAgICAgICAgdGhpcy5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnN0YW5jZXMgb2YgdGhpcyBjbGFzcyBnZW5lcmF0ZSBhIHRpbWVzdGFtcCB0aGF0IGNvcnJlbGF0ZXMgd2l0aCB0aGUgdGltZSBlbGFwc2VkIHNpbmNlIHRoZSBzdGFydCBvZiB0aGUgcHJvZ3JhbSBidXQgYWxsb3dzIGZvciByZXNldHRpbmcgYW5kIHNjYWxpbmcuICBcclxuICAgICAqIFN1cHBvcnRzIGludGVydmFsLSBhbmQgdGltZW91dC1jYWxsYmFja3MgaWRlbnRpY2FsIHdpdGggc3RhbmRhcmQgSmF2YXNjcmlwdCBidXQgd2l0aCByZXNwZWN0IHRvIHRoZSBzY2FsZWQgdGltZVxyXG4gICAgICogQGF1dGhvcnMgSmlya2EgRGVsbCdPcm8tRnJpZWRsLCBIRlUsIDIwMTlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIFRpbWUgZXh0ZW5kcyBFdmVudFRhcmdldCB7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgZ2FtZVRpbWU6IFRpbWUgPSBuZXcgVGltZSgpO1xyXG4gICAgICAgIHByaXZhdGUgc3RhcnQ6IG51bWJlcjtcclxuICAgICAgICBwcml2YXRlIHNjYWxlOiBudW1iZXI7XHJcbiAgICAgICAgcHJpdmF0ZSBvZmZzZXQ6IG51bWJlcjtcclxuICAgICAgICBwcml2YXRlIGxhc3RDYWxsVG9FbGFwc2VkOiBudW1iZXI7XHJcbiAgICAgICAgcHJpdmF0ZSB0aW1lcnM6IFRpbWVycyA9IHt9O1xyXG4gICAgICAgIHByaXZhdGUgaWRUaW1lck5leHQ6IG51bWJlciA9IDA7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgICAgICB0aGlzLnN0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2NhbGUgPSAxLjA7XHJcbiAgICAgICAgICAgIHRoaXMub2Zmc2V0ID0gMC4wO1xyXG4gICAgICAgICAgICB0aGlzLmxhc3RDYWxsVG9FbGFwc2VkID0gMC4wO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgZ2FtZS10aW1lLW9iamVjdCB3aGljaCBzdGFydHMgYXV0b21hdGljYWxseSBhbmQgc2VydmVzIGFzIGJhc2UgZm9yIHZhcmlvdXMgaW50ZXJuYWwgb3BlcmF0aW9ucy4gXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXQgZ2FtZSgpOiBUaW1lIHtcclxuICAgICAgICAgICAgcmV0dXJuIFRpbWUuZ2FtZVRpbWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXRyaWV2ZXMgdGhlIGN1cnJlbnQgc2NhbGVkIHRpbWVzdGFtcCBvZiB0aGlzIGluc3RhbmNlIGluIG1pbGxpc2Vjb25kc1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBnZXQoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMub2Zmc2V0ICsgdGhpcy5zY2FsZSAqIChwZXJmb3JtYW5jZS5ub3coKSAtIHRoaXMuc3RhcnQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogKFJlLSkgU2V0cyB0aGUgdGltZXN0YW1wIG9mIHRoaXMgaW5zdGFuY2VcclxuICAgICAgICAgKiBAcGFyYW0gX3RpbWUgVGhlIHRpbWVzdGFtcCB0byByZXByZXNlbnQgdGhlIGN1cnJlbnQgdGltZSAoZGVmYXVsdCAwLjApXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHNldChfdGltZTogbnVtYmVyID0gMCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLm9mZnNldCA9IF90aW1lO1xyXG4gICAgICAgICAgICB0aGlzLnN0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0RWxhcHNlZFNpbmNlUHJldmlvdXNDYWxsKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTZXRzIHRoZSBzY2FsaW5nIG9mIHRoaXMgdGltZSwgYWxsb3dpbmcgZm9yIHNsb3dtb3Rpb24gKDwxKSBvciBmYXN0Zm9yd2FyZCAoPjEpIFxyXG4gICAgICAgICAqIEBwYXJhbSBfc2NhbGUgVGhlIGRlc2lyZWQgc2NhbGluZyAoZGVmYXVsdCAxLjApXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHNldFNjYWxlKF9zY2FsZTogbnVtYmVyID0gMS4wKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0KHRoaXMuZ2V0KCkpO1xyXG4gICAgICAgICAgICB0aGlzLnNjYWxlID0gX3NjYWxlO1xyXG4gICAgICAgICAgICAvL1RPRE86IGNhdGNoIHNjYWxlPTBcclxuICAgICAgICAgICAgdGhpcy5yZXNjYWxlQWxsVGltZXJzKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0RWxhcHNlZFNpbmNlUHJldmlvdXNDYWxsKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoRVZFTlQuVElNRV9TQ0FMRUQpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHJpZXZlcyB0aGUgY3VycmVudCBzY2FsaW5nIG9mIHRoaXMgdGltZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBnZXRTY2FsZSgpOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zY2FsZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHJpZXZlcyB0aGUgb2Zmc2V0IG9mIHRoaXMgdGltZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBnZXRPZmZzZXQoKTogbnVtYmVyIHtcclxuICAgICAgICAgIHJldHVybiB0aGlzLm9mZnNldDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHJpZXZlcyB0aGUgc2NhbGVkIHRpbWUgaW4gbWlsbGlzZWNvbmRzIHBhc3NlZCBzaW5jZSB0aGUgbGFzdCBjYWxsIHRvIHRoaXMgbWV0aG9kXHJcbiAgICAgICAgICogQXV0b21hdGljYWxseSByZXNldCBhdCBldmVyeSBjYWxsIHRvIHNldCguLi4pIGFuZCBzZXRTY2FsZSguLi4pXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGdldEVsYXBzZWRTaW5jZVByZXZpb3VzQ2FsbCgpOiBudW1iZXIge1xyXG4gICAgICAgICAgICBsZXQgY3VycmVudDogbnVtYmVyID0gdGhpcy5nZXQoKTtcclxuICAgICAgICAgICAgbGV0IGVsYXBzZWQ6IG51bWJlciA9IGN1cnJlbnQgLSB0aGlzLmxhc3RDYWxsVG9FbGFwc2VkO1xyXG4gICAgICAgICAgICB0aGlzLmxhc3RDYWxsVG9FbGFwc2VkID0gY3VycmVudDtcclxuICAgICAgICAgICAgcmV0dXJuIGVsYXBzZWQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyNyZWdpb24gVGltZXJzXHJcbiAgICAgICAgLy8gVE9ETzogZXhhbWluZSBpZiB3ZWItd29ya2VycyB3b3VsZCBlbmhhbmNlIHBlcmZvcm1hbmNlIGhlcmUhXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2VlIEphdmFzY3JpcHQgZG9jdW1lbnRhdGlvbi4gQ3JlYXRlcyBhbiBpbnRlcm5hbCBbW1RpbWVyXV0gb2JqZWN0XHJcbiAgICAgICAgICogQHBhcmFtIF9jYWxsYmFja1xyXG4gICAgICAgICAqIEBwYXJhbSBfdGltZW91dCBcclxuICAgICAgICAgKiBAcGFyYW0gX2FyZ3VtZW50cyBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc2V0VGltZW91dChfY2FsbGJhY2s6IEZ1bmN0aW9uLCBfdGltZW91dDogbnVtYmVyLCAuLi5fYXJndW1lbnRzOiBPYmplY3RbXSk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFRpbWVyKFRJTUVSX1RZUEUuVElNRU9VVCwgX2NhbGxiYWNrLCBfdGltZW91dCwgX2FyZ3VtZW50cyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNlZSBKYXZhc2NyaXB0IGRvY3VtZW50YXRpb24uIENyZWF0ZXMgYW4gaW50ZXJuYWwgW1tUaW1lcl1dIG9iamVjdFxyXG4gICAgICAgICAqIEBwYXJhbSBfY2FsbGJhY2sgXHJcbiAgICAgICAgICogQHBhcmFtIF90aW1lb3V0IFxyXG4gICAgICAgICAqIEBwYXJhbSBfYXJndW1lbnRzIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzZXRJbnRlcnZhbChfY2FsbGJhY2s6IEZ1bmN0aW9uLCBfdGltZW91dDogbnVtYmVyLCAuLi5fYXJndW1lbnRzOiBPYmplY3RbXSk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFRpbWVyKFRJTUVSX1RZUEUuSU5URVJWQUwsIF9jYWxsYmFjaywgX3RpbWVvdXQsIF9hcmd1bWVudHMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTZWUgSmF2YXNjcmlwdCBkb2N1bWVudGF0aW9uXHJcbiAgICAgICAgICogQHBhcmFtIF9pZCBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgY2xlYXJUaW1lb3V0KF9pZDogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVsZXRlVGltZXIoX2lkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2VlIEphdmFzY3JpcHQgZG9jdW1lbnRhdGlvblxyXG4gICAgICAgICAqIEBwYXJhbSBfaWQgXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGNsZWFySW50ZXJ2YWwoX2lkOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5kZWxldGVUaW1lcihfaWQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU3RvcHMgYW5kIGRlbGV0ZXMgYWxsIFtbVGltZXJdXXMgYXR0YWNoZWQuIFNob3VsZCBiZSBjYWxsZWQgYmVmb3JlIHRoaXMgVGltZS1vYmplY3QgbGVhdmVzIHNjb3BlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGNsZWFyQWxsVGltZXJzKCk6IHZvaWQge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpZCBpbiB0aGlzLnRpbWVycykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWxldGVUaW1lcihOdW1iZXIoaWQpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVjcmVhdGVzIFtbVGltZXJdXXMgd2hlbiBzY2FsaW5nIGNoYW5nZXNcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgcmVzY2FsZUFsbFRpbWVycygpOiB2b2lkIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaWQgaW4gdGhpcy50aW1lcnMpIHtcclxuICAgICAgICAgICAgICAgIGxldCB0aW1lcjogVGltZXIgPSB0aGlzLnRpbWVyc1tpZF07XHJcbiAgICAgICAgICAgICAgICB0aW1lci5jbGVhcigpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLnNjYWxlKVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRpbWUgaGFzIHN0b3BwZWQsIG5vIG5lZWQgdG8gcmVwbGFjZSBjbGVhcmVkIHRpbWVyc1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCB0aW1lb3V0OiBudW1iZXIgPSB0aW1lci50aW1lb3V0O1xyXG4gICAgICAgICAgICAgICAgLy8gaWYgKHRpbWVyLnR5cGUgPT0gVElNRVJfVFlQRS5USU1FT1VUICYmIHRpbWVyLmFjdGl2ZSlcclxuICAgICAgICAgICAgICAgIC8vICAgICAvLyBmb3IgYW4gYWN0aXZlIHRpbWVvdXQtdGltZXIsIGNhbGN1bGF0ZSB0aGUgcmVtYWluaW5nIHRpbWUgdG8gdGltZW91dFxyXG4gICAgICAgICAgICAgICAgLy8gICAgIHRpbWVvdXQgPSAocGVyZm9ybWFuY2Uubm93KCkgLSB0aW1lci5zdGFydFRpbWVSZWFsKSAvIHRpbWVyLnRpbWVvdXRSZWFsO1xyXG4gICAgICAgICAgICAgICAgbGV0IHJlcGxhY2U6IFRpbWVyID0gbmV3IFRpbWVyKHRoaXMsIHRpbWVyLnR5cGUsIHRpbWVyLmNhbGxiYWNrLCB0aW1lb3V0LCB0aW1lci5hcmd1bWVudHMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy50aW1lcnNbaWRdID0gcmVwbGFjZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGVsZXRlcyBbW1RpbWVyXV0gZm91bmQgdXNpbmcgdGhlIGlkIG9mIHRoZSBjb25uZWN0ZWQgaW50ZXJ2YWwvdGltZW91dC1vYmplY3RcclxuICAgICAgICAgKiBAcGFyYW0gX2lkIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBkZWxldGVUaW1lckJ5SW50ZXJuYWxJZChfaWQ6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpZCBpbiB0aGlzLnRpbWVycykge1xyXG4gICAgICAgICAgICAgICAgbGV0IHRpbWVyOiBUaW1lciA9IHRoaXMudGltZXJzW2lkXTtcclxuICAgICAgICAgICAgICAgIGlmICh0aW1lci5pZCA9PSBfaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aW1lci5jbGVhcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnRpbWVyc1tpZF07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc2V0VGltZXIoX3R5cGU6IFRJTUVSX1RZUEUsIF9jYWxsYmFjazogRnVuY3Rpb24sIF90aW1lb3V0OiBudW1iZXIsIF9hcmd1bWVudHM6IE9iamVjdFtdKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgbGV0IHRpbWVyOiBUaW1lciA9IG5ldyBUaW1lcih0aGlzLCBfdHlwZSwgX2NhbGxiYWNrLCBfdGltZW91dCwgX2FyZ3VtZW50cyk7XHJcbiAgICAgICAgICAgIHRoaXMudGltZXJzWysrdGhpcy5pZFRpbWVyTmV4dF0gPSB0aW1lcjtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaWRUaW1lck5leHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGRlbGV0ZVRpbWVyKF9pZDogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMudGltZXJzW19pZF0uY2xlYXIoKTtcclxuICAgICAgICAgICAgZGVsZXRlIHRoaXMudGltZXJzW19pZF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vI2VuZHJlZ2lvblxyXG4gICAgfVxyXG59IiwiLy8vPHJlZmVyZW5jZSBwYXRoPVwiLi4vRXZlbnQvRXZlbnQudHNcIi8+XHJcbi8vLzxyZWZlcmVuY2UgcGF0aD1cIi4uL1RpbWUvVGltZS50c1wiLz5cclxubmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICBleHBvcnQgZW51bSBMT09QX01PREUge1xyXG4gICAgICAgIC8qKiBMb29wIGN5Y2xlcyBjb250cm9sbGVkIGJ5IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgKi9cclxuICAgICAgICBGUkFNRV9SRVFVRVNUID0gXCJmcmFtZVJlcXVlc3RcIixcclxuICAgICAgICAvKiogTG9vcCBjeWNsZXMgd2l0aCB0aGUgZ2l2ZW4gZnJhbWVyYXRlIGluIFtbVGltZV1dLmdhbWUgKi9cclxuICAgICAgICBUSU1FX0dBTUUgPSBcInRpbWVHYW1lXCIsXHJcbiAgICAgICAgLyoqIExvb3AgY3ljbGVzIHdpdGggdGhlIGdpdmVuIGZyYW1lcmF0ZSBpbiByZWFsdGltZSwgaW5kZXBlbmRlbnQgb2YgW1tUaW1lXV0uZ2FtZSAqL1xyXG4gICAgICAgIFRJTUVfUkVBTCA9IFwidGltZVJlYWxcIlxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBDb3JlIGxvb3Agb2YgYSBGdWRnZSBhcHBsaWNhdGlvbi4gSW5pdGlhbGl6ZXMgYXV0b21hdGljYWxseSBhbmQgbXVzdCBiZSBzdGFydGVkIGV4cGxpY2l0bHkuXHJcbiAgICAgKiBJdCB0aGVuIGZpcmVzIFtbRVZFTlRdXS5MT09QXFxfRlJBTUUgdG8gYWxsIGFkZGVkIGxpc3RlbmVycyBhdCBlYWNoIGZyYW1lXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBMb29wIGV4dGVuZHMgRXZlbnRUYXJnZXRTdGF0aWMge1xyXG4gICAgICAgIC8qKiBUaGUgZ2FtZXRpbWUgdGhlIGxvb3Agd2FzIHN0YXJ0ZWQsIG92ZXJ3cml0dGVuIGF0IGVhY2ggc3RhcnQgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHRpbWVTdGFydEdhbWU6IG51bWJlciA9IDA7XHJcbiAgICAgICAgLyoqIFRoZSByZWFsdGltZSB0aGUgbG9vcCB3YXMgc3RhcnRlZCwgb3ZlcndyaXR0ZW4gYXQgZWFjaCBzdGFydCAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdGltZVN0YXJ0UmVhbDogbnVtYmVyID0gMDtcclxuICAgICAgICAvKiogVGhlIGdhbWV0aW1lIGVsYXBzZWQgc2luY2UgdGhlIGxhc3QgbG9vcCBjeWNsZSAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdGltZUZyYW1lR2FtZTogbnVtYmVyID0gMDtcclxuICAgICAgICAvKiogVGhlIHJlYWx0aW1lIGVsYXBzZWQgc2luY2UgdGhlIGxhc3QgbG9vcCBjeWNsZSAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdGltZUZyYW1lUmVhbDogbnVtYmVyID0gMDtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdGltZUxhc3RGcmFtZUdhbWU6IG51bWJlciA9IDA7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdGltZUxhc3RGcmFtZVJlYWw6IG51bWJlciA9IDA7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdGltZUxhc3RGcmFtZUdhbWVBdmc6IG51bWJlciA9IDA7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdGltZUxhc3RGcmFtZVJlYWxBdmc6IG51bWJlciA9IDA7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgcnVubmluZzogYm9vbGVhbiA9IGZhbHNlO1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIG1vZGU6IExPT1BfTU9ERSA9IExPT1BfTU9ERS5GUkFNRV9SRVFVRVNUO1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGlkSW50ZXJ2YWxsOiBudW1iZXIgPSAwO1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGlkUmVxdWVzdDogbnVtYmVyID0gMDtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBmcHNEZXNpcmVkOiBudW1iZXIgPSAzMDtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBmcmFtZXNUb0F2ZXJhZ2U6IG51bWJlciA9IDMwO1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHN5bmNXaXRoQW5pbWF0aW9uRnJhbWU6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU3RhcnRzIHRoZSBsb29wIHdpdGggdGhlIGdpdmVuIG1vZGUgYW5kIGZwc1xyXG4gICAgICAgICAqIEBwYXJhbSBfbW9kZSBcclxuICAgICAgICAgKiBAcGFyYW0gX2ZwcyBJcyBvbmx5IGFwcGxpY2FibGUgaW4gVElNRS1tb2Rlc1xyXG4gICAgICAgICAqIEBwYXJhbSBfc3luY1dpdGhBbmltYXRpb25GcmFtZSBFeHBlcmltZW50YWwgYW5kIG9ubHkgYXBwbGljYWJsZSBpbiBUSU1FLW1vZGVzLiBTaG91bGQgZGVmZXIgdGhlIGxvb3AtY3ljbGUgdW50aWwgdGhlIG5leHQgcG9zc2libGUgYW5pbWF0aW9uIGZyYW1lLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgc3RhcnQoX21vZGU6IExPT1BfTU9ERSA9IExPT1BfTU9ERS5GUkFNRV9SRVFVRVNULCBfZnBzOiBudW1iZXIgPSA2MCwgX3N5bmNXaXRoQW5pbWF0aW9uRnJhbWU6IGJvb2xlYW4gPSBmYWxzZSk6IHZvaWQge1xyXG4gICAgICAgICAgICBMb29wLnN0b3AoKTtcclxuXHJcbiAgICAgICAgICAgIExvb3AudGltZVN0YXJ0R2FtZSA9IFRpbWUuZ2FtZS5nZXQoKTtcclxuICAgICAgICAgICAgTG9vcC50aW1lU3RhcnRSZWFsID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICAgICAgICAgIExvb3AudGltZUxhc3RGcmFtZUdhbWUgPSBMb29wLnRpbWVTdGFydEdhbWU7XHJcbiAgICAgICAgICAgIExvb3AudGltZUxhc3RGcmFtZVJlYWwgPSBMb29wLnRpbWVTdGFydFJlYWw7XHJcbiAgICAgICAgICAgIExvb3AuZnBzRGVzaXJlZCA9IChfbW9kZSA9PSBMT09QX01PREUuRlJBTUVfUkVRVUVTVCkgPyA2MCA6IF9mcHM7XHJcbiAgICAgICAgICAgIExvb3AuZnJhbWVzVG9BdmVyYWdlID0gTG9vcC5mcHNEZXNpcmVkO1xyXG4gICAgICAgICAgICBMb29wLnRpbWVMYXN0RnJhbWVHYW1lQXZnID0gTG9vcC50aW1lTGFzdEZyYW1lUmVhbEF2ZyA9IDEwMDAgLyBMb29wLmZwc0Rlc2lyZWQ7XHJcbiAgICAgICAgICAgIExvb3AubW9kZSA9IF9tb2RlO1xyXG4gICAgICAgICAgICBMb29wLnN5bmNXaXRoQW5pbWF0aW9uRnJhbWUgPSBfc3luY1dpdGhBbmltYXRpb25GcmFtZTtcclxuXHJcbiAgICAgICAgICAgIGxldCBsb2c6IHN0cmluZyA9IGBMb29wIHN0YXJ0aW5nIGluIG1vZGUgJHtMb29wLm1vZGV9YDtcclxuICAgICAgICAgICAgaWYgKExvb3AubW9kZSAhPSBMT09QX01PREUuRlJBTUVfUkVRVUVTVClcclxuICAgICAgICAgICAgICAgIGxvZyArPSBgIHdpdGggYXR0ZW1wdGVkICR7X2Zwc30gZnBzYDtcclxuICAgICAgICAgICAgRGVidWcubG9nKGxvZyk7XHJcblxyXG4gICAgICAgICAgICBzd2l0Y2ggKF9tb2RlKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIExPT1BfTU9ERS5GUkFNRV9SRVFVRVNUOlxyXG4gICAgICAgICAgICAgICAgICAgIExvb3AubG9vcEZyYW1lKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIExPT1BfTU9ERS5USU1FX1JFQUw6XHJcbiAgICAgICAgICAgICAgICAgICAgTG9vcC5pZEludGVydmFsbCA9IHdpbmRvdy5zZXRJbnRlcnZhbChMb29wLmxvb3BUaW1lLCAxMDAwIC8gTG9vcC5mcHNEZXNpcmVkKTtcclxuICAgICAgICAgICAgICAgICAgICBMb29wLmxvb3BUaW1lKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIExPT1BfTU9ERS5USU1FX0dBTUU6XHJcbiAgICAgICAgICAgICAgICAgICAgTG9vcC5pZEludGVydmFsbCA9IFRpbWUuZ2FtZS5zZXRJbnRlcnZhbChMb29wLmxvb3BUaW1lLCAxMDAwIC8gTG9vcC5mcHNEZXNpcmVkKTtcclxuICAgICAgICAgICAgICAgICAgICBMb29wLmxvb3BUaW1lKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBMb29wLnJ1bm5pbmcgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU3RvcHMgdGhlIGxvb3BcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHN0b3AoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGlmICghTG9vcC5ydW5uaW5nKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgc3dpdGNoIChMb29wLm1vZGUpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgTE9PUF9NT0RFLkZSQU1FX1JFUVVFU1Q6XHJcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKExvb3AuaWRSZXF1ZXN0KTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgTE9PUF9NT0RFLlRJTUVfUkVBTDpcclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChMb29wLmlkSW50ZXJ2YWxsKTtcclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoTG9vcC5pZFJlcXVlc3QpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBMT09QX01PREUuVElNRV9HQU1FOlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IERBTkdFUiEgaWQgY2hhbmdlcyBpbnRlcm5hbGx5IGluIGdhbWUgd2hlbiB0aW1lIGlzIHNjYWxlZCFcclxuICAgICAgICAgICAgICAgICAgICBUaW1lLmdhbWUuY2xlYXJJbnRlcnZhbChMb29wLmlkSW50ZXJ2YWxsKTtcclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoTG9vcC5pZFJlcXVlc3QpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgRGVidWcubG9nKFwiTG9vcCBzdG9wcGVkIVwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0RnBzR2FtZUF2ZXJhZ2UoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIDEwMDAgLyBMb29wLnRpbWVMYXN0RnJhbWVHYW1lQXZnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGdldEZwc1JlYWxBdmVyYWdlKCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiAxMDAwIC8gTG9vcC50aW1lTGFzdEZyYW1lUmVhbEF2ZztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGxvb3AoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGxldCB0aW1lOiBudW1iZXI7XHJcbiAgICAgICAgICAgIHRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuICAgICAgICAgICAgTG9vcC50aW1lRnJhbWVSZWFsID0gdGltZSAtIExvb3AudGltZUxhc3RGcmFtZVJlYWw7XHJcbiAgICAgICAgICAgIExvb3AudGltZUxhc3RGcmFtZVJlYWwgPSB0aW1lO1xyXG5cclxuICAgICAgICAgICAgdGltZSA9IFRpbWUuZ2FtZS5nZXQoKTtcclxuICAgICAgICAgICAgTG9vcC50aW1lRnJhbWVHYW1lID0gdGltZSAtIExvb3AudGltZUxhc3RGcmFtZUdhbWU7XHJcbiAgICAgICAgICAgIExvb3AudGltZUxhc3RGcmFtZUdhbWUgPSB0aW1lO1xyXG5cclxuICAgICAgICAgICAgTG9vcC50aW1lTGFzdEZyYW1lR2FtZUF2ZyA9ICgoTG9vcC5mcmFtZXNUb0F2ZXJhZ2UgLSAxKSAqIExvb3AudGltZUxhc3RGcmFtZUdhbWVBdmcgKyBMb29wLnRpbWVGcmFtZUdhbWUpIC8gTG9vcC5mcmFtZXNUb0F2ZXJhZ2U7XHJcbiAgICAgICAgICAgIExvb3AudGltZUxhc3RGcmFtZVJlYWxBdmcgPSAoKExvb3AuZnJhbWVzVG9BdmVyYWdlIC0gMSkgKiBMb29wLnRpbWVMYXN0RnJhbWVSZWFsQXZnICsgTG9vcC50aW1lRnJhbWVSZWFsKSAvIExvb3AuZnJhbWVzVG9BdmVyYWdlO1xyXG5cclxuICAgICAgICAgICAgbGV0IGV2ZW50OiBFdmVudCA9IG5ldyBFdmVudChFVkVOVC5MT09QX0ZSQU1FKTtcclxuICAgICAgICAgICAgTG9vcC50YXJnZXRTdGF0aWMuZGlzcGF0Y2hFdmVudChldmVudCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBsb29wRnJhbWUoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIExvb3AubG9vcCgpO1xyXG4gICAgICAgICAgICBMb29wLmlkUmVxdWVzdCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoTG9vcC5sb29wRnJhbWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgbG9vcFRpbWUoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGlmIChMb29wLnN5bmNXaXRoQW5pbWF0aW9uRnJhbWUpXHJcbiAgICAgICAgICAgICAgICBMb29wLmlkUmVxdWVzdCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoTG9vcC5sb29wKTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgTG9vcC5sb29wKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgZXhwb3J0IGludGVyZmFjZSBNYXBGaWxlbmFtZVRvQ29udGVudCB7XHJcbiAgICAgICAgW2ZpbGVuYW1lOiBzdHJpbmddOiBzdHJpbmc7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEhhbmRsZXMgZmlsZSB0cmFuc2ZlciBmcm9tIGEgRnVkZ2UtQnJvd3NlcmFwcCB0byB0aGUgbG9jYWwgZmlsZXN5c3RlbSB3aXRob3V0IGEgbG9jYWwgc2VydmVyLiAgXHJcbiAgICAgKiBTYXZlcyB0byB0aGUgZG93bmxvYWQtcGF0aCBnaXZlbiBieSB0aGUgYnJvd3NlciwgbG9hZHMgZnJvbSB0aGUgcGxheWVyJ3MgY2hvaWNlLlxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgRmlsZUlvQnJvd3NlckxvY2FsIGV4dGVuZHMgRXZlbnRUYXJnZXRTdGF0aWMge1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHNlbGVjdG9yOiBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgICAgIC8vIFRPRE86IHJlZmFjdG9yIHRvIGFzeW5jIGZ1bmN0aW9uIHRvIGJlIGhhbmRsZWQgdXNpbmcgcHJvbWlzZSwgaW5zdGVhZCBvZiB1c2luZyBldmVudCB0YXJnZXRcclxuICAgICAgICBwdWJsaWMgc3RhdGljIGxvYWQoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIEZpbGVJb0Jyb3dzZXJMb2NhbC5zZWxlY3RvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTtcclxuICAgICAgICAgICAgRmlsZUlvQnJvd3NlckxvY2FsLnNlbGVjdG9yLnR5cGUgPSBcImZpbGVcIjtcclxuICAgICAgICAgICAgRmlsZUlvQnJvd3NlckxvY2FsLnNlbGVjdG9yLm11bHRpcGxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgRmlsZUlvQnJvd3NlckxvY2FsLnNlbGVjdG9yLmhpZGRlbiA9IHRydWU7XHJcbiAgICAgICAgICAgIEZpbGVJb0Jyb3dzZXJMb2NhbC5zZWxlY3Rvci5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIEZpbGVJb0Jyb3dzZXJMb2NhbC5oYW5kbGVGaWxlU2VsZWN0KTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChGaWxlSW9Ccm93c2VyTG9jYWwuc2VsZWN0b3IpO1xyXG4gICAgICAgICAgICBGaWxlSW9Ccm93c2VyTG9jYWwuc2VsZWN0b3IuY2xpY2soKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFRPRE86IHJlZmFjdG9yIHRvIGFzeW5jIGZ1bmN0aW9uIHRvIGJlIGhhbmRsZWQgdXNpbmcgcHJvbWlzZSwgaW5zdGVhZCBvZiB1c2luZyBldmVudCB0YXJnZXRcclxuICAgICAgICBwdWJsaWMgc3RhdGljIHNhdmUoX3RvU2F2ZTogTWFwRmlsZW5hbWVUb0NvbnRlbnQpOiB2b2lkIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgZmlsZW5hbWUgaW4gX3RvU2F2ZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNvbnRlbnQ6IHN0cmluZyA9IF90b1NhdmVbZmlsZW5hbWVdO1xyXG4gICAgICAgICAgICAgICAgbGV0IGJsb2I6IEJsb2IgPSBuZXcgQmxvYihbY29udGVudF0sIHsgdHlwZTogXCJ0ZXh0L3BsYWluXCIgfSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgdXJsOiBzdHJpbmcgPSB3aW5kb3cuVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcclxuICAgICAgICAgICAgICAgIC8vKi8gdXNpbmcgYW5jaG9yIGVsZW1lbnQgZm9yIGRvd25sb2FkXHJcbiAgICAgICAgICAgICAgICBsZXQgZG93bmxvYWRlcjogSFRNTEFuY2hvckVsZW1lbnQ7XHJcbiAgICAgICAgICAgICAgICBkb3dubG9hZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XHJcbiAgICAgICAgICAgICAgICBkb3dubG9hZGVyLnNldEF0dHJpYnV0ZShcImhyZWZcIiwgdXJsKTtcclxuICAgICAgICAgICAgICAgIGRvd25sb2FkZXIuc2V0QXR0cmlidXRlKFwiZG93bmxvYWRcIiwgZmlsZW5hbWUpO1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkb3dubG9hZGVyKTtcclxuICAgICAgICAgICAgICAgIGRvd25sb2FkZXIuY2xpY2soKTtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoZG93bmxvYWRlcik7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuVVJMLnJldm9rZU9iamVjdFVSTCh1cmwpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgZXZlbnQ6IEN1c3RvbUV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KEVWRU5ULkZJTEVfU0FWRUQsIHsgZGV0YWlsOiB7IG1hcEZpbGVuYW1lVG9Db250ZW50OiBfdG9TYXZlIH0gfSk7XHJcbiAgICAgICAgICAgIEZpbGVJb0Jyb3dzZXJMb2NhbC50YXJnZXRTdGF0aWMuZGlzcGF0Y2hFdmVudChldmVudCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGFzeW5jIGhhbmRsZUZpbGVTZWxlY3QoX2V2ZW50OiBFdmVudCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGhhbmRsZUZpbGVTZWxlY3RcIik7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoRmlsZUlvQnJvd3NlckxvY2FsLnNlbGVjdG9yKTtcclxuICAgICAgICAgICAgbGV0IGZpbGVMaXN0OiBGaWxlTGlzdCA9ICg8SFRNTElucHV0RWxlbWVudD5fZXZlbnQudGFyZ2V0KS5maWxlcztcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZmlsZUxpc3QsIGZpbGVMaXN0Lmxlbmd0aCk7XHJcbiAgICAgICAgICAgIGlmIChmaWxlTGlzdC5sZW5ndGggPT0gMClcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIGxldCBsb2FkZWQ6IE1hcEZpbGVuYW1lVG9Db250ZW50ID0ge307XHJcbiAgICAgICAgICAgIGF3YWl0IEZpbGVJb0Jyb3dzZXJMb2NhbC5sb2FkRmlsZXMoZmlsZUxpc3QsIGxvYWRlZCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgZXZlbnQ6IEN1c3RvbUV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KEVWRU5ULkZJTEVfTE9BREVELCB7IGRldGFpbDogeyBtYXBGaWxlbmFtZVRvQ29udGVudDogbG9hZGVkIH0gfSk7XHJcbiAgICAgICAgICAgIEZpbGVJb0Jyb3dzZXJMb2NhbC50YXJnZXRTdGF0aWMuZGlzcGF0Y2hFdmVudChldmVudCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGFzeW5jIGxvYWRGaWxlcyhfZmlsZUxpc3Q6IEZpbGVMaXN0LCBfbG9hZGVkOiBNYXBGaWxlbmFtZVRvQ29udGVudCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBmaWxlIG9mIF9maWxlTGlzdCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY29udGVudDogc3RyaW5nID0gYXdhaXQgbmV3IFJlc3BvbnNlKGZpbGUpLnRleHQoKTtcclxuICAgICAgICAgICAgICAgIF9sb2FkZWRbZmlsZS5uYW1lXSA9IGNvbnRlbnQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iXX0=