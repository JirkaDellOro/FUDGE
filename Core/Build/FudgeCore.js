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
        static initialize(_antialias = false, _alpha = false) {
            let contextAttributes = { alpha: _alpha, antialias: _antialias };
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
         * TODO: this method appears to be obsolete...?
         */
        static createRenderLights(_lights) {
            let renderLights = {};
            for (let entry of _lights) {
                // TODO: simplyfy, since direction is now handled by ComponentLight
                switch (entry[0]) {
                    case FudgeCore.LightAmbient.name:
                        let ambient = [];
                        for (let cmpLight of entry[1]) {
                            let c = cmpLight.light.color;
                            ambient.push(c.r, c.g, c.b, c.a);
                        }
                        renderLights["u_ambient"] = new Float32Array(ambient);
                        break;
                    case FudgeCore.LightDirectional.name:
                        let directional = [];
                        for (let cmpLight of entry[1]) {
                            let c = cmpLight.light.color;
                            // let d: Vector3 = (<LightDirectional>light.getLight()).direction;
                            directional.push(c.r, c.g, c.b, c.a, 0, 0, 1);
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
                        RenderOperator.crc3.uniform4fv(ambient, cmpLight.light.color.getArray());
                }
            }
            let nDirectional = uni["u_nLightsDirectional"];
            if (nDirectional) {
                let cmpLights = _lights.get("LightDirectional");
                if (cmpLights) {
                    let n = cmpLights.length;
                    RenderOperator.crc3.uniform1ui(nDirectional, n);
                    for (let i = 0; i < n; i++) {
                        let cmpLight = cmpLights[i];
                        RenderOperator.crc3.uniform4fv(uni[`u_directional[${i}].color`], cmpLight.light.color.getArray());
                        let direction = FudgeCore.Vector3.Z();
                        direction.transform(cmpLight.pivot);
                        direction.transform(cmpLight.getContainer().mtxWorld);
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
        constructor(_color = new FudgeCore.Color(1, 1, 1, 1)) {
            super(_color);
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
    // export enum LIGHT_TYPE {
    //     AMBIENT = "ambient",
    //     DIRECTIONAL = "directional",
    //     POINT = "point",
    //     SPOT = "spot"
    // }
    class ComponentLight extends FudgeCore.Component {
        constructor(_light = new FudgeCore.LightAmbient()) {
            super();
            // private static constructors: { [type: string]: General } = { [LIGHT_TYPE.AMBIENT]: LightAmbient, [LIGHT_TYPE.DIRECTIONAL]: LightDirectional, [LIGHT_TYPE.POINT]: LightPoint, [LIGHT_TYPE.SPOT]: LightSpot };
            this.pivot = FudgeCore.Matrix4x4.IDENTITY;
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
        static get YELLOW() {
            return new Color(1, 1, 0, 1);
        }
        static get CYAN() {
            return new Color(0, 1, 1, 1);
        }
        static get MAGENTA() {
            return new Color(1, 0, 1, 1);
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
            this.setCoat(coat);
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
                    let type = cmpLight.light.type;
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
                            if (illumination > 0.0f)
                                v_color += illumination * u_directional[i].color; // vec4(1,1,1,1); // 
                        }
                        //u_ambient;
                        //u_directional[0];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRnVkZ2VDb3JlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vU291cmNlL1RyYW5zZmVyL1NlcmlhbGl6ZXIudHMiLCIuLi9Tb3VyY2UvVHJhbnNmZXIvTXV0YWJsZS50cyIsIi4uL1NvdXJjZS9BbmltYXRpb24vQW5pbWF0aW9uLnRzIiwiLi4vU291cmNlL0FuaW1hdGlvbi9BbmltYXRpb25GdW5jdGlvbi50cyIsIi4uL1NvdXJjZS9BbmltYXRpb24vQW5pbWF0aW9uS2V5LnRzIiwiLi4vU291cmNlL0FuaW1hdGlvbi9BbmltYXRpb25TZXF1ZW5jZS50cyIsIi4uL1NvdXJjZS9BdWRpby9BdWRpby50cyIsIi4uL1NvdXJjZS9BdWRpby9BdWRpb0ZpbHRlci50cyIsIi4uL1NvdXJjZS9BdWRpby9BdWRpb0xpc3RlbmVyLnRzIiwiLi4vU291cmNlL0F1ZGlvL0F1ZGlvTG9jYWxpc2F0aW9uLnRzIiwiLi4vU291cmNlL0F1ZGlvL0F1ZGlvU2Vzc2lvbkRhdGEudHMiLCIuLi9Tb3VyY2UvQXVkaW8vQXVkaW9TZXR0aW5ncy50cyIsIi4uL1NvdXJjZS9SZW5kZXIvUmVuZGVySW5qZWN0b3IudHMiLCIuLi9Tb3VyY2UvUmVuZGVyL1JlbmRlck9wZXJhdG9yLnRzIiwiLi4vU291cmNlL0NvYXQvQ29hdC50cyIsIi4uL1NvdXJjZS9Db21wb25lbnQvQ29tcG9uZW50LnRzIiwiLi4vU291cmNlL0NvbXBvbmVudC9Db21wb25lbnRBbmltYXRvci50cyIsIi4uL1NvdXJjZS9Db21wb25lbnQvQ29tcG9uZW50QXVkaW8udHMiLCIuLi9Tb3VyY2UvQ29tcG9uZW50L0NvbXBvbmVudEF1ZGlvTGlzdGVuZXIudHMiLCIuLi9Tb3VyY2UvQ29tcG9uZW50L0NvbXBvbmVudENhbWVyYS50cyIsIi4uL1NvdXJjZS9MaWdodC9MaWdodC50cyIsIi4uL1NvdXJjZS9Db21wb25lbnQvQ29tcG9uZW50TGlnaHQudHMiLCIuLi9Tb3VyY2UvQ29tcG9uZW50L0NvbXBvbmVudE1hdGVyaWFsLnRzIiwiLi4vU291cmNlL0NvbXBvbmVudC9Db21wb25lbnRNZXNoLnRzIiwiLi4vU291cmNlL0NvbXBvbmVudC9Db21wb25lbnRTY3JpcHQudHMiLCIuLi9Tb3VyY2UvQ29tcG9uZW50L0NvbXBvbmVudFRyYW5zZm9ybS50cyIsIi4uL1NvdXJjZS9EZWJ1Zy9EZWJ1Z0ludGVyZmFjZXMudHMiLCIuLi9Tb3VyY2UvRGVidWcvRGVidWdUYXJnZXQudHMiLCIuLi9Tb3VyY2UvRGVidWcvRGVidWdBbGVydC50cyIsIi4uL1NvdXJjZS9EZWJ1Zy9EZWJ1Z0NvbnNvbGUudHMiLCIuLi9Tb3VyY2UvRGVidWcvRGVidWcudHMiLCIuLi9Tb3VyY2UvRGVidWcvRGVidWdEaWFsb2cudHMiLCIuLi9Tb3VyY2UvRGVidWcvRGVidWdUZXh0QXJlYS50cyIsIi4uL1NvdXJjZS9FbmdpbmUvQ29sb3IudHMiLCIuLi9Tb3VyY2UvRW5naW5lL01hdGVyaWFsLnRzIiwiLi4vU291cmNlL0VuZ2luZS9SZWN5Y2xlci50cyIsIi4uL1NvdXJjZS9FbmdpbmUvUmVzb3VyY2VNYW5hZ2VyLnRzIiwiLi4vU291cmNlL0VuZ2luZS9WaWV3cG9ydC50cyIsIi4uL1NvdXJjZS9FdmVudC9FdmVudC50cyIsIi4uL1NvdXJjZS9FdmVudC9FdmVudEtleWJvYXJkLnRzIiwiLi4vU291cmNlL01hdGgvRnJhbWluZy50cyIsIi4uL1NvdXJjZS9NYXRoL01hdHJpeDN4My50cyIsIi4uL1NvdXJjZS9NYXRoL01hdHJpeDR4NC50cyIsIi4uL1NvdXJjZS9NYXRoL1JlY3RhbmdsZS50cyIsIi4uL1NvdXJjZS9NYXRoL1ZlY3RvcjIudHMiLCIuLi9Tb3VyY2UvTWF0aC9WZWN0b3IzLnRzIiwiLi4vU291cmNlL01lc2gvTWVzaC50cyIsIi4uL1NvdXJjZS9NZXNoL01lc2hDdWJlLnRzIiwiLi4vU291cmNlL01lc2gvTWVzaFB5cmFtaWQudHMiLCIuLi9Tb3VyY2UvTWVzaC9NZXNoUXVhZC50cyIsIi4uL1NvdXJjZS9Ob2RlL05vZGUudHMiLCIuLi9Tb3VyY2UvTm9kZS9Ob2RlUmVzb3VyY2UudHMiLCIuLi9Tb3VyY2UvTm9kZS9Ob2RlUmVzb3VyY2VJbnN0YW5jZS50cyIsIi4uL1NvdXJjZS9SYXkvUmF5LnRzIiwiLi4vU291cmNlL1JheS9SYXlIaXQudHMiLCIuLi9Tb3VyY2UvUmVuZGVyL1JlbmRlck1hbmFnZXIudHMiLCIuLi9Tb3VyY2UvU2hhZGVyL1NoYWRlci50cyIsIi4uL1NvdXJjZS9TaGFkZXIvU2hhZGVyRmxhdC50cyIsIi4uL1NvdXJjZS9TaGFkZXIvU2hhZGVyTWF0Q2FwLnRzIiwiLi4vU291cmNlL1NoYWRlci9TaGFkZXJSYXlDYXN0LnRzIiwiLi4vU291cmNlL1NoYWRlci9TaGFkZXJUZXh0dXJlLnRzIiwiLi4vU291cmNlL1NoYWRlci9TaGFkZXJVbmlDb2xvci50cyIsIi4uL1NvdXJjZS9UZXh0dXJlL1RleHR1cmUudHMiLCIuLi9Tb3VyY2UvVGltZS9UaW1lLnRzIiwiLi4vU291cmNlL1RpbWUvTG9vcC50cyIsIi4uL1NvdXJjZS9UcmFuc2Zlci9GaWxlSW9Ccm93c2VyTG9jYWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBLElBQVUsU0FBUyxDQXVMbEI7QUF2TEQsV0FBVSxTQUFTO0lBZ0JmOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0EyQkc7SUFDSCxNQUFzQixVQUFVO1FBSTVCOzs7V0FHRztRQUNJLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxVQUFrQjtZQUM5QyxLQUFLLElBQUksSUFBSSxJQUFJLFVBQVUsQ0FBQyxVQUFVO2dCQUNsQyxJQUFJLFVBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksVUFBVTtvQkFDekMsT0FBTztZQUVmLElBQUksSUFBSSxHQUFXLFVBQVUsQ0FBQyxlQUFlLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ2xFLElBQUksQ0FBQyxJQUFJO2dCQUNMLEtBQUssSUFBSSxVQUFVLElBQUksVUFBVSxDQUFDLFVBQVUsRUFBRTtvQkFD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RUQ7Ozs7V0FJRztRQUNILFNBQVM7WUFDUCxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtnQkFDZixJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDdEMsT0FBTzthQUNSO1lBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUU7Z0JBQ3ZDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7Z0JBQzFCLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDN0IsT0FBTzthQUNSO1lBRUQsSUFBSSxFQUFFLEdBQVcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7WUFFcEQsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztZQUMxQixJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDO1lBRTdCLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDL0gsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxL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TSxLQUFLLE1BQU07WUFDcEIsT0FBTyxJQUFJLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNqQyxDQUFDO1FBQ00sTUFBTSxLQUFLLElBQUk7WUFDbEIsT0FBTyxJQUFJLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNqQyxDQUFDO1FBQ00sTUFBTSxLQUFLLE9BQU87WUFDckIsT0FBTyxJQUFJLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNqQyxDQUFDO1FBRU0sV0FBVyxDQUFDLEVBQVUsRUFBRSxFQUFVLEVBQUUsRUFBVSxFQUFFLEVBQVU7WUFDN0QsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN0QyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdEMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzFDLENBQUM7UUFFTSxZQUFZLENBQUMsRUFBVSxFQUFFLEVBQVUsRUFBRSxFQUFVLEVBQUUsRUFBVTtZQUM5RCxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsR0FBRyxHQUFHLEVBQUUsRUFBRSxHQUFHLEdBQUcsRUFBRSxF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R0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDckMsSUFBSSxHQUFHLEdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLElBQUksR0FBRyxHQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNyQyxJQUFJLEdBQUcsR0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDckMsSUFBSSxHQUFHLEdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLElBQUksR0FBRyxHQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNyQyxJQUFJLEdBQUcsR0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDckMsSUFBSSxHQUFHLEdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLElBQUksR0FBRyxHQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNyQyxJQUFJLEdBQUcsR0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDckMsSUFBSSxHQUFHLEdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLElBQUksR0FBRyxHQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNy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QUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FDYjtnQkFDRSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztnQkFDN0MsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7Z0JBQzdDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO2dCQUM3QyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztnQkFDN0MsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7Z0JBQzdDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO2dCQUM3QyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztnQkFDN0MsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7Z0JBQzdDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO2dCQUM3QyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztnQkFDN0MsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7Z0JBQzdDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO2dCQUM3QyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRztnQkFDN0MsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUc7Z0JBQzdDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHO2dCQUM3QyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRzthQUM5QyxDQUFDLENBQUM7WUFDTCxPQUFPLE1BQU0sQ0FBQztRQUNoQixDQUFDO1FBRUQ7OztXQUdHO1FBQ0ksTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFrQjtZQUN4QyxJQUFJLENBQUMsR0FBaUIsT0FBTyxDQUFDLElBQUksQ0FBQztZQUNuQyxJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLElBQUksR0FBVyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzdCLElBQUksSUFBSSxHQUFXLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDN0IsSUFBSSxJQUFJLEdBQVcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM3QixJQUFJLElBQUksR0FBVyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzdCLElBQUksSUFBSSxHQUFXLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDN0IsSUFBSSxJQUFJLEdBQVcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM3QixJQUFJLElBQUksR0FBVyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzdCLElBQUksSUFBSSxHQUFXLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDN0IsSUFBSSxJQUFJLEdBQVcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM3QixJQUFJLElBQUksR0FBVyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzdCLElBQUksS0FBSyxHQUFXLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDOUIsSUFBSSxLQUFLLEdBQVcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM5QixJQUFJLEtBQUssR0FBVyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzlCLElBQUksS0FBSyxHQUFXLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDOUIsSUFBSSxLQUFLLEdBQVcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM5QixJQUFJLEtBQUssR0FBVyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzlCLElBQUksS0FBSyxHQUFXLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDOUIsSUFBSSxLQUFLLEdBQVcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM5QixJQUFJLEtBQUssR0FBVyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzlCLElBQUksS0FBSyxHQUFXLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDOUIsSUFBSSxLQUFLLEdBQVcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM5QixJQUFJLEtBQUssR0FBVyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzlCLElBQUksS0FBSyxHQUFXLEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDOUIsSUFBSSxLQUFLLEdBQVcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUU5QixJQUFJLEVBQUUsR0FBVyxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDO2dCQUNyRCxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFFekMsSUFBSSxFQUFFLEdBQVcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsQ0FBQztnQkFDckQsQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQ3pDLElBQUksRUFBRSxHQUFXLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUM7Z0JBQ3RELENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQztZQUMxQyxJQUFJLEVBQUUsR0FBVyxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDO2dCQUN0RCxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFFMUMsSUFBSSxDQUFDLEdBQVcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBRWxFLHlDQUF5QztZQUN6QyxNQUFNLE1BQU0sR0FBYyxVQUFBLFFBQVEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDbEQsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7Z0JBQ2QsQ0FBQyxHQUFHLEVBQUU7Z0JBQ04sQ0FBQyxHQUFHLEVBQUU7Z0JBQ04sQ0FBQyxHQUFHLEVBQUU7Z0JBQ04sQ0FBQyxHQUFHLEVBQUU7Z0JBQ04sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDckYsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDckYsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDdkYsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDdkYsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDM0YsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDM0YsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDM0YsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDM0YsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDM0YsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDM0YsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDM0YsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFFLE9BQU87YUFDckcsQ0FBQyxDQUFDO1lBQ0gsT0FBTyxNQUFNLENBQUM7UUFDaEIsQ0FBQztRQUVEOzs7O1dBSUc7UUFDSSxNQUFNLENBQUMsT0FBTyxDQUFDLGtCQUEyQixFQUFFLGVBQXdCLEVBQUUsTUFBZSxVQUFBLE9BQU8sQ0FBQyxDQUFDLEVBQUU7WUFDckcsMkNBQTJDO1lBQzNDLE1BQU0sTUFBTSxHQUFjLFVBQUEsUUFBUSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNsRCxJQUFJLEtBQUssR0FBWSxVQUFBLE9BQU8sQ0FBQyxVQUFVLENBQUMsa0JBQWtCLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFDN0UsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ2xCLElBQUksS0FBSyxHQUFZLFVBQUEsT0FBTyxDQUFDLGFBQWEsQ0FBQyxVQUFBLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDdEUsSUFBSSxLQUFLLEdBQVksVUFBQSxPQUFPLENBQUMsYUFBYSxDQUFDLFVBQUEsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUN4RSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FDYjtnQkFDRSxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUM1QixLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUM1QixLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUM1QixrQkFBa0IsQ0FBQyxDQUFDO2dCQUNwQixrQkFBa0IsQ0FBQyxDQUFDO2dCQUNwQixrQkFBa0IsQ0FBQyxDQUFDO2dCQUNwQixDQUFDO2FBQ0YsQ0FBQyxDQUFDO1lBQ0wsT0FBTyxNQUFNLENBQUM7UUFDaEIsQ0FBQztRQUVEOztXQUVHO1FBQ0ksTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFtQjtZQUMzQyx5Q0FBeUM7WUFDekMsTUFBTSxNQUFNLEdBQWMsVUFBQSxRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2xELE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO2dCQUNkLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1YsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDVixDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNWLFVBQVUsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUM7YUFDNUMsQ0FBQyxDQUFDO1lBQ0gsT0FBTyxNQUFNLENBQUM7UUFDaEIsQ0FBQztRQUVEOzs7V0FHRztRQUNJLE1BQU0sQ0FBQyxVQUFVLENBQUMsZUFBdUI7WUFDOUMsMkNBQTJDO1lBQzNDLE1BQU0sTUFBTSxHQUFjLFVBQUEsUUFBUSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNsRCxJQUFJLGNBQWMsR0FBVyxlQUFlLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUM7WUFDN0QsSUFBSSxHQUFHLEdBQVcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUMzQyxJQUFJLEdBQUcsR0FBVyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQzNDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO2dCQUNkLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1YsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztnQkFDZCxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7Z0JBQ2YsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQzthQUNYLENBQUMsQ0FBQztZQUNILE9BQU8sTUFBTSxDQUFDO1FBQ2hCLENBQUM7UUFFRDs7O1dBR0c7UUFDSSxNQUFNLENBQUMsVUFBVSxDQUFDLGVBQXVCO1lBQzlDLDJDQUEyQztZQUMzQyxJQUFJLE1BQU0sR0FBYyxVQUFBLFFBQVEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDaEQsSUFBSSxjQUFjLEdBQVcsZUFBZSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDO1lBQzdELElBQUksR0FBRyxHQUFXLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDM0MsSUFBSSxHQUFHLEdBQVcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUMzQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztnQkFDZCxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ2YsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDVixHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO2dCQUNkLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7YUFDWCxDQUFDLENBQUM7WUFDSCxPQUFPLE1BQU0sQ0FBQztRQUNoQixDQUFDO1FBRUQ7OztXQUdHO1FBQ0ksTUFBTSxDQUFDLFVBQVUsQ0FBQyxlQUF1QjtZQUM5QywyQ0FBMkM7WUFDM0MsTUFBTSxNQUFNLEdBQWMsVUFBQSxRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2xELElBQUksY0FBYyxHQUFXLGVBQWUsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQztZQUM3RCxJQUFJLEdBQUcsR0FBVyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQzNDLElBQUksR0FBRyxHQUFXLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDM0MsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7Z0JBQ2QsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDZCxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ2YsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDVixDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2FBQ1gsQ0FBQyxDQUFDO1lBQ0gsT0FBTyxNQUFNLENBQUM7UUFDaEIsQ0FBQztRQUVEOztXQUVHO1FBQ0ksTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQywyQ0FBMkM7WUFDM0MsTUFBTSxNQUFNLEdBQWMsVUFBQSxRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2xELE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO2dCQUNkLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNsQixDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDbEIsQ0FBQyxFQUFFLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQ2xCLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7YUFDWCxDQUFDLENBQUM7WUFDSCxPQUFPLE1BQU0sQ0FBQztRQUNoQixDQUFDO1FBQ0QsWUFBWTtRQUVaLHFCQUFxQjtRQUNyQjs7Ozs7OztXQU9HO1FBQ0ksTUFBTSxDQUFDLGtCQUFrQixDQUFDLE9BQWUsRUFBRSxxQkFBNkIsRUFBRSxLQUFhLEVBQUUsSUFBWSxFQUFFLFVBQXlCO1lBQ3JJLElBQUksb0JBQW9CLEdBQVcscUJBQXFCLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUM7WUFDekUsSUFBSSxDQUFDLEdBQVcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLG9CQUFvQixDQUFDLENBQUMsQ0FBQztZQUNqRSxJQUFJLFFBQVEsR0FBVyxHQUFHLEdBQUcsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFDNUMsMkNBQTJDO1lBQzNDLE1BQU0sTUFBTSxHQUFjLFVBQUEsUUFBUSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNsRCxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztnQkFDZCxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNWLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ1YsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxRQUFRLEVBQUUsQ0FBQyxDQUFDO2dCQUNuQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssR0FBRyxJQUFJLEdBQUcsUUFBUSxHQUFHLENBQUMsRUFBRSxDQUFDO2FBQ3JDLENBQUMsQ0FBQztZQUVILElBQUksVUFBVSxJQUFJLFVBQUEsYUFBYSxDQUFDLFFBQVEsRUFBRTtnQkFDeEMsT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzdCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQztnQkFDN0IsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDO2FBQzlCO2lCQUNJLElBQUksVUFBVSxJQUFJLFVBQUEsYUFBYSxDQUFDLFFBQVE7Z0JBQzNDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQztpQkFDMUIsMEJBQTBCO2dCQUM3QixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUM7WUFFL0IsT0FBTyxNQUFNLENBQUM7UUFDaEIsQ0FBQztRQUVEOzs7Ozs7OztXQVFHO1FBQ0ksTUFBTSxDQUFDLHVCQUF1QixDQUFDLEtBQWEsRUFBRSxNQUFjLEVBQUUsT0FBZSxFQUFFLElBQVksRUFBRSxRQUFnQixDQUFDLEdBQUcsRUFBRSxPQUFlLEdBQUc7WUFDMUksMkNBQTJDO1lBQzNDLE1BQU0sTUFBTSxHQUFjLFVBQUEsUUFBUSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNsRCxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztnQkFDZCxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUM3QixDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUM3QixDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO2dCQUMzQixDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUM7Z0JBQ25DLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztnQkFDbkMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO2dCQUMvQixDQUFDO2FBQ0YsQ0FBQyxDQUFDO1lBQ0gsT0FBTyxNQUFNLENBQUM7UUFDaEIsQ0FBQztRQUNELFlBQVk7UUFFWixrQkFBa0I7UUFDbEI7O1dBRUc7UUFDSSxPQUFPLENBQUMsZUFBdUI7WUFDcEMsTUFBTSxNQUFNLEdBQWMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1lBQ2hHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDakIsVUFBQSxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3pCLENBQUM7UUFFRDs7V0FFRztRQUNJLE9BQU8sQ0FBQyxlQUF1QjtZQUNwQyxNQUFNLE1BQU0sR0FBYyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7WUFDaEcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNqQixVQUFBLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDekIsQ0FBQztRQUVEOztXQUVHO1FBQ0ksT0FBTyxDQUFDLGVBQXVCO1lBQ3BDLE1BQU0sTUFBTSxHQUFjLFNBQVMsQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztZQUNoRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2pCLFVBQUEsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN6QixDQUFDO1FBRUQ7O1dBRUc7UUFDSSxNQUFNLENBQUMsT0FBZ0IsRUFBRSxNQUFlLFVBQUEsT0FBTyxDQUFDLENBQUMsRUFBRTtZQUN4RCxNQUFNLE1BQU0sR0FBYyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxzQ0FBc0M7WUFDOUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNqQixVQUFBLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDekIsQ0FBQztRQUNELFlBQVk7UUFFWixxQkFBcUI7UUFDckI7O1dBRUc7UUFDSSxTQUFTLENBQUMsR0FBWTtZQUMzQixNQUFNLE1BQU0sR0FBYyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDckYscUZBQXFGO1lBQ3JGLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDakIsVUFBQSxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3pCLENBQUM7UUFFRDs7V0FFRztRQUNJLFVBQVUsQ0FBQyxFQUFVO1lBQzFCLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3BCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLENBQUM7UUFDRDs7V0FFRztRQUNJLFVBQVUsQ0FBQyxFQUFVO1lBQzFCLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3BCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLENBQUM7UUFDRDs7V0FFRztRQUNJLFVBQVUsQ0FBQyxFQUFVO1lBQzFCLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3BCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLENBQUM7UUFDRCxZQUFZO1FBRVosaUJBQWlCO1FBQ2pCOztXQUVHO1FBQ0ksS0FBSyxDQUFDLEdBQVk7WUFDdkIsTUFBTSxNQUFNLEdBQWMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ2pGLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDakIsVUFBQSxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3pCLENBQUM7UUFDRDs7V0FFRztRQUNJLE1BQU0sQ0FBQyxHQUFXO1lBQ3ZCLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxVQUFBLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckMsQ0FBQztRQUNEOztXQUVHO1FBQ0ksTUFBTSxDQUFDLEdBQVc7WUFDdkIsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLFVBQUEsT0FBTyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQyxDQUFDO1FBQ0Q7O1dBRUc7UUFDSSxNQUFNLENBQUMsR0FBVztZQUN2QixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksVUFBQSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3JDLENBQUM7UUFDRCxZQUFZO1FBRVosd0JBQXdCO1FBQ3hCOztXQUVHO1FBQ0ksUUFBUSxDQUFDLE9BQWtCO1lBQ2hDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNsRCxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUN0QixDQUFDO1FBQ0QsWUFBWTtRQUVaLGtCQUFrQjtRQUNsQjs7V0FFRztRQUNJLGNBQWM7WUFDbkIsSUFBSSxPQUFPLEdBQVksSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUVwQyxJQUFJLEVBQUUsR0FBVyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDMUMsSUFBSSxFQUFFLEdBQVcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQzFDLElBQUksRUFBRSxHQUFXLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUMxQyxJQUFJLEVBQUUsR0FBVyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDMUMsSUFBSSxHQUFHLEdBQVcsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBRTVDLElBQUksRUFBRSxHQUFXLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsdURBQXVEO1lBRTVGLElBQUksUUFBUSxHQUFZLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxLQUFLO1lBRXhDLElBQUksRUFBVSxFQUFFLEVBQVUsRUFBRSxFQUFVLENBQUM7WUFDdkMsSUFBSSxFQUFVLEVBQUUsRUFBVSxFQUFFLEVBQVUsQ0FBQztZQUV2QyxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUNiLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDekIsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQ3pCLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFFeEIsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDM0IsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDMUIsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFFMUIsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRTtvQkFDM0YsRUFBRSxHQUFHLEVBQUUsQ0FBQztvQkFDUixFQUFFLEdBQUcsRUFBRSxDQUFDO29CQUNSLEVBQUUsR0FBRyxFQUFFLENBQUM7aUJBQ1Q7YUFDRjtpQkFDSTtnQkFDSCxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDckUsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQy9DLEVBQUUsR0FBRyxDQUFDLENBQUM7YUFDUjtZQUVELElBQUksUUFBUSxHQUFZLElBQUksVUFBQSxPQUFPLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNoRCxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFFOUIsT0FBTyxRQUFRLENBQUM7UUFDbEIsQ0FBQztRQUVEOztXQUVHO1FBQ0ksR0FBRyxDQUFDLEdBQWM7WUFDdkIseUJBQXlCO1lBQ3pCLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN4QixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDcEIsQ0FBQztRQUVEOztXQUVHO1FBQ0ksR0FBRztZQUNSLE9BQU8sSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JDLENBQUM7UUFFTSxTQUFTO1lBQ2QseUZBQXlGO1lBQ3pGLElBQUksYUFBYSxHQUFrQixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDckQsT0FBTyxhQUFhLENBQUM7UUFDdkIsQ0FBQztRQUNNLFdBQVcsQ0FBQyxjQUE2QjtZQUM5QyxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQzVCLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUVNLFVBQVU7WUFDZixJQUFJLElBQUksQ0FBQyxPQUFPO2dCQUNkLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUV0QixJQUFJLE9BQU8sR0FBWTtnQkFDckIsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxFQUFFO2dCQUMxQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUU7Z0JBQ3BDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRTthQUNuQyxDQUFDO1lBRUYsZ0JBQWdCO1lBQ2hCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1lBQ3ZCLE9BQU8sT0FBTyxDQUFDO1FBQ2pCLENBQUM7UUFFTSxNQUFNLENBQUMsUUFBaUI7WUFDN0IsSUFBSSxjQUFjLEdBQVksSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUMvQyxJQUFJLFdBQVcsR0FBWSxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQ3pDLElBQUksVUFBVSxHQUFZLElBQUksQ0FBQyxPQUFPLENBQUM7WUFDdkMsSUFBSSxjQUFjLEdBQXFCLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUMvRCxJQUFJLFdBQVcsR0FBcUIsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3pELElBQUksVUFBVSxHQUFxQixRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDdkQsSUFBSSxPQUFPLEdBQXlCLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQztZQUN6RixJQUFJLGNBQWMsRUFBRTtnQkFDbEIsT0FBTyxDQUFDLFdBQVcsR0FBRyxJQUFJLFVBQUEsT0FBTyxDQUMvQixjQUFjLENBQUMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsRUFDbkUsY0FBYyxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLEVBQ25FLGNBQWMsQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUNwRSxDQUFDO2FBQ0g7WUFDRCxJQUFJLFdBQVcsRUFBRTtnQkFDZixPQUFPLENBQUMsUUFBUSxHQUFHLElBQUksVUFBQSxPQUFPLENBQzVCLFdBQVcsQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUMxRCxXQUFXLENBQUMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsRUFDMUQsV0FBVyxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQzNELENBQUM7YUFDSDtZQUNELElBQUksVUFBVSxFQUFFO2dCQUNkLE9BQU8sQ0FBQyxPQUFPLEdBQUcsSUFBSSxVQUFBLE9BQU8sQ0FDM0IsVUFBVSxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQ3ZELFVBQVUsQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUN2RCxVQUFVLENBQUMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FDeEQsQ0FBQzthQUNIO1lBRUQsaUtBQWlLO1lBQ2pLLElBQUksTUFBTSxHQUFjLFNBQVMsQ0FBQyxRQUFRLENBQUM7WUFDM0MsSUFBSSxPQUFPLENBQUMsV0FBVztnQkFDckIsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDeEMsSUFBSSxPQUFPLENBQUMsUUFBUSxFQUFFO2dCQUNwQixNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25DLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbkMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3BDO1lBQ0QsSUFBSSxPQUFPLENBQUMsT0FBTztnQkFDakIsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDaEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUVqQixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN6QixDQUFDO1FBRU0sd0JBQXdCLENBQUMsUUFBaUI7WUFDL0MsSUFBSSxLQUFLLEdBQTBCLEVBQUUsQ0FBQztZQUN0QyxJQUFJLFFBQVEsQ0FBQyxXQUFXO2dCQUFFLEtBQUssQ0FBQyxXQUFXLEdBQUcsU0FBUyxDQUFDO1lBQ3hELElBQUksUUFBUSxDQUFDLFFBQVE7Z0JBQUUsS0FBSyxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUM7WUFDbEQsSUFBSSxRQUFRLENBQUMsT0FBTztnQkFBRSxLQUFLLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQztZQUNoRCxPQUFPLEtBQUssQ0FBQztRQUNmLENBQUM7UUFDUyxhQUFhLENBQUMsUUFBaUIsSUFBZ0IsQ0FBQztRQUVsRCxVQUFVO1lBQ2hCLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDO1lBQ3BFLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLENBQUM7S0FDRjtJQWpwQlksbUJBQVMsWUFpcEJyQixDQUFBO0lBQ0QsWUFBWTtBQUNkLENBQUMsRUExcUJTLFNBQVMsS0FBVCxTQUFTLFFBMHFCbEI7QUMxcUJELElBQVUsU0FBUyxDQXNIbEI7QUF0SEQsV0FBVSxTQUFTO0lBQ2Y7O09BRUc7SUFDSCxJQUFZLFFBVVg7SUFWRCxXQUFZLFFBQVE7UUFDaEIsNkNBQWMsQ0FBQTtRQUNkLGlEQUFnQixDQUFBO1FBQ2hCLCtDQUFlLENBQUE7UUFDZixvREFBaUIsQ0FBQTtRQUNqQiw0Q0FBYSxDQUFBO1FBQ2Isc0RBQWtCLENBQUE7UUFDbEIsb0RBQWlCLENBQUE7UUFDakIsd0RBQW1CLENBQUE7UUFDbkIsc0RBQWtCLENBQUE7SUFDdEIsQ0FBQyxFQVZXLFFBQVEsR0FBUixrQkFBUSxLQUFSLGtCQUFRLFFBVW5CO0lBRUQ7OztPQUdHO0lBQ0gsTUFBYSxTQUFVLFNBQVEsVUFBQSxPQUFPO1FBSWxDLFlBQVksS0FBYSxDQUFDLEVBQUUsS0FBYSxDQUFDLEVBQUUsU0FBaUIsQ0FBQyxFQUFFLFVBQWtCLENBQUMsRUFBRSxVQUFvQixRQUFRLENBQUMsT0FBTztZQUNySCxLQUFLLEVBQUUsQ0FBQztZQUpMLGFBQVEsR0FBWSxVQUFBLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBQSxPQUFPLENBQUMsQ0FBQztZQUMxQyxTQUFJLEdBQVksVUFBQSxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQUEsT0FBTyxDQUFDLENBQUM7WUFJekMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM5RCxDQUFDO1FBRUQ7O1dBRUc7UUFDSSxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQWEsQ0FBQyxFQUFFLEtBQWEsQ0FBQyxFQUFFLFNBQWlCLENBQUMsRUFBRSxVQUFrQixDQUFDLEVBQUUsVUFBb0IsUUFBUSxDQUFDLE9BQU87WUFDM0gsSUFBSSxJQUFJLEdBQWMsVUFBQSxRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzlDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNqRCxPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO1FBRUQ7O1dBRUc7UUFDSSxrQkFBa0IsQ0FBQyxLQUFhLENBQUMsRUFBRSxLQUFhLENBQUMsRUFBRSxTQUFpQixDQUFDLEVBQUUsVUFBa0IsQ0FBQyxFQUFFLFVBQW9CLFFBQVEsQ0FBQyxPQUFPO1lBQ25JLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztZQUMvQixRQUFRLE9BQU8sR0FBRyxJQUFJLEVBQUU7Z0JBQ3BCLEtBQUssSUFBSTtvQkFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7b0JBQUMsTUFBTTtnQkFDdkMsS0FBSyxJQUFJO29CQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLEdBQUcsQ0FBQyxDQUFDO29CQUFDLE1BQU07Z0JBQ3BELEtBQUssSUFBSTtvQkFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDO29CQUFDLE1BQU07YUFDbkQ7WUFDRCxRQUFRLE9BQU8sR0FBRyxJQUFJLEVBQUU7Z0JBQ3BCLEtBQUssSUFBSTtvQkFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7b0JBQUMsTUFBTTtnQkFDdkMsS0FBSyxJQUFJO29CQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxPQUFPLEdBQUcsQ0FBQyxDQUFDO29CQUFDLE1BQU07Z0JBQ3JELEtBQUssSUFBSTtvQkFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsT0FBTyxDQUFDO29CQUFDLE1BQU07YUFDcEQ7UUFDTCxDQUFDO1FBRUQsSUFBSSxDQUFDO1lBQ0QsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUMzQixDQUFDO1FBQ0QsSUFBSSxDQUFDO1lBQ0QsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUMzQixDQUFDO1FBQ0QsSUFBSSxLQUFLO1lBQ0wsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN2QixDQUFDO1FBQ0QsSUFBSSxNQUFNO1lBQ04sT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN2QixDQUFDO1FBRUQsSUFBSSxJQUFJO1lBQ0osT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUMzQixDQUFDO1FBQ0QsSUFBSSxHQUFHO1lBQ0gsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUMzQixDQUFDO1FBQ0QsSUFBSSxLQUFLO1lBQ0wsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN6QyxDQUFDO1FBQ0QsSUFBSSxNQUFNO1lBQ04sT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN6QyxDQUFDO1FBRUQsSUFBSSxDQUFDLENBQUMsRUFBVTtZQUNaLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN6QixDQUFDO1FBQ0QsSUFBSSxDQUFDLENBQUMsRUFBVTtZQUNaLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN6QixDQUFDO1FBQ0QsSUFBSSxLQUFLLENBQUMsTUFBYztZQUNwQixJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUM7UUFDN0IsQ0FBQztRQUNELElBQUksTUFBTSxDQUFDLE9BQWU7WUFDdEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDO1FBQzlCLENBQUM7UUFDRCxJQUFJLElBQUksQ0FBQyxNQUFjO1lBQ25CLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDO1lBQ2xDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQztRQUM3QixDQUFDO1FBQ0QsSUFBSSxHQUFHLENBQUMsTUFBYztZQUNsQixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztZQUNuQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUM7UUFDN0IsQ0FBQztRQUNELElBQUksS0FBSyxDQUFDLE1BQWM7WUFDcEIsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDO1FBQzNDLENBQUM7UUFDRCxJQUFJLE1BQU0sQ0FBQyxNQUFjO1lBQ3JCLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQztRQUMzQyxDQUFDO1FBRUQ7OztXQUdHO1FBQ0ksUUFBUSxDQUFDLE1BQWU7WUFDM0IsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2hILENBQUM7UUFFUyxhQUFhLENBQUMsUUFBaUIsSUFBZSxDQUFDO0tBQzVEO0lBakdZLG1CQUFTLFlBaUdyQixDQUFBO0FBQ0wsQ0FBQyxFQXRIUyxTQUFTLEtBQVQsU0FBUyxRQXNIbEI7QUN0SEQsSUFBVSxTQUFTLENBdVFsQjtBQXZRRCxXQUFVLFNBQVM7SUFDakI7Ozs7Ozs7T0FPRztJQUNILE1BQWEsT0FBUSxTQUFRLFVBQUEsT0FBTztRQUdsQyxZQUFtQixLQUFhLENBQUMsRUFBRSxLQUFhLENBQUM7WUFDL0MsS0FBSyxFQUFFLENBQUM7WUFDUixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksWUFBWSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDekMsQ0FBQztRQUVELElBQUksQ0FBQztZQUNILE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0QixDQUFDO1FBQ0QsSUFBSSxDQUFDO1lBQ0gsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RCLENBQUM7UUFFRCxJQUFJLENBQUMsQ0FBQyxFQUFVO1lBQ2QsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDcEIsQ0FBQztRQUNELElBQUksQ0FBQyxDQUFDLEVBQVU7WUFDZCxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNwQixDQUFDO1FBRUQ7OztXQUdHO1FBQ0ksTUFBTSxDQUFDLElBQUk7WUFDaEIsSUFBSSxNQUFNLEdBQVksSUFBSSxPQUFPLEVBQUUsQ0FBQztZQUNwQyxPQUFPLE1BQU0sQ0FBQztRQUNoQixDQUFDO1FBRUQ7OztXQUdHO1FBQ0ksTUFBTSxDQUFDLEdBQUcsQ0FBQyxTQUFpQixDQUFDO1lBQ2xDLElBQUksTUFBTSxHQUFZLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNsRCxPQUFPLE1BQU0sQ0FBQztRQUNoQixDQUFDO1FBRUQ7Ozs7V0FJRztRQUNJLE1BQU0sQ0FBQyxDQUFDLENBQUMsU0FBaUIsQ0FBQztZQUNoQyxJQUFJLE1BQU0sR0FBWSxJQUFJLE9BQU8sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDN0MsT0FBTyxNQUFNLENBQUM7UUFDaEIsQ0FBQztRQUVEOzs7O1dBSUc7UUFDSSxNQUFNLENBQUMsQ0FBQyxDQUFDLFNBQWlCLENBQUM7WUFDaEMsSUFBSSxNQUFNLEdBQVksSUFBSSxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzdDLE9BQU8sTUFBTSxDQUFDO1FBQ2hCLENBQUM7UUFHRDs7Ozs7V0FLRztRQUNJLE1BQU0sQ0FBQyxhQUFhLENBQUMsT0FBZ0IsRUFBRSxVQUFrQixDQUFDO1lBQy9ELElBQUksTUFBTSxHQUFZLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNyQyxJQUFJO2dCQUNGLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztnQkFDMUIsSUFBSSxNQUFNLEdBQVcsT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNoRCxNQUFNLENBQUMsSUFBSSxHQUFHLElBQUksWUFBWSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDO2FBQzFFO1lBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQ1gsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUNsQjtZQUNELE9BQU8sTUFBTSxDQUFDO1FBQ2hCLENBQUM7UUFFRDs7Ozs7V0FLRztRQUNJLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBZ0IsRUFBRSxNQUFjO1lBQ2xELElBQUksTUFBTSxHQUFZLElBQUksT0FBTyxFQUFFLENBQUM7WUFDcEMsT0FBTyxNQUFNLENBQUM7UUFDaEIsQ0FBQztRQUVEOzs7O1dBSUc7UUFDSSxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsUUFBbUI7WUFDdEMsSUFBSSxNQUFNLEdBQVksSUFBSSxPQUFPLEVBQUUsQ0FBQztZQUNwQyxLQUFLLElBQUksTUFBTSxJQUFJLFFBQVE7Z0JBQ3pCLE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxZQUFZLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3RSxPQUFPLE1BQU0sQ0FBQztRQUNoQixDQUFDO1FBRUQ7Ozs7O1dBS0c7UUFDSSxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQVcsRUFBRSxFQUFXO1lBQy9DLElBQUksTUFBTSxHQUFZLElBQUksT0FBTyxDQUFDO1lBQ2xDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxZQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzRCxPQUFPLE1BQU0sQ0FBQztRQUNoQixDQUFDO1FBRUQ7Ozs7O1dBS0c7UUFDSSxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQVcsRUFBRSxFQUFXO1lBQ3hDLElBQUksYUFBYSxHQUFXLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdEQsT0FBTyxhQUFhLENBQUM7UUFDdkIsQ0FBQztRQUVEOzs7Ozs7V0FNRztRQUNJLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBZ0I7WUFDdEMsSUFBSSxTQUFTLEdBQVcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDakUsT0FBTyxTQUFTLENBQUM7UUFDbkIsQ0FBQztRQUVEOzs7O1dBSUc7UUFDSSxNQUFNLENBQUMsWUFBWSxDQUFDLE9BQWdCO1lBQ3pDLElBQUksU0FBUyxHQUFXLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3RELE9BQU8sU0FBUyxDQUFDO1FBQ25CLENBQUM7UUFFRDs7Ozs7O1dBTUc7UUFDSSxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQVcsRUFBRSxFQUFXO1lBQ2pELElBQUksWUFBWSxHQUFXLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDckQsT0FBTyxZQUFZLENBQUM7UUFDdEIsQ0FBQztRQUVEOzs7Ozs7Ozs7V0FTRztRQUNJLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBZ0IsRUFBRSxhQUFzQixLQUFLO1lBQ3BFLElBQUksVUFBVTtnQkFBRSxPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7O2dCQUNyRCxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakQsQ0FBQztRQUVEOzs7V0FHRztRQUNJLEdBQUcsQ0FBQyxPQUFnQjtZQUN6QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDdkUsQ0FBQztRQUVEOzs7V0FHRztRQUNJLFFBQVEsQ0FBQyxXQUFvQjtZQUNsQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDL0UsQ0FBQztRQUVEOzs7V0FHRztRQUNJLEtBQUssQ0FBQyxNQUFjO1lBQ3pCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDLEVBQUUsTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDakUsQ0FBQztRQUVEOzs7V0FHRztRQUNJLFNBQVMsQ0FBQyxVQUFrQixDQUFDO1lBQ2xDLElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ3hELENBQUM7UUFFRDs7OztXQUlHO1FBQ0ksR0FBRyxDQUFDLEtBQWEsQ0FBQyxFQUFFLEtBQWEsQ0FBQztZQUN2QyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksWUFBWSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDekMsQ0FBQztRQUVEOzs7O1dBSUc7UUFDSSxNQUFNLENBQUMsT0FBZ0I7WUFDNUIsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFBRSxPQUFPLElBQUksQ0FBQztZQUNwRixPQUFPLEtBQUssQ0FBQztRQUNmLENBQUM7UUFFRDs7V0FFRztRQUNJLEdBQUc7WUFDUixPQUFPLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyQyxDQUFDO1FBRUQ7O1dBRUc7UUFDSCxJQUFXLElBQUk7WUFDYixPQUFPLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JDLENBQUM7UUFFRDs7V0FFRztRQUNJLFNBQVM7WUFDZCxPQUFPLElBQUksVUFBQSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3hDLENBQUM7UUFFTSxVQUFVO1lBQ2YsSUFBSSxPQUFPLEdBQVk7Z0JBQ3JCLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzthQUNqQyxDQUFDO1lBQ0YsT0FBTyxPQUFPLENBQUM7UUFDakIsQ0FBQztRQUNTLGFBQWEsQ0FBQyxRQUFpQixJQUFnQixDQUFDO0tBQzNEO0lBN1BZLGlCQUFPLFVBNlBuQixDQUFBO0FBQ0gsQ0FBQyxFQXZRUyxTQUFTLEtBQVQsU0FBUyxRQXVRbEI7QUN2UUQsSUFBVSxTQUFTLENBc05sQjtBQXRORCxXQUFVLFNBQVM7SUFDZjs7Ozs7Ozs7O09BU0c7SUFDSCxNQUFhLE9BQVEsU0FBUSxVQUFBLE9BQU87UUFHaEMsWUFBbUIsS0FBYSxDQUFDLEVBQUUsS0FBYSxDQUFDLEVBQUUsS0FBYSxDQUFDO1lBQzdELEtBQUssRUFBRSxDQUFDO1lBQ1IsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLFlBQVksQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMvQyxDQUFDO1FBRUQsbUNBQW1DO1FBQ25DLElBQUksQ0FBQztZQUNELE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4QixDQUFDO1FBQ0QsSUFBSSxDQUFDO1lBQ0QsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hCLENBQUM7UUFDRCxJQUFJLENBQUM7WUFDRCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEIsQ0FBQztRQUVELElBQUksQ0FBQyxDQUFDLEVBQVU7WUFDWixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN0QixDQUFDO1FBQ0QsSUFBSSxDQUFDLENBQUMsRUFBVTtZQUNaLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLENBQUM7UUFDRCxJQUFJLENBQUMsQ0FBQyxFQUFVO1lBQ1osSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDdEIsQ0FBQztRQUVNLE1BQU0sQ0FBQyxDQUFDLENBQUMsU0FBaUIsQ0FBQztZQUM5QixNQUFNLE1BQU0sR0FBWSxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2xELE9BQU8sTUFBTSxDQUFDO1FBQ2xCLENBQUM7UUFFTSxNQUFNLENBQUMsQ0FBQyxDQUFDLFNBQWlCLENBQUM7WUFDOUIsTUFBTSxNQUFNLEdBQVksSUFBSSxPQUFPLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNsRCxPQUFPLE1BQU0sQ0FBQztRQUNsQixDQUFDO1FBRU0sTUFBTSxDQUFDLENBQUMsQ0FBQyxTQUFpQixDQUFDO1lBQzlCLE1BQU0sTUFBTSxHQUFZLElBQUksT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDbEQsT0FBTyxNQUFNLENBQUM7UUFDbEIsQ0FBQztRQUVNLE1BQU0sQ0FBQyxJQUFJO1lBQ2QsTUFBTSxNQUFNLEdBQVksSUFBSSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3QyxPQUFPLE1BQU0sQ0FBQztRQUNsQixDQUFDO1FBRU0sTUFBTSxDQUFDLEdBQUcsQ0FBQyxTQUFpQixDQUFDO1lBQ2hDLE1BQU0sTUFBTSxHQUFZLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDNUQsT0FBTyxNQUFNLENBQUM7UUFDbEIsQ0FBQztRQUVNLE1BQU0sQ0FBQyxjQUFjLENBQUMsT0FBZ0IsRUFBRSxPQUFrQixFQUFFLHNCQUErQixJQUFJO1lBQ2xHLElBQUksTUFBTSxHQUFZLElBQUksT0FBTyxFQUFFLENBQUM7WUFDcEMsSUFBSSxDQUFDLEdBQWlCLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNwQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDOUIsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMxQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFM0MsSUFBSSxtQkFBbUIsRUFBRTtnQkFDckIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7YUFDbkM7WUFFRCxPQUFPLE1BQU0sQ0FBQztRQUNsQixDQUFDO1FBR00sTUFBTSxDQUFDLGFBQWEsQ0FBQyxPQUFnQixFQUFFLFVBQWtCLENBQUM7WUFDN0QsSUFBSSxNQUFNLEdBQVksT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3JDLElBQUk7Z0JBQ0EsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztnQkFDN0IsSUFBSSxNQUFNLEdBQVcsT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDbkQsTUFBTSxDQUFDLElBQUksR0FBRyxJQUFJLFlBQVksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDLEdBQUcsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQzthQUNoRztZQUFDLE9BQU8sRUFBRSxFQUFFO2dCQUNULFVBQUEsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUNsQjtZQUNELE9BQU8sTUFBTSxDQUFDO1FBQ2xCLENBQUM7UUFFRDs7OztXQUlHO1FBQ0ksTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFFBQW1CO1lBQ3BDLElBQUksTUFBTSxHQUFZLElBQUksT0FBTyxFQUFFLENBQUM7WUFDcEMsS0FBSyxJQUFJLE1BQU0sSUFBSSxRQUFRO2dCQUN2QixNQUFNLENBQUMsSUFBSSxHQUFHLElBQUksWUFBWSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BHLE9BQU8sTUFBTSxDQUFDO1FBQ2xCLENBQUM7UUFDRDs7Ozs7V0FLRztRQUNJLE1BQU0sQ0FBQyxVQUFVLENBQUMsRUFBVyxFQUFFLEVBQVc7WUFDN0MsSUFBSSxNQUFNLEdBQVksSUFBSSxPQUFPLENBQUM7WUFDbEMsTUFBTSxDQUFDLElBQUksR0FBRyxJQUFJLFlBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4RSxPQUFPLE1BQU0sQ0FBQztRQUNsQixDQUFDO1FBQ0Q7O1dBRUc7UUFDSSxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQWdCLEVBQUUsUUFBZ0I7WUFDbEQsSUFBSSxNQUFNLEdBQVksSUFBSSxPQUFPLEVBQUUsQ0FBQztZQUNwQyxNQUFNLENBQUMsSUFBSSxHQUFHLElBQUksWUFBWSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUMsR0FBRyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ25HLE9BQU8sTUFBTSxDQUFDO1FBQ2xCLENBQUM7UUFDRDs7Ozs7V0FLRztRQUNJLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBVyxFQUFFLEVBQVc7WUFDeEMsSUFBSSxNQUFNLEdBQVksSUFBSSxPQUFPLENBQUM7WUFDbEMsTUFBTSxDQUFDLElBQUksR0FBRyxJQUFJLFlBQVksQ0FBQztnQkFDM0IsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7Z0JBQ3pCLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO2dCQUN6QixFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQzthQUFDLENBQUMsQ0FBQztZQUNoQyxPQUFPLE1BQU0sQ0FBQztRQUNsQixDQUFDO1FBQ0Q7Ozs7O1dBS0c7UUFDSSxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQVcsRUFBRSxFQUFXO1lBQ3RDLElBQUksYUFBYSxHQUFXLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3BFLE9BQU8sYUFBYSxDQUFDO1FBQ3pCLENBQUM7UUFFRDs7Ozs7Ozs7V0FRRztRQUNJLE1BQU0sQ0FBQyxVQUFVLENBQUMsU0FBa0IsRUFBRSxPQUFnQjtZQUN6RCxJQUFJLEdBQUcsR0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ25ELElBQUksVUFBVSxHQUFZLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ2xGLE9BQU8sVUFBVSxDQUFDO1FBQ3RCLENBQUM7UUFFTSxHQUFHLENBQUMsT0FBZ0I7WUFDdkIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUM3RixDQUFDO1FBQ00sUUFBUSxDQUFDLFdBQW9CO1lBQ2hDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDekcsQ0FBQztRQUNNLEtBQUssQ0FBQyxNQUFjO1lBQ3ZCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDLEVBQUUsTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDLEVBQUUsTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDcEYsQ0FBQztRQUVNLFNBQVMsQ0FBQyxVQUFrQixDQUFDO1lBQ2hDLElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQzFELENBQUM7UUFFTSxHQUFHLENBQUMsS0FBYSxDQUFDLEVBQUUsS0FBYSxDQUFDLEVBQUUsS0FBYSxDQUFDO1lBQ3JELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxZQUFZLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDL0MsQ0FBQztRQUVNLEdBQUc7WUFDTixPQUFPLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2QyxDQUFDO1FBRUQsSUFBVyxJQUFJO1lBQ1gsT0FBTyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFFTSxTQUFTLENBQUMsT0FBa0IsRUFBRSxzQkFBK0IsSUFBSTtZQUNwRSxJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxtQkFBbUIsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUNoRixDQUFDO1FBRUQ7O1dBRUc7UUFDSSxTQUFTO1lBQ1osT0FBTyxJQUFJLFVBQUEsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7UUFFTSxPQUFPLENBQUMsT0FBZ0I7WUFDM0IsTUFBTSxTQUFTLEdBQVksT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDN0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hELFVBQUEsUUFBUSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM5QixDQUFDO1FBRU0sVUFBVTtZQUNiLElBQUksT0FBTyxHQUFZO2dCQUNuQixDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7YUFDcEQsQ0FBQztZQUNGLE9BQU8sT0FBTyxDQUFDO1FBQ25CLENBQUM7UUFDUyxhQUFhLENBQUMsUUFBaUIsSUFBZ0IsQ0FBQztLQUM3RDtJQTFNWSxpQkFBTyxVQTBNbkIsQ0FBQTtBQUNMLENBQUMsRUF0TlMsU0FBUyxLQUFULFNBQVMsUUFzTmxCO0FDdE5ELElBQVUsU0FBUyxDQTZDbEI7QUE3Q0QsV0FBVSxTQUFTO0lBQ2Y7Ozs7O09BS0c7SUFDSCxNQUFzQixJQUFJO1FBQTFCO1lBT1csZUFBVSxHQUFXLFNBQVMsQ0FBQztRQThCMUMsQ0FBQztRQTVCVSxNQUFNLENBQUMsc0JBQXNCO1lBQ2hDLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxzQkFBc0IsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUN2RyxDQUFDO1FBQ00sY0FBYztZQUNqQixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLElBQUksQ0FBQztRQUNyRSxDQUFDO1FBQ00sYUFBYTtZQUNoQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBQy9CLENBQUM7UUFFRCx5RUFBeUU7UUFDbEUsU0FBUztZQUNaLElBQUksYUFBYSxHQUFrQjtnQkFDL0IsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVO2FBQzlCLENBQUMsQ0FBQyxxQkFBcUI7WUFDeEIsT0FBTyxhQUFhLENBQUM7UUFDekIsQ0FBQztRQUNNLFdBQVcsQ0FBQyxjQUE2QjtZQUM1QyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxpRUFBaUU7WUFDaEYsSUFBSSxDQUFDLFVBQVUsR0FBRyxjQUFjLENBQUMsVUFBVSxDQUFDO1lBQzVDLE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7S0FPSjtJQXJDcUIsY0FBSSxPQXFDekIsQ0FBQTtBQUNMLENBQUMsRUE3Q1MsU0FBUyxLQUFULFNBQVMsUUE2Q2xCO0FDN0NELElBQVUsU0FBUyxDQWdIbEI7QUFoSEQsV0FBVSxTQUFTO0lBQ2Y7Ozs7Ozs7OztPQVNHO0lBQ0gsTUFBYSxRQUFTLFNBQVEsVUFBQSxJQUFJO1FBQzlCO1lBQ0ksS0FBSyxFQUFFLENBQUM7WUFDUixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDbEIsQ0FBQztRQUVNLE1BQU07WUFDVCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUN0QyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUNwQyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQzFDLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDaEQsQ0FBQztRQUVTLGNBQWM7WUFDcEIsSUFBSSxRQUFRLEdBQWlCLElBQUksWUFBWSxDQUFDO2dCQUMxQyxhQUFhO2dCQUNiLFFBQVE7Z0JBQ1IsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUMvRCxPQUFPO2dCQUNQLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFHLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUN0RSxjQUFjO2dCQUNkLFFBQVE7Z0JBQ1IsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUMvRCxPQUFPO2dCQUNQLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFHLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQ3pFLENBQUMsQ0FBQztZQUVILDRDQUE0QztZQUM1QyxRQUFRLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztZQUU5QyxPQUFPLFFBQVEsQ0FBQztRQUNwQixDQUFDO1FBRVMsYUFBYTtZQUNuQixJQUFJLE9BQU8sR0FBZ0IsSUFBSSxXQUFXLENBQUM7Z0JBQ3ZDLGFBQWE7Z0JBQ2IsUUFBUTtnQkFDUixDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQ2hCLFFBQVE7Z0JBQ1IsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNoQixPQUFPO2dCQUNQLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFFaEIsY0FBYztnQkFDZCxPQUFPO2dCQUNQLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQztnQkFDeEMsTUFBTTtnQkFDTixDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUM7Z0JBQ3hDLFNBQVM7Z0JBQ1QsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDO2dCQUV4Qzs7Ozs7OztrQkFPRTthQUNMLENBQUMsQ0FBQztZQUNILE9BQU8sT0FBTyxDQUFDO1FBQ25CLENBQUM7UUFFUyxnQkFBZ0I7WUFDdEIsSUFBSSxVQUFVLEdBQWlCLElBQUksWUFBWSxDQUFDO2dCQUM1QyxhQUFhO2dCQUNiLFFBQVE7Z0JBQ1IsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUcsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUMvQyxPQUFPO2dCQUNQLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFFL0MsY0FBYztnQkFDZCxRQUFRO2dCQUNSLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNoRCxPQUFPO2dCQUNQLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQ25ELENBQUMsQ0FBQztZQUNILE9BQU8sVUFBVSxDQUFDO1FBQ3RCLENBQUM7UUFFUyxpQkFBaUI7WUFDdkIsSUFBSSxPQUFPLEdBQWlCLElBQUksWUFBWSxDQUFDO2dCQUN6Qyw4R0FBOEc7Z0JBQzlHLGFBQWE7Z0JBQ2IsUUFBUTtnQkFDUixLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUMxRCxPQUFPO2dCQUNQLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFFM0QsY0FBYztnQkFDZCxRQUFRO2dCQUNSLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDM0QsT0FBTztnQkFDUCxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7YUFDOUQsQ0FBQyxDQUFDO1lBRUgsa0NBQWtDO1lBRWxDLE9BQU8sT0FBTyxDQUFDO1FBQ25CLENBQUM7S0FDSjtJQXBHWSxrQkFBUSxXQW9HcEIsQ0FBQTtBQUNMLENBQUMsRUFoSFMsU0FBUyxLQUFULFNBQVMsUUFnSGxCO0FDaEhELElBQVUsU0FBUyxDQXdGbEI7QUF4RkQsV0FBVSxTQUFTO0lBQ2Y7Ozs7Ozs7OztPQVNHO0lBQ0gsTUFBYSxXQUFZLFNBQVEsVUFBQSxJQUFJO1FBQ2pDO1lBQ0ksS0FBSyxFQUFFLENBQUM7WUFDUixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDbEIsQ0FBQztRQUVNLE1BQU07WUFDVCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUN0QyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUNwQyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQzFDLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDaEQsQ0FBQztRQUVTLGNBQWM7WUFDcEIsSUFBSSxRQUFRLEdBQWlCLElBQUksWUFBWSxDQUFDO2dCQUMxQyxRQUFRO2dCQUNSLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDL0QsTUFBTTtnQkFDTixLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNiLHdDQUF3QztnQkFDeEMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQ2xFLENBQUMsQ0FBQztZQUVILDBEQUEwRDtZQUMxRCxRQUFRLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztZQUM5QyxPQUFPLFFBQVEsQ0FBQztRQUNwQixDQUFDO1FBRVMsYUFBYTtZQUNuQixJQUFJLE9BQU8sR0FBZ0IsSUFBSSxXQUFXLENBQUM7Z0JBQ3ZDLFFBQVE7Z0JBQ1IsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNQLFFBQVE7Z0JBQ1IsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNQLE9BQU87Z0JBQ1AsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNQLE9BQU87Z0JBQ1AsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUNQLFNBQVM7Z0JBQ1QsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDO2FBQzNDLENBQUMsQ0FBQztZQUNILE9BQU8sT0FBTyxDQUFDO1FBQ25CLENBQUM7UUFFUyxnQkFBZ0I7WUFDdEIsSUFBSSxVQUFVLEdBQWlCLElBQUksWUFBWSxDQUFDO2dCQUM1QyxRQUFRO2dCQUNSLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDbkQsT0FBTztnQkFDUCxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ1osS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUcsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO2FBQ2xELENBQUMsQ0FBQztZQUNILE9BQU8sVUFBVSxDQUFDO1FBQ3RCLENBQUM7UUFFUyxpQkFBaUI7WUFDdkIsSUFBSSxPQUFPLEdBQWEsRUFBRSxDQUFDO1lBQzNCLElBQUksUUFBUSxHQUFjLEVBQUUsQ0FBQztZQUU3QixLQUFLLElBQUksQ0FBQyxHQUFXLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUM7Z0JBQ3BELFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxVQUFBLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUU3RixLQUFLLElBQUksQ0FBQyxHQUFXLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDckQsSUFBSSxNQUFNLEdBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25GLElBQUksRUFBRSxHQUFZLFVBQUEsT0FBTyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQy9FLElBQUksRUFBRSxHQUFZLFVBQUEsT0FBTyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQy9FLElBQUksTUFBTSxHQUFZLFVBQUEsT0FBTyxDQUFDLGFBQWEsQ0FBQyxVQUFBLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ25FLElBQUksS0FBSyxHQUFXLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2xDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUMxQixPQUFPLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQzlCLE9BQU8sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDOUIsOENBQThDO2FBQ2pEO1lBQ0QsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLE9BQU8sSUFBSSxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDckMsQ0FBQztLQUNKO0lBNUVZLHFCQUFXLGNBNEV2QixDQUFBO0FBQ0wsQ0FBQyxFQXhGUyxTQUFTLEtBQVQsU0FBUyxRQXdGbEI7QUN4RkQsSUFBVSxTQUFTLENBcURsQjtBQXJERCxXQUFVLFNBQVM7SUFDZjs7Ozs7Ozs7T0FRRztJQUNILE1BQWEsUUFBUyxTQUFRLFVBQUEsSUFBSTtRQUM5QjtZQUNJLEtBQUssRUFBRSxDQUFDO1lBQ1IsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2xCLENBQUM7UUFFTSxNQUFNO1lBQ1QsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDdEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDcEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUMxQyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQ2hELENBQUM7UUFFUyxjQUFjO1lBQ3BCLElBQUksUUFBUSxHQUFpQixJQUFJLFlBQVksQ0FBQztnQkFDMUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2FBQ2xFLENBQUMsQ0FBQztZQUVILFFBQVEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRTlDLE9BQU8sUUFBUSxDQUFDO1FBQ3BCLENBQUM7UUFDUyxhQUFhO1lBQ25CLElBQUksT0FBTyxHQUFnQixJQUFJLFdBQVcsQ0FBQztnQkFDdkMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2FBQ25CLENBQUMsQ0FBQztZQUNILE9BQU8sT0FBTyxDQUFDO1FBQ25CLENBQUM7UUFFUyxnQkFBZ0I7WUFDdEIsSUFBSSxVQUFVLEdBQWlCLElBQUksWUFBWSxDQUFDO2dCQUM1QyxRQUFRO2dCQUNSLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQzthQUNsRCxDQUFDLENBQUM7WUFDSCxPQUFPLFVBQVUsQ0FBQztRQUN0QixDQUFDO1FBRVMsaUJBQWlCO1lBQ3ZCLE9BQU8sSUFBSSxZQUFZLENBQUM7Z0JBQ3BCLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7YUFDN0QsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztLQUNKO0lBMUNZLGtCQUFRLFdBMENwQixDQUFBO0FBQ0wsQ0FBQyxFQXJEUyxTQUFTLEtBQVQsU0FBUyxRQXFEbEI7QUNyREQsSUFBVSxTQUFTLENBb2FsQjtBQXBhRCxXQUFVLFNBQVM7SUFLakI7OztPQUdHO0lBQ0gsTUFBYSxJQUFLLFNBQVEsV0FBVztRQWFuQzs7O1dBR0c7UUFDSCxZQUFtQixLQUFhO1lBQzlCLEtBQUssRUFBRSxDQUFDO1lBaEJILGFBQVEsR0FBYyxVQUFBLFNBQVMsQ0FBQyxRQUFRLENBQUM7WUFDekMsb0JBQWUsR0FBVyxDQUFDLENBQUM7WUFFM0IsV0FBTSxHQUFnQixJQUFJLENBQUMsQ0FBQywyQkFBMkI7WUFDdkQsYUFBUSxHQUFXLEVBQUUsQ0FBQyxDQUFDLDhDQUE4QztZQUNyRSxlQUFVLEdBQXlCLEVBQUUsQ0FBQztZQUM5QyxtSEFBbUg7WUFDbkgsNEdBQTRHO1lBQ3BHLGNBQVMsR0FBMkIsRUFBRSxDQUFDO1lBQ3ZDLGFBQVEsR0FBMkIsRUFBRSxDQUFDO1lBUTVDLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLENBQUM7UUFFRDs7V0FFRztRQUNJLFNBQVM7WUFDZCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDckIsQ0FBQztRQUVEOztXQUVHO1FBQ0ksV0FBVztZQUNoQixJQUFJLFFBQVEsR0FBUyxJQUFJLENBQUM7WUFDMUIsT0FBTyxRQUFRLENBQUMsU0FBUyxFQUFFO2dCQUN6QixRQUFRLEdBQUcsUUFBUSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ2xDLE9BQU8sUUFBUSxDQUFDO1FBQ2xCLENBQUM7UUFFRDs7V0FFRztRQUNILElBQVcsWUFBWTtZQUNyQixPQUEyQixJQUFJLENBQUMsYUFBYSxDQUFDLFVBQUEsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2RSxDQUFDO1FBQ0Q7OztXQUdHO1FBQ0gscUhBQXFIO1FBQ3JILHFDQUFxQztRQUNyQyxnRUFBZ0U7UUFDaEUsd0JBQXdCO1FBQ3hCLHFDQUFxQztRQUNyQyxXQUFXO1FBQ1gsdUJBQXVCO1FBQ3ZCLElBQUk7UUFFSixvQkFBb0I7UUFDcEI7O1dBRUc7UUFDSSxXQUFXO1lBQ2hCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEMsQ0FBQztRQUNEOzs7O1dBSUc7UUFDSSxpQkFBaUIsQ0FBQyxLQUFhO1lBQ3BDLElBQUksS0FBSyxHQUFXLEVBQUUsQ0FBQztZQUN2QixLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFXLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksS0FBSyxDQUFDLENBQUM7WUFDbkUsT0FBTyxLQUFLLENBQUM7UUFDZixDQUFDO1FBRUQ7Ozs7V0FJRztRQUNJLFdBQVcsQ0FBQyxLQUFXO1lBQzVCLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO2dCQUMvQixtQ0FBbUM7Z0JBQ25DLE9BQU87WUFFVCxJQUFJLFFBQVEsR0FBUyxJQUFJLENBQUM7WUFDMUIsT0FBTyxRQUFRLEVBQUU7Z0JBQ2YsSUFBSSxRQUFRLElBQUksS0FBSztvQkFDbkIsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLHdGQUF3RixDQUFDLENBQUMsQ0FBQzs7b0JBRTVHLFFBQVEsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO2FBQzlCO1lBRUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDMUIsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN0QixLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksS0FBSyxnQ0FBcUIsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3hFLENBQUM7UUFFRDs7O1dBR0c7UUFDSSxXQUFXLENBQUMsS0FBVztZQUM1QixJQUFJLEtBQUssR0FBVyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzFDLElBQUksS0FBSyxHQUFHLENBQUM7Z0JBQ1gsT0FBTztZQUVULEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxLQUFLLG1DQUFxQixFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdEUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQy9CLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEIsQ0FBQztRQUVEOzs7V0FHRztRQUNJLFNBQVMsQ0FBQyxLQUFXO1lBQzFCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUVEOzs7O1dBSUc7UUFDSSxZQUFZLENBQUMsUUFBYyxFQUFFLEtBQVc7WUFDN0MsSUFBSSxLQUFLLEdBQVcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM3QyxJQUFJLEtBQUssR0FBRyxDQUFDO2dCQUNYLE9BQU8sS0FBSyxDQUFDO1lBQ2YsSUFBSSxjQUFjLEdBQVMsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQzdDLElBQUksY0FBYztnQkFDaEIsY0FBYyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNwQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFDO1lBQzdCLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdEIsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBRUQ7O1dBRUc7UUFDSCxJQUFXLE1BQU07WUFDZixPQUFPLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQ25DLENBQUM7UUFFTSxTQUFTLENBQUMsZ0JBQXdCO1lBQ3ZDLE9BQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxJQUFJLGdCQUFnQixDQUFDLENBQUM7UUFDcEQsQ0FBQztRQUVEOzs7V0FHRztRQUNJLGNBQWMsQ0FBQyxRQUFpQjtZQUNyQyxJQUFJLFFBQVEsQ0FBQyxVQUFVLEVBQUU7Z0JBQ3ZCLEtBQUssSUFBSSxhQUFhLElBQUksUUFBUSxDQUFDLFVBQVUsRUFBRTtvQkFDN0MsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxFQUFFO3dCQUNsQyxJQUFJLGtCQUFrQixHQUFxQixRQUFRLENBQUMsVUFBVSxDQUFDO3dCQUMvRCxLQUFLLElBQUksQ0FBQyxJQUFJLGtCQUFrQixDQUFDLGFBQWEsQ0FBQyxFQUFFOzRCQUMvQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQ0FDdEMsSUFBSSxpQkFBaUIsR0FBYyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0NBQ3RFLElBQUksWUFBWSxHQUErQixrQkFBa0IsQ0FBQyxhQUFhLENBQUUsQ0FBQztnQ0FDbEYsSUFBSSx3QkFBd0IsR0FBcUIsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0NBQ2xFLEtBQUssSUFBSSxLQUFLLElBQUksd0JBQXdCLEVBQUUsRUFBSSwrQ0FBK0M7b0NBQzdGLElBQUksYUFBYSxHQUFxQix3QkFBd0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQ0FDdEUsaUJBQWlCLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2lDQUN6Qzs2QkFDRjt5QkFDRjtxQkFDRjtpQkFDRjthQUNGO1lBQ0QsSUFBSSxRQUFRLENBQUMsUUFBUSxFQUFFO2dCQUNyQixLQUFLLElBQUksQ0FBQyxHQUFXLENBQUMsRUFBRSxDQUFDLEdBQW1CLFFBQVEsQ0FBQyxRQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUMxRSxJQUFJLElBQUksR0FBbUMsUUFBUSxDQUFDLFFBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUUsQ0FBQyxJQUFJLENBQUM7b0JBQ2pGLElBQUksVUFBVSxHQUFXLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDdEQsS0FBSyxJQUFJLFNBQVMsSUFBSSxVQUFVLEVBQUU7d0JBQ2hDLFNBQVMsQ0FBQyxjQUFjLENBQTJCLFFBQVEsQ0FBQyxRQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztxQkFDckY7aUJBQ0Y7YUFDRjtRQUNILENBQUM7UUFDRCxhQUFhO1FBRWIscUJBQXFCO1FBQ3JCOztXQUVHO1FBQ0ksZ0JBQWdCO1lBQ3JCLElBQUksR0FBRyxHQUFnQixFQUFFLENBQUM7WUFDMUIsS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO2dCQUNoQyxHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7YUFDekM7WUFDRCxPQUFPLEdBQUcsQ0FBQztRQUNiLENBQUM7UUFFRDs7O1dBR0c7UUFDSSxhQUFhLENBQXNCLE1BQW1CO1lBQzNELE9BQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUQsQ0FBQztRQUNEOzs7V0FHRztRQUNJLFlBQVksQ0FBc0IsTUFBbUI7WUFDMUQsSUFBSSxJQUFJLEdBQWEsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEQsSUFBSSxJQUFJO2dCQUNOLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pCLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUVEOzs7V0FHRztRQUNJLFlBQVksQ0FBQyxVQUFxQjtZQUN2QyxJQUFJLFVBQVUsQ0FBQyxZQUFZLEVBQUUsSUFBSSxJQUFJO2dCQUNuQyxPQUFPO1lBQ1QsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxTQUFTO2dCQUNoRCxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2lCQUVoRCxJQUFJLFVBQVUsQ0FBQyxXQUFXO2dCQUN4QixNQUFNLElBQUksS0FBSyxDQUFDLCtFQUErRSxDQUFDLENBQUM7O2dCQUVqRyxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFFdEQsVUFBVSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM5QixVQUFVLENBQUMsYUFBYSxDQUFDLElBQUksS0FBSyxvQ0FBcUIsQ0FBQyxDQUFDO1FBQzNELENBQUM7UUFDRDs7OztXQUlHO1FBQ0ksZUFBZSxDQUFDLFVBQXFCO1lBQzFDLElBQUk7Z0JBQ0YsSUFBSSxnQkFBZ0IsR0FBZ0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3JFLElBQUksT0FBTyxHQUFXLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDM0QsSUFBSSxPQUFPLEdBQUcsQ0FBQztvQkFDYixPQUFPO2dCQUNULGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BDLFVBQVUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzlCLFVBQVUsQ0FBQyxhQUFhLENBQUMsSUFBSSxLQUFLLDBDQUF3QixDQUFDLENBQUM7YUFDN0Q7WUFBQyxNQUFNO2dCQUNOLE1BQU0sSUFBSSxLQUFLLENBQUMsK0JBQStCLFVBQVUsbUJBQW1CLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO2FBQzNGO1FBQ0gsQ0FBQztRQUNELGFBQWE7UUFFYix3QkFBd0I7UUFDakIsU0FBUztZQUNkLElBQUksYUFBYSxHQUFrQjtnQkFDakMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO2FBQ2hCLENBQUM7WUFFRixJQUFJLFVBQVUsR0FBa0IsRUFBRSxDQUFDO1lBQ25DLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDaEMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDdEIsS0FBSyxJQUFJLFNBQVMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUMzQyxnREFBZ0Q7b0JBQ2hELFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQSxVQUFVLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7aUJBQ3hEO2FBQ0Y7WUFDRCxhQUFhLENBQUMsWUFBWSxDQUFDLEdBQUcsVUFBVSxDQUFDO1lBRXpDLElBQUksUUFBUSxHQUFvQixFQUFFLENBQUM7WUFDbkMsS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUMvQixRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUEsVUFBVSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2FBQzVDO1lBQ0QsYUFBYSxDQUFDLFVBQVUsQ0FBQyxHQUFHLFFBQVEsQ0FBQztZQUVyQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksS0FBSyx3Q0FBdUIsQ0FBQyxDQUFDO1lBQ3JELE9BQU8sYUFBYSxDQUFDO1FBQ3ZCLENBQUM7UUFFTSxXQUFXLENBQUMsY0FBNkI7WUFDOUMsSUFBSSxDQUFDLElBQUksR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDO1lBQ2hDLGdEQUFnRDtZQUVoRCwrRUFBK0U7WUFDL0UsS0FBSyxJQUFJLElBQUksSUFBSSxjQUFjLENBQUMsVUFBVSxFQUFFO2dCQUMxQyxLQUFLLElBQUksbUJBQW1CLElBQUksY0FBYyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDL0QsSUFBSSxxQkFBcUIsR0FBeUIsVUFBQSxVQUFVLENBQUMsV0FBVyxDQUFDLG1CQUFtQixDQUFDLENBQUM7b0JBQzlGLElBQUksQ0FBQyxZQUFZLENBQUMscUJBQXFCLENBQUMsQ0FBQztpQkFDMUM7YUFDRjtZQUVELEtBQUssSUFBSSxlQUFlLElBQUksY0FBYyxDQUFDLFFBQVEsRUFBRTtnQkFDbkQsSUFBSSxpQkFBaUIsR0FBZSxVQUFBLFVBQVUsQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUM7Z0JBQzVFLElBQUksQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsQ0FBQzthQUNyQztZQUVELElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxLQUFLLDRDQUF5QixDQUFDLENBQUM7WUFDdkQsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBQ0QsYUFBYTtRQUViLGlCQUFpQjtRQUNqQjs7Ozs7O1dBTUc7UUFDSSxnQkFBZ0IsQ0FBQyxLQUFxQixFQUFFLFFBQXVCLEVBQUUsV0FBa0QsS0FBSztZQUM3SCxJQUFJLFFBQVEsRUFBRTtnQkFDWixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7b0JBQ3ZCLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUM1QixJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUNyQztpQkFDSTtnQkFDSCxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUM7b0JBQ3hCLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUM3QixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUN0QztRQUNILENBQUM7UUFDRDs7Ozs7V0FLRztRQUNJLGFBQWEsQ0FBQyxNQUFhO1lBQ2hDLElBQUksU0FBUyxHQUFXLEVBQUUsQ0FBQztZQUMzQixJQUFJLFFBQVEsR0FBUyxJQUFJLENBQUM7WUFDMUIseUJBQXlCO1lBQ3pCLE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7WUFDekUsNEZBQTRGO1lBQzVGLE9BQU8sUUFBUSxDQUFDLE1BQU07Z0JBQ3BCLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUU3QyxnQkFBZ0I7WUFDaEIsTUFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsWUFBWSxFQUFFLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUM7WUFDOUYsS0FBSyxJQUFJLENBQUMsR0FBVyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUN0RCxJQUFJLFFBQVEsR0FBUyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xDLE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLGVBQWUsRUFBRSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7Z0JBQ3BGLElBQUksUUFBUSxHQUFvQixRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ3JFLEtBQUssSUFBSSxPQUFPLElBQUksUUFBUTtvQkFDMUIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ25CO1lBRUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPO2dCQUNqQixPQUFPLElBQUksQ0FBQztZQUVkLGVBQWU7WUFDZixNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxZQUFZLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztZQUN4RixNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxlQUFlLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ2hGLElBQUksU0FBUyxHQUFvQixJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDbkUsS0FBSyxJQUFJLE9BQU8sSUFBSSxTQUFTO2dCQUMzQixPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFbEIsZUFBZTtZQUNmLE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLFlBQVksRUFBRSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO1lBQzdGLEtBQUssSUFBSSxDQUFDLEdBQVcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNqRCxJQUFJLFFBQVEsR0FBUyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xDLE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLGVBQWUsRUFBRSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7Z0JBQ3BGLElBQUksU0FBUyxHQUFlLFFBQVEsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbEUsS0FBSyxJQUFJLE9BQU8sSUFBSSxTQUFTO29CQUMzQixPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDbkI7WUFDRCxPQUFPLElBQUksQ0FBQyxDQUFDLHNFQUFzRTtRQUNyRixDQUFDO1FBQ0Q7Ozs7V0FJRztRQUNJLGNBQWMsQ0FBQyxNQUFhO1lBQ2pDLG1DQUFtQztZQUNuQyxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxZQUFZLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQztZQUM5RixNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ3pFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2QyxDQUFDO1FBRU8sdUJBQXVCLENBQUMsTUFBYTtZQUMzQyxxQkFBcUI7WUFDckIsTUFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsZUFBZSxFQUFFLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUNoRixJQUFJLFFBQVEsR0FBZSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDNUQsS0FBSyxJQUFJLE9BQU8sSUFBSSxRQUFRO2dCQUMxQixPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbEIseUNBQXlDO1lBQ3pDLHdEQUF3RDtZQUN4RCx1QkFBdUI7WUFDdkIsTUFBTTtZQUVOLG9CQUFvQjtZQUNwQixLQUFLLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQy9CLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUN2QztRQUNILENBQUM7UUFDRCxhQUFhO1FBRWI7OztXQUdHO1FBQ0ssU0FBUyxDQUFDLE9BQW9CO1lBQ3BDLElBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDO1FBQ3hCLENBQUM7UUFFTyxDQUFDLGtCQUFrQjtZQUN6QixNQUFNLElBQUksQ0FBQztZQUNYLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLFFBQVE7Z0JBQzdCLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7UUFDeEIsQ0FBQztLQUNGO0lBMVpZLGNBQUksT0EwWmhCLENBQUE7QUFDSCxDQUFDLEVBcGFTLFNBQVMsS0FBVCxTQUFTLFFBb2FsQjtBQ3BhRCxJQUFVLFNBQVMsQ0FPbEI7QUFQRCxXQUFVLFNBQVM7SUFDZjs7T0FFRztJQUNILE1BQWEsWUFBYSxTQUFRLFVBQUEsSUFBSTtRQUF0Qzs7WUFDVyxlQUFVLEdBQVcsU0FBUyxDQUFDO1FBQzFDLENBQUM7S0FBQTtJQUZZLHNCQUFZLGVBRXhCLENBQUE7QUFDTCxDQUFDLEVBUFMsU0FBUyxLQUFULFNBQVMsUUFPbEI7QUNQRCxJQUFVLFNBQVMsQ0F1RGxCO0FBdkRELFdBQVUsU0FBUztJQUNmOzs7T0FHRztJQUNILE1BQWEsb0JBQXFCLFNBQVEsVUFBQSxJQUFJO1FBSzFDLFlBQVksYUFBMkI7WUFDbkMsS0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQUM7WUFMbEMsd0RBQXdEO1lBQ3hELDZGQUE2RjtZQUNyRixhQUFRLEdBQVcsU0FBUyxDQUFDO1lBSWpDLElBQUksYUFBYTtnQkFDYixJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ2hDLENBQUM7UUFFRDs7V0FFRztRQUNJLEtBQUs7WUFDUixJQUFJLFFBQVEsR0FBK0IsVUFBQSxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM5RSxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3ZCLENBQUM7UUFFRCw4RkFBOEY7UUFDdkYsU0FBUztZQUNaLElBQUksYUFBYSxHQUFrQixLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDckQsYUFBYSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQ3ZDLE9BQU8sYUFBYSxDQUFDO1FBQ3pCLENBQUM7UUFFTSxXQUFXLENBQUMsY0FBNkI7WUFDNUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUNsQyxJQUFJLENBQUMsUUFBUSxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUM7WUFDeEMsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUVEOzs7V0FHRztRQUNLLEdBQUcsQ0FBQyxhQUEyQjtZQUNuQyw0RkFBNEY7WUFDNUYsSUFBSSxhQUFhLEdBQWtCLFVBQUEsVUFBVSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUN2RSx3Q0FBd0M7WUFDeEMsS0FBSyxJQUFJLElBQUksSUFBSSxhQUFhLEVBQUU7Z0JBQzVCLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ3RDLE1BQU07YUFDVDtZQUNELElBQUksQ0FBQyxRQUFRLEdBQUcsYUFBYSxDQUFDLFVBQVUsQ0FBQztZQUN6QyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksS0FBSyw0REFBaUMsQ0FBQyxDQUFDO1FBQ25FLENBQUM7S0FHSjtJQWpEWSw4QkFBb0IsdUJBaURoQyxDQUFBO0FBQ0wsQ0FBQyxFQXZEUyxTQUFTLEtBQVQsU0FBUyxRQXVEbEI7QUN2REQsSUFBVSxTQUFTLENBWWxCO0FBWkQsV0FBVSxTQUFTO0lBQ2YsTUFBYSxHQUFHO1FBS1osWUFBWSxhQUFzQixVQUFBLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFtQixVQUFBLE9BQU8sQ0FBQyxJQUFJLEVBQUUsRUFBRSxVQUFrQixDQUFDO1lBQ25HLElBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDO1lBQ3RCLElBQUksQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDO1lBQzVCLElBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDO1FBQzFCLENBQUM7S0FDSjtJQVZZLGFBQUcsTUFVZixDQUFBO0FBQ0wsQ0FBQyxFQVpTLFNBQVMsS0FBVCxTQUFTLFFBWWxCO0FDWkQsSUFBVSxTQUFTLENBWWxCO0FBWkQsV0FBVSxTQUFTO0lBQ2YsTUFBYSxNQUFNO1FBS2YsWUFBWSxRQUFjLElBQUksRUFBRSxRQUFnQixDQUFDLEVBQUUsV0FBbUIsQ0FBQztZQUNuRSxJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQztZQUNsQixJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQztZQUNsQixJQUFJLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQztRQUM1QixDQUFDO0tBQ0o7SUFWWSxnQkFBTSxTQVVsQixDQUFBO0FBQ0wsQ0FBQyxFQVpTLFNBQVMsS0FBVCxTQUFTLFFBWWxCO0FDWkQseUNBQXlDO0FBQ3pDLElBQVUsU0FBUyxDQTJibEI7QUE1YkQseUNBQXlDO0FBQ3pDLFdBQVUsU0FBUztJQWVmOzs7T0FHRztJQUNILE1BQU0sU0FBUztRQUlYLFlBQVksVUFBYTtZQUZqQixVQUFLLEdBQVcsQ0FBQyxDQUFDO1lBR3RCLElBQUksQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDO1FBQ2hDLENBQUM7UUFFTSxZQUFZO1lBQ2YsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQzFCLENBQUM7UUFFTSxlQUFlO1lBQ2xCLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNiLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN0QixDQUFDO1FBQ00sZUFBZTtZQUNsQixJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQztnQkFBRSxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDO1lBQ3JFLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNiLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN0QixDQUFDO0tBQ0o7SUFFRDs7OztPQUlHO0lBQ0gsTUFBc0IsYUFBYyxTQUFRLFVBQUEsY0FBYztRQVd0RCxpQkFBaUI7UUFDakI7OztXQUdHO1FBQ0ksTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFXO1lBQzdCLElBQUksYUFBYSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDO2dCQUM5QixPQUFPO1lBRVgsSUFBSSxXQUFXLEdBQXNCLEtBQUssQ0FBQyxZQUFZLENBQUMsVUFBQSxpQkFBaUIsQ0FBQyxDQUFDO1lBQzNFLElBQUksQ0FBQyxXQUFXO2dCQUNaLE9BQU87WUFFWCxJQUFJLE1BQU0sR0FBa0IsV0FBVyxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUM3RCxhQUFhLENBQUMsZUFBZSxDQUE4QixhQUFhLENBQUMsYUFBYSxFQUFFLE1BQU0sRUFBRSxhQUFhLENBQUMsYUFBYSxDQUFDLENBQUM7WUFFN0gsSUFBSSxJQUFJLEdBQVMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNoRCxhQUFhLENBQUMsZUFBZSxDQUFtQixhQUFhLENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxhQUFhLENBQUMsZUFBZSxDQUFDLENBQUM7WUFFaEgsSUFBSSxJQUFJLEdBQXlCLEtBQUssQ0FBQyxZQUFZLENBQUMsVUFBQSxhQUFhLENBQUUsQ0FBQyxJQUFJLENBQUM7WUFDekUsYUFBYSxDQUFDLGVBQWUsQ0FBc0IsYUFBYSxDQUFDLGFBQWEsRUFBRSxJQUFJLEVBQUUsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRW5ILElBQUksY0FBYyxHQUFtQixFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxrQ0FBa0M7WUFDbkgsYUFBYSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQ25ELENBQUM7UUFFRDs7OztXQUlHO1FBQ0ksTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFXO1lBQy9CLElBQUksS0FBSyxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDO2dCQUM5QyxPQUFPLEtBQUssQ0FBQztZQUNqQixLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssQ0FBQyxNQUFNO2dCQUN6QixJQUFJO29CQUNBLDJEQUEyRDtvQkFDM0QsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDL0I7Z0JBQUMsT0FBTyxFQUFFLEVBQUU7b0JBQ1QsVUFBQSxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUNqQjtZQUNMLE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFDRCxhQUFhO1FBRWIsbUJBQW1CO1FBQ25COzs7V0FHRztRQUNJLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBVztZQUNoQyxJQUFJLGNBQWMsR0FBbUIsYUFBYSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDcEUsSUFBSSxDQUFDLGNBQWM7Z0JBQ2YsT0FBTztZQUVYLGFBQWEsQ0FBQyxlQUFlLENBQThCLGFBQWEsQ0FBQyxhQUFhLEVBQUUsY0FBYyxDQUFDLE1BQU0sRUFBRSxhQUFhLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDNUksYUFBYSxDQUFDLGVBQWUsQ0FBbUIsYUFBYSxDQUFDLFdBQVcsRUFBRSxjQUFjLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUMvSCxhQUFhLENBQUMsZUFBZSxDQUFzQixhQUFhLENBQUMsYUFBYSxFQUFFLGNBQWMsQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRWxJLGFBQWEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFFRDs7O1dBR0c7UUFDSSxNQUFNLENBQUMsWUFBWSxDQUFDLEtBQVc7WUFDbEMsS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLENBQUMsTUFBTTtnQkFDekIsYUFBYSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2QyxDQUFDO1FBQ0QsYUFBYTtRQUViLG1CQUFtQjtRQUNuQjs7O1dBR0c7UUFDSSxNQUFNLENBQUMsVUFBVSxDQUFDLEtBQVc7WUFDaEMsSUFBSSxjQUFjLEdBQW1CLGFBQWEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3BFLElBQUksQ0FBQyxjQUFjO2dCQUNmLE9BQU87WUFFWCxJQUFJLFdBQVcsR0FBc0IsS0FBSyxDQUFDLFlBQVksQ0FBQyxVQUFBLGlCQUFpQixDQUFDLENBQUM7WUFFM0UsSUFBSSxNQUFNLEdBQWtCLFdBQVcsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDN0QsSUFBSSxNQUFNLEtBQUssY0FBYyxDQUFDLE1BQU0sRUFBRTtnQkFDbEMsYUFBYSxDQUFDLGVBQWUsQ0FBOEIsYUFBYSxDQUFDLGFBQWEsRUFBRSxjQUFjLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDNUksYUFBYSxDQUFDLGVBQWUsQ0FBOEIsYUFBYSxDQUFDLGFBQWEsRUFBRSxNQUFNLEVBQUUsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUM3SCxjQUFjLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQzthQUNsQztZQUVELElBQUksSUFBSSxHQUFTLFdBQVcsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDaEQsSUFBSSxJQUFJLEtBQUssY0FBYyxDQUFDLElBQUksRUFBRTtnQkFDOUIsYUFBYSxDQUFDLGVBQWUsQ0FBbUIsYUFBYSxDQUFDLFdBQVcsRUFBRSxjQUFjLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQztnQkFDL0gsYUFBYSxDQUFDLGVBQWUsQ0FBbUIsYUFBYSxDQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUUsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUNoSCxjQUFjLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQzthQUM5QjtZQUVELElBQUksSUFBSSxHQUF5QixDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsVUFBQSxhQUFhLENBQUMsQ0FBRSxDQUFDLElBQUksQ0FBQztZQUMzRSxJQUFJLElBQUksS0FBSyxjQUFjLENBQUMsSUFBSSxFQUFFO2dCQUM5QixhQUFhLENBQUMsZUFBZSxDQUFzQixhQUFhLENBQUMsYUFBYSxFQUFFLGNBQWMsQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUNsSSxhQUFhLENBQUMsZUFBZSxDQUFzQixhQUFhLENBQUMsYUFBYSxFQUFFLElBQUksRUFBRSxhQUFhLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQ25ILGNBQWMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO2FBQzlCO1FBQ0wsQ0FBQztRQUVEOzs7V0FHRztRQUNJLE1BQU0sQ0FBQyxZQUFZLENBQUMsS0FBVztZQUNsQyxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssQ0FBQyxNQUFNO2dCQUN6QixhQUFhLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7UUFDRCxhQUFhO1FBRWIsaUJBQWlCO1FBQ2pCOzs7O1dBSUc7UUFDSSxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQWdDO1lBQ3BELDhFQUE4RTtZQUM5RSxLQUFLLElBQUksS0FBSyxJQUFJLGFBQWEsQ0FBQyxhQUFhLEVBQUU7Z0JBQzNDLElBQUksWUFBWSxHQUFpQixLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQ3pELGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7YUFDMUQ7WUFDRCxZQUFZO1FBQ2hCLENBQUM7UUFDRCxhQUFhO1FBRWIsb0JBQW9CO1FBQ3BCOztXQUVHO1FBQ0ksTUFBTSxDQUFDLE1BQU07WUFDaEIsYUFBYSxDQUFDLGVBQWUsR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDbEQsYUFBYSxDQUFDLDRCQUE0QixFQUFFLENBQUM7UUFDakQsQ0FBQztRQUVEOzs7V0FHRztRQUNJLE1BQU0sQ0FBQyxLQUFLLENBQUMsU0FBZ0IsSUFBSTtZQUNwQyxhQUFhLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEUsYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsc0JBQXNCLENBQUMsZ0JBQWdCLEdBQUcsc0JBQXNCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUNoSCxDQUFDO1FBRUQ7O1dBRUc7UUFDSSxNQUFNLENBQUMsZ0JBQWdCLENBQUMsU0FBZ0IsSUFBSTtZQUMvQyxhQUFhLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxzQkFBc0IsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDakYsQ0FBQztRQUVEOzs7O1dBSUc7UUFDSSxNQUFNLENBQUMsVUFBVSxDQUFDLEtBQVcsRUFBRSxVQUEyQixFQUFFLFlBQXNCLGFBQWEsQ0FBQyxRQUFRO1lBQzNHLElBQUksU0FBUyxJQUFJLGFBQWEsQ0FBQyxRQUFRO2dCQUNuQyxhQUFhLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUVyQyxJQUFJLGNBQXlCLENBQUM7WUFFOUIsSUFBSSxPQUFPLEdBQWtCLEtBQUssQ0FBQyxZQUFZLENBQUMsVUFBQSxhQUFhLENBQUMsQ0FBQztZQUMvRCxJQUFJLE9BQU87Z0JBQ1AsY0FBYyxHQUFHLFVBQUEsU0FBUyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQzs7Z0JBRXpFLGNBQWMsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsMkNBQTJDO1lBRWhGLHlCQUF5QjtZQUN6QixJQUFJLFVBQVUsR0FBYyxVQUFBLFNBQVMsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLG9CQUFvQixFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBRXRHLFNBQVMsQ0FBQyxLQUFLLEVBQUUsY0FBYyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBRTdDLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxDQUFDLFdBQVcsRUFBRSxFQUFFO2dCQUNsQyxJQUFJLFNBQVMsR0FBUyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2hELGFBQWEsQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLFdBQVc7YUFDMUU7WUFFRCxVQUFBLFFBQVEsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDM0IsSUFBSSxjQUFjLElBQUksS0FBSyxDQUFDLFFBQVE7Z0JBQ2hDLFVBQUEsUUFBUSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUN2QyxDQUFDO1FBRUQsMkJBQTJCO1FBRTNCOzs7O1dBSUc7UUFDSSxNQUFNLENBQUMsb0JBQW9CLENBQUMsS0FBVyxFQUFFLFVBQTJCO1lBQ3ZFLGFBQWEsQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO1lBQy9CLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxVQUFBLGFBQWEsQ0FBQztnQkFDL0MsYUFBYSxDQUFDLGVBQWUsQ0FBOEIsYUFBYSxDQUFDLGFBQWEsRUFBRSxVQUFBLGFBQWEsRUFBRSxhQUFhLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDeEksYUFBYSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQzlFLGFBQWEsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ2pDLE9BQU8sYUFBYSxDQUFDLFdBQVcsQ0FBQztRQUNyQyxDQUFDO1FBRU0sTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFhLEVBQUUsWUFBMEIsRUFBRSxLQUFnQjtZQUNoRixJQUFJLElBQUksR0FBYSxFQUFFLENBQUM7WUFFeEIsS0FBSyxJQUFJLFVBQVUsSUFBSSxZQUFZLEVBQUU7Z0JBQ2pDLGFBQWEsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLHNCQUFzQixDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQy9GLHdGQUF3RjtnQkFDeEYsSUFBSSxJQUFJLEdBQWUsSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUN0RSxhQUFhLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLE1BQU0sRUFBRSxzQkFBc0IsQ0FBQyxJQUFJLEVBQUUsc0JBQXNCLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUN4SSxJQUFJLEtBQUssR0FBVyxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFFbEQsSUFBSSxPQUFPLEdBQVcsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO2dCQUN0RSxJQUFJLEdBQUcsR0FBVyxJQUFJLFVBQUEsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUUxRCxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ2xCO1lBRUQsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUdPLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBVyxFQUFFLGVBQTBCLEVBQUUsV0FBc0I7WUFDbkYsSUFBSSxVQUFVLEdBQW1CLGFBQWEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2hFLElBQUksQ0FBQyxVQUFVO2dCQUNYLE9BQU8sQ0FBQyxxQ0FBcUM7WUFFakQsSUFBSSxVQUFVLEdBQWtCLGFBQWEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNoRyxJQUFJLFFBQVEsR0FBZSxhQUFhLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDekYsSUFBSSxVQUFVLEdBQWlCLGFBQWEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNqRyxhQUFhLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLGVBQWUsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUN2RixDQUFDO1FBRU8sTUFBTSxDQUFDLGtCQUFrQixDQUFDLEtBQVcsRUFBRSxlQUEwQixFQUFFLFdBQXNCO1lBQzdGLHlCQUF5QjtZQUN6QixJQUFJLE1BQU0sR0FBaUIsYUFBYSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFFN0QsTUFBTSxXQUFXLEdBQXFCLGFBQWEsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUM3RSx5REFBeUQ7WUFDekQsYUFBYSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsc0JBQXNCLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ3BGLG1EQUFtRDtZQUNuRCxNQUFNLGVBQWUsR0FBVyxzQkFBc0IsQ0FBQyxpQkFBaUIsQ0FBQztZQUN6RSxhQUFhLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLHNCQUFzQixDQUFDLFdBQVcsRUFBRSxlQUFlLEVBQUUsc0JBQXNCLENBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUUzSSxvQkFBb0I7WUFFcEIsSUFBSSxVQUFVLEdBQW1CLGFBQWEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2hFLElBQUksQ0FBQyxVQUFVO2dCQUNYLE9BQU8sQ0FBQyxxQ0FBcUM7WUFFakQsSUFBSSxVQUFVLEdBQWUsRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBQyxDQUFDO1lBQ3RGLGFBQWEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBRTNDLElBQUksVUFBVSxHQUFrQixhQUFhLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDaEcsYUFBYSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsZUFBZSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ3pHLDZDQUE2QztZQUM3QywwRUFBMEU7UUFDOUUsQ0FBQztRQUVPLE1BQU0sQ0FBQyxpQkFBaUI7WUFDNUIsc0JBQXNCO1lBQ3RCLE1BQU0sa0JBQWtCLEdBQVcsYUFBYSxDQUFDLG9CQUFvQixFQUFFLENBQUMsS0FBSyxDQUFDO1lBQzlFLE1BQU0sbUJBQW1CLEdBQVcsYUFBYSxDQUFDLG9CQUFvQixFQUFFLENBQUMsTUFBTSxDQUFDO1lBQ2hGLE1BQU0sYUFBYSxHQUFpQixhQUFhLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ3ZFLGFBQWEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLHNCQUFzQixDQUFDLFVBQVUsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUVqRjtnQkFDSSxNQUFNLGNBQWMsR0FBVyxzQkFBc0IsQ0FBQyxLQUFLLENBQUM7Z0JBQzVELE1BQU0sTUFBTSxHQUFXLHNCQUFzQixDQUFDLElBQUksQ0FBQztnQkFDbkQsTUFBTSxJQUFJLEdBQVcsc0JBQXNCLENBQUMsYUFBYSxDQUFDO2dCQUMxRCxhQUFhLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FDekIsc0JBQXNCLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRSxjQUFjLEVBQUUsa0JBQWtCLEVBQUUsbUJBQW1CLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUN2SCxDQUFDO2dCQUVGLDBDQUEwQztnQkFDMUMsYUFBYSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsc0JBQXNCLENBQUMsVUFBVSxFQUFFLHNCQUFzQixDQUFDLGtCQUFrQixFQUFFLHNCQUFzQixDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM5SSxhQUFhLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxzQkFBc0IsQ0FBQyxVQUFVLEVBQUUsc0JBQXNCLENBQUMsY0FBYyxFQUFFLHNCQUFzQixDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUNqSixhQUFhLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxzQkFBc0IsQ0FBQyxVQUFVLEVBQUUsc0JBQXNCLENBQUMsY0FBYyxFQUFFLHNCQUFzQixDQUFDLGFBQWEsQ0FBQyxDQUFDO2FBQ3BKO1lBRUQsT0FBTyxhQUFhLENBQUM7UUFDekIsQ0FBQztRQUNELFlBQVk7UUFFWixrQ0FBa0M7UUFDbEM7O1dBRUc7UUFDSyxNQUFNLENBQUMsNEJBQTRCO1lBQ3ZDLHlGQUF5RjtZQUN6Rix3SEFBd0g7WUFDeEgsb0RBQW9EO1lBQ3BELElBQUk7WUFFSix5RkFBeUY7WUFDekYsSUFBSSwrQkFBK0IsR0FBd0UsQ0FBQyxlQUErQixFQUFFLEtBQVcsRUFBRSxJQUE2QixFQUFFLEVBQUU7Z0JBQ3ZMLCtDQUErQztnQkFDL0MsSUFBSSxRQUFRLEdBQVMsS0FBSyxDQUFDO2dCQUMzQixJQUFJLE1BQVksQ0FBQztnQkFDakIsT0FBTyxJQUFJLEVBQUU7b0JBQ1QsTUFBTSxHQUFHLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztvQkFDOUIsSUFBSSxDQUFDLE1BQU07d0JBQ1AsTUFBTTtvQkFDVixJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQzt3QkFDOUMsTUFBTTtvQkFDVixRQUFRLEdBQUcsTUFBTSxDQUFDO2lCQUNyQjtnQkFDRCx5REFBeUQ7Z0JBRXpELDJIQUEySDtnQkFDM0gsSUFBSSxNQUFNLEdBQWMsVUFBQSxTQUFTLENBQUMsUUFBUSxDQUFDO2dCQUMzQyxJQUFJLE1BQU07b0JBQ04sTUFBTSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7Z0JBRTdCLHFGQUFxRjtnQkFDckYsYUFBYSxDQUFDLHNDQUFzQyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUMzRSxDQUFDLENBQUM7WUFFRixvREFBb0Q7WUFDcEQsd0RBQXdEO1lBQ3hELGFBQWEsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLCtCQUErQixDQUFDLENBQUM7UUFDakUsQ0FBQztRQUVEOzs7OztXQUtHO1FBQ0ssTUFBTSxDQUFDLHNDQUFzQyxDQUFDLEtBQVcsRUFBRSxNQUFpQjtZQUNoRixJQUFJLEtBQUssR0FBYyxNQUFNLENBQUM7WUFDOUIsSUFBSSxZQUFZLEdBQXVCLEtBQUssQ0FBQyxZQUFZLENBQUM7WUFDMUQsSUFBSSxZQUFZO2dCQUNaLEtBQUssR0FBRyxVQUFBLFNBQVMsQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUVqRSxLQUFLLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztZQUN2QixLQUFLLENBQUMsZUFBZSxHQUFHLGFBQWEsQ0FBQyxlQUFlLENBQUM7WUFFdEQsS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLENBQUMsV0FBVyxFQUFFLEVBQUU7Z0JBQ25DLGFBQWEsQ0FBQyxzQ0FBc0MsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDdEU7UUFDTCxDQUFDO1FBQ0QsYUFBYTtRQUViLDJDQUEyQztRQUMzQzs7Ozs7V0FLRztRQUNLLE1BQU0sQ0FBQyxlQUFlLENBQXlCLEdBQTJDLEVBQUUsSUFBYSxFQUFFLFFBQWtCO1lBQ2pJLElBQUksU0FBbUMsQ0FBQztZQUN4QyxTQUFTLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMxQixJQUFJLFNBQVMsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLEVBQUU7Z0JBQ2xDLDJHQUEyRztnQkFDM0csdUVBQXVFO2dCQUN2RSxRQUFRLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7Z0JBQ25DLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDcEI7UUFDTCxDQUFDO1FBRUQ7Ozs7O1dBS0c7UUFDSyxNQUFNLENBQUMsZUFBZSxDQUF5QixHQUEyQyxFQUFFLElBQWEsRUFBRSxRQUFrQjtZQUNqSSxJQUFJLFNBQW1DLENBQUM7WUFDeEMsU0FBUyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDMUIsSUFBSSxTQUFTO2dCQUNULFNBQVMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztpQkFDM0I7Z0JBQ0QsSUFBSSxPQUFPLEdBQWtCLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDNUMsU0FBUyxHQUFHLElBQUksU0FBUyxDQUFnQixPQUFPLENBQUMsQ0FBQztnQkFDbEQsU0FBUyxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUM1QixHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQzthQUM1QjtRQUNMLENBQUM7O0lBeFlELCtHQUErRztJQUNoRywyQkFBYSxHQUFnRCxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ3RGLHlHQUF5RztJQUMxRix5QkFBVyxHQUFxQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ3pFLG9HQUFvRztJQUNyRiwyQkFBYSxHQUF3QyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQy9ELG1CQUFLLEdBQTRCLElBQUksR0FBRyxFQUFFLENBQUM7SUFQeEMsdUJBQWEsZ0JBMllsQyxDQUFBO0FBQ0wsQ0FBQyxFQTNiUyxTQUFTLEtBQVQsU0FBUyxRQTJibEI7QUM1YkQsdUNBQXVDO0FBQ3ZDLElBQVUsU0FBUyxDQWNsQjtBQWZELHVDQUF1QztBQUN2QyxXQUFVLFNBQVM7SUFDZjs7O09BR0c7SUFFRixrRkFBa0Y7SUFFbkYsTUFBYSxNQUFNO1FBQ2YsOEVBQThFO1FBQ3ZFLE1BQU0sQ0FBQyxPQUFPLEtBQWtCLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQztRQUM5QyxNQUFNLENBQUMscUJBQXFCLEtBQWEsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3ZELE1BQU0sQ0FBQyx1QkFBdUIsS0FBYSxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUM7S0FDbkU7SUFMWSxnQkFBTSxTQUtsQixDQUFBO0FBQ0wsQ0FBQyxFQWRTLFNBQVMsS0FBVCxTQUFTLFFBY2xCO0FDZkQsSUFBVSxTQUFTLENBNERsQjtBQTVERCxXQUFVLFNBQVM7SUFDZjs7O09BR0c7SUFDSCxNQUFhLFVBQVcsU0FBUSxVQUFBLE1BQU07UUFDM0IsTUFBTSxDQUFDLE9BQU87WUFDakIsT0FBTyxVQUFBLFdBQVcsQ0FBQztRQUN2QixDQUFDO1FBRU0sTUFBTSxDQUFDLHFCQUFxQjtZQUMvQixPQUFPOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3NCQWtDRyxDQUFDO1FBQ2YsQ0FBQztRQUNNLE1BQU0sQ0FBQyx1QkFBdUI7WUFDakMsT0FBTzs7Ozs7Ozs7O3NCQVNHLENBQUM7UUFDZixDQUFDO0tBQ0o7SUF0RFksb0JBQVUsYUFzRHRCLENBQUE7QUFDTCxDQUFDLEVBNURTLFNBQVMsS0FBVCxTQUFTLFFBNERsQjtBQzNERCxJQUFVLFNBQVMsQ0E0RGxCO0FBNURELFdBQVUsU0FBUztJQUNmOzs7O09BSUc7SUFDSCxNQUFhLFlBQWEsU0FBUSxVQUFBLE1BQU07UUFDN0IsTUFBTSxDQUFDLE9BQU87WUFDakIsT0FBTyxVQUFBLFVBQVUsQ0FBQztRQUN0QixDQUFDO1FBRU0sTUFBTSxDQUFDLHFCQUFxQjtZQUMvQixPQUFPOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7c0JBMkJHLENBQUM7UUFDZixDQUFDO1FBQ00sTUFBTSxDQUFDLHVCQUF1QjtZQUNqQyxPQUFPOzs7Ozs7Ozs7Ozs7Ozs7c0JBZUcsQ0FBQztRQUNmLENBQUM7S0FDSjtJQXJEWSxzQkFBWSxlQXFEeEIsQ0FBQTtBQUNMLENBQUMsRUE1RFMsU0FBUyxLQUFULFNBQVMsUUE0RGxCO0FDN0RELElBQVUsU0FBUyxDQWdDbEI7QUFoQ0QsV0FBVSxTQUFTO0lBQ2Y7OztPQUdHO0lBQ0gsTUFBYSxhQUFjLFNBQVEsVUFBQSxNQUFNO1FBQzlCLE1BQU0sQ0FBQyxxQkFBcUI7WUFDL0IsT0FBTzs7Ozs7OztzQkFPRyxDQUFDO1FBQ2YsQ0FBQztRQUNNLE1BQU0sQ0FBQyx1QkFBdUI7WUFDakMsT0FBTzs7Ozs7Ozs7Ozs7O3NCQVlHLENBQUM7UUFDZixDQUFDO0tBQ0o7SUExQlksdUJBQWEsZ0JBMEJ6QixDQUFBO0FBQ0wsQ0FBQyxFQWhDUyxTQUFTLEtBQVQsU0FBUyxRQWdDbEI7QUNoQ0QsSUFBVSxTQUFTLENBcUNsQjtBQXJDRCxXQUFVLFNBQVM7SUFDZjs7O09BR0c7SUFDSCxNQUFhLGFBQWMsU0FBUSxVQUFBLE1BQU07UUFDOUIsTUFBTSxDQUFDLE9BQU87WUFDakIsT0FBTyxVQUFBLFlBQVksQ0FBQztRQUN4QixDQUFDO1FBRU0sTUFBTSxDQUFDLHFCQUFxQjtZQUMvQixPQUFPOzs7Ozs7Ozs7OztrQkFXRCxDQUFDO1FBQ1gsQ0FBQztRQUNNLE1BQU0sQ0FBQyx1QkFBdUI7WUFDakMsT0FBTzs7Ozs7Ozs7O2NBU0wsQ0FBQztRQUNQLENBQUM7S0FDSjtJQS9CWSx1QkFBYSxnQkErQnpCLENBQUE7QUFDTCxDQUFDLEVBckNTLFNBQVMsS0FBVCxTQUFTLFFBcUNsQjtBQ3JDRCxJQUFVLFNBQVMsQ0FnQ2xCO0FBaENELFdBQVUsU0FBUztJQUNmOzs7T0FHRztJQUNILE1BQWEsY0FBZSxTQUFRLFVBQUEsTUFBTTtRQUMvQixNQUFNLENBQUMsT0FBTztZQUNqQixPQUFPLFVBQUEsV0FBVyxDQUFDO1FBQ3ZCLENBQUM7UUFFTSxNQUFNLENBQUMscUJBQXFCO1lBQy9CLE9BQU87Ozs7Ozs7c0JBT0csQ0FBQztRQUNmLENBQUM7UUFDTSxNQUFNLENBQUMsdUJBQXVCO1lBQ2pDLE9BQU87Ozs7Ozs7O3NCQVFHLENBQUM7UUFDZixDQUFDO0tBQ0o7SUExQlksd0JBQWMsaUJBMEIxQixDQUFBO0FBQ0wsQ0FBQyxFQWhDUyxTQUFTLEtBQVQsU0FBUyxRQWdDbEI7QUNoQ0QsSUFBVSxTQUFTLENBOEJsQjtBQTlCRCxXQUFVLFNBQVM7SUFDZjs7O09BR0c7SUFDSCxNQUFzQixPQUFRLFNBQVEsVUFBQSxPQUFPO1FBQy9CLGFBQWEsS0FBZSxDQUFDO0tBQzFDO0lBRnFCLGlCQUFPLFVBRTVCLENBQUE7SUFFRDs7T0FFRztJQUNILE1BQWEsWUFBYSxTQUFRLE9BQU87UUFBekM7O1lBQ1csVUFBSyxHQUFxQixJQUFJLENBQUM7UUFDMUMsQ0FBQztLQUFBO0lBRlksc0JBQVksZUFFeEIsQ0FBQTtJQUNEOztPQUVHO0lBQ0gsTUFBYSxhQUFjLFNBQVEsT0FBTztLQUN6QztJQURZLHVCQUFhLGdCQUN6QixDQUFBO0lBQ0Q7O09BRUc7SUFDSCxNQUFhLGFBQWMsU0FBUSxhQUFhO0tBQy9DO0lBRFksdUJBQWEsZ0JBQ3pCLENBQUE7SUFDRDs7T0FFRztJQUNILE1BQWEsV0FBWSxTQUFRLGFBQWE7S0FDN0M7SUFEWSxxQkFBVyxjQUN2QixDQUFBO0FBQ0wsQ0FBQyxFQTlCUyxTQUFTLEtBQVQsU0FBUyxRQThCbEI7QUM5QkQsSUFBVSxTQUFTLENBZ1BsQjtBQWhQRCxXQUFVLFNBQVM7SUFDZixJQUFLLFVBR0o7SUFIRCxXQUFLLFVBQVU7UUFDWCxtREFBUSxDQUFBO1FBQ1IsaURBQU8sQ0FBQTtJQUNYLENBQUMsRUFISSxVQUFVLEtBQVYsVUFBVSxRQUdkO0lBTUQsTUFBTSxLQUFLO1FBVVAsWUFBWSxLQUFXLEVBQUUsS0FBaUIsRUFBRSxTQUFtQixFQUFFLFFBQWdCLEVBQUUsVUFBb0I7WUFDbkcsSUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7WUFDbEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUM7WUFDeEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUM7WUFDNUIsSUFBSSxDQUFDLGFBQWEsR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDdkMsSUFBSSxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUM7WUFFMUIsSUFBSSxLQUFLLEdBQVcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUUvQyxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUNSLHlDQUF5QztnQkFDekMsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7Z0JBQ3BCLE9BQU87YUFDVjtZQUVELElBQUksRUFBVSxDQUFDO1lBQ2YsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztZQUV4QyxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksVUFBVSxDQUFDLE9BQU8sRUFBRTtnQkFDakMsSUFBSSxRQUFRLEdBQWEsR0FBUyxFQUFFO29CQUNoQyxLQUFLLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUN2QyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQzFCLENBQUMsQ0FBQztnQkFDRixFQUFFLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2FBQ3REOztnQkFFRyxFQUFFLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUVyRSxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztZQUNiLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBQ3ZCLENBQUM7UUFFTSxLQUFLO1lBQ1IsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLFVBQVUsQ0FBQyxPQUFPLEVBQUU7Z0JBQ2pDLElBQUksSUFBSSxDQUFDLE1BQU07b0JBQ1gsNERBQTREO29CQUM1RCxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDcEcsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDaEM7O2dCQUVHLGtIQUFrSDtnQkFDbEgsTUFBTSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDbEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDeEIsQ0FBQztLQUNKO0lBRUQ7Ozs7T0FJRztJQUNILE1BQWEsSUFBSyxTQUFRLFdBQVc7UUFTakM7WUFDSSxLQUFLLEVBQUUsQ0FBQztZQUpKLFdBQU0sR0FBVyxFQUFFLENBQUM7WUFDcEIsZ0JBQVcsR0FBVyxDQUFDLENBQUM7WUFJNUIsSUFBSSxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDL0IsSUFBSSxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUM7WUFDakIsSUFBSSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7WUFDbEIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEdBQUcsQ0FBQztRQUNqQyxDQUFDO1FBRUQ7O1dBRUc7UUFDSSxNQUFNLEtBQUssSUFBSTtZQUNsQixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDekIsQ0FBQztRQUVEOztXQUVHO1FBQ0ksR0FBRztZQUNOLE9BQU8sSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN2RSxDQUFDO1FBRUQ7OztXQUdHO1FBQ0ksR0FBRyxDQUFDLFFBQWdCLENBQUM7WUFDeEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7WUFDcEIsSUFBSSxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDL0IsSUFBSSxDQUFDLDJCQUEyQixFQUFFLENBQUM7UUFDdkMsQ0FBQztRQUVEOzs7V0FHRztRQUNJLFFBQVEsQ0FBQyxTQUFpQixHQUFHO1lBQ2hDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDckIsSUFBSSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUM7WUFDcEIscUJBQXFCO1lBQ3JCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ3hCLElBQUksQ0FBQywyQkFBMkIsRUFBRSxDQUFDO1lBQ25DLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxLQUFLLGdDQUFtQixDQUFDLENBQUM7UUFDckQsQ0FBQztRQUVEOztXQUVHO1FBQ0ksUUFBUTtZQUNYLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN0QixDQUFDO1FBRUQ7O1dBRUc7UUFDSSxTQUFTO1lBQ2QsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3JCLENBQUM7UUFFRDs7O1dBR0c7UUFDSSwyQkFBMkI7WUFDOUIsSUFBSSxPQUFPLEdBQVcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ2pDLElBQUksT0FBTyxHQUFXLE9BQU8sR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUM7WUFDdkQsSUFBSSxDQUFDLGlCQUFpQixHQUFHLE9BQU8sQ0FBQztZQUNqQyxPQUFPLE9BQU8sQ0FBQztRQUNuQixDQUFDO1FBRUQsZ0JBQWdCO1FBQ2hCLCtEQUErRDtRQUMvRDs7Ozs7V0FLRztRQUNJLFVBQVUsQ0FBQyxTQUFtQixFQUFFLFFBQWdCLEVBQUUsR0FBRyxVQUFvQjtZQUM1RSxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQzlFLENBQUM7UUFDRDs7Ozs7V0FLRztRQUNJLFdBQVcsQ0FBQyxTQUFtQixFQUFFLFFBQWdCLEVBQUUsR0FBRyxVQUFvQjtZQUM3RSxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQy9FLENBQUM7UUFDRDs7O1dBR0c7UUFDSSxZQUFZLENBQUMsR0FBVztZQUMzQixJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzFCLENBQUM7UUFDRDs7O1dBR0c7UUFDSSxhQUFhLENBQUMsR0FBVztZQUM1QixJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzFCLENBQUM7UUFFRDs7V0FFRztRQUNJLGNBQWM7WUFDakIsS0FBSyxJQUFJLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUN4QixJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQ2hDO1FBQ0wsQ0FBQztRQUVEOztXQUVHO1FBQ0ksZ0JBQWdCO1lBQ25CLEtBQUssSUFBSSxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDeEIsSUFBSSxLQUFLLEdBQVUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDbkMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNkLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSztvQkFDWCxzREFBc0Q7b0JBQ3RELFNBQVM7Z0JBRWIsSUFBSSxPQUFPLEdBQVcsS0FBSyxDQUFDLE9BQU8sQ0FBQztnQkFDcEMsd0RBQXdEO2dCQUN4RCw4RUFBOEU7Z0JBQzlFLCtFQUErRTtnQkFDL0UsSUFBSSxPQUFPLEdBQVUsSUFBSSxLQUFLLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUMzRixJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQzthQUM3QjtRQUNMLENBQUM7UUFFRDs7O1dBR0c7UUFDSSx1QkFBdUIsQ0FBQyxHQUFXO1lBQ3RDLEtBQUssSUFBSSxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDeEIsSUFBSSxLQUFLLEdBQVUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDbkMsSUFBSSxLQUFLLENBQUMsRUFBRSxJQUFJLEdBQUcsRUFBRTtvQkFDakIsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUNkLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDMUI7YUFDSjtRQUNMLENBQUM7UUFFTyxRQUFRLENBQUMsS0FBaUIsRUFBRSxTQUFtQixFQUFFLFFBQWdCLEVBQUUsVUFBb0I7WUFDM0YsSUFBSSxLQUFLLEdBQVUsSUFBSSxLQUFLLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQzNFLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsS0FBSyxDQUFDO1lBQ3hDLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUM1QixDQUFDO1FBRU8sV0FBVyxDQUFDLEdBQVc7WUFDM0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUN6QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDNUIsQ0FBQzs7SUFyS2MsYUFBUSxHQUFTLElBQUksSUFBSSxFQUFFLENBQUM7SUFEbEMsY0FBSSxPQXdLaEIsQ0FBQTtBQUNMLENBQUMsRUFoUFMsU0FBUyxLQUFULFNBQVMsUUFnUGxCO0FDaFBELHdDQUF3QztBQUN4QyxzQ0FBc0M7QUFDdEMsSUFBVSxTQUFTLENBOElsQjtBQWhKRCx3Q0FBd0M7QUFDeEMsc0NBQXNDO0FBQ3RDLFdBQVUsU0FBUztJQUNmLElBQVksU0FPWDtJQVBELFdBQVksU0FBUztRQUNqQiw2REFBNkQ7UUFDN0QsMkNBQThCLENBQUE7UUFDOUIsNERBQTREO1FBQzVELG1DQUFzQixDQUFBO1FBQ3RCLHFGQUFxRjtRQUNyRixtQ0FBc0IsQ0FBQTtJQUMxQixDQUFDLEVBUFcsU0FBUyxHQUFULG1CQUFTLEtBQVQsbUJBQVMsUUFPcEI7SUFDRDs7O09BR0c7SUFDSCxNQUFhLElBQUssU0FBUSxVQUFBLGlCQUFpQjtRQXNCdkM7Ozs7O1dBS0c7UUFDSSxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQW1CLFNBQVMsQ0FBQyxhQUFhLEVBQUUsT0FBZSxFQUFFLEVBQUUsMEJBQW1DLEtBQUs7WUFDdkgsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBRVosSUFBSSxDQUFDLGFBQWEsR0FBRyxVQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDckMsSUFBSSxDQUFDLGFBQWEsR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDdkMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7WUFDNUMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7WUFDNUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLEtBQUssSUFBSSxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ2pFLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztZQUN2QyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1lBQy9FLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO1lBQ2xCLElBQUksQ0FBQyxzQkFBc0IsR0FBRyx1QkFBdUIsQ0FBQztZQUV0RCxJQUFJLEdBQUcsR0FBVyx5QkFBeUIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3ZELElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxTQUFTLENBQUMsYUFBYTtnQkFDcEMsR0FBRyxJQUFJLG1CQUFtQixJQUFJLE1BQU0sQ0FBQztZQUN6QyxVQUFBLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFZixRQUFRLEtBQUssRUFBRTtnQkFDWCxLQUFLLFNBQVMsQ0FBQyxhQUFhO29CQUN4QixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7b0JBQ2pCLE1BQU07Z0JBQ1YsS0FBSyxTQUFTLENBQUMsU0FBUztvQkFDcEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDN0UsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO29CQUNoQixNQUFNO2dCQUNWLEtBQUssU0FBUyxDQUFDLFNBQVM7b0JBQ3BCLElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBQSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBQ2hGLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztvQkFDaEIsTUFBTTtnQkFDVjtvQkFDSSxNQUFNO2FBQ2I7WUFFRCxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztRQUN4QixDQUFDO1FBRUQ7O1dBRUc7UUFDSSxNQUFNLENBQUMsSUFBSTtZQUNkLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTztnQkFDYixPQUFPO1lBRVgsUUFBUSxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNmLEtBQUssU0FBUyxDQUFDLGFBQWE7b0JBQ3hCLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQzVDLE1BQU07Z0JBQ1YsS0FBSyxTQUFTLENBQUMsU0FBUztvQkFDcEIsTUFBTSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7b0JBQ3ZDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQzVDLE1BQU07Z0JBQ1YsS0FBSyxTQUFTLENBQUMsU0FBUztvQkFDcEIsbUVBQW1FO29CQUNuRSxVQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztvQkFDMUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFDNUMsTUFBTTtnQkFDVjtvQkFDSSxNQUFNO2FBQ2I7WUFFRCxVQUFBLEtBQUssQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDL0IsQ0FBQztRQUVNLE1BQU0sQ0FBQyxpQkFBaUI7WUFDM0IsT0FBTyxJQUFJLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDO1FBQzVDLENBQUM7UUFDTSxNQUFNLENBQUMsaUJBQWlCO1lBQzNCLE9BQU8sSUFBSSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQztRQUM1QyxDQUFDO1FBRU8sTUFBTSxDQUFDLElBQUk7WUFDZixJQUFJLElBQVksQ0FBQztZQUNqQixJQUFJLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ3pCLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztZQUNuRCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO1lBRTlCLElBQUksR0FBRyxVQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDdkIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDO1lBQ25ELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7WUFFOUIsSUFBSSxDQUFDLG9CQUFvQixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQztZQUNqSSxJQUFJLENBQUMsb0JBQW9CLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDO1lBRWpJLElBQUksS0FBSyxHQUFVLElBQUksS0FBSyw4QkFBa0IsQ0FBQztZQUMvQyxJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMzQyxDQUFDO1FBRU8sTUFBTSxDQUFDLFNBQVM7WUFDcEIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ1osSUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2xFLENBQUM7UUFFTyxNQUFNLENBQUMsUUFBUTtZQUNuQixJQUFJLElBQUksQ0FBQyxzQkFBc0I7Z0JBQzNCLElBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzs7Z0JBRXpELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNwQixDQUFDOztJQTdIRCxtRUFBbUU7SUFDckQsa0JBQWEsR0FBVyxDQUFDLENBQUM7SUFDeEMsbUVBQW1FO0lBQ3JELGtCQUFhLEdBQVcsQ0FBQyxDQUFDO0lBQ3hDLHFEQUFxRDtJQUN2QyxrQkFBYSxHQUFXLENBQUMsQ0FBQztJQUN4QyxxREFBcUQ7SUFDdkMsa0JBQWEsR0FBVyxDQUFDLENBQUM7SUFFekIsc0JBQWlCLEdBQVcsQ0FBQyxDQUFDO0lBQzlCLHNCQUFpQixHQUFXLENBQUMsQ0FBQztJQUM5Qix5QkFBb0IsR0FBVyxDQUFDLENBQUM7SUFDakMseUJBQW9CLEdBQVcsQ0FBQyxDQUFDO0lBQ2pDLFlBQU8sR0FBWSxLQUFLLENBQUM7SUFDekIsU0FBSSxHQUFjLFNBQVMsQ0FBQyxhQUFhLENBQUM7SUFDMUMsZ0JBQVcsR0FBVyxDQUFDLENBQUM7SUFDeEIsY0FBUyxHQUFXLENBQUMsQ0FBQztJQUN0QixlQUFVLEdBQVcsRUFBRSxDQUFDO0lBQ3hCLG9CQUFlLEdBQVcsRUFBRSxDQUFDO0lBQzdCLDJCQUFzQixHQUFZLEtBQUssQ0FBQztJQXBCOUMsY0FBSSxPQStIaEIsQ0FBQTtBQUVMLENBQUMsRUE5SVMsU0FBUyxLQUFULFNBQVMsUUE4SWxCO0FDaEpELElBQVUsU0FBUyxDQWdFbEI7QUFoRUQsV0FBVSxTQUFTO0lBSWY7OztPQUdHO0lBQ0gsTUFBYSxrQkFBbUIsU0FBUSxVQUFBLGlCQUFpQjtRQUVyRCw4RkFBOEY7UUFDdkYsTUFBTSxDQUFDLElBQUk7WUFDZCxrQkFBa0IsQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM5RCxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQztZQUMxQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztZQUM1QyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztZQUMxQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLGtCQUFrQixDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDNUYsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDdkQsa0JBQWtCLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3hDLENBQUM7UUFFRCw4RkFBOEY7UUFDdkYsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUE2QjtZQUM1QyxLQUFLLElBQUksUUFBUSxJQUFJLE9BQU8sRUFBRTtnQkFDMUIsSUFBSSxPQUFPLEdBQVcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUN4QyxJQUFJLElBQUksR0FBUyxJQUFJLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxDQUFDLENBQUM7Z0JBQzdELElBQUksR0FBRyxHQUFXLE1BQU0sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNuRCxzQ0FBc0M7Z0JBQ3RDLElBQUksVUFBNkIsQ0FBQztnQkFDbEMsVUFBVSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3pDLFVBQVUsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUNyQyxVQUFVLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDOUMsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3RDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDbkIsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3RDLE1BQU0sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ25DO1lBRUQsSUFBSSxLQUFLLEdBQWdCLElBQUksV0FBVywrQkFBbUIsRUFBRSxNQUFNLEVBQUUsRUFBRSxvQkFBb0IsRUFBRSxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDMUcsa0JBQWtCLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN6RCxDQUFDO1FBRU0sTUFBTSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFhO1lBQzlDLE9BQU8sQ0FBQyxHQUFHLENBQUMsbURBQW1ELENBQUMsQ0FBQztZQUNqRSxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN2RCxJQUFJLFFBQVEsR0FBZ0MsTUFBTSxDQUFDLE1BQU8sQ0FBQyxLQUFLLENBQUM7WUFDakUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3ZDLElBQUksUUFBUSxDQUFDLE1BQU0sSUFBSSxDQUFDO2dCQUNwQixPQUFPO1lBRVgsSUFBSSxNQUFNLEdBQXlCLEVBQUUsQ0FBQztZQUN0QyxNQUFNLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFFckQsSUFBSSxLQUFLLEdBQWdCLElBQUksV0FBVyxpQ0FBb0IsRUFBRSxNQUFNLEVBQUUsRUFBRSxvQkFBb0IsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDMUcsa0JBQWtCLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN6RCxDQUFDO1FBRU0sTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBbUIsRUFBRSxPQUE2QjtZQUM1RSxLQUFLLElBQUksSUFBSSxJQUFJLFNBQVMsRUFBRTtnQkFDeEIsTUFBTSxPQUFPLEdBQVcsTUFBTSxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDeEQsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUM7YUFDaEM7UUFDTCxDQUFDO0tBQ0o7SUF2RFksNEJBQWtCLHFCQXVEOUIsQ0FBQTtBQUNMLENBQUMsRUFoRVMsU0FBUyxLQUFULFNBQVMsUUFnRWxCIiwic291cmNlc0NvbnRlbnQiOlsibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLWFueVxyXG4gICAgZXhwb3J0IHR5cGUgR2VuZXJhbCA9IGFueTtcclxuXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIFNlcmlhbGl6YXRpb24ge1xyXG4gICAgICAgIFt0eXBlOiBzdHJpbmddOiBHZW5lcmFsO1xyXG4gICAgfVxyXG4gICAgZXhwb3J0IGludGVyZmFjZSBTZXJpYWxpemFibGUge1xyXG4gICAgICAgIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemF0aW9uO1xyXG4gICAgICAgIGRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uKTogU2VyaWFsaXphYmxlO1xyXG4gICAgfVxyXG5cclxuICAgIGludGVyZmFjZSBOYW1lc3BhY2VSZWdpc3RlciB7XHJcbiAgICAgICAgW25hbWU6IHN0cmluZ106IE9iamVjdDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhhbmRsZXMgdGhlIGV4dGVybmFsIHNlcmlhbGl6YXRpb24gYW5kIGRlc2VyaWFsaXphdGlvbiBvZiBbW1NlcmlhbGl6YWJsZV1dIG9iamVjdHMuIFRoZSBpbnRlcm5hbCBwcm9jZXNzIGlzIGhhbmRsZWQgYnkgdGhlIG9iamVjdHMgdGhlbXNlbHZlcy4gIFxyXG4gICAgICogQSBbW1NlcmlhbGl6YXRpb25dXSBvYmplY3QgY2FuIGJlIGNyZWF0ZWQgZnJvbSBhIFtbU2VyaWFsaXphYmxlXV0gb2JqZWN0IGFuZCBhIEpTT04tU3RyaW5nIG1heSBiZSBjcmVhdGVkIGZyb20gdGhhdC4gIFxyXG4gICAgICogVmljZSB2ZXJzYSwgYSBKU09OLVN0cmluZyBjYW4gYmUgcGFyc2VkIHRvIGEgW1tTZXJpYWxpemF0aW9uXV0gd2hpY2ggY2FuIGJlIGRlc2VyaWFsaXplZCB0byBhIFtbU2VyaWFsaXphYmxlXV0gb2JqZWN0LlxyXG4gICAgICogYGBgcGxhaW50ZXh0XHJcbiAgICAgKiAgW1NlcmlhbGl6YWJsZV0g4oaSIChzZXJpYWxpemUpIOKGkiBbU2VyaWFsaXphdGlvbl0g4oaSIChzdHJpbmdpZnkpICBcclxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDihpNcclxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtTdHJpbmddXHJcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4oaTXHJcbiAgICAgKiAgW1NlcmlhbGl6YWJsZV0g4oaQIChkZXNlcmlhbGl6ZSkg4oaQIFtTZXJpYWxpemF0aW9uXSDihpAgKHBhcnNlKVxyXG4gICAgICogYGBgICAgICAgXHJcbiAgICAgKiBXaGlsZSB0aGUgaW50ZXJuYWwgc2VyaWFsaXplL2Rlc2VyaWFsaXplIG1ldGhvZHMgb2YgdGhlIG9iamVjdHMgY2FyZSBvZiB0aGUgc2VsZWN0aW9uIG9mIGluZm9ybWF0aW9uIG5lZWRlZCB0byByZWNyZWF0ZSB0aGUgb2JqZWN0IGFuZCBpdHMgc3RydWN0dXJlLCAgXHJcbiAgICAgKiB0aGUgW1tTZXJpYWxpemVyXV0ga2VlcHMgdHJhY2sgb2YgdGhlIG5hbWVzcGFjZXMgYW5kIGNsYXNzZXMgaW4gb3JkZXIgdG8gcmVjcmVhdGUgW1tTZXJpYWxpemFibGVdXSBvYmplY3RzLiBUaGUgZ2VuZXJhbCBzdHJ1Y3R1cmUgb2YgYSBbW1NlcmlhbGl6YXRpb25dXSBpcyBhcyBmb2xsb3dzICBcclxuICAgICAqIGBgYHBsYWludGV4dFxyXG4gICAgICoge1xyXG4gICAgICogICAgICBuYW1lc3BhY2VOYW1lLmNsYXNzTmFtZToge1xyXG4gICAgICogICAgICAgICAgcHJvcGVydHlOYW1lOiBwcm9wZXJ0eVZhbHVlLFxyXG4gICAgICogICAgICAgICAgLi4uLFxyXG4gICAgICogICAgICAgICAgcHJvcGVydHlOYW1lT2ZSZWZlcmVuY2U6IFNlcmlhbGl6YXRpb25PZlRoZVJlZmVyZW5jZWRPYmplY3QsXHJcbiAgICAgKiAgICAgICAgICAuLi4sXHJcbiAgICAgKiAgICAgICAgICBjb25zdHJ1Y3Rvck5hbWVPZlN1cGVyY2xhc3M6IFNlcmlhbGl6YXRpb25PZlN1cGVyQ2xhc3NcclxuICAgICAqICAgICAgfVxyXG4gICAgICogfVxyXG4gICAgICogYGBgXHJcbiAgICAgKiBTaW5jZSB0aGUgaW5zdGFuY2Ugb2YgdGhlIHN1cGVyY2xhc3MgaXMgY3JlYXRlZCBhdXRvbWF0aWNhbGx5IHdoZW4gYW4gb2JqZWN0IGlzIGNyZWF0ZWQsIFxyXG4gICAgICogdGhlIFNlcmlhbGl6YXRpb25PZlN1cGVyQ2xhc3Mgb21pdHMgdGhlIHRoZSBuYW1lc3BhY2VOYW1lLmNsYXNzTmFtZSBrZXkgYW5kIGNvbnNpc3RzIG9ubHkgb2YgaXRzIHZhbHVlLiBcclxuICAgICAqIFRoZSBjb25zdHJ1Y3Rvck5hbWVPZlN1cGVyY2xhc3MgaXMgZ2l2ZW4gaW5zdGVhZCBhcyBhIHByb3BlcnR5IG5hbWUgaW4gdGhlIHNlcmlhbGl6YXRpb24gb2YgdGhlIHN1YmNsYXNzLlxyXG4gICAgICovXHJcbiAgICBleHBvcnQgYWJzdHJhY3QgY2xhc3MgU2VyaWFsaXplciB7XHJcbiAgICAgICAgLyoqIEluIG9yZGVyIGZvciB0aGUgU2VyaWFsaXplciB0byBjcmVhdGUgY2xhc3MgaW5zdGFuY2VzLCBpdCBuZWVkcyBhY2Nlc3MgdG8gdGhlIGFwcHJvcHJpYXRlIG5hbWVzcGFjZXMgKi9cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBuYW1lc3BhY2VzOiBOYW1lc3BhY2VSZWdpc3RlciA9IHsgXCLGklwiOiBGdWRnZUNvcmUgfTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVnaXN0ZXJzIGEgbmFtZXNwYWNlIHRvIHRoZSBbW1NlcmlhbGl6ZXJdXSwgdG8gZW5hYmxlIGF1dG9tYXRpYyBpbnN0YW50aWF0aW9uIG9mIGNsYXNzZXMgZGVmaW5lZCB3aXRoaW5cclxuICAgICAgICAgKiBAcGFyYW0gX25hbWVzcGFjZSBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHJlZ2lzdGVyTmFtZXNwYWNlKF9uYW1lc3BhY2U6IE9iamVjdCk6IHZvaWQge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBuYW1lIGluIFNlcmlhbGl6ZXIubmFtZXNwYWNlcylcclxuICAgICAgICAgICAgICAgIGlmIChTZXJpYWxpemVyLm5hbWVzcGFjZXNbbmFtZV0gPT0gX25hbWVzcGFjZSlcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgICAgICBsZXQgbmFtZTogc3RyaW5nID0gU2VyaWFsaXplci5maW5kTmFtZXNwYWNlSW4oX25hbWVzcGFjZSwgd2luZG93KTtcclxuICAgICAgICAgICAgaWYgKCFuYW1lKVxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgcGFyZW50TmFtZSBpbiBTZXJpYWxpemVyLm5hbWVzcGFjZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lID0gU2VyaWFsaXplci5maW5kTmFtZXNwYWNlSW4oX25hbWVzcGFjZSwgU2VyaWFsaXplci5uYW1lc3BhY2VzW3BhcmVudE5hbWVdKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobmFtZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lID0gcGFyZW50TmFtZSArIFwiLlwiICsgbmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFuYW1lKVxyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTmFtZXNwYWNlIG5vdCBmb3VuZC4gTWF5YmUgcGFyZW50IG5hbWVzcGFjZSBoYXNuJ3QgYmVlbiByZWdpc3RlcmVkIGJlZm9yZT9cIik7XHJcblxyXG4gICAgICAgICAgICBTZXJpYWxpemVyLm5hbWVzcGFjZXNbbmFtZV0gPSBfbmFtZXNwYWNlO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgYSBqYXZhc2NyaXB0IG9iamVjdCByZXByZXNlbnRpbmcgdGhlIHNlcmlhbGl6YWJsZSBGVURHRS1vYmplY3QgZ2l2ZW4sXHJcbiAgICAgICAgICogaW5jbHVkaW5nIGF0dGFjaGVkIGNvbXBvbmVudHMsIGNoaWxkcmVuLCBzdXBlcmNsYXNzLW9iamVjdHMgYWxsIGluZm9ybWF0aW9uIG5lZWRlZCBmb3IgcmVjb25zdHJ1Y3Rpb25cclxuICAgICAgICAgKiBAcGFyYW0gX29iamVjdCBBbiBvYmplY3QgdG8gc2VyaWFsaXplLCBpbXBsZW1lbnRpbmcgdGhlIFtbU2VyaWFsaXphYmxlXV0gaW50ZXJmYWNlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBzZXJpYWxpemUoX29iamVjdDogU2VyaWFsaXphYmxlKTogU2VyaWFsaXphdGlvbiB7XHJcbiAgICAgICAgICAgIGxldCBzZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uID0ge307XHJcbiAgICAgICAgICAgIC8vIFRPRE86IHNhdmUgdGhlIG5hbWVzcGFjZSB3aXRoIHRoZSBjb25zdHJ1Y3RvcnMgbmFtZVxyXG4gICAgICAgICAgICAvLyBzZXJpYWxpemF0aW9uW19vYmplY3QuY29uc3RydWN0b3IubmFtZV0gPSBfb2JqZWN0LnNlcmlhbGl6ZSgpO1xyXG4gICAgICAgICAgICBsZXQgcGF0aDogc3RyaW5nID0gdGhpcy5nZXRGdWxsUGF0aChfb2JqZWN0KTtcclxuICAgICAgICAgICAgaWYgKCFwYXRoKVxyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBOYW1lc3BhY2Ugb2Ygc2VyaWFsaXphYmxlIG9iamVjdCBvZiB0eXBlICR7X29iamVjdC5jb25zdHJ1Y3Rvci5uYW1lfSBub3QgZm91bmQuIE1heWJlIHRoZSBuYW1lc3BhY2UgaGFzbid0IGJlZW4gcmVnaXN0ZXJlZCBvciB0aGUgY2xhc3Mgbm90IGV4cG9ydGVkP2ApO1xyXG4gICAgICAgICAgICBzZXJpYWxpemF0aW9uW3BhdGhdID0gX29iamVjdC5zZXJpYWxpemUoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHNlcmlhbGl6YXRpb247XHJcbiAgICAgICAgICAgIC8vIHJldHVybiBfb2JqZWN0LnNlcmlhbGl6ZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyBhIEZVREdFLW9iamVjdCByZWNvbnN0cnVjdGVkIGZyb20gdGhlIGluZm9ybWF0aW9uIGluIHRoZSBbW1NlcmlhbGl6YXRpb25dXSBnaXZlbixcclxuICAgICAgICAgKiBpbmNsdWRpbmcgYXR0YWNoZWQgY29tcG9uZW50cywgY2hpbGRyZW4sIHN1cGVyY2xhc3Mtb2JqZWN0c1xyXG4gICAgICAgICAqIEBwYXJhbSBfc2VyaWFsaXphdGlvbiBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uKTogU2VyaWFsaXphYmxlIHtcclxuICAgICAgICAgICAgbGV0IHJlY29uc3RydWN0OiBTZXJpYWxpemFibGU7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAvLyBsb29wIGNvbnN0cnVjdGVkIHNvbGVseSB0byBhY2Nlc3MgdHlwZS1wcm9wZXJ0eS4gT25seSBvbmUgZXhwZWN0ZWQhXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBwYXRoIGluIF9zZXJpYWxpemF0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gcmVjb25zdHJ1Y3QgPSBuZXcgKDxHZW5lcmFsPkZ1ZGdlKVt0eXBlTmFtZV07XHJcbiAgICAgICAgICAgICAgICAgICAgcmVjb25zdHJ1Y3QgPSBTZXJpYWxpemVyLnJlY29uc3RydWN0KHBhdGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlY29uc3RydWN0LmRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uW3BhdGhdKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVjb25zdHJ1Y3Q7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKG1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkRlc2VyaWFsaXphdGlvbiBmYWlsZWQ6IFwiICsgbWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL1RPRE86IGltcGxlbWVudCBwcmV0dGlmaWVyIHRvIG1ha2UgSlNPTi1TdHJpbmdpZmljYXRpb24gb2Ygc2VyaWFsaXphdGlvbnMgbW9yZSByZWFkYWJsZSwgZS5nLiBwbGFjaW5nIHgsIHkgYW5kIHogaW4gb25lIGxpbmVcclxuICAgICAgICBwdWJsaWMgc3RhdGljIHByZXR0aWZ5KF9qc29uOiBzdHJpbmcpOiBzdHJpbmcgeyByZXR1cm4gX2pzb247IH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyBhIGZvcm1hdHRlZCwgaHVtYW4gcmVhZGFibGUgSlNPTi1TdHJpbmcsIHJlcHJlc2VudGluZyB0aGUgZ2l2ZW4gW1tTZXJpYWxpemFpb25dXSB0aGF0IG1heSBoYXZlIGJlZW4gY3JlYXRlZCBieSBbW1NlcmlhbGl6ZXJdXS5zZXJpYWxpemVcclxuICAgICAgICAgKiBAcGFyYW0gX3NlcmlhbGl6YXRpb25cclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHN0cmluZ2lmeShfc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbik6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIC8vIGFkanVzdG1lbnRzIHRvIHNlcmlhbGl6YXRpb24gY2FuIGJlIG1hZGUgaGVyZSBiZWZvcmUgc3RyaW5naWZpY2F0aW9uLCBpZiBkZXNpcmVkXHJcbiAgICAgICAgICAgIGxldCBqc29uOiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeShfc2VyaWFsaXphdGlvbiwgbnVsbCwgMik7XHJcbiAgICAgICAgICAgIGxldCBwcmV0dHk6IHN0cmluZyA9IFNlcmlhbGl6ZXIucHJldHRpZnkoanNvbik7XHJcbiAgICAgICAgICAgIHJldHVybiBwcmV0dHk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIGEgW1tTZXJpYWxpemF0aW9uXV0gY3JlYXRlZCBmcm9tIHRoZSBnaXZlbiBKU09OLVN0cmluZy4gUmVzdWx0IG1heSBiZSBwYXNzZWQgdG8gW1tTZXJpYWxpemVyXV0uZGVzZXJpYWxpemVcclxuICAgICAgICAgKiBAcGFyYW0gX2pzb24gXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBwYXJzZShfanNvbjogc3RyaW5nKTogU2VyaWFsaXphdGlvbiB7XHJcbiAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKF9qc29uKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ3JlYXRlcyBhbiBvYmplY3Qgb2YgdGhlIGNsYXNzIGRlZmluZWQgd2l0aCB0aGUgZnVsbCBwYXRoIGluY2x1ZGluZyB0aGUgbmFtZXNwYWNlTmFtZShzKSBhbmQgdGhlIGNsYXNzTmFtZSBzZXBlcmF0ZWQgYnkgZG90cyguKSBcclxuICAgICAgICAgKiBAcGFyYW0gX3BhdGggXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgcmVjb25zdHJ1Y3QoX3BhdGg6IHN0cmluZyk6IFNlcmlhbGl6YWJsZSB7XHJcbiAgICAgICAgICAgIGxldCB0eXBlTmFtZTogc3RyaW5nID0gX3BhdGguc3Vic3RyKF9wYXRoLmxhc3RJbmRleE9mKFwiLlwiKSArIDEpO1xyXG4gICAgICAgICAgICBsZXQgbmFtZXNwYWNlOiBPYmplY3QgPSBTZXJpYWxpemVyLmdldE5hbWVzcGFjZShfcGF0aCk7XHJcbiAgICAgICAgICAgIGlmICghbmFtZXNwYWNlKVxyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBOYW1lc3BhY2Ugb2Ygc2VyaWFsaXphYmxlIG9iamVjdCBvZiB0eXBlICR7dHlwZU5hbWV9IG5vdCBmb3VuZC4gTWF5YmUgdGhlIG5hbWVzcGFjZSBoYXNuJ3QgYmVlbiByZWdpc3RlcmVkP2ApO1xyXG4gICAgICAgICAgICBsZXQgcmVjb25zdHJ1Y3Rpb246IFNlcmlhbGl6YWJsZSA9IG5ldyAoPEdlbmVyYWw+bmFtZXNwYWNlKVt0eXBlTmFtZV07XHJcbiAgICAgICAgICAgIHJldHVybiByZWNvbnN0cnVjdGlvbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgdGhlIGZ1bGwgcGF0aCB0byB0aGUgY2xhc3Mgb2YgdGhlIG9iamVjdCwgaWYgZm91bmQgaW4gdGhlIHJlZ2lzdGVyZWQgbmFtZXNwYWNlc1xyXG4gICAgICAgICAqIEBwYXJhbSBfb2JqZWN0IFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGdldEZ1bGxQYXRoKF9vYmplY3Q6IFNlcmlhbGl6YWJsZSk6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIGxldCB0eXBlTmFtZTogc3RyaW5nID0gX29iamVjdC5jb25zdHJ1Y3Rvci5uYW1lO1xyXG4gICAgICAgICAgICAvLyBEZWJ1Zy5sb2coXCJTZWFyY2hpbmcgbmFtZXNwYWNlIG9mOiBcIiArIHR5cGVOYW1lKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgbmFtZXNwYWNlTmFtZSBpbiBTZXJpYWxpemVyLm5hbWVzcGFjZXMpIHtcclxuICAgICAgICAgICAgICAgIGxldCBmb3VuZDogR2VuZXJhbCA9ICg8R2VuZXJhbD5TZXJpYWxpemVyLm5hbWVzcGFjZXMpW25hbWVzcGFjZU5hbWVdW3R5cGVOYW1lXTtcclxuICAgICAgICAgICAgICAgIGlmIChmb3VuZCAmJiBfb2JqZWN0IGluc3RhbmNlb2YgZm91bmQpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5hbWVzcGFjZU5hbWUgKyBcIi5cIiArIHR5cGVOYW1lO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgbmFtZXNwYWNlLW9iamVjdCBkZWZpbmVkIHdpdGhpbiB0aGUgZnVsbCBwYXRoLCBpZiByZWdpc3RlcmVkXHJcbiAgICAgICAgICogQHBhcmFtIF9wYXRoXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgZ2V0TmFtZXNwYWNlKF9wYXRoOiBzdHJpbmcpOiBPYmplY3Qge1xyXG4gICAgICAgICAgICBsZXQgbmFtZXNwYWNlTmFtZTogc3RyaW5nID0gX3BhdGguc3Vic3RyKDAsIF9wYXRoLmxhc3RJbmRleE9mKFwiLlwiKSk7XHJcbiAgICAgICAgICAgIHJldHVybiBTZXJpYWxpemVyLm5hbWVzcGFjZXNbbmFtZXNwYWNlTmFtZV07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBGaW5kcyB0aGUgbmFtZXNwYWNlLW9iamVjdCBpbiBwcm9wZXJ0aWVzIG9mIHRoZSBwYXJlbnQtb2JqZWN0IChlLmcuIHdpbmRvdyksIGlmIHByZXNlbnRcclxuICAgICAgICAgKiBAcGFyYW0gX25hbWVzcGFjZSBcclxuICAgICAgICAgKiBAcGFyYW0gX3BhcmVudCBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBmaW5kTmFtZXNwYWNlSW4oX25hbWVzcGFjZTogT2JqZWN0LCBfcGFyZW50OiBPYmplY3QpOiBzdHJpbmcge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBwcm9wIGluIF9wYXJlbnQpXHJcbiAgICAgICAgICAgICAgICBpZiAoKDxHZW5lcmFsPl9wYXJlbnQpW3Byb3BdID09IF9uYW1lc3BhY2UpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByb3A7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBJbnRlcmZhY2UgZGVzY3JpYmluZyB0aGUgZGF0YXR5cGVzIG9mIHRoZSBhdHRyaWJ1dGVzIGEgbXV0YXRvciBhcyBzdHJpbmdzIFxyXG4gICAgICovXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIE11dGF0b3JBdHRyaWJ1dGVUeXBlcyB7XHJcbiAgICAgICAgW2F0dHJpYnV0ZTogc3RyaW5nXTogc3RyaW5nIHwgT2JqZWN0O1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnRlcmZhY2UgZGVzY3JpYmluZyBhIG11dGF0b3IsIHdoaWNoIGlzIGFuIGFzc29jaWF0aXZlIGFycmF5IHdpdGggbmFtZXMgb2YgYXR0cmlidXRlcyBhbmQgdGhlaXIgY29ycmVzcG9uZGluZyB2YWx1ZXNcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGludGVyZmFjZSBNdXRhdG9yIHtcclxuICAgICAgICBbYXR0cmlidXRlOiBzdHJpbmddOiBPYmplY3Q7XHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIEludGVyZmFjZXMgZGVkaWNhdGVkIGZvciBlYWNoIHB1cnBvc2UuIEV4dHJhIGF0dHJpYnV0ZSBuZWNlc3NhcnkgZm9yIGNvbXBpbGV0aW1lIHR5cGUgY2hlY2tpbmcsIG5vdCBleGlzdGVudCBhdCBydW50aW1lXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgTXV0YXRvckZvckFuaW1hdGlvbiBleHRlbmRzIE11dGF0b3IgeyByZWFkb25seSBmb3JBbmltYXRpb246IG51bGw7IH1cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgTXV0YXRvckZvclVzZXJJbnRlcmZhY2UgZXh0ZW5kcyBNdXRhdG9yIHsgcmVhZG9ubHkgZm9yVXNlckludGVyZmFjZTogbnVsbDsgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQmFzZSBjbGFzcyBmb3IgYWxsIHR5cGVzIGJlaW5nIG11dGFibGUgdXNpbmcgW1tNdXRhdG9yXV0tb2JqZWN0cywgdGh1cyBwcm92aWRpbmcgYW5kIHVzaW5nIGludGVyZmFjZXMgY3JlYXRlZCBhdCBydW50aW1lLiAgXHJcbiAgICAgKiBNdXRhYmxlcyBwcm92aWRlIGEgW1tNdXRhdG9yXV0gdGhhdCBpcyBidWlsZCBieSBjb2xsZWN0aW5nIGFsbCBvYmplY3QtcHJvcGVydGllcyB0aGF0IGFyZSBlaXRoZXIgb2YgYSBwcmltaXRpdmUgdHlwZSBvciBhZ2FpbiBNdXRhYmxlLlxyXG4gICAgICogU3ViY2xhc3NlcyBjYW4gZWl0aGVyIHJlZHVjZSB0aGUgc3RhbmRhcmQgW1tNdXRhdG9yXV0gYnVpbHQgYnkgdGhpcyBiYXNlIGNsYXNzIGJ5IGRlbGV0aW5nIHByb3BlcnRpZXMgb3IgaW1wbGVtZW50IGFuIGluZGl2aWR1YWwgZ2V0TXV0YXRvci1tZXRob2QuXHJcbiAgICAgKiBUaGUgcHJvdmlkZWQgcHJvcGVydGllcyBvZiB0aGUgW1tNdXRhdG9yXV0gbXVzdCBtYXRjaCBwdWJsaWMgcHJvcGVydGllcyBvciBnZXR0ZXJzL3NldHRlcnMgb2YgdGhlIG9iamVjdC5cclxuICAgICAqIE90aGVyd2lzZSwgdGhleSB3aWxsIGJlIGlnbm9yZWQgaWYgbm90IGhhbmRsZWQgYnkgYW4gb3ZlcnJpZGUgb2YgdGhlIG11dGF0ZS1tZXRob2QgaW4gdGhlIHN1YmNsYXNzIGFuZCB0aHJvdyBlcnJvcnMgaW4gYW4gYXV0b21hdGljYWxseSBnZW5lcmF0ZWQgdXNlci1pbnRlcmZhY2UgZm9yIHRoZSBvYmplY3QuXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBhYnN0cmFjdCBjbGFzcyBNdXRhYmxlIGV4dGVuZHMgRXZlbnRUYXJnZXQge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHJpZXZlcyB0aGUgdHlwZSBvZiB0aGlzIG11dGFibGUgc3ViY2xhc3MgYXMgdGhlIG5hbWUgb2YgdGhlIHJ1bnRpbWUgY2xhc3NcclxuICAgICAgICAgKiBAcmV0dXJucyBUaGUgdHlwZSBvZiB0aGUgbXV0YWJsZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBnZXQgdHlwZSgpOiBzdHJpbmcge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci5uYW1lO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDb2xsZWN0IGFwcGxpY2FibGUgYXR0cmlidXRlcyBvZiB0aGUgaW5zdGFuY2UgYW5kIGNvcGllcyBvZiB0aGVpciB2YWx1ZXMgaW4gYSBNdXRhdG9yLW9iamVjdFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBnZXRNdXRhdG9yKCk6IE11dGF0b3Ige1xyXG4gICAgICAgICAgICBsZXQgbXV0YXRvcjogTXV0YXRvciA9IHt9O1xyXG5cclxuICAgICAgICAgICAgLy8gY29sbGVjdCBwcmltaXRpdmUgYW5kIG11dGFibGUgYXR0cmlidXRlc1xyXG4gICAgICAgICAgICBmb3IgKGxldCBhdHRyaWJ1dGUgaW4gdGhpcykge1xyXG4gICAgICAgICAgICAgICAgbGV0IHZhbHVlOiBPYmplY3QgPSB0aGlzW2F0dHJpYnV0ZV07XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBGdW5jdGlvbilcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIE9iamVjdCAmJiAhKHZhbHVlIGluc3RhbmNlb2YgTXV0YWJsZSkpXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICBtdXRhdG9yW2F0dHJpYnV0ZV0gPSB0aGlzW2F0dHJpYnV0ZV07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIG11dGF0b3IgY2FuIGJlIHJlZHVjZWQgYnV0IG5vdCBleHRlbmRlZCFcclxuICAgICAgICAgICAgT2JqZWN0LnByZXZlbnRFeHRlbnNpb25zKG11dGF0b3IpO1xyXG4gICAgICAgICAgICAvLyBkZWxldGUgdW53YW50ZWQgYXR0cmlidXRlc1xyXG4gICAgICAgICAgICB0aGlzLnJlZHVjZU11dGF0b3IobXV0YXRvcik7XHJcblxyXG4gICAgICAgICAgICAvLyByZXBsYWNlIHJlZmVyZW5jZXMgdG8gbXV0YWJsZSBvYmplY3RzIHdpdGggcmVmZXJlbmNlcyB0byBjb3BpZXNcclxuICAgICAgICAgICAgZm9yIChsZXQgYXR0cmlidXRlIGluIG11dGF0b3IpIHtcclxuICAgICAgICAgICAgICAgIGxldCB2YWx1ZTogT2JqZWN0ID0gbXV0YXRvclthdHRyaWJ1dGVdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgTXV0YWJsZSlcclxuICAgICAgICAgICAgICAgICAgICBtdXRhdG9yW2F0dHJpYnV0ZV0gPSB2YWx1ZS5nZXRNdXRhdG9yKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBtdXRhdG9yO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ29sbGVjdCB0aGUgYXR0cmlidXRlcyBvZiB0aGUgaW5zdGFuY2UgYW5kIHRoZWlyIHZhbHVlcyBhcHBsaWNhYmxlIGZvciBhbmltYXRpb24uXHJcbiAgICAgICAgICogQmFzaWMgZnVuY3Rpb25hbGl0eSBpcyBpZGVudGljYWwgdG8gW1tnZXRNdXRhdG9yXV0sIHJldHVybmVkIG11dGF0b3Igc2hvdWxkIHRoZW4gYmUgcmVkdWNlZCBieSB0aGUgc3ViY2xhc3NlZCBpbnN0YW5jZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBnZXRNdXRhdG9yRm9yQW5pbWF0aW9uKCk6IE11dGF0b3JGb3JBbmltYXRpb24ge1xyXG4gICAgICAgICAgICByZXR1cm4gPE11dGF0b3JGb3JBbmltYXRpb24+dGhpcy5nZXRNdXRhdG9yKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENvbGxlY3QgdGhlIGF0dHJpYnV0ZXMgb2YgdGhlIGluc3RhbmNlIGFuZCB0aGVpciB2YWx1ZXMgYXBwbGljYWJsZSBmb3IgdGhlIHVzZXIgaW50ZXJmYWNlLlxyXG4gICAgICAgICAqIEJhc2ljIGZ1bmN0aW9uYWxpdHkgaXMgaWRlbnRpY2FsIHRvIFtbZ2V0TXV0YXRvcl1dLCByZXR1cm5lZCBtdXRhdG9yIHNob3VsZCB0aGVuIGJlIHJlZHVjZWQgYnkgdGhlIHN1YmNsYXNzZWQgaW5zdGFuY2VcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0TXV0YXRvckZvclVzZXJJbnRlcmZhY2UoKTogTXV0YXRvckZvclVzZXJJbnRlcmZhY2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gPE11dGF0b3JGb3JVc2VySW50ZXJmYWNlPnRoaXMuZ2V0TXV0YXRvcigpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIGFuIGFzc29jaWF0aXZlIGFycmF5IHdpdGggdGhlIHNhbWUgYXR0cmlidXRlcyBhcyB0aGUgZ2l2ZW4gbXV0YXRvciwgYnV0IHdpdGggdGhlIGNvcnJlc3BvbmRpbmcgdHlwZXMgYXMgc3RyaW5nLXZhbHVlc1xyXG4gICAgICAgICAqIERvZXMgbm90IHJlY3Vyc2UgaW50byBvYmplY3RzIVxyXG4gICAgICAgICAqIEBwYXJhbSBfbXV0YXRvciBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0TXV0YXRvckF0dHJpYnV0ZVR5cGVzKF9tdXRhdG9yOiBNdXRhdG9yKTogTXV0YXRvckF0dHJpYnV0ZVR5cGVzIHtcclxuICAgICAgICAgICAgbGV0IHR5cGVzOiBNdXRhdG9yQXR0cmlidXRlVHlwZXMgPSB7fTtcclxuICAgICAgICAgICAgZm9yIChsZXQgYXR0cmlidXRlIGluIF9tdXRhdG9yKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdHlwZTogc3RyaW5nID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIGxldCB2YWx1ZTogbnVtYmVyIHwgYm9vbGVhbiB8IHN0cmluZyB8IG9iamVjdCA9IF9tdXRhdG9yW2F0dHJpYnV0ZV07XHJcbiAgICAgICAgICAgICAgICBpZiAoX211dGF0b3JbYXR0cmlidXRlXSAhPSB1bmRlZmluZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiAodmFsdWUpID09IFwib2JqZWN0XCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGUgPSAoPEdlbmVyYWw+dGhpcylbYXR0cmlidXRlXS5jb25zdHJ1Y3Rvci5uYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZSA9IF9tdXRhdG9yW2F0dHJpYnV0ZV0uY29uc3RydWN0b3IubmFtZTtcclxuICAgICAgICAgICAgICAgIHR5cGVzW2F0dHJpYnV0ZV0gPSB0eXBlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0eXBlcztcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVXBkYXRlcyB0aGUgdmFsdWVzIG9mIHRoZSBnaXZlbiBtdXRhdG9yIGFjY29yZGluZyB0byB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgaW5zdGFuY2VcclxuICAgICAgICAgKiBAcGFyYW0gX211dGF0b3IgXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHVwZGF0ZU11dGF0b3IoX211dGF0b3I6IE11dGF0b3IpOiB2b2lkIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgYXR0cmlidXRlIGluIF9tdXRhdG9yKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdmFsdWU6IE9iamVjdCA9IF9tdXRhdG9yW2F0dHJpYnV0ZV07XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBNdXRhYmxlKVxyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUuZ2V0TXV0YXRvcigpO1xyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIF9tdXRhdG9yW2F0dHJpYnV0ZV0gPSAoPEdlbmVyYWw+dGhpcylbYXR0cmlidXRlXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBVcGRhdGVzIHRoZSBhdHRyaWJ1dGUgdmFsdWVzIG9mIHRoZSBpbnN0YW5jZSBhY2NvcmRpbmcgdG8gdGhlIHN0YXRlIG9mIHRoZSBtdXRhdG9yLiBNdXN0IGJlIHByb3RlY3RlZC4uLiFcclxuICAgICAgICAgKiBAcGFyYW0gX211dGF0b3JcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgbXV0YXRlKF9tdXRhdG9yOiBNdXRhdG9yKTogdm9pZCB7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IGRvbid0IGFzc2lnbiB1bmtub3duIHByb3BlcnRpZXNcclxuICAgICAgICAgICAgZm9yIChsZXQgYXR0cmlidXRlIGluIF9tdXRhdG9yKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdmFsdWU6IE11dGF0b3IgPSA8TXV0YXRvcj5fbXV0YXRvclthdHRyaWJ1dGVdO1xyXG4gICAgICAgICAgICAgICAgbGV0IG11dGFudDogT2JqZWN0ID0gKDxHZW5lcmFsPnRoaXMpW2F0dHJpYnV0ZV07XHJcbiAgICAgICAgICAgICAgICBpZiAobXV0YW50IGluc3RhbmNlb2YgTXV0YWJsZSlcclxuICAgICAgICAgICAgICAgICAgICBtdXRhbnQubXV0YXRlKHZhbHVlKTtcclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICAoPEdlbmVyYWw+dGhpcylbYXR0cmlidXRlXSA9IHZhbHVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoRVZFTlQuTVVUQVRFKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlZHVjZXMgdGhlIGF0dHJpYnV0ZXMgb2YgdGhlIGdlbmVyYWwgbXV0YXRvciBhY2NvcmRpbmcgdG8gZGVzaXJlZCBvcHRpb25zIGZvciBtdXRhdGlvbi4gVG8gYmUgaW1wbGVtZW50ZWQgaW4gc3ViY2xhc3Nlc1xyXG4gICAgICAgICAqIEBwYXJhbSBfbXV0YXRvciBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgcmVkdWNlTXV0YXRvcihfbXV0YXRvcjogTXV0YXRvcik6IHZvaWQ7XHJcbiAgICB9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL1RyYW5zZmVyL1NlcmlhbGl6ZXIudHNcIi8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9UcmFuc2Zlci9NdXRhYmxlLnRzXCIvPlxyXG5cclxubmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgLyoqXHJcbiAgICogSG9sZHMgaW5mb3JtYXRpb24gYWJvdXQgdGhlIEFuaW1hdGlvblN0cnVjdHVyZSB0aGF0IHRoZSBBbmltYXRpb24gdXNlcyB0byBtYXAgdGhlIFNlcXVlbmNlcyB0byB0aGUgQXR0cmlidXRlcy5cclxuICAgKiBCdWlsdCBvdXQgb2YgYSBbW05vZGVdXSdzIHNlcmlhbHNhdGlvbiwgaXQgc3dhcHMgdGhlIHZhbHVlcyB3aXRoIFtbQW5pbWF0aW9uU2VxdWVuY2VdXXMuXHJcbiAgICovXHJcbiAgZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25TdHJ1Y3R1cmUge1xyXG4gICAgW2F0dHJpYnV0ZTogc3RyaW5nXTogU2VyaWFsaXphdGlvbiB8IEFuaW1hdGlvblNlcXVlbmNlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgKiBBbiBhc3NvY2lhdGl2ZSBhcnJheSBtYXBwaW5nIG5hbWVzIG9mIGxhYmxlcyB0byB0aW1lc3RhbXBzLlxyXG4gICogTGFiZWxzIG5lZWQgdG8gYmUgdW5pcXVlIHBlciBBbmltYXRpb24uXHJcbiAgKiBAYXV0aG9yIEx1a2FzIFNjaGV1ZXJsZSwgSEZVLCAyMDE5XHJcbiAgKi9cclxuICBleHBvcnQgaW50ZXJmYWNlIEFuaW1hdGlvbkxhYmVsIHtcclxuICAgIFtuYW1lOiBzdHJpbmddOiBudW1iZXI7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIEhvbGRzIGluZm9ybWF0aW9uIGFib3V0IEFuaW1hdGlvbiBFdmVudCBUcmlnZ2Vyc1xyXG4gICogQGF1dGhvciBMdWthcyBTY2hldWVybGUsIEhGVSwgMjAxOVxyXG4gICovXHJcbiAgZXhwb3J0IGludGVyZmFjZSBBbmltYXRpb25FdmVudFRyaWdnZXIge1xyXG4gICAgW25hbWU6IHN0cmluZ106IG51bWJlcjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEludGVybmFsbHkgdXNlZCB0byBkaWZmZXJlbnRpYXRlIGJldHdlZW4gdGhlIHZhcmlvdXMgZ2VuZXJhdGVkIHN0cnVjdHVyZXMgYW5kIGV2ZW50cy5cclxuICAgKiBAYXV0aG9yIEx1a2FzIFNjaGV1ZXJsZSwgSEZVLCAyMDE5XHJcbiAgICovXHJcbiAgZW51bSBBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUge1xyXG4gICAgLyoqRGVmYXVsdDogZm9yd2FyZCwgY29udGlub3VzICovXHJcbiAgICBOT1JNQUwsXHJcbiAgICAvKipiYWNrd2FyZCwgY29udGlub3VzICovXHJcbiAgICBSRVZFUlNFLFxyXG4gICAgLyoqZm9yd2FyZCwgcmFzdGVyZWQgKi9cclxuICAgIFJBU1RFUkVELFxyXG4gICAgLyoqYmFja3dhcmQsIHJhc3RlcmVkICovXHJcbiAgICBSQVNURVJFRFJFVkVSU0VcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFuaW1hdGlvbiBDbGFzcyB0byBob2xkIGFsbCByZXF1aXJlZCBPYmplY3RzIHRoYXQgYXJlIHBhcnQgb2YgYW4gQW5pbWF0aW9uLlxyXG4gICAqIEFsc28gaG9sZHMgZnVuY3Rpb25zIHRvIHBsYXkgc2FpZCBBbmltYXRpb24uXHJcbiAgICogQ2FuIGJlIGFkZGVkIHRvIGEgTm9kZSBhbmQgcGxheWVkIHRocm91Z2ggW1tDb21wb25lbnRBbmltYXRvcl1dLlxyXG4gICAqIEBhdXRob3IgTHVrYXMgU2NoZXVlcmxlLCBIRlUsIDIwMTlcclxuICAgKi9cclxuICBleHBvcnQgY2xhc3MgQW5pbWF0aW9uIGV4dGVuZHMgTXV0YWJsZSBpbXBsZW1lbnRzIFNlcmlhbGl6YWJsZVJlc291cmNlIHtcclxuICAgIGlkUmVzb3VyY2U6IHN0cmluZztcclxuICAgIG5hbWU6IHN0cmluZztcclxuICAgIHRvdGFsVGltZTogbnVtYmVyID0gMDtcclxuICAgIGxhYmVsczogQW5pbWF0aW9uTGFiZWwgPSB7fTtcclxuICAgIHN0ZXBzUGVyU2Vjb25kOiBudW1iZXIgPSAxMDtcclxuICAgIGFuaW1hdGlvblN0cnVjdHVyZTogQW5pbWF0aW9uU3RydWN0dXJlO1xyXG4gICAgZXZlbnRzOiBBbmltYXRpb25FdmVudFRyaWdnZXIgPSB7fTtcclxuICAgIHByaXZhdGUgZnJhbWVzUGVyU2Vjb25kOiBudW1iZXIgPSA2MDtcclxuXHJcbiAgICAvLyBwcm9jZXNzZWQgZXZlbnRsaXN0IGFuZCBhbmltYXRpb24gc3RydWN1dHJlcyBmb3IgcGxheWJhY2suXHJcbiAgICBwcml2YXRlIGV2ZW50c1Byb2Nlc3NlZDogTWFwPEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRSwgQW5pbWF0aW9uRXZlbnRUcmlnZ2VyPiA9IG5ldyBNYXA8QU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFLCBBbmltYXRpb25FdmVudFRyaWdnZXI+KCk7XHJcbiAgICBwcml2YXRlIGFuaW1hdGlvblN0cnVjdHVyZXNQcm9jZXNzZWQ6IE1hcDxBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUsIEFuaW1hdGlvblN0cnVjdHVyZT4gPSBuZXcgTWFwPEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRSwgQW5pbWF0aW9uU3RydWN0dXJlPigpO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKF9uYW1lOiBzdHJpbmcsIF9hbmltU3RydWN0dXJlOiBBbmltYXRpb25TdHJ1Y3R1cmUgPSB7fSwgX2ZwczogbnVtYmVyID0gNjApIHtcclxuICAgICAgc3VwZXIoKTtcclxuICAgICAgdGhpcy5uYW1lID0gX25hbWU7XHJcbiAgICAgIHRoaXMuYW5pbWF0aW9uU3RydWN0dXJlID0gX2FuaW1TdHJ1Y3R1cmU7XHJcbiAgICAgIHRoaXMuYW5pbWF0aW9uU3RydWN0dXJlc1Byb2Nlc3NlZC5zZXQoQU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFLk5PUk1BTCwgX2FuaW1TdHJ1Y3R1cmUpO1xyXG4gICAgICB0aGlzLmZyYW1lc1BlclNlY29uZCA9IF9mcHM7XHJcbiAgICAgIHRoaXMuY2FsY3VsYXRlVG90YWxUaW1lKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZW5lcmF0ZXMgYSBuZXcgXCJNdXRhdG9yXCIgd2l0aCB0aGUgaW5mb3JtYXRpb24gdG8gYXBwbHkgdG8gdGhlIFtbTm9kZV1dIHRoZSBbW0NvbXBvbmVudEFuaW1hdG9yXV0gaXMgYXR0YWNoZWQgdG8gd2l0aCBbW05vZGUuYXBwbHlBbmltYXRpb24oKV1dLlxyXG4gICAgICogQHBhcmFtIF90aW1lIFRoZSB0aW1lIGF0IHdoaWNoIHRoZSBhbmltYXRpb24gY3VycmVudGx5IGlzIGF0XHJcbiAgICAgKiBAcGFyYW0gX2RpcmVjdGlvbiBUaGUgZGlyZWN0aW9uIGluIHdoaWNoIHRoZSBhbmltYXRpb24gaXMgc3VwcG9zZWQgdG8gYmUgcGxheWluZyBiYWNrLiA+MCA9PSBmb3J3YXJkLCAwID09IHN0b3AsIDwwID09IGJhY2t3YXJkc1xyXG4gICAgICogQHBhcmFtIF9wbGF5YmFjayBUaGUgcGxheWJhY2ttb2RlIHRoZSBhbmltYXRpb24gaXMgc3VwcG9zZWQgdG8gYmUgY2FsY3VsYXRlZCB3aXRoLlxyXG4gICAgICogQHJldHVybnMgYSBcIk11dGF0b3JcIiB0byBhcHBseS5cclxuICAgICAqL1xyXG4gICAgZ2V0TXV0YXRlZChfdGltZTogbnVtYmVyLCBfZGlyZWN0aW9uOiBudW1iZXIsIF9wbGF5YmFjazogQU5JTUFUSU9OX1BMQVlCQUNLKTogTXV0YXRvciB7ICAgICAvL1RPRE86IGZpbmQgYSBiZXR0ZXIgbmFtZSBmb3IgdGhpc1xyXG4gICAgICBsZXQgbTogTXV0YXRvciA9IHt9O1xyXG4gICAgICBpZiAoX3BsYXliYWNrID09IEFOSU1BVElPTl9QTEFZQkFDSy5USU1FQkFTRURfQ09OVElOT1VTKSB7XHJcbiAgICAgICAgaWYgKF9kaXJlY3Rpb24gPj0gMCkge1xyXG4gICAgICAgICAgbSA9IHRoaXMudHJhdmVyc2VTdHJ1Y3R1cmVGb3JNdXRhdG9yKHRoaXMuZ2V0UHJvY2Vzc2VkQW5pbWF0aW9uU3RydWN0dXJlKEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRS5OT1JNQUwpLCBfdGltZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG0gPSB0aGlzLnRyYXZlcnNlU3RydWN0dXJlRm9yTXV0YXRvcih0aGlzLmdldFByb2Nlc3NlZEFuaW1hdGlvblN0cnVjdHVyZShBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUuUkVWRVJTRSksIF90aW1lKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYgKF9kaXJlY3Rpb24gPj0gMCkge1xyXG4gICAgICAgICAgbSA9IHRoaXMudHJhdmVyc2VTdHJ1Y3R1cmVGb3JNdXRhdG9yKHRoaXMuZ2V0UHJvY2Vzc2VkQW5pbWF0aW9uU3RydWN0dXJlKEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRS5SQVNURVJFRCksIF90aW1lKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbSA9IHRoaXMudHJhdmVyc2VTdHJ1Y3R1cmVGb3JNdXRhdG9yKHRoaXMuZ2V0UHJvY2Vzc2VkQW5pbWF0aW9uU3RydWN0dXJlKEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRS5SQVNURVJFRFJFVkVSU0UpLCBfdGltZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gbTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBsaXN0IG9mIHRoZSBuYW1lcyBvZiB0aGUgZXZlbnRzIHRoZSBbW0NvbXBvbmVudEFuaW1hdG9yXV0gbmVlZHMgdG8gZmlyZSBiZXR3ZWVuIF9taW4gYW5kIF9tYXguIFxyXG4gICAgICogQHBhcmFtIF9taW4gVGhlIG1pbmltdW0gdGltZSAoaW5jbHVzaXZlKSB0byBjaGVjayBiZXR3ZWVuXHJcbiAgICAgKiBAcGFyYW0gX21heCBUaGUgbWF4aW11bSB0aW1lIChleGNsdXNpdmUpIHRvIGNoZWNrIGJldHdlZW5cclxuICAgICAqIEBwYXJhbSBfcGxheWJhY2sgVGhlIHBsYXliYWNrIG1vZGUgdG8gY2hlY2sgaW4uIEhhcyBhbiBlZmZlY3Qgb24gd2hlbiB0aGUgRXZlbnRzIGFyZSBmaXJlZC4gXHJcbiAgICAgKiBAcGFyYW0gX2RpcmVjdGlvbiBUaGUgZGlyZWN0aW9uIHRoZSBhbmltYXRpb24gaXMgc3VwcG9zZWQgdG8gcnVuIGluLiA+MCA9PSBmb3J3YXJkLCAwID09IHN0b3AsIDwwID09IGJhY2t3YXJkc1xyXG4gICAgICogQHJldHVybnMgYSBsaXN0IG9mIHN0cmluZ3Mgd2l0aCB0aGUgbmFtZXMgb2YgdGhlIGN1c3RvbSBldmVudHMgdG8gZmlyZS5cclxuICAgICAqL1xyXG4gICAgZ2V0RXZlbnRzVG9GaXJlKF9taW46IG51bWJlciwgX21heDogbnVtYmVyLCBfcGxheWJhY2s6IEFOSU1BVElPTl9QTEFZQkFDSywgX2RpcmVjdGlvbjogbnVtYmVyKTogc3RyaW5nW10ge1xyXG4gICAgICBsZXQgZXZlbnRMaXN0OiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICBsZXQgbWluU2VjdGlvbjogbnVtYmVyID0gTWF0aC5mbG9vcihfbWluIC8gdGhpcy50b3RhbFRpbWUpO1xyXG4gICAgICBsZXQgbWF4U2VjdGlvbjogbnVtYmVyID0gTWF0aC5mbG9vcihfbWF4IC8gdGhpcy50b3RhbFRpbWUpO1xyXG4gICAgICBfbWluID0gX21pbiAlIHRoaXMudG90YWxUaW1lO1xyXG4gICAgICBfbWF4ID0gX21heCAlIHRoaXMudG90YWxUaW1lO1xyXG5cclxuICAgICAgd2hpbGUgKG1pblNlY3Rpb24gPD0gbWF4U2VjdGlvbikge1xyXG4gICAgICAgIGxldCBldmVudFRyaWdnZXJzOiBBbmltYXRpb25FdmVudFRyaWdnZXIgPSB0aGlzLmdldENvcnJlY3RFdmVudExpc3QoX2RpcmVjdGlvbiwgX3BsYXliYWNrKTtcclxuICAgICAgICBpZiAobWluU2VjdGlvbiA9PSBtYXhTZWN0aW9uKSB7XHJcbiAgICAgICAgICBldmVudExpc3QgPSBldmVudExpc3QuY29uY2F0KHRoaXMuY2hlY2tFdmVudHNCZXR3ZWVuKGV2ZW50VHJpZ2dlcnMsIF9taW4sIF9tYXgpKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgZXZlbnRMaXN0ID0gZXZlbnRMaXN0LmNvbmNhdCh0aGlzLmNoZWNrRXZlbnRzQmV0d2VlbihldmVudFRyaWdnZXJzLCBfbWluLCB0aGlzLnRvdGFsVGltZSkpO1xyXG4gICAgICAgICAgX21pbiA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG1pblNlY3Rpb24rKztcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIGV2ZW50TGlzdDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgYW4gRXZlbnQgdG8gdGhlIExpc3Qgb2YgZXZlbnRzLlxyXG4gICAgICogQHBhcmFtIF9uYW1lIFRoZSBuYW1lIG9mIHRoZSBldmVudCAobmVlZHMgdG8gYmUgdW5pcXVlIHBlciBBbmltYXRpb24pLlxyXG4gICAgICogQHBhcmFtIF90aW1lIFRoZSB0aW1lc3RhbXAgb2YgdGhlIGV2ZW50IChpbiBtaWxsaXNlY29uZHMpLlxyXG4gICAgICovXHJcbiAgICBzZXRFdmVudChfbmFtZTogc3RyaW5nLCBfdGltZTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgIHRoaXMuZXZlbnRzW19uYW1lXSA9IF90aW1lO1xyXG4gICAgICB0aGlzLmV2ZW50c1Byb2Nlc3NlZC5jbGVhcigpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZXMgdGhlIGV2ZW50IHdpdGggdGhlIGdpdmVuIG5hbWUgZnJvbSB0aGUgbGlzdCBvZiBldmVudHMuXHJcbiAgICAgKiBAcGFyYW0gX25hbWUgbmFtZSBvZiB0aGUgZXZlbnQgdG8gcmVtb3ZlLlxyXG4gICAgICovXHJcbiAgICByZW1vdmVFdmVudChfbmFtZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgIGRlbGV0ZSB0aGlzLmV2ZW50c1tfbmFtZV07XHJcbiAgICAgIHRoaXMuZXZlbnRzUHJvY2Vzc2VkLmNsZWFyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGdldExhYmVscygpOiBFbnVtZXJhdG9yIHtcclxuICAgICAgLy9UT0RPOiB0aGlzIGFjdHVhbGx5IG5lZWRzIHRlc3RpbmdcclxuICAgICAgbGV0IGVuOiBFbnVtZXJhdG9yID0gbmV3IEVudW1lcmF0b3IodGhpcy5sYWJlbHMpO1xyXG4gICAgICByZXR1cm4gZW47XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGZwcygpOiBudW1iZXIge1xyXG4gICAgICByZXR1cm4gdGhpcy5mcmFtZXNQZXJTZWNvbmQ7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IGZwcyhfZnBzOiBudW1iZXIpIHtcclxuICAgICAgdGhpcy5mcmFtZXNQZXJTZWNvbmQgPSBfZnBzO1xyXG4gICAgICB0aGlzLmV2ZW50c1Byb2Nlc3NlZC5jbGVhcigpO1xyXG4gICAgICB0aGlzLmFuaW1hdGlvblN0cnVjdHVyZXNQcm9jZXNzZWQuY2xlYXIoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIChSZS0pQ2FsY3VsYXRlIHRoZSB0b3RhbCB0aW1lIG9mIHRoZSBBbmltYXRpb24uIENhbGN1bGF0aW9uLWhlYXZ5LCB1c2Ugb25seSBpZiBhY3R1YWxseSBuZWVkZWQuXHJcbiAgICAgKi9cclxuICAgIGNhbGN1bGF0ZVRvdGFsVGltZSgpOiB2b2lkIHtcclxuICAgICAgdGhpcy50b3RhbFRpbWUgPSAwO1xyXG4gICAgICB0aGlzLnRyYXZlcnNlU3RydWN0dXJlRm9yVGltZSh0aGlzLmFuaW1hdGlvblN0cnVjdHVyZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8jcmVnaW9uIHRyYW5zZmVyXHJcbiAgICBzZXJpYWxpemUoKTogU2VyaWFsaXphdGlvbiB7XHJcbiAgICAgIGxldCBzOiBTZXJpYWxpemF0aW9uID0ge1xyXG4gICAgICAgIGlkUmVzb3VyY2U6IHRoaXMuaWRSZXNvdXJjZSxcclxuICAgICAgICBuYW1lOiB0aGlzLm5hbWUsXHJcbiAgICAgICAgbGFiZWxzOiB7fSxcclxuICAgICAgICBldmVudHM6IHt9LFxyXG4gICAgICAgIGZwczogdGhpcy5mcmFtZXNQZXJTZWNvbmQsXHJcbiAgICAgICAgc3BzOiB0aGlzLnN0ZXBzUGVyU2Vjb25kXHJcbiAgICAgIH07XHJcbiAgICAgIGZvciAobGV0IG5hbWUgaW4gdGhpcy5sYWJlbHMpIHtcclxuICAgICAgICBzLmxhYmVsc1tuYW1lXSA9IHRoaXMubGFiZWxzW25hbWVdO1xyXG4gICAgICB9XHJcbiAgICAgIGZvciAobGV0IG5hbWUgaW4gdGhpcy5ldmVudHMpIHtcclxuICAgICAgICBzLmV2ZW50c1tuYW1lXSA9IHRoaXMuZXZlbnRzW25hbWVdO1xyXG4gICAgICB9XHJcbiAgICAgIHMuYW5pbWF0aW9uU3RydWN0dXJlID0gdGhpcy50cmF2ZXJzZVN0cnVjdHVyZUZvclNlcmlhbGlzYXRpb24odGhpcy5hbmltYXRpb25TdHJ1Y3R1cmUpO1xyXG4gICAgICByZXR1cm4gcztcclxuICAgIH1cclxuICAgIGRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uKTogU2VyaWFsaXphYmxlIHtcclxuICAgICAgdGhpcy5pZFJlc291cmNlID0gX3NlcmlhbGl6YXRpb24uaWRSZXNvdXJjZTtcclxuICAgICAgdGhpcy5uYW1lID0gX3NlcmlhbGl6YXRpb24ubmFtZTtcclxuICAgICAgdGhpcy5mcmFtZXNQZXJTZWNvbmQgPSBfc2VyaWFsaXphdGlvbi5mcHM7XHJcbiAgICAgIHRoaXMuc3RlcHNQZXJTZWNvbmQgPSBfc2VyaWFsaXphdGlvbi5zcHM7XHJcbiAgICAgIHRoaXMubGFiZWxzID0ge307XHJcbiAgICAgIGZvciAobGV0IG5hbWUgaW4gX3NlcmlhbGl6YXRpb24ubGFiZWxzKSB7XHJcbiAgICAgICAgdGhpcy5sYWJlbHNbbmFtZV0gPSBfc2VyaWFsaXphdGlvbi5sYWJlbHNbbmFtZV07XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5ldmVudHMgPSB7fTtcclxuICAgICAgZm9yIChsZXQgbmFtZSBpbiBfc2VyaWFsaXphdGlvbi5ldmVudHMpIHtcclxuICAgICAgICB0aGlzLmV2ZW50c1tuYW1lXSA9IF9zZXJpYWxpemF0aW9uLmV2ZW50c1tuYW1lXTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmV2ZW50c1Byb2Nlc3NlZCA9IG5ldyBNYXA8QU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFLCBBbmltYXRpb25FdmVudFRyaWdnZXI+KCk7XHJcblxyXG4gICAgICB0aGlzLmFuaW1hdGlvblN0cnVjdHVyZSA9IHRoaXMudHJhdmVyc2VTdHJ1Y3R1cmVGb3JEZXNlcmlhbGlzYXRpb24oX3NlcmlhbGl6YXRpb24uYW5pbWF0aW9uU3RydWN0dXJlKTtcclxuXHJcbiAgICAgIHRoaXMuYW5pbWF0aW9uU3RydWN0dXJlc1Byb2Nlc3NlZCA9IG5ldyBNYXA8QU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFLCBBbmltYXRpb25TdHJ1Y3R1cmU+KCk7XHJcblxyXG4gICAgICB0aGlzLmNhbGN1bGF0ZVRvdGFsVGltZSgpO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIHB1YmxpYyBnZXRNdXRhdG9yKCk6IE11dGF0b3Ige1xyXG4gICAgICByZXR1cm4gdGhpcy5zZXJpYWxpemUoKTtcclxuICAgIH1cclxuICAgIHByb3RlY3RlZCByZWR1Y2VNdXRhdG9yKF9tdXRhdG9yOiBNdXRhdG9yKTogdm9pZCB7XHJcbiAgICAgIGRlbGV0ZSBfbXV0YXRvci50b3RhbFRpbWU7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFRyYXZlcnNlcyBhbiBBbmltYXRpb25TdHJ1Y3R1cmUgYW5kIHJldHVybnMgdGhlIFNlcmlhbGl6YXRpb24gb2Ygc2FpZCBTdHJ1Y3R1cmUuXHJcbiAgICAgKiBAcGFyYW0gX3N0cnVjdHVyZSBUaGUgQW5pbWF0aW9uIFN0cnVjdHVyZSBhdCB0aGUgY3VycmVudCBsZXZlbCB0byB0cmFuc2Zvcm0gaW50byB0aGUgU2VyaWFsaXphdGlvbi5cclxuICAgICAqIEByZXR1cm5zIHRoZSBmaWxsZWQgU2VyaWFsaXphdGlvbi5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSB0cmF2ZXJzZVN0cnVjdHVyZUZvclNlcmlhbGlzYXRpb24oX3N0cnVjdHVyZTogQW5pbWF0aW9uU3RydWN0dXJlKTogU2VyaWFsaXphdGlvbiB7XHJcbiAgICAgIGxldCBuZXdTZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uID0ge307XHJcbiAgICAgIGZvciAobGV0IG4gaW4gX3N0cnVjdHVyZSkge1xyXG4gICAgICAgIGlmIChfc3RydWN0dXJlW25dIGluc3RhbmNlb2YgQW5pbWF0aW9uU2VxdWVuY2UpIHtcclxuICAgICAgICAgIG5ld1NlcmlhbGl6YXRpb25bbl0gPSBfc3RydWN0dXJlW25dLnNlcmlhbGl6ZSgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBuZXdTZXJpYWxpemF0aW9uW25dID0gdGhpcy50cmF2ZXJzZVN0cnVjdHVyZUZvclNlcmlhbGlzYXRpb24oPEFuaW1hdGlvblN0cnVjdHVyZT5fc3RydWN0dXJlW25dKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIG5ld1NlcmlhbGl6YXRpb247XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFRyYXZlcnNlcyBhIFNlcmlhbGl6YXRpb24gdG8gY3JlYXRlIGEgbmV3IEFuaW1hdGlvblN0cnVjdHVyZS5cclxuICAgICAqIEBwYXJhbSBfc2VyaWFsaXphdGlvbiBUaGUgc2VyaWFsaXphdGlvbiB0byB0cmFuc2ZlciBpbnRvIGFuIEFuaW1hdGlvblN0cnVjdHVyZVxyXG4gICAgICogQHJldHVybnMgdGhlIG5ld2x5IGNyZWF0ZWQgQW5pbWF0aW9uU3RydWN0dXJlLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHRyYXZlcnNlU3RydWN0dXJlRm9yRGVzZXJpYWxpc2F0aW9uKF9zZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uKTogQW5pbWF0aW9uU3RydWN0dXJlIHtcclxuICAgICAgbGV0IG5ld1N0cnVjdHVyZTogQW5pbWF0aW9uU3RydWN0dXJlID0ge307XHJcbiAgICAgIGZvciAobGV0IG4gaW4gX3NlcmlhbGl6YXRpb24pIHtcclxuICAgICAgICBpZiAoX3NlcmlhbGl6YXRpb25bbl0uYW5pbWF0aW9uU2VxdWVuY2UpIHtcclxuICAgICAgICAgIGxldCBhbmltU2VxOiBBbmltYXRpb25TZXF1ZW5jZSA9IG5ldyBBbmltYXRpb25TZXF1ZW5jZSgpO1xyXG4gICAgICAgICAgbmV3U3RydWN0dXJlW25dID0gYW5pbVNlcS5kZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbltuXSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG5ld1N0cnVjdHVyZVtuXSA9IHRoaXMudHJhdmVyc2VTdHJ1Y3R1cmVGb3JEZXNlcmlhbGlzYXRpb24oX3NlcmlhbGl6YXRpb25bbl0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gbmV3U3RydWN0dXJlO1xyXG4gICAgfVxyXG4gICAgLy8jZW5kcmVnaW9uXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGaW5kcyB0aGUgbGlzdCBvZiBldmVudHMgdG8gYmUgdXNlZCB3aXRoIHRoZXNlIHNldHRpbmdzLlxyXG4gICAgICogQHBhcmFtIF9kaXJlY3Rpb24gVGhlIGRpcmVjdGlvbiB0aGUgYW5pbWF0aW9uIGlzIHBsYXlpbmcgaW4uXHJcbiAgICAgKiBAcGFyYW0gX3BsYXliYWNrIFRoZSBwbGF5YmFja21vZGUgdGhlIGFuaW1hdGlvbiBpcyBwbGF5aW5nIGluLlxyXG4gICAgICogQHJldHVybnMgVGhlIGNvcnJlY3QgQW5pbWF0aW9uRXZlbnRUcmlnZ2VyIE9iamVjdCB0byB1c2VcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBnZXRDb3JyZWN0RXZlbnRMaXN0KF9kaXJlY3Rpb246IG51bWJlciwgX3BsYXliYWNrOiBBTklNQVRJT05fUExBWUJBQ0spOiBBbmltYXRpb25FdmVudFRyaWdnZXIge1xyXG4gICAgICBpZiAoX3BsYXliYWNrICE9IEFOSU1BVElPTl9QTEFZQkFDSy5GUkFNRUJBU0VEKSB7XHJcbiAgICAgICAgaWYgKF9kaXJlY3Rpb24gPj0gMCkge1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UHJvY2Vzc2VkRXZlbnRUcmlnZ2VyKEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRS5OT1JNQUwpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy5nZXRQcm9jZXNzZWRFdmVudFRyaWdnZXIoQU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFLlJFVkVSU0UpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBpZiAoX2RpcmVjdGlvbiA+PSAwKSB7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy5nZXRQcm9jZXNzZWRFdmVudFRyaWdnZXIoQU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFLlJBU1RFUkVEKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UHJvY2Vzc2VkRXZlbnRUcmlnZ2VyKEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRS5SQVNURVJFRFJFVkVSU0UpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVHJhdmVyc2VzIGFuIEFuaW1hdGlvblN0cnVjdHVyZSB0byB0dXJuIGl0IGludG8gdGhlIFwiTXV0YXRvclwiIHRvIHJldHVybiB0byB0aGUgQ29tcG9uZW50LlxyXG4gICAgICogQHBhcmFtIF9zdHJ1Y3R1cmUgVGhlIHN0cmN1dHVyZSB0byB0cmF2ZXJzZVxyXG4gICAgICogQHBhcmFtIF90aW1lIHRoZSBwb2ludCBpbiB0aW1lIHRvIHdyaXRlIHRoZSBhbmltYXRpb24gbnVtYmVycyBpbnRvLlxyXG4gICAgICogQHJldHVybnMgVGhlIFwiTXV0YXRvclwiIGZpbGxlZCB3aXRoIHRoZSBjb3JyZWN0IHZhbHVlcyBhdCB0aGUgZ2l2ZW4gdGltZS4gXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgdHJhdmVyc2VTdHJ1Y3R1cmVGb3JNdXRhdG9yKF9zdHJ1Y3R1cmU6IEFuaW1hdGlvblN0cnVjdHVyZSwgX3RpbWU6IG51bWJlcik6IE11dGF0b3Ige1xyXG4gICAgICBsZXQgbmV3TXV0YXRvcjogTXV0YXRvciA9IHt9O1xyXG4gICAgICBmb3IgKGxldCBuIGluIF9zdHJ1Y3R1cmUpIHtcclxuICAgICAgICBpZiAoX3N0cnVjdHVyZVtuXSBpbnN0YW5jZW9mIEFuaW1hdGlvblNlcXVlbmNlKSB7XHJcbiAgICAgICAgICBuZXdNdXRhdG9yW25dID0gKDxBbmltYXRpb25TZXF1ZW5jZT5fc3RydWN0dXJlW25dKS5ldmFsdWF0ZShfdGltZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG5ld011dGF0b3Jbbl0gPSB0aGlzLnRyYXZlcnNlU3RydWN0dXJlRm9yTXV0YXRvcig8QW5pbWF0aW9uU3RydWN0dXJlPl9zdHJ1Y3R1cmVbbl0sIF90aW1lKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIG5ld011dGF0b3I7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUcmF2ZXJzZXMgdGhlIGN1cnJlbnQgQW5pbWF0aW9uU3RyY3V0dXJlIHRvIGZpbmQgdGhlIHRvdGFsVGltZSBvZiB0aGlzIGFuaW1hdGlvbi5cclxuICAgICAqIEBwYXJhbSBfc3RydWN0dXJlIFRoZSBzdHJ1Y3R1cmUgdG8gdHJhdmVyc2VcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSB0cmF2ZXJzZVN0cnVjdHVyZUZvclRpbWUoX3N0cnVjdHVyZTogQW5pbWF0aW9uU3RydWN0dXJlKTogdm9pZCB7XHJcbiAgICAgIGZvciAobGV0IG4gaW4gX3N0cnVjdHVyZSkge1xyXG4gICAgICAgIGlmIChfc3RydWN0dXJlW25dIGluc3RhbmNlb2YgQW5pbWF0aW9uU2VxdWVuY2UpIHtcclxuICAgICAgICAgIGxldCBzZXF1ZW5jZTogQW5pbWF0aW9uU2VxdWVuY2UgPSA8QW5pbWF0aW9uU2VxdWVuY2U+X3N0cnVjdHVyZVtuXTtcclxuICAgICAgICAgIGlmIChzZXF1ZW5jZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGxldCBzZXF1ZW5jZVRpbWU6IG51bWJlciA9IHNlcXVlbmNlLmdldEtleShzZXF1ZW5jZS5sZW5ndGggLSAxKS5UaW1lO1xyXG4gICAgICAgICAgICB0aGlzLnRvdGFsVGltZSA9IHNlcXVlbmNlVGltZSA+IHRoaXMudG90YWxUaW1lID8gc2VxdWVuY2VUaW1lIDogdGhpcy50b3RhbFRpbWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMudHJhdmVyc2VTdHJ1Y3R1cmVGb3JUaW1lKDxBbmltYXRpb25TdHJ1Y3R1cmU+X3N0cnVjdHVyZVtuXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBFbnN1cmVzIHRoZSBleGlzdGFuY2Ugb2YgdGhlIHJlcXVlc3RlZCBbW0FuaW1hdGlvblN0cmN1dHVyZV1dIGFuZCByZXR1cm5zIGl0LlxyXG4gICAgICogQHBhcmFtIF90eXBlIHRoZSB0eXBlIG9mIHRoZSBzdHJ1Y3R1cmUgdG8gZ2V0XHJcbiAgICAgKiBAcmV0dXJucyB0aGUgcmVxdWVzdGVkIFtbQW5pbWF0aW9uU3RydWN0dXJlXV1cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBnZXRQcm9jZXNzZWRBbmltYXRpb25TdHJ1Y3R1cmUoX3R5cGU6IEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRSk6IEFuaW1hdGlvblN0cnVjdHVyZSB7XHJcbiAgICAgIGlmICghdGhpcy5hbmltYXRpb25TdHJ1Y3R1cmVzUHJvY2Vzc2VkLmhhcyhfdHlwZSkpIHtcclxuICAgICAgICB0aGlzLmNhbGN1bGF0ZVRvdGFsVGltZSgpO1xyXG4gICAgICAgIGxldCBhZTogQW5pbWF0aW9uU3RydWN0dXJlID0ge307XHJcbiAgICAgICAgc3dpdGNoIChfdHlwZSkge1xyXG4gICAgICAgICAgY2FzZSBBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUuTk9STUFMOlxyXG4gICAgICAgICAgICBhZSA9IHRoaXMuYW5pbWF0aW9uU3RydWN0dXJlO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgQU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFLlJFVkVSU0U6XHJcbiAgICAgICAgICAgIGFlID0gdGhpcy50cmF2ZXJzZVN0cnVjdHVyZUZvck5ld1N0cnVjdHVyZSh0aGlzLmFuaW1hdGlvblN0cnVjdHVyZSwgdGhpcy5jYWxjdWxhdGVSZXZlcnNlU2VxdWVuY2UuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSBBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUuUkFTVEVSRUQ6XHJcbiAgICAgICAgICAgIGFlID0gdGhpcy50cmF2ZXJzZVN0cnVjdHVyZUZvck5ld1N0cnVjdHVyZSh0aGlzLmFuaW1hdGlvblN0cnVjdHVyZSwgdGhpcy5jYWxjdWxhdGVSYXN0ZXJlZFNlcXVlbmNlLmJpbmQodGhpcykpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgQU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFLlJBU1RFUkVEUkVWRVJTRTpcclxuICAgICAgICAgICAgYWUgPSB0aGlzLnRyYXZlcnNlU3RydWN0dXJlRm9yTmV3U3RydWN0dXJlKHRoaXMuZ2V0UHJvY2Vzc2VkQW5pbWF0aW9uU3RydWN0dXJlKEFOSU1BVElPTl9TVFJVQ1RVUkVfVFlQRS5SRVZFUlNFKSwgdGhpcy5jYWxjdWxhdGVSYXN0ZXJlZFNlcXVlbmNlLmJpbmQodGhpcykpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIHJldHVybiB7fTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5hbmltYXRpb25TdHJ1Y3R1cmVzUHJvY2Vzc2VkLnNldChfdHlwZSwgYWUpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB0aGlzLmFuaW1hdGlvblN0cnVjdHVyZXNQcm9jZXNzZWQuZ2V0KF90eXBlKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEVuc3VyZXMgdGhlIGV4aXN0YW5jZSBvZiB0aGUgcmVxdWVzdGVkIFtbQW5pbWF0aW9uRXZlbnRUcmlnZ2VyXV0gYW5kIHJldHVybnMgaXQuXHJcbiAgICAgKiBAcGFyYW0gX3R5cGUgVGhlIHR5cGUgb2YgQW5pbWF0aW9uRXZlbnRUcmlnZ2VyIHRvIGdldFxyXG4gICAgICogQHJldHVybnMgdGhlIHJlcXVlc3RlZCBbW0FuaW1hdGlvbkV2ZW50VHJpZ2dlcl1dXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZ2V0UHJvY2Vzc2VkRXZlbnRUcmlnZ2VyKF90eXBlOiBBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUpOiBBbmltYXRpb25FdmVudFRyaWdnZXIge1xyXG4gICAgICBpZiAoIXRoaXMuZXZlbnRzUHJvY2Vzc2VkLmhhcyhfdHlwZSkpIHtcclxuICAgICAgICB0aGlzLmNhbGN1bGF0ZVRvdGFsVGltZSgpO1xyXG4gICAgICAgIGxldCBldjogQW5pbWF0aW9uRXZlbnRUcmlnZ2VyID0ge307XHJcbiAgICAgICAgc3dpdGNoIChfdHlwZSkge1xyXG4gICAgICAgICAgY2FzZSBBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUuTk9STUFMOlxyXG4gICAgICAgICAgICBldiA9IHRoaXMuZXZlbnRzO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgQU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFLlJFVkVSU0U6XHJcbiAgICAgICAgICAgIGV2ID0gdGhpcy5jYWxjdWxhdGVSZXZlcnNlRXZlbnRUcmlnZ2Vycyh0aGlzLmV2ZW50cyk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSBBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUuUkFTVEVSRUQ6XHJcbiAgICAgICAgICAgIGV2ID0gdGhpcy5jYWxjdWxhdGVSYXN0ZXJlZEV2ZW50VHJpZ2dlcnModGhpcy5ldmVudHMpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgQU5JTUFUSU9OX1NUUlVDVFVSRV9UWVBFLlJBU1RFUkVEUkVWRVJTRTpcclxuICAgICAgICAgICAgZXYgPSB0aGlzLmNhbGN1bGF0ZVJhc3RlcmVkRXZlbnRUcmlnZ2Vycyh0aGlzLmdldFByb2Nlc3NlZEV2ZW50VHJpZ2dlcihBTklNQVRJT05fU1RSVUNUVVJFX1RZUEUuUkVWRVJTRSkpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIHJldHVybiB7fTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5ldmVudHNQcm9jZXNzZWQuc2V0KF90eXBlLCBldik7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRoaXMuZXZlbnRzUHJvY2Vzc2VkLmdldChfdHlwZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUcmF2ZXJzZXMgYW4gZXhpc3Rpbmcgc3RydWN0dXJlIHRvIGFwcGx5IGEgcmVjYWxjdWxhdGlvbiBmdW5jdGlvbiB0byB0aGUgQW5pbWF0aW9uU3RydWN0dXJlIHRvIHN0b3JlIGluIGEgbmV3IFN0cnVjdHVyZS5cclxuICAgICAqIEBwYXJhbSBfb2xkU3RydWN0dXJlIFRoZSBvbGQgc3RydWN0dXJlIHRvIHRyYXZlcnNlXHJcbiAgICAgKiBAcGFyYW0gX2Z1bmN0aW9uVG9Vc2UgVGhlIGZ1bmN0aW9uIHRvIHVzZSB0byByZWNhbGN1bGF0ZWQgdGhlIHN0cnVjdHVyZS5cclxuICAgICAqIEByZXR1cm5zIEEgbmV3IEFuaW1hdGlvbiBTdHJ1Y3R1cmUgd2l0aCB0aGUgcmVjYWx1bGF0ZWQgQW5pbWF0aW9uIFNlcXVlbmNlcy5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSB0cmF2ZXJzZVN0cnVjdHVyZUZvck5ld1N0cnVjdHVyZShfb2xkU3RydWN0dXJlOiBBbmltYXRpb25TdHJ1Y3R1cmUsIF9mdW5jdGlvblRvVXNlOiBGdW5jdGlvbik6IEFuaW1hdGlvblN0cnVjdHVyZSB7XHJcbiAgICAgIGxldCBuZXdTdHJ1Y3R1cmU6IEFuaW1hdGlvblN0cnVjdHVyZSA9IHt9O1xyXG4gICAgICBmb3IgKGxldCBuIGluIF9vbGRTdHJ1Y3R1cmUpIHtcclxuICAgICAgICBpZiAoX29sZFN0cnVjdHVyZVtuXSBpbnN0YW5jZW9mIEFuaW1hdGlvblNlcXVlbmNlKSB7XHJcbiAgICAgICAgICBuZXdTdHJ1Y3R1cmVbbl0gPSBfZnVuY3Rpb25Ub1VzZShfb2xkU3RydWN0dXJlW25dKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbmV3U3RydWN0dXJlW25dID0gdGhpcy50cmF2ZXJzZVN0cnVjdHVyZUZvck5ld1N0cnVjdHVyZSg8QW5pbWF0aW9uU3RydWN0dXJlPl9vbGRTdHJ1Y3R1cmVbbl0sIF9mdW5jdGlvblRvVXNlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIG5ld1N0cnVjdHVyZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgYSByZXZlcnNlZCBBbmltYXRpb24gU2VxdWVuY2Ugb3V0IG9mIGEgZ2l2ZW4gU2VxdWVuY2UuXHJcbiAgICAgKiBAcGFyYW0gX3NlcXVlbmNlIFRoZSBzZXF1ZW5jZSB0byBjYWxjdWxhdGUgdGhlIG5ldyBzZXF1ZW5jZSBvdXQgb2ZcclxuICAgICAqIEByZXR1cm5zIFRoZSByZXZlcnNlZCBTZXF1ZW5jZVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGNhbGN1bGF0ZVJldmVyc2VTZXF1ZW5jZShfc2VxdWVuY2U6IEFuaW1hdGlvblNlcXVlbmNlKTogQW5pbWF0aW9uU2VxdWVuY2Uge1xyXG4gICAgICBsZXQgc2VxOiBBbmltYXRpb25TZXF1ZW5jZSA9IG5ldyBBbmltYXRpb25TZXF1ZW5jZSgpO1xyXG4gICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgX3NlcXVlbmNlLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgbGV0IG9sZEtleTogQW5pbWF0aW9uS2V5ID0gX3NlcXVlbmNlLmdldEtleShpKTtcclxuICAgICAgICBsZXQga2V5OiBBbmltYXRpb25LZXkgPSBuZXcgQW5pbWF0aW9uS2V5KHRoaXMudG90YWxUaW1lIC0gb2xkS2V5LlRpbWUsIG9sZEtleS5WYWx1ZSwgb2xkS2V5LlNsb3BlT3V0LCBvbGRLZXkuU2xvcGVJbiwgb2xkS2V5LkNvbnN0YW50KTtcclxuICAgICAgICBzZXEuYWRkS2V5KGtleSk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHNlcTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgYSByYXN0ZXJlZCBbW0FuaW1hdGlvblNlcXVlbmNlXV0gb3V0IG9mIGEgZ2l2ZW4gc2VxdWVuY2UuXHJcbiAgICAgKiBAcGFyYW0gX3NlcXVlbmNlIFRoZSBzZXF1ZW5jZSB0byBjYWxjdWxhdGUgdGhlIG5ldyBzZXF1ZW5jZSBvdXQgb2ZcclxuICAgICAqIEByZXR1cm5zIHRoZSByYXN0ZXJlZCBzZXF1ZW5jZS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjYWxjdWxhdGVSYXN0ZXJlZFNlcXVlbmNlKF9zZXF1ZW5jZTogQW5pbWF0aW9uU2VxdWVuY2UpOiBBbmltYXRpb25TZXF1ZW5jZSB7XHJcbiAgICAgIGxldCBzZXE6IEFuaW1hdGlvblNlcXVlbmNlID0gbmV3IEFuaW1hdGlvblNlcXVlbmNlKCk7XHJcbiAgICAgIGxldCBmcmFtZVRpbWU6IG51bWJlciA9IDEwMDAgLyB0aGlzLmZyYW1lc1BlclNlY29uZDtcclxuICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHRoaXMudG90YWxUaW1lOyBpICs9IGZyYW1lVGltZSkge1xyXG4gICAgICAgIGxldCBrZXk6IEFuaW1hdGlvbktleSA9IG5ldyBBbmltYXRpb25LZXkoaSwgX3NlcXVlbmNlLmV2YWx1YXRlKGkpLCAwLCAwLCB0cnVlKTtcclxuICAgICAgICBzZXEuYWRkS2V5KGtleSk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHNlcTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgYSBuZXcgcmV2ZXJzZWQgW1tBbmltYXRpb25FdmVudFRyaWdnZXJdXSBvYmplY3QgYmFzZWQgb24gdGhlIGdpdmVuIG9uZS4gIFxyXG4gICAgICogQHBhcmFtIF9ldmVudHMgdGhlIGV2ZW50IG9iamVjdCB0byBjYWxjdWxhdGUgdGhlIG5ldyBvbmUgb3V0IG9mXHJcbiAgICAgKiBAcmV0dXJucyB0aGUgcmV2ZXJzZWQgZXZlbnQgb2JqZWN0XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgY2FsY3VsYXRlUmV2ZXJzZUV2ZW50VHJpZ2dlcnMoX2V2ZW50czogQW5pbWF0aW9uRXZlbnRUcmlnZ2VyKTogQW5pbWF0aW9uRXZlbnRUcmlnZ2VyIHtcclxuICAgICAgbGV0IGFlOiBBbmltYXRpb25FdmVudFRyaWdnZXIgPSB7fTtcclxuICAgICAgZm9yIChsZXQgbmFtZSBpbiBfZXZlbnRzKSB7XHJcbiAgICAgICAgYWVbbmFtZV0gPSB0aGlzLnRvdGFsVGltZSAtIF9ldmVudHNbbmFtZV07XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGFlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgYSByYXN0ZXJlZCBbW0FuaW1hdGlvbkV2ZW50VHJpZ2dlcl1dIG9iamVjdCBiYXNlZCBvbiB0aGUgZ2l2ZW4gb25lLiAgXHJcbiAgICAgKiBAcGFyYW0gX2V2ZW50cyB0aGUgZXZlbnQgb2JqZWN0IHRvIGNhbGN1bGF0ZSB0aGUgbmV3IG9uZSBvdXQgb2ZcclxuICAgICAqIEByZXR1cm5zIHRoZSByYXN0ZXJlZCBldmVudCBvYmplY3RcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjYWxjdWxhdGVSYXN0ZXJlZEV2ZW50VHJpZ2dlcnMoX2V2ZW50czogQW5pbWF0aW9uRXZlbnRUcmlnZ2VyKTogQW5pbWF0aW9uRXZlbnRUcmlnZ2VyIHtcclxuICAgICAgbGV0IGFlOiBBbmltYXRpb25FdmVudFRyaWdnZXIgPSB7fTtcclxuICAgICAgbGV0IGZyYW1lVGltZTogbnVtYmVyID0gMTAwMCAvIHRoaXMuZnJhbWVzUGVyU2Vjb25kO1xyXG4gICAgICBmb3IgKGxldCBuYW1lIGluIF9ldmVudHMpIHtcclxuICAgICAgICBhZVtuYW1lXSA9IF9ldmVudHNbbmFtZV0gLSAoX2V2ZW50c1tuYW1lXSAlIGZyYW1lVGltZSk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGFlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrcyB3aGljaCBldmVudHMgbGF5IGJldHdlZW4gdHdvIGdpdmVuIHRpbWVzIGFuZCByZXR1cm5zIHRoZSBuYW1lcyBvZiB0aGUgb25lcyB0aGF0IGRvLlxyXG4gICAgICogQHBhcmFtIF9ldmVudFRyaWdnZXJzIFRoZSBldmVudCBvYmplY3QgdG8gY2hlY2sgdGhlIGV2ZW50cyBpbnNpZGUgb2ZcclxuICAgICAqIEBwYXJhbSBfbWluIHRoZSBtaW5pbXVtIG9mIHRoZSByYW5nZSB0byBjaGVjayBiZXR3ZWVuIChpbmNsdXNpdmUpXHJcbiAgICAgKiBAcGFyYW0gX21heCB0aGUgbWF4aW11bSBvZiB0aGUgcmFuZ2UgdG8gY2hlY2sgYmV0d2VlbiAoZXhjbHVzaXZlKVxyXG4gICAgICogQHJldHVybnMgYW4gYXJyYXkgb2YgdGhlIG5hbWVzIG9mIHRoZSBldmVudHMgaW4gdGhlIGdpdmVuIHJhbmdlLiBcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjaGVja0V2ZW50c0JldHdlZW4oX2V2ZW50VHJpZ2dlcnM6IEFuaW1hdGlvbkV2ZW50VHJpZ2dlciwgX21pbjogbnVtYmVyLCBfbWF4OiBudW1iZXIpOiBzdHJpbmdbXSB7XHJcbiAgICAgIGxldCBldmVudHNUb1RyaWdnZXI6IHN0cmluZ1tdID0gW107XHJcbiAgICAgIGZvciAobGV0IG5hbWUgaW4gX2V2ZW50VHJpZ2dlcnMpIHtcclxuICAgICAgICBpZiAoX21pbiA8PSBfZXZlbnRUcmlnZ2Vyc1tuYW1lXSAmJiBfZXZlbnRUcmlnZ2Vyc1tuYW1lXSA8IF9tYXgpIHtcclxuICAgICAgICAgIGV2ZW50c1RvVHJpZ2dlci5wdXNoKG5hbWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZXZlbnRzVG9UcmlnZ2VyO1xyXG4gICAgfVxyXG4gIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9UcmFuc2Zlci9TZXJpYWxpemVyLnRzXCIvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vVHJhbnNmZXIvTXV0YWJsZS50c1wiLz5cclxuXHJcbm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gIC8qKlxyXG4gICAqIENhbGN1bGF0ZXMgdGhlIHZhbHVlcyBiZXR3ZWVuIFtbQW5pbWF0aW9uS2V5XV1zLlxyXG4gICAqIFJlcHJlc2VudGVkIGludGVybmFsbHkgYnkgYSBjdWJpYyBmdW5jdGlvbiAoYGYoeCkgPSBheMKzICsgYnjCsiArIGN4ICsgZGApLiBcclxuICAgKiBPbmx5IG5lZWRzIHRvIGJlIHJlY2FsY3VsYXRlZCB3aGVuIHRoZSBrZXlzIGNoYW5nZSwgc28gYXQgcnVudGltZSBpdCBzaG91bGQgb25seSBiZSBjYWxjdWxhdGVkIG9uY2UuXHJcbiAgICogQGF1dGhvciBMdWthcyBTY2hldWVybGUsIEhGVSwgMjAxOVxyXG4gICAqL1xyXG4gIGV4cG9ydCBjbGFzcyBBbmltYXRpb25GdW5jdGlvbiB7XHJcbiAgICBwcml2YXRlIGE6IG51bWJlciA9IDA7XHJcbiAgICBwcml2YXRlIGI6IG51bWJlciA9IDA7XHJcbiAgICBwcml2YXRlIGM6IG51bWJlciA9IDA7XHJcbiAgICBwcml2YXRlIGQ6IG51bWJlciA9IDA7XHJcbiAgICBwcml2YXRlIGtleUluOiBBbmltYXRpb25LZXk7XHJcbiAgICBwcml2YXRlIGtleU91dDogQW5pbWF0aW9uS2V5O1xyXG5cclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihfa2V5SW46IEFuaW1hdGlvbktleSwgX2tleU91dDogQW5pbWF0aW9uS2V5ID0gbnVsbCkge1xyXG4gICAgICB0aGlzLmtleUluID0gX2tleUluO1xyXG4gICAgICB0aGlzLmtleU91dCA9IF9rZXlPdXQ7XHJcbiAgICAgIHRoaXMuY2FsY3VsYXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxjdWxhdGVzIHRoZSB2YWx1ZSBvZiB0aGUgZnVuY3Rpb24gYXQgdGhlIGdpdmVuIHRpbWUuXHJcbiAgICAgKiBAcGFyYW0gX3RpbWUgdGhlIHBvaW50IGluIHRpbWUgYXQgd2hpY2ggdG8gZXZhbHVhdGUgdGhlIGZ1bmN0aW9uIGluIG1pbGxpc2Vjb25kcy4gV2lsbCBiZSBjb3JyZWN0ZWQgZm9yIG9mZnNldCBpbnRlcm5hbGx5LlxyXG4gICAgICogQHJldHVybnMgdGhlIHZhbHVlIGF0IHRoZSBnaXZlbiB0aW1lXHJcbiAgICAgKi9cclxuICAgIGV2YWx1YXRlKF90aW1lOiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgICBfdGltZSAtPSB0aGlzLmtleUluLlRpbWU7XHJcbiAgICAgIGxldCB0aW1lMjogbnVtYmVyID0gX3RpbWUgKiBfdGltZTtcclxuICAgICAgbGV0IHRpbWUzOiBudW1iZXIgPSB0aW1lMiAqIF90aW1lO1xyXG4gICAgICByZXR1cm4gdGhpcy5hICogdGltZTMgKyB0aGlzLmIgKiB0aW1lMiArIHRoaXMuYyAqIF90aW1lICsgdGhpcy5kO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCBzZXRLZXlJbihfa2V5SW46IEFuaW1hdGlvbktleSkge1xyXG4gICAgICB0aGlzLmtleUluID0gX2tleUluO1xyXG4gICAgICB0aGlzLmNhbGN1bGF0ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCBzZXRLZXlPdXQoX2tleU91dDogQW5pbWF0aW9uS2V5KSB7XHJcbiAgICAgIHRoaXMua2V5T3V0ID0gX2tleU91dDtcclxuICAgICAgdGhpcy5jYWxjdWxhdGUoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIChSZS0pQ2FsY3VsYXRlcyB0aGUgcGFyYW1ldGVycyBvZiB0aGUgY3ViaWMgZnVuY3Rpb24uXHJcbiAgICAgKiBTZWUgaHR0cHM6Ly9tYXRoLnN0YWNrZXhjaGFuZ2UuY29tL3F1ZXN0aW9ucy8zMTczNDY5L2NhbGN1bGF0ZS1jdWJpYy1lcXVhdGlvbi1mcm9tLXR3by1wb2ludHMtYW5kLXR3by1zbG9wZXMtdmFyaWFibHlcclxuICAgICAqIGFuZCBodHRwczovL2ppcmthZGVsbG9yby5naXRodWIuaW8vRlVER0UvRG9jdW1lbnRhdGlvbi9Mb2dzLzE5MDQxMF9Ob3RpemVuX0xTXHJcbiAgICAgKi9cclxuICAgIGNhbGN1bGF0ZSgpOiB2b2lkIHtcclxuICAgICAgaWYgKCF0aGlzLmtleUluKSB7XHJcbiAgICAgICAgdGhpcy5kID0gdGhpcy5jID0gdGhpcy5iID0gdGhpcy5hID0gMDtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCF0aGlzLmtleU91dCB8fCB0aGlzLmtleUluLkNvbnN0YW50KSB7XHJcbiAgICAgICAgdGhpcy5kID0gdGhpcy5rZXlJbi5WYWx1ZTtcclxuICAgICAgICB0aGlzLmMgPSB0aGlzLmIgPSB0aGlzLmEgPSAwO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgbGV0IHgxOiBudW1iZXIgPSB0aGlzLmtleU91dC5UaW1lIC0gdGhpcy5rZXlJbi5UaW1lO1xyXG5cclxuICAgICAgdGhpcy5kID0gdGhpcy5rZXlJbi5WYWx1ZTtcclxuICAgICAgdGhpcy5jID0gdGhpcy5rZXlJbi5TbG9wZU91dDtcclxuXHJcbiAgICAgIHRoaXMuYSA9ICgteDEgKiAodGhpcy5rZXlJbi5TbG9wZU91dCArIHRoaXMua2V5T3V0LlNsb3BlSW4pIC0gMiAqIHRoaXMua2V5SW4uVmFsdWUgKyAyICogdGhpcy5rZXlPdXQuVmFsdWUpIC8gLU1hdGgucG93KHgxLCAzKTtcclxuICAgICAgdGhpcy5iID0gKHRoaXMua2V5T3V0LlNsb3BlSW4gLSB0aGlzLmtleUluLlNsb3BlT3V0IC0gMyAqIHRoaXMuYSAqIE1hdGgucG93KHgxLCAyKSkgLyAoMiAqIHgxKTtcclxuICAgIH1cclxuICB9XHJcblxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL1RyYW5zZmVyL1NlcmlhbGl6ZXIudHNcIi8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9UcmFuc2Zlci9NdXRhYmxlLnRzXCIvPlxyXG5cclxubmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgLyoqXHJcbiAgICogSG9sZHMgaW5mb3JtYXRpb24gYWJvdXQgc2V0IHBvaW50cyBpbiB0aW1lLCB0aGVpciBhY2NvbXBhbnlpbmcgdmFsdWVzIGFzIHdlbGwgYXMgdGhlaXIgc2xvcGVzLiBcclxuICAgKiBBbHNvIGhvbGRzIGEgcmVmZXJlbmNlIHRvIHRoZSBbW0FuaW1hdGlvbkZ1bmN0aW9uXV1zIHRoYXQgY29tZSBpbiBhbmQgb3V0IG9mIHRoZSBzaWRlcy4gVGhlIFtbQW5pbWF0aW9uRnVuY3Rpb25dXXMgYXJlIGhhbmRsZWQgYnkgdGhlIFtbQW5pbWF0aW9uU2VxdWVuY2VdXXMuXHJcbiAgICogU2F2ZWQgaW5zaWRlIGFuIFtbQW5pbWF0aW9uU2VxdWVuY2VdXS5cclxuICAgKiBAYXV0aG9yIEx1a2FzIFNjaGV1ZXJsZSwgSEZVLCAyMDE5XHJcbiAgICovXHJcbiAgZXhwb3J0IGNsYXNzIEFuaW1hdGlvbktleSBleHRlbmRzIE11dGFibGUgaW1wbGVtZW50cyBTZXJpYWxpemFibGUge1xyXG4gICAgLy8gVE9ETzogY2hlY2sgaWYgZnVuY3Rpb25JbiBjYW4gYmUgcmVtb3ZlZFxyXG4gICAgLyoqRG9uJ3QgbW9kaWZ5IHRoaXMgdW5sZXNzIHlvdSBrbm93IHdoYXQgeW91J3JlIGRvaW5nLiovXHJcbiAgICBmdW5jdGlvbkluOiBBbmltYXRpb25GdW5jdGlvbjtcclxuICAgIC8qKkRvbid0IG1vZGlmeSB0aGlzIHVubGVzcyB5b3Uga25vdyB3aGF0IHlvdSdyZSBkb2luZy4qL1xyXG4gICAgZnVuY3Rpb25PdXQ6IEFuaW1hdGlvbkZ1bmN0aW9uO1xyXG4gICAgXHJcbiAgICBicm9rZW46IGJvb2xlYW47XHJcblxyXG4gICAgcHJpdmF0ZSB0aW1lOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHZhbHVlOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGNvbnN0YW50OiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgcHJpdmF0ZSBzbG9wZUluOiBudW1iZXIgPSAwO1xyXG4gICAgcHJpdmF0ZSBzbG9wZU91dDogbnVtYmVyID0gMDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihfdGltZTogbnVtYmVyID0gMCwgX3ZhbHVlOiBudW1iZXIgPSAwLCBfc2xvcGVJbjogbnVtYmVyID0gMCwgX3Nsb3BlT3V0OiBudW1iZXIgPSAwLCBfY29uc3RhbnQ6IGJvb2xlYW4gPSBmYWxzZSkge1xyXG4gICAgICBzdXBlcigpO1xyXG4gICAgICB0aGlzLnRpbWUgPSBfdGltZTtcclxuICAgICAgdGhpcy52YWx1ZSA9IF92YWx1ZTtcclxuICAgICAgdGhpcy5zbG9wZUluID0gX3Nsb3BlSW47XHJcbiAgICAgIHRoaXMuc2xvcGVPdXQgPSBfc2xvcGVPdXQ7XHJcbiAgICAgIHRoaXMuY29uc3RhbnQgPSBfY29uc3RhbnQ7XHJcblxyXG4gICAgICB0aGlzLmJyb2tlbiA9IHRoaXMuc2xvcGVJbiAhPSAtdGhpcy5zbG9wZU91dDtcclxuICAgICAgdGhpcy5mdW5jdGlvbk91dCA9IG5ldyBBbmltYXRpb25GdW5jdGlvbih0aGlzLCBudWxsKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgVGltZSgpOiBudW1iZXIge1xyXG4gICAgICByZXR1cm4gdGhpcy50aW1lO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCBUaW1lKF90aW1lOiBudW1iZXIpIHtcclxuICAgICAgdGhpcy50aW1lID0gX3RpbWU7XHJcbiAgICAgIHRoaXMuZnVuY3Rpb25Jbi5jYWxjdWxhdGUoKTtcclxuICAgICAgdGhpcy5mdW5jdGlvbk91dC5jYWxjdWxhdGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgVmFsdWUoKTogbnVtYmVyIHtcclxuICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IFZhbHVlKF92YWx1ZTogbnVtYmVyKSB7XHJcbiAgICAgIHRoaXMudmFsdWUgPSBfdmFsdWU7XHJcbiAgICAgIHRoaXMuZnVuY3Rpb25Jbi5jYWxjdWxhdGUoKTtcclxuICAgICAgdGhpcy5mdW5jdGlvbk91dC5jYWxjdWxhdGUoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZ2V0IENvbnN0YW50KCk6IGJvb2xlYW4ge1xyXG4gICAgICByZXR1cm4gdGhpcy5jb25zdGFudDtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgQ29uc3RhbnQoX2NvbnN0YW50OiBib29sZWFuKSB7XHJcbiAgICAgIHRoaXMuY29uc3RhbnQgPSBfY29uc3RhbnQ7XHJcbiAgICAgIHRoaXMuZnVuY3Rpb25Jbi5jYWxjdWxhdGUoKTtcclxuICAgICAgdGhpcy5mdW5jdGlvbk91dC5jYWxjdWxhdGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgU2xvcGVJbigpOiBudW1iZXIge1xyXG4gICAgICByZXR1cm4gdGhpcy5zbG9wZUluO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzZXQgU2xvcGVJbihfc2xvcGU6IG51bWJlcikge1xyXG4gICAgICB0aGlzLnNsb3BlSW4gPSBfc2xvcGU7XHJcbiAgICAgIHRoaXMuZnVuY3Rpb25Jbi5jYWxjdWxhdGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgU2xvcGVPdXQoKTogbnVtYmVyIHtcclxuICAgICAgcmV0dXJuIHRoaXMuc2xvcGVPdXQ7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IFNsb3BlT3V0KF9zbG9wZTogbnVtYmVyKSB7XHJcbiAgICAgIHRoaXMuc2xvcGVPdXQgPSBfc2xvcGU7XHJcbiAgICAgIHRoaXMuZnVuY3Rpb25PdXQuY2FsY3VsYXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTdGF0aWMgY29tcGFyYXRpb24gZnVuY3Rpb24gdG8gdXNlIGluIGFuIGFycmF5IHNvcnQgZnVuY3Rpb24gdG8gc29ydCB0aGUga2V5cyBieSB0aGVpciB0aW1lLlxyXG4gICAgICogQHBhcmFtIF9hIHRoZSBhbmltYXRpb24ga2V5IHRvIGNoZWNrXHJcbiAgICAgKiBAcGFyYW0gX2IgdGhlIGFuaW1hdGlvbiBrZXkgdG8gY2hlY2sgYWdhaW5zdFxyXG4gICAgICogQHJldHVybnMgPjAgaWYgYT5iLCAwIGlmIGE9YiwgPDAgaWYgYTxiXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBjb21wYXJlKF9hOiBBbmltYXRpb25LZXksIF9iOiBBbmltYXRpb25LZXkpOiBudW1iZXIge1xyXG4gICAgICByZXR1cm4gX2EudGltZSAtIF9iLnRpbWU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8jcmVnaW9uIHRyYW5zZmVyXHJcbiAgICBzZXJpYWxpemUoKTogU2VyaWFsaXphdGlvbiB7XHJcbiAgICAgIGxldCBzOiBTZXJpYWxpemF0aW9uID0ge307XHJcbiAgICAgIHMudGltZSA9IHRoaXMudGltZTtcclxuICAgICAgcy52YWx1ZSA9IHRoaXMudmFsdWU7XHJcbiAgICAgIHMuc2xvcGVJbiA9IHRoaXMuc2xvcGVJbjtcclxuICAgICAgcy5zbG9wZU91dCA9IHRoaXMuc2xvcGVPdXQ7XHJcbiAgICAgIHMuY29uc3RhbnQgPSB0aGlzLmNvbnN0YW50O1xyXG4gICAgICByZXR1cm4gcztcclxuICAgIH1cclxuXHJcbiAgICBkZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbik6IFNlcmlhbGl6YWJsZSB7XHJcbiAgICAgIHRoaXMudGltZSA9IF9zZXJpYWxpemF0aW9uLnRpbWU7XHJcbiAgICAgIHRoaXMudmFsdWUgPSBfc2VyaWFsaXphdGlvbi52YWx1ZTtcclxuICAgICAgdGhpcy5zbG9wZUluID0gX3NlcmlhbGl6YXRpb24uc2xvcGVJbjtcclxuICAgICAgdGhpcy5zbG9wZU91dCA9IF9zZXJpYWxpemF0aW9uLnNsb3BlT3V0O1xyXG4gICAgICB0aGlzLmNvbnN0YW50ID0gX3NlcmlhbGl6YXRpb24uY29uc3RhbnQ7XHJcblxyXG4gICAgICB0aGlzLmJyb2tlbiA9IHRoaXMuc2xvcGVJbiAhPSAtdGhpcy5zbG9wZU91dDtcclxuXHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIGdldE11dGF0b3IoKTogTXV0YXRvciB7XHJcbiAgICAgIHJldHVybiB0aGlzLnNlcmlhbGl6ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCByZWR1Y2VNdXRhdG9yKF9tdXRhdG9yOiBNdXRhdG9yKTogdm9pZCB7XHJcbiAgICAgIC8vXHJcbiAgICB9XHJcbiAgICAvLyNlbmRyZWdpb25cclxuXHJcbiAgfVxyXG5cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9UcmFuc2Zlci9TZXJpYWxpemVyLnRzXCIvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vVHJhbnNmZXIvTXV0YWJsZS50c1wiLz5cclxuXHJcbm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gIC8qKlxyXG4gICAqIEEgc2VxdWVuY2Ugb2YgW1tBbmltYXRpb25LZXldXXMgdGhhdCBpcyBtYXBwZWQgdG8gYW4gYXR0cmlidXRlIG9mIGEgW1tOb2RlXV0gb3IgaXRzIFtbQ29tcG9uZW50XV1zIGluc2lkZSB0aGUgW1tBbmltYXRpb25dXS5cclxuICAgKiBQcm92aWRlcyBmdW5jdGlvbnMgdG8gbW9kaWZ5IHNhaWQga2V5c1xyXG4gICAqIEBhdXRob3IgTHVrYXMgU2NoZXVlcmxlLCBIRlUsIDIwMTlcclxuICAgKi9cclxuICBleHBvcnQgY2xhc3MgQW5pbWF0aW9uU2VxdWVuY2UgZXh0ZW5kcyBNdXRhYmxlIGltcGxlbWVudHMgU2VyaWFsaXphYmxlIHtcclxuICAgIHByaXZhdGUga2V5czogQW5pbWF0aW9uS2V5W10gPSBbXTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEV2YWx1YXRlcyB0aGUgc2VxdWVuY2UgYXQgdGhlIGdpdmVuIHBvaW50IGluIHRpbWUuXHJcbiAgICAgKiBAcGFyYW0gX3RpbWUgdGhlIHBvaW50IGluIHRpbWUgYXQgd2hpY2ggdG8gZXZhbHVhdGUgdGhlIHNlcXVlbmNlIGluIG1pbGxpc2Vjb25kcy5cclxuICAgICAqIEByZXR1cm5zIHRoZSB2YWx1ZSBvZiB0aGUgc2VxdWVuY2UgYXQgdGhlIGdpdmVuIHRpbWUuIDAgaWYgdGhlcmUgYXJlIG5vIGtleXMuXHJcbiAgICAgKi9cclxuICAgIGV2YWx1YXRlKF90aW1lOiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgICBpZiAodGhpcy5rZXlzLmxlbmd0aCA9PSAwKVxyXG4gICAgICAgIHJldHVybiAwOyAvL1RPRE86IHNob3VsZG4ndCByZXR1cm4gMCBidXQgc29tZXRoaW5nIGluZGljYXRpbmcgbm8gY2hhbmdlLCBsaWtlIG51bGwuIHByb2JhYmx5IG5lZWRzIHRvIGJlIGNoYW5nZWQgaW4gTm9kZSBhcyB3ZWxsIHRvIGlnbm9yZSBub24tbnVtZXJpYyB2YWx1ZXMgaW4gdGhlIGFwcGx5QW5pbWF0aW9uIGZ1bmN0aW9uXHJcbiAgICAgIGlmICh0aGlzLmtleXMubGVuZ3RoID09IDEgfHwgdGhpcy5rZXlzWzBdLlRpbWUgPj0gX3RpbWUpXHJcbiAgICAgICAgcmV0dXJuIHRoaXMua2V5c1swXS5WYWx1ZTtcclxuXHJcblxyXG4gICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgdGhpcy5rZXlzLmxlbmd0aCAtIDE7IGkrKykge1xyXG4gICAgICAgIGlmICh0aGlzLmtleXNbaV0uVGltZSA8PSBfdGltZSAmJiB0aGlzLmtleXNbaSArIDFdLlRpbWUgPiBfdGltZSkge1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMua2V5c1tpXS5mdW5jdGlvbk91dC5ldmFsdWF0ZShfdGltZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB0aGlzLmtleXNbdGhpcy5rZXlzLmxlbmd0aCAtIDFdLlZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkcyBhIG5ldyBrZXkgdG8gdGhlIHNlcXVlbmNlLlxyXG4gICAgICogQHBhcmFtIF9rZXkgdGhlIGtleSB0byBhZGRcclxuICAgICAqL1xyXG4gICAgYWRkS2V5KF9rZXk6IEFuaW1hdGlvbktleSk6IHZvaWQge1xyXG4gICAgICB0aGlzLmtleXMucHVzaChfa2V5KTtcclxuICAgICAgdGhpcy5rZXlzLnNvcnQoQW5pbWF0aW9uS2V5LmNvbXBhcmUpO1xyXG4gICAgICB0aGlzLnJlZ2VuZXJhdGVGdW5jdGlvbnMoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZXMgYSBnaXZlbiBrZXkgZnJvbSB0aGUgc2VxdWVuY2UuXHJcbiAgICAgKiBAcGFyYW0gX2tleSB0aGUga2V5IHRvIHJlbW92ZVxyXG4gICAgICovXHJcbiAgICByZW1vdmVLZXkoX2tleTogQW5pbWF0aW9uS2V5KTogdm9pZCB7XHJcbiAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB0aGlzLmtleXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBpZiAodGhpcy5rZXlzW2ldID09IF9rZXkpIHtcclxuICAgICAgICAgIHRoaXMua2V5cy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICB0aGlzLnJlZ2VuZXJhdGVGdW5jdGlvbnMoKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZXMgdGhlIEFuaW1hdGlvbiBLZXkgYXQgdGhlIGdpdmVuIGluZGV4IGZyb20gdGhlIGtleXMuXHJcbiAgICAgKiBAcGFyYW0gX2luZGV4IHRoZSB6ZXJvLWJhc2VkIGluZGV4IGF0IHdoaWNoIHRvIHJlbW92ZSB0aGUga2V5XHJcbiAgICAgKiBAcmV0dXJucyB0aGUgcmVtb3ZlZCBBbmltYXRpb25LZXkgaWYgc3VjY2Vzc2Z1bCwgbnVsbCBvdGhlcndpc2UuXHJcbiAgICAgKi9cclxuICAgIHJlbW92ZUtleUF0SW5kZXgoX2luZGV4OiBudW1iZXIpOiBBbmltYXRpb25LZXkge1xyXG4gICAgICBpZiAoX2luZGV4IDwgMCB8fCBfaW5kZXggPj0gdGhpcy5rZXlzLmxlbmd0aCkge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICB9XHJcbiAgICAgIGxldCBhazogQW5pbWF0aW9uS2V5ID0gdGhpcy5rZXlzW19pbmRleF07XHJcbiAgICAgIHRoaXMua2V5cy5zcGxpY2UoX2luZGV4LCAxKTtcclxuICAgICAgdGhpcy5yZWdlbmVyYXRlRnVuY3Rpb25zKCk7XHJcbiAgICAgIHJldHVybiBhaztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgYSBrZXkgZnJvbSB0aGUgc2VxdWVuY2UgYXQgdGhlIGRlc2lyZWQgaW5kZXguXHJcbiAgICAgKiBAcGFyYW0gX2luZGV4IHRoZSB6ZXJvLWJhc2VkIGluZGV4IGF0IHdoaWNoIHRvIGdldCB0aGUga2V5XHJcbiAgICAgKiBAcmV0dXJucyB0aGUgQW5pbWF0aW9uS2V5IGF0IHRoZSBpbmRleCBpZiBpdCBleGlzdHMsIG51bGwgb3RoZXJ3aXNlLlxyXG4gICAgICovXHJcbiAgICBnZXRLZXkoX2luZGV4OiBudW1iZXIpOiBBbmltYXRpb25LZXkge1xyXG4gICAgICBpZiAoX2luZGV4IDwgMCB8fCBfaW5kZXggPj0gdGhpcy5rZXlzLmxlbmd0aClcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgcmV0dXJuIHRoaXMua2V5c1tfaW5kZXhdO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBsZW5ndGgoKTogbnVtYmVyIHtcclxuICAgICAgcmV0dXJuIHRoaXMua2V5cy5sZW5ndGg7XHJcbiAgICB9XHJcblxyXG4gICAgLy8jcmVnaW9uIHRyYW5zZmVyXHJcbiAgICBzZXJpYWxpemUoKTogU2VyaWFsaXphdGlvbiB7XHJcbiAgICAgIGxldCBzOiBTZXJpYWxpemF0aW9uID0ge1xyXG4gICAgICAgIGtleXM6IFtdLFxyXG4gICAgICAgIGFuaW1hdGlvblNlcXVlbmNlOiB0cnVlXHJcbiAgICAgIH07XHJcbiAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB0aGlzLmtleXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBzLmtleXNbaV0gPSB0aGlzLmtleXNbaV0uc2VyaWFsaXplKCk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHM7XHJcbiAgICB9XHJcbiAgICBkZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbik6IFNlcmlhbGl6YWJsZSB7XHJcbiAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBfc2VyaWFsaXphdGlvbi5rZXlzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgLy8gdGhpcy5rZXlzLnB1c2goPEFuaW1hdGlvbktleT5TZXJpYWxpemVyLmRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uLmtleXNbaV0pKTtcclxuICAgICAgICBsZXQgazogQW5pbWF0aW9uS2V5ID0gbmV3IEFuaW1hdGlvbktleSgpO1xyXG4gICAgICAgIGsuZGVzZXJpYWxpemUoX3NlcmlhbGl6YXRpb24ua2V5c1tpXSk7XHJcbiAgICAgICAgdGhpcy5rZXlzW2ldID0gaztcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5yZWdlbmVyYXRlRnVuY3Rpb25zKCk7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgcHJvdGVjdGVkIHJlZHVjZU11dGF0b3IoX211dGF0b3I6IE11dGF0b3IpOiB2b2lkIHtcclxuICAgICAgLy9cclxuICAgIH1cclxuICAgIC8vI2VuZHJlZ2lvblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXRpbGl0eSBmdW5jdGlvbiB0aGF0IChyZS0pZ2VuZXJhdGVzIGFsbCBmdW5jdGlvbnMgaW4gdGhlIHNlcXVlbmNlLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHJlZ2VuZXJhdGVGdW5jdGlvbnMoKTogdm9pZCB7XHJcbiAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB0aGlzLmtleXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBsZXQgZjogQW5pbWF0aW9uRnVuY3Rpb24gPSBuZXcgQW5pbWF0aW9uRnVuY3Rpb24odGhpcy5rZXlzW2ldKTtcclxuICAgICAgICB0aGlzLmtleXNbaV0uZnVuY3Rpb25PdXQgPSBmO1xyXG4gICAgICAgIGlmIChpID09IHRoaXMua2V5cy5sZW5ndGggLSAxKSB7XHJcbiAgICAgICAgICAvL1RPRE86IGNoZWNrIGlmIHRoaXMgaXMgZXZlbiB1c2VmdWwuIE1heWJlIHVwZGF0ZSB0aGUgcnVuY29uZGl0aW9uIHRvIGxlbmd0aCAtIDEgaW5zdGVhZC4gTWlnaHQgYmUgcmVkdW5kYW50IGlmIGZ1bmN0aW9uSW4gaXMgcmVtb3ZlZCwgc2VlIFRPRE8gaW4gQW5pbWF0aW9uS2V5LlxyXG4gICAgICAgICAgZi5zZXRLZXlPdXQgPSB0aGlzLmtleXNbMF07XHJcbiAgICAgICAgICB0aGlzLmtleXNbMF0uZnVuY3Rpb25JbiA9IGY7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgZi5zZXRLZXlPdXQgPSB0aGlzLmtleXNbaSArIDFdO1xyXG4gICAgICAgIHRoaXMua2V5c1tpICsgMV0uZnVuY3Rpb25JbiA9IGY7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogRGVzY3JpYmVzIHRoZSBbW0F1ZGlvXV0gY2xhc3MgaW4gd2hpY2ggYWxsIEF1ZGlvIERhdGEgaXMgc3RvcmVkLlxyXG4gICAgICogQXVkaW8gd2lsbCBiZSBnaXZlbiB0byB0aGUgW1tDb21wb25lbnRBdWRpb11dIGZvciBmdXJ0aGVyIHVzYWdlLlxyXG4gICAgICogQGF1dGhvcnMgVGhvbWFzIERvcm5lciwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBBdWRpbyB7XHJcblxyXG4gICAgICAgIHB1YmxpYyB1cmw6IHN0cmluZztcclxuXHJcbiAgICAgICAgcHVibGljIGF1ZGlvQnVmZmVyOiBBdWRpb0J1ZmZlcjtcclxuICAgICAgICBwdWJsaWMgYnVmZmVyU291cmNlOiBBdWRpb0J1ZmZlclNvdXJjZU5vZGU7XHJcblxyXG4gICAgICAgIHB1YmxpYyBsb2NhbEdhaW46IEdhaW5Ob2RlO1xyXG4gICAgICAgIHB1YmxpYyBsb2NhbEdhaW5WYWx1ZTogbnVtYmVyO1xyXG5cclxuICAgICAgICBwdWJsaWMgaXNMb29waW5nOiBib29sZWFuO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDb25zdHJ1Y3RvciBmb3IgdGhlIFtbQXVkaW9dXSBDbGFzc1xyXG4gICAgICAgICAqIEBwYXJhbSBfYXVkaW9Db250ZXh0IGZyb20gW1tBdWRpb1NldHRpbmdzXV1cclxuICAgICAgICAgKiBAcGFyYW0gX2dhaW5WYWx1ZSAwIGZvciBtdXRlZCB8IDEgZm9yIG1heCB2b2x1bWVcclxuICAgICAgICAgKi9cclxuICAgICAgICBjb25zdHJ1Y3RvcihfYXVkaW9Db250ZXh0OiBBdWRpb0NvbnRleHQsIF9hdWRpb1Nlc3Npb25EYXRhOiBBdWRpb1Nlc3Npb25EYXRhLCBfdXJsOiBzdHJpbmcsIF9nYWluVmFsdWU6IG51bWJlciwgX2xvb3A6IGJvb2xlYW4pIHtcclxuICAgICAgICAgICAgdGhpcy5pbml0KF9hdWRpb0NvbnRleHQsIF9hdWRpb1Nlc3Npb25EYXRhLCBfdXJsLCBfZ2FpblZhbHVlLCBfbG9vcCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgYXN5bmMgaW5pdChfYXVkaW9Db250ZXh0OiBBdWRpb0NvbnRleHQsIF9hdWRpb1Nlc3Npb25EYXRhOiBBdWRpb1Nlc3Npb25EYXRhLCBfdXJsOiBzdHJpbmcsIF9nYWluVmFsdWU6IG51bWJlciwgX2xvb3A6IGJvb2xlYW4pOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICAgICAgLy8gRG8gZXZlcnl0aGluZyBpbiBjb25zdHJ1Y3RvclxyXG4gICAgICAgICAgICAvLyBBZGQgdXJsIHRvIEF1ZGlvXHJcbiAgICAgICAgICAgIHRoaXMudXJsID0gX3VybDtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJBdWRpbyB1cmwgXCIgKyB0aGlzLnVybCk7XHJcbiAgICAgICAgICAgIC8vIEdldCBBdWRpb0J1ZmZlclxyXG4gICAgICAgICAgICBjb25zdCBidWZmZXJQcm9tOiBQcm9taXNlPEF1ZGlvQnVmZmVyPiA9IF9hdWRpb1Nlc3Npb25EYXRhLnVybFRvQnVmZmVyKF9hdWRpb0NvbnRleHQsIF91cmwpO1xyXG4gICAgICAgICAgICB3aGlsZSAoIWJ1ZmZlclByb20pIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwid2FpdGluZy4uLlwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhd2FpdCBidWZmZXJQcm9tLnRoZW4odmFsID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYXVkaW9CdWZmZXIgPSB2YWw7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInZhbEJ1ZmZlciBcIiArIHZhbCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkF1ZGlvIGF1ZGlvYnVmZmVyIFwiICsgdGhpcy5hdWRpb0J1ZmZlcik7XHJcbiAgICAgICAgICAgIC8vIC8vIEFkZCBsb2NhbCBHYWluIGZvciBBdWRpbyAgYW5kIGNvbm5lY3QgXHJcbiAgICAgICAgICAgIHRoaXMubG9jYWxHYWluID0gYXdhaXQgX2F1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XHJcbiAgICAgICAgICAgIHRoaXMubG9jYWxHYWluVmFsdWUgPSBhd2FpdCBfZ2FpblZhbHVlO1xyXG4gICAgICAgICAgICAvL2NyZWF0ZSBBdWRpb1xyXG4gICAgICAgICAgICBhd2FpdCB0aGlzLmNyZWF0ZUF1ZGlvKF9hdWRpb0NvbnRleHQsIHRoaXMuYXVkaW9CdWZmZXIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogaW5pdEJ1ZmZlclNvdXJjZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBpbml0QnVmZmVyU291cmNlKF9hdWRpb0NvbnRleHQ6IEF1ZGlvQ29udGV4dCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmJ1ZmZlclNvdXJjZSA9IF9hdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuYnVmZmVyU291cmNlLmJ1ZmZlciA9IHRoaXMuYXVkaW9CdWZmZXI7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiYlMgPSBcIiArIHRoaXMuYnVmZmVyU291cmNlKTtcclxuICAgICAgICAgICAgdGhpcy5idWZmZXJTb3VyY2UuY29ubmVjdChfYXVkaW9Db250ZXh0LmRlc3RpbmF0aW9uKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2V0TG9vcCgpO1xyXG4gICAgICAgICAgICB0aGlzLmFkZExvY2FsR2FpbigpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkJ1ZmZlclNvdXJjZS5idWZmZXI6IFwiICsgdGhpcy5idWZmZXJTb3VyY2UuYnVmZmVyKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJBdWRpb0J1ZmZlcjogXCIgKyB0aGlzLmF1ZGlvQnVmZmVyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vI3JlZ2lvbiBHZXR0ZXIvU2V0dGVyIExvY2FsR2FpblZhbHVlXHJcbiAgICAgICAgcHVibGljIHNldExvY2FsR2FpblZhbHVlKF9sb2NhbEdhaW5WYWx1ZTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMubG9jYWxHYWluVmFsdWUgPSBfbG9jYWxHYWluVmFsdWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0TG9jYWxHYWluVmFsdWUoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubG9jYWxHYWluVmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vI2VuZHJlZ2lvbiBHZXR0ZXIvU2V0dGVyIExvY2FsR2FpblZhbHVlXHJcblxyXG4gICAgICAgIHB1YmxpYyBzZXRCdWZmZXJTb3VyY2UoX2J1ZmZlcjogQXVkaW9CdWZmZXIpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5idWZmZXJTb3VyY2UuYnVmZmVyID0gX2J1ZmZlcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIGNyZWF0ZUF1ZGlvIGJ1aWxkcyBhbiBbW0F1ZGlvXV0gdG8gdXNlIHdpdGggdGhlIFtbQ29tcG9uZW50QXVkaW9dXVxyXG4gICAgICAgICAqIEBwYXJhbSBfYXVkaW9Db250ZXh0IGZyb20gW1tBdWRpb1NldHRpbmdzXV1cclxuICAgICAgICAgKiBAcGFyYW0gX2F1ZGlvQnVmZmVyIGZyb20gW1tBdWRpb1Nlc3Npb25EYXRhXV1cclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIGNyZWF0ZUF1ZGlvKF9hdWRpb0NvbnRleHQ6IEF1ZGlvQ29udGV4dCwgX2F1ZGlvQnVmZmVyOiBBdWRpb0J1ZmZlcik6IEF1ZGlvQnVmZmVyIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJjcmVhdGVBdWRpbygpIFwiICsgXCIgfCBcIiArIFwiIEF1ZGlvQ29udGV4dDogXCIgKyBfYXVkaW9Db250ZXh0KTtcclxuICAgICAgICAgICAgdGhpcy5hdWRpb0J1ZmZlciA9IF9hdWRpb0J1ZmZlcjtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJhQiA9IFwiICsgdGhpcy5hdWRpb0J1ZmZlcik7XHJcbiAgICAgICAgICAgIC8vIEF1ZGlvQnVmZmVyc291cmNlTm9kZSBTZXR1cFxyXG4gICAgICAgICAgICB0aGlzLmluaXRCdWZmZXJTb3VyY2UoX2F1ZGlvQ29udGV4dCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmF1ZGlvQnVmZmVyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzZXRMb29wKCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmJ1ZmZlclNvdXJjZS5sb29wID0gdGhpcy5pc0xvb3Bpbmc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGFkZExvY2FsR2FpbigpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5idWZmZXJTb3VyY2UuY29ubmVjdCh0aGlzLmxvY2FsR2Fpbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIEFkZCBhbiBbW0F1ZGlvRmlsdGVyXV0gdG8gYW4gW1tBdWRpb11dXHJcbiAgICAgKiBAYXV0aG9ycyBUaG9tYXMgRG9ybmVyLCBIRlUsIDIwMTlcclxuICAgICAqL1xyXG4gICAgZW51bSBGSUxURVJfVFlQRSB7XHJcbiAgICAgICAgTE9XUEFTUyA9IFwiTE9XUEFTU1wiLFxyXG4gICAgICAgIEhJR0hQQVNTID0gXCJISUdIUEFTU1wiLFxyXG4gICAgICAgIEJBTkRQQVNTID0gXCJCQU5EUEFTU1wiLFxyXG4gICAgICAgIExPV1NIRUxGID0gXCJMT1dTSEVMRlwiLFxyXG4gICAgICAgIEhJR0hTSEVMRiA9IFwiSElHSFNIRUxGXCIsXHJcbiAgICAgICAgUEVBS0lORyA9IFwiUEVBS0lOR1wiLFxyXG4gICAgICAgIE5PVENIID0gXCJOT1RDSFwiLFxyXG4gICAgICAgIEFMTFBBU1MgPSBcIkFMTFBBU1NcIlxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBBdWRpb0ZpbHRlciB7XHJcblxyXG4gICAgICAgIHB1YmxpYyB1c2VGaWx0ZXI6IGJvb2xlYW47XHJcbiAgICAgICAgcHVibGljIGZpbHRlclR5cGU6IEZJTFRFUl9UWVBFO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnN0cnVjdG9yKF91c2VGaWx0ZXI6IGJvb2xlYW4sIF9maWx0ZXJUeXBlOiBGSUxURVJfVFlQRSkge1xyXG4gICAgICAgICAgICB0aGlzLnVzZUZpbHRlciA9IF91c2VGaWx0ZXI7XHJcbiAgICAgICAgICAgIHRoaXMuZmlsdGVyVHlwZSA9IF9maWx0ZXJUeXBlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogYWRkRmlsdGVyVG9cclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgYWRkRmlsdGVyVG9BdWRpbyhfYXVkaW9CdWZmZXI6IEF1ZGlvQnVmZmVyLCBfZmlsdGVyVHlwZTogRklMVEVSX1RZUEUpOiB2b2lkIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJkbyBub3RoaW5nIGZvciBub3dcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBEZXNjcmliZXMgYSBbW0F1ZGlvTGlzdGVuZXJdXSBhdHRhY2hlZCB0byBhIFtbTm9kZV1dXHJcbiAgICAgKiBAYXV0aG9ycyBUaG9tYXMgRG9ybmVyLCBIRlUsIDIwMTlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIEF1ZGlvTGlzdGVuZXIge1xyXG4gICAgICAgIHB1YmxpYyBhdWRpb0xpc3RlbmVyOiBBdWRpb0xpc3RlbmVyO1xyXG5cclxuICAgICAgICBwcml2YXRlIHBvc2l0aW9uOiBWZWN0b3IzO1xyXG4gICAgICAgIHByaXZhdGUgb3JpZW50YXRpb246IFZlY3RvcjM7XHJcblxyXG4gICAgICAgIC8vIyNUT0RPIEF1ZGlvTGlzdGVuZXJcclxuICAgICAgICBjb25zdHJ1Y3RvcihfYXVkaW9Db250ZXh0OiBBdWRpb0NvbnRleHQpIHtcclxuICAgICAgICAgICAgLy90aGlzLmF1ZGlvTGlzdGVuZXIgPSBfYXVkaW9Db250ZXh0Lmxpc3RlbmVyO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFdlIHdpbGwgY2FsbCBzZXRBdWRpb0xpc3RlbmVyUG9zaXRpb24gd2hlbmV2ZXIgdGhlcmUgaXMgYSBuZWVkIHRvIGNoYW5nZSBQb3NpdGlvbnMuXHJcbiAgICAgICAgICogQWxsIHRoZSBwb3NpdGlvbiB2YWx1ZXMgc2hvdWxkIGJlIGlkZW50aWNhbCB0byB0aGUgY3VycmVudCBQb3NpdGlvbiB0aGlzIGlzIGF0dGVjaGVkIHRvLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIC8vIHB1YmxpYyBzZXRBdWRpb0xpc3RlbmVyUG9zaXRpb24oX3Bvc2l0aW9uOiBWZWN0b3IzKTogdm9pZCB7XHJcbiAgICAgICAgLy8gICAgIHRoaXMuYXVkaW9MaXN0ZW5lci5wb3NpdGlvblgudmFsdWUgPSBfcG9zaXRpb24ueDtcclxuICAgICAgICAvLyAgICAgdGhpcy5hdWRpb0xpc3RlbmVyLnBvc2l0aW9uWS52YWx1ZSA9IF9wb3NpdGlvbi55O1xyXG4gICAgICAgIC8vICAgICB0aGlzLmF1ZGlvTGlzdGVuZXIucG9zaXRpb25aLnZhbHVlID0gX3Bvc2l0aW9uLno7XHJcblxyXG4gICAgICAgIC8vICAgICB0aGlzLnBvc2l0aW9uID0gX3Bvc2l0aW9uO1xyXG4gICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogZ2V0QXVkaW9MaXN0ZW5lclBvc2l0aW9uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGdldEF1ZGlvTGlzdGVuZXJQb3NpdGlvbigpOiBWZWN0b3IzIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucG9zaXRpb247XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBzZXRBdWRpb0xpc3RlbmVyT3JpZW50YXRpb25cclxuICAgICAgICAgKi9cclxuICAgICAgICAvLyBwdWJsaWMgc2V0QXVkaW9MaXN0ZW5lck9yaWVudGF0aW9uKF9vcmllbnRhdGlvbjogVmVjdG9yMyk6IHZvaWQge1xyXG4gICAgICAgIC8vICAgICB0aGlzLmF1ZGlvTGlzdGVuZXIub3JpZW50YXRpb25YLnZhbHVlID0gX29yaWVudGF0aW9uLng7XHJcbiAgICAgICAgLy8gICAgIHRoaXMuYXVkaW9MaXN0ZW5lci5vcmllbnRhdGlvblkudmFsdWUgPSBfb3JpZW50YXRpb24ueTtcclxuICAgICAgICAvLyAgICAgdGhpcy5hdWRpb0xpc3RlbmVyLm9yaWVudGF0aW9uWi52YWx1ZSA9IF9vcmllbnRhdGlvbi56O1xyXG5cclxuICAgICAgICAvLyAgICAgdGhpcy5vcmllbnRhdGlvbiA9IF9vcmllbnRhdGlvbjtcclxuICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIGdldEF1ZGlvTGlzdGVuZXJPcmllbnRhdGlvblxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBnZXRBdWRpb0xpc3RlbmVyT3JpZW50YXRpb24oKTogVmVjdG9yMyB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9yaWVudGF0aW9uO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVXNlIFBvc2l0aW9uIGZyb20gUGFyZW50IE5vZGUgdG8gdXBkYXRlIG93biBQb3NpdGlvbiBhY2NvcmRpbmdseVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIC8vIHByaXZhdGUgZ2V0UGFyZW50Tm9kZVBvc2l0aW9uKCkge1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAvLyB9XHJcbiAgICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogXHJcbiAgICAgKiBAYXV0aG9ycyBUaG9tYXMgRG9ybmVyLCBIRlUsIDIwMTlcclxuICAgICAqL1xyXG4gICAgZW51bSBQQU5OSU5HX01PREVMX1RZUEUge1xyXG4gICAgICAgIEVRVUFMUE9XRVIgPSBcIkVRVUFMUE9XRVJcIixcclxuICAgICAgICBIUkZUID0gXCJIUkZUXCJcclxuICAgIH1cclxuXHJcbiAgICBlbnVtIERJU1RBTkNFX01PREVMX1RZUEUge1xyXG4gICAgICAgIExJTkVBUiA9IFwiTElORUFSXCIsXHJcbiAgICAgICAgSU5WRVJTRSA9IFwiSU5WRVJTRVwiLFxyXG4gICAgICAgIEVYUE9ORU5USUFMID0gXCJFWFBPTkVOVElBTFwiXHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIEF1ZGlvTG9jYWxpc2F0aW9uIHtcclxuXHJcbiAgICAgICAgcHVibGljIHBhbm5lck5vZGU6IFBhbm5lck5vZGU7XHJcbiAgICAgICAgcHVibGljIHBhbm5pbmdNb2RlbDogUEFOTklOR19NT0RFTF9UWVBFO1xyXG4gICAgICAgIHB1YmxpYyBkaXN0YW5jZU1vZGVsOiBESVNUQU5DRV9NT0RFTF9UWVBFO1xyXG4gICAgICAgIHB1YmxpYyByZWZEaXN0YW5jZTogbnVtYmVyO1xyXG4gICAgICAgIHB1YmxpYyBtYXhEaXN0YW5jZTogbnVtYmVyO1xyXG4gICAgICAgIHB1YmxpYyByb2xsb2ZmRmFjdG9yOiBudW1iZXI7XHJcbiAgICAgICAgcHVibGljIGNvbm5lcklubmVyQW5nbGU6IG51bWJlcjtcclxuICAgICAgICBwdWJsaWMgY29uZU91dGVyQW5nbGU6IG51bWJlcjtcclxuICAgICAgICBwdWJsaWMgY29uZU91dGVyR2FpbjogbnVtYmVyO1xyXG4gICAgICAgIHB1YmxpYyBwb3NpdGlvbjogVmVjdG9yMztcclxuICAgICAgICBwdWJsaWMgb3JpZW50YXRpb246IFZlY3RvcjM7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ29uc3RydWN0b3IgZm9yIHRoZSBbW0F1ZGlvTG9jYWxpc2F0aW9uXV0gQ2xhc3NcclxuICAgICAgICAgKiBAcGFyYW0gX2F1ZGlvQ29udGV4dCBmcm9tIFtbQXVkaW9TZXR0aW5nc11dXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgY29uc3RydWN0b3IoX2F1ZGlvQ29udGV4dDogQXVkaW9Db250ZXh0KSB7XHJcbiAgICAgICAgICAgdGhpcy5wYW5uZXJOb2RlID0gX2F1ZGlvQ29udGV4dC5jcmVhdGVQYW5uZXIoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICAvKipcclxuICAgICAgICAgKiBXZSB3aWxsIGNhbGwgc2V0UGFubmVyUG9zaXRpb24gd2hlbmV2ZXIgdGhlcmUgaXMgYSBuZWVkIHRvIGNoYW5nZSBQb3NpdGlvbnMuXHJcbiAgICAgICAgICogQWxsIHRoZSBwb3NpdGlvbiB2YWx1ZXMgc2hvdWxkIGJlIGlkZW50aWNhbCB0byB0aGUgY3VycmVudCBQb3NpdGlvbiB0aGlzIGlzIGF0dGVjaGVkIHRvLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIC8vIHB1YmxpYyBzZXRQYW5uZVBvc2l0aW9uKF9wb3NpdGlvbjogVmVjdG9yMyk6IHZvaWQge1xyXG4gICAgICAgIC8vICAgICB0aGlzLnBhbm5lck5vZGUucG9zaXRpb25YLnZhbHVlID0gX3Bvc2l0aW9uLng7XHJcbiAgICAgICAgLy8gICAgIHRoaXMucGFubmVyTm9kZS5wb3NpdGlvblkudmFsdWUgPSBfcG9zaXRpb24ueTtcclxuICAgICAgICAvLyAgICAgdGhpcy5wYW5uZXJOb2RlLnBvc2l0aW9uWi52YWx1ZSA9IF9wb3NpdGlvbi56O1xyXG5cclxuICAgICAgICAvLyAgICAgdGhpcy5wb3NpdGlvbiA9IF9wb3NpdGlvbjtcclxuICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIGdldFBhbm5lclBvc2l0aW9uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGdldFBhbm5lclBvc2l0aW9uKCk6IFZlY3RvcjMge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wb3NpdGlvbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIHNldFBhbm5lT3JpZW50YXRpb25cclxuICAgICAgICAgKi9cclxuICAgICAgICAvLyBwdWJsaWMgc2V0UGFubmVyT3JpZW50YXRpb24oX29yaWVudGF0aW9uOiBWZWN0b3IzKTogdm9pZCB7XHJcbiAgICAgICAgLy8gICAgIHRoaXMucGFubmVyTm9kZS5vcmllbnRhdGlvblgudmFsdWUgPSBfb3JpZW50YXRpb24ueDtcclxuICAgICAgICAvLyAgICAgdGhpcy5wYW5uZXJOb2RlLm9yaWVudGF0aW9uWS52YWx1ZSA9IF9vcmllbnRhdGlvbi55O1xyXG4gICAgICAgIC8vICAgICB0aGlzLnBhbm5lck5vZGUub3JpZW50YXRpb25aLnZhbHVlID0gX29yaWVudGF0aW9uLno7XHJcblxyXG4gICAgICAgIC8vICAgICB0aGlzLm9yaWVudGF0aW9uID0gX29yaWVudGF0aW9uO1xyXG4gICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogZ2V0UGFubmVPcmllbnRhdGlvblxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBnZXRQYW5uZU9yaWVudGF0aW9uKCk6IFZlY3RvcjMge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vcmllbnRhdGlvbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIEludGVyZmFjZSB0byBnZW5lcmF0ZSBEYXRhIFBhaXJzIG9mIFVSTCBhbmQgQXVkaW9CdWZmZXJcclxuICAgICAqL1xyXG4gICAgaW50ZXJmYWNlIEF1ZGlvRGF0YSB7XHJcbiAgICAgICAgdXJsOiBzdHJpbmc7XHJcbiAgICAgICAgYnVmZmVyOiBBdWRpb0J1ZmZlcjtcclxuICAgICAgICBjb3VudGVyOiBudW1iZXI7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZXNjcmliZXMgRGF0YSBIYW5kbGVyIGZvciBhbGwgQXVkaW8gU291cmNlc1xyXG4gICAgICogQGF1dGhvcnMgVGhvbWFzIERvcm5lciwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBBdWRpb1Nlc3Npb25EYXRhIHtcclxuICAgICAgICBwdWJsaWMgZGF0YUFycmF5OiBBdWRpb0RhdGFbXTtcclxuICAgICAgICBwcml2YXRlIGJ1ZmZlckNvdW50ZXI6IG51bWJlcjtcclxuICAgICAgICAvL1RPRE8gb2Jzb2xldGUgaG9sZGVyIHdoZW4gYXJyYXkgd29ya2luZyAvIG1heWJlIHVzZSBhcyBoZWxwZXIgdmFyXHJcbiAgICAgICAgcHJpdmF0ZSBhdWRpb0J1ZmZlckhvbGRlcjogQXVkaW9EYXRhO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBjb25zdHJ1Y3RvciBvZiB0aGUgW1tBdWRpb1Nlc3Npb25EYXRhXV0gY2xhc3NcclxuICAgICAgICAgKi9cclxuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAgICAgdGhpcy5kYXRhQXJyYXkgPSBuZXcgQXJyYXkoKTtcclxuICAgICAgICAgICAgdGhpcy5idWZmZXJDb3VudGVyID0gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIGdldEJ1ZmZlckNvdW50ZXIgcmV0dXJucyBbYnVmZmVyQ291bnRlcl0gdG8ga2VlcCB0cmFjayBvZiBudW1iZXIgb2YgZGlmZmVyZW50IHVzZWQgc291bmRzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGdldEJ1ZmZlckNvdW50ZXIoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYnVmZmVyQ291bnRlcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERlY29kaW5nIEF1ZGlvIERhdGEgXHJcbiAgICAgICAgICogQXN5bmNocm9ub3VzIEZ1bmN0aW9uIHRvIHBlcm1pdCB0aGUgbG9hZGluZyBvZiBtdWx0aXBsZSBEYXRhIFNvdXJjZXMgYXQgdGhlIHNhbWUgdGltZVxyXG4gICAgICAgICAqIEBwYXJhbSBfdXJsIFVSTCBhcyBTdHJpbmcgZm9yIERhdGEgZmV0Y2hpbmdcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgYXN5bmMgdXJsVG9CdWZmZXIoX2F1ZGlvQ29udGV4dDogQXVkaW9Db250ZXh0LCBfdXJsOiBzdHJpbmcpOiBQcm9taXNlPEF1ZGlvQnVmZmVyPiB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiaW5zaWRlIHVybFRvQnVmZmVyXCIpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IGluaXRPYmplY3Q6IFJlcXVlc3RJbml0ID0ge1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiBcIkdFVFwiLFxyXG4gICAgICAgICAgICAgICAgbW9kZTogXCJzYW1lLW9yaWdpblwiLCAvL2RlZmF1bHQgLT4gc2FtZS1vcmlnaW5cclxuICAgICAgICAgICAgICAgIGNhY2hlOiBcIm5vLWNhY2hlXCIsIC8vZGVmYXVsdCAtPiBkZWZhdWx0IFxyXG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXVkaW8vbXBlZzNcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHJlZGlyZWN0OiBcImZvbGxvd1wiIC8vIGRlZmF1bHQgLT4gZm9sbG93XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIC8vIENoZWNrIGZvciBleGlzdGluZyBVUkwgaW4gRGF0YUFycmF5LCBpZiBubyBkYXRhIGluc2lkZSBhZGQgbmV3IEF1ZGlvRGF0YVxyXG4gICAgICAgICAgICAvL3RoaXMucHVzaERhdGFBcnJheShfdXJsLCBudWxsKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJsZW5ndGhcIiArIHRoaXMuZGF0YUFycmF5Lmxlbmd0aCk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGFBcnJheS5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBuZWVkIHdpbmRvdyB0byBmZXRjaD9cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZTogUmVzcG9uc2UgPSBhd2FpdCB3aW5kb3cuZmV0Y2goX3VybCwgaW5pdE9iamVjdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYXJyYXlCdWZmZXI6IEFycmF5QnVmZmVyID0gYXdhaXQgcmVzcG9uc2UuYXJyYXlCdWZmZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBkZWNvZGVkQXVkaW86IEF1ZGlvQnVmZmVyID0gYXdhaXQgX2F1ZGlvQ29udGV4dC5kZWNvZGVBdWRpb0RhdGEoYXJyYXlCdWZmZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHVzaERhdGFBcnJheShfdXJsLCBkZWNvZGVkQXVkaW8pO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vdGhpcy5kYXRhQXJyYXlbdGhpcy5kYXRhQXJyYXkubGVuZ3RoXS5idWZmZXIgPSBkZWNvZGVkQXVkaW87XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJsZW5ndGggXCIgKyB0aGlzLmRhdGFBcnJheS5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkZWNvZGVkQXVkaW87XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dFcnJvckZldGNoKGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gSWYgbmVlZGVkIFVSTCBpcyBpbnNpZGUgQXJyYXksIFxyXG4gICAgICAgICAgICAgICAgLy8gaXRlcmF0ZSB0aHJvdWdoIGFsbCBleGlzdGluZyBEYXRhIHRvIGdldCBuZWVkZWQgdmFsdWVzXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCB4OiBudW1iZXIgPSAwOyB4IDwgdGhpcy5kYXRhQXJyYXkubGVuZ3RoOyB4KyspIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIndoYXQgaXMgaGFwcGVuaW5nXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmRhdGFBcnJheVt4XS51cmwgPT0gX3VybCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImZvdW5kIGV4aXN0aW5nIHVybFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0YUFycmF5W3hdLmJ1ZmZlcjtcclxuICAgICAgICAgICAgICAgICAgICB9IFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBwdXNoVHVwbGUgU291cmNlIGFuZCBEZWNvZGVkIEF1ZGlvIERhdGEgZ2V0cyBzYXZlZCBmb3IgbGF0ZXIgdXNlXHJcbiAgICAgICAgICogQHBhcmFtIF91cmwgVVJMIGZyb20gdXNlZCBEYXRhXHJcbiAgICAgICAgICogQHBhcmFtIF9hdWRpb0J1ZmZlciBBdWRpb0J1ZmZlciBnZW5lcmF0ZWQgZnJvbSBVUkxcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgcHVzaERhdGFBcnJheShfdXJsOiBzdHJpbmcsIF9hdWRpb0J1ZmZlcjogQXVkaW9CdWZmZXIpOiBBdWRpb0RhdGEge1xyXG4gICAgICAgICAgICBsZXQgZGF0YTogQXVkaW9EYXRhO1xyXG4gICAgICAgICAgICBkYXRhID0geyB1cmw6IF91cmwsIGJ1ZmZlcjogX2F1ZGlvQnVmZmVyLCBjb3VudGVyOiB0aGlzLmJ1ZmZlckNvdW50ZXIgfTtcclxuICAgICAgICAgICAgdGhpcy5kYXRhQXJyYXkucHVzaChkYXRhKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJhcnJheTogXCIgKyB0aGlzLmRhdGFBcnJheSk7XHJcblxyXG4gICAgICAgICAgICAvL1RPRE8gYXVkaW9CdWZmZXJIb2xkZXIgb2Jzb2xldGUgaWYgYXJyYXkgd29ya2luZ1xyXG4gICAgICAgICAgICB0aGlzLnNldEF1ZGlvQnVmZmVySG9sZGVyKGRhdGEpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImRhdGFQYWlyIFwiICsgZGF0YS51cmwgKyBcIiBcIiArIGRhdGEuYnVmZmVyICsgXCIgXCIgKyBkYXRhLmNvdW50ZXIpO1xyXG4gICAgICAgICAgICB0aGlzLmJ1ZmZlckNvdW50ZXIgKz0gMTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXVkaW9CdWZmZXJIb2xkZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBpdGVyYXRlQXJyYXlcclxuICAgICAgICAgKiBMb29rIGF0IHNhdmVkIERhdGEgQ291bnRcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgY291bnREYXRhSW5BcnJheSgpOiB2b2lkIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJEYXRhQXJyYXkgTGVuZ3RoOiBcIiArIHRoaXMuZGF0YUFycmF5Lmxlbmd0aCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBzaG93RGF0YUluQXJyYXlcclxuICAgICAgICAgKiBTaG93IGFsbCBEYXRhIGluIEFycmF5XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHNob3dEYXRhSW5BcnJheSgpOiB2b2lkIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgeDogbnVtYmVyID0gMDsgeCA8IHRoaXMuZGF0YUFycmF5Lmxlbmd0aDsgeCsrKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkFycmF5IERhdGE6IFwiICsgdGhpcy5kYXRhQXJyYXlbeF0udXJsICsgdGhpcy5kYXRhQXJyYXlbeF0uYnVmZmVyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogZ2V0QXVkaW9CdWZmZXJcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0QXVkaW9CdWZmZXJIb2xkZXIoKTogQXVkaW9EYXRhIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXVkaW9CdWZmZXJIb2xkZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBzZXRBdWRpb0J1ZmZlclxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzZXRBdWRpb0J1ZmZlckhvbGRlcihfYXVkaW9EYXRhOiBBdWRpb0RhdGEpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5hdWRpb0J1ZmZlckhvbGRlciA9IF9hdWRpb0RhdGE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBFcnJvciBNZXNzYWdlIGZvciBEYXRhIEZldGNoaW5nXHJcbiAgICAgICAgICogQHBhcmFtIGUgRXJyb3JcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIGxvZ0Vycm9yRmV0Y2goZTogRXJyb3IpOiB2b2lkIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJBdWRpbyBlcnJvclwiLCBlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogRGVzY3JpYmVzIEdsb2JhbCBBdWRpbyBTZXR0aW5ncy5cclxuICAgICAqIElzIG1lYW50IHRvIGJlIHVzZWQgYXMgYSBNZW51IG9wdGlvbi5cclxuICAgICAqIEBhdXRob3JzIFRob21hcyBEb3JuZXIsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgQXVkaW9TZXR0aW5ncyB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9wdWJsaWMgYXVkaW9TZXNzaW9uRGF0YTogQXVkaW9TZXNzaW9uRGF0YTtcclxuXHJcbiAgICAgICAgLy9UT0RPIEFkZCBtYXN0ZXJHYWluXHJcbiAgICAgICAgcHVibGljIG1hc3RlckdhaW46IEdhaW5Ob2RlO1xyXG4gICAgICAgIHB1YmxpYyBtYXN0ZXJHYWluVmFsdWU6IG51bWJlcjtcclxuXHJcbiAgICAgICAgLy8gY29uc3Q/IG9yIHByaXZhdGUgd2l0aCBnZXR0ZXI/XHJcbiAgICAgICAgcHJpdmF0ZSBnbG9iYWxBdWRpb0NvbnRleHQ6IEF1ZGlvQ29udGV4dDtcclxuXHJcbiAgICAgICAgLy9cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDb25zdHJ1Y3RvciBmb3IgbWFzdGVyIFZvbHVtZVxyXG4gICAgICAgICAqIEBwYXJhbSBfZ2FpblZhbHVlIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNvbnN0cnVjdG9yKF9nYWluVmFsdWU6IG51bWJlcikge1xyXG4gICAgICAgICAgICB0aGlzLnNldEF1ZGlvQ29udGV4dChuZXcgQXVkaW9Db250ZXh0KHsgbGF0ZW5jeUhpbnQ6IFwiaW50ZXJhY3RpdmVcIiwgc2FtcGxlUmF0ZTogNDQxMDAgfSkpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy90aGlzLmdsb2JhbEF1ZGlvQ29udGV4dC5yZXN1bWUoKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJHbG9iYWxBdWRpb0NvbnRleHQ6IFwiICsgdGhpcy5nbG9iYWxBdWRpb0NvbnRleHQpO1xyXG4gICAgICAgICAgICB0aGlzLm1hc3RlckdhaW4gPSB0aGlzLmdsb2JhbEF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XHJcbiAgICAgICAgICAgIHRoaXMubWFzdGVyR2FpblZhbHVlID0gX2dhaW5WYWx1ZTtcclxuXHJcbiAgICAgICAgICAgIC8vdGhpcy5hdWRpb1Nlc3Npb25EYXRhID0gbmV3IEF1ZGlvU2Vzc2lvbkRhdGEoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzZXRNYXN0ZXJHYWluVmFsdWUoX21hc3RlckdhaW5WYWx1ZTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMubWFzdGVyR2FpblZhbHVlID0gX21hc3RlckdhaW5WYWx1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRNYXN0ZXJHYWluVmFsdWUoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubWFzdGVyR2FpblZhbHVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldEF1ZGlvQ29udGV4dCgpOiBBdWRpb0NvbnRleHQge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nbG9iYWxBdWRpb0NvbnRleHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc2V0QXVkaW9Db250ZXh0KF9hdWRpb0NvbnRleHQ6IEF1ZGlvQ29udGV4dCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmdsb2JhbEF1ZGlvQ29udGV4dCA9IF9hdWRpb0NvbnRleHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL1RPRE8gYWRkIHN1c3BlbmQvcmVzdW1lIGZ1bmN0aW9ucyBmb3IgQXVkaW9Db250ZXh0IGNvbnRyb2xzXHJcbiAgICB9XHJcbn0iLCIvLzxyZWZlcmVuY2UgcGF0aD1cIi4uL0NvYXRzL0NvYXQudHNcIi8+XHJcbm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgdHlwZSBDb2F0SW5qZWN0aW9uID0gKHRoaXM6IENvYXQsIF9yZW5kZXJTaGFkZXI6IFJlbmRlclNoYWRlcikgPT4gdm9pZDtcclxuICAgIGV4cG9ydCBjbGFzcyBSZW5kZXJJbmplY3RvciB7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgY29hdEluamVjdGlvbnM6IHsgW2NsYXNzTmFtZTogc3RyaW5nXTogQ29hdEluamVjdGlvbiB9ID0ge1xyXG4gICAgICAgICAgICBcIkNvYXRDb2xvcmVkXCI6IFJlbmRlckluamVjdG9yLmluamVjdFJlbmRlckRhdGFGb3JDb2F0Q29sb3JlZCxcclxuICAgICAgICAgICAgXCJDb2F0VGV4dHVyZWRcIjogUmVuZGVySW5qZWN0b3IuaW5qZWN0UmVuZGVyRGF0YUZvckNvYXRUZXh0dXJlZCxcclxuICAgICAgICAgICAgXCJDb2F0TWF0Q2FwXCI6IFJlbmRlckluamVjdG9yLmluamVjdFJlbmRlckRhdGFGb3JDb2F0TWF0Q2FwXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBkZWNvcmF0ZUNvYXQoX2NvbnN0cnVjdG9yOiBGdW5jdGlvbik6IHZvaWQge1xyXG4gICAgICAgICAgICBsZXQgY29hdEluamVjdGlvbjogQ29hdEluamVjdGlvbiA9IFJlbmRlckluamVjdG9yLmNvYXRJbmplY3Rpb25zW19jb25zdHJ1Y3Rvci5uYW1lXTtcclxuICAgICAgICAgICAgaWYgKCFjb2F0SW5qZWN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICBEZWJ1Zy5lcnJvcihcIk5vIGluamVjdGlvbiBkZWNvcmF0b3IgZGVmaW5lZCBmb3IgXCIgKyBfY29uc3RydWN0b3IubmFtZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KF9jb25zdHJ1Y3Rvci5wcm90b3R5cGUsIFwidXNlUmVuZGVyRGF0YVwiLCB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogY29hdEluamVjdGlvblxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGluamVjdFJlbmRlckRhdGFGb3JDb2F0Q29sb3JlZCh0aGlzOiBDb2F0LCBfcmVuZGVyU2hhZGVyOiBSZW5kZXJTaGFkZXIpOiB2b2lkIHtcclxuICAgICAgICAgICAgbGV0IGNvbG9yVW5pZm9ybUxvY2F0aW9uOiBXZWJHTFVuaWZvcm1Mb2NhdGlvbiA9IF9yZW5kZXJTaGFkZXIudW5pZm9ybXNbXCJ1X2NvbG9yXCJdO1xyXG4gICAgICAgICAgICAvLyBsZXQgeyByLCBnLCBiLCBhIH0gPSAoPENvYXRDb2xvcmVkPnRoaXMpLmNvbG9yO1xyXG4gICAgICAgICAgICAvLyBsZXQgY29sb3I6IEZsb2F0MzJBcnJheSA9IG5ldyBGbG9hdDMyQXJyYXkoW3IsIGcsIGIsIGFdKTtcclxuICAgICAgICAgICAgbGV0IGNvbG9yOiBGbG9hdDMyQXJyYXkgPSAoPENvYXRDb2xvcmVkPnRoaXMpLmNvbG9yLmdldEFycmF5KCk7XHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmdldFJlbmRlcmluZ0NvbnRleHQoKS51bmlmb3JtNGZ2KGNvbG9yVW5pZm9ybUxvY2F0aW9uLCBjb2xvcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBpbmplY3RSZW5kZXJEYXRhRm9yQ29hdFRleHR1cmVkKHRoaXM6IENvYXQsIF9yZW5kZXJTaGFkZXI6IFJlbmRlclNoYWRlcik6IHZvaWQge1xyXG4gICAgICAgICAgICBsZXQgY3JjMzogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCA9IFJlbmRlck9wZXJhdG9yLmdldFJlbmRlcmluZ0NvbnRleHQoKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMucmVuZGVyRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgLy8gYnVmZmVycyBleGlzdFxyXG4gICAgICAgICAgICAgICAgY3JjMy5hY3RpdmVUZXh0dXJlKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVEVYVFVSRTApO1xyXG4gICAgICAgICAgICAgICAgY3JjMy5iaW5kVGV4dHVyZShXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlRFWFRVUkVfMkQsIHRoaXMucmVuZGVyRGF0YVtcInRleHR1cmUwXCJdKTtcclxuICAgICAgICAgICAgICAgIGNyYzMudW5pZm9ybTFpKF9yZW5kZXJTaGFkZXIudW5pZm9ybXNbXCJ1X3RleHR1cmVcIl0sIDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJEYXRhID0ge307XHJcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBjaGVjayBpZiBhbGwgV2ViR0wtQ3JlYXRpb25zIGFyZSBhc3NlcnRlZFxyXG4gICAgICAgICAgICAgICAgY29uc3QgdGV4dHVyZTogV2ViR0xUZXh0dXJlID0gUmVuZGVyTWFuYWdlci5hc3NlcnQ8V2ViR0xUZXh0dXJlPihjcmMzLmNyZWF0ZVRleHR1cmUoKSk7XHJcbiAgICAgICAgICAgICAgICBjcmMzLmJpbmRUZXh0dXJlKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVEVYVFVSRV8yRCwgdGV4dHVyZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBjcmMzLnRleEltYWdlMkQoY3JjMy5URVhUVVJFXzJELCAwLCBjcmMzLlJHQkEsIGNyYzMuUkdCQSwgY3JjMy5VTlNJR05FRF9CWVRFLCAoPENvYXRUZXh0dXJlZD50aGlzKS50ZXh0dXJlLmltYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICBjcmMzLnRleEltYWdlMkQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVEVYVFVSRV8yRCwgMCwgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5SR0JBLCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlJHQkEsIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVU5TSUdORURfQllURSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgKDxDb2F0VGV4dHVyZWQ+dGhpcykudGV4dHVyZS5pbWFnZVxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChfZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIERlYnVnLmVycm9yKF9lKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNyYzMudGV4UGFyYW1ldGVyaShXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlRFWFRVUkVfMkQsIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVEVYVFVSRV9NQUdfRklMVEVSLCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0Lk5FQVJFU1QpO1xyXG4gICAgICAgICAgICAgICAgY3JjMy50ZXhQYXJhbWV0ZXJpKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVEVYVFVSRV8yRCwgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5URVhUVVJFX01JTl9GSUxURVIsIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuTkVBUkVTVCk7XHJcbiAgICAgICAgICAgICAgICBjcmMzLmdlbmVyYXRlTWlwbWFwKGNyYzMuVEVYVFVSRV8yRCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlckRhdGFbXCJ0ZXh0dXJlMFwiXSA9IHRleHR1cmU7XHJcblxyXG4gICAgICAgICAgICAgICAgY3JjMy5iaW5kVGV4dHVyZShXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlRFWFRVUkVfMkQsIG51bGwpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy51c2VSZW5kZXJEYXRhKF9yZW5kZXJTaGFkZXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBpbmplY3RSZW5kZXJEYXRhRm9yQ29hdE1hdENhcCh0aGlzOiBDb2F0LCBfcmVuZGVyU2hhZGVyOiBSZW5kZXJTaGFkZXIpOiB2b2lkIHtcclxuICAgICAgICAgICAgbGV0IGNyYzM6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQgPSBSZW5kZXJPcGVyYXRvci5nZXRSZW5kZXJpbmdDb250ZXh0KCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgY29sb3JVbmlmb3JtTG9jYXRpb246IFdlYkdMVW5pZm9ybUxvY2F0aW9uID0gX3JlbmRlclNoYWRlci51bmlmb3Jtc1tcInVfdGludF9jb2xvclwiXTtcclxuICAgICAgICAgICAgbGV0IHsgciwgZywgYiwgYSB9ID0gKDxDb2F0TWF0Q2FwPnRoaXMpLnRpbnRDb2xvcjtcclxuICAgICAgICAgICAgbGV0IHRpbnRDb2xvckFycmF5OiBGbG9hdDMyQXJyYXkgPSBuZXcgRmxvYXQzMkFycmF5KFtyLCBnLCBiLCBhXSk7XHJcbiAgICAgICAgICAgIGNyYzMudW5pZm9ybTRmdihjb2xvclVuaWZvcm1Mb2NhdGlvbiwgdGludENvbG9yQXJyYXkpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGZsb2F0VW5pZm9ybUxvY2F0aW9uOiBXZWJHTFVuaWZvcm1Mb2NhdGlvbiA9IF9yZW5kZXJTaGFkZXIudW5pZm9ybXNbXCJ1X2ZsYXRtaXhcIl07XHJcbiAgICAgICAgICAgIGxldCBmbGF0TWl4OiBudW1iZXIgPSAoPENvYXRNYXRDYXA+dGhpcykuZmxhdE1peDtcclxuICAgICAgICAgICAgY3JjMy51bmlmb3JtMWYoZmxvYXRVbmlmb3JtTG9jYXRpb24sIGZsYXRNaXgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMucmVuZGVyRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgLy8gYnVmZmVycyBleGlzdFxyXG4gICAgICAgICAgICAgICAgY3JjMy5hY3RpdmVUZXh0dXJlKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVEVYVFVSRTApO1xyXG4gICAgICAgICAgICAgICAgY3JjMy5iaW5kVGV4dHVyZShXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlRFWFRVUkVfMkQsIHRoaXMucmVuZGVyRGF0YVtcInRleHR1cmUwXCJdKTtcclxuICAgICAgICAgICAgICAgIGNyYzMudW5pZm9ybTFpKF9yZW5kZXJTaGFkZXIudW5pZm9ybXNbXCJ1X3RleHR1cmVcIl0sIDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJEYXRhID0ge307XHJcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBjaGVjayBpZiBhbGwgV2ViR0wtQ3JlYXRpb25zIGFyZSBhc3NlcnRlZFxyXG4gICAgICAgICAgICAgICAgY29uc3QgdGV4dHVyZTogV2ViR0xUZXh0dXJlID0gUmVuZGVyTWFuYWdlci5hc3NlcnQ8V2ViR0xUZXh0dXJlPihjcmMzLmNyZWF0ZVRleHR1cmUoKSk7XHJcbiAgICAgICAgICAgICAgICBjcmMzLmJpbmRUZXh0dXJlKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVEVYVFVSRV8yRCwgdGV4dHVyZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBjcmMzLnRleEltYWdlMkQoY3JjMy5URVhUVVJFXzJELCAwLCBjcmMzLlJHQkEsIGNyYzMuUkdCQSwgY3JjMy5VTlNJR05FRF9CWVRFLCAoPENvYXRNYXRDYXA+dGhpcykudGV4dHVyZS5pbWFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY3JjMy50ZXhJbWFnZTJEKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlRFWFRVUkVfMkQsIDAsIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuUkdCQSwgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5SR0JBLCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlVOU0lHTkVEX0JZVEUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICg8Q29hdE1hdENhcD50aGlzKS50ZXh0dXJlLmltYWdlXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKF9lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgRGVidWcuZXJyb3IoX2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY3JjMy50ZXhQYXJhbWV0ZXJpKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVEVYVFVSRV8yRCwgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5URVhUVVJFX01BR19GSUxURVIsIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuTkVBUkVTVCk7XHJcbiAgICAgICAgICAgICAgICBjcmMzLnRleFBhcmFtZXRlcmkoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5URVhUVVJFXzJELCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlRFWFRVUkVfTUlOX0ZJTFRFUiwgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5ORUFSRVNUKTtcclxuICAgICAgICAgICAgICAgIGNyYzMuZ2VuZXJhdGVNaXBtYXAoY3JjMy5URVhUVVJFXzJEKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyRGF0YVtcInRleHR1cmUwXCJdID0gdGV4dHVyZTtcclxuXHJcbiAgICAgICAgICAgICAgICBjcmMzLmJpbmRUZXh0dXJlKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVEVYVFVSRV8yRCwgbnVsbCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVzZVJlbmRlckRhdGEoX3JlbmRlclNoYWRlcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgQnVmZmVyU3BlY2lmaWNhdGlvbiB7XHJcbiAgICAgICAgc2l6ZTogbnVtYmVyOyAgIC8vIFRoZSBzaXplIG9mIHRoZSBkYXRhc2FtcGxlLlxyXG4gICAgICAgIGRhdGFUeXBlOiBudW1iZXI7IC8vIFRoZSBkYXRhdHlwZSBvZiB0aGUgc2FtcGxlIChlLmcuIGdsLkZMT0FULCBnbC5CWVRFLCBldGMuKVxyXG4gICAgICAgIG5vcm1hbGl6ZTogYm9vbGVhbjsgLy8gRmxhZyB0byBub3JtYWxpemUgdGhlIGRhdGEuXHJcbiAgICAgICAgc3RyaWRlOiBudW1iZXI7IC8vIE51bWJlciBvZiBpbmRpY2VzIHRoYXQgd2lsbCBiZSBza2lwcGVkIGVhY2ggaXRlcmF0aW9uLlxyXG4gICAgICAgIG9mZnNldDogbnVtYmVyOyAvLyBJbmRleCBvZiB0aGUgZWxlbWVudCB0byBiZWdpbiB3aXRoLlxyXG4gICAgfVxyXG4gICAgZXhwb3J0IGludGVyZmFjZSBSZW5kZXJTaGFkZXIge1xyXG4gICAgICAgIC8vIFRPRE86IGV4YW1pbmUsIGlmIHRoaXMgc2hvdWxkIGJlIGluamVjdGVkIGluIHNoYWRlciBjbGFzcyB2aWEgUmVuZGVySW5qZWN0b3IsIGFzIGRvbmUgd2l0aCBDb2F0XHJcbiAgICAgICAgcHJvZ3JhbTogV2ViR0xQcm9ncmFtO1xyXG4gICAgICAgIGF0dHJpYnV0ZXM6IHsgW25hbWU6IHN0cmluZ106IG51bWJlciB9O1xyXG4gICAgICAgIHVuaWZvcm1zOiB7IFtuYW1lOiBzdHJpbmddOiBXZWJHTFVuaWZvcm1Mb2NhdGlvbiB9O1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgUmVuZGVyQnVmZmVycyB7XHJcbiAgICAgICAgLy8gVE9ETzogZXhhbWluZSwgaWYgdGhpcyBzaG91bGQgYmUgaW5qZWN0ZWQgaW4gbWVzaCBjbGFzcyB2aWEgUmVuZGVySW5qZWN0b3IsIGFzIGRvbmUgd2l0aCBDb2F0XHJcbiAgICAgICAgdmVydGljZXM6IFdlYkdMQnVmZmVyO1xyXG4gICAgICAgIGluZGljZXM6IFdlYkdMQnVmZmVyO1xyXG4gICAgICAgIG5JbmRpY2VzOiBudW1iZXI7XHJcbiAgICAgICAgdGV4dHVyZVVWczogV2ViR0xCdWZmZXI7XHJcbiAgICAgICAgbm9ybWFsc0ZhY2U6IFdlYkdMQnVmZmVyO1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgUmVuZGVyQ29hdCB7XHJcbiAgICAgICAgLy9UT0RPOiBleGFtaW5lLCBpZiBpdCBtYWtlcyBzZW5zZSB0byBzdG9yZSBhIHZhbyBmb3IgZWFjaCBDb2F0LCBldmVuIHRob3VnaCBlLmcuIGNvbG9yIHdvbid0IGJlIHN0b3JlZCBhbnl3YXkuLi5cclxuICAgICAgICAvL3ZhbzogV2ViR0xWZXJ0ZXhBcnJheU9iamVjdDtcclxuICAgICAgICBjb2F0OiBDb2F0O1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgUmVuZGVyTGlnaHRzIHtcclxuICAgICAgICBbdHlwZTogc3RyaW5nXTogRmxvYXQzMkFycmF5O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQmFzZSBjbGFzcyBmb3IgUmVuZGVyTWFuYWdlciwgaGFuZGxpbmcgdGhlIGNvbm5lY3Rpb24gdG8gdGhlIHJlbmRlcmluZyBzeXN0ZW0sIGluIHRoaXMgY2FzZSBXZWJHTC5cclxuICAgICAqIE1ldGhvZHMgYW5kIGF0dHJpYnV0ZXMgb2YgdGhpcyBjbGFzcyBzaG91bGQgbm90IGJlIGNhbGxlZCBkaXJlY3RseSwgb25seSB0aHJvdWdoIFtbUmVuZGVyTWFuYWdlcl1dXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBhYnN0cmFjdCBjbGFzcyBSZW5kZXJPcGVyYXRvciB7XHJcbiAgICAgICAgcHJvdGVjdGVkIHN0YXRpYyBjcmMzOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0O1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHJlY3RWaWV3cG9ydDogUmVjdGFuZ2xlO1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHJlbmRlclNoYWRlclJheUNhc3Q6IFJlbmRlclNoYWRlcjtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgKiBDaGVja3MgdGhlIGZpcnN0IHBhcmFtZXRlciBhbmQgdGhyb3dzIGFuIGV4Y2VwdGlvbiB3aXRoIHRoZSBXZWJHTC1lcnJvcmNvZGUgaWYgdGhlIHZhbHVlIGlzIG51bGxcclxuICAgICAgICAqIEBwYXJhbSBfdmFsdWUgLy8gdmFsdWUgdG8gY2hlY2sgYWdhaW5zdCBudWxsXHJcbiAgICAgICAgKiBAcGFyYW0gX21lc3NhZ2UgLy8gb3B0aW9uYWwsIGFkZGl0aW9uYWwgbWVzc2FnZSBmb3IgdGhlIGV4Y2VwdGlvblxyXG4gICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBhc3NlcnQ8VD4oX3ZhbHVlOiBUIHwgbnVsbCwgX21lc3NhZ2U6IHN0cmluZyA9IFwiXCIpOiBUIHtcclxuICAgICAgICAgICAgaWYgKF92YWx1ZSA9PT0gbnVsbClcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQXNzZXJ0aW9uIGZhaWxlZC4gJHtfbWVzc2FnZX0sIFdlYkdMLUVycm9yOiAke1JlbmRlck9wZXJhdG9yLmNyYzMgPyBSZW5kZXJPcGVyYXRvci5jcmMzLmdldEVycm9yKCkgOiBcIlwifWApO1xyXG4gICAgICAgICAgICByZXR1cm4gX3ZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBJbml0aWFsaXplcyBvZmZzY3JlZW4tY2FudmFzLCByZW5kZXJpbmdjb250ZXh0IGFuZCBoYXJkd2FyZSB2aWV3cG9ydC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGluaXRpYWxpemUoX2FudGlhbGlhczogYm9vbGVhbiA9IGZhbHNlLCBfYWxwaGE6IGJvb2xlYW4gPSBmYWxzZSk6IHZvaWQge1xyXG4gICAgICAgICAgICBsZXQgY29udGV4dEF0dHJpYnV0ZXM6IFdlYkdMQ29udGV4dEF0dHJpYnV0ZXMgPSB7IGFscGhhOiBfYWxwaGEsIGFudGlhbGlhczogX2FudGlhbGlhcyB9O1xyXG4gICAgICAgICAgICBsZXQgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMgPSBSZW5kZXJPcGVyYXRvci5hc3NlcnQ8V2ViR0wyUmVuZGVyaW5nQ29udGV4dD4oXHJcbiAgICAgICAgICAgICAgICBjYW52YXMuZ2V0Q29udGV4dChcIndlYmdsMlwiLCBjb250ZXh0QXR0cmlidXRlcyksXHJcbiAgICAgICAgICAgICAgICBcIldlYkdMLWNvbnRleHQgY291bGRuJ3QgYmUgY3JlYXRlZFwiXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIC8vIEVuYWJsZSBiYWNrZmFjZS0gYW5kIHpCdWZmZXItY3VsbGluZy5cclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy5lbmFibGUoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5DVUxMX0ZBQ0UpO1xyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmVuYWJsZShXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkRFUFRIX1RFU1QpO1xyXG4gICAgICAgICAgICAvLyBSZW5kZXJPcGVyYXRvci5jcmMzLnBpeGVsU3RvcmVpKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVU5QQUNLX0ZMSVBfWV9XRUJHTCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLnJlY3RWaWV3cG9ydCA9IFJlbmRlck9wZXJhdG9yLmdldENhbnZhc1JlY3QoKTtcclxuXHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLnJlbmRlclNoYWRlclJheUNhc3QgPSBSZW5kZXJPcGVyYXRvci5jcmVhdGVQcm9ncmFtKFNoYWRlclJheUNhc3QpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJuIGEgcmVmZXJlbmNlIHRvIHRoZSBvZmZzY3JlZW4tY2FudmFzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXRDYW52YXMoKTogSFRNTENhbnZhc0VsZW1lbnQge1xyXG4gICAgICAgICAgICByZXR1cm4gPEhUTUxDYW52YXNFbGVtZW50PlJlbmRlck9wZXJhdG9yLmNyYzMuY2FudmFzOyAvLyBUT0RPOiBlbmFibGUgT2Zmc2NyZWVuQ2FudmFzXHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybiBhIHJlZmVyZW5jZSB0byB0aGUgcmVuZGVyaW5nIGNvbnRleHRcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGdldFJlbmRlcmluZ0NvbnRleHQoKTogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCB7XHJcbiAgICAgICAgICAgIHJldHVybiBSZW5kZXJPcGVyYXRvci5jcmMzO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm4gYSByZWN0YW5nbGUgZGVzY3JpYmluZyB0aGUgc2l6ZSBvZiB0aGUgb2Zmc2NyZWVuLWNhbnZhcy4geCx5IGFyZSAwIGF0IGFsbCB0aW1lcy5cclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGdldENhbnZhc1JlY3QoKTogUmVjdGFuZ2xlIHtcclxuICAgICAgICAgICAgbGV0IGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQgPSA8SFRNTENhbnZhc0VsZW1lbnQ+UmVuZGVyT3BlcmF0b3IuY3JjMy5jYW52YXM7XHJcbiAgICAgICAgICAgIHJldHVybiBSZWN0YW5nbGUuR0VUKDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNldCB0aGUgc2l6ZSBvZiB0aGUgb2Zmc2NyZWVuLWNhbnZhcy5cclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHNldENhbnZhc1NpemUoX3dpZHRoOiBudW1iZXIsIF9oZWlnaHQ6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmNhbnZhcy53aWR0aCA9IF93aWR0aDtcclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy5jYW52YXMuaGVpZ2h0ID0gX2hlaWdodDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2V0IHRoZSBhcmVhIG9uIHRoZSBvZmZzY3JlZW4tY2FudmFzIHRvIHJlbmRlciB0aGUgY2FtZXJhIGltYWdlIHRvLlxyXG4gICAgICAgICAqIEBwYXJhbSBfcmVjdFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgc2V0Vmlld3BvcnRSZWN0YW5nbGUoX3JlY3Q6IFJlY3RhbmdsZSk6IHZvaWQge1xyXG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKFJlbmRlck9wZXJhdG9yLnJlY3RWaWV3cG9ydCwgX3JlY3QpO1xyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLnZpZXdwb3J0KF9yZWN0LngsIF9yZWN0LnksIF9yZWN0LndpZHRoLCBfcmVjdC5oZWlnaHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXRyaWV2ZSB0aGUgYXJlYSBvbiB0aGUgb2Zmc2NyZWVuLWNhbnZhcyB0aGUgY2FtZXJhIGltYWdlIGdldHMgcmVuZGVyZWQgdG8uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXRWaWV3cG9ydFJlY3RhbmdsZSgpOiBSZWN0YW5nbGUge1xyXG4gICAgICAgICAgICByZXR1cm4gUmVuZGVyT3BlcmF0b3IucmVjdFZpZXdwb3J0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ29udmVydCBsaWdodCBkYXRhIHRvIGZsYXQgYXJyYXlzXHJcbiAgICAgICAgICogVE9ETzogdGhpcyBtZXRob2QgYXBwZWFycyB0byBiZSBvYnNvbGV0ZS4uLj9cclxuICAgICAgICAgKi9cclxuICAgICAgICBwcm90ZWN0ZWQgc3RhdGljIGNyZWF0ZVJlbmRlckxpZ2h0cyhfbGlnaHRzOiBNYXBMaWdodFR5cGVUb0xpZ2h0TGlzdCk6IFJlbmRlckxpZ2h0cyB7XHJcbiAgICAgICAgICAgIGxldCByZW5kZXJMaWdodHM6IFJlbmRlckxpZ2h0cyA9IHt9O1xyXG4gICAgICAgICAgICBmb3IgKGxldCBlbnRyeSBvZiBfbGlnaHRzKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBzaW1wbHlmeSwgc2luY2UgZGlyZWN0aW9uIGlzIG5vdyBoYW5kbGVkIGJ5IENvbXBvbmVudExpZ2h0XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGVudHJ5WzBdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBMaWdodEFtYmllbnQubmFtZTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGFtYmllbnQ6IG51bWJlcltdID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGNtcExpZ2h0IG9mIGVudHJ5WzFdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgYzogQ29sb3IgPSBjbXBMaWdodC5saWdodC5jb2xvcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFtYmllbnQucHVzaChjLnIsIGMuZywgYy5iLCBjLmEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckxpZ2h0c1tcInVfYW1iaWVudFwiXSA9IG5ldyBGbG9hdDMyQXJyYXkoYW1iaWVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgTGlnaHREaXJlY3Rpb25hbC5uYW1lOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZGlyZWN0aW9uYWw6IG51bWJlcltdID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGNtcExpZ2h0IG9mIGVudHJ5WzFdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgYzogQ29sb3IgPSBjbXBMaWdodC5saWdodC5jb2xvcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGxldCBkOiBWZWN0b3IzID0gKDxMaWdodERpcmVjdGlvbmFsPmxpZ2h0LmdldExpZ2h0KCkpLmRpcmVjdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbmFsLnB1c2goYy5yLCBjLmcsIGMuYiwgYy5hLCAwLCAwLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJMaWdodHNbXCJ1X2RpcmVjdGlvbmFsXCJdID0gbmV3IEZsb2F0MzJBcnJheShkaXJlY3Rpb25hbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIERlYnVnLndhcm4oXCJTaGFkZXJzdHJ1Y3R1cmUgdW5kZWZpbmVkIGZvclwiLCBlbnRyeVswXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlbmRlckxpZ2h0cztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNldCBsaWdodCBkYXRhIGluIHNoYWRlcnNcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcm90ZWN0ZWQgc3RhdGljIHNldExpZ2h0c0luU2hhZGVyKF9yZW5kZXJTaGFkZXI6IFJlbmRlclNoYWRlciwgX2xpZ2h0czogTWFwTGlnaHRUeXBlVG9MaWdodExpc3QpOiB2b2lkIHtcclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IudXNlUHJvZ3JhbShfcmVuZGVyU2hhZGVyKTtcclxuICAgICAgICAgICAgbGV0IHVuaTogeyBbbmFtZTogc3RyaW5nXTogV2ViR0xVbmlmb3JtTG9jYXRpb24gfSA9IF9yZW5kZXJTaGFkZXIudW5pZm9ybXM7XHJcblxyXG4gICAgICAgICAgICBsZXQgYW1iaWVudDogV2ViR0xVbmlmb3JtTG9jYXRpb24gPSB1bmlbXCJ1X2FtYmllbnQuY29sb3JcIl07XHJcbiAgICAgICAgICAgIGlmIChhbWJpZW50KSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY21wTGlnaHRzOiBDb21wb25lbnRMaWdodFtdID0gX2xpZ2h0cy5nZXQoXCJMaWdodEFtYmllbnRcIik7XHJcbiAgICAgICAgICAgICAgICBpZiAoY21wTGlnaHRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogYWRkIHVwIGFtYmllbnQgbGlnaHRzIHRvIGEgc2luZ2xlIGNvbG9yXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gbGV0IHJlc3VsdDogQ29sb3IgPSBuZXcgQ29sb3IoMCwgMCwgMCwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgY21wTGlnaHQgb2YgY21wTGlnaHRzKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBmb3Igbm93LCBvbmx5IHRoZSBsYXN0IGlzIHJlbGV2YW50XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMudW5pZm9ybTRmdihhbWJpZW50LCBjbXBMaWdodC5saWdodC5jb2xvci5nZXRBcnJheSgpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IG5EaXJlY3Rpb25hbDogV2ViR0xVbmlmb3JtTG9jYXRpb24gPSB1bmlbXCJ1X25MaWdodHNEaXJlY3Rpb25hbFwiXTtcclxuICAgICAgICAgICAgaWYgKG5EaXJlY3Rpb25hbCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNtcExpZ2h0czogQ29tcG9uZW50TGlnaHRbXSA9IF9saWdodHMuZ2V0KFwiTGlnaHREaXJlY3Rpb25hbFwiKTtcclxuICAgICAgICAgICAgICAgIGlmIChjbXBMaWdodHMpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbjogbnVtYmVyID0gY21wTGlnaHRzLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLnVuaWZvcm0xdWkobkRpcmVjdGlvbmFsLCBuKTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgbjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjbXBMaWdodDogQ29tcG9uZW50TGlnaHQgPSBjbXBMaWdodHNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMudW5pZm9ybTRmdih1bmlbYHVfZGlyZWN0aW9uYWxbJHtpfV0uY29sb3JgXSwgY21wTGlnaHQubGlnaHQuY29sb3IuZ2V0QXJyYXkoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkaXJlY3Rpb246IFZlY3RvcjMgPSBWZWN0b3IzLlooKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uLnRyYW5zZm9ybShjbXBMaWdodC5waXZvdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbi50cmFuc2Zvcm0oY21wTGlnaHQuZ2V0Q29udGFpbmVyKCkubXR4V29ybGQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLnVuaWZvcm0zZnYodW5pW2B1X2RpcmVjdGlvbmFsWyR7aX1dLmRpcmVjdGlvbmBdLCBkaXJlY3Rpb24uZ2V0KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBkZWJ1Z2dlcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERyYXcgYSBtZXNoIGJ1ZmZlciB1c2luZyB0aGUgZ2l2ZW4gaW5mb3MgYW5kIHRoZSBjb21wbGV0ZSBwcm9qZWN0aW9uIG1hdHJpeFxyXG4gICAgICAgICAqIEBwYXJhbSBfcmVuZGVyU2hhZGVyIFxyXG4gICAgICAgICAqIEBwYXJhbSBfcmVuZGVyQnVmZmVycyBcclxuICAgICAgICAgKiBAcGFyYW0gX3JlbmRlckNvYXQgXHJcbiAgICAgICAgICogQHBhcmFtIF93b3JsZCBcclxuICAgICAgICAgKiBAcGFyYW0gX3Byb2plY3Rpb24gXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJvdGVjdGVkIHN0YXRpYyBkcmF3KF9yZW5kZXJTaGFkZXI6IFJlbmRlclNoYWRlciwgX3JlbmRlckJ1ZmZlcnM6IFJlbmRlckJ1ZmZlcnMsIF9yZW5kZXJDb2F0OiBSZW5kZXJDb2F0LCBfd29ybGQ6IE1hdHJpeDR4NCwgX3Byb2plY3Rpb246IE1hdHJpeDR4NCk6IHZvaWQge1xyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci51c2VQcm9ncmFtKF9yZW5kZXJTaGFkZXIpO1xyXG4gICAgICAgICAgICAvLyBSZW5kZXJPcGVyYXRvci51c2VCdWZmZXJzKF9yZW5kZXJCdWZmZXJzKTtcclxuICAgICAgICAgICAgLy8gUmVuZGVyT3BlcmF0b3IudXNlUGFyYW1ldGVyKF9yZW5kZXJDb2F0KTtcclxuXHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMuYmluZEJ1ZmZlcihXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkFSUkFZX0JVRkZFUiwgX3JlbmRlckJ1ZmZlcnMudmVydGljZXMpO1xyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KF9yZW5kZXJTaGFkZXIuYXR0cmlidXRlc1tcImFfcG9zaXRpb25cIl0pO1xyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5zZXRBdHRyaWJ1dGVTdHJ1Y3R1cmUoX3JlbmRlclNoYWRlci5hdHRyaWJ1dGVzW1wiYV9wb3NpdGlvblwiXSwgTWVzaC5nZXRCdWZmZXJTcGVjaWZpY2F0aW9uKCkpO1xyXG5cclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy5iaW5kQnVmZmVyKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIF9yZW5kZXJCdWZmZXJzLmluZGljZXMpO1xyXG5cclxuICAgICAgICAgICAgaWYgKF9yZW5kZXJTaGFkZXIuYXR0cmlidXRlc1tcImFfdGV4dHVyZVVWc1wiXSkge1xyXG4gICAgICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy5iaW5kQnVmZmVyKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuQVJSQVlfQlVGRkVSLCBfcmVuZGVyQnVmZmVycy50ZXh0dXJlVVZzKTtcclxuICAgICAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoX3JlbmRlclNoYWRlci5hdHRyaWJ1dGVzW1wiYV90ZXh0dXJlVVZzXCJdKTsgLy8gZW5hYmxlIHRoZSBidWZmZXJcclxuICAgICAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMudmVydGV4QXR0cmliUG9pbnRlcihfcmVuZGVyU2hhZGVyLmF0dHJpYnV0ZXNbXCJhX3RleHR1cmVVVnNcIl0sIDIsIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuRkxPQVQsIGZhbHNlLCAwLCAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBTdXBwbHkgbWF0cml4ZGF0YSB0byBzaGFkZXIuIFxyXG4gICAgICAgICAgICBsZXQgdVByb2plY3Rpb246IFdlYkdMVW5pZm9ybUxvY2F0aW9uID0gX3JlbmRlclNoYWRlci51bmlmb3Jtc1tcInVfcHJvamVjdGlvblwiXTtcclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy51bmlmb3JtTWF0cml4NGZ2KHVQcm9qZWN0aW9uLCBmYWxzZSwgX3Byb2plY3Rpb24uZ2V0KCkpO1xyXG5cclxuICAgICAgICAgICAgaWYgKF9yZW5kZXJTaGFkZXIudW5pZm9ybXNbXCJ1X3dvcmxkXCJdKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdVdvcmxkOiBXZWJHTFVuaWZvcm1Mb2NhdGlvbiA9IF9yZW5kZXJTaGFkZXIudW5pZm9ybXNbXCJ1X3dvcmxkXCJdO1xyXG4gICAgICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy51bmlmb3JtTWF0cml4NGZ2KHVXb3JsZCwgZmFsc2UsIF93b3JsZC5nZXQoKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy5iaW5kQnVmZmVyKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuQVJSQVlfQlVGRkVSLCBfcmVuZGVyQnVmZmVycy5ub3JtYWxzRmFjZSk7XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KF9yZW5kZXJTaGFkZXIuYXR0cmlidXRlc1tcImFfbm9ybWFsXCJdKTtcclxuICAgICAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLnNldEF0dHJpYnV0ZVN0cnVjdHVyZShfcmVuZGVyU2hhZGVyLmF0dHJpYnV0ZXNbXCJhX25vcm1hbFwiXSwgTWVzaC5nZXRCdWZmZXJTcGVjaWZpY2F0aW9uKCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIFRPRE86IHRoaXMgaXMgYWxsIHRoYXQncyBsZWZ0IG9mIGNvYXQgaGFuZGxpbmcgaW4gUmVuZGVyT3BlcmF0b3IsIGR1ZSB0byBpbmplY3Rpb24uIFNvIGV4dHJhIHJlZmVyZW5jZSBmcm9tIG5vZGUgdG8gY29hdCBpcyB1bm5lY2Vzc2FyeVxyXG4gICAgICAgICAgICBfcmVuZGVyQ29hdC5jb2F0LnVzZVJlbmRlckRhdGEoX3JlbmRlclNoYWRlcik7XHJcblxyXG4gICAgICAgICAgICAvLyBEcmF3IGNhbGxcclxuICAgICAgICAgICAgLy8gUmVuZGVyT3BlcmF0b3IuY3JjMy5kcmF3RWxlbWVudHMoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5UUklBTkdMRVMsIE1lc2guZ2V0QnVmZmVyU3BlY2lmaWNhdGlvbigpLm9mZnNldCwgX3JlbmRlckJ1ZmZlcnMubkluZGljZXMpO1xyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmRyYXdFbGVtZW50cyhXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlRSSUFOR0xFUywgX3JlbmRlckJ1ZmZlcnMubkluZGljZXMsIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVU5TSUdORURfU0hPUlQsIDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRHJhdyBhIGJ1ZmZlciB3aXRoIGEgc3BlY2lhbCBzaGFkZXIgdGhhdCB1c2VzIGFuIGlkIGluc3RlYWQgb2YgYSBjb2xvclxyXG4gICAgICAgICAqIEBwYXJhbSBfcmVuZGVyU2hhZGVyXHJcbiAgICAgICAgICogQHBhcmFtIF9yZW5kZXJCdWZmZXJzIFxyXG4gICAgICAgICAqIEBwYXJhbSBfd29ybGQgXHJcbiAgICAgICAgICogQHBhcmFtIF9wcm9qZWN0aW9uIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByb3RlY3RlZCBzdGF0aWMgZHJhd0ZvclJheUNhc3QoX2lkOiBudW1iZXIsIF9yZW5kZXJCdWZmZXJzOiBSZW5kZXJCdWZmZXJzLCBfd29ybGQ6IE1hdHJpeDR4NCwgX3Byb2plY3Rpb246IE1hdHJpeDR4NCk6IHZvaWQge1xyXG4gICAgICAgICAgICBsZXQgcmVuZGVyU2hhZGVyOiBSZW5kZXJTaGFkZXIgPSBSZW5kZXJPcGVyYXRvci5yZW5kZXJTaGFkZXJSYXlDYXN0O1xyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci51c2VQcm9ncmFtKHJlbmRlclNoYWRlcik7XHJcblxyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmJpbmRCdWZmZXIoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5BUlJBWV9CVUZGRVIsIF9yZW5kZXJCdWZmZXJzLnZlcnRpY2VzKTtcclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShyZW5kZXJTaGFkZXIuYXR0cmlidXRlc1tcImFfcG9zaXRpb25cIl0pO1xyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5zZXRBdHRyaWJ1dGVTdHJ1Y3R1cmUocmVuZGVyU2hhZGVyLmF0dHJpYnV0ZXNbXCJhX3Bvc2l0aW9uXCJdLCBNZXNoLmdldEJ1ZmZlclNwZWNpZmljYXRpb24oKSk7XHJcblxyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmJpbmRCdWZmZXIoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgX3JlbmRlckJ1ZmZlcnMuaW5kaWNlcyk7XHJcblxyXG4gICAgICAgICAgICAvLyBTdXBwbHkgbWF0cml4ZGF0YSB0byBzaGFkZXIuIFxyXG4gICAgICAgICAgICBsZXQgdVByb2plY3Rpb246IFdlYkdMVW5pZm9ybUxvY2F0aW9uID0gcmVuZGVyU2hhZGVyLnVuaWZvcm1zW1widV9wcm9qZWN0aW9uXCJdO1xyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLnVuaWZvcm1NYXRyaXg0ZnYodVByb2plY3Rpb24sIGZhbHNlLCBfcHJvamVjdGlvbi5nZXQoKSk7XHJcblxyXG4gICAgICAgICAgICBpZiAocmVuZGVyU2hhZGVyLnVuaWZvcm1zW1widV93b3JsZFwiXSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHVXb3JsZDogV2ViR0xVbmlmb3JtTG9jYXRpb24gPSByZW5kZXJTaGFkZXIudW5pZm9ybXNbXCJ1X3dvcmxkXCJdO1xyXG4gICAgICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy51bmlmb3JtTWF0cml4NGZ2KHVXb3JsZCwgZmFsc2UsIF93b3JsZC5nZXQoKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBpZFVuaWZvcm1Mb2NhdGlvbjogV2ViR0xVbmlmb3JtTG9jYXRpb24gPSByZW5kZXJTaGFkZXIudW5pZm9ybXNbXCJ1X2lkXCJdO1xyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5nZXRSZW5kZXJpbmdDb250ZXh0KCkudW5pZm9ybTFpKGlkVW5pZm9ybUxvY2F0aW9uLCBfaWQpO1xyXG5cclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy5kcmF3RWxlbWVudHMoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5UUklBTkdMRVMsIF9yZW5kZXJCdWZmZXJzLm5JbmRpY2VzLCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlVOU0lHTkVEX1NIT1JULCAwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vICNyZWdpb24gU2hhZGVycHJvZ3JhbSBcclxuICAgICAgICBwcm90ZWN0ZWQgc3RhdGljIGNyZWF0ZVByb2dyYW0oX3NoYWRlckNsYXNzOiB0eXBlb2YgU2hhZGVyKTogUmVuZGVyU2hhZGVyIHtcclxuICAgICAgICAgICAgbGV0IGNyYzM6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQgPSBSZW5kZXJPcGVyYXRvci5jcmMzO1xyXG4gICAgICAgICAgICBsZXQgcHJvZ3JhbTogV2ViR0xQcm9ncmFtID0gY3JjMy5jcmVhdGVQcm9ncmFtKCk7XHJcbiAgICAgICAgICAgIGxldCByZW5kZXJTaGFkZXI6IFJlbmRlclNoYWRlcjtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGNyYzMuYXR0YWNoU2hhZGVyKHByb2dyYW0sIFJlbmRlck9wZXJhdG9yLmFzc2VydDxXZWJHTFNoYWRlcj4oY29tcGlsZVNoYWRlcihfc2hhZGVyQ2xhc3MuZ2V0VmVydGV4U2hhZGVyU291cmNlKCksIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVkVSVEVYX1NIQURFUikpKTtcclxuICAgICAgICAgICAgICAgIGNyYzMuYXR0YWNoU2hhZGVyKHByb2dyYW0sIFJlbmRlck9wZXJhdG9yLmFzc2VydDxXZWJHTFNoYWRlcj4oY29tcGlsZVNoYWRlcihfc2hhZGVyQ2xhc3MuZ2V0RnJhZ21lbnRTaGFkZXJTb3VyY2UoKSwgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5GUkFHTUVOVF9TSEFERVIpKSk7XHJcbiAgICAgICAgICAgICAgICBjcmMzLmxpbmtQcm9ncmFtKHByb2dyYW0pO1xyXG4gICAgICAgICAgICAgICAgbGV0IGVycm9yOiBzdHJpbmcgPSBSZW5kZXJPcGVyYXRvci5hc3NlcnQ8c3RyaW5nPihjcmMzLmdldFByb2dyYW1JbmZvTG9nKHByb2dyYW0pKTtcclxuICAgICAgICAgICAgICAgIGlmIChlcnJvciAhPT0gXCJcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVycm9yIGxpbmtpbmcgU2hhZGVyOiBcIiArIGVycm9yKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJlbmRlclNoYWRlciA9IHtcclxuICAgICAgICAgICAgICAgICAgICBwcm9ncmFtOiBwcm9ncmFtLFxyXG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IGRldGVjdEF0dHJpYnV0ZXMoKSxcclxuICAgICAgICAgICAgICAgICAgICB1bmlmb3JtczogZGV0ZWN0VW5pZm9ybXMoKVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoX2Vycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBEZWJ1Zy5lcnJvcihfZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgZGVidWdnZXI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlbmRlclNoYWRlcjtcclxuXHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBjb21waWxlU2hhZGVyKF9zaGFkZXJDb2RlOiBzdHJpbmcsIF9zaGFkZXJUeXBlOiBHTGVudW0pOiBXZWJHTFNoYWRlciB8IG51bGwge1xyXG4gICAgICAgICAgICAgICAgbGV0IHdlYkdMU2hhZGVyOiBXZWJHTFNoYWRlciA9IGNyYzMuY3JlYXRlU2hhZGVyKF9zaGFkZXJUeXBlKTtcclxuICAgICAgICAgICAgICAgIGNyYzMuc2hhZGVyU291cmNlKHdlYkdMU2hhZGVyLCBfc2hhZGVyQ29kZSk7XHJcbiAgICAgICAgICAgICAgICBjcmMzLmNvbXBpbGVTaGFkZXIod2ViR0xTaGFkZXIpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGVycm9yOiBzdHJpbmcgPSBSZW5kZXJPcGVyYXRvci5hc3NlcnQ8c3RyaW5nPihjcmMzLmdldFNoYWRlckluZm9Mb2cod2ViR0xTaGFkZXIpKTtcclxuICAgICAgICAgICAgICAgIGlmIChlcnJvciAhPT0gXCJcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVycm9yIGNvbXBpbGluZyBzaGFkZXI6IFwiICsgZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIGFueSBjb21waWxhdGlvbiBlcnJvcnMuXHJcbiAgICAgICAgICAgICAgICBpZiAoIWNyYzMuZ2V0U2hhZGVyUGFyYW1ldGVyKHdlYkdMU2hhZGVyLCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkNPTVBJTEVfU1RBVFVTKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFsZXJ0KGNyYzMuZ2V0U2hhZGVySW5mb0xvZyh3ZWJHTFNoYWRlcikpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHdlYkdMU2hhZGVyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGRldGVjdEF0dHJpYnV0ZXMoKTogeyBbbmFtZTogc3RyaW5nXTogbnVtYmVyIH0ge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRldGVjdGVkQXR0cmlidXRlczogeyBbbmFtZTogc3RyaW5nXTogbnVtYmVyIH0gPSB7fTtcclxuICAgICAgICAgICAgICAgIGxldCBhdHRyaWJ1dGVDb3VudDogbnVtYmVyID0gY3JjMy5nZXRQcm9ncmFtUGFyYW1ldGVyKHByb2dyYW0sIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuQUNUSVZFX0FUVFJJQlVURVMpO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IGF0dHJpYnV0ZUNvdW50OyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgYXR0cmlidXRlSW5mbzogV2ViR0xBY3RpdmVJbmZvID0gUmVuZGVyT3BlcmF0b3IuYXNzZXJ0PFdlYkdMQWN0aXZlSW5mbz4oY3JjMy5nZXRBY3RpdmVBdHRyaWIocHJvZ3JhbSwgaSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghYXR0cmlidXRlSW5mbykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZGV0ZWN0ZWRBdHRyaWJ1dGVzW2F0dHJpYnV0ZUluZm8ubmFtZV0gPSBjcmMzLmdldEF0dHJpYkxvY2F0aW9uKHByb2dyYW0sIGF0dHJpYnV0ZUluZm8ubmFtZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGV0ZWN0ZWRBdHRyaWJ1dGVzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGRldGVjdFVuaWZvcm1zKCk6IHsgW25hbWU6IHN0cmluZ106IFdlYkdMVW5pZm9ybUxvY2F0aW9uIH0ge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRldGVjdGVkVW5pZm9ybXM6IHsgW25hbWU6IHN0cmluZ106IFdlYkdMVW5pZm9ybUxvY2F0aW9uIH0gPSB7fTtcclxuICAgICAgICAgICAgICAgIGxldCB1bmlmb3JtQ291bnQ6IG51bWJlciA9IGNyYzMuZ2V0UHJvZ3JhbVBhcmFtZXRlcihwcm9ncmFtLCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkFDVElWRV9VTklGT1JNUyk7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgdW5pZm9ybUNvdW50OyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgaW5mbzogV2ViR0xBY3RpdmVJbmZvID0gUmVuZGVyT3BlcmF0b3IuYXNzZXJ0PFdlYkdMQWN0aXZlSW5mbz4oY3JjMy5nZXRBY3RpdmVVbmlmb3JtKHByb2dyYW0sIGkpKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWluZm8pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGRldGVjdGVkVW5pZm9ybXNbaW5mby5uYW1lXSA9IFJlbmRlck9wZXJhdG9yLmFzc2VydDxXZWJHTFVuaWZvcm1Mb2NhdGlvbj4oY3JjMy5nZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbSwgaW5mby5uYW1lKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGV0ZWN0ZWRVbmlmb3JtcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBwcm90ZWN0ZWQgc3RhdGljIHVzZVByb2dyYW0oX3NoYWRlckluZm86IFJlbmRlclNoYWRlcik6IHZvaWQge1xyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLnVzZVByb2dyYW0oX3NoYWRlckluZm8ucHJvZ3JhbSk7XHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoX3NoYWRlckluZm8uYXR0cmlidXRlc1tcImFfcG9zaXRpb25cIl0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwcm90ZWN0ZWQgc3RhdGljIGRlbGV0ZVByb2dyYW0oX3Byb2dyYW06IFJlbmRlclNoYWRlcik6IHZvaWQge1xyXG4gICAgICAgICAgICBpZiAoX3Byb2dyYW0pIHtcclxuICAgICAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMuZGVsZXRlUHJvZ3JhbShfcHJvZ3JhbS5wcm9ncmFtKTtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBfcHJvZ3JhbS5hdHRyaWJ1dGVzO1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIF9wcm9ncmFtLnVuaWZvcm1zO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vICNlbmRyZWdpb25cclxuXHJcbiAgICAgICAgLy8gI3JlZ2lvbiBNZXNoYnVmZmVyXHJcbiAgICAgICAgcHJvdGVjdGVkIHN0YXRpYyBjcmVhdGVCdWZmZXJzKF9tZXNoOiBNZXNoKTogUmVuZGVyQnVmZmVycyB7XHJcbiAgICAgICAgICAgIGxldCB2ZXJ0aWNlczogV2ViR0xCdWZmZXIgPSBSZW5kZXJPcGVyYXRvci5hc3NlcnQ8V2ViR0xCdWZmZXI+KFJlbmRlck9wZXJhdG9yLmNyYzMuY3JlYXRlQnVmZmVyKCkpO1xyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmJpbmRCdWZmZXIoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5BUlJBWV9CVUZGRVIsIHZlcnRpY2VzKTtcclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy5idWZmZXJEYXRhKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuQVJSQVlfQlVGRkVSLCBfbWVzaC52ZXJ0aWNlcywgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5TVEFUSUNfRFJBVyk7XHJcblxyXG4gICAgICAgICAgICBsZXQgaW5kaWNlczogV2ViR0xCdWZmZXIgPSBSZW5kZXJPcGVyYXRvci5hc3NlcnQ8V2ViR0xCdWZmZXI+KFJlbmRlck9wZXJhdG9yLmNyYzMuY3JlYXRlQnVmZmVyKCkpO1xyXG4gICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmJpbmRCdWZmZXIoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgaW5kaWNlcyk7XHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMuYnVmZmVyRGF0YShXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBfbWVzaC5pbmRpY2VzLCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlNUQVRJQ19EUkFXKTtcclxuXHJcbiAgICAgICAgICAgIGxldCB0ZXh0dXJlVVZzOiBXZWJHTEJ1ZmZlciA9IFJlbmRlck9wZXJhdG9yLmNyYzMuY3JlYXRlQnVmZmVyKCk7XHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMuYmluZEJ1ZmZlcihXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkFSUkFZX0JVRkZFUiwgdGV4dHVyZVVWcyk7XHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMuYnVmZmVyRGF0YShXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkFSUkFZX0JVRkZFUiwgX21lc2gudGV4dHVyZVVWcywgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5TVEFUSUNfRFJBVyk7XHJcblxyXG4gICAgICAgICAgICBsZXQgbm9ybWFsc0ZhY2U6IFdlYkdMQnVmZmVyID0gUmVuZGVyT3BlcmF0b3IuYXNzZXJ0PFdlYkdMQnVmZmVyPihSZW5kZXJPcGVyYXRvci5jcmMzLmNyZWF0ZUJ1ZmZlcigpKTtcclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy5iaW5kQnVmZmVyKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuQVJSQVlfQlVGRkVSLCBub3JtYWxzRmFjZSk7XHJcbiAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMuYnVmZmVyRGF0YShXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkFSUkFZX0JVRkZFUiwgX21lc2gubm9ybWFsc0ZhY2UsIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuU1RBVElDX0RSQVcpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGJ1ZmZlckluZm86IFJlbmRlckJ1ZmZlcnMgPSB7XHJcbiAgICAgICAgICAgICAgICB2ZXJ0aWNlczogdmVydGljZXMsXHJcbiAgICAgICAgICAgICAgICBpbmRpY2VzOiBpbmRpY2VzLFxyXG4gICAgICAgICAgICAgICAgbkluZGljZXM6IF9tZXNoLmdldEluZGV4Q291bnQoKSxcclxuICAgICAgICAgICAgICAgIHRleHR1cmVVVnM6IHRleHR1cmVVVnMsXHJcbiAgICAgICAgICAgICAgICBub3JtYWxzRmFjZTogbm9ybWFsc0ZhY2VcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcmV0dXJuIGJ1ZmZlckluZm87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByb3RlY3RlZCBzdGF0aWMgdXNlQnVmZmVycyhfcmVuZGVyQnVmZmVyczogUmVuZGVyQnVmZmVycyk6IHZvaWQge1xyXG4gICAgICAgICAgICAvLyBUT0RPOiBjdXJyZW50bHkgdW51c2VkLCBkb25lIHNwZWNpZmljYWxseSBpbiBkcmF3LiBDb3VsZCBiZSBzYXZlZCBpbiBWQU8gd2l0aGluIFJlbmRlckJ1ZmZlcnNcclxuICAgICAgICAgICAgLy8gUmVuZGVyT3BlcmF0b3IuY3JjMy5iaW5kQnVmZmVyKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuQVJSQVlfQlVGRkVSLCBfcmVuZGVyQnVmZmVycy52ZXJ0aWNlcyk7XHJcbiAgICAgICAgICAgIC8vIFJlbmRlck9wZXJhdG9yLmNyYzMuYmluZEJ1ZmZlcihXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBfcmVuZGVyQnVmZmVycy5pbmRpY2VzKTtcclxuICAgICAgICAgICAgLy8gUmVuZGVyT3BlcmF0b3IuY3JjMy5iaW5kQnVmZmVyKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuQVJSQVlfQlVGRkVSLCBfcmVuZGVyQnVmZmVycy50ZXh0dXJlVVZzKTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByb3RlY3RlZCBzdGF0aWMgZGVsZXRlQnVmZmVycyhfcmVuZGVyQnVmZmVyczogUmVuZGVyQnVmZmVycyk6IHZvaWQge1xyXG4gICAgICAgICAgICBpZiAoX3JlbmRlckJ1ZmZlcnMpIHtcclxuICAgICAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMuYmluZEJ1ZmZlcihXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkFSUkFZX0JVRkZFUiwgbnVsbCk7XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmRlbGV0ZUJ1ZmZlcihfcmVuZGVyQnVmZmVycy52ZXJ0aWNlcyk7XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmRlbGV0ZUJ1ZmZlcihfcmVuZGVyQnVmZmVycy50ZXh0dXJlVVZzKTtcclxuICAgICAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMuYmluZEJ1ZmZlcihXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBudWxsKTtcclxuICAgICAgICAgICAgICAgIFJlbmRlck9wZXJhdG9yLmNyYzMuZGVsZXRlQnVmZmVyKF9yZW5kZXJCdWZmZXJzLmluZGljZXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vICNlbmRyZWdpb25cclxuXHJcbiAgICAgICAgLy8gI3JlZ2lvbiBNYXRlcmlhbFBhcmFtZXRlcnNcclxuICAgICAgICBwcm90ZWN0ZWQgc3RhdGljIGNyZWF0ZVBhcmFtZXRlcihfY29hdDogQ29hdCk6IFJlbmRlckNvYXQge1xyXG4gICAgICAgICAgICAvLyBsZXQgdmFvOiBXZWJHTFZlcnRleEFycmF5T2JqZWN0ID0gUmVuZGVyT3BlcmF0b3IuYXNzZXJ0PFdlYkdMVmVydGV4QXJyYXlPYmplY3Q+KFJlbmRlck9wZXJhdG9yLmNyYzMuY3JlYXRlVmVydGV4QXJyYXkoKSk7XHJcbiAgICAgICAgICAgIGxldCBjb2F0SW5mbzogUmVuZGVyQ29hdCA9IHtcclxuICAgICAgICAgICAgICAgIC8vdmFvOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgY29hdDogX2NvYXRcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcmV0dXJuIGNvYXRJbmZvO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwcm90ZWN0ZWQgc3RhdGljIHVzZVBhcmFtZXRlcihfY29hdEluZm86IFJlbmRlckNvYXQpOiB2b2lkIHtcclxuICAgICAgICAgICAgLy8gUmVuZGVyT3BlcmF0b3IuY3JjMy5iaW5kVmVydGV4QXJyYXkoX2NvYXRJbmZvLnZhbyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByb3RlY3RlZCBzdGF0aWMgZGVsZXRlUGFyYW1ldGVyKF9jb2F0SW5mbzogUmVuZGVyQ29hdCk6IHZvaWQge1xyXG4gICAgICAgICAgICBpZiAoX2NvYXRJbmZvKSB7XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJPcGVyYXRvci5jcmMzLmJpbmRWZXJ0ZXhBcnJheShudWxsKTtcclxuICAgICAgICAgICAgICAgIC8vIFJlbmRlck9wZXJhdG9yLmNyYzMuZGVsZXRlVmVydGV4QXJyYXkoX2NvYXRJbmZvLnZhbyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gI2VuZHJlZ2lvblxyXG5cclxuICAgICAgICAvKiogXHJcbiAgICAgICAgICogV3JhcHBlciBmdW5jdGlvbiB0byB1dGlsaXplIHRoZSBidWZmZXJTcGVjaWZpY2F0aW9uIGludGVyZmFjZSB3aGVuIHBhc3NpbmcgZGF0YSB0byB0aGUgc2hhZGVyIHZpYSBhIGJ1ZmZlci5cclxuICAgICAgICAgKiBAcGFyYW0gX2F0dHJpYnV0ZUxvY2F0aW9uIC8vIFRoZSBsb2NhdGlvbiBvZiB0aGUgYXR0cmlidXRlIG9uIHRoZSBzaGFkZXIsIHRvIHdoaWNoIHRoZXkgZGF0YSB3aWxsIGJlIHBhc3NlZC5cclxuICAgICAgICAgKiBAcGFyYW0gX2J1ZmZlclNwZWNpZmljYXRpb24gLy8gSW50ZXJmYWNlIHBhc3NpbmcgZGF0YXB1bGxzcGVjaWZpY2F0aW9ucyB0byB0aGUgYnVmZmVyLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHNldEF0dHJpYnV0ZVN0cnVjdHVyZShfYXR0cmlidXRlTG9jYXRpb246IG51bWJlciwgX2J1ZmZlclNwZWNpZmljYXRpb246IEJ1ZmZlclNwZWNpZmljYXRpb24pOiB2b2lkIHtcclxuICAgICAgICAgICAgUmVuZGVyT3BlcmF0b3IuY3JjMy52ZXJ0ZXhBdHRyaWJQb2ludGVyKF9hdHRyaWJ1dGVMb2NhdGlvbiwgX2J1ZmZlclNwZWNpZmljYXRpb24uc2l6ZSwgX2J1ZmZlclNwZWNpZmljYXRpb24uZGF0YVR5cGUsIF9idWZmZXJTcGVjaWZpY2F0aW9uLm5vcm1hbGl6ZSwgX2J1ZmZlclNwZWNpZmljYXRpb24uc3RyaWRlLCBfYnVmZmVyU3BlY2lmaWNhdGlvbi5vZmZzZXQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9UcmFuc2Zlci9NdXRhYmxlLnRzXCIvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vUmVuZGVyL1JlbmRlckluamVjdG9yLnRzXCIvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vUmVuZGVyL1JlbmRlck9wZXJhdG9yLnRzXCIvPlxyXG5uYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogSG9sZHMgZGF0YSB0byBmZWVkIGludG8gYSBbW1NoYWRlcl1dIHRvIGRlc2NyaWJlIHRoZSBzdXJmYWNlIG9mIFtbTWVzaF1dLiAgXHJcbiAgICAgKiBbW01hdGVyaWFsXV1zIHJlZmVyZW5jZSBbW0NvYXRdXSBhbmQgW1tTaGFkZXJdXS4gICBcclxuICAgICAqIFRoZSBtZXRob2QgdXNlUmVuZGVyRGF0YSB3aWxsIGJlIGluamVjdGVkIGJ5IFtbUmVuZGVySW5qZWN0b3JdXSBhdCBydW50aW1lLCBleHRlbmRpbmcgdGhlIGZ1bmN0aW9uYWxpdHkgb2YgdGhpcyBjbGFzcyB0byBkZWFsIHdpdGggdGhlIHJlbmRlcmVyLlxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgQ29hdCBleHRlbmRzIE11dGFibGUgaW1wbGVtZW50cyBTZXJpYWxpemFibGUge1xyXG4gICAgICAgIHB1YmxpYyBuYW1lOiBzdHJpbmcgPSBcIkNvYXRcIjtcclxuICAgICAgICBwcm90ZWN0ZWQgcmVuZGVyRGF0YToge1trZXk6IHN0cmluZ106IHVua25vd259O1xyXG5cclxuICAgICAgICBwdWJsaWMgbXV0YXRlKF9tdXRhdG9yOiBNdXRhdG9yKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHN1cGVyLm11dGF0ZShfbXV0YXRvcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdXNlUmVuZGVyRGF0YShfcmVuZGVyU2hhZGVyOiBSZW5kZXJTaGFkZXIpOiB2b2lkIHsvKiBpbmplY3RlZCBieSBSZW5kZXJJbmplY3RvciovIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyNyZWdpb24gVHJhbnNmZXJcclxuICAgICAgICBwdWJsaWMgc2VyaWFsaXplKCk6IFNlcmlhbGl6YXRpb24ge1xyXG4gICAgICAgICAgICBsZXQgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IHRoaXMuZ2V0TXV0YXRvcigpOyBcclxuICAgICAgICAgICAgcmV0dXJuIHNlcmlhbGl6YXRpb247XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHB1YmxpYyBkZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbik6IFNlcmlhbGl6YWJsZSB7XHJcbiAgICAgICAgICAgIHRoaXMubXV0YXRlKF9zZXJpYWxpemF0aW9uKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcm90ZWN0ZWQgcmVkdWNlTXV0YXRvcigpOiB2b2lkIHsgLyoqLyB9XHJcbiAgICAgICAgLy8jZW5kcmVnaW9uXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgc2ltcGxlc3QgW1tDb2F0XV0gcHJvdmlkaW5nIGp1c3QgYSBjb2xvclxyXG4gICAgICovXHJcbiAgICBAUmVuZGVySW5qZWN0b3IuZGVjb3JhdGVDb2F0XHJcbiAgICBleHBvcnQgY2xhc3MgQ29hdENvbG9yZWQgZXh0ZW5kcyBDb2F0IHtcclxuICAgICAgICBwdWJsaWMgY29sb3I6IENvbG9yO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcihfY29sb3I/OiBDb2xvcikge1xyXG4gICAgICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgICAgICB0aGlzLmNvbG9yID0gX2NvbG9yIHx8IG5ldyBDb2xvcigwLjUsIDAuNSwgMC41LCAxKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBIFtbQ29hdF1dIHByb3ZpZGluZyBhIHRleHR1cmUgYW5kIGFkZGl0aW9uYWwgZGF0YSBmb3IgdGV4dHVyaW5nXHJcbiAgICAgKi9cclxuICAgIEBSZW5kZXJJbmplY3Rvci5kZWNvcmF0ZUNvYXRcclxuICAgIGV4cG9ydCBjbGFzcyBDb2F0VGV4dHVyZWQgZXh0ZW5kcyBDb2F0IHtcclxuICAgICAgICBwdWJsaWMgdGV4dHVyZTogVGV4dHVyZUltYWdlID0gbnVsbDtcclxuICAgICAgICAvLyBqdXN0IGlkZWFzIHNvIGZhclxyXG4gICAgICAgIHB1YmxpYyB0aWxpbmdYOiBudW1iZXI7XHJcbiAgICAgICAgcHVibGljIHRpbGluZ1k6IG51bWJlcjtcclxuICAgICAgICBwdWJsaWMgcmVwZXRpdGlvbjogYm9vbGVhbjtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQSBbW0NvYXRdXSB0byBiZSB1c2VkIGJ5IHRoZSBNYXRDYXAgU2hhZGVyIHByb3ZpZGluZyBhIHRleHR1cmUsIGEgdGludCBjb2xvciAoMC41IGdyZXkgaXMgbmV1dHJhbClcclxuICAgICAqIGFuZCBhIGZsYXRNaXggbnVtYmVyIGZvciBtaXhpbmcgYmV0d2VlbiBzbW9vdGggYW5kIGZsYXQgc2hhZGluZy5cclxuICAgICAqL1xyXG4gICAgQFJlbmRlckluamVjdG9yLmRlY29yYXRlQ29hdFxyXG4gICAgZXhwb3J0IGNsYXNzIENvYXRNYXRDYXAgZXh0ZW5kcyBDb2F0IHtcclxuICAgICAgICBwdWJsaWMgdGV4dHVyZTogVGV4dHVyZUltYWdlID0gbnVsbDtcclxuICAgICAgICBwdWJsaWMgdGludENvbG9yOiBDb2xvciA9IG5ldyBDb2xvcigwLjUsIDAuNSwgMC41LCAxKTtcclxuICAgICAgICBwdWJsaWMgZmxhdE1peDogbnVtYmVyID0gMC41O1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcihfdGV4dHVyZT86IFRleHR1cmVJbWFnZSwgX3RpbnRjb2xvcj86IENvbG9yLCBfZmxhdG1peD86IG51bWJlcikge1xyXG4gICAgICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgICAgICB0aGlzLnRleHR1cmUgPSBfdGV4dHVyZSB8fCBuZXcgVGV4dHVyZUltYWdlKCk7XHJcbiAgICAgICAgICAgIHRoaXMudGludENvbG9yID0gX3RpbnRjb2xvciB8fCBuZXcgQ29sb3IoMC41LCAwLjUsIDAuNSwgMSk7XHJcbiAgICAgICAgICAgIHRoaXMuZmxhdE1peCA9IF9mbGF0bWl4ID4gMS4wID8gdGhpcy5mbGF0TWl4ID0gMS4wIDogdGhpcy5mbGF0TWl4ID0gX2ZsYXRtaXggfHwgMC41O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9UcmFuc2Zlci9TZXJpYWxpemVyLnRzXCIvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vVHJhbnNmZXIvTXV0YWJsZS50c1wiLz5cclxubmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKiogXHJcbiAgICAgKiBTdXBlcmNsYXNzIGZvciBhbGwgW1tDb21wb25lbnRdXXMgdGhhdCBjYW4gYmUgYXR0YWNoZWQgdG8gW1tOb2RlXV1zLlxyXG4gICAgICogQGF1dGhvcnMgSmFzY2hhIEthcmFnw7ZsLCBIRlUsIDIwMTkgfCBKaXJrYSBEZWxsJ09yby1GcmllZGwsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgYWJzdHJhY3QgY2xhc3MgQ29tcG9uZW50IGV4dGVuZHMgTXV0YWJsZSBpbXBsZW1lbnRzIFNlcmlhbGl6YWJsZSB7XHJcbiAgICAgICAgcHJvdGVjdGVkIHNpbmdsZXRvbjogYm9vbGVhbiA9IHRydWU7XHJcbiAgICAgICAgcHJpdmF0ZSBjb250YWluZXI6IE5vZGUgfCBudWxsID0gbnVsbDtcclxuICAgICAgICBwcml2YXRlIGFjdGl2ZTogYm9vbGVhbiA9IHRydWU7XHJcblxyXG4gICAgICAgIHB1YmxpYyBhY3RpdmF0ZShfb246IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5hY3RpdmUgPSBfb247XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoX29uID8gRVZFTlQuQ09NUE9ORU5UX0FDVElWQVRFIDogRVZFTlQuQ09NUE9ORU5UX0RFQUNUSVZBVEUpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHVibGljIGdldCBpc0FjdGl2ZSgpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWN0aXZlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogSXMgdHJ1ZSwgd2hlbiBvbmx5IG9uZSBpbnN0YW5jZSBvZiB0aGUgY29tcG9uZW50IGNsYXNzIGNhbiBiZSBhdHRhY2hlZCB0byBhIG5vZGVcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0IGlzU2luZ2xldG9uKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zaW5nbGV0b247XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHJpZXZlcyB0aGUgbm9kZSwgdGhpcyBjb21wb25lbnQgaXMgY3VycmVudGx5IGF0dGFjaGVkIHRvXHJcbiAgICAgICAgICogQHJldHVybnMgVGhlIGNvbnRhaW5lciBub2RlIG9yIG51bGwsIGlmIHRoZSBjb21wb25lbnQgaXMgbm90IGF0dGFjaGVkIHRvXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGdldENvbnRhaW5lcigpOiBOb2RlIHwgbnVsbCB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbnRhaW5lcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVHJpZXMgdG8gYWRkIHRoZSBjb21wb25lbnQgdG8gdGhlIGdpdmVuIG5vZGUsIHJlbW92aW5nIGl0IGZyb20gdGhlIHByZXZpb3VzIGNvbnRhaW5lciBpZiBhcHBsaWNhYmxlXHJcbiAgICAgICAgICogQHBhcmFtIF9jb250YWluZXIgVGhlIG5vZGUgdG8gYXR0YWNoIHRoaXMgY29tcG9uZW50IHRvXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHNldENvbnRhaW5lcihfY29udGFpbmVyOiBOb2RlIHwgbnVsbCk6IHZvaWQge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jb250YWluZXIgPT0gX2NvbnRhaW5lcilcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgbGV0IHByZXZpb3VzQ29udGFpbmVyOiBOb2RlID0gdGhpcy5jb250YWluZXI7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocHJldmlvdXNDb250YWluZXIpXHJcbiAgICAgICAgICAgICAgICAgICAgcHJldmlvdXNDb250YWluZXIucmVtb3ZlQ29tcG9uZW50KHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb250YWluZXIgPSBfY29udGFpbmVyO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29udGFpbmVyKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29udGFpbmVyLmFkZENvbXBvbmVudCh0aGlzKTtcclxuICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRhaW5lciA9IHByZXZpb3VzQ29udGFpbmVyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vI3JlZ2lvbiBUcmFuc2ZlclxyXG4gICAgICAgIHB1YmxpYyBzZXJpYWxpemUoKTogU2VyaWFsaXphdGlvbiB7XHJcbiAgICAgICAgICAgIGxldCBzZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uID0ge1xyXG4gICAgICAgICAgICAgICAgYWN0aXZlOiB0aGlzLmFjdGl2ZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsaXphdGlvbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHVibGljIGRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uKTogU2VyaWFsaXphYmxlIHtcclxuICAgICAgICAgICAgdGhpcy5hY3RpdmUgPSBfc2VyaWFsaXphdGlvbi5hY3RpdmU7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJvdGVjdGVkIHJlZHVjZU11dGF0b3IoX211dGF0b3I6IE11dGF0b3IpOiB2b2lkIHtcclxuICAgICAgICAgICAgZGVsZXRlIF9tdXRhdG9yLnNpbmdsZXRvbjtcclxuICAgICAgICAgICAgZGVsZXRlIF9tdXRhdG9yLmNvbnRhaW5lcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8jZW5kcmVnaW9uXHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiQ29tcG9uZW50LnRzXCIvPlxyXG5uYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAvKipcclxuICAgKiBIb2xkcyBkaWZmZXJlbnQgcGxheW1vZGVzIHRoZSBhbmltYXRpb24gdXNlcyB0byBwbGF5IGJhY2sgaXRzIGFuaW1hdGlvbi5cclxuICAgKiBAYXV0aG9yIEx1a2FzIFNjaGV1ZXJsZSwgSEZVLCAyMDE5XHJcbiAgICovXHJcbiAgZXhwb3J0IGVudW0gQU5JTUFUSU9OX1BMQVlNT0RFIHtcclxuICAgIC8qKlBsYXlzIGFuaW1hdGlvbiBpbiBhIGxvb3A6IGl0IHJlc3RhcnRzIG9uY2UgaXQgaGl0IHRoZSBlbmQuKi9cclxuICAgIExPT1AsXHJcbiAgICAvKipQbGF5cyBhbmltYXRpb24gb25jZSBhbmQgc3RvcHMgYXQgdGhlIGxhc3Qga2V5L2ZyYW1lKi9cclxuICAgIFBMQVlPTkNFLFxyXG4gICAgLyoqUGxheXMgYW5pbWF0aW9uIG9uY2UgYW5kIHN0b3BzIG9uIHRoZSBmaXJzdCBrZXkvZnJhbWUgKi9cclxuICAgIFBMQVlPTkNFU1RPUEFGVEVSLFxyXG4gICAgLyoqUGxheXMgYW5pbWF0aW9uIGxpa2UgTE9PUCwgYnV0IGJhY2t3YXJkcy4qL1xyXG4gICAgUkVWRVJTRUxPT1AsXHJcbiAgICAvKipDYXVzZXMgdGhlIGFuaW1hdGlvbiBub3QgdG8gcGxheSBhdCBhbGwuIFVzZWZ1bCBmb3IganVtcGluZyB0byB2YXJpb3VzIHBvc2l0aW9ucyBpbiB0aGUgYW5pbWF0aW9uIHdpdGhvdXQgcHJvY2VlZGluZyBpbiB0aGUgYW5pbWF0aW9uLiovXHJcbiAgICBTVE9QXHJcbiAgICAvL1RPRE86IGFkZCBhbiBJTkhFUklUIGFuZCBhIFBJTkdQT05HIG1vZGVcclxuICB9XHJcblxyXG4gIGV4cG9ydCBlbnVtIEFOSU1BVElPTl9QTEFZQkFDSyB7XHJcbiAgICAvL1RPRE86IGFkZCBhbiBpbi1kZXB0aCBkZXNjcmlwdGlvbiBvZiB3aGF0IGhhcHBlbnMgdG8gdGhlIGFuaW1hdGlvbiAoYW5kIGV2ZW50cykgZGVwZW5kaW5nIG9uIHRoZSBQbGF5YmFjay4gVXNlIEdyYXBocyB0byBleHBsYWluLlxyXG4gICAgLyoqQ2FsY3VsYXRlcyB0aGUgc3RhdGUgb2YgdGhlIGFuaW1hdGlvbiBhdCB0aGUgZXhhY3QgcG9zaXRpb24gb2YgdGltZS4gSWdub3JlcyBGUFMgdmFsdWUgb2YgYW5pbWF0aW9uLiovXHJcbiAgICBUSU1FQkFTRURfQ09OVElOT1VTLFxyXG4gICAgLyoqTGltaXRzIHRoZSBjYWxjdWxhdGlvbiBvZiB0aGUgc3RhdGUgb2YgdGhlIGFuaW1hdGlvbiB0byB0aGUgRlBTIHZhbHVlIG9mIHRoZSBhbmltYXRpb24uIFNraXBzIGZyYW1lcyBpZiBuZWVkZWQuKi9cclxuICAgIFRJTUVCQVNFRF9SQVNURVJFRF9UT19GUFMsXHJcbiAgICAvKipVc2VzIHRoZSBGUFMgdmFsdWUgb2YgdGhlIGFuaW1hdGlvbiB0byBhZHZhbmNlIG9uY2UgcGVyIGZyYW1lLCBubyBtYXR0ZXIgdGhlIHNwZWVkIG9mIHRoZSBmcmFtZXMuIERvZXNuJ3Qgc2tpcCBhbnkgZnJhbWVzLiovXHJcbiAgICBGUkFNRUJBU0VEXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBIb2xkcyBhIHJlZmVyZW5jZSB0byBhbiBbW0FuaW1hdGlvbl1dIGFuZCBjb250cm9scyBpdC4gQ29udHJvbHMgcGxheWJhY2sgYW5kIHBsYXltb2RlIGFzIHdlbGwgYXMgc3BlZWQuXHJcbiAgICogQGF1dGhvcnMgTHVrYXMgU2NoZXVlcmxlLCBIRlUsIDIwMTlcclxuICAgKi9cclxuICBleHBvcnQgY2xhc3MgQ29tcG9uZW50QW5pbWF0b3IgZXh0ZW5kcyBDb21wb25lbnQge1xyXG4gICAgLy9UT0RPOiBhZGQgZnVuY3Rpb25hbGl0eSB0byBibGVuZCBmcm9tIG9uZSBhbmltYXRpb24gdG8gYW5vdGhlci5cclxuICAgIGFuaW1hdGlvbjogQW5pbWF0aW9uO1xyXG4gICAgcGxheW1vZGU6IEFOSU1BVElPTl9QTEFZTU9ERTtcclxuICAgIHBsYXliYWNrOiBBTklNQVRJT05fUExBWUJBQ0s7XHJcbiAgICBzcGVlZFNjYWxlc1dpdGhHbG9iYWxTcGVlZDogYm9vbGVhbiA9IHRydWU7XHJcblxyXG4gICAgcHJpdmF0ZSBsb2NhbFRpbWU6IFRpbWU7XHJcbiAgICBwcml2YXRlIHNwZWVkU2NhbGU6IG51bWJlciA9IDE7XHJcbiAgICBwcml2YXRlIGxhc3RUaW1lOiBudW1iZXIgPSAwO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKF9hbmltYXRpb246IEFuaW1hdGlvbiA9IG5ldyBBbmltYXRpb24oXCJcIiksIF9wbGF5bW9kZTogQU5JTUFUSU9OX1BMQVlNT0RFID0gQU5JTUFUSU9OX1BMQVlNT0RFLkxPT1AsIF9wbGF5YmFjazogQU5JTUFUSU9OX1BMQVlCQUNLID0gQU5JTUFUSU9OX1BMQVlCQUNLLlRJTUVCQVNFRF9DT05USU5PVVMpIHtcclxuICAgICAgc3VwZXIoKTtcclxuICAgICAgdGhpcy5hbmltYXRpb24gPSBfYW5pbWF0aW9uO1xyXG4gICAgICB0aGlzLnBsYXltb2RlID0gX3BsYXltb2RlO1xyXG4gICAgICB0aGlzLnBsYXliYWNrID0gX3BsYXliYWNrO1xyXG5cclxuICAgICAgdGhpcy5sb2NhbFRpbWUgPSBuZXcgVGltZSgpO1xyXG5cclxuICAgICAgLy9UT0RPOiB1cGRhdGUgYW5pbWF0aW9uIHRvdGFsIHRpbWUgd2hlbiBsb2FkaW5nIGEgZGlmZmVyZW50IGFuaW1hdGlvbj9cclxuICAgICAgdGhpcy5hbmltYXRpb24uY2FsY3VsYXRlVG90YWxUaW1lKCk7XHJcblxyXG4gICAgICBMb29wLmFkZEV2ZW50TGlzdGVuZXIoRVZFTlQuTE9PUF9GUkFNRSwgdGhpcy51cGRhdGVBbmltYXRpb25Mb29wLmJpbmQodGhpcykpO1xyXG4gICAgICBUaW1lLmdhbWUuYWRkRXZlbnRMaXN0ZW5lcihFVkVOVC5USU1FX1NDQUxFRCwgdGhpcy51cGRhdGVTY2FsZS5iaW5kKHRoaXMpKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgc3BlZWQoX3M6IG51bWJlcikge1xyXG4gICAgICB0aGlzLnNwZWVkU2NhbGUgPSBfcztcclxuICAgICAgdGhpcy51cGRhdGVTY2FsZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSnVtcHMgdG8gYSBjZXJ0YWluIHRpbWUgaW4gdGhlIGFuaW1hdGlvbiB0byBwbGF5IGZyb20gdGhlcmUuXHJcbiAgICAgKiBAcGFyYW0gX3RpbWUgVGhlIHRpbWUgdG8ganVtcCB0b1xyXG4gICAgICovXHJcbiAgICBqdW1wVG8oX3RpbWU6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICB0aGlzLmxvY2FsVGltZS5zZXQoX3RpbWUpO1xyXG4gICAgICB0aGlzLmxhc3RUaW1lID0gX3RpbWU7XHJcbiAgICAgIF90aW1lID0gX3RpbWUgJSB0aGlzLmFuaW1hdGlvbi50b3RhbFRpbWU7XHJcbiAgICAgIGxldCBtdXRhdG9yOiBNdXRhdG9yID0gdGhpcy5hbmltYXRpb24uZ2V0TXV0YXRlZChfdGltZSwgdGhpcy5jYWxjdWxhdGVEaXJlY3Rpb24oX3RpbWUpLCB0aGlzLnBsYXliYWNrKTtcclxuICAgICAgdGhpcy5nZXRDb250YWluZXIoKS5hcHBseUFuaW1hdGlvbihtdXRhdG9yKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGN1cnJlbnQgdGltZSBvZiB0aGUgYW5pbWF0aW9uLCBtb2R1bGF0ZWQgZm9yIGFuaW1hdGlvbiBsZW5ndGguXHJcbiAgICAgKi9cclxuICAgIGdldEN1cnJlbnRUaW1lKCk6IG51bWJlciB7XHJcbiAgICAgIHJldHVybiB0aGlzLmxvY2FsVGltZS5nZXQoKSAlIHRoaXMuYW5pbWF0aW9uLnRvdGFsVGltZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZvcmNlcyBhbiB1cGRhdGUgb2YgdGhlIGFuaW1hdGlvbiBmcm9tIG91dHNpZGUuIFVzZWQgaW4gdGhlIFZpZXdBbmltYXRpb24uIFNob3VsZG4ndCBiZSB1c2VkIGR1cmluZyB0aGUgZ2FtZS5cclxuICAgICAqIEBwYXJhbSBfdGltZSB0aGUgKHVuc2NhbGVkKSB0aW1lIHRvIHVwZGF0ZSB0aGUgYW5pbWF0aW9uIHdpdGguXHJcbiAgICAgKiBAcmV0dXJucyBhIFR1cGVsIGNvbnRhaW5pbmcgdGhlIE11dGF0b3IgZm9yIEFuaW1hdGlvbiBhbmQgdGhlIHBsYXltb2RlIGNvcnJlY3RlZCB0aW1lLiBcclxuICAgICAqL1xyXG4gICAgdXBkYXRlQW5pbWF0aW9uKF90aW1lOiBudW1iZXIpOiBbTXV0YXRvciwgbnVtYmVyXSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnVwZGF0ZUFuaW1hdGlvbkxvb3AobnVsbCwgX3RpbWUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vI3JlZ2lvbiB0cmFuc2ZlclxyXG4gICAgc2VyaWFsaXplKCk6IFNlcmlhbGl6YXRpb24ge1xyXG4gICAgICBsZXQgczogU2VyaWFsaXphdGlvbiA9IHN1cGVyLnNlcmlhbGl6ZSgpO1xyXG4gICAgICBzW1wiYW5pbWF0aW9uXCJdID0gdGhpcy5hbmltYXRpb24uc2VyaWFsaXplKCk7XHJcbiAgICAgIHNbXCJwbGF5bW9kZVwiXSA9IHRoaXMucGxheW1vZGU7XHJcbiAgICAgIHNbXCJwbGF5YmFja1wiXSA9IHRoaXMucGxheWJhY2s7XHJcbiAgICAgIHNbXCJzcGVlZFNjYWxlXCJdID0gdGhpcy5zcGVlZFNjYWxlO1xyXG4gICAgICBzW1wic3BlZWRTY2FsZXNXaXRoR2xvYmFsU3BlZWRcIl0gPSB0aGlzLnNwZWVkU2NhbGVzV2l0aEdsb2JhbFNwZWVkO1xyXG5cclxuICAgICAgc1tzdXBlci5jb25zdHJ1Y3Rvci5uYW1lXSA9IHN1cGVyLnNlcmlhbGl6ZSgpO1xyXG5cclxuICAgICAgcmV0dXJuIHM7XHJcbiAgICB9XHJcblxyXG4gICAgZGVzZXJpYWxpemUoX3M6IFNlcmlhbGl6YXRpb24pOiBTZXJpYWxpemFibGUge1xyXG4gICAgICB0aGlzLmFuaW1hdGlvbiA9IG5ldyBBbmltYXRpb24oXCJcIik7XHJcbiAgICAgIHRoaXMuYW5pbWF0aW9uLmRlc2VyaWFsaXplKF9zLmFuaW1hdGlvbik7XHJcbiAgICAgIHRoaXMucGxheWJhY2sgPSBfcy5wbGF5YmFjaztcclxuICAgICAgdGhpcy5wbGF5bW9kZSA9IF9zLnBsYXltb2RlO1xyXG4gICAgICB0aGlzLnNwZWVkU2NhbGUgPSBfcy5zcGVlZFNjYWxlO1xyXG4gICAgICB0aGlzLnNwZWVkU2NhbGVzV2l0aEdsb2JhbFNwZWVkID0gX3Muc3BlZWRTY2FsZXNXaXRoR2xvYmFsU3BlZWQ7XHJcblxyXG4gICAgICBzdXBlci5kZXNlcmlhbGl6ZShfc1tzdXBlci5jb25zdHJ1Y3Rvci5uYW1lXSk7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgLy8jZW5kcmVnaW9uXHJcblxyXG4gICAgLy8jcmVnaW9uIHVwZGF0ZUFuaW1hdGlvblxyXG4gICAgLyoqXHJcbiAgICAgKiBVcGRhdGVzIHRoZSBBbmltYXRpb24uXHJcbiAgICAgKiBHZXRzIGNhbGxlZCBldmVyeSB0aW1lIHRoZSBMb29wIGZpcmVzIHRoZSBMT09QX0ZSQU1FIEV2ZW50LlxyXG4gICAgICogVXNlcyB0aGUgYnVpbHQtaW4gdGltZSB1bmxlc3MgYSBkaWZmZXJlbnQgdGltZSBpcyBzcGVjaWZpZWQuXHJcbiAgICAgKiBNYXkgYWxzbyBiZSBjYWxsZWQgZnJvbSB1cGRhdGVBbmltYXRpb24oKS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSB1cGRhdGVBbmltYXRpb25Mb29wKF9lOiBFdmVudCwgX3RpbWU6IG51bWJlcik6IFtNdXRhdG9yLCBudW1iZXJdIHtcclxuICAgICAgaWYgKHRoaXMuYW5pbWF0aW9uLnRvdGFsVGltZSA9PSAwKVxyXG4gICAgICAgIHJldHVybiBbbnVsbCwgMF07XHJcbiAgICAgIGxldCB0aW1lOiBudW1iZXIgPSBfdGltZSB8fCB0aGlzLmxvY2FsVGltZS5nZXQoKTtcclxuICAgICAgaWYgKHRoaXMucGxheWJhY2sgPT0gQU5JTUFUSU9OX1BMQVlCQUNLLkZSQU1FQkFTRUQpIHtcclxuICAgICAgICB0aW1lID0gdGhpcy5sYXN0VGltZSArICgxMDAwIC8gdGhpcy5hbmltYXRpb24uZnBzKTtcclxuICAgICAgfVxyXG4gICAgICBsZXQgZGlyZWN0aW9uOiBudW1iZXIgPSB0aGlzLmNhbGN1bGF0ZURpcmVjdGlvbih0aW1lKTtcclxuICAgICAgdGltZSA9IHRoaXMuYXBwbHlQbGF5bW9kZXModGltZSk7XHJcbiAgICAgIHRoaXMuZXhlY3V0ZUV2ZW50cyh0aGlzLmFuaW1hdGlvbi5nZXRFdmVudHNUb0ZpcmUodGhpcy5sYXN0VGltZSwgdGltZSwgdGhpcy5wbGF5YmFjaywgZGlyZWN0aW9uKSk7XHJcblxyXG4gICAgICBpZiAodGhpcy5sYXN0VGltZSAhPSB0aW1lKSB7XHJcbiAgICAgICAgdGhpcy5sYXN0VGltZSA9IHRpbWU7XHJcbiAgICAgICAgdGltZSA9IHRpbWUgJSB0aGlzLmFuaW1hdGlvbi50b3RhbFRpbWU7XHJcbiAgICAgICAgbGV0IG11dGF0b3I6IE11dGF0b3IgPSB0aGlzLmFuaW1hdGlvbi5nZXRNdXRhdGVkKHRpbWUsIGRpcmVjdGlvbiwgdGhpcy5wbGF5YmFjayk7XHJcbiAgICAgICAgaWYgKHRoaXMuZ2V0Q29udGFpbmVyKCkpIHtcclxuICAgICAgICAgIHRoaXMuZ2V0Q29udGFpbmVyKCkuYXBwbHlBbmltYXRpb24obXV0YXRvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBbbXV0YXRvciwgdGltZV07XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIFtudWxsLCB0aW1lXTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZpcmVzIGFsbCBjdXN0b20gZXZlbnRzIHRoZSBBbmltYXRpb24gc2hvdWxkIGhhdmUgZmlyZWQgYmV0d2VlbiB0aGUgbGFzdCBmcmFtZSBhbmQgdGhlIGN1cnJlbnQgZnJhbWUuXHJcbiAgICAgKiBAcGFyYW0gZXZlbnRzIGEgbGlzdCBvZiBuYW1lcyBvZiBjdXN0b20gZXZlbnRzIHRvIGZpcmVcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBleGVjdXRlRXZlbnRzKGV2ZW50czogc3RyaW5nW10pOiB2b2lkIHtcclxuICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IGV2ZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoZXZlbnRzW2ldKSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGN1bGF0ZXMgdGhlIGFjdHVhbCB0aW1lIHRvIHVzZSwgdXNpbmcgdGhlIGN1cnJlbnQgcGxheW1vZGVzLlxyXG4gICAgICogQHBhcmFtIF90aW1lIHRoZSB0aW1lIHRvIGFwcGx5IHRoZSBwbGF5bW9kZXMgdG9cclxuICAgICAqIEByZXR1cm5zIHRoZSByZWNhbGN1bGF0ZWQgdGltZVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGFwcGx5UGxheW1vZGVzKF90aW1lOiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgICBzd2l0Y2ggKHRoaXMucGxheW1vZGUpIHtcclxuICAgICAgICBjYXNlIEFOSU1BVElPTl9QTEFZTU9ERS5TVE9QOlxyXG4gICAgICAgICAgcmV0dXJuIHRoaXMubG9jYWxUaW1lLmdldE9mZnNldCgpO1xyXG4gICAgICAgIGNhc2UgQU5JTUFUSU9OX1BMQVlNT0RFLlBMQVlPTkNFOlxyXG4gICAgICAgICAgaWYgKF90aW1lID49IHRoaXMuYW5pbWF0aW9uLnRvdGFsVGltZSlcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYW5pbWF0aW9uLnRvdGFsVGltZSAtIDAuMDE7ICAgICAvL1RPRE86IHRoaXMgbWlnaHQgY2F1c2Ugc29tZSBpc3N1ZXNcclxuICAgICAgICAgIGVsc2UgcmV0dXJuIF90aW1lO1xyXG4gICAgICAgIGNhc2UgQU5JTUFUSU9OX1BMQVlNT0RFLlBMQVlPTkNFU1RPUEFGVEVSOlxyXG4gICAgICAgICAgaWYgKF90aW1lID49IHRoaXMuYW5pbWF0aW9uLnRvdGFsVGltZSlcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYW5pbWF0aW9uLnRvdGFsVGltZSArIDAuMDE7ICAgICAvL1RPRE86IHRoaXMgbWlnaHQgY2F1c2Ugc29tZSBpc3N1ZXNcclxuICAgICAgICAgIGVsc2UgcmV0dXJuIF90aW1lO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICByZXR1cm4gX3RpbWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGN1bGF0ZXMgYW5kIHJldHVybnMgdGhlIGRpcmVjdGlvbiB0aGUgYW5pbWF0aW9uIHNob3VsZCBjdXJyZW50bHkgYmUgcGxheWluZyBpbi5cclxuICAgICAqIEBwYXJhbSBfdGltZSB0aGUgdGltZSBhdCB3aGljaCB0byBjYWxjdWxhdGUgdGhlIGRpcmVjdGlvblxyXG4gICAgICogQHJldHVybnMgMSBpZiBmb3J3YXJkLCAwIGlmIHN0b3AsIC0xIGlmIGJhY2t3YXJkc1xyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGNhbGN1bGF0ZURpcmVjdGlvbihfdGltZTogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgICAgc3dpdGNoICh0aGlzLnBsYXltb2RlKSB7XHJcbiAgICAgICAgY2FzZSBBTklNQVRJT05fUExBWU1PREUuU1RPUDpcclxuICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIC8vIGNhc2UgQU5JTUFUSU9OX1BMQVlNT0RFLlBJTkdQT05HOlxyXG4gICAgICAgIC8vICAgaWYgKE1hdGguZmxvb3IoX3RpbWUgLyB0aGlzLmFuaW1hdGlvbi50b3RhbFRpbWUpICUgMiA9PSAwKVxyXG4gICAgICAgIC8vICAgICByZXR1cm4gMTtcclxuICAgICAgICAvLyAgIGVsc2VcclxuICAgICAgICAvLyAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgIGNhc2UgQU5JTUFUSU9OX1BMQVlNT0RFLlJFVkVSU0VMT09QOlxyXG4gICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgIGNhc2UgQU5JTUFUSU9OX1BMQVlNT0RFLlBMQVlPTkNFOlxyXG4gICAgICAgIGNhc2UgQU5JTUFUSU9OX1BMQVlNT0RFLlBMQVlPTkNFU1RPUEFGVEVSOlxyXG4gICAgICAgICAgaWYgKF90aW1lID49IHRoaXMuYW5pbWF0aW9uLnRvdGFsVGltZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgIH1cclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFVwZGF0ZXMgdGhlIHNjYWxlIG9mIHRoZSBhbmltYXRpb24gaWYgdGhlIHVzZXIgY2hhbmdlcyBpdCBvciBpZiB0aGUgZ2xvYmFsIGdhbWUgdGltZXIgY2hhbmdlZCBpdHMgc2NhbGUuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgdXBkYXRlU2NhbGUoKTogdm9pZCB7XHJcbiAgICAgIGxldCBuZXdTY2FsZTogbnVtYmVyID0gdGhpcy5zcGVlZFNjYWxlO1xyXG4gICAgICBpZiAodGhpcy5zcGVlZFNjYWxlc1dpdGhHbG9iYWxTcGVlZClcclxuICAgICAgICBuZXdTY2FsZSAqPSBUaW1lLmdhbWUuZ2V0U2NhbGUoKTtcclxuICAgICAgdGhpcy5sb2NhbFRpbWUuc2V0U2NhbGUobmV3U2NhbGUpO1xyXG4gICAgfVxyXG4gICAgLy8jZW5kcmVnaW9uXHJcbiAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIkNvbXBvbmVudC50c1wiLz5cclxubmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIEF0dGFjaGVzIGEgW1tDb21wb25lbnRBdWRpb11dIHRvIGEgW1tOb2RlXV0uXHJcbiAgICAgKiBPbmx5IGEgc2luZ2xlIFtbQXVkaW9dXSBjYW4gYmUgdXNlZCB3aXRoaW4gYSBzaW5nbGUgW1tDb21wb25lbnRBdWRpb11dXHJcbiAgICAgKiBAYXV0aG9ycyBUaG9tYXMgRG9ybmVyLCBIRlUsIDIwMTlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIENvbXBvbmVudEF1ZGlvIGV4dGVuZHMgQ29tcG9uZW50IHtcclxuXHJcbiAgICAgICAgcHVibGljIGF1ZGlvOiBBdWRpbztcclxuICAgICAgICBcclxuICAgICAgICBwdWJsaWMgaXNMb2NhbGlzZWQ6IGJvb2xlYW47XHJcbiAgICAgICAgcHVibGljIGxvY2FsaXNhdGlvbjogQXVkaW9Mb2NhbGlzYXRpb24gfCBudWxsO1xyXG5cclxuICAgICAgICBwdWJsaWMgaXNGaWx0ZXJlZDogYm9vbGVhbjtcclxuICAgICAgICBwdWJsaWMgZmlsdGVyOiBBdWRpb0ZpbHRlciB8IG51bGw7XHJcblxyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnN0cnVjdG9yKF9hdWRpbzogQXVkaW8pIHtcclxuICAgICAgICAgICAgc3VwZXIoKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2V0QXVkaW8oX2F1ZGlvKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzZXRMb2NhbGlzYXRpb24oX2xvY2FsaXNhdGlvbjogQXVkaW9Mb2NhbGlzYXRpb24pOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5sb2NhbGlzYXRpb24gPSBfbG9jYWxpc2F0aW9uO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogcGxheUF1ZGlvXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHBsYXlBdWRpbyhfYXVkaW9Db250ZXh0OiBBdWRpb0NvbnRleHQpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5hdWRpby5pbml0QnVmZmVyU291cmNlKF9hdWRpb0NvbnRleHQpO1xyXG4gICAgICAgICAgICB0aGlzLmF1ZGlvLmJ1ZmZlclNvdXJjZS5zdGFydChfYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEFkZHMgYW4gW1tBdWRpb11dIHRvIHRoZSBbW0NvbXBvbmVudEF1ZGlvXV1cclxuICAgICAgICAgKiBAcGFyYW0gX2F1ZGlvIERlY29kZWQgQXVkaW8gRGF0YSBhcyBbW0F1ZGlvXV1cclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIHNldEF1ZGlvKF9hdWRpbzogQXVkaW8pOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5hdWRpbyA9IF9hdWRpbztcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRmluYWwgYXR0YWNobWVudHMgZm9yIHRoZSBBdWRpbyBOb2RlcyBpbiBmb2xsb3dpbmcgb3JkZXJcclxuICAgICAgICAgKiAxLiBMb2NhbGlzYXRpb25cclxuICAgICAgICAgKiAyLiBGaWx0ZXJcclxuICAgICAgICAgKiAzLiBNYXN0ZXIgR2FpblxyXG4gICAgICAgICAqIGNvbm5lY3RBdWRpb05vZGVzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgLy8gcHJpdmF0ZSBjb25uZWN0QXVkaW9Ob2RlcygpOiB2b2lkIHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgLy8gfVxyXG5cclxuXHJcblxyXG5cclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJDb21wb25lbnQudHNcIi8+XHJcbm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBBdHRhY2hlcyBhIFtbQXVkaW9MaXN0ZW5lcl1dIHRvIHRoZSBub2RlXHJcbiAgICAgKiBAYXV0aG9ycyBUaG9tYXMgRG9ybmVyLCBIRlUsIDIwMTlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIENvbXBvbmVudEF1ZGlvTGlzdGVuZXIgZXh0ZW5kcyBDb21wb25lbnQge1xyXG5cclxuICAgICAgICBcclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJDb21wb25lbnQudHNcIi8+XHJcbm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgZXhwb3J0IGVudW0gRklFTERfT0ZfVklFVyB7XHJcbiAgICAgICAgSE9SSVpPTlRBTCwgVkVSVElDQUwsIERJQUdPTkFMXHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIERlZmluZXMgaWRlbnRpZmllcnMgZm9yIHRoZSB2YXJpb3VzIHByb2plY3Rpb25zIGEgY2FtZXJhIGNhbiBwcm92aWRlLiAgXHJcbiAgICAgKiBUT0RPOiBjaGFuZ2UgYmFjayB0byBudW1iZXIgZW51bSBpZiBzdHJpbmdzIG5vdCBuZWVkZWRcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGVudW0gUFJPSkVDVElPTiB7XHJcbiAgICAgICAgQ0VOVFJBTCA9IFwiY2VudHJhbFwiLFxyXG4gICAgICAgIE9SVEhPR1JBUEhJQyA9IFwib3J0aG9ncmFwaGljXCIsXHJcbiAgICAgICAgRElNRVRSSUMgPSBcImRpbWV0cmljXCIsXHJcbiAgICAgICAgU1RFUkVPID0gXCJzdGVyZW9cIlxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgY2FtZXJhIGNvbXBvbmVudCBob2xkcyB0aGUgcHJvamVjdGlvbi1tYXRyaXggYW5kIG90aGVyIGRhdGEgbmVlZGVkIHRvIHJlbmRlciBhIHNjZW5lIGZyb20gdGhlIHBlcnNwZWN0aXZlIG9mIHRoZSBub2RlIGl0IGlzIGF0dGFjaGVkIHRvLlxyXG4gICAgICogQGF1dGhvcnMgSmFzY2hhIEthcmFnw7ZsLCBIRlUsIDIwMTkgfCBKaXJrYSBEZWxsJ09yby1GcmllZGwsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgQ29tcG9uZW50Q2FtZXJhIGV4dGVuZHMgQ29tcG9uZW50IHtcclxuICAgICAgICBwdWJsaWMgcGl2b3Q6IE1hdHJpeDR4NCA9IE1hdHJpeDR4NC5JREVOVElUWTtcclxuICAgICAgICAvL3ByaXZhdGUgb3J0aG9ncmFwaGljOiBib29sZWFuID0gZmFsc2U7IC8vIERldGVybWluZXMgd2hldGhlciB0aGUgaW1hZ2Ugd2lsbCBiZSByZW5kZXJlZCB3aXRoIHBlcnNwZWN0aXZlIG9yIG9ydGhvZ3JhcGhpYyBwcm9qZWN0aW9uLlxyXG4gICAgICAgIHByaXZhdGUgcHJvamVjdGlvbjogUFJPSkVDVElPTiA9IFBST0pFQ1RJT04uQ0VOVFJBTDtcclxuICAgICAgICBwcml2YXRlIHRyYW5zZm9ybTogTWF0cml4NHg0ID0gbmV3IE1hdHJpeDR4NDsgLy8gVGhlIG1hdHJpeCB0byBtdWx0aXBseSBlYWNoIHNjZW5lIG9iamVjdHMgdHJhbnNmb3JtYXRpb24gYnksIHRvIGRldGVybWluZSB3aGVyZSBpdCB3aWxsIGJlIGRyYXduLlxyXG4gICAgICAgIHByaXZhdGUgZmllbGRPZlZpZXc6IG51bWJlciA9IDQ1OyAvLyBUaGUgY2FtZXJhJ3Mgc2Vuc29yYW5nbGUuXHJcbiAgICAgICAgcHJpdmF0ZSBhc3BlY3RSYXRpbzogbnVtYmVyID0gMS4wO1xyXG4gICAgICAgIHByaXZhdGUgZGlyZWN0aW9uOiBGSUVMRF9PRl9WSUVXID0gRklFTERfT0ZfVklFVy5ESUFHT05BTDtcclxuICAgICAgICBwcml2YXRlIGJhY2tncm91bmRDb2xvcjogQ29sb3IgPSBuZXcgQ29sb3IoMCwgMCwgMCwgMSk7IC8vIFRoZSBjb2xvciBvZiB0aGUgYmFja2dyb3VuZCB0aGUgY2FtZXJhIHdpbGwgcmVuZGVyLlxyXG4gICAgICAgIHByaXZhdGUgYmFja2dyb3VuZEVuYWJsZWQ6IGJvb2xlYW4gPSB0cnVlOyAvLyBEZXRlcm1pbmVzIHdoZXRoZXIgb3Igbm90IHRoZSBiYWNrZ3JvdW5kIG9mIHRoaXMgY2FtZXJhIHdpbGwgYmUgcmVuZGVyZWQuXHJcbiAgICAgICAgLy8gVE9ETzogZXhhbWluZSwgaWYgYmFja2dyb3VuZCBzaG91bGQgYmUgYW4gYXR0cmlidXRlIG9mIENhbWVyYSBvciBWaWV3cG9ydFxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0UHJvamVjdGlvbigpOiBQUk9KRUNUSU9OIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvamVjdGlvbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRCYWNrZ291bmRDb2xvcigpOiBDb2xvciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmJhY2tncm91bmRDb2xvcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRCYWNrZ3JvdW5kRW5hYmxlZCgpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYmFja2dyb3VuZEVuYWJsZWQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0QXNwZWN0KCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFzcGVjdFJhdGlvO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldEZpZWxkT2ZWaWV3KCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZpZWxkT2ZWaWV3O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldERpcmVjdGlvbigpOiBGSUVMRF9PRl9WSUVXIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGlyZWN0aW9uO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyB0aGUgbXVsdGlwbGlrYXRpb24gb2YgdGhlIHdvcmxkdHJhbnNmb3JtYXRpb24gb2YgdGhlIGNhbWVyYSBjb250YWluZXIgd2l0aCB0aGUgcHJvamVjdGlvbiBtYXRyaXhcclxuICAgICAgICAgKiBAcmV0dXJucyB0aGUgd29ybGQtcHJvamVjdGlvbi1tYXRyaXhcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0IFZpZXdQcm9qZWN0aW9uTWF0cml4KCk6IE1hdHJpeDR4NCB7XHJcbiAgICAgICAgICAgIGxldCB3b3JsZDogTWF0cml4NHg0ID0gdGhpcy5waXZvdDtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHdvcmxkID0gTWF0cml4NHg0Lk1VTFRJUExJQ0FUSU9OKHRoaXMuZ2V0Q29udGFpbmVyKCkubXR4V29ybGQsIHRoaXMucGl2b3QpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChfZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIC8vIG5vIGNvbnRhaW5lciBub2RlIG9yIG5vIHdvcmxkIHRyYW5zZm9ybWF0aW9uIGZvdW5kIC0+IGNvbnRpbnVlIHdpdGggcGl2b3Qgb25seVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCB2aWV3TWF0cml4OiBNYXRyaXg0eDQgPSBNYXRyaXg0eDQuSU5WRVJTSU9OKHdvcmxkKTsgXHJcbiAgICAgICAgICAgIHJldHVybiBNYXRyaXg0eDQuTVVMVElQTElDQVRJT04odGhpcy50cmFuc2Zvcm0sIHZpZXdNYXRyaXgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2V0IHRoZSBjYW1lcmEgdG8gcGVyc3BlY3RpdmUgcHJvamVjdGlvbi4gVGhlIHdvcmxkIG9yaWdpbiBpcyBpbiB0aGUgY2VudGVyIG9mIHRoZSBjYW52YXNlbGVtZW50LlxyXG4gICAgICAgICAqIEBwYXJhbSBfYXNwZWN0IFRoZSBhc3BlY3QgcmF0aW8gYmV0d2VlbiB3aWR0aCBhbmQgaGVpZ2h0IG9mIHByb2plY3Rpb25zcGFjZS4oRGVmYXVsdCA9IGNhbnZhcy5jbGllbnRXaWR0aCAvIGNhbnZhcy5DbGllbnRIZWlnaHQpXHJcbiAgICAgICAgICogQHBhcmFtIF9maWVsZE9mVmlldyBUaGUgZmllbGQgb2YgdmlldyBpbiBEZWdyZWVzLiAoRGVmYXVsdCA9IDQ1KVxyXG4gICAgICAgICAqIEBwYXJhbSBfZGlyZWN0aW9uIFRoZSBwbGFuZSBvbiB3aGljaCB0aGUgZmllbGRPZlZpZXctQW5nbGUgaXMgZ2l2ZW4gXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHByb2plY3RDZW50cmFsKF9hc3BlY3Q6IG51bWJlciA9IHRoaXMuYXNwZWN0UmF0aW8sIF9maWVsZE9mVmlldzogbnVtYmVyID0gdGhpcy5maWVsZE9mVmlldywgX2RpcmVjdGlvbjogRklFTERfT0ZfVklFVyA9IHRoaXMuZGlyZWN0aW9uKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuYXNwZWN0UmF0aW8gPSBfYXNwZWN0O1xyXG4gICAgICAgICAgICB0aGlzLmZpZWxkT2ZWaWV3ID0gX2ZpZWxkT2ZWaWV3O1xyXG4gICAgICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IF9kaXJlY3Rpb247XHJcbiAgICAgICAgICAgIHRoaXMucHJvamVjdGlvbiA9IFBST0pFQ1RJT04uQ0VOVFJBTDtcclxuICAgICAgICAgICAgdGhpcy50cmFuc2Zvcm0gPSBNYXRyaXg0eDQuUFJPSkVDVElPTl9DRU5UUkFMKF9hc3BlY3QsIHRoaXMuZmllbGRPZlZpZXcsIDEsIDIwMDAsIHRoaXMuZGlyZWN0aW9uKTsgLy8gVE9ETzogcmVtb3ZlIG1hZ2ljIG51bWJlcnNcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2V0IHRoZSBjYW1lcmEgdG8gb3J0aG9ncmFwaGljIHByb2plY3Rpb24uIFRoZSBvcmlnaW4gaXMgaW4gdGhlIHRvcCBsZWZ0IGNvcm5lciBvZiB0aGUgY2FudmFzLlxyXG4gICAgICAgICAqIEBwYXJhbSBfbGVmdCBUaGUgcG9zaXRpb252YWx1ZSBvZiB0aGUgcHJvamVjdGlvbnNwYWNlJ3MgbGVmdCBib3JkZXIuIChEZWZhdWx0ID0gMClcclxuICAgICAgICAgKiBAcGFyYW0gX3JpZ2h0IFRoZSBwb3NpdGlvbnZhbHVlIG9mIHRoZSBwcm9qZWN0aW9uc3BhY2UncyByaWdodCBib3JkZXIuIChEZWZhdWx0ID0gY2FudmFzLmNsaWVudFdpZHRoKVxyXG4gICAgICAgICAqIEBwYXJhbSBfYm90dG9tIFRoZSBwb3NpdGlvbnZhbHVlIG9mIHRoZSBwcm9qZWN0aW9uc3BhY2UncyBib3R0b20gYm9yZGVyLihEZWZhdWx0ID0gY2FudmFzLmNsaWVudEhlaWdodClcclxuICAgICAgICAgKiBAcGFyYW0gX3RvcCBUaGUgcG9zaXRpb252YWx1ZSBvZiB0aGUgcHJvamVjdGlvbnNwYWNlJ3MgdG9wIGJvcmRlci4oRGVmYXVsdCA9IDApXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHByb2plY3RPcnRob2dyYXBoaWMoX2xlZnQ6IG51bWJlciA9IDAsIF9yaWdodDogbnVtYmVyID0gUmVuZGVyTWFuYWdlci5nZXRDYW52YXMoKS5jbGllbnRXaWR0aCwgX2JvdHRvbTogbnVtYmVyID0gUmVuZGVyTWFuYWdlci5nZXRDYW52YXMoKS5jbGllbnRIZWlnaHQsIF90b3A6IG51bWJlciA9IDApOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5wcm9qZWN0aW9uID0gUFJPSkVDVElPTi5PUlRIT0dSQVBISUM7XHJcbiAgICAgICAgICAgIHRoaXMudHJhbnNmb3JtID0gTWF0cml4NHg0LlBST0pFQ1RJT05fT1JUSE9HUkFQSElDKF9sZWZ0LCBfcmlnaHQsIF9ib3R0b20sIF90b3AsIDQwMCwgLTQwMCk7IC8vIFRPRE86IGV4YW1pbmUgbWFnaWMgbnVtYmVycyFcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybiB0aGUgY2FsY3VsYXRlZCBub3JtZWQgZGltZW5zaW9uIG9mIHRoZSBwcm9qZWN0aW9uIHNwYWNlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGdldFByb2plY3Rpb25SZWN0YW5nbGUoKTogUmVjdGFuZ2xlIHtcclxuICAgICAgICAgICAgbGV0IHRhbkZvdjogbnVtYmVyID0gTWF0aC50YW4oTWF0aC5QSSAqIHRoaXMuZmllbGRPZlZpZXcgLyAzNjApOyAvLyBIYWxmIG9mIHRoZSBhbmdsZSwgdG8gY2FsY3VsYXRlIGRpbWVuc2lvbiBmcm9tIHRoZSBjZW50ZXIgLT4gcmlnaHQgYW5nbGVcclxuICAgICAgICAgICAgbGV0IHRhbkhvcml6b250YWw6IG51bWJlciA9IDA7XHJcbiAgICAgICAgICAgIGxldCB0YW5WZXJ0aWNhbDogbnVtYmVyID0gMDtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRpcmVjdGlvbiA9PSBGSUVMRF9PRl9WSUVXLkRJQUdPTkFMKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgYXNwZWN0OiBudW1iZXIgPSBNYXRoLnNxcnQodGhpcy5hc3BlY3RSYXRpbyk7XHJcbiAgICAgICAgICAgICAgICB0YW5Ib3Jpem9udGFsID0gdGFuRm92ICogYXNwZWN0O1xyXG4gICAgICAgICAgICAgICAgdGFuVmVydGljYWwgPSB0YW5Gb3YgLyBhc3BlY3Q7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5kaXJlY3Rpb24gPT0gRklFTERfT0ZfVklFVy5WRVJUSUNBTCkge1xyXG4gICAgICAgICAgICAgICAgdGFuVmVydGljYWwgPSB0YW5Gb3Y7XHJcbiAgICAgICAgICAgICAgICB0YW5Ib3Jpem9udGFsID0gdGFuVmVydGljYWwgKiB0aGlzLmFzcGVjdFJhdGlvO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Ugey8vRk9WX0RJUkVDVElPTi5IT1JJWk9OVEFMXHJcbiAgICAgICAgICAgICAgICB0YW5Ib3Jpem9udGFsID0gdGFuRm92O1xyXG4gICAgICAgICAgICAgICAgdGFuVmVydGljYWwgPSB0YW5Ib3Jpem9udGFsIC8gdGhpcy5hc3BlY3RSYXRpbztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIFJlY3RhbmdsZS5HRVQoMCwgMCwgdGFuSG9yaXpvbnRhbCAqIDIsIHRhblZlcnRpY2FsICogMik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyNyZWdpb24gVHJhbnNmZXJcclxuICAgICAgICBwdWJsaWMgc2VyaWFsaXplKCk6IFNlcmlhbGl6YXRpb24ge1xyXG4gICAgICAgICAgICBsZXQgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IHtcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogdGhpcy5iYWNrZ3JvdW5kQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kRW5hYmxlZDogdGhpcy5iYWNrZ3JvdW5kRW5hYmxlZCxcclxuICAgICAgICAgICAgICAgIHByb2plY3Rpb246IHRoaXMucHJvamVjdGlvbixcclxuICAgICAgICAgICAgICAgIGZpZWxkT2ZWaWV3OiB0aGlzLmZpZWxkT2ZWaWV3LFxyXG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uOiB0aGlzLmRpcmVjdGlvbixcclxuICAgICAgICAgICAgICAgIGFzcGVjdDogdGhpcy5hc3BlY3RSYXRpbyxcclxuICAgICAgICAgICAgICAgIHBpdm90OiB0aGlzLnBpdm90LnNlcmlhbGl6ZSgpLFxyXG4gICAgICAgICAgICAgICAgW3N1cGVyLmNvbnN0cnVjdG9yLm5hbWVdOiBzdXBlci5zZXJpYWxpemUoKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsaXphdGlvbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBkZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbik6IFNlcmlhbGl6YWJsZSB7XHJcbiAgICAgICAgICAgIHRoaXMuYmFja2dyb3VuZENvbG9yID0gX3NlcmlhbGl6YXRpb24uYmFja2dyb3VuZENvbG9yO1xyXG4gICAgICAgICAgICB0aGlzLmJhY2tncm91bmRFbmFibGVkID0gX3NlcmlhbGl6YXRpb24uYmFja2dyb3VuZEVuYWJsZWQ7XHJcbiAgICAgICAgICAgIHRoaXMucHJvamVjdGlvbiA9IF9zZXJpYWxpemF0aW9uLnByb2plY3Rpb247XHJcbiAgICAgICAgICAgIHRoaXMuZmllbGRPZlZpZXcgPSBfc2VyaWFsaXphdGlvbi5maWVsZE9mVmlldztcclxuICAgICAgICAgICAgdGhpcy5hc3BlY3RSYXRpbyA9IF9zZXJpYWxpemF0aW9uLmFzcGVjdDtcclxuICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSBfc2VyaWFsaXphdGlvbi5kaXJlY3Rpb247XHJcbiAgICAgICAgICAgIHRoaXMucGl2b3QuZGVzZXJpYWxpemUoX3NlcmlhbGl6YXRpb24ucGl2b3QpO1xyXG4gICAgICAgICAgICBzdXBlci5kZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbltzdXBlci5jb25zdHJ1Y3Rvci5uYW1lXSk7XHJcbiAgICAgICAgICAgIHN3aXRjaCAodGhpcy5wcm9qZWN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFBST0pFQ1RJT04uT1JUSE9HUkFQSElDOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvamVjdE9ydGhvZ3JhcGhpYygpOyAvLyBUT0RPOiBzZXJpYWxpemUgYW5kIGRlc2VyaWFsaXplIHBhcmFtZXRlcnNcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgUFJPSkVDVElPTi5DRU5UUkFMOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvamVjdENlbnRyYWwoKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRNdXRhdG9yQXR0cmlidXRlVHlwZXMoX211dGF0b3I6IE11dGF0b3IpOiBNdXRhdG9yQXR0cmlidXRlVHlwZXMge1xyXG4gICAgICAgICAgICBsZXQgdHlwZXM6IE11dGF0b3JBdHRyaWJ1dGVUeXBlcyA9IHN1cGVyLmdldE11dGF0b3JBdHRyaWJ1dGVUeXBlcyhfbXV0YXRvcik7XHJcbiAgICAgICAgICAgIGlmICh0eXBlcy5kaXJlY3Rpb24pXHJcbiAgICAgICAgICAgICAgICB0eXBlcy5kaXJlY3Rpb24gPSBGSUVMRF9PRl9WSUVXO1xyXG4gICAgICAgICAgICBpZiAodHlwZXMucHJvamVjdGlvbilcclxuICAgICAgICAgICAgICAgIHR5cGVzLnByb2plY3Rpb24gPSBQUk9KRUNUSU9OO1xyXG4gICAgICAgICAgICByZXR1cm4gdHlwZXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgbXV0YXRlKF9tdXRhdG9yOiBNdXRhdG9yKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHN1cGVyLm11dGF0ZShfbXV0YXRvcik7XHJcblxyXG4gICAgICAgICAgICBzd2l0Y2ggKHRoaXMucHJvamVjdGlvbikge1xyXG4gICAgICAgICAgICAgICAgY2FzZSBQUk9KRUNUSU9OLkNFTlRSQUw6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9qZWN0Q2VudHJhbCh0aGlzLmFzcGVjdFJhdGlvLCB0aGlzLmZpZWxkT2ZWaWV3LCB0aGlzLmRpcmVjdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByb3RlY3RlZCByZWR1Y2VNdXRhdG9yKF9tdXRhdG9yOiBNdXRhdG9yKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBfbXV0YXRvci50cmFuc2Zvcm07XHJcbiAgICAgICAgICAgIHN1cGVyLnJlZHVjZU11dGF0b3IoX211dGF0b3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyNlbmRyZWdpb25cclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBCYXNlY2xhc3MgZm9yIGRpZmZlcmVudCBraW5kcyBvZiBsaWdodHMuIFxyXG4gICAgICogQGF1dGhvcnMgSmlya2EgRGVsbCdPcm8tRnJpZWRsLCBIRlUsIDIwMTlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGFic3RyYWN0IGNsYXNzIExpZ2h0IGV4dGVuZHMgTXV0YWJsZSB7XHJcbiAgICAgICAgcHVibGljIGNvbG9yOiBDb2xvcjtcclxuICAgICAgICBjb25zdHJ1Y3RvcihfY29sb3I6IENvbG9yID0gbmV3IENvbG9yKDEsIDEsIDEsIDEpKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY29sb3IgPSBfY29sb3I7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByb3RlY3RlZCByZWR1Y2VNdXRhdG9yKCk6IHZvaWQgey8qKi8gfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQW1iaWVudCBsaWdodCwgY29taW5nIGZyb20gYWxsIGRpcmVjdGlvbnMsIGlsbHVtaW5hdGluZyBldmVyeXRoaW5nIHdpdGggaXRzIGNvbG9yIGluZGVwZW5kZW50IG9mIHBvc2l0aW9uIGFuZCBvcmllbnRhdGlvbiAobGlrZSBhIGZvZ2d5IGRheSBvciBpbiB0aGUgc2hhZGVzKSAgXHJcbiAgICAgKiBgYGBwbGFpbnRleHRcclxuICAgICAqIH4gfiB+ICBcclxuICAgICAqICB+IH4gfiAgXHJcbiAgICAgKiBgYGBcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIExpZ2h0QW1iaWVudCBleHRlbmRzIExpZ2h0IHtcclxuICAgICAgICBjb25zdHJ1Y3RvcihfY29sb3I6IENvbG9yID0gbmV3IENvbG9yKDEsIDEsIDEsIDEpKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKF9jb2xvcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBEaXJlY3Rpb25hbCBsaWdodCwgaWxsdW1pbmF0aW5nIGV2ZXJ5dGhpbmcgZnJvbSBhIHNwZWNpZmllZCBkaXJlY3Rpb24gd2l0aCBpdHMgY29sb3IgKGxpa2Ugc3RhbmRpbmcgaW4gYnJpZ2h0IHN1bmxpZ2h0KSAgXHJcbiAgICAgKiBgYGBwbGFpbnRleHRcclxuICAgICAqIC0tLT4gIFxyXG4gICAgICogLS0tPiAgXHJcbiAgICAgKiAtLS0+ICBcclxuICAgICAqIGBgYFxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgTGlnaHREaXJlY3Rpb25hbCBleHRlbmRzIExpZ2h0IHtcclxuICAgICAgICBjb25zdHJ1Y3RvcihfY29sb3I6IENvbG9yID0gbmV3IENvbG9yKDEsIDEsIDEsIDEpKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKF9jb2xvcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBPbW5pZGlyZWN0aW9uYWwgbGlnaHQgZW1pdHRpbmcgZnJvbSBpdHMgcG9zaXRpb24sIGlsbHVtaW5hdGluZyBvYmplY3RzIGRlcGVuZGluZyBvbiB0aGVpciBwb3NpdGlvbiBhbmQgZGlzdGFuY2Ugd2l0aCBpdHMgY29sb3IgKGxpa2UgYSBjb2xvcmVkIGxpZ2h0IGJ1bGIpICBcclxuICAgICAqIGBgYHBsYWludGV4dFxyXG4gICAgICogICAgICAgICAuXFx8Ly5cclxuICAgICAqICAgICAgICAtLSBvIC0tXHJcbiAgICAgKiAgICAgICAgIMK0L3xcXGBcclxuICAgICAqIGBgYFxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgTGlnaHRQb2ludCBleHRlbmRzIExpZ2h0IHtcclxuICAgICAgICBwdWJsaWMgcmFuZ2U6IG51bWJlciA9IDEwO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBTcG90IGxpZ2h0IGVtaXR0aW5nIHdpdGhpbiBhIHNwZWNpZmllZCBhbmdsZSBmcm9tIGl0cyBwb3NpdGlvbiwgaWxsdW1pbmF0aW5nIG9iamVjdHMgZGVwZW5kaW5nIG9uIHRoZWlyIHBvc2l0aW9uIGFuZCBkaXN0YW5jZSB3aXRoIGl0cyBjb2xvciAgXHJcbiAgICAgKiBgYGBwbGFpbnRleHRcclxuICAgICAqICAgICAgICAgIG8gIFxyXG4gICAgICogICAgICAgICAvfFxcICBcclxuICAgICAqICAgICAgICAvIHwgXFwgXHJcbiAgICAgKiBgYGAgICBcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIExpZ2h0U3BvdCBleHRlbmRzIExpZ2h0IHtcclxuICAgIH1cclxufSIsIi8vLzxyZWZlcmVuY2UgcGF0aD1cIi4uL0xpZ2h0L0xpZ2h0LnRzXCIvPlxyXG5uYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogQXR0YWNoZXMgYSBbW0xpZ2h0XV0gdG8gdGhlIG5vZGVcclxuICAgICAqIEBhdXRob3JzIEppcmthIERlbGwnT3JvLUZyaWVkbCwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuXHJcbiAgICAvKipcclxuICAgICAqIERlZmluZXMgaWRlbnRpZmllcnMgZm9yIHRoZSB2YXJpb3VzIHR5cGVzIG9mIGxpZ2h0IHRoaXMgY29tcG9uZW50IGNhbiBwcm92aWRlLiAgXHJcbiAgICAgKi9cclxuICAgIC8vIGV4cG9ydCBlbnVtIExJR0hUX1RZUEUge1xyXG4gICAgLy8gICAgIEFNQklFTlQgPSBcImFtYmllbnRcIixcclxuICAgIC8vICAgICBESVJFQ1RJT05BTCA9IFwiZGlyZWN0aW9uYWxcIixcclxuICAgIC8vICAgICBQT0lOVCA9IFwicG9pbnRcIixcclxuICAgIC8vICAgICBTUE9UID0gXCJzcG90XCJcclxuICAgIC8vIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgQ29tcG9uZW50TGlnaHQgZXh0ZW5kcyBDb21wb25lbnQge1xyXG4gICAgICAgIC8vIHByaXZhdGUgc3RhdGljIGNvbnN0cnVjdG9yczogeyBbdHlwZTogc3RyaW5nXTogR2VuZXJhbCB9ID0geyBbTElHSFRfVFlQRS5BTUJJRU5UXTogTGlnaHRBbWJpZW50LCBbTElHSFRfVFlQRS5ESVJFQ1RJT05BTF06IExpZ2h0RGlyZWN0aW9uYWwsIFtMSUdIVF9UWVBFLlBPSU5UXTogTGlnaHRQb2ludCwgW0xJR0hUX1RZUEUuU1BPVF06IExpZ2h0U3BvdCB9O1xyXG4gICAgICAgIHB1YmxpYyBwaXZvdDogTWF0cml4NHg0ID0gTWF0cml4NHg0LklERU5USVRZO1xyXG4gICAgICAgIHB1YmxpYyBsaWdodDogTGlnaHQgPSBudWxsO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcihfbGlnaHQ6IExpZ2h0ID0gbmV3IExpZ2h0QW1iaWVudCgpKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2luZ2xldG9uID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMubGlnaHQgPSBfbGlnaHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc2V0VHlwZTxUIGV4dGVuZHMgTGlnaHQ+KF9jbGFzczogbmV3ICgpID0+IFQpOiB2b2lkIHtcclxuICAgICAgICAgICAgbGV0IG10ck9sZDogTXV0YXRvciA9IHt9O1xyXG4gICAgICAgICAgICBpZiAodGhpcy5saWdodClcclxuICAgICAgICAgICAgICAgIG10ck9sZCA9IHRoaXMubGlnaHQuZ2V0TXV0YXRvcigpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5saWdodCA9IG5ldyBfY2xhc3MoKTtcclxuICAgICAgICAgICAgdGhpcy5saWdodC5tdXRhdGUobXRyT2xkKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIEF0dGFjaGVzIGEgW1tNYXRlcmlhbF1dIHRvIHRoZSBub2RlXHJcbiAgICAgKiBAYXV0aG9ycyBKaXJrYSBEZWxsJ09yby1GcmllZGwsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgQ29tcG9uZW50TWF0ZXJpYWwgZXh0ZW5kcyBDb21wb25lbnQge1xyXG4gICAgICAgIHB1YmxpYyBtYXRlcmlhbDogTWF0ZXJpYWw7XHJcblxyXG4gICAgICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihfbWF0ZXJpYWw6IE1hdGVyaWFsID0gbnVsbCkge1xyXG4gICAgICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgICAgICB0aGlzLm1hdGVyaWFsID0gX21hdGVyaWFsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8jcmVnaW9uIFRyYW5zZmVyXHJcbiAgICAgICAgcHVibGljIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemF0aW9uIHtcclxuICAgICAgICAgICAgbGV0IHNlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb247XHJcbiAgICAgICAgICAgIC8qIGF0IHRoaXMgcG9pbnQgb2YgdGltZSwgc2VyaWFsaXphdGlvbiBhcyByZXNvdXJjZSBhbmQgYXMgaW5saW5lIG9iamVjdCBpcyBwb3NzaWJsZS4gVE9ETzogY2hlY2sgaWYgaW5saW5lIGJlY29tZXMgb2Jzb2xldGUgKi9cclxuICAgICAgICAgICAgbGV0IGlkTWF0ZXJpYWw6IHN0cmluZyA9IHRoaXMubWF0ZXJpYWwuaWRSZXNvdXJjZTtcclxuICAgICAgICAgICAgaWYgKGlkTWF0ZXJpYWwpXHJcbiAgICAgICAgICAgICAgICBzZXJpYWxpemF0aW9uID0geyBpZE1hdGVyaWFsOiBpZE1hdGVyaWFsIH07XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHNlcmlhbGl6YXRpb24gPSB7IG1hdGVyaWFsOiBTZXJpYWxpemVyLnNlcmlhbGl6ZSh0aGlzLm1hdGVyaWFsKSB9O1xyXG5cclxuICAgICAgICAgICAgc2VyaWFsaXphdGlvbltzdXBlci5jb25zdHJ1Y3Rvci5uYW1lXSA9IHN1cGVyLnNlcmlhbGl6ZSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsaXphdGlvbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHVibGljIGRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uKTogU2VyaWFsaXphYmxlIHtcclxuICAgICAgICAgICAgbGV0IG1hdGVyaWFsOiBNYXRlcmlhbDtcclxuICAgICAgICAgICAgaWYgKF9zZXJpYWxpemF0aW9uLmlkTWF0ZXJpYWwpXHJcbiAgICAgICAgICAgICAgICBtYXRlcmlhbCA9IDxNYXRlcmlhbD5SZXNvdXJjZU1hbmFnZXIuZ2V0KF9zZXJpYWxpemF0aW9uLmlkTWF0ZXJpYWwpO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICBtYXRlcmlhbCA9IDxNYXRlcmlhbD5TZXJpYWxpemVyLmRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uLm1hdGVyaWFsKTtcclxuICAgICAgICAgICAgdGhpcy5tYXRlcmlhbCA9IG1hdGVyaWFsO1xyXG4gICAgICAgICAgICBzdXBlci5kZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbltzdXBlci5jb25zdHJ1Y3Rvci5uYW1lXSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyNlbmRyZWdpb25cclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBBdHRhY2hlcyBhIFtbTWVzaF1dIHRvIHRoZSBub2RlXHJcbiAgICAgKiBAYXV0aG9ycyBKaXJrYSBEZWxsJ09yby1GcmllZGwsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgQ29tcG9uZW50TWVzaCBleHRlbmRzIENvbXBvbmVudCB7XHJcbiAgICAgICAgcHVibGljIHBpdm90OiBNYXRyaXg0eDQgPSBNYXRyaXg0eDQuSURFTlRJVFk7XHJcbiAgICAgICAgcHVibGljIG1lc2g6IE1lc2ggPSBudWxsO1xyXG5cclxuICAgICAgICBwdWJsaWMgY29uc3RydWN0b3IoX21lc2g6IE1lc2ggPSBudWxsKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMubWVzaCA9IF9tZXNoO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8jcmVnaW9uIFRyYW5zZmVyXHJcbiAgICAgICAgcHVibGljIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemF0aW9uIHtcclxuICAgICAgICAgICAgbGV0IHNlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb247XHJcbiAgICAgICAgICAgIC8qIGF0IHRoaXMgcG9pbnQgb2YgdGltZSwgc2VyaWFsaXphdGlvbiBhcyByZXNvdXJjZSBhbmQgYXMgaW5saW5lIG9iamVjdCBpcyBwb3NzaWJsZS4gVE9ETzogY2hlY2sgaWYgaW5saW5lIGJlY29tZXMgb2Jzb2xldGUgKi9cclxuICAgICAgICAgICAgbGV0IGlkTWVzaDogc3RyaW5nID0gdGhpcy5tZXNoLmlkUmVzb3VyY2U7XHJcbiAgICAgICAgICAgIGlmIChpZE1lc2gpXHJcbiAgICAgICAgICAgICAgICBzZXJpYWxpemF0aW9uID0geyBpZE1lc2g6IGlkTWVzaCB9O1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICBzZXJpYWxpemF0aW9uID0geyBtZXNoOiBTZXJpYWxpemVyLnNlcmlhbGl6ZSh0aGlzLm1lc2gpIH07XHJcblxyXG4gICAgICAgICAgICBzZXJpYWxpemF0aW9uLnBpdm90ID0gdGhpcy5waXZvdC5zZXJpYWxpemUoKTtcclxuICAgICAgICAgICAgc2VyaWFsaXphdGlvbltzdXBlci5jb25zdHJ1Y3Rvci5uYW1lXSA9IHN1cGVyLnNlcmlhbGl6ZSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsaXphdGlvbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBkZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbik6IFNlcmlhbGl6YWJsZSB7XHJcbiAgICAgICAgICAgIGxldCBtZXNoOiBNZXNoO1xyXG4gICAgICAgICAgICBpZiAoX3NlcmlhbGl6YXRpb24uaWRNZXNoKVxyXG4gICAgICAgICAgICAgICAgbWVzaCA9IDxNZXNoPlJlc291cmNlTWFuYWdlci5nZXQoX3NlcmlhbGl6YXRpb24uaWRNZXNoKTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgbWVzaCA9IDxNZXNoPlNlcmlhbGl6ZXIuZGVzZXJpYWxpemUoX3NlcmlhbGl6YXRpb24ubWVzaCk7XHJcbiAgICAgICAgICAgIHRoaXMubWVzaCA9IG1lc2g7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnBpdm90LmRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uLnBpdm90KTtcclxuICAgICAgICAgICAgc3VwZXIuZGVzZXJpYWxpemUoX3NlcmlhbGl6YXRpb25bc3VwZXIuY29uc3RydWN0b3IubmFtZV0pO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8jZW5kcmVnaW9uXHJcbiAgICB9XHJcbn1cclxuIiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIEJhc2UgY2xhc3MgZm9yIHNjcmlwdHMgdGhlIHVzZXIgd3JpdGVzXHJcbiAgICAgKiBAYXV0aG9ycyBKaXJrYSBEZWxsJ09yby1GcmllZGwsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgQ29tcG9uZW50U2NyaXB0IGV4dGVuZHMgQ29tcG9uZW50IHtcclxuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5zaW5nbGV0b24gPSBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzZXJpYWxpemUoKTogU2VyaWFsaXphdGlvbiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE11dGF0b3IoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBkZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbik6IFNlcmlhbGl6YWJsZSB7XHJcbiAgICAgICAgICAgIHRoaXMubXV0YXRlKF9zZXJpYWxpemF0aW9uKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIEF0dGFjaGVzIGEgdHJhbnNmb3JtLVtbTWF0cml4NHg0XV0gdG8gdGhlIG5vZGUsIG1vdmluZywgc2NhbGluZyBhbmQgcm90YXRpbmcgaXQgaW4gc3BhY2UgcmVsYXRpdmUgdG8gaXRzIHBhcmVudC5cclxuICAgICAqIEBhdXRob3JzIEppcmthIERlbGwnT3JvLUZyaWVkbCwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBDb21wb25lbnRUcmFuc2Zvcm0gZXh0ZW5kcyBDb21wb25lbnQge1xyXG4gICAgICAgIHB1YmxpYyBsb2NhbDogTWF0cml4NHg0O1xyXG5cclxuICAgICAgICBwdWJsaWMgY29uc3RydWN0b3IoX21hdHJpeDogTWF0cml4NHg0ID0gTWF0cml4NHg0LklERU5USVRZKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMubG9jYWwgPSBfbWF0cml4O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8jcmVnaW9uIFRyYW5zZmVyXHJcbiAgICAgICAgcHVibGljIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemF0aW9uIHtcclxuICAgICAgICAgICAgbGV0IHNlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24gPSB7XHJcbiAgICAgICAgICAgICAgICBsb2NhbDogdGhpcy5sb2NhbC5zZXJpYWxpemUoKSxcclxuICAgICAgICAgICAgICAgIFtzdXBlci5jb25zdHJ1Y3Rvci5uYW1lXTogc3VwZXIuc2VyaWFsaXplKClcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcmV0dXJuIHNlcmlhbGl6YXRpb247XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHB1YmxpYyBkZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbik6IFNlcmlhbGl6YWJsZSB7XHJcbiAgICAgICAgICAgIHN1cGVyLmRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uW3N1cGVyLmNvbnN0cnVjdG9yLm5hbWVdKTtcclxuICAgICAgICAgICAgdGhpcy5sb2NhbC5kZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbi5sb2NhbCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gcHVibGljIG11dGF0ZShfbXV0YXRvcjogTXV0YXRvcik6IHZvaWQge1xyXG4gICAgICAgIC8vICAgICB0aGlzLmxvY2FsLm11dGF0ZShfbXV0YXRvcik7XHJcbiAgICAgICAgLy8gfVxyXG4gICAgICAgIC8vIHB1YmxpYyBnZXRNdXRhdG9yKCk6IE11dGF0b3IgeyBcclxuICAgICAgICAvLyAgICAgcmV0dXJuIHRoaXMubG9jYWwuZ2V0TXV0YXRvcigpO1xyXG4gICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgLy8gcHVibGljIGdldE11dGF0b3JBdHRyaWJ1dGVUeXBlcyhfbXV0YXRvcjogTXV0YXRvcik6IE11dGF0b3JBdHRyaWJ1dGVUeXBlcyB7XHJcbiAgICAgICAgLy8gICAgIGxldCB0eXBlczogTXV0YXRvckF0dHJpYnV0ZVR5cGVzID0gdGhpcy5sb2NhbC5nZXRNdXRhdG9yQXR0cmlidXRlVHlwZXMoX211dGF0b3IpO1xyXG4gICAgICAgIC8vICAgICByZXR1cm4gdHlwZXM7XHJcbiAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICBwcm90ZWN0ZWQgcmVkdWNlTXV0YXRvcihfbXV0YXRvcjogTXV0YXRvcik6IHZvaWQge1xyXG4gICAgICAgICAgICBkZWxldGUgX211dGF0b3Iud29ybGQ7XHJcbiAgICAgICAgICAgIHN1cGVyLnJlZHVjZU11dGF0b3IoX211dGF0b3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyNlbmRyZWdpb25cclxuICAgIH1cclxufVxyXG4iLCIvLyA8cmVmZXJlbmNlIHBhdGg9XCJEZWJ1Z0FsZXJ0LnRzXCIvPlxyXG5uYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGZpbHRlcnMgY29ycmVzcG9uZGluZyB0byBkZWJ1ZyBhY3Rpdml0aWVzLCBtb3JlIHRvIGNvbWVcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGVudW0gREVCVUdfRklMVEVSIHtcclxuICAgICAgICBOT05FID0gMHgwMCxcclxuICAgICAgICBJTkZPID0gMHgwMSxcclxuICAgICAgICBMT0cgPSAweDAyLFxyXG4gICAgICAgIFdBUk4gPSAweDA0LFxyXG4gICAgICAgIEVSUk9SID0gMHgwOCxcclxuICAgICAgICBBTEwgPSBJTkZPIHwgTE9HIHwgV0FSTiB8IEVSUk9SXHJcbiAgICB9XHJcbiAgICAvLyByZW1pbmVzY2VudCBvZiBhbiBlYXJseSBhdHRlbXB0IG9mIERlYnVnXHJcbiAgICAvLyBleHBvcnQgZW51bSBERUJVR19UQVJHRVQge1xyXG4gICAgLy8gICAgIENPTlNPTEUgPSBcImNvbnNvbGVcIixcclxuICAgIC8vICAgICBBTEVSVCA9IFwiYWxlcnRcIixcclxuICAgIC8vICAgICBURVhUQVJFQSA9IFwidGV4dGFyZWFcIixcclxuICAgIC8vICAgICBESUFMT0cgPSBcImRpYWxvZ1wiLFxyXG4gICAgLy8gICAgIEZJTEUgPSBcImZpbGVcIixcclxuICAgIC8vICAgICBTRVJWRVIgPSBcInNlcnZlclwiXHJcbiAgICAvLyB9XHJcblxyXG4gICAgLy8gZXhwb3J0IGludGVyZmFjZSBNYXBEZWJ1Z1RhcmdldFRvRnVuY3Rpb24geyBbdGFyZ2V0OiBzdHJpbmddOiBGdW5jdGlvbjsgfVxyXG4gICAgZXhwb3J0IHR5cGUgTWFwRGVidWdUYXJnZXRUb0RlbGVnYXRlID0gTWFwPERlYnVnVGFyZ2V0LCBGdW5jdGlvbj47XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIE1hcERlYnVnRmlsdGVyVG9EZWxlZ2F0ZSB7IFtmaWx0ZXI6IG51bWJlcl06IEZ1bmN0aW9uOyB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogQmFzZSBjbGFzcyBmb3IgdGhlIGRpZmZlcmVudCBEZWJ1Z1RhcmdldHMsIG1haW5seSBmb3IgdGVjaG5pY2FsIHB1cnBvc2Ugb2YgaW5oZXJpdGFuY2VcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGFic3RyYWN0IGNsYXNzIERlYnVnVGFyZ2V0IHtcclxuICAgICAgICBwdWJsaWMgZGVsZWdhdGVzOiBNYXBEZWJ1Z0ZpbHRlclRvRGVsZWdhdGU7XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBtZXJnZUFyZ3VtZW50cyhfbWVzc2FnZTogT2JqZWN0LCAuLi5fYXJnczogT2JqZWN0W10pOiBzdHJpbmcge1xyXG4gICAgICAgICAgICBsZXQgb3V0OiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeShfbWVzc2FnZSk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGFyZyBvZiBfYXJncylcclxuICAgICAgICAgICAgICAgIG91dCArPSBcIlxcblwiICsgSlNPTi5zdHJpbmdpZnkoYXJnLCBudWxsLCAyKTtcclxuICAgICAgICAgICAgcmV0dXJuIG91dDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiRGVidWdUYXJnZXQudHNcIi8+XHJcbm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBSb3V0aW5nIHRvIHRoZSBhbGVydCBib3hcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIERlYnVnQWxlcnQgZXh0ZW5kcyBEZWJ1Z1RhcmdldCB7XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBkZWxlZ2F0ZXM6IE1hcERlYnVnRmlsdGVyVG9EZWxlZ2F0ZSA9IHtcclxuICAgICAgICAgICAgW0RFQlVHX0ZJTFRFUi5JTkZPXTogRGVidWdBbGVydC5jcmVhdGVEZWxlZ2F0ZShcIkluZm9cIiksXHJcbiAgICAgICAgICAgIFtERUJVR19GSUxURVIuTE9HXTogRGVidWdBbGVydC5jcmVhdGVEZWxlZ2F0ZShcIkxvZ1wiKSxcclxuICAgICAgICAgICAgW0RFQlVHX0ZJTFRFUi5XQVJOXTogRGVidWdBbGVydC5jcmVhdGVEZWxlZ2F0ZShcIldhcm5cIiksXHJcbiAgICAgICAgICAgIFtERUJVR19GSUxURVIuRVJST1JdOiBEZWJ1Z0FsZXJ0LmNyZWF0ZURlbGVnYXRlKFwiRXJyb3JcIilcclxuICAgICAgICB9O1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlRGVsZWdhdGUoX2hlYWRsaW5lOiBzdHJpbmcpOiBGdW5jdGlvbiB7XHJcbiAgICAgICAgICAgIGxldCBkZWxlZ2F0ZTogRnVuY3Rpb24gPSBmdW5jdGlvbiAoX21lc3NhZ2U6IE9iamVjdCwgLi4uX2FyZ3M6IE9iamVjdFtdKTogdm9pZCB7XHJcbiAgICAgICAgICAgICAgICBsZXQgb3V0OiBzdHJpbmcgPSBfaGVhZGxpbmUgKyBcIlxcblxcblwiICsgRGVidWdUYXJnZXQubWVyZ2VBcmd1bWVudHMoX21lc3NhZ2UsIC4uLl9hcmdzKTtcclxuICAgICAgICAgICAgICAgIGFsZXJ0KG91dCk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHJldHVybiBkZWxlZ2F0ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiRGVidWdUYXJnZXQudHNcIi8+XHJcbm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBSb3V0aW5nIHRvIHRoZSBzdGFuZGFyZC1jb25zb2xlXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBEZWJ1Z0NvbnNvbGUgZXh0ZW5kcyBEZWJ1Z1RhcmdldCB7XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBkZWxlZ2F0ZXM6IE1hcERlYnVnRmlsdGVyVG9EZWxlZ2F0ZSA9IHtcclxuICAgICAgICAgICAgW0RFQlVHX0ZJTFRFUi5JTkZPXTogY29uc29sZS5pbmZvLFxyXG4gICAgICAgICAgICBbREVCVUdfRklMVEVSLkxPR106IGNvbnNvbGUubG9nLFxyXG4gICAgICAgICAgICBbREVCVUdfRklMVEVSLldBUk5dOiBjb25zb2xlLndhcm4sXHJcbiAgICAgICAgICAgIFtERUJVR19GSUxURVIuRVJST1JdOiBjb25zb2xlLmVycm9yXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJEZWJ1Z0ludGVyZmFjZXMudHNcIi8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJEZWJ1Z0FsZXJ0LnRzXCIvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiRGVidWdDb25zb2xlLnRzXCIvPlxyXG5uYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIERlYnVnLUNsYXNzIG9mZmVycyBmdW5jdGlvbnMga25vd24gZnJvbSB0aGUgY29uc29sZS1vYmplY3QgYW5kIGFkZGl0aW9ucywgXHJcbiAgICAgKiByb3V0aW5nIHRoZSBpbmZvcm1hdGlvbiB0byB2YXJpb3VzIFtbRGVidWdUYXJnZXRzXV0gdGhhdCBjYW4gYmUgZWFzaWx5IGRlZmluZWQgYnkgdGhlIGRldmVsb3BlcnMgYW5kIHJlZ2lzdGVyZCBieSB1c2Vyc1xyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgRGVidWcge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEZvciBlYWNoIHNldCBmaWx0ZXIsIHRoaXMgYXNzb2NpYXRpdmUgYXJyYXkga2VlcHMgcmVmZXJlbmNlcyB0byB0aGUgcmVnaXN0ZXJlZCBkZWxlZ2F0ZSBmdW5jdGlvbnMgb2YgdGhlIGNob3NlbiBbW0RlYnVnVGFyZ2V0c11dXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgLy8gVE9ETzogaW1wbGVtZW50IGFub255bW91cyBmdW5jdGlvbiBzZXR0aW5nIHVwIGFsbCBmaWx0ZXJzXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgZGVsZWdhdGVzOiB7IFtmaWx0ZXI6IG51bWJlcl06IE1hcERlYnVnVGFyZ2V0VG9EZWxlZ2F0ZSB9ID0ge1xyXG4gICAgICAgICAgICBbREVCVUdfRklMVEVSLklORk9dOiBuZXcgTWFwKFtbRGVidWdDb25zb2xlLCBEZWJ1Z0NvbnNvbGUuZGVsZWdhdGVzW0RFQlVHX0ZJTFRFUi5JTkZPXV1dKSxcclxuICAgICAgICAgICAgW0RFQlVHX0ZJTFRFUi5MT0ddOiBuZXcgTWFwKFtbRGVidWdDb25zb2xlLCBEZWJ1Z0NvbnNvbGUuZGVsZWdhdGVzW0RFQlVHX0ZJTFRFUi5MT0ddXV0pLFxyXG4gICAgICAgICAgICBbREVCVUdfRklMVEVSLldBUk5dOiBuZXcgTWFwKFtbRGVidWdDb25zb2xlLCBEZWJ1Z0NvbnNvbGUuZGVsZWdhdGVzW0RFQlVHX0ZJTFRFUi5XQVJOXV1dKSxcclxuICAgICAgICAgICAgW0RFQlVHX0ZJTFRFUi5FUlJPUl06IG5ldyBNYXAoW1tEZWJ1Z0NvbnNvbGUsIERlYnVnQ29uc29sZS5kZWxlZ2F0ZXNbREVCVUdfRklMVEVSLkVSUk9SXV1dKVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERlLSAvIEFjdGl2YXRlIGEgZmlsdGVyIGZvciB0aGUgZ2l2ZW4gRGVidWdUYXJnZXQuIFxyXG4gICAgICAgICAqIEBwYXJhbSBfdGFyZ2V0XHJcbiAgICAgICAgICogQHBhcmFtIF9maWx0ZXIgXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBzZXRGaWx0ZXIoX3RhcmdldDogRGVidWdUYXJnZXQsIF9maWx0ZXI6IERFQlVHX0ZJTFRFUik6IHZvaWQge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBmaWx0ZXIgaW4gRGVidWcuZGVsZWdhdGVzKVxyXG4gICAgICAgICAgICAgICAgRGVidWcuZGVsZWdhdGVzW2ZpbHRlcl0uZGVsZXRlKF90YXJnZXQpO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgZmlsdGVyIGluIERFQlVHX0ZJTFRFUikge1xyXG4gICAgICAgICAgICAgICAgbGV0IHBhcnNlZDogbnVtYmVyID0gcGFyc2VJbnQoZmlsdGVyKTtcclxuICAgICAgICAgICAgICAgIGlmIChwYXJzZWQgPT0gREVCVUdfRklMVEVSLkFMTClcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGlmIChfZmlsdGVyICYgcGFyc2VkKVxyXG4gICAgICAgICAgICAgICAgICAgIERlYnVnLmRlbGVnYXRlc1twYXJzZWRdLnNldChfdGFyZ2V0LCBfdGFyZ2V0LmRlbGVnYXRlc1twYXJzZWRdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGVidWcgZnVuY3Rpb24gdG8gYmUgaW1wbGVtZW50ZWQgYnkgdGhlIERlYnVnVGFyZ2V0LiBcclxuICAgICAgICAgKiBpbmZvKC4uLikgZGlzcGxheXMgYWRkaXRpb25hbCBpbmZvcm1hdGlvbiB3aXRoIGxvdyBwcmlvcml0eVxyXG4gICAgICAgICAqIEBwYXJhbSBfbWVzc2FnZVxyXG4gICAgICAgICAqIEBwYXJhbSBfYXJncyBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGluZm8oX21lc3NhZ2U6IE9iamVjdCwgLi4uX2FyZ3M6IE9iamVjdFtdKTogdm9pZCB7XHJcbiAgICAgICAgICAgIERlYnVnLmRlbGVnYXRlKERFQlVHX0ZJTFRFUi5JTkZPLCBfbWVzc2FnZSwgX2FyZ3MpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZWJ1ZyBmdW5jdGlvbiB0byBiZSBpbXBsZW1lbnRlZCBieSB0aGUgRGVidWdUYXJnZXQuIFxyXG4gICAgICAgICAqIGxvZyguLi4pIGRpc3BsYXlzIGluZm9ybWF0aW9uIHdpdGggbWVkaXVtIHByaW9yaXR5XHJcbiAgICAgICAgICogQHBhcmFtIF9tZXNzYWdlXHJcbiAgICAgICAgICogQHBhcmFtIF9hcmdzIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgbG9nKF9tZXNzYWdlOiBPYmplY3QsIC4uLl9hcmdzOiBPYmplY3RbXSk6IHZvaWQge1xyXG4gICAgICAgICAgICBEZWJ1Zy5kZWxlZ2F0ZShERUJVR19GSUxURVIuTE9HLCBfbWVzc2FnZSwgX2FyZ3MpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZWJ1ZyBmdW5jdGlvbiB0byBiZSBpbXBsZW1lbnRlZCBieSB0aGUgRGVidWdUYXJnZXQuIFxyXG4gICAgICAgICAqIHdhcm4oLi4uKSBkaXNwbGF5cyBpbmZvcm1hdGlvbiBhYm91dCBub24tY29uZm9ybWl0aWVzIGluIHVzYWdlLCB3aGljaCBpcyBlbXBoYXNpemVkIGUuZy4gYnkgY29sb3JcclxuICAgICAgICAgKiBAcGFyYW0gX21lc3NhZ2VcclxuICAgICAgICAgKiBAcGFyYW0gX2FyZ3MgXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyB3YXJuKF9tZXNzYWdlOiBPYmplY3QsIC4uLl9hcmdzOiBPYmplY3RbXSk6IHZvaWQge1xyXG4gICAgICAgICAgICBEZWJ1Zy5kZWxlZ2F0ZShERUJVR19GSUxURVIuV0FSTiwgX21lc3NhZ2UsIF9hcmdzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGVidWcgZnVuY3Rpb24gdG8gYmUgaW1wbGVtZW50ZWQgYnkgdGhlIERlYnVnVGFyZ2V0LiBcclxuICAgICAgICAgKiBlcnJvciguLi4pIGRpc3BsYXlzIGNyaXRpY2FsIGluZm9ybWF0aW9uIGFib3V0IGZhaWx1cmVzLCB3aGljaCBpcyBlbXBoYXNpemVkIGUuZy4gYnkgY29sb3JcclxuICAgICAgICAgKiBAcGFyYW0gX21lc3NhZ2VcclxuICAgICAgICAgKiBAcGFyYW0gX2FyZ3MgXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBlcnJvcihfbWVzc2FnZTogT2JqZWN0LCAuLi5fYXJnczogT2JqZWN0W10pOiB2b2lkIHtcclxuICAgICAgICAgICAgRGVidWcuZGVsZWdhdGUoREVCVUdfRklMVEVSLkVSUk9SLCBfbWVzc2FnZSwgX2FyZ3MpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBMb29rdXAgYWxsIGRlbGVnYXRlcyByZWdpc3RlcmVkIHRvIHRoZSBmaWx0ZXIgYW5kIGNhbGwgdGhlbSB1c2luZyB0aGUgZ2l2ZW4gYXJndW1lbnRzXHJcbiAgICAgICAgICogQHBhcmFtIF9maWx0ZXIgXHJcbiAgICAgICAgICogQHBhcmFtIF9tZXNzYWdlIFxyXG4gICAgICAgICAqIEBwYXJhbSBfYXJncyBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBkZWxlZ2F0ZShfZmlsdGVyOiBERUJVR19GSUxURVIsIF9tZXNzYWdlOiBPYmplY3QsIF9hcmdzOiBPYmplY3RbXSk6IHZvaWQge1xyXG4gICAgICAgICAgICBsZXQgZGVsZWdhdGVzOiBNYXBEZWJ1Z1RhcmdldFRvRGVsZWdhdGUgPSBEZWJ1Zy5kZWxlZ2F0ZXNbX2ZpbHRlcl07XHJcbiAgICAgICAgICAgIGZvciAobGV0IGRlbGVnYXRlIG9mIGRlbGVnYXRlcy52YWx1ZXMoKSlcclxuICAgICAgICAgICAgICAgIGlmIChfYXJncy5sZW5ndGggPiAwKVxyXG4gICAgICAgICAgICAgICAgICAgIGRlbGVnYXRlKF9tZXNzYWdlLCAuLi5fYXJncyk7XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZWdhdGUoX21lc3NhZ2UpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJEZWJ1Z1RhcmdldC50c1wiLz5cclxubmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIFJvdXRpbmcgdG8gYSBIVE1MRGlhbG9nRWxlbWVudFxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgRGVidWdEaWFsb2cgZXh0ZW5kcyBEZWJ1Z1RhcmdldCB7XHJcbiAgICAgICAgLy8gVE9ETzogY2hlY2tvdXQgSFRNTERpYWxvZ0VsZW1lbnQ7ICEhIVxyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIkRlYnVnVGFyZ2V0LnRzXCIvPlxyXG5uYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogUm91dGUgdG8gYW4gSFRNTFRleHRBcmVhLCBtYXkgYmUgb2Jzb2xldGUgd2hlbiB1c2luZyBIVE1MRGlhbG9nRWxlbWVudFxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgRGVidWdUZXh0QXJlYSBleHRlbmRzIERlYnVnVGFyZ2V0IHtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIHRleHRBcmVhOiBIVE1MVGV4dEFyZWFFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRleHRhcmVhXCIpO1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZGVsZWdhdGVzOiBNYXBEZWJ1Z0ZpbHRlclRvRGVsZWdhdGUgPSB7XHJcbiAgICAgICAgICAgIFtERUJVR19GSUxURVIuSU5GT106IERlYnVnQWxlcnQuY3JlYXRlRGVsZWdhdGUoXCJJbmZvXCIpXHJcbiAgICAgICAgfTtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZURlbGVnYXRlKF9oZWFkbGluZTogc3RyaW5nKTogRnVuY3Rpb24ge1xyXG4gICAgICAgICAgICBsZXQgZGVsZWdhdGU6IEZ1bmN0aW9uID0gZnVuY3Rpb24gKF9tZXNzYWdlOiBPYmplY3QsIC4uLl9hcmdzOiBPYmplY3RbXSk6IHZvaWQge1xyXG4gICAgICAgICAgICAgICAgbGV0IG91dDogc3RyaW5nID0gX2hlYWRsaW5lICsgXCJcXG5cXG5cIiArIERlYnVnVGFyZ2V0Lm1lcmdlQXJndW1lbnRzKF9tZXNzYWdlLCBfYXJncyk7XHJcbiAgICAgICAgICAgICAgICBEZWJ1Z1RleHRBcmVhLnRleHRBcmVhLnRleHRDb250ZW50ICs9IG91dDtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcmV0dXJuIGRlbGVnYXRlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBEZWZpbmVzIGEgY29sb3IgYXMgdmFsdWVzIGluIHRoZSByYW5nZSBvZiAwIHRvIDEgZm9yIHRoZSBmb3VyIGNoYW5uZWxzIHJlZCwgZ3JlZW4sIGJsdWUgYW5kIGFscGhhIChmb3Igb3BhY2l0eSlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIENvbG9yIGV4dGVuZHMgTXV0YWJsZSB7IC8vaW1wbGVtZW50cyBTZXJpYWxpemFibGUge1xyXG4gICAgICAgIHB1YmxpYyByOiBudW1iZXI7XHJcbiAgICAgICAgcHVibGljIGc6IG51bWJlcjtcclxuICAgICAgICBwdWJsaWMgYjogbnVtYmVyO1xyXG4gICAgICAgIHB1YmxpYyBhOiBudW1iZXI7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKF9yOiBudW1iZXIgPSAxLCBfZzogbnVtYmVyID0gMSwgX2I6IG51bWJlciA9IDEsIF9hOiBudW1iZXIgPSAxKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0Tm9ybVJHQkEoX3IsIF9nLCBfYiwgX2EpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXQgQkxBQ0soKTogQ29sb3Ige1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IENvbG9yKDAsIDAsIDAsIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGdldCBXSElURSgpOiBDb2xvciB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQ29sb3IoMSwgMSwgMSwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0IFJFRCgpOiBDb2xvciB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQ29sb3IoMSwgMCwgMCwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0IEdSRUVOKCk6IENvbG9yIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBDb2xvcigwLCAxLCAwLCAxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXQgQkxVRSgpOiBDb2xvciB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQ29sb3IoMCwgMCwgMSwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0IFlFTExPVygpOiBDb2xvciB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQ29sb3IoMSwgMSwgMCwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0IENZQU4oKTogQ29sb3Ige1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IENvbG9yKDAsIDEsIDEsIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGdldCBNQUdFTlRBKCk6IENvbG9yIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBDb2xvcigxLCAwLCAxLCAxKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzZXROb3JtUkdCQShfcjogbnVtYmVyLCBfZzogbnVtYmVyLCBfYjogbnVtYmVyLCBfYTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuciA9IE1hdGgubWluKDEsIE1hdGgubWF4KDAsIF9yKSk7XHJcbiAgICAgICAgICAgIHRoaXMuZyA9IE1hdGgubWluKDEsIE1hdGgubWF4KDAsIF9nKSk7XHJcbiAgICAgICAgICAgIHRoaXMuYiA9IE1hdGgubWluKDEsIE1hdGgubWF4KDAsIF9iKSk7XHJcbiAgICAgICAgICAgIHRoaXMuYSA9IE1hdGgubWluKDEsIE1hdGgubWF4KDAsIF9hKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc2V0Qnl0ZXNSR0JBKF9yOiBudW1iZXIsIF9nOiBudW1iZXIsIF9iOiBudW1iZXIsIF9hOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5zZXROb3JtUkdCQShfciAvIDI1NSwgX2cgLyAyNTUsIF9iIC8gMjU1LCBfYSAvIDI1NSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0QXJyYXkoKTogRmxvYXQzMkFycmF5IHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBGbG9hdDMyQXJyYXkoW3RoaXMuciwgdGhpcy5nLCB0aGlzLmIsIHRoaXMuYV0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHNldEFycmF5Tm9ybVJHQkEoX2NvbG9yOiBGbG9hdDMyQXJyYXkpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5zZXROb3JtUkdCQShfY29sb3JbMF0sIF9jb2xvclsxXSwgX2NvbG9yWzJdLCBfY29sb3JbM10pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHNldEFycmF5Qnl0ZXNSR0JBKF9jb2xvcjogVWludDhDbGFtcGVkQXJyYXkpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5zZXRCeXRlc1JHQkEoX2NvbG9yWzBdLCBfY29sb3JbMV0sIF9jb2xvclsyXSwgX2NvbG9yWzNdKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByb3RlY3RlZCByZWR1Y2VNdXRhdG9yKF9tdXRhdG9yOiBNdXRhdG9yKTogdm9pZCB7LyoqICovIH1cclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBCYXNlY2xhc3MgZm9yIG1hdGVyaWFscy4gQ29tYmluZXMgYSBbW1NoYWRlcl1dIHdpdGggYSBjb21wYXRpYmxlIFtbQ29hdF1dXHJcbiAgICAgKiBAYXV0aG9ycyBKaXJrYSBEZWxsJ09yby1GcmllZGwsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgTWF0ZXJpYWwgaW1wbGVtZW50cyBTZXJpYWxpemFibGVSZXNvdXJjZSB7XHJcbiAgICAgICAgLyoqIFRoZSBuYW1lIHRvIGNhbGwgdGhlIE1hdGVyaWFsIGJ5LiAqL1xyXG4gICAgICAgIHB1YmxpYyBuYW1lOiBzdHJpbmc7XHJcbiAgICAgICAgcHVibGljIGlkUmVzb3VyY2U6IHN0cmluZyA9IHVuZGVmaW5lZDtcclxuICAgICAgICBwcml2YXRlIHNoYWRlclR5cGU6IHR5cGVvZiBTaGFkZXI7IC8vIFRoZSBzaGFkZXIgcHJvZ3JhbSB1c2VkIGJ5IHRoaXMgQmFzZU1hdGVyaWFsXHJcbiAgICAgICAgcHJpdmF0ZSBjb2F0OiBDb2F0O1xyXG5cclxuICAgICAgICBwdWJsaWMgY29uc3RydWN0b3IoX25hbWU6IHN0cmluZywgX3NoYWRlcj86IHR5cGVvZiBTaGFkZXIsIF9jb2F0PzogQ29hdCkge1xyXG4gICAgICAgICAgICB0aGlzLm5hbWUgPSBfbmFtZTtcclxuICAgICAgICAgICAgdGhpcy5zaGFkZXJUeXBlID0gX3NoYWRlcjtcclxuICAgICAgICAgICAgaWYgKF9zaGFkZXIpIHtcclxuICAgICAgICAgICAgICAgIGlmIChfY29hdClcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldENvYXQoX2NvYXQpO1xyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0Q29hdCh0aGlzLmNyZWF0ZUNvYXRNYXRjaGluZ1NoYWRlcigpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ3JlYXRlcyBhIG5ldyBbW0NvYXRdXSBpbnN0YW5jZSB0aGF0IGlzIHZhbGlkIGZvciB0aGUgW1tTaGFkZXJdXSByZWZlcmVuY2VkIGJ5IHRoaXMgbWF0ZXJpYWxcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgY3JlYXRlQ29hdE1hdGNoaW5nU2hhZGVyKCk6IENvYXQge1xyXG4gICAgICAgICAgICBsZXQgY29hdDogQ29hdCA9IG5ldyAodGhpcy5zaGFkZXJUeXBlLmdldENvYXQoKSkoKTtcclxuICAgICAgICAgICAgcmV0dXJuIGNvYXQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBNYWtlcyB0aGlzIG1hdGVyaWFsIHJlZmVyZW5jZSB0aGUgZ2l2ZW4gW1tDb2F0XV0gaWYgaXQgaXMgY29tcGF0aWJsZSB3aXRoIHRoZSByZWZlcmVuY2VkIFtbU2hhZGVyXV1cclxuICAgICAgICAgKiBAcGFyYW0gX2NvYXQgXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHNldENvYXQoX2NvYXQ6IENvYXQpOiB2b2lkIHtcclxuICAgICAgICAgICAgaWYgKF9jb2F0LmNvbnN0cnVjdG9yICE9IHRoaXMuc2hhZGVyVHlwZS5nZXRDb2F0KCkpXHJcbiAgICAgICAgICAgICAgICB0aHJvdyAobmV3IEVycm9yKFwiU2hhZGVyIGFuZCBjb2F0IGRvbid0IG1hdGNoXCIpKTtcclxuICAgICAgICAgICAgdGhpcy5jb2F0ID0gX2NvYXQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHRoZSBjdXJyZW50bHkgcmVmZXJlbmNlZCBbW0NvYXRdXSBpbnN0YW5jZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBnZXRDb2F0KCk6IENvYXQge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb2F0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ2hhbmdlcyB0aGUgbWF0ZXJpYWxzIHJlZmVyZW5jZSB0byB0aGUgZ2l2ZW4gW1tTaGFkZXJdXSwgY3JlYXRlcyBhbmQgcmVmZXJlbmNlcyBhIG5ldyBbW0NvYXRdXSBpbnN0YW5jZSAgXHJcbiAgICAgICAgICogYW5kIG11dGF0ZXMgdGhlIG5ldyBjb2F0IHRvIHByZXNlcnZlIG1hdGNoaW5nIHByb3BlcnRpZXMuXHJcbiAgICAgICAgICogQHBhcmFtIF9zaGFkZXJUeXBlIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzZXRTaGFkZXIoX3NoYWRlclR5cGU6IHR5cGVvZiBTaGFkZXIpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5zaGFkZXJUeXBlID0gX3NoYWRlclR5cGU7XHJcbiAgICAgICAgICAgIGxldCBjb2F0OiBDb2F0ID0gdGhpcy5jcmVhdGVDb2F0TWF0Y2hpbmdTaGFkZXIoKTtcclxuICAgICAgICAgICAgY29hdC5tdXRhdGUodGhpcy5jb2F0LmdldE11dGF0b3IoKSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0Q29hdChjb2F0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgdGhlIFtbU2hhZGVyXV0gcmVmZXJlbmNlZCBieSB0aGlzIG1hdGVyaWFsXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGdldFNoYWRlcigpOiB0eXBlb2YgU2hhZGVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2hhZGVyVHlwZTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvLyNyZWdpb24gVHJhbnNmZXJcclxuICAgICAgICAvLyBUT0RPOiB0aGlzIHR5cGUgb2Ygc2VyaWFsaXphdGlvbiB3YXMgaW1wbGVtZW50ZWQgZm9yIGltcGxpY2l0IE1hdGVyaWFsIGNyZWF0ZS4gQ2hlY2sgaWYgb2Jzb2xldGUgd2hlbiBvbmx5IG9uZSBtYXRlcmlhbCBjbGFzcyBleGlzdHMgYW5kL29yIG1hdGVyaWFscyBhcmUgc3RvcmVkIHNlcGFyYXRlbHlcclxuICAgICAgICBwdWJsaWMgc2VyaWFsaXplKCk6IFNlcmlhbGl6YXRpb24ge1xyXG4gICAgICAgICAgICBsZXQgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMubmFtZSxcclxuICAgICAgICAgICAgICAgIGlkUmVzb3VyY2U6IHRoaXMuaWRSZXNvdXJjZSxcclxuICAgICAgICAgICAgICAgIHNoYWRlcjogdGhpcy5zaGFkZXJUeXBlLm5hbWUsXHJcbiAgICAgICAgICAgICAgICBjb2F0OiBTZXJpYWxpemVyLnNlcmlhbGl6ZSh0aGlzLmNvYXQpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHJldHVybiBzZXJpYWxpemF0aW9uO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwdWJsaWMgZGVzZXJpYWxpemUoX3NlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24pOiBTZXJpYWxpemFibGUge1xyXG4gICAgICAgICAgICB0aGlzLm5hbWUgPSBfc2VyaWFsaXphdGlvbi5uYW1lO1xyXG4gICAgICAgICAgICB0aGlzLmlkUmVzb3VyY2UgPSBfc2VyaWFsaXphdGlvbi5pZFJlc291cmNlO1xyXG4gICAgICAgICAgICAvLyBUT0RPOiBwcm92aWRlIGZvciBzaGFkZXJzIGluIHRoZSB1c2VycyBuYW1lc3BhY2UuIFNlZSBTZXJpYWxpemVyIGZ1bGxwYXRoIGV0Yy5cclxuICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiBuby1hbnlcclxuICAgICAgICAgICAgdGhpcy5zaGFkZXJUeXBlID0gKDxhbnk+RnVkZ2VDb3JlKVtfc2VyaWFsaXphdGlvbi5zaGFkZXJdO1xyXG4gICAgICAgICAgICBsZXQgY29hdDogQ29hdCA9IDxDb2F0PlNlcmlhbGl6ZXIuZGVzZXJpYWxpemUoX3NlcmlhbGl6YXRpb24uY29hdCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0Q29hdChjb2F0KTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vI2VuZHJlZ2lvblxyXG4gICAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIEtlZXBzIGEgZGVwb3Qgb2Ygb2JqZWN0cyB0aGF0IGhhdmUgYmVlbiBtYXJrZWQgZm9yIHJldXNlLCBzb3J0ZWQgYnkgdHlwZS4gIFxyXG4gICAgICogVXNpbmcgW1tSZWN5Y2xlcl1dIHJlZHVjZXMgbG9hZCBvbiB0aGUgY2FyYmFnZSBjb2xsZWN0b3IgYW5kIHRodXMgc3VwcG9ydHMgc21vb3RoIHBlcmZvcm1hbmNlXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBhYnN0cmFjdCBjbGFzcyBSZWN5Y2xlciB7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgZGVwb3Q6IHsgW3R5cGU6IHN0cmluZ106IE9iamVjdFtdIH0gPSB7fTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0dXJucyBhbiBvYmplY3Qgb2YgdGhlIHJlcXVlc3RlZCB0eXBlIGZyb20gdGhlIGRlcG90LCBvciBhIG5ldyBvbmUsIGlmIHRoZSBkZXBvdCB3YXMgZW1wdHkgXHJcbiAgICAgICAgICogQHBhcmFtIF9UIFRoZSBjbGFzcyBpZGVudGlmaWVyIG9mIHRoZSBkZXNpcmVkIG9iamVjdFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0PFQ+KF9UOiBuZXcgKCkgPT4gVCk6IFQge1xyXG4gICAgICAgICAgICBsZXQga2V5OiBzdHJpbmcgPSBfVC5uYW1lO1xyXG4gICAgICAgICAgICBsZXQgaW5zdGFuY2VzOiBPYmplY3RbXSA9IFJlY3ljbGVyLmRlcG90W2tleV07XHJcbiAgICAgICAgICAgIGlmIChpbnN0YW5jZXMgJiYgaW5zdGFuY2VzLmxlbmd0aCA+IDApXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gPFQ+aW5zdGFuY2VzLnBvcCgpO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IF9UKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTdG9yZXMgdGhlIG9iamVjdCBpbiB0aGUgZGVwb3QgZm9yIGxhdGVyIHJlY3ljbGluZy4gVXNlcnMgYXJlIHJlc3BvbnNpYmxlIGZvciB0aHJvd2luZyBpbiBvYmplY3RzIHRoYXQgYXJlIGFib3V0IHRvIGxvb3NlIHNjb3BlIGFuZCBhcmUgbm90IHJlZmVyZW5jZWQgYnkgYW55IG90aGVyXHJcbiAgICAgICAgICogQHBhcmFtIF9pbnN0YW5jZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgc3RvcmUoX2luc3RhbmNlOiBPYmplY3QpOiB2b2lkIHtcclxuICAgICAgICAgICAgbGV0IGtleTogc3RyaW5nID0gX2luc3RhbmNlLmNvbnN0cnVjdG9yLm5hbWU7XHJcbiAgICAgICAgICAgIC8vRGVidWcubG9nKGtleSk7XHJcbiAgICAgICAgICAgIGxldCBpbnN0YW5jZXM6IE9iamVjdFtdID0gUmVjeWNsZXIuZGVwb3Rba2V5XSB8fCBbXTtcclxuICAgICAgICAgICAgaW5zdGFuY2VzLnB1c2goX2luc3RhbmNlKTtcclxuICAgICAgICAgICAgUmVjeWNsZXIuZGVwb3Rba2V5XSA9IGluc3RhbmNlcztcclxuICAgICAgICAgICAgLy8gRGVidWcubG9nKGBPYmplY3RNYW5hZ2VyLmRlcG90WyR7a2V5fV06ICR7T2JqZWN0TWFuYWdlci5kZXBvdFtrZXldLmxlbmd0aH1gKTtcclxuICAgICAgICAgICAgLy9EZWJ1Zy5sb2codGhpcy5kZXBvdCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBFbXB0eXMgdGhlIGRlcG90IG9mIGEgZ2l2ZW4gdHlwZSwgbGVhdmluZyB0aGUgb2JqZWN0cyBmb3IgdGhlIGdhcmJhZ2UgY29sbGVjdG9yLiBNYXkgcmVzdWx0IGluIGEgc2hvcnQgc3RhbGwgd2hlbiBtYW55IG9iamVjdHMgd2VyZSBpblxyXG4gICAgICAgICAqIEBwYXJhbSBfVFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZHVtcDxUPihfVDogbmV3ICgpID0+IFQpOiB2b2lkIHtcclxuICAgICAgICAgICAgbGV0IGtleTogc3RyaW5nID0gX1QubmFtZTtcclxuICAgICAgICAgICAgUmVjeWNsZXIuZGVwb3Rba2V5XSA9IFtdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRW1wdHlzIGFsbCBkZXBvdHMsIGxlYXZpbmcgYWxsIG9iamVjdHMgdG8gdGhlIGdhcmJhZ2UgY29sbGVjdG9yLiBNYXkgcmVzdWx0IGluIGEgc2hvcnQgc3RhbGwgd2hlbiBtYW55IG9iamVjdHMgd2VyZSBpblxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZHVtcEFsbCgpOiB2b2lkIHtcclxuICAgICAgICAgICAgUmVjeWNsZXIuZGVwb3QgPSB7fTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgU2VyaWFsaXphYmxlUmVzb3VyY2UgZXh0ZW5kcyBTZXJpYWxpemFibGUge1xyXG4gICAgICAgIGlkUmVzb3VyY2U6IHN0cmluZztcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIFJlc291cmNlcyB7XHJcbiAgICAgICAgW2lkUmVzb3VyY2U6IHN0cmluZ106IFNlcmlhbGl6YWJsZVJlc291cmNlO1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgU2VyaWFsaXphdGlvbk9mUmVzb3VyY2VzIHtcclxuICAgICAgICBbaWRSZXNvdXJjZTogc3RyaW5nXTogU2VyaWFsaXphdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFN0YXRpYyBjbGFzcyBoYW5kbGluZyB0aGUgcmVzb3VyY2VzIHVzZWQgd2l0aCB0aGUgY3VycmVudCBGVURHRS1pbnN0YW5jZS4gIFxyXG4gICAgICogS2VlcHMgYSBsaXN0IG9mIHRoZSByZXNvdXJjZXMgYW5kIGdlbmVyYXRlcyBpZHMgdG8gcmV0cmlldmUgdGhlbS4gIFxyXG4gICAgICogUmVzb3VyY2VzIGFyZSBvYmplY3RzIHJlZmVyZW5jZWQgbXVsdGlwbGUgdGltZXMgYnV0IHN1cHBvc2VkIHRvIGJlIHN0b3JlZCBvbmx5IG9uY2VcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGFic3RyYWN0IGNsYXNzIFJlc291cmNlTWFuYWdlciB7XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyByZXNvdXJjZXM6IFJlc291cmNlcyA9IHt9O1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbk9mUmVzb3VyY2VzID0gbnVsbDtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogR2VuZXJhdGVzIGFuIGlkIGZvciB0aGUgcmVzb3VyY2VzIGFuZCByZWdpc3RlcnMgaXQgd2l0aCB0aGUgbGlzdCBvZiByZXNvdXJjZXMgXHJcbiAgICAgICAgICogQHBhcmFtIF9yZXNvdXJjZSBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHJlZ2lzdGVyKF9yZXNvdXJjZTogU2VyaWFsaXphYmxlUmVzb3VyY2UpOiB2b2lkIHtcclxuICAgICAgICAgICAgaWYgKCFfcmVzb3VyY2UuaWRSZXNvdXJjZSlcclxuICAgICAgICAgICAgICAgIF9yZXNvdXJjZS5pZFJlc291cmNlID0gUmVzb3VyY2VNYW5hZ2VyLmdlbmVyYXRlSWQoX3Jlc291cmNlKTtcclxuICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLnJlc291cmNlc1tfcmVzb3VyY2UuaWRSZXNvdXJjZV0gPSBfcmVzb3VyY2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBHZW5lcmF0ZSBhIHVzZXIgcmVhZGFibGUgYW5kIHVuaXF1ZSBpZCB1c2luZyB0aGUgdHlwZSBvZiB0aGUgcmVzb3VyY2UsIHRoZSBkYXRlIGFuZCByYW5kb20gbnVtYmVyc1xyXG4gICAgICAgICAqIEBwYXJhbSBfcmVzb3VyY2VcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGdlbmVyYXRlSWQoX3Jlc291cmNlOiBTZXJpYWxpemFibGVSZXNvdXJjZSk6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IGJ1aWxkIGlkIGFuZCBpbnRlZ3JhdGUgaW5mbyBmcm9tIHJlc291cmNlLCBub3QganVzdCBkYXRlXHJcbiAgICAgICAgICAgIGxldCBpZFJlc291cmNlOiBzdHJpbmc7XHJcbiAgICAgICAgICAgIGRvXHJcbiAgICAgICAgICAgICAgICBpZFJlc291cmNlID0gX3Jlc291cmNlLmNvbnN0cnVjdG9yLm5hbWUgKyBcInxcIiArIG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSArIFwifFwiICsgTWF0aC5yYW5kb20oKS50b1ByZWNpc2lvbig1KS5zdWJzdHIoMiwgNSk7XHJcbiAgICAgICAgICAgIHdoaWxlIChSZXNvdXJjZU1hbmFnZXIucmVzb3VyY2VzW2lkUmVzb3VyY2VdKTtcclxuICAgICAgICAgICAgcmV0dXJuIGlkUmVzb3VyY2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUZXN0cywgaWYgYW4gb2JqZWN0IGlzIGEgW1tTZXJpYWxpemFibGVSZXNvdXJjZV1dXHJcbiAgICAgICAgICogQHBhcmFtIF9vYmplY3QgVGhlIG9iamVjdCB0byBleGFtaW5lXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBpc1Jlc291cmNlKF9vYmplY3Q6IFNlcmlhbGl6YWJsZSk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICByZXR1cm4gKFJlZmxlY3QuaGFzKF9vYmplY3QsIFwiaWRSZXNvdXJjZVwiKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXRyaWV2ZXMgdGhlIHJlc291cmNlIHN0b3JlZCB3aXRoIHRoZSBnaXZlbiBpZFxyXG4gICAgICAgICAqIEBwYXJhbSBfaWRSZXNvdXJjZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0KF9pZFJlc291cmNlOiBzdHJpbmcpOiBTZXJpYWxpemFibGVSZXNvdXJjZSB7XHJcbiAgICAgICAgICAgIGxldCByZXNvdXJjZTogU2VyaWFsaXphYmxlUmVzb3VyY2UgPSBSZXNvdXJjZU1hbmFnZXIucmVzb3VyY2VzW19pZFJlc291cmNlXTtcclxuICAgICAgICAgICAgaWYgKCFyZXNvdXJjZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24gPSBSZXNvdXJjZU1hbmFnZXIuc2VyaWFsaXphdGlvbltfaWRSZXNvdXJjZV07XHJcbiAgICAgICAgICAgICAgICBpZiAoIXNlcmlhbGl6YXRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICBEZWJ1Zy5lcnJvcihcIlJlc291cmNlIG5vdCBmb3VuZFwiLCBfaWRSZXNvdXJjZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXNvdXJjZSA9IFJlc291cmNlTWFuYWdlci5kZXNlcmlhbGl6ZVJlc291cmNlKHNlcmlhbGl6YXRpb24pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXNvdXJjZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENyZWF0ZXMgYW5kIHJlZ2lzdGVycyBhIHJlc291cmNlIGZyb20gYSBbW05vZGVdXSwgY29weWluZyB0aGUgY29tcGxldGUgYnJhbmNoIHN0YXJ0aW5nIHdpdGggaXRcclxuICAgICAgICAgKiBAcGFyYW0gX25vZGUgQSBub2RlIHRvIGNyZWF0ZSB0aGUgcmVzb3VyY2UgZnJvbVxyXG4gICAgICAgICAqIEBwYXJhbSBfcmVwbGFjZVdpdGhJbnN0YW5jZSBpZiB0cnVlIChkZWZhdWx0KSwgdGhlIG5vZGUgdXNlZCBhcyBvcmlnaW4gaXMgcmVwbGFjZWQgYnkgYSBbW05vZGVSZXNvdXJjZUluc3RhbmNlXV0gb2YgdGhlIFtbTm9kZVJlc291cmNlXV0gY3JlYXRlZFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgcmVnaXN0ZXJOb2RlQXNSZXNvdXJjZShfbm9kZTogTm9kZSwgX3JlcGxhY2VXaXRoSW5zdGFuY2U6IGJvb2xlYW4gPSB0cnVlKTogTm9kZVJlc291cmNlIHtcclxuICAgICAgICAgICAgbGV0IHNlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24gPSBfbm9kZS5zZXJpYWxpemUoKTtcclxuICAgICAgICAgICAgbGV0IG5vZGVSZXNvdXJjZTogTm9kZVJlc291cmNlID0gbmV3IE5vZGVSZXNvdXJjZShcIk5vZGVSZXNvdXJjZVwiKTtcclxuICAgICAgICAgICAgbm9kZVJlc291cmNlLmRlc2VyaWFsaXplKHNlcmlhbGl6YXRpb24pO1xyXG4gICAgICAgICAgICBSZXNvdXJjZU1hbmFnZXIucmVnaXN0ZXIobm9kZVJlc291cmNlKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChfcmVwbGFjZVdpdGhJbnN0YW5jZSAmJiBfbm9kZS5nZXRQYXJlbnQoKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGluc3RhbmNlOiBOb2RlUmVzb3VyY2VJbnN0YW5jZSA9IG5ldyBOb2RlUmVzb3VyY2VJbnN0YW5jZShub2RlUmVzb3VyY2UpO1xyXG4gICAgICAgICAgICAgICAgX25vZGUuZ2V0UGFyZW50KCkucmVwbGFjZUNoaWxkKF9ub2RlLCBpbnN0YW5jZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBub2RlUmVzb3VyY2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTZXJpYWxpemUgYWxsIHJlc291cmNlc1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgc2VyaWFsaXplKCk6IFNlcmlhbGl6YXRpb25PZlJlc291cmNlcyB7XHJcbiAgICAgICAgICAgIGxldCBzZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uT2ZSZXNvdXJjZXMgPSB7fTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaWRSZXNvdXJjZSBpbiBSZXNvdXJjZU1hbmFnZXIucmVzb3VyY2VzKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcmVzb3VyY2U6IFNlcmlhbGl6YWJsZVJlc291cmNlID0gUmVzb3VyY2VNYW5hZ2VyLnJlc291cmNlc1tpZFJlc291cmNlXTtcclxuICAgICAgICAgICAgICAgIGlmIChpZFJlc291cmNlICE9IHJlc291cmNlLmlkUmVzb3VyY2UpXHJcbiAgICAgICAgICAgICAgICAgICAgRGVidWcuZXJyb3IoXCJSZXNvdXJjZS1pZCBtaXNtYXRjaFwiLCByZXNvdXJjZSk7XHJcbiAgICAgICAgICAgICAgICBzZXJpYWxpemF0aW9uW2lkUmVzb3VyY2VdID0gU2VyaWFsaXplci5zZXJpYWxpemUocmVzb3VyY2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBzZXJpYWxpemF0aW9uO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ3JlYXRlIHJlc291cmNlcyBmcm9tIGEgc2VyaWFsaXphdGlvbiwgZGVsZXRpbmcgYWxsIHJlc291cmNlcyBwcmV2aW91c2x5IHJlZ2lzdGVyZWRcclxuICAgICAgICAgKiBAcGFyYW0gX3NlcmlhbGl6YXRpb24gXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBkZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbk9mUmVzb3VyY2VzKTogUmVzb3VyY2VzIHtcclxuICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLnNlcmlhbGl6YXRpb24gPSBfc2VyaWFsaXphdGlvbjtcclxuICAgICAgICAgICAgUmVzb3VyY2VNYW5hZ2VyLnJlc291cmNlcyA9IHt9O1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpZFJlc291cmNlIGluIF9zZXJpYWxpemF0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IF9zZXJpYWxpemF0aW9uW2lkUmVzb3VyY2VdO1xyXG4gICAgICAgICAgICAgICAgbGV0IHJlc291cmNlOiBTZXJpYWxpemFibGVSZXNvdXJjZSA9IFJlc291cmNlTWFuYWdlci5kZXNlcmlhbGl6ZVJlc291cmNlKHNlcmlhbGl6YXRpb24pO1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlc291cmNlKVxyXG4gICAgICAgICAgICAgICAgICAgIFJlc291cmNlTWFuYWdlci5yZXNvdXJjZXNbaWRSZXNvdXJjZV0gPSByZXNvdXJjZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gUmVzb3VyY2VNYW5hZ2VyLnJlc291cmNlcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGRlc2VyaWFsaXplUmVzb3VyY2UoX3NlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24pOiBTZXJpYWxpemFibGVSZXNvdXJjZSB7XHJcbiAgICAgICAgICAgIHJldHVybiA8U2VyaWFsaXphYmxlUmVzb3VyY2U+U2VyaWFsaXplci5kZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL0xpZ2h0L0xpZ2h0LnRzXCIvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vQ29tcG9uZW50L0NvbXBvbmVudExpZ2h0LnRzXCIvPlxyXG5uYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIGV4cG9ydCB0eXBlIE1hcExpZ2h0VHlwZVRvTGlnaHRMaXN0ID0gTWFwPHN0cmluZywgQ29tcG9uZW50TGlnaHRbXT47XHJcbiAgICAvKipcclxuICAgICAqIENvbnRyb2xzIHRoZSByZW5kZXJpbmcgb2YgYSBicmFuY2ggb2YgYSBzY2VuZXRyZWUsIHVzaW5nIHRoZSBnaXZlbiBbW0NvbXBvbmVudENhbWVyYV1dLFxyXG4gICAgICogYW5kIHRoZSBwcm9wYWdhdGlvbiBvZiB0aGUgcmVuZGVyZWQgaW1hZ2UgZnJvbSB0aGUgb2Zmc2NyZWVuIHJlbmRlcmJ1ZmZlciB0byB0aGUgdGFyZ2V0IGNhbnZhc1xyXG4gICAgICogdGhyb3VnaCBhIHNlcmllcyBvZiBbW0ZyYW1pbmddXSBvYmplY3RzLiBUaGUgc3RhZ2VzIGludm9sdmVkIGFyZSBpbiBvcmRlciBvZiByZW5kZXJpbmdcclxuICAgICAqIFtbUmVuZGVyTWFuYWdlcl1dLnZpZXdwb3J0IC0+IFtbVmlld3BvcnRdXS5zb3VyY2UgLT4gW1tWaWV3cG9ydF1dLmRlc3RpbmF0aW9uIC0+IERPTS1DYW52YXMgLT4gQ2xpZW50KENTUylcclxuICAgICAqIEBhdXRob3JzIEphc2NoYSBLYXJhZ8O2bCwgSEZVLCAyMDE5IHwgSmlya2EgRGVsbCdPcm8tRnJpZWRsLCBIRlUsIDIwMTlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIFZpZXdwb3J0IGV4dGVuZHMgRXZlbnRUYXJnZXQge1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGZvY3VzOiBWaWV3cG9ydDtcclxuXHJcbiAgICAgICAgcHVibGljIG5hbWU6IHN0cmluZyA9IFwiVmlld3BvcnRcIjsgLy8gVGhlIG5hbWUgdG8gY2FsbCB0aGlzIHZpZXdwb3J0IGJ5LlxyXG4gICAgICAgIHB1YmxpYyBjYW1lcmE6IENvbXBvbmVudENhbWVyYSA9IG51bGw7IC8vIFRoZSBjYW1lcmEgcmVwcmVzZW50aW5nIHRoZSB2aWV3IHBhcmFtZXRlcnMgdG8gcmVuZGVyIHRoZSBicmFuY2guXHJcblxyXG4gICAgICAgIHB1YmxpYyByZWN0U291cmNlOiBSZWN0YW5nbGU7XHJcbiAgICAgICAgcHVibGljIHJlY3REZXN0aW5hdGlvbjogUmVjdGFuZ2xlO1xyXG5cclxuICAgICAgICAvLyBUT0RPOiB2ZXJpZnkgaWYgY2xpZW50IHRvIGNhbnZhcyBzaG91bGQgYmUgaW4gVmlld3BvcnQgb3Igc29tZXdoZXJlIGVsc2UgKFdpbmRvdywgQ29udGFpbmVyPylcclxuICAgICAgICAvLyBNdWx0aXBsZSB2aWV3cG9ydHMgdXNpbmcgdGhlIHNhbWUgY2FudmFzIHNob3VsZG4ndCBkaWZmZXIgaGVyZS4uLlxyXG4gICAgICAgIC8vIGRpZmZlcmVudCBmcmFtaW5nIG1ldGhvZHMgY2FuIGJlIHVzZWQsIHRoaXMgaXMgdGhlIGRlZmF1bHRcclxuICAgICAgICBwdWJsaWMgZnJhbWVDbGllbnRUb0NhbnZhczogRnJhbWluZ1NjYWxlZCA9IG5ldyBGcmFtaW5nU2NhbGVkKCk7XHJcbiAgICAgICAgcHVibGljIGZyYW1lQ2FudmFzVG9EZXN0aW5hdGlvbjogRnJhbWluZ0NvbXBsZXggPSBuZXcgRnJhbWluZ0NvbXBsZXgoKTtcclxuICAgICAgICBwdWJsaWMgZnJhbWVEZXN0aW5hdGlvblRvU291cmNlOiBGcmFtaW5nU2NhbGVkID0gbmV3IEZyYW1pbmdTY2FsZWQoKTtcclxuICAgICAgICBwdWJsaWMgZnJhbWVTb3VyY2VUb1JlbmRlcjogRnJhbWluZ1NjYWxlZCA9IG5ldyBGcmFtaW5nU2NhbGVkKCk7XHJcblxyXG4gICAgICAgIHB1YmxpYyBhZGp1c3RpbmdGcmFtZXM6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgICAgIHB1YmxpYyBhZGp1c3RpbmdDYW1lcmE6IGJvb2xlYW4gPSB0cnVlO1xyXG5cclxuICAgICAgICBwdWJsaWMgbGlnaHRzOiBNYXBMaWdodFR5cGVUb0xpZ2h0TGlzdCA9IG51bGw7XHJcblxyXG4gICAgICAgIHByaXZhdGUgYnJhbmNoOiBOb2RlID0gbnVsbDsgLy8gVGhlIGZpcnN0IG5vZGUgaW4gdGhlIHRyZWUoYnJhbmNoKSB0aGF0IHdpbGwgYmUgcmVuZGVyZWQuXHJcbiAgICAgICAgcHJpdmF0ZSBjcmMyOiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgPSBudWxsO1xyXG4gICAgICAgIHByaXZhdGUgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCA9IG51bGw7XHJcbiAgICAgICAgcHJpdmF0ZSBwaWNrQnVmZmVyczogUGlja0J1ZmZlcltdID0gW107XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENvbm5lY3RzIHRoZSB2aWV3cG9ydCB0byB0aGUgZ2l2ZW4gY2FudmFzIHRvIHJlbmRlciB0aGUgZ2l2ZW4gYnJhbmNoIHRvIHVzaW5nIHRoZSBnaXZlbiBjYW1lcmEtY29tcG9uZW50LCBhbmQgbmFtZXMgdGhlIHZpZXdwb3J0IGFzIGdpdmVuLlxyXG4gICAgICAgICAqIEBwYXJhbSBfbmFtZSBcclxuICAgICAgICAgKiBAcGFyYW0gX2JyYW5jaCBcclxuICAgICAgICAgKiBAcGFyYW0gX2NhbWVyYSBcclxuICAgICAgICAgKiBAcGFyYW0gX2NhbnZhcyBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgaW5pdGlhbGl6ZShfbmFtZTogc3RyaW5nLCBfYnJhbmNoOiBOb2RlLCBfY2FtZXJhOiBDb21wb25lbnRDYW1lcmEsIF9jYW52YXM6IEhUTUxDYW52YXNFbGVtZW50KTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMubmFtZSA9IF9uYW1lO1xyXG4gICAgICAgICAgICB0aGlzLmNhbWVyYSA9IF9jYW1lcmE7XHJcbiAgICAgICAgICAgIHRoaXMuY2FudmFzID0gX2NhbnZhcztcclxuICAgICAgICAgICAgdGhpcy5jcmMyID0gX2NhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnJlY3RTb3VyY2UgPSBSZW5kZXJNYW5hZ2VyLmdldENhbnZhc1JlY3QoKTtcclxuICAgICAgICAgICAgdGhpcy5yZWN0RGVzdGluYXRpb24gPSB0aGlzLmdldENsaWVudFJlY3RhbmdsZSgpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zZXRCcmFuY2goX2JyYW5jaCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHJpZXZlIHRoZSAyRC1jb250ZXh0IGF0dGFjaGVkIHRvIHRoZSBkZXN0aW5hdGlvbiBjYW52YXNcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0Q29udGV4dCgpOiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jcmMyO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXRyaWV2ZSB0aGUgc2l6ZSBvZiB0aGUgZGVzdGluYXRpb24gY2FudmFzIGFzIGEgcmVjdGFuZ2xlLCB4IGFuZCB5IGFyZSBhbHdheXMgMCBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0Q2FudmFzUmVjdGFuZ2xlKCk6IFJlY3RhbmdsZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBSZWN0YW5nbGUuR0VUKDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXRyaWV2ZSB0aGUgY2xpZW50IHJlY3RhbmdsZSB0aGUgY2FudmFzIGlzIGRpc3BsYXllZCBhbmQgZml0IGluLCB4IGFuZCB5IGFyZSBhbHdheXMgMCBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0Q2xpZW50UmVjdGFuZ2xlKCk6IFJlY3RhbmdsZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBSZWN0YW5nbGUuR0VUKDAsIDAsIHRoaXMuY2FudmFzLmNsaWVudFdpZHRoLCB0aGlzLmNhbnZhcy5jbGllbnRIZWlnaHQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2V0IHRoZSBicmFuY2ggdG8gYmUgZHJhd24gaW4gdGhlIHZpZXdwb3J0LlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzZXRCcmFuY2goX2JyYW5jaDogTm9kZSk6IHZvaWQge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5icmFuY2gpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYnJhbmNoLnJlbW92ZUV2ZW50TGlzdGVuZXIoRVZFTlQuQ09NUE9ORU5UX0FERCwgdGhpcy5obmRDb21wb25lbnRFdmVudCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJyYW5jaC5yZW1vdmVFdmVudExpc3RlbmVyKEVWRU5ULkNPTVBPTkVOVF9SRU1PVkUsIHRoaXMuaG5kQ29tcG9uZW50RXZlbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuYnJhbmNoID0gX2JyYW5jaDtcclxuICAgICAgICAgICAgdGhpcy5jb2xsZWN0TGlnaHRzKCk7XHJcbiAgICAgICAgICAgIHRoaXMuYnJhbmNoLmFkZEV2ZW50TGlzdGVuZXIoRVZFTlQuQ09NUE9ORU5UX0FERCwgdGhpcy5obmRDb21wb25lbnRFdmVudCk7XHJcbiAgICAgICAgICAgIHRoaXMuYnJhbmNoLmFkZEV2ZW50TGlzdGVuZXIoRVZFTlQuQ09NUE9ORU5UX1JFTU9WRSwgdGhpcy5obmRDb21wb25lbnRFdmVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIExvZ3MgdGhpcyB2aWV3cG9ydHMgc2NlbmVncmFwaCB0byB0aGUgY29uc29sZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc2hvd1NjZW5lR3JhcGgoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IG1vdmUgdG8gZGVidWctY2xhc3NcclxuICAgICAgICAgICAgbGV0IG91dHB1dDogc3RyaW5nID0gXCJTY2VuZUdyYXBoIGZvciB0aGlzIHZpZXdwb3J0OlwiO1xyXG4gICAgICAgICAgICBvdXRwdXQgKz0gXCJcXG4gXFxuXCI7XHJcbiAgICAgICAgICAgIG91dHB1dCArPSB0aGlzLmJyYW5jaC5uYW1lO1xyXG4gICAgICAgICAgICBEZWJ1Zy5sb2cob3V0cHV0ICsgXCIgICA9PiBST09UTk9ERVwiICsgdGhpcy5jcmVhdGVTY2VuZUdyYXBoKHRoaXMuYnJhbmNoKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyAjcmVnaW9uIERyYXdpbmdcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEcmF3IHRoaXMgdmlld3BvcnRcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZHJhdygpOiB2b2lkIHtcclxuICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5yZXNldEZyYW1lQnVmZmVyKCk7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5jYW1lcmEuaXNBY3RpdmUpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmFkanVzdGluZ0ZyYW1lcylcclxuICAgICAgICAgICAgICAgIHRoaXMuYWRqdXN0RnJhbWVzKCk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmFkanVzdGluZ0NhbWVyYSlcclxuICAgICAgICAgICAgICAgIHRoaXMuYWRqdXN0Q2FtZXJhKCk7XHJcblxyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmNsZWFyKHRoaXMuY2FtZXJhLmdldEJhY2tnb3VuZENvbG9yKCkpO1xyXG4gICAgICAgICAgICBpZiAoUmVuZGVyTWFuYWdlci5hZGRCcmFuY2godGhpcy5icmFuY2gpKVxyXG4gICAgICAgICAgICAgICAgLy8gYnJhbmNoIGhhcyBub3QgeWV0IGJlZW4gcHJvY2Vzc2VkIGZ1bGx5IGJ5IHJlbmRlcm1hbmFnZXIgLT4gdXBkYXRlIGFsbCByZWdpc3RlcmVkIG5vZGVzXHJcbiAgICAgICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLnNldExpZ2h0cyh0aGlzLmxpZ2h0cyk7XHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIuZHJhd0JyYW5jaCh0aGlzLmJyYW5jaCwgdGhpcy5jYW1lcmEpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jcmMyLmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmNyYzIuZHJhd0ltYWdlKFxyXG4gICAgICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5nZXRDYW52YXMoKSxcclxuICAgICAgICAgICAgICAgIHRoaXMucmVjdFNvdXJjZS54LCB0aGlzLnJlY3RTb3VyY2UueSwgdGhpcy5yZWN0U291cmNlLndpZHRoLCB0aGlzLnJlY3RTb3VyY2UuaGVpZ2h0LFxyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWN0RGVzdGluYXRpb24ueCwgdGhpcy5yZWN0RGVzdGluYXRpb24ueSwgdGhpcy5yZWN0RGVzdGluYXRpb24ud2lkdGgsIHRoaXMucmVjdERlc3RpbmF0aW9uLmhlaWdodFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgKiBEcmF3IHRoaXMgdmlld3BvcnQgZm9yIFJheUNhc3RcclxuICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBjcmVhdGVQaWNrQnVmZmVycygpOiB2b2lkIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuYWRqdXN0aW5nRnJhbWVzKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5hZGp1c3RGcmFtZXMoKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuYWRqdXN0aW5nQ2FtZXJhKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5hZGp1c3RDYW1lcmEoKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChSZW5kZXJNYW5hZ2VyLmFkZEJyYW5jaCh0aGlzLmJyYW5jaCkpXHJcbiAgICAgICAgICAgICAgICAvLyBicmFuY2ggaGFzIG5vdCB5ZXQgYmVlbiBwcm9jZXNzZWQgZnVsbHkgYnkgcmVuZGVybWFuYWdlciAtPiB1cGRhdGUgYWxsIHJlZ2lzdGVyZWQgbm9kZXNcclxuICAgICAgICAgICAgICAgIFJlbmRlck1hbmFnZXIudXBkYXRlKCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnBpY2tCdWZmZXJzID0gUmVuZGVyTWFuYWdlci5kcmF3QnJhbmNoRm9yUmF5Q2FzdCh0aGlzLmJyYW5jaCwgdGhpcy5jYW1lcmEpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jcmMyLmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmNyYzIuZHJhd0ltYWdlKFxyXG4gICAgICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5nZXRDYW52YXMoKSxcclxuICAgICAgICAgICAgICAgIHRoaXMucmVjdFNvdXJjZS54LCB0aGlzLnJlY3RTb3VyY2UueSwgdGhpcy5yZWN0U291cmNlLndpZHRoLCB0aGlzLnJlY3RTb3VyY2UuaGVpZ2h0LFxyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWN0RGVzdGluYXRpb24ueCwgdGhpcy5yZWN0RGVzdGluYXRpb24ueSwgdGhpcy5yZWN0RGVzdGluYXRpb24ud2lkdGgsIHRoaXMucmVjdERlc3RpbmF0aW9uLmhlaWdodFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIHB1YmxpYyBwaWNrTm9kZUF0KF9wb3M6IFZlY3RvcjIpOiBSYXlIaXRbXSB7XHJcbiAgICAgICAgICAgIC8vIHRoaXMuY3JlYXRlUGlja0J1ZmZlcnMoKTtcclxuICAgICAgICAgICAgbGV0IGhpdHM6IFJheUhpdFtdID0gUmVuZGVyTWFuYWdlci5waWNrTm9kZUF0KF9wb3MsIHRoaXMucGlja0J1ZmZlcnMsIHRoaXMucmVjdFNvdXJjZSk7XHJcbiAgICAgICAgICAgIGhpdHMuc29ydCgoYTogUmF5SGl0LCBiOiBSYXlIaXQpID0+IChiLnpCdWZmZXIgPiAwKSA/IChhLnpCdWZmZXIgPiAwKSA/IGEuekJ1ZmZlciAtIGIuekJ1ZmZlciA6IDEgOiAtMSk7XHJcbiAgICAgICAgICAgIHJldHVybiBoaXRzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQWRqdXN0IGFsbCBmcmFtZXMgaW52b2x2ZWQgaW4gdGhlIHJlbmRlcmluZyBwcm9jZXNzIGZyb20gdGhlIGRpc3BsYXkgYXJlYSBpbiB0aGUgY2xpZW50IHVwIHRvIHRoZSByZW5kZXJlciBjYW52YXNcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgYWRqdXN0RnJhbWVzKCk6IHZvaWQge1xyXG4gICAgICAgICAgICAvLyBnZXQgdGhlIHJlY3RhbmdsZSBvZiB0aGUgY2FudmFzIGFyZWEgYXMgZGlzcGxheWVkIChjb25zaWRlciBjc3MpXHJcbiAgICAgICAgICAgIGxldCByZWN0Q2xpZW50OiBSZWN0YW5nbGUgPSB0aGlzLmdldENsaWVudFJlY3RhbmdsZSgpO1xyXG4gICAgICAgICAgICAvLyBhZGp1c3QgdGhlIGNhbnZhcyBzaXplIGFjY29yZGluZyB0byB0aGUgZ2l2ZW4gZnJhbWluZyBhcHBsaWVkIHRvIGNsaWVudFxyXG4gICAgICAgICAgICBsZXQgcmVjdENhbnZhczogUmVjdGFuZ2xlID0gdGhpcy5mcmFtZUNsaWVudFRvQ2FudmFzLmdldFJlY3QocmVjdENsaWVudCk7XHJcbiAgICAgICAgICAgIHRoaXMuY2FudmFzLndpZHRoID0gcmVjdENhbnZhcy53aWR0aDtcclxuICAgICAgICAgICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gcmVjdENhbnZhcy5oZWlnaHQ7XHJcbiAgICAgICAgICAgIC8vIGFkanVzdCB0aGUgZGVzdGluYXRpb24gYXJlYSBvbiB0aGUgdGFyZ2V0LWNhbnZhcyB0byByZW5kZXIgdG8gYnkgYXBwbHlpbmcgdGhlIGZyYW1pbmcgdG8gY2FudmFzXHJcbiAgICAgICAgICAgIHRoaXMucmVjdERlc3RpbmF0aW9uID0gdGhpcy5mcmFtZUNhbnZhc1RvRGVzdGluYXRpb24uZ2V0UmVjdChyZWN0Q2FudmFzKTtcclxuICAgICAgICAgICAgLy8gYWRqdXN0IHRoZSBhcmVhIG9uIHRoZSBzb3VyY2UtY2FudmFzIHRvIHJlbmRlciBmcm9tIGJ5IGFwcGx5aW5nIHRoZSBmcmFtaW5nIHRvIGRlc3RpbmF0aW9uIGFyZWFcclxuICAgICAgICAgICAgdGhpcy5yZWN0U291cmNlID0gdGhpcy5mcmFtZURlc3RpbmF0aW9uVG9Tb3VyY2UuZ2V0UmVjdCh0aGlzLnJlY3REZXN0aW5hdGlvbik7XHJcbiAgICAgICAgICAgIC8vIGhhdmluZyBhbiBvZmZzZXQgc291cmNlIGRvZXMgbWFrZSBzZW5zZSBvbmx5IHdoZW4gbXVsdGlwbGUgdmlld3BvcnRzIGRpc3BsYXkgcGFydHMgb2YgdGhlIHNhbWUgcmVuZGVyaW5nLiBGb3Igbm93OiBzaGlmdCBpdCB0byAwLDBcclxuICAgICAgICAgICAgdGhpcy5yZWN0U291cmNlLnggPSB0aGlzLnJlY3RTb3VyY2UueSA9IDA7XHJcbiAgICAgICAgICAgIC8vIHN0aWxsLCBhIHBhcnRpYWwgaW1hZ2Ugb2YgdGhlIHJlbmRlcmluZyBtYXkgYmUgcmV0cmlldmVkIGJ5IG1vdmluZyBhbmQgcmVzaXppbmcgdGhlIHJlbmRlciB2aWV3cG9ydFxyXG4gICAgICAgICAgICBsZXQgcmVjdFJlbmRlcjogUmVjdGFuZ2xlID0gdGhpcy5mcmFtZVNvdXJjZVRvUmVuZGVyLmdldFJlY3QodGhpcy5yZWN0U291cmNlKTtcclxuICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5zZXRWaWV3cG9ydFJlY3RhbmdsZShyZWN0UmVuZGVyKTtcclxuICAgICAgICAgICAgLy8gbm8gbW9yZSB0cmFuc2Zvcm1hdGlvbiBhZnRlciB0aGlzIGZvciBub3csIG9mZnNjcmVlbiBjYW52YXMgYW5kIHJlbmRlci12aWV3cG9ydCBoYXZlIHRoZSBzYW1lIHNpemVcclxuICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5zZXRDYW52YXNTaXplKHJlY3RSZW5kZXIud2lkdGgsIHJlY3RSZW5kZXIuaGVpZ2h0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQWRqdXN0IHRoZSBjYW1lcmEgcGFyYW1ldGVycyB0byBmaXQgdGhlIHJlbmRlcmluZyBpbnRvIHRoZSByZW5kZXIgdmllcG9ydFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBhZGp1c3RDYW1lcmEoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGxldCByZWN0OiBSZWN0YW5nbGUgPSBSZW5kZXJNYW5hZ2VyLmdldFZpZXdwb3J0UmVjdGFuZ2xlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY2FtZXJhLnByb2plY3RDZW50cmFsKHJlY3Qud2lkdGggLyByZWN0LmhlaWdodCwgdGhpcy5jYW1lcmEuZ2V0RmllbGRPZlZpZXcoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vICNlbmRyZWdpb25cclxuXHJcbiAgICAgICAgLy8jcmVnaW9uIFBvaW50c1xyXG4gICAgICAgIHB1YmxpYyBwb2ludENsaWVudFRvU291cmNlKF9jbGllbnQ6IFZlY3RvcjIpOiBWZWN0b3IyIHtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdDogVmVjdG9yMjtcclxuICAgICAgICAgICAgbGV0IHJlY3Q6IFJlY3RhbmdsZTtcclxuICAgICAgICAgICAgcmVjdCA9IHRoaXMuZ2V0Q2xpZW50UmVjdGFuZ2xlKCk7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuZnJhbWVDbGllbnRUb0NhbnZhcy5nZXRQb2ludChfY2xpZW50LCByZWN0KTtcclxuICAgICAgICAgICAgcmVjdCA9IHRoaXMuZ2V0Q2FudmFzUmVjdGFuZ2xlKCk7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuZnJhbWVDYW52YXNUb0Rlc3RpbmF0aW9uLmdldFBvaW50KHJlc3VsdCwgcmVjdCk7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMuZnJhbWVEZXN0aW5hdGlvblRvU291cmNlLmdldFBvaW50KHJlc3VsdCwgdGhpcy5yZWN0U291cmNlKTtcclxuICAgICAgICAgICAgLy9UT0RPOiB3aGVuIFNvdXJjZSwgUmVuZGVyIGFuZCBSZW5kZXJWaWV3cG9ydCBkZXZpYXRlLCBjb250aW51ZSB0cmFuc2Zvcm1hdGlvbiBcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBwb2ludFNvdXJjZVRvUmVuZGVyKF9zb3VyY2U6IFZlY3RvcjIpOiBWZWN0b3IyIHtcclxuICAgICAgICAgICAgbGV0IHByb2plY3Rpb25SZWN0YW5nbGU6IFJlY3RhbmdsZSA9IHRoaXMuY2FtZXJhLmdldFByb2plY3Rpb25SZWN0YW5nbGUoKTtcclxuICAgICAgICAgICAgbGV0IHBvaW50OiBWZWN0b3IyID0gdGhpcy5mcmFtZVNvdXJjZVRvUmVuZGVyLmdldFBvaW50KF9zb3VyY2UsIHByb2plY3Rpb25SZWN0YW5nbGUpO1xyXG4gICAgICAgICAgICByZXR1cm4gcG9pbnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgcG9pbnRDbGllbnRUb1JlbmRlcihfY2xpZW50OiBWZWN0b3IyKTogVmVjdG9yMiB7XHJcbiAgICAgICAgICAgIGxldCBwb2ludDogVmVjdG9yMiA9IHRoaXMucG9pbnRDbGllbnRUb1NvdXJjZShfY2xpZW50KTtcclxuICAgICAgICAgICAgcG9pbnQgPSB0aGlzLnBvaW50U291cmNlVG9SZW5kZXIocG9pbnQpO1xyXG4gICAgICAgICAgICAvL1RPRE86IHdoZW4gUmVuZGVyIGFuZCBSZW5kZXJWaWV3cG9ydCBkZXZpYXRlLCBjb250aW51ZSB0cmFuc2Zvcm1hdGlvbiBcclxuICAgICAgICAgICAgcmV0dXJuIHBvaW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8jZW5kcmVnaW9uXHJcblxyXG4gICAgICAgIC8vICNyZWdpb24gRXZlbnRzIChwYXNzaW5nIGZyb20gY2FudmFzIHRvIHZpZXdwb3J0IGFuZCBmcm9tIHRoZXJlIGludG8gYnJhbmNoKVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGlzIHZpZXdwb3J0IGN1cnJlbnRseSBoYXMgZm9jdXMgYW5kIHRodXMgcmVjZWl2ZXMga2V5Ym9hcmQgZXZlbnRzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGdldCBoYXNGb2N1cygpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgcmV0dXJuIChWaWV3cG9ydC5mb2N1cyA9PSB0aGlzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU3dpdGNoIHRoZSB2aWV3cG9ydHMgZm9jdXMgb24gb3Igb2ZmLiBPbmx5IG9uZSB2aWV3cG9ydCBpbiBvbmUgRlVER0UgaW5zdGFuY2UgY2FuIGhhdmUgdGhlIGZvY3VzLCB0aHVzIHJlY2VpdmluZyBrZXlib2FyZCBldmVudHMuIFxyXG4gICAgICAgICAqIFNvIGEgdmlld3BvcnQgY3VycmVudGx5IGhhdmluZyB0aGUgZm9jdXMgd2lsbCBsb3NlIGl0LCB3aGVuIGFub3RoZXIgb25lIHJlY2VpdmVzIGl0LiBUaGUgdmlld3BvcnRzIGZpcmUgW1tFdmVudF1dcyBhY2NvcmRpbmdseS5cclxuICAgICAgICAgKiAgXHJcbiAgICAgICAgICogQHBhcmFtIF9vbiBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc2V0Rm9jdXMoX29uOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGlmIChfb24pIHtcclxuICAgICAgICAgICAgICAgIGlmIChWaWV3cG9ydC5mb2N1cyA9PSB0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIGlmIChWaWV3cG9ydC5mb2N1cylcclxuICAgICAgICAgICAgICAgICAgICBWaWV3cG9ydC5mb2N1cy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChFVkVOVC5GT0NVU19PVVQpKTtcclxuICAgICAgICAgICAgICAgIFZpZXdwb3J0LmZvY3VzID0gdGhpcztcclxuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoRVZFTlQuRk9DVVNfSU4pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChWaWV3cG9ydC5mb2N1cyAhPSB0aGlzKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KEVWRU5ULkZPQ1VTX09VVCkpO1xyXG4gICAgICAgICAgICAgICAgVmlld3BvcnQuZm9jdXMgPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERlLSAvIEFjdGl2YXRlcyB0aGUgZ2l2ZW4gcG9pbnRlciBldmVudCB0byBiZSBwcm9wYWdhdGVkIGludG8gdGhlIHZpZXdwb3J0IGFzIEZVREdFLUV2ZW50IFxyXG4gICAgICAgICAqIEBwYXJhbSBfdHlwZSBcclxuICAgICAgICAgKiBAcGFyYW0gX29uIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBhY3RpdmF0ZVBvaW50ZXJFdmVudChfdHlwZTogRVZFTlRfUE9JTlRFUiwgX29uOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuYWN0aXZhdGVFdmVudCh0aGlzLmNhbnZhcywgX3R5cGUsIHRoaXMuaG5kUG9pbnRlckV2ZW50LCBfb24pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZS0gLyBBY3RpdmF0ZXMgdGhlIGdpdmVuIGtleWJvYXJkIGV2ZW50IHRvIGJlIHByb3BhZ2F0ZWQgaW50byB0aGUgdmlld3BvcnQgYXMgRlVER0UtRXZlbnRcclxuICAgICAgICAgKiBAcGFyYW0gX3R5cGUgXHJcbiAgICAgICAgICogQHBhcmFtIF9vbiBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgYWN0aXZhdGVLZXlib2FyZEV2ZW50KF90eXBlOiBFVkVOVF9LRVlCT0FSRCwgX29uOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuYWN0aXZhdGVFdmVudCh0aGlzLmNhbnZhcy5vd25lckRvY3VtZW50LCBfdHlwZSwgdGhpcy5obmRLZXlib2FyZEV2ZW50LCBfb24pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZS0gLyBBY3RpdmF0ZXMgdGhlIGdpdmVuIGRyYWctZHJvcCBldmVudCB0byBiZSBwcm9wYWdhdGVkIGludG8gdGhlIHZpZXdwb3J0IGFzIEZVREdFLUV2ZW50XHJcbiAgICAgICAgICogQHBhcmFtIF90eXBlIFxyXG4gICAgICAgICAqIEBwYXJhbSBfb24gXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGFjdGl2YXRlRHJhZ0Ryb3BFdmVudChfdHlwZTogRVZFTlRfRFJBR0RST1AsIF9vbjogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgICAgICBpZiAoX3R5cGUgPT0gRVZFTlRfRFJBR0RST1AuU1RBUlQpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhcy5kcmFnZ2FibGUgPSBfb247XHJcbiAgICAgICAgICAgIHRoaXMuYWN0aXZhdGVFdmVudCh0aGlzLmNhbnZhcywgX3R5cGUsIHRoaXMuaG5kRHJhZ0Ryb3BFdmVudCwgX29uKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGUtIC8gQWN0aXZhdGVzIHRoZSB3aGVlbCBldmVudCB0byBiZSBwcm9wYWdhdGVkIGludG8gdGhlIHZpZXdwb3J0IGFzIEZVREdFLUV2ZW50XHJcbiAgICAgICAgICogQHBhcmFtIF90eXBlIFxyXG4gICAgICAgICAqIEBwYXJhbSBfb24gXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGFjdGl2YXRlV2hlZWxFdmVudChfdHlwZTogRVZFTlRfV0hFRUwsIF9vbjogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmFjdGl2YXRlRXZlbnQodGhpcy5jYW52YXMsIF90eXBlLCB0aGlzLmhuZFdoZWVsRXZlbnQsIF9vbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEhhbmRsZSBkcmFnLWRyb3AgZXZlbnRzIGFuZCBkaXNwYXRjaCB0byB2aWV3cG9ydCBhcyBGVURHRS1FdmVudFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgaG5kRHJhZ0Ryb3BFdmVudDogRXZlbnRMaXN0ZW5lciA9IChfZXZlbnQ6IEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBfZHJhZ2V2ZW50OiBEcmFnRHJvcEV2ZW50xpIgPSA8RHJhZ0Ryb3BFdmVudMaSPl9ldmVudDtcclxuICAgICAgICAgICAgc3dpdGNoIChfZHJhZ2V2ZW50LnR5cGUpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgXCJkcmFnb3ZlclwiOlxyXG4gICAgICAgICAgICAgICAgY2FzZSBcImRyb3BcIjpcclxuICAgICAgICAgICAgICAgICAgICBfZHJhZ2V2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgX2RyYWdldmVudC5kYXRhVHJhbnNmZXIuZWZmZWN0QWxsb3dlZCA9IFwibm9uZVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBcImRyYWdzdGFydFwiOlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGp1c3QgZHVtbXkgZGF0YSwgIHZhbGlkIGRhdGEgc2hvdWxkIGJlIHNldCBpbiBoYW5kbGVyIHJlZ2lzdGVyZWQgYnkgdGhlIHVzZXJcclxuICAgICAgICAgICAgICAgICAgICBfZHJhZ2V2ZW50LmRhdGFUcmFuc2Zlci5zZXREYXRhKFwidGV4dFwiLCBcIkhhbGxvXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IGNoZWNrIGlmIHRoZXJlIGlzIGEgYmV0dGVyIHNvbHV0aW9uIHRvIGhpZGUgdGhlIGdob3N0IGltYWdlIG9mIHRoZSBkcmFnZ2FibGUgb2JqZWN0XHJcbiAgICAgICAgICAgICAgICAgICAgX2RyYWdldmVudC5kYXRhVHJhbnNmZXIuc2V0RHJhZ0ltYWdlKG5ldyBJbWFnZSgpLCAwLCAwKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgZXZlbnQ6IERyYWdEcm9wRXZlbnTGkiA9IG5ldyBEcmFnRHJvcEV2ZW50xpIoXCLGklwiICsgX2V2ZW50LnR5cGUsIF9kcmFnZXZlbnQpO1xyXG4gICAgICAgICAgICB0aGlzLmFkZENhbnZhc1Bvc2l0aW9uKGV2ZW50KTtcclxuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQWRkIHBvc2l0aW9uIG9mIHRoZSBwb2ludGVyIG1hcHBlZCB0byBjYW52YXMtY29vcmRpbmF0ZXMgYXMgY2FudmFzWCwgY2FudmFzWSB0byB0aGUgZXZlbnRcclxuICAgICAgICAgKiBAcGFyYW0gZXZlbnRcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIGFkZENhbnZhc1Bvc2l0aW9uKGV2ZW50OiBQb2ludGVyRXZlbnTGkiB8IERyYWdEcm9wRXZlbnTGkik6IHZvaWQge1xyXG4gICAgICAgICAgICBldmVudC5jYW52YXNYID0gdGhpcy5jYW52YXMud2lkdGggKiBldmVudC5wb2ludGVyWCAvIGV2ZW50LmNsaWVudFJlY3Qud2lkdGg7XHJcbiAgICAgICAgICAgIGV2ZW50LmNhbnZhc1kgPSB0aGlzLmNhbnZhcy5oZWlnaHQgKiBldmVudC5wb2ludGVyWSAvIGV2ZW50LmNsaWVudFJlY3QuaGVpZ2h0O1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBIYW5kbGUgcG9pbnRlciBldmVudHMgYW5kIGRpc3BhdGNoIHRvIHZpZXdwb3J0IGFzIEZVREdFLUV2ZW50XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBobmRQb2ludGVyRXZlbnQ6IEV2ZW50TGlzdGVuZXIgPSAoX2V2ZW50OiBFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZXZlbnQ6IFBvaW50ZXJFdmVudMaSID0gbmV3IFBvaW50ZXJFdmVudMaSKFwixpJcIiArIF9ldmVudC50eXBlLCA8UG9pbnRlckV2ZW50xpI+X2V2ZW50KTtcclxuICAgICAgICAgICAgdGhpcy5hZGRDYW52YXNQb3NpdGlvbihldmVudCk7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChldmVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEhhbmRsZSBrZXlib2FyZCBldmVudHMgYW5kIGRpc3BhdGNoIHRvIHZpZXdwb3J0IGFzIEZVREdFLUV2ZW50LCBpZiB0aGUgdmlld3BvcnQgaGFzIHRoZSBmb2N1c1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgaG5kS2V5Ym9hcmRFdmVudDogRXZlbnRMaXN0ZW5lciA9IChfZXZlbnQ6IEV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5oYXNGb2N1cylcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgbGV0IGV2ZW50OiBLZXlib2FyZEV2ZW50xpIgPSBuZXcgS2V5Ym9hcmRFdmVudMaSKFwixpJcIiArIF9ldmVudC50eXBlLCA8S2V5Ym9hcmRFdmVudMaSPl9ldmVudCk7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChldmVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEhhbmRsZSB3aGVlbCBldmVudCBhbmQgZGlzcGF0Y2ggdG8gdmlld3BvcnQgYXMgRlVER0UtRXZlbnRcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIGhuZFdoZWVsRXZlbnQ6IEV2ZW50TGlzdGVuZXIgPSAoX2V2ZW50OiBFdmVudCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgZXZlbnQ6IFdoZWVsRXZlbnTGkiA9IG5ldyBXaGVlbEV2ZW50xpIoXCLGklwiICsgX2V2ZW50LnR5cGUsIDxXaGVlbEV2ZW50xpI+X2V2ZW50KTtcclxuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgYWN0aXZhdGVFdmVudChfdGFyZ2V0OiBFdmVudFRhcmdldCwgX3R5cGU6IHN0cmluZywgX2hhbmRsZXI6IEV2ZW50TGlzdGVuZXIsIF9vbjogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgICAgICBfdHlwZSA9IF90eXBlLnNsaWNlKDEpOyAvLyBjaGlwIHRoZSDGkmxvcmVudGluXHJcbiAgICAgICAgICAgIGlmIChfb24pXHJcbiAgICAgICAgICAgICAgICBfdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoX3R5cGUsIF9oYW5kbGVyKTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgX3RhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKF90eXBlLCBfaGFuZGxlcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGhuZENvbXBvbmVudEV2ZW50KF9ldmVudDogRXZlbnQpOiB2b2lkIHtcclxuICAgICAgICAgICAgRGVidWcubG9nKF9ldmVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vICNlbmRyZWdpb25cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ29sbGVjdCBhbGwgbGlnaHRzIGluIHRoZSBicmFuY2ggdG8gcGFzcyB0byBzaGFkZXJzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBjb2xsZWN0TGlnaHRzKCk6IHZvaWQge1xyXG4gICAgICAgICAgICAvLyBUT0RPOiBtYWtlIHByaXZhdGVcclxuICAgICAgICAgICAgdGhpcy5saWdodHMgPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2YgdGhpcy5icmFuY2guYnJhbmNoKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY21wTGlnaHRzOiBDb21wb25lbnRMaWdodFtdID0gbm9kZS5nZXRDb21wb25lbnRzKENvbXBvbmVudExpZ2h0KTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGNtcExpZ2h0IG9mIGNtcExpZ2h0cykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0eXBlOiBzdHJpbmcgPSBjbXBMaWdodC5saWdodC50eXBlO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBsaWdodHNPZlR5cGU6IENvbXBvbmVudExpZ2h0W10gPSB0aGlzLmxpZ2h0cy5nZXQodHlwZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFsaWdodHNPZlR5cGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGlnaHRzT2ZUeXBlID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubGlnaHRzLnNldCh0eXBlLCBsaWdodHNPZlR5cGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBsaWdodHNPZlR5cGUucHVzaChjbXBMaWdodCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ3JlYXRlcyBhbiBvdXRwdXRzdHJpbmcgYXMgdmlzdWFsIHJlcHJlc2VudGF0aW9uIG9mIHRoaXMgdmlld3BvcnRzIHNjZW5lZ3JhcGguIENhbGxlZCBmb3IgdGhlIHBhc3NlZCBub2RlIGFuZCByZWN1cnNpdmUgZm9yIGFsbCBpdHMgY2hpbGRyZW4uXHJcbiAgICAgICAgICogQHBhcmFtIF9mdWRnZU5vZGUgVGhlIG5vZGUgdG8gY3JlYXRlIGEgc2NlbmVncmFwaGVudHJ5IGZvci5cclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIGNyZWF0ZVNjZW5lR3JhcGgoX2Z1ZGdlTm9kZTogTm9kZSk6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IG1vdmUgdG8gZGVidWctY2xhc3NcclxuICAgICAgICAgICAgbGV0IG91dHB1dDogc3RyaW5nID0gXCJcIjtcclxuICAgICAgICAgICAgZm9yIChsZXQgbmFtZSBpbiBfZnVkZ2VOb2RlLmdldENoaWxkcmVuKCkpIHtcclxuICAgICAgICAgICAgICAgIGxldCBjaGlsZDogTm9kZSA9IF9mdWRnZU5vZGUuZ2V0Q2hpbGRyZW4oKVtuYW1lXTtcclxuICAgICAgICAgICAgICAgIG91dHB1dCArPSBcIlxcblwiO1xyXG4gICAgICAgICAgICAgICAgbGV0IGN1cnJlbnQ6IE5vZGUgPSBjaGlsZDtcclxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50LmdldFBhcmVudCgpICYmIGN1cnJlbnQuZ2V0UGFyZW50KCkuZ2V0UGFyZW50KCkpXHJcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0ICs9IFwifFwiO1xyXG4gICAgICAgICAgICAgICAgd2hpbGUgKGN1cnJlbnQuZ2V0UGFyZW50KCkgJiYgY3VycmVudC5nZXRQYXJlbnQoKS5nZXRQYXJlbnQoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dCArPSBcIiAgIFwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnQgPSBjdXJyZW50LmdldFBhcmVudCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgb3V0cHV0ICs9IFwiJy0tXCI7XHJcblxyXG4gICAgICAgICAgICAgICAgb3V0cHV0ICs9IGNoaWxkLm5hbWU7XHJcbiAgICAgICAgICAgICAgICBvdXRwdXQgKz0gdGhpcy5jcmVhdGVTY2VuZUdyYXBoKGNoaWxkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gb3V0cHV0O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgTWFwRXZlbnRUeXBlVG9MaXN0ZW5lciB7XHJcbiAgICAgICAgW2V2ZW50VHlwZTogc3RyaW5nXTogRXZlbnRMaXN0ZW5lcltdO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVHlwZXMgb2YgZXZlbnRzIHNwZWNpZmljIHRvIEZ1ZGdlLCBpbiBhZGRpdGlvbiB0byB0aGUgc3RhbmRhcmQgRE9NL0Jyb3dzZXItVHlwZXMgYW5kIGN1c3RvbSBzdHJpbmdzXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjb25zdCBlbnVtIEVWRU5UIHtcclxuICAgICAgICAvKiogZGlzcGF0Y2hlZCB0byB0YXJnZXRzIHJlZ2lzdGVyZWQgYXQgW1tMb29wXV0sIHdoZW4gcmVxdWVzdGVkIGFuaW1hdGlvbiBmcmFtZSBzdGFydHMgKi9cclxuICAgICAgICBMT09QX0ZSQU1FID0gXCJsb29wRnJhbWVcIixcclxuICAgICAgICAvKiogZGlzcGF0Y2hlZCB0byBhIFtbQ29tcG9uZW50XV0gd2hlbiBpdHMgYmVpbmcgYWRkZWQgdG8gYSBbW05vZGVdXSAqL1xyXG4gICAgICAgIENPTVBPTkVOVF9BREQgPSBcImNvbXBvbmVudEFkZFwiLFxyXG4gICAgICAgIC8qKiBkaXNwYXRjaGVkIHRvIGEgW1tDb21wb25lbnRdXSB3aGVuIGl0cyBiZWluZyByZW1vdmVkIGZyb20gYSBbW05vZGVdXSAqL1xyXG4gICAgICAgIENPTVBPTkVOVF9SRU1PVkUgPSBcImNvbXBvbmVudFJlbW92ZVwiLFxyXG4gICAgICAgIC8qKiBkaXNwYXRjaGVkIHRvIGEgW1tDb21wb25lbnRdXSB3aGVuIGl0cyBiZWluZyBhY3RpdmF0ZWQgKi9cclxuICAgICAgICBDT01QT05FTlRfQUNUSVZBVEUgPSBcImNvbXBvbmVudEFjdGl2YXRlXCIsXHJcbiAgICAgICAgLyoqIGRpc3BhdGNoZWQgdG8gYSBbW0NvbXBvbmVudF1dIHdoZW4gaXRzIGJlaW5nIGRlYWN0aXZhdGVkICovXHJcbiAgICAgICAgQ09NUE9ORU5UX0RFQUNUSVZBVEUgPSBcImNvbXBvbmVudERlYWN0aXZhdGVcIixcclxuICAgICAgICAvKiogZGlzcGF0Y2hlZCB0byBhIGNoaWxkIFtbTm9kZV1dIGFuZCBpdHMgYW5jZXN0b3JzIGFmdGVyIGl0IHdhcyBhcHBlbmRlZCB0byBhIHBhcmVudCAqL1xyXG4gICAgICAgIENISUxEX0FQUEVORCA9IFwiY2hpbGRBZGRcIixcclxuICAgICAgICAvKiogZGlzcGF0Y2hlZCB0byBhIGNoaWxkIFtbTm9kZV1dIGFuZCBpdHMgYW5jZXN0b3JzIGp1c3QgYmVmb3JlIGl0cyBiZWluZyByZW1vdmVkIGZyb20gaXRzIHBhcmVudCAqL1xyXG4gICAgICAgIENISUxEX1JFTU9WRSA9IFwiY2hpbGRSZW1vdmVcIixcclxuICAgICAgICAvKiogZGlzcGF0Y2hlZCB0byBhIFtbTXV0YWJsZV1dIHdoZW4gaXRzIGJlaW5nIG11dGF0ZWQgKi9cclxuICAgICAgICBNVVRBVEUgPSBcIm11dGF0ZVwiLFxyXG4gICAgICAgIC8qKiBkaXNwYXRjaGVkIHRvIFtbVmlld3BvcnRdXSB3aGVuIGl0IGdldHMgdGhlIGZvY3VzIHRvIHJlY2VpdmUga2V5Ym9hcmQgaW5wdXQgKi9cclxuICAgICAgICBGT0NVU19JTiA9IFwiZm9jdXNpblwiLFxyXG4gICAgICAgIC8qKiBkaXNwYXRjaGVkIHRvIFtbVmlld3BvcnRdXSB3aGVuIGl0IGxvc2VzIHRoZSBmb2N1cyB0byByZWNlaXZlIGtleWJvYXJkIGlucHV0ICovXHJcbiAgICAgICAgRk9DVVNfT1VUID0gXCJmb2N1c291dFwiLFxyXG4gICAgICAgIC8qKiBkaXNwYXRjaGVkIHRvIFtbTm9kZV1dIHdoZW4gaXQncyBkb25lIHNlcmlhbGl6aW5nICovXHJcbiAgICAgICAgTk9ERV9TRVJJQUxJWkVEID0gXCJub2RlU2VyaWFsaXplZFwiLFxyXG4gICAgICAgIC8qKiBkaXNwYXRjaGVkIHRvIFtbTm9kZV1dIHdoZW4gaXQncyBkb25lIGRlc2VyaWFsaXppbmcsIHNvIGFsbCBjb21wb25lbnRzLCBjaGlsZHJlbiBhbmQgYXR0cmlidXRlcyBhcmUgYXZhaWxhYmxlICovXHJcbiAgICAgICAgTk9ERV9ERVNFUklBTElaRUQgPSBcIm5vZGVEZXNlcmlhbGl6ZWRcIixcclxuICAgICAgICAvKiogZGlzcGF0Y2hlZCB0byBbW05vZGVSZXNvdXJjZUluc3RhbmNlXV0gd2hlbiBpdCdzIGNvbnRlbnQgaXMgc2V0IGFjY29yZGluZyB0byBhIHNlcmlhbGl6YXRpb24gb2YgYSBbW05vZGVSZXNvdXJjZV1dICAqL1xyXG4gICAgICAgIE5PREVSRVNPVVJDRV9JTlNUQU5USUFURUQgPSBcIm5vZGVSZXNvdXJjZUluc3RhbnRpYXRlZFwiLFxyXG4gICAgICAgIC8qKiBkaXNwYXRjaGVkIHRvIFtbVGltZV1dIHdoZW4gaXQncyBzY2FsaW5nIGNoYW5nZWQgICovXHJcbiAgICAgICAgVElNRV9TQ0FMRUQgPSBcInRpbWVTY2FsZWRcIixcclxuICAgICAgICAvKiogZGlzcGF0Y2hlZCB0byBbW0ZpbGVJb11dIHdoZW4gYSBsaXN0IG9mIGZpbGVzIGhhcyBiZWVuIGxvYWRlZCAgKi9cclxuICAgICAgICBGSUxFX0xPQURFRCA9IFwiZmlsZUxvYWRlZFwiLFxyXG4gICAgICAgIC8qKiBkaXNwYXRjaGVkIHRvIFtbRmlsZUlvXV0gd2hlbiBhIGxpc3Qgb2YgZmlsZXMgaGFzIGJlZW4gc2F2ZWQgKi9cclxuICAgICAgICBGSUxFX1NBVkVEID0gXCJmaWxlU2F2ZWRcIlxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjb25zdCBlbnVtIEVWRU5UX1BPSU5URVIge1xyXG4gICAgICAgIFVQID0gXCLGknBvaW50ZXJ1cFwiLFxyXG4gICAgICAgIERPV04gPSBcIsaScG9pbnRlcmRvd25cIlxyXG4gICAgfVxyXG4gICAgZXhwb3J0IGNvbnN0IGVudW0gRVZFTlRfRFJBR0RST1Age1xyXG4gICAgICAgIERSQUcgPSBcIsaSZHJhZ1wiLFxyXG4gICAgICAgIERST1AgPSBcIsaSZHJvcFwiLFxyXG4gICAgICAgIFNUQVJUID0gXCLGkmRyYWdzdGFydFwiLFxyXG4gICAgICAgIEVORCA9IFwixpJkcmFnZW5kXCIsXHJcbiAgICAgICAgT1ZFUiA9IFwixpJkcmFnb3ZlclwiXHJcbiAgICB9XHJcbiAgICBleHBvcnQgY29uc3QgZW51bSBFVkVOVF9XSEVFTCB7XHJcbiAgICAgICAgV0hFRUwgPSBcIsaSd2hlZWxcIlxyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBQb2ludGVyRXZlbnTGkiBleHRlbmRzIFBvaW50ZXJFdmVudCB7XHJcbiAgICAgICAgcHVibGljIHBvaW50ZXJYOiBudW1iZXI7XHJcbiAgICAgICAgcHVibGljIHBvaW50ZXJZOiBudW1iZXI7XHJcbiAgICAgICAgcHVibGljIGNhbnZhc1g6IG51bWJlcjtcclxuICAgICAgICBwdWJsaWMgY2FudmFzWTogbnVtYmVyO1xyXG4gICAgICAgIHB1YmxpYyBjbGllbnRSZWN0OiBDbGllbnRSZWN0O1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3Rvcih0eXBlOiBzdHJpbmcsIF9ldmVudDogUG9pbnRlckV2ZW50xpIpIHtcclxuICAgICAgICAgICAgc3VwZXIodHlwZSwgX2V2ZW50KTtcclxuICAgICAgICAgICAgbGV0IHRhcmdldDogSFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+X2V2ZW50LnRhcmdldDtcclxuICAgICAgICAgICAgdGhpcy5jbGllbnRSZWN0ID0gdGFyZ2V0LmdldENsaWVudFJlY3RzKClbMF07XHJcbiAgICAgICAgICAgIHRoaXMucG9pbnRlclggPSBfZXZlbnQuY2xpZW50WCAtIHRoaXMuY2xpZW50UmVjdC5sZWZ0O1xyXG4gICAgICAgICAgICB0aGlzLnBvaW50ZXJZID0gX2V2ZW50LmNsaWVudFkgLSB0aGlzLmNsaWVudFJlY3QudG9wO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgRHJhZ0Ryb3BFdmVudMaSIGV4dGVuZHMgRHJhZ0V2ZW50IHtcclxuICAgICAgICBwdWJsaWMgcG9pbnRlclg6IG51bWJlcjtcclxuICAgICAgICBwdWJsaWMgcG9pbnRlclk6IG51bWJlcjtcclxuICAgICAgICBwdWJsaWMgY2FudmFzWDogbnVtYmVyO1xyXG4gICAgICAgIHB1YmxpYyBjYW52YXNZOiBudW1iZXI7XHJcbiAgICAgICAgcHVibGljIGNsaWVudFJlY3Q6IENsaWVudFJlY3Q7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKHR5cGU6IHN0cmluZywgX2V2ZW50OiBEcmFnRHJvcEV2ZW50xpIpIHtcclxuICAgICAgICAgICAgc3VwZXIodHlwZSwgX2V2ZW50KTtcclxuICAgICAgICAgICAgbGV0IHRhcmdldDogSFRNTEVsZW1lbnQgPSA8SFRNTEVsZW1lbnQ+X2V2ZW50LnRhcmdldDtcclxuICAgICAgICAgICAgdGhpcy5jbGllbnRSZWN0ID0gdGFyZ2V0LmdldENsaWVudFJlY3RzKClbMF07XHJcbiAgICAgICAgICAgIHRoaXMucG9pbnRlclggPSBfZXZlbnQuY2xpZW50WCAtIHRoaXMuY2xpZW50UmVjdC5sZWZ0O1xyXG4gICAgICAgICAgICB0aGlzLnBvaW50ZXJZID0gX2V2ZW50LmNsaWVudFkgLSB0aGlzLmNsaWVudFJlY3QudG9wO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgV2hlZWxFdmVudMaSIGV4dGVuZHMgV2hlZWxFdmVudCB7XHJcbiAgICAgICAgY29uc3RydWN0b3IodHlwZTogc3RyaW5nLCBfZXZlbnQ6IFdoZWVsRXZlbnTGkikge1xyXG4gICAgICAgICAgICBzdXBlcih0eXBlLCBfZXZlbnQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEJhc2UgY2xhc3MgZm9yIEV2ZW50VGFyZ2V0IHNpbmdsZXRvbnMsIHdoaWNoIGFyZSBmaXhlZCBlbnRpdGllcyBpbiB0aGUgc3RydWN0dXJlIG9mIEZ1ZGdlLCBzdWNoIGFzIHRoZSBjb3JlIGxvb3AgXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBFdmVudFRhcmdldFN0YXRpYyBleHRlbmRzIEV2ZW50VGFyZ2V0IHtcclxuICAgICAgICBwcm90ZWN0ZWQgc3RhdGljIHRhcmdldFN0YXRpYzogRXZlbnRUYXJnZXRTdGF0aWMgPSBuZXcgRXZlbnRUYXJnZXRTdGF0aWMoKTtcclxuXHJcbiAgICAgICAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBhZGRFdmVudExpc3RlbmVyKF90eXBlOiBzdHJpbmcsIF9oYW5kbGVyOiBFdmVudExpc3RlbmVyKTogdm9pZCB7XHJcbiAgICAgICAgICAgIEV2ZW50VGFyZ2V0U3RhdGljLnRhcmdldFN0YXRpYy5hZGRFdmVudExpc3RlbmVyKF90eXBlLCBfaGFuZGxlcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgcmVtb3ZlRXZlbnRMaXN0ZW5lcihfdHlwZTogc3RyaW5nLCBfaGFuZGxlcjogRXZlbnRMaXN0ZW5lcik6IHZvaWQge1xyXG4gICAgICAgICAgICBFdmVudFRhcmdldFN0YXRpYy50YXJnZXRTdGF0aWMucmVtb3ZlRXZlbnRMaXN0ZW5lcihfdHlwZSwgX2hhbmRsZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGRpc3BhdGNoRXZlbnQoX2V2ZW50OiBFdmVudCk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICBFdmVudFRhcmdldFN0YXRpYy50YXJnZXRTdGF0aWMuZGlzcGF0Y2hFdmVudChfZXZlbnQpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIGV4cG9ydCBjbGFzcyBLZXlib2FyZEV2ZW50xpIgZXh0ZW5kcyBLZXlib2FyZEV2ZW50IHtcclxuICAgICAgICBjb25zdHJ1Y3Rvcih0eXBlOiBzdHJpbmcsIF9ldmVudDogS2V5Ym9hcmRFdmVudMaSKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKHR5cGUsIF9ldmVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTWFwcGluZ3Mgb2Ygc3RhbmRhcmQgRE9NL0Jyb3dzZXItRXZlbnRzIGFzIHBhc3NlZCBmcm9tIGEgY2FudmFzIHRvIHRoZSB2aWV3cG9ydFxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY29uc3QgZW51bSBFVkVOVF9LRVlCT0FSRCB7XHJcbiAgICAgICAgVVAgPSBcIsaSa2V5dXBcIixcclxuICAgICAgICBET1dOID0gXCLGkmtleWRvd25cIlxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIGNvZGVzIHNlbnQgZnJvbSBhIHN0YW5kYXJkIGVuZ2xpc2gga2V5Ym9hcmQgbGF5b3V0XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBlbnVtIEtFWUJPQVJEX0NPREUge1xyXG4gICAgICAgIEEgPSBcIktleUFcIixcclxuICAgICAgICBCID0gXCJLZXlCXCIsXHJcbiAgICAgICAgQyA9IFwiS2V5Q1wiLFxyXG4gICAgICAgIEQgPSBcIktleURcIixcclxuICAgICAgICBFID0gXCJLZXlFXCIsXHJcbiAgICAgICAgRiA9IFwiS2V5RlwiLFxyXG4gICAgICAgIEcgPSBcIktleUdcIixcclxuICAgICAgICBIID0gXCJLZXlIXCIsXHJcbiAgICAgICAgSSA9IFwiS2V5SVwiLFxyXG4gICAgICAgIEogPSBcIktleUpcIixcclxuICAgICAgICBLID0gXCJLZXlLXCIsXHJcbiAgICAgICAgTCA9IFwiS2V5TFwiLFxyXG4gICAgICAgIE0gPSBcIktleU1cIixcclxuICAgICAgICBOID0gXCJLZXlOXCIsXHJcbiAgICAgICAgTyA9IFwiS2V5T1wiLFxyXG4gICAgICAgIFAgPSBcIktleVBcIixcclxuICAgICAgICBRID0gXCJLZXlRXCIsXHJcbiAgICAgICAgUiA9IFwiS2V5UlwiLFxyXG4gICAgICAgIFMgPSBcIktleVNcIixcclxuICAgICAgICBUID0gXCJLZXlUXCIsXHJcbiAgICAgICAgVSA9IFwiS2V5VVwiLFxyXG4gICAgICAgIFYgPSBcIktleVZcIixcclxuICAgICAgICBXID0gXCJLZXlXXCIsXHJcbiAgICAgICAgWCA9IFwiS2V5WFwiLFxyXG4gICAgICAgIFkgPSBcIktleVlcIixcclxuICAgICAgICBaID0gXCJLZXlaXCIsXHJcbiAgICAgICAgRVNDID0gXCJFc2NhcGVcIixcclxuICAgICAgICBaRVJPID0gXCJEaWdpdDBcIixcclxuICAgICAgICBPTkUgPSBcIkRpZ2l0MVwiLFxyXG4gICAgICAgIFRXTyA9IFwiRGlnaXQyXCIsXHJcbiAgICAgICAgVEhSRUUgPSBcIkRpZ2l0M1wiLFxyXG4gICAgICAgIEZPVVIgPSBcIkRpZ2l0NFwiLFxyXG4gICAgICAgIEZJVkUgPSBcIkRpZ2l0NVwiLFxyXG4gICAgICAgIFNJWCA9IFwiRGlnaXQ2XCIsXHJcbiAgICAgICAgU0VWRU4gPSBcIkRpZ2l0N1wiLFxyXG4gICAgICAgIEVJR0hUID0gXCJEaWdpdDhcIixcclxuICAgICAgICBOSU5FID0gXCJEaWdpdDlcIixcclxuICAgICAgICBNSU5VUyA9IFwiTWludXNcIixcclxuICAgICAgICBFUVVBTCA9IFwiRXF1YWxcIixcclxuICAgICAgICBCQUNLU1BBQ0UgPSBcIkJhY2tzcGFjZVwiLFxyXG4gICAgICAgIFRBQlVMQVRPUiA9IFwiVGFiXCIsXHJcbiAgICAgICAgQlJBQ0tFVF9MRUZUID0gXCJCcmFja2V0TGVmdFwiLFxyXG4gICAgICAgIEJSQUNLRVRfUklHSFQgPSBcIkJyYWNrZXRSaWdodFwiLFxyXG4gICAgICAgIEVOVEVSID0gXCJFbnRlclwiLFxyXG4gICAgICAgIENUUkxfTEVGVCA9IFwiQ29udHJvbExlZnRcIixcclxuICAgICAgICBTRU1JQ09MT04gPSBcIlNlbWljb2xvblwiLFxyXG4gICAgICAgIFFVT1RFID0gXCJRdW90ZVwiLFxyXG4gICAgICAgIEJBQ0tfUVVPVEUgPSBcIkJhY2txdW90ZVwiLFxyXG4gICAgICAgIFNISUZUX0xFRlQgPSBcIlNoaWZ0TGVmdFwiLFxyXG4gICAgICAgIEJBQ0tTTEFTSCA9IFwiQmFja3NsYXNoXCIsXHJcbiAgICAgICAgQ09NTUEgPSBcIkNvbW1hXCIsXHJcbiAgICAgICAgUEVSSU9EID0gXCJQZXJpb2RcIixcclxuICAgICAgICBTTEFTSCA9IFwiU2xhc2hcIixcclxuICAgICAgICBTSElGVF9SSUdIVCA9IFwiU2hpZnRSaWdodFwiLFxyXG4gICAgICAgIE5VTVBBRF9NVUxUSVBMWSA9IFwiTnVtcGFkTXVsdGlwbHlcIixcclxuICAgICAgICBBTFRfTEVGVCA9IFwiQWx0TGVmdFwiLFxyXG4gICAgICAgIFNQQUNFID0gXCJTcGFjZVwiLFxyXG4gICAgICAgIENBUFNfTE9DSyA9IFwiQ2Fwc0xvY2tcIixcclxuICAgICAgICBGMSA9IFwiRjFcIixcclxuICAgICAgICBGMiA9IFwiRjJcIixcclxuICAgICAgICBGMyA9IFwiRjNcIixcclxuICAgICAgICBGNCA9IFwiRjRcIixcclxuICAgICAgICBGNSA9IFwiRjVcIixcclxuICAgICAgICBGNiA9IFwiRjZcIixcclxuICAgICAgICBGNyA9IFwiRjdcIixcclxuICAgICAgICBGOCA9IFwiRjhcIixcclxuICAgICAgICBGOSA9IFwiRjlcIixcclxuICAgICAgICBGMTAgPSBcIkYxMFwiLFxyXG4gICAgICAgIFBBVVNFID0gXCJQYXVzZVwiLFxyXG4gICAgICAgIFNDUk9MTF9MT0NLID0gXCJTY3JvbGxMb2NrXCIsXHJcbiAgICAgICAgTlVNUEFENyA9IFwiTnVtcGFkN1wiLFxyXG4gICAgICAgIE5VTVBBRDggPSBcIk51bXBhZDhcIixcclxuICAgICAgICBOVU1QQUQ5ID0gXCJOdW1wYWQ5XCIsXHJcbiAgICAgICAgTlVNUEFEX1NVQlRSQUNUID0gXCJOdW1wYWRTdWJ0cmFjdFwiLFxyXG4gICAgICAgIE5VTVBBRDQgPSBcIk51bXBhZDRcIixcclxuICAgICAgICBOVU1QQUQ1ID0gXCJOdW1wYWQ1XCIsXHJcbiAgICAgICAgTlVNUEFENiA9IFwiTnVtcGFkNlwiLFxyXG4gICAgICAgIE5VTVBBRF9BREQgPSBcIk51bXBhZEFkZFwiLFxyXG4gICAgICAgIE5VTVBBRDEgPSBcIk51bXBhZDFcIixcclxuICAgICAgICBOVU1QQUQyID0gXCJOdW1wYWQyXCIsXHJcbiAgICAgICAgTlVNUEFEMyA9IFwiTnVtcGFkM1wiLFxyXG4gICAgICAgIE5VTVBBRDAgPSBcIk51bXBhZDBcIixcclxuICAgICAgICBOVU1QQURfREVDSU1BTCA9IFwiTnVtcGFkRGVjaW1hbFwiLFxyXG4gICAgICAgIFBSSU5UX1NDUkVFTiA9IFwiUHJpbnRTY3JlZW5cIixcclxuICAgICAgICBJTlRMX0JBQ0tfU0xBU0ggPSBcIkludGxCYWNrU2xhc2hcIixcclxuICAgICAgICBGMTEgPSBcIkYxMVwiLFxyXG4gICAgICAgIEYxMiA9IFwiRjEyXCIsXHJcbiAgICAgICAgTlVNUEFEX0VRVUFMID0gXCJOdW1wYWRFcXVhbFwiLFxyXG4gICAgICAgIEYxMyA9IFwiRjEzXCIsXHJcbiAgICAgICAgRjE0ID0gXCJGMTRcIixcclxuICAgICAgICBGMTUgPSBcIkYxNVwiLFxyXG4gICAgICAgIEYxNiA9IFwiRjE2XCIsXHJcbiAgICAgICAgRjE3ID0gXCJGMTdcIixcclxuICAgICAgICBGMTggPSBcIkYxOFwiLFxyXG4gICAgICAgIEYxOSA9IFwiRjE5XCIsXHJcbiAgICAgICAgRjIwID0gXCJGMjBcIixcclxuICAgICAgICBGMjEgPSBcIkYyMVwiLFxyXG4gICAgICAgIEYyMiA9IFwiRjIyXCIsXHJcbiAgICAgICAgRjIzID0gXCJGMjNcIixcclxuICAgICAgICBGMjQgPSBcIkYyNFwiLFxyXG4gICAgICAgIEtBTkFfTU9ERSA9IFwiS2FuYU1vZGVcIixcclxuICAgICAgICBMQU5HMiA9IFwiTGFuZzJcIixcclxuICAgICAgICBMQU5HMSA9IFwiTGFuZzFcIixcclxuICAgICAgICBJTlRMX1JPID0gXCJJbnRsUm9cIixcclxuICAgICAgICBDT05WRVJUID0gXCJDb252ZXJ0XCIsXHJcbiAgICAgICAgTk9OX0NPTlZFUlQgPSBcIk5vbkNvbnZlcnRcIixcclxuICAgICAgICBJTlRMX1lFTiA9IFwiSW50bFllblwiLFxyXG4gICAgICAgIE5VTVBBRF9DT01NQSA9IFwiTnVtcGFkQ29tbWFcIixcclxuICAgICAgICBVTkRPID0gXCJVbmRvXCIsXHJcbiAgICAgICAgUEFTVEUgPSBcIlBhc3RlXCIsXHJcbiAgICAgICAgTUVESUFfVFJBQ0tfUFJFVklPVVMgPSBcIk1lZGlhVHJhY2tQcmV2aW91c1wiLFxyXG4gICAgICAgIENVVCA9IFwiQ3V0XCIsXHJcbiAgICAgICAgQ09QWSA9IFwiQ29weVwiLFxyXG4gICAgICAgIE1FRElBX1RSQUNLX05FWFQgPSBcIk1lZGlhVHJhY2tOZXh0XCIsXHJcbiAgICAgICAgTlVNUEFEX0VOVEVSID0gXCJOdW1wYWRFbnRlclwiLFxyXG4gICAgICAgIENUUkxfUklHSFQgPSBcIkNvbnRyb2xSaWdodFwiLFxyXG4gICAgICAgIEFVRElPX1ZPTFVNRV9NVVRFID0gXCJBdWRpb1ZvbHVtZU11dGVcIixcclxuICAgICAgICBMQVVOQ0hfQVBQMiA9IFwiTGF1bmNoQXBwMlwiLFxyXG4gICAgICAgIE1FRElBX1BMQVlfUEFVU0UgPSBcIk1lZGlhUGxheVBhdXNlXCIsXHJcbiAgICAgICAgTUVESUFfU1RPUCA9IFwiTWVkaWFTdG9wXCIsXHJcbiAgICAgICAgRUpFQ1QgPSBcIkVqZWN0XCIsXHJcbiAgICAgICAgQVVESU9fVk9MVU1FX0RPV04gPSBcIkF1ZGlvVm9sdW1lRG93blwiLFxyXG4gICAgICAgIFZPTFVNRV9ET1dOID0gXCJWb2x1bWVEb3duXCIsXHJcbiAgICAgICAgQVVESU9fVk9MVU1FX1VQID0gXCJBdWRpb1ZvbHVtZVVwXCIsXHJcbiAgICAgICAgVk9MVU1FX1VQID0gXCJWb2x1bWVVcFwiLFxyXG4gICAgICAgIEJST1dTRVJfSE9NRSA9IFwiQnJvd3NlckhvbWVcIixcclxuICAgICAgICBOVU1QQURfRElWSURFID0gXCJOdW1wYWREaXZpZGVcIixcclxuICAgICAgICBBTFRfUklHSFQgPSBcIkFsdFJpZ2h0XCIsXHJcbiAgICAgICAgSEVMUCA9IFwiSGVscFwiLFxyXG4gICAgICAgIE5VTV9MT0NLID0gXCJOdW1Mb2NrXCIsXHJcbiAgICAgICAgSE9NRSA9IFwiSG9tZVwiLFxyXG4gICAgICAgIEFSUk9XX1VQID0gXCJBcnJvd1VwXCIsXHJcbiAgICAgICAgQVJST1dfUklHSFQgPSBcIkFycm93UmlnaHRcIixcclxuICAgICAgICBBUlJPV19ET1dOID0gXCJBcnJvd0Rvd25cIixcclxuICAgICAgICBBUlJPV19MRUZUID0gXCJBcnJvd0xlZnRcIixcclxuICAgICAgICBFTkQgPSBcIkVuZFwiLFxyXG4gICAgICAgIFBBR0VfVVAgPSBcIlBhZ2VVcFwiLFxyXG4gICAgICAgIFBBR0VfRE9XTiA9IFwiUGFnZURvd25cIixcclxuICAgICAgICBJTlNFUlQgPSBcIkluc2VydFwiLFxyXG4gICAgICAgIERFTEVURSA9IFwiRGVsZXRlXCIsXHJcbiAgICAgICAgTUVUQV9MRUZUID0gXCJNZXRhX0xlZnRcIixcclxuICAgICAgICBPU19MRUZUID0gXCJPU0xlZnRcIixcclxuICAgICAgICBNRVRBX1JJR0hUID0gXCJNZXRhUmlnaHRcIixcclxuICAgICAgICBPU19SSUdIVCA9IFwiT1NSaWdodFwiLFxyXG4gICAgICAgIENPTlRFWFRfTUVOVSA9IFwiQ29udGV4dE1lbnVcIixcclxuICAgICAgICBQT1dFUiA9IFwiUG93ZXJcIixcclxuICAgICAgICBCUk9XU0VSX1NFQVJDSCA9IFwiQnJvd3NlclNlYXJjaFwiLFxyXG4gICAgICAgIEJST1dTRVJfRkFWT1JJVEVTID0gXCJCcm93c2VyRmF2b3JpdGVzXCIsXHJcbiAgICAgICAgQlJPV1NFUl9SRUZSRVNIID0gXCJCcm93c2VyUmVmcmVzaFwiLFxyXG4gICAgICAgIEJST1dTRVJfU1RPUCA9IFwiQnJvd3NlclN0b3BcIixcclxuICAgICAgICBCUk9XU0VSX0ZPUldBUkQgPSBcIkJyb3dzZXJGb3J3YXJkXCIsXHJcbiAgICAgICAgQlJPV1NFUl9CQUNLID0gXCJCcm93c2VyQmFja1wiLFxyXG4gICAgICAgIExBVU5DSF9BUFAxID0gXCJMYXVuY2hBcHAxXCIsXHJcbiAgICAgICAgTEFVTkNIX01BSUwgPSBcIkxhdW5jaE1haWxcIixcclxuICAgICAgICBMQVVOQ0hfTUVESUFfUExBWUVSID0gXCJMYXVuY2hNZWRpYVBsYXllclwiLFxyXG5cclxuICAgICAgICAvL21hYyBicmluZ3MgdGhpcyBidXR0dG9uXHJcbiAgICAgICAgRk4gPSBcIkZuXCIsIC8vbm8gZXZlbnQgZmlyZWQgYWN0dWFsbHlcclxuXHJcbiAgICAgICAgLy9MaW51eCBicmluZ3MgdGhlc2VcclxuICAgICAgICBBR0FJTiA9IFwiQWdhaW5cIixcclxuICAgICAgICBQUk9QUyA9IFwiUHJvcHNcIixcclxuICAgICAgICBTRUxFQ1QgPSBcIlNlbGVjdFwiLFxyXG4gICAgICAgIE9QRU4gPSBcIk9wZW5cIixcclxuICAgICAgICBGSU5EID0gXCJGaW5kXCIsXHJcbiAgICAgICAgV0FLRV9VUCA9IFwiV2FrZVVwXCIsXHJcbiAgICAgICAgTlVNUEFEX1BBUkVOVF9MRUZUID0gXCJOdW1wYWRQYXJlbnRMZWZ0XCIsXHJcbiAgICAgICAgTlVNUEFEX1BBUkVOVF9SSUdIVCA9IFwiTnVtcGFkUGFyZW50UmlnaHRcIixcclxuXHJcbiAgICAgICAgLy9hbmRyb2lkXHJcbiAgICAgICAgU0xFRVAgPSBcIlNsZWVwXCJcclxuICAgIH1cclxuICAgIC8qIFxyXG4gICAgRmlyZWZveCBjYW4ndCBtYWtlIHVzZSBvZiB0aG9zZSBidXR0b25zIGFuZCBDb21iaW5hdGlvbnM6XHJcbiAgICBTSU5HRUxFX0JVVFRPTlM6XHJcbiAgICAgRHJ1Y2ssXHJcbiAgICBDT01CSU5BVElPTlM6XHJcbiAgICAgU2hpZnQgKyBGMTAsIFNoaWZ0ICsgTnVtcGFkNSxcclxuICAgICBDVFJMICsgcSwgQ1RSTCArIEY0LFxyXG4gICAgIEFMVCArIEYxLCBBTFQgKyBGMiwgQUxUICsgRjMsIEFMVCArIEY3LCBBTFQgKyBGOCwgQUxUICsgRjEwXHJcbiAgICBPcGVyYSB3b24ndCBkbyBnb29kIHdpdGggdGhlc2UgQnV0dG9ucyBhbmQgY29tYmluYXRpb25zOlxyXG4gICAgU0lOR0xFX0JVVFRPTlM6XHJcbiAgICAgRmxvYXQzMkFycmF5LCBGMTEsIEFMVCxcclxuICAgIENPTUJJTkFUSU9OUzpcclxuICAgICBDVFJMICsgcSwgQ1RSTCArIHQsIENUUkwgKyBoLCBDVFJMICsgZywgQ1RSTCArIG4sIENUUkwgKyBmIFxyXG4gICAgIEFMVCArIEYxLCBBTFQgKyBGMiwgQUxUICsgRjQsIEFMVCArIEY1LCBBTFQgKyBGNiwgQUxUICsgRjcsIEFMVCArIEY4LCBBTFQgKyBGMTBcclxuICAgICAqL1xyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIEJvcmRlciB7XHJcbiAgICAgICAgbGVmdDogbnVtYmVyO1xyXG4gICAgICAgIHRvcDogbnVtYmVyO1xyXG4gICAgICAgIHJpZ2h0OiBudW1iZXI7XHJcbiAgICAgICAgYm90dG9tOiBudW1iZXI7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGcmFtaW5nIGRlc2NyaWJlcyBob3cgdG8gbWFwIGEgcmVjdGFuZ2xlIGludG8gYSBnaXZlbiBmcmFtZVxyXG4gICAgICogYW5kIGhvdyBwb2ludHMgaW4gdGhlIGZyYW1lIGNvcnJlc3BvbmQgdG8gcG9pbnRzIGluIHRoZSByZXN1bHRpbmcgcmVjdGFuZ2xlIFxyXG4gICAgICovXHJcbiAgICBleHBvcnQgYWJzdHJhY3QgY2xhc3MgRnJhbWluZyBleHRlbmRzIE11dGFibGUge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIE1hcHMgYSBwb2ludCBpbiB0aGUgZ2l2ZW4gZnJhbWUgYWNjb3JkaW5nIHRvIHRoaXMgZnJhbWluZ1xyXG4gICAgICAgICAqIEBwYXJhbSBfcG9pbnRJbkZyYW1lIFRoZSBwb2ludCBpbiB0aGUgZnJhbWUgZ2l2ZW5cclxuICAgICAgICAgKiBAcGFyYW0gX3JlY3RGcmFtZSBUaGUgZnJhbWUgdGhlIHBvaW50IGlzIHJlbGF0aXZlIHRvXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGFic3RyYWN0IGdldFBvaW50KF9wb2ludEluRnJhbWU6IFZlY3RvcjIsIF9yZWN0RnJhbWU6IFJlY3RhbmdsZSk6IFZlY3RvcjI7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIE1hcHMgYSBwb2ludCBpbiBhIGdpdmVuIHJlY3RhbmdsZSBiYWNrIHRvIGEgY2FsY3VsYXRlZCBmcmFtZSBvZiBvcmlnaW5cclxuICAgICAgICAgKiBAcGFyYW0gX3BvaW50IFRoZSBwb2ludCBpbiB0aGUgcmVjdGFuZ2xlXHJcbiAgICAgICAgICogQHBhcmFtIF9yZWN0IFRoZSByZWN0YW5nbGUgdGhlIHBvaW50IGlzIHJlbGF0aXZlIHRvXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGFic3RyYWN0IGdldFBvaW50SW52ZXJzZShfcG9pbnQ6IFZlY3RvcjIsIF9yZWN0OiBSZWN0YW5nbGUpOiBWZWN0b3IyO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUYWtlcyBhIHJlY3RhbmdsZSBhcyB0aGUgZnJhbWUgYW5kIGNyZWF0ZXMgYSBuZXcgcmVjdGFuZ2xlIGFjY29yZGluZyB0byB0aGUgZnJhbWluZ1xyXG4gICAgICAgICAqIEBwYXJhbSBfcmVjdEZyYW1lXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGFic3RyYWN0IGdldFJlY3QoX3JlY3RGcmFtZTogUmVjdGFuZ2xlKTogUmVjdGFuZ2xlO1xyXG4gICAgICAgIHByb3RlY3RlZCByZWR1Y2VNdXRhdG9yKF9tdXRhdG9yOiBNdXRhdG9yKTogdm9pZCB7LyoqICovIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSByZXN1bHRpbmcgcmVjdGFuZ2xlIGhhcyBhIGZpeGVkIHdpZHRoIGFuZCBoZWlnaHQgYW5kIGRpc3BsYXkgc2hvdWxkIHNjYWxlIHRvIGZpdCB0aGUgZnJhbWVcclxuICAgICAqIFBvaW50cyBhcmUgc2NhbGVkIGluIHRoZSBzYW1lIHJhdGlvXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBGcmFtaW5nRml4ZWQgZXh0ZW5kcyBGcmFtaW5nIHtcclxuICAgICAgICBwdWJsaWMgd2lkdGg6IG51bWJlciA9IDMwMDtcclxuICAgICAgICBwdWJsaWMgaGVpZ2h0OiBudW1iZXIgPSAxNTA7XHJcblxyXG4gICAgICAgIHB1YmxpYyBzZXRTaXplKF93aWR0aDogbnVtYmVyLCBfaGVpZ2h0OiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy53aWR0aCA9IF93aWR0aDtcclxuICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSBfaGVpZ2h0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldFBvaW50KF9wb2ludEluRnJhbWU6IFZlY3RvcjIsIF9yZWN0RnJhbWU6IFJlY3RhbmdsZSk6IFZlY3RvcjIge1xyXG4gICAgICAgICAgICBsZXQgcmVzdWx0OiBWZWN0b3IyID0gbmV3IFZlY3RvcjIoXHJcbiAgICAgICAgICAgICAgICB0aGlzLndpZHRoICogKF9wb2ludEluRnJhbWUueCAtIF9yZWN0RnJhbWUueCkgLyBfcmVjdEZyYW1lLndpZHRoLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5oZWlnaHQgKiAoX3BvaW50SW5GcmFtZS55IC0gX3JlY3RGcmFtZS55KSAvIF9yZWN0RnJhbWUuaGVpZ2h0XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0UG9pbnRJbnZlcnNlKF9wb2ludDogVmVjdG9yMiwgX3JlY3Q6IFJlY3RhbmdsZSk6IFZlY3RvcjIge1xyXG4gICAgICAgICAgICBsZXQgcmVzdWx0OiBWZWN0b3IyID0gbmV3IFZlY3RvcjIoXHJcbiAgICAgICAgICAgICAgICBfcG9pbnQueCAqIF9yZWN0LndpZHRoIC8gdGhpcy53aWR0aCArIF9yZWN0LngsXHJcbiAgICAgICAgICAgICAgICBfcG9pbnQueSAqIF9yZWN0LmhlaWdodCAvIHRoaXMuaGVpZ2h0ICsgX3JlY3QueVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldFJlY3QoX3JlY3RGcmFtZTogUmVjdGFuZ2xlKTogUmVjdGFuZ2xlIHtcclxuICAgICAgICAgICAgcmV0dXJuIFJlY3RhbmdsZS5HRVQoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogV2lkdGggYW5kIGhlaWdodCBvZiB0aGUgcmVzdWx0aW5nIHJlY3RhbmdsZSBhcmUgZnJhY3Rpb25zIG9mIHRob3NlIG9mIHRoZSBmcmFtZSwgc2NhbGVkIGJ5IG5vcm1lZCB2YWx1ZXMgbm9ybVdpZHRoIGFuZCBub3JtSGVpZ2h0LlxyXG4gICAgICogRGlzcGxheSBzaG91bGQgc2NhbGUgdG8gZml0IHRoZSBmcmFtZSBhbmQgcG9pbnRzIGFyZSBzY2FsZWQgaW4gdGhlIHNhbWUgcmF0aW9cclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIEZyYW1pbmdTY2FsZWQgZXh0ZW5kcyBGcmFtaW5nIHtcclxuICAgICAgICBwdWJsaWMgbm9ybVdpZHRoOiBudW1iZXIgPSAxLjA7XHJcbiAgICAgICAgcHVibGljIG5vcm1IZWlnaHQ6IG51bWJlciA9IDEuMDtcclxuXHJcbiAgICAgICAgcHVibGljIHNldFNjYWxlKF9ub3JtV2lkdGg6IG51bWJlciwgX25vcm1IZWlnaHQ6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLm5vcm1XaWR0aCA9IF9ub3JtV2lkdGg7XHJcbiAgICAgICAgICAgIHRoaXMubm9ybUhlaWdodCA9IF9ub3JtSGVpZ2h0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldFBvaW50KF9wb2ludEluRnJhbWU6IFZlY3RvcjIsIF9yZWN0RnJhbWU6IFJlY3RhbmdsZSk6IFZlY3RvcjIge1xyXG4gICAgICAgICAgICBsZXQgcmVzdWx0OiBWZWN0b3IyID0gbmV3IFZlY3RvcjIoXHJcbiAgICAgICAgICAgICAgICB0aGlzLm5vcm1XaWR0aCAqIChfcG9pbnRJbkZyYW1lLnggLSBfcmVjdEZyYW1lLngpLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5ub3JtSGVpZ2h0ICogKF9wb2ludEluRnJhbWUueSAtIF9yZWN0RnJhbWUueSlcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRQb2ludEludmVyc2UoX3BvaW50OiBWZWN0b3IyLCBfcmVjdDogUmVjdGFuZ2xlKTogVmVjdG9yMiB7XHJcbiAgICAgICAgICAgIGxldCByZXN1bHQ6IFZlY3RvcjIgPSBuZXcgVmVjdG9yMihcclxuICAgICAgICAgICAgICAgIF9wb2ludC54IC8gdGhpcy5ub3JtV2lkdGggKyBfcmVjdC54LFxyXG4gICAgICAgICAgICAgICAgX3BvaW50LnkgLyB0aGlzLm5vcm1IZWlnaHQgKyBfcmVjdC55XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0UmVjdChfcmVjdEZyYW1lOiBSZWN0YW5nbGUpOiBSZWN0YW5nbGUge1xyXG4gICAgICAgICAgICByZXR1cm4gUmVjdGFuZ2xlLkdFVCgwLCAwLCB0aGlzLm5vcm1XaWR0aCAqIF9yZWN0RnJhbWUud2lkdGgsIHRoaXMubm9ybUhlaWdodCAqIF9yZWN0RnJhbWUuaGVpZ2h0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgcmVzdWx0aW5nIHJlY3RhbmdsZSBmaXRzIGludG8gYSBtYXJnaW4gZ2l2ZW4gYXMgZnJhY3Rpb25zIG9mIHRoZSBzaXplIG9mIHRoZSBmcmFtZSBnaXZlbiBieSBub3JtQW5jaG9yXHJcbiAgICAgKiBwbHVzIGFuIGFic29sdXRlIHBhZGRpbmcgZ2l2ZW4gYnkgcGl4ZWxCb3JkZXIuIERpc3BsYXkgc2hvdWxkIGZpdCBpbnRvIHRoaXMuXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBGcmFtaW5nQ29tcGxleCBleHRlbmRzIEZyYW1pbmcge1xyXG4gICAgICAgIHB1YmxpYyBtYXJnaW46IEJvcmRlciA9IHsgbGVmdDogMCwgdG9wOiAwLCByaWdodDogMCwgYm90dG9tOiAwIH07XHJcbiAgICAgICAgcHVibGljIHBhZGRpbmc6IEJvcmRlciA9IHsgbGVmdDogMCwgdG9wOiAwLCByaWdodDogMCwgYm90dG9tOiAwIH07XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRQb2ludChfcG9pbnRJbkZyYW1lOiBWZWN0b3IyLCBfcmVjdEZyYW1lOiBSZWN0YW5nbGUpOiBWZWN0b3IyIHtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdDogVmVjdG9yMiA9IG5ldyBWZWN0b3IyKFxyXG4gICAgICAgICAgICAgICAgX3BvaW50SW5GcmFtZS54IC0gdGhpcy5wYWRkaW5nLmxlZnQgLSB0aGlzLm1hcmdpbi5sZWZ0ICogX3JlY3RGcmFtZS53aWR0aCxcclxuICAgICAgICAgICAgICAgIF9wb2ludEluRnJhbWUueSAtIHRoaXMucGFkZGluZy50b3AgLSB0aGlzLm1hcmdpbi50b3AgKiBfcmVjdEZyYW1lLmhlaWdodFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBwdWJsaWMgZ2V0UG9pbnRJbnZlcnNlKF9wb2ludDogVmVjdG9yMiwgX3JlY3Q6IFJlY3RhbmdsZSk6IFZlY3RvcjIge1xyXG4gICAgICAgICAgICBsZXQgcmVzdWx0OiBWZWN0b3IyID0gbmV3IFZlY3RvcjIoXHJcbiAgICAgICAgICAgICAgICBfcG9pbnQueCArIHRoaXMucGFkZGluZy5sZWZ0ICsgdGhpcy5tYXJnaW4ubGVmdCAqIF9yZWN0LndpZHRoLFxyXG4gICAgICAgICAgICAgICAgX3BvaW50LnkgKyB0aGlzLnBhZGRpbmcudG9wICsgdGhpcy5tYXJnaW4udG9wICogX3JlY3QuaGVpZ2h0XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0UmVjdChfcmVjdEZyYW1lOiBSZWN0YW5nbGUpOiBSZWN0YW5nbGUge1xyXG4gICAgICAgICAgICBpZiAoIV9yZWN0RnJhbWUpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIGxldCBtaW5YOiBudW1iZXIgPSBfcmVjdEZyYW1lLnggKyB0aGlzLm1hcmdpbi5sZWZ0ICogX3JlY3RGcmFtZS53aWR0aCArIHRoaXMucGFkZGluZy5sZWZ0O1xyXG4gICAgICAgICAgICBsZXQgbWluWTogbnVtYmVyID0gX3JlY3RGcmFtZS55ICsgdGhpcy5tYXJnaW4udG9wICogX3JlY3RGcmFtZS5oZWlnaHQgKyB0aGlzLnBhZGRpbmcudG9wO1xyXG4gICAgICAgICAgICBsZXQgbWF4WDogbnVtYmVyID0gX3JlY3RGcmFtZS54ICsgKDEgLSB0aGlzLm1hcmdpbi5yaWdodCkgKiBfcmVjdEZyYW1lLndpZHRoIC0gdGhpcy5wYWRkaW5nLnJpZ2h0O1xyXG4gICAgICAgICAgICBsZXQgbWF4WTogbnVtYmVyID0gX3JlY3RGcmFtZS55ICsgKDEgLSB0aGlzLm1hcmdpbi5ib3R0b20pICogX3JlY3RGcmFtZS5oZWlnaHQgLSB0aGlzLnBhZGRpbmcuYm90dG9tO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIFJlY3RhbmdsZS5HRVQobWluWCwgbWluWSwgbWF4WCAtIG1pblgsIG1heFkgLSBtaW5ZKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXRNdXRhdG9yKCk6IE11dGF0b3Ige1xyXG4gICAgICAgICAgICByZXR1cm4geyBtYXJnaW46IHRoaXMubWFyZ2luLCBwYWRkaW5nOiB0aGlzLnBhZGRpbmcgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNpbXBsZSBjbGFzcyBmb3IgM3gzIG1hdHJpeCBvcGVyYXRpb25zIChUaGlzIGNsYXNzIGNhbiBvbmx5IGhhbmRsZSAyRFxyXG4gICAgICogdHJhbnNmb3JtYXRpb25zLiBDb3VsZCBiZSByZW1vdmVkIGFmdGVyIGFwcGx5aW5nIGZ1bGwgMkQgY29tcGF0aWJpbGl0eSB0byBNYXQ0KS5cclxuICAgICAqIEBhdXRob3JzIEphc2NoYSBLYXJhZ8O2bCwgSEZVLCAyMDE5IHwgSmlya2EgRGVsbCdPcm8tRnJpZWRsLCBIRlUsIDIwMTlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIE1hdHJpeDN4MyB7XHJcblxyXG4gICAgICAgIHB1YmxpYyBkYXRhOiBudW1iZXJbXTtcclxuXHJcbiAgICAgICAgcHVibGljIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBbXHJcbiAgICAgICAgICAgICAgICAxLCAwLCAwLFxyXG4gICAgICAgICAgICAgICAgMCwgMSwgMCxcclxuICAgICAgICAgICAgICAgIDAsIDAsIDFcclxuICAgICAgICAgICAgXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgcHJvamVjdGlvbihfd2lkdGg6IG51bWJlciwgX2hlaWdodDogbnVtYmVyKTogTWF0cml4M3gzIHtcclxuICAgICAgICAgICAgbGV0IG1hdHJpeDogTWF0cml4M3gzID0gbmV3IE1hdHJpeDN4MztcclxuICAgICAgICAgICAgbWF0cml4LmRhdGEgPSBbXHJcbiAgICAgICAgICAgICAgICAyIC8gX3dpZHRoLCAwLCAwLFxyXG4gICAgICAgICAgICAgICAgMCwgLTIgLyBfaGVpZ2h0LCAwLFxyXG4gICAgICAgICAgICAgICAgLTEsIDEsIDFcclxuICAgICAgICAgICAgXTtcclxuICAgICAgICAgICAgcmV0dXJuIG1hdHJpeDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXQgRGF0YSgpOiBudW1iZXJbXSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgaWRlbnRpdHkoKTogTWF0cml4M3gzIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBNYXRyaXgzeDM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHB1YmxpYyB0cmFuc2xhdGUoX21hdHJpeDogTWF0cml4M3gzLCBfeFRyYW5zbGF0aW9uOiBudW1iZXIsIF95VHJhbnNsYXRpb246IG51bWJlcik6IE1hdHJpeDN4MyB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm11bHRpcGx5KF9tYXRyaXgsIHRoaXMudHJhbnNsYXRpb24oX3hUcmFuc2xhdGlvbiwgX3lUcmFuc2xhdGlvbikpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHJvdGF0ZShfbWF0cml4OiBNYXRyaXgzeDMsIF9hbmdsZUluRGVncmVlczogbnVtYmVyKTogTWF0cml4M3gzIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubXVsdGlwbHkoX21hdHJpeCwgdGhpcy5yb3RhdGlvbihfYW5nbGVJbkRlZ3JlZXMpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzY2FsZShfbWF0cml4OiBNYXRyaXgzeDMsIF94U2NhbGU6IG51bWJlciwgX3lzY2FsZTogbnVtYmVyKTogTWF0cml4M3gzIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubXVsdGlwbHkoX21hdHJpeCwgdGhpcy5zY2FsaW5nKF94U2NhbGUsIF95c2NhbGUpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBtdWx0aXBseShfYTogTWF0cml4M3gzLCBfYjogTWF0cml4M3gzKTogTWF0cml4M3gzIHtcclxuICAgICAgICAgICAgbGV0IGEwMDogbnVtYmVyID0gX2EuZGF0YVswICogMyArIDBdO1xyXG4gICAgICAgICAgICBsZXQgYTAxOiBudW1iZXIgPSBfYS5kYXRhWzAgKiAzICsgMV07XHJcbiAgICAgICAgICAgIGxldCBhMDI6IG51bWJlciA9IF9hLmRhdGFbMCAqIDMgKyAyXTtcclxuICAgICAgICAgICAgbGV0IGExMDogbnVtYmVyID0gX2EuZGF0YVsxICogMyArIDBdO1xyXG4gICAgICAgICAgICBsZXQgYTExOiBudW1iZXIgPSBfYS5kYXRhWzEgKiAzICsgMV07XHJcbiAgICAgICAgICAgIGxldCBhMTI6IG51bWJlciA9IF9hLmRhdGFbMSAqIDMgKyAyXTtcclxuICAgICAgICAgICAgbGV0IGEyMDogbnVtYmVyID0gX2EuZGF0YVsyICogMyArIDBdO1xyXG4gICAgICAgICAgICBsZXQgYTIxOiBudW1iZXIgPSBfYS5kYXRhWzIgKiAzICsgMV07XHJcbiAgICAgICAgICAgIGxldCBhMjI6IG51bWJlciA9IF9hLmRhdGFbMiAqIDMgKyAyXTtcclxuICAgICAgICAgICAgbGV0IGIwMDogbnVtYmVyID0gX2IuZGF0YVswICogMyArIDBdO1xyXG4gICAgICAgICAgICBsZXQgYjAxOiBudW1iZXIgPSBfYi5kYXRhWzAgKiAzICsgMV07XHJcbiAgICAgICAgICAgIGxldCBiMDI6IG51bWJlciA9IF9iLmRhdGFbMCAqIDMgKyAyXTtcclxuICAgICAgICAgICAgbGV0IGIxMDogbnVtYmVyID0gX2IuZGF0YVsxICogMyArIDBdO1xyXG4gICAgICAgICAgICBsZXQgYjExOiBudW1iZXIgPSBfYi5kYXRhWzEgKiAzICsgMV07XHJcbiAgICAgICAgICAgIGxldCBiMTI6IG51bWJlciA9IF9iLmRhdGFbMSAqIDMgKyAyXTtcclxuICAgICAgICAgICAgbGV0IGIyMDogbnVtYmVyID0gX2IuZGF0YVsyICogMyArIDBdO1xyXG4gICAgICAgICAgICBsZXQgYjIxOiBudW1iZXIgPSBfYi5kYXRhWzIgKiAzICsgMV07XHJcbiAgICAgICAgICAgIGxldCBiMjI6IG51bWJlciA9IF9iLmRhdGFbMiAqIDMgKyAyXTtcclxuICAgICAgICAgICAgbGV0IG1hdHJpeDogTWF0cml4M3gzID0gbmV3IE1hdHJpeDN4MztcclxuICAgICAgICAgICAgbWF0cml4LmRhdGEgPSBbXHJcbiAgICAgICAgICAgICAgICBiMDAgKiBhMDAgKyBiMDEgKiBhMTAgKyBiMDIgKiBhMjAsXHJcbiAgICAgICAgICAgICAgICBiMDAgKiBhMDEgKyBiMDEgKiBhMTEgKyBiMDIgKiBhMjEsXHJcbiAgICAgICAgICAgICAgICBiMDAgKiBhMDIgKyBiMDEgKiBhMTIgKyBiMDIgKiBhMjIsXHJcbiAgICAgICAgICAgICAgICBiMTAgKiBhMDAgKyBiMTEgKiBhMTAgKyBiMTIgKiBhMjAsXHJcbiAgICAgICAgICAgICAgICBiMTAgKiBhMDEgKyBiMTEgKiBhMTEgKyBiMTIgKiBhMjEsXHJcbiAgICAgICAgICAgICAgICBiMTAgKiBhMDIgKyBiMTEgKiBhMTIgKyBiMTIgKiBhMjIsXHJcbiAgICAgICAgICAgICAgICBiMjAgKiBhMDAgKyBiMjEgKiBhMTAgKyBiMjIgKiBhMjAsXHJcbiAgICAgICAgICAgICAgICBiMjAgKiBhMDEgKyBiMjEgKiBhMTEgKyBiMjIgKiBhMjEsXHJcbiAgICAgICAgICAgICAgICBiMjAgKiBhMDIgKyBiMjEgKiBhMTIgKyBiMjIgKiBhMjJcclxuICAgICAgICAgICAgXTtcclxuICAgICAgICAgICAgcmV0dXJuIG1hdHJpeDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdHJhbnNsYXRpb24oX3hUcmFuc2xhdGlvbjogbnVtYmVyLCBfeVRyYW5zbGF0aW9uOiBudW1iZXIpOiBNYXRyaXgzeDMge1xyXG4gICAgICAgICAgICBsZXQgbWF0cml4OiBNYXRyaXgzeDMgPSBuZXcgTWF0cml4M3gzO1xyXG4gICAgICAgICAgICBtYXRyaXguZGF0YSA9IFtcclxuICAgICAgICAgICAgICAgIDEsIDAsIDAsXHJcbiAgICAgICAgICAgICAgICAwLCAxLCAwLFxyXG4gICAgICAgICAgICAgICAgX3hUcmFuc2xhdGlvbiwgX3lUcmFuc2xhdGlvbiwgMVxyXG4gICAgICAgICAgICBdO1xyXG4gICAgICAgICAgICByZXR1cm4gbWF0cml4O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzY2FsaW5nKF94U2NhbGU6IG51bWJlciwgX3lTY2FsZTogbnVtYmVyKTogTWF0cml4M3gzIHtcclxuICAgICAgICAgICAgbGV0IG1hdHJpeDogTWF0cml4M3gzID0gbmV3IE1hdHJpeDN4MztcclxuICAgICAgICAgICAgbWF0cml4LmRhdGEgPSBbXHJcbiAgICAgICAgICAgICAgICBfeFNjYWxlLCAwLCAwLFxyXG4gICAgICAgICAgICAgICAgMCwgX3lTY2FsZSwgMCxcclxuICAgICAgICAgICAgICAgIDAsIDAsIDFcclxuICAgICAgICAgICAgXTtcclxuICAgICAgICAgICAgcmV0dXJuIG1hdHJpeDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgcm90YXRpb24oX2FuZ2xlSW5EZWdyZWVzOiBudW1iZXIpOiBNYXRyaXgzeDMge1xyXG4gICAgICAgICAgICBsZXQgYW5nbGVJbkRlZ3JlZXM6IG51bWJlciA9IDM2MCAtIF9hbmdsZUluRGVncmVlcztcclxuICAgICAgICAgICAgbGV0IGFuZ2xlSW5SYWRpYW5zOiBudW1iZXIgPSBhbmdsZUluRGVncmVlcyAqIE1hdGguUEkgLyAxODA7XHJcbiAgICAgICAgICAgIGxldCBzaW46IG51bWJlciA9IE1hdGguc2luKGFuZ2xlSW5SYWRpYW5zKTtcclxuICAgICAgICAgICAgbGV0IGNvczogbnVtYmVyID0gTWF0aC5jb3MoYW5nbGVJblJhZGlhbnMpO1xyXG4gICAgICAgICAgICBsZXQgbWF0cml4OiBNYXRyaXgzeDMgPSBuZXcgTWF0cml4M3gzO1xyXG4gICAgICAgICAgICBtYXRyaXguZGF0YSA9IFtcclxuICAgICAgICAgICAgICAgIGNvcywgLXNpbiwgMCxcclxuICAgICAgICAgICAgICAgIHNpbiwgY29zLCAwLFxyXG4gICAgICAgICAgICAgICAgMCwgMCwgMVxyXG4gICAgICAgICAgICBdO1xyXG4gICAgICAgICAgICByZXR1cm4gbWF0cml4O1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgfVxyXG5cclxufVxyXG4iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogUmVwcmVzZW50cyB0aGUgbWF0cml4IGFzIHRyYW5zbGF0aW9uLCByb3RhdGlvbiBhbmQgc2NhbGluZyB2ZWN0b3IsIGJlaW5nIGNhbGN1bGF0ZWQgZnJvbSB0aGUgbWF0cml4XHJcbiAgICovXHJcbiAgaW50ZXJmYWNlIFZlY3RvclJlcHJlc2VudGF0aW9uIHtcclxuICAgIHRyYW5zbGF0aW9uOiBWZWN0b3IzO1xyXG4gICAgcm90YXRpb246IFZlY3RvcjM7XHJcbiAgICBzY2FsaW5nOiBWZWN0b3IzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RvcmVzIGEgNHg0IHRyYW5zZm9ybWF0aW9uIG1hdHJpeCBhbmQgcHJvdmlkZXMgb3BlcmF0aW9ucyBmb3IgaXQuXHJcbiAgICogYGBgcGxhaW50ZXh0XHJcbiAgICogWyAwLCAxLCAyLCAzIF0g4oaQIHJvdyB2ZWN0b3IgeFxyXG4gICAqIFsgNCwgNSwgNiwgNyBdIOKGkCByb3cgdmVjdG9yIHlcclxuICAgKiBbIDgsIDksMTAsMTEgXSDihpAgcm93IHZlY3RvciB6XHJcbiAgICogWzEyLDEzLDE0LDE1IF0g4oaQIHRyYW5zbGF0aW9uXHJcbiAgICogICAgICAgICAgICDihpEgIGhvbW9nZW5lb3VzIGNvbHVtblxyXG4gICAqIGBgYFxyXG4gICAqIEBhdXRob3JzIEphc2NoYSBLYXJhZ8O2bCwgSEZVLCAyMDE5IHwgSmlya2EgRGVsbCdPcm8tRnJpZWRsLCBIRlUsIDIwMTlcclxuICAgKi9cclxuXHJcbiAgZXhwb3J0IGNsYXNzIE1hdHJpeDR4NCBleHRlbmRzIE11dGFibGUgaW1wbGVtZW50cyBTZXJpYWxpemFibGUge1xyXG4gICAgcHJpdmF0ZSBkYXRhOiBGbG9hdDMyQXJyYXkgPSBuZXcgRmxvYXQzMkFycmF5KDE2KTsgLy8gVGhlIGRhdGEgb2YgdGhlIG1hdHJpeC5cclxuICAgIHByaXZhdGUgbXV0YXRvcjogTXV0YXRvciA9IG51bGw7IC8vIHByZXBhcmVkIGZvciBvcHRpbWl6YXRpb24sIGtlZXAgbXV0YXRvciB0byByZWR1Y2UgcmVkdW5kYW50IGNhbGN1bGF0aW9uIGFuZCBmb3IgY29tcGFyaXNvbi4gU2V0IHRvIG51bGwgd2hlbiBkYXRhIGNoYW5nZXMhXHJcbiAgICBwcml2YXRlIHZlY3RvcnM6IFZlY3RvclJlcHJlc2VudGF0aW9uOyAvLyB2ZWN0b3IgcmVwcmVzZW50YXRpb24gb2YgXHJcblxyXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICBzdXBlcigpO1xyXG4gICAgICB0aGlzLmRhdGEuc2V0KFtcclxuICAgICAgICAxLCAwLCAwLCAwLFxyXG4gICAgICAgIDAsIDEsIDAsIDAsXHJcbiAgICAgICAgMCwgMCwgMSwgMCxcclxuICAgICAgICAwLCAwLCAwLCAxXHJcbiAgICAgIF0pO1xyXG4gICAgICB0aGlzLnJlc2V0Q2FjaGUoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKiogXHJcbiAgICAgKiAtIGdldDogYSBjb3B5IG9mIHRoZSBjYWxjdWxhdGVkIHRyYW5zbGF0aW9uIHZlY3RvciAgIFxyXG4gICAgICogLSBzZXQ6IGVmZmVjdCB0aGUgbWF0cml4IGlnbm9yaW5nIGl0cyByb3RhdGlvbiBhbmQgc2NhbGluZ1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IHRyYW5zbGF0aW9uKCk6IFZlY3RvcjMge1xyXG4gICAgICBpZiAoIXRoaXMudmVjdG9ycy50cmFuc2xhdGlvbilcclxuICAgICAgICB0aGlzLnZlY3RvcnMudHJhbnNsYXRpb24gPSBuZXcgVmVjdG9yMyh0aGlzLmRhdGFbMTJdLCB0aGlzLmRhdGFbMTNdLCB0aGlzLmRhdGFbMTRdKTtcclxuICAgICAgcmV0dXJuIHRoaXMudmVjdG9ycy50cmFuc2xhdGlvbi5jb3B5O1xyXG4gICAgfVxyXG4gICAgcHVibGljIHNldCB0cmFuc2xhdGlvbihfdHJhbnNsYXRpb246IFZlY3RvcjMpIHtcclxuICAgICAgdGhpcy5kYXRhLnNldChfdHJhbnNsYXRpb24uZ2V0KCksIDEyKTtcclxuICAgICAgLy8gbm8gZnVsbCBjYWNoZSByZXNldCByZXF1aXJlZFxyXG4gICAgICB0aGlzLnZlY3RvcnMudHJhbnNsYXRpb24gPSBfdHJhbnNsYXRpb247XHJcbiAgICAgIHRoaXMubXV0YXRvciA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIFxyXG4gICAgICogLSBnZXQ6IGEgY29weSBvZiB0aGUgY2FsY3VsYXRlZCByb3RhdGlvbiB2ZWN0b3IgICBcclxuICAgICAqIC0gc2V0OiBlZmZlY3QgdGhlIG1hdHJpeFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IHJvdGF0aW9uKCk6IFZlY3RvcjMge1xyXG4gICAgICBpZiAoIXRoaXMudmVjdG9ycy5yb3RhdGlvbilcclxuICAgICAgICB0aGlzLnZlY3RvcnMucm90YXRpb24gPSB0aGlzLmdldEV1bGVyQW5nbGVzKCk7XHJcbiAgICAgIHJldHVybiB0aGlzLnZlY3RvcnMucm90YXRpb24uY29weTtcclxuICAgIH1cclxuICAgIHB1YmxpYyBzZXQgcm90YXRpb24oX3JvdGF0aW9uOiBWZWN0b3IzKSB7XHJcbiAgICAgIHRoaXMubXV0YXRlKHsgXCJyb3RhdGlvblwiOiBfcm90YXRpb24gfSk7XHJcbiAgICAgIHRoaXMucmVzZXRDYWNoZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBcclxuICAgICAqIC0gZ2V0OiBhIGNvcHkgb2YgdGhlIGNhbGN1bGF0ZWQgc2NhbGUgdmVjdG9yICAgXHJcbiAgICAgKiAtIHNldDogZWZmZWN0IHRoZSBtYXRyaXhcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBzY2FsaW5nKCk6IFZlY3RvcjMge1xyXG4gICAgICBpZiAoIXRoaXMudmVjdG9ycy5zY2FsaW5nKVxyXG4gICAgICAgIHRoaXMudmVjdG9ycy5zY2FsaW5nID0gbmV3IFZlY3RvcjMoXHJcbiAgICAgICAgICBNYXRoLmh5cG90KHRoaXMuZGF0YVswXSwgdGhpcy5kYXRhWzFdLCB0aGlzLmRhdGFbMl0pLFxyXG4gICAgICAgICAgTWF0aC5oeXBvdCh0aGlzLmRhdGFbNF0sIHRoaXMuZGF0YVs1XSwgdGhpcy5kYXRhWzZdKSxcclxuICAgICAgICAgIE1hdGguaHlwb3QodGhpcy5kYXRhWzhdLCB0aGlzLmRhdGFbOV0sIHRoaXMuZGF0YVsxMF0pXHJcbiAgICAgICAgKTtcclxuICAgICAgcmV0dXJuIHRoaXMudmVjdG9ycy5zY2FsaW5nLmNvcHk7XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgc2V0IHNjYWxpbmcoX3NjYWxpbmc6IFZlY3RvcjMpIHtcclxuICAgICAgdGhpcy5tdXRhdGUoeyBcInNjYWxpbmdcIjogX3NjYWxpbmcgfSk7XHJcbiAgICAgIHRoaXMucmVzZXRDYWNoZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vI3JlZ2lvbiBTVEFUSUNTXHJcbiAgICAvKipcclxuICAgICAqIFJldHJpZXZlIGEgbmV3IGlkZW50aXR5IG1hdHJpeFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIGdldCBJREVOVElUWSgpOiBNYXRyaXg0eDQge1xyXG4gICAgICAvLyBjb25zdCByZXN1bHQ6IE1hdHJpeDR4NCA9IG5ldyBNYXRyaXg0eDQoKTtcclxuICAgICAgY29uc3QgcmVzdWx0OiBNYXRyaXg0eDQgPSBSZWN5Y2xlci5nZXQoTWF0cml4NHg0KTtcclxuICAgICAgcmVzdWx0LmRhdGEuc2V0KFtcclxuICAgICAgICAxLCAwLCAwLCAwLFxyXG4gICAgICAgIDAsIDEsIDAsIDAsXHJcbiAgICAgICAgMCwgMCwgMSwgMCxcclxuICAgICAgICAwLCAwLCAwLCAxXHJcbiAgICAgIF0pO1xyXG4gICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29tcHV0ZXMgYW5kIHJldHVybnMgdGhlIHByb2R1Y3Qgb2YgdHdvIHBhc3NlZCBtYXRyaWNlcy5cclxuICAgICAqIEBwYXJhbSBfYSBUaGUgbWF0cml4IHRvIG11bHRpcGx5LlxyXG4gICAgICogQHBhcmFtIF9iIFRoZSBtYXRyaXggdG8gbXVsdGlwbHkgYnkuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgTVVMVElQTElDQVRJT04oX2E6IE1hdHJpeDR4NCwgX2I6IE1hdHJpeDR4NCk6IE1hdHJpeDR4NCB7XHJcbiAgICAgIGxldCBhOiBGbG9hdDMyQXJyYXkgPSBfYS5kYXRhO1xyXG4gICAgICBsZXQgYjogRmxvYXQzMkFycmF5ID0gX2IuZGF0YTtcclxuICAgICAgLy8gbGV0IG1hdHJpeDogTWF0cml4NHg0ID0gbmV3IE1hdHJpeDR4NCgpO1xyXG4gICAgICBjb25zdCBtYXRyaXg6IE1hdHJpeDR4NCA9IFJlY3ljbGVyLmdldChNYXRyaXg0eDQpO1xyXG4gICAgICBsZXQgYTAwOiBudW1iZXIgPSBhWzAgKiA0ICsgMF07XHJcbiAgICAgIGxldCBhMDE6IG51bWJlciA9IGFbMCAqIDQgKyAxXTtcclxuICAgICAgbGV0IGEwMjogbnVtYmVyID0gYVswICogNCArIDJdO1xyXG4gICAgICBsZXQgYTAzOiBudW1iZXIgPSBhWzAgKiA0ICsgM107XHJcbiAgICAgIGxldCBhMTA6IG51bWJlciA9IGFbMSAqIDQgKyAwXTtcclxuICAgICAgbGV0IGExMTogbnVtYmVyID0gYVsxICogNCArIDFdO1xyXG4gICAgICBsZXQgYTEyOiBudW1iZXIgPSBhWzEgKiA0ICsgMl07XHJcbiAgICAgIGxldCBhMTM6IG51bWJlciA9IGFbMSAqIDQgKyAzXTtcclxuICAgICAgbGV0IGEyMDogbnVtYmVyID0gYVsyICogNCArIDBdO1xyXG4gICAgICBsZXQgYTIxOiBudW1iZXIgPSBhWzIgKiA0ICsgMV07XHJcbiAgICAgIGxldCBhMjI6IG51bWJlciA9IGFbMiAqIDQgKyAyXTtcclxuICAgICAgbGV0IGEyMzogbnVtYmVyID0gYVsyICogNCArIDNdO1xyXG4gICAgICBsZXQgYTMwOiBudW1iZXIgPSBhWzMgKiA0ICsgMF07XHJcbiAgICAgIGxldCBhMzE6IG51bWJlciA9IGFbMyAqIDQgKyAxXTtcclxuICAgICAgbGV0IGEzMjogbnVtYmVyID0gYVszICogNCArIDJdO1xyXG4gICAgICBsZXQgYTMzOiBudW1iZXIgPSBhWzMgKiA0ICsgM107XHJcbiAgICAgIGxldCBiMDA6IG51bWJlciA9IGJbMCAqIDQgKyAwXTtcclxuICAgICAgbGV0IGIwMTogbnVtYmVyID0gYlswICogNCArIDFdO1xyXG4gICAgICBsZXQgYjAyOiBudW1iZXIgPSBiWzAgKiA0ICsgMl07XHJcbiAgICAgIGxldCBiMDM6IG51bWJlciA9IGJbMCAqIDQgKyAzXTtcclxuICAgICAgbGV0IGIxMDogbnVtYmVyID0gYlsxICogNCArIDBdO1xyXG4gICAgICBsZXQgYjExOiBudW1iZXIgPSBiWzEgKiA0ICsgMV07XHJcbiAgICAgIGxldCBiMTI6IG51bWJlciA9IGJbMSAqIDQgKyAyXTtcclxuICAgICAgbGV0IGIxMzogbnVtYmVyID0gYlsxICogNCArIDNdO1xyXG4gICAgICBsZXQgYjIwOiBudW1iZXIgPSBiWzIgKiA0ICsgMF07XHJcbiAgICAgIGxldCBiMjE6IG51bWJlciA9IGJbMiAqIDQgKyAxXTtcclxuICAgICAgbGV0IGIyMjogbnVtYmVyID0gYlsyICogNCArIDJdO1xyXG4gICAgICBsZXQgYjIzOiBudW1iZXIgPSBiWzIgKiA0ICsgM107XHJcbiAgICAgIGxldCBiMzA6IG51bWJlciA9IGJbMyAqIDQgKyAwXTtcclxuICAgICAgbGV0IGIzMTogbnVtYmVyID0gYlszICogNCArIDFdO1xyXG4gICAgICBsZXQgYjMyOiBudW1iZXIgPSBiWzMgKiA0ICsgMl07XHJcbiAgICAgIGxldCBiMzM6IG51bWJlciA9IGJbMyAqIDQgKyAzXTtcclxuICAgICAgbWF0cml4LmRhdGEuc2V0KFxyXG4gICAgICAgIFtcclxuICAgICAgICAgIGIwMCAqIGEwMCArIGIwMSAqIGExMCArIGIwMiAqIGEyMCArIGIwMyAqIGEzMCxcclxuICAgICAgICAgIGIwMCAqIGEwMSArIGIwMSAqIGExMSArIGIwMiAqIGEyMSArIGIwMyAqIGEzMSxcclxuICAgICAgICAgIGIwMCAqIGEwMiArIGIwMSAqIGExMiArIGIwMiAqIGEyMiArIGIwMyAqIGEzMixcclxuICAgICAgICAgIGIwMCAqIGEwMyArIGIwMSAqIGExMyArIGIwMiAqIGEyMyArIGIwMyAqIGEzMyxcclxuICAgICAgICAgIGIxMCAqIGEwMCArIGIxMSAqIGExMCArIGIxMiAqIGEyMCArIGIxMyAqIGEzMCxcclxuICAgICAgICAgIGIxMCAqIGEwMSArIGIxMSAqIGExMSArIGIxMiAqIGEyMSArIGIxMyAqIGEzMSxcclxuICAgICAgICAgIGIxMCAqIGEwMiArIGIxMSAqIGExMiArIGIxMiAqIGEyMiArIGIxMyAqIGEzMixcclxuICAgICAgICAgIGIxMCAqIGEwMyArIGIxMSAqIGExMyArIGIxMiAqIGEyMyArIGIxMyAqIGEzMyxcclxuICAgICAgICAgIGIyMCAqIGEwMCArIGIyMSAqIGExMCArIGIyMiAqIGEyMCArIGIyMyAqIGEzMCxcclxuICAgICAgICAgIGIyMCAqIGEwMSArIGIyMSAqIGExMSArIGIyMiAqIGEyMSArIGIyMyAqIGEzMSxcclxuICAgICAgICAgIGIyMCAqIGEwMiArIGIyMSAqIGExMiArIGIyMiAqIGEyMiArIGIyMyAqIGEzMixcclxuICAgICAgICAgIGIyMCAqIGEwMyArIGIyMSAqIGExMyArIGIyMiAqIGEyMyArIGIyMyAqIGEzMyxcclxuICAgICAgICAgIGIzMCAqIGEwMCArIGIzMSAqIGExMCArIGIzMiAqIGEyMCArIGIzMyAqIGEzMCxcclxuICAgICAgICAgIGIzMCAqIGEwMSArIGIzMSAqIGExMSArIGIzMiAqIGEyMSArIGIzMyAqIGEzMSxcclxuICAgICAgICAgIGIzMCAqIGEwMiArIGIzMSAqIGExMiArIGIzMiAqIGEyMiArIGIzMyAqIGEzMixcclxuICAgICAgICAgIGIzMCAqIGEwMyArIGIzMSAqIGExMyArIGIzMiAqIGEyMyArIGIzMyAqIGEzM1xyXG4gICAgICAgIF0pO1xyXG4gICAgICByZXR1cm4gbWF0cml4O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29tcHV0ZXMgYW5kIHJldHVybnMgdGhlIGludmVyc2Ugb2YgYSBwYXNzZWQgbWF0cml4LlxyXG4gICAgICogQHBhcmFtIF9tYXRyaXggVGhlIG1hdHJpeCB0byBjb21wdXRlIHRoZSBpbnZlcnNlIG9mLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIElOVkVSU0lPTihfbWF0cml4OiBNYXRyaXg0eDQpOiBNYXRyaXg0eDQge1xyXG4gICAgICBsZXQgbTogRmxvYXQzMkFycmF5ID0gX21hdHJpeC5kYXRhO1xyXG4gICAgICBsZXQgbTAwOiBudW1iZXIgPSBtWzAgKiA0ICsgMF07XHJcbiAgICAgIGxldCBtMDE6IG51bWJlciA9IG1bMCAqIDQgKyAxXTtcclxuICAgICAgbGV0IG0wMjogbnVtYmVyID0gbVswICogNCArIDJdO1xyXG4gICAgICBsZXQgbTAzOiBudW1iZXIgPSBtWzAgKiA0ICsgM107XHJcbiAgICAgIGxldCBtMTA6IG51bWJlciA9IG1bMSAqIDQgKyAwXTtcclxuICAgICAgbGV0IG0xMTogbnVtYmVyID0gbVsxICogNCArIDFdO1xyXG4gICAgICBsZXQgbTEyOiBudW1iZXIgPSBtWzEgKiA0ICsgMl07XHJcbiAgICAgIGxldCBtMTM6IG51bWJlciA9IG1bMSAqIDQgKyAzXTtcclxuICAgICAgbGV0IG0yMDogbnVtYmVyID0gbVsyICogNCArIDBdO1xyXG4gICAgICBsZXQgbTIxOiBudW1iZXIgPSBtWzIgKiA0ICsgMV07XHJcbiAgICAgIGxldCBtMjI6IG51bWJlciA9IG1bMiAqIDQgKyAyXTtcclxuICAgICAgbGV0IG0yMzogbnVtYmVyID0gbVsyICogNCArIDNdO1xyXG4gICAgICBsZXQgbTMwOiBudW1iZXIgPSBtWzMgKiA0ICsgMF07XHJcbiAgICAgIGxldCBtMzE6IG51bWJlciA9IG1bMyAqIDQgKyAxXTtcclxuICAgICAgbGV0IG0zMjogbnVtYmVyID0gbVszICogNCArIDJdO1xyXG4gICAgICBsZXQgbTMzOiBudW1iZXIgPSBtWzMgKiA0ICsgM107XHJcbiAgICAgIGxldCB0bXAwOiBudW1iZXIgPSBtMjIgKiBtMzM7XHJcbiAgICAgIGxldCB0bXAxOiBudW1iZXIgPSBtMzIgKiBtMjM7XHJcbiAgICAgIGxldCB0bXAyOiBudW1iZXIgPSBtMTIgKiBtMzM7XHJcbiAgICAgIGxldCB0bXAzOiBudW1iZXIgPSBtMzIgKiBtMTM7XHJcbiAgICAgIGxldCB0bXA0OiBudW1iZXIgPSBtMTIgKiBtMjM7XHJcbiAgICAgIGxldCB0bXA1OiBudW1iZXIgPSBtMjIgKiBtMTM7XHJcbiAgICAgIGxldCB0bXA2OiBudW1iZXIgPSBtMDIgKiBtMzM7XHJcbiAgICAgIGxldCB0bXA3OiBudW1iZXIgPSBtMzIgKiBtMDM7XHJcbiAgICAgIGxldCB0bXA4OiBudW1iZXIgPSBtMDIgKiBtMjM7XHJcbiAgICAgIGxldCB0bXA5OiBudW1iZXIgPSBtMjIgKiBtMDM7XHJcbiAgICAgIGxldCB0bXAxMDogbnVtYmVyID0gbTAyICogbTEzO1xyXG4gICAgICBsZXQgdG1wMTE6IG51bWJlciA9IG0xMiAqIG0wMztcclxuICAgICAgbGV0IHRtcDEyOiBudW1iZXIgPSBtMjAgKiBtMzE7XHJcbiAgICAgIGxldCB0bXAxMzogbnVtYmVyID0gbTMwICogbTIxO1xyXG4gICAgICBsZXQgdG1wMTQ6IG51bWJlciA9IG0xMCAqIG0zMTtcclxuICAgICAgbGV0IHRtcDE1OiBudW1iZXIgPSBtMzAgKiBtMTE7XHJcbiAgICAgIGxldCB0bXAxNjogbnVtYmVyID0gbTEwICogbTIxO1xyXG4gICAgICBsZXQgdG1wMTc6IG51bWJlciA9IG0yMCAqIG0xMTtcclxuICAgICAgbGV0IHRtcDE4OiBudW1iZXIgPSBtMDAgKiBtMzE7XHJcbiAgICAgIGxldCB0bXAxOTogbnVtYmVyID0gbTMwICogbTAxO1xyXG4gICAgICBsZXQgdG1wMjA6IG51bWJlciA9IG0wMCAqIG0yMTtcclxuICAgICAgbGV0IHRtcDIxOiBudW1iZXIgPSBtMjAgKiBtMDE7XHJcbiAgICAgIGxldCB0bXAyMjogbnVtYmVyID0gbTAwICogbTExO1xyXG4gICAgICBsZXQgdG1wMjM6IG51bWJlciA9IG0xMCAqIG0wMTtcclxuXHJcbiAgICAgIGxldCB0MDogbnVtYmVyID0gKHRtcDAgKiBtMTEgKyB0bXAzICogbTIxICsgdG1wNCAqIG0zMSkgLVxyXG4gICAgICAgICh0bXAxICogbTExICsgdG1wMiAqIG0yMSArIHRtcDUgKiBtMzEpO1xyXG5cclxuICAgICAgbGV0IHQxOiBudW1iZXIgPSAodG1wMSAqIG0wMSArIHRtcDYgKiBtMjEgKyB0bXA5ICogbTMxKSAtXHJcbiAgICAgICAgKHRtcDAgKiBtMDEgKyB0bXA3ICogbTIxICsgdG1wOCAqIG0zMSk7XHJcbiAgICAgIGxldCB0MjogbnVtYmVyID0gKHRtcDIgKiBtMDEgKyB0bXA3ICogbTExICsgdG1wMTAgKiBtMzEpIC1cclxuICAgICAgICAodG1wMyAqIG0wMSArIHRtcDYgKiBtMTEgKyB0bXAxMSAqIG0zMSk7XHJcbiAgICAgIGxldCB0MzogbnVtYmVyID0gKHRtcDUgKiBtMDEgKyB0bXA4ICogbTExICsgdG1wMTEgKiBtMjEpIC1cclxuICAgICAgICAodG1wNCAqIG0wMSArIHRtcDkgKiBtMTEgKyB0bXAxMCAqIG0yMSk7XHJcblxyXG4gICAgICBsZXQgZDogbnVtYmVyID0gMS4wIC8gKG0wMCAqIHQwICsgbTEwICogdDEgKyBtMjAgKiB0MiArIG0zMCAqIHQzKTtcclxuXHJcbiAgICAgIC8vIGxldCBtYXRyaXg6IE1hdHJpeDR4NCA9IG5ldyBNYXRyaXg0eDQ7XHJcbiAgICAgIGNvbnN0IG1hdHJpeDogTWF0cml4NHg0ID0gUmVjeWNsZXIuZ2V0KE1hdHJpeDR4NCk7XHJcbiAgICAgIG1hdHJpeC5kYXRhLnNldChbXHJcbiAgICAgICAgZCAqIHQwLCAvLyBbMF1cclxuICAgICAgICBkICogdDEsIC8vIFsxXVxyXG4gICAgICAgIGQgKiB0MiwgLy8gWzJdXHJcbiAgICAgICAgZCAqIHQzLCAvLyBbM11cclxuICAgICAgICBkICogKCh0bXAxICogbTEwICsgdG1wMiAqIG0yMCArIHRtcDUgKiBtMzApIC0gKHRtcDAgKiBtMTAgKyB0bXAzICogbTIwICsgdG1wNCAqIG0zMCkpLCAgICAgICAgLy8gWzRdXHJcbiAgICAgICAgZCAqICgodG1wMCAqIG0wMCArIHRtcDcgKiBtMjAgKyB0bXA4ICogbTMwKSAtICh0bXAxICogbTAwICsgdG1wNiAqIG0yMCArIHRtcDkgKiBtMzApKSwgICAgICAgIC8vIFs1XVxyXG4gICAgICAgIGQgKiAoKHRtcDMgKiBtMDAgKyB0bXA2ICogbTEwICsgdG1wMTEgKiBtMzApIC0gKHRtcDIgKiBtMDAgKyB0bXA3ICogbTEwICsgdG1wMTAgKiBtMzApKSwgICAgICAvLyBbNl1cclxuICAgICAgICBkICogKCh0bXA0ICogbTAwICsgdG1wOSAqIG0xMCArIHRtcDEwICogbTIwKSAtICh0bXA1ICogbTAwICsgdG1wOCAqIG0xMCArIHRtcDExICogbTIwKSksICAgICAgLy8gWzddXHJcbiAgICAgICAgZCAqICgodG1wMTIgKiBtMTMgKyB0bXAxNSAqIG0yMyArIHRtcDE2ICogbTMzKSAtICh0bXAxMyAqIG0xMyArIHRtcDE0ICogbTIzICsgdG1wMTcgKiBtMzMpKSwgIC8vIFs4XVxyXG4gICAgICAgIGQgKiAoKHRtcDEzICogbTAzICsgdG1wMTggKiBtMjMgKyB0bXAyMSAqIG0zMykgLSAodG1wMTIgKiBtMDMgKyB0bXAxOSAqIG0yMyArIHRtcDIwICogbTMzKSksICAvLyBbOV1cclxuICAgICAgICBkICogKCh0bXAxNCAqIG0wMyArIHRtcDE5ICogbTEzICsgdG1wMjIgKiBtMzMpIC0gKHRtcDE1ICogbTAzICsgdG1wMTggKiBtMTMgKyB0bXAyMyAqIG0zMykpLCAgLy8gWzEwXVxyXG4gICAgICAgIGQgKiAoKHRtcDE3ICogbTAzICsgdG1wMjAgKiBtMTMgKyB0bXAyMyAqIG0yMykgLSAodG1wMTYgKiBtMDMgKyB0bXAyMSAqIG0xMyArIHRtcDIyICogbTIzKSksICAvLyBbMTFdXHJcbiAgICAgICAgZCAqICgodG1wMTQgKiBtMjIgKyB0bXAxNyAqIG0zMiArIHRtcDEzICogbTEyKSAtICh0bXAxNiAqIG0zMiArIHRtcDEyICogbTEyICsgdG1wMTUgKiBtMjIpKSwgIC8vIFsxMl1cclxuICAgICAgICBkICogKCh0bXAyMCAqIG0zMiArIHRtcDEyICogbTAyICsgdG1wMTkgKiBtMjIpIC0gKHRtcDE4ICogbTIyICsgdG1wMjEgKiBtMzIgKyB0bXAxMyAqIG0wMikpLCAgLy8gWzEzXVxyXG4gICAgICAgIGQgKiAoKHRtcDE4ICogbTEyICsgdG1wMjMgKiBtMzIgKyB0bXAxNSAqIG0wMikgLSAodG1wMjIgKiBtMzIgKyB0bXAxNCAqIG0wMiArIHRtcDE5ICogbTEyKSksICAvLyBbMTRdXHJcbiAgICAgICAgZCAqICgodG1wMjIgKiBtMjIgKyB0bXAxNiAqIG0wMiArIHRtcDIxICogbTEyKSAtICh0bXAyMCAqIG0xMiArIHRtcDIzICogbTIyICsgdG1wMTcgKiBtMDIpKSAgLy8gWzE1XVxyXG4gICAgICBdKTtcclxuICAgICAgcmV0dXJuIG1hdHJpeDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbXB1dGVzIGFuZCByZXR1cm5zIGEgcm90YXRpb25tYXRyaXggdGhhdCBhbGlnbnMgYSB0cmFuc2Zvcm1hdGlvbnMgei1heGlzIHdpdGggdGhlIHZlY3RvciBiZXR3ZWVuIGl0IGFuZCBpdHMgdGFyZ2V0LlxyXG4gICAgICogQHBhcmFtIF90cmFuc2Zvcm1Qb3NpdGlvbiBUaGUgeCx5IGFuZCB6LWNvb3JkaW5hdGVzIG9mIHRoZSBvYmplY3QgdG8gcm90YXRlLlxyXG4gICAgICogQHBhcmFtIF90YXJnZXRQb3NpdGlvbiBUaGUgcG9zaXRpb24gdG8gbG9vayBhdC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBMT09LX0FUKF90cmFuc2Zvcm1Qb3NpdGlvbjogVmVjdG9yMywgX3RhcmdldFBvc2l0aW9uOiBWZWN0b3IzLCBfdXA6IFZlY3RvcjMgPSBWZWN0b3IzLlkoKSk6IE1hdHJpeDR4NCB7XHJcbiAgICAgIC8vIGNvbnN0IG1hdHJpeDogTWF0cml4NHg0ID0gbmV3IE1hdHJpeDR4NDtcclxuICAgICAgY29uc3QgbWF0cml4OiBNYXRyaXg0eDQgPSBSZWN5Y2xlci5nZXQoTWF0cml4NHg0KTtcclxuICAgICAgbGV0IHpBeGlzOiBWZWN0b3IzID0gVmVjdG9yMy5ESUZGRVJFTkNFKF90cmFuc2Zvcm1Qb3NpdGlvbiwgX3RhcmdldFBvc2l0aW9uKTtcclxuICAgICAgekF4aXMubm9ybWFsaXplKCk7XHJcbiAgICAgIGxldCB4QXhpczogVmVjdG9yMyA9IFZlY3RvcjMuTk9STUFMSVpBVElPTihWZWN0b3IzLkNST1NTKF91cCwgekF4aXMpKTtcclxuICAgICAgbGV0IHlBeGlzOiBWZWN0b3IzID0gVmVjdG9yMy5OT1JNQUxJWkFUSU9OKFZlY3RvcjMuQ1JPU1MoekF4aXMsIHhBeGlzKSk7XHJcbiAgICAgIG1hdHJpeC5kYXRhLnNldChcclxuICAgICAgICBbXHJcbiAgICAgICAgICB4QXhpcy54LCB4QXhpcy55LCB4QXhpcy56LCAwLFxyXG4gICAgICAgICAgeUF4aXMueCwgeUF4aXMueSwgeUF4aXMueiwgMCxcclxuICAgICAgICAgIHpBeGlzLngsIHpBeGlzLnksIHpBeGlzLnosIDAsXHJcbiAgICAgICAgICBfdHJhbnNmb3JtUG9zaXRpb24ueCxcclxuICAgICAgICAgIF90cmFuc2Zvcm1Qb3NpdGlvbi55LFxyXG4gICAgICAgICAgX3RyYW5zZm9ybVBvc2l0aW9uLnosXHJcbiAgICAgICAgICAxXHJcbiAgICAgICAgXSk7XHJcbiAgICAgIHJldHVybiBtYXRyaXg7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgbWF0cml4IHRoYXQgdHJhbnNsYXRlcyBjb29yZGluYXRlcyBhbG9uZyB0aGUgeC0sIHktIGFuZCB6LWF4aXMgYWNjb3JkaW5nIHRvIHRoZSBnaXZlbiB2ZWN0b3IuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgVFJBTlNMQVRJT04oX3RyYW5zbGF0ZTogVmVjdG9yMyk6IE1hdHJpeDR4NCB7XHJcbiAgICAgIC8vIGxldCBtYXRyaXg6IE1hdHJpeDR4NCA9IG5ldyBNYXRyaXg0eDQ7XHJcbiAgICAgIGNvbnN0IG1hdHJpeDogTWF0cml4NHg0ID0gUmVjeWNsZXIuZ2V0KE1hdHJpeDR4NCk7XHJcbiAgICAgIG1hdHJpeC5kYXRhLnNldChbXHJcbiAgICAgICAgMSwgMCwgMCwgMCxcclxuICAgICAgICAwLCAxLCAwLCAwLFxyXG4gICAgICAgIDAsIDAsIDEsIDAsXHJcbiAgICAgICAgX3RyYW5zbGF0ZS54LCBfdHJhbnNsYXRlLnksIF90cmFuc2xhdGUueiwgMVxyXG4gICAgICBdKTtcclxuICAgICAgcmV0dXJuIG1hdHJpeDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBtYXRyaXggdGhhdCByb3RhdGVzIGNvb3JkaW5hdGVzIG9uIHRoZSB4LWF4aXMgd2hlbiBtdWx0aXBsaWVkIGJ5LlxyXG4gICAgICogQHBhcmFtIF9hbmdsZUluRGVncmVlcyBUaGUgdmFsdWUgb2YgdGhlIHJvdGF0aW9uLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIFJPVEFUSU9OX1goX2FuZ2xlSW5EZWdyZWVzOiBudW1iZXIpOiBNYXRyaXg0eDQge1xyXG4gICAgICAvLyBjb25zdCBtYXRyaXg6IE1hdHJpeDR4NCA9IG5ldyBNYXRyaXg0eDQ7XHJcbiAgICAgIGNvbnN0IG1hdHJpeDogTWF0cml4NHg0ID0gUmVjeWNsZXIuZ2V0KE1hdHJpeDR4NCk7XHJcbiAgICAgIGxldCBhbmdsZUluUmFkaWFuczogbnVtYmVyID0gX2FuZ2xlSW5EZWdyZWVzICogTWF0aC5QSSAvIDE4MDtcclxuICAgICAgbGV0IHNpbjogbnVtYmVyID0gTWF0aC5zaW4oYW5nbGVJblJhZGlhbnMpO1xyXG4gICAgICBsZXQgY29zOiBudW1iZXIgPSBNYXRoLmNvcyhhbmdsZUluUmFkaWFucyk7XHJcbiAgICAgIG1hdHJpeC5kYXRhLnNldChbXHJcbiAgICAgICAgMSwgMCwgMCwgMCxcclxuICAgICAgICAwLCBjb3MsIHNpbiwgMCxcclxuICAgICAgICAwLCAtc2luLCBjb3MsIDAsXHJcbiAgICAgICAgMCwgMCwgMCwgMVxyXG4gICAgICBdKTtcclxuICAgICAgcmV0dXJuIG1hdHJpeDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBtYXRyaXggdGhhdCByb3RhdGVzIGNvb3JkaW5hdGVzIG9uIHRoZSB5LWF4aXMgd2hlbiBtdWx0aXBsaWVkIGJ5LlxyXG4gICAgICogQHBhcmFtIF9hbmdsZUluRGVncmVlcyBUaGUgdmFsdWUgb2YgdGhlIHJvdGF0aW9uLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIFJPVEFUSU9OX1koX2FuZ2xlSW5EZWdyZWVzOiBudW1iZXIpOiBNYXRyaXg0eDQge1xyXG4gICAgICAvLyBjb25zdCBtYXRyaXg6IE1hdHJpeDR4NCA9IG5ldyBNYXRyaXg0eDQ7XHJcbiAgICAgIGxldCBtYXRyaXg6IE1hdHJpeDR4NCA9IFJlY3ljbGVyLmdldChNYXRyaXg0eDQpO1xyXG4gICAgICBsZXQgYW5nbGVJblJhZGlhbnM6IG51bWJlciA9IF9hbmdsZUluRGVncmVlcyAqIE1hdGguUEkgLyAxODA7XHJcbiAgICAgIGxldCBzaW46IG51bWJlciA9IE1hdGguc2luKGFuZ2xlSW5SYWRpYW5zKTtcclxuICAgICAgbGV0IGNvczogbnVtYmVyID0gTWF0aC5jb3MoYW5nbGVJblJhZGlhbnMpO1xyXG4gICAgICBtYXRyaXguZGF0YS5zZXQoW1xyXG4gICAgICAgIGNvcywgMCwgLXNpbiwgMCxcclxuICAgICAgICAwLCAxLCAwLCAwLFxyXG4gICAgICAgIHNpbiwgMCwgY29zLCAwLFxyXG4gICAgICAgIDAsIDAsIDAsIDFcclxuICAgICAgXSk7XHJcbiAgICAgIHJldHVybiBtYXRyaXg7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgbWF0cml4IHRoYXQgcm90YXRlcyBjb29yZGluYXRlcyBvbiB0aGUgei1heGlzIHdoZW4gbXVsdGlwbGllZCBieS5cclxuICAgICAqIEBwYXJhbSBfYW5nbGVJbkRlZ3JlZXMgVGhlIHZhbHVlIG9mIHRoZSByb3RhdGlvbi5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBST1RBVElPTl9aKF9hbmdsZUluRGVncmVlczogbnVtYmVyKTogTWF0cml4NHg0IHtcclxuICAgICAgLy8gY29uc3QgbWF0cml4OiBNYXRyaXg0eDQgPSBuZXcgTWF0cml4NHg0O1xyXG4gICAgICBjb25zdCBtYXRyaXg6IE1hdHJpeDR4NCA9IFJlY3ljbGVyLmdldChNYXRyaXg0eDQpO1xyXG4gICAgICBsZXQgYW5nbGVJblJhZGlhbnM6IG51bWJlciA9IF9hbmdsZUluRGVncmVlcyAqIE1hdGguUEkgLyAxODA7XHJcbiAgICAgIGxldCBzaW46IG51bWJlciA9IE1hdGguc2luKGFuZ2xlSW5SYWRpYW5zKTtcclxuICAgICAgbGV0IGNvczogbnVtYmVyID0gTWF0aC5jb3MoYW5nbGVJblJhZGlhbnMpO1xyXG4gICAgICBtYXRyaXguZGF0YS5zZXQoW1xyXG4gICAgICAgIGNvcywgc2luLCAwLCAwLFxyXG4gICAgICAgIC1zaW4sIGNvcywgMCwgMCxcclxuICAgICAgICAwLCAwLCAxLCAwLFxyXG4gICAgICAgIDAsIDAsIDAsIDFcclxuICAgICAgXSk7XHJcbiAgICAgIHJldHVybiBtYXRyaXg7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgbWF0cml4IHRoYXQgc2NhbGVzIGNvb3JkaW5hdGVzIGFsb25nIHRoZSB4LSwgeS0gYW5kIHotYXhpcyBhY2NvcmRpbmcgdG8gdGhlIGdpdmVuIHZlY3RvclxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIFNDQUxJTkcoX3NjYWxhcjogVmVjdG9yMyk6IE1hdHJpeDR4NCB7XHJcbiAgICAgIC8vIGNvbnN0IG1hdHJpeDogTWF0cml4NHg0ID0gbmV3IE1hdHJpeDR4NDtcclxuICAgICAgY29uc3QgbWF0cml4OiBNYXRyaXg0eDQgPSBSZWN5Y2xlci5nZXQoTWF0cml4NHg0KTtcclxuICAgICAgbWF0cml4LmRhdGEuc2V0KFtcclxuICAgICAgICBfc2NhbGFyLngsIDAsIDAsIDAsXHJcbiAgICAgICAgMCwgX3NjYWxhci55LCAwLCAwLFxyXG4gICAgICAgIDAsIDAsIF9zY2FsYXIueiwgMCxcclxuICAgICAgICAwLCAwLCAwLCAxXHJcbiAgICAgIF0pO1xyXG4gICAgICByZXR1cm4gbWF0cml4O1xyXG4gICAgfVxyXG4gICAgLy8jZW5kcmVnaW9uXHJcblxyXG4gICAgLy8jcmVnaW9uIFBST0pFQ1RJT05TXHJcbiAgICAvKipcclxuICAgICAqIENvbXB1dGVzIGFuZCByZXR1cm5zIGEgbWF0cml4IHRoYXQgYXBwbGllcyBwZXJzcGVjdGl2ZSB0byBhbiBvYmplY3QsIGlmIGl0cyB0cmFuc2Zvcm0gaXMgbXVsdGlwbGllZCBieSBpdC5cclxuICAgICAqIEBwYXJhbSBfYXNwZWN0IFRoZSBhc3BlY3QgcmF0aW8gYmV0d2VlbiB3aWR0aCBhbmQgaGVpZ2h0IG9mIHByb2plY3Rpb25zcGFjZS4oRGVmYXVsdCA9IGNhbnZhcy5jbGllbnRXaWR0aCAvIGNhbnZhcy5DbGllbnRIZWlnaHQpXHJcbiAgICAgKiBAcGFyYW0gX2ZpZWxkT2ZWaWV3SW5EZWdyZWVzIFRoZSBmaWVsZCBvZiB2aWV3IGluIERlZ3JlZXMuIChEZWZhdWx0ID0gNDUpXHJcbiAgICAgKiBAcGFyYW0gX25lYXIgVGhlIG5lYXIgY2xpcHNwYWNlIGJvcmRlciBvbiB0aGUgei1heGlzLlxyXG4gICAgICogQHBhcmFtIF9mYXIgVGhlIGZhciBjbGlwc3BhY2UgYm9yZGVyIG9uIHRoZSB6LWF4aXMuXHJcbiAgICAgKiBAcGFyYW0gX2RpcmVjdGlvbiBUaGUgcGxhbmUgb24gd2hpY2ggdGhlIGZpZWxkT2ZWaWV3LUFuZ2xlIGlzIGdpdmVuIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIFBST0pFQ1RJT05fQ0VOVFJBTChfYXNwZWN0OiBudW1iZXIsIF9maWVsZE9mVmlld0luRGVncmVlczogbnVtYmVyLCBfbmVhcjogbnVtYmVyLCBfZmFyOiBudW1iZXIsIF9kaXJlY3Rpb246IEZJRUxEX09GX1ZJRVcpOiBNYXRyaXg0eDQge1xyXG4gICAgICBsZXQgZmllbGRPZlZpZXdJblJhZGlhbnM6IG51bWJlciA9IF9maWVsZE9mVmlld0luRGVncmVlcyAqIE1hdGguUEkgLyAxODA7XHJcbiAgICAgIGxldCBmOiBudW1iZXIgPSBNYXRoLnRhbigwLjUgKiAoTWF0aC5QSSAtIGZpZWxkT2ZWaWV3SW5SYWRpYW5zKSk7XHJcbiAgICAgIGxldCByYW5nZUludjogbnVtYmVyID0gMS4wIC8gKF9uZWFyIC0gX2Zhcik7XHJcbiAgICAgIC8vIGNvbnN0IG1hdHJpeDogTWF0cml4NHg0ID0gbmV3IE1hdHJpeDR4NDtcclxuICAgICAgY29uc3QgbWF0cml4OiBNYXRyaXg0eDQgPSBSZWN5Y2xlci5nZXQoTWF0cml4NHg0KTtcclxuICAgICAgbWF0cml4LmRhdGEuc2V0KFtcclxuICAgICAgICBmLCAwLCAwLCAwLFxyXG4gICAgICAgIDAsIGYsIDAsIDAsXHJcbiAgICAgICAgMCwgMCwgKF9uZWFyICsgX2ZhcikgKiByYW5nZUludiwgLTEsXHJcbiAgICAgICAgMCwgMCwgX25lYXIgKiBfZmFyICogcmFuZ2VJbnYgKiAyLCAwXHJcbiAgICAgIF0pO1xyXG5cclxuICAgICAgaWYgKF9kaXJlY3Rpb24gPT0gRklFTERfT0ZfVklFVy5ESUFHT05BTCkge1xyXG4gICAgICAgIF9hc3BlY3QgPSBNYXRoLnNxcnQoX2FzcGVjdCk7XHJcbiAgICAgICAgbWF0cml4LmRhdGFbMF0gPSBmIC8gX2FzcGVjdDtcclxuICAgICAgICBtYXRyaXguZGF0YVs1XSA9IGYgKiBfYXNwZWN0O1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKF9kaXJlY3Rpb24gPT0gRklFTERfT0ZfVklFVy5WRVJUSUNBTClcclxuICAgICAgICBtYXRyaXguZGF0YVswXSA9IGYgLyBfYXNwZWN0O1xyXG4gICAgICBlbHNlIC8vRk9WX0RJUkVDVElPTi5IT1JJWk9OVEFMXHJcbiAgICAgICAgbWF0cml4LmRhdGFbNV0gPSBmICogX2FzcGVjdDtcclxuXHJcbiAgICAgIHJldHVybiBtYXRyaXg7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb21wdXRlcyBhbmQgcmV0dXJucyBhIG1hdHJpeCB0aGF0IGFwcGxpZXMgb3J0aG9ncmFwaGljIHByb2plY3Rpb24gdG8gYW4gb2JqZWN0LCBpZiBpdHMgdHJhbnNmb3JtIGlzIG11bHRpcGxpZWQgYnkgaXQuXHJcbiAgICAgKiBAcGFyYW0gX2xlZnQgVGhlIHBvc2l0aW9udmFsdWUgb2YgdGhlIHByb2plY3Rpb25zcGFjZSdzIGxlZnQgYm9yZGVyLlxyXG4gICAgICogQHBhcmFtIF9yaWdodCBUaGUgcG9zaXRpb252YWx1ZSBvZiB0aGUgcHJvamVjdGlvbnNwYWNlJ3MgcmlnaHQgYm9yZGVyLlxyXG4gICAgICogQHBhcmFtIF9ib3R0b20gVGhlIHBvc2l0aW9udmFsdWUgb2YgdGhlIHByb2plY3Rpb25zcGFjZSdzIGJvdHRvbSBib3JkZXIuXHJcbiAgICAgKiBAcGFyYW0gX3RvcCBUaGUgcG9zaXRpb252YWx1ZSBvZiB0aGUgcHJvamVjdGlvbnNwYWNlJ3MgdG9wIGJvcmRlci5cclxuICAgICAqIEBwYXJhbSBfbmVhciBUaGUgcG9zaXRpb252YWx1ZSBvZiB0aGUgcHJvamVjdGlvbnNwYWNlJ3MgbmVhciBib3JkZXIuXHJcbiAgICAgKiBAcGFyYW0gX2ZhciBUaGUgcG9zaXRpb252YWx1ZSBvZiB0aGUgcHJvamVjdGlvbnNwYWNlJ3MgZmFyIGJvcmRlclxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIFBST0pFQ1RJT05fT1JUSE9HUkFQSElDKF9sZWZ0OiBudW1iZXIsIF9yaWdodDogbnVtYmVyLCBfYm90dG9tOiBudW1iZXIsIF90b3A6IG51bWJlciwgX25lYXI6IG51bWJlciA9IC00MDAsIF9mYXI6IG51bWJlciA9IDQwMCk6IE1hdHJpeDR4NCB7XHJcbiAgICAgIC8vIGNvbnN0IG1hdHJpeDogTWF0cml4NHg0ID0gbmV3IE1hdHJpeDR4NDtcclxuICAgICAgY29uc3QgbWF0cml4OiBNYXRyaXg0eDQgPSBSZWN5Y2xlci5nZXQoTWF0cml4NHg0KTtcclxuICAgICAgbWF0cml4LmRhdGEuc2V0KFtcclxuICAgICAgICAyIC8gKF9yaWdodCAtIF9sZWZ0KSwgMCwgMCwgMCxcclxuICAgICAgICAwLCAyIC8gKF90b3AgLSBfYm90dG9tKSwgMCwgMCxcclxuICAgICAgICAwLCAwLCAyIC8gKF9uZWFyIC0gX2ZhciksIDAsXHJcbiAgICAgICAgKF9sZWZ0ICsgX3JpZ2h0KSAvIChfbGVmdCAtIF9yaWdodCksXHJcbiAgICAgICAgKF9ib3R0b20gKyBfdG9wKSAvIChfYm90dG9tIC0gX3RvcCksXHJcbiAgICAgICAgKF9uZWFyICsgX2ZhcikgLyAoX25lYXIgLSBfZmFyKSxcclxuICAgICAgICAxXHJcbiAgICAgIF0pO1xyXG4gICAgICByZXR1cm4gbWF0cml4O1xyXG4gICAgfVxyXG4gICAgLy8jZW5kcmVnaW9uXHJcblxyXG4gICAgLy8jcmVnaW9uIFJvdGF0aW9uXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgYSByb3RhdGlvbiBhcm91bmQgdGhlIHgtQXhpcyB0byB0aGlzIG1hdHJpeFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgcm90YXRlWChfYW5nbGVJbkRlZ3JlZXM6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICBjb25zdCBtYXRyaXg6IE1hdHJpeDR4NCA9IE1hdHJpeDR4NC5NVUxUSVBMSUNBVElPTih0aGlzLCBNYXRyaXg0eDQuUk9UQVRJT05fWChfYW5nbGVJbkRlZ3JlZXMpKTtcclxuICAgICAgdGhpcy5zZXQobWF0cml4KTtcclxuICAgICAgUmVjeWNsZXIuc3RvcmUobWF0cml4KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgYSByb3RhdGlvbiBhcm91bmQgdGhlIHktQXhpcyB0byB0aGlzIG1hdHJpeFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgcm90YXRlWShfYW5nbGVJbkRlZ3JlZXM6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICBjb25zdCBtYXRyaXg6IE1hdHJpeDR4NCA9IE1hdHJpeDR4NC5NVUxUSVBMSUNBVElPTih0aGlzLCBNYXRyaXg0eDQuUk9UQVRJT05fWShfYW5nbGVJbkRlZ3JlZXMpKTtcclxuICAgICAgdGhpcy5zZXQobWF0cml4KTtcclxuICAgICAgUmVjeWNsZXIuc3RvcmUobWF0cml4KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgYSByb3RhdGlvbiBhcm91bmQgdGhlIHotQXhpcyB0byB0aGlzIG1hdHJpeFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgcm90YXRlWihfYW5nbGVJbkRlZ3JlZXM6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICBjb25zdCBtYXRyaXg6IE1hdHJpeDR4NCA9IE1hdHJpeDR4NC5NVUxUSVBMSUNBVElPTih0aGlzLCBNYXRyaXg0eDQuUk9UQVRJT05fWihfYW5nbGVJbkRlZ3JlZXMpKTtcclxuICAgICAgdGhpcy5zZXQobWF0cml4KTtcclxuICAgICAgUmVjeWNsZXIuc3RvcmUobWF0cml4KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkanVzdHMgdGhlIHJvdGF0aW9uIG9mIHRoaXMgbWF0cml4IHRvIGZhY2UgdGhlIGdpdmVuIHRhcmdldCBhbmQgdGlsdHMgaXQgdG8gYWNjb3JkIHdpdGggdGhlIGdpdmVuIHVwIHZlY3RvciBcclxuICAgICAqL1xyXG4gICAgcHVibGljIGxvb2tBdChfdGFyZ2V0OiBWZWN0b3IzLCBfdXA6IFZlY3RvcjMgPSBWZWN0b3IzLlkoKSk6IHZvaWQge1xyXG4gICAgICBjb25zdCBtYXRyaXg6IE1hdHJpeDR4NCA9IE1hdHJpeDR4NC5MT09LX0FUKHRoaXMudHJhbnNsYXRpb24sIF90YXJnZXQpOyAvLyBUT0RPOiBIYW5kbGUgcm90YXRpb24gYXJvdW5kIHotYXhpc1xyXG4gICAgICB0aGlzLnNldChtYXRyaXgpO1xyXG4gICAgICBSZWN5Y2xlci5zdG9yZShtYXRyaXgpO1xyXG4gICAgfVxyXG4gICAgLy8jZW5kcmVnaW9uXHJcblxyXG4gICAgLy8jcmVnaW9uIFRyYW5zbGF0aW9uXHJcbiAgICAvKipcclxuICAgICAqIEFkZCBhIHRyYW5zbGF0aW9uIGJ5IHRoZSBnaXZlbiB2ZWN0b3IgdG8gdGhpcyBtYXRyaXggXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyB0cmFuc2xhdGUoX2J5OiBWZWN0b3IzKTogdm9pZCB7XHJcbiAgICAgIGNvbnN0IG1hdHJpeDogTWF0cml4NHg0ID0gTWF0cml4NHg0Lk1VTFRJUExJQ0FUSU9OKHRoaXMsIE1hdHJpeDR4NC5UUkFOU0xBVElPTihfYnkpKTtcclxuICAgICAgLy8gVE9ETzogcG9zc2libGUgb3B0aW1pemF0aW9uLCB0cmFuc2xhdGlvbiBtYXkgYWx0ZXIgbXV0YXRvciBpbnN0ZWFkIG9mIGRlbGV0aW5nIGl0LlxyXG4gICAgICB0aGlzLnNldChtYXRyaXgpO1xyXG4gICAgICBSZWN5Y2xlci5zdG9yZShtYXRyaXgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkIGEgdHJhbnNsYXRpb24gYWxvbmcgdGhlIHgtQXhpcyBieSB0aGUgZ2l2ZW4gYW1vdW50IHRvIHRoaXMgbWF0cml4IFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgdHJhbnNsYXRlWChfeDogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgIHRoaXMuZGF0YVsxMl0gKz0gX3g7XHJcbiAgICAgIHRoaXMubXV0YXRvciA9IG51bGw7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEFkZCBhIHRyYW5zbGF0aW9uIGFsb25nIHRoZSB5LUF4aXMgYnkgdGhlIGdpdmVuIGFtb3VudCB0byB0aGlzIG1hdHJpeCBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHRyYW5zbGF0ZVkoX3k6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICB0aGlzLmRhdGFbMTNdICs9IF95O1xyXG4gICAgICB0aGlzLm11dGF0b3IgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGQgYSB0cmFuc2xhdGlvbiBhbG9uZyB0aGUgeS1BeGlzIGJ5IHRoZSBnaXZlbiBhbW91bnQgdG8gdGhpcyBtYXRyaXggXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyB0cmFuc2xhdGVaKF96OiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgdGhpcy5kYXRhWzE0XSArPSBfejtcclxuICAgICAgdGhpcy5tdXRhdG9yID0gbnVsbDtcclxuICAgIH1cclxuICAgIC8vI2VuZHJlZ2lvblxyXG5cclxuICAgIC8vI3JlZ2lvbiBTY2FsaW5nXHJcbiAgICAvKipcclxuICAgICAqIEFkZCBhIHNjYWxpbmcgYnkgdGhlIGdpdmVuIHZlY3RvciB0byB0aGlzIG1hdHJpeCBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHNjYWxlKF9ieTogVmVjdG9yMyk6IHZvaWQge1xyXG4gICAgICBjb25zdCBtYXRyaXg6IE1hdHJpeDR4NCA9IE1hdHJpeDR4NC5NVUxUSVBMSUNBVElPTih0aGlzLCBNYXRyaXg0eDQuU0NBTElORyhfYnkpKTtcclxuICAgICAgdGhpcy5zZXQobWF0cml4KTtcclxuICAgICAgUmVjeWNsZXIuc3RvcmUobWF0cml4KTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQWRkIGEgc2NhbGluZyBhbG9uZyB0aGUgeC1BeGlzIGJ5IHRoZSBnaXZlbiBhbW91bnQgdG8gdGhpcyBtYXRyaXggXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzY2FsZVgoX2J5OiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgdGhpcy5zY2FsZShuZXcgVmVjdG9yMyhfYnksIDEsIDEpKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQWRkIGEgc2NhbGluZyBhbG9uZyB0aGUgeS1BeGlzIGJ5IHRoZSBnaXZlbiBhbW91bnQgdG8gdGhpcyBtYXRyaXggXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzY2FsZVkoX2J5OiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgdGhpcy5zY2FsZShuZXcgVmVjdG9yMygxLCBfYnksIDEpKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQWRkIGEgc2NhbGluZyBhbG9uZyB0aGUgei1BeGlzIGJ5IHRoZSBnaXZlbiBhbW91bnQgdG8gdGhpcyBtYXRyaXggXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzY2FsZVooX2J5OiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgdGhpcy5zY2FsZShuZXcgVmVjdG9yMygxLCAxLCBfYnkpKTtcclxuICAgIH1cclxuICAgIC8vI2VuZHJlZ2lvblxyXG5cclxuICAgIC8vI3JlZ2lvbiBUcmFuc2Zvcm1hdGlvblxyXG4gICAgLyoqXHJcbiAgICAgKiBNdWx0aXBseSB0aGlzIG1hdHJpeCB3aXRoIHRoZSBnaXZlbiBtYXRyaXhcclxuICAgICAqL1xyXG4gICAgcHVibGljIG11bHRpcGx5KF9tYXRyaXg6IE1hdHJpeDR4NCk6IHZvaWQge1xyXG4gICAgICB0aGlzLnNldChNYXRyaXg0eDQuTVVMVElQTElDQVRJT04odGhpcywgX21hdHJpeCkpO1xyXG4gICAgICB0aGlzLm11dGF0b3IgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgLy8jZW5kcmVnaW9uXHJcblxyXG4gICAgLy8jcmVnaW9uIFRyYW5zZmVyXHJcbiAgICAvKipcclxuICAgICAqIENhbGN1bGF0ZXMgYW5kIHJldHVybnMgdGhlIGV1bGVyLWFuZ2xlcyByZXByZXNlbnRpbmcgdGhlIGN1cnJlbnQgcm90YXRpb24gb2YgdGhpcyBtYXRyaXhcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldEV1bGVyQW5nbGVzKCk6IFZlY3RvcjMge1xyXG4gICAgICBsZXQgc2NhbGluZzogVmVjdG9yMyA9IHRoaXMuc2NhbGluZztcclxuXHJcbiAgICAgIGxldCBzMDogbnVtYmVyID0gdGhpcy5kYXRhWzBdIC8gc2NhbGluZy54O1xyXG4gICAgICBsZXQgczE6IG51bWJlciA9IHRoaXMuZGF0YVsxXSAvIHNjYWxpbmcueDtcclxuICAgICAgbGV0IHMyOiBudW1iZXIgPSB0aGlzLmRhdGFbMl0gLyBzY2FsaW5nLng7XHJcbiAgICAgIGxldCBzNjogbnVtYmVyID0gdGhpcy5kYXRhWzZdIC8gc2NhbGluZy55O1xyXG4gICAgICBsZXQgczEwOiBudW1iZXIgPSB0aGlzLmRhdGFbMTBdIC8gc2NhbGluZy56O1xyXG5cclxuICAgICAgbGV0IHN5OiBudW1iZXIgPSBNYXRoLmh5cG90KHMwLCBzMSk7IC8vIHByb2JhYmx5IDIuIHBhcmFtIHNob3VsZCBiZSB0aGlzLmRhdGFbNF0gLyBzY2FsaW5nLnlcclxuXHJcbiAgICAgIGxldCBzaW5ndWxhcjogYm9vbGVhbiA9IHN5IDwgMWUtNjsgLy8gSWZcclxuXHJcbiAgICAgIGxldCB4MTogbnVtYmVyLCB5MTogbnVtYmVyLCB6MTogbnVtYmVyO1xyXG4gICAgICBsZXQgeDI6IG51bWJlciwgeTI6IG51bWJlciwgejI6IG51bWJlcjtcclxuXHJcbiAgICAgIGlmICghc2luZ3VsYXIpIHtcclxuICAgICAgICB4MSA9IE1hdGguYXRhbjIoczYsIHMxMCk7XHJcbiAgICAgICAgeTEgPSBNYXRoLmF0YW4yKC1zMiwgc3kpO1xyXG4gICAgICAgIHoxID0gTWF0aC5hdGFuMihzMSwgczApO1xyXG5cclxuICAgICAgICB4MiA9IE1hdGguYXRhbjIoLXM2LCAtczEwKTtcclxuICAgICAgICB5MiA9IE1hdGguYXRhbjIoLXMyLCAtc3kpO1xyXG4gICAgICAgIHoyID0gTWF0aC5hdGFuMigtczEsIC1zMCk7XHJcblxyXG4gICAgICAgIGlmIChNYXRoLmFicyh4MikgKyBNYXRoLmFicyh5MikgKyBNYXRoLmFicyh6MikgPCBNYXRoLmFicyh4MSkgKyBNYXRoLmFicyh5MSkgKyBNYXRoLmFicyh6MSkpIHtcclxuICAgICAgICAgIHgxID0geDI7XHJcbiAgICAgICAgICB5MSA9IHkyO1xyXG4gICAgICAgICAgejEgPSB6MjtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgeDEgPSBNYXRoLmF0YW4yKC10aGlzLmRhdGFbOV0gLyBzY2FsaW5nLnosIHRoaXMuZGF0YVs1XSAvIHNjYWxpbmcueSk7XHJcbiAgICAgICAgeTEgPSBNYXRoLmF0YW4yKC10aGlzLmRhdGFbMl0gLyBzY2FsaW5nLngsIHN5KTtcclxuICAgICAgICB6MSA9IDA7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGxldCByb3RhdGlvbjogVmVjdG9yMyA9IG5ldyBWZWN0b3IzKHgxLCB5MSwgejEpO1xyXG4gICAgICByb3RhdGlvbi5zY2FsZSgxODAgLyBNYXRoLlBJKTtcclxuXHJcbiAgICAgIHJldHVybiByb3RhdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIGVsZW1lbnRzIG9mIHRoaXMgbWF0cml4IHRvIHRoZSB2YWx1ZXMgb2YgdGhlIGdpdmVuIG1hdHJpeFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2V0KF90bzogTWF0cml4NHg0KTogdm9pZCB7XHJcbiAgICAgIC8vIHRoaXMuZGF0YSA9IF90by5nZXQoKTtcclxuICAgICAgdGhpcy5kYXRhLnNldChfdG8uZGF0YSk7XHJcbiAgICAgIHRoaXMucmVzZXRDYWNoZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJuIHRoZSBlbGVtZW50cyBvZiB0aGlzIG1hdHJpeCBhcyBhIEZsb2F0MzJBcnJheVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0KCk6IEZsb2F0MzJBcnJheSB7XHJcbiAgICAgIHJldHVybiBuZXcgRmxvYXQzMkFycmF5KHRoaXMuZGF0YSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNlcmlhbGl6ZSgpOiBTZXJpYWxpemF0aW9uIHtcclxuICAgICAgLy8gVE9ETzogc2F2ZSB0cmFuc2xhdGlvbiwgcm90YXRpb24gYW5kIHNjYWxlIGFzIHZlY3RvcnMgZm9yIHJlYWRhYmlsaXR5IGFuZCBtYW5pcHVsYXRpb25cclxuICAgICAgbGV0IHNlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24gPSB0aGlzLmdldE11dGF0b3IoKTtcclxuICAgICAgcmV0dXJuIHNlcmlhbGl6YXRpb247XHJcbiAgICB9XHJcbiAgICBwdWJsaWMgZGVzZXJpYWxpemUoX3NlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24pOiBTZXJpYWxpemFibGUge1xyXG4gICAgICB0aGlzLm11dGF0ZShfc2VyaWFsaXphdGlvbik7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRNdXRhdG9yKCk6IE11dGF0b3Ige1xyXG4gICAgICBpZiAodGhpcy5tdXRhdG9yKVxyXG4gICAgICAgIHJldHVybiB0aGlzLm11dGF0b3I7XHJcblxyXG4gICAgICBsZXQgbXV0YXRvcjogTXV0YXRvciA9IHtcclxuICAgICAgICB0cmFuc2xhdGlvbjogdGhpcy50cmFuc2xhdGlvbi5nZXRNdXRhdG9yKCksXHJcbiAgICAgICAgcm90YXRpb246IHRoaXMucm90YXRpb24uZ2V0TXV0YXRvcigpLFxyXG4gICAgICAgIHNjYWxpbmc6IHRoaXMuc2NhbGluZy5nZXRNdXRhdG9yKClcclxuICAgICAgfTtcclxuXHJcbiAgICAgIC8vIGNhY2hlIG11dGF0b3JcclxuICAgICAgdGhpcy5tdXRhdG9yID0gbXV0YXRvcjtcclxuICAgICAgcmV0dXJuIG11dGF0b3I7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIG11dGF0ZShfbXV0YXRvcjogTXV0YXRvcik6IHZvaWQge1xyXG4gICAgICBsZXQgb2xkVHJhbnNsYXRpb246IFZlY3RvcjMgPSB0aGlzLnRyYW5zbGF0aW9uO1xyXG4gICAgICBsZXQgb2xkUm90YXRpb246IFZlY3RvcjMgPSB0aGlzLnJvdGF0aW9uO1xyXG4gICAgICBsZXQgb2xkU2NhbGluZzogVmVjdG9yMyA9IHRoaXMuc2NhbGluZztcclxuICAgICAgbGV0IG5ld1RyYW5zbGF0aW9uOiBWZWN0b3IzID0gPFZlY3RvcjM+X211dGF0b3JbXCJ0cmFuc2xhdGlvblwiXTtcclxuICAgICAgbGV0IG5ld1JvdGF0aW9uOiBWZWN0b3IzID0gPFZlY3RvcjM+X211dGF0b3JbXCJyb3RhdGlvblwiXTtcclxuICAgICAgbGV0IG5ld1NjYWxpbmc6IFZlY3RvcjMgPSA8VmVjdG9yMz5fbXV0YXRvcltcInNjYWxpbmdcIl07XHJcbiAgICAgIGxldCB2ZWN0b3JzOiBWZWN0b3JSZXByZXNlbnRhdGlvbiA9IHsgdHJhbnNsYXRpb246IG51bGwsIHJvdGF0aW9uOiBudWxsLCBzY2FsaW5nOiBudWxsIH07XHJcbiAgICAgIGlmIChuZXdUcmFuc2xhdGlvbikge1xyXG4gICAgICAgIHZlY3RvcnMudHJhbnNsYXRpb24gPSBuZXcgVmVjdG9yMyhcclxuICAgICAgICAgIG5ld1RyYW5zbGF0aW9uLnggIT0gdW5kZWZpbmVkID8gbmV3VHJhbnNsYXRpb24ueCA6IG9sZFRyYW5zbGF0aW9uLngsXHJcbiAgICAgICAgICBuZXdUcmFuc2xhdGlvbi55ICE9IHVuZGVmaW5lZCA/IG5ld1RyYW5zbGF0aW9uLnkgOiBvbGRUcmFuc2xhdGlvbi55LFxyXG4gICAgICAgICAgbmV3VHJhbnNsYXRpb24ueiAhPSB1bmRlZmluZWQgPyBuZXdUcmFuc2xhdGlvbi56IDogb2xkVHJhbnNsYXRpb24uelxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKG5ld1JvdGF0aW9uKSB7XHJcbiAgICAgICAgdmVjdG9ycy5yb3RhdGlvbiA9IG5ldyBWZWN0b3IzKFxyXG4gICAgICAgICAgbmV3Um90YXRpb24ueCAhPSB1bmRlZmluZWQgPyBuZXdSb3RhdGlvbi54IDogb2xkUm90YXRpb24ueCxcclxuICAgICAgICAgIG5ld1JvdGF0aW9uLnkgIT0gdW5kZWZpbmVkID8gbmV3Um90YXRpb24ueSA6IG9sZFJvdGF0aW9uLnksXHJcbiAgICAgICAgICBuZXdSb3RhdGlvbi56ICE9IHVuZGVmaW5lZCA/IG5ld1JvdGF0aW9uLnogOiBvbGRSb3RhdGlvbi56XHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAobmV3U2NhbGluZykge1xyXG4gICAgICAgIHZlY3RvcnMuc2NhbGluZyA9IG5ldyBWZWN0b3IzKFxyXG4gICAgICAgICAgbmV3U2NhbGluZy54ICE9IHVuZGVmaW5lZCA/IG5ld1NjYWxpbmcueCA6IG9sZFNjYWxpbmcueCxcclxuICAgICAgICAgIG5ld1NjYWxpbmcueSAhPSB1bmRlZmluZWQgPyBuZXdTY2FsaW5nLnkgOiBvbGRTY2FsaW5nLnksXHJcbiAgICAgICAgICBuZXdTY2FsaW5nLnogIT0gdW5kZWZpbmVkID8gbmV3U2NhbGluZy56IDogb2xkU2NhbGluZy56XHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gVE9ETzogcG9zc2libGUgcGVyZm9ybWFuY2Ugb3B0aW1pemF0aW9uIHdoZW4gb25seSBvbmUgb3IgdHdvIGNvbXBvbmVudHMgY2hhbmdlLCB0aGVuIHVzZSBvbGQgbWF0cml4IGluc3RlYWQgb2YgSURFTlRJVFkgYW5kIHRyYW5zZm9ybSBieSBkaWZmZXJlbmNlcy9xdW90aWVudHNcclxuICAgICAgbGV0IG1hdHJpeDogTWF0cml4NHg0ID0gTWF0cml4NHg0LklERU5USVRZO1xyXG4gICAgICBpZiAodmVjdG9ycy50cmFuc2xhdGlvbilcclxuICAgICAgICBtYXRyaXgudHJhbnNsYXRlKHZlY3RvcnMudHJhbnNsYXRpb24pO1xyXG4gICAgICBpZiAodmVjdG9ycy5yb3RhdGlvbikge1xyXG4gICAgICAgIG1hdHJpeC5yb3RhdGVaKHZlY3RvcnMucm90YXRpb24ueik7XHJcbiAgICAgICAgbWF0cml4LnJvdGF0ZVkodmVjdG9ycy5yb3RhdGlvbi55KTtcclxuICAgICAgICBtYXRyaXgucm90YXRlWCh2ZWN0b3JzLnJvdGF0aW9uLngpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh2ZWN0b3JzLnNjYWxpbmcpXHJcbiAgICAgICAgbWF0cml4LnNjYWxlKHZlY3RvcnMuc2NhbGluZyk7XHJcbiAgICAgIHRoaXMuc2V0KG1hdHJpeCk7XHJcblxyXG4gICAgICB0aGlzLnZlY3RvcnMgPSB2ZWN0b3JzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRNdXRhdG9yQXR0cmlidXRlVHlwZXMoX211dGF0b3I6IE11dGF0b3IpOiBNdXRhdG9yQXR0cmlidXRlVHlwZXMge1xyXG4gICAgICBsZXQgdHlwZXM6IE11dGF0b3JBdHRyaWJ1dGVUeXBlcyA9IHt9O1xyXG4gICAgICBpZiAoX211dGF0b3IudHJhbnNsYXRpb24pIHR5cGVzLnRyYW5zbGF0aW9uID0gXCJWZWN0b3IzXCI7XHJcbiAgICAgIGlmIChfbXV0YXRvci5yb3RhdGlvbikgdHlwZXMucm90YXRpb24gPSBcIlZlY3RvcjNcIjtcclxuICAgICAgaWYgKF9tdXRhdG9yLnNjYWxpbmcpIHR5cGVzLnNjYWxpbmcgPSBcIlZlY3RvcjNcIjtcclxuICAgICAgcmV0dXJuIHR5cGVzO1xyXG4gICAgfVxyXG4gICAgcHJvdGVjdGVkIHJlZHVjZU11dGF0b3IoX211dGF0b3I6IE11dGF0b3IpOiB2b2lkIHsvKiogKi8gfVxyXG5cclxuICAgIHByaXZhdGUgcmVzZXRDYWNoZSgpOiB2b2lkIHtcclxuICAgICAgdGhpcy52ZWN0b3JzID0geyB0cmFuc2xhdGlvbjogbnVsbCwgcm90YXRpb246IG51bGwsIHNjYWxpbmc6IG51bGwgfTtcclxuICAgICAgdGhpcy5tdXRhdG9yID0gbnVsbDtcclxuICAgIH1cclxuICB9XHJcbiAgLy8jZW5kcmVnaW9uXHJcbn1cclxuIiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIERlZmluZXMgdGhlIG9yaWdpbiBvZiBhIHJlY3RhbmdsZVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgZW51bSBPUklHSU4yRCB7XHJcbiAgICAgICAgVE9QTEVGVCA9IDB4MDAsXHJcbiAgICAgICAgVE9QQ0VOVEVSID0gMHgwMSxcclxuICAgICAgICBUT1BSSUdIVCA9IDB4MDIsXHJcbiAgICAgICAgQ0VOVEVSTEVGVCA9IDB4MTAsXHJcbiAgICAgICAgQ0VOVEVSID0gMHgxMSxcclxuICAgICAgICBDRU5URVJSSUdIVCA9IDB4MTIsXHJcbiAgICAgICAgQk9UVE9NTEVGVCA9IDB4MjAsXHJcbiAgICAgICAgQk9UVE9NQ0VOVEVSID0gMHgyMSxcclxuICAgICAgICBCT1RUT01SSUdIVCA9IDB4MjJcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIERlZmluZXMgYSByZWN0YW5nbGUgd2l0aCBwb3NpdGlvbiBhbmQgc2l6ZSBhbmQgYWRkIGNvbWZvcnRhYmxlIG1ldGhvZHMgdG8gaXRcclxuICAgICAqIEBhdXRob3IgSmlya2EgRGVsbCdPcm8tRnJpZWRsLCBIRlUsIDIwMTlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIFJlY3RhbmdsZSBleHRlbmRzIE11dGFibGUge1xyXG4gICAgICAgIHB1YmxpYyBwb3NpdGlvbjogVmVjdG9yMiA9IFJlY3ljbGVyLmdldChWZWN0b3IyKTtcclxuICAgICAgICBwdWJsaWMgc2l6ZTogVmVjdG9yMiA9IFJlY3ljbGVyLmdldChWZWN0b3IyKTtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoX3g6IG51bWJlciA9IDAsIF95OiBudW1iZXIgPSAwLCBfd2lkdGg6IG51bWJlciA9IDEsIF9oZWlnaHQ6IG51bWJlciA9IDEsIF9vcmlnaW46IE9SSUdJTjJEID0gT1JJR0lOMkQuVE9QTEVGVCkge1xyXG4gICAgICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgICAgICB0aGlzLnNldFBvc2l0aW9uQW5kU2l6ZShfeCwgX3ksIF93aWR0aCwgX2hlaWdodCwgX29yaWdpbik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIGEgbmV3IHJlY3RhbmdsZSBjcmVhdGVkIHdpdGggdGhlIGdpdmVuIHBhcmFtZXRlcnNcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIEdFVChfeDogbnVtYmVyID0gMCwgX3k6IG51bWJlciA9IDAsIF93aWR0aDogbnVtYmVyID0gMSwgX2hlaWdodDogbnVtYmVyID0gMSwgX29yaWdpbjogT1JJR0lOMkQgPSBPUklHSU4yRC5UT1BMRUZUKTogUmVjdGFuZ2xlIHtcclxuICAgICAgICAgICAgbGV0IHJlY3Q6IFJlY3RhbmdsZSA9IFJlY3ljbGVyLmdldChSZWN0YW5nbGUpO1xyXG4gICAgICAgICAgICByZWN0LnNldFBvc2l0aW9uQW5kU2l6ZShfeCwgX3ksIF93aWR0aCwgX2hlaWdodCk7XHJcbiAgICAgICAgICAgIHJldHVybiByZWN0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2V0cyB0aGUgcG9zaXRpb24gYW5kIHNpemUgb2YgdGhlIHJlY3RhbmdsZSBhY2NvcmRpbmcgdG8gdGhlIGdpdmVuIHBhcmFtZXRlcnNcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc2V0UG9zaXRpb25BbmRTaXplKF94OiBudW1iZXIgPSAwLCBfeTogbnVtYmVyID0gMCwgX3dpZHRoOiBudW1iZXIgPSAxLCBfaGVpZ2h0OiBudW1iZXIgPSAxLCBfb3JpZ2luOiBPUklHSU4yRCA9IE9SSUdJTjJELlRPUExFRlQpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5zaXplLnNldChfd2lkdGgsIF9oZWlnaHQpO1xyXG4gICAgICAgICAgICBzd2l0Y2ggKF9vcmlnaW4gJiAweDAzKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDB4MDA6IHRoaXMucG9zaXRpb24ueCA9IF94OyBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgMHgwMTogdGhpcy5wb3NpdGlvbi54ID0gX3ggLSBfd2lkdGggLyAyOyBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgMHgwMjogdGhpcy5wb3NpdGlvbi54ID0gX3ggLSBfd2lkdGg7IGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHN3aXRjaCAoX29yaWdpbiAmIDB4MzApIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMHgwMDogdGhpcy5wb3NpdGlvbi55ID0gX3k7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAweDEwOiB0aGlzLnBvc2l0aW9uLnkgPSBfeSAtIF9oZWlnaHQgLyAyOyBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgMHgyMDogdGhpcy5wb3NpdGlvbi55ID0gX3kgLSBfaGVpZ2h0OyBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ2V0IHgoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucG9zaXRpb24ueDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZ2V0IHkoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucG9zaXRpb24ueTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZ2V0IHdpZHRoKCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNpemUueDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZ2V0IGhlaWdodCgpOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zaXplLnk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnZXQgbGVmdCgpOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wb3NpdGlvbi54O1xyXG4gICAgICAgIH1cclxuICAgICAgICBnZXQgdG9wKCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBvc2l0aW9uLnk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGdldCByaWdodCgpOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wb3NpdGlvbi54ICsgdGhpcy5zaXplLng7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGdldCBib3R0b20oKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucG9zaXRpb24ueSArIHRoaXMuc2l6ZS55O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc2V0IHgoX3g6IG51bWJlcikge1xyXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnggPSBfeDtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2V0IHkoX3k6IG51bWJlcikge1xyXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnkgPSBfeTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2V0IHdpZHRoKF93aWR0aDogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24ueCA9IF93aWR0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2V0IGhlaWdodChfaGVpZ2h0OiBudW1iZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi55ID0gX2hlaWdodDtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2V0IGxlZnQoX3ZhbHVlOiBudW1iZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5zaXplLnggPSB0aGlzLnJpZ2h0IC0gX3ZhbHVlO1xyXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uLnggPSBfdmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNldCB0b3AoX3ZhbHVlOiBudW1iZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5zaXplLnkgPSB0aGlzLmJvdHRvbSAtIF92YWx1ZTtcclxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbi55ID0gX3ZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzZXQgcmlnaHQoX3ZhbHVlOiBudW1iZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5zaXplLnggPSB0aGlzLnBvc2l0aW9uLnggKyBfdmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNldCBib3R0b20oX3ZhbHVlOiBudW1iZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5zaXplLnkgPSB0aGlzLnBvc2l0aW9uLnkgKyBfdmFsdWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIHBvaW50IGlzIGluc2lkZSBvZiB0aGlzIHJlY3RhbmdsZSBvciBvbiB0aGUgYm9yZGVyXHJcbiAgICAgICAgICogQHBhcmFtIF9wb2ludFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBpc0luc2lkZShfcG9pbnQ6IFZlY3RvcjIpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgcmV0dXJuIChfcG9pbnQueCA+PSB0aGlzLmxlZnQgJiYgX3BvaW50LnggPD0gdGhpcy5yaWdodCAmJiBfcG9pbnQueSA+PSB0aGlzLnRvcCAmJiBfcG9pbnQueSA8PSB0aGlzLmJvdHRvbSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcm90ZWN0ZWQgcmVkdWNlTXV0YXRvcihfbXV0YXRvcjogTXV0YXRvcik6IHZvaWQgey8qICovIH1cclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gIC8qKlxyXG4gICAqIFN0b3JlcyBhbmQgbWFuaXB1bGF0ZXMgYSB0d29kaW1lbnNpb25hbCB2ZWN0b3IgY29tcHJpc2VkIG9mIHRoZSBjb21wb25lbnRzIHggYW5kIHlcclxuICAgKiBgYGBwbGFpbnRleHRcclxuICAgKiAgICAgICAgICAgICt5XHJcbiAgICogICAgICAgICAgICAgfF9fICt4XHJcbiAgICogYGBgXHJcbiAgICogQGF1dGhvcnMgTHVrYXMgU2NoZXVlcmxlLCBIRlUsIDIwMTlcclxuICAgKi9cclxuICBleHBvcnQgY2xhc3MgVmVjdG9yMiBleHRlbmRzIE11dGFibGUge1xyXG4gICAgcHJpdmF0ZSBkYXRhOiBGbG9hdDMyQXJyYXk7XHJcblxyXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKF94OiBudW1iZXIgPSAwLCBfeTogbnVtYmVyID0gMCkge1xyXG4gICAgICBzdXBlcigpO1xyXG4gICAgICB0aGlzLmRhdGEgPSBuZXcgRmxvYXQzMkFycmF5KFtfeCwgX3ldKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgeCgpOiBudW1iZXIge1xyXG4gICAgICByZXR1cm4gdGhpcy5kYXRhWzBdO1xyXG4gICAgfVxyXG4gICAgZ2V0IHkoKTogbnVtYmVyIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZGF0YVsxXTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgeChfeDogbnVtYmVyKSB7XHJcbiAgICAgIHRoaXMuZGF0YVswXSA9IF94O1xyXG4gICAgfVxyXG4gICAgc2V0IHkoX3k6IG51bWJlcikge1xyXG4gICAgICB0aGlzLmRhdGFbMV0gPSBfeTtcclxuICAgIH1cclxuXHJcbiAgICAvKiogXHJcbiAgICAgKiBBIHNob3J0aGFuZCBmb3Igd3JpdGluZyBgbmV3IFZlY3RvcjIoMCwgMClgLlxyXG4gICAgICogQHJldHVybnMgQSBuZXcgdmVjdG9yIHdpdGggdGhlIHZhbHVlcyAoMCwgMClcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBaRVJPKCk6IFZlY3RvcjIge1xyXG4gICAgICBsZXQgdmVjdG9yOiBWZWN0b3IyID0gbmV3IFZlY3RvcjIoKTtcclxuICAgICAgcmV0dXJuIHZlY3RvcjtcclxuICAgIH1cclxuXHJcbiAgICAvKiogXHJcbiAgICAgKiBBIHNob3J0aGFuZCBmb3Igd3JpdGluZyBgbmV3IFZlY3RvcjIoX3NjYWxlLCBfc2NhbGUpYC5cclxuICAgICAqIEBwYXJhbSBfc2NhbGUgdGhlIHNjYWxlIG9mIHRoZSB2ZWN0b3IuIERlZmF1bHQ6IDFcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBPTkUoX3NjYWxlOiBudW1iZXIgPSAxKTogVmVjdG9yMiB7XHJcbiAgICAgIGxldCB2ZWN0b3I6IFZlY3RvcjIgPSBuZXcgVmVjdG9yMihfc2NhbGUsIF9zY2FsZSk7XHJcbiAgICAgIHJldHVybiB2ZWN0b3I7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIFxyXG4gICAgICogQSBzaG9ydGhhbmQgZm9yIHdyaXRpbmcgYG5ldyBWZWN0b3IyKDAsIHkpYC5cclxuICAgICAqIEBwYXJhbSBfc2NhbGUgVGhlIG51bWJlciB0byB3cml0ZSBpbiB0aGUgeSBjb29yZGluYXRlLiBEZWZhdWx0OiAxXHJcbiAgICAgKiBAcmV0dXJucyBBIG5ldyB2ZWN0b3Igd2l0aCB0aGUgdmFsdWVzICgwLCBfc2NhbGUpXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgWShfc2NhbGU6IG51bWJlciA9IDEpOiBWZWN0b3IyIHtcclxuICAgICAgbGV0IHZlY3RvcjogVmVjdG9yMiA9IG5ldyBWZWN0b3IyKDAsIF9zY2FsZSk7XHJcbiAgICAgIHJldHVybiB2ZWN0b3I7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIFxyXG4gICAgICogQSBzaG9ydGhhbmQgZm9yIHdyaXRpbmcgYG5ldyBWZWN0b3IyKHgsIDApYC5cclxuICAgICAqIEBwYXJhbSBfc2NhbGUgVGhlIG51bWJlciB0byB3cml0ZSBpbiB0aGUgeCBjb29yZGluYXRlLiBEZWZhdWx0OiAxXHJcbiAgICAgKiBAcmV0dXJucyBBIG5ldyB2ZWN0b3Igd2l0aCB0aGUgdmFsdWVzIChfc2NhbGUsIDApXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgWChfc2NhbGU6IG51bWJlciA9IDEpOiBWZWN0b3IyIHtcclxuICAgICAgbGV0IHZlY3RvcjogVmVjdG9yMiA9IG5ldyBWZWN0b3IyKF9zY2FsZSwgMCk7XHJcbiAgICAgIHJldHVybiB2ZWN0b3I7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTm9ybWFsaXplcyBhIGdpdmVuIHZlY3RvciB0byB0aGUgZ2l2ZW4gbGVuZ3RoIHdpdGhvdXQgZWRpdGluZyB0aGUgb3JpZ2luYWwgdmVjdG9yLlxyXG4gICAgICogQHBhcmFtIF92ZWN0b3IgdGhlIHZlY3RvciB0byBub3JtYWxpemVcclxuICAgICAqIEBwYXJhbSBfbGVuZ3RoIHRoZSBsZW5ndGggb2YgdGhlIHJlc3VsdGluZyB2ZWN0b3IuIGRlZmF1bHRzIHRvIDFcclxuICAgICAqIEByZXR1cm5zIGEgbmV3IHZlY3RvciByZXByZXNlbnRpbmcgdGhlIG5vcm1hbGlzZWQgdmVjdG9yIHNjYWxlZCBieSB0aGUgZ2l2ZW4gbGVuZ3RoXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgTk9STUFMSVpBVElPTihfdmVjdG9yOiBWZWN0b3IyLCBfbGVuZ3RoOiBudW1iZXIgPSAxKTogVmVjdG9yMiB7XHJcbiAgICAgIGxldCB2ZWN0b3I6IFZlY3RvcjIgPSBWZWN0b3IyLlpFUk8oKTtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBsZXQgW3gsIHldID0gX3ZlY3Rvci5kYXRhO1xyXG4gICAgICAgIGxldCBmYWN0b3I6IG51bWJlciA9IF9sZW5ndGggLyBNYXRoLmh5cG90KHgsIHkpO1xyXG4gICAgICAgIHZlY3Rvci5kYXRhID0gbmV3IEZsb2F0MzJBcnJheShbX3ZlY3Rvci54ICogZmFjdG9yLCBfdmVjdG9yLnkgKiBmYWN0b3JdKTtcclxuICAgICAgfSBjYXRjaCAoX2UpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oX2UpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB2ZWN0b3I7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTY2FsZXMgYSBnaXZlbiB2ZWN0b3IgYnkgYSBnaXZlbiBzY2FsZSB3aXRob3V0IGNoYW5naW5nIHRoZSBvcmlnaW5hbCB2ZWN0b3JcclxuICAgICAqIEBwYXJhbSBfdmVjdG9yIFRoZSB2ZWN0b3IgdG8gc2NhbGUuXHJcbiAgICAgKiBAcGFyYW0gX3NjYWxlIFRoZSBzY2FsZSB0byBzY2FsZSB3aXRoLlxyXG4gICAgICogQHJldHVybnMgQSBuZXcgdmVjdG9yIHJlcHJlc2VudGluZyB0aGUgc2NhbGVkIHZlcnNpb24gb2YgdGhlIGdpdmVuIHZlY3RvclxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIFNDQUxFKF92ZWN0b3I6IFZlY3RvcjIsIF9zY2FsZTogbnVtYmVyKTogVmVjdG9yMiB7XHJcbiAgICAgIGxldCB2ZWN0b3I6IFZlY3RvcjIgPSBuZXcgVmVjdG9yMigpO1xyXG4gICAgICByZXR1cm4gdmVjdG9yO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3VtcyB1cCBtdWx0aXBsZSB2ZWN0b3JzLlxyXG4gICAgICogQHBhcmFtIF92ZWN0b3JzIEEgc2VyaWVzIG9mIHZlY3RvcnMgdG8gc3VtIHVwXHJcbiAgICAgKiBAcmV0dXJucyBBIG5ldyB2ZWN0b3IgcmVwcmVzZW50aW5nIHRoZSBzdW0gb2YgdGhlIGdpdmVuIHZlY3RvcnNcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBTVU0oLi4uX3ZlY3RvcnM6IFZlY3RvcjJbXSk6IFZlY3RvcjIge1xyXG4gICAgICBsZXQgcmVzdWx0OiBWZWN0b3IyID0gbmV3IFZlY3RvcjIoKTtcclxuICAgICAgZm9yIChsZXQgdmVjdG9yIG9mIF92ZWN0b3JzKVxyXG4gICAgICAgIHJlc3VsdC5kYXRhID0gbmV3IEZsb2F0MzJBcnJheShbcmVzdWx0LnggKyB2ZWN0b3IueCwgcmVzdWx0LnkgKyB2ZWN0b3IueV0pO1xyXG4gICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3VidHJhY3RzIHR3byB2ZWN0b3JzLlxyXG4gICAgICogQHBhcmFtIF9hIFRoZSB2ZWN0b3IgdG8gc3VidHJhY3QgZnJvbS5cclxuICAgICAqIEBwYXJhbSBfYiBUaGUgdmVjdG9yIHRvIHN1YnRyYWN0LlxyXG4gICAgICogQHJldHVybnMgQSBuZXcgdmVjdG9yIHJlcHJlc2VudGluZyB0aGUgZGlmZmVyZW5jZSBvZiB0aGUgZ2l2ZW4gdmVjdG9yc1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIERJRkZFUkVOQ0UoX2E6IFZlY3RvcjIsIF9iOiBWZWN0b3IyKTogVmVjdG9yMiB7XHJcbiAgICAgIGxldCB2ZWN0b3I6IFZlY3RvcjIgPSBuZXcgVmVjdG9yMjtcclxuICAgICAgdmVjdG9yLmRhdGEgPSBuZXcgRmxvYXQzMkFycmF5KFtfYS54IC0gX2IueCwgX2EueSAtIF9iLnldKTtcclxuICAgICAgcmV0dXJuIHZlY3RvcjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbXB1dGVzIHRoZSBkb3Rwcm9kdWN0IG9mIDIgdmVjdG9ycy5cclxuICAgICAqIEBwYXJhbSBfYSBUaGUgdmVjdG9yIHRvIG11bHRpcGx5LlxyXG4gICAgICogQHBhcmFtIF9iIFRoZSB2ZWN0b3IgdG8gbXVsdGlwbHkgYnkuXHJcbiAgICAgKiBAcmV0dXJucyBBIG5ldyB2ZWN0b3IgcmVwcmVzZW50aW5nIHRoZSBkb3Rwcm9kdWN0IG9mIHRoZSBnaXZlbiB2ZWN0b3JzXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgRE9UKF9hOiBWZWN0b3IyLCBfYjogVmVjdG9yMik6IG51bWJlciB7XHJcbiAgICAgIGxldCBzY2FsYXJQcm9kdWN0OiBudW1iZXIgPSBfYS54ICogX2IueCArIF9hLnkgKiBfYi55O1xyXG4gICAgICByZXR1cm4gc2NhbGFyUHJvZHVjdDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIG1hZ25pdHVkZSBvZiBhIGdpdmVuIHZlY3Rvci5cclxuICAgICAqIElmIHlvdSBvbmx5IG5lZWQgdG8gY29tcGFyZSBtYWduaXR1ZGVzIG9mIGRpZmZlcmVudCB2ZWN0b3JzLCB5b3UgY2FuIGNvbXBhcmUgc3F1YXJlZCBtYWduaXR1ZGVzIHVzaW5nIFZlY3RvcjIuTUFHTklUVURFU1FSIGluc3RlYWQuXHJcbiAgICAgKiBAc2VlIFZlY3RvcjIuTUFHTklUVURFU1FSXHJcbiAgICAgKiBAcGFyYW0gX3ZlY3RvciBUaGUgdmVjdG9yIHRvIGdldCB0aGUgbWFnbml0dWRlIG9mLlxyXG4gICAgICogQHJldHVybnMgQSBudW1iZXIgcmVwcmVzZW50aW5nIHRoZSBtYWduaXR1ZGUgb2YgdGhlIGdpdmVuIHZlY3Rvci5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBNQUdOSVRVREUoX3ZlY3RvcjogVmVjdG9yMik6IG51bWJlciB7XHJcbiAgICAgIGxldCBtYWduaXR1ZGU6IG51bWJlciA9IE1hdGguc3FydChWZWN0b3IyLk1BR05JVFVERVNRUihfdmVjdG9yKSk7XHJcbiAgICAgIHJldHVybiBtYWduaXR1ZGU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBzcXVhcmVkIG1hZ25pdHVkZSBvZiBhIGdpdmVuIHZlY3Rvci4gTXVjaCBsZXNzIGNhbGN1bGF0aW9uIGludGVuc2l2ZSB0aGFuIFZlY3RvcjIuTUFHTklUVURFLCBzaG91bGQgYmUgdXNlZCBpbnN0ZWFkIGlmIHBvc3NpYmxlLlxyXG4gICAgICogQHBhcmFtIF92ZWN0b3IgVGhlIHZlY3RvciB0byBnZXQgdGhlIHNxdWFyZWQgbWFnbml0dWRlIG9mLlxyXG4gICAgICogQHJldHVybnMgQSBudW1iZXIgcmVwcmVzZW50aW5nIHRoZSBzcXVhcmVkIG1hZ25pdHVkZSBvZiB0aGUgZ2l2ZW4gdmVjdG9yLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIE1BR05JVFVERVNRUihfdmVjdG9yOiBWZWN0b3IyKTogbnVtYmVyIHtcclxuICAgICAgbGV0IG1hZ25pdHVkZTogbnVtYmVyID0gVmVjdG9yMi5ET1QoX3ZlY3RvciwgX3ZlY3Rvcik7XHJcbiAgICAgIHJldHVybiBtYWduaXR1ZGU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxjdWxhdGVzIHRoZSBjcm9zcyBwcm9kdWN0IG9mIHR3byBWZWN0b3JzLiBEdWUgdG8gdGhlbSBiZWluZyBvbmx5IDIgRGltZW5zaW9uYWwsIHRoZSByZXN1bHQgaXMgYSBzaW5nbGUgbnVtYmVyLFxyXG4gICAgICogd2hpY2ggaW1wbGljaXRseSBpcyBvbiB0aGUgWiBheGlzLiBJdCBpcyBhbHNvIHRoZSBzaWduZWQgbWFnbml0dWRlIG9mIHRoZSByZXN1bHQuXHJcbiAgICAgKiBAcGFyYW0gX2EgVmVjdG9yIHRvIGNvbXB1dGUgdGhlIGNyb3NzIHByb2R1Y3Qgb25cclxuICAgICAqIEBwYXJhbSBfYiBWZWN0b3IgdG8gY29tcHV0ZSB0aGUgY3Jvc3MgcHJvZHVjdCB3aXRoXHJcbiAgICAgKiBAcmV0dXJucyBBIG51bWJlciByZXByZXNlbnRpbmcgcmVzdWx0IG9mIHRoZSBjcm9zcyBwcm9kdWN0LlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIENST1NTUFJPRFVDVChfYTogVmVjdG9yMiwgX2I6IFZlY3RvcjIpOiBudW1iZXIge1xyXG4gICAgICBsZXQgY3Jvc3NQcm9kdWN0OiBudW1iZXIgPSBfYS54ICogX2IueSAtIF9hLnkgKiBfYi54O1xyXG4gICAgICByZXR1cm4gY3Jvc3NQcm9kdWN0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsY3VsYXRlcyB0aGUgb3J0aG9nb25hbCB2ZWN0b3IgdG8gdGhlIGdpdmVuIHZlY3Rvci4gUm90YXRlcyBjb3VudGVyY2xvY2t3aXNlIGJ5IGRlZmF1bHQuXHJcbiAgICAgKiBgYGBwbGFpbnRleHRcclxuICAgICAqICAgIF4gICAgICAgICAgICAgICAgfFxyXG4gICAgICogICAgfCAgPT4gIDwtLSAgPT4gICB2ICA9PiAgLS0+XHJcbiAgICAgKiBgYGBcclxuICAgICAqIEBwYXJhbSBfdmVjdG9yIFZlY3RvciB0byBnZXQgdGhlIG9ydGhvZ29uYWwgZXF1aXZhbGVudCBvZlxyXG4gICAgICogQHBhcmFtIF9jbG9ja3dpc2UgU2hvdWxkIHRoZSByb3RhdGlvbiBiZSBjbG9ja3dpc2UgaW5zdGVhZCBvZiB0aGUgZGVmYXVsdCBjb3VudGVyY2xvY2t3aXNlPyBkZWZhdWx0OiBmYWxzZVxyXG4gICAgICogQHJldHVybnMgQSBWZWN0b3IgdGhhdCBpcyBvcnRob2dvbmFsIHRvIGFuZCBoYXMgdGhlIHNhbWUgbWFnbml0dWRlIGFzIHRoZSBnaXZlbiBWZWN0b3IuICBcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBPUlRIT0dPTkFMKF92ZWN0b3I6IFZlY3RvcjIsIF9jbG9ja3dpc2U6IGJvb2xlYW4gPSBmYWxzZSk6IFZlY3RvcjIge1xyXG4gICAgICBpZiAoX2Nsb2Nrd2lzZSkgcmV0dXJuIG5ldyBWZWN0b3IyKF92ZWN0b3IueSwgLV92ZWN0b3IueCk7XHJcbiAgICAgIGVsc2UgcmV0dXJuIG5ldyBWZWN0b3IyKC1fdmVjdG9yLnksIF92ZWN0b3IueCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIHRoZSBnaXZlbiB2ZWN0b3IgdG8gdGhlIGV4ZWN1dGluZyB2ZWN0b3IsIGNoYW5naW5nIHRoZSBleGVjdXRvci5cclxuICAgICAqIEBwYXJhbSBfYWRkZW5kIFRoZSB2ZWN0b3IgdG8gYWRkLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYWRkKF9hZGRlbmQ6IFZlY3RvcjIpOiB2b2lkIHtcclxuICAgICAgdGhpcy5kYXRhID0gbmV3IFZlY3RvcjIoX2FkZGVuZC54ICsgdGhpcy54LCBfYWRkZW5kLnkgKyB0aGlzLnkpLmRhdGE7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTdWJ0cmFjdHMgdGhlIGdpdmVuIHZlY3RvciBmcm9tIHRoZSBleGVjdXRpbmcgdmVjdG9yLCBjaGFuZ2luZyB0aGUgZXhlY3V0b3IuXHJcbiAgICAgKiBAcGFyYW0gX3N1YnRyYWhlbmQgVGhlIHZlY3RvciB0byBzdWJ0cmFjdC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHN1YnRyYWN0KF9zdWJ0cmFoZW5kOiBWZWN0b3IyKTogdm9pZCB7XHJcbiAgICAgIHRoaXMuZGF0YSA9IG5ldyBWZWN0b3IyKHRoaXMueCAtIF9zdWJ0cmFoZW5kLngsIHRoaXMueSAtIF9zdWJ0cmFoZW5kLnkpLmRhdGE7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTY2FsZXMgdGhlIFZlY3RvciBieSB0aGUgX3NjYWxlLlxyXG4gICAgICogQHBhcmFtIF9zY2FsZSBUaGUgc2NhbGUgdG8gbXVsdGlwbHkgdGhlIHZlY3RvciB3aXRoLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2NhbGUoX3NjYWxlOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgdGhpcy5kYXRhID0gbmV3IFZlY3RvcjIoX3NjYWxlICogdGhpcy54LCBfc2NhbGUgKiB0aGlzLnkpLmRhdGE7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBOb3JtYWxpemVzIHRoZSB2ZWN0b3IuXHJcbiAgICAgKiBAcGFyYW0gX2xlbmd0aCBBIG1vZGlmaWNhdG9yIHRvIGdldCBhIGRpZmZlcmVudCBsZW5ndGggb2Ygbm9ybWFsaXplZCB2ZWN0b3IuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBub3JtYWxpemUoX2xlbmd0aDogbnVtYmVyID0gMSk6IHZvaWQge1xyXG4gICAgICB0aGlzLmRhdGEgPSBWZWN0b3IyLk5PUk1BTElaQVRJT04odGhpcywgX2xlbmd0aCkuZGF0YTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIFZlY3RvciB0byB0aGUgZ2l2ZW4gcGFyYW1ldGVycy4gT21taXR0ZWQgcGFyYW1ldGVycyBkZWZhdWx0IHRvIDAuXHJcbiAgICAgKiBAcGFyYW0gX3ggbmV3IHggdG8gc2V0XHJcbiAgICAgKiBAcGFyYW0gX3kgbmV3IHkgdG8gc2V0XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZXQoX3g6IG51bWJlciA9IDAsIF95OiBudW1iZXIgPSAwKTogdm9pZCB7XHJcbiAgICAgIHRoaXMuZGF0YSA9IG5ldyBGbG9hdDMyQXJyYXkoW194LCBfeV0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2tzIHdoZXRoZXIgdGhlIGdpdmVuIFZlY3RvciBpcyBlcXVhbCB0byB0aGUgZXhlY3V0ZWQgVmVjdG9yLlxyXG4gICAgICogQHBhcmFtIF92ZWN0b3IgVGhlIHZlY3RvciB0byBjb21hcHJlIHdpdGguXHJcbiAgICAgKiBAcmV0dXJucyB0cnVlIGlmIHRoZSB0d28gdmVjdG9ycyBhcmUgZXF1YWwsIG90aGVyd2lzZSBmYWxzZVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZXF1YWxzKF92ZWN0b3I6IFZlY3RvcjIpOiBib29sZWFuIHtcclxuICAgICAgaWYgKHRoaXMuZGF0YVswXSA9PSBfdmVjdG9yLmRhdGFbMF0gJiYgdGhpcy5kYXRhWzFdID09IF92ZWN0b3IuZGF0YVsxXSkgcmV0dXJuIHRydWU7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEByZXR1cm5zIEFuIGFycmF5IG9mIHRoZSBkYXRhIG9mIHRoZSB2ZWN0b3JcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCgpOiBGbG9hdDMyQXJyYXkge1xyXG4gICAgICByZXR1cm4gbmV3IEZsb2F0MzJBcnJheSh0aGlzLmRhdGEpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHJldHVybnMgQSBkZWVwIGNvcHkgb2YgdGhlIHZlY3Rvci5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldCBjb3B5KCk6IFZlY3RvcjIge1xyXG4gICAgICByZXR1cm4gbmV3IFZlY3RvcjIodGhpcy54LCB0aGlzLnkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkcyBhIHotY29tcG9uZW50IHRvIHRoZSB2ZWN0b3IgYW5kIHJldHVybnMgYSBuZXcgVmVjdG9yM1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgdG9WZWN0b3IzKCk6IFZlY3RvcjMge1xyXG4gICAgICByZXR1cm4gbmV3IFZlY3RvcjModGhpcy54LCB0aGlzLnksIDApO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXRNdXRhdG9yKCk6IE11dGF0b3Ige1xyXG4gICAgICBsZXQgbXV0YXRvcjogTXV0YXRvciA9IHtcclxuICAgICAgICB4OiB0aGlzLmRhdGFbMF0sIHk6IHRoaXMuZGF0YVsxXVxyXG4gICAgICB9O1xyXG4gICAgICByZXR1cm4gbXV0YXRvcjtcclxuICAgIH1cclxuICAgIHByb3RlY3RlZCByZWR1Y2VNdXRhdG9yKF9tdXRhdG9yOiBNdXRhdG9yKTogdm9pZCB7LyoqICovIH1cclxuICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogU3RvcmVzIGFuZCBtYW5pcHVsYXRlcyBhIHRocmVlZGltZW5zaW9uYWwgdmVjdG9yIGNvbXByaXNlZCBvZiB0aGUgY29tcG9uZW50cyB4LCB5IGFuZCB6XHJcbiAgICAgKiBgYGBwbGFpbnRleHRcclxuICAgICAqICAgICAgICAgICAgK3lcclxuICAgICAqICAgICAgICAgICAgIHxfXyAreFxyXG4gICAgICogICAgICAgICAgICAvXHJcbiAgICAgKiAgICAgICAgICAreiAgIFxyXG4gICAgICogYGBgXHJcbiAgICAgKiBAYXV0aG9ycyBKYXNjaGEgS2FyYWfDtmwsIEhGVSwgMjAxOSB8IEppcmthIERlbGwnT3JvLUZyaWVkbCwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBWZWN0b3IzIGV4dGVuZHMgTXV0YWJsZSB7XHJcbiAgICAgICAgcHJpdmF0ZSBkYXRhOiBGbG9hdDMyQXJyYXk7IC8vIFRPRE86IGNoZWNrIHdoeSB0aGlzIHNob3VsZG4ndCBiZSB4LHkseiBhcyBudW1iZXJzLi4uXHJcblxyXG4gICAgICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihfeDogbnVtYmVyID0gMCwgX3k6IG51bWJlciA9IDAsIF96OiBudW1iZXIgPSAwKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IG5ldyBGbG9hdDMyQXJyYXkoW194LCBfeSwgX3pdKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFRPRE86IGltcGxlbWVudCBlcXVhbHMtZnVuY3Rpb25zXHJcbiAgICAgICAgZ2V0IHgoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0YVswXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZ2V0IHkoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0YVsxXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZ2V0IHooKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0YVsyXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHNldCB4KF94OiBudW1iZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzBdID0gX3g7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNldCB5KF95OiBudW1iZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzFdID0gX3k7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNldCB6KF96OiBudW1iZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5kYXRhWzJdID0gX3o7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIFgoX3NjYWxlOiBudW1iZXIgPSAxKTogVmVjdG9yMyB7XHJcbiAgICAgICAgICAgIGNvbnN0IHZlY3RvcjogVmVjdG9yMyA9IG5ldyBWZWN0b3IzKF9zY2FsZSwgMCwgMCk7XHJcbiAgICAgICAgICAgIHJldHVybiB2ZWN0b3I7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIFkoX3NjYWxlOiBudW1iZXIgPSAxKTogVmVjdG9yMyB7XHJcbiAgICAgICAgICAgIGNvbnN0IHZlY3RvcjogVmVjdG9yMyA9IG5ldyBWZWN0b3IzKDAsIF9zY2FsZSwgMCk7XHJcbiAgICAgICAgICAgIHJldHVybiB2ZWN0b3I7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIFooX3NjYWxlOiBudW1iZXIgPSAxKTogVmVjdG9yMyB7XHJcbiAgICAgICAgICAgIGNvbnN0IHZlY3RvcjogVmVjdG9yMyA9IG5ldyBWZWN0b3IzKDAsIDAsIF9zY2FsZSk7XHJcbiAgICAgICAgICAgIHJldHVybiB2ZWN0b3I7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIFpFUk8oKTogVmVjdG9yMyB7XHJcbiAgICAgICAgICAgIGNvbnN0IHZlY3RvcjogVmVjdG9yMyA9IG5ldyBWZWN0b3IzKDAsIDAsIDApO1xyXG4gICAgICAgICAgICByZXR1cm4gdmVjdG9yO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBPTkUoX3NjYWxlOiBudW1iZXIgPSAxKTogVmVjdG9yMyB7XHJcbiAgICAgICAgICAgIGNvbnN0IHZlY3RvcjogVmVjdG9yMyA9IG5ldyBWZWN0b3IzKF9zY2FsZSwgX3NjYWxlLCBfc2NhbGUpO1xyXG4gICAgICAgICAgICByZXR1cm4gdmVjdG9yO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBUUkFOU0ZPUk1BVElPTihfdmVjdG9yOiBWZWN0b3IzLCBfbWF0cml4OiBNYXRyaXg0eDQsIF9pbmNsdWRlVHJhbnNsYXRpb246IGJvb2xlYW4gPSB0cnVlKTogVmVjdG9yMyB7XHJcbiAgICAgICAgICAgIGxldCByZXN1bHQ6IFZlY3RvcjMgPSBuZXcgVmVjdG9yMygpO1xyXG4gICAgICAgICAgICBsZXQgbTogRmxvYXQzMkFycmF5ID0gX21hdHJpeC5nZXQoKTtcclxuICAgICAgICAgICAgbGV0IFt4LCB5LCB6XSA9IF92ZWN0b3IuZ2V0KCk7XHJcbiAgICAgICAgICAgIHJlc3VsdC54ID0gbVswXSAqIHggKyBtWzRdICogeSArIG1bOF0gKiB6O1xyXG4gICAgICAgICAgICByZXN1bHQueSA9IG1bMV0gKiB4ICsgbVs1XSAqIHkgKyBtWzldICogejtcclxuICAgICAgICAgICAgcmVzdWx0LnogPSBtWzJdICogeCArIG1bNl0gKiB5ICsgbVsxMF0gKiB6O1xyXG5cclxuICAgICAgICAgICAgaWYgKF9pbmNsdWRlVHJhbnNsYXRpb24pIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5hZGQoX21hdHJpeC50cmFuc2xhdGlvbik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBOT1JNQUxJWkFUSU9OKF92ZWN0b3I6IFZlY3RvcjMsIF9sZW5ndGg6IG51bWJlciA9IDEpOiBWZWN0b3IzIHtcclxuICAgICAgICAgICAgbGV0IHZlY3RvcjogVmVjdG9yMyA9IFZlY3RvcjMuWkVSTygpO1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgbGV0IFt4LCB5LCB6XSA9IF92ZWN0b3IuZGF0YTtcclxuICAgICAgICAgICAgICAgIGxldCBmYWN0b3I6IG51bWJlciA9IF9sZW5ndGggLyBNYXRoLmh5cG90KHgsIHksIHopO1xyXG4gICAgICAgICAgICAgICAgdmVjdG9yLmRhdGEgPSBuZXcgRmxvYXQzMkFycmF5KFtfdmVjdG9yLnggKiBmYWN0b3IsIF92ZWN0b3IueSAqIGZhY3RvciwgX3ZlY3Rvci56ICogZmFjdG9yXSk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKF9lKSB7XHJcbiAgICAgICAgICAgICAgICBEZWJ1Zy53YXJuKF9lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdmVjdG9yO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU3VtcyB1cCBtdWx0aXBsZSB2ZWN0b3JzLlxyXG4gICAgICAgICAqIEBwYXJhbSBfdmVjdG9ycyBBIHNlcmllcyBvZiB2ZWN0b3JzIHRvIHN1bSB1cFxyXG4gICAgICAgICAqIEByZXR1cm5zIEEgbmV3IHZlY3RvciByZXByZXNlbnRpbmcgdGhlIHN1bSBvZiB0aGUgZ2l2ZW4gdmVjdG9yc1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgU1VNKC4uLl92ZWN0b3JzOiBWZWN0b3IzW10pOiBWZWN0b3IzIHtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdDogVmVjdG9yMyA9IG5ldyBWZWN0b3IzKCk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHZlY3RvciBvZiBfdmVjdG9ycylcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5kYXRhID0gbmV3IEZsb2F0MzJBcnJheShbcmVzdWx0LnggKyB2ZWN0b3IueCwgcmVzdWx0LnkgKyB2ZWN0b3IueSwgcmVzdWx0LnogKyB2ZWN0b3Iuel0pO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTdWJ0cmFjdHMgdHdvIHZlY3RvcnMuXHJcbiAgICAgICAgICogQHBhcmFtIF9hIFRoZSB2ZWN0b3IgdG8gc3VidHJhY3QgZnJvbS5cclxuICAgICAgICAgKiBAcGFyYW0gX2IgVGhlIHZlY3RvciB0byBzdWJ0cmFjdC5cclxuICAgICAgICAgKiBAcmV0dXJucyBBIG5ldyB2ZWN0b3IgcmVwcmVzZW50aW5nIHRoZSBkaWZmZXJlbmNlIG9mIHRoZSBnaXZlbiB2ZWN0b3JzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBESUZGRVJFTkNFKF9hOiBWZWN0b3IzLCBfYjogVmVjdG9yMyk6IFZlY3RvcjMge1xyXG4gICAgICAgICAgICBsZXQgdmVjdG9yOiBWZWN0b3IzID0gbmV3IFZlY3RvcjM7XHJcbiAgICAgICAgICAgIHZlY3Rvci5kYXRhID0gbmV3IEZsb2F0MzJBcnJheShbX2EueCAtIF9iLngsIF9hLnkgLSBfYi55LCBfYS56IC0gX2Iuel0pO1xyXG4gICAgICAgICAgICByZXR1cm4gdmVjdG9yO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXR1cm5zIGEgbmV3IHZlY3RvciByZXByZXNlbnRpbmcgdGhlIGdpdmVuIHZlY3RvciBzY2FsZWQgYnkgdGhlIGdpdmVuIHNjYWxpbmcgZmFjdG9yXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBTQ0FMRShfdmVjdG9yOiBWZWN0b3IzLCBfc2NhbGluZzogbnVtYmVyKTogVmVjdG9yMyB7XHJcbiAgICAgICAgICAgIGxldCBzY2FsZWQ6IFZlY3RvcjMgPSBuZXcgVmVjdG9yMygpO1xyXG4gICAgICAgICAgICBzY2FsZWQuZGF0YSA9IG5ldyBGbG9hdDMyQXJyYXkoW192ZWN0b3IueCAqIF9zY2FsaW5nLCBfdmVjdG9yLnkgKiBfc2NhbGluZywgX3ZlY3Rvci56ICogX3NjYWxpbmddKTtcclxuICAgICAgICAgICAgcmV0dXJuIHNjYWxlZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ29tcHV0ZXMgdGhlIGNyb3NzcHJvZHVjdCBvZiAyIHZlY3RvcnMuXHJcbiAgICAgICAgICogQHBhcmFtIF9hIFRoZSB2ZWN0b3IgdG8gbXVsdGlwbHkuXHJcbiAgICAgICAgICogQHBhcmFtIF9iIFRoZSB2ZWN0b3IgdG8gbXVsdGlwbHkgYnkuXHJcbiAgICAgICAgICogQHJldHVybnMgQSBuZXcgdmVjdG9yIHJlcHJlc2VudGluZyB0aGUgY3Jvc3Nwcm9kdWN0IG9mIHRoZSBnaXZlbiB2ZWN0b3JzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBDUk9TUyhfYTogVmVjdG9yMywgX2I6IFZlY3RvcjMpOiBWZWN0b3IzIHtcclxuICAgICAgICAgICAgbGV0IHZlY3RvcjogVmVjdG9yMyA9IG5ldyBWZWN0b3IzO1xyXG4gICAgICAgICAgICB2ZWN0b3IuZGF0YSA9IG5ldyBGbG9hdDMyQXJyYXkoW1xyXG4gICAgICAgICAgICAgICAgX2EueSAqIF9iLnogLSBfYS56ICogX2IueSxcclxuICAgICAgICAgICAgICAgIF9hLnogKiBfYi54IC0gX2EueCAqIF9iLnosXHJcbiAgICAgICAgICAgICAgICBfYS54ICogX2IueSAtIF9hLnkgKiBfYi54XSk7XHJcbiAgICAgICAgICAgIHJldHVybiB2ZWN0b3I7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENvbXB1dGVzIHRoZSBkb3Rwcm9kdWN0IG9mIDIgdmVjdG9ycy5cclxuICAgICAgICAgKiBAcGFyYW0gX2EgVGhlIHZlY3RvciB0byBtdWx0aXBseS5cclxuICAgICAgICAgKiBAcGFyYW0gX2IgVGhlIHZlY3RvciB0byBtdWx0aXBseSBieS5cclxuICAgICAgICAgKiBAcmV0dXJucyBBIG5ldyB2ZWN0b3IgcmVwcmVzZW50aW5nIHRoZSBkb3Rwcm9kdWN0IG9mIHRoZSBnaXZlbiB2ZWN0b3JzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBET1QoX2E6IFZlY3RvcjMsIF9iOiBWZWN0b3IzKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgbGV0IHNjYWxhclByb2R1Y3Q6IG51bWJlciA9IF9hLnggKiBfYi54ICsgX2EueSAqIF9iLnkgKyBfYS56ICogX2IuejtcclxuICAgICAgICAgICAgcmV0dXJuIHNjYWxhclByb2R1Y3Q7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDYWxjdWxhdGVzIGFuZCByZXR1cm5zIHRoZSByZWZsZWN0aW9uIG9mIHRoZSBpbmNvbWluZyB2ZWN0b3IgYXQgdGhlIGdpdmVuIG5vcm1hbCB2ZWN0b3IuIFRoZSBsZW5ndGggb2Ygbm9ybWFsIHNob3VsZCBiZSAxLlxyXG4gICAgICAgICAqICAgICBfX19fX19fX19fX19fX19fX19cclxuICAgICAgICAgKiAgICAgICAgICAgL3xcXFxyXG4gICAgICAgICAqIGluY29taW5nIC8gfCBcXCByZWZsZWN0aW9uXHJcbiAgICAgICAgICogICAgICAgICAvICB8ICBcXCAgIFxyXG4gICAgICAgICAqICAgICAgICAgIG5vcm1hbFxyXG4gICAgICAgICAqIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgUkVGTEVDVElPTihfaW5jb21pbmc6IFZlY3RvcjMsIF9ub3JtYWw6IFZlY3RvcjMpOiBWZWN0b3IzIHtcclxuICAgICAgICAgICAgbGV0IGRvdDogbnVtYmVyID0gLVZlY3RvcjMuRE9UKF9pbmNvbWluZywgX25vcm1hbCk7XHJcbiAgICAgICAgICAgIGxldCByZWZsZWN0aW9uOiBWZWN0b3IzID0gVmVjdG9yMy5TVU0oX2luY29taW5nLCBWZWN0b3IzLlNDQUxFKF9ub3JtYWwsIDIgKiBkb3QpKTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlZmxlY3Rpb247XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgYWRkKF9hZGRlbmQ6IFZlY3RvcjMpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5kYXRhID0gbmV3IFZlY3RvcjMoX2FkZGVuZC54ICsgdGhpcy54LCBfYWRkZW5kLnkgKyB0aGlzLnksIF9hZGRlbmQueiArIHRoaXMueikuZGF0YTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHVibGljIHN1YnRyYWN0KF9zdWJ0cmFoZW5kOiBWZWN0b3IzKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IG5ldyBWZWN0b3IzKHRoaXMueCAtIF9zdWJ0cmFoZW5kLngsIHRoaXMueSAtIF9zdWJ0cmFoZW5kLnksIHRoaXMueiAtIF9zdWJ0cmFoZW5kLnopLmRhdGE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHB1YmxpYyBzY2FsZShfc2NhbGU6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmRhdGEgPSBuZXcgVmVjdG9yMyhfc2NhbGUgKiB0aGlzLngsIF9zY2FsZSAqIHRoaXMueSwgX3NjYWxlICogdGhpcy56KS5kYXRhO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG5vcm1hbGl6ZShfbGVuZ3RoOiBudW1iZXIgPSAxKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IFZlY3RvcjMuTk9STUFMSVpBVElPTih0aGlzLCBfbGVuZ3RoKS5kYXRhO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHNldChfeDogbnVtYmVyID0gMCwgX3k6IG51bWJlciA9IDAsIF96OiBudW1iZXIgPSAwKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IG5ldyBGbG9hdDMyQXJyYXkoW194LCBfeSwgX3pdKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXQoKTogRmxvYXQzMkFycmF5IHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBGbG9hdDMyQXJyYXkodGhpcy5kYXRhKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBnZXQgY29weSgpOiBWZWN0b3IzIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBWZWN0b3IzKHRoaXMueCwgdGhpcy55LCB0aGlzLnopO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHRyYW5zZm9ybShfbWF0cml4OiBNYXRyaXg0eDQsIF9pbmNsdWRlVHJhbnNsYXRpb246IGJvb2xlYW4gPSB0cnVlKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IFZlY3RvcjMuVFJBTlNGT1JNQVRJT04odGhpcywgX21hdHJpeCwgX2luY2x1ZGVUcmFuc2xhdGlvbikuZGF0YTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERyb3BzIHRoZSB6LWNvbXBvbmVudCBhbmQgcmV0dXJucyBhIFZlY3RvcjIgY29uc2lzdGluZyBvZiB0aGUgeC0gYW5kIHktY29tcG9uZW50c1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyB0b1ZlY3RvcjIoKTogVmVjdG9yMiB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVmVjdG9yMih0aGlzLngsIHRoaXMueSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgcmVmbGVjdChfbm9ybWFsOiBWZWN0b3IzKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlZmxlY3RlZDogVmVjdG9yMyA9IFZlY3RvcjMuUkVGTEVDVElPTih0aGlzLCBfbm9ybWFsKTtcclxuICAgICAgICAgICAgdGhpcy5zZXQocmVmbGVjdGVkLngsIHJlZmxlY3RlZC55LCByZWZsZWN0ZWQueik7XHJcbiAgICAgICAgICAgIFJlY3ljbGVyLnN0b3JlKHJlZmxlY3RlZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZ2V0TXV0YXRvcigpOiBNdXRhdG9yIHtcclxuICAgICAgICAgICAgbGV0IG11dGF0b3I6IE11dGF0b3IgPSB7XHJcbiAgICAgICAgICAgICAgICB4OiB0aGlzLmRhdGFbMF0sIHk6IHRoaXMuZGF0YVsxXSwgejogdGhpcy5kYXRhWzJdXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHJldHVybiBtdXRhdG9yO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwcm90ZWN0ZWQgcmVkdWNlTXV0YXRvcihfbXV0YXRvcjogTXV0YXRvcik6IHZvaWQgey8qKiAqLyB9XHJcbiAgICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogQWJzdHJhY3QgYmFzZSBjbGFzcyBmb3IgYWxsIG1lc2hlcy4gXHJcbiAgICAgKiBNZXNoZXMgcHJvdmlkZSBpbmRleGVkIHZlcnRpY2VzLCB0aGUgb3JkZXIgb2YgaW5kaWNlcyB0byBjcmVhdGUgdHJpZ29ucyBhbmQgbm9ybWFscywgYW5kIHRleHR1cmUgY29vcmRpbmF0ZXNcclxuICAgICAqIFxyXG4gICAgICogQGF1dGhvcnMgSmlya2EgRGVsbCdPcm8tRnJpZWRsLCBIRlUsIDIwMTlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGFic3RyYWN0IGNsYXNzIE1lc2ggaW1wbGVtZW50cyBTZXJpYWxpemFibGVSZXNvdXJjZSB7XHJcbiAgICAgICAgLy8gVE9ETzogY2hlY2sgaWYgdGhlc2UgYXJyYXlzIG11c3QgYmUgY2FjaGVkIGxpa2UgdGhpcyBvciBpZiBjYWxsaW5nIHRoZSBtZXRob2RzIGlzIGJldHRlci5cclxuICAgICAgICBwdWJsaWMgdmVydGljZXM6IEZsb2F0MzJBcnJheTtcclxuICAgICAgICBwdWJsaWMgaW5kaWNlczogVWludDE2QXJyYXk7XHJcbiAgICAgICAgcHVibGljIHRleHR1cmVVVnM6IEZsb2F0MzJBcnJheTtcclxuICAgICAgICBwdWJsaWMgbm9ybWFsc0ZhY2U6IEZsb2F0MzJBcnJheTtcclxuXHJcbiAgICAgICAgcHVibGljIGlkUmVzb3VyY2U6IHN0cmluZyA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXRCdWZmZXJTcGVjaWZpY2F0aW9uKCk6IEJ1ZmZlclNwZWNpZmljYXRpb24ge1xyXG4gICAgICAgICAgICByZXR1cm4geyBzaXplOiAzLCBkYXRhVHlwZTogV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5GTE9BVCwgbm9ybWFsaXplOiBmYWxzZSwgc3RyaWRlOiAwLCBvZmZzZXQ6IDAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHVibGljIGdldFZlcnRleENvdW50KCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnZlcnRpY2VzLmxlbmd0aCAvIE1lc2guZ2V0QnVmZmVyU3BlY2lmaWNhdGlvbigpLnNpemU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHB1YmxpYyBnZXRJbmRleENvdW50KCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmluZGljZXMubGVuZ3RoO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gU2VyaWFsaXplL0Rlc2VyaWFsaXplIGZvciBhbGwgbWVzaGVzIHRoYXQgY2FsY3VsYXRlIHdpdGhvdXQgcGFyYW1ldGVyc1xyXG4gICAgICAgIHB1YmxpYyBzZXJpYWxpemUoKTogU2VyaWFsaXphdGlvbiB7XHJcbiAgICAgICAgICAgIGxldCBzZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uID0ge1xyXG4gICAgICAgICAgICAgICAgaWRSZXNvdXJjZTogdGhpcy5pZFJlc291cmNlXHJcbiAgICAgICAgICAgIH07IC8vIG5vIGRhdGEgbmVlZGVkIC4uLlxyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsaXphdGlvbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHVibGljIGRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uKTogU2VyaWFsaXphYmxlIHtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGUoKTsgLy8gVE9ETzogbXVzdCBub3QgYmUgY3JlYXRlZCwgaWYgYW4gaWRlbnRpY2FsIG1lc2ggYWxyZWFkeSBleGlzdHNcclxuICAgICAgICAgICAgdGhpcy5pZFJlc291cmNlID0gX3NlcmlhbGl6YXRpb24uaWRSZXNvdXJjZTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgYWJzdHJhY3QgY3JlYXRlKCk6IHZvaWQ7XHJcbiAgICAgICAgcHJvdGVjdGVkIGFic3RyYWN0IGNyZWF0ZVZlcnRpY2VzKCk6IEZsb2F0MzJBcnJheTtcclxuICAgICAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgY3JlYXRlVGV4dHVyZVVWcygpOiBGbG9hdDMyQXJyYXk7XHJcbiAgICAgICAgcHJvdGVjdGVkIGFic3RyYWN0IGNyZWF0ZUluZGljZXMoKTogVWludDE2QXJyYXk7XHJcbiAgICAgICAgcHJvdGVjdGVkIGFic3RyYWN0IGNyZWF0ZUZhY2VOb3JtYWxzKCk6IEZsb2F0MzJBcnJheTtcclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBHZW5lcmF0ZSBhIHNpbXBsZSBjdWJlIHdpdGggZWRnZXMgb2YgbGVuZ3RoIDEsIGVhY2ggZmFjZSBjb25zaXN0aW5nIG9mIHR3byB0cmlnb25zXHJcbiAgICAgKiBgYGBwbGFpbnRleHRcclxuICAgICAqICAgICAgICAgICAgNF9fX183XHJcbiAgICAgKiAgICAgICAgICAgMC9fXzMvfFxyXG4gICAgICogICAgICAgICAgICB8fDVffHw2XHJcbiAgICAgKiAgICAgICAgICAgMXwvXzJ8LyBcclxuICAgICAqIGBgYFxyXG4gICAgICogQGF1dGhvcnMgSmlya2EgRGVsbCdPcm8tRnJpZWRsLCBIRlUsIDIwMTlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIE1lc2hDdWJlIGV4dGVuZHMgTWVzaCB7XHJcbiAgICAgICAgcHVibGljIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGNyZWF0ZSgpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy52ZXJ0aWNlcyA9IHRoaXMuY3JlYXRlVmVydGljZXMoKTtcclxuICAgICAgICAgICAgdGhpcy5pbmRpY2VzID0gdGhpcy5jcmVhdGVJbmRpY2VzKCk7XHJcbiAgICAgICAgICAgIHRoaXMudGV4dHVyZVVWcyA9IHRoaXMuY3JlYXRlVGV4dHVyZVVWcygpO1xyXG4gICAgICAgICAgICB0aGlzLm5vcm1hbHNGYWNlID0gdGhpcy5jcmVhdGVGYWNlTm9ybWFscygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJvdGVjdGVkIGNyZWF0ZVZlcnRpY2VzKCk6IEZsb2F0MzJBcnJheSB7XHJcbiAgICAgICAgICAgIGxldCB2ZXJ0aWNlczogRmxvYXQzMkFycmF5ID0gbmV3IEZsb2F0MzJBcnJheShbXHJcbiAgICAgICAgICAgICAgICAvLyBGaXJzdCB3cmFwXHJcbiAgICAgICAgICAgICAgICAvLyBmcm9udFxyXG4gICAgICAgICAgICAgICAgLyowKi8gLTEsIDEsIDEsIC8qMSovIC0xLCAtMSwgMSwgIC8qMiovIDEsIC0xLCAxLCAvKjMqLyAxLCAxLCAxLFxyXG4gICAgICAgICAgICAgICAgLy8gYmFja1xyXG4gICAgICAgICAgICAgICAgLyo0Ki8gLTEsIDEsIC0xLCAvKiA1Ki8gLTEsIC0xLCAtMSwgIC8qIDYqLyAxLCAtMSwgLTEsIC8qIDcqLyAxLCAxLCAtMSxcclxuICAgICAgICAgICAgICAgIC8vIFNlY29uZCB3cmFwXHJcbiAgICAgICAgICAgICAgICAvLyBmcm9udFxyXG4gICAgICAgICAgICAgICAgLyowKi8gLTEsIDEsIDEsIC8qMSovIC0xLCAtMSwgMSwgIC8qMiovIDEsIC0xLCAxLCAvKjMqLyAxLCAxLCAxLFxyXG4gICAgICAgICAgICAgICAgLy8gYmFja1xyXG4gICAgICAgICAgICAgICAgLyo0Ki8gLTEsIDEsIC0xLCAvKiA1Ki8gLTEsIC0xLCAtMSwgIC8qIDYqLyAxLCAtMSwgLTEsIC8qIDcqLyAxLCAxLCAtMVxyXG4gICAgICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgICAgIC8vIHNjYWxlIGRvd24gdG8gYSBsZW5ndGggb2YgMSBmb3IgYWxsIGVkZ2VzXHJcbiAgICAgICAgICAgIHZlcnRpY2VzID0gdmVydGljZXMubWFwKF92YWx1ZSA9PiBfdmFsdWUgLyAyKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB2ZXJ0aWNlcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByb3RlY3RlZCBjcmVhdGVJbmRpY2VzKCk6IFVpbnQxNkFycmF5IHtcclxuICAgICAgICAgICAgbGV0IGluZGljZXM6IFVpbnQxNkFycmF5ID0gbmV3IFVpbnQxNkFycmF5KFtcclxuICAgICAgICAgICAgICAgIC8vIEZpcnN0IHdyYXBcclxuICAgICAgICAgICAgICAgIC8vIGZyb250XHJcbiAgICAgICAgICAgICAgICAxLCAyLCAwLCAyLCAzLCAwLCBcclxuICAgICAgICAgICAgICAgIC8vIHJpZ2h0XHJcbiAgICAgICAgICAgICAgICAyLCA2LCAzLCA2LCA3LCAzLFxyXG4gICAgICAgICAgICAgICAgLy8gYmFja1xyXG4gICAgICAgICAgICAgICAgNiwgNSwgNywgNSwgNCwgNyxcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBTZWNvbmQgd3JhcFxyXG4gICAgICAgICAgICAgICAgLy8gbGVmdFxyXG4gICAgICAgICAgICAgICAgNSArIDgsIDEgKyA4LCA0ICsgOCwgMSArIDgsIDAgKyA4LCA0ICsgOCxcclxuICAgICAgICAgICAgICAgIC8vIHRvcFxyXG4gICAgICAgICAgICAgICAgNCArIDgsIDAgKyA4LCAzICsgOCwgNyArIDgsIDQgKyA4LCAzICsgOCxcclxuICAgICAgICAgICAgICAgIC8vIGJvdHRvbVxyXG4gICAgICAgICAgICAgICAgNSArIDgsIDYgKyA4LCAxICsgOCwgNiArIDgsIDIgKyA4LCAxICsgOFxyXG5cclxuICAgICAgICAgICAgICAgIC8qLFxyXG4gICAgICAgICAgICAgICAgLy8gbGVmdFxyXG4gICAgICAgICAgICAgICAgNCwgNSwgMSwgNCwgMSwgMCxcclxuICAgICAgICAgICAgICAgIC8vIHRvcFxyXG4gICAgICAgICAgICAgICAgNCwgMCwgMywgNCwgMywgNyxcclxuICAgICAgICAgICAgICAgIC8vIGJvdHRvbVxyXG4gICAgICAgICAgICAgICAgMSwgNSwgNiwgMSwgNiwgMlxyXG4gICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgICAgIHJldHVybiBpbmRpY2VzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJvdGVjdGVkIGNyZWF0ZVRleHR1cmVVVnMoKTogRmxvYXQzMkFycmF5IHtcclxuICAgICAgICAgICAgbGV0IHRleHR1cmVVVnM6IEZsb2F0MzJBcnJheSA9IG5ldyBGbG9hdDMyQXJyYXkoW1xyXG4gICAgICAgICAgICAgICAgLy8gRmlyc3Qgd3JhcFxyXG4gICAgICAgICAgICAgICAgLy8gZnJvbnRcclxuICAgICAgICAgICAgICAgIC8qMCovIDAsIDAsIC8qMSovIDAsIDEsICAvKjIqLyAxLCAxLCAvKjMqLyAxLCAwLFxyXG4gICAgICAgICAgICAgICAgLy8gYmFja1xyXG4gICAgICAgICAgICAgICAgLyo0Ki8gMywgMCwgLyo1Ki8gMywgMSwgIC8qNiovIDIsIDEsIC8qNyovIDIsIDAsXHJcblxyXG4gICAgICAgICAgICAgICAgLy8gU2Vjb25kIHdyYXBcclxuICAgICAgICAgICAgICAgIC8vIGZyb250XHJcbiAgICAgICAgICAgICAgICAvKjAqLyAxLCAwLCAvKjEqLyAxLCAxLCAgLyoyKi8gMSwgMiwgLyozKi8gMSwgLTEsXHJcbiAgICAgICAgICAgICAgICAvLyBiYWNrXHJcbiAgICAgICAgICAgICAgICAvKjQqLyAwLCAwLCAvKjUqLyAwLCAxLCAgLyo2Ki8gMCwgMiwgLyo3Ki8gMCwgLTFcclxuICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0ZXh0dXJlVVZzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJvdGVjdGVkIGNyZWF0ZUZhY2VOb3JtYWxzKCk6IEZsb2F0MzJBcnJheSB7XHJcbiAgICAgICAgICAgIGxldCBub3JtYWxzOiBGbG9hdDMyQXJyYXkgPSBuZXcgRmxvYXQzMkFycmF5KFtcclxuICAgICAgICAgICAgICAgIC8vIGZvciBlYWNoIHRyaWFuZ2xlLCB0aGUgbGFzdCB2ZXJ0ZXggb2YgdGhlIHRocmVlIGRlZmluaW5nIHJlZmVycyB0byB0aGUgbm9ybWFsdmVjdG9yIHdoZW4gdXNpbmcgZmxhdCBzaGFkaW5nXHJcbiAgICAgICAgICAgICAgICAvLyBGaXJzdCB3cmFwXHJcbiAgICAgICAgICAgICAgICAvLyBmcm9udFxyXG4gICAgICAgICAgICAgICAgLyowKi8gMCwgMCwgMSwgLyoxKi8gMCwgMCwgMCwgLyoyKi8gMCwgMCwgMCwgLyozKi8gMSwgMCwgMCxcclxuICAgICAgICAgICAgICAgIC8vIGJhY2tcclxuICAgICAgICAgICAgICAgIC8qNCovIDAsIDAsIDAsIC8qNSovIDAsIDAsIDAsIC8qNiovIDAsIDAsIDAsIC8qNyovIDAsIDAsIC0xLFxyXG5cclxuICAgICAgICAgICAgICAgIC8vIFNlY29uZCB3cmFwXHJcbiAgICAgICAgICAgICAgICAvLyBmcm9udFxyXG4gICAgICAgICAgICAgICAgLyowKi8gMCwgMCwgMCwgLyoxKi8gMCwgLTEsIDAsIC8qMiovIDAsIDAsIDAsIC8qMyovIDAsIDEsIDAsXHJcbiAgICAgICAgICAgICAgICAvLyBiYWNrXHJcbiAgICAgICAgICAgICAgICAvKjQqLyAtMSwgMCwgMCwgLyo1Ki8gMCwgMCwgMCwgLyo2Ki8gMCwgMCwgMCwgLyo3Ki8gMCwgMCwgMFxyXG4gICAgICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgICAgIC8vbm9ybWFscyA9IHRoaXMuY3JlYXRlVmVydGljZXMoKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBub3JtYWxzO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBHZW5lcmF0ZSBhIHNpbXBsZSBweXJhbWlkIHdpdGggZWRnZXMgYXQgdGhlIGJhc2Ugb2YgbGVuZ3RoIDEgYW5kIGEgaGVpZ2h0IG9mIDEuIFRoZSBzaWRlcyBjb25zaXN0aW5nIG9mIG9uZSwgdGhlIGJhc2Ugb2YgdHdvIHRyaWdvbnNcclxuICAgICAqIGBgYHBsYWludGV4dFxyXG4gICAgICogICAgICAgICAgICAgICA0XHJcbiAgICAgKiAgICAgICAgICAgICAgL1xcYC5cclxuICAgICAqICAgICAgICAgICAgMy9fX1xcX1xcIDJcclxuICAgICAqICAgICAgICAgICAwL19fX19cXC8xXHJcbiAgICAgKiBgYGBcclxuICAgICAqIEBhdXRob3JzIEppcmthIERlbGwnT3JvLUZyaWVkbCwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBNZXNoUHlyYW1pZCBleHRlbmRzIE1lc2gge1xyXG4gICAgICAgIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBjcmVhdGUoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMudmVydGljZXMgPSB0aGlzLmNyZWF0ZVZlcnRpY2VzKCk7XHJcbiAgICAgICAgICAgIHRoaXMuaW5kaWNlcyA9IHRoaXMuY3JlYXRlSW5kaWNlcygpO1xyXG4gICAgICAgICAgICB0aGlzLnRleHR1cmVVVnMgPSB0aGlzLmNyZWF0ZVRleHR1cmVVVnMoKTtcclxuICAgICAgICAgICAgdGhpcy5ub3JtYWxzRmFjZSA9IHRoaXMuY3JlYXRlRmFjZU5vcm1hbHMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByb3RlY3RlZCBjcmVhdGVWZXJ0aWNlcygpOiBGbG9hdDMyQXJyYXkge1xyXG4gICAgICAgICAgICBsZXQgdmVydGljZXM6IEZsb2F0MzJBcnJheSA9IG5ldyBGbG9hdDMyQXJyYXkoW1xyXG4gICAgICAgICAgICAgICAgLy8gZmxvb3JcclxuICAgICAgICAgICAgICAgIC8qMCovIC0xLCAwLCAxLCAvKjEqLyAxLCAwLCAxLCAgLyoyKi8gMSwgMCwgLTEsIC8qMyovIC0xLCAwLCAtMSxcclxuICAgICAgICAgICAgICAgIC8vIHRpcFxyXG4gICAgICAgICAgICAgICAgLyo0Ki8gMCwgMiwgMCwgIC8vIGRvdWJsZSBoZWlnaHQgd2lsbCBiZSBzY2FsZWQgZG93blxyXG4gICAgICAgICAgICAgICAgLy8gZmxvb3IgYWdhaW4gZm9yIHRleHR1cmluZyBhbmQgbm9ybWFsc1xyXG4gICAgICAgICAgICAgICAgLyo1Ki8gLTEsIDAsIDEsIC8qNiovIDEsIDAsIDEsICAvKjcqLyAxLCAwLCAtMSwgLyo4Ki8gLTEsIDAsIC0xXHJcbiAgICAgICAgICAgIF0pO1xyXG5cclxuICAgICAgICAgICAgLy8gc2NhbGUgZG93biB0byBhIGxlbmd0aCBvZiAxIGZvciBib3R0b20gZWRnZXMgYW5kIGhlaWdodFxyXG4gICAgICAgICAgICB2ZXJ0aWNlcyA9IHZlcnRpY2VzLm1hcChfdmFsdWUgPT4gX3ZhbHVlIC8gMik7XHJcbiAgICAgICAgICAgIHJldHVybiB2ZXJ0aWNlcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByb3RlY3RlZCBjcmVhdGVJbmRpY2VzKCk6IFVpbnQxNkFycmF5IHtcclxuICAgICAgICAgICAgbGV0IGluZGljZXM6IFVpbnQxNkFycmF5ID0gbmV3IFVpbnQxNkFycmF5KFtcclxuICAgICAgICAgICAgICAgIC8vIGZyb250XHJcbiAgICAgICAgICAgICAgICA0LCAwLCAxLFxyXG4gICAgICAgICAgICAgICAgLy8gcmlnaHRcclxuICAgICAgICAgICAgICAgIDQsIDEsIDIsXHJcbiAgICAgICAgICAgICAgICAvLyBiYWNrXHJcbiAgICAgICAgICAgICAgICA0LCAyLCAzLFxyXG4gICAgICAgICAgICAgICAgLy8gbGVmdFxyXG4gICAgICAgICAgICAgICAgNCwgMywgMCxcclxuICAgICAgICAgICAgICAgIC8vIGJvdHRvbVxyXG4gICAgICAgICAgICAgICAgNSArIDAsIDUgKyAyLCA1ICsgMSwgNSArIDAsIDUgKyAzLCA1ICsgMlxyXG4gICAgICAgICAgICBdKTtcclxuICAgICAgICAgICAgcmV0dXJuIGluZGljZXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcm90ZWN0ZWQgY3JlYXRlVGV4dHVyZVVWcygpOiBGbG9hdDMyQXJyYXkge1xyXG4gICAgICAgICAgICBsZXQgdGV4dHVyZVVWczogRmxvYXQzMkFycmF5ID0gbmV3IEZsb2F0MzJBcnJheShbXHJcbiAgICAgICAgICAgICAgICAvLyBmcm9udFxyXG4gICAgICAgICAgICAgICAgLyowKi8gMCwgMSwgLyoxKi8gMC41LCAxLCAgLyoyKi8gMSwgMSwgLyozKi8gMC41LCAxLFxyXG4gICAgICAgICAgICAgICAgLy8gYmFja1xyXG4gICAgICAgICAgICAgICAgLyo0Ki8gMC41LCAwLFxyXG4gICAgICAgICAgICAgICAgLyo1Ki8gMCwgMCwgLyo2Ki8gMSwgMCwgIC8qNyovIDEsIDEsIC8qOCovIDAsIDFcclxuICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0ZXh0dXJlVVZzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJvdGVjdGVkIGNyZWF0ZUZhY2VOb3JtYWxzKCk6IEZsb2F0MzJBcnJheSB7XHJcbiAgICAgICAgICAgIGxldCBub3JtYWxzOiBudW1iZXJbXSA9IFtdO1xyXG4gICAgICAgICAgICBsZXQgdmVydGljZXM6IFZlY3RvcjNbXSA9IFtdO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgdjogbnVtYmVyID0gMDsgdiA8IHRoaXMudmVydGljZXMubGVuZ3RoOyB2ICs9IDMpXHJcbiAgICAgICAgICAgICAgICB2ZXJ0aWNlcy5wdXNoKG5ldyBWZWN0b3IzKHRoaXMudmVydGljZXNbdl0sIHRoaXMudmVydGljZXNbdiArIDFdLCB0aGlzLnZlcnRpY2VzW3YgKyAyXSkpO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHRoaXMuaW5kaWNlcy5sZW5ndGg7IGkgKz0gMykge1xyXG4gICAgICAgICAgICAgICAgbGV0IHZlcnRleDogbnVtYmVyW10gPSBbdGhpcy5pbmRpY2VzW2ldLCB0aGlzLmluZGljZXNbaSArIDFdLCB0aGlzLmluZGljZXNbaSArIDJdXTtcclxuICAgICAgICAgICAgICAgIGxldCB2MDogVmVjdG9yMyA9IFZlY3RvcjMuRElGRkVSRU5DRSh2ZXJ0aWNlc1t2ZXJ0ZXhbMF1dLCB2ZXJ0aWNlc1t2ZXJ0ZXhbMV1dKTtcclxuICAgICAgICAgICAgICAgIGxldCB2MTogVmVjdG9yMyA9IFZlY3RvcjMuRElGRkVSRU5DRSh2ZXJ0aWNlc1t2ZXJ0ZXhbMF1dLCB2ZXJ0aWNlc1t2ZXJ0ZXhbMl1dKTtcclxuICAgICAgICAgICAgICAgIGxldCBub3JtYWw6IFZlY3RvcjMgPSBWZWN0b3IzLk5PUk1BTElaQVRJT04oVmVjdG9yMy5DUk9TUyh2MCwgdjEpKTtcclxuICAgICAgICAgICAgICAgIGxldCBpbmRleDogbnVtYmVyID0gdmVydGV4WzJdICogMztcclxuICAgICAgICAgICAgICAgIG5vcm1hbHNbaW5kZXhdID0gbm9ybWFsLng7XHJcbiAgICAgICAgICAgICAgICBub3JtYWxzW2luZGV4ICsgMV0gPSBub3JtYWwueTtcclxuICAgICAgICAgICAgICAgIG5vcm1hbHNbaW5kZXggKyAyXSA9IG5vcm1hbC56O1xyXG4gICAgICAgICAgICAgICAgLy8gbm9ybWFscy5wdXNoKG5vcm1hbC54LCBub3JtYWwueSwgbm9ybWFsLnopO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG5vcm1hbHMucHVzaCgwLCAwLCAwKTtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBGbG9hdDMyQXJyYXkobm9ybWFscyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIEdlbmVyYXRlIGEgc2ltcGxlIHF1YWQgd2l0aCBlZGdlcyBvZiBsZW5ndGggMSwgdGhlIGZhY2UgY29uc2lzdGluZyBvZiB0d28gdHJpZ29uc1xyXG4gICAgICogYGBgcGxhaW50ZXh0XHJcbiAgICAgKiAgICAgICAgMCBfXyAzXHJcbiAgICAgKiAgICAgICAgIHxfX3xcclxuICAgICAqICAgICAgICAxICAgIDIgICAgICAgICAgICAgXHJcbiAgICAgKiBgYGAgXHJcbiAgICAgKiBAYXV0aG9ycyBKaXJrYSBEZWxsJ09yby1GcmllZGwsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgTWVzaFF1YWQgZXh0ZW5kcyBNZXNoIHtcclxuICAgICAgICBwdWJsaWMgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgY3JlYXRlKCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLnZlcnRpY2VzID0gdGhpcy5jcmVhdGVWZXJ0aWNlcygpO1xyXG4gICAgICAgICAgICB0aGlzLmluZGljZXMgPSB0aGlzLmNyZWF0ZUluZGljZXMoKTtcclxuICAgICAgICAgICAgdGhpcy50ZXh0dXJlVVZzID0gdGhpcy5jcmVhdGVUZXh0dXJlVVZzKCk7XHJcbiAgICAgICAgICAgIHRoaXMubm9ybWFsc0ZhY2UgPSB0aGlzLmNyZWF0ZUZhY2VOb3JtYWxzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcm90ZWN0ZWQgY3JlYXRlVmVydGljZXMoKTogRmxvYXQzMkFycmF5IHtcclxuICAgICAgICAgICAgbGV0IHZlcnRpY2VzOiBGbG9hdDMyQXJyYXkgPSBuZXcgRmxvYXQzMkFycmF5KFtcclxuICAgICAgICAgICAgICAgIC8qMCovIC0xLCAxLCAwLCAvKjEqLyAtMSwgLTEsIDAsICAvKjIqLyAxLCAtMSwgMCwgLyozKi8gMSwgMSwgMFxyXG4gICAgICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgICAgIHZlcnRpY2VzID0gdmVydGljZXMubWFwKF92YWx1ZSA9PiBfdmFsdWUgLyAyKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB2ZXJ0aWNlcztcclxuICAgICAgICB9XHJcbiAgICAgICAgcHJvdGVjdGVkIGNyZWF0ZUluZGljZXMoKTogVWludDE2QXJyYXkge1xyXG4gICAgICAgICAgICBsZXQgaW5kaWNlczogVWludDE2QXJyYXkgPSBuZXcgVWludDE2QXJyYXkoW1xyXG4gICAgICAgICAgICAgICAgMSwgMiwgMCwgMiwgMywgMFxyXG4gICAgICAgICAgICBdKTtcclxuICAgICAgICAgICAgcmV0dXJuIGluZGljZXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcm90ZWN0ZWQgY3JlYXRlVGV4dHVyZVVWcygpOiBGbG9hdDMyQXJyYXkge1xyXG4gICAgICAgICAgICBsZXQgdGV4dHVyZVVWczogRmxvYXQzMkFycmF5ID0gbmV3IEZsb2F0MzJBcnJheShbXHJcbiAgICAgICAgICAgICAgICAvLyBmcm9udFxyXG4gICAgICAgICAgICAgICAgLyowKi8gMCwgMCwgLyoxKi8gMCwgMSwgIC8qMiovIDEsIDEsIC8qMyovIDEsIDBcclxuICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0ZXh0dXJlVVZzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJvdGVjdGVkIGNyZWF0ZUZhY2VOb3JtYWxzKCk6IEZsb2F0MzJBcnJheSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgRmxvYXQzMkFycmF5KFtcclxuICAgICAgICAgICAgICAgIC8qMCovIDAsIDAsIDEsIC8qMSovIDAsIDAsIDAsIC8qMiovIDAsIDAsIDAsIC8qMyovIDEsIDAsIDBcclxuICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgZXhwb3J0IGludGVyZmFjZSBNYXBDbGFzc1RvQ29tcG9uZW50cyB7XHJcbiAgICBbY2xhc3NOYW1lOiBzdHJpbmddOiBDb21wb25lbnRbXTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlcHJlc2VudHMgYSBub2RlIGluIHRoZSBzY2VuZXRyZWUuXHJcbiAgICogQGF1dGhvcnMgSmFzY2hhIEthcmFnw7ZsLCBIRlUsIDIwMTkgfCBKaXJrYSBEZWxsJ09yby1GcmllZGwsIEhGVSwgMjAxOVxyXG4gICAqL1xyXG4gIGV4cG9ydCBjbGFzcyBOb2RlIGV4dGVuZHMgRXZlbnRUYXJnZXQgaW1wbGVtZW50cyBTZXJpYWxpemFibGUge1xyXG4gICAgcHVibGljIG5hbWU6IHN0cmluZzsgLy8gVGhlIG5hbWUgdG8gY2FsbCB0aGlzIG5vZGUgYnkuXHJcbiAgICBwdWJsaWMgbXR4V29ybGQ6IE1hdHJpeDR4NCA9IE1hdHJpeDR4NC5JREVOVElUWTtcclxuICAgIHB1YmxpYyB0aW1lc3RhbXBVcGRhdGU6IG51bWJlciA9IDA7XHJcblxyXG4gICAgcHJpdmF0ZSBwYXJlbnQ6IE5vZGUgfCBudWxsID0gbnVsbDsgLy8gVGhlIHBhcmVudCBvZiB0aGlzIG5vZGUuXHJcbiAgICBwcml2YXRlIGNoaWxkcmVuOiBOb2RlW10gPSBbXTsgLy8gYXJyYXkgb2YgY2hpbGQgbm9kZXMgYXBwZW5kZWQgdG8gdGhpcyBub2RlLlxyXG4gICAgcHJpdmF0ZSBjb21wb25lbnRzOiBNYXBDbGFzc1RvQ29tcG9uZW50cyA9IHt9O1xyXG4gICAgLy8gcHJpdmF0ZSB0YWdzOiBzdHJpbmdbXSA9IFtdOyAvLyBOYW1lcyBvZiB0YWdzIHRoYXQgYXJlIGF0dGFjaGVkIHRvIHRoaXMgbm9kZS4gKFRPRE86IEFzIG9mIHlldCBubyBmdW5jdGlvbmFsaXR5KVxyXG4gICAgLy8gcHJpdmF0ZSBsYXllcnM6IHN0cmluZ1tdID0gW107IC8vIE5hbWVzIG9mIHRoZSBsYXllcnMgdGhpcyBub2RlIGlzIG9uLiAoVE9ETzogQXMgb2YgeWV0IG5vIGZ1bmN0aW9uYWxpdHkpXHJcbiAgICBwcml2YXRlIGxpc3RlbmVyczogTWFwRXZlbnRUeXBlVG9MaXN0ZW5lciA9IHt9O1xyXG4gICAgcHJpdmF0ZSBjYXB0dXJlczogTWFwRXZlbnRUeXBlVG9MaXN0ZW5lciA9IHt9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyBhIG5ldyBub2RlIHdpdGggYSBuYW1lIGFuZCBpbml0aWFsaXplcyBhbGwgYXR0cmlidXRlc1xyXG4gICAgICogQHBhcmFtIF9uYW1lIFRoZSBuYW1lIGJ5IHdoaWNoIHRoZSBub2RlIGNhbiBiZSBjYWxsZWQuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihfbmFtZTogc3RyaW5nKSB7XHJcbiAgICAgIHN1cGVyKCk7XHJcbiAgICAgIHRoaXMubmFtZSA9IF9uYW1lO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIHJlZmVyZW5jZSB0byB0aGlzIG5vZGVzIHBhcmVudCBub2RlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRQYXJlbnQoKTogTm9kZSB8IG51bGwge1xyXG4gICAgICByZXR1cm4gdGhpcy5wYXJlbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUcmFjZXMgYmFjayB0aGUgYW5jZXN0b3JzIG9mIHRoaXMgbm9kZSBhbmQgcmV0dXJucyB0aGUgZmlyc3RcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldEFuY2VzdG9yKCk6IE5vZGUgfCBudWxsIHtcclxuICAgICAgbGV0IGFuY2VzdG9yOiBOb2RlID0gdGhpcztcclxuICAgICAgd2hpbGUgKGFuY2VzdG9yLmdldFBhcmVudCgpKVxyXG4gICAgICAgIGFuY2VzdG9yID0gYW5jZXN0b3IuZ2V0UGFyZW50KCk7XHJcbiAgICAgIHJldHVybiBhbmNlc3RvcjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNob3J0Y3V0IHRvIHJldHJpZXZlIHRoaXMgbm9kZXMgW1tDb21wb25lbnRUcmFuc2Zvcm1dXVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IGNtcFRyYW5zZm9ybSgpOiBDb21wb25lbnRUcmFuc2Zvcm0ge1xyXG4gICAgICByZXR1cm4gPENvbXBvbmVudFRyYW5zZm9ybT50aGlzLmdldENvbXBvbmVudHMoQ29tcG9uZW50VHJhbnNmb3JtKVswXTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogU2hvcnRjdXQgdG8gcmV0cmlldmUgdGhlIGxvY2FsIFtbTWF0cml4NHg0XV0gYXR0YWNoZWQgdG8gdGhpcyBub2RlcyBbW0NvbXBvbmVudFRyYW5zZm9ybV1dICBcclxuICAgICAqIFJldHVybnMgbnVsbCBpZiBubyBbW0NvbXBvbmVudFRyYW5zZm9ybV1dIGlzIGF0dGFjaGVkXHJcbiAgICAgKi9cclxuICAgIC8vIFRPRE86IHJlamVjdGVkIGZvciBub3csIHNpbmNlIHRoZXJlIGlzIHNvbWUgY29tcHV0YXRpb25hbCBvdmVyaGVhZCwgc28gbm9kZS5tdHhMb2NhbCBzaG91bGQgbm90IGJlIHVzZWQgY2FyZWxlc3NseVxyXG4gICAgLy8gcHVibGljIGdldCBtdHhMb2NhbCgpOiBNYXRyaXg0eDQge1xyXG4gICAgLy8gICAgIGxldCBjbXBUcmFuc2Zvcm06IENvbXBvbmVudFRyYW5zZm9ybSA9IHRoaXMuY21wVHJhbnNmb3JtO1xyXG4gICAgLy8gICAgIGlmIChjbXBUcmFuc2Zvcm0pXHJcbiAgICAvLyAgICAgICAgIHJldHVybiBjbXBUcmFuc2Zvcm0ubG9jYWw7XHJcbiAgICAvLyAgICAgZWxzZVxyXG4gICAgLy8gICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIC8vIH1cclxuXHJcbiAgICAvLyAjcmVnaW9uIFNjZW5ldHJlZVxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgY2xvbmUgb2YgdGhlIGxpc3Qgb2YgY2hpbGRyZW5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldENoaWxkcmVuKCk6IE5vZGVbXSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmNoaWxkcmVuLnNsaWNlKDApO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGFuIGFycmF5IG9mIHJlZmVyZW5jZXMgdG8gY2hpbGRub2RlcyB3aXRoIHRoZSBzdXBwbGllZCBuYW1lLiBcclxuICAgICAqIEBwYXJhbSBfbmFtZSBUaGUgbmFtZSBvZiB0aGUgbm9kZXMgdG8gYmUgZm91bmQuXHJcbiAgICAgKiBAcmV0dXJuIEFuIGFycmF5IHdpdGggcmVmZXJlbmNlcyB0byBub2Rlc1xyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0Q2hpbGRyZW5CeU5hbWUoX25hbWU6IHN0cmluZyk6IE5vZGVbXSB7XHJcbiAgICAgIGxldCBmb3VuZDogTm9kZVtdID0gW107XHJcbiAgICAgIGZvdW5kID0gdGhpcy5jaGlsZHJlbi5maWx0ZXIoKF9ub2RlOiBOb2RlKSA9PiBfbm9kZS5uYW1lID09IF9uYW1lKTtcclxuICAgICAgcmV0dXJuIGZvdW5kO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkcyB0aGUgZ2l2ZW4gcmVmZXJlbmNlIHRvIGEgbm9kZSB0byB0aGUgbGlzdCBvZiBjaGlsZHJlbiwgaWYgbm90IGFscmVhZHkgaW5cclxuICAgICAqIEBwYXJhbSBfbm9kZSBUaGUgbm9kZSB0byBiZSBhZGRlZCBhcyBhIGNoaWxkXHJcbiAgICAgKiBAdGhyb3dzIEVycm9yIHdoZW4gdHJ5aW5nIHRvIGFkZCBhbiBhbmNlc3RvciBvZiB0aGlzIFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYXBwZW5kQ2hpbGQoX25vZGU6IE5vZGUpOiB2b2lkIHtcclxuICAgICAgaWYgKHRoaXMuY2hpbGRyZW4uaW5jbHVkZXMoX25vZGUpKVxyXG4gICAgICAgIC8vIF9ub2RlIGlzIGFscmVhZHkgYSBjaGlsZCBvZiB0aGlzXHJcbiAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgbGV0IGFuY2VzdG9yOiBOb2RlID0gdGhpcztcclxuICAgICAgd2hpbGUgKGFuY2VzdG9yKSB7XHJcbiAgICAgICAgaWYgKGFuY2VzdG9yID09IF9ub2RlKVxyXG4gICAgICAgICAgdGhyb3cgKG5ldyBFcnJvcihcIkN5Y2xpYyByZWZlcmVuY2UgcHJvaGliaXRlZCBpbiBub2RlIGhpZXJhcmNoeSwgYW5jZXN0b3JzIG11c3Qgbm90IGJlIGFkZGVkIGFzIGNoaWxkcmVuXCIpKTtcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICBhbmNlc3RvciA9IGFuY2VzdG9yLnBhcmVudDtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5jaGlsZHJlbi5wdXNoKF9ub2RlKTtcclxuICAgICAgX25vZGUuc2V0UGFyZW50KHRoaXMpO1xyXG4gICAgICBfbm9kZS5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChFVkVOVC5DSElMRF9BUFBFTkQsIHsgYnViYmxlczogdHJ1ZSB9KSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmVzIHRoZSByZWZlcmVuY2UgdG8gdGhlIGdpdmUgbm9kZSBmcm9tIHRoZSBsaXN0IG9mIGNoaWxkcmVuXHJcbiAgICAgKiBAcGFyYW0gX25vZGUgVGhlIG5vZGUgdG8gYmUgcmVtb3ZlZC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHJlbW92ZUNoaWxkKF9ub2RlOiBOb2RlKTogdm9pZCB7XHJcbiAgICAgIGxldCBmb3VuZDogbnVtYmVyID0gdGhpcy5maW5kQ2hpbGQoX25vZGUpO1xyXG4gICAgICBpZiAoZm91bmQgPCAwKVxyXG4gICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgIF9ub2RlLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KEVWRU5ULkNISUxEX1JFTU9WRSwgeyBidWJibGVzOiB0cnVlIH0pKTtcclxuICAgICAgdGhpcy5jaGlsZHJlbi5zcGxpY2UoZm91bmQsIDEpO1xyXG4gICAgICBfbm9kZS5zZXRQYXJlbnQobnVsbCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBwb3NpdGlvbiBvZiB0aGUgbm9kZSBpbiB0aGUgbGlzdCBvZiBjaGlsZHJlbiBvciAtMSBpZiBub3QgZm91bmRcclxuICAgICAqIEBwYXJhbSBfbm9kZSBUaGUgbm9kZSB0byBiZSBmb3VuZC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGZpbmRDaGlsZChfbm9kZTogTm9kZSk6IG51bWJlciB7XHJcbiAgICAgIHJldHVybiB0aGlzLmNoaWxkcmVuLmluZGV4T2YoX25vZGUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVwbGFjZXMgYSBjaGlsZCBub2RlIHdpdGggYW5vdGhlciwgcHJlc2VydmluZyB0aGUgcG9zaXRpb24gaW4gdGhlIGxpc3Qgb2YgY2hpbGRyZW5cclxuICAgICAqIEBwYXJhbSBfcmVwbGFjZSBUaGUgbm9kZSB0byBiZSByZXBsYWNlZFxyXG4gICAgICogQHBhcmFtIF93aXRoIFRoZSBub2RlIHRvIHJlcGxhY2Ugd2l0aFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgcmVwbGFjZUNoaWxkKF9yZXBsYWNlOiBOb2RlLCBfd2l0aDogTm9kZSk6IGJvb2xlYW4ge1xyXG4gICAgICBsZXQgZm91bmQ6IG51bWJlciA9IHRoaXMuZmluZENoaWxkKF9yZXBsYWNlKTtcclxuICAgICAgaWYgKGZvdW5kIDwgMClcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIGxldCBwcmV2aW91c1BhcmVudDogTm9kZSA9IF93aXRoLmdldFBhcmVudCgpO1xyXG4gICAgICBpZiAocHJldmlvdXNQYXJlbnQpXHJcbiAgICAgICAgcHJldmlvdXNQYXJlbnQucmVtb3ZlQ2hpbGQoX3dpdGgpO1xyXG4gICAgICBfcmVwbGFjZS5zZXRQYXJlbnQobnVsbCk7XHJcbiAgICAgIHRoaXMuY2hpbGRyZW5bZm91bmRdID0gX3dpdGg7XHJcbiAgICAgIF93aXRoLnNldFBhcmVudCh0aGlzKTtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZW5lcmF0b3IgeWllbGRpbmcgdGhlIG5vZGUgYW5kIGFsbCBzdWNjZXNzb3JzIGluIHRoZSBicmFuY2ggYmVsb3cgZm9yIGl0ZXJhdGlvblxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IGJyYW5jaCgpOiBJdGVyYWJsZUl0ZXJhdG9yPE5vZGU+IHtcclxuICAgICAgcmV0dXJuIHRoaXMuZ2V0QnJhbmNoR2VuZXJhdG9yKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGlzVXBkYXRlZChfdGltZXN0YW1wVXBkYXRlOiBudW1iZXIpOiBib29sZWFuIHtcclxuICAgICAgcmV0dXJuICh0aGlzLnRpbWVzdGFtcFVwZGF0ZSA9PSBfdGltZXN0YW1wVXBkYXRlKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFwcGxpZXMgYSBNdXRhdG9yIGZyb20gW1tBbmltYXRpb25dXSB0byBhbGwgaXRzIGNvbXBvbmVudHMgYW5kIHRyYW5zZmVycyBpdCB0byBpdHMgY2hpbGRyZW4uXHJcbiAgICAgKiBAcGFyYW0gX211dGF0b3IgVGhlIG11dGF0b3IgZ2VuZXJhdGVkIGZyb20gYW4gW1tBbmltYXRpb25dXVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgYXBwbHlBbmltYXRpb24oX211dGF0b3I6IE11dGF0b3IpOiB2b2lkIHtcclxuICAgICAgaWYgKF9tdXRhdG9yLmNvbXBvbmVudHMpIHtcclxuICAgICAgICBmb3IgKGxldCBjb21wb25lbnROYW1lIGluIF9tdXRhdG9yLmNvbXBvbmVudHMpIHtcclxuICAgICAgICAgIGlmICh0aGlzLmNvbXBvbmVudHNbY29tcG9uZW50TmFtZV0pIHtcclxuICAgICAgICAgICAgbGV0IG11dGF0b3JPZkNvbXBvbmVudDogTXV0YXRvciA9IDxNdXRhdG9yPl9tdXRhdG9yLmNvbXBvbmVudHM7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgaW4gbXV0YXRvck9mQ29tcG9uZW50W2NvbXBvbmVudE5hbWVdKSB7XHJcbiAgICAgICAgICAgICAgaWYgKHRoaXMuY29tcG9uZW50c1tjb21wb25lbnROYW1lXVsraV0pIHtcclxuICAgICAgICAgICAgICAgIGxldCBjb21wb25lbnRUb011dGF0ZTogQ29tcG9uZW50ID0gdGhpcy5jb21wb25lbnRzW2NvbXBvbmVudE5hbWVdWytpXTtcclxuICAgICAgICAgICAgICAgIGxldCBtdXRhdG9yQXJyYXk6IE11dGF0b3JbXSA9ICg8QXJyYXk8TXV0YXRvcj4+bXV0YXRvck9mQ29tcG9uZW50W2NvbXBvbmVudE5hbWVdKTtcclxuICAgICAgICAgICAgICAgIGxldCBtdXRhdG9yV2l0aENvbXBvbmVudE5hbWU6IE11dGF0b3IgPSA8TXV0YXRvcj5tdXRhdG9yQXJyYXlbK2ldO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgY25hbWUgaW4gbXV0YXRvcldpdGhDb21wb25lbnROYW1lKSB7ICAgLy8gdHJpY2sgdXNlZCB0byBnZXQgdGhlIG9ubHkgZW50cnkgaW4gdGhlIGxpc3RcclxuICAgICAgICAgICAgICAgICAgbGV0IG11dGF0b3JUb0dpdmU6IE11dGF0b3IgPSA8TXV0YXRvcj5tdXRhdG9yV2l0aENvbXBvbmVudE5hbWVbY25hbWVdO1xyXG4gICAgICAgICAgICAgICAgICBjb21wb25lbnRUb011dGF0ZS5tdXRhdGUobXV0YXRvclRvR2l2ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChfbXV0YXRvci5jaGlsZHJlbikge1xyXG4gICAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCAoPEFycmF5PE9iamVjdD4+X211dGF0b3IuY2hpbGRyZW4pLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICBsZXQgbmFtZTogc3RyaW5nID0gKDxOb2RlPig8QXJyYXk8TXV0YXRvcj4+X211dGF0b3IuY2hpbGRyZW4pW2ldW1wixpIuTm9kZVwiXSkubmFtZTtcclxuICAgICAgICAgIGxldCBjaGlsZE5vZGVzOiBOb2RlW10gPSB0aGlzLmdldENoaWxkcmVuQnlOYW1lKG5hbWUpO1xyXG4gICAgICAgICAgZm9yIChsZXQgY2hpbGROb2RlIG9mIGNoaWxkTm9kZXMpIHtcclxuICAgICAgICAgICAgY2hpbGROb2RlLmFwcGx5QW5pbWF0aW9uKDxNdXRhdG9yPig8QXJyYXk8TXV0YXRvcj4+X211dGF0b3IuY2hpbGRyZW4pW2ldW1wixpIuTm9kZVwiXSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyAjZW5kcmVnaW9uXHJcblxyXG4gICAgLy8gI3JlZ2lvbiBDb21wb25lbnRzXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBsaXN0IG9mIGFsbCBjb21wb25lbnRzIGF0dGFjaGVkIHRvIHRoaXMgbm9kZSwgaW5kZXBlbmRlbnQgb2YgdHlwZS4gXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRBbGxDb21wb25lbnRzKCk6IENvbXBvbmVudFtdIHtcclxuICAgICAgbGV0IGFsbDogQ29tcG9uZW50W10gPSBbXTtcclxuICAgICAgZm9yIChsZXQgdHlwZSBpbiB0aGlzLmNvbXBvbmVudHMpIHtcclxuICAgICAgICBhbGwgPSBhbGwuY29uY2F0KHRoaXMuY29tcG9uZW50c1t0eXBlXSk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGFsbDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBjbG9uZSBvZiB0aGUgbGlzdCBvZiBjb21wb25lbnRzIG9mIHRoZSBnaXZlbiBjbGFzcyBhdHRhY2hlZCB0byB0aGlzIG5vZGUuIFxyXG4gICAgICogQHBhcmFtIF9jbGFzcyBUaGUgY2xhc3Mgb2YgdGhlIGNvbXBvbmVudHMgdG8gYmUgZm91bmQuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRDb21wb25lbnRzPFQgZXh0ZW5kcyBDb21wb25lbnQ+KF9jbGFzczogbmV3ICgpID0+IFQpOiBUW10ge1xyXG4gICAgICByZXR1cm4gPFRbXT4odGhpcy5jb21wb25lbnRzW19jbGFzcy5uYW1lXSB8fCBbXSkuc2xpY2UoMCk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGZpcnN0IGNvbXBvbnRlbnQgZm91bmQgb2YgdGhlIGdpdmVuIGNsYXNzIGF0dGFjaGVkIHRoaXMgbm9kZSBvciBudWxsLCBpZiBsaXN0IGlzIGVtcHR5IG9yIGRvZXNuJ3QgZXhpc3RcclxuICAgICAqIEBwYXJhbSBfY2xhc3MgVGhlIGNsYXNzIG9mIHRoZSBjb21wb25lbnRzIHRvIGJlIGZvdW5kLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0Q29tcG9uZW50PFQgZXh0ZW5kcyBDb21wb25lbnQ+KF9jbGFzczogbmV3ICgpID0+IFQpOiBUIHtcclxuICAgICAgbGV0IGxpc3Q6IFRbXSA9IDxUW10+dGhpcy5jb21wb25lbnRzW19jbGFzcy5uYW1lXTtcclxuICAgICAgaWYgKGxpc3QpXHJcbiAgICAgICAgcmV0dXJuIGxpc3RbMF07XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkcyB0aGUgc3VwcGxpZWQgY29tcG9uZW50IGludG8gdGhlIG5vZGVzIGNvbXBvbmVudCBtYXAuXHJcbiAgICAgKiBAcGFyYW0gX2NvbXBvbmVudCBUaGUgY29tcG9uZW50IHRvIGJlIHB1c2hlZCBpbnRvIHRoZSBhcnJheS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGFkZENvbXBvbmVudChfY29tcG9uZW50OiBDb21wb25lbnQpOiB2b2lkIHtcclxuICAgICAgaWYgKF9jb21wb25lbnQuZ2V0Q29udGFpbmVyKCkgPT0gdGhpcylcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIGlmICh0aGlzLmNvbXBvbmVudHNbX2NvbXBvbmVudC50eXBlXSA9PT0gdW5kZWZpbmVkKVxyXG4gICAgICAgIHRoaXMuY29tcG9uZW50c1tfY29tcG9uZW50LnR5cGVdID0gW19jb21wb25lbnRdO1xyXG4gICAgICBlbHNlXHJcbiAgICAgICAgaWYgKF9jb21wb25lbnQuaXNTaW5nbGV0b24pXHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb21wb25lbnQgaXMgbWFya2VkIHNpbmdsZXRvbiBhbmQgY2FuJ3QgYmUgYXR0YWNoZWQsIG5vIG1vcmUgdGhhbiBvbmUgYWxsb3dlZFwiKTtcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICB0aGlzLmNvbXBvbmVudHNbX2NvbXBvbmVudC50eXBlXS5wdXNoKF9jb21wb25lbnQpO1xyXG5cclxuICAgICAgX2NvbXBvbmVudC5zZXRDb250YWluZXIodGhpcyk7XHJcbiAgICAgIF9jb21wb25lbnQuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoRVZFTlQuQ09NUE9ORU5UX0FERCkpO1xyXG4gICAgfVxyXG4gICAgLyoqIFxyXG4gICAgICogUmVtb3ZlcyB0aGUgZ2l2ZW4gY29tcG9uZW50IGZyb20gdGhlIG5vZGUsIGlmIGl0IHdhcyBhdHRhY2hlZCwgYW5kIHNldHMgaXRzIHBhcmVudCB0byBudWxsLiBcclxuICAgICAqIEBwYXJhbSBfY29tcG9uZW50IFRoZSBjb21wb25lbnQgdG8gYmUgcmVtb3ZlZFxyXG4gICAgICogQHRocm93cyBFeGNlcHRpb24gd2hlbiBjb21wb25lbnQgaXMgbm90IGZvdW5kXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyByZW1vdmVDb21wb25lbnQoX2NvbXBvbmVudDogQ29tcG9uZW50KTogdm9pZCB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgbGV0IGNvbXBvbmVudHNPZlR5cGU6IENvbXBvbmVudFtdID0gdGhpcy5jb21wb25lbnRzW19jb21wb25lbnQudHlwZV07XHJcbiAgICAgICAgbGV0IGZvdW5kQXQ6IG51bWJlciA9IGNvbXBvbmVudHNPZlR5cGUuaW5kZXhPZihfY29tcG9uZW50KTtcclxuICAgICAgICBpZiAoZm91bmRBdCA8IDApXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgY29tcG9uZW50c09mVHlwZS5zcGxpY2UoZm91bmRBdCwgMSk7XHJcbiAgICAgICAgX2NvbXBvbmVudC5zZXRDb250YWluZXIobnVsbCk7XHJcbiAgICAgICAgX2NvbXBvbmVudC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChFVkVOVC5DT01QT05FTlRfUkVNT1ZFKSk7XHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIHJlbW92ZSBjb21wb25lbnQgJyR7X2NvbXBvbmVudH0naW4gbm9kZSBuYW1lZCAnJHt0aGlzLm5hbWV9J2ApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyAjZW5kcmVnaW9uXHJcblxyXG4gICAgLy8gI3JlZ2lvbiBTZXJpYWxpemF0aW9uXHJcbiAgICBwdWJsaWMgc2VyaWFsaXplKCk6IFNlcmlhbGl6YXRpb24ge1xyXG4gICAgICBsZXQgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IHtcclxuICAgICAgICBuYW1lOiB0aGlzLm5hbWVcclxuICAgICAgfTtcclxuXHJcbiAgICAgIGxldCBjb21wb25lbnRzOiBTZXJpYWxpemF0aW9uID0ge307XHJcbiAgICAgIGZvciAobGV0IHR5cGUgaW4gdGhpcy5jb21wb25lbnRzKSB7XHJcbiAgICAgICAgY29tcG9uZW50c1t0eXBlXSA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGNvbXBvbmVudCBvZiB0aGlzLmNvbXBvbmVudHNbdHlwZV0pIHtcclxuICAgICAgICAgIC8vIGNvbXBvbmVudHNbdHlwZV0ucHVzaChjb21wb25lbnQuc2VyaWFsaXplKCkpO1xyXG4gICAgICAgICAgY29tcG9uZW50c1t0eXBlXS5wdXNoKFNlcmlhbGl6ZXIuc2VyaWFsaXplKGNvbXBvbmVudCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBzZXJpYWxpemF0aW9uW1wiY29tcG9uZW50c1wiXSA9IGNvbXBvbmVudHM7XHJcblxyXG4gICAgICBsZXQgY2hpbGRyZW46IFNlcmlhbGl6YXRpb25bXSA9IFtdO1xyXG4gICAgICBmb3IgKGxldCBjaGlsZCBvZiB0aGlzLmNoaWxkcmVuKSB7XHJcbiAgICAgICAgY2hpbGRyZW4ucHVzaChTZXJpYWxpemVyLnNlcmlhbGl6ZShjaGlsZCkpO1xyXG4gICAgICB9XHJcbiAgICAgIHNlcmlhbGl6YXRpb25bXCJjaGlsZHJlblwiXSA9IGNoaWxkcmVuO1xyXG5cclxuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChFVkVOVC5OT0RFX1NFUklBTElaRUQpKTtcclxuICAgICAgcmV0dXJuIHNlcmlhbGl6YXRpb247XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uKTogU2VyaWFsaXphYmxlIHtcclxuICAgICAgdGhpcy5uYW1lID0gX3NlcmlhbGl6YXRpb24ubmFtZTtcclxuICAgICAgLy8gdGhpcy5wYXJlbnQgPSBpcyBzZXQgd2hlbiB0aGUgbm9kZXMgYXJlIGFkZGVkXHJcblxyXG4gICAgICAvLyBkZXNlcmlhbGl6ZSBjb21wb25lbnRzIGZpcnN0IHNvIHNjcmlwdHMgY2FuIHJlYWN0IHRvIGNoaWxkcmVuIGJlaW5nIGFwcGVuZGVkXHJcbiAgICAgIGZvciAobGV0IHR5cGUgaW4gX3NlcmlhbGl6YXRpb24uY29tcG9uZW50cykge1xyXG4gICAgICAgIGZvciAobGV0IHNlcmlhbGl6ZWRDb21wb25lbnQgb2YgX3NlcmlhbGl6YXRpb24uY29tcG9uZW50c1t0eXBlXSkge1xyXG4gICAgICAgICAgbGV0IGRlc2VyaWFsaXplZENvbXBvbmVudDogQ29tcG9uZW50ID0gPENvbXBvbmVudD5TZXJpYWxpemVyLmRlc2VyaWFsaXplKHNlcmlhbGl6ZWRDb21wb25lbnQpO1xyXG4gICAgICAgICAgdGhpcy5hZGRDb21wb25lbnQoZGVzZXJpYWxpemVkQ29tcG9uZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZvciAobGV0IHNlcmlhbGl6ZWRDaGlsZCBvZiBfc2VyaWFsaXphdGlvbi5jaGlsZHJlbikge1xyXG4gICAgICAgIGxldCBkZXNlcmlhbGl6ZWRDaGlsZDogTm9kZSA9IDxOb2RlPlNlcmlhbGl6ZXIuZGVzZXJpYWxpemUoc2VyaWFsaXplZENoaWxkKTtcclxuICAgICAgICB0aGlzLmFwcGVuZENoaWxkKGRlc2VyaWFsaXplZENoaWxkKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChFVkVOVC5OT0RFX0RFU0VSSUFMSVpFRCkpO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIC8vICNlbmRyZWdpb25cclxuXHJcbiAgICAvLyAjcmVnaW9uIEV2ZW50c1xyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIGFuIGV2ZW50IGxpc3RlbmVyIHRvIHRoZSBub2RlLiBUaGUgZ2l2ZW4gaGFuZGxlciB3aWxsIGJlIGNhbGxlZCB3aGVuIGEgbWF0Y2hpbmcgZXZlbnQgaXMgcGFzc2VkIHRvIHRoZSBub2RlLlxyXG4gICAgICogRGV2aWF0aW5nIGZyb20gdGhlIHN0YW5kYXJkIEV2ZW50VGFyZ2V0LCBoZXJlIHRoZSBfaGFuZGxlciBtdXN0IGJlIGEgZnVuY3Rpb24gYW5kIF9jYXB0dXJlIGlzIHRoZSBvbmx5IG9wdGlvbi5cclxuICAgICAqIEBwYXJhbSBfdHlwZSBUaGUgdHlwZSBvZiB0aGUgZXZlbnQsIHNob3VsZCBiZSBhbiBlbnVtZXJhdGVkIHZhbHVlIG9mIE5PREVfRVZFTlQsIGNhbiBiZSBhbnkgc3RyaW5nXHJcbiAgICAgKiBAcGFyYW0gX2hhbmRsZXIgVGhlIGZ1bmN0aW9uIHRvIGNhbGwgd2hlbiB0aGUgZXZlbnQgcmVhY2hlcyB0aGlzIG5vZGVcclxuICAgICAqIEBwYXJhbSBfY2FwdHVyZSBXaGVuIHRydWUsIHRoZSBsaXN0ZW5lciBsaXN0ZW5zIGluIHRoZSBjYXB0dXJlIHBoYXNlLCB3aGVuIHRoZSBldmVudCB0cmF2ZWxzIGRlZXBlciBpbnRvIHRoZSBoaWVyYXJjaHkgb2Ygbm9kZXMuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBhZGRFdmVudExpc3RlbmVyKF90eXBlOiBFVkVOVCB8IHN0cmluZywgX2hhbmRsZXI6IEV2ZW50TGlzdGVuZXIsIF9jYXB0dXJlOiBib29sZWFuIC8qfCBBZGRFdmVudExpc3RlbmVyT3B0aW9ucyovID0gZmFsc2UpOiB2b2lkIHtcclxuICAgICAgaWYgKF9jYXB0dXJlKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmNhcHR1cmVzW190eXBlXSlcclxuICAgICAgICAgIHRoaXMuY2FwdHVyZXNbX3R5cGVdID0gW107XHJcbiAgICAgICAgdGhpcy5jYXB0dXJlc1tfdHlwZV0ucHVzaChfaGFuZGxlcik7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmxpc3RlbmVyc1tfdHlwZV0pXHJcbiAgICAgICAgICB0aGlzLmxpc3RlbmVyc1tfdHlwZV0gPSBbXTtcclxuICAgICAgICB0aGlzLmxpc3RlbmVyc1tfdHlwZV0ucHVzaChfaGFuZGxlcik7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogRGlzcGF0Y2hlcyBhIHN5bnRoZXRpYyBldmVudCBldmVudCB0byB0YXJnZXQuIFRoaXMgaW1wbGVtZW50YXRpb24gYWx3YXlzIHJldHVybnMgdHJ1ZSAoc3RhbmRhcmQ6IHJldHVybiB0cnVlIG9ubHkgaWYgZWl0aGVyIGV2ZW50J3MgY2FuY2VsYWJsZSBhdHRyaWJ1dGUgdmFsdWUgaXMgZmFsc2Ugb3IgaXRzIHByZXZlbnREZWZhdWx0KCkgbWV0aG9kIHdhcyBub3QgaW52b2tlZClcclxuICAgICAqIFRoZSBldmVudCB0cmF2ZWxzIGludG8gdGhlIGhpZXJhcmNoeSB0byB0aGlzIG5vZGUgZGlzcGF0Y2hpbmcgdGhlIGV2ZW50LCBpbnZva2luZyBtYXRjaGluZyBoYW5kbGVycyBvZiB0aGUgbm9kZXMgYW5jZXN0b3JzIGxpc3RlbmluZyB0byB0aGUgY2FwdHVyZSBwaGFzZSwgXHJcbiAgICAgKiB0aGFuIHRoZSBtYXRjaGluZyBoYW5kbGVyIG9mIHRoZSB0YXJnZXQgbm9kZSBpbiB0aGUgdGFyZ2V0IHBoYXNlLCBhbmQgYmFjayBvdXQgb2YgdGhlIGhpZXJhcmNoeSBpbiB0aGUgYnViYmxpbmcgcGhhc2UsIGludm9raW5nIGFwcHJvcHJpYXRlIGhhbmRsZXJzIG9mIHRoZSBhbnZlc3RvcnNcclxuICAgICAqIEBwYXJhbSBfZXZlbnQgVGhlIGV2ZW50IHRvIGRpc3BhdGNoXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBkaXNwYXRjaEV2ZW50KF9ldmVudDogRXZlbnQpOiBib29sZWFuIHtcclxuICAgICAgbGV0IGFuY2VzdG9yczogTm9kZVtdID0gW107XHJcbiAgICAgIGxldCB1cGNvbWluZzogTm9kZSA9IHRoaXM7XHJcbiAgICAgIC8vIG92ZXJ3cml0ZSBldmVudCB0YXJnZXRcclxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KF9ldmVudCwgXCJ0YXJnZXRcIiwgeyB3cml0YWJsZTogdHJ1ZSwgdmFsdWU6IHRoaXMgfSk7XHJcbiAgICAgIC8vIFRPRE86IGNvbnNpZGVyIHVzaW5nIFJlZmxlY3QgaW5zdGVhZCBvZiBPYmplY3QgdGhyb3VnaG91dC4gU2VlIGFsc28gUmVuZGVyIGFuZCBNdXRhYmxlLi4uXHJcbiAgICAgIHdoaWxlICh1cGNvbWluZy5wYXJlbnQpXHJcbiAgICAgICAgYW5jZXN0b3JzLnB1c2godXBjb21pbmcgPSB1cGNvbWluZy5wYXJlbnQpO1xyXG5cclxuICAgICAgLy8gY2FwdHVyZSBwaGFzZVxyXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoX2V2ZW50LCBcImV2ZW50UGhhc2VcIiwgeyB3cml0YWJsZTogdHJ1ZSwgdmFsdWU6IEV2ZW50LkNBUFRVUklOR19QSEFTRSB9KTtcclxuICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gYW5jZXN0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgbGV0IGFuY2VzdG9yOiBOb2RlID0gYW5jZXN0b3JzW2ldO1xyXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShfZXZlbnQsIFwiY3VycmVudFRhcmdldFwiLCB7IHdyaXRhYmxlOiB0cnVlLCB2YWx1ZTogYW5jZXN0b3IgfSk7XHJcbiAgICAgICAgbGV0IGNhcHR1cmVzOiBFdmVudExpc3RlbmVyW10gPSBhbmNlc3Rvci5jYXB0dXJlc1tfZXZlbnQudHlwZV0gfHwgW107XHJcbiAgICAgICAgZm9yIChsZXQgaGFuZGxlciBvZiBjYXB0dXJlcylcclxuICAgICAgICAgIGhhbmRsZXIoX2V2ZW50KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCFfZXZlbnQuYnViYmxlcylcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICAgIC8vIHRhcmdldCBwaGFzZVxyXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoX2V2ZW50LCBcImV2ZW50UGhhc2VcIiwgeyB3cml0YWJsZTogdHJ1ZSwgdmFsdWU6IEV2ZW50LkFUX1RBUkdFVCB9KTtcclxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KF9ldmVudCwgXCJjdXJyZW50VGFyZ2V0XCIsIHsgd3JpdGFibGU6IHRydWUsIHZhbHVlOiB0aGlzIH0pO1xyXG4gICAgICBsZXQgbGlzdGVuZXJzOiBFdmVudExpc3RlbmVyW10gPSB0aGlzLmxpc3RlbmVyc1tfZXZlbnQudHlwZV0gfHwgW107XHJcbiAgICAgIGZvciAobGV0IGhhbmRsZXIgb2YgbGlzdGVuZXJzKVxyXG4gICAgICAgIGhhbmRsZXIoX2V2ZW50KTtcclxuXHJcbiAgICAgIC8vIGJ1YmJsZSBwaGFzZVxyXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoX2V2ZW50LCBcImV2ZW50UGhhc2VcIiwgeyB3cml0YWJsZTogdHJ1ZSwgdmFsdWU6IEV2ZW50LkJVQkJMSU5HX1BIQVNFIH0pO1xyXG4gICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgYW5jZXN0b3JzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgbGV0IGFuY2VzdG9yOiBOb2RlID0gYW5jZXN0b3JzW2ldO1xyXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShfZXZlbnQsIFwiY3VycmVudFRhcmdldFwiLCB7IHdyaXRhYmxlOiB0cnVlLCB2YWx1ZTogYW5jZXN0b3IgfSk7XHJcbiAgICAgICAgbGV0IGxpc3RlbmVyczogRnVuY3Rpb25bXSA9IGFuY2VzdG9yLmxpc3RlbmVyc1tfZXZlbnQudHlwZV0gfHwgW107XHJcbiAgICAgICAgZm9yIChsZXQgaGFuZGxlciBvZiBsaXN0ZW5lcnMpXHJcbiAgICAgICAgICBoYW5kbGVyKF9ldmVudCk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRydWU7IC8vVE9ETzogcmV0dXJuIGEgbWVhbmluZ2Z1bCB2YWx1ZSwgc2VlIGRvY3VtZW50YXRpb24gb2YgZGlzcGF0Y2ggZXZlbnRcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQnJvYWRjYXN0cyBhIHN5bnRoZXRpYyBldmVudCBldmVudCB0byB0aGlzIG5vZGUgYW5kIGZyb20gdGhlcmUgdG8gYWxsIG5vZGVzIGRlZXBlciBpbiB0aGUgaGllcmFyY2h5LFxyXG4gICAgICogaW52b2tpbmcgbWF0Y2hpbmcgaGFuZGxlcnMgb2YgdGhlIG5vZGVzIGxpc3RlbmluZyB0byB0aGUgY2FwdHVyZSBwaGFzZS4gV2F0Y2ggcGVyZm9ybWFuY2Ugd2hlbiB0aGVyZSBhcmUgbWFueSBub2RlcyBpbnZvbHZlZFxyXG4gICAgICogQHBhcmFtIF9ldmVudCBUaGUgZXZlbnQgdG8gYnJvYWRjYXN0XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBicm9hZGNhc3RFdmVudChfZXZlbnQ6IEV2ZW50KTogdm9pZCB7XHJcbiAgICAgIC8vIG92ZXJ3cml0ZSBldmVudCB0YXJnZXQgYW5kIHBoYXNlXHJcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShfZXZlbnQsIFwiZXZlbnRQaGFzZVwiLCB7IHdyaXRhYmxlOiB0cnVlLCB2YWx1ZTogRXZlbnQuQ0FQVFVSSU5HX1BIQVNFIH0pO1xyXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoX2V2ZW50LCBcInRhcmdldFwiLCB7IHdyaXRhYmxlOiB0cnVlLCB2YWx1ZTogdGhpcyB9KTtcclxuICAgICAgdGhpcy5icm9hZGNhc3RFdmVudFJlY3Vyc2l2ZShfZXZlbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYnJvYWRjYXN0RXZlbnRSZWN1cnNpdmUoX2V2ZW50OiBFdmVudCk6IHZvaWQge1xyXG4gICAgICAvLyBjYXB0dXJlIHBoYXNlIG9ubHlcclxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KF9ldmVudCwgXCJjdXJyZW50VGFyZ2V0XCIsIHsgd3JpdGFibGU6IHRydWUsIHZhbHVlOiB0aGlzIH0pO1xyXG4gICAgICBsZXQgY2FwdHVyZXM6IEZ1bmN0aW9uW10gPSB0aGlzLmNhcHR1cmVzW19ldmVudC50eXBlXSB8fCBbXTtcclxuICAgICAgZm9yIChsZXQgaGFuZGxlciBvZiBjYXB0dXJlcylcclxuICAgICAgICBoYW5kbGVyKF9ldmVudCk7XHJcbiAgICAgIC8vIGFwcGVhcnMgdG8gYmUgc2xvd2VyLCBhc3RvbmlzaGluZ2x5Li4uXHJcbiAgICAgIC8vIGNhcHR1cmVzLmZvckVhY2goZnVuY3Rpb24gKGhhbmRsZXI6IEZ1bmN0aW9uKTogdm9pZCB7XHJcbiAgICAgIC8vICAgICBoYW5kbGVyKF9ldmVudCk7XHJcbiAgICAgIC8vIH0pO1xyXG5cclxuICAgICAgLy8gc2FtZSBmb3IgY2hpbGRyZW5cclxuICAgICAgZm9yIChsZXQgY2hpbGQgb2YgdGhpcy5jaGlsZHJlbikge1xyXG4gICAgICAgIGNoaWxkLmJyb2FkY2FzdEV2ZW50UmVjdXJzaXZlKF9ldmVudCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIC8vICNlbmRyZWdpb25cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIHBhcmVudCBvZiB0aGlzIG5vZGUgdG8gYmUgdGhlIHN1cHBsaWVkIG5vZGUuIFdpbGwgYmUgY2FsbGVkIG9uIHRoZSBjaGlsZCB0aGF0IGlzIGFwcGVuZGVkIHRvIHRoaXMgbm9kZSBieSBhcHBlbmRDaGlsZCgpLlxyXG4gICAgICogQHBhcmFtIF9wYXJlbnQgVGhlIHBhcmVudCB0byBiZSBzZXQgZm9yIHRoaXMgbm9kZS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBzZXRQYXJlbnQoX3BhcmVudDogTm9kZSB8IG51bGwpOiB2b2lkIHtcclxuICAgICAgdGhpcy5wYXJlbnQgPSBfcGFyZW50O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgKmdldEJyYW5jaEdlbmVyYXRvcigpOiBJdGVyYWJsZUl0ZXJhdG9yPE5vZGU+IHtcclxuICAgICAgeWllbGQgdGhpcztcclxuICAgICAgZm9yIChsZXQgY2hpbGQgb2YgdGhpcy5jaGlsZHJlbilcclxuICAgICAgICB5aWVsZCogY2hpbGQuYnJhbmNoO1xyXG4gICAgfVxyXG4gIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBBIG5vZGUgbWFuYWdlZCBieSBbW1Jlc291cmNlTWFuYWdlcl1dIHRoYXQgZnVuY3Rpb25zIGFzIGEgdGVtcGxhdGUgZm9yIFtbTm9kZVJlc291cmNlSW5zdGFuY2VdXXMgXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBOb2RlUmVzb3VyY2UgZXh0ZW5kcyBOb2RlIGltcGxlbWVudHMgU2VyaWFsaXphYmxlUmVzb3VyY2Uge1xyXG4gICAgICAgIHB1YmxpYyBpZFJlc291cmNlOiBzdHJpbmcgPSB1bmRlZmluZWQ7XHJcbiAgICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogQW4gaW5zdGFuY2Ugb2YgYSBbW05vZGVSZXNvdXJjZV1dLiAgXHJcbiAgICAgKiBUaGlzIG5vZGUga2VlcHMgYSByZWZlcmVuY2UgdG8gaXRzIHJlc291cmNlIGFuIGNhbiB0aHVzIG9wdGltaXplIHNlcmlhbGl6YXRpb25cclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIE5vZGVSZXNvdXJjZUluc3RhbmNlIGV4dGVuZHMgTm9kZSB7XHJcbiAgICAgICAgLyoqIGlkIG9mIHRoZSByZXNvdXJjZSB0aGF0IGluc3RhbmNlIHdhcyBjcmVhdGVkIGZyb20gKi9cclxuICAgICAgICAvLyBUT0RPOiBleGFtaW5lLCBpZiB0aGlzIHNob3VsZCBiZSBhIGRpcmVjdCByZWZlcmVuY2UgdG8gdGhlIE5vZGVSZXNvdXJjZSwgaW5zdGVhZCBvZiB0aGUgaWRcclxuICAgICAgICBwcml2YXRlIGlkU291cmNlOiBzdHJpbmcgPSB1bmRlZmluZWQ7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKF9ub2RlUmVzb3VyY2U6IE5vZGVSZXNvdXJjZSkge1xyXG4gICAgICAgICAgICBzdXBlcihcIk5vZGVSZXNvdXJjZUluc3RhbmNlXCIpO1xyXG4gICAgICAgICAgICBpZiAoX25vZGVSZXNvdXJjZSlcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0KF9ub2RlUmVzb3VyY2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVjcmVhdGUgdGhpcyBub2RlIGZyb20gdGhlIFtbTm9kZVJlc291cmNlXV0gcmVmZXJlbmNlZFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcclxuICAgICAgICAgICAgbGV0IHJlc291cmNlOiBOb2RlUmVzb3VyY2UgPSA8Tm9kZVJlc291cmNlPlJlc291cmNlTWFuYWdlci5nZXQodGhpcy5pZFNvdXJjZSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0KHJlc291cmNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vVE9ETzogb3B0aW1pemUgdXNpbmcgdGhlIHJlZmVyZW5jZWQgTm9kZVJlc291cmNlLCBzZXJpYWxpemUvZGVzZXJpYWxpemUgb25seSB0aGUgZGlmZmVyZW5jZXNcclxuICAgICAgICBwdWJsaWMgc2VyaWFsaXplKCk6IFNlcmlhbGl6YXRpb24ge1xyXG4gICAgICAgICAgICBsZXQgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IHN1cGVyLnNlcmlhbGl6ZSgpO1xyXG4gICAgICAgICAgICBzZXJpYWxpemF0aW9uLmlkU291cmNlID0gdGhpcy5pZFNvdXJjZTtcclxuICAgICAgICAgICAgcmV0dXJuIHNlcmlhbGl6YXRpb247XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgZGVzZXJpYWxpemUoX3NlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24pOiBTZXJpYWxpemFibGUge1xyXG4gICAgICAgICAgICBzdXBlci5kZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbik7XHJcbiAgICAgICAgICAgIHRoaXMuaWRTb3VyY2UgPSBfc2VyaWFsaXphdGlvbi5pZFNvdXJjZTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTZXQgdGhpcyBub2RlIHRvIGJlIGEgcmVjcmVhdGlvbiBvZiB0aGUgW1tOb2RlUmVzb3VyY2VdXSBnaXZlblxyXG4gICAgICAgICAqIEBwYXJhbSBfbm9kZVJlc291cmNlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBzZXQoX25vZGVSZXNvdXJjZTogTm9kZVJlc291cmNlKTogdm9pZCB7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IGV4YW1pbmUsIGlmIHRoZSBzZXJpYWxpemF0aW9uIHNob3VsZCBiZSBzdG9yZWQgaW4gdGhlIE5vZGVSZXNvdXJjZSBmb3Igb3B0aW1pemF0aW9uXHJcbiAgICAgICAgICAgIGxldCBzZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uID0gU2VyaWFsaXplci5zZXJpYWxpemUoX25vZGVSZXNvdXJjZSk7XHJcbiAgICAgICAgICAgIC8vU2VyaWFsaXplci5kZXNlcmlhbGl6ZShzZXJpYWxpemF0aW9uKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgcGF0aCBpbiBzZXJpYWxpemF0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlc2VyaWFsaXplKHNlcmlhbGl6YXRpb25bcGF0aF0pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5pZFNvdXJjZSA9IF9ub2RlUmVzb3VyY2UuaWRSZXNvdXJjZTtcclxuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChFVkVOVC5OT0RFUkVTT1VSQ0VfSU5TVEFOVElBVEVEKSk7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIGV4cG9ydCBjbGFzcyBSYXkge1xyXG4gICAgICAgIHB1YmxpYyBvcmlnaW46IFZlY3RvcjM7XHJcbiAgICAgICAgcHVibGljIGRpcmVjdGlvbjogVmVjdG9yMztcclxuICAgICAgICBwdWJsaWMgbGVuZ3RoOiBudW1iZXI7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKF9kaXJlY3Rpb246IFZlY3RvcjMgPSBWZWN0b3IzLlooLTEpLCBfb3JpZ2luOiBWZWN0b3IzID0gVmVjdG9yMy5aRVJPKCksIF9sZW5ndGg6IG51bWJlciA9IDEpIHtcclxuICAgICAgICAgICAgdGhpcy5vcmlnaW4gPSBfb3JpZ2luO1xyXG4gICAgICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IF9kaXJlY3Rpb247XHJcbiAgICAgICAgICAgIHRoaXMubGVuZ3RoID0gX2xlbmd0aDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIGV4cG9ydCBjbGFzcyBSYXlIaXQge1xyXG4gICAgICAgIHB1YmxpYyBub2RlOiBOb2RlO1xyXG4gICAgICAgIHB1YmxpYyBmYWNlOiBudW1iZXI7XHJcbiAgICAgICAgcHVibGljIHpCdWZmZXI6IG51bWJlcjtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoX25vZGU6IE5vZGUgPSBudWxsLCBfZmFjZTogbnVtYmVyID0gMCwgX3pCdWZmZXI6IG51bWJlciA9IDApIHtcclxuICAgICAgICAgICAgdGhpcy5ub2RlID0gX25vZGU7XHJcbiAgICAgICAgICAgIHRoaXMuZmFjZSA9IF9mYWNlO1xyXG4gICAgICAgICAgICB0aGlzLnpCdWZmZXIgPSBfekJ1ZmZlcjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiUmVuZGVyT3BlcmF0b3IudHNcIi8+XHJcbm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgaW50ZXJmYWNlIE5vZGVSZWZlcmVuY2VzIHtcclxuICAgICAgICBzaGFkZXI6IHR5cGVvZiBTaGFkZXI7XHJcbiAgICAgICAgY29hdDogQ29hdDtcclxuICAgICAgICBtZXNoOiBNZXNoO1xyXG4gICAgICAgIC8vIGRvbmVUcmFuc2Zvcm1Ub1dvcmxkOiBib29sZWFuO1xyXG4gICAgfVxyXG4gICAgdHlwZSBNYXBOb2RlVG9Ob2RlUmVmZXJlbmNlcyA9IE1hcDxOb2RlLCBOb2RlUmVmZXJlbmNlcz47XHJcblxyXG4gICAgZXhwb3J0IGludGVyZmFjZSBQaWNrQnVmZmVyIHtcclxuICAgICAgICBub2RlOiBOb2RlO1xyXG4gICAgICAgIHRleHR1cmU6IFdlYkdMVGV4dHVyZTtcclxuICAgICAgICBmcmFtZUJ1ZmZlcjogV2ViR0xGcmFtZWJ1ZmZlcjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoaXMgY2xhc3MgbWFuYWdlcyB0aGUgcmVmZXJlbmNlcyB0byByZW5kZXIgZGF0YSB1c2VkIGJ5IG5vZGVzLlxyXG4gICAgICogTXVsdGlwbGUgbm9kZXMgbWF5IHJlZmVyIHRvIHRoZSBzYW1lIGRhdGEgdmlhIHRoZWlyIHJlZmVyZW5jZXMgdG8gc2hhZGVyLCBjb2F0IGFuZCBtZXNoIFxyXG4gICAgICovXHJcbiAgICBjbGFzcyBSZWZlcmVuY2U8VD4ge1xyXG4gICAgICAgIHByaXZhdGUgcmVmZXJlbmNlOiBUO1xyXG4gICAgICAgIHByaXZhdGUgY291bnQ6IG51bWJlciA9IDA7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKF9yZWZlcmVuY2U6IFQpIHtcclxuICAgICAgICAgICAgdGhpcy5yZWZlcmVuY2UgPSBfcmVmZXJlbmNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGdldFJlZmVyZW5jZSgpOiBUIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVmZXJlbmNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIGluY3JlYXNlQ291bnRlcigpOiBudW1iZXIge1xyXG4gICAgICAgICAgICB0aGlzLmNvdW50Kys7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvdW50O1xyXG4gICAgICAgIH1cclxuICAgICAgICBwdWJsaWMgZGVjcmVhc2VDb3VudGVyKCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNvdW50ID09IDApIHRocm93IChuZXcgRXJyb3IoXCJOZWdhdGl2ZSByZWZlcmVuY2UgY291bnRlclwiKSk7XHJcbiAgICAgICAgICAgIHRoaXMuY291bnQtLTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY291bnQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTWFuYWdlcyB0aGUgaGFuZGxpbmcgb2YgdGhlIHJlc3NvdXJjZXMgdGhhdCBhcmUgZ29pbmcgdG8gYmUgcmVuZGVyZWQgYnkgW1tSZW5kZXJPcGVyYXRvcl1dLlxyXG4gICAgICogU3RvcmVzIHRoZSByZWZlcmVuY2VzIHRvIHRoZSBzaGFkZXIsIHRoZSBjb2F0IGFuZCB0aGUgbWVzaCB1c2VkIGZvciBlYWNoIG5vZGUgcmVnaXN0ZXJlZC4gXHJcbiAgICAgKiBXaXRoIHRoZXNlIHJlZmVyZW5jZXMsIHRoZSBhbHJlYWR5IGJ1ZmZlcmVkIGRhdGEgaXMgcmV0cmlldmVkIHdoZW4gcmVuZGVyaW5nLlxyXG4gICAgICovXHJcbiAgICBleHBvcnQgYWJzdHJhY3QgY2xhc3MgUmVuZGVyTWFuYWdlciBleHRlbmRzIFJlbmRlck9wZXJhdG9yIHtcclxuICAgICAgICAvKiogU3RvcmVzIHJlZmVyZW5jZXMgdG8gdGhlIGNvbXBpbGVkIHNoYWRlciBwcm9ncmFtcyBhbmQgbWFrZXMgdGhlbSBhdmFpbGFibGUgdmlhIHRoZSByZWZlcmVuY2VzIHRvIHNoYWRlcnMgKi9cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyByZW5kZXJTaGFkZXJzOiBNYXA8dHlwZW9mIFNoYWRlciwgUmVmZXJlbmNlPFJlbmRlclNoYWRlcj4+ID0gbmV3IE1hcCgpO1xyXG4gICAgICAgIC8qKiBTdG9yZXMgcmVmZXJlbmNlcyB0byB0aGUgdmVydGV4IGFycmF5IG9iamVjdHMgYW5kIG1ha2VzIHRoZW0gYXZhaWxhYmxlIHZpYSB0aGUgcmVmZXJlbmNlcyB0byBjb2F0cyAqL1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHJlbmRlckNvYXRzOiBNYXA8Q29hdCwgUmVmZXJlbmNlPFJlbmRlckNvYXQ+PiA9IG5ldyBNYXAoKTtcclxuICAgICAgICAvKiogU3RvcmVzIHJlZmVyZW5jZXMgdG8gdGhlIHZlcnRleCBidWZmZXJzIGFuZCBtYWtlcyB0aGVtIGF2YWlsYWJsZSB2aWEgdGhlIHJlZmVyZW5jZXMgdG8gbWVzaGVzICovXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgcmVuZGVyQnVmZmVyczogTWFwPE1lc2gsIFJlZmVyZW5jZTxSZW5kZXJCdWZmZXJzPj4gPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgbm9kZXM6IE1hcE5vZGVUb05vZGVSZWZlcmVuY2VzID0gbmV3IE1hcCgpO1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHRpbWVzdGFtcFVwZGF0ZTogbnVtYmVyO1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHBpY2tCdWZmZXJzOiBQaWNrQnVmZmVyW107XHJcblxyXG4gICAgICAgIC8vICNyZWdpb24gQWRkaW5nXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVnaXN0ZXIgdGhlIG5vZGUgZm9yIHJlbmRlcmluZy4gQ3JlYXRlIGEgcmVmZXJlbmNlIGZvciBpdCBhbmQgaW5jcmVhc2UgdGhlIG1hdGNoaW5nIHJlbmRlci1kYXRhIHJlZmVyZW5jZXMgb3IgY3JlYXRlIHRoZW0gZmlyc3QgaWYgbmVjZXNzYXJ5XHJcbiAgICAgICAgICogQHBhcmFtIF9ub2RlIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgYWRkTm9kZShfbm9kZTogTm9kZSk6IHZvaWQge1xyXG4gICAgICAgICAgICBpZiAoUmVuZGVyTWFuYWdlci5ub2Rlcy5nZXQoX25vZGUpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgbGV0IGNtcE1hdGVyaWFsOiBDb21wb25lbnRNYXRlcmlhbCA9IF9ub2RlLmdldENvbXBvbmVudChDb21wb25lbnRNYXRlcmlhbCk7XHJcbiAgICAgICAgICAgIGlmICghY21wTWF0ZXJpYWwpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgICAgICBsZXQgc2hhZGVyOiB0eXBlb2YgU2hhZGVyID0gY21wTWF0ZXJpYWwubWF0ZXJpYWwuZ2V0U2hhZGVyKCk7XHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIuY3JlYXRlUmVmZXJlbmNlPHR5cGVvZiBTaGFkZXIsIFJlbmRlclNoYWRlcj4oUmVuZGVyTWFuYWdlci5yZW5kZXJTaGFkZXJzLCBzaGFkZXIsIFJlbmRlck1hbmFnZXIuY3JlYXRlUHJvZ3JhbSk7XHJcblxyXG4gICAgICAgICAgICBsZXQgY29hdDogQ29hdCA9IGNtcE1hdGVyaWFsLm1hdGVyaWFsLmdldENvYXQoKTtcclxuICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5jcmVhdGVSZWZlcmVuY2U8Q29hdCwgUmVuZGVyQ29hdD4oUmVuZGVyTWFuYWdlci5yZW5kZXJDb2F0cywgY29hdCwgUmVuZGVyTWFuYWdlci5jcmVhdGVQYXJhbWV0ZXIpO1xyXG5cclxuICAgICAgICAgICAgbGV0IG1lc2g6IE1lc2ggPSAoPENvbXBvbmVudE1lc2g+X25vZGUuZ2V0Q29tcG9uZW50KENvbXBvbmVudE1lc2gpKS5tZXNoO1xyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmNyZWF0ZVJlZmVyZW5jZTxNZXNoLCBSZW5kZXJCdWZmZXJzPihSZW5kZXJNYW5hZ2VyLnJlbmRlckJ1ZmZlcnMsIG1lc2gsIFJlbmRlck1hbmFnZXIuY3JlYXRlQnVmZmVycyk7XHJcblxyXG4gICAgICAgICAgICBsZXQgbm9kZVJlZmVyZW5jZXM6IE5vZGVSZWZlcmVuY2VzID0geyBzaGFkZXI6IHNoYWRlciwgY29hdDogY29hdCwgbWVzaDogbWVzaCB9OyAvLywgZG9uZVRyYW5zZm9ybVRvV29ybGQ6IGZhbHNlIH07XHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIubm9kZXMuc2V0KF9ub2RlLCBub2RlUmVmZXJlbmNlcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZWdpc3RlciB0aGUgbm9kZSBhbmQgaXRzIHZhbGlkIHN1Y2Nlc3NvcnMgaW4gdGhlIGJyYW5jaCBmb3IgcmVuZGVyaW5nIHVzaW5nIFtbYWRkTm9kZV1dXHJcbiAgICAgICAgICogQHBhcmFtIF9ub2RlIFxyXG4gICAgICAgICAqIEByZXR1cm5zIGZhbHNlLCBpZiB0aGUgZ2l2ZW4gbm9kZSBoYXMgYSBjdXJyZW50IHRpbWVzdGFtcCB0aHVzIGhhdmluZyBiZWluZyBwcm9jZXNzZWQgZHVyaW5nIGxhdGVzdCBSZW5kZXJNYW5hZ2VyLnVwZGF0ZSBhbmQgbm8gYWRkaXRpb24gaXMgbmVlZGVkXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBhZGRCcmFuY2goX25vZGU6IE5vZGUpOiBib29sZWFuIHtcclxuICAgICAgICAgICAgaWYgKF9ub2RlLmlzVXBkYXRlZChSZW5kZXJNYW5hZ2VyLnRpbWVzdGFtcFVwZGF0ZSkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2YgX25vZGUuYnJhbmNoKVxyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBtYXkgZmFpbCB3aGVuIHNvbWUgY29tcG9uZW50cyBhcmUgbWlzc2luZy4gVE9ETzogY2xlYW51cFxyXG4gICAgICAgICAgICAgICAgICAgIFJlbmRlck1hbmFnZXIuYWRkTm9kZShub2RlKTtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKF9lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgRGVidWcubG9nKF9lKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vICNlbmRyZWdpb25cclxuXHJcbiAgICAgICAgLy8gI3JlZ2lvbiBSZW1vdmluZ1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFVucmVnaXN0ZXIgdGhlIG5vZGUgc28gdGhhdCBpdCB3b24ndCBiZSByZW5kZXJlZCBhbnkgbW9yZS4gRGVjcmVhc2UgdGhlIHJlbmRlci1kYXRhIHJlZmVyZW5jZXMgYW5kIGRlbGV0ZSB0aGUgbm9kZSByZWZlcmVuY2UuXHJcbiAgICAgICAgICogQHBhcmFtIF9ub2RlIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgcmVtb3ZlTm9kZShfbm9kZTogTm9kZSk6IHZvaWQge1xyXG4gICAgICAgICAgICBsZXQgbm9kZVJlZmVyZW5jZXM6IE5vZGVSZWZlcmVuY2VzID0gUmVuZGVyTWFuYWdlci5ub2Rlcy5nZXQoX25vZGUpO1xyXG4gICAgICAgICAgICBpZiAoIW5vZGVSZWZlcmVuY2VzKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5yZW1vdmVSZWZlcmVuY2U8dHlwZW9mIFNoYWRlciwgUmVuZGVyU2hhZGVyPihSZW5kZXJNYW5hZ2VyLnJlbmRlclNoYWRlcnMsIG5vZGVSZWZlcmVuY2VzLnNoYWRlciwgUmVuZGVyTWFuYWdlci5kZWxldGVQcm9ncmFtKTtcclxuICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5yZW1vdmVSZWZlcmVuY2U8Q29hdCwgUmVuZGVyQ29hdD4oUmVuZGVyTWFuYWdlci5yZW5kZXJDb2F0cywgbm9kZVJlZmVyZW5jZXMuY29hdCwgUmVuZGVyTWFuYWdlci5kZWxldGVQYXJhbWV0ZXIpO1xyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLnJlbW92ZVJlZmVyZW5jZTxNZXNoLCBSZW5kZXJCdWZmZXJzPihSZW5kZXJNYW5hZ2VyLnJlbmRlckJ1ZmZlcnMsIG5vZGVSZWZlcmVuY2VzLm1lc2gsIFJlbmRlck1hbmFnZXIuZGVsZXRlQnVmZmVycyk7XHJcblxyXG4gICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLm5vZGVzLmRlbGV0ZShfbm9kZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBVbnJlZ2lzdGVyIHRoZSBub2RlIGFuZCBpdHMgdmFsaWQgc3VjY2Vzc29ycyBpbiB0aGUgYnJhbmNoIHRvIGZyZWUgcmVuZGVyZXIgcmVzb3VyY2VzLiBVc2VzIFtbcmVtb3ZlTm9kZV1dXHJcbiAgICAgICAgICogQHBhcmFtIF9ub2RlIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgcmVtb3ZlQnJhbmNoKF9ub2RlOiBOb2RlKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IG5vZGUgb2YgX25vZGUuYnJhbmNoKVxyXG4gICAgICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5yZW1vdmVOb2RlKG5vZGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyAjZW5kcmVnaW9uXHJcblxyXG4gICAgICAgIC8vICNyZWdpb24gVXBkYXRpbmdcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZWZsZWN0IGNoYW5nZXMgaW4gdGhlIG5vZGUgY29uY2VybmluZyBzaGFkZXIsIGNvYXQgYW5kIG1lc2gsIG1hbmFnZSB0aGUgcmVuZGVyLWRhdGEgcmVmZXJlbmNlcyBhY2NvcmRpbmdseSBhbmQgdXBkYXRlIHRoZSBub2RlIHJlZmVyZW5jZXNcclxuICAgICAgICAgKiBAcGFyYW0gX25vZGVcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHVwZGF0ZU5vZGUoX25vZGU6IE5vZGUpOiB2b2lkIHtcclxuICAgICAgICAgICAgbGV0IG5vZGVSZWZlcmVuY2VzOiBOb2RlUmVmZXJlbmNlcyA9IFJlbmRlck1hbmFnZXIubm9kZXMuZ2V0KF9ub2RlKTtcclxuICAgICAgICAgICAgaWYgKCFub2RlUmVmZXJlbmNlcylcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIGxldCBjbXBNYXRlcmlhbDogQ29tcG9uZW50TWF0ZXJpYWwgPSBfbm9kZS5nZXRDb21wb25lbnQoQ29tcG9uZW50TWF0ZXJpYWwpO1xyXG5cclxuICAgICAgICAgICAgbGV0IHNoYWRlcjogdHlwZW9mIFNoYWRlciA9IGNtcE1hdGVyaWFsLm1hdGVyaWFsLmdldFNoYWRlcigpO1xyXG4gICAgICAgICAgICBpZiAoc2hhZGVyICE9PSBub2RlUmVmZXJlbmNlcy5zaGFkZXIpIHtcclxuICAgICAgICAgICAgICAgIFJlbmRlck1hbmFnZXIucmVtb3ZlUmVmZXJlbmNlPHR5cGVvZiBTaGFkZXIsIFJlbmRlclNoYWRlcj4oUmVuZGVyTWFuYWdlci5yZW5kZXJTaGFkZXJzLCBub2RlUmVmZXJlbmNlcy5zaGFkZXIsIFJlbmRlck1hbmFnZXIuZGVsZXRlUHJvZ3JhbSk7XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmNyZWF0ZVJlZmVyZW5jZTx0eXBlb2YgU2hhZGVyLCBSZW5kZXJTaGFkZXI+KFJlbmRlck1hbmFnZXIucmVuZGVyU2hhZGVycywgc2hhZGVyLCBSZW5kZXJNYW5hZ2VyLmNyZWF0ZVByb2dyYW0pO1xyXG4gICAgICAgICAgICAgICAgbm9kZVJlZmVyZW5jZXMuc2hhZGVyID0gc2hhZGVyO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgY29hdDogQ29hdCA9IGNtcE1hdGVyaWFsLm1hdGVyaWFsLmdldENvYXQoKTtcclxuICAgICAgICAgICAgaWYgKGNvYXQgIT09IG5vZGVSZWZlcmVuY2VzLmNvYXQpIHtcclxuICAgICAgICAgICAgICAgIFJlbmRlck1hbmFnZXIucmVtb3ZlUmVmZXJlbmNlPENvYXQsIFJlbmRlckNvYXQ+KFJlbmRlck1hbmFnZXIucmVuZGVyQ29hdHMsIG5vZGVSZWZlcmVuY2VzLmNvYXQsIFJlbmRlck1hbmFnZXIuZGVsZXRlUGFyYW1ldGVyKTtcclxuICAgICAgICAgICAgICAgIFJlbmRlck1hbmFnZXIuY3JlYXRlUmVmZXJlbmNlPENvYXQsIFJlbmRlckNvYXQ+KFJlbmRlck1hbmFnZXIucmVuZGVyQ29hdHMsIGNvYXQsIFJlbmRlck1hbmFnZXIuY3JlYXRlUGFyYW1ldGVyKTtcclxuICAgICAgICAgICAgICAgIG5vZGVSZWZlcmVuY2VzLmNvYXQgPSBjb2F0O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgbWVzaDogTWVzaCA9ICg8Q29tcG9uZW50TWVzaD4oX25vZGUuZ2V0Q29tcG9uZW50KENvbXBvbmVudE1lc2gpKSkubWVzaDtcclxuICAgICAgICAgICAgaWYgKG1lc2ggIT09IG5vZGVSZWZlcmVuY2VzLm1lc2gpIHtcclxuICAgICAgICAgICAgICAgIFJlbmRlck1hbmFnZXIucmVtb3ZlUmVmZXJlbmNlPE1lc2gsIFJlbmRlckJ1ZmZlcnM+KFJlbmRlck1hbmFnZXIucmVuZGVyQnVmZmVycywgbm9kZVJlZmVyZW5jZXMubWVzaCwgUmVuZGVyTWFuYWdlci5kZWxldGVCdWZmZXJzKTtcclxuICAgICAgICAgICAgICAgIFJlbmRlck1hbmFnZXIuY3JlYXRlUmVmZXJlbmNlPE1lc2gsIFJlbmRlckJ1ZmZlcnM+KFJlbmRlck1hbmFnZXIucmVuZGVyQnVmZmVycywgbWVzaCwgUmVuZGVyTWFuYWdlci5jcmVhdGVCdWZmZXJzKTtcclxuICAgICAgICAgICAgICAgIG5vZGVSZWZlcmVuY2VzLm1lc2ggPSBtZXNoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBVcGRhdGUgdGhlIG5vZGUgYW5kIGl0cyB2YWxpZCBzdWNjZXNzb3JzIGluIHRoZSBicmFuY2ggdXNpbmcgW1t1cGRhdGVOb2RlXV1cclxuICAgICAgICAgKiBAcGFyYW0gX25vZGUgXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyB1cGRhdGVCcmFuY2goX25vZGU6IE5vZGUpOiB2b2lkIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgbm9kZSBvZiBfbm9kZS5icmFuY2gpXHJcbiAgICAgICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLnVwZGF0ZU5vZGUobm9kZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vICNlbmRyZWdpb25cclxuXHJcbiAgICAgICAgLy8gI3JlZ2lvbiBMaWdodHNcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBWaWV3cG9ydHMgY29sbGVjdCB0aGUgbGlnaHRzIHJlbGV2YW50IHRvIHRoZSBicmFuY2ggdG8gcmVuZGVyIGFuZCBjYWxscyBzZXRMaWdodHMgdG8gcGFzcyB0aGUgY29sbGVjdGlvbi4gIFxyXG4gICAgICAgICAqIFJlbmRlck1hbmFnZXIgcGFzc2VzIGl0IG9uIHRvIGFsbCBzaGFkZXJzIHVzZWQgdGhhdCBjYW4gcHJvY2VzcyBsaWdodFxyXG4gICAgICAgICAqIEBwYXJhbSBfbGlnaHRzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBzZXRMaWdodHMoX2xpZ2h0czogTWFwTGlnaHRUeXBlVG9MaWdodExpc3QpOiB2b2lkIHtcclxuICAgICAgICAgICAgLy8gbGV0IHJlbmRlckxpZ2h0czogUmVuZGVyTGlnaHRzID0gUmVuZGVyTWFuYWdlci5jcmVhdGVSZW5kZXJMaWdodHMoX2xpZ2h0cyk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGVudHJ5IG9mIFJlbmRlck1hbmFnZXIucmVuZGVyU2hhZGVycykge1xyXG4gICAgICAgICAgICAgICAgbGV0IHJlbmRlclNoYWRlcjogUmVuZGVyU2hhZGVyID0gZW50cnlbMV0uZ2V0UmVmZXJlbmNlKCk7XHJcbiAgICAgICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLnNldExpZ2h0c0luU2hhZGVyKHJlbmRlclNoYWRlciwgX2xpZ2h0cyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gZGVidWdnZXI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vICNlbmRyZWdpb25cclxuXHJcbiAgICAgICAgLy8gI3JlZ2lvbiBSZW5kZXJpbmdcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBVcGRhdGUgYWxsIHJlbmRlciBkYXRhLiBBZnRlciBSZW5kZXJNYW5hZ2VyLCBtdWx0aXBsZSB2aWV3cG9ydHMgY2FuIHJlbmRlciB0aGVpciBhc3NvY2lhdGVkIGRhdGEgd2l0aG91dCB1cGRhdGluZyB0aGUgc2FtZSBkYXRhIG11bHRpcGxlIHRpbWVzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyB1cGRhdGUoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIudGltZXN0YW1wVXBkYXRlID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIucmVjYWxjdWxhdGVBbGxOb2RlVHJhbnNmb3JtcygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQ2xlYXIgdGhlIG9mZnNjcmVlbiByZW5kZXJidWZmZXIgd2l0aCB0aGUgZ2l2ZW4gW1tDb2xvcl1dXHJcbiAgICAgICAgICogQHBhcmFtIF9jb2xvciBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGNsZWFyKF9jb2xvcjogQ29sb3IgPSBudWxsKTogdm9pZCB7XHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIuY3JjMy5jbGVhckNvbG9yKF9jb2xvci5yLCBfY29sb3IuZywgX2NvbG9yLmIsIF9jb2xvci5hKTtcclxuICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5jcmMzLmNsZWFyKFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuQ09MT1JfQlVGRkVSX0JJVCB8IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuREVQVEhfQlVGRkVSX0JJVCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXNldCB0aGUgb2Zmc2NyZWVuIGZyYW1lYnVmZmVyIHRvIHRoZSBvcmlnaW5hbCBSZW5kZXJpbmdDb250ZXh0XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyByZXNldEZyYW1lQnVmZmVyKF9jb2xvcjogQ29sb3IgPSBudWxsKTogdm9pZCB7XHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIuY3JjMy5iaW5kRnJhbWVidWZmZXIoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5GUkFNRUJVRkZFUiwgbnVsbCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEcmF3cyB0aGUgYnJhbmNoIHN0YXJ0aW5nIHdpdGggdGhlIGdpdmVuIFtbTm9kZV1dIHVzaW5nIHRoZSBjYW1lcmEgZ2l2ZW4gW1tDb21wb25lbnRDYW1lcmFdXS5cclxuICAgICAgICAgKiBAcGFyYW0gX25vZGUgXHJcbiAgICAgICAgICogQHBhcmFtIF9jbXBDYW1lcmEgXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBkcmF3QnJhbmNoKF9ub2RlOiBOb2RlLCBfY21wQ2FtZXJhOiBDb21wb25lbnRDYW1lcmEsIF9kcmF3Tm9kZTogRnVuY3Rpb24gPSBSZW5kZXJNYW5hZ2VyLmRyYXdOb2RlKTogdm9pZCB7IC8vIFRPRE86IHNlZSBpZiB0aGlyZCBwYXJhbWV0ZXIgX3dvcmxkPzogTWF0cml4NHg0IHdvdWxkIGJlIHVzZWZ1bGxcclxuICAgICAgICAgICAgaWYgKF9kcmF3Tm9kZSA9PSBSZW5kZXJNYW5hZ2VyLmRyYXdOb2RlKVxyXG4gICAgICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5yZXNldEZyYW1lQnVmZmVyKCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgZmluYWxUcmFuc2Zvcm06IE1hdHJpeDR4NDtcclxuXHJcbiAgICAgICAgICAgIGxldCBjbXBNZXNoOiBDb21wb25lbnRNZXNoID0gX25vZGUuZ2V0Q29tcG9uZW50KENvbXBvbmVudE1lc2gpO1xyXG4gICAgICAgICAgICBpZiAoY21wTWVzaClcclxuICAgICAgICAgICAgICAgIGZpbmFsVHJhbnNmb3JtID0gTWF0cml4NHg0Lk1VTFRJUExJQ0FUSU9OKF9ub2RlLm10eFdvcmxkLCBjbXBNZXNoLnBpdm90KTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgZmluYWxUcmFuc2Zvcm0gPSBfbm9kZS5tdHhXb3JsZDsgLy8gY2F1dGlvbiwgUmVuZGVyTWFuYWdlciBpcyBhIHJlZmVyZW5jZS4uLlxyXG5cclxuICAgICAgICAgICAgLy8gbXVsdGlwbHkgY2FtZXJhIG1hdHJpeFxyXG4gICAgICAgICAgICBsZXQgcHJvamVjdGlvbjogTWF0cml4NHg0ID0gTWF0cml4NHg0Lk1VTFRJUExJQ0FUSU9OKF9jbXBDYW1lcmEuVmlld1Byb2plY3Rpb25NYXRyaXgsIGZpbmFsVHJhbnNmb3JtKTtcclxuXHJcbiAgICAgICAgICAgIF9kcmF3Tm9kZShfbm9kZSwgZmluYWxUcmFuc2Zvcm0sIHByb2plY3Rpb24pO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgbmFtZSBpbiBfbm9kZS5nZXRDaGlsZHJlbigpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY2hpbGROb2RlOiBOb2RlID0gX25vZGUuZ2V0Q2hpbGRyZW4oKVtuYW1lXTtcclxuICAgICAgICAgICAgICAgIFJlbmRlck1hbmFnZXIuZHJhd0JyYW5jaChjaGlsZE5vZGUsIF9jbXBDYW1lcmEsIF9kcmF3Tm9kZSk7IC8vLCB3b3JsZCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIFJlY3ljbGVyLnN0b3JlKHByb2plY3Rpb24pO1xyXG4gICAgICAgICAgICBpZiAoZmluYWxUcmFuc2Zvcm0gIT0gX25vZGUubXR4V29ybGQpXHJcbiAgICAgICAgICAgICAgICBSZWN5Y2xlci5zdG9yZShmaW5hbFRyYW5zZm9ybSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyNyZWdpb24gUmF5Q2FzdCAmIFBpY2tpbmdcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRHJhd3MgdGhlIGJyYW5jaCBmb3IgUmF5Q2FzdGluZyBzdGFydGluZyB3aXRoIHRoZSBnaXZlbiBbW05vZGVdXSB1c2luZyB0aGUgY2FtZXJhIGdpdmVuIFtbQ29tcG9uZW50Q2FtZXJhXV0uXHJcbiAgICAgICAgICogQHBhcmFtIF9ub2RlIFxyXG4gICAgICAgICAqIEBwYXJhbSBfY21wQ2FtZXJhIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZHJhd0JyYW5jaEZvclJheUNhc3QoX25vZGU6IE5vZGUsIF9jbXBDYW1lcmE6IENvbXBvbmVudENhbWVyYSk6IFBpY2tCdWZmZXJbXSB7IC8vIFRPRE86IHNlZSBpZiB0aGlyZCBwYXJhbWV0ZXIgX3dvcmxkPzogTWF0cml4NHg0IHdvdWxkIGJlIHVzZWZ1bGxcclxuICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5waWNrQnVmZmVycyA9IFtdO1xyXG4gICAgICAgICAgICBpZiAoIVJlbmRlck1hbmFnZXIucmVuZGVyU2hhZGVycy5nZXQoU2hhZGVyUmF5Q2FzdCkpXHJcbiAgICAgICAgICAgICAgICBSZW5kZXJNYW5hZ2VyLmNyZWF0ZVJlZmVyZW5jZTx0eXBlb2YgU2hhZGVyLCBSZW5kZXJTaGFkZXI+KFJlbmRlck1hbmFnZXIucmVuZGVyU2hhZGVycywgU2hhZGVyUmF5Q2FzdCwgUmVuZGVyTWFuYWdlci5jcmVhdGVQcm9ncmFtKTtcclxuICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5kcmF3QnJhbmNoKF9ub2RlLCBfY21wQ2FtZXJhLCBSZW5kZXJNYW5hZ2VyLmRyYXdOb2RlRm9yUmF5Q2FzdCk7XHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIucmVzZXRGcmFtZUJ1ZmZlcigpO1xyXG4gICAgICAgICAgICByZXR1cm4gUmVuZGVyTWFuYWdlci5waWNrQnVmZmVycztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgcGlja05vZGVBdChfcG9zOiBWZWN0b3IyLCBfcGlja0J1ZmZlcnM6IFBpY2tCdWZmZXJbXSwgX3JlY3Q6IFJlY3RhbmdsZSk6IFJheUhpdFtdIHtcclxuICAgICAgICAgICAgbGV0IGhpdHM6IFJheUhpdFtdID0gW107XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBmb3IgKGxldCBwaWNrQnVmZmVyIG9mIF9waWNrQnVmZmVycykge1xyXG4gICAgICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5jcmMzLmJpbmRGcmFtZWJ1ZmZlcihXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkZSQU1FQlVGRkVSLCBwaWNrQnVmZmVyLmZyYW1lQnVmZmVyKTtcclxuICAgICAgICAgICAgICAgIC8vIFRPRE86IGluc3RlYWQgb2YgcmVhZGluZyBhbGwgZGF0YSBhbmQgYWZ0ZXJ3YXJkcyBwaWNrIHRoZSBwaXhlbCwgcmVhZCBvbmx5IHRoZSBwaXhlbCFcclxuICAgICAgICAgICAgICAgIGxldCBkYXRhOiBVaW50OEFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoX3JlY3Qud2lkdGggKiBfcmVjdC5oZWlnaHQgKiA0KTtcclxuICAgICAgICAgICAgICAgIFJlbmRlck1hbmFnZXIuY3JjMy5yZWFkUGl4ZWxzKDAsIDAsIF9yZWN0LndpZHRoLCBfcmVjdC5oZWlnaHQsIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuUkdCQSwgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5VTlNJR05FRF9CWVRFLCBkYXRhKTtcclxuICAgICAgICAgICAgICAgIGxldCBwaXhlbDogbnVtYmVyID0gX3Bvcy54ICsgX3JlY3Qud2lkdGggKiBfcG9zLnk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHpCdWZmZXI6IG51bWJlciA9IGRhdGFbNCAqIHBpeGVsICsgMl0gKyBkYXRhWzQgKiBwaXhlbCArIDNdIC8gMjU2O1xyXG4gICAgICAgICAgICAgICAgbGV0IGhpdDogUmF5SGl0ID0gbmV3IFJheUhpdChwaWNrQnVmZmVyLm5vZGUsIDAsIHpCdWZmZXIpO1xyXG5cclxuICAgICAgICAgICAgICAgIGhpdHMucHVzaChoaXQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gaGl0cztcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBkcmF3Tm9kZShfbm9kZTogTm9kZSwgX2ZpbmFsVHJhbnNmb3JtOiBNYXRyaXg0eDQsIF9wcm9qZWN0aW9uOiBNYXRyaXg0eDQpOiB2b2lkIHtcclxuICAgICAgICAgICAgbGV0IHJlZmVyZW5jZXM6IE5vZGVSZWZlcmVuY2VzID0gUmVuZGVyTWFuYWdlci5ub2Rlcy5nZXQoX25vZGUpO1xyXG4gICAgICAgICAgICBpZiAoIXJlZmVyZW5jZXMpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47IC8vIFRPRE86IGRlYWwgd2l0aCBwYXJ0aWFsIHJlZmVyZW5jZXNcclxuXHJcbiAgICAgICAgICAgIGxldCBidWZmZXJJbmZvOiBSZW5kZXJCdWZmZXJzID0gUmVuZGVyTWFuYWdlci5yZW5kZXJCdWZmZXJzLmdldChyZWZlcmVuY2VzLm1lc2gpLmdldFJlZmVyZW5jZSgpO1xyXG4gICAgICAgICAgICBsZXQgY29hdEluZm86IFJlbmRlckNvYXQgPSBSZW5kZXJNYW5hZ2VyLnJlbmRlckNvYXRzLmdldChyZWZlcmVuY2VzLmNvYXQpLmdldFJlZmVyZW5jZSgpO1xyXG4gICAgICAgICAgICBsZXQgc2hhZGVySW5mbzogUmVuZGVyU2hhZGVyID0gUmVuZGVyTWFuYWdlci5yZW5kZXJTaGFkZXJzLmdldChyZWZlcmVuY2VzLnNoYWRlcikuZ2V0UmVmZXJlbmNlKCk7XHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIuZHJhdyhzaGFkZXJJbmZvLCBidWZmZXJJbmZvLCBjb2F0SW5mbywgX2ZpbmFsVHJhbnNmb3JtLCBfcHJvamVjdGlvbik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBkcmF3Tm9kZUZvclJheUNhc3QoX25vZGU6IE5vZGUsIF9maW5hbFRyYW5zZm9ybTogTWF0cml4NHg0LCBfcHJvamVjdGlvbjogTWF0cml4NHg0KTogdm9pZCB7IC8vIGNyZWF0ZSBUZXh0dXJlIHRvIHJlbmRlciB0bywgaW50LXJnYmFcclxuICAgICAgICAgICAgLy8gVE9ETzogbG9vayBpbnRvIFNTQk9zIVxyXG4gICAgICAgICAgICBsZXQgdGFyZ2V0OiBXZWJHTFRleHR1cmUgPSBSZW5kZXJNYW5hZ2VyLmdldFJheUNhc3RUZXh0dXJlKCk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBmcmFtZWJ1ZmZlcjogV2ViR0xGcmFtZWJ1ZmZlciA9IFJlbmRlck1hbmFnZXIuY3JjMy5jcmVhdGVGcmFtZWJ1ZmZlcigpO1xyXG4gICAgICAgICAgICAvLyByZW5kZXIgdG8gb3VyIHRhcmdldFRleHR1cmUgYnkgYmluZGluZyB0aGUgZnJhbWVidWZmZXJcclxuICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5jcmMzLmJpbmRGcmFtZWJ1ZmZlcihXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkZSQU1FQlVGRkVSLCBmcmFtZWJ1ZmZlcik7XHJcbiAgICAgICAgICAgIC8vIGF0dGFjaCB0aGUgdGV4dHVyZSBhcyB0aGUgZmlyc3QgY29sb3IgYXR0YWNobWVudFxyXG4gICAgICAgICAgICBjb25zdCBhdHRhY2htZW50UG9pbnQ6IG51bWJlciA9IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuQ09MT1JfQVRUQUNITUVOVDA7XHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIuY3JjMy5mcmFtZWJ1ZmZlclRleHR1cmUyRChXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkZSQU1FQlVGRkVSLCBhdHRhY2htZW50UG9pbnQsIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVEVYVFVSRV8yRCwgdGFyZ2V0LCAwKTtcclxuXHJcbiAgICAgICAgICAgIC8vIHNldCByZW5kZXIgdGFyZ2V0XHJcblxyXG4gICAgICAgICAgICBsZXQgcmVmZXJlbmNlczogTm9kZVJlZmVyZW5jZXMgPSBSZW5kZXJNYW5hZ2VyLm5vZGVzLmdldChfbm9kZSk7XHJcbiAgICAgICAgICAgIGlmICghcmVmZXJlbmNlcylcclxuICAgICAgICAgICAgICAgIHJldHVybjsgLy8gVE9ETzogZGVhbCB3aXRoIHBhcnRpYWwgcmVmZXJlbmNlc1xyXG5cclxuICAgICAgICAgICAgbGV0IHBpY2tCdWZmZXI6IFBpY2tCdWZmZXIgPSB7bm9kZTogX25vZGUsIHRleHR1cmU6IHRhcmdldCwgZnJhbWVCdWZmZXI6IGZyYW1lYnVmZmVyfTtcclxuICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5waWNrQnVmZmVycy5wdXNoKHBpY2tCdWZmZXIpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGJ1ZmZlckluZm86IFJlbmRlckJ1ZmZlcnMgPSBSZW5kZXJNYW5hZ2VyLnJlbmRlckJ1ZmZlcnMuZ2V0KHJlZmVyZW5jZXMubWVzaCkuZ2V0UmVmZXJlbmNlKCk7XHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIuZHJhd0ZvclJheUNhc3QoUmVuZGVyTWFuYWdlci5waWNrQnVmZmVycy5sZW5ndGgsIGJ1ZmZlckluZm8sIF9maW5hbFRyYW5zZm9ybSwgX3Byb2plY3Rpb24pO1xyXG4gICAgICAgICAgICAvLyBtYWtlIHRleHR1cmUgYXZhaWxhYmxlIHRvIG9uc2NyZWVuLWRpc3BsYXlcclxuICAgICAgICAgICAgLy8gSURFQTogSXRlcmF0ZSBvdmVyIHRleHR1cmVzLCBjb2xsZWN0IGRhdGEgaWYgeiBpbmRpY2F0ZXMgaGl0LCBzb3J0IGJ5IHpcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGdldFJheUNhc3RUZXh0dXJlKCk6IFdlYkdMVGV4dHVyZSB7XHJcbiAgICAgICAgICAgIC8vIGNyZWF0ZSB0byByZW5kZXIgdG9cclxuICAgICAgICAgICAgY29uc3QgdGFyZ2V0VGV4dHVyZVdpZHRoOiBudW1iZXIgPSBSZW5kZXJNYW5hZ2VyLmdldFZpZXdwb3J0UmVjdGFuZ2xlKCkud2lkdGg7XHJcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldFRleHR1cmVIZWlnaHQ6IG51bWJlciA9IFJlbmRlck1hbmFnZXIuZ2V0Vmlld3BvcnRSZWN0YW5nbGUoKS5oZWlnaHQ7XHJcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldFRleHR1cmU6IFdlYkdMVGV4dHVyZSA9IFJlbmRlck1hbmFnZXIuY3JjMy5jcmVhdGVUZXh0dXJlKCk7XHJcbiAgICAgICAgICAgIFJlbmRlck1hbmFnZXIuY3JjMy5iaW5kVGV4dHVyZShXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlRFWFRVUkVfMkQsIHRhcmdldFRleHR1cmUpO1xyXG5cclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaW50ZXJuYWxGb3JtYXQ6IG51bWJlciA9IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuUkdCQTg7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBmb3JtYXQ6IG51bWJlciA9IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuUkdCQTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGU6IG51bWJlciA9IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVU5TSUdORURfQllURTtcclxuICAgICAgICAgICAgICAgIFJlbmRlck1hbmFnZXIuY3JjMy50ZXhJbWFnZTJEKFxyXG4gICAgICAgICAgICAgICAgICAgIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQuVEVYVFVSRV8yRCwgMCwgaW50ZXJuYWxGb3JtYXQsIHRhcmdldFRleHR1cmVXaWR0aCwgdGFyZ2V0VGV4dHVyZUhlaWdodCwgMCwgZm9ybWF0LCB0eXBlLCBudWxsXHJcbiAgICAgICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIHNldCB0aGUgZmlsdGVyaW5nIHNvIHdlIGRvbid0IG5lZWQgbWlwc1xyXG4gICAgICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5jcmMzLnRleFBhcmFtZXRlcmkoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5URVhUVVJFXzJELCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlRFWFRVUkVfTUlOX0ZJTFRFUiwgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5MSU5FQVIpO1xyXG4gICAgICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5jcmMzLnRleFBhcmFtZXRlcmkoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5URVhUVVJFXzJELCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlRFWFRVUkVfV1JBUF9TLCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkNMQU1QX1RPX0VER0UpO1xyXG4gICAgICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5jcmMzLnRleFBhcmFtZXRlcmkoV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5URVhUVVJFXzJELCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LlRFWFRVUkVfV1JBUF9ULCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LkNMQU1QX1RPX0VER0UpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdGFyZ2V0VGV4dHVyZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8jZW5kcmVnaW9uXHJcblxyXG4gICAgICAgIC8vI3JlZ2lvbiBUcmFuc2Zvcm1hdGlvbiBvZiBicmFuY2hcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZWNhbGN1bGF0ZSB0aGUgd29ybGQgbWF0cml4IG9mIGFsbCByZWdpc3RlcmVkIG5vZGVzIHJlc3BlY3RpbmcgdGhlaXIgaGllcmFyY2hpY2FsIHJlbGF0aW9uLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHJlY2FsY3VsYXRlQWxsTm9kZVRyYW5zZm9ybXMoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIC8vIGlubmVyIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBpbiBhIGZvciBlYWNoIG5vZGUgYXQgdGhlIGJvdHRvbSBvZiBSZW5kZXJNYW5hZ2VyIGZ1bmN0aW9uXHJcbiAgICAgICAgICAgIC8vIGZ1bmN0aW9uIG1hcmtOb2RlVG9CZVRyYW5zZm9ybWVkKF9ub2RlUmVmZXJlbmNlczogTm9kZVJlZmVyZW5jZXMsIF9ub2RlOiBOb2RlLCBfbWFwOiBNYXBOb2RlVG9Ob2RlUmVmZXJlbmNlcyk6IHZvaWQge1xyXG4gICAgICAgICAgICAvLyAgICAgX25vZGVSZWZlcmVuY2VzLmRvbmVUcmFuc2Zvcm1Ub1dvcmxkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgICAgIC8vIGlubmVyIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBpbiBhIGZvciBlYWNoIG5vZGUgYXQgdGhlIGJvdHRvbSBvZiBSZW5kZXJNYW5hZ2VyIGZ1bmN0aW9uXHJcbiAgICAgICAgICAgIGxldCByZWNhbGN1bGF0ZUJyYW5jaENvbnRhaW5pbmdOb2RlOiAoX3I6IE5vZGVSZWZlcmVuY2VzLCBfbjogTm9kZSwgX206IE1hcE5vZGVUb05vZGVSZWZlcmVuY2VzKSA9PiB2b2lkID0gKF9ub2RlUmVmZXJlbmNlczogTm9kZVJlZmVyZW5jZXMsIF9ub2RlOiBOb2RlLCBfbWFwOiBNYXBOb2RlVG9Ob2RlUmVmZXJlbmNlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgLy8gZmluZCB1cHBlcm1vc3QgYW5jZXN0b3Igbm90IHJlY2FsY3VsYXRlZCB5ZXRcclxuICAgICAgICAgICAgICAgIGxldCBhbmNlc3RvcjogTm9kZSA9IF9ub2RlO1xyXG4gICAgICAgICAgICAgICAgbGV0IHBhcmVudDogTm9kZTtcclxuICAgICAgICAgICAgICAgIHdoaWxlICh0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50ID0gYW5jZXN0b3IuZ2V0UGFyZW50KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFwYXJlbnQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChfbm9kZS5pc1VwZGF0ZWQoUmVuZGVyTWFuYWdlci50aW1lc3RhbXBVcGRhdGUpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBhbmNlc3RvciA9IHBhcmVudDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIFRPRE86IGNoZWNrIGlmIG5vZGVzIHdpdGhvdXQgbWVzaGVzIG11c3QgYmUgcmVnaXN0ZXJlZFxyXG5cclxuICAgICAgICAgICAgICAgIC8vIHVzZSB0aGUgYW5jZXN0b3JzIHBhcmVudCB3b3JsZCBtYXRyaXggdG8gc3RhcnQgd2l0aCwgb3IgaWRlbnRpdHkgaWYgbm8gcGFyZW50IGV4aXN0cyBvciBpdCdzIG1pc3NpbmcgYSBDb21wb25lblRyYW5zZm9ybVxyXG4gICAgICAgICAgICAgICAgbGV0IG1hdHJpeDogTWF0cml4NHg0ID0gTWF0cml4NHg0LklERU5USVRZO1xyXG4gICAgICAgICAgICAgICAgaWYgKHBhcmVudClcclxuICAgICAgICAgICAgICAgICAgICBtYXRyaXggPSBwYXJlbnQubXR4V29ybGQ7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gc3RhcnQgcmVjdXJzaXZlIHJlY2FsY3VsYXRpb24gb2YgdGhlIHdob2xlIGJyYW5jaCBzdGFydGluZyBmcm9tIHRoZSBhbmNlc3RvciBmb3VuZFxyXG4gICAgICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5yZWNhbGN1bGF0ZVRyYW5zZm9ybXNPZk5vZGVBbmRDaGlsZHJlbihhbmNlc3RvciwgbWF0cml4KTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIC8vIGNhbGwgdGhlIGZ1bmN0aW9ucyBhYm92ZSBmb3IgZWFjaCByZWdpc3RlcmVkIG5vZGVcclxuICAgICAgICAgICAgLy8gUmVuZGVyTWFuYWdlci5ub2Rlcy5mb3JFYWNoKG1hcmtOb2RlVG9CZVRyYW5zZm9ybWVkKTtcclxuICAgICAgICAgICAgUmVuZGVyTWFuYWdlci5ub2Rlcy5mb3JFYWNoKHJlY2FsY3VsYXRlQnJhbmNoQ29udGFpbmluZ05vZGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmVjdXJzaXZlIG1ldGhvZCByZWNlaXZpbmcgYSBjaGlsZG5vZGUgYW5kIGl0cyBwYXJlbnRzIHVwZGF0ZWQgd29ybGQgdHJhbnNmb3JtLiAgXHJcbiAgICAgICAgICogSWYgdGhlIGNoaWxkbm9kZSBvd25zIGEgQ29tcG9uZW50VHJhbnNmb3JtLCBpdHMgd29ybGRtYXRyaXggaXMgcmVjYWxjdWxhdGVkIGFuZCBwYXNzZWQgb24gdG8gaXRzIGNoaWxkcmVuLCBvdGhlcndpc2UgaXRzIHBhcmVudHMgbWF0cml4XHJcbiAgICAgICAgICogQHBhcmFtIF9ub2RlIFxyXG4gICAgICAgICAqIEBwYXJhbSBfd29ybGQgXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgcmVjYWxjdWxhdGVUcmFuc2Zvcm1zT2ZOb2RlQW5kQ2hpbGRyZW4oX25vZGU6IE5vZGUsIF93b3JsZDogTWF0cml4NHg0KTogdm9pZCB7XHJcbiAgICAgICAgICAgIGxldCB3b3JsZDogTWF0cml4NHg0ID0gX3dvcmxkO1xyXG4gICAgICAgICAgICBsZXQgY21wVHJhbnNmb3JtOiBDb21wb25lbnRUcmFuc2Zvcm0gPSBfbm9kZS5jbXBUcmFuc2Zvcm07XHJcbiAgICAgICAgICAgIGlmIChjbXBUcmFuc2Zvcm0pXHJcbiAgICAgICAgICAgICAgICB3b3JsZCA9IE1hdHJpeDR4NC5NVUxUSVBMSUNBVElPTihfd29ybGQsIGNtcFRyYW5zZm9ybS5sb2NhbCk7XHJcblxyXG4gICAgICAgICAgICBfbm9kZS5tdHhXb3JsZCA9IHdvcmxkO1xyXG4gICAgICAgICAgICBfbm9kZS50aW1lc3RhbXBVcGRhdGUgPSBSZW5kZXJNYW5hZ2VyLnRpbWVzdGFtcFVwZGF0ZTtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIF9ub2RlLmdldENoaWxkcmVuKCkpIHtcclxuICAgICAgICAgICAgICAgIFJlbmRlck1hbmFnZXIucmVjYWxjdWxhdGVUcmFuc2Zvcm1zT2ZOb2RlQW5kQ2hpbGRyZW4oY2hpbGQsIHdvcmxkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyAjZW5kcmVnaW9uXHJcblxyXG4gICAgICAgIC8vICNyZWdpb24gTWFuYWdlIHJlZmVyZW5jZXMgdG8gcmVuZGVyIGRhdGFcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZW1vdmVzIGEgcmVmZXJlbmNlIHRvIGEgcHJvZ3JhbSwgcGFyYW1ldGVyIG9yIGJ1ZmZlciBieSBkZWNyZWFzaW5nIGl0cyByZWZlcmVuY2UgY291bnRlciBhbmQgZGVsZXRpbmcgaXQsIGlmIHRoZSBjb3VudGVyIHJlYWNoZXMgMFxyXG4gICAgICAgICAqIEBwYXJhbSBfaW4gXHJcbiAgICAgICAgICogQHBhcmFtIF9rZXkgXHJcbiAgICAgICAgICogQHBhcmFtIF9kZWxldG9yIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHJlbW92ZVJlZmVyZW5jZTxLZXlUeXBlLCBSZWZlcmVuY2VUeXBlPihfaW46IE1hcDxLZXlUeXBlLCBSZWZlcmVuY2U8UmVmZXJlbmNlVHlwZT4+LCBfa2V5OiBLZXlUeXBlLCBfZGVsZXRvcjogRnVuY3Rpb24pOiB2b2lkIHtcclxuICAgICAgICAgICAgbGV0IHJlZmVyZW5jZTogUmVmZXJlbmNlPFJlZmVyZW5jZVR5cGU+O1xyXG4gICAgICAgICAgICByZWZlcmVuY2UgPSBfaW4uZ2V0KF9rZXkpO1xyXG4gICAgICAgICAgICBpZiAocmVmZXJlbmNlLmRlY3JlYXNlQ291bnRlcigpID09IDApIHtcclxuICAgICAgICAgICAgICAgIC8vIFRoZSBmb2xsb3dpbmcgZGVsZXRpb25zIG1heSBiZSBhbiBvcHRpbWl6YXRpb24sIG5vdCBuZWNlc3NhcnkgdG8gc3RhcnQgd2l0aCBhbmQgbWF5YmUgY291bnRlcnByb2R1Y3RpdmUuXHJcbiAgICAgICAgICAgICAgICAvLyBJZiBkYXRhIHNob3VsZCBiZSB1c2VkIGxhdGVyIGFnYWluLCBpdCBtdXN0IHRoZW4gYmUgcmVjb25zdHJ1Y3RlZC4uLlxyXG4gICAgICAgICAgICAgICAgX2RlbGV0b3IocmVmZXJlbmNlLmdldFJlZmVyZW5jZSgpKTtcclxuICAgICAgICAgICAgICAgIF9pbi5kZWxldGUoX2tleSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEluY3JlYXNlcyB0aGUgY291bnRlciBvZiB0aGUgcmVmZXJlbmNlIHRvIGEgcHJvZ3JhbSwgcGFyYW1ldGVyIG9yIGJ1ZmZlci4gQ3JlYXRlcyB0aGUgcmVmZXJlbmNlLCBpZiBpdCdzIG5vdCBleGlzdGVudC5cclxuICAgICAgICAgKiBAcGFyYW0gX2luIFxyXG4gICAgICAgICAqIEBwYXJhbSBfa2V5IFxyXG4gICAgICAgICAqIEBwYXJhbSBfY3JlYXRvciBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBjcmVhdGVSZWZlcmVuY2U8S2V5VHlwZSwgUmVmZXJlbmNlVHlwZT4oX2luOiBNYXA8S2V5VHlwZSwgUmVmZXJlbmNlPFJlZmVyZW5jZVR5cGU+PiwgX2tleTogS2V5VHlwZSwgX2NyZWF0b3I6IEZ1bmN0aW9uKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGxldCByZWZlcmVuY2U6IFJlZmVyZW5jZTxSZWZlcmVuY2VUeXBlPjtcclxuICAgICAgICAgICAgcmVmZXJlbmNlID0gX2luLmdldChfa2V5KTtcclxuICAgICAgICAgICAgaWYgKHJlZmVyZW5jZSlcclxuICAgICAgICAgICAgICAgIHJlZmVyZW5jZS5pbmNyZWFzZUNvdW50ZXIoKTtcclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY29udGVudDogUmVmZXJlbmNlVHlwZSA9IF9jcmVhdG9yKF9rZXkpO1xyXG4gICAgICAgICAgICAgICAgcmVmZXJlbmNlID0gbmV3IFJlZmVyZW5jZTxSZWZlcmVuY2VUeXBlPihjb250ZW50KTtcclxuICAgICAgICAgICAgICAgIHJlZmVyZW5jZS5pbmNyZWFzZUNvdW50ZXIoKTtcclxuICAgICAgICAgICAgICAgIF9pbi5zZXQoX2tleSwgcmVmZXJlbmNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyAjZW5kcmVnaW9uXHJcbiAgICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vQ29hdC9Db2F0LnRzXCIvPlxyXG5uYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogU3RhdGljIHN1cGVyY2xhc3MgZm9yIHRoZSByZXByZXNlbnRhdGlvbiBvZiBXZWJHbCBzaGFkZXJwcm9ncmFtcy4gXHJcbiAgICAgKiBAYXV0aG9ycyBKYXNjaGEgS2FyYWfDtmwsIEhGVSwgMjAxOSB8IEppcmthIERlbGwnT3JvLUZyaWVkbCwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuXHJcbiAgICAgLy8gVE9ETzogZGVmaW5lIGF0dHJpYnV0ZS91bmlmb3JtcyBhcyBsYXlvdXQgYW5kIHVzZSB0aG9zZSBjb25zaXN0ZW50bHkgaW4gc2hhZGVyc1xyXG4gICAgIFxyXG4gICAgZXhwb3J0IGNsYXNzIFNoYWRlciB7XHJcbiAgICAgICAgLyoqIFRoZSB0eXBlIG9mIGNvYXQgdGhhdCBjYW4gYmUgdXNlZCB3aXRoIHRoaXMgc2hhZGVyIHRvIGNyZWF0ZSBhIG1hdGVyaWFsICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXRDb2F0KCk6IHR5cGVvZiBDb2F0IHsgcmV0dXJuIG51bGw7IH1cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGdldFZlcnRleFNoYWRlclNvdXJjZSgpOiBzdHJpbmcgeyByZXR1cm4gbnVsbDsgfVxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0RnJhZ21lbnRTaGFkZXJTb3VyY2UoKTogc3RyaW5nIHsgcmV0dXJuIG51bGw7IH1cclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBTaW5nbGUgY29sb3Igc2hhZGluZ1xyXG4gICAgICogQGF1dGhvcnMgSmFzY2hhIEthcmFnw7ZsLCBIRlUsIDIwMTkgfCBKaXJrYSBEZWxsJ09yby1GcmllZGwsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgU2hhZGVyRmxhdCBleHRlbmRzIFNoYWRlciB7XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXRDb2F0KCk6IHR5cGVvZiBDb2F0IHtcclxuICAgICAgICAgICAgcmV0dXJuIENvYXRDb2xvcmVkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXRWZXJ0ZXhTaGFkZXJTb3VyY2UoKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgcmV0dXJuIGAjdmVyc2lvbiAzMDAgZXNcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgc3RydWN0IExpZ2h0QW1iaWVudCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlYzQgY29sb3I7XHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICBzdHJ1Y3QgTGlnaHREaXJlY3Rpb25hbCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlYzQgY29sb3I7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlYzMgZGlyZWN0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVpbnQgTUFYX0xJR0hUU19ESVJFQ1RJT05BTCA9IDEwdTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaW4gdmVjMyBhX3Bvc2l0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgIGluIHZlYzMgYV9ub3JtYWw7XHJcbiAgICAgICAgICAgICAgICAgICAgdW5pZm9ybSBtYXQ0IHVfd29ybGQ7XHJcbiAgICAgICAgICAgICAgICAgICAgdW5pZm9ybSBtYXQ0IHVfcHJvamVjdGlvbjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdW5pZm9ybSBMaWdodEFtYmllbnQgdV9hbWJpZW50O1xyXG4gICAgICAgICAgICAgICAgICAgIHVuaWZvcm0gdWludCB1X25MaWdodHNEaXJlY3Rpb25hbDtcclxuICAgICAgICAgICAgICAgICAgICB1bmlmb3JtIExpZ2h0RGlyZWN0aW9uYWwgdV9kaXJlY3Rpb25hbFtNQVhfTElHSFRTX0RJUkVDVElPTkFMXTtcclxuICAgICAgICAgICAgICAgICAgICBmbGF0IG91dCB2ZWM0IHZfY29sb3I7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgdm9pZCBtYWluKCkgeyAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBnbF9Qb3NpdGlvbiA9IHVfcHJvamVjdGlvbiAqIHZlYzQoYV9wb3NpdGlvbiwgMS4wKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmVjMyBub3JtYWwgPSBtYXQzKHVfd29ybGQpICogYV9ub3JtYWw7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2X2NvbG9yID0gdmVjNCgwLDAsMCwwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh1aW50IGkgPSAwdTsgaSA8IHVfbkxpZ2h0c0RpcmVjdGlvbmFsOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZsb2F0IGlsbHVtaW5hdGlvbiA9IC1kb3Qobm9ybWFsLCB1X2RpcmVjdGlvbmFsW2ldLmRpcmVjdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaWxsdW1pbmF0aW9uID4gMC4wZilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2X2NvbG9yICs9IGlsbHVtaW5hdGlvbiAqIHVfZGlyZWN0aW9uYWxbaV0uY29sb3I7IC8vIHZlYzQoMSwxLDEsMSk7IC8vIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vdV9hbWJpZW50O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3VfZGlyZWN0aW9uYWxbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgfWA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0RnJhZ21lbnRTaGFkZXJTb3VyY2UoKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgcmV0dXJuIGAjdmVyc2lvbiAzMDAgZXNcclxuICAgICAgICAgICAgICAgICAgICBwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdW5pZm9ybSB2ZWM0IHVfY29sb3I7XHJcbiAgICAgICAgICAgICAgICAgICAgZmxhdCBpbiB2ZWM0IHZfY29sb3I7XHJcbiAgICAgICAgICAgICAgICAgICAgb3V0IHZlYzQgZnJhZztcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICB2b2lkIG1haW4oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyYWcgPSB1X2NvbG9yICogdl9jb2xvcjtcclxuICAgICAgICAgICAgICAgICAgICB9YDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJcclxubmFtZXNwYWNlIEZ1ZGdlQ29yZSB7XHJcbiAgICAvKipcclxuICAgICAqIE1hdGNhcCAoTWF0ZXJpYWwgQ2FwdHVyZSkgc2hhZGluZy4gVGhlIHRleHR1cmUgcHJvdmlkZWQgYnkgdGhlIGNvYXQgaXMgdXNlZCBhcyBhIG1hdGNhcCBtYXRlcmlhbC4gXHJcbiAgICAgKiBJbXBsZW1lbnRhdGlvbiBiYXNlZCBvbiBodHRwczovL3d3dy5jbGlja3RvcmVsZWFzZS5jb20vYmxvZy9jcmVhdGluZy1zcGhlcmljYWwtZW52aXJvbm1lbnQtbWFwcGluZy1zaGFkZXIvXHJcbiAgICAgKiBAYXV0aG9ycyBTaW1vbiBTdG9ybC1TY2h1bGtlLCBIRlUsIDIwMTkgfCBKaXJrYSBEZWxsJ09yby1GcmllZGwsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgU2hhZGVyTWF0Q2FwIGV4dGVuZHMgU2hhZGVyIHtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIGdldENvYXQoKTogdHlwZW9mIENvYXQge1xyXG4gICAgICAgICAgICByZXR1cm4gQ29hdE1hdENhcDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0VmVydGV4U2hhZGVyU291cmNlKCk6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIHJldHVybiBgI3ZlcnNpb24gMzAwIGVzXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGluIHZlYzMgYV9wb3NpdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICBpbiB2ZWMzIGFfbm9ybWFsO1xyXG4gICAgICAgICAgICAgICAgICAgIHVuaWZvcm0gbWF0NCB1X3Byb2plY3Rpb247XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG91dCB2ZWMyIHRleF9jb29yZHNfc21vb3RoO1xyXG4gICAgICAgICAgICAgICAgICAgIGZsYXQgb3V0IHZlYzIgdGV4X2Nvb3Jkc19mbGF0O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2b2lkIG1haW4oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdDQgbm9ybWFsTWF0cml4ID0gdHJhbnNwb3NlKGludmVyc2UodV9wcm9qZWN0aW9uKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlYzQgcCA9IHZlYzQoYV9wb3NpdGlvbiwgMS4wKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmVjNCBub3JtYWw0ID0gdmVjNChhX25vcm1hbCwgMS4wKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmVjMyBlID0gbm9ybWFsaXplKCB2ZWMzKCB1X3Byb2plY3Rpb24gKiBwICkgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmVjMyBuID0gbm9ybWFsaXplKCB2ZWMzKG5vcm1hbE1hdHJpeCAqIG5vcm1hbDQpICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2ZWMzIHIgPSByZWZsZWN0KCBlLCBuICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsb2F0IG0gPSAyLiAqIHNxcnQoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3coIHIueCwgMi4gKSArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3coIHIueSwgMi4gKSArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3coIHIueiArIDEuLCAyLiApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXhfY29vcmRzX3Ntb290aCA9IHIueHkgLyBtICsgLjU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleF9jb29yZHNfZmxhdCA9IHIueHkgLyBtICsgLjU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBnbF9Qb3NpdGlvbiA9IHVfcHJvamVjdGlvbiAqIHZlYzQoYV9wb3NpdGlvbiwgMS4wKTtcclxuICAgICAgICAgICAgICAgICAgICB9YDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXRGcmFnbWVudFNoYWRlclNvdXJjZSgpOiBzdHJpbmcge1xyXG4gICAgICAgICAgICByZXR1cm4gYCN2ZXJzaW9uIDMwMCBlc1xyXG4gICAgICAgICAgICAgICAgICAgIHByZWNpc2lvbiBtZWRpdW1wIGZsb2F0O1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIHVuaWZvcm0gdmVjNCB1X3RpbnRfY29sb3I7XHJcbiAgICAgICAgICAgICAgICAgICAgdW5pZm9ybSBmbG9hdCB1X2ZsYXRtaXg7XHJcbiAgICAgICAgICAgICAgICAgICAgdW5pZm9ybSBzYW1wbGVyMkQgdV90ZXh0dXJlO1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIGluIHZlYzIgdGV4X2Nvb3Jkc19zbW9vdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgZmxhdCBpbiB2ZWMyIHRleF9jb29yZHNfZmxhdDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgb3V0IHZlYzQgZnJhZztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdm9pZCBtYWluKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2ZWMyIHRjID0gbWl4KHRleF9jb29yZHNfc21vb3RoLCB0ZXhfY29vcmRzX2ZsYXQsIHVfZmxhdG1peCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyYWcgPSB1X3RpbnRfY29sb3IgKiB0ZXh0dXJlKHVfdGV4dHVyZSwgdGMpICogMi4wO1xyXG4gICAgICAgICAgICAgICAgICAgIH1gO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZW5kZXJzIGZvciBSYXljYXN0aW5nXHJcbiAgICAgKiBAYXV0aG9ycyBKaXJrYSBEZWxsJ09yby1GcmllZGwsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgU2hhZGVyUmF5Q2FzdCBleHRlbmRzIFNoYWRlciB7XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXRWZXJ0ZXhTaGFkZXJTb3VyY2UoKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgcmV0dXJuIGAjdmVyc2lvbiAzMDAgZXNcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaW4gdmVjMyBhX3Bvc2l0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgIHVuaWZvcm0gbWF0NCB1X3Byb2plY3Rpb247XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgdm9pZCBtYWluKCkgeyAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBnbF9Qb3NpdGlvbiA9IHVfcHJvamVjdGlvbiAqIHZlYzQoYV9wb3NpdGlvbiwgMS4wKTtcclxuICAgICAgICAgICAgICAgICAgICB9YDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXRGcmFnbWVudFNoYWRlclNvdXJjZSgpOiBzdHJpbmcge1xyXG4gICAgICAgICAgICByZXR1cm4gYCN2ZXJzaW9uIDMwMCBlc1xyXG4gICAgICAgICAgICAgICAgICAgIHByZWNpc2lvbiBtZWRpdW1wIGZsb2F0O1xyXG4gICAgICAgICAgICAgICAgICAgIHByZWNpc2lvbiBoaWdocCBpbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgdW5pZm9ybSBpbnQgdV9pZDtcclxuICAgICAgICAgICAgICAgICAgICBvdXQgdmVjNCBmcmFnO1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIHZvaWQgbWFpbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICBmbG9hdCBpZCA9IGZsb2F0KHVfaWQpLyAyNTYuMDtcclxuICAgICAgICAgICAgICAgICAgICAgICBmbG9hdCB1cHBlcmJ5dGUgPSB0cnVuYyhnbF9GcmFnQ29vcmQueiAqIDI1Ni4wKSAvIDI1Ni4wO1xyXG4gICAgICAgICAgICAgICAgICAgICAgIGZsb2F0IGxvd2VyYnl0ZSA9IGZyYWN0KGdsX0ZyYWdDb29yZC56ICogMjU2LjApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgIGZyYWcgPSB2ZWM0KGlkLCBpZCwgdXBwZXJieXRlICwgbG93ZXJieXRlKTtcclxuICAgICAgICAgICAgICAgICAgICB9YDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogVGV4dHVyZWQgc2hhZGluZ1xyXG4gICAgICogQGF1dGhvcnMgSmFzY2hhIEthcmFnw7ZsLCBIRlUsIDIwMTkgfCBKaXJrYSBEZWxsJ09yby1GcmllZGwsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgU2hhZGVyVGV4dHVyZSBleHRlbmRzIFNoYWRlciB7XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXRDb2F0KCk6IHR5cGVvZiBDb2F0IHtcclxuICAgICAgICAgICAgcmV0dXJuIENvYXRUZXh0dXJlZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0VmVydGV4U2hhZGVyU291cmNlKCk6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIHJldHVybiBgI3ZlcnNpb24gMzAwIGVzXHJcblxyXG4gICAgICAgICAgICAgICAgaW4gdmVjMyBhX3Bvc2l0aW9uO1xyXG4gICAgICAgICAgICAgICAgaW4gdmVjMiBhX3RleHR1cmVVVnM7XHJcbiAgICAgICAgICAgICAgICB1bmlmb3JtIG1hdDQgdV9wcm9qZWN0aW9uO1xyXG4gICAgICAgICAgICAgICAgdW5pZm9ybSB2ZWM0IHVfY29sb3I7XHJcbiAgICAgICAgICAgICAgICBvdXQgdmVjMiB2X3RleHR1cmVVVnM7XHJcblxyXG4gICAgICAgICAgICAgICAgdm9pZCBtYWluKCkgeyAgXHJcbiAgICAgICAgICAgICAgICAgICAgZ2xfUG9zaXRpb24gPSB1X3Byb2plY3Rpb24gKiB2ZWM0KGFfcG9zaXRpb24sIDEuMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdl90ZXh0dXJlVVZzID0gYV90ZXh0dXJlVVZzO1xyXG4gICAgICAgICAgICAgICAgfWA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0RnJhZ21lbnRTaGFkZXJTb3VyY2UoKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgcmV0dXJuIGAjdmVyc2lvbiAzMDAgZXNcclxuICAgICAgICAgICAgICAgIHByZWNpc2lvbiBtZWRpdW1wIGZsb2F0O1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBpbiB2ZWMyIHZfdGV4dHVyZVVWcztcclxuICAgICAgICAgICAgICAgIHVuaWZvcm0gc2FtcGxlcjJEIHVfdGV4dHVyZTtcclxuICAgICAgICAgICAgICAgIG91dCB2ZWM0IGZyYWc7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHZvaWQgbWFpbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBmcmFnID0gdGV4dHVyZSh1X3RleHR1cmUsIHZfdGV4dHVyZVVWcyk7XHJcbiAgICAgICAgICAgIH1gO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgLyoqXHJcbiAgICAgKiBTaW5nbGUgY29sb3Igc2hhZGluZ1xyXG4gICAgICogQGF1dGhvcnMgSmFzY2hhIEthcmFnw7ZsLCBIRlUsIDIwMTkgfCBKaXJrYSBEZWxsJ09yby1GcmllZGwsIEhGVSwgMjAxOVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgU2hhZGVyVW5pQ29sb3IgZXh0ZW5kcyBTaGFkZXIge1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0Q29hdCgpOiB0eXBlb2YgQ29hdCB7XHJcbiAgICAgICAgICAgIHJldHVybiBDb2F0Q29sb3JlZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0VmVydGV4U2hhZGVyU291cmNlKCk6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIHJldHVybiBgI3ZlcnNpb24gMzAwIGVzXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGluIHZlYzMgYV9wb3NpdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICB1bmlmb3JtIG1hdDQgdV9wcm9qZWN0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIHZvaWQgbWFpbigpIHsgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ2xfUG9zaXRpb24gPSB1X3Byb2plY3Rpb24gKiB2ZWM0KGFfcG9zaXRpb24sIDEuMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfWA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0RnJhZ21lbnRTaGFkZXJTb3VyY2UoKTogc3RyaW5nIHtcclxuICAgICAgICAgICAgcmV0dXJuIGAjdmVyc2lvbiAzMDAgZXNcclxuICAgICAgICAgICAgICAgICAgICBwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDtcclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICB1bmlmb3JtIHZlYzQgdV9jb2xvcjtcclxuICAgICAgICAgICAgICAgICAgICBvdXQgdmVjNCBmcmFnO1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIHZvaWQgbWFpbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICBmcmFnID0gdV9jb2xvcjtcclxuICAgICAgICAgICAgICAgICAgICB9YDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIC8qKlxyXG4gICAgICogQmFzZWNsYXNzIGZvciBkaWZmZXJlbnQga2luZHMgb2YgdGV4dHVyZXMuIFxyXG4gICAgICogQGF1dGhvcnMgSmlya2EgRGVsbCdPcm8tRnJpZWRsLCBIRlUsIDIwMTlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGFic3RyYWN0IGNsYXNzIFRleHR1cmUgZXh0ZW5kcyBNdXRhYmxlIHtcclxuICAgICAgICBwcm90ZWN0ZWQgcmVkdWNlTXV0YXRvcigpOiB2b2lkIHsvKiovIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRleHR1cmUgY3JlYXRlZCBmcm9tIGFuIGV4aXN0aW5nIGltYWdlXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBUZXh0dXJlSW1hZ2UgZXh0ZW5kcyBUZXh0dXJlIHtcclxuICAgICAgICBwdWJsaWMgaW1hZ2U6IEhUTUxJbWFnZUVsZW1lbnQgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBUZXh0dXJlIGNyZWF0ZWQgZnJvbSBhIGNhbnZhc1xyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgVGV4dHVyZUNhbnZhcyBleHRlbmRzIFRleHR1cmUge1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBUZXh0dXJlIGNyZWF0ZWQgZnJvbSBhIEZVREdFLVNrZXRjaFxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgVGV4dHVyZVNrZXRjaCBleHRlbmRzIFRleHR1cmVDYW52YXMge1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBUZXh0dXJlIGNyZWF0ZWQgZnJvbSBhbiBIVE1MLXBhZ2VcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIFRleHR1cmVIVE1MIGV4dGVuZHMgVGV4dHVyZUNhbnZhcyB7XHJcbiAgICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIGVudW0gVElNRVJfVFlQRSB7XHJcbiAgICAgICAgSU5URVJWQUwsXHJcbiAgICAgICAgVElNRU9VVFxyXG4gICAgfVxyXG5cclxuICAgIGludGVyZmFjZSBUaW1lcnMge1xyXG4gICAgICAgIFtpZDogbnVtYmVyXTogVGltZXI7XHJcbiAgICB9XHJcblxyXG4gICAgY2xhc3MgVGltZXIge1xyXG4gICAgICAgIGFjdGl2ZTogYm9vbGVhbjtcclxuICAgICAgICB0eXBlOiBUSU1FUl9UWVBFO1xyXG4gICAgICAgIGNhbGxiYWNrOiBGdW5jdGlvbjtcclxuICAgICAgICB0aW1lb3V0OiBudW1iZXI7XHJcbiAgICAgICAgYXJndW1lbnRzOiBPYmplY3RbXTtcclxuICAgICAgICBzdGFydFRpbWVSZWFsOiBudW1iZXI7XHJcbiAgICAgICAgdGltZW91dFJlYWw6IG51bWJlcjtcclxuICAgICAgICBpZDogbnVtYmVyO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcihfdGltZTogVGltZSwgX3R5cGU6IFRJTUVSX1RZUEUsIF9jYWxsYmFjazogRnVuY3Rpb24sIF90aW1lb3V0OiBudW1iZXIsIF9hcmd1bWVudHM6IE9iamVjdFtdKSB7XHJcbiAgICAgICAgICAgIHRoaXMudHlwZSA9IF90eXBlO1xyXG4gICAgICAgICAgICB0aGlzLnRpbWVvdXQgPSBfdGltZW91dDtcclxuICAgICAgICAgICAgdGhpcy5hcmd1bWVudHMgPSBfYXJndW1lbnRzO1xyXG4gICAgICAgICAgICB0aGlzLnN0YXJ0VGltZVJlYWwgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuICAgICAgICAgICAgdGhpcy5jYWxsYmFjayA9IF9jYWxsYmFjaztcclxuXHJcbiAgICAgICAgICAgIGxldCBzY2FsZTogbnVtYmVyID0gTWF0aC5hYnMoX3RpbWUuZ2V0U2NhbGUoKSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXNjYWxlKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBUaW1lIGlzIHN0b3BwZWQsIHRpbWVyIHdvbid0IGJlIGFjdGl2ZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGlkOiBudW1iZXI7XHJcbiAgICAgICAgICAgIHRoaXMudGltZW91dFJlYWwgPSB0aGlzLnRpbWVvdXQgLyBzY2FsZTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnR5cGUgPT0gVElNRVJfVFlQRS5USU1FT1VUKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY2FsbGJhY2s6IEZ1bmN0aW9uID0gKCk6IHZvaWQgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIF90aW1lLmRlbGV0ZVRpbWVyQnlJbnRlcm5hbElkKHRoaXMuaWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIF9jYWxsYmFjayhfYXJndW1lbnRzKTtcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBpZCA9IHdpbmRvdy5zZXRUaW1lb3V0KGNhbGxiYWNrLCB0aGlzLnRpbWVvdXRSZWFsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICBpZCA9IHdpbmRvdy5zZXRJbnRlcnZhbChfY2FsbGJhY2ssIHRoaXMudGltZW91dFJlYWwsIF9hcmd1bWVudHMpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5pZCA9IGlkO1xyXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgY2xlYXIoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnR5cGUgPT0gVElNRVJfVFlQRS5USU1FT1VUKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5hY3RpdmUpXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gc2F2ZSByZW1haW5pbmcgdGltZSB0byB0aW1lb3V0IGFzIG5ldyB0aW1lb3V0IGZvciByZXN0YXJ0XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50aW1lb3V0ID0gdGhpcy50aW1lb3V0ICogKDEgLSAocGVyZm9ybWFuY2Uubm93KCkgLSB0aGlzLnN0YXJ0VGltZVJlYWwpIC8gdGhpcy50aW1lb3V0UmVhbCk7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRoaXMuaWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIC8vIFRPRE86IHJldXNpbmcgdGltZXIgc3RhcnRzIGludGVydmFsIGFuZXcuIFNob3VsZCBiZSByZW1haW5pbmcgaW50ZXJ2YWwgYXMgdGltZW91dCwgdGhlbiBzdGFydGluZyBpbnRlcnZhbCBhbmV3IFxyXG4gICAgICAgICAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5pZCk7XHJcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5zdGFuY2VzIG9mIHRoaXMgY2xhc3MgZ2VuZXJhdGUgYSB0aW1lc3RhbXAgdGhhdCBjb3JyZWxhdGVzIHdpdGggdGhlIHRpbWUgZWxhcHNlZCBzaW5jZSB0aGUgc3RhcnQgb2YgdGhlIHByb2dyYW0gYnV0IGFsbG93cyBmb3IgcmVzZXR0aW5nIGFuZCBzY2FsaW5nLiAgXHJcbiAgICAgKiBTdXBwb3J0cyBpbnRlcnZhbC0gYW5kIHRpbWVvdXQtY2FsbGJhY2tzIGlkZW50aWNhbCB3aXRoIHN0YW5kYXJkIEphdmFzY3JpcHQgYnV0IHdpdGggcmVzcGVjdCB0byB0aGUgc2NhbGVkIHRpbWVcclxuICAgICAqIEBhdXRob3JzIEppcmthIERlbGwnT3JvLUZyaWVkbCwgSEZVLCAyMDE5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBjbGFzcyBUaW1lIGV4dGVuZHMgRXZlbnRUYXJnZXQge1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGdhbWVUaW1lOiBUaW1lID0gbmV3IFRpbWUoKTtcclxuICAgICAgICBwcml2YXRlIHN0YXJ0OiBudW1iZXI7XHJcbiAgICAgICAgcHJpdmF0ZSBzY2FsZTogbnVtYmVyO1xyXG4gICAgICAgIHByaXZhdGUgb2Zmc2V0OiBudW1iZXI7XHJcbiAgICAgICAgcHJpdmF0ZSBsYXN0Q2FsbFRvRWxhcHNlZDogbnVtYmVyO1xyXG4gICAgICAgIHByaXZhdGUgdGltZXJzOiBUaW1lcnMgPSB7fTtcclxuICAgICAgICBwcml2YXRlIGlkVGltZXJOZXh0OiBudW1iZXIgPSAwO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5zdGFydCA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgICAgICAgICB0aGlzLnNjYWxlID0gMS4wO1xyXG4gICAgICAgICAgICB0aGlzLm9mZnNldCA9IDAuMDtcclxuICAgICAgICAgICAgdGhpcy5sYXN0Q2FsbFRvRWxhcHNlZCA9IDAuMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJldHVybnMgdGhlIGdhbWUtdGltZS1vYmplY3Qgd2hpY2ggc3RhcnRzIGF1dG9tYXRpY2FsbHkgYW5kIHNlcnZlcyBhcyBiYXNlIGZvciB2YXJpb3VzIGludGVybmFsIG9wZXJhdGlvbnMuIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgZ2V0IGdhbWUoKTogVGltZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBUaW1lLmdhbWVUaW1lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUmV0cmlldmVzIHRoZSBjdXJyZW50IHNjYWxlZCB0aW1lc3RhbXAgb2YgdGhpcyBpbnN0YW5jZSBpbiBtaWxsaXNlY29uZHNcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0KCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9mZnNldCArIHRoaXMuc2NhbGUgKiAocGVyZm9ybWFuY2Uubm93KCkgLSB0aGlzLnN0YXJ0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIChSZS0pIFNldHMgdGhlIHRpbWVzdGFtcCBvZiB0aGlzIGluc3RhbmNlXHJcbiAgICAgICAgICogQHBhcmFtIF90aW1lIFRoZSB0aW1lc3RhbXAgdG8gcmVwcmVzZW50IHRoZSBjdXJyZW50IHRpbWUgKGRlZmF1bHQgMC4wKVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzZXQoX3RpbWU6IG51bWJlciA9IDApOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5vZmZzZXQgPSBfdGltZTtcclxuICAgICAgICAgICAgdGhpcy5zdGFydCA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgICAgICAgICB0aGlzLmdldEVsYXBzZWRTaW5jZVByZXZpb3VzQ2FsbCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2V0cyB0aGUgc2NhbGluZyBvZiB0aGlzIHRpbWUsIGFsbG93aW5nIGZvciBzbG93bW90aW9uICg8MSkgb3IgZmFzdGZvcndhcmQgKD4xKSBcclxuICAgICAgICAgKiBAcGFyYW0gX3NjYWxlIFRoZSBkZXNpcmVkIHNjYWxpbmcgKGRlZmF1bHQgMS4wKVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBzZXRTY2FsZShfc2NhbGU6IG51bWJlciA9IDEuMCk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLnNldCh0aGlzLmdldCgpKTtcclxuICAgICAgICAgICAgdGhpcy5zY2FsZSA9IF9zY2FsZTtcclxuICAgICAgICAgICAgLy9UT0RPOiBjYXRjaCBzY2FsZT0wXHJcbiAgICAgICAgICAgIHRoaXMucmVzY2FsZUFsbFRpbWVycygpO1xyXG4gICAgICAgICAgICB0aGlzLmdldEVsYXBzZWRTaW5jZVByZXZpb3VzQ2FsbCgpO1xyXG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KEVWRU5ULlRJTUVfU0NBTEVEKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXRyaWV2ZXMgdGhlIGN1cnJlbnQgc2NhbGluZyBvZiB0aGlzIHRpbWVcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0U2NhbGUoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2NhbGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXRyaWV2ZXMgdGhlIG9mZnNldCBvZiB0aGlzIHRpbWVcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZ2V0T2Zmc2V0KCk6IG51bWJlciB7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy5vZmZzZXQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBSZXRyaWV2ZXMgdGhlIHNjYWxlZCB0aW1lIGluIG1pbGxpc2Vjb25kcyBwYXNzZWQgc2luY2UgdGhlIGxhc3QgY2FsbCB0byB0aGlzIG1ldGhvZFxyXG4gICAgICAgICAqIEF1dG9tYXRpY2FsbHkgcmVzZXQgYXQgZXZlcnkgY2FsbCB0byBzZXQoLi4uKSBhbmQgc2V0U2NhbGUoLi4uKVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBnZXRFbGFwc2VkU2luY2VQcmV2aW91c0NhbGwoKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgbGV0IGN1cnJlbnQ6IG51bWJlciA9IHRoaXMuZ2V0KCk7XHJcbiAgICAgICAgICAgIGxldCBlbGFwc2VkOiBudW1iZXIgPSBjdXJyZW50IC0gdGhpcy5sYXN0Q2FsbFRvRWxhcHNlZDtcclxuICAgICAgICAgICAgdGhpcy5sYXN0Q2FsbFRvRWxhcHNlZCA9IGN1cnJlbnQ7XHJcbiAgICAgICAgICAgIHJldHVybiBlbGFwc2VkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8jcmVnaW9uIFRpbWVyc1xyXG4gICAgICAgIC8vIFRPRE86IGV4YW1pbmUgaWYgd2ViLXdvcmtlcnMgd291bGQgZW5oYW5jZSBwZXJmb3JtYW5jZSBoZXJlIVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNlZSBKYXZhc2NyaXB0IGRvY3VtZW50YXRpb24uIENyZWF0ZXMgYW4gaW50ZXJuYWwgW1tUaW1lcl1dIG9iamVjdFxyXG4gICAgICAgICAqIEBwYXJhbSBfY2FsbGJhY2tcclxuICAgICAgICAgKiBAcGFyYW0gX3RpbWVvdXQgXHJcbiAgICAgICAgICogQHBhcmFtIF9hcmd1bWVudHMgXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHNldFRpbWVvdXQoX2NhbGxiYWNrOiBGdW5jdGlvbiwgX3RpbWVvdXQ6IG51bWJlciwgLi4uX2FyZ3VtZW50czogT2JqZWN0W10pOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRUaW1lcihUSU1FUl9UWVBFLlRJTUVPVVQsIF9jYWxsYmFjaywgX3RpbWVvdXQsIF9hcmd1bWVudHMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTZWUgSmF2YXNjcmlwdCBkb2N1bWVudGF0aW9uLiBDcmVhdGVzIGFuIGludGVybmFsIFtbVGltZXJdXSBvYmplY3RcclxuICAgICAgICAgKiBAcGFyYW0gX2NhbGxiYWNrIFxyXG4gICAgICAgICAqIEBwYXJhbSBfdGltZW91dCBcclxuICAgICAgICAgKiBAcGFyYW0gX2FyZ3VtZW50cyBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc2V0SW50ZXJ2YWwoX2NhbGxiYWNrOiBGdW5jdGlvbiwgX3RpbWVvdXQ6IG51bWJlciwgLi4uX2FyZ3VtZW50czogT2JqZWN0W10pOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRUaW1lcihUSU1FUl9UWVBFLklOVEVSVkFMLCBfY2FsbGJhY2ssIF90aW1lb3V0LCBfYXJndW1lbnRzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2VlIEphdmFzY3JpcHQgZG9jdW1lbnRhdGlvblxyXG4gICAgICAgICAqIEBwYXJhbSBfaWQgXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIGNsZWFyVGltZW91dChfaWQ6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLmRlbGV0ZVRpbWVyKF9pZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFNlZSBKYXZhc2NyaXB0IGRvY3VtZW50YXRpb25cclxuICAgICAgICAgKiBAcGFyYW0gX2lkIFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBjbGVhckludGVydmFsKF9pZDogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVsZXRlVGltZXIoX2lkKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFN0b3BzIGFuZCBkZWxldGVzIGFsbCBbW1RpbWVyXV1zIGF0dGFjaGVkLiBTaG91bGQgYmUgY2FsbGVkIGJlZm9yZSB0aGlzIFRpbWUtb2JqZWN0IGxlYXZlcyBzY29wZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHB1YmxpYyBjbGVhckFsbFRpbWVycygpOiB2b2lkIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaWQgaW4gdGhpcy50aW1lcnMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVsZXRlVGltZXIoTnVtYmVyKGlkKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFJlY3JlYXRlcyBbW1RpbWVyXV1zIHdoZW4gc2NhbGluZyBjaGFuZ2VzXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHJlc2NhbGVBbGxUaW1lcnMoKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGlkIGluIHRoaXMudGltZXJzKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdGltZXI6IFRpbWVyID0gdGhpcy50aW1lcnNbaWRdO1xyXG4gICAgICAgICAgICAgICAgdGltZXIuY2xlYXIoKTtcclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5zY2FsZSlcclxuICAgICAgICAgICAgICAgICAgICAvLyBUaW1lIGhhcyBzdG9wcGVkLCBubyBuZWVkIHRvIHJlcGxhY2UgY2xlYXJlZCB0aW1lcnNcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgdGltZW91dDogbnVtYmVyID0gdGltZXIudGltZW91dDtcclxuICAgICAgICAgICAgICAgIC8vIGlmICh0aW1lci50eXBlID09IFRJTUVSX1RZUEUuVElNRU9VVCAmJiB0aW1lci5hY3RpdmUpXHJcbiAgICAgICAgICAgICAgICAvLyAgICAgLy8gZm9yIGFuIGFjdGl2ZSB0aW1lb3V0LXRpbWVyLCBjYWxjdWxhdGUgdGhlIHJlbWFpbmluZyB0aW1lIHRvIHRpbWVvdXRcclxuICAgICAgICAgICAgICAgIC8vICAgICB0aW1lb3V0ID0gKHBlcmZvcm1hbmNlLm5vdygpIC0gdGltZXIuc3RhcnRUaW1lUmVhbCkgLyB0aW1lci50aW1lb3V0UmVhbDtcclxuICAgICAgICAgICAgICAgIGxldCByZXBsYWNlOiBUaW1lciA9IG5ldyBUaW1lcih0aGlzLCB0aW1lci50eXBlLCB0aW1lci5jYWxsYmFjaywgdGltZW91dCwgdGltZXIuYXJndW1lbnRzKTtcclxuICAgICAgICAgICAgICAgIHRoaXMudGltZXJzW2lkXSA9IHJlcGxhY2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERlbGV0ZXMgW1tUaW1lcl1dIGZvdW5kIHVzaW5nIHRoZSBpZCBvZiB0aGUgY29ubmVjdGVkIGludGVydmFsL3RpbWVvdXQtb2JqZWN0XHJcbiAgICAgICAgICogQHBhcmFtIF9pZCBcclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgZGVsZXRlVGltZXJCeUludGVybmFsSWQoX2lkOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaWQgaW4gdGhpcy50aW1lcnMpIHtcclxuICAgICAgICAgICAgICAgIGxldCB0aW1lcjogVGltZXIgPSB0aGlzLnRpbWVyc1tpZF07XHJcbiAgICAgICAgICAgICAgICBpZiAodGltZXIuaWQgPT0gX2lkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGltZXIuY2xlYXIoKTtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy50aW1lcnNbaWRdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHNldFRpbWVyKF90eXBlOiBUSU1FUl9UWVBFLCBfY2FsbGJhY2s6IEZ1bmN0aW9uLCBfdGltZW91dDogbnVtYmVyLCBfYXJndW1lbnRzOiBPYmplY3RbXSk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIGxldCB0aW1lcjogVGltZXIgPSBuZXcgVGltZXIodGhpcywgX3R5cGUsIF9jYWxsYmFjaywgX3RpbWVvdXQsIF9hcmd1bWVudHMpO1xyXG4gICAgICAgICAgICB0aGlzLnRpbWVyc1srK3RoaXMuaWRUaW1lck5leHRdID0gdGltZXI7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmlkVGltZXJOZXh0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBkZWxldGVUaW1lcihfaWQ6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLnRpbWVyc1tfaWRdLmNsZWFyKCk7XHJcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnRpbWVyc1tfaWRdO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyNlbmRyZWdpb25cclxuICAgIH1cclxufSIsIi8vLzxyZWZlcmVuY2UgcGF0aD1cIi4uL0V2ZW50L0V2ZW50LnRzXCIvPlxyXG4vLy88cmVmZXJlbmNlIHBhdGg9XCIuLi9UaW1lL1RpbWUudHNcIi8+XHJcbm5hbWVzcGFjZSBGdWRnZUNvcmUge1xyXG4gICAgZXhwb3J0IGVudW0gTE9PUF9NT0RFIHtcclxuICAgICAgICAvKiogTG9vcCBjeWNsZXMgY29udHJvbGxlZCBieSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lICovXHJcbiAgICAgICAgRlJBTUVfUkVRVUVTVCA9IFwiZnJhbWVSZXF1ZXN0XCIsXHJcbiAgICAgICAgLyoqIExvb3AgY3ljbGVzIHdpdGggdGhlIGdpdmVuIGZyYW1lcmF0ZSBpbiBbW1RpbWVdXS5nYW1lICovXHJcbiAgICAgICAgVElNRV9HQU1FID0gXCJ0aW1lR2FtZVwiLFxyXG4gICAgICAgIC8qKiBMb29wIGN5Y2xlcyB3aXRoIHRoZSBnaXZlbiBmcmFtZXJhdGUgaW4gcmVhbHRpbWUsIGluZGVwZW5kZW50IG9mIFtbVGltZV1dLmdhbWUgKi9cclxuICAgICAgICBUSU1FX1JFQUwgPSBcInRpbWVSZWFsXCJcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQ29yZSBsb29wIG9mIGEgRnVkZ2UgYXBwbGljYXRpb24uIEluaXRpYWxpemVzIGF1dG9tYXRpY2FsbHkgYW5kIG11c3QgYmUgc3RhcnRlZCBleHBsaWNpdGx5LlxyXG4gICAgICogSXQgdGhlbiBmaXJlcyBbW0VWRU5UXV0uTE9PUFxcX0ZSQU1FIHRvIGFsbCBhZGRlZCBsaXN0ZW5lcnMgYXQgZWFjaCBmcmFtZVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgY2xhc3MgTG9vcCBleHRlbmRzIEV2ZW50VGFyZ2V0U3RhdGljIHtcclxuICAgICAgICAvKiogVGhlIGdhbWV0aW1lIHRoZSBsb29wIHdhcyBzdGFydGVkLCBvdmVyd3JpdHRlbiBhdCBlYWNoIHN0YXJ0ICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyB0aW1lU3RhcnRHYW1lOiBudW1iZXIgPSAwO1xyXG4gICAgICAgIC8qKiBUaGUgcmVhbHRpbWUgdGhlIGxvb3Agd2FzIHN0YXJ0ZWQsIG92ZXJ3cml0dGVuIGF0IGVhY2ggc3RhcnQgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHRpbWVTdGFydFJlYWw6IG51bWJlciA9IDA7XHJcbiAgICAgICAgLyoqIFRoZSBnYW1ldGltZSBlbGFwc2VkIHNpbmNlIHRoZSBsYXN0IGxvb3AgY3ljbGUgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHRpbWVGcmFtZUdhbWU6IG51bWJlciA9IDA7XHJcbiAgICAgICAgLyoqIFRoZSByZWFsdGltZSBlbGFwc2VkIHNpbmNlIHRoZSBsYXN0IGxvb3AgY3ljbGUgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHRpbWVGcmFtZVJlYWw6IG51bWJlciA9IDA7XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHRpbWVMYXN0RnJhbWVHYW1lOiBudW1iZXIgPSAwO1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHRpbWVMYXN0RnJhbWVSZWFsOiBudW1iZXIgPSAwO1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHRpbWVMYXN0RnJhbWVHYW1lQXZnOiBudW1iZXIgPSAwO1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHRpbWVMYXN0RnJhbWVSZWFsQXZnOiBudW1iZXIgPSAwO1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHJ1bm5pbmc6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBtb2RlOiBMT09QX01PREUgPSBMT09QX01PREUuRlJBTUVfUkVRVUVTVDtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBpZEludGVydmFsbDogbnVtYmVyID0gMDtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBpZFJlcXVlc3Q6IG51bWJlciA9IDA7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgZnBzRGVzaXJlZDogbnVtYmVyID0gMzA7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgZnJhbWVzVG9BdmVyYWdlOiBudW1iZXIgPSAzMDtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBzeW5jV2l0aEFuaW1hdGlvbkZyYW1lOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFN0YXJ0cyB0aGUgbG9vcCB3aXRoIHRoZSBnaXZlbiBtb2RlIGFuZCBmcHNcclxuICAgICAgICAgKiBAcGFyYW0gX21vZGUgXHJcbiAgICAgICAgICogQHBhcmFtIF9mcHMgSXMgb25seSBhcHBsaWNhYmxlIGluIFRJTUUtbW9kZXNcclxuICAgICAgICAgKiBAcGFyYW0gX3N5bmNXaXRoQW5pbWF0aW9uRnJhbWUgRXhwZXJpbWVudGFsIGFuZCBvbmx5IGFwcGxpY2FibGUgaW4gVElNRS1tb2Rlcy4gU2hvdWxkIGRlZmVyIHRoZSBsb29wLWN5Y2xlIHVudGlsIHRoZSBuZXh0IHBvc3NpYmxlIGFuaW1hdGlvbiBmcmFtZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHN0YXJ0KF9tb2RlOiBMT09QX01PREUgPSBMT09QX01PREUuRlJBTUVfUkVRVUVTVCwgX2ZwczogbnVtYmVyID0gNjAsIF9zeW5jV2l0aEFuaW1hdGlvbkZyYW1lOiBib29sZWFuID0gZmFsc2UpOiB2b2lkIHtcclxuICAgICAgICAgICAgTG9vcC5zdG9wKCk7XHJcblxyXG4gICAgICAgICAgICBMb29wLnRpbWVTdGFydEdhbWUgPSBUaW1lLmdhbWUuZ2V0KCk7XHJcbiAgICAgICAgICAgIExvb3AudGltZVN0YXJ0UmVhbCA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgICAgICAgICBMb29wLnRpbWVMYXN0RnJhbWVHYW1lID0gTG9vcC50aW1lU3RhcnRHYW1lO1xyXG4gICAgICAgICAgICBMb29wLnRpbWVMYXN0RnJhbWVSZWFsID0gTG9vcC50aW1lU3RhcnRSZWFsO1xyXG4gICAgICAgICAgICBMb29wLmZwc0Rlc2lyZWQgPSAoX21vZGUgPT0gTE9PUF9NT0RFLkZSQU1FX1JFUVVFU1QpID8gNjAgOiBfZnBzO1xyXG4gICAgICAgICAgICBMb29wLmZyYW1lc1RvQXZlcmFnZSA9IExvb3AuZnBzRGVzaXJlZDtcclxuICAgICAgICAgICAgTG9vcC50aW1lTGFzdEZyYW1lR2FtZUF2ZyA9IExvb3AudGltZUxhc3RGcmFtZVJlYWxBdmcgPSAxMDAwIC8gTG9vcC5mcHNEZXNpcmVkO1xyXG4gICAgICAgICAgICBMb29wLm1vZGUgPSBfbW9kZTtcclxuICAgICAgICAgICAgTG9vcC5zeW5jV2l0aEFuaW1hdGlvbkZyYW1lID0gX3N5bmNXaXRoQW5pbWF0aW9uRnJhbWU7XHJcblxyXG4gICAgICAgICAgICBsZXQgbG9nOiBzdHJpbmcgPSBgTG9vcCBzdGFydGluZyBpbiBtb2RlICR7TG9vcC5tb2RlfWA7XHJcbiAgICAgICAgICAgIGlmIChMb29wLm1vZGUgIT0gTE9PUF9NT0RFLkZSQU1FX1JFUVVFU1QpXHJcbiAgICAgICAgICAgICAgICBsb2cgKz0gYCB3aXRoIGF0dGVtcHRlZCAke19mcHN9IGZwc2A7XHJcbiAgICAgICAgICAgIERlYnVnLmxvZyhsb2cpO1xyXG5cclxuICAgICAgICAgICAgc3dpdGNoIChfbW9kZSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSBMT09QX01PREUuRlJBTUVfUkVRVUVTVDpcclxuICAgICAgICAgICAgICAgICAgICBMb29wLmxvb3BGcmFtZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBMT09QX01PREUuVElNRV9SRUFMOlxyXG4gICAgICAgICAgICAgICAgICAgIExvb3AuaWRJbnRlcnZhbGwgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoTG9vcC5sb29wVGltZSwgMTAwMCAvIExvb3AuZnBzRGVzaXJlZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgTG9vcC5sb29wVGltZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBMT09QX01PREUuVElNRV9HQU1FOlxyXG4gICAgICAgICAgICAgICAgICAgIExvb3AuaWRJbnRlcnZhbGwgPSBUaW1lLmdhbWUuc2V0SW50ZXJ2YWwoTG9vcC5sb29wVGltZSwgMTAwMCAvIExvb3AuZnBzRGVzaXJlZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgTG9vcC5sb29wVGltZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgTG9vcC5ydW5uaW5nID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFN0b3BzIHRoZSBsb29wXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBzdG9wKCk6IHZvaWQge1xyXG4gICAgICAgICAgICBpZiAoIUxvb3AucnVubmluZylcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIHN3aXRjaCAoTG9vcC5tb2RlKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIExPT1BfTU9ERS5GUkFNRV9SRVFVRVNUOlxyXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZShMb29wLmlkUmVxdWVzdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIExPT1BfTU9ERS5USU1FX1JFQUw6XHJcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwoTG9vcC5pZEludGVydmFsbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKExvb3AuaWRSZXF1ZXN0KTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgTE9PUF9NT0RFLlRJTUVfR0FNRTpcclxuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBEQU5HRVIhIGlkIGNoYW5nZXMgaW50ZXJuYWxseSBpbiBnYW1lIHdoZW4gdGltZSBpcyBzY2FsZWQhXHJcbiAgICAgICAgICAgICAgICAgICAgVGltZS5nYW1lLmNsZWFySW50ZXJ2YWwoTG9vcC5pZEludGVydmFsbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKExvb3AuaWRSZXF1ZXN0KTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIERlYnVnLmxvZyhcIkxvb3Agc3RvcHBlZCFcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIGdldEZwc0dhbWVBdmVyYWdlKCk6IG51bWJlciB7XHJcbiAgICAgICAgICAgIHJldHVybiAxMDAwIC8gTG9vcC50aW1lTGFzdEZyYW1lR2FtZUF2ZztcclxuICAgICAgICB9XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBnZXRGcHNSZWFsQXZlcmFnZSgpOiBudW1iZXIge1xyXG4gICAgICAgICAgICByZXR1cm4gMTAwMCAvIExvb3AudGltZUxhc3RGcmFtZVJlYWxBdmc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBsb29wKCk6IHZvaWQge1xyXG4gICAgICAgICAgICBsZXQgdGltZTogbnVtYmVyO1xyXG4gICAgICAgICAgICB0aW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICAgICAgICAgIExvb3AudGltZUZyYW1lUmVhbCA9IHRpbWUgLSBMb29wLnRpbWVMYXN0RnJhbWVSZWFsO1xyXG4gICAgICAgICAgICBMb29wLnRpbWVMYXN0RnJhbWVSZWFsID0gdGltZTtcclxuXHJcbiAgICAgICAgICAgIHRpbWUgPSBUaW1lLmdhbWUuZ2V0KCk7XHJcbiAgICAgICAgICAgIExvb3AudGltZUZyYW1lR2FtZSA9IHRpbWUgLSBMb29wLnRpbWVMYXN0RnJhbWVHYW1lO1xyXG4gICAgICAgICAgICBMb29wLnRpbWVMYXN0RnJhbWVHYW1lID0gdGltZTtcclxuXHJcbiAgICAgICAgICAgIExvb3AudGltZUxhc3RGcmFtZUdhbWVBdmcgPSAoKExvb3AuZnJhbWVzVG9BdmVyYWdlIC0gMSkgKiBMb29wLnRpbWVMYXN0RnJhbWVHYW1lQXZnICsgTG9vcC50aW1lRnJhbWVHYW1lKSAvIExvb3AuZnJhbWVzVG9BdmVyYWdlO1xyXG4gICAgICAgICAgICBMb29wLnRpbWVMYXN0RnJhbWVSZWFsQXZnID0gKChMb29wLmZyYW1lc1RvQXZlcmFnZSAtIDEpICogTG9vcC50aW1lTGFzdEZyYW1lUmVhbEF2ZyArIExvb3AudGltZUZyYW1lUmVhbCkgLyBMb29wLmZyYW1lc1RvQXZlcmFnZTtcclxuXHJcbiAgICAgICAgICAgIGxldCBldmVudDogRXZlbnQgPSBuZXcgRXZlbnQoRVZFTlQuTE9PUF9GUkFNRSk7XHJcbiAgICAgICAgICAgIExvb3AudGFyZ2V0U3RhdGljLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgbG9vcEZyYW1lKCk6IHZvaWQge1xyXG4gICAgICAgICAgICBMb29wLmxvb3AoKTtcclxuICAgICAgICAgICAgTG9vcC5pZFJlcXVlc3QgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKExvb3AubG9vcEZyYW1lKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGxvb3BUaW1lKCk6IHZvaWQge1xyXG4gICAgICAgICAgICBpZiAoTG9vcC5zeW5jV2l0aEFuaW1hdGlvbkZyYW1lKVxyXG4gICAgICAgICAgICAgICAgTG9vcC5pZFJlcXVlc3QgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKExvb3AubG9vcCk7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIExvb3AubG9vcCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VDb3JlIHtcclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgTWFwRmlsZW5hbWVUb0NvbnRlbnQge1xyXG4gICAgICAgIFtmaWxlbmFtZTogc3RyaW5nXTogc3RyaW5nO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGVzIGZpbGUgdHJhbnNmZXIgZnJvbSBhIEZ1ZGdlLUJyb3dzZXJhcHAgdG8gdGhlIGxvY2FsIGZpbGVzeXN0ZW0gd2l0aG91dCBhIGxvY2FsIHNlcnZlci4gIFxyXG4gICAgICogU2F2ZXMgdG8gdGhlIGRvd25sb2FkLXBhdGggZ2l2ZW4gYnkgdGhlIGJyb3dzZXIsIGxvYWRzIGZyb20gdGhlIHBsYXllcidzIGNob2ljZS5cclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGNsYXNzIEZpbGVJb0Jyb3dzZXJMb2NhbCBleHRlbmRzIEV2ZW50VGFyZ2V0U3RhdGljIHtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBzZWxlY3RvcjogSFRNTElucHV0RWxlbWVudDtcclxuICAgICAgICAvLyBUT0RPOiByZWZhY3RvciB0byBhc3luYyBmdW5jdGlvbiB0byBiZSBoYW5kbGVkIHVzaW5nIHByb21pc2UsIGluc3RlYWQgb2YgdXNpbmcgZXZlbnQgdGFyZ2V0XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBsb2FkKCk6IHZvaWQge1xyXG4gICAgICAgICAgICBGaWxlSW9Ccm93c2VyTG9jYWwuc2VsZWN0b3IgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XHJcbiAgICAgICAgICAgIEZpbGVJb0Jyb3dzZXJMb2NhbC5zZWxlY3Rvci50eXBlID0gXCJmaWxlXCI7XHJcbiAgICAgICAgICAgIEZpbGVJb0Jyb3dzZXJMb2NhbC5zZWxlY3Rvci5tdWx0aXBsZSA9IHRydWU7XHJcbiAgICAgICAgICAgIEZpbGVJb0Jyb3dzZXJMb2NhbC5zZWxlY3Rvci5oaWRkZW4gPSB0cnVlO1xyXG4gICAgICAgICAgICBGaWxlSW9Ccm93c2VyTG9jYWwuc2VsZWN0b3IuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCBGaWxlSW9Ccm93c2VyTG9jYWwuaGFuZGxlRmlsZVNlbGVjdCk7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoRmlsZUlvQnJvd3NlckxvY2FsLnNlbGVjdG9yKTtcclxuICAgICAgICAgICAgRmlsZUlvQnJvd3NlckxvY2FsLnNlbGVjdG9yLmNsaWNrKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBUT0RPOiByZWZhY3RvciB0byBhc3luYyBmdW5jdGlvbiB0byBiZSBoYW5kbGVkIHVzaW5nIHByb21pc2UsIGluc3RlYWQgb2YgdXNpbmcgZXZlbnQgdGFyZ2V0XHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBzYXZlKF90b1NhdmU6IE1hcEZpbGVuYW1lVG9Db250ZW50KTogdm9pZCB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGZpbGVuYW1lIGluIF90b1NhdmUpIHtcclxuICAgICAgICAgICAgICAgIGxldCBjb250ZW50OiBzdHJpbmcgPSBfdG9TYXZlW2ZpbGVuYW1lXTtcclxuICAgICAgICAgICAgICAgIGxldCBibG9iOiBCbG9iID0gbmV3IEJsb2IoW2NvbnRlbnRdLCB7IHR5cGU6IFwidGV4dC9wbGFpblwiIH0pO1xyXG4gICAgICAgICAgICAgICAgbGV0IHVybDogc3RyaW5nID0gd2luZG93LlVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XHJcbiAgICAgICAgICAgICAgICAvLyovIHVzaW5nIGFuY2hvciBlbGVtZW50IGZvciBkb3dubG9hZFxyXG4gICAgICAgICAgICAgICAgbGV0IGRvd25sb2FkZXI6IEhUTUxBbmNob3JFbGVtZW50O1xyXG4gICAgICAgICAgICAgICAgZG93bmxvYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xyXG4gICAgICAgICAgICAgICAgZG93bmxvYWRlci5zZXRBdHRyaWJ1dGUoXCJocmVmXCIsIHVybCk7XHJcbiAgICAgICAgICAgICAgICBkb3dubG9hZGVyLnNldEF0dHJpYnV0ZShcImRvd25sb2FkXCIsIGZpbGVuYW1lKTtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZG93bmxvYWRlcik7XHJcbiAgICAgICAgICAgICAgICBkb3dubG9hZGVyLmNsaWNrKCk7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGRvd25sb2FkZXIpO1xyXG4gICAgICAgICAgICAgICAgd2luZG93LlVSTC5yZXZva2VPYmplY3RVUkwodXJsKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGV2ZW50OiBDdXN0b21FdmVudCA9IG5ldyBDdXN0b21FdmVudChFVkVOVC5GSUxFX1NBVkVELCB7IGRldGFpbDogeyBtYXBGaWxlbmFtZVRvQ29udGVudDogX3RvU2F2ZSB9IH0pO1xyXG4gICAgICAgICAgICBGaWxlSW9Ccm93c2VyTG9jYWwudGFyZ2V0U3RhdGljLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBhc3luYyBoYW5kbGVGaWxlU2VsZWN0KF9ldmVudDogRXZlbnQpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCItLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBoYW5kbGVGaWxlU2VsZWN0XCIpO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKEZpbGVJb0Jyb3dzZXJMb2NhbC5zZWxlY3Rvcik7XHJcbiAgICAgICAgICAgIGxldCBmaWxlTGlzdDogRmlsZUxpc3QgPSAoPEhUTUxJbnB1dEVsZW1lbnQ+X2V2ZW50LnRhcmdldCkuZmlsZXM7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGZpbGVMaXN0LCBmaWxlTGlzdC5sZW5ndGgpO1xyXG4gICAgICAgICAgICBpZiAoZmlsZUxpc3QubGVuZ3RoID09IDApXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgICAgICBsZXQgbG9hZGVkOiBNYXBGaWxlbmFtZVRvQ29udGVudCA9IHt9O1xyXG4gICAgICAgICAgICBhd2FpdCBGaWxlSW9Ccm93c2VyTG9jYWwubG9hZEZpbGVzKGZpbGVMaXN0LCBsb2FkZWQpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGV2ZW50OiBDdXN0b21FdmVudCA9IG5ldyBDdXN0b21FdmVudChFVkVOVC5GSUxFX0xPQURFRCwgeyBkZXRhaWw6IHsgbWFwRmlsZW5hbWVUb0NvbnRlbnQ6IGxvYWRlZCB9IH0pO1xyXG4gICAgICAgICAgICBGaWxlSW9Ccm93c2VyTG9jYWwudGFyZ2V0U3RhdGljLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyBhc3luYyBsb2FkRmlsZXMoX2ZpbGVMaXN0OiBGaWxlTGlzdCwgX2xvYWRlZDogTWFwRmlsZW5hbWVUb0NvbnRlbnQpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICAgICAgZm9yIChsZXQgZmlsZSBvZiBfZmlsZUxpc3QpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQ6IHN0cmluZyA9IGF3YWl0IG5ldyBSZXNwb25zZShmaWxlKS50ZXh0KCk7XHJcbiAgICAgICAgICAgICAgICBfbG9hZGVkW2ZpbGUubmFtZV0gPSBjb250ZW50O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59Il19